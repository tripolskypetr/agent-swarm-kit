---
title: docs/api-reference/interface/IMCP
group: docs
---

# IMCP

Interface for Model Context Protocol (MCP) operations.

## Methods

### listTools

```ts
listTools: (clientId: string) => Promise<IMCPTool<MCPToolProperties>[]>
```

Lists available tools for a given client.

### hasTool

```ts
hasTool: (toolName: string, clientId: string) => Promise<boolean>
```

Checks if a specific tool exists for a given client.

### callTool

```ts
callTool: <T extends MCPToolValue = { [x: string]: unknown; }>(toolName: string, dto: IMCPToolCallDto<T>) => Promise<void>
```

Calls a specific tool with the provided parameters.
