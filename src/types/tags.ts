/**
 * Tag Type Definitions
 */

import type { CloudStackTag } from './common.js';

export interface CreateTagsResponse {
  createtagsresponse: {
    success?: boolean;
    jobid?: string;
  };
}

export interface DeleteTagsResponse {
  deletetagsresponse: {
    success?: boolean;
    jobid?: string;
  };
}

export interface ListTagsResponse {
  listtagsresponse: {
    count?: number;
    tag?: CloudStackTag[];
  };
}
