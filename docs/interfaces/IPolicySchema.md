# IPolicySchema

Interface for a policy schema.

## Properties

### docDescription

```ts
docDescription: string
```

The description for documentation

### policyName

```ts
policyName: string
```

The name of the policy

### banMessage

```ts
banMessage: string
```

The message to display when a client is banned

### autoBan

```ts
autoBan: boolean
```

Ban immediately after failed validation

### getBanMessage

```ts
getBanMessage: (clientId: string, policyName: string, swarmName: string) => string | Promise<string>
```

Gets the ban message for a client.

### getBannedClients

```ts
getBannedClients: (policyName: string, swarmName: string) => string[] | Promise<string[]>
```

Gets the list of banned clients.

### setBannedClients

```ts
setBannedClients: (clientIds: string[], policyName: string, swarmName: string) => void | Promise<void>
```

Sets the list of banned clients.

### validateInput

```ts
validateInput: (incoming: string, clientId: string, policyName: string, swarmName: string) => boolean | Promise<boolean>
```

Validates the input.

### validateOutput

```ts
validateOutput: (outgoing: string, clientId: string, policyName: string, swarmName: string) => boolean | Promise<boolean>
```

Validates the output.

### callbacks

```ts
callbacks: IPolicyCallbacks
```

The callbacks for the policy
