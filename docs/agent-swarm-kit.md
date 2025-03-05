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

The `ToolValidationService` is a service designed for validating tools within an agent-swarm system. It provides a way to add new tools and validate their existence. The service utilizes a loggerService for logging purposes and maintains an internal map of tools, represented by `_toolMap`.

To add a new tool, you can use the `addTool` function. This function takes two parameters: `toolName`, which is the name of the tool, and `toolSchema`, which is an object representing the schema of the tool.

To validate if a specific tool exists in the validation service, you can use the `validate` function. This function takes two parameters: `toolName`, which is the name of the tool you want to validate, and `source`, which represents the source of the tool.

By using these functions, you can effectively manage and validate tools within your agent-swarm system.

## ToolSchemaService

The `ToolSchemaService` is a service used for managing tool schemas. It has a constructor that initializes the service with necessary dependencies. The `loggerService` is used for logging, the `registry` stores registered tools, and `validateShallow` is a validation function for state schema.

The `register` function is used to register a tool with the given key and value. The `get` function retrieves a tool by its key.

## SwarmValidationService

The SwarmValidationService is a service used for validating swarms and their agents. It has a constructor, properties such as loggerService and agentValidationService for logging and validating agents respectively, as well as a private property _swarmMap for storing swarms.

To add a new swarm, you can use the `addSwarm` method by providing a swarm name and its schema. This will add the swarm to the swarm map.

To retrieve a list of agents for a specific swarm, you can use the `getAgentList` method by passing in the swarm name.

To get a list of all swarms, you can use the `getSwarmList` method.

Lastly, the `validate` method can be used to validate a swarm and its agents by providing the swarm name and a source. This will perform validation on the swarm and its agents.

## SwarmSchemaService

The SwarmSchemaService is a service used for managing swarm schemas. It has a constructor, loggerService property for logging purposes, registry property to store registered schemas, and validateShallow property for shallow validation of swarm schemas. The service provides two methods: register and get.

The `register` method is used to register a new swarm schema by providing the key and value of the schema. This allows for easy storage and retrieval of swarm schemas.

The `get` method retrieves a swarm schema by its name, allowing for easy access to specific schemas when needed.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It is designed to manage public swarm interactions, allowing users to interact with swarms in a public setting. The class provides various methods to interact with swarms, such as navigating the stack, canceling output, waiting for output, getting agent information, and disposing of swarms. The service also utilizes a loggerService and swarmConnectionService for logging and managing connections respectively.

## SwarmMetaService

The SwarmMetaService is a service that handles metadata related to swarms. It has a constructor, properties such as loggerService, swarmSchemaService, agentMetaService and serialize. The makeSwarmNode function creates a swarm node with the given swarm name. The toUML function converts the swarm metadata into UML format.

## SwarmConnectionService

The SwarmConnectionService is a TypeScript class that implements the ISwarm interface and provides functionality for managing swarm connections. It has a constructor that initializes the service with dependencies such as loggerService, busService, methodContextService, agentConnectionService, and swarmSchemaService.

The service provides several methods for interacting with swarms. The getSwarm method retrieves a swarm instance based on the client ID and swarm name. The navigationPop method pops the navigation stack or returns a default agent. The cancelOutput method cancels the await of output by emitting an empty string. The waitForOutput method waits for output from the swarm. The getAgentName method retrieves the agent name from the swarm. The getAgent method retrieves the agent from the swarm. The setAgentRef method sets the agent reference in the swarm. The setAgentName method sets the agent name in the swarm. Finally, the dispose method is used to dispose of the swarm connection.

## StorageValidationService

The StorageValidationService is a service designed to validate storages within the storage swarm. It has a constructor, loggerService property for logging purposes, embeddingValidationService property to validate the embeddings of storages, and a private property _storageMap to store the added storages.

To add a new storage, you can use the `addStorage` function by providing a storage name and its schema. This will add the new storage to the validation service.

To validate an existing storage, you can use the `validate` function by providing a storage name and its source. This will initiate the validation process for that specific storage.

## StorageUtils

