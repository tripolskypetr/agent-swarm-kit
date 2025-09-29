---
title: docs/api-reference/type/TAgentConnectionService
group: docs
---

# TAgentConnectionService

```ts
type TAgentConnectionService = {
    [key in Exclude<keyof IAgentConnectionService, InternalKeys$b>]: unknown;
};
```

Type representing the public interface of AgentPublicService, derived from IAgentConnectionService.
Excludes internal methods (e.g., getAgent) via InternalKeys, ensuring a consistent public API for agent operations.
