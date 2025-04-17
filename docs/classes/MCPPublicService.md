---
title: docs/api-reference/class/MCPPublicService
group: docs
---

# MCPPublicService

Implements `TMCPConnectionService`

Public service class for interacting with MCP (Model Context Protocol) operations.
Provides methods to list tools, check tool existence, call tools, and dispose resources,
executing operations within a specified context.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Injected LoggerService for logging operations.

### mcpConnectionService

```ts
mcpConnectionService: any
```

Injected MCPConnectionService for handling MCP operations.

### dispose

```ts
dispose: (methodName: string, clientId: string, mcpName: string) => Promise<void>
```

Disposes of resources associated with a client within a specified context.

## Methods

### listTools

```ts
listTools(methodName: string, clientId: string, mcpName: string): Promise<IMCPTool[]>;
```

Lists available tools for a given client within a specified context.

### hasTool

```ts
hasTool(methodName: string, clientId: string, mcpName: string, toolName: string): Promise<boolean>;
```

Checks if a specific tool exists for a given client within a specified context.

### callTool

```ts
callTool<T extends MCPToolValue = MCPToolValue>(methodName: string, clientId: string, mcpName: string, toolName: string, dto: IMCPToolCallDto<T>): Promise<void>;
```

Calls a specific tool with the provided parameters within a specified context.
