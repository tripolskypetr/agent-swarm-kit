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

The `ToolValidationService` is a service designed for validating tools within an agent-swarm system. It provides a way to add new tools and validate their existence. The service utilizes a loggerService for logging purposes and maintains an internal tool map (_toolMap) for efficient storage and retrieval of tool information.

To add a new tool, you can use the `addTool` function by passing in the tool's name and its associated schema. This allows the service to keep track of available tools for validation.

To validate if a tool exists in the validation service, you can use the `validate` function by providing the tool's name and its source. This function checks if the specified tool is present in the service's internal storage and performs any necessary validations.

Overall, the `ToolValidationService` provides a convenient way to manage and validate tools within an agent-swarm system.

## ToolSchemaService

The `ToolSchemaService` is a service that manages tool schemas. It has a constructor that initializes the service with a logger and registry. The `register` function allows you to register a tool with a given key and value, while the `get` function retrieves a tool by its key. This service is useful for managing and accessing tool schemas in your application.

## SwarmValidationService

The SwarmValidationService is a service that allows for the validation of swarms and their agents. It has a constructor, loggerService and agentValidationService properties for logging and validating agents respectively. The service also has a swarmMap property for storing swarms.

To add a new swarm, you can use the `addSwarm` method by providing a swarm name and its schema. This will add the swarm to the swarm map.

To retrieve a list of agents for a specific swarm, you can use the `getAgentList` method by providing the swarm name. This will return an array of agent names for the given swarm.

To validate a swarm and its agents, you can use the `validate` method by providing a swarm name and its source code. This will validate the swarm and its agents using the loggerService for logging and agentValidationService for validating agents.

## SwarmSchemaService

The SwarmSchemaService is a TypeScript class that manages swarm schemas. It has a constructor, loggerService property for logging messages, registry property to store registered schemas, and register() and get() methods. The register() method is used to add a new swarm schema, while the get() method retrieves a swarm schema by its name. This service allows for easy management and retrieval of swarm schemas in a TypeScript application.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It is designed to manage public interactions with swarms. The class has a constructor, several properties and methods.

The loggerService, swarmConnectionService and cancelOutput are properties of the class, which seem to be references or dependencies for the class's functionality.

The cancelOutput method allows you to cancel the await of output by emitting an empty string.
The waitForOutput method is used to wait for output from the swarm.
The getAgentName method retrieves the agent name from the swarm.
The getAgent method retrieves the agent from the swarm.
The setAgentRef method sets the agent reference in the swarm.
The setAgentName method sets the agent name in the swarm.
The dispose method is used to dispose of the swarm.

Overall, this class provides a set of methods to interact with swarms, including waiting for output, retrieving agent information and disposing of the swarm.

## SwarmConnectionService

The SwarmConnectionService is a TypeScript class that implements the ISwarm interface and provides functionality for managing swarm connections. It has a constructor and several properties, including loggerService, busService, methodContextService, agentConnectionService, and swarmSchemaService.

The getSwarm method retrieves a swarm instance based on the client ID and swarm name. The cancelOutput method cancels the await of output by emitting an empty string. The waitForOutput method waits for the output from the swarm. The getAgentName method retrieves the agent name from the swarm, while getAgent retrieves the agent from the swarm. The setAgentRef method sets the agent reference in the swarm, and setAgentName sets the agent name in the swarm. Finally, dispose disposes of the swarm connection.

## StorageValidationService

The StorageValidationService is a service used to validate storages within the storage swarm. It has a constructor, properties such as loggerService, embeddingValidationService and _storageMap, as well as two methods: addStorage and validate.

The `addStorage` method is used to add a new storage to the validation service. It takes in two parameters: `storageName`, which is the name of the storage to be added, and `storageSchema`, which is an object containing the schema for the storage data.

The `validate` method is used to validate a storage by its name and source. It takes in two parameters: `storageName`, which is the name of the storage to be validated, and `source`, which is the source code of the storage to be validated.

## StorageUtils

