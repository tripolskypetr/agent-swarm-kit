# IModelMessage

Interface representing a model message.

## Properties

### role

```ts
role: "assistant" | "system" | "tool" | "user" | "resque"
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

### tool_calls

```ts
tool_calls: { function: { name: string; arguments: { [key: string]: any; }; }; }[]
```

Optional tool calls associated with the message.
