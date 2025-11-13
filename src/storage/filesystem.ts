import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  renameSync,
  readdirSync,
  statSync,
} from 'fs';
import { join, dirname } from 'path';
import matter from 'gray-matter';
import { getConfig } from '../config/loader.js';
import { Document, Frontmatter, FileSystemError } from '../memory/types.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('FileSystem');

export class FileSystemHandler {
  private vaultPath: string;

  constructor() {
    const config = getConfig();
    this.vaultPath = config.get('vault').path;
    this.ensureVaultStructure();
  }

  private ensureVaultStructure(): void {
    const config = getConfig();
    const structure = config.get('vault').structure;

    // Create vault root if it doesn't exist
    if (!existsSync(this.vaultPath)) {
      logger.info(`Creating vault directory: ${this.vaultPath}`);
      mkdirSync(this.vaultPath, { recursive: true });
    }

    // Create episodes directory
    const episodicDir = join(this.vaultPath, structure.episodic_dir);
    if (!existsSync(episodicDir)) {
      mkdirSync(episodicDir, { recursive: true });
    }

    // Create long-term directories
    for (const dir of structure.longterm_dirs) {
      const dirPath = join(this.vaultPath, dir);
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
      }
    }

    // Create .system directory
    const systemDir = join(this.vaultPath, '.system');
    if (!existsSync(systemDir)) {
      mkdirSync(systemDir, { recursive: true });
    }

    // Create short-term memory file if it doesn't exist
    const shortTermPath = join(this.vaultPath, structure.short_term);
    if (!existsSync(shortTermPath)) {
      this.writeFile(shortTermPath, '', {});
    }

    logger.info('Vault structure verified');
  }

  /**
   * Read a file and parse its frontmatter
   */
  public readDocument(filePath: string): Document {
    try {
      const fullPath = this.resolvePath(filePath);

      if (!existsSync(fullPath)) {
        throw new FileSystemError(`File not found: ${filePath}`, { path: fullPath });
      }

      const raw = readFileSync(fullPath, 'utf-8');
      const parsed = matter(raw);

      return {
        frontmatter: parsed.data as Frontmatter,
        content: parsed.content,
        raw,
        file_path: fullPath,
      };
    } catch (error) {
      if (error instanceof FileSystemError) throw error;
      throw new FileSystemError(`Failed to read document: ${filePath}`, { error });
    }
  }

  /**
   * Write a file with frontmatter (atomic operation)
   */
  public writeDocument(
    filePath: string,
    content: string,
    frontmatter: Frontmatter
  ): string {
    try {
      const fullPath = this.resolvePath(filePath);
      const dir = dirname(fullPath);

      // Ensure directory exists
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      // Generate markdown with frontmatter
      const doc = matter.stringify(content, frontmatter);

      // Write atomically using temp file + rename
      const tempPath = fullPath + '.tmp';
      writeFileSync(tempPath, doc, 'utf-8');
      renameSync(tempPath, fullPath);

      logger.debug(`Document written: ${filePath}`);
      return fullPath;
    } catch (error) {
      throw new FileSystemError(`Failed to write document: ${filePath}`, { error });
    }
  }

  /**
   * Update an existing document (read, modify, write)
   */
  public updateDocument(
    filePath: string,
    updates: {
      content?: string;
      frontmatter?: Partial<Frontmatter>;
    }
  ): void {
    try {
      const doc = this.readDocument(filePath);

      const newContent = updates.content !== undefined ? updates.content : doc.content;
      const newFrontmatter = updates.frontmatter
        ? { ...doc.frontmatter, ...updates.frontmatter }
        : doc.frontmatter;

      this.writeDocument(filePath, newContent, newFrontmatter);
      logger.debug(`Document updated: ${filePath}`);
    } catch (error) {
      throw new FileSystemError(`Failed to update document: ${filePath}`, { error });
    }
  }

  /**
   * Delete a file (soft delete - rename with .deleted extension)
   */
  public deleteDocument(filePath: string): void {
    try {
      const fullPath = this.resolvePath(filePath);

      if (!existsSync(fullPath)) {
        throw new FileSystemError(`File not found: ${filePath}`, { path: fullPath });
      }

      const deletedPath = fullPath + '.deleted';
      renameSync(fullPath, deletedPath);

      logger.debug(`Document deleted: ${filePath}`);
    } catch (error) {
      throw new FileSystemError(`Failed to delete document: ${filePath}`, { error });
    }
  }

  /**
   * Permanently delete a file
   */
  public permanentlyDelete(filePath: string): void {
    try {
      const fullPath = this.resolvePath(filePath);

      if (!existsSync(fullPath)) {
        throw new FileSystemError(`File not found: ${filePath}`, { path: fullPath });
      }

      unlinkSync(fullPath);
      logger.debug(`Document permanently deleted: ${filePath}`);
    } catch (error) {
      throw new FileSystemError(`Failed to permanently delete document: ${filePath}`, {
        error,
      });
    }
  }

  /**
   * List files in a directory
   */
  public listFiles(directory: string, recursive = false): string[] {
    try {
      const fullPath = this.resolvePath(directory);

      if (!existsSync(fullPath)) {
        return [];
      }

      const files: string[] = [];
      const entries = readdirSync(fullPath);

      for (const entry of entries) {
        const entryPath = join(fullPath, entry);
        const stat = statSync(entryPath);

        if (stat.isFile() && entry.endsWith('.md')) {
          files.push(entryPath);
        } else if (stat.isDirectory() && recursive) {
          const subFiles = this.listFiles(entryPath, true);
          files.push(...subFiles);
        }
      }

      return files;
    } catch (error) {
      throw new FileSystemError(`Failed to list files in: ${directory}`, { error });
    }
  }

  /**
   * Check if a file exists
   */
  public exists(filePath: string): boolean {
    const fullPath = this.resolvePath(filePath);
    return existsSync(fullPath);
  }

  /**
   * Write a simple file without frontmatter
   */
  private writeFile(filePath: string, content: string, frontmatter: Frontmatter): void {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    if (Object.keys(frontmatter).length > 0) {
      const doc = matter.stringify(content, frontmatter);
      writeFileSync(filePath, doc, 'utf-8');
    } else {
      writeFileSync(filePath, content, 'utf-8');
    }
  }

  /**
   * Resolve a path relative to vault root
   */
  private resolvePath(filePath: string): string {
    // If path is already absolute, return it
    if (filePath.startsWith('/') || filePath.match(/^[A-Z]:\\/)) {
      return filePath;
    }
    // Otherwise, resolve relative to vault
    return join(this.vaultPath, filePath);
  }

  /**
   * Get vault path
   */
  public getVaultPath(): string {
    return this.vaultPath;
  }

  /**
   * Get path for short-term memory
   */
  public getShortTermPath(): string {
    const config = getConfig();
    const filename = config.get('vault').structure.short_term;
    return join(this.vaultPath, filename);
  }

  /**
   * Get path for episodes directory
   */
  public getEpisodicDir(): string {
    const config = getConfig();
    const dirname = config.get('vault').structure.episodic_dir;
    return join(this.vaultPath, dirname);
  }

  /**
   * Get paths for long-term directories
   */
  public getLongtermDirs(): Record<string, string> {
    const config = getConfig();
    const dirs = config.get('vault').structure.longterm_dirs;
    const result: Record<string, string> = {};

    for (const dir of dirs) {
      result[dir] = join(this.vaultPath, dir);
    }

    return result;
  }
}
