---
title: docs/api-reference/type/ReceiveMessageFn
group: docs
---

# ReceiveMessageFn

```ts
type ReceiveMessageFn<T = void> = (incoming: IIncomingMessage) => Promise<T>;
```

Type representing a function for receiving messages.
