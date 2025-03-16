# AdapterUtils

Utility class providing adapter functions for interacting with various AI completion providers.

## Constructor

```ts
constructor();
```

## Properties

### fromOpenAI

```ts
fromOpenAI: (openai: any, model?: string, response_format?: { type: string; }) => TCompleteFn
```

Creates a function to interact with OpenAI's chat completions API.

### fromLMStudio

```ts
fromLMStudio: (openai: any, model?: string, response_format?: { type: string; }) => TCompleteFn
```

Creates a function to interact with LMStudio's chat completions API.

### fromOllama

```ts
fromOllama: (ollama: any, model?: string, tool_call_protocol?: string) => TCompleteFn
```

Creates a function to interact with Ollama's chat completions API.
