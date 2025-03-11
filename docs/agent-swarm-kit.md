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

The `ToolValidationService` is a service designed for validating tools within an agent-swarm system. It provides a way to add new tools and validate their existence. The service utilizes a loggerService for logging purposes and maintains an internal map, `_toolMap`, to store the added tools.

To add a new tool, you can use the `addTool` function. This function takes two parameters: `toolName`, which is the name of the tool, and `toolSchema`, which represents the schema of the tool.

To validate if a specific tool exists in the validation service, you can use the `validate` function. This function takes two parameters: `toolName`, which is the name of the tool to be validated, and `source`, which represents the source of the tool.

By using these functions, you can effectively manage and validate tools within your agent-swarm system.

## ToolSchemaService

The `ToolSchemaService` is a service that manages tool schemas. It has a constructor, properties like `loggerService`, `registry`, and `validateShallow`. The `loggerService` is used for logging, while the `registry` and `validateShallow` are used for validation.

The `register` function is used to register a tool with the given key and value. The `get` function is used to retrieve a tool by its key.

## SwarmValidationService

The SwarmValidationService is a service designed to validate swarms and their associated agents. It utilizes a loggerService, agentValidationService, and policyValidationService for logging purposes and validating agents and policies respectively. The service also maintains a swarm map (_swarmMap) to keep track of swarms.

To add a new swarm, you can use the `addSwarm` method by providing a swarm name and its schema (swarmSchema). This will add the swarm to the swarm map.

To retrieve a list of agents for a specific swarm, you can use the `getAgentList` method by passing in the swarm name. This will return an array of agent names associated with the swarm.

To retrieve a list of ban policies for a specific swarm, you can use the `getPolicyList` method by passing in the swarm name. This will return an array of policy names associated with the swarm.

To retrieve a list of all swarms, you can use the `getSwarmList` method. This will return an array containing the names of all swarms.

To validate a swarm and its agents, you can use the `validate` method by providing a swarm name and the source code of the swarm. This will perform validation on both the swarm and its agents.

## SwarmSchemaService

The SwarmSchemaService is a service that manages swarm schemas. It has a constructor, loggerService property for logging purposes, registry property to store registered schemas, and validateShallow property for shallow validation of swarm schemas. The service provides two methods: register and get.

The `register` method is used to register a new swarm schema by providing the key and value of the schema. This allows for easy storage and retrieval of swarm schemas.

The `get` method retrieves a swarm schema by its name, allowing for easy access to specific schemas when needed.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It is designed to manage public swarm interactions, allowing users to interact with swarms in a public context. The class provides various methods to perform actions such as popping the navigation stack, canceling output awaits, waiting for swarm outputs, retrieving agent names and agents from swarms, setting agent references and names in the swarm, and disposing of a swarm. These methods are asynchronous and return promises for the corresponding actions. The SwarmPublicService also has properties for the logger service, swarm connection service, and navigationPop method.

## SwarmMetaService

The SwarmMetaService is a service that handles metadata related to swarms. It has a constructor, properties such as loggerService, swarmSchemaService, agentMetaService, serialize and makeSwarmNode. The makeSwarmNode function creates a swarm node with the given swarm name. The toUML function converts the swarm metadata into UML format.

## SwarmConnectionService

The SwarmConnectionService is a TypeScript class that implements the ISwarm interface and provides functionality for managing swarm connections. It has a constructor that initializes the service with dependencies such as loggerService, busService, methodContextService, agentConnectionService, and swarmSchemaService.

The service provides several methods for interacting with swarms. The getSwarm method retrieves a swarm instance based on the client ID and swarm name. The navigationPop method pops the navigation stack or returns a default agent. The cancelOutput method cancels the await of output by emitting an empty string. The waitForOutput method waits for output from the swarm. The getAgentName method retrieves the agent name from the swarm. The getAgent method retrieves the agent from the swarm. The setAgentRef method sets the agent reference in the swarm. The setAgentName method sets the agent name in the swarm. Finally, the dispose method is used to dispose of the swarm connection.

## StorageValidationService

The StorageValidationService is a service designed to validate storages within the storage swarm. It contains a constructor, properties such as loggerService, embeddingValidationService and _storageMap, as well as two methods: addStorage and validate. 

The `addStorage` method is used to add a new storage to the validation service. It takes two parameters: `storageName`, which is the name of the storage to be added, and `storageSchema`, which is an object containing the schema for the storage data.

The `validate` method is used to validate a storage by its name and source. It takes two parameters: `storageName`, which is the name of the storage to be validated, and `source`, which is the source of the storage to be validated.

## StorageUtils

The `StorageUtils` is a TypeScript class that implements the `TStorage` interface. It provides several methods for interacting with a storage system. These methods include `take`, `upsert`, `remove`, `get`, `list`, and `clear`.

The `take` method allows you to retrieve items from the storage by specifying a search query, total number of items to retrieve, client ID, agent name, and storage name. It returns a promise that resolves to an array of items matching the specified criteria.

