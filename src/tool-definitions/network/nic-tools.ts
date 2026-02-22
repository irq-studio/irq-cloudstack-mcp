/**
 * NIC (Network Interface Card) management tools
 * Provides tools for managing VM network interfaces and IP addresses
 */

export const nicTools = [
  {
    name: 'list_nics',
    description: 'List network interfaces (NICs) for a virtual machine',
    inputSchema: {
      type: 'object',
      properties: {
        virtualmachineid: {
          type: 'string',
          description: 'VM ID to list NICs for',
        },
        nicid: {
          type: 'string',
          description: 'Specific NIC ID to retrieve',
        },
        networkid: {
          type: 'string',
          description: 'Filter by network ID',
        },
      },
      required: ['virtualmachineid'],
      additionalProperties: false,
    },
  },
  {
    name: 'add_nic_to_virtual_machine',
    description: 'Add a network interface to a virtual machine with optional IP address specification',
    inputSchema: {
      type: 'object',
      properties: {
        virtualmachineid: {
          type: 'string',
          description: 'VM ID to add NIC to',
        },
        networkid: {
          type: 'string',
          description: 'Network ID for the new NIC',
        },
        ipaddress: {
          type: 'string',
          description: 'Specific IP address to assign to the NIC (optional)',
        },
      },
      required: ['virtualmachineid', 'networkid'],
      additionalProperties: false,
    },
  },
  {
    name: 'remove_nic_from_virtual_machine',
    description: 'Remove a network interface from a virtual machine',
    inputSchema: {
      type: 'object',
      properties: {
        virtualmachineid: {
          type: 'string',
          description: 'VM ID to remove NIC from',
        },
        nicid: {
          type: 'string',
          description: 'NIC ID to remove',
        },
      },
      required: ['virtualmachineid', 'nicid'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_default_nic_for_virtual_machine',
    description: 'Update the default network interface for a virtual machine',
    inputSchema: {
      type: 'object',
      properties: {
        virtualmachineid: {
          type: 'string',
          description: 'VM ID',
        },
        nicid: {
          type: 'string',
          description: 'NIC ID to set as default',
        },
      },
      required: ['virtualmachineid', 'nicid'],
      additionalProperties: false,
    },
  },
  {
    name: 'add_ip_to_nic',
    description: 'Add a secondary IP address to a network interface',
    inputSchema: {
      type: 'object',
      properties: {
        nicid: {
          type: 'string',
          description: 'NIC ID to add IP to',
        },
        ipaddress: {
          type: 'string',
          description: 'Specific IP address to add (optional - auto-assigned if not specified)',
        },
      },
      required: ['nicid'],
      additionalProperties: false,
    },
  },
  {
    name: 'remove_ip_from_nic',
    description: 'Remove a secondary IP address from a network interface',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Secondary IP ID to remove',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
] as const;
