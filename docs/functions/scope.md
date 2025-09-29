---
title: docs/api-reference/function/scope
group: docs
---

# scope

```ts
declare function scope<T = any>(runFn: () => Promise<T | void>, options?: ScopeOptions): Promise<T>;
```

Executes a provided function within a schema context, with optional overrides for schema services such as agents, completions, and pipelines.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `runFn` | Function to execute within the managed scope, receiving clientId and agentName as arguments. |
| `options` | Configuration options for schema service overrides. |
