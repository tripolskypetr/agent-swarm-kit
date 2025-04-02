---
title: docs/api-reference/interface/IWikiSchema
group: docs
---

# IWikiSchema

## Properties

### docDescription

```ts
docDescription: string
```

Optional description of the wiki documentation

### wikiName

```ts
wikiName: string
```

Name identifier for the wiki

### callbacks

```ts
callbacks: IWikiCallbacks
```

Optional callbacks for wiki operations

## Methods

### getChat

```ts
getChat: (args: IChatArgs) => Promise<string>
```

Function to get chat response
