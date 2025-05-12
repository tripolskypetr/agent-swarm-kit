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
| `runFn` | The function to execute within the schema context. |
| `options` | Optional overrides for schema services, with defaults from the swarm's schema services. |
