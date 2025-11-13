# Humem API Documentation

This document describes all MCP tools available in Humem.

## Overview

Humem provides tools for managing three types of memory:
- **Short-Term Memory**: Temporary notes and tasks
- **Episodic Memory**: Time-bound events and experiences
- **Long-Term Memory**: Timeless knowledge and concepts

## Short-Term Memory Tools

### `memory_short_term_add`

Add information to short-term memory for temporary storage.

**Parameters:**
- `content` (string, required): The content to store
- `category` (string, optional): Category - "task", "thought", or "reference"
- `priority` (string, optional): Priority level - "low", "medium", or "high"

**Example:**
```json
{
  "content": "Review the Q4 report by Friday",
  "category": "task",
  "priority": "high"
}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-11-13T14:00:00.000Z",
  "message": "Item added to short-term memory"
}
```

### `memory_short_term_read`

Read all items from short-term memory.

**Parameters:** None

**Response:**
```json
{
  "items": [
    {
      "timestamp": "2025-11-13T14:00:00.000Z",
      "content": "Review the Q4 report by Friday",
      "category": "task",
      "priority": "high",
      "status": "active"
    }
  ],
  "count": 1,
  "content": "# Short-Term Memory\n\n..."
}
```

### `memory_short_term_clear`

Clear all items from short-term memory.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "message": "Short-term memory cleared"
}
```

## Episodic Memory Tools

### `memory_episodic_add`

Store a time-bound event or experience in episodic memory.

**Parameters:**
- `title` (string, required): Title of the episode
- `content` (string, required): Detailed description
- `date` (string, optional): ISO 8601 date/time (defaults to now)
- `tags` (array, optional): Tags for categorization
- `location` (string, optional): Where the event occurred
- `participants` (array, optional): People involved
- `related_episodes` (array, optional): IDs of related episodes

**Example:**
```json
{
  "title": "Product Team Meeting",
  "content": "Discussed Q1 roadmap and new features...",
  "date": "2025-11-13T10:00:00.000Z",
  "tags": ["meeting", "product", "planning"],
  "location": "Conference Room A",
  "participants": ["Alice", "Bob", "Charlie"]
}
```

**Response:**
```json
{
  "success": true,
  "id": "abc-123-def-456",
  "file_path": "/vault/episodes/2025-11/2025-11-13-product-team-meeting.md",
  "message": "Episode stored in episodic memory"
}
```

### `memory_episodic_get_by_date`

Get episodes within a date range.

**Parameters:**
- `start` (string, optional): Start date (ISO 8601)
- `end` (string, optional): End date (ISO 8601)

**Example:**
```json
{
  "start": "2025-11-01",
  "end": "2025-11-30"
}
```

**Response:**
```json
{
  "episodes": [
    {
      "id": "abc-123",
      "title": "Product Team Meeting",
      "date": "2025-11-13T10:00:00.000Z",
      "location": "Conference Room A",
      "participants": ["Alice", "Bob", "Charlie"],
      "tags": ["meeting", "product"],
      "content": "Discussed Q1 roadmap..."
    }
  ],
  "count": 1
}
```

### `memory_episodic_get_by_id`

Get a specific episode by its ID.

**Parameters:**
- `id` (string, required): Episode ID

**Response:**
```json
{
  "episode": {
    "id": "abc-123",
    "title": "Product Team Meeting",
    "date": "2025-11-13T10:00:00.000Z",
    "content": "Full content...",
    "tags": ["meeting"],
    "location": "Conference Room A",
    "participants": ["Alice", "Bob"],
    "created_at": "2025-11-13T10:00:00.000Z",
    "updated_at": "2025-11-13T10:00:00.000Z"
  },
  "found": true
}
```

## Long-Term Memory Tools

### `memory_longterm_add`

Store timeless knowledge, concepts, or methods in long-term memory.

**Parameters:**
- `title` (string, required): Title of the concept
- `content` (string, required): Detailed explanation
- `category` (string, required): "concept", "method", "person", or "other"
- `tags` (array, optional): Tags for categorization
- `related_concepts` (array, optional): Related concept IDs or wiki-links
- `sources` (array, optional): Source URLs or references

**Example:**
```json
{
  "title": "Holacracy",
  "content": "Holacracy is a self-management framework...",
  "category": "concept",
  "tags": ["organizational-development", "self-management"],
  "sources": ["https://www.holacracy.org"]
}
```

**Response:**
```json
{
  "success": true,
  "id": "def-456-ghi-789",
  "file_path": "/vault/concepts/holacracy.md",
  "message": "Concept stored in long-term memory"
}
```

### `memory_longterm_get_by_category`

Get all concepts in a specific category.

**Parameters:**
- `category` (string, required): "concept", "method", "person", or "other"

**Response:**
```json
{
  "concepts": [
    {
      "id": "def-456",
      "title": "Holacracy",
      "category": "concept",
      "tags": ["organizational-development"],
      "content": "Holacracy is..."
    }
  ],
  "count": 1
}
```

### `memory_longterm_get_by_id`

Get a specific concept by its ID.

**Parameters:**
- `id` (string, required): Concept ID

**Response:**
```json
{
  "concept": {
    "id": "def-456",
    "title": "Holacracy",
    "content": "Full content...",
    "category": "concept",
    "tags": ["organizational-development"],
    "related_concepts": [],
    "sources": ["https://www.holacracy.org"],
    "created_at": "2025-11-13T10:00:00.000Z",
    "updated_at": "2025-11-13T10:00:00.000Z",
    "version": 1
  },
  "found": true
}
```

### `memory_longterm_get_related`

Get concepts related to a specific concept.

**Parameters:**
- `id` (string, required): Concept ID

**Response:**
```json
{
  "related": [
    {
      "id": "xyz-789",
      "title": "Sociocracy",
      "category": "concept"
    }
  ],
  "count": 1
}
```

## Memory Classification

When you ask Claude to "remember" something, Humem automatically classifies it:

### Short-Term Memory Indicators
- Temporal keywords: "today", "tomorrow", "later", "soon"
- Task keywords: "todo", "need to", "should", "must", "remember to"
- Short content (< 100 characters)

### Episodic Memory Indicators
- Event keywords: "meeting", "workshop", "discussed", "attended"
- Date patterns: ISO dates, relative dates
- Past tense verbs
- Mentions of people and locations

### Long-Term Memory Indicators
- Concept keywords: "is", "means", "principle", "framework"
- Method keywords: "how to", "process", "technique"
- Person keywords: "person", "client", "colleague"
- Longer, explanatory content

## Using with Claude

Claude will automatically choose the appropriate tool based on your request:

**Examples:**

```
You: Remember: Call the client tomorrow at 2pm
Claude: [Uses memory_short_term_add with category: task]
```

```
You: Remember: Had a great workshop today with Team X about roles
Claude: [Uses memory_episodic_add, extracts date, participants]
```

```
You: Remember this concept: Holacracy is a self-management framework...
Claude: [Uses memory_longterm_add with category: concept]
```

```
You: What meetings did I have last week?
Claude: [Uses memory_episodic_get_by_date with appropriate date range]
```

## File Storage

All memories are stored as Markdown files:

```
vault/
├── short-term.md                    # All short-term items
├── episodes/
│   └── 2025-11/
│       └── 2025-11-13-meeting.md    # Episode files
└── concepts/
    └── holacracy.md                  # Concept files
```

Each file has YAML frontmatter with metadata:

```markdown
---
id: abc-123
title: Product Meeting
date: 2025-11-13T10:00:00.000Z
tags: [meeting, product]
---

# Product Meeting

Meeting content here...
```

## Next Steps

- Set up [Vector Search](setup-vector-search.md) for semantic queries (coming soon)
- Configure [File Watching](setup-file-watcher.md) for auto-indexing (coming soon)
- Enable [Memory Consolidation](consolidation.md) (coming soon)
