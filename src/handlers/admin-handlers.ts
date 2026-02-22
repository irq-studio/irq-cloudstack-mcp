/**
 * Admin Handlers
 *
 * Uses the factory pattern to eliminate boilerplate code:
 * - Declarative field definitions specify what to display
 * - Safe value handling with automatic fallbacks
 * - Handler factory creates the repetitive logic once
 * - ~5-10 lines per handler config vs ~30 lines of manual code
 */

import type { CloudStackClient } from '../cloudstack-client.js';
import { VERSION } from '../version.js';
import {
  createListHandler,
  createActionHandler,
  formatBytes,
  type FieldDefinition,
} from '../utils/index.js';
import type {
  Zone,
  Template,
  Host,
  Cluster,
  StoragePool,
  ServiceOffering,
  Account,
  User,
  Domain,
  SystemVM,
  Pod,
  Configuration,
  ListCapabilitiesResponse,
} from '../types/index.js';

/**
 * Refactored Admin Handlers using factory pattern
 */
export class AdminHandlers {
  // Declarative field definitions - no more string concatenation!
  private static readonly zoneFields: FieldDefinition<Zone>[] = [
    { key: 'description', label: 'Description' },
    { key: 'allocationstate', label: 'Allocation State' },
    { key: 'networktype', label: 'Network Type' },
    { key: 'localstorageenabled', label: 'Local Storage', format: (v: unknown) => (v ? 'Enabled' : 'Disabled') },
    { key: 'securitygroupsenabled', label: 'Security Groups', format: (v: unknown) => (v ? 'Enabled' : 'Disabled') },
  ];

  private static readonly templateFields: FieldDefinition<Template>[] = [
    { key: 'displaytext', label: 'Display Text' },
    { key: 'ostypename', label: 'OS Type' },
    { key: 'size', label: 'Size', format: (v: unknown) => formatBytes(v as number) },
    { key: 'isready', label: 'Ready', format: (v: unknown) => (v ? 'Yes' : 'No') },
    { key: 'ispublic', label: 'Public', format: (v: unknown) => (v ? 'Yes' : 'No') },
    { key: 'isfeatured', label: 'Featured', format: (v: unknown) => (v ? 'Yes' : 'No') },
    { key: 'created', label: 'Created' },
  ];

  private static readonly hostFields: FieldDefinition<Host>[] = [
    { key: 'type', label: 'Type' },
    { key: 'state', label: 'State' },
    { key: 'ipaddress', label: 'IP' },
    { key: 'zonename', label: 'Zone' },
    { key: 'clustername', label: 'Cluster' },
    { key: 'hypervisor', label: 'Hypervisor' },
    { key: 'cpunumber', label: 'CPUs', format: (v: unknown, item: Host) => `${v} @ ${item.cpuspeed}MHz` },
    { key: 'memorytotal', label: 'Memory', format: (v: unknown, item: Host) => `${formatBytes(item.memoryused as number)} / ${formatBytes(v as number)}` },
  ];

  private static readonly clusterFields: FieldDefinition<Cluster>[] = [
    { key: 'zonename', label: 'Zone' },
    { key: 'hypervisortype', label: 'Hypervisor' },
    { key: 'clustertype', label: 'Type' },
    { key: 'allocationstate', label: 'Allocation State' },
    { key: 'managedstate', label: 'Managed State' },
  ];

  private static readonly storagePoolFields: FieldDefinition<StoragePool>[] = [
    { key: 'type', label: 'Type' },
    { key: 'state', label: 'State' },
    { key: 'zonename', label: 'Zone' },
    { key: 'clustername', label: 'Cluster' },
    { key: 'ipaddress', label: 'IP' },
    { key: 'path', label: 'Path' },
    { key: 'disksizeused', label: 'Usage', format: (v: unknown, item: StoragePool) => `${formatBytes(v as number)} / ${formatBytes(item.disksizetotal as number)}` },
    { key: 'capacitybytes', label: 'Capacity', format: (v: unknown) => v ? formatBytes(v as number) : undefined, skipIfUndefined: true },
  ];