The `upsert` method enables you to insert or update an item in the storage. You need to provide the item data, client ID, agent name, and storage name. It returns a promise that resolves when the operation is complete.

The `remove` method allows you to delete an item from the storage based on its ID, client ID, agent name, and storage name. It returns a promise that resolves when the deletion is successful.

The `get` method retrieves a specific item from the storage based on its ID, client ID, agent name, and storage name. It returns a promise that resolves to the requested item.

The `list` method enables you to retrieve a list of items from the storage based on specified criteria. You can provide a filter function to narrow down the results. It returns a promise that resolves to an array of items matching the specified criteria.

The `clear` method allows you to delete all items from the storage. You need to specify the client ID, agent name, and storage name. It returns a promise that resolves when the clearing operation is complete.

## StorageSchemaService

The StorageSchemaService is a service used for managing storage schemas. It has a constructor, loggerService property for logging purposes, registry property to store registered schemas, and validateShallow property for shallow validation of storage schemas. The service provides two main functions: register and get. The `register` function is used to add a new storage schema by providing the key and value, while `get` function retrieves a storage schema by its key. This service allows for efficient management and retrieval of storage schemas.

## StoragePublicService

The StoragePublicService is a service that handles interactions with public storage. It implements the TStorageConnectionService interface and provides methods for managing storage data. The service has properties such as loggerService and storageConnectionService for logging and managing connections to the storage, respectively.

The StoragePublicService offers several methods:
- `take` retrieves a list of storage data based on a search query and total number of items.
- `upsert` upserts an item in the storage.
- `remove` removes an item from the storage.
- `get` retrieves an item from the storage by its ID.
- `list` retrieves a list of items from the storage, optionally filtered by a predicate function.
- `clear` clears all items from the storage.
- `dispose` disposes of the storage.

These methods allow for efficient management and manipulation of data stored in the public storage.

## StorageConnectionService

The StorageConnectionService is a TypeScript class that manages storage connections. It has a constructor to initialize dependencies and properties such as loggerService, busService, methodContextService, storageSchemaService, sessionValidationService, embeddingSchemaService, sharedStorageConnectionService, _sharedStorageSet. 

The service provides several methods to interact with the storage:
1. getStorage(): Retrieves a storage instance based on client ID and storage name.
2. take(): Retrieves a list of storage data based on a search query and total number of items.
3. upsert(): Upserts an item in the storage.
4. remove(): Removes an item from the storage by its ID.
5. get(): Retrieves an item from the storage by its ID.
6. list(): Retrieves a list of items from the storage, optionally filtered by a predicate function.
7. clear(): Clears all items from the storage.
8. dispose(): Disposes of the storage connection.

These methods allow for efficient management and manipulation of storage data in a TypeScript application.

## StateUtils

The `StateUtils` class is a utility for managing state in an agent swarm. It provides methods to retrieve, set, and clear state for a given client and state name. The `getState` method allows you to retrieve the state for a specific client and state name, while the `setState` method sets a new state value for the given client and state name. The `clearState` method sets the state back to its initial value. All methods return a Promise, allowing you to handle asynchronous operations.

## StateSchemaService

The `StateSchemaService` is a service used for managing state schemas. It has a constructor, properties such as `loggerService`, `registry` and `validateShallow`, as well as two methods: `register` and `get`. The `register` method is used to add a new state schema by providing the key and value, while `get` method retrieves a state schema by its key. This service helps in organizing and managing state schemas efficiently.

## StatePublicService

The `StatePublicService` class is an implementation of the `TStateConnectionService` interface. It has a constructor, as well as properties `loggerService` and `stateConnectionService`. 

The class provides three main methods: `setState`, `clearState`, and `getState`. 

The `setState` method sets the state using a provided dispatch function. It returns a promise that resolves to the updated state.

The `clearState` method sets the state to its initial value. It also returns a promise that resolves to the initial state.

The `getState` method retrieves the current state. It returns a promise that resolves to the current state.

Lastly, there is the `dispose` method which disposes of the state. It returns a promise that resolves to `void`.

## StateConnectionService

The `StateConnectionService` is a TypeScript class that manages state connections. It implements the `IState<T>` interface and provides several methods for working with state data. The class has several properties, including `loggerService`, `busService`, `methodContextService`, `stateSchemaService`, `sessionValidationService`, and `sharedStateConnectionService`. These properties are used for various functionalities within the class.

The `getStateRef` is a memoized function that returns a state reference given a client ID and state name. It helps to avoid unnecessary computations by caching the results.

The `setState` method sets the state by dispatching a function that takes the previous state as an argument and returns a promise that resolves to the updated state.

The `clearState` method sets the state to its initial value.

The `getState` method retrieves the current state by returning a promise that resolves to the current state.

The `dispose` method disposes of the state connection, releasing any resources associated with it.

Overall, the `StateConnectionService` provides a way to manage and interact with state data in TypeScript applications.

