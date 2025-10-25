// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private timers: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start timing a performance metric
  startTimer(key: string): void {
    this.timers.set(key, performance.now());
  }

  // End timing and record the duration
  endTimer(key: string): number {
    const startTime = this.timers.get(key);
    if (!startTime) {
      console.warn(`Timer ${key} was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.set(key, duration);
    this.timers.delete(key);

    // Log performance metrics in development
    if (__DEV__) {
      console.log(`⏱️ Performance: ${key} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  // Get a performance metric
  getMetric(key: string): number | undefined {
    return this.metrics.get(key);
  }

  // Get all metrics
  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics.clear();
    this.timers.clear();
  }

  // Check if a metric exceeds threshold
  exceedsThreshold(key: string, threshold: number): boolean {
    const metric = this.metrics.get(key);
    return metric ? metric > threshold : false;
  }
}

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const monitor = PerformanceMonitor.getInstance();

  const startTimer = (key: string) => {
    monitor.startTimer(key);
  };

  const endTimer = (key: string) => {
    return monitor.endTimer(key);
  };

  const getMetric = (key: string) => {
    return monitor.getMetric(key);
  };

  return {
    startTimer,
    endTimer,
    getMetric,
  };
};

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  COMPONENT_RENDER: 16, // 16ms for 60fps
  API_CALL: 1000, // 1 second
  ANIMATION: 300, // 300ms
  NAVIGATION: 200, // 200ms
} as const;

// Performance optimization helpers
export const optimizeList = <T>(items: T[], maxItems: number = 50): T[] => {
  return items.slice(0, maxItems);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
