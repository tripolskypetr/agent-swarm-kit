---
title: design/3_client_agent
group: design
---

# Client Agent

The Client Agent is the fundamental building block in the agent-swarm-kit library, providing the core implementation of the agent interface. It handles message execution, tool calls, model completions, history management, and output emission. This document covers the implementation details, architecture, and functionality of the ClientAgent class. For information about coordinating multiple agents, see [Swarm Management](#2.2).

## Core Architecture

The ClientAgent class implements the IAgent interface, providing the essential functionality for agent interactions within the swarm system. It serves as a bridge between user inputs, language models, and tools, managing the flow of messages and tool executions.

![Mermaid Diagram](./diagrams\3_Client_Agent_0.svg)

## Agent Initialization and Parameters

When initializing a ClientAgent, it requires an instance of IAgentParams which configures its behavior, including:

- **clientId**: Unique identifier for the client
- **agentName**: Name of the agent
- **history**: History instance for message tracking
- **completion**: Completion model for generating responses
- **logger**: Logger for recording activity
- **bus**: Event bus for inter-component communication
- **mcp**: Model Context Protocol for external tool integration
- **tools**: Optional array of tools available to the agent
- **transform**: Function to transform model outputs
- **validate**: Function to validate outputs before returning them

![Mermaid Diagram](./diagrams\3_Client_Agent_1.svg)

## Execution Flow

The execution flow in ClientAgent is its core functionality. The execute method processes input, gets model completions, executes tools if needed, and emits output.

![Mermaid Diagram](./diagrams\3_Client_Agent_2.svg)

## Tool Handling

ClientAgent's ability to execute tools is a key feature. It extracts tool calls from model completions, validates them, executes them, and handles their results.

### Tool Execution Process

1. Tool calls are extracted from the model completion
2. Each tool is validated before execution
3. Tools are executed asynchronously
4. Tool outputs are committed to history
5. Errors are handled with resurrection strategies

### Tool Abort Controller

The ClientAgent includes a ToolAbortController class for managing tool execution cancellation:

![Mermaid Diagram](./diagrams\3_Client_Agent_3.svg)

## Error Handling and Recovery

ClientAgent includes robust error handling, particularly for tool execution failures. It uses various strategies to recover from errors:

1. **Flush Strategy**: Clears history and begins a new conversation
2. **Recomplete Strategy**: Asks the model to fix the error
3. **Custom Strategy**: Uses a custom function to handle errors

![Mermaid Diagram](./diagrams\3_Client_Agent_4.svg)

## Model Context Protocol Integration

ClientAgent integrates with the Model Context Protocol (MCP) system, allowing agents to interact with external tools in various programming languages. MCP tools are mapped to agent tools via the `mapMcpToolCall` function.

![Mermaid Diagram](./diagrams\3_Client_Agent_5.svg)

## Stateless Execution

The `run` method provides stateless execution, which is useful for one-off computations without affecting history or triggering tool executions.

![Mermaid Diagram](./diagrams\3_Client_Agent_6.svg)

## Integration With Other Components

ClientAgent integrates with several other components in the agent-swarm-kit architecture:

![Mermaid Diagram](./diagrams\3_Client_Agent_7.svg)

## Lifecycle Management

ClientAgent manages its lifecycle through various methods:

1. **Initialization**: Configures with IAgentParams, initializes subjects
2. **Execution**: Processes inputs, generates completions, executes tools
3. **Commit Methods**: Updates history with messages of different types
4. **Disposal**: Releases resources and performs cleanup

## Usage in Services

The ClientAgent is created and managed by the AgentConnectionService, which is exposed via the AgentPublicService. These services provide a clean API for working with agents:

![Mermaid Diagram](./diagrams\3_Client_Agent_8.svg)

## Event System

ClientAgent uses a Subject-based event system for handling asynchronous operations and communication:

- **_outputSubject**: Emits outputs after execution
- **_toolCommitSubject**: Signals tool output commitment
- **_agentChangeSubject**: Signals agent changes
- **_toolErrorSubject**: Signals tool execution errors
- **_toolStopSubject**: Signals tool execution stopping
- **_resqueSubject**: Signals model resurrection

![Mermaid Diagram](./diagrams\3_Client_Agent_9.svg)

## Conclusion

The ClientAgent is the core component that handles individual agent functionality in the agent-swarm-kit. It manages:

1. Execution of inputs with tool support
2. Message history through commit methods
3. Completions from language models
4. Tool calls and their results
5. Error recovery and resurrection
6. Event-based communication

It provides a robust foundation for building complex agent-based systems, with clean interfaces and powerful capabilities.