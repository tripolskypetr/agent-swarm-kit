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

The `ToolValidationService` is a service designed for validating tools within an agent-swarm system. It provides a way to add new tools and validate their existence. The service uses a loggerService for logging purposes and maintains an internal map of tools, represented by `_toolMap`.

To add a new tool to the validation service, you can use the `addTool` function. This function takes two parameters: `toolName`, which is the name of the tool, and `toolSchema`, which is an object representing the schema of the tool.

To validate if a specific tool exists in the validation service, you can use the `validate` function. This function takes two parameters: `toolName`, which is the name of the tool to be validated, and `source`, which represents the source of the tool.

By using these functions, you can effectively manage and validate tools within your agent-swarm system.

## ToolSchemaService

The `ToolSchemaService` is a service that manages tool schemas. It has a constructor that initializes the `loggerService` and `registry`. The service provides two main functions: `register` and `get`.

The `register` function allows you to register a tool with a given key and value. This means you can add a new tool to the service by specifying its unique identifier and the tool's definition.

The `get` function enables you to retrieve a tool by its key. This means you can access a specific tool from the service by providing its unique identifier.

## SwarmValidationService

The SwarmValidationService is a service used for validating swarms and their agents. It has a constructor, properties such as loggerService and agentValidationService for logging and validating agents respectively, and a swarmMap for storing swarms. The service allows you to add a new swarm using the `addSwarm` method, retrieve a list of agents for a given swarm using the `getAgentList` method, and validate a swarm along with its agents using the `validate` method.

## SwarmSchemaService

The SwarmSchemaService is a service used for managing swarm schemas. It has a constructor, loggerService property, registry property and two methods: register() and get(). The loggerService property is used for logging messages. The registry property stores the swarm schemas, and the register() method is used to add a new swarm schema. The get() method is used to retrieve a swarm schema by its name.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It is designed to manage public interactions with swarms. The class has a constructor, several properties and methods for handling swarm interactions such as canceling output, waiting for output from the swarm, getting agent name and agent details from the swarm, setting agent reference and name in the swarm, and disposing of the swarm. The class uses loggerService and swarmConnectionService properties for logging and handling connections to the swarm respectively.

## SwarmMetaService

The SwarmMetaService is a service that handles swarm metadata. It has properties such as loggerService, swarmSchemaService, agentMetaService and serialize. The loggerService is used for logging, swarmSchemaService handles the schema related operations for swarms, agentMetaService handles metadata related to agents and serialize is used for serialization. The makeSwarmNode function creates a swarm node with the given swarm name. The toUML function converts the swarm metadata into UML format.

## SwarmConnectionService

The SwarmConnectionService is a TypeScript class that implements the ISwarm interface and provides functionality for managing swarm connections. It has a constructor that initializes the service with dependencies such as loggerService, busService, methodContextService, agentConnectionService, and swarmSchemaService.

The service provides several methods for interacting with swarms. The getSwarm method retrieves a swarm instance based on the client ID and swarm name. The cancelOutput method cancels the await of output by emitting an empty string. The waitForOutput method waits for the output from the swarm. The getAgentName method retrieves the agent name from the swarm, while getAgent retrieves the agent from the swarm.

The setAgentRef method sets the agent reference in the swarm, and setAgentName sets the agent name in the swarm. Finally, the dispose method is used to clean up and dispose of the swarm connection.

## StorageValidationService

The StorageValidationService is a service designed to validate storages within the storage swarm. It is constructed with a loggerService and an embeddingValidationService. The service also has a private property called _storageMap.

To add a new storage to the validation service, you can use the addStorage function. This function takes in a storage name and a storage schema of type IStorageSchema<IStorageData>.

To validate a storage, you can use the validate function. This function takes in a storage name and the source of the storage. It will perform validation on the specified storage based on its name and source.

## StorageUtils