The `StorageUtils` class is an implementation of the `TStorage` interface, providing various methods to interact with a storage system. It allows you to take, upsert, remove, get, list, and clear items from the storage.

- `take`: This method takes items from the storage, allowing you to retrieve multiple items based on a search query, total count, and other parameters.
- `upsert`: This method upserts an item into the storage, meaning it either updates or inserts a new item based on the provided data.
- `remove`: This method removes an item from the storage, given its unique identifier.
- `get`: This method retrieves a specific item from the storage, given its unique identifier.
- `list`: This method lists items from the storage, allowing you to retrieve multiple items based on a filter function, which can be used to specify certain conditions for the items you want to retrieve.
- `clear`: This method clears the entire storage, removing all items from it.

These methods can be used with different data types that conform to the `IStorageData` interface, allowing for flexibility in the type of data you can store and manipulate within the storage system.

## StorageSchemaService

The StorageSchemaService is a service used for managing storage schemas. It has a constructor, loggerService property for logging service messages, registry property to store registered schemas, and validateShallow property for shallow validation of storage schemas. The service provides two main functions: register and get. The `register` function is used to add a new storage schema by providing the key and value, while `get` function retrieves a storage schema by its key. This service allows for efficient management and retrieval of storage schemas.

## StoragePublicService

The `StoragePublicService` is a TypeScript class that implements the `TStorageConnectionService` interface. It is responsible for managing interactions with public storage services. The class has a constructor, properties such as `loggerService` and `storageConnectionService`, as well as several methods for interacting with the storage.

The `take` method retrieves a list of storage data based on a search query and total number of items. It returns a Promise that resolves to an array of `IStorageData` objects.

The `upsert` method upserts an item into the storage. It takes an `IStorageData` object, along with the method name, client ID, and storage name as parameters. It returns a Promise that resolves when the operation is complete.

The `remove` method removes an item from the storage based on its ID. It takes the item's ID, along with the method name, client ID, and storage name as parameters. It returns a Promise that resolves when the operation is complete.

The `get` method retrieves an item from the storage by its ID. It takes the item's ID, along with the method name, client ID, and storage name as parameters. It returns a Promise that resolves to the `IStorageData` object if found, or throws an error if not.

The `list` method retrieves a list of items from the storage, optionally filtered by a predicate function. It takes the method name, client ID, storage name, and an optional filter function as parameters. The filter function can be used to specify conditions for the items to match. It returns a Promise that resolves to an array of `IStorageData` objects.

The `clear` method clears all items from the storage. It takes the method name, client ID, and storage name as parameters. It returns a Promise that resolves when the operation is complete.

The `dispose` method disposes of the storage. It takes the method name, client ID, and storage name as parameters. It returns a Promise that resolves when the storage is disposed.

## StorageConnectionService

The StorageConnectionService is a TypeScript class that manages storage connections. It has a constructor to initialize dependencies and several properties for interacting with other services. The getStorage method retrieves a storage instance based on the client ID and storage name. The take method retrieves a list of storage data based on a search query and total number of items. The upsert method upserts an item in the storage. The remove method removes an item from the storage. The get method retrieves an item from the storage by its ID. The list method retrieves a list of items from the storage, optionally filtered by a predicate function. The clear method clears all items from the storage. The dispose method is used to clean up the storage connection.

## StateUtils

The `StateUtils` class is a utility for managing state in an agent swarm. It provides methods to retrieve and set state for a specific client. The `getState` method allows you to retrieve the state for a given client and state name, while the `setState` method sets the state for a given client and state name. Both methods return promises, allowing for asynchronous operations.

## StateSchemaService

The `StateSchemaService` is a service used for managing state schemas. It has a constructor, properties such as `loggerService`, `registry` and `validateShallow`, as well as two methods: `register` and `get`. 

The `register` method is used to register a new state schema by providing the key and value of the schema. 

The `get` method is used to retrieve a state schema by its key.

## StatePublicService

The `StatePublicService` is an implementation of the `TStateConnectionService` interface. It has a constructor, and two properties: `loggerService` and `stateConnectionService`. 

The `setState` method takes a dispatch function, along with `methodName`, `clientId`, and `stateName` as parameters, and returns a promise that resolves to the updated state.

