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

The `ToolValidationService` is a service designed for validating tools within an agent-swarm system. It provides a way to add new tools and validate their existence. The service utilizes a loggerService for logging purposes and maintains an internal tool map (_toolMap) for efficient storage and retrieval of tools.

To add a new tool, you can use the `addTool` function by passing in the tool's name and its associated schema. This will make the tool available for validation within the service.

To validate if a tool exists, you can use the `validate` function by providing the tool's name and its source code. This function will check if the tool is present in the validation service's internal storage.

Overall, the `ToolValidationService` provides a convenient way to manage and validate tools within an agent-swarm system.

## ToolSchemaService

The `ToolSchemaService` is a service used for managing tool schemas. It has a constructor, properties such as `loggerService`, `registry`, and `validateShallow` for logging, registry management and shallow validation of state schema respectively. The `register` function is used to register a tool with the given key and value, while `get` function retrieves a tool by its key.

## SwarmValidationService

The SwarmValidationService is a service used for validating swarms and their agents. It has a constructor, properties such as loggerService and agentValidationService for logging and validating agents respectively, as well as a private property _swarmMap for storing swarms.

To add a new swarm, you can use the `addSwarm` method by providing a swarm name and its schema. This will add the swarm to the swarm map.

To retrieve a list of agents for a specific swarm, you can use the `getAgentList` method by passing in the swarm name.

To get a list of all swarms, you can use the `getSwarmList` method.

Lastly, the `validate` method can be used to validate a swarm and its agents by providing the swarm name and a source. This will perform the validation process for that swarm.

## SwarmSchemaService

The SwarmSchemaService is a service used for managing swarm schemas. It has a constructor, loggerService property for logging purposes, registry property to store registered schemas, and validateShallow property for shallow validation of swarm schemas. The service provides two main functions: register and get. The `register` function is used to add a new swarm schema by providing the key and value of the schema. The `get` function retrieves a swarm schema by its name, allowing easy access to the registered schemas.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It is responsible for managing public interactions with swarms. The class has a constructor, several properties and methods for various functionalities.

The loggerService property is used for logging purposes, while the swarmConnectionService property is used for connecting to the swarm. The navigationPop method allows you to pop the navigation stack or return a default agent. The cancelOutput method cancels the await of output by emitting an empty string. The waitForOutput method is used to wait for output from the swarm. The getAgentName method retrieves the agent name from the swarm, and getAgent method retrieves the agent from the swarm. The setAgentRef method sets the agent reference in the swarm, while setAgentName method sets the agent name in the swarm. Lastly, the dispose method is used to dispose of the swarm.

## SwarmMetaService

The SwarmMetaService is a service that handles swarm metadata. It has properties such as loggerService, swarmSchemaService, agentMetaService and serialize. The loggerService is used for logging, swarmSchemaService handles the schema related operations for swarms, agentMetaService handles metadata related to agents and serialize is used for serialization. The makeSwarmNode function creates a swarm node with the given swarm name. The toUML function converts the swarm metadata into UML format.

## SwarmConnectionService

The SwarmConnectionService is a TypeScript class that implements the ISwarm interface and manages connections to a swarm. It has properties such as loggerService, busService, methodContextService, agentConnectionService, and swarmSchemaService. The service provides methods to retrieve swarm instances, navigate through the stack, cancel output awaiting, wait for swarm output, retrieve agent name and agent from the swarm, set agent reference and name in the swarm, and dispose of the connection. This service is useful for managing interactions with a swarm in a TypeScript application.

## StorageValidationService

The StorageValidationService is a service used for validating storages within the storage swarm. It has a constructor, loggerService property for logging purposes, embeddingValidationService property to validate the embeddings of storages, and a private property _storageMap to store the added storages.

To add a new storage, you can use the `addStorage` method by providing a storage name and its schema. This will add the new storage to the validation service.

To validate an existing storage, you can use the `validate` method by providing a storage name and its source. This will validate the specified storage within the swarm.

## StorageUtils

The `StorageUtils` is a TypeScript class that implements the `TStorage` interface. It provides several methods for interacting with a storage system. 

