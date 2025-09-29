---
title: docs/api-reference/type/TMCPConnectionService
group: docs
---

# TMCPConnectionService

```ts
type TMCPConnectionService = {
    [key in Exclude<keyof IMCPConnectionService, InternalKeys$2>]: unknown;
};
```

Type representing the MCP connection service interface.
Handles Model Context Protocol connection operations.
