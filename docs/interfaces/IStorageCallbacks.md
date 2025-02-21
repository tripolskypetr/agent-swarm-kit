# IStorageCallbacks

Interface representing the callbacks for storage events.

## Properties

### onUpdate

```ts
onUpdate: (items: T[], clientId: string, storageName: string) => void
```

Callback function for update events.

### onSearch

```ts
onSearch: (search: string, index: SortedArray<T>, clientId: string, storageName: string) => void
```

Callback function for search events.
