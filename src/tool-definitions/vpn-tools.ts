export const vpnTools = [
  {
    name: 'create_vpn_gateway',
    description: 'Create a site-to-site VPN gateway for a VPC',
    inputSchema: {
      type: 'object',
      properties: {
        vpcid: { type: 'string', description: 'VPC ID to create gateway for' },
        fordisplay: { type: 'boolean', description: 'Whether to display to end user' },
      },
      required: ['vpcid'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_vpn_gateway',
    description: 'Delete a site-to-site VPN gateway',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'VPN gateway ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_vpn_gateways',
    description: 'List site-to-site VPN gateways',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'VPN gateway ID' },
        vpcid: { type: 'string', description: 'VPC ID' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'create_vpn_connection',
    description: 'Create a site-to-site VPN connection',
    inputSchema: {
      type: 'object',
      properties: {
        s2scustomergatewayid: { type: 'string', description: 'Customer gateway ID' },
        s2svpngatewayid: { type: 'string', description: 'VPN gateway ID' },
        fordisplay: { type: 'boolean', description: 'Whether to display to end user' },
      },
      required: ['s2scustomergatewayid', 's2svpngatewayid'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_vpn_connection',
    description: 'Delete a site-to-site VPN connection',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'VPN connection ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_vpn_connections',
    description: 'List site-to-site VPN connections',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'VPN connection ID' },
        vpcid: { type: 'string', description: 'VPC ID' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'reset_vpn_connection',
    description: 'Reset a site-to-site VPN connection',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'VPN connection ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'create_vpn_customer_gateway',
    description: 'Create a VPN customer gateway for site-to-site VPN',
    inputSchema: {
      type: 'object',
      properties: {
        cidrlist: { type: 'string', description: 'Guest CIDR list (comma separated)' },
        gateway: { type: 'string', description: 'Public IP of the customer gateway' },
        ipsecpsk: { type: 'string', description: 'IPsec pre-shared key' },
        name: { type: 'string', description: 'Customer gateway name' },
        esppolicy: { type: 'string', description: 'ESP policy (e.g., aes128-sha1)' },
        ikepolicy: { type: 'string', description: 'IKE policy (e.g., aes128-sha1;modp1536)' },
        ikelifetime: { type: 'number', description: 'IKE lifetime in seconds' },
        esplifetime: { type: 'number', description: 'ESP lifetime in seconds' },
        dpd: { type: 'boolean', description: 'Enable Dead Peer Detection' },
        forceencap: { type: 'boolean', description: 'Force UDP encapsulation' },
      },
      required: ['cidrlist', 'gateway', 'ipsecpsk', 'name'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_vpn_customer_gateway',
    description: 'Update a VPN customer gateway',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Customer gateway ID' },
        cidrlist: { type: 'string', description: 'Guest CIDR list' },
        gateway: { type: 'string', description: 'Public IP of the customer gateway' },
        ipsecpsk: { type: 'string', description: 'IPsec pre-shared key' },
        name: { type: 'string', description: 'Customer gateway name' },
        esppolicy: { type: 'string', description: 'ESP policy' },
        ikepolicy: { type: 'string', description: 'IKE policy' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_vpn_customer_gateway',
    description: 'Delete a VPN customer gateway',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Customer gateway ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_vpn_customer_gateways',
    description: 'List VPN customer gateways',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Customer gateway ID' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'create_remote_access_vpn',
    description: 'Create a remote access VPN for a public IP',
    inputSchema: {
      type: 'object',
      properties: {
        ipaddressid: { type: 'string', description: 'Public IP address ID' },
        account: { type: 'string', description: 'Account name' },
        domainid: { type: 'string', description: 'Domain ID' },
        fordisplay: { type: 'boolean', description: 'Whether to display to end user' },
        openfirewall: { type: 'boolean', description: 'Open firewall for VPN port' },
        iprange: { type: 'string', description: 'IP range for VPN clients' },
      },
      required: ['ipaddressid'],
      additionalProperties: false,
    },
  },
  {
    name: 'delete_remote_access_vpn',
    description: 'Delete a remote access VPN',
    inputSchema: {
      type: 'object',
      properties: {
        publicipid: { type: 'string', description: 'Public IP address ID' },
      },
      required: ['publicipid'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_remote_access_vpns',
    description: 'List remote access VPNs',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Remote access VPN ID' },
        publicipid: { type: 'string', description: 'Public IP address ID' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'add_vpn_user',
    description: 'Add a VPN user for remote access VPN',
    inputSchema: {
      type: 'object',
      properties: {
        username: { type: 'string', description: 'VPN username' },
        password: { type: 'string', description: 'VPN password' },
        account: { type: 'string', description: 'Account name' },
        domainid: { type: 'string', description: 'Domain ID' },
      },
      required: ['username', 'password'],
      additionalProperties: false,
    },
  },
  {
    name: 'remove_vpn_user',
    description: 'Remove a VPN user',
    inputSchema: {
      type: 'object',
      properties: {
        username: { type: 'string', description: 'VPN username' },
        account: { type: 'string', description: 'Account name' },
        domainid: { type: 'string', description: 'Domain ID' },
      },
      required: ['username'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_vpn_users',
    description: 'List VPN users for remote access VPN',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'VPN user ID' },
        username: { type: 'string', description: 'VPN username' },
        keyword: { type: 'string', description: 'Search keyword' },
      },
      additionalProperties: false,
    },
  },
] as const;
