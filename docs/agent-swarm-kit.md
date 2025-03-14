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

The `ToolValidationService` is a service used for validating tools within the agent-swarm. It provides a way to add new tools and validate existing ones. The constructor initializes the service, while `loggerService` and `_toolMap` are properties used for logging and storing the tools, respectively. The `addTool` function allows you to add a new tool by providing the `toolName` and its schema, defined by the `IAgentTool` interface. The `validate` function checks if a tool exists in the validation service by providing its `toolName` and the source code.

## ToolSchemaService

The `ToolSchemaService` is a service that manages tool schemas. It has a constructor, properties such as `loggerService`, `registry`, and `validateShallow`, as well as two methods: `register` and `get`. The `register` method is used to register a tool with the given key and value, while the `get` method retrieves a tool by its key. The `validateShallow` property is used for validating the state schema.

## SwarmValidationService

The SwarmValidationService is a service designed to validate swarms and their associated agents. It utilizes a loggerService, agentValidationService, and policyValidationService for logging purposes and validating agents and policies respectively. The service also maintains a swarm map (_swarmMap) to keep track of swarms.

To add a new swarm, you can use the `addSwarm` method by providing a swarm name and its schema. This will add the swarm to the swarm map.

To retrieve a list of agents for a specific swarm, you can use the `getAgentList` method by passing in the swarm name. This will return an array of agent names associated with the swarm.

To retrieve a list of ban policies for a specific swarm, you can use the `getPolicyList` method by providing the swarm name. This will return an array of policy names associated with the swarm.

To retrieve a list of all swarms, you can use the `getSwarmList` method. This will return an array containing the names of all swarms.

Lastly, the `validate` method can be used to validate a swarm and its agents. You need to provide the swarm name and a source string. This method will perform the validation process for the specified swarm.

## SwarmSchemaService

The SwarmSchemaService is a service used for managing swarm schemas. It has a constructor, loggerService property for logging service messages, registry property to store registered schemas, and validateShallow property for shallow validation of swarm schemas. The service provides two methods: register and get.

The `register` method is used to register a new swarm schema by providing the key and value of the schema. This allows for easy storage and retrieval of swarm schemas.

The `get` method is used to retrieve a swarm schema by its name. This method takes a key as an argument and returns the corresponding swarm schema.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It is designed to manage public swarm interactions, allowing users to interact with swarms in a public context. The class provides various methods to interact with swarms, such as navigating the stack, canceling output awaits, waiting for swarm outputs, retrieving agent names and agents from swarms, setting agent references and names in the swarm, and disposing of a swarm. The service also has properties for the loggerService and swarmConnectionService, which are used for logging and connecting to swarms, respectively.

## SwarmMetaService

The SwarmMetaService is a service that handles swarm metadata. It has properties such as loggerService, swarmSchemaService, agentMetaService and serialize. The loggerService is used for logging, swarmSchemaService handles the schema related operations for swarms, agentMetaService handles metadata related to agents and serialize is used for serialization. The makeSwarmNode function creates a swarm node with the given swarm name. The toUML function converts the swarm metadata into UML format.

## SwarmConnectionService

The SwarmConnectionService is a TypeScript class that implements the ISwarm interface and manages connections to a swarm. It has properties for loggerService, busService, methodContextService, agentConnectionService, and swarmSchemaService. The class provides various methods to interact with the swarm, such as retrieving a swarm instance based on client ID and swarm name, popping the navigation stack or returning a default agent, waiting for output from the swarm, retrieving agent name and agent from the swarm, setting agent reference and name in the swarm, and disposing of the swarm connection.

## StorageValidationService

The StorageValidationService is a service designed to validate storages within the storage swarm. It provides a way to add new storages, as well as validate existing ones. The service utilizes a loggerService for logging purposes, an embeddingValidationService to validate the embeddings of storages, and a storageMap to store the added storages.

To add a new storage, you can use the `addStorage` function by providing a storage name and its schema. This will add the new storage to the validation service.

To validate an existing storage, you can use the `validate` function by providing a storage name and its source. This will initiate the validation process for that specific storage.

Overall, the StorageValidationService is a useful tool for managing and validating storages within the storage swarm.

## StorageUtils

The `StorageUtils` class implements the `TStorage` interface and provides various methods to interact with a storage system. It allows you to take, upsert, remove, get, list, and clear items from the storage.

- The `take` method takes items from the storage and returns them as an array of type `T`, where `T` extends the `IStorageData` interface.
- The `upsert` method upserts an item into the storage. It takes a payload object containing the item to be upserted and information about the client, agent name, and storage name.
- The `remove` method removes an item from the storage based on its `itemId`. It also requires the client, agent name, and storage name as part of the payload.
- The `get` method retrieves a specific item from the storage based on its `itemId`. It returns the item as an object of type `T`, where `T` extends the `IStorageData` interface.
- The `list` method lists items from the storage. It returns an array of type `T`, where `T` extends the `IStorageData` interface. You can also apply a filter function to the payload to limit the items returned.
- The `clear` method clears the entire storage for a specific client, agent name, and storage name.

These methods provide a convenient way to interact with storage systems in TypeScript applications.

## StorageSchemaService

The StorageSchemaService is a service used for managing storage schemas. It has a constructor, loggerService property for logging purposes, registry property to store registered schemas, and validateShallow property for shallow validation of storage schemas. The service provides two main functions: register and get. The `register` function is used to add a new storage schema by providing the key and value, while `get` function retrieves a storage schema by its key. This service allows for efficient management and retrieval of storage schemas in a TypeScript application.

