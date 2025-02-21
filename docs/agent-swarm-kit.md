# Agent Swarm Kit

## Overview

The agent-swarm-kit is a TypeScript framework designed for creating and managing swarms of intelligent agents that can collaborate, communicate, and coordinate with each other. At its core are services for managing various components: agents (via AgentConnectionService), swarms (via SwarmConnectionService), sessions (via SessionConnectionService), history tracking (via HistoryConnectionService), and storage (via StorageConnectionService).

The system follows a validation-schema pattern where each component (tools, agents, swarms, storage, embeddings, and completions) has both a validation service for runtime checks and a schema service for type definitions. Client implementations (ClientAgent, ClientSwarm, ClientSession, ClientHistory, and ClientStorage) provide concrete implementations of these services' interfaces.

The framework designed with flexibility in mind, allowing developers to create complex agent interactions while maintaining control through validation, schema enforcement, and proper connection management. Public services act as façades, providing simplified interfaces for external consumers, while connection services handle the internal complexity of maintaining state, coordinating components, and enforcing business rules.

### Agent Services
- `AgentValidationService`: Validates and manages agent schemas
- `AgentConnectionService`: Handles agent connections and interactions
- `AgentPublicService`: Provides public methods for agent operations

### Tool Services
- `ToolValidationService`: Validates tool existence and schemas
- `ToolSchemaService`: Manages tool schema registration

### Session Services
- `SessionConnectionService`: Manages session connections
- `SessionValidationService`: Validates and tracks session states
- `SessionPublicService`: Provides public session interaction methods

### History Services
- `HistoryConnectionService`: Manages message history
- `HistoryPublicService`: Handles public history operations

### Completion Services
- `CompletionValidationService`: Validates completion names
- `CompletionSchemaService`: Manages completion schemas

### Key Interfaces

- `IAgent`: Agent interaction contract
- `ISession`: Session management interface
- `ISwarm`: Swarm interaction protocol
- `IHistory`: History tracking interface

### Architectural Principles

- Modular design
- Dynamic agent creation
- Standardized interaction interfaces
- Comprehensive validation mechanisms

### Use Cases

- AI-driven collaborative systems
- Multi-agent problem-solving platforms
- Complex interaction scenarios

### Example Workflow

1. Create agent schemas
2. Register tools and completions
3. Initialize sessions
4. Execute agent interactions
5. Track and manage interaction history

### Implementation Highlights

- TypeScript-based
- Extensive logging support
- Flexible connection mechanisms
- Robust error handling


## ToolValidationService

The `ToolValidationService` is a service used for validating tools within the agent-swarm system. It provides a way to add new tools and validate their existence. The service has a loggerService property for logging purposes and an internal `_toolMap` property to store the tools.

To add a new tool, you can use the `addTool` function by providing a tool name and its schema as parameters. This function will add the tool to the validation service.

To validate if a tool exists in the validation service, you can use the `validate` function by providing a tool name and its source code as parameters. This function will check if the tool exists in the validation service.

Overall, this API reference describes a service for managing and validating tools within the agent-swarm system.

## ToolSchemaService

The `ToolSchemaService` is a service that manages tool schemas. It has a constructor that initializes the service with a logger and registry. The `register` function allows you to register a tool with a given key and value, while the `get` function retrieves a tool by its key. This service provides functionality for managing and accessing tool schemas in your application.

## SwarmValidationService

The SwarmValidationService is a service used for validating swarms and their agents. It has a constructor, properties such as loggerService and agentValidationService for logging and handling agent validation, a private property _swarmMap for storing swarms, and methods addSwarm for adding new swarms, getAgentList for retrieving agent lists of a swarm, and validate for validating swarms and their agents.

## SwarmSchemaService

The SwarmSchemaService is a service that manages swarm schemas. It has a constructor, loggerService property for logging messages, registry property to store registered schemas, and register and get methods for adding new schemas and retrieving them by name, respectively.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It is designed to manage public interactions with swarms. The class has a constructor, several properties and methods to interact with swarms.

The loggerService and swarmConnectionService are properties that provide logging capabilities and connection management to the service.

The waitForOutput method allows the service to wait for output from a swarm, taking in the clientId and swarmName as parameters.

The getAgentName method retrieves the agent name from a swarm, using clientId and swarmName as parameters.

The getAgent method retrieves the agent from a swarm, using clientId and swarmName as parameters.

The setAgentRef method sets the agent reference in a swarm, taking clientId, swarmName, agentName and the agent object as parameters.