1. The `constructor` is used to initialize the storage utilities.
2. The `take` method allows you to retrieve items from the storage by providing a search query, total count, client ID, agent name, and storage name. It returns a promise that resolves to an array of items matching the specified criteria.
3. The `upsert` method enables you to upsert (insert or update) an item in the storage. You need to provide the new item, client ID, agent name, and storage name. It returns a promise that resolves when the operation is complete.
4. The `remove` method allows you to delete an item from the storage by specifying its ID, client ID, agent name, and storage name. It returns a promise that resolves when the item is successfully removed.
5. The `get` method retrieves a specific item from the storage by specifying its ID, client ID, agent name, and storage name. It returns a promise that resolves to the requested item.
6. The `list` method allows you to list items from the storage based on specified criteria. You can provide a filter function to narrow down the results. It returns a promise that resolves to an array of items matching the specified criteria.
7. The `clear` method clears the entire storage by specifying client ID, agent name, and storage name. It returns a promise that resolves when the storage is successfully cleared.

## StorageSchemaService

The StorageSchemaService is a service used for managing storage schemas. It has a constructor, loggerService property for logging service messages, registry property to store registered schemas, and validateShallow property for shallow validation of storage schemas. The service provides two main functions: register and get. The `register` function is used to add a new storage schema by providing the key and value of the schema. The `get` function retrieves a storage schema by its key. This service allows for efficient management and retrieval of storage schemas in a TypeScript application.

## StoragePublicService

The StoragePublicService is a service that manages interactions with public storage. It implements the TStorageConnectionService interface and provides various methods for interacting with storage data. The constructor initializes the loggerService and storageConnectionService properties.

The take method retrieves a list of storage data based on a search query and total number of items. It returns a Promise that resolves to an array of IStorageData objects.

The upsert method allows you to insert or update an item in the storage. It takes an IStorageData object, the methodName, clientId, and storageName as parameters. It returns a Promise that resolves when the operation is complete.

The remove method removes an item from the storage based on its ID. It takes the itemId, methodName, clientId, and storageName as parameters. It returns a Promise that resolves when the operation is complete.

The get method retrieves an item from the storage by its ID. It takes the itemId, methodName, clientId, and storageName as parameters. It returns a Promise that resolves to the IStorageData object if found, or throws an error if not found.

The list method retrieves a list of items from the storage, optionally filtered by a predicate function. It takes the methodName, clientId, storageName, and an optional filter function as parameters. The filter function can be used to specify conditions for the items to be included in the list. It returns a Promise that resolves to an array of IStorageData objects.

The clear method clears all items from the storage. It takes the methodName, clientId, and storageName as parameters. It returns a Promise that resolves when the operation is complete.

The dispose method disposes of the storage. It takes the methodName, clientId, and storageName as parameters. It returns a Promise that resolves when the storage is disposed.

## StorageConnectionService

The StorageConnectionService is a service that manages storage connections and provides methods for interacting with the stored data. It implements the IStorage interface and has properties for dependency injection, including loggerService, busService, methodContextService, storageSchemaService, sessionValidationService, and embeddingSchemaService.

The service provides a getSharedStorage method to retrieve a shared storage instance based on the storage name. It also has a getStorage method to retrieve a storage instance based on the client ID and storage name. Both methods return a ClientStorage object that can be used to interact with the data.

The service offers several methods for interacting with the stored data:
- take retrieves a list of storage data based on a search query and total number of items.
- upsert upserts an item in the storage.
- remove removes an item from the storage.
- get retrieves an item from the storage by its ID.
- list retrieves a list of items from the storage, optionally filtered by a predicate function.
- clear clears all items from the storage.
- dispose disposes of the storage connection.

These methods allow for efficient management and manipulation of data stored in the storage.

## StateUtils

The `StateUtils` is a utility class designed to manage state within an agent swarm. It provides methods for retrieving and setting state based on client ID, agent name, and specific state names.

The `constructor` is used to initialize the utility class.

The `getState` method allows you to retrieve the state for a given client and state name. It returns a promise that resolves to the state value.

The `setState` method is used to set the state for a given client and state name. It accepts either the new state value directly or a function that returns a promise resolving to the new state value. This allows for asynchronous updates to the state if needed.

Overall, `StateUtils` provides a convenient way to manage and manipulate state within an agent swarm environment.

## StateSchemaService

