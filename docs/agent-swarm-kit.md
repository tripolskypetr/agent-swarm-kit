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

The `ToolValidationService` is a service designed for validating tools within an agent-swarm system. It provides a way to add new tools and validate their existence. The service uses a loggerService for logging purposes and maintains an internal tool map (_toolMap) for efficient storage and retrieval of tools.

To add a new tool, you can use the `addTool` function. This function takes two parameters: `toolName`, which is the name of the tool, and `toolSchema`, which is an object representing the schema of the tool.

To validate if a tool exists in the validation service, you can use the `validate` function. This function takes two parameters: `toolName`, which is the name of the tool to be validated, and `source`, which represents the source of the tool.

By using these functions, you can effectively manage and validate tools within your agent-swarm system.

## ToolSchemaService

The `ToolSchemaService` is a service that manages tool schemas. It has a constructor, properties such as `loggerService`, `registry`, and `validateShallow`, as well as two methods: `register` and `get`. 

The `register` method allows you to register a tool with a given key and value. This means you can add a new tool to the service using its unique identifier.

The `get` method enables you to retrieve a tool by its key. This means you can access a specific tool from the service by providing its unique identifier.

## SwarmValidationService

The SwarmValidationService is a service used for validating swarms and their agents. It has a constructor, properties such as loggerService and agentValidationService for logging and validating agents respectively, and a private property _swarmMap for storing swarms. 

To add a new swarm, you can use the `addSwarm` function by providing a swarm name and its schema. This will add the swarm to the swarm map.

To retrieve a list of agents for a specific swarm, you can use the `getAgentList` function by providing the swarm name. This will return an array of agent names for the given swarm.

To retrieve a list of all swarms, you can use the `getSwarmList` function. This will return an array of swarm names.

To validate a swarm and its agents, you can use the `validate` function by providing a swarm name and the source code. This will validate the swarm and its agents using the stored loggerService, agentValidationService and swarm map.

## SwarmSchemaService

The SwarmSchemaService is a service used for managing swarm schemas. It has a constructor, loggerService property for logging service messages, registry property to store registered schemas, and validateShallow property for shallow validation of swarm schemas. The service provides two methods: register and get.

The `register` method is used to add a new swarm schema by providing the key and value of the schema. This allows for easy storage and retrieval of swarm schemas.

The `get` method is used to retrieve a swarm schema by its name. This allows for quick access to specific swarm schemas when needed.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It is used for managing public swarm interactions, which involve communication and coordination between multiple agents. The class has a constructor, several properties and methods for various operations such as navigation, output cancellation, waiting for output, getting agent information and disposing of the swarm. The properties include loggerService, swarmConnectionService for logging and connecting to the swarm respectively, while methods like navigationPop and waitForOutput provide functionalities to interact with the swarm.

## SwarmMetaService

The SwarmMetaService is a service that handles swarm metadata. It has properties such as loggerService, swarmSchemaService, agentMetaService and serialize. The loggerService is used for logging, swarmSchemaService handles the schema related operations for swarms, agentMetaService handles metadata related to agents and serialize is used for serialization. The makeSwarmNode function creates a swarm node with the given swarm name. The toUML function converts the swarm metadata into UML format.

## SwarmConnectionService

The SwarmConnectionService is a TypeScript class that implements the ISwarm interface and provides functionality for managing swarm connections. It has a constructor that initializes the loggerService, busService, methodContextService, agentConnectionService, and swarmSchemaService properties.

The service offers several methods:
1. getSwarm(): Retrieves a swarm instance based on the client ID and swarm name.
2. navigationPop(): Pops the navigation stack or returns the default agent.
3. cancelOutput(): Cancels the await of output by emitting an empty string.
4. waitForOutput(): Waits for the output from the swarm.
5. getAgentName(): Retrieves the agent name from the swarm.
6. getAgent(): Retrieves the agent from the swarm.
7. setAgentRef(): Sets the agent reference in the swarm.
8. setAgentName(): Sets the agent name in the swarm.
9. dispose(): Disposes of the swarm connection.

Overall, SwarmConnectionService is a service that allows you to interact with swarm connections, retrieve and set agent information, wait for output from the swarm, and manage the connection's lifecycle.

## StorageValidationService

