---
title: docs/api-reference/interface/IBusEvent
group: docs
---

# IBusEvent

Interface representing a structured event for the internal bus in the swarm system.
Extends IBaseEvent with a specific schema, used extensively in ClientAgent’s bus.emit calls (e.g., "run", "commit-user-message") to notify the system of actions, outputs, or state changes.
Dispatched via IBus.emit&lt;IBusEvent&gt; to broadcast detailed, agent-driven events with input/output data and context.

## Properties

### source

```ts
source: EventBusSource
```

The specific source of the event, restricted to EventBusSource values.
Identifies the component emitting the event, consistently "agent-bus" in ClientAgent (e.g., RUN_FN, _emitOutput), with other values for other buses (e.g., "history-bus").
Example: "agent-bus" for an agent’s "emit-output" event.

### type

```ts
type: string
```

The type of the event, defining its purpose or action.
A string identifier unique to the event’s intent, observed in ClientAgent as "run", "emit-output", "commit-user-message", etc.
Example: "commit-tool-output" for a tool execution result.

### input

```ts
input: Record<string, any>
```

The input data for the event, as a key-value object.
Carries event-specific input (e.g., { message } in "commit-user-message", { mode, rawResult } in "emit-output" from ClientAgent), often tied to ISwarmMessage content.
Example: { toolId: "tool-xyz", content: "result" } for a tool output event.

### output

```ts
output: Record<string, any>
```

The output data for the event, as a key-value object.
Contains event-specific results (e.g., { result } in "run" or "emit-output" from ClientAgent), often empty {} for notifications (e.g., "commit-flush").
Example: { result: "processed data" } for an execution output.

### context

```ts
context: Partial<IBusEventContext>
```

The contextual metadata for the event, partially implementing IBusEventContext.
Typically includes only agentName in ClientAgent (e.g., { agentName: this.params.agentName }), with other fields optional for broader use cases.
Example: { agentName: "Agent1" } for an agent-driven event.