The `StorageUtils` is a TypeScript class that implements the `TStorage` interface. It provides several methods to interact with a storage system. 

1. `constructor()`: This is the constructor method for `StorageUtils`.
2. `take()`: This method allows you to retrieve items from the storage. It takes a payload object with properties such as `search`, `total`, `clientId`, `agentName`, and `storageName`. It returns a Promise that resolves to an array of items matching the specified criteria.
3. `upsert()`: This method allows you to upsert (insert or update) an item in the storage. It takes a payload object with properties such as `item`, `clientId`, `agentName`, and `storageName`. It returns a Promise that resolves to `void`.
4. `remove()`: This method allows you to remove an item from the storage. It takes a payload object with properties such as `itemId`, `clientId`, `agentName`, and `storageName`. It returns a Promise that resolves to `void`.
5. `get()`: This method allows you to retrieve a specific item from the storage. It takes a payload object with properties such as `itemId`, `clientId`, `agentName`, and `storageName`. It returns a Promise that resolves to the specified item.
6. `list()`: This method allows you to list items from the storage. It takes a payload object with properties such as `clientId`, `agentName`, and `storageName`. Optionally, you can provide a `filter` function to specify the criteria for filtering items. It returns a Promise that resolves to an array of items matching the specified criteria.
7. `clear()`: This method allows you to clear the entire storage. It takes a payload object with properties such as `clientId`, `agentName`, and `storageName`. It returns a Promise that resolves to `void`.

Overall, the `StorageUtils` class provides a set of methods to interact with a storage system, allowing you to retrieve, insert, update, remove, and list items in a storage.

## StorageSchemaService

The StorageSchemaService is a service used for managing storage schemas. It has a constructor, loggerService property, registry property and two methods: register() and get(). The loggerService property is used for logging messages. The registry property stores the registered storage schemas, and the register() method is used to add a new storage schema. The get() method is used to retrieve a storage schema by its key.

## StoragePublicService

The `StoragePublicService` is a TypeScript class that implements the `TStorageConnectionService` interface. It is responsible for managing interactions with public storage services. The class has a constructor, properties such as `loggerService` and `storageConnectionService`, as well as several methods for interacting with the storage.

The `take` method retrieves a list of storage data based on a search query and total number of items. The `upsert` method upserts an item in the storage. The `remove` method removes an item from the storage. The `get` method retrieves an item from the storage by its ID. The `list` method retrieves a list of items from the storage, optionally filtered by a predicate function. The `clear` method clears all items from the storage. The `dispose` method disposes of the storage.

## StorageConnectionService

The StorageConnectionService is a service that manages storage connections and provides methods for interacting with the storage. It implements the IStorage interface and has properties for dependencies such as loggerService, busService, methodContextService, storageSchemaService, sessionValidationService, and embeddingSchemaService.

The service provides a getSharedStorage method that retrieves a shared storage instance based on the storage name. It also has a getStorage method that retrieves a storage instance based on the client ID and storage name.

The service offers methods for retrieving, inserting, updating, and removing items from the storage. The take method retrieves a list of storage data based on a search query and total number of items. The upsert method inserts or updates an item in the storage. The remove method removes an item from the storage. The get method retrieves an item from the storage by its ID. The list method retrieves a list of items from the storage, optionally filtered by a predicate function. The clear method clears all items from the storage, and the dispose method disposes of the storage connection.

## StateUtils

The `StateUtils` class is a utility for managing state in an agent swarm. It provides methods to retrieve and set state for a specific client. The `getState` method allows you to retrieve the state for a given client and state name, while the `setState` method allows you to set a new state for the specified client and state. Both methods return a promise, allowing you to handle asynchronous operations.

## StateSchemaService

The `StateSchemaService` is a service used for managing state schemas. It has a constructor, `loggerService` and `registry` properties, as well as `register` and `get` methods. The `loggerService` is used for logging, while the `registry` stores registered state schemas. The `register` method is used to add a new state schema, and the `get` method retrieves a state schema by its key.