The StorageValidationService is a service designed to validate storages within the storage swarm. It has a constructor, loggerService property for logging purposes, embeddingValidationService property to validate the embeddings of storages, and a private property _storageMap to store the added storages.

To add a new storage, you can use the `addStorage` function by providing a storage name and its schema. This will add the new storage to the validation service.

To validate an existing storage, you can use the `validate` function by providing a storage name and its source. This will initiate the validation process for that specific storage.

## StorageUtils

The `StorageUtils` is a TypeScript class that implements the `TStorage` interface. It provides several methods for interacting with a storage system. 

1. The `constructor` is used to initialize the storage utilities.
2. The `take` method allows you to retrieve items from the storage by providing a search query, total count, client ID, agent name, and storage name. It returns a promise that resolves to an array of items matching the specified criteria.
3. The `upsert` method enables you to insert or update an item in the storage. You need to provide the new item, client ID, agent name, and storage name. It returns a promise that resolves when the operation is complete.
4. The `remove` method allows you to delete an item from the storage by specifying its ID, client ID, agent name, and storage name. It returns a promise that resolves when the deletion is successful.
5. The `get` method retrieves a specific item from the storage by providing its ID, client ID, agent name, and storage name. It returns a promise that resolves to the requested item.
6. The `list` method allows you to retrieve a list of items from the storage based on specified criteria. You can provide a filter function to further refine the results. It returns a promise that resolves to an array of items matching the specified criteria.
7. The `clear` method empties the storage by providing client ID, agent name, and storage name. It returns a promise that resolves when the clearing process is complete.

Overall, the `StorageUtils` class provides a set of methods to interact with a storage system, allowing you to retrieve, insert, update, delete, and list items in a storage based on various criteria.

## StorageSchemaService

The StorageSchemaService is a service used for managing storage schemas. It has a constructor, properties such as loggerService, registry, and validateShallow. The loggerService is used for logging, registry stores the registered schemas and validateShallow is a validation function for storage schema. The service provides two methods: register and get. 

The 'register' method is used to register a new storage schema by providing the key and value of the schema. The 'get' method is used to retrieve a storage schema by its key. This service allows for efficient management and retrieval of storage schemas.

## StoragePublicService

The StoragePublicService is a service that handles interactions with public storage. It implements the TStorageConnectionService interface and provides methods for managing storage data. The service takes in a loggerService and storageConnectionService as properties.

The `take` method retrieves a list of storage data based on a search query and total number of items. It returns a Promise that resolves to an array of IStorageData objects.

The `upsert` method upserts an item in the storage. It takes an IStorageData object, methodName, clientId, and storageName as parameters and returns a Promise that resolves to void.

The `remove` method removes an item from the storage based on its ID. It takes a StorageId, methodName, clientId, and storageName as parameters and returns a Promise that resolves to void.

The `get` method retrieves an item from the storage by its ID. It takes a StorageId, methodName, clientId, and storageName as parameters and returns a Promise that resolves to an IStorageData object.

The `list` method retrieves a list of items from the storage, optionally filtered by a predicate function. It takes methodName, clientId, storageName, and an optional filter function as parameters. The filter function can be used to specify a custom condition for filtering the items. It returns a Promise that resolves to an array of IStorageData objects.

The `clear` method clears all items from the storage. It takes methodName, clientId, and storageName as parameters. It returns a Promise that resolves to void.

The `dispose` method disposes of the storage. It takes methodName, clientId, and storageName as parameters. It returns a Promise that resolves to void.

## StorageConnectionService

The StorageConnectionService is a TypeScript class that manages storage connections. It has a constructor to initialize dependencies and properties such as loggerService, busService, methodContextService, storageSchemaService, sessionValidationService, embeddingSchemaService, sharedStorageConnectionService, _sharedStorageSet. The service provides methods to retrieve, insert, update, delete, and list storage data. It also allows for clearing all items and disposing of the storage connection.

## StateUtils

The `StateUtils` class is a utility for managing state in an agent swarm. It provides methods to retrieve, set, and clear state for a given client and state name. The class is generic, allowing for different types of state to be used.

To retrieve the current state for a specific client and state name, you can use the `getState` method. This asynchronous function takes a payload object with the client ID, agent name, and state name as parameters. It returns a promise that resolves to the current state value.

