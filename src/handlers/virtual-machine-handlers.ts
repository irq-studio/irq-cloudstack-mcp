/**
 * Virtual Machine Handlers
 *
 * Uses the factory pattern for action handlers:
 * - Action handler configs for start/stop/reboot/deploy/scale/migrate operations
 * - Custom handlers for operations with special requirements (list, get, destroy, metrics)
 */

import type { CloudStackClient, CloudStackParams } from '../cloudstack-client.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { createActionHandler, safeValue } from '../utils/index.js';
import { ValidationError } from '../utils/validation.js';
import type {
  ListVirtualMachinesResponse,
  VirtualMachine,
  StopVirtualMachineResponse,
  DestroyVirtualMachineResponse,
  ListVirtualMachinesMetricsResponse,
} from '../types/index.js';
import type { McpResponse } from '../types.js';

export class VirtualMachineHandlers {
  // Handler instances created by factory
  public readonly handleStartVirtualMachine;
  public readonly handleRebootVirtualMachine;
  public readonly handleDeployVirtualMachine;
  public readonly handleScaleVirtualMachine;
  public readonly handleMigrateVirtualMachine;
  public readonly handleResetPasswordVirtualMachine;
  public readonly handleChangeServiceOfferingVirtualMachine;
  public readonly handleRecoverVirtualMachine;
  public readonly handleUpdateVirtualMachine;
  public readonly handleAssignVirtualMachine;
  public readonly handleRestoreVirtualMachine;

  // Store client for custom handlers
  private readonly cloudStackClient: CloudStackClient;

