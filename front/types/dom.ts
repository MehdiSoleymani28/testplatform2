export enum UiFramework {
  Cypress = 'cypress',
  Playwright = 'playwright',
  Selenium = 'selenium'
}

export interface DomElement {
  id?: string;
  tagName: string;
  className?: string;
  text?: string;
  type?: string;
  container?: string;
  attributes?: Record<string, string>;
  children?: DomElement[];
  actionability: {
    clickable: boolean;
    visible: boolean;
    inputtable: boolean;
  };
}

export interface DomStructure {
  elements: DomElement[];
  url: string;
  title?: string;
  accessibilityIssues?: Array<{
    type: string;
    message: string;
    element?: DomElement;
  }>;
}
