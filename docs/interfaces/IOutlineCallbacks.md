---
title: docs/api-reference/interface/IOutlineCallbacks
group: docs
---

# IOutlineCallbacks

Interface defining callbacks for outline lifecycle events.
Provides hooks for handling attempt initiation, document generation, and validation outcomes.

## Properties

### onAttempt

```ts
onAttempt: (args: IOutlineArgs<Param>) => void
```

Optional callback triggered when an outline attempt is initiated.
Useful for logging or tracking attempt starts.

### onDocument

```ts
onDocument: (result: IOutlineResult<Data, Param>) => void
```

Optional callback triggered when an outline document is generated.
Useful for processing or logging the generated document.

### onValidDocument

```ts
onValidDocument: (result: IOutlineResult<Data, Param>) => void
```

Optional callback triggered when a document passes validation.
Useful for handling successful validation outcomes.

### onInvalidDocument

```ts
onInvalidDocument: (result: IOutlineResult<Data, Param>) => void
```

Optional callback triggered when a document fails validation.
Useful for handling failed validation outcomes or retries.
