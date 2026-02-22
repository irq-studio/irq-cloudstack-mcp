/**
 * Network Type Definitions
 */

import type { CloudStackTag } from './common.js';

export interface Network {
  id: string;
  name: string;
  displaytext?: string;
  broadcastdomaintype?: string;
  broadcasturi?: string;
  traffictype?: string;
  zoneid: string;
  zonename?: string;
  networkofferingid: string;
  networkofferingname?: string;
  networkofferingdisplaytext?: string;
  networkofferingconservemode?: boolean;
  networkofferingavailability?: string;
  issystem?: boolean;
  state: string;
  related?: string;
  dns1?: string;
  dns2?: string;
  type?: string;
  vlan?: string;
  gateway?: string;
  cidr?: string;
  netmask?: string;
  networkdomain?: string;
  account?: string;
  domainid?: string;
  domain?: string;
  tags?: CloudStackTag[];
}

export interface PublicIpAddress {
  id: string;
  ipaddress: string;
  allocated?: string;
  zoneid: string;
  zonename?: string;
  issourcenat?: boolean;
  account?: string;
  domainid?: string;
  domain?: string;
  forvirtualnetwork?: boolean;
  isstaticnat?: boolean;
  associatednetworkid?: string;
  associatednetworkname?: string;
  networkid?: string;
  state: string;
  physicalnetworkid?: string;
  virtualmachineid?: string;
  virtualmachinename?: string;
  tags?: CloudStackTag[];
}

export interface VPC {
  id: string;
  name: string;
  displaytext?: string;
  cidr: string;
  vpcofferingid: string;
  zoneid: string;
  zonename?: string;
  account?: string;
  domainid?: string;
  domain?: string;
  state: string;
  networkcount?: number;
  created?: string;
  tags?: CloudStackTag[];
}

export interface Router {
  id: string;
  name: string;
  account?: string;
  domainid?: string;
  domain?: string;
  created?: string;
  state: string;
  zoneid: string;
  zonename?: string;
  dns1?: string;
  dns2?: string;
  gateway?: string;
  networkdomain?: string;
  guestipaddress?: string;
  guestmacaddress?: string;
  guestnetmask?: string;
  guestnetworkid?: string;
  hostid?: string;
  hostname?: string;
  linklocalguestip?: string;
  linklocalip?: string;
  publicip?: string;
  publicmacaddress?: string;
  publicnetmask?: string;
  publicnetworkid?: string;
  role?: string;
  serviceofferingid?: string;
  serviceofferingname?: string;
  templateid?: string;
  version?: string;
  vpcid?: string;
  vpcname?: string;
}

export interface FirewallRule {
  id: string;
  protocol: string;
  startport?: number;
  endport?: number;
  ipaddressid: string;
  ipaddress?: string;
  state: string;
  cidrlist?: string;
  icmptype?: number;
  icmpcode?: number;
  tags?: CloudStackTag[];
}

export interface LoadBalancerRule {
  id: string;
  name: string;
  description?: string;
  algorithm: string;
  publicport: string;
  privateport: string;
  protocol: string;
  publicipid: string;
  publicip?: string;
  state: string;
  cidrlist?: string;
  tags?: CloudStackTag[];
}

export interface PortForwardingRule {
  id: string;
  privateport: string;
  privateendport?: string;
  protocol: string;
  publicport: string;
  publicendport?: string;
  virtualmachineid: string;
  virtualmachinename?: string;
  virtualmachinedisplayname?: string;
  ipaddressid: string;
  ipaddress?: string;
  state: string;
  cidrlist?: string;
  tags?: CloudStackTag[];
}

export interface VpcOffering {
  id: string;
  name: string;
  displaytext?: string;
  state?: string;
  [key: string]: unknown;
}

export interface NetworkService {
  name: string;
  provider?: string;
  [key: string]: unknown;
}

export interface NetworkServiceProvider {
  id: string;
  name: string;
  state?: string;
  physicalnetworkid?: string;
  [key: string]: unknown;
}

export interface LBStickinessPolicy {
  id: string;
  name: string;
  methodname?: string;
  lbruleid?: string;
  [key: string]: unknown;
}

export interface ListNetworksResponse {
  listnetworksresponse: {
    count?: number;
    network?: Network[];
  };
}

