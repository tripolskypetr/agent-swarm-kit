---
title: docs/api-reference/class/NavigationValidationService
group: docs
---

# NavigationValidationService

Service for validating and managing navigation logic within the swarm system.
Ensures agents are navigated efficiently by tracking visited agents and preventing redundant navigation.
Integrates with `LoggerService` for logging and uses memoization to optimize route tracking.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Injected logger service for recording navigation events and debugging information.
Implements `ILogger` to provide log, debug, and info-level logging.

### getNavigationRoute

```ts
getNavigationRoute: any
```

Memoized function to retrieve or create a navigation route for a client and swarm.
Returns a `Set` of visited `AgentName`s, keyed by a combination of `clientId` and `swarmName`.
Uses memoization to ensure route persistence across calls while optimizing performance.

### shouldNavigate

```ts
shouldNavigate: (agentName: string, clientId: string, swarmName: string) => boolean
```

Determines if navigation to a specific agent should proceed.
Checks if the agent has been previously visited in the route; if not, adds it and allows navigation.
Logs navigation attempts and decisions when info-level logging is enabled.

### beginMonit

```ts
beginMonit: (clientId: string, swarmName: string) => void
```

Initializes or resets the navigation route monitoring for a client and swarm.
Clears the existing route to start fresh, logging the action if info-level logging is enabled.

### dispose

```ts
dispose: (clientId: string, swarmName: string) => void
```

Disposes of the navigation route for a client and swarm.
Removes the memoized route entry, logging the action if info-level logging is enabled.
