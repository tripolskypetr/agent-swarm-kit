---
title: docs/api-reference/function/addAdvisor
group: docs
---

# addAdvisor

```ts
declare function addAdvisor<T = string>(advisorSchema: IAdvisorSchema<T>): string;
```

Adds an advisor schema to the system.
Registers the advisor with validation and schema services, making it available for chat operations.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `advisorSchema` | The schema definition for advisor, including name, chat handler, and optional callbacks. |
