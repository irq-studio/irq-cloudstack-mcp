/**
 * Virtual router lifecycle management tools
 * Includes: router listing, start, stop, reboot, and destroy operations
 */

export const routerTools = [
  {
    name: 'list_routers',
    description: 'List virtual routers',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Router ID',
        },
        zoneid: {
          type: 'string',
          description: 'Zone ID',
        },
        networkid: {
          type: 'string',
          description: 'Network ID',
        },
        vpcid: {
          type: 'string',
          description: 'VPC ID',
        },
        state: {
          type: 'string',
          description: 'Router state (Running, Stopped, Error)',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'start_router',
    description: 'Start a virtual router',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Router ID',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'stop_router',
    description: 'Stop a virtual router',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Router ID',
        },
        forced: {
          type: 'boolean',
          description: 'Force stop the router',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'reboot_router',
    description: 'Reboot a virtual router',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Router ID',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'destroy_router',
    description: 'Destroy a virtual router',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Router ID',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
] as const;
