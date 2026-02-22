export const kubernetesTools = [
  {
    name: 'create_kubernetes_cluster',
    description: 'Create a new Kubernetes cluster',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the Kubernetes cluster',
        },
        description: {
          type: 'string',
          description: 'Description of the Kubernetes cluster',
        },
        zoneid: {
          type: 'string',
          description: 'Zone ID where the cluster will be created',
        },
        kubernetesversionid: {
          type: 'string',
          description: 'Kubernetes version ID to use for the cluster',
        },
        serviceofferingid: {
          type: 'string',
          description: 'Service offering ID for cluster nodes',
        },
        size: {
          type: 'number',
          description: 'Number of worker nodes (control plane is always 1)',
          default: 1,
        },
        networkid: {
          type: 'string',
          description: 'Network ID for the cluster (optional for isolated network)',
        },
        masternodes: {
          type: 'number',
          description: 'Number of master/control plane nodes (default: 1)',
        },
        externalloadbalanceripaddress: {
          type: 'string',
          description: 'External load balancer IP for control plane',
        },
        controlnodes: {
          type: 'number',
          description: 'Number of control plane nodes (HA clusters)',
        },
        keypair: {
          type: 'string',
          description: 'SSH key pair name for node access',
        },
        account: {
          type: 'string',
          description: 'Account name for the cluster',
        },
        domainid: {
          type: 'string',
          description: 'Domain ID for the cluster',
        },
      },
      required: ['name', 'zoneid', 'kubernetesversionid', 'serviceofferingid'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_kubernetes_clusters',
    description: 'List all Kubernetes clusters',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Cluster ID to filter',
        },
        name: {
          type: 'string',
          description: 'Cluster name to filter',
        },
        state: {
          type: 'string',
          description: 'Cluster state (Created, Starting, Running, Stopped, Stopping, Destroyed, Error)',
        },
        zoneid: {
          type: 'string',
          description: 'Zone ID to filter clusters',
        },
        account: {
          type: 'string',
          description: 'Account name to filter clusters',
        },
        domainid: {
          type: 'string',
          description: 'Domain ID to filter clusters',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'get_kubernetes_cluster',
    description: 'Get details of a specific Kubernetes cluster',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Cluster ID',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'start_kubernetes_cluster',
    description: 'Start a stopped Kubernetes cluster',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Cluster ID to start',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'stop_kubernetes_cluster',
    description: 'Stop a running Kubernetes cluster',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Cluster ID to stop',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_kubernetes_cluster',
    description: 'Delete a Kubernetes cluster',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Cluster ID to delete',
        },
        cleanup: {
          type: 'boolean',
          description: 'Cleanup all cluster resources',
          default: true,
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'scale_kubernetes_cluster',
    description: 'Scale a Kubernetes cluster by adding or removing worker nodes',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Cluster ID to scale',
        },
        size: {
          type: 'number',
          description: 'New total number of worker nodes (not including control plane)',
        },
        serviceofferingid: {
          type: 'string',
          description: 'Service offering ID for new nodes (optional)',
        },
        nodesids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Node IDs to remove (for scale-down operations)',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'upgrade_kubernetes_cluster',
    description: 'Upgrade a Kubernetes cluster to a new version',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Cluster ID to upgrade',
        },
        kubernetesversionid: {
          type: 'string',
          description: 'Target Kubernetes version ID',
        },
      },
      required: ['id', 'kubernetesversionid'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_kubernetes_cluster_config',
    description: 'Get kubeconfig for accessing the Kubernetes cluster',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Cluster ID',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_kubernetes_supported_versions',
    description: 'List all supported Kubernetes versions',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Kubernetes version ID to filter',
        },
        zoneid: {
          type: 'string',
          description: 'Zone ID to filter versions',
        },
        minimumkubernetesversionid: {
          type: 'string',
          description: 'Minimum version ID for upgrade paths',
        },
      },
      additionalProperties: false,
    },
  },
] as const;
