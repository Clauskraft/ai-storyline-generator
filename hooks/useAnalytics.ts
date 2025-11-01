import { useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';

/**
 * Hook to track analytics events
 */
export function useAnalytics() {
  useEffect(() => {
    // Track page view on mount
    analyticsService.track('page_view', {
      path: window.location.pathname,
    });

    // Track page leave on unmount
    return () => {
      analyticsService.track('page_leave', {
        duration: Date.now(),
      });
    };
  }, []);
}

/**
 * Hook to track feature usage
 */
export function useFeatureTracking(featureName: string, enabled: boolean = true) {
  useEffect(() => {
    if (enabled) {
      analyticsService.trackFeatureUsed(featureName);
    }
  }, [featureName, enabled]);
}

/**
 * Track presentation creation
 */
export function usePresentationTracking() {
  const trackCreation = (model: string, slideCount: number, hasImages: boolean) => {
    analyticsService.trackPresentationCreated(model, slideCount, hasImages);
  };

  const trackExport = (format: string, slideCount: number) => {
    analyticsService.trackPresentationExported(format, slideCount);
  };

  return { trackCreation, trackExport };
}

/**
 * Hook for pricing/tier tracking
 */
export function usePricingTracking() {
  const trackUpgrade = (fromTier: string, toTier: string) => {
    analyticsService.track('upgrade_initiated', {
      from_tier: fromTier,
      to_tier: toTier,
    });
  };

  const trackTierLimits = (action: string, tier: string) => {
    analyticsService.track('tier_limit_hit', {
      action,
      tier,
    });
  };

  return { trackUpgrade, trackTierLimits };
}

