---
title: docs/api-reference/class/MCPValidationService
group: docs
---

# MCPValidationService

Service class for validating and managing MCP (Model Context Protocol) schemas.
Maintains a map of MCP schemas and provides methods to add and validate them.

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

### _mcpMap

```ts
_mcpMap: any
```

Internal map storing MCP schemas, keyed by MCP name.

### addMCP

```ts
addMCP: (mcpName: string, mcpSchema: IMCPSchema) => void
```

Adds a new MCP schema to the map.

### validate

```ts
validate: (mcpName: string, source: string) => void
```

Validates the existence of an MCP schema by its name.
