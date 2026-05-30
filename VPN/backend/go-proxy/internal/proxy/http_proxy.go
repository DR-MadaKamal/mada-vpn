package proxy

import (
	"io"
	"log"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/securevpn/go-proxy/internal/auth"
	"github.com/securevpn/go-proxy/internal/config"
)

type HTTPProxy struct {
	cfg         *config.Config
	authService *auth.Service
	connCount   int64
	connMu      sync.Mutex
}

func NewHTTPProxy(cfg *config.Config, authService *auth.Service) *HTTPProxy {
	return &HTTPProxy{
		cfg:         cfg,
		authService: authService,
	}
}

func (p *HTTPProxy) Handler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("Proxy-Authorization")
		if token != "" {
			token = strings.TrimPrefix(token, "Bearer ")
		}

		if p.cfg.Auth.Mode != "none" {
			session, err := p.authService.Authenticate(token)
			if err != nil {
				http.Error(w, "Proxy authentication required", http.StatusProxyAuthRequired)
				return
			}
			if p.authService.IsQuotaExceeded(token) {
				http.Error(w, "Bandwidth quota exceeded", http.StatusForbidden)
				return
			}
			r.Header.Set("X-User-ID", session.UserID)
			r.Header.Set("X-User-Tier", session.Tier)
		}

		if r.Method == http.MethodConnect {
			p.handleConnect(w, r)
		} else {
			p.handleHTTP(w, r)
		}
	})
}

func (p *HTTPProxy) handleConnect(w http.ResponseWriter, r *http.Request) {
	targetConn, err := net.DialTimeout("tcp", r.Host, time.Duration(p.cfg.Proxy.TimeoutSeconds)*time.Second)
	if err != nil {
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	defer targetConn.Close()

	hijacker, ok := w.(http.Hijacker)
	if !ok {
		http.Error(w, "Hijacking not supported", http.StatusInternalServerError)
		return
	}

	clientConn, _, err := hijacker.Hijack()
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}
	defer clientConn.Close()

	clientConn.Write([]byte("HTTP/1.1 200 Connection Established\r\n\r\n"))

	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		io.Copy(targetConn, clientConn)
		targetConn.Close()
	}()

	go func() {
		defer wg.Done()
		io.Copy(clientConn, targetConn)
		clientConn.Close()
	}()

	wg.Wait()
}

func (p *HTTPProxy) handleHTTP(w http.ResponseWriter, r *http.Request) {
	transport := &http.Transport{
		DialContext: (&net.Dialer{
			Timeout:   time.Duration(p.cfg.Proxy.TimeoutSeconds) * time.Second,
			KeepAlive: 30 * time.Second,
		}).DialContext,
		MaxIdleConns:        100,
		IdleConnTimeout:     90 * time.Second,
		DisableCompression:  false,
	}

	resp, err := transport.RoundTrip(r)
	if err != nil {
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	for key, values := range resp.Header {
		for _, value := range values {
			w.Header().Add(key, value)
		}
	}
	w.WriteHeader(resp.StatusCode)
	written, _ := io.Copy(w, resp.Body)

	token := strings.TrimPrefix(r.Header.Get("Proxy-Authorization"), "Bearer ")
	if token != "" {
		p.authService.RecordUsage(token, written)
	}
}

func (p *HTTPProxy) isDomainBlocked(domain string) bool {
	for _, blocked := range p.cfg.Proxy.BlockedDomains {
		if strings.Contains(domain, blocked) {
			return true
		}
	}
	return false
}
