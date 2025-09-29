---
title: docs/api-reference/interface/IStateChangeContract
group: docs
---

# IStateChangeContract

## Properties

### stateChanged

```ts
stateChanged: TSubject<string>
```

A subject that emits state names when changes occur, allowing subscribers to react to state updates.
Provides reactive state change notifications throughout the system.
