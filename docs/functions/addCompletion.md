---
title: docs/api-reference/function/addCompletion
group: docs
---

# addCompletion

```ts
declare function addCompletion<Message extends IBaseMessage<any> = IBaseMessage<string>, Args extends IBaseCompletionArgs<IBaseMessage<string>> = IBaseCompletionArgs<Message>>(completionSchema: ICompletionSchema<Message, Args>): string;
```

Adds a completion engine to the registry for use by agents in the swarm system.

This function registers a completion engine, enabling agents to utilize various models and frameworks (e.g., mock, GPT4All, Ollama, OpenAI)
for generating completions. The completion schema is added to the validation and schema services, making it available for agent operations.
The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.
The function logs the operation if enabled and returns the completion's name upon successful registration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `completionSchema` | The schema definition for completion. |
