---
title: docs/api-reference/function/getAgentName
group: docs
---

# getAgentName

```ts
declare function getAgentName(clientId: string): Promise<string>;
```

Retrieves the name of the active agent for a given client session in a swarm.

This function fetches the name of the currently active agent associated with the specified client session within a swarm.
It validates the client session and swarm, logs the operation if enabled, and delegates the retrieval to the swarm public service.
The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The unique identifier of the client session. |
