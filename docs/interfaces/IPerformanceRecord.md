# IPerformanceRecord

Interface representing a performance record for a process within the swarm system.
Aggregates execution and response metrics across multiple clients (e.g., sessions or agent instances) for a specific process, likely used for system-wide performance monitoring or diagnostics.
Integrated into components like logging (e.g., ILogger in ClientAgent) or event buses (e.g., IBus.emit) to track operational efficiency, such as total execution counts, response times, and temporal context.

## Properties

### processId

```ts
processId: string
```

The unique identifier of the process being monitored.
Represents a specific execution context, such as a swarm run, agent workflow, or session batch, distinguishing it from other processes in the system.
Example: A UUID or incremental ID like "proc-123" tied to a ClientAgent execution cycle.

### clients

```ts
clients: IClientPerfomanceRecord[]
```

Array of performance records for individual clients involved in the process.
Each entry details metrics for a specific client (e.g., a session or agent instance), enabling granular analysis of performance across the swarm.
Populated with IClientPerfomanceRecord objects, reflecting per-client execution and resource usage.

### totalExecutionCount

```ts
totalExecutionCount: number
```

The total number of executions performed across all clients in the process.
Counts discrete operations (e.g., command executions in ClientAgent.execute, tool calls), providing a measure of overall activity volume.
Example: 50 if 5 clients each executed 10 commands.

### totalResponseTime

```ts
totalResponseTime: string
```

The total response time for the process, formatted as a string.
Represents the cumulative duration of all client responses (e.g., from command start to output in ClientAgent), typically in a human-readable format like "500ms" or "1.23s".
Useful for assessing end-to-end performance across the process.

### averageResponseTime

```ts
averageResponseTime: string
```

The average response time per execution across all clients, formatted as a string.
Calculated as totalResponseTime divided by totalExecutionCount, providing a normalized performance metric (e.g., "10ms" per execution).
Aids in identifying typical response latency for the process.

### momentStamp

```ts
momentStamp: number
```

The number of days since January 1, 1970 (Unix epoch), based on London time (UTC).
Serves as a coarse timestamp for when the performance record was created, aligning with historical date tracking conventions.
Example: 19737 for a date in 2024, calculated as floor(Date.now() / 86400000).

### timeStamp

```ts
timeStamp: number
```

The number of seconds since midnight (00:00 UTC) of the day specified by momentStamp.
Provides fine-grained timing within the day, complementing momentStamp for precise event logging.
Example: 3600 for 01:00:00 UTC, derived from (Date.now() % 86400000) / 1000.

### date

```ts
date: string
```

The current date and time of the performance record in UTC format.
Stored as a string (e.g., "2024-03-15T12:00:00Z"), offering a human-readable timestamp for when the metrics were captured.
Likely used for logging or reporting alongside momentStamp and timeStamp.