To set a new state for a specific client and state name, you can use the `setState` method. This asynchronous function takes a dispatchFn parameter, which can be either the new state value or a function that returns a promise resolving to the new state value. The payload object should contain the client ID, agent name, and state name. The method returns a promise that resolves when the state is successfully set.

To clear a specific state and set it back to its initial value, you can use the `clearState` method. This asynchronous function takes a payload object with the client ID, agent name, and state name as parameters. It returns a promise that resolves to the initial state value.

Overall, `StateUtils` provides a convenient way to manage and manipulate state within an agent swarm system.

## StateSchemaService

The `StateSchemaService` is a service used for managing state schemas. It has a constructor, properties such as `loggerService`, `registry` and `validateShallow`, as well as two methods: `register` and `get`. 

The `register` method is used to register a new state schema by providing the key and value of the schema. 

The `get` method is used to retrieve a state schema by its key.

## StatePublicService

The `StatePublicService` class is an implementation of the `TStateConnectionService` interface. It has a constructor, as well as properties `loggerService` and `stateConnectionService`. 

The class provides three main methods: `setState`, `clearState`, and `getState`. The `setState` method sets the state using a provided dispatch function. The `clearState` method sets the state to its initial value. The `getState` method retrieves the current state. 

Lastly, there is a `dispose` method that disposes the state. 

All of these methods take in parameters for `methodName`, `clientId`, and `stateName`.

## StateConnectionService

The `StateConnectionService` is a TypeScript class that manages state connections. It implements the `IState<T>` interface and provides several methods to interact with the state. The class has several properties such as `loggerService`, `busService`, `methodContextService`, `stateSchemaService`, `sessionValidationService`, and `sharedStateConnectionService` which are used for various functionalities. The `_sharedStateSet` is a private property.

The `getStateRef` is a memoized function that returns a state reference given the client ID and state name. It helps in caching the results for improved performance.

The `setState` method sets the state by dispatching a function that takes the previous state as an argument and returns a Promise that resolves to the updated state.

The `clearState` method sets the state to its initial value.

The `getState` method retrieves the current state as a Promise.

The `dispose` method disposes the state connection, releasing any resources associated with it.

Overall, the `StateConnectionService` provides a way to manage and interact with the state in an efficient manner.

## SharedStorageUtils

The `SharedStorageUtils` is a TypeScript class that implements the `TSharedStorage` interface. It provides several methods to interact with a storage system.

1. The `constructor` is used to initialize the storage utilities.
2. The `take` method allows you to retrieve items from the storage by specifying a search query, total count, agent name, and storage name. It returns a promise that resolves to an array of items matching the specified criteria.
3. The `upsert` method is used to insert or update an item in the storage. You need to provide the new item, agent name, and storage name. It returns a promise that resolves when the operation is complete.
4. The `remove` method allows you to delete an item from the storage by specifying its ID, agent name, and storage name. It returns a promise that resolves when the item is successfully removed.
5. The `get` method retrieves a specific item from the storage by specifying its ID, agent name, and storage name. It returns a promise that resolves to the requested item.
6. The `list` method allows you to retrieve a list of items from the storage by specifying an optional filter function, agent name, and storage name. It returns a promise that resolves to an array of items matching the specified criteria.
7. The `clear` method is used to remove all items from the storage by specifying agent name and storage name. It returns a promise that resolves when the storage is cleared.

These methods provide a way to interact with the storage system in a type-safe manner, making it easier to work with data in a distributed environment.

## SharedStoragePublicService

The SharedStoragePublicService is a TypeScript class that implements the TSharedStorageConnectionService. It is responsible for managing interactions with public storage. The class has a constructor, properties such as loggerService and sharedStorageConnectionService, and several methods including take, upsert, remove, get, list, and clear.

The take method retrieves a list of storage data based on a search query and total number of items. The upsert method allows you to insert or update an item in the storage. The remove method removes an item from the storage by its ID. The get method retrieves an item from the storage by its ID. The list method retrieves a list of items from the storage, optionally filtered by a predicate function. The clear method clears all items from the storage.

## SharedStorageConnectionService

