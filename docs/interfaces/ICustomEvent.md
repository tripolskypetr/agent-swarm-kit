---
title: docs/api-reference/interface/ICustomEvent
group: docs
---

# ICustomEvent

Interface representing a custom event with a flexible payload in the swarm system.
Extends IBaseEvent for generic event handling, allowing arbitrary data via payload, though not directly observed in ClientAgent (which uses IBusEvent).
Likely used for bespoke event scenarios outside the structured IBusEvent schema, dispatched via IBus.emit&lt;ICustomEvent&gt;.

## Properties

### payload

```ts
payload: T
```

The optional payload of the event, carrying custom data of any type.
Provides flexibility for event-specific information, unlike IBusEvent’s rigid input/output structure, potentially for user-defined events.
Example: { status: "complete", data: 42 } for a custom completion event.
