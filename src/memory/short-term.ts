import { FileSystemHandler } from '../storage/filesystem.js';
import { ShortTermItem, AddShortTermParams } from './types.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('ShortTermMemory');

export class ShortTermMemory {
  private fs: FileSystemHandler;

  constructor(fs: FileSystemHandler) {
    this.fs = fs;
  }

  /**
   * Add an item to short-term memory
   */
  public async add(params: AddShortTermParams): Promise<{ success: boolean; timestamp: string }> {
    try {
      const timestamp = new Date().toISOString();
      const item: ShortTermItem = {
        timestamp,
        content: params.content,
        category: params.category,
        priority: params.priority,
        status: 'active',
      };

      // Read existing short-term memory
      const shortTermPath = this.fs.getShortTermPath();
      let content = '';

      if (this.fs.exists(shortTermPath)) {
        const doc = this.fs.readDocument(shortTermPath);
        content = doc.content;
      }

      // Append new item
      const itemText = this.formatItem(item);
      content = content.trim() + '\n\n' + itemText;

      // Write back
      this.fs.writeDocument(shortTermPath, content, {});

      logger.info('Added item to short-term memory', { timestamp, category: params.category });

      return {
        success: true,
        timestamp,
      };
    } catch (error) {
      logger.error('Failed to add short-term memory item', { error });
      throw error;
    }
  }

  /**
   * Read all items from short-term memory
   */
  public async read(): Promise<{ items: ShortTermItem[]; content: string }> {
    try {
      const shortTermPath = this.fs.getShortTermPath();

      if (!this.fs.exists(shortTermPath)) {
        return { items: [], content: '' };
      }

      const doc = this.fs.readDocument(shortTermPath);
      const items = this.parseItems(doc.content);

      return {
        items,
        content: doc.content,
      };
    } catch (error) {
      logger.error('Failed to read short-term memory', { error });
      throw error;
    }
  }

  /**
   * Clear short-term memory
   */
  public async clear(): Promise<{ success: boolean }> {
    try {
      const shortTermPath = this.fs.getShortTermPath();
      const clearText = `# Short-Term Memory\n\nCleared at: ${new Date().toISOString()}\n`;

      this.fs.writeDocument(shortTermPath, clearText, {});

      logger.info('Cleared short-term memory');

      return { success: true };
    } catch (error) {
      logger.error('Failed to clear short-term memory', { error });
      throw error;
    }
  }

  /**
   * Format an item as markdown
   */
  private formatItem(item: ShortTermItem): string {
    const categoryTag = item.category ? ` #${item.category}` : '';
    const priorityTag = item.priority ? ` !${item.priority}` : '';

    return `## ${item.timestamp}${categoryTag}${priorityTag}\n\n${item.content}\n\n---`;
  }

  /**
   * Parse items from markdown content
   */
  private parseItems(content: string): ShortTermItem[] {
    const items: ShortTermItem[] = [];

    // Split by separator
    const sections = content.split('---').filter((s) => s.trim());

    for (const section of sections) {
      const lines = section.trim().split('\n');

      // Skip if empty or header only
      if (lines.length < 2) continue;

      // Parse header line (## timestamp #category !priority)
      const headerMatch = lines[0].match(/^##\s+(.+?)(?:\s+#(\w+))?(?:\s+!(\w+))?$/);
      if (!headerMatch) continue;

      const timestamp = headerMatch[1];
      const category = headerMatch[2] as ShortTermItem['category'];
      const priority = headerMatch[3] as ShortTermItem['priority'];

      // Get content (everything after the header)
      const itemContent = lines.slice(1).join('\n').trim();

      items.push({
        timestamp,
        content: itemContent,
        category,
        priority,
        status: 'active',
      });
    }

    return items;
  }
}
