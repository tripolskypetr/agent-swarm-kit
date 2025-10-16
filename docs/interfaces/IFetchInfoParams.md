---
title: docs/api-reference/interface/IFetchInfoParams
group: docs
---

# IFetchInfoParams

Configuration parameters for creating a fetch info handler.
Defines the data fetching logic and optional content transformation.

## Properties

### fetchContent

```ts
fetchContent: (clientId: string, agentName: string) => string | Promise<string>
```

Function to fetch the content/data to be provided to the agent.
This is the main data retrieval logic.

### unavailableMessage

```ts
unavailableMessage: string | ((content: string, clientId: string, agentName: string, toolName: string) => string | Promise<string>)
```

Optional message or function to return when content is unavailable.
Used when fetchContent returns empty/null content.
