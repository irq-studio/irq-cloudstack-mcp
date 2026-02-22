/**
 * AutoScale Type Definitions
 */

export interface AutoScalePolicy {
  id: string;
  action: string;
  duration: number;
  quiettime?: number;
  conditionids?: string;
  account?: string;
  domain?: string;
  domainid?: string;
}

export interface AutoScaleVmGroup {
  id: string;
  lbruleid: string;
  vmprofileid: string;
  minmembers: number;
  maxmembers: number;
  interval?: number;
  state: string;
  scaleuppolicies?: string[];
  scaledownpolicies?: string[];
  account?: string;
  domain?: string;
  domainid?: string;
}

export interface AutoScaleVmProfile {
  id: string;
  serviceofferingid: string;
  templateid: string;
  zoneid: string;
  destroyvmgraceperiod?: number;
  otherdeployparams?: string;
  account?: string;
  domain?: string;
  domainid?: string;
}

export interface AutoScaleCondition {
  id: string;
  counterid: string;
  relationaloperator: string;
  threshold: number;
  account?: string;
  domain?: string;
  domainid?: string;
}

export interface AutoScaleCounter {
  id: string;
  name: string;
  source: string;
  value: string;
  zoneid?: string;
}

export interface ListAutoScalePoliciesResponse {
  listautoscalepoliciesresponse: {
    count?: number;
    autoscalepolicy?: AutoScalePolicy[];
  };
}

export interface ListAutoScaleVmGroupsResponse {
  listautoscalevmgroupsresponse: {
    count?: number;
    autoscalevmgroup?: AutoScaleVmGroup[];
  };
}

export interface ListAutoScaleVmProfilesResponse {
  listautoscalevmprofilesresponse: {
    count?: number;
    autoscalevmprofile?: AutoScaleVmProfile[];
  };
}

export interface ListConditionsResponse {
  listconditionsresponse: {
    count?: number;
    condition?: AutoScaleCondition[];
  };
}

export interface ListCountersResponse {
  listcountersresponse: {
    count?: number;
    counter?: AutoScaleCounter[];
  };
}
