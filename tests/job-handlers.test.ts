import { JobHandlers } from '../src/handlers/job-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

// Mock CloudStackClient
jest.mock('../src/cloudstack-client.js');

describe('JobHandlers', () => {
  let handlers: JobHandlers;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;
    handlers = new JobHandlers(mockClient);
  });

  describe('handleQueryAsyncJobResult', () => {
    it('should query in-progress job successfully', async () => {
      const mockResponse = {
        queryasyncjobresultresponse: {
          jobid: 'job-123',
          jobstatus: 0,
          jobprocstatus: 50,
          jobresultcode: null,
        },
      };
      mockClient.queryAsyncJobResult = jest.fn().mockResolvedValue(mockResponse);

      const args = { jobid: 'job-123' };
      const result = await handlers.handleQueryAsyncJobResult(args);

      expect(mockClient.queryAsyncJobResult).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('job-123');
      expect(result.content[0].text).toContain('In Progress');
      expect(result.content[0].text).toContain('50%');
    });

    it('should query completed job successfully', async () => {
      const mockResponse = {
        queryasyncjobresultresponse: {
          jobid: 'job-456',
          jobstatus: 1,
          jobprocstatus: 100,
          jobresultcode: 0,
          jobresult: {
            virtualmachine: {
              id: 'vm-789',
              name: 'test-vm',
            },
          },
        },
      };
      mockClient.queryAsyncJobResult = jest.fn().mockResolvedValue(mockResponse);

      const args = { jobid: 'job-456' };
      const result = await handlers.handleQueryAsyncJobResult(args);

      expect(mockClient.queryAsyncJobResult).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('job-456');
      expect(result.content[0].text).toContain('Completed');
      expect(result.content[0].text).toContain('Result:');
    });

    it('should query failed job successfully', async () => {
      const mockResponse = {
        queryasyncjobresultresponse: {
          jobid: 'job-999',
          jobstatus: 2,
          jobprocstatus: 0,
          jobresultcode: 530,
          jobresult: {
            errortext: 'Insufficient capacity',
          },
        },
      };
      mockClient.queryAsyncJobResult = jest.fn().mockResolvedValue(mockResponse);

      const args = { jobid: 'job-999' };
      const result = await handlers.handleQueryAsyncJobResult(args);

      expect(mockClient.queryAsyncJobResult).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('job-999');
      expect(result.content[0].text).toContain('Failed');
      expect(result.content[0].text).toContain('530');
    });

    it('should handle API errors', async () => {
      mockClient.queryAsyncJobResult = jest.fn().mockRejectedValue(new Error('Job not found'));

      const args = { jobid: 'invalid-job' };

      await expect(handlers.handleQueryAsyncJobResult(args)).rejects.toThrow('Job not found');
    });

    it('should handle unknown job status', async () => {
      const mockResponse = {
        queryasyncjobresultresponse: {
          jobid: 'job-unknown',
          jobstatus: 99,
          jobprocstatus: 0,
        },
      };
      mockClient.queryAsyncJobResult = jest.fn().mockResolvedValue(mockResponse);

      const args = { jobid: 'job-unknown' };
      const result = await handlers.handleQueryAsyncJobResult(args);

      expect(result.content[0].text).toContain('Unknown');
    });
  });
});
