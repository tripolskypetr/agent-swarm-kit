---
title: docs/api-reference/interface/IPipelineSchema
group: docs
---

# IPipelineSchema

Defines the schema for a pipeline, including execution logic and optional callbacks.

## Properties

### pipelineName

```ts
pipelineName: string
```

The name of the pipeline.

### execute

```ts
execute: <T = any>(clientId: string, agentName: string, payload: Payload) => Promise<void | T>
```

Function to execute the pipeline logic.

### callbacks

```ts
callbacks: Partial<IPipelineCallbacks<Payload>>
```

Optional callbacks for pipeline lifecycle events.
Provides hooks for monitoring pipeline execution, handling errors, and customizing behavior.
