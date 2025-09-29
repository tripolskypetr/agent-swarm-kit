---
title: docs/api-reference/interface/IPipelineSchema
group: docs
---

# IPipelineSchema

## Properties

### pipelineName

```ts
pipelineName: string
```

### execute

```ts
execute: <T = any>(clientId: string, agentName: string, payload: Payload) => Promise<void | T>
```

### callbacks

```ts
callbacks: Partial<IPipelineCallbacks<Payload>>
```

Optional callbacks for pipeline lifecycle events.
Provides hooks for monitoring pipeline execution, handling errors, and customizing behavior.
