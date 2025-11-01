import { useEffect, useState } from 'react';
import { offlineService } from '../services/offlineService';

/**
 * Hook to detect offline/online status
 */
export function useOffline() {
  const [isOffline, setIsOffline] = useState(offlineService.isOffline());

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
}

/**
 * Hook to save data offline
 */
export function useOfflineSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncQueueSize, setSyncQueueSize] = useState(0);

  useEffect(() => {
    // Initialize offline service
    offlineService.initialize().then(() => {
      offlineService.startAutoSync();
    });

    // Update queue size periodically
    const interval = setInterval(async () => {
      const size = await offlineService.getSyncQueueSize();
      setSyncQueueSize(size);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const saveOffline = async (presentation: any) => {
    setIsSyncing(true);
    try {
      await offlineService.savePresentation(presentation);
      const size = await offlineService.getSyncQueueSize();
      setSyncQueueSize(size);
    } finally {
      setIsSyncing(false);
    }
  };

  const manualSync = async () => {
    setIsSyncing(true);
    try {
      await offlineService.sync();
      const size = await offlineService.getSyncQueueSize();
      setSyncQueueSize(size);
    } finally {
      setIsSyncing(false);
    }
  };

  return { saveOffline, manualSync, isSyncing, syncQueueSize };
}

