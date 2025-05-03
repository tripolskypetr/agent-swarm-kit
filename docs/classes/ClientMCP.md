---
title: docs/api-reference/class/ClientMCP
group: docs
---

# ClientMCP

Implements `IMCP`

A client-side implementation of the IMCP interface for managing tools and their operations.

## Constructor

```ts
constructor(params: IMCPParams);
```

## Properties

### params

```ts
params: IMCPParams
```

### fetchTools

```ts
fetchTools: any
```

Memoized function to fetch and cache tools for a given client ID.

## Methods

### listTools

```ts
listTools(clientId: string): Promise<IMCPTool<MCPToolProperties>[]>;
```

Lists all available tools for a given client.

### hasTool

```ts
hasTool(toolName: string, clientId: string): Promise<boolean>;
```

Checks if a specific tool exists for a given client.

### callTool

```ts
callTool<T extends MCPToolValue = MCPToolValue>(toolName: string, dto: IMCPToolCallDto<T>): Promise<MCPToolOutput>;
```

Calls a specific tool with the provided parameters.

### dispose

```ts
dispose(clientId: string): void;
```

Disposes of resources associated with a client, clearing cached tools and invoking the dispose callback.
