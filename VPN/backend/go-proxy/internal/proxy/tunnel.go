package proxy

import (
	"encoding/binary"
	"fmt"
	"log"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/securevpn/go-proxy/internal/auth"
	"github.com/securevpn/go-proxy/internal/config"
)

type WebSocketTunnel struct {
	cfg         *config.Config
	authService *auth.Service
	conns       map[uint32]net.Conn
	connMu      sync.RWMutex
	nextID      uint32
	mux         *http.ServeMux
	upgrader    websocket.Upgrader
}

func NewWebSocketTunnel(cfg *config.Config, authService *auth.Service) *WebSocketTunnel {
	t := &WebSocketTunnel{
		cfg:         cfg,
		authService: authService,
		conns:       make(map[uint32]net.Conn),
		mux:         http.NewServeMux(),
		upgrader: websocket.Upgrader{
			ReadBufferSize:  65536,
			WriteBufferSize: 65536,
		},
	}
	t.upgrader.CheckOrigin = func(r *http.Request) bool {
		token := r.Header.Get("Authorization")
		if token != "" {
			if _, err := t.authService.Authenticate(strings.TrimPrefix(token, "Bearer ")); err == nil {
				return true
			}
		}
		return false
	}
	t.mux.HandleFunc("/tunnel", t.handleTunnel)
	t.mux.HandleFunc("/tunnel/health", t.handleHealth)
	return t
}

func (t *WebSocketTunnel) Start(addr string) error {
	return http.ListenAndServe(addr, t.mux)
}

func (t *WebSocketTunnel) handleTunnel(w http.ResponseWriter, r *http.Request) {
	token := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
	if t.cfg.Auth.Mode != "none" && token == "" {
		http.Error(w, "Authorization required", http.StatusUnauthorized)
		return
	}
	if t.cfg.Auth.Mode != "none" {
		if _, err := t.authService.Authenticate(token); err != nil {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}
	}

	conn, err := t.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer conn.Close()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}

		if len(msg) < 6 {
			continue
		}

		connID := binary.BigEndian.Uint32(msg[:4])
		payloadLen := binary.BigEndian.Uint16(msg[4:6])
		payload := msg[6:]

		if uint16(len(payload)) < payloadLen {
			continue
		}
		payload = payload[:payloadLen]

		if payloadLen == 0 {
			t.closeConn(connID)
			continue
		}

		t.connMu.RLock()
		targetConn, exists := t.conns[connID]
		t.connMu.RUnlock()

		if !exists {
			host := string(payload)
			targetConn, err = net.DialTimeout("tcp", host, 10*time.Second)
			if err != nil {
				continue
			}
			t.connMu.Lock()
			t.conns[connID] = targetConn
			t.connMu.Unlock()
			go t.relayToTarget(connID, targetConn, conn)
			continue
		}

		targetConn.Write(payload)
	}
}

func (t *WebSocketTunnel) relayToTarget(connID uint32, target net.Conn, ws *websocket.Conn) {
	defer func() {
		t.closeConn(connID)
		msg := make([]byte, 6)
		binary.BigEndian.PutUint32(msg[:4], connID)
		binary.BigEndian.PutUint16(msg[4:6], 0)
		ws.WriteMessage(websocket.BinaryMessage, msg)
	}()

	buf := make([]byte, 32768)
	for {
		target.SetReadDeadline(time.Now().Add(5 * time.Minute))
		n, err := target.Read(buf)
		if err != nil {
			return
		}

		msg := make([]byte, 6+n)
		binary.BigEndian.PutUint32(msg[:4], connID)
		binary.BigEndian.PutUint16(msg[4:6], uint16(n))
		copy(msg[6:], buf[:n])

		if err := ws.WriteMessage(websocket.BinaryMessage, msg); err != nil {
			return
		}
	}
}

func (t *WebSocketTunnel) closeConn(connID uint32) {
	t.connMu.Lock()
	defer t.connMu.Unlock()
	if conn, exists := t.conns[connID]; exists {
		conn.Close()
		delete(t.conns, connID)
	}
}

func (t *WebSocketTunnel) handleHealth(w http.ResponseWriter, r *http.Request) {
	t.connMu.RLock()
	count := len(t.conns)
	t.connMu.RUnlock()
	w.Write([]byte(fmt.Sprintf(`{"status":"ok","active_tunnels":%d}`, count)))
}