## StoragePublicService

The `StoragePublicService` is a TypeScript class that implements the `TStorageConnectionService` interface. It is responsible for managing interactions with public storage services. The class has a constructor, properties such as `loggerService` and `storageConnectionService`, as well as several methods for interacting with the storage.

The `take` method retrieves a list of storage data based on a search query and total number of items. The `upsert` method upserts an item in the storage. The `remove` method removes an item from the storage. The `get` method retrieves an item from the storage by its ID. The `list` method retrieves a list of items from the storage, optionally filtered by a predicate function. The `clear` method clears all items from the storage. The `dispose` method disposes of the storage.

## StorageConnectionService

The StorageConnectionService is a service that manages storage connections and provides methods for retrieving, inserting, updating, and removing data from the storage. It takes in dependencies such as loggerService, busService, methodContextService, storageSchemaService, sessionValidationService, embeddingSchemaService, and sharedStorageConnectionService. The service also has a memoized method called getStorage for retrieving storage instances based on client ID and storage name. Other methods include take for retrieving a list of storage data based on search query and total number of items, upsert for inserting or updating an item in the storage, remove for deleting an item from the storage by its ID, get for retrieving an item from the storage by its ID, list for retrieving a filtered list of items from the storage, clear for clearing all items from the storage, and dispose for disposing of the storage connection.

## StateUtils

The `StateUtils` class is a utility for managing state in an agent swarm. It provides methods to retrieve, set, and clear state for a given client and state name. The `getState` method allows you to retrieve the state for a specific client and state name, while the `setState` method sets a new state value for the given client and state name. The `clearState` method sets the state back to its initial value. All these methods return a promise, allowing you to handle asynchronous operations.

## StateSchemaService

The `StateSchemaService` is a service used for managing state schemas. It has a constructor, properties such as `loggerService`, `registry` and `validateShallow`, as well as two methods: `register` and `get`. 

The `register` method is used to register a new state schema by providing the key and value of the schema. 

The `get` method is used to retrieve a state schema by its key.

## StatePublicService

The `StatePublicService` class is an implementation of the `TStateConnectionService` interface. It has a constructor, as well as properties `loggerService` and `stateConnectionService`. The class provides methods for setting, clearing, getting and disposing the state.

The `setState` method takes a dispatch function, which updates the state asynchronously. It also requires a method name, client ID and state name as parameters.

The `clearState` method sets the state to its initial value, again requiring a method name, client ID and state name as parameters.

The `getState` method retrieves the current state, requiring a method name, client ID and state name as parameters.

Lastly, the `dispose` method disposes of the state, requiring a method name, client ID and state name as parameters.

## StateConnectionService

The `StateConnectionService` is a TypeScript class that manages state connections. It has a constructor and several properties, including `loggerService`, `busService`, `methodContextService`, `stateSchemaService`, `sessionValidationService`, and `sharedStateConnectionService`. It also has a private property `_sharedStateSet`.

The class provides a memoized function `getStateRef` to get a state reference. It also has methods `setState`, `clearState`, and `getState` to set, clear, or get the state respectively. These methods return a promise for asynchronous operations.

Lastly, the class has a `dispose` method to dispose the state connection.

## SharedStorageUtils

The `SharedStorageUtils` is a TypeScript class that implements the `TSharedStorage` interface. It provides various methods for interacting with a storage system. The class has several properties and methods that allow you to take, upsert, remove, get, list, and clear items from the storage.

The `take` method takes items from the storage based on a provided payload, which includes search criteria and the total number of items to retrieve. It returns a promise that resolves with an array of items matching the search criteria.

The `upsert` method allows you to upsert an item into the storage. It takes an item and a storage name as parameters, and returns a promise that resolves when the item is successfully upserted.

The `remove` method removes an item from the storage based on its ID and a specified storage name. It returns a promise that resolves when the item is successfully removed.

The `get` method retrieves an item from the storage based on its ID and a specified storage name. It returns a promise that resolves with the retrieved item.

The `list` method lists items from the storage based on a specified storage name and an optional filter function. It returns a promise that resolves with an array of items matching the filter criteria.

The `clear` method clears the specified storage, removing all items from it. It returns a promise that resolves when the storage is successfully cleared.

## SharedStoragePublicService

The SharedStoragePublicService is a TypeScript class that provides functionality for managing public storage interactions. It implements the TSharedStorageConnectionService interface and includes properties such as loggerService, sharedStorageConnectionService.

The constructor is used to initialize the service. 

The take function retrieves a list of storage data based on a search query and total number of items. It returns a Promise that resolves to an array of IStorageData objects.

The upsert function is used to insert or update an item in the storage. It takes an IStorageData object, methodName and storageName as parameters and returns a Promise that resolves when the operation is complete.

The remove function removes an item from the storage by its ID. It takes StorageId, methodName and storageName as parameters and returns a Promise that resolves when the operation is complete.

The get function retrieves an item from the storage by its ID. It takes StorageId, methodName and storageName as parameters and returns a Promise that resolves to an IStorageData object.

The list function retrieves a list of items from the storage, optionally filtered by a predicate function. It takes methodName, storageName and an optional filter function as parameters. The filter function can be used to specify conditions for the items that should be included in the list. It returns a Promise that resolves to an array of IStorageData objects.

The clear function clears all items from the storage. It takes methodName and storageName as parameters and returns a Promise that resolves when the operation is complete.

## SharedStorageConnectionService

