# PersistList

Extends `PersistBase<EntityName>`

Class for persistent storage of entities in a list structure

## Constructor

```ts
constructor(entityName: EntityName, baseDir: string);
```

## Properties

### _lastCount

```ts
_lastCount: number
```

Tracks the last used numeric key

### __@LIST_CREATE_KEY_SYMBOL@525

```ts
__@LIST_CREATE_KEY_SYMBOL@525: any
```

Creates a new unique key for a list item

### __@LIST_GET_LAST_KEY_SYMBOL@526

```ts
__@LIST_GET_LAST_KEY_SYMBOL@526: any
```

Gets the key of the last item in the list

### __@LIST_POP_SYMBOL@528

```ts
__@LIST_POP_SYMBOL@528: any
```

Removes and returns the last item in the list

## Methods

### push

```ts
push<T extends IEntity = IEntity>(entity: T): Promise<void>;
```

Adds an entity to the end of the list

### pop

```ts
pop<T extends IEntity = IEntity>(): Promise<T | null>;
```

Removes and returns the last entity in the list
