# MemorySchemaService

Service to manage memory schema for different sessions.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### memoryMap

```ts
memoryMap: any
```

### writeValue

```ts
writeValue: <T extends object = object>(clientId: string, value: T) => T
```

Writes a value to the memory map for a given client ID.

### readValue

```ts
readValue: <T extends object = object>(clientId: string) => T
```

Reads a value from the memory map for a given client ID.

### dispose

```ts
dispose: (clientId: string) => void
```

Disposes the memory map entry for a given client ID.
