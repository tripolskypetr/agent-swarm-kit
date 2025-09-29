---
title: docs/api-reference/interface/IOperatorSchema
group: docs
---

# IOperatorSchema

## Properties

### connectOperator

```ts
connectOperator: (clientId: string, agentName: string) => (message: string, next: (answer: string) => void) => DisposeFn$2
```

Operator connection function to passthrough the chat into operator dashboard.
Enables real-time monitoring and control of agent interactions through an external interface.
