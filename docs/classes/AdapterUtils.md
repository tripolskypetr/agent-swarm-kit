# AdapterUtils

## Constructor

```ts
constructor();
```

## Properties

### fromOpenAI

```ts
fromOpenAI: (openai: any, model?: string, response_format?: { type: string; }) => ({ agentName, messages: rawMessages, mode, tools, clientId, }: ICompletionArgs$1) => Promise<{ content: any; mode: ExecutionMode; agentName: string; role: any; tool_calls: any; }>
```

Creates a function to interact with OpenAI's chat completions.
