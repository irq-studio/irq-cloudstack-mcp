/**
 * Backup Handlers
 *
 * Uses the factory pattern for list and action handlers:
 * - Backup Schedules (create, delete)
 * - Backup Offerings (list, import, delete)
 * - Backup Provider Offerings (list)
 * - VM Backup Assignment (assign, remove)
 * - Backups (create, delete, list, restore)
 */

import type { CloudStackClient } from '../cloudstack-client.js';
import {
  createListHandler,
  createActionHandler,
  type FieldDefinition,
} from '../utils/index.js';
import type {
  BackupOffering,
  BackupProviderOffering,
  Backup,
} from '../types/index.js';

export class BackupHandlers {
  // Field definitions for Backup Offerings
  private static readonly backupOfferingFields: FieldDefinition<BackupOffering>[] = [
    { key: 'description', label: 'Description' },
    { key: 'zoneid', label: 'Zone ID' },
    { key: 'zonename', label: 'Zone Name', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'externalid', label: 'External ID', format: (v: unknown) => v ? String(v) : 'N/A' },
  ];

  // Field definitions for Backup Provider Offerings
  private static readonly backupProviderOfferingFields: FieldDefinition<BackupProviderOffering>[] = [
    { key: 'description', label: 'Description', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'externalid', label: 'External ID', format: (v: unknown) => v ? String(v) : 'N/A' },
  ];

  // Field definitions for Backups
  private static readonly backupFields: FieldDefinition<Backup>[] = [
    { key: 'status', label: 'Status' },
    { key: 'virtualmachineid', label: 'VM ID' },
    { key: 'virtualmachinename', label: 'VM Name', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'backupofferingid', label: 'Backup Offering ID' },
    { key: 'backupofferingname', label: 'Backup Offering', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'zoneid', label: 'Zone ID' },
    { key: 'zonename', label: 'Zone Name', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'size', label: 'Size', format: (v: unknown) => v !== undefined ? String(v) : 'N/A' },
    { key: 'type', label: 'Type', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'date', label: 'Date', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'account', label: 'Account', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'domain', label: 'Domain', format: (v: unknown) => v ? String(v) : 'N/A' },
  ];

  // Handler instances - Backup Schedules
  public readonly handleCreateBackupSchedule;
  public readonly handleDeleteBackupSchedule;

  // Handler instances - Backup Offerings
  public readonly handleListBackupOfferings;
  public readonly handleImportBackupOffering;
  public readonly handleDeleteBackupOffering;

  // Handler instances - Backup Provider Offerings
  public readonly handleListBackupProviderOfferings;

  // Handler instances - VM Backup Assignment
  public readonly handleAssignVirtualMachineToBackupOffering;
  public readonly handleRemoveVirtualMachineFromBackupOffering;

  // Handler instances - Backups
  public readonly handleListBackups;
  public readonly handleCreateBackup;
  public readonly handleDeleteBackup;
  public readonly handleRestoreBackup;

