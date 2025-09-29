---
title: docs/api-reference/interface/IScopeOptions
group: docs
---

# IScopeOptions

## Properties

### clientId

```ts
clientId: string
```

The client identifier for the scope operation.
Unique identifier used to track and manage the session within the scope.

### swarmName

```ts
swarmName: string
```

The name of the swarm associated with the scope.
Identifies which swarm configuration to use for the scoped operation.

### onError

```ts
onError: (error: Error) => void
```

Optional callback function to handle errors during execution.
Called when an error occurs during the scope operation, allowing for custom error handling.
