---
title: docs/api-reference/function/markOffline
group: docs
---

# markOffline

```ts
declare function markOffline(clientId: string, swarmName: SwarmName): Promise<void>;
```

Marks a client as offline in the specified swarm.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The unique identifier of the client to mark as offline. |
| `swarmName` | The name of the swarm where the client belongs. |
