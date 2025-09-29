---
title: docs/api-reference/function/overrideStorage
group: docs
---

# overrideStorage

```ts
declare function overrideStorage<T extends IStorageData = IStorageData>(storageSchema: TStorageSchema<T>): IStorageSchema<T>;
```

Overrides an existing storage schema in the swarm system with a new or partial schema.
This function updates the configuration of a storage identified by its `storageName`, applying the provided schema properties.
It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
Logs the override operation if logging is enabled in the global configuration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `storageSchema` | |
