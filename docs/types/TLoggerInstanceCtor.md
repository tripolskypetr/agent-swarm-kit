---
title: docs/api-reference/type/TLoggerInstanceCtor
group: docs
---

# TLoggerInstanceCtor

```ts
type TLoggerInstanceCtor = new (clientId: string, callbacks: Partial<ILoggerInstanceCallbacks>) => ILoggerInstance;
```

Constructor type for creating logger instances.
Used by LoggerUtils to instantiate custom or default LoggerInstance objects.
