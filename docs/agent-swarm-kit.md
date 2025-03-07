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

The `ToolValidationService` is a service designed for validating tools within an agent-swarm system. It provides a way to add new tools and validate the existence of a tool. The service utilizes `loggerService` for logging purposes and maintains an internal map of tools, `_toolMap`, to store and manage the tools.

To add a new tool, you can use the `addTool` function. This function takes two parameters: `toolName`, which is the name of the tool, and `toolSchema`, which is an object representing the schema of the tool.

To validate if a tool exists in the validation service, you can use the `validate` function. This function takes two parameters: `toolName`, which is the name of the tool to be validated, and `source`, which represents the source of the tool.

By using these functions, you can effectively manage and validate tools within the agent-swarm system.

## ToolSchemaService

The `ToolSchemaService` is a service that manages tool schemas. It has a constructor, properties such as `loggerService`, `registry`, and `validateShallow`. The `loggerService` is used for logging, the `registry` stores registered tools, and `validateShallow` is a validation function for state schema.

The `register` function is used to register a tool with the given key and value. The `get` function retrieves a tool by its key.

## SwarmValidationService

The SwarmValidationService is a service that allows for the validation of swarms and their agents. It has a constructor, properties such as loggerService and agentValidationService for logging and handling agent validation, a private property _swarmMap for storing swarms, and methods like addSwarm for adding new swarms, getAgentList for retrieving the list of agents in a swarm, getSwarmList for retrieving the list of swarms, and validate for validating a given swarm and its agents.

## SwarmSchemaService

The SwarmSchemaService is a service used for managing swarm schemas. It has a constructor, properties such as loggerService, registry, and validateShallow. The loggerService is used for logging, registry stores swarm schemas, and validateShallow is a validation function for swarm schema. The service also has two methods: register and get. The `register` method is used to add a new swarm schema by providing the key and value. The `get` method retrieves a swarm schema by its name.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It is designed to manage public swarm interactions, allowing users to interact with swarms in a public context. The class provides various methods to perform actions such as popping the navigation stack, canceling output awaits, waiting for swarm outputs, getting agent names and agents from the swarm, setting agent references and names in the swarm, and disposing of a swarm. These methods are asynchronous and return promises for their respective actions.

## SwarmMetaService

The SwarmMetaService is a service that handles swarm metadata. It has properties such as loggerService, swarmSchemaService, agentMetaService and serialize. The loggerService is used for logging, swarmSchemaService handles the schema related operations for swarms, agentMetaService handles metadata related operations for agents and serialize is used to serialize data.

The constructor is used to initialize the service. The makeSwarmNode function creates a swarm node with the given swarm name. The toUML function is used to convert the swarm metadata into UML format.

## SwarmConnectionService

The SwarmConnectionService is a TypeScript class that implements the ISwarm interface and provides functionality for managing swarm connections. It has a constructor that initializes the loggerService, busService, methodContextService, agentConnectionService, and swarmSchemaService properties.

The service provides several methods for interacting with swarms. The getSwarm method retrieves a swarm instance based on the client ID and swarm name. The navigationPop method pops the navigation stack or returns a default agent. The cancelOutput method cancels the await of output by emitting an empty string. The waitForOutput method waits for output from the swarm. The getAgentName method retrieves the agent name from the swarm. The getAgent method retrieves the agent from the swarm. The setAgentRef method sets the agent reference in the swarm. The setAgentName method sets the agent name in the swarm. Finally, the dispose method disposes of the swarm connection.

## StorageValidationService

The StorageValidationService is a service designed to validate storages within the storage swarm. It provides a way to add new storages, as well as validate existing ones by their name and source. The service also includes a loggerService for logging events and an embeddingValidationService to handle validation of embedded storages. The storage mappings are stored in the _storageMap property.

To add a new storage, you can use the `addStorage` function by providing a storage name and its schema. This will add the new storage to the validation service.

To validate an existing storage, you can use the `validate` function by providing the storage name and its source. This will initiate the validation process for that specific storage.

## StorageUtils

The `StorageUtils` class is an implementation of the `TStorage` interface, which provides various methods to interact with a storage system. It allows you to take, upsert, remove, get, list, and clear items from the storage.

