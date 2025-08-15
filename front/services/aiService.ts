
import { AiService, DomStructure, UiFramework, DomElement, ApiEndpoint, Project } from "../types";
import * as api from './api';
import { createAiError } from "../utils/errorUtils";

const aiService: AiService = {
    async generateDomJsonFromUrl(pageUrl: string): Promise<DomStructure> {
        try {
            // The backend now handles the AI interaction for scanning.
            const result = await api.scanUrl(pageUrl);
            return result;
        } catch (error) {
            throw createAiError(error, "URL Scanning");
        }
    },
    async generateTestScript(elements: DomElement[], framework: UiFramework): Promise<string[]> {
        try {
            // The backend now handles the AI interaction for test generation.
            const result = await api.generateTests({ elements, framework });
            // The backend returns an array of test strings.
            return result.tests;
        } catch (error) {
             throw createAiError(error, "Test Generation");
        }
    },
    async generateApiTestScript(endpoint: ApiEndpoint, project: Project): Promise<string> {
        try {
            // This is a mock implementation as the backend spec does not define
            // an endpoint for API test generation.
            const result = await api.generateApiTest(endpoint, project);
            return result.script;
        } catch (error) {
            throw createAiError(error, "API Test Generation");
        }
    },
};

export default aiService;