# Dimems - Digital Memory System

A local AI-integrated digital memory system that organizes information using a three-layer cognitive architecture inspired by human memory models.

## Overview

Dimems creates a bridge between short-term conversations with AI assistants and long-term knowledge storage. Like the human brain, it organizes information by relevance, temporality, and context through three distinct memory layers:

- **Short-Term Memory**: Fast, volatile storage for immediate tasks and thoughts
- **Episodic Memory**: Time-bound events, experiences, and memories
- **Long-Term Memory**: Timeless concepts, methods, and knowledge

## Key Features

- **Three-Layer Memory Architecture**: Cognitive psychology-based organization
- **MCP Integration**: Seamless integration with Claude via Model Context Protocol
- **Local Vector Database**: Semantic search powered by Chroma
- **Markdown-Based**: All memories stored as plain Markdown files (Obsidian compatible)
- **Full Privacy**: Everything runs locally, your data never leaves your machine
- **Intelligent Classification**: AI-powered memory type detection
- **Semantic Search**: Find memories by meaning, not just keywords

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Claude AI (via MCP)                │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────┐
│              MCP Server (Dimems)                │
│  ┌──────────────────────────────────────────┐  │
│  │  Memory Classification & Management       │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐   │
│  │ Short-   │  │ Episodic │  │ Long-Term  │   │
│  │ Term     │  │ Memory   │  │ Memory     │   │
│  └──────────┘  └──────────┘  └────────────┘   │
└─────────────────┬───────────────┬───────────────┘
                  │               │
         ┌────────┴──────┐   ┌───┴──────────┐
         │  Markdown     │   │ Vector DB    │
         │  Files        │   │ (Chroma)     │
         └───────────────┘   └──────────────┘
```

## Installation

### Prerequisites

- Node.js >= 18.0.0
- npm or pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/dimems.git
cd dimems

# Install dependencies
npm install

# Build the project
npm run build
```

### Configuration

Create a `config.yml` file in the project root:

```yaml
vault:
  # Path to your private vault (can be a separate git repo)
  path: /path/to/your/vault
  structure:
    short_term: short-term.md
    episodic_dir: episodes
    longterm_dirs:
      - concepts
      - methods
      - people

mcp:
  server:
    port: auto
    timeout: 30000

vector_db:
  type: chroma
  path: .system/vectordb

embedding:
  model: sentence-transformers/all-MiniLM-L6-v2
  device: cpu

logging:
  level: info
```

### Setting Up Your Private Vault

Your personal memories should be kept separate from the public code:

1. Create a new directory for your vault:
```bash
mkdir ~/humem-vault
cd ~/humem-vault
git init
```

2. Create the vault structure:
```bash
mkdir -p episodes concepts methods people .system
touch short-term.md
```

3. Add a `.gitignore` for the vault:
```bash
cat > .gitignore << EOF
# System files
.DS_Store
.system/vectordb/
*.log
EOF
```

4. Create a **private** GitHub repository for your vault and push:
```bash
git add .
git commit -m "Initial vault setup"
git remote add origin git@github.com:yourusername/my-private-vault.git
git push -u origin main
```

5. Update your `config.yml` to point to this vault location.

## Usage

### Running the MCP Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Connecting to Claude Desktop

Add this to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "humem": {
      "command": "node",
      "args": ["/path/to/humem/dist/index.js"]
    }
  }
}
```

### Available MCP Tools

Once connected, Claude will have access to these tools:

#### Short-Term Memory
- `memory_short_term_add`: Add information to short-term memory
- `memory_short_term_read`: Read current short-term memory
- `memory_short_term_clear`: Clear short-term memory

#### Episodic Memory
- `memory_episodic_add`: Store a time-bound event or experience
- `memory_episodic_search`: Search episodes by date or content

#### Long-Term Memory
- `memory_longterm_add`: Store timeless concepts or knowledge
- `memory_longterm_search`: Search concepts and methods

#### Search
- `search_semantic`: Semantic search across all memories
- `search_fulltext`: Full-text search with regex support

## Example Workflows

### Storing a Meeting Note

```
User: "Remember: Had a great workshop today with Team X about role clarification"
Claude: [Uses memory_episodic_add]
```

This creates: `vault/episodes/2025-11/2025-11-13-workshop-team-x.md`

### Storing a Concept

```
User: "Remember this: Holacracy is a self-management framework..."
Claude: [Uses memory_longterm_add with category: concept]
```

This creates: `vault/concepts/holacracy.md`

### Searching Memories

```
User: "What did we discuss about workshops last month?"
Claude: [Uses search_semantic with time_range filter]
```

## Development

```bash
# Run tests
npm test

# Run tests with coverage
npm test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

## Project Structure

```
humem/
├── src/
│   ├── config/          # Configuration management
│   ├── mcp/             # MCP server and tools
│   ├── memory/          # Memory classification and management
│   ├── storage/         # File system and vector DB access
│   ├── search/          # Search engines (semantic + fulltext)
│   ├── watcher/         # File watcher for auto-embedding
│   └── utils/           # Utilities and helpers
├── tests/               # Test suites
├── docs/                # Documentation
├── example-vault/       # Example vault structure
└── dist/                # Compiled output
```

## Privacy & Security

- **Local-First**: All data processing happens on your machine
- **No Cloud**: No data is sent to external servers (except optional embedding API)
- **Separate Repos**: Keep your code public and memories private
- **Version Control**: Your memories can be versioned in a private git repo
- **Plain Text**: Everything in Markdown format - no lock-in

## Roadmap

- [x] Three-layer memory architecture
- [x] MCP server integration
- [x] Vector-based semantic search
- [ ] Memory consolidation (auto-archive short-term)
- [ ] Memory promotion (episodic → long-term)
- [ ] Plugin system for extensibility
- [ ] Knowledge graph visualization
- [ ] Advanced analytics

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Inspiration

This project is inspired by:
- Zettelkasten Method
- Building a Second Brain
- Human Memory Models (Atkinson-Shiffrin)
- Obsidian and the Personal Knowledge Management community

## Related Projects

- [Obsidian](https://obsidian.md) - Markdown-based knowledge base
- [Model Context Protocol](https://modelcontextprotocol.io) - AI tool integration standard
- [Chroma](https://www.trychroma.com) - Vector database for AI applications
