---
title: demo/mcp-weather-chat/readme
group: demo/mcp-weather-chat
---

# MCP Weather Chat

Model Context Protocol (MCP) integration for interacting with external weather services.

## Purpose

Demonstrates capabilities:
- MCP integration for external services
- Weather API integration through protocol
- Tool calling through MCP server
- Extensible architecture for external data

## Key Features

- **MCP Integration**: Model Context Protocol for external tools
- **Weather Service**: Real-time weather data
- **Server Architecture**: Separate MCP server
- **Tool Calling**: Structured function calling for weather
- **Extensible Design**: Easy addition of new services

## Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Protocol**: Model Context Protocol (MCP)
- **External APIs**: Weather services

## Project Structure

```
src/
├── config/
│   └── mcp.ts         # MCP configuration
├── repl.ts           # REPL interface
└── lib/
    └── swarm.ts      # Swarm configuration
server/
└── src/
    └── index.ts      # MCP server
```

## Installation and Setup

```bash
# Install dependencies
bun install

# Start MCP server (terminal 1)
cd server && bun run src/index.ts

# Start client (terminal 2)
bun run src/repl.ts
```

## Configuration

Create a `.env` file:

```env
WEATHER_API_KEY=your_weather_api_key
MCP_SERVER_URL=http://localhost:3001
OPENAI_API_KEY=your_openai_api_key
```

## Usage Examples

1. **Current weather**: "What's the weather in Moscow?"
2. **Forecast**: "Tomorrow's forecast for St. Petersburg"
3. **Comparison**: "Compare weather in Moscow and London"
4. **Planning**: "Should I take an umbrella in Sochi today?"

## MCP Benefits

- **Standardized Protocol**: Unified standard for external services
- **Type Safety**: Structured data exchange
- **Extensibility**: Easy addition of new tools
- **Isolation**: Separate servers for different services

## Use Cases

Excellent for:
- Weather applications
- Travel planning assistants
- Outdoor activity recommendations
- Agricultural advice systems
- Event planning tools

## Extension

MCP architecture allows adding:
- News services
- Stock market data
- Translation services
- Calendar integration
- Maps and navigation