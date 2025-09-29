---
title: docs/api-reference/type/TChatInstanceCtor
group: docs
---

# TChatInstanceCtor

```ts
type TChatInstanceCtor = new <Payload extends unknown = any>(clientId: SessionId, swarmName: SwarmName, onDispose: DisposeFn, callbacks: IChatInstanceCallbacks, payload: Payload) => IChatInstance;
```

Constructor type for creating chat instances with dispose callback.
