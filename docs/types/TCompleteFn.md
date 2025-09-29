---
title: docs/api-reference/type/TCompleteFn
group: docs
---

# TCompleteFn

```ts
type TCompleteFn = (args: ICompletionArgs) => Promise<IModelMessage>;
```

Function type for completing AI model requests.
Takes completion arguments and returns a promise resolving to a model message response.
