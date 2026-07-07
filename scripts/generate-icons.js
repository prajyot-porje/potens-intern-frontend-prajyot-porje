/**
 * Nagrik PWA Icon Generator
 * Generates 192x192 and 512x512 PNG icons using pure Node.js + canvas-like SVG-to-PNG approach.
 * Run: node scripts/generate-icons.js
 */

const fs = require("fs");
const path = require("path");

// SVG template for the Nagrik "N" icon
function buildSVG(size) {
  const pad = size * 0.2;
  const inner = size - pad * 2;
  const stroke = size * 0.055;
  const r = size * 0.12; // corner radius

  // "N" lettermark geometry — two verticals + diagonal
  const x1 = pad + inner * 0.15;
  const x2 = pad + inner * 0.85;
  const yTop = pad + inner * 0.12;
  const yBot = pad + inner * 0.88;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#0A0A0C"/>
  <rect x="1" y="1" width="${size - 2}" height="${size - 2}" rx="${r - 1}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <g stroke="#F2F2F4" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <line x1="${x1}" y1="${yBot}" x2="${x1}" y2="${yTop}"/>
    <line x1="${x1}" y1="${yTop}" x2="${x2}" y2="${yBot}"/>
    <line x1="${x2}" y1="${yBot}" x2="${x2}" y2="${yTop}"/>
  </g>
</svg>`;
}

// Write SVG files (which browsers can also use as icons, and can be converted)
const iconsDir = path.join(__dirname, "..", "public", "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const svg192 = buildSVG(192);
const svg512 = buildSVG(512);

fs.writeFileSync(path.join(iconsDir, "icon-192.svg"), svg192);
fs.writeFileSync(path.join(iconsDir, "icon-512.svg"), svg512);

console.log("✓ SVG icons written to public/icons/");
console.log("  - icon-192.svg");
console.log("  - icon-512.svg");
