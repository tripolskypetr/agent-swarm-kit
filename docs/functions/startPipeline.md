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
| `clientId` | The client identifier. |
| `pipelineName` | The name of the pipeline to execute. |
| `agentName` | The name of the agent associated with the pipeline. |
| `payload` | Optional payload data for the pipeline. |
