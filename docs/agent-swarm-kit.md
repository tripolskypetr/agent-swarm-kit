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

The `ToolSchemaService` is a service that manages tool schemas. It has a constructor, `loggerService` and `registry` properties, as well as two methods: `register` and `get`. The `loggerService` property is used for logging, while the `registry` property is used to store registered tools. The `register` method allows you to register a tool with a given key and value, while the `get` method retrieves a tool by its key.

## SwarmValidationService

The SwarmValidationService is a service that allows for the validation of swarms and their agents. It has a constructor, properties such as loggerService and agentValidationService for logging and handling agent validation, a private property _swarmMap for storing swarms, and methods to add a new swarm, retrieve the list of agents for a given swarm, retrieve the list of all swarms, and validate a given swarm.

## SwarmSchemaService

The SwarmSchemaService is a service that manages swarm schemas. It has a constructor, loggerService property for logging purposes, and registry property to store registered swarm schemas. The service provides two methods: `register` and `get`. The `register` method is used to add a new swarm schema by providing a key and the ISwarmSchema object as value. The `get` method retrieves a swarm schema by its name, given the key.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It is used for managing public interactions with swarms. The class has a constructor, several properties and methods.

The loggerService, swarmConnectionService and cancelOutput properties are used for logging, managing connections to swarms and cancelling output awaits respectively. The waitForOutput method is used to wait for output from a swarm. The getAgentName and getAgent methods are used to retrieve the agent name and full agent information from a swarm. The setAgentRef, setAgentName and dispose methods are used to update the agent reference, name and dispose of a swarm respectively.

This service provides methods to interact with swarms, retrieve agent information and manage connections.

## SwarmMetaService

The SwarmMetaService is a service that handles swarm metadata. It has properties such as loggerService, swarmSchemaService, agentMetaService and serialize. The loggerService is used for logging, swarmSchemaService handles the schema related operations for swarms, agentMetaService handles metadata related to agents and serialize is used for serialization. The makeSwarmNode function creates a swarm node with the given swarm name. The toUML function converts the swarm metadata into UML format.

## SwarmConnectionService

The SwarmConnectionService is a TypeScript class that implements the ISwarm interface and provides functionality for managing swarm connections. It has a constructor that initializes the loggerService, busService, methodContextService, agentConnectionService, and swarmSchemaService properties. The service also includes several methods for retrieving swarm instances, agent information, and managing the connection.

The getSwarm method retrieves a swarm instance based on the client ID and swarm name. The cancelOutput method cancels the await of output by emitting an empty string. The waitForOutput method waits for the output from the swarm. The getAgentName method retrieves the agent name from the swarm, while the getAgent method retrieves the agent from the swarm. The setAgentRef method sets the agent reference in the swarm, and the setAgentName method sets the agent name in the swarm. Finally, the dispose method is used to dispose of the swarm connection.

## StorageValidationService

The StorageValidationService is a service designed to validate storages within the storage swarm. It contains a constructor, properties such as loggerService, embeddingValidationService and _storageMap, as well as two methods: addStorage and validate.

The `addStorage` method is used to add a new storage to the validation service. It takes two parameters: `storageName`, which is the name of the storage to be added, and `storageSchema`, which is an object containing the schema for the storage data.

The `validate` method is used to validate a storage by its name and source. It takes two parameters: `storageName`, which is the name of the storage to be validated, and `source`, which is the source of the storage to be validated.

## StorageUtils

The `StorageUtils` class implements the `TStorage` interface and provides various methods for interacting with a storage system. It allows you to take, upsert, remove, get, list, and clear items from the storage.

- `take`: This method takes items from the storage by specifying a search query, total count, client ID, agent name, and storage name. It returns a Promise that resolves to an array of items matching the specified criteria.
- `upsert`: This method upserts an item into the storage. It requires providing the new item, client ID, agent name, and storage name. It returns a Promise that resolves when the upsert operation is complete.
- `remove`: This method removes an item from the storage based on its ID, client ID, agent name, and storage name. It returns a Promise that resolves when the removal is complete.
- `get`: This method retrieves a specific item from the storage based on its ID, client ID, agent name, and storage name. It returns a Promise that resolves to the requested item.
- `list`: This method lists items from the storage based on specified criteria, such as client ID, agent name, storage name, and an optional filter function. It returns a Promise that resolves to an array of items matching the specified criteria.
- `clear`: This method clears the entire storage for a given client ID, agent name, and storage name. It returns a Promise that resolves when the clearing operation is complete.

