# IToolCall

Represents a tool call with a function name and arguments.

## Properties

### id

```ts
id: string
```

The ID of the tool call.

### type

```ts
type: "function"
```

The type of the tool. Currently, only `function` is supported.

### function

```ts
function: { name: string; arguments: { [key: string]: any; }; }
```

The function that the model called.