The setAgentName method sets the agent name in a swarm, using agentName, clientId and swarmName as parameters.

The dispose method allows the service to dispose of a swarm, using clientId and swarmName as parameters.

## SwarmConnectionService

The `SwarmConnectionService` is a TypeScript class that implements the `ISwarm` interface and manages connections to swarms. It has a constructor, several properties for dependency injection, and various methods to interact with the swarm.

The `getSwarm` method retrieves a swarm instance based on the client ID and swarm name. The `waitForOutput` method waits for output from the swarm. The `getAgentName` method retrieves the agent name from the swarm. The `getAgent` method retrieves the agent from the swarm. The `setAgentRef` method sets the agent reference in the swarm. The `setAgentName` method sets the agent name in the swarm. The `dispose` method disposes of the swarm connection.

## StorageValidationService

The StorageValidationService is a service used for validating storages within the storage swarm. It provides methods to add new storages and validate existing ones. The constructor initializes the service with a loggerService, embeddingValidationService, and an empty storage map.

To add a new storage, you can use the `addStorage` method by providing a storage name and its schema. The `validate` method allows you to validate a storage by specifying its name and source.

This service helps ensure that the storages within the storage swarm are properly validated and functioning correctly.

## StorageUtils

The `StorageUtils` is a TypeScript class that implements the `TStorage` interface. It provides several methods for interacting with a storage system.

1. `constructor()`: This is the constructor method for creating an instance of `StorageUtils`.
2. `take()`: This method allows you to retrieve items from the storage. It takes a payload object with properties such as `search`, `total`, `clientId`, `agentName`, and `storageName`. It returns a Promise that resolves to an array of items matching the specified criteria.
3. `upsert()`: This method enables you to upsert (insert or update) an item in the storage. It takes a payload object with properties such as `item`, `clientId`, `agentName`, and `storageName`. It returns a Promise that resolves to `void`.
4. `remove()`: This method allows you to remove an item from the storage. It takes a payload object with properties such as `itemId`, `clientId`, `agentName`, and `storageName`. It returns a Promise that resolves to `void`.
5. `get()`: This method enables you to retrieve a specific item from the storage. It takes a payload object with properties such as `itemId`, `clientId`, `agentName`, and `storageName`. It returns a Promise that resolves to the specified item.
6. `list()`: This method allows you to list items from the storage. It takes a payload object with properties such as `clientId`, `agentName`, and `storageName`. Optionally, you can provide a `filter` function to specify the criteria for filtering items. It returns a Promise that resolves to an array of items matching the specified criteria.
7. `clear()`: This method allows you to clear the entire storage. It takes a payload object with properties such as `clientId`, `agentName`, and `storageName`. It returns a Promise that resolves to `void`.

Overall, the `StorageUtils` class provides a set of methods to interact with a storage system, allowing you to retrieve, insert, update, remove, and list items in the storage.

## StorageSchemaService

The StorageSchemaService is a service used for managing storage schemas. It has a constructor, loggerService property, registry property and two methods: register() and get(). The loggerService property is used for logging messages, while the registry property stores registered storage schemas. The register() method is used to add a new storage schema, and the get() method retrieves a storage schema by its key. This service allows for efficient management and retrieval of storage schemas in a TypeScript application.

## StoragePublicService

The `StoragePublicService` is a TypeScript class that implements the `TStorageConnectionService` interface. It is responsible for managing interactions with public storage services. The class has properties `loggerService` and `storageConnectionService`, which are instances of other classes used for logging and connecting to storage services, respectively.

The class provides several methods for interacting with the storage:
- `take` retrieves a list of storage data based on a search query and total number of items.
- `upsert` upserts an item in the storage.
- `remove` removes an item from the storage.
- `get` retrieves an item from the storage by its ID.
- `list` retrieves a list of items from the storage, optionally filtered by a predicate function.
- `clear` clears all items from the storage.
- `dispose` disposes of the storage.

These methods allow for efficient management and manipulation of data stored in public storage services.

## StorageConnectionService

The StorageConnectionService is a service that manages storage connections and provides methods for interacting with the stored data. It implements the IStorage interface and has a constructor that takes no arguments. The service also has several properties, including loggerService for logging messages, contextService for managing the application's execution context, storageSchemaService for managing the schema of stored data, sessionValidationService for validating user sessions, and embeddingSchemaService for managing the schema of embedded data.

