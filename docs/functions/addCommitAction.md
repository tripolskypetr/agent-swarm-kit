---
title: docs/api-reference/function/addCommitAction
group: docs
---

# addCommitAction

```ts
declare function addCommitAction<T = Record<string, any>>(params: ICommitActionToolParams<T>): string;
```

Creates and registers a commit action tool for AI to execute actions (WRITE pattern).
This implements the WRITE side of the command pattern - AI calls tool to modify system state.

**Flow:**
1. AI calls tool with parameters
2. validateParams runs (if provided) - validates parameters and returns error message or null
3. If validation fails:
   - Error message is committed as tool output
   - failureMessage is executed (or error message if failureMessage not provided)
   - Flow stops
4. If validation passes:
   - executeAction runs - performs the action
   - Action result is committed as tool output (or emptyContent if result is empty)
   - successMessage is executed

## Parameters

| Parameter | Description |
|-----------|-------------|
| `params` | Configuration object for the action tool |
