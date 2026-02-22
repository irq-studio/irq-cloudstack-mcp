/**
 * Backup Type Definitions
 */

export interface BackupSchedule {
  id: string;
  virtualmachineid: string;
  intervaltype: string;
  schedule: string;
  timezone: string;
}

export interface BackupOffering {
  id: string;
  name: string;
  description: string;
  zoneid: string;
  zonename?: string;
  externalid?: string;
}

export interface BackupProviderOffering {
  id: string;
  name: string;
  description?: string;
  externalid?: string;
}

export interface Backup {
  id: string;
  virtualmachineid: string;
  virtualmachinename?: string;
  backupofferingid: string;
  backupofferingname?: string;
  zoneid: string;
  zonename?: string;
  status: string;
  size?: number;
  date?: string;
  type?: string;
  account?: string;
  domain?: string;
  domainid?: string;
}

export interface ListBackupOfferingsResponse {
  listbackupofferingsresponse: {
    count?: number;
    backupoffering?: BackupOffering[];
  };
}

export interface ListBackupProviderOfferingsResponse {
  listbackupproviderofferingsresponse: {
    count?: number;
    backupprovideroffering?: BackupProviderOffering[];
  };
}

export interface ListBackupsResponse {
  listbackupsresponse: {
    count?: number;
    backup?: Backup[];
  };
}
