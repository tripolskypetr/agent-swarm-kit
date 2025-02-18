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

The `ToolValidationService` is a service designed for validating tools within an agent-swarm system. It provides a way to add new tools and validate their existence. The service utilizes a loggerService for logging purposes and maintains an internal map of tools, represented by `_toolMap`.

To add a new tool to the validation service, you can use the `addTool` function. This function takes two parameters: `toolName`, which is the name of the tool, and `toolSchema`, which is an object representing the schema of the tool.

To validate if a specific tool exists in the validation service, you can use the `validate` function. This function takes two parameters: `toolName`, which is the name of the tool to be validated, and `source`, which represents the source of the tool.

By using these functions, you can effectively manage and validate tools within your agent-swarm system.

## ToolSchemaService

The `ToolSchemaService` is a service that manages tool schemas. It has a constructor that initializes the service with a logger and registry. The `register` function allows you to register a tool with a given key and value, while the `get` function retrieves a tool by its key. This service is used for managing and accessing tool schemas in the application.

## SwarmValidationService

The SwarmValidationService is a service used for validating swarms and their agents. It has a constructor, loggerService and agentValidationService properties. The constructor is used to initialize the service, while loggerService and agentValidationService are used for logging and validating agents respectively. The service also has a swarmMap property for storing swarms and their associated agents.

To add a new swarm, you can use the `addSwarm` method by providing a swarm name and its schema. This will add the swarm to the swarm map.

To retrieve a list of agents for a given swarm, you can use the `getAgentList` method by providing a swarm name. This will return an array of agent names associated with the swarm.

To validate a swarm and its agents, you can use the `validate` method by providing a swarm name and the source code of the swarm. This will validate the swarm and its agents using the loggerService and agentValidationService properties.

## SwarmSchemaService

The SwarmSchemaService is a service used for managing swarm schemas. It has a constructor, loggerService property, registry property and two methods: register() and get(). The loggerService property is used for logging messages. The registry property stores the swarm schemas and the register() method is used to add a new swarm schema. The get() method is used to retrieve a swarm schema by its name.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It is designed to manage public interactions with swarms. The class has a constructor, several properties and methods for interacting with swarms, such as waiting for output, getting agent names and agents from swarms, setting agent references and names in swarms, and disposing of swarms. The properties include loggerService, swarmConnectionService, waitForOutput, getAgentName, getAgent, setAgentRef, setAgentName and dispose. This service allows users to interact with swarms in a public context, providing methods to retrieve and update swarm information.

## SwarmConnectionService

The SwarmConnectionService is a TypeScript class that implements the ISwarm interface and manages connections to swarms. It has a constructor, properties for dependency injection of other services, and several methods to interact with the swarm.

The getSwarm method retrieves a swarm instance based on the client ID and swarm name. The waitForOutput method waits for output from the swarm. The getAgentName method retrieves the agent name from the swarm, while getAgent retrieves the agent from the swarm. The setAgentRef method sets the agent reference in the swarm, and setAgentName sets the agent name in the swarm. Finally, dispose is used to clean up and close the swarm connection.

## StorageValidationService

The StorageValidationService is a service designed to validate storages within the storage swarm. It provides a way to add new storages, as well as validate existing ones by their name and source. The service also has a loggerService for logging events, an embeddingValidationService for validating embedded storages, and a storageMap for managing the stored data.

To use this service, you can create an instance of StorageValidationService and pass any necessary dependencies to the constructor. You can then add new storages using the `addStorage` method, which takes a storage name and its schema. To validate an existing storage, use the `validate` method by providing its name and source.

This service helps ensure that the storages within the storage swarm are properly validated and managed, providing a reliable foundation for your application.

## StorageUtils

The `StorageUtils` class implements the `TStorage` interface and provides various methods for interacting with a storage system. It allows you to take, upsert, remove, get, list, and clear items from the storage.

