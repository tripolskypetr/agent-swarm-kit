# PolicyValidationService

Service for validating policys within the agent-swarm.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### _policyMap

```ts
_policyMap: any
```

### addPolicy

```ts
addPolicy: (policyName: string, policySchema: IPolicySchema) => void
```

Adds a new policy to the validation service.

### validate

```ts
validate: (policyName: string, source: string) => void
```

Validates if a policy exists in the validation service.
