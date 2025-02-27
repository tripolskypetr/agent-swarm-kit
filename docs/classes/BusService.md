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

### sessionValidationService

```ts
sessionValidationService: any
```

### _eventSourceSet

```ts
_eventSourceSet: any
```

### _eventWildcardMap

```ts
_eventWildcardMap: any
```

### getEventSubject

```ts
getEventSubject: any
```

### subscribe

```ts
subscribe: <T extends IBaseEvent>(clientId: string, source: string, fn: (event: T) => void) => () => void
```

Subscribes to events for a specific client and source.

### once

```ts
once: <T extends IBaseEvent>(clientId: string, source: string, filterFn: (event: T) => boolean, fn: (event: T) => void) => () => void
```

Subscribes to a single event for a specific client and source.

### emit

```ts
emit: <T extends IBaseEvent>(clientId: string, event: T) => Promise<void>
```

Emits an event for a specific client.

### dispose

```ts
dispose: (clientId: string) => void
```

Disposes of all event subscriptions for a specific client.
