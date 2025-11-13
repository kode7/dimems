import {
  MemoryType,
  LongtermCategory,
  ClassificationResult,
  ClassificationError,
} from './types.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('Classifier');

export class MemoryClassifier {
  // Keywords that indicate different memory types
  private readonly TEMPORAL_KEYWORDS = [
    'today',
    'yesterday',
    'tomorrow',
    'tonight',
    'morning',
    'afternoon',
    'evening',
    'later',
    'soon',
    'now',
  ];

  private readonly TASK_KEYWORDS = [
    'todo',
    'task',
    'need to',
    'should',
    'must',
    'remember to',
    'don\'t forget',
  ];

  private readonly EVENT_KEYWORDS = [
    'meeting',
    'workshop',
    'conference',
    'call',
    'talked',
    'discussed',
    'met with',
    'attended',
    'visited',
    'went to',
  ];

  private readonly CONCEPT_KEYWORDS = [
    'is',
    'means',
    'refers to',
    'defined as',
    'concept of',
    'principle',
    'theory',
    'framework',
    'model',
    'approach',
  ];

  private readonly METHOD_KEYWORDS = [
    'how to',
    'method',
    'process',
    'procedure',
    'technique',
    'strategy',
    'way to',
    'steps to',
  ];

  private readonly PERSON_KEYWORDS = [
    'person',
    'people',
    'client',
    'colleague',
    'friend',
    'contact',
    'works at',
    'email',
    'phone',
  ];

  /**
   * Classify memory content into one of the three memory types
   */
  public classify(content: string, context?: string): ClassificationResult {
    try {
      const lowerContent = content.toLowerCase();
      const lowerContext = context?.toLowerCase() || '';
      const combined = lowerContent + ' ' + lowerContext;

      // Initialize scores
      let shortTermScore = 0;
      let episodicScore = 0;
      let longtermScore = 0;

      // Check for temporal keywords (increases short-term score)
      const temporalMatches = this.countKeywordMatches(combined, this.TEMPORAL_KEYWORDS);
      shortTermScore += temporalMatches * 2;

      // Check for task keywords (increases short-term score)
      const taskMatches = this.countKeywordMatches(combined, this.TASK_KEYWORDS);
      shortTermScore += taskMatches * 3;

      // Check for event keywords (increases episodic score)
      const eventMatches = this.countKeywordMatches(combined, this.EVENT_KEYWORDS);
      episodicScore += eventMatches * 3;

      // Check for concept keywords (increases long-term score)
      const conceptMatches = this.countKeywordMatches(combined, this.CONCEPT_KEYWORDS);
      longtermScore += conceptMatches * 2;

      // Check for date patterns (increases episodic score)
      if (this.hasDatePattern(combined)) {
        episodicScore += 5;
      }

      // Check for past tense verbs (increases episodic score)
      if (this.hasPastTense(combined)) {
        episodicScore += 2;
      }

      // Short content likely short-term
      if (content.length < 100) {
        shortTermScore += 2;
      }

      // Long content likely episodic or long-term
      if (content.length > 500) {
        episodicScore += 1;
        longtermScore += 1;
      }

      // Determine the winner
      const maxScore = Math.max(shortTermScore, episodicScore, longtermScore);

      let type: MemoryType;
      let confidence: number;

      if (maxScore === 0) {
        // Default to episodic if no clear signal
        type = 'episodic';
        confidence = 0.5;
      } else {
        const totalScore = shortTermScore + episodicScore + longtermScore;
        confidence = maxScore / totalScore;

        if (shortTermScore === maxScore) {
          type = 'short_term';
        } else if (episodicScore === maxScore) {
          type = 'episodic';
        } else {
          type = 'longterm';
        }
      }

      // Extract metadata
      const metadata = this.extractMetadata(content, context);

      // Determine category for long-term memory
      let category: LongtermCategory | undefined;
      if (type === 'longterm') {
        category = this.determineLongtermCategory(combined);
      }

      const result: ClassificationResult = {
        type,
        confidence,
        category,
        metadata,
      };

      logger.debug('Classification result', {
        type,
        confidence,
        category,
        scores: { shortTermScore, episodicScore, longtermScore },
      });

      return result;
    } catch (error) {
      throw new ClassificationError('Failed to classify memory', { error, content });
    }
  }

