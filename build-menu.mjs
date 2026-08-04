/**
 * Genera site/menu/menu-ruby-pizza.pdf a partir de site/menu/menu.html.
 *
 *   node build-menu.mjs            (usa http://localhost:4321)
 *   node build-menu.mjs <base-url>
 *
 * Requiere que el sitio esté servido (las rutas de fuentes e imágenes son
 * absolutas) y puppeteer-core apuntando al Chrome del sistema.
 */
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const base = process.argv[2] || 'http://localhost:4321';
const here = dirname(fileURLToPath(import.meta.url));
const out  = join(here, 'site', 'menu', 'menu-ruby-pizza.pdf');

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none'],
});

const page = await browser.newPage();
await page.goto(`${base}/menu/menu.html`, { waitUntil: 'networkidle0', timeout: 60000 });
await page.evaluateHandle('document.fonts.ready');

await page.pdf({
  path: out,
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});

console.log(`✓ ${out}`);
await browser.close();
