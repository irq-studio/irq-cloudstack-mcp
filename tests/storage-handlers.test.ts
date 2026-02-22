import { StorageHandlers } from '../src/handlers/storage-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

// Mock CloudStackClient
jest.mock('../src/cloudstack-client.js');

describe('StorageHandlers', () => {
  let handlers: StorageHandlers;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;
    handlers = new StorageHandlers(mockClient);
  });

  describe('handleListVolumes', () => {
    it('should list volumes successfully', async () => {
      const mockResponse = {
        listvolumesresponse: {
          volume: [
            {
              id: 'vol-1',
              name: 'data-volume',
              type: 'DATA',
              size: 107374182400, // 100GB in bytes
              state: 'Ready',
              zonename: 'zone-1',
              vmname: 'test-vm',
              deviceid: 1,
              diskofferingname: 'Standard Disk',
              created: '2025-01-01T00:00:00+0000',
              path: '/mnt/data',
            },
            {
              id: 'vol-2',
              name: 'backup-volume',
              type: 'DATA',
              size: 536870912000, // 500GB in bytes
              state: 'Ready',
              zonename: 'zone-1',
              vmname: null,
              deviceid: null,
              diskofferingname: 'Premium Disk',
              created: '2025-01-02T00:00:00+0000',
              path: '/mnt/backup',
            },
          ],
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListVolumes({});

      expect(result.content[0].text).toContain('Found 2 volumes');
      expect(result.content[0].text).toContain('data-volume');
      expect(result.content[0].text).toContain('test-vm');
      expect(result.content[0].text).toContain('backup-volume');
      expect(result.content[0].text).toContain('Not attached');
    });

    it('should handle empty volume list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listvolumesresponse: {},
      });

      const result = await handlers.handleListVolumes({});

      expect(result.content[0].text).toContain('No volumes found');
    });

    it('should filter volumes by VM ID', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listvolumesresponse: { volume: [] },
      });

      await handlers.handleListVolumes({ virtualmachineid: 'vm-123' });

      expect(mockClient.request).toHaveBeenCalledWith('listVolumes', { virtualmachineid: 'vm-123' });
    });
  });

  describe('handleCreateVolume', () => {
    it('should create a volume successfully', async () => {
      const mockResponse = {
        createvolumeresponse: {
          jobid: 'job-123',
          id: 'vol-new',
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        name: 'new-volume',
        diskofferingid: 'do-1',
        zoneid: 'zone-1',
      };

      const result = await handlers.handleCreateVolume(args);

      expect(mockClient.request).toHaveBeenCalledWith('createVolume', args);
      expect(result.content[0].text).toContain('job-123');
      expect(result.content[0].text).toContain('vol-new');
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleCreateVolume({ name: 'test' } as any);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleAttachVolume', () => {
    it('should attach a volume to VM successfully', async () => {
      const mockResponse = {
        attachvolumeresponse: {
          jobid: 'job-456',
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        id: 'vol-1',
        virtualmachineid: 'vm-1',
      };

      const result = await handlers.handleAttachVolume(args);

      expect(mockClient.request).toHaveBeenCalledWith('attachVolume', args);
      expect(result.content[0].text).toContain('vol-1');
      expect(result.content[0].text).toContain('vm-1');
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleAttachVolume({ id: 'vol-1' } as any);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleDetachVolume', () => {
    it('should detach a volume successfully', async () => {
      const mockResponse = {
        detachvolumeresponse: {
          jobid: 'job-789',
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        id: 'vol-1',
      };

      const result = await handlers.handleDetachVolume(args);

      expect(mockClient.request).toHaveBeenCalledWith('detachVolume', args);
      expect(result.content[0].text).toContain('vol-1');
    });

    it('should return error for missing id field', async () => {
      const result = await handlers.handleDetachVolume({} as any);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleResizeVolume', () => {
    it('should resize a volume successfully', async () => {
      const mockResponse = {
        resizevolumeresponse: {
          jobid: 'job-resize',
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        id: 'vol-1',
        size: 200,
      };

      const result = await handlers.handleResizeVolume(args);

      expect(mockClient.request).toHaveBeenCalledWith('resizeVolume', args);
      expect(result.content[0].text).toContain('vol-1');
    });

    it('should return error for missing id field', async () => {
      const result = await handlers.handleResizeVolume({} as any);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleCreateSnapshot', () => {
    it('should create a snapshot successfully', async () => {
      const mockResponse = {
        createsnapshotresponse: {
          jobid: 'job-snap',
          id: 'snap-new',
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        volumeid: 'vol-1',
      };

      const result = await handlers.handleCreateSnapshot(args);

      expect(mockClient.request).toHaveBeenCalledWith('createSnapshot', args);
      expect(result.content[0].text).toContain('vol-1');
    });

    it('should return error for missing volumeid field', async () => {
      const result = await handlers.handleCreateSnapshot({} as any);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleListSnapshots', () => {
    it('should list snapshots successfully', async () => {
      const mockResponse = {
        listsnapshotsresponse: {
          snapshot: [
            {
              id: 'snap-1',
              name: 'daily-backup',
              state: 'BackedUp',
              volumeid: 'vol-1',
              intervaltype: 'DAILY',
              created: '2025-01-01T00:00:00+0000',
              snapshottype: 'MANUAL',
            },
            {
              id: 'snap-2',
              name: 'weekly-backup',
              state: 'BackedUp',
              volumeid: 'vol-2',
              intervaltype: 'WEEKLY',
              created: '2025-01-02T00:00:00+0000',
              snapshottype: 'RECURRING',
            },
          ],
        },
      };

      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListSnapshots({});

      expect(result.content[0].text).toContain('Found 2 snapshots');
      expect(result.content[0].text).toContain('daily-backup');
      expect(result.content[0].text).toContain('MANUAL');
      expect(result.content[0].text).toContain('DAILY');
      expect(result.content[0].text).toContain('weekly-backup');
      expect(result.content[0].text).toContain('RECURRING');
      expect(result.content[0].text).toContain('WEEKLY');
    });

    it('should handle empty snapshot list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listsnapshotsresponse: {},
      });

      const result = await handlers.handleListSnapshots({});

      expect(result.content[0].text).toContain('No snapshots found');
    });

    it('should filter snapshots by volume ID', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listsnapshotsresponse: { snapshot: [] },
      });

      await handlers.handleListSnapshots({ volumeid: 'vol-123' });

      expect(mockClient.request).toHaveBeenCalledWith('listSnapshots', { volumeid: 'vol-123' });
    });
  });

  describe('handleDeleteVolume', () => {
    it('should successfully delete a volume', async () => {
      const mockResponse = {
        deletevolumeresponse: {
          jobid: 'job-123',
        },
      };
      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        id: 'volume-123',
      };

      const result = await handlers.handleDeleteVolume(args);

      expect(mockClient.request).toHaveBeenCalledWith('deleteVolume', args);
      expect(result.content[0].text).toContain('volume-123');
    });

    it('should handle volume deletion errors', async () => {
      mockClient.request = jest.fn().mockRejectedValue(new Error('Volume is attached to VM'));

      const args = {
        id: 'volume-attached',
      };

      await expect(handlers.handleDeleteVolume(args)).rejects.toThrow('Volume is attached to VM');
    });
  });

  describe('handleDeleteSnapshot', () => {
    it('should successfully delete a snapshot', async () => {
      const mockResponse = {
        deletesnapshotresponse: {
          jobid: 'job-456',
        },
      };
      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        id: 'snapshot-789',
      };

      const result = await handlers.handleDeleteSnapshot(args);

      expect(mockClient.request).toHaveBeenCalledWith('deleteSnapshot', args);
      expect(result.content[0].text).toContain('snapshot-789');
    });

    it('should handle snapshot deletion errors', async () => {
      mockClient.request = jest.fn().mockRejectedValue(new Error('Snapshot not found'));

      const args = {
        id: 'invalid-snapshot',
      };

      await expect(handlers.handleDeleteSnapshot(args)).rejects.toThrow('Snapshot not found');
    });
  });

  describe('handleRevertSnapshot', () => {
    it('should successfully revert volume to snapshot', async () => {
      const mockResponse = {
        revertsnapshotresponse: {
          jobid: 'job-999',
        },
      };
      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        id: 'snapshot-123',
      };

      const result = await handlers.handleRevertSnapshot(args);

      expect(mockClient.request).toHaveBeenCalledWith('revertSnapshot', args);
      expect(result.content[0].text).toContain('snapshot-123');
    });

    it('should handle revert snapshot errors', async () => {
      mockClient.request = jest.fn().mockRejectedValue(new Error('Volume is in use'));

      const args = {
        id: 'snapshot-456',
      };

      await expect(handlers.handleRevertSnapshot(args)).rejects.toThrow('Volume is in use');
    });
  });

  describe('handleListDiskOfferings', () => {
    it('should successfully list disk offerings', async () => {
      const mockResponse = {
        listdiskofferingsresponse: {
          diskoffering: [
            {
              id: 'do-1',
              name: 'Standard Disk',
              displaytext: 'Standard performance disk',
              disksize: 100,
              iscustomized: false,
              storagetype: 'shared',
            },
            {
              id: 'do-2',
              name: 'Custom Disk',
              displaytext: 'Custom size disk',
              iscustomized: true,
              storagetype: 'shared',
            },
            {
              id: 'do-3',
              name: 'SSD Disk',
              displaytext: 'High performance SSD',
              disksize: 500,
              iscustomized: false,
              storagetype: 'local',
            },
          ],
        },
      };
      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListDiskOfferings({});

      expect(mockClient.request).toHaveBeenCalledWith('listDiskOfferings', {});
      expect(result.content[0].text).toContain('Found 3 disk offerings');
      expect(result.content[0].text).toContain('Standard Disk');
      expect(result.content[0].text).toContain('100GB');
      expect(result.content[0].text).toContain('Custom Disk');
      expect(result.content[0].text).toContain('Custom');
      expect(result.content[0].text).toContain('SSD Disk');
      expect(result.content[0].text).toContain('500GB');
      expect(result.content[0].text).toContain('shared');
      expect(result.content[0].text).toContain('local');
    });

    it('should handle empty disk offerings list', async () => {
      const mockResponse = {
        listdiskofferingsresponse: {
          diskoffering: [],
        },
      };
      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListDiskOfferings({});

      expect(result.content[0].text).toContain('No disk offerings found');
    });

    it('should filter disk offerings by name', async () => {
      const mockResponse = {
        listdiskofferingsresponse: {
          diskoffering: [
            {
              id: 'do-1',
              name: 'Premium SSD',
              displaytext: 'Premium performance',
              disksize: 1000,
              iscustomized: false,
              storagetype: 'local',
            },
          ],
        },
      };
      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const args = { name: 'Premium SSD' };
      const result = await handlers.handleListDiskOfferings(args);

      expect(mockClient.request).toHaveBeenCalledWith('listDiskOfferings', args);
      expect(result.content[0].text).toContain('Premium SSD');
    });

    it('should handle offerings without disk size (custom)', async () => {
      const mockResponse = {
        listdiskofferingsresponse: {
          diskoffering: [
            {
              id: 'do-custom',
              name: 'Custom Offering',
              displaytext: 'Fully customizable',
              iscustomized: true,
              storagetype: 'shared',
            },
          ],
        },
      };
      mockClient.request = jest.fn().mockResolvedValue(mockResponse);

      const result = await handlers.handleListDiskOfferings({});

      expect(result.content[0].text).toContain('Custom Offering');
      expect(result.content[0].text).toContain('Custom');
    });
  });

  describe('handleUpdateVolume', () => {
    it('should successfully update a volume', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updatevolumeresponse: { volume: { id: 'vol-123' } },
      });
      const result = await handlers.handleUpdateVolume({ id: 'vol-123' });
      expect(mockClient.request).toHaveBeenCalledWith('updateVolume', { id: 'vol-123' });
      expect(result.content[0].text).toContain('Updated volume');
    });

    it('should return error for missing required field', async () => {
      const result = await handlers.handleUpdateVolume({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleMigrateVolume', () => {
    it('should successfully migrate a volume', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        migratevolumeresponse: { jobid: 'job-123' },
      });
      const result = await handlers.handleMigrateVolume({ volumeid: 'vol-123', storageid: 'store-1' });
      expect(mockClient.request).toHaveBeenCalledWith('migrateVolume', { volumeid: 'vol-123', storageid: 'store-1' });
      expect(result.content[0].text).toContain('job-123');
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleMigrateVolume({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleExtractVolume', () => {
    it('should successfully extract a volume', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        extractvolumeresponse: { jobid: 'job-123' },
      });
      const result = await handlers.handleExtractVolume({ id: 'vol-123', mode: 'HTTP_DOWNLOAD', zoneid: 'zone-1' });
      expect(mockClient.request).toHaveBeenCalledWith('extractVolume', { id: 'vol-123', mode: 'HTTP_DOWNLOAD', zoneid: 'zone-1' });
      expect(result.content[0].text).toContain('job-123');
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleExtractVolume({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleListImageStores', () => {
    it('should list image stores successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listimagestoresresponse: {
          imagestore: [
            { id: 'is-1', name: 'primary-store', provider: 'NFS' },
          ],
        },
      });
      const result = await handlers.handleListImageStores({});
      expect(mockClient.request).toHaveBeenCalledWith('listImageStores', {});
      expect(result.content[0].text).toContain('is-1');
    });

    it('should handle empty image store list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listimagestoresresponse: {},
      });
      const result = await handlers.handleListImageStores({});
      expect(result.content[0].text).toBeDefined();
    });
  });

  describe('handleCreateSnapshotPolicy', () => {
    it('should successfully create a snapshot policy', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createsnapshotpolicyresponse: { snapshotpolicy: { id: 'sp-123' } },
      });
      const args = { intervaltype: 'DAILY', maxsnaps: 5, schedule: '00:00', timezone: 'UTC', volumeid: 'vol-1' };
      const result = await handlers.handleCreateSnapshotPolicy(args);
      expect(mockClient.request).toHaveBeenCalledWith('createSnapshotPolicy', args);
      expect(result.content[0].text).toContain('Created snapshot policy');
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleCreateSnapshotPolicy({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleDeleteSnapshotPolicy', () => {
    it('should successfully delete a snapshot policy', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deletesnapshotpolicyresponse: { success: true },
      });
      const result = await handlers.handleDeleteSnapshotPolicy({ id: 'sp-123' });
      expect(mockClient.request).toHaveBeenCalledWith('deleteSnapshotPolicy', { id: 'sp-123' });
      expect(result.content[0].text).toContain('Deleted snapshot policy');
    });

    it('should return error for missing required field', async () => {
      const result = await handlers.handleDeleteSnapshotPolicy({});
      expect(result.isError).toBe(true);
    });
  });

  describe('handleListSnapshotPolicies', () => {
    it('should list snapshot policies successfully', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listsnapshotpoliciesresponse: {
          snapshotpolicy: [
            { id: 'sp-1', intervaltype: 'DAILY', maxsnaps: 5 },
          ],
        },
      });
      const result = await handlers.handleListSnapshotPolicies({});
      expect(mockClient.request).toHaveBeenCalledWith('listSnapshotPolicies', {});
      expect(result.content[0].text).toContain('sp-1');
    });

    it('should handle empty snapshot policy list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listsnapshotpoliciesresponse: {},
      });
      const result = await handlers.handleListSnapshotPolicies({});
      expect(result.content[0].text).toBeDefined();
    });
  });

  describe('handleUpdateSnapshotPolicy', () => {
    it('should successfully update a snapshot policy', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updatesnapshotpolicyresponse: { snapshotpolicy: { id: 'sp-123' } },
      });
      const result = await handlers.handleUpdateSnapshotPolicy({ id: 'sp-123' });
      expect(mockClient.request).toHaveBeenCalledWith('updateSnapshotPolicy', { id: 'sp-123' });
      expect(result.content[0].text).toContain('Updated snapshot policy');
    });

    it('should return error for missing required field', async () => {
      const result = await handlers.handleUpdateSnapshotPolicy({});
      expect(result.isError).toBe(true);
    });
  });
});
