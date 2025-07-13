---
title: docs/api-reference/interface/IOutlineArgs
group: docs
---

# IOutlineArgs

Interface representing the arguments for an outline operation.
Encapsulates the input param, attempt number, and history for processing.

## Properties

### param

```ts
param: Param
```

The input param for the outline operation.
Contains the raw or structured param to be processed.

### attempt

```ts
attempt: number
```

The current attempt number for the outline operation.
Tracks the number of retries or iterations, useful for validation or retry logic.

### format

```ts
format: IOutlineFormat
```

Format of output taken from outline schema

### history

```ts
history: IOutlineHistory
```

The history management API for the outline operation.
Provides access to message history for context or logging.
