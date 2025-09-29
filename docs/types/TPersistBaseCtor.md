---
title: docs/api-reference/type/TPersistBaseCtor
group: docs
---

# TPersistBaseCtor

```ts
type TPersistBaseCtor<EntityName extends string = string, Entity extends IEntity = IEntity> = new (entityName: EntityName, baseDir: string) => IPersistBase<Entity>;
```

Defines a constructor type for creating `PersistBase` instances, parameterized by entity name and type.
Enables customization of persistence behavior through subclassing or adapter injection (e.g., for swarm or state persistence).
