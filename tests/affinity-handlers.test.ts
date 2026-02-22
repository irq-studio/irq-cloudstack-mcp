import { AffinityHandlers } from '../src/handlers/affinity-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

// Mock CloudStackClient
jest.mock('../src/cloudstack-client.js');

describe('AffinityHandlers', () => {
  let handlers: AffinityHandlers;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;
    mockClient.request = jest.fn();
    handlers = new AffinityHandlers(mockClient);
  });

  describe('handleCreateAffinityGroup', () => {
    it('should successfully create affinity group', async () => {
      const mockResponse = {
        createaffinitygroupresponse: {
          affinitygroup: {
            id: 'ag-123',
            name: 'web-servers-anti-affinity',
            type: 'host anti-affinity',
            domainid: 'domain-1',
            account: 'admin',
          },
        },
      };
      mockClient.createAffinityGroup = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        name: 'web-servers-anti-affinity',
        type: 'host anti-affinity',
        description: 'Distribute web servers across hosts',
      };

      const result = await handlers.handleCreateAffinityGroup(args);

      expect(mockClient.createAffinityGroup).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('web-servers-anti-affinity');
      expect(result.content[0].text).toContain('ag-123');
      expect(result.content[0].text).toContain('host anti-affinity');
      expect(result.content[0].text).toContain('Distribute web servers across hosts');
    });

    it('should create affinity group without description', async () => {
      const mockResponse = {
        createaffinitygroupresponse: {
          affinitygroup: {
            id: 'ag-456',
            name: 'db-affinity',
            type: 'host affinity',
            domainid: 'domain-1',
            account: 'admin',
          },
        },
      };
      mockClient.createAffinityGroup = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        name: 'db-affinity',
        type: 'host affinity',
      };

      const result = await handlers.handleCreateAffinityGroup(args);

      expect(mockClient.createAffinityGroup).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('db-affinity');
      expect(result.content[0].text).not.toContain('Description:');
    });

    it('should handle creation errors', async () => {
      mockClient.createAffinityGroup = jest.fn().mockRejectedValue(new Error('Affinity group already exists'));

      const args = {
        name: 'duplicate-group',
        type: 'host anti-affinity',
      };

      await expect(handlers.handleCreateAffinityGroup(args)).rejects.toThrow('Affinity group already exists');
    });
  });

  describe('handleDeleteAffinityGroup', () => {
    it('should successfully delete affinity group by ID', async () => {
      // Factory handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        deleteaffinitygroupresponse: {
          jobid: 'job-789',
        },
      });

      const args = {
        id: 'ag-123',
      };

      const result = await handlers.handleDeleteAffinityGroup(args);

      expect(mockClient.request).toHaveBeenCalledWith('deleteAffinityGroup', args);
      expect(result.content[0].text).toContain('ag-123');
      expect(result.content[0].text).toContain('job-789');
    });

    it('should successfully delete affinity group by name', async () => {
      // Factory handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        deleteaffinitygroupresponse: {
          jobid: 'job-999',
        },
      });

      const args = {
        name: 'web-servers-anti-affinity',
      };

      const result = await handlers.handleDeleteAffinityGroup(args);

      expect(mockClient.request).toHaveBeenCalledWith('deleteAffinityGroup', args);
      expect(result.content[0].text).toContain('web-servers-anti-affinity');
      expect(result.content[0].text).toContain('job-999');
    });

    it('should handle deletion errors', async () => {
      mockClient.request = jest.fn().mockRejectedValue(new Error('Affinity group not found'));

      const args = {
        id: 'invalid-ag',
      };

      await expect(handlers.handleDeleteAffinityGroup(args)).rejects.toThrow('Affinity group not found');
    });
  });

  describe('handleListAffinityGroups', () => {
    it('should successfully list affinity groups', async () => {
      // Factory handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        listaffinitygroupsresponse: {
          affinitygroup: [
            {
              id: 'ag-1',
              name: 'web-servers',
              type: 'host anti-affinity',
              description: 'Web server distribution',
              domain: 'ROOT',
              account: 'admin',
              virtualmachineIds: ['vm-1', 'vm-2', 'vm-3'],
            },
            {
              id: 'ag-2',
              name: 'db-servers',
              type: 'host affinity',
              description: 'Database server affinity',
              domain: 'ROOT',
              account: 'dbadmin',
              virtualmachineIds: ['vm-4', 'vm-5'],
            },
          ],
        },
      });

      const result = await handlers.handleListAffinityGroups({});

      expect(mockClient.request).toHaveBeenCalledWith('listAffinityGroups', {});
      expect(result.content[0].text).toContain('Found 2 affinity groups');
      expect(result.content[0].text).toContain('web-servers');
      expect(result.content[0].text).toContain('host anti-affinity');
      expect(result.content[0].text).toContain('db-servers');
      expect(result.content[0].text).toContain('host affinity');
      expect(result.content[0].text).toContain('VMs: 3');
      expect(result.content[0].text).toContain('VMs: 2');
    });

    it('should handle empty affinity group list', async () => {
      // Factory handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        listaffinitygroupsresponse: {
          affinitygroup: [],
        },
      });

      const result = await handlers.handleListAffinityGroups({});

      // Factory list handlers say "No ... found" for empty lists
      expect(result.content[0].text).toContain('No affinity groups found');
    });

    it('should list affinity groups with no VMs attached', async () => {
      // Factory handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        listaffinitygroupsresponse: {
          affinitygroup: [
            {
              id: 'ag-3',
              name: 'empty-group',
              type: 'host anti-affinity',
              description: 'Test group',
              domain: 'ROOT',
              account: 'admin',
            },
          ],
        },
      });

      const result = await handlers.handleListAffinityGroups({});

      expect(result.content[0].text).toContain('empty-group');
      expect(result.content[0].text).toContain('VMs: 0');
    });

    it('should filter affinity groups by ID', async () => {
      // Factory handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        listaffinitygroupsresponse: {
          affinitygroup: [
            {
              id: 'ag-1',
              name: 'specific-group',
              type: 'host anti-affinity',
              description: 'Specific affinity group',
              domain: 'ROOT',
              account: 'admin',
              virtualmachineIds: ['vm-1'],
            },
          ],
        },
      });

      const args = { id: 'ag-1' };
      const result = await handlers.handleListAffinityGroups(args);

      expect(mockClient.request).toHaveBeenCalledWith('listAffinityGroups', args);
      expect(result.content[0].text).toContain('specific-group');
    });
  });

  describe('handleUpdateVMAffinityGroup', () => {
    it('should update VM affinity group successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updatevmaffinitygroupresponse: {
          jobid: 'job-update-ag',
        },
      });

      const result = await handlers.handleUpdateVMAffinityGroup({ id: 'vm-1', affinitygroupids: 'ag-1,ag-2' });

      expect(mockClient.request).toHaveBeenCalledWith('updateVMAffinityGroup', expect.objectContaining({ id: 'vm-1' }));
      expect(result.content[0].text).toContain('Updating affinity group for VM');
      expect(result.content[0].text).toContain('job-update-ag');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleUpdateVMAffinityGroup({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleListAffinityGroupTypes', () => {
    it('should list affinity group types successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listaffinitygrouptypesresponse: {
          affinityGroupType: [
            { type: 'host anti-affinity' },
            { type: 'host affinity' },
          ],
        },
      });

      const result = await handlers.handleListAffinityGroupTypes({});

      expect(mockClient.request).toHaveBeenCalledWith('listAffinityGroupTypes', {});
      expect(result.content[0].text).toContain('host anti-affinity');
    });

    it('should handle empty affinity group types list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listaffinitygrouptypesresponse: { affinityGroupType: [] },
      });

      const result = await handlers.handleListAffinityGroupTypes({});

      expect(result.content[0].text).toContain('No affinity group types found');
    });
  });
});
