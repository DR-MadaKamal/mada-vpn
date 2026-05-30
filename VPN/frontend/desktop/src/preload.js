const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('vpnAPI', {
  connect: () => ipcRenderer.invoke('connect'),
  disconnect: () => ipcRenderer.invoke('disconnect'),
  getState: () => ipcRenderer.invoke('getState'),
  setProtocol: (protocol) => ipcRenderer.invoke('setProtocol', protocol),
  setServer: (server) => ipcRenderer.invoke('setServer', server),
  setAutoConnect: (enabled) => ipcRenderer.invoke('setAutoConnect', enabled),
  setKillSwitch: (enabled) => ipcRenderer.invoke('setKillSwitch', enabled),
  minimize: () => ipcRenderer.invoke('minimize'),
  close: () => ipcRenderer.invoke('close'),

  onTrayConnect: (cb) => ipcRenderer.on('tray-connect', cb),
  onTrayDisconnect: (cb) => ipcRenderer.on('tray-disconnect', cb),
  onAutoConnect: (cb) => ipcRenderer.on('auto-connect', cb),
});