The `StateSchemaService` is a service used for managing state schemas. It has a constructor, properties such as `loggerService`, `registry` and `validateShallow`, as well as two methods: `register` and `get`. 

The `register` method is used to register a new state schema by providing the key and value of the schema. 

The `get` method is used to retrieve a state schema by its key.

## StatePublicService

The `StatePublicService` class is an implementation of the `TStateConnectionService` interface. It has a constructor, as well as properties `loggerService` and `stateConnectionService`. The class provides three methods: `setState`, `getState`, and `dispose`.

The `setState` method sets the state using a provided dispatch function. It takes in the dispatch function, a method name, a client ID, and a state name as parameters. It returns the updated state after dispatching the action.

The `getState` method retrieves the current state. It takes in a method name, client ID, and state name as parameters. It returns the current state after fetching it from the connection service.

The `dispose` method disposes of the state. It takes in a method name, client ID, and state name as parameters. It returns a promise that resolves when the state has been successfully disposed.

## StateConnectionService

The `StateConnectionService` is a TypeScript class that manages state connections. It implements the `IState<T>` interface and provides several functions for working with state. The class has properties such as `loggerService`, `busService`, `methodContextService`, `stateSchemaService`, and `sessionValidationService` which are used internally for various operations.

The `constructor` is used to initialize the service.

The `getSharedStateRef` is a memoized function that returns a shared state reference. It takes two parameters, `clientId` and `stateName`, and returns a `ClientState<any>`.

The `getStateRef` is a memoized function that returns a state reference. It works similarly to `getSharedStateRef`, taking the same parameters and returning a `ClientState<any>`.

The `setState` function sets the state by dispatching a function that takes the previous state as an argument and returns a promise that resolves to the updated state.

The `getState` function retrieves the current state by returning a promise that resolves to the current state.

The `dispose` function is used to dispose of the state connection, releasing any resources associated with it.

## SessionValidationService

The `SessionValidationService` is a service used for validating and managing sessions in an application. It provides methods to add, remove and get information about sessions. The service also keeps track of the session mode, agent usage, history usage, storage usage and state usage.

To use this service, you can create an instance of `SessionValidationService` and call its methods as needed. For example, you can add a new session using the `addSession` method, add agent usage to a session using the `addAgentUsage` method, and get a list of all session IDs using the `getSessionList` method.

The service also provides methods to validate if a session exists, remove a session and get the swarm name for a session.

Overall, the `SessionValidationService` provides a way to manage and validate sessions in an application, making it easier to keep track of session information and usage.

## SessionPublicService

The `SessionPublicService` is a TypeScript class that implements the `TSessionConnectionService` interface. It is responsible for managing public session interactions, which include emitting messages, executing commands, connecting to the session, committing tool output, system messages, user messages, flushing agent history, and disposing of the session.

The class has a constructor that initializes the `loggerService` and `sessionConnectionService`. It also provides several methods for interacting with the session, such as `emit`, which emits a message to the session, and `execute`, which executes a command in the session.

Other methods include `connect`, which connects to the session, and `commitToolOutput`, `commitSystemMessage`, and `commitUserMessage`, which commit tool output, system messages, and user messages to the session respectively. The `commitFlush` method commits a flush of the agent history, and `dispose` disposes of the session.

Overall, `SessionPublicService` provides a set of methods to interact with public sessions, allowing users to emit messages, execute commands, connect and disconnect from sessions, commit various types of messages and flushes, and manage the session's lifecycle.

## SessionConnectionService

The `SessionConnectionService` is a TypeScript class that implements the `ISession` interface and provides functionality for managing session connections. It has a constructor that initializes the service with dependencies such as `loggerService`, `busService`, `methodContextService`, `swarmConnectionService`, and `swarmSchemaService`.

The service provides several methods for interacting with sessions. `getSession` retrieves a memoized session based on the clientId and swarmName. `emit` allows you to send a message to the session. `execute` executes a command in the session. `connect` connects to a session using the provided connector.

The service also provides methods for committing different types of messages to the session, such as `commitToolOutput`, `commitSystemMessage`, and `commitUserMessage`. These methods allow you to commit tool output, system messages, and user messages to the session respectively.

To ensure proper cleanup, the service also includes a `dispose` method that disposes of the session connection service.

## SchemaUtils

