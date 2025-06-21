# Model Context Protocol (MCP)

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/classes/MCP.ts](src/classes/MCP.ts)
- [src/client/ClientMCP.ts](src/client/ClientMCP.ts)
- [src/interfaces/MCP.interface.ts](src/interfaces/MCP.interface.ts)
- [src/lib/services/connection/MCPConnectionService.ts](src/lib/services/connection/MCPConnectionService.ts)
- [src/lib/services/public/MCPPublicService.ts](src/lib/services/public/MCPPublicService.ts)

</details>



The Model Context Protocol (MCP) system provides a standardized interface for managing external tools and integrating them with AI agents. It handles tool discovery, execution, and lifecycle management, enabling agents to dynamically access and use external functions through a unified protocol.

For information about tool integration patterns and best practices, see page 5.2. For details about agent tool execution, see page 2.1.

## Architecture Overview

The MCP system follows a layered architecture that separates tool definition, connection management, and execution logic.

### MCP System Architecture

![Mermaid Diagram](./diagrams\7_Model_Context_Protocol_MCP_0.svg)

Sources: [src/interfaces/MCP.interface.ts:1-194](), [src/classes/MCP.ts:1-311](), [src/client/ClientMCP.ts:1-167](), [src/lib/services/public/MCPPublicService.ts:1-245](), [src/lib/services/connection/MCPConnectionService.ts:1-154]()

## Core Components

### MCP Interface

The `IMCP` interface defines the core protocol for tool management:

| Method | Purpose | Parameters | Returns |
|--------|---------|------------|---------|
| `listTools` | Get available tools for client | `clientId: string` | `Promise<IMCPTool[]>` |
| `hasTool` | Check if tool exists | `toolName: string, clientId: string` | `Promise<boolean>` |
| `callTool` | Execute a tool | `toolName: string, dto: IMCPToolCallDto` | `Promise<MCPToolOutput>` |
| `updateToolsForAll` | Refresh all tool caches | None | `Promise<void>` |
| `updateToolsForClient` | Refresh client tool cache | `clientId: string` | `Promise<void>` |

Sources: [src/interfaces/MCP.interface.ts:66-104]()

### Tool Definition

Tools are defined using the `IMCPTool` interface, which specifies the tool's name, description, and input schema:

```typescript
interface IMCPTool {
  name: string;
  description?: string;
  inputSchema: {
    type: "object";
    properties?: MCPToolProperties;
    required?: string[];
  };
}
```

The `MCPToolProperties` type defines parameter schemas with validation rules including type constraints, enums, and descriptions.

Sources: [src/interfaces/MCP.interface.ts:48-61](), [src/interfaces/MCP.interface.ts:17-25]()

### Tool Call Data Transfer

Tool execution uses the `IMCPToolCallDto` interface to pass execution context:

| Field | Type | Purpose |
|-------|------|---------|
| `toolId` | `string` | Unique tool execution identifier |
| `clientId` | `string` | Client session identifier |
| `agentName` | `AgentName` | Executing agent name |
| `params` | `MCPToolValue` | Tool input parameters |
| `toolCalls` | `IToolCall[]` | Associated tool calls |
| `abortSignal` | `TAbortSignal` | Cancellation signal |
| `isLast` | `boolean` | Last tool in sequence flag |

Sources: [src/interfaces/MCP.interface.ts:29-45]()

## MCP Implementations

### ClientMCP

The `ClientMCP` class provides the primary implementation of the MCP protocol with caching and lifecycle management.

### MCP Implementation Flow

![Mermaid Diagram](./diagrams\7_Model_Context_Protocol_MCP_1.svg)

Sources: [src/client/ClientMCP.ts:14-164]()

The `ClientMCP` constructor initializes the MCP with parameters and triggers the `onInit` callback. Tools are fetched and cached using a memoized function keyed by client ID.

Sources: [src/client/ClientMCP.ts:19-30](), [src/client/ClientMCP.ts:37-50]()

### NoopMCP and MergeMCP

`NoopMCP` provides a no-operation implementation that returns empty results and throws errors on tool calls. It's used as a fallback when no MCP is configured.

`MergeMCP` combines multiple MCP instances, allowing tools from different sources to be accessed through a unified interface. It delegates operations to the appropriate MCP based on tool availability.