The `StorageUtils` class implements the `TStorage` interface and provides various methods for interacting with a storage system. It allows you to take, upsert, remove, get, list, and clear items from the storage.

- `take`: This method takes items from the storage and returns them as an array of type `T`, where `T` extends the `IStorageData` interface.
- `upsert`: This method upserts an item into the storage. It takes a payload object containing the item to be upserted and information about the client, agent name, and storage name.
- `remove`: This method removes an item from the storage based on its `itemId`. It also requires the client, agent name, and storage name as part of the payload.
- `get`: This method retrieves a specific item from the storage based on its `itemId`. It returns the item as an object of type `T`, where `T` extends the `IStorageData` interface.
- `list`: This method lists items from the storage. It returns an array of type `T`, where `T` extends the `IStorageData` interface. You can also apply a filter function to the list.
- `clear`: This method clears the entire storage, removing all items. It requires information about the client, agent name, and storage name as part of the payload.

These methods provide a convenient way to interact with various storage systems in your TypeScript application.

## StorageSchemaService

The StorageSchemaService is a service used for managing storage schemas. It has a constructor, loggerService property, registry property and two methods: register() and get(). The loggerService property is used for logging messages, while the registry property stores registered storage schemas. The register() method is used to add a new storage schema, and the get() method is used to retrieve a storage schema by its key.

## StoragePublicService

The `StoragePublicService` is a TypeScript class that implements the `TStorageConnectionService` interface. It is responsible for managing interactions with public storage services. The class has a constructor, properties such as `loggerService` and `storageConnectionService`, as well as several methods for interacting with the storage.

The `take` method retrieves a list of storage data based on a search query and total number of items. The `upsert` method upserts an item in the storage. The `remove` method removes an item from the storage. The `get` method retrieves an item from the storage by its ID. The `list` method retrieves a list of items from the storage, optionally filtered by a predicate function. The `clear` method clears all items from the storage. The `dispose` method disposes of the storage.

## StorageConnectionService

The StorageConnectionService is a service that manages storage connections and provides methods for retrieving, inserting, updating, and removing data from the storage. It also allows for filtering and clearing data from the storage. The service depends on other services such as loggerService, busService, methodContextService, storageSchemaService, sessionValidationService, and embeddingSchemaService. The storage data is represented by the IStorageData interface. The service uses memoization to improve performance and provides methods for retrieving shared storage instances (getSharedStorage) and storage instances based on client ID and storage name (getStorage). The service also provides methods for retrieving a list of storage data based on search query and total number of items (take), inserting data into the storage (upsert), removing an item from the storage by its ID (remove), retrieving an item from the storage by its ID (get), retrieving a list of items from the storage, optionally filtered by a predicate function (list), clearing all items from the storage (clear), and disposing of the storage connection (dispose).

## StateUtils

The `StateUtils` class is a utility for managing state in an agent swarm. It provides methods to retrieve and set state for a specific client.

The `constructor` is used to initialize the class.

The `getState` method retrieves the state for a given client and state name. It returns the state as a promise, with the type `T` specified by the user.

The `setState` method sets the state for a given client and state name. It takes in a dispatch function, which can either be the new state value or a function that returns a promise for the new state value. The method also takes in a payload object containing the client ID, agent name, and state name. It returns a promise indicating that the state has been successfully set.

## StateSchemaService

The `StateSchemaService` is a service used for managing state schemas. It has a constructor, `loggerService` and `registry` properties, as well as `register` and `get` methods. The `register` method is used to register a new state schema, while the `get` method retrieves a state schema by its key. This service allows for efficient management and retrieval of state schemas in a TypeScript application.

## StatePublicService

The `StatePublicService` is an implementation of the `TStateConnectionService` interface. It has a constructor, and two properties: `loggerService` and `stateConnectionService`. 

The `setState` function takes a dispatch function, method name, client ID, and state name as parameters. It sets the state using the provided dispatch function.

The `getState` function takes a method name, client ID, and state name as parameters. It retrieves the current state of the system.

