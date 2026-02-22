// TypeScript interfaces for all MCP tool handler arguments
// This file provides strong typing to replace 'any' types throughout the codebase

import { ValidationError as ValidationErrorClass } from './utils/validation.js';
import type { CloudStackParams } from './cloudstack-client.js';

// Base interface that matches CloudStackParams signature
export type BaseArgs = CloudStackParams;

// ============================================================================
// Virtual Machine Handler Types
// ============================================================================

export interface ListVirtualMachinesArgs extends BaseArgs {
  id?: string;
  zoneid?: string;
  state?: string;
  keyword?: string;
  page?: number;
  pagesize?: number;
}

export interface DeployVirtualMachineArgs extends BaseArgs {
  serviceofferingid: string;
  templateid: string;
  zoneid: string;
  name?: string;
  displayname?: string;
  networkids?: string;
  keypair?: string;
  userdata?: string;
}

export interface StartVirtualMachineArgs extends BaseArgs {
  id: string;
}

export interface StopVirtualMachineArgs extends BaseArgs {
  id: string;
  forced?: boolean;
}

export interface RebootVirtualMachineArgs extends BaseArgs {
  id: string;
}

export interface DestroyVirtualMachineArgs extends BaseArgs {
  id: string;
  expunge?: boolean;
}

export interface ResetPasswordForVirtualMachineArgs extends BaseArgs {
  id: string;
}

export interface UpdateVirtualMachineArgs extends BaseArgs {
  id: string;
  displayname?: string;
  name?: string;
  userdata?: string;
}

export interface ChangeServiceForVirtualMachineArgs extends BaseArgs {
  id: string;
  serviceofferingid: string;
}

export interface RestoreVirtualMachineArgs extends BaseArgs {
  virtualmachineid: string;
  templateid?: string;
}

export interface GetVMPasswordArgs extends BaseArgs {
  id: string;
}

export interface MigrateVirtualMachineArgs extends BaseArgs {
  virtualmachineid: string;
  hostid?: string;
  storageid?: string;
}

// ============================================================================
// Storage Handler Types
// ============================================================================

export interface ListVolumesArgs extends BaseArgs {
  id?: string;
  virtualmachineid?: string;
  zoneid?: string;
  type?: string;
  keyword?: string;
}

export interface CreateVolumeArgs extends BaseArgs {
  name: string;
  diskofferingid?: string;
  size?: number;
  zoneid?: string;
}

export interface AttachVolumeArgs extends BaseArgs {
  id: string;
  virtualmachineid: string;
}

export interface DetachVolumeArgs extends BaseArgs {
  id: string;
}

export interface DeleteVolumeArgs extends BaseArgs {
  id: string;
}

export interface ResizeVolumeArgs extends BaseArgs {
  id: string;
  size?: number;
  diskofferingid?: string;
}

export interface ListSnapshotsArgs extends BaseArgs {
  id?: string;
  volumeid?: string;
  keyword?: string;
}

export interface CreateSnapshotArgs extends BaseArgs {
  volumeid: string;
  name?: string;
}

export interface DeleteSnapshotArgs extends BaseArgs {
  id: string;
}

export interface RevertSnapshotArgs extends BaseArgs {
  id: string;
}

export interface ListTemplatesArgs extends BaseArgs {
  templatefilter: string;
  id?: string;
  zoneid?: string;
  keyword?: string;
}

export interface ListISOsArgs extends BaseArgs {
  isofilter?: string;
  id?: string;
  zoneid?: string;
  keyword?: string;
}

export interface RegisterTemplateArgs extends BaseArgs {
  name: string;
  displaytext: string;
  url: string;
  zoneid: string;
  ostypeid: string;
  hypervisor: string;
  format: string;
  ispublic?: boolean;
  isfeatured?: boolean;
  isextractable?: boolean;
}

export interface DeleteTemplateArgs extends BaseArgs {
  id: string;
  zoneid?: string;
}

export interface UpdateTemplateArgs extends BaseArgs {
  id: string;
  name?: string;
  displaytext?: string;
  format?: string;
  ostypeid?: string;
  passwordenabled?: boolean;
}

export interface CopyTemplateArgs extends BaseArgs {
  id: string;
  sourcezoneid: string;
  destzoneid: string;
}

export interface RegisterISOArgs extends BaseArgs {
  name: string;
  displaytext: string;
  url: string;
  zoneid: string;
  ostypeid?: string;
  bootable?: boolean;
  ispublic?: boolean;
}

export interface DeleteISOArgs extends BaseArgs {
  id: string;
  zoneid?: string;
}

export interface AttachISOArgs extends BaseArgs {
  id: string;
  virtualmachineid: string;
}

export interface DetachISOArgs extends BaseArgs {
  virtualmachineid: string;
}

// ============================================================================
// Tag Handler Types
// ============================================================================

export interface CreateTagsArgs extends BaseArgs {
  resourceids: string[];
  resourcetype: string;
  tags: Array<{ key: string; value: string }>;
}

