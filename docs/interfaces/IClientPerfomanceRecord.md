---
title: docs/api-reference/interface/IClientPerfomanceRecord
group: docs
---

# IClientPerfomanceRecord

Interface representing a performance record for an individual client within a process.
Captures detailed execution metrics, memory, and state for a specific client (e.g., a session or agent instance), used to analyze performance at the client level.
Embedded within IPerformanceRecord.clients to provide per-client breakdowns, likely logged via ILogger or emitted via IBus for monitoring (e.g., in ClientAgent workflows).

## Properties

### clientId

```ts
clientId: string
```

The unique identifier of the client, typically a session or agent-specific ID.
Matches the clientId used in runtime params (e.g., this.params.clientId in ClientAgent), linking performance data to a specific session or agent instance.
Example: "client-456" for a user session.

### sessionMemory

```ts
sessionMemory: Record<string, unknown>
```

A key-value record of the client’s session memory.
Stores arbitrary data (e.g., cached values, temporary variables) used during the client’s operation, similar to IState’s state management in ClientAgent.
Example: `{ "cacheKey": "value" }` for a session’s temporary storage.

### sessionState

```ts
sessionState: Record<string, unknown>
```

A key-value record of the client’s session state.
Represents persistent state data (e.g., configuration, current step) for the client, akin to IState’s role in tracking agent state in ClientAgent.
Example: `{ "step": 3, "active": true }` for a session’s current status.

### executionCount

```ts
executionCount: number
```

The number of executions performed by this client within the process.
Counts operations like command runs (e.g., ClientAgent.execute) or tool calls, contributing to the process’s totalExecutionCount.
Example: 10 for a client that executed 10 commands.

### executionInputTotal

```ts
executionInputTotal: number
```

The total input size processed during executions, in a numeric unit (e.g., bytes, characters).
Measures the cumulative input data (e.g., incoming messages in ClientAgent.execute), useful for assessing data throughput.
Example: 1024 for 1KB of total input across executions.

### executionOutputTotal

```ts
executionOutputTotal: number
```

The total output size generated during executions, in a numeric unit (e.g., bytes, characters).
Measures the cumulative output data (e.g., results in ClientAgent._emitOutput), indicating response volume.
Example: 2048 for 2KB of total output.

### executionInputAverage

```ts
executionInputAverage: number
```

The average input size per execution, in a numeric unit (e.g., bytes, characters).
Calculated as executionInputTotal divided by executionCount, providing a normalized input metric.
Example: 102.4 for an average of 102.4 bytes per execution.

### executionOutputAverage

```ts
executionOutputAverage: number
```

The average output size per execution, in a numeric unit (e.g., bytes, characters).
Calculated as executionOutputTotal divided by executionCount, offering insight into typical output size.
Example: 204.8 for an average of 204.8 bytes per execution.

### executionTimeTotal

```ts
executionTimeTotal: string
```

The total execution time for the client, formatted as a string.
Represents the cumulative duration of all executions (e.g., from incoming to output in ClientAgent.execute), typically in a readable format like "300ms" or "1.5s".
Contributes to the process’s totalResponseTime.

### executionTimeAverage

```ts
executionTimeAverage: string
```

The average execution time per execution, formatted as a string.
Calculated as executionTimeTotal divided by executionCount, providing a normalized latency metric (e.g., "30ms" per execution).
Helps evaluate client-specific performance efficiency.
