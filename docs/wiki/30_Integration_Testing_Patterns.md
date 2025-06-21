---
title: design/30_integration_testing_patterns
group: design
---

# Integration Testing Patterns

This document covers integration testing strategies and patterns for multi-agent systems built with the agent-swarm-kit framework. It focuses on testing complete workflows involving agent interactions, session management, tool execution, and AI model integration. For unit testing individual components, see [API Reference](#7). For system performance testing, see [Performance Monitoring](#4.2).

## Testing Architecture Overview

The agent-swarm-kit employs a comprehensive integration testing approach that validates end-to-end workflows across the entire system stack. Tests verify agent orchestration, session management, concurrent execution, and AI model integration patterns.

![Mermaid Diagram](./diagrams\30_Integration_Testing_Patterns_0.svg)

**Sources:** [test/index.mjs:1-18](), [test/spec/connection.test.mjs:1-27]()

## Mock Completion Patterns

Integration tests rely heavily on mock AI completions to provide deterministic, controllable responses. This approach isolates the testing from external AI service dependencies while maintaining realistic interaction patterns.

### Basic Mock Completion Structure

![Mermaid Diagram](./diagrams\30_Integration_Testing_Patterns_1.svg)

Mock completions typically follow this pattern:

| Pattern | Purpose | Example Usage |
|---------|---------|---------------|
| **Message Echo** | Return user input as response | Testing message flow |
| **Tool Call Generation** | Generate specific tool calls | Testing tool execution |
| **State-based Response** | Different responses based on agent state | Testing navigation |
| **Incremental Counter** | Numeric progression for concurrency testing | Testing parallel execution |

**Sources:** [test/spec/completion.test.mjs:16-28](), [test/spec/connection.test.mjs:36-47]()

### Tool Call Mock Pattern

![Mermaid Diagram](./diagrams\30_Integration_Testing_Patterns_2.svg)

**Sources:** [test/spec/navigation.test.mjs:118-180](), [test/spec/connection.test.mjs:101-128]()

## Concurrent Execution Testing

The framework includes extensive concurrent execution testing to validate message queuing, session isolation, and parallel agent operations.

### Parallel Session Testing Pattern

![Mermaid Diagram](./diagrams\30_Integration_Testing_Patterns_3.svg)

The connection test demonstrates this pattern by running 50 parallel sessions with the same `CLIENT_ID` to verify proper message queuing:

**Sources:** [test/spec/connection.test.mjs:28-72](), [test/spec/connection.test.mjs:190-320]()

### Message Queue Validation

![Mermaid Diagram](./diagrams\30_Integration_Testing_Patterns_4.svg)

**Sources:** [test/spec/connection.test.mjs:270-320]()

## Agent Navigation Testing

Navigation testing validates agent transitions, swarm orchestration, and deadlock prevention mechanisms.

### Navigation Test Architecture

![Mermaid Diagram](./diagrams\30_Integration_Testing_Patterns_5.svg)

**Sources:** [test/spec/navigation.test.mjs:41-187]()

### Deadlock Prevention Testing

The framework includes specific tests for deadlock prevention when tools don't properly commit their outputs:

![Mermaid Diagram](./diagrams\30_Integration_Testing_Patterns_6.svg)

**Sources:** [test/spec/navigation.test.mjs:256-280]()

## Connection Lifecycle Testing

Connection disposal and cleanup testing ensures proper resource management and prevents memory leaks in long-running systems.

### Connection Disposal Pattern

![Mermaid Diagram](./diagrams\30_Integration_Testing_Patterns_7.svg)

**Sources:** [test/spec/dispose.test.mjs:24-139](), [test/spec/dispose.test.mjs:142-257]()

## Error Recovery Testing

The rescue (resque) testing validates error handling, model recovery, and graceful degradation patterns.

### Rescue Strategy Testing

![Mermaid Diagram](./diagrams\30_Integration_Testing_Patterns_8.svg)

**Sources:** [test/spec/resque.test.mjs:21-76](), [test/spec/resque.test.mjs:127-197]()

## Validation Testing Patterns

Dependency validation testing ensures that all required components are properly configured before system execution.

### Validation Test Matrix

| Test Case | Missing Component | Expected Result |
|-----------|------------------|-----------------|
| Complete Setup | None | Pass |
| Missing Swarm | `addSwarm()` call | Validation Error |
| Missing Completion | `addCompletion()` call | Validation Error |
| Missing Agent | `addAgent()` call | Validation Error |
| Missing Tool | `addTool()` call | Validation Error |
| Invalid Default Agent | Wrong `defaultAgent` reference | Validation Error |

![Mermaid Diagram](./diagrams\30_Integration_Testing_Patterns_9.svg)

**Sources:** [test/spec/validation.test.mjs:66-144]()

## Event System Testing

Event testing validates the custom event system used for out-of-band communication between agents and clients.

### Event Flow Testing

![Mermaid Diagram](./diagrams\30_Integration_Testing_Patterns_10.svg)

**Sources:** [test/spec/connection.test.mjs:413-473](), [test/spec/connection.test.mjs:475-521]()

## Test Utility Patterns

### Common Test Utilities

| Utility | Purpose | Usage Pattern |
|---------|---------|---------------|
| `randomString()` | Generate unique client IDs | `const CLIENT_ID = randomString()` |
| `sleep(ms)` | Add artificial delays | `await sleep(1000)` |
| `getRawHistory(clientId)` | Inspect message history | Validation and debugging |
| `getErrorMessage(error)` | Extract error messages | Error handling assertions |

### Test Configuration Management

![Mermaid Diagram](./diagrams\30_Integration_Testing_Patterns_11.svg)

**Sources:** [test/spec/connection.test.mjs:193-195](), [test/spec/resque.test.mjs:23-26]()