/**
 * AutoScale Handlers
 *
 * Uses the factory pattern for list and action handlers:
 * - AutoScale Policies (create, update, delete, list)
 * - AutoScale VM Groups (create, update, delete, list, enable, disable)
 * - AutoScale VM Profiles (create, update, delete, list)
 * - Conditions (create, delete, list)
 * - Counters (create, delete, update, list)
 */

import type { CloudStackClient } from '../cloudstack-client.js';
import {
  createListHandler,
  createActionHandler,
  type FieldDefinition,
} from '../utils/index.js';
import type {
  AutoScalePolicy,
  AutoScaleVmGroup,
  AutoScaleVmProfile,
  AutoScaleCondition,
  AutoScaleCounter,
} from '../types/index.js';

export class AutoScaleHandlers {
  // Field definitions for AutoScale Policies
  private static readonly autoScalePolicyFields: FieldDefinition<AutoScalePolicy>[] = [
    { key: 'action', label: 'Action' },
    { key: 'duration', label: 'Duration' },
    { key: 'quiettime', label: 'Quiet Time', format: (v: unknown) => v !== undefined ? String(v) : 'N/A' },
    { key: 'conditionids', label: 'Condition IDs', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'account', label: 'Account', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'domain', label: 'Domain', format: (v: unknown) => v ? String(v) : 'N/A' },
  ];

  // Field definitions for AutoScale VM Groups
  private static readonly autoScaleVmGroupFields: FieldDefinition<AutoScaleVmGroup>[] = [
    { key: 'state', label: 'State' },
    { key: 'lbruleid', label: 'LB Rule ID' },
    { key: 'vmprofileid', label: 'VM Profile ID' },
    { key: 'minmembers', label: 'Min Members' },
    { key: 'maxmembers', label: 'Max Members' },
    { key: 'interval', label: 'Interval', format: (v: unknown) => v !== undefined ? String(v) : 'N/A' },
    { key: 'scaleuppolicies', label: 'Scale Up Policies', format: (v: unknown) => Array.isArray(v) ? String(v.length) : '0' },
    { key: 'scaledownpolicies', label: 'Scale Down Policies', format: (v: unknown) => Array.isArray(v) ? String(v.length) : '0' },
    { key: 'account', label: 'Account', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'domain', label: 'Domain', format: (v: unknown) => v ? String(v) : 'N/A' },
  ];

  // Field definitions for AutoScale VM Profiles
  private static readonly autoScaleVmProfileFields: FieldDefinition<AutoScaleVmProfile>[] = [
    { key: 'serviceofferingid', label: 'Service Offering ID' },
    { key: 'templateid', label: 'Template ID' },
    { key: 'zoneid', label: 'Zone ID' },
    { key: 'destroyvmgraceperiod', label: 'Destroy VM Grace Period', format: (v: unknown) => v !== undefined ? String(v) : 'N/A' },
    { key: 'otherdeployparams', label: 'Other Deploy Params', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'account', label: 'Account', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'domain', label: 'Domain', format: (v: unknown) => v ? String(v) : 'N/A' },
  ];

  // Field definitions for Conditions
  private static readonly conditionFields: FieldDefinition<AutoScaleCondition>[] = [
    { key: 'counterid', label: 'Counter ID' },
    { key: 'relationaloperator', label: 'Operator' },
    { key: 'threshold', label: 'Threshold' },
    { key: 'account', label: 'Account', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'domain', label: 'Domain', format: (v: unknown) => v ? String(v) : 'N/A' },
  ];

  // Field definitions for Counters
  private static readonly counterFields: FieldDefinition<AutoScaleCounter>[] = [
    { key: 'source', label: 'Source' },
    { key: 'value', label: 'Value' },
    { key: 'zoneid', label: 'Zone ID', format: (v: unknown) => v ? String(v) : 'N/A' },
  ];

  // Handler instances - AutoScale Policies
  public readonly handleListAutoScalePolicies;
  public readonly handleCreateAutoScalePolicy;
  public readonly handleUpdateAutoScalePolicy;
  public readonly handleDeleteAutoScalePolicy;

