---
title: docs/api-reference/type/TSwarmSchema
group: docs
---

# TSwarmSchema

```ts
type TSwarmSchema = {
    swarmName: ISwarmSchema["swarmName"];
} & Partial<ISwarmSchema>;
```

Type representing a partial swarm schema configuration.
Used for swarm configuration with optional properties.
