---
title: docs/api-reference/class/ToolAbortController
group: docs
---

# ToolAbortController

A utility class for managing the lifecycle of an `AbortController` instance.
Provides a mechanism to signal and handle abort events for asynchronous operations.

This class is used to create and manage an `AbortController` instance, allowing
consumers to access the `AbortSignal` and trigger abort events when necessary.

## Constructor

```ts
constructor();
```

## Properties

### _abortController

```ts
_abortController: any
```

The internal `AbortController` instance used to manage abort signals.
If `AbortController` is not available in the global environment, this will be `null`.

## Methods

### abort

```ts
abort(): void;
```

Triggers the abort event on the internal `AbortController`, signaling any listeners
that the associated operation should be aborted.

If no `AbortController` instance exists, this method does nothing.