## StatePublicService

The `StatePublicService` is an implementation of the `TStateConnectionService` interface. It has a constructor, as well as properties `loggerService` and `stateConnectionService`. The class provides three methods: `setState`, `getState`, and `dispose`.

The `setState` method sets the state using a provided dispatch function. It takes in the dispatch function, a method name, a client ID, and a state name as parameters. It returns the updated state after dispatching the action.

The `getState` method retrieves the current state. It takes in a method name, client ID, and state name as parameters. It returns the current state after fetching it from the server.

The `dispose` method disposes of the state. It takes in a method name, client ID, and state name as parameters. It releases any resources associated with the state and returns `void`.

Overall, the `StatePublicService` class allows for managing state connections, setting and retrieving the current state, and disposing of the state when necessary.

## StateConnectionService

The `StateConnectionService` is a TypeScript class that manages state connections. It implements the `IState<T>` interface and provides several methods for working with state. The class has properties such as `loggerService`, `busService`, `methodContextService`, `stateSchemaService`, and `sessionValidationService` which are used for various functionalities.

The `getSharedStateRef` is a memoized function that returns a shared state reference. It takes two parameters, `clientId` and `stateName`, and returns a `ClientState<any>`.

The `getStateRef` is also a memoized function that returns a state reference. It works similarly to `getSharedStateRef`, taking the same parameters and returning a `ClientState<any>`.

The `setState` method sets the state by dispatching a function that takes the previous state as an argument and returns a promise that resolves to the updated state.

The `getState` method retrieves the current state by returning a promise that resolves to the current state.

The `dispose` method disposes the state connection by returning a promise that resolves when the dispose operation is complete.

Overall, the `StateConnectionService` provides a way to manage state connections and perform operations on the state, such as setting and retrieving it.

## SessionValidationService

The `SessionValidationService` is a service used for validating and managing sessions in an application. It provides methods to add, remove and get information about sessions. The service also keeps track of the mode, agents, history list, and storage used in each session.

To use this service, you need to create an instance of `SessionValidationService` and inject it into your application. You can then call the methods provided by this service to manage sessions.

Here are some examples of how to use this service:

1. Add a new session using the `addSession` method:
```typescript
const sessionService = new SessionValidationService();
sessionService.addSession('client1', 'swarmName', SessionMode.AGENT);
```
1. Add an agent usage to a session using the `addAgentUsage` method:
```typescript
sessionService.addAgentUsage('sessionId', 'agentName');
```
1. Get the list of all session IDs using the `getSessionList` method:
```typescript
const sessionList = sessionService.getSessionList();
```
1. Validate if a session exists using the `validate` method:
```typescript
sessionService.validate('clientId', 'source');
```
1. Remove a session using the `removeSession` method:
```typescript
sessionService.removeSession('clientId');
```
The `SessionValidationService` also provides methods to get the swarm name, agent list, and history list for a session.

Remember to replace `'clientId'`, `'swarmName'`, and `SessionMode.AGENT` with the appropriate values for your application.

## SessionPublicService

The `SessionPublicService` is a TypeScript class that implements the `TSessionConnectionService` interface. It is responsible for managing public session interactions, which include emitting messages to the session, executing commands in the session, connecting to the session, committing tool output and system messages to the session, committing user messages without an answer, flushing the agent history, and disposing of the session.

The class has a constructor, which initializes the `loggerService` and `sessionConnectionService`. It also has several methods:
- `emit`: Emits a message to the session.
- `execute`: Executes a command in the session.
- `connect`: Connects to the session.
- `commitToolOutput`: Commits tool output to the session.
- `commitSystemMessage`: Commits a system message to the session.
- `commitUserMessage`: Commits user message to the agent without an answer.
- `commitFlush`: Commits a flush of the agent history.
- `dispose`: Disposes of the session.

