---
title: docs/api-reference/function/notifyForce
group: docs
---

# notifyForce

```ts
declare function notifyForce(content: string, clientId: string): Promise<void>;
```

Sends a notification message as output from the swarm session without executing an incoming message.

This function directly sends a provided string as output from the swarm session, bypassing message execution. It is designed exclusively
for sessions established via the "makeConnection" mode. The function validates the session, swarm, and specified agent, ensuring the agent
is still active before sending the notification. Will notify even if the agent was changed. The execution is wrapped in
`beginContext` for a clean environment, logs the operation if enabled, and throws an error if the session mode is not "makeConnection".

## Parameters

| Parameter | Description |
|-----------|-------------|
| `content` | The content to be sent as the notification output. |
| `clientId` | The unique identifier of the client session sending the notification. |
