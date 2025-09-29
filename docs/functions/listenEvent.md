---
title: docs/api-reference/function/listenEvent
group: docs
---

# listenEvent

```ts
declare function listenEvent<T extends unknown = any>(clientId: string, topicName: string, fn: (data: T) => void): () => void;
```

Subscribes to a custom event on the swarm bus service and executes a callback when the event is received.

This function sets up a listener for events with a specified topic on the swarm's bus service, invoking the provided callback with the event's
payload when triggered. It is wrapped in `beginContext` for a clean execution environment, logs the operation if enabled, and enforces restrictions
on reserved topic names (defined in `DISALLOWED_EVENT_SOURCE_LIST`). The callback is queued to ensure sequential processing of events. The function
supports a wildcard client ID ("*") for listening to all clients or validates a specific client session. It returns an unsubscribe function to stop
listening.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | |
| `topicName` | |
| `fn` | |
