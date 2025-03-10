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

The `ToolSchemaService` is a service that manages tool schemas. It has a constructor, properties such as `loggerService`, `registry`, and `validateShallow`, as well as two methods: `register` and `get`. The `register` method allows you to register a tool with a given key and value, while the `get` method retrieves a tool by its key. The `validateShallow` property is used for validating the state schema.

## SwarmValidationService

The SwarmValidationService is a service that allows for the validation of swarms and their associated agents. It utilizes a loggerService, agentValidationService, and policyValidationService for logging purposes and validating agents and policies respectively. The service also maintains a swarm map (_swarmMap) to keep track of swarms.

To add a new swarm, you can use the `addSwarm` method by providing a swarm name and the corresponding schema. This will add the swarm to the swarm map.

To retrieve a list of agents for a specific swarm, you can use the `getAgentList` method by passing in the swarm name. This will return an array of agent names associated with the swarm.

To retrieve a list of ban policies for a specific swarm, you can use the `getPolicyList` method by passing in the swarm name. This will return an array of policy names associated with the swarm.

To retrieve a list of all swarms, you can use the `getSwarmList` method. This will return an array of swarm names.

To validate a specific swarm and its associated agents, you can use the `validate` method by providing the swarm name and a source. This will validate the swarm, its agents, and any associated policies.

## SwarmSchemaService

The SwarmSchemaService is a service that manages swarm schemas. It has a constructor, loggerService property for logging purposes, registry property to store registered schemas, and validateShallow property for shallow validation of swarm schemas. The service provides two methods: register and get.

The `register` method is used to add a new swarm schema by providing the key and value of the schema. This allows for easy storage and retrieval of swarm schemas.

The `get` method is used to retrieve a swarm schema by its name. Simply pass the key of the desired schema to retrieve it from the registry.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It is designed to manage public swarm interactions, allowing users to interact with swarms in a public context. The class provides various methods to perform actions such as popping the navigation stack, canceling output awaits, waiting for swarm outputs, getting agent names and agents from the swarm, setting agent references and names in the swarm, and disposing of a swarm. These methods are asynchronous and return promises for the respective actions.

## SwarmMetaService

The SwarmMetaService is a service designed to handle swarm metadata. It has a constructor that initializes the loggerService, swarmSchemaService, agentMetaService, and serialize properties. The makeSwarmNode function creates a swarm node with the given swarm name. The toUML function converts the swarm metadata into UML format.

## SwarmConnectionService

The SwarmConnectionService is a TypeScript class that implements the ISwarm interface and manages connections to a swarm. It has properties for the loggerService, busService, methodContextService, agentConnectionService, and swarmSchemaService. The class provides various methods to interact with the swarm, such as retrieving a swarm instance based on client ID and swarm name, popping the navigation stack or returning a default agent, waiting for output from the swarm, retrieving agent name and agent from the swarm, setting the agent reference and name in the swarm, and disposing of the swarm connection.

## StorageValidationService

The StorageValidationService is a service designed to validate storages within the storage swarm. It has a constructor, loggerService property for logging purposes, embeddingValidationService property to validate the embeddings of storages, and a private property _storageMap to store the added storages.

To add a new storage, you can use the `addStorage` method by providing a storage name and its schema. This will add the new storage to the validation service.

To validate an existing storage, you can use the `validate` method by providing a storage name and its source. This will initiate the validation process for that specific storage.

## StorageUtils

The `StorageUtils` class implements the `TStorage` interface and provides various methods to interact with a storage system. It allows you to take, upsert, remove, get, list, and clear items from the storage.

1. `take`: This method takes items from the storage. You need to provide a payload object containing the search query, total number of items to retrieve, client ID, agent name, and storage name. It returns a promise that resolves to an array of items matching the search query.
2. `upsert`: This method upserts an item in the storage. You need to provide a payload object containing the item you want to upsert, client ID, agent name, and storage name. It returns a promise that resolves to `void`.
3. `remove`: This method removes an item from the storage. You need to provide a payload object containing the item ID, client ID, agent name, and storage name. It returns a promise that resolves to `void`.
4. `get`: This method gets an item from the storage. You need to provide a payload object containing the item ID, client ID, agent name, and storage name. It returns a promise that resolves to the item.
5. `list`: This method lists items from the storage. You need to provide a payload object containing the client ID, agent name, storage name, and an optional filter function. It returns a promise that resolves to an array of items matching the filter function or all items if no filter is provided.
6. `clear`: This method clears the storage. You need to provide a payload object containing the client ID, agent name, and storage name. It returns a promise that resolves to `void`.

These methods provide a convenient way to interact with various storage systems in your TypeScript application.

## StorageSchemaService

