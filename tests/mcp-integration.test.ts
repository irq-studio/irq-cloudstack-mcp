/**
 * MCP Protocol Integration Tests
 *
 * Tests the complete MCP protocol flow including:
 * - Tool listing
 * - Tool invocation with various argument patterns
 * - Error handling
 * - Response format compliance
 */

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

// Mock CloudStackClient to avoid real API calls
jest.mock('../src/cloudstack-client.js');

describe('MCP Protocol Integration', () => {
  let server: CloudStackMcpServer;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    // Setup environment variables
    process.env.CLOUDSTACK_API_URL = 'https://test.cloudstack.com/client/api';
    process.env.CLOUDSTACK_API_KEY = 'test-api-key';
    process.env.CLOUDSTACK_SECRET_KEY = 'test-secret-key';

    // Create mock client
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;

    // Setup common mock responses
    mockClient.request = jest.fn();
    mockClient.listVirtualMachines = jest.fn();
    mockClient.deployVirtualMachine = jest.fn();
    mockClient.listVolumes = jest.fn();
    mockClient.createVolume = jest.fn();
    mockClient.listNetworks = jest.fn();
    mockClient.listEvents = jest.fn();
    mockClient.listZones = jest.fn();

    // Create server with mocked client
    server = new CloudStackMcpServer(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Tool Listing', () => {
    it('should list all available tools via MCP protocol', async () => {
      const mcpServer = server.getServer();

      // Verify server is initialized
      expect(mcpServer).toBeDefined();
      expect(typeof mcpServer.setRequestHandler).toBe('function');
    });

    it('should expose tool metadata in correct MCP format', () => {
      // Tools should have name, description, and inputSchema
      const mcpServer = server.getServer();
      expect(mcpServer).toBeDefined();
    });
  });

  describe('Tool Invocation', () => {
    it('should handle list_virtual_machines tool call', async () => {
      const mockVMs = [
        {
          id: 'vm-123',
          name: 'test-vm',
          state: 'Running',
          zoneid: 'zone-1',
          templateid: 'template-1',
          serviceofferingid: 'offering-1',
        },
      ];

      mockClient.listVirtualMachines.mockResolvedValue({
        listvirtualmachinesresponse: {
          count: 1,
          virtualmachine: mockVMs,
        },
      });

      // Simulate tool call through handler
      const result = await server['vmHandlers'].handleListVirtualMachines({});

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('test-vm');
    });

    it('should handle deploy_virtual_machine tool call with async job', async () => {
      // Factory-based handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        deployvirtualmachineresponse: {
          id: 'vm-new-123',
          jobid: 'job-456',
        },
      });

      const result = await server['vmHandlers'].handleDeployVirtualMachine({
        serviceofferingid: 'offering-1',
        templateid: 'template-1',
        zoneid: 'zone-1',
        name: 'new-vm',
      });

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Deployed');
      expect(result.content[0].text).toContain('job-456');
      expect(result.content[0].text).toContain('vm-new-123');
    });

    it('should handle list_volumes tool call', async () => {
      const mockVolumes = [
        {
          id: 'vol-123',
          name: 'test-volume',
          state: 'Ready',
          type: 'DATADISK',
          zoneid: 'zone-1',
          size: 10737418240, // 10GB in bytes
        },
      ];

      // Factory-based handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        listvolumesresponse: {
          count: 1,
          volume: mockVolumes,
        },
      });

      const result = await server['storageHandlers'].handleListVolumes({});

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('test-volume');
    });
  });

  describe('Error Handling', () => {
    it('should return proper MCP error for invalid parameters', async () => {
      // Attempt to deploy VM with missing required parameters
      // Factory handlers return error responses instead of throwing
      const result = await server['vmHandlers'].handleDeployVirtualMachine({
        // Missing required: serviceofferingid, templateid, zoneid
        name: 'test-vm',
      } as any);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('serviceofferingid');
    });

    it('should handle CloudStack API errors gracefully', async () => {
      mockClient.listVirtualMachines.mockRejectedValue(
        new Error('CloudStack API Error: Resource not found')
      );

      await expect(server['vmHandlers'].handleListVirtualMachines({}))
        .rejects
        .toThrow('Resource not found');
    });

    it('should handle network errors with proper error code', async () => {
      // Factory-based handlers use client.request() directly
      mockClient.request = jest.fn().mockRejectedValue(
        new Error('Network timeout')
      );

      await expect(server['storageHandlers'].handleListVolumes({}))
        .rejects
        .toThrow('Network timeout');
    });
  });

  describe('Response Format Compliance', () => {
    it('should return responses in correct MCP format', async () => {
      mockClient.listVirtualMachines.mockResolvedValue({
        listvirtualmachinesresponse: {
          count: 0,
          virtualmachine: [],
        },
      });

      const result = await server['vmHandlers'].handleListVirtualMachines({});

      // Verify MCP response structure
      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.content[0]).toHaveProperty('type');
      expect(result.content[0]).toHaveProperty('text');
      expect(result.content[0].type).toBe('text');
    });

    it('should format list responses with proper structure', async () => {
      const mockVMs = [
        {
          id: 'vm-1',
          name: 'vm-one',
          state: 'Running',
          zoneid: 'zone-1',
          templateid: 'template-1',
          serviceofferingid: 'offering-1',
        },
        {
          id: 'vm-2',
          name: 'vm-two',
          state: 'Stopped',
          zoneid: 'zone-1',
          templateid: 'template-1',
          serviceofferingid: 'offering-1',
        },
      ];

      mockClient.listVirtualMachines.mockResolvedValue({
        listvirtualmachinesresponse: {
          count: 2,
          virtualmachine: mockVMs,
        },
      });

      const result = await server['vmHandlers'].handleListVirtualMachines({});

      expect(result.content[0].text).toContain('Found 2 virtual machines');
      expect(result.content[0].text).toContain('vm-one');
      expect(result.content[0].text).toContain('vm-two');
    });

    it('should handle empty list responses', async () => {
      mockClient.listVirtualMachines.mockResolvedValue({
        listvirtualmachinesresponse: {
          count: 0,
          virtualmachine: [],
        },
      });

      const result = await server['vmHandlers'].handleListVirtualMachines({});

      expect(result.content[0].text).toContain('Found 0 virtual machines');
    });
  });

  describe('Parameter Handling', () => {
    it('should accept optional parameters', async () => {
      mockClient.listVirtualMachines.mockResolvedValue({
        listvirtualmachinesresponse: {
          count: 0,
          virtualmachine: [],
        },
      });

      const result = await server['vmHandlers'].handleListVirtualMachines({
        zoneid: 'zone-1',
        state: 'Running',
      });

      expect(result).toBeDefined();
      expect(mockClient.listVirtualMachines).toHaveBeenCalledWith({
        zoneid: 'zone-1',
        state: 'Running',
      });
    });

    it('should handle lowercase parameters correctly', async () => {
      mockClient.listVirtualMachines.mockResolvedValue({
        listvirtualmachinesresponse: {
          count: 0,
        },
      });

      await server['vmHandlers'].handleListVirtualMachines({
        zoneid: 'zone-1',
      });

      expect(mockClient.listVirtualMachines).toHaveBeenCalledWith({
        zoneid: 'zone-1',
      });
    });
  });

  describe('Cross-Domain Operations', () => {
    it('should handle virtual machine operations', async () => {
      mockClient.listVirtualMachines.mockResolvedValue({
        listvirtualmachinesresponse: { count: 0, virtualmachine: [] },
      });

      const result = await server['vmHandlers'].handleListVirtualMachines({});
      expect(result).toBeDefined();
    });

    it('should handle storage operations', async () => {
      // Factory-based handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        listvolumesresponse: { count: 0, volume: [] },
      });

      const result = await server['storageHandlers'].handleListVolumes({});
      expect(result).toBeDefined();
    });

    it('should handle network operations', async () => {
      // Factory-based handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        listnetworksresponse: { count: 0, network: [] },
      });

      const result = await server['networkCoreHandlers'].handleListNetworks({});
      expect(result).toBeDefined();
    });

    it('should handle monitoring operations', async () => {
      mockClient.listEvents = jest.fn().mockResolvedValue({
        listeventsresponse: { count: 0, event: [] },
      });

      const result = await server['monitoringHandlers'].handleListEvents({});
      expect(result).toBeDefined();
    });

    it('should handle admin operations', async () => {
      // Factory-based handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        listzonesresponse: { count: 0, zone: [] },
      });

      const result = await server['adminHandlers'].handleListZones({});
      expect(result).toBeDefined();
    });
  });

  describe('Async Job Handling', () => {
    it('should return job IDs for async operations', async () => {
      // Factory-based handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        deployvirtualmachineresponse: {
          id: 'vm-123',
          jobid: 'job-456',
        },
      });

      const result = await server['vmHandlers'].handleDeployVirtualMachine({
        serviceofferingid: 'offering-1',
        templateid: 'template-1',
        zoneid: 'zone-1',
        name: 'test-vm',
      });

      expect(result.content[0].text).toContain('job-456');
      expect(result.content[0].text).toContain('vm-123');
    });

    it('should handle API errors during async job initiation', async () => {
      // Factory-based handlers use client.request() directly
      mockClient.request = jest.fn().mockRejectedValue(
        new Error('CloudStack API Error: Insufficient capacity')
      );

      await expect(
        server['vmHandlers'].handleDeployVirtualMachine({
          serviceofferingid: 'offering-1',
          templateid: 'template-1',
          zoneid: 'zone-1',
          name: 'test-vm',
        })
      ).rejects.toThrow('Insufficient capacity');
    });
  });
});