1. `constructor()`: Initializes an instance of the `StorageUtils` class.
2. `take()`: Retrieves items from the storage. It takes a payload object containing search criteria, total count, client ID, agent name, and storage name. It returns a promise that resolves to an array of items matching the specified criteria.
3. `upsert()`: Upserts an item into the storage. It takes a payload object containing the item to be upserted, client ID, agent name, and storage name. It returns a promise that resolves when the item is successfully upserted.
4. `remove()`: Removes an item from the storage. It takes a payload object containing the item ID, client ID, agent name, and storage name. It returns a promise that resolves when the item is successfully removed.
5. `get()`: Retrieves a specific item from the storage. It takes a payload object containing the item ID, client ID, agent name, and storage name. It returns a promise that resolves to the item matching the specified ID.
6. `list()`: Lists items from the storage. It takes a payload object containing client ID, agent name, storage name, and an optional filter function. It returns a promise that resolves to an array of items matching the specified criteria.
7. `clear()`: Clears the entire storage. It takes a payload object containing client ID, agent name, and storage name. It returns a promise that resolves when the storage is successfully cleared.

These methods provide a convenient way to interact with various storage systems, allowing you to perform common operations like retrieving, inserting, updating, and deleting data.

## StorageSchemaService

The StorageSchemaService is a service used for managing storage schemas. It has a constructor, properties such as loggerService, registry, and validateShallow. The loggerService is used for logging, registry stores the registered schemas, and validateShallow is a validation function for storage schema. The service provides two methods: register and get. 

The `register` method is used to register a new storage schema by providing the key and value of the schema. The `get` method retrieves a storage schema by its key. This service allows for efficient management and retrieval of storage schemas in a TypeScript application.

## StoragePublicService

The `StoragePublicService` is a TypeScript class that implements the `TStorageConnectionService` interface. It is responsible for managing interactions with public storage services. The class has a constructor, properties such as `loggerService` and `storageConnectionService`, as well as several methods for interacting with the storage.

The `take` method retrieves a list of storage data based on a search query and total number of items. It returns a promise that resolves to an array of `IStorageData` objects.

The `upsert` method upserts an item into the storage. It takes an `IStorageData` object, along with the method name, client ID, and storage name as parameters. It returns a promise that resolves when the operation is complete.

The `remove` method removes an item from the storage based on its ID. It takes the item's `StorageId`, along with the method name, client ID, and storage name as parameters. It returns a promise that resolves when the operation is complete.

The `get` method retrieves an item from the storage by its ID. It takes the item's `StorageId`, along with the method name, client ID, and storage name as parameters. It returns a promise that resolves to the retrieved `IStorageData` object.

The `list` method retrieves a list of items from the storage, optionally filtered by a predicate function. It takes the method name, client ID, storage name, and an optional filter function as parameters. The filter function can be used to specify a custom condition for filtering the items. It returns a promise that resolves to an array of `IStorageData` objects.

The `clear` method clears all items from the storage. It takes the method name, client ID, and storage name as parameters. It returns a promise that resolves when the operation is complete.

The `dispose` method disposes of the storage. It takes the method name, client ID, and storage name as parameters. It returns a promise that resolves when the storage is successfully disposed.

## StorageConnectionService

The StorageConnectionService is a TypeScript class that manages storage connections. It has a constructor to initialize dependencies and properties such as loggerService, busService, methodContextService, storageSchemaService, sessionValidationService, embeddingSchemaService, sharedStorageConnectionService, _sharedStorageSet. The service provides methods to retrieve, insert, update, remove and list items from the storage. It also allows clearing all items and disposing of the storage connection.

## StateUtils

The `StateUtils` class is a utility for managing state in the agent swarm. It provides methods to retrieve, set, and clear state for a given client and state name. The `getState` method allows you to retrieve the state for a specific client and state name, while the `setState` method sets a new state value for the given client and state name. The `clearState` method sets the state back to its initial value. All methods return a promise, allowing you to handle asynchronous operations.

## StateSchemaService

The `StateSchemaService` is a service used for managing state schemas. It has a constructor, properties such as `loggerService`, `registry` and `validateShallow`, as well as two methods: `register` and `get`. 

The `register` method is used to register a new state schema by providing the key and value of the schema. 

The `get` method is used to retrieve a state schema by its key.

## StatePublicService

The `StatePublicService` is an implementation of the `TStateConnectionService` interface. It has a constructor, as well as properties `loggerService` and `stateConnectionService`. 

The `setState` function sets the state using a provided dispatch function. It returns a promise with the updated state value.

The `clearState` function sets the state to its initial value. It also returns a promise with the updated state value.

