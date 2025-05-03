---
title: docs/api-reference/interface/ICompute
group: docs
---

# ICompute

## Properties

### calculate

```ts
calculate: (stateName: string) => Promise<void>
```

### update

```ts
update: (clientId: string, computeName: string) => Promise<void>
```

### getComputeData

```ts
getComputeData: () => T | Promise<T>
```
