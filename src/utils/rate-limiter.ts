/**
 * Request rate limiting using token bucket algorithm
 *
 * Prevents API abuse by limiting the rate of requests to CloudStack API.
 * Uses token bucket algorithm for smooth rate limiting with burst capacity.
 */

import { Logger } from './logger.js';

export interface RateLimiterConfig {
  /** Maximum number of requests per time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum burst size (tokens that can accumulate) */
  burstSize?: number;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Remaining requests in current window */
  remaining: number;
  /** Time until next token is available (ms) */
  retryAfterMs?: number;
  /** Reset time for the current window */
  resetAt: number;
}

/**
 * Token bucket rate limiter
 *
 * Implementation:
 * - Tokens refill at a constant rate (maxRequests / windowMs)
 * - Each request consumes one token
 * - Allows bursts up to burstSize tokens
 * - Rejects requests when no tokens available
 */
export class RateLimiter {
  private tokens: number;
  private lastRefillTime: number;
  private readonly refillRate: number; // tokens per millisecond
  private readonly maxTokens: number;
  private readonly logger: Logger;
  private requestCount: number = 0;
  private rejectedCount: number = 0;

  constructor(
    config: RateLimiterConfig,
    logger?: Logger
  ) {
    this.maxTokens = config.burstSize || config.maxRequests;
    this.tokens = this.maxTokens;
    this.lastRefillTime = Date.now();
    this.refillRate = config.maxRequests / config.windowMs;
    this.logger = logger || new Logger({ service: 'rate-limiter' });
  }

  /**
   * Attempt to consume a token for a request
   * @param requestId - Optional request ID for logging
   * @returns Rate limit result
   */
  async tryRequest(requestId?: string): Promise<RateLimitResult> {
    const now = Date.now();
    this.refillTokens(now);

    if (this.tokens >= 1) {
      // Consume a token
      this.tokens -= 1;
      this.requestCount++;

      this.logger.debug('Rate limit check: allowed', {
        requestId,
        tokensRemaining: Math.floor(this.tokens),
        requestCount: this.requestCount,
      });

      return {
        allowed: true,
        remaining: Math.floor(this.tokens),
        resetAt: this.calculateResetTime(now),
      };
    }

    // No tokens available - reject request
    this.rejectedCount++;
    const retryAfterMs = Math.ceil(1 / this.refillRate);

    this.logger.warn('Rate limit exceeded', {
      requestId,
      requestCount: this.requestCount,
      rejectedCount: this.rejectedCount,
      retryAfterMs,
    });

    return {
      allowed: false,
      remaining: 0,
      retryAfterMs,
      resetAt: this.calculateResetTime(now),
    };
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refillTokens(now: number): void {
    const elapsedMs = now - this.lastRefillTime;
    const tokensToAdd = elapsedMs * this.refillRate;

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefillTime = now;
    }
  }

  /**
   * Calculate when the rate limit will reset
   */
  private calculateResetTime(now: number): number {
    if (this.tokens >= this.maxTokens) {
      return now;
    }

    const tokensNeeded = this.maxTokens - this.tokens;
    const msToRefill = tokensNeeded / this.refillRate;
    return now + msToRefill;
  }

  /**
   * Get current rate limiter statistics
   */
  getStats(): {
    tokensAvailable: number;
    maxTokens: number;
    requestsAllowed: number;
    requestsRejected: number;
    refillRate: number;
  } {
    this.refillTokens(Date.now());

    return {
      tokensAvailable: Math.floor(this.tokens),
      maxTokens: this.maxTokens,
      requestsAllowed: this.requestCount,
      requestsRejected: this.rejectedCount,
      refillRate: this.refillRate * 1000, // Convert to requests per second
    };
  }

  /**
   * Reset the rate limiter (primarily for testing)
   */
  reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefillTime = Date.now();
    this.requestCount = 0;
    this.rejectedCount = 0;
  }
}

/**
 * Safely parse an integer with NaN validation (local to avoid circular imports)
 */
function safeParseIntLocal(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get rate limit configuration from environment or use defaults
 * Default: 100 requests per minute with burst of 120
 */
function getRateLimitConfigFromEnv(): RateLimiterConfig {
  return {
    maxRequests: safeParseIntLocal(process.env.CLOUDSTACK_RATE_LIMIT_MAX_REQUESTS, 100),
    windowMs: safeParseIntLocal(process.env.CLOUDSTACK_RATE_LIMIT_WINDOW_MS, 60000),
    burstSize: safeParseIntLocal(process.env.CLOUDSTACK_RATE_LIMIT_BURST_SIZE, 120),
  };
}

/**
 * Rate limiter for CloudStack API requests - lazy initialized to ensure env vars are loaded
 * Default: 100 requests per minute with burst of 120
 */
let _defaultRateLimitConfig: RateLimiterConfig | null = null;
function getDefaultRateLimitConfig(): RateLimiterConfig {
  if (!_defaultRateLimitConfig) {
    _defaultRateLimitConfig = getRateLimitConfigFromEnv();
  }
  return _defaultRateLimitConfig;
}

/**
 * Create a rate limiter with custom or default configuration
 */
export function createRateLimiter(
  config?: Partial<RateLimiterConfig>,
  logger?: Logger
): RateLimiter {
  const finalConfig = {
    ...getDefaultRateLimitConfig(),
    ...config,
  };

  return new RateLimiter(finalConfig, logger);
}

/**
 * Rate limit error class
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfterMs: number,
    public resetAt: number
  ) {
    super(message);
    this.name = 'RateLimitError';
    Error.captureStackTrace(this, RateLimitError);
  }
}
