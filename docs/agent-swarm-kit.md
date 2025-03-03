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

To add a new tool, you can use the `addTool` function. This function takes two parameters: `toolName`, which is the name of the tool, and `toolSchema`, which is an object representing the schema of the tool.

To validate if a specific tool exists in the validation service, you can use the `validate` function. This function takes two parameters: `toolName`, which is the name of the tool to be validated, and `source`, which represents the source of the tool.

By using these functions, you can effectively manage and validate tools within your agent-swarm system.

## ToolSchemaService

The `ToolSchemaService` is a service that manages tool schemas. It has a constructor that initializes the service with `loggerService` and `registry`. The service provides two main functions: `register` and `get`. 

The `register` function allows you to register a tool with a given key and value. This means you can add a new tool to the service by specifying its unique identifier and the tool's details.

The `get` function enables you to retrieve a tool by its key. This means you can access a specific tool's details by providing its unique identifier to the function.

## SwarmValidationService

The SwarmValidationService is a service used for validating swarms and their agents. It has a constructor, properties such as loggerService and agentValidationService for logging and handling agent validation, a private property _swarmMap for storing swarms, and methods like addSwarm for adding new swarms, getAgentList for retrieving agent lists of a swarm, getSwarmList for retrieving the list of swarms, and validate for validating a given swarm and its agents.

## SwarmSchemaService

The SwarmSchemaService is a service that manages swarm schemas. It has a constructor, loggerService property for logging messages, registry property to store registered schemas, and register and get methods for adding new schemas and retrieving them by name, respectively.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It is designed to manage public swarm interactions, allowing users to interact with swarms in a public context. The class provides various methods for navigating, canceling output, waiting for output, getting agent information, and disposing of swarms.

To use this service, you need to provide the loggerService and swarmConnectionService as dependencies. The loggerService is responsible for logging messages, while the swarmConnectionService handles connections to swarms.

Some of the key methods in this service include:
- navigationPop(): This method allows you to pop the navigation stack or return a default agent.
- cancelOutput(): This method cancels the await of output by emitting an empty string.
- waitForOutput(): This method waits for output from the swarm.
- getAgentName(): This method retrieves the agent name from the swarm.
- getAgent(): This method retrieves the agent from the swarm.
- setAgentRef(): This method sets the agent reference in the swarm.
- setAgentName(): This method sets the agent name in the swarm.
- dispose(): This method disposes of the swarm.

You can use these methods to interact with swarms in a public context, allowing for more complex and engaging interactions with your users.

## SwarmMetaService

The SwarmMetaService is a service designed to handle swarm metadata. It has a constructor that initializes the loggerService, swarmSchemaService, agentMetaService, and serialize properties. The makeSwarmNode function creates a swarm node with the given swarm name. The toUML function converts the swarm metadata into UML format.

## SwarmConnectionService

The SwarmConnectionService is a TypeScript class that implements the ISwarm interface and manages connections to a swarm. It has properties for the loggerService, busService, methodContextService, agentConnectionService, and swarmSchemaService. The constructor is used to initialize the service, and it provides several methods for interacting with the swarm.

The getSwarm method retrieves a swarm instance based on the client ID and swarm name. The navigationPop method pops the navigation stack or returns a default agent. The cancelOutput method cancels the await of output by emitting an empty string. The waitForOutput method waits for output from the swarm. The getAgentName method retrieves the agent name from the swarm, while getAgent retrieves the agent from the swarm. The setAgentRef method sets the agent reference in the swarm, and setAgentName sets the agent name in the swarm. Finally, dispose is used to dispose of the swarm connection.

## StorageValidationService

The StorageValidationService is a TypeScript service designed for validating storages within a storage swarm. It provides functionality to add new storages, as well as validate existing ones. The service utilizes a loggerService for logging purposes, an embeddingValidationService to validate the storage embeddings, and an internal _storageMap to keep track of the added storages.

To add a new storage, you can use the `addStorage` method by providing a storage name and its schema. This will register the new storage with the validation service.

To validate an existing storage, you can use the `validate` method by specifying its name and the source. This will trigger a validation process for that particular storage.

Overall, the StorageValidationService serves as a tool for managing and validating storages within the storage swarm environment.

## StorageUtils

