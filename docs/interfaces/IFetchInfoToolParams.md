---
title: docs/api-reference/interface/IFetchInfoToolParams
group: docs
---

# IFetchInfoToolParams

Parameters for configuring fetch info tool.

## Properties

### toolName

```ts
toolName: string
```

The name of the tool to be created.

### description

```ts
description: string | ((clientId: string, agentName: string) => string | Promise<string>)
```

A description of the tool's functionality.

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
