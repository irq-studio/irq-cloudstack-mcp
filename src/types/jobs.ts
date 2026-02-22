/**
 * Async Job Type Definitions
 */

export interface AsyncJobResult {
  queryasyncjobresultresponse: {
    accountid?: string;
    userid?: string;
    cmd?: string;
    jobstatus: number;
    jobprocstatus?: number;
    jobresultcode?: number;
    jobresulttype?: string;
    jobresult?: unknown;
    jobinstancetype?: string;
    jobinstanceid?: string;
    created?: string;
    jobid: string;
  };
}
