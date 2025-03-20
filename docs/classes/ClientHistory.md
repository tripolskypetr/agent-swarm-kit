# ClientHistory

Implements `IHistory`

Class representing the history of client messages in the swarm system, implementing the IHistory interface.
Manages storage, retrieval, and filtering of messages for an agent, with event emission via BusService.
Integrates with HistoryConnectionService (history instantiation), ClientAgent (message logging and completion context),
BusService (event emission), and SessionConnectionService (session history tracking).
Uses a filter condition from GLOBAL_CONFIG to tailor message arrays for agent-specific needs, with limits and transformations.

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
_filterCondition: (message: IModelMessage<object>) => boolean
```

Filter condition function for toArrayForAgent, used to filter messages based on agent-specific criteria.
Initialized from GLOBAL_CONFIG.CC_AGENT_HISTORY_FILTER, applied to common messages to exclude irrelevant entries.

## Methods

### push

```ts
push<Payload extends object = object>(message: IModelMessage<Payload>): Promise<void>;
```

Pushes a message into the history and emits a corresponding event via BusService.
Adds the message to the underlying storage (params.items) and notifies the system, supporting ClientAgent’s history updates.

### pop

```ts
pop(): Promise<IModelMessage | null>;
```

Removes and returns the most recent message from the history, emitting an event via BusService.
Retrieves the message from params.items and notifies the system, returning null if the history is empty.
Useful for ClientAgent to undo recent actions or inspect the latest entry.

### toArrayForRaw

```ts
toArrayForRaw(): Promise<IModelMessage[]>;
```

Converts the history into an array of raw messages without filtering or transformation.
Iterates over params.items to collect all messages as-is, useful for debugging or raw data access.

### toArrayForAgent

```ts
toArrayForAgent(prompt: string, system?: string[]): Promise<IModelMessage[]>;
```

Converts the history into an array of messages tailored for the agent, used by ClientAgent for completions.
Filters messages with _filterCondition, limits to GLOBAL_CONFIG.CC_KEEP_MESSAGES, handles resque/flush resets,
and prepends prompt and system messages (from params and GLOBAL_CONFIG.CC_AGENT_SYSTEM_PROMPT).
Ensures tool call consistency by linking tool outputs to calls, supporting CompletionSchemaService’s context needs.

### dispose

```ts
dispose(): Promise<void>;
```

Disposes of the history, releasing resources and performing cleanup via params.items.dispose.
Called when the agent (e.g., ClientAgent) is disposed, ensuring proper resource management with HistoryConnectionService.
