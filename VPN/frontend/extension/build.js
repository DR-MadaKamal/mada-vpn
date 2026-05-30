const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const PUBLIC = path.join(__dirname, 'public');
const SRC = path.join(__dirname, 'src');

if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true });
}
fs.mkdirSync(path.join(DIST, 'icons'), { recursive: true });

fs.copyFileSync(path.join(SRC, 'background.js'), path.join(DIST, 'background.js'));
fs.copyFileSync(path.join(SRC, 'popup.js'), path.join(DIST, 'popup.js'));
fs.copyFileSync(path.join(SRC, 'options.js'), path.join(DIST, 'options.js'));
fs.copyFileSync(path.join(__dirname, 'manifest.json'), path.join(DIST, 'manifest.json'));
fs.copyFileSync(path.join(PUBLIC, 'popup.html'), path.join(DIST, 'popup.html'));
fs.copyFileSync(path.join(PUBLIC, 'options.html'), path.join(DIST, 'options.html'));

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4f46e5"/><stop offset="100%" stop-color="#7c3aed"/></linearGradient></defs>
  <rect width="128" height="128" rx="28" fill="url(#bg)"/>
  <path d="M64 20 L108 46 V82 L64 108 L20 82 V46 Z" fill="none" stroke="white" stroke-width="6" stroke-linejoin="round"/>
  <path d="M64 42 L86 56 V72 L64 86 L42 72 V56 Z" fill="white" opacity="0.9"/>
  <circle cx="64" cy="64" r="7" fill="#4f46e5"/>
</svg>`;
fs.writeFileSync(path.join(DIST, 'icons', 'icon.svg'), iconSvg);

for (const size of [16, 48, 128]) {
  fs.writeFileSync(path.join(DIST, 'icons', `icon${size}.png`), Buffer.alloc(0));
}

console.log(`Extension built: ${DIST}`);