The `SharedStorageConnectionService` is a service that manages storage connections and implements the `IStorage` interface. It has a constructor that takes no arguments and several properties including `loggerService`, `busService`, `methodContextService`, `storageSchemaService`, and `embeddingSchemaService`.

The service provides a method `getStorage` that retrieves a storage instance based on the client ID and storage name. It also has methods for retrieving, upserting, removing, and listing items in the storage. The `take` method retrieves a list of storage data based on a search query and total number of items. The `upsert` method upserts an item in the storage. The `remove` method removes an item from the storage. The `get` method retrieves an item from the storage by its ID. The `list` method retrieves a list of items from the storage, optionally filtered by a predicate function. Finally, the `clear` method clears all items from the storage.

## SharedStateUtils

The SharedStateUtils is a utility class designed for managing state within the agent swarm. It provides methods to retrieve, set, and clear state for a given client and state name. The class uses promises to handle asynchronous operations.

To retrieve the state for a specific client and state name, you can use the `getState` method. This method returns a promise that resolves to the state value.

To set a new state for the given client and state name, you can use the `setState` method. This method accepts a dispatch function, which can be either the new state value or an asynchronous function that returns the new state value. The method returns a promise that resolves when the state is successfully set.

To clear the state and reset it to its initial value, you can use the `clearState` method. This method returns a promise that resolves to the initial state value.

Overall, SharedStateUtils provides a convenient way to manage and manipulate state within the agent swarm environment.

## SharedStatePublicService

The SharedStatePublicService is a class that implements the TSharedStateConnectionService. It has a constructor, and two properties: loggerService and sharedStateConnectionService. The setState function sets the state using a provided dispatch function, while clearState sets the state to its initial value. The getState function retrieves the current state. All these functions require a methodName and stateName as parameters.

## SharedStateConnectionService

The `SharedStateConnectionService` is a TypeScript class that manages shared state connections. It implements the `IState<T>` interface and provides methods to get, set, and clear the shared state. The service also has properties for `loggerService`, `busService`, `methodContextService`, and `stateSchemaService`.

The constructor initializes the service without any parameters.

The `getStateRef` property is a memoized function that returns a reference to the shared state with a given name.

The `setState` method takes a dispatch function that updates the state asynchronously and returns a promise that resolves to the updated state.

The `clearState` method sets the state to its initial value asynchronously and returns a promise.

The `getState` method retrieves the current state asynchronously and returns a promise.

## SessionValidationService

The SessionValidationService is a TypeScript class that provides methods for managing and validating sessions. It allows you to add, remove and get information about sessions, agents, history, storage and states. The service also provides a way to validate if a session exists and dispose of the validation cache. The class uses several maps to store session data, including _storageSwarmMap, _historySwarmMap, _agentSwarmMap, _stateSwarmMap and _sessionSwarmMap. These maps store the session ID, swarm name and mode for each session. The service also uses a loggerService for logging purposes.

## SessionPublicService

The `SessionPublicService` is a Typescript class that provides methods for managing public session interactions. It takes in dependencies such as `loggerService`, `perfService`, `sessionConnectionService`, and `busService`. 

The class has several methods for interacting with the session, such as `emit`, `execute`, `run`, `connect`, and more. These methods allow for sending messages, executing commands, connecting to the session, committing messages (system, assistant, user), flushing the agent history, stopping tools from being executed, and disposing of the session.

Overall, this service is responsible for handling public session interactions and providing methods to interact with the session.

## SessionConnectionService

The `SessionConnectionService` is a Typescript class that implements the `ISession` interface. It is responsible for managing session connections and provides various methods to interact with the session. 

The class has a constructor that initializes the logger service, bus service, method context service, swarm connection service, policy connection service, and swarm schema service.

The `getSession` method retrieves a memoized session based on the clientId and swarmName provided.

The `emit` method allows you to emit a message to the session asynchronously.

The `execute` method executes a command in the session and returns the result asynchronously.

The `run` method runs the completion stateless.

The `connect` method connects to the session using a provided connector.

The `commitToolOutput` method commits tool output to the session asynchronously.

The `commitSystemMessage` method commits a system message to the session asynchronously.

The `commitAssistantMessage` method commits an assistant message to the session asynchronously.

The `commitUserMessage` method commits a user message to the agent without an answer asynchronously.

The `commitFlush` method commits all pending messages to the session asynchronously.

The `commitStopTools` method stops all running tools in the session asynchronously.

The `dispose` method disposes of the session connection service asynchronously.

## SchemaUtils

The `SchemaUtils` is a utility class that provides methods for performing operations related to schemas. It has a constructor that doesn't take any arguments. The class has two main properties: `writeSessionMemory` and `readSessionMemory`.

