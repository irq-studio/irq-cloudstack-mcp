export const roleTools = [
  {
    name: 'create_role',
    description: 'Create a new role',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Role name' },
        type: { type: 'string', description: 'Role type (Admin, DomainAdmin, ResourceAdmin, User)' },
        description: { type: 'string', description: 'Role description' },
      },
      required: ['name'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_role',
    description: 'Update a role',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Role ID' },
        name: { type: 'string', description: 'Role name' },
        description: { type: 'string', description: 'Role description' },
        type: { type: 'string', description: 'Role type' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_role',
    description: 'Delete a role',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Role ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_roles',
    description: 'List roles',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Role ID' },
        name: { type: 'string', description: 'Role name' },
        type: { type: 'string', description: 'Role type' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'create_role_permission',
    description: 'Create a role permission rule',
    inputSchema: {
      type: 'object',
      properties: {
        roleid: { type: 'string', description: 'Role ID' },
        rule: { type: 'string', description: 'API name or wildcard pattern' },
        permission: { type: 'string', description: 'Permission (allow, deny)' },
        description: { type: 'string', description: 'Permission description' },
      },
      required: ['roleid', 'rule', 'permission'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_role_permission',
    description: 'Update role permission order or permission',
    inputSchema: {
      type: 'object',
      properties: {
        roleid: { type: 'string', description: 'Role ID' },
        ruleorder: { type: 'string', description: 'Comma-separated ordered list of rule IDs' },
        ruleid: { type: 'string', description: 'Rule ID to update' },
        permission: { type: 'string', description: 'Permission (allow, deny)' },
      },
      required: ['roleid'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_role_permission',
    description: 'Delete a role permission rule',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Rule ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_role_permissions',
    description: 'List role permissions',
    inputSchema: {
      type: 'object',
      properties: {
        roleid: { type: 'string', description: 'Role ID' },
      },
      required: ['roleid'],
      additionalProperties: false,
    },
  },
  {
    name: 'import_role',
    description: 'Import a role with rules',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Role name' },
        rules: { type: 'string', description: 'JSON string of rules' },
        type: { type: 'string', description: 'Role type' },
        description: { type: 'string', description: 'Role description' },
        forced: { type: 'boolean', description: 'Force import even if role exists' },
      },
      required: ['name', 'rules'],
      additionalProperties: false,
    },
  },
] as const;
