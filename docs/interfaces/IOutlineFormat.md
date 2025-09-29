---
title: docs/api-reference/interface/IOutlineFormat
group: docs
---

# IOutlineFormat

Interface representing the format/schema definition for outline data.
Specifies the structure, required fields, and property metadata for outline operations.
Used to enforce and document the expected shape of outline data.

## Properties

### type

```ts
type: string
```

The root type of the outline format (e.g., "object").

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
