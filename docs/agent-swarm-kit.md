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

To add a new tool to the validation service, you can use the `addTool` function. This function takes two parameters: `toolName`, which is the name of the tool, and `toolSchema`, which is an object representing the schema of the tool.

To validate if a specific tool exists in the validation service, you can use the `validate` function. This function takes two parameters: `toolName`, which is the name of the tool to be validated, and `source`, which represents the source of the tool.

By using these functions, you can effectively manage and validate tools within your agent-swarm system.

## ToolSchemaService

The `ToolSchemaService` is a service that manages tool schemas. It has a constructor, properties such as `loggerService`, `registry`, and `validateShallow`, as well as two methods: `register` and `get`. The `register` method allows you to register a tool with a given key and value, while the `get` method retrieves a tool by its key. The `validateShallow` property is used for validating the state schema.

## SwarmValidationService

The SwarmValidationService is a TypeScript service designed for validating swarms and their associated agents. It utilizes a loggerService for logging purposes, an agentValidationService to validate individual agents, and a swarmMap for storing swarms.

To use this service, you need to create an instance of the SwarmValidationService by calling its constructor. This service provides several methods to interact with swarms and agents.

To add a new swarm, you can use the `addSwarm` method, which takes in the swarm name and its schema as parameters. This method adds the swarm to the internal swarmMap.

To retrieve a list of agents for a specific swarm, you can use the `getAgentList` method, passing in the swarm name as a parameter. This method returns an array of agent names associated with the given swarm.

To retrieve a list of all swarms, you can use the `getSwarmList` method, which returns an array of swarm names.

Lastly, the `validate` method allows you to validate a swarm and its agents. You need to provide the swarm name and a source string as parameters. This method will perform the validation process for the specified swarm.

Overall, SwarmValidationService provides a way to manage and validate swarms and their agents in a TypeScript environment.

## SwarmSchemaService

The SwarmSchemaService is a service that manages swarm schemas. It has a constructor, loggerService property for logging purposes, registry property to store registered schemas, and validateShallow property for shallow validation of swarm schemas. The service provides two methods: register and get.

The `register` method is used to add a new swarm schema by providing the key and value of the swarm schema.

The `get` method retrieves a swarm schema by its name, allowing you to access a specific schema when needed.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It is designed to manage public swarm interactions, allowing users to interact with swarms in a public context. The class provides various methods for navigating, canceling output, waiting for output, getting agent information, and disposing of swarms.

The constructor initializes the loggerService and swarmConnectionService properties. The loggerService is responsible for logging messages, while the swarmConnectionService handles connections to swarms.

The navigationPop method allows users to pop the navigation stack or return a default agent based on the provided methodName, clientId, and swarmName.

The cancelOutput method cancels the await of output by emitting an empty string.

The waitForOutput method waits for output from the swarm based on the provided methodName, clientId, and swarmName.

The getAgentName method retrieves the agent name from the swarm based on the provided methodName, clientId, and swarmName.

The getAgent method retrieves the agent from the swarm based on the provided methodName, clientId, and swarmName.

The setAgentRef method sets the agent reference in the swarm based on the provided methodName, clientId, swarmName, agentName, and agent.

The setAgentName method sets the agent name in the swarm based on the provided agentName, methodName, clientId, and swarmName.

The dispose method disposes of the swarm based on the provided methodName, clientId, and swarmName.

## SwarmMetaService

The SwarmMetaService is a service that handles swarm metadata. It has properties such as loggerService, swarmSchemaService, agentMetaService and serialize. The loggerService is used for logging, swarmSchemaService handles the schema related operations for swarms, agentMetaService handles metadata related to agents and serialize is used for serialization. The makeSwarmNode function creates a swarm node with the given swarm name. The toUML function converts the swarm metadata into UML format.

## SwarmConnectionService

The SwarmConnectionService is a TypeScript class that implements the ISwarm interface and manages connections to a swarm. It has properties for the loggerService, busService, methodContextService, agentConnectionService, and swarmSchemaService. The class provides various methods to interact with the swarm, such as retrieving a swarm instance based on client ID and swarm name, popping the navigation stack or returning a default agent, waiting for output from the swarm, retrieving agent name and agent from the swarm, setting the agent reference and name in the swarm, and disposing of the swarm connection.

## StorageValidationService

