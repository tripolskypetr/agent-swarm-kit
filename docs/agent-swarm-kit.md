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

To add a new tool to the validation service, you can use the `addTool` function. This function takes two parameters: `toolName`, which is the name of the tool, and `toolSchema`, which is an object representing the schema of the tool.

To validate if a specific tool exists in the validation service, you can use the `validate` function. This function takes two parameters: `toolName`, which is the name of the tool to be validated, and `source`, which represents the source of the tool.

By using these functions, you can effectively manage and validate tools within your agent-swarm system.

## ToolSchemaService

The `ToolSchemaService` is a service that manages tool schemas. It has a constructor, `loggerService` and `registry` properties, as well as two methods: `register` and `get`. The `loggerService` property is used for logging, while the `registry` property is used to store registered tools. The `register` method allows you to register a tool with a given key and value, while the `get` method retrieves a tool by its key.

## SwarmValidationService

The SwarmValidationService is a service used for validating swarms and their agents. It has a constructor, loggerService and agentValidationService properties. The constructor is used to initialize the service, while loggerService and agentValidationService are used for logging and validating agents respectively. The service also has a swarmMap property to store the added swarms.

To add a new swarm, you can use the `addSwarm` method by passing in the swarm name and its schema. This will add the swarm to the swarm map.

To retrieve a list of agents for a given swarm, you can use the `getAgentList` method by passing in the swarm name. This will return an array of agent names for the specified swarm.

To validate a swarm and its agents, you can use the `validate` method by passing in the swarm name and its source code. This will validate the swarm and its agents using the loggerService and agentValidationService properties.

## SwarmSchemaService

The SwarmSchemaService is a service that manages swarm schemas. It has a constructor, loggerService property for logging purposes, and registry property to store registered swarm schemas. The service provides two methods: `register` and `get`. The `register` method is used to add a new swarm schema by providing a key and the ISwarmSchema object as parameters. The `get` method retrieves a swarm schema by its name, given as the key parameter.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It is designed to manage public interactions with swarms. The class has a constructor, several properties and methods for handling swarm interactions such as canceling output, waiting for output from the swarm, getting agent name and agent details from the swarm, setting agent references and names in the swarm, and disposing of a swarm. The class utilizes the loggerService and swarmConnectionService properties for logging and managing connections to the swarm respectively.

## SwarmConnectionService

The SwarmConnectionService is a TypeScript class that implements the ISwarm interface and provides functionality for managing swarm connections. It has a constructor that initializes the loggerService, busService, methodContextService, agentConnectionService, and swarmSchemaService properties. The service also includes several methods for retrieving swarm instances, agent information, and managing the connection.

The getSwarm method retrieves a swarm instance based on the client ID and swarm name. The cancelOutput method cancels the await of output by emitting an empty string. The waitForOutput method waits for the output from the swarm. The getAgentName method retrieves the agent name from the swarm, while the getAgent method retrieves the agent from the swarm. The setAgentRef method sets the agent reference in the swarm, and the setAgentName method sets the agent name in the swarm. Finally, the dispose method is used to dispose of the swarm connection.

## StorageValidationService

The StorageValidationService is a service used for validating storages within the storage swarm. It has a constructor, loggerService property, embeddingValidationService property and a private _storageMap. The constructor is used to initialize the service, while addStorage function is used to add a new storage to the validation service. The validate function is used to validate a storage by its name and source.

## StorageUtils

The `StorageUtils` is a TypeScript class that implements the `TStorage` interface. It provides several methods to interact with a storage system.