## StorageSchemaService

The StorageSchemaService is a service used for managing storage schemas. It has a constructor, loggerService property, registry property and two methods: register() and get(). The loggerService property is used for logging messages, while the registry property stores registered storage schemas. The register() method is used to add a new storage schema, and the get() method retrieves a storage schema by its key.

## StoragePublicService

The StoragePublicService is a service that handles interactions with public storage. It implements the TStorageConnectionService interface and provides methods for managing storage data. The service has properties such as loggerService and storageConnectionService for logging and managing connections to the storage, respectively.

The StoragePublicService provides several methods for interacting with the storage:
1. `take` - Retrieves a list of storage data based on a search query and total number of items.
2. `upsert` - Upserts an item in the storage.
3. `remove` - Removes an item from the storage.
4. `get` - Retrieves an item from the storage by its ID.
5. `list` - Retrieves a list of items from the storage, optionally filtered by a predicate function.
6. `clear` - Clears all items from the storage.
7. `dispose` - Disposes of the storage.

These methods allow for efficient management and manipulation of data stored in the public storage.

## StorageConnectionService

The StorageConnectionService is a service that manages storage connections. It implements the IStorage interface and provides various methods for interacting with storage data. The service takes dependencies such as loggerService, busService, methodContextService, storageSchemaService, sessionValidationService, and embeddingSchemaService.

To retrieve a shared storage instance, you can use the getSharedStorage method by providing a client ID and storage name. The getStorage method works similarly, but it retrieves a storage instance based on the client ID and storage name.

The take method allows you to retrieve a list of storage data based on a search query and the total number of items. The upsert method is used to upsert an item in the storage. The remove method removes an item from the storage by its ID. The get method retrieves an item from the storage by its ID. The list method retrieves a list of items from the storage, optionally filtered by a predicate function. The clear method clears all items from the storage, and the dispose method is used to dispose of the storage connection.

## StateUtils

The `StateUtils` class is a utility for managing state in an agent swarm. It provides methods to retrieve and set state for a specific client and state name. The `getState` method allows you to retrieve the state for a given client and state name, while the `setState` method allows you to set a new state for the specified client and state name. Both methods return a Promise, allowing for asynchronous operations.

## StateSchemaService

The `StateSchemaService` is a service used for managing state schemas. It provides methods to register new state schemas and retrieve them by their respective keys. The service also has properties such as `loggerService` and `registry`, which are used for logging and registry management, respectively. The `register` method is used to add new state schemas, while the `get` method is used to retrieve state schemas by their keys.

## StatePublicService

The `StatePublicService` class is an implementation of the `TStateConnectionService` interface. It has a constructor, and two properties: `loggerService` and `stateConnectionService`. 

The class provides three methods: `setState`, `getState`, and `dispose`. 

The `setState` method sets the state using a provided dispatch function. It takes in four parameters: `dispatchFn`, which is a function that takes the previous state and returns a promise for the new state, `methodName`, which is a string representing the method name, `clientId`, which is a string representing the client ID, and `stateName`, which is a string representing the state name. It returns a promise for the new state.

The `getState` method gets the current state. It takes in three parameters: `methodName`, which is a string representing the method name, `clientId`, which is a string representing the client ID, and `stateName`, which is a string representing the state name. It returns a promise for the current state.

The `dispose` method disposes the state. It takes in three parameters: `methodName`, which is a string representing the method name, `clientId`, which is a string representing the client ID, and `stateName`, which is a string representing the state name. It returns a promise that resolves when the state is successfully disposed.

## StateConnectionService

The `StateConnectionService` is a TypeScript class that manages state connections. It implements the `IState<T>` interface and provides several methods for working with state. The class has properties such as `loggerService`, `busService`, `methodContextService`, `stateSchemaService`, and `sessionValidationService` which are used for various functionalities.

The `getSharedStateRef` is a memoized function that returns a shared state reference. It takes two parameters, `clientId` and `stateName`, and returns a `ClientState<any>`.

The `getStateRef` is a memoized function that returns a state reference. It also takes two parameters, `clientId` and `stateName`, and returns a `ClientState<any>`.

The `setState` method sets the state by dispatching a function that takes the previous state as an argument and returns a promise that resolves to the updated state.