The StorageValidationService is a service used for validating storages within the storage swarm. It has a constructor, loggerService property for logging purposes, embeddingValidationService property to validate the storage embeddings, and a private property _storageMap to store the added storages.

To add a new storage, you can use the `addStorage` function by providing a storage name and its schema. This will add the new storage to the validation service.

To validate an existing storage, you can use the `validate` function by providing a storage name and its source. This will initiate the validation process for that specific storage.

## StorageUtils

The `StorageUtils` is a TypeScript class that implements the `TStorage` interface. It provides several methods for interacting with a storage system.

1. The `constructor` is used to initialize the storage utilities.
2. The `take` method allows you to retrieve items from the storage by providing a search query, total count, client ID, agent name, and storage name. It returns a promise that resolves to an array of items matching the specified criteria.
3. The `upsert` method enables you to insert or update an item in the storage. You need to provide the new item, client ID, agent name, and storage name. It returns a promise that resolves when the operation is completed.
4. The `remove` method allows you to delete an item from the storage based on its ID, client ID, agent name, and storage name. It returns a promise that resolves when the item is successfully removed.
5. The `get` method retrieves a specific item from the storage based on its ID, client ID, agent name, and storage name. It returns a promise that resolves to the requested item.
6. The `list` method allows you to retrieve a list of items from the storage, filtering them based on a provided function. You need to specify the client ID, agent name, storage name, and an optional filter function. It returns a promise that resolves to an array of items matching the specified criteria.
7. The `clear` method empties the storage for a specific client, agent, and storage name. It returns a promise that resolves when the storage is cleared.

Overall, `StorageUtils` provides a set of methods to interact with a storage system, allowing you to retrieve, insert, update, delete, and list items in a storage based on various criteria.

## StorageSchemaService

The StorageSchemaService is a service used for managing storage schemas. It has a constructor, loggerService property for logging service messages, registry property to store registered schemas, and validateShallow property for shallow validation of storage schemas. The service provides two main functions: register and get. The `register` function is used to add a new storage schema by providing the key and value of the schema. The `get` function retrieves a storage schema by its key. This service allows for efficient management and retrieval of storage schemas in a TypeScript application.

## StoragePublicService

The StoragePublicService is a service that handles interactions with public storage. It implements the TStorageConnectionService interface and provides methods for managing storage data. The constructor initializes the loggerService and storageConnectionService properties.

The service offers several methods for interacting with storage data:
- `take` retrieves a list of storage data based on a search query and total number of items.
- `upsert` upserts an item in the storage.
- `remove` removes an item from the storage.
- `get` retrieves an item from the storage by its ID.
- `list` retrieves a list of items from the storage, optionally filtered by a predicate function.
- `clear` clears all items from the storage.
- `dispose` disposes of the storage.

Each method takes in parameters such as the method name, client ID, and storage name to identify the specific storage interaction. The methods return promises, allowing for asynchronous execution.

## StorageConnectionService

The StorageConnectionService is a TypeScript class that manages storage connections. It implements the IStorage interface and provides various methods for interacting with storage data. The service takes in dependencies such as loggerService, busService, methodContextService, storageSchemaService, sessionValidationService, embeddingSchemaService, sharedStorageConnectionService, _sharedStorageSet.

The getStorage method retrieves a storage instance based on the client ID and storage name. The take method retrieves a list of storage data based on a search query and total number of items. The upsert method allows for the upsertion of an item in the storage. The remove method removes an item from the storage by its ID. The get method retrieves an item from the storage by its ID. The list method retrieves a list of items from the storage, optionally filtered by a predicate function. The clear method clears all items from the storage. The dispose method is used to dispose of the storage connection.

## StateUtils

The `StateUtils` class is a utility for managing state in the agent swarm. It provides methods to retrieve, set, and clear state for a given client and state name. The `getState` method allows you to retrieve the state for a specific client and state name, while the `setState` method sets the state for a given client and state name, either by providing the new value directly or as a function that takes the previous state and returns the updated value. The `clearState` method sets the state back to its initial value. All methods return a Promise, allowing you to handle asynchronous operations.

## StateSchemaService

The `StateSchemaService` is a service that manages state schemas. It has a constructor, properties such as `loggerService`, `registry` and `validateShallow`, as well as two methods: `register` and `get`. The `register` method is used to add a new state schema by providing a key and the `IStateSchema<any>` value. The `get` method retrieves a state schema by its key. This service is useful for managing and accessing state schemas in a structured manner.