  private static readonly serviceOfferingFields: FieldDefinition<ServiceOffering>[] = [
    { key: 'displaytext', label: 'Display Text' },
    { key: 'cpunumber', label: 'CPUs', format: (v: unknown, item: ServiceOffering) => `${v} @ ${item.cpuspeed}MHz` },
    { key: 'memory', label: 'Memory', format: (v: unknown) => `${v}MB` },
    { key: 'storagetype', label: 'Storage Type' },
    { key: 'iscustomized', label: 'Customized', format: (v: unknown) => (v ? 'Yes' : 'No') },
    { key: 'issystem', label: 'System', format: (v: unknown) => (v ? 'Yes' : 'No') },
    { key: 'created', label: 'Created' },
  ];

  private static readonly accountFields: FieldDefinition<Account>[] = [
    { key: 'accounttype', label: 'Type', format: (v: unknown) => {
      const types: Record<number, string> = { 0: 'User', 1: 'Admin', 2: 'Domain Admin' };
      return types[v as number] || String(v);
    }},
    { key: 'domain', label: 'Domain' },
    { key: 'state', label: 'State' },
    { key: 'receivedbytes', label: 'Received', format: (v: unknown) => formatBytes(v as number) },
    { key: 'sentbytes', label: 'Sent', format: (v: unknown) => formatBytes(v as number) },
  ];

  private static readonly userFields: FieldDefinition<User>[] = [
    { key: (item: User) => `${item.firstname} ${item.lastname}`, label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'state', label: 'State' },
    { key: 'account', label: 'Account' },
    { key: 'domain', label: 'Domain' },
    { key: 'created', label: 'Created' },
  ];

  private static readonly domainFields: FieldDefinition<Domain>[] = [
    { key: 'path', label: 'Path' },
    { key: 'level', label: 'Level' },
    { key: 'parentdomainname', label: 'Parent', format: (v: unknown) => v ? String(v) : 'None' },
    { key: 'haschild', label: 'Has Children', format: (v: unknown) => (v ? 'Yes' : 'No') },
    { key: 'state', label: 'State' },
  ];

  private static readonly systemVmFields: FieldDefinition<SystemVM>[] = [
    { key: 'systemvmtype', label: 'Type' },
    { key: 'state', label: 'State' },
    { key: 'zonename', label: 'Zone' },
    { key: 'hostname', label: 'Host' },
    { key: 'publicip', label: 'Public IP' },
    { key: 'privateip', label: 'Private IP' },
    { key: 'linklocalip', label: 'Link Local IP' },
  ];

  // Handler instances created via factory - one line each!
  public readonly handleListZones;
  public readonly handleListTemplates;
  public readonly handleListHosts;
  public readonly handleListClusters;
  public readonly handleListStoragePools;
  public readonly handleListServiceOfferings;
  public readonly handleListAccounts;
  public readonly handleListUsers;
  public readonly handleListDomains;
  public readonly handleListSystemVms;
  public readonly handleListPods;
  public readonly handleListConfigurations;
  public readonly handleCreateZone;
  public readonly handleUpdateZone;
  public readonly handleDeleteZone;
  public readonly handleCreatePod;
  public readonly handleUpdatePod;
  public readonly handleDeletePod;
  public readonly handleAddCluster;
  public readonly handleUpdateCluster;
  public readonly handleDeleteCluster;
  public readonly handleAddHost;
  public readonly handleUpdateHost;
  public readonly handleDeleteHost;
  public readonly handleReconnectHost;
  public readonly handlePrepareHostForMaintenance;
  public readonly handleCancelHostMaintenance;
  public readonly handleCreateDomain;
  public readonly handleUpdateDomain;
  public readonly handleDeleteDomain;
  public readonly handleCreateUser;
  public readonly handleUpdateUser;
  public readonly handleDeleteUser;
  public readonly handleDisableUser;
  public readonly handleEnableUser;
  public readonly handleUpdateConfiguration;
  public readonly handleStartSystemVm;
  public readonly handleStopSystemVm;
  public readonly handleRebootSystemVm;
  public readonly handleDestroySystemVm;
  public readonly handleMigrateSystemVm;
  public readonly handleCreateConsoleEndpoint;

  // Store client for custom handlers
  private readonly cloudStackClient: CloudStackClient;

