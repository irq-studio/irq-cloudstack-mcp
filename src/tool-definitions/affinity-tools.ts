export const affinityTools = [
  {
    name: 'create_affinity_group',
    description: 'Create an affinity group for VM placement rules',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Affinity group name',
        },
        type: {
          type: 'string',
          description: 'Affinity group type (host anti-affinity, host affinity, etc.)',
        },
        description: {
          type: 'string',
          description: 'Affinity group description',
        },
        domainid: {
          type: 'string',
          description: 'Domain ID',
        },
        account: {
          type: 'string',
          description: 'Account name',
        },
      },
      required: ['name', 'type'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_affinity_group',
    description: 'Delete an affinity group',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Affinity group ID',
        },
        name: {
          type: 'string',
          description: 'Affinity group name (alternative to ID)',
        },
        account: {
          type: 'string',
          description: 'Account name',
        },
        domainid: {
          type: 'string',
          description: 'Domain ID',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_affinity_groups',
    description: 'List affinity groups',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Affinity group ID',
        },
        name: {
          type: 'string',
          description: 'Affinity group name',
        },
        virtualmachineid: {
          type: 'string',
          description: 'VM ID to filter affinity groups',
        },
        type: {
          type: 'string',
          description: 'Affinity group type',
        },
        account: {
          type: 'string',
          description: 'Account name',
        },
        domainid: {
          type: 'string',
          description: 'Domain ID',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'update_vm_affinity_group',
    description: 'Update VM affinity group memberships',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'VM ID' },
        affinitygroupids: { type: 'string', description: 'Comma-separated affinity group IDs' },
        affinitygroupnames: { type: 'string', description: 'Comma-separated affinity group names' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_affinity_group_types',
    description: 'List available affinity group types',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
] as const;
