---
title: docs/api-reference/function/getPayload
group: docs
---

# getPayload

```ts
declare function getPayload<Payload extends object = object>(): Payload | null;
```

Retrieves the payload from the current PayloadContextService context.
Returns null if no context is available. Logs the operation if logging is enabled.
