export const backupTools = [
  {
    name: 'create_backup_schedule',
    description: 'Create a backup schedule for a VM',
    inputSchema: {
      type: 'object',
      properties: {
        virtualmachineid: { type: 'string', description: 'VM ID' },
        intervaltype: { type: 'string', description: 'Interval type (HOURLY, DAILY, WEEKLY, MONTHLY)' },
        schedule: { type: 'string', description: 'Schedule (e.g., "00:30" for daily)' },
        timezone: { type: 'string', description: 'Timezone (e.g., UTC)' },
      },
      required: ['virtualmachineid', 'intervaltype', 'schedule', 'timezone'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_backup_schedule',
    description: 'Delete a backup schedule for a VM',
    inputSchema: {
      type: 'object',
      properties: {
        virtualmachineid: { type: 'string', description: 'VM ID' },
      },
      required: ['virtualmachineid'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_backup_provider_offerings',
    description: 'List backup provider offerings in a zone',
    inputSchema: {
      type: 'object',
      properties: {
        zoneid: { type: 'string', description: 'Zone ID' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      required: ['zoneid'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_backup_offerings',
    description: 'List imported backup offerings',
    inputSchema: {
      type: 'object',
      properties: {
        zoneid: { type: 'string', description: 'Zone ID' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'import_backup_offering',
    description: 'Import a backup offering from a backup provider',
    inputSchema: {
      type: 'object',
      properties: {
        zoneid: { type: 'string', description: 'Zone ID' },
        externalid: { type: 'string', description: 'External ID from backup provider' },
        name: { type: 'string', description: 'Offering name' },
        description: { type: 'string', description: 'Offering description' },
      },
      required: ['zoneid', 'externalid', 'name', 'description'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_backup_offering',
    description: 'Delete a backup offering',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Backup offering ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'assign_virtual_machine_to_backup_offering',
    description: 'Assign a VM to a backup offering',
    inputSchema: {
      type: 'object',
      properties: {
        virtualmachineid: { type: 'string', description: 'VM ID' },
        backupofferingid: { type: 'string', description: 'Backup offering ID' },
      },
      required: ['virtualmachineid', 'backupofferingid'],
      additionalProperties: false,
    },
  },
  {
    name: 'remove_virtual_machine_from_backup_offering',
    description: 'Remove a VM from a backup offering',
    inputSchema: {
      type: 'object',
      properties: {
        virtualmachineid: { type: 'string', description: 'VM ID' },
      },
      required: ['virtualmachineid'],
      additionalProperties: false,
    },
  },
  {
    name: 'create_backup',
    description: 'Create a backup for a VM',
    inputSchema: {
      type: 'object',
      properties: {
        virtualmachineid: { type: 'string', description: 'VM ID' },
      },
      required: ['virtualmachineid'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_backup',
    description: 'Delete a backup',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Backup ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_backups',
    description: 'List backups',
    inputSchema: {
      type: 'object',
      properties: {
        virtualmachineid: { type: 'string', description: 'VM ID' },
        id: { type: 'string', description: 'Backup ID' },
        zoneid: { type: 'string', description: 'Zone ID' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'restore_backup',
    description: 'Restore a VM from a backup',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Backup ID' },
        virtualmachineid: { type: 'string', description: 'VM ID to restore to' },
      },
      required: ['id', 'virtualmachineid'],
      additionalProperties: false,
    },
  },
] as const;
