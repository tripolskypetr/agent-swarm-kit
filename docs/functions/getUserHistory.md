---
title: docs/api-reference/function/getUserHistory
group: docs
---

# getUserHistory

```ts
declare function getUserHistory(clientId: string): Promise<IModelMessage<object>[]>;
```

Retrieves the user-specific history entries for a given client session.

This function fetches the raw history for a specified client using `getRawHistory` and filters it to include only entries where both the role
and mode are "user". It is wrapped in `beginContext` for a clean execution environment and logs the operation if enabled via `GLOBAL_CONFIG`.
The result is an array of history objects representing the user’s contributions in the session.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The unique identifier of the client session. |
