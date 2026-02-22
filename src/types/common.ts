/**
 * Common CloudStack Type Definitions
 */

export interface CloudStackJob {
  jobid: string;
  jobstatus: number;
  jobprocstatus?: number;
  jobresult?: unknown;
  jobresultcode?: number;
  jobresulttype?: string;
  created?: string;
  cmd?: string;
}

export interface CloudStackTag {
  key: string;
  value: string;
  resourcetype: string;
  resourceid: string;
  account?: string;
  domain?: string;
  domainid?: string;
  customer?: string;
}
