# StorageValidationService

Service for validating storages within the storage swarm.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### embeddingValidationService

```ts
embeddingValidationService: any
```

### _storageMap

```ts
_storageMap: any
```

### addStorage

```ts
addStorage: (storageName: string, storageSchema: IStorageSchema<IStorageData>) => void
```

Adds a new storage to the validation service.

### validate

```ts
validate: (storageName: string, source: string) => void
```

Validates an storage by its name and source.
