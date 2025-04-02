---
title: docs/api-reference/class/WikiValidationService
group: docs
---

# WikiValidationService

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### _wikiMap

```ts
_wikiMap: any
```

### addWiki

```ts
addWiki: (wikiName: string, wikiSchema: IWikiSchema) => void
```

Adds a wiki schema to the validation service

### validate

```ts
validate: (wikiName: string, source: string) => void
```

Validates the existence of a wiki