The `writeSessionMemory` property is a function that allows you to write a value into the session memory for a specific client. It takes two arguments: `clientId` (a string representing the client's ID) and `value` (the data you want to store in the session memory).

The `readSessionMemory` property is a function that allows you to read the value stored in the session memory for a specific client. It takes one argument: `clientId` (a string representing the client's ID).

Additionally, the `SchemaUtils` class has a property called `serialize`. This function serializes an object or an array of objects into a formatted string. It takes two arguments: `data` (the object or array you want to serialize) and `map` (an optional object that allows you to customize the serialization process).

## PolicyValidationService

The PolicyValidationService is a tool used within the agent-swarm to validate policies. It has a constructor that initializes the service and two properties, `loggerService` for logging purposes and `_policyMap` to store the policies.

To add a new policy, use the `addPolicy` function by providing a policy name and its schema. This will add the new policy to the validation service.

To validate a policy, use the `validate` function by providing a policy name and its source. This will check if the policy exists in the validation service.

## PolicyUtils

The `PolicyUtils` class in TypeScript provides utility methods for banning and unbanning clients in a distributed system. The class has two main methods: `banClient` and `unbanClient`. 

The `constructor` is used to initialize the class.

The `banClient` method takes a payload object with the client's ID, swarm name, and policy name as parameters. It returns a Promise that resolves when the client is successfully banned.

The `unbanClient` method also takes a payload object with the client's ID, swarm name, and policy name as parameters. It returns a Promise that resolves when the client is successfully unbanned.

The `hasBan` method checks if a client is currently banned by taking the same payload object as parameters. It returns a Promise that resolves to `true` if the client is banned, and `false` otherwise.

## PolicySchemaService

The PolicySchemaService is a service used for managing policy schemas. It has a constructor, loggerService property for logging service events, registry property to store registered policy schemas, and validateShallow property for shallow validation of policy schemas. The service provides two methods: register and get.

The `register` method is used to register a new policy schema by providing the key and value of the schema. This allows for easy storage and retrieval of policy schemas.

The `get` method is used to retrieve a policy schema by its name. It returns the registered policy schema associated with the provided key.

## PolicyPublicService

The `PolicyPublicService` class is an implementation of the `TPolicyConnectionService` interface. It is responsible for handling public policy operations, which include checking and managing bans for clients in specific swarms. The class has a constructor, properties such as `loggerService` and `policyConnectionService`, as well as several methods for validating input and output, banning or unbanning clients.

To use this service, you need to instantiate an object of the `PolicyPublicService` class and provide it with the necessary dependencies, such as a logger service and policy connection service. The `hasBan`, `getBanMessage`, `validateInput`, and `validateOutput` methods can be used to check if a client is banned, retrieve the ban message for a specific client in a swarm, and validate the input or output for a specific policy, respectively. The `banClient` and `unbanClient` methods can be used to ban or unban a client from a specific swarm, respectively.

## PolicyConnectionService

The `PolicyConnectionService` is a TypeScript class that implements the `IPolicy` interface and manages policy connections. It has a constructor that initializes the logger service, bus service, method context service, policy schema service. The class provides several methods to retrieve, validate and manage policies for clients in a swarm.

The `getPolicy` method retrieves a policy based on the provided policy name. The `hasBan` method checks if a client is banned in a specific swarm. The `getBanMessage` method retrieves the ban message for a client in a swarm. The `validateInput` method validates the input for a client in a swarm. The `validateOutput` method validates the output for a client in a swarm. The `banClient` method bans a client from a swarm, and the `unbanClient` method unbans a client from a swarm.

Overall, the `PolicyConnectionService` class provides functionality to manage policy connections, validate inputs and outputs for clients in a swarm, check ban status and retrieve ban messages for clients in a swarm.

## PersistSwarmUtils

The `PersistSwarmUtils` is a TypeScript class that implements the `IPersistSwarmControl` interface and provides utility functions for managing swarm-related persistence. It has a constructor, several properties and methods for interacting with active agents, navigation stacks and their storage.

The `PersistActiveAgentFactory` and `PersistNavigationStackFactory` properties are factories for active agent and navigation stack persistence, respectively. The `getActiveAgentStorage` and `getNavigationStackStorage` properties are memoized functions that return storage for active agents and navigation stacks, respectively.

The `getActiveAgent` method retrieves the active agent for a client in a swarm, while the `setActiveAgent` method sets the active agent for a client in a swarm. The `getNavigationStack` method retrieves the navigation stack for a client in a swarm, and the `setNavigationStack` method sets the navigation stack for a client in a swarm.

The `usePersistActiveAgentAdapter` and `usePersistNavigationStackAdapter` methods are used to set the factories for active agent and navigation stack persistence, respectively.

## PersistStorageUtils

The `PersistStorageUtils` is a utility class that implements the `IPersistStorageControl` interface. It provides methods and properties for managing storage persistence. The class has a constructor, properties such as `PersistStorageFactory` and `getPersistStorage`, as well as methods like `getData` and `setData`. 

The `getData` method retrieves the data for a client from a specific storage, while the `setData` method sets the data for a client in a specific storage. The `usePersistStorageAdapter` method is used to set the factory for storage persistence.

## PersistStateUtils

The `PersistStateUtils` is a utility class that implements the `IPersistStateControl` interface and provides functionality for managing state persistence. It has a constructor, two properties (`PersistStateFactory` and `getStateStorage`) and three methods (`setState`, `getState`, and `usePersistStateAdapter`).

The `setState` method allows you to set the state for a client asynchronously, while `getState` retrieves the state for a client asynchronously. Both methods require the `clientId` and `stateName`, as well as the new state or a default state if none is found.

The `getStateStorage` property is a memoized function that returns the storage for a specific state.

The `PersistStateFactory` property is used to set the factory for state persistence, which can be done using the `usePersistStateAdapter` method.

Overall, `PersistStateUtils` provides a way to manage state persistence in an application, allowing you to set and retrieve states for clients asynchronously.

## PersistList

The `PersistList` class in TypeScript is an extension of `PersistBase<EntityName>` and is used for persistent storage of entities in a list structure. It has several properties and methods to manage the list.

The `constructor` takes two parameters: `entityName`, which represents the type of entity being stored, and `baseDir`, which is the base directory for storing the persistent data.

There are four properties in this class: `_lastCount`, which keeps track of the last used numeric key; `__@LIST_CREATE_KEY_SYMBOL@525`, which creates a new unique key for each list item; `__@LIST_GET_LAST_KEY_SYMBOL@526`, which retrieves the key of the last item in the list; and `__@LIST_POP_SYMBOL@528`, which removes and returns the last item in the list.

The `push` method adds an entity to the end of the list, while the `pop` method removes and returns the last entity in the list. Both methods return a Promise, allowing for asynchronous operations.

## PersistBase

The `PersistBase` class is a base implementation for persistent storage of entities in a file system. It takes an `entityName` and a `baseDir` as parameters in its constructor. The `entityName` represents the name of the entity, while `baseDir` is the directory path where entity files are stored.

The class provides several methods for interacting with the stored entities. The `_getFilePath` method retrieves the file path for a specific entity. The `waitForInit` method waits for the initialization process to complete. The `getCount` method returns the number of entities stored in the system.

To read an entity from storage, you can use the `readValue` method. If you want to check if an entity exists in storage, you can use the `hasValue` method. To write an entity to storage, use the `writeValue` method. To remove an entity from storage, use the `removeValue` method. To remove all entities from storage, use the `removeAll` method.

The `values` method allows you to iterate over all entities in storage, while the `keys` method allows you to iterate over all entity IDs in storage. The `__@asyncIterator@483` property implements the `Symbol.asyncIterator` protocol, which enables the use of async iterators on this class.

The `filter` method filters entities based on a provided predicate, and the `take` method takes a limited number of entities, optionally filtered.

Overall, `PersistBase` provides a convenient way to store and manage entities in a file system, offering various methods for reading, writing, removing, and iterating over entities.

## PerfService

The PerfService is a performance tracking and logging service that monitors the execution times, input lengths, and output lengths for different client sessions. It uses various services such as loggerService, sessionValidationService, memorySchemaService, swarmValidationService, agentValidationService, statePublicService, swarmPublicService, policyPublicService, stateConnectionService, and executionScheduleMap to store and retrieve data.

The service provides properties like loggerService, sessionValidationService, memorySchemaService, swarmValidationService, agentValidationService, statePublicService, swarmPublicService, policyPublicService, stateConnectionService, executionScheduleMap, executionOutputLenMap, executionInputLenMap, executionCountMap, executionTimeMap, totalResponseTime, and totalRequestCount to access the underlying data.

It also offers methods like getActiveSessionExecutionCount, getActiveSessionExecutionTotalTime, getActiveSessionExecutionAverageTime, getActiveSessionAverageInputLength, getActiveSessionAverageOutputLength, getActiveSessionTotalInputLength, and getActiveSessionTotalOutputLength to retrieve performance data for specific clients. The service can start and end executions using the startExecution and endExecution methods, respectively.

The toClientRecord and toRecord methods are used for serialization, converting performance measures of a client or all clients, respectively. Finally, the dispose method is used to discard all data related to a given client.

## MemorySchemaService

The `MemorySchemaService` is a service that allows for managing memory schema across different sessions. It has a constructor, `loggerService` and `memoryMap` properties, as well as three methods: `writeValue`, `readValue` and `dispose`. 

The `writeValue` method allows you to write a value into the memory map for a specific client ID. The `readValue` method retrieves a value from the memory map for a given client ID. Lastly, the `dispose` method disposes of a memory map entry for the specified client ID.

This service provides a way to manage and manipulate data in memory for different clients, making it easier to keep track of data across multiple sessions.

## LoggerService

The LoggerService is a class that implements the ILogger interface, providing methods to log and debug messages. It has a constructor, several properties such as methodContextService and executionContextService, and methods like log, debug, info, and setLogger. The log method logs messages using the current logger, while debug and info log debug messages and info messages respectively. The setLogger method allows you to set a new logger. This class is useful for logging and debugging purposes in a system.

## LoggerInstance

The `LoggerInstance` class implements the `ILoggerInstance` interface and serves as a logger for an application. It is initialized with a `clientId` and optional callbacks. The logger instance waits for initialization using the `waitForInit` method, which returns a promise that resolves when the logger is ready.

The `log`, `debug`, and `info` methods are used to log different types of messages. The `log` method logs a general message, while the `debug` and `info` methods are used for debugging and informational messages, respectively. All methods take a `topic` parameter and optional additional arguments.

The `dispose` method is used to clean up any resources associated with the logger instance.

## HistoryPublicService

The `HistoryPublicService` is a TypeScript class that implements the `THistoryConnectionService` interface. It is responsible for handling public operations related to history management. This service provides methods for pushing, popping, and retrieving history messages. It also allows converting the history to an array format for a specific agent or in its raw form. The `dispose` method is used to clean up the history.

The `HistoryPublicService` class has a constructor, which is used to initialize any necessary dependencies. It also has properties such as `loggerService` and `historyConnectionService`, which are likely used for logging and connecting to the history service, respectively.

The `push` method is used to push a message into the history. It takes in parameters such as `message`, which is an instance of the `IModelMessage` interface, `methodName`, which is the name of the method being executed, `clientId`, which is the ID of the client making the request, and `agentName`, which is the name of the agent associated with the client.

The `pop` method is used to retrieve a message from the history. It takes in similar parameters as `push`, but instead of pushing a message, it retrieves the last pushed message.

The `toArrayForAgent` method is used to convert the history into an array format for a specific agent. It takes in parameters such as `prompt`, which is a message to be displayed, `methodName`, which is the name of the method being executed, `clientId`, which is the ID of the client making the request, and `agentName`, which is the name of the agent associated with the client.

The `toArrayForRaw` method is used to convert the history into a raw array format. It takes in parameters such as `methodName`, which is the name of the method being executed, `clientId`, which is the ID of the client making the request, and `agentName`, which is the name of the agent associated with the client.

The `dispose` method is used to clean up the history. It takes in similar parameters as `push`, but instead of pushing or retrieving a message, it disposes of the history.

## HistoryPersistInstance

The `HistoryPersistInstance` class is a persistent implementation of the `IHistoryInstance` interface, which allows for the management and persistence of history messages. It has a constructor that takes in `clientId` and optional `callbacks`, and provides methods to interact with the history messages.

The class has properties such as `clientId`, `callbacks`, and internal arrays for storing messages. It also has a `waitForInit` method to wait for the history to initialize, an `iterate` method for iterating over history messages of a specific agent, `push` method to add new messages to the history, `pop` method to remove the last message from history, and a `dispose` method to dispose of the history for a given agent.

## HistoryMemoryInstance

The `HistoryMemoryInstance` class in TypeScript represents a History Instance and implements the `IHistoryInstance` interface. It has a constructor that takes in `clientId` and `callbacks`, which are used to initialize the instance. The class also has several properties and methods for interacting with the history data.

The `waitForInit` method allows you to wait for the history data to initialize. The `iterate` method enables you to iterate over the history messages for a specific agent. The `push` method is used to add a new message to the history for a given agent. The `pop` method retrieves the last message from a history. Lastly, the `dispose` method is used to dispose of the history data for a given agent.

Overall, the `HistoryMemoryInstance` class provides a way to manage and interact with history data in TypeScript applications.

## HistoryConnectionService

The `HistoryConnectionService` is a TypeScript class that implements the `IHistory` interface. It is responsible for managing history connections and provides various methods to interact with the history. The class has a constructor that initializes the logger service, bus service, method context service, and session validation service.

The `getHistory` method retrieves the history for a given client and agent. The `push` method allows you to push a message to the history asynchronously. The `pop` method pops a message from the history asynchronously. The `toArrayForAgent` method converts the history to an array format for agents. The `toArrayForRaw` method converts the history to a raw array format. Finally, the `dispose` method disposes of the history connection service.

## EmbeddingValidationService

The EmbeddingValidationService is a tool used within the agent-swarm to validate embeddings. It has a constructor that initializes the service and two main properties: loggerService, which is used for logging messages and events during the validation process, and _embeddingMap, which is a map that stores the embeddings for validation.

To add a new embedding to the validation service, you can use the addEmbedding method. This method takes two parameters: embeddingName, which is the name of the new embedding you want to add, and embeddingSchema, which is an object containing the schema for the embedding.

To validate if a specific embedding exists in the validation service, you can use the validate method. This method takes two parameters: embeddingName, which is the name of the embedding you want to validate, and source, which is the origin or location of the embedding. The method will return a boolean value indicating whether the embedding exists in the validation service or not.

## EmbeddingSchemaService

The EmbeddingSchemaService is a service used for managing embedding schemas. It has a constructor, loggerService property for logging purposes, registry property to store registered embeddings, and validateShallow property for shallow validation of embedding schemas. The service provides two main functions: register and get. The `register` function is used to register a new embedding with the given key and value, while `get` function retrieves an embedding by its key.

## DocService

The `DocService` is a TypeScript class that provides methods for generating documentation and performance data. It uses several services such as `loggerService`, `perfService`, `swarmValidationService`, `agentValidationService`, `swarmSchemaService`, `agentSchemaService`, `policySchemaService`, `toolSchemaService`, `storageSchemaService`, `stateSchemaService`, `agentMetaService`, and `swarmMetaService` to perform its tasks.

The `DocService` has a constructor that initializes these services. It also has methods for writing documentation for swarm and agent schemas, dumping the documentation for all swarms and agents, dumping the performance data to a file, and dumping client-specific performance data to a file.

In summary, the `DocService` is a utility class that helps generate documentation and performance data for swarm and agent schemas using various services.

## CompletionValidationService

The CompletionValidationService is a TypeScript service designed to validate completion names. It has a constructor, which is used to initialize the service. The service also has two properties: `loggerService` and `_completionSet`. 

The `loggerService` property is used for logging messages, while `_completionSet` is a private property that stores the set of completion names.

The service provides two methods: `addCompletion` and `validate`. The `addCompletion` method is used to add a new completion name to the set. The `validate` method is used to check if a given completion name exists in the set, and it also takes a source parameter.

Overall, the CompletionValidationService is a useful tool for validating completion names in TypeScript.

## CompletionSchemaService

The `CompletionSchemaService` is a service that manages completion schemas. It has a constructor, properties like `loggerService`, `registry`, and `validateShallow` for logging, registry management and validation of completion schemas respectively. The `register` function is used to register a new completion schema by providing the key and value, while `get` function retrieves a completion schema by its key. This service allows for efficient management and retrieval of completion schemas.

## ClientSwarm

The ClientSwarm class is an implementation of the ISwarm interface that manages agents within a swarm. It has properties such as `params`, `_agentChangedSubject`, `_activeAgent`, and `_navigationStack` to handle various functionalities. The class also provides methods like `navigationPop`, `cancelOutput`, `getAgentName`, `getAgent`, `setAgentRef`, and `setAgentName` to interact with the swarm and its agents. The `waitForOutput` property allows waiting for output from the active agent.

## ClientStorage

The ClientStorage class is an implementation of the IStorage interface and provides methods to manage storage operations. It has a constructor that takes in parameters of type IStorageParams<T> and properties such as _itemMap, which is a Map that stores items based on their unique identifier, and _createEmbedding, which creates an embedding for a given item.

The class also has methods like take, which takes a specified number of items based on search criteria, upsert to upsert an item into the storage, remove to delete an item from the storage, clear to remove all items from the storage, get to retrieve an item by its ID, list to list all items in the storage (optionally filtered), and dispose to dispose of the state.

Additionally, there is a waitForInit property that allows waiting for the initialization of the storage.

## ClientState

The `ClientState` class represents the client state and implements `IState<State>`. It has a constructor that takes in `IStateParams<State>` as a parameter. The class has properties such as `params`, `_state`, and `dispatch`. The `params` property holds the state parameters, while `_state` stores the current state. The `dispatch` property is a function that dispatches an action and returns the updated state as a promise.

The `ClientState` class also has a method called `waitForInit` which waits for the state to initialize. It takes a function as an argument and returns a promise. The class has another method called `setState` which sets the state using a provided dispatch function and returns the updated state as a promise. The `clearState` method sets the state to its initial value and returns the updated state as a promise. The `getState` method retrieves the current state as a promise. Lastly, the `dispose` method disposes of the state.

## ClientSession

The ClientSession class is an implementation of the ISession interface. It has a constructor that takes in parameters of type ISessionParams. The class also has properties such as `params` and `_emitSubject`, and methods like `emit`, `execute`, `run`, `commitToolOutput`, `commitUserMessage`, `commitFlush`, `commitStopTools`, `commitSystemMessage`, and `commitAssistantMessage`. The class also has methods `connect` and `dispose`. The `emit` method sends a message, while the `execute` method executes a message and can optionally emit the output. The `run` method runs a completion stateless. The `commitToolOutput` method commits tool output, `commitUserMessage` method commits user message without answer, `commitFlush` method commits a flush of agent history, `commitStopTools` method commits the stop of the next tool execution, `commitSystemMessage` method commits a system message, and `commitAssistantMessage` method commits an assistant message. The `connect` method connects the session to a connector function, and `dispose` method should be called when the session is disposed.

## ClientPolicy

The `ClientPolicy` class in this Typescript API Reference represents a client policy that implements the `IPolicy` interface. It allows you to check if a client is banned, get the ban message for a client, validate input and output from/to clients, ban or unban a client. The class takes in `IPolicyParams` as a parameter during its instantiation.

The `params` property holds the input parameters for the policy, while `_banSet` is a set that stores the banned client IDs. The class provides several methods:

1. `hasBan(clientId: SessionId, swarmName: SwarmName): Promise<boolean>` - This method checks if a client is banned by checking the `_banSet` for a match between the provided `clientId` and `swarmName`.
2. `getBanMessage(clientId: SessionId, swarmName: SwarmName): Promise<string>` - This method retrieves the ban message for a client by checking the `_banSet` for a match between the provided `clientId` and `swarmName`.
3. `validateInput(incoming: string, clientId: SessionId, swarmName: SwarmName): Promise<boolean>` - This method validates the input from a client by performing some validation logic on the `incoming` string, `clientId`, and `swarmName`.
4. `validateOutput(outgoing: string, clientId: SessionId, swarmName: SwarmName): Promise<boolean>` - This method validates the output to a client by performing some validation logic on the `outgoing` string, `clientId`, and `swarmName`.
5. `banClient(clientId: SessionId, swarmName: SwarmName): Promise<void>` - This method bans a client by adding the provided `clientId` and `swarmName` to the `_banSet`.
6. `unbanClient(clientId: SessionId, swarmName: SwarmName): Promise<void>` - This method unbans a client by removing the provided `clientId` and `swarmName` from the `_banSet`.

These methods help in managing client policies by checking for bans, validating input and output from/to clients, and banning or unbanning clients as needed.

## ClientHistory

The `ClientHistory` class in TypeScript represents the history of client messages and implements the `IHistory` interface. It has a constructor that takes in `IHistoryParams` as a parameter. The class also has properties such as `params` and `_filterCondition`, which is a filter condition used for the `toArrayForAgent` method.

The class provides several methods: `push`, `pop`, `toArrayForRaw`, `toArrayForAgent`, and `dispose`. The `push` method adds a message to the history asynchronously, while `pop` removes and returns the last message from the history asynchronously. The `toArrayForRaw` method converts the history to an array of raw messages, and `toArrayForAgent` converts the history to an array of messages for the agent, taking into account a prompt and optional system messages. Finally, the `dispose` method should be called when an agent is disposed to clean up any resources.

## ClientAgent

The `ClientAgent` class in TypeScript implements the `IAgent` interface and represents a client agent that interacts with the system. It has a constructor that takes in `IAgentParams` as a parameter. The class has several properties and methods for executing messages, emitting output results after validation, resurrecting the model based on a given reason, waiting for output to be available, getting the completion message from the model, committing user messages without an answer, flushing the agent history, committing changes to prevent tool execution, committing system messages, committing assistant messages without execution, and committing tool output to the history. The `dispose` method should be called when the agent is disposed.

## BusService

The BusService is an implementation of the IBus interface that provides functionality for event handling and communication between different clients. It uses the loggerService and sessionValidationService for logging and validation purposes. The class has several properties, including _eventSourceSet and _eventWildcardMap for managing event subscriptions, and getEventSubject to retrieve the event subject.

The BusService provides methods for subscribing to events, subscribing once to a specific event, emitting events for a particular client, and disposing of event subscriptions for a specific client. It also has aliases commitExecutionBegin and commitExecutionEnd for emitting execution begin and end events, respectively.

Overall, the BusService acts as a communication hub for clients to subscribe, emit, and handle events in a structured manner.

## AgentValidationService

The `AgentValidationService` is a service used for validating agents within an agent swarm. It has a constructor that initializes the logger service, tool validation service, completion validation service, and storage validation service. The service also has several properties and methods for managing agents, their dependencies, storages, and states.

The `getAgentList` method retrieves a list of agent names. The `getStorageList` method retrieves a list of storages used by an agent. The `getStateList` method retrieves a list of states used by an agent.

The `addAgent` method adds a new agent to the validation service. The `hasStorage`, `hasDependency`, and `hasState` methods are memoized functions used to check if an agent has a registered storage, dependency, or state respectively.

The `validate` method is used to validate an agent by its name and source.

## AgentSchemaService

The `AgentSchemaService` is a service used for managing agent schemas. It has a constructor, properties such as `loggerService`, `registry`, and `validateShallow` for logging, registry management and validation of agent schema respectively. The `register` function is used to register a new agent schema by providing the key and value of the schema. The `get` function is used to retrieve an agent schema by its name.

## AgentPublicService

The `AgentPublicService` is a TypeScript class that provides methods for managing public agent operations. It implements the `TAgentConnectionService` interface. The class has a constructor, properties such as `loggerService` and `agentConnectionService`, and several methods including `createAgentRef`, `execute`, `run`, and more.

The `createAgentRef` method creates a reference to an agent by specifying the method name, client ID, and agent name. It returns a `ClientAgent` object as a promise.

The `execute` method executes a command on the agent by specifying the input, execution mode (e.g., `EXECUTION_MODE_SYNC` or `EXECUTION_MODE_ASYNC`), method name, client ID, and agent name. It returns a promise that resolves when the command is executed.

The `run` method runs the completion stateless by specifying the input, method name, client ID, and agent name. It returns the output as a promise.

The `waitForOutput` method waits for the agent's output by specifying the method name, client ID, and agent name. It returns the output as a promise.

The `commitToolOutput` method commits tool output to the agent by specifying the tool ID, content, method name, client ID, and agent name. It returns a promise that resolves when the output is committed.

The `commitSystemMessage` method commits a system message to the agent by specifying the message, method name, client ID, and agent name. It returns a promise that resolves when the message is committed.

The `commitAssistantMessage` method commits an assistant message to the agent history by specifying the message, method name, client ID, and agent name. It returns a promise that resolves when the message is committed.

The `commitUserMessage` method commits a user message to the agent without answer by specifying the message, method name, client ID, and agent name. It returns a promise that resolves when the message is committed.

The `commitFlush` method commits a flush of the agent history by specifying the method name, client ID, and agent name. It returns a promise that resolves when the flush is committed.

The `commitAgentChange` method commits a change of the agent to prevent the next tool execution from being called by specifying the method name, client ID, and agent name. It returns a promise that resolves when the change is committed.

The `commitStopTools` method prevents the next tool from being executed by specifying the method name, client ID, and agent name. It returns a promise that resolves when the prevention is committed.

The `dispose` method disposes of the agent by specifying the method name, client ID, and agent name. It returns a promise that resolves when the agent is disposed.

## AgentMetaService

The `AgentMetaService` is a class that provides methods for managing agent meta nodes and converting them to UML format. It has a constructor, properties such as `loggerService`, `agentSchemaService` and `serialize`, as well as methods like `makeAgentNode` and `toUML`. 

The `makeAgentNode` method creates a meta node for the given agent, while `makeAgentNodeCommon` does the same but with an optional `seen` parameter. The `toUML` method converts the meta nodes of a specific agent to UML format, with an optional `withSubtree` parameter.

## AgentConnectionService

The `AgentConnectionService` is a service that manages agent connections and provides methods for interacting with agents. It has a constructor that takes no arguments and several properties, including dependencies such as `loggerService`, `busService`, and others.

The service provides methods for retrieving an agent instance (`getAgent`), executing input commands (`execute`, `run`), waiting for output from the agent (`waitForOutput`), committing different types of messages (`commitToolOutput`, `commitSystemMessage`, `commitAssistantMessage`, `commitUserMessage`), committing agent change (`commitAgentChange`), preventing the next tool execution (`commitStopTools`), committing a flush of agent history (`commitFlush`), and disposing of the agent connection (`dispose`).

## AdapterUtils

AdapterUtils is a Typescript library that provides utility functions to interact with different chat completion APIs such as OpenAI, LMStudio and Ollama. The library allows you to create functions that can be used to communicate with these APIs and retrieve chat completion results.

The `constructor` function is used to initialize the AdapterUtils class.

The `fromOpenAI` property is a function that creates an adapter for interacting with OpenAI's chat completions. It takes in the OpenAI instance, an optional model name and response format as parameters. It returns a function that takes in the agent name, raw messages, mode, tools and client ID as parameters. This function then sends a request to OpenAI's API and returns the response in a specific format.

The `fromLMStudio` property is a function that creates an adapter for interacting with LMStudio's chat completions. It works similarly to the `fromOpenAI` function, but is used for LMStudio's API.

The `fromOllama` property is a function that creates an adapter for interacting with Ollama's chat completions. It takes in the Ollama instance, an optional model name and tool call protocol as parameters. It returns a function that works similarly to the previous functions, but is used for Ollama's API.

Overall, AdapterUtils provides a way to easily interact with different chat completion APIs in a consistent manner.
