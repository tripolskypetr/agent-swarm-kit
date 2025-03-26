---
title: docs/api-reference/interface/IMethodContext
group: docs
---

# IMethodContext

Interface defining the structure of method call context in the swarm system.
Represents metadata for tracking a specific method invocation, used across services like ClientAgent, PerfService, and LoggerService.

## Properties

### clientId

```ts
clientId: string
```

The unique identifier of the client session, tying to ClientAgent’s clientId and PerfService’s execution tracking.

### methodName

```ts
methodName: string
```

The name of the method being invoked, used in LoggerService (e.g., log method context) and PerfService (e.g., METHOD_NAME_COMPUTE_STATE).

### agentName

```ts
agentName: string
```

The name of the agent involved in the method call, sourced from Agent.interface, used in ClientAgent (e.g., agent-specific execution) and DocService (e.g., agent docs).

### swarmName

```ts
swarmName: string
```

The name of the swarm involved in the method call, sourced from Swarm.interface, used in PerfService (e.g., computeClientState) and DocService (e.g., swarm docs).

### storageName

```ts
storageName: string
```

The name of the storage resource involved, sourced from Storage.interface, used in ClientAgent (e.g., storage access) and DocService (e.g., storage docs).

### stateName

```ts
stateName: string
```

The name of the state resource involved, sourced from State.interface, used in PerfService (e.g., sessionState) and DocService (e.g., state docs).

### policyName

```ts
policyName: string
```

The name of the policy involved, sourced from Policy.interface, used in PerfService (e.g., policyBans) and DocService (e.g., policy docs).
