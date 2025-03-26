---
title: docs/api-reference/interface/IToolCall
group: docs
---

# IToolCall

Interface representing a tool call request within the swarm system.
Encapsulates a specific invocation of a tool as requested by the model, used in agent workflows (e.g., ClientAgent) to bridge model outputs to executable actions.
Appears in IModelMessage.tool_calls (e.g., via ICompletion.getCompletion) and is processed by agents to execute tools, emit events (e.g., IBus.emit "commit-tool-output"), and update history (e.g., IHistory.push).

## Properties

### id

```ts
id: string
```

The unique identifier of the tool call.
Assigned to distinguish this invocation from others, often generated randomly (e.g., randomString() in ClientAgent.mapToolCalls) or provided by the model.
Used to correlate tool outputs back to their requests (e.g., tool_call_id in IModelMessage).
Example: "tool-xyz123" for a specific call in EXECUTE_FN.

### type

```ts
type: "function"
```

The type of the tool being called, currently fixed to "function".
Indicates that the tool is a callable function, aligning with the swarm’s function-based tool model (e.g., ClientAgent.createToolCall).
Future extensions might support other types, but "function" is the only supported value as observed.

### function

```ts
function: { name: string; arguments: { [key: string]: any; }; }
```

The function details specifying the tool to be executed.
Defines the name and arguments of the function to invoke, derived from model outputs (e.g., ICompletion.getCompletion in ClientAgent).
Processed by agents to match against ITool definitions and execute via callbacks (e.g., targetFn.call).
