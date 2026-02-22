/**
 * Generic handler factory to eliminate copy-paste handlers
 * Provides a declarative way to define list/get/create/delete handlers
 */

import type { CloudStackClient, CloudStackParams } from '../cloudstack-client.js';
import type { McpResponse } from '../types.js';
import { createMcpResponse, safeValue, type FieldDefinition } from './formatter.js';

/**
 * Standard handler function signature for all MCP tool handlers
 */
export type HandlerFn = (args: CloudStackParams) => Promise<McpResponse>;

/**
 * Configuration for a list handler
 * @template TItem - The item type (can be any interface)
 */
export interface ListHandlerConfig<TItem> {
  /** Discriminant for config type */
  kind?: 'list';
  /** CloudStack API command name */
  command: string;
  /** Response key (e.g., 'listvirtualmachinesresponse') */
  responseKey: string;
  /** Array key within response (e.g., 'virtualmachine') */
  arrayKey: string;
  /** Display name for single item (e.g., 'virtual machine') */
  itemName: string;
  /** Display name for multiple items (optional, defaults to itemName + 's') */
  itemNamePlural?: string;
  /** Field to use as item title */
  titleField: keyof TItem;
  /** Field to use as item ID */
  idField: keyof TItem;
  /** Fields to display in output */
  fields: FieldDefinition<TItem>[];
  /** Optional transform function for items */
  transform?: (item: unknown) => TItem;
  /** Default arguments to pass to the API call */
  defaultArgs?: CloudStackParams;
}

/**
 * Create a generic list handler
 */
export function createListHandler<TItem>(
  client: CloudStackClient,
  config: ListHandlerConfig<TItem>
) {
  return async (args: CloudStackParams = {}) => {
    // Merge default args with provided args
    const mergedArgs = { ...config.defaultArgs, ...args };
    const result = await client.request<Record<string, unknown>>(config.command, mergedArgs);
    const response = result[config.responseKey] as Record<string, unknown> | undefined;
    const rawItems = (response?.[config.arrayKey] as unknown[]) || [];

    const items = config.transform
      ? rawItems.map(config.transform)
      : (rawItems as TItem[]);

    const text = formatListGeneric(items, {
      itemName: config.itemName,
      itemNamePlural: config.itemNamePlural,
      titleField: config.titleField,
      idField: config.idField,
      fields: config.fields,
    });

    return createMcpResponse(text);
  };
}

/**
 * Generic list formatter that works with any type
 */
/**
 * Safely get a property from an item with type checking
 */
function getProperty<T>(item: T, key: keyof T | string): unknown {
  if (item && typeof item === 'object') {
    return (item as Record<string, unknown>)[key as string];
  }
  return undefined;
}

/**
 * Safely convert a value to string
 */
function asString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return undefined;
}

function formatListGeneric<T>(
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
    const title = safeValue(asString(getProperty(item, config.titleField)), 'Unknown');
    const id = safeValue(asString(getProperty(item, config.idField)), 'Unknown');
    const details = formatItemGeneric(item, config.fields);
    return `• ${title} (${id})\n${details}`;
  });

  return `Found ${items.length} ${items.length === 1 ? config.itemName : plural}:\n\n${formatted.join('\n\n')}`;
}

/**
 * Generic item formatter that works with any type
 */
