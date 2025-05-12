---
title: docs/api-reference/function/getNavigationRoute
group: docs
---

# getNavigationRoute

```ts
declare function getNavigationRoute(clientId: string, swarmName: SwarmName): Set<string>;
```

Retrieves the navigation route for a given client and swarm.
Delegates to `NavigationValidationService.getNavigationRoute` to obtain a `Set` of visited agent names,
with optional logging based on global configuration.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `clientId` | The unique identifier of the client requesting the navigation route. |
| `swarmName` | The name of the swarm context for which the route is retrieved. |
