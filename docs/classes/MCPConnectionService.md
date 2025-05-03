---
title: docs/api-reference/class/MCPConnectionService
group: docs
---

# MCPConnectionService

Implements `IMCP`

Service class for managing MCP (Model Context Protocol) connections and operations.
Implements the IMCP interface to handle tool listing, checking, calling, and disposal.

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

### busService

```ts
busService: any
```

Injected BusService for communication or event handling.

### methodContextService

```ts
methodContextService: any
```

Injected MethodContextService for accessing method context information.

### mcpSchemaService

```ts
mcpSchemaService: any
```

Injected MCPSchemaService for managing MCP schemas.

### getMCP

```ts
getMCP: ((mcpName: string) => ClientMCP) & IClearableMemoize<string> & IControlMemoize<string, ClientMCP>
```

Memoized function to retrieve or create an MCP instance for a given MCP name.

### dispose

```ts
dispose: (clientId: string) => Promise<void>
```

Disposes of resources associated with a client, clearing cached MCP instances.

## Methods

### listTools

```ts
listTools(clientId: string): Promise<IMCPTool[]>;
```

Lists available tools for a given client.

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
