---
title: docs/api-reference/function/getLastUserMessage
group: docs
---

# getLastUserMessage

```ts
declare function getLastUserMessage(clientId: string): Promise<string>;
```

Retrieves the content of the most recent user message from a client's session history.

This function fetches the raw history for a specified client using `getRawHistory` and finds the last entry where the role is "user" and the mode
is "user". It is wrapped in `beginContext` for a clean execution environment and logs the operation if enabled via `GLOBAL_CONFIG`. The result is
the content of the last user message as a string, or `null` if no matching user message exists in the history.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The unique identifier of the client session whose last user message is to be retrieved. |
