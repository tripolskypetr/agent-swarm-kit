---
title: docs/api-reference/interface/IOutlineSchemaFormat
group: docs
---

# IOutlineSchemaFormat

Interface representing a format definition using a JSON schema.
Specifies the type and the associated JSON schema object for validation.
Used when the outline format is defined by a complete JSON schema.

## Properties

### type

```ts
type: string
```

The type of the outline format (e.g., "json_schema").

### json_schema

```ts
json_schema: object
```

The JSON schema object defining the structure and validation rules.
