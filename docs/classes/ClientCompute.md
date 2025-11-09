---
title: docs/api-reference/class/ClientCompute
group: docs
---

# ClientCompute

Implements `ICompute<Compute>`

Manages client-side computations, state subscriptions, and lifecycle events.

## Constructor

```ts
constructor(params: IComputeParams<Compute>);
```

## Properties

### params

```ts
params: IComputeParams<Compute>
```

### __@DISPOSE_SLOT_FN_SYMBOL@3149

```ts
__@DISPOSE_SLOT_FN_SYMBOL@3149: any
```

Stores the composed dispose function.

### __@GET_COMPUTE_DATA_FN_SYMBOL@3150

```ts
__@GET_COMPUTE_DATA_FN_SYMBOL@3150: any
```

Memoized function for retrieving compute data.

## Methods

### getComputeData

```ts
getComputeData(): Promise<any>;
```

Retrieves the computation data using a memoized function.

### calculate

```ts
calculate(stateName: StateName): Promise<void>;
```

Triggers a recalculation based on a state change and clears memoized data.

### update

```ts
update(): Promise<void>;
```

Forces an update of the computation and clears memoized data.

### dispose

```ts
dispose(): Promise<void>;
```

Cleans up resources, unsubscribes from state changes, and triggers onDispose callback.
