# Agent Navigation and Tool Execution

This document covers the dynamic orchestration of agent transitions and tool execution within multi-agent workflows. It explains how agents can navigate between each other, execute tools that trigger further navigation, and coordinate complex workflows through the pipeline system.

For basic agent and swarm setup, see [Building Multi-Agent Systems](#5.1). For tool integration patterns, see [Tool Integration](#5.2). For session management fundamentals, see [Session and Chat Management](#2.3).

## Agent Navigation System

The agent navigation system enables dynamic switching between agents within a swarm during execution. The core navigation functions provide controlled transitions with validation, queuing, and circular route prevention.

### Core Navigation Functions

The system provides three primary navigation functions that handle agent transitions:

| Function | Purpose | Key Behavior |
|----------|---------|--------------|
| `changeToAgent` | Switch to specific agent | Validates dependencies, prevents circular routes |
| `changeToDefaultAgent` | Return to swarm default agent | Uses swarm schema default agent |
| `changeToPrevAgent` | Navigate to previous agent | Uses navigation stack with fallback to default |

![Mermaid Diagram](./diagrams\29_Agent_Navigation_and_Tool_Execution_0.svg)

**Sources:** [src/functions/navigate/changeToAgent.ts:1-188](), [src/functions/navigate/changeToDefaultAgent.ts:1-161](), [src/functions/navigate/changeToPrevAgent.ts:1-165]()

### Navigation Implementation Details

Each navigation function uses a memoized, queued execution pattern to prevent race conditions and ensure sequential processing per client:

![Mermaid Diagram](./diagrams\29_Agent_Navigation_and_Tool_Execution_1.svg)

**Sources:** [src/functions/navigate/changeToAgent.ts:35-105](), [src/functions/navigate/changeToDefaultAgent.ts:35-105](), [src/functions/navigate/changeToPrevAgent.ts:35-105]()

## Tool Execution Framework

Tools can trigger agent navigation and execute complex workflows. The tool execution system integrates with the navigation system to enable sophisticated multi-agent interactions.

### Navigation Tools Pattern

Navigation tools are a common pattern where tool execution triggers agent transitions:

![Mermaid Diagram](./diagrams\29_Agent_Navigation_and_Tool_Execution_2.svg)

**Sources:** [test/spec/navigation.test.mjs:80-114](), [test/spec/connection.test.mjs:77-99](), [test/spec/dispose.test.mjs:30-52]()

### Tool Execution Lifecycle

The tool execution lifecycle involves validation, execution, and result commitment, with navigation capabilities:

![Mermaid Diagram](./diagrams\29_Agent_Navigation_and_Tool_Execution_3.svg)

**Sources:** [test/spec/resque.test.mjs:21-76](), [test/spec/navigation.test.mjs:256-280]()

## Pipeline-Based Workflows

The pipeline system enables complex workflows with agent navigation and automated execution patterns. Pipelines can switch agents during execution and restore the original agent afterward.

### Pipeline Execution with Navigation

The `startPipeline` function demonstrates advanced agent orchestration:

![Mermaid Diagram](./diagrams\29_Agent_Navigation_and_Tool_Execution_4.svg)

**Sources:** [src/functions/target/startPipeline.ts:23-76](), [src/model/Pipeline.model.ts:13-36]()

### Pipeline Schema Structure

Pipeline schemas define execution logic and lifecycle callbacks:

| Component | Purpose | Type |
|-----------|---------|------|
| `pipelineName` | Unique identifier | `string` |
| `execute` | Main execution function | `(clientId, agentName, payload) => Promise<T>` |
| `callbacks.onStart` | Pre-execution callback | `(clientId, pipelineName, payload) => void` |
| `callbacks.onEnd` | Post-execution callback | `(clientId, pipelineName, payload, isError) => void` |
| `callbacks.onError` | Error handling callback | `(clientId, pipelineName, payload, error) => void` |

**Sources:** [src/model/Pipeline.model.ts:8-72](), [src/lib/services/schema/PipelineSchemaService.ts:102-107]()

## Complex Navigation Patterns

Real-world scenarios involve intricate navigation patterns with multiple agents, tool chains, and error handling.

### Multi-Agent Workflow Example

This example shows a triage agent that routes users to specialized agents:

![Mermaid Diagram](./diagrams\29_Agent_Navigation_and_Tool_Execution_5.svg)

**Sources:** [test/spec/navigation.test.mjs:41-187](), [test/spec/connection.test.mjs:74-188]()

### Deadlock Prevention Mechanisms

The system includes several mechanisms to prevent deadlocks and race conditions:

![Mermaid Diagram](./diagrams\29_Agent_Navigation_and_Tool_Execution_6.svg)

**Sources:** [test/spec/navigation.test.mjs:256-280](), [test/spec/navigation.test.mjs:283-374]()

## Testing and Validation

The system includes comprehensive testing patterns for navigation and tool execution scenarios.

### Connection Orchestration Tests

The test suite validates that multiple concurrent connections maintain separate navigation states:

![Mermaid Diagram](./diagrams\29_Agent_Navigation_and_Tool_Execution_7.svg)

**Sources:** [test/spec/connection.test.mjs:74-188](), [test/spec/dispose.test.mjs:24-139]()

### Queue Management Tests

Message queuing ensures proper execution order even with concurrent operations:

| Test Scenario | Validation | Key Behavior |
|---------------|------------|--------------|
| Sequential message processing | `["foo", "bar", "baz"]` order maintained | Messages queued per client |
| Concurrent client isolation | Each client processes independently | No cross-client interference |
| Agent state consistency | History reflects correct agent transitions | Agent changes don't corrupt history |

**Sources:** [test/spec/connection.test.mjs:190-320](), [test/spec/navigation.test.mjs:189-254]()