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

### _agentMap

```ts
_agentMap: any
```

### addAgent

```ts
addAgent: (agentName: string, agentSchema: IAgentSchema) => void
```

Adds a new agent to the validation service.

### validate

```ts
validate: (agentName: string, source: string) => void
```

Validates an agent by its name and source.
