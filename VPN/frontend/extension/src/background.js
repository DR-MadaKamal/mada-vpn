const DEFAULT_API = 'https://madavpn-api.azurewebsites.net/api/v1';
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
  killSwitch: false,
  blockedOnFailure: false,
};

function getProxyConfig() {
  const scheme = state.protocol === 'socks5' ? 'socks5' : 'http';
  const portMap = { http: 8080, socks5: 1080, ws: 3001 };
  let port = portMap[state.protocol] || 8080;
  let host = state.server || 'proxy.madavpn.com';
  return {
    mode: 'fixed_servers',
    rules: {
      singleProxy: { scheme, host, port },
      bypassList: ['localhost', '127.0.0.1', '*.local', '<local>'],
    },
  };
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
  } else if (state.killSwitch && state.blockedOnFailure) {
    await chrome.proxy.settings.set({ value: getBlackholeConfig(), scope: 'regular' });
    state.enabled = false;
    state.sessionStart = null;
  } else {
    await chrome.proxy.settings.clear({ scope: 'regular' });
    state.enabled = false;
    state.sessionStart = null;
    state.blockedOnFailure = false;
  }
}

async function checkConnection() {
  if (!state.enabled || !state.server) return;
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 5000);
    const resp = await fetch(`http://${state.server}:8080/health`, { signal: ctrl.signal });
    if (resp.ok) {
      state.reconnectAttempts = 0;
      if (state.blockedOnFailure) {
        state.blockedOnFailure = false;
        await chrome.proxy.settings.set({ value: getProxyConfig(), scope: 'regular' });
      }
    }
  } catch {
    state.reconnectAttempts++;
    if (state.killSwitch && !state.blockedOnFailure) {
      state.blockedOnFailure = true;
      await chrome.proxy.settings.set({ value: getBlackholeConfig(), scope: 'regular' });
    }
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['apiUrl'], (result) => {
    if (result.apiUrl) API_BASE = result.apiUrl;
  });
  chrome.storage.local.get(['token', 'server', 'protocol', 'enabled', 'killSwitch'], (result) => {
    if (result.token) state.token = result.token;
    if (result.server) state.server = result.server;
    if (result.protocol) state.protocol = result.protocol;
    if (result.killSwitch !== undefined) state.killSwitch = result.killSwitch;
    if (result.enabled) setProxy(true);
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
      sendResponse({ success: true });
      return true;

    case 'setProtocol':
      state.protocol = msg.protocol;
      chrome.storage.local.set({ protocol: msg.protocol });
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
  }
});