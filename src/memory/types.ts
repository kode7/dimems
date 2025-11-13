// Memory type classification
export type MemoryType = 'short_term' | 'episodic' | 'longterm';

// Memory categories for long-term memory
export type LongtermCategory = 'concept' | 'method' | 'person' | 'other';

// Short-term memory item
export interface ShortTermItem {
  timestamp: string; // ISO 8601
  content: string;
  category?: 'task' | 'thought' | 'reference';
  priority?: 'low' | 'medium' | 'high';
  status: 'active' | 'archived' | 'deleted';
}

// Episodic memory (event/experience)
export interface Episode {
  id: string; // UUID
  title: string;
  date: string; // ISO 8601
  content: string;
  tags?: string[];
  location?: string;
  participants?: string[];
  related_episodes?: string[]; // Episode IDs
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  file_path?: string;
}

// Long-term memory (concept/knowledge)
export interface Concept {
  id: string; // UUID
  title: string;
  content: string;
  category: LongtermCategory;
  tags?: string[];
  related_concepts?: string[]; // Concept IDs or wiki-links
  sources?: string[];
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  version: number;
  file_path?: string;
}

// Frontmatter metadata
export interface Frontmatter {
  [key: string]: any;
}

// Document structure (parsed markdown file)
export interface Document {
  frontmatter: Frontmatter;
  content: string;
  raw: string;
  file_path: string;
}

// Classification result
export interface ClassificationResult {
  type: MemoryType;
  confidence: number; // 0-1
  category?: LongtermCategory;
  metadata: {
    date?: string;
    title?: string;
    tags?: string[];
    location?: string;
    participants?: string[];
  };
}

// Search result
export interface SearchResult {
  id: string;
  title: string;
  type: MemoryType;
  file_path: string;
  snippet: string;
  similarity_score?: number;
  metadata: Record<string, any>;
}

// Vector embedding metadata
export interface EmbeddingMetadata {
  id: string;
  file_path: string;
  title: string;
  type: MemoryType;
  date?: string;
  tags?: string[];
  chunk_index?: number;
  created_at: string;
  updated_at?: string;
}

// MCP Tool parameters
export interface AddShortTermParams {
  content: string;
  category?: 'task' | 'thought' | 'reference';
  priority?: 'low' | 'medium' | 'high';
}

export interface AddEpisodicParams {
  title: string;
  content: string;
  date?: string; // ISO 8601, defaults to now
  tags?: string[];
  location?: string;
  participants?: string[];
  related_episodes?: string[];
}

export interface AddLongtermParams {
  title: string;
  content: string;
  category: LongtermCategory;
  tags?: string[];
  related_concepts?: string[];
  sources?: string[];
}

export interface SearchParams {
  query: string;
  scope?: MemoryType | 'all';
  limit?: number;
  similarity_threshold?: number;
  time_range?: {
    start?: string; // ISO 8601
    end?: string; // ISO 8601
  };
}

// Error types
export class MemoryError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'MemoryError';
  }
}

export class ConfigurationError extends MemoryError {
  constructor(message: string, details?: any) {
    super(message, 'CONFIGURATION_ERROR', details);
    this.name = 'ConfigurationError';
  }
}

export class FileSystemError extends MemoryError {
  constructor(message: string, details?: any) {
    super(message, 'FILESYSTEM_ERROR', details);
    this.name = 'FileSystemError';
  }
}

export class VectorDBError extends MemoryError {
  constructor(message: string, details?: any) {
    super(message, 'VECTORDB_ERROR', details);
    this.name = 'VectorDBError';
  }
}

export class ClassificationError extends MemoryError {
  constructor(message: string, details?: any) {
    super(message, 'CLASSIFICATION_ERROR', details);
    this.name = 'ClassificationError';
  }
}
