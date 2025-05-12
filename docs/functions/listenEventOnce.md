---
title: docs/api-reference/function/listenEventOnce
group: docs
---

# listenEventOnce

```ts
declare function listenEventOnce<T extends unknown = any>(clientId: string, topicName: string, filterFn: (event: T) => boolean, fn: (data: T) => void): () => void;
```

Subscribes to a custom event on the swarm bus service for a single occurrence, executing a callback when the event matches a filter.

This function sets up a one-time listener for events with a specified topic on the swarm's bus service, invoking the provided callback with the
event's payload when the event is received and passes the filter condition. It is wrapped in `beginContext` for a clean execution environment,
logs the operation if enabled, and enforces restrictions on reserved topic names (defined in `DISALLOWED_EVENT_SOURCE_LIST`). The callback is
queued to ensure sequential processing, and the listener unsubscribes after the first matching event. The function supports a wildcard client ID
("*") for listening to all clients or validates a specific client session. It returns an unsubscribe function to cancel the listener prematurely.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The ID of the client to listen for events from, or "*" to listen to all clients. |
| `topicName` | The name of the event topic to subscribe to (must not be a reserved source). |
| `filterFn` | A function that filters events, returning true to trigger the callback with that event's payload. |
| `fn` | The callback function to execute once when a matching event is received, passed the event payload. |
