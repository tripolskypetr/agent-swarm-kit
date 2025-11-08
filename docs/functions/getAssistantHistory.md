---
title: docs/api-reference/function/getAssistantHistory
group: docs
---

# getAssistantHistory

```ts
declare function getAssistantHistory(clientId: string): Promise<ISwarmMessage<object>[]>;
```

Retrieves the assistant's history entries for a given client session.

This function fetches the raw history for a specified client using `getRawHistory` and filters it to include only entries where the role is
"assistant". It is wrapped in `beginContext` for a clean execution environment and logs the operation if enabled via `GLOBAL_CONFIG`. The result
is an array of history objects representing the assistant's contributions in the session.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The unique identifier of the client session. |