These methods allow for various interactions with the session, such as sending messages, executing commands, and managing session history.

## SessionConnectionService

The `SessionConnectionService` is a TypeScript class that implements the `ISession` interface and manages session connections. It has a constructor that initializes properties such as `loggerService`, `busService`, `methodContextService`, `swarmConnectionService`, and `swarmSchemaService`. The class also provides several methods for interacting with the session, including `getSession`, `emit`, `execute`, `connect`, `commitToolOutput`, `commitSystemMessage`, `commitUserMessage`, `commitFlush`, and `dispose`.

The `getSession` method retrieves a memoized session based on the provided `clientId` and `swarmName`. The `emit` method allows you to send a message to the session. The `execute` method executes a command in the session. The `connect` method connects to the session using a provided connector. The `commitToolOutput`, `commitSystemMessage`, and `commitUserMessage` methods allow you to commit different types of messages to the session. The `commitFlush` method commits all pending messages. Finally, the `dispose` method disposes of the session connection service.

## SchemaUtils

The `SchemaUtils` is a utility class that provides functions for performing operations related to schemas. It has a constructor that does not take any parameters.

The class includes a property called `serialize`, which is a function that can serialize an object or an array of objects into a formatted string. This function can be used to convert data into a readable and formatted string representation.

## LoggerUtils

The LoggerUtils class is an implementation of the ILoggerAdapter and ILoggerControl interfaces. It has a constructor, several properties and methods for logging different levels of information, and a dispose method. The LoggerFactory property is used to create logger instances, while LoggerCallbacks and getLogger are used to configure the logger. The useCommonAdapter, useClientCallbacks, and useClientAdapter methods are used to set up the logger with specific adapters and callbacks. The logClient, infoClient, debugClient, log, debug, and info methods are used to log different levels of information asynchronously. The dispose method is used to clean up resources when the logger instance is no longer needed.

## LoggerService

The LoggerService is a class that implements the ILogger interface and provides methods to log and debug messages. It has a constructor, several properties including methodContextService, executionContextService, _commonLogger and getLoggerAdapter. The log method logs messages using the current logger, debug logs debug messages, and info logs information messages. The setLogger method sets a new logger for the service. This class is used to handle logging operations in the system.

## LoggerInstance

The `LoggerInstance` class is an implementation of the `ILoggerInstance` interface. It is constructed with a `clientId` and an optional set of callbacks defined by the `ILoggerInstanceCallbacks` interface. The `clientId` is a unique identifier for the client using this logger instance.

The `callbacks` property allows for custom callback functions to be set, which can handle events like log messages being sent or received.

The `__@LOGGER_INSTANCE_WAIT_FOR_INIT@1668` property is an internal variable used for waiting until the logger instance is initialized.

The `waitForInit` method returns a promise that resolves when the logger instance is fully initialized.

The `log`, `debug`, and `info` methods are used to log different levels of messages. They each take a `topic` parameter and optional additional arguments to be included in the log message. The `log` method is used for general log messages, `debug` for debugging information, and `info` for informational messages.

## HistoryUtils

The `HistoryUtils` class provides a set of functions for managing and interacting with the history in a system. It implements `IHistoryAdapter` and `IHistoryControl`, which allow for customization and control over the history functionality.

To use a custom history adapter, you can call the `useHistoryAdapter` function, passing in a constructor for the custom adapter. This will replace the default history implementation with your custom adapter.

If you want to use history lifecycle callbacks, you can call the `useHistoryCallbacks` function, passing in a set of callback functions that will be triggered at specific points in the history lifecycle.

To push a new message to the history, you can call the `push` function, passing in an object representing the message and the client ID and agent name associated with it. This will return a Promise that resolves when the message has been successfully added to the history.

To dispose of the history for a specific client and agent, you can call the `dispose` function, passing in the client ID and agent name. This will return a Promise that resolves when the history has been successfully disposed.

