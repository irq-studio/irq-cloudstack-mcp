/**
 * Structured logging utility for CloudStack MCP Server
 *
 * Provides consistent, structured logging with:
 * - Log levels (debug, info, warn, error)
 * - Structured data support
 * - Request/operation context tracking
 * - Environment-based filtering
 * - JSON output for observability tools
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  /** Unique request/operation ID for tracing */
  requestId?: string;
  /** Operation name (e.g., 'deployVirtualMachine', 'listNetworks') */
  operation?: string;
  /** User/account context */
  user?: string;
  /** Additional context fields */
  [key: string]: unknown;
}

export interface LogEntry {
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Log level */
  level: string;
  /** Log message */
  message: string;
  /** Contextual data */
  context?: LogContext;
  /** Error details if applicable */
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  /** Additional structured data */
  data?: Record<string, unknown>;
}

/**
 * Logger class for structured logging
 */
export class Logger {
  private readonly context: LogContext;
  private readonly minLevel: LogLevel;

  constructor(context: LogContext = {}, minLevel?: LogLevel) {
    this.context = context;
    this.minLevel = minLevel ?? this.getMinLevelFromEnv();
  }

  /**
   * Get minimum log level from environment
   */
  private getMinLevelFromEnv(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase();
    switch (level) {
      case 'DEBUG':
        return LogLevel.DEBUG;
      case 'INFO':
        return LogLevel.INFO;
      case 'WARN':
        return LogLevel.WARN;
      case 'ERROR':
        return LogLevel.ERROR;
      default:
        // Default to INFO in production, DEBUG in development
        return process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    return new Logger(
      { ...this.context, ...context },
      this.minLevel
    );
  }

  /**
   * Log a debug message
   */
  debug(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log an info message
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error, data?: Record<string, unknown>): void {
    const errorData = error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: (error as { code?: string }).code,
    } : undefined;

    this.log(LogLevel.ERROR, message, data, errorData);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
    error?: LogEntry['error']
  ): void {
    // Filter based on minimum level
    if (level < this.minLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
    };

    if (Object.keys(this.context).length > 0) {
      entry.context = this.context;
    }

    if (data) {
      entry.data = data;
    }

    if (error) {
      entry.error = error;
    }

    // Output to stderr for structured logs (stdout is reserved for MCP protocol)
    console.error(JSON.stringify(entry));
  }

  /**
   * Log an API request
   */
  logApiRequest(command: string, params?: Record<string, unknown>): void {
    this.debug('CloudStack API request', {
      command,
      params: this.sanitizeParams(params),
    });
  }

  /**
   * Log an API response
   */
  logApiResponse(command: string, duration: number, success: boolean): void {
    const level = success ? LogLevel.DEBUG : LogLevel.WARN;
    this.log(level, 'CloudStack API response', {
      command,
      duration_ms: duration,
      success,
    });
  }

  /**
   * Log a tool invocation
   */
  logToolInvocation(toolName: string, args?: Record<string, unknown>): void {
    this.info('MCP tool invocation', {
      tool: toolName,
      args: this.sanitizeParams(args),
    });
  }

  /**
   * Log a tool completion
   */
  logToolCompletion(toolName: string, duration: number, success: boolean): void {
    const level = success ? LogLevel.INFO : LogLevel.ERROR;
    this.log(level, 'MCP tool completion', {
      tool: toolName,
      duration_ms: duration,
      success,
    });
  }

  /**
   * Sanitize parameters to remove sensitive data
   */
  private sanitizeParams(params?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!params) {
      return undefined;
    }

    const sanitized = { ...params };
    const sensitiveKeys = [
      'password', 'apikey', 'secretkey', 'accesskey', 'signature',
      'token', 'key', 'secret', 'credential', 'auth',
      'privatekey', 'publickey', 'userdata', 'sessionkey',
    ];

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger();

/**
 * Create a logger for a specific operation
 */
export function createOperationLogger(operation: string, requestId?: string): Logger {
  return logger.child({
    operation,
    requestId: requestId ?? generateRequestId(),
  });
}

/**
 * Generate a unique request ID using cryptographic randomness
 */
function generateRequestId(): string {
  return `req_${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
}
