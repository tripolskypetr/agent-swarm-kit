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

## ToolValidationService

The `ToolValidationService` is a service designed for validating tools within an agent-swarm system. It provides a way to add new tools and validate their existence. The service utilizes a loggerService for logging purposes and maintains an internal map of tools, represented by `_toolMap`.

To add a new tool, you can use the `addTool` function. This function takes two parameters: `toolName`, which is the name of the tool, and `toolSchema`, which is an object representing the schema of the tool.

To validate if a specific tool exists in the validation service, you can use the `validate` function. This function takes two parameters: `toolName`, which is the name of the tool to be validated, and `source`, which represents the source of the tool.

By using these functions, you can effectively manage and validate tools within your agent-swarm system.

## ToolSchemaService

The `ToolSchemaService` is a service that manages tool schemas. It has a constructor that initializes the service with a logger and registry. The `register` function allows you to register a tool with a given key and value, while the `get` function retrieves a tool by its key. This service is used to manage and access tool schemas in the application.

## SwarmValidationService

The SwarmValidationService is a service designed to validate swarms and their associated agents. It utilizes a loggerService for logging purposes, an agentValidationService to validate agents, and a swarmMap for storing swarms. The service provides three main functionalities: adding a new swarm to the map, retrieving the list of agents for a given swarm, and validating the swarm along with its agents. The addSwarm function allows you to add a new swarm by providing the swarm name and its schema. The getAgentList function retrieves the list of agents associated with a specific swarm. Lastly, the validate function validates a swarm and its agents by providing the swarm name and a source string.

## SwarmSchemaService

The SwarmSchemaService is a service that manages swarm schemas. It has a constructor, loggerService property for logging service messages, registry property to store registered swarm schemas, and register and get methods for adding new schemas and retrieving existing ones by their names, respectively.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It is designed to manage public interactions with swarms. The class has a constructor, several properties and methods for interacting with swarms, such as waiting for output, getting agent names and agents from swarms, setting agent references and names in swarms, and disposing of swarms. The properties include loggerService, swarmConnectionService, waitForOutput, getAgentName, getAgent, setAgentRef, setAgentName, and dispose. This service allows users to interact with swarms in a public context, providing methods to retrieve and update swarm information.

## SwarmConnectionService

The SwarmConnectionService is a TypeScript class that implements the ISwarm interface and manages connections to swarms. It has a constructor, several properties including loggerService, contextService, agentConnectionService, and swarmSchemaService. It also has several methods such as getSwarm, waitForOutput, getAgentName, getAgent, setAgentRef, setAgentName, and dispose. The getSwarm method retrieves a swarm instance based on client ID and swarm name. The waitForOutput method waits for output from the swarm. The getAgentName and getAgent methods retrieve the agent name and agent from the swarm, respectively. The setAgentRef and setAgentName methods allow setting the agent reference and name in the swarm. Finally, the dispose method is used to clean up and close the swarm connection.

## StorageValidationService

The StorageValidationService is a service designed to validate storages within the storage swarm. It has a constructor, loggerService property for logging purposes, embeddingValidationService property to validate the storage embeddings, and a private property _storageMap to store the added storages.

To add a new storage, you can use the `addStorage` method by providing a storage name and its schema. This will add the new storage to the validation service.

To validate an existing storage, you can use the `validate` method by providing the storage name and its source. This will initiate the validation process for that specific storage.

## StorageUtils

The `StorageUtils` is a TypeScript class that implements the `TStorage` interface. It provides several methods to interact with a storage system.

