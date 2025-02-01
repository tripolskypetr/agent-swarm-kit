# IMakeDisposeParams

Interface for the parameters of the makeAutoDispose function.

## Properties

### timeoutSeconds

```ts
timeoutSeconds: number
```

Timeout in seconds before auto-dispose is triggered.

### onDestroy

```ts
onDestroy: (clientId: string, swarmName: string) => void
```

Callback when session is closed
