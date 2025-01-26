# agent-swarm-kit

## ToolValidationService

The `ToolValidationService` is a service designed for validating tools within an agent-swarm system. It provides a way to add new tools and validate their existence. The service utilizes a loggerService for logging purposes and maintains an internal map of tools, represented by `_toolMap`.

To add a new tool, you can use the `addTool` function. This function takes two parameters: `toolName`, which is the name of the tool, and `toolSchema`, which is an object representing the schema of the tool.

To validate if a specific tool exists in the validation service, you can use the `validate` function. This function takes two parameters: `toolName`, which is the name of the tool to be validated, and `source`, which represents the source of the tool.

By using these functions, you can effectively manage and validate tools within your agent-swarm system.

## ToolSchemaService

The `ToolSchemaService` is a service that manages tool schemas. It has a constructor, `loggerService` and `registry` properties, as well as two methods: `register` and `get`. The `loggerService` property is used for logging, while the `registry` property is used to store registered tools. The `register` method is used to register a tool with the given key and value, while the `get` method is used to retrieve a tool by its key.

## SwarmValidationService

The SwarmValidationService is a service used for validating swarms and their agents. It has a constructor, properties such as loggerService and agentValidationService for logging and validating agents respectively, and a swarmMap for storing swarms. The service provides two main functions: addSwarm to add a new swarm to the map, and validate to validate a swarm and its agents. The getAgentList function retrieves the list of agents for a given swarm.

## SwarmSchemaService

The SwarmSchemaService is a service used for managing swarm schemas. It has a constructor, loggerService property, registry property and two methods: register() and get(). The loggerService property is used for logging messages, while the registry property stores registered swarm schemas. The register() method is used to add a new swarm schema, and the get() method is used to retrieve a swarm schema by its name.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It is designed to manage public interactions with swarms. The class has a constructor, several properties and methods for interacting with swarms, such as waiting for output, getting agent names and agents from swarms, setting agent references and names in swarms, and disposing of swarms. The class utilizes the loggerService and swarmConnectionService properties for logging and managing connections to swarms respectively.

## SwarmConnectionService

The SwarmConnectionService is a TypeScript class that manages connections to swarms. It implements the ISwarm interface and provides various methods for interacting with swarms. The constructor initializes the loggerService, contextService, agentConnectionService, swarmSchemaService. The getSwarm method retrieves a swarm instance based on the client ID and swarm name. The waitForOutput method waits for output from the swarm. The getAgentName method retrieves the agent name from the swarm. The getAgent method retrieves the agent from the swarm. The setAgentRef method sets the agent reference in the swarm. The setAgentName method sets the agent name in the swarm. The dispose method disposes of the swarm connection.

## SessionValidationService

The `SessionValidationService` is a Typescript class that provides methods for validating and managing sessions. It uses several maps to store session information, including `_historySwarmMap`, `_sessionSwarmMap`, `_agentSwarmMap`, and `_sessionModeMap`. 

To add a new session, you can use the `addSession` method by providing the client ID, swarm name, and session mode. The `addAgentUsage` method allows you to add an agent usage to a session, while `removeAgentUsage` and `removeHistoryUsage` remove agent usages or history usages from a session, respectively.

To check the mode of a session, you can use the `getSessionMode` method by providing the client ID. The `hasSession` method ensures that a session exists for the given client ID.

The `getSessionList` method returns a list of all session IDs, while `getSessionAgentList` and `getSessionHistoryList` return the list of agents for a session and the history list of agents, respectively.

To get the swarm name for a session, you can use the `getSwarm` method by providing the client ID. Finally, `validate` method checks if a session exists for the given client ID and source, while `removeSession` removes a session by providing the client ID.

## SessionPublicService

The `SessionPublicService` is a TypeScript class that implements the `TSessionConnectionService` interface. It is responsible for managing public session interactions, which include emitting messages, executing commands, connecting to the session, committing tool output and system messages, committing user messages without an answer, and disposing of the session.

The class has a constructor, which is used to initialize any necessary properties or dependencies. It also has several methods:
- `emit` allows you to send a message to the session.
- `execute` enables you to execute a command within the session.
- `connect` establishes a connection to the session by providing a connector function, client ID, and swarm name.
- `commitToolOutput` commits tool output to the session.
- `commitSystemMessage` allows you to commit a system message to the session.
- `commitUserMessage` enables you to commit a user message without an answer.
- `dispose` is used to disconnect from the session and clean up any resources.

These methods provide a way to interact with the session, allowing users to send messages, execute commands, and manage session output.

