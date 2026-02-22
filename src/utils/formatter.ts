/**
 * Formatter utilities for consistent, safe output formatting
 * Eliminates "undefined" in output and provides consistent formatting
 */

/**
 * Safely format a value, returning fallback if undefined/null
 */
export function safeValue<T>(value: T | undefined | null, fallback: string = 'N/A'): string {
  if (value === undefined || value === null) {
    return fallback;
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  return String(value);
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number | undefined, fallback: string = 'N/A'): string {
  if (bytes === undefined || bytes === null) {
    return fallback;
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Format a date string safely
 */
export function formatDate(date: string | undefined, fallback: string = 'N/A'): string {
  if (!date) {
    return fallback;
  }
  try {
    return new Date(date).toISOString();
  } catch {
    return date;
  }
}

/**
 * Conditionally include a line in output only if value exists
 */
export function conditionalLine(label: string, value: unknown, indent: string = '  '): string {
  if (value === undefined || value === null || value === '') {
    return '';
  }
  if (typeof value === 'boolean') {
    return `\n${indent}${label}: ${value ? 'Yes' : 'No'}`;
  }
  return `\n${indent}${label}: ${value}`;
}

/**
 * Field definition for generic list formatting
 * @template T - The item type (no constraint required)
 */
export interface FieldDefinition<T> {
  /** Display label for the field */
  label: string;
  /** Property key or function to extract value */
  key: keyof T | ((item: T) => unknown);
  /** Format function - receives value and full item for complex formatting */
  format?: (value: unknown, item: T) => string | undefined;
  /** Only show if value exists */
  conditional?: boolean;
  /** Skip this field entirely if the formatted value is undefined */
  skipIfUndefined?: boolean;
}

/**
 * Format a single item with field definitions
 */
export function formatItem<T extends Record<string, unknown>>(
  item: T,
  fields: FieldDefinition<T>[],
  indent: string = '  '
): string {
  const lines: string[] = [];

  for (const field of fields) {
    const value = typeof field.key === 'function'
      ? field.key(item)
      : item[field.key];

    // Skip conditional fields that have no value
    if (field.conditional && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Format the value, passing item for complex formatting
    const formatted = field.format
      ? field.format(value, item)
      : safeValue(value as string | number | boolean | undefined);

    // Skip if format returned undefined and skipIfUndefined is set
    if (field.skipIfUndefined && formatted === undefined) {
      continue;
    }

    lines.push(`${indent}${field.label}: ${formatted ?? 'N/A'}`);
  }

  return lines.join('\n');
}

/**
 * Format a list of items for MCP response
 */
export function formatList<T extends Record<string, unknown>>(
  items: T[],
  config: {
    itemName: string;
    itemNamePlural?: string;
    titleField: keyof T;
    idField: keyof T;
    fields: FieldDefinition<T>[];
  }
): string {
  const plural = config.itemNamePlural || `${config.itemName}s`;

  if (items.length === 0) {
    return `No ${plural} found.`;
  }

  const formatted = items.map((item) => {
    const title = safeValue(item[config.titleField] as string | undefined, 'Unknown');
    const id = safeValue(item[config.idField] as string | undefined, 'Unknown');
    const details = formatItem(item, config.fields);
    return `• ${title} (${id})\n${details}`;
  });

  return `Found ${items.length} ${items.length === 1 ? config.itemName : plural}:\n\n${formatted.join('\n\n')}`;
}

/**
 * Create standard MCP response content
 */
export function createMcpResponse(text: string, isError: boolean = false) {
  return {
    content: [{ type: 'text' as const, text }],
    ...(isError && { isError: true }),
  };
}

/**
 * Format key-value sections (like capabilities)
 */
export function formatSections(sections: {
  title: string;
  items: { label: string; value: unknown; conditional?: boolean }[];
}[]): string {
  const formatted: string[] = [];

  for (const section of sections) {
    const lines: string[] = [section.title];

    for (const item of section.items) {
      if (item.conditional && (item.value === undefined || item.value === null)) {
        continue;
      }
      const value = typeof item.value === 'boolean'
        ? (item.value ? 'Enabled' : 'Disabled')
        : safeValue(item.value as string | number | undefined);
      lines.push(`• ${item.label}: ${value}`);
    }

    if (lines.length > 1) {
      formatted.push(lines.join('\n'));
    }
  }

  return formatted.join('\n\n');
}