1. `constructor()`: This is the constructor method for `StorageUtils`.
2. `take()`: This method allows you to retrieve items from the storage. It takes a payload object containing search criteria, total count, client ID, agent name, and storage name. It returns a Promise that resolves to an array of items matching the specified criteria.
3. `upsert()`: This method allows you to upsert (insert or update) an item in the storage. It takes a payload object containing the item to be upserted, client ID, agent name, and storage name. It returns a Promise that resolves to `void`.
4. `remove()`: This method allows you to remove an item from the storage. It takes a payload object containing the item ID, client ID, agent name, and storage name. It returns a Promise that resolves to `void`.
5. `get()`: This method allows you to retrieve a specific item from the storage. It takes a payload object containing the item ID, client ID, agent name, and storage name. It returns a Promise that resolves to the specified item.
6. `list()`: This method allows you to list items from the storage. It takes a payload object containing client ID, agent name, storage name, and an optional filter function. It returns a Promise that resolves to an array of items matching the specified criteria.
7. `clear()`: This method allows you to clear the entire storage. It takes a payload object containing client ID, agent name, and storage name. It returns a Promise that resolves to `void`.

Overall, the `StorageUtils` class provides a set of methods to interact with a storage system, allowing you to retrieve, insert, update, remove, and list items in a storage.

## StorageSchemaService

The StorageSchemaService is a service used for managing storage schemas. It has a constructor, loggerService property, registry property and two methods: register() and get(). The loggerService property is used for logging, while the registry property stores registered storage schemas. The register() method is used to add a new storage schema, and the get() method retrieves a storage schema by its key.

## StoragePublicService

The `StoragePublicService` is a TypeScript class that implements the `TStorageConnectionService` interface. It provides methods for managing public storage interactions, such as retrieving, inserting, updating, and deleting data from the storage. The class has properties for `loggerService` and `storageConnectionService`.

The class offers several asynchronous methods:
1. `take` - Retrieves a list of storage data based on a search query and total number of items.
2. `upsert` - Upserts an item in the storage.
3. `remove` - Removes an item from the storage.
4. `get` - Retrieves an item from the storage by its ID.
5. `list` - Retrieves a list of items from the storage, optionally filtered by a predicate function.
6. `clear` - Clears all items from the storage.
7. `dispose` - Disposes of the storage.

These methods allow for efficient management and manipulation of data stored in the public storage system.

## StorageConnectionService

The StorageConnectionService is a service that manages storage connections and provides methods for retrieving, inserting, updating, and deleting storage data. It implements the IStorage interface and uses dependencies such as loggerService, contextService, storageSchemaService, sessionValidationService, and embeddingSchemaService.

The constructor initializes the service with these dependencies. The getSharedStorage method retrieves a shared storage instance based on the provided client ID and storage name. The getStorage method retrieves a storage instance based on the client ID and storage name. The take method retrieves a list of storage data based on a search query and total number of items. The upsert method inserts or updates an item in the storage. The remove method deletes an item from the storage. The get method retrieves an item from the storage by its ID. The list method retrieves a list of items from the storage, optionally filtered by a predicate function. The clear method clears all items from the storage. The dispose method disposes of the storage connection.

## StateUtils

The `StateUtils` class is a utility for managing state in an agent swarm. It provides methods to retrieve and set state for a specific client and state name. The `getState` method allows you to retrieve the state for a given client and state name asynchronously, while the `setState` method allows you to set a new state for the specified client and state name. Both methods return a promise, allowing you to handle the asynchronous operations in a more organized manner.

## StateSchemaService

The `StateSchemaService` is a service used for managing state schemas. It has a constructor, `loggerService` and `registry` properties, as well as `register` and `get` methods. The `loggerService` is used for logging messages, while the `registry` is used to store registered state schemas. The `register` method is used to add a new state schema, and the `get` method is used to retrieve a state schema by its key.

## StatePublicService

The `StatePublicService` is a class that implements the `TStateConnectionService` interface. It has a constructor, as well as properties `loggerService` and `stateConnectionService`. 

The class provides three main functions: `setState`, `getState`, and `dispose`. 

The `setState` function sets the state using a provided dispatch function. It takes in three parameters: `dispatchFn`, which is a function that takes the previous state and returns a promise for the new state, `clientId`, which is a string identifying the client, and `stateName`, which is a string identifying the state. It returns a promise for the new state.