1. `constructor()`: This is the constructor method for `StorageUtils`.
2. `take<T extends IStorageData = IStorageData>(payload: { search: string; total: number; clientId: string; agentName: string; storageName: string; score?: number; }) => Promise<T[]>`: This method allows you to retrieve items from the storage based on a search query, total count, client ID, agent name, storage name, and an optional score. It returns a promise that resolves to an array of items matching the search criteria.
3. `upsert<T extends IStorageData = IStorageData>(payload: { item: T; clientId: string; agentName: string; storageName: string; }) => Promise<void>`: This method allows you to upsert (insert or update) an item in the storage. It takes an object containing the item to be upserted, client ID, agent name, and storage name. It returns a promise that resolves to `void`.
4. `remove(payload: { itemId: StorageId; clientId: string; agentName: string; storageName: string; }) => Promise<void>`: This method allows you to remove an item from the storage based on its ID, client ID, agent name, and storage name. It returns a promise that resolves to `void`.
5. `get<T extends IStorageData = IStorageData>(payload: { itemId: StorageId; clientId: string; agentName: string; storageName: string; }) => Promise<T>`: This method allows you to retrieve a specific item from the storage based on its ID, client ID, agent name, and storage name. It returns a promise that resolves to the retrieved item.
6. `list<T extends IStorageData = IStorageData>(payload: { clientId: string; agentName: string; storageName: string; filter?: (item: T) => boolean; }) => Promise<T[]>`: This method allows you to list items from the storage based on client ID, agent name, and storage name. You can also provide a filter function to specify specific criteria for the items you want to list. It returns a promise that resolves to an array of items matching the provided criteria.
7. `clear(payload: { clientId: string; agentName: string; storageName: string; }) => Promise<void>`: This method allows you to clear the entire storage for a specific client, agent, and storage name. It returns a promise that resolves to `void`.

Overall, the `StorageUtils` class provides a set of methods to interact with a storage system, allowing you to retrieve, insert, update, remove, and list items based on various criteria.

## StorageSchemaService

The StorageSchemaService is a service used for managing storage schemas. It has a constructor, loggerService property, registry property and two methods: register() and get(). The loggerService property is used for logging messages, while the registry property stores registered storage schemas. The register() method is used to add a new storage schema, and the get() method retrieves a storage schema by its key.

## StoragePublicService

The `StoragePublicService` is a TypeScript class that implements the `TStorageConnectionService` interface. It is responsible for managing interactions with public storage services. The class has a constructor, several properties and methods for performing various storage operations.

The `loggerService` and `storageConnectionService` are properties that provide logging and storage connection functionalities, respectively.

The `take` method retrieves a list of storage data based on a search query and total number of items. It returns a Promise that resolves to an array of `IStorageData` objects.

The `upsert` method upserts an item into the storage. It takes an `IStorageData` object, along with method name, client ID, and storage name as parameters. It returns a Promise that resolves when the operation is complete.

The `remove` method removes an item from the storage based on its ID. It takes the item's `StorageId`, along with method name, client ID, and storage name as parameters. It returns a Promise that resolves when the operation is complete.

The `get` method retrieves an item from the storage by its ID. It takes an `StorageId`, along with method name, client ID, and storage name as parameters. It returns a Promise that resolves to an `IStorageData` object.

The `list` method retrieves a list of items from the storage, optionally filtered by a predicate function. It takes method name, client ID, storage name, and an optional filter function as parameters. The filter function can be used to specify conditions for the items that should be included in the list. It returns a Promise that resolves to an array of `IStorageData` objects.

The `clear` method clears all items from the storage. It takes method name, client ID, and storage name as parameters. It returns a Promise that resolves when the operation is complete.

The `dispose` method disposes of the storage. It takes method name, client ID, and storage name as parameters. It returns a Promise that resolves when the storage is disposed.

## StorageConnectionService

The StorageConnectionService is a service that manages storage connections and provides methods for interacting with the storage. It implements the IStorage interface and has properties for other services such as loggerService, busService, methodContextService, storageSchemaService, sessionValidationService, and embeddingSchemaService.

The constructor is used to initialize the service. The getSharedStorage method retrieves a shared storage instance based on the storage name. The getStorage method retrieves a storage instance based on the client ID and storage name. The take method retrieves a list of storage data based on a search query and total number of items. The upsert method upserts an item in the storage. The remove method removes an item from the storage. The get method retrieves an item from the storage by its ID. The list method retrieves a list of items from the storage, optionally filtered by a predicate function. The clear method clears all items from the storage. The dispose method disposes of the storage connection.

## StateUtils

The `StateUtils` class is a utility for managing state in an agent swarm. It provides methods to retrieve and set state for a specific client and state name. The `getState` method allows you to retrieve the state for a given client and state name, while the `setState` method allows you to set a new state for the specified client and state name. Both methods return a promise, allowing you to handle the asynchronous nature of state operations.

## StateSchemaService

