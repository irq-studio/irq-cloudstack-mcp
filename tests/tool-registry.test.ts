import type { ToolHandler } from '../src/tool-registry.js';
import { ToolRegistry, createHandler } from '../src/tool-registry.js';
import type { McpResponse } from '../src/types.js';

// Mock MCP SDK types since Jest has issues with ES modules
jest.mock('@modelcontextprotocol/sdk/types.js', () => ({
  McpError: class McpError extends Error {
    code: number;
    constructor(code: number, message: string) {
      super(message);
      this.code = code;
      this.name = 'McpError';
    }
  },
  ErrorCode: {
    MethodNotFound: -32601,
    InternalError: -32603
  }
}));

const { McpError, ErrorCode } = jest.requireMock('@modelcontextprotocol/sdk/types.js');

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  describe('register', () => {
    it('should register a tool handler successfully', () => {
      const handler: ToolHandler = {
        handle: jest.fn()
      };

      registry.register('test_tool', handler);

      expect(registry.has('test_tool')).toBe(true);
      expect(registry.size).toBe(1);
    });

    it('should throw error when registering duplicate tool name', () => {
      const handler: ToolHandler = {
        handle: jest.fn()
      };

      registry.register('test_tool', handler);

      expect(() => {
        registry.register('test_tool', handler);
      }).toThrow('Tool handler already registered: test_tool');
    });

    it('should allow registering multiple different tools', () => {
      const handler1: ToolHandler = { handle: jest.fn() };
      const handler2: ToolHandler = { handle: jest.fn() };
      const handler3: ToolHandler = { handle: jest.fn() };

      registry.register('tool_1', handler1);
      registry.register('tool_2', handler2);
      registry.register('tool_3', handler3);

      expect(registry.size).toBe(3);
      expect(registry.has('tool_1')).toBe(true);
      expect(registry.has('tool_2')).toBe(true);
      expect(registry.has('tool_3')).toBe(true);
    });
  });

  describe('registerBulk', () => {
    it('should register multiple handlers at once', () => {
      const handlers = new Map<string, ToolHandler>([
        ['tool_1', { handle: jest.fn() }],
        ['tool_2', { handle: jest.fn() }],
        ['tool_3', { handle: jest.fn() }]
      ]);

      registry.registerBulk(handlers);

      expect(registry.size).toBe(3);
      expect(registry.has('tool_1')).toBe(true);
      expect(registry.has('tool_2')).toBe(true);
      expect(registry.has('tool_3')).toBe(true);
    });

    it('should throw error if any handler in bulk has duplicate name', () => {
      const handler: ToolHandler = { handle: jest.fn() };
      registry.register('existing_tool', handler);

      const bulkHandlers = new Map<string, ToolHandler>([
        ['new_tool', { handle: jest.fn() }],
        ['existing_tool', { handle: jest.fn() }]
      ]);

      expect(() => {
        registry.registerBulk(bulkHandlers);
      }).toThrow('Tool handler already registered: existing_tool');
    });
  });

  describe('execute', () => {
    it('should execute registered tool handler with arguments', async () => {
      const mockResponse: McpResponse = {
        content: [{ type: 'text', text: 'Success' }]
      };

      const handler: ToolHandler = {
        handle: jest.fn().mockResolvedValue(mockResponse)
      };

      registry.register('test_tool', handler);

      const args = { id: '123', name: 'test' };
      const result = await registry.execute('test_tool', args);

      expect(handler.handle).toHaveBeenCalledWith(args);
      expect(result).toEqual(mockResponse);
    });

    it('should throw McpError when tool is not found', async () => {
      await expect(registry.execute('nonexistent_tool', {}))
        .rejects
        .toThrow(new McpError(ErrorCode.MethodNotFound, 'Unknown tool: nonexistent_tool'));
    });

    it('should propagate errors from handler execution', async () => {
      const errorMessage = 'Handler execution failed';
      const handler: ToolHandler = {
        handle: jest.fn().mockRejectedValue(new Error(errorMessage))
      };

      registry.register('failing_tool', handler);

      await expect(registry.execute('failing_tool', {}))
        .rejects
        .toThrow(errorMessage);
    });

    it('should execute handler with empty arguments', async () => {
      const mockResponse: McpResponse = {
        content: [{ type: 'text', text: 'No args provided' }]
      };

      const handler: ToolHandler = {
        handle: jest.fn().mockResolvedValue(mockResponse)
      };

      registry.register('no_args_tool', handler);

      const result = await registry.execute('no_args_tool', {});

      expect(handler.handle).toHaveBeenCalledWith({});
      expect(result).toEqual(mockResponse);
    });
  });

  describe('has', () => {
    it('should return true for registered tool', () => {
      const handler: ToolHandler = { handle: jest.fn() };
      registry.register('existing_tool', handler);

      expect(registry.has('existing_tool')).toBe(true);
    });

    it('should return false for unregistered tool', () => {
      expect(registry.has('nonexistent_tool')).toBe(false);
    });
  });

  describe('getToolNames', () => {
    it('should return empty array when no tools registered', () => {
      expect(registry.getToolNames()).toEqual([]);
    });

    it('should return all registered tool names', () => {
      const handler: ToolHandler = { handle: jest.fn() };

      registry.register('tool_1', handler);
      registry.register('tool_2', handler);
      registry.register('tool_3', handler);

      const toolNames = registry.getToolNames();

      expect(toolNames).toHaveLength(3);
      expect(toolNames).toContain('tool_1');
      expect(toolNames).toContain('tool_2');
      expect(toolNames).toContain('tool_3');
    });
  });

  describe('size', () => {
    it('should return 0 for empty registry', () => {
      expect(registry.size).toBe(0);
    });

    it('should return correct count of registered tools', () => {
      const handler: ToolHandler = { handle: jest.fn() };

      registry.register('tool_1', handler);
      expect(registry.size).toBe(1);

      registry.register('tool_2', handler);
      expect(registry.size).toBe(2);

      registry.register('tool_3', handler);
      expect(registry.size).toBe(3);
    });
  });

  describe('clear', () => {
    it('should remove all registered handlers', () => {
      const handler: ToolHandler = { handle: jest.fn() };

      registry.register('tool_1', handler);
      registry.register('tool_2', handler);
      registry.register('tool_3', handler);

      expect(registry.size).toBe(3);

      registry.clear();

      expect(registry.size).toBe(0);
      expect(registry.has('tool_1')).toBe(false);
      expect(registry.has('tool_2')).toBe(false);
      expect(registry.has('tool_3')).toBe(false);
    });

    it('should allow re-registering tools after clear', () => {
      const handler: ToolHandler = { handle: jest.fn() };

      registry.register('test_tool', handler);
      registry.clear();

      // Should not throw duplicate registration error
      expect(() => {
        registry.register('test_tool', handler);
      }).not.toThrow();

      expect(registry.has('test_tool')).toBe(true);
    });
  });
});

