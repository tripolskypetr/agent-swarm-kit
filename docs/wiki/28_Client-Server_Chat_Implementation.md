# Client-Server Chat Implementation

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/classes/Chat.ts](src/classes/Chat.ts)
- [src/functions/alias/addAgentNavigation.ts](src/functions/alias/addAgentNavigation.ts)
- [src/functions/alias/addTriageNavigation.ts](src/functions/alias/addTriageNavigation.ts)
- [src/template/createNavigateToAgent.ts](src/template/createNavigateToAgent.ts)
- [src/template/createNavigateToTriageAgent.ts](src/template/createNavigateToTriageAgent.ts)
- [test/index.mjs](test/index.mjs)
- [test/spec/completion.test.mjs](test/spec/completion.test.mjs)
- [test/spec/connection.test.mjs](test/spec/connection.test.mjs)
- [test/spec/dispose.test.mjs](test/spec/dispose.test.mjs)
- [test/spec/ignore.spec.mjs](test/spec/ignore.spec.mjs)
- [test/spec/navigation.test.mjs](test/spec/navigation.test.mjs)
- [test/spec/resque.test.mjs](test/spec/resque.test.mjs)
- [test/spec/validation.test.mjs](test/spec/validation.test.mjs)

</details>



This document provides a complete example of implementing client-server chat functionality using the agent-swarm-kit framework. It demonstrates session management, message processing, agent interactions, and handling multiple concurrent clients through the `Chat` utility class and related components.