## StatePublicService

The `StatePublicService` class is an implementation of the `TStateConnectionService` interface. It has a constructor, as well as properties `loggerService` and `stateConnectionService`. The class provides methods to set, clear, get and dispose state.

The `setState` method takes a dispatch function, which is used to set the state asynchronously. It also accepts a method name, client ID and state name as parameters.

The `clearState` method sets the state to its initial value, using the provided method name, client ID and state name.

The `getState` method retrieves the current state, using the provided method name, client ID and state name.

The `dispose` method disposes the state, using the provided method name, client ID and state name.

Overall, the `StatePublicService` class provides a way to interact with state data, allowing for setting, clearing, getting and disposing of state information.

## StateConnectionService

The `StateConnectionService` is a TypeScript class that manages state connections. It implements the `IState<T>` interface and provides several methods to interact with the state. The class has several properties such as `loggerService`, `busService`, `methodContextService`, `stateSchemaService`, `sessionValidationService`, and `sharedStateConnectionService` which are used for various functionalities.

The `constructor` is used to initialize the service.

The `getStateRef` is a memoized function that returns a state reference based on the provided `clientId` and `stateName`.

The `setState` method sets the state by dispatching a function that takes the previous state as an argument and returns a promise that resolves to the updated state.

The `clearState` method sets the state to its initial value.

The `getState` method retrieves the current state as a promise.

The `dispose` method disposes the state connection.

Overall, `StateConnectionService` provides a way to manage state connections and interact with the state by setting, clearing, getting, and disposing the state.

## SharedStorageUtils

The `SharedStorageUtils` is a TypeScript class that implements the `TSharedStorage` interface. It provides various methods to interact with a storage system. The class has the following methods:

1. `take` - This method takes items from the storage. It accepts a payload object containing search criteria, total number of items to retrieve, storage name, and an optional score. It returns a Promise of the requested items as an array.
2. `upsert` - This method upserts an item into the storage. It accepts an item object and a storage name, and returns a Promise that resolves when the operation is complete.
3. `remove` - This method removes an item from the storage. It accepts a unique item ID and a storage name, and returns a Promise that resolves when the operation is complete.
4. `get` - This method gets an item from the storage. It accepts a unique item ID and a storage name, and returns a Promise that resolves with the requested item.
5. `list` - This method lists items from the storage. It accepts a storage name and an optional filter function. It returns a Promise of the filtered items as an array.
6. `clear` - This method clears the storage. It accepts a storage name, and returns a Promise that resolves when the operation is complete.

These methods provide a way to interact with storage systems in TypeScript, allowing developers to easily manage and manipulate data within the storage.

## SharedStoragePublicService

The SharedStoragePublicService is a TypeScript class that provides methods for managing public storage interactions. It implements the TSharedStorageConnectionService interface and includes properties such as loggerService, sharedStorageConnectionService.

The constructor is used to initialize the service. 

The take method retrieves a list of storage data based on a search query and total number of items. It returns a Promise that resolves to an array of IStorageData objects.

The upsert method is used to insert or update an item in the storage. It takes an IStorageData object, the method name, and storage name as parameters. It returns a Promise that resolves when the operation is complete.

The remove method removes an item from the storage by its ID. It takes a StorageId, the method name, and storage name as parameters. It returns a Promise that resolves when the operation is complete.

The get method retrieves an item from the storage by its ID. It takes a StorageId, the method name, and storage name as parameters. It returns a Promise that resolves to an IStorageData object.

The list method retrieves a list of items from the storage, optionally filtered by a predicate function. It takes the method name, storage name, and an optional filter function as parameters. The filter function can be used to specify conditions for the items to be included in the list. It returns a Promise that resolves to an array of IStorageData objects.

The clear method clears all items from the storage. It takes the method name and storage name as parameters. It returns a Promise that resolves when the operation is complete.

## SharedStorageConnectionService

The SharedStorageConnectionService is a TypeScript class that manages storage connections. It has a constructor to initialize its dependencies and several properties for interacting with other services. The `getStorage` method retrieves a storage instance based on the client ID and storage name. The `take` method retrieves a list of storage data based on a search query and total number of items. The `upsert` method upserts an item in the storage. The `remove` method removes an item from the storage. The `get` method retrieves an item from the storage by its ID. The `list` method retrieves a list of items from the storage, optionally filtered by a predicate function. Finally, the `clear` method clears all items from the storage.