## SessionConnectionService

The `SessionConnectionService` is a TypeScript class that implements the `ISession` interface and manages session connections. It has a constructor, several properties and methods for session management.

The `loggerService`, `contextService` and `swarmConnectionService` are properties that provide logging, context and swarm connection functionalities respectively.

The `getSession` method retrieves a memoized session based on the `clientId` and `swarmName`.

The `emit` method emits a message to the session asynchronously.

The `execute` method executes a command in the session and returns its result asynchronously.

The `connect` method connects to the session using a provided connector.

The `commitToolOutput` method commits tool output to the session asynchronously.

The `commitSystemMessage` method commits a system message to the session asynchronously.

The `commitUserMessage` method commits a user message to the agent without an answer asynchronously.

The `dispose` method disposes of the session connection service asynchronously.

## LoggerService

The LoggerService is a class that implements the ILogger interface, providing methods to log and debug messages. It has a constructor that initializes the logger property. The _logger is a private property that holds the current logger. The log method logs messages using the current logger, while the debug method logs debug messages using the current logger. The setLogger method allows you to set a new logger for the LoggerService.

## HistoryPublicService

The `HistoryPublicService` is a TypeScript class that implements the `THistoryConnectionService` interface. This service is responsible for handling public operations related to history management. It has a constructor, properties such as `loggerService`, `historyConnectionService`, and methods like `push`, `toArrayForAgent`, `toArrayForRaw`, and `dispose`.

The `push` method allows you to push a message to the history asynchronously. It takes three parameters: `message` (an object representing the message), `clientId` (a string representing the client ID), and `agentName` (a string representing the agent name).

The `toArrayForAgent` method converts the history to an array specifically for a given agent. It takes three parameters: `prompt` (a string representing the prompt), `clientId` (a string representing the client ID), and `agentName` (a string representing the agent name). It returns an array of `IModelMessage` objects asynchronously.

The `toArrayForRaw` method converts the history to a raw array. It takes two parameters: `clientId` (a string representing the client ID) and `agentName` (a string representing the agent name). It also returns an array of `IModelMessage` objects asynchronously.

The `dispose` method allows you to dispose of the history asynchronously. It takes two parameters: `clientId` (a string representing the client ID) and `agentName` (a string representing the agent name).

## HistoryConnectionService

The `HistoryConnectionService` is a TypeScript class that implements the `IHistory` interface and provides functionality for managing history connections. It has a constructor that initializes the loggerService, contextService, and sessionValidationService. The class also includes several methods for retrieving and manipulating history data.

The `getItems` method retrieves items for a given client and agent, while the `getHistory` method retrieves the history for a given client and agent. Both methods also support memoization for improved performance.

The `push` method allows you to push a message to the history asynchronously. The `toArrayForAgent` method converts the history to an array format suitable for agents, and the `toArrayForRaw` method converts the history to a raw array format.

To clean up resources, you can use the `dispose` method to dispose of the history connection service.

## CompletionValidationService

The CompletionValidationService is a TypeScript service designed for validating completion names. It has a constructor that initializes the service, and two properties: loggerService for logging purposes and _completionSet to store the completion names. 

To add a new completion name to the set, you can use the addCompletion function. This function takes a string parameter representing the completion name and does not return any value.

To validate if a completion name exists in the set, you can use the validate function. This function takes two parameters: completionName, a string representing the name to be validated, and source, a string representing the origin of the completion name. If the specified completion name exists in the set, no action is taken. If it does not exist, an error will be logged using the loggerService.

Overall, this service allows you to manage and validate completion names efficiently.

## CompletionSchemaService

The `CompletionSchemaService` is a service used for managing completion schemas. It has a constructor, `loggerService` and `registry` properties, as well as `register` and `get` methods. The `register` method is used to add a new completion schema by providing a key and the associated `ICompletionSchema` object. The `get` method retrieves a completion schema by its key. This service allows for efficient management and retrieval of completion schemas.

## ClientSwarm

The ClientSwarm class is an implementation of the ISwarm interface and manages agents within a swarm. It has a constructor that takes in parameters defined by the ISwarmParams interface. The class also has several properties and methods to interact with the swarm.

The `waitForOutput` method waits for output from the currently active agent in the swarm. The `getAgentName` method retrieves the name of the currently active agent. The `getAgent` method retrieves the currently active agent.

To set a reference of an agent in the swarm, you can use the `setAgentRef` method by providing the agent's name and a reference to the agent. To set the active agent by name, you can use the `setAgentName` method.

