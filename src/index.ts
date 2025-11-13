#!/usr/bin/env node

import { initializeConfig } from './config/loader.js';
import { MCPServer } from './mcp/server.js';
import { createLogger } from './utils/logger.js';

const logger = createLogger('Main');

async function main() {
  try {
    // Initialize configuration
    const configPath = process.env.DIMEMS_CONFIG_PATH;
    initializeConfig(configPath);

    logger.info('Dimems - Digital Memory System');
    logger.info('Version: 0.1.0');
    logger.info('Starting MCP server...');

    // Create and start MCP server
    const server = new MCPServer();
    await server.start();

    logger.info('Server is running. Waiting for connections...');

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Fatal error during startup', { error });
    process.exit(1);
  }
}

main();
