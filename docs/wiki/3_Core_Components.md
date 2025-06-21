# Core Components

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [package-lock.json](package-lock.json)
- [package.json](package.json)
- [src/client/ClientAgent.ts](src/client/ClientAgent.ts)
- [src/client/ClientHistory.ts](src/client/ClientHistory.ts)
- [src/client/ClientSession.ts](src/client/ClientSession.ts)
- [src/config/params.ts](src/config/params.ts)
- [src/index.ts](src/index.ts)
- [src/interfaces/Agent.interface.ts](src/interfaces/Agent.interface.ts)
- [src/interfaces/Session.interface.ts](src/interfaces/Session.interface.ts)
- [src/lib/services/connection/AgentConnectionService.ts](src/lib/services/connection/AgentConnectionService.ts)
- [src/lib/services/connection/SessionConnectionService.ts](src/lib/services/connection/SessionConnectionService.ts)
- [src/lib/services/public/AgentPublicService.ts](src/lib/services/public/AgentPublicService.ts)
- [src/lib/services/public/SessionPublicService.ts](src/lib/services/public/SessionPublicService.ts)
- [src/model/GlobalConfig.model.ts](src/model/GlobalConfig.model.ts)
- [types.d.ts](types.d.ts)

</details>



This page covers the primary architectural components that implement the agent execution model, session management, and service infrastructure in the agent-swarm-kit system. For information about the public API functions like `addAgent`, `session`, and `complete`, see [Core API Functions](#7.1). For details about the dependency injection container and service layering, see [Service Architecture](#3).

## Agent Execution Engine

The agent execution engine consists of two primary components: `ClientAgent` for message processing and AI completion, and `ClientHistory` for conversation management.

### ClientAgent

`ClientAgent` is the core execution engine that processes incoming messages, executes tool calls, and generates AI completions. It implements the `IAgent` interface and serves as the primary orchestrator for agent behavior.

![Mermaid Diagram](./diagrams\3_Core_Components_0.svg)

**Key responsibilities:**
- **Message Execution**: Processes user and tool messages through `execute()` method
- **Stateless Completion**: Provides quick completions via `run()` method without history updates
- **Tool Orchestration**: Validates, executes, and manages tool calls with abort signal support
- **AI Integration**: Coordinates with completion services for model responses
- **Event Emission**: Broadcasts execution events through the bus system

The `ClientAgent` uses a queued execution model to prevent overlapping operations and maintains internal subjects for managing tool execution flow, agent changes, and output cancellation.

**Sources:** [src/client/ClientAgent.ts:1-1088](), [src/interfaces/Agent.interface.ts:1-500]()

### ClientHistory

`ClientHistory` manages conversation history for agents, providing filtered message arrays optimized for AI completion contexts and maintaining message persistence.

![Mermaid Diagram](./diagrams\3_Core_Components_1.svg)

**Key features:**
- **Message Filtering**: Applies agent-specific filters to scope relevant messages
- **Tool Call Consistency**: Links tool outputs to their corresponding tool calls
- **History Limits**: Enforces message count limits via `keepMessages` parameter
- **Persistence Integration**: Handles message storage and retrieval through history adapters
- **Event Broadcasting**: Emits history events for system monitoring

The history system supports both raw message access and agent-optimized arrays that include system prompts and maintain tool call relationships for proper AI completion context.

**Sources:** [src/client/ClientHistory.ts:1-270](), [src/interfaces/History.interface.ts:1-200]()

## Session Management

### ClientSession

`ClientSession` orchestrates communication between clients, agents, and swarms while enforcing policies and managing message flows. It implements the `ISession` interface and serves as the primary coordination layer.

![Mermaid Diagram](./diagrams\3_Core_Components_2.svg)

**Core capabilities:**
- **Message Execution**: Coordinates agent execution with policy validation
- **Policy Enforcement**: Validates input/output messages against configured policies
- **Communication Hub**: Manages message emission to swarms and notification channels
- **Agent Coordination**: Interfaces with swarm components to access and control agents
- **Event Integration**: Broadcasts session events for monitoring and logging

The session maintains separation between stateful execution (with history updates) and stateless completion, while ensuring all communications pass through policy validation layers.

**Sources:** [src/client/ClientSession.ts:1-400](), [src/interfaces/Session.interface.ts:1-194]()

## Service Infrastructure

The service infrastructure provides the foundation for component lifecycle management, dependency injection, and API exposure through a layered architecture.

### Connection Services

Connection services manage the instantiation and lifecycle of core components using memoization for efficient reuse.

![Mermaid Diagram](./diagrams\3_Core_Components_3.svg)

**Service responsibilities:**
- **AgentConnectionService**: Creates and manages `ClientAgent` instances with tool and completion dependencies
- **SessionConnectionService**: Instantiates `ClientSession` with swarm and policy configurations  
- **HistoryConnectionService**: Provides `ClientHistory` instances with storage adapters
- **SwarmConnectionService**: Manages `ClientSwarm` instances for agent navigation and coordination

Each connection service uses `memoize` from functools-kit to cache instances by composite keys, ensuring efficient resource usage and consistent state management.

**Sources:** [src/lib/services/connection/AgentConnectionService.ts:1-350](), [src/lib/services/connection/SessionConnectionService.ts:1-300]()

### Public Services

Public services provide the external API layer with context management and method scoping around connection services.

![Mermaid Diagram](./diagrams\3_Core_Components_4.svg)

**Public service features:**
- **Context Scoping**: Wraps all operations with `MethodContextService.runInContext()` for proper context management
- **Method Delegation**: Delegates core functionality to connection services while adding context and logging
- **Performance Tracking**: Integrates with `PerfService` for execution monitoring
- **Validation Integration**: Coordinates with validation services for operation safety
- **Event Broadcasting**: Ensures proper event emission through the bus system

The public services layer provides a clean separation between external API and internal component management while ensuring consistent context propagation throughout the system.

**Sources:** [src/lib/services/public/AgentPublicService.ts:1-500](), [src/lib/services/public/SessionPublicService.ts:1-600]()

## Component Integration

The core components work together through a well-defined integration pattern that ensures proper message flow, state management, and error handling.

![Mermaid Diagram](./diagrams\3_Core_Components_5.svg)

**Integration patterns:**
- **Layered Delegation**: Public services delegate to connection services which manage component instances
- **Context Propagation**: Method context flows through all layers ensuring proper scoping
- **Event Broadcasting**: Components emit events at each layer for monitoring and coordination
- **Resource Sharing**: Memoization ensures efficient reuse of expensive component instances
- **Error Propagation**: Errors bubble up through layers with proper context preservation

This architecture provides clear separation of concerns while maintaining efficient resource usage and proper state management across the entire system.

**Sources:** [src/lib/services/public/SessionPublicService.ts:200-300](), [src/client/ClientSession.ts:140-250](), [src/client/ClientAgent.ts:600-800]()