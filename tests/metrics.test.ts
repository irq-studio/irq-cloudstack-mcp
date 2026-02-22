import type { ApiCallMetrics } from '../src/utils/metrics.js';
import { MetricsTracker } from '../src/utils/metrics.js';

describe('MetricsTracker', () => {
  let tracker: MetricsTracker;

  beforeEach(() => {
    tracker = new MetricsTracker(100);
  });

  describe('constructor', () => {
    it('should create with default max stored metrics', () => {
      const defaultTracker = new MetricsTracker();
      // Default is 1000 from code, but env var could override
      expect(defaultTracker).toBeDefined();
    });

    it('should create with custom max stored metrics', () => {
      const customTracker = new MetricsTracker(50);
      expect(customTracker).toBeDefined();
    });
  });

  describe('recordApiCall', () => {
    it('should record a single API call', () => {
      const metric: ApiCallMetrics = {
        command: 'listVirtualMachines',
        duration: 150,
        success: true,
        retries: 0,
        statusCode: 200,
        timestamp: Date.now(),
      };

      tracker.recordApiCall(metric);
      expect(tracker.getAll()).toHaveLength(1);
      expect(tracker.getAll()[0]).toEqual(metric);
    });

    it('should record multiple API calls', () => {
      const now = Date.now();
      const metrics: ApiCallMetrics[] = [
        { command: 'listVirtualMachines', duration: 150, success: true, retries: 0, timestamp: now },
        { command: 'listZones', duration: 80, success: true, retries: 0, timestamp: now + 100 },
        { command: 'deployVirtualMachine', duration: 2500, success: false, retries: 2, timestamp: now + 200 },
      ];

      metrics.forEach(m => tracker.recordApiCall(m));
      expect(tracker.getAll()).toHaveLength(3);
    });

    it('should trim oldest metrics when exceeding max', () => {
      const smallTracker = new MetricsTracker(3);
      const now = Date.now();

      for (let i = 0; i < 5; i++) {
        smallTracker.recordApiCall({
          command: `command${i}`,
          duration: i * 100,
          success: true,
          retries: 0,
          timestamp: now + i,
        });
      }

      const all = smallTracker.getAll();
      expect(all).toHaveLength(3);
      // Should have commands 2, 3, 4 (oldest ones trimmed)
      expect(all[0].command).toBe('command2');
      expect(all[1].command).toBe('command3');
      expect(all[2].command).toBe('command4');
    });
  });

  describe('getSummary', () => {
    it('should return empty summary when no metrics', () => {
      const summary = tracker.getSummary();
      expect(summary).toEqual({
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        totalRetries: 0,
        errorRate: 0,
        commandStats: {},
      });
    });

    it('should calculate correct summary statistics', () => {
      const now = Date.now();
      tracker.recordApiCall({ command: 'listVMs', duration: 100, success: true, retries: 0, timestamp: now });
      tracker.recordApiCall({ command: 'listVMs', duration: 200, success: true, retries: 0, timestamp: now + 1 });
      tracker.recordApiCall({ command: 'listVMs', duration: 300, success: false, retries: 2, timestamp: now + 2 });
      tracker.recordApiCall({ command: 'listZones', duration: 50, success: true, retries: 1, timestamp: now + 3 });

      const summary = tracker.getSummary();

      expect(summary.totalCalls).toBe(4);
      expect(summary.successfulCalls).toBe(3);
      expect(summary.failedCalls).toBe(1);
      expect(summary.averageDuration).toBe(162.5); // (100+200+300+50)/4
      expect(summary.minDuration).toBe(50);
      expect(summary.maxDuration).toBe(300);
      expect(summary.totalRetries).toBe(3);
      expect(summary.errorRate).toBe(0.25); // 1/4
    });

    it('should calculate per-command statistics', () => {
      const now = Date.now();
      tracker.recordApiCall({ command: 'listVMs', duration: 100, success: true, retries: 0, timestamp: now });
      tracker.recordApiCall({ command: 'listVMs', duration: 200, success: true, retries: 1, timestamp: now + 1 });
      tracker.recordApiCall({ command: 'listZones', duration: 50, success: false, retries: 2, timestamp: now + 2 });

      const summary = tracker.getSummary();

      expect(summary.commandStats['listVMs']).toEqual({
        count: 2,
        successCount: 2,
        averageDuration: 150, // (100+200)/2
        totalRetries: 1,
      });

      expect(summary.commandStats['listZones']).toEqual({
        count: 1,
        successCount: 0,
        averageDuration: 50,
        totalRetries: 2,
      });
    });
  });

  describe('getCommandMetrics', () => {
    it('should return empty array for unknown command', () => {
      expect(tracker.getCommandMetrics('unknownCommand')).toHaveLength(0);
    });

    it('should return only metrics for specified command', () => {
      const now = Date.now();
      tracker.recordApiCall({ command: 'listVMs', duration: 100, success: true, retries: 0, timestamp: now });
      tracker.recordApiCall({ command: 'listZones', duration: 50, success: true, retries: 0, timestamp: now + 1 });
      tracker.recordApiCall({ command: 'listVMs', duration: 150, success: true, retries: 0, timestamp: now + 2 });

      const vmMetrics = tracker.getCommandMetrics('listVMs');
      expect(vmMetrics).toHaveLength(2);
      expect(vmMetrics.every(m => m.command === 'listVMs')).toBe(true);
    });
  });

  describe('getMetricsInTimeRange', () => {
    it('should return metrics within time range', () => {
      const baseTime = 1000000;
      tracker.recordApiCall({ command: 'cmd1', duration: 100, success: true, retries: 0, timestamp: baseTime });
      tracker.recordApiCall({ command: 'cmd2', duration: 100, success: true, retries: 0, timestamp: baseTime + 500 });
      tracker.recordApiCall({ command: 'cmd3', duration: 100, success: true, retries: 0, timestamp: baseTime + 1000 });
      tracker.recordApiCall({ command: 'cmd4', duration: 100, success: true, retries: 0, timestamp: baseTime + 1500 });

      const rangeMetrics = tracker.getMetricsInTimeRange(baseTime + 400, baseTime + 1100);
      expect(rangeMetrics).toHaveLength(2);
      expect(rangeMetrics[0].command).toBe('cmd2');
      expect(rangeMetrics[1].command).toBe('cmd3');
    });

    it('should return empty array for time range with no metrics', () => {
      const baseTime = 1000000;
      tracker.recordApiCall({ command: 'cmd1', duration: 100, success: true, retries: 0, timestamp: baseTime });

      const rangeMetrics = tracker.getMetricsInTimeRange(baseTime + 1000, baseTime + 2000);
      expect(rangeMetrics).toHaveLength(0);
    });
  });

  describe('clear', () => {
    it('should remove all metrics', () => {
      const now = Date.now();
      tracker.recordApiCall({ command: 'cmd1', duration: 100, success: true, retries: 0, timestamp: now });
      tracker.recordApiCall({ command: 'cmd2', duration: 100, success: true, retries: 0, timestamp: now + 1 });

      expect(tracker.getAll()).toHaveLength(2);
      tracker.clear();
      expect(tracker.getAll()).toHaveLength(0);
    });
  });

  describe('getAll', () => {
    it('should return a copy of metrics array', () => {
      const now = Date.now();
      tracker.recordApiCall({ command: 'cmd1', duration: 100, success: true, retries: 0, timestamp: now });

      const all1 = tracker.getAll();
      const all2 = tracker.getAll();

      expect(all1).not.toBe(all2); // Different array instances
      expect(all1).toEqual(all2); // Same content
    });
  });

  describe('getRecent', () => {
    it('should return last N metrics', () => {
      const now = Date.now();
      for (let i = 0; i < 10; i++) {
        tracker.recordApiCall({ command: `cmd${i}`, duration: 100, success: true, retries: 0, timestamp: now + i });
      }

      const recent = tracker.getRecent(3);
      expect(recent).toHaveLength(3);
      expect(recent[0].command).toBe('cmd7');
      expect(recent[1].command).toBe('cmd8');
      expect(recent[2].command).toBe('cmd9');
    });

    it('should return all metrics if count exceeds total', () => {
      const now = Date.now();
      tracker.recordApiCall({ command: 'cmd1', duration: 100, success: true, retries: 0, timestamp: now });
      tracker.recordApiCall({ command: 'cmd2', duration: 100, success: true, retries: 0, timestamp: now + 1 });

      const recent = tracker.getRecent(10);
      expect(recent).toHaveLength(2);
    });
  });

  describe('getFailedCalls', () => {
    it('should return only failed calls', () => {
      const now = Date.now();
      tracker.recordApiCall({ command: 'cmd1', duration: 100, success: true, retries: 0, timestamp: now });
      tracker.recordApiCall({ command: 'cmd2', duration: 100, success: false, retries: 1, timestamp: now + 1 });
      tracker.recordApiCall({ command: 'cmd3', duration: 100, success: true, retries: 0, timestamp: now + 2 });
      tracker.recordApiCall({ command: 'cmd4', duration: 100, success: false, retries: 2, timestamp: now + 3 });

      const failed = tracker.getFailedCalls();
      expect(failed).toHaveLength(2);
      expect(failed.every(m => !m.success)).toBe(true);
      expect(failed[0].command).toBe('cmd2');
      expect(failed[1].command).toBe('cmd4');
    });

    it('should return empty array when no failures', () => {
      const now = Date.now();
      tracker.recordApiCall({ command: 'cmd1', duration: 100, success: true, retries: 0, timestamp: now });

      expect(tracker.getFailedCalls()).toHaveLength(0);
    });
  });

  describe('exportToJson', () => {
    it('should export metrics as JSON string', () => {
      const now = Date.now();
      tracker.recordApiCall({ command: 'listVMs', duration: 100, success: true, retries: 0, timestamp: now });

      const json = tracker.exportToJson();
      const parsed = JSON.parse(json);

      expect(parsed).toHaveProperty('summary');
      expect(parsed).toHaveProperty('metrics');
      expect(parsed.summary.totalCalls).toBe(1);
      expect(parsed.metrics).toHaveLength(1);
    });

    it('should produce valid JSON', () => {
      const now = Date.now();
      tracker.recordApiCall({ command: 'cmd1', duration: 100, success: true, retries: 0, statusCode: 200, timestamp: now });
      tracker.recordApiCall({ command: 'cmd2', duration: 200, success: false, retries: 2, timestamp: now + 1 });

      expect(() => JSON.parse(tracker.exportToJson())).not.toThrow();
    });
  });
});
