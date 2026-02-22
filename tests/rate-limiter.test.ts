/**
 * Tests for request rate limiting
 */

import { RateLimiter, createRateLimiter, RateLimitError } from '../src/utils/rate-limiter.js';
import { Logger, LogLevel } from '../src/utils/logger.js';

describe('RateLimiter', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.clearAllTimers();
  });

  describe('Token Bucket Algorithm', () => {
    it('should allow requests up to the burst size', async () => {
      const limiter = new RateLimiter({
        maxRequests: 10,
        windowMs: 1000,
        burstSize: 10,
      });

      // Should allow 10 requests immediately (burst capacity)
      for (let i = 0; i < 10; i++) {
        const result = await limiter.tryRequest();
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(9 - i);
      }

      // 11th request should be rejected
      const result = await limiter.tryRequest();
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfterMs).toBeDefined();
    });

    it('should refill tokens over time', async () => {
      jest.useFakeTimers();

      const limiter = new RateLimiter({
        maxRequests: 10,
        windowMs: 1000, // 10 requests per second = 0.01 tokens/ms
        burstSize: 10,
      });

      // Consume all tokens
      for (let i = 0; i < 10; i++) {
        await limiter.tryRequest();
      }

      // Should be rejected
      let result = await limiter.tryRequest();
      expect(result.allowed).toBe(false);

      // Advance time by 500ms (should add 5 tokens)
      jest.advanceTimersByTime(500);

      // Should allow 5 more requests
      for (let i = 0; i < 5; i++) {
        result = await limiter.tryRequest();
        expect(result.allowed).toBe(true);
      }

      // 6th should be rejected
      result = await limiter.tryRequest();
      expect(result.allowed).toBe(false);

      jest.useRealTimers();
    });

    it('should not exceed maximum burst size', async () => {
      jest.useFakeTimers();

      const limiter = new RateLimiter({
        maxRequests: 10,
        windowMs: 1000,
        burstSize: 15,
      });

      // Consume 5 tokens
      for (let i = 0; i < 5; i++) {
        await limiter.tryRequest();
      }

      // Wait for refill beyond burst capacity
      jest.advanceTimersByTime(2000); // Should add 20 tokens, but cap at 15

      // Should only allow 15 requests total (burst size)
      for (let i = 0; i < 15; i++) {
        const result = await limiter.tryRequest();
        expect(result.allowed).toBe(true);
      }

      const result = await limiter.tryRequest();
      expect(result.allowed).toBe(false);

      jest.useRealTimers();
    });
  });

  describe('Rate Limit Results', () => {
    it('should return correct remaining count', async () => {
      const limiter = new RateLimiter({
        maxRequests: 5,
        windowMs: 1000,
      });

      const result1 = await limiter.tryRequest();
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(4);

      const result2 = await limiter.tryRequest();
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(3);
    });

    it('should provide retry-after time when rate limited', async () => {
      const limiter = new RateLimiter({
        maxRequests: 10,
        windowMs: 1000,
      });

      // Consume all tokens
      for (let i = 0; i < 10; i++) {
        await limiter.tryRequest();
      }

      const result = await limiter.tryRequest();
      expect(result.allowed).toBe(false);
      expect(result.retryAfterMs).toBeDefined();
      expect(result.retryAfterMs).toBeGreaterThan(0);
      expect(result.retryAfterMs).toBeLessThanOrEqual(100); // 1 token refills in 100ms
    });

    it('should provide reset time', async () => {
      const limiter = new RateLimiter({
        maxRequests: 10,
        windowMs: 1000,
      });

      const before = Date.now();
      const result = await limiter.tryRequest();
      const after = Date.now();

      expect(result.resetAt).toBeGreaterThanOrEqual(before);
      expect(result.resetAt).toBeLessThanOrEqual(after + 2000);
    });
  });

  describe('Statistics', () => {
    it('should track request counts', async () => {
      const limiter = new RateLimiter({
        maxRequests: 10,
        windowMs: 1000,
      });

      // Make 5 allowed requests
      for (let i = 0; i < 5; i++) {
        await limiter.tryRequest();
      }

      const stats = limiter.getStats();
      expect(stats.requestsAllowed).toBe(5);
      expect(stats.requestsRejected).toBe(0);
    });

    it('should track rejected requests', async () => {
      const limiter = new RateLimiter({
        maxRequests: 2,
        windowMs: 1000,
      });

      // Make 2 allowed + 3 rejected requests
      await limiter.tryRequest();
      await limiter.tryRequest();
      await limiter.tryRequest();
      await limiter.tryRequest();
      await limiter.tryRequest();

      const stats = limiter.getStats();
      expect(stats.requestsAllowed).toBe(2);
      expect(stats.requestsRejected).toBe(3);
    });

    it('should report current token count', async () => {
      const limiter = new RateLimiter({
        maxRequests: 10,
        windowMs: 1000,
      });

      const stats1 = limiter.getStats();
      expect(stats1.tokensAvailable).toBe(10);

      await limiter.tryRequest();
      await limiter.tryRequest();

      const stats2 = limiter.getStats();
      expect(stats2.tokensAvailable).toBe(8);
    });

    it('should report refill rate', () => {
      const limiter = new RateLimiter({
        maxRequests: 60,
        windowMs: 60000, // 60 requests per minute = 1 per second
      });

      const stats = limiter.getStats();
      expect(stats.refillRate).toBe(1); // 1 request per second
    });
  });

  describe('Reset Functionality', () => {
    it('should reset tokens to maximum', async () => {
      const limiter = new RateLimiter({
        maxRequests: 5,
        windowMs: 1000,
      });

      // Consume some tokens
      await limiter.tryRequest();
      await limiter.tryRequest();
      await limiter.tryRequest();

      expect(limiter.getStats().tokensAvailable).toBe(2);

      limiter.reset();

      expect(limiter.getStats().tokensAvailable).toBe(5);
    });

    it('should reset request counts', async () => {
      const limiter = new RateLimiter({
        maxRequests: 2,
        windowMs: 1000,
      });

      await limiter.tryRequest();
      await limiter.tryRequest();
      await limiter.tryRequest(); // Rejected

      expect(limiter.getStats().requestsAllowed).toBe(2);
      expect(limiter.getStats().requestsRejected).toBe(1);

      limiter.reset();

      expect(limiter.getStats().requestsAllowed).toBe(0);
      expect(limiter.getStats().requestsRejected).toBe(0);
    });
  });

  describe('Logging', () => {
    it('should log allowed requests at debug level', async () => {
      const logger = new Logger({ service: 'test' }, LogLevel.DEBUG);
      const limiter = new RateLimiter({
        maxRequests: 5,
        windowMs: 1000,
      }, logger);

      await limiter.tryRequest('req-123');

      expect(consoleErrorSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('DEBUG');
      expect(logEntry.message).toContain('allowed');
      expect(logEntry.data.requestId).toBe('req-123');
    });

    it('should log rate limit exceeded at warn level', async () => {
      const logger = new Logger({ service: 'test' }, LogLevel.DEBUG);
      const limiter = new RateLimiter({
        maxRequests: 1,
        windowMs: 1000,
      }, logger);

      await limiter.tryRequest(); // Allowed
      await limiter.tryRequest('req-456'); // Rejected

      const warnLogs = consoleErrorSpy.mock.calls
        .map((call: unknown[]) => JSON.parse(call[0] as string))
        .filter((entry: { level: string }) => entry.level === 'WARN');

      expect(warnLogs.length).toBeGreaterThan(0);
      expect(warnLogs[0].message).toContain('Rate limit exceeded');
      expect(warnLogs[0].data.requestId).toBe('req-456');
    });
  });

  describe('Helper Functions', () => {
    it('should create rate limiter with default config', () => {
      const limiter = createRateLimiter();
      const stats = limiter.getStats();

      expect(stats.maxTokens).toBe(120); // Default burst size
      expect(stats.refillRate).toBeCloseTo(1.67, 1); // ~100 requests per minute
    });

    it('should create rate limiter with partial config override', () => {
      const limiter = createRateLimiter({
        maxRequests: 50,
      });

      const stats = limiter.getStats();
      expect(stats.maxTokens).toBe(120); // Default burst size preserved
      expect(stats.refillRate).toBeCloseTo(0.83, 1); // 50 requests per minute
    });

    it('should create rate limiter with custom logger', () => {
      const customLogger = new Logger({ service: 'custom' });
      const limiter = createRateLimiter(undefined, customLogger);

      expect(limiter).toBeDefined();
    });
  });

  describe('RateLimitError', () => {
    it('should create error with retry information', () => {
      const error = new RateLimitError('Too many requests', 5000, Date.now() + 60000);

      expect(error.message).toBe('Too many requests');
      expect(error.name).toBe('RateLimitError');
      expect(error.retryAfterMs).toBe(5000);
      expect(error.resetAt).toBeGreaterThan(Date.now());
      expect(error.stack).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small time windows', async () => {
      const limiter = new RateLimiter({
        maxRequests: 1,
        windowMs: 10, // 1 request per 10ms
      });

      const result1 = await limiter.tryRequest();
      expect(result1.allowed).toBe(true);

      const result2 = await limiter.tryRequest();
      expect(result2.allowed).toBe(false);
    });

    it('should handle very large burst sizes', async () => {
      const limiter = new RateLimiter({
        maxRequests: 100,
        windowMs: 1000,
        burstSize: 1000,
      });

      // Make all requests concurrently to avoid token refill during loop
      const requests = Array.from({ length: 1001 }, () => limiter.tryRequest());
      const results = await Promise.all(requests);

      const allowed = results.filter(r => r.allowed).length;
      const rejected = results.filter(r => !r.allowed).length;

      // Allow for small race condition where 1 extra token might refill
      expect(allowed).toBeGreaterThanOrEqual(1000);
      expect(allowed).toBeLessThanOrEqual(1001);
      expect(rejected).toBeGreaterThanOrEqual(0);
      expect(rejected).toBeLessThanOrEqual(1);
    });

    it('should handle concurrent requests correctly', async () => {
      const limiter = new RateLimiter({
        maxRequests: 10,
        windowMs: 1000,
      });

      // Make 15 concurrent requests
      const results = await Promise.all(
        Array.from({ length: 15 }, () => limiter.tryRequest())
      );

      const allowed = results.filter(r => r.allowed).length;
      const rejected = results.filter(r => !r.allowed).length;

      expect(allowed).toBe(10);
      expect(rejected).toBe(5);
    });
  });
});
