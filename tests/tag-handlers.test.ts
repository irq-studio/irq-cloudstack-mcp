import { TagHandlers } from '../src/handlers/tag-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

// Mock CloudStackClient
jest.mock('../src/cloudstack-client.js');

describe('TagHandlers', () => {
  let handlers: TagHandlers;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;
    handlers = new TagHandlers(mockClient);
  });

  describe('handleCreateTags', () => {
    it('should successfully create tags for resources', async () => {
      const mockResponse = {
        createtagsresponse: {
          jobid: 'job-123',
        },
      };
      mockClient.createTags = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        resourceids: ['vm-1', 'vm-2'],
        resourcetype: 'UserVm',
        tags: [
          { key: 'environment', value: 'production' },
          { key: 'owner', value: 'team-a' },
        ],
      };

      const result = await handlers.handleCreateTags(args);

      expect(mockClient.createTags).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('2 UserVm');
      expect(result.content[0].text).toContain('environment: production');
      expect(result.content[0].text).toContain('owner: team-a');
      expect(result.content[0].text).toContain('job-123');
    });

    it('should create single tag for single resource', async () => {
      const mockResponse = {
        createtagsresponse: {
          jobid: 'job-456',
        },
      };
      mockClient.createTags = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        resourceids: ['volume-1'],
        resourcetype: 'Volume',
        tags: [{ key: 'backup', value: 'daily' }],
      };

      const result = await handlers.handleCreateTags(args);

      expect(mockClient.createTags).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('1 Volume');
      expect(result.content[0].text).toContain('backup: daily');
    });

    it('should handle tag creation errors', async () => {
      mockClient.createTags = jest.fn().mockRejectedValue(new Error('Invalid resource ID'));

      const args = {
        resourceids: ['invalid-id'],
        resourcetype: 'UserVm',
        tags: [{ key: 'test', value: 'value' }],
      };

      await expect(handlers.handleCreateTags(args)).rejects.toThrow('Invalid resource ID');
    });
  });

  describe('handleDeleteTags', () => {
    it('should successfully delete specific tags from resources', async () => {
      const mockResponse = {
        deletetagsresponse: {
          jobid: 'job-789',
        },
      };
      mockClient.deleteTags = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        resourceids: ['vm-1', 'vm-2'],
        resourcetype: 'UserVm',
        tags: [
          { key: 'environment', value: 'development' },
        ],
      };

      const result = await handlers.handleDeleteTags(args);

      expect(mockClient.deleteTags).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('2 UserVm');
      expect(result.content[0].text).toContain('environment: development');
      expect(result.content[0].text).toContain('job-789');
    });

    it('should delete all tags when no specific tags provided', async () => {
      const mockResponse = {
        deletetagsresponse: {
          jobid: 'job-999',
        },
      };
      mockClient.deleteTags = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        resourceids: ['vm-1'],
        resourcetype: 'UserVm',
      };

      const result = await handlers.handleDeleteTags(args);

      expect(mockClient.deleteTags).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('1 UserVm');
      expect(result.content[0].text).toContain('job-999');
    });
  });

  describe('handleListTags', () => {
    it('should successfully list tags', async () => {
      const mockResponse = {
        listtagsresponse: {
          tag: [
            {
              key: 'environment',
              value: 'production',
              resourcetype: 'UserVm',
              resourceid: 'vm-1',
              domain: 'ROOT',
              account: 'admin',
            },
            {
              key: 'owner',
              value: 'team-a',
              resourcetype: 'Volume',
              resourceid: 'volume-1',
              domain: 'ROOT',
              account: 'admin',
            },
          ],
        },
      };
      mockClient.listTags = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListTags({});

      expect(mockClient.listTags).toHaveBeenCalled();
      expect(result.content[0].text).toContain('Found 2 tags');
      expect(result.content[0].text).toContain('environment: production');
      expect(result.content[0].text).toContain('owner: team-a');
      expect(result.content[0].text).toContain('UserVm');
      expect(result.content[0].text).toContain('Volume');
    });

    it('should handle empty tag list', async () => {
      const mockResponse = {
        listtagsresponse: {
          tag: [],
        },
      };
      mockClient.listTags = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListTags({});

      expect(result.content[0].text).toContain('Found 0 tags');
    });

    it('should filter tags by resourcetype', async () => {
      const mockResponse = {
        listtagsresponse: {
          tag: [
            {
              key: 'backup',
              value: 'daily',
              resourcetype: 'Volume',
              resourceid: 'volume-1',
              domain: 'ROOT',
              account: 'admin',
            },
          ],
        },
      };
      mockClient.listTags = jest.fn().mockResolvedValue(mockResponse);

      const args = { resourcetype: 'Volume' };
      const result = await handlers.handleListTags(args);

      expect(mockClient.listTags).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('Found 1 tags');
      expect(result.content[0].text).toContain('backup: daily');
    });
  });
});
