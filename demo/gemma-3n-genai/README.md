---
title: demo/gemma-3n-genai/readme
group: demo/gemma-3n-genai
---

# Gemma 3N GenAI

Integration with Google Gemini and xAI models through modern web framework Hono with WebSocket support.

## Purpose

Demonstrates capabilities:
- Google Gemini AI integration
- xAI (Grok) model support  
- Modern web API with Hono framework
- WebSocket real-time communication
- Multi-provider AI architecture

## Key Features

- **Google Gemini Integration**: Access to latest Gemini models
- **xAI Support**: Grok models for advanced reasoning
- **Hono Web Framework**: Fast, modern web API
- **WebSocket Support**: Real-time bidirectional communication
- **REPL Interface**: Interactive development environment

## Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Web Framework**: Hono
- **AI Providers**: Google Gemini, xAI
- **Protocols**: HTTP, WebSocket

## Project Structure

```
src/
├── repl.ts            # REPL interface
└── lib/
    └── swarm.ts       # Swarm configuration
```

## Installation and Setup

```bash
# Install dependencies
bun install

# Start REPL
bun run src/repl.ts
```

## Configuration

Create a `.env` file:

```env
GOOGLE_API_KEY=your_google_api_key
XAI_API_KEY=your_xai_api_key
GEMINI_MODEL=gemini-pro
GROK_MODEL=grok-2
PORT=3000
```

## Google Gemini Setup

### Getting API Key
1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Create a new project
3. Get API key
4. Add to `.env` file

### Supported Models
- **Gemini Pro**: General purpose model
- **Gemini Pro Vision**: Multimodal с image support
- **Gemini Ultra**: Most capable model (when available)

## xAI Integration

### API Access
1. Get access to [xAI API](https://x.ai/)
2. Create API key
3. Select Grok model

### Grok Models
- **Grok-2**: Latest reasoning model
- **Grok-2-Mini**: Faster, cost-effective option
- **Grok-1**: Previous generation

## Usage Examples

### General Questions
- "Explain quantum computing"
- "Write a business plan for a startup"
- "Help solve a mathematical problem"

### Creative Tasks
- "Write a poem about nature"
- "Create a movie plot"
- "Develop a character description"

### Technical Assistance
- "Explain microservices architecture"
- "How to optimize a React application?"
- "Best practices for TypeScript"

## Model Comparison

| Feature | Gemini Pro | Grok-2 | Grok-2-Mini |
|---------|------------|--------|-------------|
| Reasoning | Excellent | Superior | Good |
| Speed | Fast | Medium | Very Fast |
| Cost | Low | High | Medium |
| Multimodal | Yes | Limited | No |

## Web API Features

### REST Endpoints
```bash
# Chat completion
POST /api/chat
{
  "message": "Hello, how are you?",
  "model": "gemini-pro"
}
```

### WebSocket
```javascript
const ws = new WebSocket('ws://localhost:3000/ws');
ws.send(JSON.stringify({
  message: "Hello via WebSocket",
  model: "grok-2"
}));
```

## Performance Optimization

### Model Selection Strategy
- **Fast Responses**: Grok-2-Mini for quick interactions
- **Complex Reasoning**: Grok-2 for advanced tasks  
- **Multimodal**: Gemini Pro Vision for image tasks
- **Cost Optimization**: Gemini Pro for general use

### Caching
- Response caching for common queries
- Model warming for faster startup
- Connection pooling for efficiency

## Use Cases

Ideal for:
- Advanced AI applications
- Research and experimentation
- Educational platforms
- Creative writing tools
- Technical consulting

## Development Features

### Hot Reload
```bash
# Development mode with auto-reload
bun --watch src/repl.ts
```

### Debugging
```javascript
// Enable debug logging
process.env.DEBUG = "true"
```

### Testing
```bash
# Test different models
bun run test:gemini
bun run test:grok
```

## Production Deployment

### Docker
```dockerfile
FROM oven/bun:latest
COPY . .
RUN bun install
EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
```

### Environment
```bash
# Production environment
NODE_ENV=production
LOG_LEVEL=info
RATE_LIMIT=100
```