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

### API Reference:

- The system is a web application that provides an interface for users to create, view and manage their own surveys.
- Users can create a survey by providing a title, description and adding questions to the survey.
- The system supports different types of questions such as multiple choice, open-ended and rating scale questions.
- Users can view their surveys and the responses received from other users.
- The system also provides analytics and visualization tools to help users analyze the data collected from their surveys.
- The system is designed to be user-friendly and intuitive, with a clean and modern interface.
- The system is built using modern web technologies such as HTML, CSS and JavaScript.
- The system is hosted on a secure server and uses HTTPS encryption to ensure the security of user data.
- The system is scalable and can handle a large number of users and surveys.
- The system is constantly being updated and improved based on user feedback.
- Overall, the system provides a comprehensive and easy-to-use platform for creating, managing and analyzing surveys.

## ToolValidationService

The `ToolValidationService` is a service designed for validating tools within an agent-swarm system. It provides a way to add new tools and validate their existence. The service utilizes a loggerService for logging purposes and maintains an internal tool map (_toolMap) for efficient storage and retrieval of tools.

To add a new tool to the validation service, you can use the `addTool` function. This function takes two parameters: `toolName`, which is the name of the tool, and `toolSchema`, which is an object representing the schema of the tool.

To validate if a specific tool exists in the validation service, you can use the `validate` function. This function takes two parameters: `toolName`, which is the name of the tool to be validated, and `source`, which represents the source of the tool.

By using these functions, you can effectively manage and validate tools within your agent-swarm system.

## ToolSchemaService

The `ToolSchemaService` is a service that manages tool schemas. It has a constructor that initializes the service with a logger and registry. The `register` function allows you to register a tool with a given key and value, while the `get` function retrieves a tool by its key. This service is used to manage and access tool schemas in the application.

## SwarmValidationService

The SwarmValidationService is a service used for validating swarms and their agents. It has a constructor, properties such as loggerService and agentValidationService for logging and handling agent validation, a private property _swarmMap for storing swarms, and methods addSwarm for adding new swarms, getAgentList for retrieving agent lists of a swarm, and validate for validating swarms and their agents.

## SwarmSchemaService

The SwarmSchemaService is a service used for managing swarm schemas. It has a constructor, loggerService property, registry property and two methods: register() and get(). The loggerService property is used for logging messages. The registry property stores the swarm schemas and can be used to register new swarm schemas using the register() method. The get() method is used to retrieve a swarm schema by its name.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It is designed to manage public interactions with swarms. The class has a constructor, several properties and methods for interacting with swarms, such as waiting for output, getting agent names and agents from swarms, setting agent references and names in swarms, and disposing of swarms. The properties include loggerService, swarmConnectionService, waitForOutput, getAgentName, getAgent, setAgentRef, setAgentName and dispose. This service allows users to interact with swarms in a public context, providing methods to retrieve and update swarm information.

## SwarmConnectionService

The SwarmConnectionService is a TypeScript class that implements the ISwarm interface and manages connections to swarms. It has a constructor, properties such as loggerService, contextService, agentConnectionService, and swarmSchemaService for managing logging, context, agent connections, and swarm schema services.

The service provides several methods: getSwarm for retrieving a swarm instance based on client ID and swarm name, waitForOutput for waiting for output from the swarm, getAgentName and getAgent for retrieving agent name and agent from the swarm, setAgentRef for setting agent reference in the swarm, setAgentName for setting agent name in the swarm, and dispose for disposing of the swarm connection.

## StorageValidationService

The StorageValidationService is a service used for validating storages within the storage swarm. It has a constructor, loggerService property for logging purposes, embeddingValidationService property to validate the embeddings of storages, and a private property _storageMap to store the added storages.

To add a new storage, you can use the `addStorage` function by providing a storage name and its schema. This will add the new storage to the validation service.

To validate an existing storage, you can use the `validate` function by providing a storage name and its source. This will validate the specified storage within the swarm.

## StorageUtils

The `StorageUtils` class implements the `TStorage` interface and provides various methods to interact with a storage system. It allows you to take, upsert, remove, get, list, and clear items from the storage.

- `take`: This method takes items from the storage by specifying a search query, total count, client ID, agent name, and storage name. It returns a Promise that resolves to an array of items matching the specified criteria.
- `upsert`: This method upserts an item into the storage. It requires specifying the item, client ID, agent name, and storage name. It returns a Promise that resolves when the item is successfully upserted.
- `remove`: This method removes an item from the storage based on its ID, client ID, agent name, and storage name. It returns a Promise that resolves when the item is successfully removed.
- `get`: This method retrieves an item from the storage based on its ID, client ID, agent name, and storage name. It returns a Promise that resolves to the specified item.
- `list`: This method lists items from the storage based on specified filters. It requires specifying the client ID, agent name, storage name, and an optional filter function. It returns a Promise that resolves to an array of items matching the specified criteria.
- `clear`: This method clears the entire storage based on client ID, agent name, and storage name. It returns a Promise that resolves when the storage is successfully cleared.