The SharedStorageConnectionService is a service that manages storage connections and provides methods for interacting with the stored data. It takes in dependencies such as loggerService, busService, methodContextService, storageSchemaService, and embeddingSchemaService. The service provides a getStorage method to retrieve storage instances based on client ID and storage name. It also offers methods like take, upsert, remove, get, list, and clear for retrieving, updating, deleting, and managing storage data.

## SharedStateUtils

The `SharedStateUtils` is a utility class designed to manage state within the agent swarm. It provides methods to retrieve, set, and clear state for a specific client and state name. The class uses promises to handle asynchronous operations.

The `constructor` is used to initialize the utility class.

The `getState` method retrieves the state for a given client and state name asynchronously. It returns a promise that resolves to the state value.

The `setState` method sets the state for a given client and state name asynchronously. It accepts a dispatch function that can either be a value or a function accepting the previous shared state and returning a promise resolving to the new shared state.

The `clearState` method sets the state to its initial value for a given client and state name asynchronously. It returns a promise that resolves to the initial state value.

## SharedStatePublicService

The SharedStatePublicService is a class that implements the TSharedStateConnectionService. It has a constructor, and two properties: loggerService and sharedStateConnectionService. The setState method allows you to update the state using a provided dispatch function, while clearState resets the state to its initial value. The getState method retrieves the current state of the system.

## SharedStateConnectionService

The `SharedStateConnectionService` is a TypeScript class that manages shared state connections. It implements the `IState<T>` interface and provides several methods for working with shared state. The class has properties such as `loggerService`, `busService`, `methodContextService`, and `stateSchemaService` which are used for logging, event bus communication, method context management, and state schema handling respectively.

The `getStateRef` method is a memoized function that returns a reference to the shared state with a given name. It uses memoization to avoid unnecessary computations and improve performance.

The `setState` method allows you to update the state by providing a dispatch function that takes the previous state as input and returns a Promise that resolves to the updated state.

The `clearState` method sets the state to its initial value, effectively resetting it.

The `getState` method retrieves the current state as a Promise.

Overall, the `SharedStateConnectionService` provides a way to manage and manipulate shared state in an efficient manner.

## SessionValidationService

The `SessionValidationService` is a service in Typescript that manages and validates sessions. It allows you to add, remove and get information about sessions. You can add a new session using the `addSession` method, add agent usage to a session with `addAgentUsage`, add history usage to a session with `addHistoryUsage`, add storage usage to a session with `addStorageUsage`, and add state usage to a session with `addStateUsage`. You can also remove agent usage, history usage, storage usage and state usage from a session using the respective remove methods. The `getSessionMode` method retrieves the mode of a session, while `hasSession` checks if a session exists. The `getSessionList` method returns a list of all session IDs, and `getSessionAgentList` and `getSessionHistoryList` return the list of agents and history for a specific session, respectively. The `getSwarm` method retrieves the swarm name for a session. The `validate` method checks if a session exists, and `removeSession` removes a session. Finally, `dispose` disposes a session validation cache.

## SessionPublicService

The `SessionPublicService` is a TypeScript class that provides methods for managing public session interactions. It implements the `TSessionConnectionService` interface. The class has several properties, including `loggerService`, `sessionConnectionService`, and functions for emitting messages, executing commands, connecting to the session, committing messages and flushes, stopping tools, and disposing of the session. These functions allow for interaction with a public session, such as sending messages and executing commands.

## SessionConnectionService

The `SessionConnectionService` is a TypeScript class that implements the `ISession` interface. It is responsible for managing session connections and provides various methods to interact with the session. 

To use this service, you need to provide a `loggerService`, `busService`, `methodContextService`, `swarmConnectionService`, and `swarmSchemaService` as dependencies.

The `getSession` method retrieves a memoized session based on the provided `clientId` and `swarmName`. This allows for efficient session retrieval without having to create a new session every time.

The `emit` method allows you to emit a message to the session. It returns a `Promise` that resolves when the message is successfully emitted.

The `execute` method executes a command in the session. It takes two parameters: `content` (the command to execute) and `mode` (the execution mode). It returns a `Promise` that resolves with the result of executing the command.

The `connect` method connects to the session using a provided `connector`. It returns a receive message function that can be used to handle incoming messages from the session.

The `commitToolOutput`, `commitSystemMessage`, and `commitAssistantMessage` methods allow you to commit tool output, system messages, and assistant messages to the session respectively. Each method returns a `Promise` that resolves when the message is successfully committed.

