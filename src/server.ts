// AbortController is available in Node.js 15+
// For older versions, the MCP SDK will handle polyfilling

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';
import { CloudStackClient, CloudStackError } from './cloudstack-client.js';
import { ValidationError } from './utils/validation.js';
import { allToolDefinitions } from './tool-definitions/index.js';
import {
  VirtualMachineHandlers,
  StorageHandlers,
  NetworkCoreHandlers,
  NetworkRulesHandlers,
  NetworkRouterHandlers,
  NetworkNicHandlers,
  AclHandlers,
  KubernetesHandlers,
  MonitoringHandlers,
  AdminHandlers,
  SecurityHandlers,
  TemplateHandlers,
  JobHandlers,
  TagHandlers,
  AffinityHandlers,
  VpnHandlers,
  ProjectHandlers,
  VmSnapshotHandlers,
  AutoScaleHandlers,
  BackupHandlers,
  RoleHandlers,
} from './handlers/index.js';
import { ToolRegistry } from './tool-registry.js';
import { Logger } from './utils/logger.js';
import { setupToolRegistry } from './tool-registry-setup.js';
import { VERSION } from './version.js';
import { safeParseInt } from './utils/index.js';
import type { ListCapabilitiesResponse } from './types/index.js';
import type { CloudStackConfig } from './types.js';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

export class CloudStackMcpServer {
  private server: Server;
  private cloudStackClient: CloudStackClient;
  private toolRegistry: ToolRegistry;
  private logger: Logger;
  private vmHandlers!: VirtualMachineHandlers;
  private storageHandlers!: StorageHandlers;
  private networkCoreHandlers!: NetworkCoreHandlers;
  private networkRulesHandlers!: NetworkRulesHandlers;
  private networkRouterHandlers!: NetworkRouterHandlers;
  private networkNicHandlers!: NetworkNicHandlers;
  private kubernetesHandlers!: KubernetesHandlers;
  private monitoringHandlers!: MonitoringHandlers;
  private adminHandlers!: AdminHandlers;
  private securityHandlers!: SecurityHandlers;
  private templateHandlers!: TemplateHandlers;
  private jobHandlers!: JobHandlers;
  private tagHandlers!: TagHandlers;
  private affinityHandlers!: AffinityHandlers;
  private vpnHandlers!: VpnHandlers;
  private projectHandlers!: ProjectHandlers;
  private networkACLHandlers!: AclHandlers;
  private vmSnapshotHandlers!: VmSnapshotHandlers;
  private autoScaleHandlers!: AutoScaleHandlers;
  private backupHandlers!: BackupHandlers;
  private roleHandlers!: RoleHandlers;