The `StorageUtils` class implements the `TStorage` interface and provides several methods for interacting with a storage system. It allows you to take, upsert, remove, get, list, and clear items from the storage.

1. `take`: This method takes items from the storage. You need to provide a payload object with properties such as `search`, `total`, `clientId`, `agentName`, and `storageName`. It returns a promise that resolves to an array of items matching the specified criteria.
2. `upsert`: This method upserts an item in the storage. You need to provide a payload object with properties such as `item`, `clientId`, `agentName`, and `storageName`. It returns a promise that resolves to `void`.
3. `remove`: This method removes an item from the storage. You need to provide a payload object with properties such as `itemId`, `clientId`, `agentName`, and `storageName`. It returns a promise that resolves to `void`.
4. `get`: This method gets an item from the storage. You need to provide a payload object with properties such as `itemId`, `clientId`, `agentName`, and `storageName`. It returns a promise that resolves to the specified item.
5. `list`: This method lists items from the storage. You need to provide a payload object with properties such as `clientId`, `agentName`, and `storageName`. Optionally, you can provide a `filter` function to specify the criteria for filtering items. It returns a promise that resolves to an array of items matching the specified criteria.
6. `clear`: This method clears the storage. You need to provide a payload object with properties such as `clientId`, `agentName`, and `storageName`. It returns a promise that resolves to `void`.

These methods provide a convenient way to interact with the storage system and perform various operations on stored items.

## StorageSchemaService

The StorageSchemaService is a management service for storage schemas. It has a constructor, loggerService property for logging purposes and registry property to store registered schemas. The service allows you to register new storage schemas using the `register` method and retrieve a storage schema by its key using the `get` method.

## StoragePublicService

The `StoragePublicService` is a TypeScript class that implements the `TStorageConnectionService` interface. It is responsible for managing interactions with public storage services. The class has a constructor, properties such as `loggerService` and `storageConnectionService`, as well as several methods for interacting with the storage.

The `take` method retrieves a list of storage data based on a search query and total number of items. The `upsert` method upserts an item into the storage. The `remove` method removes an item from the storage by its ID. The `get` method retrieves an item from the storage by its ID. The `list` method retrieves a list of items from the storage, optionally filtered by a predicate function. The `clear` method clears all items from the storage. The `dispose` method disposes of the storage.

## StorageConnectionService

The StorageConnectionService is a service that manages storage connections and provides methods for interacting with the stored data. It implements the IStorage interface and has properties for other services such as loggerService, busService, methodContextService, storageSchemaService, sessionValidationService, and embeddingSchemaService.

The constructor is used to initialize the service.

The getSharedStorage method retrieves a shared storage instance based on the provided client ID and storage name. It also implements IClearableMemoize and IControlMemoize for clearing and controlling the memoized storage.

The getStorage method retrieves a storage instance based on the client ID and storage name. It also implements IClearableMemoize and IControlMemoize for clearing and controlling the memoized storage.

The take method retrieves a list of storage data based on the provided search query and total number of items. It returns a Promise that resolves to an array of IStorageData objects.

The upsert method upserts an item into the storage. It takes an IStorageData object as a parameter and returns a Promise that resolves when the operation is complete.

The remove method removes an item from the storage based on its ID. It returns a Promise that resolves when the operation is complete.

The get method retrieves an item from the storage by its ID. It takes a StorageId as a parameter and returns a Promise that resolves to the corresponding IStorageData object.

The list method retrieves a list of items from the storage, optionally filtered by a predicate function. It returns a Promise that resolves to an array of IStorageData objects.

The clear method clears all items from the storage. It returns a Promise that resolves when the operation is complete.

The dispose method disposes of the storage connection. It returns a Promise that resolves when the operation is complete.

## StateUtils

The `StateUtils` class is a utility for managing state in an agent swarm. It provides methods to retrieve and set state for a specific client.

The `constructor` is used to initialize the class.

The `getState` method retrieves the state for a given client and state name. It returns the state as a promise, with an optional type parameter `T` to specify the expected state type.

The `setState` method sets the state for a given client and state name. It takes two parameters: `dispatchFn`, which can be either the new state value or a function that returns a promise resolving to the new state value, and `payload`, which contains the client ID, agent name, and state name. It also returns a promise indicating the success of the state update.

