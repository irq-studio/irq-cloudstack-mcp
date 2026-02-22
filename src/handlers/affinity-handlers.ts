/**
 * Affinity Group Handlers
 *
 * Uses the factory pattern for list and action handlers:
 * - Declarative field definitions for list operation
 * - Action handler config for delete operation
 * - Custom handler for create operation (nested response)
 */

import type { CloudStackClient } from '../cloudstack-client.js';
import {
  createListHandler,
  createActionHandler,
  type FieldDefinition,
} from '../utils/index.js';
import type { CreateAffinityGroupArgs } from '../handler-types.js';
import type { CreateAffinityGroupResponse, AffinityGroup, AffinityGroupType } from '../types/index.js';

export class AffinityHandlers {
  // Field definitions for list handler
  private static readonly affinityGroupFields: FieldDefinition<AffinityGroup>[] = [
    { key: 'type', label: 'Type' },
    { key: 'description', label: 'Description', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'domain', label: 'Domain', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'account', label: 'Account', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'virtualmachineIds', label: 'VMs', format: (v: unknown) => Array.isArray(v) ? String(v.length) : '0' },
  ];

  // Handler instances
  public readonly handleListAffinityGroups;
  public readonly handleListAffinityGroupTypes;
  public readonly handleDeleteAffinityGroup;
  public readonly handleUpdateVMAffinityGroup;

  // Store client for custom handlers
  private readonly cloudStackClient: CloudStackClient;

  constructor(cloudStackClient: CloudStackClient) {
    this.cloudStackClient = cloudStackClient;

    // List handler using factory
    this.handleListAffinityGroups = createListHandler<AffinityGroup>(cloudStackClient, {
      command: 'listAffinityGroups',
      responseKey: 'listaffinitygroupsresponse',
      arrayKey: 'affinitygroup',
      itemName: 'affinity group',
      titleField: 'name',
      idField: 'id',
      fields: AffinityHandlers.affinityGroupFields,
    });

    // Action handler using factory
    this.handleDeleteAffinityGroup = createActionHandler(cloudStackClient, {
      command: 'deleteAffinityGroup',
      responseKey: 'deleteaffinitygroupresponse',
      actionVerb: 'Deleting',
      itemName: 'affinity group',
      requiredFields: [], // Either id or name required
      jobIdField: 'jobid',
      successMessage: (args, result) => `Deleting affinity group ${args.id || args.name}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleUpdateVMAffinityGroup = createActionHandler(cloudStackClient, {
      command: 'updateVMAffinityGroup',
      responseKey: 'updatevmaffinitygroupresponse',
      actionVerb: 'Updating affinity group for',
      itemName: 'VM',
      requiredFields: ['id'],
      jobIdField: 'jobid',
    });

    this.handleListAffinityGroupTypes = createListHandler<AffinityGroupType>(cloudStackClient, {
      command: 'listAffinityGroupTypes',
      responseKey: 'listaffinitygrouptypesresponse',
      arrayKey: 'affinityGroupType',
      itemName: 'affinity group type',
      titleField: 'type',
      idField: 'type',
      fields: [
        { key: 'type', label: 'Type' },
      ],
    });
  }

  /**
   * Create affinity group - custom handler for nested response
   */
  async handleCreateAffinityGroup(args: CreateAffinityGroupArgs) {
    const result = await this.cloudStackClient.createAffinityGroup<CreateAffinityGroupResponse>(args);
    const group = result.createaffinitygroupresponse?.affinitygroup;

    return {
      content: [{
        type: 'text' as const,
        text: `Created affinity group "${args.name}".\n\nGroup ID: ${group?.id}\nType: ${args.type}\n${args.description ? `Description: ${args.description}\n` : ''}Domain: ${group?.domainid || 'Default'}\nAccount: ${group?.account || 'Default'}`
      }]
    };
  }
}
