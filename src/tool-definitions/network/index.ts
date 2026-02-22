/**
 * Network module tool definitions
 * Combines core infrastructure, traffic rules, router management, and NIC tools
 */

import { coreTools } from './core-tools.js';
import { rulesTools } from './rules-tools.js';
import { routerTools } from './router-tools.js';
import { nicTools } from './nic-tools.js';
import { aclTools } from './acl-tools.js';

/**
 * Complete network tools collection
 * - Core infrastructure: networks, IPs, VPCs, offerings, services
 * - Traffic rules: firewall, load balancer, port forwarding, egress, stickiness
 * - Router management: lifecycle operations
 * - NIC management: VM network interfaces and IP addresses
 * - ACL management: network ACL items and lists
 */
export const networkTools = [...coreTools, ...rulesTools, ...routerTools, ...nicTools, ...aclTools] as const;
