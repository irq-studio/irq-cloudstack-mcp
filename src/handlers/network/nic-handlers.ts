import type { CloudStackClient } from '../../cloudstack-client.js';
import { validateRequiredFields } from '../../handler-types.js';
import type {
  ListNicsArgs,
  AddNicToVirtualMachineArgs,
  RemoveNicFromVirtualMachineArgs,
  UpdateDefaultNicForVirtualMachineArgs,
  AddIpToNicArgs,
  RemoveIpFromNicArgs,
} from '../../handler-types.js';
import type {
  ListNicsResponse,
  Nic,
  AddNicToVirtualMachineResponse,
  RemoveNicFromVirtualMachineResponse,
  UpdateDefaultNicForVirtualMachineResponse,
  AddIpToNicResponse,
  RemoveIpFromNicResponse,
} from '../../types/index.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type {
  VirtualMachineWithNics,
  NicSecondaryIpResult,
} from '../../types/async-job-results.js';

// Async job timeout: 5 minutes
const ASYNC_JOB_TIMEOUT_MS = 300000;

/**
 * NIC (Network Interface Card) management handlers
 * Handles: VM network interfaces and IP address management
 */
export class NetworkNicHandlers {
  constructor(private readonly cloudStackClient: CloudStackClient) {}

  /**
   * Wait for an async job and convert errors to McpError
   */
  private async waitForJob(jobid: string): Promise<Record<string, unknown>> {
    try {
      const result = await this.cloudStackClient.waitForAsyncJob(jobid, { timeout: ASYNC_JOB_TIMEOUT_MS });
      const response = result.queryasyncjobresultresponse as Record<string, unknown>;
      return (response?.jobresult as Record<string, unknown>) || {};
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        error instanceof Error ? error.message : `Async job ${jobid} failed`
      );
    }
  }

  async handleListNics(args: ListNicsArgs) {
    validateRequiredFields(args, ['virtualmachineid'], 'list_nics');

    const result = await this.cloudStackClient.listNics<ListNicsResponse>(args);
    const nics = result.listnicsresponse?.nic || [];

    const nicList = nics.map((nic: Nic) => ({
      id: nic.id,
      ipaddress: nic.ipaddress,
      netmask: nic.netmask,
      gateway: nic.gateway,
      macaddress: nic.macaddress,
      networkid: nic.networkid,
      networkname: nic.networkname,
      isdefault: nic.isdefault,
      type: nic.type,
      secondaryip: nic.secondaryip || []
    }));

    return {
      content: [
        {
          type: 'text' as const,
          text: `Found ${nicList.length} network interface(s):\n\n${nicList
            .map((nic) =>
              `• NIC ${nic.id}${nic.isdefault ? ' (DEFAULT)' : ''}\n` +
              `  IP Address: ${nic.ipaddress}\n` +
              `  MAC Address: ${nic.macaddress}\n` +
              `  Network: ${nic.networkname} (${nic.networkid})\n` +
              `  Gateway: ${nic.gateway}\n` +
              `  Netmask: ${nic.netmask}\n` +
              `  Type: ${nic.type}\n` +
              `  Secondary IPs: ${nic.secondaryip.length > 0 ? nic.secondaryip.map(ip => ip.ipaddress).join(', ') : 'None'}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  async handleAddNicToVirtualMachine(args: AddNicToVirtualMachineArgs) {
    validateRequiredFields(args, ['virtualmachineid', 'networkid'], 'add_nic_to_virtual_machine');

    const result = await this.cloudStackClient.addNicToVirtualMachine<AddNicToVirtualMachineResponse>(args);
    const jobid = result.addnictovirtualmachineresponse?.jobid;
    const nicid = result.addnictovirtualmachineresponse?.nic?.id;

    if (jobid) {
      const jobResult = await this.waitForJob(jobid);
      const vm = jobResult as unknown as VirtualMachineWithNics;
      const addedNic = vm?.virtualmachine?.nic?.find(n => n.networkid === args.networkid);

      return {
        content: [
          {
            type: 'text' as const,
            text: `Successfully added NIC to VM ${args.virtualmachineid}\n` +
                  `NIC ID: ${addedNic?.id}\n` +
                  `IP Address: ${addedNic?.ipaddress || args.ipaddress || 'Auto-assigned'}\n` +
                  `Network: ${addedNic?.networkid}\n` +
                  `MAC Address: ${addedNic?.macaddress}`
          }
        ]
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: `Adding NIC to VM ${args.virtualmachineid}. Job ID: ${jobid}\nNIC ID: ${nicid || 'Pending'}`
        }
      ]
    };
  }

  async handleRemoveNicFromVirtualMachine(args: RemoveNicFromVirtualMachineArgs) {
    validateRequiredFields(args, ['virtualmachineid', 'nicid'], 'remove_nic_from_virtual_machine');

    const result = await this.cloudStackClient.removeNicFromVirtualMachine<RemoveNicFromVirtualMachineResponse>(args);
    const jobid = result.removenicfromvirtualmachineresponse?.jobid;

    if (jobid) {
      await this.waitForJob(jobid);
      return {
        content: [
          {
            type: 'text' as const,
            text: `Successfully removed NIC ${args.nicid} from VM ${args.virtualmachineid}`
          }
        ]
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: `Removing NIC ${args.nicid} from VM ${args.virtualmachineid}. Job ID: ${jobid}`
        }
      ]
    };
  }

  async handleUpdateDefaultNicForVirtualMachine(args: UpdateDefaultNicForVirtualMachineArgs) {
    validateRequiredFields(args, ['virtualmachineid', 'nicid'], 'update_default_nic_for_virtual_machine');

    const result = await this.cloudStackClient.updateDefaultNicForVirtualMachine<UpdateDefaultNicForVirtualMachineResponse>(args);
    const jobid = result.updatedefaultnicforvirtualmachineresponse?.jobid;

    if (jobid) {
      await this.waitForJob(jobid);
      return {
        content: [
          {
            type: 'text' as const,
            text: `Successfully updated default NIC for VM ${args.virtualmachineid} to NIC ${args.nicid}`
          }
        ]
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: `Updating default NIC for VM ${args.virtualmachineid}. Job ID: ${jobid}`
        }
      ]
    };
  }

  async handleAddIpToNic(args: AddIpToNicArgs) {
    validateRequiredFields(args, ['nicid'], 'add_ip_to_nic');

    const result = await this.cloudStackClient.addIpToNic<AddIpToNicResponse>(args);
    const jobid = result.addiptonicresponse?.jobid;

    if (jobid) {
      const jobResult = await this.waitForJob(jobid);
      const nicsecondaryip = (jobResult as unknown as NicSecondaryIpResult)?.nicsecondaryip;
      return {
        content: [
          {
            type: 'text' as const,
            text: `Successfully added IP address to NIC ${args.nicid}\n` +
                  `IP Address: ${nicsecondaryip?.ipaddress || args.ipaddress || 'Auto-assigned'}\n` +
                  `Secondary IP ID: ${nicsecondaryip?.id || 'N/A'}\n` +
                  `Network: ${nicsecondaryip?.networkid || 'N/A'}`
          }
        ]
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: `Adding IP address ${args.ipaddress || 'auto-assigned'} to NIC ${args.nicid}. Job ID: ${jobid}`
        }
      ]
    };
  }

  async handleRemoveIpFromNic(args: RemoveIpFromNicArgs) {
    validateRequiredFields(args, ['id'], 'remove_ip_from_nic');

    const result = await this.cloudStackClient.removeIpFromNic<RemoveIpFromNicResponse>(args);
    const jobid = result.removeipfromnicresponse?.jobid;

    if (jobid) {
      await this.waitForJob(jobid);
      return {
        content: [
          {
            type: 'text' as const,
            text: `Successfully removed secondary IP ${args.id}`
          }
        ]
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: `Removing secondary IP ${args.id}. Job ID: ${jobid}`
        }
      ]
    };
  }
}
