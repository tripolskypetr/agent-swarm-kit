---
title: docs/api-reference/function/addCommitAction
group: docs
---

# addCommitAction

```ts
declare function addCommitAction<T = Record<string, any>>(params: ICommitActionToolParams<T>): string;
```

Creates and registers a commit action tool for an agent to validate and execute actions.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `params` | The parameters or configuration object. |
