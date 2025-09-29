---
title: docs/api-reference/type/EventSource
group: docs
---

# EventSource

```ts
type EventSource = string;
```

Type representing the possible sources of an event in the swarm system.
A generic string identifier for the event’s origin, used in IBaseEvent.source and overridden by EventBusSource in IBusEvent for specific bus-related sources.
Example: "custom-source" for a generic event, though typically refined by EventBusSource in practice.
