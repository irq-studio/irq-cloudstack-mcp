/**
 * Tool Registry Generator
 * Automatically generates tool handlers from definitions
 * Eliminates magic strings and manual case statements
 */

import { type ToolRegistry, createHandler } from '../tool-registry.js';
import type { ListHandlerConfig, GetHandlerConfig, ActionHandlerConfig } from './handler-factory.js';
import type { McpResponse } from '../types.js';

/**
 * Tool type enum
 */
export enum ToolType {
  LIST = 'list',
  GET = 'get',
  ACTION = 'action',
  CUSTOM = 'custom',
}

/**
 * Tool configuration that can generate a handler
 */
export interface ToolConfig {
  /** Tool name (used in MCP) */
  name: string;
  /** Tool type */
  type: ToolType;
  /** Handler configuration based on type */
  config: ListHandlerConfig<never> | GetHandlerConfig<never> | ActionHandlerConfig;
  /** Custom handler function (for ToolType.CUSTOM) */
  customHandler?: (args: Record<string, unknown>) => Promise<{ content: { type: 'text'; text: string }[] }>;
  /** Required CloudStack feature (from capabilities) */
  requiredFeature?: string;
  /** Minimum CloudStack version */
  minVersion?: string;
}

/**
 * Tool definition from schema (matches MCP tool format)
 */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
    additionalProperties?: boolean;
  };
}

/**
 * Mapping from tool name to API command
 */
export const TOOL_TO_API_MAP: Record<string, string> = {
  // Virtual Machine tools
  list_virtual_machines: 'listVirtualMachines',
  deploy_virtual_machine: 'deployVirtualMachine',
  start_virtual_machine: 'startVirtualMachine',
  stop_virtual_machine: 'stopVirtualMachine',
  reboot_virtual_machine: 'rebootVirtualMachine',
  destroy_virtual_machine: 'destroyVirtualMachine',
  recover_virtual_machine: 'recoverVirtualMachine',

  // Network tools
  list_networks: 'listNetworks',
  create_network: 'createNetwork',
  delete_network: 'deleteNetwork',
  list_public_ip_addresses: 'listPublicIpAddresses',
  associate_ip_address: 'associateIpAddress',
  disassociate_ip_address: 'disassociateIpAddress',

  // Storage tools
  list_volumes: 'listVolumes',
  create_volume: 'createVolume',
  attach_volume: 'attachVolume',
  detach_volume: 'detachVolume',
  delete_volume: 'deleteVolume',
  resize_volume: 'resizeVolume',
  list_snapshots: 'listSnapshots',
  create_snapshot: 'createSnapshot',
  delete_snapshot: 'deleteSnapshot',
  revert_snapshot: 'revertSnapshot',
  list_disk_offerings: 'listDiskOfferings',

  // Kubernetes tools
  list_kubernetes_clusters: 'listKubernetesClusters',
  create_kubernetes_cluster: 'createKubernetesCluster',
  delete_kubernetes_cluster: 'deleteKubernetesCluster',
  start_kubernetes_cluster: 'startKubernetesCluster',
  stop_kubernetes_cluster: 'stopKubernetesCluster',
  scale_kubernetes_cluster: 'scaleKubernetesCluster',
  upgrade_kubernetes_cluster: 'upgradeKubernetesCluster',
  get_kubernetes_cluster_config: 'getKubernetesClusterConfig',
  list_kubernetes_versions: 'listKubernetesSupportedVersions',

  // Admin tools
  list_zones: 'listZones',
  list_templates: 'listTemplates',
  list_service_offerings: 'listServiceOfferings',
  list_network_offerings: 'listNetworkOfferings',
  list_hosts: 'listHosts',
  list_clusters: 'listClusters',
  list_storage_pools: 'listStoragePools',
  list_accounts: 'listAccounts',
  list_users: 'listUsers',
  list_domains: 'listDomains',
  list_system_vms: 'listSystemVms',
  get_cloudstack_capabilities: 'listCapabilities',

  // Security tools
  list_security_groups: 'listSecurityGroups',
  create_security_group: 'createSecurityGroup',
  delete_security_group: 'deleteSecurityGroup',
  authorize_security_group_ingress: 'authorizeSecurityGroupIngress',
  authorize_security_group_egress: 'authorizeSecurityGroupEgress',
  revoke_security_group_ingress: 'revokeSecurityGroupIngress',
  revoke_security_group_egress: 'revokeSecurityGroupEgress',
  list_ssh_key_pairs: 'listSSHKeyPairs',
  create_ssh_key_pair: 'createSSHKeyPair',
  delete_ssh_key_pair: 'deleteSSHKeyPair',
  register_ssh_key_pair: 'registerSSHKeyPair',

  // Firewall/NAT tools
  list_firewall_rules: 'listFirewallRules',
  create_firewall_rule: 'createFirewallRule',
  delete_firewall_rule: 'deleteFirewallRule',
  list_port_forwarding_rules: 'listPortForwardingRules',
  create_port_forwarding_rule: 'createPortForwardingRule',
  delete_port_forwarding_rule: 'deletePortForwardingRule',
  enable_static_nat: 'enableStaticNat',
  disable_static_nat: 'disableStaticNat',
  list_load_balancer_rules: 'listLoadBalancerRules',
  create_load_balancer_rule: 'createLoadBalancerRule',
  delete_load_balancer_rule: 'deleteLoadBalancerRule',

  // VPC tools
  list_vpcs: 'listVPCs',
  create_vpc: 'createVPC',
  delete_vpc: 'deleteVPC',
  restart_vpc: 'restartVPC',

  // Router tools
  list_routers: 'listRouters',
  start_router: 'startRouter',
  stop_router: 'stopRouter',
  reboot_router: 'rebootRouter',
  destroy_router: 'destroyRouter',

  // Monitoring tools
  list_events: 'listEvents',
  list_alerts: 'listAlerts',
  delete_events: 'deleteEvents',
  delete_alerts: 'deleteAlerts',
  archive_events: 'archiveEvents',
  archive_alerts: 'archiveAlerts',

  // Job tools
  query_async_job_result: 'queryAsyncJobResult',
  list_async_jobs: 'listAsyncJobs',

  // Tag tools
  list_tags: 'listTags',
  create_tags: 'createTags',
  delete_tags: 'deleteTags',

  // NIC tools
  list_nics: 'listNics',
  add_nic_to_vm: 'addNicToVirtualMachine',
  remove_nic_from_vm: 'removeNicFromVirtualMachine',
  update_default_nic: 'updateDefaultNicForVirtualMachine',

  // Affinity Group tools
  list_affinity_groups: 'listAffinityGroups',
  create_affinity_group: 'createAffinityGroup',
  delete_affinity_group: 'deleteAffinityGroup',
  update_vm_affinity_group: 'updateVMAffinityGroup',
  list_affinity_group_types: 'listAffinityGroupTypes',

  // Template tools
  list_isos: 'listIsos',
  register_template: 'registerTemplate',
  register_iso: 'registerIso',
  delete_template: 'deleteTemplate',
  delete_iso: 'deleteIso',
  copy_template: 'copyTemplate',
  copy_iso: 'copyIso',
  update_template: 'updateTemplate',
  update_iso: 'updateIso',
  extract_template: 'extractTemplate',
  extract_iso: 'extractIso',
  list_os_types: 'listOsTypes',
};

