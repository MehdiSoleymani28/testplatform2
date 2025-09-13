import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'https://novinaihub.ir';
const OUT_DIR = process.env.OUT_DIR || path.resolve('./scan-output');
const MAX_PAGES = parseInt(process.env.MAX_PAGES || '50', 10);
const MAX_DEPTH = parseInt(process.env.MAX_DEPTH || '2', 10);

function normalizeUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    u.hash = '';
    // drop trailing slash consistency
    const s = u.toString().replace(/\/$/, '');
    return s;
  } catch {
    return null;
  }
}

function isSameOrigin(urlStr, origin) {
  try {
    const u = new URL(urlStr);
    return u.origin === origin;
  } catch {
    return false;
  }
}

function toFileSafe(name) {
  return name.replace(/[^a-z0-9_-]+/gi, '-').replace(/-+/g, '-').toLowerCase().slice(0,120);
}

async function ensureDir(p) {
  await fs.promises.mkdir(p, { recursive: true });
}

async function main() {
  const base = new URL(BASE_URL);
  const origin = base.origin;
  await ensureDir(OUT_DIR);
  const shotDir = path.join(OUT_DIR, 'screenshots');
  await ensureDir(shotDir);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'PlaywrightScanner/1.0 (+https://github.com/openai/codex)'
  });

  const queue = [{ url: normalizeUrl(BASE_URL), depth: 0 }];
  const visited = new Set();
  const results = [];

  while (queue.length && visited.size < MAX_PAGES) {
    const { url, depth } = queue.shift();
    if (!url || visited.has(url)) continue;
    visited.add(url);

    const page = await context.newPage();

    const consoleMsgs = [];
    const reqFailures = [];

    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        consoleMsgs.push({ type, text: msg.text() });
      }
    });
    page.on('requestfailed', req => {
      reqFailures.push({ url: req.url(), errorText: req.failure()?.errorText });
    });

    let response, status = null, title = null, error = null;
    try {
      response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      status = response ? response.status() : null;
      title = await page.title();

      // Screenshot
      const urlObj = new URL(url);
      const slug = toFileSafe((urlObj.pathname === '/' ? 'home' : urlObj.pathname) + (urlObj.search || '')) || 'page';
      const shotPath = path.join(shotDir, `${slug}.png`);
      await page.screenshot({ path: shotPath, fullPage: true });

      // Extract links
      let links = await page.$$eval('a[href]', as => as.map(a => a.getAttribute('href')));
      links = links
        .map(href => {
          try {
            return new URL(href, url).toString();
          } catch { return null; }
        })
        .filter(Boolean)
        .map(h => normalizeUrl(h))
        .filter(Boolean)
        .filter(h => !h.startsWith('mailto:') && !h.startsWith('tel:') && !h.startsWith('javascript:'))
        .filter(h => isSameOrigin(h, origin));

      // queue next depth
      if (depth < MAX_DEPTH) {
        for (const l of links) {
          if (!visited.has(l) && !queue.find(q => q.url === l)) {
            queue.push({ url: l, depth: depth + 1 });
          }
        }
      }

      results.push({
        url,
        status,
        title,
        depth,
        console: consoleMsgs,
        requestFailures: reqFailures,
        screenshot: path.relative(OUT_DIR, shotPath)
      });
    } catch (e) {
      error = String(e?.message || e);
      results.push({ url, depth, error, console: consoleMsgs, requestFailures: reqFailures });
    } finally {
      await page.close();
    }
  }

  // Write outputs
  const reportPath = path.join(OUT_DIR, 'report.json');
  const sitemapPath = path.join(OUT_DIR, 'sitemap.txt');
  await fs.promises.writeFile(reportPath, JSON.stringify({
    scannedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    maxPages: MAX_PAGES,
    maxDepth: MAX_DEPTH,
    pages: results
  }, null, 2));
  const urls = results.map(r => r.url).filter(Boolean);
  await fs.promises.writeFile(sitemapPath, urls.join('\n'));

  // quick summary to stdout
  const ok = results.filter(r => (r.status && r.status < 400));
  const bad = results.filter(r => (r.status && r.status >= 400) || r.error);
  console.log(JSON.stringify({ total: results.length, ok: ok.length, issues: bad.length, outDir: OUT_DIR }, null, 2));

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});