The `getState` function retrieves the current state. It takes in two parameters: `clientId`, which is a string identifying the client, and `stateName`, which is a string identifying the state. It returns a promise for the current state.

The `dispose` function disposes the state. It takes in two parameters: `clientId`, which is a string identifying the client, and `stateName`, which is a string identifying the state. It returns a promise that resolves when the state has been successfully disposed.

## StateConnectionService

The `StateConnectionService` is a TypeScript class that manages state connections. It implements the `IState<T>` interface and provides several methods for working with state. The class has properties such as `loggerService`, `contextService`, `stateSchemaService`, and `sessionValidationService` which are used internally for logging, context management, state schema handling, and session validation.

The `getSharedStateRef` method is a memoized function that returns a shared state reference. It takes two parameters, `clientId` and `stateName`, and returns a `ClientState<any>`.

The `getStateRef` method is also a memoized function that returns a state reference. It works similarly to `getSharedStateRef`, taking the same parameters and returning a `ClientState<any>`.

The `setState` method sets the state by dispatching a function that takes the previous state as an argument and returns a promise that resolves to the updated state.

The `getState` method retrieves the current state by returning a promise that resolves to the current state.

The `dispose` method disposes the state connection, freeing up any resources associated with it.

## SessionValidationService

The `SessionValidationService` is a TypeScript class that provides methods for validating and managing sessions. It uses several properties to store session data, such as `_storageSwarmMap`, `_historySwarmMap`, `_agentSwarmMap`, and others.

To add a new session, you can use the `addSession` method by providing a client ID, swarm name, and session mode. You can also add agent usage, history usage, storage usage, and state usage to a session using the `addAgentUsage`, `addHistoryUsage`, `addStorageUsage`, and `addStateUsage` methods respectively.

To remove agent usage, history usage, storage usage, and state usage from a session, you can use the `removeAgentUsage`, `removeHistoryUsage`, `removeStorageUsage`, and `removeStateUsage` methods respectively.

The `getSessionMode` method allows you to retrieve the mode of a session by providing a client ID. The `hasSession` method checks if a session exists for the given client ID. The `getSessionList` method returns a list of all session IDs.

To get the list of agents for a session, you can use the `getSessionAgentList` method by providing a client ID. Similarly, the `getSessionHistoryList` method returns a list of history agents for a session. The `getSwarm` method retrieves the swarm name for a session by providing a client ID.

The `validate` method checks if a session exists for the given client ID and source. Finally, you can remove a session using the `removeSession` method by providing a client ID.

## SessionPublicService

The `SessionPublicService` is a TypeScript class that provides functionality for managing public session interactions. It implements the `TSessionConnectionService` interface. This service allows you to interact with a session by emitting messages, executing commands, connecting to the session, committing tool output and system messages, committing user messages without an answer, flushing the agent history, and disposing of the session. The class has properties for `loggerService`, `sessionConnectionService`, and functions for emitting, executing, connecting, committing tool output and system messages, committing user message without answer, flushing agent history, and disposing.

## SessionConnectionService

The `SessionConnectionService` is a TypeScript class that implements the `ISession` interface and provides functionality for managing session connections. It has a constructor that initializes the loggerService, contextService, swarmConnectionService, and swarmSchemaService properties.

The `getSession` method retrieves a memoized session based on the clientId and swarmName provided. The `emit` method allows you to emit a message to the session asynchronously. The `execute` method executes a command in the session and returns its result asynchronously.

The `connect` method connects to the session using a provided connector. The `commitToolOutput`, `commitSystemMessage`, and `commitUserMessage` methods allow you to commit tool output, system messages, and user messages to the session respectively. The `commitFlush` method commits any pending messages to the session.

The `dispose` method disposes of the session connection service, releasing any resources associated with it.

## LoggerService

The LoggerService is a class that implements the ILogger interface, providing methods to log and debug messages. It has a constructor that initializes the logger property. The class also has two properties: `_logger` and the log and debug methods. The `log` method logs messages using the current logger, while the `debug` method logs debug messages using the current logger. The `setLogger` method allows you to set a new logger for the LoggerService.

