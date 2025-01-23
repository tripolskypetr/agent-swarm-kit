# agent-swarm-kit

## ToolValidationService

The `ToolValidationService` is a class in TypeScript that provides methods for adding tools and validating them. It has a constructor that initializes the `loggerService` and `_toolSet`. The `loggerService` is used for logging messages, while the `_toolSet` is a private property that stores the set of tools.

To add a new tool, you can use the `addTool` method by passing the tool's name as a string parameter. This method will add the tool to the `_toolSet`.

To validate a tool, you can use the `validate` method by passing the tool's name as a string parameter. This method will perform validation on the specified tool, using the tools stored in `_toolSet`.

Overall, the `ToolValidationService` class allows you to manage and validate tools within your TypeScript application.

## ToolSchemaService

The `ToolSchemaService` is a class in TypeScript that provides methods for registering, retrieving, and disposing of agent tools. It has a constructor, properties for `loggerService` and `registry`, as well as methods for registering, getting, and disposing tools.

The `loggerService` and `registry` properties are used to log messages and store registered tools, respectively. The `register` method allows you to register a tool with a specified key, while the `get` method retrieves a tool based on its key. Finally, the `dispose` method is used to clean up any resources associated with the `ToolSchemaService` instance.

## SwarmValidationService

The SwarmValidationService is a TypeScript class that provides methods for managing swarm validation. It has a constructor, properties such as loggerService, agentValidationService and _swarmMap, as well as methods addSwarm, getAgentList and validate. The addSwarm method is used to add a swarm with the given name and schema to the SwarmMap. The getAgentList method returns an array of agent names for the specified swarm. The validate method is used to perform validation on the specified swarm.

## SwarmSchemaService

The SwarmSchemaService is a TypeScript class that provides methods for managing and retrieving Swarm schemas. It has a constructor, properties such as loggerService and registry, and methods like register, get, and dispose. The loggerService property is an instance of the LoggerService class, which handles logging messages. The registry property is a generic data structure used to store the Swarm schemas. The register method allows you to add a Swarm schema with a given key and value. The get method retrieves a Swarm schema by its key. The dispose method is used to clean up any resources associated with the SwarmSchemaService instance.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It provides methods for interacting with swarms and agents within a Swarm platform. The class has several properties, including loggerService for logging messages and swarmConnectionService for connecting to the Swarm platform.

The class also has several methods:
1. `waitForOutput` - A method that waits for output from a specific agent within a swarm and returns the output as a string.
2. `getAgentName` - A method that retrieves the name of a specific agent within a swarm.
3. `getAgent` - A method that retrieves the details of a specific agent within a swarm.
4. `setAgentName` - A method that updates the name of a specific agent within a swarm.
5. `dispose` - A method that disposes of a specific agent within a swarm.

These methods allow developers to interact with agents and swarms within the Swarm platform, enabling them to execute code on the Swarm platform and retrieve results or update agent details as needed.

## SwarmConnectionService

The SwarmConnectionService is an implementation of the ISwarm interface and provides methods to interact with a swarm. It has several properties such as loggerService, contextService, agentConnectionService, and swarmSchemaService. 

The constructor is used to initialize the service. 

The getSwarm method is used to retrieve a ClientSwarm object by providing the clientId and swarmName. It also implements IClearableMemoize and IControlMemoize for caching and control purposes.

The waitForOutput method is an asynchronous function that waits for output from the swarm and returns it as a string.

The getAgentName method is an asynchronous function that retrieves the name of the agent.

The getAgent method is an asynchronous function that retrieves the agent object.

The setAgentName method is an asynchronous function that sets the name of the agent.

The dispose method is used to clean up resources and disposes the service.

## SessionValidationService

The `SessionValidationService` is a class that manages sessions for clients in a swarm. It has a logger service for logging events and an internal map to store sessions. The constructor initializes the session map and logger service.

To add a session, you can use the `addSession` method by providing a client ID and the swarm name. This will add a new entry to the session map.

To retrieve a list of all sessions, you can use the `getSessionList` method, which returns an array of client IDs.

To get the swarm name for a specific client, you can use the `getSwarm` method by providing a client ID. This will return the swarm name associated with that client ID.

To remove a session, you can use the `removeSession` method by providing a client ID. This will remove the entry from the session map.

Overall, `SessionValidationService` provides methods to manage sessions for clients in a swarm, allowing you to add, retrieve, and remove sessions as needed.

## SessionPublicService

The `SessionPublicService` is a class that implements the `TSessionConnectionService` interface. It provides methods for executing commands, connecting to a session, committing tool output and system messages, and disposing of a session.

The class has three properties: `loggerService`, which is an instance of a logger service, `sessionConnectionService`, which is an instance of a session connection service, and `sendMessageFn`, which is a function for sending messages.

The `execute` method takes a content string, client ID, and swarm name as parameters. It returns a promise that resolves with the result of executing the command in the session.

The `connect` method takes a send message function, client ID, and swarm name as parameters. It returns a receive message function that can be used to listen for messages from the session.

The `commitToolOutput` method takes a content string, client ID, and swarm name as parameters. It commits the tool output to the session and returns a promise that resolves when the operation is complete.

