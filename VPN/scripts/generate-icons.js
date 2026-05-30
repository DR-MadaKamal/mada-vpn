const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EXTENSION_DIR = path.join(__dirname, '..', 'frontend', 'extension');
const DESKTOP_DIR = path.join(__dirname, '..', 'frontend', 'desktop');

const sizes = [16, 48, 128];
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4f46e5"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="url(#bg)"/>
  <path d="M64 20 L108 46 L108 82 L64 108 L20 82 L20 46 Z" fill="none" stroke="white" stroke-width="6" stroke-linejoin="round"/>
  <path d="M64 42 L86 56 L86 72 L64 86 L42 72 L42 56 Z" fill="white" opacity="0.9"/>
  <circle cx="64" cy="64" r="7" fill="#4f46e5"/>
</svg>`;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generatePNGs() {
  const svgPath = path.join(__dirname, '..', 'temp-icon.svg');
  fs.writeFileSync(svgPath, svgContent);

  const extIconsDir = path.join(EXTENSION_DIR, 'dist', 'icons');
  const desktopPublicDir = path.join(DESKTOP_DIR, 'public');
  ensureDir(extIconsDir);
  ensureDir(desktopPublicDir);

  for (const size of sizes) {
    const extPng = path.join(extIconsDir, `icon${size}.png`);
    const desktopPng = path.join(desktopPublicDir, `icon${size}.png`);

    try {
      execSync(
        `magick "${svgPath}" -resize ${size}x${size} "${extPng}"`,
        { stdio: 'ignore' }
      );
    } catch {
      try {
        execSync(
          `convert "${svgPath}" -resize ${size}x${size} "${extPng}"`,
          { stdio: 'ignore' }
        );
      } catch {
        console.log(`Warning: Could not generate ${size}px icon. Install ImageMagick or create PNG manually.`);
        fs.writeFileSync(extPng, Buffer.alloc(0));
      }
    }

    try {
      fs.copyFileSync(extPng, desktopPng);
    } catch {}
  }

  fs.copyFileSync(path.join(extIconsDir, 'icon128.png'), path.join(desktopPublicDir, 'icon.png'));
  fs.copyFileSync(path.join(extIconsDir, 'icon48.png'), path.join(desktopPublicDir, 'tray-icon.png'));

  fs.unlinkSync(svgPath);
  console.log('Icons generated in extension/dist/icons/ and desktop/public/');
}

generatePNGs();
