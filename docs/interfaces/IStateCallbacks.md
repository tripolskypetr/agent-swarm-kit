# IStateCallbacks

Callbacks for state lifecycle events.

## Properties

### onInit

```ts
onInit: (clientId: string, stateName: string) => void
```

Called when the state is initialized.

### onDispose

```ts
onDispose: (clientId: string, stateName: string) => void
```

Called when the state is disposed.

### onLoad

```ts
onLoad: (state: T, clientId: string, stateName: string) => void
```

Called when the state is loaded.

### onRead

```ts
onRead: (state: T, clientId: string, stateName: string) => void
```

Called when the state is read.

### onWrite

```ts
onWrite: (state: T, clientId: string, stateName: string) => void
```

Called when the state is written.
