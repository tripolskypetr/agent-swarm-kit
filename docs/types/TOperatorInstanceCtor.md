---
title: docs/api-reference/type/TOperatorInstanceCtor
group: docs
---

# TOperatorInstanceCtor

```ts
type TOperatorInstanceCtor = new (clientId: string, agentName: AgentName, callbacks: Partial<IOperatorInstanceCallbacks>) => IOperatorInstance;
```

Constructor type for OperatorInstance.
Defines the signature for creating operator instances with client ID, agent name, and callbacks.
