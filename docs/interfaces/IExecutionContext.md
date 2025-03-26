---
title: docs/api-reference/interface/IExecutionContext
group: docs
---

# IExecutionContext

Interface defining the structure of execution context in the swarm system.
Represents metadata for tracking a specific execution, used across services like ClientAgent, PerfService, and BusService.

## Properties

### clientId

```ts
clientId: string
```

The unique identifier of the client session, tying to ClientAgent’s clientId and PerfService’s execution tracking.

### executionId

```ts
executionId: string
```

The unique identifier of the execution instance, used in PerfService (e.g., startExecution) and BusService (e.g., commitExecutionBegin).

### processId

```ts
processId: string
```

The unique identifier of the process, sourced from GLOBAL_CONFIG.CC_PROCESS_UUID, used in PerfService’s IPerformanceRecord.processId.
