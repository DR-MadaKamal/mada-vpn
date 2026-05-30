package auth

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/securevpn/go-proxy/internal/config"
)

type Session struct {
	UserID    string
	Username  string
	Tier      string
	ExpiresAt time.Time
	BytesUsed int64
	BytesQuota int64
}

type Service struct {
	cfg      config.AuthConfig
	sessions map[string]*Session
	mu       sync.RWMutex
	client   *http.Client
}

func NewService(cfg config.AuthConfig) *Service {
	return &Service{
		cfg:      cfg,
		sessions: make(map[string]*Session),
		client: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

func (s *Service) Authenticate(token string) (*Session, error) {
	if s.cfg.Mode == "none" {
		return &Session{
			UserID:   "anonymous",
			Username: "anonymous",
			Tier:     "free",
		}, nil
	}

	s.mu.RLock()
	session, exists := s.sessions[token]
	s.mu.RUnlock()

	if exists && session.ExpiresAt.After(time.Now()) {
		return session, nil
	}

	session, err := s.verifyWithAPI(token)
	if err != nil {
		return nil, err
	}

	s.mu.Lock()
	s.sessions[token] = session
	s.mu.Unlock()

	return session, nil
}

func (s *Service) verifyWithAPI(token string) (*Session, error) {
	body, _ := json.Marshal(map[string]string{"token": token})
	req, err := http.NewRequestWithContext(
		context.Background(),
		"POST",
		s.cfg.APIURL,
		bytes.NewReader(body),
	)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("auth API unreachable: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("auth failed: status %d", resp.StatusCode)
	}

	var result struct {
		UserID    string `json:"user_id"`
		Username  string `json:"username"`
		Tier      string `json:"tier"`
		ExpiresAt string `json:"expires_at"`
		Quota     int64  `json:"quota_bytes"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	expiresAt, _ := time.Parse(time.RFC3339, result.ExpiresAt)

	return &Session{
		UserID:     result.UserID,
		Username:   result.Username,
		Tier:       result.Tier,
		ExpiresAt:  expiresAt,
		BytesQuota: result.Quota,
	}, nil
}

func (s *Service) RecordUsage(token string, bytes int64) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if session, exists := s.sessions[token]; exists {
		session.BytesUsed += bytes
	}
}

func (s *Service) IsQuotaExceeded(token string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if session, exists := s.sessions[token]; exists {
		return session.BytesQuota > 0 && session.BytesUsed >= session.BytesQuota
	}
	return false
}

func (s *Service) InvalidateSession(token string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.sessions, token)
}

func (s *Service) GetSession(token string) *Session {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.sessions[token]
}
