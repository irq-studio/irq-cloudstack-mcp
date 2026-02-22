/**
 * Affinity Group Type Definitions
 */

export interface AffinityGroup {
  id: string;
  name: string;
  description?: string;
  type: string;
  account?: string;
  domainid?: string;
  domain?: string;
  virtualmachineIds?: string[];
}

export interface AffinityGroupType {
  type: string;
  [key: string]: unknown;
}

export interface CreateAffinityGroupResponse {
  createaffinitygroupresponse: {
    id?: string;
    jobid?: string;
    affinitygroup?: AffinityGroup;
  };
}

export interface DeleteAffinityGroupResponse {
  deleteaffinitygroupresponse: {
    success?: boolean;
    jobid?: string;
  };
}

export interface ListAffinityGroupsResponse {
  listaffinitygroupsresponse: {
    count?: number;
    affinitygroup?: AffinityGroup[];
  };
}
