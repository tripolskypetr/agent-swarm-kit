---
title: design/02_getting_started
group: design
---

# Getting Started

This guide provides a quick introduction to building multi-agent AI systems with agent-swarm-kit. It covers installation, core concepts, and basic usage patterns to get you up and running with your first agent swarm.

For advanced configuration options, see [Configuration and Global Settings](./33_Configuration_and_Global_Settings.md). For comprehensive examples, see [Examples and Testing](./27_Examples_and_Testing.md). For detailed API documentation, see [API Reference](./31_API_Reference.md).

## Installation and Setup

Install the package using npm:

```bash
npm install agent-swarm-kit
```

The library provides a dependency injection-based architecture where agents, tools, and completions are registered globally and then assembled into swarms for execution.

## Core Architecture Overview

Agent-swarm-kit uses a layered service architecture built around a central dependency injection container. The system orchestrates multiple AI agents that can communicate, share tools, and maintain conversation history.

![Mermaid Diagram](./diagrams\2_Getting_Started_0.svg)

## Core Concepts

### Agents
Agents are AI entities with specific prompts, tools, and completion configurations. Each agent handles particular types of conversations or tasks.

### Swarms  
Swarms are collections of agents with a designated default agent. They enable agent-to-agent navigation during conversations.

### Tools
Tools are functions that agents can call to perform actions like data retrieval, external API calls, or agent navigation.

### Sessions
Sessions manage client connections, conversation history, and agent state for individual users or conversation threads.

## Basic Usage Pattern

The typical workflow involves four steps: define components, assemble swarm, create session, and process messages.

![Mermaid Diagram](./diagrams\2_Getting_Started_1.svg)

## Quick Start Example

Here's a minimal example creating a triage agent that routes to specialized agents:

```typescript
import {
  addAgent,
  addCompletion, 
  addSwarm,
  addTool,
  changeAgent,
  execute,
  session,
  Adapter
} from "agent-swarm-kit";

// 1. Define completion (AI model integration)
const COMPLETION = addCompletion({
  completionName: "my-completion",
  getCompletion: Adapter.fromOpenAI(openaiClient, "gpt-4")
});

// 2. Define navigation tool
const NAVIGATE_TOOL = addTool({
  toolName: "navigate-tool",
  call: async (clientId, agentName, { to }) => {
    await changeAgent(to, clientId);
    await execute("Navigation complete", clientId);
  },
  validate: async () => true,
  type: "function",
  function: {
    name: "navigate-tool",
    description: "Navigate to another agent",
    parameters: {
      type: "object",
      properties: {
        to: { type: "string", description: "Target agent name" }
      },
      required: ["to"]
    }
  }
});

// 3. Define agents
const TRIAGE_AGENT = addAgent({
  agentName: "triage-agent",
  completion: COMPLETION,
  prompt: "Route user requests to sales-agent or support-agent",
  tools: [NAVIGATE_TOOL]
});

const SALES_AGENT = addAgent({
  agentName: "sales-agent", 
  completion: COMPLETION,
  prompt: "Handle sales inquiries and product questions",
  tools: [NAVIGATE_TOOL]
});

// 4. Create swarm
const SWARM = addSwarm({
  agentList: [TRIAGE_AGENT, SALES_AGENT],
  defaultAgent: TRIAGE_AGENT,
  swarmName: "customer-service-swarm"
});

// 5. Start session and process messages
const { complete, dispose } = session("client-123", SWARM);

// Send message and get response
const response = await complete("I want to buy a product");
console.log(response);

// Clean up when done
await dispose();
```

## String-Based Dependency Injection

Agent-swarm-kit supports modular development through string-based references, allowing you to define components in separate files:

```typescript
// Define enums for type safety
export enum AgentName {
  TriageAgent = "triage-agent",
  SalesAgent = "sales-agent"
}

export enum CompletionName {
  MainCompletion = "main-completion"  
}

export enum SwarmName {
  CustomerService = "customer-service"
}

// Reference by string names
addAgent({
  agentName: AgentName.SalesAgent,
  completion: CompletionName.MainCompletion,
  prompt: "Handle sales inquiries",
  tools: [ToolName.NavigateTool]
});

addSwarm({
  agentList: [AgentName.TriageAgent, AgentName.SalesAgent],
  defaultAgent: AgentName.TriageAgent, 
  swarmName: SwarmName.CustomerService
});

const { complete } = session("client-123", SwarmName.CustomerService);
```

## Background Processing

Use `fork()` for isolated background processing that runs independently of main chat sessions:

```typescript
import { fork, scope, overrideAgent } from "agent-swarm-kit";

// Run background agent processing
const result = await fork(
  async (clientId, agentName) => {
    // Background processing logic
    return await processDataAnalysis(clientId, agentName);
  },
  {
    clientId: "background-task-123",
    swarmName: SwarmName.AnalyticsSwarm
  }
);
```

## Session Management

Sessions handle client connections and conversation state. Each session maintains:

- **Message History**: Last 25 messages shared between agents
- **Agent State**: Current active agent for the client  
- **Connection Management**: Automatic cleanup and disposal

```typescript
// WebSocket integration example
app.get("/api/v1/session/:clientId", upgradeWebSocket((ctx) => {
  const clientId = ctx.req.param("clientId");
  const { complete, dispose } = session(clientId, SWARM);
  
  return {
    onMessage: async (event, ws) => {
      const message = event.data.toString();
      const response = await complete(message);
      ws.send(response);
    },
    onClose: async () => {
      await dispose();
    }
  };
}));
```

## Next Steps

Now that you have the basics, explore these areas:

- **Multi-Agent Systems** - Learn advanced swarm orchestration patterns at [Building Multi-Agent Systems](./05_Swarm_Management.md)
- **Tool Integration** - Create custom tools and MCP server integration at [Tool Integration](./05_Swarm_Management.md)  
- **Storage & State** - Implement persistent storage and embeddings at [Managing State and Storage](./05_Swarm_Management.md)
- **Examples** - See complete working examples at [Examples and Testing](./06_Session_and_Chat_Management.md)

The system's modular architecture allows you to start simple and progressively add complexity as your needs grow.
