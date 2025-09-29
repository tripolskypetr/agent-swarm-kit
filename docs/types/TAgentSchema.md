---
title: docs/api-reference/type/TAgentSchema
group: docs
---

# TAgentSchema

```ts
type TAgentSchema = {
    agentName: IAgentSchema["agentName"];
} & Partial<IAgentSchema>;
```

Type representing a partial agent schema with required agentName.
Used for overriding existing agent configurations with selective updates.
Combines required agent name with optional agent properties.
