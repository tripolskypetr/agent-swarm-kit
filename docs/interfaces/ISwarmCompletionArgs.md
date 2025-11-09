---
title: docs/api-reference/interface/ISwarmCompletionArgs
group: docs
---

# ISwarmCompletionArgs

Interface representing the arguments for swarm (chat) completions.
Extends base completion args with swarm-specific fields for agent-based interactions.
Used for agent completions with tool support, client tracking, and multi-agent context.

## Properties

### agentName

```ts
agentName: string
```

The agent name (required).
Identifies the agent context for the completion.

### mode

```ts
mode: ExecutionMode
```

The source of the last message, indicating whether it originated from a tool or user.

### tools

```ts
tools: ITool[]
```

Optional array of tools available for this completion.
Enables the model to call functions and interact with external systems.