The `commitUserMessage` method allows you to commit a user message to the session without waiting for an answer. It returns a `Promise` that resolves when the message is successfully committed.

The `commitFlush` method commits all pending messages in the session. It returns a `Promise` that resolves when all messages are successfully committed.

The `commitStopTools` method stops all running tools in the session. It returns a `Promise` that resolves when all tools are successfully stopped.

The `dispose` method disposes of the session connection service. It returns a `Promise` that resolves when the disposal is complete.

## SchemaUtils

The `SchemaUtils` is a utility class that provides functions for performing operations related to schemas. It has a constructor that does not take any arguments.

The class includes a property called `serialize`, which is a generic function that can serialize an object or an array of objects into a formatted string. This function can be used to convert data into a readable and formatted string representation.

## LoggerUtils

The `LoggerUtils` is a TypeScript class that implements `ILoggerAdapter` and `ILoggerControl`. It provides methods for logging and controlling log messages. The class has a constructor, several properties and methods for logging different levels of messages (log, info, debug) for a specific client. The `LoggerFactory`, `LoggerCallbacks` and `getLogger` properties are used internally for creating and managing loggers. The `useCommonAdapter`, `useClientCallbacks` and `useClientAdapter` methods are used to configure the logger with specific adapter or callbacks. The `logClient`, `infoClient` and `debugClient` methods are used to log messages with different levels of importance for a specific client. The `log`, `debug` and `info` methods are aliases for the respective client-specific logging methods. The `dispose` method is used to clean up resources associated with a specific client.

## LoggerService

The LoggerService is a class that implements the ILogger interface, providing methods to log and debug messages. It has a constructor, several properties including methodContextService, executionContextService, _commonLogger and getLoggerAdapter. The log method logs messages using the current logger, while debug and info methods log debug and information messages respectively. The setLogger method allows setting a new logger for the service.

## LoggerInstance

The `LoggerInstance` is a class that implements the `ILoggerInstance` interface. It has a constructor that takes in two parameters: `clientId` of type string and `callbacks` of type `Partial<ILoggerInstanceCallbacks>`. 

The `clientId` property is a string that represents the identifier for the client. The `callbacks` property is an object that contains callback functions for various events.

The `__@LOGGER_INSTANCE_WAIT_FOR_INIT@1904` property is an internal variable used for waiting for initialization.

The `waitForInit` method returns a Promise that resolves when the instance is initialized.

The `log`, `debug`, and `info` methods are used to log messages with different levels of severity. They take in a `topic` string and optional arguments.

The `dispose` method is used to clean up any resources and dispose of the instance.

## HistoryUtils

The `HistoryUtils` class provides functionality for managing and interacting with the history of messages in a system. It implements `IHistoryAdapter` and `IHistoryControl`, which allow for customization and control over the history. The class has a constructor, several properties and methods for managing the history.

The `HistoryFactory` and `HistoryCallbacks` properties store any custom factories and callbacks used for the history. The `getHistory` method retrieves the history of messages. The `useHistoryAdapter` method allows for using a custom history adapter, which can be used to integrate with external history systems. The `useHistoryCallbacks` method enables the use of history lifecycle callbacks, which can be used to perform actions at specific points in the history's lifecycle.

The `push` method is used to add a new message to the history, and returns a promise that resolves when the message is successfully added. The `dispose` method disposes of the history for a given client and agent, effectively clearing the history for that specific client and agent.

The `iterate` method allows for iterating over the history messages, returning an `AsyncIterableIterator` that can be used to loop through the messages asynchronously.

## HistoryPublicService

The `HistoryPublicService` is a TypeScript class that implements the `THistoryConnectionService` interface. It is responsible for handling public operations related to the history. The class has a constructor, properties such as `loggerService`, `historyConnectionService`, and methods like `push`, `toArrayForAgent`, `toArrayForRaw`, and `dispose`.

The `push` method allows you to push a message to the history asynchronously. It takes in a `message` object of type `IModelMessage`, a `methodName` string, a `clientId` string, and an `agentName` string.

The `toArrayForAgent` method converts the history to an array specifically for a given agent. It returns the history as an array of `IModelMessage` objects, asynchronously. It takes in a `prompt` string, a `methodName` string, a `clientId` string, and an `agentName` string.

