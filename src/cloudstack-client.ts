import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import { createHmac } from 'crypto';
import https from 'https';
import { globalMetrics } from './utils/metrics.js';
import { Logger } from './utils/logger.js';
import { safeParseInt, safeParseFloat } from './utils/index.js';
import type { RateLimiter } from './utils/rate-limiter.js';
import { RateLimitError, createRateLimiter } from './utils/rate-limiter.js';
import type { CloudStackConfig, CloudStackArrayValue } from './types.js';

// Re-export configuration types for backwards compatibility
export type { CloudStackConfig, ConnectionPoolConfig, CloudStackArrayValue } from './types.js';

// Re-export all response types for type-safe API usage
// Usage: import { ListVirtualMachinesResponse } from './cloudstack-client.js';
// Then: client.listVirtualMachines<ListVirtualMachinesResponse>({})
export type * from './types/index.js';

export interface CloudStackParams {
  [key: string]: string | number | boolean | undefined | CloudStackArrayValue;
}

export interface CloudStackResponse {
  [key: string]: unknown;
}

/**
 * Enhanced error class for CloudStack API errors with request context
 */
export class CloudStackError extends Error {
  constructor(
    message: string,
    public command: string,
    public statusCode?: number,
    public requestId?: string,
    public params?: Record<string, string>
  ) {
    super(message);
    this.name = 'CloudStackError';
    Error.captureStackTrace(this, CloudStackError);
  }

  /**
   * Format error message with full context
   */
  override toString(): string {
    const parts = [this.message];

    if (this.command) {
      parts.push(`Command: ${this.command}`);
    }

    if (this.statusCode) {
      parts.push(`Status Code: ${this.statusCode}`);
    }

    if (this.requestId) {
      parts.push(`Request ID: ${this.requestId}`);
    }

    if (this.params && Object.keys(this.params).length > 0) {
      const paramStr = Object.entries(this.params)
        .map(([k, v]) => `${k}=${v}`)
        .join(', ');
      parts.push(`Parameters: ${paramStr}`);
    }

    return parts.join(' | ');
  }
}

/**
 * Retry configuration for API requests
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
}

/**
 * Get retry configuration from environment or use defaults
 */
function getRetryConfigFromEnv(): RetryConfig {
  return {
    maxRetries: safeParseInt(process.env.CLOUDSTACK_MAX_RETRIES, 3),
    initialDelayMs: safeParseInt(process.env.CLOUDSTACK_RETRY_INITIAL_DELAY_MS, 1000),
    maxDelayMs: safeParseInt(process.env.CLOUDSTACK_RETRY_MAX_DELAY_MS, 10000),
    backoffMultiplier: safeParseFloat(process.env.CLOUDSTACK_RETRY_BACKOFF_MULTIPLIER, 2),
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  };
}

/**
 * Default retry configuration - lazy initialized to ensure env vars are loaded
 */
let _defaultRetryConfig: RetryConfig | null = null;
function getDefaultRetryConfig(): RetryConfig {
  if (!_defaultRetryConfig) {
    _defaultRetryConfig = getRetryConfigFromEnv();
  }
  return _defaultRetryConfig;
}

/**
 * Default connection pool configuration
 * Optimized for HTTP keep-alive and concurrent requests
 */
const DEFAULT_CONNECTION_POOL_CONFIG = {
  keepAlive: true,
  keepAliveMsecs: 30000, // 30 seconds
  maxSockets: 50, // Maximum concurrent connections per host
  maxFreeSockets: 10, // Keep up to 10 idle connections ready
  socketTimeout: 60000, // 60 seconds socket timeout
} as const;

/**
 * Determines if an error is retryable
 */
function isRetryableError(error: unknown, retryConfig: RetryConfig): boolean {
  if (axios.isAxiosError(error)) {
    // Network errors without response are retryable
    if (!error.response) {
      return true;
    }

    // Check if status code is in retryable list
    return retryConfig.retryableStatusCodes.includes(error.response.status);
  }

  return false;
}

/**
 * Calculates exponential backoff delay with jitter
 */
function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig
): number {
  const exponentialDelay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt);
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);

  // Add jitter (±25% randomization)
  const jitter = cappedDelay * 0.25 * (Math.random() * 2 - 1);
  return Math.floor(cappedDelay + jitter);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * List of parameter names that may contain sensitive information
 * These will be sanitized from error messages
 */
const SENSITIVE_PARAMS = [
  'password',
  'apikey',
  'secretkey',
  'accesskey',
  'signature',
  'token',
  'key',
  'secret',
  'credential',
  'auth',
  'privatekey',
  'publickey',
  'userdata'
] as const;

/**
 * Sanitizes parameters by removing sensitive values
 * @param params - Parameters to sanitize
 * @returns Sanitized version with sensitive values masked
 */