## StorageSchemaService

The StorageSchemaService is a management service for storage schemas. It provides methods to register and retrieve storage schemas. The constructor initializes the service, while `loggerService` and `registry` are properties used for logging and registry operations, respectively. The `register` method allows you to add a new storage schema by providing a key and the associated data. The `get` method retrieves a storage schema by its key.

## StoragePublicService

The `StoragePublicService` is a TypeScript class that implements the `TStorageConnectionService` interface. It is responsible for managing interactions with public storage services. The class has properties such as `loggerService` and `storageConnectionService`, which are used for logging and connecting to storage services respectively.

The `take` method retrieves a list of storage data based on a search query and total number of items. It returns a promise that resolves to an array of `IStorageData` objects.

The `upsert` method upserts an item into the storage. It takes an `IStorageData` object, the client ID, and storage name as parameters, and returns a promise that resolves when the operation is complete.

The `remove` method removes an item from the storage based on its ID. It takes the item's ID, client ID, and storage name as parameters, and returns a promise that resolves when the operation is complete.

The `get` method retrieves an item from the storage by its ID. It takes the item's ID, client ID, and storage name as parameters, and returns a promise that resolves to the `IStorageData` object if found, or throws an error otherwise.

The `list` method retrieves a list of items from the storage, optionally filtered by a predicate function. It takes the client ID, storage name, and an optional filter function as parameters. The filter function can be used to specify conditions for the items to match before they are included in the list. The method returns a promise that resolves to an array of `IStorageData` objects.

The `clear` method clears all items from the storage. It takes the client ID and storage name as parameters, and returns a promise that resolves when the operation is complete.

The `dispose` method disposes of the storage. It takes the client ID and storage name as parameters, and returns a promise that resolves when the storage is successfully disposed.

## StorageConnectionService

The StorageConnectionService is a service that manages storage connections and provides methods for interacting with stored data. It implements the IStorage interface and has a constructor that takes no arguments. The service also has properties for loggerService, contextService, storageSchemaService, and embeddingSchemaService.

The getStorage method retrieves a storage instance based on the client ID and storage name. The take method retrieves a list of storage data based on a search query and total number of items. The upsert method upserts an item in the storage. The remove method removes an item from the storage. The get method retrieves an item from the storage by its ID. The list method retrieves a list of items from the storage, optionally filtered by a predicate function. The clear method clears all items from the storage. The dispose method disposes of the storage connection.

## SessionValidationService

The SessionValidationService is a Typescript class that manages and validates sessions. It has properties such as loggerService, _historySwarmMap, _sessionSwarmMap, _agentSwarmMap, and _sessionModeMap for storing session-related data. The service provides methods to add, remove and get session information.

To add a new session, use the `addSession` method by providing the client ID, swarm name and session mode. The `addAgentUsage` method is used to add an agent usage to a session, while `removeAgentUsage` removes an agent usage from a session. Similarly, `addHistoryUsage` and `removeHistoryUsage` are used to add or remove history usage from a session.

To get the mode of a session, use the `getSessionMode` method by providing the client ID. The `hasSession` method checks if a session exists for the given client ID. The `getSessionList` method returns the list of all session IDs, while `getSessionAgentList` and `getSessionHistoryList` return the list of agents for a session and history list of agents respectively.

To get the swarm name for a session, use the `getSwarm` method by providing the client ID. The `validate` method is used to check if a session exists for the given client ID and source. Finally, to remove a session, use the `removeSession` method by providing the client ID.

## SessionPublicService

The `SessionPublicService` is a TypeScript class that provides functionality for managing public session interactions. It implements the `TSessionConnectionService` interface. This service allows you to connect, communicate, and manage sessions.

To use this service, you need to provide a `loggerService` and an instance of `sessionConnectionService`. The class provides several methods to interact with the session:

1. `emit` - Emits a message to the session.
2. `execute` - Executes a command in the session.
3. `connect` - Connects to the session and returns a function for receiving messages.
4. `commitToolOutput` - Commits tool output to the session.
5. `commitSystemMessage` - Commits a system message to the session.
6. `commitUserMessage` - Commits a user message to the agent without an answer.
7. `commitFlush` - Commits a flush of the agent's history.
8. `dispose` - Disposes of the session.

Each method takes specific parameters such as the content of the message, mode for execution, client ID, and swarm name. The methods return promises to handle asynchronous operations.

Overall, the `SessionPublicService` provides a way to interact with public sessions, allowing users to connect, send messages, execute commands, and manage session-related tasks.

## SessionConnectionService