## StateSchemaService

The `StateSchemaService` is a service used for managing state schemas. It has a constructor, `loggerService` and `registry` properties, as well as `register` and `get` methods. The `loggerService` is used for logging, while the `registry` stores registered state schemas. The `register` method is used to add a new state schema, and the `get` method retrieves a state schema by its key.

## StatePublicService

The `StatePublicService` class is an implementation of the `TStateConnectionService` interface. It has a constructor, as well as properties `loggerService` and `stateConnectionService`. The class provides three main functions: `setState`, `getState`, and `dispose`.

The `setState` function sets the state using a provided dispatch function. It takes in the dispatch function, a method name, a client ID, and a state name as parameters. It returns the updated state after dispatching the action.

The `getState` function retrieves the current state. It takes in a method name, client ID, and state name as parameters. It returns the current state after fetching it from the server.

The `dispose` function disposes of the state. It takes in a method name, client ID, and state name as parameters. It releases any resources associated with the state and returns `void`.

Overall, the `StatePublicService` class allows for managing and interacting with the state of a system, providing methods to set, get, and dispose of the state.

## StateConnectionService

The StateConnectionService is a TypeScript class that manages state connections. It has a constructor and several properties such as loggerService, busService, methodContextService, stateSchemaService, and sessionValidationService. The service provides two memoized functions, getSharedStateRef and getStateRef, which are used to retrieve shared and individual state references respectively. The setState function is used to update the state, while getState retrieves the current state. The dispose function is used to clean up the state connection.

## SessionValidationService

The SessionValidationService is a TypeScript class that provides methods for validating and managing sessions. It uses several properties to store session data, such as _storageSwarmMap, _historySwarmMap, _agentSwarmMap, and more. 

To add a new session, you can use the `addSession` method by providing the client ID, swarm name, and session mode. You can also add agent usage, history usage, storage usage, and state usage to a session using the `addAgentUsage`, `addHistoryUsage`, `addStorageUsage`, and `addStateUsage` methods respectively.

To remove agent usage, history usage, storage usage, or state usage from a session, you can use the `removeAgentUsage`, `removeHistoryUsage`, `removeStorageUsage`, and `removeStateUsage` methods respectively.

The `getSessionMode` method allows you to retrieve the mode of a session by providing the client ID. The `hasSession` method checks if a session exists for the given client ID.

To get a list of all session IDs, you can use the `getSessionList` method. To get a list of agents for a specific session, you can use the `getSessionAgentList` method by providing the client ID. Similarly, you can use `getSessionHistoryList` to get the history list of agents for a session.

The `getSwarm` method retrieves the swarm name for a session by providing the client ID.

To validate if a session exists, you can use the `validate` method by providing the client ID and source. Finally, you can remove a session using the `removeSession` method by providing the client ID.

## SessionPublicService

The `SessionPublicService` is a TypeScript class that implements the `TSessionConnectionService` interface. It is responsible for managing public session interactions, which include emitting messages, executing commands, connecting to the session, committing tool output, system messages, user messages, flushing agent history, and disposing of the session.

The class has a constructor that initializes the `loggerService` and `sessionConnectionService`. It also provides several methods:

1. `emit` - Emits a message to the session.
2. `execute` - Executes a command in the session.
3. `connect` - Connects to the session and returns a receive message function.
4. `commitToolOutput` - Commits tool output to the session.
5. `commitSystemMessage` - Commits a system message to the session.
6. `commitUserMessage` - Commits a user message to the agent without an answer.
7. `commitFlush` - Commits a flush of the agent history.
8. `dispose` - Disposes of the session.

These methods allow for interaction with the session, including sending messages and executing commands. The `commit` methods are used to commit different types of messages (tool output, system message, user message) to the session. The `commitFlush` method is used to commit a flush of the agent history. The `dispose` method is used to dispose of the session when it's no longer needed.

## SessionConnectionService

The `SessionConnectionService` is a TypeScript class that implements the `ISession` interface and manages session connections. It has a constructor that initializes properties such as `loggerService`, `busService`, `methodContextService`, `swarmConnectionService`, and `swarmSchemaService`. 

