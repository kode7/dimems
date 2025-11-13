import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { FileSystemHandler } from '../storage/filesystem.js';
import { Concept, AddLongtermParams, LongtermCategory } from './types.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('LongtermMemory');

export class LongtermMemory {
  private fs: FileSystemHandler;

  constructor(fs: FileSystemHandler) {
    this.fs = fs;
  }

  /**
   * Add a concept to long-term memory
   */
  public async add(params: AddLongtermParams): Promise<{
    success: boolean;
    id: string;
    file_path: string;
  }> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();

      // Create concept
      const concept: Concept = {
        id,
        title: params.title,
        content: params.content,
        category: params.category,
        tags: params.tags,
        related_concepts: params.related_concepts,
        sources: params.sources,
        created_at: now,
        updated_at: now,
        version: 1,
      };

      // Generate file path based on category
      const fileName = this.generateFileName(params.title);
      const categoryDir = this.getCategoryDirectory(params.category);
      const filePath = join(categoryDir, fileName);

      // Create frontmatter (filter out undefined values for YAML serialization)
      const frontmatter: Record<string, any> = {
        id: concept.id,
        title: concept.title,
        category: concept.category,
        created_at: concept.created_at,
        updated_at: concept.updated_at,
        version: concept.version,
      };

      // Only add optional fields if they have values
      if (concept.tags && concept.tags.length > 0) frontmatter.tags = concept.tags;
      if (concept.related_concepts && concept.related_concepts.length > 0) {
        frontmatter.related_concepts = concept.related_concepts;
      }
      if (concept.sources && concept.sources.length > 0) {
        frontmatter.sources = concept.sources;
      }

      // Write document
      this.fs.writeDocument(filePath, params.content, frontmatter);

      logger.info('Created long-term memory', {
        id,
        title: params.title,
        category: params.category,
      });

      return {
        success: true,
        id,
        file_path: filePath,
      };
    } catch (error) {
      logger.error('Failed to add long-term memory', { error, title: params.title });
      throw error;
    }
  }

  /**
   * Get a concept by ID
   */
  public async getById(id: string): Promise<Concept | null> {
    try {
      // Search all long-term directories for the ID
      const longtermDirs = this.fs.getLongtermDirs();

      for (const dir of Object.values(longtermDirs)) {
        const files = this.fs.listFiles(dir, true);

        for (const file of files) {
          const doc = this.fs.readDocument(file);

          if (doc.frontmatter.id === id) {
            return this.documentToConcept(doc, file);
          }
        }
      }

      return null;
    } catch (error) {
      logger.error('Failed to get concept by ID', { error, id });
      throw error;
    }
  }

  /**
   * Get concepts by category
   */
  public async getByCategory(category: LongtermCategory): Promise<Concept[]> {
    try {
      const categoryDir = this.getCategoryDirectory(category);
      const files = this.fs.listFiles(categoryDir, true);
      const concepts: Concept[] = [];

      for (const file of files) {
        const doc = this.fs.readDocument(file);
        concepts.push(this.documentToConcept(doc, file));
      }

      // Sort by title
      concepts.sort((a, b) => a.title.localeCompare(b.title));

      return concepts;
    } catch (error) {
      logger.error('Failed to get concepts by category', { error, category });
      throw error;
    }
  }

  /**
   * Get all concepts
   */
  public async getAll(): Promise<Concept[]> {
    try {
      const longtermDirs = this.fs.getLongtermDirs();
      const concepts: Concept[] = [];

      for (const dir of Object.values(longtermDirs)) {
        const files = this.fs.listFiles(dir, true);

        for (const file of files) {
          const doc = this.fs.readDocument(file);
          concepts.push(this.documentToConcept(doc, file));
        }
      }

      // Sort by title
      concepts.sort((a, b) => a.title.localeCompare(b.title));

      return concepts;
    } catch (error) {
      logger.error('Failed to get all concepts', { error });
      throw error;
    }
  }

  /**
   * Update a concept
   */
  public async update(
    id: string,
    updates: Partial<Omit<Concept, 'id' | 'created_at' | 'version'>>
  ): Promise<{ success: boolean }> {
    try {
      // Find the concept file
      const longtermDirs = this.fs.getLongtermDirs();

      for (const dir of Object.values(longtermDirs)) {
        const files = this.fs.listFiles(dir, true);

        for (const file of files) {
          const doc = this.fs.readDocument(file);

          if (doc.frontmatter.id === id) {
            const currentVersion = doc.frontmatter.version || 1;

            const updatedFrontmatter = {
              ...doc.frontmatter,
              ...updates,
              updated_at: new Date().toISOString(),
              version: currentVersion + 1,
            };

            const updatedContent = updates.content || doc.content;

            this.fs.updateDocument(file, {
              content: updatedContent,
              frontmatter: updatedFrontmatter,
            });

            logger.info('Updated long-term memory', { id });

            return { success: true };
          }
        }
      }

      throw new Error(`Concept not found: ${id}`);
    } catch (error) {
      logger.error('Failed to update concept', { error, id });
      throw error;
    }
  }

  /**
   * Get related concepts
   */
  public async getRelated(id: string): Promise<Concept[]> {
    try {
      const concept = await this.getById(id);

      if (!concept || !concept.related_concepts) {
        return [];
      }

      const related: Concept[] = [];

      for (const relatedId of concept.related_concepts) {
        // Handle both IDs and wiki-links
        const cleanId = relatedId.replace(/\[\[|\]\]/g, '');
        const relatedConcept = await this.getById(cleanId);

        if (relatedConcept) {
          related.push(relatedConcept);
        }
      }

      return related;
    } catch (error) {
      logger.error('Failed to get related concepts', { error, id });
      throw error;
    }
  }

  /**
   * Get the directory for a category
   */
  private getCategoryDirectory(category: LongtermCategory): string {
    const longtermDirs = this.fs.getLongtermDirs();

    // Map category to directory
    const categoryMap: Record<LongtermCategory, string> = {
      concept: longtermDirs.concepts || longtermDirs[Object.keys(longtermDirs)[0]],
      method: longtermDirs.methods || longtermDirs[Object.keys(longtermDirs)[0]],
      person: longtermDirs.people || longtermDirs[Object.keys(longtermDirs)[0]],
      other: longtermDirs[Object.keys(longtermDirs)[0]],
    };

    return categoryMap[category];
  }

  /**
   * Generate a filename from title
   */
  private generateFileName(title: string): string {
    // Slugify title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 80);

    return `${slug}.md`;
  }

  /**
   * Convert a document to a Concept object
   */
  private documentToConcept(doc: any, filePath: string): Concept {
    return {
      id: doc.frontmatter.id,
      title: doc.frontmatter.title,
      content: doc.content,
      category: doc.frontmatter.category || 'other',
      tags: doc.frontmatter.tags,
      related_concepts: doc.frontmatter.related_concepts,
      sources: doc.frontmatter.sources,
      created_at: doc.frontmatter.created_at,
      updated_at: doc.frontmatter.updated_at,
      version: doc.frontmatter.version || 1,
      file_path: filePath,
    };
  }
}