The `getState` method also takes `methodName`, `clientId`, and `stateName` as parameters, and returns a promise that resolves to the current state.

The `dispose` method takes the same parameters as `setState` and `getState`, and returns a promise that resolves when the state is successfully disposed.

This class provides methods to set, get and dispose the state.

## StateConnectionService

The `StateConnectionService` is a TypeScript class that manages state connections. It implements the `IState<T>` interface and provides several methods for working with state. The class has a constructor that initializes various properties, including `loggerService`, `busService`, `methodContextService`, `stateSchemaService`, `sessionValidationService`, and `sharedStateConnectionService`. It also has a private property `_sharedStateSet`.

The class provides a memoized function `getStateRef` for getting a state reference. It also has methods `setState` for setting the state, `getState` for getting the current state, and `dispose` for disposing the state connection.

Overall, `StateConnectionService` is a service that helps manage state connections and provides methods for working with the current state.

## SharedStorageUtils

The `SharedStorageUtils` is a TypeScript class that implements the `TSharedStorage` interface. It provides several methods for interacting with a storage system. These methods include `take`, `upsert`, `remove`, `get`, `list`, and `clear`.

The `take` method allows you to retrieve items from the storage by providing a payload containing search criteria, total number of items to retrieve, agent name, and storage name. It returns a Promise of an array containing the retrieved items.

The `upsert` method enables you to insert or update an item in the storage. You need to provide a payload containing the item data, agent name, and storage name. It returns a Promise that resolves when the operation is complete.

The `remove` method allows you to delete an item from the storage based on its ID, agent name, and storage name. It returns a Promise that resolves when the operation is complete.

The `get` method retrieves a specific item from the storage based on its ID, agent name, and storage name. It returns a Promise that resolves with the retrieved item.

The `list` method allows you to retrieve a list of items from the storage based on filter criteria, agent name, and storage name. It returns a Promise of an array containing the filtered items.

The `clear` method empties the storage specified by agent name and storage name. It returns a Promise that resolves when the operation is complete.

## SharedStoragePublicService

The SharedStoragePublicService is a TypeScript class that provides functionality for managing public storage interactions. It implements the TSharedStorageConnectionService interface and includes properties such as loggerService, sharedStorageConnectionService.

The constructor is used to initialize the service. 

The take method retrieves a list of storage data based on a search query and total number of items. It returns a Promise that resolves to an array of IStorageData objects.

The upsert method is used to insert or update an item in the storage. It takes an IStorageData object, methodName and storageName as parameters and returns a Promise that resolves when the operation is complete.

The remove method removes an item from the storage based on its ID. It takes StorageId, methodName and storageName as parameters and returns a Promise that resolves when the operation is complete.

The get method retrieves an item from the storage by its ID. It takes StorageId, methodName and storageName as parameters and returns a Promise that resolves to an IStorageData object.

The list method retrieves a list of items from the storage, optionally filtered by a predicate function. It takes methodName, storageName and an optional filter function as parameters. The filter function can be used to specify conditions for the items that should be included in the list. It returns a Promise that resolves to an array of IStorageData objects.

The clear method clears all items from the storage. It takes methodName and storageName as parameters, and returns a Promise that resolves when the operation is complete.

## SharedStorageConnectionService

The SharedStorageConnectionService is a TypeScript class that manages storage connections. It implements the IStorage interface and provides various methods for interacting with storage data. The service is constructed with dependencies such as loggerService, busService, methodContextService, storageSchemaService, and embeddingSchemaService.

The getStorage method retrieves a storage instance based on the client ID and storage name. The take method retrieves a list of storage data based on a search query and total number of items. The upsert method allows you to insert or update an item in the storage. The remove method removes an item from the storage by its ID. The get method retrieves an item from the storage by its ID. The list method retrieves a list of items from the storage, optionally filtered by a predicate function. The clear method clears all items from the storage.

## SharedStateUtils

The `SharedStateUtils` is a utility class designed to manage state within the agent swarm. It provides methods for retrieving and setting state based on client names and specific state identifiers.

The `constructor` is used to initialize the utility class.

