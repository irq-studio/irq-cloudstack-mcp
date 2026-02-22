/**
 * Network Router Handlers
 *
 * Uses the factory pattern for action handlers:
 * - Action handler configs for start/stop/reboot/destroy operations
 * - Custom handler for list operation with state counting
 */

import type { CloudStackClient } from '../../cloudstack-client.js';
import { createActionHandler } from '../../utils/index.js';
import type { ListRoutersArgs } from '../../handler-types.js';
import type { ListRoutersResponse, Router } from '../../types/index.js';

/**
 * Virtual router lifecycle management handlers
 * Handles: router listing, start, stop, reboot, and destroy operations
 */
export class NetworkRouterHandlers {
  // Action handlers using factory
  public readonly handleStartRouter;
  public readonly handleStopRouter;
  public readonly handleRebootRouter;
  public readonly handleDestroyRouter;

  // Store client for custom handlers
  private readonly cloudStackClient: CloudStackClient;

  constructor(cloudStackClient: CloudStackClient) {
    this.cloudStackClient = cloudStackClient;

    // Action handlers using factory
    this.handleStartRouter = createActionHandler(cloudStackClient, {
      command: 'startRouter',
      responseKey: 'startrouterresponse',
      actionVerb: 'Starting',
      itemName: 'router',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) => `Starting router ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleStopRouter = createActionHandler(cloudStackClient, {
      command: 'stopRouter',
      responseKey: 'stoprouterresponse',
      actionVerb: 'Stopping',
      itemName: 'router',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) => `Stopping router ${args.id}${args.forced ? ' (forced)' : ''}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleRebootRouter = createActionHandler(cloudStackClient, {
      command: 'rebootRouter',
      responseKey: 'rebootrouterresponse',
      actionVerb: 'Rebooting',
      itemName: 'router',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) => `Rebooting router ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleDestroyRouter = createActionHandler(cloudStackClient, {
      command: 'destroyRouter',
      responseKey: 'destroyrouterresponse',
      actionVerb: 'Destroying',
      itemName: 'router',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) => `Destroying router ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });
  }

  /**
   * List routers - custom handler for state counting
   */
  async handleListRouters(args: ListRoutersArgs) {
    // Default to listall=true for admin queries to show all routers across accounts
    const params = { listall: true, ...args };
    const result = await this.cloudStackClient.listRouters<ListRoutersResponse>(params);
    const routers = result.listroutersresponse?.router || [];

    // Count by state and account
    const stateCount: Record<string, number> = {};
    const accountCount: Record<string, number> = {};
    routers.forEach((r: Router) => {
      stateCount[r.state] = (stateCount[r.state] || 0) + 1;
      if (r.account) {
        accountCount[r.account] = (accountCount[r.account] || 0) + 1;
      }
    });

    const stateSummary = Object.entries(stateCount).map(([state, count]) => `  ${state}: ${count}`).join('\n');

    return {
      content: [{ type: 'text' as const, text: `Found ${routers.length} virtual routers:\n\nBy State:\n${stateSummary}\n\nRouters:\n${routers.map((r: Router) => `• ${r.name} (${r.id}) - ${r.state}\n  Zone: ${r.zonename} | Account: ${r.account} | Domain: ${r.domain}\n  VPC: ${r.vpcname || 'N/A'}\n  Version: ${r.version}\n`).join('\n')}` }]
    };
  }
}
