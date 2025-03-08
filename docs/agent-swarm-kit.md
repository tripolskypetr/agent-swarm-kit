# agent-swarm-kit

## ToolValidationService

The `ToolValidationService` is a service used for validating tools within the agent-swarm. It provides a way to add new tools and validate their existence. The service uses a loggerService for logging purposes and maintains an internal map of tools, represented by `_toolMap`.

To add a new tool, you can use the `addTool` function. This function takes two parameters: `toolName`, which is the name of the tool, and `toolSchema`, which is an object representing the schema of the tool.

To validate if a tool exists in the validation service, you can use the `validate` function. This function takes two parameters: `toolName`, which is the name of the tool to be validated, and `source`, which represents the source of the tool.

By using this service, you can easily manage and validate tools within your agent-swarm system.

## ToolSchemaService

The `ToolSchemaService` is a service that manages tool schemas. It has a constructor, properties such as `loggerService`, `registry`, and `validateShallow`, as well as two methods: `register` and `get`. The `register` method allows you to register a tool with a given key and value, while the `get` method retrieves a tool by its key. The `validateShallow` property is used for validating the state schema.

## SwarmValidationService

The SwarmValidationService is a service used for validating swarms and their agents. It has a constructor, properties such as loggerService and agentValidationService for logging and validating agents respectively, and a private property _swarmMap for storing swarms.

To add a new swarm, you can use the `addSwarm` method by providing a swarm name and its schema. This will add the swarm to the swarm map.

To retrieve a list of agents for a specific swarm, you can use the `getAgentList` method by passing in the swarm name. This will return an array of agent names associated with the swarm.

To retrieve a list of all swarms, you can use the `getSwarmList` method. This will return an array of swarm names currently stored in the service.

To validate a swarm and its agents, you can use the `validate` method by providing a swarm name and the source code of the swarm. This will perform validation on both the swarm and its agents.

## SwarmSchemaService

The SwarmSchemaService is a service used for managing swarm schemas. It has a constructor, loggerService property for logging purposes, registry property to store registered schemas, and validateShallow property for shallow validation of swarm schemas. The service provides two methods: register and get.

The `register` method is used to register a new swarm schema by providing the key and value of the schema. This allows for easy storage and retrieval of swarm schemas.

The `get` method retrieves a swarm schema by its name, allowing for easy access to specific schemas when needed.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It is designed to manage public swarm interactions, allowing users to interact with swarms in a public setting. The class has several methods that enable various functionalities such as popping the navigation stack, cancelling output awaits, waiting for swarm outputs, retrieving agent names and agents from swarms, setting agent references and names in the swarm, and disposing of a swarm. These methods are asynchronous and return promises for their respective operations. The class also has properties such as loggerService, swarmConnectionService, navigationPop, cancelOutput, waitForOutput, getAgentName, getAgent, setAgentRef, setAgentName, and dispose.

## SwarmMetaService

The SwarmMetaService is a service that handles metadata related to swarms. It has a constructor, several properties including loggerService, swarmSchemaService, agentMetaService and serialize. The makeSwarmNode function creates a swarm node with the given swarm name. The toUML function converts the swarm metadata into UML format.

## SwarmConnectionService

The SwarmConnectionService is a TypeScript class that implements the ISwarm interface and provides functionality for managing swarm connections. It has a constructor that initializes the loggerService, busService, methodContextService, agentConnectionService, and swarmSchemaService properties.

The service provides several methods for interacting with swarms. The getSwarm method retrieves a swarm instance based on the client ID and swarm name. The navigationPop method pops the navigation stack or returns the default agent. The cancelOutput method cancels the await of output by emitting an empty string. The waitForOutput method waits for the output from the swarm. The getAgentName method retrieves the agent name from the swarm. The getAgent method retrieves the agent from the swarm. The setAgentRef method sets the agent reference in the swarm. The setAgentName method sets the agent name in the swarm. Finally, the dispose method disposes of the swarm connection.

## StorageValidationService

The StorageValidationService is a service designed to validate storages within the storage swarm. It provides a way to add new storages, as well as validate existing ones. The service utilizes a loggerService for logging purposes, an embeddingValidationService to validate the embedded storage schema, and a private property _storageMap to store the storage information.