The `dispose` function takes a method name, client ID, and state name as parameters. It disposes the current state of the system, releasing any resources associated with it.

## StateConnectionService

The `StateConnectionService` is a TypeScript class that manages state connections. It implements the `IState<T>` interface and provides several methods for working with state. The class has properties such as `loggerService`, `busService`, `methodContextService`, `stateSchemaService`, and `sessionValidationService` which are used for logging, event bus communication, method context management, state schema handling, and session validation respectively.

The `getSharedStateRef` method is a memoized function that returns a shared state reference, allowing multiple clients to access the same state. It also implements `IClearableMemoize<string>` and `IControlMemoize<string, ClientState<any>>` interfaces.

The `getStateRef` method is a memoized function that returns a state reference. Similar to `getSharedStateRef`, it also implements `IClearableMemoize<string>` and `IControlMemoize<string, ClientState<any>>` interfaces.

The `setState` method sets the state by dispatching a function that takes the previous state as an argument and returns a promise that resolves to the updated state.

The `getState` method retrieves the current state by returning a promise that resolves to the current state.

The `dispose` method disposes the state connection, releasing any resources associated with it.

Overall, the `StateConnectionService` provides a way to manage state connections, retrieve and update the state, and dispose of the connection when it's no longer needed.

## SessionValidationService

The `SessionValidationService` is a service used for validating and managing sessions in an application. It provides methods to add, remove and get information about sessions. The service also keeps track of the mode, agents, history list, and storage used in each session.

To use this service, you need to create an instance of `SessionValidationService` and inject it into your application. You can then call its methods to add, remove or get information about sessions.

Here are some examples of how to use this service:

1. Add a new session: `sessionValidationService.addSession('clientId', 'swarmName', SessionMode)`
2. Add an agent usage to a session: `sessionValidationService.addAgentUsage('sessionId', 'agentName')`
3. Get the list of all session IDs: `sessionValidationService.getSessionList()`
4. Validate if a session exists: `sessionValidationService.validate('clientId', 'source')`
5. Remove a session: `sessionValidationService.removeSession('clientId')`

Note: You need to replace `'clientId'`, `'swarmName'`, and `SessionMode` with the appropriate values for your application.

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

These methods allow for interaction with the session, including sending messages, executing commands, and managing session-related operations.

## SessionConnectionService

The `SessionConnectionService` is a TypeScript class that implements the `ISession` interface and manages session connections. It has a constructor that initializes properties such as `loggerService`, `busService`, `methodContextService`, `swarmConnectionService`, and `swarmSchemaService`. 

The class provides several methods: `getSession` retrieves a memoized session based on `clientId` and `swarmName`, `emit` emits a message to the session, `execute` executes a command in the session, `connect` connects to the session using a provided connector, `commitToolOutput` commits tool output to the session, `commitSystemMessage` commits a system message to the session, `commitUserMessage` commits a user message to the session, `commitFlush` commits all pending messages to the session, and `dispose` disposes of the session connection service.

## LoggerUtils

The LoggerUtils is a TypeScript class that provides utility functions for working with loggers. It has a constructor that does not take any parameters. The class also has a property called "useLogger" which is a function that accepts an ILogger object and sets it as the logger for the LoggerUtils service. This allows you to easily configure and use different loggers within your code.

## LoggerService

The LoggerService is a class that implements the ILogger interface, providing methods to log and debug messages. It has a constructor, several properties including methodContextService, executionContextService and _logger, as well as methods such as log, debug and info. The log method logs messages using the current logger, debug logs debug messages and info logs information messages. The setLogger method allows you to replace the current logger with a new one.

## HistoryUtils

The `HistoryUtils` class provides functionality for working with history data in a TypeScript application. It implements the `IHistoryAdapter` and `IHistoryControl` interfaces, allowing for custom history adapters and lifecycle callbacks.

To use a custom history adapter, you can call the `useHistoryAdapter` method, passing in a constructor for the custom history instance. This will replace the default adapter with your custom implementation.

