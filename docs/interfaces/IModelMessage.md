# IModelMessage

## Properties

### role

```ts
role: "assistant" | "system" | "tool" | "user" | "resque"
```

### agentName

```ts
agentName: string
```

### content

```ts
content: string
```

### tool_calls

```ts
tool_calls: { function: { name: string; arguments: { [key: string]: any; }; }; }[]
```