The `toArrayForRaw` method converts the history to a raw array. It returns the history as an array of `IModelMessage` objects, asynchronously. It takes in a `methodName` string, a `clientId` string, and an `agentName` string.

The `dispose` method allows you to dispose of the history asynchronously. It takes in a `methodName` string, a `clientId` string, and an `agentName` string.

## HistoryInstance

The `HistoryInstance` class in TypeScript represents a History Instance and implements the `IHistoryInstance` interface. It has a constructor that takes in `clientId` and `callbacks`, which are used to initialize the instance. The class also has properties such as `clientId`, `callbacks`, and private properties like `_array` and `__@HISTORY_INSTANCE_WAIT_FOR_INIT@432`.

The `waitForInit` method is used to wait for the history to initialize, and it takes in an `agentName` parameter. The `iterate` method allows you to iterate over the history messages for a given agent, and it returns an `AsyncIterableIterator` containing the messages. The `push` method is used to add a new message to the history for a given agent, and it returns a `Promise` that resolves when the message is successfully added. Lastly, the `dispose` method is used to dispose of the history for a given agent, and it also returns a `Promise`.

## HistoryConnectionService

The `HistoryConnectionService` is a TypeScript class that implements the `IHistory` interface and provides functionality for managing history connections. It has a constructor that initializes the loggerService, busService, methodContextService, and sessionValidationService. The class also includes several methods for retrieving and manipulating history data.

The `getHistory` method retrieves the history for a given client and agent. The `push` method pushes a message to the history. The `toArrayForAgent` method converts the history to an array format for the agent. The `toArrayForRaw` method converts the history to a raw array format. The `dispose` method disposes of the history connection service.

Overall, this class provides a way to manage and interact with history data in a TypeScript application.

## EmbeddingValidationService

The EmbeddingValidationService is a tool used within the agent-swarm to validate embeddings. It has a constructor that initializes the service, and two main properties: loggerService for logging messages, and _embeddingMap to store the embeddings.

To add a new embedding, you can use the `addEmbedding` function, which takes the embedding name and its schema as parameters. This will add the embedding to the validation service for future use.

To validate if an embedding exists in the validation service, you can use the `validate` function. It takes the embedding name and its source as parameters. This function will check if the specified embedding exists in the validation service.

## EmbeddingSchemaService

The EmbeddingSchemaService is a service used for managing embedding schemas. It has a constructor, loggerService property for logging purposes, registry property to store registered embedding schemas, and validateShallow property for shallow validation of embedding schemas. The service provides two methods: register and get. 

The `register` method is used to register a new embedding schema with the given key and value. This allows you to store embedding schemas for later use.

The `get` method is used to retrieve an embedding schema by its key. This allows you to access previously registered embedding schemas.

## DocService

The DocService is a TypeScript class that provides functionality for generating documentation for swarms and agents. It utilizes several services for validation, schema generation, and metadata retrieval. The constructor initializes these services, and the class provides methods for writing documentation for swarm and agent schemas, as well as a method to dump the documentation for all swarms and agents. The dumpDocs method takes an optional directory name parameter and returns a Promise that resolves when the documentation has been successfully dumped.

## CompletionValidationService

The CompletionValidationService is a TypeScript class that provides functionality for validating completion names. It has a constructor, which is used to initialize the service. The class also has two properties: `loggerService` and `_completionSet`. 

The `loggerService` property is of type any and seems to be a logger service used for logging purposes within the class. The `_completionSet` property is also of type any and appears to be a set that stores completion names.

The class has two methods: `addCompletion` and `validate`. The `addCompletion` method is used to add a new completion name to the set. It takes in a `completionName` parameter of type string. The `validate` method is used to check if a given `completionName` exists in the set. It also takes a `source` parameter of type string.

Overall, the CompletionValidationService is a utility class for managing and validating completion names in a TypeScript application.

## CompletionSchemaService

The `CompletionSchemaService` is a service that manages completion schemas. It has a constructor, properties like `loggerService`, `registry`, and `validateShallow`, as well as two methods: `register` and `get`. The `register` method is used to add a new completion schema by providing a key and the corresponding `ICompletionSchema` object. The `get` method retrieves a completion schema by its key. This service allows for easy management and retrieval of completion schemas.

