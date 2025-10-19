---
title: docs/api-reference/interface/ICommitActionToolParams
group: docs
---

# ICommitActionToolParams

Parameters for configuring commit action tool (WRITE pattern).
Creates a tool that executes actions and modifies system state.

## Properties

### toolName

```ts
toolName: string
```

The name of the tool to be created.

### function

```ts
function: { name: string; description: string; parameters: { type: string; required: string[]; properties: { [key: string]: { type: string; description: string; enum?: string[]; }; }; }; } | ((clientId: string, agentName: string) => { ...; } | Promise<...>)
```

Tool function schema (name, description, parameters).

### docNote

```ts
docNote: string
```

Optional documentation note for the tool.

### isAvailable

```ts
isAvailable: (clientId: string, agentName: string, toolName: string) => boolean | Promise<boolean>
```

Optional function to determine if the tool is available.
