/**
 * Pricing & Usage Service
 * Manages freemium pricing tiers and usage limits
 */

export type PricingTier = 'free' | 'pro' | 'business' | 'enterprise';

export interface UsageLimits {
  presentationsPerMonth: number;
  maxSlidesPerPresentation: number;
  allowedAiProviders: string[];
  exportFormats: string[];
  collaborationEnabled: boolean;
  analyticsEnabled: boolean;
  apiAccess: boolean;
  watermark: boolean;
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
}

const PRICING_TIERS: Record<PricingTier, UsageLimits> = {
  free: {
    presentationsPerMonth: 5,
    maxSlidesPerPresentation: 10,
    allowedAiProviders: ['gemini-2.5-flash'],
    exportFormats: ['pptx'],
    collaborationEnabled: false,
    analyticsEnabled: false,
    apiAccess: false,
    watermark: true,
    supportLevel: 'community',
  },
  pro: {
    presentationsPerMonth: -1, // Unlimited
    maxSlidesPerPresentation: -1, // Unlimited
    allowedAiProviders: ['gemini-2.5-flash', 'gemini-2.5-pro', 'claude-3-7-sonnet', 'gpt-4o', 'deepseek-chat'],
    exportFormats: ['pptx', 'pdf', 'html'],
    collaborationEnabled: false,
    analyticsEnabled: true,
    apiAccess: false,
    watermark: false,
    supportLevel: 'email',
  },
  business: {
    presentationsPerMonth: -1,
    maxSlidesPerPresentation: -1,
    allowedAiProviders: ['gemini-2.5-flash', 'gemini-2.5-pro', 'claude-3-7-sonnet', 'gpt-4o', 'deepseek-chat', 'mistral-large'],
    exportFormats: ['pptx', 'pdf', 'html', 'json'],
    collaborationEnabled: true,
    analyticsEnabled: true,
    apiAccess: true,
    watermark: false,
    supportLevel: 'priority',
  },
  enterprise: {
    presentationsPerMonth: -1,
    maxSlidesPerPresentation: -1,
    allowedAiProviders: ['gemini-2.5-flash', 'gemini-2.5-pro', 'claude-3-7-sonnet', 'gpt-4o', 'deepseek-chat', 'mistral-large'],
    exportFormats: ['pptx', 'pdf', 'html', 'json'],
    collaborationEnabled: true,
    analyticsEnabled: true,
    apiAccess: true,
    watermark: false,
    supportLevel: 'dedicated',
  },
};

class PricingService {
  private currentTier: PricingTier = 'free';
  private usageData: {
    presentationsThisMonth: number;
    lastReset: number;
  };

  constructor() {
    this.usageData = this.loadUsageData();
    this.currentTier = this.loadCurrentTier();
  }

  private loadCurrentTier(): PricingTier {
    const saved = localStorage.getItem('pricing_tier') || 'free';
    return saved as PricingTier;
  }

  private loadUsageData(): { presentationsThisMonth: number; lastReset: number } {
    const saved = localStorage.getItem('usage_data');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      presentationsThisMonth: 0,
      lastReset: Date.now(),
    };
  }

  private saveUsageData(): void {
    localStorage.setItem('usage_data', JSON.stringify(this.usageData));
  }

  private saveTier(tier: PricingTier): void {
    localStorage.setItem('pricing_tier', tier);
    this.currentTier = tier;
  }

  /**
   * Get current pricing tier
   */
  public getCurrentTier(): PricingTier {
    return this.currentTier;
  }

  /**
   * Get limits for current tier
   */
  public getLimits(): UsageLimits {
    return PRICING_TIERS[this.currentTier];
  }

  /**
   * Get limits for specific tier
   */
  public getLimitsForTier(tier: PricingTier): UsageLimits {
    return PRICING_TIERS[tier];
  }

  /**
   * Upgrade to a tier
   */
  public upgrade(tier: PricingTier): void {
    if (this.canUpgrade(tier)) {
      this.saveTier(tier);
    }
  }

  /**
   * Check if user can upgrade to a tier
   */
  public canUpgrade(tier: PricingTier): boolean {
    const tierOrder: PricingTier[] = ['free', 'pro', 'business', 'enterprise'];
    return tierOrder.indexOf(tier) > tierOrder.indexOf(this.currentTier);
  }

  /**
   * Check if user can create a presentation
   */
  public canCreatePresentation(): { allowed: boolean; reason?: string } {
    const limits = this.getLimits();

    // Check monthly limit
    if (limits.presentationsPerMonth > 0) {
      this.checkAndResetMonthlyUsage();
      if (this.usageData.presentationsThisMonth >= limits.presentationsPerMonth) {
        return {
          allowed: false,
          reason: `Monthly limit reached (${limits.presentationsPerMonth} presentations). Upgrade to create more.`,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Check if user can use a specific AI provider
   */
  public canUseProvider(provider: string): boolean {
    const limits = this.getLimits();
    return limits.allowedAiProviders.includes(provider);
  }

  /**
   * Check if user can export in a specific format
   */
  public canExport(format: string): boolean {
    const limits = this.getLimits();
    return limits.exportFormats.includes(format);
  }

  /**
   * Check if collaboration is enabled
   */
  public hasCollaboration(): boolean {
    return this.getLimits().collaborationEnabled;
  }

  /**
   * Check if analytics is enabled
   */
  public hasAnalytics(): boolean {
    return this.getLimits().analyticsEnabled;
  }

  /**
   * Check if watermark is required
   */
  public requiresWatermark(): boolean {
    return this.getLimits().watermark;
  }

  /**
   * Record presentation creation
   */
  public recordPresentationCreated(): void {
    this.usageData.presentationsThisMonth++;
    this.saveUsageData();
  }

  private checkAndResetMonthlyUsage(): void {
    const now = Date.now();
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
    
    if (this.usageData.lastReset < monthAgo) {
      this.usageData = {
        presentationsThisMonth: 0,
        lastReset: now,
      };
      this.saveUsageData();
    }
  }

  /**
   * Get usage statistics
   */
  public getUsageStats(): {
    tier: PricingTier;
    presentationsThisMonth: number;
    monthlyLimit: number;
    progress: number;
  } {
    this.checkAndResetMonthlyUsage();
    const limits = this.getLimits();
    
    return {
      tier: this.currentTier,
      presentationsThisMonth: this.usageData.presentationsThisMonth,
      monthlyLimit: limits.presentationsPerMonth === -1 ? -1 : limits.presentationsPerMonth,
      progress: limits.presentationsPerMonth === -1 
        ? 0 
        : (this.usageData.presentationsThisMonth / limits.presentationsPerMonth) * 100,
    };
  }

  /**
   * Get all pricing tiers
   */
  public getAllTiers(): Record<string, { tier: PricingTier; limits: UsageLimits; price?: string }> {
    return {
      free: { tier: 'free', limits: PRICING_TIERS.free },
      pro: { tier: 'pro', limits: PRICING_TIERS.pro, price: '$19/month' },
      business: { tier: 'business', limits: PRICING_TIERS.business, price: '$49/user/month' },
      enterprise: { tier: 'enterprise', limits: PRICING_TIERS.enterprise, price: 'Custom' },
    };
  }
}

// Export singleton instance
export const pricingService = new PricingService();

