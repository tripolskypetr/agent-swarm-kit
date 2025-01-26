# agent-swarm-kit

## ToolValidationService

The `ToolValidationService` is a class that provides methods for adding tools and validating them. It has a constructor that takes no arguments, and two properties: `loggerService` which is used for logging, and `_toolMap` which is a map that stores the tools.

To add a new tool, you can use the `addTool` method. This method takes two parameters: `toolName` which is the name of the tool, and `toolSchema` which is an object that defines the schema for the tool.

To validate a tool, you can use the `validate` method. This method takes two parameters: `toolName` which is the name of the tool, and `source` which is a string that contains the source code of the tool.

Overall, this class provides a way to manage and validate tools in your application.

## ToolSchemaService

The `ToolSchemaService` is a class in TypeScript that provides methods for registering and retrieving agent tools. It has a constructor that initializes the `loggerService` and `registry`. The `register` method allows you to register a tool by providing a key and an instance of the `IAgentTool` interface. The `get` method allows you to retrieve a tool by providing its key. Both methods use the `loggerService` for logging purposes and the `registry` to store and access registered tools.

## SwarmValidationService

The SwarmValidationService is a TypeScript class that provides methods for managing swarm validation. It has a constructor, properties such as loggerService and agentValidationService for logging and handling agent validation, a private property _swarmMap for storing swarms, and methods addSwarm for adding a new swarm, getAgentList for retrieving a list of agents in a swarm, and validate for validating a given source code in a swarm.

## SwarmSchemaService

The SwarmSchemaService is a TypeScript class that provides methods for managing and retrieving Swarm Schema objects. It has a constructor, which is used to initialize the class. The SwarmSchemaService also has two properties: `loggerService` and `registry`. 

The `loggerService` property is an instance of the LoggerService class, which is used for logging messages. The `registry` property is a generic data structure that stores the Swarm Schema objects.

The `register` method is used to add a new Swarm Schema object to the registry. It takes two parameters: `key`, which is a string that uniquely identifies the Swarm Schema, and `value`, which is the Swarm Schema object itself.

The `get` method is used to retrieve a Swarm Schema object from the registry. It takes one parameter: `key`, which is the string that uniquely identifies the Swarm Schema object to be retrieved.

## SwarmPublicService

The SwarmPublicService is a class that implements the TSwarmConnectionService interface. It has a constructor, several properties and methods for interacting with swarms. The loggerService and swarmConnectionService properties are instances of other classes used for logging and managing swarm connections. The waitForOutput, getAgentName, getAgent, setAgentRef, setAgentName and dispose methods are asynchronous functions that allow the user to wait for output, get agent names and agents, set agent references and names, and dispose of a swarm connection.

## SwarmConnectionService

The SwarmConnectionService is an implementation of the ISwarm interface. It has a constructor that initializes the loggerService, contextService, agentConnectionService, swarmSchemaService properties. The service provides several methods to interact with the swarm.

The getSwarm method takes a clientId and swarmName as parameters, and returns a ClientSwarm object. It also implements IClearableMemoize and IControlMemoize interfaces.

The waitForOutput method returns a Promise that resolves to the output of the swarm.

The getAgentName method returns a Promise that resolves to the name of the current agent.

The getAgent method returns a Promise that resolves to the current agent.

The setAgentRef method takes an agentName and IAgent object as parameters, and sets the agent reference. It returns a Promise that resolves when the operation is complete.

The setAgentName method takes an agentName as a parameter, and sets the name of the current agent. It returns a Promise that resolves when the operation is complete.

The dispose method cleans up any resources used by the service. It returns a Promise that resolves when the operation is complete.

## SessionValidationService

The `SessionValidationService` is a TypeScript class that provides methods to manage sessions, agents, and history usage. It uses several maps to store session, agent usage, and history usage information. The class has a `loggerService` property for logging events.

To add a new session, you can use the `addSession` method by providing a client ID and swarm name. The `addAgentUsage` and `addHistoryUsage` methods allow you to add agent and history usage information for a specific session. You can remove agent or history usage information using the `removeAgentUsage` and `removeHistoryUsage` methods.

To retrieve session information, you can use the `getSessionList` method to get a list of all sessions, `getSessionAgentList` to get a list of agents for a specific session, `getSessionHistoryList` to get a list of history entries for a specific session, and `getSwarm` to get the swarm name for a specific session.

The `validate` method can be used to validate a client ID and source, while the `removeSession` method allows you to remove a session from the service.

Overall, this class provides a way to manage sessions and their associated agents and history usage, as well as validate client IDs and sources.

## SessionPublicService

The `SessionPublicService` is a class that implements the `TSessionConnectionService` interface. It has a constructor, several properties and methods for handling session connections.

The `loggerService` and `sessionConnectionService` are properties that provide logging and session connection functionalities, respectively.

The `execute` method takes a content string, client ID and swarm name as parameters and returns a promise that resolves with the result of executing the given content.

The `connect` method takes a connector function, client ID and swarm name as parameters. It returns a receive message function that can be used to handle incoming messages from the session.

