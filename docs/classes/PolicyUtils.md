---
title: docs/api-reference/class/PolicyUtils
group: docs
---

# PolicyUtils

Utility class providing methods to manage client bans within a swarm policy context.
All methods validate inputs and execute within a context for logging and tracking.

## Constructor

```ts
constructor();
```

## Properties

### banClient

```ts
banClient: (payload: { clientId: string; swarmName: string; policyName: string; }) => Promise<void>
```

Bans a client under a specific policy within a swarm.
Validates the client, swarm, and policy before delegating to the policy service.

### unbanClient

```ts
unbanClient: (payload: { clientId: string; swarmName: string; policyName: string; }) => Promise<void>
```

Unbans a client under a specific policy within a swarm.
Validates the client, swarm, and policy before delegating to the policy service.

### hasBan

```ts
hasBan: (payload: { clientId: string; swarmName: string; policyName: string; }) => Promise<boolean>
```

Checks if a client is banned under a specific policy within a swarm.
Validates the client, swarm, and policy before querying the policy service.
