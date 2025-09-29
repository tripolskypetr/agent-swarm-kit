---
title: docs/api-reference/function/markOnline
group: docs
---

# markOnline

```ts
declare function markOnline(clientId: string, swarmName: SwarmName): Promise<void>;
```

Marks a client as online in the specified swarm.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The unique identifier of the client session. |
| `swarmName` | The name of the swarm to operate on. |