/**
 * Convert tool name to API command
 */
export function toolNameToApiCommand(toolName: string): string {
  return TOOL_TO_API_MAP[toolName] || toolName;
}

/**
 * Convert API command to tool name
 */
export function apiCommandToToolName(apiCommand: string): string | undefined {
  for (const [tool, api] of Object.entries(TOOL_TO_API_MAP)) {
    if (api === apiCommand) {
      return tool;
    }
  }
  return undefined;
}

/** Handler function type */
export type ToolHandlerFn = (args: Record<string, unknown>) => Promise<McpResponse>;

/**
 * Generate handler wrapper that maps tool args to API params
 * Provides a hook point for logging, metrics, or transformations
 */
export function createToolHandler(
  handler: ToolHandlerFn
): ToolHandlerFn {
  return async (args: Record<string, unknown>) => {
    return handler(args);
  };
}

/**
 * Auto-register tools from definitions array
 */
export function autoRegisterTools(
  registry: ToolRegistry,
  toolDefinitions: ToolDefinition[],
  handlers: Record<string, (args: Record<string, unknown>) => Promise<McpResponse>>
): { registered: string[]; skipped: string[] } {
  const registered: string[] = [];
  const skipped: string[] = [];

  for (const def of toolDefinitions) {
    const handlerFn = handlers[def.name];
    if (handlerFn) {
      // Wrap the function in a ToolHandler using the registry's createHandler
      registry.register(def.name, createHandler(handlerFn));
      registered.push(def.name);
    } else {
      skipped.push(def.name);
    }
  }

  return { registered, skipped };
}

/**
 * Validate that all tool definitions have handlers
 */
export function validateToolCoverage(
  toolDefinitions: ToolDefinition[],
  handlers: Record<string, unknown>
): { covered: string[]; missing: string[]; extra: string[] } {
  const definedTools = new Set(toolDefinitions.map((t) => t.name));
  const handlerTools = new Set(Object.keys(handlers));

  const covered = [...definedTools].filter((t) => handlerTools.has(t));
  const missing = [...definedTools].filter((t) => !handlerTools.has(t));
  const extra = [...handlerTools].filter((t) => !definedTools.has(t));

  return { covered, missing, extra };
}
