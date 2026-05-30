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
        <title>SecureVPN - Browse Without Limits</title>
        <meta name="description" content="Secure, fast, and reliable VPN service. Bypass censorship and protect your privacy." />
      </Head>
      <Component {...pageProps} />
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' },
      }} />
    </AuthProvider>
  );
}
