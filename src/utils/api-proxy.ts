/**
 * CloudStack API Proxy
 * Eliminates the need for 50+ individual wrapper methods
 * Provides type-safe API calls via Proxy
 */

import type { CloudStackClient, CloudStackParams } from '../cloudstack-client.js';

/**
 * API method metadata for validation and documentation
 */
export interface ApiMethodMeta {
  /** Required parameters */
  required?: string[];
  /** Whether this is an async job */
  async?: boolean;
  /** Minimum CloudStack version */
  minVersion?: string;
  /** Description */
  description?: string;
}

/**
 * Known CloudStack API methods with metadata
 */
export const API_METHODS: Record<string, ApiMethodMeta> = {
  // Virtual Machine APIs
  listVirtualMachines: { description: 'List virtual machines' },
  deployVirtualMachine: { required: ['serviceofferingid', 'templateid', 'zoneid'], async: true },
  startVirtualMachine: { required: ['id'], async: true },
  stopVirtualMachine: { required: ['id'], async: true },
  rebootVirtualMachine: { required: ['id'], async: true },
  destroyVirtualMachine: { required: ['id'], async: true },
  recoverVirtualMachine: { required: ['id'] },

  // Network APIs
  listNetworks: { description: 'List networks' },
  createNetwork: { required: ['name', 'displaytext', 'networkofferingid', 'zoneid'] },
  deleteNetwork: { required: ['id'], async: true },
  listPublicIpAddresses: { description: 'List public IP addresses' },
  associateIpAddress: { async: true },
  disassociateIpAddress: { required: ['id'], async: true },

  // Storage APIs
  listVolumes: { description: 'List volumes' },
  createVolume: { required: ['name'], async: true },
  attachVolume: { required: ['id', 'virtualmachineid'], async: true },
  detachVolume: { required: ['id'], async: true },
  deleteVolume: { required: ['id'] },
  resizeVolume: { required: ['id'], async: true },
  listSnapshots: { description: 'List snapshots' },
  createSnapshot: { required: ['volumeid'], async: true },
  deleteSnapshot: { required: ['id'], async: true },
  revertSnapshot: { required: ['id'], async: true },

  // Kubernetes APIs
  listKubernetesClusters: { description: 'List Kubernetes clusters' },
  createKubernetesCluster: { required: ['name', 'zoneid', 'kubernetesversionid', 'serviceofferingid', 'size'], async: true },
  deleteKubernetesCluster: { required: ['id'], async: true },
  startKubernetesCluster: { required: ['id'], async: true },
  stopKubernetesCluster: { required: ['id'], async: true },
  scaleKubernetesCluster: { required: ['id'], async: true },
  upgradeKubernetesCluster: { required: ['id', 'kubernetesversionid'], async: true },
  getKubernetesClusterConfig: { required: ['id'] },
  listKubernetesSupportedVersions: { description: 'List supported Kubernetes versions' },

  // Admin APIs
  listZones: { description: 'List zones' },
  listTemplates: { required: ['templatefilter'] },
  listServiceOfferings: { description: 'List service offerings' },
  listDiskOfferings: { description: 'List disk offerings' },
  listNetworkOfferings: { description: 'List network offerings' },
  listHosts: { description: 'List hosts' },
  listClusters: { description: 'List clusters' },
  listStoragePools: { description: 'List storage pools' },
  listAccounts: { description: 'List accounts' },
  listUsers: { description: 'List users' },
  listDomains: { description: 'List domains' },
  listSystemVms: { description: 'List system VMs' },
  listCapabilities: { description: 'List CloudStack capabilities' },

  // Security APIs
  listSecurityGroups: { description: 'List security groups' },
  createSecurityGroup: { required: ['name'] },
  deleteSecurityGroup: { required: ['id'] },
  authorizeSecurityGroupIngress: { async: true },
  authorizeSecurityGroupEgress: { async: true },
  revokeSecurityGroupIngress: { required: ['id'], async: true },
  revokeSecurityGroupEgress: { required: ['id'], async: true },
  listSSHKeyPairs: { description: 'List SSH key pairs' },
  createSSHKeyPair: { required: ['name'] },
  deleteSSHKeyPair: { required: ['name'] },
  registerSSHKeyPair: { required: ['name', 'publickey'] },

  // Firewall/NAT APIs
  listFirewallRules: { description: 'List firewall rules' },
  createFirewallRule: { required: ['ipaddressid', 'protocol'], async: true },
  deleteFirewallRule: { required: ['id'], async: true },
  listPortForwardingRules: { description: 'List port forwarding rules' },
  createPortForwardingRule: { required: ['ipaddressid', 'privateport', 'publicport', 'protocol', 'virtualmachineid'], async: true },
  deletePortForwardingRule: { required: ['id'], async: true },
  enableStaticNat: { required: ['ipaddressid', 'virtualmachineid'] },
  disableStaticNat: { required: ['ipaddressid'], async: true },
  listLoadBalancerRules: { description: 'List load balancer rules' },
  createLoadBalancerRule: { required: ['algorithm', 'name', 'privateport', 'publicipid', 'publicport'], async: true },
  deleteLoadBalancerRule: { required: ['id'], async: true },

  // VPC APIs
  listVPCs: { description: 'List VPCs' },
  createVPC: { required: ['name', 'displaytext', 'cidr', 'vpcofferingid', 'zoneid'], async: true },
  deleteVPC: { required: ['id'], async: true },
  restartVPC: { required: ['id'], async: true },

  // Router APIs
  listRouters: { description: 'List virtual routers' },
  startRouter: { required: ['id'], async: true },
  stopRouter: { required: ['id'], async: true },
  rebootRouter: { required: ['id'], async: true },
  destroyRouter: { required: ['id'], async: true },

  // Event/Alert APIs
  listEvents: { description: 'List events' },
  listAlerts: { description: 'List alerts' },
  deleteEvents: { async: true },
  deleteAlerts: { async: true },
  archiveEvents: { async: true },
  archiveAlerts: { async: true },

  // Async Job APIs
  queryAsyncJobResult: { required: ['jobid'] },
  listAsyncJobs: { description: 'List async jobs' },

  // Tag APIs
  listTags: { description: 'List tags' },
  createTags: { required: ['resourceids', 'resourcetype', 'tags'] },
  deleteTags: { required: ['resourceids', 'resourcetype'] },

  // NIC APIs
  listNics: { required: ['virtualmachineid'] },
  addNicToVirtualMachine: { required: ['networkid', 'virtualmachineid'], async: true },
  removeNicFromVirtualMachine: { required: ['nicid', 'virtualmachineid'], async: true },
  updateDefaultNicForVirtualMachine: { required: ['nicid', 'virtualmachineid'], async: true },

  // Affinity Group APIs
  listAffinityGroups: { description: 'List affinity groups' },
  createAffinityGroup: { required: ['name', 'type'] },
  deleteAffinityGroup: { required: ['id'], async: true },
  updateVMAffinityGroup: { required: ['id'], async: true },
  listAffinityGroupTypes: { description: 'List affinity group types' },

  // Template APIs
  listIsos: { description: 'List ISOs' },
  registerTemplate: { required: ['displaytext', 'format', 'hypervisor', 'name', 'ostypeid', 'url', 'zoneid'] },
  registerIso: { required: ['displaytext', 'name', 'url', 'zoneid'] },
  deleteTemplate: { required: ['id'], async: true },
  deleteIso: { required: ['id'], async: true },
  copyTemplate: { required: ['id', 'destzoneid'], async: true },
  copyIso: { required: ['id', 'destzoneid'], async: true },
  updateTemplate: { required: ['id'] },
  updateIso: { required: ['id'] },
  extractTemplate: { required: ['id', 'mode'], async: true },
  extractIso: { required: ['id', 'mode'], async: true },
  listOsTypes: { description: 'List OS types' },
};