export interface DeleteTagsArgs extends BaseArgs {
  resourceids: string[];
  resourcetype: string;
  tags?: Array<{ key: string; value: string }>;
}

export interface ListTagsArgs extends BaseArgs {
  resourceid?: string;
  resourcetype?: string;
  key?: string;
  value?: string;
  keyword?: string;
}

// ============================================================================
// Affinity Handler Types
// ============================================================================

export interface CreateAffinityGroupArgs extends BaseArgs {
  name: string;
  type: string;
  description?: string;
}

export interface DeleteAffinityGroupArgs extends BaseArgs {
  id?: string;
  name?: string;
}

export interface ListAffinityGroupsArgs extends BaseArgs {
  id?: string;
  name?: string;
  virtualmachineid?: string;
  keyword?: string;
}

// ============================================================================
// Network Handler Types
// ============================================================================

export interface ListNetworksArgs extends BaseArgs {
  id?: string;
  zoneid?: string;
  type?: string;
  keyword?: string;
}

export interface CreateNetworkArgs extends BaseArgs {
  name: string;
  displaytext: string;
  networkofferingid: string;
  zoneid: string;
  gateway?: string;
  netmask?: string;
  vlan?: string;
}

export interface DeleteNetworkArgs extends BaseArgs {
  id: string;
}

export interface RestartNetworkArgs extends BaseArgs {
  id: string;
  cleanup?: boolean;
}

export interface UpdateNetworkArgs extends BaseArgs {
  id: string;
  name?: string;
  displaytext?: string;
}

export interface ListPublicIPAddressesArgs extends BaseArgs {
  id?: string;
  zoneid?: string;
  associatednetworkid?: string;
  keyword?: string;
}

export interface AssociateIPAddressArgs extends BaseArgs {
  zoneid?: string;
  networkid?: string;
}

export interface DisassociateIPAddressArgs extends BaseArgs {
  id: string;
}

export interface EnableStaticNatArgs extends BaseArgs {
  ipaddressid: string;
  virtualmachineid: string;
}

export interface DisableStaticNatArgs extends BaseArgs {
  ipaddressid: string;
}

export interface ListFirewallRulesArgs extends BaseArgs {
  id?: string;
  ipaddressid?: string;
  keyword?: string;
}

export interface CreateFirewallRuleArgs extends BaseArgs {
  ipaddressid: string;
  protocol: string;
  startport?: number;
  endport?: number;
  cidrlist?: string;
}

export interface DeleteFirewallRuleArgs extends BaseArgs {
  id: string;
}

export interface ListLoadBalancerRulesArgs extends BaseArgs {
  id?: string;
  publicipid?: string;
  keyword?: string;
}

export interface CreateLoadBalancerRuleArgs extends BaseArgs {
  algorithm: string;
  name: string;
  privateport: number;
  publicport: number;
  publicipid: string;
  protocol?: string;
}

export interface DeleteLoadBalancerRuleArgs extends BaseArgs {
  id: string;
}

export interface AssignToLoadBalancerRuleArgs extends BaseArgs {
  id: string;
  virtualmachineids: string;
}

export interface RemoveFromLoadBalancerRuleArgs extends BaseArgs {
  id: string;
  virtualmachineids: string;
}

export interface CreatePortForwardingRuleArgs extends BaseArgs {
  ipaddressid: string;
  protocol: string;
  publicport: number;
  privateport: number;
  virtualmachineid: string;
  publicendport?: number;
  privateendport?: number;
}

export interface ListPortForwardingRulesArgs extends BaseArgs {
  id?: string;
  ipaddressid?: string;
  keyword?: string;
}

export interface DeletePortForwardingRuleArgs extends BaseArgs {
  id: string;
}

export interface ListVPCsArgs extends BaseArgs {
  id?: string;
  zoneid?: string;
  keyword?: string;
}

export interface CreateVPCArgs extends BaseArgs {
  cidr: string;
  displaytext: string;
  name: string;
  vpcofferingid: string;
  zoneid: string;
}

export interface DeleteVPCArgs extends BaseArgs {
  id: string;
}

export interface RestartVPCArgs extends BaseArgs {
  id: string;
  cleanup?: boolean;
}

export interface CreateNetworkOfferingArgs extends BaseArgs {
  name: string;
  displaytext: string;
  guestiptype: string;
  traffictype: string;
  supportedservices: string;
  serviceProviderList?: Array<{ service: string; provider: string }>;
}

export interface ListRoutersArgs extends BaseArgs {
  id?: string;
  zoneid?: string;
  networkid?: string;
  state?: string;
  keyword?: string;
  listall?: boolean;
}

export interface StartRouterArgs extends BaseArgs {
  id: string;
}

export interface StopRouterArgs extends BaseArgs {
  id: string;
  forced?: boolean;
}

export interface RebootRouterArgs extends BaseArgs {
  id: string;
}

export interface DestroyRouterArgs extends BaseArgs {
  id: string;
}