The StorageConnectionService provides a method called getStorage, which retrieves a storage instance based on the client ID and storage name. It also has several other methods for interacting with the stored data, such as take for retrieving a list of storage data based on a search query and total number of items, upsert for upserting an item in the storage, remove for removing an item from the storage by its ID, get for retrieving an item from the storage by its ID, list for retrieving a list of items from the storage, optionally filtered by a predicate function, clear for clearing all items from the storage, and dispose for disposing of the storage connection.

## SessionValidationService

The `SessionValidationService` is a service used for validating and managing sessions in an application. It provides methods to add, remove and get information about sessions. The service also allows for adding and removing agent, history, and storage usages to/from sessions. The constructor initializes the service with a loggerService, and several maps to store session information.

To use the service, you can create an instance of `SessionValidationService` and call its methods as needed. For example, to add a new session, you can use the `addSession` method by providing the client ID, swarm name, and session mode. To get the list of all session IDs, you can use the `getSessionList` method. To validate if a session exists, you can use the `validate` method by providing the client ID and source.

The service also provides methods to get the session mode, swarm name, agent list, and history list for a session. You can use the `getSessionMode`, `getSwarm`, `getSessionAgentList`, and `getSessionHistoryList` methods respectively by providing the client ID.

If you need to remove a session or an agent, history, or storage usage from a session, you can use the `removeSession`, `removeAgentUsage`, `removeHistoryUsage`, and `removeStorageUsage` methods respectively by providing the session ID and agent name or storage name.

Overall, the `SessionValidationService` provides a way to manage and validate sessions in an application, allowing for easy addition and removal of session information.

## SessionPublicService

The `SessionPublicService` is a TypeScript class that provides functionality for managing public session interactions. It implements the `TSessionConnectionService` interface. This service handles tasks such as emitting messages, executing commands, connecting to the session, committing tool output and system messages, committing user messages without an answer, flushing the agent history, and disposing of the session. The class has properties for `loggerService`, `sessionConnectionService`, and functions for emitting messages, executing commands, connecting to the session, committing tool output and system messages, committing user messages without an answer, flushing the agent history, and disposing of the session.

## SessionConnectionService

The `SessionConnectionService` is a TypeScript class that implements the `ISession` interface and provides functionality for managing session connections. It has a constructor that initializes the loggerService, contextService, swarmConnectionService, and swarmSchemaService properties.

The `getSession` method retrieves a memoized session based on the clientId and swarmName provided. The `emit` method allows you to emit a message to the session asynchronously. The `execute` method executes a command in the session and returns its result asynchronously.

The `connect` method connects to the session using a provided connector. The `commitToolOutput`, `commitSystemMessage`, and `commitUserMessage` methods allow you to commit tool output, system messages, and user messages to the session respectively. The `commitFlush` method commits any pending messages to the session.

The `dispose` method disposes of the session connection service.

## LoggerService

The LoggerService is a class that implements the ILogger interface, providing methods to log and debug messages. It has a constructor that initializes an internal logger property. The class also has two properties: `log` and `debug`, which are used to log messages of different levels. The `setLogger` method allows you to set a new logger for the service.

## HistoryUtils

The `HistoryUtils` class provides functionality for managing and interacting with the history of messages in a system. It implements `IHistoryAdapter` and `IHistoryControl`, which allow for customization and control over the history. The class has a constructor, several properties and methods for interacting with the history.

The `HistoryFactory` and `HistoryCallbacks` properties store any custom factories and callbacks used for the history. The `getHistory` method retrieves the history of messages. The `useHistoryAdapter` method allows for using a custom history adapter, while the `useHistoryCallbacks` method enables using history lifecycle callbacks.

The `push` method is used to add a new message to the history, and it returns a promise that resolves when the message is successfully added. The `dispose` method disposes of the history for a specific client and agent, returning a promise that resolves when the disposal is complete.

The `iterate` method allows for iterating over the history messages, returning an `AsyncIterableIterator` that can be used to access each message in the history.

## HistoryPublicService

The `HistoryPublicService` is a TypeScript class that implements the `THistoryConnectionService` interface. It is responsible for handling public operations related to history management. The class has a constructor, properties such as `loggerService`, `historyConnectionService`, and methods like `push`, `toArrayForAgent`, `toArrayForRaw`, and `dispose`.

The `push` method allows you to push a message to the history asynchronously. It takes three parameters: `message` of type `IModelMessage`, `clientId` of type string, and `agentName` of type string.

The `toArrayForAgent` method converts the history into an array specifically for a given agent. It takes three parameters: `prompt` of type string, `clientId` of type string, and `agentName` of type string. It returns an array of `IModelMessage` objects asynchronously.