The `getState` function retrieves the current state. It returns a promise with the current state value.

The `dispose` function disposes the state. It returns a promise with no value (void).

These functions are used with specific method names, client IDs, and state names to interact with the state management system.

## StateConnectionService

The `StateConnectionService` is a TypeScript class that manages state connections. It has a constructor and several properties including `loggerService`, `busService`, `methodContextService`, `stateSchemaService`, `sessionValidationService`, and `sharedStateConnectionService`. The class also has several methods: `getStateRef`, `setState`, `clearState`, `getState`, and `dispose`.

The `getStateRef` method is a memoized function that returns a state reference based on the provided `clientId` and `stateName`.

The `setState` method sets the state by dispatching a function that takes the previous state as an argument and returns a promise that resolves to the updated state.

The `clearState` method sets the state to its initial value.

The `getState` method retrieves the current state as a promise.

The `dispose` method disposes the state connection.

## SharedStorageUtils

The `SharedStorageUtils` is a TypeScript class that implements the `TSharedStorage` interface. It provides various methods to interact with a storage system.

1. The `constructor` is used to initialize the class.
2. The `take` method allows you to retrieve items from the storage by specifying a search query, total number of items to retrieve, storage name, and an optional score. It returns a Promise of the specified type `T[]`.
3. The `upsert` method is used to upsert (update or insert) an item in the storage. It takes an item of type `T` and the storage name as parameters, returning a Promise of `void`.
4. The `remove` method allows you to remove an item from the storage by providing its ID and the storage name. It returns a Promise of `void`.
5. The `get` method retrieves a specific item from the storage by providing its ID and the storage name. It returns a Promise of type `T`.
6. The `list` method lists items from the storage based on a specified storage name. You can also provide an optional filter function to narrow down the results. It returns a Promise of type `T[]`.
7. The `clear` method clears the specified storage, removing all items. It returns a Promise of `void`.

These methods provide a way to interact with storage systems in TypeScript, allowing you to perform various operations such as retrieving, updating, inserting, removing, and listing items.

## SharedStoragePublicService

The SharedStoragePublicService is a TypeScript class that provides functionality for managing public storage interactions. It implements the TSharedStorageConnectionService interface and includes a constructor, properties, and several methods for interacting with storage data.

The loggerService and sharedStorageConnectionService properties are used for logging and connecting to the shared storage, respectively.

The take method retrieves a list of storage data based on a search query and total number of items. It returns a Promise that resolves to an array of IStorageData objects.

The upsert method allows you to insert or update an item in the storage. It takes an IStorageData object, the method name, and storage name as parameters, and returns a Promise that resolves when the operation is complete.

The remove method removes an item from the storage based on its ID. It takes a StorageId, the method name, and storage name as parameters, and returns a Promise that resolves when the operation is complete.

The get method retrieves an item from the storage by its ID. It takes a StorageId, the method name, and storage name as parameters, and returns a Promise that resolves to an IStorageData object.

The list method retrieves a list of items from the storage, optionally filtered by a predicate function. It takes the method name, storage name, and an optional filter function as parameters. The filter function can be used to specify conditions for the items you want to retrieve. It returns a Promise that resolves to an array of IStorageData objects.

The clear method clears all items from the storage. It takes the method name and storage name as parameters, and returns a Promise that resolves when the operation is complete.

## SharedStorageConnectionService

The SharedStorageConnectionService is a service that manages storage connections. It has properties such as loggerService, busService, methodContextService, storageSchemaService, and embeddingSchemaService. The service provides methods to retrieve, insert, update, remove, and list items from the storage based on specific criteria. It also allows for clearing all items from the storage.

## SharedStateUtils

The SharedStateUtils is a utility class designed for managing state in the agent swarm. It provides methods to retrieve, set, and clear state for a given client and state name. The class uses promises to handle asynchronous operations.

To retrieve the state for a specific client and state name, you can use the `getState` method. This method returns a promise that resolves to the state value.

To set a new state for a given client and state name, you can use the `setState` method. This method accepts a dispatch function, which can be either the new state value or an asynchronous function that returns the new state value. The method returns a promise that resolves when the state is successfully set.

To clear the state and reset it to its initial value for a given client and state name, you can use the `clearState` method. This method returns a promise that resolves to the initial state value.

Overall, SharedStateUtils provides a convenient way to manage and manipulate state within the agent swarm system.

## SharedStatePublicService

