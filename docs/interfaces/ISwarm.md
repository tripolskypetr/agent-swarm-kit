---
title: docs/api-reference/interface/ISwarm
group: docs
---

# ISwarm

Interface representing a swarm of agents.
Provides methods for navigation, agent management, and output handling.

## Methods

### navigationPop

```ts
navigationPop: () => Promise<string>
```

Removes and returns the most recent agent from the navigation stack, or falls back to the default agent.

### cancelOutput

```ts
cancelOutput: () => Promise<void>
```

Cancels the current output operation, resulting in an empty string from waitForOutput.

### waitForOutput

```ts
waitForOutput: () => Promise<string>
```

Waits for and retrieves the output from the swarm’s active agent.

### getAgentName

```ts
getAgentName: () => Promise<string>
```

Retrieves the name of the currently active agent in the swarm.

### getAgent

```ts
getAgent: () => Promise<IAgent>
```

Retrieves the instance of the currently active agent in the swarm.

### setAgentRef

```ts
setAgentRef: (agentName: string, agent: IAgent) => Promise<void>
```

Registers or updates an agent reference in the swarm’s agent map.

### setAgentName

```ts
setAgentName: (agentName: string) => Promise<void>
```

Sets the active agent in the swarm by name, updating navigation if applicable.

### emit

```ts
emit: (message: string) => Promise<void>
```

Emits a message to the session's communication channel.

### getCheckBusy

```ts
getCheckBusy: () => Promise<boolean>
```

Returns the current busy state of the swarm.
Used to check if the swarm is currently processing an operation (e.g., waiting for output or switching agents).
Supports debugging and flow control in client applications.
