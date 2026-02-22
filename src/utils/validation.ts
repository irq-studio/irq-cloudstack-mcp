/**
 * Validation utilities for CloudStack MCP server
 */

/**
 * Custom error for invalid parameters
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates date format (YYYY-MM-DD)
 * @param date - Date string to validate
 * @param paramName - Name of parameter for error messages
 * @throws ValidationError if date format is invalid
 */
export function validateDateFormat(date: string, paramName: string): void {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new ValidationError(
      `${paramName} must be in YYYY-MM-DD format (e.g., 2025-01-15). Received: ${date}`
    );
  }

  // Validate that it's a real date
  const parts = date.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const dateObj = new Date(year, month - 1, day);
  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month - 1 ||
    dateObj.getDate() !== day
  ) {
    throw new ValidationError(
      `${paramName} is not a valid date: ${date}`
    );
  }
}

/**
 * Validates and sanitizes comma-separated ID list
 * @param ids - Comma-separated ID string
 * @param maxCount - Maximum number of IDs allowed (default: 100)
 * @returns Sanitized comma-separated ID string
 * @throws ValidationError if ID list is invalid or exceeds max count
 */
export function sanitizeIdList(ids: string, maxCount: number = 100): string {
  if (!ids || !ids.trim()) {
    throw new ValidationError('IDs parameter cannot be empty');
  }

  const idList = ids
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  if (idList.length === 0) {
    throw new ValidationError(
      'No valid IDs found in comma-separated list. Ensure IDs are not empty or contain only whitespace.'
    );
  }

  if (idList.length > maxCount) {
    throw new ValidationError(
      `Maximum ${maxCount} IDs can be processed at once. Received: ${idList.length} IDs`
    );
  }

  return idList.join(',');
}

/**
 * Validates date range parameters
 * @param startdate - Start date (optional)
 * @param enddate - End date (optional)
 * @throws ValidationError if date range is invalid
 */
export function validateDateRange(startdate?: string, enddate?: string): void {
  if (startdate && !enddate) {
    throw new ValidationError(
      'startdate requires enddate to be specified. Provide both dates for a date range, or only enddate to delete/archive items older than that date.'
    );
  }

  if (startdate) {
    validateDateFormat(startdate, 'startdate');
  }

  if (enddate) {
    validateDateFormat(enddate, 'enddate');
  }

  // Validate that start date is before end date
  if (startdate && enddate) {
    const start = new Date(startdate);
    const end = new Date(enddate);
    if (start > end) {
      throw new ValidationError(
        `startdate (${startdate}) must be before or equal to enddate (${enddate})`
      );
    }
  }
}

/**
 * Validates that at least one parameter is provided
 * @param params - Object with optional parameters
 * @param paramNames - List of parameter names to check
 * @param operationName - Name of operation for error message
 * @throws ValidationError if no parameters are provided
 */
export function requireAtLeastOneParam(
  params: Record<string, unknown>,
  paramNames: string[],
  operationName: string
): void {
  const hasAtLeastOne = paramNames.some((name) => {
    const value = params[name];
    return value !== undefined && value !== null;
  });

  if (!hasAtLeastOne) {
    throw new ValidationError(
      `${operationName} requires at least one parameter: ${paramNames.join(', ')}`
    );
  }
}

/**
 * Checks if CloudStack API response indicates success
 * @param response - CloudStack API response object
 * @param responseName - Name of the response object (e.g., 'deleteeventsresponse')
 * @returns true if operation was successful
 * @throws Error if response is malformed or operation failed
 */
export function checkApiSuccess(response: unknown, responseName: string): boolean {
  if (!response || typeof response !== 'object') {
    throw new Error(`Invalid API response: missing ${responseName}`);
  }

  const responseObj = response as Record<string, unknown>;
  if (!responseObj[responseName]) {
    throw new Error(`Invalid API response: missing ${responseName}`);
  }

  const responseData = responseObj[responseName] as Record<string, unknown>;

  // CloudStack returns success as string 'true' or boolean true
  const success = responseData.success === 'true' || responseData.success === true;

  if (!success) {
    const displaytext = typeof responseData.displaytext === 'string'
      ? responseData.displaytext
      : 'Unknown error';
    throw new Error(`Operation failed: ${displaytext}`);
  }

  return true;
}

