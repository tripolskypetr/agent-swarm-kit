# ITool

Represents a tool with a type and function details.

## Properties

### type

```ts
type: string
```

The type of the tool.

### function

```ts
function: { name: string; description: string; parameters: { type: string; required: string[]; properties: { [key: string]: { type: string; description: string; enum?: string[]; }; }; }; }
```
