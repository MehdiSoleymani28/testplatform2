import { ChunkedScanner } from '../utils/ChunkedScanner';
import { DomElement, DomStructure, UiFramework } from '../types/dom';
import * as api from './api';
import { sleep } from '../utils/sleep';

export class ChunkedAiService {
  private scanner: ChunkedScanner;
  
  constructor() {
    this.scanner = new ChunkedScanner();
  }

  async generateTestsForLargePage(
    elements: DomElement[], 
    framework: UiFramework, 
    onChunkComplete: (progress: number) => void
  ): Promise<string[]> {
    // Group related elements together
    const chunks = this.scanner.groupRelatedElements(elements);
    const allTests: string[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        // Generate tests for this chunk
        const testsForChunk = await api.generateTests({
          elements: chunk,
          framework: framework.toString()
        });

        allTests.push(...testsForChunk.tests);

        // Report progress
        const progress = Math.round(((i + 1) / chunks.length) * 100);
        onChunkComplete(progress);

        // Add a small delay to avoid overwhelming the API
        await sleep(500);
        
      } catch (error) {
        console.error(`Error processing chunk ${i + 1}:`, error);
        // Continue with next chunk instead of failing completely
      }
    }

    return allTests;
  }

  /**
   * Process a DOM structure in chunks with progress updates
   */
  async processDomStructure(
    structure: DomStructure,
    framework: UiFramework,
    onProgress: (progress: number) => void
  ): Promise<string[]> {
    if (!structure.elements || structure.elements.length === 0) {
      return [];
    }

    // If the page is small enough, process it directly
    if (structure.elements.length <= 20) {
      const result = await api.generateTests({
        elements: structure.elements,
        framework: framework.toString()
      });
      onProgress(100);
      return result.tests;
    }

    // Otherwise, process in chunks
    return this.generateTestsForLargePage(
      structure.elements,
      framework,
      onProgress
    );
  }
}
