---
title: demo/cohere-token-rotate/readme
group: demo/cohere-token-rotate
---

# Cohere Token Rotate

Token rotation system with multiple AI provider support and LangChain integration.

## Purpose

Demonstrates capabilities:
- API token rotation between different providers
- Multiple AI service integration (Cohere, LMStudio, Ollama)
- Load balancing between providers
- LangChain streaming integration

## Key Features

- **Token Rotation**: Automatic rotation between API keys
- **Multi-Provider Support**: Cohere, LMStudio, Ollama
- **LangChain Integration**: Streaming responses through LangChain
- **Load Balancing**: Request distribution between providers
- **Fallback System**: Automatic switching on errors

## Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Streaming**: LangChain
- **AI Providers**: Cohere AI, LMStudio, Ollama

## Project Structure

```
src/
├── logic/
│   ├── agent/         # Triage agent
│   ├── completion/    # Various providers
│   ├── enum/          # Enumerations
│   ├── swarm/         # Swarm configuration
│   └── tools/         # Tools
└── index.ts           # Entry point
```

## Installation and Setup

```bash
# Install dependencies
bun install

# Run
bun run src/index.ts
```

## Configuration

Create a `.env` file:

```env
COHERE_API_KEY=your_cohere_api_key
COHERE_API_KEY_2=your_backup_cohere_key
LMSTUDIO_API_URL=http://localhost:1234
OLLAMA_API_URL=http://localhost:11434
```

## Usage Examples

1. **Automatic Rotation**: System automatically switches between providers
2. **High Availability**: When one provider is unavailable, another is used
3. **Cost Optimization**: Balancing to optimize costs
4. **Performance**: Selecting the fastest available provider

## Rotation Benefits

- **Reliability**: Resilience to individual provider failures
- **Cost Savings**: Request distribution to reduce costs
- **Scalability**: Easy addition of new providers
- **Performance**: Optimal resource utilization

## Applications

Critical for:
- Production-ready systems
- High-load applications
- Enterprise solutions
- SaaS platforms with uptime guarantee