  constructor(cloudStackClient: CloudStackClient) {
    this.cloudStackClient = cloudStackClient;

    // Create handlers using factory - eliminates all repetitive code
    this.handleListZones = createListHandler<Zone>(cloudStackClient, {
      command: 'listZones',
      responseKey: 'listzonesresponse',
      arrayKey: 'zone',
      itemName: 'zone',
      titleField: 'name',
      idField: 'id',
      fields: AdminHandlers.zoneFields,
    });

    this.handleListTemplates = createListHandler<Template>(cloudStackClient, {
      command: 'listTemplates',
      responseKey: 'listtemplatesresponse',
      arrayKey: 'template',
      itemName: 'template',
      titleField: 'name',
      idField: 'id',
      fields: AdminHandlers.templateFields,
      defaultArgs: { templatefilter: 'all' },
    });

    this.handleListHosts = createListHandler<Host>(cloudStackClient, {
      command: 'listHosts',
      responseKey: 'listhostsresponse',
      arrayKey: 'host',
      itemName: 'host',
      titleField: 'name',
      idField: 'id',
      fields: AdminHandlers.hostFields,
    });

    this.handleListClusters = createListHandler<Cluster>(cloudStackClient, {
      command: 'listClusters',
      responseKey: 'listclustersresponse',
      arrayKey: 'cluster',
      itemName: 'cluster',
      titleField: 'name',
      idField: 'id',
      fields: AdminHandlers.clusterFields,
    });

    this.handleListStoragePools = createListHandler<StoragePool>(cloudStackClient, {
      command: 'listStoragePools',
      responseKey: 'liststoragepoolsresponse',
      arrayKey: 'storagepool',
      itemName: 'storage pool',
      titleField: 'name',
      idField: 'id',
      fields: AdminHandlers.storagePoolFields,
    });

    this.handleListServiceOfferings = createListHandler<ServiceOffering>(cloudStackClient, {
      command: 'listServiceOfferings',
      responseKey: 'listserviceofferingsresponse',
      arrayKey: 'serviceoffering',
      itemName: 'service offering',
      titleField: 'name',
      idField: 'id',
      fields: AdminHandlers.serviceOfferingFields,
    });

    this.handleListAccounts = createListHandler<Account>(cloudStackClient, {
      command: 'listAccounts',
      responseKey: 'listaccountsresponse',
      arrayKey: 'account',
      itemName: 'account',
      titleField: 'name',
      idField: 'id',
      fields: AdminHandlers.accountFields,
    });

    this.handleListUsers = createListHandler<User>(cloudStackClient, {
      command: 'listUsers',
      responseKey: 'listusersresponse',
      arrayKey: 'user',
      itemName: 'user',
      titleField: 'username',
      idField: 'id',
      fields: AdminHandlers.userFields,
    });

    this.handleListDomains = createListHandler<Domain>(cloudStackClient, {
      command: 'listDomains',
      responseKey: 'listdomainsresponse',
      arrayKey: 'domain',
      itemName: 'domain',
      titleField: 'name',
      idField: 'id',
      fields: AdminHandlers.domainFields,
    });

    this.handleListSystemVms = createListHandler<SystemVM>(cloudStackClient, {
      command: 'listSystemVms',
      responseKey: 'listsystemvmsresponse',
      arrayKey: 'systemvm',
      itemName: 'system VM',
      titleField: 'name',
      idField: 'id',
      fields: AdminHandlers.systemVmFields,
    });

    this.handleListPods = createListHandler<Pod>(cloudStackClient, {
      command: 'listPods',
      responseKey: 'listpodsresponse',
      arrayKey: 'pod',
      itemName: 'pod',
      titleField: 'name',
      idField: 'id',
      fields: [
        { key: 'name', label: 'Name' },
        { key: 'zonename', label: 'Zone', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'gateway', label: 'Gateway', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'netmask', label: 'Netmask', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'allocationstate', label: 'Allocation State', format: (v: unknown) => v ? String(v) : 'N/A' },
      ],
    });

    this.handleListConfigurations = createListHandler<Configuration>(cloudStackClient, {
      command: 'listConfigurations',
      responseKey: 'listconfigurationsresponse',
      arrayKey: 'configuration',
      itemName: 'configuration',
      titleField: 'name',
      idField: 'name',
      fields: [
        { key: 'name', label: 'Name' },
        { key: 'value', label: 'Value', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'category', label: 'Category', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'description', label: 'Description', format: (v: unknown) => v ? String(v) : 'N/A' },
      ],
    });

    // Zone CRUD
    this.handleCreateZone = createActionHandler(cloudStackClient, {
      command: 'createZone',
      responseKey: 'createzoneresponse',
      actionVerb: 'Created',
      itemName: 'zone',
      requiredFields: ['name', 'dns1', 'internaldns1', 'networktype'],
      resultIdField: 'id',
    });

    this.handleUpdateZone = createActionHandler(cloudStackClient, {
      command: 'updateZone',
      responseKey: 'updatezoneresponse',
      actionVerb: 'Updated',
      itemName: 'zone',
      requiredFields: ['id'],
    });

    this.handleDeleteZone = createActionHandler(cloudStackClient, {
      command: 'deleteZone',
      responseKey: 'deletezoneresponse',
      actionVerb: 'Deleted',
      itemName: 'zone',
      requiredFields: ['id'],
    });

    // Pod CRUD
    this.handleCreatePod = createActionHandler(cloudStackClient, {
      command: 'createPod',
      responseKey: 'createpodresponse',
      actionVerb: 'Created',
      itemName: 'pod',
      requiredFields: ['name', 'zoneid', 'gateway', 'netmask', 'startip'],
      resultIdField: 'id',
    });

    this.handleUpdatePod = createActionHandler(cloudStackClient, {
      command: 'updatePod',
      responseKey: 'updatepodresponse',
      actionVerb: 'Updated',
      itemName: 'pod',
      requiredFields: ['id'],
    });

    this.handleDeletePod = createActionHandler(cloudStackClient, {
      command: 'deletePod',
      responseKey: 'deletepodresponse',
      actionVerb: 'Deleted',
      itemName: 'pod',
      requiredFields: ['id'],
    });

    // Cluster CRUD
    this.handleAddCluster = createActionHandler(cloudStackClient, {
      command: 'addCluster',
      responseKey: 'addclusterresponse',
      actionVerb: 'Added',
      itemName: 'cluster',
      requiredFields: ['clustername', 'clustertype', 'hypervisor', 'zoneid', 'podid'],
      resultIdField: 'id',
    });

    this.handleUpdateCluster = createActionHandler(cloudStackClient, {
      command: 'updateCluster',
      responseKey: 'updateclusterresponse',
      actionVerb: 'Updated',
      itemName: 'cluster',
      requiredFields: ['id'],
    });

    this.handleDeleteCluster = createActionHandler(cloudStackClient, {
      command: 'deleteCluster',
      responseKey: 'deleteclusterresponse',
      actionVerb: 'Deleted',
      itemName: 'cluster',
      requiredFields: ['id'],
    });

    // Host CRUD
    this.handleAddHost = createActionHandler(cloudStackClient, {
      command: 'addHost',
      responseKey: 'addhostresponse',
      actionVerb: 'Added',
      itemName: 'host',
      requiredFields: ['zoneid', 'podid', 'clusterid', 'hypervisor', 'url'],
      resultIdField: 'id',
    });

    this.handleUpdateHost = createActionHandler(cloudStackClient, {
      command: 'updateHost',
      responseKey: 'updatehostresponse',
      actionVerb: 'Updated',
      itemName: 'host',
      requiredFields: ['id'],
    });

    this.handleDeleteHost = createActionHandler(cloudStackClient, {
      command: 'deleteHost',
      responseKey: 'deletehostresponse',
      actionVerb: 'Deleted',
      itemName: 'host',
      requiredFields: ['id'],
    });

    this.handleReconnectHost = createActionHandler(cloudStackClient, {
      command: 'reconnectHost',
      responseKey: 'reconnecthostresponse',
      actionVerb: 'Reconnecting',
      itemName: 'host',
      requiredFields: ['id'],
      jobIdField: 'jobid',
    });

    this.handlePrepareHostForMaintenance = createActionHandler(cloudStackClient, {
      command: 'prepareHostForMaintenance',
      responseKey: 'preparehostformaintenanceresponse',
      actionVerb: 'Preparing for maintenance',
      itemName: 'host',
      requiredFields: ['id'],
      jobIdField: 'jobid',
    });

    this.handleCancelHostMaintenance = createActionHandler(cloudStackClient, {
      command: 'cancelHostMaintenance',
      responseKey: 'cancelhostmaintenanceresponse',
      actionVerb: 'Cancelling maintenance for',
      itemName: 'host',
      requiredFields: ['id'],
      jobIdField: 'jobid',
    });

    // Domain CRUD
    this.handleCreateDomain = createActionHandler(cloudStackClient, {
      command: 'createDomain',
      responseKey: 'createdomainresponse',
      actionVerb: 'Created',
      itemName: 'domain',
      requiredFields: ['name'],
      resultIdField: 'id',
    });

    this.handleUpdateDomain = createActionHandler(cloudStackClient, {
      command: 'updateDomain',
      responseKey: 'updatedomainresponse',
      actionVerb: 'Updated',
      itemName: 'domain',
      requiredFields: ['id'],
    });

    this.handleDeleteDomain = createActionHandler(cloudStackClient, {
      command: 'deleteDomain',
      responseKey: 'deletedomainresponse',
      actionVerb: 'Deleting',
      itemName: 'domain',
      requiredFields: ['id'],
      jobIdField: 'jobid',
    });

    // User CRUD
    this.handleCreateUser = createActionHandler(cloudStackClient, {
      command: 'createUser',
      responseKey: 'createuserresponse',
      actionVerb: 'Created',
      itemName: 'user',
      requiredFields: ['username', 'password', 'email', 'firstname', 'lastname', 'account'],
      resultIdField: 'id',
    });

    this.handleUpdateUser = createActionHandler(cloudStackClient, {
      command: 'updateUser',
      responseKey: 'updateuserresponse',
      actionVerb: 'Updated',
      itemName: 'user',
      requiredFields: ['id'],
    });

    this.handleDeleteUser = createActionHandler(cloudStackClient, {
      command: 'deleteUser',
      responseKey: 'deleteuserresponse',
      actionVerb: 'Deleted',
      itemName: 'user',
      requiredFields: ['id'],
    });

    this.handleDisableUser = createActionHandler(cloudStackClient, {
      command: 'disableUser',
      responseKey: 'disableuserresponse',
      actionVerb: 'Disabling',
      itemName: 'user',
      requiredFields: ['id'],
      jobIdField: 'jobid',
    });

    this.handleEnableUser = createActionHandler(cloudStackClient, {
      command: 'enableUser',
      responseKey: 'enableuserresponse',
      actionVerb: 'Enabled',
      itemName: 'user',
      requiredFields: ['id'],
    });

    // Configuration
    this.handleUpdateConfiguration = createActionHandler(cloudStackClient, {
      command: 'updateConfiguration',
      responseKey: 'updateconfigurationresponse',
      actionVerb: 'Updated',
      itemName: 'configuration',
      requiredFields: ['name'],
    });

    // System VM operations
    this.handleStartSystemVm = createActionHandler(cloudStackClient, {
      command: 'startSystemVm',
      responseKey: 'startsystemvmresponse',
      actionVerb: 'Starting',
      itemName: 'system VM',
      requiredFields: ['id'],
      jobIdField: 'jobid',
    });

    this.handleStopSystemVm = createActionHandler(cloudStackClient, {
      command: 'stopSystemVm',
      responseKey: 'stopsystemvmresponse',
      actionVerb: 'Stopping',
      itemName: 'system VM',
      requiredFields: ['id'],
      jobIdField: 'jobid',
    });

    this.handleRebootSystemVm = createActionHandler(cloudStackClient, {
      command: 'rebootSystemVm',
      responseKey: 'rebootsystemvmresponse',
      actionVerb: 'Rebooting',
      itemName: 'system VM',
      requiredFields: ['id'],
      jobIdField: 'jobid',
    });

    this.handleDestroySystemVm = createActionHandler(cloudStackClient, {
      command: 'destroySystemVm',
      responseKey: 'destroysystemvmresponse',
      actionVerb: 'Destroying',
      itemName: 'system VM',
      requiredFields: ['id'],
      jobIdField: 'jobid',
    });

    this.handleMigrateSystemVm = createActionHandler(cloudStackClient, {
      command: 'migrateSystemVm',
      responseKey: 'migratesystemvmresponse',
      actionVerb: 'Migrating',
      itemName: 'system VM',
      requiredFields: ['virtualmachineid', 'hostid'],
      jobIdField: 'jobid',
    });

    this.handleCreateConsoleEndpoint = createActionHandler(cloudStackClient, {
      command: 'createConsoleEndpoint',
      responseKey: 'createconsoleendpointresponse',
      actionVerb: 'Created',
      itemName: 'console endpoint',
      requiredFields: ['virtualmachineid'],
    });
  }

