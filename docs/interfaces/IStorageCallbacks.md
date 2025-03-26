---
title: docs/api-reference/interface/IStorageCallbacks
group: docs
---

# IStorageCallbacks

Interface representing callbacks for storage lifecycle and operational events.
Provides hooks for updates, searches, initialization, and disposal.

## Properties

### onUpdate

```ts
onUpdate: (items: T[], clientId: string, storageName: string) => void
```

Callback triggered when storage data is updated (e.g., via upsert or remove).
Useful for logging or synchronizing state.

### onSearch

```ts
onSearch: (search: string, index: SortedArray<T>, clientId: string, storageName: string) => void
```

Callback triggered during a search operation on the storage.

### onInit

```ts
onInit: (clientId: string, storageName: string) => void
```

Callback triggered when the storage is initialized.
Useful for setup or logging.

### onDispose

```ts
onDispose: (clientId: string, storageName: string) => void
```

Callback triggered when the storage is disposed of.
Useful for cleanup or logging.
