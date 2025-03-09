# PolicyConnectionService

Implements `IPolicy`

Service for managing policy connections.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### busService

```ts
busService: any
```

### methodContextService

```ts
methodContextService: any
```

### policySchemaService

```ts
policySchemaService: any
```

### getPolicy

```ts
getPolicy: ((policyName: string) => ClientPolicy) & IClearableMemoize<string> & IControlMemoize<string, ClientPolicy>
```

Retrieves a policy based on the policy name.

### getBanMessage

```ts
getBanMessage: (clientId: string, swarmName: string) => Promise<string>
```

Retrieves the ban message for a client in a swarm.

### validateInput

```ts
validateInput: (incoming: string, clientId: string, swarmName: string) => Promise<boolean>
```

Validates the input for a client in a swarm.

### validateOutput

```ts
validateOutput: (outgoing: string, clientId: string, swarmName: string) => Promise<boolean>
```

Validates the output for a client in a swarm.

### banClient

```ts
banClient: (clientId: string, swarmName: string) => Promise<void>
```

Bans a client from a swarm.

### unbanClient

```ts
unbanClient: (clientId: string, swarmName: string) => Promise<void>
```

Unbans a client from a swarm.
