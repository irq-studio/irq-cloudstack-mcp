/**
 * Storage Handlers
 *
 * Uses the factory pattern for list and action handlers:
 * - Declarative field definitions for list operations
 * - Action handler configs for create/delete/attach/detach operations
 */

import type { CloudStackClient } from '../cloudstack-client.js';
import {
  createListHandler,
  createActionHandler,
  formatBytes,
  type FieldDefinition,
} from '../utils/index.js';
import type {
  Volume,
  Snapshot,
  DiskOffering,
  ImageStore,
  SnapshotPolicy,
} from '../types/index.js';

export class StorageHandlers {
  // Field definitions for list handlers
  private static readonly volumeFields: FieldDefinition<Volume>[] = [
    { key: 'type', label: 'Type' },
    { key: 'size', label: 'Size', format: (v: unknown) => formatBytes(v as number) },
    { key: 'state', label: 'State' },
    { key: 'zonename', label: 'Zone' },
    { key: 'vmname', label: 'VM', format: (v: unknown) => v ? String(v) : 'Not attached' },
    { key: 'deviceid', label: 'Device ID', format: (v: unknown) => v !== undefined ? String(v) : 'N/A' },
    { key: 'diskofferingname', label: 'Disk Offering' },
    { key: 'created', label: 'Created' },
  ];

  private static readonly snapshotFields: FieldDefinition<Snapshot>[] = [
    { key: 'state', label: 'State' },
    { key: (item: Snapshot) => item.volumename || item.volumeid, label: 'Volume' },
    { key: 'snapshottype', label: 'Type' },
    { key: 'intervaltype', label: 'Interval' },
    { key: 'created', label: 'Created' },
  ];

  private static readonly diskOfferingFields: FieldDefinition<DiskOffering>[] = [
    { key: 'displaytext', label: 'Display Text' },
    { key: 'disksize', label: 'Disk Size', format: (v: unknown) => v ? `${v}GB` : 'Custom' },
    { key: 'iscustomized', label: 'Custom', format: (v: unknown) => v ? 'Yes' : 'No' },
    { key: 'storagetype', label: 'Storage Type' },
  ];

  // Handler instances
  public readonly handleListVolumes;
  public readonly handleListSnapshots;
  public readonly handleListDiskOfferings;
  public readonly handleListImageStores;
  public readonly handleListSnapshotPolicies;
  public readonly handleCreateVolume;
  public readonly handleAttachVolume;
  public readonly handleDetachVolume;
  public readonly handleResizeVolume;
  public readonly handleCreateSnapshot;
  public readonly handleDeleteVolume;
  public readonly handleDeleteSnapshot;
  public readonly handleRevertSnapshot;
  public readonly handleUpdateVolume;
  public readonly handleMigrateVolume;
  public readonly handleExtractVolume;
  public readonly handleCreateSnapshotPolicy;
  public readonly handleDeleteSnapshotPolicy;
  public readonly handleUpdateSnapshotPolicy;

  constructor(cloudStackClient: CloudStackClient) {
    // List handlers using factory
    this.handleListVolumes = createListHandler<Volume>(cloudStackClient, {
      command: 'listVolumes',
      responseKey: 'listvolumesresponse',
      arrayKey: 'volume',
      itemName: 'volume',
      titleField: 'name',
      idField: 'id',
      fields: StorageHandlers.volumeFields,
    });

    this.handleListSnapshots = createListHandler<Snapshot>(cloudStackClient, {
      command: 'listSnapshots',
      responseKey: 'listsnapshotsresponse',
      arrayKey: 'snapshot',
      itemName: 'snapshot',
      titleField: 'name',
      idField: 'id',
      fields: StorageHandlers.snapshotFields,
    });

    this.handleListDiskOfferings = createListHandler<DiskOffering>(cloudStackClient, {
      command: 'listDiskOfferings',
      responseKey: 'listdiskofferingsresponse',
      arrayKey: 'diskoffering',
      itemName: 'disk offering',
      titleField: 'name',
      idField: 'id',
      fields: StorageHandlers.diskOfferingFields,
    });

    // Action handlers using factory
    this.handleCreateVolume = createActionHandler(cloudStackClient, {
      command: 'createVolume',
      responseKey: 'createvolumeresponse',
      actionVerb: 'Created',
      itemName: 'volume',
      requiredFields: ['name', 'diskofferingid', 'zoneid'],
      jobIdField: 'jobid',
      resultIdField: 'id',
    });

    this.handleAttachVolume = createActionHandler(cloudStackClient, {
      command: 'attachVolume',
      responseKey: 'attachvolumeresponse',
      actionVerb: 'Attached',
      itemName: 'volume',
      requiredFields: ['id', 'virtualmachineid'],
      jobIdField: 'jobid',
      successMessage: (args) => `Attached volume ${args.id} to VM ${args.virtualmachineid}`,
    });

    this.handleDetachVolume = createActionHandler(cloudStackClient, {
      command: 'detachVolume',
      responseKey: 'detachvolumeresponse',
      actionVerb: 'Detached',
      itemName: 'volume',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args) => `Detached volume ${args.id}`,
    });

