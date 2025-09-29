---
title: docs/api-reference/type/TSwarmConnectionService
group: docs
---

# TSwarmConnectionService

```ts
type TSwarmConnectionService = {
    [key in Exclude<keyof ISwarmConnectionService, InternalKeys$8>]: unknown;
};
```

Type representing the public interface of SwarmPublicService, derived from ISwarmConnectionService.
Excludes internal methods (e.g., getSwarm) via InternalKeys, ensuring a consistent public API for swarm-level operations.