export function sanitizeParams(params: CloudStackParams): Record<string, string> {
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_PARAMS.some(sensitive =>
      lowerKey.includes(sensitive)
    );

    sanitized[key] = isSensitive ? '[REDACTED]' : String(value);
  }

  return sanitized;
}

export class CloudStackClient {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly timeout: number;
  private readonly axios: AxiosInstance;
  private readonly retryConfig: RetryConfig;
  private readonly logger: Logger;
  private readonly rateLimiter: RateLimiter;

  constructor(config: CloudStackConfig & { retryConfig?: Partial<RetryConfig> }) {
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
    this.secretKey = config.secretKey;
    this.timeout = config.timeout || 30000;
    this.retryConfig = { ...getDefaultRetryConfig(), ...config.retryConfig };
    this.logger = new Logger({ service: 'cloudstack-client' });
    this.rateLimiter = createRateLimiter(config.rateLimitConfig, this.logger);

    // Determine SSL certificate validation based on environment
    // Default to STRICT (reject unauthorized) unless explicitly configured otherwise
    // For development/testing with self-signed certs, set CLOUDSTACK_REJECT_UNAUTHORIZED=false
    const isProduction = process.env.NODE_ENV === 'production';
    const defaultRejectUnauthorized = isProduction ? true : (config.rejectUnauthorized ?? true);

    // Merge connection pool config with defaults
    const poolConfig = { ...DEFAULT_CONNECTION_POOL_CONFIG, ...config.connectionPoolConfig };

    // Create HTTPS agent with security-conscious defaults and connection pooling
    const httpsAgent = new https.Agent({
      rejectUnauthorized: defaultRejectUnauthorized,
      // Connection pooling configuration for better performance
      keepAlive: poolConfig.keepAlive,
      keepAliveMsecs: poolConfig.keepAliveMsecs,
      maxSockets: poolConfig.maxSockets,
      maxFreeSockets: poolConfig.maxFreeSockets,
      timeout: poolConfig.socketTimeout,
    });

    // Log warning if accepting self-signed certificates
    if (!defaultRejectUnauthorized) {
      this.logger.warn(
        'SSL certificate verification is disabled - use only in development',
        {
          environment: process.env.NODE_ENV || 'unknown',
          recommendation: 'Set CLOUDSTACK_REJECT_UNAUTHORIZED=true for production',
        }
      );
    }

    this.axios = axios.create({
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
      httpsAgent,
    });
  }

