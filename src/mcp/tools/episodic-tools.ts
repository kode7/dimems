import { EpisodicMemory } from '../../memory/episodic.js';
import { AddEpisodicParams } from '../../memory/types.js';

export function createEpisodicTools(episodic: EpisodicMemory) {
  return {
    memory_episodic_add: {
      description: 'Store a time-bound event or experience in episodic memory',
      inputSchema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Title of the episode',
          },
          content: {
            type: 'string',
            description: 'Detailed description of the event',
          },
          date: {
            type: 'string',
            description: 'ISO 8601 date/time (defaults to current time if not provided)',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional tags for categorization',
          },
          location: {
            type: 'string',
            description: 'Location where the event occurred',
          },
          participants: {
            type: 'array',
            items: { type: 'string' },
            description: 'People involved in the event',
          },
          related_episodes: {
            type: 'array',
            items: { type: 'string' },
            description: 'IDs of related episodes',
          },
        },
        required: ['title', 'content'],
      },
      handler: async (params: AddEpisodicParams) => {
        const result = await episodic.add(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: result.success,
                id: result.id,
                file_path: result.file_path,
                message: 'Episode stored in episodic memory',
              }),
            },
          ],
        };
      },
    },

    memory_episodic_get_by_date: {
      description: 'Get episodes within a date range',
      inputSchema: {
        type: 'object',
        properties: {
          start: {
            type: 'string',
            description: 'Start date (ISO 8601)',
          },
          end: {
            type: 'string',
            description: 'End date (ISO 8601)',
          },
        },
      },
      handler: async (params: { start?: string; end?: string }) => {
        const episodes = await episodic.getByDateRange(params.start, params.end);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                episodes: episodes.map((ep) => ({
                  id: ep.id,
                  title: ep.title,
                  date: ep.date,
                  location: ep.location,
                  participants: ep.participants,
                  tags: ep.tags,
                  content: ep.content.substring(0, 200) + '...',
                })),
                count: episodes.length,
              }),
            },
          ],
        };
      },
    },

    memory_episodic_get_by_id: {
      description: 'Get a specific episode by its ID',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Episode ID',
          },
        },
        required: ['id'],
      },
      handler: async (params: { id: string }) => {
        const episode = await episodic.getById(params.id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                episode: episode || null,
                found: !!episode,
              }),
            },
          ],
        };
      },
    },
  };
}
