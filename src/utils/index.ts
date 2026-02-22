/**
 * Utility exports
 */

// Environment variable parsing utilities
/**
 * Safely parse an integer from environment variable with NaN validation
 */
export function safeParseInt(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Safely parse a float from environment variable with NaN validation
 */
export function safeParseFloat(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

// Formatter utilities
export {
  safeValue,
  formatBytes,
  formatDate,
  conditionalLine,
  formatItem,
  formatList,
  createMcpResponse,
  formatSections,
  type FieldDefinition,
} from './formatter.js';

// Handler factory
export {
  createListHandler,
  createGetHandler,
  createActionHandler,
  createHandlers,
  type ListHandlerConfig,
  type GetHandlerConfig,
  type ActionHandlerConfig,
} from './handler-factory.js';

// Version manager
export {
  VersionManager,
  getVersionManager,
  VERSION_FEATURES,
  type ParsedVersion,
  type FeatureFlags,
} from './version-manager.js';

// API proxy
export {
  createApiProxy,
  getApiMethodMeta,
  isKnownApiMethod,
  getAllApiMethods,
  getAsyncApiMethods,
  API_METHODS,
  type CloudStackApiProxy,
  type ApiMethodMeta,
} from './api-proxy.js';

// Tool registry generator
export {
  ToolType,
  toolNameToApiCommand,
  apiCommandToToolName,
  createToolHandler,
  autoRegisterTools,
  validateToolCoverage,
  TOOL_TO_API_MAP,
  type ToolConfig,
  type ToolDefinition,
  type ToolHandlerFn,
} from './tool-registry-generator.js';

// Existing utilities
export { Logger, LogLevel, type LogEntry, type LogContext } from './logger.js';
export { globalMetrics, MetricsTracker, type ApiCallMetrics, type MetricsSummary } from './metrics.js';
export {
  RateLimitError,
  createRateLimiter,
  type RateLimiter,
  type RateLimiterConfig,
} from './rate-limiter.js';
