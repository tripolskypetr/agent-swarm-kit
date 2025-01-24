# agent-swarm-kit

## ToolValidationService

The `ToolValidationService` is a class in TypeScript that provides functionality for adding and validating tools. It has a constructor that takes no arguments and initializes the `loggerService` property, which is used for logging messages. It also has a private property `_toolSet` that stores the set of tools.

To add a new tool, you can use the `addTool` method by passing a string parameter representing the name of the tool. This method will add the new tool to the `_toolSet` property.

To validate a tool, you can use the `validate` method by passing a string parameter representing the name of the tool. This method will check if the specified tool exists in the `_toolSet` property and perform any necessary validation.

Overall, the `ToolValidationService` class allows you to manage and validate tools within your TypeScript application.

## ToolSchemaService

The `ToolSchemaService` is a class in TypeScript that provides methods for registering and retrieving agent tools. It has a constructor, which is used to initialize the class. The `loggerService` and `registry` properties are used for logging and storing registered tools, respectively.

The `register` method is used to register a new agent tool with the service. It takes two parameters: a key and an instance of the `IAgentTool` interface. The key is used to identify the tool, and the instance represents the actual implementation of the tool.

The `get` method is used to retrieve an agent tool from the service. It takes a key as its parameter and returns the corresponding `IAgentTool` instance. If the tool is not found, it returns `undefined`.

Overall, the `ToolSchemaService` class provides a way to manage and access registered agent tools in TypeScript.

## SwarmValidationService

The SwarmValidationService is a TypeScript class that provides methods for managing swarm validation. It has a constructor, properties such as loggerService, agentValidationService and _swarmMap, as well as methods addSwarm, getAgentList and validate.

The constructor initializes the SwarmValidationService.

The loggerService property is used for logging messages.

The agentValidationService property is used for validating agents.

The _swarmMap property is used to store swarms.

The addSwarm method is used to add a swarm with the given name and schema to the _swarmMap.

The getAgentList method returns an array of agent names for the specified swarm from _swarmMap.

The validate method validates the specified swarm by calling agentValidationService.validate on each agent in the swarm from _swarmMap.

## SwarmSchemaService

The SwarmSchemaService is a TypeScript class that provides methods for managing and retrieving Swarm Schema objects. It has a constructor, loggerService property for logging messages, registry property to store Swarm Schema objects, and register and get methods for adding and retrieving Swarm Schema objects respectively. The register method takes a key and an ISwarmSchema object as parameters, allowing you to register the Swarm Schema object with a specific key. The get method takes a key as parameter and returns the corresponding ISwarmSchema object from the registry.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It provides methods for interacting with swarms and agents within a Swarm platform. The class has several properties, including loggerService for logging messages and swarmConnectionService for connecting to the Swarm platform.

The class also has several methods:
1. `waitForOutput` - This method waits for output from a specific agent within a swarm and returns the output as a string.
2. `getAgentName` - This method retrieves the name of a specific agent within a swarm.
3. `getAgent` - This method retrieves the details of a specific agent within a swarm.
4. `setAgentName` - This method sets the name of a specific agent within a swarm.
5. `dispose` - This method disposes of the connection to a specific agent within a swarm.

These methods allow developers to interact with agents and swarms within the Swarm platform, enabling them to execute code and retrieve results from the platform.

## SwarmConnectionService

The SwarmConnectionService is an implementation of the ISwarm interface and provides methods to interact with a swarm. It has properties for loggerService, contextService, agentConnectionService, and swarmSchemaService. The getSwarm method returns a ClientSwarm object based on the provided clientId and swarmName. The waitForOutput method returns a Promise that resolves with the output of the swarm. The getAgentName method returns a Promise that resolves with the name of the agent. The getAgent method returns a Promise that resolves with an IAgent object. The setAgentName method sets the name of the agent and returns a Promise. The dispose method cleans up any resources and returns a Promise.

## SessionValidationService

