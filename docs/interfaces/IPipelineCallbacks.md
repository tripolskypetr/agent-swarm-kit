---
title: docs/api-reference/interface/IPipelineCallbacks
group: docs
---

# IPipelineCallbacks

## Properties

### onStart

```ts
onStart: (clientId: string, pipelineName: string, payload: Payload) => void
```

### onEnd

```ts
onEnd: (clientId: string, pipelineName: string, payload: Payload, isError: boolean) => void
```

### onError

```ts
onError: (clientId: string, pipelineName: string, payload: Payload, error: Error) => void
```