## HistoryUtils

The `HistoryUtils` class provides functionality for working with history data. It implements the `IHistoryAdapter` and `IHistoryControl` interfaces. The class constructor initializes properties such as `HistoryFactory`, `HistoryCallbacks`, and `getHistory`. 

To use a custom history adapter, you can call the `useHistoryAdapter` method, which takes a constructor as an argument. This allows you to customize the history adapter behavior.

If you want to use history lifecycle callbacks, you can utilize the `useHistoryCallbacks` method, which accepts a `Partial<IHistoryInstanceCallbacks>` as an argument. This enables you to add custom callbacks for history events.

To push a new message to the history, you can use the `push` method. It takes three arguments: the message data (`IModelMessage`), the client ID, and the agent name. This method returns a Promise that resolves when the message is successfully pushed to the history.

If you want to dispose of the history for a specific client and agent, you can call the `dispose` method. It takes the client ID and agent name as arguments, and returns a Promise that resolves when the history is successfully disposed.

The `iterate` method allows you to iterate over the history messages. It takes the client ID and agent name as arguments, and returns an `AsyncIterableIterator` containing the history messages.

## HistoryPublicService

The `HistoryPublicService` is a TypeScript class that implements the `THistoryConnectionService` interface. It is responsible for handling public operations related to history management. The class has a constructor, properties such as `loggerService`, `historyConnectionService`, and methods like `push`, `toArrayForAgent`, `toArrayForRaw`, and `dispose`.

The `push` method allows you to push a message to the history asynchronously. It takes three parameters: `message` of type `IModelMessage`, `clientId` of type string, and `agentName` of type string.

The `toArrayForAgent` method converts the history to an array specifically for a given agent. It takes three parameters: `prompt` of type string, `clientId` of type string, and `agentName` of type string. The method returns an array of `IModelMessage` objects asynchronously.

The `toArrayForRaw` method converts the history to a raw array. It takes two parameters: `clientId` of type string and `agentName` of type string. The method returns an array of `IModelMessage` objects asynchronously.

The `dispose` method allows you to dispose of the history asynchronously. It takes two parameters: `clientId` of type string and `agentName` of type string.

Overall, the `HistoryPublicService` class provides methods to interact with the history, including pushing messages, converting history to arrays for specific agents or raw data, and disposing of the history.

## HistoryInstance

The `HistoryInstance` class in TypeScript represents a History Instance and implements the `IHistoryInstance` interface. It has a constructor that takes in `clientId` and `callbacks`, which are used to initialize the instance. The class also has properties such as `clientId`, `callbacks`, and `_array` for internal use.

The class provides methods like `waitForInit`, which waits for the history to initialize, `push`, which pushes a new message to the history for a given agent, and `dispose`, which disposes of the history for a given agent.

Additionally, the class has a method called `iterate`, which allows you to iterate over the history messages for a given agent as an `AsyncIterableIterator`.

## HistoryConnectionService

The `HistoryConnectionService` is a TypeScript class that implements the `IHistory` interface and provides functionality for managing history connections. It has a constructor that takes no arguments, and three properties: `loggerService`, `contextService`, and `sessionValidationService`.

The class has four methods: `getHistory`, `push`, `toArrayForAgent`, and `toArrayForRaw`. The `getHistory` method retrieves the history for a given client and agent. The `push` method pushes a message to the history asynchronously. The `toArrayForAgent` method converts the history to an array format for agents. The `toArrayForRaw` method converts the history to a raw array format. Lastly, the `dispose` method disposes of the history connection service asynchronously.

## EmbeddingValidationService

The EmbeddingValidationService is a tool used within the agent-swarm to validate embeddings. It has a constructor that initializes the service and two main properties: `loggerService` for logging and `_embeddingMap` to store the embeddings.

To add a new embedding, you can use the `addEmbedding` function, which takes the embedding name and its schema as parameters. This function adds the embedding to the validation service for future use.

