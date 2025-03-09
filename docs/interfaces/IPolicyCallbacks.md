# IPolicyCallbacks

Interface for policy callbacks.

## Properties

### onInit

```ts
onInit: (policyName: string) => void
```

Called when the policy is initialized.

### onValidateInput

```ts
onValidateInput: (incoming: string, clientId: string, swarmName: string, policyName: string) => void
```

Called to validate the input.

### onValidateOutput

```ts
onValidateOutput: (outgoing: string, clientId: string, swarmName: string, policyName: string) => void
```

Called to validate the output.

### onBanClient

```ts
onBanClient: (clientId: string, swarmName: string, policyName: string) => void
```

Called when a client is banned.

### onUnbanClient

```ts
onUnbanClient: (clientId: string, swarmName: string, policyName: string) => void
```

Called when a client is unbanned.