The class provides several methods: `getSession` retrieves a memoized session based on the `clientId` and `swarmName`, `emit` allows you to emit a message to the session, `execute` executes a command in the session, `connect` connects to the session using a provided connector, `commitToolOutput` commits tool output to the session, `commitSystemMessage` commits a system message to the session, `commitUserMessage` commits a user message to the session, `commitFlush` commits all pending messages, and `dispose` disposes of the session connection service.

## SchemaUtils

The `SchemaUtils` is a utility class that provides functions for performing operations related to schemas. It has a constructor that does not take any parameters.

The `serialize` property is a function that can serialize an object or an array of objects into a formatted string. It can handle both single objects and arrays of objects.

## LoggerUtils

The LoggerUtils class is an implementation of the ILoggerAdapter and ILoggerControl interfaces. It has a constructor, several properties and methods for logging different levels of information, and a dispose method. The LoggerFactory property is used to create logger instances, while LoggerCallbacks and getLogger are used for managing callbacks. The useCommonAdapter, useClientCallbacks and useClientAdapter methods are used to configure the logger. The logClient, infoClient, debugClient, log, debug, info and dispose methods are used for logging different levels of information and disposing a logger instance.

## LoggerService

The LoggerService is a class that implements the ILogger interface, providing methods to log and debug messages. It has a constructor, several properties including methodContextService, executionContextService, _commonLogger and getLoggerAdapter. The log method logs messages using the current logger, while debug and info methods log debug and information messages respectively. The setLogger method allows you to set a new logger.

## LoggerInstance

The `LoggerInstance` is a class that implements the `ILoggerInstance` interface. It has a constructor that takes in two parameters: `clientId` of type string and `callbacks`, which is a partial implementation of the `ILoggerInstanceCallbacks` interface.

The `clientId` property is a string that represents the identifier for the client using this logger instance. The `callbacks` property is an object that contains partial implementations of the callback functions defined in `ILoggerInstanceCallbacks`.

The `__@LOGGER_INSTANCE_WAIT_FOR_INIT@1714` property is an internal variable used for waiting for the logger instance to initialize.

The `waitForInit` method returns a Promise that resolves when the logger instance has finished initializing.

The `log`, `debug`, and `info` methods are used to log messages with different levels of severity. They each take in a `topic` string and optional arguments (`args`) to be logged.

The `dispose` method is used to clean up any resources associated with the logger instance.

## HistoryUtils

The `HistoryUtils` class provides functionality for working with history data. It implements the `IHistoryAdapter` and `IHistoryControl` interfaces. The class constructor initializes the `HistoryFactory`, `HistoryCallbacks`, and `getHistory` properties.

To use a custom history adapter, you can call the `useHistoryAdapter` method, passing in a constructor for the custom history instance. This allows you to integrate a specific history implementation into the `HistoryUtils` class.

If you want to use history lifecycle callbacks, you can call the `useHistoryCallbacks` method, passing in a partial `IHistoryInstanceCallbacks` object. This enables you to hook into various events and callbacks during the history lifecycle.

To push a new message to the history, you can use the `push` method. This method takes a message object, client ID, and agent name as parameters and returns a Promise that resolves when the message is successfully added to the history.

If you need to dispose of the history for a specific client and agent, you can use the `dispose` method. This method takes the client ID and agent name as parameters and returns a Promise that resolves when the history is successfully disposed.

To iterate over the history messages, you can use the `iterate` method. This method takes a client ID and agent name as parameters, and returns an `AsyncIterableIterator` that allows you to iterate over the history messages asynchronously.

## HistoryPublicService

The `HistoryPublicService` is a TypeScript class that implements the `THistoryConnectionService` interface. It is responsible for handling public operations related to the history. The class has a constructor, properties such as `loggerService`, `historyConnectionService`, and methods like `push`, `toArrayForAgent`, `toArrayForRaw`, and `dispose`.

The `push` method allows you to push a message to the history asynchronously. It takes a `message` object of type `IModelMessage`, a `methodName` string, a `clientId` string, and an `agentName` string as parameters.

The `toArrayForAgent` method converts the history to an array specifically for a given agent. It returns an array of `IModelMessage` objects asynchronously. It takes a `prompt` string, a `methodName` string, a `clientId` string, and an `agentName` string as parameters.

