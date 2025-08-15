
import { UiFramework, Intent, ApiFramework } from './types';

export const UI_FRAMEWORKS = Object.values(UiFramework);
export const API_FRAMEWORKS = Object.values(ApiFramework);
export const INTENTS = Object.values(Intent);
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
