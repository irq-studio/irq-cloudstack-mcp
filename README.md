# irq-cloudstack-mcp

[![CI/CD Pipeline](https://github.com/irq-studio/irq-cloudstack-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/irq-studio/irq-cloudstack-mcp/actions/workflows/ci.yml)
[![CodeQL](https://github.com/irq-studio/irq-cloudstack-mcp/actions/workflows/codeql.yml/badge.svg)](https://github.com/irq-studio/irq-cloudstack-mcp/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)

A high-performance MCP (Model Context Protocol) server for Apache CloudStack API integration. This server provides comprehensive tools for managing CloudStack infrastructure through the MCP protocol, enabling seamless integration with AI assistants and automation tools.

## Features

- **Complete VM Lifecycle Management**: Deploy, start, stop, reboot, destroy, scale, and migrate virtual machines
- **Storage Management**: Volumes, snapshots, disk offerings with full CRUD operations
- **Advanced Networking**: VPCs, routers, load balancers, firewalls, NAT, and port forwarding
- **Kubernetes Orchestration**: Create, manage, scale, and upgrade Kubernetes clusters
- **Template & ISO Management**: Register, copy, update, attach/detach VM templates and ISOs
- **Resource Organization**: Tags and affinity groups for resource metadata and placement rules
- **Infrastructure Discovery**: Zones, templates, service offerings, hosts, and clusters
- **Monitoring & Analytics**: Events, alerts, capacity, metrics, and async job tracking
- **Instance Status**: CloudStack instance and server version information
- **Secure Authentication**: HMAC-SHA1 signed requests with CloudStack API credentials
- **High Performance**: Efficient TypeScript implementation with proper error handling
- **Type Safety**: Full TypeScript support with comprehensive interfaces
- **Command Line Interface**: Direct CLI access for interactive CloudStack management
- **MCP Integration**: Seamless integration with AI assistants via MCP protocol

## Quick Start

### For Claude Code (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/irq-studio/irq-cloudstack-mcp.git
cd irq-cloudstack-mcp

# 2. Install dependencies
npm install

# 3. Configure your CloudStack credentials
cp .env.example .env
nano .env  # Edit with your API credentials

# 4. Build the project
npm run build

# 5. Start Claude Code in this directory
claude
```

That's it! The CloudStack MCP server will automatically load with all 271 tools available.

### For Standalone CLI

Run the CloudStack CLI directly:

```bash
# Development mode
npm run dev:cli -- list-vms --help

# Production mode
npm run build
npm run cli -- list-vms --help
```

### MCP Client Integration

#### Claude Code (CLI)

Copy `.mcp.json.example` to `.mcp.json` and update with your credentials:

```json
{
  "mcpServers": {
    "irq-cloudstack": {
      "command": "node",
      "args": ["build/index.js"],
      "env": {
        "CLOUDSTACK_API_URL": "https://your-cloudstack-server/client/api",
        "CLOUDSTACK_API_KEY": "your-api-key",
        "CLOUDSTACK_SECRET_KEY": "your-secret-key"
      }
    }
  }
}
```

The server will automatically load when you run Claude Code in this directory.

### Command Line Interface

For direct command-line access, use the built-in CLI:

```bash
# Install globally (optional)
npm link

# Use the CLI
cloudstack-cli list-vms --state Running
cloudstack-cli deploy-vm --service-offering-id 1 --template-id 2 --zone-id 3
cloudstack-cli get-vm --id 12345-67890-abcdef

# See all available commands
cloudstack-cli --help
```

## Example Usage

### List Virtual Machines
```json
{
  "tool": "list_virtual_machines",
  "arguments": {
    "state": "Running",
    "zoneid": "1746ef10-8fa6-40c1-9c82-c3956bf75db8"
  }
}
```

### Deploy New Virtual Machine
```json
{
  "tool": "deploy_virtual_machine",
  "arguments": {
    "serviceofferingid": "c6f99499-7f59-4138-9427-a09db13af2bc",
    "templateid": "7d4a7bb5-2409-4c8f-8537-6bbdc8a4e5c1",
    "zoneid": "1746ef10-8fa6-40c1-9c82-c3956bf75db8",
    "name": "my-new-vm",
    "displayname": "My New VM"
  }
}
```

## Project Structure

```
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── server.ts             # Main MCP server implementation
│   ├── cli.ts                # Command-line interface
│   └── cloudstack-client.ts  # CloudStack API client
├── build/                    # Compiled JavaScript output
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── .env                     # Environment variables (not in repo)
```

### Architecture Overview

- **`src/index.ts`**: MCP server entry point that loads environment variables and starts the server
- **`src/server.ts`**: Comprehensive MCP server implementation with 96 tool handlers across 11 categories, error management, and CloudStack integration
- **`src/cli.ts`**: Command-line interface for direct CloudStack management via JSON-RPC communication with the MCP server
- **`src/cloudstack-client.ts`**: Robust CloudStack API client with HMAC-SHA1 authentication, type-safe interfaces, and comprehensive error handling
- **`src/tool-definitions/`**: Modular tool definitions organized by category (VM, storage, network, Kubernetes, templates, monitoring, etc.)
- **`src/handlers/`**: Request handlers organized by functionality for clean separation of concerns

## Configuration

### Required Environment Variables

| Variable                | Description             | Example                                         |
| ----------------------- | ----------------------- | ----------------------------------------------- |
| `CLOUDSTACK_API_URL`    | CloudStack API endpoint | `http://cloudstack.example.com:8080/client/api` |
| `CLOUDSTACK_API_KEY`    | CloudStack API key      | `your-32-character-api-key`                     |
| `CLOUDSTACK_SECRET_KEY` | CloudStack secret key   | `your-secret-key`                               |

### Optional Environment Variables

| Variable                         | Description                         | Default |
| -------------------------------- | ----------------------------------- | ------- |
| `CLOUDSTACK_TIMEOUT`             | Request timeout (milliseconds)      | `30000` |
| `CLOUDSTACK_REJECT_UNAUTHORIZED` | Reject self-signed SSL certificates | `false` |

## Development

### Build Commands
```bash
# Build TypeScript to JavaScript
npm run build

# Run MCP server in development mode with hot reload
npm run dev

# Run CLI in development mode
npm run dev:cli -- list-vms --help

# Run compiled MCP server
npm start

# Run compiled CLI
npm run cli -- list-vms --help

# Type checking only
npx tsc --noEmit
```

## Security

- **HMAC-SHA1 Signing**: All API requests are cryptographically signed
- **No Credential Storage**: Credentials read from environment variables only
- **Request Validation**: Input validation on all tool parameters
- **Error Sanitization**: Sensitive information filtered from error messages
- **SSL Certificate Handling**: Built-in support for self-signed certificates (configurable via `CLOUDSTACK_REJECT_UNAUTHORIZED`)

## Compatibility

### Platform Support

| Platform         | Status      | Notes             |
| ---------------- | ----------- | ----------------- |
| **CloudStack**   | Supported   | 4.11+ recommended |
| **Node.js**      | Required    | 18+ required      |
| **MCP Protocol** | Implemented | SDK 0.5.0+        |
| **TypeScript**   | Built with  | 5.0+              |

## License

MIT - See LICENSE file for details
