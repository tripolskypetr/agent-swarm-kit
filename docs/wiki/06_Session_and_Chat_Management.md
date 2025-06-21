---
title: design/06_session_and_chat
group: design
---

# Session and Chat Management

Session and chat management provide the coordination layer between clients and agent swarms, handling message flow, policy enforcement, and resource lifecycle. The system operates at two levels: **chat instances** for high-level client interactions with automatic cleanup, and **sessions** for low-level execution contexts that orchestrate interactions between individual clients and specific swarms.

For information about individual agent execution within sessions, see [Client Agent](./04_Client_Agent.md). For swarm-level coordination across multiple agents, see [Swarm Management](./05_Swarm_Management.md).

## Chat Management Overview

Chat management provides a high-level abstraction over sessions with automatic lifecycle management, inactivity detection, and cleanup. The `ChatUtils` class manages multiple `ChatInstance` objects, each wrapping a session with timeout handling and callback support.

![Mermaid Diagram](./diagrams\6_Session_and_Chat_Management_0.svg)

The chat layer handles client lifecycle automatically through `beginChat`, `sendMessage`, and `dispose` operations, with configurable callbacks for monitoring chat events and custom chat adapters.

## Chat Instance Lifecycle

Chat instances manage their lifecycle automatically with inactivity detection and cleanup. The `ChatInstance` class wraps sessions with timeout handling, callback support, and automatic disposal based on activity patterns.

![Mermaid Diagram](./diagrams\6_Session_and_Chat_Management_2.svg)

The lifecycle includes automatic cleanup through `INACTIVITY_CHECK` (60 seconds) and `INACTIVITY_TIMEOUT` (15 minutes) constants, with callback hooks for monitoring chat state changes.

## Session Lifecycle

Sessions follow a managed lifecycle from creation through disposal, with automatic resource tracking and cleanup. The `SessionConnectionService` uses memoization to cache session instances, while validation services track active sessions for proper resource management.

![Mermaid Diagram](./diagrams\6_Session_and_Chat_Management_3.svg)

The lifecycle includes initialization callbacks, active message processing, and disposal with proper cleanup. Session validation services ensure that resources are properly tracked and prevent memory leaks in long-running applications.

## Message Processing Flow

Sessions handle bidirectional message flow with policy validation, agent execution, and event emission. The `emit` method sends messages to clients via swarms, while `execute` processes incoming messages through agents and returns responses.

![Mermaid Diagram](./diagrams\6_Session_and_Chat_Management_4.svg)

All message flows include policy validation checkpoints. When validation fails, sessions automatically substitute ban messages and log policy violations through the event system.

## Chat Configuration and Callbacks

Chat instances support extensive configuration through callbacks and custom adapters. The `IChatInstanceCallbacks` interface provides hooks for monitoring chat lifecycle events, while `IChatControl` enables custom chat implementations.

| Callback | Parameters | Purpose |
|----------|------------|---------|
| `onInit` | `clientId`, `swarmName`, `instance` | Called when chat instance is created |
| `onBeginChat` | `clientId`, `swarmName` | Called when chat session begins |
| `onSendMessage` | `clientId`, `swarmName`, `content` | Called when message is sent |
| `onCheckActivity` | `clientId`, `swarmName`, `isActive`, `lastActivity` | Called during inactivity checks |
| `onDispose` | `clientId`, `swarmName`, `instance` | Called when chat instance is disposed |

```typescript
// Example chat configuration
Chat.useChatCallbacks({
  onInit: (clientId, swarmName, instance) => {
    console.log(`Chat initialized for ${clientId} in ${swarmName}`);
  },
  onSendMessage: (clientId, swarmName, content) => {
    console.log(`Message sent: ${content}`);
  }
});

// Custom chat adapter
Chat.useChatAdapter(CustomChatInstance);
```

The `ChatUtils` class provides singleton access through the `Chat` export, enabling global configuration of chat behavior across the application.

## Session Parameters and Configuration

Sessions are configured through `ISessionParams` which combines schema definitions, runtime dependencies, and callback hooks. The parameter structure integrates swarm references, policy enforcement, logging, and event systems.

| Parameter | Type | Purpose |
|-----------|------|---------|
| `clientId` | `string` | Client identification and session scoping |
| `swarmName` | `SwarmName` | Target swarm for agent coordination |
| `swarm` | `ISwarm` | Swarm instance for agent access |
| `policy` | `IPolicy` | Message validation and enforcement |
| `logger` | `ILogger` | Operation logging and debugging |
| `bus` | `IBus` | Event emission and system communication |

The session schema extends `ISwarmSessionCallbacks` to provide lifecycle hooks for initialization, emission, execution, and disposal events. These callbacks enable custom behavior injection at key session lifecycle points.

## Integration with Agent Execution

Sessions coordinate agent execution through swarms, managing the handoff between session-level message processing and agent-level tool execution. The `execute` method delegates to swarm agents while maintaining session context and policy enforcement.

![Mermaid Diagram](./diagrams\6_Session_and_Chat_Management_5.svg)

Sessions maintain execution context across agent transitions, ensuring proper client identification and session state preservation during complex multi-agent workflows.

## Event System Integration

Sessions emit structured events through `BusService` for system monitoring, debugging, and integration. Events include execution tracking, message flow, and lifecycle state changes with contextual information.

The event structure follows the `IBusEvent` interface with source identification, input/output data, and session context:

```typescript
// Example session event emission
await this.params.bus.emit<IBusEvent>(this.params.clientId, {
  type: "emit",
  source: "session-bus", 
  input: { message },
  output: {},
  context: { swarmName: this.params.swarmName },
  clientId: this.params.clientId,
});
```

Event types include `"emit"`, `"execute"`, `"connect"`, and `"dispose"` with session-specific context for filtering and monitoring. The event system enables external systems to track session activity and implement custom analytics or logging.

## Resource Management and Disposal

Sessions implement comprehensive resource management with automatic cleanup, validation tracking, and memoization clearing. The disposal process ensures proper resource release and prevents memory leaks in long-running applications.

![Mermaid Diagram](./diagrams\6_Session_and_Chat_Management_6.svg)

The disposal process includes validation service cleanup, callback execution, and memoization clearing to ensure complete resource release. Sessions automatically handle cleanup of associated agents, histories, and event subscriptions.
