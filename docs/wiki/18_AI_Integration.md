---
title: design/18_ai_integration
group: design
---

# AI Integration

This document covers the AI integration layer of the agent-swarm-kit framework, including completion adapters for various AI providers, performance monitoring of AI operations, and execution management patterns. This system enables agents to communicate with different AI models through a unified interface while tracking performance metrics.

For information about agents that utilize these AI integrations, see [Client Agent](#2.1). For details on tool integration with AI models, see [Tool Integration](#5.2).

## Completion Adapters

The framework provides a unified interface for integrating with multiple AI providers through the `AdapterUtils` class. Each adapter transforms provider-specific APIs into a standardized `TCompleteFn` interface that agents can use consistently.

![Mermaid Diagram](./diagrams\18_AI_Integration_0.svg)

### Provider-Specific Adapters

Each adapter method in `AdapterUtils` creates a completion function tailored to a specific AI provider's API format:

| Adapter Method | Provider | Default Model | Key Features |
|---|---|---|---|
| `fromOpenAI` | OpenAI | "gpt-3.5-turbo" | Response format support, tool calls |
| `fromOllama` | Ollama | "nemotron-mini:4b" | Custom tool protocol, keep-alive |
| `fromLMStudio` | LMStudio | "saiga_yandexgpt_8b_gguf" | OpenAI-compatible API |
| `fromCohereClientV2` | Cohere | "command-r-08-2024" | Cohere-specific message format |
| `fromCortex` | Cortex | "tripolskypetr:gemma-3-12b-it:gemma-3-12b-it-Q4_K_S.gguf" | Local model execution |
| `fromGrok` | Grok | "grok-3-mini" | X.AI's Grok model integration |

The adapters handle message transformation, tool call formatting, and response normalization to ensure consistent behavior across different AI providers.

### Execution Pipeline

All completion adapters utilize a robust execution pipeline with pooling and retry mechanisms:

![Mermaid Diagram](./diagrams\18_AI_Integration_1.svg)

The execution parameters are configured as constants:
- `EXECPOOL_SIZE`: 5 concurrent executions maximum
- `RETRY_COUNT`: 5 retry attempts before failure
- `RETRY_DELAY`: 5000ms between retry attempts

## Tool Call Protocol

The framework implements a standardized tool call protocol that works across different AI providers, with special handling for providers that don't natively support structured tool calls.

### Message Transformation

Each adapter transforms messages between the unified `IModelMessage` format and provider-specific formats:

![Mermaid Diagram](./diagrams\18_AI_Integration_3.svg)

## Performance Monitoring

The `PerfService` class provides comprehensive performance monitoring for AI operations, tracking execution metrics, response times, and resource usage across all client sessions.

![Mermaid Diagram](./diagrams\18_AI_Integration_4.svg)

### Execution Tracking

The performance service tracks AI completion operations from start to finish:

| Method | Purpose | Metrics Updated |
|---|---|---|
| `startExecution` | Begin tracking an execution | Input length, execution count, start time |
| `endExecution` | Complete tracking an execution | Output length, response time, total time |
| `getActiveSessionExecutionCount` | Get execution count for client | - |
| `getAverageResponseTime` | Calculate average response time | - |

### Performance Records

The service generates structured performance reports through two main interfaces:

![Mermaid Diagram](./diagrams\18_AI_Integration_5.svg)

The `IPerformanceRecord` aggregates system-wide metrics while `IClientPerfomanceRecord` provides per-client breakdowns including session memory, state, and execution statistics.

### State Computation

The performance service computes comprehensive client state information by integrating with multiple services:

![Mermaid Diagram](./diagrams\18_AI_Integration_6.svg)

## Utilities and Supporting Functions

The AI integration layer includes several utility functions that support robust operation:

### File Operations
- `writeFileAtomic`: Ensures atomic file writes for configuration and state persistence
- `removeXmlTags`: Cleans XML markup from AI responses

### Data Processing
- `msToTime`: Converts milliseconds to human-readable time format for performance reporting
- `objectFlat`: Flattens nested objects for logging and debugging
- `nameToTitle`: Formats names for display purposes

### Type Safety
- `isObject`: Validates plain JavaScript objects for safe data handling
