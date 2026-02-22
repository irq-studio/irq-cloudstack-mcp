## Available Tools (96 Tools)

### Virtual Machine Management (12 Tools)

| Tool                                      | Description                                               | Parameters                                                                                             |
| ----------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `list_virtual_machines`                   | List VMs with optional filtering                          | `zoneid`, `state`, `keyword`                                                                           |
| `get_virtual_machine`                     | Get detailed VM information                               | `id` (required)                                                                                        |
| `start_virtual_machine`                   | Start a stopped virtual machine                           | `id` (required)                                                                                        |
| `stop_virtual_machine`                    | Stop a running virtual machine                            | `id` (required), `forced` (optional)                                                                   |
| `reboot_virtual_machine`                  | Reboot a virtual machine                                  | `id` (required)                                                                                        |
| `destroy_virtual_machine`                 | Destroy a VM with proper workflow (handles all states)    | `id` (required), `confirm` (required), `expunge` (optional)                                            |
| `deploy_virtual_machine`                  | Deploy a new VM (auto-selects network for Advanced zones) | `serviceofferingid`, `templateid`, `zoneid` (required), `name`, `displayname`, `networkids` (optional) |
| `scale_virtual_machine`                   | Scale (resize) a virtual machine                          | `id`, `serviceofferingid` (required)                                                                   |
| `migrate_virtual_machine`                 | Migrate VM to another host                                | `virtualmachineid` (required), `hostid` (optional)                                                     |
| `reset_password_virtual_machine`          | Reset password for a virtual machine                      | `id` (required)                                                                                        |
| `change_service_offering_virtual_machine` | Change service offering for a VM                          | `id`, `serviceofferingid` (required)                                                                   |
| `list_virtual_machine_metrics`            | Get virtual machine performance metrics                   | `ids`                                                                                                  |

### Storage Management (11 Tools)

| Tool                  | Description                            | Parameters                                            |
| --------------------- | -------------------------------------- | ----------------------------------------------------- |
| `list_volumes`        | List storage volumes                   | `virtualmachineid`, `type`, `zoneid`                  |
| `create_volume`       | Create a new storage volume            | `name`, `zoneid` (required), `diskofferingid`, `size` |
| `attach_volume`       | Attach a volume to a virtual machine   | `id`, `virtualmachineid` (required)                   |
| `detach_volume`       | Detach a volume from a virtual machine | `id`, `confirm` (required)                            |
| `resize_volume`       | Resize a storage volume                | `id`, `size`, `confirm` (required)                    |
| `delete_volume`       | Delete a storage volume                | `id` (required)                                       |
| `create_snapshot`     | Create a snapshot of a volume          | `volumeid` (required), `name`                         |
| `list_snapshots`      | List volume snapshots                  | `volumeid`, `snapshottype`                            |
| `delete_snapshot`     | Delete a volume snapshot               | `id` (required)                                       |
| `revert_snapshot`     | Revert a volume to a snapshot          | `id` (required)                                       |
| `list_disk_offerings` | List disk offerings                    | `domainid`, `name`                                    |

### Networking (28 Tools)

