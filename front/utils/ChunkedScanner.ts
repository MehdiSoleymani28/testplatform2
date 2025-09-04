import { Injectable } from '@nestjs/common';
import { DomElement } from '../types';
import * as api from '../services/api';

const CHUNK_SIZE = 20; // Maximum elements per chunk

export class ChunkedScanner {
  private elements: DomElement[] = [];
  
  constructor() {}

  /**
   * Breaks down a large list of DOM elements into manageable chunks
   */
  public chunkElements(elements: DomElement[]): DomElement[][] {
    const chunks: DomElement[][] = [];
    for (let i = 0; i < elements.length; i += CHUNK_SIZE) {
      chunks.push(elements.slice(i, i + CHUNK_SIZE));
    }
    return chunks;
  }

  /**
   * Groups related elements together for more meaningful test generation
   */
  public groupRelatedElements(elements: DomElement[]): DomElement[][] {
    const groups: DomElement[][] = [];
    let currentGroup: DomElement[] = [];

    elements.forEach(element => {
      // Start a new group if:
      // 1. Current group is empty
      // 2. Element is a container (form, section, etc.)
      // 3. Current group is at capacity
      if (currentGroup.length === 0 || 
          this.isContainer(element) ||
          currentGroup.length >= CHUNK_SIZE) {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
        }
        currentGroup = [element];
      } else {
        currentGroup.push(element);
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  private isContainer(element: DomElement): boolean {
    const containerTags = ['form', 'section', 'article', 'div', 'main', 'nav'];
    return containerTags.includes(element.type.toLowerCase());
  }
}