The `SessionValidationService` is a TypeScript class that manages sessions for clients in a swarm. It has a constructor, which initializes the `loggerService` and `_sessionMap`. The `loggerService` is used for logging, while the `_sessionMap` is a map that stores the client IDs and their associated swarm names.

To add a session, you can use the `addSession` method by passing in the client ID and swarm name. This will add the session to the `_sessionMap`.

To retrieve a list of all sessions, you can use the `getSessionList` method, which will return an array of client IDs.

To retrieve the swarm name for a specific client ID, you can use the `getSwarm` method by passing in the client ID. This will return the associated swarm name for that client ID.

To remove a session, you can use the `removeSession` method by passing in the client ID. This will remove the session from the `_sessionMap`.

Overall, the `SessionValidationService` provides methods to manage sessions for clients in a swarm, allowing you to add, retrieve, and remove sessions as needed.

## SessionPublicService

The `SessionPublicService` is a class that implements the `TSessionConnectionService` interface. It has a constructor, several properties and methods for handling session connections.

The `loggerService` and `sessionConnectionService` are properties that provide logging and session connection functionalities, respectively.

The `execute` method takes a content string, client ID and swarm name as parameters. It returns a Promise that resolves with the result of executing the provided content in the session.

The `connect` method takes a connector function, client ID and swarm name as parameters. It returns a receive message function that can be used to handle incoming messages from the session.

The `commitToolOutput` method takes a content string, client ID and swarm name as parameters. It commits the provided content to the session as tool output and returns a Promise that resolves when the operation is complete.

The `commitSystemMessage` method takes a message string, client ID and swarm name as parameters. It commits the provided message to the session as a system message and returns a Promise that resolves when the operation is complete.

The `dispose` method takes a client ID and swarm name as parameters. It disposes of the session connection and returns a Promise that resolves when the operation is complete.

## SessionConnectionService

The `SessionConnectionService` is a class that implements the `ISession` interface. It has a constructor that takes no arguments and initializes the `loggerService`, `contextService`, and `swarmConnectionService` properties.

The class provides several methods:
1. `getSession` - This method takes a clientId and swarmName as arguments, and returns a `ClientSession` object. It also implements the `IClearableMemoize` and `IControlMemoize` interfaces.
2. `execute` - This method takes a content string as an argument and returns a Promise that resolves to a string.
3. `connect` - This method takes a connector function as an argument and returns another function that can be used to receive messages.
4. `commitToolOutput` - This method takes a content string as an argument and returns a Promise that resolves without any value.
5. `commitSystemMessage` - This method takes a message string as an argument and returns a Promise that resolves without any value.
6. `dispose` - This method returns a Promise that resolves without any value.

The `SessionConnectionService` class is used to manage sessions and handle communication between clients in a swarm.

## LoggerService

The `LoggerService` is a class that implements the `ILogger` interface. It has a constructor that doesn't take any parameters. The class has two properties: `_logger` and `log`. The `debug` property is also available, and all three properties are methods that accept a variable number of arguments. The `setLogger` method allows you to set a new logger instance.

The `_logger` property is of type `any`, which means it can hold any logger instance. The `log` and `debug` methods are used for logging messages of different levels, accepting a variable number of arguments. The `setLogger` method allows you to replace the current logger instance with a new one.

## HistoryPublicService

The `HistoryPublicService` is a class that implements the `THistoryConnectionService` interface. It has a constructor that is used to initialize the service. The class also has several properties and methods that are used to interact with the history connection service.

The `loggerService` and `historyConnectionService` are properties that provide access to the logger and history connection services respectively.

The `push` method is used to send a message with the specified `message`, `clientId` and `agentName`. It returns a promise that resolves when the message is successfully sent.

The `toArrayForAgent` method takes a `prompt`, `clientId` and `agentName` as input, and returns a promise that resolves to an array of `IModelMessage` objects that are relevant to the specified `agent`.

The `toArrayForRaw` method takes a `clientId` and `agentName` as input, and returns a promise that resolves to an array of `IModelMessage` objects that are relevant to the specified `client`.

