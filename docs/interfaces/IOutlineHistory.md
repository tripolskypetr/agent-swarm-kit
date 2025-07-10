---
title: docs/api-reference/interface/IOutlineHistory
group: docs
---

# IOutlineHistory

Interface representing the history management API for outline operations.
Provides methods to manage message history, such as adding, clearing, and listing messages.

## Methods

### push

```ts
push: (...messages: (IOutlineMessage | IOutlineMessage[])[]) => Promise<void>
```

Adds one or more messages to the outline history.
Supports both single messages and arrays of messages for flexibility.

### clear

```ts
clear: () => Promise<void>
```

Clears all messages from the outline history.
Resets the history to an empty state.

### list

```ts
list: () => Promise<IOutlineMessage[]>
```

Retrieves all messages in the outline history.
