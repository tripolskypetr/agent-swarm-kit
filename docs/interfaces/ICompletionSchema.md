# ICompletionSchema

Schema for a completion.

## Properties

### completionName

```ts
completionName: string
```

Name of the completion.

### onComplete

```ts
onComplete: (args: ICompletionArgs, output: IModelMessage) => void
```

Callback fired after complete.

## Methods

### getCompletion

```ts
getCompletion: (args: ICompletionArgs) => Promise<IModelMessage>
```

Method to get a completion.
