import type { CloudStackParams } from '../cloudstack-client.js';

/**
 * Type definitions for monitoring-related operations
 * All interfaces extend CloudStackParams for compatibility with the API client
 */

/**
 * Arguments for deleting events
 */
export interface DeleteEventsArgs extends CloudStackParams {
  /** Comma-separated list of event IDs to delete */
  ids?: string;
  /** Event type to filter deletion */
  type?: string;
  /** Start date in YYYY-MM-DD format (requires enddate) */
  startdate?: string;
  /** End date in YYYY-MM-DD format (can be used alone to delete events older than this date) */
  enddate?: string;
}

/**
 * Arguments for archiving events
 */
export interface ArchiveEventsArgs extends CloudStackParams {
  /** Comma-separated list of event IDs to archive */
  ids?: string;
  /** Event type to filter archival */
  type?: string;
  /** Start date in YYYY-MM-DD format (requires enddate) */
  startdate?: string;
  /** End date in YYYY-MM-DD format (can be used alone to archive events older than this date) */
  enddate?: string;
}

/**
 * Arguments for deleting alerts
 */
export interface DeleteAlertsArgs extends CloudStackParams {
  /** Comma-separated list of alert IDs to delete */
  ids?: string;
  /** Alert type to filter deletion */
  type?: string;
  /** Start date in YYYY-MM-DD format (requires enddate) */
  startdate?: string;
  /** End date in YYYY-MM-DD format (can be used alone to delete alerts older than this date) */
  enddate?: string;
}

/**
 * Arguments for archiving alerts
 */
export interface ArchiveAlertsArgs extends CloudStackParams {
  /** Comma-separated list of alert IDs to archive */
  ids?: string;
  /** Alert type to filter archival */
  type?: string;
  /** Start date in YYYY-MM-DD format (requires enddate) */
  startdate?: string;
  /** End date in YYYY-MM-DD format (can be used alone to archive alerts older than this date) */
  enddate?: string;
}

/**
 * Arguments for listing events
 */
export interface ListEventsArgs extends CloudStackParams {
  /** Event level (INFO, WARN, ERROR) */
  level?: string;
  /** Event type */
  type?: string;
  /** Start date (YYYY-MM-DD) */
  startdate?: string;
  /** End date (YYYY-MM-DD) */
  enddate?: string;
}

/**
 * Arguments for listing alerts
 */
export interface ListAlertsArgs extends CloudStackParams {
  /** Alert type */
  type?: string;
}
