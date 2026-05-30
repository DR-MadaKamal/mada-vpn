document.addEventListener('DOMContentLoaded', () => {
  function loadSettings() {
    chrome.storage.sync.get([
      'apiToken', 'autoLogin', 'defaultProtocol', 'customServer',
      'dnsLeakProtection', 'killSwitch', 'ipLeakProtection'
    ], (items) => {
      if (items.apiToken) document.getElementById('apiToken').value = items.apiToken;
      document.getElementById('autoLogin').checked = items.autoLogin || false;
      if (items.defaultProtocol) document.getElementById('defaultProtocol').value = items.defaultProtocol;
      if (items.customServer) document.getElementById('customServer').value = items.customServer;
      document.getElementById('dnsLeakProtection').checked = items.dnsLeakProtection !== false;
      document.getElementById('killSwitch').checked = items.killSwitch !== false;
      document.getElementById('ipLeakProtection').checked = items.ipLeakProtection !== false;
    });
  }

  document.getElementById('saveBtn').addEventListener('click', () => {
    const settings = {
      apiToken: document.getElementById('apiToken').value,
      autoLogin: document.getElementById('autoLogin').checked,
      defaultProtocol: document.getElementById('defaultProtocol').value,
      customServer: document.getElementById('customServer').value,
      dnsLeakProtection: document.getElementById('dnsLeakProtection').checked,
      killSwitch: document.getElementById('killSwitch').checked,
      ipLeakProtection: document.getElementById('ipLeakProtection').checked,
    };

    chrome.storage.sync.set(settings, () => {
      const msg = document.getElementById('statusMsg');
      msg.className = 'status success';
      msg.textContent = 'Settings saved successfully!';
      setTimeout(() => { msg.className = 'status'; }, 3000);
    });
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    chrome.storage.sync.clear(() => {
      loadSettings();
      const msg = document.getElementById('statusMsg');
      msg.className = 'status info';
      msg.textContent = 'Settings reset to defaults';
      setTimeout(() => { msg.className = 'status'; }, 3000);
    });
  });

  loadSettings();
});
