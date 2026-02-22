/**
 * Network ACL Handlers
 *
 * Uses the factory pattern for list and action handlers:
 * - Network ACL Items (create, delete, update, list)
 * - Network ACL Lists (create, delete, update, list, replace)
 */

import type { CloudStackClient } from '../../cloudstack-client.js';
import {
  createListHandler,
  createActionHandler,
  type FieldDefinition,
} from '../../utils/index.js';
import type {
  NetworkACL,
  NetworkACLList,
} from '../../types/index.js';

export class AclHandlers {
  // Field definitions for Network ACL Items
  private static readonly networkAclFields: FieldDefinition<NetworkACL>[] = [
    { key: 'protocol', label: 'Protocol' },
    { key: 'startport', label: 'Start Port', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'endport', label: 'End Port', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'cidrlist', label: 'CIDR List', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'traffictype', label: 'Traffic Type' },
    { key: 'state', label: 'State' },
    { key: 'action', label: 'Action' },
    { key: 'number', label: 'Number', format: (v: unknown) => v !== undefined ? String(v) : 'N/A' },
    { key: 'aclid', label: 'ACL List ID' },
  ];

  // Field definitions for Network ACL Lists
  private static readonly networkAclListFields: FieldDefinition<NetworkACLList>[] = [
    { key: 'description', label: 'Description' },
    { key: 'vpcid', label: 'VPC ID' },
    { key: 'fordisplay', label: 'For Display', format: (v: unknown) => v !== undefined ? String(v) : 'N/A' },
  ];

  // Handler instances - Network ACL Items
  public readonly handleListNetworkAcls;
  public readonly handleCreateNetworkAcl;
  public readonly handleDeleteNetworkAcl;
  public readonly handleUpdateNetworkAclItem;

  // Handler instances - Network ACL Lists
  public readonly handleListNetworkAclLists;
  public readonly handleCreateNetworkAclList;
  public readonly handleDeleteNetworkAclList;
  public readonly handleUpdateNetworkAclList;
  public readonly handleReplaceNetworkAclList;

  constructor(cloudStackClient: CloudStackClient) {
    // --- Network ACL Items ---
    this.handleListNetworkAcls = createListHandler<NetworkACL>(cloudStackClient, {
      command: 'listNetworkACLs',
      responseKey: 'listnetworkaclsresponse',
      arrayKey: 'networkacl',
      itemName: 'network ACL',
      titleField: 'protocol',
      idField: 'id',
      fields: AclHandlers.networkAclFields,
    });

    this.handleCreateNetworkAcl = createActionHandler(cloudStackClient, {
      command: 'createNetworkACL',
      responseKey: 'createnetworkaclresponse',
      actionVerb: 'Creating',
      itemName: 'network ACL',
      requiredFields: ['protocol'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Creating network ACL rule for protocol ${args.protocol}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleDeleteNetworkAcl = createActionHandler(cloudStackClient, {
      command: 'deleteNetworkACL',
      responseKey: 'deletenetworkaclresponse',
      actionVerb: 'Deleting',
      itemName: 'network ACL',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Deleting network ACL ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleUpdateNetworkAclItem = createActionHandler(cloudStackClient, {
      command: 'updateNetworkACLItem',
      responseKey: 'updatenetworkaclitemresponse',
      actionVerb: 'Updating',
      itemName: 'network ACL item',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Updating network ACL item ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    // --- Network ACL Lists ---
    this.handleListNetworkAclLists = createListHandler<NetworkACLList>(cloudStackClient, {
      command: 'listNetworkACLLists',
      responseKey: 'listnetworkacllistsresponse',
      arrayKey: 'networkacllist',
      itemName: 'network ACL list',
      titleField: 'name',
      idField: 'id',
      fields: AclHandlers.networkAclListFields,
    });

    this.handleCreateNetworkAclList = createActionHandler(cloudStackClient, {
      command: 'createNetworkACLList',
      responseKey: 'createnetworkacllistresponse',
      actionVerb: 'Creating',
      itemName: 'network ACL list',
      requiredFields: ['name', 'vpcid'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Creating network ACL list "${args.name}" for VPC ${args.vpcid}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleDeleteNetworkAclList = createActionHandler(cloudStackClient, {
      command: 'deleteNetworkACLList',
      responseKey: 'deletenetworkacllistresponse',
      actionVerb: 'Deleting',
      itemName: 'network ACL list',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Deleting network ACL list ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleUpdateNetworkAclList = createActionHandler(cloudStackClient, {
      command: 'updateNetworkACLList',
      responseKey: 'updatenetworkacllistresponse',
      actionVerb: 'Updating',
      itemName: 'network ACL list',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Updating network ACL list ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleReplaceNetworkAclList = createActionHandler(cloudStackClient, {
      command: 'replaceNetworkACLList',
      responseKey: 'replacenetworkacllistresponse',
      actionVerb: 'Replacing',
      itemName: 'network ACL list',
      requiredFields: ['aclid'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Replacing network ACL list ${args.aclid} on network/VPC. Job ID: ${result?.jobid || 'N/A'}`,
    });
  }
}
