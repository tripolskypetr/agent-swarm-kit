# agent-swarm-kit
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

To validate if a tool exists in the validation service, you can use the `validate` function. This function takes two parameters: `toolName`, which is the name of the tool to be validated, and `source`, which represents the source of the tool.

By using these functions, you can effectively manage and validate tools within your agent-swarm system.

## ToolSchemaService

The `ToolSchemaService` is a service that manages tool schemas. It has a constructor, properties such as `loggerService`, `registry`, and `validateShallow`, as well as two methods: `register` and `get`. The `register` method allows you to register a tool with a given key and value, while the `get` method retrieves a tool by its key. The `validateShallow` property is used for validating the state schema.

## SwarmValidationService

The SwarmValidationService is a service that allows for the validation of swarms and their agents. It has a constructor that initializes the loggerService, agentValidationService, and policyValidationService. The service also has a swarm map (_swarmMap) to store information about swarms.

To add a new swarm, you can use the `addSwarm` method by providing a swarm name and its schema (swarmSchema). This will add the swarm to the swarm map.

To retrieve a list of agents for a specific swarm, you can use the `getAgentList` method by providing the swarm name. This will return an array of agent names associated with the swarm.

To retrieve a list of all swarms, you can use the `getSwarmList` method. This will return an array of swarm names currently stored in the service.

To validate a swarm and its agents, you can use the `validate` method by providing a swarm name and the source code of the swarm. This will perform validation on both the swarm and its associated agents.

## SwarmSchemaService

The SwarmSchemaService is a service that manages swarm schemas. It has a constructor, loggerService property for logging purposes, registry property to store registered schemas, and validateShallow property for shallow validation of swarm schemas. The service allows you to register new swarm schemas using the `register` method, which takes a key and an ISwarmSchema object as parameters. You can retrieve a swarm schema by its name using the `get` method, which takes a key as the parameter.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It is responsible for managing public swarm interactions, which involve communication and coordination between agents in a swarm. The class provides various methods to interact with the swarm, such as navigating, canceling output, waiting for output, getting agent information, and disposing of the swarm. The service also has properties for a loggerService, swarmConnectionService, and navigationPop.

## SwarmMetaService

The SwarmMetaService is a service that handles swarm metadata. It has properties such as loggerService, swarmSchemaService, agentMetaService and serialize. The loggerService is used for logging, swarmSchemaService handles the schema related operations for swarms, agentMetaService handles metadata related to agents and serialize is used for serialization. The makeSwarmNode function creates a swarm node with the given swarm name. The toUML function converts the swarm metadata into UML format.

## SwarmConnectionService

The SwarmConnectionService is a TypeScript class that implements the ISwarm interface and provides functionality for managing swarm connections. It has a constructor that initializes the loggerService, busService, methodContextService, agentConnectionService, and swarmSchemaService properties.

The service provides several methods to interact with swarms, including:
- `getSwarm`: Retrieves a swarm instance based on the client ID and swarm name.
- `navigationPop`: Pops the navigation stack or returns the default agent.
- `cancelOutput`: Cancels the await of output by emitting an empty string.
- `waitForOutput`: Waits for the output from the swarm.
- `getAgentName`: Retrieves the agent name from the swarm.
- `getAgent`: Retrieves the agent from the swarm.
- `setAgentRef`: Sets the agent reference in the swarm.
- `setAgentName`: Sets the agent name in the swarm.
- `dispose`: Disposes of the swarm connection.

Overall, SwarmConnectionService is a TypeScript class that provides methods for managing swarm connections, retrieving and setting agent information, waiting for output from the swarm, and disposing of the connection.

## StorageValidationService

The StorageValidationService is a service designed to validate storages within the storage swarm. It provides a way to add new storages, as well as validate existing ones. The service utilizes a loggerService for logging purposes, an embeddingValidationService to handle validation of embedded storages, and a storageMap to keep track of the added storages.

To add a new storage, you can use the `addStorage` method by providing a storage name and its schema. This will add the new storage to the validation service.

To validate an existing storage, you can use the `validate` method by providing a storage name and its source. This will initiate the validation process for that specific storage.

Overall, the StorageValidationService provides a way to manage and validate storages within the storage swarm, ensuring their correctness and consistency.

## StorageUtils

The `StorageUtils` class implements the `TStorage` interface and provides various methods to interact with a storage system. It allows you to take, upsert, remove, get, list, and clear items from the storage.