The `getState` method retrieves the current state as a promise.

The `dispose` method disposes the state connection, releasing any resources associated with it.

Overall, the `StateConnectionService` provides a way to manage state connections and perform operations on the state, such as setting or retrieving it.

## SessionValidationService

The `SessionValidationService` is a service that handles session validation and management. It uses a logger service for logging purposes and several SwarmMaps to store session information. The service provides methods for adding and removing sessions, agents, history usage, storage usage, and state usage. It also allows for retrieving session information such as the mode, list of sessions, agents for a session, history list of agents for a session, swarm name for a session, and validating if a session exists. The service can be used to manage and validate sessions in an application.

## SessionPublicService

The `SessionPublicService` is a TypeScript class that implements the `TSessionConnectionService` interface. It is responsible for managing public session interactions, which include emitting messages, executing commands, connecting to the session, committing tool output, system messages, user messages, flushing agent history, and disposing of the session.

The class has a constructor that initializes the `loggerService` and `sessionConnectionService`. It also provides several methods for interacting with the session, such as `emit`, which allows you to send a message to the session, and `execute`, which enables you to execute a command in the session.

Other methods include `connect`, which connects to the session, and `commitToolOutput`, `commitSystemMessage`, and `commitUserMessage`, which allow you to commit tool output, system messages, and user messages to the session respectively. The `commitFlush` method commits the flush of agent history, and `dispose` disposes of the session.

Overall, `SessionPublicService` provides a set of methods to interact with public sessions, allowing you to send messages, execute commands, and manage session-related operations.

## SessionConnectionService

The `SessionConnectionService` is a TypeScript class that implements the `ISession` interface and provides functionality for managing session connections. It has a constructor that initializes the service with dependencies such as `loggerService`, `busService`, `methodContextService`, `swarmConnectionService`, and `swarmSchemaService`.

The service provides several methods: `getSession` retrieves a memoized session based on the clientId and swarmName, `emit` allows you to send a message to the session, `execute` executes a command in the session, `connect` connects to a session using the provided connector, `commitToolOutput` commits tool output to the session, `commitSystemMessage` commits a system message to the session, `commitUserMessage` commits a user message to the session, `commitFlush` commits all pending messages, and `dispose` disposes of the session connection service.

## SchemaUtils

The `SchemaUtils` is a utility class that provides functions for performing operations related to schemas. It has a constructor that does not take any arguments.

The class includes a property called `serialize`, which is a function that can serialize an object or an array of objects into a formatted string. This function can be used to convert data into a readable and formatted string representation.

## LoggerUtils

The `LoggerUtils` class is an implementation of the `ILoggerAdapter` and `ILoggerControl` interfaces. It provides methods for logging and controlling log messages in a client-server architecture. The class has several properties and methods to achieve this functionality.

The `LoggerFactory` property is used to create instances of loggers. The `LoggerCallbacks` property holds callback functions for handling log messages. The `getLogger` method is used to get a logger instance. The `useCommonAdapter`, `useClientCallbacks`, and `useClientAdapter` methods are used to configure the logger with specific adapters and callbacks.

The `logClient`, `infoClient`, and `debugClient` methods are asynchronous functions that send log messages to the server for a specific client. The `log`, `debug`, and `info` methods are similar but can be used without specifying a client. The `dispose` method is used to clean up resources when a client is no longer needed.

Overall, the `LoggerUtils` class provides a way to log and control messages in a client-server architecture, allowing for flexible configuration and handling of log messages.

## LoggerService

The LoggerService is a class that implements the ILogger interface, providing methods to log and debug messages. It has a constructor, several properties including methodContextService, executionContextService, _commonLogger and getLoggerAdapter. The log method logs messages using the current logger, debug logs debug messages and info logs information messages. The setLogger method allows you to set a new logger. This class is used for logging purposes in a system.

## LoggerInstance

The `LoggerInstance` class is an implementation of the `ILoggerInstance` interface. It is constructed with a `clientId` and an optional set of callbacks defined in the `ILoggerInstanceCallbacks` interface. The `clientId` is a unique identifier for the client instance.

The `LoggerInstance` class has a private property, `__@LOGGER_INSTANCE_WAIT_FOR_INIT@1693`, which is used internally for waiting for initialization.

