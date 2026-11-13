import {mkdir} from 'node:fs/promises';
import sharp from 'sharp';

// Saved user-selected concept 1. Preserve its transparent background and margins.
await mkdir('extension/icons', {recursive: true});
for (const size of [16, 32, 48, 128]) {
  await sharp('assets/icon-plush.png')
    .resize(size, size, {fit: 'contain', kernel: 'lanczos3', background: '#00000000'})
    .png()
    .toFile(`extension/icons/${size}.png`);
}
console.log('Generated plush icons: 16, 32, 48 and 128 px.');
