---
title: docs/api-reference/type/DispatchFn
group: docs
---

# DispatchFn

```ts
type DispatchFn<State extends IStateData = IStateData> = (prevState: State) => Promise<State>;
```

Type representing a dispatch function for updating the state in ClientState.
Takes the previous state and returns a promise resolving to the updated state.