/**
 * Type for the API proxy
 */
export type CloudStackApiProxy = {
  [K in keyof typeof API_METHODS]: <T = unknown>(params?: CloudStackParams) => Promise<T>;
};

/**
 * Create a proxy for CloudStack API calls
 * Usage: api.listVirtualMachines({ zoneid: 'zone-1' })
 */
export function createApiProxy(client: CloudStackClient): CloudStackApiProxy {
  return new Proxy({} as CloudStackApiProxy, {
    get(_target, prop: string) {
      // Return a function that calls the API
      return async <T = unknown>(params: CloudStackParams = {}): Promise<T> => {
        const meta = API_METHODS[prop];

        // Validate required parameters
        if (meta?.required) {
          for (const field of meta.required) {
            if (params[field] === undefined || params[field] === null || params[field] === '') {
              throw new Error(`Required parameter '${field}' missing for ${prop}`);
            }
          }
        }

        return client.request<T>(prop, params);
      };
    },
  });
}

/**
 * Get API method metadata
 */
export function getApiMethodMeta(method: string): ApiMethodMeta | undefined {
  return API_METHODS[method];
}

/**
 * Check if a method is a known CloudStack API
 */
export function isKnownApiMethod(method: string): boolean {
  return method in API_METHODS;
}

/**
 * Get all known API methods
 */
export function getAllApiMethods(): string[] {
  return Object.keys(API_METHODS);
}

/**
 * Get async API methods (those that return job IDs)
 */
export function getAsyncApiMethods(): string[] {
  return Object.entries(API_METHODS)
    .filter(([, meta]) => meta.async)
    .map(([name]) => name);
}
