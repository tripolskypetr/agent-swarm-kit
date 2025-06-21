# Completion Adapters

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [docs/classes/AdapterUtils.md](docs/classes/AdapterUtils.md)
- [docs/classes/ChatInstance.md](docs/classes/ChatInstance.md)
- [docs/classes/ChatUtils.md](docs/classes/ChatUtils.md)
- [docs/classes/ExecutionValidationService.md](docs/classes/ExecutionValidationService.md)
- [docs/classes/NavigationSchemaService.md](docs/classes/NavigationSchemaService.md)
- [docs/classes/PersistMemoryUtils.md](docs/classes/PersistMemoryUtils.md)
- [docs/interfaces/IAgentSchemaInternal.md](docs/interfaces/IAgentSchemaInternal.md)
- [docs/interfaces/IAgentSchemaInternalCallbacks.md](docs/interfaces/IAgentSchemaInternalCallbacks.md)
- [docs/types/TChatInstanceCtor.md](docs/types/TChatInstanceCtor.md)
- [src/classes/Adapter.ts](src/classes/Adapter.ts)
- [src/lib/services/base/PerfService.ts](src/lib/services/base/PerfService.ts)
- [src/model/Performance.model.ts](src/model/Performance.model.ts)
- [src/utils/isObject.ts](src/utils/isObject.ts)
- [src/utils/msToTime.ts](src/utils/msToTime.ts)
- [src/utils/nameToTitle.ts](src/utils/nameToTitle.ts)
- [src/utils/objectFlat.ts](src/utils/objectFlat.ts)
- [src/utils/removeXmlTags.ts](src/utils/removeXmlTags.ts)
- [src/utils/writeFileAtomic.ts](src/utils/writeFileAtomic.ts)

</details>



## Purpose and Scope

Completion Adapters provide a standardized interface for integrating various AI completion providers (OpenAI, Ollama, Grok, Cohere, etc.) into the agent-swarm-kit system. These adapters handle the translation between the framework's internal message format and each provider's specific API requirements, including message transformation, tool call processing, and error handling.

For information about AI model performance monitoring, see [Performance Monitoring](#4.2). For details about agent-level completion configuration, see [Schema Services](#3.2).

## Architecture Overview

The completion adapter system is built around the `AdapterUtils` class, which provides factory methods that return standardized completion functions. Each adapter method transforms the internal `ICompletionArgs` format into provider-specific requests and converts responses back to the framework's `IModelMessage` format.

![Mermaid Diagram](./diagrams\19_Completion_Adapters_0.svg)

**Sources:** [src/classes/Adapter.ts:1-654]()

## Core Components

### AdapterUtils Class

The `AdapterUtils` class serves as the primary factory for creating provider-specific completion functions. Each method returns a `TCompleteFn` that conforms to the standard completion interface.

| Component | Type | Purpose |
|-----------|------|---------|
| `AdapterUtils` | Class | Main factory for completion adapters |
| `TCompleteFn` | Type | Standard completion function signature |
| `TOOL_PROTOCOL_PROMPT` | Constant | XML-based tool call instruction template |
| `Adapter` | Singleton | Default instance of AdapterUtils |

### Configuration Constants

The adapter system uses several configuration constants for reliability and performance:

| Constant | Value | Purpose |
|----------|-------|---------|
| `EXECPOOL_SIZE` | 5 | Maximum concurrent executions |
| `EXECPOOL_WAIT` | 0 | Delay between executions (ms) |
| `RETRY_COUNT` | 5 | Maximum retry attempts |
| `RETRY_DELAY` | 5000 | Delay between retries (ms) |

**Sources:** [src/classes/Adapter.ts:18-36]()

## Provider Implementations

### OpenAI Adapter

The `fromOpenAI` method creates an adapter for OpenAI's chat completions API, supporting both GPT models and custom response formats.

![Mermaid Diagram](./diagrams\19_Completion_Adapters_1.svg)

**Sources:** [src/classes/Adapter.ts:384-466]()

### Ollama Adapter

The `fromOllama` method handles Ollama's local model API, including custom tool call protocol injection for models that don't natively support function calling.

Key features:
- Injects `TOOL_PROTOCOL_PROMPT` for tool call support
- Handles local model persistence with `keep_alive: "24h"`
- Generates tool call IDs using `randomString()`

**Sources:** [src/classes/Adapter.ts:566-644](), [src/classes/Adapter.ts:11-16]()

### Other Provider Adapters

| Provider | Method | Key Features |
|----------|--------|--------------|
| Grok | `fromGrok` | X.AI's Grok model API integration |
| Cortex | `fromCortex` | Local Cortex server with message deduplication |
| Cohere | `fromCohereClientV2` | Cohere Command-R model support |
| LMStudio | `fromLMStudio` | OpenAI-compatible local server |

**Sources:** [src/classes/Adapter.ts:205-282](), [src/classes/Adapter.ts:56-197](), [src/classes/Adapter.ts:291-375](), [src/classes/Adapter.ts:475-557]()

## Message Transformation

### Input Transformation

All adapters perform similar input transformations to convert from the internal `ICompletionArgs` format:

![Mermaid Diagram](./diagrams\19_Completion_Adapters_2.svg)

### Tool Call Processing

Tool calls require special handling to convert between the internal format and provider-specific representations:

![Mermaid Diagram](./diagrams\19_Completion_Adapters_3.svg)

**Sources:** [src/classes/Adapter.ts:94-100](), [src/classes/Adapter.ts:420-426](), [src/classes/Adapter.ts:450-456]()

## Reliability Features

### Retry Logic

All adapters implement retry logic using the `retry` utility with configurable attempts and delays:

```typescript
retry(
  async (args: ICompletionArgs) => {
    // Adapter implementation
  },
  RETRY_COUNT,    // 5 attempts
  RETRY_DELAY     // 5000ms delay
)
```

### Execution Pooling

Requests are managed through `execpool` to limit concurrency and prevent API rate limiting:

```typescript
execpool(
  retryFunction,
  {
    maxExec: EXECPOOL_SIZE,  // 5 concurrent
    delay: EXECPOOL_WAIT     // 0ms delay
  }
)
```

### Message Deduplication

Some adapters (like Cortex) implement message deduplication to handle consecutive messages of the same role:

**Sources:** [src/classes/Adapter.ts:115-146]()

## Integration Points

### Logging Integration

All adapters integrate with the `Logger` class for request tracking:

```typescript
Logger.logClient(
  clientId,
  "AdapterUtils fromOpenAI completion",
  JSON.stringify(rawMessages)
);
```

### Schema Service Integration

Completion adapters are registered and accessed through the completion schema services in the dependency injection system. The adapters are typically configured at the agent level through completion schema definitions.

### Performance Monitoring

Adapter executions are tracked by the performance monitoring system for metrics collection and analysis. See [Performance Monitoring](#4.2) for details on how completion times and throughput are measured.

**Sources:** [src/classes/Adapter.ts:82-84](), [src/classes/Adapter.ts:226-229](), [src/classes/Adapter.ts:410-413](), [src/lib/services/base/PerfService.ts:1-617]()