The `getState` method allows you to retrieve the state for a given client and state name. It returns a promise that resolves to the state value.

The `setState` method is used to set the state for a given client and state name. It accepts either the new state value directly or a function that returns a promise resolving to the new state value. This method also returns a promise that resolves when the state has been successfully set.

Overall, `SharedStateUtils` provides a convenient way to manage and manipulate state within the agent swarm environment.

## SharedStatePublicService

The SharedStatePublicService is a class that implements the TSharedStateConnectionService. It has a constructor, loggerService property, and sharedStateConnectionService property. The setState method allows you to set the state using a provided dispatch function, while the getState method retrieves the current state. Both methods require specifying methodName and stateName parameters.

## SharedStateConnectionService

The SharedStateConnectionService is a TypeScript class that manages shared state connections. It implements the IState interface and has several properties such as loggerService, busService, methodContextService, and stateSchemaService. The constructor is used to initialize the service, while getStateRef is a memoized function that returns a shared state reference. The setState function sets the state by dispatching a Promise, and getState retrieves the current state as a Promise. This service is used to manage and access shared state data in a TypeScript application.

## SessionValidationService

The `SessionValidationService` is a service used for validating and managing sessions in an application. It provides methods to add, remove and manage session data such as agents, history, storage and state usage. The service also allows for session validation and retrieval of session information.

The constructor initializes the service with a loggerService, and several swarm maps (_storageSwarmMap, _historySwarmMap, _agentSwarmMap, _stateSwarmMap and _sessionSwarmMap) to store swarm names for each session. The _sessionModeMap is used to store the session mode for each client.

To add a new session, use the `addSession` method by providing the client ID, swarm name and session mode. The `addAgentUsage`, `addHistoryUsage`, `addStorageUsage` and `addStateUsage` methods are used to add agent, history, storage and state usage respectively to a session. The `removeAgentUsage`, `removeHistoryUsage`, `removeStorageUsage` and `removeStateUsage` methods are used to remove agent, history, storage and state usage respectively from a session.

The `getSessionMode` method retrieves the mode of a session for a given client ID. The `hasSession` method checks if a session exists for the given client ID. The `getSessionList` method retrieves the list of all session IDs. The `getSessionAgentList` method retrieves the list of agents for a session. The `getSessionHistoryList` method retrieves the history list of agents for a session. The `getSwarm` method retrieves the swarm name for a session.

The `validate` method is used to validate if a session exists for the given client ID and source. The `removeSession` method removes a session for the given client ID.

## SessionPublicService

The `SessionPublicService` is a TypeScript class that provides methods for managing public session interactions. It implements the `TSessionConnectionService` interface. The class has a constructor, several properties and methods for emitting messages to the session, executing commands in the session, connecting to the session, committing tool output and system messages to the session, committing assistant and user messages without answer, flushing the agent history and disposing of the session. The class also has a `loggerService` property for logging and a `sessionConnectionService` property for managing session connections.

## SessionConnectionService

The `SessionConnectionService` is a TypeScript class that implements the `ISession` interface. It is responsible for managing session connections and provides various methods to interact with the session. 

The class has a constructor that initializes the logger service, bus service, method context service, swarm connection service, and swarm schema service. These services are used for logging, event bus communication, managing method contexts, and handling swarm connections and schemas.

The `getSession` method retrieves a memoized session based on the provided client ID and swarm name. This allows for efficient retrieval of sessions without having to create a new session every time.

The `emit` method emits a message to the session, which can be used for communication between different parts of the system.

The `execute` method executes a command in the session. It takes a content string and an execution mode as parameters.

The `connect` method connects to the session using a provided connector. It returns a receive message function that can be used to handle incoming messages from the session.

The `commitToolOutput`, `commitSystemMessage`, `commitAssistantMessage`, and `commitUserMessage` methods are used to commit different types of messages (tool output, system message, assistant message, and user message) to the session.

The `commitFlush` method commits all pending messages to the session.

The `dispose` method disposes of the session connection service, freeing up resources and cleaning up any open connections.

## SchemaUtils

The `SchemaUtils` is a utility class that provides functions for various schema-related operations. It has a constructor that does not require any parameters.

