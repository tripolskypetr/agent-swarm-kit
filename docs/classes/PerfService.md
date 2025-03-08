# PerfService

Performance Service to track and log execution times, input lengths, and output lengths
for different client sessions.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### sessionValidationService

```ts
sessionValidationService: any
```

### memorySchemaService

```ts
memorySchemaService: any
```

### swarmValidationService

```ts
swarmValidationService: any
```

### agentValidationService

```ts
agentValidationService: any
```

### statePublicService

```ts
statePublicService: any
```

### swarmPublicService

```ts
swarmPublicService: any
```

### stateConnectionService

```ts
stateConnectionService: any
```

### executionScheduleMap

```ts
executionScheduleMap: any
```

### executionOutputLenMap

```ts
executionOutputLenMap: any
```

### executionInputLenMap

```ts
executionInputLenMap: any
```

### executionCountMap

```ts
executionCountMap: any
```

### executionTimeMap

```ts
executionTimeMap: any
```

### totalResponseTime

```ts
totalResponseTime: any
```

### totalRequestCount

```ts
totalRequestCount: any
```

### computeClientState

```ts
computeClientState: any
```

Computes the state of the client by aggregating the states of all agents in the client's swarm.

### getActiveSessionExecutionCount

```ts
getActiveSessionExecutionCount: (clientId: string) => number
```

Gets the number of active session executions for a given client.

### getActiveSessionExecutionTotalTime

```ts
getActiveSessionExecutionTotalTime: (clientId: string) => number
```

Gets the total execution time for a given client's sessions.

### getActiveSessionExecutionAverageTime

```ts
getActiveSessionExecutionAverageTime: (clientId: string) => number
```

Gets the average execution time for a given client's sessions.

### getActiveSessionAverageInputLength

```ts
getActiveSessionAverageInputLength: (clientId: string) => number
```

Gets the average input length for active sessions of a given client.

### getActiveSessionAverageOutputLength

```ts
getActiveSessionAverageOutputLength: (clientId: string) => number
```

Gets the average output length for active sessions of a given client.

### getActiveSessionTotalInputLength

```ts
getActiveSessionTotalInputLength: (clientId: string) => number
```

Gets the total input length for active sessions of a given client.

### getActiveSessionTotalOutputLength

```ts
getActiveSessionTotalOutputLength: (clientId: string) => number
```

Gets the total output length for active sessions of a given client.

### getActiveSessions

```ts
getActiveSessions: () => string[]
```

Gets the list of active sessions.

### getAverageResponseTime

```ts
getAverageResponseTime: () => number
```

Gets the average response time for all requests.

### getTotalExecutionCount

```ts
getTotalExecutionCount: () => number
```

Gets the total number of executions.

### getTotalResponseTime

```ts
getTotalResponseTime: () => number
```

Gets the total response time for all requests.

### startExecution

```ts
startExecution: (executionId: string, clientId: string, inputLen: number) => void
```

Starts an execution for a given client.

### endExecution

```ts
endExecution: (executionId: string, clientId: string, outputLen: number) => boolean
```

Ends an execution for a given client.

### toClientRecord

```ts
toClientRecord: (clientId: string) => Promise<IClientPerfomanceRecord>
```

Convert performance measures of the client for serialization

### toRecord

```ts
toRecord: () => Promise<IPerformanceRecord>
```

Convert performance measures of all clients for serialization.

### dispose

```ts
dispose: (clientId: string) => void
```

Disposes of all data related to a given client.
