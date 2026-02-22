/**
 * Template and ISO Handlers
 *
 * Uses the factory pattern for list and action handlers:
 * - Declarative field definitions for list ISO operation
 * - Action handler configs for delete/copy/attach/detach operations
 * - Custom handlers for register/update operations (nested responses)
 */

import type { CloudStackClient } from '../cloudstack-client.js';
import {
  createListHandler,
  createActionHandler,
  type FieldDefinition,
} from '../utils/index.js';
import type {
  RegisterTemplateArgs,
  UpdateTemplateArgs,
  RegisterISOArgs,
} from '../handler-types.js';
import type {
  RegisterTemplateResponse,
  UpdateTemplateResponse,
  RegisterISOResponse,
  ISO,
  TemplatePermission,
} from '../types/index.js';

export class TemplateHandlers {
  // Field definitions for list ISO handler
  private static readonly isoFields: FieldDefinition<ISO>[] = [
    { key: 'displaytext', label: 'Display Text' },
    { key: 'zonename', label: 'Zone' },
    { key: 'bootable', label: 'Bootable', format: (v: unknown) => v ? 'Yes' : 'No' },
    { key: 'ispublic', label: 'Public', format: (v: unknown) => v ? 'Yes' : 'No' },
    { key: 'size', label: 'Size', format: (v: unknown) => `${Math.round((Number(v) || 0) / 1024 / 1024 / 1024)}GB` },
  ];

  // Handler instances
  public readonly handleListIsos;
  public readonly handleListTemplatePermissions;
  public readonly handleDeleteTemplate;
  public readonly handleCopyTemplate;
  public readonly handleDeleteIso;
  public readonly handleAttachIso;
  public readonly handleDetachIso;
  public readonly handleExtractTemplate;
  public readonly handleUpdateTemplatePermissions;

  // Store client for custom handlers
  private readonly cloudStackClient: CloudStackClient;

  constructor(cloudStackClient: CloudStackClient) {
    this.cloudStackClient = cloudStackClient;

    // List handler using factory
    this.handleListIsos = createListHandler<ISO>(cloudStackClient, {
      command: 'listIsos',
      responseKey: 'listisosresponse',
      arrayKey: 'iso',
      itemName: 'ISO',
      titleField: 'name',
      idField: 'id',
      fields: TemplateHandlers.isoFields,
    });

    // Action handlers using factory
    this.handleDeleteTemplate = createActionHandler(cloudStackClient, {
      command: 'deleteTemplate',
      responseKey: 'deletetemplateresponse',
      actionVerb: 'Deleting',
      itemName: 'template',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) => `Deleting template ${args.id}${args.zoneid ? ` from zone ${args.zoneid}` : ' from all zones'}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleCopyTemplate = createActionHandler(cloudStackClient, {
      command: 'copyTemplate',
      responseKey: 'copytemplateresponse',
      actionVerb: 'Copying',
      itemName: 'template',
      requiredFields: ['id', 'sourcezoneid', 'destzoneid'],
      jobIdField: 'jobid',
      successMessage: (args, result) => `Copying template ${args.id} from zone ${args.sourcezoneid} to zone ${args.destzoneid}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleDeleteIso = createActionHandler(cloudStackClient, {
      command: 'deleteIso',
      responseKey: 'deleteisoresponse',
      actionVerb: 'Deleting',
      itemName: 'ISO',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) => `Deleting ISO ${args.id}${args.zoneid ? ` from zone ${args.zoneid}` : ' from all zones'}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleAttachIso = createActionHandler(cloudStackClient, {
      command: 'attachIso',
      responseKey: 'attachisoresponse',
      actionVerb: 'Attaching',
      itemName: 'ISO',
      requiredFields: ['id', 'virtualmachineid'],
      jobIdField: 'jobid',
      successMessage: (args, result) => `Attaching ISO ${args.id} to VM ${args.virtualmachineid}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleDetachIso = createActionHandler(cloudStackClient, {
      command: 'detachIso',
      responseKey: 'detachisoresponse',
      actionVerb: 'Detaching',
      itemName: 'ISO',
      requiredFields: ['virtualmachineid'],
      jobIdField: 'jobid',
      successMessage: (args, result) => `Detaching ISO from VM ${args.virtualmachineid}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleExtractTemplate = createActionHandler(cloudStackClient, {
      command: 'extractTemplate',
      responseKey: 'extracttemplateresponse',
      actionVerb: 'Extracting',
      itemName: 'template',
      requiredFields: ['id', 'mode'],
      jobIdField: 'jobid',
    });

    this.handleUpdateTemplatePermissions = createActionHandler(cloudStackClient, {
      command: 'updateTemplatePermissions',
      responseKey: 'updatetemplatepermissionsresponse',
      actionVerb: 'Updated permissions for',
      itemName: 'template',
      requiredFields: ['id'],
    });

    this.handleListTemplatePermissions = createListHandler<TemplatePermission>(cloudStackClient, {
      command: 'listTemplatePermissions',
      responseKey: 'listtemplatepermissionsresponse',
      arrayKey: 'templatepermission',
      itemName: 'template permission',
      titleField: 'id',
      idField: 'id',
      fields: [
        { key: 'id', label: 'ID' },
        { key: 'account', label: 'Account', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'domainid', label: 'Domain ID', format: (v: unknown) => v ? String(v) : 'N/A' },
      ],
    });
  }

  /**
   * Register template - custom handler for nested response
   */
  async handleRegisterTemplate(args: RegisterTemplateArgs) {
    const result = await this.cloudStackClient.registerTemplate<RegisterTemplateResponse>(args);
    const template = result.registertemplateresponse?.template?.[0];
    return {
      content: [{
        type: 'text' as const,
        text: `Registering template "${args.name}" from ${args.url}.\n\nTemplate ID: ${template?.id}\nZone: ${args.zoneid}\nHypervisor: ${args.hypervisor}\nFormat: ${args.format}`
      }]
    };
  }

  /**
   * Update template - custom handler for nested response
   */
  async handleUpdateTemplate(args: UpdateTemplateArgs) {
    const result = await this.cloudStackClient.updateTemplate<UpdateTemplateResponse>(args);
    const template = result.updatetemplateresponse?.template;
    return {
      content: [{
        type: 'text' as const,
        text: `Updated template ${args.id}.\n\nName: ${template?.name}\nDisplay Text: ${template?.displaytext}\nOS Type: ${template?.ostypename}`
      }]
    };
  }

  /**
   * Register ISO - custom handler for nested response
   */
  async handleRegisterIso(args: RegisterISOArgs) {
    const result = await this.cloudStackClient.registerIso<RegisterISOResponse>(args);
    const iso = result.registerisoresponse?.iso?.[0];
    return {
      content: [{
        type: 'text' as const,
        text: `Registering ISO "${args.name}" from ${args.url}.\n\nISO ID: ${iso?.id}\nZone: ${args.zoneid}\nBootable: ${args.bootable !== false}`
      }]
    };
  }
}
