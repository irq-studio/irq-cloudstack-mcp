/**
 * Admin Type Definitions
 */

import type { CloudStackTag } from './common.js';

export interface Zone {
  id: string;
  name: string;
  description?: string;
  dns1?: string;
  dns2?: string;
  internaldns1?: string;
  internaldns2?: string;
  networktype: string;
  securitygroupsenabled?: boolean;
  allocationstate?: string;
  zonetoken?: string;
  dhcpprovider?: string;
  localstorageenabled?: boolean;
  tags?: CloudStackTag[];
}

export interface ServiceOffering {
  id: string;
  name: string;
  displaytext?: string;
  cpunumber?: number;
  cpuspeed?: number;
  memory?: number;
  created?: string;
  storagetype?: string;
  offerha?: boolean;
  limitcpuuse?: boolean;
  isvolatile?: boolean;
  iscustomized?: boolean;
  issystem?: boolean;
  defaultuse?: boolean;
  tags?: string;
}

export interface DiskOffering {
  id: string;
  name: string;
  displaytext?: string;
  disksize?: number;
  iscustomized?: boolean;
  storagetype?: string;
  created?: string;
  tags?: string;
  provisioningtype?: string;
  minimumsize?: number;
  maximumsize?: number;
}

export interface NetworkOffering {
  id: string;
  name: string;
  displaytext?: string;
  traffictype?: string;
  guestiptype?: string;
  state?: string;
  isdefault?: boolean;
  availability?: string;
  networkrate?: number;
  conservemode?: boolean;
  supportedservices?: string[];
  tags?: string;
}

export interface Host {
  id: string;
  name: string;
  state: string;
  type: string;
  ipaddress: string;
  zoneid: string;
  zonename?: string;
  podid?: string;
  podname?: string;
  clusterid?: string;
  clustername?: string;
  version?: string;
  hypervisor?: string;
  cpunumber?: number;
  cpuspeed?: number;
  cpuallocated?: string;
  cpuused?: string;
  memorytotal?: number;
  memoryallocated?: number;
  memoryused?: number;
  networkkbsread?: number;
  networkkbswrite?: number;
  disksizealloc?: number;
  disksizetotal?: number;
  capabilities?: string;
  created?: string;
  tags?: CloudStackTag[];
}

export interface Cluster {
  id: string;
  name: string;
  podid: string;
  podname?: string;
  zoneid: string;
  zonename?: string;
  hypervisortype: string;
  clustertype: string;
  allocationstate?: string;
  managedstate?: string;
}

export interface StoragePool {
  id: string;
  name: string;
  zoneid: string;
  zonename?: string;
  clusterid?: string;
  clustername?: string;
  type: string;
  ipaddress?: string;
  path?: string;
  created?: string;
  state: string;
  disksizeallocated?: number;
  disksizetotal?: number;
  disksizeused?: number;
  tags?: string;
  // CloudStack 4.22+ field
  capacitybytes?: number;
}

export interface Account {
  id: string;
  name: string;
  accounttype: number;
  roleid?: string;
  rolename?: string;
  roletype?: string;
  domainid: string;
  domain?: string;
  state: string;
  isdefault?: boolean;
  created?: string;
  receivedbytes?: number;
  sentbytes?: number;
}

export interface User {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email?: string;
  created?: string;
  state: string;
  account: string;
  accounttype: number;
  domainid: string;
  domain?: string;
  timezone?: string;
  apikey?: string;
  secretkey?: string;
  accountid: string;
  iscallerchilddomain?: boolean;
  isdefault?: boolean;
}

export interface Domain {
  id: string;
  name: string;
  level: number;
  parentdomainid?: string;
  parentdomainname?: string;
  haschild: boolean;
  path: string;
  state?: string;
}

export interface SystemVM {
  id: string;
  name: string;
  systemvmtype: string;
  zoneid: string;
  zonename?: string;
  dns1?: string;
  dns2?: string;
  gateway?: string;
  state: string;
  publicip?: string;
  privateip?: string;
  linklocalip?: string;
  publicmacaddress?: string;
  privatemacaddress?: string;
  linklocalmacaddress?: string;
  created?: string;
  hostid?: string;
  hostname?: string;
}

export interface ListZonesResponse {
  listzonesresponse: {
    count?: number;
    zone?: Zone[];
  };
}

export interface ListServiceOfferingsResponse {
  listserviceofferingsresponse: {
    count?: number;
    serviceoffering?: ServiceOffering[];
  };
}

export interface ListDiskOfferingsResponse {
  listdiskofferingsresponse: {
    count?: number;
    diskoffering?: DiskOffering[];
  };
}

export interface ListNetworkOfferingsResponse {
  listnetworkofferingsresponse: {
    count?: number;
    networkoffering?: NetworkOffering[];
  };
}

export interface CreateNetworkOfferingResponse {
  createnetworkofferingresponse: {
    networkoffering?: NetworkOffering;
  };
}

export interface ListHostsResponse {
  listhostsresponse: {
    count?: number;
    host?: Host[];
  };
}

export interface ListClustersResponse {
  listclustersresponse: {
    count?: number;
    cluster?: Cluster[];
  };
}

export interface ListStoragePoolsResponse {
  liststoragepoolsresponse: {
    count?: number;
    storagepool?: StoragePool[];
  };
}

export interface ListAccountsResponse {
  listaccountsresponse: {
    count?: number;
    account?: Account[];
  };
}

export interface ListUsersResponse {
  listusersresponse: {
    count?: number;
    user?: User[];
  };
}

export interface ListDomainsResponse {
  listdomainsresponse: {
    count?: number;
    domain?: Domain[];
  };
}

export interface ListSystemVMsResponse {
  listsystemvmsresponse: {
    count?: number;
    systemvm?: SystemVM[];
  };
}

export interface CloudStackCapability {
  cloudstackversion?: string;
  userpublictemplateenabled?: boolean;
  supportELB?: string;
  securitygroupsenabled?: boolean;
  firewallrulesuisenabled?: boolean;
  customdiskofferingminsize?: number;
  customdiskofferingmaxsize?: number;
  kvmsnapshotenabled?: boolean;
  projectinviterequired?: boolean;
  allowusercreateprojects?: boolean;
  allowuserviewdestroyedvm?: boolean;
  allowuserexpungerecovervm?: boolean;
  dynamicrolesenabled?: boolean;
  apilimitinterval?: number;
  apilimitmax?: number;
  regionsecondaryenabled?: boolean;
  kubernetesserviceenabled?: boolean;
  kubernetesclusterexperimentalfeaturesenabled?: boolean;
  defaultuipagesize?: number;
  instancesstatsuseronly?: boolean;
}

export interface Pod {
  id: string;
  name: string;
  zonename?: string;
  gateway?: string;
  netmask?: string;
  allocationstate?: string;
  [key: string]: unknown;
}

export interface Configuration {
  name: string;
  value?: string;
  category?: string;
  description?: string;
  [key: string]: unknown;
}

export interface ListCapabilitiesResponse {
  listcapabilitiesresponse: {
    capability?: CloudStackCapability;
  };
}
