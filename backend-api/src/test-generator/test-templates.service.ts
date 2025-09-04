import { Injectable } from '@nestjs/common';
import { ScanResultElement } from '../scanner/scanner.dto';

@Injectable()
export class TestTemplatesService {
  generatePlaywrightTest(element: ScanResultElement, index: number, requirements?: string): string {
    const selector = this.getSelector(element);
    const requirementsNote = requirements ? `// Requirements: ${requirements}\n` : '';

    return `${requirementsNote}// Test for ${element.type} ${element.id ? `id=${element.id}` : ''}
import { test, expect } from '@playwright/test';

test('Test element ${index + 1}: ${selector}', async ({ page }) => {
  await page.goto('YOUR_URL_HERE');
  const element = await page.locator('${selector}');
  await expect(element).toBeVisible();
  ${element.actionability?.isClickable ? 'await element.click();' : ''}
  // Add more assertions as needed
});`;
  }

  generateSeleniumTest(element: ScanResultElement, index: number, requirements?: string): string {
    const selector = this.getSelector(element);
    const requirementsNote = requirements ? `// Requirements: ${requirements}\n` : '';

    return `${requirementsNote}// Test for ${element.type} ${element.id ? `id=${element.id}` : ''}
const { Builder, By, until } = require('selenium-webdriver');

describe('Test element ${index + 1}: ${selector}', () => {
  let driver;

  beforeEach(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  afterEach(async () => {
    await driver.quit();
  });

  it('should interact with element', async () => {
    await driver.get('YOUR_URL_HERE');
    const element = await driver.wait(until.elementLocated(By.css('${selector}')), 10000);
    await driver.wait(until.elementIsVisible(element), 10000);
    ${element.actionability?.isClickable ? 'await element.click();' : ''}
    // Add more assertions as needed
  });
});`;
  }

  generateCypressTest(element: ScanResultElement, index: number, requirements?: string): string {
    const selector = this.getSelector(element);
    const requirementsNote = requirements ? `// Requirements: ${requirements}\n` : '';

    return `${requirementsNote}// Test for ${element.type} ${element.id ? `id=${element.id}` : ''}
describe('Test element ${index + 1}: ${selector}', () => {
  it('should interact with element', () => {
    cy.visit('YOUR_URL_HERE');
    cy.get('${selector}').should('be.visible');
    ${element.actionability?.isClickable ? "cy.get('${selector}').click();" : ''}
    // Add more assertions as needed
  });
});`;
  }

  private getSelector(element: ScanResultElement): string {
    if (element.id) return `#${element.id}`;
    if (element.class) return `.${element.class.split(' ').join('.')}`;
    return element.type;
  }
}