- `constructor()`: Initializes an instance of the `StorageUtils` class.
- `take(search: string, total: number, clientId: string, agentName: string, storageName: string, score?: number): Promise<T[]>`: Retrieves items from the storage based on search criteria and other parameters.
- `upsert(item: T, clientId: string, agentName: string, storageName: string): Promise<void>`: Upserts an item into the storage, updating or creating it as necessary.
- `remove(itemId: StorageId, clientId: string, agentName: string, storageName: string): Promise<void>`: Removes an item from the storage based on its unique identifier.
- `get(itemId: StorageId, clientId: string, agentName: string, storageName: string): Promise<T>`: Retrieves an item from the storage based on its unique identifier.
- `list(clientId: string, agentName: string, storageName: string, filter?: (item: T) => boolean): Promise<T[]>`: Retrieves a list of items from the storage, optionally filtering them based on a provided function.
- `clear(clientId: string, agentName: string, storageName: string): Promise<void>`: Clears the entire storage, removing all items.

These methods can be used to interact with a storage system in TypeScript, allowing you to manipulate and retrieve data efficiently.

## StorageSchemaService

The StorageSchemaService is a service used for managing storage schemas. It has a constructor, loggerService property, registry property and two methods: register() and get(). The loggerService property is used for logging messages, while the registry property stores registered storage schemas. The register() method is used to add a new storage schema, and the get() method retrieves a storage schema by its key.

## StoragePublicService

The `StoragePublicService` is a TypeScript class that implements the `TStorageConnectionService` interface. It is responsible for managing interactions with public storage services. The class has a constructor, properties such as `loggerService` and `storageConnectionService`, as well as several methods for interacting with the storage.

The `take` method retrieves a list of storage data based on a search query and total number of items. It returns a promise that resolves to an array of `IStorageData` objects.

The `upsert` method upserts an item in the storage. It takes an `IStorageData` object, the client ID, and storage name as parameters, and returns a promise that resolves when the operation is complete.

The `remove` method removes an item from the storage based on its ID. It takes the item's ID, client ID, and storage name as parameters, and returns a promise that resolves when the operation is complete.

The `get` method retrieves an item from the storage by its ID. It takes the item's ID, client ID, and storage name as parameters, and returns a promise that resolves to the `IStorageData` object if found, or throws an error if not.

The `list` method retrieves a list of items from the storage, optionally filtered by a predicate function. It takes the client ID, storage name, and an optional filter function as parameters. The filter function can be used to specify conditions for the items to match before being included in the list. The method returns a promise that resolves to an array of `IStorageData` objects.

The `clear` method clears all items from the storage. It takes the client ID and storage name as parameters, and returns a promise that resolves when the operation is complete.

The `dispose` method disposes of the storage. It takes the client ID and storage name as parameters, and returns a promise that resolves when the storage is successfully disposed.

## StorageConnectionService

The StorageConnectionService is a service that manages storage connections and provides methods for interacting with the stored data. It implements the IStorage interface and has properties for loggerService, contextService, storageSchemaService, and embeddingSchemaService. 

The constructor is used to initialize the service. 

The getStorage method retrieves a storage instance based on the client ID and storage name. 

The take method retrieves a list of storage data based on a search query and total number of items. 

The upsert method upserts an item in the storage. 

The remove method removes an item from the storage. 

The get method retrieves an item from the storage by its ID. 

The list method retrieves a list of items from the storage, optionally filtered by a predicate function. 

The clear method clears all items from the storage. 

The dispose method is used to dispose of the storage connection.

## SessionValidationService

The `SessionValidationService` is a Typescript class that provides methods for managing and validating sessions. It uses several maps to store session information, including `_historySwarmMap`, `_sessionSwarmMap`, `_agentSwarmMap`, and `_sessionModeMap`. 

To add a new session, you can use the `addSession` method by providing the client ID, swarm name, and session mode. The `addAgentUsage` method allows you to add an agent usage to a session, while `removeAgentUsage` and `removeHistoryUsage` remove agent usages or history usages from a session, respectively.

