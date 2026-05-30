const net = require('net');

function createProxyService(wss, deps) {
  const tunnels = new Map();

  function createTunnel(ws, meta) {
    const id = meta.clientId;

    const tunnel = {
      id,
      meta,
      dataQueue: [],
      targetConn: null,
      closed: false,

      handleData(data) {
        if (this.closed) return;

        try {
          const msg = JSON.parse(data.toString());

          if (msg.type === 'connect') {
            this.connectTarget(msg.host, msg.port);
          } else if (msg.type === 'data') {
            if (this.targetConn && !this.targetConn.destroyed) {
              this.targetConn.write(Buffer.from(msg.payload, 'base64'));
            }
          } else if (msg.type === 'close') {
            this.close();
          } else if (msg.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong' }));
          }
        } catch (err) {
          tunnel.relayRaw(data);
        }
      },

      connectTarget(host, port) {
        if (!port) port = 443;

        this.targetConn = net.createConnection({ host, port }, () => {
          ws.send(JSON.stringify({
            type: 'connected',
            target: `${host}:${port}`,
          }));
        });

        this.targetConn.on('data', (data) => {
          if (ws.readyState === ws.OPEN) {
            ws.send(data);
          }
        });

        this.targetConn.on('error', (err) => {
          ws.send(JSON.stringify({
            type: 'error',
            message: err.message,
          }));
          this.close();
        });

        this.targetConn.on('close', () => {
          ws.send(JSON.stringify({ type: 'target_closed' }));
        });
      },

      relayRaw(data) {
        if (this.targetConn && !this.targetConn.destroyed) {
          this.targetConn.write(Buffer.from(data));
        }
      },

      close() {
        if (this.closed) return;
        this.closed = true;
        if (this.targetConn && !this.targetConn.destroyed) {
          this.targetConn.end();
        }
      },
    };

    tunnels.set(id, tunnel);
    return tunnel;
  }

  function removeTunnel(clientId) {
    const tunnel = tunnels.get(clientId);
    if (tunnel) {
      tunnel.close();
      tunnels.delete(clientId);
    }
  }

  function getActiveCount() {
    return tunnels.size;
  }

  function getClientList() {
    return Array.from(tunnels.values()).map((t) => ({
      id: t.id,
      ip: t.meta.clientIp,
      protocol: t.meta.protocol,
    }));
  }

  function sendToUser(userId, message) {
    for (const [id, tunnel] of tunnels) {
      if (id.includes(userId) && tunnel.ws && tunnel.ws.readyState === tunnel.ws.OPEN) {
        tunnel.ws.send(JSON.stringify({ type: 'message', data: message }));
      }
    }
  }

  function broadcast(message) {
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({ type: 'broadcast', data: message }));
      }
    });
  }

  function closeAll() {
    for (const [id, tunnel] of tunnels) {
      tunnel.close();
    }
    tunnels.clear();
  }

  return {
    createTunnel,
    removeTunnel,
    getActiveCount,
    getClientList,
    sendToUser,
    broadcast,
    closeAll,
  };
}

module.exports = { createProxyService };
