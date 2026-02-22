import { BackupHandlers } from '../src/handlers/backup-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

// Mock CloudStackClient
jest.mock('../src/cloudstack-client.js');

describe('BackupHandlers', () => {
  let handlers: BackupHandlers;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;
    mockClient.request = jest.fn();
    handlers = new BackupHandlers(mockClient);
  });

  // ===== Backup Schedules =====

  describe('handleCreateBackupSchedule', () => {
    it('should successfully create a backup schedule', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createbackupscheduleresponse: { id: 'sched-1' },
      });

      const args = { virtualmachineid: 'vm-1', intervaltype: 'daily', schedule: '00:00', timezone: 'UTC' };
      const result = await handlers.handleCreateBackupSchedule(args);

      expect(mockClient.request).toHaveBeenCalledWith('createBackupSchedule', args);
      expect(result.content[0].text).toContain('vm-1');
      expect(result.content[0].text).toContain('daily');
    });

    it('should return error when virtualmachineid is missing', async () => {
      const result = await handlers.handleCreateBackupSchedule({ intervaltype: 'daily', schedule: '00:00', timezone: 'UTC' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('virtualmachineid');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error when intervaltype is missing', async () => {
      const result = await handlers.handleCreateBackupSchedule({ virtualmachineid: 'vm-1', schedule: '00:00', timezone: 'UTC' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('intervaltype');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error when schedule is missing', async () => {
      const result = await handlers.handleCreateBackupSchedule({ virtualmachineid: 'vm-1', intervaltype: 'daily', timezone: 'UTC' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('schedule');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error when timezone is missing', async () => {
      const result = await handlers.handleCreateBackupSchedule({ virtualmachineid: 'vm-1', intervaltype: 'daily', schedule: '00:00' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('timezone');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleDeleteBackupSchedule', () => {
    it('should successfully delete a backup schedule', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deletebackupscheduleresponse: { success: true },
      });

      const args = { virtualmachineid: 'vm-1' };
      const result = await handlers.handleDeleteBackupSchedule(args);

      expect(mockClient.request).toHaveBeenCalledWith('deleteBackupSchedule', args);
      expect(result.content[0].text).toContain('vm-1');
    });

    it('should return error when virtualmachineid is missing', async () => {
      const result = await handlers.handleDeleteBackupSchedule({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('virtualmachineid');
      expect(result.content[0].text).toContain('required');
    });
  });

  // ===== Backup Provider Offerings =====

  describe('handleListBackupProviderOfferings', () => {
    it('should list backup provider offerings', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listbackupproviderofferingsresponse: {
          backupprovideroffering: [
            { id: 'bpo-1', name: 'Daily Backup', description: 'Daily backup plan', externalid: 'ext-1' },
            { id: 'bpo-2', name: 'Weekly Backup', description: 'Weekly backup plan', externalid: 'ext-2' },
          ],
        },
      });

      const result = await handlers.handleListBackupProviderOfferings({});

      expect(mockClient.request).toHaveBeenCalledWith('listBackupProviderOfferings', {});
      expect(result.content[0].text).toContain('Found 2');
      expect(result.content[0].text).toContain('Daily Backup');
      expect(result.content[0].text).toContain('Weekly Backup');
    });

    it('should handle empty list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listbackupproviderofferingsresponse: { backupprovideroffering: [] },
      });

      const result = await handlers.handleListBackupProviderOfferings({});
      expect(result.content[0].text).toContain('No backup provider offerings found');
    });
  });

  // ===== Backup Offerings =====

  describe('handleListBackupOfferings', () => {
    it('should list backup offerings', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listbackupofferingsresponse: {
          backupoffering: [
            { id: 'bo-1', name: 'Standard Backup', description: 'Standard backup', zoneid: 'zone-1' },
          ],
        },
      });

      const result = await handlers.handleListBackupOfferings({});

      expect(mockClient.request).toHaveBeenCalledWith('listBackupOfferings', {});
      expect(result.content[0].text).toContain('Found 1');
      expect(result.content[0].text).toContain('Standard Backup');
    });

    it('should handle empty list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listbackupofferingsresponse: { backupoffering: [] },
      });

      const result = await handlers.handleListBackupOfferings({});
      expect(result.content[0].text).toContain('No backup offerings found');
    });
  });

  describe('handleImportBackupOffering', () => {
    it('should successfully import a backup offering', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        importbackupofferingresponse: { id: 'bo-new-1' },
      });

      const args = { externalid: 'ext-1', name: 'Imported Backup', description: 'Imported plan', zoneid: 'zone-1' };
      const result = await handlers.handleImportBackupOffering(args);

      expect(mockClient.request).toHaveBeenCalledWith('importBackupOffering', args);
      expect(result.content[0].text).toContain('Imported Backup');
      expect(result.content[0].text).toContain('ext-1');
    });

    it('should return error when externalid is missing', async () => {
      const result = await handlers.handleImportBackupOffering({ name: 'Backup', description: 'desc', zoneid: 'zone-1' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('externalid');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error when name is missing', async () => {
      const result = await handlers.handleImportBackupOffering({ externalid: 'ext-1', description: 'desc', zoneid: 'zone-1' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('name');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error when zoneid is missing', async () => {
      const result = await handlers.handleImportBackupOffering({ externalid: 'ext-1', name: 'Backup', description: 'desc' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('zoneid');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleDeleteBackupOffering', () => {
    it('should successfully delete a backup offering', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deletebackupofferingresponse: { success: true },
      });

      const args = { id: 'bo-1' };
      const result = await handlers.handleDeleteBackupOffering(args);

      expect(mockClient.request).toHaveBeenCalledWith('deleteBackupOffering', args);
      expect(result.content[0].text).toContain('bo-1');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleDeleteBackupOffering({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
      expect(result.content[0].text).toContain('required');
    });
  });

  // ===== VM Backup Assignment =====

  describe('handleAssignVirtualMachineToBackupOffering', () => {
    it('should successfully assign VM to backup offering', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        assignvirtualmachinetobackupofferingresponse: { jobid: 'job-600' },
      });

      const args = { virtualmachineid: 'vm-1', backupofferingid: 'bo-1' };
      const result = await handlers.handleAssignVirtualMachineToBackupOffering(args);

      expect(mockClient.request).toHaveBeenCalledWith('assignVirtualMachineToBackupOffering', args);
      expect(result.content[0].text).toContain('vm-1');
      expect(result.content[0].text).toContain('bo-1');
      expect(result.content[0].text).toContain('job-600');
    });

    it('should return error when virtualmachineid is missing', async () => {
      const result = await handlers.handleAssignVirtualMachineToBackupOffering({ backupofferingid: 'bo-1' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('virtualmachineid');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error when backupofferingid is missing', async () => {
      const result = await handlers.handleAssignVirtualMachineToBackupOffering({ virtualmachineid: 'vm-1' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('backupofferingid');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleRemoveVirtualMachineFromBackupOffering', () => {
    it('should successfully remove VM from backup offering', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        removevirtualmachinefrombackupofferingresponse: { jobid: 'job-601' },
      });

      const args = { virtualmachineid: 'vm-1' };
      const result = await handlers.handleRemoveVirtualMachineFromBackupOffering(args);

      expect(mockClient.request).toHaveBeenCalledWith('removeVirtualMachineFromBackupOffering', args);
      expect(result.content[0].text).toContain('vm-1');
      expect(result.content[0].text).toContain('job-601');
    });

    it('should return error when virtualmachineid is missing', async () => {
      const result = await handlers.handleRemoveVirtualMachineFromBackupOffering({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('virtualmachineid');
      expect(result.content[0].text).toContain('required');
    });
  });

  // ===== Backups =====

  describe('handleCreateBackup', () => {
    it('should successfully create a backup', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createbackupresponse: { jobid: 'job-700' },
      });

      const args = { virtualmachineid: 'vm-1' };
      const result = await handlers.handleCreateBackup(args);

      expect(mockClient.request).toHaveBeenCalledWith('createBackup', args);
      expect(result.content[0].text).toContain('vm-1');
      expect(result.content[0].text).toContain('job-700');
    });

    it('should return error when virtualmachineid is missing', async () => {
      const result = await handlers.handleCreateBackup({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('virtualmachineid');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleDeleteBackup', () => {
    it('should successfully delete a backup', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deletebackupresponse: { jobid: 'job-701' },
      });

      const args = { id: 'backup-1' };
      const result = await handlers.handleDeleteBackup(args);

      expect(mockClient.request).toHaveBeenCalledWith('deleteBackup', args);
      expect(result.content[0].text).toContain('backup-1');
      expect(result.content[0].text).toContain('job-701');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleDeleteBackup({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleListBackups', () => {
    it('should list backups', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listbackupsresponse: {
          backup: [
            {
              id: 'backup-1',
              virtualmachineid: 'vm-1',
              virtualmachinename: 'web-server',
              status: 'BackedUp',
              backupofferingid: 'bo-1',
              backupofferingname: 'Daily',
              zoneid: 'zone-1',
            },
            {
              id: 'backup-2',
              virtualmachineid: 'vm-2',
              virtualmachinename: 'db-server',
              status: 'BackedUp',
              backupofferingid: 'bo-1',
              backupofferingname: 'Daily',
              zoneid: 'zone-1',
            },
          ],
        },
      });

      const result = await handlers.handleListBackups({});

      expect(mockClient.request).toHaveBeenCalledWith('listBackups', {});
      expect(result.content[0].text).toContain('Found 2');
      expect(result.content[0].text).toContain('web-server');
      expect(result.content[0].text).toContain('db-server');
    });

    it('should handle empty list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listbackupsresponse: { backup: [] },
      });

      const result = await handlers.handleListBackups({});
      expect(result.content[0].text).toContain('No backups found');
    });
  });

  describe('handleRestoreBackup', () => {
    it('should successfully restore a backup', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        restorebackupresponse: { jobid: 'job-702' },
      });

      const args = { id: 'backup-1' };
      const result = await handlers.handleRestoreBackup(args);

      expect(mockClient.request).toHaveBeenCalledWith('restoreBackup', args);
      expect(result.content[0].text).toContain('backup-1');
      expect(result.content[0].text).toContain('job-702');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleRestoreBackup({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
      expect(result.content[0].text).toContain('required');
    });
  });
});
