---
title: docs/api-reference/interface/INavigateToTriageParams
group: docs
---

# INavigateToTriageParams

Configuration parameters for creating a navigation handler to a triage agent.
Defines optional messages or functions to handle flush, execution, and tool output scenarios during navigation.

## Properties

### beforeNavigate

```ts
beforeNavigate: (clientId: string, lastMessage: string, lastAgent: string, defaultAgent: string) => void | Promise<void>
```

### lastMessage

```ts
lastMessage: (clientId: string, lastMessage: string, defaultAgent: string, lastAgent: string) => string | Promise<string>
```

### flushMessage

```ts
flushMessage: string | ((clientId: string, defaultAgent: string) => string | Promise<string>)
```

### executeMessage

```ts
executeMessage: string | ((clientId: string, defaultAgent: string) => string | Promise<string>)
```

### toolOutputAccept

```ts
toolOutputAccept: string | ((clientId: string, defaultAgent: string) => string | Promise<string>)
```

### toolOutputReject

```ts
toolOutputReject: string | ((clientId: string, defaultAgent: string) => string | Promise<string>)
```
