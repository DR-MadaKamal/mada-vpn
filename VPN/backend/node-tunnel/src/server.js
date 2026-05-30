require('dotenv').config();
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const { createProxyService } = require('./services/proxy');
const { createRedisClient } = require('./services/redis');
const { createAuthClient } = require('./services/auth');
const { createHealthMonitor } = require('./services/health');
const { createMetricsCollector } = require('./services/metrics');
const logger = require('./services/logger');

const PORT = process.env.PORT || 3001;

async function main() {
  const app = express();
  const server = http.createServer(app);

  const redis = createRedisClient();
  const auth = createAuthClient();
  const metrics = createMetricsCollector();
  const healthMonitor = createHealthMonitor(redis);

  const wss = new WebSocketServer({ server, path: '/tunnel' });

  const proxyService = createProxyService(wss, { redis, auth, metrics });

  app.use(express.json());

  app.get('/health', (req, res) => {
    const status = healthMonitor.getStatus();
    res.json({ status: 'ok', ...status, uptime: process.uptime() });
  });

  app.get('/metrics', (req, res) => {
    res.json(metrics.getSnapshot());
  });

  app.get('/api/status', (req, res) => {
    res.json({
      activeTunnels: proxyService.getActiveCount(),
      totalBytesRelayed: metrics.getTotalBytes(),
      connectedClients: proxyService.getClientList().length,
    });
  });

  app.post('/api/broadcast', (req, res) => {
    const { message, userId } = req.body;
    if (userId) {
      proxyService.sendToUser(userId, message);
    } else {
      proxyService.broadcast(message);
    }
    res.json({ sent: true });
  });

  wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    const clientId = req.headers['x-client-id'] || `client-${Date.now()}`;
    const protocol = req.headers['x-protocol'] || 'websocket';

    logger.info(`Tunnel connection from ${clientIp} (${clientId})`);

    metrics.incrementConnections();

    const tunnel = proxyService.createTunnel(ws, { clientId, clientIp, protocol });

    ws.on('message', (data) => {
      try {
        tunnel.handleData(data);
        metrics.addBytesRx(data.length);
      } catch (err) {
        logger.error(`Tunnel data error: ${err.message}`);
      }
    });

    ws.on('close', () => {
      logger.info(`Tunnel closed for ${clientId}`);
      tunnel.close();
      metrics.decrementConnections();
      proxyService.removeTunnel(clientId);
    });

    ws.on('error', (err) => {
      logger.error(`WebSocket error for ${clientId}: ${err.message}`);
      tunnel.close();
    });
  });

  server.listen(PORT, () => {
    logger.info(`Node tunnel server listening on port ${PORT}`);
  });

  process.on('SIGTERM', () => gracefulShutdown(server, redis, proxyService));
  process.on('SIGINT', () => gracefulShutdown(server, redis, proxyService));
}

async function gracefulShutdown(server, redis, proxyService) {
  logger.info('Shutting down gracefully...');
  proxyService.closeAll();
  await redis.quit();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
}

main().catch((err) => {
  logger.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
