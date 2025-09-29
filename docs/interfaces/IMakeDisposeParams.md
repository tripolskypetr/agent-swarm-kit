---
title: docs/api-reference/interface/IMakeDisposeParams
group: docs
---

# IMakeDisposeParams

Interface for the parameters of the makeAutoDispose function.

## Properties

### timeoutSeconds

```ts
timeoutSeconds: number
```

### onDestroy

```ts
onDestroy: (clientId: string, swarmName: string) => void
```

Optional callback invoked when the session is closed.
Called after the auto-dispose mechanism triggers and the session is successfully disposed.