The `SchemaUtils` is a utility class that provides functions for performing operations related to schemas. It has a constructor that does not take any arguments.

The class includes a property called `serialize`, which is a function that can serialize an object or an array of objects into a formatted string. This function can be used to convert data into a readable and formatted string representation.

## LoggerUtils

The LoggerUtils is a TypeScript class that implements the ILoggerAdapter and ILoggerControl interfaces. It has a constructor, several properties and methods for logging different levels of information, and a dispose method. The LoggerFactory property is used to create logger instances, while LoggerCallbacks and getLogger are used to configure the logger. The useCommonAdapter, useClientCallbacks and useClientAdapter methods are used to set up the logger with specific adapters or callbacks. The logClient, infoClient, debugClient, log, debug, info and dispose methods are used to log different levels of information and dispose a logger instance.

## LoggerService

The LoggerService is a class that implements the ILogger interface, providing methods to log and debug messages. It has a constructor, several properties including methodContextService, executionContextService, _commonLogger and getLoggerAdapter. The log method logs messages using the current logger, debug logs debug messages and info logs information messages. The setLogger method allows you to set a new logger. This class is used for logging purposes in a system.

## LoggerInstance

The `LoggerInstance` is a class that implements the `ILoggerInstance` interface. It has a constructor that takes in two parameters: `clientId` and `callbacks`. The `clientId` is a string that uniquely identifies the client, and `callbacks` is an object that contains optional callback functions.

The `LoggerInstance` has three properties: `clientId`, which is a string that holds the client ID, `callbacks`, which is an object containing optional callback functions, and `__@LOGGER_INSTANCE_WAIT_FOR_INIT@1721`, which is a placeholder for internal use.

The `LoggerInstance` also has two methods:
1. `waitForInit` - This method returns a promise that resolves when the logger instance is initialized.
2. `log`, `debug`, and `info` - These methods log messages with different levels of severity. The `log` method logs a message with the specified topic and arguments, while `debug` and `info` log debug and info messages respectively.

Lastly, the `LoggerInstance` has a method called `dispose`, which is used to clean up any resources associated with the logger instance.

## HistoryUtils

The `HistoryUtils` class provides functionality for managing and interacting with the history of messages in a system. It implements `IHistoryAdapter` and `IHistoryControl`, which allow for customization and control over the history.

To use a custom history adapter, you can call the `useHistoryAdapter` method, passing in a constructor for the custom adapter. This will enable you to use a different implementation for managing the history.

If you want to use specific lifecycle callbacks for the history, you can use the `useHistoryCallbacks` method, passing in a partial implementation of `IHistoryInstanceCallbacks`. This will allow you to hook into various events and actions related to the history.

To push a new message to the history, you can call the `push` method, passing in an instance of `IModelMessage`, the client ID, and the agent name. This will return a promise that resolves once the message has been successfully added to the history.

If you need to dispose of the history for a specific client and agent, you can call the `dispose` method, passing in the client ID and agent name. This will also return a promise that resolves once the history has been successfully disposed.

To iterate over the history messages, you can call the `iterate` method, passing in the client ID and agent name. This will return an `AsyncIterableIterator` that you can use to iterate over the history messages asynchronously.

## HistoryPublicService

The `HistoryPublicService` is a TypeScript class that implements the `THistoryConnectionService` interface. It is responsible for handling public operations related to the history. This service provides methods for pushing messages to the history, converting history data into arrays for specific agents or raw format, and disposing of the history.

The `constructor` is used to initialize the service and set up any necessary dependencies.

The `loggerService` and `historyConnectionService` are properties of the class, which provide logging and history connection functionalities respectively.

The `push` method allows you to push a message to the history asynchronously. It takes a message object (`IModelMessage`) along with the method name, client ID, and agent name as parameters.

The `toArrayForAgent` method converts the history data into an array format specifically for a given agent. It returns an array of `IModelMessage` objects asynchronously.

The `toArrayForRaw` method converts the history data into a raw array format. It also returns an array of `IModelMessage` objects asynchronously.

The `dispose` method allows you to dispose of the history data asynchronously. It takes the method name, client ID, and agent name as parameters.

Overall, the `HistoryPublicService` provides a set of methods to interact with the history data, including pushing messages, converting to different array formats, and disposing of the history data.

