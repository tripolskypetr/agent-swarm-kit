---
title: docs/api-reference/function/runStatelessForce
group: docs
---

# runStatelessForce

```ts
declare function runStatelessForce(content: string, clientId: string): Promise<string>;
```

Executes a message statelessly with the active agent in a swarm session, bypassing chat history and forcing execution regardless of agent activity.

This function processes a command or message using the active agent without appending it to the chat history, designed to prevent model history
overflow when handling storage output or one-off tasks. Unlike `runStateless`, it does not check if the agent is currently active, ensuring execution
even if the agent has changed or is inactive. It validates the session and swarm, executes the content with performance tracking and event bus
notifications, and is wrapped in `beginContext` for a clean environment and `ExecutionContextService` for metadata tracking.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `content` | The content or command to be executed statelessly by the active agent. |
| `clientId` | The unique identifier of the client session requesting the execution. |
