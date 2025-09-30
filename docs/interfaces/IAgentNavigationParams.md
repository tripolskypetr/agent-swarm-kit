---
title: docs/api-reference/interface/IAgentNavigationParams
group: docs
---

# IAgentNavigationParams

Parameters for configuring agent navigation.

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

### navigateTo

```ts
navigateTo: string
```

The target agent to navigate to.

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
