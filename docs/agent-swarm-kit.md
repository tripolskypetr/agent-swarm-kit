# Agent Swarm Kit - System Overview

## Core Architecture

The Agent Swarm Kit is a sophisticated framework designed for orchestrating multi-agent AI systems. It enables the creation and management of cooperative agent networks that can solve complex problems together. The system follows a modular architecture with clear separation of concerns, making it highly extensible and customizable.

## Key Components

### Agents
Agents are the fundamental building blocks of the system. Each agent represents an autonomous entity that can:
- Execute commands and process inputs
- Utilize specialized tools to perform tasks
- Maintain conversation history
- Commit messages and tool outputs
- Wait for and process outputs

The `AgentConnectionService` provides the core implementation, while `AgentValidationService` ensures agents are properly configured before use.

### Swarms
Swarms coordinate multiple agents working together. The swarm mechanism:
- Manages agent references within a group
- Facilitates communication between agents
- Controls agent activation and switching
- Provides a unified interface for interacting with multiple agents

The implementation is primarily through `SwarmConnectionService` and `ClientSwarm` classes.

### Session Management
Sessions handle user interactions with the agent system:
- Track active connections
- Enable message emission and command execution
- Support user message commitments and tool outputs
- Manage history flushing operations

The `SessionConnectionService` and `ClientSession` classes implement this functionality.

### Storage System
The storage system provides persistence capabilities:
- Supports item retrieval based on search criteria
- Handles upsert, remove, and clear operations
- Manages embedding-based searches for semantic retrieval
- Provides list operations with optional filtering

Implementation is through `StorageConnectionService` and `ClientStorage` classes.

### State Management
State management tracks the system's conditions:
- Maintains state objects across the system
- Supports state updates through dispatch functions
- Provides retrieval capabilities for current states
- Handles state disposal when no longer needed

The `StateConnectionService` and `ClientState` classes provide this functionality.

### History Tracking
History utilities track conversations and interactions:
- Record message exchanges between agents and users
- Support iteration over historical messages
- Convert history to various array formats for different consumers
- Manage the lifecycle of history instances

Implemented through `HistoryConnectionService` and `ClientHistory` classes.

## Service Layer Architecture

The system employs a consistent pattern of service layers for each component:

1. **Validation Services** - Ensure components exist and are correctly configured
2. **Schema Services** - Manage the structure and rules for each component
3. **Connection Services** - Handle the actual connections and operations
4. **Public Services** - Provide simplified interfaces for external consumers

This layered approach ensures separation of concerns and makes the system more maintainable.

## Benefits and Applications

The Agent Swarm Kit enables developers to:
- Create collaborative AI systems where agents specialize in different tasks
- Build systems with persistent memory through the storage mechanisms
- Develop conversational applications with rich history tracking
- Implement complex workflows where agents pass tasks between each other
- Maintain system state across multiple interactions

## Implementation Considerations

When implementing applications using this framework:
- Component schema definitions are crucial for proper validation
- Services follow dependency injection patterns for better testability
- Connection services are typically memoized for performance
- The system supports both synchronous and asynchronous operations
- Proper disposal of resources is important to prevent memory leaks

This modular and extensible architecture makes the Agent Swarm Kit suitable for a wide range of multi-agent applications, from conversational systems to complex problem-solving networks.

## Extensibility Points

The framework provides several key extensibility points:

 - Custom Agents: Implement specialized agents for specific tasks
 - Custom Tools: Create new tools to extend agent capabilities
 - Custom Storage Adapters: Integrate with different storage backends
 - Custom Embedding Providers: Use different embedding models for semantic search
 - Custom Completion Providers: Integrate with different language models
 - Custom History Adapters: Implement alternative history storage mechanisms

These extensibility points allow the framework to adapt to a wide range of use cases and integration requirements.

## ToolValidationService

The `ToolValidationService` is a service used for validating tools within an agent-swarm system. It has a constructor, properties such as `loggerService` and `_toolMap`, as well as two methods: `addTool` and `validate`.

The `addTool` method is used to add a new tool to the validation service. It takes two parameters: `toolName`, which is the name of the tool, and `toolSchema`, which is an object representing the schema of the tool.

