/**
 * Security Type Definitions
 */

import type { CloudStackTag } from './common.js';

export interface SecurityGroup {
  id: string;
  name: string;
  description?: string;
  account?: string;
  domainid?: string;
  domain?: string;
  ingressrule?: Array<{
    ruleid: string;
    protocol: string;
    startport?: number;
    endport?: number;
    cidr?: string;
  }>;
  egressrule?: Array<{
    ruleid: string;
    protocol: string;
    startport?: number;
    endport?: number;
    cidr?: string;
  }>;
  tags?: CloudStackTag[];
}

export interface SSHKeyPair {
  name: string;
  fingerprint: string;
  privatekey?: string;
  account?: string;
  domainid?: string;
  domain?: string;
}

export interface ListSecurityGroupsResponse {
  listsecuritygroupsresponse: {
    count?: number;
    securitygroup?: SecurityGroup[];
  };
}

export interface CreateSecurityGroupRuleResponse {
  createsecuritygroupruleresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface AuthorizeSecurityGroupIngressResponse {
  authorizesecuritygroupingressresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface ListSSHKeyPairsResponse {
  listsshkeypairsresponse: {
    count?: number;
    sshkeypair?: SSHKeyPair[];
  };
}

export interface CreateSSHKeyPairResponse {
  createsshkeypairresponse: SSHKeyPair;
}