If you want to use history lifecycle callbacks, you can call the `useHistoryCallbacks` method, passing in an object containing the desired callbacks. This will enable events such as `onHistoryReady` and `onMessageAdded`.

To push a new message to the history, you can use the `push` method. This asynchronous function takes a message object, client ID, and agent name as parameters. It returns a Promise that resolves when the message is successfully added to the history.

If you need to dispose of the history for a specific client and agent, you can use the `dispose` method. This asynchronous function takes the client ID and agent name as parameters, and returns a Promise that resolves when the history is successfully disposed.

To iterate over the history messages, you can use the `iterate` method. This asynchronous function takes the client ID and agent name as parameters, and returns an AsyncIterableIterator containing the history messages.

## HistoryPublicService

The `HistoryPublicService` is a TypeScript class that implements the `THistoryConnectionService` interface. It is responsible for handling public operations related to the history. The class has a constructor, properties such as `loggerService`, `historyConnectionService`, and methods like `push`, `toArrayForAgent`, `toArrayForRaw`, and `dispose`.

The `push` method allows you to push a message to the history asynchronously. It takes a `message` object of type `IModelMessage`, the method name, client ID, and agent name as parameters.

The `toArrayForAgent` method converts the history to an array specifically for a given agent. It takes the prompt, method name, client ID, and agent name as parameters and returns an array of `IModelMessage` objects asynchronously.

The `toArrayForRaw` method converts the history to a raw array. It takes the method name, client ID, and agent name as parameters and returns an array of `IModelMessage` objects asynchronously.

The `dispose` method allows you to dispose of the history. It takes the method name, client ID, and agent name as parameters and returns a promise that resolves when the history is disposed.

Overall, the `HistoryPublicService` class provides methods to interact with the history, including pushing messages, converting history to arrays for specific agents or in raw format, and disposing of the history.

## HistoryInstance

The `HistoryInstance` class in TypeScript represents a History Instance and implements the `IHistoryInstance` interface. It has a constructor that takes in `clientId` and `callbacks`, which are used to initialize the instance. The class also has properties such as `clientId`, `callbacks`, and `_array` to store relevant data.

The `waitForInit` method allows you to wait for the history to initialize, and `push` method is used to push a new message to the history for a given agent. The `dispose` method is used to dispose of the history for a given agent.

The `iterate` method allows you to iterate over the history messages for a given agent as an `AsyncIterableIterator`.

## HistoryConnectionService

The `HistoryConnectionService` is a TypeScript class that implements the `IHistory` interface. It is responsible for managing history connections and provides several methods to interact with the history. The class has a constructor that initializes the logger service, bus service, method context service, and session validation service.

The `getHistory` method retrieves the history for a specific client and agent. It also implements the `IClearableMemoize` and `IControlMemoize` interfaces, which allow for clearing and controlling the memoized history.

The `push` method is used to push a message to the history asynchronously.

The `toArrayForAgent` method converts the history into an array format specifically for agents.

The `toArrayForRaw` method converts the history into a raw array format.

The `dispose` method is used to dispose of the history connection service, freeing up any resources associated with it.

## EmbeddingValidationService

The EmbeddingValidationService is a tool used within the agent-swarm to validate embeddings. It has a constructor and two main properties: loggerService, which is used for logging messages and events within the service, and _embeddingMap, which is a map that stores the embeddings.

To add a new embedding to the validation service, you can use the addEmbedding function. This function takes two parameters: embeddingName, which is the name of the new embedding you want to add, and embeddingSchema, which is an object containing the schema for the embedding.

To validate if a specific embedding exists in the validation service, you can use the validate function. This function takes two parameters: embeddingName, which is the name of the embedding you want to check, and source, which is the origin or location of the embedding.

Overall, this service helps ensure that the embeddings used within the agent-swarm are valid and correctly defined.

## EmbeddingSchemaService

The EmbeddingSchemaService is a service used for managing embedding schemas. It has a constructor that initializes the service with a loggerService and registry. The `register` function is used to register an embedding with a given key and value, while the `get` function retrieves an embedding by its key. This service allows for easy management and retrieval of embedding schemas.

