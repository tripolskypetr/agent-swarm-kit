---
title: wiki/multi_agent_systems
group: wiki
---

# Building Multi-Agent Systems

This document provides comprehensive guidance for developers creating multi-agent AI applications using the agent-swarm-kit framework. It covers the essential patterns, components, and workflows needed to design, implement, and orchestrate systems where multiple AI agents collaborate to solve complex tasks.

For information about the underlying service architecture and dependency injection, see [Service Architecture](#3). For details about AI model integration and completion adapters, see [AI Integration](#4). For specific usage examples, see [Examples](#6).

## System Architecture Overview

Multi-agent systems in this framework follow a layered architecture where agents operate within swarms, sessions manage client interactions, and tools enable agent capabilities. The system coordinates agent execution, message routing, and state management through a service-oriented design.

### High-Level System Flow

![Mermaid Diagram](./diagrams\24_Building_Multi-Agent_Systems_0.svg)

Sources: [src/client/ClientSession.ts:1-500](), [src/client/ClientSwarm.ts:1-500](), [src/client/ClientAgent.ts:1-500](), [src/lib/services/public/SessionPublicService.ts:1-100](), [src/lib/services/connection/AgentConnectionService.ts:1-100]()

## Defining Agents

Agents are the fundamental units of intelligence in a multi-agent system. Each agent has a specific role, prompt, set of tools, and completion engine that defines its capabilities and behavior.

### Basic Agent Configuration

![Mermaid Diagram](./diagrams\24_Building_Multi-Agent_Systems_1.svg)

Sources: [src/functions/setup/addAgent.ts:1-50](), [src/interfaces/Agent.interface.ts:370-450](), [src/lib/services/schema/AgentSchemaService.ts:1-100]()

The `addAgent` function registers agent configurations in the `AgentSchemaService`. Key properties include:

- **agentName**: Unique identifier for the agent within the system
- **prompt**: Static string or dynamic function that defines the agent's system prompt
- **completion**: Reference to a completion engine for generating responses  
- **tools**: Array of tool names available to the agent
- **maxToolCalls**: Maximum number of tools the agent can call per turn
- **keepMessages**: Number of history messages to maintain for context

### Agent Tool Integration

Tools extend agent capabilities by allowing them to perform actions beyond text generation. Each tool defines its interface, validation logic, and execution behavior.

![Mermaid Diagram](./diagrams\24_Building_Multi-Agent_Systems_2.svg)

Sources: [src/interfaces/Agent.interface.ts:115-170](), [src/client/ClientAgent.ts:109-158](), [src/utils/resolveTools.ts:1-50]()

## Creating Agent Swarms

Swarms coordinate multiple agents and manage navigation between them. They define which agents are available and how clients can switch between agent contexts.

### Swarm Configuration

![Mermaid Diagram](./diagrams\24_Building_Multi-Agent_Systems_3.svg)

Sources: [src/interfaces/Swarm.interface.ts:50-100](), [src/client/ClientSwarm.ts:1-100](), [src/functions/navigate/changeToAgent.ts:1-50]()

### Agent Navigation Patterns

Navigation tools enable agents to transfer conversations to other specialized agents within the swarm. This allows building sophisticated workflows where different agents handle different aspects of a task.

| Navigation Function | Purpose | Usage |
|-------------------|---------|--------|
| `changeToAgent(agentName, clientId)` | Switch to specific agent | Direct navigation to known agent |
| `changeToPrevAgent(clientId)` | Return to previous agent | Undo last navigation |
| `changeToDefaultAgent(clientId)` | Return to default agent | Reset to swarm entry point |

Sources: [src/functions/navigate/changeToAgent.ts:1-50](), [src/functions/navigate/changeToPrevAgent.ts:1-50](), [src/functions/navigate/changeToDefaultAgent.ts:1-50]()

## Tool System Architecture

Tools are the primary mechanism for agents to perform actions beyond text generation. They enable agents to navigate between each other, access external systems, modify state, and perform computational tasks.

### Tool Execution Pipeline

![Mermaid Diagram](./diagrams\24_Building_Multi-Agent_Systems_4.svg)

Sources: [src/client/ClientAgent.ts:109-158](), [src/functions/setup/addTool.ts:1-50](), [src/functions/commit/commitToolOutput.ts:1-50](), [src/utils/resolveTools.ts:1-50]()

### Tool Implementation Patterns

Tools implement the `IAgentTool` interface with specific methods for validation and execution:

```typescript
interface IAgentTool {
  toolName: ToolName;
  type: "function";
  function: ITool['function'];
  call(dto: ToolCallDto): Promise<void>;
  validate?(dto: ToolValidateDto): Promise<boolean> | boolean;
  callbacks?: Partial<IAgentToolCallbacks>;
}
```

The `call` method receives:
- **toolId**: Unique identifier for tracking tool output
- **clientId**: Client session identifier  
- **agentName**: Current agent context
- **params**: Parsed tool parameters from LLM
- **isLast**: Whether this is the final tool in a sequence
- **abortSignal**: Signal for cancelling long-running operations

Sources: [src/interfaces/Agent.interface.ts:115-170](), [src/client/ClientAgent.ts:134-143]()

## Session Management

Sessions represent individual client connections and manage the complete lifecycle of multi-agent interactions. They coordinate message flow, agent execution, and output emission.

### Session Lifecycle

![Mermaid Diagram](./diagrams\24_Building_Multi-Agent_Systems_5.svg)

Sources: [src/functions/target/session.ts:1-50](), [src/functions/target/makeConnection.ts:1-50](), [src/client/ClientSession.ts:1-100](), [src/functions/target/disposeConnection.ts:1-50]()

### Session Operations

| Operation | Purpose | Return Type |
|-----------|---------|-------------|
| `complete(message, clientId, swarmName)` | Execute message and return response | `Promise<string>` |
| `execute(message, clientId, agentName)` | Execute on specific agent | `Promise<void>` |
| `run(message, clientId, agentName)` | Stateless execution | `Promise<string>` |
| `emit(message, clientId)` | Send message to session | `Promise<void>` |

Sources: [src/functions/target/complete.ts:1-50](), [src/functions/target/execute.ts:1-50](), [src/functions/target/emit.ts:1-50]()

## Completion Engine Integration

Completion engines provide the AI capabilities for agents. They interface with various LLM providers and handle the request/response cycle for generating agent responses.

### Completion Architecture

![Mermaid Diagram](./diagrams\24_Building_Multi-Agent_Systems_6.svg)

Sources: [src/functions/setup/addCompletion.ts:1-50](), [src/interfaces/Completion.interface.ts:1-100](), [src/classes/Adapter.ts:1-100]()

### Supported LLM Providers

The framework includes adapters for major LLM providers:

- **OpenAI**: `Adapter.fromOpenAI()`
- **Ollama**: `Adapter.fromOllama()` 
- **Cohere**: `Adapter.fromCohere()`
- **NVIDIA NIM**: `Adapter.fromNim()`
- **Anthropic**: `Adapter.fromAnthropic()`

Each adapter handles provider-specific request formatting, authentication, and response parsing while providing a consistent interface to the agent system.

Sources: [src/classes/Adapter.ts:1-200](), [package.json:16-25]()

## Building Complete Systems

Multi-agent systems combine all these components into cohesive applications. The typical flow involves defining agents with specialized roles, creating tools for agent capabilities, configuring swarms for orchestration, and establishing sessions for client interaction.

### System Assembly Pattern

![Mermaid Diagram](./diagrams\24_Building_Multi-Agent_Systems_7.svg)

Sources: [test/spec/connection.test.mjs:74-200](), [test/spec/navigation.test.mjs:1-100](), [src/index.ts:55-85]()

### Example Implementation Flow

The test files demonstrate typical implementation patterns:

1. **Define completions** with `addCompletion()` for LLM integration
2. **Create tools** with `addTool()` for agent capabilities  
3. **Configure agents** with `addAgent()` specifying roles and tools
4. **Assemble swarms** with `addSwarm()` defining agent collections
5. **Start sessions** with `session()` for client interactions
6. **Handle navigation** using tools that call `changeToAgent()`

This pattern enables building sophisticated multi-agent applications where specialized agents collaborate to handle complex workflows, with seamless transitions between different AI capabilities and contexts.

Sources: [test/spec/connection.test.mjs:28-120](), [test/spec/navigation.test.mjs:40-100](), [demo/client-server-chat/src/lib/swarm.ts:1-100]()