const http = require('http');

const API_URL = process.env.API_URL || 'http://localhost:8000';
const WS_SECRET = process.env.WS_SECRET || 'change-me';

function createAuthClient() {
  function verifyToken(token) {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({ token });
      const url = new URL(`${API_URL}/api/v1/auth/verify`);

      const req = http.request(
        {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
          },
          timeout: 5000,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            if (res.statusCode === 200) {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(new Error('Invalid auth response'));
              }
            } else {
              reject(new Error(`Auth failed: ${res.statusCode}`));
            }
          });
        }
      );

      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  function validateSecret(secret) {
    return secret === WS_SECRET;
  }

  return { verifyToken, validateSecret };
}

module.exports = { createAuthClient };
