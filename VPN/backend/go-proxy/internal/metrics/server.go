package metrics

import (
	"net/http"
	"sync/atomic"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type Server struct {
	ActiveConnections prometheus.Gauge
	TotalBytesTx      prometheus.Counter
	TotalBytesRx      prometheus.Counter
	RequestCount      prometheus.Counter
	connectionCount   int64
}

func NewServer() *Server {
	s := &Server{
		ActiveConnections: prometheus.NewGauge(prometheus.GaugeOpts{
			Name: "vpn_active_connections",
			Help: "Current active VPN connections",
		}),
		TotalBytesTx: prometheus.NewCounter(prometheus.CounterOpts{
			Name: "vpn_bytes_transmitted_total",
			Help: "Total bytes transmitted",
		}),
		TotalBytesRx: prometheus.NewCounter(prometheus.CounterOpts{
			Name: "vpn_bytes_received_total",
			Help: "Total bytes received",
		}),
		RequestCount: prometheus.NewCounter(prometheus.CounterOpts{
			Name: "vpn_requests_total",
			Help: "Total proxy requests",
		}),
	}

	prometheus.MustRegister(s.ActiveConnections)
	prometheus.MustRegister(s.TotalBytesTx)
	prometheus.MustRegister(s.TotalBytesRx)
	prometheus.MustRegister(s.RequestCount)

	return s
}

func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/metrics", promhttp.Handler())
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"status":"ok"}`))
	})
	return mux
}

func (s *Server) IncrementConnections() {
	atomic.AddInt64(&s.connectionCount, 1)
	s.ActiveConnections.Inc()
}

func (s *Server) DecrementConnections() {
	atomic.AddInt64(&s.connectionCount, -1)
	s.ActiveConnections.Dec()
}

func (s *Server) AddBytesTx(n int64) {
	s.TotalBytesTx.Add(float64(n))
}

func (s *Server) AddBytesRx(n int64) {
	s.TotalBytesRx.Add(float64(n))
}

func (s *Server) IncRequests() {
	s.RequestCount.Inc()
}