  /**
   * Get server version - this is a custom handler (not a list)
   * so we keep it as-is
   */
  async handleGetServerVersion() {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            server_name: 'irq-cloudstack-mcp',
            server_version: VERSION,
            mcp_sdk_version: '^1.26.0',
            description: 'Model Context Protocol server for Apache CloudStack infrastructure management',
            node_version: process.version,
            platform: process.platform,
            arch: process.arch,
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Get CloudStack capabilities - custom handler with complex formatting
   */
  async handleGetCloudStackCapabilities() {
    const result = await this.cloudStackClient.listCapabilities<ListCapabilitiesResponse>();
    const capability = result.listcapabilitiesresponse?.capability;

    if (!capability) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'Unable to retrieve CloudStack capabilities. The API may not be accessible or the response format is unexpected.',
          },
        ],
      };
    }

    // Format the capabilities in a readable way
    const features = {
      version: capability.cloudstackversion || 'Unknown',
      security_groups_enabled: capability.securitygroupsenabled ?? false,
      kubernetes_enabled: capability.kubernetesserviceenabled ?? false,
      kubernetes_experimental: capability.kubernetesclusterexperimentalfeaturesenabled ?? false,
      kvm_snapshots_enabled: capability.kvmsnapshotenabled ?? false,
      dynamic_roles_enabled: capability.dynamicrolesenabled ?? false,
      user_public_templates: capability.userpublictemplateenabled ?? false,
      project_invite_required: capability.projectinviterequired ?? false,
      allow_user_create_projects: capability.allowusercreateprojects ?? false,
      allow_user_view_destroyed_vm: capability.allowuserviewdestroyedvm ?? false,
      allow_user_expunge_recover_vm: capability.allowuserexpungerecovervm ?? false,
      firewall_rules_ui_enabled: capability.firewallrulesuisenabled ?? false,
      elb_support: capability.supportELB || 'none',
      region_secondary_enabled: capability.regionsecondaryenabled ?? false,
      custom_disk_offering: {
        min_size_gb: capability.customdiskofferingminsize,
        max_size_gb: capability.customdiskofferingmaxsize,
      },
      api_limits: {
        interval_seconds: capability.apilimitinterval,
        max_requests: capability.apilimitmax,
      },
      default_ui_page_size: capability.defaultuipagesize,
    };

    return {
      content: [
        {
          type: 'text' as const,
          text: `CloudStack Capabilities:\n\nVersion: ${features.version}\n\nFeatures:\n• Security Groups: ${features.security_groups_enabled ? 'Enabled' : 'Disabled'}\n• Kubernetes Service: ${features.kubernetes_enabled ? 'Enabled' : 'Disabled'}\n• Kubernetes Experimental: ${features.kubernetes_experimental ? 'Enabled' : 'Disabled'}\n• KVM Snapshots: ${features.kvm_snapshots_enabled ? 'Enabled' : 'Disabled'}\n• Dynamic Roles: ${features.dynamic_roles_enabled ? 'Enabled' : 'Disabled'}\n• User Public Templates: ${features.user_public_templates ? 'Enabled' : 'Disabled'}\n• ELB Support: ${features.elb_support}\n\nUser Permissions:\n• Create Projects: ${features.allow_user_create_projects ? 'Allowed' : 'Not Allowed'}\n• View Destroyed VMs: ${features.allow_user_view_destroyed_vm ? 'Allowed' : 'Not Allowed'}\n• Expunge/Recover VMs: ${features.allow_user_expunge_recover_vm ? 'Allowed' : 'Not Allowed'}\n• Project Invite Required: ${features.project_invite_required ? 'Yes' : 'No'}\n\nLimits:\n• Custom Disk Size: ${features.custom_disk_offering.min_size_gb || 'N/A'} - ${features.custom_disk_offering.max_size_gb || 'N/A'} GB\n• API Rate Limit: ${features.api_limits.max_requests || 'Unlimited'} requests per ${features.api_limits.interval_seconds || 'N/A'} seconds\n\nRaw Data:\n${JSON.stringify(capability, null, 2)}`,
        },
      ],
    };
  }
}
