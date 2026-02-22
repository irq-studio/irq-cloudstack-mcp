import { AutoScaleHandlers } from '../src/handlers/autoscale-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

// Mock CloudStackClient
jest.mock('../src/cloudstack-client.js');

describe('AutoScaleHandlers', () => {
  let handlers: AutoScaleHandlers;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;
    mockClient.request = jest.fn();
    handlers = new AutoScaleHandlers(mockClient);
  });

  // ===== AutoScale Policies =====

  describe('handleCreateAutoScalePolicy', () => {
    it('should successfully create an autoscale policy', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createautoscalepolicyresponse: { jobid: 'job-100' },
      });

      const args = { action: 'scaleup', conditionids: 'cond-1,cond-2', duration: 300 };
      const result = await handlers.handleCreateAutoScalePolicy(args);

      expect(mockClient.request).toHaveBeenCalledWith('createAutoScalePolicy', args);
      expect(result.content[0].text).toContain('scaleup');
      expect(result.content[0].text).toContain('job-100');
    });

    it('should return error when action is missing', async () => {
      const result = await handlers.handleCreateAutoScalePolicy({ conditionids: 'cond-1', duration: 300 });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('action');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error when conditionids is missing', async () => {
      const result = await handlers.handleCreateAutoScalePolicy({ action: 'scaleup', duration: 300 });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('conditionids');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error when duration is missing', async () => {
      const result = await handlers.handleCreateAutoScalePolicy({ action: 'scaleup', conditionids: 'cond-1' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('duration');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleUpdateAutoScalePolicy', () => {
    it('should successfully update an autoscale policy', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updateautoscalepolicyresponse: { jobid: 'job-101' },
      });

      const args = { id: 'policy-1', duration: 600 };
      const result = await handlers.handleUpdateAutoScalePolicy(args);

      expect(mockClient.request).toHaveBeenCalledWith('updateAutoScalePolicy', args);
      expect(result.content[0].text).toContain('policy-1');
      expect(result.content[0].text).toContain('job-101');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleUpdateAutoScalePolicy({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleDeleteAutoScalePolicy', () => {
    it('should successfully delete an autoscale policy', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deleteautoscalepolicyresponse: { jobid: 'job-102' },
      });

      const args = { id: 'policy-1' };
      const result = await handlers.handleDeleteAutoScalePolicy(args);

      expect(mockClient.request).toHaveBeenCalledWith('deleteAutoScalePolicy', args);
      expect(result.content[0].text).toContain('policy-1');
      expect(result.content[0].text).toContain('job-102');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleDeleteAutoScalePolicy({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleListAutoScalePolicies', () => {
    it('should list autoscale policies', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listautoscalepoliciesresponse: {
          autoscalepolicy: [
            { id: 'policy-1', action: 'scaleup', duration: 300, conditionids: 'cond-1' },
            { id: 'policy-2', action: 'scaledown', duration: 600, conditionids: 'cond-2' },
          ],
        },
      });

      const result = await handlers.handleListAutoScalePolicies({});

      expect(mockClient.request).toHaveBeenCalledWith('listAutoScalePolicies', {});
      expect(result.content[0].text).toContain('Found 2');
      expect(result.content[0].text).toContain('scaleup');
      expect(result.content[0].text).toContain('scaledown');
    });

    it('should handle empty list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listautoscalepoliciesresponse: { autoscalepolicy: [] },
      });

      const result = await handlers.handleListAutoScalePolicies({});
      expect(result.content[0].text).toContain('No autoscale policies found');
    });
  });

  // ===== AutoScale VM Groups =====

  describe('handleCreateAutoScaleVmGroup', () => {
    it('should successfully create an autoscale VM group', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createautoscalevmgroupresponse: { jobid: 'job-200' },
      });

      const args = {
        lbruleid: 'lb-1',
        minmembers: 1,
        maxmembers: 5,
        scaledownpolicyids: 'policy-down-1',
        scaleuppolicyids: 'policy-up-1',
        vmprofileid: 'profile-1',
      };
      const result = await handlers.handleCreateAutoScaleVmGroup(args);

      expect(mockClient.request).toHaveBeenCalledWith('createAutoScaleVmGroup', args);
      expect(result.content[0].text).toContain('lb-1');
      expect(result.content[0].text).toContain('job-200');
    });

    it('should return error when lbruleid is missing', async () => {
      const result = await handlers.handleCreateAutoScaleVmGroup({
        minmembers: 1, maxmembers: 5, scaledownpolicyids: 'p1', scaleuppolicyids: 'p2', vmprofileid: 'vp1',
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('lbruleid');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error when minmembers is missing', async () => {
      const result = await handlers.handleCreateAutoScaleVmGroup({
        lbruleid: 'lb-1', maxmembers: 5, scaledownpolicyids: 'p1', scaleuppolicyids: 'p2', vmprofileid: 'vp1',
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('minmembers');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleUpdateAutoScaleVmGroup', () => {
    it('should successfully update an autoscale VM group', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updateautoscalevmgroupresponse: { jobid: 'job-201' },
      });

      const args = { id: 'vmgroup-1', maxmembers: 10 };
      const result = await handlers.handleUpdateAutoScaleVmGroup(args);

      expect(mockClient.request).toHaveBeenCalledWith('updateAutoScaleVmGroup', args);
      expect(result.content[0].text).toContain('vmgroup-1');
      expect(result.content[0].text).toContain('job-201');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleUpdateAutoScaleVmGroup({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleDeleteAutoScaleVmGroup', () => {
    it('should successfully delete an autoscale VM group', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deleteautoscalevmgroupresponse: { jobid: 'job-202' },
      });

      const args = { id: 'vmgroup-1' };
      const result = await handlers.handleDeleteAutoScaleVmGroup(args);

      expect(mockClient.request).toHaveBeenCalledWith('deleteAutoScaleVmGroup', args);
      expect(result.content[0].text).toContain('vmgroup-1');
      expect(result.content[0].text).toContain('job-202');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleDeleteAutoScaleVmGroup({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleListAutoScaleVmGroups', () => {
    it('should list autoscale VM groups', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listautoscalevmgroupsresponse: {
          autoscalevmgroup: [
            {
              id: 'vmgroup-1',
              lbruleid: 'lb-1',
              state: 'enabled',
              minmembers: 1,
              maxmembers: 5,
              vmprofileid: 'profile-1',
            },
          ],
        },
      });

      const result = await handlers.handleListAutoScaleVmGroups({});

      expect(mockClient.request).toHaveBeenCalledWith('listAutoScaleVmGroups', {});
      expect(result.content[0].text).toContain('Found 1');
      expect(result.content[0].text).toContain('lb-1');
    });

    it('should handle empty list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listautoscalevmgroupsresponse: { autoscalevmgroup: [] },
      });

      const result = await handlers.handleListAutoScaleVmGroups({});
      expect(result.content[0].text).toContain('No autoscale VM groups found');
    });
  });

  describe('handleEnableAutoScaleVmGroup', () => {
    it('should successfully enable an autoscale VM group', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        enableautoscalevmgroupresponse: { jobid: 'job-203' },
      });

      const args = { id: 'vmgroup-1' };
      const result = await handlers.handleEnableAutoScaleVmGroup(args);

      expect(mockClient.request).toHaveBeenCalledWith('enableAutoScaleVmGroup', args);
      expect(result.content[0].text).toContain('vmgroup-1');
      expect(result.content[0].text).toContain('job-203');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleEnableAutoScaleVmGroup({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleDisableAutoScaleVmGroup', () => {
    it('should successfully disable an autoscale VM group', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        disableautoscalevmgroupresponse: { jobid: 'job-204' },
      });

      const args = { id: 'vmgroup-1' };
      const result = await handlers.handleDisableAutoScaleVmGroup(args);

      expect(mockClient.request).toHaveBeenCalledWith('disableAutoScaleVmGroup', args);
      expect(result.content[0].text).toContain('vmgroup-1');
      expect(result.content[0].text).toContain('job-204');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleDisableAutoScaleVmGroup({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
      expect(result.content[0].text).toContain('required');
    });
  });

  // ===== AutoScale VM Profiles =====

  describe('handleCreateAutoScaleVmProfile', () => {
    it('should successfully create an autoscale VM profile', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createautoscalevmprofileresponse: { jobid: 'job-300' },
      });

      const args = { serviceofferingid: 'so-1', templateid: 'tmpl-1', zoneid: 'zone-1' };
      const result = await handlers.handleCreateAutoScaleVmProfile(args);

      expect(mockClient.request).toHaveBeenCalledWith('createAutoScaleVmProfile', args);
      expect(result.content[0].text).toContain('tmpl-1');
      expect(result.content[0].text).toContain('job-300');
    });

    it('should return error when serviceofferingid is missing', async () => {
      const result = await handlers.handleCreateAutoScaleVmProfile({ templateid: 'tmpl-1', zoneid: 'zone-1' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('serviceofferingid');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error when templateid is missing', async () => {
      const result = await handlers.handleCreateAutoScaleVmProfile({ serviceofferingid: 'so-1', zoneid: 'zone-1' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('templateid');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error when zoneid is missing', async () => {
      const result = await handlers.handleCreateAutoScaleVmProfile({ serviceofferingid: 'so-1', templateid: 'tmpl-1' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('zoneid');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleUpdateAutoScaleVmProfile', () => {
    it('should successfully update an autoscale VM profile', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updateautoscalevmprofileresponse: { jobid: 'job-301' },
      });

      const args = { id: 'profile-1', templateid: 'tmpl-2' };
      const result = await handlers.handleUpdateAutoScaleVmProfile(args);

      expect(mockClient.request).toHaveBeenCalledWith('updateAutoScaleVmProfile', args);
      expect(result.content[0].text).toContain('profile-1');
      expect(result.content[0].text).toContain('job-301');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleUpdateAutoScaleVmProfile({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleDeleteAutoScaleVmProfile', () => {
    it('should successfully delete an autoscale VM profile', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deleteautoscalevmprofileresponse: { jobid: 'job-302' },
      });

      const args = { id: 'profile-1' };
      const result = await handlers.handleDeleteAutoScaleVmProfile(args);

      expect(mockClient.request).toHaveBeenCalledWith('deleteAutoScaleVmProfile', args);
      expect(result.content[0].text).toContain('profile-1');
      expect(result.content[0].text).toContain('job-302');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleDeleteAutoScaleVmProfile({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleListAutoScaleVmProfiles', () => {
    it('should list autoscale VM profiles', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listautoscalevmprofilesresponse: {
          autoscalevmprofile: [
            { id: 'profile-1', serviceofferingid: 'so-1', templateid: 'tmpl-1', zoneid: 'zone-1' },
          ],
        },
      });

      const result = await handlers.handleListAutoScaleVmProfiles({});

      expect(mockClient.request).toHaveBeenCalledWith('listAutoScaleVmProfiles', {});
      expect(result.content[0].text).toContain('Found 1');
      expect(result.content[0].text).toContain('tmpl-1');
    });

    it('should handle empty list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listautoscalevmprofilesresponse: { autoscalevmprofile: [] },
      });

      const result = await handlers.handleListAutoScaleVmProfiles({});
      expect(result.content[0].text).toContain('No autoscale VM profiles found');
    });
  });

  // ===== Conditions =====

  describe('handleCreateCondition', () => {
    it('should successfully create a condition', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createconditionresponse: { jobid: 'job-400' },
      });

      const args = { counterid: 'counter-1', relationaloperator: 'GT', threshold: 80 };
      const result = await handlers.handleCreateCondition(args);

      expect(mockClient.request).toHaveBeenCalledWith('createCondition', args);
      expect(result.content[0].text).toContain('counter-1');
      expect(result.content[0].text).toContain('job-400');
    });

    it('should return error when counterid is missing', async () => {
      const result = await handlers.handleCreateCondition({ relationaloperator: 'GT', threshold: 80 });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('counterid');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error when relationaloperator is missing', async () => {
      const result = await handlers.handleCreateCondition({ counterid: 'counter-1', threshold: 80 });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('relationaloperator');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error when threshold is missing', async () => {
      const result = await handlers.handleCreateCondition({ counterid: 'counter-1', relationaloperator: 'GT' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('threshold');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleDeleteCondition', () => {
    it('should successfully delete a condition', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deleteconditionresponse: { jobid: 'job-401' },
      });

      const args = { id: 'cond-1' };
      const result = await handlers.handleDeleteCondition(args);

      expect(mockClient.request).toHaveBeenCalledWith('deleteCondition', args);
      expect(result.content[0].text).toContain('cond-1');
      expect(result.content[0].text).toContain('job-401');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleDeleteCondition({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleListConditions', () => {
    it('should list conditions', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listconditionsresponse: {
          condition: [
            { id: 'cond-1', counterid: 'counter-1', relationaloperator: 'GT', threshold: 80 },
            { id: 'cond-2', counterid: 'counter-2', relationaloperator: 'LT', threshold: 20 },
          ],
        },
      });

      const result = await handlers.handleListConditions({});

      expect(mockClient.request).toHaveBeenCalledWith('listConditions', {});
      expect(result.content[0].text).toContain('Found 2');
      expect(result.content[0].text).toContain('GT');
      expect(result.content[0].text).toContain('LT');
    });

    it('should handle empty list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listconditionsresponse: { condition: [] },
      });

      const result = await handlers.handleListConditions({});
      expect(result.content[0].text).toContain('No conditions found');
    });
  });

  // ===== Counters =====

  describe('handleCreateCounter', () => {
    it('should successfully create a counter', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createcounterresponse: { jobid: 'job-500' },
      });

      const args = { name: 'cpu-counter', source: 'snmp', value: 'oid:1.3.6.1' };
      const result = await handlers.handleCreateCounter(args);

      expect(mockClient.request).toHaveBeenCalledWith('createCounter', args);
      expect(result.content[0].text).toContain('cpu-counter');
      expect(result.content[0].text).toContain('job-500');
    });

    it('should return error when name is missing', async () => {
      const result = await handlers.handleCreateCounter({ source: 'snmp', value: 'oid:1.3.6.1' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('name');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error when source is missing', async () => {
      const result = await handlers.handleCreateCounter({ name: 'cpu-counter', value: 'oid:1.3.6.1' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('source');
      expect(result.content[0].text).toContain('required');
    });

    it('should return error when value is missing', async () => {
      const result = await handlers.handleCreateCounter({ name: 'cpu-counter', source: 'snmp' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('value');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleDeleteCounter', () => {
    it('should successfully delete a counter', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deletecounterresponse: { jobid: 'job-501' },
      });

      const args = { id: 'counter-1' };
      const result = await handlers.handleDeleteCounter(args);

      expect(mockClient.request).toHaveBeenCalledWith('deleteCounter', args);
      expect(result.content[0].text).toContain('counter-1');
      expect(result.content[0].text).toContain('job-501');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleDeleteCounter({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleUpdateCounter', () => {
    it('should successfully update a counter', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updatecounterresponse: { jobid: 'job-502' },
      });

      const args = { id: 'counter-1', name: 'updated-counter' };
      const result = await handlers.handleUpdateCounter(args);

      expect(mockClient.request).toHaveBeenCalledWith('updateCounter', args);
      expect(result.content[0].text).toContain('counter-1');
      expect(result.content[0].text).toContain('job-502');
    });

    it('should return error when id is missing', async () => {
      const result = await handlers.handleUpdateCounter({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
      expect(result.content[0].text).toContain('required');
    });
  });

  describe('handleListCounters', () => {
    it('should list counters', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listcountersresponse: {
          counter: [
            { id: 'counter-1', name: 'cpu-usage', source: 'snmp', value: 'oid:1.3.6.1' },
            { id: 'counter-2', name: 'memory-usage', source: 'snmp', value: 'oid:1.3.6.2' },
          ],
        },
      });

      const result = await handlers.handleListCounters({});

      expect(mockClient.request).toHaveBeenCalledWith('listCounters', {});
      expect(result.content[0].text).toContain('Found 2');
      expect(result.content[0].text).toContain('cpu-usage');
      expect(result.content[0].text).toContain('memory-usage');
    });

    it('should handle empty list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listcountersresponse: { counter: [] },
      });

      const result = await handlers.handleListCounters({});
      expect(result.content[0].text).toContain('No counters found');
    });
  });
});
