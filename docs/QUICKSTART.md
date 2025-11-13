# Quick Start Guide

This guide will help you get Humem up and running in minutes.

## Prerequisites

- Node.js >= 18.0.0
- npm or pnpm
- Claude Desktop (for MCP integration)

## Installation

### 1. Build the Project

```bash
# Build the project
npm run build

# Verify the build
ls dist/
```

### 2. Create Your Private Vault

Your memories should be kept separate from the code in a private repository:

```bash
# Create a new directory for your vault
mkdir ~/humem-vault
cd ~/humem-vault

# Initialize git
git init

# Create vault structure
mkdir -p episodes concepts methods people .system
touch short-term.md

# Add .gitignore
cat > .gitignore << EOF
# System files
.DS_Store
.system/vectordb/
*.log
*.tmp
EOF

# Initial commit
git add .
git commit -m "Initial vault setup"

# Create a private GitHub repository and push
git remote add origin git@github.com:yourusername/your-private-vault.git
git push -u origin main
```

### 3. Configure Humem

Create a `config.yml` file in the humem project directory:

```bash
cp config.example.yml config.yml
```

Edit `config.yml` and set your vault path:

```yaml
vault:
  path: /Users/yourusername/humem-vault  # Use absolute path
```

### 4. Test the Server

Test that the server starts correctly:

```bash
npm start
```

You should see:
```
Humem - Digital Memory System
Version: 0.1.0
Starting MCP server...
Server is running. Waiting for connections...
```

Press Ctrl+C to stop the server.

## Connecting to Claude Desktop

### 1. Find Your Humem Installation Path

```bash
pwd
# Example: /Users/yourusername/dev/humem
```

### 2. Configure Claude Desktop

Open Claude Desktop configuration file:

**macOS:**
```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Linux:**
```bash
code ~/.config/Claude/claude_desktop_config.json
```

**Windows:**
```bash
code %APPDATA%\Claude\claude_desktop_config.json
```

### 3. Add Humem to MCP Servers

Add this to your configuration:

```json
{
  "mcpServers": {
    "humem": {
      "command": "node",
      "args": ["/absolute/path/to/humem/dist/index.js"],
      "env": {
        "HUMEM_VAULT_PATH": "/absolute/path/to/your/vault"
      }
    }
  }
}
```

Replace the paths with your actual paths.

### 4. Restart Claude Desktop

Quit and restart Claude Desktop completely.

### 5. Verify Connection

In Claude Desktop, start a new conversation and try:

```
Can you list your available memory tools?
```

Claude should respond with information about the Humem tools.

## Testing the Memory System

### Store a Short-Term Note

```
Remember: I need to review the Q4 report by Friday
```

Claude will use `memory_short_term_add` to store this.

### Store an Episode

```
Remember this event: Had a great meeting today with the product team.
We discussed the new features for the next release.
Location: Conference Room A.
Participants: Alice, Bob, Charlie.
```

Claude will use `memory_episodic_add` to create an episode.

### Store a Concept

```
Remember this concept:
Holacracy is a self-management framework that distributes authority
throughout an organization using roles and circles.
```

Claude will use `memory_longterm_add` to store this as a concept.

### Search Your Memories

```
What did we discuss in meetings last week?
```

Claude will search your episodic memory.

## Viewing Your Memories

Your memories are stored as plain Markdown files in your vault:

```bash
cd ~/humem-vault

# View short-term memory
cat short-term.md

# View episodes
ls episodes/

# View a specific episode
cat episodes/2025-11/2025-11-13-product-meeting.md

# View concepts
ls concepts/
cat concepts/holacracy.md
```

## Opening in Obsidian

Since all your memories are Markdown files, you can open your vault in Obsidian:

1. Open Obsidian
2. Click "Open folder as vault"
3. Select your vault directory (e.g., `~/humem-vault`)

Now you can:
- Browse your memories
- Use Obsidian's graph view to see connections
- Edit memories manually
- Use Obsidian plugins

## Troubleshooting

### Server Won't Start

Check the logs:
```bash
cat vault/.system/logs/system.log
```

### Claude Can't Connect

1. Verify the path in `claude_desktop_config.json` is absolute
2. Check that the dist/index.js file exists
3. Restart Claude Desktop completely
4. Check Claude Desktop logs (Help → View Logs)

### Vault Not Found

Make sure:
- The vault path in `config.yml` is absolute
- The directory exists and has proper permissions
- You've created the required subdirectories

## Next Steps

- Read the full [API Documentation](api.md)
- Learn about [Memory Classification](../docs/konzept.md)
- Set up [Vector Search](setup-vector-search.md) (coming soon)
- Configure [File Watching](setup-file-watcher.md) (coming soon)

## Getting Help

- Check the [main README](../README.md)
- Review the [concept document](../docs/konzept.md)
- Open an issue on GitHub
