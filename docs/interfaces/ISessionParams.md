---
title: docs/api-reference/interface/ISessionParams
group: docs
---

# ISessionParams

Interface representing the parameters required to create a session.
Combines session schema, swarm callbacks, and runtime dependencies.

## Properties

### clientId

```ts
clientId: string
```

The unique ID of the client associated with the session.

### logger

```ts
logger: ILogger
```

The logger instance for recording session activity and errors.

### policy

```ts
policy: IPolicy
```

The policy instance defining session rules and constraints.

### bus

```ts
bus: IBus
```

The bus instance for event communication within the swarm.

### swarm

```ts
swarm: ISwarm
```

The swarm instance managing the session.

### swarmName

```ts
swarmName: string
```

The unique name of the swarm this session belongs to.