/**
 * Type guard to check if a value is a string
 * @param value - Value to check
 * @returns true if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if a value is a number
 * @param value - Value to check
 * @returns true if value is a number and not NaN
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard to check if a value is a boolean
 * @param value - Value to check
 * @returns true if value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard to check if a value is a non-null object
 * @param value - Value to check
 * @returns true if value is an object and not null
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if a value is an array
 * @param value - Value to check
 * @returns true if value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if a value is a string array
 * @param value - Value to check
 * @returns true if value is an array of strings
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

/**
 * Type guard to check if a value is defined (not undefined or null)
 * @param value - Value to check
 * @returns true if value is not undefined and not null
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * Safely gets a string property from an object
 * @param obj - Object to get property from
 * @param key - Property key
 * @param defaultValue - Default value if property is not a string
 * @returns String value or default
 */
export function getStringProperty(
  obj: Record<string, unknown>,
  key: string,
  defaultValue: string = ''
): string {
  const value = obj[key];
  return isString(value) ? value : defaultValue;
}

/**
 * Safely gets a number property from an object
 * @param obj - Object to get property from
 * @param key - Property key
 * @param defaultValue - Default value if property is not a number
 * @returns Number value or default
 */
export function getNumberProperty(
  obj: Record<string, unknown>,
  key: string,
  defaultValue: number = 0
): number {
  const value = obj[key];
  return isNumber(value) ? value : defaultValue;
}

/**
 * Safely gets a boolean property from an object
 * @param obj - Object to get property from
 * @param key - Property key
 * @param defaultValue - Default value if property is not a boolean
 * @returns Boolean value or default
 */
export function getBooleanProperty(
  obj: Record<string, unknown>,
  key: string,
  defaultValue: boolean = false
): boolean {
  const value = obj[key];
  return isBoolean(value) ? value : defaultValue;
}

/**
 * Safely gets an object property from an object
 * @param obj - Object to get property from
 * @param key - Property key
 * @returns Object value or empty object
 */
export function getObjectProperty(
  obj: Record<string, unknown>,
  key: string
): Record<string, unknown> {
  const value = obj[key];
  return isObject(value) ? value : {};
}

/**
 * Safely gets an array property from an object
 * @param obj - Object to get property from
 * @param key - Property key
 * @returns Array value or empty array
 */
export function getArrayProperty(
  obj: Record<string, unknown>,
  key: string
): unknown[] {
  const value = obj[key];
  return isArray(value) ? value : [];
}

/**
 * Validates array size limits
 * @param array - Array to validate
 * @param maxSize - Maximum allowed size
 * @param paramName - Name of parameter for error messages
 * @throws ValidationError if array exceeds max size
 */
export function validateArraySize(
  array: unknown[],
  maxSize: number,
  paramName: string
): void {
  if (!Array.isArray(array)) {
    throw new ValidationError(`${paramName} must be an array`);
  }

  if (array.length > maxSize) {
    throw new ValidationError(
      `${paramName} cannot exceed ${maxSize} items. Received: ${array.length} items`
    );
  }
}

/**
 * Default maximum array size for bulk operations - lazy initialized
 * Can be configured via CLOUDSTACK_MAX_ARRAY_SIZE environment variable
 */
let _defaultMaxArraySize: number | null = null;
export function getDefaultMaxArraySize(): number {
  if (_defaultMaxArraySize === null) {
    _defaultMaxArraySize = process.env.CLOUDSTACK_MAX_ARRAY_SIZE
      ? parseInt(process.env.CLOUDSTACK_MAX_ARRAY_SIZE, 10)
      : 100;
  }
  return _defaultMaxArraySize;
}
// Backwards-compatible export
export const DEFAULT_MAX_ARRAY_SIZE = 100;
