/** @type {import('next').NextConfig} */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:slug*',
        destination: `${API_URL}/api/:slug*`,
      },
    ];
  },
};

module.exports = nextConfig;
