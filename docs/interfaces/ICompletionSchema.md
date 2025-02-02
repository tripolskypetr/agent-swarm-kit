# ICompletionSchema

Schema for a completion.

## Properties

### completionName

```ts
completionName: string
```

Name of the completion.

### callbacks

```ts
callbacks: Partial<ICompletionCallbacks>
```

Completion lifecycle callbacks

## Methods

### getCompletion

```ts
getCompletion: (args: ICompletionArgs) => Promise<IModelMessage>
```

Method to get a completion.
