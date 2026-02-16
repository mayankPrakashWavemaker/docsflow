"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getVersions, getVersionDetails } from './actions';
import { sortVersions } from '@/lib/utils/version';

interface TechStackContextType {
  versions: string[];
  selectedVersion: string | null;
  selectedData: any | null;
  isLoading: boolean;
  isLoadingDetails: boolean;
  error: string | null;
  setSelectedVersion: (version: string) => void;
  refreshVersions: () => Promise<void>;
  hasSelectedDocUpdate: boolean;
  incomingUpdate: any | null;
  clearUpdateNotification: () => void;
  loadLatestSelectedData: () => Promise<void>;
}

const TechStackContext = createContext<TechStackContextType | undefined>(undefined);

// This helps prevent duplicate listeners if the component remounts but remains in memory.
export function TechStackProvider({ children }: { children: React.ReactNode }) {
  const [versions, setVersions] = useState<string[]>([]);
  const [selectedVersion, setSelectedVersionState] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Real-time states
  const [incomingUpdate, setIncomingUpdate] = useState<any | null>(null);
  const selectedVersionRef = useRef<string | null>(null);

  const fetchVersions = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const rawVersions = await getVersions();
      const sorted = sortVersions(rawVersions, true);
      setVersions(sorted);
      
      if (sorted.length > 0 && !selectedVersionRef.current) {
        setSelectedVersion(sorted[0]);
      }
    } catch (err) {
      setError("Failed to load versions");
      console.error(err);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, []);

  const fetchDetails = useCallback(async (version: string) => {
    setIsLoadingDetails(true);
    try {
      const details = await getVersionDetails(version);
      setSelectedData(details);
      setIncomingUpdate(null); // Reset update status when loading new/latest data
    } catch (err) {
      console.error(`Failed to load details for ${version}`, err);
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  const setSelectedVersion = (version: string) => {
    setSelectedVersionState(version);
    selectedVersionRef.current = version;
    fetchDetails(version);
  };

  const loadLatestSelectedData = async () => {
    if (selectedVersion) {
      await fetchDetails(selectedVersion);
    }
  };

  const clearUpdateNotification = () => {
    setIncomingUpdate(null);
  };

  // Initial Fetch
  useEffect(() => {
    fetchVersions(true);
  }, [fetchVersions]);

  // Real-time connection (SSE)
  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | undefined = undefined;

    const connect = () => {
      console.log("SSE: Connecting to MongoDB Live Listener...");
      es = new EventSource('/api/tech-stack/watch');

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("SSE [Update]:", data);

          if (data.type === 'connected') return;

          // Type of change: insert, update, replace, delete
          if (data.type === 'insert' || data.type === 'delete') {
             fetchVersions(false);
          }

          if (data.type === 'update' || data.type === 'replace') {
            if (data.version === selectedVersionRef.current) {
              setIncomingUpdate(data);
            }
            fetchVersions(false);
          }
        } catch (e) {
          console.error("SSE: Failed to parse message", e);
        }
      };

      es.onerror = (err) => {
        console.error("SSE: Connection error (waiting for auto-reconnect)...", err);
        // We don't close() here to allow browser auto-reconnect
        // But if it stays dead, we might want to force a new one after a while
      };
    };

    connect();

    return () => {
      console.log("SSE: Cleaning up connection");
      if (es) es.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [fetchVersions, selectedVersion]); // Add selectedVersion to re-evaluate ref if needed, though strictly ref is enough

  return (
    <TechStackContext.Provider value={{
      versions,
      selectedVersion,
      selectedData,
      isLoading,
      isLoadingDetails,
      error,
      setSelectedVersion,
      refreshVersions: () => fetchVersions(false),
      hasSelectedDocUpdate: !!incomingUpdate,
      incomingUpdate,
      clearUpdateNotification,
      loadLatestSelectedData
    }}>
      {children}
    </TechStackContext.Provider>
  );
}

export function useTechStack() {
  const context = useContext(TechStackContext);
  if (context === undefined) {
    throw new Error('useTechStack must be used within a TechStackProvider');
  }
  return context;
}