The `commitToolOutput` method takes a content string, client ID and swarm name as parameters. It commits the given content to the session and returns a promise that resolves when the commit is complete.

The `commitSystemMessage` method takes a message string, client ID and swarm name as parameters. It commits the given system message to the session and returns a promise that resolves when the commit is complete.

The `dispose` method takes a client ID and swarm name as parameters. It disposes the session connection and returns a promise that resolves when the disposal is complete.

## SessionConnectionService

The `SessionConnectionService` is a class that implements the `ISession` interface. It has a constructor that takes no arguments and initializes the `loggerService`, `contextService`, and `swarmConnectionService` properties.

The class provides several methods:
1. `getSession` is a memoized function that takes a `clientId` and `swarmName`, and returns a `ClientSession` object.
2. `execute` is an asynchronous function that takes a `content` string and returns a promise that resolves to a `string`.
3. `connect` is a function that takes a `connector` function and returns another function, which is a `ReceiveMessageFn`.
4. `commitToolOutput` is an asynchronous function that takes a `content` string and returns a promise that resolves without any value.
5. `commitSystemMessage` is an asynchronous function that takes a `message` string and returns a promise that resolves without any value.
6. `dispose` is an asynchronous function that returns a promise that resolves without any value.

The class also has three properties: `loggerService`, `contextService`, and `swarmConnectionService`. These properties are of type `any` and hold instances of the respective services.

## LoggerService

The `LoggerService` is a class that implements the `ILogger` interface. It has a constructor that does not take any parameters. The class has two private properties: `_logger` of type any and two public methods: `log` and `debug`. The `_logger` property is used to store the logger instance. The `log` and `debug` methods are used to log messages of different levels. The `setLogger` method is used to set the logger instance.

In summary, `LoggerService` is a class that provides logging functionality by implementing the `ILogger` interface and has methods to log messages at different levels. It also allows the logger instance to be set using the `setLogger` method.

## HistoryPublicService

The `HistoryPublicService` is a class that implements the `THistoryConnectionService` interface. It has a constructor that is used to initialize the service. The class has several properties, including `loggerService` and `historyConnectionService`, which are used for logging and handling history connections respectively.

The class also has several methods: `push`, `toArrayForAgent`, `toArrayForRaw`, and `dispose`. The `push` method is used to send a message with the specified `message`, `clientId`, and `agentName` to the history connection service. The `toArrayForAgent` method is used to convert a `prompt`, `clientId`, and `agentName` into an array of `IModelMessage`. The `toArrayForRaw` method is used to convert a `clientId` and `agentName` into an array of `IModelMessage`. Finally, the `dispose` method is used to disconnect from the history connection service for a specified `clientId` and `agentName`.

## HistoryConnectionService

The `HistoryConnectionService` is a class that implements the `IHistory` interface. It has a constructor that takes no arguments and initializes the `loggerService`, `contextService`, and `sessionValidationService` properties.

The class provides several methods and properties:
- `getItems` is a memoized function that takes `clientId` and `agentName` as parameters, returns an array of `IModelMessage` objects for the specified client and agent. It also implements `IClearableMemoize` and `IControlMemoize` interfaces.
- `getHistory` is a memoized function that takes `clientId` and `agentName` as parameters, returns a `ClientHistory` object for the specified client and agent. It also implements `IClearableMemoize` and `IControlMemoize` interfaces.
- `push` is a method that takes an `IModelMessage` object as a parameter and returns a Promise that resolves when the message is successfully pushed.
- `toArrayForAgent` is a method that takes a `prompt` string as a parameter and returns an array of `IModelMessage` objects for the specified agent. It returns a Promise.
- `toArrayForRaw` is a method that returns an array of `IModelMessage` objects for all agents. It returns a Promise.
- `dispose` is a method that disposes of any resources used by the service. It returns a Promise that resolves when the disposal is complete.

Overall, the `HistoryConnectionService` class provides methods to interact with the history of messages for clients and agents, as well as a way to push new messages. It utilizes memoization and asynchronous operations for efficiency.

## CompletionValidationService

The `CompletionValidationService` is a TypeScript class that provides methods for managing completion validations. It has a constructor that initializes the logger service and completion set. The `loggerService` property is used for logging messages, while the `_completionSet` property stores a set of completion names.

The `addCompletion` method allows you to add a completion name to the service. This can be useful when you want to include a new completion in the validation process.

The `validate` method is used to validate a completion name against the provided source code. It takes two parameters: `completionName`, which is the name of the completion to validate, and `source`, which is the source code where the completion will be applied. This method can help ensure that the completion is valid and appropriate for the given source code.

## CompletionSchemaService

The `CompletionSchemaService` is a class in TypeScript that provides methods for managing completion schema data. It has a constructor, which is used to initialize the class. The `loggerService` property is an instance of the `LoggerService`, which handles logging messages. The `registry` property is a generic data structure used to store the completion schema. The `register` method is used to add a new completion schema with a specified key, and the `get` method is used to retrieve a completion schema by its key.

## ClientSwarm

