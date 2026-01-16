---
title: docs/api-reference/class/PersistList
group: docs
---

# PersistList

Extends `PersistBase<EntityName>`

Extends `PersistBase` to provide a persistent list structure with push/pop operations.
Manages entities with numeric keys for ordered access, suitable for queues or logs in the swarm system.

## Constructor

```ts
constructor(entityName: EntityName, baseDir: string);
```

## Properties

### _lastCount

```ts
_lastCount: number
```

### __@LIST_CREATE_KEY_SYMBOL@625

```ts
__@LIST_CREATE_KEY_SYMBOL@625: () => Promise<string>
```

Queued function to create a new unique key for a list item.
Ensures sequential key generation under concurrent calls using `queued` decorator.

### __@LIST_GET_LAST_KEY_SYMBOL@626

```ts
__@LIST_GET_LAST_KEY_SYMBOL@626: () => Promise<string>
```

Retrieves the key of the last item in the list.
Scans all keys to find the highest numeric value, used for pop operations (e.g., dequeuing from a `SwarmName` log).

### __@LIST_POP_SYMBOL@628

```ts
__@LIST_POP_SYMBOL@628: <T extends IEntity = IEntity>() => Promise<T>
```

Queued function to remove and return the last item in the list.
Ensures atomic pop operations under concurrent calls using `queued` decorator.

## Methods

### push

```ts
push<T extends IEntity = IEntity>(entity: T): Promise<void>;
```

Adds an entity to the end of the persistent list with a new unique numeric key.
Useful for appending items like messages or events in swarm operations (e.g., within a `SwarmName`).

### pop

```ts
pop<T extends IEntity = IEntity>(): Promise<T | null>;
```

Removes and returns the last entity from the persistent list.
Useful for dequeuing items or retrieving recent entries (e.g., latest event in a `SwarmName` log).
