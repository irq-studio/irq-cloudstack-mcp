import type { CloudStackClient } from '../cloudstack-client.js';
import type {
  DeleteEventsArgs,
  ArchiveEventsArgs,
  DeleteAlertsArgs,
  ArchiveAlertsArgs,
  ListEventsArgs,
  ListAlertsArgs,
} from '../types/monitoring-arg-types.js';
import type {
  ListCapacityArgs,
  ListAsyncJobsArgs,
  ListUsageRecordsArgs,
} from '../handler-types.js';
import type {
  ListEventsResponse,
  Event,
  ListAlertsResponse,
  Alert,
  DeleteEventsResponse,
  ArchiveEventsResponse,
  DeleteAlertsResponse,
  ArchiveAlertsResponse,
  ListCapacityResponse,
  Capacity,
  ListAsyncJobsResponse,
  AsyncJob,
  ListUsageRecordsResponse,
  UsageRecord,
  EventType,
  UsageType,
  Annotation,
} from '../types/index.js';
import {
  validateDateRange,
  sanitizeIdList,
  requireAtLeastOneParam,
  checkApiSuccess,
} from '../utils/validation.js';
import {
  createListHandler,
  createActionHandler,
} from '../utils/index.js';
import { Logger } from '../utils/logger.js';

export class MonitoringHandlers {
  // Handler instances
  public readonly handleListEventTypes;
  public readonly handleListUsageTypes;
  public readonly handleListAnnotations;
  public readonly handleGenerateUsageRecords;
  public readonly handleAddAnnotation;
  public readonly handleRemoveAnnotation;
  private readonly logger: Logger;

  constructor(private readonly cloudStackClient: CloudStackClient) {
    this.logger = new Logger({ service: 'monitoring-handlers' });

    this.handleListEventTypes = createListHandler<EventType>(cloudStackClient, {
      command: 'listEventTypes',
      responseKey: 'listeventtypesresponse',
      arrayKey: 'eventtype',
      itemName: 'event type',
      titleField: 'name',
      idField: 'name',
      fields: [
        { key: 'name', label: 'Name' },
      ],
    });

    this.handleGenerateUsageRecords = createActionHandler(cloudStackClient, {
      command: 'generateUsageRecords',
      responseKey: 'generateusagerecordsresponse',
      actionVerb: 'Generated',
      itemName: 'usage records',
      requiredFields: ['startdate', 'enddate'],
    });

    this.handleListUsageTypes = createListHandler<UsageType>(cloudStackClient, {
      command: 'listUsageTypes',
      responseKey: 'listusagetypesresponse',
      arrayKey: 'usagetype',
      itemName: 'usage type',
      titleField: 'description',
      idField: 'usagetypeid',
      fields: [
        { key: 'description', label: 'Description', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'usagetypeid', label: 'Usage Type ID', format: (v: unknown) => v ? String(v) : 'N/A' },
      ],
    });

    this.handleAddAnnotation = createActionHandler(cloudStackClient, {
      command: 'addAnnotation',
      responseKey: 'addannotationresponse',
      actionVerb: 'Added',
      itemName: 'annotation',
      requiredFields: ['entityid', 'entitytype', 'annotation'],
    });

    this.handleRemoveAnnotation = createActionHandler(cloudStackClient, {
      command: 'removeAnnotation',
      responseKey: 'removeannotationresponse',
      actionVerb: 'Removed',
      itemName: 'annotation',
      requiredFields: ['id'],
    });

    this.handleListAnnotations = createListHandler<Annotation>(cloudStackClient, {
      command: 'listAnnotations',
      responseKey: 'listannotationsresponse',
      arrayKey: 'annotation',
      itemName: 'annotation',
      titleField: 'annotation',
      idField: 'id',
      fields: [
        { key: 'annotation', label: 'Annotation', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'entityid', label: 'Entity ID', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'entitytype', label: 'Entity Type', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'created', label: 'Created', format: (v: unknown) => v ? String(v) : 'N/A' },
      ],
    });
  }