To add a new storage, you can use the `addStorage` method by providing a storage name and its schema. This will add the new storage to the validation service.

To validate an existing storage, you can use the `validate` method by specifying its name and the source. This will initiate a validation process for the specified storage.

Overall, this service helps ensure the correctness and consistency of storages within the storage swarm by providing methods to add and validate them.

## StorageUtils

The `StorageUtils` is a TypeScript class that implements the `TStorage` interface. It provides several methods to interact with a storage system. 

1. The `constructor` is used to initialize the storage utilities.
2. The `take` method allows you to retrieve items from the storage by providing a search query, total count, client ID, agent name, and storage name. It returns a promise that resolves to an array of items matching the given criteria.
3. The `upsert` method is used to insert or update an item in the storage. It requires the new item, client ID, agent name, and storage name. It returns a promise that resolves when the operation is completed.
4. The `remove` method allows you to delete an item from the storage by providing its ID, client ID, agent name, and storage name. It returns a promise that resolves when the item is successfully removed.
5. The `get` method retrieves a specific item from the storage by providing its ID, client ID, agent name, and storage name. It returns a promise that resolves to the requested item.
6. The `list` method allows you to retrieve a list of items from the storage based on specific criteria. You can provide a filter function, which will be used to determine if an item should be included in the list. It returns a promise that resolves to an array of items matching the given criteria.
7. The `clear` method is used to delete all items from the storage. It requires the client ID, agent name, and storage name. It returns a promise that resolves when all items are successfully removed.

## StorageSchemaService

The StorageSchemaService is a service used for managing storage schemas. It has a constructor, loggerService property for logging service messages, registry property to store registered schemas, and validateShallow property for shallow validation of storage schemas. The service provides two main functions: register and get. The `register` function is used to add a new storage schema by providing the key and value, while `get` function retrieves a storage schema by its key. This service helps in organizing and managing storage schemas efficiently.

## StoragePublicService

The StoragePublicService is a service that handles interactions with public storage. It implements the TStorageConnectionService interface and provides various methods for managing storage data. The service is constructed with a loggerService and storageConnectionService.

The `take` method retrieves a list of storage data based on a search query and total number of items. It returns a Promise that resolves to an array of IStorageData objects.

The `upsert` method upserts an item in the storage. It takes an IStorageData object, methodName, clientId, and storageName as parameters and returns a Promise that resolves when the operation is complete.

The `remove` method removes an item from the storage based on its ID. It takes a StorageId, methodName, clientId, and storageName as parameters and returns a Promise that resolves when the operation is complete.

The `get` method retrieves an item from the storage by its ID. It takes a StorageId, methodName, clientId, and storageName as parameters and returns a Promise that resolves to the IStorageData object.

The `list` method retrieves a list of items from the storage, optionally filtered by a predicate function. It takes methodName, clientId, storageName, and an optional filter function as parameters. The filter function can be used to specify a custom condition for filtering the items. It returns a Promise that resolves to an array of IStorageData objects.

The `clear` method clears all items from the storage. It takes methodName, clientId, and storageName as parameters. It returns a Promise that resolves when all items have been cleared from the storage.

The `dispose` method disposes of the storage. It takes methodName, clientId, and storageName as parameters. It returns a Promise that resolves when the storage has been disposed.

## StorageConnectionService

The StorageConnectionService is a TypeScript class that manages storage connections. It has a constructor to initialize dependencies and properties such as loggerService, busService, methodContextService, storageSchemaService, sessionValidationService, embeddingSchemaService, sharedStorageConnectionService, _sharedStorageSet. The service provides methods to retrieve, insert, update, remove and list items from the storage. It also allows for clearing all items and disposing of the storage connection.

## StateUtils

The `StateUtils` class is a utility for managing state in an agent swarm. It provides methods to retrieve, set, and clear state for a given client and state name. The `getState` method allows you to retrieve the state for a specific client and state name, while the `setState` method sets the state for a given client and state name, either by providing the new value directly or as a function that returns a Promise for the new value. The `clearState` method sets the state back to its initial value. All methods return a Promise, allowing you to handle asynchronous operations.

## StateSchemaService

