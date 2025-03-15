# ClientHistory

Implements `IHistory`

Class representing the history of client messages, managing storage and retrieval of messages.

## Constructor

```ts
constructor(params: IHistoryParams);
```

## Properties

### params

```ts
params: IHistoryParams
```

### _filterCondition

```ts
_filterCondition: (message: IModelMessage) => boolean
```

Filter condition function for `toArrayForAgent`, used to filter messages based on agent-specific criteria.

## Methods

### push

```ts
push(message: IModelMessage): Promise<void>;
```

Pushes a message into the history and emits a corresponding event.

### pop

```ts
pop(): Promise<IModelMessage | null>;
```

Removes and returns the most recent message from the history.
Emits an event with the popped message or null if the history is empty.

### toArrayForRaw

```ts
toArrayForRaw(): Promise<IModelMessage[]>;
```

Converts the history into an array of raw messages without any filtering or transformation.

### toArrayForAgent

```ts
toArrayForAgent(prompt: string, system?: string[]): Promise<IModelMessage[]>;
```

Converts the history into an array of messages tailored for the agent.
Filters messages based on the agent's filter condition, limits the number of messages,
and prepends prompt and system messages.

### dispose

```ts
dispose(): Promise<void>;
```

Disposes of the history, performing cleanup and releasing resources.
Should be called when the agent is being disposed.
