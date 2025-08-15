

import { CreateProjectDto, UpdateProjectDto, Project, Page, CreatePageDto, UpdatePageDto, Test, CreateTestDto, UpdateTestDto, DomStructure, GenerateTestsDto, ApiEndpoint, CreateApiEndpointDto, UpdateApiEndpointDto, TestType, UiFramework, ApiFramework, DomElement, UiTest, ApiCollection, ApiTest, TestRun } from "../types";

// --- MOCK DATABASE ---

let nextProjectId = 3;
let nextTestId = 300;
let nextPageId = 30;
let nextApiEndpointId = 400;
let nextApiCollectionId = 3;

let apiCollections: ApiCollection[] = [
    { id: 1, name: 'Products API', projectId: 1, description: 'APIs for managing products.'},
    { id: 2, name: 'User Management', projectId: 1, description: 'APIs for user profiles.'}
];

// This data simulates what a real backend would return.
let projects: Project[] = [
    {
        id: 1,
        name: "E-commerce Platform",
        baseUrl: "https://example-shop.com",
        createdAt: "2023-10-26T10:00:00Z",
        description: "An online store for selling digital goods.",
        pages: [
            { id: 10, name: "Homepage", url: "https://example-shop.com", requirements: "Display featured products." },
            { id: 11, name: "Login Page", url: "https://example-shop.com/login", requirements: "Allow users to log in." }
        ],
        tests: [
            {
                id: 101,
                name: "Test Homepage Load",
                type: TestType.UI,
                code: "test('should load homepage', async ({ page }) => { await page.goto('https://example-shop.com'); await expect(page).toHaveTitle(/Shop/); });",
                createdAt: "2023-10-26T11:00:00Z",
                framework: UiFramework.Playwright,
                runs: [
                    { id: 'run-1', status: 'Success', startedAt: '2023-10-27T09:00:00Z', finishedAt: '2023-10-27T09:00:15Z', duration: '15s', logs: [{timestamp: new Date().toISOString(), message: "Test passed"}]},
                    { id: 'run-2', status: 'Failure', startedAt: '2023-10-28T10:00:00Z', finishedAt: '2023-10-28T10:00:20Z', duration: '20s', logs: [{timestamp: new Date().toISOString(), message: "Assertion failed: Expected title to be 'My Shop' but got 'Example Shop'"}], screenshotUrl: 'https://picsum.photos/seed/failure1/1280/720' }
                ],
                codeHistory: [{ timestamp: new Date(Date.now() - 86400000).toISOString(), code: "test('old version', () => {})", reason: "AI Healer Suggestion"}],
                status: 'Failure',
                pageId: 10,
            },
            {
                id: 202,
                name: "Test Get Products API",
                type: TestType.API,
                code: "test('should get products', async ({ request }) => { const response = await request.get('/api/products'); expect(response.ok()).toBeTruthy(); });",
                createdAt: "2023-10-27T14:00:00Z",
                framework: ApiFramework.Jest,
                runs: [],
                codeHistory: [],
                status: 'Generated',
                endpointId: 301
            }
        ],
        notificationSettings: { emails: ['alerts@example.com'], webhooks: [], failureThreshold: 80 },
        visualRegressionEnabled: true,
        apiCollections: [], // This will be populated by API calls now
        apiEndpoints: [
            { id: 301, name: "Get All Products", method: 'GET', url: '/api/products', collectionId: 1, requirements: "Returns a list of all available products." },
            { id: 302, name: "Get User Profile", method: 'GET', url: '/api/user/profile', collectionId: 2, requirements: "Requires authentication. Returns the profile of the logged-in user." }
        ],
        apiAuthentication: { apiKey: "mock-api-key-for-ecomm" }
    },
    {
        id: 2,
        name: "SaaS Dashboard",
        baseUrl: "https://my-saas.app",
        createdAt: "2023-11-01T12:00:00Z",
        description: "A dashboard for managing user subscriptions.",
        pages: [
             { id: 20, name: "Dashboard", url: "https://my-saas.app/dashboard", requirements: "Show user stats" }
        ],
        tests: [],
        notificationSettings: { emails: [], webhooks: [], failureThreshold: 90 },
        visualRegressionEnabled: false,
        apiCollections: [],
        apiEndpoints: [],
        apiAuthentication: { apiKey: "" }
    }
];


