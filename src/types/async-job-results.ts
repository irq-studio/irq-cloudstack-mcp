/**
 * Type definitions for CloudStack async job results
 * These interfaces eliminate the need for 'as any' type assertions
 * when handling async job responses from CloudStack API.
 */

/**
 * Network interface card details
 */
export interface NicDetails {
  id: string;
  networkid: string;
  ipaddress?: string;
  macaddress?: string;
  netmask?: string;
  gateway?: string;
  isdefault?: boolean;
  type?: string;
  traffictype?: string;
}

/**
 * Virtual machine with NIC array
 * Used when async jobs return VM details with network interfaces
 */
export interface VirtualMachineWithNics {
  virtualmachine: {
    id: string;
    name: string;
    nic: NicDetails[];
    state?: string;
    displayname?: string;
  };
}

/**
 * NIC secondary IP details
 * Used when async jobs return secondary IP address information
 */
export interface NicSecondaryIpResult {
  nicsecondaryip: {
    id: string;
    ipaddress: string;
    nicid: string;
    networkid?: string;
    virtualmachineid?: string;
  };
}

/**
 * Generic error result from failed async jobs
 */
export interface AsyncJobError {
  errorcode?: number;
  errortext: string;
}

/**
 * Union type for all possible async job results
 * Add new result types here as they are discovered
 */
export type AsyncJobResultData =
  | VirtualMachineWithNics
  | NicSecondaryIpResult
  | AsyncJobError
  | Record<string, unknown>; // Fallback for unknown result types
