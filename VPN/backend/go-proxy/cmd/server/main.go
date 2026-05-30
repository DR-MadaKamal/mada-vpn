package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/securevpn/go-proxy/internal/auth"
	"github.com/securevpn/go-proxy/internal/config"
	"github.com/securevpn/go-proxy/internal/metrics"
	"github.com/securevpn/go-proxy/internal/proxy"
	"github.com/securevpn/go-proxy/internal/wireguard"
)

func main() {
	cfgPath := os.Getenv("CONFIG_PATH")
	if cfgPath == "" {
		cfgPath = "config.yaml"
	}

	cfg, err := config.Load(cfgPath)
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	authService := auth.NewService(cfg.Auth)

	metricsServer := metrics.NewServer()
	go func() {
		http.ListenAndServe(":9090", metricsServer.Handler())
	}()

	httpProxy := proxy.NewHTTPProxy(cfg, authService)
	socks5Proxy := proxy.NewSOCKS5Proxy(cfg, authService)
	tunnelServer := proxy.NewWebSocketTunnel(cfg, authService)
	wgManager := wireguard.NewManager(cfg.WireGuard)

	errCh := make(chan error, 4)

	go func() {
		addr := fmt.Sprintf(":%d", cfg.Server.HTTPProxyPort)
		log.Printf("HTTP proxy starting on %s", addr)
		errCh <- http.ListenAndServe(addr, httpProxy.Handler())
	}()

	go func() {
		addr := fmt.Sprintf(":%d", cfg.Server.SOCKS5Port)
		log.Printf("SOCKS5 proxy starting on %s", addr)
		errCh <- socks5Proxy.Start(addr)
	}()

	go func() {
		addr := fmt.Sprintf(":%d", cfg.Server.WebSocketPort)
		log.Printf("WebSocket tunnel starting on %s", addr)
		errCh <- tunnelServer.Start(addr)
	}()

	go func() {
		log.Printf("WireGuard manager starting")
		if err := wgManager.Start(ctx); err != nil {
			errCh <- err
		}
	}()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	select {
	case err := <-errCh:
		if err != nil {
			log.Printf("Server error: %v", err)
		}
	case sig := <-sigCh:
		log.Printf("Received signal: %v", sig)
	}

	cancel()

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	<-shutdownCtx.Done()
	log.Println("Server shutdown complete")
}
