---
title: docs/api-reference/function/overridePipeline
group: docs
---

# overridePipeline

```ts
declare function overridePipeline<Payload extends object = any>(pipelineSchema: IPipelineSchema<Payload>): Promise<IPipelineSchema<Payload>>;
```

Overrides an existing pipeline schema with provided partial updates.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `pipelineSchema` | Partial pipeline schema with updates to be applied to the existing pipeline configuration. |
