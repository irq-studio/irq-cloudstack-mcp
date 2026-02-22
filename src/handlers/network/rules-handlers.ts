/**
 * Network Rules Handlers
 *
 * Uses the factory pattern for list and action handlers:
 * - Declarative field definitions for list operations
 * - Action handler configs for create/delete operations
 * - Custom handlers for operations with special requirements
 */

import type { CloudStackClient, CloudStackParams } from '../../cloudstack-client.js';
import {
  createListHandler,
  createActionHandler,
  type FieldDefinition,
} from '../../utils/index.js';
import type {
  FirewallRule,
  LoadBalancerRule,
  PortForwardingRule,
  LBStickinessPolicy,
} from '../../types/index.js';

export class NetworkRulesHandlers {
  // Field definitions for list handlers
  private static readonly loadBalancerRuleFields: FieldDefinition<LoadBalancerRule>[] = [
    {
      key: (rule: LoadBalancerRule) => `${rule.publicip}:${rule.publicport}`,
      label: 'Public IP',
    },
    { key: 'privateport', label: 'Private Port' },
    { key: 'algorithm', label: 'Algorithm' },
    { key: 'state', label: 'State' },
  ];

  // Handler instances
  public readonly handleListLoadBalancerRules;
  public readonly handleListEgressFirewallRules;
  public readonly handleListLBStickinessPolicies;
  public readonly handleCreateFirewallRule;
  public readonly handleDeleteFirewallRule;
  public readonly handleCreateLoadBalancerRule;
  public readonly handleDeleteLoadBalancerRule;
  public readonly handleCreatePortForwardingRule;
  public readonly handleDeletePortForwardingRule;
  public readonly handleCreateEgressFirewallRule;
  public readonly handleDeleteEgressFirewallRule;
  public readonly handleUpdateLoadBalancerRule;
  public readonly handleCreateLBStickinessPolicy;
  public readonly handleDeleteLBStickinessPolicy;

  // Store client for custom handlers
  private readonly cloudStackClient: CloudStackClient;

  constructor(cloudStackClient: CloudStackClient) {
    this.cloudStackClient = cloudStackClient;

    // List handlers using factory (only ones with simple title fields)
    this.handleListLoadBalancerRules = createListHandler<LoadBalancerRule>(cloudStackClient, {
      command: 'listLoadBalancerRules',
      responseKey: 'listloadbalancerrulesresponse',
      arrayKey: 'loadbalancerrule',
      itemName: 'load balancer rule',
      titleField: 'name',
      idField: 'id',
      fields: NetworkRulesHandlers.loadBalancerRuleFields,
    });

    // Action handlers using factory
    this.handleCreateFirewallRule = createActionHandler(cloudStackClient, {
      command: 'createFirewallRule',
      responseKey: 'createfirewallruleresponse',
      actionVerb: 'Created',
      itemName: 'firewall rule',
      requiredFields: ['ipaddressid', 'protocol'],
      jobIdField: 'jobid',
      resultIdField: 'id',
    });

    this.handleDeleteFirewallRule = createActionHandler(cloudStackClient, {
      command: 'deleteFirewallRule',
      responseKey: 'deletefirewallruleresponse',
      actionVerb: 'Deleting',
      itemName: 'firewall rule',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args) => `Deleting firewall rule ${args.id}`,
    });

    this.handleCreateLoadBalancerRule = createActionHandler(cloudStackClient, {
      command: 'createLoadBalancerRule',
      responseKey: 'createloadbalancerruleresponse',
      actionVerb: 'Created',
      itemName: 'load balancer rule',
      requiredFields: ['name', 'algorithm', 'publicport', 'privateport', 'publicipid'],
      jobIdField: 'jobid',
      resultIdField: 'id',
      successMessage: (args, result) =>
        `Created load balancer rule "${args.name}". Job ID: ${result?.jobid || 'N/A'}\nRule ID: ${result?.id || 'pending'}`,
    });