  private generateSignature(params: CloudStackParams): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc: CloudStackParams, key) => {
        acc[key] = params[key];
        return acc;
      }, {});

    const flattenedParams: Record<string, string> = {};

    // Flatten params to handle arrays and objects
    Object.entries(sortedParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Check if array of objects
        if (value.length > 0 && typeof value[0] === 'object') {
          // Indexed notation for arrays of objects (e.g., tags[0].key=env)
          value.forEach((item, index) => {
            Object.entries(item).forEach(([itemKey, itemValue]) => {
              flattenedParams[`${key}[${index}].${itemKey}`] = String(itemValue);
            });
          });
        } else {
          // Comma-separated for simple arrays (e.g., resourceids=id1,id2)
          flattenedParams[key] = value.join(',');
        }
      } else if (value !== undefined) {
        flattenedParams[key] = String(value);
      }
    });

    const queryString = Object.entries(flattenedParams)
      .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    const signature = createHmac('sha1', this.secretKey)
      .update(queryString.toLowerCase())
      .digest('base64');

    return signature;
  }

  async request<T = CloudStackResponse>(
    command: string,
    params: CloudStackParams = {}
  ): Promise<T> {
    let lastError: unknown;
    const startTime = Date.now();
    let retryCount = 0;

    // Check rate limit before making request
    const rateLimitResult = await this.rateLimiter.tryRequest();
    if (!rateLimitResult.allowed) {
      const retryAfterMs = rateLimitResult.retryAfterMs ?? 0;
      throw new RateLimitError(
        `Rate limit exceeded. Retry after ${retryAfterMs}ms`,
        retryAfterMs,
        rateLimitResult.resetAt
      );
    }

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const timestamp = Date.now();
        const requestParams: CloudStackParams = {
          ...params,
          command,
          apiKey: this.apiKey,
          response: 'json',
          _: timestamp,
        };

        const signature = this.generateSignature(requestParams);
        requestParams.signature = signature;

        const response: AxiosResponse<CloudStackResponse> = await this.axios.get(this.apiUrl, {
          params: requestParams,
        });

        if (response.data.errortext) {
          const sanitizedParams = sanitizeParams(params);
          // Record failed API call
          globalMetrics.recordApiCall({
            command,
            duration: Date.now() - startTime,
            success: false,
            retries: retryCount,
            statusCode: response.status,
            timestamp: startTime,
          });
          throw new CloudStackError(
            `CloudStack API Error: ${response.data.errortext}`,
            command,
            response.status,
            undefined, // requestId not available in response
            sanitizedParams
          );
        }

        // Record successful API call
        const duration = Date.now() - startTime;
        globalMetrics.recordApiCall({
          command,
          duration,
          success: true,
          retries: retryCount,
          statusCode: response.status,
          timestamp: startTime,
        });

        // Log successful API call
        this.logger.logApiResponse(command, duration, true);

        return response.data as T;
      } catch (error) {
        lastError = error;

        // Don't retry CloudStackError (API-level errors)
        if (error instanceof CloudStackError) {
          throw error;
        }

        // Check if error is retryable
        if (!isRetryableError(error, this.retryConfig)) {
          // Handle Axios errors with enhanced context
          if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.errortext || error.message;
            const sanitizedParams = sanitizeParams(params);
            throw new CloudStackError(
              `CloudStack API request failed: ${errorMessage}`,
              command,
              error.response?.status,
              undefined, // requestId not available
              sanitizedParams
            );
          }

          // Re-throw non-retryable errors
          throw error;
        }

        // Don't retry if we've exhausted attempts
        if (attempt >= this.retryConfig.maxRetries) {
          break;
        }

        // Increment retry count
        retryCount++;

        // Calculate delay and wait before retrying
        const delay = calculateBackoffDelay(attempt, this.retryConfig);
        this.logger.warn('CloudStack API request failed, retrying', {
          command,
          attempt: attempt + 1,
          maxAttempts: this.retryConfig.maxRetries + 1,
          retryDelayMs: delay,
          error: error instanceof Error ? error.message : String(error),
        });
        await sleep(delay);
      }
    }

    // All retries exhausted - record failed API call and throw error
    const duration = Date.now() - startTime;
    globalMetrics.recordApiCall({
      command,
      duration,
      success: false,
      retries: retryCount,
      statusCode: axios.isAxiosError(lastError) ? lastError.response?.status : undefined,
      timestamp: startTime,
    });

    // Log failed API call
    this.logger.logApiResponse(command, duration, false);

    if (axios.isAxiosError(lastError)) {
      const errorMessage = lastError.response?.data?.errortext || lastError.message;
      const sanitizedParams = sanitizeParams(params);
      const error = new CloudStackError(
        `CloudStack API request failed after ${this.retryConfig.maxRetries + 1} attempts: ${errorMessage}`,
        command,
        lastError.response?.status,
        undefined,
        sanitizedParams
      );
      this.logger.error('CloudStack API request failed', error, {
        command,
        attempts: retryCount + 1,
        statusCode: lastError.response?.status,
      });
      throw error;
    }

    throw lastError;
  }

  /**
   * Execute multiple CloudStack API requests in parallel with concurrency control
   * Useful for batch operations while respecting rate limits
   *
   * @param requests - Array of request objects with command and params
   * @param options - Batch execution options
   * @returns Array of responses in the same order as requests
   *
   * @example
   * ```typescript
   * const results = await client.batchRequest([
   *   { command: 'listVirtualMachines', params: { id: 'vm-1' } },
   *   { command: 'listVirtualMachines', params: { id: 'vm-2' } },
   *   { command: 'listVolumes', params: { id: 'vol-1' } },
   * ], { concurrency: 5 });
   * ```
   */
  async batchRequest(
    requests: Array<{ command: string; params?: CloudStackParams }>,
    options: { concurrency?: number; stopOnError?: boolean } = {}
  ): Promise<Array<CloudStackResponse | Error>> {
    const defaultConcurrency = process.env.CLOUDSTACK_BATCH_CONCURRENCY
      ? parseInt(process.env.CLOUDSTACK_BATCH_CONCURRENCY, 10)
      : 10;
    const { concurrency = defaultConcurrency, stopOnError = false } = options;

    // Validate input
    if (!Array.isArray(requests) || requests.length === 0) {
      throw new Error('batchRequest requires a non-empty array of requests');
    }

    this.logger.info(`Executing ${requests.length} batch requests with concurrency ${concurrency}`);

    const results: Array<CloudStackResponse | Error> = new Array(requests.length);

    // Process requests in chunks with concurrency control
    for (let i = 0; i < requests.length; i += concurrency) {
      const chunk = requests.slice(i, i + concurrency);
      const chunkPromises = chunk.map(async (req, chunkIndex) => {
        const index = i + chunkIndex;
        try {
          const result = await this.request(req.command, req.params || {});
          results[index] = result;
        } catch (error) {
          results[index] = error instanceof Error ? error : new Error(String(error));
          if (stopOnError) {
            throw error;
          }
        }
      });

      // Wait for this chunk to complete before starting the next
      await Promise.all(chunkPromises);
    }

    this.logger.info(`Batch request completed: ${results.filter(r => !(r instanceof Error)).length}/${requests.length} succeeded`);

    return results;
  }

  // ============================================================================
  // Virtual Machine Operations
  // Response types: import from './types/virtual-machines.js'
  // ============================================================================

  /**
   * List virtual machines
   * @typeParam T - Response type (default: CloudStackResponse, recommended: ListVirtualMachinesResponse)
   * @example
   * const result = await client.listVirtualMachines<ListVirtualMachinesResponse>({ state: 'Running' });
   */
  async listVirtualMachines<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listVirtualMachines', params);
  }

  /**
   * Deploy a new virtual machine
   * @typeParam T - Response type (default: CloudStackResponse, recommended: DeployVirtualMachineResponse)
   */
  async deployVirtualMachine<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deployVirtualMachine', params);
  }

  /**
   * Start a virtual machine
   * @typeParam T - Response type (default: CloudStackResponse, recommended: StartVirtualMachineResponse)
   */
  async startVirtualMachine<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('startVirtualMachine', params);
  }

  /**
   * Stop a virtual machine
   * @typeParam T - Response type (default: CloudStackResponse, recommended: StopVirtualMachineResponse)
   */
  async stopVirtualMachine<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('stopVirtualMachine', params);
  }

  /**
   * Reboot a virtual machine
   * @typeParam T - Response type (default: CloudStackResponse, recommended: RebootVirtualMachineResponse)
   */
  async rebootVirtualMachine<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('rebootVirtualMachine', params);
  }

  /**
   * Destroy a virtual machine
   * @typeParam T - Response type (default: CloudStackResponse, recommended: DestroyVirtualMachineResponse)
   */
  async destroyVirtualMachine<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('destroyVirtualMachine', params);
  }

  // Zone operations
  async listZones<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listZones', params);
  }

  // Template operations
  async listTemplates<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    const defaultParams = { templatefilter: 'featured', ...params };
    return this.request('listTemplates', defaultParams);
  }

  // Service offering operations
  async listServiceOfferings<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listServiceOfferings', params);
  }

  // Network operations
  async listNetworks<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listNetworks', params);
  }

  // Job operations
  async queryAsyncJobResult<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('queryAsyncJobResult', params);
  }

  /**
   * Polls an async job until completion or timeout
   * @param jobId - The job ID to poll
   * @param options - Polling options
   * @returns The job result when completed
   * @throws Error if job fails or times out
   */
  async waitForAsyncJob(
    jobId: string,
    options: {
      timeout?: number;      // Max time to wait in milliseconds (default: 60000)
      pollInterval?: number; // Time between polls in milliseconds (default: 2000)
    } = {}
  ): Promise<CloudStackResponse> {
    const timeout = options.timeout ?? 60000;
    const pollInterval = options.pollInterval ?? 2000;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const result = await this.queryAsyncJobResult<{ queryasyncjobresultresponse: { jobstatus: number; jobresult?: { errortext?: string } } }>({ jobid: jobId });
      const jobStatus = result.queryasyncjobresultresponse.jobstatus;

      // Job status: 0 = pending, 1 = success, 2 = failed
      if (jobStatus === 1) {
        // Job completed successfully - the response structure is already a valid CloudStackResponse
        return result as CloudStackResponse;
      } else if (jobStatus === 2) {
        // Job failed
        const errorText = result.queryasyncjobresultresponse.jobresult?.errortext || 'Unknown error';
        throw new Error(`Async job ${jobId} failed: ${errorText}`);
      }

      // Job still pending, wait before next poll
      await sleep(pollInterval);
    }

    // Timeout reached
    throw new Error(`Async job ${jobId} timed out after ${timeout}ms`);
  }

  // VM Advanced operations
  async scaleVirtualMachine<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('scaleVirtualMachine', params);
  }

  async migrateVirtualMachine<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('migrateVirtualMachine', params);
  }

  async resetPasswordForVirtualMachine<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('resetPasswordForVirtualMachine', params);
  }

  async changeServiceForVirtualMachine<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('changeServiceForVirtualMachine', params);
  }

  // Storage operations
  async listVolumes<T = CloudStackResponse>(
    params: CloudStackParams = {}
  ): Promise<T> {
    return this.request<T>('listVolumes', params);
  }

  async createVolume<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createVolume', params);
  }

  async attachVolume<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('attachVolume', params);
  }

  async detachVolume<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('detachVolume', params);
  }

  async resizeVolume<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('resizeVolume', params);
  }

  async createSnapshot<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createSnapshot', params);
  }

  async listSnapshots<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listSnapshots', params);
  }

  // Network operations (extended)
  async createNetwork<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createNetwork', params);
  }

  async deleteNetwork<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteNetwork', params);
  }

  async listPublicIpAddresses<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listPublicIpAddresses', params);
  }

  async associateIpAddress<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('associateIpAddress', params);
  }

  async enableStaticNat<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('enableStaticNat', params);
  }

  async createFirewallRule<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createFirewallRule', params);
  }

  async listLoadBalancerRules<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listLoadBalancerRules', params);
  }

  async createLoadBalancerRule<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createLoadBalancerRule', params);
  }

  async deleteLoadBalancerRule<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteLoadBalancerRule', params);
  }

  async assignToLoadBalancerRule<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('assignToLoadBalancerRule', params);
  }

  async removeFromLoadBalancerRule<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('removeFromLoadBalancerRule', params);
  }

  async createPortForwardingRule<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createPortForwardingRule', params);
  }

  async listPortForwardingRules<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listPortForwardingRules', params);
  }

  async deletePortForwardingRule<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deletePortForwardingRule', params);
  }

  async listVPCs<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listVPCs', params);
  }

  async createVPC<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createVPC', params);
  }

  async deleteVPC<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteVPC', params);
  }

  async restartVPC<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('restartVPC', params);
  }

  async listRouters<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listRouters', params);
  }

  async startRouter<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('startRouter', params);
  }

  async stopRouter<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('stopRouter', params);
  }

  async rebootRouter<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('rebootRouter', params);
  }

  async destroyRouter<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('destroyRouter', params);
  }

  async listNetworkOfferings<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listNetworkOfferings', params);
  }

  async createNetworkOffering<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createNetworkOffering', params);
  }

  async disassociateIpAddress<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('disassociateIpAddress', params);
  }

  async disableStaticNat<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('disableStaticNat', params);
  }

  async listFirewallRules<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listFirewallRules', params);
  }

  async deleteFirewallRule<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteFirewallRule', params);
  }

  // Monitoring operations
  async listVirtualMachineMetrics<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listVirtualMachineMetrics', params);
  }

  async listEvents<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listEvents', params);
  }

  async deleteEvents<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    try {
      return await this.request('deleteEvents', params);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const sanitized = sanitizeParams(params);
      const context = `Failed to delete events (ids: ${sanitized.ids || 'N/A'}, type: ${sanitized.type || 'N/A'}, enddate: ${sanitized.enddate || 'N/A'})`;
      throw new Error(`${context}: ${errorMsg}`);
    }
  }

  async archiveEvents<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    try {
      return await this.request('archiveEvents', params);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const sanitized = sanitizeParams(params);
      const context = `Failed to archive events (ids: ${sanitized.ids || 'N/A'}, type: ${sanitized.type || 'N/A'}, enddate: ${sanitized.enddate || 'N/A'})`;
      throw new Error(`${context}: ${errorMsg}`);
    }
  }

  async listAlerts<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listAlerts', params);
  }

  async deleteAlerts<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    try {
      return await this.request('deleteAlerts', params);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const sanitized = sanitizeParams(params);
      const context = `Failed to delete alerts (ids: ${sanitized.ids || 'N/A'}, type: ${sanitized.type || 'N/A'}, enddate: ${sanitized.enddate || 'N/A'})`;
      throw new Error(`${context}: ${errorMsg}`);
    }
  }

  async archiveAlerts<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    try {
      return await this.request('archiveAlerts', params);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const sanitized = sanitizeParams(params);
      const context = `Failed to archive alerts (ids: ${sanitized.ids || 'N/A'}, type: ${sanitized.type || 'N/A'}, enddate: ${sanitized.enddate || 'N/A'})`;
      throw new Error(`${context}: ${errorMsg}`);
    }
  }

  async listCapacity<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listCapacity', params);
  }

  async listAsyncJobs<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listAsyncJobs', params);
  }

  // Account and User Management
  async listAccounts<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listAccounts', params);
  }

  async listUsers<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listUsers', params);
  }

  async listDomains<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listDomains', params);
  }

  async listUsageRecords<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('listUsageRecords', params);
  }

  // System Administration
  async listHosts<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listHosts', params);
  }

  async listClusters<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listClusters', params);
  }

  async listStoragePools<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listStoragePools', params);
  }

  async listSystemVms<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listSystemVms', params);
  }

  // Security operations
  async listSSHKeyPairs<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listSSHKeyPairs', params);
  }

  async createSSHKeyPair<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createSSHKeyPair', params);
  }

  async listSecurityGroups<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listSecurityGroups', params);
  }

  async authorizeSecurityGroupIngress<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('authorizeSecurityGroupIngress', params);
  }

  // System operations
  async listCapabilities<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listCapabilities', params);
  }

  // Kubernetes Cluster operations
  async createKubernetesCluster<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createKubernetesCluster', params);
  }

  async listKubernetesClusters<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listKubernetesClusters', params);
  }

  async startKubernetesCluster<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('startKubernetesCluster', params);
  }

  async stopKubernetesCluster<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('stopKubernetesCluster', params);
  }

  async deleteKubernetesCluster<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteKubernetesCluster', params);
  }

  async scaleKubernetesCluster<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('scaleKubernetesCluster', params);
  }

  async upgradeKubernetesCluster<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('upgradeKubernetesCluster', params);
  }

  async getKubernetesClusterConfig<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('getKubernetesClusterConfig', params);
  }

  async listKubernetesSupportedVersions<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listKubernetesSupportedVersions', params);
  }

  // Template operations
  async registerTemplate<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('registerTemplate', params);
  }

  async deleteTemplate<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteTemplate', params);
  }

  async updateTemplate<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateTemplate', params);
  }

  async copyTemplate<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('copyTemplate', params);
  }

  // ISO operations
  async listIsos<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listIsos', params);
  }

  async registerIso<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('registerIso', params);
  }

  async deleteIso<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteIso', params);
  }

  async attachIso<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('attachIso', params);
  }

  async detachIso<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('detachIso', params);
  }

  // Volume operations (additional)
  async deleteVolume<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteVolume', params);
  }

  // Snapshot operations (additional)
  async deleteSnapshot<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteSnapshot', params);
  }

  async revertSnapshot<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('revertToVMSnapshot', params);
  }

  // Disk Offering operations
  async listDiskOfferings<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listDiskOfferings', params);
  }

  // Tag operations
  async createTags<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createTags', params);
  }

  async deleteTags<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteTags', params);
  }

  async listTags<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listTags', params);
  }

  // Affinity Group operations
  async createAffinityGroup<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createAffinityGroup', params);
  }

  async deleteAffinityGroup<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteAffinityGroup', params);
  }

  async listAffinityGroups<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listAffinityGroups', params);
  }

  // NIC operations
  async listNics<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('listNics', params);
  }

  async addNicToVirtualMachine<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('addNicToVirtualMachine', params);
  }

  async removeNicFromVirtualMachine<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('removeNicFromVirtualMachine', params);
  }

  async updateDefaultNicForVirtualMachine<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateDefaultNicForVirtualMachine', params);
  }

  async addIpToNic<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('addIpToNic', params);
  }

  async removeIpFromNic<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('removeIpFromNic', params);
  }

  // ============================================================================
  // VPN Operations
  // ============================================================================

  async createVpnGateway<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createVpnGateway', params);
  }

  async deleteVpnGateway<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteVpnGateway', params);
  }

  async listVpnGateways<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listVpnGateways', params);
  }

  async createVpnConnection<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createVpnConnection', params);
  }

  async deleteVpnConnection<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteVpnConnection', params);
  }

  async listVpnConnections<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listVpnConnections', params);
  }

  async resetVpnConnection<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('resetVpnConnection', params);
  }

  async createVpnCustomerGateway<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createVpnCustomerGateway', params);
  }

  async updateVpnCustomerGateway<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateVpnCustomerGateway', params);
  }

  async deleteVpnCustomerGateway<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteVpnCustomerGateway', params);
  }

  async listVpnCustomerGateways<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listVpnCustomerGateways', params);
  }

  async createRemoteAccessVpn<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createRemoteAccessVpn', params);
  }

  async deleteRemoteAccessVpn<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteRemoteAccessVpn', params);
  }

  async listRemoteAccessVpns<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listRemoteAccessVpns', params);
  }

  async addVpnUser<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('addVpnUser', params);
  }

  async removeVpnUser<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('removeVpnUser', params);
  }

  async listVpnUsers<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listVpnUsers', params);
  }

  // ============================================================================
  // Project Operations
  // ============================================================================

  async createProject<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createProject', params);
  }

  async deleteProject<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteProject', params);
  }

  async updateProject<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateProject', params);
  }

  async listProjects<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listProjects', params);
  }

  async activateProject<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('activateProject', params);
  }

  async suspendProject<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('suspendProject', params);
  }

  async addAccountToProject<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('addAccountToProject', params);
  }

  async deleteAccountFromProject<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteAccountFromProject', params);
  }

  async listProjectAccounts<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listProjectAccounts', params);
  }

  async listProjectInvitations<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listProjectInvitations', params);
  }

  async updateProjectInvitation<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateProjectInvitation', params);
  }

  async deleteProjectInvitation<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteProjectInvitation', params);
  }

  // ============================================================================
  // Network ACL Operations
  // ============================================================================

  async createNetworkACL<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createNetworkACL', params);
  }

  async deleteNetworkACL<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteNetworkACL', params);
  }

  async updateNetworkACLItem<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateNetworkACLItem', params);
  }

  async listNetworkACLs<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listNetworkACLs', params);
  }

  async createNetworkACLList<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createNetworkACLList', params);
  }

  async deleteNetworkACLList<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteNetworkACLList', params);
  }

  async updateNetworkACLList<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateNetworkACLList', params);
  }

  async listNetworkACLLists<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listNetworkACLLists', params);
  }

  async replaceNetworkACLList<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('replaceNetworkACLList', params);
  }

  // ============================================================================
  // VM Snapshot Operations
  // ============================================================================

  async createVMSnapshot<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createVMSnapshot', params);
  }

  async deleteVMSnapshot<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteVMSnapshot', params);
  }

  async listVMSnapshot<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listVMSnapshot', params);
  }

  async revertToVMSnapshot<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('revertToVMSnapshot', params);
  }

  // ============================================================================
  // AutoScale Operations
  // ============================================================================

  async createAutoScalePolicy<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createAutoScalePolicy', params);
  }

  async updateAutoScalePolicy<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateAutoScalePolicy', params);
  }

  async deleteAutoScalePolicy<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteAutoScalePolicy', params);
  }

  async listAutoScalePolicies<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listAutoScalePolicies', params);
  }

  async createAutoScaleVmGroup<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createAutoScaleVmGroup', params);
  }

  async updateAutoScaleVmGroup<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateAutoScaleVmGroup', params);
  }

  async deleteAutoScaleVmGroup<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteAutoScaleVmGroup', params);
  }

  async listAutoScaleVmGroups<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listAutoScaleVmGroups', params);
  }

  async enableAutoScaleVmGroup<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('enableAutoScaleVmGroup', params);
  }

  async disableAutoScaleVmGroup<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('disableAutoScaleVmGroup', params);
  }

  async createAutoScaleVmProfile<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createAutoScaleVmProfile', params);
  }

  async updateAutoScaleVmProfile<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateAutoScaleVmProfile', params);
  }

  async deleteAutoScaleVmProfile<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteAutoScaleVmProfile', params);
  }

  async listAutoScaleVmProfiles<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listAutoScaleVmProfiles', params);
  }

  async createCondition<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createCondition', params);
  }

  async deleteCondition<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteCondition', params);
  }

  async listConditions<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listConditions', params);
  }

  async listCounters<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listCounters', params);
  }

  async createCounter<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createCounter', params);
  }

  async deleteCounter<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteCounter', params);
  }

  async updateCounter<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateCounter', params);
  }

  // ============================================================================
  // Backup Operations
  // ============================================================================

  async createBackupSchedule<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createBackupSchedule', params);
  }

  async deleteBackupSchedule<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteBackupSchedule', params);
  }

  async listBackupProviderOfferings<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listBackupProviderOfferings', params);
  }

  async listBackupOfferings<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listBackupOfferings', params);
  }

  async importBackupOffering<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('importBackupOffering', params);
  }

  async deleteBackupOffering<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteBackupOffering', params);
  }

  async assignVirtualMachineToBackupOffering<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('assignVirtualMachineToBackupOffering', params);
  }

  async removeVirtualMachineFromBackupOffering<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('removeVirtualMachineFromBackupOffering', params);
  }

  async createBackup<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createBackup', params);
  }

  async deleteBackup<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteBackup', params);
  }

  async listBackups<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listBackups', params);
  }

  async restoreBackup<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('restoreBackup', params);
  }

  // ============================================================================
  // Role Operations
  // ============================================================================

  async createRole<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createRole', params);
  }

  async updateRole<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateRole', params);
  }

  async deleteRole<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteRole', params);
  }

  async listRoles<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listRoles', params);
  }

  async createRolePermission<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createRolePermission', params);
  }

  async updateRolePermission<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateRolePermission', params);
  }

  async deleteRolePermission<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteRolePermission', params);
  }

  async listRolePermissions<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listRolePermissions', params);
  }

  async importRole<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('importRole', params);
  }

  // ============================================================================
  // VM Extensions
  // ============================================================================

  async recoverVirtualMachine<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('recoverVirtualMachine', params);
  }

  async updateVirtualMachine<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateVirtualMachine', params);
  }

  async assignVirtualMachine<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('assignVirtualMachine', params);
  }

  async restoreVirtualMachine<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('restoreVirtualMachine', params);
  }

  // ============================================================================
  // Storage Extensions
  // ============================================================================

  async updateVolume<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateVolume', params);
  }

  async migrateVolume<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('migrateVolume', params);
  }

  async extractVolume<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('extractVolume', params);
  }

  async listImageStores<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listImageStores', params);
  }

  async createSnapshotPolicy<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createSnapshotPolicy', params);
  }

  async deleteSnapshotPolicy<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteSnapshotPolicy', params);
  }

  async listSnapshotPolicies<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listSnapshotPolicies', params);
  }

  async updateSnapshotPolicy<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateSnapshotPolicy', params);
  }

  async revertSnapshotDisk<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('revertSnapshot', params);
  }

  // ============================================================================
  // Security Extensions
  // ============================================================================

  async createAccount<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createAccount', params);
  }

  async updateAccount<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateAccount', params);
  }

  async deleteAccount<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteAccount', params);
  }

  async disableAccount<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('disableAccount', params);
  }

  async enableAccount<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('enableAccount', params);
  }

  async lockAccount<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('lockAccount', params);
  }

  // ============================================================================
  // Network Core Extensions
  // ============================================================================

  async updateNetwork<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateNetwork', params);
  }

  async restartNetwork<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('restartNetwork', params);
  }

  async updateVpc<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateVPC', params);
  }

  async listVpcOfferings<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listVPCOfferings', params);
  }

  async createVpcOffering<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createVPCOffering', params);
  }

  async deleteVpcOffering<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteVPCOffering', params);
  }

  async updateVpcOffering<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateVPCOffering', params);
  }

  async listSupportedNetworkServices<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listSupportedNetworkServices', params);
  }

  async listNetworkServiceProviders<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listNetworkServiceProviders', params);
  }

  // ============================================================================
  // Network Rules Extensions
  // ============================================================================

  async createEgressFirewallRule<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createEgressFirewallRule', params);
  }

  async listEgressFirewallRules<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listEgressFirewallRules', params);
  }

  async deleteEgressFirewallRule<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteEgressFirewallRule', params);
  }

  async updateLoadBalancerRule<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateLoadBalancerRule', params);
  }

  async listLBStickinessPolicies<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listLBStickinessPolicies', params);
  }

  async createLBStickinessPolicy<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createLBStickinessPolicy', params);
  }

  async deleteLBStickinessPolicy<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteLBStickinessPolicy', params);
  }

  // ============================================================================
  // Admin Extensions
  // ============================================================================

  async createZone<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createZone', params);
  }

  async updateZone<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateZone', params);
  }

  async deleteZone<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteZone', params);
  }

  async createPod<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createPod', params);
  }

  async updatePod<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updatePod', params);
  }

  async deletePod<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deletePod', params);
  }

  async listPods<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listPods', params);
  }

  async addCluster<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('addCluster', params);
  }

  async updateCluster<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateCluster', params);
  }

  async deleteCluster<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteCluster', params);
  }

  async addHost<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('addHost', params);
  }

  async updateHost<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateHost', params);
  }

  async deleteHost<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteHost', params);
  }

  async reconnectHost<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('reconnectHost', params);
  }

  async prepareHostForMaintenance<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('prepareHostForMaintenance', params);
  }

  async cancelHostMaintenance<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('cancelHostMaintenance', params);
  }

  async createDomain<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createDomain', params);
  }

  async updateDomain<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateDomain', params);
  }

  async deleteDomain<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteDomain', params);
  }

  async createUser<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createUser', params);
  }

  async updateUser<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateUser', params);
  }

  async deleteUser<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('deleteUser', params);
  }

  async disableUser<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('disableUser', params);
  }

  async enableUser<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('enableUser', params);
  }

  async listConfigurations<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listConfigurations', params);
  }

  async updateConfiguration<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateConfiguration', params);
  }

  async startSystemVm<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('startSystemVm', params);
  }

  async stopSystemVm<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('stopSystemVm', params);
  }

  async rebootSystemVm<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('rebootSystemVm', params);
  }

  async destroySystemVm<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('destroySystemVm', params);
  }

  async migrateSystemVm<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('migrateSystemVm', params);
  }

  async createConsoleEndpoint<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('createConsoleEndpoint', params);
  }

  // ============================================================================
  // Template Extensions
  // ============================================================================

  async extractTemplate<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('extractTemplate', params);
  }

  async updateTemplatePermissions<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateTemplatePermissions', params);
  }

  async listTemplatePermissions<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('listTemplatePermissions', params);
  }

  // ============================================================================
  // Monitoring Extensions
  // ============================================================================

  async listEventTypes<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listEventTypes', params);
  }

  async generateUsageRecords<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('generateUsageRecords', params);
  }

  async listUsageTypes<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listUsageTypes', params);
  }

  async addAnnotation<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('addAnnotation', params);
  }

  async removeAnnotation<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('removeAnnotation', params);
  }

  async listAnnotations<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listAnnotations', params);
  }

  // ============================================================================
  // Affinity Group Extensions
  // ============================================================================

  async updateVMAffinityGroup<T = CloudStackResponse>(params: CloudStackParams): Promise<T> {
    return this.request('updateVMAffinityGroup', params);
  }

  async listAffinityGroupTypes<T = CloudStackResponse>(params: CloudStackParams = {}): Promise<T> {
    return this.request('listAffinityGroupTypes', params);
  }

  /**
   * Close the CloudStack client and cleanup resources
   * Destroys the HTTPS agent to close keep-alive connections
   */
  close(): void {
    // Destroy the HTTPS agent to close all keep-alive connections
    const httpsAgent = this.axios.defaults.httpsAgent;
    if (httpsAgent && typeof httpsAgent.destroy === 'function') {
      httpsAgent.destroy();
    }

    this.logger.debug('CloudStack client closed, connections cleaned up');
  }
}