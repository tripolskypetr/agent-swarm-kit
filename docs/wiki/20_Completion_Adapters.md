---
title: wiki/completion_adapters
group: wiki
---

# Completion Adapters

This document covers the completion adapter system that enables the agent-swarm-kit framework to integrate with various AI language model providers. The adapters provide a standardized interface for interacting with different completion APIs while handling provider-specific message formatting, tool calls, and response processing.

For information about performance monitoring of completions, see [Performance Monitoring](#4.2). For broader AI integration patterns, see [AI Integration](#4).

## Overview

The completion adapter system provides a unified interface for interacting with multiple AI providers through the [`AdapterUtils`](src/classes/Adapter.ts:49) class. Each adapter transforms the framework's internal message format to the provider's expected format and processes responses back to the standard format.

![Mermaid Diagram](./diagrams\20_Completion_Adapters_0.svg)

## Supported Providers

The framework supports five major AI providers through dedicated adapter methods:

| Provider | Method | Default Model | Special Features |
|----------|--------|---------------|------------------|
| OpenAI | `fromOpenAI` | `gpt-3.5-turbo` | Response format control |
| Grok | `fromGrok` | `grok-3-mini` | X.AI's Grok model |
| Cohere | `fromCohereClientV2` | `command-r-08-2024` | Cohere's V2 client |
| LMStudio | `fromLMStudio` | `saiga_yandexgpt_8b_gguf` | Local model hosting |
| Ollama | `fromOllama` | `nemotron-mini:4b` | Custom tool protocol |

### Provider-Specific Implementations

#### OpenAI Adapter
The [`fromOpenAI`](src/classes/Adapter.ts:235-317) method handles OpenAI's chat completions API with optional response format control and standard tool calling support.

#### Grok Adapter  
The [`fromGrok`](src/classes/Adapter.ts:56-134) method interfaces with X.AI's Grok API, using similar message formatting to OpenAI but with provider-specific configurations.

#### Cohere Adapter
The [`fromCohereClientV2`](src/classes/Adapter.ts:143-226) method transforms messages for Cohere's V2 client, handling different field naming conventions like `toolCallId` vs `tool_call_id`.

#### LMStudio Adapter
The [`fromLMStudio`](src/classes/Adapter.ts:326-408) method connects to LMStudio's OpenAI-compatible API for local model hosting scenarios.

#### Ollama Adapter
The [`fromOllama`](src/classes/Adapter.ts:417-495) method includes special handling for tool calls using the [`TOOL_PROTOCOL_PROMPT`](src/classes/Adapter.ts:11-16) to instruct models on XML-based tool call formatting.

## Message Transformation

Each adapter performs bidirectional message transformation between the framework's [`IModelMessage`](src/model/ModelMessage.model.ts) format and provider-specific formats.

![Mermaid Diagram](./diagrams\20_Completion_Adapters_1.svg)

### Tool Call Handling

Tool calls require special transformation because providers use different formats:

- **OpenAI/Grok/LMStudio**: Native tool call support with JSON arguments
- **Cohere**: Uses `toolCalls` field with different structure  
- **Ollama**: Uses XML-based protocol with [`TOOL_PROTOCOL_PROMPT`](src/classes/Adapter.ts:11-16)

The tool call transformation process:

1. **Outbound**: Framework tool calls → Provider format
2. **Inbound**: Provider tool calls → Framework format with generated IDs

## Performance and Reliability Features

### Execution Pooling
All adapters use [`execpool`](src/classes/Adapter.ts:21-26) to limit concurrent requests:
- **Maximum concurrent executions**: 5 ([`EXECPOOL_SIZE`](src/classes/Adapter.ts:21))
- **Delay between executions**: 0ms ([`EXECPOOL_WAIT`](src/classes/Adapter.ts:26))

### Retry Logic  
Built-in retry mechanism with:
- **Maximum retries**: 5 ([`RETRY_COUNT`](src/classes/Adapter.ts:31))
- **Retry delay**: 5000ms ([`RETRY_DELAY`](src/classes/Adapter.ts:36))

### Logging Integration
Each adapter logs completion requests using [`Logger.logClient`](src/classes/Adapter.ts:77-81) for debugging and monitoring.

![Mermaid Diagram](./diagrams\20_Completion_Adapters_2.svg)

## Integration with Agent System

The completion adapters integrate with the broader agent system through the dependency injection container and performance monitoring:

### Service Integration
- Adapters are used by [`ClientAgent`](src/lib/clients/ClientAgent.ts) for message processing
- Performance tracking via [`PerfService`](src/lib/services/base/PerfService.ts) monitors completion metrics
- Logging through [`LoggerService`](src/lib/services/base/LoggerService.ts) provides debugging capabilities

### Type Safety
The [`TCompleteFn`](src/classes/Adapter.ts:44) type ensures all adapters conform to the same interface:
```typescript
type TCompleteFn = (args: ICompletionArgs) => Promise<IModelMessage>
```

### Singleton Pattern
The adapters are available through the [`Adapter`](src/classes/Adapter.ts:502) singleton instance, providing a consistent entry point for the entire system.
