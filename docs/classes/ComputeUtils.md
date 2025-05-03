---
title: docs/api-reference/class/ComputeUtils
group: docs
---

# ComputeUtils

## Constructor

```ts
constructor();
```

## Properties

### update

```ts
update: (clientId: string, computeName: string) => Promise<void>
```

### getComputeData

```ts
getComputeData: <T extends unknown = any>(clientId: string, computeName: string) => Promise<T>
```
