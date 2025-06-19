---
title: docs/api-reference/class/AdapterUtils
group: docs
---

# AdapterUtils

Utility class providing adapter functions for interacting with various AI completion providers.

## Constructor

```ts
constructor();
```

## Properties

### fromCortex

```ts
fromCortex: (model?: string, baseUrl?: string) => TCompleteFn
```

Creates a function to interact with Cortex's chat completions API.

### fromGrok

```ts
fromGrok: (grok: any, model?: string) => TCompleteFn
```

Creates a function to interact with Grok's chat completions API.

### fromCohereClientV2

```ts
fromCohereClientV2: (cohere: any, model?: string) => TCompleteFn
```

Creates a function to interact with CohereClientV2 chat completions API.

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
