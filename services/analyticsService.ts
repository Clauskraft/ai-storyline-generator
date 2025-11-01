/**
 * Analytics Service
 * Tracks user behavior, presentations, and key metrics
 */

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: number;
}

class AnalyticsService {
  private sessionId: string;
  private userId?: string;
  private eventsBuffer: AnalyticsEvent[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadUserId();
    this.startSessionTracking();
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadUserId(): void {
    const userId = localStorage.getItem('analytics_user_id');
    if (!userId) {
      this.userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_user_id', this.userId);
    } else {
      this.userId = userId;
    }
  }

  private startSessionTracking(): void {
    // Track session start
    this.track('session_start', {
      session_id: this.sessionId,
      timestamp: Date.now(),
    });

    // Track page views
    this.track('page_view', {
      path: window.location.pathname,
      referrer: document.referrer,
    });

    // Track session end on unload
    window.addEventListener('beforeunload', () => {
      this.track('session_end', {
        session_id: this.sessionId,
        duration: Date.now() - (this.eventsBuffer[0]?.timestamp || Date.now()),
      });
      this.flush();
    });
  }

  /**
   * Track an analytics event
   */
  public track(event: string, properties?: Record<string, any>): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
    };

    this.eventsBuffer.push(analyticsEvent);
    this.logToConsole(event, properties);

    // Flush buffer every 10 events or every 30 seconds
    if (this.eventsBuffer.length >= 10) {
      this.flush();
    } else if (!this.flushInterval) {
      this.flushInterval = window.setTimeout(() => {
        this.flush();
      }, 30000);
    }

    // Store in localStorage for persistence
    this.persistEvent(analyticsEvent);
  }

  private flushInterval?: number;

  private async flush(): Promise<void> {
    if (this.eventsBuffer.length === 0) return;

    const events = [...this.eventsBuffer];
    this.eventsBuffer = [];

    if (this.flushInterval) {
      clearTimeout(this.flushInterval);
      this.flushInterval = undefined;
    }

    // In production, send to analytics service
    try {
      const saved = localStorage.getItem('analytics_events') || '[]';
      const existing = JSON.parse(saved);
      existing.push(...events);
      localStorage.setItem('analytics_events', JSON.stringify(existing.slice(-100))); // Keep last 100
    } catch (error) {
      console.error('Failed to persist analytics events:', error);
    }
  }

  private persistEvent(event: AnalyticsEvent): void {
    try {
      const saved = localStorage.getItem('analytics_recent') || '[]';
      const recent = JSON.parse(saved);
      recent.push(event);
      // Keep only last 50 events
      const trimmed = recent.slice(-50);
      localStorage.setItem('analytics_recent', JSON.stringify(trimmed));
    } catch (error) {
      console.error('Failed to persist event:', error);
    }
  }

  private logToConsole(event: string, properties?: Record<string, any>): void {
    if (import.meta.env.DEV) {
      console.log(`[Analytics] ${event}`, properties || '');
    }
  }

  /**
   * Track presentation creation
   */
  public trackPresentationCreated(
    model: string,
    slideCount: number,
    hasImages: boolean
  ): void {
    this.track('presentation_created', {
      model,
      slide_count: slideCount,
      has_images: hasImages,
      timestamp: Date.now(),
    });
  }

  /**
   * Track presentation export
   */
  public trackPresentationExported(format: string, slideCount: number): void {
    this.track('presentation_exported', {
      format,
      slide_count: slideCount,
      timestamp: Date.now(),
    });
  }

  /**
   * Track feature usage
   */
  public trackFeatureUsed(feature: string, metadata?: Record<string, any>): void {
    this.track('feature_used', {
      feature,
      ...metadata,
      timestamp: Date.now(),
    });
  }

  /**
   * Track user journey
   */
  public trackStepCompleted(step: number, totalSteps: number): void {
    this.track('step_completed', {
      step,
      total_steps: totalSteps,
      progress: Math.round((step / totalSteps) * 100),
      timestamp: Date.now(),
    });
  }

  /**
   * Track error
   */
  public trackError(error: Error, context?: string): void {
    this.track('error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      context,
      timestamp: Date.now(),
    });
  }

  /**
   * Get analytics summary
   */
  public getSummary(): {
    totalEvents: number;
    recentEvents: AnalyticsEvent[];
    sessionDuration: number;
  } {
    const recent = localStorage.getItem('analytics_recent') || '[]';
    const events = JSON.parse(recent) as AnalyticsEvent[];
    const sessionStart = events.find(e => e.event === 'session_start')?.timestamp || Date.now();
    
    return {
      totalEvents: events.length,
      recentEvents: events.slice(-10),
      sessionDuration: Date.now() - sessionStart,
    };
  }

  /**
   * Clear analytics data
   */
  public clear(): void {
    localStorage.removeItem('analytics_recent');
    localStorage.removeItem('analytics_events');
    this.eventsBuffer = [];
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

