/**
 * Tests for array size validation in tag handlers
 */

import { TagHandlers } from '../src/handlers/tag-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';
import { ValidationError } from '../src/utils/validation.js';

// Mock CloudStackClient
jest.mock('../src/cloudstack-client.js');

describe('Tag Handlers - Array Validation', () => {
  let tagHandlers: TagHandlers;
  let mockCloudStackClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    // Create mock CloudStackClient instance
    mockCloudStackClient = new CloudStackClient({
      apiUrl: 'https://test.example.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;

    // Mock the createTags method
    mockCloudStackClient.createTags = jest.fn().mockResolvedValue({
      createtagsresponse: {
        jobid: 'job-123',
      },
    });

    // Mock the deleteTags method
    mockCloudStackClient.deleteTags = jest.fn().mockResolvedValue({
      deletetagsresponse: {
        jobid: 'job-456',
      },
    });

    tagHandlers = new TagHandlers(mockCloudStackClient);
  });

  describe('handleCreateTags', () => {
    it('should accept resourceids array within limit', async () => {
      const args = {
        resourceids: ['resource-1', 'resource-2', 'resource-3'],
        resourcetype: 'UserVm',
        tags: [{ key: 'env', value: 'prod' }],
      };

      await expect(tagHandlers.handleCreateTags(args)).resolves.toBeDefined();
      expect(mockCloudStackClient.createTags).toHaveBeenCalledWith(args);
    });

    it('should accept tags array within limit', async () => {
      const args = {
        resourceids: ['resource-1'],
        resourcetype: 'UserVm',
        tags: [
          { key: 'env', value: 'prod' },
          { key: 'app', value: 'web' },
          { key: 'owner', value: 'team-a' },
        ],
      };

      await expect(tagHandlers.handleCreateTags(args)).resolves.toBeDefined();
      expect(mockCloudStackClient.createTags).toHaveBeenCalledWith(args);
    });

    it('should reject resourceids array exceeding limit', async () => {
      const args = {
        resourceids: new Array(101).fill('resource').map((_, i) => `resource-${i}`),
        resourcetype: 'UserVm',
        tags: [{ key: 'env', value: 'prod' }],
      };

      await expect(tagHandlers.handleCreateTags(args)).rejects.toThrow(ValidationError);
      await expect(tagHandlers.handleCreateTags(args)).rejects.toThrow(
        /resourceids cannot exceed 100 items/
      );
      expect(mockCloudStackClient.createTags).not.toHaveBeenCalled();
    });

    it('should reject tags array exceeding limit', async () => {
      const args = {
        resourceids: ['resource-1'],
        resourcetype: 'UserVm',
        tags: new Array(101).fill(null).map((_, i) => ({ key: `tag-${i}`, value: `value-${i}` })),
      };

      await expect(tagHandlers.handleCreateTags(args)).rejects.toThrow(ValidationError);
      await expect(tagHandlers.handleCreateTags(args)).rejects.toThrow(/tags cannot exceed 100 items/);
      expect(mockCloudStackClient.createTags).not.toHaveBeenCalled();
    });

    it('should accept arrays at exact limit', async () => {
      const args = {
        resourceids: new Array(100).fill('resource').map((_, i) => `resource-${i}`),
        resourcetype: 'UserVm',
        tags: new Array(100).fill(null).map((_, i) => ({ key: `tag-${i}`, value: `value-${i}` })),
      };

      await expect(tagHandlers.handleCreateTags(args)).resolves.toBeDefined();
      expect(mockCloudStackClient.createTags).toHaveBeenCalledWith(args);
    });

    it('should include parameter name in error message for resourceids', async () => {
      const args = {
        resourceids: new Array(150).fill('resource').map((_, i) => `resource-${i}`),
        resourcetype: 'UserVm',
        tags: [{ key: 'env', value: 'prod' }],
      };

      await expect(tagHandlers.handleCreateTags(args)).rejects.toThrow(/resourceids/);
      await expect(tagHandlers.handleCreateTags(args)).rejects.toThrow(/Received: 150 items/);
    });

    it('should include parameter name in error message for tags', async () => {
      const args = {
        resourceids: ['resource-1'],
        resourcetype: 'UserVm',
        tags: new Array(150).fill(null).map((_, i) => ({ key: `tag-${i}`, value: `value-${i}` })),
      };

      await expect(tagHandlers.handleCreateTags(args)).rejects.toThrow(/tags/);
      await expect(tagHandlers.handleCreateTags(args)).rejects.toThrow(/Received: 150 items/);
    });
  });

  describe('handleDeleteTags', () => {
    it('should accept resourceids array within limit', async () => {
      const args = {
        resourceids: ['resource-1', 'resource-2'],
        resourcetype: 'UserVm',
      };

      await expect(tagHandlers.handleDeleteTags(args)).resolves.toBeDefined();
      expect(mockCloudStackClient.deleteTags).toHaveBeenCalledWith(args);
    });

    it('should accept optional tags array within limit', async () => {
      const args = {
        resourceids: ['resource-1'],
        resourcetype: 'UserVm',
        tags: [{ key: 'env', value: 'prod' }],
      };

      await expect(tagHandlers.handleDeleteTags(args)).resolves.toBeDefined();
      expect(mockCloudStackClient.deleteTags).toHaveBeenCalledWith(args);
    });

    it('should reject resourceids array exceeding limit', async () => {
      const args = {
        resourceids: new Array(101).fill('resource').map((_, i) => `resource-${i}`),
        resourcetype: 'UserVm',
      };

      await expect(tagHandlers.handleDeleteTags(args)).rejects.toThrow(ValidationError);
      await expect(tagHandlers.handleDeleteTags(args)).rejects.toThrow(
        /resourceids cannot exceed 100 items/
      );
      expect(mockCloudStackClient.deleteTags).not.toHaveBeenCalled();
    });

    it('should reject optional tags array exceeding limit', async () => {
      const args = {
        resourceids: ['resource-1'],
        resourcetype: 'UserVm',
        tags: new Array(101).fill(null).map((_, i) => ({ key: `tag-${i}`, value: `value-${i}` })),
      };

      await expect(tagHandlers.handleDeleteTags(args)).rejects.toThrow(ValidationError);
      await expect(tagHandlers.handleDeleteTags(args)).rejects.toThrow(/tags cannot exceed 100 items/);
      expect(mockCloudStackClient.deleteTags).not.toHaveBeenCalled();
    });

    it('should allow deleteTags without tags parameter', async () => {
      const args = {
        resourceids: ['resource-1', 'resource-2'],
        resourcetype: 'UserVm',
      };

      await expect(tagHandlers.handleDeleteTags(args)).resolves.toBeDefined();
      expect(mockCloudStackClient.deleteTags).toHaveBeenCalledWith(args);
    });

    it('should accept arrays at exact limit', async () => {
      const args = {
        resourceids: new Array(100).fill('resource').map((_, i) => `resource-${i}`),
        resourcetype: 'UserVm',
        tags: new Array(100).fill(null).map((_, i) => ({ key: `tag-${i}`, value: `value-${i}` })),
      };

      await expect(tagHandlers.handleDeleteTags(args)).resolves.toBeDefined();
      expect(mockCloudStackClient.deleteTags).toHaveBeenCalledWith(args);
    });
  });
});
