import { Injectable } from '@nestjs/common';
import { GenerateTestsDto, GenerateTestsResult } from './test-generator.dto';
import { ScannerAdapterService } from './scanner-adapter.service';
import { TestTemplatesService } from './test-templates.service';

@Injectable()
export class TestGeneratorService {
  constructor(
    private readonly scannerAdapter: ScannerAdapterService,
    private readonly templates: TestTemplatesService,
  ) {}

  async generate(dto: GenerateTestsDto): Promise<GenerateTestsResult> {
    const adaptedElements = this.scannerAdapter.adaptScanResults(dto.elements);
    const framework = this.normalizeFramework(dto.framework);

    if (!adaptedElements || adaptedElements.length === 0) {
      return { tests: ["// Please provide elements to generate tests for"] };
    }

    const tests = adaptedElements.map((el, idx) => {
      switch (framework) {
        case 'playwright':
        case 'playwright-test':
          return this.templates.generatePlaywrightTest(el as any, idx, dto.requirements);
        case 'selenium':
        case 'webdriverjs':
          return this.templates.generateSeleniumTest(el as any, idx, dto.requirements);
        case 'cypress':
          return this.templates.generateCypressTest(el as any, idx, dto.requirements);
        default:
          return `// Unknown framework: ${framework}. Supported: playwright, selenium/webdriverjs, cypress.`;
      }
    });

    return { tests };
  }

  private normalizeFramework(value?: string): 'playwright' | 'selenium' | 'webdriverjs' | 'cypress' | string {
    const raw = (value || 'playwright').toLowerCase().trim();
    if (raw.includes('playwright')) return 'playwright';
    if (raw.includes('cypress')) return 'cypress';
    if (raw.includes('selenium')) return 'selenium';
    if (raw.includes('webdriver')) return 'selenium';
    if (raw === 'pw') return 'playwright';
    return raw;
  }
}
