import type { CloudStackClient } from '../cloudstack-client.js';
import type { QueryAsyncJobResultArgs } from '../handler-types.js';
import type { AsyncJobResult } from '../types/index.js';

export class JobHandlers {
  constructor(private readonly cloudStackClient: CloudStackClient) {}

  async handleQueryAsyncJobResult(args: QueryAsyncJobResultArgs) {
    const result = await this.cloudStackClient.queryAsyncJobResult<AsyncJobResult>(args);
    const job = result.queryasyncjobresultresponse;

    const statusMap: { [key: number]: string } = {
      0: 'In Progress',
      1: 'Completed',
      2: 'Failed'
    };

    return {
      content: [{
        type: 'text' as const,
        text: `Async Job ${args.jobid}:\n\nStatus: ${statusMap[job?.jobstatus] || 'Unknown'} (${job?.jobstatus})\nProgress: ${job?.jobprocstatus || 0}%\nResult Code: ${job?.jobresultcode || 'N/A'}\n${job?.jobresult ? `\nResult:\n${JSON.stringify(job.jobresult, null, 2)}` : ''}`
      }]
    };
  }
}
