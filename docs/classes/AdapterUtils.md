# AdapterUtils

## Constructor

```ts
constructor();
```

## Properties

### fromOpenAI

```ts
fromOpenAI: (openai: any, model?: string, response_format?: { type: string; }) => ({ agentName, messages: rawMessages, mode, tools, clientId, }: ICompletionArgs) => Promise<{ content: any; mode: ExecutionMode; agentName: string; role: any; tool_calls: any; }>
```

Creates a function to interact with OpenAI's chat completions.

### fromLMStudio

```ts
fromLMStudio: (openai: any, model?: string, response_format?: { type: string; }) => ({ agentName, messages: rawMessages, mode, tools, clientId, }: ICompletionArgs) => Promise<{ content: any; mode: ExecutionMode; agentName: string; role: any; tool_calls: any; }>
```

Creates a function to interact with LMStudio's chat completions.

### fromOllama

```ts
fromOllama: (ollama: any, model?: string, tool_call_protocol?: string) => ({ agentName, messages: rawMessages, mode, tools, clientId, }: ICompletionArgs) => Promise<any>
```

Creates a function to interact with Ollama's chat completions.
