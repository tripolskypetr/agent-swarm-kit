# ITool

Interface representing a tool definition within the swarm system.
Defines the metadata and schema for a callable tool, used by agents (e.g., ClientAgent) to provide the model with available functions and validate/execute tool calls.
Integrated into IAgentParams.tools and passed to ICompletion.getCompletion, enabling the model to generate IToolCall requests based on this specification.

## Properties

### type

```ts
type: string
```

The type of the tool, typically "function" in the current system.
Specifies the tool’s category, aligning with IToolCall.type, though only "function" is observed in ClientAgent usage (e.g., params.tools).
Future extensions might include other types (e.g., "api", "script"), but "function" is standard.

### function

```ts
function: { name: string; description: string; parameters: { type: string; required: string[]; properties: { [key: string]: { type: string; description: string; enum?: string[]; }; }; }; }
```

The function details defining the tool’s capabilities.
Provides the name, description, and parameter schema for the tool, used by the model to understand and invoke it (e.g., in ClientAgent.getCompletion).
Matched against IToolCall.function during execution (e.g., EXECUTE_FN’s targetFn lookup).
