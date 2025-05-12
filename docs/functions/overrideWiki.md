---
title: docs/api-reference/function/overrideWiki
group: docs
---

# overrideWiki

```ts
declare function overrideWiki(wikiSchema: TWikiSchema): IWikiSchema;
```

Overrides an existing wiki schema in the swarm system with a new or partial schema.
This function updates the configuration of a wiki identified by its `wikiName`, applying the provided schema properties.
It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
Logs the override operation if logging is enabled in the global configuration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `wikiSchema` | Optional partial schema properties to update, extending `IWikiSchema`. |
