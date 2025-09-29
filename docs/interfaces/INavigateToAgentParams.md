---
title: docs/api-reference/interface/INavigateToAgentParams
group: docs
---

# INavigateToAgentParams

Configuration parameters for creating a navigation handler to a specific agent.
Defines optional messages or functions to handle flush, emission, execution, and tool output scenarios during navigation, incorporating the last user message where applicable.

## Properties

### beforeNavigate

```ts
beforeNavigate: (clientId: string, lastMessage: string, lastAgent: string, agentName: string) => void | Promise<void>
```

Optional callback function executed before navigation begins.
Allows for custom pre-navigation logic and validation.

### flushMessage

```ts
flushMessage: string | ((clientId: string, defaultAgent: string) => string | Promise<string>)
```

Optional message or function to emit after flushing the session.
Used when navigation cannot be completed and the session needs to be reset.

### toolOutput

```ts
toolOutput: string | ((clientId: string, lastAgent: string, agentName: string) => string | Promise<string>)
```

Optional message or function for tool output when navigation occurs.
Provides feedback about the navigation operation to the model.

### lastMessage

```ts
lastMessage: (clientId: string, lastMessage: string, lastAgent: string, agentName: string) => string | Promise<string>
```

Optional function to transform the last user message for navigation context.
Allows customization of how the previous message is processed.

### emitMessage

```ts
emitMessage: string | ((clientId: string, lastMessage: string, lastAgent: string, agentName: string) => string | Promise<string>)
```

Optional message or function to emit when navigation occurs without execution.
Used for navigation scenarios that only require message emission.

### executeMessage

```ts
executeMessage: string | ((clientId: string, lastMessage: string, lastAgent: string, agentName: string) => string | Promise<string>)
```

Optional message or function to execute when navigation occurs with execution.
Used to define what message should be executed on the target agent after navigation.
