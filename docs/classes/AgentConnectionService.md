# AgentConnectionService

Implements `IAgent`

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### contextService

```ts
contextService: any
```

### sessionValidationService

```ts
sessionValidationService: any
```

### historyConnectionService

```ts
historyConnectionService: any
```

### agentSchemaService

```ts
agentSchemaService: any
```

### toolSchemaService

```ts
toolSchemaService: any
```

### completionSchemaService

```ts
completionSchemaService: any
```

### getAgent

```ts
getAgent: ((clientId: string, agentName: string) => ClientAgent) & IClearableMemoize<string> & IControlMemoize<string, ClientAgent>
```

### execute

```ts
execute: (input: string) => Promise<void>
```

### waitForOutput

```ts
waitForOutput: () => Promise<string>
```

### commitToolOutput

```ts
commitToolOutput: (content: string) => Promise<void>
```

### commitSystemMessage

```ts
commitSystemMessage: (message: string) => Promise<void>
```

### dispose

```ts
dispose: () => Promise<void>
```