## ClientSwarm

The ClientSwarm class is an implementation of the ISwarm interface and manages agents within a swarm. It has properties such as `params`, `_agentChangedSubject`, `_activeAgent`, and `_navigationStack`. The class provides methods like `constructor`, `navigationPop`, `cancelOutput`, `waitForOutput`, `getAgentName`, `getAgent`, `setAgentRef`, and `setAgentName`.

The constructor takes in a parameter of type ISwarmParams. The `navigationPop` method pops the navigation stack or returns a default agent. The `cancelOutput` method cancels the await of output by emitting an empty string. The `waitForOutput` method waits for output from the active agent. The `getAgentName` method retrieves the name of the active agent. The `getAgent` method retrieves the active agent. The `setAgentRef` method sets the reference of an agent in the swarm. The `setAgentName` method sets the active agent by name.

## ClientStorage

The ClientStorage class is an implementation of the IStorage interface, designed to manage storage operations. It has a constructor that takes in parameters defined by the IStorageParams interface for a generic type T. The class has several properties and methods for performing various storage operations.

The _itemMap property is used to store items in the storage. The _createEmbedding method creates an embedding for a given item, which is used to generate embeddings for the items in the storage. The waitForInit property is used to wait for the initialization of the storage.

The take method allows you to retrieve a specified number of items based on search criteria. The upsert method is used to insert or update an item in the storage. The remove method removes an item from the storage by its ID. The clear method clears all items from the storage. The get method retrieves an item by its ID. The list method lists all items in the storage, optionally filtered by a predicate. Finally, the dispose method is used to dispose of the state.

## ClientState

The `ClientState` class is an implementation of the `IState<State>` interface and represents the state of a client. It has properties such as `params`, which holds the state parameters, and `_state`, which stores the current state. The class also has methods like `dispatch`, which allows dispatching actions to update the state, `waitForInit`, which waits for the state to initialize, `setState`, which sets the state using a provided dispatch function, `clearState`, which sets the state to its initial value, `getState`, which retrieves the current state, and `dispose`, which disposes of the state.

## ClientSession

The `ClientSession` class is an implementation of the `ISession` interface. It has a constructor that takes in `ISessionParams` as a parameter. The class has several properties and methods for emitting messages, executing messages with optional emission and execution mode, committing tool output, user message without answer, flushing agent history, stopping the next tool execution, committing system and assistant messages. The `connect` method connects the session to a connector function, and `dispose` should be called when the session is disposed.

## ClientHistory

The `ClientHistory` class in TypeScript represents the history of messages exchanged between a client and an AI model. It implements the `IHistory` interface and provides various methods to interact with the message history.

The class has a constructor that takes in `IHistoryParams` as a parameter. It also has properties such as `params`, which holds the parameters for the history, and `_filterCondition`, which is a filter condition used in the `toArrayForAgent` method.

The `push` method allows you to add a new message to the history asynchronously. The `toArrayForRaw` method converts the history into an array of raw messages asynchronously. The `toArrayForAgent` method converts the history into an array of messages suitable for displaying to the agent, taking into account a prompt and optional system messages. Lastly, the `dispose` method should be called when an agent is disposed to clean up any resources associated with the history.

## ClientAgent

The `ClientAgent` class implements the `IAgent` interface and represents a client agent that interacts with the system. It has a constructor that takes in `IAgentParams` as a parameter. The class has several properties and methods for interacting with the agent, such as emitting output results after validation, resurrecting the model based on a given reason, waiting for output to be available, getting the completion message from the model, committing user and system messages to history, and executing incoming messages. The `dispose` method should be called when the agent is disposed.

## BusService

The BusService is an implementation of the IBus interface that provides functionality for event handling and communication between different clients. It uses the loggerService for logging, sessionValidationService for validation and _eventSourceSet, _eventWildcardMap and getEventSubject for event management.

The constructor initializes the loggerService, sessionValidationService and sets up event management properties.

The subscribe method allows clients to subscribe to events for a specific source. It takes in the clientId, source and a function to handle the events. It returns an unsubscribe function that can be used to stop the subscription.

The once method is similar to subscribe, but it only allows the client to receive one event.

