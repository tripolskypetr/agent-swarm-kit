---
title: docs/api-reference/interface/ICompletionCallbacks
group: docs
---

# ICompletionCallbacks

Interface representing lifecycle callbacks for completion events.
Provides hooks for post-completion actions.

## Properties

### onComplete

```ts
onComplete: (args: ICompletionArgs, output: IModelMessage<object> | IOutlineMessage) => void
```

Optional callback triggered after a completion is successfully generated.
Useful for logging, output processing, or triggering side effects.
