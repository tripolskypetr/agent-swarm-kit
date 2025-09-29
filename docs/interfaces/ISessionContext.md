---
title: docs/api-reference/interface/ISessionContext
group: docs
---

# ISessionContext

Represents the session context, encapsulating client, method, and execution metadata.

This interface defines the structure of the session context returned by `getSessionContext`, providing information about the client session,
the current method context (if available), and the execution context (if available) within the swarm system.

## Properties

### clientId

```ts
clientId: string
```

The unique identifier of the client session, or null if not available from either context.
Derived from either the method context or execution context.

### processId

```ts
processId: string
```

The unique identifier of the process, sourced from GLOBAL_CONFIG.CC_PROCESS_UUID.
Identifies the current swarm process instance.

### methodContext

```ts
methodContext: IMethodContext
```

The current method context, or null if no method context is active.
Provides access to method-specific metadata and client information.

### executionContext

```ts
executionContext: IExecutionContext
```

The current execution context, or null if no execution context is active.
Provides access to execution-specific metadata and state information.
