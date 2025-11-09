---
title: docs/api-reference/interface/IOutlineCompletionArgs
group: docs
---

# IOutlineCompletionArgs

Interface representing the arguments for outline (JSON) completions.
Extends base completion args with outline-specific fields for structured JSON output.
Used for completions that return data conforming to a predefined schema.

## Properties

### outlineName

```ts
outlineName: string
```

The outline schema name (required).
Defines the structure of the expected JSON response.

### format

```ts
format: IOutlineFormat
```

The outline format (required).
Specifies how the completion should be structured.
