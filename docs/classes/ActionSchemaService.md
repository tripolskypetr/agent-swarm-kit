---
title: docs/api-reference/class/ActionSchemaService
group: docs
---

# ActionSchemaService

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### _actionToolNameSet

```ts
_actionToolNameSet: any
```

### register

```ts
register: (toolName: string) => void
```

Registers an action tool name in the internal Set.
Logs the registration operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.

### hasTool

```ts
hasTool: (toolName: string) => boolean
```

Checks if an action tool name exists in the internal Set.
Logs the lookup operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