The StorageSchemaService is a service used for managing storage schemas. It has a constructor, loggerService property for logging purposes, registry property to store registered schemas, and validateShallow property for shallow validation of storage schemas. The service provides two main functions: register and get. The `register` function is used to add a new storage schema by providing the key and value of the schema. The `get` function retrieves a storage schema by its key. This service allows for efficient management and retrieval of storage schemas.

## StoragePublicService

The `StoragePublicService` is a TypeScript class that implements the `TStorageConnectionService` interface. It is responsible for managing interactions with public storage services. The class has a constructor, properties such as `loggerService` and `storageConnectionService`, as well as several methods for interacting with the storage.

The `take` method retrieves a list of storage data based on a search query and total number of items. The `upsert` method upserts an item in the storage. The `remove` method removes an item from the storage. The `get` method retrieves an item from the storage by its ID. The `list` method retrieves a list of items from the storage, optionally filtered by a predicate function. The `clear` method clears all items from the storage. The `dispose` method disposes of the storage.

## StorageConnectionService

The StorageConnectionService is a TypeScript class that manages storage connections. It has a constructor to initialize dependencies and properties such as loggerService, busService, methodContextService, storageSchemaService, sessionValidationService, embeddingSchemaService, sharedStorageConnectionService, _sharedStorageSet. The service provides methods to retrieve, insert, update, remove and list items from the storage. It also allows clearing all items and disposing of the storage connection.

## StateUtils

The `StateUtils` class is a utility for managing state in an agent swarm. It provides methods to retrieve, set, and clear state for a given client and state name. The class is implemented with a generic type `TState` to allow for flexible state types.

To retrieve the current state for a specific client and state name, you can use the `getState` method. This asynchronous function takes a payload object containing the client ID, agent name, and state name as parameters. It returns a promise that resolves to the current state value.

To set a new state for a specific client and state name, you can use the `setState` method. This asynchronous function takes a dispatching function and the payload object. The dispatching function can either be a value or a function that takes the previous state as an argument and returns a promise resolving to the new state.

To clear a specific client's state and set it back to its initial value, you can use the `clearState` method. This asynchronous function takes a payload object containing the client ID, agent name, and state name as parameters. It returns a promise that resolves to the initial state value.

Overall, `StateUtils` provides a convenient way to manage and manipulate state within an agent swarm system.

## StateSchemaService

The `StateSchemaService` is a service used for managing state schemas. It has a constructor, properties such as `loggerService`, `registry` and `validateShallow`, as well as two methods: `register` and `get`. The `register` method is used to add a new state schema by providing the key and value. The `get` method is used to retrieve a state schema by its key. This service allows for efficient management and retrieval of state schemas in a TypeScript application.

## StatePublicService

The `StatePublicService` is an implementation of the `TStateConnectionService` interface. It has a constructor, as well as properties `loggerService` and `stateConnectionService`. 

The class provides three main methods: `setState`, `clearState`, and `getState`. 

The `setState` method sets the state using a provided dispatch function. 

The `clearState` method sets the state to its initial value. 

The `getState` method retrieves the current state. 

Lastly, the `dispose` method disposes of the state.

## StateConnectionService

The `StateConnectionService` is a TypeScript class that manages state connections. It has a constructor which initializes properties such as `loggerService`, `busService`, `methodContextService`, `stateSchemaService`, `sessionValidationService`, and `sharedStateConnectionService`. It also has a private property `_sharedStateSet`.

The class provides a memoized function `getStateRef` to get a state reference. It also has methods `setState`, `clearState`, and `getState` to set, clear, or get the state respectively. These methods return a promise that resolves to the updated state.

Lastly, there is a `dispose` method that disposes the state connection.

This service is used to manage and interact with the state in a TypeScript application.

## SharedStorageUtils

The `SharedStorageUtils` is a TypeScript class that implements the `TSharedStorage` interface. It provides various methods to interact with a storage system. The class has several properties and methods that allow you to take, upsert, remove, get, list, and clear items from the storage.

The `take` method takes items from the storage based on a given payload, which includes search criteria and total number of items to retrieve. It returns a promise that resolves with an array of items matching the search criteria.

The `upsert` method allows you to upsert an item into the storage. It takes an item and a storage name as parameters, and returns a promise that resolves when the item is successfully upserted.

The `remove` method removes an item from the storage based on its ID and a specified storage name. It returns a promise that resolves when the item is successfully removed.

The `get` method retrieves an item from the storage based on its ID and a specified storage name. It returns a promise that resolves with the retrieved item.

The `list` method lists items from the storage based on a specified storage name and an optional filter function. It returns a promise that resolves with an array of items matching the filter criteria.

The `clear` method clears the specified storage, removing all items from it. It returns a promise that resolves when the storage is successfully cleared.

## SharedStoragePublicService

