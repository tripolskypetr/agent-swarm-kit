# Building Multi-Agent Systems

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [.npmignore](.npmignore)
- [LICENSE](LICENSE)
- [README.md](README.md)
- [build/.gitkeep](build/.gitkeep)
- [rollup.config.mjs](rollup.config.mjs)
- [schema.png](schema.png)
- [scripts/linux/build_demo_docs.sh](scripts/linux/build_demo_docs.sh)
- [scripts/win/build_demo_docs.bat](scripts/win/build_demo_docs.bat)
- [src/cli/dumpDocs.ts](src/cli/dumpDocs.ts)
- [src/functions/setup/addAgent.ts](src/functions/setup/addAgent.ts)
- [src/functions/target/fork.ts](src/functions/target/fork.ts)
- [src/functions/test/overrideAgent.ts](src/functions/test/overrideAgent.ts)
- [src/helpers/mapAgentSchema.ts](src/helpers/mapAgentSchema.ts)
- [src/lib/services/base/DocService.ts](src/lib/services/base/DocService.ts)
- [src/lib/services/context/SchemaContextService.ts](src/lib/services/context/SchemaContextService.ts)
- [src/utils/resolveTools.ts](src/utils/resolveTools.ts)

</details>



This document provides a comprehensive guide to defining agents, swarms, and orchestrating multi-agent workflows using the agent-swarm-kit framework. It covers the step-by-step process from basic component definition through advanced orchestration patterns.

For information about the underlying service architecture that powers these components, see [Service Architecture](#3). For details about AI model integration and completion adapters, see [AI Integration](#4). For tool integration patterns and MCP server connectivity, see [Tool Integration](#5.2).

## Core Building Blocks

Multi-agent systems in agent-swarm-kit are constructed from four fundamental components that must be defined in a specific order: tools, completions, agents, and swarms.

### Tool Definition

Tools provide the functional capabilities that agents can execute. Each tool is defined using the `addTool` function with a schema that includes validation, execution logic, and model-facing function descriptions.

![Mermaid Diagram](./diagrams\23_Building_Multi-Agent_Systems_0.svg)

**Tool Registration Flow**

Sources: [src/functions/setup/addAgent.ts:1-47](), [README.md:67-89]()

### Completion Definition

Completions define AI model integrations that agents use for generating responses. The `addCompletion` function registers completion providers with their configuration.

![Mermaid Diagram](./diagrams\23_Building_Multi-Agent_Systems_1.svg)

**Completion Provider Integration**

Sources: [README.md:93-102](), [src/lib/services/base/DocService.ts:398-403]()

### Agent Schema Structure

Agents are defined using `addAgent` with an `IAgentSchema` that specifies their behavior, capabilities, and dependencies. The schema is processed through `mapAgentSchema` to normalize system prompts into arrays.

![Mermaid Diagram](./diagrams\23_Building_Multi-Agent_Systems_2.svg)

**Agent Schema Transformation**

Sources: [src/helpers/mapAgentSchema.ts:31-87](), [src/functions/setup/addAgent.ts:12-27]()

## Agent Configuration Patterns

### Basic Agent Definition

The simplest agent configuration requires only a name, completion provider, and prompt:

| Property | Type | Description |
|----------|------|-------------|
| `agentName` | `string` | Unique identifier for the agent |
| `completion` | `CompletionName` | Reference to registered completion provider |
| `prompt` | `string` | Main instructions for the agent |

### Enhanced Agent Configuration

More sophisticated agents can include tools, storage, state management, and system prompts:

![Mermaid Diagram](./diagrams\23_Building_Multi-Agent_Systems_3.svg)

**Agent Configuration Components**

Sources: [src/lib/services/base/DocService.ts:358-448](), [src/interfaces/Agent.interface.ts]()

### System Prompt Configuration

Agents support multiple types of system prompts that are processed in a specific order:

1. **Static System Prompts** (`systemStatic`) - Fixed instructions added to every conversation
2. **Dynamic System Prompts** (`systemDynamic`) - Context-aware instructions generated at runtime
3. **Regular System Prompts** (`system`) - Standard system-level instructions

Sources: [src/helpers/mapAgentSchema.ts:52-85](), [src/lib/services/base/DocService.ts:449-480]()

## Swarm Orchestration

### Swarm Definition

Swarms coordinate multiple agents and define navigation patterns between them. The `addSwarm` function creates swarm configurations with agent lists and default routing.

![Mermaid Diagram](./diagrams\23_Building_Multi-Agent_Systems_4.svg)

**Swarm Schema Structure**

### Navigation Between Agents

Agent navigation within swarms is typically implemented through specialized navigation tools that call `changeAgent` to transfer control between agents:

![Mermaid Diagram](./diagrams\23_Building_Multi-Agent_Systems_5.svg)

**Agent Navigation Flow**

Sources: [README.md:67-89](), [README.md:125-129](), [src/functions/target/fork.ts:98-103]()

## Session Management

### Session Creation

Sessions are created using the `session` function, which establishes a connection between a client and a swarm, returning methods for message processing and resource cleanup.

![Mermaid Diagram](./diagrams\23_Building_Multi-Agent_Systems_6.svg)

**Session Lifecycle Management**

### Message Processing

The `complete` function processes user messages through the active agent in the swarm, handling tool calls, model interactions, and response generation:

| Component | Responsibility |
|-----------|---------------|
| `ClientSession` | Message routing and history management |
| `ClientAgent` | AI model interaction and tool execution |
| `ClientSwarm` | Agent navigation and swarm coordination |

Sources: [README.md:133-149](), [src/functions/target/fork.ts:47-88]()

## Advanced Orchestration Patterns

### Schema Override with `overrideAgent`

The `overrideAgent` function allows temporary modification of agent schemas during execution, useful for testing and dynamic behavior adjustment:

![Mermaid Diagram](./diagrams\23_Building_Multi-Agent_Systems_7.svg)

**Agent Schema Override Process**

Sources: [src/functions/test/overrideAgent.ts:16-55]()

### Background Processing with `fork`

The `fork` function enables isolated agent execution similar to POSIX fork, allowing complex processing without interfering with main conversation flows:

![Mermaid Diagram](./diagrams\23_Building_Multi-Agent_Systems_8.svg)

**Fork-based Background Processing**

### Scoped Execution

The framework provides scoped execution contexts that allow temporary configuration changes and isolated processing environments.

Sources: [src/functions/target/fork.ts:90-103](), [README.md:357-413]()

## Documentation Generation

### Automatic Schema Documentation

The `DocService` automatically generates Markdown documentation for all agents and swarms, including UML diagrams and comprehensive schema details:

![Mermaid Diagram](./diagrams\23_Building_Multi-Agent_Systems_9.svg)

**Documentation Generation Pipeline**

The documentation includes tool parameters, system prompts, dependencies, and MCP integrations, providing comprehensive reference material for development teams.

Sources: [src/lib/services/base/DocService.ts:810-851](), [src/cli/dumpDocs.ts:14-51]()

## Validation and Error Handling

The framework includes comprehensive validation services that ensure schema consistency and runtime safety:

| Validation Service | Purpose |
|-------------------|---------|
| `AgentValidationService` | Agent schema and dependency validation |
| `SwarmValidationService` | Swarm configuration and agent list validation |
| `SessionValidationService` | Session state and lifecycle validation |
| `ToolValidationService` | Tool schema and execution validation |

Multi-agent systems benefit from the framework's automatic model recovery, which handles invalid outputs and tool call failures through rescue algorithms and fallback responses.

Sources: [src/lib/services/base/DocService.ts:86-98](), [README.md:352-353]()