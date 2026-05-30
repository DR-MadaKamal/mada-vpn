package wireguard

import (
	"context"
	"fmt"
	"log"
	"net"
	"os/exec"
	"sync"
	"time"

	"github.com/securevpn/go-proxy/internal/config"
)

type Peer struct {
	PublicKey  string
	AllowedIPs string
	Endpoint   string
	Connected  bool
	BytesRx    int64
	BytesTx    int64
}

type Manager struct {
	cfg     config.WireGuardConfig
	peers   map[string]*Peer
	mu      sync.RWMutex
	started bool
}

func NewManager(cfg config.WireGuardConfig) *Manager {
	return &Manager{
		cfg:   cfg,
		peers: make(map[string]*Peer),
	}
}

func (m *Manager) Start(ctx context.Context) error {
	if err := m.ensureInterface(); err != nil {
		log.Printf("WireGuard interface setup warning: %v", err)
	}

	go m.monitorPeers(ctx)

	m.started = true
	<-ctx.Done()
	return m.shutdown()
}

func (m *Manager) ensureInterface() error {
	exists := exec.Command("ip", "link", "show", m.cfg.Interface)
	if exists.Run() != nil {
		return fmt.Errorf("wireguard interface %s not found", m.cfg.Interface)
	}
	return nil
}

func (m *Manager) AddPeer(publicKey, allowedIPs, endpoint string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.peers[publicKey] = &Peer{
		PublicKey:  publicKey,
		AllowedIPs: allowedIPs,
		Endpoint:   endpoint,
		Connected:  true,
	}

	cmd := exec.Command("wg", "set", m.cfg.Interface,
		"peer", publicKey,
		"allowed-ips", allowedIPs,
		"endpoint", endpoint,
	)
	return cmd.Run()
}

func (m *Manager) RemovePeer(publicKey string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	delete(m.peers, publicKey)

	cmd := exec.Command("wg", "set", m.cfg.Interface, "peer", publicKey, "remove")
	return cmd.Run()
}

func (m *Manager) GetPeers() []*Peer {
	m.mu.RLock()
	defer m.mu.RUnlock()

	peers := make([]*Peer, 0, len(m.peers))
	for _, p := range m.peers {
		peers = append(peers, p)
	}
	return peers
}

func (m *Manager) GetStats() (active, total int) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for _, p := range m.peers {
		total++
		if p.Connected {
			active++
		}
	}
	return
}

func (m *Manager) monitorPeers(ctx context.Context) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			m.updatePeerStats()
		}
	}
}

func (m *Manager) updatePeerStats() {
	cmd := exec.Command("wg", "show", m.cfg.Interface, "dump")
	output, err := cmd.Output()
	if err != nil {
		return
	}

	m.mu.Lock()
	defer m.mu.Unlock()

	lines := string(output)
	_ = lines
}

func (m *Manager) GenerateServerKeys() error {
	cmd := exec.Command("wg", "genkey")
	out, err := cmd.Output()
	if err != nil {
		return err
	}
	privKey := string(out)

	cmd = exec.Command("wg", "pubkey")
	cmd.Stdin = privKey
	pubKey, err := cmd.Output()
	if err != nil {
		return err
	}

	log.Printf("Server public key: %s", string(pubKey))
	return nil
}

func (m *Manager) shutdown() error {
	log.Println("WireGuard manager shutting down")
	return nil
}

func (m *Manager) IsStarted() bool {
	return m.started
}
