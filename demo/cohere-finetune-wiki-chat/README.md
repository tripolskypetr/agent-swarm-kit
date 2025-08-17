---
title: demo/cohere-finetune-wiki-chat/readme
group: demo/cohere-finetune-wiki-chat
---

# Cohere Finetune Wiki Chat

Chat system using Cohere's fine-tuned models for working with wiki-like knowledge.

## Purpose

Demonstrates capabilities:
- Cohere AI integration for specialized knowledge
- Working with fine-tuned models for domain expertise
- Processing wiki-style content through agents
- REPL interface for interactive engagement

## Key Features

- **Cohere Integration**: Using Cohere AI for response generation
- **Finetune Support**: Working with custom trained models
- **Wiki Knowledge**: Specialization in wiki-like content
- **REPL Interface**: Interactive command line

## Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **AI Framework**: agent-swarm-kit
- **AI Provider**: Cohere AI
- **Interface**: REPL

## Project Structure

```
src/
├── repl.ts        # REPL interface
└── lib/
    └── swarm.ts   # Swarm configuration
```

## Installation and Setup

```bash
# Install dependencies
bun install

# Run REPL
bun run src/repl.ts
```

## Configuration

Create a `.env` file:

```env
COHERE_API_KEY=your_cohere_api_key
COHERE_MODEL=your_finetune_model_id
```

## Usage Examples

1. **Wiki Queries**: "Tell me about quantum physics"
2. **Historical Facts**: "What happened in 1945?"
3. **Scientific Concepts**: "Explain theory of relativity"
4. **Educational Content**: "How does DNA work?"

## Cohere Advantages

- High-quality text generation
- Finetune support for specific domains
- Efficient work with long contexts
- Multilingual support

## Applications

Perfect for:
- Educational platforms
- Corporate knowledge bases
- Scientific assistants
- Intelligent reference systems