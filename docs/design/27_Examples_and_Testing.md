---
title: design/27_examples_and_testing
group: design
---

# Examples and Testing

This page demonstrates practical examples of building agent swarm systems using the agent-swarm-kit framework and provides comprehensive testing approaches for multi-agent systems. It covers real-world usage patterns, test implementation strategies, and integration testing methods for ensuring system reliability and correctness.

For information about building multi-agent systems architecture, see [Building Multi-Agent Systems](./23_Building_Multi-Agent_Systems.md). For tool integration patterns, see [Tool Integration](./24_Tool_Integration.md). For error handling strategies, see [Error Handling and Recovery](./26_Error_Handling_and_Recovery.md).

## Test Architecture Overview

The testing framework validates core system functionality through comprehensive integration tests that exercise real multi-agent workflows, session management, and tool execution patterns.

![Mermaid Diagram](./diagrams\27_Examples_and_Testing_0.svg)

## Basic Agent and Swarm Examples

### Simple Agent Completion

The most basic example demonstrates creating an agent with mock completion and testing its response:

![Mermaid Diagram](./diagrams\27_Examples_and_Testing_1.svg)

This pattern is implemented in [test/spec/completion.test.mjs:14-50]() where a mock completion returns a fixed response, and [test/spec/completion.test.mjs:52-116]() demonstrates using different completions for different agents within the same swarm.

### Multi-Agent System with Navigation

The navigation test demonstrates a triage system with agent routing:

![Mermaid Diagram](./diagrams\27_Examples_and_Testing_2.svg)

The implementation creates tools that handle navigation between agents using `changeToAgent()` and `execute()` functions as shown in [test/spec/navigation.test.mjs:80-114]().

## Connection Management and Session Testing

### Parallel Session Orchestration

The connection tests validate that the system properly handles multiple concurrent sessions:

| Test Scenario | Implementation | Validation |
|---------------|----------------|------------|
| Session Queue Management | [test/spec/connection.test.mjs:28-72]() | Ensures proper message ordering |
| Swarm Orchestration | [test/spec/connection.test.mjs:74-188]() | Validates agent state per connection |
| Message Queuing | [test/spec/connection.test.mjs:190-320]() | Tests concurrent message processing |
| Server-side Events | [test/spec/connection.test.mjs:322-411]() | Validates `makeConnection` callback |

### Session Lifecycle Testing

![Mermaid Diagram](./diagrams\27_Examples_and_Testing_3.svg)

The disposal tests in [test/spec/dispose.test.mjs:24-371]() verify that all session resources are properly cleaned up, including session lists, agent lists, and history lists.

## Tool Execution and Navigation Patterns

### Navigation Tool Implementation

Navigation tools demonstrate complex multi-step operations:

![Mermaid Diagram](./diagrams\27_Examples_and_Testing_4.svg)

The tool implementation pattern is shown in [test/spec/navigation.test.mjs:80-96]() where tools perform agent navigation and execute follow-up messages.

### Deadlock Prevention Testing

The system includes specific tests for preventing deadlock conditions in tool execution:

![Mermaid Diagram](./diagrams\27_Examples_and_Testing_5.svg)

This deadlock prevention mechanism is validated in [test/spec/navigation.test.mjs:256-280]() and [test/spec/navigation.test.mjs:283-374]().

## Error Recovery and Validation Testing

### Rescue Strategy Testing

The system implements rescue strategies for handling various error conditions:

| Error Condition | Rescue Strategy | Test Implementation |
|-----------------|-----------------|-------------------|
| Non-existent Tool Call | Flush and placeholder | [test/spec/resque.test.mjs:21-76]() |
| Empty Model Output | Placeholder response | [test/spec/resque.test.mjs:78-125]() |
| Failed Tool Validation | Flush and placeholder | [test/spec/resque.test.mjs:127-197]() |

Configuration for rescue strategies:
- `CC_RESQUE_STRATEGY: "flush"` - Clear invalid operations
- `CC_EMPTY_OUTPUT_PLACEHOLDERS: ["Resque"]` - Fallback responses

### Dependency Validation Testing

The validation tests ensure all required dependencies are present:

![Mermaid Diagram](./diagrams\27_Examples_and_Testing_6.svg)

Each validation test in [test/spec/validation.test.mjs:66-144]() checks for specific missing dependencies and verifies that the system properly rejects invalid configurations.

## Integration Testing Patterns

### Message Ordering and Concurrency

Integration tests validate that the system maintains message order under concurrent load:

![Mermaid Diagram](./diagrams\27_Examples_and_Testing_7.svg)

This pattern is tested extensively in [test/spec/connection.test.mjs:190-320]() with validation that assistant messages maintain proper order even under concurrent load.

### Event System Testing

The event system allows for custom message emission outside the normal chat flow:

![Mermaid Diagram](./diagrams\27_Examples_and_Testing_8.svg)

Event testing is implemented in [test/spec/connection.test.mjs:413-473]() and [test/spec/connection.test.mjs:475-522]() to ensure events are properly delivered to listeners without affecting chat history.

## Testing Best Practices

### Resource Management Testing

Resource disposal tests ensure proper cleanup:

1. **Session Disposal**: Verify all sessions are removed from validation service
2. **Agent List Cleanup**: Ensure agent lists are cleared per client
3. **History Cleanup**: Validate message history is properly disposed

### Concurrent Execution Testing

Key patterns for testing concurrent operations:

1. **Race Condition Prevention**: Use `Promise.all()` with multiple identical operations
2. **Message Ordering**: Validate sequential processing within sessions
3. **State Isolation**: Ensure client state doesn't leak between sessions

### Mock Implementation Patterns

Effective mock completions for testing:

- **Deterministic Responses**: Return predictable outputs for test validation
- **State-based Logic**: Use message content to determine tool calls
- **Async Simulation**: Include realistic delays with `sleep()`
- **Error Simulation**: Mock various failure conditions
