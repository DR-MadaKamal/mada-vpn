const DEFAULT_API = 'https://madavpn-api.azurewebsites.net';
const PROXY_HOST = 'madavpn-proxy.germanywestcentral.azurecontainer.io';
const PROXY_PORT = 8080;

let state = {
  enabled: false,
  server: null,
  sessionStart: null,
  token: null,
  apiBase: DEFAULT_API,
};

chrome.storage.sync.get(['apiUrl'], (res) => {
  if (res.apiUrl) state.apiBase = res.apiUrl.replace(/\/+$/, '');
});

chrome.storage.local.get(['token', 'enabled', 'server'], (res) => {
  if (res.token) state.token = res.token;
  if (res.server) state.server = res.server;
  if (res.enabled) connectToProxy();
});

function getApi() {
  return state.apiBase + '/api/v1';
}

async function connectToProxy(server) {
  if (server) state.server = server;
  try {
    const config = {
      mode: 'fixed_servers',
      rules: {
        singleProxy: { scheme: 'http', host: PROXY_HOST, port: PROXY_PORT },
        bypassList: ['localhost', '127.0.0.1', '*.local', '<local>'],
      },
    };
    await chrome.proxy.settings.set({ value: config, scope: 'regular' });
    state.enabled = true;
    state.sessionStart = Date.now();
    await chrome.storage.local.set({ enabled: true, server: state.server });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function disconnectFromProxy() {
  try {
    await chrome.proxy.settings.clear({ scope: 'regular' });
    state.enabled = false;
    state.sessionStart = null;
    await chrome.storage.local.set({ enabled: false });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function checkProxyHealth() {
  if (!state.enabled) return { ok: false };
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const resp = await fetch(`http://${PROXY_HOST}:${PROXY_PORT}/`, { signal: ctrl.signal });
    clearTimeout(t);
    return { ok: resp.ok };
  } catch {
    return { ok: false };
  }
}

async function fetchServers() {
  try {
    const resp = await fetch(`${getApi()}/servers`, {
      headers: state.token ? { Authorization: `Bearer ${state.token}` } : {},
    });
    if (!resp.ok) throw new Error('Failed to fetch');
    return { servers: await resp.json() };
  } catch (err) {
    return { servers: [], error: err.message };
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['apiUrl'], (res) => {
    if (res.apiUrl) state.apiBase = res.apiUrl.replace(/\/+$/, '');
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.action) {
    case 'connect':
      connectToProxy(msg.server)
        .then(sendResponse);
      return true;

    case 'disconnect':
      disconnectFromProxy()
        .then(sendResponse);
      return true;

    case 'toggle':
      if (state.enabled) {
        disconnectFromProxy().then(sendResponse);
      } else {
        connectToProxy(msg.server).then(sendResponse);
      }
      return true;

    case 'getState':
      sendResponse({ state });
      return true;

    case 'checkHealth':
      checkProxyHealth().then(sendResponse);
      return true;

    case 'fetchServers':
      fetchServers().then(sendResponse);
      return true;

    case 'setToken':
      state.token = msg.token;
      chrome.storage.local.set({ token: msg.token });
      sendResponse({ success: true });
      return true;
  }
});

chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    chrome.storage.local.get(null, () => {});
  }
});