The `StateSchemaService` is a service used for managing state schemas. It has a constructor, `loggerService` and `registry` properties, as well as `register` and `get` methods. The `loggerService` is used for logging, while the `registry` stores registered state schemas. The `register` method is used to add a new state schema, and the `get` method retrieves a state schema by its key.

## StatePublicService

The `StatePublicService` is an implementation of the `TStateConnectionService` interface. It has a constructor, and two properties: `loggerService` and `stateConnectionService`. 

The `setState` function sets the state using a provided dispatch function, which returns a promise with the updated state. 

The `getState` function retrieves the current state as a promise. 

The `dispose` function disposes the state, and returns a promise indicating that the disposal process is complete.

## StateConnectionService

The `StateConnectionService` is a TypeScript class that manages state connections. It implements the `IState<T>` interface and provides several methods for working with state connections. The class has properties such as `loggerService`, `busService`, `methodContextService`, `stateSchemaService`, and `sessionValidationService` which are used for logging, event bus communication, method context management, state schema handling, and session validation respectively.

The `getSharedStateRef` method is a memoized function that returns a shared state reference, allowing multiple clients to access the same state. It also implements `IClearableMemoize<string>` and `IControlMemoize<string, ClientState<any>>` interfaces.

The `getStateRef` method is a memoized function that returns a state reference. Similar to `getSharedStateRef`, it also implements `IClearableMemoize<string>` and `IControlMemoize<string, ClientState<any>>` interfaces.

The `setState` method sets the state by dispatching a function that takes the previous state as an argument and returns a promise that resolves to the updated state.

The `getState` method retrieves the current state by returning a promise that resolves to the current state.

The `dispose` method disposes the state connection, releasing any resources associated with it.

Overall, the `StateConnectionService` provides a way to manage state connections, retrieve and update the state, and dispose of the connection when it's no longer needed.

## SessionValidationService

The `SessionValidationService` is a service that handles session validation and management. It has a constructor that initializes various properties such as `loggerService`, `_storageSwarmMap`, `_historySwarmMap`, `_agentSwarmMap`, `_stateSwarmMap`, and `_sessionSwarmMap`. These properties are used to store and manage session data.

The service provides methods to add sessions, agents, history, storage, and state usage to a session. It also allows for the removal of agent, history, storage, and state usage from a session. The `getSessionMode` method retrieves the mode of a session, while `hasSession` checks if a session exists.

The `getSessionList` method returns a list of all session IDs, and `getSessionAgentList` retrieves the list of agents for a specific session. The `getSessionHistoryList` method returns the history list of agents for a session. The `getSwarm` method retrieves the swarm name for a session.

The `validate` method checks if a session exists, and the `removeSession` method removes a session.

Overall, this service provides functionality to manage and validate sessions in a distributed system.

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

These methods allow for interaction with the session, including sending messages and executing commands. The `loggerService` is used for logging, while the `sessionConnectionService` is used for managing session connections.

## SessionConnectionService

The SessionConnectionService is a TypeScript class that implements the ISession interface and manages session connections. It has a constructor that initializes the loggerService, busService, methodContextService, swarmConnectionService, and swarmSchemaService properties. The service provides several methods for retrieving, emitting, executing commands in the session, connecting to a session using a connector, committing tool output, system messages and user messages to the session, committing changes, and disposing of the session connection service.

## SchemaUtils

The `SchemaUtils` is a utility class that provides functions for performing operations related to schemas. It has a constructor that does not take any parameters.

The class includes a property called `serialize`, which is a generic function that can serialize an object or an array of objects into a formatted string. This function can be used to convert data into a string representation for various purposes.

## LoggerUtils

The `LoggerUtils` is a TypeScript class that implements `ILoggerAdapter` and `ILoggerControl`. It has a constructor, several properties and methods for logging different levels of information, as well as a dispose method. The class allows you to create a logger instance and use client callbacks, adapters or a combination of both to log information. The `logClient`, `infoClient` and `debugClient` methods are used to log information at different levels for a specific client, while the `log`, `debug` and `info` methods log information at different levels without specifying a client. The `dispose` method is used to clean up resources when the logger instance is no longer needed.

## LoggerService