The `StateSchemaService` is a service that manages state schemas. It has a constructor, properties such as `loggerService`, `registry` and `validateShallow`, as well as two methods: `register` and `get`. The `register` method is used to add a new state schema by providing the key and value, while `get` method retrieves a state schema by its key. This service allows for efficient management and retrieval of state schemas.

## StatePublicService

The `StatePublicService` is an implementation of the `TStateConnectionService` interface. It has a constructor, as well as properties `loggerService` and `stateConnectionService`. 

The `setState` function sets the state using a provided dispatch function, which returns a promise of the updated state. 

The `clearState` function sets the state back to its initial value. 

The `getState` function retrieves the current state of a specific method, clientId and stateName. 

The `dispose` function disposes the state, releasing any resources associated with it. 

This class provides methods to manage the state of a system, allowing for setting, retrieving and disposing of state data.

## StateConnectionService

The `StateConnectionService` is a TypeScript class that manages state connections. It implements the `IState<T>` interface and provides various methods to interact with the state. The class has several properties including `loggerService`, `busService`, `methodContextService`, `stateSchemaService`, `sessionValidationService`, and `sharedStateConnectionService`. It also has a private property `_sharedStateSet`.

The class provides a memoized function `getStateRef` to get a state reference. It also has methods `setState`, `clearState`, and `getState` to set, clear, or get the state respectively. These methods return a Promise to handle asynchronous operations.

The `dispose` method is used to dispose of the state connection.

Overall, `StateConnectionService` is a service that manages state connections and provides methods to interact with the state asynchronously.

## SharedStorageUtils

The `SharedStorageUtils` is a TypeScript class that implements the `TSharedStorage` interface. It provides various methods to interact with a storage system. 

1. The `constructor` is used to initialize the class.
2. The `take` method allows you to retrieve items from the storage by specifying a search query, total number of items to retrieve, storage name, and an optional score. It returns a promise that resolves to an array of items matching the specified criteria.
3. The `upsert` method is used to insert or update an item in the storage. It takes an item and a storage name as parameters, and returns a promise that resolves when the operation is complete.
4. The `remove` method allows you to delete an item from the storage based on its ID and storage name. It returns a promise that resolves when the item is successfully removed.
5. The `get` method retrieves a specific item from the storage based on its ID and storage name. It returns a promise that resolves to the requested item.
6. The `list` method allows you to retrieve a list of items from the storage, optionally filtering them using a provided function. It takes the storage name and an optional filter function as parameters, and returns a promise that resolves to an array of items matching the specified criteria.
7. The `clear` method is used to remove all items from a specific storage. It takes the storage name as a parameter and returns a promise that resolves when all items have been successfully removed.

Overall, the `SharedStorageUtils` class provides a set of methods to interact with a storage system, allowing you to retrieve, insert, update, delete, and list items based on various criteria.

## SharedStoragePublicService

The SharedStoragePublicService is a TypeScript class that provides functionality for managing public storage interactions. It implements the TSharedStorageConnectionService interface and includes properties such as loggerService, sharedStorageConnectionService.

The constructor is used to initialize the service. 

The take method retrieves a list of storage data based on a search query and total number of items. It returns a Promise that resolves to an array of IStorageData objects.

The upsert method is used to upsert an item in the storage. It takes an IStorageData object, methodName and storageName as parameters and returns a Promise that resolves when the operation is complete.

The remove method removes an item from the storage based on its ID. It takes StorageId, methodName and storageName as parameters and returns a Promise that resolves when the operation is complete.

The get method retrieves an item from the storage by its ID. It takes StorageId, methodName and storageName as parameters and returns a Promise that resolves to an IStorageData object.

The list method retrieves a list of items from the storage, optionally filtered by a predicate function. It takes methodName, storageName and an optional filter function as parameters. The filter function can be used to specify conditions for the items that should be included in the list. It returns a Promise that resolves to an array of IStorageData objects.

The clear method clears all items from the storage. It takes methodName and storageName as parameters and returns a Promise that resolves when the operation is complete.

## SharedStorageConnectionService

The SharedStorageConnectionService is a TypeScript class that provides functionality for managing storage connections. It implements the `IStorage` interface and has a constructor that initializes properties such as `loggerService`, `busService`, `methodContextService`, `storageSchemaService`, and `embeddingSchemaService`.

