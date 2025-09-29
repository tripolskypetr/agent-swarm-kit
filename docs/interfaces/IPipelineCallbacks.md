---
title: docs/api-reference/interface/IPipelineCallbacks
group: docs
---

# IPipelineCallbacks

*  * Defines callback functions for pipeline lifecycle events.

## Properties

### onStart

```ts
onStart: (clientId: string, pipelineName: string, payload: Payload) => void
```

* Called when the pipeline execution starts.
*    *

### onEnd

```ts
onEnd: (clientId: string, pipelineName: string, payload: Payload, isError: boolean) => void
```

* Called when the pipeline execution ends, indicating success or failure.
*    *    *

### onError

```ts
onError: (clientId: string, pipelineName: string, payload: Payload, error: Error) => void
```

Called when an error occurs during pipeline execution.
Provides error handling capabilities for pipeline failures and debugging.
