---
title: docs/api-reference/interface/IFetchInfoParams
group: docs
---

# IFetchInfoParams

Configuration parameters for creating a fetch info handler (READ pattern).
Defines the data fetching logic without modifying system state.

## Properties

### fallback

```ts
fallback: (error: Error, clientId: string, agentName: string) => void
```

Optional function to handle errors during fetch execution.
Receives the error object, client ID, and agent name.

### fetchContent

```ts
fetchContent: (params: T, clientId: string, agentName: string) => string | Promise<string>
```

Function to fetch the content/data to be provided to the agent.
This is the main data retrieval logic.

### emptyContent

```ts
emptyContent: (content: string, clientId: string, agentName: string, toolName: string) => string | Promise<string>
```

Optional function to handle when fetchContent returns empty result.
Returns message to commit as tool output.
