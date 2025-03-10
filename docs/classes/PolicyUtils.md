# PolicyUtils

PolicyUtils class provides utility methods for banning and unbanning clients.

## Constructor

```ts
constructor();
```

## Properties

### banClient

```ts
banClient: (payload: { clientId: string; swarmName: string; policyName: string; }) => Promise<void>
```

Bans a client.

### unbanClient

```ts
unbanClient: (payload: { clientId: string; swarmName: string; policyName: string; }) => Promise<void>
```

Unbans a client.

### hasBan

```ts
hasBan: (payload: { clientId: string; swarmName: string; policyName: string; }) => Promise<boolean>
```

Check if client is banned