| Tool                             | Description                          | Parameters                                                                                                               |
| -------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `list_networks`                  | List networks                        | `zoneid`, `type`, `isdefault`                                                                                            |
| `create_network`                 | Create a new network                 | `name`, `displaytext`, `networkofferingid`, `zoneid` (required), `gateway`, `netmask`                                    |
| `list_public_ip_addresses`       | List public IP addresses             | `zoneid`, `allocatedonly`, `isstaticnat`                                                                                 |
| `associate_ip_address`           | Acquire a new public IP address      | `zoneid`, `networkid`, `vpcid`                                                                                           |
| `disassociate_ip_address`        | Release a public IP address          | `id` (required)                                                                                                          |
| `enable_static_nat`              | Enable static NAT for an IP to a VM  | `ipaddressid`, `virtualmachineid` (required), `vmguestip`                                                                |
| `disable_static_nat`             | Disable static NAT on a public IP    | `ipaddressid` (required)                                                                                                 |
| `create_firewall_rule`           | Create a firewall rule               | `ipaddressid`, `protocol` (required), `startport`, `endport`, `cidrlist`                                                 |
| `list_firewall_rules`            | List firewall rules                  | `id`, `ipaddressid`                                                                                                      |
| `delete_firewall_rule`           | Delete a firewall rule               | `id` (required)                                                                                                          |
| `list_load_balancer_rules`       | List load balancer rules             | `publicipid`, `zoneid`                                                                                                   |
| `create_load_balancer_rule`      | Create a load balancer rule          | `publicipid`, `algorithm`, `name`, `privateport`, `publicport` (required), `protocol`                                    |
| `delete_load_balancer_rule`      | Delete a load balancer rule          | `id` (required)                                                                                                          |
| `assign_to_load_balancer_rule`   | Assign VMs to a load balancer rule   | `id`, `virtualmachineids` (required)                                                                                     |
| `remove_from_load_balancer_rule` | Remove VMs from a load balancer rule | `id`, `virtualmachineids` (required)                                                                                     |
| `create_port_forwarding_rule`    | Create a port forwarding rule        | `ipaddressid`, `privateport`, `publicport`, `protocol`, `virtualmachineid` (required), `privateendport`, `publicendport` |
| `list_port_forwarding_rules`     | List port forwarding rules           | `ipaddressid`, `id`                                                                                                      |
| `delete_port_forwarding_rule`    | Delete a port forwarding rule        | `id` (required)                                                                                                          |
| `list_vpcs`                      | List Virtual Private Clouds (VPCs)   | `id`, `zoneid`, `name`                                                                                                   |
| `create_vpc`                     | Create a Virtual Private Cloud (VPC) | `name`, `displaytext`, `cidr`, `vpcofferingid`, `zoneid` (required)                                                      |
| `delete_vpc`                     | Delete a VPC                         | `id` (required)                                                                                                          |
| `restart_vpc`                    | Restart a VPC                        | `id` (required), `cleanup`                                                                                               |
| `list_routers`                   | List virtual routers                 | `id`, `zoneid`, `networkid`, `vpcid`, `state`                                                                            |
| `start_router`                   | Start a virtual router               | `id` (required)                                                                                                          |
| `stop_router`                    | Stop a virtual router                | `id` (required), `forced`                                                                                                |
| `reboot_router`                  | Reboot a virtual router              | `id` (required)                                                                                                          |
| `destroy_router`                 | Destroy a virtual router             | `id` (required)                                                                                                          |
| `list_network_offerings`         | List network offerings               | `id`, `zoneid`, `state`, `isdefault`                                                                                     |

### Monitoring & Analytics (5 Tools)

| Tool                           | Description                             | Parameters                               |
| ------------------------------ | --------------------------------------- | ---------------------------------------- |
| `list_virtual_machine_metrics` | Get virtual machine performance metrics | `ids`                                    |
| `list_events`                  | List CloudStack events                  | `type`, `level`, `startdate`, `pagesize` |
| `list_alerts`                  | List system alerts                      | `type`                                   |
| `list_capacity`                | List system capacity information        | `zoneid`, `type`                         |
| `list_async_jobs`              | List asynchronous jobs                  | `jobstatus`, `jobresulttype`             |

### Account & User Management (4 Tools)

| Tool                 | Description                 | Parameters                                |
| -------------------- | --------------------------- | ----------------------------------------- |
| `list_accounts`      | List CloudStack accounts    | `domainid`, `accounttype`                 |
| `list_users`         | List users                  | `accountid`, `username`                   |
| `list_domains`       | List CloudStack domains     | `name`                                    |
| `list_usage_records` | List resource usage records | `startdate`, `enddate` (required), `type` |

### Kubernetes Cluster Management (10 Tools)