const MOCK_DELAY = 300; // ms

// Helper to simulate network delay and asynchronous behavior
const simulateApi = <T>(callback: () => T): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // Deep copy to prevent direct state mutation
            resolve(JSON.parse(JSON.stringify(callback())));
        }, MOCK_DELAY);
    });
};

// Helper to simulate an API error
const simulateApiError = (message: string): Promise<any> => {
     return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(message));
        }, MOCK_DELAY);
    });
}

// --- Projects ---
export const getProjects = () => simulateApi(() => projects);
export const getProject = (id: number) => simulateApi(() => projects.find(p => p.id === id));

export const createProject = (data: CreateProjectDto) => simulateApi(() => {
    const newProject: Project = {
        id: nextProjectId++,
        name: data.name,
        baseUrl: data.baseUrl,
        createdAt: new Date().toISOString(),
        pages: [],
        tests: [],
        description: '',
        notificationSettings: { emails: [], webhooks: [], failureThreshold: 80 },
        visualRegressionEnabled: false,
        apiCollections: [],
        apiEndpoints: [],
        apiAuthentication: { apiKey: '' }
    };
    projects.push(newProject);
    return newProject;
});

export const updateProject = (id: number, data: UpdateProjectDto) => simulateApi(() => {
    const projectIndex = projects.findIndex(p => p.id === id);
    if (projectIndex !== -1) {
        projects[projectIndex] = { ...projects[projectIndex], ...data };
        return projects[projectIndex];
    }
    return simulateApiError("Project not found");
});

export const deleteProject = (id: number) => simulateApi(() => {
    projects = projects.filter(p => p.id !== id);
});

// --- Pages ---
export const createPage = (data: CreatePageDto) => simulateApi(() => {
    const project = projects.find(p => p.id === data.projectId);
    if (project) {
        const newPage: Page = {
            id: nextPageId++,
            url: data.url,
            requirements: data.requirements,
            name: `Page ${nextPageId}` // Name is a FE concept, but we add it for consistency. Context may overwrite.
        };
        project.pages.push(newPage);
        return newPage;
    }
    return simulateApiError("Project not found for page creation");
});

export const updatePage = (id: number, data: UpdatePageDto) => simulateApi(() => {
    for (const project of projects) {
        const pageIndex = project.pages.findIndex(p => p.id === id);
        if (pageIndex !== -1) {
            project.pages[pageIndex] = { ...project.pages[pageIndex], ...data };
            return project.pages[pageIndex];
        }
    }
    return simulateApiError("Page not found");
});

export const deletePage = (id: number) => simulateApi(() => {
     for (const project of projects) {
        project.pages = project.pages.filter(p => p.id !== id);
    }
});

// --- Tests ---
export const createTest = (data: CreateTestDto) => simulateApi(() => {
    const project = projects.find(p => p.id === data.projectId);
    if (project) {
        const newTest: Partial<Test> = {
            id: nextTestId++,
            code: data.script,
            framework: data.framework as any,
            createdAt: new Date().toISOString(),
            status: data.status || 'Generated',
            runs: [],
            codeHistory: [],
            name: `Test ${nextTestId}`
        };
        project.tests.push(newTest as Test);
        return newTest as Test;
    }
    return simulateApiError("Project not found for test creation");
});

export const updateTest = (id: number, data: UpdateTestDto) => simulateApi(() => {
    for (const project of projects) {
        const testIndex = project.tests.findIndex(t => t.id === id);
        if (testIndex !== -1) {
            const updatedTest = { ...project.tests[testIndex] };
            if (data.script) updatedTest.code = data.script;
            if (data.status) updatedTest.status = data.status;
            project.tests[testIndex] = updatedTest;
            return updatedTest;
        }
    }
    return simulateApiError("Test not found");
});

export const deleteTest = (id: number) => simulateApi(() => {
    for (const project of projects) {
        project.tests = project.tests.filter(t => t.id !== id);
    }
});