## HistoryInstance

The `HistoryInstance` class in TypeScript represents a History Instance and implements the `IHistoryInstance` interface. It has a constructor that takes in `clientId` and `callbacks`, which are used to initialize the instance. The class also has properties such as `clientId`, `callbacks` and private properties like `_array` and `__@HISTORY_INSTANCE_WAIT_FOR_INIT@426`.

The `waitForInit` method is used to wait for the history to initialize, and it takes in an `agentName` parameter. The `iterate` method is used to iterate over the history messages for a given agent, and it returns an `AsyncIterableIterator` of type `IModelMessage`. The `push` method is used to push a new message to the history for a given agent, and it takes in `value` of type `IModelMessage` and an `agentName`. The `dispose` method is used to dispose of the history for a given agent, and it takes in an `agentName` parameter.

## HistoryConnectionService

The `HistoryConnectionService` is a TypeScript class that implements the `IHistory` interface and provides functionality for managing history connections. It has a constructor that initializes the loggerService, busService, methodContextService, and sessionValidationService. The class also includes several methods for retrieving and manipulating history data.

The `getHistory` method retrieves the history for a specific client and agent. The `push` method allows you to push a message to the history. The `toArrayForAgent` method converts the history to an array format for agents, while `toArrayForRaw` converts the history to a raw array format. The `dispose` method is used to dispose of the history connection service.

Overall, this class provides a way to manage and interact with history data in TypeScript applications.

## EmbeddingValidationService

The EmbeddingValidationService is a tool used within the agent-swarm to validate embeddings. It has a constructor that initializes the service, and two main properties: loggerService for logging messages, and _embeddingMap to store the embeddings.

To add a new embedding, you can use the `addEmbedding` function, which takes the embedding name and its schema as parameters. This function adds the embedding to the validation service for future use.

To validate if an embedding exists in the validation service, you can use the `validate` function. It takes the embedding name and its source as parameters. This function checks if the specified embedding exists in the validation service.

## EmbeddingSchemaService

The EmbeddingSchemaService is a service used for managing embedding schemas. It has a constructor, loggerService property for logging purposes, registry property to store registered embeddings, and validateShallow property for shallow validation of embedding schemas. The service provides two methods: register and get. 

The `register` method is used to register a new embedding with the given key and value. This allows you to store embeddings for later use.

The `get` method is used to retrieve an embedding by its key. This allows you to access previously registered embeddings by their unique identifier.

## DocService

The `DocService` is a TypeScript class that provides functionality for generating documentation for swarms and agents. It utilizes several services for validation, schema generation and management, as well as meta data services for agents and swarms. The class also includes methods for writing documentation for swarm and agent schemas, as well as a method for dumping the documentation for all swarms and agents.

The `DocService` constructor initializes the class and sets up dependencies. The properties of this class include various services for validation, schema management, and meta data. These services are used to validate, generate and manage schemas for swarms and agents, as well as to retrieve meta data for these entities.

The `writeSwarmDoc` method is used to write documentation for a swarm schema, while the `writeAgentDoc` method is used to write documentation for an agent schema.

The `dumpDocs` method is used to dump the documentation for all swarms and agents. It takes an optional parameter `dirName` which specifies the directory name where the documentation will be dumped. This method returns a Promise that resolves when the documentation has been successfully dumped.

## CompletionValidationService

The CompletionValidationService is a TypeScript service that allows you to validate completion names. It has a constructor, properties such as loggerService and _completionSet, and two methods: addCompletion and validate. 

The constructor is used to initialize the service. The loggerService property is used for logging messages, while the _completionSet property is used to store a set of completion names.

The addCompletion method is used to add a new completion name to the set. This allows you to dynamically add new completion names that can be validated later.

The validate method is used to check if a given completion name exists in the set. It takes two parameters: completionName, which is the name of the completion to validate, and source, which is a string representing the source of the completion. This method returns void, meaning it does not return any value but performs the validation operation.

## CompletionSchemaService

The `CompletionSchemaService` is a service that manages completion schemas. It has a constructor, properties like `loggerService`, `registry`, and `validateShallow`, as well as two methods: `register` and `get`. The `register` method is used to add a new completion schema by providing a key and the corresponding `ICompletionSchema` object. The `get` method retrieves a completion schema by its key. This service allows for efficient management and retrieval of completion schemas.

