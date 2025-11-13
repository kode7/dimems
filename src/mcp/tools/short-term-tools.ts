import { ShortTermMemory } from '../../memory/short-term.js';
import { AddShortTermParams } from '../../memory/types.js';

export function createShortTermTools(shortTerm: ShortTermMemory) {
  return {
    memory_short_term_add: {
      description: 'Add information to short-term memory for temporary storage',
      inputSchema: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: 'The content to store in short-term memory',
          },
          category: {
            type: 'string',
            enum: ['task', 'thought', 'reference'],
            description: 'Optional category for the item',
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Optional priority level',
          },
        },
        required: ['content'],
      },
      handler: async (params: AddShortTermParams) => {
        const result = await shortTerm.add(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: result.success,
                timestamp: result.timestamp,
                message: 'Item added to short-term memory',
              }),
            },
          ],
        };
      },
    },

    memory_short_term_read: {
      description: 'Read all items from short-term memory',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        const result = await shortTerm.read();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                items: result.items,
                count: result.items.length,
                content: result.content,
              }),
            },
          ],
        };
      },
    },

    memory_short_term_clear: {
      description: 'Clear all items from short-term memory',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        const result = await shortTerm.clear();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: result.success,
                message: 'Short-term memory cleared',
              }),
            },
          ],
        };
      },
    },
  };
}
