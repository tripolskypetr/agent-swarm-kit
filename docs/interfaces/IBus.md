# IBus

Interface representing a Bus.

## Methods

### emit

```ts
emit: <T extends IBaseEvent>(clientId: string, event: T) => Promise<void>
```

Emits an event to a specific client.
