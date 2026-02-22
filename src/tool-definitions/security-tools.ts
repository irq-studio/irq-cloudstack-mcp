export const securityTools = [
  {
    name: 'list_ssh_key_pairs',
    description: 'List SSH key pairs',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Key pair name to filter',
        },
        fingerprint: {
          type: 'string',
          description: 'Key fingerprint to filter',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'create_ssh_key_pair',
    description: 'Create a new SSH key pair',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Key pair name',
        },
        publickey: {
          type: 'string',
          description: 'Public key string (optional - generates if not provided)',
        },
      },
      required: ['name'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_security_groups',
    description: 'List security groups',
    inputSchema: {
      type: 'object',
      properties: {
        securitygroupname: {
          type: 'string',
          description: 'Security group name to filter',
        },
        virtualmachineid: {
          type: 'string',
          description: 'VM ID to show associated security groups',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'create_security_group_rule',
    description: 'Create a security group ingress rule',
    inputSchema: {
      type: 'object',
      properties: {
        securitygroupid: {
          type: 'string',
          description: 'Security group ID',
        },
        protocol: {
          type: 'string',
          description: 'Protocol (TCP, UDP, ICMP)',
        },
        startport: {
          type: 'number',
          description: 'Start port',
        },
        endport: {
          type: 'number',
          description: 'End port',
        },
        cidrlist: {
          type: 'string',
          description: 'CIDR list (comma-separated)',
        },
        usersecuritygrouplist: {
          type: 'string',
          description: 'User security group list',
        },
      },
      required: ['securitygroupid', 'protocol'],
      additionalProperties: false,
    },
  },
  {
    name: 'create_account',
    description: 'Create a CloudStack account',
    inputSchema: {
      type: 'object',
      properties: {
        accounttype: { type: 'number', description: 'Account type (0=user, 1=root-admin, 2=domain-admin)' },
        email: { type: 'string', description: 'Email address' },
        firstname: { type: 'string', description: 'First name' },
        lastname: { type: 'string', description: 'Last name' },
        password: { type: 'string', description: 'Password' },
        username: { type: 'string', description: 'Username' },
        account: { type: 'string', description: 'Account name (defaults to username)' },
        domainid: { type: 'string', description: 'Domain ID' },
        roleid: { type: 'string', description: 'Role ID' },
      },
      required: ['accounttype', 'email', 'firstname', 'lastname', 'password', 'username'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_account',
    description: 'Update a CloudStack account',
    inputSchema: {
      type: 'object',
      properties: {
        newname: { type: 'string', description: 'New account name' },
        account: { type: 'string', description: 'Current account name' },
        id: { type: 'string', description: 'Account ID' },
        domainid: { type: 'string', description: 'Domain ID' },
      },
      required: ['newname'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_account',
    description: 'Delete a CloudStack account (DESTRUCTIVE)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Account ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'disable_account',
    description: 'Disable or lock an account',
    inputSchema: {
      type: 'object',
      properties: {
        lock: { type: 'boolean', description: 'True to lock, false to disable' },
        account: { type: 'string', description: 'Account name' },
        domainid: { type: 'string', description: 'Domain ID' },
        id: { type: 'string', description: 'Account ID' },
      },
      required: ['lock'],
      additionalProperties: false,
    },
  },
  {
    name: 'enable_account',
    description: 'Enable a disabled or locked account',
    inputSchema: {
      type: 'object',
      properties: {
        account: { type: 'string', description: 'Account name' },
        domainid: { type: 'string', description: 'Domain ID' },
        id: { type: 'string', description: 'Account ID' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'lock_account',
    description: 'Lock an account',
    inputSchema: {
      type: 'object',
      properties: {
        account: { type: 'string', description: 'Account name' },
        domainid: { type: 'string', description: 'Domain ID' },
      },
      required: ['account', 'domainid'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_accounts',
    description: 'List CloudStack accounts',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Account ID' },
        name: { type: 'string', description: 'Account name' },
        state: { type: 'string', description: 'Account state' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
] as const;