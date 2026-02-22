/**
 * Monitoring Type Definitions
 */

export interface Event {
  id: string;
  username?: string;
  type: string;
  level: string;
  description: string;
  account?: string;
  domainid?: string;
  domain?: string;
  created: string;
  state: string;
  parentid?: string;
}

export interface Alert {
  id: string;
  type: number;
  description: string;
  sent?: string;
  name?: string;
}

export interface Capacity {
  type: number;
  capacityused: number;
  capacitytotal: number;
  percentused: string;
  zoneid?: string;
  zonename?: string;
  podid?: string;
  podname?: string;
}

export interface EventType {
  name: string;
  [key: string]: unknown;
}

export interface UsageType {
  description: string;
  usagetypeid: string;
  [key: string]: unknown;
}

export interface Annotation {
  id: string;
  annotation: string;
  entityid?: string;
  entitytype?: string;
  created?: string;
  [key: string]: unknown;
}

export interface ListEventsResponse {
  listeventsresponse: {
    count?: number;
    event?: Event[];
  };
}

export interface DeleteEventsResponse {
  deleteeventsresponse: {
    success?: boolean;
    displaytext?: string;
  };
}

export interface ArchiveEventsResponse {
  archiveeventsresponse: {
    success?: boolean;
    displaytext?: string;
  };
}

export interface ListAlertsResponse {
  listalertsresponse: {
    count?: number;
    alert?: Alert[];
  };
}

export interface DeleteAlertsResponse {
  deletealertsresponse: {
    success?: boolean;
    displaytext?: string;
  };
}

export interface ArchiveAlertsResponse {
  archivealertsresponse: {
    success?: boolean;
    displaytext?: string;
  };
}

export interface ListCapacityResponse {
  listcapacityresponse: {
    count?: number;
    capacity?: Capacity[];
  };
}

export interface AsyncJob {
  jobid: string;
  cmd: string;
  jobstatus: number;
  created: string;
  userid?: string;
  jobinstancetype?: string;
  jobinstanceid?: string;
}

export interface ListAsyncJobsResponse {
  listasyncjobsresponse: {
    count?: number;
    asyncjobs?: AsyncJob[];
  };
}

export interface UsageRecord {
  usageid: string;
  description: string;
  usagetype: number;
  rawusage: string;
  usage: string;
  startdate: string;
  enddate: string;
  account?: string;
  accountid?: string;
  domainid?: string;
  domain?: string;
}

export interface ListUsageRecordsResponse {
  listusagerecordsresponse: {
    count?: number;
    usagerecord?: UsageRecord[];
  };
}
