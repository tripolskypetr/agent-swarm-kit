---
title: docs/api-reference/function/addStorage
group: docs
---

# addStorage

```ts
declare function addStorage<T extends IStorageData = IStorageData>(storageSchema: IStorageSchema<T>): string;
```

Adds a new storage engine to the storage registry for use within the swarm system.

This function registers a new storage engine, enabling the swarm to manage and utilize it for persistent data storage across agents or sessions.
Only storages registered through this function are recognized by the swarm. If the storage is marked as shared, it initializes a connection to the
shared storage service and waits for its initialization. The execution is wrapped in `beginContext` to ensure it runs outside of existing method
and execution contexts, providing a clean execution environment. The function logs the operation if enabled and returns the storage's name upon
successful registration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `storageSchema` | |
