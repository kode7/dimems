import { z } from 'zod';

export const ConfigSchema = z.object({
  vault: z.object({
    path: z.string().default('./vault'),
    structure: z.object({
      short_term: z.string().default('short-term.md'),
      episodic_dir: z.string().default('episodes'),
      longterm_dirs: z.array(z.string()).default(['concepts', 'methods', 'people']),
    }),
  }),
  mcp: z.object({
    server: z.object({
      port: z.union([z.number(), z.literal('auto')]).default('auto'),
      timeout: z.number().default(30000),
    }),
    tools: z.object({
      enabled: z.union([z.array(z.string()), z.literal('all')]).default('all'),
    }),
  }),
  vector_db: z.object({
    type: z.enum(['chroma']).default('chroma'),
    path: z.string().default('.system/vectordb'),
    collections: z.object({
      episodic: z.object({
        distance: z.enum(['cosine', 'l2', 'ip']).default('cosine'),
      }),
      longterm: z.object({
        distance: z.enum(['cosine', 'l2', 'ip']).default('cosine'),
      }),
    }),
  }),
  embedding: z.object({
    model: z.string().default('sentence-transformers/all-MiniLM-L6-v2'),
    device: z.enum(['cpu', 'cuda']).default('cpu'),
    batch_size: z.number().default(32),
    dimensions: z.number().default(384),
  }),
  file_watcher: z.object({
    enabled: z.boolean().default(true),
    debounce_ms: z.number().default(5000),
    ignore_patterns: z.array(z.string()).default(['*.tmp', '.DS_Store', '*.log']),
  }),
  consolidation: z.object({
    auto_trigger: z.boolean().default(true),
    schedule: z.string().default('0 2 * * *'), // Daily at 2 AM
    short_term_max_age_days: z.number().default(7),
    relevance_threshold: z.number().min(0).max(1).default(0.3),
  }),
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug', 'trace']).default('info'),
    file: z.string().default('.system/logs/system.log'),
    max_size_mb: z.number().default(100),
    max_files: z.number().default(10),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

// Default configuration
export const defaultConfig: Config = ConfigSchema.parse({
  vault: {
    structure: {},
  },
  mcp: {
    server: {},
    tools: {},
  },
  vector_db: {
    collections: {
      episodic: {},
      longterm: {},
    },
  },
  embedding: {},
  file_watcher: {
    ignore_patterns: [],
  },
  consolidation: {},
  logging: {},
});
