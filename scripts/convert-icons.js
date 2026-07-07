/**
 * Nagrik PWA Icon Converter
 * Converts SVG icons to PNG using sharp (already in node_modules via Next.js image optimization).
 */

const sharp = require("sharp");
const path = require("path");

const iconsDir = path.join(__dirname, "..", "public", "icons");

async function convert(size) {
  const svgPath = path.join(iconsDir, `icon-${size}.svg`);
  const pngPath = path.join(iconsDir, `icon-${size}.png`);
  await sharp(svgPath).resize(size, size).png().toFile(pngPath);
  console.log(`✓ icon-${size}.png`);
}

(async () => {
  try {
    await convert(192);
    await convert(512);
    console.log("✓ All icons generated successfully.");
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  }
})();
