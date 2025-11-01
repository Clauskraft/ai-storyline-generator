/**
 * Performance Monitoring Service
 * Tracks performance metrics and optimizations
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userAgent: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];

  constructor() {
    this.observeCoreWebVitals();
    this.observeLargestContentfulPaint();
    this.observeFirstInputDelay();
  }

  /**
   * Observe Core Web Vitals
   */
  private observeCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.recordMetric('lcp', lastEntry.renderTime || lastEntry.loadTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('LCP observation not supported:', error);
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.recordMetric('fid', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.warn('FID observation not supported:', error);
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries() as any[];
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.recordMetric('cls', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('CLS observation not supported:', error);
      }
    }
  }

  /**
   * Observe LCP manually if needed
   */
  private observeLargestContentfulPaint(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('lcp', (lastEntry as any).renderTime || (lastEntry as any).loadTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        // Fallback for browsers that don't support LCP
      }
    }
  }

  /**
   * Observe First Input Delay
   */
  private observeFirstInputDelay(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries() as any[];
          entries.forEach((entry) => {
            this.recordMetric('fid', entry.processingStart - entry.startTime);
          });
        });
        observer.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        // Fallback for browsers that don't support FID
      }
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(name: string, value: number): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.metrics.push(metric);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }

    // Log in development
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${name}:`, value.toFixed(2));
    }
  }

  /**
   * Measure function execution time
   */
  public async measureTime<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${name}_error`, duration);
      throw error;
    }
  }

  /**
   * Get performance report
   */
  public getPerformanceReport(): {
    lcp?: number;
    fid?: number;
    cls?: number;
    totalMetrics: number;
  } {
    const latestMetrics: Record<string, number> = {};
    
    // Get latest value for each metric
    [...this.metrics].reverse().forEach(metric => {
      if (!latestMetrics[metric.name]) {
        latestMetrics[metric.name] = metric.value;
      }
    });

    return {
      lcp: latestMetrics.lcp,
      fid: latestMetrics.fid,
      cls: latestMetrics.cls,
      totalMetrics: this.metrics.length,
    };
  }

  /**
   * Clear all metrics
   */
  public clear(): void {
    this.metrics = [];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

