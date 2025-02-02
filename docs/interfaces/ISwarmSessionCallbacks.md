# ISwarmSessionCallbacks

## Properties

### onConnect

```ts
onConnect: (clientId: string, swarmName: string) => void
```

Callback triggered when a client connects.

### onExecute

```ts
onExecute: (clientId: string, swarmName: string, content: string, mode: ExecutionMode) => void
```

Callback triggered when a command is executed.

### onEmit

```ts
onEmit: (clientId: string, swarmName: string, message: string) => void
```

Callback triggered when a message is emitted.

### onInit

```ts
onInit: (clientId: string, swarmName: string) => void
```

Callback triggered when a session being connected

### onDispose

```ts
onDispose: (clientId: string, swarmName: string) => void
```

Callback triggered when a session being disponnected