The SharedStatePublicService is a class that implements the TSharedStateConnectionService. It has a constructor, as well as properties for loggerService and sharedStateConnectionService. The setState function allows you to update the state using a provided dispatch function, while clearState resets the state to its initial value. The getState function retrieves the current state of the system.

## SharedStateConnectionService

The `SharedStateConnectionService` is a TypeScript class that manages shared state connections. It implements the `IState<T>` interface and provides methods to get, set, and clear the shared state. The class also has properties for `loggerService`, `busService`, `methodContextService`, and `stateSchemaService`.

The constructor is used to initialize the service. The `getStateRef` property is a memoized function that returns a reference to the shared state. The `setState` method sets the state by dispatching a function that returns a promise for the updated state. The `clearState` method sets the state to its initial value. The `getState` method retrieves the current state as a promise.

This service can be used to manage and manipulate shared state in a TypeScript application.

## SessionValidationService

The `SessionValidationService` is a service in Typescript that manages and validates sessions. It provides methods to add, remove and get information about sessions, agents, history, storage and states. The service also has properties to store session information and a logger service.

To use the `SessionValidationService`, you can create an instance of the service and call its methods to add, remove or get session information. The service also provides a `validate` method to check if a session exists and a `dispose` method to dispose of the session validation cache.

Overall, this service helps in managing and validating sessions by providing easy-to-use methods and properties.

## SessionPublicService

The `SessionPublicService` is a Typescript class that manages public session interactions. It has a constructor that takes no arguments and properties such as `loggerService`, `sessionConnectionService`, `emit`, `execute`, and more. The class provides methods to emit messages, execute commands in the session, connect to the session, commit tool output and system messages, commit assistant and user messages, flush the agent history, prevent the next tool from being executed, and dispose of the session.

## SessionConnectionService

The `SessionConnectionService` is a service that manages session connections and provides methods for interacting with sessions. It implements the `ISession` interface and has a constructor that initializes its dependencies. The service uses memoization to retrieve sessions based on client ID and swarm name, emits messages to the session, executes commands in the session, connects to sessions using a provided connector, commits tool output, system messages, assistant messages, user messages to the session, flushes the session, stops tools in the session, and disposes of the service.

## SchemaUtils

The `SchemaUtils` is a utility class that provides functions for performing operations related to schemas. It has a constructor that does not take any arguments.

The class includes a property called `serialize`, which is a generic function that can serialize an object or an array of objects into a formatted string. This function can be used to convert data into a readable and formatted string representation.

## LoggerUtils

The LoggerUtils class is an implementation of the ILoggerAdapter and ILoggerControl interfaces. It has a constructor, several properties and methods for logging messages. The LoggerFactory, LoggerCallbacks and getLogger properties are used internally for managing loggers. The useCommonAdapter, useClientCallbacks and useClientAdapter methods are used to configure the logger with different adapters and callbacks. The logClient, infoClient, debugClient, log, debug, info and dispose methods are used to log messages with different levels of severity and dispose a logger instance.

## LoggerService

The LoggerService is a class that implements the ILogger interface, providing methods to log and debug messages. It has a constructor, several properties such as methodContextService and executionContextService, and methods like log, debug, info, and setLogger. The log method logs messages using the current logger, while debug and info log debug messages and info messages respectively. The setLogger method allows you to set a new logger. This class is useful for logging and debugging purposes in a system.

## LoggerInstance

The `LoggerInstance` class is an implementation of the `ILoggerInstance` interface. It is constructed with a `clientId` and an optional set of callbacks defined in the `ILoggerInstanceCallbacks` interface. The `clientId` is a unique identifier for the client instance.

The `LoggerInstance` class has a private property, `__@LOGGER_INSTANCE_WAIT_FOR_INIT@1909`, which is used internally for waiting for initialization.

The `LoggerInstance` class provides two methods:
1. `waitForInit()` - Returns a Promise that resolves when the instance is initialized.
2. `log(topic: string, ...args: any[])` - Logs a message with the specified topic and additional arguments.
3. `debug(topic: string, ...args: any[])` - Logs a debug message with the specified topic and additional arguments.
4. `info(topic: string, ...args: any[])` - Logs an info message with the specified topic and additional arguments.
5. `dispose()` - Disposes the instance and cleans up any resources.

Overall, the `LoggerInstance` class provides a way to log messages with different levels of severity and waits for the instance to be initialized before performing any logging operations.

## HistoryUtils

