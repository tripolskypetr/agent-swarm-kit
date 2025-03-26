---
title: docs/api-reference/interface/IPolicyParams
group: docs
---

# IPolicyParams

Interface representing the parameters required to initialize a policy.
Extends the policy schema with runtime dependencies and full callback support.

## Properties

### logger

```ts
logger: ILogger
```

The logger instance for recording policy-related activity and errors.

### bus

```ts
bus: IBus
```

The bus instance for event communication within the swarm.