The class provides two methods: `waitForInit` and logging functions (`log`, `debug`, and `info`). The `waitForInit` method returns a Promise that resolves when the instance is initialized. The logging functions (`log`, `debug`, and `info`) are used to log messages with different levels of severity.

Finally, the `dispose` method is used to clean up any resources associated with the instance.

## HistoryUtils

The `HistoryUtils` class provides functionality for working with history data in a TypeScript application. It implements the `IHistoryAdapter` and `IHistoryControl` interfaces, allowing for custom history adapters and lifecycle callbacks.

To use a custom history adapter, you can call the `useHistoryAdapter` method, passing in a constructor for the custom history instance. This will allow you to integrate your own history implementation into the `HistoryUtils` class.

If you want to use history lifecycle callbacks, you can call the `useHistoryCallbacks` method, passing in a partial `IHistoryInstanceCallbacks` object. This will enable you to hook into various events during the history lifecycle, such as when a new message is pushed or when the history is disposed.

To push a new message to the history, you can use the `push` method. This asynchronous function takes three parameters: the message content (`IModelMessage`), the client ID, and the agent name. It returns a Promise that resolves when the message is successfully pushed to the history.

If you need to dispose of the history for a specific client and agent, you can use the `dispose` method. This asynchronous function takes the client ID and agent name as parameters, and returns a Promise that resolves when the history is successfully disposed.

The `iterate` method allows you to iterate over the history messages asynchronously. It takes the client ID and agent name as parameters, and returns an `AsyncIterableIterator` containing the history messages in order.

## HistoryPublicService

The `HistoryPublicService` is a TypeScript class that implements the `THistoryConnectionService` interface. This service is responsible for handling public operations related to the history. It has a constructor, properties like `loggerService`, `historyConnectionService`, and methods such as `push`, `toArrayForAgent`, `toArrayForRaw`, and `dispose`.

The `push` method allows you to push a message to the history asynchronously. It takes a `message` object of type `IModelMessage`, a `methodName` string, a `clientId` string, and an `agentName` string as parameters.

The `toArrayForAgent` method converts the history to an array specifically for a given agent. It returns the history as an array of `IModelMessage` objects, asynchronously. It takes a `prompt` string, a `methodName` string, a `clientId` string, and an `agentName` string as parameters.

The `toArrayForRaw` method converts the history to a raw array. It returns the history as an array of `IModelMessage` objects, asynchronously. It takes a `methodName` string, a `clientId` string, and an `agentName` string as parameters.

The `dispose` method allows you to dispose of the history asynchronously. It takes a `methodName` string, a `clientId` string, and an `agentName` string as parameters.

## HistoryInstance

The `HistoryInstance` class in TypeScript represents a History Instance and implements the `IHistoryInstance` interface. It has a constructor that takes in `clientId` and `callbacks`, which are used to initialize the instance. The class also has properties such as `clientId`, `callbacks`, and private properties like `_array` and `__@HISTORY_INSTANCE_WAIT_FOR_INIT@416`.

The `waitForInit` method is used to wait for the history to initialize, and it takes in an `agentName` parameter. The `iterate` method is used to iterate over the history messages for a given agent, and it returns an `AsyncIterableIterator` containing the messages. The `push` method is used to add a new message to the history for a given agent, and it takes in `value` (the message) and an `agentName`. The `dispose` method is used to dispose of the history for a given agent, and it takes in an `agentName` parameter.

## HistoryConnectionService

The `HistoryConnectionService` is a TypeScript class that implements the `IHistory` interface and provides functionality for managing history connections. It has a constructor that initializes the loggerService, busService, methodContextService, and sessionValidationService. The class also includes several methods for retrieving and manipulating history data.

The `getHistory` method retrieves the history for a given client and agent. The `push` method pushes a message to the history. The `toArrayForAgent` method converts the history to an array format for the agent. The `toArrayForRaw` method converts the history to a raw array format. The `dispose` method disposes of the history connection service.

Overall, this class provides a way to manage and interact with history data in a TypeScript application.

## EmbeddingValidationService

The EmbeddingValidationService is a tool used within the agent-swarm to validate embeddings. It has a constructor that initializes the service and two main properties: loggerService, which is used for logging messages and events during the validation process, and _embeddingMap, which is a map that stores the embeddings for validation.

