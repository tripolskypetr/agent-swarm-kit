---
title: design/33_configuration_and_global_settings
group: design
---

# Configuration and Global Settings

This document covers the global configuration system in agent-swarm-kit, including the `GLOBAL_CONFIG` object, the `setConfig` function, and the various configuration parameters that control system behavior across all components. This includes settings for logging, tool execution, agent behavior, persistence, error recovery, and performance optimization.

For information about individual agent configuration schemas, see [Agent Schema Configuration](./14_Schema_Services.md). For swarm-level configuration, see [Swarm Management](./05_Swarm_Management.md).

## Configuration System Overview

The agent-swarm-kit uses a centralized configuration system built around the `GLOBAL_CONFIG` object and the `IGlobalConfig` interface. This system allows runtime modification of system behavior through the `setConfig` function while providing sensible defaults for all configuration options.

### Configuration Architecture

![Mermaid Diagram](./diagrams/33_Configuration_and_Global_Settings_0.svg)

### Using setConfig

The `setConfig` function allows runtime modification of global configuration parameters:

```typescript
import { setConfig } from 'agent-swarm-kit';

setConfig({
  CC_LOGGER_ENABLE_DEBUG: true,
  CC_MAX_TOOL_CALLS: 3,
  CC_RESQUE_STRATEGY: "recomplete"
});
```

The function performs a shallow merge with the existing `GLOBAL_CONFIG` object, updating only the specified properties.

## Logging Configuration

The logging system provides granular control over different log levels and output destinations:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `CC_LOGGER_ENABLE_DEBUG` | `false` | Enable debug-level logging throughout the system |
| `CC_LOGGER_ENABLE_INFO` | `false` | Enable info-level logging for operational events |
| `CC_LOGGER_ENABLE_LOG` | `true` | Enable general logging messages |
| `CC_LOGGER_ENABLE_CONSOLE` | `false` | Enable console output for logging |

### Logger Adapter Configuration

![Mermaid Diagram](./diagrams/33_Configuration_and_Global_Settings_1.svg)

## Agent Behavior Configuration

### Message and Tool Call Limits

| Parameter | Default | Description |
|-----------|---------|-------------|
| `CC_KEEP_MESSAGES` | `15` | Maximum messages retained in agent history |
| `CC_MAX_TOOL_CALLS` | `1` | Maximum tool calls per completion cycle |
| `CC_MAX_NESTED_EXECUTIONS` | `20` | Maximum nested tool call iterations |

### Tool Call Exception Handling

The system provides multiple strategies for handling tool call failures:

![Mermaid Diagram](./diagrams/33_Configuration_and_Global_Settings_2.svg)

### Output Transformation and Validation

| Parameter | Default | Description |
|-----------|---------|-------------|
| `CC_AGENT_OUTPUT_TRANSFORM` | `removeXmlTags` | Function to transform agent output |
| `CC_AGENT_OUTPUT_MAP` | Identity function | Function to map model messages |
| `CC_AGENT_DEFAULT_VALIDATION` | `validateDefault` | Default output validation function |
| `CC_EMPTY_OUTPUT_PLACEHOLDERS` | Array of phrases | Fallback responses for empty outputs |

## Storage and State Configuration

### Default Storage Operations

The system provides configurable default functions for storage and state persistence:

![Mermaid Diagram](./diagrams/33_Configuration_and_Global_Settings_3.svg)

### Persistence Settings

| Parameter | Default | Description |
|-----------|---------|-------------|
| `CC_PERSIST_ENABLED_BY_DEFAULT` | `true` | Enable persistence by default for all schemas |
| `CC_PERSIST_MEMORY_STORAGE` | `true` | Enable persistence for memory storage |
| `CC_PERSIST_EMBEDDING_CACHE` | `false` | Enable persistence for embedding cache |
| `CC_SKIP_POSIX_RENAME` | `false` | Skip POSIX rename operations in file writes |

## Swarm Navigation Configuration

### Agent and Navigation Stack Management

![Mermaid Diagram](./diagrams/33_Configuration_and_Global_Settings_4.svg)

## Performance and System Configuration

### Execution Control

| Parameter | Default | Description |
|-----------|---------|-------------|
| `CC_PROCESS_UUID` | Random string | Unique identifier for the current process |
| `CC_ENABLE_OPERATOR_TIMEOUT` | `false` | Enable timeout for operator connections |
| `CC_STORAGE_DISABLE_GET_DATA` | `false` | Disable data fetching from all storages |
| `CC_AUTOBAN_ENABLED_BY_DEFAULT` | `false` | Enable automatic banning by default |

### Policy Configuration

![Mermaid Diagram](./diagrams/33_Configuration_and_Global_Settings_5.svg)

## Configuration Integration Points

### Component Configuration Access Pattern

![Mermaid Diagram](./diagrams/33_Configuration_and_Global_Settings_6.svg)

The configuration system uses direct property access rather than dependency injection, allowing components to access current configuration values at runtime without requiring restart or re-instantiation.
