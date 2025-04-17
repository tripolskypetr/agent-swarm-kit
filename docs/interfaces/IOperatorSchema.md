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