The `toArrayForRaw` method converts the history to a raw array. It returns an array of `IModelMessage` objects asynchronously. It takes a `methodName` string, a `clientId` string, and an `agentName` string as parameters.

The `dispose` method allows you to dispose of the history asynchronously. It takes a `methodName` string, a `clientId` string, and an `agentName` string as parameters.

## HistoryInstance

The `HistoryInstance` class in TypeScript represents a History Instance and implements the `IHistoryInstance` interface. It has a constructor that takes in `clientId` and `callbacks`, which are used to initialize the instance. The class also has several properties and methods for interacting with the history data.

The `waitForInit` method allows you to wait for the history to initialize, while the `iterate` method enables you to iterate over the history messages for a specific agent. The `push` method is used to add a new message to the history for a given agent, and the `dispose` method is used to dispose of the history for a given agent.

Overall, the `HistoryInstance` class provides a way to manage and interact with historical data for different agents in a TypeScript application.

## HistoryConnectionService

The `HistoryConnectionService` is a TypeScript class that implements the `IHistory` interface and provides functionality for managing history connections. It has a constructor that initializes the loggerService, busService, methodContextService, and sessionValidationService properties.

The `getHistory` method retrieves the history for a given client and agent. The `push` method pushes a message to the history asynchronously. The `toArrayForAgent` method converts the history to an array format for agents. The `toArrayForRaw` method converts the history to a raw array format. The `dispose` method disposes of the history connection service.

Overall, this class provides a way to manage history connections and manipulate the history data in various formats.

## EmbeddingValidationService

The EmbeddingValidationService is a tool used within the agent-swarm system to validate embeddings. It provides a way to add new embeddings and validate their existence. The service keeps track of embeddings using an internal map and utilizes a loggerService for logging purposes. To add a new embedding, you can use the `addEmbedding` function by providing an embedding name and its schema. To validate if a specific embedding exists, you can use the `validate` function by passing in the embedding name and its source. This helps ensure that the correct embeddings are being used within the system.

## EmbeddingSchemaService

The EmbeddingSchemaService is a service used for managing embedding schemas. It has a constructor, loggerService and registry properties. The `register` function is used to register an embedding with a given key and value, while the `get` function retrieves an embedding by its key. This service allows for easy management and retrieval of embedding schemas.

## DocService

The `DocService` is a TypeScript class that provides functionality for generating documentation for swarms and agents. It utilizes several other services such as `loggerService`, `swarmValidationService`, `agentValidationService`, `swarmSchemaService`, `agentSchemaService`, `toolSchemaService`, `storageSchemaService`, `stateSchemaService`, `agentMetaService`, and `swarmMetaService`. The class also includes methods for writing documentation for swarm and agent schemas, as well as a method for dumping the documentation for all swarms and agents. The `dumpDocs` method takes an optional parameter `dirName`, which specifies the directory name where the documentation will be saved.

## CompletionValidationService

The CompletionValidationService is a TypeScript class that provides functionality for validating completion names. It has a constructor, which is used to initialize the service. The class also has two properties: loggerService and _completionSet.

The loggerService property is of type any and can be used to log messages or errors. The _completionSet property is used to store the set of completion names.

The addCompletion method is used to add a new completion name to the set. It takes in a string parameter, completionName, which represents the name of the new completion.

The validate method is used to check if a given completion name exists in the set. It takes two parameters: completionName, which is the name of the completion to be validated, and source, which represents the origin of the completion name.

Overall, this service allows developers to easily validate the existence of completion names and add new ones to the set.

## CompletionSchemaService

The `CompletionSchemaService` is a service that allows you to manage completion schemas. It has a constructor, `loggerService` and `registry` properties, as well as two methods: `register` and `get`. 

The `register` method is used to register a new completion schema by providing a key and the corresponding `ICompletionSchema` object.

The `get` method retrieves a completion schema by its key.

This service is useful for managing and retrieving completion schemas in your application.

## ClientSwarm

