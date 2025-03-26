---
title: docs/api-reference/interface/ISwarmSessionCallbacks
group: docs
---

# ISwarmSessionCallbacks

Interface representing callbacks for session-related events within a swarm.
Provides hooks for connection, execution, and emission events.

## Properties

### onConnect

```ts
onConnect: (clientId: string, swarmName: string) => void
```

Optional callback triggered when a client connects to the swarm.
Useful for logging or initialization tasks.

### onExecute

```ts
onExecute: (clientId: string, swarmName: string, content: string, mode: ExecutionMode) => void
```

Optional callback triggered when a command is executed within the swarm.

### onRun

```ts
onRun: (clientId: string, swarmName: string, content: string) => void
```

Optional callback triggered when a stateless completion run is executed.

### onEmit

```ts
onEmit: (clientId: string, swarmName: string, message: string) => void
```

Optional callback triggered when a message is emitted from the swarm.

### onInit

```ts
onInit: (clientId: string, swarmName: string) => void
```

Optional callback triggered when a session is initialized within the swarm.

### onDispose

```ts
onDispose: (clientId: string, swarmName: string) => void
```

Optional callback triggered when a session is disconnected or disposed of.
Note: "disponnected" in original comment corrected to "disconnected".
