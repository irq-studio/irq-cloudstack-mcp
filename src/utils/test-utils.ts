/**
 * Table-Driven Test Utilities
 * Eliminates copy-paste test patterns with declarative test definitions
 */

import type { CloudStackClient } from '../cloudstack-client.js';

/**
 * Mock response configuration
 */
export interface MockResponse {
  /** Response wrapper key (e.g., 'listvirtualmachinesresponse') */
  responseKey: string;
  /** Array key within response (e.g., 'virtualmachine') */
  arrayKey?: string;
  /** Mock data */
  data: Record<string, unknown> | Record<string, unknown>[];
  /** Count field (optional) */
  count?: number;
}

/**
 * List handler test case
 */
export interface ListHandlerTestCase<TArgs = Record<string, unknown>> {
  /** Test name */
  name: string;
  /** Handler arguments */
  args: TArgs;
  /** Mock response */
  mockResponse: MockResponse;
  /** Expected text patterns in output */
  expectedPatterns: (string | RegExp)[];
  /** Patterns that should NOT appear */
  unexpectedPatterns?: (string | RegExp)[];
  /** Expected item count */
  expectedCount?: number;
  /** Should throw error */
  shouldThrow?: boolean;
  /** Expected error message pattern */
  expectedError?: string | RegExp;
}

/**
 * Action handler test case
 */
export interface ActionHandlerTestCase<TArgs = Record<string, unknown>> {
  /** Test name */
  name: string;
  /** Handler arguments */
  args: TArgs;
  /** Mock response */
  mockResponse: MockResponse;
  /** Expected text patterns in output */
  expectedPatterns: (string | RegExp)[];
  /** Should throw error */
  shouldThrow?: boolean;
  /** Expected error message pattern */
  expectedError?: string | RegExp;
}

/**
 * Build mock response object
 */
export function buildMockResponse(config: MockResponse): Record<string, unknown> {
  const data = Array.isArray(config.data) ? config.data : [config.data];
  const response: Record<string, unknown> = {};

  if (config.arrayKey) {
    response[config.responseKey] = {
      count: config.count ?? data.length,
      [config.arrayKey]: data,
    };
  } else {
    response[config.responseKey] = config.data;
  }

  return response;
}

/**
 * Create a mock CloudStack client for testing
 */
export function createMockClient(): jest.Mocked<CloudStackClient> {
  return {
    request: jest.fn(),
    close: jest.fn(),
    // Add other methods as needed
  } as unknown as jest.Mocked<CloudStackClient>;
}

/**
 * Run table-driven tests for list handlers
 */
export function runListHandlerTests<THandler, TArgs = Record<string, unknown>>(
  description: string,
  createHandler: () => THandler,
  handlerMethod: keyof THandler,
  mockClientMethod: string,
  testCases: ListHandlerTestCase<TArgs>[]
): void {
  describe(description, () => {
    let handler: THandler;
    let mockClient: jest.Mocked<CloudStackClient>;

    beforeEach(() => {
      mockClient = createMockClient();
      handler = createHandler();
    });

    test.each(testCases)('$name', async (testCase) => {
      // Setup mock
      const mockFn = jest.fn().mockResolvedValue(buildMockResponse(testCase.mockResponse));
      (mockClient as unknown as Record<string, unknown>)[mockClientMethod] = mockFn;

      const handlerFn = handler[handlerMethod] as (args: TArgs) => Promise<{ content: { type: string; text: string }[] }>;

      if (testCase.shouldThrow) {
        await expect(handlerFn.call(handler, testCase.args)).rejects.toThrow(testCase.expectedError);
        return;
      }

      const result = await handlerFn.call(handler, testCase.args);
      const text = result.content[0].text;

      // Check expected patterns
      for (const pattern of testCase.expectedPatterns) {
        if (typeof pattern === 'string') {
          expect(text).toContain(pattern);
        } else {
          expect(text).toMatch(pattern);
        }
      }

      // Check unexpected patterns
      if (testCase.unexpectedPatterns) {
        for (const pattern of testCase.unexpectedPatterns) {
          if (typeof pattern === 'string') {
            expect(text).not.toContain(pattern);
          } else {
            expect(text).not.toMatch(pattern);
          }
        }
      }

      // Check count if specified
      if (testCase.expectedCount !== undefined) {
        expect(text).toContain(`Found ${testCase.expectedCount}`);
      }
    });
  });
}

/**
 * Run table-driven tests for action handlers
 */