To get the mode of a session, you can use the `getSessionMode` method by providing the client ID. The `hasSession` method checks if a session exists for the given client ID.

The `getSessionList` method returns a list of all session IDs, while `getSessionAgentList` and `getSessionHistoryList` return the list of agents for a session and the history list of agents, respectively.

To get the swarm name for a session, you can use the `getSwarm` method by providing the client ID. Finally, `validate` method checks if a session exists for the given client ID and source, while `removeSession` removes a session by providing the client ID.

## SessionPublicService

The `SessionPublicService` is a TypeScript class that provides functionality for managing public session interactions. It implements the `TSessionConnectionService` interface. The class has a constructor, several properties and methods for emitting messages, executing commands, connecting to the session, committing tool output and system messages, committing user messages without answer, flushing the agent history, and disposing of the session. This service is used for handling interactions within a public session, allowing users to communicate and execute commands in a collaborative environment.

## SessionConnectionService

The `SessionConnectionService` is a TypeScript class that implements the `ISession` interface and provides functionality for managing session connections. It has a constructor that initializes properties such as `loggerService`, `contextService`, `swarmConnectionService`, and `swarmSchemaService`. 

The class has several methods: `getSession` for retrieving a memoized session based on clientId and swarmName, `emit` for emitting a message to the session, `execute` for executing a command in the session, `connect` for connecting to the session using a provided connector, `commitToolOutput` for committing tool output to the session, `commitSystemMessage` for committing a system message to the session, `commitUserMessage` for committing a user message to the agent without answer, `commitFlush` for committing user message to the agent without answer, and `dispose` for disposing of the session connection service.

## LoggerService

The LoggerService is a class that implements the ILogger interface, providing methods to log and debug messages. It has a constructor that initializes an internal logger property. The class also has two properties: `log` and `debug`, which are used to log messages of different levels. The `setLogger` method allows you to set a new logger for the service.

## HistoryPublicService

The `HistoryPublicService` is a TypeScript class that implements the `THistoryConnectionService` interface. It is responsible for handling public operations related to history management. The class has a constructor, properties such as `loggerService`, `historyConnectionService`, and methods like `push`, `toArrayForAgent`, `toArrayForRaw`, and `dispose`.

The `push` method allows you to push a message to the history asynchronously. It takes three parameters: `message` of type `IModelMessage`, `clientId` of type string, and `agentName` of type string.

The `toArrayForAgent` method converts the history to an array specifically for a given agent. It takes three parameters: `prompt` of type string, `clientId` of type string, and `agentName` of type string. It returns an array of `IModelMessage` objects asynchronously.

The `toArrayForRaw` method converts the history to a raw array. It takes two parameters: `clientId` of type string and `agentName` of type string. It also returns an array of `IModelMessage` objects asynchronously.

The `dispose` method disposes of the history asynchronously. It takes two parameters: `clientId` of type string and `agentName` of type string.

## HistoryConnectionService

The `HistoryConnectionService` is a TypeScript class that implements the `IHistory` interface and provides functionality for managing history connections. It has a constructor that initializes the loggerService, contextService, and sessionValidationService properties.

The class has several methods: `getItems`, `getHistory`, `push`, `toArrayForAgent`, `toArrayForRaw`, and `dispose`. 

The `getItems` method retrieves items for a given client and agent, while the `getHistory` method retrieves the history for a given client and agent. Both methods also implement `IClearableMemoize` and `IControlMemoize`, which allow for clearing and controlling the memoized results.

The `push` method pushes a message to the history asynchronously.

The `toArrayForAgent` method converts the history to an array format for the agent, while `toArrayForRaw` converts the history to a raw array format.

Lastly, the `dispose` method disposes of the history connection service, releasing any resources associated with it.

## EmbeddingValidationService

The EmbeddingValidationService is a tool used within the agent-swarm to validate embeddings. It has a constructor and two main properties: loggerService, which is used for logging purposes, and _embeddingMap, which is used to store the embeddings. 

