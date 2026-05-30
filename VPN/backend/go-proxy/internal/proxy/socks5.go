package proxy

import (
	"encoding/binary"
	"io"
	"log"
	"net"
	"strconv"
	"sync"
	"time"

	"github.com/securevpn/go-proxy/internal/auth"
	"github.com/securevpn/go-proxy/internal/config"
)

const (
	socksVer5       = 5
	authNone        = 0
	authPassword    = 2
	cmdConnect      = 1
	atypIPv4        = 1
	atypDomain      = 3
	atypIPv6        = 4
	repSuccess      = 0
	repGenFailure   = 1
	repConnRefused  = 5
	repCmdNotSupported = 7
)

type SOCKS5Proxy struct {
	cfg         *config.Config
	authService *auth.Service
}

func NewSOCKS5Proxy(cfg *config.Config, authService *auth.Service) *SOCKS5Proxy {
	return &SOCKS5Proxy{
		cfg:         cfg,
		authService: authService,
	}
}

func (p *SOCKS5Proxy) Start(addr string) error {
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return err
	}
	defer listener.Close()

	var wg sync.WaitGroup
	sem := make(chan struct{}, p.cfg.Proxy.MaxConnections)

	for {
		conn, err := listener.Accept()
		if err != nil {
			log.Printf("SOCKS5 accept error: %v", err)
			continue
		}

		sem <- struct{}{}
		wg.Add(1)
		go func(c net.Conn) {
			defer func() { <-sem }()
			defer wg.Done()
			p.handleConnection(c)
		}(conn)
	}
}

func (p *SOCKS5Proxy) handleConnection(conn net.Conn) {
	defer conn.Close()
	conn.SetDeadline(time.Now().Add(30 * time.Second))

	buf := make([]byte, 256)

	if _, err := io.ReadFull(conn, buf[:2]); err != nil {
		return
	}

	ver := buf[0]
	nMethods := buf[1]

	if ver != socksVer5 {
		return
	}

	if _, err := io.ReadFull(conn, buf[:nMethods]); err != nil {
		return
	}

	var authMethod byte = authNone
	for i := byte(0); i < nMethods; i++ {
		if buf[i] == authPassword && p.cfg.Auth.Mode != "none" {
			authMethod = authPassword
			break
		}
		if buf[i] == authNone && p.cfg.Auth.Mode == "none" {
			authMethod = authNone
			break
		}
	}

	conn.Write([]byte{socksVer5, authMethod})

	if authMethod == authPassword {
		if !p.doPasswordAuth(conn) {
			return
		}
	}

	conn.SetDeadline(time.Now().Add(time.Duration(p.cfg.Proxy.TimeoutSeconds) * time.Second))

	if _, err := io.ReadFull(conn, buf[:4]); err != nil {
		return
	}

	if buf[0] != socksVer5 {
		return
	}

	cmd := buf[1]
	if cmd != cmdConnect {
		conn.Write([]byte{socksVer5, repCmdNotSupported, 0, 1, 0, 0, 0, 0, 0, 0})
		return
	}

	atyp := buf[3]
	var host string

	switch atyp {
	case atypIPv4:
		if _, err := io.ReadFull(conn, buf[:4]); err != nil {
			return
		}
		host = net.IP(buf[:4]).String()
	case atypDomain:
		if _, err := io.ReadFull(conn, buf[:1]); err != nil {
			return
		}
		domainLen := buf[0]
		if _, err := io.ReadFull(conn, buf[:domainLen]); err != nil {
			return
		}
		host = string(buf[:domainLen])
	case atypIPv6:
		if _, err := io.ReadFull(conn, buf[:16]); err != nil {
			return
		}
		host = net.IP(buf[:16]).String()
	default:
		return
	}

	if _, err := io.ReadFull(conn, buf[:2]); err != nil {
		return
	}
	port := binary.BigEndian.Uint16(buf[:2])
	addr := net.JoinHostPort(host, strconv.Itoa(int(port)))

	target, err := net.DialTimeout("tcp", addr, time.Duration(p.cfg.Proxy.TimeoutSeconds)*time.Second)
	if err != nil {
		conn.Write([]byte{socksVer5, repConnRefused, 0, 1, 0, 0, 0, 0, 0, 0})
		return
	}
	defer target.Close()

	localAddr := target.LocalAddr().(*net.TCPAddr)
	response := []byte{socksVer5, repSuccess, 0, atypIPv4}
	response = append(response, localAddr.IP.To4()...)
	response = append(response, byte(localAddr.Port>>8), byte(localAddr.Port))
	conn.Write(response)

	var wg sync.WaitGroup
	wg.Add(2)
	go func() { io.Copy(target, conn); wg.Done() }()
	go func() { io.Copy(conn, target); wg.Done() }()
	wg.Wait()
}

func (p *SOCKS5Proxy) doPasswordAuth(conn net.Conn) bool {
	buf := make([]byte, 512)

	if _, err := io.ReadFull(conn, buf[:2]); err != nil {
		return false
	}

	ver := buf[0]
	if ver != 1 {
		conn.Write([]byte{1, 1})
		return false
	}

	uLen := int(buf[1])
	if _, err := io.ReadFull(conn, buf[:uLen]); err != nil {
		return false
	}
	username := string(buf[:uLen])

	if _, err := io.ReadFull(conn, buf[:1]); err != nil {
		return false
	}
	pLen := int(buf[0])
	if _, err := io.ReadFull(conn, buf[:pLen]); err != nil {
		return false
	}
	password := string(buf[:pLen])

	if username == "" || password == "" {
		conn.Write([]byte{1, 1})
		return false
	}

	session, err := p.authService.Authenticate(password)
	if err != nil || session == nil {
		conn.Write([]byte{1, 1})
		return false
	}

	conn.Write([]byte{1, 0})
	return true
}