- `take`: This method takes items from the storage by specifying a search query, total count, client ID, agent name, and storage name. It returns a Promise that resolves to an array of items matching the specified criteria.
- `upsert`: This method upserts an item into the storage. It requires providing the new item, client ID, agent name, and storage name. It returns a Promise that resolves when the item is successfully upserted.
- `remove`: This method removes an item from the storage based on its ID, client ID, agent name, and storage name. It returns a Promise that resolves when the item is successfully removed.
- `get`: This method retrieves an item from the storage based on its ID, client ID, agent name, and storage name. It returns a Promise that resolves to the requested item.
- `list`: This method lists items from the storage based on specified criteria such as client ID, agent name, storage name, and an optional filter function. It returns a Promise that resolves to an array of items matching the specified criteria.
- `clear`: This method clears the entire storage for a given client ID, agent name, and storage name. It returns a Promise that resolves when the storage is successfully cleared.

## StorageSchemaService

The StorageSchemaService is a service used for managing storage schemas. It has a constructor, loggerService property for logging service messages, registry property to store registered schemas, and validateShallow property for shallow validation of storage schemas. The service provides two main functions: register and get. The `register` function is used to add a new storage schema by providing the key and value of the schema. The `get` function retrieves a storage schema by its key. This service allows for efficient management and retrieval of storage schemas.

## StoragePublicService

The StoragePublicService is a service that handles interactions with public storage. It implements the TStorageConnectionService interface and provides methods for managing storage data. The service has properties such as loggerService and storageConnectionService for logging and managing connections to the storage, respectively.

The StoragePublicService offers several methods: take, upsert, remove, get, list, clear, and dispose. The take method retrieves a list of storage data based on a search query and total number of items. The upsert method allows for inserting or updating an item in the storage. The remove method deletes an item from the storage by its ID. The get method retrieves an item from the storage by its ID. The list method retrieves a list of items from the storage, optionally filtered by a predicate function. The clear method clears all items from the storage, and the dispose method releases resources associated with the storage.

## StorageConnectionService

The StorageConnectionService is a TypeScript class that manages storage connections. It has a constructor to initialize dependencies and several properties for interacting with other services. The getStorage method retrieves a storage instance based on the client ID and storage name. The take method retrieves a list of storage data based on a search query and total number of items. The upsert method upserts an item in the storage. The remove method removes an item from the storage. The get method retrieves an item from the storage by its ID. The list method retrieves a list of items from the storage, optionally filtered by a predicate function. The clear method clears all items from the storage. The dispose method is used to release resources associated with the storage connection.

## StateUtils

The `StateUtils` class is a utility for managing state in an agent swarm. It provides methods to retrieve, set, and clear state for a given client and state name. The class is generic, allowing for different types of state to be used.

To retrieve the current state for a specific client and state name, you can use the `getState` method. This asynchronous function takes a payload object with the client ID, agent name, and state name as parameters. It returns a promise that resolves to the current state value.

To set a new state for a specific client and state name, you can use the `setState` method. This asynchronous function takes a dispatching function and the payload object. The dispatching function can either be a value or a function that takes the previous state as an argument and returns a promise resolving to the new state.

To clear a specific client's state and set it back to its initial value, you can use the `clearState` method. This asynchronous function takes a payload object with the client ID, agent name, and state name as parameters. It returns a promise that resolves to the initial state value.

## StateSchemaService

The `StateSchemaService` is a service used for managing state schemas. It has a constructor, properties such as `loggerService`, `registry` and `validateShallow`, as well as two methods: `register` and `get`. The `register` method is used to register a new state schema by providing a key and the `IStateSchema<any>` value. The `get` method is used to retrieve a state schema by providing its key. This service allows for efficient management and retrieval of state schemas.

## StatePublicService

The `StatePublicService` class is an implementation of the `TStateConnectionService` interface. It has a constructor, as well as properties `loggerService` and `stateConnectionService`. 

The class provides three main methods: `setState`, `clearState`, and `getState`. The `setState` method sets the state using a provided dispatch function. The `clearState` method sets the state to its initial value. The `getState` method retrieves the current state.

Lastly, there is a `dispose` method that disposes the state.

This class is used to manage and interact with the state in a system, allowing for setting, clearing, retrieving, and disposing of state data.

## StateConnectionService

The `StateConnectionService` is a TypeScript class that manages state connections. It implements the `IState<T>` interface and provides various methods to interact with the state. The class has several properties such as `loggerService`, `busService`, `methodContextService`, `stateSchemaService`, `sessionValidationService`, and `sharedStateConnectionService` which are used for logging, event bus communication, method context management, state schema handling, session validation, and shared state connection management respectively.

The `constructor` is used to initialize the service.

The `getStateRef` is a memoized function that returns a state reference based on the provided `clientId` and `stateName`.

The `setState` method sets the state by dispatching a function that takes the previous state as an argument and returns a promise that resolves to the updated state.

The `clearState` method sets the state to its initial value.