The `validate` method is used to check if a tool exists in the validation service. It takes two parameters: `toolName`, which is the name of the tool to be validated, and `source`, which is the source of the tool.

Overall, this service helps in managing and validating tools within the agent-swarm system.

## ToolSchemaService

The `ToolSchemaService` is a service used for managing tool schemas. It has a constructor that initializes the service with dependencies such as a logger and registry. The `register` method is used to register a tool with a given key and value, while the `get` method retrieves a tool by its key. This service provides functionality for managing and accessing tool schemas in a TypeScript application.

## SwarmValidationService

The SwarmValidationService is a service used for validating swarms and their agents. It has a constructor, properties such as loggerService and agentValidationService for logging and validating agents respectively, and a private property _swarmMap for storing swarms.

To add a new swarm, you can use the `addSwarm` method by providing a swarm name and its schema. This will add the swarm to the swarm map.

To retrieve a list of agents for a given swarm, you can use the `getAgentList` method by providing a swarm name. This will return an array of agent names for that swarm.

To validate a swarm and its agents, you can use the `validate` method by providing a swarm name and the source code. This will validate the swarm and its agents using the stored information.

## SwarmSchemaService

The SwarmSchemaService is a service that manages swarm schemas. It has a constructor, loggerService property for logging messages, registry property to store registered schemas, and register and get methods for adding new schemas and retrieving them by name, respectively.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It is designed to manage public interactions with swarms. The class has several properties, including loggerService and swarmConnectionService.

The constructor is used to initialize the service. The cancelOutput function allows you to cancel the await of output by emitting an empty string. The waitForOutput function is used to wait for output from the swarm. The getAgentName function retrieves the agent name from the swarm. The getAgent function retrieves the agent from the swarm. The setAgentRef function sets the agent reference in the swarm. The setAgentName function sets the agent name in the swarm. Finally, the dispose function is used to dispose of the swarm.

## SwarmConnectionService

The SwarmConnectionService is a TypeScript class that manages connections to swarms. It implements the ISwarm interface and has several properties such as loggerService, busService, contextService, agentConnectionService, swarmSchemaService. The constructor initializes these properties and sets up the service.

The getSwarm method retrieves a swarm instance based on the client ID and swarm name. The cancelOutput method cancels the await of output by emitting an empty string. The waitForOutput method waits for the output from the swarm. The getAgentName method retrieves the agent name from the swarm. The getAgent method retrieves the agent from the swarm. The setAgentRef method sets the agent reference in the swarm. The setAgentName method sets the agent name in the swarm. The dispose method disposes of the swarm connection.

## StorageValidationService

The StorageValidationService is a service designed for validating storages within the storage swarm. It provides methods to add new storages and validate existing ones. The service also has properties such as loggerService, embeddingValidationService and _storageMap for internal operations. The addStorage method is used to add a new storage by specifying its name and schema. The validate method is used to perform validation on an existing storage by providing its name and source.

## StorageUtils

The `StorageUtils` class implements the `TStorage` interface and provides various methods for interacting with a storage system. It allows you to take, upsert, remove, get, list, and clear items from the storage.

- The `take` method takes items from the storage and returns them as an array of type `T`, where `T` extends the `IStorageData` interface.
- The `upsert` method upserts an item into the storage. It takes a payload object containing the item to be upserted and information about the client, agent, and storage name.
- The `remove` method removes an item from the storage based on its `itemId`. It also requires the client, agent, and storage name information.
- The `get` method retrieves a specific item from the storage based on its `itemId`. It returns the item as an object of type `T`, where `T` extends the `IStorageData` interface.
- The `list` method lists items from the storage. It returns an array of type `T`, where `T` extends the `IStorageData` interface. You can also apply a filter function to the list.
- The `clear` method clears the entire storage for a specific client, agent, and storage name combination.

These methods provide a convenient way to interact with storage systems in TypeScript applications.

## StorageSchemaService

The StorageSchemaService is a service used for managing storage schemas. It has a constructor, loggerService property, registry property and two methods: register() and get(). The loggerService property is used for logging messages. The registry property stores the registered storage schemas, and the register() method is used to add a new storage schema. The get() method is used to retrieve a storage schema by its key.

## StoragePublicService

