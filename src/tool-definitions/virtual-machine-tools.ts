export const virtualMachineTools = [
  {
    name: 'list_virtual_machines',
    description: 'List virtual machines in CloudStack',
    inputSchema: {
      type: 'object',
      properties: {
        zoneid: {
          type: 'string',
          description: 'Zone ID to filter VMs',
        },
        state: {
          type: 'string',
          description: 'VM state (Running, Stopped, etc.)',
          enum: ['Running', 'Stopped', 'Starting', 'Stopping', 'Destroyed', 'Expunging', 'Migrating', 'Error', 'Unknown', 'Shutdowned'],
        },
        keyword: {
          type: 'string',
          description: 'Keyword to search VMs',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'get_virtual_machine',
    description: 'Get details of a specific virtual machine',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'VM ID',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'start_virtual_machine',
    description: 'Start a virtual machine',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'VM ID to start',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'stop_virtual_machine',
    description: 'Stop a virtual machine',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'VM ID to stop',
        },
        forced: {
          type: 'boolean',
          description: 'Force stop the VM',
          default: false,
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'reboot_virtual_machine',
    description: 'Reboot a virtual machine',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'VM ID to reboot',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'destroy_virtual_machine',
    description: 'Destroy a virtual machine using proper workflow: stop → destroy → expunge. Handles VMs in any state including Error. (DESTRUCTIVE - cannot be undone)',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'VM ID to destroy',
        },
        expunge: {
          type: 'boolean',
          description: 'Expunge (permanently delete) the VM after destroying',
          default: false,
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'deploy_virtual_machine',
    description: 'Deploy a new virtual machine',
    inputSchema: {
      type: 'object',
      properties: {
        serviceofferingid: {
          type: 'string',
          description: 'Service offering ID',
        },
        templateid: {
          type: 'string',
          description: 'Template ID',
        },
        zoneid: {
          type: 'string',
          description: 'Zone ID',
        },
        name: {
          type: 'string',
          description: 'VM name',
        },
        displayname: {
          type: 'string',
          description: 'VM display name',
        },
        networkids: {
          type: 'string',
          description: 'Network IDs (comma-separated)',
        },
        securitygroupids: {
          type: 'string',
          description: 'Security group IDs (comma-separated)',
        },
        keypair: {
          type: 'string',
          description: 'SSH key pair name',
        },
        userdata: {
          type: 'string',
          description: 'User data (base64 encoded)',
        },
      },
      required: ['serviceofferingid', 'templateid', 'zoneid'],
      additionalProperties: false,
    },
  },
  {
    name: 'scale_virtual_machine',
    description: 'Scale virtual machine (change service offering)',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'VM ID to scale',
        },
        serviceofferingid: {
          type: 'string',
          description: 'New service offering ID',
        },
      },
      required: ['id', 'serviceofferingid'],
      additionalProperties: false,
    },
  },
  {
    name: 'migrate_virtual_machine',
    description: 'Migrate virtual machine to another host',
    inputSchema: {
      type: 'object',
      properties: {
        virtualmachineid: {
          type: 'string',
          description: 'VM ID to migrate',
        },
        hostid: {
          type: 'string',
          description: 'Target host ID',
        },
      },
      required: ['virtualmachineid'],
      additionalProperties: false,
    },
  },
  {
    name: 'reset_password_virtual_machine',
    description: 'Reset password for virtual machine',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'VM ID',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'change_service_offering_virtual_machine',
    description: 'Change service offering for virtual machine',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'VM ID',
        },
        serviceofferingid: {
          type: 'string',
          description: 'New service offering ID',
        },
      },
      required: ['id', 'serviceofferingid'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_virtual_machine_metrics',
    description: 'List virtual machine performance metrics',
    inputSchema: {
      type: 'object',
      properties: {
        zoneid: {
          type: 'string',
          description: 'Zone ID to filter VMs',
        },
        id: {
          type: 'string',
          description: 'Specific VM ID',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'recover_virtual_machine',
    description: 'Recover a destroyed virtual machine',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'VM ID to recover' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_virtual_machine',
    description: 'Update properties of a virtual machine',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'VM ID' },
        displayname: { type: 'string', description: 'New display name' },
        name: { type: 'string', description: 'New VM name' },
        userdata: { type: 'string', description: 'New user data (base64 encoded)' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'assign_virtual_machine',
    description: 'Assign a VM to a different account',
    inputSchema: {
      type: 'object',
      properties: {
        virtualmachineid: { type: 'string', description: 'VM ID' },
        account: { type: 'string', description: 'Target account name' },
        domainid: { type: 'string', description: 'Target domain ID' },
      },
      required: ['virtualmachineid', 'account', 'domainid'],
      additionalProperties: false,
    },
  },
  {
    name: 'restore_virtual_machine',
    description: 'Restore a VM to its original or a new template',
    inputSchema: {
      type: 'object',
      properties: {
        virtualmachineid: { type: 'string', description: 'VM ID' },
        templateid: { type: 'string', description: 'Template ID (optional, restores to original if not specified)' },
      },
      required: ['virtualmachineid'],
      additionalProperties: false,
    },
  },
] as const;