## SharedStorageUtils

The `SharedStorageUtils` is a TypeScript class that implements the `TSharedStorage` interface. It provides various methods to interact with a storage system.

1. The `constructor` is used to initialize the class.
2. The `take` method allows you to retrieve items from the storage by specifying a search query, total number of items to retrieve, storage name, and an optional score. It returns a Promise of the retrieved items as an array.
3. The `upsert` method is used to upsert (update or insert) an item in the storage. It takes the item to be upserted, storage name, and returns a Promise that resolves when the operation is complete.
4. The `remove` method allows you to remove an item from the storage by providing its ID and the storage name. It returns a Promise that resolves when the item is successfully removed.
5. The `get` method retrieves a specific item from the storage by providing its ID and the storage name. It returns a Promise that resolves with the retrieved item.
6. The `list` method allows you to list items from the storage by specifying a filter function. It takes the storage name and an optional filter function that determines which items to include in the list. It returns a Promise of the listed items as an array.
7. The `clear` method is used to clear the entire storage for a given storage name. It returns a Promise that resolves when the storage is successfully cleared.

These methods provide a way to interact with storage systems in TypeScript, allowing you to perform various operations such as retrieving, inserting, updating, removing, and listing items in a storage.

## SharedStoragePublicService

The SharedStoragePublicService is a TypeScript class that implements the TSharedStorageConnectionService and is responsible for managing public storage interactions. It provides methods to interact with the shared storage, such as retrieving data based on a search query, upserting (insert or update) data in the storage, removing items from the storage by their IDs, retrieving items from the storage by their IDs, listing all items in the storage (optionally filtered), and clearing all items from the storage. The class also has properties for a loggerService and sharedStorageConnectionService, which are used for logging and connecting to the shared storage, respectively.

## SharedStorageConnectionService

The SharedStorageConnectionService is a service that manages storage connections and implements the IStorage interface. It has a constructor that initializes the loggerService, busService, methodContextService, storageSchemaService, and embeddingSchemaService. The service provides several methods for interacting with storage data, such as retrieving a storage instance based on client ID and storage name, retrieving a list of storage data based on search query and total number of items, upserting an item in the storage, removing an item from the storage by its ID, retrieving an item from the storage by its ID, retrieving a list of items from the storage optionally filtered by a predicate function, and clearing all items from the storage.

## SharedStateUtils

The `SharedStateUtils` is a utility class designed for managing state within the agent swarm. It provides methods to retrieve, set, and clear state for a given client and state name. The class uses promises to handle asynchronous operations.

To retrieve the state for a specific client and state name, you can use the `getState` method. This method returns a promise that resolves to the state value.

To set a new state for the given client and state name, you can use the `setState` method. This method accepts a dispatch function, which can either be the new state value or an asynchronous function that returns the new state value. The method returns a promise that resolves when the state is successfully set.

To clear the state and reset it to its initial value, you can use the `clearState` method. This method returns a promise that resolves to the initial state value.

Overall, `SharedStateUtils` provides a convenient way to manage and manipulate state within the agent swarm system.

## SharedStatePublicService

The `SharedStatePublicService` is a class that implements the `TSharedStateConnectionService` interface. It has a constructor, and two properties: `loggerService` and `sharedStateConnectionService`.

The class provides three methods: `setState`, `clearState`, and `getState`. 

The `setState` method sets the state using a provided dispatch function. It takes three parameters: `dispatchFn`, which is a function that takes the previous state and returns a promise for the new state, `methodName`, which is a string representing the method name, and `stateName`, which is a string representing the state name.

The `clearState` method sets the state to its initial value. It takes two parameters: `methodName`, which is a string representing the method name, and `stateName`, which is a string representing the state name.

The `getState` method gets the current state. It takes two parameters: `methodName`, which is a string representing the method name, and `stateName`, which is a string representing the state name.

## SharedStateConnectionService

The `SharedStateConnectionService` is a TypeScript class that provides functionality for managing shared state connections. It implements the `IState<T>` interface. This service utilizes several dependencies such as `loggerService`, `busService`, `methodContextService`, and `stateSchemaService`.

The constructor of this class does not take any parameters.

The `getStateRef` property is a memoized function that returns a reference to the shared state. It takes in a `stateName` parameter and returns a `ClientState<any>`.

The `setState` property is a function that sets the state by dispatching an asynchronous function. It takes in a `dispatchFn` parameter, which is a function that takes the previous state and returns a promise resolving to the updated state.

The `clearState` property is a function that sets the state to its initial value asynchronously.

The `getState` property is a function that retrieves the current state asynchronously.

Overall, the `SharedStateConnectionService` provides methods to manage and interact with shared state connections in a TypeScript application.

## SessionValidationService

The `SessionValidationService` is a service used for validating and managing sessions in an application. It allows you to add, remove and manage sessions along with their associated agents, history, storage and state usages. The service also provides methods to get the session mode, check if a session exists and retrieve the list of sessions, agents for a session and history list of agents. The `validate` method is used to check if a session exists, and the `dispose` method is used to dispose a session validation cache.

