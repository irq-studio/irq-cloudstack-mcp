/**
 * Tool Registry Pattern Implementation
 *
 * This module provides a registry-based approach to tool handling,
 * replacing the large switch statement anti-pattern in server.ts.
 *
 * Benefits:
 * - Open/Closed Principle: Add new tools without modifying server.ts
 * - Better maintainability: Handler routing logic is centralized
 * - Type safety: Handlers are properly typed
 * - Easier testing: Individual handlers can be tested in isolation
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { McpResponse } from './types.js';

/**
 * Interface for all tool handlers
 * Each handler must implement the handle method
 * @template TArgs - The type of arguments the handler accepts
 */
export interface ToolHandler<TArgs = unknown> {
  /**
   * Handle a tool invocation
   * @param args - Arguments passed to the tool
   * @returns MCP-formatted response
   */
  handle(args: TArgs): Promise<McpResponse>;
}

/**
 * Registry for managing tool handlers
 * Provides registration and execution of handlers by tool name
 */
export class ToolRegistry {
  private handlers = new Map<string, ToolHandler<unknown>>();

  /**
   * Register a handler for a specific tool name
   * @param toolName - The name of the tool (e.g., 'list_virtual_machines')
   * @param handler - The handler implementation
   */
  register<TArgs = unknown>(toolName: string, handler: ToolHandler<TArgs>): void {
    if (this.handlers.has(toolName)) {
      throw new Error(`Tool handler already registered: ${toolName}`);
    }
    this.handlers.set(toolName, handler);
  }

  /**
   * Register multiple handlers at once
   * @param handlers - Map of tool names to handler implementations
   */
  registerBulk(handlers: Map<string, ToolHandler<unknown>>): void {
    for (const [toolName, handler] of handlers.entries()) {
      this.register(toolName, handler);
    }
  }

  /**
   * Execute a tool by name
   * @param toolName - The name of the tool to execute
   * @param args - Arguments to pass to the handler
   * @returns MCP-formatted response
   * @throws McpError if tool is not found
   */
  async execute(toolName: string, args: unknown): Promise<McpResponse> {
    const handler = this.handlers.get(toolName);

    if (!handler) {
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${toolName}`
      );
    }

    return handler.handle(args);
  }

  /**
   * Check if a tool is registered
   * @param toolName - The name of the tool to check
   * @returns true if the tool is registered
   */
  has(toolName: string): boolean {
    return this.handlers.has(toolName);
  }

  /**
   * Get all registered tool names
   * @returns Array of registered tool names
   */
  getToolNames(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get the number of registered tools
   * @returns Count of registered tools
   */
  get size(): number {
    return this.handlers.size;
  }

  /**
   * Clear all registered handlers
   * Useful for testing
   */
  clear(): void {
    this.handlers.clear();
  }
}

/**
 * Helper function to create a simple handler from a function
 * @template TArgs - The type of arguments the handler accepts
 * @param handlerFn - The function to wrap as a handler
 * @returns A ToolHandler instance
 */
export function createHandler<TArgs = unknown>(
  handlerFn: (args: TArgs) => Promise<McpResponse>
): ToolHandler<TArgs> {
  return {
    handle: async (args: TArgs): Promise<McpResponse> => handlerFn(args)
  };
}
