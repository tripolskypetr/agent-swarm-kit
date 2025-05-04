---
title: docs/api-reference/class/MCPUtils
group: docs
---

# MCPUtils

Utility class for managing MCP updates.
This class provides methods to update tools for all clients or a specific client.
It is used in the context of the MCP (Multi-Client Protocol) system.

## Constructor

```ts
constructor();
```

## Methods

### update

```ts
update(mcpName: MCPName, clientId?: string): Promise<void>;
```

Updates the list of tools for all clients or a specific client.
