/**
 * Template and ISO Type Definitions
 */

import type { CloudStackTag } from './common.js';

export interface ISO {
  id: string;
  name: string;
  displaytext?: string;
  ispublic?: boolean;
  created?: string;
  isready: boolean;
  bootable?: boolean;
  ostypeid?: string;
  ostypename?: string;
  account?: string;
  domainid?: string;
  domain?: string;
  zoneid?: string;
  zonename?: string;
  size?: number;
  tags?: CloudStackTag[];
}

export interface Template {
  id: string;
  name: string;
  displaytext?: string;
  ispublic?: boolean;
  created?: string;
  isready: boolean;
  passwordenabled?: boolean;
  format?: string;
  isfeatured?: boolean;
  ostypeid?: string;
  ostypename?: string;
  account?: string;
  domainid?: string;
  domain?: string;
  zoneid?: string;
  zonename?: string;
  size?: number;
  templatetype?: string;
  hypervisor?: string;
  tags?: CloudStackTag[];
}

export interface TemplatePermission {
  id: string;
  account?: string;
  domainid?: string;
  [key: string]: unknown;
}

export interface ListISOsResponse {
  listisosresponse: {
    count?: number;
    iso?: ISO[];
  };
}

export interface ListTemplatesResponse {
  listtemplatesresponse: {
    count?: number;
    template?: Template[];
  };
}

export interface RegisterTemplateResponse {
  registertemplateresponse: {
    template?: Template[];
  };
}

export interface DeleteTemplateResponse {
  deletetemplateresponse: {
    success?: boolean;
    jobid?: string;
  };
}

export interface UpdateTemplateResponse {
  updatetemplateresponse: {
    template?: Template;
  };
}

export interface CopyTemplateResponse {
  copytemplateresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface RegisterISOResponse {
  registerisoresponse: {
    iso?: ISO[];
  };
}

export interface DeleteISOResponse {
  deleteisoresponse: {
    success?: boolean;
    jobid?: string;
  };
}

export interface AttachISOResponse {
  attachisoresponse: {
    id?: string;
    jobid?: string;
  };
}

export interface DetachISOResponse {
  detachisoresponse: {
    id?: string;
    jobid?: string;
  };
}
