---
title: docs/api-reference/interface/JsonSchema
group: docs
---

# JsonSchema

JSON Schema type definition

## Properties

### type

```ts
type: string
```

### properties

```ts
properties: Record<string, any>
```

### required

```ts
required: string[]
```

### additionalProperties

```ts
additionalProperties: boolean
```

Whether additional properties are allowed in the schema.
Controls validation strictness for object schemas.
