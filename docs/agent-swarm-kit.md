# agent-swarm-kit

## ToolValidationService

The `ToolValidationService` is a class in TypeScript that provides methods for adding tools and validating them. It has a constructor, a `loggerService` property for logging messages, and a private `_toolMap` property for storing tools.

To add a tool, you can use the `addTool` method by passing in a tool name and its schema. This will add the tool to the `_toolMap` for future validation.

To validate a tool, you can use the `validate` method by passing in a tool name and the source code of that tool. This will validate the provided source code against the tool's schema stored in `_toolMap`.

Overall, the `ToolValidationService` is a utility class for managing and validating tools in TypeScript.

## ToolSchemaService

The `ToolSchemaService` is a class in TypeScript that provides methods for registering and retrieving agent tools. It has a constructor that initializes the `loggerService` and `registry`. The `register` method allows you to register a tool by providing a key and an instance of the `IAgentTool` interface. The `get` method allows you to retrieve a tool by its key. Both methods use the `loggerService` for logging purposes and the `registry` to store and access registered tools.

## SwarmValidationService

The SwarmValidationService is a TypeScript class that provides methods for managing swarm validation. It has a constructor, properties such as loggerService, agentValidationService and _swarmMap, as well as methods addSwarm, getAgentList and validate.

The constructor initializes the SwarmValidationService.

The loggerService property is used for logging messages.

The agentValidationService property is used for validating agents.

The _swarmMap property is used to store swarms.

The addSwarm method is used to add a swarm with the given name and schema to the _swarmMap.

The getAgentList method returns an array of agent names for the specified swarm name from _swarmMap.

The validate method is used to validate the specified swarm name and source.

## SwarmSchemaService

The SwarmSchemaService is a class in TypeScript that provides methods for managing and retrieving Swarm Schema objects. It has a constructor, which is used to initialize the class. The SwarmSchemaService also has two properties: loggerService and registry. The loggerService is an instance of the LoggerService class, which handles logging messages. The registry is a generic object that stores the Swarm Schema objects.

The class provides two methods: register and get. The register method is used to add a new Swarm Schema object to the registry by specifying a key and value. The get method is used to retrieve a Swarm Schema object from the registry by providing its key.

Overall, the SwarmSchemaService class allows for efficient management and retrieval of Swarm Schema objects in a TypeScript application.

## SwarmPublicService

The SwarmPublicService is a TypeScript class that implements the TSwarmConnectionService interface. It provides methods for interacting with swarms in a distributed computing environment. The class has several properties, including loggerService for logging events and swarmConnectionService for connecting to the swarms.

The class also has several methods:
1. `waitForOutput` - Waits for output from a specific agent in the swarm and returns it as a Promise.
2. `getAgentName` - Retrieves the name of a specific agent in the swarm as a Promise.
3. `getAgent` - Retrieves the details of a specific agent in the swarm as a Promise.
4. `setAgentName` - Sets the name of a specific agent in the swarm as a Promise.
5. `dispose` - Disposes of the connection to a specific client and swarm as a Promise.

These methods allow for interaction with swarms, retrieving information about agents within the swarm and managing agent names.

## SwarmConnectionService

The `SwarmConnectionService` is a class that implements the `ISwarm` interface. It has a constructor that initializes properties such as `loggerService`, `contextService`, `agentConnectionService`, and `swarmSchemaService`. 

The class provides several methods: `getSwarm`, which returns a ClientSwarm object; `waitForOutput`, which returns a Promise that resolves to the output of the swarm; `getAgentName`, which returns a Promise that resolves to the name of the agent; `getAgent`, which returns a Promise that resolves to the agent object; `setAgentName`, which sets the name of the agent and returns a Promise that resolves when done; `dispose`, which disposes of the service and its resources.

## SessionValidationService

The `SessionValidationService` is a TypeScript class that manages session validation and related operations. It has a constructor, several properties and methods for session management. The `loggerService` property is used for logging events, while the other properties (_historySwarmMap, _sessionSwarmMap, and _agentSwarmMap) are maps that store session, history and agent usage information respectively.

The `addSession` method is used to add a new session with the specified `clientId` and `swarmName`. The `addAgentUsage` and `addHistoryUsage` methods are used to add agent and history usage information for a session respectively. The `removeAgentUsage` and `removeHistoryUsage` methods are used to remove agent and history usage information for a session.

