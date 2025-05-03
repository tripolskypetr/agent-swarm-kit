---
title: docs/api-reference/interface/IComputeSchema
group: docs
---

# IComputeSchema

## Properties

### docDescription

```ts
docDescription: string
```

### shared

```ts
shared: boolean
```

### computeName

```ts
computeName: string
```

### getComputeData

```ts
getComputeData: (clientId: string, computeName: string) => T | Promise<T>
```

### dependsOn

```ts
dependsOn: string[]
```

### middlewares

```ts
middlewares: IComputeMiddleware<T>[]
```

### callbacks

```ts
callbacks: Partial<IComputeCallbacks<T>>
```
