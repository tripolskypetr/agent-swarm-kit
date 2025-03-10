# ClientPolicy

Implements `IPolicy`

Class representing a client policy.

## Constructor

```ts
constructor(params: IPolicyParams);
```

## Properties

### params

```ts
params: IPolicyParams
```

### _banSet

```ts
_banSet: Set<string> | unique symbol
```

## Methods

### hasBan

```ts
hasBan(clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
```

Check if client is banned

### getBanMessage

```ts
getBanMessage(clientId: SessionId, swarmName: SwarmName): Promise<string>;
```

Gets the ban message for a client.

### validateInput

```ts
validateInput(incoming: string, clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
```

Validates the input from a client.

### validateOutput

```ts
validateOutput(outgoing: string, clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
```

Validates the output to a client.

### banClient

```ts
banClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;
```

Bans a client.

### unbanClient

```ts
unbanClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;
```

Unbans a client.
