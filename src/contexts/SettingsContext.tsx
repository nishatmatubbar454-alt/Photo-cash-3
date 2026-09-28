import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../data/defaults';
import { syncSettingsToFirebase, subscribeToSettings } from '../services/firebaseSync';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'socialcash_app_settings_v1';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load settings from storage', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Local storage caching
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to storage', e);
    }
  }, [settings]);

  // Subscribe to real-time global settings from Firebase (photo-cash-30b8c)
  // Ensures changes made by Admin instantly apply to all devices worldwide!
  useEffect(() => {
    const unsubscribe = subscribeToSettings((remoteSettings) => {
      if (remoteSettings && Object.keys(remoteSettings).length > 0) {
        setSettings((prev) => ({
          ...prev,
          ...remoteSettings,
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      // Push to Firebase (photo-cash-30b8c) so all devices get the new rules/keys
      syncSettingsToFirebase(updated);
      return updated;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    syncSettingsToFirebase(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
