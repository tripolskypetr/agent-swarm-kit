---
title: docs/api-reference/interface/IAdvisorCallbacks
group: docs
---

# IAdvisorCallbacks

## Properties

### onChat

```ts
onChat: (message: T) => void
```

Optional callback triggered when a chat operation occurs

### onResult

```ts
onResult: (resultId: string, content: string) => void
```

Optional callback triggered when a result is obtained