The `commitSystemMessage` method takes a message string, client ID, and swarm name as parameters. It commits the system message to the session and returns a promise that resolves when the operation is complete.

The `dispose` method takes a client ID and swarm name as parameters. It disposes of the session and returns a promise that resolves when the operation is complete.

## SessionConnectionService

The `SessionConnectionService` is a class that implements the `ISession` interface. It has a constructor that takes no arguments and initializes the `loggerService`, `contextService`, and `swarmConnectionService` properties.

The class provides several methods and properties:
- `getSession` is a memoized function that takes a `clientId` and `swarmName`, and returns a `ClientSession` object.
- `execute` is an asynchronous function that takes a `content` string and returns a promise that resolves to a `string`.
- `connect` is a function that takes a `connector` function and returns an asynchronous `ReceiveMessageFn` function.
- `commitToolOutput`, `commitSystemMessage` are asynchronous functions that take a `content` string and return promises.
- `dispose` is an asynchronous function that cleans up any resources when the service is no longer needed.

The class also has properties `loggerService`, `contextService`, and `swarmConnectionService` which are used internally for logging, context management and handling connections to the swarm.

## LoggerService

The `LoggerService` is a class that implements the `ILogger` interface. It has a constructor that doesn't take any parameters. This service provides logging functionality through the `log` and `debug` methods, which can be used to log messages of different levels. The `_logger` property is a private variable that holds the logger instance. The `setLogger` method allows you to set a new logger instance.

## HistoryPublicService

The `HistoryPublicService` class is an implementation of the `THistoryConnectionService` interface. It has a constructor that initializes the `loggerService` and `historyConnectionService`. The class provides several methods to interact with the history service.

The `push` method allows you to send a message with the specified `message`, `clientId`, and `agentName` to the history service. It returns a Promise that resolves when the message is successfully sent.

The `toArrayForAgent` method retrieves an array of `IModelMessage` objects for the specified `prompt`, `clientId`, and `agentName`. It returns a Promise that resolves with the array of messages.

The `toArrayForRaw` method retrieves an array of `IModelMessage` objects for the specified `clientId` and `agentName`. It returns a Promise that resolves with the array of messages.

The `dispose` method disposes of the history service connection for the specified `clientId` and `agentName`. It returns a Promise that resolves when the disposal is complete.

## HistoryConnectionService

The `HistoryConnectionService` is a class that implements the `IHistory` interface. It has a constructor that takes no arguments and initializes the `loggerService` and `contextService`. 

The class has several properties and methods. The `getItems` method returns an array of `IModelMessage` objects for a given `clientId`. It also implements the `IClearableMemoize` and `IControlMemoize` interfaces, which allow for clearing and controlling the memoized data.

The `getHistory` method returns a `ClientHistory` object for a given `clientId` and `agentName`. It also implements the `IClearableMemoize` and `IControlMemoize` interfaces.

The `push` method takes an `IModelMessage` object and returns a promise that resolves when the message is successfully pushed.

The `toArrayForAgent` method takes a `prompt` string and returns an array of `IModelMessage` objects for a given agent. It returns the data as a promise.

The `toArrayForRaw` method returns an array of `IModelMessage` objects for all agents. It also returns the data as a promise.

The `dispose` method disposes of the service and cleans up any resources. It returns a promise that resolves when the disposal is complete.

## CompletionValidationService

The `CompletionValidationService` is a TypeScript class that provides methods for managing completion validations. It has a constructor, which is used to initialize the class. The `loggerService` and `_completionSet` are properties of the class, which seem to be used for logging and managing a set of completions, respectively.

The `addCompletion` method is used to add a completion with the specified `completionName`. The `validate` method is used to validate a completion with the specified `completionName`.

Overall, this class appears to be used for managing and validating a set of completions in a TypeScript application.

## CompletionSchemaService

The `CompletionSchemaService` is a class in TypeScript that provides methods for managing completion schema objects. It has a constructor, properties such as `loggerService`, `registry` and methods like `register`, `get` and `dispose`. The `register` method allows you to register a completion schema object with a specified key, while the `get` method retrieves a completion schema object by its key. The `dispose` method is used to clean up any resources associated with the service. The `loggerService` and `registry` properties are used internally for logging and managing the completion schema objects respectively.

## ClientSwarm

The `ClientSwarm` class is an implementation of the `ISwarm` interface. It has a constructor that takes in an object of type `ISwarmParams` as a parameter. This class also has several properties and methods to interact with the swarm.

The `params` property is of type `ISwarmParams`, which contains the parameters for initializing the swarm.

The `_activeAgent` property is a private variable that holds the currently active agent in the swarm.

The `waitForOutput` method is an asynchronous function that returns a promise resolving to the output of the currently active agent.

The `getAgentName` method is an asynchronous function that returns a promise resolving to the name of the currently active agent.

The `getAgent` method is an asynchronous function that returns a promise resolving to the currently active agent.

The `setAgentName` method is an asynchronous function that sets the name of the currently active agent to the provided `agentName` parameter.

