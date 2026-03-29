import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSchoolData } from './DataContext';

interface Settings {
  schoolName: string;
  logoUrl: string | null;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { data } = useSchoolData();

  const [settings, setSettings] = useState<Settings>(() => {
    // Try to load from local storage first (offline mode fallback)
    const saved = localStorage.getItem('appSettings');
    if (saved) {
       try {
         return JSON.parse(saved);
       } catch (e) {
         // Failed to parse settings from local storage - using defaults
       }
    }
    // Default school name
    return {
      schoolName: 'SM KONVEN ST. URSULA',
      logoUrl: null,
    };
  });

  // Update school name when data loads
  useEffect(() => {
    if (data?.metadata?.sekolah) {
      setSettings(prev => ({
        ...prev,
        schoolName: data.metadata.sekolah,
      }));
    }
  }, [data?.metadata?.sekolah]);

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
