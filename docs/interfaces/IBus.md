---
title: docs/api-reference/interface/IBus
group: docs
---

# IBus

Interface representing an event bus for the swarm system.
Provides a mechanism for asynchronous, client-targeted event dispatching, primarily used by agents (e.g., ClientAgent) to broadcast operational updates, lifecycle changes, and outputs to the system.
Integrated into runtime parameters (e.g., IAgentParams, ISessionParams), the bus ensures decoupled communication between components, such as notifying clients of message commits, tool outputs, or execution results.

## Methods

### emit

```ts
emit: <T extends IBaseEvent>(clientId: string, event: T) => Promise<void>
```

Emits a structured event to a specific client within the swarm system.
Asynchronously dispatches events to the designated `clientId`, enabling agents to notify the system of actions like message commits, tool executions, or output emissions.
Events follow a consistent schema extending IBaseEvent, including `type` (event identifier), `source` (originator, typically "agent-bus"), `input` (input data), `output` (result data), `context` (metadata with agentName), and `clientId` (redundant target ID).

**Observed Behavior (from ClientAgent):**
- **Event Dispatch**: Events are emitted after significant actions, such as completing a stateless run (`"run"`), emitting validated output (`"emit-output"`), or committing messages/tools (`"commit-*"`).
- **Structure**: Every event includes a fixed set of fields, e.g.:
  ```javascript
  await this.params.bus.emit&lt;IBusEvent&gt;(this.params.clientId, {
    type: "commit-user-message",
    source: "agent-bus",
    input: { message },
    output: {},
    context: { agentName: this.params.agentName },
    clientId: this.params.clientId,
  });
  ```
  This notifies the system of a user message commit, with no output expected.
- **Asynchronous Delivery**: Returns a promise, implying events are queued or sent over a channel (e.g., network, in-memory queue), resolving when dispatched.
- **Client Targeting**: Always targets the client’s session ID (e.g., `this.params.clientId`), ensuring precise delivery to the intended recipient.
- **Notification Focus**: Primarily used for one-way notifications (e.g., history updates, tool stops), with `output` often empty unless carrying results (e.g., `"run"`, `"emit-output"`).

**Example Usage in ClientAgent:**
- **Stateless Completion**:
  ```javascript
  await this.params.bus.emit&lt;IBusEvent&gt;(this.params.clientId, {
    type: "run",
    source: "agent-bus",
    input: { message },
    output: { result },
    context: { agentName: this.params.agentName },
    clientId: this.params.clientId,
  });
  ```
  Signals a completed stateless run with the transformed result.
- **Output Emission**:
  ```javascript
  await this.params.bus.emit&lt;IBusEvent&gt;(this.params.clientId, {
    type: "emit-output",
    source: "agent-bus",
    input: { mode, rawResult },
    output: { result },
    context: { agentName: this.params.agentName },
    clientId: this.params.clientId,
  });
  ```
  Broadcasts the final output after validation.

**Key Characteristics:**
- **Redundancy**: The `clientId` in the event mirrors the emit target, aiding downstream filtering or validation.
- **Type Safety**: Generic `<T>` ensures events conform to IBaseEvent extensions (e.g., IBusEvent), supporting structured payloads.
- **Integration**: Paired with history updates (e.g., `history.push`) and callbacks (e.g., `onOutput`), amplifying system-wide awareness.