The `getState` method retrieves the current state as a promise.

The `dispose` method is used to dispose of the state connection.

Overall, `StateConnectionService` provides a way to manage state connections and interact with the state by setting, clearing, getting, and disposing of the state.

## SharedStorageUtils

The `SharedStorageUtils` is a TypeScript class that implements the `TSharedStorage` interface. It provides methods for interacting with a storage system. The class has several properties and methods that allow you to perform various operations on the storage, such as taking items, upserting (insert or update) items, removing items, getting specific items, listing items with an optional filter, and clearing the entire storage. Each of these methods returns a Promise, allowing you to handle asynchronous operations.

## SharedStoragePublicService

The SharedStoragePublicService is a TypeScript class that implements the TSharedStorageConnectionService and is responsible for managing public storage interactions. It provides methods to interact with shared storage, such as retrieving, inserting, updating, and deleting data. The service also includes a loggerService and sharedStorageConnectionService for logging and connecting to the storage respectively.

The constructor is used to initialize the service. The loggerService and sharedStorageConnectionService properties are used for logging and connecting to the storage respectively.

The take method retrieves a list of storage data based on a search query and total number of items. It returns a Promise that resolves to an array of IStorageData objects.

The upsert method is used to insert or update an item in the storage. It takes an IStorageData object, the method name, and storage name as parameters. It returns a Promise that resolves when the operation is complete.

The remove method removes an item from the storage based on its ID. It takes the item's ID, method name, and storage name as parameters. It returns a Promise that resolves when the operation is complete.

The get method retrieves an item from the storage by its ID. It takes the item's ID, method name, and storage name as parameters. It returns a Promise that resolves to an IStorageData object.

The list method retrieves a list of items from the storage, optionally filtered by a predicate function. It takes the method name, storage name, and an optional filter function as parameters. The filter function can be used to specify a custom condition for filtering the items. It returns a Promise that resolves to an array of IStorageData objects.

The clear method is used to delete all items from the storage. It takes the method name and storage name as parameters. It returns a Promise that resolves when the operation is complete.

## SharedStorageConnectionService

The SharedStorageConnectionService is a service that manages storage connections. It has properties such as loggerService, busService, methodContextService, storageSchemaService, and embeddingSchemaService. The getStorage method retrieves a storage instance based on the client ID and storage name. The take method retrieves a list of storage data based on a search query and total number of items. The upsert method upserts an item in the storage. The remove method removes an item from the storage. The get method retrieves an item from the storage by its ID. The list method retrieves a list of items from the storage, optionally filtered by a predicate function. The clear method clears all items from the storage.

## SharedStateUtils

The SharedStateUtils is a utility class designed for managing state in the agent swarm. It provides methods to retrieve, set, and clear state for a given client and state name. The class uses promises to handle asynchronous operations.

To retrieve the state for a specific client and state name, you can use the `getState` method. This method returns a promise that resolves to the state value.

To set a new state for the given client and state name, you can use the `setState` method. This method accepts a dispatch function, which can be either the new state value or an asynchronous function that returns the new state value. The method returns a promise that resolves when the state is successfully set.

To clear the state and reset it to its initial value, you can use the `clearState` method. This method returns a promise that resolves to the initial state value.

Overall, SharedStateUtils provides a convenient way to manage and manipulate state within the agent swarm system.

## SharedStatePublicService

The SharedStatePublicService is a class that implements the TSharedStateConnectionService. It has a constructor, and two properties: loggerService and sharedStateConnectionService. The setState method allows you to update the state using a provided dispatch function, while clearState resets the state to its initial value. The getState method retrieves the current state of the system.

## SharedStateConnectionService

The `SharedStateConnectionService` is a TypeScript class that manages shared state connections. It implements the `IState<T>` interface, which allows it to handle state data of any type. The class has several properties, including `loggerService`, `busService`, `methodContextService`, and `stateSchemaService`. These properties are used for logging, event bus communication, method context management, and state schema handling.

The `getStateRef` property is a memoized function that returns a reference to the shared state. It takes in a `stateName` parameter and returns a `ClientState<any>` object.

The `setState` method takes in a dispatch function as a parameter and returns a promise that resolves to the updated state. This method is used to set the shared state by dispatching an action.

The `clearState` method clears the shared state and returns a promise that resolves to the initial state value.

The `getState` method returns a promise that resolves to the current state value.

Overall, `SharedStateConnectionService` provides a way to manage and interact with shared state data in a TypeScript application.

## SessionValidationService

The `SessionValidationService` is a service that handles session validation and management. It allows you to add, remove, and manage sessions, as well as track agent usage for each session. The service also provides methods to get information about sessions, such as the session mode, swarm name, agent list, and history list.