The `StoragePublicService` is a TypeScript class that implements the `TStorageConnectionService` interface. It is responsible for managing interactions with public storage services. The class has a constructor, properties such as `loggerService` and `storageConnectionService`, as well as several methods for interacting with the storage.

The `take` method retrieves a list of storage data based on a search query and total number of items. It returns a promise that resolves to an array of `IStorageData` objects.

The `upsert` method upserts an item in the storage. It takes an `IStorageData` object, the client ID, and storage name as parameters, and returns a promise that resolves when the operation is complete.

The `remove` method removes an item from the storage based on its ID. It takes the item's ID, client ID, and storage name as parameters, and returns a promise that resolves when the operation is complete.

The `get` method retrieves an item from the storage by its ID. It takes the item's ID, client ID, and storage name as parameters, and returns a promise that resolves to the `IStorageData` object if found, or throws an error if not found.

The `list` method retrieves a list of items from the storage, optionally filtered by a predicate function. It takes the client ID, storage name, and an optional filter function as parameters. The filter function can be used to specify a custom condition for filtering the items. It returns a promise that resolves to an array of `IStorageData` objects.

The `clear` method clears all items from the storage. It takes the client ID and storage name as parameters, and returns a promise that resolves when the operation is complete.

The `dispose` method disposes of the storage. It takes the client ID and storage name as parameters, and returns a promise that resolves when the storage is disposed.

## StorageConnectionService

The StorageConnectionService is a service that manages storage connections. It has properties such as loggerService, busService, contextService, storageSchemaService, sessionValidationService, embeddingSchemaService. It provides methods to retrieve shared storage, get a storage instance based on client ID and storage name, retrieve a list of storage data based on search query and total number of items, upsert an item in the storage, remove items from the storage by its ID, retrieve an item from the storage by its ID, list items from the storage optionally filtered by a predicate function, clear all items from the storage and dispose of the storage connection.

## StateUtils

The `StateUtils` class is a utility for managing state in an agent swarm. It provides methods to retrieve and set state for a specific client. The `getState` method allows you to retrieve the state for a given client and state name, while the `setState` method sets the state for a given client and state name. Both methods return promises, allowing for asynchronous operations.

## StateSchemaService

The `StateSchemaService` is a service used for managing state schemas. It provides methods to register new state schemas and retrieve them by their respective keys. The service also has a `loggerService` for logging and an internal registry to store the state schemas.

To use this service, you can create an instance of `StateSchemaService` and call the `register()` method to add new state schemas. You can then use the `get()` method to retrieve a state schema by providing its key.

Here's an example of how you can use the `StateSchemaService`:

```typescript
const stateSchemaService = new StateSchemaService();

// Register a state schema with the key 'user'
stateSchemaService.register('user', { /* state schema definition */ });

// Retrieve the state schema for the 'user' key
const userSchema = stateSchemaService.get('user');
```

## StatePublicService

The `StatePublicService` class is an implementation of the `TStateConnectionService` interface. It has a constructor, and two properties: `loggerService` and `stateConnectionService`. 

The class provides three methods: `setState`, `getState`, and `dispose`. 

The `setState` method sets the state using a provided dispatch function. It returns a promise that resolves to the updated state.

The `getState` method retrieves the current state. It also returns a promise that resolves to the current state.

The `dispose` method disposes the state. It returns a promise that resolves when the state has been successfully disposed.

These methods can be used by clients to interact with the state service, allowing them to set, get and dispose of states as needed.

## StateConnectionService

The `StateConnectionService` is a TypeScript service that manages state connections. It provides methods for getting shared and individual state references, setting the state, getting the current state, and disposing of the connection. The service also has properties for `loggerService`, `busService`, `contextService`, `stateSchemaService`, and `sessionValidationService`. These properties are used for logging, event bus communication, context management, state schema handling, and session validation respectively. The `getSharedStateRef` and `getStateRef` methods are memoized functions that return a shared or individual state reference respectively. The `setState` method sets the state by dispatching a function that takes the previous state and returns a promise for the updated state. The `getState` method retrieves the current state as a promise. Finally, the `dispose` method disposes of the state connection.

## SessionValidationService