export interface ListNicsArgs extends BaseArgs {
  virtualmachineid: string;
  nicid?: string;
  networkid?: string;
}

export interface AddNicToVirtualMachineArgs extends BaseArgs {
  virtualmachineid: string;
  networkid: string;
  ipaddress?: string;
}

export interface RemoveNicFromVirtualMachineArgs extends BaseArgs {
  virtualmachineid: string;
  nicid: string;
}

export interface UpdateDefaultNicForVirtualMachineArgs extends BaseArgs {
  virtualmachineid: string;
  nicid: string;
}

export interface AddIpToNicArgs extends BaseArgs {
  nicid: string;
  ipaddress?: string;
}

export interface RemoveIpFromNicArgs extends BaseArgs {
  id: string;
}

// ============================================================================
// Monitoring Handler Types
// ============================================================================

export interface ListEventsArgs extends BaseArgs {
  id?: string;
  type?: string;
  level?: string;
  startdate?: string;
  enddate?: string;
  keyword?: string;
}

export interface ListAlertsArgs extends BaseArgs {
  id?: string;
  type?: string;
  keyword?: string;
}

export interface ListCapacityArgs extends BaseArgs {
  type?: number;
  zoneid?: string;
}

export interface ListSystemVMsArgs extends BaseArgs {
  id?: string;
  systemvmtype?: string;
  zoneid?: string;
  state?: string;
  keyword?: string;
}

export interface ListAsyncJobsArgs extends BaseArgs {
  startdate?: string;
  keyword?: string;
}

export interface QueryAsyncJobResultArgs extends BaseArgs {
  jobid: string;
}

export interface ListUsageRecordsArgs extends BaseArgs {
  startdate?: string;
  enddate?: string;
  account?: string;
  domainid?: string;
  type?: number;
  keyword?: string;
}

// ============================================================================
// Admin Handler Types
// ============================================================================

export interface ListZonesArgs extends BaseArgs {
  id?: string;
  available?: boolean;
  keyword?: string;
}

export interface ListServiceOfferingsArgs extends BaseArgs {
  id?: string;
  keyword?: string;
}

export interface ListDiskOfferingsArgs extends BaseArgs {
  id?: string;
  keyword?: string;
}

export interface ListNetworkOfferingsArgs extends BaseArgs {
  id?: string;
  state?: string;
  keyword?: string;
}

export interface ListHostsArgs extends BaseArgs {
  id?: string;
  zoneid?: string;
  type?: string;
  state?: string;
  keyword?: string;
}

export interface ListClustersArgs extends BaseArgs {
  id?: string;
  zoneid?: string;
  keyword?: string;
}

export interface ListStoragePoolsArgs extends BaseArgs {
  id?: string;
  zoneid?: string;
  clusterid?: string;
  keyword?: string;
}

export interface ListAccountsArgs extends BaseArgs {
  id?: string;
  name?: string;
  state?: string;
  keyword?: string;
}

export interface ListUsersArgs extends BaseArgs {
  id?: string;
  accountid?: string;
  username?: string;
  keyword?: string;
}

export interface ListDomainsArgs extends BaseArgs {
  id?: string;
  name?: string;
  keyword?: string;
}

export interface ListProjectsArgs extends BaseArgs {
  id?: string;
  name?: string;
  state?: string;
  keyword?: string;
}

export interface ListConfigurationsArgs extends BaseArgs {
  name?: string;
  category?: string;
  keyword?: string;
}

// ============================================================================
// Security Handler Types
// ============================================================================

export interface ListSecurityGroupsArgs extends BaseArgs {
  id?: string;
  virtualmachineid?: string;
  keyword?: string;
}

export interface CreateSecurityGroupArgs extends BaseArgs {
  name: string;
  description?: string;
}

export interface DeleteSecurityGroupArgs extends BaseArgs {
  id?: string;
  name?: string;
}

export interface AuthorizeSecurityGroupIngressArgs extends BaseArgs {
  securitygroupid?: string;
  securitygroupname?: string;
  protocol: string;
  startport?: number;
  endport?: number;
  cidrlist?: string;
}

export interface RevokeSecurityGroupIngressArgs extends BaseArgs {
  id: string;
}

export interface AuthorizeSecurityGroupEgressArgs extends BaseArgs {
  securitygroupid?: string;
  securitygroupname?: string;
  protocol: string;
  startport?: number;
  endport?: number;
  cidrlist?: string;
}

export interface RevokeSecurityGroupEgressArgs extends BaseArgs {
  id: string;
}

export interface ListSSHKeyPairsArgs extends BaseArgs {
  name?: string;
  fingerprint?: string;
  keyword?: string;
}

export interface CreateSSHKeyPairArgs extends BaseArgs {
  name: string;
}

export interface DeleteSSHKeyPairArgs extends BaseArgs {
  name: string;
}

export interface RegisterSSHKeyPairArgs extends BaseArgs {
  name: string;
  publickey: string;
}

// ============================================================================
// Kubernetes Handler Types
// ============================================================================

