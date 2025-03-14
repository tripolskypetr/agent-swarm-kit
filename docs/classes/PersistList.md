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

### __@LIST_CREATE_KEY_SYMBOL@517

```ts
__@LIST_CREATE_KEY_SYMBOL@517: any
```

Creates a new unique key for a list item

### __@LIST_GET_LAST_KEY_SYMBOL@518

```ts
__@LIST_GET_LAST_KEY_SYMBOL@518: any
```

Gets the key of the last item in the list

### __@LIST_POP_SYMBOL@520

```ts
__@LIST_POP_SYMBOL@520: any
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
pop(): Promise<IEntity>;
```

Removes and returns the last entity in the list
