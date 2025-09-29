---
title: docs/api-reference/function/event
group: docs
---

# event

```ts
declare function event<T extends unknown = any>(clientId: string, topicName: string, payload: T): Promise<void>;
```

Emits a custom event to the swarm bus service.

This function sends a custom event with a specified topic and payload to the swarm's bus service, allowing clients to broadcast messages
for other components to listen to. It is wrapped in `beginContext` for a clean execution environment and logs the operation if enabled.
The function enforces a restriction on reserved topic names (defined in `DISALLOWED_EVENT_SOURCE_LIST`), throwing an error if a reserved
topic is used. The event is structured as an `ICustomEvent` with the provided `clientId`, `topicName` as the source, and `payload`.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The clientId parameter. |
| `topicName` | The topicName parameter. |
| `payload` | Payload object containing the data to be processed. |
