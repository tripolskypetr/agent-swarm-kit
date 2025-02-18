# AgentValidationService

Service for validating agents within the agent swarm.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### toolValidationService

```ts
toolValidationService: any
```

### completionValidationService

```ts
completionValidationService: any
```

### storageValidationService

```ts
storageValidationService: any
```

### _agentMap

```ts
_agentMap: any
```

### getStorageList

```ts
getStorageList: (agentName: string) => string[]
```

Retrieves the storages used by the agent

### addAgent

```ts
addAgent: (agentName: string, agentSchema: IAgentSchema) => void
```

Adds a new agent to the validation service.

### hasStorage

```ts
hasStorage: ((agentName: string, storageName: string) => boolean) & IClearableMemoize<string> & IControlMemoize<string, boolean>
```

Check if agent got registered storage

### validate

```ts
validate: (agentName: string, source: string) => void
```

Validates an agent by its name and source.
