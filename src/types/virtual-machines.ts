/**
 * Virtual Machine Type Definitions
 */

import type { CloudStackTag } from './common.js';

export type VmState = 'Running' | 'Stopped' | 'Starting' | 'Stopping' |
  'Destroyed' | 'Expunging' | 'Error' | 'Migrating' | 'Shutdowned' | 'Unknown';

export interface VirtualMachine {
  id: string;
  name: string;
  displayname?: string;
  account?: string;
  accountid?: string;
  domain?: string;
  domainid?: string;
  created?: string;
  state: VmState;
  haenable?: boolean;
  groupid?: string;
  group?: string;
  zoneid: string;
  zonename?: string;
  hostid?: string;
  hostname?: string;
  templateid: string;
  templatename?: string;
  templatedisplaytext?: string;
  passwordenabled?: boolean;
  serviceofferingid: string;
  serviceofferingname?: string;
  cpunumber?: number;
  cpuspeed?: number;
  memory?: number;
  cpuused?: string;
  networkkbsread?: number;
  networkkbswrite?: number;
  diskkbsread?: number;
  diskkbswrite?: number;
  diskioread?: number;
  diskiowrite?: number;
  disksize?: number;
  hypervisor?: string;
  guestosid?: string;
  rootdeviceid?: number;
  rootdevicetype?: string;
  securitygroup?: Array<{ id: string; name: string }>;
  nic?: Array<{
    id: string;
    networkid: string;
    netmask: string;
    gateway: string;
    ipaddress: string;
    isolationuri?: string;
    broadcasturi?: string;
    traffictype: string;
    type: string;
    isdefault: boolean;
    macaddress?: string;
  }>;
  affinitygroup?: Array<{ id: string; name: string; type: string }>;
  isdynamicallyscalable?: boolean;
  tags?: CloudStackTag[];
}

export interface ListVirtualMachinesResponse {
  listvirtualmachinesresponse: {
    count?: number;
    virtualmachine?: VirtualMachine[];
  };
}

export interface DeployVirtualMachineResponse {
  deployvirtualmachineresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface StartVirtualMachineResponse {
  startvirtualmachineresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface StopVirtualMachineResponse {
  stopvirtualmachineresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface RebootVirtualMachineResponse {
  rebootvirtualmachineresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface DestroyVirtualMachineResponse {
  destroyvirtualmachineresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface ScaleVirtualMachineResponse {
  scalevirtualmachineresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface MigrateVirtualMachineResponse {
  migratevirtualmachineresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface ResetPasswordVirtualMachineResponse {
  resetpasswordforvirtualmachineresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface ChangeServiceForVirtualMachineResponse {
  changeserviceforvirtualmachineresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface ListVirtualMachinesMetricsResponse {
  listvirtualmachinesmetricsresponse: {
    count?: number;
    virtualmachine?: VirtualMachine[];
  };
}
