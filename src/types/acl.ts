/**
 * Network ACL Type Definitions
 */

export interface NetworkACL {
  id: string;
  protocol: string;
  startport?: string;
  endport?: string;
  cidrlist?: string;
  icmptype?: number;
  icmpcode?: number;
  traffictype: string;
  state: string;
  action: string;
  number?: number;
  aclid: string;
  fordisplay?: boolean;
}

export interface NetworkACLList {
  id: string;
  name: string;
  description: string;
  vpcid: string;
  fordisplay?: boolean;
}

export interface ListNetworkACLsResponse {
  listnetworkaclsresponse: {
    count?: number;
    networkacl?: NetworkACL[];
  };
}

export interface ListNetworkACLListsResponse {
  listnetworkacllistsresponse: {
    count?: number;
    networkacllist?: NetworkACLList[];
  };
}