To use this service, you need to provide a `loggerService` for logging purposes. The service also uses several `_` prefixed properties to store and manage session data.

Some key methods of this service include:
- `addSession` to add a new session.
- `addAgentUsage`, `addHistoryUsage`, `addStorageUsage`, and `addStateUsage` to add agent, history, storage, and state usage to a session respectively.
- `removeAgentUsage`, `removeHistoryUsage`, `removeStorageUsage`, and `removeStateUsage` to remove agent, history, storage, and state usage from a session respectively.
- `getSessionMode` to get the mode of a session.
- `hasSession` to check if a session exists.
- `getSessionList` to get the list of all session IDs.
- `getSessionAgentList` to get the list of agents for a session.
- `getSessionHistoryList` to get the history list of agents for a session.
- `getSwarm` to get the swarm name for a session.
- `validate` to validate if a session exists.
- `removeSession` to remove a session.
- `dispose` to dispose a session validation cache.

Overall, the `SessionValidationService` provides a way to manage and validate sessions, as well as track agent usage for each session.

## SessionPublicService

The `SessionPublicService` is a Typescript class that provides methods for managing public session interactions. It takes in dependencies such as `loggerService`, `perfService`, `sessionConnectionService`, and `busService`. 

The class has several methods:
- `emit` for emitting a message to the session.
- `execute` for executing a command in the session.
- `run` for running a completion stateless.
- `connect` for connecting to the session.
- `commitToolOutput` for committing tool output to the session.
- `commitSystemMessage` for committing a system message to the session.
- `commitAssistantMessage` for committing an assistant message to the session.
- `commitUserMessage` for committing a user message to the agent without answer.
- `commitFlush` for committing a flush of agent history.
- `commitStopTools` for preventing the next tool from being executed.
- `dispose` for disposing of the session.

These methods allow for various interactions with the session, such as emitting messages, executing commands, committing different types of messages, and disposing the session when necessary.

## SessionConnectionService

The `SessionConnectionService` is a service that manages session connections. It has properties such as `loggerService`, `busService`, `methodContextService`, `swarmConnectionService`, `policyConnectionService`, and `swarmSchemaService`. 

The service provides methods to retrieve a memoized session based on `clientId` and `swarmName`, emit a message to the session, execute commands in the session, connect to the session using a provided connector, commit tool output to the session, commit system messages and assistant messages to the session, commit user message without answer, flush and stop tools in the session, and dispose of the service.

## SchemaUtils

The `SchemaUtils` is a utility class that provides functions for performing operations related to schemas. It has a constructor that does not take any arguments.

The class has three properties: `writeSessionMemory`, `readSessionMemory`, and `serialize`. 

