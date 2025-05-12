---
title: docs/api-reference/function/getSessionContext
group: docs
---

# getSessionContext

```ts
declare function getSessionContext(): Promise<ISessionContext>;
```

Retrieves the session context for the current execution environment.

This function constructs and returns the session context, including the client ID, process ID, and available method and execution contexts.
It logs the operation if enabled, checks for active contexts using the `MethodContextService` and `ExecutionContextService`, and derives the client ID from either context if available.
Unlike other functions, it does not perform explicit validation or require a `clientId` parameter, as it relies on the current execution environment's state.