The service offers a method called `getStorage` which retrieves a storage instance based on the client ID and storage name. It also provides several other methods:
- `take` retrieves a list of storage data based on a search query and total number of items.
- `upsert` upserts an item in the storage.
- `remove` removes an item from the storage.
- `get` retrieves an item from the storage by its ID.
- `list` retrieves a list of items from the storage, optionally filtered by a predicate function.
- `clear` clears all items from the storage.

These methods allow for efficient management and manipulation of storage data in the SharedStorageConnectionService.

## SharedStateUtils

The SharedStateUtils is a utility class designed for managing state within the agent swarm. It provides methods to retrieve, set, and clear state for a given client and state name. The class uses promises to handle asynchronous operations.

To retrieve the state for a specific client and state name, you can use the `getState` method. This method returns a promise that resolves to the state value.

To set a new state for the given client and state name, you can use the `setState` method. This method accepts a dispatch function, which can be either the new state value or an asynchronous function that returns the new state value. The method returns a promise that resolves when the state is successfully set.

To clear the state and reset it to its initial value, you can use the `clearState` method. This method returns a promise that resolves to the initial state value.

Overall, SharedStateUtils provides a convenient way to manage and manipulate state within the agent swarm environment.

## SharedStatePublicService

The SharedStatePublicService is a class that implements the TSharedStateConnectionService. It has a constructor, loggerService property, and sharedStateConnectionService property. The setState method sets the state using a provided dispatch function, while clearState sets the state to its initial value. The getState method retrieves the current state of the system. All methods require a methodName and stateName parameter to specify the particular state being manipulated.

## SharedStateConnectionService

The `SharedStateConnectionService` is a TypeScript class that provides functionality for managing shared state connections. It implements the `IState<T>` interface. This service uses dependencies such as `loggerService`, `busService`, `methodContextService`, and `stateSchemaService` to perform its operations.

The `constructor` is used to initialize the service.

The `getStateRef` is a memoized function that returns a reference to the shared state. It takes in a `stateName` as input and returns the corresponding `ClientState<any>`.

The `setState` function is used to set the state by dispatching a function that takes in the previous state and returns a promise for the updated state.

The `clearState` function sets the state to its initial value.

The `getState` function retrieves the current state by returning a promise for the state value.

## SessionValidationService

The `SessionValidationService` is a service used for validating and managing sessions in an application. It provides methods to add, remove and manage session data such as agents, history, storage and state usage. The service also allows for session validation and disposal. The service uses several maps to store session data, including `_storageSwarmMap`, `_historySwarmMap`, `_agentSwarmMap`, `_stateSwarmMap` and `_sessionSwarmMap`. The service also has a `loggerService` for logging purposes.

To use the service, you can create an instance of `SessionValidationService` and call its methods as needed. For example, to add a new session, you can use the `addSession` method by providing a client ID, swarm name and session mode. To get the list of all session IDs, you can use the `getSessionList` method. To validate if a session exists, you can use the `validate` method by providing a client ID and source.

Overall, the `SessionValidationService` provides a way to manage and validate sessions in an application, allowing for easy addition and removal of session data as well as validation checks.

## SessionPublicService

The `SessionPublicService` is a Typescript class that provides methods for managing public session interactions. It takes in dependencies such as `loggerService`, `perfService`, `sessionConnectionService`, and `busService`. 

The class has several methods for interacting with the session, including `emit`, `execute`, `run`, `connect`, and various `commit` methods for committing different types of messages to the session. The `dispose` method is used to dispose of the session.

The `emit` method is used to send a message to the session, while `execute` is used to execute a command in the session. The `run` method runs a completion stateless. The `connect` method is used to connect to the session and returns a receive message function.

The `commitToolOutput`, `commitSystemMessage`, and `commitAssistantMessage` methods are used to commit tool output, system messages, and assistant messages to the session respectively. The `commitUserMessage` method is used to commit a user message without an answer. The `commitFlush` method commits a flush of the agent's history, and `commitStopTools` prevents the next tool from being executed.

Finally, the `dispose` method is used to dispose of the session.

