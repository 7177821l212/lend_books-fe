/**
 * Generates all required Expo icon PNGs from icon.svg using sharp-cli.
 * Run: node assets/generate-icons.mjs
 */
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const svg = join(__dir, 'icon.svg');

const outputs = [
  { file: join(__dir, 'icon.png'),          size: 1024 },
  { file: join(__dir, 'adaptive-icon.png'), size: 1024 },
  { file: join(__dir, 'favicon.png'),       size: 48   },
];

for (const { file, size } of outputs) {
  execSync(
    `npx sharp-cli --input "${svg}" --output "${file}" resize ${size} ${size}`,
    { stdio: 'inherit' }
  );
  console.log(`✓ ${file} (${size}×${size})`);
}

// Splash: white background, icon centred at 256px on 1284×2778
const splashSvg = readFileSync(svg, 'utf8')
  .replace('width="1024" height="1024"', 'width="256" height="256"');
const splashSvgPath = join(__dir, '_splash_icon.svg');
writeFileSync(splashSvgPath, splashSvg);

execSync(
  `npx sharp-cli --input "${splashSvgPath}" --output "${join(__dir, 'splash.png')}" ` +
  `resize 256 256 extend 514 1129 514 513 "#ffffff"`,
  { stdio: 'inherit' }
);
console.log(`✓ ${join(__dir, 'splash.png')} (1284×2778)`);
execSync(`rm "${splashSvgPath}"`);
