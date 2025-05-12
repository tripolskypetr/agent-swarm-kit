---
title: docs/api-reference/function/getLastAssistantMessage
group: docs
---

# getLastAssistantMessage

```ts
declare function getLastAssistantMessage(clientId: string): Promise<string>;
```

Retrieves the content of the most recent assistant message from a client's session history.

This function fetches the raw history for a specified client using `getRawHistory` and finds the last entry where the role is "assistant".
It is wrapped in `beginContext` for a clean execution environment and logs the operation if enabled via `GLOBAL_CONFIG`. The result is the content
of the last assistant message as a string, or `null` if no assistant message exists in the history.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The unique identifier of the client session whose last assistant message is to be retrieved. |
