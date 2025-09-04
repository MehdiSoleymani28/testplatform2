import { ChunkedAiService } from './ChunkedAiService';
import { UiFramework, DomStructure } from '../types/dom';

/**
 * Service for managing test generation for UI elements with support for large pages
 */
export class TestGenerationService {
  private aiService: ChunkedAiService;

  constructor() {
    this.aiService = new ChunkedAiService();
  }

  /**
   * Generates UI tests for a page, handling both small and large pages efficiently
   */
  async generateTests(
    domStructure: DomStructure,
    framework: UiFramework = UiFramework.CYPRESS,
    onProgress?: (progress: number) => void
  ): Promise<string[]> {
    try {
      return await this.aiService.processDomStructure(
        domStructure,
        framework,
        onProgress || (() => {})
      );
    } catch (error) {
      console.error('Error generating tests:', error);
      throw new Error('Failed to generate tests: ' + (error.message || 'Unknown error'));
    }
  }
}