// --- API Endpoints ---
export const createApiEndpoint = (data: CreateApiEndpointDto) => simulateApi(() => {
    const project = projects.find(p => p.id === data.projectId);
    if (project) {
        const newEndpoint: ApiEndpoint = {
            id: nextApiEndpointId++,
            method: data.method as ApiEndpoint['method'],
            url: data.url,
            collectionId: data.group ? parseInt(data.group, 10) : undefined,
            name: `Endpoint ${nextApiEndpointId}`, // FE will provide real name
            requirements: data.requirements,
        };
        project.apiEndpoints.push(newEndpoint);
        return newEndpoint;
    }
    return simulateApiError("Project not found for API endpoint creation");
});

export const updateApiEndpoint = (id: number, data: UpdateApiEndpointDto) => simulateApi(() => {
    for (const project of projects) {
        const endpointIndex = project.apiEndpoints.findIndex(e => e.id === id);
        if (endpointIndex !== -1) {
            const endpointToUpdate = project.apiEndpoints[endpointIndex];
            
            // Separate properties that need special handling to avoid type errors
            const { method, group, ...restData } = data;
            
            // Spread the safe properties
            const updatedEndpoint: ApiEndpoint = { ...endpointToUpdate, ...restData };

            // Handle `method` with correct type casting
            if (method) {
                updatedEndpoint.method = method as ApiEndpoint['method'];
            }
            
            // Handle `group` to `collectionId` mapping
            if ('group' in data) {
                updatedEndpoint.collectionId = group ? parseInt(group, 10) : undefined;
            }

            project.apiEndpoints[endpointIndex] = updatedEndpoint;
            return updatedEndpoint;
        }
    }
    return simulateApiError("API endpoint not found");
});

export const deleteApiEndpoint = (id: number) => simulateApi(() => {
    for (const project of projects) {
        project.apiEndpoints = project.apiEndpoints.filter(e => e.id !== id);
    }
});

// --- API Collections ---
export const getApiCollections = (projectId: number) => simulateApi(() => apiCollections.filter(c => c.projectId === projectId));

export const createApiCollection = (data: {projectId: number, name: string, description?: string}) => simulateApi(() => {
    const newCollection: ApiCollection = {
        id: nextApiCollectionId++,
        projectId: data.projectId,
        name: data.name,
        description: data.description || '',
    };
    apiCollections.push(newCollection);
    return newCollection;
});

export const updateApiCollection = (id: number, data: {name?: string, description?: string}) => simulateApi(() => {
    const collectionIndex = apiCollections.findIndex(c => c.id === id);
    if (collectionIndex !== -1) {
        apiCollections[collectionIndex] = { ...apiCollections[collectionIndex], ...data };
        return apiCollections[collectionIndex];
    }
    return simulateApiError("API Collection not found");
});

export const deleteApiCollection = (id: number) => simulateApi(() => {
    // Also remove from any endpoints using it
    projects.forEach(proj => {
        proj.apiEndpoints.forEach(ep => {
            if (ep.collectionId === id) {
                ep.collectionId = undefined;
            }
        });
    });
    apiCollections = apiCollections.filter(c => c.id !== id);
});

export const runApiCollection = (id: number) => simulateApi(() => {
    const collection = apiCollections.find(c => c.id === id);
    if (!collection) return simulateApiError("Collection not found");

    const project = projects.find(p => p.id === collection.projectId);
    if (!project) return simulateApiError("Project not found for collection");

    const endpointsInCollection = project.apiEndpoints.filter(ep => ep.collectionId === id);
    const testsToRun = project.tests.filter(t => t.type === TestType.API && endpointsInCollection.some(ep => ep.id === (t as ApiTest).endpointId));
    
    let passed = 0;
    let failed = 0;
    
    // This is a simulation; we'll just randomly pass/fail
    testsToRun.forEach(test => {
        const isSuccess = Math.random() > 0.3;
        if (isSuccess) passed++; else failed++;
        const newRun: TestRun = {
             id: `run-${Date.now()}-${test.id}`,
             status: isSuccess ? 'Success' : 'Failure',
             startedAt: new Date().toISOString(),
             finishedAt: new Date(Date.now() + 500).toISOString(),
             duration: '0.5s',
             logs: [{timestamp: new Date().toISOString(), message: `Simulated run: ${isSuccess ? 'Passed' : 'Failed'}`}]
        };
        // Mutate the mock DB to add the run
        const projectDb = projects.find(p => p.id === collection.projectId)!;
        const testDb = projectDb.tests.find(t => t.id === test.id)!;
        testDb.runs.unshift(newRun);
    });

    return {
        collectionId: id,
        summary: { total: testsToRun.length, passed, failed },
        results: [] // Not mocking individual results for brevity
    };
});