    this.handleResizeVolume = createActionHandler(cloudStackClient, {
      command: 'resizeVolume',
      responseKey: 'resizevolumeresponse',
      actionVerb: 'Resized',
      itemName: 'volume',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args) => `Resized volume ${args.id}`,
    });

    this.handleCreateSnapshot = createActionHandler(cloudStackClient, {
      command: 'createSnapshot',
      responseKey: 'createsnapshotresponse',
      actionVerb: 'Created',
      itemName: 'snapshot',
      requiredFields: ['volumeid'],
      jobIdField: 'jobid',
      resultIdField: 'id',
      successMessage: (args, result) =>
        `Created snapshot of volume ${args.volumeid}\nSnapshot ID: ${result?.id || 'pending'}`,
    });

    this.handleDeleteVolume = createActionHandler(cloudStackClient, {
      command: 'deleteVolume',
      responseKey: 'deletevolumeresponse',
      actionVerb: 'Deleting',
      itemName: 'volume',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args) => `Deleting volume ${args.id}`,
    });

    this.handleDeleteSnapshot = createActionHandler(cloudStackClient, {
      command: 'deleteSnapshot',
      responseKey: 'deletesnapshotresponse',
      actionVerb: 'Deleting',
      itemName: 'snapshot',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args) => `Deleting snapshot ${args.id}`,
    });

    this.handleRevertSnapshot = createActionHandler(cloudStackClient, {
      command: 'revertSnapshot',
      responseKey: 'revertsnapshotresponse',
      actionVerb: 'Reverting to',
      itemName: 'snapshot',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args) => `Reverting to snapshot ${args.id}`,
    });

    this.handleUpdateVolume = createActionHandler(cloudStackClient, {
      command: 'updateVolume',
      responseKey: 'updatevolumeresponse',
      actionVerb: 'Updated',
      itemName: 'volume',
      requiredFields: ['id'],
    });

    this.handleMigrateVolume = createActionHandler(cloudStackClient, {
      command: 'migrateVolume',
      responseKey: 'migratevolumeresponse',
      actionVerb: 'Migrating',
      itemName: 'volume',
      requiredFields: ['volumeid', 'storageid'],
      jobIdField: 'jobid',
    });

    this.handleExtractVolume = createActionHandler(cloudStackClient, {
      command: 'extractVolume',
      responseKey: 'extractvolumeresponse',
      actionVerb: 'Extracting',
      itemName: 'volume',
      requiredFields: ['id', 'mode', 'zoneid'],
      jobIdField: 'jobid',
    });

    this.handleListImageStores = createListHandler<ImageStore>(cloudStackClient, {
      command: 'listImageStores',
      responseKey: 'listimagestoresresponse',
      arrayKey: 'imagestore',
      itemName: 'image store',
      titleField: 'name',
      idField: 'id',
      fields: [
        { key: 'name', label: 'Name' },
        { key: 'url', label: 'URL', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'protocol', label: 'Protocol', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'zonename', label: 'Zone', format: (v: unknown) => v ? String(v) : 'N/A' },
      ],
    });

    this.handleCreateSnapshotPolicy = createActionHandler(cloudStackClient, {
      command: 'createSnapshotPolicy',
      responseKey: 'createsnapshotpolicyresponse',
      actionVerb: 'Created',
      itemName: 'snapshot policy',
      requiredFields: ['volumeid', 'intervaltype', 'maxsnaps', 'schedule', 'timezone'],
    });

    this.handleDeleteSnapshotPolicy = createActionHandler(cloudStackClient, {
      command: 'deleteSnapshotPolicy',
      responseKey: 'deletesnapshotpolicyresponse',
      actionVerb: 'Deleted',
      itemName: 'snapshot policy',
      requiredFields: ['id'],
    });

    this.handleListSnapshotPolicies = createListHandler<SnapshotPolicy>(cloudStackClient, {
      command: 'listSnapshotPolicies',
      responseKey: 'listsnapshotpoliciesresponse',
      arrayKey: 'snapshotpolicy',
      itemName: 'snapshot policy',
      titleField: 'id',
      idField: 'id',
      fields: [
        { key: 'volumeid', label: 'Volume ID', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'intervaltype', label: 'Interval Type', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'schedule', label: 'Schedule', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'timezone', label: 'Timezone', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'maxsnaps', label: 'Max Snaps', format: (v: unknown) => v ? String(v) : 'N/A' },
      ],
    });

    this.handleUpdateSnapshotPolicy = createActionHandler(cloudStackClient, {
      command: 'updateSnapshotPolicy',
      responseKey: 'updatesnapshotpolicyresponse',
      actionVerb: 'Updated',
      itemName: 'snapshot policy',
      requiredFields: ['id'],
    });
  }
}