export interface CreateNetworkResponse {
  createnetworkresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface DeleteNetworkResponse {
  deletenetworkresponse: {
    success?: boolean;
    jobid?: string;
  };
}

export interface ListPublicIpAddressesResponse {
  listpublicipaddressesresponse: {
    count?: number;
    publicipaddress?: PublicIpAddress[];
  };
}

export interface AssociateIpAddressResponse {
  associateipaddressresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface DisassociateIpAddressResponse {
  disassociateipaddressresponse: {
    success?: boolean;
    jobid?: string;
  };
}

export interface EnableStaticNatResponse {
  enablestaticnatresponse: {
    success?: boolean;
  };
}

export interface DisableStaticNatResponse {
  disablestaticnatresponse: {
    success?: boolean;
    jobid?: string;
  };
}

export interface ListVPCsResponse {
  listvpcsresponse: {
    count?: number;
    vpc?: VPC[];
  };
}

export interface CreateVPCResponse {
  createvpcresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface DeleteVPCResponse {
  deletevpcresponse: {
    success?: boolean;
    jobid?: string;
  };
}

export interface RestartVPCResponse {
  restartvpcresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface ListRoutersResponse {
  listroutersresponse: {
    count?: number;
    router?: Router[];
  };
}

export interface StartRouterResponse {
  startrouterresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface StopRouterResponse {
  stoprouterresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface RebootRouterResponse {
  rebootrouterresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface DestroyRouterResponse {
  destroyrouterresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface ListFirewallRulesResponse {
  listfirewallrulesresponse: {
    count?: number;
    firewallrule?: FirewallRule[];
  };
}

export interface CreateFirewallRuleResponse {
  createfirewallruleresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface DeleteFirewallRuleResponse {
  deletefirewallruleresponse: {
    success?: boolean;
    jobid?: string;
  };
}

export interface ListLoadBalancerRulesResponse {
  listloadbalancerrulesresponse: {
    count?: number;
    loadbalancerrule?: LoadBalancerRule[];
  };
}

export interface CreateLoadBalancerRuleResponse {
  createloadbalancerruleresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface DeleteLoadBalancerRuleResponse {
  deleteloadbalancerruleresponse: {
    success?: boolean;
    jobid?: string;
  };
}

export interface AssignToLoadBalancerRuleResponse {
  assigntoloadbalancerruleresponse: {
    success?: boolean;
    jobid?: string;
  };
}

export interface RemoveFromLoadBalancerRuleResponse {
  removefromloadbalancerruleresponse: {
    success?: boolean;
    jobid?: string;
  };
}

export interface ListPortForwardingRulesResponse {
  listportforwardingrulesresponse: {
    count?: number;
    portforwardingrule?: PortForwardingRule[];
  };
}

export interface CreatePortForwardingRuleResponse {
  createportforwardingruleresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface DeletePortForwardingRuleResponse {
  deleteportforwardingruleresponse: {
    success?: boolean;
    jobid?: string;
  };
}

export interface Nic {
  id: string;
  ipaddress: string;
  netmask?: string;
  gateway?: string;
  macaddress?: string;
  networkid: string;
  networkname?: string;
  isdefault?: boolean;
  type?: string;
  secondaryip?: Array<{
    id: string;
    ipaddress: string;
    networkid?: string;
  }>;
}

export interface NicSecondaryIp {
  id: string;
  ipaddress: string;
  networkid?: string;
}

export interface ListNicsResponse {
  listnicsresponse: {
    count?: number;
    nic?: Nic[];
  };
}

export interface AddNicToVirtualMachineResponse {
  addnictovirtualmachineresponse: {
    jobid?: string;
    nic?: Nic;
  };
}

export interface RemoveNicFromVirtualMachineResponse {
  removenicfromvirtualmachineresponse: {
    jobid?: string;
    success?: boolean;
  };
}

export interface UpdateDefaultNicForVirtualMachineResponse {
  updatedefaultnicforvirtualmachineresponse: {
    jobid?: string;
    success?: boolean;
  };
}

export interface AddIpToNicResponse {
  addiptonicresponse: {
    jobid?: string;
    nicsecondaryip?: NicSecondaryIp;
  };
}

export interface RemoveIpFromNicResponse {
  removeipfromnicresponse: {
    jobid?: string;
    success?: boolean;
  };
}
