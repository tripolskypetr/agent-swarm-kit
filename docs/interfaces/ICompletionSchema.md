---
title: docs/api-reference/interface/ICompletionSchema
group: docs
---

# ICompletionSchema

Interface representing the schema for configuring a completion mechanism.
Defines how completions are generated within the swarm.

## Properties

### completionName

```ts
completionName: string
```

The unique name of the completion mechanism within the swarm.

### json

```ts
json: boolean
```

### flags

```ts
flags: string[]
```

List of flags for llm model. As example, `/no_think` for `lmstudio-community/Qwen3-32B-GGUF`

### callbacks

```ts
callbacks: Partial<ICompletionCallbacks<Message, Args>>
```

Optional partial set of callbacks for completion events, allowing customization of post-completion behavior.

## Methods

### getCompletion

```ts
getCompletion: (args: Args) => Promise<Message>
```

Retrieves a completion based on the provided arguments.
Generates a model response using the given context and tools.