The `ClientSwarm` class is an implementation of the `ISwarm` interface. It has a constructor that takes in `ISwarmParams` as a parameter. The class also has several properties and methods, including `params`, `_agentChangedSubject`, `_activeAgent`, `waitForOutput`, `getAgentName`, `getAgent`, `setAgentRef`, and `setAgentName`. The class allows for interaction with swarm agents, retrieving agent names and information. The `waitForOutput` method returns a promise that resolves to the output of an agent, while `getAgentName` and `getAgent` return promises that resolve to the name and information of an agent, respectively. The `setAgentRef` and `setAgentName` methods allow for setting the reference and name of an agent, respectively.

## ClientSession

The `ClientSession` class is an implementation of the `ISession` interface. It has a constructor that takes in `ISessionParams` as a parameter. The class has several properties and methods, including `params`, `_emitSubject`, `execute`, `commitToolOutput`, `commitSystemMessage`, and `connect`.

The `execute` method allows you to send a message and optionally prevent the emission of an event. It returns a promise that resolves with the response from the server.

The `commitToolOutput` method allows you to commit tool output, which is a message sent by the client to the server. It returns a promise that resolves when the message is successfully committed.

The `commitSystemMessage` method allows you to commit a system message, which is a message sent by the server to the client. It returns a promise that resolves when the message is successfully committed.

The `connect` method allows you to connect the client session with a connector function that sends messages. It returns a receive message function, which can be used to handle messages received from the server.

## ClientHistory

The `ClientHistory` class implements the `IHistory` interface and serves as a client-side history manager. It is constructed using the `IHistoryParams` object. The class provides two main methods: `push` and array conversion functions (`toArrayForRaw`, `toArrayForAgent`).

The `push` method accepts an `IModelMessage` object and returns a Promise that resolves when the message is successfully added to the history.

The `toArrayForRaw` method returns a Promise that resolves with an array of `IModelMessage` objects representing the current history in its raw form.

The `toArrayForAgent` method accepts a prompt string and returns a Promise that resolves with an array of `IModelMessage` objects representing the current history, filtered for messages related to the given prompt.

Overall, `ClientHistory` is a class that manages the client-side history, allowing for adding new messages and retrieving the history in different formats.

## ClientAgent

The `ClientAgent` class is an implementation of the `IAgent` interface. It has a constructor that takes in an object of type `IAgentParams`. The class also has several properties and methods.

The `params` property is of type `IAgentParams`, which contains parameters for the agent.

The `_toolCommitSubject` property is a subject of type `Subject<void>` that is used to commit tool output.

The `_outputSubject` property is a subject of type `Subject<string>` that is used to emit output.

The `_emitOuput` method is a function that takes in a `result` of type string and returns a promise that resolves when the output is emitted.

The `_resurrectModel` method is a function that takes in an optional `reason` of type string and returns a promise that resolves with the resurrected model.

The `waitForOutput` method is a function that returns a promise that resolves with the output when it is emitted.

The `getCompletion` method is a function that returns a promise that resolves with an `IModelMessage` object containing the completion.

The `commitSystemMessage` method is a function that takes in a `message` of type string and returns a promise that resolves when the system message is committed.

The `commitToolOutput` method is a function that takes in a `content` of type string and returns a promise that resolves when the tool output is committed.

The `execute` method is a function that takes in an `input` of type string and returns a promise that resolves when the execution is complete.

## AgentValidationService

The `AgentValidationService` is a class in TypeScript that provides methods for adding agents and validating agent data. It has a constructor that initializes the logger service, tool validation service, and completion validation service. The class also has a private property `_agentMap` to store the added agents.

To add an agent, you can use the `addAgent` method by providing the agent name and its schema. This method will store the agent in `_agentMap`.

To validate agent data, you can use the `validate` method by providing the agent name and the source data. This method will validate the agent using the logger service, tool validation service, and completion validation service.

Overall, the `AgentValidationService` class helps in managing and validating agents by utilizing other validation services.

## AgentSchemaService

The `AgentSchemaService` is a TypeScript class that serves as an agent schema registry. It has a constructor, which is used to initialize the class. The `loggerService` property is an instance of the `LoggerService`, which handles logging messages. The `registry` property is a generic data structure used to store the registered agent schemas. The `register` method is used to register an agent schema with a specified key, and the `get` method retrieves an agent schema by its key.

In summary, the `AgentSchemaService` is a class that manages the registration and retrieval of agent schemas, utilizing a logger service and a registry data structure.

## AgentPublicService

The `AgentPublicService` class implements the `TAgentConnectionService` interface and provides methods for interacting with agents in a system. It has several properties, including `loggerService` and `agentConnectionService`, which are used for logging and connecting to agents, respectively.

The `createAgentRef` method creates a reference for an agent with the given `clientId` and `agentName`, returning a `ClientAgent` object. The `execute` method allows the user to execute a command or input through an agent. The `waitForOutput` method waits for the agent's response and returns it as a string. The `commitToolOutput` method commits the tool's output to the system. The `commitSystemMessage` method commits a system message to the agent. The `dispose` method disposes of the agent connection.

Overall, this class provides a way to interact with agents in the system, execute commands through them, and manage their outputs and messages.
