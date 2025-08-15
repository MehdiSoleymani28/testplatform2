
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Project, Test, Page, TestType, ApiFramework, UiFramework, UiTest, ApiTest, WebhookPayload, ApiEndpoint, ApiCollection, CreateProjectDto, CreatePageDto, CreateTestDto, CreateApiEndpointDto, UpdateApiEndpointDto, Page as PageType } from '../types';
import * as api from '../services/api';
import { useNotifications } from './NotificationContext';
import { UI_FRAMEWORKS } from '../constants';

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: Error | null;
  fetchProjects: () => void;
  addProject: (projectData: CreateProjectDto, initialPageName: string) => Promise<void>;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: number) => Promise<void>;
  getProjectById: (projectId: number) => Project | undefined;
  addTestToProject: (projectId: number, testData: (Omit<UiTest, 'id' | 'createdAt' | 'runs' | 'codeHistory' | 'status'>) | (Omit<ApiTest, 'id' | 'createdAt' | 'runs' | 'codeHistory' | 'status'>)) => Promise<void>;
  updateTestCode: (projectId: number, testId: number, newCode: string, reason: string) => void;
  runTest: (projectId: number, testId: number) => void;
  runTests: (projectId: number, testIds: number[]) => void;
  runApiCollectionTests: (projectId: number, collectionId: number) => Promise<void>;
  addPageToProject: (projectId: number, pageData: Omit<PageType, 'id'>) => Promise<void>;
  updatePageInProject: (projectId:number, updatedPage: Page) => void;
  addApiEndpoint: (projectId: number, endpointData: Omit<ApiEndpoint, 'id'>) => Promise<void>;
  updateApiEndpoint: (projectId: number, updatedEndpoint: ApiEndpoint) => void;
  deleteApiEndpoint: (projectId: number, endpointId: number) => Promise<void>;
  importApiEndpointsFromOpenApi: (projectId: number, openApiContent: string) => void;
  addApiCollection: (projectId: number, name: string, description?: string) => Promise<void>;
  updateApiCollection: (projectId: number, collection: ApiCollection) => Promise<void>;
  deleteApiCollection: (projectId: number, collectionId: number) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Helper to determine test type based on framework
const getTestType = (framework: UiFramework | ApiFramework): TestType => {
    return (UI_FRAMEWORKS as string[]).includes(framework) ? TestType.UI : TestType.API;
};

