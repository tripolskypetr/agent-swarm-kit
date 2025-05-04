---
title: docs/api-reference/interface/IMCPCallbacks
group: docs
---

# IMCPCallbacks

Interface for MCP callback functions triggered during various lifecycle events.

## Methods

### onInit

```ts
onInit: () => void
```

Called when the MCP is initialized.

### onDispose

```ts
onDispose: (clientId: string) => void
```

Called when the MCP resources for a client are disposed.

### onFetch

```ts
onFetch: (clientId: string) => void
```

Called when tools are fetched for a client.

### onList

```ts
onList: (clientId: string) => void
```

Called when listing tools for a client.

### onCall

```ts
onCall: <T extends MCPToolValue = { [x: string]: unknown; }>(toolName: string, dto: IMCPToolCallDto<T>) => void
```

Called when a tool is invoked.

### onUpdate

```ts
onUpdate: (mcpName: string, clientId: string) => void
```

Called when the list of tools is updated.
