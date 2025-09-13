import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

type PageRecord = {
  url: string;
  status?: number | null;
  title?: string | null;
  depth?: number;
};

type Report = {
  pages: PageRecord[];
};

function loadUrls(limit?: number): string[] {
  const reportPath = path.resolve(__dirname, '..', 'scan-output', 'report.json');
  if (!fs.existsSync(reportPath)) {
    throw new Error(`report.json not found at ${reportPath}. Run scan.mjs first.`);
  }
  const raw = fs.readFileSync(reportPath, 'utf-8');
  const data = JSON.parse(raw) as Report;
  let urls = (data.pages || [])
    .map(p => p.url)
    .filter(Boolean);

  // Deduplicate
  urls = Array.from(new Set(urls));

  const envLimit = process.env.TEST_URL_LIMIT ? parseInt(process.env.TEST_URL_LIMIT, 10) : undefined;
  const finalLimit = limit ?? envLimit;
  if (finalLimit && finalLimit > 0) {
    urls = urls.slice(0, finalLimit);
  }
  return urls;
}

const urls = loadUrls();

// Basic per-page checks derived from crawl:
// - Navigates successfully (status < 400)
// - No console errors
// - No request failures
// - Title is non-empty
for (const url of urls) {
  test.describe(`Page: ${url}`, () => {
    test(`loads without HTTP error`, async ({ page }) => {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
      expect(response, 'No response returned').toBeTruthy();
      const status = response!.status();
      expect(status, `Unexpected HTTP status ${status} for ${url}`).toBeLessThan(400);
    });

    test(`has no console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      expect(errors, `Console errors on ${url}:\n${errors.join('\n')}`).toHaveLength(0);
    });

    test(`has no failed network requests`, async ({ page }) => {
      const failures: string[] = [];
      page.on('requestfailed', (req) => {
        failures.push(`${req.url()} :: ${req.failure()?.errorText}`);
      });
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      expect(failures, `Failed requests on ${url}:\n${failures.join('\n')}`).toHaveLength(0);
    });

    test(`has non-empty title`, async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const title = await page.title();
      expect(title?.trim().length, `Empty <title> on ${url}`).toBeGreaterThan(0);
    });
  });
}