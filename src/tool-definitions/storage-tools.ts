export const storageTools = [
  {
    name: 'list_volumes',
    description: 'List storage volumes',
    inputSchema: {
      type: 'object',
      properties: {
        virtualmachineid: {
          type: 'string',
          description: 'VM ID to filter volumes',
        },
        zoneid: {
          type: 'string',
          description: 'Zone ID to filter volumes',
        },
        type: {
          type: 'string',
          description: 'Volume type (ROOT, DATADISK)',
          enum: ['ROOT', 'DATADISK'],
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'create_volume',
    description: 'Create a new volume',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Volume name',
        },
        diskofferingid: {
          type: 'string',
          description: 'Disk offering ID',
        },
        zoneid: {
          type: 'string',
          description: 'Zone ID',
        },
        size: {
          type: 'number',
          description: 'Volume size in GB (for custom disk offerings)',
        },
      },
      required: ['name', 'diskofferingid', 'zoneid'],
      additionalProperties: false,
    },
  },
  {
    name: 'attach_volume',
    description: 'Attach volume to virtual machine',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Volume ID',
        },
        virtualmachineid: {
          type: 'string',
          description: 'VM ID to attach to',
        },
        deviceid: {
          type: 'number',
          description: 'Device ID',
        },
      },
      required: ['id', 'virtualmachineid'],
      additionalProperties: false,
    },
  },
  {
    name: 'detach_volume',
    description: 'Detach volume from virtual machine',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Volume ID',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'resize_volume',
    description: 'Resize a volume',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Volume ID',
        },
        size: {
          type: 'number',
          description: 'New size in GB',
        },
        shrinkok: {
          type: 'boolean',
          description: 'Allow shrinking',
          default: false,
        },
      },
      required: ['id', 'size'],
      additionalProperties: false,
    },
  },
  {
    name: 'create_snapshot',
    description: 'Create a snapshot of a volume',
    inputSchema: {
      type: 'object',
      properties: {
        volumeid: {
          type: 'string',
          description: 'Volume ID to snapshot',
        },
        name: {
          type: 'string',
          description: 'Snapshot name',
        },
      },
      required: ['volumeid'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_snapshots',
    description: 'List volume snapshots',
    inputSchema: {
      type: 'object',
      properties: {
        volumeid: {
          type: 'string',
          description: 'Volume ID to filter snapshots',
        },
        intervaltype: {
          type: 'string',
          description: 'Interval type (MANUAL, HOURLY, DAILY, WEEKLY, MONTHLY)',
          enum: ['MANUAL', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY'],
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'delete_volume',
    description: 'Delete a volume',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Volume ID',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_snapshot',
    description: 'Delete a volume snapshot',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Snapshot ID',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'revert_snapshot',
    description: 'Revert a volume to a snapshot',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Snapshot ID to revert to',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_disk_offerings',
    description: 'List disk offerings',
    inputSchema: {
      type: 'object',
      properties: {
        domainid: {
          type: 'string',
          description: 'Domain ID to filter offerings',
        },
        name: {
          type: 'string',
          description: 'Disk offering name',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'update_volume',
    description: 'Update a volume',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Volume ID' },
        path: { type: 'string', description: 'Volume path' },
        storageid: { type: 'string', description: 'Storage pool ID' },
        state: { type: 'string', description: 'Volume state' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'migrate_volume',
    description: 'Migrate a volume to another storage pool',
    inputSchema: {
      type: 'object',
      properties: {
        volumeid: { type: 'string', description: 'Volume ID' },
        storageid: { type: 'string', description: 'Target storage pool ID' },
        livemigrate: { type: 'boolean', description: 'Live migrate the volume' },
      },
      required: ['volumeid', 'storageid'],
      additionalProperties: false,
    },
  },
  {
    name: 'extract_volume',
    description: 'Extract a volume for download',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Volume ID' },
        mode: { type: 'string', description: 'Extraction mode (HTTP_DOWNLOAD, FTP_UPLOAD)' },
        zoneid: { type: 'string', description: 'Zone ID' },
        url: { type: 'string', description: 'Upload URL (for FTP_UPLOAD mode)' },
      },
      required: ['id', 'mode', 'zoneid'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_image_stores',
    description: 'List image stores (secondary storage)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Image store ID' },
        zoneid: { type: 'string', description: 'Zone ID' },
        name: { type: 'string', description: 'Image store name' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'create_snapshot_policy',
    description: 'Create a recurring snapshot policy for a volume',
    inputSchema: {
      type: 'object',
      properties: {
        volumeid: { type: 'string', description: 'Volume ID' },
        intervaltype: { type: 'string', description: 'Interval type (HOURLY, DAILY, WEEKLY, MONTHLY)' },
        maxsnaps: { type: 'number', description: 'Maximum snapshots to retain' },
        schedule: { type: 'string', description: 'Cron-style schedule' },
        timezone: { type: 'string', description: 'Timezone (e.g., UTC)' },
      },
      required: ['volumeid', 'intervaltype', 'maxsnaps', 'schedule', 'timezone'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_snapshot_policy',
    description: 'Delete a snapshot policy',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Snapshot policy ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_snapshot_policies',
    description: 'List snapshot policies for a volume',
    inputSchema: {
      type: 'object',
      properties: {
        volumeid: { type: 'string', description: 'Volume ID' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      required: ['volumeid'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_snapshot_policy',
    description: 'Update a snapshot policy',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Snapshot policy ID' },
        maxsnaps: { type: 'number', description: 'Maximum snapshots' },
        schedule: { type: 'string', description: 'Schedule' },
        timezone: { type: 'string', description: 'Timezone' },
        intervaltype: { type: 'string', description: 'Interval type' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
] as const;