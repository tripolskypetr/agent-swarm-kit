---
title: docs/api-reference/function/fork
group: docs
---

# fork

```ts
declare function fork<T = any>(runFn: (clientId: string, agentName: AgentName) => Promise<T | void>, options: IScopeOptions): Promise<T>;
```

Executes a provided function within a managed scope, handling session creation, validation, and cleanup.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `runFn` | The function to execute, receiving clientId and agentName as arguments. |
| `options` | Configuration options for the scope operation. |
