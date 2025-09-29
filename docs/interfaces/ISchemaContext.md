---
title: docs/api-reference/interface/ISchemaContext
group: docs
---

# ISchemaContext

## Properties

### registry

```ts
registry: { agentSchemaService: ToolRegistry<Record<string, IAgentSchemaInternal>>; completionSchemaService: ToolRegistry<Record<string, ICompletionSchema>>; ... 10 more ...; outlineSchemaService: ToolRegistry<...>; }
```

A collection of registries for different schema types, each managing specific schema records.
Provides centralized access to all schema services within the swarm system.
