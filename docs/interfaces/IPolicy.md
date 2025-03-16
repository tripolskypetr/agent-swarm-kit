# IPolicy

Interface representing a policy enforcement mechanism.
Manages client bans and validates input/output messages within the swarm.

## Methods

### hasBan

```ts
hasBan: (clientId: string, swarmName: string) => Promise<boolean>
```

Checks if a client is currently banned under this policy.

### getBanMessage

```ts
getBanMessage: (clientId: string, swarmName: string) => Promise<string>
```

Retrieves the ban message for a banned client.

### validateInput

```ts
validateInput: (incoming: string, clientId: string, swarmName: string) => Promise<boolean>
```

Validates an incoming message against the policy rules.

### validateOutput

```ts
validateOutput: (outgoing: string, clientId: string, swarmName: string) => Promise<boolean>
```

Validates an outgoing message against the policy rules.

### banClient

```ts
banClient: (clientId: string, swarmName: string) => Promise<void>
```

Bans a client under this policy, adding them to the banned list.

### unbanClient

```ts
unbanClient: (clientId: string, swarmName: string) => Promise<void>
```

Unbans a client under this policy, removing them from the banned list.
