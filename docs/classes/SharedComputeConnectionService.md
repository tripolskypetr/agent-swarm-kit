---
title: docs/api-reference/class/SharedComputeConnectionService
group: docs
---

# SharedComputeConnectionService

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

### sharedStateConnectionService

```ts
sharedStateConnectionService: any
```

### computeSchemaService

```ts
computeSchemaService: any
```

### getComputeRef

```ts
getComputeRef: ((computeName: string) => ClientCompute<any>) & IClearableMemoize<string> & IControlMemoize<string, ClientCompute<any>>
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
