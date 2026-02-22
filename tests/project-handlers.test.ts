import { ProjectHandlers } from '../src/handlers/project-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

jest.mock('../src/cloudstack-client.js');

describe('ProjectHandlers', () => {
  let handlers: ProjectHandlers;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;
    mockClient.request = jest.fn();
    handlers = new ProjectHandlers(mockClient);
  });

  // --- Projects ---

  describe('handleCreateProject', () => {
    it('should successfully create a project', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        createprojectresponse: { jobid: 'job-101' },
      });

      const args = { name: 'my-project', displaytext: 'My Project' };
      const result = await handlers.handleCreateProject(args);

      expect(mockClient.request).toHaveBeenCalledWith('createProject', args);
      expect(result.content[0].text).toContain('my-project');
      expect(result.content[0].text).toContain('job-101');
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleCreateProject({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('name');
    });
  });

  describe('handleDeleteProject', () => {
    it('should successfully delete a project', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deleteprojectresponse: { jobid: 'job-102' },
      });

      const result = await handlers.handleDeleteProject({ id: 'proj-1' });

      expect(mockClient.request).toHaveBeenCalledWith('deleteProject', { id: 'proj-1' });
      expect(result.content[0].text).toContain('proj-1');
    });

    it('should return error for missing id', async () => {
      const result = await handlers.handleDeleteProject({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
    });
  });

  describe('handleUpdateProject', () => {
    it('should successfully update a project', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updateprojectresponse: { jobid: 'job-103' },
      });

      const result = await handlers.handleUpdateProject({ id: 'proj-1' });

      expect(mockClient.request).toHaveBeenCalledWith('updateProject', { id: 'proj-1' });
      expect(result.content[0].text).toContain('proj-1');
    });

    it('should return error for missing id', async () => {
      const result = await handlers.handleUpdateProject({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
    });
  });

  describe('handleListProjects', () => {
    it('should list projects', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listprojectsresponse: {
          project: [
            { id: 'proj-1', name: 'my-project', displaytext: 'My Project', state: 'Active' },
          ],
        },
      });

      const result = await handlers.handleListProjects({});

      expect(mockClient.request).toHaveBeenCalledWith('listProjects', {});
      expect(result.content[0].text).toContain('Found 1');
    });

    it('should handle empty list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listprojectsresponse: { project: [] },
      });

      const result = await handlers.handleListProjects({});
      expect(result.content[0].text).toContain('No');
    });
  });

  describe('handleActivateProject', () => {
    it('should successfully activate a project', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        activateprojectresponse: { jobid: 'job-104' },
      });

      const result = await handlers.handleActivateProject({ id: 'proj-1' });

      expect(mockClient.request).toHaveBeenCalledWith('activateProject', { id: 'proj-1' });
      expect(result.content[0].text).toContain('proj-1');
    });

    it('should return error for missing id', async () => {
      const result = await handlers.handleActivateProject({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
    });
  });

  describe('handleSuspendProject', () => {
    it('should successfully suspend a project', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        suspendprojectresponse: { jobid: 'job-105' },
      });

      const result = await handlers.handleSuspendProject({ id: 'proj-1' });

      expect(mockClient.request).toHaveBeenCalledWith('suspendProject', { id: 'proj-1' });
      expect(result.content[0].text).toContain('proj-1');
    });

    it('should return error for missing id', async () => {
      const result = await handlers.handleSuspendProject({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
    });
  });

  // --- Project Accounts ---

  describe('handleAddAccountToProject', () => {
    it('should successfully add account to project', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        addaccounttoprojectresponse: { jobid: 'job-201' },
      });

      const result = await handlers.handleAddAccountToProject({ projectid: 'proj-1' });

      expect(mockClient.request).toHaveBeenCalledWith('addAccountToProject', { projectid: 'proj-1' });
      expect(result.content[0].text).toContain('proj-1');
    });

    it('should return error for missing projectid', async () => {
      const result = await handlers.handleAddAccountToProject({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('projectid');
    });
  });

  describe('handleDeleteAccountFromProject', () => {
    it('should successfully delete account from project', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deleteaccountfromprojectresponse: { jobid: 'job-202' },
      });

      const args = { projectid: 'proj-1', account: 'user1' };
      const result = await handlers.handleDeleteAccountFromProject(args);

      expect(mockClient.request).toHaveBeenCalledWith('deleteAccountFromProject', args);
      expect(result.content[0].text).toContain('user1');
      expect(result.content[0].text).toContain('proj-1');
    });

    it('should return error for missing required fields', async () => {
      const result = await handlers.handleDeleteAccountFromProject({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('projectid');
    });
  });

  describe('handleListProjectAccounts', () => {
    it('should list project accounts', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listprojectaccountsresponse: {
          projectaccount: [
            { id: 'pa-1', account: 'admin', role: 'Admin', domain: 'ROOT' },
          ],
        },
      });

      const result = await handlers.handleListProjectAccounts({});

      expect(mockClient.request).toHaveBeenCalledWith('listProjectAccounts', {});
      expect(result.content[0].text).toContain('Found 1');
    });

    it('should handle empty list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listprojectaccountsresponse: { projectaccount: [] },
      });

      const result = await handlers.handleListProjectAccounts({});
      expect(result.content[0].text).toContain('No');
    });
  });

  // --- Project Invitations ---

  describe('handleListProjectInvitations', () => {
    it('should list project invitations', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listprojectinvitationsresponse: {
          projectinvitation: [
            { id: 'inv-1', project: 'my-project', state: 'Pending', account: 'user1' },
          ],
        },
      });

      const result = await handlers.handleListProjectInvitations({});

      expect(mockClient.request).toHaveBeenCalledWith('listProjectInvitations', {});
      expect(result.content[0].text).toContain('Found 1');
    });

    it('should handle empty list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listprojectinvitationsresponse: { projectinvitation: [] },
      });

      const result = await handlers.handleListProjectInvitations({});
      expect(result.content[0].text).toContain('No');
    });
  });

  describe('handleUpdateProjectInvitation', () => {
    it('should successfully update a project invitation', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updateprojectinvitationresponse: { jobid: 'job-301' },
      });

      const result = await handlers.handleUpdateProjectInvitation({ projectid: 'proj-1' });

      expect(mockClient.request).toHaveBeenCalledWith('updateProjectInvitation', { projectid: 'proj-1' });
      expect(result.content[0].text).toContain('proj-1');
    });

    it('should return error for missing projectid', async () => {
      const result = await handlers.handleUpdateProjectInvitation({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('projectid');
    });
  });

  describe('handleDeleteProjectInvitation', () => {
    it('should successfully delete a project invitation', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        deleteprojectinvitationresponse: { jobid: 'job-302' },
      });

      const result = await handlers.handleDeleteProjectInvitation({ id: 'inv-1' });

      expect(mockClient.request).toHaveBeenCalledWith('deleteProjectInvitation', { id: 'inv-1' });
      expect(result.content[0].text).toContain('inv-1');
    });

    it('should return error for missing id', async () => {
      const result = await handlers.handleDeleteProjectInvitation({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('id');
    });
  });
});