## SessionConnectionService

The `SessionConnectionService` is a TypeScript class that manages session connections. It has a constructor which takes no arguments and properties such as `loggerService`, `busService`, `methodContextService`, `swarmConnectionService`, and `swarmSchemaService`. 

The class provides several methods: `getSession` retrieves a memoized session based on `clientId` and `swarmName`, `emit` emits a message to the session, `execute` executes a command in the session, `run` runs completion stateless, and `connect` connects to the session using a provided connector.

The class also has methods to commit different types of messages: `commitToolOutput` commits tool output to the session, `commitSystemMessage` commits a system message to the session, `commitAssistantMessage` commits an assistant message to the session, `commitUserMessage` commits a user message to the agent without answer, `commitFlush` commits user message to the agent without answer, and `commitStopTools` commits user message to the agent without answer.

The `dispose` method disposes of the session connection service.

## SchemaUtils

The `SchemaUtils` is a utility class that provides functions for performing operations related to schemas. It has a constructor that doesn't take any parameters.

The class has three properties: `writeSessionMemory`, `readSessionMemory` and `serialize`. 

The `writeSessionMemory` function allows you to write a value into the session memory for a specific client. You need to provide the `clientId` and the value you want to store.

The `readSessionMemory` function enables you to read a value from the session memory for a given client. You just need to provide the `clientId` and it will return the stored value.

Lastly, `serialize` function is used to serialize an object or an array of objects into a formatted string. This can be useful when you need to convert your data into a string format for storage or transmission.

## PerfService

The PerfService is a performance tracking and logging service that monitors the execution times, input lengths, and output lengths for different client sessions. It uses various services such as loggerService, sessionValidationService, memorySchemaService, swarmValidationService, agentValidationService, statePublicService, swarmPublicService, and stateConnectionService for different functionalities.

The PerfService has properties like loggerService, sessionValidationService, memorySchemaService, swarmValidationService, agentValidationService, statePublicService, swarmPublicService, stateConnectionService, executionScheduleMap, executionOutputLenMap, executionInputLenMap, executionCountMap, executionTimeMap, totalResponseTime, and totalRequestCount. These properties store data related to execution schedules, output lengths, input lengths, execution counts, and total response times.

The PerfService provides methods to get the number of active session executions for a given client, the total execution time for a given client's sessions, the average execution time for a given client's sessions, the average input length for active sessions of a given client, the average output length for active sessions of a given client, the total input length for active sessions of a given client, the total output length for active sessions of a given client, the list of active sessions, the average response time for all requests, the total number of executions, and the total response time for all requests.

The PerfService also allows starting and ending executions for a given client, converts performance measures of clients and all clients for serialization, and disposes of data related to a given client.

## MemorySchemaService

The `MemorySchemaService` is a service that allows you to manage memory schema for different sessions. It provides methods to write, read and dispose of values in the memory map for a given client ID. The `loggerService` is used for logging purposes, while the `memoryMap` holds all memory schema entries. The `writeValue` method allows you to write a value into the memory map for a specific client ID. The `readValue` method retrieves a value from the memory map for a given client ID. Lastly, the `dispose` method is used to dispose of the memory map entry for a specific client ID.

## LoggerUtils

The LoggerUtils is a TypeScript class that implements the ILoggerAdapter and ILoggerControl interfaces. It has a constructor, several properties and methods for logging different levels of information, and a dispose method. The LoggerFactory property is used to create logger instances, while LoggerCallbacks and getLogger are used to configure the logger. The useCommonAdapter, useClientCallbacks, and useClientAdapter methods are used to set up the logger with specific adapters and callbacks. The logClient, infoClient, debugClient, log, debug, and info methods are used to log different levels of information asynchronously. The dispose method is used to clean up resources when the logger instance is no longer needed.

## LoggerService

The LoggerService is a class that implements the ILogger interface, providing methods to log and debug messages. It has a constructor, several properties such as methodContextService and executionContextService, and methods like log, debug, info, and setLogger. The log method logs messages using the current logger, while debug and info log debug messages and info messages respectively. The setLogger method allows you to set a new logger.

## LoggerInstance