## ClientSwarm

The ClientSwarm class is an implementation of the ISwarm interface that manages agents within a swarm. It has properties such as `params`, `_agentChangedSubject`, `_activeAgent`, and `_navigationStack` to handle various functionalities. The class provides methods like `navigationPop`, `cancelOutput`, `waitForOutput`, `getAgentName`, `getAgent`, and `setAgentRef` to interact with the swarm and its agents. The `navigationPop` method pops the navigation stack or returns a default agent, while `cancelOutput` cancels the await of output by emitting an empty string. The `waitForOutput` method waits for output from the active agent. The `getAgentName` method retrieves the name of the active agent, and `getAgent` gets the active agent. The `setAgentRef` method sets the reference of an agent in the swarm, and `setAgentName` sets the active agent by name.

## ClientStorage

The `ClientStorage` class is an implementation of the `IStorage<T>` interface and is used to manage storage operations. It has a constructor that takes in `IStorageParams<T>` as a parameter. The class has several properties and methods for performing various storage operations.

The `params` property holds the storage parameters, while the `_itemMap` property is used to store the items in the storage. The `_createEmbedding` method creates an embedding for the given item, which is used in some storage operations.

The `waitForInit` property is a function that waits for the initialization of the storage. The `take` method takes a specified number of items based on the search criteria. The `upsert` method upserts an item into the storage. The `remove` method removes an item from the storage. The `clear` method clears all items from the storage. The `get` method gets an item by its ID. The `list` method lists all items in the storage, optionally filtered by a predicate. The `dispose` method disposes of the state.

## ClientState

The `ClientState` class is an implementation of the `IState<State>` interface, representing the client's state. It has a constructor that takes in parameters of type `IStateParams<State>`. The class has several properties and methods.

The `params` property is of type `IStateParams<State>` and holds the parameters for initializing the state.

The `_state` property is of type `any`, and it holds the current state of the client.

The `dispatch` property is of type `any`, and it allows dispatching actions to update the state.

The `waitForInit` property is a function that waits for the state to initialize. It is of type `(() => Promise<void>) & ISingleshotClearable`.

The `setState` method takes in a dispatch function of type `DispatchFn<State>` and sets the state using this function. It returns a promise that resolves to the updated state.

The `getState` method returns a promise that resolves to the current state.

The `dispose` method disposes of the state and returns a promise that resolves to `void`.

## ClientSession

The ClientSession class is an implementation of the ISession interface. It has a constructor that takes in parameters of type ISessionParams. This class has several properties and methods to handle session communication.

The `emit` method allows you to emit a message, while the `execute` method executes a message and optionally emits the output. The `commitToolOutput` method commits tool output, `commitUserMessage` commits user messages without answers, `commitFlush` commits the flush of agent history, and `commitSystemMessage` commits a system message.

The `connect` method connects the session to a connector function, and `dispose` should be called when the session is disposed.

## ClientHistory

The `ClientHistory` class in TypeScript represents the history of messages exchanged between a client and an AI model. It implements the `IHistory` interface and provides various methods to interact with the message history.

The class has a constructor that takes in `IHistoryParams` as a parameter. It also has properties such as `params`, which holds the parameters for the history, and `_filterCondition`, which is a filter condition used in the `toArrayForAgent` method.

The `push` method allows you to add a new message to the history asynchronously. The `toArrayForRaw` method converts the history into an array of raw messages, while `toArrayForAgent` converts the history into an array of messages specifically for the agent, taking into account a prompt and optional system messages.

Lastly, the `dispose` method should be called when an agent is disposed to clean up any resources associated with the history.

## ClientAgent

The `ClientAgent` class in TypeScript implements the `IAgent` interface and represents a client agent that interacts with the system. It has a constructor that takes in `IAgentParams` as a parameter. The class has several properties and methods for handling agent interactions, such as emitting output results after validation, resurrecting the model based on a given reason, waiting for output to be available, getting completion messages from the model, committing user and system messages to history, committing tool outputs to the history, and executing incoming messages while processing tool calls if necessary. The `dispose` method should be called when the agent is disposed.

## BusService

