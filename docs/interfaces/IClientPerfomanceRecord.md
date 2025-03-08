# IClientPerfomanceRecord

Interface representing a client performance record.

## Properties

### clientId

```ts
clientId: string
```

Client ID.

### sessionMemory

```ts
sessionMemory: Record<string, unknown>
```

The memory of client session

### sessionState

```ts
sessionState: Record<string, unknown>
```

The state of client session

### executionCount

```ts
executionCount: number
```

Execution count.

### executionInputTotal

```ts
executionInputTotal: number
```

Total execution input.

### executionOutputTotal

```ts
executionOutputTotal: number
```

Total execution output.

### executionInputAverage

```ts
executionInputAverage: number
```

Average execution input.

### executionOutputAverage

```ts
executionOutputAverage: number
```

Average execution output.

### executionTimeTotal

```ts
executionTimeTotal: string
```

Total execution time as a string.

### executionTimeAverage

```ts
executionTimeAverage: string
```

Average execution time as a string.
