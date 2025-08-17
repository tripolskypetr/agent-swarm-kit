---
title: demo/langchain-stream/readme
group: demo/langchain-stream
---

# LangChain Stream

LangChain integration for streaming responses with support for multiple AI providers.

## Purpose

Demonstrates capabilities:
- LangChain integration for streaming
- Real-time token streaming
- Multi-provider architecture
- Seamless integration with agent-swarm-kit

## Key Features

- **LangChain Streaming**: Real-time token transmission
- **Multi-Provider Support**: Cohere, LMStudio, Ollama
- **Pharmaceutical Sales**: Thematic agent for sales
- **Token-by-Token Response**: Smooth response generation
- **Provider Fallback**: Automatic provider switching

## Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **AI Framework**: agent-swarm-kit + LangChain
- **Streaming**: LangChain streaming API
- **AI Providers**: Cohere, LMStudio, Ollama

## Project Structure

```
src/
├── logic/
│   ├── agent/         # Triage agent
│   ├── completion/    # Streaming providers
│   ├── enum/          # Enumerations
│   ├── swarm/         # Root swarm
│   └── tools/         # Add to cart tool
└── index.ts           # Entry point
```

## Installation and Setup

```bash
# Install dependencies
bun install

# Start
bun run src/index.ts
```

## Configuration

Create a `.env` file:

```env
COHERE_API_KEY=your_cohere_api_key
LMSTUDIO_API_URL=http://localhost:1234
OLLAMA_API_URL=http://localhost:11434
```

## Usage Examples

1. **Pharma consultation**: "What helps with headaches?"
   - Response is generated token-by-token in real-time

2. **Add to cart**: "Add aspirin"
   - Streaming confirmation of addition

3. **Product questions**: "What antibiotics do you have?"
   - Smooth generation of product list

## LangChain Benefits

- **Streaming Performance**: Instant delivery of first tokens
- **User Experience**: No delays in responses
- **Provider Abstraction**: Unified interface for different AI
- **Error Handling**: Graceful fallback when issues occur

## Streaming Architecture

```
User Request → Agent Processing → LangChain → AI Provider
     ↓              ↓               ↓           ↓
Response ← Token Stream ← Completion ← Model Response
```

## Use Cases

Critical for:
- Interactive chat applications
- Real-time customer support
- Live consultations
- Educational assistants
- Entertainment bots

## Performance Benefits

- **Perceived Speed**: Responses start instantly
- **Engagement**: Users see generation progress
- **Responsiveness**: Better UX compared to batch responses
- **Efficiency**: Optimal network bandwidth usage