To add a new embedding, you can use the `addEmbedding` function, which takes in the embedding's name and its schema as parameters. This function will add the new embedding to the validation service.

To validate if an embedding exists in the validation service, you can use the `validate` function. This function takes in the embedding's name and its source as parameters. It will check if the specified embedding exists in the validation service.

## EmbeddingSchemaService

The EmbeddingSchemaService is a service used for managing embedding schemas. It has a constructor, loggerService and registry properties. The `register` function is used to register an embedding with a given key and value, while the `get` function retrieves an embedding by its key. This service allows for efficient management and retrieval of embedding schemas.

## CompletionValidationService

The CompletionValidationService is a TypeScript service that allows you to validate completion names. It has a constructor, loggerService property, and two methods: addCompletion and validate. 

The constructor is used to initialize the service. The loggerService property is used for logging messages, while the _completionSet property is used to store completion names.

The addCompletion method is used to add a new completion name to the set. This allows you to dynamically add new completion names as needed.

The validate method is used to check if a given completion name exists in the set. It also takes a source parameter, which can be useful for tracking where the completion name was used.

## CompletionSchemaService

The `CompletionSchemaService` is a service that manages completion schemas. It has a constructor, `loggerService` and `registry` properties, as well as two methods: `register` and `get`. 

The `register` method is used to register a new completion schema by providing a key and the associated `ICompletionSchema` object.

The `get` method retrieves a completion schema by its key.

## ClientSwarm

The ClientSwarm class is an implementation of the ISwarm interface and manages agents within a swarm. It has a constructor that takes in parameters defined by the ISwarmParams interface. The class also has properties such as `params`, `_agentChangedSubject`, `_activeAgent`, and a method called `waitForOutput` that waits for output from the active agent. Other methods include `getAgentName`, which retrieves the name of the active agent, `getAgent`, which retrieves the active agent, `setAgentRef`, which sets the reference of an agent in the swarm, and `setAgentName`, which sets the active agent by name.

## ClientStorage

The `ClientStorage` class is an implementation of the `IStorage<T>` interface and is used to manage storage operations. It has a constructor that takes in `IStorageParams<T>` as a parameter. The class has several properties and methods for performing various storage operations.

The `params` property holds the parameters used to initialize the storage. The `_itemMap` property is used to store the items in the storage. The `_createEmbedding` property is a function that creates an embedding for the given item. The `waitForInit` property is a function that waits for the storage to be initialized.

The `take` method takes a specified number of items based on the search criteria and returns them as an array. The `upsert` method upserts an item into the storage. The `remove` method removes an item from the storage. The `clear` method clears all items from the storage. The `get` method gets an item by its ID. The `list` method lists all items in the storage, optionally filtered by a predicate.

## ClientSession

The `ClientSession` class in this Typescript API Reference is an implementation of the `ISession` interface. It has a constructor that takes in `ISessionParams` as a parameter. The class provides several properties and methods for handling session-related operations.

The `params` property holds the session parameters, while the `_emitSubject` property is a subject that emits messages. The `emit` method allows you to emit a message, and the `execute` method executes a message, optionally emitting the output.

Other methods include `commitToolOutput`, which commits tool output; `commitUserMessage`, which commits a user message without an answer; `commitFlush`, which commits a flush of the agent's history; `commitSystemMessage`, which commits a system message; `connect`, which connects the session to a connector function; and `dispose`, which should be called when the session is disposed.

## ClientHistory

The `ClientHistory` class in TypeScript represents the history of messages exchanged between a client and an AI model. It implements the `IHistory` interface and provides various methods to interact with the message history.

The class has a constructor that takes in `IHistoryParams` as a parameter. This allows for customization of the history object based on specific requirements.

The `params` property holds the parameters used to create the `ClientHistory` instance.

The `_filterCondition` property is a filter condition used specifically for the `toArrayForAgent` method. This condition helps in filtering out irrelevant messages when generating the message array for the agent.

