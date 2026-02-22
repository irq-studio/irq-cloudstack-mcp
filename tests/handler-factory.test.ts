/**
 * Tests for handler factory functions
 */

import {
  createListHandler,
  createGetHandler,
  createActionHandler,
  type ListHandlerConfig,
  type GetHandlerConfig,
  type ActionHandlerConfig,
} from '../src/utils/handler-factory.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

jest.mock('../src/cloudstack-client.js');

describe('Handler Factory', () => {
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;
    mockClient.request = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createListHandler', () => {
    interface TestItem {
      id: string;
      name: string;
      state: string;
    }

    const listConfig: ListHandlerConfig<TestItem> = {
      command: 'listTestItems',
      responseKey: 'listtestitemsresponse',
      arrayKey: 'testitem',
      itemName: 'test item',
      titleField: 'name',
      idField: 'id',
      fields: [
        { key: 'state', label: 'State' },
      ],
    };

    it('should create a list handler that returns formatted items', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listtestitemsresponse: {
          testitem: [
            { id: 'item-1', name: 'Item One', state: 'Active' },
            { id: 'item-2', name: 'Item Two', state: 'Inactive' },
          ],
        },
      });

      const handler = createListHandler<TestItem>(mockClient, listConfig);
      const result = await handler({});

      expect(mockClient.request).toHaveBeenCalledWith('listTestItems', {});
      expect(result.content[0].text).toContain('Found 2 test items');
      expect(result.content[0].text).toContain('Item One (item-1)');
      expect(result.content[0].text).toContain('Item Two (item-2)');
      expect(result.content[0].text).toContain('State: Active');
      expect(result.content[0].text).toContain('State: Inactive');
    });

    it('should handle empty response', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listtestitemsresponse: {},
      });

      const handler = createListHandler<TestItem>(mockClient, listConfig);
      const result = await handler({});

      expect(result.content[0].text).toContain('No test items found');
    });

    it('should pass arguments to the API', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listtestitemsresponse: { testitem: [] },
      });

      const handler = createListHandler<TestItem>(mockClient, listConfig);
      await handler({ state: 'Active', zoneid: 'zone-1' });

      expect(mockClient.request).toHaveBeenCalledWith('listTestItems', {
        state: 'Active',
        zoneid: 'zone-1',
      });
    });

    it('should merge default args with provided args', async () => {
      const configWithDefaults: ListHandlerConfig<TestItem> = {
        ...listConfig,
        defaultArgs: { listall: true },
      };

      mockClient.request = jest.fn().mockResolvedValue({
        listtestitemsresponse: { testitem: [] },
      });

      const handler = createListHandler<TestItem>(mockClient, configWithDefaults);
      await handler({ state: 'Active' });

      expect(mockClient.request).toHaveBeenCalledWith('listTestItems', {
        listall: true,
        state: 'Active',
      });
    });

    it('should apply transform function if provided', async () => {
      const configWithTransform: ListHandlerConfig<TestItem> = {
        ...listConfig,
        transform: (item: unknown) => {
          const raw = item as { id: string; name: string; status: string };
          return { id: raw.id, name: raw.name, state: raw.status };
        },
      };

      mockClient.request = jest.fn().mockResolvedValue({
        listtestitemsresponse: {
          testitem: [
            { id: 'item-1', name: 'Item One', status: 'Active' },
          ],
        },
      });

      const handler = createListHandler<TestItem>(mockClient, configWithTransform);
      const result = await handler({});

      expect(result.content[0].text).toContain('State: Active');
    });

    it('should use custom plural name', async () => {
      const configWithPlural: ListHandlerConfig<TestItem> = {
        ...listConfig,
        itemNamePlural: 'test entries',
      };

      mockClient.request = jest.fn().mockResolvedValue({
        listtestitemsresponse: {},
      });

      const handler = createListHandler<TestItem>(mockClient, configWithPlural);
      const result = await handler({});

      expect(result.content[0].text).toContain('No test entries found');
    });
  });

  describe('createGetHandler', () => {
    interface TestItem {
      id: string;
      name: string;
      state: string;
      description?: string;
    }

    const getConfig: GetHandlerConfig<TestItem> = {
      command: 'listTestItems',
      responseKey: 'listtestitemsresponse',
      arrayKey: 'testitem',
      itemName: 'Test Item',
      idParam: 'id',
      fields: [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'state', label: 'State' },
        { key: 'description', label: 'Description' },
      ],
    };

    it('should create a get handler that returns item details', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listtestitemsresponse: {
          testitem: [
            { id: 'item-123', name: 'Test Item', state: 'Active', description: 'A test item' },
          ],
        },
      });

      const handler = createGetHandler<TestItem>(mockClient, getConfig);
      const result = await handler({ id: 'item-123' });

      expect(mockClient.request).toHaveBeenCalledWith('listTestItems', { id: 'item-123' });
      expect(result.content[0].text).toContain('Test Item Details');
      expect(result.content[0].text).toContain('ID: item-123');
      expect(result.content[0].text).toContain('Name: Test Item');
      expect(result.content[0].text).toContain('State: Active');
      expect(result.content[0].text).toContain('Description: A test item');
    });

    it('should return error when id parameter is missing', async () => {
      const handler = createGetHandler<TestItem>(mockClient, getConfig);
      const result = await handler({});

      expect(result.content[0].text).toContain('Error: id is required');
      expect(mockClient.request).not.toHaveBeenCalled();
    });

    it('should return not found message when item does not exist', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listtestitemsresponse: {
          testitem: [],
        },
      });

      const handler = createGetHandler<TestItem>(mockClient, getConfig);
      const result = await handler({ id: 'nonexistent' });

      expect(result.content[0].text).toContain('Test Item with id "nonexistent" not found');
    });

    it('should handle empty response object', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listtestitemsresponse: {},
      });

      const handler = createGetHandler<TestItem>(mockClient, getConfig);
      const result = await handler({ id: 'item-123' });

      expect(result.content[0].text).toContain('not found');
    });

    it('should apply transform function if provided', async () => {
      const configWithTransform: GetHandlerConfig<TestItem> = {
        ...getConfig,
        transform: (item: unknown) => {
          const raw = item as { id: string; name: string; status: string };
          return { id: raw.id, name: raw.name, state: raw.status };
        },
      };

      mockClient.request = jest.fn().mockResolvedValue({
        listtestitemsresponse: {
          testitem: [
            { id: 'item-123', name: 'Test Item', status: 'Active' },
          ],
        },
      });

      const handler = createGetHandler<TestItem>(mockClient, configWithTransform);
      const result = await handler({ id: 'item-123' });

      expect(result.content[0].text).toContain('State: Active');
    });

    it('should use custom format function if provided', async () => {
      const configWithCustomFormat: GetHandlerConfig<TestItem> = {
        ...getConfig,
        customFormat: (item) => `Custom: ${item.name} is ${item.state}`,
      };

      mockClient.request = jest.fn().mockResolvedValue({
        listtestitemsresponse: {
          testitem: [
            { id: 'item-123', name: 'Test Item', state: 'Active' },
          ],
        },
      });

      const handler = createGetHandler<TestItem>(mockClient, configWithCustomFormat);
      const result = await handler({ id: 'item-123' });

      expect(result.content[0].text).toBe('Custom: Test Item is Active');
    });

    it('should handle N/A for missing optional fields', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listtestitemsresponse: {
          testitem: [
            { id: 'item-123', name: 'Test Item', state: 'Active' },
          ],
        },
      });

      const handler = createGetHandler<TestItem>(mockClient, getConfig);
      const result = await handler({ id: 'item-123' });

      expect(result.content[0].text).toContain('Description: N/A');
    });
  });

  describe('createActionHandler', () => {
    const actionConfig: ActionHandlerConfig = {
      command: 'startTestItem',
      responseKey: 'starttestitemresponse',
      actionVerb: 'Started',
      itemName: 'test item',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      resultIdField: 'id',
    };

    it('should create an action handler that returns success message', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        starttestitemresponse: {
          id: 'item-123',
          jobid: 'job-456',
        },
      });

      const handler = createActionHandler(mockClient, actionConfig);
      const result = await handler({ id: 'item-123' });

      expect(mockClient.request).toHaveBeenCalledWith('startTestItem', { id: 'item-123' });
      expect(result.content[0].text).toContain('Started test item');
      expect(result.content[0].text).toContain('ID: item-123');
      expect(result.content[0].text).toContain('Job ID: job-456');
    });

    it('should return error when required field is missing', async () => {
      const handler = createActionHandler(mockClient, actionConfig);
      const result = await handler({});

      expect(result.content[0].text).toContain('Error: id is required');
      expect(mockClient.request).not.toHaveBeenCalled();
    });

    it('should return error for empty string required field', async () => {
      const handler = createActionHandler(mockClient, actionConfig);
      const result = await handler({ id: '' });

      expect(result.content[0].text).toContain('Error: id is required');
    });

    it('should return error for null required field', async () => {
      const handler = createActionHandler(mockClient, actionConfig);
      // Cast to any to test null handling at runtime
      const result = await handler({ id: null as unknown as string });

      expect(result.content[0].text).toContain('Error: id is required');
    });

    it('should use custom success message if provided', async () => {
      const configWithMessage: ActionHandlerConfig = {
        ...actionConfig,
        successMessage: (args, result) => `Custom: Started ${args.id}, job ${result?.jobid}`,
      };

      mockClient.request = jest.fn().mockResolvedValue({
        starttestitemresponse: {
          jobid: 'job-456',
        },
      });

      const handler = createActionHandler(mockClient, configWithMessage);
      const result = await handler({ id: 'item-123' });

      expect(result.content[0].text).toBe('Custom: Started item-123, job job-456');
    });

    it('should handle action without job ID', async () => {
      const configNoJob: ActionHandlerConfig = {
        command: 'updateTestItem',
        responseKey: 'updatetestitemresponse',
        actionVerb: 'Updated',
        itemName: 'test item',
        requiredFields: ['id'],
      };

      mockClient.request = jest.fn().mockResolvedValue({
        updatetestitemresponse: {
          success: true,
        },
      });

      const handler = createActionHandler(mockClient, configNoJob);
      const result = await handler({ id: 'item-123' });

      expect(result.content[0].text).toContain('Updated test item');
      expect(result.content[0].text).not.toContain('Job ID');
    });

    it('should handle action with multiple required fields', async () => {
      const configMultiRequired: ActionHandlerConfig = {
        command: 'attachTestItem',
        responseKey: 'attachtestitemresponse',
        actionVerb: 'Attached',
        itemName: 'test item',
        requiredFields: ['id', 'targetid'],
        jobIdField: 'jobid',
      };

      // Missing targetid
      const handler = createActionHandler(mockClient, configMultiRequired);
      const result = await handler({ id: 'item-123' });

      expect(result.content[0].text).toContain('Error: targetid is required');
    });

    it('should handle action with no required fields', async () => {
      const configNoRequired: ActionHandlerConfig = {
        command: 'listAllItems',
        responseKey: 'listallitemsresponse',
        actionVerb: 'Listed',
        itemName: 'items',
      };

      mockClient.request = jest.fn().mockResolvedValue({
        listallitemsresponse: {},
      });

      const handler = createActionHandler(mockClient, configNoRequired);
      const result = await handler({});

      expect(mockClient.request).toHaveBeenCalled();
      expect(result.content[0].text).toContain('Listed items');
    });

    it('should pass all arguments to the API', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        starttestitemresponse: { jobid: 'job-456' },
      });

      const handler = createActionHandler(mockClient, actionConfig);
      await handler({ id: 'item-123', forced: true, cleanup: false });

      expect(mockClient.request).toHaveBeenCalledWith('startTestItem', {
        id: 'item-123',
        forced: true,
        cleanup: false,
      });
    });
  });
});
