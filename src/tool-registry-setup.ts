/**
 * Tool Registry Setup
 *
 * This module configures the tool registry with all handler mappings.
 * Each handler class method is registered to its corresponding tool name.
 */

import type { ToolRegistry} from './tool-registry.js';
import { createHandler } from './tool-registry.js';
import type { VirtualMachineHandlers } from './handlers/virtual-machine-handlers.js';
import type { StorageHandlers } from './handlers/storage-handlers.js';
import type { NetworkCoreHandlers } from './handlers/network/core-handlers.js';
import type { NetworkRulesHandlers } from './handlers/network/rules-handlers.js';
import type { NetworkRouterHandlers } from './handlers/network/router-handlers.js';
import type { NetworkNicHandlers } from './handlers/network/nic-handlers.js';
import type { KubernetesHandlers } from './handlers/kubernetes-handlers.js';
import type { MonitoringHandlers } from './handlers/monitoring-handlers.js';
import type { AdminHandlers } from './handlers/index.js';
import type { SecurityHandlers } from './handlers/security-handlers.js';
import type { TemplateHandlers } from './handlers/template-handlers.js';
import type { JobHandlers } from './handlers/job-handlers.js';
import type { TagHandlers } from './handlers/tag-handlers.js';
import type { AffinityHandlers } from './handlers/affinity-handlers.js';
import type { VpnHandlers } from './handlers/vpn-handlers.js';
import type { ProjectHandlers } from './handlers/project-handlers.js';
import type { AclHandlers } from './handlers/network/acl-handlers.js';
import type { VmSnapshotHandlers } from './handlers/vm-snapshot-handlers.js';
import type { AutoScaleHandlers } from './handlers/autoscale-handlers.js';
import type { BackupHandlers } from './handlers/backup-handlers.js';
import type { RoleHandlers } from './handlers/role-handlers.js';
import type {
  DeleteEventsArgs,
  ArchiveEventsArgs,
  DeleteAlertsArgs,
  ArchiveAlertsArgs,
} from './types/monitoring-arg-types.js';
import type {
  // Virtual Machine Types
  ListVirtualMachinesArgs,

  StartVirtualMachineArgs,
  StopVirtualMachineArgs,
  RebootVirtualMachineArgs,
  DestroyVirtualMachineArgs,
  DeployVirtualMachineArgs,

  MigrateVirtualMachineArgs,
  ResetPasswordForVirtualMachineArgs,
  ChangeServiceForVirtualMachineArgs,
  // Storage Types
  ListVolumesArgs,
  CreateVolumeArgs,
  AttachVolumeArgs,
  DetachVolumeArgs,
  ResizeVolumeArgs,
  CreateSnapshotArgs,
  ListSnapshotsArgs,
  DeleteSnapshotArgs,
  RevertSnapshotArgs,
  DeleteVolumeArgs,
  ListDiskOfferingsArgs,
  // Network Core Types
  ListNetworksArgs,
  CreateNetworkArgs,
  DeleteNetworkArgs,
  ListPublicIPAddressesArgs,
  AssociateIPAddressArgs,
  DisassociateIPAddressArgs,
  ListVPCsArgs,
  CreateVPCArgs,
  DeleteVPCArgs,
  EnableStaticNatArgs,
  DisableStaticNatArgs,
  RestartVPCArgs,
  ListNetworkOfferingsArgs,
  CreateNetworkOfferingArgs,
  // Network Rules Types
  ListFirewallRulesArgs,
  CreateFirewallRuleArgs,
  DeleteFirewallRuleArgs,
  ListLoadBalancerRulesArgs,
  CreateLoadBalancerRuleArgs,
  DeleteLoadBalancerRuleArgs,
  AssignToLoadBalancerRuleArgs,
  RemoveFromLoadBalancerRuleArgs,
  CreatePortForwardingRuleArgs,
  DeletePortForwardingRuleArgs,
  ListPortForwardingRulesArgs,
  // Network Router Types
  ListRoutersArgs,
  StartRouterArgs,
  StopRouterArgs,
  RebootRouterArgs,
  DestroyRouterArgs,
  // Network NIC Types
  AddNicToVirtualMachineArgs,
  RemoveNicFromVirtualMachineArgs,
  UpdateDefaultNicForVirtualMachineArgs,
  ListNicsArgs,
  AddIpToNicArgs,
  RemoveIpFromNicArgs,
  // Kubernetes Types
  ListKubernetesClustersArgs,
  CreateKubernetesClusterArgs,
  DeleteKubernetesClusterArgs,
  StartKubernetesClusterArgs,
  StopKubernetesClusterArgs,
  ScaleKubernetesClusterArgs,
  GetKubernetesClusterConfigArgs,
  ListKubernetesSupportedVersionsArgs,
  UpgradeKubernetesClusterArgs,
  // Monitoring Types
  ListEventsArgs,
  ListAlertsArgs,
  ListCapacityArgs,
  ListSystemVMsArgs,
  ListAsyncJobsArgs,
  ListUsageRecordsArgs,
  // Admin Types
  ListZonesArgs,
  ListServiceOfferingsArgs,
  ListHostsArgs,
  ListClustersArgs,
  ListStoragePoolsArgs,
  ListAccountsArgs,
  ListUsersArgs,
  ListDomainsArgs,
  ListTemplatesArgs,
  // Security Types
  ListSecurityGroupsArgs,
  ListSSHKeyPairsArgs,
  CreateSSHKeyPairArgs,
  AuthorizeSecurityGroupIngressArgs,
  // Template Types
  RegisterTemplateArgs,
  DeleteTemplateArgs,
  UpdateTemplateArgs,
  CopyTemplateArgs,
  ListISOsArgs,
  RegisterISOArgs,
  DeleteISOArgs,
  AttachISOArgs,
  DetachISOArgs,
  // Job Types
  QueryAsyncJobResultArgs,
  // Tag Types
  CreateTagsArgs,
  DeleteTagsArgs,
  ListTagsArgs,
  // Affinity Types
  CreateAffinityGroupArgs,
  DeleteAffinityGroupArgs,
  ListAffinityGroupsArgs,
  // VPN Types
  CreateVpnGatewayArgs, DeleteVpnGatewayArgs, ListVpnGatewaysArgs,
  CreateVpnConnectionArgs, DeleteVpnConnectionArgs, ListVpnConnectionsArgs, ResetVpnConnectionArgs,
  CreateVpnCustomerGatewayArgs, UpdateVpnCustomerGatewayArgs, DeleteVpnCustomerGatewayArgs, ListVpnCustomerGatewaysArgs,
  CreateRemoteAccessVpnArgs, DeleteRemoteAccessVpnArgs, ListRemoteAccessVpnsArgs,
  AddVpnUserArgs, RemoveVpnUserArgs, ListVpnUsersArgs,
  // Project Types
  CreateProjectArgs, DeleteProjectArgs, UpdateProjectArgs, ListProjectsArgs,
  ActivateProjectArgs, SuspendProjectArgs, AddAccountToProjectArgs, DeleteAccountFromProjectArgs,
  ListProjectAccountsArgs, ListProjectInvitationsArgs, UpdateProjectInvitationArgs, DeleteProjectInvitationArgs,
  // ACL Types
  CreateNetworkACLArgs, DeleteNetworkACLArgs, UpdateNetworkACLItemArgs, ListNetworkACLsArgs,
  CreateNetworkACLListArgs, DeleteNetworkACLListArgs, UpdateNetworkACLListArgs, ListNetworkACLListsArgs, ReplaceNetworkACLListArgs,
  // VM Snapshot Types
  CreateVMSnapshotArgs, DeleteVMSnapshotArgs, ListVMSnapshotsArgs, RevertToVMSnapshotArgs,
  // AutoScale Types
  CreateAutoScalePolicyArgs, UpdateAutoScalePolicyArgs, DeleteAutoScalePolicyArgs, ListAutoScalePoliciesArgs,
  CreateAutoScaleVmGroupArgs, UpdateAutoScaleVmGroupArgs, DeleteAutoScaleVmGroupArgs, ListAutoScaleVmGroupsArgs,
  EnableAutoScaleVmGroupArgs, DisableAutoScaleVmGroupArgs,
  CreateAutoScaleVmProfileArgs, UpdateAutoScaleVmProfileArgs, DeleteAutoScaleVmProfileArgs, ListAutoScaleVmProfilesArgs,
  CreateConditionArgs, DeleteConditionArgs, ListConditionsArgs,
  ListCountersArgs, CreateCounterArgs, DeleteCounterArgs, UpdateCounterArgs,
  // Backup Types
  CreateBackupScheduleArgs, DeleteBackupScheduleArgs,
  ListBackupProviderOfferingsArgs, ListBackupOfferingsArgs, ImportBackupOfferingArgs, DeleteBackupOfferingArgs,
  AssignVirtualMachineToBackupOfferingArgs, RemoveVirtualMachineFromBackupOfferingArgs,
  CreateBackupArgs, DeleteBackupArgs, ListBackupsArgs, RestoreBackupArgs,
  // Role Types
  CreateRoleArgs, UpdateRoleArgs, DeleteRoleArgs, ListRolesArgs,
  CreateRolePermissionArgs, UpdateRolePermissionArgs, DeleteRolePermissionArgs, ListRolePermissionsArgs, ImportRoleArgs,
  // VM Extension Types
  RecoverVirtualMachineArgs, AssignVirtualMachineArgs, UpdateVirtualMachineArgs, RestoreVirtualMachineArgs,
  // Storage Extension Types
  UpdateVolumeArgs, MigrateVolumeArgs, ExtractVolumeArgs, ListImageStoresArgs,
  CreateSnapshotPolicyArgs, DeleteSnapshotPolicyArgs, ListSnapshotPoliciesArgs, UpdateSnapshotPolicyArgs,
  // Security Extension Types
  CreateAccountArgs, UpdateAccountArgs, DeleteAccountArgs, DisableAccountArgs, EnableAccountArgs, LockAccountArgs,
  // Network Core Extension Types
  UpdateNetworkArgs, RestartNetworkArgs, UpdateVpcArgs,
  ListVpcOfferingsArgs, CreateVpcOfferingArgs, DeleteVpcOfferingArgs, UpdateVpcOfferingArgs,
  ListSupportedNetworkServicesArgs, ListNetworkServiceProvidersArgs,
  // Network Rules Extension Types
  CreateEgressFirewallRuleArgs, ListEgressFirewallRulesArgs, DeleteEgressFirewallRuleArgs,
  UpdateLoadBalancerRuleArgs, ListLBStickinessPoliciesArgs, CreateLBStickinessPolicyArgs, DeleteLBStickinessPolicyArgs,
  // Admin Extension Types
  CreateZoneArgs, UpdateZoneArgs, DeleteZoneArgs,
  CreatePodArgs, UpdatePodArgs, DeletePodArgs, ListPodsArgs,
  AddClusterArgs, UpdateClusterArgs, DeleteClusterArgs,
  AddHostArgs, UpdateHostArgs, DeleteHostArgs, ReconnectHostArgs, PrepareHostForMaintenanceArgs, CancelHostMaintenanceArgs,
  CreateDomainArgs, UpdateDomainArgs, DeleteDomainArgs,
  CreateUserArgs, UpdateUserArgs, DeleteUserArgs, DisableUserArgs, EnableUserArgs,
  UpdateConfigurationArgs,
  StartSystemVmArgs, StopSystemVmArgs, RebootSystemVmArgs, DestroySystemVmArgs, MigrateSystemVmArgs,
  CreateConsoleEndpointArgs,
  // Template Extension Types
  ExtractTemplateArgs, UpdateTemplatePermissionsArgs, ListTemplatePermissionsArgs,
  // Monitoring Extension Types
  ListEventTypesArgs, GenerateUsageRecordsArgs, ListUsageTypesArgs,
  AddAnnotationArgs, RemoveAnnotationArgs, ListAnnotationsArgs,
  // Affinity Extension Types
  UpdateVMAffinityGroupArgs, ListAffinityGroupTypesArgs,
  // Admin list types
  ListConfigurationsArgs,
} from './handler-types.js';

