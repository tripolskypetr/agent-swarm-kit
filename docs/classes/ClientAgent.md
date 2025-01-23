# ClientAgent

Implements `IAgent`

## Constructor

```ts
constructor(params: IAgentParams);
```

## Properties

### params

```ts
params: IAgentParams
```

### _toolCommitSubject

```ts
_toolCommitSubject: Subject<void>
```

### _outputSubject

```ts
_outputSubject: Subject<string>
```

### _emitOuput

```ts
_emitOuput: (result: string) => Promise<void>
```

### _resurrectModel

```ts
_resurrectModel: (reason?: string) => Promise<string>
```

### waitForOutput

```ts
waitForOutput: () => Promise<string>
```

### getCompletion

```ts
getCompletion: () => Promise<IModelMessage>
```

### commitSystemMessage

```ts
commitSystemMessage: (message: string) => Promise<void>
```

### commitToolOutput

```ts
commitToolOutput: (content: string) => Promise<void>
```

### execute

```ts
execute: (input: string) => Promise<void>
```