The `dispose` method is used to disconnect from the history connection service for a specified `clientId` and `agentName`. It returns a promise that resolves when the disconnection is complete.

## HistoryConnectionService

The `HistoryConnectionService` is a class that implements the `IHistory` interface. It has a constructor that takes no arguments and initializes the `loggerService` and `contextService`. 

The class provides several methods: `getItems`, `getHistory`, `push`, `toArrayForAgent`, `toArrayForRaw`, and `dispose`. 

The `getItems` method takes a `clientId` as input and returns an array of `IModelMessage` objects. It also implements the `IClearableMemoize` and `IControlMemoize` interfaces.

The `getHistory` method takes a `clientId` and an `agentName` as input, and returns a `ClientHistory`. It also implements the `IClearableMemoize` and `IControlMemoize` interfaces.

The `push` method takes an `IModelMessage` as input and returns a Promise that resolves when the message is successfully pushed.

The `toArrayForAgent` method takes a `prompt` as input and returns an array of `IModelMessage` objects as a Promise.

The `toArrayForRaw` method returns an array of `IModelMessage` objects as a Promise.

The `dispose` method disposes of the service and returns a Promise that resolves when disposal is complete.

## CompletionValidationService

The `CompletionValidationService` is a TypeScript class that provides methods for managing and validating completions. It has a constructor, which is used to initialize the service. The class also has two properties: `loggerService` and `_completionSet`. 

The `loggerService` property is of type `any`, and it seems to be a logger service used for logging events or messages within the class. The `_completionSet` property is also of type `any`, and it appears to be a set of completions that the service manages.

The class also has two methods: `addCompletion` and `validate`. The `addCompletion` method takes a string parameter named `completionName` and adds the specified completion to the service's set of completions. The `validate` method also takes a string parameter named `completionName` and validates the specified completion within the service's set of completions.

Overall, the `CompletionValidationService` provides functionality for managing and validating completions in a TypeScript application.

## CompletionSchemaService

The `CompletionSchemaService` is a class in TypeScript that provides methods for managing completion schema data. It has a constructor, which is used to initialize the service. The class also has two properties: `loggerService` and `registry`. The `register` method allows you to register a completion schema with a specified key, and the `get` method retrieves a completion schema by its key. The `registry` property is used to store the registered completion schemas.

## ClientSwarm

The `ClientSwarm` is a class that implements the `ISwarm` interface. It has a constructor that takes in an object of type `ISwarmParams` as a parameter. This class also has several properties and methods to interact with the swarm.

The `params` property is of type `ISwarmParams`, which holds the parameters for initializing the swarm.

The `_activeAgent` property is used to store the currently active agent in the swarm.

The `waitForOutput` method returns a Promise that resolves to the output of the active agent in the swarm.

The `getAgentName` method returns a Promise that resolves to the name of the active agent in the swarm.

The `getAgent` method returns a Promise that resolves to the active agent in the swarm.

The `setAgentName` method sets the name of the active agent in the swarm and returns a Promise that resolves to `void`.

## ClientSession

The `ClientSession` class is an implementation of the `ISession` interface. It has a constructor that takes in an object of type `ISessionParams` as a parameter. This class provides several methods for interacting with a session.

The `execute` method takes a string message as input and returns a promise that resolves to the response from the session.

The `commitToolOutput` method takes a string content as input and returns a promise that resolves without any value. This method is used to commit tool output messages.

The `commitSystemMessage` method takes a string message as input and returns a promise that resolves without any value. This method is used to commit system messages.

The `connect` method takes a function of type `SendMessageFn` as input and returns a function of type `ReceiveMessageFn`. This method is used to connect the session with a connector, allowing for communication between the session and the connector.

## ClientHistory

The `ClientHistory` class is an implementation of the `IHistory` interface. It has a constructor that takes in an object of type `IHistoryParams`. This class provides two methods and two properties.

