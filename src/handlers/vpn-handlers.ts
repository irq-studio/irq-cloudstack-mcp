/**
 * VPN Handlers
 *
 * Uses the factory pattern for list and action handlers:
 * - VPN Gateways (create, delete, list)
 * - VPN Connections (create, delete, list, reset)
 * - VPN Customer Gateways (create, update, delete, list)
 * - Remote Access VPNs (create, delete, list)
 * - VPN Users (add, remove, list)
 */

import type { CloudStackClient } from '../cloudstack-client.js';
import {
  createListHandler,
  createActionHandler,
  type FieldDefinition,
} from '../utils/index.js';
import type {
  VpnGateway,
  VpnConnection,
  VpnCustomerGateway,
  RemoteAccessVpn,
  VpnUser,
} from '../types/index.js';

export class VpnHandlers {
  // Field definitions for VPN Gateways
  private static readonly vpnGatewayFields: FieldDefinition<VpnGateway>[] = [
    { key: 'publicip', label: 'Public IP' },
    { key: 'vpcid', label: 'VPC ID' },
    { key: 'account', label: 'Account', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'domain', label: 'Domain', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'fordisplay', label: 'For Display', format: (v: unknown) => v !== undefined ? String(v) : 'N/A' },
    { key: 'removed', label: 'Removed', format: (v: unknown) => v ? String(v) : 'N/A' },
  ];

  // Field definitions for VPN Connections
  private static readonly vpnConnectionFields: FieldDefinition<VpnConnection>[] = [
    { key: 'state', label: 'State' },
    { key: 's2scustomergatewayid', label: 'Customer Gateway ID' },
    { key: 's2svpngatewayid', label: 'VPN Gateway ID' },
    { key: 'publicip', label: 'Public IP', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'gateway', label: 'Gateway', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'ikepolicy', label: 'IKE Policy', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'esppolicy', label: 'ESP Policy', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'account', label: 'Account', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'domain', label: 'Domain', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'created', label: 'Created', format: (v: unknown) => v ? String(v) : 'N/A' },
  ];

  // Field definitions for VPN Customer Gateways
  private static readonly vpnCustomerGatewayFields: FieldDefinition<VpnCustomerGateway>[] = [
    { key: 'gateway', label: 'Gateway' },
    { key: 'cidrlist', label: 'CIDR List' },
    { key: 'ikepolicy', label: 'IKE Policy', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'esppolicy', label: 'ESP Policy', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'ikelifetime', label: 'IKE Lifetime', format: (v: unknown) => v !== undefined ? String(v) : 'N/A' },
    { key: 'esplifetime', label: 'ESP Lifetime', format: (v: unknown) => v !== undefined ? String(v) : 'N/A' },
    { key: 'dpd', label: 'DPD', format: (v: unknown) => v !== undefined ? String(v) : 'N/A' },
    { key: 'account', label: 'Account', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'domain', label: 'Domain', format: (v: unknown) => v ? String(v) : 'N/A' },
  ];

  // Field definitions for Remote Access VPNs
  private static readonly remoteAccessVpnFields: FieldDefinition<RemoteAccessVpn>[] = [
    { key: 'state', label: 'State' },
    { key: 'publicip', label: 'Public IP' },
    { key: 'publicipid', label: 'Public IP ID' },
    { key: 'iprange', label: 'IP Range' },
    { key: 'account', label: 'Account', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'domain', label: 'Domain', format: (v: unknown) => v ? String(v) : 'N/A' },
  ];

  // Field definitions for VPN Users
  private static readonly vpnUserFields: FieldDefinition<VpnUser>[] = [
    { key: 'state', label: 'State' },
    { key: 'account', label: 'Account', format: (v: unknown) => v ? String(v) : 'N/A' },
    { key: 'domain', label: 'Domain', format: (v: unknown) => v ? String(v) : 'N/A' },
  ];

  // Handler instances - VPN Gateways
  public readonly handleListVpnGateways;
  public readonly handleCreateVpnGateway;
  public readonly handleDeleteVpnGateway;

  // Handler instances - VPN Connections
  public readonly handleListVpnConnections;
  public readonly handleCreateVpnConnection;
  public readonly handleDeleteVpnConnection;
  public readonly handleResetVpnConnection;

  // Handler instances - VPN Customer Gateways
  public readonly handleListVpnCustomerGateways;
  public readonly handleCreateVpnCustomerGateway;
  public readonly handleUpdateVpnCustomerGateway;
  public readonly handleDeleteVpnCustomerGateway;

  // Handler instances - Remote Access VPNs
  public readonly handleListRemoteAccessVpns;
  public readonly handleCreateRemoteAccessVpn;
  public readonly handleDeleteRemoteAccessVpn;

  // Handler instances - VPN Users
  public readonly handleListVpnUsers;
  public readonly handleAddVpnUser;
  public readonly handleRemoveVpnUser;