The `writeSessionMemory` property is a function that allows you to write a value into the session memory for a specific client. It takes two arguments: `clientId` (a string representing the client's ID) and `value` (the data you want to write). It returns the written value.

The `readSessionMemory` property is a function that retrieves a value from the session memory for a specific client. It takes one argument: `clientId` (a string representing the client's ID). It returns the value stored in session memory for that client.

The `serialize` property is a function that serializes an object or an array of objects into a formatted string. It takes one argument: `data` (the object or array of objects you want to serialize). It returns the serialized string representation of the data.

## PolicyValidationService

The PolicyValidationService is a tool used within the agent-swarm to validate policies. It provides a way to add new policies and validate existing ones. The service utilizes a loggerService for logging purposes and maintains an internal policyMap to store the policies.

To add a new policy, you can use the `addPolicy` function by providing a policy name and its schema. This will add the new policy to the validation service.

To validate a policy, you can use the `validate` function by specifying the policy name and its source. This will check if the policy exists in the validation service.

Overall, this API Reference describes the functionality of the PolicyValidationService, including its constructor and properties like loggerService and _policyMap, as well as the methods for adding and validating policies.

## PolicyUtils

The `PolicyUtils` class in TypeScript provides utility methods for banning and unbanning clients. The class has a constructor that initializes the utility methods. The `banClient` method takes a payload object containing the client ID, swarm name, and policy name as parameters. It returns a Promise that resolves when the client is successfully banned. The `unbanClient` method also takes a payload object with the same parameters and returns a Promise that resolves when the client is successfully unbanned. These methods can be used to manage client access in a swarm environment.

## PolicySchemaService

The PolicySchemaService is a service that manages policy schemas. It has a constructor, loggerService property for logging purposes, registry property to store policy schemas, and validateShallow property for shallow validation of policy schemas. The service provides two methods: register and get.

The `register` method is used to add a new policy schema by providing the key and value of the schema. The `get` method retrieves an existing policy schema by its name (key).

## PolicyPublicService

The `PolicyPublicService` is a TypeScript class that implements the `TPolicyConnectionService` interface. It is responsible for handling public policy operations, such as banning and unbanning clients in a specific swarm. The class has properties `loggerService` and `policyConnectionService`, which are used for logging and connecting to policies, respectively.

The `PolicyPublicService` provides several methods:
1. `getBanMessage` retrieves the ban message for a client in a specific swarm.
2. `validateInput` validates the input for a specific policy.
3. `validateOutput` validates the output for a specific policy.
4. `banClient` bans a client from a specific swarm.
5. `unbanClient` unbans a client from a specific swarm.

These methods use promises to handle asynchronous operations, ensuring that the code can handle multiple requests without blocking.

## PolicyConnectionService

The `PolicyConnectionService` is a service that manages policy connections and provides methods to interact with policies, ban messages, and client banning/unbanning in a swarm. It implements the `IPolicy` interface and has properties for dependency injection of `loggerService`, `busService`, `methodContextService`, and `policySchemaService`.

The service provides the following methods:
1. `getPolicy` - Retrieves a policy based on the given policy name.
2. `getBanMessage` - Retrieves the ban message for a client in a swarm asynchronously.
3. `validateInput` - Validates the input for a client in a swarm asynchronously.
4. `validateOutput` - Validates the output for a client in a swarm asynchronously.
5. `banClient` - Bans a client from a swarm asynchronously.
6. `unbanClient` - Unbans a client from a swarm asynchronously.

These methods allow for the management of policies, validation of client input and output in a swarm, and the ability to ban or unban clients from a swarm.

## PerfService

The PerfService is a performance tracking and logging service that monitors the execution times, input lengths, and output lengths for different client sessions. It uses various services such as loggerService, sessionValidationService, memorySchemaService, swarmValidationService, agentValidationService, statePublicService, swarmPublicService, and stateConnectionService for different functionalities.

The PerfService has properties like loggerService, sessionValidationService, memorySchemaService, swarmValidationService, agentValidationService, statePublicService, swarmPublicService, stateConnectionService, executionScheduleMap, executionOutputLenMap, executionInputLenMap, executionCountMap, executionTimeMap, totalResponseTime, and totalRequestCount. These properties store data related to client sessions and performance metrics.

The PerfService provides methods to get the number of active session executions for a given client, the total execution time and average execution time for a given client's sessions, the average input length and output length for active sessions of a given client, the total input length and output length for active sessions of a given client, the list of active sessions, the average response time for all requests, and the total number of executions.

The PerfService also allows starting and ending executions for a given client, disposing of all data related to a given client, and converting performance measures of clients or all clients for serialization.

## MemorySchemaService

The MemorySchemaService is a service that allows for the management of memory schemas across different sessions. It utilizes a loggerService for logging purposes and a memoryMap to store data. The constructor is used for initializing the service, while writeValue is a method that writes values to the memory map for a specific client ID. The readValue method retrieves values from the memory map for a given client ID. Lastly, the dispose method is used to remove a memory map entry for a specific client ID.

## LoggerUtils

The LoggerUtils is a TypeScript class that implements the ILoggerAdapter and ILoggerControl interfaces. It has a constructor, several properties and methods for logging different levels of information, and a dispose method. The LoggerFactory property is used to create logger instances, while LoggerCallbacks and getLogger are used for customizing the logger behavior. The useCommonAdapter, useClientCallbacks and useClientAdapter methods are used to configure the logger with different adapters and callbacks. The logClient, infoClient, debugClient, log, debug, info and dispose methods are used for logging different levels of information and disposing a logger instance.

## LoggerService

The LoggerService is a class that implements the ILogger interface and provides methods to log and debug messages. It has a constructor, several properties such as methodContextService and executionContextService, and methods like log, debug, info, and setLogger. The log method logs messages using the current logger, while debug and info log debug messages and information messages, respectively. The setLogger method allows you to set a new logger. This class is useful for logging and debugging purposes in a system.

## LoggerInstance

The `LoggerInstance` is a class that implements the `ILoggerInstance` interface. It has a constructor that takes in two parameters: `clientId` of type string and `callbacks` of type `Partial<ILoggerInstanceCallbacks>`.

The `clientId` property is of type string and represents the ID for a specific client. The `callbacks` property is an object that contains callback functions for various events.

The `__@LOGGER_INSTANCE_WAIT_FOR_INIT@2230` property is an internal variable used for waiting for initialization.

The `waitForInit` method returns a Promise that resolves when the instance is initialized.

The `log`, `debug`, and `info` methods are used to log different types of messages. They all take in a `topic` parameter of type string and additional arguments (`...args`) of any type. The `log` method logs a general message, the `debug` method logs a debug message, and the `info` method logs an informational message.

## HistoryUtils

The `HistoryUtils` class provides functionality for managing and interacting with the history of messages in a system. It implements `IHistoryAdapter` and `IHistoryControl`, which allow for customization and control over the history. The class has a constructor, properties such as `HistoryFactory`, `HistoryCallbacks`, and functions like `getHistory`, `useHistoryAdapter`, and `useHistoryCallbacks`. 

The `push` function allows you to add a new message to the history, while `dispose` enables you to dispose of the history for a specific client and agent. The `iterate` function provides an asynchronous iterator to iterate over the history messages.

## HistoryPublicService

The `HistoryPublicService` is a TypeScript class that implements the `THistoryConnectionService` interface. It is responsible for handling public operations related to the history. The class has a constructor, which initializes the `loggerService` and `historyConnectionService`.

The class provides several methods to interact with the history. The `push` method allows you to push a message to the history asynchronously. The `toArrayForAgent` method converts the history into an array specifically for a given agent. The `toArrayForRaw` method converts the history into a raw array. Lastly, the `dispose` method allows you to dispose of the history.

Overall, this class provides a set of functions to interact with the history, including pushing messages, converting to arrays for specific agents or raw data, and disposing of the history.

## HistoryInstance

The `HistoryInstance` class in TypeScript represents a History Instance and implements the `IHistoryInstance` interface. It has a constructor that takes in `clientId` and `callbacks`, which are used to initialize the instance. The class also has properties such as `clientId`, `callbacks`, and `_array` to store data.

The class provides several methods: `waitForInit`, which waits for the history to initialize; `iterate`, which allows you to iterate over the history messages for a given agent; `push`, which adds a new message to the history for a given agent; and `dispose`, which disposes of the history for a given agent.

Overall, the `HistoryInstance` class provides functionality to manage and manipulate a history instance in TypeScript.

## HistoryConnectionService

The `HistoryConnectionService` is a TypeScript class that implements the `IHistory` interface. It is responsible for managing history connections and provides several methods to interact with the history. The class has a constructor that initializes the logger service, bus service, method context service, and session validation service.

The `getHistory` method retrieves the history for a given client and agent. It also implements `IClearableMemoize` and `IControlMemoize`, which allow for clearing and controlling the memoized history.

The `push` method pushes a message to the history asynchronously.

The `toArrayForAgent` method converts the history to an array format specifically for agents.

The `toArrayForRaw` method converts the history to a raw array format.

The `dispose` method disposes of the history connection service, releasing any resources associated with it.

## EmbeddingValidationService

The EmbeddingValidationService is a tool used within the agent-swarm to validate embeddings. It has a constructor, loggerService property for logging messages or errors, and a private _embeddingMap property to store the embeddings. The service allows you to add new embeddings using the `addEmbedding` function, which takes the embedding name and its schema as parameters. The `validate` function checks if a specific embedding exists in the validation service by providing its name and source. This helps ensure that the embeddings being used are valid and properly configured.

## EmbeddingSchemaService

The EmbeddingSchemaService is a service used for managing embedding schemas. It has a constructor, loggerService, registry, and validateShallow properties. The `register` function is used to register an embedding with a given key and value, while the `get` function retrieves an embedding by its key. This service provides a way to manage and access embedding schemas in your application.

## DocService

The DocService is a service that generates documentation for swarms and agents. It has a constructor that initializes several properties, including loggerService for logging messages, perfService for performance tracking, swarmValidationService and agentValidationService for validating swarm and agent schemas, respectively, swarmSchemaService and agentSchemaService for managing schema definitions, policySchemaService and toolSchemaService for managing policy and tool definitions, storageSchemaService for managing storage schema, stateSchemaService for managing state schema, and agentMetaService and swarmMetaService for managing metadata related to agents and swarms.

The service provides two methods for writing documentation: writeSwarmDoc, which writes the documentation for a swarm schema, and writeAgentDoc, which writes the documentation for an agent schema. Additionally, there are two methods for dumping documentation: dumpDocs, which dumps the documentation for all swarms and agents, and dumpPerfomance, which dumps the performance data to a file. There is also another method, dumpClientPerfomance, which dumps the client performance data to a file, specifying the client ID as an argument.

## CompletionValidationService

The CompletionValidationService is a TypeScript service designed to validate completion names. It has a constructor that initializes the service and two properties, loggerService and _completionSet. The loggerService property is used for logging messages, while the _completionSet property stores a set of completion names.

To add a new completion name to the set, you can use the addCompletion method. This method takes a string parameter representing the completion name and adds it to the set.

To validate if a completion name exists in the set, you can use the validate method. This method takes two parameters: a string representing the completion name to be validated and a string representing the source of the completion name. The method will check if the given completion name exists in the set and perform any necessary validation.

Overall, the CompletionValidationService provides functionality to manage and validate completion names in a TypeScript application.

## CompletionSchemaService

The `CompletionSchemaService` is a service that manages completion schemas. It has a constructor, properties like `loggerService`, `registry`, and `validateShallow`, as well as two methods: `register` and `get`. 

The `register` method is used to register a new completion schema by providing a key and the corresponding `ICompletionSchema` object. 

The `get` method allows you to retrieve a completion schema by providing its key. 

This service helps in managing and accessing completion schemas efficiently.

## ClientSwarm

The ClientSwarm class is an implementation of the ISwarm interface and manages agents within a swarm. It has properties such as `params`, `_agentChangedSubject`, `_activeAgent`, and `_navigationStack` to handle various functionalities. The class provides methods like `navigationPop`, `cancelOutput`, `getAgentName`, `getAgent`, `setAgentRef`, and `setAgentName` to interact with the swarm and its agents. The `waitForOutput` property allows waiting for output from the active agent.

## ClientStorage

The ClientStorage class is an implementation of the IStorage interface and provides methods to manage storage operations. It has a constructor that takes in parameters of type IStorageParams<T> and properties such as _itemMap, which is a Map that stores items based on their unique identifier, and _createEmbedding, which creates an embedding for a given item.

The class also has methods like take, which takes a specified number of items based on search criteria, upsert to upsert an item into the storage, remove to delete an item from the storage, clear to remove all items from the storage, get to retrieve an item by its ID, list to list all items in the storage (optionally filtered), and dispose to dispose of the state.

Additionally, there is a waitForInit property that waits for the initialization of the storage.

## ClientState

The `ClientState` class in this Typescript API Reference represents the client state and implements `IState<State>`. It has a constructor that takes in `IStateParams<State>` as a parameter. The class has several properties and methods to manage the state.

The `params` property holds the parameters used to initialize the state, while `_state` stores the current state. The `dispatch` method allows you to dispatch actions and return the updated state as a promise. The `waitForInit` property is used to wait for the state initialization process.

The `setState` method sets the state using a provided dispatch function asynchronously, while `clearState` sets the state to its initial value. The `getState` method retrieves the current state as a promise. Finally, `dispose` is used to dispose of the state, releasing any resources associated with it.

## ClientSession

The ClientSession class is an implementation of the ISession interface. It has a constructor that takes in parameters of type ISessionParams. The class has several methods and properties that allow for communication with the session.

The `emit` method allows for emitting a message. The `execute` method executes a message and optionally emits the output. The `run` method runs a completion stateless.

Other methods include `commitToolOutput`, which commits tool output; `commitUserMessage`, which commits a user message without an answer; `commitFlush`, which commits a flush of the agent history; `commitStopTools`, which commits the stop of the next tool execution; `commitSystemMessage`, which commits a system message; and `commitAssistantMessage`, which commits an assistant message.

The `connect` method connects the session to a connector function, and `dispose` should be called on session dispose.

## ClientPolicy

The `ClientPolicy` class in TypeScript is an implementation of the `IPolicy` interface. It represents a client policy and provides methods to manage bans, validate input/output from clients, and get the ban message for a client. The class has properties such as `params` which holds the policy parameters and `_banSet` which is a set of banned clients.

The constructor takes in `IPolicyParams` as a parameter to initialize the policy. The `getBanMessage` method returns the ban message for a specific client based on their ID and the swarm name. The `validateInput` method validates the input from a client, while `validateOutput` validates the output to a client. Both methods return `true` if the input/output is valid and `false` otherwise.

The `banClient` method bans a client by their ID and swarm name, while the `unbanClient` method removes a client's ban. Both methods return `void` as they do not have a return value.

Overall, the `ClientPolicy` class provides functionality to manage client bans, validate input/output from clients, and retrieve ban messages for specific clients in a TypeScript application.

## ClientHistory

The `ClientHistory` class in TypeScript represents the history of messages exchanged between a client and an AI model. It implements the `IHistory` interface and provides various methods to interact with the history.

The class has a constructor that takes in `IHistoryParams` as a parameter. It also has two properties: `params` and `_filterCondition`. The `params` property holds the parameters for initializing the history, while `_filterCondition` is a filter condition used in the `toArrayForAgent` method.

The class provides four methods: `push`, `toArrayForRaw`, `toArrayForAgent`, and `dispose`. The `push` method adds a message to the history asynchronously. The `toArrayForRaw` method converts the history into an array of raw messages asynchronously. The `toArrayForAgent` method converts the history into an array of messages suitable for the agent, taking a prompt and optional system messages as parameters. Finally, the `dispose` method should be called when an agent is disposed to clean up any resources associated with the history.

## ClientAgent

The `ClientAgent` class in TypeScript represents a client agent that interacts with the system. It implements the `IAgent` interface and has properties such as `params`, `_agentChangeSubject`, `_toolErrorSubject`, `_toolStopSubject`, `_toolCommitSubject`, and `_outputSubject`. The class also has methods like `execute`, `run`, `_emitOuput`, `_resurrectModel`, `waitForOutput`, `getCompletion`, `commitUserMessage`, `commitFlush`, `commitAgentChange`, `commitStopTools`, `commitSystemMessage`, `commitAssistantMessage`, `commitToolOutput`, and `dispose`. The class provides functionality for executing messages, emitting output results after validation, resurrecting the model based on a given reason, waiting for output to be available, getting the completion message from the model, committing a user message to the history without answer, committing a flush of agent history, committing a change of agent to prevent the next tool execution from being called, committing a change of agent to prevent the next tool execution from being called, committing a system message to the history, committing an assistant message to the history without execute, committing the tool output to the history, and disposing of the agent.

## BusService

The BusService is an implementation of the IBus interface that provides functionality for event handling and communication between different clients. It uses the loggerService and sessionValidationService for logging and validation purposes. The class has several properties such as _eventSourceSet, _eventWildcardMap and getEventSubject for managing events.

The constructor is used to initialize the BusService.

The subscribe method allows clients to subscribe to specific events by providing a clientId, source and callback function. This enables clients to receive events that match the specified source.

The once method is similar to subscribe, but it allows clients to receive only one event that matches the specified filter.

The emit method is used to send events to a specific client.

The commitExecutionBegin and commitExecutionEnd methods are aliases for emitting the corresponding events.

The dispose method is used to clean up event subscriptions for a specific client.

## AgentValidationService

The `AgentValidationService` is a service used for validating agents within an agent swarm. It has a constructor that initializes the logger service, tool validation service, completion validation service, and storage validation service. The service also has several properties and methods for managing agents, their dependencies, storages, and states.

The `getAgentList` method returns an array of agent names. The `getStorageList` method retrieves the list of storages used by a specific agent. The `getStateList` method retrieves the list of states used by a specific agent.

The `addAgent` method adds a new agent to the validation service. The `hasStorage`, `hasDependency`, and `hasState` methods are memoized functions used to check if an agent has a registered storage, dependency, or state respectively.

Finally, the `validate` method is used to validate an agent by its name and source.

## AgentSchemaService

The `AgentSchemaService` is a service used for managing agent schemas. It has a constructor, properties such as `loggerService`, `registry`, and `validateShallow` for logging, registry management, and validation of agent schemas respectively. The service also has two methods: `register` and `get`. 

The `register` method is used to register a new agent schema by providing the key and value of the schema. 

The `get` method is used to retrieve an agent schema by its name, providing the key as a parameter.

## AgentPublicService

The `AgentPublicService` is a TypeScript class that provides methods for managing public agent operations. It implements the `TAgentConnectionService` interface. The class has a constructor, several properties and methods.

The `loggerService` property is an instance of a logger service, which can be used to log messages. The `agentConnectionService` property is an instance of the `TAgentConnectionService` class, which provides methods for connecting to agents.

The `createAgentRef` method creates a reference to an agent by specifying the method name, client ID and agent name. It returns a `ClientAgent` object that represents the agent.

The `execute` method executes a command on the agent by specifying the input, execution mode, method name, client ID and agent name. It returns a promise that resolves when the command is executed.

The `run` method runs the completion stateless by specifying the input, method name, client ID and agent name. It returns a promise that resolves with the output of the command.

The `waitForOutput` method waits for the agent's output by specifying the method name, client ID and agent name. It returns a promise that resolves with the output of the agent.

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

The `makeAgentNode` method creates a meta node for the given agent, while `makeAgentNodeCommon` does the same but with additional functionality. The `toUML` method converts the meta nodes of a specific agent to UML format. The `withSubtree` parameter determines whether to include the subtree of the agent in the UML conversion.

## AgentConnectionService

The `AgentConnectionService` is a TypeScript class that manages agent connections and provides methods for executing commands, waiting for output, and committing messages. It implements the `IAgent` interface and has several properties for services such as `loggerService`, `busService`, and others.

The class provides a `getAgent` method to retrieve an agent instance, and methods like `execute`, `run`, `waitForOutput`, and more for executing commands, waiting for output from the agent, and committing different types of messages. The `dispose` method is used to dispose of the agent connection.