The LoggerService is a class that implements the ILogger interface, providing methods to log and debug messages. It has a constructor, several properties such as methodContextService and executionContextService, and methods like log, debug, info, and setLogger. The log method logs messages using the current logger, while debug and info log debug messages and info messages respectively. The setLogger method allows you to set a new logger. This service is useful for logging and debugging purposes in a software application.

## LoggerInstance

The `LoggerInstance` class is an implementation of the `ILoggerInstance` interface. It is constructed with a `clientId` and an optional set of callbacks defined in the `ILoggerInstanceCallbacks` interface. The `clientId` is a unique identifier for the client instance.

The `LoggerInstance` class has a private property, `__@LOGGER_INSTANCE_WAIT_FOR_INIT@1631`, which is used internally for waiting for initialization.

The `waitForInit` method returns a Promise that resolves when the logger instance is initialized.

The `log`, `debug`, and `info` methods are used to log messages with different levels of severity. The `topic` parameter specifies the topic or category of the log message, and `args` is an array of additional arguments to be included in the log message.

The `dispose` method is used to clean up any resources associated with the logger instance.

## HistoryUtils

The `HistoryUtils` class provides functionality for managing and interacting with the history of messages. It implements `IHistoryAdapter` and `IHistoryControl`, which allow for customization and control over the history. The class has a constructor, several properties and methods for interacting with the history.

The `HistoryFactory` and `HistoryCallbacks` properties store any custom factories and callbacks used by the history. The `getHistory` method retrieves the history of messages. The `useHistoryAdapter` method allows for using a custom history adapter, while the `useHistoryCallbacks` method enables using history lifecycle callbacks.

The `push` method is used to add a new message to the history, and it returns a promise that resolves when the message is successfully added. The `dispose` method disposes of the history for a specific client and agent, returning a promise that resolves when the disposal is complete.

The `iterate` method allows for iterating over the history messages, returning an `AsyncIterableIterator` that can be used to access each message in the history.

## HistoryPublicService

The `HistoryPublicService` is a TypeScript class that implements the `THistoryConnectionService` interface. It is responsible for handling public operations related to the history. The class has a constructor, properties such as `loggerService`, `historyConnectionService`, and methods like `push`, `toArrayForAgent`, `toArrayForRaw`, and `dispose`.

The `push` method allows you to push a message to the history asynchronously. It takes in a `message` object of type `IModelMessage`, the `methodName` representing the method being called, the `clientId` of the client making the request, and `agentName` of the agent associated with this history.

The `toArrayForAgent` method converts the history into an array specifically for a given agent. It takes in the `prompt` representing a message or prompt, the `methodName`, `clientId`, and `agentName`.

The `toArrayForRaw` method converts the history into a raw array. It takes in the `methodName`, `clientId`, and `agentName`.

Lastly, the `dispose` method allows you to dispose of the history asynchronously. It takes in the `methodName`, `clientId`, and `agentName`.

Overall, the `HistoryPublicService` class provides methods to interact with the history, including pushing messages, converting to arrays for specific agents or raw data, and disposing of the history.

## HistoryInstance

The `HistoryInstance` class in TypeScript represents a History Instance and implements the `IHistoryInstance` interface. It has a constructor that takes in `clientId` and `callbacks`, which are used to initialize the instance. The class also has several properties and methods to interact with the history.

The `clientId` property holds the unique identifier for the client, while `callbacks` is an optional parameter that allows for partial implementation of the `IHistoryInstanceCallbacks` interface. The class also has a private `_array` property and an internal variable `__@HISTORY_INSTANCE_WAIT_FOR_INIT@413` used for internal operations.

The class provides three main methods: `waitForInit`, `iterate`, and `push`. The `waitForInit` method allows you to wait for the history to initialize by specifying an agent name. The `iterate` method enables you to iterate over the history messages for a specific agent. The `push` method is used to add a new message to the history for a given agent. Finally, the `dispose` method allows you to dispose of the history for a given agent.

Overall, the `HistoryInstance` class provides a way to manage and interact with the history of messages for a specific agent in TypeScript.

## HistoryConnectionService

The `HistoryConnectionService` is a TypeScript class that implements the `IHistory` interface and provides functionality for managing history connections. It has a constructor that initializes the loggerService, busService, methodContextService, and sessionValidationService.

