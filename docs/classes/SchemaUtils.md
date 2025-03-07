# SchemaUtils

Utility class for schema-related operations.

## Constructor

```ts
constructor();
```

## Properties

### writeSessionMemory

```ts
writeSessionMemory: <T extends object = object>(clientId: string, value: T) => T
```

Writes a value to the session memory for a given client.

### readSessionMemory

```ts
readSessionMemory: <T extends object = object>(clientId: string) => T
```

Reads a value from the session memory for a given client.

### serialize

```ts
serialize: <T extends object = any>(data: T | T[]) => string
```

Serializes an object or an array of objects into a formatted string.
