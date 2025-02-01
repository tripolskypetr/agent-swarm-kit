# IModelMessage

Interface representing a model message.

## Properties

### role

```ts
role: "tool" | "user" | "assistant" | "system" | "resque" | "flush"
```

The role of the message sender.

### agentName

```ts
agentName: string
```

The name of the agent sending the message.

### content

```ts
content: string
```

The content of the message.

### mode

```ts
mode: ExecutionMode
```

The source of message: tool or user

### tool_calls

```ts
tool_calls: { function: { name: string; arguments: { [key: string]: any; }; }; }[]
```

Optional tool calls associated with the message.