  /**
   * Lists events from CloudStack
   * @param args - Event filter criteria
   * @returns MCP response with event list
   */
  async handleListEvents(args: ListEventsArgs) {
    // Validate dates if provided
    if (args.startdate || args.enddate) {
      validateDateRange(args.startdate, args.enddate);
    }

    const result = await this.cloudStackClient.listEvents<ListEventsResponse>(args);
    const events = result.listeventsresponse?.event || [];

    const eventList = events.map((event: Event) => ({
      id: event.id,
      type: event.type,
      description: event.description,
      level: event.level,
      created: event.created,
      username: event.username,
      domain: event.domain,
    }));

    return {
      content: [
        {
          type: 'text' as const,
          text: `Found ${eventList.length} events:\n\n${eventList
            .map(
              (event) =>
                `• ${event.type} (${event.id})\n  Description: ${event.description}\n  Level: ${event.level}\n  User: ${event.username}\n  Domain: ${event.domain}\n  Created: ${event.created}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  /**
   * Lists alerts from CloudStack
   * @param args - Alert filter criteria
   * @returns MCP response with alert list
   */
  async handleListAlerts(args: ListAlertsArgs) {
    const result = await this.cloudStackClient.listAlerts<ListAlertsResponse>(args);
    const alerts = result.listalertsresponse?.alert || [];

    const alertList = alerts.map((alert: Alert) => ({
      id: alert.id,
      type: alert.type,
      description: alert.description,
      sent: alert.sent,
      name: alert.name,
    }));

    return {
      content: [
        {
          type: 'text' as const,
          text: `Found ${alertList.length} alerts:\n\n${alertList
            .map(
              (alert) =>
                `• ${alert.name} (${alert.id})\n  Type: ${alert.type}\n  Description: ${alert.description}\n  Sent: ${alert.sent}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  /**
   * Deletes alerts from CloudStack
   * @param args - Deletion criteria (IDs, type, or date range)
   * @returns MCP response with operation result
   * @throws Error if validation fails or API operation fails
   */
  async handleDeleteAlerts(args: DeleteAlertsArgs) {
    // Validate date range first (this includes checking that startdate requires enddate)
    if (args.startdate || args.enddate) {
      validateDateRange(args.startdate, args.enddate);
    }

    // Validate that at least one parameter is provided
    requireAtLeastOneParam(args, ['ids', 'type', 'enddate'], 'delete_alerts');

    // Sanitize IDs if provided (create new args to avoid mutation)
    const sanitizedArgs = args.ids ? { ...args, ids: sanitizeIdList(args.ids) } : args;

    this.logger.info('Audit: delete_alerts', { operation: 'delete_alerts', parameters: sanitizedArgs });

    const result = await this.cloudStackClient.deleteAlerts<DeleteAlertsResponse>(sanitizedArgs);

    // Check for success and throw error if failed
    checkApiSuccess(result, 'deletealertsresponse');

    const displaytext =
      result.deletealertsresponse?.displaytext || 'Alerts deleted successfully';

    return {
      content: [
        {
          type: 'text' as const,
          text: `Successfully deleted alerts: ${displaytext}`,
        },
      ],
    };
  }

  /**
   * Archives alerts from CloudStack
   * @param args - Archival criteria (IDs, type, or date range)
   * @returns MCP response with operation result
   * @throws Error if validation fails or API operation fails
   */
  async handleArchiveAlerts(args: ArchiveAlertsArgs) {
    // Validate date range first (this includes checking that startdate requires enddate)
    if (args.startdate || args.enddate) {
      validateDateRange(args.startdate, args.enddate);
    }

    // Validate that at least one parameter is provided
    requireAtLeastOneParam(args, ['ids', 'type', 'enddate'], 'archive_alerts');

    // Sanitize IDs if provided (create new args to avoid mutation)
    const sanitizedArgs = args.ids ? { ...args, ids: sanitizeIdList(args.ids) } : args;

    this.logger.info('Audit: archive_alerts', { operation: 'archive_alerts', parameters: sanitizedArgs });

    const result = await this.cloudStackClient.archiveAlerts<ArchiveAlertsResponse>(sanitizedArgs);

    // Check for success and throw error if failed
    checkApiSuccess(result, 'archivealertsresponse');

    const displaytext =
      result.archivealertsresponse?.displaytext || 'Alerts archived successfully';

    return {
      content: [
        {
          type: 'text' as const,
          text: `Successfully archived alerts: ${displaytext}`,
        },
      ],
    };
  }

  /**
   * Deletes events from CloudStack
   * @param args - Deletion criteria (IDs, type, or date range)
   * @returns MCP response with operation result
   * @throws Error if validation fails or API operation fails
   */
  async handleDeleteEvents(args: DeleteEventsArgs) {
    // Validate date range first (this includes checking that startdate requires enddate)
    if (args.startdate || args.enddate) {
      validateDateRange(args.startdate, args.enddate);
    }

    // Validate that at least one parameter is provided
    requireAtLeastOneParam(args, ['ids', 'type', 'enddate'], 'delete_events');

    // Sanitize IDs if provided (create new args to avoid mutation)
    const sanitizedArgs = args.ids ? { ...args, ids: sanitizeIdList(args.ids) } : args;

    this.logger.info('Audit: delete_events', { operation: 'delete_events', parameters: sanitizedArgs });

    const result = await this.cloudStackClient.deleteEvents<DeleteEventsResponse>(sanitizedArgs);

    // Check for success and throw error if failed
    checkApiSuccess(result, 'deleteeventsresponse');

    const displaytext =
      result.deleteeventsresponse?.displaytext || 'Events deleted successfully';

    return {
      content: [
        {
          type: 'text' as const,
          text: `Successfully deleted events: ${displaytext}`,
        },
      ],
    };
  }

  /**
   * Archives events from CloudStack
   * @param args - Archival criteria (IDs, type, or date range)
   * @returns MCP response with operation result
   * @throws Error if validation fails or API operation fails
   */
  async handleArchiveEvents(args: ArchiveEventsArgs) {
    // Validate date range first (this includes checking that startdate requires enddate)
    if (args.startdate || args.enddate) {
      validateDateRange(args.startdate, args.enddate);
    }

    // Validate that at least one parameter is provided
    requireAtLeastOneParam(args, ['ids', 'type', 'enddate'], 'archive_events');

    // Sanitize IDs if provided (create new args to avoid mutation)
    const sanitizedArgs = args.ids ? { ...args, ids: sanitizeIdList(args.ids) } : args;

    this.logger.info('Audit: archive_events', { operation: 'archive_events', parameters: sanitizedArgs });

    const result = await this.cloudStackClient.archiveEvents<ArchiveEventsResponse>(sanitizedArgs);

    // Check for success and throw error if failed
    checkApiSuccess(result, 'archiveeventsresponse');

    const displaytext =
      result.archiveeventsresponse?.displaytext || 'Events archived successfully';

    return {
      content: [
        {
          type: 'text' as const,
          text: `Successfully archived events: ${displaytext}`,
        },
      ],
    };
  }

  async handleListCapacity(args: ListCapacityArgs) {
    const result = await this.cloudStackClient.listCapacity<ListCapacityResponse>(args);
    const capacities = result.listcapacityresponse?.capacity || [];

    const capacityList = capacities.map((capacity: Capacity) => ({
      type: capacity.type,
      zonename: capacity.zonename,
      capacityused: capacity.capacityused,
      capacitytotal: capacity.capacitytotal,
      percentused: capacity.percentused,
    }));

    return {
      content: [
        {
          type: 'text' as const,
          text: `Found ${capacityList.length} capacity metrics:\n\n${capacityList
            .map(
              (cap) =>
                `• Type: ${cap.type}\n  Zone: ${cap.zonename}\n  Used: ${cap.capacityused}\n  Total: ${cap.capacitytotal}\n  Percent Used: ${cap.percentused}%\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  async handleListAsyncJobs(args: ListAsyncJobsArgs) {
    const result = await this.cloudStackClient.listAsyncJobs<ListAsyncJobsResponse>(args);
    const jobs = result.listasyncjobsresponse?.asyncjobs || [];

    const jobList = jobs.map((job: AsyncJob) => ({
      jobid: job.jobid,
      cmd: job.cmd,
      jobstatus: job.jobstatus,
      created: job.created,
      userid: job.userid,
      instancetype: job.jobinstancetype,
      instanceid: job.jobinstanceid,
    }));

    return {
      content: [
        {
          type: 'text' as const,
          text: `Found ${jobList.length} async jobs:\n\n${jobList
            .map(
              (job) =>
                `• Job ID: ${job.jobid}\n  Command: ${job.cmd}\n  Status: ${job.jobstatus}\n  Created: ${job.created}\n  Instance: ${job.instancetype} (${job.instanceid})\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  async handleListUsageRecords(args: ListUsageRecordsArgs) {
    const result = await this.cloudStackClient.listUsageRecords<ListUsageRecordsResponse>(args);
    const records = result.listusagerecordsresponse?.usagerecord || [];

    const recordList = records.map((record: UsageRecord) => ({
      usageid: record.usageid,
      description: record.description,
      usagetype: record.usagetype,
      rawusage: record.rawusage,
      usage: record.usage,
      startdate: record.startdate,
      enddate: record.enddate,
    }));

    return {
      content: [
        {
          type: 'text' as const,
          text: `Found ${recordList.length} usage records:\n\n${recordList
            .map(
              (record) =>
                `• ${record.description} (${record.usageid})\n  Type: ${record.usagetype}\n  Usage: ${record.usage}\n  Start: ${record.startdate}\n  End: ${record.enddate}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }
}
