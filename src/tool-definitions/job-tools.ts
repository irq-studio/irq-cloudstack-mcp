export const jobTools = [
  {
    name: 'query_async_job_result',
    description: 'Query the status and result of an asynchronous job',
    inputSchema: {
      type: 'object',
      properties: {
        jobid: {
          type: 'string',
          description: 'Async job ID',
        },
      },
      required: ['jobid'],
      additionalProperties: false,
    },
  },
] as const;