export interface ListKubernetesClustersArgs extends BaseArgs {
  id?: string;
  name?: string;
  state?: string;
  keyword?: string;
}

export interface CreateKubernetesClusterArgs extends BaseArgs {
  name: string;
  description?: string;
  kubernetesversionid: string;
  serviceofferingid: string;
  zoneid: string;
  size?: number;
  networkid?: string;
}

export interface DeleteKubernetesClusterArgs extends BaseArgs {
  id: string;
  cleanup?: boolean;
}

export interface StartKubernetesClusterArgs extends BaseArgs {
  id: string;
}

export interface StopKubernetesClusterArgs extends BaseArgs {
  id: string;
}

export interface ScaleKubernetesClusterArgs extends BaseArgs {
  id: string;
  size: number;
}

export interface UpgradeKubernetesClusterArgs extends BaseArgs {
  id: string;
  kubernetesversionid: string;
}

export interface GetKubernetesClusterConfigArgs extends BaseArgs {
  id: string;
}

export interface ListKubernetesSupportedVersionsArgs extends BaseArgs {
  id?: string;
  keyword?: string;
}

// ============================================================================
// VPN Handler Types
// ============================================================================

export interface CreateVpnGatewayArgs extends BaseArgs {
  vpcid: string;
  fordisplay?: boolean;
}

export interface DeleteVpnGatewayArgs extends BaseArgs {
  id: string;
}

export interface ListVpnGatewaysArgs extends BaseArgs {
  id?: string;
  vpcid?: string;
  keyword?: string;
}

export interface CreateVpnConnectionArgs extends BaseArgs {
  s2scustomergatewayid: string;
  s2svpngatewayid: string;
  fordisplay?: boolean;
}

export interface DeleteVpnConnectionArgs extends BaseArgs {
  id: string;
}

export interface ListVpnConnectionsArgs extends BaseArgs {
  id?: string;
  vpcid?: string;
  keyword?: string;
}

export interface ResetVpnConnectionArgs extends BaseArgs {
  id: string;
}

export interface CreateVpnCustomerGatewayArgs extends BaseArgs {
  cidrlist: string;
  gateway: string;
  ipsecpsk: string;
  name: string;
  esppolicy?: string;
  ikepolicy?: string;
  ikelifetime?: number;
  esplifetime?: number;
  dpd?: boolean;
  forceencap?: boolean;
}

export interface UpdateVpnCustomerGatewayArgs extends BaseArgs {
  id: string;
  cidrlist?: string;
  gateway?: string;
  ipsecpsk?: string;
  name?: string;
  esppolicy?: string;
  ikepolicy?: string;
}

export interface DeleteVpnCustomerGatewayArgs extends BaseArgs {
  id: string;
}

export interface ListVpnCustomerGatewaysArgs extends BaseArgs {
  id?: string;
  keyword?: string;
}

export interface CreateRemoteAccessVpnArgs extends BaseArgs {
  ipaddressid: string;
  account?: string;
  domainid?: string;
  fordisplay?: boolean;
  openfirewall?: boolean;
  iprange?: string;
}

export interface DeleteRemoteAccessVpnArgs extends BaseArgs {
  publicipid: string;
}

export interface ListRemoteAccessVpnsArgs extends BaseArgs {
  id?: string;
  publicipid?: string;
  keyword?: string;
}

export interface AddVpnUserArgs extends BaseArgs {
  username: string;
  password: string;
  account?: string;
  domainid?: string;
}

export interface RemoveVpnUserArgs extends BaseArgs {
  username: string;
  account?: string;
  domainid?: string;
}

export interface ListVpnUsersArgs extends BaseArgs {
  id?: string;
  username?: string;
  keyword?: string;
}

// ============================================================================
// Project Handler Types
// ============================================================================

export interface CreateProjectArgs extends BaseArgs {
  name: string;
  displaytext: string;
  account?: string;
  domainid?: string;
}

export interface DeleteProjectArgs extends BaseArgs {
  id: string;
}

export interface UpdateProjectArgs extends BaseArgs {
  id: string;
  displaytext?: string;
  account?: string;
}

export interface ActivateProjectArgs extends BaseArgs {
  id: string;
}

export interface SuspendProjectArgs extends BaseArgs {
  id: string;
}

export interface AddAccountToProjectArgs extends BaseArgs {
  projectid: string;
  account?: string;
  email?: string;
}

export interface DeleteAccountFromProjectArgs extends BaseArgs {
  projectid: string;
  account: string;
}

export interface ListProjectAccountsArgs extends BaseArgs {
  projectid: string;
  account?: string;
  keyword?: string;
}

export interface ListProjectInvitationsArgs extends BaseArgs {
  id?: string;
  projectid?: string;
  state?: string;
  keyword?: string;
}

export interface UpdateProjectInvitationArgs extends BaseArgs {
  projectid: string;
  accept?: boolean;
  token?: string;
}

export interface DeleteProjectInvitationArgs extends BaseArgs {
  id: string;
}

