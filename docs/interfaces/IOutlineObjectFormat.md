---
title: docs/api-reference/interface/IOutlineObjectFormat
group: docs
---

# IOutlineObjectFormat

Interface representing the format/schema definition for outline data.
Specifies the structure, required fields, and property metadata for outline operations.
Used to enforce and document the expected shape of outline data.

## Properties

### type

```ts
type: string
```

The root type of the outline format (e.g., "object").
If openai used Should be "json_object" for partial JSON schemas or "json_schema" for full matching schemas.
If ollama or `toJsonSchema` function used should just pass "object"

### required

```ts
required: string[]
```

Array of property names that are required in the outline data.

### properties

```ts
properties: { [key: string]: { type: string; description: string; enum?: string[]; }; }
```

An object mapping property names to their type, description, and optional enum values.
Each property describes a field in the outline data.