The `HistoryUtils` class is a TypeScript implementation of the `IHistoryAdapter` and `IHistoryControl` interfaces. It provides various methods and properties for managing history messages. The class constructor initializes the `HistoryFactory`, `HistoryCallbacks`, and `getHistory` properties.

To use a custom history adapter, you can call the `useHistoryAdapter` method, passing in a constructor for the custom history instance. This allows you to integrate a specific implementation of the history adapter.

If you want to use custom history lifecycle callbacks, you can utilize the `useHistoryCallbacks` method, providing a partial implementation of the `IHistoryInstanceCallbacks` interface. This enables you to hook into specific events during the history lifecycle.

To push a new message to the history, you can use the `push` method. This asynchronous function takes a message object, client ID, and agent name as parameters. It returns a Promise that resolves when the message is successfully added to the history.

If you need to dispose of the history for a specific client and agent, you can call the `dispose` method. This asynchronous function takes the client ID and agent name as parameters. It returns a Promise that resolves when the history is successfully disposed.

To iterate over the history messages, you can use the `iterate` method. This asynchronous function takes the client ID and agent name as parameters. It returns an `AsyncIterableIterator` object, allowing you to iterate over the history messages asynchronously.

## HistoryPublicService

The `HistoryPublicService` is a TypeScript class that implements the `THistoryConnectionService` interface. It is responsible for handling public operations related to the history. The class has a constructor, properties like `loggerService`, `historyConnectionService`, and methods such as `push`, `toArrayForAgent`, `toArrayForRaw`, and `dispose`.

The `push` method allows you to push a message to the history asynchronously. It takes in a `message` object of type `IModelMessage`, the `methodName` as a string, `clientId`, and `agentName` as strings.

The `toArrayForAgent` method converts the history into an array specifically for a given agent. It takes in the `prompt` as a string, `methodName`, `clientId`, and `agentName` as strings, and returns a Promise that resolves to an array of `IModelMessage` objects.

The `toArrayForRaw` method converts the history into a raw array. It takes in `methodName`, `clientId`, and `agentName` as strings, and returns a Promise that resolves to an array of `IModelMessage` objects.

The `dispose` method allows you to dispose of the history asynchronously. It takes in `methodName`, `clientId`, and `agentName` as strings, and returns a Promise that resolves to `void`.

## HistoryInstance

The `HistoryInstance` class in TypeScript represents a History Instance and implements the `IHistoryInstance` interface. It has a constructor that takes in `clientId` and `callbacks`, which are used to initialize the instance. The class also has properties such as `clientId`, `callbacks` and private properties like `_array`, which is used internally.

The class provides several methods: `waitForInit`, which waits for the history to initialize; `iterate`, which iterates over the history messages for a given agent; `push`, which adds a new message to the history for a given agent; and `dispose`, which disposes of the history for a given agent.

Overall, the `HistoryInstance` class is used to manage and interact with a history of messages for a given agent in TypeScript.

## HistoryConnectionService

The `HistoryConnectionService` is a TypeScript class that implements the `IHistory` interface and provides functionality for managing history connections. It has a constructor that takes no arguments and initializes properties such as `loggerService`, `busService`, `methodContextService`, and `sessionValidationService`.

The class has several methods: `getHistory`, which retrieves the history for a given client and agent; `push`, which pushes a message to the history; `toArrayForAgent`, which converts the history to an array for the agent; `toArrayForRaw`, which converts the history to a raw array; and `dispose`, which disposes of the history connection service.

Overall, this class is responsible for managing and manipulating history connections in a TypeScript application.

## EmbeddingValidationService

The EmbeddingValidationService is a tool used within the agent-swarm to validate embeddings. It has a constructor that initializes the service, and two main properties: loggerService for logging messages, and _embeddingMap to store the embeddings. 

To add a new embedding, you can use the `addEmbedding` function, which takes the embedding's name and its schema as parameters. This function adds the embedding to the validation service for future use.

To validate if an embedding exists in the validation service, you can use the `validate` function. This function takes the embedding's name and its source as parameters. It checks if the specified embedding exists in the validation service and performs any necessary validations.

## EmbeddingSchemaService

The EmbeddingSchemaService is a service used for managing embedding schemas. It has a constructor, loggerService, registry, and validateShallow properties. The `register` function is used to register an embedding with a given key and value, while the `get` function retrieves an embedding by its key. This service provides a way to manage and access embedding schemas in your application.

