/**
 * Performance metrics tracking for CloudStack API calls
 * Tracks call durations, success/error rates, and retry statistics
 */

export interface ApiCallMetrics {
  command: string;
  duration: number;
  success: boolean;
  retries: number;
  statusCode?: number;
  timestamp: number;
}

export interface MetricsSummary {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  totalRetries: number;
  errorRate: number;
  commandStats: Record<string, {
    count: number;
    successCount: number;
    averageDuration: number;
    totalRetries: number;
  }>;
}

export class MetricsTracker {
  private metrics: ApiCallMetrics[] = [];
  private writeIndex = 0;
  private count = 0;
  private maxStoredMetrics: number;

  constructor(maxStoredMetrics?: number) {
    const defaultMaxStoredMetrics = process.env.CLOUDSTACK_MAX_STORED_METRICS
      ? parseInt(process.env.CLOUDSTACK_MAX_STORED_METRICS, 10)
      : 1000;
    this.maxStoredMetrics = maxStoredMetrics ?? defaultMaxStoredMetrics;
  }

  /**
   * Records an API call metric using a circular buffer
   */
  recordApiCall(metric: ApiCallMetrics): void {
    if (this.count < this.maxStoredMetrics) {
      this.metrics.push(metric);
      this.count++;
    } else {
      this.metrics[this.writeIndex] = metric;
    }
    this.writeIndex = (this.writeIndex + 1) % this.maxStoredMetrics;
  }

  /**
   * Get metrics in insertion order from the circular buffer
   */
  private getOrderedMetrics(): ApiCallMetrics[] {
    if (this.count < this.maxStoredMetrics) {
      return this.metrics.slice();
    }
    // Buffer is full: oldest entry is at writeIndex
    return [
      ...this.metrics.slice(this.writeIndex),
      ...this.metrics.slice(0, this.writeIndex),
    ];
  }

  /**
   * Gets summary statistics for all recorded metrics
   */
  getSummary(): MetricsSummary {
    if (this.count === 0) {
      return {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        totalRetries: 0,
        errorRate: 0,
        commandStats: {},
      };
    }

    const ordered = this.getOrderedMetrics();
    const durations = ordered.map(m => m.duration);
    const successfulCalls = ordered.filter(m => m.success).length;
    const failedCalls = ordered.length - successfulCalls;
    const totalRetries = ordered.reduce((sum, m) => sum + m.retries, 0);

    // Calculate per-command statistics
    const commandStats: Record<string, {
      count: number;
      successCount: number;
      averageDuration: number;
      totalRetries: number;
    }> = {};

    for (const metric of ordered) {
      if (!commandStats[metric.command]) {
        commandStats[metric.command] = {
          count: 0,
          successCount: 0,
          averageDuration: 0,
          totalRetries: 0,
        };
      }

      const stats = commandStats[metric.command];
      stats.count++;
      if (metric.success) {
        stats.successCount++;
      }
      stats.totalRetries += metric.retries;
    }

    // Calculate average durations per command
    for (const command in commandStats) {
      const commandMetrics = ordered.filter(m => m.command === command);
      const totalDuration = commandMetrics.reduce((sum, m) => sum + m.duration, 0);
      commandStats[command].averageDuration = totalDuration / commandMetrics.length;
    }

    return {
      totalCalls: ordered.length,
      successfulCalls,
      failedCalls,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      totalRetries,
      errorRate: failedCalls / ordered.length,
      commandStats,
    };
  }

  /**
   * Gets metrics for a specific command
   */
  getCommandMetrics(command: string): ApiCallMetrics[] {
    return this.getOrderedMetrics().filter(m => m.command === command);
  }

  /**
   * Gets metrics within a time range
   */
  getMetricsInTimeRange(startTime: number, endTime: number): ApiCallMetrics[] {
    return this.getOrderedMetrics().filter(m => m.timestamp >= startTime && m.timestamp <= endTime);
  }

  /**
   * Clears all stored metrics
   */
  clear(): void {
    this.metrics = [];
    this.writeIndex = 0;
    this.count = 0;
  }

  /**
   * Gets the raw metrics array in insertion order
   */
  getAll(): ApiCallMetrics[] {
    return this.getOrderedMetrics();
  }

  /**
   * Gets metrics for the last N calls
   */
  getRecent(count: number): ApiCallMetrics[] {
    const ordered = this.getOrderedMetrics();
    return ordered.slice(-count);
  }

  /**
   * Gets failed calls only
   */
  getFailedCalls(): ApiCallMetrics[] {
    return this.getOrderedMetrics().filter(m => !m.success);
  }

  /**
   * Exports metrics as JSON
   */
  exportToJson(): string {
    return JSON.stringify({
      summary: this.getSummary(),
      metrics: this.getOrderedMetrics(),
    }, null, 2);
  }
}

/**
 * Global metrics tracker instance
 */
export const globalMetrics = new MetricsTracker();
