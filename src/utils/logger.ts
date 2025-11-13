import { existsSync, mkdirSync, appendFileSync } from 'fs';
import { dirname } from 'path';
import { getConfig } from '../config/loader.js';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
};

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component?: string;
  message: string;
  metadata?: Record<string, any>;
}

export class Logger {
  private component?: string;

  constructor(component?: string) {
    this.component = component;
  }

  private shouldLog(level: LogLevel): boolean {
    try {
      const config = getConfig();
      const configLevel = config.get('logging').level;
      return LOG_LEVELS[level] <= LOG_LEVELS[configLevel];
    } catch {
      // If config not initialized, log everything
      return true;
    }
  }

  private formatMessage(level: LogLevel, message: string, metadata?: Record<string, any>): string {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component: this.component,
      message,
      metadata,
    };

    return JSON.stringify(entry);
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formatted = this.formatMessage(level, message, metadata);

    // Stderr output (safe for MCP stdio transport)
    const prefix = this.component ? `[${this.component}]` : '';
    const metadataStr = metadata ? ' ' + JSON.stringify(metadata) : '';
    process.stderr.write(`${prefix} ${message}${metadataStr}\n`);

    // File output
    try {
      const config = getConfig();
      const logFilePath = config.get('logging').file;

      // Ensure directory exists
      const logDir = dirname(logFilePath);
      if (!existsSync(logDir)) {
        mkdirSync(logDir, { recursive: true });
      }

      appendFileSync(logFilePath, formatted + '\n');
    } catch (error) {
      // Silently fail if logging to file fails (write to stderr as last resort)
      process.stderr.write(`Failed to write to log file: ${error}\n`);
    }
  }

  public error(message: string, metadata?: Record<string, any>): void {
    this.log('error', message, metadata);
  }

  public warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, metadata);
  }

  public info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, metadata);
  }

  public debug(message: string, metadata?: Record<string, any>): void {
    this.log('debug', message, metadata);
  }

  public trace(message: string, metadata?: Record<string, any>): void {
    this.log('trace', message, metadata);
  }
}

// Factory function
export function createLogger(component?: string): Logger {
  return new Logger(component);
}
