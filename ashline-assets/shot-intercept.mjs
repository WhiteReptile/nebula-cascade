import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const kit = 'C:\\nebula-cascade\\ashline-assets\\megakit';
const files = {
  'Building_Small_1.glb': fs.readFileSync(`${kit}\\Building_Small_1.glb`),
  'Building_Medium_2.glb': fs.readFileSync(`${kit}\\Building_Medium_2.glb`),
  'Building_Large_2.glb': fs.readFileSync(`${kit}\\Building_Large_2.glb`),
  'ashline-bldg-s.png': fs.readFileSync(`${kit}\\Building_Small_1.glb`),
};

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: [
    '--enable-unsafe-webgpu',
    '--enable-webgpu-developer-features',
    '--ignore-gpu-blocklist',
    '--use-angle=d3d11',
    '--window-size=960,540',
  ],
});

const page = await browser.newPage();
await page.setViewport({ width: 960, height: 540, deviceScaleFactor: 1 });
await page.setRequestInterception(true);
page.on('request', (request) => {
  const url = request.url();
  for (const [name, body] of Object.entries(files)) {
    if (url.includes(name)) {
      console.log('serve', name, body.length);
      request.respond({
        status: 200,
        contentType: 'model/gltf-binary',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Cache-Control': 'no-store',
        },
        body,
      });
      return;
    }
  }
  request.continue();
});
page.on('console', (m) => console.log('LOG', m.type(), m.text().slice(0, 220)));
page.on('pageerror', (e) => console.log('ERR', e.message));
page.on('response', (r) => {
  if (r.status() >= 400) console.log('HTTP', r.status(), r.url().slice(0, 160));
});

const url = 'https://phaser.games/play/94YyjoaZ7LV?v=12&r=0';
console.log('goto', url);
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForSelector('canvas', { timeout: 60000 });
console.log('waiting for city GLBs…');
await new Promise((r) => setTimeout(r, 22000));
await page.screenshot({ path: 'C:\\nebula-cascade\\ashline-assets\\shots\\title.png' });
console.log('title written');

const canvas = await page.$('canvas');
if (canvas) await canvas.click();
await page.keyboard.press('Space');
await new Promise((r) => setTimeout(r, 8000));
await page.screenshot({ path: 'C:\\nebula-cascade\\ashline-assets\\shots\\play.png' });
console.log('play written');

await page.keyboard.down('ArrowRight');
await new Promise((r) => setTimeout(r, 1800));
await page.keyboard.up('ArrowRight');
await page.screenshot({ path: 'C:\\nebula-cascade\\ashline-assets\\shots\\play-run.png' });
console.log('play-run written');

await browser.close();