The `getHistory` method retrieves the history for a specific client and agent. The `push` method allows you to push a message to the history. The `toArrayForAgent` method converts the history to an array format for agents. The `toArrayForRaw` method converts the history to a raw array format. Finally, the `dispose` method disposes of the history connection service.

## EmbeddingValidationService

The EmbeddingValidationService is a tool used within the agent-swarm to validate embeddings. It has a constructor that initializes the service and two main functions: `addEmbedding` and `validate`. 

The `addEmbedding` function is used to add a new embedding to the validation service. You need to provide an `embeddingName` and the `embeddingSchema`, which defines the structure and properties of the embedding.

The `validate` function is used to check if a specific embedding exists in the validation service. You need to provide an `embeddingName` and the `source`, which is a string that identifies the source of the embedding.

Overall, this service helps ensure that the embeddings used within the agent-swarm are valid and properly defined.

## EmbeddingSchemaService

The EmbeddingSchemaService is a service that allows you to manage embedding schemas. It has a constructor, loggerService and registry properties. The `register` function is used to register an embedding with a given key and value, while the `get` function retrieves an embedding by its key. This service provides a way to store and retrieve embedding schemas in your application.

## CompletionValidationService

The CompletionValidationService is a TypeScript service that allows you to validate completion names. It has a constructor, which is used to initialize the service. The service also has two properties: `loggerService` and `_completionSet`. 

The `loggerService` property is used for logging messages, while `_completionSet` is a private property that stores the set of completion names.

To add a new completion name to the set, you can use the `addCompletion` method. This method takes a string parameter `completionName` and adds it to the set.

To validate if a completion name exists in the set, you can use the `validate` method. This method takes two parameters: `completionName` (a string representing the name to validate) and `source` (a string representing the source of the completion name). The method will return `true` if the completion name exists in the set, and `false` otherwise.

## CompletionSchemaService

The `CompletionSchemaService` is a service used for managing completion schemas. It has a constructor, `loggerService` and `registry` properties, as well as two methods: `register` and `get`. 

The `register` method is used to register a new completion schema by providing a key and the corresponding `ICompletionSchema` object. 

The `get` method retrieves a completion schema by its key. 

Overall, this service allows for the management of completion schemas by registering new ones and retrieving them based on their keys.

## ClientSwarm

The ClientSwarm class is an implementation of the ISwarm interface and manages agents within a swarm. It has properties such as `params`, `_agentChangedSubject`, `_activeAgent`, and `_cancelOutputSubject`. The class also provides methods like `cancelOutput`, which cancels the await of output by emitting an empty string, and `waitForOutput`, which waits for output from the active agent. Other methods include `getAgentName`, which retrieves the name of the active agent, `getAgent`, which gets the active agent, and `setAgentRef`, which sets the reference of an agent in the swarm. The `setAgentName` method sets the active agent by name.

## ClientStorage

The ClientStorage class is an implementation of the IStorage interface, which provides methods for managing storage operations. It has a constructor that takes in parameters of type IStorageParams<T>, and several properties including _itemMap, _createEmbedding, waitForInit, take, upsert, remove, clear, get, list and dispose.

_itemMap is a property that stores the items in the storage.
_createEmbedding is a property that creates an embedding for the given item.
waitForInit is a property that waits for the initialization of the storage.
take is a method that takes a specified number of items based on the search criteria.
upsert is a method that upserts an item into the storage.
remove is a method that removes an item from the storage.
clear is a method that clears all items from the storage.
get is a method that gets an item by its ID.
list is a method that lists all items in the storage, optionally filtered by a predicate.
dispose is a method that disposes of the state.

## ClientState

The `ClientState` class is an implementation of the `IState<State>` interface and represents the state of a client. It has properties such as `params`, which holds the state parameters, and `_state`, which stores the current state. The class also has methods like `dispatch`, which allows dispatching actions to update the state, `waitForInit`, which waits for the state to initialize, `setState`, which sets the state using a provided dispatch function, `getState`, which retrieves the current state, and `dispose`, which disposes of the state.

## ClientSession

The `ClientSession` class in this Typescript API Reference implements the `ISession` interface. It has a constructor that takes in `ISessionParams` as a parameter. The class has several properties and methods to handle session communication.

