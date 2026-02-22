import { VmSnapshotHandlers } from '../src/handlers/vm-snapshot-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

jest.mock('../src/cloudstack-client.js');

describe('VmSnapshotHandlers', () => {
  let handlers: VmSnapshotHandlers;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;
    mockClient.request = jest.fn();
    handlers = new VmSnapshotHandlers(mockClient);
  });

  describe('handleCreateVmSnapshot', () => {
    it('should successfully create a VM snapshot', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createvmsnapshotresponse: { jobid: 'job-101' },
      });

      const result = await handlers.handleCreateVmSnapshot({ virtualmachineid: 'vm-1' });

      expect(mockClient.request).toHaveBeenCalledWith('createVMSnapshot', { virtualmachineid: 'vm-1' });
      expect(result.content[0].text).toContain('vm-1');
      expect(result.content[0].text).toContain('job-101');
    });

    it('should return error for missing virtualmachineid', async () => {
      const result = await handlers.handleCreateVmSnapshot({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('virtualmachineid');
    });
  });

  describe('handleDeleteVmSnapshot', () => {
    it('should successfully delete a VM snapshot', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deletevmsnapshotresponse: { jobid: 'job-102' },
      });

      const result = await handlers.handleDeleteVmSnapshot({ vmsnapshotid: 'snap-1' });

      expect(mockClient.request).toHaveBeenCalledWith('deleteVMSnapshot', { vmsnapshotid: 'snap-1' });
      expect(result.content[0].text).toContain('snap-1');
      expect(result.content[0].text).toContain('job-102');
    });

    it('should return error for missing vmsnapshotid', async () => {
      const result = await handlers.handleDeleteVmSnapshot({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('vmsnapshotid');
    });
  });

  describe('handleListVmSnapshots', () => {
    it('should list VM snapshots', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listvmsnapshotresponse: {
          vmSnapshot: [
            {
              id: 'snap-1',
              name: 'before-upgrade',
              displayname: 'Before Upgrade',
              state: 'Ready',
              type: 'DiskAndMemory',
              virtualmachineid: 'vm-1',
            },
          ],
        },
      });

      const result = await handlers.handleListVmSnapshots({});

      expect(mockClient.request).toHaveBeenCalledWith('listVMSnapshot', {});
      expect(result.content[0].text).toContain('Found 1');
    });

    it('should handle empty list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listvmsnapshotresponse: { vmSnapshot: [] },
      });

      const result = await handlers.handleListVmSnapshots({});
      expect(result.content[0].text).toContain('No');
    });
  });

  describe('handleRevertToVmSnapshot', () => {
    it('should successfully revert to a VM snapshot', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        reverttovmsnapshotresponse: { jobid: 'job-103' },
      });

      const result = await handlers.handleRevertToVmSnapshot({ vmsnapshotid: 'snap-1' });

      expect(mockClient.request).toHaveBeenCalledWith('revertToVMSnapshot', { vmsnapshotid: 'snap-1' });
      expect(result.content[0].text).toContain('snap-1');
      expect(result.content[0].text).toContain('job-103');
    });

    it('should return error for missing vmsnapshotid', async () => {
      const result = await handlers.handleRevertToVmSnapshot({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('vmsnapshotid');
    });
  });
});