## SessionPublicService

The `SessionPublicService` is a Typescript class that provides methods for managing public session interactions. It implements the `TSessionConnectionService` interface. The class has several properties, including `loggerService`, `perfService`, `sessionConnectionService`, and `busService`. 

The class provides methods such as `emit`, `execute`, `run`, `connect`, `commitToolOutput`, `commitSystemMessage`, `commitAssistantMessage`, `commitUserMessage`, `commitFlush`, `commitStopTools`, and `dispose`. These methods allow for sending messages, executing commands in the session, connecting to the session, committing tool output and system messages to the session, committing assistant and user messages without an answer, flushing the agent history, preventing the next tool from being executed, and disposing of the session.

## SessionConnectionService

The `SessionConnectionService` is a service that manages session connections and provides methods to interact with the sessions. It takes in dependencies such as `loggerService`, `busService`, `methodContextService`, `swarmConnectionService`, `policyConnectionService`, and `swarmSchemaService`. 

The service provides a method `getSession` to retrieve a memoized session based on the clientId and swarmName. It also has methods like `emit`, `execute`, and `run` to send messages, execute commands in the session, and run completion stateless respectively.

To connect to the session, you can use the `connect` method which takes a connector and clientId, returning a receive message function. The service also provides methods like `commitToolOutput`, `commitSystemMessage`, `commitAssistantMessage`, and `commitUserMessage` to commit different types of messages to the session.

To clean up and dispose of the session connection service, you can use the `dispose` method.

## SchemaUtils

The `SchemaUtils` is a utility class that provides functions for performing operations related to schemas. It has a constructor that does not take any arguments. The class has two properties: `writeSessionMemory` and `readSessionMemory`.

