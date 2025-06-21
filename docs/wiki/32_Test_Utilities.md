---
title: wiki/test_utils
group: wiki
---

# Test Utilities

This page documents the testing infrastructure and utilities available in agent-swarm-kit for validating agent behavior, system integration, and concurrent operations. The test suite provides comprehensive coverage of the framework's core functionality including agent orchestration, session management, navigation, and resource cleanup.

For information about integration testing patterns, see [Integration Tests](#7.1). For information about building multi-agent systems in production, see [Building Multi-Agent Systems](#5.1).

## Test Framework Architecture

The testing system is built on `worker-testbed` and provides utilities for creating mock agents, completions, and swarms to validate system behavior under various conditions.

![Mermaid Diagram](./diagrams\32_Test_Utilities_0.svg)

Sources: [test/index.mjs:1-19](), [test/spec/connection.test.mjs:1-522](), [test/spec/navigation.test.mjs:1-375]()

## Core Test Utilities

The framework provides several categories of utilities for comprehensive testing of agent systems.

### Session Management Utilities

| Function | Purpose | Usage Pattern |
|----------|---------|---------------|
| `session()` | Creates persistent session with automatic cleanup | `const { complete } = session(clientId, swarm)` |
| `makeConnection()` | Creates connection with callback for outgoing messages | `const complete = makeConnection(callback, clientId, swarm)` |
| `disposeConnection()` | Manually dispose session resources | `await disposeConnection(clientId, swarm)` |

### Agent Execution Utilities

| Function | Purpose | Usage Pattern |
|----------|---------|---------------|
| `complete()` | Execute message through default agent flow | `await complete(message, clientId, swarm)` |
| `execute()` | Execute message through specific agent | `await execute(message, clientId, agentName)` |
| `getRawHistory()` | Retrieve complete message history | `const history = await getRawHistory(clientId)` |

### Navigation Testing Utilities

| Function | Purpose | Usage Pattern |
|----------|---------|---------------|
| `changeToAgent()` | Switch active agent in session | `await changeToAgent(agentName, clientId)` |
| `changeToDefaultAgent()` | Reset to swarm's default agent | `await changeToDefaultAgent(clientId)` |
| `changeToPrevAgent()` | Navigate to previous agent | `await changeToPrevAgent(clientId)` |
| `getAgentName()` | Get current active agent | `const agent = await getAgentName(clientId)` |

Sources: [test/spec/connection.test.mjs:3-19](), [test/spec/navigation.test.mjs:3-17](), [test/spec/dispose.test.mjs:3-15]()

## Mock Component Patterns

### Mock Completion Patterns

The test suite uses predictable mock completions for controlled testing scenarios:

![Mermaid Diagram](./diagrams\32_Test_Utilities_1.svg)

### Mock Agent Configurations

Test agents are configured with specific behaviors for different testing scenarios:

| Agent Type | Completion | Tools | Purpose |
|------------|------------|-------|---------|
| Increment Agent | Mock increment completion | None | Concurrency testing |
| Triage Agent | Navigation completion | Navigation tools | Routing testing |
| Sales Agent | Echo completion | Navigation tools | Target agent |
| Refund Agent | Echo completion | Navigation tools | Target agent |

Sources: [test/spec/connection.test.mjs:36-53](), [test/spec/navigation.test.mjs:42-61](), [test/spec/dispose.test.mjs:54-102]()

## Concurrency Testing Patterns

The test suite includes comprehensive concurrency testing to validate queue management and resource isolation:

![Mermaid Diagram](./diagrams\32_Test_Utilities_2.svg)

Sources: [test/spec/connection.test.mjs:28-72](), [test/spec/connection.test.mjs:190-320](), [test/spec/queue.test.mjs]()

## Event System Testing

The framework provides utilities for testing the event system and real-time communication:

### Event Testing Functions

| Function | Purpose | Usage Pattern |
|----------|---------|---------------|
| `event()` | Emit custom event to client | `await event(clientId, "custom-message", data)` |
| `listenEvent()` | Register event listener | `listenEvent(clientId, "event-name", callback)` |
| `emit()` | Legacy emit function | `await emit(clientId, data)` |

### Event Flow Validation

![Mermaid Diagram](./diagrams\32_Test_Utilities_3.svg)

Sources: [test/spec/connection.test.mjs:413-473](), [test/spec/connection.test.mjs:475-521]()

## Resource Management Testing

### Connection Disposal Validation

The test suite validates proper cleanup of system resources:

![Mermaid Diagram](./diagrams\32_Test_Utilities_4.svg)

Sources: [test/spec/dispose.test.mjs:24-139](), [test/spec/dispose.test.mjs:142-257](), [test/spec/dispose.test.mjs:259-370]()

## Configuration Testing Utilities

### Test Configuration Options

| Configuration | Purpose | Test Usage |
|---------------|---------|------------|
| `CC_PERSIST_ENABLED_BY_DEFAULT` | Control message persistence | Set to `false` for isolated tests |
| `CC_RESQUE_STRATEGY` | Error recovery strategy | Set to `"flush"` for rescue testing |
| `CC_EMPTY_OUTPUT_PLACEHOLDERS` | Empty response handling | Set to `["Resque"]` for placeholder testing |

### Configuration Testing Pattern

![Mermaid Diagram](./diagrams\32_Test_Utilities_5.svg)

Sources: [test/spec/connection.test.mjs:193-195](), [test/spec/resque.test.mjs:23-26](), [test/spec/resque.test.mjs:224-226]()

## Validation Testing Framework

The validation system ensures all component dependencies are properly configured:

### Dependency Validation Tests

| Test Scenario | Missing Component | Expected Result |
|---------------|-------------------|-----------------|
| Complete Setup | None | Pass validation |
| Missing Swarm | Swarm definition | Fail with error |
| Missing Completion | Completion handler | Fail with error |
| Missing Agent | Agent definition | Fail with error |
| Missing Tool | Tool implementation | Fail with error |
| Invalid Default Agent | Agent not in swarm list | Fail with error |

### Validation Test Pattern

![Mermaid Diagram](./diagrams\32_Test_Utilities_6.svg)

Sources: [test/spec/validation.test.mjs:66-129](), [test/spec/validation.test.mjs:131-143]()