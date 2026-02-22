import {
  createTextResponse,
  createJobResponse,
  createListResponse,
  createDetailResponse,
  createSuccessResponse,
  createErrorResponse,
  formatKeyValuePairs,
} from '../src/utils/response-formatters.js';

describe('Response Formatters', () => {
  describe('createTextResponse', () => {
    it('should create a simple text response', () => {
      const result = createTextResponse('Hello, world!');

      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'Hello, world!',
          },
        ],
      });
    });

    it('should handle multiline text', () => {
      const result = createTextResponse('Line 1\nLine 2\nLine 3');

      expect(result.content[0].text).toBe('Line 1\nLine 2\nLine 3');
    });
  });

  describe('createJobResponse', () => {
    it('should create a job response with job ID', () => {
      const result = createJobResponse('virtual machine', 'Started', 'vm-123', 'job-456');

      expect(result.content[0].text).toBe('Started virtual machine vm-123. Job ID: job-456');
    });

    it('should handle undefined job ID', () => {
      const result = createJobResponse('volume', 'Deleted', 'vol-789', undefined);

      expect(result.content[0].text).toBe('Deleted volume vol-789. Job ID: N/A');
    });

    it('should format different resource types', () => {
      const result = createJobResponse('snapshot', 'Created', 'snap-001', 'job-002');

      expect(result.content[0].text).toContain('snapshot');
      expect(result.content[0].text).toContain('snap-001');
    });
  });

  describe('createListResponse', () => {
    interface TestItem {
      id: string;
      name: string;
    }

    const formatter = (item: TestItem) => `• ${item.name} (${item.id})`;

    it('should create a list response with items', () => {
      const items: TestItem[] = [
        { id: 'vm-1', name: 'web-server' },
        { id: 'vm-2', name: 'db-server' },
        { id: 'vm-3', name: 'app-server' },
      ];

      const result = createListResponse('virtual machine', items, formatter);

      expect(result.content[0].text).toContain('Found 3 virtual machines:');
      expect(result.content[0].text).toContain('• web-server (vm-1)');
      expect(result.content[0].text).toContain('• db-server (vm-2)');
      expect(result.content[0].text).toContain('• app-server (vm-3)');
    });

    it('should handle single item', () => {
      const items: TestItem[] = [{ id: 'vm-1', name: 'web-server' }];

      const result = createListResponse('virtual machine', items, formatter);

      expect(result.content[0].text).toContain('Found 1 virtual machine:');
      expect(result.content[0].text).not.toContain('virtual machines');
    });

    it('should handle empty list', () => {
      const items: TestItem[] = [];

      const result = createListResponse('network', items, formatter);

      expect(result.content[0].text).toBe('No networks found.');
    });
  });

  describe('createDetailResponse', () => {
    it('should create a detail response with formatted key-value pairs', () => {
      const details = {
        id: 'vm-123',
        name: 'web-server',
        state: 'Running',
        cpuNumber: 4,
        memory: 8192,
      };

      const result = createDetailResponse('Virtual Machine', details);

      expect(result.content[0].text).toContain('Virtual Machine Details:');
      expect(result.content[0].text).toContain('Id: vm-123');
      expect(result.content[0].text).toContain('Name: web-server');
      expect(result.content[0].text).toContain('State: Running');
      expect(result.content[0].text).toContain('Cpu Number: 4');
      expect(result.content[0].text).toContain('Memory: 8192');
    });

    it('should handle null and undefined values', () => {
      const details = {
        id: 'vm-123',
        name: 'test-vm',
        ipAddress: null,
        description: undefined,
      };

      const result = createDetailResponse('Virtual Machine', details);

      expect(result.content[0].text).toContain('Ip Address: N/A');
      expect(result.content[0].text).toContain('Description: N/A');
    });

    it('should handle array values', () => {
      const details = {
        id: 'vm-123',
        tags: ['production', 'web-server', 'critical'],
      };

      const result = createDetailResponse('Virtual Machine', details);

      expect(result.content[0].text).toContain('Tags: production, web-server, critical');
    });

    it('should handle empty arrays', () => {
      const details = {
        id: 'vm-123',
        securityGroups: [],
      };

      const result = createDetailResponse('Virtual Machine', details);

      expect(result.content[0].text).toContain('Security Groups: None');
    });

    it('should handle nested objects', () => {
      const details = {
        id: 'vm-123',
        nic: { ipaddress: '192.168.1.10', macaddress: '00:11:22:33:44:55' },
      };

      const result = createDetailResponse('Virtual Machine', details);

      expect(result.content[0].text).toContain('Nic:');
      expect(result.content[0].text).toContain('ipaddress');
      expect(result.content[0].text).toContain('macaddress');
    });
  });

  describe('createSuccessResponse', () => {
    it('should create a success response without metadata', () => {
      const result = createSuccessResponse('Deploy virtual machine');

      expect(result.content[0].text).toBe('Deploy virtual machine completed successfully.');
    });

    it('should create a success response with metadata', () => {
      const result = createSuccessResponse('Delete volume', {
        'Volume ID': 'vol-123',
        'Job ID': 'job-456',
      });

      expect(result.content[0].text).toContain('Delete volume completed successfully.');
      expect(result.content[0].text).toContain('Volume ID: vol-123');
      expect(result.content[0].text).toContain('Job ID: job-456');
    });

    it('should filter out undefined metadata values', () => {
      const result = createSuccessResponse('Operation', {
        'Resource ID': 'res-123',
        'Job ID': undefined,
        'Status': 'Success',
      });

      expect(result.content[0].text).toContain('Resource ID: res-123');
      expect(result.content[0].text).toContain('Status: Success');
      expect(result.content[0].text).not.toContain('Job ID');
    });

    it('should handle empty metadata object', () => {
      const result = createSuccessResponse('Test operation', {});

      expect(result.content[0].text).toBe('Test operation completed successfully.');
    });
  });

  describe('createErrorResponse', () => {
    it('should create an error response from Error instance', () => {
      const error = new Error('Network timeout');
      const result = createErrorResponse('list virtual machines', error);

      expect(result.content[0].text).toBe('Error during list virtual machines: Network timeout');
    });

    it('should create an error response from string', () => {
      const result = createErrorResponse('delete volume', 'Volume not found');

      expect(result.content[0].text).toBe('Error during delete volume: Volume not found');
    });

    it('should handle unknown error types', () => {
      const result = createErrorResponse('create snapshot', { code: 500, message: 'Server error' });

      expect(result.content[0].text).toContain('Error during create snapshot');
    });
  });

  describe('formatKeyValuePairs', () => {
    it('should format key-value pairs', () => {
      const pairs = {
        id: 'vm-123',
        name: 'web-server',
        state: 'Running',
      };

      const result = formatKeyValuePairs(pairs);

      expect(result).toContain('Id: vm-123');
      expect(result).toContain('Name: web-server');
      expect(result).toContain('State: Running');
    });

    it('should apply indentation', () => {
      const pairs = {
        id: 'vm-123',
        name: 'web-server',
      };

      const result = formatKeyValuePairs(pairs, '  ');

      expect(result).toContain('  Id: vm-123');
      expect(result).toContain('  Name: web-server');
    });

    it('should filter out null and undefined values', () => {
      const pairs = {
        id: 'vm-123',
        name: 'web-server',
        ipAddress: null,
        description: undefined,
        state: 'Running',
      };

      const result = formatKeyValuePairs(pairs);

      expect(result).toContain('Id: vm-123');
      expect(result).toContain('State: Running');
      expect(result).not.toContain('Ip Address');
      expect(result).not.toContain('Description');
    });

    it('should handle camelCase keys', () => {
      const pairs = {
        cpuNumber: 4,
        memorySize: 8192,
        displayName: 'Test VM',
      };

      const result = formatKeyValuePairs(pairs);

      expect(result).toContain('Cpu Number: 4');
      expect(result).toContain('Memory Size: 8192');
      expect(result).toContain('Display Name: Test VM');
    });

    it('should handle boolean values', () => {
      const pairs = {
        isPublic: true,
        isFeatured: false,
      };

      const result = formatKeyValuePairs(pairs);

      expect(result).toContain('Is Public: true');
      expect(result).toContain('Is Featured: false');
    });
  });
});