To add a new embedding to the validation service, you can use the addEmbedding function. This function takes two parameters: embeddingName, which is the name of the new embedding you want to add, and embeddingSchema, which is an object containing the schema for the embedding.

To validate if a specific embedding exists in the validation service, you can use the validate function. This function takes two parameters: embeddingName, which is the name of the embedding you want to check, and source, which is the location or origin of the embedding. The function will return a boolean value indicating whether the embedding exists in the validation service or not.

## EmbeddingSchemaService

The EmbeddingSchemaService is a service used for managing embedding schemas. It has a constructor that initializes the service with a loggerService and registry. The `register` function is used to register an embedding with a given key and value, while the `get` function retrieves an embedding by its key. This service allows for efficient management and retrieval of embedding schemas.

## DocService

The DocService is a TypeScript class that provides functionality for generating documentation for swarms and agents. It utilizes several services for validation, schema generation, and meta data retrieval. The constructor initializes these services, while the `writeSwarmDoc` and `writeAgentDoc` methods are used to generate documentation for swarm and agent schemas, respectively. The `dumpDocs` method is used to generate and save the documentation for all swarms and agents into a specified directory.

## CompletionValidationService

The CompletionValidationService is a TypeScript service that allows you to validate completion names. It has a constructor, loggerService property, and two methods: addCompletion and validate. The constructor initializes the service, while addCompletion allows you to add new completion names to the set. The validate method checks if a given completion name exists in the set, taking into account its source. This service is useful for ensuring the validity of completion names in a system.

## CompletionSchemaService

The `CompletionSchemaService` is a service that manages completion schemas. It has a constructor, `loggerService` and `registry` properties, as well as two methods: `register` and `get`. The `loggerService` property is an instance of the `LoggerService`, which handles logging. The `registry` property is a storage mechanism for storing completion schemas. The `register` method is used to register a new completion schema by providing a key and the corresponding `ICompletionSchema` object. The `get` method retrieves a completion schema by its key.

## ClientSwarm

The ClientSwarm class is an implementation of the ISwarm interface that manages agents within a swarm. It has a constructor that takes in parameters defined by the ISwarmParams interface. The class provides several properties and methods to interact with the swarm.

The `params` property holds the parameters for the swarm, while `_agentChangedSubject`, `_activeAgent`, and `_cancelOutputSubject` are internal properties used for event handling and managing the active agent.

The `cancelOutput` method allows you to cancel the await of output by emitting an empty string. The `waitForOutput` method waits for output from the active agent and returns it as a promise.

The `getAgentName` method retrieves the name of the active agent, while `getAgent` method returns the active agent as an IAgent object.

The `setAgentRef` method sets the reference of an agent in the swarm, and `setAgentName` method sets the active agent by name.

## ClientStorage

The ClientStorage class is an implementation of the IStorage interface and provides methods for managing storage operations. It has a constructor that takes in parameters of type IStorageParams<T>. The class also has several properties, including _itemMap for storing items and _createEmbedding for creating embeddings for given items.

The class provides methods such as waitForInit for waiting for storage initialization, take for taking a specified number of items based on search criteria, upsert for upserting an item into the storage, remove for removing an item from the storage, clear for clearing all items from the storage, get for getting an item by its ID, list for listing all items in the storage (optionally filtered by a predicate), and dispose for disposing of the state.

## ClientState

The `ClientState` class is an implementation of the `IState<State>` interface, representing the client's state. It has a constructor that takes in parameters of type `IStateParams<State>`. The class has several properties, including `params`, which holds the state parameters; `_state` to store the current state; `dispatch`, which is used to dispatch actions; and `waitForInit`, a function that waits for the state to initialize.

The `setState` function sets the state using a provided dispatch function and returns a promise that resolves to the updated state. The `getState` function retrieves the current state as a promise. Lastly, the `dispose` function disposes of the state, cleaning up any resources associated with it.

## ClientSession

The `ClientSession` class in this Typescript API Reference is an implementation of the `ISession` interface. It provides various methods and properties for managing communication between a client and an agent.

The `ClientSession` constructor takes in a parameter of type `ISessionParams` to initialize the session. The class also includes several properties, such as `params`, `_emitSubject`, `emit`, and more, which are used for different functionalities like emitting messages, committing user and system messages, connecting to a connector function, and disposing the session.