  constructor(cloudStackClient: CloudStackClient) {
    // --- Backup Schedules ---
    this.handleCreateBackupSchedule = createActionHandler(cloudStackClient, {
      command: 'createBackupSchedule',
      responseKey: 'createbackupscheduleresponse',
      actionVerb: 'Creating',
      itemName: 'backup schedule',
      requiredFields: ['virtualmachineid', 'intervaltype', 'schedule', 'timezone'],
      successMessage: (args, result) =>
        `Created backup schedule for VM ${args.virtualmachineid} (${args.intervaltype}: ${args.schedule}).${result?.id ? ` Schedule ID: ${result.id}` : ''}`,
    });

    this.handleDeleteBackupSchedule = createActionHandler(cloudStackClient, {
      command: 'deleteBackupSchedule',
      responseKey: 'deletebackupscheduleresponse',
      actionVerb: 'Deleting',
      itemName: 'backup schedule',
      requiredFields: ['virtualmachineid'],
      successMessage: (args) =>
        `Deleted backup schedule for VM ${args.virtualmachineid}.`,
    });

    // --- Backup Provider Offerings ---
    this.handleListBackupProviderOfferings = createListHandler<BackupProviderOffering>(cloudStackClient, {
      command: 'listBackupProviderOfferings',
      responseKey: 'listbackupproviderofferingsresponse',
      arrayKey: 'backupprovideroffering',
      itemName: 'backup provider offering',
      titleField: 'name',
      idField: 'id',
      fields: BackupHandlers.backupProviderOfferingFields,
    });

    // --- Backup Offerings ---
    this.handleListBackupOfferings = createListHandler<BackupOffering>(cloudStackClient, {
      command: 'listBackupOfferings',
      responseKey: 'listbackupofferingsresponse',
      arrayKey: 'backupoffering',
      itemName: 'backup offering',
      titleField: 'name',
      idField: 'id',
      fields: BackupHandlers.backupOfferingFields,
    });

    this.handleImportBackupOffering = createActionHandler(cloudStackClient, {
      command: 'importBackupOffering',
      responseKey: 'importbackupofferingresponse',
      actionVerb: 'Importing',
      itemName: 'backup offering',
      requiredFields: ['externalid', 'name', 'description', 'zoneid'],
      successMessage: (args, result) =>
        `Imported backup offering "${args.name}" from external ID ${args.externalid}.${result?.id ? ` Offering ID: ${result.id}` : ''}`,
    });

    this.handleDeleteBackupOffering = createActionHandler(cloudStackClient, {
      command: 'deleteBackupOffering',
      responseKey: 'deletebackupofferingresponse',
      actionVerb: 'Deleting',
      itemName: 'backup offering',
      requiredFields: ['id'],
      successMessage: (args) =>
        `Deleted backup offering ${args.id}.`,
    });

    // --- VM Backup Assignment ---
    this.handleAssignVirtualMachineToBackupOffering = createActionHandler(cloudStackClient, {
      command: 'assignVirtualMachineToBackupOffering',
      responseKey: 'assignvirtualmachinetobackupofferingresponse',
      actionVerb: 'Assigning',
      itemName: 'VM to backup offering',
      requiredFields: ['virtualmachineid', 'backupofferingid'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Assigning VM ${args.virtualmachineid} to backup offering ${args.backupofferingid}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleRemoveVirtualMachineFromBackupOffering = createActionHandler(cloudStackClient, {
      command: 'removeVirtualMachineFromBackupOffering',
      responseKey: 'removevirtualmachinefrombackupofferingresponse',
      actionVerb: 'Removing',
      itemName: 'VM from backup offering',
      requiredFields: ['virtualmachineid'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Removing VM ${args.virtualmachineid} from backup offering. Job ID: ${result?.jobid || 'N/A'}`,
    });

    // --- Backups ---
    this.handleListBackups = createListHandler<Backup>(cloudStackClient, {
      command: 'listBackups',
      responseKey: 'listbackupsresponse',
      arrayKey: 'backup',
      itemName: 'backup',
      titleField: 'virtualmachinename',
      idField: 'id',
      fields: BackupHandlers.backupFields,
    });

    this.handleCreateBackup = createActionHandler(cloudStackClient, {
      command: 'createBackup',
      responseKey: 'createbackupresponse',
      actionVerb: 'Creating',
      itemName: 'backup',
      requiredFields: ['virtualmachineid'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Creating backup for VM ${args.virtualmachineid}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleDeleteBackup = createActionHandler(cloudStackClient, {
      command: 'deleteBackup',
      responseKey: 'deletebackupresponse',
      actionVerb: 'Deleting',
      itemName: 'backup',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Deleting backup ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleRestoreBackup = createActionHandler(cloudStackClient, {
      command: 'restoreBackup',
      responseKey: 'restorebackupresponse',
      actionVerb: 'Restoring',
      itemName: 'backup',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Restoring backup ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });
  }
}
