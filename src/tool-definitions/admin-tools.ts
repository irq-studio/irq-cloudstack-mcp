export const adminTools = [
  {
    name: 'get_server_version',
    description: 'Get the MCP server version information including server version, MCP SDK version, and tool count',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'get_cloudstack_capabilities',
    description: 'Get CloudStack cloud capabilities including version, supported hypervisors, and feature flags. Use this to check what features are available on the connected CloudStack instance.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'list_zones',
    description: 'List availability zones',
    inputSchema: {
      type: 'object',
      properties: {
        available: {
          type: 'boolean',
          description: 'Show only available zones',
          default: true,
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_templates',
    description: 'List templates',
    inputSchema: {
      type: 'object',
      properties: {
        templatefilter: {
          type: 'string',
          description: 'Template filter (featured, self, selfexecutable, sharedexecutable, executable, community)',
          enum: ['featured', 'self', 'selfexecutable', 'sharedexecutable', 'executable', 'community'],
          default: 'featured',
        },
        zoneid: {
          type: 'string',
          description: 'Zone ID to filter templates',
        },
        hypervisor: {
          type: 'string',
          description: 'Hypervisor type',
        },
      },
      required: ['templatefilter'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_users',
    description: 'List users',
    inputSchema: {
      type: 'object',
      properties: {
        account: {
          type: 'string',
          description: 'Account name to filter users',
        },
        domainid: {
          type: 'string',
          description: 'Domain ID to filter users',
        },
        state: {
          type: 'string',
          description: 'User state',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_domains',
    description: 'List domains',
    inputSchema: {
      type: 'object',
      properties: {
        level: {
          type: 'number',
          description: 'Domain level',
        },
        name: {
          type: 'string',
          description: 'Domain name',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_hosts',
    description: 'List hosts',
    inputSchema: {
      type: 'object',
      properties: {
        zoneid: {
          type: 'string',
          description: 'Zone ID to filter hosts',
        },
        type: {
          type: 'string',
          description: 'Host type (Routing, Storage, etc.)',
        },
        state: {
          type: 'string',
          description: 'Host state',
        },
        hypervisor: {
          type: 'string',
          description: 'Hypervisor type',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_clusters',
    description: 'List clusters',
    inputSchema: {
      type: 'object',
      properties: {
        zoneid: {
          type: 'string',
          description: 'Zone ID to filter clusters',
        },
        hypervisor: {
          type: 'string',
          description: 'Hypervisor type',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_storage_pools',
    description: 'List storage pools',
    inputSchema: {
      type: 'object',
      properties: {
        zoneid: {
          type: 'string',
          description: 'Zone ID to filter storage pools',
        },
        clusterid: {
          type: 'string',
          description: 'Cluster ID to filter storage pools',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_system_vms',
    description: 'List system VMs (console proxy, secondary storage)',
    inputSchema: {
      type: 'object',
      properties: {
        zoneid: {
          type: 'string',
          description: 'Zone ID to filter system VMs',
        },
        systemvmtype: {
          type: 'string',
          description: 'System VM type (consoleproxy, secondarystoragevm)',
          enum: ['consoleproxy', 'secondarystoragevm'],
        },
        state: {
          type: 'string',
          description: 'System VM state',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_service_offerings',
    description: 'List service offerings (compute plans)',
    inputSchema: {
      type: 'object',
      properties: {
        issystem: {
          type: 'boolean',
          description: 'Show system offerings',
          default: false,
        },
        domainid: {
          type: 'string',
          description: 'Domain ID to filter offerings',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'create_zone',
    description: 'Create a new zone',
    inputSchema: {
      type: 'object',
      properties: {
        dns1: { type: 'string', description: 'Primary DNS' },
        internaldns1: { type: 'string', description: 'Primary internal DNS' },
        name: { type: 'string', description: 'Zone name' },
        networktype: { type: 'string', description: 'Network type (Basic, Advanced)' },
        dns2: { type: 'string', description: 'Secondary DNS' },
        internaldns2: { type: 'string', description: 'Secondary internal DNS' },
        guestcidraddress: { type: 'string', description: 'Guest CIDR address' },
      },
      required: ['dns1', 'internaldns1', 'name', 'networktype'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_zone',
    description: 'Update a zone',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Zone ID' },
        name: { type: 'string', description: 'Zone name' },
        dns1: { type: 'string', description: 'Primary DNS' },
        dns2: { type: 'string', description: 'Secondary DNS' },
        internaldns1: { type: 'string', description: 'Primary internal DNS' },
        internaldns2: { type: 'string', description: 'Secondary internal DNS' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_zone',
    description: 'Delete a zone (DESTRUCTIVE)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Zone ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'create_pod',
    description: 'Create a new pod',
    inputSchema: {
      type: 'object',
      properties: {
        gateway: { type: 'string', description: 'Gateway' },
        name: { type: 'string', description: 'Pod name' },
        netmask: { type: 'string', description: 'Netmask' },
        startip: { type: 'string', description: 'Start IP' },
        zoneid: { type: 'string', description: 'Zone ID' },
        endip: { type: 'string', description: 'End IP' },
      },
      required: ['gateway', 'name', 'netmask', 'startip', 'zoneid'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_pod',
    description: 'Update a pod',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Pod ID' },
        name: { type: 'string', description: 'Pod name' },
        gateway: { type: 'string', description: 'Gateway' },
        netmask: { type: 'string', description: 'Netmask' },
        startip: { type: 'string', description: 'Start IP' },
        endip: { type: 'string', description: 'End IP' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_pod',
    description: 'Delete a pod',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Pod ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_pods',
    description: 'List pods',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Pod ID' },
        zoneid: { type: 'string', description: 'Zone ID' },
        name: { type: 'string', description: 'Pod name' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'add_cluster',
    description: 'Add a cluster to a pod',
    inputSchema: {
      type: 'object',
      properties: {
        clustername: { type: 'string', description: 'Cluster name' },
        clustertype: { type: 'string', description: 'Cluster type (CloudManaged, ExternalManaged)' },
        hypervisor: { type: 'string', description: 'Hypervisor type (KVM, VMware, XenServer)' },
        zoneid: { type: 'string', description: 'Zone ID' },
        podid: { type: 'string', description: 'Pod ID' },
        url: { type: 'string', description: 'URL for the cluster' },
        username: { type: 'string', description: 'Username (for VMware)' },
        password: { type: 'string', description: 'Password (for VMware)' },
      },
      required: ['clustername', 'clustertype', 'hypervisor', 'zoneid', 'podid'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_cluster',
    description: 'Update a cluster',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Cluster ID' },
        clustername: { type: 'string', description: 'Cluster name' },
        clustertype: { type: 'string', description: 'Cluster type' },
        hypervisor: { type: 'string', description: 'Hypervisor type' },
        managedstate: { type: 'string', description: 'Managed state (Managed, Unmanaged)' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_cluster',
    description: 'Delete a cluster',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Cluster ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'add_host',
    description: 'Add a host to a cluster',
    inputSchema: {
      type: 'object',
      properties: {
        hypervisor: { type: 'string', description: 'Hypervisor type' },
        url: { type: 'string', description: 'Host URL' },
        zoneid: { type: 'string', description: 'Zone ID' },
        podid: { type: 'string', description: 'Pod ID' },
        clusterid: { type: 'string', description: 'Cluster ID' },
        username: { type: 'string', description: 'Username' },
        password: { type: 'string', description: 'Password' },
      },
      required: ['hypervisor', 'url', 'zoneid', 'podid'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_host',
    description: 'Update a host',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Host ID' },
        allocationstate: { type: 'string', description: 'Allocation state (Enable, Disable)' },
        hosttags: { type: 'string', description: 'Host tags (comma separated)' },
        oscategoryid: { type: 'string', description: 'OS category ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_host',
    description: 'Delete a host',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Host ID' },
        forced: { type: 'boolean', description: 'Force host removal' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'reconnect_host',
    description: 'Reconnect a host',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Host ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'prepare_host_for_maintenance',
    description: 'Prepare a host for maintenance (migrate all VMs off)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Host ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'cancel_host_maintenance',
    description: 'Cancel host maintenance mode',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Host ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'create_domain',
    description: 'Create a domain',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Domain name' },
        parentdomainid: { type: 'string', description: 'Parent domain ID' },
        networkdomain: { type: 'string', description: 'Network domain' },
      },
      required: ['name'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_domain',
    description: 'Update a domain',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Domain ID' },
        name: { type: 'string', description: 'Domain name' },
        networkdomain: { type: 'string', description: 'Network domain' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_domain',
    description: 'Delete a domain (DESTRUCTIVE)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Domain ID' },
        cleanup: { type: 'boolean', description: 'Delete all resources in domain' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'create_user',
    description: 'Create a user in an account',
    inputSchema: {
      type: 'object',
      properties: {
        account: { type: 'string', description: 'Account name' },
        email: { type: 'string', description: 'Email' },
        firstname: { type: 'string', description: 'First name' },
        lastname: { type: 'string', description: 'Last name' },
        password: { type: 'string', description: 'Password' },
        username: { type: 'string', description: 'Username' },
        domainid: { type: 'string', description: 'Domain ID' },
      },
      required: ['account', 'email', 'firstname', 'lastname', 'password', 'username'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_user',
    description: 'Update a user',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'User ID' },
        email: { type: 'string', description: 'Email' },
        firstname: { type: 'string', description: 'First name' },
        lastname: { type: 'string', description: 'Last name' },
        password: { type: 'string', description: 'Password' },
        username: { type: 'string', description: 'Username' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_user',
    description: 'Delete a user',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'User ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'disable_user',
    description: 'Disable a user',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'User ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'enable_user',
    description: 'Enable a disabled user',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'User ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_configurations',
    description: 'List CloudStack configuration settings',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Configuration name' },
        category: { type: 'string', description: 'Configuration category' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'update_configuration',
    description: 'Update a CloudStack configuration setting',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Configuration name' },
        value: { type: 'string', description: 'New value' },
      },
      required: ['name'],
      additionalProperties: false,
    },
  },
  {
    name: 'start_system_vm',
    description: 'Start a system VM (SSVM, CPVM)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'System VM ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'stop_system_vm',
    description: 'Stop a system VM',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'System VM ID' },
        forced: { type: 'boolean', description: 'Force stop' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'reboot_system_vm',
    description: 'Reboot a system VM',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'System VM ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'destroy_system_vm',
    description: 'Destroy a system VM (DESTRUCTIVE)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'System VM ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'migrate_system_vm',
    description: 'Migrate a system VM to another host',
    inputSchema: {
      type: 'object',
      properties: {
        virtualmachineid: { type: 'string', description: 'System VM ID' },
        hostid: { type: 'string', description: 'Target host ID' },
      },
      required: ['virtualmachineid'],
      additionalProperties: false,
    },
  },
  {
    name: 'create_console_endpoint',
    description: 'Create a console endpoint for a VM',
    inputSchema: {
      type: 'object',
      properties: {
        virtualmachineid: { type: 'string', description: 'VM ID' },
      },
      required: ['virtualmachineid'],
      additionalProperties: false,
    },
  },
] as const;