function formatItemGeneric<T>(
  item: T,
  fields: FieldDefinition<T>[],
  indent: string = '  '
): string {
  const lines: string[] = [];

  for (const field of fields) {
    const value = typeof field.key === 'function'
      ? field.key(item)
      : getProperty(item, field.key as string);

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
 * Configuration for a get (single item) handler
 */
export interface GetHandlerConfig<TItem> {
  /** Discriminant for config type */
  kind?: 'get';
  /** CloudStack API command name (usually same as list) */
  command: string;
  /** Response key */
  responseKey: string;
  /** Array key within response */
  arrayKey: string;
  /** Display name for item type */
  itemName: string;
  /** ID parameter name */
  idParam: string;
  /** Detailed fields to display */
  fields: FieldDefinition<TItem>[];
  /** Optional transform function */
  transform?: (item: unknown) => TItem;
  /** Custom format function for complex items */
  customFormat?: (item: TItem) => string;
}

/**
 * Create a generic get (single item) handler
 */
export function createGetHandler<TItem>(
  client: CloudStackClient,
  config: GetHandlerConfig<TItem>
) {
  return async (args: CloudStackParams) => {
    const id = args[config.idParam];
    if (!id) {
      return createMcpResponse(`Error: ${config.idParam} is required`, true);
    }

    const result = await client.request<Record<string, unknown>>(
      config.command,
      { [config.idParam]: id }
    );
    const response = result[config.responseKey] as Record<string, unknown> | undefined;
    const rawItems = (response?.[config.arrayKey] as unknown[]) || [];

    if (rawItems.length === 0) {
      return createMcpResponse(`${config.itemName} with ${config.idParam} "${id}" not found.`, true);
    }

    const item = config.transform
      ? config.transform(rawItems[0])
      : (rawItems[0] as TItem);

    if (config.customFormat) {
      return createMcpResponse(config.customFormat(item));
    }

    // Build detailed output using the generic formatter
    const details = formatItemGeneric(item, config.fields);
    return createMcpResponse(`${config.itemName} Details:\n\n${details}`);
  };
}

/**
 * Configuration for an action handler (create/delete/start/stop/etc.)
 */
export interface ActionHandlerConfig {
  /** Discriminant for config type */
  kind?: 'action';
  /** CloudStack API command name */
  command: string;
  /** Response key */
  responseKey: string;
  /** Action description for success message (e.g., 'Created', 'Deleted') */
  actionVerb: string;
  /** Item type name */
  itemName: string;
  /** Required fields */
  requiredFields?: string[];
  /** Field in response containing job ID */
  jobIdField?: string;
  /** Field in response containing result ID */
  resultIdField?: string;
  /** Custom success message builder */
  successMessage?: (args: CloudStackParams, result: Record<string, unknown>) => string;
}

/**
 * Create a generic action handler
 */
export function createActionHandler(
  client: CloudStackClient,
  config: ActionHandlerConfig
) {
  return async (args: CloudStackParams) => {
    // Validate required fields
    if (config.requiredFields) {
      for (const field of config.requiredFields) {
        if (args[field] === undefined || args[field] === null || args[field] === '') {
          return createMcpResponse(`Error: ${field} is required for ${config.command}`, true);
        }
      }
    }

    const result = await client.request<Record<string, unknown>>(config.command, args);
    const response = result[config.responseKey] as Record<string, unknown> | undefined;

    if (config.successMessage) {
      return createMcpResponse(config.successMessage(args, response || {}));
    }

    // Build standard success message
    const parts: string[] = [`${config.actionVerb} ${config.itemName}`];

    if (config.resultIdField && response?.[config.resultIdField]) {
      parts.push(`ID: ${response[config.resultIdField]}`);
    }

    if (config.jobIdField && response?.[config.jobIdField]) {
      parts.push(`Job ID: ${response[config.jobIdField]}`);
      parts.push('');
      parts.push('Operation initiated. Use query_async_job_result to check status.');
    }

    return createMcpResponse(parts.join('\n'));
  };
}

/**
 * Batch create handlers from configurations
 */
export function createHandlers<TConfigs extends Record<string, ListHandlerConfig<never> | GetHandlerConfig<never> | ActionHandlerConfig>>(
  client: CloudStackClient,
  configs: TConfigs
): Record<keyof TConfigs, (args: CloudStackParams) => Promise<{ content: { type: 'text'; text: string }[] }>> {
  const handlers: Record<string, (args: CloudStackParams) => Promise<{ content: { type: 'text'; text: string }[] }>> = {};

  for (const [name, config] of Object.entries(configs)) {
    if (config.kind === 'list' || (!config.kind && 'arrayKey' in config && 'titleField' in config)) {
      handlers[name] = createListHandler(client, config as ListHandlerConfig<never>);
    } else if (config.kind === 'get' || (!config.kind && 'arrayKey' in config && 'idParam' in config)) {
      handlers[name] = createGetHandler(client, config as GetHandlerConfig<never>);
    } else {
      handlers[name] = createActionHandler(client, config as ActionHandlerConfig);
    }
  }

  return handlers as Record<keyof TConfigs, (args: CloudStackParams) => Promise<{ content: { type: 'text'; text: string }[] }>>;
}
