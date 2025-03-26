---
title: docs/api-reference/interface/IHistorySchema
group: docs
---

# IHistorySchema

Interface representing the schema for history configuration.
Defines the underlying storage mechanism for model messages.

## Properties

### items

```ts
items: IHistoryAdapter
```

The adapter responsible for managing the array of model messages.
Provides the implementation for history storage and retrieval.