## SharedStateUtils

The `SharedStateUtils` is a utility class designed for managing state within the agent swarm. It provides methods to retrieve, set, and clear state for a given client and state name. The class utilizes promises to handle asynchronous operations.

The `constructor` is used to initialize the utility class.

The `getState` method retrieves the state for a specific client and state name. It returns the state as a promise, allowing for asynchronous retrieval.

The `setState` method sets the state for a given client and state name. It accepts either the new state value directly or a function that takes the previous shared state and returns a promise resolving to the new state. This allows for asynchronous updates to the state.

The `clearState` method sets the state back to its initial value for a given client and state name. It returns the cleared state as a promise, enabling asynchronous operations.

## SharedStatePublicService

The SharedStatePublicService is an implementation of the TSharedStateConnectionService. It has a constructor, and two properties: loggerService and sharedStateConnectionService. The setState function sets the state using a provided dispatch function, while clearState sets the state to its initial value. The getState function retrieves the current state. All of these functions require a methodName and stateName as parameters.

## SharedStateConnectionService

The `SharedStateConnectionService` is a TypeScript class that provides functionality for managing shared state connections. It implements the `IState<T>` interface. This service utilizes several dependencies such as `loggerService`, `busService`, `methodContextService`, and `stateSchemaService`.

The constructor of this class initializes these dependencies. The `getStateRef` property is a memoized function that returns a reference to the shared state. The `setState` function allows you to set the state by providing a dispatch function that takes the previous state and returns a Promise for the updated state. The `clearState` function sets the state to its initial value, and the `getState` function returns a Promise that resolves with the current state.

## SessionValidationService

The `SessionValidationService` is a service in Typescript that manages and validates sessions. It provides methods to add, remove and get information about sessions, agents, history, storage and states. The service also has properties to store session information and a logger service.

To use the `SessionValidationService`, you can create an instance of the service and call its methods to perform operations on sessions. For example, you can use the `addSession` method to add a new session, `getSessionList` to get the list of all session IDs, and `validate` to check if a session exists.

The service also provides methods to add and remove agent, history, storage and state usage from a session. These methods allow you to keep track of the usage of different components in a session.

The `dispose` method is used to dispose a session validation cache, which helps in managing memory and resources efficiently.

Overall, the `SessionValidationService` provides a way to manage and validate sessions, track usage of different components in a session and dispose resources efficiently.

## SessionPublicService

The `SessionPublicService` is a TypeScript class that provides methods for managing public session interactions. It implements the `TSessionConnectionService` interface. The class has several properties, including `loggerService` and `sessionConnectionService`, which are used for logging and session connection management respectively.

The class provides various methods for interacting with the session, such as emitting messages (`emit()`), executing commands (`execute()`), running completion stateless (`run()`), connecting to the session (`connect()`), committing tool output, system messages, assistant messages, user messages (`commitToolOutput()`, `commitSystemMessage()`, `commitAssistantMessage()`, and `commitUserMessage()`), committing a flush of agent history (`commitFlush()`), preventing the next tool from being executed (`commitStopTools()`), and disposing of the session (`dispose()`).

These methods allow for interaction with the session, sending messages and commands, committing different types of messages to the session, and managing the session's lifecycle.

## SessionConnectionService

The `SessionConnectionService` is a TypeScript class that manages session connections. It has a constructor which takes in dependencies such as `loggerService`, `busService`, `methodContextService`, `swarmConnectionService`, and `swarmSchemaService`. 

The class provides several methods for interacting with sessions. `getSession` retrieves a memoized session based on the clientId and swarmName. `emit` allows you to emit a message to the session. `execute` executes a command in the session. `run` runs completion stateless in the session. `connect` connects to a session using the provided connector.

The class also provides methods for committing different types of messages to the session, such as tool output (`commitToolOutput`), system messages (`commitSystemMessage`), assistant messages (`commitAssistantMessage`), user messages without answer (`commitUserMessage`), and flushing the session (`commitFlush`). There are also methods for stopping tools (`commitStopTools`) and disposing of the session connection service (`dispose`).

## SchemaUtils