The class includes a property called `serialize`, which is a generic function that can serialize an object or an array of objects into a formatted string. This function can be used to convert data into a readable and formatted string representation.

## LoggerUtils

The `LoggerUtils` class is an implementation of the `ILoggerAdapter` and `ILoggerControl` interfaces. It provides a set of methods for logging and controlling log output. The class has a constructor, several properties and methods for logging at different levels (log, info, debug), and a dispose method to clean up resources.

The `LoggerFactory` property is used to create instances of loggers, while `LoggerCallbacks` holds callback functions for client-side logging. The `getLogger` method is used to get a logger instance, and `useCommonAdapter`, `useClientCallbacks`, and `useClientAdapter` are used to configure the logger with specific adapters or callbacks.

The `logClient`, `infoClient`, and `debugClient` methods are used to log messages at different levels from a client, while `log`, `debug`, and `info` are used to log messages at different levels. The `dispose` method is used to clean up resources associated with a specific client.

## LoggerService

The LoggerService is a class that implements the ILogger interface, providing methods to log and debug messages. It has a constructor, several properties such as methodContextService and executionContextService, and methods like log, debug, info, and setLogger. The log method logs messages using the current logger, while debug and info log debug messages and info messages respectively. The setLogger method allows setting a new logger for the service.

## LoggerInstance

The `LoggerInstance` is an implementation of the `ILoggerInstance` interface in TypeScript. It is constructed with a `clientId` and an optional set of callbacks defined in the `ILoggerInstanceCallbacks` interface. The `clientId` is a unique identifier for the client instance.

The `LoggerInstance` has a private property, `__@LOGGER_INSTANCE_WAIT_FOR_INIT@1861`, which is used internally for waiting for initialization.

The `LoggerInstance` provides two methods: 
1. `waitForInit` - This method returns a Promise that resolves when the instance is initialized.
2. `log`, `debug`, and `info` - These methods log messages with different levels of severity. The `log` method logs a general message, the `debug` method logs a debug-level message, and the `info` method logs an informational message.

Lastly, the `LoggerInstance` has a method called `dispose`, which is used to clean up any resources associated with the instance.

## HistoryUtils

The `HistoryUtils` class provides functionality for working with history data in a TypeScript application. It implements the `IHistoryAdapter` and `IHistoryControl` interfaces, allowing for custom history adapters and lifecycle callbacks.

To use a custom history adapter, you can call the `useHistoryAdapter` method, passing in a constructor for the custom history instance. This will replace the default history adapter with your custom implementation.

If you want to use history lifecycle callbacks, you can call the `useHistoryCallbacks` method, passing in an object containing the desired callbacks. This will enable events such as `onHistoryReady`, `onMessageAdded`, and others.

To push a new message to the history, you can use the `push` method. This asynchronous function takes three parameters: the message content (`IModelMessage`), the client ID, and the agent name. It returns a Promise that resolves when the message is successfully added to the history.

If you need to dispose of the history for a specific client and agent, you can use the `dispose` method. This asynchronous function takes the client ID and agent name as parameters, and returns a Promise that resolves when the history is successfully disposed.

To iterate over the history messages, you can use the `iterate` method. This asynchronous function takes the client ID and agent name as parameters, and returns an `AsyncIterableIterator` containing the history messages.

## HistoryPublicService

The `HistoryPublicService` is a TypeScript class that implements the `THistoryConnectionService` interface. It is responsible for handling public operations related to the history. The class has a constructor, properties like `loggerService`, `historyConnectionService`, and methods such as `push`, `toArrayForAgent`, `toArrayForRaw`, and `dispose`.

The `push` method allows you to push a message to the history asynchronously. It takes a `message` object of type `IModelMessage`, a `methodName` string, a `clientId` string, and an `agentName` string as parameters.

The `toArrayForAgent` method converts the history to an array specifically for a given agent. It returns an array of `IModelMessage` objects asynchronously. It takes a `prompt` string, a `methodName` string, a `clientId` string, and an `agentName` string as parameters.

