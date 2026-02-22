/**
 * VM Snapshot Handlers
 *
 * Uses the factory pattern for list and action handlers:
 * - VM Snapshots (create, delete, list, revert)
 */

import type { CloudStackClient } from '../cloudstack-client.js';
import {
  createListHandler,
  createActionHandler,
  type FieldDefinition,
} from '../utils/index.js';
import type { VMSnapshot } from '../types/index.js';

export class VmSnapshotHandlers {
  // Field definitions for VM Snapshots
  private static readonly vmSnapshotFields: FieldDefinition<VMSnapshot>[] = [
    { key: 'displayname', label: 'Display Name', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'description', label: 'Description', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'state', label: 'State' },
    { key: 'type', label: 'Type' },
    { key: 'current', label: 'Current', format: (v: unknown) => v !== undefined ? String(v) : 'N/A' },
    { key: 'virtualmachineid', label: 'VM ID' },
    { key: 'parent', label: 'Parent', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'parentName', label: 'Parent Name', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'account', label: 'Account', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'domain', label: 'Domain', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'created', label: 'Created', format: (v: unknown) => v ? String(v) : 'N/A' },
  ];

  // Handler instances
  public readonly handleListVmSnapshots;
  public readonly handleCreateVmSnapshot;
  public readonly handleDeleteVmSnapshot;
  public readonly handleRevertToVmSnapshot;

  constructor(cloudStackClient: CloudStackClient) {
    this.handleListVmSnapshots = createListHandler<VMSnapshot>(cloudStackClient, {
      command: 'listVMSnapshot',
      responseKey: 'listvmsnapshotresponse',
      arrayKey: 'vmSnapshot',
      itemName: 'VM snapshot',
      titleField: 'name',
      idField: 'id',
      fields: VmSnapshotHandlers.vmSnapshotFields,
    });

    this.handleCreateVmSnapshot = createActionHandler(cloudStackClient, {
      command: 'createVMSnapshot',
      responseKey: 'createvmsnapshotresponse',
      actionVerb: 'Creating',
      itemName: 'VM snapshot',
      requiredFields: ['virtualmachineid'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Creating VM snapshot for VM ${args.virtualmachineid}${args.name ? ` with name "${args.name}"` : ''}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleDeleteVmSnapshot = createActionHandler(cloudStackClient, {
      command: 'deleteVMSnapshot',
      responseKey: 'deletevmsnapshotresponse',
      actionVerb: 'Deleting',
      itemName: 'VM snapshot',
      requiredFields: ['vmsnapshotid'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Deleting VM snapshot ${args.vmsnapshotid}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleRevertToVmSnapshot = createActionHandler(cloudStackClient, {
      command: 'revertToVMSnapshot',
      responseKey: 'reverttovmsnapshotresponse',
      actionVerb: 'Reverting to',
      itemName: 'VM snapshot',
      requiredFields: ['vmsnapshotid'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Reverting to VM snapshot ${args.vmsnapshotid}. Job ID: ${result?.jobid || 'N/A'}`,
    });
  }
}
