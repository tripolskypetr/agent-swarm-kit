---
title: docs/api-reference/class/ComputeConnectionService
group: docs
---

# ComputeConnectionService

Implements `ICompute<T>`

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### busService

```ts
busService: any
```

### methodContextService

```ts
methodContextService: any
```

### computeSchemaService

```ts
computeSchemaService: any
```

### sessionValidationService

```ts
sessionValidationService: any
```

### stateConnectionService

```ts
stateConnectionService: any
```

### sharedComputeConnectionService

```ts
sharedComputeConnectionService: any
```

### _sharedComputeSet

```ts
_sharedComputeSet: any
```

### getComputeRef

```ts
getComputeRef: ((clientId: string, computeName: string) => ClientCompute<any>) & IClearableMemoize<string> & IControlMemoize<string, ClientCompute<any>>
```

### getComputeData

```ts
getComputeData: () => Promise<any>
```

### calculate

```ts
calculate: (stateName: string) => Promise<void>
```

### update

```ts
update: () => Promise<void>
```

### dispose

```ts
dispose: () => Promise<void>
```