The `writeSessionMemory` property is a function that writes a value to the session memory for a given client. It takes two arguments: `clientId` (a string representing the client's ID) and `value` (the data to be written). It returns the value that was written.

The `readSessionMemory` property is a function that reads a value from the session memory for a given client. It takes one argument: `clientId` (a string representing the client's ID). It returns the value stored in session memory for that client.

The `serialize` property is a function that serializes an object or an array of objects into a formatted string. It takes two arguments: `data` (the object or array to be serialized) and `map` (an optional mapping function to transform keys or values before serialization). It returns a formatted string representation of the serialized data.

## PolicyValidationService

The PolicyValidationService is a tool used within the agent-swarm to validate policies. It provides a way to add new policies and validate existing ones. The service utilizes a loggerService for logging purposes and maintains an internal policyMap to store the policies.

To use this service, you can create an instance of the PolicyValidationService and pass in a loggerService object. The constructor initializes the internal policyMap and sets up any necessary configurations.

To add a new policy, you can use the `addPolicy` method by providing a policy name and the corresponding policySchema. This will add the new policy to the validation service for future use.

To validate an existing policy, you can use the `validate` method by specifying the policy name and the source of the policy. This method will check if the specified policy exists in the validation service and perform any necessary validations.

Overall, the PolicyValidationService provides a way to manage and validate policies within the agent-swarm system.

## PolicyUtils

The `PolicyUtils` class in TypeScript provides utility methods for banning and unbanning clients in a distributed system. The constructor initializes the class, while `banClient` and `unbanClient` are asynchronous methods that allow you to ban or unban a client by providing the necessary parameters such as `clientId`, `swarmName`, and `policyName`. The `hasBan` method is also an asynchronous function that checks if a client is currently banned by providing the same parameters.

## PolicySchemaService

The `PolicySchemaService` is a service that allows for managing policy schemas. It has a constructor, properties such as `loggerService`, `registry`, and `validateShallow` for logging, registry management and shallow validation of policy schemas respectively. The `register` function is used to add a new policy schema by providing the key and value, while `get` function retrieves an existing policy schema by its name.

## PolicyPublicService

The `PolicyPublicService` is a TypeScript class that implements the `TPolicyConnectionService` interface. It is responsible for handling public policy operations, such as checking and managing bans for clients in specific swarms. The class has properties for `loggerService` and `policyConnectionService`, which are used for logging and connecting to policy services, respectively.

The `hasBan` method checks if a ban message exists for the specified client in a specific swarm. The `getBanMessage` method retrieves the ban message for a client in a specific swarm. The `validateInput` method validates the input for a specific policy, while `validateOutput` validates the output for a specific policy.

The `banClient` method bans a client from a specific swarm, and the `unbanClient` method unbans a client from a specific swarm.

Overall, the `PolicyPublicService` class provides methods to handle various policy-related operations, such as checking for bans, retrieving ban messages, and managing client bans in specific swarms.

## PolicyConnectionService

The `PolicyConnectionService` is a TypeScript class that implements the `IPolicy` interface and manages policy connections. It has a constructor that initializes the logger service, bus service, method context service, policy schema service. The class provides several methods to retrieve, validate and manage policies for clients in a swarm.

The `getPolicy` method retrieves a policy based on the provided policy name. The `hasBan` method checks if a client is banned in a specific swarm. The `getBanMessage` method retrieves the ban message for a client in a swarm. The `validateInput` and `validateOutput` methods validate the input and output for a client in a swarm, respectively. The `banClient` method bans a client from a swarm, and the `unbanClient` method unbans a client from a swarm.

Overall, the `PolicyConnectionService` class provides a set of methods to manage policy connections, validate inputs and outputs for clients in a swarm, and handle bans for clients in a swarm.

## PerfService

The PerfService is a performance tracking and logging service that monitors the execution times, input lengths, and output lengths for different client sessions. It uses various services such as loggerService, sessionValidationService, memorySchemaService, swarmValidationService, agentValidationService, statePublicService, swarmPublicService, policyPublicService, stateConnectionService, and executionScheduleMap to perform its functions.

The constructor initializes the service with these dependencies. The properties of this class include the aforementioned services, as well as maps for tracking execution counts, output lengths, input lengths, and execution times. It also tracks the total response time and request count.

The service provides several methods to retrieve performance data. These include getting the number of active session executions for a given client, the total and average execution times for a given client's sessions, the average input and output lengths for active sessions of a given client, and the total input and output lengths for active sessions of a given client. It also provides methods to get the list of active sessions, the average response time for all requests, and the total number of executions.

To start and end an execution for a given client, the service provides the startExecution and endExecution methods. The toClientRecord method converts the performance measures of a specific client for serialization, while the toRecord method does so for all clients. Finally, the dispose method is used to discard all data related to a given client.

## MemorySchemaService

The MemorySchemaService is a service that allows you to manage memory schema for different sessions. It provides methods to write, read and dispose of values in the memory map for a given client ID. The loggerService is used for logging, while the memoryMap stores all the data. The writeValue method allows you to write a value to the memory map for a specific client ID, while readValue retrieves the value for a given client ID. The dispose method is used to remove the memory map entry for a specific client ID.

## LoggerUtils

The `LoggerUtils` is a TypeScript class that implements `ILoggerAdapter` and `ILoggerControl`. It has a constructor, several properties and methods for logging different levels of information, as well as a dispose method. The class uses `LoggerFactory`, `LoggerCallbacks` and a `getLogger` method to provide logging functionality. The `useCommonAdapter`, `useClientCallbacks` and `useClientAdapter` methods allow for customization of the logging adapter and callbacks. The `logClient`, `infoClient` and `debugClient` methods are used for logging different levels of information from a client, while the `log`, `debug` and `info` methods provide a more concise way to log information. The `dispose` method is used to clean up resources when a client is no longer needed.

## LoggerService

The `LoggerService` is a class that implements the `ILogger` interface, providing methods to log and debug messages. It has a constructor, several properties including `methodContextService`, `executionContextService`, `_commonLogger`, and a `getLoggerAdapter` method that creates the client logs adapter using a factory. The `log`, `debug`, and `info` methods are used to log different types of messages using the current logger. The `setLogger` method allows you to set a new logger.

## LoggerInstance

The `LoggerInstance` class is an implementation of the `ILoggerInstance` interface. It is constructed with a `clientId` and an optional set of callbacks defined in the `ILoggerInstanceCallbacks` interface. The `clientId` is a unique identifier for the client using this logger instance.

The `callbacks` property allows for custom callback functions to be added, which can handle events such as log messages being received or errors occurring.

The `__@LOGGER_INSTANCE_WAIT_FOR_INIT@2279` property is an internal variable used for waiting until the logger instance is initialized.

The `waitForInit` method returns a Promise that resolves when the logger instance is initialized. This can be useful for ensuring that logging operations are not performed until the instance is ready.

The `log`, `debug`, and `info` methods are used to log messages of different levels. The `topic` parameter specifies the category or context of the log message, and `args` is an array of additional arguments to be included in the log message. These methods can be used to output information, debug statements, or informational messages to the console.

The `dispose` method is used to clean up any resources associated with the logger instance and release memory. This should be called when the logger instance is no longer needed to ensure proper resource management.

## HistoryUtils

The `HistoryUtils` class provides functionality for managing and interacting with a history of messages. It implements the `IHistoryAdapter` and `IHistoryControl` interfaces. The class has a constructor, several properties and methods for interacting with the history.

The `HistoryFactory` and `HistoryCallbacks` properties store any custom history factory and lifecycle callbacks, respectively. The `getHistory` method retrieves the history of messages.

To use a custom history adapter, you can call the `useHistoryAdapter` method, passing in a constructor for the custom history instance. Similarly, to use history lifecycle callbacks, you can call the `useHistoryCallbacks` method, passing in a set of callback functions.

The `push` method allows you to add a new message to the history, returning a Promise that resolves when the message is successfully added. The `pop` method retrieves the last message from the history, again returning a Promise. The `dispose` method allows you to dispose of the history for a specific client and agent, returning a Promise when the disposal is complete.

The `iterate` method provides an asynchronous iterator over the history messages, allowing you to iterate through them in a loop or other iteration construct.

## HistoryPublicService

The `HistoryPublicService` is a TypeScript class that implements the `THistoryConnectionService` interface. It is responsible for handling public operations related to the history. The class has a constructor, properties such as `loggerService`, `historyConnectionService`, and methods like `push`, `pop`, `toArrayForAgent`, `toArrayForRaw`, and `dispose`.

The `push` method allows you to push a message to the history asynchronously. The `pop` method also pushes a message to the history but returns the pushed message asynchronously. The `toArrayForAgent` method converts the history into an array specifically for a given agent. The `toArrayForRaw` method converts the history into a raw array. Lastly, the `dispose` method allows you to dispose of the history asynchronously.

## HistoryInstance

The `HistoryInstance` class in TypeScript represents a History Instance and implements the `IHistoryInstanceCallbacks` interface. It has a constructor that takes in `clientId` and an optional set of callbacks. The class also has properties such as `clientId`, `callbacks`, and private properties like `_array` for storing history messages and a `__@HISTORY_INSTANCE_WAIT_FOR_INIT@537` property for making a singleshot initialization.

The class provides several methods: `waitForInit` to wait for the history to initialize, `iterate` to iterate over the history messages for a given agent, `push` to add new messages to the history for a given agent, `pop` to remove the last message from a history, and `dispose` to dispose of the history for a given agent.

## HistoryConnectionService

The `HistoryConnectionService` is a TypeScript class that implements the `IHistory` interface. It is responsible for managing history connections and provides various methods to interact with the history. The class has a constructor that initializes the logger service, bus service, method context service, and session validation service.

The `getHistory` method retrieves the history for a specific client and agent. The `push` method allows you to push a message to the history asynchronously. The `pop` method pops a message from the history asynchronously. The `toArrayForAgent` method converts the history to an array format for the agent. The `toArrayForRaw` method converts the history to a raw array format. Finally, the `dispose` method disposes of the history connection service.

## EmbeddingValidationService

The EmbeddingValidationService is a tool used within the agent-swarm to validate embeddings. It has a constructor, loggerService property for logging messages or errors, and a private _embeddingMap property for storing the embeddings. The service allows you to add new embeddings using the `addEmbedding` function, which takes the embedding name and its schema as parameters. The `validate` function checks if a given embedding exists in the validation service by providing its name and source. This helps ensure that the embeddings being used are valid and properly defined.

## EmbeddingSchemaService

The EmbeddingSchemaService is a service used for managing embedding schemas. It has a constructor, loggerService, registry and validateShallow properties. The `register` function is used to register an embedding with a given key and value, while the `get` function retrieves an embedding by its key. This service provides a way to manage and access embedding schemas in the system.

## DocService

The `DocService` is a TypeScript class that provides functionality for generating documentation and performance data. It takes in several services as properties, including `loggerService`, `perfService`, `swarmValidationService`, `agentValidationService`, `swarmSchemaService`, `agentSchemaService`, `policySchemaService`, `toolSchemaService`, `storageSchemaService`, `stateSchemaService`, `agentMetaService`, and `swarmMetaService`. 

The class has several methods: `writeSwarmDoc` for writing documentation for a swarm schema, `writeAgentDoc` for writing documentation for an agent schema, `dumpDocs` for dumping the documentation for all swarms and agents, `dumpPerfomance` for dumping the performance data to a file, and `dumpClientPerfomance` for dumping the client performance data to a file. 

In summary, the `DocService` is a TypeScript class that provides methods for generating documentation and performance data related to swarms, agents, and their respective schemas.

## CompletionValidationService

The CompletionValidationService is a service that allows you to validate completion names. It has a constructor that initializes the service, and two properties: loggerService for logging purposes, and _completionSet to store the completion names.

To add a new completion name to the set, you can use the addCompletion function. This function takes a completion name as an argument and adds it to the set.

To validate if a completion name exists in the set, you can use the validate function. This function takes a completion name and the source of the completion as arguments, and returns a boolean indicating whether the completion name is valid or not.

## CompletionSchemaService

The `CompletionSchemaService` is a service that manages completion schemas. It has a constructor, properties like `loggerService`, `registry` and `validateShallow`, as well as two methods: `register` and `get`. The `register` method is used to add a new completion schema by providing a key and the corresponding `ICompletionSchema` object. The `get` method retrieves a completion schema by its key. This service allows for efficient management and retrieval of completion schemas.

## ClientSwarm

The ClientSwarm class is an implementation of the ISwarm interface that manages agents within a swarm. It has properties such as `params`, `_agentChangedSubject`, `_activeAgent`, and `_navigationStack` to handle various functionalities. The class also provides methods like `navigationPop`, `cancelOutput`, `getAgentName`, `getAgent`, `setAgentRef`, and `setAgentName` to interact with the swarm and its agents. The `waitForOutput` property allows waiting for output from the active agent.

## ClientStorage

The ClientStorage class is an implementation of the IStorage interface and provides methods to manage storage operations. It has a constructor that takes in parameters of type IStorageParams<T> and properties such as _itemMap, _createEmbedding for managing items and creating embeddings respectively.

The class also has methods like take, upsert, remove, clear, get and list to perform various storage operations such as taking a specified number of items based on search criteria, upserting an item into the storage, removing items from the storage, clearing all items from the storage, getting an item by its ID and listing all items in the storage, optionally filtered by a predicate.

The dispose method is used to dispose of the state. The class also has a waitForInit property that is used to wait for the initialization of the storage.

## ClientState

The `ClientState` class represents the client state and implements `IState<State>`. It has a constructor that takes in `IStateParams<State>` as a parameter. The class has properties such as `params`, `_state`, and `dispatch`. The `params` property holds the state parameters, while `_state` stores the current state. The `dispatch` property allows for dispatching actions and returns a promise of the updated state.

The `ClientState` class also has a method called `waitForInit`, which waits for the state to initialize. It has a `setState` method that sets the state using a provided dispatch function and returns a promise of the updated state. The `clearState` method sets the state to its initial value, and `getState` retrieves the current state as a promise. Lastly, `dispose` is a method that disposes of the state.

## ClientSession

The ClientSession class is an implementation of the ISession interface. It has a constructor that takes in parameters of type ISessionParams. The class has properties such as `params` and `_emitSubject`, which is a Subject of type string.

The class also has several methods: `emit`, which emits a message and returns a Promise; `execute`, which executes a message, optionally emits the output and returns a Promise; `run`, which runs the completion stateless and returns a Promise; `commitToolOutput`, which commits tool output and returns a Promise; `commitUserMessage`, which commits user message without answer and returns a Promise; `commitFlush`, which commits flush of agent history and returns a Promise; `commitStopTools`, which commits stop of the next tool execution and returns a Promise; `commitSystemMessage`, which commits a system message and returns a Promise; `commitAssistantMessage`, which commits an assistant message and returns a Promise; `connect`, which connects the session to a connector function and returns a receive message function; `dispose`, which should be called on session dispose and returns a Promise.

## ClientPolicy

The `ClientPolicy` class in this Typescript API Reference represents a client policy that implements the `IPolicy` interface. It is used to manage client bans, validate input and output from clients, and handle client bans and unbans.

The class has a constructor that takes in `IPolicyParams` as a parameter. It also has properties such as `params` and `_banSet`, which is a set containing the banned client IDs.

The class provides several methods to interact with client policies. `hasBan` checks if a client is banned by checking the `_banSet` property. The `getBanMessage` method retrieves the ban message for a client. `validateInput` and `validateOutput` methods validate the input and output from a client, respectively. `banClient` and `unbanClient` methods are used to ban and unban clients, respectively.

Overall, the `ClientPolicy` class provides functionality to manage client bans, validate input and output from clients, and handle client bans and unbans in a Typescript environment.

## ClientHistory

The `ClientHistory` class in TypeScript represents the history of client messages and implements the `IHistory` interface. It has a constructor that takes in `IHistoryParams` as a parameter. The class has properties such as `params` and `_filterCondition`, which is a filter condition used in the `toArrayForAgent` method.

The class also has several methods: `push`, which pushes a message to the history asynchronously; `pop`, which pops a message from the history asynchronously; `toArrayForRaw`, which converts the history to an array of raw messages asynchronously; `toArrayForAgent`, which converts the history to an array of messages for the agent, taking in a prompt and optionally an array of system messages as parameters; and `dispose`, which should be called when the agent is disposed.

## ClientAgent

The `ClientAgent` class is an implementation of the `IAgent` interface, representing a client agent that interacts with the system. It has a constructor that takes in `IAgentParams` as a parameter. The class has several properties and methods for executing messages, emitting output results after validation, resurrecting the model based on a given reason, waiting for output to be available, getting the completion message from the model, committing user messages without an answer, committing a flush of agent history, committing changes to prevent the next tool execution from being called, committing system messages, committing assistant messages without execution, and committing tool output to the history. The `dispose` method should be called when the agent is disposed.

## BusService

The BusService is an implementation of the IBus interface that provides event handling functionality. It takes in two properties, loggerService and sessionValidationService. The class also has private properties _eventSourceSet, _eventWildcardMap, getEventSubject.

The constructor is used to initialize the BusService.

The subscribe method allows you to subscribe to events for a specific client and source. It takes in the clientId, source and a function to handle the event. It returns an unsubscribe function that can be used to stop receiving events.

The once method is similar to subscribe, but it only triggers the function once when a matching event is received.

The emit method allows you to send an event for a specific client. It takes in the clientId and an event object. It returns a Promise that resolves when the event is successfully emitted.

The commitExecutionBegin and commitExecutionEnd methods are aliases for emitting the corresponding events. They take in a clientId and an optional context object.

The dispose method allows you to clean up event subscriptions for a specific client. It takes in the clientId and stops receiving events for that client.

## AgentValidationService

The `AgentValidationService` is a service used for validating agents within an agent swarm. It has a constructor that initializes the logger service, tool validation service, completion validation service, and storage validation service. The service also has several properties and methods for managing agents, their dependencies, storages, and states.

The `getAgentList` method retrieves a list of all agents currently being validated. The `getStorageList` method retrieves a list of storages used by the specified agent. The `getStateList` method retrieves a list of states used by the specified agent.

The `addAgent` method adds a new agent to the validation service. The `hasStorage`, `hasDependency`, and `hasState` methods are memoized functions used to check if an agent has a registered storage, dependency, or state respectively.

Lastly, the `validate` method is used to validate an agent by its name and source.

## AgentSchemaService

The `AgentSchemaService` is a service that manages agent schemas. It has a constructor, properties such as `loggerService`, `registry`, and `validateShallow`, as well as two methods: `register` and `get`. The `register` method is used to add a new agent schema by providing the key and value, while the `get` method retrieves an agent schema by its name. The `validateShallow` property is a validation function for the agent schema.

## AgentPublicService

The `AgentPublicService` is a TypeScript class that provides methods for managing public agent operations. It implements the `TAgentConnectionService` interface. The class has a constructor, several properties and methods.

The `loggerService` property is an instance of a logger service, which can be used to log messages. The `agentConnectionService` property is an instance of the `TAgentConnectionService` interface, which provides methods for connecting to agents.

The `createAgentRef` method creates a reference to an agent by specifying the method name, client ID and agent name. It returns a `ClientAgent` object that represents the agent.

The `execute` method executes a command on the agent by specifying the input, execution mode (synchronous or asynchronous), method name, client ID and agent name. It returns a Promise that resolves when the command is executed.

The `run` method runs the completion stateless by specifying the input, method name, client ID and agent name. It returns a Promise that resolves with the output of the command.

The `waitForOutput` method waits for the agent's output by specifying the method name, client ID and agent name. It returns a Promise that resolves with the output of the agent.

The `commitToolOutput` method commits tool output to the agent by specifying the tool ID, content, method name, client ID and agent name. It returns a Promise that resolves when the output is committed.

The `commitSystemMessage` method commits a system message to the agent by specifying the message, method name, client ID and agent name. It returns a Promise that resolves when the message is committed.

The `commitAssistantMessage` method commits an assistant message to the agent history by specifying the message, method name, client ID and agent name. It returns a Promise that resolves when the message is committed.

The `commitUserMessage` method commits user message to the agent without answer by specifying the message, method name, client ID and agent name. It returns a Promise that resolves when the message is committed.

The `commitFlush` method commits flush of agent history by specifying the method name, client ID and agent name. It returns a Promise that resolves when the flush is committed.

The `commitAgentChange` method commits change of agent to prevent the next tool execution from being called by specifying the method name, client ID and agent name. It returns a Promise that resolves when the change is committed.

The `commitStopTools` method prevents the next tool from being executed by specifying the method name, client ID and agent name. It returns a Promise that resolves when the prevention is committed.

The `dispose` method disposes of the agent by specifying the method name, client ID and agent name. It returns a Promise that resolves when the agent is disposed.

## AgentMetaService

The `AgentMetaService` is a class that provides functionality for managing agent meta nodes and converting them to UML format. It has a constructor, properties such as `loggerService`, `agentSchemaService` and `serialize`, as well as methods like `makeAgentNode` and `toUML`.

The `makeAgentNode` method creates a meta node for the given agent, while `makeAgentNodeCommon` does the same but with an optional `seen` parameter. The `toUML` method converts the meta nodes of a specific agent to UML format, with an optional `withSubtree` parameter.

## AgentConnectionService

The `AgentConnectionService` is a service in TypeScript that manages agent connections. It has a constructor and several properties, including dependencies such as `loggerService`, `busService`, and others. It provides methods for retrieving an agent instance, executing input commands, running completion statelessly, waiting for output from the agent, committing tool and system messages, committing agent change, preventing the next tool execution, flushing agent history, and disposing of the agent connection.

## AdapterUtils

The `AdapterUtils` is a class that provides an adapter for interacting with OpenAI's chat completions. It has a constructor that doesn't take any arguments. 

The `fromOpenAI` property is a function that creates another function to interact with OpenAI's chat completions. It takes an `openai` object and optional arguments for the model and response format. This function returns a new function that takes `ICompletionArgs$1` object as an argument and returns a Promise that resolves to the completion result. The result includes the content of the response, its mode (e.g., assistant or tool), the agent name, and its role. Additionally, it includes any tool calls made during the execution.
