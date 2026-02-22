/**
 * Core networking infrastructure tools
 * Includes: networks, public IPs, VPCs, and network offerings
 */

export const coreTools = [
  {
    name: 'list_networks',
    description: 'List networks',
    inputSchema: {
      type: 'object',
      properties: {
        zoneid: {
          type: 'string',
          description: 'Zone ID to filter networks',
        },
        type: {
          type: 'string',
          description: 'Network type (Isolated, Shared, L2)',
          enum: ['Isolated', 'Shared', 'L2'],
        },
        isdefault: {
          type: 'boolean',
          description: 'Filter by default networks',
        },
        // CloudStack 4.22+ filter
        name: {
          type: 'string',
          description: 'Filter networks by name (CloudStack 4.22+)',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'create_network',
    description: 'Create a new network',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Network name',
        },
        displaytext: {
          type: 'string',
          description: 'Network display text',
        },
        networkofferingid: {
          type: 'string',
          description: 'Network offering ID',
        },
        zoneid: {
          type: 'string',
          description: 'Zone ID',
        },
        gateway: {
          type: 'string',
          description: 'Network gateway',
        },
        netmask: {
          type: 'string',
          description: 'Network netmask',
        },
      },
      required: ['name', 'displaytext', 'networkofferingid', 'zoneid'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_network',
    description: 'Delete a network',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Network ID to delete',
        },
        forced: {
          type: 'boolean',
          description: 'Force delete even if there are VMs using the network',
          default: false,
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_public_ip_addresses',
    description: 'List public IP addresses',
    inputSchema: {
      type: 'object',
      properties: {
        zoneid: {
          type: 'string',
          description: 'Zone ID to filter IPs',
        },
        allocatedonly: {
          type: 'boolean',
          description: 'Show only allocated IPs',
          default: true,
        },
        isstaticnat: {
          type: 'boolean',
          description: 'Filter by static NAT enabled',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'associate_ip_address',
    description: 'Acquire a new public IP address',
    inputSchema: {
      type: 'object',
      properties: {
        zoneid: {
          type: 'string',
          description: 'Zone ID',
        },
        networkid: {
          type: 'string',
          description: 'Network ID',
        },
        vpcid: {
          type: 'string',
          description: 'VPC ID',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'disassociate_ip_address',
    description: 'Release a public IP address',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Public IP address ID',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'enable_static_nat',
    description: 'Enable static NAT for an IP to a VM',
    inputSchema: {
      type: 'object',
      properties: {
        ipaddressid: {
          type: 'string',
          description: 'Public IP address ID',
        },
        virtualmachineid: {
          type: 'string',
          description: 'VM ID',
        },
        vmguestip: {
          type: 'string',
          description: 'VM guest IP (for multiple IPs)',
        },
      },
      required: ['ipaddressid', 'virtualmachineid'],
      additionalProperties: false,
    },
  },
  {
    name: 'disable_static_nat',
    description: 'Disable static NAT on a public IP',
    inputSchema: {
      type: 'object',
      properties: {
        ipaddressid: {
          type: 'string',
          description: 'Public IP address ID',
        },
      },
      required: ['ipaddressid'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_vpcs',
    description: 'List Virtual Private Clouds (VPCs)',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'VPC ID',
        },
        zoneid: {
          type: 'string',
          description: 'Zone ID',
        },
        name: {
          type: 'string',
          description: 'VPC name',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'create_vpc',
    description: 'Create a Virtual Private Cloud (VPC)',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'VPC name',
        },
        displaytext: {
          type: 'string',
          description: 'VPC display text',
        },
        cidr: {
          type: 'string',
          description: 'VPC CIDR block (e.g., 10.0.0.0/16)',
        },
        vpcofferingid: {
          type: 'string',
          description: 'VPC offering ID',
        },
        zoneid: {
          type: 'string',
          description: 'Zone ID',
        },
      },
      required: ['name', 'displaytext', 'cidr', 'vpcofferingid', 'zoneid'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_vpc',
    description: 'Delete a VPC',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'VPC ID',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'restart_vpc',
    description: 'Restart a VPC',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'VPC ID',
        },
        cleanup: {
          type: 'boolean',
          description: 'Cleanup VPC resources before restart',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_network_offerings',
    description: 'List network offerings',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Network offering ID',
        },
        zoneid: {
          type: 'string',
          description: 'Zone ID',
        },
        state: {
          type: 'string',
          description: 'Offering state',
        },
        isdefault: {
          type: 'boolean',
          description: 'Filter by default offerings',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'create_network_offering',
    description: 'Create a new network offering (e.g., for pfSense WAN)',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Network offering name',
        },
        displaytext: {
          type: 'string',
          description: 'Display text for the offering',
        },
        guestiptype: {
          type: 'string',
          description: 'Guest IP type: Shared or Isolated',
          enum: ['Shared', 'Isolated'],
        },
        traffictype: {
          type: 'string',
          description: 'Traffic type (typically Guest)',
          default: 'Guest',
        },
        supportedservices: {
          type: 'string',
          description: 'Comma-separated list of supported services (e.g., Dns,Dhcp,SourceNat,Firewall)',
        },
        serviceproviderlist: {
          type: 'array',
          description: 'Array of service provider mappings (e.g., [{service: "Dhcp", provider: "VirtualRouter"}])',
          items: {
            type: 'object',
            properties: {
              service: { type: 'string' },
              provider: { type: 'string' },
            },
          },
        },
        specifyvlan: {
          type: 'boolean',
          description: 'Whether VLAN can be specified when creating networks',
        },
        specifyipranges: {
          type: 'boolean',
          description: 'Whether IP ranges can be specified',
        },
        conservemode: {
          type: 'boolean',
          description: 'Whether to use conserve mode',
        },
        availability: {
          type: 'string',
          description: 'Availability of the offering',
          enum: ['Optional', 'Required'],
        },
        tags: {
          type: 'string',
          description: 'Tags for the offering',
        },
      },
      required: ['name', 'displaytext', 'guestiptype', 'supportedservices'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_network',
    description: 'Update a network',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Network ID' },
        name: { type: 'string', description: 'Network name' },
        displaytext: { type: 'string', description: 'Display text' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'restart_network',
    description: 'Restart a network (restarts routers and re-applies rules)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Network ID' },
        cleanup: { type: 'boolean', description: 'Cleanup old resources' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_vpc',
    description: 'Update a VPC',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'VPC ID' },
        name: { type: 'string', description: 'VPC name' },
        displaytext: { type: 'string', description: 'Display text' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_vpc_offerings',
    description: 'List VPC offerings',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'VPC offering ID' },
        name: { type: 'string', description: 'Offering name' },
        state: { type: 'string', description: 'Offering state' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'create_vpc_offering',
    description: 'Create a VPC offering',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Offering name' },
        displaytext: { type: 'string', description: 'Display text' },
        supportedservices: { type: 'string', description: 'Supported services (comma separated)' },
      },
      required: ['name', 'displaytext', 'supportedservices'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_vpc_offering',
    description: 'Delete a VPC offering',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'VPC offering ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_vpc_offering',
    description: 'Update a VPC offering',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'VPC offering ID' },
        name: { type: 'string', description: 'Name' },
        displaytext: { type: 'string', description: 'Display text' },
        state: { type: 'string', description: 'State (Enabled, Disabled)' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_supported_network_services',
    description: 'List all available network services',
    inputSchema: {
      type: 'object',
      properties: {
        service: { type: 'string', description: 'Service name' },
        provider: { type: 'string', description: 'Provider name' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_network_service_providers',
    description: 'List network service providers',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Provider name' },
        physicalnetworkid: { type: 'string', description: 'Physical network ID' },
        state: { type: 'string', description: 'Provider state' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
] as const;
