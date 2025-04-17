---
title: docs/api-reference/interface/IMCPTool
group: docs
---

# IMCPTool

Interface for an MCP tool, defining its name, description, and input schema.

## Properties

### name

```ts
name: string
```

Name of the tool.

### description

```ts
description: string
```

Optional description of the tool.

### inputSchema

```ts
inputSchema: { type: "object"; properties?: Properties; required?: string[]; }
```

Schema defining the input structure for the tool.
