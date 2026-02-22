/**
 * Security Handlers
 *
 * Uses the factory pattern for list and action handlers:
 * - Declarative field definitions for list operations
 * - Action handler configs for create operations
 * - Custom handlers for operations with special output (SSH key creation)
 */

import type { CloudStackClient } from '../cloudstack-client.js';
import {
  createListHandler,
  createActionHandler,
  type FieldDefinition,
} from '../utils/index.js';
import { ValidationError } from '../utils/validation.js';
import type {
  SSHKeyPair,
  SecurityGroup,
  Account,
} from '../types/index.js';

export class SecurityHandlers {
  // Field definitions for list handlers
  private static readonly sshKeyPairFields: FieldDefinition<SSHKeyPair>[] = [
    { key: 'fingerprint', label: 'Fingerprint' },
    { key: 'account', label: 'Account' },
    { key: 'domain', label: 'Domain' },
  ];

  private static readonly securityGroupFields: FieldDefinition<SecurityGroup>[] = [
    { key: 'description', label: 'Description', format: (v: unknown) => v ? String(v) : 'No description' },
    { key: 'account', label: 'Account' },
    { key: 'domain', label: 'Domain' },
    { key: 'ingressrule', label: 'Ingress Rules', format: (v: unknown) => String(Array.isArray(v) ? v.length : 0) },
    { key: 'egressrule', label: 'Egress Rules', format: (v: unknown) => String(Array.isArray(v) ? v.length : 0) },
  ];

  // Handler instances
  public readonly handleListSSHKeyPairs;
  public readonly handleListSecurityGroups;
  public readonly handleListAccounts;
  public readonly handleCreateSecurityGroupRule;
  public readonly handleCreateAccount;
  public readonly handleUpdateAccount;
  public readonly handleDeleteAccount;
  public readonly handleDisableAccount;
  public readonly handleEnableAccount;
  public readonly handleLockAccount;

  // Store client for custom handlers
  private readonly cloudStackClient: CloudStackClient;

  constructor(cloudStackClient: CloudStackClient) {
    this.cloudStackClient = cloudStackClient;

    // List handlers using factory
    this.handleListSSHKeyPairs = createListHandler<SSHKeyPair>(cloudStackClient, {
      command: 'listSSHKeyPairs',
      responseKey: 'listsshkeypairsresponse',
      arrayKey: 'sshkeypair',
      itemName: 'SSH key pair',
      titleField: 'name',
      idField: 'name', // SSH key pairs use name as identifier
      fields: SecurityHandlers.sshKeyPairFields,
    });

    this.handleListSecurityGroups = createListHandler<SecurityGroup>(cloudStackClient, {
      command: 'listSecurityGroups',
      responseKey: 'listsecuritygroupsresponse',
      arrayKey: 'securitygroup',
      itemName: 'security group',
      titleField: 'name',
      idField: 'id',
      fields: SecurityHandlers.securityGroupFields,
    });

    // Action handlers using factory
    this.handleCreateSecurityGroupRule = createActionHandler(cloudStackClient, {
      command: 'authorizeSecurityGroupIngress',
      responseKey: 'authorizesecuritygroupingressresponse',
      actionVerb: 'Created',
      itemName: 'security group rule',
      requiredFields: ['protocol'],
      jobIdField: 'jobid',
      resultIdField: 'id',
    });

    this.handleCreateAccount = createActionHandler(cloudStackClient, {
      command: 'createAccount',
      responseKey: 'createaccountresponse',
      actionVerb: 'Created',
      itemName: 'account',
      requiredFields: ['accounttype', 'email', 'firstname', 'lastname', 'password', 'username'],
      resultIdField: 'id',
    });

    this.handleUpdateAccount = createActionHandler(cloudStackClient, {
      command: 'updateAccount',
      responseKey: 'updateaccountresponse',
      actionVerb: 'Updated',
      itemName: 'account',
      requiredFields: ['newname'],
    });

    this.handleDeleteAccount = createActionHandler(cloudStackClient, {
      command: 'deleteAccount',
      responseKey: 'deleteaccountresponse',
      actionVerb: 'Deleting',
      itemName: 'account',
      requiredFields: ['id'],
      jobIdField: 'jobid',
    });

    this.handleDisableAccount = createActionHandler(cloudStackClient, {
      command: 'disableAccount',
      responseKey: 'disableaccountresponse',
      actionVerb: 'Disabling',
      itemName: 'account',
      requiredFields: ['lock'],
      jobIdField: 'jobid',
    });

    this.handleEnableAccount = createActionHandler(cloudStackClient, {
      command: 'enableAccount',
      responseKey: 'enableaccountresponse',
      actionVerb: 'Enabled',
      itemName: 'account',
      requiredFields: [],
    });

    this.handleLockAccount = createActionHandler(cloudStackClient, {
      command: 'lockAccount',
      responseKey: 'lockaccountresponse',
      actionVerb: 'Locked',
      itemName: 'account',
      requiredFields: ['account', 'domainid'],
    });

    this.handleListAccounts = createListHandler<Account>(cloudStackClient, {
      command: 'listAccounts',
      responseKey: 'listaccountsresponse',
      arrayKey: 'account',
      itemName: 'account',
      titleField: 'name',
      idField: 'id',
      fields: [
        { key: 'name', label: 'Name' },
        { key: 'state', label: 'State', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'accounttype', label: 'Account Type', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'domain', label: 'Domain', format: (v: unknown) => v ? String(v) : 'N/A' },
      ],
    });
  }

  /**
   * Create SSH key pair - custom handler because it returns a private key
   * that needs special formatting for the user to save
   */
  async handleCreateSSHKeyPair(args: { name?: string; account?: string; domainid?: string }) {
    if (!args.name) {
      throw new ValidationError('create_ssh_key_pair: Missing required field: name');
    }

    const result = await this.cloudStackClient.request<{
      createsshkeypairresponse?: {
        keypair?: {
          name?: string;
          fingerprint?: string;
          privatekey?: string;
        };
      };
    }>('createSSHKeyPair', { name: args.name });

    const keypair = result.createsshkeypairresponse?.keypair;

    return {
      content: [
        {
          type: 'text' as const,
          text: `Created SSH key pair: ${args.name}\nFingerprint: ${keypair?.fingerprint || 'N/A'}\n\nWARNING: The private key below is sensitive. Store it securely and clear this conversation.\n\nPrivate Key (save this - it cannot be retrieved later):\n${keypair?.privatekey || 'N/A'}`,
        },
      ],
    };
  }
}
