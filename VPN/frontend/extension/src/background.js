const DEFAULT_API = 'http://localhost:8000/api/v1';
let API_BASE = DEFAULT_API;

chrome.storage.sync.get(['apiUrl'], (res) => {
  if (res.apiUrl) API_BASE = res.apiUrl.replace(/\/+$/, '') + '/api/v1';
});

let state = {
  enabled: false,
  server: null,
  protocol: 'http',
  sessionStart: null,
  dataUsed: 0,
  token: null,
  killSwitch: true,
  blockedOnFailure: false,
  obfuscation: false,
  obfuscationMethod: 'none',
  stealthMode: false,
  dnsOverHttps: false,
  splitTunnel: false,
  tunnelStable: true,
  reconnectAttempts: 0,
  lastHealthCheck: null,
};

const OBFS_PORTS = { tls: 443, noise: 8443, shadow: 8080, wss: 3001 };

function getProxyConfig() {
  const scheme = state.protocol === 'socks5' ? 'socks5' : 'http';
  const portMap = { http: 8080, socks5: 1080, ws: 3001 };
  let port = portMap[state.protocol] || 8080;
  let host = state.server || 'proxy.madavpn.com';

  // Apply obfuscation port override
  if (state.obfuscation && state.obfuscationMethod !== 'none' && OBFS_PORTS[state.obfuscationMethod]) {
    port = OBFS_PORTS[state.obfuscationMethod];
  }

  const rules = {
    singleProxy: { scheme, host, port },
    bypassList: ['localhost', '127.0.0.1', '*.local', '<local>'],
  };

  // Split tunneling: bypass domains
  if (state.splitTunnel) {
    rules.bypassList.push('*.corp.internal', '*.local', '192.168.*', '10.*');
  }

  return { mode: 'fixed_servers', rules };
}

function getBlackholeConfig() {
  return {
    mode: 'fixed_servers',
    rules: { singleProxy: { scheme: 'http', host: '127.0.0.1', port: 0 }, bypassList: [] },
  };
}

async function setProxy(enabled) {
  if (enabled) {
    await chrome.proxy.settings.set({ value: getProxyConfig(), scope: 'regular' });
    state.enabled = true;
    state.sessionStart = Date.now();
    state.blockedOnFailure = false;
    state.reconnectAttempts = 0;
    updateBadge('ON', '#22c55e');
  } else if (state.killSwitch && state.blockedOnFailure) {
    await chrome.proxy.settings.set({ value: getBlackholeConfig(), scope: 'regular' });
    state.enabled = false;
    state.sessionStart = null;
    updateBadge('BLK', '#ef4444');
  } else {
    await chrome.proxy.settings.clear({ scope: 'regular' });
    state.enabled = false;
    state.sessionStart = null;
    state.blockedOnFailure = false;
    updateBadge('', '');
  }
}

function updateBadge(text, color) {
  chrome.action.setBadgeText({ text });
  if (color) chrome.action.setBadgeBackgroundColor({ color });
}

async function checkConnection() {
  if (!state.enabled || !state.server) return;
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 5000);
    const resp = await fetch(`http://${state.server}:8080/health`, { signal: ctrl.signal });
    if (resp.ok) {
      state.tunnelStable = true;
      state.lastHealthCheck = Date.now();
      state.reconnectAttempts = 0;
      if (state.blockedOnFailure) {
        state.blockedOnFailure = false;
        await chrome.proxy.settings.set({ value: getProxyConfig(), scope: 'regular' });
        updateBadge('ON', '#22c55e');
      }
    } else {
      throw new Error('Health check failed');
    }
  } catch {
    state.tunnelStable = false;
    state.reconnectAttempts++;
    if (state.killSwitch && !state.blockedOnFailure) {
      state.blockedOnFailure = true;
      await chrome.proxy.settings.set({ value: getBlackholeConfig(), scope: 'regular' });
      updateBadge('BLK', '#ef4444');
    } else if (!state.killSwitch && state.reconnectAttempts < 3) {
      // Auto-reconnect up to 3 times
      setTimeout(async () => {
        if (state.enabled) {
          await chrome.proxy.settings.set({ value: getProxyConfig(), scope: 'regular' });
          updateBadge('ON', '#22c55e');
        }
      }, 5000);
    }
  }
}

