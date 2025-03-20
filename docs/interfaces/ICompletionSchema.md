# ICompletionSchema

Interface representing the schema for configuring a completion mechanism.
Defines how completions are generated within the swarm.

## Properties

### completionName

```ts
completionName: string
```

The unique name of the completion mechanism within the swarm.

### callbacks

```ts
callbacks: Partial<ICompletionCallbacks>
```

Optional partial set of callbacks for completion events, allowing customization of post-completion behavior.

## Methods

### getCompletion

```ts
getCompletion: (args: ICompletionArgs) => Promise<IModelMessage<object>>
```

Retrieves a completion based on the provided arguments.
Generates a model response using the given context and tools.