Overall, the `ClientSwarm` class provides a way to interact with and control the behavior of a swarm of agents.

## ClientSession

The `ClientSession` class is an implementation of the `ISession` interface. It has a constructor that takes in an object of type `ISessionParams` as a parameter. This class provides several methods for interacting with the session.

The `execute` method takes a string message as input and returns a promise that resolves to a string. This method is used for executing commands or queries within the session.

The `commitToolOutput` method takes a string content as input and returns a promise that resolves without any value. This method is used for committing tool output within the session.

The `commitSystemMessage` method takes a string message as input and returns a promise that resolves without any value. This method is used for committing system messages within the session.

The `connect` method takes a function of type `SendMessageFn` as input and returns a function of type `ReceiveMessageFn`. This method is used for establishing a connection between the client and server within the session.

## ClientHistory

The `ClientHistory` class is an implementation of the `IHistory` interface. It has a constructor that takes in an object of type `IHistoryParams`. This class provides two methods and two properties.

The `push` method takes in an object of type `IModelMessage` and returns a promise that resolves when the message is added to the history.

The `toArrayForRaw` method returns a promise that resolves with an array of `IModelMessage` objects representing the history in its raw form.

The `toArrayForAgent` method takes in a prompt string and returns a promise that resolves with an array of `IModelMessage` objects representing the history in a format suitable for an agent.

The `params` property is of type `IHistoryParams`, which contains configuration options for the history.

## ClientAgent

The `ClientAgent` class implements the `IAgent` interface and serves as a client for interacting with an AI agent. It has a constructor that takes in `IAgentParams` as a parameter. The class also has several properties and methods for handling different aspects of the agent interaction.

The `params` property holds the parameters passed to the constructor. The `_toolCommitSubject` and `_outputSubject` properties are subjects used for emitting events related to tool commit and output, respectively. The `_emitOuput` method is a helper function for emitting output results. The `_resurrectModel` method is a helper function for resurrecting the model in case of failure.

The `waitForOutput` method returns a promise that resolves when the output is available. The `getCompletion` method returns a promise that resolves with the completion message from the agent. The `commitSystemMessage` method commits a system message to the agent. The `commitToolOutput` method commits tool output to the agent. The `execute` method executes an input command and returns a promise.

## AgentValidationService

The `AgentValidationService` is a class in TypeScript that provides methods for managing and validating agents. It has a constructor that initializes the logger service, tool validation service, and completion validation service. The class also has a private property `_agentMap` to store the agents.

To add an agent, you can use the `addAgent` method by providing the agent name and its schema. This method will add the agent to the `_agentMap`.

To validate an agent, you can use the `validate` method by providing the agent name. This will perform validation on the specified agent using the logger service, tool validation service, and completion validation service.

Overall, the `AgentValidationService` class helps in managing and validating agents by utilizing the provided services.

## AgentSchemaService

The `AgentSchemaService` is a class in TypeScript that manages agent schema data. It has a constructor, properties such as `loggerService`, `registry`, and methods like `register`, `get` and `dispose`. The `loggerService` is an instance of the `LoggerService`, which handles logging messages. The `registry` is a storage for agent schema data, and `register` is a method to register an agent schema with a given key. The `get` method retrieves an agent schema by its key, and `dispose` is a method to clean up any resources when the service is no longer needed.

## AgentPublicService

The `AgentPublicService` is a class that implements the `TAgentConnectionService` interface. It has a constructor that takes no arguments and initializes the `loggerService` and `agentConnectionService`. 

The class provides several asynchronous methods: `execute`, `waitForOutput`, `commitToolOutput`, `commitSystemMessage`, and `dispose`. 

The `execute` method takes an input string, a client ID, and an agent name as arguments. It executes the input in the agent's environment and returns a Promise that resolves when the execution is complete.

The `waitForOutput` method takes a client ID and an agent name as arguments. It waits for the output from the agent's environment and returns a Promise that resolves with the output string.

The `commitToolOutput` method takes a content string, a client ID, and an agent name as arguments. It commits the tool output to the agent's environment and returns a Promise that resolves when the commitment is complete.

The `commitSystemMessage` method takes a message string, a client ID, and an agent name as arguments. It commits the system message to the agent's environment and returns a Promise that resolves when the commitment is complete.

The `dispose` method takes a client ID and an agent name as arguments. It disposes of the connection to the agent's environment and returns a Promise that resolves when the disposal is complete.

## AgentConnectionService

The `AgentConnectionService` is a class that implements the `IAgent` interface. It has a constructor that takes no arguments and initializes several properties including `loggerService`, `contextService`, `historyConnectionService`, `agentSchemaService`, `toolSchemaService`, and `completionSchemaService`.

The class provides several methods: `getAgent`, which returns a `ClientAgent` object when given a client ID and agent name; `execute`, which takes an input string and returns a Promise that resolves when the agent has finished executing; `waitForOutput`, which returns a Promise that resolves when the agent has finished producing output; `commitToolOutput`, which takes a content string and commits it as output from the agent; `commitSystemMessage`, which takes a message string and commits it as a system message; `dispose`, which disposes of the agent connection.
