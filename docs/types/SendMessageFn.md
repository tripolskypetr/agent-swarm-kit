---
title: docs/api-reference/type/SendMessageFn
group: docs
---

# SendMessageFn

```ts
type SendMessageFn<T = void> = (outgoing: IOutgoingMessage) => Promise<T>;
```

Type representing a function for sending messages.
