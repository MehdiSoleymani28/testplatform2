
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { SystemSettings } from '../types';
import * as api from '../services/api';

interface SettingsContextType {
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  regeneratePlatformApiKey: () => void;
}

const SETTINGS_STORAGE_KEY = 'ai-test-platform-settings';

const defaultSettings: SystemSettings = {
    maxConcurrentTests: 2,
    platformApiKey: '',
};

const getInitialSettings = (): SystemSettings => {
    try {
        const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (storedSettings) {
            const parsed = JSON.parse(storedSettings);
            const finalSettings = { ...defaultSettings, ...parsed };
            if (!finalSettings.platformApiKey) {
                finalSettings.platformApiKey = `aitp-key-${crypto.randomUUID()}`;
            }
            return finalSettings;
        }
    } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
    }
    return { ...defaultSettings, platformApiKey: `aitp-key-${crypto.randomUUID()}`};
};


const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(getInitialSettings);

  useEffect(() => {
    // We still use localStorage for non-sensitive settings like maxConcurrentTests.
    // Sensitive keys would be fetched from the backend on-demand and not stored here.
    try {
        const settingsToStore = {
            maxConcurrentTests: settings.maxConcurrentTests,
            platformApiKey: settings.platformApiKey
        };
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsToStore));
    } catch (error) {
        console.error("Failed to save settings to localStorage", error);
    }
  }, [settings]);

  // In a real app, you might fetch settings from the backend here.
  // useEffect(() => {
  //   api.getSettings().then(backendSettings => {
  //     setSettings(prev => ({ ...prev, ...backendSettings }));
  //   }).catch(err => console.error("Could not fetch backend settings", err));
  // }, []);


  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    // In a real app, this would also push updates to the backend.
    // api.updateSettings(updatedSettings).catch(err => console.error("Failed to save settings to backend", err));
  };

  const regeneratePlatformApiKey = () => {
    const newKey = `aitp-key-${crypto.randomUUID()}`;
    updateSettings({ platformApiKey: newKey });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, regeneratePlatformApiKey }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
