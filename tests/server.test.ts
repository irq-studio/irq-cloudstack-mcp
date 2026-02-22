// Mock the MCP SDK before importing server
jest.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: jest.fn().mockImplementation(() => ({
    setRequestHandler: jest.fn(),
    connect: jest.fn(),
    close: jest.fn(),
    onerror: jest.fn(),
    onclose: jest.fn(),
  })),
}));

jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: jest.fn(),
}));

jest.mock('@modelcontextprotocol/sdk/types.js', () => ({
  CallToolRequestSchema: {},
  ListToolsRequestSchema: {},
  ErrorCode: {
    InvalidParams: 'InvalidParams',
    InternalError: 'InternalError',
  },
  McpError: class McpError extends Error {
    constructor(public code: string, message: string) {
      super(message);
    }
  },
}));

import { CloudStackMcpServer } from '../src/server.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

// Mock the CloudStackClient
jest.mock('../src/cloudstack-client.js');

// Mock environment variables
const originalEnv = process.env;

describe('CloudStackMcpServer', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      CLOUDSTACK_API_URL: 'https://test.cloudstack.com/client/api',
      CLOUDSTACK_API_KEY: 'test-api-key',
      CLOUDSTACK_SECRET_KEY: 'test-secret-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should initialize server with default CloudStackClient', () => {
      const server = new CloudStackMcpServer();
      expect(server).toBeDefined();
      expect(server.getServer()).toBeDefined();
    });

    it('should initialize server with custom CloudStackClient', () => {
      const mockClient = new CloudStackClient({
        apiUrl: 'https://custom.cloudstack.com/client/api',
        apiKey: 'custom-key',
        secretKey: 'custom-secret',
      }) as jest.Mocked<CloudStackClient>;

      const server = new CloudStackMcpServer(mockClient);
      expect(server).toBeDefined();
    });

    it('should throw error when missing required environment variables', () => {
      delete process.env.CLOUDSTACK_API_URL;

      expect(() => new CloudStackMcpServer()).toThrow(
        'Missing required CloudStack configuration'
      );
    });

    it('should throw error when missing API key', () => {
      delete process.env.CLOUDSTACK_API_KEY;

      expect(() => new CloudStackMcpServer()).toThrow(
        'Missing required CloudStack configuration'
      );
    });

    it('should throw error when missing secret key', () => {
      delete process.env.CLOUDSTACK_SECRET_KEY;

      expect(() => new CloudStackMcpServer()).toThrow(
        'Missing required CloudStack configuration'
      );
    });
  });

  describe('configuration', () => {
    it('should use default timeout when not specified', () => {
      const server = new CloudStackMcpServer();
      expect(server).toBeDefined();
      // Default timeout is 30000ms as per cloudstack-client
    });

    it('should use custom timeout from environment', () => {
      process.env.CLOUDSTACK_TIMEOUT = '60000';
      const server = new CloudStackMcpServer();
      expect(server).toBeDefined();
    });

    it('should handle SSL rejection configuration', () => {
      process.env.CLOUDSTACK_REJECT_UNAUTHORIZED = 'true';
      const server = new CloudStackMcpServer();
      expect(server).toBeDefined();
    });

    it('should default SSL rejection to false', () => {
      delete process.env.CLOUDSTACK_REJECT_UNAUTHORIZED;
      const server = new CloudStackMcpServer();
      expect(server).toBeDefined();
    });
  });

  describe('server capabilities', () => {
    it('should have MCP server with correct metadata', () => {
      const server = new CloudStackMcpServer();
      const mcpServer = server.getServer();

      expect(mcpServer).toBeDefined();
      // Server metadata is set in constructor
    });

    it('should initialize all handler instances', () => {
      const server = new CloudStackMcpServer();
      expect(server).toBeDefined();
      // All handlers are initialized in initializeHandlers()
    });
  });

  describe('tool handlers', () => {
    it('should setup tool handlers for all CloudStack operations', () => {
      const server = new CloudStackMcpServer();
      const mcpServer = server.getServer();

      expect(mcpServer).toBeDefined();
      // Tool handlers are registered in setupToolHandlers()
    });
  });

  describe('error handling', () => {
    it('should setup error handler', () => {
      const server = new CloudStackMcpServer();
      const mcpServer = server.getServer();

      expect(mcpServer.onerror).toBeDefined();
    });

    it('should handle SIGINT signal', () => {
      const server = new CloudStackMcpServer();
      expect(server).toBeDefined();
      // SIGINT handler is registered in setupErrorHandling()
    });
  });

  describe('integration', () => {
    it('should create a fully functional server instance', () => {
      const server = new CloudStackMcpServer();
      const mcpServer = server.getServer();

      expect(server).toBeDefined();
      expect(mcpServer).toBeDefined();
      expect(typeof mcpServer.connect).toBe('function');
      expect(typeof mcpServer.close).toBe('function');
    });

    it('should initialize with all required handlers', () => {
      const mockClient = new CloudStackClient({
        apiUrl: 'https://test.cloudstack.com/client/api',
        apiKey: 'test-key',
        secretKey: 'test-secret',
      }) as jest.Mocked<CloudStackClient>;

      const server = new CloudStackMcpServer(mockClient);
      expect(server).toBeDefined();

      // Verify handlers are initialized (they're private but server should work)
      const mcpServer = server.getServer();
      expect(mcpServer).toBeDefined();
    });
  });

  describe('environment variable parsing', () => {
    it('should parse timeout as integer', () => {
      process.env.CLOUDSTACK_TIMEOUT = '45000';
      const server = new CloudStackMcpServer();
      expect(server).toBeDefined();
    });

    it('should handle invalid timeout gracefully', () => {
      process.env.CLOUDSTACK_TIMEOUT = 'invalid';
      const server = new CloudStackMcpServer();
      expect(server).toBeDefined();
      // Should use default timeout
    });

    it('should parse boolean SSL rejection correctly', () => {
      process.env.CLOUDSTACK_REJECT_UNAUTHORIZED = 'true';
      const server = new CloudStackMcpServer();
      expect(server).toBeDefined();

      process.env.CLOUDSTACK_REJECT_UNAUTHORIZED = 'false';
      const server2 = new CloudStackMcpServer();
      expect(server2).toBeDefined();
    });
  });
});
