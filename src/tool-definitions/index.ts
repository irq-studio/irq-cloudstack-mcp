import { virtualMachineTools } from './virtual-machine-tools.js';
import { storageTools } from './storage-tools.js';
import { networkTools } from './network/index.js';
import { monitoringTools } from './monitoring-tools.js';
import { adminTools } from './admin-tools.js';
import { securityTools } from './security-tools.js';
import { kubernetesTools } from './kubernetes-tools.js';
import { templateTools } from './template-tools.js';
import { jobTools } from './job-tools.js';
import { tagTools } from './tag-tools.js';
import { affinityTools } from './affinity-tools.js';
import { vpnTools } from './vpn-tools.js';
import { projectTools } from './project-tools.js';
import { vmSnapshotTools } from './vm-snapshot-tools.js';
import { autoscaleTools } from './autoscale-tools.js';
import { backupTools } from './backup-tools.js';
import { roleTools } from './role-tools.js';

export const allToolDefinitions = [
  ...virtualMachineTools,
  ...storageTools,
  ...networkTools,
  ...kubernetesTools,
  ...monitoringTools,
  ...adminTools,
  ...securityTools,
  ...templateTools,
  ...jobTools,
  ...tagTools,
  ...affinityTools,
  ...vpnTools,
  ...projectTools,
  ...vmSnapshotTools,
  ...autoscaleTools,
  ...backupTools,
  ...roleTools,
] as const;

export {
  virtualMachineTools,
  storageTools,
  networkTools,
  kubernetesTools,
  monitoringTools,
  adminTools,
  securityTools,
  templateTools,
  jobTools,
  tagTools,
  affinityTools,
  vpnTools,
  projectTools,
  vmSnapshotTools,
  autoscaleTools,
  backupTools,
  roleTools,
};