The `toArrayForRaw` method converts the history to a raw array. It returns an array of `IModelMessage` objects asynchronously. It takes a `methodName` string, a `clientId` string, and an `agentName` string as parameters.

The `dispose` method allows you to dispose of the history asynchronously. It takes a `methodName` string, a `clientId` string, and an `agentName` string as parameters.

## HistoryInstance

The `HistoryInstance` class in TypeScript represents a History Instance and implements the `IHistoryInstance` interface. It has a constructor that takes in `clientId` and `callbacks`, which are used to initialize the instance. The class also has properties such as `clientId`, `callbacks`, and private properties like `_array` and `__@HISTORY_INSTANCE_WAIT_FOR_INIT@428`.

The `waitForInit` method is used to wait for the history to initialize, and it takes in an `agentName` parameter. The `iterate` method is used to iterate over the history messages for a given agent, and it returns an `AsyncIterableIterator` of type `IModelMessage`. The `push` method is used to push a new message to the history for a given agent, and it takes in `value` of type `IModelMessage` and an `agentName`. The `dispose` method is used to dispose of the history for a given agent, and it takes in an `agentName` parameter.

## HistoryConnectionService

The `HistoryConnectionService` is a TypeScript class that implements the `IHistory` interface and provides functionality for managing history connections. It has a constructor that initializes the loggerService, busService, methodContextService, and sessionValidationService properties.

The `getHistory` method retrieves the history for a given client and agent. The `push` method pushes a message to the history asynchronously. The `toArrayForAgent` method converts the history to an array format for the agent. The `toArrayForRaw` method converts the history to a raw array format. The `dispose` method disposes of the history connection service.

Overall, this class provides a way to manage and interact with history connections in an application.

## EmbeddingValidationService

The EmbeddingValidationService is a tool used within the agent-swarm to validate embeddings. It has a constructor that initializes the service, and two main functions: `addEmbedding` and `validate`. 

The `addEmbedding` function is used to add a new embedding to the validation service. It takes two parameters: `embeddingName`, which is the name of the embedding, and `embeddingSchema`, which is an object containing the schema for the embedding.

The `validate` function is used to check if a specific embedding exists in the validation service. It takes two parameters: `embeddingName`, which is the name of the embedding to be validated, and `source`, which is the source of the embedding.

Overall, this service helps ensure that the embeddings used within the agent-swarm are valid and correctly defined.

## EmbeddingSchemaService

The EmbeddingSchemaService is a service used for managing embedding schemas. It has a constructor, loggerService, registry, and validateShallow properties. The `register` function is used to register an embedding with a given key and value, while the `get` function retrieves an embedding by its key. This service provides a way to manage and retrieve embedding schemas in your application.

## DocService

The `DocService` is a TypeScript class that provides functionality for generating documentation for swarms and agents. It utilizes several services for validation, schema generation and management, as well as agent and swarm metadata. The class also includes methods for writing documentation for swarm and agent schemas, as well as a method for dumping the documentation for all swarms and agents.

The `DocService` constructor does not take any parameters.

The class has several properties, including `loggerService`, which is used for logging, and various schema service instances (`swarmSchemaService`, `agentSchemaService`, etc.) for managing and validating schema definitions.

The `writeSwarmDoc` method is used to write documentation for a swarm schema, while the `writeAgentDoc` method is used to write documentation for an agent schema.

The `dumpDocs` method is used to dump the documentation for all swarms and agents. It takes an optional `dirName` parameter, which specifies the directory name where the documentation will be saved.

## CompletionValidationService

The CompletionValidationService is a TypeScript service designed to validate completion names. It has a constructor, loggerService property, and two methods: addCompletion() and validate(). 

The constructor is used to initialize the service. The loggerService property is an instance of a logging service, which can be used to log messages or errors. The _completionSet property is used to store the set of completion names.

The addCompletion() method is used to add a new completion name to the set. This method takes a string parameter, completionName, which represents the name of the new completion.

The validate() method is used to check if a given completion name exists in the set. It takes two parameters: completionName (a string representing the name of the completion to be validated) and source (a string representing the source of the completion). This method will return void, meaning it does not have a specific output.

## CompletionSchemaService

