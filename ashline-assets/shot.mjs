import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const outDir = 'C:\\nebula-cascade\\ashline-assets\\shots';
await mkdir(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: [
    '--enable-unsafe-webgpu',
    '--enable-webgpu-developer-features',
    '--ignore-gpu-blocklist',
    '--use-angle=d3d11',
    '--window-size=960,540',
    '--autoplay-policy=no-user-gesture-required',
  ],
});

const page = await browser.newPage();
await page.setViewport({ width: 960, height: 540, deviceScaleFactor: 1 });
page.on('console', (msg) => console.log('LOG', msg.type(), msg.text()));
page.on('pageerror', (err) => console.log('PAGEERROR', err.message));

const url = 'https://phaser.games/play/94YyjoaZ7LV?v=25&r=0';
console.log('goto', url);
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });

await page.waitForSelector('canvas', { timeout: 60000 }).catch(() => console.log('no canvas yet'));
await new Promise((r) => setTimeout(r, 24000));

const gpu = await page.evaluate(() => {
  const c = document.querySelector('canvas');
  const gl = c?.getContext?.('webgpu') || c?.getContext?.('webgl2') || c?.getContext?.('webgl');
  return {
    canvases: document.querySelectorAll('canvas').length,
    body: document.body?.innerText?.slice(0, 400) || '',
    gpu: !!navigator.gpu,
  };
});
console.log('page', JSON.stringify(gpu));

await page.screenshot({ path: `${outDir}\\title.png`, type: 'png' });
console.log('wrote title.png');

await page.mouse.click(480, 270);
await page.keyboard.press('Enter');
await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: `${outDir}\\play.png`, type: 'png' });
console.log('wrote play.png');

await page.keyboard.down('KeyC');
await new Promise((r) => setTimeout(r, 280));
await page.screenshot({ path: `${outDir}\\play-jump.png`, type: 'png' });
console.log('wrote play-jump.png');
await page.keyboard.up('KeyC');
await new Promise((r) => setTimeout(r, 400));

await page.keyboard.down('KeyC');
await new Promise((r) => setTimeout(r, 80));
await page.keyboard.up('KeyC');
await new Promise((r) => setTimeout(r, 90));
await page.keyboard.down('KeyC');
await new Promise((r) => setTimeout(r, 220));
await page.screenshot({ path: `${outDir}\\play-djump.png`, type: 'png' });
console.log('wrote play-djump.png');
await page.keyboard.up('KeyC');
await new Promise((r) => setTimeout(r, 600));

await page.keyboard.down('ArrowDown');
await new Promise((r) => setTimeout(r, 500));
await page.screenshot({ path: `${outDir}\\play-sit.png`, type: 'png' });
console.log('wrote play-sit.png');
await page.keyboard.up('ArrowDown');

await page.keyboard.down('ArrowRight');
await new Promise((r) => setTimeout(r, 2200));
await page.keyboard.up('ArrowRight');
await page.screenshot({ path: `${outDir}\\play-run.png`, type: 'png' });
console.log('wrote play-run.png');

await page.keyboard.down('ArrowDown');
await new Promise((r) => setTimeout(r, 700));
await page.screenshot({ path: `${outDir}\\play-sit-fire.png`, type: 'png' });
console.log('wrote play-sit-fire.png');
await page.keyboard.up('ArrowDown');

await browser.close();