// Apply DoH (DNS over HTTPS) via chrome APIs
async function applyDnsSettings() {
  if (state.dnsOverHttps) {
    try {
      await chrome.privacy.network.httpsResolvableEnabled.set({ value: true });
    } catch {}
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['apiUrl'], (result) => {
    if (result.apiUrl) API_BASE = result.apiUrl;
  });
  chrome.storage.local.get(['token', 'server', 'protocol', 'enabled', 'killSwitch', 'obfuscation', 'obfuscationMethod', 'stealthMode', 'dnsOverHttps', 'splitTunnel'], (result) => {
    if (result.token) state.token = result.token;
    if (result.server) state.server = result.server;
    if (result.protocol) state.protocol = result.protocol;
    if (result.killSwitch !== undefined) state.killSwitch = result.killSwitch;
    if (result.obfuscation) state.obfuscation = result.obfuscation;
    if (result.obfuscationMethod) state.obfuscationMethod = result.obfuscationMethod;
    if (result.stealthMode) state.stealthMode = result.stealthMode;
    if (result.dnsOverHttps !== undefined) state.dnsOverHttps = result.dnsOverHttps;
    if (result.splitTunnel !== undefined) state.splitTunnel = result.splitTunnel;
    if (result.enabled) setProxy(true);
    if (result.dnsOverHttps) applyDnsSettings();
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.action) {
    case 'toggle':
      setProxy(!state.enabled)
        .then(() => chrome.storage.local.set({ enabled: state.enabled }))
        .then(() => sendResponse({ success: true, state }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;

    case 'getState':
      sendResponse({ state });
      return true;

    case 'setServer':
      state.server = msg.server;
      chrome.storage.local.set({ server: msg.server });
      if (state.enabled) setProxy(true);
      sendResponse({ success: true });
      return true;

    case 'setProtocol':
      state.protocol = msg.protocol;
      chrome.storage.local.set({ protocol: msg.protocol });
      if (state.enabled) setProxy(true);
      sendResponse({ success: true });
      return true;

    case 'setToken':
      state.token = msg.token;
      chrome.storage.local.set({ token: msg.token });
      sendResponse({ success: true });
      return true;

    case 'setKillSwitch':
      state.killSwitch = msg.enabled;
      chrome.storage.local.set({ killSwitch: msg.enabled });
      sendResponse({ success: true });
      return true;

    case 'setObfuscation':
      state.obfuscation = msg.enabled;
      state.obfuscationMethod = msg.method || 'none';
      chrome.storage.local.set({ obfuscation: msg.enabled, obfuscationMethod: state.obfuscationMethod });
      if (state.enabled) setProxy(true);
      sendResponse({ success: true });
      return true;

    case 'setDnsOverHttps':
      state.dnsOverHttps = msg.enabled;
      chrome.storage.local.set({ dnsOverHttps: msg.enabled });
      applyDnsSettings();
      sendResponse({ success: true });
      return true;

    case 'setSplitTunnel':
      state.splitTunnel = msg.enabled;
      chrome.storage.local.set({ splitTunnel: msg.enabled });
      if (state.enabled) setProxy(true);
      sendResponse({ success: true });
      return true;

    case 'setStealthMode':
      state.stealthMode = msg.enabled;
      chrome.storage.local.set({ stealthMode: msg.enabled });
      sendResponse({ success: true });
      return true;

    case 'fetchServers':
      fetch(`${API_BASE}/servers`, {
        headers: state.token ? { Authorization: `Bearer ${state.token}` } : {},
      })
        .then((r) => {
          if (!r.ok) throw new Error('Failed to fetch servers');
          return r.json();
        })
        .then((servers) => sendResponse({ servers }))
        .catch((err) => sendResponse({ servers: [], error: err.message }));
      return true;

    case 'fetchUsage':
      fetch(`${API_BASE}/users/usage`, {
        headers: state.token ? { Authorization: `Bearer ${state.token}` } : {},
      })
        .then((r) => {
          if (!r.ok) throw new Error('Auth required');
          return r.json();
        })
        .then((usage) => sendResponse({ usage }))
        .catch((err) => sendResponse({ usage: null, error: err.message }));
      return true;
  }
});

chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    chrome.storage.local.get(null, () => {});
    if (state.enabled) {
      chrome.storage.local.set({ lastActive: Date.now() });
      checkConnection();
    }
  }
});