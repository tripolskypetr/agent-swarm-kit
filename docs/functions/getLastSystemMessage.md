---
title: docs/api-reference/function/getLastSystemMessage
group: docs
---

# getLastSystemMessage

```ts
declare function getLastSystemMessage(clientId: string): Promise<string>;
```

Retrieves the content of the most recent system message from a client's session history.

This function fetches the raw history for a specified client using `getRawHistory` and finds the last entry where the role is "system".
It is wrapped in `beginContext` for a clean execution environment and logs the operation if enabled via `GLOBAL_CONFIG`. The result is the content
of the last system message as a string, or `null` if no system message exists in the history.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The unique identifier of the client session whose last system message is to be retrieved. |
