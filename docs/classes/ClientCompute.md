---
title: docs/api-reference/class/ClientCompute
group: docs
---

# ClientCompute

Implements `ICompute<Compute>`

## Constructor

```ts
constructor(params: IComputeParams<Compute>);
```

## Properties

### params

```ts
params: IComputeParams<Compute>
```

### __@DISPOSE_SLOT_FN_SYMBOL@2927

```ts
__@DISPOSE_SLOT_FN_SYMBOL@2927: any
```

### __@GET_COMPUTE_DATA_FN_SYMBOL@2928

```ts
__@GET_COMPUTE_DATA_FN_SYMBOL@2928: any
```

## Methods

### getComputeData

```ts
getComputeData(): Promise<any>;
```

### calculate

```ts
calculate(stateName: StateName): Promise<void>;
```

### update

```ts
update(): Promise<void>;
```

### dispose

```ts
dispose(): Promise<void>;
```
