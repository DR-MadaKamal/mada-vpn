package config

import (
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Server   ServerConfig   `yaml:"server"`
	Proxy    ProxyConfig    `yaml:"proxy"`
	TLS      TLSConfig      `yaml:"tls"`
	Auth     AuthConfig     `yaml:"auth"`
	WireGuard WireGuardConfig `yaml:"wireguard"`
	Logging  LoggingConfig  `yaml:"logging"`
}

type ServerConfig struct {
	HTTPProxyPort   int `yaml:"http_proxy_port"`
	SOCKS5Port      int `yaml:"socks5_port"`
	WebSocketPort   int `yaml:"websocket_port"`
	WireGuardPort   int `yaml:"wireguard_port"`
}

type ProxyConfig struct {
	MaxConnections   int      `yaml:"max_connections"`
	TimeoutSeconds   int      `yaml:"timeout_seconds"`
	BufferSize       int      `yaml:"buffer_size"`
	AllowedCountries []string `yaml:"allowed_countries"`
	BlockedDomains   []string `yaml:"blocked_domains"`
}

type TLSConfig struct {
	Enabled  bool   `yaml:"enabled"`
	CertFile string `yaml:"cert_file"`
	KeyFile  string `yaml:"key_file"`
}

type AuthConfig struct {
	Mode  string `yaml:"mode"`
	APIURL string `yaml:"api_url"`
}

type WireGuardConfig struct {
	Interface  string   `yaml:"interface"`
	Subnet     string   `yaml:"subnet"`
	PrivateKey string   `yaml:"private_key"`
	DNSServers []string `yaml:"dns_servers"`
}

type LoggingConfig struct {
	Level  string `yaml:"level"`
	Format string `yaml:"format"`
}

func Load(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	cfg := &Config{}
	if err := yaml.Unmarshal(data, cfg); err != nil {
		return nil, err
	}

	setDefaults(cfg)
	return cfg, nil
}

func setDefaults(cfg *Config) {
	if cfg.Server.HTTPProxyPort == 0 {
		cfg.Server.HTTPProxyPort = 8080
	}
	if cfg.Server.SOCKS5Port == 0 {
		cfg.Server.SOCKS5Port = 1080
	}
	if cfg.Server.WebSocketPort == 0 {
		cfg.Server.WebSocketPort = 8081
	}
	if cfg.Server.WireGuardPort == 0 {
		cfg.Server.WireGuardPort = 51820
	}
	if cfg.Proxy.MaxConnections == 0 {
		cfg.Proxy.MaxConnections = 10000
	}
	if cfg.Proxy.TimeoutSeconds == 0 {
		cfg.Proxy.TimeoutSeconds = 300
	}
	if cfg.Proxy.BufferSize == 0 {
		cfg.Proxy.BufferSize = 32768
	}
}
