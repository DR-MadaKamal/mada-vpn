import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../utils/auth';
import Head from 'next/head';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>MadaVPN - Open Source VPN Platform</title>
        <meta name="description" content="Full-stack open source VPN platform. Browser dashboard, Chrome extension, and desktop app. Self-host or use cloud." />
        <meta property="og:title" content="MadaVPN - Open Source VPN Platform" />
        <meta property="og:description" content="Full-stack open source VPN platform with 50+ features." />
        <meta property="og:type" content="website" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛡️</text></svg>" />
      </Head>
      <Component {...pageProps} />
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' },
      }} />
    </AuthProvider>
  );
}