The ClientSwarm class is an implementation of the ISwarm interface and manages agents within a swarm. It has properties such as `params`, `_agentChangedSubject`, `_activeAgent`, and `_navigationStack` to handle swarm-related operations. The class provides methods like `navigationPop`, `cancelOutput`, `waitForOutput`, `getAgentName`, `getAgent`, and `setAgentRef` for interacting with the swarm and its agents. The `navigationPop` method pops the navigation stack or returns a default agent, while `cancelOutput` cancels the await of output by emitting an empty string. The `waitForOutput` method waits for output from the active agent, `getAgentName` retrieves the name of the active agent, `getAgent` gets the active agent, and `setAgentRef` sets the reference of an agent in the swarm. The `setAgentName` method sets the active agent by name.

## ClientStorage

The ClientStorage class is an implementation of the IStorage interface and provides methods for managing storage operations. It has a constructor that takes in parameters of type IStorageParams<T> and properties such as params, _itemMap, _createEmbedding, waitForInit, take, upsert, remove, clear, get, list and dispose.

The _createEmbedding property creates an embedding for a given item. The waitForInit property is used to wait for the initialization of the storage. The take method takes a specified number of items based on the search criteria. The upsert method is used to upsert an item into the storage. The remove method removes an item from the storage. The clear method clears all items from the storage. The get method gets an item by its ID. The list method lists all items in the storage, optionally filtered by a predicate. The dispose method is used to dispose of the state.

## ClientState

The `ClientState` class is an implementation of the `IState<State>` interface, representing the client's state. It has a constructor that takes in `IStateParams<State>` as a parameter. The class has several properties and methods to manage the state.

The `params` property holds the parameters used to initialize the state. The `_state` property stores the current state of the client. The `dispatch` property is used to dispatch actions and update the state. The `waitForInit` property is a function that waits for the state to initialize.

The `setState` method sets the state using a provided dispatch function, and returns a promise that resolves to the updated state. The `getState` method retrieves the current state as a promise. The `dispose` method disposes of the state, cleaning up any resources associated with it.

## ClientSession

The `ClientSession` class in this Typescript API Reference is an implementation of the `ISession` interface. It provides various methods and properties for managing communication between a client session and an agent.

The `ClientSession` constructor takes in a parameter of type `ISessionParams` to initialize the session. The class also includes several properties, such as `params`, `_emitSubject`, `emit`, and more, which are used for different functionalities like emitting messages, committing user and system messages, connecting to a connector function, and disposing the session.

The `emit` method allows the user to emit a message, while `execute` executes a message and optionally emits the output. The `commitToolOutput`, `commitUserMessage`, and `commitSystemMessage` methods are used to commit tool output, user messages without answers, and system messages respectively. The `commitFlush` method commits the flush of agent history.

The `connect` method connects the session to a connector function, and `dispose` should be called when the session is no longer needed to properly dispose of it.

## ClientHistory

The `ClientHistory` class in TypeScript represents the history of messages exchanged between a client and an agent. It implements the `IHistory` interface and provides various methods to interact with the message history.

The class has a constructor that takes in `IHistoryParams` as a parameter. It also has properties such as `params`, which holds the parameters for the history, and `_filterCondition`, which is a filter condition used in the `toArrayForAgent` method.

The `push` method allows you to add a new message to the history asynchronously. The `toArrayForRaw` method converts the history into an array of raw messages asynchronously. The `toArrayForAgent` method converts the history into an array of messages specifically for the agent, taking into account a prompt and optional system messages. Finally, the `dispose` method should be called when an agent is disposed to clean up any resources associated with the history.

## ClientAgent

The ClientAgent class in TypeScript represents a client agent that interacts with the system. It implements the IAgent interface and has various properties, methods, and event subjects for handling agent actions. The constructor takes in a set of parameters defined by the IAgentParams interface. The class provides methods for emitting output results, resurrecting the model based on a reason, waiting for output to become available, getting completion messages from the model, committing user and system messages to history, committing tool outputs to the history, and executing incoming messages. The dispose method should be called when the agent is no longer needed.

## BusService

The BusService is an implementation of the IBus interface that provides functionality for event handling and communication between different clients. It uses the loggerService for logging purposes, sessionValidationService to ensure valid sessions, and maintains internal data structures like _eventSourceSet, _eventWildcardMap and getEventSubject for efficient event handling.

The constructor initializes the necessary properties for event handling. The loggerService, sessionValidationService and the internal data structures are set up in this step.

The getEventSubject method returns the event subject associated with a given source.

