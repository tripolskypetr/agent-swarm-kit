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

Optional callback function executed before navigation begins.
Allows for custom pre-navigation logic and validation before changing to the default agent.

### lastMessage

```ts
lastMessage: (clientId: string, lastMessage: string, defaultAgent: string, lastAgent: string) => string | Promise<string>
```

Optional function to transform the last user message for navigation context.
Customizes how the previous message is processed when navigating to the triage agent.

### flushMessage

```ts
flushMessage: string | ((clientId: string, defaultAgent: string) => string | Promise<string>)
```

Optional message or function to emit after flushing the session.
Used when navigation cannot be completed and the session needs to be reset.

### executeMessage

```ts
executeMessage: string | ((clientId: string, defaultAgent: string) => string | Promise<string>)
```

Optional message or function to execute when no navigation is needed.
Used when already on the default agent and execution should continue.

### toolOutputAccept

```ts
toolOutputAccept: string | ((clientId: string, defaultAgent: string) => string | Promise<string>)
```

Optional message or function for tool output when navigation to the default agent occurs.
Provides feedback when successful navigation to the triage agent happens.

### toolOutputReject

```ts
toolOutputReject: string | ((clientId: string, defaultAgent: string) => string | Promise<string>)
```

Optional message or function for tool output when already on the default agent.
Used to inform the user that no navigation was needed since they're already on the target agent.
