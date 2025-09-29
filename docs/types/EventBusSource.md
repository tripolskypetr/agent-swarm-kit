---
title: docs/api-reference/type/EventBusSource
group: docs
---

# EventBusSource

```ts
type EventBusSource = "agent-bus" | "history-bus" | "session-bus" | "state-bus" | "storage-bus" | "swarm-bus" | "execution-bus" | "policy-bus" | "compute-bus";
```

Type representing specific sources of events for the internal bus in the swarm system.
Enumerates predefined origins for IBusEvent.source, observed as "agent-bus" in ClientAgent (e.g., bus.emit calls), with other values likely used in corresponding components (e.g., "history-bus" in IHistory).
