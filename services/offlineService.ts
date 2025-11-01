/**
 * Offline Service
 * Enables offline functionality and sync
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineDatabase extends DBSchema {
  presentations: {
    key: string;
    value: any;
    indexes: { 'by-updated': number };
  };
  slides: {
    key: string;
    value: any;
    indexes: { 'by-presentation': string };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      type: string;
      operation: 'create' | 'update' | 'delete';
      data: any;
      timestamp: number;
    };
    indexes: { 'by-timestamp': number };
  };
}

class OfflineService {
  private db: IDBPDatabase<OfflineDatabase> | null = null;
  private syncInProgress = false;

  /**
   * Initialize IndexedDB
   */
  public async initialize(): Promise<void> {
    try {
      this.db = await openDB<OfflineDatabase>('ai-storyline-offline', 1, {
        upgrade(db) {
          // Presentations store
          if (!db.objectStoreNames.contains('presentations')) {
            const presentationStore = db.createObjectStore('presentations', {
              keyPath: 'id',
            });
            presentationStore.createIndex('by-updated', 'updatedAt');
          }

          // Slides store
          if (!db.objectStoreNames.contains('slides')) {
            const slideStore = db.createObjectStore('slides', {
              keyPath: 'id',
            });
            slideStore.createIndex('by-presentation', 'presentationId');
          }

          // Sync queue store
          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncStore = db.createObjectStore('syncQueue', {
              keyPath: 'id',
            });
            syncStore.createIndex('by-timestamp', 'timestamp');
          }
        },
      });
      
      console.log('✅ Offline database initialized');
    } catch (error) {
      console.error('Failed to initialize offline database:', error);
    }
  }

  /**
   * Check if offline
   */
  public isOffline(): boolean {
    return !navigator.onLine;
  }

  /**
   * Save presentation offline
   */
  public async savePresentation(presentation: any): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const tx = this.db.transaction('presentations', 'readwrite');
    await tx.store.put({
      ...presentation,
      updatedAt: Date.now(),
      offline: true,
    });
    await tx.done;

    // Add to sync queue
    await this.addToSyncQueue('presentation', 'update', presentation);
  }

  /**
   * Get all offline presentations
   */
  public async getPresentations(): Promise<any[]> {
    if (!this.db) {
      await this.initialize();
    }

    if (!this.db) {
      return [];
    }

    const tx = this.db.transaction('presentations', 'readonly');
    return await tx.store.getAll();
  }

  /**
   * Get presentation by ID
   */
  public async getPresentation(id: string): Promise<any | undefined> {
    if (!this.db) {
      await this.initialize();
    }

    if (!this.db) {
      return undefined;
    }

    const tx = this.db.transaction('presentations', 'readonly');
    return await tx.store.get(id);
  }

  /**
   * Add to sync queue
   */
  private async addToSyncQueue(type: string, operation: 'create' | 'update' | 'delete', data: any): Promise<void> {
    if (!this.db) {
      return;
    }

    const tx = this.db.transaction('syncQueue', 'readwrite');
    await tx.store.put({
      id: `${type}_${Date.now()}_${Math.random()}`,
      type,
      operation,
      data,
      timestamp: Date.now(),
    });
    await tx.done;
  }

  /**
   * Sync all pending changes when online
   */
  public async sync(): Promise<void> {
    if (this.isOffline() || this.syncInProgress) {
      return;
    }

    if (!this.db) {
      await this.initialize();
    }

    if (!this.db) {
      return;
    }

    this.syncInProgress = true;

    try {
      const tx = this.db.transaction('syncQueue', 'readonly');
      const queueItems = await tx.store.getAll();

      for (const item of queueItems) {
        try {
          // Try to sync item
          await this.syncItem(item);
          
          // Remove from queue if successful
          const deleteTx = this.db.transaction('syncQueue', 'readwrite');
          await deleteTx.store.delete(item.id);
          await deleteTx.done;
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          // Keep in queue for retry
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync a single item
   */
  private async syncItem(item: any): Promise<void> {
    // In production, this would make API calls to sync with server
    console.log('Syncing item:', item);
    
    // For now, just simulate success
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Get sync queue size
   */
  public async getSyncQueueSize(): Promise<number> {
    if (!this.db) {
      return 0;
    }

    const tx = this.db.transaction('syncQueue', 'readonly');
    const items = await tx.store.getAll();
    return items.length;
  }

  /**
   * Clear offline data
   */
  public async clear(): Promise<void> {
    if (!this.db) {
      return;
    }

    const tx = this.db.transaction(['presentations', 'slides', 'syncQueue'], 'readwrite');
    await Promise.all([
      tx.objectStore('presentations').clear(),
      tx.objectStore('slides').clear(),
      tx.objectStore('syncQueue').clear(),
    ]);
    await tx.done;
  }

  /**
   * Start auto-sync when online
   */
  public startAutoSync(): void {
    window.addEventListener('online', () => {
      console.log('Online - starting sync');
      this.sync();
    });

    // Also sync periodically when online
    setInterval(() => {
      if (!this.isOffline() && !this.syncInProgress) {
        this.sync();
      }
    }, 60000); // Every minute
  }
}

// Export singleton instance
export const offlineService = new OfflineService();