To validate if an embedding exists, you can use the `validate` function. It takes the embedding name and its source as parameters. This function checks if the specified embedding exists in the validation service.

Overall, this API reference describes a service for validating embeddings within the agent-swarm system, allowing for efficient management and validation of embeddings.

## EmbeddingSchemaService

The EmbeddingSchemaService is a service used for managing embedding schemas. It has a constructor, loggerService property of any type and registry property of another any type. The service also has two methods: register and get. The `register` method is used to register an embedding with a given key and value. The `get` method is used to retrieve an embedding by its key.

## CompletionValidationService

The CompletionValidationService is a service used for validating completion names. It has a constructor, loggerService property, and _completionSet property. The constructor is used to initialize the service, while loggerService and _completionSet are used for logging and storing completion names respectively. The service also has two methods: addCompletion and validate. 

The addCompletion method is used to add a new completion name to the set. This means that a new completion name can be added to the service's set of completion names.

The validate method is used to check if a completion name exists in the set. It takes two parameters: completionName and source. The method will return a boolean value indicating whether the completion name exists in the set or not. This method can be used to ensure that a completion name is valid before using it.

## CompletionSchemaService

The `CompletionSchemaService` is a service used for managing completion schemas. It has a constructor, `loggerService` and `registry` properties, as well as two methods: `register` and `get`. The `loggerService` is used for logging, while the `registry` stores registered completion schemas.

The `register` method is used to add a new completion schema by providing a key and the corresponding `ICompletionSchema` object.

The `get` method retrieves a completion schema by its key.

## ClientSwarm

The ClientSwarm class is an implementation of the ISwarm interface and manages agents within a swarm. It has a constructor that takes in parameters defined by the ISwarmParams interface. The class also has several properties and methods for interacting with the swarm.

The `waitForOutput` method waits for output from the currently active agent in the swarm. The `getAgentName` method retrieves the name of the currently active agent, while `getAgent` method returns the currently active agent.

To set a reference of an agent in the swarm, you can use the `setAgentRef` method by providing the agent's name and a reference to the agent itself. To set the active agent by name, you can use the `setAgentName` method.

## ClientStorage

The ClientStorage class is an implementation of the IStorage interface, designed to manage storage operations. It has a constructor that takes in parameters defined by the IStorageParams interface for a generic type T. The class has several properties and methods for performing various storage operations.

The _itemMap property is used to store items in the storage. The _createEmbedding method creates an embedding for a given item, which is used to generate embeddings for search purposes. The waitForInit property is a function that waits for the storage to be initialized.

The take method allows you to retrieve a specified number of items based on search criteria. The upsert method is used to insert or update an item in the storage. The remove method removes an item from the storage by its ID. The clear method clears all items from the storage. The get method retrieves an item by its ID. The list method lists all items in the storage, optionally filtered by a predicate. Finally, the dispose method is used to release any resources held by the storage.

## ClientState

The `ClientState` class is an implementation of the `IState<State>` interface, representing the client's state. It has a constructor that takes in parameters of type `IStateParams<State>`. The class has several properties, including `params`, which holds the state parameters; `_state` to store the current state; `dispatch`, which is used to dispatch actions; and `waitForInit`, a function that waits for the state to initialize.

The class also provides methods such as `setState`, which sets the state using a provided dispatch function; `getState`, which retrieves the current state; and `dispose`, which disposes of the state.

## ClientSession

The `ClientSession` class in this Typescript API Reference is an implementation of the `ISession` interface. It provides various methods and properties for managing communication between a client and an agent.

The `ClientSession` constructor takes in a parameter of type `ISessionParams` to initialize the session. The class also includes properties such as `params`, `_emitSubject`, `emit`, `execute`, `commitToolOutput`, `commitUserMessage`, `commitFlush`, `commitSystemMessage`, `connect`, and `dispose`.