The `SchemaUtils` is a utility class that provides functions for performing operations related to schemas. It has a constructor that doesn't take any arguments.

The class has three properties: `writeSessionMemory`, `readSessionMemory`, and `serialize`. 

The `writeSessionMemory` function allows you to write a value into the session memory for a specific client. It takes two arguments: `clientId` (a string representing the client's ID) and `value` (the data you want to write).

The `readSessionMemory` function enables you to read a value from the session memory for a specific client. It takes one argument: `clientId` (a string representing the client's ID).

The `serialize` function is used to serialize an object or an array of objects into a formatted string. It takes one argument: `data` (the object or array of objects you want to serialize).

## MemorySchemaService

The `MemorySchemaService` is a service that allows you to manage memory schemas for different sessions. It provides methods to write, read and dispose of memory map entries for a given client ID. The `loggerService` and `memoryMap` properties are used internally for logging and managing the memory map respectively. The `writeValue` method allows you to write a value to the memory map for a specific client ID, while `readValue` retrieves a value from the memory map for a given client ID. The `dispose` method is used to dispose of the memory map entry for a particular client ID.

## LoggerUtils

The `LoggerUtils` is a TypeScript class that implements `ILoggerAdapter` and `ILoggerControl`. It has a constructor, several properties and methods for logging different levels of information, as well as a dispose method. The `LoggerFactory` property is used to create logger instances, `LoggerCallbacks` holds callback functions for different logger events, and `getLogger` is used to get a logger instance. The `useCommonAdapter`, `useClientCallbacks` and `useClientAdapter` methods are used to configure the logger with different adapters and callbacks. The `logClient`, `infoClient` and `debugClient` methods are used to log information at different levels, and the `log`, `debug` and `info` methods are aliases for the respective client-level logging methods. The `dispose` method is used to clean up resources when a logger instance is no longer needed.

## LoggerService

The LoggerService is a class that implements the ILogger interface, providing methods to log and debug messages. It has a constructor, several properties such as methodContextService and executionContextService, and methods like log, debug, info, and setLogger. The log method logs messages using the current logger, while debug and info log debug messages and info messages respectively. The setLogger method allows setting a new logger for the service.

## LoggerInstance

The `LoggerInstance` class is an implementation of the `ILoggerInstance` interface. It is constructed with a `clientId` and an optional set of callbacks defined by the `ILoggerInstanceCallbacks` interface. The `clientId` is a unique identifier for the client using this logger instance.

The `callbacks` property allows for customization of the logger's behavior through callback functions.

The `__@LOGGER_INSTANCE_WAIT_FOR_INIT@1961` property is an internal variable used for waiting for the logger instance to initialize.

The `waitForInit` method returns a Promise that resolves when the logger instance has finished initializing.

The `log`, `debug`, and `info` methods are used to log messages with different levels of severity. They each take a `topic` parameter and optional additional arguments to be included in the log message.

The `dispose` method is used to clean up any resources associated with the logger instance.

## HistoryUtils

The `HistoryUtils` class provides functionality for managing and interacting with the history of messages in a system. It implements `IHistoryAdapter` and `IHistoryControl`, which allow for customization and control over the history. The class has a constructor, several properties and methods for interacting with the history.

The `HistoryFactory` and `HistoryCallbacks` properties are used for internal operations within the class. The `getHistory` method is used to retrieve the history of messages. The `useHistoryAdapter` method allows for the use of a custom history adapter, enabling users to implement their own history management system. The `useHistoryCallbacks` method enables the use of history lifecycle callbacks, which can be used to perform actions at specific points in the history's lifecycle.

The `push` method is used to add a new message to the history, and returns a promise that resolves when the message has been successfully added. The `dispose` method is used to dispose of the history for a specific client and agent, effectively clearing the history for that combination.

The `iterate` method allows for iterating over the history messages, returning an `AsyncIterableIterator` that can be used to access each message in the history asynchronously.

## HistoryPublicService

The `HistoryPublicService` is a TypeScript class that implements the `THistoryConnectionService` interface. This service is responsible for handling public operations related to history management. It provides several methods for pushing messages to the history, converting history data into arrays for specific agents or raw format, and disposing of the history. The class also has properties for `loggerService`, which is used to log messages, and `historyConnectionService`, which handles the connection to the history service.

## HistoryInstance

The `HistoryInstance` class in TypeScript represents a History Instance and implements the `IHistoryInstance` interface. It has a constructor that takes in `clientId` and `callbacks`, which are used to initialize the instance. The class also has properties such as `clientId`, `callbacks`, and private properties like `_array` and `__@HISTORY_INSTANCE_WAIT_FOR_INIT@439`.

The `waitForInit` method is used to wait for the history to initialize, while `iterate` allows you to iterate over the history messages for a given agent. The `push` method is used to add a new message to the history for a given agent, and `dispose` is used to dispose of the history for a given agent.

Overall, the `HistoryInstance` class provides functionality to work with a history instance, including initializing it, iterating over messages, adding new messages, and disposing of the history.

## HistoryConnectionService

The `HistoryConnectionService` is a TypeScript class that implements the `IHistory` interface and provides functionality for managing history connections. It has a constructor that initializes the loggerService, busService, methodContextService, and sessionValidationService.

The `getHistory` method retrieves the history for a specific client and agent. The `push` method allows you to push a message to the history. The `toArrayForAgent` method converts the history to an array format for agents. The `toArrayForRaw` method converts the history to a raw array format. The `dispose` method disposes of the history connection service.

Overall, this class provides a way to manage and interact with history connections in a TypeScript application.

## EmbeddingValidationService

The EmbeddingValidationService is a tool used within the agent-swarm to validate embeddings. It has a constructor and two main properties: loggerService, which is used for logging messages and events during the validation process, and _embeddingMap, which is a map that stores the embeddings for validation.

To add a new embedding, you can use the `addEmbedding` function, which takes in the embedding's name and its schema as parameters. This function adds the embedding to the validation service for future use.

To validate if an embedding exists in the validation service, you can use the `validate` function. This function takes in the embedding's name and its source as parameters. It checks if the specified embedding exists in the validation service and returns a result accordingly.

Overall, the EmbeddingValidationService provides a way to manage and validate embeddings within the agent-swarm system.

## EmbeddingSchemaService

The EmbeddingSchemaService is a service used for managing embedding schemas. It has a constructor, loggerService, registry, and validateShallow properties. The `register` function is used to register an embedding with a given key and value, while the `get` function retrieves an embedding by its key. This service provides a way to manage and access embedding schemas in your application.

## DocService

The DocService is a TypeScript class that provides functionality for generating documentation for swarms and agents. It utilizes several services for validation, schema generation, and metadata retrieval. The constructor initializes these services, and the class provides methods for writing documentation for swarm and agent schemas, as well as a method to dump the documentation for all swarms and agents. The dumpDocs method takes an optional directory name parameter and returns a Promise that resolves once the documentation has been dumped.

## CompletionValidationService

The CompletionValidationService is a TypeScript service designed for validating completion names. It has a constructor that initializes the service, and two properties: loggerService for logging purposes, and _completionSet to store the set of completion names.

To add a new completion name to the set, you can use the addCompletion function. This function takes a string parameter representing the completion name.

To validate if a given completion name exists in the set, you can use the validate function. This function takes two parameters: completionName, a string representing the name to be validated, and source, a string representing the origin of the name.

Overall, this service provides a way to manage and validate completion names in your TypeScript application.

## CompletionSchemaService

The `CompletionSchemaService` is a service that manages completion schemas. It has a constructor, properties like `loggerService`, `registry`, and `validateShallow`, as well as two methods: `register` and `get`. The `register` method is used to add a new completion schema by providing a key and the corresponding `ICompletionSchema` object. The `get` method retrieves a completion schema by its key. This service allows for efficient management and retrieval of completion schemas.

## ClientSwarm

The ClientSwarm class is an implementation of the ISwarm interface and manages agents within a swarm. It has properties such as `params`, `_agentChangedSubject`, `_activeAgent`, and `_navigationStack`. The class provides methods like `constructor`, `navigationPop`, `cancelOutput`, `waitForOutput`, `getAgentName`, `getAgent`, `setAgentRef`, and `setAgentName`.

The constructor initializes the ClientSwarm instance with a set of parameters defined by the ISwarmParams interface. The `navigationPop` method pops the navigation stack or returns the default agent if the stack is empty. The `cancelOutput` method cancels the await of output by emitting an empty string. The `waitForOutput` method waits for output from the active agent. The `getAgentName` method retrieves the name of the active agent. The `getAgent` method retrieves the active agent. The `setAgentRef` method sets the reference of an agent in the swarm. The `setAgentName` method sets the active agent by name.

## ClientStorage

The ClientStorage class is an implementation of the IStorage interface, designed to manage storage operations. It has a constructor that takes in parameters defined by the IStorageParams interface for a generic type T. The class has several properties and methods for performing various storage operations.

The _itemMap property is used to store items in the storage. The _createEmbedding method creates an embedding for a given item, which is used to generate embeddings for search purposes. The waitForInit property is a function that waits for the initialization of the storage.

The take method allows you to retrieve a specified number of items based on search criteria. The upsert method is used to insert or update an item in the storage. The remove method removes an item from the storage based on its ID. The clear method clears all items from the storage. The get method retrieves an item from the storage by its ID. The list method lists all items in the storage, optionally filtered by a predicate. Finally, the dispose method is used to dispose of the state.

## ClientState

The `ClientState` class in TypeScript represents the client's state and implements the `IState<State>` interface. It has a constructor that takes in `IStateParams<State>` as a parameter. The class has several properties and methods to manage the state.

The `params` property holds the parameters used to initialize the state. The `_state` property stores the current state. The `dispatch` property is used to dispatch actions. The `waitForInit` property waits for the state to initialize.

The `setState` method sets the state using a provided dispatch function and returns a promise that resolves to the updated state. The `clearState` method sets the state to its initial value and returns a promise that resolves to the cleared state. The `getState` method retrieves the current state and returns a promise that resolves to the current state. The `dispose` method disposes of the state and returns a promise that resolves to `void`.

## ClientSession

The ClientSession class is an implementation of the ISession interface. It has a constructor that takes in parameters of type ISessionParams. The class has several properties and methods for emitting messages, executing messages with optional emission and execution modes, running completion stateless, committing tool output and user messages without answers, flushing agent history, stopping the next tool execution, committing system and assistant messages. The class also has methods for connecting the session to a connector function and disposing of the session.

## ClientHistory

The `ClientHistory` class in TypeScript represents the history of messages exchanged between a client and an agent. It implements the `IHistory` interface and provides various methods to interact with the message history.

The class has a constructor that takes in `IHistoryParams` as a parameter. It also has properties such as `params`, which holds the parameters for the history, and `_filterCondition`, which is a filter condition used in the `toArrayForAgent` method.

The `push` method allows you to add a new message to the history asynchronously. The `toArrayForRaw` method converts the history into an array of raw messages asynchronously. The `toArrayForAgent` method converts the history into an array of messages specifically for the agent, taking into account a prompt and optional system messages. Lastly, the `dispose` method should be called when an agent is disposed to clean up any resources associated with the history.

## ClientAgent

The `ClientAgent` class implements the `IAgent` interface and represents a client agent that interacts with the system. It has a constructor that takes in `IAgentParams` as a parameter. The class has several properties and methods for handling agent interactions, such as emitting output results after validation, resurrecting the model based on a given reason, waiting for output to be available, getting completion messages from the model, committing user and system messages to history, and executing incoming messages. The `dispose` method should be called when the agent is disposed.

## BusService

The BusService is an implementation of the IBus interface, which provides functionality for event handling and communication between different components in a system. It uses the loggerService for logging purposes, sessionValidationService to ensure valid sessions, and maintains internal data structures like _eventSourceSet, _eventWildcardMap and getEventSubject for efficient event handling.

The constructor is used to initialize the BusService object.

The loggerService property is used for logging messages within the BusService.
The sessionValidationService property is used to validate sessions for event handling.
The _eventSourceSet is a set that stores all the event sources.
The _eventWildcardMap is a map that maps event sources to their corresponding wildcard subjects.
The getEventSubject function returns the event subject based on the source and wildcard.
The subscribe function allows you to subscribe to events for a specific client and source. It takes in the clientId, source and a callback function as parameters. It returns an unsubscribe function that can be used to stop receiving events.
The once function is similar to subscribe, but it only triggers the callback function once for a specific event.
The emit function allows you to send an event for a specific client. It takes in the clientId and event as parameters, and returns a Promise that resolves when the event is successfully emitted.
The dispose function allows you to clean up event subscriptions for a specific client. It takes in the clientId as a parameter and clears all subscriptions for that client.

## AgentValidationService

The `AgentValidationService` is a service used for validating agents within an agent swarm. It has a constructor that takes no arguments and several properties including `loggerService`, `toolValidationService`, `completionValidationService`, and `storageValidationService`. The service also has several methods such as `getAgentList`, `getStorageList`, and `getStateList` for retrieving agent lists, storage lists, and state lists respectively.

To add a new agent to the validation service, you can use the `addAgent` method by providing the agent name and its schema. The service also provides methods for checking if an agent has registered storage, dependency or state using `hasStorage`, `hasDependency` and `hasState`. Finally, you can validate an agent by its name and source using the `validate` method.

## AgentSchemaService

The `AgentSchemaService` is a service used for managing agent schemas. It has a constructor, properties such as `loggerService`, `registry`, and `validateShallow` for logging, registry management and validation of agent schemas respectively. The `register` function is used to register a new agent schema by providing the key and value of the schema. The `get` function retrieves an agent schema by its name. This service allows for efficient management and retrieval of agent schemas.

## AgentPublicService

The `AgentPublicService` is a Typescript class that implements the `TAgentConnectionService` interface. It is responsible for managing public operations related to agents. The class has a constructor, several properties and methods.

The `loggerService` property is an instance of a logger service, which can be used to log messages. The `agentConnectionService` property is an instance of the `TAgentConnectionService` interface, which provides methods for connecting to agents.

The `createAgentRef` method creates a reference to an agent by specifying the method name, client ID and agent name. It returns a `ClientAgent` object that represents the agent.

The `execute` method executes a command on the agent by specifying the input, execution mode (synchronous or asynchronous), method name, client ID and agent name. It returns a promise that resolves when the command is executed.

The `run` method runs the completion stateless by specifying the input, method name, client ID and agent name. It returns a promise that resolves with the output of the command.

The `waitForOutput` method waits for the agent's output by specifying the method name, client ID and agent name. It returns a promise that resolves with the output of the agent.

The `commitToolOutput` method commits tool output to the agent by specifying the tool ID, content and other parameters. It returns a promise that resolves when the output is committed.

The `commitSystemMessage` method commits a system message to the agent by specifying the message and other parameters. It returns a promise that resolves when the message is committed.

The `commitAssistantMessage` method commits an assistant message to the agent history by specifying the message and other parameters. It returns a promise that resolves when the message is committed.

The `commitUserMessage` method commits user message to the agent without answer by specifying the message and other parameters. It returns a promise that resolves when the message is committed.

The `commitFlush` method commits flush of agent history by specifying the method name, client ID and agent name. It returns a promise that resolves when the flush is committed.

The `commitAgentChange` method commits change of agent to prevent the next tool execution from being called by specifying the method name, client ID and agent name. It returns a promise that resolves when the change is committed.

The `commitStopTools` method prevents the next tool from being executed by specifying the method name, client ID and agent name. It returns a promise that resolves when the prevention is committed.

The `dispose` method disposes of the agent by specifying the method name, client ID and agent name. It returns a promise that resolves when the agent is disposed.

## AgentMetaService

The `AgentMetaService` is a service class that manages agent meta nodes and converts them to UML format. It has a constructor, properties such as `loggerService`, `agentSchemaService` and `serialize`, as well as methods like `makeAgentNode` and `toUML`.

The `makeAgentNode` method creates a meta node for the given agent, while `makeAgentNodeCommon` does the same but with an optional `seen` parameter. The `toUML` method converts the meta nodes of a specific agent to UML format, with an optional `withSubtree` parameter.

## AgentConnectionService

The `AgentConnectionService` is a TypeScript class that manages agent connections and provides methods for executing commands, waiting for output, committing messages and disposing of the agent connection. It implements the `IAgent` interface and has several properties such as `loggerService`, `busService`, and others that are used for various functionalities.

The `getAgent` method retrieves an agent instance based on the `clientId` and `agentName`. The `execute` method executes an input command and returns a promise. The `run` method runs the completion stateless. The `waitForOutput` method waits for the output from the agent. The `commitToolOutput`, `commitSystemMessage`, `commitAssistantMessage`, and `commitUserMessage` methods commit the respective messages. The `commitAgentChange`, `commitStopTools`, and `commitFlush` methods commit changes to prevent tool execution, flush the agent history, and stop tools respectively. The `dispose` method disposes of the agent connection.