The `SessionValidationService` is a service used for validating and managing sessions in an application. It provides methods to add, remove and manage session data such as agents, history, storage and state usage. The service also allows for session validation and retrieval of session information.

The constructor initializes the service with a loggerService, and several swarm maps (_storageSwarmMap, _historySwarmMap, _agentSwarmMap, _stateSwarmMap and _sessionSwarmMap) to store swarm names associated with sessions. The _sessionModeMap is used to store the mode of a session.

To add a new session, use the `addSession` method by providing the client ID, swarm name and session mode. The `addAgentUsage`, `addHistoryUsage`, `addStorageUsage` and `addStateUsage` methods are used to add agent, history, storage and state usage respectively to a session. The `removeAgentUsage`, `removeHistoryUsage`, `removeStorageUsage` and `removeStateUsage` methods are used to remove agent, history, storage and state usage respectively from a session.

The `getSessionMode` method retrieves the mode of a session by providing the client ID. The `hasSession` method checks if a session exists for the provided client ID. The `getSessionList` method retrieves the list of all session IDs. The `getSessionAgentList` method retrieves the list of agents for a session by providing the client ID. The `getSessionHistoryList` method retrieves the history list of agents for a session by providing the client ID. The `getSwarm` method retrieves the swarm name for a session by providing the client ID.

The `validate` method is used to validate if a session exists by providing the client ID and source. The `removeSession` method removes a session by providing the client ID.

## SessionPublicService

The `SessionPublicService` is a TypeScript class that implements the `TSessionConnectionService` interface. It is responsible for managing public session interactions, which include emitting messages, executing commands, connecting to the session, committing tool output and system messages, committing user messages without an answer, flushing the agent history, and disposing of the session.

The class has a constructor that initializes the `loggerService` and `sessionConnectionService`. It also provides several methods to interact with the session, such as `emit`, which allows you to send a message to the session, and `execute`, which executes a command in the session.

To connect to a session, you can use the `connect` method by providing a connector function, the client ID, and the swarm name. This method returns a receive message function that can be used to handle incoming messages from the session.

To commit tool output, system messages, or user messages without an answer, you can use the `commitToolOutput`, `commitSystemMessage`, and `commitUserMessage` methods, respectively. These methods allow you to send messages to the session and commit them.

The `commitFlush` method can be used to commit a flush of the agent history, while `dispose` allows you to disconnect from the session and clean up any resources associated with it.

Overall, the `SessionPublicService` class provides a set of methods to interact with public sessions, allowing you to send messages, execute commands, and manage session connections.

## SessionConnectionService

The `SessionConnectionService` is a TypeScript class that manages session connections. It implements the `ISession` interface and has several properties such as `loggerService`, `busService`, `contextService`, `swarmConnectionService`, and `swarmSchemaService`. 

The class has a constructor that initializes the service. It also provides several methods:
- `getSession` retrieves a memoized session based on the clientId and swarmName.
- `emit` emits a message to the session.
- `execute` executes a command in the session.
- `connect` connects to the session using a provided connector.
- `commitToolOutput` commits tool output to the session.
- `commitSystemMessage` commits a system message to the session.
- `commitUserMessage` commits a user message to the agent without an answer.
- `commitFlush` commits user message to the agent without an answer.
- `dispose` disposes of the session connection service.

Overall, `SessionConnectionService` is a service that handles session connections and provides methods to interact with the sessions, commit messages and output, and dispose of the service.

## LoggerService

The LoggerService is a class that implements the ILogger interface, providing methods to log and debug messages. It has a constructor that initializes an instance of the class. The LoggerService also has two properties: `_logger` and `log`. The `debug` method logs debug messages using the current logger, while `setLogger` allows you to set a new logger for the service. The `_logger` property is of type any and holds the current logger, while `log` is a method that logs messages using the current logger.

## HistoryUtils

The `HistoryUtils` class provides functionality for working with history utilities and implements the `IHistoryAdapter` and `IHistoryControl` interfaces. It has a constructor, several properties and methods for managing history operations.

The `HistoryFactory` and `HistoryCallbacks` properties store any necessary objects or configurations for the history operations. The `getHistory` method is used to retrieve the history.