The `toArrayForRaw` method converts the history into a raw array. It takes two parameters: `clientId` of type string and `agentName` of type string. It also returns an array of `IModelMessage` objects asynchronously.

The `dispose` method allows you to dispose of the history asynchronously. It takes two parameters: `clientId` of type string and `agentName` of type string.

## HistoryInstance

The `HistoryInstance` class in TypeScript represents a History Instance and implements the `IHistoryInstance` interface. It has a constructor that takes in `clientId` and `callbacks`, which are used to initialize the instance. The class also has several properties and methods for interacting with the history.

The `clientId` property stores the client ID associated with this history instance, while `callbacks` is an object containing callback functions that can be used to handle events related to the history. The `_array` property is an internal array used to store history messages.

The `waitForInit` method allows you to wait for the history instance to initialize. Once initialized, you can use the `push` method to add new messages to the history for a specific agent. The `dispose` method is used to clean up the history instance for a given agent.

The `iterate` method allows you to iterate over the history messages for a specific agent asynchronously. This can be useful for processing or displaying the history messages in a user interface.

## HistoryConnectionService

The `HistoryConnectionService` is a TypeScript class that implements the `IHistory` interface. It is responsible for managing history connections and provides several methods to interact with the history. The class has a constructor that initializes the loggerService, contextService, and sessionValidationService.

The `getHistory` method retrieves the history for a specific client and agent. The `push` method allows you to push a message to the history asynchronously. The `toArrayForAgent` method converts the history to an array format for the agent. The `toArrayForRaw` method converts the history to a raw array format. Finally, the `dispose` method disposes of the history connection service.

Overall, this class provides a way to manage and interact with the history in an application.

## EmbeddingValidationService

The EmbeddingValidationService is a tool used within the agent-swarm to manage and validate embeddings. It provides a way to add new embeddings and validate their existence. The service keeps track of embeddings using an internal map, and also has a loggerService for logging any relevant information.

To add a new embedding, you can use the `addEmbedding` function, which takes in the name of the embedding and its schema as parameters. This function will add the new embedding to the validation service.

To validate if an embedding exists, you can use the `validate` function. This function takes in the name of the embedding and its source as parameters. It will check if the specified embedding exists in the validation service.

Overall, this API reference describes a service for managing and validating embeddings within the agent-swarm system.

## EmbeddingSchemaService

The EmbeddingSchemaService is a service used for managing embedding schemas. It has a constructor, loggerService and registry properties. The `register` function is used to register an embedding with a given key and value, while the `get` function is used to retrieve an embedding by its key. This service allows for efficient management and retrieval of embedding schemas.

## CompletionValidationService

The CompletionValidationService is a service used for validating completion names. It has a constructor that initializes the service, and two properties: loggerService for logging purposes, and _completionSet to store the set of completion names.

To add a new completion name to the set, you can use the addCompletion method. This method takes a string parameter representing the completion name.

To validate if a given completion name exists in the set, you can use the validate method. This method takes two parameters: completionName, a string representing the name to be validated, and source, a string representing the source of the completion name.

Overall, this service allows you to manage and validate completion names in your application.

## CompletionSchemaService

The `CompletionSchemaService` is a service that manages completion schemas. It has a constructor, `loggerService` and `registry` properties, as well as two methods: `register` and `get`. The `loggerService` is used for logging, while the `registry` stores completion schemas.

The `register` method allows you to register a new completion schema by providing a key and the corresponding `ICompletionSchema` object. This enables you to store and manage multiple completion schemas.

The `get` method retrieves a completion schema by its key. This allows you to easily access a specific completion schema when needed.

## ClientSwarm

The ClientSwarm class is an implementation of the ISwarm interface and manages agents within a swarm. It has a constructor that takes in parameters defined by the ISwarmParams interface. The class also has several properties and methods to interact with the swarm.

The `waitForOutput` method waits for output from the currently active agent in the swarm. The `getAgentName` method retrieves the name of the currently active agent. The `getAgent` method retrieves the currently active agent.

The `setAgentRef` method sets the reference of an agent in the swarm by providing its name and a reference to the agent. The `setAgentName` method sets the active agent by providing its name.

Overall, the ClientSwarm class provides a way to manage agents within a swarm and interact with them through various methods.

## ClientStorage

The `ClientStorage` class is an implementation of the `IStorage<T>` interface and is used to manage storage operations. It has a constructor that takes in `IStorageParams<T>` as a parameter. The class has several properties and methods for performing various storage operations.

