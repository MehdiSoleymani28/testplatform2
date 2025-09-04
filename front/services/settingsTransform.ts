import { Setting } from './api';
import { SystemSettings } from '../types';

const transformSettingsToApi = (settings: SystemSettings): Setting[] => {
  // همه تنظیمات تغییر یافته را به آرایه تبدیل می‌کنیم
  return Object.entries(settings)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => ({
      key: String(key),
      value: value === null ? '' : String(value),
      projectId: null
    }));
};

const transformSettingsFromApi = (settings: Setting[]): SystemSettings => {
  const result: Partial<SystemSettings> = {
    maxConcurrentTests: 4, // Default value
    platformApiKey: '', // Default value
    openaiApiKey: '',
    geminiApiKey: ''
  };

  settings.forEach(setting => {
    // فقط تنظیماتی که projectId آنها null است را در نظر می‌گیریم
    if (setting.projectId === null) {
      switch (setting.key) {
        case 'maxConcurrentTests':
          result.maxConcurrentTests = parseInt(setting.value, 10);
          break;
        case 'platformApiKey':
          result.platformApiKey = setting.value;
          break;
        case 'openaiApiKey':
          result.openaiApiKey = setting.value;
          break;
        case 'geminiApiKey':
          result.geminiApiKey = setting.value;
          break;
      }
    }
  });

  return result as SystemSettings;
};

export const settingsTransformers = {
  toApi: transformSettingsToApi,
  fromApi: transformSettingsFromApi
};
