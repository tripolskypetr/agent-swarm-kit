# IPolicy

Interface for a policy.

## Methods

### getBanMessage

```ts
getBanMessage: (clientId: string, swarmName: string) => Promise<string>
```

Gets the ban message for a client.

### validateInput

```ts
validateInput: (incoming: string, clientId: string, swarmName: string) => Promise<boolean>
```

Validates the input.

### validateOutput

```ts
validateOutput: (outgoing: string, clientId: string, swarmName: string) => Promise<boolean>
```

Validates the output.

### banClient

```ts
banClient: (clientId: string, swarmName: string) => Promise<void>
```

Bans a client.

### unbanClient

```ts
unbanClient: (clientId: string, swarmName: string) => Promise<void>
```

Unbans a client.