## ClientSession

The ClientSession class is an implementation of the ISession interface. It has a constructor that takes in parameters of type ISessionParams. The class also has several properties and methods for handling messages, committing output, and connecting to a connector function.

The `emit` method allows you to emit a message, while the `execute` method executes a message and optionally emits the output. The `commitToolOutput` method is used to commit tool output, `commitUserMessage` commits a user message without an answer, and `commitSystemMessage` commits a system message.

The `connect` method is used to connect the session to a connector function, allowing for communication between the session and external systems.

## ClientHistory

The `ClientHistory` class is an implementation of the `IHistory` interface, which represents a history of client messages. It has a constructor that takes in parameters defined by the `IHistoryParams` interface. The class provides two methods: `push` and `toArrayForAgent`. 

The `push` method allows you to add a new message to the history asynchronously. It takes an `IModelMessage` object as a parameter and returns a `Promise<void>`.

The `toArrayForRaw` method converts the history into an array of raw messages asynchronously. It returns a `Promise<IModelMessage[]>`.

The `toArrayForAgent` method converts the history into an array of messages specifically for the agent, taking a `prompt` string as an additional parameter. Like the previous methods, it returns a `Promise<IModelMessage[]>`.

## ClientAgent

The `ClientAgent` class in TypeScript represents a client agent that interacts with the system. It implements the `IAgent` interface and has a constructor that takes in `IAgentParams` as a parameter. The class has several properties and methods for interacting with the system, such as emitting output results after validation, resurrecting the model based on a given reason, waiting for output to be available, getting the completion message from the model, committing user and system messages to the history without answer, committing tool output to the history, and executing incoming messages. The `execute` method processes tool calls if any.

## AgentValidationService

The `AgentValidationService` is a service used for validating agents within an agent swarm. It has a constructor that initializes the service with dependencies such as `loggerService`, `toolValidationService`, and `completionValidationService`. The service also has a private property `_agentMap` which is used to store the agents.

To add a new agent to the validation service, you can use the `addAgent` method by providing the agent's name and its schema. This method adds the agent to the service's internal map.

To validate an agent, you can use the `validate` method by providing the agent's name and its source code. This method will perform the validation for the specified agent using the provided source code.

## AgentSchemaService

The `AgentSchemaService` is a service used for managing agent schemas. It has a constructor, `loggerService` and `registry` properties, as well as two methods: `register` and `get`. The `loggerService` is used for logging, while the `registry` stores registered agent schemas.

The `register` method is used to add a new agent schema by providing a key and an `IAgentSchema` object. The `get` method retrieves an agent schema by its name, returning the corresponding `IAgentSchema` object.

## AgentPublicService

The `AgentPublicService` is a TypeScript class that implements the `TAgentConnectionService` interface. It is responsible for managing public agent operations, which include creating an agent reference, executing commands on the agent, waiting for output from the agent, committing tool and system messages to the agent, committing user messages without an answer, and disposing of the agent.

The `constructor` is used to initialize the service and inject dependencies such as `loggerService` for logging and `agentConnectionService` for managing agent connections.

The `createAgentRef` method creates a reference to an agent by providing the `clientId` and `agentName`.

The `execute` method allows you to execute a command on the agent by providing an `input`, `clientId`, and `agentName`.

The `waitForOutput` method waits for the agent's output by providing a `clientId` and `agentName`.

The `commitToolOutput` method commits tool output to the agent by providing `content`, `clientId`, and `agentName`.

The `commitSystemMessage` method commits a system message to the agent by providing `message`, `clientId`, and `agentName`.

The `commitUserMessage` method commits a user message to the agent without an answer by providing `message`, `clientId`, and `agentName`.

The `dispose` method disposes of the agent by providing `clientId` and `agentName`.

## AgentConnectionService

The `AgentConnectionService` is a TypeScript class that implements the `IAgent` interface and manages agent connections. It has a constructor that initializes several properties including `loggerService`, `contextService`, `sessionValidationService`, `historyConnectionService`, `agentSchemaService`, `toolSchemaService`, and `completionSchemaService`. 

The class provides several methods: `getAgent` for retrieving an agent instance, `execute` for executing input commands, `waitForOutput` for waiting for the output from the agent, `commitToolOutput` for committing tool output, `commitSystemMessage` for committing a system message, `commitUserMessage` for committing a user message without answer, and `dispose` for disposing of the agent connection.

Overall, this class is responsible for managing agent connections and providing methods to execute commands, commit output, and dispose of the connection.
