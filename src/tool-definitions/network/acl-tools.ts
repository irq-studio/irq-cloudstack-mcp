export const aclTools = [
  {
    name: 'create_network_acl',
    description: 'Create a network ACL item (rule)',
    inputSchema: {
      type: 'object',
      properties: {
        protocol: { type: 'string', description: 'Protocol (tcp, udp, icmp, all)' },
        aclid: { type: 'string', description: 'ACL list ID' },
        action: { type: 'string', description: 'Action (allow, deny)' },
        cidrlist: { type: 'string', description: 'CIDR list (comma separated)' },
        startport: { type: 'number', description: 'Start port' },
        endport: { type: 'number', description: 'End port' },
        icmptype: { type: 'number', description: 'ICMP type (-1 for all)' },
        icmpcode: { type: 'number', description: 'ICMP code (-1 for all)' },
        traffictype: { type: 'string', description: 'Traffic type (ingress, egress)' },
        number: { type: 'number', description: 'Rule number (priority order)' },
      },
      required: ['protocol', 'aclid'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_network_acl',
    description: 'Delete a network ACL item',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ACL item ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_network_acl_item',
    description: 'Update a network ACL item',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ACL item ID' },
        action: { type: 'string', description: 'Action (allow, deny)' },
        cidrlist: { type: 'string', description: 'CIDR list' },
        protocol: { type: 'string', description: 'Protocol' },
        startport: { type: 'number', description: 'Start port' },
        endport: { type: 'number', description: 'End port' },
        number: { type: 'number', description: 'Rule number' },
        traffictype: { type: 'string', description: 'Traffic type' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_network_acls',
    description: 'List network ACL items (rules)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ACL item ID' },
        networkid: { type: 'string', description: 'Network ID' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'create_network_acl_list',
    description: 'Create a network ACL list for a VPC',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'ACL list name' },
        description: { type: 'string', description: 'ACL list description' },
        vpcid: { type: 'string', description: 'VPC ID' },
      },
      required: ['name', 'description', 'vpcid'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_network_acl_list',
    description: 'Delete a network ACL list',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ACL list ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_network_acl_list',
    description: 'Update a network ACL list',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ACL list ID' },
        name: { type: 'string', description: 'ACL list name' },
        description: { type: 'string', description: 'ACL list description' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_network_acl_lists',
    description: 'List network ACL lists',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ACL list ID' },
        vpcid: { type: 'string', description: 'VPC ID' },
        networkid: { type: 'string', description: 'Network ID' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'replace_network_acl_list',
    description: 'Replace the ACL list associated with a network or private gateway',
    inputSchema: {
      type: 'object',
      properties: {
        aclid: { type: 'string', description: 'ACL list ID' },
        gatewayid: { type: 'string', description: 'Private gateway ID' },
        networkid: { type: 'string', description: 'Network ID' },
      },
      required: ['aclid'],
      additionalProperties: false,
    },
  },
] as const;
