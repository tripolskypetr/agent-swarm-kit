# ClientPolicy

Implements `IPolicy`

Class representing a client policy for managing bans, input/output validation, and client restrictions.

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

Set of banned client IDs or a symbol indicating the ban list needs to be fetched.
Initialized as BAN_NEED_FETCH and lazily populated on first use.

## Methods

### hasBan

```ts
hasBan(clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
```

Checks if a client is banned for a specific swarm.
Lazily fetches the ban list on the first call if not already loaded.

### getBanMessage

```ts
getBanMessage(clientId: SessionId, swarmName: SwarmName): Promise<string>;
```

Retrieves the ban message for a client.
Uses a custom getBanMessage function if provided, otherwise falls back to the default ban message.

### validateInput

```ts
validateInput(incoming: string, clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
```

Validates an incoming message from a client.
Checks if the client is banned and applies the custom validation function if provided.
Automatically bans the client if validation fails and autoBan is enabled.

### validateOutput

```ts
validateOutput(outgoing: string, clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
```

Validates an outgoing message to a client.
Checks if the client is banned and applies the custom validation function if provided.
Automatically bans the client if validation fails and autoBan is enabled.

### banClient

```ts
banClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;
```

Bans a client, adding them to the ban set and persisting the change if setBannedClients is provided.
Emits a ban event and invokes the onBanClient callback if defined.

### unbanClient

```ts
unbanClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;
```

Unbans a client, removing them from the ban set and persisting the change if setBannedClients is provided.
Emits an unban event and invokes the onUnbanClient callback if defined.