The `getSessionList` method returns an array of session IDs. The `getSessionAgentList` method returns an array of agent names for the specified `clientId`. The `getSessionHistoryList` method returns an array of history names for the specified `clientId`. The `getSwarm` method returns the swarm name for a session with the specified `clientId`.

The `validate` method is used to validate a session with the specified `clientId` and source. The `removeSession` method is used to remove a session with the specified `clientId`.

## SessionPublicService

The `SessionPublicService` is a class that implements the `TSessionConnectionService` interface. It has a constructor, several properties and methods for handling session connections.

The `loggerService` and `sessionConnectionService` are properties that provide logging and session connection functionalities, respectively.

The `execute` method takes a content string, client ID and swarm name as parameters and returns a promise that resolves with the result of executing the given content.

The `connect` method takes a connector function, client ID and swarm name as parameters. It returns a receive message function that can be used to handle incoming messages from the session.

The `commitToolOutput` method takes a content string, client ID and swarm name as parameters. It commits the tool output to the session and returns a promise that resolves when the operation is complete.

The `commitSystemMessage` method takes a message string, client ID and swarm name as parameters. It commits the system message to the session and returns a promise that resolves when the operation is complete.

The `dispose` method takes a client ID and swarm name as parameters. It disposes of the session connection and returns a promise that resolves when the operation is complete.

## SessionConnectionService

The `SessionConnectionService` is an implementation of the `ISession` interface. It has a constructor that takes no arguments and initializes the `loggerService`, `contextService`, and `swarmConnectionService` properties.

The `getSession`, `execute`, `connect`, `commitToolOutput`, `commitSystemMessage`, and `dispose` are methods of the `SessionConnectionService`.
- The `getSession` method takes a `clientId` and `swarmName` as arguments, and returns a `ClientSession`. It also implements the `IClearableMemoize` and `IControlMemoize` interfaces.
- The `execute` method takes a `content` string as an argument and returns a Promise that resolves to a string.
- The `connect` method takes a `connector` function as an argument and returns a `ReceiveMessageFn` function.
- The `commitToolOutput` method takes a `content` string as an argument and returns a Promise that resolves without any value.
- The `commitSystemMessage` method takes a `message` string as an argument and returns a Promise that resolves without any value.
- The `dispose` method returns a Promise that resolves without any value.

The `SessionConnectionService` also has three properties:
- `loggerService` of type any.
- `contextService` of type any.
- `swarmConnectionService` of type any.

## LoggerService

The `LoggerService` is a class that implements the `ILogger` interface. It has a constructor that doesn't take any parameters. The class has two private properties: `_logger` and an instance of the `ILogger` interface. It also has three methods: `log`, `debug`, and `setLogger`.

The `log` method is used to log messages at the info level. It accepts any number of arguments and logs them with the info level.

The `debug` method is used to log messages at the debug level. It accepts any number of arguments and logs them with the debug level.

The `setLogger` method is used to set the logger instance for this service. It accepts an `ILogger` instance as a parameter and assigns it to the private `_logger` property.

Overall, the `LoggerService` class provides logging functionality with different log levels and allows for customization of the logger instance.

## HistoryPublicService

The `HistoryPublicService` is a class that implements the `THistoryConnectionService` interface. It has a constructor that is used to initialize the service. The class also has several properties and methods that are used to interact with the history service.

The `loggerService` and `historyConnectionService` are properties that provide access to logging and history connection services respectively.

The `push` method is used to send a message to the history service. It takes in an `IModelMessage` object, a `clientId`, and an `agentName` as parameters, and returns a Promise that resolves when the message is successfully sent.

The `toArrayForAgent` method is used to convert a prompt into an array of `IModelMessage` objects for a specific agent. It takes in a `prompt`, `clientId`, and an `agentName` as parameters, and returns a Promise that resolves with an array of `IModelMessage` objects.

The `toArrayForRaw` method is used to convert a prompt into an array of `IModelMessage` objects for raw output. It takes in a `clientId` and an `agentName` as parameters, and returns a Promise that resolves with an array of `IModelMessage` objects.

The `dispose` method is used to disconnect from the history service. It takes in a `clientId` and an `agentName` as parameters, and returns a Promise that resolves when the disconnection is complete.
