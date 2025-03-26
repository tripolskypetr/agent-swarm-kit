---
title: docs/api-reference/interface/IAgentSchemaCallbacks
group: docs
---

# IAgentSchemaCallbacks

Interface representing lifecycle callbacks for an agent.
Provides hooks for various stages of agent execution and interaction.

## Properties

### onRun

```ts
onRun: (clientId: string, agentName: string, input: string) => void
```

Optional callback triggered when the agent runs statelessly (without history updates).

### onExecute

```ts
onExecute: (clientId: string, agentName: string, input: string, mode: ExecutionMode) => void
```

Optional callback triggered when the agent begins execution.

### onToolOutput

```ts
onToolOutput: (toolId: string, clientId: string, agentName: string, content: string) => void
```

Optional callback triggered when a tool produces output.

### onSystemMessage

```ts
onSystemMessage: (clientId: string, agentName: string, message: string) => void
```

Optional callback triggered when a system message is generated.

### onAssistantMessage

```ts
onAssistantMessage: (clientId: string, agentName: string, message: string) => void
```

Optional callback triggered when an assistant message is committed.

### onUserMessage

```ts
onUserMessage: (clientId: string, agentName: string, message: string) => void
```

Optional callback triggered when a user message is received.

### onFlush

```ts
onFlush: (clientId: string, agentName: string) => void
```

Optional callback triggered when the agent's history is flushed.

### onOutput

```ts
onOutput: (clientId: string, agentName: string, output: string) => void
```

Optional callback triggered when the agent produces output.

### onResurrect

```ts
onResurrect: (clientId: string, agentName: string, mode: ExecutionMode, reason?: string) => void
```

Optional callback triggered when the agent is resurrected after a pause or failure.

### onInit

```ts
onInit: (clientId: string, agentName: string) => void
```

Optional callback triggered when the agent is initialized.

### onDispose

```ts
onDispose: (clientId: string, agentName: string) => void
```

Optional callback triggered when the agent is disposed of.

### onAfterToolCalls

```ts
onAfterToolCalls: (clientId: string, agentName: string, toolCalls: IToolCall[]) => void
```

Optional callback triggered after all tool calls in a sequence are completed.