The `LoggerInstance` class is an implementation of the `ILoggerInstance` interface. It is constructed with a `clientId` and an optional set of callbacks defined in the `ILoggerInstanceCallbacks` interface. The `clientId` is a unique identifier for the client using this logger instance.

The `callbacks` property allows for customization of the logger's behavior through callback functions.

The `__@LOGGER_INSTANCE_WAIT_FOR_INIT@2065` property is an internal implementation detail and should not be directly accessed or modified.

The `waitForInit` method returns a Promise that resolves when the logger instance is fully initialized.

The `log`, `debug`, and `info` methods are used to log messages with different levels of severity. They accept a `topic` parameter and optional additional arguments to be logged.

## HistoryUtils

The `HistoryUtils` class provides functionality for working with history data in a TypeScript application. It implements the `IHistoryAdapter` and `IHistoryControl` interfaces, allowing for customization and control over the history data.

To use a custom history adapter, you can call the `useHistoryAdapter` method, passing in a constructor for the custom history instance. This allows you to integrate your own custom history implementation into the `HistoryUtils` class.

If you want to use history lifecycle callbacks, you can utilize the `useHistoryCallbacks` method. This allows you to define callback functions that will be triggered at specific points during the history lifecycle.

To push a new message to the history, you can call the `push` method. This asynchronous function takes a message object, client ID, and agent name as parameters. It returns a Promise that resolves when the message has been successfully added to the history.

If you need to dispose of the history for a specific client and agent, you can use the `dispose` method. This asynchronous function takes the client ID and agent name as parameters, and returns a Promise that resolves when the history has been successfully disposed.

To iterate over the history messages, you can call the `iterate` method. This returns an AsyncIterableIterator that allows you to iterate over the history messages asynchronously. The `clientId` and `agentName` parameters specify the client and agent for which you want to retrieve history messages.

## HistoryPublicService

The `HistoryPublicService` is a TypeScript class that implements the `THistoryConnectionService` interface. It is responsible for handling public operations related to the history. The class has a constructor, properties such as `loggerService`, `historyConnectionService`, and methods like `push`, `toArrayForAgent`, `toArrayForRaw`, and `dispose`.

The `push` method allows you to push a message to the history asynchronously. It takes in a `message` object of type `IModelMessage`, the `methodName` as a string, `clientId` as a string, and the `agentName` as a string.

The `toArrayForAgent` method converts the history to an array specifically for a given agent. It takes in the `prompt` as a string, `methodName` as a string, `clientId` as a string, and the `agentName` as a string. It returns an array of `IModelMessage` objects asynchronously.

The `toArrayForRaw` method converts the history to a raw array. It takes in `methodName` as a string, `clientId` as a string, and the `agentName` as a string. It also returns an array of `IModelMessage` objects asynchronously.

The `dispose` method allows you to dispose of the history asynchronously. It takes in `methodName` as a string, `clientId` as a string, and the `agentName` as a string.

Overall, the `HistoryPublicService` provides methods to interact with the history, such as pushing messages, converting history to arrays for specific agents or raw format, and disposing of the history.

## HistoryInstance

The `HistoryInstance` class in TypeScript represents a History Instance and implements the `IHistoryInstance` interface. It has a constructor that takes in `clientId` and `callbacks`, which are used to initialize the instance. The class also has several properties and methods for interacting with the history data.

The `waitForInit` method allows you to wait for the history to initialize, which is useful when you need to ensure that the history data is ready before proceeding with further operations.

The `iterate` method enables you to iterate over the history messages for a specific agent. This is useful when you want to process or display the history messages in a sequential manner.

The `push` method allows you to add a new message to the history for a given agent. This is useful when you want to update the history data with new information.

The `dispose` method allows you to dispose of the history for a given agent. This is useful when you no longer need to access or manipulate the history data for a specific agent.

Overall, the `HistoryInstance` class provides a way to manage and interact with history data in TypeScript applications.

## HistoryConnectionService

The `HistoryConnectionService` is a TypeScript class that implements the `IHistory` interface. It is responsible for managing history connections and provides several methods to interact with the history. The class has properties such as `loggerService`, `busService`, `methodContextService`, and `sessionValidationService` which are used for logging, event bus communication, method context management, and session validation respectively.