  /**
   * Determine category for long-term memory
   */
  private determineLongtermCategory(content: string): LongtermCategory {
    const methodScore = this.countKeywordMatches(content, this.METHOD_KEYWORDS);
    const personScore = this.countKeywordMatches(content, this.PERSON_KEYWORDS);
    const conceptScore = this.countKeywordMatches(content, this.CONCEPT_KEYWORDS);

    const maxScore = Math.max(methodScore, personScore, conceptScore);

    if (maxScore === 0) {
      return 'other';
    } else if (methodScore === maxScore) {
      return 'method';
    } else if (personScore === maxScore) {
      return 'person';
    } else {
      return 'concept';
    }
  }

  /**
   * Extract metadata from content
   */
  private extractMetadata(
    content: string,
    context?: string
  ): ClassificationResult['metadata'] {
    const metadata: ClassificationResult['metadata'] = {};

    // Extract date if present
    const dateMatch = this.extractDate(content);
    if (dateMatch) {
      metadata.date = dateMatch;
    }

    // Extract title (first line or first sentence)
    const title = this.extractTitle(content);
    if (title) {
      metadata.title = title;
    }

    // Extract tags (words starting with #)
    const tags = this.extractTags(content + ' ' + (context || ''));
    if (tags.length > 0) {
      metadata.tags = tags;
    }

    // Extract location (basic pattern matching)
    const location = this.extractLocation(content);
    if (location) {
      metadata.location = location;
    }

    // Extract participants (people mentioned)
    const participants = this.extractParticipants(content);
    if (participants.length > 0) {
      metadata.participants = participants;
    }

    return metadata;
  }

  /**
   * Count keyword matches in text
   */
  private countKeywordMatches(text: string, keywords: string[]): number {
    let count = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Check if text has date patterns
   */
  private hasDatePattern(text: string): boolean {
    const datePatterns = [
      /\d{4}-\d{2}-\d{2}/, // ISO date
      /\d{1,2}\/\d{1,2}\/\d{2,4}/, // MM/DD/YYYY or DD/MM/YYYY
      /\d{1,2}\.\d{1,2}\.\d{2,4}/, // DD.MM.YYYY
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/i,
      /\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
    ];

    return datePatterns.some((pattern) => pattern.test(text));
  }

  /**
   * Check if text has past tense indicators
   */
  private hasPastTense(text: string): boolean {
    const pastTensePatterns = [
      /\b(was|were|had|did|went|came|saw|met|talked|discussed)\b/,
      /\b\w+ed\b/, // Words ending in -ed
    ];

    return pastTensePatterns.some((pattern) => pattern.test(text));
  }

  /**
   * Extract date from text
   */
  private extractDate(text: string): string | undefined {
    const isoDateMatch = text.match(/\d{4}-\d{2}-\d{2}T?\d{2}:\d{2}:\d{2}/);
    if (isoDateMatch) {
      return isoDateMatch[0];
    }

    const isoDateOnlyMatch = text.match(/\d{4}-\d{2}-\d{2}/);
    if (isoDateOnlyMatch) {
      return isoDateOnlyMatch[0];
    }

    return undefined;
  }

  /**
   * Extract title from content (first line or sentence)
   */
  private extractTitle(content: string): string | undefined {
    // Try to get first line
    const firstLine = content.split('\n')[0].trim();

    if (firstLine && firstLine.length > 0 && firstLine.length <= 100) {
      return firstLine;
    }

    // Try to get first sentence
    const firstSentence = content.split(/[.!?]/)[0].trim();

    if (firstSentence && firstSentence.length > 0 && firstSentence.length <= 100) {
      return firstSentence;
    }

    // Use first 50 characters
    if (content.length > 50) {
      return content.substring(0, 50) + '...';
    }

    return content;
  }

  /**
   * Extract tags (words starting with #)
   */
  private extractTags(text: string): string[] {
    const tagPattern = /#(\w+)/g;
    const matches = text.matchAll(tagPattern);
    const tags = Array.from(matches, (m) => m[1]);
    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Extract location mentions
   */
  private extractLocation(text: string): string | undefined {
    const locationPatterns = [
      /\bat\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
      /\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
      /\blocation:\s*(.+?)(?:\n|$)/i,
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  /**
   * Extract participant names
   */
  private extractParticipants(text: string): string[] {
    const participants: string[] = [];

    // Look for "with [Name]" patterns
    const withPattern = /\bwith\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
    const withMatches = text.matchAll(withPattern);

    for (const match of withMatches) {
      participants.push(match[1]);
    }

    // Look for proper names (capitalized words, not at start of sentence)
    const namePattern = /(?<!^|\. )([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
    const nameMatches = text.matchAll(namePattern);

    for (const match of nameMatches) {
      const name = match[1];
      // Filter out common words
      if (
        !['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(
          name
        )
      ) {
        participants.push(name);
      }
    }

    return [...new Set(participants)]; // Remove duplicates
  }
}
