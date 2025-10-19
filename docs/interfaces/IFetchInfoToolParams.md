---
title: docs/api-reference/interface/IFetchInfoToolParams
group: docs
---

# IFetchInfoToolParams

Parameters for configuring fetch info tool (READ pattern).
Creates a tool that fetches and returns data to the AI without modifying system state.

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

### validateParams

```ts
validateParams: (dto: { clientId: string; agentName: string; toolCalls: IToolCall[]; params: T; }) => boolean | Promise<boolean>
```

Optional validation function that runs before fetchContent. Returns boolean (true if valid, false if invalid).
