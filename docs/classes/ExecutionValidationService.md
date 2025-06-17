---
title: docs/api-reference/class/ExecutionValidationService
group: docs
---

# ExecutionValidationService

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### sessionValidationService

```ts
sessionValidationService: any
```

### getExecutionCount

```ts
getExecutionCount: ((clientId: string, swarmName: string) => { executionSet: Set<string>; executionIgnore: LimitedSet<string>; }) & IClearableMemoize<string> & IControlMemoize<...>
```

Retrieves a memoized set of execution IDs for a given client and swarm.

### incrementCount

```ts
incrementCount: (executionId: string, clientId: string) => void
```

Increments the execution count for a client and checks for excessive nested executions.

### decrementCount

```ts
decrementCount: (executionId: string, clientId: string, swarmName: string) => void
```

Resets the execution count for a client and swarm.

### flushCount

```ts
flushCount: (clientId: string, swarmName: string) => void
```

Clears all tracked execution IDs for a specific client and swarm.
This effectively resets the execution count for the given client and swarm context,
but does not remove the memoized entry itself.

### dispose

```ts
dispose: (clientId: string, swarmName: string) => void
```

Clears the memoized execution count for a specific client and swarm.
