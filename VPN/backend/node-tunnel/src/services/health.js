const os = require('os');

function createHealthMonitor(redis) {
  let startTime = Date.now();

  function getStatus() {
    return {
      uptime: Math.floor((Date.now() - startTime) / 1000),
      memory: process.memoryUsage(),
      cpu: os.loadavg(),
      redis: redis.status === 'ready' ? 'connected' : 'disconnected',
      connections: process._getActiveRequests ? process._getActiveRequests().length : 0,
    };
  }

  return { getStatus };
}

module.exports = { createHealthMonitor };