describe('createHandler', () => {
  it('should wrap handler function and return McpResponse', async () => {
    const mockResponse = {
      content: [{ type: 'text', text: 'Handler result' }]
    };

    const handlerFn = jest.fn().mockResolvedValue(mockResponse);
    const handler = createHandler(handlerFn);

    const args = { id: '123' };
    const result = await handler.handle(args);

    expect(handlerFn).toHaveBeenCalledWith(args);
    expect(result).toEqual(mockResponse);
  });

  it('should propagate errors from wrapped function', async () => {
    const errorMessage = 'Function failed';
    const handlerFn = jest.fn().mockRejectedValue(new Error(errorMessage));
    const handler = createHandler(handlerFn);

    await expect(handler.handle({}))
      .rejects
      .toThrow(errorMessage);
  });

  it('should handle different argument types', async () => {
    const handlerFn = jest.fn().mockImplementation((args: any) => ({
      content: [{ type: 'text', text: `Received: ${JSON.stringify(args)}` }]
    }));
    const handler = createHandler(handlerFn);

    // Test with various argument types
    await handler.handle({ id: '123' });
    expect(handlerFn).toHaveBeenCalledWith({ id: '123' });

    await handler.handle({ name: 'test', value: 42 });
    expect(handlerFn).toHaveBeenCalledWith({ name: 'test', value: 42 });

    await handler.handle({});
    expect(handlerFn).toHaveBeenCalledWith({});
  });

  it('should cast result to McpResponse type', async () => {
    const handlerFn = jest.fn().mockResolvedValue({
      content: [{ type: 'text', text: 'Result' }],
      isError: false,
      _meta: { timestamp: '2025-01-01' }
    });
    const handler = createHandler(handlerFn);

    const result = await handler.handle({});

    // Verify response structure matches McpResponse
    expect(result.content).toBeDefined();
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty('type');
    expect(result.content[0]).toHaveProperty('text');
  });
});

describe('Integration Tests', () => {
  it('should handle complete tool registration and execution flow', async () => {
    const registry = new ToolRegistry();

    // Create multiple handlers
    const listVMsHandler = createHandler(async (_args: any) => ({
      content: [{ type: 'text', text: JSON.stringify({ vms: ['vm1', 'vm2'] }) }]
    }));

    const startVMHandler = createHandler(async (args: any) => ({
      content: [{ type: 'text', text: `Started VM ${args.id}` }]
    }));

    // Register handlers
    registry.register('list_virtual_machines', listVMsHandler);
    registry.register('start_virtual_machine', startVMHandler);

    // Execute tools
    const listResult = await registry.execute('list_virtual_machines', {});
    expect(listResult.content[0].text).toContain('vm1');

    const startResult = await registry.execute('start_virtual_machine', { id: 'vm-123' });
    expect(startResult.content[0].text).toBe('Started VM vm-123');
  });

  it('should handle bulk registration and execution', async () => {
    const registry = new ToolRegistry();

    const handlers = new Map<string, ToolHandler>();
    for (let i = 1; i <= 10; i++) {
      handlers.set(`tool_${i}`, createHandler(async (_args: any) => ({
        content: [{ type: 'text', text: `Result from tool ${i}` }]
      })));
    }

    registry.registerBulk(handlers);

    expect(registry.size).toBe(10);

    // Test execution of each tool
    for (let i = 1; i <= 10; i++) {
      const result = await registry.execute(`tool_${i}`, {});
      expect(result.content[0].text).toBe(`Result from tool ${i}`);
    }
  });
});
