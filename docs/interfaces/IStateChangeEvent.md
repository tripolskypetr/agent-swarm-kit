---
title: docs/api-reference/interface/IStateChangeEvent
group: docs
---

# IStateChangeEvent

Interface for handling state change events using a subject pattern.
Provides a subject to subscribe to state updates.

## Properties

### stateChanged

```ts
stateChanged: TSubject<string>
```

A subject that emits state names when changes occur, allowing subscribers to react to state updates.
Provides reactive state change notifications throughout the system.
