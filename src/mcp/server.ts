import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { FileSystemHandler } from '../storage/filesystem.js';
import { ShortTermMemory } from '../memory/short-term.js';
import { EpisodicMemory } from '../memory/episodic.js';
import { LongtermMemory } from '../memory/longterm.js';
import { MemoryClassifier } from '../memory/classifier.js';
import { createShortTermTools } from './tools/short-term-tools.js';
import { createEpisodicTools } from './tools/episodic-tools.js';
import { createLongtermTools } from './tools/longterm-tools.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('MCPServer');

export class MCPServer {
  private server: Server;
  private fs: FileSystemHandler;
  private shortTerm: ShortTermMemory;
  private episodic: EpisodicMemory;
  private longterm: LongtermMemory;
  private classifier: MemoryClassifier;
  private tools: Map<string, any>;

  constructor() {
    this.server = new Server(
      {
        name: 'dimems',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize components
    this.fs = new FileSystemHandler();
    this.shortTerm = new ShortTermMemory(this.fs);
    this.episodic = new EpisodicMemory(this.fs);
    this.longterm = new LongtermMemory(this.fs);
    this.classifier = new MemoryClassifier();

    // Initialize tools registry
    this.tools = new Map();
    this.registerTools();

    // Set up request handlers
    this.setupHandlers();

    logger.info('MCP Server initialized');
  }

  private registerTools(): void {
    // Register short-term memory tools
    const shortTermTools = createShortTermTools(this.shortTerm);
    for (const [name, tool] of Object.entries(shortTermTools)) {
      this.tools.set(name, tool);
    }

    // Register episodic memory tools
    const episodicTools = createEpisodicTools(this.episodic);
    for (const [name, tool] of Object.entries(episodicTools)) {
      this.tools.set(name, tool);
    }

    // Register long-term memory tools
    const longtermTools = createLongtermTools(this.longterm);
    for (const [name, tool] of Object.entries(longtermTools)) {
      this.tools.set(name, tool);
    }

    logger.info(`Registered ${this.tools.size} MCP tools`);
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = Array.from(this.tools.entries()).map(([name, tool]) => ({
        name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      }));

      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const toolName = request.params.name;
      const tool = this.tools.get(toolName);

      if (!tool) {
        logger.warn(`Unknown tool requested: ${toolName}`);
        throw new Error(`Unknown tool: ${toolName}`);
      }

      try {
        logger.debug(`Executing tool: ${toolName}`, { params: request.params.arguments });
        const result = await tool.handler(request.params.arguments || {});
        return result;
      } catch (error) {
        logger.error(`Tool execution failed: ${toolName}`, { error });
        throw error;
      }
    });
  }

  public async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('MCP Server started and connected via stdio');
  }

  public getComponents() {
    return {
      fs: this.fs,
      shortTerm: this.shortTerm,
      episodic: this.episodic,
      longterm: this.longterm,
      classifier: this.classifier,
    };
  }
}
