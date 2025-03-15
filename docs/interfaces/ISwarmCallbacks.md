# ISwarmCallbacks

Interface representing lifecycle callbacks for an initialized swarm.
Extends session callbacks with agent-specific navigation events.

## Properties

### onAgentChanged

```ts
onAgentChanged: (clientId: string, agentName: string, swarmName: string) => Promise<void>
```

Callback triggered when the active agent changes within the swarm.
Useful for navigation tracking or state updates.
