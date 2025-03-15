# IPolicyCallbacks

Interface representing callbacks for policy lifecycle and validation events.
Provides hooks for initialization, validation, and ban actions.

## Properties

### onInit

```ts
onInit: (policyName: string) => void
```

Optional callback triggered when the policy is initialized.
Useful for setup or logging.

### onValidateInput

```ts
onValidateInput: (incoming: string, clientId: string, swarmName: string, policyName: string) => void
```

Optional callback triggered to validate incoming messages.
Useful for logging or monitoring input validation.

### onValidateOutput

```ts
onValidateOutput: (outgoing: string, clientId: string, swarmName: string, policyName: string) => void
```

Optional callback triggered to validate outgoing messages.
Useful for logging or monitoring output validation.

### onBanClient

```ts
onBanClient: (clientId: string, swarmName: string, policyName: string) => void
```

Optional callback triggered when a client is banned.
Useful for logging or triggering ban-related actions.

### onUnbanClient

```ts
onUnbanClient: (clientId: string, swarmName: string, policyName: string) => void
```

Optional callback triggered when a client is unbanned.
Useful for logging or triggering unban-related actions.