## CompletionValidationService

The CompletionValidationService is a TypeScript service designed for validating completion names. It has a constructor that initializes the service, and two properties: loggerService for logging purposes and _completionSet to store the completion names.

To add a new completion name to the set, you can use the addCompletion function. This function takes a string parameter representing the completion name.

To validate if a given completion name exists in the set, you can use the validate function. This function takes two parameters: completionName, a string representing the name to be validated, and source, a string representing the origin of the name.

Overall, this service provides a way to manage and validate completion names in your TypeScript application.

## CompletionSchemaService

The `CompletionSchemaService` is a service that manages completion schemas. It has a constructor, `loggerService` and `registry` properties, as well as two methods: `register` and `get`. The `loggerService` is used for logging, while the `registry` stores completion schemas.

The `register` method allows you to register a new completion schema by providing a key and the corresponding `ICompletionSchema` object.

The `get` method retrieves a completion schema by its key.

## ClientSwarm

The ClientSwarm class is an implementation of the ISwarm interface that manages agents within a swarm. It has a constructor that takes in parameters defined by the ISwarmParams interface. The class provides several methods to interact with the swarm and its agents.

The `cancelOutput` method allows you to cancel the await of output by emitting an empty string. The `waitForOutput` method waits for output from the active agent within the swarm.

To get information about the active agent, you can use the `getAgentName` method, which returns a promise with the name of the active agent, and `getAgent` method, which returns a promise with the active agent object.

If you want to set the reference of an agent in the swarm, you can use the `setAgentRef` method, which takes in the agent name and the agent object as parameters. To set the active agent by name, you can use the `setAgentName` method, which takes in the agent name as a parameter.

## ClientStorage

The ClientStorage class is an implementation of the IStorage interface, designed to manage storage operations. It has a constructor that takes in parameters defined by the IStorageParams interface for a generic type T. The class has several properties and methods for performing various storage operations.

The _itemMap property is used to store items in the storage. The _createEmbedding method creates an embedding for a given item, which is used to generate embeddings for search purposes. The waitForInit property is used to wait for the initialization of the storage.

The take method allows you to retrieve a specified number of items based on search criteria. The upsert method is used to insert or update an item in the storage. The remove method removes an item from the storage by its ID. The clear method clears all items from the storage. The get method retrieves an item by its ID. The list method lists all items in the storage, optionally filtered by a predicate. Finally, the dispose method is used to dispose of the state.

## ClientState

The `ClientState` class is an implementation of the `IState<State>` interface, which represents the client's state. It has a constructor that takes in parameters defined by the `IStateParams<State>` interface. The class also has several properties and methods to manage the state.

The `params` property holds the parameters used to initialize the state, while `_state` stores the current state. The `dispatch` property is used to dispatch actions, and `waitForInit` is a function that waits for the state to initialize.

The `setState` method sets the state using a provided dispatch function, and returns a promise that resolves to the new state. The `getState` method retrieves the current state as a promise. Finally, the `dispose` method disposes of the state, cleaning up any resources associated with it.

## ClientSession

The ClientSession class is an implementation of the ISession interface. It has a constructor that takes in ISessionParams as its parameter. The class has several properties and methods for handling messages, committing output, and connecting to a connector function. The `emit` method allows you to emit a message, while the `execute` method executes a message and optionally emits the output. The `commitToolOutput`, `commitUserMessage`, and `commitSystemMessage` methods are used to commit different types of output. The `connect` method connects the session to a connector function, and `dispose` should be called when the session is disposed.

## ClientHistory

The `ClientHistory` class in TypeScript represents the history of client messages and implements the `IHistory` interface. It has a constructor that takes in `IHistoryParams` as a parameter. The class also has several properties and methods to interact with the history.

The `push` method allows you to add a new message to the history asynchronously. The `toArrayForRaw` method converts the history into an array of raw messages asynchronously. The `toArrayForAgent` method converts the history into an array of messages specifically for the agent, taking in a prompt and optional system messages as parameters. Finally, the `dispose` method should be called when an agent is disposed to clean up any resources associated with the history.

