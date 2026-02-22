/**
 * Response formatting utilities for MCP handlers
 * Reduces duplication in handler response creation
 */

export interface McpResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

/**
 * Creates a simple text response for MCP
 */
export function createTextResponse(text: string): McpResponse {
  return {
    content: [
      {
        type: 'text',
        text
      }
    ]
  };
}

/**
 * Creates a response for a successful async job operation
 */
export function createJobResponse(
  resourceType: string,
  operation: string,
  resourceId: string,
  jobId: string | undefined
): McpResponse {
  return createTextResponse(
    `${operation} ${resourceType} ${resourceId}. Job ID: ${jobId || 'N/A'}`
  );
}

/**
 * Creates a response for listing resources
 */
export function createListResponse<T>(
  resourceType: string,
  items: T[],
  formatter: (item: T) => string
): McpResponse {
  if (items.length === 0) {
    return createTextResponse(`No ${resourceType}s found.`);
  }

  const formattedItems = items.map(formatter).join('\n\n');
  return createTextResponse(
    `Found ${items.length} ${resourceType}${items.length === 1 ? '' : 's'}:\n\n${formattedItems}`
  );
}

/**
 * Creates a response for a single resource detail
 */
export function createDetailResponse(
  resourceType: string,
  details: Record<string, unknown>
): McpResponse {
  const formattedDetails = Object.entries(details)
    .map(([key, value]) => {
      const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
      return `${label}: ${formatValue(value)}`;
    })
    .join('\n');

  return createTextResponse(`${resourceType} Details:\n\n${formattedDetails}`);
}

/**
 * Formats a value for display (handles arrays, objects, null, undefined)
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return 'None';
    return value.map(v => formatValue(v)).join(', ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

/**
 * Creates a response for operation success with metadata
 */
export function createSuccessResponse(
  operation: string,
  metadata?: Record<string, string | number | undefined>
): McpResponse {
  let text = `${operation} completed successfully.`;

  if (metadata && Object.keys(metadata).length > 0) {
    const metadataText = Object.entries(metadata)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    if (metadataText) {
      text += `\n\n${metadataText}`;
    }
  }

  return createTextResponse(text);
}

/**
 * Creates an error response for MCP
 */
export function createErrorResponse(
  operation: string,
  error: Error | unknown
): McpResponse {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return createTextResponse(`Error during ${operation}: ${errorMessage}`);
}

/**
 * Formats a key-value map into a readable string
 */
export function formatKeyValuePairs(
  pairs: Record<string, string | number | boolean | undefined | null>,
  indent: string = ''
): string {
  return Object.entries(pairs)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => {
      const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
      return `${indent}${label}: ${value}`;
    })
    .join('\n');
}