The `params` property holds the session parameters, while `_emitSubject` is a subject that emits messages. The `emit` method allows you to emit a message, and the `execute` method executes a message, optionally emitting the output.

Other methods include `commitToolOutput`, which commits tool output; `commitUserMessage`, which commits a user message without an answer; `commitFlush`, which commits the flush of agent history; and `commitSystemMessage`, which commits a system message.

The `connect` method connects the session to a connector function, and `dispose` should be called when the session is disposed.

## ClientHistory

The `ClientHistory` class in TypeScript represents the history of client messages and implements the `IHistory` interface. It has a constructor that takes in `IHistoryParams` as a parameter. The class also has several properties and methods to interact with the history.

The `push` method allows you to add a new message to the history asynchronously. The `toArrayForRaw` method converts the history into an array of raw messages asynchronously. The `toArrayForAgent` method converts the history into an array of messages specifically for the agent, taking in a prompt and optional system messages as parameters. Lastly, the `dispose` method should be called when an agent is disposed to clean up any resources.

## ClientAgent

The `ClientAgent` class in TypeScript implements the `IAgent` interface and represents a client agent that interacts with the system. It has a constructor that takes in `IAgentParams` as a parameter. The class has several properties, including subjects for agent change, tool commit, tool error, and output. It also has an `_emitOuput` function that emits the output result after validation and a `_resurrectModel` function that resurrects the model based on a given reason.

The class provides methods such as `waitForOutput` to wait for the output to be available, `getCompletion` to get the completion message from the model, `commitUserMessage` to commit a user message without an answer, `commitFlush` to commit a flush of agent history, `commitAgentChange` to commit a change of agent, `commitSystemMessage` to commit a system message, `commitToolOutput` to commit the tool output, and `execute` to execute an incoming message and process tool calls if any.

The `dispose` method should be called when the agent is disposed.

## BusService

The BusService is an implementation of the IBus interface that provides functionality for event handling and communication between different clients. It uses the loggerService and sessionValidationService for logging and validation purposes. The class also has private properties like _eventSourceSet, _eventWildcardMap and getEventSubject for internal event management.

The constructor is used to initialize the BusService object.

The subscribe method allows clients to subscribe to events for a specific source. It takes in the clientId, source and a function to handle the events. It returns an unsubscribe function that can be used to stop receiving events.

The once method is similar to subscribe, but it only allows the client to receive one event.

The emit method is used to send an event to a specific client.

The dispose method is used to clean up event subscriptions for a specific client.

## AgentValidationService

The `AgentValidationService` is a service used for validating agents within an agent swarm. It has a constructor that initializes the logger service, tool validation service, completion validation service, and storage validation service. The service also has properties for these services and an `_agentMap` to store agent information.

The service provides methods to retrieve the list of storages and states used by an agent. The `getStorageList` method returns an array of storage names used by the specified agent, while `getStateList` returns an array of state names used by the specified agent.

To add a new agent, you can use the `addAgent` method by providing the agent name and its schema.

The `hasStorage` method checks if an agent has a registered storage by its name, and the `hasState` method checks if an agent has a registered state by its name. Both methods use memoization to improve performance and can be cleared or controlled.

To validate an agent by its name and source, you can use the `validate` method.

## AgentSchemaService

The `AgentSchemaService` is a service that manages agent schemas. It has a constructor, `loggerService` and `registry` properties, as well as two methods: `register` and `get`. The `loggerService` is used for logging, while the `registry` stores registered agent schemas.

The `register` method allows you to register a new agent schema by providing a key and an `IAgentSchema` object. This method does not return anything and simply stores the schema in the `registry`.

The `get` method retrieves an agent schema by its name, specified as a key. It returns the `IAgentSchema` object associated with that key from the `registry`.

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

## AgentConnectionService

The `AgentConnectionService` is a TypeScript class that manages agent connections and provides methods for interacting with agents. It implements the `IAgent` interface and has several properties such as `loggerService`, `busService`, and others.

The class has a constructor that initializes the service. It also provides methods like `getAgent` for retrieving an agent instance, `execute` for executing input commands, and methods like `commitToolOutput`, `commitSystemMessage`, and others for committing different types of output.

The `AgentConnectionService` also has methods like `commitFlush`, which commits the flush of agent history, and `dispose`, which disposes of the agent connection.
