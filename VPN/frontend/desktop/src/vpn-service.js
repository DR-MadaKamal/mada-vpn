const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const os = require('os');
const path = require('path');
const fs = require('fs');

function createVPNService(store) {
  let wgProcess = null;

  async function connect(server) {
    const platform = os.platform();

    if (platform === 'win32') {
      return connectWindows(server);
    } else if (platform === 'darwin' || platform === 'linux') {
      return connectUnix(server);
    }

    throw new Error(`Unsupported platform: ${platform}`);
  }

  async function connectWindows(server) {
    try {
      const configContent = store.get('wireguardConfig');
      if (!configContent) {
        throw new Error('No WireGuard configuration found. Generate one from the dashboard.');
      }

      const configPath = path.join(os.tmpdir(), 'securevpn-wg.conf');
      fs.writeFileSync(configPath, configContent);

      await execPromise(`wireguard /installtunnelservice "${configPath}"`);
    } catch (err) {
      if (err.message.includes('wireguard')) {
        throw new Error('WireGuard not installed. Download from https://www.wireguard.com/install/');
      }
      throw err;
    }
  }

  async function connectUnix(server) {
    try {
      await execPromise('wg-quick up ~/.config/securevpn/wg.conf');
    } catch (err) {
      throw new Error(`WireGuard error: ${err.message}`);
    }
  }

  async function disconnect() {
    const platform = os.platform();

    try {
      if (platform === 'win32') {
        await execPromise('wireguard /uninstalltunnelservice SecureVPN');
      } else {
        await execPromise('wg-quick down ~/.config/securevpn/wg.conf');
      }
    } catch (err) {
      console.error('Disconnect error:', err.message);
    }

    if (wgProcess) {
      wgProcess.kill();
      wgProcess = null;
    }
  }

  async function getStatus() {
    try {
      const { stdout } = await execPromise('wg show');
      return { connected: true, details: stdout };
    } catch {
      return { connected: false };
    }
  }

  return { connect, disconnect, getStatus };
}

module.exports = { createVPNService };