The SharedStoragePublicService is a TypeScript class that implements the TSharedStorageConnectionService and is responsible for managing public storage interactions. It provides various methods to interact with the storage, such as retrieving data based on a search query, upserting items, removing items by their IDs, retrieving specific items by their IDs, listing items with an optional filtering function, and clearing all items from the storage. The service also has properties like loggerService and sharedStorageConnectionService for logging and connecting to the storage respectively.

## SharedStorageConnectionService

The SharedStorageConnectionService is a TypeScript class that provides functionality for managing storage connections. It implements the `IStorage` interface and has a constructor that initializes properties such as `loggerService`, `busService`, `methodContextService`, `storageSchemaService`, and `embeddingSchemaService`.

The service offers a method called `getStorage` which retrieves a storage instance based on the client ID and storage name. It also provides several other methods:
- `take` retrieves a list of storage data based on a search query and total number of items.
- `upsert` upserts an item in the storage.
- `remove` removes an item from the storage.
- `get` retrieves an item from the storage by its ID.
- `list` retrieves a list of items from the storage, optionally filtered by a predicate function.
- `clear` clears all items from the storage.

This service is used to manage and interact with storage connections in a TypeScript application.

## SharedStateUtils

The SharedStateUtils is a utility class designed for managing state within the agent swarm. It provides methods to retrieve, set, and clear state for a given client and state name. The class uses promises to handle asynchronous operations.

To retrieve the state for a specific client and state name, you can use the `getState` method. This method returns a promise that resolves to the state value.

To set a new state for the given client and state name, you can use the `setState` method. This method accepts a dispatch function, which can be either the new state value or an asynchronous function that returns the new state value. The method returns a promise that resolves when the state is successfully set.

To clear the state and reset it to its initial value, you can use the `clearState` method. This method returns a promise that resolves to the initial state value.

Overall, SharedStateUtils provides a convenient way to manage and manipulate state within the agent swarm system.

## SharedStatePublicService

The SharedStatePublicService is a class that implements the TSharedStateConnectionService. It has a constructor, and two properties: loggerService and sharedStateConnectionService. The setState function sets the state using a provided dispatch function, while clearState sets the state to its initial value. The getState function retrieves the current state. All of these functions require a methodName and stateName as parameters.

## SharedStateConnectionService

The `SharedStateConnectionService` is a TypeScript class that provides functionality for managing shared state connections. It implements the `IState<T>` interface. This service utilizes dependencies such as `loggerService`, `busService`, `methodContextService`, and `stateSchemaService`.

The constructor of this class initializes these dependencies. The `getStateRef` property is a memoized function that returns a reference to the shared state. The `setState` method allows you to set the state by providing a dispatch function that takes the previous state and returns a Promise for the updated state. The `clearState` method sets the state to its initial value, and the `getState` method retrieves the current state as a Promise.

Overall, the `SharedStateConnectionService` provides a way to manage and interact with shared state connections in a TypeScript application.

## SessionValidationService

The `SessionValidationService` is a service used for validating and managing sessions in an application. It provides methods to add, remove and manage sessions, agents, history, storage, and state usage. The service also allows for session validation and disposal of session validation cache.

The service has properties such as `loggerService`, which is used for logging, and several `_` prefixed properties that are used to store session data.

To add a new session, you can use the `addSession` method by providing a client ID, swarm name, and session mode. The `addAgentUsage`, `addHistoryUsage`, `addStorageUsage`, and `addStateUsage` methods are used to add agent, history, storage, and state usage to a session respectively.

To remove agent, history, storage, or state usage from a session, you can use the `removeAgentUsage`, `removeHistoryUsage`, `removeStorageUsage`, and `removeStateUsage` methods respectively.

The `getSessionMode` method is used to get the mode of a session by providing a client ID. The `hasSession` method checks if a session exists for the given client ID.

The `getSessionList` method returns the list of all session IDs. The `getSessionAgentList` and `getSessionHistoryList` methods return the list of agents for a session and the history list of agents for a session respectively.

The `getSwarm` method returns the swarm name for a session.

The `validate` method is used to validate if a session exists by providing the client ID and source.

The `removeSession` method removes a session by providing the client ID.

The `dispose` method is used to dispose of the session validation cache by providing the client ID.

## SessionPublicService

The `SessionPublicService` is a Typescript class that provides methods for managing public session interactions. It implements the `TSessionConnectionService` interface. The class has several properties such as `loggerService`, `perfService`, `sessionConnectionService`, and `busService`. 

The class provides methods like `emit`, `execute`, `run`, `connect`, `commitToolOutput`, `commitSystemMessage`, `commitAssistantMessage`, `commitUserMessage`, `commitFlush`, `commitStopTools`, and `dispose`. These methods allow for sending messages, executing commands in the session, connecting to the session, committing tool output and system messages to the session, committing assistant and user messages without an answer, flushing the agent history, preventing the next tool from being executed, and disposing of the session.

## SessionConnectionService