For information about the underlying session and agent execution mechanisms, see [Session and Chat Management](#2.3). For details about agent navigation patterns used in chat implementations, see [Navigation System](#2.7).

## Overview

The client-server chat implementation in agent-swarm-kit centers around the `Chat` utility class and `ChatInstance` objects that manage individual client sessions. This system provides automatic session lifecycle management, inactivity timeouts, and seamless integration with the swarm's agent execution engine.

![Mermaid Diagram](./diagrams\28_Client-Server_Chat_Implementation_0.svg)

Sources: [src/classes/Chat.ts:1-429]()

## Core Chat Components

### ChatInstance Class

The `ChatInstance` class manages individual client chat sessions with automatic lifecycle management and inactivity tracking.

| Component | Purpose | Key Methods |
|-----------|---------|-------------|
| `ChatInstance` | Individual session management | `beginChat()`, `sendMessage()`, `dispose()` |
| `ChatUtils` | Multi-client orchestration | `beginChat()`, `sendMessage()`, `listenDispose()` |
| Session Integration | Swarm execution bridge | Internal `session()` wrapper |

The `ChatInstance` constructor creates a session connection and initializes callback handlers:

![Mermaid Diagram](./diagrams\28_Client-Server_Chat_Implementation_1.svg)

Sources: [src/classes/Chat.ts:151-184](), [src/classes/Chat.ts:300-319]()

### Session Lifecycle Management

The chat system implements automatic cleanup with configurable timeouts:

- **Inactivity Check Interval**: 60 seconds ([src/classes/Chat.ts:18]())
- **Inactivity Timeout**: 15 minutes ([src/classes/Chat.ts:20]())
- **Automatic Disposal**: Sessions exceeding timeout are disposed ([src/classes/Chat.ts:281-291]())

The `checkLastActivity` method determines if a session should be kept alive:

![Mermaid Diagram](./diagrams\28_Client-Server_Chat_Implementation_2.svg)

Sources: [src/classes/Chat.ts:191-206](), [src/classes/Chat.ts:239-249]()

## Message Processing Flow

### Basic Message Handling

The `sendMessage` method coordinates message processing through the swarm system:

![Mermaid Diagram](./diagrams\28_Client-Server_Chat_Implementation_3.svg)

Sources: [src/classes/Chat.ts:221-233]()

### Connection Patterns

The system supports multiple connection patterns for different use cases:

| Pattern | Function | Use Case |
|---------|----------|----------|
| Direct Chat | `Chat.sendMessage()` | Simple client-server messaging |
| Session-based | `session().complete()` | Stateful conversations |
| Connection-based | `makeConnection()` | Real-time bidirectional communication |

Sources: [test/spec/connection.test.mjs:190-320](), [test/spec/connection.test.mjs:322-411]()

## Complete Implementation Example

### Setting Up Agents and Swarm

First, define the completion logic, agents, and tools:

```typescript
// Example from test files showing typical setup
const MOCK_COMPLETION = addCompletion({
  completionName: "chat-completion",
  getCompletion: async ({ agentName, messages }) => {
    const [{ content }] = messages.slice(-1);
    return {
      agentName,
      role: "assistant",
      content: `Response from ${agentName}: ${content}`
    };
  }
});

const CHAT_AGENT = addAgent({
  agentName: "chat-agent",
  completion: MOCK_COMPLETION,
  prompt: "You are a helpful chat assistant",
  tools: ["navigation-tool"] // Optional navigation tools
});

const CHAT_SWARM = addSwarm({
  swarmName: "chat-swarm",
  agentList: [CHAT_AGENT],
  defaultAgent: CHAT_AGENT
});
```

Sources: [test/spec/connection.test.mjs:101-128](), [test/spec/connection.test.mjs:130-155]()

### Basic Chat Implementation

Using the `Chat` utility for simple messaging:

```typescript
// Send messages through the chat system
const clientId = "user-123";
const swarmName = "chat-swarm";

// Begin chat session
await Chat.beginChat(clientId, swarmName);

// Send messages
const response1 = await Chat.sendMessage(clientId, "Hello!", swarmName);
const response2 = await Chat.sendMessage(clientId, "How are you?", swarmName);

// Listen for disposal events
Chat.listenDispose(clientId, swarmName, (disposedClientId) => {
  console.log(`Session ${disposedClientId} was disposed`);
});
```

Sources: [src/classes/Chat.ts:347-384](), [src/classes/Chat.ts:393-404]()

### Real-time Connection Pattern

For bidirectional communication with server-side message emission:

```typescript
// Create connection with message handler
const complete = makeConnection(
  (message) => {
    // Handle outgoing messages to client
    console.log("Outgoing:", message);
  },
  clientId,
  swarmName
);

// Send messages from client
await complete("User message");

// Server can emit messages independently
await emit("Server notification", clientId);
```

Sources: [test/spec/connection.test.mjs:365-384](), [test/spec/connection.test.mjs:445-472]()

## Agent Navigation in Chat

### Navigation Tool Integration

Chat sessions support agent navigation through specialized tools. The system provides templates for common navigation patterns:

![Mermaid Diagram](./diagrams\28_Client-Server_Chat_Implementation_4.svg)

### Navigation Tool Example

Creating navigation tools using the provided templates:

```typescript
// Using createNavigateToAgent template
const navigateToSales = createNavigateToAgent({
  toolOutput: "Successfully navigated to sales agent",
  executeMessage: (clientId, lastMessage, agentName) => 
    `Processing sales inquiry: ${lastMessage}`,
  beforeNavigate: async (clientId, lastMessage, lastAgent, targetAgent) => {
    console.log(`Navigating from ${lastAgent} to ${targetAgent}`);
  }
});

// Tool implementation
const SALES_NAVIGATION_TOOL = addTool({
  toolName: "navigate-to-sales",
  call: async ({ toolId, clientId }) => {
    await navigateToSales(toolId, clientId, "sales-agent");
  },
  // ... tool schema definition
});
```

Sources: [src/template/createNavigateToAgent.ts:118-192](), [test/spec/navigation.test.mjs:80-96]()

## Advanced Chat Patterns

### Concurrent Session Management

The chat system handles multiple concurrent sessions with proper isolation:

![Mermaid Diagram](./diagrams\28_Client-Server_Chat_Implementation_5.svg)

Sources: [src/classes/Chat.ts:277-318](), [test/spec/connection.test.mjs:74-188]()

### Custom Chat Adapters

The system supports custom chat implementations through the adapter pattern:

```typescript
// Custom ChatInstance implementation
class CustomChatInstance implements IChatInstance {
  async beginChat() { /* custom logic */ }
  async sendMessage(content: string) { /* custom logic */ }
  async dispose() { /* custom logic */ }
  // ... other required methods
}

// Register custom adapter
Chat.useChatAdapter(CustomChatInstance);

// Set custom callbacks
Chat.useChatCallbacks({
  onBeginChat: (clientId, swarmName) => {
    console.log(`Chat began for ${clientId} on ${swarmName}`);
  },
  onSendMessage: (clientId, swarmName, content) => {
    console.log(`Message sent: ${content}`);
  },
  onDispose: (clientId, swarmName, instance) => {
    console.log(`Chat disposed for ${clientId}`);
  }
});
```

Sources: [src/classes/Chat.ts:325-339](), [src/classes/Chat.ts:81-115]()

### Event-Driven Communication

Chat sessions integrate with the event system for advanced communication patterns:

```typescript
// Listen for custom events in chat context
listenEvent(clientId, "custom-event", async (data) => {
  console.log("Received custom event:", data);
});

// Emit events during chat session
await event(clientId, "notification", "Important update");

// Events don't appear in message history
const history = await getRawHistory(clientId);
// Only complete() messages appear in history, not events
```

Sources: [test/spec/connection.test.mjs:453-472](), [test/spec/connection.test.mjs:475-521]()

This client-server chat implementation provides a robust foundation for building conversational AI applications with automatic session management, concurrent client support, and seamless integration with the agent swarm execution engine.