  constructor(cloudStackClient?: CloudStackClient) {
    this.server = new Server(
      {
        name: 'irq-cloudstack-mcp',
        version: VERSION,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.cloudStackClient = cloudStackClient || new CloudStackClient(this.getConfig());
    this.toolRegistry = new ToolRegistry();
    this.logger = new Logger({ service: 'mcp-server' });
    this.initializeHandlers();
    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  public getServer(): Server {
    return this.server;
  }

  private initializeHandlers(): void {
    this.vmHandlers = new VirtualMachineHandlers(this.cloudStackClient);
    this.storageHandlers = new StorageHandlers(this.cloudStackClient);
    this.networkCoreHandlers = new NetworkCoreHandlers(this.cloudStackClient);
    this.networkRulesHandlers = new NetworkRulesHandlers(this.cloudStackClient);
    this.networkRouterHandlers = new NetworkRouterHandlers(this.cloudStackClient);
    this.networkNicHandlers = new NetworkNicHandlers(this.cloudStackClient);
    this.kubernetesHandlers = new KubernetesHandlers(this.cloudStackClient);
    this.monitoringHandlers = new MonitoringHandlers(this.cloudStackClient);
    this.adminHandlers = new AdminHandlers(this.cloudStackClient);
    this.securityHandlers = new SecurityHandlers(this.cloudStackClient);
    this.templateHandlers = new TemplateHandlers(this.cloudStackClient);
    this.jobHandlers = new JobHandlers(this.cloudStackClient);
    this.tagHandlers = new TagHandlers(this.cloudStackClient);
    this.affinityHandlers = new AffinityHandlers(this.cloudStackClient);
    this.vpnHandlers = new VpnHandlers(this.cloudStackClient);
    this.projectHandlers = new ProjectHandlers(this.cloudStackClient);
    this.networkACLHandlers = new AclHandlers(this.cloudStackClient);
    this.vmSnapshotHandlers = new VmSnapshotHandlers(this.cloudStackClient);
    this.autoScaleHandlers = new AutoScaleHandlers(this.cloudStackClient);
    this.backupHandlers = new BackupHandlers(this.cloudStackClient);
    this.roleHandlers = new RoleHandlers(this.cloudStackClient);

    // Setup tool registry with all handlers
    setupToolRegistry(this.toolRegistry, {
      vm: this.vmHandlers,
      storage: this.storageHandlers,
      networkCore: this.networkCoreHandlers,
      networkRules: this.networkRulesHandlers,
      networkRouter: this.networkRouterHandlers,
      networkNic: this.networkNicHandlers,
      kubernetes: this.kubernetesHandlers,
      monitoring: this.monitoringHandlers,
      admin: this.adminHandlers,
      security: this.securityHandlers,
      template: this.templateHandlers,
      job: this.jobHandlers,
      tag: this.tagHandlers,
      affinity: this.affinityHandlers,
      vpn: this.vpnHandlers,
      project: this.projectHandlers,
      networkACL: this.networkACLHandlers,
      vmSnapshot: this.vmSnapshotHandlers,
      autoScale: this.autoScaleHandlers,
      backup: this.backupHandlers,
      role: this.roleHandlers,
    });
  }

  private getConfig(): CloudStackConfig {
    const config: CloudStackConfig = {
      apiUrl: process.env.CLOUDSTACK_API_URL || '',
      apiKey: process.env.CLOUDSTACK_API_KEY || '',
      secretKey: process.env.CLOUDSTACK_SECRET_KEY || '',
      timeout: safeParseInt(process.env.CLOUDSTACK_TIMEOUT, 30000),
      rejectUnauthorized: process.env.CLOUDSTACK_REJECT_UNAUTHORIZED !== 'false',
    };

    // Add connection pool configuration if provided
    if (process.env.CLOUDSTACK_POOL_KEEP_ALIVE ||
        process.env.CLOUDSTACK_POOL_KEEP_ALIVE_MS ||
        process.env.CLOUDSTACK_POOL_MAX_SOCKETS ||
        process.env.CLOUDSTACK_POOL_MAX_FREE_SOCKETS ||
        process.env.CLOUDSTACK_POOL_SOCKET_TIMEOUT) {
      config.connectionPoolConfig = {
        keepAlive: process.env.CLOUDSTACK_POOL_KEEP_ALIVE !== 'false',
        keepAliveMsecs: process.env.CLOUDSTACK_POOL_KEEP_ALIVE_MS ? safeParseInt(process.env.CLOUDSTACK_POOL_KEEP_ALIVE_MS, 30000) : undefined,
        maxSockets: process.env.CLOUDSTACK_POOL_MAX_SOCKETS ? safeParseInt(process.env.CLOUDSTACK_POOL_MAX_SOCKETS, 50) : undefined,
        maxFreeSockets: process.env.CLOUDSTACK_POOL_MAX_FREE_SOCKETS ? safeParseInt(process.env.CLOUDSTACK_POOL_MAX_FREE_SOCKETS, 10) : undefined,
        socketTimeout: process.env.CLOUDSTACK_POOL_SOCKET_TIMEOUT ? safeParseInt(process.env.CLOUDSTACK_POOL_SOCKET_TIMEOUT, 60000) : undefined,
      };
    }

    if (!config.apiUrl || !config.apiKey || !config.secretKey) {
      throw new Error('Missing required CloudStack configuration. Please set CLOUDSTACK_API_URL, CLOUDSTACK_API_KEY, and CLOUDSTACK_SECRET_KEY environment variables.');
    }

    return config;
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: allToolDefinitions,
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args = {} } = request.params;

      try {
        // Use tool registry to execute the requested tool
        return await this.toolRegistry.execute(name, args);
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        if (error instanceof ValidationError) {
          throw new McpError(ErrorCode.InvalidParams, error.message);
        }
        if (error instanceof CloudStackError) {
          throw new McpError(
            ErrorCode.InternalError,
            `CloudStack API error for ${error.command}: ${error.message}`
          );
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${request.params.name}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      this.logger.error('MCP protocol error', error instanceof Error ? error : new Error(String(error)));
    };

    // Handle graceful shutdown on SIGINT (Ctrl+C)
    process.once('SIGINT', async () => {
      this.logger.info('Received SIGINT signal');
      await this.close();
      process.exitCode = 0;
    });

    // Handle graceful shutdown on SIGTERM (container/orchestrator termination)
    process.once('SIGTERM', async () => {
      this.logger.info('Received SIGTERM signal');
      await this.close();
      process.exitCode = 0;
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // Detect CloudStack version at startup (non-blocking)
    this.detectCloudStackVersion().catch((error) => {
      this.logger.warn('Failed to detect CloudStack version', {
        error: error instanceof Error ? error.message : String(error),
      });
    });

    this.logger.info('CloudStack MCP server running on stdio', {
      toolCount: allToolDefinitions.length,
    });
  }

  /**
   * Detect and log the CloudStack version at startup
   * This is non-blocking and will not prevent the server from starting
   */
  private async detectCloudStackVersion(): Promise<void> {
    const result = await this.cloudStackClient.listCapabilities<ListCapabilitiesResponse>();
    const capability = result.listcapabilitiesresponse?.capability;

    if (capability?.cloudstackversion) {
      const apiUrl = new URL(process.env.CLOUDSTACK_API_URL || '');
      this.logger.info('Connected to CloudStack', {
        version: capability.cloudstackversion,
        host: apiUrl.hostname,
        kubernetes_enabled: capability.kubernetesserviceenabled ?? false,
        security_groups_enabled: capability.securitygroupsenabled ?? false,
      });
    } else {
      this.logger.debug('CloudStack version not available in capabilities response');
    }
  }

  /**
   * Gracefully close the server and cleanup resources
   * @param timeout - Maximum time to wait for cleanup in milliseconds (default: 5000ms)
   */
  async close(timeout = 5000): Promise<void> {
    this.logger.info('Shutting down CloudStack MCP server...');

    // Create a timeout promise
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        this.logger.warn('Shutdown timeout reached, forcing exit');
        resolve();
      }, timeout);
    });

    // Create cleanup promise
    const cleanupPromise = (async () => {
      try {
        // Close the MCP server
        await this.server.close();
        this.logger.debug('MCP server closed');

        // Close the CloudStack client to cleanup HTTP connections
        this.cloudStackClient.close();
        this.logger.debug('CloudStack client closed');

        this.logger.info('CloudStack MCP server shutdown complete');
      } catch (error) {
        this.logger.error('Error during shutdown', error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    })();

    // Race between cleanup and timeout
    await Promise.race([cleanupPromise, timeoutPromise]);
  }
}

const server = new CloudStackMcpServer();
server.run().catch(console.error);