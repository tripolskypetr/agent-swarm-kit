---
title: docs/api-reference/class/NavigationSchemaService
group: docs
---

# NavigationSchemaService

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### _navigationToolNameSet

```ts
_navigationToolNameSet: any
```

### register

```ts
register: (toolName: string) => void
```

Registers a navigation tool name in the internal Set.
Logs the registration operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.

### hasTool

```ts
hasTool: (toolName: string) => boolean
```

Checks if a navigation tool name exists in the internal Set.
Logs the lookup operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