export interface HandlerMap {
  vm: VirtualMachineHandlers;
  storage: StorageHandlers;
  networkCore: NetworkCoreHandlers;
  networkRules: NetworkRulesHandlers;
  networkRouter: NetworkRouterHandlers;
  networkNic: NetworkNicHandlers;
  kubernetes: KubernetesHandlers;
  monitoring: MonitoringHandlers;
  admin: AdminHandlers;
  security: SecurityHandlers;
  template: TemplateHandlers;
  job: JobHandlers;
  tag: TagHandlers;
  affinity: AffinityHandlers;
  vpn: VpnHandlers;
  project: ProjectHandlers;
  networkACL: AclHandlers;
  vmSnapshot: VmSnapshotHandlers;
  autoScale: AutoScaleHandlers;
  backup: BackupHandlers;
  role: RoleHandlers;
}

/**
 * Configure the tool registry with all handlers
 */
export function setupToolRegistry(
  registry: ToolRegistry,
  handlers: HandlerMap
): void {
  const {
    vm: vmHandlers,
    storage: storageHandlers,
    networkCore: networkCoreHandlers,
    networkRules: networkRulesHandlers,
    networkRouter: networkRouterHandlers,
    networkNic: networkNicHandlers,
    kubernetes: kubernetesHandlers,
    monitoring: monitoringHandlers,
    admin: adminHandlers,
    security: securityHandlers,
    template: templateHandlers,
    job: jobHandlers,
    tag: tagHandlers,
    affinity: affinityHandlers,
    vpn: vpnHandlers,
    project: projectHandlers,
    networkACL: networkACLHandlers,
    vmSnapshot: vmSnapshotHandlers,
    autoScale: autoScaleHandlers,
    backup: backupHandlers,
    role: roleHandlers,
  } = handlers;
  // Virtual Machine Operations
  registry.register('list_virtual_machines', createHandler((args: ListVirtualMachinesArgs) => vmHandlers.handleListVirtualMachines(args)));
  registry.register('get_virtual_machine', createHandler((args: { id: string }) => vmHandlers.handleGetVirtualMachine(args)));
  registry.register('start_virtual_machine', createHandler((args: StartVirtualMachineArgs) => vmHandlers.handleStartVirtualMachine(args)));
  registry.register('stop_virtual_machine', createHandler((args: StopVirtualMachineArgs) => vmHandlers.handleStopVirtualMachine(args)));
  registry.register('reboot_virtual_machine', createHandler((args: RebootVirtualMachineArgs) => vmHandlers.handleRebootVirtualMachine(args)));
  registry.register('destroy_virtual_machine', createHandler((args: DestroyVirtualMachineArgs) => vmHandlers.handleDestroyVirtualMachine(args)));
  registry.register('deploy_virtual_machine', createHandler((args: DeployVirtualMachineArgs) => vmHandlers.handleDeployVirtualMachine(args)));
  registry.register('scale_virtual_machine', createHandler((args: { id: string; serviceofferingid: string }) => vmHandlers.handleScaleVirtualMachine(args)));
  registry.register('migrate_virtual_machine', createHandler((args: MigrateVirtualMachineArgs) => vmHandlers.handleMigrateVirtualMachine(args)));
  registry.register('reset_password_virtual_machine', createHandler((args: ResetPasswordForVirtualMachineArgs) => vmHandlers.handleResetPasswordVirtualMachine(args)));
  registry.register('change_service_offering_virtual_machine', createHandler((args: ChangeServiceForVirtualMachineArgs) => vmHandlers.handleChangeServiceOfferingVirtualMachine(args)));
  registry.register('list_virtual_machine_metrics', createHandler((args: ListVirtualMachinesArgs) => vmHandlers.handleListVirtualMachineMetrics(args)));

  // Storage Management
  registry.register('list_volumes', createHandler((args: ListVolumesArgs) => storageHandlers.handleListVolumes(args)));
  registry.register('create_volume', createHandler((args: CreateVolumeArgs) => storageHandlers.handleCreateVolume(args)));
  registry.register('attach_volume', createHandler((args: AttachVolumeArgs) => storageHandlers.handleAttachVolume(args)));
  registry.register('detach_volume', createHandler((args: DetachVolumeArgs) => storageHandlers.handleDetachVolume(args)));
  registry.register('resize_volume', createHandler((args: ResizeVolumeArgs) => storageHandlers.handleResizeVolume(args)));
  registry.register('create_snapshot', createHandler((args: CreateSnapshotArgs) => storageHandlers.handleCreateSnapshot(args)));
  registry.register('list_snapshots', createHandler((args: ListSnapshotsArgs) => storageHandlers.handleListSnapshots(args)));
  registry.register('delete_snapshot', createHandler((args: DeleteSnapshotArgs) => storageHandlers.handleDeleteSnapshot(args)));
  registry.register('revert_snapshot', createHandler((args: RevertSnapshotArgs) => storageHandlers.handleRevertSnapshot(args)));
  registry.register('delete_volume', createHandler((args: DeleteVolumeArgs) => storageHandlers.handleDeleteVolume(args)));
  registry.register('list_disk_offerings', createHandler((args: ListDiskOfferingsArgs) => storageHandlers.handleListDiskOfferings(args)));

  // Network Core Operations
  registry.register('list_networks', createHandler((args: ListNetworksArgs) => networkCoreHandlers.handleListNetworks(args)));
  registry.register('create_network', createHandler((args: CreateNetworkArgs) => networkCoreHandlers.handleCreateNetwork(args)));
  registry.register('delete_network', createHandler((args: DeleteNetworkArgs) => networkCoreHandlers.handleDeleteNetwork(args)));
  registry.register('list_public_ip_addresses', createHandler((args: ListPublicIPAddressesArgs) => networkCoreHandlers.handleListPublicIpAddresses(args)));
  registry.register('associate_ip_address', createHandler((args: AssociateIPAddressArgs) => networkCoreHandlers.handleAssociateIpAddress(args)));
  registry.register('disassociate_ip_address', createHandler((args: DisassociateIPAddressArgs) => networkCoreHandlers.handleDisassociateIpAddress(args)));
  registry.register('list_vpcs', createHandler((args: ListVPCsArgs) => networkCoreHandlers.handleListVPCs(args)));
  registry.register('create_vpc', createHandler((args: CreateVPCArgs) => networkCoreHandlers.handleCreateVPC(args)));
  registry.register('delete_vpc', createHandler((args: DeleteVPCArgs) => networkCoreHandlers.handleDeleteVPC(args)));
  registry.register('enable_static_nat', createHandler((args: EnableStaticNatArgs) => networkCoreHandlers.handleEnableStaticNat(args)));
  registry.register('disable_static_nat', createHandler((args: DisableStaticNatArgs) => networkCoreHandlers.handleDisableStaticNat(args)));
  registry.register('restart_vpc', createHandler((args: RestartVPCArgs) => networkCoreHandlers.handleRestartVPC(args)));
  registry.register('list_network_offerings', createHandler((args: ListNetworkOfferingsArgs) => networkCoreHandlers.handleListNetworkOfferings(args)));
  registry.register('create_network_offering', createHandler((args: CreateNetworkOfferingArgs) => networkCoreHandlers.handleCreateNetworkOffering(args)));

  // Network Rules (Firewall & Load Balancer)
  registry.register('list_firewall_rules', createHandler((args: ListFirewallRulesArgs) => networkRulesHandlers.handleListFirewallRules(args)));
  registry.register('create_firewall_rule', createHandler((args: CreateFirewallRuleArgs) => networkRulesHandlers.handleCreateFirewallRule(args)));
  registry.register('delete_firewall_rule', createHandler((args: DeleteFirewallRuleArgs) => networkRulesHandlers.handleDeleteFirewallRule(args)));
  registry.register('list_load_balancer_rules', createHandler((args: ListLoadBalancerRulesArgs) => networkRulesHandlers.handleListLoadBalancerRules(args)));
  registry.register('create_load_balancer_rule', createHandler((args: CreateLoadBalancerRuleArgs) => networkRulesHandlers.handleCreateLoadBalancerRule(args)));
  registry.register('delete_load_balancer_rule', createHandler((args: DeleteLoadBalancerRuleArgs) => networkRulesHandlers.handleDeleteLoadBalancerRule(args)));
  registry.register('assign_to_load_balancer_rule', createHandler((args: AssignToLoadBalancerRuleArgs) => networkRulesHandlers.handleAssignToLoadBalancerRule(args)));
  registry.register('remove_from_load_balancer_rule', createHandler((args: RemoveFromLoadBalancerRuleArgs) => networkRulesHandlers.handleRemoveFromLoadBalancerRule(args)));
  registry.register('create_port_forwarding_rule', createHandler((args: CreatePortForwardingRuleArgs) => networkRulesHandlers.handleCreatePortForwardingRule(args)));
  registry.register('delete_port_forwarding_rule', createHandler((args: DeletePortForwardingRuleArgs) => networkRulesHandlers.handleDeletePortForwardingRule(args)));
  registry.register('list_port_forwarding_rules', createHandler((args: ListPortForwardingRulesArgs) => networkRulesHandlers.handleListPortForwardingRules(args)));

  // Network Routers
  registry.register('list_routers', createHandler((args: ListRoutersArgs) => networkRouterHandlers.handleListRouters(args)));
  registry.register('start_router', createHandler((args: StartRouterArgs) => networkRouterHandlers.handleStartRouter(args)));
  registry.register('stop_router', createHandler((args: StopRouterArgs) => networkRouterHandlers.handleStopRouter(args)));
  registry.register('reboot_router', createHandler((args: RebootRouterArgs) => networkRouterHandlers.handleRebootRouter(args)));
  registry.register('destroy_router', createHandler((args: DestroyRouterArgs) => networkRouterHandlers.handleDestroyRouter(args)));

  // Network NICs
  registry.register('add_nic_to_virtual_machine', createHandler((args: AddNicToVirtualMachineArgs) => networkNicHandlers.handleAddNicToVirtualMachine(args)));
  registry.register('remove_nic_from_virtual_machine', createHandler((args: RemoveNicFromVirtualMachineArgs) => networkNicHandlers.handleRemoveNicFromVirtualMachine(args)));
  registry.register('update_default_nic_for_virtual_machine', createHandler((args: UpdateDefaultNicForVirtualMachineArgs) => networkNicHandlers.handleUpdateDefaultNicForVirtualMachine(args)));
  registry.register('list_nics', createHandler((args: ListNicsArgs) => networkNicHandlers.handleListNics(args)));
  registry.register('add_ip_to_nic', createHandler((args: AddIpToNicArgs) => networkNicHandlers.handleAddIpToNic(args)));
  registry.register('remove_ip_from_nic', createHandler((args: RemoveIpFromNicArgs) => networkNicHandlers.handleRemoveIpFromNic(args)));

  // Kubernetes Cluster Management
  registry.register('list_kubernetes_clusters', createHandler((args: ListKubernetesClustersArgs) => kubernetesHandlers.handleListKubernetesClusters(args)));
  registry.register('create_kubernetes_cluster', createHandler((args: CreateKubernetesClusterArgs) => kubernetesHandlers.handleCreateKubernetesCluster(args)));
  registry.register('delete_kubernetes_cluster', createHandler((args: DeleteKubernetesClusterArgs) => kubernetesHandlers.handleDeleteKubernetesCluster(args)));
  registry.register('start_kubernetes_cluster', createHandler((args: StartKubernetesClusterArgs) => kubernetesHandlers.handleStartKubernetesCluster(args)));
  registry.register('stop_kubernetes_cluster', createHandler((args: StopKubernetesClusterArgs) => kubernetesHandlers.handleStopKubernetesCluster(args)));
  registry.register('scale_kubernetes_cluster', createHandler((args: ScaleKubernetesClusterArgs) => kubernetesHandlers.handleScaleKubernetesCluster(args)));
  registry.register('get_kubernetes_cluster_config', createHandler((args: GetKubernetesClusterConfigArgs) => kubernetesHandlers.handleGetKubernetesClusterConfig(args)));
  registry.register('list_kubernetes_supported_versions', createHandler((args: ListKubernetesSupportedVersionsArgs) => kubernetesHandlers.handleListKubernetesSupportedVersions(args)));
  registry.register('get_kubernetes_cluster', createHandler((args: ListKubernetesClustersArgs) => kubernetesHandlers.handleGetKubernetesCluster(args)));
  registry.register('upgrade_kubernetes_cluster', createHandler((args: UpgradeKubernetesClusterArgs) => kubernetesHandlers.handleUpgradeKubernetesCluster(args)));

  // Monitoring & Events
  registry.register('list_events', createHandler((args: ListEventsArgs) => monitoringHandlers.handleListEvents(args)));
  registry.register('delete_events', createHandler((args: DeleteEventsArgs) => monitoringHandlers.handleDeleteEvents(args)));
  registry.register('archive_events', createHandler((args: ArchiveEventsArgs) => monitoringHandlers.handleArchiveEvents(args)));
  registry.register('list_alerts', createHandler((args: ListAlertsArgs) => monitoringHandlers.handleListAlerts(args)));
  registry.register('delete_alerts', createHandler((args: DeleteAlertsArgs) => monitoringHandlers.handleDeleteAlerts(args)));
  registry.register('archive_alerts', createHandler((args: ArchiveAlertsArgs) => monitoringHandlers.handleArchiveAlerts(args)));
  registry.register('list_capacity', createHandler((args: ListCapacityArgs) => monitoringHandlers.handleListCapacity(args)));
  registry.register('list_async_jobs', createHandler((args: ListAsyncJobsArgs) => monitoringHandlers.handleListAsyncJobs(args)));
  registry.register('list_usage_records', createHandler((args: ListUsageRecordsArgs) => monitoringHandlers.handleListUsageRecords(args)));
  // Note: list_system_vms is actually in admin-handlers as handleListSystemVms
  registry.register('list_system_vms', createHandler((args: ListSystemVMsArgs) => adminHandlers.handleListSystemVms(args)));

  // Admin Operations
  registry.register('get_server_version', createHandler(() => adminHandlers.handleGetServerVersion()));
  registry.register('get_cloudstack_capabilities', createHandler(() => adminHandlers.handleGetCloudStackCapabilities()));
  registry.register('list_zones', createHandler((args: ListZonesArgs) => adminHandlers.handleListZones(args)));
  registry.register('list_service_offerings', createHandler((args: ListServiceOfferingsArgs) => adminHandlers.handleListServiceOfferings(args)));
  registry.register('list_hosts', createHandler((args: ListHostsArgs) => adminHandlers.handleListHosts(args)));
  registry.register('list_clusters', createHandler((args: ListClustersArgs) => adminHandlers.handleListClusters(args)));
  registry.register('list_storage_pools', createHandler((args: ListStoragePoolsArgs) => adminHandlers.handleListStoragePools(args)));
  registry.register('list_accounts', createHandler((args: ListAccountsArgs) => securityHandlers.handleListAccounts(args)));
  registry.register('list_users', createHandler((args: ListUsersArgs) => adminHandlers.handleListUsers(args)));
  registry.register('list_domains', createHandler((args: ListDomainsArgs) => adminHandlers.handleListDomains(args)));
  registry.register('list_templates', createHandler((args: ListTemplatesArgs) => adminHandlers.handleListTemplates(args)));

  // Security
  registry.register('list_security_groups', createHandler((args: ListSecurityGroupsArgs) => securityHandlers.handleListSecurityGroups(args)));
  registry.register('create_security_group_rule', createHandler((args: AuthorizeSecurityGroupIngressArgs) => securityHandlers.handleCreateSecurityGroupRule(args)));
  registry.register('list_ssh_key_pairs', createHandler((args: ListSSHKeyPairsArgs) => securityHandlers.handleListSSHKeyPairs(args)));
  registry.register('create_ssh_key_pair', createHandler((args: CreateSSHKeyPairArgs) => securityHandlers.handleCreateSSHKeyPair(args)));
  // Templates & ISOs
  registry.register('list_isos', createHandler((args: ListISOsArgs) => templateHandlers.handleListIsos(args)));
  registry.register('register_template', createHandler((args: RegisterTemplateArgs) => templateHandlers.handleRegisterTemplate(args)));
  registry.register('delete_template', createHandler((args: DeleteTemplateArgs) => templateHandlers.handleDeleteTemplate(args)));
  registry.register('update_template', createHandler((args: UpdateTemplateArgs) => templateHandlers.handleUpdateTemplate(args)));
  registry.register('copy_template', createHandler((args: CopyTemplateArgs) => templateHandlers.handleCopyTemplate(args)));
  registry.register('register_iso', createHandler((args: RegisterISOArgs) => templateHandlers.handleRegisterIso(args)));
  registry.register('delete_iso', createHandler((args: DeleteISOArgs) => templateHandlers.handleDeleteIso(args)));
  registry.register('attach_iso', createHandler((args: AttachISOArgs) => templateHandlers.handleAttachIso(args)));
  registry.register('detach_iso', createHandler((args: DetachISOArgs) => templateHandlers.handleDetachIso(args)));

  // Async Jobs
  registry.register('query_async_job_result', createHandler((args: QueryAsyncJobResultArgs) => jobHandlers.handleQueryAsyncJobResult(args)));

  // Tags
  registry.register('create_tags', createHandler((args: CreateTagsArgs) => tagHandlers.handleCreateTags(args)));
  registry.register('delete_tags', createHandler((args: DeleteTagsArgs) => tagHandlers.handleDeleteTags(args)));
  registry.register('list_tags', createHandler((args: ListTagsArgs) => tagHandlers.handleListTags(args)));

  // Affinity Groups
  registry.register('create_affinity_group', createHandler((args: CreateAffinityGroupArgs) => affinityHandlers.handleCreateAffinityGroup(args)));
  registry.register('delete_affinity_group', createHandler((args: DeleteAffinityGroupArgs) => affinityHandlers.handleDeleteAffinityGroup(args)));
  registry.register('list_affinity_groups', createHandler((args: ListAffinityGroupsArgs) => affinityHandlers.handleListAffinityGroups(args)));

  // VM Extensions
  registry.register('recover_virtual_machine', createHandler((args: RecoverVirtualMachineArgs) => vmHandlers.handleRecoverVirtualMachine(args)));
  registry.register('update_virtual_machine', createHandler((args: UpdateVirtualMachineArgs) => vmHandlers.handleUpdateVirtualMachine(args)));
  registry.register('assign_virtual_machine', createHandler((args: AssignVirtualMachineArgs) => vmHandlers.handleAssignVirtualMachine(args)));
  registry.register('restore_virtual_machine', createHandler((args: RestoreVirtualMachineArgs) => vmHandlers.handleRestoreVirtualMachine(args)));

  // Storage Extensions
  registry.register('update_volume', createHandler((args: UpdateVolumeArgs) => storageHandlers.handleUpdateVolume(args)));
  registry.register('migrate_volume', createHandler((args: MigrateVolumeArgs) => storageHandlers.handleMigrateVolume(args)));
  registry.register('extract_volume', createHandler((args: ExtractVolumeArgs) => storageHandlers.handleExtractVolume(args)));
  registry.register('list_image_stores', createHandler((args: ListImageStoresArgs) => storageHandlers.handleListImageStores(args)));
  registry.register('create_snapshot_policy', createHandler((args: CreateSnapshotPolicyArgs) => storageHandlers.handleCreateSnapshotPolicy(args)));
  registry.register('delete_snapshot_policy', createHandler((args: DeleteSnapshotPolicyArgs) => storageHandlers.handleDeleteSnapshotPolicy(args)));
  registry.register('list_snapshot_policies', createHandler((args: ListSnapshotPoliciesArgs) => storageHandlers.handleListSnapshotPolicies(args)));
  registry.register('update_snapshot_policy', createHandler((args: UpdateSnapshotPolicyArgs) => storageHandlers.handleUpdateSnapshotPolicy(args)));

  // Security Extensions
  registry.register('create_account', createHandler((args: CreateAccountArgs) => securityHandlers.handleCreateAccount(args)));
  registry.register('update_account', createHandler((args: UpdateAccountArgs) => securityHandlers.handleUpdateAccount(args)));
  registry.register('delete_account', createHandler((args: DeleteAccountArgs) => securityHandlers.handleDeleteAccount(args)));
  registry.register('disable_account', createHandler((args: DisableAccountArgs) => securityHandlers.handleDisableAccount(args)));
  registry.register('enable_account', createHandler((args: EnableAccountArgs) => securityHandlers.handleEnableAccount(args)));
  registry.register('lock_account', createHandler((args: LockAccountArgs) => securityHandlers.handleLockAccount(args)));

  // Network Core Extensions
  registry.register('update_network', createHandler((args: UpdateNetworkArgs) => networkCoreHandlers.handleUpdateNetwork(args)));
  registry.register('restart_network', createHandler((args: RestartNetworkArgs) => networkCoreHandlers.handleRestartNetwork(args)));
  registry.register('update_vpc', createHandler((args: UpdateVpcArgs) => networkCoreHandlers.handleUpdateVpc(args)));
  registry.register('list_vpc_offerings', createHandler((args: ListVpcOfferingsArgs) => networkCoreHandlers.handleListVpcOfferings(args)));
  registry.register('create_vpc_offering', createHandler((args: CreateVpcOfferingArgs) => networkCoreHandlers.handleCreateVpcOffering(args)));
  registry.register('delete_vpc_offering', createHandler((args: DeleteVpcOfferingArgs) => networkCoreHandlers.handleDeleteVpcOffering(args)));
  registry.register('update_vpc_offering', createHandler((args: UpdateVpcOfferingArgs) => networkCoreHandlers.handleUpdateVpcOffering(args)));
  registry.register('list_supported_network_services', createHandler((args: ListSupportedNetworkServicesArgs) => networkCoreHandlers.handleListSupportedNetworkServices(args)));
  registry.register('list_network_service_providers', createHandler((args: ListNetworkServiceProvidersArgs) => networkCoreHandlers.handleListNetworkServiceProviders(args)));

  // Network Rules Extensions
  registry.register('create_egress_firewall_rule', createHandler((args: CreateEgressFirewallRuleArgs) => networkRulesHandlers.handleCreateEgressFirewallRule(args)));
  registry.register('list_egress_firewall_rules', createHandler((args: ListEgressFirewallRulesArgs) => networkRulesHandlers.handleListEgressFirewallRules(args)));
  registry.register('delete_egress_firewall_rule', createHandler((args: DeleteEgressFirewallRuleArgs) => networkRulesHandlers.handleDeleteEgressFirewallRule(args)));
  registry.register('update_load_balancer_rule', createHandler((args: UpdateLoadBalancerRuleArgs) => networkRulesHandlers.handleUpdateLoadBalancerRule(args)));
  registry.register('list_lb_stickiness_policies', createHandler((args: ListLBStickinessPoliciesArgs) => networkRulesHandlers.handleListLBStickinessPolicies(args)));
  registry.register('create_lb_stickiness_policy', createHandler((args: CreateLBStickinessPolicyArgs) => networkRulesHandlers.handleCreateLBStickinessPolicy(args)));
  registry.register('delete_lb_stickiness_policy', createHandler((args: DeleteLBStickinessPolicyArgs) => networkRulesHandlers.handleDeleteLBStickinessPolicy(args)));

  // Network ACL Operations
  registry.register('create_network_acl', createHandler((args: CreateNetworkACLArgs) => networkACLHandlers.handleCreateNetworkAcl(args)));
  registry.register('delete_network_acl', createHandler((args: DeleteNetworkACLArgs) => networkACLHandlers.handleDeleteNetworkAcl(args)));
  registry.register('update_network_acl_item', createHandler((args: UpdateNetworkACLItemArgs) => networkACLHandlers.handleUpdateNetworkAclItem(args)));
  registry.register('list_network_acls', createHandler((args: ListNetworkACLsArgs) => networkACLHandlers.handleListNetworkAcls(args)));
  registry.register('create_network_acl_list', createHandler((args: CreateNetworkACLListArgs) => networkACLHandlers.handleCreateNetworkAclList(args)));
  registry.register('delete_network_acl_list', createHandler((args: DeleteNetworkACLListArgs) => networkACLHandlers.handleDeleteNetworkAclList(args)));
  registry.register('update_network_acl_list', createHandler((args: UpdateNetworkACLListArgs) => networkACLHandlers.handleUpdateNetworkAclList(args)));
  registry.register('list_network_acl_lists', createHandler((args: ListNetworkACLListsArgs) => networkACLHandlers.handleListNetworkAclLists(args)));
  registry.register('replace_network_acl_list', createHandler((args: ReplaceNetworkACLListArgs) => networkACLHandlers.handleReplaceNetworkAclList(args)));

  // Admin Extensions
  registry.register('create_zone', createHandler((args: CreateZoneArgs) => adminHandlers.handleCreateZone(args)));
  registry.register('update_zone', createHandler((args: UpdateZoneArgs) => adminHandlers.handleUpdateZone(args)));
  registry.register('delete_zone', createHandler((args: DeleteZoneArgs) => adminHandlers.handleDeleteZone(args)));
  registry.register('create_pod', createHandler((args: CreatePodArgs) => adminHandlers.handleCreatePod(args)));
  registry.register('update_pod', createHandler((args: UpdatePodArgs) => adminHandlers.handleUpdatePod(args)));
  registry.register('delete_pod', createHandler((args: DeletePodArgs) => adminHandlers.handleDeletePod(args)));
  registry.register('list_pods', createHandler((args: ListPodsArgs) => adminHandlers.handleListPods(args)));
  registry.register('add_cluster', createHandler((args: AddClusterArgs) => adminHandlers.handleAddCluster(args)));
  registry.register('update_cluster', createHandler((args: UpdateClusterArgs) => adminHandlers.handleUpdateCluster(args)));
  registry.register('delete_cluster', createHandler((args: DeleteClusterArgs) => adminHandlers.handleDeleteCluster(args)));
  registry.register('add_host', createHandler((args: AddHostArgs) => adminHandlers.handleAddHost(args)));
  registry.register('update_host', createHandler((args: UpdateHostArgs) => adminHandlers.handleUpdateHost(args)));
  registry.register('delete_host', createHandler((args: DeleteHostArgs) => adminHandlers.handleDeleteHost(args)));
  registry.register('reconnect_host', createHandler((args: ReconnectHostArgs) => adminHandlers.handleReconnectHost(args)));
  registry.register('prepare_host_for_maintenance', createHandler((args: PrepareHostForMaintenanceArgs) => adminHandlers.handlePrepareHostForMaintenance(args)));
  registry.register('cancel_host_maintenance', createHandler((args: CancelHostMaintenanceArgs) => adminHandlers.handleCancelHostMaintenance(args)));
  registry.register('create_domain', createHandler((args: CreateDomainArgs) => adminHandlers.handleCreateDomain(args)));
  registry.register('update_domain', createHandler((args: UpdateDomainArgs) => adminHandlers.handleUpdateDomain(args)));
  registry.register('delete_domain', createHandler((args: DeleteDomainArgs) => adminHandlers.handleDeleteDomain(args)));
  registry.register('create_user', createHandler((args: CreateUserArgs) => adminHandlers.handleCreateUser(args)));
  registry.register('update_user', createHandler((args: UpdateUserArgs) => adminHandlers.handleUpdateUser(args)));
  registry.register('delete_user', createHandler((args: DeleteUserArgs) => adminHandlers.handleDeleteUser(args)));
  registry.register('disable_user', createHandler((args: DisableUserArgs) => adminHandlers.handleDisableUser(args)));
  registry.register('enable_user', createHandler((args: EnableUserArgs) => adminHandlers.handleEnableUser(args)));
  registry.register('list_configurations', createHandler((args: ListConfigurationsArgs) => adminHandlers.handleListConfigurations(args)));
  registry.register('update_configuration', createHandler((args: UpdateConfigurationArgs) => adminHandlers.handleUpdateConfiguration(args)));
  registry.register('start_system_vm', createHandler((args: StartSystemVmArgs) => adminHandlers.handleStartSystemVm(args)));
  registry.register('stop_system_vm', createHandler((args: StopSystemVmArgs) => adminHandlers.handleStopSystemVm(args)));
  registry.register('reboot_system_vm', createHandler((args: RebootSystemVmArgs) => adminHandlers.handleRebootSystemVm(args)));
  registry.register('destroy_system_vm', createHandler((args: DestroySystemVmArgs) => adminHandlers.handleDestroySystemVm(args)));
  registry.register('migrate_system_vm', createHandler((args: MigrateSystemVmArgs) => adminHandlers.handleMigrateSystemVm(args)));
  registry.register('create_console_endpoint', createHandler((args: CreateConsoleEndpointArgs) => adminHandlers.handleCreateConsoleEndpoint(args)));

  // Template Extensions
  registry.register('extract_template', createHandler((args: ExtractTemplateArgs) => templateHandlers.handleExtractTemplate(args)));
  registry.register('update_template_permissions', createHandler((args: UpdateTemplatePermissionsArgs) => templateHandlers.handleUpdateTemplatePermissions(args)));
  registry.register('list_template_permissions', createHandler((args: ListTemplatePermissionsArgs) => templateHandlers.handleListTemplatePermissions(args)));

  // Monitoring Extensions
  registry.register('list_event_types', createHandler((args: ListEventTypesArgs) => monitoringHandlers.handleListEventTypes(args)));
  registry.register('generate_usage_records', createHandler((args: GenerateUsageRecordsArgs) => monitoringHandlers.handleGenerateUsageRecords(args)));
  registry.register('list_usage_types', createHandler((args: ListUsageTypesArgs) => monitoringHandlers.handleListUsageTypes(args)));
  registry.register('add_annotation', createHandler((args: AddAnnotationArgs) => monitoringHandlers.handleAddAnnotation(args)));
  registry.register('remove_annotation', createHandler((args: RemoveAnnotationArgs) => monitoringHandlers.handleRemoveAnnotation(args)));
  registry.register('list_annotations', createHandler((args: ListAnnotationsArgs) => monitoringHandlers.handleListAnnotations(args)));

  // Affinity Extensions
  registry.register('update_vm_affinity_group', createHandler((args: UpdateVMAffinityGroupArgs) => affinityHandlers.handleUpdateVMAffinityGroup(args)));
  registry.register('list_affinity_group_types', createHandler((args: ListAffinityGroupTypesArgs) => affinityHandlers.handleListAffinityGroupTypes(args)));

  // VPN Operations
  registry.register('create_vpn_gateway', createHandler((args: CreateVpnGatewayArgs) => vpnHandlers.handleCreateVpnGateway(args)));
  registry.register('delete_vpn_gateway', createHandler((args: DeleteVpnGatewayArgs) => vpnHandlers.handleDeleteVpnGateway(args)));
  registry.register('list_vpn_gateways', createHandler((args: ListVpnGatewaysArgs) => vpnHandlers.handleListVpnGateways(args)));
  registry.register('create_vpn_connection', createHandler((args: CreateVpnConnectionArgs) => vpnHandlers.handleCreateVpnConnection(args)));
  registry.register('delete_vpn_connection', createHandler((args: DeleteVpnConnectionArgs) => vpnHandlers.handleDeleteVpnConnection(args)));
  registry.register('list_vpn_connections', createHandler((args: ListVpnConnectionsArgs) => vpnHandlers.handleListVpnConnections(args)));
  registry.register('reset_vpn_connection', createHandler((args: ResetVpnConnectionArgs) => vpnHandlers.handleResetVpnConnection(args)));
  registry.register('create_vpn_customer_gateway', createHandler((args: CreateVpnCustomerGatewayArgs) => vpnHandlers.handleCreateVpnCustomerGateway(args)));
  registry.register('update_vpn_customer_gateway', createHandler((args: UpdateVpnCustomerGatewayArgs) => vpnHandlers.handleUpdateVpnCustomerGateway(args)));
  registry.register('delete_vpn_customer_gateway', createHandler((args: DeleteVpnCustomerGatewayArgs) => vpnHandlers.handleDeleteVpnCustomerGateway(args)));
  registry.register('list_vpn_customer_gateways', createHandler((args: ListVpnCustomerGatewaysArgs) => vpnHandlers.handleListVpnCustomerGateways(args)));
  registry.register('create_remote_access_vpn', createHandler((args: CreateRemoteAccessVpnArgs) => vpnHandlers.handleCreateRemoteAccessVpn(args)));
  registry.register('delete_remote_access_vpn', createHandler((args: DeleteRemoteAccessVpnArgs) => vpnHandlers.handleDeleteRemoteAccessVpn(args)));
  registry.register('list_remote_access_vpns', createHandler((args: ListRemoteAccessVpnsArgs) => vpnHandlers.handleListRemoteAccessVpns(args)));
  registry.register('add_vpn_user', createHandler((args: AddVpnUserArgs) => vpnHandlers.handleAddVpnUser(args)));
  registry.register('remove_vpn_user', createHandler((args: RemoveVpnUserArgs) => vpnHandlers.handleRemoveVpnUser(args)));
  registry.register('list_vpn_users', createHandler((args: ListVpnUsersArgs) => vpnHandlers.handleListVpnUsers(args)));

  // Project Operations
  registry.register('create_project', createHandler((args: CreateProjectArgs) => projectHandlers.handleCreateProject(args)));
  registry.register('delete_project', createHandler((args: DeleteProjectArgs) => projectHandlers.handleDeleteProject(args)));
  registry.register('update_project', createHandler((args: UpdateProjectArgs) => projectHandlers.handleUpdateProject(args)));
  registry.register('list_projects', createHandler((args: ListProjectsArgs) => projectHandlers.handleListProjects(args)));
  registry.register('activate_project', createHandler((args: ActivateProjectArgs) => projectHandlers.handleActivateProject(args)));
  registry.register('suspend_project', createHandler((args: SuspendProjectArgs) => projectHandlers.handleSuspendProject(args)));
  registry.register('add_account_to_project', createHandler((args: AddAccountToProjectArgs) => projectHandlers.handleAddAccountToProject(args)));
  registry.register('delete_account_from_project', createHandler((args: DeleteAccountFromProjectArgs) => projectHandlers.handleDeleteAccountFromProject(args)));
  registry.register('list_project_accounts', createHandler((args: ListProjectAccountsArgs) => projectHandlers.handleListProjectAccounts(args)));
  registry.register('list_project_invitations', createHandler((args: ListProjectInvitationsArgs) => projectHandlers.handleListProjectInvitations(args)));
  registry.register('update_project_invitation', createHandler((args: UpdateProjectInvitationArgs) => projectHandlers.handleUpdateProjectInvitation(args)));
  registry.register('delete_project_invitation', createHandler((args: DeleteProjectInvitationArgs) => projectHandlers.handleDeleteProjectInvitation(args)));

  // VM Snapshot Operations
  registry.register('create_vm_snapshot', createHandler((args: CreateVMSnapshotArgs) => vmSnapshotHandlers.handleCreateVmSnapshot(args)));
  registry.register('delete_vm_snapshot', createHandler((args: DeleteVMSnapshotArgs) => vmSnapshotHandlers.handleDeleteVmSnapshot(args)));
  registry.register('list_vm_snapshots', createHandler((args: ListVMSnapshotsArgs) => vmSnapshotHandlers.handleListVmSnapshots(args)));
  registry.register('revert_to_vm_snapshot', createHandler((args: RevertToVMSnapshotArgs) => vmSnapshotHandlers.handleRevertToVmSnapshot(args)));

  // AutoScale Operations
  registry.register('create_auto_scale_policy', createHandler((args: CreateAutoScalePolicyArgs) => autoScaleHandlers.handleCreateAutoScalePolicy(args)));
  registry.register('update_auto_scale_policy', createHandler((args: UpdateAutoScalePolicyArgs) => autoScaleHandlers.handleUpdateAutoScalePolicy(args)));
  registry.register('delete_auto_scale_policy', createHandler((args: DeleteAutoScalePolicyArgs) => autoScaleHandlers.handleDeleteAutoScalePolicy(args)));
  registry.register('list_auto_scale_policies', createHandler((args: ListAutoScalePoliciesArgs) => autoScaleHandlers.handleListAutoScalePolicies(args)));
  registry.register('create_auto_scale_vm_group', createHandler((args: CreateAutoScaleVmGroupArgs) => autoScaleHandlers.handleCreateAutoScaleVmGroup(args)));
  registry.register('update_auto_scale_vm_group', createHandler((args: UpdateAutoScaleVmGroupArgs) => autoScaleHandlers.handleUpdateAutoScaleVmGroup(args)));
  registry.register('delete_auto_scale_vm_group', createHandler((args: DeleteAutoScaleVmGroupArgs) => autoScaleHandlers.handleDeleteAutoScaleVmGroup(args)));
  registry.register('list_auto_scale_vm_groups', createHandler((args: ListAutoScaleVmGroupsArgs) => autoScaleHandlers.handleListAutoScaleVmGroups(args)));
  registry.register('enable_auto_scale_vm_group', createHandler((args: EnableAutoScaleVmGroupArgs) => autoScaleHandlers.handleEnableAutoScaleVmGroup(args)));
  registry.register('disable_auto_scale_vm_group', createHandler((args: DisableAutoScaleVmGroupArgs) => autoScaleHandlers.handleDisableAutoScaleVmGroup(args)));
  registry.register('create_auto_scale_vm_profile', createHandler((args: CreateAutoScaleVmProfileArgs) => autoScaleHandlers.handleCreateAutoScaleVmProfile(args)));
  registry.register('update_auto_scale_vm_profile', createHandler((args: UpdateAutoScaleVmProfileArgs) => autoScaleHandlers.handleUpdateAutoScaleVmProfile(args)));
  registry.register('delete_auto_scale_vm_profile', createHandler((args: DeleteAutoScaleVmProfileArgs) => autoScaleHandlers.handleDeleteAutoScaleVmProfile(args)));
  registry.register('list_auto_scale_vm_profiles', createHandler((args: ListAutoScaleVmProfilesArgs) => autoScaleHandlers.handleListAutoScaleVmProfiles(args)));
  registry.register('create_condition', createHandler((args: CreateConditionArgs) => autoScaleHandlers.handleCreateCondition(args)));
  registry.register('delete_condition', createHandler((args: DeleteConditionArgs) => autoScaleHandlers.handleDeleteCondition(args)));
  registry.register('list_conditions', createHandler((args: ListConditionsArgs) => autoScaleHandlers.handleListConditions(args)));
  registry.register('list_counters', createHandler((args: ListCountersArgs) => autoScaleHandlers.handleListCounters(args)));
  registry.register('create_counter', createHandler((args: CreateCounterArgs) => autoScaleHandlers.handleCreateCounter(args)));
  registry.register('delete_counter', createHandler((args: DeleteCounterArgs) => autoScaleHandlers.handleDeleteCounter(args)));
  registry.register('update_counter', createHandler((args: UpdateCounterArgs) => autoScaleHandlers.handleUpdateCounter(args)));

  // Backup Operations
  registry.register('create_backup_schedule', createHandler((args: CreateBackupScheduleArgs) => backupHandlers.handleCreateBackupSchedule(args)));
  registry.register('delete_backup_schedule', createHandler((args: DeleteBackupScheduleArgs) => backupHandlers.handleDeleteBackupSchedule(args)));
  registry.register('list_backup_provider_offerings', createHandler((args: ListBackupProviderOfferingsArgs) => backupHandlers.handleListBackupProviderOfferings(args)));
  registry.register('list_backup_offerings', createHandler((args: ListBackupOfferingsArgs) => backupHandlers.handleListBackupOfferings(args)));
  registry.register('import_backup_offering', createHandler((args: ImportBackupOfferingArgs) => backupHandlers.handleImportBackupOffering(args)));
  registry.register('delete_backup_offering', createHandler((args: DeleteBackupOfferingArgs) => backupHandlers.handleDeleteBackupOffering(args)));
  registry.register('assign_virtual_machine_to_backup_offering', createHandler((args: AssignVirtualMachineToBackupOfferingArgs) => backupHandlers.handleAssignVirtualMachineToBackupOffering(args)));
  registry.register('remove_virtual_machine_from_backup_offering', createHandler((args: RemoveVirtualMachineFromBackupOfferingArgs) => backupHandlers.handleRemoveVirtualMachineFromBackupOffering(args)));
  registry.register('create_backup', createHandler((args: CreateBackupArgs) => backupHandlers.handleCreateBackup(args)));
  registry.register('delete_backup', createHandler((args: DeleteBackupArgs) => backupHandlers.handleDeleteBackup(args)));
  registry.register('list_backups', createHandler((args: ListBackupsArgs) => backupHandlers.handleListBackups(args)));
  registry.register('restore_backup', createHandler((args: RestoreBackupArgs) => backupHandlers.handleRestoreBackup(args)));

  // Role Operations
  registry.register('create_role', createHandler((args: CreateRoleArgs) => roleHandlers.handleCreateRole(args)));
  registry.register('update_role', createHandler((args: UpdateRoleArgs) => roleHandlers.handleUpdateRole(args)));
  registry.register('delete_role', createHandler((args: DeleteRoleArgs) => roleHandlers.handleDeleteRole(args)));
  registry.register('list_roles', createHandler((args: ListRolesArgs) => roleHandlers.handleListRoles(args)));
  registry.register('create_role_permission', createHandler((args: CreateRolePermissionArgs) => roleHandlers.handleCreateRolePermission(args)));
  registry.register('update_role_permission', createHandler((args: UpdateRolePermissionArgs) => roleHandlers.handleUpdateRolePermission(args)));
  registry.register('delete_role_permission', createHandler((args: DeleteRolePermissionArgs) => roleHandlers.handleDeleteRolePermission(args)));
  registry.register('list_role_permissions', createHandler((args: ListRolePermissionsArgs) => roleHandlers.handleListRolePermissions(args)));
  registry.register('import_role', createHandler((args: ImportRoleArgs) => roleHandlers.handleImportRole(args)));
}
