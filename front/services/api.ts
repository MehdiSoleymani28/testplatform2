import { CreateProjectDto, UpdateProjectDto, Project, Page, CreatePageDto, UpdatePageDto, Test, CreateTestDto, UpdateTestDto, DomStructure, GenerateTestsDto, ApiEndpoint, CreateApiEndpointDto, UpdateApiEndpointDto, TestType, UiFramework, ApiFramework, DomElement, UiTest, ApiCollection, ApiTest, TestRun } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function for API calls
const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return response.json();
};

// --- Projects ---
export const getProjects = (): Promise<Project[]> => 
  apiRequest<Project[]>('/projects');

export const getProject = (id: number): Promise<Project> => 
  apiRequest<Project>(`/projects/${id}`);

export const createProject = (data: CreateProjectDto): Promise<Project> => 
  apiRequest<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateProject = (id: number, data: UpdateProjectDto): Promise<Project> => 
  apiRequest<Project>(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteProject = (id: number): Promise<void> => 
  apiRequest<void>(`/projects/${id}`, {
    method: 'DELETE',
  });

// --- Pages ---
export const createPage = (data: CreatePageDto): Promise<Page> => 
  apiRequest<Page>('/pages', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updatePage = (id: number, data: UpdatePageDto): Promise<Page> => 
  apiRequest<Page>(`/pages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deletePage = (id: number): Promise<void> => 
  apiRequest<void>(`/pages/${id}`, {
    method: 'DELETE',
  });

// --- Tests ---
export const createTest = (data: CreateTestDto): Promise<Test> => 
  apiRequest<Test>('/tests', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateTest = (id: number, data: UpdateTestDto): Promise<Test> => 
  apiRequest<Test>(`/tests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteTest = (id: number): Promise<void> => 
  apiRequest<void>(`/tests/${id}`, {
    method: 'DELETE',
  });

// --- API Endpoints ---
export const createApiEndpoint = (data: CreateApiEndpointDto): Promise<ApiEndpoint> => 
  apiRequest<ApiEndpoint>('/api-endpoints', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateApiEndpoint = (id: number, data: UpdateApiEndpointDto): Promise<ApiEndpoint> => 
  apiRequest<ApiEndpoint>(`/api-endpoints/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteApiEndpoint = (id: number): Promise<void> => 
  apiRequest<void>(`/api-endpoints/${id}`, {
    method: 'DELETE',
  });

// --- API Collections ---
export const getApiCollections = (projectId: number): Promise<ApiCollection[]> => 
  apiRequest<ApiCollection[]>(`/api-collections?projectId=${projectId}`);

export const createApiCollection = (data: {projectId: number, name: string, description?: string}): Promise<ApiCollection> => 
  apiRequest<ApiCollection>('/api-collections', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateApiCollection = (id: number, data: {name?: string, description?: string}): Promise<ApiCollection> => 
  apiRequest<ApiCollection>(`/api-collections/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteApiCollection = (id: number): Promise<void> => 
  apiRequest<void>(`/api-collections/${id}`, {
    method: 'DELETE',
  });

export const runApiCollection = (id: number): Promise<{collectionId: number, summary: {total: number, passed: number, failed: number}, results: any[]}> => 
  apiRequest(`/api-collections/${id}/run`, {
    method: 'POST',
  });

// --- AI / Scanner / Generator ---
export const scanUrl = (url: string): Promise<DomStructure> => 
  apiRequest<DomStructure>('/scanner/scan', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });

export const generateTests = (data: GenerateTestsDto): Promise<{ tests: string[] }> => 
  apiRequest<{ tests: string[] }>('/test-generator/generate', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const generateApiTest = (endpoint: ApiEndpoint, project: Project): Promise<{ script: string }> => 
  apiRequest<{ script: string }>('/test-generator/generate-api', {
    method: 'POST',
    body: JSON.stringify({ endpoint, project }),
  });

// --- Settings ---
export const getSettings = (): Promise<any> => 
  apiRequest<any>('/settings');

export const updateSettings = (settings: any): Promise<any> => 
  apiRequest<any>('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