The `getHistory` method retrieves the history for a given client and agent. The `push` method is used to push a message to the history. The `toArrayForAgent` method converts the history to an array format for the agent. The `toArrayForRaw` method converts the history to a raw array format. The `dispose` method is used to dispose of the history connection service.

Overall, this class provides a way to manage and interact with the history in a TypeScript application.

## EmbeddingValidationService

The EmbeddingValidationService is a tool used within the agent-swarm to validate embeddings. It has a constructor that initializes the service, and two main properties: loggerService for logging messages, and _embeddingMap to store the embeddings.

To add a new embedding, you can use the `addEmbedding` function, which takes the embedding name and its schema as parameters. This function adds the embedding to the validation service for future use.

To validate if an embedding exists, you can use the `validate` function. This function takes the embedding name and its source as parameters. It checks if the specified embedding exists in the validation service.

Overall, this service helps ensure that the embeddings used within the agent-swarm are valid and properly stored.

## EmbeddingSchemaService

The EmbeddingSchemaService is a service used for managing embedding schemas. It has a constructor, loggerService, registry, and validateShallow properties. The `register` function is used to register an embedding with a given key and value, while the `get` function retrieves an embedding by its key. This service provides a way to manage and access embedding schemas in your application.

## DocService

The `DocService` is a TypeScript service that generates documentation for swarms and agents. It has a constructor that initializes several properties, including `loggerService`, `perfService`, `swarmValidationService`, `agentValidationService`, `swarmSchemaService`, `agentSchemaService`, `toolSchemaService`, `storageSchemaService`, `stateSchemaService`, `agentMetaService`, and `swarmMetaService`. These properties are used to interact with other services and retrieve necessary data for documentation generation.

The `DocService` also provides several methods:
- `writeSwarmDoc` writes documentation for a swarm schema.
- `writeAgentDoc` writes documentation for an agent schema.
- `dumpDocs` dumps the documentation for all swarms and agents.
- `dumpPerfomance` dumps the performance data to a file.
- `dumpClientPerfomance` dumps the client performance data to a file.

These methods are used for generating and saving documentation, as well as performance data analysis.

## CompletionValidationService

The CompletionValidationService is a TypeScript service designed for validating completion names. It has a constructor that initializes the service, and two properties: loggerService for logging purposes, and _completionSet to store the set of completion names.

To add a new completion name to the set, you can use the addCompletion function. This function takes a string parameter representing the completion name.

To validate if a given completion name exists in the set, you can use the validate function. This function takes two parameters: the completion name as a string and the source of the completion. If the completion name exists in the set, it will be validated successfully.

Overall, the CompletionValidationService provides a way to manage and validate completion names in your TypeScript application.

## CompletionSchemaService

The `CompletionSchemaService` is a service that manages completion schemas. It has a constructor, properties like `loggerService`, `registry`, and `validateShallow` for logging, registry management and validation of completion schemas respectively. The `register` function is used to register a new completion schema by providing the key and value, while `get` function retrieves a completion schema by its key. This service allows for efficient management and retrieval of completion schemas.

## ClientSwarm

The ClientSwarm class is an implementation of the ISwarm interface and manages agents within a swarm. It has properties such as `params`, `_agentChangedSubject`, `_activeAgent`, and `_navigationStack` to handle various functionalities. The class provides methods like `navigationPop`, `cancelOutput`, `waitForOutput`, `getAgentName`, `getAgent`, and `setAgentRef` for interacting with the swarm and its agents. The `navigationPop` method pops the navigation stack or returns a default agent, `cancelOutput` cancels the await of output by emitting an empty string, `waitForOutput` waits for output from the active agent, `getAgentName` retrieves the name of the active agent, `getAgent` gets the active agent, and `setAgentRef` sets the reference of an agent in the swarm. The `setAgentName` method sets the active agent by name.

## ClientStorage

The ClientStorage class is an implementation of the IStorage interface, designed to manage storage operations. It has a constructor that takes in parameters defined by the IStorageParams interface for a generic type T. The class has several properties and methods for performing various storage operations.

The _itemMap property is used to store items in the storage. The _createEmbedding method creates an embedding for a given item, which is used to generate embeddings for search purposes. The waitForInit property is a function that waits for the storage to be initialized.

