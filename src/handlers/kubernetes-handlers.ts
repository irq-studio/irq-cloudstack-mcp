import type { CloudStackClient } from '../cloudstack-client.js';
import type {
  ListKubernetesClustersArgs,
  CreateKubernetesClusterArgs,
  DeleteKubernetesClusterArgs,
  StartKubernetesClusterArgs,
  StopKubernetesClusterArgs,
  ScaleKubernetesClusterArgs,
  UpgradeKubernetesClusterArgs,
  GetKubernetesClusterConfigArgs,
  ListKubernetesSupportedVersionsArgs,
} from '../handler-types.js';
import type {
  ListKubernetesClustersResponse,
  KubernetesCluster,
  CreateKubernetesClusterResponse,
  DeleteKubernetesClusterResponse,
  StartKubernetesClusterResponse,
  StopKubernetesClusterResponse,
  ScaleKubernetesClusterResponse,
  UpgradeKubernetesClusterResponse,
  GetKubernetesClusterConfigResponse,
  ListKubernetesSupportedVersionsResponse,
  KubernetesVersion,
} from '../types/index.js';

export class KubernetesHandlers {
  constructor(private readonly cloudStackClient: CloudStackClient) {}

  async handleCreateKubernetesCluster(args: CreateKubernetesClusterArgs) {
    const result = await this.cloudStackClient.createKubernetesCluster<CreateKubernetesClusterResponse>(args);
    const clusterId = result.createkubernetesclusterresponse?.id;
    const jobId = result.createkubernetesclusterresponse?.jobid;

    return {
      content: [
        {
          type: 'text' as const,
          text: `Creating Kubernetes cluster "${args.name}"...\n\nCluster ID: ${clusterId}\nJob ID: ${jobId}\n\nCluster creation started. Use list_kubernetes_clusters to check status.`
        }
      ]
    };
  }

