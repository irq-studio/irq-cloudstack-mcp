/**
 * Kubernetes Type Definitions
 */

export interface KubernetesCluster {
  id: string;
  name: string;
  description?: string;
  zoneid: string;
  zonename?: string;
  kubernetesversionid: string;
  kubernetesversionname?: string;
  serviceofferingid: string;
  serviceofferingname?: string;
  account?: string;
  domainid?: string;
  domain?: string;
  controlnodes?: number;
  masternodes?: number;
  size?: number;
  state: string;
  clustertype?: string;
  networkid?: string;
  networkname?: string;
  endpoint?: string;
  consoleendpoint?: string;
  created?: string;
  // CloudStack 4.22+ fields
  csienabled?: boolean;
  templatename?: string;
  virtualmachines?: Array<{
    id: string;
    name: string;
    state: string;
  }>;
}

export interface KubernetesVersion {
  id: string;
  name: string;
  semanticversion?: string;
  zoneid?: string;
  zonename?: string;
  isoname?: string;
  isoid?: string;
  isostate?: string;
  state?: string;
  mincpunumber?: number;
  minmemory?: number;
}

export interface ListKubernetesClustersResponse {
  listkubernetesclustersresponse: {
    count?: number;
    kubernetescluster?: KubernetesCluster[];
  };
}

export interface CreateKubernetesClusterResponse {
  createkubernetesclusterresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface DeleteKubernetesClusterResponse {
  deletekubernetesclusterresponse: {
    success?: boolean;
    jobid?: string;
  };
}

export interface StartKubernetesClusterResponse {
  startkubernetesclusterresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface StopKubernetesClusterResponse {
  stopkubernetesclusterresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface ScaleKubernetesClusterResponse {
  scalekubernetesclusterresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface UpgradeKubernetesClusterResponse {
  upgradekubernetesclusterresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface GetKubernetesClusterConfigResponse {
  getkubernetesclusterconfigresponse: {
    id?: string;
    name?: string;
    clusterconfig?: {
      configdata?: string;
    };
  };
}

export interface ListKubernetesSupportedVersionsResponse {
  listkubernetessupportedversionsresponse: {
    count?: number;
    kubernetessupportedversion?: KubernetesVersion[];
  };
}
