import { LongtermMemory } from '../../memory/longterm.js';
import { AddLongtermParams } from '../../memory/types.js';

export function createLongtermTools(longterm: LongtermMemory) {
  return {
    memory_longterm_add: {
      description: 'Store timeless knowledge, concepts, or methods in long-term memory',
      inputSchema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Title of the concept',
          },
          content: {
            type: 'string',
            description: 'Detailed explanation of the concept',
          },
          category: {
            type: 'string',
            enum: ['concept', 'method', 'person', 'other'],
            description: 'Category of long-term knowledge',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional tags for categorization',
          },
          related_concepts: {
            type: 'array',
            items: { type: 'string' },
            description: 'Related concept IDs or wiki-links',
          },
          sources: {
            type: 'array',
            items: { type: 'string' },
            description: 'Source URLs or references',
          },
        },
        required: ['title', 'content', 'category'],
      },
      handler: async (params: AddLongtermParams) => {
        const result = await longterm.add(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: result.success,
                id: result.id,
                file_path: result.file_path,
                message: 'Concept stored in long-term memory',
              }),
            },
          ],
        };
      },
    },

    memory_longterm_get_by_category: {
      description: 'Get all concepts in a specific category',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['concept', 'method', 'person', 'other'],
            description: 'Category to filter by',
          },
        },
        required: ['category'],
      },
      handler: async (params: { category: 'concept' | 'method' | 'person' | 'other' }) => {
        const concepts = await longterm.getByCategory(params.category);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                concepts: concepts.map((c) => ({
                  id: c.id,
                  title: c.title,
                  category: c.category,
                  tags: c.tags,
                  content: c.content.substring(0, 200) + '...',
                })),
                count: concepts.length,
              }),
            },
          ],
        };
      },
    },

    memory_longterm_get_by_id: {
      description: 'Get a specific concept by its ID',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Concept ID',
          },
        },
        required: ['id'],
      },
      handler: async (params: { id: string }) => {
        const concept = await longterm.getById(params.id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                concept: concept || null,
                found: !!concept,
              }),
            },
          ],
        };
      },
    },

    memory_longterm_get_related: {
      description: 'Get concepts related to a specific concept',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Concept ID',
          },
        },
        required: ['id'],
      },
      handler: async (params: { id: string }) => {
        const related = await longterm.getRelated(params.id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                related: related.map((c) => ({
                  id: c.id,
                  title: c.title,
                  category: c.category,
                })),
                count: related.length,
              }),
            },
          ],
        };
      },
    },
  };
}
