---
title: docs/api-reference/interface/ICommitActionToolParams
group: docs
---

# ICommitActionToolParams

Parameters for configuring commit action tool.

## Properties

### toolName

```ts
toolName: string
```

The name of the tool to be created.

### description

```ts
description: string
```

A description of the tool's functionality.

### functionSchema

```ts
functionSchema: Omit<{ name: string; description: string; parameters: { type: string; required: string[]; properties: { [key: string]: { type: string; description: string; enum?: string[]; }; }; }; }, "name"> | ((clientId: string, agentName: string) => Omit<...> | Promise<...>)
```

Tool function schema defining parameters and their validation.

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

### validate

```ts
validate: (dto: { clientId: string; agentName: string; toolCalls: IToolCall[]; params: T; }) => boolean | Promise<boolean>
```

Optional custom validation function that runs before tool execution.
