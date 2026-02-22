/**
 * Project Type Definitions
 */

export interface Project {
  id: string;
  name: string;
  displaytext: string;
  account?: string;
  domain?: string;
  domainid?: string;
  state: string;
  created?: string;
  cpuavailable?: string;
  memoryavailable?: string;
  vmavailable?: string;
  vpcavailable?: string;
}

export interface ProjectAccount {
  id: string;
  accountid: string;
  account: string;
  domain?: string;
  domainid?: string;
  role: string;
}

export interface ProjectInvitation {
  id: string;
  projectid: string;
  project: string;
  account?: string;
  email?: string;
  domain?: string;
  state: string;
}

export interface ListProjectsResponse {
  listprojectsresponse: {
    count?: number;
    project?: Project[];
  };
}

export interface ListProjectAccountsResponse {
  listprojectaccountsresponse: {
    count?: number;
    projectaccount?: ProjectAccount[];
  };
}

export interface ListProjectInvitationsResponse {
  listprojectinvitationsresponse: {
    count?: number;
    projectinvitation?: ProjectInvitation[];
  };
}