The `push` method accepts an object of type `IModelMessage` and returns a Promise that resolves when the message is successfully added to the history.

The `toArrayForRaw` method returns a Promise that resolves with an array of `IModelMessage` objects representing the history in its raw form.

The `toArrayForAgent` method accepts a prompt string and returns a Promise that resolves with an array of `IModelMessage` objects representing the history, filtered for messages relevant to the agent based on the provided prompt.

## ClientAgent

The `ClientAgent` class is an implementation of the `IAgent` interface in TypeScript. It has a constructor that takes an object of type `IAgentParams` as a parameter. The class has several properties including `params`, which is of type `IAgentParams` and holds the parameters for the agent, `_toolCommitSubject`, which is a subject of type `Subject<void>` used for committing tool output, `_outputSubject` of type `Subject<string>`, used for emitting output, `_emitOuput` of type `(result: string) => Promise<void>`, used for emitting output as a promise, `_resurrectModel` of type `(reason?: string) => Promise<string>`, used for resurrecting the model, `waitForOutput` of type `() => Promise<string>`, used for waiting and getting the output, `getCompletion` of type `() => Promise<IModelMessage>`, used for getting the completion, `commitSystemMessage` of type `(message: string) => Promise<void>`, used for committing a system message, `commitToolOutput` of type `(content: string) => Promise<void>`, used for committing tool output, and `execute` of type `(input: string) => Promise<void>`, used for executing the agent with a given input.

## AgentValidationService

The `AgentValidationService` is a TypeScript class that serves as an agent validation service. It has a constructor that initializes the logger service, tool validation service, and completion validation service. The class also has a private property `_agentMap` to store the agents.

To add an agent, you can use the `addAgent` method by providing the agent name and its schema. This method will add the agent to the `_agentMap`.

To validate an agent, you can use the `validate` method by providing the agent name. This will validate the specified agent using the logger service, tool validation service, and completion validation service.

Overall, the `AgentValidationService` provides functionality to add and validate agents in a TypeScript application.

## AgentSchemaService

The `AgentSchemaService` is a TypeScript class that serves as an agent schema registry. It has a constructor, which is used to initialize the class. The `loggerService` property is an instance of the `LoggerService`, which handles logging operations. The `registry` property is a generic object that stores the registered agent schemas. The `register` method is used to register an agent schema with a given key, and the `get` method retrieves an agent schema by its key.

## AgentPublicService

The `AgentPublicService` is a class that implements the `TAgentConnectionService` interface. It has a constructor that takes no arguments and initializes the `loggerService` and `agentConnectionService`.

The class provides several asynchronous methods:
1. `execute` - Executes a command on the agent's machine and returns a promise that resolves when the execution is complete.
2. `waitForOutput` - Waits for output from the agent's machine and returns a promise that resolves with the output when it is available.
3. `commitToolOutput` - Commits the output from a tool on the agent's machine and returns a promise that resolves when the commit is complete.
4. `commitSystemMessage` - Commits a system message to the agent's machine and returns a promise that resolves when the commit is complete.
5. `dispose` - Disposes of the connection to the agent's machine and returns a promise that resolves when the disposal is complete.

These methods use the `loggerService` for logging and the `agentConnectionService` to interact with the agent's machine.

## AgentConnectionService

The `AgentConnectionService` is a TypeScript class that implements the `IAgent` interface. It is responsible for managing agent connections and executing commands. The class has a constructor that initializes several properties, including `loggerService`, `contextService`, `historyConnectionService`, `agentSchemaService`, `toolSchemaService`, and `completionSchemaService`.

The class provides several methods: `getAgent`, which returns a client agent based on the provided `clientId` and `agentName`, `execute`, which executes a command asynchronously, `waitForOutput`, which waits for the agent's output and returns it as a promise, `commitToolOutput`, which commits the tool's output asynchronously, `commitSystemMessage`, which commits a system message asynchronously, and `dispose`, which disposes of the agent connection.

Overall, this class is used to manage agent connections and execute commands within the system.