  async handleListKubernetesClusters(args: ListKubernetesClustersArgs) {
    const result = await this.cloudStackClient.listKubernetesClusters<ListKubernetesClustersResponse>(args);
    const clusters = result.listkubernetesclustersresponse?.kubernetescluster || [];

    if (clusters.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'No Kubernetes clusters found.'
          }
        ]
      };
    }

    const clusterList = clusters.map((cluster: KubernetesCluster) => ({
      id: cluster.id,
      name: cluster.name,
      description: cluster.description,
      state: cluster.state,
      zonename: cluster.zonename,
      size: cluster.size,
      masternodes: cluster.masternodes,
      kubernetesversionname: cluster.kubernetesversionname,
      serviceofferingname: cluster.serviceofferingname,
      endpoint: cluster.endpoint,
      consoleendpoint: cluster.consoleendpoint,
      created: cluster.created,
      controlnodes: cluster.controlnodes,
      // CloudStack 4.22+ fields
      csienabled: cluster.csienabled,
      templatename: cluster.templatename
    }));

    return {
      content: [
        {
          type: 'text' as const,
          text: `Found ${clusterList.length} Kubernetes cluster(s):\n\n${clusterList
            .map((cluster) =>
              `• ${cluster.name} (${cluster.id})\n  State: ${cluster.state}\n  Zone: ${cluster.zonename}\n  K8s Version: ${cluster.kubernetesversionname}\n  Control Nodes: ${cluster.controlnodes || cluster.masternodes || 1}\n  Worker Nodes: ${cluster.size}\n  Endpoint: ${cluster.endpoint || 'Not ready'}\n  Console: ${cluster.consoleendpoint || 'N/A'}${cluster.csienabled !== undefined ? `\n  CSI Enabled: ${cluster.csienabled}` : ''}${cluster.templatename ? `\n  Template: ${cluster.templatename}` : ''}\n  Created: ${cluster.created}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  async handleGetKubernetesCluster(args: ListKubernetesClustersArgs) {
    const result = await this.cloudStackClient.listKubernetesClusters<ListKubernetesClustersResponse>({ id: args.id });
    const clusters = result.listkubernetesclustersresponse?.kubernetescluster || [];

    if (clusters.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Kubernetes cluster with ID ${args.id} not found.`
          }
        ]
      };
    }

    const cluster = clusters[0];
    const vms = cluster.virtualmachines || [];

    return {
      content: [
        {
          type: 'text' as const,
          text: `Kubernetes Cluster Details:\n\nID: ${cluster.id}\nName: ${cluster.name}\nDescription: ${cluster.description || 'N/A'}\nState: ${cluster.state}\nZone: ${cluster.zonename}\nKubernetes Version: ${cluster.kubernetesversionname}\nControl Plane Nodes: ${cluster.controlnodes || cluster.masternodes || 1}\nWorker Nodes: ${cluster.size}\nService Offering: ${cluster.serviceofferingname}\nNetwork: ${cluster.networkname || 'Default'}\nAPI Endpoint: ${cluster.endpoint || 'Not ready'}\nConsole Endpoint: ${cluster.consoleendpoint || 'N/A'}${cluster.csienabled !== undefined ? `\nCSI Enabled: ${cluster.csienabled}` : ''}${cluster.templatename ? `\nTemplate: ${cluster.templatename}` : ''}\nCreated: ${cluster.created}\nAccount: ${cluster.account}\nDomain: ${cluster.domain}\n\nVirtual Machines (${vms.length}):\n${vms.map((vm) => `  • ${vm.name} (${vm.state})`).join('\n') || '  None'}`
        }
      ]
    };
  }

  async handleStartKubernetesCluster(args: StartKubernetesClusterArgs) {
    const result = await this.cloudStackClient.startKubernetesCluster<StartKubernetesClusterResponse>({ id: args.id });
    const jobId = result.startkubernetesclusterresponse?.jobid;

    return {
      content: [
        {
          type: 'text' as const,
          text: `Starting Kubernetes cluster ${args.id}...\n\nJob ID: ${jobId}\n\nCluster start initiated. This may take several minutes.`
        }
      ]
    };
  }

  async handleStopKubernetesCluster(args: StopKubernetesClusterArgs) {
    const result = await this.cloudStackClient.stopKubernetesCluster<StopKubernetesClusterResponse>({ id: args.id });
    const jobId = result.stopkubernetesclusterresponse?.jobid;

    return {
      content: [
        {
          type: 'text' as const,
          text: `Stopping Kubernetes cluster ${args.id}...\n\nJob ID: ${jobId}\n\nCluster stop initiated. All nodes will be stopped.`
        }
      ]
    };
  }

  async handleDeleteKubernetesCluster(args: DeleteKubernetesClusterArgs) {
    const result = await this.cloudStackClient.deleteKubernetesCluster<DeleteKubernetesClusterResponse>(args);
    const jobId = result.deletekubernetesclusterresponse?.jobid;

    return {
      content: [
        {
          type: 'text' as const,
          text: `Deleting Kubernetes cluster ${args.id}...\n\nJob ID: ${jobId}\n\nCluster deletion initiated. All resources will be removed.\n${args.cleanup ? 'Warning: Cleanup enabled - all associated resources will be deleted.' : 'Note: Cleanup disabled - some resources may remain.'}`
        }
      ]
    };
  }

  async handleScaleKubernetesCluster(args: ScaleKubernetesClusterArgs) {
    const result = await this.cloudStackClient.scaleKubernetesCluster<ScaleKubernetesClusterResponse>(args);
    const jobId = result.scalekubernetesclusterresponse?.jobid;

    const action = args.size ? `to ${args.size} worker nodes` : 'cluster';
    return {
      content: [
        {
          type: 'text' as const,
          text: `Scaling Kubernetes cluster ${args.id} ${action}...\n\nJob ID: ${jobId}\n\nCluster scaling initiated. Nodes will be added or removed as needed.`
        }
      ]
    };
  }

  async handleUpgradeKubernetesCluster(args: UpgradeKubernetesClusterArgs) {
    const result = await this.cloudStackClient.upgradeKubernetesCluster<UpgradeKubernetesClusterResponse>(args);
    const jobId = result.upgradekubernetesclusterresponse?.jobid;

    return {
      content: [
        {
          type: 'text' as const,
          text: `Upgrading Kubernetes cluster ${args.id} to version ${args.kubernetesversionid}...\n\nJob ID: ${jobId}\n\nCluster upgrade initiated. This process may take significant time.\nWarning: Ensure the target version is compatible with the current version.`
        }
      ]
    };
  }

  async handleGetKubernetesClusterConfig(args: GetKubernetesClusterConfigArgs) {
    const result = await this.cloudStackClient.getKubernetesClusterConfig<GetKubernetesClusterConfigResponse>({ id: args.id });
    const configData = result.getkubernetesclusterconfigresponse?.clusterconfig;

    if (!configData) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Unable to retrieve kubeconfig for cluster ${args.id}. The cluster may not be in Running state.`
          }
        ]
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: `Kubeconfig for cluster ${args.id}:\n\n\`\`\`yaml\n${configData.configdata}\n\`\`\`\n\nSave this to ~/.kube/config or use KUBECONFIG environment variable:\n\`\`\`bash\nexport KUBECONFIG=/path/to/config\nkubectl get nodes\n\`\`\``
        }
      ]
    };
  }

  async handleListKubernetesSupportedVersions(args: ListKubernetesSupportedVersionsArgs) {
    const result = await this.cloudStackClient.listKubernetesSupportedVersions<ListKubernetesSupportedVersionsResponse>(args);
    const versions = result.listkubernetessupportedversionsresponse?.kubernetessupportedversion || [];

    if (versions.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'No Kubernetes versions found.'
          }
        ]
      };
    }

    const versionList = versions.map((version: KubernetesVersion) => ({
      id: version.id,
      name: version.name,
      semanticversion: version.semanticversion,
      zonename: version.zonename,
      state: version.state,
      isostate: version.isostate,
      mincpunumber: version.mincpunumber,
      minmemory: version.minmemory
    }));

    return {
      content: [
        {
          type: 'text' as const,
          text: `Found ${versionList.length} Kubernetes version(s):\n\n${versionList
            .map((version) =>
              `• ${version.name} (${version.id})\n  Version: ${version.semanticversion}\n  Zone: ${version.zonename}\n  State: ${version.state}\n  ISO State: ${version.isostate}\n  Min CPUs: ${version.mincpunumber}\n  Min Memory: ${version.minmemory}MB\n`
            )
            .join('\n')}`
        }
      ]
    };
  }
}
