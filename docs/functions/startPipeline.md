---
title: docs/api-reference/function/startPipeline
group: docs
---

# startPipeline

```ts
declare function startPipeline<Payload extends object = any, T = any>(clientId: string, pipelineName: PipelineName, agentName: AgentName, payload?: Payload): Promise<T>;
```

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The clientId parameter. |
| `pipelineName` | The pipelineName parameter. |
| `agentName` | The agentName parameter. |
| `payload` | Payload object containing the data to be processed. |