The `SessionConnectionService` is a TypeScript class that implements the `ISession` interface and provides functionality for managing session connections. It has a constructor that initializes the loggerService, contextService, swarmConnectionService, and swarmSchemaService properties. The class also includes several methods for retrieving, emitting, executing messages in the session, connecting to the session using a connector, committing tool output, system messages and user messages to the session, committing all changes, and disposing of the session connection service.

## LoggerService

The LoggerService is a class that implements the ILogger interface, providing methods to log and debug messages. It has a constructor that initializes an internal logger, and two methods: log() for logging messages and debug() for logging debugging information. The setLogger method allows you to replace the current logger with a new one.

## HistoryPublicService

The `HistoryPublicService` is a TypeScript class that implements the `THistoryConnectionService` interface. It is responsible for handling public operations related to the history. The class has a constructor, properties such as `loggerService`, `historyConnectionService`, and methods like `push`, `toArrayForAgent`, `toArrayForRaw`, and `dispose`.

The `push` method allows you to push a message to the history asynchronously. It takes three parameters: `message` (an object representing the message), `clientId` (a string representing the client ID), and `agentName` (a string representing the agent name).

The `toArrayForAgent` method converts the history to an array specifically for a given agent. It takes three parameters: `prompt` (a string representing the prompt), `clientId` (a string representing the client ID), and `agentName` (a string representing the agent name). It returns an array of `IModelMessage` objects asynchronously.

The `toArrayForRaw` method converts the history to a raw array. It takes two parameters: `clientId` (a string representing the client ID) and `agentName` (a string representing the agent name). It also returns an array of `IModelMessage` objects asynchronously.

The `dispose` method allows you to dispose of the history asynchronously. It takes two parameters: `clientId` (a string representing the client ID) and `agentName` (a string representing the agent name).

## HistoryConnectionService

The `HistoryConnectionService` is a TypeScript class that implements the `IHistory` interface and provides functionality for managing history connections. It has a constructor that initializes the loggerService, contextService, and sessionValidationService.

The class has several methods: `getItems`, `getHistory`, `push`, `toArrayForAgent`, `toArrayForRaw`, and `dispose`. 

The `getItems` method retrieves items for a given client and agent, while the `getHistory` method retrieves the history for a given client and agent. Both methods also support memoization for improved performance.

The `push` method allows you to push a message to the history asynchronously.

The `toArrayForAgent` method converts the history to an array format suitable for agents, while the `toArrayForRaw` method converts the history to a raw array format.

Lastly, the `dispose` method is used to dispose of the history connection service, releasing any resources associated with it.

## EmbeddingValidationService

The EmbeddingValidationService is a tool used within the agent-swarm to validate embeddings. It provides a way to add new embeddings and validate their existence. The service keeps track of embeddings using an internal map called `_embeddingMap`. To add a new embedding, you can use the `addEmbedding` function, which takes the embedding name and its schema as parameters. This function will add the embedding to the validation service.

To validate if an embedding exists, you can use the `validate` function. This function takes the embedding name and its source as parameters. It will check if the specified embedding exists in the validation service.

Overall, this service helps ensure that the embeddings used within the agent-swarm are valid and properly managed.

## EmbeddingSchemaService

The EmbeddingSchemaService is a service used for managing embedding schemas. It has a constructor, loggerService and registry properties. The `register` function is used to register an embedding with a given key and value, while the `get` function retrieves an embedding by its key. This service allows for easy management and retrieval of embedding schemas.

## CompletionValidationService

The CompletionValidationService is a TypeScript service that allows you to validate completion names. It has a constructor that initializes the service, and two properties: loggerService for logging purposes, and _completionSet to store the completion names.

To add a new completion name to the set, you can use the addCompletion function. This function takes a completion name as an argument and adds it to the set.

To validate if a completion name exists in the set, you can use the validate function. This function takes a completion name and its source as arguments, and returns a boolean indicating whether the completion name is valid or not.

## CompletionSchemaService

The `CompletionSchemaService` is a service that manages completion schemas. It has a constructor, `loggerService` and `registry` properties, as well as `register` and `get` methods. The `register` method is used to add a new completion schema by providing a key and the corresponding `ICompletionSchema` object. The `get` method retrieves a completion schema by its key. This service allows for efficient management and retrieval of completion schemas.

## ClientSwarm

The ClientSwarm class is an implementation of the ISwarm interface and manages agents within a swarm. It has a constructor that takes in parameters defined by the ISwarmParams interface. The class also has several properties and methods to interact with the swarm.

The `waitForOutput` method waits for output from the currently active agent in the swarm. The `getAgentName` method retrieves the name of the currently active agent. The `getAgent` method returns the currently active agent.

To set a reference of an agent in the swarm, you can use the `setAgentRef` method by providing the agent's name and a reference to the agent. To set the active agent by name, you can use the `setAgentName` method.

## ClientStorage

