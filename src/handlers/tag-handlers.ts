import type { CloudStackClient } from '../cloudstack-client.js';
import type {
  CreateTagsArgs,
  DeleteTagsArgs,
  ListTagsArgs,
} from '../handler-types.js';
import type {
  CreateTagsResponse,
  DeleteTagsResponse,
  ListTagsResponse,
  CloudStackTag,
} from '../types/index.js';
import { validateArraySize, getDefaultMaxArraySize } from '../utils/validation.js';

export class TagHandlers {
  constructor(private readonly cloudStackClient: CloudStackClient) {}

  async handleCreateTags(args: CreateTagsArgs) {
    // Validate array sizes to prevent abuse
    validateArraySize(args.resourceids, getDefaultMaxArraySize(), 'resourceids');
    validateArraySize(args.tags, getDefaultMaxArraySize(), 'tags');

    const result = await this.cloudStackClient.createTags<CreateTagsResponse>(args);
    return {
      content: [{
        type: 'text' as const,
        text: `Creating tags for ${args.resourceids.length} ${args.resourcetype} resource(s):\n\n${args.tags.map((tag) => `  ${tag.key}: ${tag.value}`).join('\n')}\n\nJob ID: ${result.createtagsresponse?.jobid}`
      }]
    };
  }

  async handleDeleteTags(args: DeleteTagsArgs) {
    // Validate array sizes to prevent abuse
    validateArraySize(args.resourceids, getDefaultMaxArraySize(), 'resourceids');
    if (args.tags) {
      validateArraySize(args.tags, getDefaultMaxArraySize(), 'tags');
    }

    const result = await this.cloudStackClient.deleteTags<DeleteTagsResponse>(args);
    return {
      content: [{
        type: 'text' as const,
        text: `Deleting tags from ${args.resourceids.length} ${args.resourcetype} resource(s)${args.tags ? `:\n\n${args.tags.map((tag) => `  ${tag.key}: ${tag.value}`).join('\n')}` : ''}\n\nJob ID: ${result.deletetagsresponse?.jobid}`
      }]
    };
  }

  async handleListTags(args: ListTagsArgs) {
    const result = await this.cloudStackClient.listTags<ListTagsResponse>(args);
    const tags = result.listtagsresponse?.tag || [];

    return {
      content: [{
        type: 'text' as const,
        text: `Found ${tags.length} tags:\n\n${tags.map((tag: CloudStackTag) =>
          `• ${tag.key}: ${tag.value}\n  Resource Type: ${tag.resourcetype}\n  Resource ID: ${tag.resourceid}\n  Domain: ${tag.domain || 'N/A'}\n  Account: ${tag.account || 'N/A'}\n`
        ).join('\n')}`
      }]
    };
  }
}
