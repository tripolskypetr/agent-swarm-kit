---
title: docs/api-reference/function/runStateless
group: docs
---

# runStateless

```ts
declare function runStateless(content: string, clientId: string, agentName: AgentName): Promise<string>;
```

Executes a message statelessly with an agent in a swarm session, bypassing chat history.

This function processes a command or message using the specified agent without appending it to the chat history, designed to prevent
model history overflow when handling storage output or one-off tasks. It validates the agent, session, and swarm, checks if the specified
agent is still active, and executes the content with performance tracking and event bus notifications. The execution is wrapped in
`beginContext` for a clean environment and `ExecutionContextService` for metadata tracking. If the active agent has changed, the operation
is skipped, returning an empty string.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `content` | |
| `clientId` | |
| `agentName` | |