The `ClientStorage` class is an implementation of the `IStorage<T>` interface, designed to manage storage operations. It has a constructor that takes in `IStorageParams<T>` as a parameter. The class has several properties and methods for performing various storage operations.

The `params` property holds the parameters used to initialize the storage. The `_itemMap` property is an internal map used to store items. The `_createEmbedding` property is a function that creates an embedding for the given item and returns a promise with an array of embeddings and the item's ID.

The `waitForInit` property is a function that waits for the storage to be initialized. The `take` method takes a search criteria, total number of items to retrieve, and an optional score parameter. It returns a promise with the specified number of items based on the search criteria.

The `upsert` method upserts an item into the storage, meaning it either updates or inserts the item into the storage. The `remove` method removes an item from the storage based on its ID. The `clear` method clears all items from the storage.

The `get` method retrieves an item from the storage based on its ID. The `list` method lists all items in the storage, optionally filtered by a predicate function.

## ClientSession

The ClientSession class is an implementation of the ISession interface. It has a constructor that takes in parameters of type ISessionParams. The class has several properties and methods for handling messages, committing output, and connecting to a connector function. The `emit` method allows you to emit a message, while the `execute` method executes a message and optionally emits the output. The `commitToolOutput`, `commitUserMessage`, and `commitSystemMessage` methods are used to commit different types of output, and the `commitFlush` method commits a flush of the agent history. The `connect` method connects the session to a connector function, and `dispose` should be called when the session is disposed.

## ClientHistory

The `ClientHistory` class in TypeScript represents the history of client messages and implements the `IHistory` interface. It has a constructor that takes in `IHistoryParams` as a parameter. The class also has properties such as `params`, which holds the parameters for the history, and `_filterCondition`, which is a filter condition used for the `toArrayForAgent` method.

The `push` method allows you to add a new message to the history asynchronously. The `toArrayForRaw` method converts the history into an array of raw messages asynchronously. Lastly, the `toArrayForAgent` method converts the history into an array of messages specifically for the agent, taking in a prompt and an optional array of system messages as parameters.

## ClientAgent

The `ClientAgent` class in TypeScript implements the interface `IAgent` and represents a client agent that interacts with the system. It has a constructor that takes in `IAgentParams` as a parameter. The class has several properties and methods for handling agent interactions, such as emitting output results after validation, resurrecting the model based on a given reason, waiting for output to be available, getting completion messages from the model, committing user and system messages to history, committing tool output to the history, and executing incoming messages while processing tool calls if necessary. The `dispose` method should be called when the agent is disposed.

## AgentValidationService

The `AgentValidationService` is a service used for validating agents within an agent swarm. It has a constructor that initializes the service with dependencies such as `loggerService`, `toolValidationService`, `completionValidationService`, and `storageValidationService`. The service also has a private property `_agentMap` for storing agent information.

The `getStorageList` function retrieves the list of storages used by a specific agent. The `addAgent` function adds a new agent to the validation service. The `hasStorage` function checks if an agent has a registered storage. Lastly, the `validate` function validates an agent by its name and source.

## AgentSchemaService

The `AgentSchemaService` is a service that manages agent schemas. It has a constructor, `loggerService` and `registry` properties, as well as two methods: `register` and `get`. The `loggerService` is used for logging, while the `registry` stores registered agent schemas.

The `register` method allows you to add a new agent schema by providing a key and an `IAgentSchema` object. This method does not return anything and simply registers the new schema.

The `get` method retrieves an agent schema by its name. You provide the key (name) of the schema you want to retrieve, and it returns an `IAgentSchema` object.

Overall, the `AgentSchemaService` provides functionality for managing and retrieving agent schemas in a TypeScript application.

## AgentPublicService

The `AgentPublicService` is a TypeScript class that implements the `TAgentConnectionService` interface. It provides methods for managing public agent operations, such as creating an agent reference, executing commands on the agent, waiting for output from the agent, committing tool and system messages to the agent, flushing the agent's history, and disposing of an agent. The class also has properties for the `loggerService` and `agentConnectionService`.

## AgentConnectionService

The `AgentConnectionService` is a TypeScript class that implements the `IAgent` interface and manages agent connections. It has a constructor that takes no arguments and several properties including `loggerService`, `contextService`, `sessionValidationService`, `historyConnectionService`, `storageConnectionService`, `agentSchemaService`, `toolSchemaService`, and `completionSchemaService`.

The class provides several methods: `getAgent` for retrieving an agent instance, `execute` for executing input commands, `waitForOutput` for waiting for output from the agent, `commitToolOutput` for committing tool output, `commitSystemMessage` for committing system messages, `commitUserMessage` for committing user messages without answers, `commitAgentChange` for committing agent changes, `commitFlush` for committing a flush of agent history, and `dispose` for disposing of the agent connection.
