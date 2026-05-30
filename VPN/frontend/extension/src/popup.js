document.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('connectBtn');
  const statusIcon = document.getElementById('statusIcon');
  const statusText = document.getElementById('statusText');
  const statusSub = document.getElementById('statusSub');
  const serverSelect = document.getElementById('serverSelect');
  const statsSection = document.getElementById('statsSection');
  const dataUsedEl = document.getElementById('dataUsed');
  const sessionTimeEl = document.getElementById('sessionTime');
  const protocolBtns = document.querySelectorAll('.protocol-btn');
  const errorEl = document.getElementById('errorMsg');
  const killSwitchCheck = document.getElementById('killSwitchToggle');

  let state = { enabled: false, sessionStart: null, dataUsed: 0, killSwitch: true };

  function showError(msg) {
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
      setTimeout(() => { errorEl.style.display = 'none'; }, 4000);
    }
  }

  function updateUI() {
    const connected = state.enabled;
    const blocked = state.blockedOnFailure;
    connectBtn.textContent = blocked ? 'Blocked' : connected ? 'Disconnect' : 'Connect';
    connectBtn.className = `btn-connect ${blocked ? 'enabled' : connected ? 'enabled' : 'disabled'}`;
    connectBtn.style.background = blocked ? '#ef4444' : connected ? '#ef4444' : '#22c55e';
    statusIcon.className = `status-icon ${blocked ? 'disconnected' : connected ? 'connected' : 'disconnected'}`;
    statusIcon.textContent = blocked ? '🔴' : connected ? '🟢' : '🔴';
    statusText.textContent = blocked ? 'Blocked (Kill Switch)' : connected ? 'Connected' : 'Disconnected';
    statusSub.textContent = blocked
      ? 'Traffic blocked - server unreachable'
      : connected
        ? 'Your traffic is encrypted and protected'
        : 'Your traffic is not protected';
    statsSection.style.display = connected ? 'grid' : 'none';
    if (killSwitchCheck) killSwitchCheck.checked = state.killSwitch !== false;
  }

  function updateStats() {
    if (state.enabled && state.sessionStart) {
      const elapsed = Math.floor((Date.now() - state.sessionStart) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      sessionTimeEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    const mb = (state.dataUsed / (1024 * 1024)).toFixed(1);
    dataUsedEl.textContent = `${mb} MB`;
  }

  function refreshState() {
    chrome.runtime.sendMessage({ action: 'getState' }, (resp) => {
      if (resp && resp.state) {
        state = resp.state;
        updateUI();
      } else {
        showError('Could not reach extension');
      }
    });
  }

  connectBtn.addEventListener('click', () => {
    connectBtn.disabled = true;
    chrome.runtime.sendMessage({ action: 'toggle' }, (resp) => {
      connectBtn.disabled = false;
      if (resp && resp.success) {
        state = resp.state;
        updateUI();
      } else {
        showError(resp?.error || 'Connection failed');
      }
    });
  });

  if (killSwitchCheck) {
    killSwitchCheck.addEventListener('change', () => {
      chrome.runtime.sendMessage({ action: 'setKillSwitch', enabled: killSwitchCheck.checked }, (resp) => {
        if (!resp?.success) showError('Failed to set kill switch');
      });
    });
  }

  serverSelect.addEventListener('change', () => {
    if (serverSelect.value) {
      chrome.runtime.sendMessage({
        action: 'setServer',
        server: serverSelect.value,
      }, (resp) => {
        if (!resp?.success) showError('Failed to set server');
      });
    }
  });

  protocolBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      protocolBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      chrome.runtime.sendMessage({
        action: 'setProtocol',
        protocol: btn.dataset.proto,
      }, (resp) => {
        if (!resp?.success) showError('Failed to set protocol');
      });
    });
  });

  document.getElementById('openOptions')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  });

  document.getElementById('openDashboard')?.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.storage.sync.get(['apiUrl'], (res) => {
      const base = (res.apiUrl || 'http://localhost:3000').replace(/\/+$/, '');
      chrome.tabs.create({ url: `${base}/dashboard` });
    });
  });

  serverSelect.innerHTML = '<option value="">Loading servers...</option>';

  chrome.runtime.sendMessage({ action: 'fetchServers' }, (resp) => {
    serverSelect.innerHTML = '<option value="">Auto-select server</option>';
    if (resp && resp.servers && resp.servers.length > 0) {
      resp.servers.forEach((s) => {
        const opt = document.createElement('option');
        opt.value = s.host || s.ip_address;
        opt.textContent = `📍 ${s.country || 'Unknown'} - ${s.name} (${s.load_percent ?? 0}% load)`;
        serverSelect.appendChild(opt);
      });
    } else if (resp?.error) {
      showError('Could not load servers: ' + resp.error);
    }
  });

  refreshState();
  setInterval(updateStats, 1000);
  setInterval(refreshState, 10000);
});