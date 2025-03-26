---
title: docs/api-reference/interface/IMetaNode
group: docs
---

# IMetaNode

Interface defining a metadata node structure for representing agent relationships and resources.
Used in AgentMetaService to build hierarchical trees for UML serialization, reflecting agent dependencies and attributes.

## Properties

### name

```ts
name: string
```

The name of the node, typically an agent name or resource identifier (e.g., AgentName, "States").

### child

```ts
child: IMetaNode[]
```

Optional array of child nodes, representing nested dependencies or resources (e.g., dependent agents, states).
