# TPersistBaseCtor

```ts
type TPersistBaseCtor<EntityName extends string = string, Entity extends IEntity = IEntity> = new (entityName: EntityName, baseDir: string) => IPersistBase<Entity>;
```

Type definition for PersistBase constructor