  // Handler instances - AutoScale VM Groups
  public readonly handleListAutoScaleVmGroups;
  public readonly handleCreateAutoScaleVmGroup;
  public readonly handleUpdateAutoScaleVmGroup;
  public readonly handleDeleteAutoScaleVmGroup;
  public readonly handleEnableAutoScaleVmGroup;
  public readonly handleDisableAutoScaleVmGroup;

  // Handler instances - AutoScale VM Profiles
  public readonly handleListAutoScaleVmProfiles;
  public readonly handleCreateAutoScaleVmProfile;
  public readonly handleUpdateAutoScaleVmProfile;
  public readonly handleDeleteAutoScaleVmProfile;

  // Handler instances - Conditions
  public readonly handleListConditions;
  public readonly handleCreateCondition;
  public readonly handleDeleteCondition;

  // Handler instances - Counters
  public readonly handleListCounters;
  public readonly handleCreateCounter;
  public readonly handleDeleteCounter;
  public readonly handleUpdateCounter;

  constructor(cloudStackClient: CloudStackClient) {
    // --- AutoScale Policies ---
    this.handleListAutoScalePolicies = createListHandler<AutoScalePolicy>(cloudStackClient, {
      command: 'listAutoScalePolicies',
      responseKey: 'listautoscalepoliciesresponse',
      arrayKey: 'autoscalepolicy',
      itemName: 'autoscale policy',
      itemNamePlural: 'autoscale policies',
      titleField: 'action',
      idField: 'id',
      fields: AutoScaleHandlers.autoScalePolicyFields,
    });

    this.handleCreateAutoScalePolicy = createActionHandler(cloudStackClient, {
      command: 'createAutoScalePolicy',
      responseKey: 'createautoscalepolicyresponse',
      actionVerb: 'Creating',
      itemName: 'autoscale policy',
      requiredFields: ['action', 'conditionids', 'duration'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Creating autoscale policy with action "${args.action}". Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleUpdateAutoScalePolicy = createActionHandler(cloudStackClient, {
      command: 'updateAutoScalePolicy',
      responseKey: 'updateautoscalepolicyresponse',
      actionVerb: 'Updating',
      itemName: 'autoscale policy',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Updating autoscale policy ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleDeleteAutoScalePolicy = createActionHandler(cloudStackClient, {
      command: 'deleteAutoScalePolicy',
      responseKey: 'deleteautoscalepolicyresponse',
      actionVerb: 'Deleting',
      itemName: 'autoscale policy',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Deleting autoscale policy ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    // --- AutoScale VM Groups ---
    this.handleListAutoScaleVmGroups = createListHandler<AutoScaleVmGroup>(cloudStackClient, {
      command: 'listAutoScaleVmGroups',
      responseKey: 'listautoscalevmgroupsresponse',
      arrayKey: 'autoscalevmgroup',
      itemName: 'autoscale VM group',
      titleField: 'lbruleid',
      idField: 'id',
      fields: AutoScaleHandlers.autoScaleVmGroupFields,
    });

    this.handleCreateAutoScaleVmGroup = createActionHandler(cloudStackClient, {
      command: 'createAutoScaleVmGroup',
      responseKey: 'createautoscalevmgroupresponse',
      actionVerb: 'Creating',
      itemName: 'autoscale VM group',
      requiredFields: ['lbruleid', 'minmembers', 'maxmembers', 'scaledownpolicyids', 'scaleuppolicyids', 'vmprofileid'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Creating autoscale VM group for LB rule ${args.lbruleid}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleUpdateAutoScaleVmGroup = createActionHandler(cloudStackClient, {
      command: 'updateAutoScaleVmGroup',
      responseKey: 'updateautoscalevmgroupresponse',
      actionVerb: 'Updating',
      itemName: 'autoscale VM group',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Updating autoscale VM group ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleDeleteAutoScaleVmGroup = createActionHandler(cloudStackClient, {
      command: 'deleteAutoScaleVmGroup',
      responseKey: 'deleteautoscalevmgroupresponse',
      actionVerb: 'Deleting',
      itemName: 'autoscale VM group',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Deleting autoscale VM group ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleEnableAutoScaleVmGroup = createActionHandler(cloudStackClient, {
      command: 'enableAutoScaleVmGroup',
      responseKey: 'enableautoscalevmgroupresponse',
      actionVerb: 'Enabling',
      itemName: 'autoscale VM group',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Enabling autoscale VM group ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleDisableAutoScaleVmGroup = createActionHandler(cloudStackClient, {
      command: 'disableAutoScaleVmGroup',
      responseKey: 'disableautoscalevmgroupresponse',
      actionVerb: 'Disabling',
      itemName: 'autoscale VM group',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Disabling autoscale VM group ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    // --- AutoScale VM Profiles ---
    this.handleListAutoScaleVmProfiles = createListHandler<AutoScaleVmProfile>(cloudStackClient, {
      command: 'listAutoScaleVmProfiles',
      responseKey: 'listautoscalevmprofilesresponse',
      arrayKey: 'autoscalevmprofile',
      itemName: 'autoscale VM profile',
      titleField: 'templateid',
      idField: 'id',
      fields: AutoScaleHandlers.autoScaleVmProfileFields,
    });

    this.handleCreateAutoScaleVmProfile = createActionHandler(cloudStackClient, {
      command: 'createAutoScaleVmProfile',
      responseKey: 'createautoscalevmprofileresponse',
      actionVerb: 'Creating',
      itemName: 'autoscale VM profile',
      requiredFields: ['serviceofferingid', 'templateid', 'zoneid'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Creating autoscale VM profile with template ${args.templateid}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleUpdateAutoScaleVmProfile = createActionHandler(cloudStackClient, {
      command: 'updateAutoScaleVmProfile',
      responseKey: 'updateautoscalevmprofileresponse',
      actionVerb: 'Updating',
      itemName: 'autoscale VM profile',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Updating autoscale VM profile ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleDeleteAutoScaleVmProfile = createActionHandler(cloudStackClient, {
      command: 'deleteAutoScaleVmProfile',
      responseKey: 'deleteautoscalevmprofileresponse',
      actionVerb: 'Deleting',
      itemName: 'autoscale VM profile',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Deleting autoscale VM profile ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    // --- Conditions ---
    this.handleListConditions = createListHandler<AutoScaleCondition>(cloudStackClient, {
      command: 'listConditions',
      responseKey: 'listconditionsresponse',
      arrayKey: 'condition',
      itemName: 'condition',
      titleField: 'relationaloperator',
      idField: 'id',
      fields: AutoScaleHandlers.conditionFields,
    });

    this.handleCreateCondition = createActionHandler(cloudStackClient, {
      command: 'createCondition',
      responseKey: 'createconditionresponse',
      actionVerb: 'Creating',
      itemName: 'condition',
      requiredFields: ['counterid', 'relationaloperator', 'threshold'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Creating condition for counter ${args.counterid} (${args.relationaloperator} ${args.threshold}). Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleDeleteCondition = createActionHandler(cloudStackClient, {
      command: 'deleteCondition',
      responseKey: 'deleteconditionresponse',
      actionVerb: 'Deleting',
      itemName: 'condition',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Deleting condition ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    // --- Counters ---
    this.handleListCounters = createListHandler<AutoScaleCounter>(cloudStackClient, {
      command: 'listCounters',
      responseKey: 'listcountersresponse',
      arrayKey: 'counter',
      itemName: 'counter',
      titleField: 'name',
      idField: 'id',
      fields: AutoScaleHandlers.counterFields,
    });

    this.handleCreateCounter = createActionHandler(cloudStackClient, {
      command: 'createCounter',
      responseKey: 'createcounterresponse',
      actionVerb: 'Creating',
      itemName: 'counter',
      requiredFields: ['name', 'source', 'value'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Creating counter "${args.name}" (source: ${args.source}). Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleDeleteCounter = createActionHandler(cloudStackClient, {
      command: 'deleteCounter',
      responseKey: 'deletecounterresponse',
      actionVerb: 'Deleting',
      itemName: 'counter',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Deleting counter ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleUpdateCounter = createActionHandler(cloudStackClient, {
      command: 'updateCounter',
      responseKey: 'updatecounterresponse',
      actionVerb: 'Updating',
      itemName: 'counter',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Updating counter ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });
  }
}