// ============================================================================
// Network ACL Handler Types
// ============================================================================

export interface CreateNetworkACLArgs extends BaseArgs {
  protocol: string;
  aclid: string;
  action?: string;
  cidrlist?: string;
  startport?: number;
  endport?: number;
  icmptype?: number;
  icmpcode?: number;
  traffictype?: string;
  number?: number;
}

export interface DeleteNetworkACLArgs extends BaseArgs {
  id: string;
}

export interface UpdateNetworkACLItemArgs extends BaseArgs {
  id: string;
  action?: string;
  cidrlist?: string;
  protocol?: string;
  startport?: number;
  endport?: number;
  number?: number;
  traffictype?: string;
}

export interface ListNetworkACLsArgs extends BaseArgs {
  id?: string;
  networkid?: string;
  keyword?: string;
}

export interface CreateNetworkACLListArgs extends BaseArgs {
  name: string;
  description: string;
  vpcid: string;
}

export interface DeleteNetworkACLListArgs extends BaseArgs {
  id: string;
}

export interface UpdateNetworkACLListArgs extends BaseArgs {
  id: string;
  name?: string;
  description?: string;
}

export interface ListNetworkACLListsArgs extends BaseArgs {
  id?: string;
  vpcid?: string;
  networkid?: string;
  keyword?: string;
}

export interface ReplaceNetworkACLListArgs extends BaseArgs {
  aclid: string;
  gatewayid?: string;
  networkid?: string;
}

// ============================================================================
// VM Snapshot Handler Types
// ============================================================================

export interface CreateVMSnapshotArgs extends BaseArgs {
  virtualmachineid: string;
  name?: string;
  description?: string;
  snapshotmemory?: boolean;
  quiescevm?: boolean;
}

export interface DeleteVMSnapshotArgs extends BaseArgs {
  vmsnapshotid: string;
}

export interface ListVMSnapshotsArgs extends BaseArgs {
  virtualmachineid?: string;
  vmsnapshotid?: string;
  state?: string;
  keyword?: string;
}

export interface RevertToVMSnapshotArgs extends BaseArgs {
  vmsnapshotid: string;
}

// ============================================================================
// AutoScale Handler Types
// ============================================================================

export interface CreateAutoScalePolicyArgs extends BaseArgs {
  action: string;
  conditionids: string;
  duration: number;
  quiettime?: number;
}

export interface UpdateAutoScalePolicyArgs extends BaseArgs {
  id: string;
  conditionids?: string;
  duration?: number;
  quiettime?: number;
}

export interface DeleteAutoScalePolicyArgs extends BaseArgs {
  id: string;
}

export interface ListAutoScalePoliciesArgs extends BaseArgs {
  id?: string;
  vmgroupid?: string;
  keyword?: string;
}

export interface CreateAutoScaleVmGroupArgs extends BaseArgs {
  lbruleid: string;
  maxmembers: number;
  minmembers: number;
  scaledownpolicyids: string;
  scaleuppolicyids: string;
  vmprofileid: string;
  interval?: number;
}

export interface UpdateAutoScaleVmGroupArgs extends BaseArgs {
  id: string;
  maxmembers?: number;
  minmembers?: number;
  scaledownpolicyids?: string;
  scaleuppolicyids?: string;
  interval?: number;
}

export interface DeleteAutoScaleVmGroupArgs extends BaseArgs {
  id: string;
}

export interface ListAutoScaleVmGroupsArgs extends BaseArgs {
  id?: string;
  lbruleid?: string;
  keyword?: string;
}

export interface EnableAutoScaleVmGroupArgs extends BaseArgs {
  id: string;
}

export interface DisableAutoScaleVmGroupArgs extends BaseArgs {
  id: string;
}

export interface CreateAutoScaleVmProfileArgs extends BaseArgs {
  serviceofferingid: string;
  templateid: string;
  zoneid: string;
  destroyvmgraceperiod?: number;
  otherdeployparams?: string;
}

export interface UpdateAutoScaleVmProfileArgs extends BaseArgs {
  id: string;
  serviceofferingid?: string;
  templateid?: string;
  destroyvmgraceperiod?: number;
}

export interface DeleteAutoScaleVmProfileArgs extends BaseArgs {
  id: string;
}

export interface ListAutoScaleVmProfilesArgs extends BaseArgs {
  id?: string;
  keyword?: string;
}

export interface CreateConditionArgs extends BaseArgs {
  counterid: string;
  relationaloperator: string;
  threshold: number;
}

export interface DeleteConditionArgs extends BaseArgs {
  id: string;
}

export interface ListConditionsArgs extends BaseArgs {
  id?: string;
  counterid?: string;
  keyword?: string;
}

export interface ListCountersArgs extends BaseArgs {
  id?: string;
  keyword?: string;
}

export interface CreateCounterArgs extends BaseArgs {
  name: string;
  source: string;
  value: string;
}

export interface DeleteCounterArgs extends BaseArgs {
  id: string;
}