    this.handleDeleteLoadBalancerRule = createActionHandler(cloudStackClient, {
      command: 'deleteLoadBalancerRule',
      responseKey: 'deleteloadbalancerruleresponse',
      actionVerb: 'Deleted',
      itemName: 'load balancer rule',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args) => `Deleted load balancer rule ${args.id}`,
    });

    this.handleCreatePortForwardingRule = createActionHandler(cloudStackClient, {
      command: 'createPortForwardingRule',
      responseKey: 'createportforwardingruleresponse',
      actionVerb: 'Created',
      itemName: 'port forwarding rule',
      requiredFields: ['ipaddressid', 'protocol', 'publicport', 'privateport', 'virtualmachineid'],
      jobIdField: 'jobid',
      resultIdField: 'id',
      successMessage: (args, result) =>
        `Created port forwarding rule ${args.publicport} → ${args.privateport}. Job ID: ${result?.jobid || 'N/A'}\nRule ID: ${result?.id || 'pending'}`,
    });

    this.handleDeletePortForwardingRule = createActionHandler(cloudStackClient, {
      command: 'deletePortForwardingRule',
      responseKey: 'deleteportforwardingruleresponse',
      actionVerb: 'Deleted',
      itemName: 'port forwarding rule',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args) => `Deleted port forwarding rule ${args.id}`,
    });

    this.handleCreateEgressFirewallRule = createActionHandler(cloudStackClient, {
      command: 'createEgressFirewallRule',
      responseKey: 'createegressfirewallruleresponse',
      actionVerb: 'Created',
      itemName: 'egress firewall rule',
      requiredFields: ['networkid', 'protocol'],
      jobIdField: 'jobid',
    });

    this.handleListEgressFirewallRules = createListHandler<FirewallRule>(cloudStackClient, {
      command: 'listEgressFirewallRules',
      responseKey: 'listegressfirewallrulesresponse',
      arrayKey: 'firewallrule',
      itemName: 'egress firewall rule',
      titleField: 'id',
      idField: 'id',
      fields: [
        { key: 'protocol', label: 'Protocol', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'startport', label: 'Start Port', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'endport', label: 'End Port', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'cidrlist', label: 'CIDR List', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'state', label: 'State', format: (v: unknown) => v ? String(v) : 'N/A' },
      ],
    });

    this.handleDeleteEgressFirewallRule = createActionHandler(cloudStackClient, {
      command: 'deleteEgressFirewallRule',
      responseKey: 'deleteegressfirewallruleresponse',
      actionVerb: 'Deleting',
      itemName: 'egress firewall rule',
      requiredFields: ['id'],
      jobIdField: 'jobid',
    });

    this.handleUpdateLoadBalancerRule = createActionHandler(cloudStackClient, {
      command: 'updateLoadBalancerRule',
      responseKey: 'updateloadbalancerruleresponse',
      actionVerb: 'Updating',
      itemName: 'load balancer rule',
      requiredFields: ['id'],
      jobIdField: 'jobid',
    });

    this.handleListLBStickinessPolicies = createListHandler<LBStickinessPolicy>(cloudStackClient, {
      command: 'listLBStickinessPolicies',
      responseKey: 'listlbstickinesspoliciesresponse',
      arrayKey: 'stickinesspolicy',
      itemName: 'LB stickiness policy',
      titleField: 'name',
      idField: 'id',
      fields: [
        { key: 'name', label: 'Name', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'methodname', label: 'Method', format: (v: unknown) => v ? String(v) : 'N/A' },
        { key: 'lbruleid', label: 'LB Rule ID', format: (v: unknown) => v ? String(v) : 'N/A' },
      ],
    });

    this.handleCreateLBStickinessPolicy = createActionHandler(cloudStackClient, {
      command: 'createLBStickinessPolicy',
      responseKey: 'createlbstickinesspolicyresponse',
      actionVerb: 'Created',
      itemName: 'LB stickiness policy',
      requiredFields: ['lbruleid', 'methodname', 'name'],
      jobIdField: 'jobid',
    });

    this.handleDeleteLBStickinessPolicy = createActionHandler(cloudStackClient, {
      command: 'deleteLBStickinessPolicy',
      responseKey: 'deletelbstickinesspolicyresponse',
      actionVerb: 'Deleting',
      itemName: 'LB stickiness policy',
      requiredFields: ['id'],
      jobIdField: 'jobid',
    });
  }

  /**
   * List firewall rules - custom handler for complex title formatting
   */
  async handleListFirewallRules(args: CloudStackParams = {}) {
    const result = await this.cloudStackClient.request<{
      listfirewallrulesresponse?: { firewallrule?: FirewallRule[] };
    }>('listFirewallRules', args);

    const rules = result.listfirewallrulesresponse?.firewallrule || [];

    if (rules.length === 0) {
      return {
        content: [{ type: 'text' as const, text: 'No firewall rules found' }],
      };
    }

    const output = rules
      .map((r: FirewallRule) => {
        const portPart = r.startport
          ? `:${r.startport}${r.endport !== r.startport ? `-${r.endport}` : ''}`
          : '';
        return `• ${r.ipaddress || 'N/A'} - ${r.protocol}${portPart} (${r.id})\n  CIDR: ${r.cidrlist || 'N/A'}\n  State: ${r.state}`;
      })
      .join('\n\n');

    return {
      content: [
        {
          type: 'text' as const,
          text: `Found ${rules.length} firewall rule${rules.length === 1 ? '' : 's'}:\n\n${output}`,
        },
      ],
    };
  }

  /**
   * List port forwarding rules - custom handler for complex title formatting
   */
  async handleListPortForwardingRules(args: CloudStackParams = {}) {
    const result = await this.cloudStackClient.request<{
      listportforwardingrulesresponse?: { portforwardingrule?: PortForwardingRule[] };
    }>('listPortForwardingRules', args);

    const rules = result.listportforwardingrulesresponse?.portforwardingrule || [];

    if (rules.length === 0) {
      return {
        content: [{ type: 'text' as const, text: 'No port forwarding rules found' }],
      };
    }

    const output = rules
      .map(
        (r: PortForwardingRule) =>
          `• ${r.ipaddress}:${r.publicport} → ${r.privateport} (${r.protocol}) (${r.id})\n  VM: ${r.virtualmachinename || 'N/A'}\n  State: ${r.state}`
      )
      .join('\n\n');

    return {
      content: [
        {
          type: 'text' as const,
          text: `Found ${rules.length} port forwarding rule${rules.length === 1 ? '' : 's'}:\n\n${output}`,
        },
      ],
    };
  }

  /**
   * Assign VMs to load balancer rule - custom handler for virtualmachineids handling
   */
  async handleAssignToLoadBalancerRule(args: { id?: string; virtualmachineids?: string }) {
    if (!args.id || !args.virtualmachineids) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'Error: Missing required fields "id" and "virtualmachineids" for assign_to_load_balancer_rule',
          },
        ],
      };
    }

    const result = await this.cloudStackClient.request<{
      assigntoloadbalancerruleresponse?: { jobid?: string };
    }>('assignToLoadBalancerRule', {
      id: args.id,
      virtualmachineids: args.virtualmachineids.split(',').join(','),
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: `Assigned VM(s) to load balancer rule ${args.id}. Job ID: ${result.assigntoloadbalancerruleresponse?.jobid || 'N/A'}`,
        },
      ],
    };
  }

  /**
   * Remove VMs from load balancer rule - custom handler for virtualmachineids handling
   */
  async handleRemoveFromLoadBalancerRule(args: { id?: string; virtualmachineids?: string }) {
    if (!args.id || !args.virtualmachineids) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'Error: Missing required fields "id" and "virtualmachineids" for remove_from_load_balancer_rule',
          },
        ],
      };
    }

    const result = await this.cloudStackClient.request<{
      removefromloadbalancerruleresponse?: { jobid?: string };
    }>('removeFromLoadBalancerRule', {
      id: args.id,
      virtualmachineids: args.virtualmachineids.split(',').join(','),
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: `Removed VM(s) from load balancer rule ${args.id}. Job ID: ${result.removefromloadbalancerruleresponse?.jobid || 'N/A'}`,
        },
      ],
    };
  }
}
