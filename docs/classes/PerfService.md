# PerfService

Service class for tracking and logging performance metrics of client sessions in the swarm system.
Monitors execution times, input/output lengths, and session states, aggregating data into IPerformanceRecord and IClientPerfomanceRecord structures.
Integrates with ClientAgent workflows (e.g., execute, run) to measure performance, using LoggerService for logging (gated by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) and validation/public services for state computation.
Provides methods to start/end executions, retrieve metrics, and serialize performance data for reporting or analytics.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Logger service instance for logging performance-related information, injected via DI.
Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO, used across methods (e.g., startExecution, toRecord) for info-level logging.

### sessionValidationService

```ts
sessionValidationService: any
```

Session validation service instance, injected via DI.
Used to retrieve session lists (e.g., getActiveSessions) and swarm names (e.g., computeClientState).

### memorySchemaService

```ts
memorySchemaService: any
```

Memory schema service instance, injected via DI.
Provides session memory data for toClientRecord, aligning with IClientPerfomanceRecord.sessionMemory.

### swarmValidationService

```ts
swarmValidationService: any
```

Swarm validation service instance, injected via DI.
Retrieves agent and policy lists for computeClientState, supporting swarm-level state aggregation.

### agentValidationService

```ts
agentValidationService: any
```

Agent validation service instance, injected via DI.
Fetches state lists for agents in computeClientState, enabling client state computation.

### statePublicService

```ts
statePublicService: any
```

State public service instance, injected via DI.
Retrieves state values for computeClientState, populating IClientPerfomanceRecord.sessionState.

### swarmPublicService

```ts
swarmPublicService: any
```

Swarm public service instance, injected via DI.
Provides agent names for computeClientState, supporting swarm status in sessionState.

### policyPublicService

```ts
policyPublicService: any
```

Policy public service instance, injected via DI.
Checks for bans in computeClientState, contributing to policyBans in sessionState.

### stateConnectionService

```ts
stateConnectionService: any
```

State connection service instance, injected via DI.
Verifies state references in computeClientState, ensuring valid state retrieval.

### executionScheduleMap

```ts
executionScheduleMap: any
```

Map tracking execution start times for clients, keyed by clientId and executionId.
Used in startExecution and endExecution to calculate response times per execution.

### executionOutputLenMap

```ts
executionOutputLenMap: any
```

Map of total output lengths per client, keyed by clientId.
Updated in endExecution, used for IClientPerfomanceRecord.executionOutputTotal.

### executionInputLenMap

```ts
executionInputLenMap: any
```

Map of total input lengths per client, keyed by clientId.
Updated in startExecution, used for IClientPerfomanceRecord.executionInputTotal.

### executionCountMap

```ts
executionCountMap: any
```

Map of execution counts per client, keyed by clientId.
Updated in startExecution, used for IClientPerfomanceRecord.executionCount.

### executionTimeMap

```ts
executionTimeMap: any
```

Map of total execution times per client, keyed by clientId.
Updated in endExecution, used for IClientPerfomanceRecord.executionTimeTotal.

### totalResponseTime

```ts
totalResponseTime: any
```

Total response time across all executions, in milliseconds.
Aggregated in endExecution, used for IPerformanceRecord.totalResponseTime.

### totalRequestCount

```ts
totalRequestCount: any
```

Total number of execution requests across all clients.
Incremented in endExecution, used for IPerformanceRecord.totalExecutionCount.

### computeClientState

```ts
computeClientState: any
```

Computes the aggregated state of a client by collecting swarm, agent, policy, and state data.
Used in toClientRecord to populate IClientPerfomanceRecord.sessionState, integrating with validation and public services.
Logs via loggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true (e.g., ClientAgent-style debug logging).

### getActiveSessionExecutionCount

```ts
getActiveSessionExecutionCount: (clientId: string) => number
```

Retrieves the number of active executions for a client’s session.
Used to monitor execution frequency, reflecting IClientPerfomanceRecord.executionCount.

### getActiveSessionExecutionTotalTime

```ts
getActiveSessionExecutionTotalTime: (clientId: string) => number
```

Retrieves the total execution time for a client’s sessions, in milliseconds.
Used for performance analysis, feeding into IClientPerfomanceRecord.executionTimeTotal.

### getActiveSessionExecutionAverageTime

```ts
getActiveSessionExecutionAverageTime: (clientId: string) => number
```

Calculates the average execution time per execution for a client’s sessions, in milliseconds.
Used for performance metrics, contributing to IClientPerfomanceRecord.executionTimeAverage.

### getActiveSessionAverageInputLength

```ts
getActiveSessionAverageInputLength: (clientId: string) => number
```

Calculates the average input length per execution for a client’s sessions.
Used for data throughput analysis, feeding into IClientPerfomanceRecord.executionInputAverage.

### getActiveSessionAverageOutputLength

```ts
getActiveSessionAverageOutputLength: (clientId: string) => number
```

Calculates the average output length per execution for a client’s sessions.
Used for data throughput analysis, feeding into IClientPerfomanceRecord.executionOutputAverage.

### getActiveSessionTotalInputLength

```ts
getActiveSessionTotalInputLength: (clientId: string) => number
```

Retrieves the total input length for a client’s sessions.
Used for data volume tracking, aligning with IClientPerfomanceRecord.executionInputTotal.

### getActiveSessionTotalOutputLength

```ts
getActiveSessionTotalOutputLength: (clientId: string) => number
```

Retrieves the total output length for a client’s sessions.
Used for data volume tracking, aligning with IClientPerfomanceRecord.executionOutputTotal.

### getActiveSessions

```ts
getActiveSessions: () => string[]
```

Retrieves the list of active session client IDs.
Sources data from sessionValidationService, used in toRecord to enumerate clients.

### getAverageResponseTime

```ts
getAverageResponseTime: () => number
```

Calculates the average response time across all executions, in milliseconds.
Used for system-wide performance metrics, feeding into IPerformanceRecord.averageResponseTime.

### getTotalExecutionCount

```ts
getTotalExecutionCount: () => number
```

Retrieves the total number of executions across all clients.
Used for system-wide metrics, aligning with IPerformanceRecord.totalExecutionCount.

### getTotalResponseTime

```ts
getTotalResponseTime: () => number
```

Retrieves the total response time across all executions, in milliseconds.
Used for system-wide metrics, feeding into IPerformanceRecord.totalResponseTime.

### startExecution

```ts
startExecution: (executionId: string, clientId: string, inputLen: number) => void
```

Starts tracking an execution for a client, recording start time and input length.
Initializes maps and increments execution count/input length, used with endExecution to measure performance (e.g., ClientAgent.execute).

### endExecution

```ts
endExecution: (executionId: string, clientId: string, outputLen: number) => boolean
```

Ends tracking an execution for a client, calculating response time and updating output length.
Pairs with startExecution to compute execution duration, updating totals for IClientPerfomanceRecord metrics.

### toClientRecord

```ts
toClientRecord: (clientId: string) => Promise<IClientPerfomanceRecord>
```

Serializes performance metrics for a specific client into an IClientPerfomanceRecord.
Aggregates execution counts, input/output lengths, times, memory, and state, used in toRecord for per-client data.

### toRecord

```ts
toRecord: () => Promise<IPerformanceRecord>
```

Serializes performance metrics for all clients into an IPerformanceRecord.
Aggregates client records, total execution counts, and response times, used for system-wide performance reporting.

### dispose

```ts
dispose: (clientId: string) => void
```

Disposes of all performance data associated with a client.
Clears maps for the clientId, used to reset or terminate tracking (e.g., session end in ClientAgent).