// Helper to add frontend-specific fields to tests from backend
const enrichTest = (test: Test, project: Project): Test => {
    const type = getTestType(test.framework as any);
    if (type === TestType.UI) {
        // This is a limitation: backend doesn't link tests to pages.
        // We'll associate with the first page for now.
        return { ...test, type, pageId: project.pages[0]?.id, runs: [], codeHistory: [], name: `Test ${test.id}` } as UiTest;
    } else {
         // This is a limitation: backend doesn't link tests to endpoints.
         // We can't know the endpointId here.
        return { ...test, type, endpointId: 0, runs: [], codeHistory: [], name: `Test ${test.id}` } as ApiTest;
    }
}

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { addNotification } = useNotifications();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedProjects = await api.getProjects();
      // The backend spec is simple. We may need to enrich the project objects
      // for frontend use if the mock data had fields the backend doesn't provide.
      const enrichedProjects = await Promise.all(fetchedProjects.map(async p => {
          const collections = await api.getApiCollections(p.id);
          return {
              ...p,
              tests: p.tests?.map(t => enrichTest(t as Test, p)) || [],
              // Add default values for fields not present in backend schema
              description: p.description || '',
              notificationSettings: p.notificationSettings || { emails: [], webhooks: [], failureThreshold: 80 },
              visualRegressionEnabled: p.visualRegressionEnabled || false,
              apiCollections: collections || [],
              apiAuthentication: p.apiAuthentication || { apiKey: '' },
          };
      }));
      setProjects(enrichedProjects);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const getProjectById = useCallback((projectId: number): Project | undefined => {
    return projects.find(p => p.id === projectId);
  }, [projects]);

  const addProject = async (projectData: CreateProjectDto, initialPageName: string) => {
    try {
        const newProject = await api.createProject(projectData);
        // The backend creates the project, now create the initial page
        await api.createPage({
            projectId: newProject.id,
            url: projectData.baseUrl, // Use baseUrl for the initial page
            requirements: `Initial page for ${projectData.name}`
        });
        // Refetch all projects to get the latest state
        await fetchProjects();
    } catch (e) {
        console.error("Failed to add project:", e);
        setError(e as Error);
    }
  };

  const updateProject = async (updatedProject: Project) => {
    try {
        const { id, name, baseUrl } = updatedProject;
        const updated = await api.updateProject(id, { name, baseUrl });
        setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)));
        // Note: other fields like notificationSettings would need their own API endpoints
    } catch(e) {
        console.error("Failed to update project", e);
        setError(e as Error);
    }
  };

  const deleteProject = async (projectId: number) => {
     try {
        await api.deleteProject(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch(e) {
        console.error("Failed to delete project", e);
        setError(e as Error);
    }
  };

  const addPageToProject = async (projectId: number, pageData: Omit<Page, 'id'>) => {
    try {
        // `name` is a frontend-only concept. We call the API without it.
        const newPageFromApi = await api.createPage({ url: pageData.url, requirements: pageData.requirements, projectId });
        
        // We manually update the state to include the new page with its frontend-name.
        // This avoids a refetch which would lose the name.
        const newPage: Page = {
            ...newPageFromApi,
            name: pageData.name,
            requirements: pageData.requirements,
        };
        
        setProjects(prev => prev.map(p => 
            p.id === projectId ? { ...p, pages: [...p.pages, newPage] } : p
        ));
    } catch(e) {
        console.error("Failed to add page", e);
        setError(e as Error);
    }
  };

  const updatePageInProject = async (projectId: number, updatedPage: Page) => {
    try {
        const { id, url, requirements } = updatedPage;
        await api.updatePage(id, { url, requirements });
        // Manually update the state to preserve frontend-only fields like `name`.
        setProjects(prev => prev.map(p => {
            if (p.id !== projectId) return p;
            return { ...p, pages: p.pages.map(page => page.id === id ? updatedPage : page) };
        }));
    } catch(e) {
        console.error("Failed to update page", e);
        setError(e as Error);
    }
  };

  const addTestToProject = async (projectId: number, testData: (Omit<UiTest, 'id' | 'createdAt' | 'runs' | 'codeHistory' | 'status'>) | (Omit<ApiTest, 'id' | 'createdAt' | 'runs' | 'codeHistory' | 'status'>)) => {
    try {
      const createDto: CreateTestDto = {
        framework: testData.framework,
        script: testData.code,
        projectId: projectId,
        status: 'Generated'
      };
      await api.createTest(createDto);
      await fetchProjects(); // Refetch
    } catch (e) {
       console.error("Failed to add test", e);
       setError(e as Error);
    }
  };

  const updateTestCode = (projectId: number, testId: number, newCode: string, reason: string) => {
    // This is a frontend-only feature for now to track history locally.
    // A real implementation would likely have backend support for versioning.
    setProjects(prevProjects => prevProjects.map(p => {
        if (p.id !== projectId) return p;
        
        const testIndex = p.tests.findIndex(t => t.id === testId);
        if (testIndex === -1) return p;

        const oldTest = p.tests[testIndex];
        // Create a new history entry with the *current* code before updating.
        const newHistoryEntry = {
            timestamp: new Date().toISOString(),
            code: oldTest.code,
            reason: reason || "Manual edit"
        };

        // Create the updated test object.
        const updatedTest = {
            ...oldTest,
            code: newCode,
            codeHistory: [newHistoryEntry, ...oldTest.codeHistory]
        };
        
        // Update the tests array immutably.
        const newTests = [...p.tests];
        newTests[testIndex] = updatedTest;

        // Persist the code change to the backend.
        api.updateTest(testId, { script: newCode }).catch(e => {
            console.error("Failed to update test on backend", e);
            setError(e as Error);
            // Optionally revert the state change here
        });

        return { ...p, tests: newTests };
    }));
  };

  const runTest = (projectId: number, testId: number) => {
    // The backend spec does not include an endpoint for running tests.
    // This is now a placeholder. In a real app, this would trigger a CI job
    // or call a specific "run" endpoint.
    console.log(`Placeholder: Triggering run for test ${testId} in project ${projectId}`);
    const project = projects.find(p => p.id === projectId);
    const test = project?.tests.find(t => t.id === testId);
    if(project && test) {
        addNotification({
            projectId: project.id,
            projectName: project.name,
            testId: test.id,
            testName: test.name,
            runId: `run-${Date.now()}`,
            message: `Test run for "${test.name}" has been queued (simulation).`
        });
    }
  };

  const runTests = (projectId: number, testIds: number[]) => {
      console.log(`Placeholder: Triggering batch run for ${testIds.length} tests in project ${projectId}`);
      const project = projects.find(p => p.id === projectId);
      if (project) {
        addNotification({
            projectId: project.id,
            projectName: project.name,
            testId: 0,
            testName: `Batch run of ${testIds.length} tests`,
            runId: `batch-run-${Date.now()}`,
            message: `Queued ${testIds.length} tests for execution.`
        });
        testIds.forEach(testId => runTest(projectId, testId));
      }
  };
  
  const runApiCollectionTests = async (projectId: number, collectionId: number) => {
      const project = projects.find(p => p.id === projectId);
      const collection = project?.apiCollections.find(c => c.id === collectionId);
      if (project && collection) {
          try {
              const result = await api.runApiCollection(collectionId);
              addNotification({
                  projectId: project.id,
                  projectName: project.name,
                  testId: 0,
                  testName: `Collection Run: ${collection.name}`,
                  runId: `coll-run-${Date.now()}`,
                  message: `API Collection run finished: ${result.summary.passed} passed, ${result.summary.failed} failed.`
              });
              // In a real app, you might want to refresh project data here to show new test runs.
          } catch(e) {
              console.error("Failed to run API collection", e);
              setError(e as Error);
          }
      }
  }
  
  const addApiEndpoint = async (projectId: number, endpointData: Omit<ApiEndpoint, 'id'>) => {
      try {
          // The DTO's `group` property maps to our `collectionId`
          await api.createApiEndpoint({
              method: endpointData.method,
              url: endpointData.url,
              group: endpointData.collectionId?.toString(),
              projectId,
          });
          await fetchProjects();
      } catch(e) {
          console.error("Failed to add API endpoint", e);
          setError(e as Error);
      }
  };

  const updateApiEndpoint = async (projectId: number, updatedEndpoint: ApiEndpoint) => {
      try {
          const { id, method, url, collectionId } = updatedEndpoint;
          await api.updateApiEndpoint(id, { method, url, group: collectionId?.toString() });
          await fetchProjects();
      } catch(e) {
          console.error("Failed to update API endpoint", e);
          setError(e as Error);
      }
  };

  const deleteApiEndpoint = async (projectId: number, endpointId: number) => {
       try {
          await api.deleteApiEndpoint(endpointId);
          await fetchProjects();
      } catch(e) {
          console.error("Failed to delete API endpoint", e);
          setError(e as Error);
      }
  };
  
  const addApiCollection = async (projectId: number, name: string, description?: string) => {
      try {
          await api.createApiCollection({ projectId, name, description });
          await fetchProjects();
      } catch (e) {
          console.error("Failed to add API collection", e);
          setError(e as Error);
      }
  };
  
  const updateApiCollection = async (projectId: number, updatedCollection: ApiCollection) => {
      try {
          const { id, name, description } = updatedCollection;
          await api.updateApiCollection(id, { name, description });
          await fetchProjects();
      } catch (e) {
          console.error("Failed to update API collection", e);
          setError(e as Error);
      }
  };
  
  const deleteApiCollection = async (projectId: number, collectionId: number) => {
      try {
          await api.deleteApiCollection(collectionId);
          await fetchProjects();
      } catch (e) {
          console.error("Failed to delete API collection", e);
          setError(e as Error);
      }
  };

  // --- Placeholder functions ---

  const importApiEndpointsFromOpenApi = (projectId: number, openApiContent: string) => {
      // This logic is complex and remains on the frontend.
      // After parsing, it should call `addApiEndpoint` repeatedly.
      console.log("Placeholder: OpenAPI import logic would call `addApiEndpoint` for each path.", projectId, openApiContent);
  };
  

  return (
    <ProjectContext.Provider value={{ 
        projects, loading, error, fetchProjects,
        addProject, updateProject, deleteProject, getProjectById, 
        addTestToProject, updateTestCode, runTest, runTests, runApiCollectionTests,
        addPageToProject, updatePageInProject, 
        addApiEndpoint, updateApiEndpoint, deleteApiEndpoint, importApiEndpointsFromOpenApi,
        addApiCollection, updateApiCollection, deleteApiCollection
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};