The `CompletionSchemaService` is a service that manages completion schemas. It has a constructor, properties like `loggerService`, `registry`, and `validateShallow`, as well as two methods: `register` and `get`. The `register` method is used to add a new completion schema by providing a key and the corresponding `ICompletionSchema` object. The `get` method retrieves a completion schema by its key. This service allows for efficient management and retrieval of completion schemas.

## ClientSwarm

The ClientSwarm class is an implementation of the ISwarm interface and manages agents within a swarm. It has properties such as `params`, `_agentChangedSubject`, `_activeAgent`, and `_navigationStack`. The class provides methods like `constructor`, `navigationPop`, `cancelOutput`, `waitForOutput`, `getAgentName`, `getAgent`, `setAgentRef`, and `setAgentName`. 

The `navigationPop` method pops the navigation stack or returns the default agent. The `cancelOutput` method cancels the await of output by emitting an empty string. The `waitForOutput` method waits for output from the active agent. The `getAgentName` method retrieves the name of the active agent. The `getAgent` method gets the active agent. The `setAgentRef` method sets the reference of an agent in the swarm. The `setAgentName` method sets the active agent by name.

## ClientStorage

The ClientStorage class is an implementation of the IStorage interface, designed to manage storage operations. It has a constructor that takes in parameters defined by the IStorageParams interface for a generic type T. The class has several properties and methods for performing various storage operations.

The _itemMap property is used to store items in the storage. The _createEmbedding method creates an embedding for a given item, which is used to generate embeddings for items. The waitForInit property is used to wait for the initialization of the storage.

The take method allows you to retrieve a specified number of items based on search criteria. The upsert method is used to insert or update an item in the storage. The remove method removes an item from the storage by its ID. The clear method clears all items from the storage. The get method retrieves an item by its ID. The list method lists all items in the storage, optionally filtered by a predicate. Finally, the dispose method is used to dispose of the state.

## ClientState

The `ClientState` class is an implementation of the `IState<State>` interface, representing the client's state. It has a constructor that takes in `IStateParams<State>` as a parameter. The class has several properties and methods to manage the state.

The `params` property holds the parameters used to initialize the state. The `_state` property stores the current state. The `dispatch` property is used to dispatch actions. The `waitForInit` property is a function that waits for the state to initialize. The `setState` method sets the state using a provided dispatch function. The `getState` method retrieves the current state. The `dispose` method disposes of the state.

## ClientSession

The ClientSession class is an implementation of the ISession interface. It has a constructor that takes in parameters of type ISessionParams. This class has several properties and methods that allow for communication with the session. 

The `emit` method allows for emitting a message, while the `execute` method executes a message and optionally emits the output. The `commitToolOutput`, `commitUserMessage`, and `commitSystemMessage` methods allow for committing different types of messages. The `commitFlush` method commits the flush of agent history. 

The `connect` method connects the session to a connector function, and `dispose` should be called when the session is disposed.

## ClientHistory

The `ClientHistory` class in TypeScript represents the history of messages exchanged between a client and an AI model. It implements the `IHistory` interface and provides various methods to interact with the history.

The class has a constructor that takes in `IHistoryParams` as a parameter. This allows for customization of the history's behavior.

The class has properties such as `params`, which holds the parameters used to create the history instance, and `_filterCondition`, which is a filter condition used when converting the history to an array for the agent.

To add a message to the history, you can use the `push` method. This asynchronously adds a new message to the history.

The `toArrayForRaw` method converts the history into an array of raw messages asynchronously.

The `toArrayForAgent` method converts the history into an array of messages specifically for the agent. It takes in a prompt and an optional array of system messages as parameters.

Lastly, the `dispose` method should be called when an agent is disposed to clean up any resources associated with the history.

## ClientAgent

The `ClientAgent` class in TypeScript represents a client agent that interacts with the system. It implements the `IAgent` interface and has various properties, methods, and event subjects for handling agent actions. The `ClientAgent` constructor takes in a set of parameters (`IAgentParams`) to initialize the agent.

The class provides methods for emitting output results, resurrecting the model based on a reason, waiting for output to become available, getting a completion message from the model, committing user and system messages to the history, committing tool output, and executing incoming messages. The `dispose` method should be called when the agent is no longer needed.

