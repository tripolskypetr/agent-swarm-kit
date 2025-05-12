---
title: docs/api-reference/function/addPolicy
group: docs
---

# addPolicy

```ts
declare function addPolicy(policySchema: IPolicySchema): string;
```

Adds a new policy for agents in the swarm system by registering it with validation and schema services.
Registers the policy with PolicyValidationService for runtime validation and PolicySchemaService for schema management.
Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
Integrates with PolicyValidationService (policy registration and validation), PolicySchemaService (schema registration),
and LoggerService (logging). Part of the swarm setup process, enabling policies to govern agent behavior,
complementing runtime functions like commitAssistantMessage by defining operational rules upfront.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `policySchema` | The schema of the policy to be added, including policyName and other configuration details. |
