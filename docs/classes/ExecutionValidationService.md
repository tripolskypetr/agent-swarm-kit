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
getExecutionCount: ((clientId: string, swarmName: string) => Set<string>) & IClearableMemoize<string> & IControlMemoize<string, Set<string>>
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

### dispose

```ts
dispose: (clientId: string, swarmName: string) => void
```

Clears the memoized execution count for a specific client and swarm.
