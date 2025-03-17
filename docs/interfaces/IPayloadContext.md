# IPayloadContext

Interface defining the structure of a payload context, used to encapsulate execution metadata and payload data.

## Properties

### clientId

```ts
clientId: string
```

The unique identifier of the client associated with this context.

### payload

```ts
payload: Payload
```

The payload data carried by this context, typed according to the Payload generic.
