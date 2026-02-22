/**
 * Project Handlers
 *
 * Uses the factory pattern for list and action handlers:
 * - Projects (create, delete, update, list, activate, suspend)
 * - Project Accounts (add, delete, list)
 * - Project Invitations (list, update, delete)
 */

import type { CloudStackClient } from '../cloudstack-client.js';
import {
  createListHandler,
  createActionHandler,
  type FieldDefinition,
} from '../utils/index.js';
import type {
  Project,
  ProjectAccount,
  ProjectInvitation,
} from '../types/index.js';

export class ProjectHandlers {
  // Field definitions for Projects
  private static readonly projectFields: FieldDefinition<Project>[] = [
    { key: 'displaytext', label: 'Display Text' },
    { key: 'state', label: 'State' },
    { key: 'account', label: 'Account', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'domain', label: 'Domain', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'cpuavailable', label: 'CPU Available', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'memoryavailable', label: 'Memory Available', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'vmavailable', label: 'VMs Available', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'created', label: 'Created', format: (v: unknown) => v ? String(v) : 'N/A' },
  ];

  // Field definitions for Project Accounts
  private static readonly projectAccountFields: FieldDefinition<ProjectAccount>[] = [
    { key: 'account', label: 'Account' },
    { key: 'role', label: 'Role' },
    { key: 'domain', label: 'Domain', format: (v: unknown) => v ? String(v) : 'N/A' },
  ];

  // Field definitions for Project Invitations
  private static readonly projectInvitationFields: FieldDefinition<ProjectInvitation>[] = [
    { key: 'project', label: 'Project' },
    { key: 'state', label: 'State' },
    { key: 'account', label: 'Account', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'email', label: 'Email', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'domain', label: 'Domain', format: (v: unknown) => v ? String(v) : 'N/A' },
  ];

  // Handler instances - Projects
  public readonly handleListProjects;
  public readonly handleCreateProject;
  public readonly handleDeleteProject;
  public readonly handleUpdateProject;
  public readonly handleActivateProject;
  public readonly handleSuspendProject;

  // Handler instances - Project Accounts
  public readonly handleListProjectAccounts;
  public readonly handleAddAccountToProject;
  public readonly handleDeleteAccountFromProject;

  // Handler instances - Project Invitations
  public readonly handleListProjectInvitations;
  public readonly handleUpdateProjectInvitation;
  public readonly handleDeleteProjectInvitation;

  constructor(cloudStackClient: CloudStackClient) {
    // --- Projects ---
    this.handleListProjects = createListHandler<Project>(cloudStackClient, {
      command: 'listProjects',
      responseKey: 'listprojectsresponse',
      arrayKey: 'project',
      itemName: 'project',
      titleField: 'name',
      idField: 'id',
      fields: ProjectHandlers.projectFields,
    });

    this.handleCreateProject = createActionHandler(cloudStackClient, {
      command: 'createProject',
      responseKey: 'createprojectresponse',
      actionVerb: 'Creating',
      itemName: 'project',
      requiredFields: ['name', 'displaytext'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Creating project "${args.name}". Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleDeleteProject = createActionHandler(cloudStackClient, {
      command: 'deleteProject',
      responseKey: 'deleteprojectresponse',
      actionVerb: 'Deleting',
      itemName: 'project',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Deleting project ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleUpdateProject = createActionHandler(cloudStackClient, {
      command: 'updateProject',
      responseKey: 'updateprojectresponse',
      actionVerb: 'Updating',
      itemName: 'project',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Updating project ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleActivateProject = createActionHandler(cloudStackClient, {
      command: 'activateProject',
      responseKey: 'activateprojectresponse',
      actionVerb: 'Activating',
      itemName: 'project',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Activating project ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleSuspendProject = createActionHandler(cloudStackClient, {
      command: 'suspendProject',
      responseKey: 'suspendprojectresponse',
      actionVerb: 'Suspending',
      itemName: 'project',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Suspending project ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    // --- Project Accounts ---
    this.handleListProjectAccounts = createListHandler<ProjectAccount>(cloudStackClient, {
      command: 'listProjectAccounts',
      responseKey: 'listprojectaccountsresponse',
      arrayKey: 'projectaccount',
      itemName: 'project account',
      titleField: 'account',
      idField: 'id',
      fields: ProjectHandlers.projectAccountFields,
    });

    this.handleAddAccountToProject = createActionHandler(cloudStackClient, {
      command: 'addAccountToProject',
      responseKey: 'addaccounttoprojectresponse',
      actionVerb: 'Adding account to',
      itemName: 'project',
      requiredFields: ['projectid'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Adding account "${args.account || args.email || 'specified'}" to project ${args.projectid}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleDeleteAccountFromProject = createActionHandler(cloudStackClient, {
      command: 'deleteAccountFromProject',
      responseKey: 'deleteaccountfromprojectresponse',
      actionVerb: 'Removing account from',
      itemName: 'project',
      requiredFields: ['projectid', 'account'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Removing account "${args.account}" from project ${args.projectid}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    // --- Project Invitations ---
    this.handleListProjectInvitations = createListHandler<ProjectInvitation>(cloudStackClient, {
      command: 'listProjectInvitations',
      responseKey: 'listprojectinvitationsresponse',
      arrayKey: 'projectinvitation',
      itemName: 'project invitation',
      titleField: 'project',
      idField: 'id',
      fields: ProjectHandlers.projectInvitationFields,
    });

    this.handleUpdateProjectInvitation = createActionHandler(cloudStackClient, {
      command: 'updateProjectInvitation',
      responseKey: 'updateprojectinvitationresponse',
      actionVerb: 'Updating',
      itemName: 'project invitation',
      requiredFields: ['projectid'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Updating invitation for project ${args.projectid}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleDeleteProjectInvitation = createActionHandler(cloudStackClient, {
      command: 'deleteProjectInvitation',
      responseKey: 'deleteprojectinvitationresponse',
      actionVerb: 'Deleting',
      itemName: 'project invitation',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Deleting project invitation ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });
  }
}
