---
title: docs/api-reference/interface/IAgentSchema
group: docs
---

# IAgentSchema

## Properties

### system

```ts
system: string | string[]
```

Optional array of system prompts, typically used for tool-calling protocols.

### systemStatic

```ts
systemStatic: string | string[]
```

Optional array of system prompts, alias for `system`

### systemDynamic

```ts
systemDynamic: (clientId: string, agentName: string) => string | string[] | Promise<string | string[]>
```

Optional dynamic array of system prompts from the callback
