const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage } = require('electron');
const path = require('path');
const { createProxyManager } = require('./proxy-manager');
const { createVPNService } = require('./vpn-service');
const Store = require('electron-store');

const store = new Store({
  defaults: {
    token: null,
    server: null,
    protocol: 'http',
    autoConnect: false,
    systemProxy: false,
    killSwitch: true,
    obfuscation: false,
    obfuscationMethod: 'none',
    stealthMode: false,
    dnsOverHttps: false,
    splitTunnel: false,
    autoFailover: true,
    mtuSize: 1500,
    customPort: 0,
    preferTcp: true,
  },
});

let mainWindow = null;
let tray = null;
let proxyManager = null;
let vpnService = null;
let isConnected = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 680,
    resizable: false,
    frame: false,
    icon: path.join(__dirname, '..', 'public', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  let iconPath = path.join(__dirname, '..', 'public', 'tray-icon.png');
  let icon;

  try {
    icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) throw new Error('Empty icon');
  } catch {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon.resize({ width: 16, height: 16 }));
  tray.setToolTip('SecureVPN - Disconnected');
  updateTrayMenu();
  tray.on('double-click', () => mainWindow?.show());
}

function updateTrayMenu(connected) {
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show SecureVPN', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: connected ? 'Connected' : 'Disconnected', enabled: false },
    { type: 'separator' },
    {
      label: connected ? 'Disconnect' : 'Connect',
      click: () => {
        mainWindow?.webContents.send(connected ? 'tray-disconnect' : 'tray-connect');
      },
    },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); } },
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip(`SecureVPN - ${connected ? 'Connected' : 'Disconnected'}`);
}

function setupIPC() {
  ipcMain.handle('connect', async () => {
    try {
      const protocol = store.get('protocol');
      const server = store.get('server');
      const obfuscation = store.get('obfuscation');
      const obfuscationMethod = store.get('obfuscationMethod');
      const options = { obfuscation, obfuscationMethod, mtu: store.get('mtuSize'), port: store.get('customPort'), preferTcp: store.get('preferTcp') };
      if (protocol === 'wireguard' && vpnService) {
        await vpnService.connect(server, options);
      } else if (proxyManager) {
        await proxyManager.enable(server, protocol, options);
      }
      isConnected = true;
      updateTrayMenu(true);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('disconnect', async () => {
    try {
      if (vpnService) await vpnService.disconnect();
      if (proxyManager) await proxyManager.disable(true);
      isConnected = false;
      updateTrayMenu(false);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('getState', () => ({
    connected: isConnected,
    protocol: store.get('protocol'),
    server: store.get('server'),
    autoConnect: store.get('autoConnect'),
    killSwitch: store.get('killSwitch'),
    obfuscation: store.get('obfuscation'),
    stealthMode: store.get('stealthMode'),
    dnsOverHttps: store.get('dnsOverHttps'),
    splitTunnel: store.get('splitTunnel'),
    autoFailover: store.get('autoFailover'),
    mtuSize: store.get('mtuSize'),
    customPort: store.get('customPort'),
    preferTcp: store.get('preferTcp'),
  }));

  ipcMain.handle('setProtocol', (_, protocol) => {
    store.set('protocol', protocol);
    return { success: true };
  });

  ipcMain.handle('setServer', (_, server) => {
    store.set('server', server);
    return { success: true };
  });

  ipcMain.handle('setAutoConnect', (_, enabled) => {
    store.set('autoConnect', enabled);
    return { success: true };
  });

  ipcMain.handle('setKillSwitch', (_, enabled) => {
    store.set('killSwitch', enabled);
    if (proxyManager) proxyManager.setKillSwitch(enabled);
    return { success: true };
  });

  ipcMain.handle('setObfuscation', (_, enabled, method) => {
    store.set('obfuscation', enabled);
    store.set('obfuscationMethod', method || 'none');
    return { success: true };
  });

  ipcMain.handle('setStealthMode', (_, enabled) => {
    store.set('stealthMode', enabled);
    return { success: true };
  });

  ipcMain.handle('setDnsOverHttps', (_, enabled) => {
    store.set('dnsOverHttps', enabled);
    return { success: true };
  });

  ipcMain.handle('setSplitTunnel', (_, enabled) => {
    store.set('splitTunnel', enabled);
    return { success: true };
  });

  ipcMain.handle('setAutoFailover', (_, enabled) => {
    store.set('autoFailover', enabled);
    return { success: true };
  });

  ipcMain.handle('setMtuSize', (_, mtu) => {
    store.set('mtuSize', mtu);
    return { success: true };
  });

  ipcMain.handle('setCustomPort', (_, port) => {
    store.set('customPort', port);
    return { success: true };
  });

  ipcMain.handle('setPreferTcp', (_, enabled) => {
    store.set('preferTcp', enabled);
    return { success: true };
  });

  ipcMain.handle('minimize', () => mainWindow?.minimize());
  ipcMain.handle('close', () => mainWindow?.hide());
}

app.whenReady().then(() => {
  proxyManager = createProxyManager(store);
  vpnService = createVPNService(store);
  createWindow();
  createTray();
  setupIPC();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
  else mainWindow?.show();
});

app.on('before-quit', async () => {
  if (proxyManager) await proxyManager.disable();
  if (vpnService) await vpnService.disconnect();
});
