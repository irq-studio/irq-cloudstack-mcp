/**
 * VPN Type Definitions
 */

export interface VpnGateway {
  id: string;
  vpcid: string;
  publicip: string;
  account?: string;
  domain?: string;
  domainid?: string;
  fordisplay?: boolean;
  removed?: string;
}

export interface VpnConnection {
  id: string;
  s2scustomergatewayid: string;
  s2svpngatewayid: string;
  publicip?: string;
  gateway?: string;
  state: string;
  ipsecpsk?: string;
  ikepolicy?: string;
  esppolicy?: string;
  account?: string;
  domain?: string;
  created?: string;
}

export interface VpnCustomerGateway {
  id: string;
  name: string;
  gateway: string;
  cidrlist: string;
  ipsecpsk: string;
  ikepolicy?: string;
  esppolicy?: string;
  ikelifetime?: number;
  esplifetime?: number;
  dpd?: boolean;
  forceencap?: boolean;
  account?: string;
  domain?: string;
}

export interface RemoteAccessVpn {
  id: string;
  publicipid: string;
  publicip: string;
  iprange: string;
  presharedkey: string;
  account?: string;
  domain?: string;
  state: string;
}

export interface VpnUser {
  id: string;
  username: string;
  account?: string;
  domain?: string;
  state: string;
}

export interface ListVpnGatewaysResponse {
  listvpngatewaysresponse: {
    count?: number;
    vpngateway?: VpnGateway[];
  };
}

export interface ListVpnConnectionsResponse {
  listvpnconnectionsresponse: {
    count?: number;
    vpnconnection?: VpnConnection[];
  };
}

export interface ListVpnCustomerGatewaysResponse {
  listvpncustomergatewaysresponse: {
    count?: number;
    vpncustomergateway?: VpnCustomerGateway[];
  };
}

export interface ListRemoteAccessVpnsResponse {
  listremoteaccessvpnsresponse: {
    count?: number;
    remoteaccessvpn?: RemoteAccessVpn[];
  };
}

export interface ListVpnUsersResponse {
  listvpnusersresponse: {
    count?: number;
    vpnuser?: VpnUser[];
  };
}