export interface UpdateCounterArgs extends BaseArgs {
  id: string;
  name?: string;
  source?: string;
  value?: string;
}

// ============================================================================
// Backup Handler Types
// ============================================================================

export interface CreateBackupScheduleArgs extends BaseArgs {
  virtualmachineid: string;
  intervaltype: string;
  schedule: string;
  timezone: string;
}

export interface DeleteBackupScheduleArgs extends BaseArgs {
  virtualmachineid: string;
}

export interface ListBackupProviderOfferingsArgs extends BaseArgs {
  zoneid: string;
  keyword?: string;
}

export interface ListBackupOfferingsArgs extends BaseArgs {
  zoneid?: string;
  keyword?: string;
}

export interface ImportBackupOfferingArgs extends BaseArgs {
  zoneid: string;
  externalid: string;
  name: string;
  description: string;
}

export interface DeleteBackupOfferingArgs extends BaseArgs {
  id: string;
}

export interface AssignVirtualMachineToBackupOfferingArgs extends BaseArgs {
  virtualmachineid: string;
  backupofferingid: string;
}

export interface RemoveVirtualMachineFromBackupOfferingArgs extends BaseArgs {
  virtualmachineid: string;
}

export interface CreateBackupArgs extends BaseArgs {
  virtualmachineid: string;
}

export interface DeleteBackupArgs extends BaseArgs {
  id: string;
}

export interface ListBackupsArgs extends BaseArgs {
  virtualmachineid?: string;
  id?: string;
  zoneid?: string;
  keyword?: string;
}

export interface RestoreBackupArgs extends BaseArgs {
  id: string;
  virtualmachineid: string;
}

// ============================================================================
// Role Handler Types
// ============================================================================

export interface CreateRoleArgs extends BaseArgs {
  name: string;
  type?: string;
  description?: string;
}

export interface UpdateRoleArgs extends BaseArgs {
  id: string;
  name?: string;
  description?: string;
  type?: string;
}

export interface DeleteRoleArgs extends BaseArgs {
  id: string;
}

export interface ListRolesArgs extends BaseArgs {
  id?: string;
  name?: string;
  type?: string;
  keyword?: string;
}

export interface CreateRolePermissionArgs extends BaseArgs {
  roleid: string;
  rule: string;
  permission: string;
  description?: string;
}

export interface UpdateRolePermissionArgs extends BaseArgs {
  roleid: string;
  ruleorder?: string;
  ruleid?: string;
  permission?: string;
}

export interface DeleteRolePermissionArgs extends BaseArgs {
  id: string;
}

export interface ListRolePermissionsArgs extends BaseArgs {
  roleid: string;
}

export interface ImportRoleArgs extends BaseArgs {
  name: string;
  rules: string;
  type?: string;
  description?: string;
  forced?: boolean;
}

// ============================================================================
// VM Extension Handler Types
// ============================================================================

export interface RecoverVirtualMachineArgs extends BaseArgs {
  id: string;
}

export interface AssignVirtualMachineArgs extends BaseArgs {
  virtualmachineid: string;
  account: string;
  domainid: string;
}

// ============================================================================
// Storage Extension Handler Types
// ============================================================================

export interface UpdateVolumeArgs extends BaseArgs {
  id: string;
  path?: string;
  storageid?: string;
  state?: string;
}

export interface MigrateVolumeArgs extends BaseArgs {
  volumeid: string;
  storageid: string;
  livemigrate?: boolean;
}

export interface ExtractVolumeArgs extends BaseArgs {
  id: string;
  mode: string;
  zoneid: string;
  url?: string;
}

export interface ListImageStoresArgs extends BaseArgs {
  id?: string;
  zoneid?: string;
  name?: string;
  keyword?: string;
}

export interface CreateSnapshotPolicyArgs extends BaseArgs {
  volumeid: string;
  intervaltype: string;
  maxsnaps: number;
  schedule: string;
  timezone: string;
}

export interface DeleteSnapshotPolicyArgs extends BaseArgs {
  id: string;
}

export interface ListSnapshotPoliciesArgs extends BaseArgs {
  volumeid: string;
  keyword?: string;
}

export interface UpdateSnapshotPolicyArgs extends BaseArgs {
  id: string;
  maxsnaps?: number;
  schedule?: string;
  timezone?: string;
  intervaltype?: string;
}

// ============================================================================
// Security Extension Handler Types
// ============================================================================

export interface CreateAccountArgs extends BaseArgs {
  accounttype: number;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  username: string;
  account?: string;
  domainid?: string;
  roleid?: string;
}

export interface UpdateAccountArgs extends BaseArgs {
  newname: string;
  account?: string;
  id?: string;
  domainid?: string;
}

export interface DeleteAccountArgs extends BaseArgs {
  id: string;
}

export interface DisableAccountArgs extends BaseArgs {
  lock: boolean;
  account?: string;
  domainid?: string;
  id?: string;
}

