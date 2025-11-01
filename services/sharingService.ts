/**
 * Sharing Service
 * Handles presentation sharing, permissions, and public links
 */

export interface ShareLink {
  id: string;
  presentationId: string;
  token: string;
  permissions: 'view' | 'edit';
  expiresAt?: number;
  created: number;
  accessCount: number;
  passwordProtected: boolean;
}

export interface ShareSettings {
  public: boolean;
  requiresPassword: boolean;
  password?: string;
  allowEdit: boolean;
  expiresIn?: number; // days
  trackViews: boolean;
}

class SharingService {
  private shares: Map<string, ShareLink> = new Map();

  constructor() {
    this.loadShares();
  }

  private generateToken(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }

  private generateId(): string {
    return `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadShares(): void {
    try {
      const saved = localStorage.getItem('presentation_shares');
      if (saved) {
        const shares = JSON.parse(saved);
        shares.forEach((share: ShareLink) => {
          this.shares.set(share.id, share);
        });
      }
    } catch (error) {
      console.error('Failed to load shares:', error);
    }
  }

  private saveShares(): void {
    try {
      const shares = Array.from(this.shares.values());
      localStorage.setItem('presentation_shares', JSON.stringify(shares));
    } catch (error) {
      console.error('Failed to save shares:', error);
    }
  }

  /**
   * Create a share link for a presentation
   */
  public createShareLink(
    presentationId: string,
    settings: ShareSettings
  ): ShareLink {
    const token = this.generateToken();
    const id = this.generateId();
    
    let expiresAt: number | undefined;
    if (settings.expiresIn) {
      expiresAt = Date.now() + settings.expiresIn * 24 * 60 * 60 * 1000;
    }

    const shareLink: ShareLink = {
      id,
      presentationId,
      token,
      permissions: settings.allowEdit ? 'edit' : 'view',
      expiresAt,
      created: Date.now(),
      accessCount: 0,
      passwordProtected: settings.requiresPassword || false,
    };

    this.shares.set(id, shareLink);
    this.saveShares();

    return shareLink;
  }

  /**
   * Get share link URL
   */
  public getShareUrl(shareId: string): string {
    const share = this.shares.get(shareId);
    if (!share) {
      throw new Error('Share link not found');
    }

    const baseUrl = window.location.origin;
    return `${baseUrl}/share/${share.token}`;
  }

  /**
   * Validate a share token
   */
  public validateToken(token: string): { valid: boolean; share?: ShareLink; reason?: string } {
    const share = Array.from(this.shares.values()).find(s => s.token === token);

    if (!share) {
      return { valid: false, reason: 'Invalid share link' };
    }

    // Check expiration
    if (share.expiresAt && Date.now() > share.expiresAt) {
      return { valid: false, reason: 'Share link has expired' };
    }

    return { valid: true, share };
  }

  /**
   * Get share link by ID
   */
  public getShare(shareId: string): ShareLink | undefined {
    return this.shares.get(shareId);
  }

  /**
   * Get all shares for a presentation
   */
  public getSharesForPresentation(presentationId: string): ShareLink[] {
    return Array.from(this.shares.values()).filter(
      s => s.presentationId === presentationId
    );
  }

  /**
   * Revoke a share link
   */
  public revokeShare(shareId: string): void {
    this.shares.delete(shareId);
    this.saveShares();
  }

  /**
   * Revoke all shares for a presentation
   */
  public revokeAllShares(presentationId: string): void {
    const shares = this.getSharesForPresentation(presentationId);
    shares.forEach(share => {
      this.shares.delete(share.id);
    });
    this.saveShares();
  }

  /**
   * Track access to share link
   */
  public trackAccess(shareId: string): void {
    const share = this.shares.get(shareId);
    if (share) {
      share.accessCount++;
      this.saveShares();
    }
  }

  /**
   * Check if password is correct
   */
  public async verifyPassword(shareId: string, password: string): Promise<boolean> {
    const share = this.shares.get(shareId);
    if (!share || !share.passwordProtected) {
      return true;
    }

    // Store password hash in actual implementation
    // For now, simple check
    const savedPassword = localStorage.getItem(`share_password_${shareId}`);
    return savedPassword === password;
  }

  /**
   * Set password for share
   */
  public setPassword(shareId: string, password: string): void {
    const share = this.shares.get(shareId);
    if (share) {
      share.passwordProtected = true;
      // In production, hash the password
      localStorage.setItem(`share_password_${shareId}`, password);
      this.saveShares();
    }
  }

  /**
   * Get share analytics
   */
  public getShareAnalytics(shareId: string): {
    accessCount: number;
    created: number;
    expiresAt?: number;
  } {
    const share = this.shares.get(shareId);
    if (!share) {
      throw new Error('Share link not found');
    }

    return {
      accessCount: share.accessCount,
      created: share.created,
      expiresAt: share.expiresAt,
    };
  }

  /**
   * Copy share link to clipboard
   */
  public async copyToClipboard(shareId: string): Promise<boolean> {
    try {
      const url = this.getShareUrl(shareId);
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
}

// Export singleton instance
export const sharingService = new SharingService();

