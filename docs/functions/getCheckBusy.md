---
title: docs/api-reference/function/getCheckBusy
group: docs
---

# getCheckBusy

```ts
declare function getCheckBusy(clientId: string): Promise<boolean>;
```

Checks if the swarm associated with the given client ID is currently busy.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The unique identifier of the client whose swarm status is being checked. |
