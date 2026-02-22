/**
 * Network traffic rule management tools
 * Includes: firewall rules, load balancer rules, and port forwarding rules
 */

export const rulesTools = [
  {
    name: 'create_firewall_rule',
    description: 'Create a firewall rule',
    inputSchema: {
      type: 'object',
      properties: {
        ipaddressid: {
          type: 'string',
          description: 'Public IP address ID',
        },
        protocol: {
          type: 'string',
          description: 'Protocol (tcp, udp, icmp)',
          enum: ['tcp', 'udp', 'icmp'],
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
      },
      required: ['ipaddressid', 'protocol'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_firewall_rules',
    description: 'List firewall rules',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Firewall rule ID',
        },
        ipaddressid: {
          type: 'string',
          description: 'Public IP address ID',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'delete_firewall_rule',
    description: 'Delete a firewall rule',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Firewall rule ID',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_load_balancer_rules',
    description: 'List load balancer rules',
    inputSchema: {
      type: 'object',
      properties: {
        publicipid: {
          type: 'string',
          description: 'Public IP ID to filter rules',
        },
        zoneid: {
          type: 'string',
          description: 'Zone ID to filter rules',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'create_load_balancer_rule',
    description: 'Create a load balancer rule',
    inputSchema: {
      type: 'object',
      properties: {
        publicipid: {
          type: 'string',
          description: 'Public IP address ID',
        },
        algorithm: {
          type: 'string',
          description: 'Load balancer algorithm (roundrobin, leastconn, source)',
          enum: ['roundrobin', 'leastconn', 'source'],
        },
        name: {
          type: 'string',
          description: 'Name of the load balancer rule',
        },
        privateport: {
          type: 'number',
          description: 'Private port on the VM',
        },
        publicport: {
          type: 'number',
          description: 'Public port',
        },
        protocol: {
          type: 'string',
          description: 'Protocol (tcp, udp)',
          enum: ['tcp', 'udp'],
        },
      },
      required: ['publicipid', 'algorithm', 'name', 'privateport', 'publicport'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_load_balancer_rule',
    description: 'Delete a load balancer rule',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Load balancer rule ID',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'assign_to_load_balancer_rule',
    description: 'Assign VMs to a load balancer rule',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Load balancer rule ID',
        },
        virtualmachineids: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of VM IDs to assign to the load balancer',
        },
      },
      required: ['id', 'virtualmachineids'],
      additionalProperties: false,
    },
  },
  {
    name: 'remove_from_load_balancer_rule',
    description: 'Remove VMs from a load balancer rule',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Load balancer rule ID',
        },
        virtualmachineids: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of VM IDs to remove from the load balancer',
        },
      },
      required: ['id', 'virtualmachineids'],
      additionalProperties: false,
    },
  },
  {
    name: 'create_port_forwarding_rule',
    description: 'Create a port forwarding rule',
    inputSchema: {
      type: 'object',
      properties: {
        ipaddressid: {
          type: 'string',
          description: 'Public IP address ID',
        },
        privateport: {
          type: 'number',
          description: 'Private port on the VM',
        },
        publicport: {
          type: 'number',
          description: 'Public port',
        },
        protocol: {
          type: 'string',
          description: 'Protocol (tcp, udp)',
          enum: ['tcp', 'udp'],
        },
        virtualmachineid: {
          type: 'string',
          description: 'VM ID',
        },
        privateendport: {
          type: 'number',
          description: 'Private end port (for port range)',
        },
        publicendport: {
          type: 'number',
          description: 'Public end port (for port range)',
        },
      },
      required: ['ipaddressid', 'privateport', 'publicport', 'protocol', 'virtualmachineid'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_port_forwarding_rules',
    description: 'List port forwarding rules',
    inputSchema: {
      type: 'object',
      properties: {
        ipaddressid: {
          type: 'string',
          description: 'Public IP address ID to filter rules',
        },
        id: {
          type: 'string',
          description: 'Rule ID',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'delete_port_forwarding_rule',
    description: 'Delete a port forwarding rule',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Port forwarding rule ID',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'create_egress_firewall_rule',
    description: 'Create an egress firewall rule for a network',
    inputSchema: {
      type: 'object',
      properties: {
        networkid: { type: 'string', description: 'Network ID' },
        protocol: { type: 'string', description: 'Protocol (tcp, udp, icmp, all)' },
        startport: { type: 'number', description: 'Start port' },
        endport: { type: 'number', description: 'End port' },
        cidrlist: { type: 'string', description: 'CIDR list' },
      },
      required: ['networkid', 'protocol'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_egress_firewall_rules',
    description: 'List egress firewall rules',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Rule ID' },
        networkid: { type: 'string', description: 'Network ID' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'delete_egress_firewall_rule',
    description: 'Delete an egress firewall rule',
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
    name: 'update_load_balancer_rule',
    description: 'Update a load balancer rule',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Rule ID' },
        name: { type: 'string', description: 'Rule name' },
        description: { type: 'string', description: 'Rule description' },
        algorithm: { type: 'string', description: 'Algorithm (roundrobin, leastconn, source)' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_lb_stickiness_policies',
    description: 'List load balancer stickiness policies',
    inputSchema: {
      type: 'object',
      properties: {
        lbruleid: { type: 'string', description: 'Load balancer rule ID' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      required: ['lbruleid'],
      additionalProperties: false,
    },
  },
  {
    name: 'create_lb_stickiness_policy',
    description: 'Create a load balancer stickiness policy',
    inputSchema: {
      type: 'object',
      properties: {
        lbruleid: { type: 'string', description: 'Load balancer rule ID' },
        methodname: { type: 'string', description: 'Stickiness method (LbCookie, AppCookie, SourceBased)' },
        name: { type: 'string', description: 'Policy name' },
        description: { type: 'string', description: 'Policy description' },
      },
      required: ['lbruleid', 'methodname', 'name'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_lb_stickiness_policy',
    description: 'Delete a load balancer stickiness policy',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Policy ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
] as const;
