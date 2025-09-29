---
title: docs/api-reference/interface/ISessionConfig
group: docs
---

# ISessionConfig

Configuration interface for scheduled or rate-limited sessions.

## Properties

### delay

```ts
delay: number
```

### onDispose

```ts
onDispose: () => void
```

Optional callback function invoked when the session is disposed.
Called during session cleanup to perform any necessary resource cleanup operations.
