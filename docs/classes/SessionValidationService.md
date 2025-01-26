# SessionValidationService

Service for validating and managing sessions.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### _historySwarmMap

```ts
_historySwarmMap: any
```

### _sessionSwarmMap

```ts
_sessionSwarmMap: any
```

### _agentSwarmMap

```ts
_agentSwarmMap: any
```

### _sessionModeMap

```ts
_sessionModeMap: any
```

### addSession

```ts
addSession: (clientId: string, swarmName: string, sessionMode: SessionMode) => void
```

Adds a new session.

### addAgentUsage

```ts
addAgentUsage: (sessionId: string, agentName: string) => void
```

Adds an agent usage to a session.

### addHistoryUsage

```ts
addHistoryUsage: (sessionId: string, agentName: string) => void
```

Adds a history usage to a session.

### removeAgentUsage

```ts
removeAgentUsage: (sessionId: string, agentName: string) => void
```

Removes an agent usage from a session.

### removeHistoryUsage

```ts
removeHistoryUsage: (sessionId: string, agentName: string) => void
```

Removes a history usage from a session.

### getSessionMode

```ts
getSessionMode: (clientId: string) => SessionMode
```

Gets the mode of a session.

### getSessionList

```ts
getSessionList: () => string[]
```

Gets the list of all session IDs.

### getSessionAgentList

```ts
getSessionAgentList: (clientId: string) => string[]
```

Gets the list of agents for a session.

### getSessionHistoryList

```ts
getSessionHistoryList: (clientId: string) => string[]
```

Gets the history list of agents for a session.

### getSwarm

```ts
getSwarm: (clientId: string) => string
```

Gets the swarm name for a session.

### validate

```ts
validate: (clientId: string, source: string) => void
```

Validates if a session exists.

### removeSession

```ts
removeSession: (clientId: string) => void
```

Removes a session.
