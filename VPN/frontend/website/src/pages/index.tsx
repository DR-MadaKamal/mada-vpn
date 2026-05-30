import { useState, useEffect } from 'react';
import { Shield, Globe, Zap, Download, Server, Lock, ChevronRight, Menu, X } from 'lucide-react';

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
              <span className="text-xl font-bold">SecureVPN</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
              <a href="#servers" className="text-gray-300 hover:text-white transition">Servers</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</a>
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
              <Zap className="h-4 w-4" /> Lightning Fast & Secure
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              Browse the Internet<br />Without Limits
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Secure, fast, and reliable VPN service. Bypass censorship and protect your privacy with military-grade encryption.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-xl text-lg font-semibold transition flex items-center justify-center gap-2">
                Get Started Free <ChevronRight className="h-5 w-5" />
              </a>
              <a href="#features" className="border border-white/20 hover:border-white/40 px-8 py-4 rounded-xl text-lg transition">
                Learn More
              </a>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">Why Choose SecureVPN?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <Globe className="h-8 w-8 text-indigo-400" />, title: 'Global Servers', desc: '100+ servers across 50 countries. Connect to the fastest server near you.' },
                { icon: <Lock className="h-8 w-8 text-emerald-400" />, title: 'Military-Grade Encryption', desc: 'AES-256 encryption protects all your traffic from prying eyes.' },
                { icon: <Zap className="h-8 w-8 text-amber-400" />, title: 'Lightning Speed', desc: 'Optimized routing ensures minimal speed loss. Up to 1 Gbps per connection.' },
                { icon: <Server className="h-8 w-8 text-rose-400" />, title: 'Multi-Protocol', desc: 'HTTP proxy, SOCKS5, WireGuard, and WebSocket tunnel - all in one.' },
                { icon: <Download className="h-8 w-8 text-sky-400" />, title: 'All Platforms', desc: 'Browser extension, desktop app, and web-based proxy. Use anywhere.' },
                { icon: <Shield className="h-8 w-8 text-violet-400" />, title: 'No Logs Policy', desc: 'We never log your activity. Your privacy is our top priority.' },
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

        <section id="pricing" className="py-20 px-4 bg-white/5">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">Simple Pricing</h2>
            <p className="text-gray-400 text-center mb-12 text-lg">Choose the plan that fits your needs</p>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { name: 'Free', price: '$0', gb: '5 GB', devices: '1 Device', speed: '10 Mbps', popular: false },
                { name: 'Basic', price: '$4.99', gb: '50 GB', devices: '3 Devices', speed: '50 Mbps', popular: false },
                { name: 'Premium', price: '$9.99', gb: '200 GB', devices: '5 Devices', speed: '100 Mbps', popular: true },
                { name: 'Enterprise', price: '$29.99', gb: '1 TB', devices: '10 Devices', speed: '500 Mbps', popular: false },
              ].map((plan, i) => (
                <div key={i} className={`rounded-2xl p-8 border ${plan.popular ? 'bg-indigo-600 border-indigo-400 scale-105' : 'bg-white/5 border-white/10'} relative`}>
                  {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-sm font-bold px-4 py-1 rounded-full">POPULAR</div>}
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-lg text-gray-400">/mo</span></div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> {plan.gb} Bandwidth</li>
                    <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> {plan.devices}</li>
                    <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> {plan.speed}</li>
                    <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> All Protocols</li>
                  </ul>
                  <a href={plan.price === '$0' ? '/dashboard' : '/dashboard?subscribe=' + plan.name.toLowerCase()} className={`block text-center py-3 rounded-xl font-semibold transition ${plan.popular ? 'bg-white text-indigo-600 hover:bg-gray-100' : 'bg-white/10 hover:bg-white/20'}`}>
                    {plan.price === '$0' ? 'Get Started' : 'Subscribe'}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="servers" className="py-20 px-4">
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
      </main>

      <footer className="border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p suppressHydrationWarning>© {new Date().getFullYear()} SecureVPN. All rights reserved. Built for privacy and freedom.</p>
        </div>
      </footer>
    </div>
  );
}