Overall, the `ClientAgent` class is responsible for managing agent interactions with the system and handling various actions related to agent functionality.

## BusService

The BusService is an implementation of the IBus interface. It provides a way to handle events and subscriptions for different clients. The constructor is used to initialize the service, while properties like loggerService and sessionValidationService are used for logging and validation purposes.

The _eventSourceSet and _eventWildcardMap are internal properties used to manage event subscriptions. The getEventSubject method is used to retrieve the event subject.

The subscribe method is used to subscribe to events for a specific client and source. It takes in the clientId, source, and a function to handle the events. It returns an unsubscribe function that can be used to stop the subscription.

The once method is similar to subscribe, but it only handles a single event. It takes in the clientId, source, a filter function to specify which event should be handled, and a function to handle the event.

The emit method is used to send an event for a specific client. It takes in the clientId and event object, and returns a Promise that resolves when the event is successfully emitted.

The dispose method is used to clean up all event subscriptions for a specific client. It takes in the clientId and clears all subscriptions associated with that client.

## AgentValidationService

The `AgentValidationService` is a service used for validating agents within an agent swarm. It has a constructor that initializes the service with dependencies such as `loggerService`, `toolValidationService`, `completionValidationService`, and `storageValidationService`. The service also has properties like `_agentMap`, `_agentDepsMap` for internal usage.

The service provides methods to get the list of agents, storages used by an agent, and states used by an agent. It also allows adding a new agent to the validation service.

Additionally, it offers methods to check if an agent has registered storage, dependency or state. These methods use memoization to improve performance and can be controlled for caching purposes.

Lastly, the service provides a method to validate an agent by its name and source.

## AgentSchemaService

The `AgentSchemaService` is a service used for managing agent schemas. It has a constructor, properties such as `loggerService`, `registry`, and `validateShallow` for logging, registry management and validation of agent schemas respectively. The service also has two methods: `register` and `get`. The `register` method is used to add a new agent schema by providing the key and value of the schema. The `get` method retrieves an agent schema by its name.

## AgentPublicService

The `AgentPublicService` is a TypeScript class that implements the `TAgentConnectionService` interface. It provides methods for managing public agent operations such as creating a reference to an agent, executing commands on the agent, waiting for output from the agent, committing tool and system messages to the agent history, committing user and assistant messages to the agent history, committing a flush of the agent's history, committing a change of the agent to prevent tool execution, and disposing of the agent. The class also has properties for `loggerService`, which is used to log messages, and `agentConnectionService`, which is used to connect and disconnect agents.

## AgentMetaService

The `AgentMetaService` is a class that provides methods for managing agent meta nodes and converting them to UML format. It has a constructor, properties such as `loggerService`, `agentSchemaService` and `serialize`, as well as methods like `makeAgentNode` and `toUML`. 

The `makeAgentNode` method creates a meta node for the given agent, while `makeAgentNodeCommon` does the same but with an optional `seen` parameter. The `toUML` method converts the meta nodes of a specific agent to UML format, with an optional `withSubtree` parameter.

## AgentConnectionService

The `AgentConnectionService` is a TypeScript class that implements the `IAgent` interface. It is responsible for managing agent connections and provides various methods to interact with the agent. 

To use this service, you need to provide the `loggerService`, `busService`, `methodContextService`, `sessionValidationService`, `historyConnectionService`, `storageConnectionService`, `agentSchemaService`, `toolSchemaService`, and `completionSchemaService` as dependencies.

The `getAgent` method retrieves an agent instance based on the `clientId` and `agentName`. The `execute` method executes an input command and returns a promise. The `waitForOutput` method waits for the output from the agent and returns a promise.

The `commitToolOutput`, `commitSystemMessage`, `commitAssistantMessage`, and `commitUserMessage` methods commit the respective messages to prevent further tool execution or flushing of agent history. The `commitFlush` method commits the flush of agent history. The `dispose` method disposes of the agent connection.

Overall, this service provides a way to interact with an agent, execute commands, and manage the communication between different components.