The `SessionConnectionService` is a service that manages session connections. It has properties such as `loggerService`, `busService`, `methodContextService`, `swarmConnectionService`, `policyConnectionService`, and `swarmSchemaService`. 

The service provides methods to retrieve a memoized session based on clientId and swarmName, emit a message to the session, execute commands in the session, connect to the session using a connector, commit tool output to the session, commit system messages and assistant messages to the session, commit user message without answer, flush and stop tools in the session, and dispose of the service.

## SchemaUtils

The `SchemaUtils` is a utility class that provides functions for performing operations related to schemas. It has a constructor that doesn't take any arguments.

The class has three properties: `writeSessionMemory`, `readSessionMemory` and `serialize`.

The `writeSessionMemory` function allows you to write a value into the session memory for a specific client. It takes two arguments: `clientId` (a string representing the client's ID) and `value` (the data you want to write). It returns the written value.

The `readSessionMemory` function enables you to read a value from the session memory for a specific client. It takes one argument: `clientId` (a string representing the client's ID). It returns the value stored in session memory for that client.

The `serialize` function is used to serialize an object or an array of objects into a formatted string. It takes one argument: `data` (the object or array of objects you want to serialize). It returns the serialized string.

## PolicyValidationService

The PolicyValidationService is a tool used within the agent-swarm to validate policies. It provides a way to add new policies and validate existing ones. The service utilizes a loggerService for logging purposes and maintains an internal policyMap to store policies.

To add a new policy, you can use the `addPolicy` function by providing a policy name and its schema. This will add the new policy to the validation service.

To validate a policy, you can use the `validate` function by specifying a policy name and the source of the policy. This will check if the specified policy exists in the validation service.

Overall, this API reference describes the functionality of the PolicyValidationService, including its constructor and properties like `loggerService` and `_policyMap`, as well as the methods for adding and validating policies.

## PolicyUtils

The `PolicyUtils` class in TypeScript provides utility methods for banning and unbanning clients in a distributed system. The constructor initializes the class, while `banClient` and `unbanClient` are asynchronous methods that allow you to ban or unban a client respectively. The `hasBan` method is also asynchronous and checks if a client has been banned by returning a boolean value. The methods take in an object payload containing the client ID, swarm name, and policy name as parameters.

## PolicySchemaService

The PolicySchemaService is a service used for managing policy schemas. It has a constructor, loggerService property for logging purposes, registry property to store registered policy schemas, and validateShallow property for shallow validation of policy schemas. The service provides two main functions: register and get. The `register` function is used to add a new policy schema by providing the key and value of the schema. The `get` function retrieves an existing policy schema by its name.

## PolicyPublicService

The `PolicyPublicService` is a TypeScript class that implements the `TPolicyConnectionService` interface. It is responsible for handling public policy operations, such as checking and managing bans for clients in a specific swarm. The class has properties for `loggerService` and `policyConnectionService`, which are used for logging and connecting to policy services, respectively.

The class provides several methods for interacting with policies:
- `hasBan` checks if a ban message exists for the specified client, swarm, method name, and policy.
- `getBanMessage` retrieves the ban message for a client in a specific swarm.
- `validateInput` validates the input for a specific policy.
- `validateOutput` validates the output for a specific policy.
- `banClient` bans a client from a specific swarm.
- `unbanClient` unbans a client from a specific swarm.

These methods use promises to handle asynchronous operations and return `boolean` or `void` values as appropriate.

## PolicyConnectionService

The `PolicyConnectionService` is a TypeScript class that implements the `IPolicy` interface and manages policy connections. It has a constructor that initializes the logger service, bus service, method context service, policy schema service. The class provides several methods for retrieving policies, checking bans and ban messages for clients in a swarm, validating input and output for clients in a swarm, banning and unbanning clients from a swarm.

The `getPolicy` method retrieves a policy based on the provided policy name. The `hasBan` method checks if a client is banned in a specific swarm. The `getBanMessage` method retrieves the ban message for a client in a swarm. The `validateInput` method validates the input for a client in a swarm. The `validateOutput` method validates the output for a client in a swarm. The `banClient` method bans a client from a swarm, and the `unbanClient` method unbans a client from a swarm.

## PerfService

The PerfService is a performance tracking and logging service that monitors the execution times, input lengths, and output lengths for different client sessions. It uses various services such as loggerService, sessionValidationService, memorySchemaService, swarmValidationService, agentValidationService, statePublicService, swarmPublicService, policyPublicService, stateConnectionService, and executionScheduleMap to store and retrieve data.

The service provides properties like loggerService, sessionValidationService, memorySchemaService, swarmValidationService, agentValidationService, statePublicService, swarmPublicService, policyPublicService, stateConnectionService, executionScheduleMap, executionOutputLenMap, executionInputLenMap, executionCountMap, executionTimeMap, totalResponseTime, and totalRequestCount to access the stored data.

The service also offers methods like getActiveSessionExecutionCount, getActiveSessionExecutionTotalTime, getActiveSessionExecutionAverageTime, getActiveSessionAverageInputLength, getActiveSessionAverageOutputLength, getActiveSessionTotalInputLength, and getActiveSessionTotalOutputLength to retrieve performance data for specific clients. It has methods like getActiveSessions, getAverageResponseTime, and getTotalExecutionCount to retrieve general performance data.

To start and end an execution for a client, the service provides methods startExecution and endExecution. The toClientRecord method converts the performance measures of a specific client for serialization, while the toRecord method converts performance measures of all clients for serialization. Finally, the dispose method is used to discard all data related to a given client.

## MemorySchemaService

The `MemorySchemaService` is a service that allows you to manage memory schemas for different sessions. It provides methods to write, read and dispose of memory map entries for a given client ID. The `loggerService` and `memoryMap` properties are used internally for logging and managing the memory map respectively.

To write a value to the memory map, you can use the `writeValue` method. This method takes a client ID and the value you want to store. It returns the written value, which is of type `T` where `T` extends to an object.

To read a value from the memory map, you can use the `readValue` method. This method takes a client ID and returns the value stored for that specific client. The returned value is also of type `T` where `T` extends to an object.

If you want to dispose of a memory map entry for a given client ID, you can use the `dispose` method. This method takes a client ID and removes the corresponding memory map entry.

Overall, the `MemorySchemaService` provides a way to manage and manipulate memory schemas for different sessions in a structured manner.

## LoggerUtils

The LoggerUtils class is an implementation of the ILoggerAdapter and ILoggerControl interfaces. It has a constructor, several properties and methods for logging messages. The LoggerFactory, LoggerCallbacks and getLogger properties are used internally. The useCommonAdapter, useClientCallbacks and useClientAdapter methods are used to configure the logger. The logClient, infoClient and debugClient methods are used to log messages with different levels of severity, while the log, debug and info methods are aliases for the respective client-specific logging methods. The dispose method is used to clean up resources when the logger instance is no longer needed.

## LoggerService

The LoggerService is a class that implements the ILogger interface, providing methods to log and debug messages. It has a constructor, several properties such as methodContextService and executionContextService, and methods like log, debug, info, and setLogger. The log method logs messages using the current logger, while debug and info log debug messages and information messages, respectively. The setLogger method allows you to set a new logger. This class is useful for logging and debugging purposes in a software application.

## LoggerInstance

The LoggerInstance is a class that implements the ILoggerInstanceCallbacks interface. It has a constructor that takes in two parameters: clientId, a string representing the ID of the client, and callbacks, an object containing optional callback functions.

The clientId property is a string representing the ID of the client.
The callbacks property is an object containing optional callback functions.
The __@LOGGER_INSTANCE_WAIT_FOR_INIT@2250 property is a placeholder for internal use.

The LoggerInstance has two methods: waitForInit and log. The waitForInit method returns a Promise that resolves when the LoggerInstance is initialized. The log method logs a message with the specified topic and any additional arguments.

The LoggerInstance also has two additional methods: debug and info. The debug method logs a debug message with the specified topic and any additional arguments. The info method logs an information message with the specified topic and any additional arguments.

Lastly, the LoggerInstance has a dispose method that cleans up any resources associated with the instance.

## HistoryUtils

The `HistoryUtils` class provides functionality for working with history utilities and implements the `IHistoryAdapter` and `IHistoryControl` interfaces. It has a constructor, several properties and methods for managing history operations.

The `HistoryFactory` and `HistoryCallbacks` properties store any necessary objects for history management. The `getHistory` method retrieves the history. The `useHistoryAdapter` method allows the use of a custom history adapter, while `useHistoryCallbacks` enables the use of history lifecycle callbacks.

The `push` method is used to add a new message to the history, and it returns a Promise. The `dispose` method disposes of the history for a specific client and agent, also returning a Promise.

The `iterate` method allows for iterating over the history messages, returning an `AsyncIterableIterator` object.

## HistoryPublicService

The `HistoryPublicService` is a TypeScript class that implements the `THistoryConnectionService` interface. It is responsible for handling public operations related to the history. The class has a constructor, properties such as `loggerService`, `historyConnectionService`, and methods like `push`, `toArrayForAgent`, `toArrayForRaw`, and `dispose`.

The `push` method allows you to push a message to the history asynchronously. It takes in a `message` object of type `IModelMessage`, the `methodName` as a string, `clientId` as a string, and the `agentName` as a string.

The `toArrayForAgent` method converts the history to an array specifically for a given agent. It takes in the `prompt` as a string, the `methodName` as a string, the `clientId` as a string, and the `agentName` as a string. It returns an array of `IModelMessage` objects asynchronously.

The `toArrayForRaw` method converts the history to a raw array. It takes in the `methodName` as a string, the `clientId` as a string, and the `agentName` as a string. It also returns an array of `IModelMessage` objects asynchronously.

The `dispose` method allows you to dispose of the history asynchronously. It takes in the `methodName` as a string, the `clientId` as a string, and the `agentName` as a string.

Overall, the `HistoryPublicService` class provides methods to interact with the history, such as pushing messages, converting history to arrays for specific agents or raw format, and disposing of the history.

## HistoryInstance

The `HistoryInstance` class in TypeScript represents a History Instance and implements the `IHistoryInstance` interface. It has a constructor that takes in `clientId` and `callbacks`, which are used to initialize the instance. The class also has several properties and methods to interact with the history data.

The `clientId` property stores the ID of the client associated with this history instance, while `callbacks` is an object that contains callback functions for various events related to the history instance. The `_array` property is an array that stores the history messages, and `__@HISTORY_INSTANCE_WAIT_FOR_INIT@525` is a variable used for waiting for the history to initialize.

The `waitForInit` method allows you to wait for the history instance to initialize, which is useful when you need to ensure that the history data is ready before proceeding with further operations. The `iterate` method allows you to iterate over the history messages for a specific agent, providing an asynchronous iterator that you can use to access the messages.

The `push` method is used to add a new message to the history for a given agent, and it returns a promise that resolves once the message has been successfully added. Finally, the `dispose` method is used to dispose of the history for a given agent, which can be useful when you no longer need to access the history data for that agent.

## HistoryConnectionService

The `HistoryConnectionService` is a TypeScript class that implements the `IHistory` interface. It is responsible for managing history connections and provides several methods to interact with the history. The class has a constructor that initializes the logger service, bus service, method context service, and session validation service.

The `getHistory` method retrieves the history for a given client and agent. It also implements `IClearableMemoize` and `IControlMemoize`, which allow for clearing and controlling the memoized history based on specific parameters.

The `push` method pushes a message to the history asynchronously.

The `toArrayForAgent` method converts the history to an array format specifically for agents.

The `toArrayForRaw` method converts the history to a raw array format.

The `dispose` method disposes of the history connection service, releasing any resources associated with it.

## EmbeddingValidationService

The EmbeddingValidationService is a tool used within the agent-swarm to validate embeddings. It has a constructor, loggerService property for logging messages, and a private _embeddingMap property for storing the embeddings. The service allows you to add new embeddings using the `addEmbedding` function, which takes an embedding name and its schema as parameters. The `validate` function is used to check if an embedding exists in the validation service by providing its name and source.

## EmbeddingSchemaService

The EmbeddingSchemaService is a service used for managing embedding schemas. It has a constructor, loggerService property for logging purposes, registry property to store registered embeddings, and validateShallow property for shallow validation of embedding schemas. The service provides two methods: register and get. 

The `register` method is used to register a new embedding with the given key and value. This allows you to store embeddings for later use.

The `get` method is used to retrieve an embedding by its key. This allows you to access previously registered embeddings when needed.

## DocService

The DocService is a TypeScript class that provides functionality for generating documentation and performance data. It uses various services such as loggerService, perfService, swarmValidationService, agentValidationService, swarmSchemaService, agentSchemaService, policySchemaService, toolSchemaService, storageSchemaService, stateSchemaService, agentMetaService and swarmMetaService.

The constructor initializes these services and sets them as properties of the class. The writeSwarmDoc function is used to generate documentation for a swarm schema, while the writeAgentDoc function is used to generate documentation for an agent schema.

The dumpDocs function is used to generate and save the documentation for all swarms and agents, while the dumpPerfomance function is used to generate and save the performance data. The dumpClientPerfomance function is used to generate and save the performance data for a specific client.

Overall, the DocService class provides a way to generate and save documentation and performance data for swarms, agents, and clients.

## CompletionValidationService

The CompletionValidationService is a TypeScript service that allows you to validate the existence of completion names in a set. It has a constructor, which is used to initialize the service. The service also has two properties: `loggerService` and `_completionSet`. 

The `loggerService` property is used for logging messages, while the `_completionSet` property is used to store the set of completion names.

To add a new completion name to the set, you can use the `addCompletion` method. This method takes a string parameter `completionName` and adds it to the set.

To validate if a completion name exists in the set, you can use the `validate` method. This method takes two parameters: `completionName` (a string representing the name to be validated) and `source` (a string representing the source of the completion name). The method will return a boolean value indicating whether the completion name exists in the set or not.

## CompletionSchemaService

The `CompletionSchemaService` is a service used for managing completion schemas. It has a constructor, properties like `loggerService`, `registry`, and `validateShallow` for logging, registry management and validation of completion schemas respectively. The `register` function is used to register a new completion schema by providing the key and value, while `get` function retrieves a completion schema by its key. This service allows for efficient management and retrieval of completion schemas.

## ClientSwarm

The ClientSwarm class is an implementation of the ISwarm interface and manages agents within a swarm. It has several properties and methods to interact with the swarm. The constructor takes in a parameter of type ISwarmParams. The class has properties such as `params`, `_agentChangedSubject`, `_activeAgent`, `_navigationStack`, and `_cancelOutputSubject`. 

The class also has methods like `waitForOutput`, which waits for output from the active agent, `navigationPop`, which pops the navigation stack or returns the default agent, `cancelOutput`, which cancels the await of output by emitting an empty string, `getAgentName`, which gets the name of the active agent, `getAgent`, which gets the active agent, `setAgentRef`, which sets the reference of an agent in the swarm, and `setAgentName`, which sets the active agent by name.

## ClientStorage

The ClientStorage class is an implementation of the IStorage interface and provides methods for managing storage operations. It has a constructor that takes in parameters of type IStorageParams<T> and properties such as _itemMap, _createEmbedding for managing items and creating embeddings respectively. The class also has methods like take, upsert, remove, clear, get and list for performing various storage operations. The dispose method is used to release the state. The waitForInit property is used to wait for the initialization of the storage.

## ClientState

The `ClientState` class represents the client state and implements `IState<State>`. It has a constructor that takes in `IStateParams<State>` as a parameter. The class has properties such as `params`, `_state`, and `dispatch`. The `params` property holds the state parameters, while `_state` stores the current state. The `dispatch` property is a function that dispatches an action and returns the updated state as a promise.

The `ClientState` class also has a method called `waitForInit`, which waits for the state to initialize. It takes a function as an argument and returns a promise. The class provides other methods like `setState`, which sets the state using a provided dispatch function, `clearState`, which sets the state to its initial value, `getState`, which retrieves the current state as a promise, and `dispose`, which disposes of the state.

## ClientSession

The ClientSession class is an implementation of the ISession interface. It has a constructor that takes in parameters of type ISessionParams. The class has several methods and properties that allow for communication with the session.

The `emit` method allows for the emission of a message. The `execute` method executes a message and optionally emits the output. The `run` method runs a completion stateless.

Other methods include `commitToolOutput`, which commits tool output; `commitUserMessage`, which commits a user message without an answer; `commitFlush`, which commits a flush of the agent history; `commitStopTools`, which commits the stop of the next tool execution; `commitSystemMessage`, which commits a system message; and `commitAssistantMessage`, which commits an assistant message.

The `connect` method connects the session to a connector function, and `dispose` should be called when the session is disposed.

## ClientPolicy

The `ClientPolicy` class in this Typescript API Reference represents a client policy that implements the `IPolicy` interface. It allows you to check if a client is banned, get the ban message for a client, validate input and output from/to clients, ban or unban a client. The class takes in parameters through the `IPolicyParams` interface and uses a set called `_banSet` to store banned client IDs.

To use the `ClientPolicy` class, you need to create an instance by passing the required parameters in the constructor. The class provides several methods to interact with the client policy:

1. `hasBan(clientId: SessionId, swarmName: SwarmName): Promise<boolean>` - This method checks if a client is banned by checking the `_banSet` for a match between the provided `clientId` and `swarmName`.
2. `getBanMessage(clientId: SessionId, swarmName: SwarmName): Promise<string>` - This method retrieves the ban message for a client by checking the `_banSet` for a match between the provided `clientId` and `swarmName`.
3. `validateInput(incoming: string, clientId: SessionId, swarmName: SwarmName): Promise<boolean>` - This method validates the input from a client by performing some validation logic on the `incoming` string, `clientId`, and `swarmName`.
4. `validateOutput(outgoing: string, clientId: SessionId, swarmName: SwarmName): Promise<boolean>` - This method validates the output to a client by performing some validation logic on the `outgoing` string, `clientId`, and `swarmName`.
5. `banClient(clientId: SessionId, swarmName: SwarmName): Promise<void>` - This method bans a client by adding the provided `clientId` and `swarmName` to the `_banSet`.
6. `unbanClient(clientId: SessionId, swarmName: SwarmName): Promise<void>` - This method unbans a client by removing the provided `clientId` and `swarmName` from the `_banSet`.

These methods help in managing client policies by checking for bans, retrieving ban messages, validating input and output from/to clients, and banning or unbanning clients as needed.

## ClientHistory

The `ClientHistory` class in TypeScript represents the history of messages exchanged between a client and an AI model. It implements the `IHistory` interface and provides various methods to interact with the history.

The class has a constructor that takes in `IHistoryParams` as a parameter. It also has two properties: `params` and `_filterCondition`. The `params` property stores the parameters for the history, while `_filterCondition` is a filter condition used in the `toArrayForAgent` method.

The class provides four methods: `push`, `toArrayForRaw`, `toArrayForAgent`, and `dispose`. The `push` method adds a message to the history asynchronously. The `toArrayForRaw` method converts the history into an array of raw messages asynchronously. The `toArrayForAgent` method converts the history into an array of messages suitable for the agent, taking into account a prompt and optional system messages. Finally, the `dispose` method should be called when an agent is disposed to clean up any resources associated with the history.

## ClientAgent

The `ClientAgent` class in TypeScript implements the `IAgent` interface and represents a client agent that interacts with the system. It has a constructor that takes in `IAgentParams` as a parameter. The class has several properties and methods to handle agent interactions, executions, outputs, and subject subscriptions.

The `execute` method executes the incoming message and processes tool calls if any. The `run` method runs the completion stateless and returns the output. The `_emitOutput` method emits the output result after validation. The `_resurrectModel` method resurrects the model based on a given reason. The `waitForOutput` method waits for the output to be available. The `getCompletion` method gets the completion message from the model. The `commitUserMessage`, `commitFlush`, `commitAgentChange`, `commitStopTools`, `commitSystemMessage`, `commitAssistantMessage`, and `commitToolOutput` methods commit different types of messages to the history. The `dispose` method should be called on agent disposal.

## BusService

The BusService is an implementation of the IBus interface that provides functionality for event handling and communication between different clients. It utilizes the loggerService, sessionValidationService, and maintains internal properties like _eventSourceSet, _eventWildcardMap and getEventSubject.

The constructor initializes the BusService object. The loggerService and sessionValidationService are used for logging and validation purposes. The _eventSourceSet, _eventWildcardMap and getEventSubject properties are used for event handling.

The subscribe method allows clients to subscribe to specific events by providing a clientId, source and callback function. The once method is similar to subscribe, but only triggers the callback function once. The emit method is used to send events to a specific client.

The commitExecutionBegin and commitExecutionEnd methods are aliases for emitting the execution begin and end events, respectively. The dispose method is used to clean up event subscriptions for a specific client.

## AgentValidationService

The `AgentValidationService` is a service used for validating agents within an agent swarm. It has a constructor that initializes the logger service, tool validation service, completion validation service, and storage validation service. The service also has several properties and methods for managing agents, their dependencies, storages, and states.

The `getAgentList` method returns an array of agent names. The `getStorageList` method retrieves the list of storages used by a specific agent. The `getStateList` method retrieves the list of states used by a specific agent.

The `addAgent` method adds a new agent to the validation service. The `hasStorage`, `hasDependency`, and `hasState` methods are memoized functions used to check if an agent has a registered storage, dependency, or state respectively.

Finally, the `validate` method is used to validate an agent by its name and source.

## AgentSchemaService

The `AgentSchemaService` is a service that manages agent schemas. It has a constructor, properties such as `loggerService`, `registry`, and `validateShallow` for logging, registry management and validation of agent schemas respectively. The `register` function is used to register a new agent schema by providing the key and value of the schema. The `get` function retrieves an agent schema by its name. This service allows for efficient management and retrieval of agent schemas.

## AgentPublicService

The `AgentPublicService` is a Typescript class that implements the `TAgentConnectionService` interface. It is responsible for managing public agent operations, such as creating an agent reference, executing commands on the agent, waiting for output from the agent, and committing messages to the agent's history. The class has several methods for performing these operations, such as `createAgentRef`, `execute`, `waitForOutput`, and others. The class also has properties for the `loggerService` and `agentConnectionService`, which are used for logging and connecting to agents, respectively.

## AgentMetaService

The `AgentMetaService` is a class that provides methods for managing agent meta nodes and converting them to UML format. It has a constructor, properties such as `loggerService`, `agentSchemaService` and `serialize`, as well as methods like `makeAgentNode` and `toUML`.

The `makeAgentNode` method creates a meta node for the given agent, while `makeAgentNodeCommon` does the same but with an optional `seen` parameter. The `toUML` method converts the meta nodes of a specific agent to UML format, with an optional `withSubtree` parameter.

## AgentConnectionService

The `AgentConnectionService` is a Typescript class that manages agent connections and provides methods for executing commands, waiting for output, and committing messages. It implements the `IAgent` interface and has several properties for services such as `loggerService`, `busService`, and others.

The class provides a `getAgent` method for retrieving an agent instance, and several other methods for executing commands (`execute`, `run`), waiting for output (`waitForOutput`), committing messages (`commitToolOutput`, `commitSystemMessage`, `commitAssistantMessage`, `commitUserMessage`), committing agent change (`commitAgentChange`), preventing the next tool execution (`commitStopTools`), committing a flush of agent history (`commitFlush`), and disposing of the agent connection (`dispose`).
