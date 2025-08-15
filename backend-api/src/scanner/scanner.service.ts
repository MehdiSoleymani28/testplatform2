import { Injectable } from '@nestjs/common';
import { ScanUrlDto, ScanResult, ScanResultElement } from './scanner.dto';
import { chromium } from 'playwright';

@Injectable()
export class ScannerService {
  async scanUrl(dto: ScanUrlDto): Promise<ScanResult> {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(dto.url, { waitUntil: 'domcontentloaded' });

    // Extract all elements with their properties
    const elements: ScanResultElement[] = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('*'));
      return all.map(el => {
        const rect = el.getBoundingClientRect();
        return {
          type: el.tagName.toLowerCase(),
          id: el.id || undefined,
          class: el.className || undefined,
          text: el.textContent?.trim() || undefined,
          actionability: {
            isVisible: rect.width > 0 && rect.height > 0,
            isClickable: typeof (el as any).onclick === 'function' || el.tagName.toLowerCase() === 'button',
          },
        };
      });
    });

    await browser.close();
    return {
      url: dto.url,
      elements,
    };
  }
}