The BusService is an implementation of the IBus interface that provides event handling functionality. It utilizes a loggerService for logging, sessionValidationService to validate sessions, and maintains internal data structures like _eventSourceSet, _eventWildcardMap and getEventSubject for efficient event handling.

The constructor initializes the service without any parameters.

The loggerService, sessionValidationService and internal data structures are properties of the BusService class.

The subscribe method allows you to subscribe to events for a specific client and source. It takes in the clientId, source and a function to handle the events. It returns an unsubscribe function that can be used to stop receiving events.

The once method is similar to subscribe, but it only allows you to handle a single event.

The emit method allows you to send an event for a specific client. It returns a Promise that resolves when the event is successfully emitted.

The dispose method allows you to clean up event subscriptions for a specific client.

Overall, BusService provides a way to handle events in an efficient and organized manner.

## AgentValidationService

The `AgentValidationService` is a service used for validating agents within an agent swarm. It has a constructor that initializes the logger service, tool validation service, completion validation service, and storage validation service. The service also has several properties and methods for managing agents, their dependencies, storages, and states.

The `getAgentList` method retrieves a list of agent names. The `getStorageList` method retrieves a list of storages used by an agent. The `getStateList` method retrieves a list of states used by an agent.

The `addAgent` method adds a new agent to the validation service. The `hasStorage`, `hasDependency`, and `hasState` methods are memoized functions used to check if an agent has a registered storage, dependency, or state respectively.

Finally, the `validate` method is used to validate an agent by its name and source.

## AgentSchemaService

The `AgentSchemaService` is a service used for managing agent schemas. It has a constructor, properties like `loggerService`, `registry`, and `validateShallow` for logging, registry management and validation of agent schema respectively. The `register` function is used to register a new agent schema by providing the key and value of the IAgentSchema. The `get` function is used to retrieve an agent schema by providing the key name.

## AgentPublicService

The `AgentPublicService` is a TypeScript class that implements the `TAgentConnectionService` interface. It is responsible for managing public agent operations, such as creating an agent reference, executing commands on the agent, waiting for output from the agent, committing tool and system messages to the agent, flushing the agent's history, and disposing of the agent.

To use this service, you need to provide the `loggerService` and `agentConnectionService` as dependencies. The class provides several methods to interact with the agent, including:
- `createAgentRef`: Creates a reference to an agent by specifying the method name, client ID, and agent name.
- `execute`: Executes a command on the agent by specifying the input, execution mode, method name, client ID, and agent name.
- `waitForOutput`: Waits for the agent's output by specifying the method name, client ID, and agent name.
- `commitToolOutput`: Commits tool output to the agent by specifying the tool ID, content, method name, client ID, and agent name.
- `commitSystemMessage`: Commits a system message to the agent by specifying the message, method name, client ID, and agent name.
- `commitUserMessage`: Commits a user message to the agent without an answer by specifying the message, method name, client ID, and agent name.
- `commitFlush`: Commits a flush of the agent's history by specifying the method name, client ID, and agent name.
- `commitAgentChange`: Commits a change of the agent to prevent the next tool execution from being called by specifying the method name, client ID, and agent name.
- `dispose`: Disposes of the agent by specifying the method name, client ID, and agent name.

## AgentMetaService

The `AgentMetaService` is a class that provides methods for managing agent meta nodes and converting them to UML format. It has a constructor, properties such as `loggerService`, `agentSchemaService` and `serialize`, as well as methods like `makeAgentNode` and `toUML`.

The `makeAgentNode` method creates a meta node for the given agent, while `makeAgentNodeCommon` does the same but with an optional `seen` parameter. The `toUML` method converts the meta nodes of a specific agent to UML format, with an optional `withSubtree` parameter.

## AgentConnectionService

The `AgentConnectionService` is a TypeScript class that manages agent connections and provides methods for interacting with agents. It implements the `IAgent` interface and has several properties such as `loggerService`, `busService`, and others.

The class has a constructor that initializes the service. It also provides methods like `getAgent` to retrieve an agent instance, `execute` for executing input commands, and methods like `commitToolOutput`, `commitSystemMessage`, and others for committing different types of output.

The `AgentConnectionService` also has methods like `commitFlush`, `dispose` for committing agent history flush and disposing of the agent connection respectively.
