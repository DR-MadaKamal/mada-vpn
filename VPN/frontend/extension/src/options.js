document.addEventListener('DOMContentLoaded', () => {
  function loadSettings() {
    chrome.storage.sync.get(['apiUrl'], (items) => {
      if (items.apiUrl) document.getElementById('apiUrl').value = items.apiUrl;
    });
  }

  document.getElementById('saveBtn').addEventListener('click', () => {
    const apiUrl = document.getElementById('apiUrl').value.trim();
    if (!apiUrl) {
      const msg = document.getElementById('statusMsg');
      msg.className = 'status info';
      msg.textContent = 'Please enter an API Server URL';
      setTimeout(() => { msg.className = 'status'; }, 3000);
      return;
    }
    chrome.storage.sync.set({ apiUrl: apiUrl.replace(/\/+$/, '') }, () => {
      const msg = document.getElementById('statusMsg');
      msg.className = 'status success';
      msg.textContent = 'Settings saved! Reload the extension popup to apply.';
      setTimeout(() => { msg.className = 'status'; }, 3000);
    });
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    chrome.storage.sync.clear(() => {
      loadSettings();
      const msg = document.getElementById('statusMsg');
      msg.className = 'status info';
      msg.textContent = 'Reset to defaults';
      setTimeout(() => { msg.className = 'status'; }, 3000);
    });
  });

  loadSettings();
});