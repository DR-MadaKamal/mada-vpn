import { useState, useEffect } from 'react';
import {
  Shield, Globe, Zap, Download, Server, Lock, ChevronRight, Menu, X,
  Github, Smartphone, Monitor, Chrome, Package, ExternalLink, ArrowRight
} from 'lucide-react';

const LATENCIES = [67, 73, 73, 69, 27, 51, 63, 104, 85, 102];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [latencies, setLatencies] = useState<number[]>([]);
  useEffect(() => { setLatencies(LATENCIES); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white">
      <nav className="border-b border-white/10 backdrop-blur-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-indigo-400" />
              <span className="text-xl font-bold">MadaVPN</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
              <a href="#download" className="text-gray-300 hover:text-white transition">Download</a>
              <a href="#servers" className="text-gray-300 hover:text-white transition">Servers</a>
              <a href="https://github.com/mada-dev/mada-vpn" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-300 hover:text-white transition"><Github className="h-4 w-4" /> GitHub</a>
              <a href="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition">Dashboard</a>
            </div>
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      <main>
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 text-sm text-indigo-300 mb-8">
              <Zap className="h-4 w-4" /> Open Source VPN Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              Your Privacy,<br />Your Control
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Full-stack VPN platform — browser dashboard, Chrome extension, and desktop app.
              Self-host or use our cloud. 100% open source.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-xl text-lg font-semibold transition flex items-center justify-center gap-2">
                Open Dashboard <ChevronRight className="h-5 w-5" />
              </a>
              <a href="https://github.com/mada-dev/mada-vpn" target="_blank" rel="noopener noreferrer" className="border border-white/20 hover:border-white/40 px-8 py-4 rounded-xl text-lg transition flex items-center justify-center gap-2">
                <Github className="h-5 w-5" /> View on GitHub
              </a>
            </div>
          </div>
        </section>

        <section id="download" className="py-20 px-4 bg-white/5">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">Download MadaVPN</h2>
            <p className="text-gray-400 text-center mb-12 text-lg">Available on every platform you use</p>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: <Chrome className="h-8 w-8 text-emerald-400" />, title: 'Chrome Extension', desc: 'Proxy-based VPN in your browser. Install from the Chrome Web Store or load unpacked.', action: 'Install Extension', href: '/downloads#extension' },
                { icon: <Monitor className="h-8 w-8 text-sky-400" />, title: 'Desktop App (Windows)', desc: 'Full system tray VPN with WireGuard and system proxy. Native Windows app.', action: 'Download .exe', href: '/downloads#windows' },
                { icon: <Smartphone className="h-8 w-8 text-amber-400" />, title: 'Desktop App (macOS)', desc: 'Native macOS app with menu bar integration and system-wide kill switch.', action: 'Download .dmg', href: '/downloads#macos' },
                { icon: <Package className="h-8 w-8 text-rose-400" />, title: 'Desktop App (Linux)', desc: 'Linux AppImage for all major distributions. Full WireGuard support.', action: 'Download .AppImage', href: '/downloads#linux' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition flex flex-col">
                  <div className="mb-4">{item.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-gray-400 text-sm mb-6 flex-grow">{item.desc}</p>
                  <a href={item.href} className="bg-indigo-600 hover:bg-indigo-700 text-center py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">
                    <Download className="h-4 w-4" /> {item.action}
                  </a>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <a href="https://github.com/mada-dev/mada-vpn/releases" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition flex items-center justify-center gap-1">
                <ExternalLink className="h-4 w-4" /> All releases on GitHub
              </a>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">Everything You Need</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <Globe className="h-8 w-8 text-indigo-400" />, title: '100+ Servers', desc: 'Global network across USA, Europe, Asia, Australia, and South America.' },
                { icon: <Lock className="h-8 w-8 text-emerald-400" />, title: 'AES-256 + PFS', desc: 'Military-grade encryption with Perfect Forward Secrecy. Keys rotate automatically.' },
                { icon: <Zap className="h-8 w-8 text-amber-400" />, title: '10 Gbps Ports', desc: 'Massive bandwidth capacity with zero buffering. WireGuard for maximum speed.' },
                { icon: <Server className="h-8 w-8 text-rose-400" />, title: 'Multi-Protocol', desc: 'HTTP, SOCKS5, WireGuard, WebSocket, OpenVPN, Shadowsocks, and more.' },
                { icon: <Shield className="h-8 w-8 text-violet-400" />, title: 'Kill Switch + Split Tunnel', desc: 'System-wide kill switch prevents leaks. Route only selected apps through VPN.' },
                { icon: <Globe className="h-8 w-8 text-cyan-400" />, title: 'Meshnet + Dedicated IP', desc: 'P2P device mesh. Static clean IP for streaming. RAM-only servers.' },
              ].map((f, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition">
                  <div className="mb-4">{f.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="servers" className="py-20 px-4 bg-white/5">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Global Server Network</h2>
            <p className="text-gray-400 mb-12 text-lg">Connect from anywhere in the world</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {['🇺🇸 USA', '🇬🇧 UK', '🇩🇪 Germany', '🇫🇷 France', '🇳🇱 Netherlands', '🇸🇬 Singapore', '🇯🇵 Japan', '🇦🇺 Australia', '🇨🇦 Canada', '🇧🇷 Brazil'].map((country, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition cursor-pointer">
                  <div className="text-2xl mb-1">{country}</div>
                  <div className="text-xs text-gray-500">Latency: {latencies[i] || '...'}ms</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Self-Host or Use Cloud</h2>
            <p className="text-gray-400 mb-8 text-lg">
              MadaVPN is fully open source. Deploy your own instance or use our hosted version.
              The backend runs on Python/FastAPI, the frontend on Next.js.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-xl text-lg font-semibold transition flex items-center justify-center gap-2">
                Launch Dashboard <ArrowRight className="h-5 w-5" />
              </a>
              <a href="https://github.com/mada-dev/mada-vpn" target="_blank" rel="noopener noreferrer" className="border border-white/20 hover:border-white/40 px-8 py-4 rounded-xl text-lg transition flex items-center justify-center gap-2">
                <Github className="h-5 w-5" /> Clone from GitHub
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-indigo-400" />
                <span className="font-bold">MadaVPN</span>
              </div>
              <p className="text-gray-500 text-sm">Open source VPN platform. Privacy-first, zero compromises.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="/dashboard" className="hover:text-white transition">Dashboard</a></li>
                <li><a href="#download" className="hover:text-white transition">Downloads</a></li>
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Developers</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="https://github.com/mada-dev/mada-vpn" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">GitHub</a></li>
                <li><a href="https://github.com/mada-dev/mada-vpn/issues" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Report Issue</a></li>
                <li><a href="https://github.com/mada-dev/mada-vpn/blob/main/README.md" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><span className="hover:text-white transition cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-white transition cursor-pointer">Terms of Service</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center text-gray-500 text-sm">
            <p suppressHydrationWarning>© {new Date().getFullYear()} MadaVPN. Open source. Built for privacy and freedom.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
