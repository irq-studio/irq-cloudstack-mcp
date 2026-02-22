/**
 * Storage Type Definitions
 */

import type { CloudStackTag } from './common.js';

export interface Volume {
  id: string;
  name: string;
  zoneid: string;
  zonename?: string;
  type: string;
  deviceid?: number;
  virtualmachineid?: string;
  vmname?: string;
  vmdisplayname?: string;
  vmstate?: string;
  size: number;
  created?: string;
  state: string;
  account?: string;
  domainid?: string;
  domain?: string;
  storagetype?: string;
  hypervisor?: string;
  diskofferingid?: string;
  diskofferingname?: string;
  diskofferingdisplaytext?: string;
  storage?: string;
  destroyed?: boolean;
  isextractable?: boolean;
  path?: string;
  tags?: CloudStackTag[];
}

export interface Snapshot {
  id: string;
  account?: string;
  domainid?: string;
  domain?: string;
  snapshottype?: string;
  volumeid: string;
  volumename?: string;
  volumetype?: string;
  created?: string;
  name: string;
  intervaltype?: string;
  state: string;
  revertable?: boolean;
  tags?: CloudStackTag[];
}

export interface ImageStore {
  id: string;
  name: string;
  url?: string;
  protocol?: string;
  zonename?: string;
  [key: string]: unknown;
}

export interface SnapshotPolicy {
  id: string;
  volumeid?: string;
  intervaltype?: string;
  schedule?: string;
  timezone?: string;
  maxsnaps?: number;
  [key: string]: unknown;
}

export interface ListVolumesResponse {
  listvolumesresponse: {
    count?: number;
    volume?: Volume[];
  };
}

export interface CreateVolumeResponse {
  createvolumeresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface AttachVolumeResponse {
  attachvolumeresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface DetachVolumeResponse {
  detachvolumeresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface ResizeVolumeResponse {
  resizevolumeresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface DeleteVolumeResponse {
  deletevolumeresponse: {
    success?: boolean;
    jobid?: string;
  };
}

export interface CreateSnapshotResponse {
  createsnapshotresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface ListSnapshotsResponse {
  listsnapshotsresponse: {
    count?: number;
    snapshot?: Snapshot[];
  };
}

export interface DeleteSnapshotResponse {
  deletesnapshotresponse: {
    success?: boolean;
    jobid?: string;
  };
}

export interface RevertSnapshotResponse {
  revertsnapshotresponse: {
    id?: string;
    jobid?: string;
  };
}
