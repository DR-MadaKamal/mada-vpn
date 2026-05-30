document.addEventListener('DOMContentLoaded', () => {
  const serverList = document.getElementById('serverList');
  const errorEl = document.getElementById('errorMsg');

  function getDashboardUrl(cb) {
    chrome.storage.sync.get(['apiUrl'], (res) => {
      const base = (res.apiUrl || 'https://website-ebon-three-59.vercel.app').replace(/\/+$/, '');
      cb(base);
    });
  }

  function openDashboard() {
    getDashboardUrl((base) => chrome.tabs.create({ url: `${base}/dashboard` }));
  }

  document.getElementById('openDashboardBtn').addEventListener('click', (e) => {
    e.preventDefault();
    openDashboard();
  });

  document.getElementById('openDashboard').addEventListener('click', (e) => {
    e.preventDefault();
    openDashboard();
  });

  document.getElementById('openOptions')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  });

  function showError(msg) {
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
      setTimeout(() => { errorEl.style.display = 'none'; }, 4000);
    }
  }

  serverList.innerHTML = '<div style="text-align:center;padding:20px;color:#64748b;font-size:13px;">Loading servers...</div>';

  chrome.runtime.sendMessage({ action: 'fetchServers' }, (resp) => {
    if (resp && resp.servers && resp.servers.length > 0) {
      const servers = resp.servers;
      serverList.innerHTML = '';
      servers.forEach((s) => {
        const div = document.createElement('div');
        div.className = 'server-item';
        const loadColor = s.load_percent < 50 ? '#22c55e' : s.load_percent < 80 ? '#eab308' : '#ef4444';
        div.innerHTML = `
          <div>
            <div class="name">${s.country} — ${s.name}</div>
            <div class="load">${s.city || ''} • ${s.connected_clients}/${s.max_clients} clients</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="load-bar"><div class="fill" style="width:${s.load_percent}%;background:${loadColor};"></div></div>
            <span style="font-size:11px;color:${loadColor};">${s.load_percent}%</span>
          </div>
        `;
        div.addEventListener('click', () => openDashboard());
        serverList.appendChild(div);
      });
    } else {
      serverList.innerHTML = '<div style="text-align:center;padding:20px;color:#64748b;font-size:13px;">Could not load servers</div>';
    }
  });
});