---
title: docs/api-reference/interface/IState
group: docs
---

# IState

Interface representing the runtime state management API.
Provides methods to get, set, and clear the state.

## Properties

### getState

```ts
getState: () => Promise<T>
```

Retrieves the current state value.
Applies any configured middleware or custom `getState` logic from the schema.

### setState

```ts
setState: (dispatchFn: (prevState: T) => Promise<T>) => Promise<T>
```

Updates the state using a dispatch function that computes the new state from the previous state.
Applies any configured middleware or custom `setState` logic from the schema.

### clearState

```ts
clearState: () => Promise<T>
```

Resets the state to its initial default value.
Reverts to the value provided by `getDefaultState` in the schema.
