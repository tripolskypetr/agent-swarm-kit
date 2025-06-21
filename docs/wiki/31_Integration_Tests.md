---
title: design/31_integration_tests
group: design
---

# Integration Tests

The integration test suite validates the complete agent-swarm-kit system by testing interactions between agents, swarms, sessions, tools, and the underlying service infrastructure. These tests ensure that all components work together correctly under various scenarios including concurrent operations, error conditions, and resource management.

For information about test utilities and mock services, see [Test Utilities](./7_Storage_and_State.md).

## Test Framework Architecture

The integration tests use the `worker-testbed` framework and are organized into focused test suites that validate specific system behaviors. Each test creates a complete system configuration including agents, completions, tools, and swarms.

![Mermaid Diagram](./diagrams\31_Integration_Tests_0.svg)

## Connection and Session Testing

The connection tests validate concurrent session management, message queuing, and event handling across multiple client connections. These tests ensure the system maintains proper isolation between clients while handling parallel operations.

### Connection Test Patterns

![Mermaid Diagram](./diagrams\31_Integration_Tests_1.svg)

### Key Connection Test Cases

| Test Case | Purpose | Key Functions Tested |
|-----------|---------|---------------------|
| Parallel Complete Calls | Validates session isolation | `complete`, `randomString`, `Promise.all` |
| Connection Orchestration | Tests swarm navigation | `changeToAgent`, `execute`, `session` |
| Message Queuing | Ensures ordered processing | `complete`, `getRawHistory`, `setConfig` |
| Event System | Validates event handling | `makeConnection`, `listenEvent`, `event` |

## Navigation and Tool Execution Testing

Navigation tests validate agent transitions, tool execution, and deadlock prevention mechanisms. These tests use a triage-sales-refund agent pattern to simulate real-world navigation scenarios.

### Navigation Test Architecture

![Mermaid Diagram](./diagrams\31_Integration_Tests_2.svg)

### Navigation Test Scenarios

The navigation tests cover several critical scenarios:

1. **Basic Navigation**: Tests `changeToAgent` and `execute` for moving between agents
2. **Default Agent Return**: Validates `changeToDefaultAgent` functionality
3. **Previous Agent Navigation**: Tests `changeToPrevAgent` for navigation history
4. **Deadlock Prevention**: Ensures `commitToolOutput` prevents execution blocking

## Resource Management and Disposal Testing

Disposal tests validate proper cleanup of sessions, connections, and associated resources. These tests ensure no memory leaks occur when connections are terminated.

### Disposal Test Flow

![Mermaid Diagram](./diagrams\31_Integration_Tests_3.svg)

## Error Recovery and Rescue Testing

The rescue tests validate error handling mechanisms when tools fail, completions return empty responses, or validation fails. These tests use the `CC_RESQUE_STRATEGY` configuration to control error recovery behavior.

### Rescue Test Patterns

| Error Condition | Test Method | Expected Behavior |
|----------------|-------------|-------------------|
| Non-existent Tool Call | Mock completion returns invalid tool | System returns placeholder from `CC_EMPTY_OUTPUT_PLACEHOLDERS` |
| Empty Completion Response | Mock completion returns empty content | System applies rescue strategy |
| Failed Tool Validation | Tool validation returns false | System prevents tool execution and applies rescue |

## Validation Testing

Validation tests ensure the dependency injection system properly validates component dependencies before allowing system operations. These tests verify that missing components are detected and reported.

### Validation Test Matrix

![Mermaid Diagram](./diagrams\31_Integration_Tests_4.svg)

## Message Filtering and Agent State Testing

The ignore tests validate that messages are properly filtered based on agent state, ensuring that only the active agent processes messages while inactive agents ignore execution requests.

### Agent State Test Flow

The system maintains agent state per client session and filters messages based on the currently active agent:

1. **Execute Filtering**: `execute(message, clientId, agent)` only processes when the specified agent is active
2. **Tool Output Filtering**: `commitToolOutput(toolId, output, clientId, agent)` only commits from active agents  
3. **System Message Filtering**: `commitSystemMessage(message, clientId, agent)` only processes from active agents

## Test Data Management

Integration tests use several strategies for managing test data and ensuring test isolation:

- **Random Client IDs**: Each test uses `randomString()` to generate unique client identifiers
- **Mock Completions**: Tests create predictable AI responses using `addCompletion` with custom logic
- **Configuration Control**: Tests use `setConfig()` to modify system behavior for specific scenarios
- **History Validation**: Tests use `getRawHistory(clientId)` to verify message ordering and content