| Tool                                 | Description                                     | Parameters                                                                                                                                            |
| ------------------------------------ | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create_kubernetes_cluster`          | Create a new Kubernetes cluster                 | `name`, `zoneid`, `kubernetesversionid`, `serviceofferingid` (required), `description`, `size`, `networkid`, `masternodes`, `controlnodes`, `keypair` |
| `list_kubernetes_clusters`           | List all Kubernetes clusters                    | `id`, `name`, `state`, `zoneid`, `account`, `domainid`                                                                                                |
| `get_kubernetes_cluster`             | Get details of a specific Kubernetes cluster    | `id` (required)                                                                                                                                       |
| `start_kubernetes_cluster`           | Start a stopped Kubernetes cluster              | `id` (required)                                                                                                                                       |
| `stop_kubernetes_cluster`            | Stop a running Kubernetes cluster               | `id` (required)                                                                                                                                       |
| `delete_kubernetes_cluster`          | Delete a Kubernetes cluster                     | `id` (required), `cleanup`                                                                                                                            |
| `scale_kubernetes_cluster`           | Scale a cluster by adding/removing worker nodes | `id` (required), `size`, `serviceofferingid`, `nodesids`                                                                                              |
| `upgrade_kubernetes_cluster`         | Upgrade a cluster to a new version              | `id`, `kubernetesversionid` (required)                                                                                                                |
| `get_kubernetes_cluster_config`      | Get kubeconfig for cluster access               | `id` (required)                                                                                                                                       |
| `list_kubernetes_supported_versions` | List all supported Kubernetes versions          | `id`, `zoneid`, `minimumkubernetesversionid`                                                                                                          |

### Template & ISO Management (9 Tools)

| Tool                | Description                          | Parameters                                                                                                                                          |
| ------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `register_template` | Register a new template from a URL   | `displaytext`, `name`, `ostypeid`, `url`, `zoneid`, `hypervisor`, `format` (required), `ispublic`, `isfeatured`, `isextractable`, `passwordenabled` |
| `delete_template`   | Delete a template                    | `id`, `zoneid` (required)                                                                                                                           |
| `update_template`   | Update template properties           | `id` (required), `name`, `displaytext`, `ostypeid`, `passwordenabled`, `bootable`, `sshkeyenabled`                                                  |
| `copy_template`     | Copy a template to another zone      | `id`, `destzoneid` (required), `sourcezoneid`                                                                                                       |
| `list_isos`         | List ISO images                      | `zoneid`, `bootable`, `ispublic`, `name`                                                                                                            |
| `register_iso`      | Register a new ISO from a URL        | `displaytext`, `name`, `url`, `zoneid` (required), `ostypeid`, `bootable`, `ispublic`, `isfeatured`                                                 |
| `delete_iso`        | Delete an ISO                        | `id`, `zoneid` (required)                                                                                                                           |
| `attach_iso`        | Attach an ISO to a virtual machine   | `id`, `virtualmachineid` (required)                                                                                                                 |
| `detach_iso`        | Detach an ISO from a virtual machine | `virtualmachineid` (required)                                                                                                                       |

### Async Job Management (1 Tool)

| Tool                     | Description                                        | Parameters         |
| ------------------------ | -------------------------------------------------- | ------------------ |
| `query_async_job_result` | Query the status and result of an asynchronous job | `jobid` (required) |

### Tags (3 Tools)

| Tool          | Description          | Parameters                                       |
| ------------- | -------------------- | ------------------------------------------------ |
| `create_tags` | Create resource tags | `resourceids`, `resourcetype`, `tags` (required) |
| `delete_tags` | Delete resource tags | `resourceids`, `resourcetype` (required), `tags` |
| `list_tags`   | List resource tags   | `resourcetype`, `key`, `value`                   |

### Affinity Groups (3 Tools)

| Tool                    | Description                                     | Parameters                                                      |
| ----------------------- | ----------------------------------------------- | --------------------------------------------------------------- |
| `create_affinity_group` | Create an affinity group for VM placement rules | `name`, `type` (required), `description`, `domainid`, `account` |
| `delete_affinity_group` | Delete an affinity group                        | `id` or `name` (required)                                       |
| `list_affinity_groups`  | List affinity groups                            | `id`, `name`, `virtualmachineid`                                |

### Infrastructure Discovery (2 Tools)

| Tool             | Description                 | Parameters                            |
| ---------------- | --------------------------- | ------------------------------------- |
| `list_zones`     | List all available zones    | `available` (optional)                |
| `list_templates` | List available VM templates | `templatefilter`, `zoneid` (optional) |

### System Administration (5 Tools)

| Tool                     | Description                  | Parameters                |
| ------------------------ | ---------------------------- | ------------------------- |
| `list_hosts`             | List physical hosts          | `zoneid`, `type`, `state` |
| `list_clusters`          | List host clusters           | `zoneid`                  |
| `list_storage_pools`     | List storage pools           | `zoneid`, `clusterid`     |
| `list_system_vms`        | List system virtual machines | `zoneid`, `systemvmtype`  |
| `list_service_offerings` | List service offerings       | `name`, `domainid`        |

### Security & Compliance (4 Tools)

| Tool                         | Description                          | Parameters                                                                   |
| ---------------------------- | ------------------------------------ | ---------------------------------------------------------------------------- |
| `list_ssh_key_pairs`         | List SSH key pairs                   | `name`                                                                       |
| `create_ssh_key_pair`        | Create a new SSH key pair            | `name` (required)                                                            |
| `list_security_groups`       | List security groups                 | `securitygroupname`                                                          |
| `create_security_group_rule` | Create a security group ingress rule | `securitygroupid`, `protocol` (required), `startport`, `endport`, `cidrlist` |
