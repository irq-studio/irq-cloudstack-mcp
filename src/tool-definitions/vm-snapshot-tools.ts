export const vmSnapshotTools = [
  {
    name: 'create_vm_snapshot',
    description: 'Create a VM snapshot (memory + disk state)',
    inputSchema: {
      type: 'object',
      properties: {
        virtualmachineid: { type: 'string', description: 'VM ID' },
        name: { type: 'string', description: 'Snapshot name' },
        description: { type: 'string', description: 'Snapshot description' },
        snapshotmemory: { type: 'boolean', description: 'Include memory state' },
        quiescevm: { type: 'boolean', description: 'Quiesce VM before snapshot' },
      },
      required: ['virtualmachineid'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_vm_snapshot',
    description: 'Delete a VM snapshot',
    inputSchema: {
      type: 'object',
      properties: {
        vmsnapshotid: { type: 'string', description: 'VM snapshot ID' },
      },
      required: ['vmsnapshotid'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_vm_snapshots',
    description: 'List VM snapshots',
    inputSchema: {
      type: 'object',
      properties: {
        virtualmachineid: { type: 'string', description: 'VM ID' },
        vmsnapshotid: { type: 'string', description: 'VM snapshot ID' },
        state: { type: 'string', description: 'Snapshot state' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'revert_to_vm_snapshot',
    description: 'Revert a VM to a previous snapshot',
    inputSchema: {
      type: 'object',
      properties: {
        vmsnapshotid: { type: 'string', description: 'VM snapshot ID' },
      },
      required: ['vmsnapshotid'],
      additionalProperties: false,
    },
  },
] as const;