The take method allows you to retrieve a specified number of items based on search criteria. The upsert method is used to insert or update an item in the storage. The remove method removes an item from the storage by its ID. The clear method clears all items from the storage. The get method retrieves an item by its ID. The list method lists all items in the storage, optionally filtered by a predicate. Finally, the dispose method is used to release any resources held by the storage.

## ClientState

The `ClientState` class is an implementation of the `IState<State>` interface, which represents the client's state. It has a constructor that takes in parameters defined by the `IStateParams<State>` interface. The class also has several properties and methods to manage the state.

The `params` property holds the parameters used to initialize the `ClientState` instance. The `_state` property stores the current state of the client. The `dispatch` property is used to dispatch actions that update the state.

The `waitForInit` property is a function that waits for the state to initialize. It can be used in conjunction with the `setState` method to ensure that actions are only dispatched after the state has been initialized.

The `setState` method sets the state using a provided dispatch function. It returns a promise that resolves with the updated state.

The `clearState` method sets the state back to its initial value. It also returns a promise that resolves with the initial state.

The `getState` method retrieves the current state of the client. It returns a promise that resolves with the current state.

The `dispose` method disposes of the state, cleaning up any resources associated with it. It returns a promise that resolves without any value.

Overall, the `ClientState` class provides a way to manage and manipulate the client's state in a reactive manner.

## ClientSession

The `ClientSession` class implements the `ISession` interface and provides various methods for handling session-related operations. It has a constructor that takes in `ISessionParams` as a parameter. The class also has several properties and methods for emitting messages, executing messages with optional emission and execution modes, running completion stateless, committing tool output and user messages without answers, flushing agent history, stopping the next tool execution, committing system and assistant messages, connecting the session to a connector function, and disposing the session.

## ClientHistory

The `ClientHistory` class in TypeScript represents the history of messages exchanged between a client and an agent. It implements the `IHistory` interface and provides several methods to interact with the history.

The constructor of `ClientHistory` takes in a parameter object (`params`) of type `IHistoryParams`. This parameter object is used to configure the history.

The `push` method allows you to add a new message to the history asynchronously. It takes in a message of type `IModelMessage` and returns a Promise that resolves when the message is successfully added.

The `toArrayForRaw` method converts the history into an array of raw messages asynchronously. It returns a Promise that resolves with an array of `IModelMessage` objects.

The `toArrayForAgent` method converts the history into an array of messages suitable for displaying to the agent. It takes in two parameters: `prompt` (a string) and an optional `system` array of strings. The method returns a Promise that resolves with an array of `IModelMessage` objects.

The `dispose` method should be called when the agent is disposed. It asynchronously cleans up any resources associated with the history.

Overall, `ClientHistory` provides a way to manage and interact with the history of messages between a client and an agent in TypeScript.

## ClientAgent

The `ClientAgent` class implements the `IAgent` interface and represents a client agent that interacts with the system. It has a constructor that takes in `IAgentParams` as a parameter. The class has several properties and methods that allow for interaction with the agent, such as emitting output results after validation, resurrecting the model based on a given reason, waiting for output to be available, getting the completion message from the model, committing user and system messages to history, and executing incoming messages. The `dispose` method should be called when the agent is disposed.

## BusService

The BusService is an implementation of the IBus interface that provides event handling functionality. It takes in dependencies such as loggerService and sessionValidationService. The class has several properties including _eventSourceSet, _eventWildcardMap, and getEventSubject.

The constructor is used to initialize the BusService.

The subscribe method allows you to subscribe to events for a specific client and source. It takes in the clientId, source, and a function to handle the events. It returns an unsubscribe function that can be used to stop receiving events.

The once method is similar to subscribe, but it only triggers the function once for a specific client and source.

The emit method allows you to send an event for a specific client. It takes in the clientId and event object, and returns a Promise that resolves when the event is successfully emitted.

The commitExecutionBegin and commitExecutionEnd methods are aliases for emitting the corresponding events. They take in a clientId and an optional context object.

The dispose method allows you to clean up event subscriptions for a specific client. It takes in the clientId and stops receiving events for that client.