The `emit` method allows the client to emit a message, while `execute` executes a message and optionally emits the output. The `commitToolOutput` method is used to commit tool output, `commitUserMessage` commits a user message without an answer, `commitFlush` commits a flush of the agent's history, and `commitSystemMessage` commits a system message.

The `connect` method connects the session to a connector function, and `dispose` should be called when the session is no longer needed to properly dispose of resources.

## ClientHistory

The `ClientHistory` class in TypeScript represents the history of messages exchanged between a client and an AI model. It implements the `IHistory` interface and provides various methods to interact with the message history.

The class has a constructor that takes in `IHistoryParams` as a parameter. It also has properties such as `params`, which holds the parameters for the history, and `_filterCondition`, which is a filter condition used in the `toArrayForAgent` method.

The `push` method allows you to add a new message to the history asynchronously. The `toArrayForRaw` method converts the history into an array of raw messages asynchronously. The `toArrayForAgent` method converts the history into an array of messages suitable for displaying to the agent, taking into account a prompt and optional system messages. Finally, the `dispose` method should be called when an agent is disposed to clean up any resources associated with the history.

## ClientAgent

The `ClientAgent` class in TypeScript implements the `IAgent` interface and represents a client agent that interacts with the system. It has a constructor that takes in `IAgentParams` as a parameter. The class has several properties and methods for handling agent interactions, such as emitting output results after validation, resurrecting the model based on a given reason, waiting for output to be available, getting completion messages from the model, committing user and system messages to history, committing tool outputs to the history, and executing incoming messages while processing tool calls if necessary. The `dispose` method should be called when the agent is disposed.

## AgentValidationService

The `AgentValidationService` is a service used for validating agents within an agent swarm. It has a constructor that initializes the logger service, tool validation service, completion validation service, and storage validation service. The service also has properties for these services and an internal `_agentMap` for storing agent information.

The service provides methods to retrieve the list of storages and states used by an agent. The `getStorageList` method returns an array of storage names used by the specified agent, while `getStateList` returns an array of state names used by the specified agent.

To add a new agent, you can use the `addAgent` method by providing the agent name and its schema.

The `hasStorage` method checks if an agent has a registered storage by its name, and the `hasState` method checks if an agent has a registered state by its name. Both methods return `true` if the storage or state is registered, and `false` otherwise.

To validate an agent by its name and source, you can use the `validate` method.

## AgentSchemaService

The `AgentSchemaService` is a service that manages agent schemas. It has a constructor, `loggerService` and `registry` properties, as well as `register` and `get` methods. The `register` method is used to add a new agent schema, while the `get` method retrieves an agent schema by its name. This service is useful for managing and accessing agent schemas in a system.

## AgentPublicService

The `AgentPublicService` is a TypeScript class that implements the `TAgentConnectionService` interface. It provides methods for managing public agent operations, such as creating an agent reference, executing commands on the agent, waiting for output from the agent, committing tool and system messages to the agent, flushing the agent's history, and disposing of an agent. The class also has properties for the `loggerService` and `agentConnectionService`.

## AgentConnectionService

The `AgentConnectionService` is a TypeScript class that implements the `IAgent` interface and manages agent connections. It has a constructor that initializes various properties such as `loggerService`, `contextService`, `sessionValidationService`, `historyConnectionService`, `storageConnectionService`, `agentSchemaService`, `toolSchemaService`, and `completionSchemaService`.

The class provides several methods for interacting with the agent connection. The `getAgent` method retrieves an agent instance based on the provided `clientId` and `agentName`. The `execute` method executes an input command and returns a promise. The `waitForOutput` method waits for the output from the agent. The `commitToolOutput`, `commitSystemMessage`, and `commitUserMessage` methods commit tool output, system messages, and user messages without answers respectively. The `commitAgentChange`, `commitFlush`, and `dispose` methods commit agent changes, flush the agent history, and dispose of the agent connection respectively.

Overall, `AgentConnectionService` is a service that handles agent connections and provides methods to execute commands, commit messages, flush history, and dispose of the connection.