The `emit` method allows the client to emit a message, while `execute` executes a message and optionally emits the output. The `commitToolOutput`, `commitUserMessage`, and `commitSystemMessage` methods are used to commit different types of messages. The `commitFlush` method commits the flush of agent history.

The `connect` method connects the session to a connector function, and `dispose` should be called when the session is no longer needed to properly dispose of resources.

## ClientHistory

The `ClientHistory` class in TypeScript represents the history of client messages and implements the `IHistory` interface. It has a constructor that takes in `IHistoryParams` as a parameter. The class has several properties and methods to interact with the history.

The `push` method allows you to add a new message to the history asynchronously. The `toArrayForRaw` method converts the history into an array of raw messages asynchronously. The `toArrayForAgent` method converts the history into an array of messages specifically for the agent, taking in a prompt and optional system messages as parameters. Finally, the `dispose` method should be called when an agent is disposed to clean up any resources.

## ClientAgent

The `ClientAgent` class in TypeScript implements the `IAgent` interface and represents a client agent that interacts with the system. It has a constructor that takes in `IAgentParams` as a parameter. The class has several properties and methods for handling agent interactions, such as emitting output results after validation, resurrecting the model based on a given reason, waiting for output to be available, getting completion messages from the model, committing user and system messages to history, committing tool output to the history, and executing incoming messages while processing tool calls if necessary. The `dispose` method should be called when the agent is disposed.

## BusService

The BusService is an implementation of the IBus interface that provides event handling functionality. It has a loggerService, sessionValidationService, and two private properties: _eventSourceSet and _eventWildcardMap. The getEventSubject property is used to retrieve the event subject.

The constructor is used to initialize the BusService.

The subscribe method allows you to subscribe to events for a specific client and source. It takes in the clientId, source, and a function to handle the events. It returns an unsubscribe function that can be used to stop receiving events.

The once method is similar to subscribe, but it only allows you to handle a single event. It takes in the clientId, source, a filter function to specify which event should be handled, and a function to handle the event. It also returns an unsubscribe function.

The emit method allows you to send an event for a specific client. It takes in the clientId and an event object. It returns a Promise that resolves when the event is successfully emitted.

The dispose method allows you to clean up event subscriptions for a specific client. It takes in the clientId and disposes of all subscriptions for that client.

## AgentValidationService

The `AgentValidationService` is a service used for validating agents within an agent swarm. It has a constructor that initializes the logger service, tool validation service, completion validation service, and storage validation service. The service also has several properties and methods for managing agents, their dependencies, storages, and states.

The `getAgentList` method retrieves a list of all agents registered with the validation service. The `getStorageList` method retrieves a list of storages used by the specified agent. The `getStateList` method retrieves a list of states used by the specified agent.

The `addAgent` method adds a new agent to the validation service, along with its schema. The `hasStorage`, `hasDependency`, and `hasState` methods are memoized functions that check if an agent has a registered storage, dependency, or state respectively.

Finally, the `validate` method validates an agent by its name and source.

## AgentSchemaService

The `AgentSchemaService` is a service that manages agent schemas. It has a constructor, `loggerService` and `registry` properties, as well as `register` and `get` methods. The `loggerService` is used for logging, while the `registry` stores registered agent schemas. The `register` method is used to add a new agent schema, and the `get` method retrieves an agent schema by its name.

## AgentPublicService

The `AgentPublicService` is a TypeScript class that implements the `TAgentConnectionService` interface. It is responsible for managing public agent operations, such as creating an agent reference, executing commands on the agent, waiting for output from the agent, committing tool and system messages to the agent, flushing the agent's history, and disposing of an agent.

To use this service, you need to provide the `loggerService` and `agentConnectionService` as dependencies. The class provides several methods to interact with the agent, including:
- `createAgentRef`: Creates a reference to an agent by specifying the method name, client ID, and agent name.
- `execute`: Executes a command on the agent by providing input, execution mode (e.g., synchronous or asynchronous), method name, client ID, and agent name.
- `waitForOutput`: Waits for the agent's output by specifying the method name, client ID, and agent name.
- `commitToolOutput`: Commits tool output to the agent by specifying the tool ID, content, method name, client ID, and agent name.
- `commitSystemMessage`: Commits a system message to the agent by providing the message, method name, client ID, and agent name.
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

The `AgentConnectionService` also has methods like `commitFlush`, which commits the flush of agent history, and `dispose`, which disposes of the agent connection.
