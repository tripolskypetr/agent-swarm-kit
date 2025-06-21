# Error Handling and Recovery

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [package-lock.json](package-lock.json)
- [package.json](package.json)
- [src/client/ClientAgent.ts](src/client/ClientAgent.ts)
- [src/client/ClientHistory.ts](src/client/ClientHistory.ts)
- [src/client/ClientSession.ts](src/client/ClientSession.ts)
- [src/config/params.ts](src/config/params.ts)
- [src/index.ts](src/index.ts)
- [src/interfaces/Agent.interface.ts](src/interfaces/Agent.interface.ts)
- [src/interfaces/Session.interface.ts](src/interfaces/Session.interface.ts)
- [src/lib/services/connection/AgentConnectionService.ts](src/lib/services/connection/AgentConnectionService.ts)
- [src/lib/services/connection/SessionConnectionService.ts](src/lib/services/connection/SessionConnectionService.ts)
- [src/lib/services/public/AgentPublicService.ts](src/lib/services/public/AgentPublicService.ts)
- [src/lib/services/public/SessionPublicService.ts](src/lib/services/public/SessionPublicService.ts)
- [src/model/GlobalConfig.model.ts](src/model/GlobalConfig.model.ts)
- [test/index.mjs](test/index.mjs)
- [test/spec/completion.test.mjs](test/spec/completion.test.mjs)
- [test/spec/connection.test.mjs](test/spec/connection.test.mjs)
- [test/spec/dispose.test.mjs](test/spec/dispose.test.mjs)
- [test/spec/ignore.spec.mjs](test/spec/ignore.spec.mjs)
- [test/spec/navigation.test.mjs](test/spec/navigation.test.mjs)
- [test/spec/resque.test.mjs](test/spec/resque.test.mjs)
- [test/spec/validation.test.mjs](test/spec/validation.test.mjs)
- [types.d.ts](types.d.ts)

</details>



This document covers the error handling and recovery mechanisms within the agent-swarm-kit system, including tool call failures, model rescue strategies, validation errors, and system recovery patterns. It focuses on how the system maintains stability and provides graceful degradation when failures occur.

