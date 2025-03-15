# PersistList

Extends `PersistBase<EntityName>`

Extends PersistBase to provide a persistent list structure with push/pop operations.

## Constructor

```ts
constructor(entityName: EntityName, baseDir: string);
```

## Properties

### _lastCount

```ts
_lastCount: number
```

### __@LIST_CREATE_KEY_SYMBOL@527

```ts
__@LIST_CREATE_KEY_SYMBOL@527: any
```

Queued function to create a new unique key for a list item.
Ensures sequential key generation even under concurrent calls.

### __@LIST_GET_LAST_KEY_SYMBOL@528

```ts
__@LIST_GET_LAST_KEY_SYMBOL@528: any
```

Retrieves the key of the last item in the list.

### __@LIST_POP_SYMBOL@530

```ts
__@LIST_POP_SYMBOL@530: any
```

Queued function to remove and return the last item in the list.
Ensures atomic pop operations under concurrent calls.

## Methods

### push

```ts
push<T extends IEntity = IEntity>(entity: T): Promise<void>;
```

Adds an entity to the end of the persistent list with a new unique key.

### pop

```ts
pop<T extends IEntity = IEntity>(): Promise<T | null>;
```

Removes and returns the last entity from the persistent list.