The subscribe method allows clients to subscribe to events for a specific client and source. It takes in the clientId, source and a callback function to handle the events. It returns an unsubscribe function that can be used to stop receiving events.

The once method is similar to subscribe, but it allows clients to receive only one event for a specific client and source. It also takes in an additional filterFn to specify which event should be received.

The emit method allows clients to send events to a specific client. It takes in the clientId and an event object.

The dispose method is used to clean up event subscriptions for a specific client. It takes in the clientId and stops receiving events for that particular client.

## AgentValidationService

The `AgentValidationService` is a service used for validating agents within an agent swarm. It has a constructor that initializes the service with dependencies such as `loggerService`, `toolValidationService`, `completionValidationService`, and `storageValidationService`. The service also has properties like `_agentMap`, `_agentDepsMap` for internal use.

The service provides methods to get the list of agents, storages used by an agent, and states used by an agent. It also allows adding a new agent to the validation service.

Additionally, it provides memoized functions to check if an agent has registered storage, dependency or state. These functions can be cleared and controlled for efficient caching.

To validate an agent, you can use the `validate` method by providing the agent name and its source.

## AgentSchemaService

The `AgentSchemaService` is a service that manages agent schemas. It has a constructor, `loggerService` and `registry` properties, as well as `register` and `get` methods. The `loggerService` is used for logging, while the `registry` stores registered agent schemas. The `register` method is used to add a new agent schema, and the `get` method retrieves an agent schema by its name.

## AgentPublicService

The `AgentPublicService` is a TypeScript class that implements the `TAgentConnectionService` interface. It is responsible for managing public agent operations, such as creating an agent reference, executing commands on the agent, waiting for output from the agent, committing tool and system messages to the agent, flushing the agent's history, and disposing of an agent.

The class has a constructor that initializes the `loggerService` and `agentConnectionService`. It also provides several asynchronous methods for interacting with the agent, including `createAgentRef`, `execute`, `waitForOutput`, `commitToolOutput`, `commitSystemMessage`, `commitUserMessage`, `commitFlush`, `commitAgentChange`, and `dispose`.

The `createAgentRef` method creates a reference to an agent by specifying the method name, client ID, and agent name. The `execute` method executes a command on the agent by providing input, execution mode, method name, client ID, and agent name. The `waitForOutput` method waits for the agent's output by specifying the method name, client ID, and agent name.

The `commitToolOutput`, `commitSystemMessage`, and `commitUserMessage` methods commit tool output, system messages, and user messages to the agent, respectively. The `commitFlush` method commits a flush of the agent's history. The `commitAgentChange` method commits a change of the agent to prevent the next tool execution from being called. Finally, the `dispose` method disposes of an agent by specifying the method name, client ID, and agent name.

## AgentMetaService

The `AgentMetaService` is a class that provides methods for managing agent meta nodes and converting them to UML format. It has a constructor, properties such as `loggerService`, `agentSchemaService` and `serialize`, as well as methods like `makeAgentNode` and `toUML`. 

The `makeAgentNode` method creates a meta node for the given agent, while `makeAgentNodeCommon` does the same but with an optional `seen` parameter. The `toUML` method converts the meta nodes of a specific agent to UML format, with an optional `withSubtree` parameter.

## AgentConnectionService

The `AgentConnectionService` is a TypeScript class that implements the `IAgent` interface. It is responsible for managing agent connections and provides various methods to interact with the agent.

To use this service, you need to provide the `loggerService`, `busService`, `methodContextService`, `sessionValidationService`, `historyConnectionService`, `storageConnectionService`, `agentSchemaService`, `toolSchemaService`, and `completionSchemaService` as dependencies.

The `getAgent` method retrieves an agent instance by providing a `clientId` and an `agentName`. The `execute` method allows you to execute an input command asynchronously. The `waitForOutput` method waits for the output from the agent. The `commitToolOutput` method commits the tool output asynchronously. The `commitSystemMessage` method commits a system message asynchronously. The `commitUserMessage` method commits a user message without an answer asynchronously. The `commitAgentChange` method commits an agent change to prevent the next tool execution from being called. The `commitFlush` method commits a flush of the agent history. The `dispose` method disposes of the agent connection asynchronously.
