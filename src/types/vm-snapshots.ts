/**
 * VM Snapshot Type Definitions
 */

export interface VMSnapshot {
  id: string;
  name: string;
  displayname?: string;
  description?: string;
  virtualmachineid: string;
  state: string;
  type: string;
  current?: boolean;
  created?: string;
  parent?: string;
  parentName?: string;
  zoneid?: string;
  account?: string;
  domain?: string;
  domainid?: string;
}

export interface ListVMSnapshotsResponse {
  listvmsnapshotresponse: {
    count?: number;
    vmSnapshot?: VMSnapshot[];
  };
}
