---
title: docs/api-reference/class/ClientPolicy
group: docs
---

# ClientPolicy

Implements `IPolicy`

Class representing a client policy in the swarm system, implementing the IPolicy interface.
Manages client bans, input/output validation, and restrictions, with lazy-loaded ban lists and event emission via BusService.
Integrates with PolicyConnectionService (policy instantiation), SwarmConnectionService (swarm-level restrictions via SwarmSchemaService’s policies),
ClientAgent (message validation), and BusService (event emission).
Supports auto-banning on validation failure and customizable ban messages, ensuring swarm security and compliance.

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
Initialized as BAN_NEED_FETCH, lazily populated via params.getBannedClients on first use in hasBan, validateInput, etc.
Updated by banClient and unbanClient, persisted if params.setBannedClients is provided.

## Methods

### hasBan

```ts
hasBan(clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
```

Checks if a client is banned for a specific swarm, lazily fetching the ban list if not already loaded.
Used by SwarmConnectionService to enforce swarm-level restrictions defined in SwarmSchemaService’s policies.

### getBanMessage

```ts
getBanMessage(clientId: SessionId, swarmName: SwarmName): Promise<string>;
```

Retrieves the ban message for a client, using a custom getBanMessage function if provided or falling back to params.banMessage.
Supports ClientAgent by providing ban feedback when validation fails, enhancing user experience.

### validateInput

```ts
validateInput(incoming: string, clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
```

Validates an incoming message from a client, checking ban status and applying custom validation if provided.
Auto-bans the client via banClient if validation fails and params.autoBan is true, emitting events via BusService.
Used by ClientAgent to filter incoming messages before processing, ensuring policy compliance.

### validateOutput

```ts
validateOutput(outgoing: string, clientId: SessionId, swarmName: SwarmName): Promise<boolean>;
```

Validates an outgoing message to a client, checking ban status and applying custom validation if provided.
Auto-bans the client via banClient if validation fails and params.autoBan is true, emitting events via BusService.
Used by ClientAgent to ensure outgoing messages comply with swarm policies before emission.

### banClient

```ts
banClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;
```

Bans a client, adding them to the ban set and persisting the change if params.setBannedClients is provided.
Emits a ban event via BusService and invokes the onBanClient callback, supporting SwarmConnectionService’s access control.
Skips if the client is already banned to avoid redundant updates.

### unbanClient

```ts
unbanClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;
```

Unbans a client, removing them from the ban set and persisting the change if params.setBannedClients is provided.
Emits an unban event via BusService and invokes the onUnbanClient callback, supporting dynamic policy adjustments.
Skips if the client is not banned to avoid redundant updates.