export interface EnableAccountArgs extends BaseArgs {
  account?: string;
  domainid?: string;
  id?: string;
}

export interface LockAccountArgs extends BaseArgs {
  account: string;
  domainid: string;
}

// ============================================================================
// Network Core Extension Handler Types
// ============================================================================

export interface UpdateVpcArgs extends BaseArgs {
  id: string;
  name?: string;
  displaytext?: string;
}

export interface ListVpcOfferingsArgs extends BaseArgs {
  id?: string;
  name?: string;
  state?: string;
  keyword?: string;
}

export interface CreateVpcOfferingArgs extends BaseArgs {
  name: string;
  displaytext: string;
  supportedservices: string;
}

export interface DeleteVpcOfferingArgs extends BaseArgs {
  id: string;
}

export interface UpdateVpcOfferingArgs extends BaseArgs {
  id: string;
  name?: string;
  displaytext?: string;
  state?: string;
}

export interface ListSupportedNetworkServicesArgs extends BaseArgs {
  service?: string;
  provider?: string;
  keyword?: string;
}

export interface ListNetworkServiceProvidersArgs extends BaseArgs {
  name?: string;
  physicalnetworkid?: string;
  state?: string;
  keyword?: string;
}

// ============================================================================
// Network Rules Extension Handler Types
// ============================================================================

export interface CreateEgressFirewallRuleArgs extends BaseArgs {
  networkid: string;
  protocol: string;
  startport?: number;
  endport?: number;
  cidrlist?: string;
}

export interface ListEgressFirewallRulesArgs extends BaseArgs {
  id?: string;
  networkid?: string;
  keyword?: string;
}

export interface DeleteEgressFirewallRuleArgs extends BaseArgs {
  id: string;
}

export interface UpdateLoadBalancerRuleArgs extends BaseArgs {
  id: string;
  name?: string;
  description?: string;
  algorithm?: string;
}

export interface ListLBStickinessPoliciesArgs extends BaseArgs {
  lbruleid: string;
  keyword?: string;
}

export interface CreateLBStickinessPolicyArgs extends BaseArgs {
  lbruleid: string;
  methodname: string;
  name: string;
  description?: string;
}

export interface DeleteLBStickinessPolicyArgs extends BaseArgs {
  id: string;
}

// ============================================================================
// Admin Extension Handler Types
// ============================================================================

export interface CreateZoneArgs extends BaseArgs {
  dns1: string;
  internaldns1: string;
  name: string;
  networktype: string;
  dns2?: string;
  internaldns2?: string;
  guestcidraddress?: string;
}

export interface UpdateZoneArgs extends BaseArgs {
  id: string;
  name?: string;
  dns1?: string;
  dns2?: string;
  internaldns1?: string;
  internaldns2?: string;
}

export interface DeleteZoneArgs extends BaseArgs {
  id: string;
}

export interface CreatePodArgs extends BaseArgs {
  gateway: string;
  name: string;
  netmask: string;
  startip: string;
  zoneid: string;
  endip?: string;
}

export interface UpdatePodArgs extends BaseArgs {
  id: string;
  name?: string;
  gateway?: string;
  netmask?: string;
  startip?: string;
  endip?: string;
}

export interface DeletePodArgs extends BaseArgs {
  id: string;
}

export interface ListPodsArgs extends BaseArgs {
  id?: string;
  zoneid?: string;
  name?: string;
  keyword?: string;
}

export interface AddClusterArgs extends BaseArgs {
  clustername: string;
  clustertype: string;
  hypervisor: string;
  zoneid: string;
  podid: string;
  url?: string;
  username?: string;
  password?: string;
}

export interface UpdateClusterArgs extends BaseArgs {
  id: string;
  clustername?: string;
  clustertype?: string;
  hypervisor?: string;
  managedstate?: string;
}

export interface DeleteClusterArgs extends BaseArgs {
  id: string;
}

export interface AddHostArgs extends BaseArgs {
  hypervisor: string;
  url: string;
  zoneid: string;
  podid: string;
  clusterid?: string;
  username?: string;
  password?: string;
}

export interface UpdateHostArgs extends BaseArgs {
  id: string;
  allocationstate?: string;
  hosttags?: string;
  oscategoryid?: string;
}

export interface DeleteHostArgs extends BaseArgs {
  id: string;
  forced?: boolean;
}

export interface ReconnectHostArgs extends BaseArgs {
  id: string;
}

export interface PrepareHostForMaintenanceArgs extends BaseArgs {
  id: string;
}

export interface CancelHostMaintenanceArgs extends BaseArgs {
  id: string;
}

export interface CreateDomainArgs extends BaseArgs {
  name: string;
  parentdomainid?: string;
  networkdomain?: string;
}

export interface UpdateDomainArgs extends BaseArgs {
  id: string;
  name?: string;
  networkdomain?: string;
}

export interface DeleteDomainArgs extends BaseArgs {
  id: string;
  cleanup?: boolean;
}

