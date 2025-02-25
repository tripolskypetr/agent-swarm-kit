# ISwarm

Interface for a swarm.

## Methods

### cancelOutput

```ts
cancelOutput: () => Promise<void>
```

Will return empty string in waitForOutput

### waitForOutput

```ts
waitForOutput: () => Promise<string>
```

Waits for the output from the swarm.

### getAgentName

```ts
getAgentName: () => Promise<string>
```

Gets the name of the agent.

### getAgent

```ts
getAgent: () => Promise<IAgent>
```

Gets the agent instance.

### setAgentRef

```ts
setAgentRef: (agentName: string, agent: IAgent) => Promise<void>
```

Sets the reference to an agent.

### setAgentName

```ts
setAgentName: (agentName: string) => Promise<void>
```

Sets the name of the agent.
