export const templateTools = [
  {
    name: 'register_template',
    description: 'Register a new template from a URL',
    inputSchema: {
      type: 'object',
      properties: {
        displaytext: {
          type: 'string',
          description: 'Template display text',
        },
        name: {
          type: 'string',
          description: 'Template name',
        },
        ostypeid: {
          type: 'string',
          description: 'OS type ID',
        },
        url: {
          type: 'string',
          description: 'URL of the template',
        },
        zoneid: {
          type: 'string',
          description: 'Zone ID',
        },
        hypervisor: {
          type: 'string',
          description: 'Hypervisor (KVM, VMware, XenServer, etc.)',
        },
        format: {
          type: 'string',
          description: 'Template format (QCOW2, RAW, VHD, OVA)',
        },
        ispublic: {
          type: 'boolean',
          description: 'Make template public',
          default: false,
        },
        isfeatured: {
          type: 'boolean',
          description: 'Make template featured',
          default: false,
        },
        isextractable: {
          type: 'boolean',
          description: 'Allow template extraction',
          default: false,
        },
        passwordenabled: {
          type: 'boolean',
          description: 'Template supports password reset',
          default: false,
        },
      },
      required: ['displaytext', 'name', 'ostypeid', 'url', 'zoneid', 'hypervisor', 'format'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_template',
    description: 'Delete a template',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Template ID',
        },
        zoneid: {
          type: 'string',
          description: 'Zone ID (optional, deletes from all zones if not specified)',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_template',
    description: 'Update template properties',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Template ID',
        },
        name: {
          type: 'string',
          description: 'New template name',
        },
        displaytext: {
          type: 'string',
          description: 'New display text',
        },
        format: {
          type: 'string',
          description: 'Template format',
        },
        ostypeid: {
          type: 'string',
          description: 'OS type ID',
        },
        passwordenabled: {
          type: 'boolean',
          description: 'Template supports password reset',
        },
        bootable: {
          type: 'boolean',
          description: 'Template is bootable',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'copy_template',
    description: 'Copy a template from one zone to another',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Template ID',
        },
        sourcezoneid: {
          type: 'string',
          description: 'Source zone ID',
        },
        destzoneid: {
          type: 'string',
          description: 'Destination zone ID',
        },
      },
      required: ['id', 'sourcezoneid', 'destzoneid'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_isos',
    description: 'List ISOs',
    inputSchema: {
      type: 'object',
      properties: {
        isofilter: {
          type: 'string',
          description: 'ISO filter (featured, self, selfexecutable, sharedexecutable, executable, community)',
          default: 'featured',
        },
        zoneid: {
          type: 'string',
          description: 'Zone ID to filter ISOs',
        },
        bootable: {
          type: 'boolean',
          description: 'Filter by bootable ISOs',
        },
        ispublic: {
          type: 'boolean',
          description: 'Filter by public ISOs',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'register_iso',
    description: 'Register a new ISO from a URL',
    inputSchema: {
      type: 'object',
      properties: {
        displaytext: {
          type: 'string',
          description: 'ISO display text',
        },
        name: {
          type: 'string',
          description: 'ISO name',
        },
        url: {
          type: 'string',
          description: 'URL of the ISO',
        },
        zoneid: {
          type: 'string',
          description: 'Zone ID',
        },
        ostypeid: {
          type: 'string',
          description: 'OS type ID',
        },
        bootable: {
          type: 'boolean',
          description: 'ISO is bootable',
          default: true,
        },
        ispublic: {
          type: 'boolean',
          description: 'Make ISO public',
          default: false,
        },
        isfeatured: {
          type: 'boolean',
          description: 'Make ISO featured',
          default: false,
        },
      },
      required: ['displaytext', 'name', 'url', 'zoneid'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_iso',
    description: 'Delete an ISO',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ISO ID',
        },
        zoneid: {
          type: 'string',
          description: 'Zone ID (optional, deletes from all zones if not specified)',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'attach_iso',
    description: 'Attach an ISO to a virtual machine',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ISO ID',
        },
        virtualmachineid: {
          type: 'string',
          description: 'VM ID to attach ISO to',
        },
      },
      required: ['id', 'virtualmachineid'],
      additionalProperties: false,
    },
  },
  {
    name: 'detach_iso',
    description: 'Detach an ISO from a virtual machine',
    inputSchema: {
      type: 'object',
      properties: {
        virtualmachineid: {
          type: 'string',
          description: 'VM ID to detach ISO from',
        },
      },
      required: ['virtualmachineid'],
      additionalProperties: false,
    },
  },
  {
    name: 'extract_template',
    description: 'Extract a template for download',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Template ID' },
        mode: { type: 'string', description: 'Extraction mode (HTTP_DOWNLOAD, FTP_UPLOAD)' },
        zoneid: { type: 'string', description: 'Zone ID' },
        url: { type: 'string', description: 'Upload URL (for FTP_UPLOAD mode)' },
      },
      required: ['id', 'mode'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_template_permissions',
    description: 'Update template sharing permissions',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Template ID' },
        accounts: { type: 'string', description: 'Comma-separated account names' },
        isextractable: { type: 'boolean', description: 'Whether template is extractable' },
        isfeatured: { type: 'boolean', description: 'Whether template is featured' },
        ispublic: { type: 'boolean', description: 'Whether template is public' },
        op: { type: 'string', description: 'Permission operation (add, remove, reset)' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_template_permissions',
    description: 'List template sharing permissions',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Template ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
] as const;
