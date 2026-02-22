import { TemplateHandlers } from '../src/handlers/template-handlers.js';
import { CloudStackClient } from '../src/cloudstack-client.js';

// Mock CloudStackClient
jest.mock('../src/cloudstack-client.js');

describe('TemplateHandlers', () => {
  let handlers: TemplateHandlers;
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    mockClient = new CloudStackClient({
      apiUrl: 'https://test.cloudstack.com/client/api',
      apiKey: 'test-key',
      secretKey: 'test-secret',
    }) as jest.Mocked<CloudStackClient>;
    mockClient.request = jest.fn();
    handlers = new TemplateHandlers(mockClient);
  });

  describe('handleRegisterTemplate', () => {
    it('should successfully register a template', async () => {
      const mockResponse = {
        registertemplateresponse: {
          template: [{
            id: 'template-123',
            name: 'Ubuntu 22.04',
            zoneid: 'zone-1',
          }],
        },
      };
      mockClient.registerTemplate = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        name: 'Ubuntu 22.04',
        displaytext: 'Ubuntu 22.04 LTS',
        url: 'http://releases.ubuntu.com/22.04/ubuntu-22.04.qcow2',
        zoneid: 'zone-1',
        ostypeid: 'os-1',
        hypervisor: 'KVM',
        format: 'QCOW2',
      };

      const result = await handlers.handleRegisterTemplate(args);

      expect(mockClient.registerTemplate).toHaveBeenCalledWith(args);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Ubuntu 22.04');
      expect(result.content[0].text).toContain('template-123');
    });

    it('should handle registration errors', async () => {
      mockClient.registerTemplate = jest.fn().mockRejectedValue(new Error('Registration failed'));

      const args = {
        name: 'Ubuntu 22.04',
        displaytext: 'Ubuntu 22.04 LTS',
        url: 'http://invalid-url',
        zoneid: 'zone-1',
        ostypeid: 'os-1',
        hypervisor: 'KVM',
        format: 'QCOW2',
      };

      await expect(handlers.handleRegisterTemplate(args)).rejects.toThrow('Registration failed');
    });
  });

  describe('handleDeleteTemplate', () => {
    it('should successfully delete a template', async () => {
      // Factory handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        deletetemplateresponse: {
          jobid: 'job-456',
        },
      });

      const args = {
        id: 'template-123',
        zoneid: 'zone-1',
      };

      const result = await handlers.handleDeleteTemplate(args);

      expect(mockClient.request).toHaveBeenCalledWith('deleteTemplate', args);
      expect(result.content[0].text).toContain('job-456');
    });

    it('should validate required id field', async () => {
      // Factory handlers return error responses instead of throwing
      const result = await handlers.handleDeleteTemplate({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleUpdateTemplate', () => {
    it('should successfully update template properties', async () => {
      const mockResponse = {
        updatetemplateresponse: {
          template: {
            id: 'template-123',
            name: 'Updated Ubuntu',
            displaytext: 'Updated display text',
          },
        },
      };
      mockClient.updateTemplate = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        id: 'template-123',
        name: 'Updated Ubuntu',
        displaytext: 'Updated display text',
      };

      const result = await handlers.handleUpdateTemplate(args);

      expect(mockClient.updateTemplate).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('Updated Ubuntu');
    });
  });

  describe('handleCopyTemplate', () => {
    it('should successfully copy template to another zone', async () => {
      // Factory handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        copytemplateresponse: {
          jobid: 'job-789',
        },
      });

      const args = {
        id: 'template-123',
        destzoneid: 'zone-2',
        sourcezoneid: 'zone-1',
      };

      const result = await handlers.handleCopyTemplate(args);

      expect(mockClient.request).toHaveBeenCalledWith('copyTemplate', args);
      expect(result.content[0].text).toContain('job-789');
    });

    it('should validate required fields', async () => {
      // Factory handlers return error responses instead of throwing
      const result = await handlers.handleCopyTemplate({ id: 'template-123' } as any);
      expect(result.content[0].text).toContain('Error');
    });
  });

  describe('handleListIsos', () => {
    it('should successfully list ISOs', async () => {
      // Factory handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        listisosresponse: {
          iso: [
            {
              id: 'iso-1',
              name: 'Ubuntu 22.04 ISO',
              displaytext: 'Ubuntu Installation ISO',
              zonename: 'Zone 1',
              bootable: true,
              ispublic: false,
              size: 4000000000,
            },
            {
              id: 'iso-2',
              name: 'Debian 12 ISO',
              displaytext: 'Debian Installation ISO',
              zonename: 'Zone 1',
              bootable: true,
              ispublic: true,
              size: 3500000000,
            },
          ],
        },
      });

      const result = await handlers.handleListIsos({});

      expect(mockClient.request).toHaveBeenCalledWith('listIsos', {});
      expect(result.content[0].text).toContain('Found 2 ISOs');
      expect(result.content[0].text).toContain('Ubuntu 22.04 ISO');
      expect(result.content[0].text).toContain('Debian 12 ISO');
    });

    it('should handle empty ISO list', async () => {
      // Factory handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        listisosresponse: {
          iso: [],
        },
      });

      const result = await handlers.handleListIsos({});

      // Factory list handlers say "No ... found" for empty lists
      expect(result.content[0].text).toContain('No ISOs found');
    });
  });

  describe('handleRegisterIso', () => {
    it('should successfully register an ISO', async () => {
      const mockResponse = {
        registerisoresponse: {
          iso: [{
            id: 'iso-123',
            name: 'Ubuntu 22.04 ISO',
            zoneid: 'zone-1',
          }],
        },
      };
      mockClient.registerIso = jest.fn().mockResolvedValue(mockResponse);

      const args = {
        name: 'Ubuntu 22.04 ISO',
        displaytext: 'Ubuntu Installation ISO',
        url: 'http://releases.ubuntu.com/22.04/ubuntu-22.04.iso',
        zoneid: 'zone-1',
      };

      const result = await handlers.handleRegisterIso(args);

      expect(mockClient.registerIso).toHaveBeenCalledWith(args);
      expect(result.content[0].text).toContain('Ubuntu 22.04 ISO');
      expect(result.content[0].text).toContain('iso-123');
    });
  });

  describe('handleDeleteIso', () => {
    it('should successfully delete an ISO', async () => {
      // Factory handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        deleteisoresponse: {
          jobid: 'job-999',
        },
      });

      const args = {
        id: 'iso-123',
        zoneid: 'zone-1',
      };

      const result = await handlers.handleDeleteIso(args);

      expect(mockClient.request).toHaveBeenCalledWith('deleteIso', args);
      expect(result.content[0].text).toContain('job-999');
    });

    it('should validate required id field', async () => {
      // Factory handlers return error responses instead of throwing
      const result = await handlers.handleDeleteIso({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleAttachIso', () => {
    it('should successfully attach ISO to VM', async () => {
      // Factory handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        attachisoresponse: {
          jobid: 'job-111',
        },
      });

      const args = {
        id: 'iso-123',
        virtualmachineid: 'vm-456',
      };

      const result = await handlers.handleAttachIso(args);

      expect(mockClient.request).toHaveBeenCalledWith('attachIso', args);
      expect(result.content[0].text).toContain('iso-123');
      expect(result.content[0].text).toContain('vm-456');
      expect(result.content[0].text).toContain('job-111');
    });

    it('should validate required fields', async () => {
      // Factory handlers return error responses instead of throwing
      const result = await handlers.handleAttachIso({ id: 'iso-123' } as any);
      expect(result.content[0].text).toContain('Error');
    });
  });

  describe('handleDetachIso', () => {
    it('should successfully detach ISO from VM', async () => {
      // Factory handlers use client.request() directly
      mockClient.request = jest.fn().mockResolvedValue({
        detachisoresponse: {
          jobid: 'job-222',
        },
      });

      const args = {
        virtualmachineid: 'vm-456',
      };

      const result = await handlers.handleDetachIso(args);

      expect(mockClient.request).toHaveBeenCalledWith('detachIso', args);
      expect(result.content[0].text).toContain('vm-456');
      expect(result.content[0].text).toContain('job-222');
    });

    it('should validate required virtualmachineid field', async () => {
      // Factory handlers return error responses instead of throwing
      const result = await handlers.handleDetachIso({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('virtualmachineid is required');
    });
  });

  describe('handleExtractTemplate', () => {
    it('should successfully extract a template', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        extracttemplateresponse: {
          jobid: 'job-extract-1',
        },
      });

      const args = { id: 'template-123', mode: 'HTTP_DOWNLOAD' };
      const result = await handlers.handleExtractTemplate(args);

      expect(mockClient.request).toHaveBeenCalledWith('extractTemplate', args);
      expect(result.content[0].text).toContain('Extracting template');
      expect(result.content[0].text).toContain('job-extract-1');
    });

    it('should validate required fields', async () => {
      const result = await handlers.handleExtractTemplate({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleUpdateTemplatePermissions', () => {
    it('should successfully update template permissions', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        updatetemplatepermissionsresponse: {
          success: true,
        },
      });

      const args = { id: 'template-123', ispublic: true };
      const result = await handlers.handleUpdateTemplatePermissions(args);

      expect(mockClient.request).toHaveBeenCalledWith('updateTemplatePermissions', expect.objectContaining({ id: 'template-123' }));
      expect(result.content[0].text).toContain('Updated permissions for template');
    });

    it('should validate required id field', async () => {
      const result = await handlers.handleUpdateTemplatePermissions({} as any);
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('id is required');
    });
  });

  describe('handleListTemplatePermissions', () => {
    it('should successfully list template permissions', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listtemplatepermissionsresponse: {
          templatepermission: [
            { id: 'template-123', ispublic: true, account: ['admin'] },
          ],
        },
      });

      const result = await handlers.handleListTemplatePermissions({ id: 'template-123' });

      expect(mockClient.request).toHaveBeenCalledWith('listTemplatePermissions', { id: 'template-123' });
      expect(result.content[0].text).toContain('template-123');
    });

    it('should handle empty permissions list', async () => {
      mockClient.request = jest.fn().mockResolvedValue({
        listtemplatepermissionsresponse: { templatepermission: [] },
      });

      const result = await handlers.handleListTemplatePermissions({ id: 'template-123' });

      expect(result.content[0].text).toContain('No template permissions found');
    });
  });
});
