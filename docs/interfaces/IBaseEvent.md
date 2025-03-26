---
title: docs/api-reference/interface/IBaseEvent
group: docs
---

# IBaseEvent

Interface representing the base structure of an event in the swarm system.
Defines the minimal required fields for all events, extended by IBusEvent and ICustomEvent for specific use cases, and used generically in IBus.emit&lt;T&gt;.
Provides a foundation for event-driven communication across components like agents, sessions, and swarms.

## Properties

### source

```ts
source: string
```

The source of the event, identifying its origin within the system.
A generic string (EventSource) in IBaseEvent, overridden by EventBusSource in IBusEvent (e.g., "agent-bus" in ClientAgent).
Example: "custom-source" for a basic event, or "agent-bus" in practice.

### clientId

```ts
clientId: string
```

The unique identifier of the client targeted by the event.
Matches the clientId used in runtime params (e.g., this.params.clientId in ClientAgent), ensuring events reach the intended session or agent instance.
Example: "client-123" for a user session receiving an "emit-output" event.
