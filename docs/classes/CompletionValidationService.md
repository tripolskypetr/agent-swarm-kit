# CompletionValidationService

Service for validating completion names.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### _completionSet

```ts
_completionSet: any
```

### addCompletion

```ts
addCompletion: (completionName: string) => void
```

Adds a new completion name to the set.

### validate

```ts
validate: (completionName: string, source: string) => void
```

Validates if a completion name exists in the set.