export interface CreateUserArgs extends BaseArgs {
  account: string;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  username: string;
  domainid?: string;
}

export interface UpdateUserArgs extends BaseArgs {
  id: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  password?: string;
  username?: string;
}

export interface DeleteUserArgs extends BaseArgs {
  id: string;
}

export interface DisableUserArgs extends BaseArgs {
  id: string;
}

export interface EnableUserArgs extends BaseArgs {
  id: string;
}

export interface UpdateConfigurationArgs extends BaseArgs {
  name: string;
  value?: string;
}

export interface StartSystemVmArgs extends BaseArgs {
  id: string;
}

export interface StopSystemVmArgs extends BaseArgs {
  id: string;
  forced?: boolean;
}

export interface RebootSystemVmArgs extends BaseArgs {
  id: string;
}

export interface DestroySystemVmArgs extends BaseArgs {
  id: string;
}

export interface MigrateSystemVmArgs extends BaseArgs {
  virtualmachineid: string;
  hostid?: string;
}

export interface CreateConsoleEndpointArgs extends BaseArgs {
  virtualmachineid: string;
}

// ============================================================================
// Template Extension Handler Types
// ============================================================================

export interface ExtractTemplateArgs extends BaseArgs {
  id: string;
  mode: string;
  zoneid?: string;
  url?: string;
}

export interface UpdateTemplatePermissionsArgs extends BaseArgs {
  id: string;
  accounts?: string;
  isextractable?: boolean;
  isfeatured?: boolean;
  ispublic?: boolean;
  op?: string;
}

export interface ListTemplatePermissionsArgs extends BaseArgs {
  id: string;
}

// ============================================================================
// Monitoring Extension Handler Types
// ============================================================================

export interface ListEventTypesArgs extends BaseArgs {
  keyword?: string;
}

export interface GenerateUsageRecordsArgs extends BaseArgs {
  startdate: string;
  enddate: string;
  domainid?: string;
}

export interface ListUsageTypesArgs extends BaseArgs {
  keyword?: string;
}

export interface AddAnnotationArgs extends BaseArgs {
  entityid: string;
  entitytype: string;
  annotation: string;
}

export interface RemoveAnnotationArgs extends BaseArgs {
  id: string;
}

export interface ListAnnotationsArgs extends BaseArgs {
  id?: string;
  entityid?: string;
  entitytype?: string;
  keyword?: string;
}

// ============================================================================
// Affinity Extension Handler Types
// ============================================================================

export interface UpdateVMAffinityGroupArgs extends BaseArgs {
  id: string;
  affinitygroupids?: string;
  affinitygroupnames?: string;
}

export interface ListAffinityGroupTypesArgs extends BaseArgs {
  keyword?: string;
}

// ============================================================================
// Validation Utilities
// ============================================================================

// Re-export ValidationError from utils/validation for backward compatibility
export { ValidationError } from './utils/validation.js';

/**
 * Validates that required fields are present in arguments
 * @param args - The arguments object to validate
 * @param requiredFields - Array of required field names
 * @param operationName - Name of the operation for error messages
 * @throws ValidationError if any required field is missing
 */
export function validateRequiredFields(
  args: Record<string, unknown>,
  requiredFields: string[],
  operationName: string
): void {
  const missingFields = requiredFields.filter(field => {
    const value = args[field];
    return value === undefined || value === null || value === '';
  });

  if (missingFields.length > 0) {
    throw new ValidationErrorClass(
      `${operationName}: Missing required field${missingFields.length > 1 ? 's' : ''}: ${missingFields.join(', ')}`
    );
  }
}

/**
 * Validates that a field value is one of the allowed values
 * @param args - The arguments object
 * @param field - The field name to validate
 * @param allowedValues - Array of allowed values
 * @param operationName - Name of the operation for error messages
 * @throws ValidationError if the field value is not in allowed values
 */
export function validateEnum(
  args: Record<string, unknown>,
  field: string,
  allowedValues: string[],
  operationName: string
): void {
  const value = args[field];
  if (value !== undefined && typeof value === 'string' && !allowedValues.includes(value)) {
    throw new ValidationErrorClass(
      `${operationName}: Invalid value for ${field}. Must be one of: ${allowedValues.join(', ')}`
    );
  }
}

/**
 * Validates that a numeric field is within acceptable range
 * @param args - The arguments object
 * @param field - The field name to validate
 * @param min - Minimum allowed value (inclusive)
 * @param max - Maximum allowed value (inclusive)
 * @param operationName - Name of the operation for error messages
 * @throws ValidationError if the field value is out of range
 */
export function validateRange(
  args: Record<string, unknown>,
  field: string,
  min: number,
  max: number,
  operationName: string
): void {
  const value = args[field];
  if (value !== undefined) {
    const numValue = typeof value === 'number' ? value : Number(value);
    if (isNaN(numValue) || numValue < min || numValue > max) {
      throw new ValidationErrorClass(
        `${operationName}: ${field} must be a number between ${min} and ${max}`
      );
    }
  }
}
