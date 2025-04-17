---
title: docs/api-reference/type/TMCPSchema
group: docs
---

# TMCPSchema

```ts
type TMCPSchema = {
    mcpName: IMCPSchema["mcpName"];
} & Partial<IMCPSchema>;
```

Type definition for a partial MCP schema, requiring at least an mcpName.
