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

### ttl

```ts
ttl: number
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

Optional callbacks for compute lifecycle events.
Provides hooks for handling compute updates, data changes, and other lifecycle events.
