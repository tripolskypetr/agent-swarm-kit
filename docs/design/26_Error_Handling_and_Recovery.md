---
title: design/26_error_handling_and_recovery
group: design
---

# Error Handling and Recovery

This document covers the error handling and recovery mechanisms within the agent-swarm-kit system, including tool call failures, model rescue strategies, validation errors, and system recovery patterns. It focuses on how the system maintains stability and provides graceful degradation when failures occur.

For information about general system validation, see [Validation Services](./17_Validation_Services.md). For details about agent execution lifecycle, see [Client Agent](./04_Client_Agent.md). For session management patterns, see [Session and Chat Management](./06_Session_and_Chat_Management.md).

## Error Categories and Handling Strategies

The agent-swarm-kit system implements comprehensive error handling across multiple layers, from individual tool calls to system-wide recovery mechanisms.

### Tool Call Error Handling

Tool call errors represent one of the most common failure scenarios in the system. The `ClientAgent` class implements sophisticated error handling for tool execution failures.

![Mermaid Diagram](./diagrams/26_Error_Handling_and_Recovery_0.svg)

**Tool Call Error Flow in ClientAgent**

The system uses specific symbols to coordinate error handling between tool execution and the main agent loop:

| Symbol | Purpose | Trigger Condition |
|--------|---------|-------------------|
| `TOOL_ERROR_SYMBOL` | Tool execution failed | Exception during tool call execution |
| `MODEL_RESQUE_SYMBOL` | Model output invalid | Invalid tool calls or missing functions |
| `AGENT_CHANGE_SYMBOL` | Agent navigation occurred | Tool triggered agent transition |
| `TOOL_STOP_SYMBOL` | Tool execution stopped | Manual stop via `commitStopTools` |
| `CANCEL_OUTPUT_SYMBOL` | Output cancelled | Manual cancellation via `commitCancelOutput` |

### Model Rescue Strategies

When the AI model produces invalid outputs or tool calls, the system employs configurable rescue strategies to recover gracefully.

![Mermaid Diagram](./diagrams/26_Error_Handling_and_Recovery_1.svg)

**Model Rescue Strategy Selection**

The rescue strategies are configured through global settings:

- **Flush Strategy**: Clears conversation history and provides a placeholder response
- **Recomplete Strategy**: Prompts the model to analyze and correct its previous output
- **Custom Strategy**: Allows user-defined recovery functions for specific use cases

### Validation Error Handling

The system implements multi-layer validation to prevent invalid operations and gracefully handle validation failures.

![Mermaid Diagram](./diagrams/26_Error_Handling_and_Recovery_2.svg)

**Validation Error Recovery Mechanisms**

### Session and Connection Error Handling

Session-level errors are handled through policy validation and graceful degradation mechanisms.

![Mermaid Diagram](./diagrams/26_Error_Handling_and_Recovery_3.svg)

**Session Error Handling Flow**

## Recovery Mechanisms

### Placeholder Response System

When the system cannot provide a meaningful response due to errors, it employs a placeholder response system to maintain user engagement.

![Mermaid Diagram](./diagrams/26_Error_Handling_and_Recovery_4.svg)

**Placeholder Response Selection**

### History and State Recovery

The system maintains conversation context during error scenarios through intelligent history management.

![Mermaid Diagram](./diagrams/26_Error_Handling_and_Recovery_5.svg)

**History Recovery in ClientHistory**

### Navigation Error Prevention

The system prevents infinite recursion and deadlock conditions in agent navigation through validation services.

![Mermaid Diagram](./diagrams/26_Error_Handling_and_Recovery_6.svg)

**Navigation Error Prevention Flow**

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

### Custom Error Handlers

The system supports custom error handling functions for specialized recovery scenarios:

![Mermaid Diagram](./diagrams/26_Error_Handling_and_Recovery_7.svg)

**Error Recovery Class Relationships**

## Testing Error Scenarios

The system includes comprehensive test coverage for error handling scenarios:

### Tool Call Error Tests

Test scenarios include tool validation failures, missing tools, and execution errors.

### Navigation Error Tests

Tests cover recursive navigation prevention and deadlock detection.

### Recovery Strategy Tests

Tests validate different rescue strategies and their effectiveness.

The error handling and recovery system in agent-swarm-kit provides robust failure management while maintaining system stability and user experience through configurable recovery strategies, comprehensive validation, and graceful degradation mechanisms.