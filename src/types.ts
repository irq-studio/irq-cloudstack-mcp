// Re-export RateLimiterConfig from its source module
export type { RateLimiterConfig } from './utils/rate-limiter.js';

/**
 * Connection pooling configuration for HTTP/HTTPS agent
 */
export interface ConnectionPoolConfig {
  /** Enable keep-alive for persistent connections */
  keepAlive?: boolean;
  /** Milliseconds to keep idle connections alive */
  keepAliveMsecs?: number;
  /** Maximum number of concurrent sockets per host */
  maxSockets?: number;
  /** Maximum number of idle sockets to keep open per host */
  maxFreeSockets?: number;
  /** Socket timeout in milliseconds */
  socketTimeout?: number;
}

/**
 * Configuration for CloudStack API client
 * This is the canonical definition - import from this module
 */
export interface CloudStackConfig {
  /** CloudStack API endpoint URL */
  apiUrl: string;
  /** CloudStack API key */
  apiKey: string;
  /** CloudStack secret key for request signing */
  secretKey: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Whether to reject self-signed SSL certificates */
  rejectUnauthorized?: boolean;
  /** Rate limiting configuration */
  rateLimitConfig?: Partial<import('./utils/rate-limiter.js').RateLimiterConfig>;
  /** Connection pool configuration */
  connectionPoolConfig?: Partial<ConnectionPoolConfig>;
}

/**
 * Type for array values in CloudStack API parameters
 */
export type CloudStackArrayValue =
  | string[]
  | number[]
  | Array<{ key: string; value: string }>
  | Array<{ service: string; provider: string }>;

/**
 * MCP Content Item types
 */
export type McpContentType = 'text' | 'image' | 'resource';

/**
 * MCP Content Item interface
 */
export interface McpContentItem {
  type: McpContentType;
  text?: string;
  data?: string;
  mimeType?: string;
  uri?: string;
  [key: string]: unknown;
}

/**
 * Common interface for all handler classes
 */
export interface HandlerClass {
  readonly cloudStackClient: import('./cloudstack-client.js').CloudStackClient;
}

/**
 * MCP Response type that matches the CallToolResult schema from the MCP SDK
 * This ensures compatibility with the @modelcontextprotocol/sdk types
 */
export interface McpResponse {
  content: Array<McpContentItem>;
  isError?: boolean;
  _meta?: Record<string, unknown>;
}