---
title: docs/api-reference/class/SessionValidationService
group: docs
---

# SessionValidationService

Service for managing and validating sessions within the swarm system.
Tracks session associations with swarms, modes, agents, histories, storages, and states,
ensuring session existence and resource usage consistency.
Integrates with SessionConnectionService (session management), ClientSession (session lifecycle),
ClientAgent (agent usage), ClientStorage (storage usage), ClientState (state usage),
SwarmSchemaService (swarm association), and LoggerService (logging).
Uses dependency injection for the logger and memoization for efficient validation checks.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Logger service instance for logging session operations and errors.
Injected via DI, used for info-level logging controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.

### _storageSwarmMap

```ts
_storageSwarmMap: any
```

Map of session IDs to their associated storage names, tracking storage usage per session.
Populated by addStorageUsage, modified by removeStorageUsage.

### _historySwarmMap

```ts
_historySwarmMap: any
```

Map of session IDs to their associated agent names for history tracking.
Populated by addHistoryUsage, modified by removeHistoryUsage.

### _agentSwarmMap

```ts
_agentSwarmMap: any
```

Map of session IDs to their associated agent names for active usage.
Populated by addAgentUsage, modified by removeAgentUsage.

### _stateSwarmMap

```ts
_stateSwarmMap: any
```

Map of session IDs to their associated state names, tracking state usage per session.
Populated by addStateUsage, modified by removeStateUsage.

### _sessionSwarmMap

```ts
_sessionSwarmMap: any
```

Map of session IDs to their associated swarm names, defining session-swarm relationships.
Populated by addSession, removed by removeSession.

### _sessionModeMap

```ts
_sessionModeMap: any
```

Map of session IDs to their modes, defining session behavior.
Populated by addSession, removed by removeSession.

### addSession

```ts
addSession: (clientId: string, swarmName: string, sessionMode: SessionMode) => void
```

Registers a new session with its swarm and mode.
Logs the operation and ensures uniqueness, supporting SessionConnectionService’s session creation.

### addAgentUsage

```ts
addAgentUsage: (sessionId: string, agentName: string) => void
```

Tracks an agent’s usage within a session, adding it to the session’s agent list.
Logs the operation, supporting ClientAgent’s session-specific activity tracking.

### addHistoryUsage

```ts
addHistoryUsage: (sessionId: string, agentName: string) => void
```

Tracks an agent’s history usage within a session, adding it to the session’s history list.
Logs the operation, supporting ClientHistory’s session-specific history tracking.

### addStorageUsage

```ts
addStorageUsage: (sessionId: string, storageName: string) => void
```

Tracks a storage’s usage within a session, adding it to the session’s storage list.
Logs the operation, supporting ClientStorage’s session-specific storage tracking.

### addStateUsage

```ts
addStateUsage: (sessionId: string, stateName: string) => void
```

Tracks a state’s usage within a session, adding it to the session’s state list.
Logs the operation, supporting ClientState’s session-specific state tracking.

### removeAgentUsage

```ts
removeAgentUsage: (sessionId: string, agentName: string) => void
```

Removes an agent from a session’s agent usage list.
Logs the operation and cleans up if the list becomes empty, supporting ClientAgent’s session cleanup.

### removeHistoryUsage

```ts
removeHistoryUsage: (sessionId: string, agentName: string) => void
```

Removes an agent from a session’s history usage list.
Logs the operation and cleans up if the list becomes empty, supporting ClientHistory’s session cleanup.

### removeStorageUsage

```ts
removeStorageUsage: (sessionId: string, storageName: string) => void
```

Removes a storage from a session’s storage usage list.
Logs the operation and cleans up if the list becomes empty, supporting ClientStorage’s session cleanup.

### removeStateUsage

```ts
removeStateUsage: (sessionId: string, stateName: string) => void
```

Removes a state from a session’s state usage list.
Logs the operation and cleans up if the list becomes empty, supporting ClientState’s session cleanup.

### getSessionMode

```ts
getSessionMode: (clientId: string) => SessionMode
```

Retrieves the mode of a session.
Logs the operation and validates session existence, supporting ClientSession’s mode-based behavior.

### hasSession

```ts
hasSession: (clientId: string) => boolean
```

Checks if a session exists.
Logs the operation, supporting quick existence checks for SessionConnectionService.

### getSessionList

```ts
getSessionList: () => string[]
```

Retrieves the list of all registered session IDs.
Logs the operation, supporting SessionConnectionService’s session enumeration.

### getSessionAgentList

```ts
getSessionAgentList: (clientId: string) => string[]
```

Retrieves the list of agents associated with a session.
Logs the operation, supporting ClientAgent’s session-specific agent queries.

### getSessionHistoryList

```ts
getSessionHistoryList: (clientId: string) => string[]
```

Retrieves the list of agents in a session’s history.
Logs the operation, supporting ClientHistory’s session-specific history queries.

### getSwarm

```ts
getSwarm: (clientId: string) => string
```

Retrieves the swarm name associated with a session.
Logs the operation and validates session existence, supporting SwarmSchemaService’s session-swarm mapping.

### validate

```ts
validate: ((clientId: string, source: string) => void) & IClearableMemoize<string> & IControlMemoize<string, void>
```

Validates if a session exists, memoized by clientId for performance.
Logs the operation and checks existence, supporting ClientSession’s session validation needs.

### removeSession

```ts
removeSession: (clientId: string) => void
```

Removes a session and its associated mode, clearing validation cache.
Logs the operation, supporting SessionConnectionService’s session cleanup.

### dispose

```ts
dispose: (clientId: string) => void
```

Clears the validation cache for a specific session.
Logs the operation, supporting resource cleanup without removing session data.
