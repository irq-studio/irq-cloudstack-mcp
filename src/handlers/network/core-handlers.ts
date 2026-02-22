/**
 * Network Core Handlers
 *
 * Uses the factory pattern for list and action handlers:
 * - Declarative field definitions for list operations
 * - Action handler configs for create/delete operations
 * - Custom handlers for operations with special output requirements
 */

import type { CloudStackClient } from '../../cloudstack-client.js';
import {
  createListHandler,
  createActionHandler,
  type FieldDefinition,
} from '../../utils/index.js';
import type {
  Network,
  PublicIpAddress,
  VPC,
  NetworkOffering,
  VpcOffering,
  NetworkService,
  NetworkServiceProvider,
} from '../../types/index.js';

export class NetworkCoreHandlers {
  // Field definitions for list handlers
  private static readonly networkFields: FieldDefinition<Network>[] = [
    { key: 'displaytext', label: 'Display Text' },
    { key: 'type', label: 'Type' },
    { key: 'state', label: 'State' },
    { key: 'zonename', label: 'Zone' },
    { key: 'cidr', label: 'CIDR' },
    { key: 'gateway', label: 'Gateway' },
    { key: 'netmask', label: 'Netmask' },
    { key: 'vlan', label: 'VLAN', format: (v: unknown) => v ? String(v) : 'N/A' },
  ];

  private static readonly publicIpFields: FieldDefinition<PublicIpAddress>[] = [
    { key: 'state', label: 'State' },
    { key: 'zonename', label: 'Zone' },
    { key: 'allocated', label: 'Allocated' },
    { key: 'issourcenat', label: 'Source NAT', format: (v: unknown) => v ? 'Yes' : 'No' },
    { key: 'isstaticnat', label: 'Static NAT', format: (v: unknown) => v ? 'Yes' : 'No' },
    { key: 'virtualmachinename', label: 'VM', format: (v: unknown) => v ? String(v) : 'Not assigned' },
  ];

  private static readonly vpcFields: FieldDefinition<VPC>[] = [
    { key: 'cidr', label: 'CIDR' },
    { key: 'zonename', label: 'Zone' },
    { key: 'state', label: 'State' },
    { key: 'networkcount', label: 'Network Count', format: (v: unknown) => String(v ?? 0) },
  ];

  private static readonly networkOfferingFields: FieldDefinition<NetworkOffering>[] = [
    { key: 'displaytext', label: 'Display Text' },
    { key: 'state', label: 'State' },
    { key: 'isdefault', label: 'Default', format: (v: unknown) => v ? 'Yes' : 'No' },
    { key: 'traffictype', label: 'Traffic Type' },
  ];

  // Handler instances
  public readonly handleListNetworks;
  public readonly handleListPublicIpAddresses;
  public readonly handleListVPCs;
  public readonly handleListNetworkOfferings;
  public readonly handleListVpcOfferings;
  public readonly handleListSupportedNetworkServices;
  public readonly handleListNetworkServiceProviders;
  public readonly handleCreateNetwork;
  public readonly handleDeleteNetwork;
  public readonly handleAssociateIpAddress;
  public readonly handleDisassociateIpAddress;
  public readonly handleDeleteVPC;
  public readonly handleUpdateNetwork;
  public readonly handleRestartNetwork;
  public readonly handleUpdateVpc;
  public readonly handleCreateVpcOffering;
  public readonly handleDeleteVpcOffering;
  public readonly handleUpdateVpcOffering;

  // Store client for custom handlers
  private readonly cloudStackClient: CloudStackClient;

  constructor(cloudStackClient: CloudStackClient) {
    this.cloudStackClient = cloudStackClient;

    // List handlers using factory
    this.handleListNetworks = createListHandler<Network>(cloudStackClient, {
      command: 'listNetworks',
      responseKey: 'listnetworksresponse',
      arrayKey: 'network',
      itemName: 'network',
      titleField: 'name',
      idField: 'id',
      fields: NetworkCoreHandlers.networkFields,
    });

    this.handleListPublicIpAddresses = createListHandler<PublicIpAddress>(cloudStackClient, {
      command: 'listPublicIpAddresses',
      responseKey: 'listpublicipaddressesresponse',
      arrayKey: 'publicipaddress',
      itemName: 'public IP address',
      titleField: 'ipaddress',
      idField: 'id',
      fields: NetworkCoreHandlers.publicIpFields,
    });

    this.handleListVPCs = createListHandler<VPC>(cloudStackClient, {
      command: 'listVPCs',
      responseKey: 'listvpcsresponse',
      arrayKey: 'vpc',
      itemName: 'VPC',
      titleField: 'name',
      idField: 'id',
      fields: NetworkCoreHandlers.vpcFields,
    });

    this.handleListNetworkOfferings = createListHandler<NetworkOffering>(cloudStackClient, {
      command: 'listNetworkOfferings',
      responseKey: 'listnetworkofferingsresponse',
      arrayKey: 'networkoffering',
      itemName: 'network offering',
      titleField: 'name',
      idField: 'id',
      fields: NetworkCoreHandlers.networkOfferingFields,
    });

    // Action handlers using factory
    this.handleCreateNetwork = createActionHandler(cloudStackClient, {
      command: 'createNetwork',
      responseKey: 'createnetworkresponse',
      actionVerb: 'Created',
      itemName: 'network',
      requiredFields: ['name', 'displaytext', 'networkofferingid', 'zoneid'],
      jobIdField: 'jobid',
      resultIdField: 'id',
    });

    this.handleDeleteNetwork = createActionHandler(cloudStackClient, {
      command: 'deleteNetwork',
      responseKey: 'deletenetworkresponse',
      actionVerb: 'Deleting',
      itemName: 'network',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args) => `Deleted network ${args.id}`,
    });

