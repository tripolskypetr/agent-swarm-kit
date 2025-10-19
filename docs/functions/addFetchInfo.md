---
title: docs/api-reference/function/addFetchInfo
group: docs
---

# addFetchInfo

```ts
declare function addFetchInfo<T = Record<string, any>>(params: IFetchInfoToolParams<T>): string;
```

Creates and registers a fetch info tool for AI to retrieve data (READ pattern).
This implements the READ side of the command pattern - AI calls tool to get information without modifying state.

**Flow:**
1. AI calls tool with parameters
2. validateParams runs (if provided) - validates parameters structure. Returns true if valid, false if invalid
3. If validation fails (returns false), tool execution is blocked
4. If validation passes, fetchContent executes - retrieves data
5. AI receives fetched content as tool output
6. If content is empty, emptyContent handler is called

## Parameters

| Parameter | Description |
|-----------|-------------|
| `params` | Configuration object for the fetch tool |
