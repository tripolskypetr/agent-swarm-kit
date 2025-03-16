# IStateCallbacks

Interface representing callbacks for state lifecycle events.
Provides hooks for initialization, disposal, and state transitions.

## Properties

### onInit

```ts
onInit: (clientId: string, stateName: string) => void
```

Callback triggered when the state is initialized.
Useful for setup or logging.

### onDispose

```ts
onDispose: (clientId: string, stateName: string) => void
```

Callback triggered when the state is disposed of.
Useful for cleanup or logging.

### onLoad

```ts
onLoad: (state: T, clientId: string, stateName: string) => void
```

Callback triggered when the state is loaded from storage or initialized.

### onRead

```ts
onRead: (state: T, clientId: string, stateName: string) => void
```

Callback triggered when the state is read.
Useful for monitoring or logging read operations.

### onWrite

```ts
onWrite: (state: T, clientId: string, stateName: string) => void
```

Callback triggered when the state is written or updated.
Useful for tracking changes or triggering side effects.