  constructor(cloudStackClient: CloudStackClient) {
    // --- VPN Gateways ---
    this.handleListVpnGateways = createListHandler<VpnGateway>(cloudStackClient, {
      command: 'listVpnGateways',
      responseKey: 'listvpngatewaysresponse',
      arrayKey: 'vpngateway',
      itemName: 'VPN gateway',
      titleField: 'publicip',
      idField: 'id',
      fields: VpnHandlers.vpnGatewayFields,
    });

    this.handleCreateVpnGateway = createActionHandler(cloudStackClient, {
      command: 'createVpnGateway',
      responseKey: 'createvpngatewayresponse',
      actionVerb: 'Creating',
      itemName: 'VPN gateway',
      requiredFields: ['vpcid'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Creating VPN gateway for VPC ${args.vpcid}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleDeleteVpnGateway = createActionHandler(cloudStackClient, {
      command: 'deleteVpnGateway',
      responseKey: 'deletevpngatewayresponse',
      actionVerb: 'Deleting',
      itemName: 'VPN gateway',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Deleting VPN gateway ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    // --- VPN Connections ---
    this.handleListVpnConnections = createListHandler<VpnConnection>(cloudStackClient, {
      command: 'listVpnConnections',
      responseKey: 'listvpnconnectionsresponse',
      arrayKey: 'vpnconnection',
      itemName: 'VPN connection',
      titleField: 'publicip',
      idField: 'id',
      fields: VpnHandlers.vpnConnectionFields,
    });

    this.handleCreateVpnConnection = createActionHandler(cloudStackClient, {
      command: 'createVpnConnection',
      responseKey: 'createvpnconnectionresponse',
      actionVerb: 'Creating',
      itemName: 'VPN connection',
      requiredFields: ['s2scustomergatewayid', 's2svpngatewayid'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Creating VPN connection between gateway ${args.s2svpngatewayid} and customer gateway ${args.s2scustomergatewayid}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleDeleteVpnConnection = createActionHandler(cloudStackClient, {
      command: 'deleteVpnConnection',
      responseKey: 'deletevpnconnectionresponse',
      actionVerb: 'Deleting',
      itemName: 'VPN connection',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Deleting VPN connection ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleResetVpnConnection = createActionHandler(cloudStackClient, {
      command: 'resetVpnConnection',
      responseKey: 'resetvpnconnectionresponse',
      actionVerb: 'Resetting',
      itemName: 'VPN connection',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Resetting VPN connection ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    // --- VPN Customer Gateways ---
    this.handleListVpnCustomerGateways = createListHandler<VpnCustomerGateway>(cloudStackClient, {
      command: 'listVpnCustomerGateways',
      responseKey: 'listvpncustomergatewaysresponse',
      arrayKey: 'vpncustomergateway',
      itemName: 'VPN customer gateway',
      titleField: 'name',
      idField: 'id',
      fields: VpnHandlers.vpnCustomerGatewayFields,
    });

    this.handleCreateVpnCustomerGateway = createActionHandler(cloudStackClient, {
      command: 'createVpnCustomerGateway',
      responseKey: 'createvpncustomergatewayresponse',
      actionVerb: 'Creating',
      itemName: 'VPN customer gateway',
      requiredFields: ['gateway', 'cidrlist', 'ipsecpsk', 'ikepolicy', 'esppolicy'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Creating VPN customer gateway "${args.name || args.gateway}". Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleUpdateVpnCustomerGateway = createActionHandler(cloudStackClient, {
      command: 'updateVpnCustomerGateway',
      responseKey: 'updatevpncustomergatewayresponse',
      actionVerb: 'Updating',
      itemName: 'VPN customer gateway',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Updating VPN customer gateway ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleDeleteVpnCustomerGateway = createActionHandler(cloudStackClient, {
      command: 'deleteVpnCustomerGateway',
      responseKey: 'deletevpncustomergatewayresponse',
      actionVerb: 'Deleting',
      itemName: 'VPN customer gateway',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Deleting VPN customer gateway ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    // --- Remote Access VPNs ---
    this.handleListRemoteAccessVpns = createListHandler<RemoteAccessVpn>(cloudStackClient, {
      command: 'listRemoteAccessVpns',
      responseKey: 'listremoteaccessvpnsresponse',
      arrayKey: 'remoteaccessvpn',
      itemName: 'remote access VPN',
      titleField: 'publicip',
      idField: 'id',
      fields: VpnHandlers.remoteAccessVpnFields,
    });

    this.handleCreateRemoteAccessVpn = createActionHandler(cloudStackClient, {
      command: 'createRemoteAccessVpn',
      responseKey: 'createremoteaccessvpnresponse',
      actionVerb: 'Creating',
      itemName: 'remote access VPN',
      requiredFields: ['publicipid'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Creating remote access VPN for public IP ${args.publicipid}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleDeleteRemoteAccessVpn = createActionHandler(cloudStackClient, {
      command: 'deleteRemoteAccessVpn',
      responseKey: 'deleteremoteaccessvpnresponse',
      actionVerb: 'Deleting',
      itemName: 'remote access VPN',
      requiredFields: ['publicipid'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Deleting remote access VPN for public IP ${args.publicipid}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    // --- VPN Users ---
    this.handleListVpnUsers = createListHandler<VpnUser>(cloudStackClient, {
      command: 'listVpnUsers',
      responseKey: 'listvpnusersresponse',
      arrayKey: 'vpnuser',
      itemName: 'VPN user',
      titleField: 'username',
      idField: 'id',
      fields: VpnHandlers.vpnUserFields,
    });

    this.handleAddVpnUser = createActionHandler(cloudStackClient, {
      command: 'addVpnUser',
      responseKey: 'addvpnuserresponse',
      actionVerb: 'Adding',
      itemName: 'VPN user',
      requiredFields: ['username', 'password'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Adding VPN user "${args.username}". Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleRemoveVpnUser = createActionHandler(cloudStackClient, {
      command: 'removeVpnUser',
      responseKey: 'removevpnuserresponse',
      actionVerb: 'Removing',
      itemName: 'VPN user',
      requiredFields: ['username'],
      jobIdField: 'jobid',
      successMessage: (args, result) =>
        `Removing VPN user "${args.username}". Job ID: ${result?.jobid || 'N/A'}`,
    });
  }
}
