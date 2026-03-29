import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchSchoolData, SchoolData } from '../lib/dataService';

interface DataContextType {
  data: SchoolData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SchoolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>( null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const schoolData = await fetchSchoolData();
      setData(schoolData);
    } catch (err: any) {
      setError(err.message || 'Failed to load school data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <DataContext.Provider value={{ data, isLoading, error, refresh: loadData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useSchoolData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useSchoolData must be used within a DataProvider');
  }
  return context;
}
