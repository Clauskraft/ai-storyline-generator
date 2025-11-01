/**
 * Version History Service
 * Tracks changes and enables recovery of presentation versions
 */

export interface PresentationVersion {
  id: string;
  presentationId: string;
  version: number;
  slides: any[]; // Slide data
  brandKit?: any;
  metadata: {
    createdAt: number;
    createdBy?: string;
    changeDescription?: string;
    slideCount: number;
  };
}

export interface ChangeSummary {
  added: number;
  removed: number;
  modified: number;
  reordered: boolean;
}

class VersionHistoryService {
  private versions: Map<string, PresentationVersion[]> = new Map();
  private readonly maxVersions = 50; // Keep last 50 versions per presentation

  constructor() {
    this.loadVersions();
  }

  private generateVersionId(): string {
    return `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadVersions(): void {
    try {
      const saved = localStorage.getItem('presentation_versions');
      if (saved) {
        const data = JSON.parse(saved);
        Object.entries(data).forEach(([presentationId, versions]: [string, any]) => {
          this.versions.set(presentationId, versions);
        });
      }
    } catch (error) {
      console.error('Failed to load versions:', error);
    }
  }

  private saveVersions(): void {
    try {
      const data: Record<string, PresentationVersion[]> = {};
      this.versions.forEach((versions, presentationId) => {
        data[presentationId] = versions;
      });
      localStorage.setItem('presentation_versions', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save versions:', error);
    }
  }

  /**
   * Save a version of a presentation
   */
  public saveVersion(
    presentationId: string,
    slides: any[],
    brandKit?: any,
    changeDescription?: string
  ): PresentationVersion {
    const existingVersions = this.versions.get(presentationId) || [];
    const newVersionNumber = existingVersions.length > 0 
      ? Math.max(...existingVersions.map(v => v.version)) + 1
      : 1;

    const version: PresentationVersion = {
      id: this.generateVersionId(),
      presentationId,
      version: newVersionNumber,
      slides: JSON.parse(JSON.stringify(slides)), // Deep copy
      brandKit: brandKit ? JSON.parse(JSON.stringify(brandKit)) : undefined,
      metadata: {
        createdAt: Date.now(),
        changeDescription,
        slideCount: slides.length,
      },
    };

    const updatedVersions = [...existingVersions, version];
    
    // Keep only last N versions
    if (updatedVersions.length > this.maxVersions) {
      updatedVersions.shift();
    }

    this.versions.set(presentationId, updatedVersions);
    this.saveVersions();

    return version;
  }

  /**
   * Get all versions for a presentation
   */
  public getVersions(presentationId: string): PresentationVersion[] {
    return this.versions.get(presentationId) || [];
  }

  /**
   * Get a specific version
   */
  public getVersion(presentationId: string, version: number): PresentationVersion | undefined {
    const versions = this.versions.get(presentationId) || [];
    return versions.find(v => v.version === version);
  }

  /**
   * Get the latest version
   */
  public getLatestVersion(presentationId: string): PresentationVersion | undefined {
    const versions = this.versions.get(presentationId) || [];
    return versions.length > 0 ? versions[versions.length - 1] : undefined;
  }

  /**
   * Restore a version (creates new version with restored data)
   */
  public restoreVersion(
    presentationId: string,
    version: number
  ): PresentationVersion {
    const versionToRestore = this.getVersion(presentationId, version);
    if (!versionToRestore) {
      throw new Error(`Version ${version} not found`);
    }

    return this.saveVersion(
      presentationId,
      versionToRestore.slides,
      versionToRestore.brandKit,
      `Restored from version ${version}`
    );
  }

  /**
   * Compare two versions and get change summary
   */
  public compareVersions(
    presentationId: string,
    version1: number,
    version2: number
  ): ChangeSummary {
    const v1 = this.getVersion(presentationId, version1);
    const v2 = this.getVersion(presentationId, version2);

    if (!v1 || !v2) {
      throw new Error('One or both versions not found');
    }

    const slideIds1 = new Set(v1.slides.map(s => s.id));
    const slideIds2 = new Set(v2.slides.map(s => s.id));

    const added = v2.slides.filter(s => !slideIds1.has(s.id)).length;
    const removed = v1.slides.filter(s => !slideIds2.has(s.id)).length;

    let modified = 0;
    slideIds1.forEach(id => {
      if (slideIds2.has(id)) {
        const slide1 = v1.slides.find(s => s.id === id);
        const slide2 = v2.slides.find(s => s.id === id);
        if (JSON.stringify(slide1) !== JSON.stringify(slide2)) {
          modified++;
        }
      }
    });

    // Check if reordered
    const order1 = v1.slides.map(s => s.id);
    const order2 = v2.slides.map(s => s.id);
    const reordered = JSON.stringify(order1) !== JSON.stringify(order2);

    return {
      added,
      removed,
      modified,
      reordered,
    };
  }

  /**
   * Delete old versions (keep only last N)
   */
  public cleanupVersions(presentationId: string, keepCount: number = this.maxVersions): void {
    const versions = this.versions.get(presentationId) || [];
    if (versions.length > keepCount) {
      const trimmed = versions.slice(-keepCount);
      this.versions.set(presentationId, trimmed);
      this.saveVersions();
    }
  }

  /**
   * Delete all versions for a presentation
   */
  public deleteAllVersions(presentationId: string): void {
    this.versions.delete(presentationId);
    this.saveVersions();
  }

  /**
   * Get version statistics
   */
  public getVersionStats(presentationId: string): {
    totalVersions: number;
    oldestVersion: number | undefined;
    newestVersion: number | undefined;
    storageSize: number;
  } {
    const versions = this.versions.get(presentationId) || [];
    const versionNumbers = versions.map(v => v.version);

    return {
      totalVersions: versions.length,
      oldestVersion: versionNumbers.length > 0 ? Math.min(...versionNumbers) : undefined,
      newestVersion: versionNumbers.length > 0 ? Math.max(...versionNumbers) : undefined,
      storageSize: JSON.stringify(versions).length,
    };
  }
}

// Export singleton instance
export const versionHistoryService = new VersionHistoryService();