The `iterate` function allows you to iterate over the history messages for a specific client and agent. It returns an AsyncIterableIterator, which can be used to iterate over the messages asynchronously.

## HistoryPublicService

The `HistoryPublicService` is a TypeScript class that implements the `THistoryConnectionService` interface. It is responsible for handling public operations related to the history. The class has a constructor, properties such as `loggerService`, `historyConnectionService`, and methods like `push`, `toArrayForAgent`, `toArrayForRaw`, and `dispose`.

The `push` method allows you to push a message to the history asynchronously. It takes a `message` object of type `IModelMessage`, a `methodName` string, a `clientId` string, and an `agentName` string as parameters.

The `toArrayForAgent` method converts the history into an array specifically for a given agent. It returns a promise that resolves to an array of `IModelMessage` objects. It takes a `prompt`, `methodName`, `clientId`, and `agentName` as parameters.

The `toArrayForRaw` method converts the history into a raw array. It returns a promise that resolves to an array of `IModelMessage` objects. It takes a `methodName`, `clientId`, and `agentName` as parameters.

The `dispose` method allows you to dispose of the history asynchronously. It takes a `methodName`, `clientId`, and `agentName` as parameters.

## HistoryInstance

The `HistoryInstance` class in TypeScript represents a History Instance and implements the `IHistoryInstance` interface. It has a constructor that takes in `clientId` and `callbacks`, which are used to initialize the instance. The class also has several properties and methods to interact with the history data.

The `waitForInit` method allows you to wait for the history to initialize, while the `iterate` method enables you to iterate over the history messages for a specific agent. The `push` method is used to add a new message to the history for a given agent, and the `dispose` method is used to dispose of the history for a given agent.

Overall, the `HistoryInstance` class provides a way to manage and interact with history data in TypeScript applications.

## HistoryConnectionService

The `HistoryConnectionService` is a TypeScript class that implements the `IHistory` interface and provides functionality for managing history connections. It has a constructor that takes no arguments and initializes the loggerService, busService, methodContextService, and sessionValidationService properties.

The `getHistory` method retrieves the history for a given client and agent. It also implements the `IClearableMemoize` and `IControlMemoize` interfaces, which allow for clearing and controlling the memoized history.

The `push` method pushes a message to the history asynchronously.

The `toArrayForAgent` method converts the history to an array format for agents.

The `toArrayForRaw` method converts the history to a raw array format.

The `dispose` method disposes of the history connection service, releasing any resources associated with it.

## EmbeddingValidationService

The EmbeddingValidationService is a tool used within the agent-swarm system to validate embeddings. It provides a way to add new embeddings and validate their existence. The service keeps track of embeddings using an internal map and utilizes a loggerService for logging purposes. To add a new embedding, you can use the `addEmbedding` function by providing an embedding name and its schema. To validate if a specific embedding exists, you can use the `validate` function by passing in the embedding name and its source. This service helps ensure that the embeddings used within the agent-swarm system are valid and properly defined.

## EmbeddingSchemaService

The EmbeddingSchemaService is a service used for managing embedding schemas. It has a constructor, loggerService and registry properties. The `register` function is used to register an embedding with a given key and value, while the `get` function retrieves an embedding by its key. This service allows for easy management and retrieval of embedding schemas.

## CompletionValidationService

The CompletionValidationService is a service that allows you to validate completion names. It has a constructor, loggerService property, and two methods: addCompletion and validate. The loggerService property is used for logging messages, while the _completionSet property is used to store completion names.

To add a new completion name to the set, you can use the addCompletion method by passing a string parameter representing the completion name. This will add the new completion to the set for future validation.

To validate if a completion name exists in the set, you can use the validate method by passing two parameters: a string representing the completion name and another string representing the source. The method will check if the completion name exists in the set and perform any necessary validation.

## CompletionSchemaService