The `useHistoryAdapter` method allows the user to use a custom history adapter by passing in the constructor of the desired adapter. The `useHistoryCallbacks` method enables the use of history lifecycle callbacks by passing in the desired callback functions.

The `push` method is used to add a new message to the history asynchronously. It requires an `IModelMessage` object, the client ID and agent name as parameters.

The `dispose` method is used to dispose of the history for a specific client and agent asynchronously. It requires the client ID and agent name as parameters.

The `iterate` method allows the user to iterate over the history messages asynchronously. It requires the client ID and agent name as parameters, and returns an `AsyncIterableIterator` containing the history messages.

## HistoryPublicService

The `HistoryPublicService` is a TypeScript class that implements the `THistoryConnectionService` interface. It is responsible for handling public operations related to history management. The class has a constructor, properties such as `loggerService`, `historyConnectionService`, and methods like `push`, `toArrayForAgent`, `toArrayForRaw`, and `dispose`.

The `push` method allows you to push a message to the history asynchronously. It takes three parameters: `message` of type `IModelMessage`, `clientId` of type string, and `agentName` of type string.

The `toArrayForAgent` method converts the history to an array specifically for a given agent. It takes three parameters: `prompt` of type string, `clientId` of type string, and `agentName` of type string. It returns an array of `IModelMessage` objects asynchronously.

The `toArrayForRaw` method converts the history to a raw array. It takes two parameters: `clientId` of type string and `agentName` of type string. It also returns an array of `IModelMessage` objects asynchronously.

The `dispose` method allows you to dispose of the history asynchronously. It takes two parameters: `clientId` of type string and `agentName` of type string.

Overall, the `HistoryPublicService` class provides methods to interact with the history, such as pushing messages, converting history to arrays for specific agents or raw data, and disposing of the history.

## HistoryInstance

The `HistoryInstance` class in TypeScript represents a History Instance and implements the `IHistoryInstance` interface. It has a constructor that takes in `clientId` and `callbacks`, which are used to initialize the instance. The class also has several properties and methods for interacting with the history instance.

The `clientId` property stores the ID of the client associated with this history instance. The `callbacks` property is an object that contains callback functions for various events related to the history instance. The `_array` property is an internal array used for storing history messages.

The `waitForInit` method allows you to wait for the history instance to initialize. It takes an `agentName` parameter and returns a promise that resolves when the history is ready.

The `push` method allows you to add a new message to the history for a specific agent. It takes an `IModelMessage` object and the `agentName`, and returns a promise that resolves when the message is successfully added.

The `dispose` method allows you to dispose of the history for a given agent. It takes an `agentName` parameter and returns a promise that resolves when the history is successfully disposed.

The `iterate` method allows you to iterate over the history messages for a given agent. It takes an `agentName` parameter and returns an asynchronous iterator that can be used to retrieve the history messages one by one.

## HistoryConnectionService

The `HistoryConnectionService` is a TypeScript class that implements the `IHistory` interface. It is responsible for managing history connections in a system. The class has several properties, including `loggerService`, `busService`, `contextService`, and `sessionValidationService`.

The class provides several methods: `getHistory`, which retrieves the history for a given client and agent; `push`, which pushes a message to the history; `toArrayForAgent`, which converts the history to an array format for agents; `toArrayForRaw`, which converts the history to a raw array format; and `dispose`, which disposes of the history connection service.

Overall, this class helps manage and manipulate history data in a system, allowing for efficient retrieval and storage of historical information.

## EmbeddingValidationService

The EmbeddingValidationService is a tool used within the agent-swarm to validate embeddings. It has a constructor that initializes the service, and two main properties: loggerService for logging messages, and _embeddingMap to store the embeddings. 

To add a new embedding, you can use the `addEmbedding` function, which takes the embedding's name and its schema as parameters. This function adds the embedding to the validation service for future use.

To validate if an embedding exists in the validation service, you can use the `validate` function. It takes the embedding's name and its source as parameters. This function checks if the specified embedding exists in the validation service.

## EmbeddingSchemaService

The EmbeddingSchemaService is a service used for managing embedding schemas. It has a constructor that initializes the service with a loggerService and registry. The `register` function is used to register an embedding with a given key and value, while the `get` function retrieves an embedding by its key. This service allows for easy management and retrieval of embedding schemas in your application.