export function runActionHandlerTests<THandler, TArgs = Record<string, unknown>>(
  description: string,
  createHandler: () => THandler,
  handlerMethod: keyof THandler,
  mockClientMethod: string,
  testCases: ActionHandlerTestCase<TArgs>[]
): void {
  describe(description, () => {
    let handler: THandler;
    let mockClient: jest.Mocked<CloudStackClient>;

    beforeEach(() => {
      mockClient = createMockClient();
      handler = createHandler();
    });

    test.each(testCases)('$name', async (testCase) => {
      // Setup mock
      const mockFn = jest.fn().mockResolvedValue(buildMockResponse(testCase.mockResponse));
      (mockClient as unknown as Record<string, unknown>)[mockClientMethod] = mockFn;

      const handlerFn = handler[handlerMethod] as (args: TArgs) => Promise<{ content: { type: string; text: string }[] }>;

      if (testCase.shouldThrow) {
        await expect(handlerFn.call(handler, testCase.args)).rejects.toThrow(testCase.expectedError);
        return;
      }

      const result = await handlerFn.call(handler, testCase.args);
      const text = result.content[0].text;

      // Check expected patterns
      for (const pattern of testCase.expectedPatterns) {
        if (typeof pattern === 'string') {
          expect(text).toContain(pattern);
        } else {
          expect(text).toMatch(pattern);
        }
      }
    });
  });
}

/**
 * Common mock data factories
 */
export const mockDataFactories = {
  virtualMachine: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 'vm-123',
    name: 'test-vm',
    displayname: 'Test VM',
    state: 'Running',
    zoneid: 'zone-1',
    zonename: 'Zone1',
    templateid: 'tmpl-1',
    templatename: 'Ubuntu 22.04',
    serviceofferingid: 'so-1',
    serviceofferingname: 'Medium',
    cpunumber: 2,
    memory: 4096,
    created: '2024-01-01T00:00:00Z',
    ...overrides,
  }),

  network: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 'net-123',
    name: 'test-network',
    displaytext: 'Test Network',
    state: 'Allocated',
    type: 'Isolated',
    zoneid: 'zone-1',
    zonename: 'Zone1',
    cidr: '10.0.0.0/24',
    gateway: '10.0.0.1',
    netmask: '255.255.255.0',
    ...overrides,
  }),

  volume: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 'vol-123',
    name: 'test-volume',
    type: 'DATADISK',
    size: 107374182400, // 100GB
    state: 'Ready',
    zoneid: 'zone-1',
    zonename: 'Zone1',
    created: '2024-01-01T00:00:00Z',
    ...overrides,
  }),

  zone: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 'zone-123',
    name: 'Zone1',
    description: 'Test Zone',
    networktype: 'Advanced',
    allocationstate: 'Enabled',
    ...overrides,
  }),

  kubernetesCluster: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 'k8s-123',
    name: 'test-cluster',
    state: 'Running',
    zoneid: 'zone-1',
    zonename: 'Zone1',
    kubernetesversionid: 'k8s-v-1',
    kubernetesversionname: '1.28.0',
    controlnodes: 3,
    size: 5,
    created: '2024-01-01T00:00:00Z',
    ...overrides,
  }),

  securityGroup: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 'sg-123',
    name: 'test-sg',
    description: 'Test Security Group',
    account: 'admin',
    domain: 'ROOT',
    ingressrule: [],
    egressrule: [],
    ...overrides,
  }),

  snapshot: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 'snap-123',
    name: 'test-snapshot',
    state: 'BackedUp',
    volumeid: 'vol-123',
    volumename: 'test-volume',
    snapshottype: 'MANUAL',
    created: '2024-01-01T00:00:00Z',
    ...overrides,
  }),

  asyncJob: (overrides: Partial<Record<string, unknown>> = {}) => ({
    jobid: 'job-123',
    jobstatus: 0,
    jobresultcode: 0,
    jobprocstatus: 0,
    ...overrides,
  }),
};

/**
 * Helper to create empty response for "not found" tests
 */
export function emptyResponse(responseKey: string, arrayKey: string): MockResponse {
  return {
    responseKey,
    arrayKey,
    data: [],
    count: 0,
  };
}

/**
 * Helper to create single item response
 */
export function singleItemResponse(
  responseKey: string,
  arrayKey: string,
  item: Record<string, unknown>
): MockResponse {
  return {
    responseKey,
    arrayKey,
    data: [item],
    count: 1,
  };
}

/**
 * Helper to create multi-item response
 */
export function multiItemResponse(
  responseKey: string,
  arrayKey: string,
  items: Record<string, unknown>[]
): MockResponse {
  return {
    responseKey,
    arrayKey,
    data: items,
    count: items.length,
  };
}

/**
 * Helper to create job response
 */
export function jobResponse(responseKey: string, jobId: string, resultId?: string): MockResponse {
  const data: Record<string, unknown> = { jobid: jobId };
  if (resultId) {
    data.id = resultId;
  }
  return {
    responseKey,
    data,
  };
}