The emit method allows clients to send events for a specific client. It returns a Promise that resolves when the event is successfully emitted.

The dispose method allows clients to clean up their event subscriptions by disposing of all subscriptions for a specific client.

## AgentValidationService

The `AgentValidationService` is a service used for validating agents within an agent swarm. It has a constructor that initializes the logger service, tool validation service, completion validation service, and storage validation service. The service also has several properties and methods for managing agents, their dependencies, storages, and states.

The `getAgentList` method retrieves a list of agent names. The `getStorageList` method retrieves a list of storages used by an agent. The `getStateList` method retrieves a list of states used by an agent.

To add a new agent, you can use the `addAgent` method by providing an agent name and its schema.

The `hasStorage`, `hasDependency`, and `hasState` methods are memoized functions that check if an agent has a registered storage, dependency, or state respectively.

To validate an agent by its name and source, you can use the `validate` method.

## AgentSchemaService

The `AgentSchemaService` is a service that manages agent schemas. It has a constructor, properties such as `loggerService`, `registry`, and `validateShallow` for logging, registry management and validation of agent schemas respectively. The service provides two main functions: `register` and `get`. The `register` function is used to register a new agent schema by providing the key and value of the schema. The `get` function retrieves an agent schema by its name. This service allows for efficient management and retrieval of agent schemas.

## AgentPublicService

The `AgentPublicService` is a TypeScript class that provides methods for managing public agent operations. It implements the `TAgentConnectionService` interface. The class has a constructor, several properties and methods.

The `loggerService` property is an instance of a logger service, which can be used to log messages. The `agentConnectionService` property is an instance of the `TAgentConnectionService` class, which provides methods for connecting to agents.

The `createAgentRef` method creates a reference to an agent by specifying the method name, client ID and agent name. It returns a `ClientAgent` object that represents the agent.

The `execute` method executes a command on the agent by specifying the input, execution mode, method name, client ID and agent name. It returns a promise that resolves when the command is executed.

The `waitForOutput` method waits for the agent's output by specifying the method name, client ID and agent name. It returns a promise that resolves with the agent's output.

The `commitToolOutput` method commits tool output to the agent by specifying the tool ID, content, method name, client ID and agent name. It returns a promise that resolves when the output is committed.

The `commitSystemMessage` method commits a system message to the agent by specifying the message, method name, client ID and agent name. It returns a promise that resolves when the message is committed.

The `commitAssistantMessage` method commits an assistant message to the agent history by specifying the message, method name, client ID and agent name. It returns a promise that resolves when the message is committed.

The `commitUserMessage` method commits user message to the agent without answer by specifying the message, method name, client ID and agent name. It returns a promise that resolves when the message is committed.

The `commitFlush` method commits flush of agent history by specifying the method name, client ID and agent name. It returns a promise that resolves when the flush is committed.

The `commitAgentChange` method commits change of agent to prevent the next tool execution from being called by specifying the method name, client ID and agent name. It returns a promise that resolves when the change is committed.

The `commitStopTools` method prevents the next tool from being executed by specifying the method name, client ID and agent name. It returns a promise that resolves when the prevention is committed.

The `dispose` method disposes of the agent by specifying the method name, client ID and agent name. It returns a promise that resolves when the agent is disposed.

## AgentMetaService

The `AgentMetaService` is a class that provides methods for managing agent meta nodes and converting them to UML format. It has a constructor, properties such as `loggerService`, `agentSchemaService` and `serialize`, as well as methods like `makeAgentNode` and `toUML`.

The `makeAgentNode` method creates a meta node for the given agent, while `makeAgentNodeCommon` does the same but with an optional `seen` parameter. The `toUML` method converts the meta nodes of a specific agent to UML format, with an optional `withSubtree` parameter.

## AgentConnectionService

The `AgentConnectionService` is a TypeScript class that manages agent connections. It has a constructor and several properties that include services for logging, event bus, method context, session validation, history connection, storage connection, agent schema service, tool schema service, and completion schema service.

The `AgentConnectionService` provides methods to retrieve an agent instance, execute input commands, wait for output from the agent, commit tool and system messages, commit user message without answer, commit agent change to prevent tool execution, stop tools from being executed, commit flush of agent history, and dispose the agent connection.
