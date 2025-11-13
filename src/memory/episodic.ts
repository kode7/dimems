import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { FileSystemHandler } from '../storage/filesystem.js';
import { Episode, AddEpisodicParams } from './types.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('EpisodicMemory');

export class EpisodicMemory {
  private fs: FileSystemHandler;

  constructor(fs: FileSystemHandler) {
    this.fs = fs;
  }

  /**
   * Add an episode to episodic memory
   */
  public async add(params: AddEpisodicParams): Promise<{
    success: boolean;
    id: string;
    file_path: string;
  }> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      const date = params.date || now;

      // Create episode
      const episode: Episode = {
        id,
        title: params.title,
        date,
        content: params.content,
        tags: params.tags,
        location: params.location,
        participants: params.participants,
        related_episodes: params.related_episodes,
        created_at: now,
        updated_at: now,
      };

      // Generate file path based on date
      const fileName = this.generateFileName(date, params.title);
      const episodicDir = this.fs.getEpisodicDir();

      // Organize into year-month subdirectories
      const dateObj = new Date(date);
      const yearMonth = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(
        2,
        '0'
      )}`;
      const filePath = join(episodicDir, yearMonth, fileName);

      // Create frontmatter (filter out undefined values for YAML serialization)
      const frontmatter: Record<string, any> = {
        id: episode.id,
        title: episode.title,
        date: episode.date,
        created_at: episode.created_at,
        updated_at: episode.updated_at,
      };

      // Only add optional fields if they have values
      if (episode.tags && episode.tags.length > 0) frontmatter.tags = episode.tags;
      if (episode.location) frontmatter.location = episode.location;
      if (episode.participants && episode.participants.length > 0) {
        frontmatter.participants = episode.participants;
      }
      if (episode.related_episodes && episode.related_episodes.length > 0) {
        frontmatter.related_episodes = episode.related_episodes;
      }

      // Write document
      this.fs.writeDocument(filePath, params.content, frontmatter);

      logger.info('Created episodic memory', { id, title: params.title, date });

      return {
        success: true,
        id,
        file_path: filePath,
      };
    } catch (error) {
      logger.error('Failed to add episodic memory', { error, title: params.title });
      throw error;
    }
  }

  /**
   * Get an episode by ID
   */
  public async getById(id: string): Promise<Episode | null> {
    try {
      // Search all episodic files for the ID
      const episodicDir = this.fs.getEpisodicDir();
      const files = this.fs.listFiles(episodicDir, true);

      for (const file of files) {
        const doc = this.fs.readDocument(file);

        if (doc.frontmatter.id === id) {
          return this.documentToEpisode(doc, file);
        }
      }

      return null;
    } catch (error) {
      logger.error('Failed to get episode by ID', { error, id });
      throw error;
    }
  }

  /**
   * Get episodes by date range
   */
  public async getByDateRange(start?: string, end?: string): Promise<Episode[]> {
    try {
      const episodicDir = this.fs.getEpisodicDir();
      const files = this.fs.listFiles(episodicDir, true);
      const episodes: Episode[] = [];

      for (const file of files) {
        const doc = this.fs.readDocument(file);
        const episodeDate = doc.frontmatter.date;

        if (!episodeDate) continue;

        // Filter by date range
        if (start && episodeDate < start) continue;
        if (end && episodeDate > end) continue;

        episodes.push(this.documentToEpisode(doc, file));
      }

      // Sort by date descending
      episodes.sort((a, b) => (b.date > a.date ? 1 : -1));

      return episodes;
    } catch (error) {
      logger.error('Failed to get episodes by date range', { error, start, end });
      throw error;
    }
  }

  /**
   * Get all episodes
   */
  public async getAll(): Promise<Episode[]> {
    return this.getByDateRange();
  }

  /**
   * Update an episode
   */
  public async update(
    id: string,
    updates: Partial<Omit<Episode, 'id' | 'created_at'>>
  ): Promise<{ success: boolean }> {
    try {
      // Find the episode file
      const episodicDir = this.fs.getEpisodicDir();
      const files = this.fs.listFiles(episodicDir, true);

      for (const file of files) {
        const doc = this.fs.readDocument(file);

        if (doc.frontmatter.id === id) {
          const updatedFrontmatter = {
            ...doc.frontmatter,
            ...updates,
            updated_at: new Date().toISOString(),
          };

          const updatedContent = updates.content || doc.content;

          this.fs.updateDocument(file, {
            content: updatedContent,
            frontmatter: updatedFrontmatter,
          });

          logger.info('Updated episodic memory', { id });

          return { success: true };
        }
      }

      throw new Error(`Episode not found: ${id}`);
    } catch (error) {
      logger.error('Failed to update episode', { error, id });
      throw error;
    }
  }

  /**
   * Generate a filename from date and title
   */
  private generateFileName(date: string, title: string): string {
    const dateObj = new Date(date);
    const dateStr = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD

    // Slugify title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);

    return `${dateStr}-${slug}.md`;
  }

  /**
   * Convert a document to an Episode object
   */
  private documentToEpisode(doc: any, filePath: string): Episode {
    return {
      id: doc.frontmatter.id,
      title: doc.frontmatter.title,
      date: doc.frontmatter.date,
      content: doc.content,
      tags: doc.frontmatter.tags,
      location: doc.frontmatter.location,
      participants: doc.frontmatter.participants,
      related_episodes: doc.frontmatter.related_episodes,
      created_at: doc.frontmatter.created_at,
      updated_at: doc.frontmatter.updated_at,
      file_path: filePath,
    };
  }
}
