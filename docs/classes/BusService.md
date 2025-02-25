# BusService

Implements `IBus`

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### getEventSubject

```ts
getEventSubject: any
```

### subscribe

```ts
subscribe: <T extends IBaseEvent>(clientId: string, source: EventSource, fn: (event: T) => void) => () => void
```

### once

```ts
once: <T extends IBaseEvent>(clientId: string, source: EventSource, filterFn: (event: T) => boolean, fn: (event: T) => void) => () => void
```

### emit

```ts
emit: <T extends IBaseEvent>(clientId: string, event: T) => Promise<void>
```

### dispose

```ts
dispose: (clientId: string) => void
```