For information about general system validation, see [Validation Services](#3.5). For details about agent execution lifecycle, see [Client Agent](#2.1). For session management patterns, see [Session and Chat Management](#2.3).

## Error Categories and Handling Strategies

The agent-swarm-kit system implements comprehensive error handling across multiple layers, from individual tool calls to system-wide recovery mechanisms.

### Tool Call Error Handling

Tool call errors represent one of the most common failure scenarios in the system. The `ClientAgent` class implements sophisticated error handling for tool execution failures.

![Mermaid Diagram](./diagrams\26_Error_Handling_and_Recovery_0.svg)

**Tool Call Error Flow in ClientAgent**

Sources: [src/client/ClientAgent.ts:26-32](), [src/client/ClientAgent.ts:109-165](), [src/client/ClientAgent.ts:319-606]()

The system uses specific symbols to coordinate error handling between tool execution and the main agent loop:

| Symbol | Purpose | Trigger Condition |
|--------|---------|-------------------|
| `TOOL_ERROR_SYMBOL` | Tool execution failed | Exception during tool call execution |
| `MODEL_RESQUE_SYMBOL` | Model output invalid | Invalid tool calls or missing functions |
| `AGENT_CHANGE_SYMBOL` | Agent navigation occurred | Tool triggered agent transition |
| `TOOL_STOP_SYMBOL` | Tool execution stopped | Manual stop via `commitStopTools` |
| `CANCEL_OUTPUT_SYMBOL` | Output cancelled | Manual cancellation via `commitCancelOutput` |

Sources: [src/client/ClientAgent.ts:26-32]()

### Model Rescue Strategies

When the AI model produces invalid outputs or tool calls, the system employs configurable rescue strategies to recover gracefully.

![Mermaid Diagram](./diagrams\26_Error_Handling_and_Recovery_1.svg)

**Model Rescue Strategy Selection**

Sources: [src/config/params.ts:128](), [src/config/params.ts:21-30](), [src/model/GlobalConfig.model.ts:23-34]()

The rescue strategies are configured through global settings:

- **Flush Strategy**: Clears conversation history and provides a placeholder response
- **Recomplete Strategy**: Prompts the model to analyze and correct its previous output
- **Custom Strategy**: Allows user-defined recovery functions for specific use cases

### Validation Error Handling

The system implements multi-layer validation to prevent invalid operations and gracefully handle validation failures.

![Mermaid Diagram](./diagrams\26_Error_Handling_and_Recovery_2.svg)

**Validation Error Recovery Mechanisms**

Sources: [src/client/ClientSession.ts:149-179](), [src/lib/services/validation/](), [src/config/params.ts:72]()

### Session and Connection Error Handling

Session-level errors are handled through policy validation and graceful degradation mechanisms.

![Mermaid Diagram](./diagrams\26_Error_Handling_and_Recovery_3.svg)

**Session Error Handling Flow**

Sources: [src/client/ClientSession.ts:149-233](), [src/interfaces/Session.interface.ts:67-102]()

## Recovery Mechanisms

### Placeholder Response System

When the system cannot provide a meaningful response due to errors, it employs a placeholder response system to maintain user engagement.

![Mermaid Diagram](./diagrams\26_Error_Handling_and_Recovery_4.svg)

**Placeholder Response Selection**

Sources: [src/client/ClientAgent.ts:91-96](), [src/config/params.ts:32-43]()

### History and State Recovery

The system maintains conversation context during error scenarios through intelligent history management.

![Mermaid Diagram](./diagrams\26_Error_Handling_and_Recovery_5.svg)

**History Recovery in ClientHistory**

Sources: [src/client/ClientHistory.ts:151-169](), [src/client/ClientHistory.ts:136-243]()

### Navigation Error Prevention

The system prevents infinite recursion and deadlock conditions in agent navigation through validation services.

![Mermaid Diagram](./diagrams\26_Error_Handling_and_Recovery_6.svg)

**Navigation Error Prevention Flow**

Sources: [src/lib/services/validation/NavigationValidationService.ts](), [src/config/params.ts:233-234](), [src/config/params.ts:17]()

## Error Recovery Configuration

### Global Configuration Options

The error handling behavior is highly configurable through global settings:

| Configuration | Purpose | Default Value |
|---------------|---------|---------------|
| `CC_RESQUE_STRATEGY` | Model rescue strategy | "flush" |
| `CC_EMPTY_OUTPUT_PLACEHOLDERS` | Placeholder responses | Array of friendly messages |
| `CC_TOOL_CALL_EXCEPTION_FLUSH_PROMPT` | Flush recovery prompt | "Start the conversation" |
| `CC_TOOL_CALL_EXCEPTION_RECOMPLETE_PROMPT` | Recomplete recovery prompt | Multi-line correction prompt |
| `CC_MAX_NESTED_EXECUTIONS` | Maximum nested executions | 20 |
| `CC_THROW_WHEN_NAVIGATION_RECURSION` | Throw on navigation recursion | true |

Sources: [src/config/params.ts:128-289](), [src/model/GlobalConfig.model.ts:21-287]()

### Custom Error Handlers

The system supports custom error handling functions for specialized recovery scenarios:

![Mermaid Diagram](./diagrams\26_Error_Handling_and_Recovery_7.svg)

**Error Recovery Class Relationships**

Sources: [src/client/ClientAgent.ts:608-672](), [src/config/params.ts:27-30](), [src/model/GlobalConfig.model.ts]()

## Testing Error Scenarios

The system includes comprehensive test coverage for error handling scenarios:

### Tool Call Error Tests

Test scenarios include tool validation failures, missing tools, and execution errors.

Sources: [test/spec/resque.test.mjs:21-76](), [test/spec/validation.test.mjs:66-104]()

### Navigation Error Tests

Tests cover recursive navigation prevention and deadlock detection.

Sources: [test/spec/navigation.test.mjs:25-26](), [test/spec/connection.test.mjs:74-188]()

### Recovery Strategy Tests

Tests validate different rescue strategies and their effectiveness.

Sources: [test/spec/resque.test.mjs:78-152](), [test/spec/dispose.test.mjs:24-210]()

The error handling and recovery system in agent-swarm-kit provides robust failure management while maintaining system stability and user experience through configurable recovery strategies, comprehensive validation, and graceful degradation mechanisms.