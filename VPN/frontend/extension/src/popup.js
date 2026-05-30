document.addEventListener('DOMContentLoaded', () => {
  const circle = document.getElementById('statusCircle');
  const serverName = document.getElementById('serverName');
  const serverLocation = document.getElementById('serverLocation');
  const connectionStatus = document.getElementById('connectionStatus');
  const errorMsg = document.getElementById('errorMsg');

  function getDashboardUrl(cb) {
    chrome.storage.sync.get(['apiUrl'], (res) => {
      cb((res.apiUrl || 'https://website-ebon-three-59.vercel.app').replace(/\/+$/, ''));
    });
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
    setTimeout(() => { errorMsg.style.display = 'none'; }, 4000);
  }

  function updateUI(s) {
    const enabled = s && s.enabled;
    circle.className = 'status-circle ' + (enabled ? 'connected' : 'disconnected');
    circle.innerHTML = enabled
      ? '<div class="icon">🛡</div><div class="label">Connected</div><div class="sub-label">Tap to disconnect</div>'
      : '<div class="icon">🔒</div><div class="label">Disconnected</div><div class="sub-label">Tap to connect</div>';
    connectionStatus.textContent = enabled ? 'Connected' : 'Off';
    if (enabled && s.server) {
      serverName.textContent = s.server;
      const loc = s.serverLocation || '';
      serverLocation.textContent = loc || s.server;
    } else {
      serverName.textContent = enabled ? 'Proxy Active' : 'Auto';
      serverLocation.textContent = enabled ? PROXY_HOST : '—';
    }
  }

  const PROXY_HOST = 'madavpn-proxy.germanywestcentral.azurecontainer.io';

  function refreshState() {
    chrome.runtime.sendMessage({ action: 'getState' }, (resp) => {
      if (resp && resp.state) updateUI(resp.state);
    });
  }

  circle.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'getState' }, (resp) => {
      if (!resp) return;
      const isEnabled = resp.state && resp.state.enabled;
      if (isEnabled) {
        chrome.runtime.sendMessage({ action: 'disconnect' }, (r) => {
          if (r && r.success) refreshState();
          else showError('Failed to disconnect');
        });
      } else {
        chrome.runtime.sendMessage({ action: 'connect' }, (r) => {
          if (r && r.success) {
            refreshState();
          } else {
            showError('Failed to connect. Is the proxy running?');
          }
        });
      }
    });
  });

  getDashboardUrl((base) => {
    document.getElementById('openDashboard').addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: base + '/dashboard' });
    });
  });

  document.getElementById('openSettings').addEventListener('click', (e) => {
    e.preventDefault();
    getDashboardUrl((base) => chrome.tabs.create({ url: base + '/dashboard' }));
  });

  document.getElementById('openOptions')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  });

  refreshState();
});