## ClientAgent

The `ClientAgent` class in TypeScript implements the `IAgent` interface and represents a client agent that interacts with the system. It has a constructor that takes in `IAgentParams` as a parameter. The class has several properties and methods for handling agent interactions, such as emitting output results after validation, resurrecting the model based on a given reason, waiting for output to be available, getting completion messages from the model, committing user and system messages to history, and executing incoming messages while processing tool calls if necessary. The `dispose` method should be called when the agent is disposed.

## BusService

The BusService is an implementation of the IBus interface. It provides a way to handle events and subscriptions for different clients. The constructor is used to initialize the service, and it has properties such as loggerService, sessionValidationService, _eventSourceSet, _eventWildcardMap, and getEventSubject.

The subscribe method allows you to subscribe to events for a specific client and source. It takes in the clientId, source, and a function to handle the events. It returns an unsubscribe function that can be used to stop the subscription.

The once method is similar to subscribe, but it only allows you to handle a single event. It takes in the clientId, source, a filter function to specify which event should be handled, and a function to handle the event.

The emit method allows you to send an event for a specific client. It takes in the clientId and an event object.

The dispose method is used to clean up all event subscriptions for a specific client. It takes in the clientId as a parameter and disposes of all subscriptions for that client.

## AgentValidationService

The `AgentValidationService` is a service used for validating agents within an agent swarm. It has a constructor that initializes the logger service, tool validation service, completion validation service, and storage validation service. The service also has properties for these services and an `_agentMap` to store agent information.

The service provides methods to retrieve the list of storages and states used by an agent. The `getStorageList` method returns an array of storage names used by the specified agent, while `getStateList` returns an array of state names used by the specified agent.

To add a new agent, you can use the `addAgent` method by providing the agent name and its schema.

The `hasStorage` method checks if an agent has a registered storage by its name. It returns `true` if the agent has the specified storage, and `false` otherwise. This method also supports memoization to improve performance.

Similarly, the `hasState` method checks if an agent has a registered state by its name. It also supports memoization for better performance.

To validate an agent by its name and source, you can use the `validate` method. This will perform validation on the specified agent based on its configuration.

## AgentSchemaService

The `AgentSchemaService` is a service used for managing agent schemas. It has a constructor, `loggerService` and `registry` properties, as well as `register` and `get` methods. The `loggerService` is used for logging, while the `registry` stores registered agent schemas. The `register` method is used to add a new agent schema, and the `get` method retrieves an agent schema by its name.

## AgentPublicService

The `AgentPublicService` is a TypeScript class that implements the `TAgentConnectionService` interface. It is responsible for managing public agent operations, such as creating an agent reference, executing commands on the agent, waiting for output from the agent, committing tool and system messages to the agent, flushing the agent's history, and disposing of an agent.

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

The `AgentConnectionService` is a TypeScript class that implements the `IAgent` interface. It is responsible for managing agent connections and provides various methods to interact with the agent.

To use this service, you need to provide the `loggerService`, `busService`, `methodContextService`, `sessionValidationService`, `historyConnectionService`, `storageConnectionService`, `agentSchemaService`, `toolSchemaService`, and `completionSchemaService` as dependencies.

The `getAgent` method retrieves an agent instance by providing the `clientId` and `agentName`. The `execute` method allows you to execute an input command asynchronously. The `waitForOutput` method waits for the output from the agent. The `commitToolOutput` method commits the tool output asynchronously. The `commitSystemMessage` method commits a system message asynchronously. The `commitUserMessage` method commits a user message without an answer asynchronously. The `commitAgentChange` method commits an agent change to prevent the next tool execution from being called. The `commitFlush` method commits a flush of the agent history. The `dispose` method disposes of the agent connection asynchronously.

Overall, the `AgentConnectionService` provides a way to interact with an agent, execute commands, and manage the communication between different components in a system.
