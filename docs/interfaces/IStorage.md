# IStorage

## Methods

### take

```ts
take: (search: string, total: number, score?: number) => Promise<T[]>
```

### upsert

```ts
upsert: (item: T) => Promise<void>
```

### remove

```ts
remove: (itemId: StorageId) => Promise<void>
```

### get

```ts
get: (itemId: StorageId) => Promise<T>
```

### list

```ts
list: (filter?: (item: T) => boolean) => Promise<T[]>
```

### clear

```ts
clear: () => Promise<void>
```
