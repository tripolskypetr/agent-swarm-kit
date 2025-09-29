---
title: docs/api-reference/function/getRawHistory
group: docs
---

# getRawHistory

```ts
declare function getRawHistory(clientId: string): Promise<IModelMessage<object>[]>;
```

Retrieves the raw, unmodified history for a given client session.

This function fetches the complete history associated with a client’s active agent in a swarm session, without any filtering or modifications.
It is wrapped in `beginContext` for a clean execution environment and logs the operation if enabled via `GLOBAL_CONFIG`. The function validates
the session and swarm, retrieves the current agent, and uses `historyPublicService.toArrayForRaw` to obtain the raw history as an array.
The result is a fresh copy of the history array.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The unique identifier of the client session. |