The `CompletionSchemaService` is a service that manages completion schemas. It has a constructor, `loggerService` and `registry` properties, as well as two methods: `register` and `get`. The `loggerService` is used for logging, while the `registry` stores completion schemas.

The `register` method allows you to register a new completion schema by providing a key and the corresponding `ICompletionSchema` object.

The `get` method retrieves a completion schema by its key.

## ClientSwarm

The ClientSwarm class is an implementation of the ISwarm interface and manages agents within a swarm. It has properties such as `params`, `_agentChangedSubject`, `_activeAgent`, and `_cancelOutputSubject`. The class also provides methods like `cancelOutput`, which cancels the await of output by emitting an empty string, `waitForOutput`, which waits for output from the active agent, `getAgentName`, which retrieves the name of the active agent, `getAgent`, which gets the active agent, and `setAgentRef`, which sets the reference of an agent in the swarm. Additionally, there is a `setAgentName` method that sets the active agent by name.

## ClientStorage

The ClientStorage class is an implementation of the IStorage interface, designed to manage storage operations. It has a constructor that takes in parameters defined by the IStorageParams interface for a generic type T. The class has several properties and methods for performing various storage operations.

The _itemMap property is used to store items in the storage. The _createEmbedding method creates an embedding for a given item, which is used to represent the item in a way that can be processed by machine learning algorithms. The waitForInit property is used to wait for the initialization of the storage.

The take method allows you to retrieve a specified number of items based on search criteria. The upsert method is used to insert or update an item in the storage. The remove method removes an item from the storage based on its ID. The clear method clears all items from the storage. The get method retrieves an item from the storage by its ID. The list method lists all items in the storage, optionally filtered by a predicate. Finally, the dispose method is used to dispose of the state.

## ClientState

The `ClientState` class is an implementation of the `IState<State>` interface, representing the client's state. It has a constructor that takes in parameters of type `IStateParams<State>`. The class has several properties and methods.

The `params` property holds the parameters used to initialize the state. The `_state` property stores the current state of the client. The `dispatch` property is used to dispatch actions. The `waitForInit` property is a function that waits for the state to initialize.

The `setState` method sets the state using a provided dispatch function, and returns a promise that resolves to the updated state. The `getState` method retrieves the current state as a promise. The `dispose` method disposes of the state, cleaning up any resources associated with it.

## ClientSession

The `ClientSession` class in this Typescript API Reference is an implementation of the `ISession` interface. It provides various methods and properties for handling communication between a client and an agent.

The `constructor` takes in a parameter of type `ISessionParams` to initialize the session.

The `params` property holds the session parameters, while `_emitSubject` is a subject that emits messages. The `emit` method allows the user to emit a message, and it returns a promise.

The `execute` method executes a message and optionally emits the output. It takes in a message and an execution mode as parameters, and it also returns a promise.

The `commitToolOutput` method commits the output of a tool, taking in the `toolId` and content as parameters, and returning a promise.

The `commitUserMessage` method commits a user message without an answer, taking in the message as a parameter and returning a promise.

The `commitFlush` method commits a flush of the agent history.

The `commitSystemMessage` method commits a system message, taking in the message as a parameter and returning a promise.

The `connect` method connects the session to a connector function, returning a receive message function.

The `dispose` method should be called when the session is disposed, and it returns a promise.

## ClientHistory

The `ClientHistory` class in TypeScript represents the history of client messages and implements the `IHistory` interface. It has a constructor that takes in `IHistoryParams` as a parameter. The class also has properties such as `params`, which holds the history parameters, and `_filterCondition`, which is a filter condition used for the `toArrayForAgent` method.

The `push` method allows you to add a new message to the history asynchronously. The `toArrayForRaw` method converts the history into an array of raw messages asynchronously. The `toArrayForAgent` method converts the history into an array of messages for the agent, taking in a prompt and an optional array of system messages as parameters. Finally, the `dispose` method should be called when an agent is disposed to clean up any resources associated with the history.

