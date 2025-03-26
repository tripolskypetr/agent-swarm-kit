---
title: docs/api-reference/interface/IPersistPolicyData
group: docs
---

# IPersistPolicyData

Defines the structure for policy data persistence in the swarm system.
Tracks banned clients (`SessionId`) within a `SwarmName` under a specific policy.

## Properties

### bannedClients

```ts
bannedClients: string[]
```

Array of session IDs that are banned under this policy
