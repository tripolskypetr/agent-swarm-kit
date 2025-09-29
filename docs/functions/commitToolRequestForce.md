---
title: docs/api-reference/function/commitToolRequestForce
group: docs
---

# commitToolRequestForce

```ts
declare function commitToolRequestForce(request: IToolRequest[], clientId: string): Promise<string[]>;
```

Forcefully commits a tool request to the active agent in the swarm system.
Validates the session and swarm, bypassing agent validation to directly commit the request.
Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `request` | The tool request(s) to be processed. |
| `clientId` | The unique identifier of the client session. |
