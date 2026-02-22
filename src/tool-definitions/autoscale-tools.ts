export const autoscaleTools = [
  {
    name: 'create_auto_scale_policy',
    description: 'Create an AutoScale policy',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', description: 'Action to perform (scaleup, scaledown)' },
        conditionids: { type: 'string', description: 'Comma-separated condition IDs' },
        duration: { type: 'number', description: 'Duration in seconds to evaluate conditions' },
        quiettime: { type: 'number', description: 'Quiet time in seconds after a scaling action' },
      },
      required: ['action', 'conditionids', 'duration'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_auto_scale_policy',
    description: 'Update an AutoScale policy',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Policy ID' },
        conditionids: { type: 'string', description: 'Comma-separated condition IDs' },
        duration: { type: 'number', description: 'Duration in seconds' },
        quiettime: { type: 'number', description: 'Quiet time in seconds' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_auto_scale_policy',
    description: 'Delete an AutoScale policy',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Policy ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_auto_scale_policies',
    description: 'List AutoScale policies',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Policy ID' },
        vmgroupid: { type: 'string', description: 'VM group ID' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'create_auto_scale_vm_group',
    description: 'Create an AutoScale VM group',
    inputSchema: {
      type: 'object',
      properties: {
        lbruleid: { type: 'string', description: 'Load balancer rule ID' },
        maxmembers: { type: 'number', description: 'Maximum VMs in the group' },
        minmembers: { type: 'number', description: 'Minimum VMs in the group' },
        scaledownpolicyids: { type: 'string', description: 'Comma-separated scale-down policy IDs' },
        scaleuppolicyids: { type: 'string', description: 'Comma-separated scale-up policy IDs' },
        vmprofileid: { type: 'string', description: 'VM profile ID' },
        interval: { type: 'number', description: 'Evaluation interval in seconds' },
      },
      required: ['lbruleid', 'maxmembers', 'minmembers', 'scaledownpolicyids', 'scaleuppolicyids', 'vmprofileid'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_auto_scale_vm_group',
    description: 'Update an AutoScale VM group',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'VM group ID' },
        maxmembers: { type: 'number', description: 'Maximum VMs' },
        minmembers: { type: 'number', description: 'Minimum VMs' },
        scaledownpolicyids: { type: 'string', description: 'Scale-down policy IDs' },
        scaleuppolicyids: { type: 'string', description: 'Scale-up policy IDs' },
        interval: { type: 'number', description: 'Evaluation interval' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_auto_scale_vm_group',
    description: 'Delete an AutoScale VM group',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'VM group ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_auto_scale_vm_groups',
    description: 'List AutoScale VM groups',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'VM group ID' },
        lbruleid: { type: 'string', description: 'Load balancer rule ID' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'enable_auto_scale_vm_group',
    description: 'Enable an AutoScale VM group',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'VM group ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'disable_auto_scale_vm_group',
    description: 'Disable an AutoScale VM group',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'VM group ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'create_auto_scale_vm_profile',
    description: 'Create an AutoScale VM profile',
    inputSchema: {
      type: 'object',
      properties: {
        serviceofferingid: { type: 'string', description: 'Service offering ID' },
        templateid: { type: 'string', description: 'Template ID' },
        zoneid: { type: 'string', description: 'Zone ID' },
        destroyvmgraceperiod: { type: 'number', description: 'Grace period before destroying VM (seconds)' },
        otherdeployparams: { type: 'string', description: 'Other deploy parameters' },
      },
      required: ['serviceofferingid', 'templateid', 'zoneid'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_auto_scale_vm_profile',
    description: 'Update an AutoScale VM profile',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'VM profile ID' },
        serviceofferingid: { type: 'string', description: 'Service offering ID' },
        templateid: { type: 'string', description: 'Template ID' },
        destroyvmgraceperiod: { type: 'number', description: 'Grace period (seconds)' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_auto_scale_vm_profile',
    description: 'Delete an AutoScale VM profile',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'VM profile ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_auto_scale_vm_profiles',
    description: 'List AutoScale VM profiles',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'VM profile ID' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'create_condition',
    description: 'Create a condition for AutoScale policy',
    inputSchema: {
      type: 'object',
      properties: {
        counterid: { type: 'string', description: 'Counter ID' },
        relationaloperator: { type: 'string', description: 'Relational operator (GT, GE, LT, LE, EQ)' },
        threshold: { type: 'number', description: 'Threshold value' },
      },
      required: ['counterid', 'relationaloperator', 'threshold'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_condition',
    description: 'Delete an AutoScale condition',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Condition ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_conditions',
    description: 'List AutoScale conditions',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Condition ID' },
        counterid: { type: 'string', description: 'Counter ID' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_counters',
    description: 'List AutoScale counters',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Counter ID' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'create_counter',
    description: 'Create an AutoScale counter',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Counter name' },
        source: { type: 'string', description: 'Counter source (snmp, netscaler)' },
        value: { type: 'string', description: 'Counter value (OID or expression)' },
      },
      required: ['name', 'source', 'value'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_counter',
    description: 'Delete an AutoScale counter',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Counter ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_counter',
    description: 'Update an AutoScale counter',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Counter ID' },
        name: { type: 'string', description: 'Counter name' },
        source: { type: 'string', description: 'Counter source' },
        value: { type: 'string', description: 'Counter value' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
] as const;