## CompletionValidationService

The CompletionValidationService is a service that allows you to validate completion names. It has a constructor, which is used to initialize the service. The service also has two properties: loggerService and _completionSet. The loggerService is used for logging messages, while _completionSet is used to store the completion names.

To add a new completion name to the set, you can use the addCompletion method. This method takes a string parameter representing the completion name.

To validate if a given completion name exists in the set, you can use the validate method. This method takes two parameters: completionName, which is the name you want to validate, and source, which represents the source of the completion name. If the completion name exists in the set, it will be validated successfully.

## CompletionSchemaService

The `CompletionSchemaService` is a service that manages completion schemas. It has a constructor, `loggerService` and `registry` properties, as well as two methods: `register` and `get`. The `loggerService` is used for logging, while the `registry` stores completion schemas.

The `register` method allows you to register a new completion schema by providing a key and the corresponding `ICompletionSchema` object. This enables you to store and manage multiple completion schemas within the service.

The `get` method retrieves a completion schema by its key. This allows you to easily access and use specific completion schemas when needed.

## ClientSwarm

The ClientSwarm class is an implementation of the ISwarm interface that manages agents within a swarm. It has a constructor that takes in parameters defined by the ISwarmParams interface. The class also has several properties and methods for interacting with the swarm.

The `cancelOutput` method allows you to cancel the await of output by emitting an empty string. The `waitForOutput` method waits for output from the active agent in the swarm.

You can use the `getAgentName` method to retrieve the name of the active agent, and the `getAgent` method to get the active agent itself.

To set a reference of an agent in the swarm, you can use the `setAgentRef` method by providing the agent's name and a reference to the agent. If you want to set an active agent by name, use the `setAgentName` method.

## ClientStorage

The ClientStorage class is an implementation of the IStorage interface, which provides methods for managing storage operations. It has a constructor that takes in parameters of type IStorageParams<T> and properties such as params, _itemMap, _createEmbedding, waitForInit, take, upsert, remove, clear, get, list and dispose.

_createEmbedding is a function that creates an embedding for the given item.
waitForInit is a function that waits for the initialization of the storage.
take is a function that takes a specified number of items based on the search criteria.
upsert is a function that upserts an item into the storage.
remove is a function that removes an item from the storage.
clear is a function that clears all items from the storage.
get is a function that gets an item by its ID.
list is a function that lists all items in the storage, optionally filtered by a predicate.
dispose is a function that disposes of the state.

## ClientState

The `ClientState` class is an implementation of the `IState<State>` interface, representing the client's state. It has a constructor that takes in parameters defined by the `IStateParams<State>` interface. The class has several properties and methods to manage the state.

The `params` property holds the parameters used to initialize the state. The `_state` property stores the current state of the client. The `dispatch` property is used to dispatch actions and update the state.

The `waitForInit` property is a function that waits for the state to initialize. It can be used to ensure that the state is ready before proceeding with further actions.

The `setState` method sets the state using a provided dispatch function. It returns a promise that resolves with the updated state.

The `getState` method retrieves the current state of the client. It returns a promise that resolves with the current state.

The `dispose` method is used to clean up and dispose of the state. It returns a promise that resolves when the disposal is complete.

## ClientSession

The `ClientSession` class in this Typescript API Reference implements the `ISession` interface. It provides various methods and properties for handling communication between a client and an agent.

The `constructor` takes in a parameter of type `ISessionParams` to initialize the session.

The `params` property holds the session parameters, while `_emitSubject` is a subject that emits messages.

The `emit` method allows the client to emit a message, and `execute` executes a message with the option to emit its output.

The `commitToolOutput`, `commitUserMessage`, and `commitSystemMessage` methods are used to commit different types of messages, while `commitFlush` commits the flush of agent history.

The `connect` method connects the session to a connector function, and `dispose` should be called when the session is disposed.

## ClientHistory

The `ClientHistory` class in TypeScript represents the history of messages exchanged between a client and an AI model. It implements the `IHistory` interface and provides several methods to interact with the history.

The class has a constructor that takes in `IHistoryParams` as a parameter. It also has properties such as `params`, which holds the parameters for the history, and `_filterCondition`, which is a filter condition used in the `toArrayForAgent` method.