    this.handleAssociateIpAddress = createActionHandler(cloudStackClient, {
      command: 'associateIpAddress',
      responseKey: 'associateipaddressresponse',
      actionVerb: 'Associated',
      itemName: 'IP address',
      requiredFields: [], // zoneid is optional per CloudStack API
      jobIdField: 'jobid',
      resultIdField: 'id',
    });

    this.handleDisassociateIpAddress = createActionHandler(cloudStackClient, {
      command: 'disassociateIpAddress',
      responseKey: 'disassociateipaddressresponse',
      actionVerb: 'Releasing',
      itemName: 'IP address',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args) => `Releasing IP address ${args.id}`,
    });

    this.handleDeleteVPC = createActionHandler(cloudStackClient, {
      command: 'deleteVPC',
      responseKey: 'deletevpcresponse',
      actionVerb: 'Deleting',
      itemName: 'VPC',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args) => `Deleting VPC ${args.id}`,
    });

    this.handleUpdateNetwork = createActionHandler(cloudStackClient, {
      command: 'updateNetwork',
      responseKey: 'updatenetworkresponse',
      actionVerb: 'Updating',
      itemName: 'network',
      requiredFields: ['id'],
      jobIdField: 'jobid',
    });

    this.handleRestartNetwork = createActionHandler(cloudStackClient, {
      command: 'restartNetwork',
      responseKey: 'restartnetworkresponse',
      actionVerb: 'Restarting',
      itemName: 'network',
      requiredFields: ['id'],
      jobIdField: 'jobid',
    });

    this.handleUpdateVpc = createActionHandler(cloudStackClient, {
      command: 'updateVPC',
      responseKey: 'updatevpcresponse',
      actionVerb: 'Updated',
      itemName: 'VPC',
      requiredFields: ['id'],
    });

    this.handleListVpcOfferings = createListHandler<VpcOffering>(cloudStackClient, {
      command: 'listVPCOfferings',
      responseKey: 'listvpcofferingsresponse',
      arrayKey: 'vpcoffering',
      itemName: 'VPC offering',
      titleField: 'name',
      idField: 'id',
      fields: [
        { key: 'name', label: 'Name' },
        { key: 'displaytext', label: 'Display Text', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'state', label: 'State', format: (v: unknown) => v ? String(v) : 'N/A' },
      ],
    });

    this.handleCreateVpcOffering = createActionHandler(cloudStackClient, {
      command: 'createVPCOffering',
      responseKey: 'createvpcofferingresponse',
      actionVerb: 'Created',
      itemName: 'VPC offering',
      requiredFields: ['name', 'displaytext', 'supportedservices'],
      resultIdField: 'id',
    });

    this.handleDeleteVpcOffering = createActionHandler(cloudStackClient, {
      command: 'deleteVPCOffering',
      responseKey: 'deletevpcofferingresponse',
      actionVerb: 'Deleting',
      itemName: 'VPC offering',
      requiredFields: ['id'],
      jobIdField: 'jobid',
    });

    this.handleUpdateVpcOffering = createActionHandler(cloudStackClient, {
      command: 'updateVPCOffering',
      responseKey: 'updatevpcofferingresponse',
      actionVerb: 'Updated',
      itemName: 'VPC offering',
      requiredFields: ['id'],
    });

    this.handleListSupportedNetworkServices = createListHandler<NetworkService>(cloudStackClient, {
      command: 'listSupportedNetworkServices',
      responseKey: 'listsupportednetworkservicesresponse',
      arrayKey: 'networkservice',
      itemName: 'network service',
      titleField: 'name',
      idField: 'name',
      fields: [
        { key: 'name', label: 'Name' },
        { key: 'provider', label: 'Provider', format: (v: unknown) => v ? String(v) : 'N/A' },
      ],
    });

    this.handleListNetworkServiceProviders = createListHandler<NetworkServiceProvider>(cloudStackClient, {
      command: 'listNetworkServiceProviders',
      responseKey: 'listnetworkserviceprovidersresponse',
      arrayKey: 'networkserviceprovider',
      itemName: 'network service provider',
      titleField: 'name',
      idField: 'id',
      fields: [
        { key: 'name', label: 'Name' },
        { key: 'state', label: 'State', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'physicalnetworkid', label: 'Physical Network ID', format: (v: unknown) => v ? String(v) : 'N/A' },
      ],
    });
  }

  /**
   * Enable static NAT - custom handler for special output format
   */
  async handleEnableStaticNat(args: { ipaddressid?: string; virtualmachineid?: string }) {
    if (!args.ipaddressid || !args.virtualmachineid) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'Error: Missing required fields "ipaddressid" and "virtualmachineid" for enable_static_nat',
          },
        ],
      };
    }

    const result = await this.cloudStackClient.request<{
      enablestaticnatresponse?: { success?: boolean };
    }>('enableStaticNat', args);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Enabled static NAT for IP ${args.ipaddressid} to VM ${args.virtualmachineid}. Success: ${result.enablestaticnatresponse?.success ?? false}`,
        },
      ],
    };
  }

  /**
   * Disable static NAT - custom handler for special output format
   */
  async handleDisableStaticNat(args: { ipaddressid?: string }) {
    if (!args.ipaddressid) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'Error: Missing required field "ipaddressid" for disable_static_nat',
          },
        ],
      };
    }

    const result = await this.cloudStackClient.request<{
      disablestaticnatresponse?: { jobid?: string };
    }>('disableStaticNat', args);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Disabled static NAT for IP ${args.ipaddressid}. Job ID: ${result.disablestaticnatresponse?.jobid || 'N/A'}`,
        },
      ],
    };
  }

  /**
   * Create VPC - custom handler for special output format
   */
  async handleCreateVPC(args: {
    name?: string;
    displaytext?: string;
    cidr?: string;
    vpcofferingid?: string;
    zoneid?: string;
  }) {
    const required = ['name', 'displaytext', 'cidr', 'vpcofferingid', 'zoneid'];
    const missing = required.filter((f) => !args[f as keyof typeof args]);
    if (missing.length > 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: Missing required fields "${missing.join('", "')}" for create_vpc`,
          },
        ],
      };
    }

    const result = await this.cloudStackClient.request<{
      createvpcresponse?: { jobid?: string; id?: string };
    }>('createVPC', args);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Creating VPC "${args.name}" with CIDR ${args.cidr}. Job ID: ${result.createvpcresponse?.jobid || 'N/A'}\nVPC ID: ${result.createvpcresponse?.id || 'pending'}`,
        },
      ],
    };
  }

  /**
   * Restart VPC - custom handler for cleanup flag output
   */
  async handleRestartVPC(args: { id?: string; cleanup?: boolean }) {
    if (!args.id) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'Error: Missing required field "id" for restart_vpc',
          },
        ],
      };
    }

    const result = await this.cloudStackClient.request<{
      restartvpcresponse?: { jobid?: string };
    }>('restartVPC', args);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Restarting VPC ${args.id}${args.cleanup ? ' (with cleanup)' : ''}. Job ID: ${result.restartvpcresponse?.jobid || 'N/A'}`,
        },
      ],
    };
  }

  /**
   * Create network offering - custom handler for nested response
   */
  async handleCreateNetworkOffering(args: {
    name?: string;
    displaytext?: string;
    guestiptype?: string;
    traffictype?: string;
    supportedservices?: string;
  }) {
    const required = ['name', 'displaytext', 'guestiptype', 'traffictype', 'supportedservices'];
    const missing = required.filter((f) => !args[f as keyof typeof args]);
    if (missing.length > 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: Missing required fields "${missing.join('", "')}" for create_network_offering`,
          },
        ],
      };
    }

    const result = await this.cloudStackClient.request<{
      createnetworkofferingresponse?: {
        networkoffering?: { id?: string; state?: string };
      };
    }>('createNetworkOffering', args);

    const offering = result.createnetworkofferingresponse?.networkoffering;

    return {
      content: [
        {
          type: 'text' as const,
          text: `Created network offering "${args.name}". ID: ${offering?.id || 'N/A'}\nState: ${offering?.state || 'N/A'}`,
        },
      ],
    };
  }
}