## ClientAgent

The `ClientAgent` class in TypeScript implements the `IAgent` interface and represents a client agent that interacts with the system. It has a constructor that takes in `IAgentParams` as a parameter. The class has several properties and methods for handling agent actions, such as emitting output results after validation, resurrecting the model based on a given reason, waiting for output to be available, getting completion messages from the model, committing user and system messages to history, committing tool output to the history, and executing incoming messages while processing tool calls if necessary. The `dispose` method should be called when the agent is disposed.

## BusService

The BusService is an implementation of the IBus interface that provides event handling functionality. It takes in two properties, loggerService and sessionValidationService. The class also has two private properties, _eventSourceSet and _eventWildcardMap, which are used to manage event subscriptions.

The BusService provides three main methods: subscribe, once, and emit. The `subscribe` method allows you to subscribe to events for a specific client and source. The `once` method allows you to subscribe to a single event for a specific client and source. The `emit` method allows you to emit an event for a specific client.

The BusService also has a `dispose` method that allows you to dispose of all event subscriptions for a specific client.

## AgentValidationService

The `AgentValidationService` is a service used for validating agents within an agent swarm. It has a constructor that takes no arguments and several properties including `loggerService`, `toolValidationService`, `completionValidationService`, and `storageValidationService`. The service also has methods such as `getStorageList`, `getStateList`, `addAgent`, `hasStorage`, `hasDependency`, and `hasState`. 

The `getStorageList` method retrieves the storages used by an agent, while `getStateList` retrieves the states used by an agent. The `addAgent` method adds a new agent to the validation service. The `hasStorage`, `hasDependency`, and `hasState` methods are used to check if an agent has registered a storage, dependency, or state respectively. Finally, the `validate` method is used to validate an agent by its name and source.

## AgentSchemaService

The `AgentSchemaService` is a service that manages agent schemas. It has a constructor, `loggerService` and `registry` properties, as well as `register` and `get` methods. The `loggerService` is used for logging, while the `registry` stores registered agent schemas. The `register` method is used to add a new agent schema, and the `get` method retrieves an agent schema by its name.

## AgentPublicService

The `AgentPublicService` is a TypeScript class that implements the `TAgentConnectionService` interface. It is responsible for managing public agent operations, such as creating an agent reference, executing commands on the agent, waiting for output from the agent, committing tool and system messages to the agent, flushing the agent's history, and disposing of an agent. The class has properties for `loggerService` and `agentConnectionService`, which are used for logging and managing agent connections, respectively.

## AgentMetaService

The `AgentMetaService` is a class that provides methods for managing agent meta nodes and converting them to UML format. It has a constructor, properties like `loggerService`, `agentSchemaService` and `serialize`, as well as methods such as `makeAgentNode`, `makeAgentNodeCommon` and `toUML`. 

The `makeAgentNode` method creates a meta node for the given agent, while `makeAgentNodeCommon` does the same but with an optional parameter `seen` which is a Set of strings. The `toUML` method converts the meta nodes of a specific agent to UML format, and it has an optional parameter `withSubtree` which determines whether to include the subtree of the agent in the UML representation.

## AgentConnectionService

The `AgentConnectionService` is a TypeScript class that implements the `IAgent` interface and manages agent connections. It has a constructor that initializes several properties, including `loggerService`, `busService`, `methodContextService`, `sessionValidationService`, `historyConnectionService`, `storageConnectionService`, `agentSchemaService`, `toolSchemaService`, and `completionSchemaService`.

The class provides several methods: `getAgent` for retrieving an agent instance, `execute` for executing input commands, `waitForOutput` for waiting for output from the agent, `commitToolOutput` for committing tool output, `commitSystemMessage` for committing system messages, `commitUserMessage` for committing user messages without answers, `commitAgentChange` for committing agent changes, `commitFlush` for committing a flush of agent history, and `dispose` for disposing of the agent connection.
