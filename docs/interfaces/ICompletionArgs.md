---
title: docs/api-reference/interface/ICompletionArgs
group: docs
---

# ICompletionArgs

Interface representing the arguments required to request a completion.
Encapsulates context and inputs for generating a model response.

## Properties

### clientId

```ts
clientId: string
```

The unique identifier for the client making the request.
This is used to track the request and associate it with the correct client context.
For outline completions, this being skipped

### agentName

```ts
agentName: string
```

The name of the agent for which the completion is requested.
This is used to identify the agent context in which the completion will be generated.

### outlineName

```ts
outlineName: string
```

The outline used for json completions, if applicable.
This is the name of the outline schema that defines the structure of the expected JSON response.
Used to ensure that the completion adheres to the specified outline format.

### mode

```ts
mode: ExecutionMode
```

The source of the last message, indicating whether it originated from a tool or user.

### messages

```ts
messages: (IModelMessage<object> | IOutlineMessage)[]
```

An array of model messages providing the conversation history or context for the completion.

### tools

```ts
tools: ITool[]
```

Optional array of tools available for the completion process (e.g., for tool calls).

### format

```ts
format: IOutlineFormat
```

Optional format for the outline, specifying how the completion should be structured.
This is used to define the expected output format for JSON completions.
If not provided, the default outline format will be used.
