---
title: docs/api-reference/interface/IPolicySchema
group: docs
---

# IPolicySchema

Interface representing the schema for configuring a policy.
Defines how policies enforce rules and manage bans within the swarm.

## Properties

### persist

```ts
persist: boolean
```

Optional flag to enable serialization of banned clients to persistent storage (e.g., hard drive).

### docDescription

```ts
docDescription: string
```

Optional description for documentation purposes, aiding in policy usage understanding.

### policyName

```ts
policyName: string
```

The unique name of the policy within the swarm.

### banMessage

```ts
banMessage: string
```

Optional default message to display when a client is banned, overridden by getBanMessage if provided.

### autoBan

```ts
autoBan: boolean
```

Optional flag to automatically ban a client immediately after failed validation.

### getBanMessage

```ts
getBanMessage: (clientId: string, policyName: string, swarmName: string) => string | Promise<string>
```

Optional function to retrieve a custom ban message for a client.
Overrides the default banMessage if provided.

### getBannedClients

```ts
getBannedClients: (policyName: string, swarmName: string) => string[] | Promise<string[]>
```

Retrieves the list of currently banned clients under this policy.

### setBannedClients

```ts
setBannedClients: (clientIds: string[], policyName: string, swarmName: string) => void | Promise<void>
```

Optional function to set the list of banned clients.
Overrides default ban list management if provided.

### validateInput

```ts
validateInput: (incoming: string, clientId: string, policyName: string, swarmName: string) => boolean | Promise<boolean>
```

Optional function to validate incoming messages against custom policy rules.
Overrides default validation if provided.

### validateOutput

```ts
validateOutput: (outgoing: string, clientId: string, policyName: string, swarmName: string) => boolean | Promise<boolean>
```

Optional function to validate outgoing messages against custom policy rules.
Overrides default validation if provided.

### callbacks

```ts
callbacks: IPolicyCallbacks
```

Optional set of callbacks for policy events, allowing customization of validation and ban actions.
