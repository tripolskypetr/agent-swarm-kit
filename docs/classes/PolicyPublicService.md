# PolicyPublicService

Implements `TPolicyConnectionService`

Service for handling public policy operations.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### policyConnectionService

```ts
policyConnectionService: any
```

### hasBan

```ts
hasBan: (swarmName: string, methodName: string, clientId: string, policyName: string) => Promise<boolean>
```

Check if has ban message

### getBanMessage

```ts
getBanMessage: (swarmName: string, methodName: string, clientId: string, policyName: string) => Promise<string>
```

Retrieves the ban message for a client in a specific swarm.

### validateInput

```ts
validateInput: (incoming: string, swarmName: string, methodName: string, clientId: string, policyName: string) => Promise<boolean>
```

Validates the input for a specific policy.

### validateOutput

```ts
validateOutput: (outgoing: string, swarmName: string, methodName: string, clientId: string, policyName: string) => Promise<boolean>
```

Validates the output for a specific policy.

### banClient

```ts
banClient: (swarmName: string, methodName: string, clientId: string, policyName: string) => Promise<void>
```

Bans a client from a specific swarm.

### unbanClient

```ts
unbanClient: (swarmName: string, methodName: string, clientId: string, policyName: string) => Promise<void>
```

Unbans a client from a specific swarm.
