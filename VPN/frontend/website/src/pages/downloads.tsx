import { Shield, Chrome, Monitor, Smartphone, Package, Github, Download, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function DownloadsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-indigo-400" />
          <h1 className="text-3xl font-bold">Download MadaVPN</h1>
        </div>
        <p className="text-gray-400 mb-10">Install MadaVPN on every device you use. All platforms supported.</p>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Chrome className="h-10 w-10 text-emerald-400 flex-shrink-0" />
              <div className="flex-grow">
                <h2 className="text-xl font-semibold mb-2">Chrome Extension</h2>
                <p className="text-gray-400 mb-4">Proxy-based VPN that runs directly in your browser. Supports obfuscation, DNS-over-HTTPS, split tunneling, and kill switch.</p>
                <div className="flex flex-wrap gap-3">
                  <a href="https://github.com/DR-MadaKamal/mada-vpn/releases/download/v1.0.0/madavpn-extension-v1.0.0.zip" target="_blank" className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm">
                    <Download className="h-4 w-4" /> Download .zip
                  </a>
                  <a href="https://github.com/DR-MadaKamal/mada-vpn/tree/main/frontend/extension" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm">
                    <ExternalLink className="h-4 w-4" /> View Source
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Monitor className="h-10 w-10 text-sky-400 flex-shrink-0" />
              <div className="flex-grow">
                <h2 className="text-xl font-semibold mb-2">Desktop App — Windows</h2>
                <p className="text-gray-400 mb-4">System tray VPN app with WireGuard integration, system proxy, and full feature support.</p>
                <div className="flex flex-wrap gap-3">
                  <a href="https://github.com/DR-MadaKamal/mada-vpn/releases" target="_blank" rel="noopener noreferrer" className="bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm">
                    <Download className="h-4 w-4" /> Download .exe
                  </a>
                  <span className="text-gray-500 text-sm py-2">Or run from source: <code className="bg-white/10 px-2 py-1 rounded">cd frontend/desktop && npm install && npm start</code></span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Smartphone className="h-10 w-10 text-amber-400 flex-shrink-0" />
              <div className="flex-grow">
                <h2 className="text-xl font-semibold mb-2">Desktop App — macOS</h2>
                <p className="text-gray-400 mb-4">Native macOS app with menu bar integration, system-wide kill switch, and WireGuard.</p>
                <div className="flex flex-wrap gap-3">
                  <a href="https://github.com/DR-MadaKamal/mada-vpn/releases" target="_blank" rel="noopener noreferrer" className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm">
                    <Download className="h-4 w-4" /> Download .dmg
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Package className="h-10 w-10 text-rose-400 flex-shrink-0" />
              <div className="flex-grow">
                <h2 className="text-xl font-semibold mb-2">Desktop App — Linux</h2>
                <p className="text-gray-400 mb-4">Linux AppImage for all major distributions. Full WireGuard and proxy support.</p>
                <div className="flex flex-wrap gap-3">
                  <a href="https://github.com/DR-MadaKamal/mada-vpn/releases" target="_blank" rel="noopener noreferrer" className="bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm">
                    <Download className="h-4 w-4" /> Download .AppImage
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <a href="https://github.com/DR-MadaKamal/mada-vpn" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition">
            <Github className="h-5 w-5" /> View on GitHub — All source code and releases
          </a>
        </div>
      </div>
    </div>
  );
}