The `push` method allows you to add a new message to the history asynchronously. The `toArrayForRaw` method converts the history into an array of raw messages asynchronously. The `toArrayForAgent` method converts the history into an array of messages suitable for the agent, taking into account a prompt and optional system messages. Lastly, the `dispose` method should be called when an agent is disposed to clean up any resources associated with the history.

## ClientAgent

The `ClientAgent` class in TypeScript implements the `IAgent` interface and represents a client agent that interacts with the system. It has a constructor that takes in `IAgentParams` as a parameter. The class has several properties, including subjects for agent change, tool commit, tool error, and output. It also has an `_emitOuput` function that emits the output result after validation, a `_resurrectModel` function that resurrects the model based on a given reason, and several other functions for waiting for output, getting completion messages from the model, committing user and system messages to history, and more. The `dispose` function should be called when the agent is disposed.

## BusService

The BusService is an implementation of the IBus interface. It provides methods for subscribing, emitting and disposing of events for a specific client. The constructor initializes the loggerService, _eventSourceSet and getEventSubject properties. The subscribe method allows you to subscribe to events for a specific client and source, while the once method allows you to subscribe to a single event for a specific client and source. The emit method is used to send an event for a specific client, and the dispose method is used to remove all event subscriptions for a specific client.

## AgentValidationService

The `AgentValidationService` is a service used for validating agents within an agent swarm. It has a constructor that initializes the logger service, tool validation service, completion validation service, and storage validation service. The service also has properties for these services, as well as a private property `_agentMap` for storing agent information.

The service provides methods to retrieve the storages and states used by an agent, as well as adding a new agent to the validation service. It also has memoized functions to check if an agent has a registered storage or state.

To validate an agent, you can use the `validate` method by providing the agent name and source. This will validate the specified agent within the service.

## AgentSchemaService

The `AgentSchemaService` is a service that manages agent schemas. It has a constructor, `loggerService` and `registry` properties, as well as `register` and `get` methods. The `loggerService` is used for logging, while the `registry` stores registered agent schemas. The `register` method is used to add a new agent schema, and the `get` method retrieves an agent schema by its name.

## AgentPublicService

The `AgentPublicService` is a TypeScript class that implements the `TAgentConnectionService` interface. It is responsible for managing public operations related to agents. The class has a constructor, several properties and methods.

The `loggerService` and `agentConnectionService` are properties that provide access to logging and agent connection services respectively.

The `createAgentRef` method creates a reference to an agent by providing the `clientId` and `agentName`.

The `execute` method executes a command on the agent by providing an `input`, `mode` (ExecutionMode), `clientId`, and `agentName`.

The `waitForOutput` method waits for the agent's output by providing a `clientId` and `agentName`.

The `commitToolOutput` method commits tool output to the agent by providing a `toolId`, `content`, `clientId`, and `agentName`.

The `commitSystemMessage` method commits a system message to the agent by providing a `message`, `clientId`, and `agentName`.

The `commitUserMessage` method commits user message to the agent without answer by providing a `message`, `clientId`, and `agentName`.

The `commitFlush` method commits a flush of the agent's history by providing `clientId` and `agentName`.

The `commitAgentChange` method commits a change of the agent to prevent the next tool execution from being called by providing `clientId` and `agentName`.

The `dispose` method disposes of the agent by providing `clientId` and `agentName`.

## AgentConnectionService

The `AgentConnectionService` is a TypeScript class that manages agent connections. It has a constructor and several properties, including `loggerService`, `busService`, `contextService`, `sessionValidationService`, `historyConnectionService`, `storageConnectionService`, `agentSchemaService`, `toolSchemaService`, and `completionSchemaService`. 

The class provides several methods: `getAgent` for retrieving an agent instance, `execute` for executing input commands, `waitForOutput` for waiting for output from the agent, `commitToolOutput` for committing tool output, `commitSystemMessage` for committing a system message, `commitUserMessage` for committing a user message without answer, `commitAgentChange` for committing agent change to prevent the next tool execution from being called, `commitFlush` for committing a flush of agent history, and `dispose` for disposing of the agent connection.
