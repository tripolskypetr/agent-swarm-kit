---
title: docs/api-reference/class/SharedComputeUtils
group: docs
---

# SharedComputeUtils

## Constructor

```ts
constructor();
```

## Properties

### update

```ts
update: (computeName: string) => Promise<void>
```

### getComputeData

```ts
getComputeData: <T extends unknown = any>(clientId: string, computeName: string) => Promise<T>
```
