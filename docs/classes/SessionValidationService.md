# SessionValidationService

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

### addSession

```ts
addSession: (clientId: string, swarmName: string) => void
```

### addAgentUsage

```ts
addAgentUsage: (sessionId: string, agentName: string) => void
```

### addHistoryUsage

```ts
addHistoryUsage: (sessionId: string, agentName: string) => void
```

### removeAgentUsage

```ts
removeAgentUsage: (sessionId: string, agentName: string) => void
```

### removeHistoryUsage

```ts
removeHistoryUsage: (sessionId: string, agentName: string) => void
```

### getSessionList

```ts
getSessionList: () => string[]
```

### getSessionAgentList

```ts
getSessionAgentList: (clientId: string) => string[]
```

### getSessionHistoryList

```ts
getSessionHistoryList: (clientId: string) => string[]
```

### getSwarm

```ts
getSwarm: (clientId: string) => string
```

### validate

```ts
validate: (clientId: string, source: string) => void
```

### removeSession

```ts
removeSession: (clientId: string) => void
```