  constructor(cloudStackClient: CloudStackClient) {
    this.cloudStackClient = cloudStackClient;

    // Action handlers using factory
    this.handleStartVirtualMachine = createActionHandler(cloudStackClient, {
      command: 'startVirtualMachine',
      responseKey: 'startvirtualmachineresponse',
      actionVerb: 'Started',
      itemName: 'virtual machine',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) => `Started virtual machine ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleRebootVirtualMachine = createActionHandler(cloudStackClient, {
      command: 'rebootVirtualMachine',
      responseKey: 'rebootvirtualmachineresponse',
      actionVerb: 'Rebooted',
      itemName: 'virtual machine',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) => `Rebooted virtual machine ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleDeployVirtualMachine = createActionHandler(cloudStackClient, {
      command: 'deployVirtualMachine',
      responseKey: 'deployvirtualmachineresponse',
      actionVerb: 'Deployed',
      itemName: 'virtual machine',
      requiredFields: ['serviceofferingid', 'templateid', 'zoneid'],
      jobIdField: 'jobid',
      resultIdField: 'id',
    });

    this.handleScaleVirtualMachine = createActionHandler(cloudStackClient, {
      command: 'scaleVirtualMachine',
      responseKey: 'scalevirtualmachineresponse',
      actionVerb: 'Scaled',
      itemName: 'virtual machine',
      requiredFields: ['id', 'serviceofferingid'],
      jobIdField: 'jobid',
      successMessage: (args, result) => `Scaled virtual machine ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleMigrateVirtualMachine = createActionHandler(cloudStackClient, {
      command: 'migrateVirtualMachine',
      responseKey: 'migratevirtualmachineresponse',
      actionVerb: 'Migrated',
      itemName: 'virtual machine',
      requiredFields: ['virtualmachineid'],
      jobIdField: 'jobid',
      successMessage: (args, result) => `Migrated virtual machine ${args.virtualmachineid}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleResetPasswordVirtualMachine = createActionHandler(cloudStackClient, {
      command: 'resetPasswordForVirtualMachine',
      responseKey: 'resetpasswordforvirtualmachineresponse',
      actionVerb: 'Reset password for',
      itemName: 'virtual machine',
      requiredFields: ['id'],
      jobIdField: 'jobid',
      successMessage: (args, result) => `Reset password for virtual machine ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleChangeServiceOfferingVirtualMachine = createActionHandler(cloudStackClient, {
      command: 'changeServiceForVirtualMachine',
      responseKey: 'changeserviceforvirtualmachineresponse',
      actionVerb: 'Changed service offering for',
      itemName: 'virtual machine',
      requiredFields: ['id', 'serviceofferingid'],
      jobIdField: 'jobid',
      successMessage: (args, result) => `Changed service offering for virtual machine ${args.id}. Job ID: ${result?.jobid || 'N/A'}`,
    });

    this.handleRecoverVirtualMachine = createActionHandler(cloudStackClient, {
      command: 'recoverVirtualMachine',
      responseKey: 'recovervirtualmachineresponse',
      actionVerb: 'Recovered',
      itemName: 'virtual machine',
      requiredFields: ['id'],
      successMessage: (args) => `Recovered virtual machine ${args.id}`,
    });

    this.handleUpdateVirtualMachine = createActionHandler(cloudStackClient, {
      command: 'updateVirtualMachine',
      responseKey: 'updatevirtualmachineresponse',
      actionVerb: 'Updated',
      itemName: 'virtual machine',
      requiredFields: ['id'],
      successMessage: (args) => `Updated virtual machine ${args.id}`,
    });

    this.handleAssignVirtualMachine = createActionHandler(cloudStackClient, {
      command: 'assignVirtualMachine',
      responseKey: 'assignvirtualmachineresponse',
      actionVerb: 'Assigned',
      itemName: 'virtual machine',
      requiredFields: ['virtualmachineid', 'account', 'domainid'],
      successMessage: (args) => `Assigned virtual machine ${args.virtualmachineid} to account ${args.account}`,
    });

    this.handleRestoreVirtualMachine = createActionHandler(cloudStackClient, {
      command: 'restoreVirtualMachine',
      responseKey: 'restorevirtualmachineresponse',
      actionVerb: 'Restoring',
      itemName: 'virtual machine',
      requiredFields: ['virtualmachineid'],
      jobIdField: 'jobid',
      successMessage: (args, result) => `Restoring virtual machine ${args.virtualmachineid}. Job ID: ${result?.jobid || 'N/A'}`,
    });
  }

  /**
   * List virtual machines - custom handler for complex output formatting
   */
  async handleListVirtualMachines(args: CloudStackParams = {}): Promise<McpResponse> {
    const result = await this.cloudStackClient.listVirtualMachines<ListVirtualMachinesResponse>(args);
    const vms = result.listvirtualmachinesresponse?.virtualmachine || [];

    const vmList = vms.map((vm: VirtualMachine) => ({
      id: vm.id,
      name: vm.name,
      displayname: vm.displayname,
      account: vm.account,
      domain: vm.domain,
      state: vm.state,
      zonename: vm.zonename,
      templatename: vm.templatename,
      serviceofferingname: vm.serviceofferingname,
      cpunumber: vm.cpunumber,
      memory: vm.memory,
      networkkbsread: vm.networkkbsread,
      networkkbswrite: vm.networkkbswrite,
      diskioread: vm.diskioread,
      diskiowrite: vm.diskiowrite,
      disksize: vm.disksize,
      created: vm.created,
      ipaddress: vm.nic?.[0]?.ipaddress,
      hostname: vm.hostname
    }));

    return {
      content: [
        {
          type: 'text' as const,
          text: `Found ${vmList.length} virtual machines:\n\n${vmList
            .map((vm) =>
              `• ${vm.name} (${vm.id})\n  Display Name: ${safeValue(vm.displayname)}\n  Account: ${vm.account}\n  Domain: ${vm.domain}\n  State: ${vm.state}\n  Zone: ${safeValue(vm.zonename)}\n  Template: ${safeValue(vm.templatename)}\n  Service Offering: ${safeValue(vm.serviceofferingname)}\n  CPUs: ${vm.cpunumber}, RAM: ${vm.memory}MB\n  IP Address: ${safeValue(vm.ipaddress)}\n  Created: ${vm.created}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  /**
   * Get single virtual machine - custom handler for not-found error handling
   */
  async handleGetVirtualMachine(args: { id?: string }): Promise<McpResponse> {
    if (!args.id) {
      throw new ValidationError('get_virtual_machine: Missing required field: id');
    }

    const result = await this.cloudStackClient.listVirtualMachines<ListVirtualMachinesResponse>({ id: args.id });
    const vms = result.listvirtualmachinesresponse?.virtualmachine || [];

    if (vms.length === 0) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Virtual machine with ID ${args.id} not found`
      );
    }

    const vm = vms[0];
    return {
      content: [
        {
          type: 'text' as const,
          text: `Virtual Machine Details:\n\nID: ${vm.id}\nName: ${vm.name}\nDisplay Name: ${safeValue(vm.displayname)}\nState: ${vm.state}\nZone: ${safeValue(vm.zonename)}\nTemplate: ${safeValue(vm.templatename)}\nService Offering: ${safeValue(vm.serviceofferingname)}\nCPUs: ${vm.cpunumber}\nMemory: ${vm.memory}MB\nIP Address: ${safeValue(vm.nic?.[0]?.ipaddress)}\nHostname: ${safeValue(vm.hostname)}\nCreated: ${vm.created}\nHypervisor: ${safeValue(vm.hypervisor)}\nRoot Device Type: ${safeValue(vm.rootdevicetype)}\nSecurityGroups: ${vm.securitygroup?.map((sg) => sg.name).join(', ') || 'None'}`
        }
      ]
    };
  }

  /**
   * Stop virtual machine - custom handler for forced parameter default
   */
  async handleStopVirtualMachine(args: { id?: string; forced?: boolean }): Promise<McpResponse> {
    if (!args.id) {
      throw new ValidationError('stop_virtual_machine: Missing required field: id');
    }

    const result = await this.cloudStackClient.request<{
      stopvirtualmachineresponse?: { jobid?: string };
    }>('stopVirtualMachine', {
      id: args.id,
      forced: args.forced || false
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: `Stopped virtual machine ${args.id}. Job ID: ${result.stopvirtualmachineresponse?.jobid || 'N/A'}`
        }
      ]
    };
  }

  /**
   * Destroy virtual machine - custom handler for multi-step orchestration
   */
  async handleDestroyVirtualMachine(args: { id?: string; expunge?: boolean }): Promise<McpResponse> {
    if (!args.id) {
      throw new ValidationError('destroy_virtual_machine: Missing required field: id');
    }

    // First, check current VM state
    const vmResult = await this.cloudStackClient.listVirtualMachines<ListVirtualMachinesResponse>({ id: args.id });
    const vms = vmResult.listvirtualmachinesresponse?.virtualmachine || [];

    if (vms.length === 0) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Virtual machine with ID ${args.id} not found`
      );
    }

    const vm = vms[0];
    const vmName = vm.name || vm.displayname || args.id;
    const steps: string[] = [`Starting destruction process for VM: ${vmName} (${args.id})`];

    // Step 1: Stop the VM if it's running (unless it's in Error state)
    const STOP_VM_WAIT_MS = process.env.CLOUDSTACK_STOP_VM_WAIT_MS
      ? parseInt(process.env.CLOUDSTACK_STOP_VM_WAIT_MS, 10)
      : 2000; // Wait time after stopping VM before destroy

    if (vm.state === 'Running') {
      steps.push('Step 1: Stopping VM...');
      const stopResult = await this.cloudStackClient.stopVirtualMachine<StopVirtualMachineResponse>({
        id: args.id,
        forced: true
      });
      steps.push(`Success: Stop job initiated: ${stopResult.stopvirtualmachineresponse?.jobid}`);

      // Wait a moment for the stop to process
      await new Promise(resolve => setTimeout(resolve, STOP_VM_WAIT_MS));
    } else if (vm.state === 'Stopped' || vm.state === 'Error') {
      steps.push(`Step 1: VM is already in ${vm.state} state, proceeding to destroy...`);
    } else {
      steps.push(`Step 1: VM is in ${vm.state} state, attempting to destroy...`);
    }

    // Step 2: Destroy the VM
    steps.push('Step 2: Destroying VM...');
    const destroyResult = await this.cloudStackClient.destroyVirtualMachine<DestroyVirtualMachineResponse>({
      id: args.id,
      expunge: args.expunge || false
    });
    steps.push(`Success: Destroy job initiated: ${destroyResult.destroyvirtualmachineresponse?.jobid}`);

    // Step 3: Note about expunge (handled by destroy with expunge=true)
    if (args.expunge) {
      steps.push('Step 3: VM will be expunged (permanently deleted) automatically');
    }

    steps.push(`\nVM destruction process completed for ${vmName}`);
    if (args.expunge) {
      steps.push('Warning: VM has been permanently deleted and cannot be recovered');
    } else {
      steps.push('Note: VM is destroyed but not expunged - it can still be recovered');
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: steps.join('\n')
        }
      ]
    };
  }

  /**
   * List virtual machine metrics - custom handler for complex output formatting
   */
  async handleListVirtualMachineMetrics(args: CloudStackParams = {}): Promise<McpResponse> {
    const result = await this.cloudStackClient.listVirtualMachineMetrics<ListVirtualMachinesMetricsResponse>(args);
    const metrics = result.listvirtualmachinesmetricsresponse?.virtualmachine || [];

    const metricsList = metrics.map((vm: VirtualMachine) => ({
      id: vm.id,
      name: vm.name,
      state: vm.state,
      cpuused: vm.cpuused,
      networkkbsread: vm.networkkbsread,
      networkkbswrite: vm.networkkbswrite,
      diskioread: vm.diskioread,
      diskiowrite: vm.diskiowrite,
      disksize: vm.disksize,
      memory: vm.memory,
      cpunumber: vm.cpunumber
    }));

    return {
      content: [
        {
          type: 'text' as const,
          text: `Found ${metricsList.length} virtual machine metrics:\n\n${metricsList
            .map((vm: typeof metricsList[0]) =>
              `• ${vm.name} (${vm.id})\n  State: ${vm.state}\n  CPU Used: ${safeValue(vm.cpuused, 'N/A')}\n  Memory: ${vm.memory}MB\n  CPUs: ${vm.cpunumber}\n  Disk Size: ${safeValue(vm.disksize, 'N/A')}\n  Network Read: ${safeValue(vm.networkkbsread, 'N/A')}\n  Network Write: ${safeValue(vm.networkkbswrite, 'N/A')}\n  Disk Read: ${safeValue(vm.diskioread, 'N/A')}\n  Disk Write: ${safeValue(vm.diskiowrite, 'N/A')}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }
}