Sources: [src/classes/MCP.ts:21-113](), [src/classes/MCP.ts:115-260]()

## Service Layer Integration

### Connection Management

The `MCPConnectionService` manages MCP instances using memoization to ensure one instance per MCP name:

```typescript
public getMCP = memoize(
  ([mcpName]) => `${mcpName}`,
  (mcpName: MCPName) => {
    const schema = this.mcpSchemaService.get(mcpName);
    return new ClientMCP({
      mcpName,
      bus: this.busService,
      logger: this.loggerService,
      ...schema,
    });
  }
);
```

Sources: [src/lib/services/connection/MCPConnectionService.ts:41-52]()

### Public API

The `MCPPublicService` provides a context-aware public API that wraps MCP operations with method context tracking:

| Method | Purpose | Context Parameters |
|--------|---------|-------------------|
| `listTools` | List tools with context | `methodName, clientId, mcpName` |
| `updateToolsForAll` | Update all tools | `methodName, mcpName` |
| `updateToolsForClient` | Update client tools | `methodName, clientId, mcpName` |
| `hasTool` | Check tool existence | `methodName, clientId, mcpName, toolName` |
| `callTool` | Execute tool | `methodName, clientId, mcpName, toolName, dto` |

Sources: [src/lib/services/public/MCPPublicService.ts:45-209]()

## Tool Execution Flow

### Tool Call Processing

![Mermaid Diagram](./diagrams\7_Model_Context_Protocol_MCP_2.svg)

Sources: [src/classes/MCP.ts:227-271]()

When a tool returns a string output, it's automatically committed to the agent using `commitToolOutput`. If the tool call is marked as the last in a sequence (`dto.isLast`), the agent execution continues. Error handling stops tool execution and flushes the agent buffer.

Sources: [src/classes/MCP.ts:231-242](), [src/classes/MCP.ts:243-264]()

## Schema and Lifecycle Management

### MCP Schema Definition

MCPs are defined using the `IMCPSchema` interface which specifies the tool listing and calling functions:

```typescript
interface IMCPSchema {
  mcpName: MCPName;
  docDescription?: string;
  listTools: (clientId: string) => Promise<IMCPTool<unknown>[]>;
  callTool: <T extends MCPToolValue = MCPToolValue>(
    toolName: string,
    dto: IMCPToolCallDto<T>
  ) => Promise<MCPToolOutput>;
  callbacks?: Partial<IMCPCallbacks>;
}
```

Sources: [src/interfaces/MCP.interface.ts:149-177]()

### Lifecycle Callbacks

The `IMCPCallbacks` interface provides hooks for MCP lifecycle events:

| Callback | Trigger | Parameters |
|----------|---------|------------|
| `onInit` | MCP initialization | None |
| `onDispose` | Client resource cleanup | `clientId` |
| `onFetch` | Tool fetching | `clientId` |
| `onList` | Tool listing | `clientId` |
| `onCall` | Tool execution | `toolName, dto` |
| `onUpdate` | Tool cache update | `mcpName, clientId?` |

Sources: [src/interfaces/MCP.interface.ts:108-146]()

## Utility Functions

### MCPUtils

The `MCPUtils` class provides high-level utility functions for MCP management:

```typescript
export class MCPUtils {
  public async update(mcpName: MCPName, clientId?: string) {
    swarm.mcpValidationService.validate(mcpName, METHOD_NAME_UPDATE);
    if (clientId) {
      return await swarm.mcpPublicService.updateToolsForClient(
        METHOD_NAME_UPDATE, clientId, mcpName
      );
    }
    return await swarm.mcpPublicService.updateToolsForAll(
      METHOD_NAME_UPDATE, mcpName
    );
  }
}
```

The singleton `MCP` instance provides a convenient interface for updating MCP tool caches.

Sources: [src/classes/MCP.ts:279-305](), [src/classes/MCP.ts:308-311]()

## Integration with Agent System

MCPs integrate with the broader agent system through the dependency injection container and method context system. The `MethodContextService` provides execution context that includes MCP name, client ID, and agent name for proper tool routing and execution tracking.

Sources: [src/lib/services/public/MCPPublicService.ts:54-69](), [src/lib/services/connection/MCPConnectionService.ts:64-66]()