// --- AI / Scanner / Generator ---
export const scanUrl = (url: string) => simulateApi<DomStructure>(() => {
    if (!url || !url.startsWith('http')) {
        throw new Error("Please enter a valid, full URL (including http:// or https://).");
    }
    const mockElements: DomElement[] = [
        { type: 'button', text: 'Login', actionability: 'Clickable', id: 'login-btn', class: 'btn btn-primary' },
        { type: 'input', id: 'username', actionability: 'Typable', class: 'form-control' },
        { type: 'input', id: 'password', actionability: 'Typable', class: 'form-control' },
        { type: 'a', text: 'Forgot Password', actionability: 'Clickable', class: 'link' },
        { type: 'h1', text: 'Welcome!', actionability: 'Static' }
    ];
    return {
        url,
        elements: mockElements,
        accessibilityIssues: [
            { severity: "Minor", message: "Image missing alt text", elementSelector: "img.logo" },
            { severity: "Serious", message: "Button text is not descriptive", elementSelector: "button.btn-icon" }
        ]
    };
});

export const generateTests = (data: GenerateTestsDto) => simulateApi<{ tests: string[] }>(() => {
    const testScript = `
test('Generated ${data.framework} test for ${data.elements.length} elements', async ({ page }) => {
  ${data.elements
    .filter(el => el.actionability !== 'Static')
    .map(el => {
      const selector = el.id ? `#${el.id}` : el.text ? `text=${JSON.stringify(el.text)}` : `.${(el.class || '').split(' ')[0]}`;
      if (el.actionability === 'Clickable') {
        return `await page.locator('${selector}').click();`;
      }
      if (el.actionability === 'Typable') {
        return `await page.locator('${selector}').fill('mock value');`;
      }
      return '';
  }).join('\n  ')}
  
  // Assert a final state
  await expect(page).toHaveURL(/dashboard/);
});
`;
    return { tests: [testScript] };
});

export const generateApiTest = (endpoint: ApiEndpoint, project: Project) => simulateApi<{ script: string }>(() => {
    const { method, url, name, requirements } = endpoint;
    const authHeader = project.apiAuthentication.apiKey ? `    'Authorization': 'Bearer ${project.apiAuthentication.apiKey}',\n` : '';
    
    let scenarioComment = '// No specific requirements provided. Generating a basic success-case test.';
    let scenarioAssertion = '';

    if (requirements) {
        scenarioComment = `// Test generated based on the following requirement:
// "${requirements.replace(/\n/g, '\n// ')}"`;
        if (requirements.toLowerCase().includes('404')) {
            scenarioAssertion = `
    // Based on requirements, we expect a 404 for this scenario
    expect(response.statusCode).toBe(404);`;
        } else {
             scenarioAssertion = `
    // Assert status code is in the 2xx range
    expect(response.statusCode).toBeGreaterThanOrEqual(200);
    expect(response.statusCode).toBeLessThan(300);`;
        }
    } else {
         scenarioAssertion = `
    // Assert status code is in the 2xx range
    expect(response.statusCode).toBeGreaterThanOrEqual(200);
    expect(response.statusCode).toBeLessThan(300);`;
    }

    const script = `
const request = require('supertest');
const app = '${project.baseUrl}'; // Using project's base URL

describe('API Test for ${name}', () => {
  test('should return a successful response for ${method} ${url}', async () => {
    ${scenarioComment}
    const response = await request(app)
      .${method.toLowerCase()}('${url.startsWith('/') ? url : '/' + url}')
      .set({
${authHeader}        'Content-Type': 'application/json'
      });
      // .send({ ... }); // Add .send() for POST/PUT if bodySchema is defined
    
    ${scenarioAssertion}

    // Assert response body contains expected properties based on schema
    // e.g., expect(response.body).toHaveProperty('id');
  });
});
`;
    return { script };
});

// --- Settings (Not persisted in mock) ---
export const getSettings = () => simulateApi(() => ({}));
export const updateSettings = (settings: any) => simulateApi(() => settings);