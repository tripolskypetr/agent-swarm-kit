---
title: docs/api-reference/interface/IMCPSchema
group: docs
---

# IMCPSchema

Interface for the MCP schema, defining the structure and behavior of an MCP.

## Properties

### mcpName

```ts
mcpName: string
```

Unique name of the MCP.

### docDescription

```ts
docDescription: string
```

Optional description of the MCP for documentation.

### listTools

```ts
listTools: (clientId: string) => Promise<IMCPTool<unknown>[]>
```

Function to list available tools for a client.

### callTool

```ts
callTool: <T extends MCPToolValue = { [x: string]: unknown; }>(toolName: string, dto: IMCPToolCallDto<T>) => Promise<MCPToolOutput>
```

Function to call a specific tool with the provided parameters.

### callbacks

```ts
callbacks: Partial<IMCPCallbacks>
```

Optional callbacks for MCP lifecycle events.
