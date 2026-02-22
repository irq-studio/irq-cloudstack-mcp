export const monitoringTools = [
  {
    name: 'list_events',
    description: 'List system events',
    inputSchema: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          description: 'Event level (INFO, WARN, ERROR)',
          enum: ['INFO', 'WARN', 'ERROR'],
        },
        type: {
          type: 'string',
          description: 'Event type',
        },
        startdate: {
          type: 'string',
          description: 'Start date (YYYY-MM-DD)',
        },
        enddate: {
          type: 'string',
          description: 'End date (YYYY-MM-DD)',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_alerts',
    description: 'List system alerts',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Alert type',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'delete_alerts',
    description: 'Delete one or more alerts. Root admins can delete any alerts; domain admins can only delete alerts from their domain; users can only delete their alerts.',
    inputSchema: {
      type: 'object',
      properties: {
        ids: {
          type: 'string',
          description: 'Comma-separated list of alert IDs to delete',
        },
        type: {
          type: 'string',
          description: 'Alert type to delete',
        },
        startdate: {
          type: 'string',
          description: 'Start date for date range deletion (YYYY-MM-DD). Requires enddate.',
        },
        enddate: {
          type: 'string',
          description: 'End date for date range deletion (YYYY-MM-DD). Can be used alone to delete alerts older than this date.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'archive_alerts',
    description: 'Archive one or more alerts. Archived alerts are removed from the active alert list but preserved for historical reference.',
    inputSchema: {
      type: 'object',
      properties: {
        ids: {
          type: 'string',
          description: 'Comma-separated list of alert IDs to archive',
        },
        type: {
          type: 'string',
          description: 'Alert type to archive',
        },
        startdate: {
          type: 'string',
          description: 'Start date for date range archival (YYYY-MM-DD). Requires enddate.',
        },
        enddate: {
          type: 'string',
          description: 'End date for date range archival (YYYY-MM-DD). Can be used alone to archive alerts older than this date.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_capacity',
    description: 'List system capacity information',
    inputSchema: {
      type: 'object',
      properties: {
        zoneid: {
          type: 'string',
          description: 'Zone ID to filter capacity',
        },
        type: {
          type: 'number',
          description: 'Capacity type (0=Memory, 1=CPU, 2=Storage, etc.)',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_async_jobs',
    description: 'List asynchronous jobs',
    inputSchema: {
      type: 'object',
      properties: {
        jobstatus: {
          type: 'number',
          description: 'Job status (0=pending, 1=success, 2=error)',
        },
        keyword: {
          type: 'string',
          description: 'Keyword to search jobs',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_usage_records',
    description: 'List usage records for billing',
    inputSchema: {
      type: 'object',
      properties: {
        startdate: {
          type: 'string',
          description: 'Start date (YYYY-MM-DD)',
        },
        enddate: {
          type: 'string',
          description: 'End date (YYYY-MM-DD)',
        },
        type: {
          type: 'number',
          description: 'Usage type',
        },
      },
      required: ['startdate', 'enddate'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_events',
    description: 'Delete one or more events. Root admins can delete any events; domain admins can only delete events from their domain; users can only delete their events.',
    inputSchema: {
      type: 'object',
      properties: {
        ids: {
          type: 'string',
          description: 'Comma-separated list of event IDs to delete',
        },
        type: {
          type: 'string',
          description: 'Event type to delete',
        },
        startdate: {
          type: 'string',
          description: 'Start date for date range deletion (YYYY-MM-DD). Requires enddate.',
        },
        enddate: {
          type: 'string',
          description: 'End date for date range deletion (YYYY-MM-DD). Can be used alone to delete events older than this date.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'archive_events',
    description: 'Archive one or more events. Archived events are removed from the active event list but preserved for historical reference.',
    inputSchema: {
      type: 'object',
      properties: {
        ids: {
          type: 'string',
          description: 'Comma-separated list of event IDs to archive',
        },
        type: {
          type: 'string',
          description: 'Event type to archive',
        },
        startdate: {
          type: 'string',
          description: 'Start date for date range archival (YYYY-MM-DD). Requires enddate.',
        },
        enddate: {
          type: 'string',
          description: 'End date for date range archival (YYYY-MM-DD). Can be used alone to archive events older than this date.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_event_types',
    description: 'List all available event types',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'generate_usage_records',
    description: 'Generate usage records for a time period',
    inputSchema: {
      type: 'object',
      properties: {
        startdate: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        enddate: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        domainid: { type: 'string', description: 'Domain ID' },
      },
      required: ['startdate', 'enddate'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_usage_types',
    description: 'List usage record types',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'add_annotation',
    description: 'Add an annotation to an entity',
    inputSchema: {
      type: 'object',
      properties: {
        entityid: { type: 'string', description: 'Entity ID' },
        entitytype: { type: 'string', description: 'Entity type (VM, HOST, DOMAIN, etc.)' },
        annotation: { type: 'string', description: 'Annotation text' },
      },
      required: ['entityid', 'entitytype', 'annotation'],
      additionalProperties: false,
    },
  },
  {
    name: 'remove_annotation',
    description: 'Remove an annotation',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Annotation ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_annotations',
    description: 'List annotations',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Annotation ID' },
        entityid: { type: 'string', description: 'Entity ID' },
        entitytype: { type: 'string', description: 'Entity type' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
] as const;