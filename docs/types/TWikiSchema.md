---
title: docs/api-reference/type/TWikiSchema
group: docs
---

# TWikiSchema

```ts
type TWikiSchema = {
    wikiName: IWikiSchema["wikiName"];
} & Partial<IWikiSchema>;
```

Type representing a partial wiki schema configuration.
Used for wiki service configuration with optional properties.
