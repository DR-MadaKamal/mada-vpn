const { exec } = require('child_process');
const os = require('os');
const util = require('util');
const regQuery = util.promisify(require('child_process').exec);
const execPromise = util.promisify(exec);

function createProxyManager(store) {
  let killSwitchEnabled = store.get('killSwitch', true);

  function getProxyConfig(server, protocol) {
    const portMap = { http: 8080, socks5: 1080, ws: 3001, wireguard: 51820 };
    const schemeMap = { http: 'http', socks5: 'socks5', ws: 'http', wireguard: 'socks5' };
    return {
      host: server || 'proxy.securevpn.com',
      port: portMap[protocol] || 8080,
      scheme: schemeMap[protocol] || 'http',
    };
  }

  function escapePowershell(str) {
    return str.replace(/'/g, "''");
  }

  async function enable(server, protocol) {
    const config = getProxyConfig(server, protocol);
    const platform = os.platform();

    if (platform === 'win32') {
      const host = escapePowershell(config.host);
      const port = config.port;
      const script = `$p='HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings'; Set-ItemProperty -Path $p -Name ProxyEnable -Value 1; Set-ItemProperty -Path $p -Name ProxyServer -Value '${host}:${port}'`;
      await execPromise(`powershell -NoProfile -Command "${script}"`);
    } else if (platform === 'darwin') {
      const networkService = await getMacNetworkService();
      const { host, port, scheme } = config;
      if (scheme === 'socks5') {
        await execPromise(`networksetup -setsocksfirewallproxy "${networkService}" ${host} ${port}`);
      } else {
        await execPromise(`networksetup -setwebproxy "${networkService}" ${host} ${port}`);
        await execPromise(`networksetup -setsecurewebproxy "${networkService}" ${host} ${port}`);
      }
    } else if (platform === 'linux') {
      const { host, port } = config;
      const gsettingsCmds = [
        `gsettings set org.gnome.system.proxy mode 'manual'`,
        `gsettings set org.gnome.system.proxy.http host '${host}'`,
        `gsettings set org.gnome.system.proxy.http port ${port}`,
        `gsettings set org.gnome.system.proxy.https host '${host}'`,
        `gsettings set org.gnome.system.proxy.https port ${port}`,
      ];
      for (const cmd of gsettingsCmds) {
        try { await execPromise(cmd); } catch {}
      }
    }
  }

  async function enableBlackhole() {
    const platform = os.platform();
    if (platform === 'win32') {
      const script = `$p='HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings'; Set-ItemProperty -Path $p -Name ProxyEnable -Value 1; Set-ItemProperty -Path $p -Name ProxyServer -Value '127.0.0.1:0'`;
      await execPromise(`powershell -NoProfile -Command "${script}"`);
    } else if (platform === 'darwin') {
      const networkService = await getMacNetworkService();
      try {
        await execPromise(`networksetup -setwebproxy "${networkService}" 127.0.0.1 0`);
      } catch {}
    } else if (platform === 'linux') {
      try {
        await execPromise(`gsettings set org.gnome.system.proxy mode 'manual'`);
        await execPromise(`gsettings set org.gnome.system.proxy.http host '127.0.0.1'`);
        await execPromise(`gsettings set org.gnome.system.proxy.http port 0`);
      } catch {}
    }
  }

  async function disable(killSwitch) {
    if (killSwitch && killSwitchEnabled) {
      await enableBlackhole();
      return;
    }
    const platform = os.platform();
    if (platform === 'win32') {
      await execPromise(`powershell -NoProfile -Command "$p='HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings'; Set-ItemProperty -Path $p -Name ProxyEnable -Value 0"`);
    } else if (platform === 'darwin') {
      const networkService = await getMacNetworkService();
      try {
        await execPromise(`networksetup -setwebproxystate "${networkService}" off`);
        await execPromise(`networksetup -setsecurewebproxystate "${networkService}" off`);
        await execPromise(`networksetup -setsocksfirewallproxystate "${networkService}" off`);
      } catch {}
    } else if (platform === 'linux') {
      try {
        await execPromise("gsettings set org.gnome.system.proxy mode 'none'");
      } catch {}
    }
  }

  async function getMacNetworkService() {
    try {
      const { stdout } = await execPromise(
        `networksetup -listnetworkserviceorder 2>/dev/null | grep -B1 "$(route -n get default 2>/dev/null | grep interface | awk '{print $2}')" | head -1 | sed 's/^[[:space:]]*([0-9]*) //' || echo "Wi-Fi"`
      );
      return stdout.trim() || 'Wi-Fi';
    } catch {
      return 'Wi-Fi';
    }
  }

  function setKillSwitch(enabled) {
    killSwitchEnabled = enabled;
  }

  return { enable, disable, setKillSwitch };
}

module.exports = { createProxyManager };
