# ISessionContext

Represents the session context, encapsulating client, method, and execution metadata.

This interface defines the structure of the session context returned by `getSessionContext`, providing information about the client session,
the current method context (if available), and the execution context (if available) within the swarm system.

## Properties

### clientId

```ts
clientId: string
```

### processId

```ts
processId: string
```

### methodContext

```ts
methodContext: IMethodContext
```

### executionContext

```ts
executionContext: IExecutionContext
```
