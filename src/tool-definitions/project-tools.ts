export const projectTools = [
  {
    name: 'create_project',
    description: 'Create a new project',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' },
        displaytext: { type: 'string', description: 'Display text for the project' },
        account: { type: 'string', description: 'Account to create project under' },
        domainid: { type: 'string', description: 'Domain ID' },
      },
      required: ['name', 'displaytext'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_project',
    description: 'Delete a project',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Project ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_project',
    description: 'Update a project',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Project ID' },
        displaytext: { type: 'string', description: 'New display text' },
        account: { type: 'string', description: 'New project admin account' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_projects',
    description: 'List projects',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Project ID' },
        name: { type: 'string', description: 'Project name' },
        state: { type: 'string', description: 'Project state (Active, Suspended)' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'activate_project',
    description: 'Activate a suspended project',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Project ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'suspend_project',
    description: 'Suspend an active project',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Project ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'add_account_to_project',
    description: 'Add an account to a project',
    inputSchema: {
      type: 'object',
      properties: {
        projectid: { type: 'string', description: 'Project ID' },
        account: { type: 'string', description: 'Account name to add' },
        email: { type: 'string', description: 'Email to invite' },
      },
      required: ['projectid'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_account_from_project',
    description: 'Remove an account from a project',
    inputSchema: {
      type: 'object',
      properties: {
        projectid: { type: 'string', description: 'Project ID' },
        account: { type: 'string', description: 'Account name to remove' },
      },
      required: ['projectid', 'account'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_project_accounts',
    description: 'List accounts in a project',
    inputSchema: {
      type: 'object',
      properties: {
        projectid: { type: 'string', description: 'Project ID' },
        account: { type: 'string', description: 'Filter by account' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      required: ['projectid'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_project_invitations',
    description: 'List project invitations',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Invitation ID' },
        projectid: { type: 'string', description: 'Project ID' },
        state: { type: 'string', description: 'Invitation state' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'update_project_invitation',
    description: 'Accept or decline a project invitation',
    inputSchema: {
      type: 'object',
      properties: {
        projectid: { type: 'string', description: 'Project ID' },
        accept: { type: 'boolean', description: 'Accept or decline the invitation' },
        token: { type: 'string', description: 'Invitation token' },
      },
      required: ['projectid'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_project_invitation',
    description: 'Delete a project invitation',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Invitation ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
] as const;