## DocService

The DocService is a TypeScript class that provides functionality for generating documentation for swarms and agents. It utilizes several services for validation, schema generation and management, as well as meta data services for agents and swarms. The constructor initializes these services, while the `writeSwarmDoc` and `writeAgentDoc` methods are used to generate documentation for swarm and agent schemas, respectively. The `dumpDocs` method is used to generate and save the documentation for all swarms and agents in a specified directory.

## CompletionValidationService

The CompletionValidationService is a service that allows you to validate completion names. It has a constructor, loggerService property, and two methods: addCompletion() and validate(). 

The constructor is used to initialize the service. The loggerService property is used for logging messages, and the _completionSet property is used to store completion names.

The addCompletion() method is used to add a new completion name to the set. This allows you to dynamically add new completion names that may not be present in the initial set.

The validate() method is used to check if a given completion name exists in the set. It also takes a source parameter to identify where the completion name is coming from. This method returns a boolean value indicating whether the completion name is valid or not.

## CompletionSchemaService

The `CompletionSchemaService` is a service used for managing completion schemas. It has a constructor, properties such as `loggerService`, `registry`, and `validateShallow`, as well as two methods: `register` and `get`. The `register` method is used to add a new completion schema by providing a key and the corresponding `ICompletionSchema` object. The `get` method retrieves a completion schema by its key. This service allows for efficient management and retrieval of completion schemas.

## ClientSwarm

The ClientSwarm class is an implementation of the ISwarm interface and manages agents within a swarm. It has properties such as `params`, `_agentChangedSubject`, `_activeAgent`, and `_navigationStack` to handle various functionalities. The class provides methods like `navigationPop`, `cancelOutput`, `waitForOutput`, `getAgentName`, `getAgent`, and `setAgentRef` to interact with the agents in the swarm. The `setAgentName` method allows you to set the active agent by name.

## ClientStorage

The ClientStorage class is an implementation of the IStorage interface and provides methods for managing storage operations. It has a constructor that takes in parameters of type IStorageParams<T> and properties such as params, _itemMap, _createEmbedding, waitForInit, take, upsert, remove, clear, get, list and dispose.

The _createEmbedding property creates an embedding for a given item. The waitForInit property is used to wait for the initialization of the storage. The take method takes a specified number of items based on the search criteria. The upsert method is used to upsert an item into the storage. The remove method removes an item from the storage. The clear method clears all items from the storage. The get method gets an item by its ID. The list method lists all items in the storage, optionally filtered by a predicate. The dispose method is used to dispose of the state.

## ClientState

The `ClientState` class is an implementation of the `IState<State>` interface, representing the client's state. It has a constructor that takes in parameters defined by the `IStateParams<State>` interface. The class also includes several properties and methods for managing the state.

The `params` property holds the parameters used to initialize the state, while `_state` stores the current state. The `dispatch` property is used to dispatch actions and update the state.

The `waitForInit` property is a function that waits for the state to initialize. It can be used in conjunction with the `ISingleshotClearable` interface to clear the wait function after it has been called once.

The `setState` method sets the state using a provided dispatch function, which updates the `_state` property. It returns a promise that resolves with the updated state.

The `clearState` method sets the state to its initial value. It also returns a promise that resolves with the initial state.

The `getState` method retrieves the current state. It returns a promise that resolves with the current state.

Finally, the `dispose` method disposes of the state, cleaning up any resources associated with it. It returns a promise that resolves without any value.

## ClientSession

The `ClientSession` class is an implementation of the `ISession` interface. It has a constructor that takes in `ISessionParams` as a parameter. The class has several properties and methods for emitting messages, executing messages with optional emission and execution mode, committing tool output, user message without answer, flushing agent history, stopping the next tool execution, committing system and assistant messages. The `connect` method connects the session to a connector function, and `dispose` should be called when the session is disposed.

## ClientHistory

The `ClientHistory` class in TypeScript represents the history of messages exchanged between a client and an AI model. It implements the `IHistory` interface and provides various methods to interact with the message history.

The class has a constructor that takes in `IHistoryParams` as a parameter. It also has properties such as `params`, which holds the parameters for the history, and `_filterCondition`, which is a filter condition used in the `toArrayForAgent` method.

The `push` method allows you to add a new message to the history asynchronously. The `toArrayForRaw` method converts the history into an array of raw messages asynchronously. The `toArrayForAgent` method converts the history into an array of messages suitable for the agent, taking into account a prompt and optional system messages. Finally, the `dispose` method should be called when an agent is disposed to clean up any resources associated with the history.

