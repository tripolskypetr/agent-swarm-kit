---
title: docs/api-reference/type/TCompletionSchema
group: docs
---

# TCompletionSchema

```ts
type TCompletionSchema<Message extends IBaseMessage<string> = IBaseMessage<any>, Args extends IBaseCompletionArgs<IBaseMessage<string>> = IBaseCompletionArgs<Message>> = {
    completionName: ICompletionSchema<Message, Args>["completionName"];
} & Partial<ICompletionSchema<Message, Args>>;
```

Type representing a partial completion schema with required completionName.
Used for overriding existing completion configurations with selective updates.
Combines required completion name with optional completion properties.
