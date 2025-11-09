---
title: docs/api-reference/class/SchemaUtils
group: docs
---

# SchemaUtils

Utility class for managing schema-related operations, including session memory access and data serialization.
Provides methods to read/write client session memory and serialize objects into formatted strings.

## Constructor

```ts
constructor();
```

## Properties

### __@PERSIST_WRITE_SYMBOL@4438

```ts
__@PERSIST_WRITE_SYMBOL@4438: any
```

### writeSessionMemory

```ts
writeSessionMemory: <T extends object = object>(clientId: string, value: T) => Promise<T>
```

Writes a value to the session memory for a given client.
Executes within a context for logging and validation, ensuring the client session is valid.

### readSessionMemory

```ts
readSessionMemory: <T extends object = object>(clientId: string) => Promise<T>
```

Reads a value from the session memory for a given client.
Executes within a context for logging and validation, ensuring the client session is valid.

### serialize

```ts
serialize: <T extends object = any>(data: T | T[], map?: { mapKey?: (name: string) => string; mapValue?: (key: string, value: string) => string; }) => string
```

Serializes an object or array of objects into a formatted string.
Flattens nested objects and applies optional key/value mapping functions for formatting.