The `push` method allows you to add a new message to the history asynchronously. It takes an `IModelMessage` object as a parameter and returns a Promise that resolves when the message is successfully added.

The `toArrayForRaw` method converts the history into an array of raw messages asynchronously. It returns a Promise that resolves to an array of `IModelMessage` objects representing the raw messages in the history.

The `toArrayForAgent` method converts the history into an array of messages suitable for the agent. It takes a `prompt` string and an optional array of `system` messages as parameters. The method applies the `_filterCondition` to filter out irrelevant messages and returns a Promise that resolves to an array of `IModelMessage` objects representing the filtered messages for the agent. If an optional `system` array is provided, it will be included in the message array for the agent.

## ClientAgent

The `ClientAgent` class in TypeScript implements the `IAgent` interface and represents a client agent that interacts with the system. It has a constructor that takes in `IAgentParams` as a parameter. The class has several properties and methods for handling agent interactions, such as emitting output results after validation, resurrecting the model based on a given reason, waiting for output to be available, getting completion messages from the model, committing user and system messages to history without answer, committing flush of agent history, and executing incoming messages while processing tool calls if any. The `dispose` method should be called when the agent is disposed.

## AgentValidationService

The `AgentValidationService` is a service used for validating agents within an agent swarm. It has a constructor that initializes the logger service, tool validation service, completion validation service, and storage validation service. The `loggerService` is used for logging messages, while the other validation services are used for validating different aspects of the agent.

The service also has a property called `_agentMap` which is used to store the agents. The `getStorageList` function retrieves the list of storages used by a specific agent. The `addAgent` function is used to add a new agent to the validation service.

The `hasStorage` function checks if an agent has a registered storage by its name. It returns `true` if the agent has the specified storage, and `false` otherwise.

Lastly, the `validate` function is used to validate an agent by its name and source. This function is used to ensure that the agent meets all validation requirements before being used in the swarm.

## AgentSchemaService

The `AgentSchemaService` is a service used for managing agent schemas. It has a constructor, `loggerService` and `registry` properties, as well as two methods: `register` and `get`. The `loggerService` is used for logging purposes, while the `registry` is used to store registered agent schemas.

The `register` method is used to add a new agent schema by providing a key and an `IAgentSchema` object. This allows for easy storage and retrieval of agent schemas.

The `get` method is used to retrieve an agent schema by its name. It takes a key as input and returns the corresponding `IAgentSchema` object. This allows for easy access to specific agent schemas when needed.

## AgentPublicService

The `AgentPublicService` is a TypeScript class that implements the `TAgentConnectionService` interface. It is responsible for managing public operations related to agents. The class has a constructor, several properties and methods.

The `createAgentRef` method creates a reference to an agent by providing the client ID and agent name. The `execute` method allows you to execute a command on the agent by providing input, execution mode, client ID and agent name. The `waitForOutput` method waits for the agent's output after executing a command.

The `commitToolOutput`, `commitSystemMessage` and `commitUserMessage` methods allow you to commit tool output, system messages and user messages respectively to the agent. The `commitFlush` method commits a flush of the agent's history. The `dispose` method disposes of the agent by providing the client ID and agent name.

## AgentConnectionService

The `AgentConnectionService` is a TypeScript class that implements the `IAgent` interface and provides functionality for managing agent connections. It has a constructor that initializes several properties, including `loggerService`, `contextService`, `sessionValidationService`, `historyConnectionService`, `agentSchemaService`, `toolSchemaService`, and `completionSchemaService`.

The class provides several methods: `getAgent` for retrieving an agent instance, `execute` for executing input commands, `waitForOutput` for waiting for the agent's output, `commitToolOutput` for committing tool output, `commitSystemMessage` for committing system messages, `commitUserMessage` for committing user messages without answers, `commitFlush` for committing a flush of agent history, and `dispose` for disposing of the agent connection.

Overall, this class is responsible for managing agent connections and providing methods to execute commands, handle output, commit messages, and manage agent history.
