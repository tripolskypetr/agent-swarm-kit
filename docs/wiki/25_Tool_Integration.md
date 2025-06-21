---
title: wiki/tool_integration
group: wiki
---

# Tool Integration

This document covers how to create, register, and integrate tools within the agent-swarm-kit framework. Tools are external functions that agents can invoke to perform specific actions, from simple computations to complex navigation between agents. For information about agent lifecycle and execution patterns, see [Building Multi-Agent Systems](#5.1). For state management during tool execution, see [Managing State and Storage](#5.3).

## Tool Architecture Overview

Tools in the agent swarm system follow a structured pattern where they are registered globally, validated before execution, and integrated with agents through schema definitions. The system supports both simple functional tools and complex navigation tools that orchestrate agent transitions.

![Mermaid Diagram](./diagrams\25_Tool_Integration_0.svg)

Sources: [src/functions/setup/addTool.ts](), [src/template/createNavigateToAgent.ts](), [src/template/createNavigateToTriageAgent.ts](), [src/functions/alias/addAgentNavigation.ts](), [src/functions/alias/addTriageNavigation.ts]()

## Basic Tool Structure

All tools follow a standardized interface that includes identification, execution logic, validation, and OpenAI-compatible function schemas for LLM integration.

### Core Tool Properties

| Property | Type | Description |
|----------|------|-------------|
| `toolName` | `ToolName` | Unique identifier for the tool |
| `call` | `async function` | Main execution function |
| `validate` | `async function` | Pre-execution validation |
| `type` | `"function"` | Tool type specification |
| `function` | `object` | OpenAI function schema |

### Tool Registration Pattern

```typescript
const EXAMPLE_TOOL = addTool({
  toolName: "example-tool",
  call: async ({ toolId, clientId, agentName, params }) => {
    // Tool execution logic
    await commitToolOutput(toolId, "Tool executed successfully", clientId, agentName);
  },
  validate: async ({ clientId, agentName, params }) => {
    // Validation logic
    return true;
  },
  type: "function",
  function: {
    name: "example-tool",
    description: "Example tool for demonstration",
    parameters: {
      type: "object",
      properties: {
        input: {
          type: "string", 
          description: "Input parameter"
        }
      },
      required: ["input"]
    }
  }
})
```

Sources: [test/spec/connection.test.mjs:77-98](), [test/spec/navigation.test.mjs:80-114](), [test/spec/validation.test.mjs:48-64]()

## Tool Execution Lifecycle

The tool execution process involves validation, execution, and output handling within the context of agent conversations and LLM completions.

![Mermaid Diagram](./diagrams\25_Tool_Integration_1.svg)

Sources: [test/spec/resque.test.mjs:127-197](), [test/spec/navigation.test.mjs:256-280]()

## Navigation Tools

Navigation tools are specialized tools that manage transitions between agents within a swarm. The system provides templates for creating both agent-specific navigation and triage navigation patterns.

### Agent-to-Agent Navigation

The `createNavigateToAgent` template creates tools that navigate from any agent to a specific target agent:

```typescript
const navigateToSales = createNavigateToAgent({
  toolOutput: (clientId, lastAgent, agentName) => 
    `Successfully navigated from ${lastAgent} to ${agentName}`,
  executeMessage: (clientId, lastMessage, lastAgent, agentName) =>
    `Processing ${lastMessage} for ${clientId} on ${agentName}`,
  beforeNavigate: async (clientId, lastMessage, lastAgent, agentName) => {
    // Pre-navigation logic
  }
});
```

### Triage Navigation Pattern

The `createNavigateToTriageAgent` template handles navigation back to the default/triage agent:

```typescript
const navigateToTriage = createNavigateToTriageAgent({
  toolOutputAccept: (clientId, defaultAgent) =>
    `Successfully navigated to ${defaultAgent}`,
  toolOutputReject: (clientId, defaultAgent) => 
    `Already on ${defaultAgent}. No navigation needed`,
  executeMessage: (clientId, defaultAgent) =>
    `Continue conversation based on the last message`
});
```

Sources: [src/template/createNavigateToAgent.ts:153-262](), [src/template/createNavigateToTriageAgent.ts:118-192]()

## Tool Templates and Aliases

The framework provides high-level aliases that combine tool creation with navigation logic, simplifying the process of adding navigation capabilities to agents.

### Agent Navigation Alias

```typescript
const SALES_NAVIGATION_TOOL = addAgentNavigation({
  toolName: "navigate-to-sales",
  description: "Navigate to the sales agent for sales-related queries",
  navigateTo: "sales-agent",
  toolOutput: "Navigated to sales department",
  executeMessage: "Hello! I'm here to help with your sales inquiry."
});
```

### Triage Navigation Alias  

```typescript
const TRIAGE_NAVIGATION_TOOL = addTriageNavigation({
  toolName: "navigate-to-triage", 
  description: "Navigate back to triage for topic change",
  flushMessage: "Let me redirect you to our main assistant",
  toolOutputAccept: "Redirected to main assistant"
});
```

### Navigation Registration Flow

![Mermaid Diagram](./diagrams\25_Tool_Integration_2.svg)

Sources: [src/functions/alias/addAgentNavigation.ts:37-74](), [src/functions/alias/addTriageNavigation.ts:35-71]()

## Tool Validation and Error Handling

The validation system ensures tools can execute safely within the current session context before actual execution occurs.

### Validation Patterns

Tools implement validation through the `validate` function that receives session context:

```typescript
validate: async ({ clientId, agentName, params }) => {
  // Check session state
  const currentAgent = await getAgentName(clientId);
  if (currentAgent !== agentName) {
    return false; // Tool called on inactive agent
  }
  
  // Validate parameters
  if (!params.requiredField) {
    return false;
  }
  
  return true;
}
```

### Error Recovery Strategies

The system includes rescue mechanisms for tool execution failures:

| Strategy | Trigger | Behavior |
|----------|---------|----------|
| `flush` | Tool validation fails | Clear conversation and emit placeholder |
| `flush` | Tool not found | Clear conversation and retry |
| `flush` | Empty tool output | Clear conversation and emit rescue message |

Sources: [test/spec/resque.test.mjs:21-76](), [test/spec/resque.test.mjs:127-197](), [test/spec/ignore.spec.mjs:17-78]()

## Integration with Agent Completions

Tools integrate with agents through the completion system, where LLMs generate `tool_calls` arrays that trigger tool execution.

### Completion-Tool Integration Flow

![Mermaid Diagram](./diagrams\25_Tool_Integration_3.svg)

### Tool Call Structure in Completions

LLM responses containing tool calls follow this structure:

```json
{
  "role": "assistant",
  "content": "",
  "tool_calls": [
    {
      "function": {
        "name": "navigate-to-sales",
        "arguments": {
          "query": "pricing information"
        }
      }
    }
  ]
}
```

Sources: [test/spec/connection.test.mjs:101-128](), [test/spec/navigation.test.mjs:116-180](), [test/spec/completion.test.mjs:14-50]()

## Advanced Tool Patterns

### Parallel Tool Execution Prevention

The system includes safeguards against multiple tool calls within navigation execution:

```typescript
call: async ({ toolId, clientId, toolCalls }) => {
  if (toolCalls.length > 1) {
    console.error("agent-swarm addAgentNavigation model called multiple tools within navigation execution");
  }
  await navigate(toolId, clientId, navigateTo);
}
```

### Context Isolation with beginContext

Tool templates use `beginContext()` to ensure clean execution scope:

```typescript
return beginContext(async (toolId: string, clientId: string, agentName: AgentName) => {
  // Tool execution in isolated context
  await commitStopToolsForce(clientId);
  await changeToAgent(agentName, clientId);
  await executeForce(message, clientId);
});
```

### Session State Management During Tool Execution

Tools interact with session state through specialized commit functions:

| Function | Purpose |
|----------|---------|
| `commitToolOutput()` | Commit tool result to conversation |
| `commitStopToolsForce()` | Stop pending tool executions |
| `commitFlushForce()` | Clear conversation history |
| `execute()` | Continue agent conversation |
| `emitForce()` | Send message without history |

Sources: [src/template/createNavigateToAgent.ts:170-261](), [src/template/createNavigateToTriageAgent.ts:134-192](), [src/functions/alias/addAgentNavigation.ts:52-56]()