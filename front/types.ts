

// Base DTOs from OpenAPI Spec
export interface CreateProjectDto {
  name: string;
  baseUrl: string;
}
export interface UpdateProjectDto {
  name?: string;
  baseUrl?: string;
}
export interface CreatePageDto {
    url: string;
    requirements?: string;
    projectId: number;
}
export interface UpdatePageDto {
    url?: string;
    requirements?: string;
}
export interface CreateTestDto {
    framework: string;
    script: string;
    status?: string;
    projectId: number;
}
export interface UpdateTestDto {
    framework?: string;
    script?: string;
    status?: string;
}
export interface CreateApiEndpointDto {
    method: string;
    url: string;
    group?: string;
    projectId: number;
    requirements?: string;
}
export interface UpdateApiEndpointDto {
    method?: string;
    url?: string;
    group?: string;
    requirements?: string;
}
export interface ScanUrlDto {
    url: string;
}
export interface GenerateTestsDto {
    elements: DomElement[];
    framework: string;
}


// Frontend Data Models (aligned with backend)
export interface Notification {
  id: string;
  projectId: number;
  projectName: string;
  testId: number;
  testName: string;
  runId: string;
  timestamp: string;
  read: boolean;
  message: string;
}

export interface NotificationSettings {
  emails: string[];
  webhooks: string[];
  failureThreshold: number; // e.g., 80, for 80%
}

export interface TestRunLog {
  timestamp: string;
  message: string;
}

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint in ms
  lcp: number; // Largest Contentful Paint in ms
  loadTime: number; // Total page load time in ms
}

export interface TestRun {
  id:string;
  status: 'Queued' | 'Running' | 'Success' | 'Failure';
  startedAt: string | null;
  finishedAt: string | null;
  duration: string | null;
  logs: TestRunLog[];
  screenshotUrl?: string; // For failures
  diffScreenshotUrl?: string; // For visual regression failures
  performanceMetrics?: PerformanceMetrics; // For UI tests
}

export interface Page {
  id: number;
  name: string; // Not in backend schema, but useful for UI
  url: string;
  requirements?: string;
}

export interface ApiCollection {
  id: number;
  name: string;
  description?: string;
  projectId: number;
}

export interface ApiEndpoint {
  id: number;
  name: string; // Not in backend schema, but useful for UI
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: string; // JSON string
  bodySchema?: string; // JSON string
  collectionId?: number;
  requirements?: string;
}

export interface ApiAuthentication {
    apiKey: string;
}

export interface Project {
  id: number;
  name: string;
  baseUrl: string;
  pages: Page[];
  description?: string;
  createdAt: string;
  tests: Test[];
  notificationSettings: NotificationSettings;
  visualRegressionEnabled: boolean;
  apiCollections: ApiCollection[];
  apiEndpoints: ApiEndpoint[];
  apiAuthentication: ApiAuthentication;
}

export enum TestType {
    UI = "UI",
    API = "API",
}

// NOTE: The backend Test schema is simple. We create a discriminated union
// on the frontend for better UI rendering and logic, and map to the simple
// backend schema when creating/updating.
export interface BaseTest {
  id: number;
  name: string; // Not in backend schema, but useful for UI.
  code: string; // 'script' in backend
  createdAt: string;
  runs: TestRun[];
  codeHistory: { timestamp: string; code: string; reason: string }[];
  status: string; // Backend has this
}

export interface UiTest extends BaseTest {
  type: TestType.UI;
  pageId: number;
  framework: UiFramework;
  baselineScreenshotUrl?: string;
}

export interface ApiTest extends BaseTest {
  type: TestType.API;
  endpointId: number;
  framework: ApiFramework;
}

export type Test = UiTest | ApiTest;

export interface DomElement {
  type: string;
  id?: string;
  class?: string;
  text?: string;
  actionability: 'Clickable' | 'Typable' | 'Static';
}

export interface AccessibilityIssue {
  severity: 'Critical' | 'Serious' | 'Moderate' | 'Minor';
  message: string;
  elementSelector: string; // A CSS selector to identify the problematic element
}

// Corresponds to backend ScanResult
export interface DomStructure {
  url:string;
  elements: DomElement[];
  accessibilityIssues: AccessibilityIssue[];
}

export enum UiFramework {
  Playwright = "Playwright (JavaScript)",
  Cypress = "Cypress (JavaScript)",
  Gherkin = "Gherkin (Cucumber)",
  Selenium = "Selenium (WebDriverJS)",
}

export enum ApiFramework {
  Jest = "Jest (JavaScript/fetch)",
  MochaChai = "Mocha & Chai (JavaScript)",
  PythonRequests = "Python (requests)",
}

// NOTE: This feature is not directly supported by the backend spec,
// but is kept for potential future use or local simulation.
export enum Intent {
  Login = "Login Scenario",
  FormSubmission = "Form Submission",
  ButtonInteraction = "Button/Link Interaction",
  Navigation = "Navigation Validation",
  DataDisplay = "Data Display Validation",
  AccessibilityValidation = "Accessibility Compliance",
}

// This is no longer needed as the backend abstracts the AI provider.
// export enum ModelProvider {
//   Gemini = "Gemini (Google)",
//   OpenAI = "OpenAI (Coming Soon)",
// }

export interface StoryAnalysisResult {
  testScript: string;
  analysisNotes: string;
}

// This interface is now simplified as the backend handles AI calls.
export interface AiService {
  generateDomJsonFromUrl(pageUrl: string): Promise<DomStructure>;
  generateTestScript(elements: DomElement[], framework: UiFramework): Promise<string[]>;
  generateApiTestScript(endpoint: ApiEndpoint, project: Project): Promise<string>;
}

export interface SystemSettings {
  // API keys are now managed by the backend.
  // We keep this object for other system-wide settings.
  maxConcurrentTests: number;
  platformApiKey: string; // This is the key for our app's own API
}

export interface WebhookPayload {
  projectId: number;
  projectName: string;
  testId: number;
  testName: string;
  testType: TestType;
  runId: string;
  status: 'Success' | 'Failure';
  startedAt: string | null;
  finishedAt: string | null;
  duration: string | null;
  logs: TestRunLog[];
  reportUrl: string; // A deep link to the report
  screenshotUrl?: string;
  diffScreenshotUrl?: string;
}