The `params` property holds the storage parameters, while the `_itemMap` property is used to store the items in the storage. The `_createEmbedding` property is a function that creates an embedding for the given item. The `waitForInit` property is used to wait for the initialization of the storage.

The `take` method takes a specified number of items based on the search criteria. The `upsert` method upserts an item into the storage. The `remove` method removes an item from the storage. The `clear` method clears all items from the storage. The `get` method gets an item by its ID. The `list` method lists all items in the storage, optionally filtered by a predicate.

## ClientSession

The `ClientSession` class in this Typescript API Reference is an implementation of the `ISession` interface. It provides various methods and properties for managing communication between a client and an agent.

The `ClientSession` constructor takes in a parameter of type `ISessionParams` to initialize the session. The class also includes several properties, such as `params`, `_emitSubject`, `emit`, and more.

The `emit` method allows the client to emit a message, while `execute` executes a message and optionally emits the output. The `commitToolOutput`, `commitUserMessage`, and `commitSystemMessage` methods are used to commit different types of output messages. The `commitFlush` method commits the flush of agent history.

The `connect` method connects the session to a connector function, and `dispose` should be called when the session is no longer needed to properly dispose of resources.

## ClientHistory

The `ClientHistory` class in TypeScript represents the history of messages exchanged between a client and an agent. It implements the `IHistory` interface and provides various methods to interact with the message history.

The class has a constructor that takes in `IHistoryParams` as a parameter. It also has properties such as `params`, which holds the parameters for the history, and `_filterCondition`, which is a filter condition used in the `toArrayForAgent` method.

The `push` method allows you to add a new message to the history asynchronously. The `toArrayForRaw` method converts the history into an array of raw messages asynchronously. The `toArrayForAgent` method converts the history into an array of messages specifically for the agent, taking into account a prompt and optional system messages. Lastly, the `dispose` method should be called when an agent is disposed to clean up any resources associated with the history.

## ClientAgent

The `ClientAgent` class in TypeScript implements the `IAgent` interface and represents a client agent that interacts with the system. It has a constructor that takes in `IAgentParams` as a parameter. The class has several properties and methods for handling agent interactions, such as emitting output results after validation, resurrecting the model based on a given reason, waiting for output to be available, getting completion messages from the model, committing user and system messages to history, committing tool output to the history, and executing incoming messages while processing tool calls if necessary. The `dispose` method should be called when the agent is disposed.

## AgentValidationService

The `AgentValidationService` is a service that handles the validation of agents within an agent swarm. It uses other services such as `loggerService`, `toolValidationService`, `completionValidationService`, and `storageValidationService` for validation purposes. The service also has a property `_agentMap` which is used for internal purposes.

The `getStorageList` function retrieves the list of storages used by a specific agent. The `addAgent` function adds a new agent to the validation service. The `hasStorage` function checks if an agent has a registered storage. Lastly, the `validate` function validates an agent by its name and source.

## AgentSchemaService

The `AgentSchemaService` is a service that manages agent schemas. It has a constructor, `loggerService` and `registry` properties, as well as two methods: `register` and `get`. The `loggerService` is used for logging, while the `registry` stores registered agent schemas. The `register` method allows you to add a new agent schema by providing a key and an `IAgentSchema` object. The `get` method retrieves an agent schema by its name, specified as a key.

## AgentPublicService

The `AgentPublicService` is a TypeScript class that implements the `TAgentConnectionService` interface. It is responsible for managing public operations related to agents. The class has a constructor, several properties and methods for creating agent references, executing commands on agents, waiting for agent output, committing tool and system messages, flushing agent history, committing change of agents and disposing of an agent. The methods are asynchronous and take in parameters such as client ID, agent name and input for execution.

## AgentConnectionService

The `AgentConnectionService` is a TypeScript class that implements the `IAgent` interface. It is responsible for managing agent connections and provides various methods to interact with the agent. 

The class has a constructor that initializes the logger service, context service, session validation service, history connection service, storage connection service, agent schema service, tool schema service, and completion schema service.

The `getAgent` method retrieves an agent instance by providing a client ID and agent name. The `execute` method executes an input command and returns a promise. The `waitForOutput` method waits for the output from the agent and returns a promise.

The `commitToolOutput`, `commitSystemMessage`, and `commitUserMessage` methods commit tool output, system messages, and user messages without answers respectively. The `commitAgentChange` method commits an agent change to prevent the next tool execution from being called. The `commitFlush` method commits a flush of the agent history.

The `dispose` method disposes of the agent connection.