## ClientAgent

The `ClientAgent` class implements the `IAgent` interface and represents a client agent that interacts with the system. It has a constructor that takes in `IAgentParams` as a parameter. The class has several properties and methods for handling agent actions, output, and communication.

The `waitForOutput` method waits for the output to be available, while `getCompletion` gets the completion message from the model. The `commitUserMessage`, `commitFlush`, `commitAgentChange`, `commitStopTools`, `commitSystemMessage`, `commitAssistantMessage`, and `commitToolOutput` methods are used to commit different types of messages or actions to the history.

The `execute` method executes the incoming message and processes tool calls if any. Finally, the `dispose` method should be called when the agent is disposed.

## BusService

The BusService is an implementation of the IBus interface. It provides functionality for event handling and communication between different clients. The constructor initializes the loggerService, sessionValidationService, and sets up the eventSourceSet and eventWildcardMap properties.

The getEventSubject method returns the event subject, which is used to handle events. The subscribe method allows clients to subscribe to events for a specific source by providing the clientId and source. It returns an unsubscribe function that can be used to stop receiving events.

The once method is similar to subscribe, but it allows clients to receive only one event. The filterFn can be used to specify which events should be received.

The emit method allows clients to send events to other subscribed clients by providing the clientId and event. It returns a Promise that resolves when the event is successfully emitted.

The dispose method allows clients to clean up their event subscriptions by providing the clientId. This will remove all event subscriptions for that specific client.

## AgentValidationService

The `AgentValidationService` is a service used for validating agents within an agent swarm. It has a constructor that initializes the logger service, tool validation service, completion validation service, and storage validation service. The service also has several properties and methods for managing agents, their dependencies, storages, and states.

The `getAgentList` method retrieves a list of all agents registered with the validation service. The `getStorageList` method retrieves a list of storages used by an agent. The `getStateList` method retrieves a list of states used by an agent.

The `addAgent` method adds a new agent to the validation service. The `hasStorage`, `hasDependency`, and `hasState` methods are memoized functions used to check if an agent has a registered storage, dependency, or state respectively.

Finally, the `validate` method is used to validate an agent by its name and source.

## AgentSchemaService

The `AgentSchemaService` is a service used for managing agent schemas. It has a constructor, properties such as `loggerService`, `registry`, and `validateShallow` for logging, registry management and validation of agent schemas respectively. The `register` function is used to register a new agent schema by providing the key and value of the schema. The `get` function is used to retrieve an agent schema by its name.

## AgentPublicService

The `AgentPublicService` is a Typescript class that implements the `TAgentConnectionService` interface. It is responsible for managing public agent operations such as creating an agent reference, executing commands on the agent, waiting for output from the agent, committing tool and system messages to the agent history, committing user and assistant messages to the agent history, flushing the agent's history, committing a change to the agent, preventing the next tool from being executed, and disposing of the agent. The class has a constructor, several properties and methods to perform these operations.

## AgentMetaService

The `AgentMetaService` is a class that provides methods for managing agent meta nodes and converting them to UML format. It has a constructor, properties such as `loggerService`, `agentSchemaService` and `serialize`, as well as methods like `makeAgentNode` and `toUML`. 

The `makeAgentNode` method creates a meta node for the given agent, while `makeAgentNodeCommon` does the same but with an optional `seen` parameter. The `toUML` method converts the meta nodes of a specific agent to UML format, with an optional `withSubtree` parameter.

## AgentConnectionService

The `AgentConnectionService` is a TypeScript class that manages agent connections. It has a constructor and several properties including `loggerService`, `busService`, `methodContextService`, `sessionValidationService`, `historyConnectionService`, `storageConnectionService`, `agentSchemaService`, `toolSchemaService`, and `completionSchemaService`. 

The class provides several methods: `getAgent` for retrieving an agent instance, `execute` for executing input commands, `waitForOutput` for waiting for output from the agent, `commitToolOutput` for committing tool output, `commitSystemMessage` for committing an assistant message, `commitAssistantMessage` for committing a system message, `commitUserMessage` for committing a user message without answer, `commitAgentChange` for committing agent change to prevent the next tool execution, `commitStopTools` for preventing the next tool from being executed, `commitFlush` for committing flush of agent history, and `dispose` for disposing of the agent connection.
