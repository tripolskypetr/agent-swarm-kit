---
title: docs/api-reference/function/addState
group: docs
---

# addState

```ts
declare function addState<T extends unknown = any>(stateSchema: IStateSchema<T>): string;
```

Adds a new state to the state registry for use within the swarm system.

This function registers a new state, enabling the swarm to manage and utilize it for agent operations or shared data persistence.
Only states registered through this function are recognized by the swarm. If the state is marked as shared, it initializes a connection
to the shared state service and waits for its initialization. The execution is wrapped in `beginContext` to ensure it runs outside of
existing method and execution contexts, providing a clean execution environment. The function logs the operation if enabled and returns
the state's name upon successful registration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `stateSchema` | |
