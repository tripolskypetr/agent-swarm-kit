---
title: docs/api-reference/function/hasSession
group: docs
---

# hasSession

```ts
declare function hasSession(clientId: string): boolean;
```

Checks if a session exists for the given client ID.

This function logs the method name if logging is enabled in the global configuration.
It then delegates the session validation to the `swarm.sessionValidationService`.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | |
