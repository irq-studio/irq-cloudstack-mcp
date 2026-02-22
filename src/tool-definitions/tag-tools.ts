export const tagTools = [
  {
    name: 'create_tags',
    description: 'Create resource tags',
    inputSchema: {
      type: 'object',
      properties: {
        resourceids: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of resource IDs to tag',
        },
        resourcetype: {
          type: 'string',
          description: 'Resource type (UserVm, Volume, Snapshot, Template, ISO, etc.)',
        },
        tags: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string' },
              value: { type: 'string' },
            },
          },
          description: 'List of key-value pairs for tags',
        },
      },
      required: ['resourceids', 'resourcetype', 'tags'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_tags',
    description: 'Delete resource tags',
    inputSchema: {
      type: 'object',
      properties: {
        resourceids: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of resource IDs',
        },
        resourcetype: {
          type: 'string',
          description: 'Resource type (UserVm, Volume, Snapshot, Template, ISO, etc.)',
        },
        tags: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string' },
              value: { type: 'string' },
            },
          },
          description: 'List of key-value pairs for tags to delete',
        },
      },
      required: ['resourceids', 'resourcetype'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_tags',
    description: 'List resource tags',
    inputSchema: {
      type: 'object',
      properties: {
        resourcetype: {
          type: 'string',
          description: 'Resource type to filter tags',
        },
        resourceid: {
          type: 'string',
          description: 'Resource ID to filter tags',
        },
        key: {
          type: 'string',
          description: 'Tag key to filter',
        },
        value: {
          type: 'string',
          description: 'Tag value to filter',
        },
      },
      additionalProperties: false,
    },
  },
] as const;
