# agent-swarm-kit api reference

**Overall Architecture:**

This system built around a distributed, asynchronous architecture. Agents communicate via a message queue, and their interactions are orchestrated through a series of tools and processes. The core concept is to allow agents to perform tasks independently while still being part of a larger, coordinated system.

**Core Concepts & Relationships**

* **Swarm Orchestration:** The entire framework is built around orchestrating agents to perform tasks.
* **Agent as the Central Unit:** The `IAgent` is the fundamental building block – the individual agent that executes tasks.
* **Communication (Bus):** The `IAgentParams` interface highlights the importance of the `bus` (a messaging system) for agents to communicate and coordinate.
* **History Management:** The `IAgent` and `IAgentParams` emphasize the agent's ability to operate without relying on conversation history (using the `run` method).
* **Tool Execution:** The `IAgent`’s `call` and `execute` methods are central to running tools within the agent.
* **Schema & Configuration:** The `IAgentSchema` defines the configuration for each agent, including its tools, prompt, and completion mechanism.

**Interface Breakdown & Key Responsibilities**

Here’s a summary of each interface and its role:

* **`IAgent`:** The core runtime agent.  Handles independent execution, tool calls, message commitment, and lifecycle management.
* **`IAgentParams`:**  Provides the agent with the necessary parameters for operation, including its ID, logging, communication channel, and history management.
* **`IAgentSchema`:** Defines the configuration settings for an agent (tools, prompt, completion mechanism).
* **`IAgentSchemaCallbacks`:**  Provides callbacks for managing different stages of an agent’s lifecycle (init, run, output, etc.).
* **`IAgentConnectionService`:** A type definition for an `AgentConnectionService` – a service that manages connections between the agents.

**Workflow Implications**

Based on these interfaces, here’s a workflow:

1. **Agent Configuration:** An `IAgentSchema` is created to define the agent’s settings.
2. **Agent Instantiation:** An `IAgent` instance is created based on the schema.
3. **Agent Execution:** The `IAgent`’s `execute` method is called to initiate independent operation.
4. **Tool Calls:**  The `IAgent` uses `call` to execute tools.
5. **Message Handling:** The `IAgent` uses `commitToolOutput`, `commitSystemMessage`, and `commitUserMessage` to manage messages.
6. **Communication:** The `IAgent` uses the `bus` (via `IAgentParams`) to communicate with other agents.

**Key Concepts & Implications:**

* **State Management:** Agents maintain their own state (conversation history, tool outputs, etc.).
* **Decoupling:** The interfaces are designed to decouple different components of the system. This allows for flexibility and easier maintenance.
* **Event-Driven Architecture:** The use of callbacks suggests an event-driven architecture, where components communicate through events rather than direct calls.
* **State Management:** The interfaces highlight the importance of managing the agent's state, including conversation history, tool output, and system messages.
* **Tool Integration:** The `tools` property in `IAgentParams` indicates a system designed to integrate with external tools.
* **Asynchronous Communication:** Agents communicate asynchronously via a bus, allowing them to operate independently.
* **Flexibility:** The system is designed to be flexible, a

**Potential Use Cases:**

This architecture could be used for a wide range of applications, including:

* **Chatbots:**  Agents could be used to power conversational AI systems.
* **Content Generation:** Agents could be used to generate text, images, or other content.
* **Data Analysis:** Agents could be used to analyze data and generate insights.


# agent-swarm-kit classes

## Class ToolValidationService

The ToolValidationService is a core component of the swarm system, responsible for ensuring the integrity of registered tools. It maintains a record of all tools within the swarm, verifying their uniqueness and existence. This service works closely with other key components, including the ToolSchemaService for tool registration, the AgentValidationService for agent tool validation, and the ClientAgent for tool usage.

The service utilizes dependency injection to manage its logging, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting, and employs memoization to efficiently check for tool existence based on their names.  The `addTool` function registers new tools with their schemas, while the `validate` function performs checks against the tool map, providing a robust mechanism for verifying tool availability.

## Class ToolSchemaService

The ToolSchemaService is the core service responsible for managing all tool definitions within the swarm system. It acts as a central repository, utilizing the ToolRegistry from functools-kit to store and quickly access IAgentTool instances.  This service performs shallow validation on each tool schema to guarantee basic integrity – specifically checking that the toolName is a string, the ‘call’ and ‘validate’ properties are functions, and the ‘function’ property is an object.

The service integrates closely with several other components: it’s used by AgentConnectionService during agent instantiation, supports ClientAgent’s tool execution, and is referenced by AgentSchemaService through the ‘tools’ field.  A LoggerService is integrated to record information-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations, aligning with the logging patterns of other key services.

The ToolSchemaService maintains an immutable registry, updated solely through the ToolRegistry’s register method.  It provides a ‘get’ method to retrieve tool schemas by their name, and a ‘register’ method to add new tool definitions after validation, ensuring consistency across the swarm’s agent ecosystem.


## Class SwarmValidationService

The SwarmValidationService is a core component responsible for ensuring the integrity of the entire swarm system. It maintains a record of all registered swarms, meticulously verifying their uniqueness, the validity of the agents listed within each swarm, and the associated policies.  

This service leverages dependency injection, utilizing instances of the AgentValidationService, PolicyValidationService, and LoggerService to perform its checks.  A central map stores information about each swarm, allowing for efficient retrieval of agent and policy details.

Key functionalities include registering new swarms via the `addSwarm` method, retrieving agent and policy lists, and performing comprehensive validation checks using the `validate` method. The `validate` method is optimized through memoization, ensuring fast validation based on swarm name.  The service also integrates with other services like the LoggerService for detailed logging of all validation operations and any encountered errors, supporting the overall operational health of the swarm system.

## Class SwarmSchemaService

The SwarmSchemaService is the core service responsible for managing all swarm configurations within the system. It acts as a central registry, utilizing the ToolRegistry from functools-kit to store and retrieve ISwarmSchema instances. This registry ensures the integrity of swarm definitions, performing shallow validation to verify that key properties like swarmName, defaultAgent, agentList, and policies are correctly formatted and consistent.

The service integrates closely with other key components, including the LoggerService for logging operations at the info level (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), the SwarmConnectionService for ClientSwarm instantiation, and the AgentConnectionService and PolicySchemaService.

Key methods include `validateShallow` for basic schema integrity checks, `register` for adding new schemas to the registry, and `get` for retrieving existing schemas based on their names.  The `register` method validates the schema before adding it, and the `get` method supports the creation of ClientSwarm configurations by providing validated schemas to the SwarmConnectionService.  This allows for coordinated execution via ClientAgent and links to AgentConnectionService and PolicySchemaService.


## Class SwarmPublicService

The SwarmPublicService provides a public interface for interacting with a swarm system. It acts as a central point of access, managing swarm-level operations and providing a consistent API. This service leverages the `SwarmConnectionService` for the core swarm interactions, while incorporating the `MethodContextService` to ensure operations are correctly scoped to a specific client and swarm.

Key functionalities include navigating the swarm’s execution flow (`navigationPop`), controlling output (`cancelOutput`, `waitForOutput`), retrieving agent information (`getAgentName`, `getAgent`), managing agent references (`setAgentRef`), and ultimately disposing of the swarm (`dispose`).  Each of these methods is wrapped with the `MethodContextService` for consistent scoping and logging, utilizing the `LoggerService` when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.  This logging supports operations within the ClientAgent (like navigating agent flows in EXECUTE_FN) and other services like SwarmMetaService and SessionPublicService.

## Class SwarmMetaService

The SwarmMetaService is a core component responsible for managing and visualizing the structure of the swarm system. It acts as a central hub for translating swarm schemas into a standardized UML format, primarily for documentation and debugging purposes.

This service leverages several supporting components: the SwarmSchemaService to retrieve the underlying swarm definitions, the AgentMetaService to create and manage agent nodes within the swarm hierarchy, and the LoggerService for detailed logging of operations – enabled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`.

Key functionalities include creating individual swarm nodes using `makeSwarmNode`, which builds a tree structure based on the SwarmSchemaService and incorporates the default agent; and generating UML strings for visualization through the `toUML` method, which is utilized by DocService to produce diagrams like `swarm_schema_[swarmName].svg`.  The service is designed to integrate seamlessly with ClientAgent relationships and DocService’s documentation generation processes.

## Class SwarmConnectionService

The SwarmConnectionService is the core component for managing interactions within a swarm system. It acts as an interface, implementing the `ISwarm` protocol to handle swarm instance management, agent navigation, output handling, and lifecycle operations, all tied to a specific client ID and swarm name.

This service integrates with several other key components, including the ClientAgent for executing agents within swarms, the SwarmPublicService for public API access, and the AgentConnectionService for managing agent instances. It leverages memoization using functools-kit’s memoize to efficiently reuse `ClientSwarm` instances, reducing overhead by caching them based on a composite key (client ID and swarm name).

The service utilizes a LoggerService for logging operations at an info level (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with the SwarmSchemaService to retrieve swarm configurations and the AgentConnectionService to instantiate agents.  It relies on a BusService for event propagation, aligning with the event system used in the AgentConnectionService.

Key functionalities include retrieving or creating a `ClientSwarm` instance (using memoization), navigating the swarm’s agent stack (using `navigationPop`), canceling pending outputs (`cancelOutput`), waiting for agent output (`waitForOutput`), and retrieving the active agent’s name and instance (`getAgentName`, `getAgent`).  It also provides methods for dynamically managing agents, such as setting an agent reference (`setAgentRef`) and setting the active agent name (`setAgentName`). Finally, the service includes a `dispose` method for cleaning up the swarm connection, clearing the memoized instance and aligning with other services’ cleanup processes.

## Class StorageValidationService

The StorageValidationService is a core component of the swarm system, responsible for ensuring the integrity of all storage configurations. It maintains a record of every registered storage through a dedicated map, meticulously tracking each one’s details.  This service works closely with other key components, including the StorageSchemaService for initial registration, ClientStorage for operational checks, and AgentValidationService and EmbeddingValidationService for deeper validation. 

The service utilizes dependency injection to manage its interactions with these other services and employs memoization to speed up validation checks, specifically by storing validation results based on the storage name.  It’s configured to log all validation activities at an informational level, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting.  

The `validate` method is the primary function, allowing the service to verify the existence and embedding configuration of a storage based on its name and source.  The `addStorage` method is used to register new storage configurations, ensuring uniqueness and integrating with the StorageSchemaService.

## Class StorageUtils

The `StorageUtils` class provides a centralized way to manage data storage within an agent swarm. It implements the `TStorage` interface, offering methods for retrieving, inserting, updating, deleting, and listing items stored by specific agents.  This utility handles client-specific storage, ensuring proper agent-storage registration and validation before any data operations are performed.  Key functionalities include the `take` method for retrieving a limited number of items based on a search query, the `upsert` method for adding or modifying items, the `remove` method for deleting items by ID, the `get` method for retrieving a single item, and the `list` method for listing all items within a storage.  Finally, the `clear` method allows for the complete removal of all data associated with a particular agent and storage. All operations are executed within a logging context for traceability.


## Class StorageSchemaService

The StorageSchemaService is the core service for managing storage configurations within the swarm system. It acts as a central registry, utilizing ToolRegistry from functools-kit, to store and retrieve IStorageSchema instances. This registry ensures the integrity of storage schemas through shallow validation, checking that each schema has a valid storageName (as a string), a function for creating indexes, and a reference to an EmbeddingName from the EmbeddingSchemaService.

The service integrates with several other components, including StorageConnectionService, SharedStorageConnectionService, AgentSchemaService, ClientAgent, and StoragePublicService, facilitating the configuration of ClientStorage and shared storage instances.  A LoggerService is integrated to record information-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during schema registration, retrieval, and validation.

The service provides two primary methods: `register` and `get`. The `register` method adds a new storage schema to the registry after performing a shallow validation check, and the `get` method retrieves a schema by its name. These operations are crucial for supporting ClientAgent execution and ensuring consistent storage configurations across the swarm ecosystem.  The service’s design supports the configuration of storage within ClientStorage and SharedStorageConnectionService, aligning with the needs of AgentSchemaService and the overall swarm architecture.


## Class StoragePublicService

This `StoragePublicService` class acts as a public interface for managing client-specific storage within the swarm system. It’s designed to provide a consistent way for other services, like the `ClientAgent`, to interact with individual clients’ storage data. The service relies on the `StorageConnectionService` for the actual storage operations and uses the `MethodContextService` to track the context of each operation, ensuring proper scoping and logging.

Key functionalities include retrieving, inserting, updating, deleting, and listing data within a client’s dedicated storage space, identified by a unique `storageName` and `clientId`. The service integrates with the `ClientAgent` for tasks like searching and storing data within `EXECUTE_FN`, and it supports monitoring storage usage through `PerfService` and documenting storage schemas via `DocService`.

The service utilizes a `loggerService` for informational logging, controlled by the `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` setting.  Methods like `take`, `upsert`, `remove`, `get`, `list`, `clear`, and `dispose` are all wrapped with the `MethodContextService` and logging to provide detailed tracking and debugging capabilities.  It contrasts with the `SharedStoragePublicService` by focusing on individual client storage, offering a more granular control mechanism.

## Class StateUtils

The StateUtils class is a core component designed to manage individual agent states within the AI agent swarm. It acts as a central point for retrieving, updating, and clearing state information specific to each client and agent. 

This utility provides methods – `getState`, `setState`, and `clearState` – that interact with the swarm’s state service.  `getState` allows you to retrieve the current state data, ensuring proper client session and agent-state registration are verified before accessing the data. The `setState` method offers flexibility, accepting either a direct state value or a function that calculates the new state based on the previous one. Finally, `clearState` resets the state data to its initial value, again validating the client and agent setup. All operations are executed within a logging context for monitoring and debugging.

## Class StateSchemaService

The StateSchemaService is the core service responsible for managing all state schemas within the swarm system. It acts as a central repository, utilizing the ToolRegistry from functools-kit to store and retrieve IStateSchema instances.  This service performs shallow validation on each schema to guarantee basic integrity, checking the stateName, the presence of a getState function, and the format of any associated middlewares.

The service integrates closely with other key components, including StateConnectionService, SharedStateConnectionService, ClientAgent, AgentSchemaService, and StatePublicService. It’s designed to support the configuration of ClientState, providing the getState function and middleware definitions needed for execution within the swarm.

The StateSchemaService relies on a LoggerService for logging operations at the info level, controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.  It manages the registry, which is updated through the ToolRegistry’s register method to maintain a consistent collection of state schemas.  The service provides a robust mechanism for retrieving state schemas by name, ensuring compatibility with the various components that utilize state configurations.

## Class StatePublicService

This class, StatePublicService, manages client-specific state operations within the swarm system. It’s designed to work with generic state data types, providing a public interface for interacting with client state.

The service integrates with several key components: the ClientAgent, which handles client-specific state updates during execution (like in EXECUTE_FN), the PerfService for tracking state changes per client ID, and the DocService for documenting state schemas based on the `stateName`.

StatePublicService relies on a LoggerService for logging operations at the info level (controlled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`) and utilizes a StateConnectionService for the underlying state management.

Key functionalities include:

*   **setState:**  Sets client-specific state using a provided dispatch function, updating the state identified by `stateName` for a given `clientId`. This is central to the ClientAgent’s operation and is also used by the PerfService.
*   **clearState:** Resets the client-specific state to its initial value, also identified by `stateName` and `clientId`. This is used in the ClientAgent and PerfService.
*   **getState:** Retrieves the current client-specific state, again identified by `stateName` and `clientId`.
*   **dispose:** Cleans up client-specific state resources, aligning with the ClientAgent’s cleanup and PerfService’s disposal mechanisms.

The service’s operations are wrapped with MethodContextService for scoping and leverage the LoggerService for consistent logging patterns.  It distinguishes itself from SharedStatePublicService (system-wide state) and SharedStoragePublicService (persistent storage) by focusing on individual client state management through the `clientId`.

## Class StateConnectionService

The StateConnectionService is a core component within the AI agent swarm orchestration framework, designed to manage state instances and their interactions. It implements the `IState` interface, providing a structured way to handle state data, manipulation, and lifecycle operations, all scoped to a specific client ID and state name.

At its heart, the service utilizes memoization via functools-kit’s memoize to efficiently cache `ClientState` instances, reducing redundant creation and ensuring fast access. It’s built around a `_sharedStateSet` to track states designated as shared, delegating these to the `SharedStateConnectionService`.

Key integrations include: `ClientAgent` for state execution, `StatePublicService` for public state access, `SharedStateConnectionService` for shared state management, `AgentConnectionService` for state initialization, and `PerfService` for performance tracking. The service leverages a `loggerService` for informational logging (controlled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`) and coordinates with `StateSchemaService` for state configuration and `SessionValidationService` for usage tracking.

The `getStateRef` method is central, retrieving or creating a memoized `ClientState` instance. It handles persistence using `PersistStateAdapter` or defaults from `GLOBAL_CONFIG`, serializes state updates for thread safety, and delegates to `SharedStateConnectionService` for shared states.

Methods like `setState` and `clearState` utilize a dispatch function to transform the previous state, logging operations via the `loggerService` when enabled. These methods mirror functionality found in `StatePublicService`, supporting state updates within `ClientAgent` and ensuring serialized execution.

Finally, the `dispose` method cleans up resources, clearing the memoized instance and updating the `SessionValidationService`, while ensuring shared states remain managed by the `SharedStateConnectionService`.

## Class SharedStorageUtils

The SharedStorageUtils class provides a central interface for interacting with the swarm’s shared storage. It implements the `TSharedStorage` interface, offering a set of methods to manage data within the storage.

Key functionalities include retrieving items using the `take` method, which allows searching for specific data based on a query and limits the number of results.  The `upsert` method handles both inserting new items and updating existing ones within the storage.  You can also remove individual items using the `remove` method, identified by their unique ID.

Furthermore, the class provides the ability to retrieve a single item using the `get` method, and to list all items within a storage, optionally filtered based on a provided condition, via the `list` method. Finally, the `clear` method allows you to remove all data from a specified storage.  All these operations are executed within a context that supports logging and validation, ensuring the storage name is always valid before any operation is performed.

## Class SharedStoragePublicService

The `SharedStoragePublicService` class acts as a public interface for interacting with shared storage within the swarm system. It implements the `TSharedStorageConnectionService` to provide a consistent API for accessing shared storage, delegating the underlying storage operations to the `SharedStorageConnectionService`. This service handles the core storage tasks like retrieving, updating, and deleting items.

The service incorporates several supporting components. It utilizes a `loggerService` for logging operations at the INFO level, controlled by the `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` setting, aligning with logging patterns used by other services.  It relies on a `sharedStorageConnectionService` to perform the actual storage interactions.

Key functionalities include methods for retrieving items (`get`, `list`, `take`), inserting or updating items (`upsert`), removing items (`remove`), and clearing the entire storage (`clear`). These methods are wrapped with `MethodContextService` for scoping and logging, and they are designed to be used by components like the `ClientAgent` (e.g., during data retrieval in `EXECUTE_FN`) and the `DocService` (e.g., for documenting storage schemas).  The service also integrates with `PerfService` for tracking storage usage and performance metrics.

## Class SharedStorageConnectionService

The SharedStorageConnectionService is a core component responsible for managing shared storage instances within the swarm system. It implements the `IStorage` interface, providing a centralized point for shared data access and manipulation. This service operates across all clients, utilizing a fixed client ID of "shared" to ensure consistent data management.

Key functionalities include retrieving, updating, and deleting data from the shared storage, leveraging memoization via functools-kit’s memoize to maintain a single, shared storage instance for efficiency. The service integrates with several other components, including ClientAgent, AgentConnectionService, and SharedStoragePublicService, facilitating seamless interaction with the swarm’s distributed architecture.

The `getStorage` method is central, creating and caching `ClientStorage` instances based on the provided storage name. This caching mechanism, combined with the integration of schema services (StorageSchemaService and EmbeddingSchemaService) and persistence adapters, ensures data consistency and supports various storage configurations.

Core operations like `take`, `upsert`, `remove`, `get`, and `list` delegate to a memoized `ClientStorage` instance, providing the primary interface for interacting with the shared storage. These operations are carefully managed through logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) and context retrieval via the MethodContextService, aligning with established logging patterns and ensuring proper scoping. The service’s design promotes scalability and reliability within the swarm system.

## Class SharedStateUtils

The SharedStateUtils class is a core utility designed to manage shared data across an agent swarm. It acts as an interface to the swarm’s shared state service, providing methods for retrieving, updating, and resetting state information.

Specifically, it offers:

*   **`getState`**: This method allows you to fetch the current shared state data associated with a particular state name. It handles the underlying communication with the shared state service and includes logging for context.
*   **`setState`**:  This method enables you to modify the shared state. You can either provide a direct value to set the state, or, more powerfully, you can pass a function. This function takes the previous state as input and returns a new state, allowing for state updates based on complex logic.
*   **`clearState`**: This method resets the shared state for a given state name, returning it to its initial, empty state. Like the other methods, it operates within a logging context and delegates to the shared state service.

## Class SharedStatePublicService

The SharedStatePublicService acts as a central interface for managing shared state operations within the swarm system. It implements the `TSharedStateConnectionService` to provide a public API, delegating core state interactions to the underlying SharedStateConnectionService. This service is enhanced with MethodContextService for controlled scoping and utilizes LoggerService for consistent, info-level logging, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting.

The service’s key functionalities include `setState`, which updates the shared state using a provided dispatch function and supports usage in ClientAgent and PerfService.  Additionally, `clearState` resets the shared state to its initial value, and `getState` retrieves the current state value. These methods are designed to be robust and adaptable, integrating with ClientAgent’s state management and PerfService’s session state tracking. The service’s architecture ensures proper context management and logging for comprehensive monitoring and control of shared state operations.


## Class SharedStateConnectionService

The SharedStateConnectionService is a core component responsible for managing shared state connections within the swarm system. It implements the `IState<T>` interface, providing a flexible way to handle shared state instances with a generic type `T` extending `IStateData`.  This service is designed for efficient state management across all clients, utilizing a fixed client ID of "shared".

It integrates seamlessly with several other services, including ClientAgent, StatePublicService, SharedStatePublicService, and AgentConnectionService.  The service employs memoization using functools-kit’s memoize to cache `ClientState` instances by `stateName`, ensuring a single, shared instance is used across all clients.  State updates are queued for serialization, guaranteeing thread-safe modifications.

The service leverages the LoggerService for logging operations at the info level (controlled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`) and coordinates with the StateSchemaService for retrieving state configurations and applying persistence via PersistStateAdapter or default configurations from `GLOBAL_CONFIG`.

Key functionalities include:

*   **`getStateRef`:** This method retrieves or creates a memoized `ClientState` instance based on the provided `stateName`. It manages caching and persistence, ensuring a shared state instance for the "shared" client ID.
*   **`setState`:**  This method allows setting the shared state using a dispatch function, providing a mechanism for transforming the previous state. It integrates with ClientAgent for state updates and serializes execution for thread safety.
*   **`clearState`:** This method resets the shared state to its initial value, mirroring the `clearState` functionality in SharedStatePublicService.
*   **`getState`:** This method retrieves the current shared state, mirroring the `getState` functionality in SharedStatePublicService.

The service utilizes the BusService for event propagation and the MethodContextService to access execution context, ensuring consistent logging via the LoggerService when `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` is true.  It supports ClientAgent, AgentConnectionService, and SharedStatePublicService, providing a robust foundation for managing shared state within the swarm.


## Class SessionValidationService

The SessionValidationService is responsible for managing and verifying the existence and resource usage of sessions within the swarm system. It meticulously tracks each session’s associations with swarms, modes, agents, histories, and storage, ensuring that resources are allocated and utilized correctly.

This service integrates seamlessly with several key components, including SessionConnectionService, ClientSession, ClientAgent, ClientStorage, ClientState, and SwarmSchemaService, facilitating robust session management.  Dependency injection is utilized for the logger, and memoization is employed to optimize validation checks for efficiency.

Key functionalities include:

*   **Session Registration:** The `addSession` method registers new sessions, logging the operation and ensuring uniqueness.
*   **Resource Tracking:** Methods like `addAgentUsage`, `addHistoryUsage`, `addStorageUsage`, and `addStateUsage` track the utilization of agents, histories, storage, and states within each session.
*   **Data Retrieval:**  Methods such as `getSessionMode`, `getSwarm`, `getSessionAgentList`, `getSessionHistoryList`, and `getSessionList` provide access to session information.
*   **Validation:** The `validate` method performs session existence checks, leveraging memoization for performance.
*   **Cleanup:** The `removeSession` and `dispose` methods handle session removal and cache clearing, respectively.

The service provides essential validation capabilities, supporting session lifecycle management and resource control within the swarm environment.

## Class SessionPublicService

This class, SessionPublicService, is the central point of interaction for managing sessions within the swarm system. It implements the `TSessionConnectionService` interface, providing a public API to interact with session operations.  Essentially, it acts as a wrapper around the underlying `TSessionConnectionService` and related services like `SessionConnectionService`, `MethodContextService`, and `ExecutionContextService`.

Key functionalities include emitting messages to the session (`emit`), executing commands within the session (`execute` and `run`), and committing messages to the session’s history (`commitToolOutput`, `commitSystemMessage`, `commitAssistantMessage`, `commitUserMessage`).  These operations are carefully managed using the `MethodContextService` for scoping and logging via the `LoggerService` when `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` is true, aligning with logging patterns used by `AgentPublicService` and `PerfService`.

The service leverages dependency injection to integrate with other essential components, including the `PerfService` for performance tracking during session execution, the `BusService` for event handling, and the `SwarmService` for overall swarm management.  The `connect` method initiates the session interaction, while `dispose` cleans up resources.  It’s designed to seamlessly integrate with the `ClientAgent`’s session-level messaging and tool execution capabilities, mirroring these functionalities within the `AgentPublicService`.  The `commitFlush` method allows for clearing the session’s history, and `commitStopTools` provides control over tool execution.

## Class SessionConnectionService

Okay, here's a human-friendly summary of the `SessionConnectionService` API reference, aiming for clarity and a practical understanding:

**The SessionConnectionService is the core component for managing individual sessions within your AI agent swarm.** Think of it as the central hub for any interaction happening inside a specific session. It’s designed to be efficient by caching session instances, so you don’t repeatedly create them.

**Here’s what it does:**

*   **Creates and Manages Sessions:** It handles the creation, retrieval, and lifecycle (starting, stopping) of individual sessions.
*   **Efficient Caching:**  It uses a cache to avoid redundant session creation, improving performance.
*   **Communication Hub:** It provides methods for sending messages to and receiving messages from the session, allowing your agents to interact with the session’s internal state.
*   **Tool Management:** It supports committing tool outputs (like those from OpenAI tools) and system messages, allowing your agents to use and track the results of their actions.
*   **Integration with Other Components:** It integrates with other parts of the swarm, such as the `HistoryPublicService` for managing session history and the `ToolExecutor` for managing tool execution.

**Key Features:**

*   **Caching:**  The service uses a cache to store session instances, reducing the overhead of creating new sessions repeatedly.
*   **Message Passing:** It provides methods for sending and receiving messages, enabling communication between your agents and the session.
*   **Tool and Message Tracking:** It supports committing tool outputs and system messages, allowing you to track the progress of your agents’ interactions.

**In essence, the `SessionConnectionService` is the essential bridge between your agents and the individual sessions they’re working within, providing a robust and efficient way to manage these interactions.**

---

Would you like me to:

*   Focus on a specific aspect of the service (e.g., caching, message passing)?
*   Provide an example of how you might use one of its methods?

## Class SchemaUtils

The SchemaUtils class offers a set of tools focused on managing data within client sessions and converting objects to strings. It provides methods for writing data to a client’s session memory, ensuring the session is valid before the operation.  You can use `writeSessionMemory` to store data, and it’s designed to handle validation and logging.  Additionally, the class includes a `readSessionMemory` function for retrieving data from a client’s session, also with validation and logging. Finally, the `serialize` method converts objects – whether single objects or arrays of objects – into formatted strings. This function can flatten nested objects and allows for custom mapping of keys and values during the serialization process, giving you control over the output format.

## Class RoundRobin

The RoundRobin implementation provides a flexible way to manage a series of instance creators. It works by repeatedly calling each creator in a defined list, ensuring a consistent rotation.

Key features include:

*   **Token-Based Instance Creation:** It utilizes a list of tokens to identify which instance creator should be invoked next.
*   **Dynamic Invocation:** The `create` static method allows you to define the token list and the instance creation function, making it adaptable to various scenarios.
*   **Logging (Optional):**  The implementation includes logging functionality to track the current token being processed and the total number of tokens.
*   **Flexible Configuration:** The `create` method accepts type parameters for the tokens, the factory function, and the arguments passed to the factory, offering a high degree of customization.

## Class PolicyValidationService

The PolicyValidationService is a core component of the swarm system, responsible for ensuring the integrity of policies. It maintains a central map of all registered policies, tracking their names and associated schemas. This service works closely with other key components: the PolicySchemaService for initial policy registration, the ClientPolicy service for policy enforcement, and the AgentValidationService for potential agent-level validation.

To optimize performance, the service utilizes dependency injection for its logging capabilities, controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO, and employs memoization to quickly check for policy existence.  The `addPolicy` function registers new policies with the service, logging the registration and guaranteeing uniqueness, aligning with the PolicySchemaService’s registration process.  The `validate` function is the primary method for checking if a policy exists, leveraging memoization to speed up these checks and supporting the validation needs of the ClientPolicy service.

## Class PolicyUtils

The PolicyUtils class offers a set of tools for managing client bans as part of a swarm policy. It provides methods to reliably handle banning, unbanning, and checking for bans, all within the context of a swarm policy.

Key functionalities include:

*   **`banClient`**: This method allows you to ban a client under a defined policy within a specific swarm. It performs thorough validation of the client ID, swarm name, and policy name before sending the request to the policy service.

*   **`unbanClient`**:  This method reverses the `banClient` operation, unbanning a client from a policy within a swarm. Like `banClient`, it validates input and interacts with the policy service.

*   **`hasBan`**: This method checks whether a client is currently banned under a given policy within a swarm. It validates the client, swarm, and policy details before querying the policy service to determine the ban status.  All operations are designed for logging and tracking within the swarm's policy framework.

## Class PolicySchemaService

The PolicySchemaService is the central component for managing policy definitions within the swarm system. It acts as a registry, storing and retrieving IPolicySchema instances using a ToolRegistry for efficient management.  The service performs shallow validation of each schema, ensuring key elements like the `policyName` and `getBannedClients` function are present and valid.

It integrates closely with other services, including PolicyConnectionService, ClientAgent, SessionConnectionService, and PolicyPublicService, providing a consistent policy framework.  A LoggerService is integrated for informational logging (controlled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`) during operations like registration, retrieval, and validation.

The service utilizes a ToolRegistry to store and manage these schemas, and it’s designed to be updated immutably through the ToolRegistry’s `register` method.  The `get` method retrieves a specific policy schema by its name, supporting the core functionality of services like PolicyConnectionService and ClientAgent.  Ultimately, the PolicySchemaService provides a foundational layer for defining and enforcing access control and restrictions across the entire swarm ecosystem.


## Class PolicyPublicService

The PolicyPublicService class acts as a public interface for managing policy operations within the swarm system. It extends `TPolicyConnectionService` to provide a standardized API for interacting with policies. This service leverages the `PolicyConnectionService` for the core policy operations, while also incorporating the `MethodContextService` to manage the scope of operations and the `LoggerService` for logging activities when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled.

Key functionalities include checking if a client is banned (`hasBan`), retrieving ban messages (`getBanMessage`), validating both incoming and outgoing data (`validateInput`, `validateOutput`), and directly banning or unbanning clients (`banClient`, `unbanClient`). These operations are wrapped with the `MethodContextService` for context management and utilize the `LoggerService` for consistent logging patterns, aligning with the logging practices of AgentPublicService and DocService.

The service integrates with several other components, including `PerfService` for policy enforcement within compute client states, `ClientAgent` for tasks like pre-execution ban checks and displaying ban reasons, and `DocService` for policy documentation.  The `PolicyConnectionService` provides the underlying logic for these operations, ensuring a robust and centralized approach to policy management within the swarm.

## Class PolicyConnectionService

The PolicyConnectionService is a core component within the swarm system, designed to manage policy connections and operations. It implements the `IPolicy` interface, providing a structured way to handle policy instances, ban status checks, and input/output validation, all scoped to a specific policy name, client ID, and swarm name.

This service integrates with several other key components, including the ClientAgent for policy enforcement, SessionPublicService for session-level policy management, and PolicyPublicService for public API access. It also leverages the SwarmPublicService for context and the PerfService for performance tracking via the BusService.

A key feature is its use of memoization, achieved through functools-kit’s memoize, to efficiently cache `ClientPolicy` instances by policy name. This dramatically reduces the overhead of creating new policy instances repeatedly. The service utilizes the LoggerService for logging information-level events (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) and coordinates with the PolicySchemaService to retrieve policy configurations and the BusService for event emission.

The service offers several methods for managing policy interactions. The `getPolicy` method retrieves or creates a memoized `ClientPolicy` instance, configuring it with schema data from the PolicySchemaService and defaulting autoBan to GLOBAL_CONFIG.CC_AUTOBAN_ENABLED_BY_DEFAULT if not explicitly specified. It supports the ClientAgent’s execution restrictions and SessionPublicService’s policy enforcement.

Methods like `hasBan`, `getBanMessage`, `validateInput`, and `validateOutput` delegate to the `ClientPolicy` for actual policy checks, leveraging the MethodContextService to maintain proper scoping and logging via the LoggerService when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true. These methods mirror the functionality of PolicyPublicService, supporting ClientAgent’s input validation and SessionPublicService’s policy checks.

Finally, the service provides methods for directly managing bans, including `banClient` and `unbanClient`, which also delegate to the `ClientPolicy` and utilize the MethodContextService for logging and context. These methods align with PolicyPublicService’s ban management capabilities, supporting ClientAgent’s enforcement and SessionPublicService’s policy actions.

## Class PersistSwarmUtils

The `PersistSwarmUtils` class provides a utility for managing persistent data related to AI agent swarms. It acts as an implementation of `IPersistSwarmControl`, offering methods to reliably store and retrieve information about active agents and their navigation stacks.  

Key functionalities include a memoized `getActiveAgentStorage` and `getNavigationStackStorage` to ensure a single, consistent storage instance is used for each swarm, identified by its name.  

The class offers methods to directly access and modify this data: `getActiveAgent` allows retrieval of the currently active agent for a specific client within a swarm, with a default agent provided if none is defined.  `setActiveAgent` enables setting a new active agent. Similarly, `getNavigationStack` retrieves the navigation stack for a client, and `setNavigationStack` allows setting a new stack.

Furthermore, `PersistSwarmUtils` supports custom persistence logic through `usePersistActiveAgentAdapter` and `usePersistNavigationStackAdapter`, allowing developers to integrate with their preferred persistence mechanisms while still adhering to the `IPersistSwarmControl` interface.

## Class PersistStorageUtils

The PersistStorageUtils class provides a flexible way to manage data persistence for individual clients, tied to specific storage names. It acts as a utility, offering methods to retrieve and store data, ensuring that each client has its own isolated storage instance.

At its core, PersistStorageUtils utilizes a PersistStorageFactory to create storage instances.  A key feature is the `getPersistStorage` function, which memoizes the creation of storage instances, guaranteeing a single, consistent storage object is used for a given storage name.

This class offers two primary methods: `getData`, which allows you to retrieve data from a storage, with a fallback to a provided default value if the data isn't already present.  The `setData` method then enables you to store data, wrapping it within an `IPersistStorageData` structure for persistent storage.

Furthermore, the `usePersistStorageAdapter` method allows developers to customize the underlying storage mechanism by providing a custom constructor, overriding the default `PersistBase` implementation and tailoring the storage behavior to specific needs.

## Class PersistStateUtils

The PersistStateUtils class offers a flexible way to manage and persist state information for individual clients. It acts as a utility, providing methods to easily get and set state data, ensuring each client’s state is handled independently.  At its core, it utilizes a PersistStateFactory to create and manage storage instances, guaranteeing that only one storage instance exists for each state name.

The class provides two primary methods: `setState`, which allows you to set a state value for a client, packaged within an IPersistStateData structure, and `getState`, which retrieves the state value, gracefully falling back to a provided default if the state hasn't been explicitly set.  

Furthermore, PersistStateUtils allows you to customize the underlying persistence mechanism by using the `usePersistStateAdapter` method, letting you inject your own persistence implementation (represented by a constructor `TPersistBaseCtor`) for tailored storage behavior.

## Class PersistPolicyUtils

The PersistPolicyUtils class provides tools for managing policy data persistence within the AI agent swarm system. It acts as a utility, offering methods to retrieve and update a list of banned clients associated with a specific policy, identified by its `SwarmName`.

At its core, the class utilizes a `PersistPolicyFactory` and a memoized function, `getPolicyStorage`, to ensure a single, optimized persistence instance is created for each swarm. This improves resource efficiency.

The `getBannedClients` method allows you to retrieve the current list of banned clients for a given policy and swarm, defaulting to an empty array if no bans are defined. This is crucial for checking client status during swarm workflows.

Conversely, the `setBannedClients` method enables you to persistently update the banned client list, ensuring that changes are saved for future use.

Finally, the `usePersistPolicyAdapter` method provides flexibility by allowing you to customize the underlying persistence mechanism. You can supply a custom constructor, enabling features like in-memory or database-backed storage, giving you fine-grained control over how policy data is managed.


## Class PersistMemoryUtils

The PersistMemoryUtils class provides a flexible way to manage memory data for individual clients within an AI agent swarm. It acts as a utility, offering methods to both retrieve and store memory information, all while utilizing a configurable persistence adapter. 

At its core, PersistMemoryUtils employs a memoized function, `getMemoryStorage`, to guarantee that each client has a single, dedicated storage instance. This ensures data isolation and prevents conflicts.

Key functionalities include `setMemory`, which allows you to persist memory data for a client, packaged within an `IPersistMemoryData` structure, and `getMemory`, which retrieves this data, gracefully falling back to a provided default state if the memory hasn't been initialized for a specific client.

Furthermore, the class supports customization through the `usePersistMemoryAdapter` method, enabling you to replace the default persistence logic with your own implementation. Finally, the `dispose` method provides a clean way to remove the memory storage associated with a client ID.

## Class PersistList

The PersistList class extends the base PersistBase structure to create a persistent, ordered list of entities. It utilizes numeric keys to maintain the order of items within the list.  The class manages these keys to ensure sequential generation, even when multiple operations are happening simultaneously.

Key features include a tracked count of list items and a unique key generation function that guarantees consistent key assignment across concurrent calls.  The PersistList provides methods for adding new entities to the end of the list using the `push` method, which assigns a new, unique numeric key.  It also offers a `pop` method to remove and retrieve the last added entity from the list.  The `pop` operation ensures atomic removal, preventing data corruption in scenarios with concurrent access.  Finally, the class provides a function to retrieve the key of the last item in the list.

## Class PersistEmbeddingUtils

The PersistEmbeddingUtils class provides a flexible way to manage embedding data within the AI agent swarm system. It acts as a central utility, handling the reading and writing of embedding vectors.  At its core, it utilizes a PersistEmbeddingFactory to create and manage individual persistence instances, ensuring efficient resource usage by preventing duplicate storage.

The class offers a memoized function, `getEmbeddingStorage`, that creates or retrieves a dedicated storage instance based on the embedding's name.  Crucially, it includes a `readEmbeddingCache` function for quickly checking if a precomputed embedding exists, and a `writeEmbeddingCache` function to persistently store newly computed vectors.

Furthermore, the `usePersistEmbeddingAdapter` method allows developers to customize the embedding persistence process by providing a custom constructor, enabling integration with various storage options like in-memory or database-backed systems for enhanced tracking and control.

## Class PersistBase

The PersistBase class serves as the foundation for persistent storage of entities, managing their data within the file system. It’s designed to read and write entities as JSON files, providing a core mechanism for maintaining state across application runs.

The class utilizes a specified `baseDir` to store the entity files and tracks each entity’s location via the `_directory` property.  A key feature is the `waitForInit` method, which automatically initializes the storage directory if it doesn’t exist and validates existing entities, removing any invalid ones to ensure data consistency.

The PersistBase class offers several methods for interacting with the stored entities.  `_getFilePath` calculates the file path for a given entity ID.  `getCount` retrieves the total number of entities stored, and `readValue` loads a specific entity from storage, parsing the JSON data.  `hasValue` checks for the existence of an entity based on its ID.  `writeValue` saves an entity to storage, serializing it to JSON and employing atomic file writing for reliability.  `removeValue` deletes a single entity, and `removeAll` clears the entire storage directory.

Furthermore, the class provides an `values` method to iterate over all stored entities in sorted numerical order by ID, and a `keys` method to iterate over all entity IDs in the same sorted order.  It also implements the async iterator protocol, allowing for efficient iteration over the stored entities.  Finally, the `filter` and `take` methods provide advanced filtering and limiting capabilities during iteration.

## Class PersistAliveUtils

The PersistAliveUtils class provides a core mechanism for managing client availability within the AI agent swarm system. It implements the `IPersistAliveControl` interface, offering a centralized way to track whether each client (`SessionId`) is currently online.

At its heart, PersistAliveUtils utilizes a `PersistAliveFactory` to create and manage individual persistence instances for each client, optimizing resource usage by ensuring only one storage instance exists per `SessionId`.

Key methods include `markOnline` and `markOffline`, which allow you to update a client’s status, persisting this change for future checks.  The `getOnline` method provides a way to retrieve the current online status, defaulting to `false` if no status has been explicitly set.

Furthermore, the `usePersistAliveAdapter` method allows for flexible configuration. You can supply a custom constructor (`Ctor`) to tailor the persistence strategy, enabling integration with different storage mechanisms like in-memory or database-backed systems, providing greater control over how client availability is tracked.

## Class PerfService

This is an excellent and detailed breakdown of the class's responsibilities and methods. You've accurately captured the core functionality and the relationships between the various components. Here's a further breakdown with some potential enhancements and considerations:

**Key Strengths of Your Description:**

* **Comprehensive:** You've covered almost every method and its purpose.
* **Clear and Concise:** The descriptions are easy to understand.
* **Contextualized:** You've linked the methods to their broader purpose within the system (e.g., `startExecution` and `endExecution` in relation to `ClientAgent.execute`).
* **Relationship Mapping:**  You've clearly articulated how methods interact with each other (e.g., `startExecution` and `endExecution`).

**Potential Enhancements & Considerations:**

1. **Error Handling:**  You've omitted error handling.  This is crucial.  Consider adding notes about how errors are handled (e.g., logging, retries, exceptions).  For example:
   *  "If an error occurs during execution tracking (e.g., a network issue), the method should log the error and potentially attempt a retry before marking the execution as failed."

2. **Concurrency & Thread Safety:**  This class handles multiple concurrent executions.  This is a *critical* consideration.  Add notes about:
   *  "The class is designed to handle concurrent execution tracking.  All data structures (maps, counters) are thread-safe to prevent race conditions."
   *  "Synchronization mechanisms (e.g., locks) are used to ensure data integrity during concurrent access."

3. **Data Structures & Scalability:**  Mention the data structures used and their implications for scalability.
   * "The class utilizes maps (e.g., `executionData`, `activeSessions`) for efficient lookup of execution data.  The choice of map implementation should be considered for performance and scalability, especially with a large number of concurrent executions."

4. **`dispose` Method - More Detail:** The `dispose` method is important but needs more explanation.
   * "The `dispose` method removes all performance data associated with a client, including clearing maps and releasing any resources. This is crucial for preventing memory leaks and ensuring proper cleanup when a session ends."

5. **`toRecord` and `toClientRecord` - Aggregation:**  You could elaborate on how these methods aggregate data.
   * "The `toRecord` method aggregates data from all client records, calculating overall performance metrics such as average response time and total execution count.  The `toClientRecord` method performs a similar aggregation for a single client, creating a detailed performance report."

6. **Dependencies & External Systems:**  The class relies on several other components (e.g., `sessionValidationService`).  It would be beneficial to explicitly state these dependencies.

7. **Asynchronous Operations:**  `toClientRecord` and `toRecord` are asynchronous.  Clarify the use of Promises or async/await.

**Revised Snippet (Illustrative - Focusing on Error Handling & Thread Safety):**

"The class is designed to handle concurrent execution tracking. All data structures (maps, counters) are thread-safe to prevent race conditions. If an error occurs during execution tracking (e.g., a network issue), the method should log the error and potentially attempt a retry before marking the execution as failed. The `dispose` method removes all performance data associated with a client, including clearing maps and releasing any resources. The `toClientRecord` and `toRecord` methods are asynchronous operations, utilizing Promises to manage the asynchronous data aggregation.  These methods are designed to handle concurrent execution tracking, ensuring data integrity even under heavy load."

**Overall:**

Your initial description is excellent.  Adding details about error handling, thread safety, data structures, and asynchronous operations will significantly strengthen the documentation and provide a more complete understanding of the class's design and behavior.  This level of detail is crucial for developers who will be using or maintaining this class.

To help me refine this further, could you tell me:

*   What is the overall purpose of this class within the larger system? (e.g., performance monitoring, analytics, debugging)
*   What technologies are being used (e.g., Node.js, Java, Python)? This will influence the specific data structures and concurrency mechanisms.

## Class MemorySchemaService

The MemorySchemaService is a core component designed to manage temporary in-memory data for individual sessions within the swarm system. It functions as a simple key-value store, utilizing a Map to associate each session’s unique identifier – represented as a `clientId` – with any arbitrary object. This service provides a lightweight, non-persistent memory layer, distinct from more robust storage or state management systems.

The service’s primary methods are `writeValue`, `readValue`, and `dispose`. `writeValue` allows you to store data for a session by merging a new value with any existing data associated with that `clientId`, logging the operation at an info level if configured. `readValue` retrieves the data associated with a `clientId`, returning an empty object if no data exists. Finally, `dispose` removes the session’s data from the memory map.

To ensure consistent logging, the service integrates with a `loggerService` injected via dependency injection, logging operations when `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` is true, mirroring the logging patterns of related services like `SessionConnectionService` and `PerfService`. This service is designed to support session-scoped runtime data, offering a flexible memory store for `ClientAgent` operations and aligning with the needs of `SessionPublicService` and `ClientAgent` workflows.

## Class LoggerService

The LoggerService provides centralized logging functionality throughout the AI agent swarm system. It implements the `ILogger` interface, enabling the recording of log, debug, and info messages with detailed context.  The service utilizes MethodContextService and ExecutionContextService to attach method-level and execution-level metadata, respectively, ensuring traceability across various components like ClientAgent, PerfService, and DocService.

Specifically, the LoggerService routes logs to both a client-specific logger (determined by GLOBAL_CONFIG.CC_GET_CLIENT_LOGGER_ADAPTER) and a common logger.  This allows for targeted logging based on the client and provides a fallback mechanism if client-specific logging is unavailable.

Key features include:

*   **Contextual Logging:**  The service leverages MethodContextService and ExecutionContextService to include relevant information like `clientId` in log messages.
*   **Runtime Customization:** The `setLogger` method allows for dynamic replacement of the common logger, offering flexibility for testing or advanced configurations.
*   **Configuration Control:** Logging behavior is governed by GLOBAL_CONFIG flags (e.g., `CC_LOGGER_ENABLE_DEBUG`, `CC_LOGGER_ENABLE_INFO`, `CC_LOGGER_ENABLE_LOG`) to control the level of logging enabled.
*   **Client-Specific Routing:**  The service intelligently routes logs to the appropriate client logger based on the client's identifier.

## Class LoggerInstance

The LoggerInstance is a core component designed to manage logging specifically for a particular client. It provides a flexible way to record events and messages, allowing for customization through callbacks.  The instance is initialized using a `clientId` to identify the client it’s serving, and configured with optional callbacks to tailor its behavior.

Key features include a `waitForInit` method that guarantees the logger is initialized only once, preventing redundant setup.  The `log`, `debug`, and `info` methods enable logging to the console, controlled by the GLOBAL_CONFIG to manage console output.  Furthermore, a `dispose` method ensures proper cleanup when the logger is no longer needed, triggering a callback if one is defined.  This component offers a robust and configurable logging solution within the swarm orchestration framework.


## Class HistoryPublicService

This `HistoryPublicService` class manages public history operations within the swarm system. It extends `THistoryConnectionService` to provide a public API for interacting with agent history. The service integrates with several key components, including `ClientAgent`, `AgentPublicService`, `PerfService`, and `DocService`.

Specifically, it utilizes a `loggerService` (injected via dependency injection) for logging operations, controlled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`. This logger is consistent with logging patterns used by `AgentPublicService` and `DocService`.

The core functionality is driven by the `historyConnectionService` (also injected via dependency injection), which handles the underlying history operations like pushing, popping, and converting history to arrays.

Key methods include:

*   `push`: This method pushes a message to the agent’s history, taking into account the client ID, method name, and agent name. It wraps the `HistoryConnectionService.push` call with `MethodContextService` for scoping and logging. It’s used in scenarios like `AgentPublicService`’s `commitSystemMessage` and `commitUserMessage` operations, and in `ClientAgent`’s `EXECUTE_FN` message logging.

*   `pop`: This method retrieves the most recent message from the agent’s history, again using `MethodContextService` and logging via the `loggerService`. It’s utilized in `ClientAgent`’s `EXECUTE_FN` context preparation and `AgentPublicService`’s history manipulation.

*   `toArrayForAgent`: This method converts the agent’s history into an array, incorporating a prompt for agent processing. It leverages `HistoryConnectionService.toArrayForAgent` with `MethodContextService` and logging. It’s used in `ClientAgent`’s `EXECUTE_FN` context preparation and `DocService`’s history documentation.

*   `toArrayForRaw`: This method converts the agent’s history into a raw array of items. It utilizes `HistoryConnectionService.toArrayForRaw` with `MethodContextService` and logging. It’s used in `ClientAgent`’s raw history access and `PerfService`’s performance metrics.

*   `dispose`: This method cleans up the agent’s history, releasing resources. It wraps `HistoryConnectionService.dispose` with `MethodContextService` and logging, aligning with `AgentPublicService` and `PerfService`’s disposal patterns.


## Class HistoryPersistInstance

The `HistoryPersistInstance` class provides a persistent history management system for AI agents. It stores message history in both memory and on disk, ensuring data is retained across agent restarts. 

The class is initialized with a client ID and a set of callback functions for handling events like message additions and removals.  It maintains an internal array to hold the message history and utilizes a persistent storage mechanism to store the data on disk.

Key functionalities include initializing the history for a specific agent, iterating through the history with optional filtering and callback invocation, adding new messages to the history while persisting them, removing and retrieving the last message, and disposing of the history instance. The `waitForInit` method ensures the history is properly initialized only once per agent, and the `iterate` method allows for efficient access to the historical data.  Callbacks are triggered during these operations to provide real-time updates.

## Class HistoryMemoryInstance

The HistoryMemoryInstance is a core component of the AI agent swarm orchestration framework, designed to manage an in-memory record of messages. It operates without persistent storage, focusing on immediate message tracking.

The class is initialized with a unique `clientId` and an optional set of callbacks, allowing for customization of behavior.  It internally maintains an array of `IModelMessage` objects.

A key feature is the `waitForInit` method, which ensures the history is properly initialized for a specific agent, loading any relevant initial data.  The `iterate` method provides an asynchronous iterator for accessing the history, applying configured filters and system prompts during the process and triggering callbacks if they are defined.

You can add new messages to the history using the `push` method, which also invokes callbacks upon addition.  Similarly, the `pop` method retrieves and removes the last message, again with callback support. Finally, the `dispose` method cleans up the history, clearing all data when no agent name is provided.

## Class HistoryConnectionService

The HistoryConnectionService manages history connections for agents within the swarm system. It implements the `IHistory` interface to provide a structured way to handle message storage, manipulation, and conversion, specifically scoped to a client ID and agent name. This service integrates with several other components, including ClientAgent (for history within agent execution), AgentConnectionService (for history provisioning), HistoryPublicService (for a public history API), SessionPublicService, and PerfService (for performance tracking via the BusService).

To optimize performance, the service utilizes memoization through functools-kit’s memoize, caching `ClientHistory` instances by a composite key (clientId-agentName). This ensures efficient reuse of history instances across multiple calls. The service leverages the LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) and coordinates with SessionValidationService for usage tracking and the BusService for event emission.

The `getHistory` method retrieves or creates a memoized `ClientHistory` instance, utilizing the memoized cache and integrating with SessionValidationService. It supports ClientAgent, AgentConnectionService, and HistoryPublicService. The `push` method adds a message to the agent’s history, delegating to `ClientHistory.push`, logging if enabled, and mirroring HistoryPublicService’s functionality. The `pop` method retrieves and removes the most recent message, also delegating to `ClientHistory.pop` with logging and mirroring HistoryPublicService. The `toArrayForAgent` method converts the agent’s history to an array, incorporating a prompt, and mirrors HistoryPublicService’s `toArrayForAgent`. The `toArrayForRaw` method converts the agent’s history to a raw array of messages, mirroring HistoryPublicService’s `toArrayForRaw`. Finally, the `dispose` method cleans up the history connection, clearing the memoized instance and updating SessionValidationService, with logging if enabled.

## Class EmbeddingValidationService

The EmbeddingValidationService is a core component of the swarm system, responsible for ensuring the integrity of embedding names. It maintains a central map of all registered embeddings and their associated schemas, guaranteeing uniqueness and verifying their existence. 

This service works closely with several other key systems: the EmbeddingSchemaService for initial registration, ClientStorage for validating embeddings used in similarity searches, and AgentValidationService for potential agent-specific checks. 

The service utilizes dependency injection to manage logging, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting, and employs memoization to optimize validation performance by caching checks based on the embedding name.  The `validate` function is the primary method for checking an embedding's presence, while the `addEmbedding` function registers new embeddings into the validation map.

## Class EmbeddingSchemaService

The EmbeddingSchemaService is the central component for managing embedding logic within the swarm system. It acts as a registry, storing and retrieving IEmbeddingSchema instances using a ToolRegistry for efficient management.  This service performs shallow validation of each schema, ensuring that required elements like `embeddingName`, `calculateSimilarity`, and `createEmbedding` functions are present and valid.

The service leverages a LoggerService for informational logging – enabled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` – during registration, retrieval, and validation processes, aligning with the logging patterns of other core services like StorageConnectionService.

It’s designed to support storage similarity searches by providing validated embedding schemas to services like StorageConnectionService and SharedStorageConnectionService.  The service maintains an immutable registry, updated primarily through the ToolRegistry’s `register` method, and provides a consistent collection of embedding definitions.  The `get` method retrieves a specific schema by its name, also logging operations when the logging configuration is enabled.

## Class DocService

The DocService is a core component responsible for generating and writing comprehensive documentation for the entire swarm system. It handles documentation for swarms, individual agents, and performance data, primarily outputting Markdown files. The service leverages a thread pool (THREAD_POOL_SIZE) to manage concurrent documentation generation, enhancing efficiency.

Key functionalities include:

*   **Schema Documentation:** It produces Markdown files detailing ISwarmSchema and IAgentSchema, alongside UML diagrams created using CC_FN_PLANTUML.
*   **Performance Data:** It utilizes PerfService to serialize performance metrics into JSON files, offering insights into system and client activity.
*   **Concurrency:** The thread pool (THREAD_POOL_SIZE) allows for parallel documentation generation, improving overall speed.
*   **Directory Structure:** Output is organized into a structured directory system (SUBDIR_LIST), facilitating easy navigation and understanding of the documentation.

The service relies on several injected dependencies, including:

*   **LoggerService:** Provides logging capabilities, controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO, for tracking documentation generation activities.
*   **PerfService:** Used for retrieving and serializing performance data.
*   **Validation Services:** Ensures only valid swarms and agents are documented.

The service offers several methods for generating documentation:

*   **dumpDocs:** Generates documentation for all swarms and agents, creating a nested directory structure and utilizing concurrent execution.
*   **writeSwarmDoc:** Creates Markdown documentation for a single swarm, including its schema, UML diagram, and agent details.
*   **writeAgentDoc:** Creates Markdown documentation for a single agent, encompassing its schema, UML diagram, prompts, tools, and other relevant information.
*   **dumpPerfomance:** Generates a JSON file containing system-wide performance data.
*   **dumpClientPerfomance:** Generates a JSON file containing performance data for a specific client.

These methods are designed to provide a complete and organized view of the swarm system, supporting developer understanding and system analysis.

## Class CompletionValidationService

The CompletionValidationService is a core component of the swarm system, responsible for ensuring the validity of completion names. It maintains a record of all registered completion names and diligently checks for their uniqueness during validation processes.

This service integrates seamlessly with several other key components: the CompletionSchemaService for initial registration, the AgentValidationService for agent-level checks, and the ClientAgent for completion usage.  It leverages dependency injection to manage logging, utilizing the loggerService for informational logging controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.

To efficiently manage validation, the service employs memoization, storing validation results for each completion name to avoid redundant checks. The `addCompletion` function registers new completion names, logging the operation and verifying uniqueness as part of the CompletionSchemaService’s workflow.  The `validate` function then performs the actual validation, logging the operation and confirming the completion name’s existence within the registered set, supporting the AgentValidationService’s broader validation needs.

## Class CompletionSchemaService

The CompletionSchemaService is the central component for managing completion logic within the swarm system. It acts as a registry, storing and retrieving ICompletionSchema instances using a ToolRegistry for efficient management. This service performs shallow validation of each schema, ensuring critical fields like the completion name and the associated getCompletion function are present and valid – a key requirement for seamless execution by ClientAgent, AgentConnectionService, and SwarmConnectionService.

The service utilizes a LoggerService for logging operations at the info level, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting, mirroring logging patterns used in other core services like AgentSchemaService and PerfService.  New completion schemas are registered via the `register` method, which validates the schema before adding it to the ToolRegistry.  Existing schemas are retrieved using the `get` method, providing the necessary completion logic for agents to execute within the swarm.  The registry itself is designed to be immutable once populated, updated solely through the ToolRegistry’s register method to maintain a consistent collection of completion schemas.

## Class ClientSwarm

The ClientSwarm class implements the `ISwarm` interface and manages a collection of agents within a swarm. It handles agent switching, output waiting, and navigation stack management, utilizing a BusService for event emission and queued operations.

Key features include:

*   **Agent Management:** The class manages agent references through `params.agentMap` and provides methods for updating these references using `setAgentRef`.
*   **Output Waiting:** The `waitForOutput` method waits for output from the active agent, delegating to a `WAIT_FOR_OUTPUT_FN` and handling cancellation and agent changes.
*   **Navigation Stack:** The `_navigationStack` tracks the sequence of agent names, managed through `navigationPop` (to remove agents) and `setNavigationStack` (to add/remove).
*   **Event Handling:**  The class uses a `_agentChangedSubject` to notify subscribers (like `waitForOutput`) of agent changes and a `_cancelOutputSubject` to interrupt output waits.

Methods:

*   `navigationPop()`: Removes the most recent agent from the navigation stack.
*   `cancelOutput()`: Cancels the current output wait by emitting an empty string via the `_cancelOutputSubject`.
*   `getAgentName()`: Retrieves the name of the active agent, lazily fetching it if not already loaded.
*   `getAgent()`: Retrieves the active agent instance (ClientAgent) based on its name.
*   `setAgentRef()`: Updates the reference to an agent in the swarm’s agent map, notifying subscribers.
*   `setAgentName()`: Sets the active agent, updates the navigation stack, and persists the change.

## Class ClientStorage

The ClientStorage class is a core component within the swarm system, responsible for managing data storage operations. It leverages embedding-based search to provide efficient data retrieval. This class implements `IStorage<T>`, offering functionalities like upsering, removing, clearing, and similarity-based searching.

Key aspects of the ClientStorage include its integration with several services: StorageConnectionService for instantiation, EmbeddingSchemaService for generating embeddings, ClientAgent for data persistence, SwarmConnectionService for swarm-level storage, and BusService for event emission.

The class utilizes an internal `_itemMap` (a Map) to store items quickly by their unique IDs, facilitating fast retrieval and updates.  A `dispatch` method queues storage actions (upserts, removes, clears) for sequential execution, ensuring thread-safe updates from the ClientAgent or other tools.

The `_createEmbedding` method is a memoized function that generates embeddings for items, caching results to avoid redundant calculations. This is managed via `CREATE_EMBEDDING_FN` and cleared when items are upsered or removed, guaranteeing fresh embeddings.  The `waitForInit` method waits for the storage to initialize, loading initial data and creating embeddings, using a `singleshot` mechanism to ensure initialization happens only once.

When performing similarity searches (`take`), the class concurrently executes calculations via `execpool`, respecting configuration settings (`GLOBAL_CONFIG.CC_STORAGE_SEARCH_POOL`).  It emits events via `BusService` to support the ClientAgent’s search-driven tool execution.

The `upsert`, `remove`, and `clear` methods queue these operations for sequential execution, supporting data persistence and reset operations. The `get` method provides a direct lookup of items from the `_itemMap` and emits events for quick access. The `list` method allows for listing all items, optionally filtered, and emits events for data enumeration. Finally, the `dispose` method cleans up resources, including invoking a disposal callback and logging via `BusService`.

## Class ClientState

The ClientState class is a core component of the swarm system, responsible for managing a single state object and facilitating its interactions within the swarm. It implements the `IState<State>` interface, providing a centralized location for state data, queued read and write operations, and middleware processing.

This class integrates seamlessly with several key services: StateConnectionService for state instantiation, ClientAgent to drive state-driven behavior, SwarmConnectionService for managing swarm-level state, and BusService for event-based communication.

The ClientState utilizes a `_state` property to hold the current state data, initially set to null and populated during the `waitForInit` process. The `dispatch` function allows for queued state updates, ensuring thread-safe operations and supporting concurrent access.

Key methods include `setState`, which updates the state using a provided dispatch function and persists the changes, and `clearState`, which resets the state to its default value. Both methods leverage BusService for event emission and support middleware processing.  The `waitForInit` function guarantees the state is initialized correctly, managing the lifecycle with StateConnectionService. Finally, the `dispose` method handles cleanup and resource release when the ClientState is no longer required.


## Class ClientSession

The ClientSession is the core component for managing interactions within the AI swarm system. It implements the `ISession` interface, handling message execution, emission, and agent interactions. The session relies on several services for its functionality, including ClientPolicy for validation, BusService for event-driven communication, and SessionConnectionService for instantiation and lifecycle management.

Key features of the ClientSession include:

*   **Message Emission:** Uses a `Subject` ( _emitSubject_) to stream validated messages to subscribers in real-time.
*   **Agent Execution:** Executes messages using the ClientAgent, leveraging the swarm’s agent infrastructure.
*   **Policy Enforcement:**  Validates messages through the ClientPolicy before execution.
*   **Service Integration:**  Works closely with SessionConnectionService, SwarmConnectionService, ClientAgent, ClientPolicy, and BusService.

Methods available within the ClientSession:

*   `emit(message: string)`: Emits a validated message to subscribers, triggering real-time updates.
*   `execute(message: string, mode: ExecutionMode)`: Executes a message using the ClientAgent, validating it with ClientPolicy and logging events via BusService.
*   `run(message: string)`: Executes a stateless message completion using the ClientAgent, logging execution via BusService.
*   `commitToolOutput(toolId: string, content: string)`: Commits tool output to the agent’s history, linking with ToolSchemaService.
*   `commitUserMessage(message: string)`: Commits a user message to the agent’s history without triggering a response.
*   `commitFlush()`: Clears the agent’s history, resetting the session state.
*   `commitStopTools()`: Signals the agent to stop subsequent tool executions.
*   `commitSystemMessage(message: string)`: Commits a system message to the agent’s history.
*   `commitAssistantMessage(message: string)`: Commits an assistant message to the agent’s history.
*   `connect(connector: SendMessageFn$1)`: Connects the session to a message connector, enabling real-time communication and message reception.
*   `dispose()`: Disposes of the session, performing cleanup and releasing resources.

## Class ClientPolicy

The ClientPolicy class implements the IPolicy interface, acting as a central component for managing security and restrictions within the AI agent swarm system. It handles client bans, carefully validating both incoming and outgoing messages to ensure compliance with swarm-level policies. 

This policy utilizes a lazy-loaded ban list, populated only when needed through the `hasBan` method, and integrates seamlessly with the `BusService` for event emission.  It interacts with the `PolicyConnectionService` for instantiation and the `SwarmConnectionService` to enforce restrictions defined in the `SwarmSchemaService`.

The `ClientPolicy` validates messages using the `validateInput` and `validateOutput` methods, automatically banning clients upon validation failure if configured to do so.  It leverages the `ClientAgent` for enhanced user feedback during validation and contributes to overall swarm security. 

Key functionalities include managing the `_banSet` – a dynamically updated collection of banned client IDs – and providing mechanisms for banning and unbanning clients via the `banClient` and `unbanClient` methods, respectively, all while utilizing the `BusService` for event notifications.

## Class ClientHistory

The ClientHistory class provides a robust mechanism for managing the conversation history of an agent within the swarm system. It implements the `IHistory` interface, offering storage, retrieval, and filtering of client messages.  This class integrates seamlessly with other system components, including the HistoryConnectionService for instantiation, the ClientAgent for logging and completion context, the BusService for event emission, and the SessionConnectionService for tracking session history.

Specifically, ClientHistory utilizes a filter condition, derived from GLOBAL_CONFIG.CC_AGENT_HISTORY_FILTER, to tailor message arrays based on agent-specific needs, applying limits and transformations to ensure relevant data is available.  The `push` method adds new messages to the history and triggers events via BusService, while the `pop` method removes and returns the most recent message.

The `toArrayForAgent` method is crucial for the ClientAgent, converting the history into a filtered and formatted array suitable for agent completions, incorporating prompts and system messages as needed.  Finally, the `dispose` method ensures proper resource management when the agent is being shut down, releasing resources and cleaning up the underlying history data.

## Class ClientAgent

The ClientAgent is a core component of the AI agent swarm system, designed to handle individual agent interactions. It manages the execution of messages, including tool calls, ensuring that operations are performed in a queued manner to prevent conflicts. This agent integrates with several services, such as the AgentConnectionService, HistoryConnectionService, and ToolSchemaService, to coordinate its actions within the swarm.

Key features of the ClientAgent include:

*   **Queued Execution:**  It utilizes functools-kit’s queued decorator to manage message execution, preventing overlapping operations and ensuring reliable processing.
*   **Error Recovery:** The agent incorporates a model resurrection mechanism (`_resurrectModel`) to handle failures during tool calls or completion requests, attempting to recover and continue execution.
*   **Event Emission:** It emits events and updates history through various subjects and services, facilitating communication within the swarm and providing a record of agent activity.
*   **Dynamic Agent Switching:** The agent supports dynamic agent switching within the swarm, allowing for flexible and adaptable agent behavior.

The ClientAgent provides methods for:

*   **Executing Messages:** The `execute` method processes incoming messages and tool calls, while the `run` method handles stateless completion requests.
*   **Managing History:** It emits outputs via `_emitOutput`, commits messages via `commitUserMessage`, `commitSystemMessage`, and `commitAssistantMessage`, and flushes history via `commitFlush`.
*   **Handling Tool Calls:** It commits tool outputs via `commitToolOutput` and signals agent changes via `commitAgentChange`, ensuring proper tool execution and management.
*   **Disposing Resources:** The `dispose` method cleans up resources and invokes an onDispose callback, ensuring proper shutdown.

## Class BusService

The BusService is the core component responsible for managing event communication within the swarm system. It implements the IBus interface, facilitating the subscription and emission of events between various system components. The service utilizes memoized Subject instances for optimized performance, reducing the overhead of creating and destroying Subjects for each event.

Key functionalities include subscribing to events from ClientAgents (e.g., monitoring execution events), emitting events to registered subscribers, and managing session validation to ensure events are only delivered to active clients. The BusService integrates with ClientAgent, PerfService, and DocService, leveraging the LoggerService for informational logging and the SessionValidationService for session integrity.

The `subscribe` method allows for the registration of event listeners for a specific client and event source, supporting wildcard subscriptions (clientId="*") to enable broad event distribution. The `once` method provides a mechanism for triggering a callback function only once when a specific event condition is met, useful for handling one-time events like ClientAgent awaiting execution completion.

The `emit` method is central to event propagation, broadcasting events to subscribers based on their source, including wildcard subscribers. It incorporates session validation and integrates with PerfService for execution tracking.  The `commitExecutionBegin` and `commitExecutionEnd` methods provide pre-defined event structures for execution-related events, streamlining event emission within the ClientAgent and PerfService. Finally, the `dispose` method cleans up all subscriptions for a given client, ensuring proper resource management and alignment with session termination processes.

## Class AliveService

The `AliveService` is responsible for tracking the online status of individual clients participating in a swarm. It offers methods to easily mark clients as either online or offline, directly within the swarm context.  The service utilizes a `PersistAliveAdapter` to reliably store these status changes, ensuring that the swarm always has an accurate view of its active members.  Specifically, the `markOnline` method allows you to designate a client as online, while `markOffline` designates it as offline. Both actions are logged for auditing and monitoring purposes, and persist the changes to storage based on global configuration settings.

## Class AgentValidationService

The AgentValidationService is a core component within the swarm system, responsible for ensuring the integrity and compatibility of agents. It manages agent schemas, tracks dependencies between agents, and validates associated resources like storage and states.

The service utilizes dependency injection to manage its internal components, including the LoggerService, ToolValidationService, CompletionValidationService, StorageValidationService, and AgentSchemaService.  It employs memoization techniques to optimize validation checks, improving performance by caching results based on agent names.

Key functionalities include registering new agents with their schemas, validating existing agents based on their configurations, and querying for associated resources.  A central map (_agentMap) stores agent schemas and dependency information, while another map (_agentDepsMap) tracks inter-agent dependencies.

The service provides methods for retrieving lists of registered agents, their associated storage names, and state names.  It also offers a robust validation method that checks an agent’s existence, completion status, tools, and storage configurations, delegating specific validation tasks to its integrated services.  Logging is handled through the LoggerService, with detailed operation logging enabled when info-level logging is active.  The service is designed to integrate seamlessly with other components like SwarmSchemaService and ClientStorage, providing a comprehensive validation framework for the swarm environment.

## Class AgentSchemaService

The AgentSchemaService is the core service responsible for managing all agent schemas within the swarm system. It acts as a central registry, utilizing the ToolRegistry from functools-kit to store and retrieve IAgentSchema instances.  This service performs shallow validation on each schema to ensure basic integrity – specifically checking that required fields like agentName, completion, and prompt are present, and that arrays for system, dependencies, states, storages, and tools contain unique string values.

The service integrates closely with other key components, including the AgentConnectionService for agent instantiation, the SwarmConnectionService for agent configuration, the ClientAgent for schema-driven execution, and the AgentMetaService for broader agent management.  A LoggerService is integrated to record information-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during schema registration, retrieval, and validation operations, aligning with the logging patterns of other services.

The service provides methods for registering new schemas – validating them first – and for retrieving existing schemas by their names.  These operations are fundamental to the swarm’s ability to define and manage the behavior of individual agents.


## Class AgentPublicService

The `AgentPublicService` class provides a public API for interacting with agent swarm operations. It implements `TAgentConnectionService` to manage agent interactions, delegating core functionality to `AgentConnectionService` and wrapping calls with `MethodContextService` for scoped operation management.  This service integrates with key components like `ClientAgent` (for agent creation and execution), `PerfService` (for performance tracking), `DocService` (for agent documentation), and `BusService` (for event propagation).  The service utilizes `LoggerService` for informational logging (controlled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`), supporting operations such as agent creation, execution, message commits (including system messages, assistant messages, and user messages), and disposal.

Key functionalities include creating agent references via `createAgentRef`, executing commands with `execute`, running stateless completions with `run`, waiting for output with `waitForOutput`, and committing tool outputs with `commitToolOutput`, system messages with `commitSystemMessage`, assistant messages with `commitAssistantMessage`, user messages with `commitUserMessage`, flushing agent history with `commitFlush`, committing agent changes with `commitAgentChange`, and stopping tools with `commitStopTools`.  The `dispose` method cleans up resources and aligns with performance tracking and event propagation.  The service leverages `MethodContextService` to ensure operations are properly scoped and tracked, and utilizes `LoggerService` for detailed logging and monitoring.

## Class AgentMetaService

The AgentMetaService is a core component of the swarm system, responsible for managing and visualizing agent metadata. It operates by building detailed or common agent nodes from agent schemas, utilizing the AgentSchemaService to retrieve this data.  The service then converts these nodes into UML format, which is crucial for documentation and debugging.

Specifically, it leverages a LoggerService for logging operations at the info level, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting.  It integrates with ClientAgent to access agent definitions and with PerfService to provide context for performance analysis.

Key methods include `makeAgentNode`, which creates detailed agent nodes with dependencies and states, and `makeAgentNodeCommon`, which focuses on dependency relationships.  The `toUML` method then converts these nodes into a UML string, often used by DocService to generate agent diagrams like `agent_schema_[agentName].svg`.  The service utilizes a `seen` set within these methods to prevent infinite loops when building the agent node trees.

## Class AgentConnectionService

This is an excellent and thorough breakdown of the `ClientAgent` class's functionality. You've accurately described the purpose of each method and how it interacts with the underlying `ClientAgent` implementation. Here's a summary of the key takeaways and some potential areas for further clarification or expansion:

**Key Strengths of Your Breakdown:**

* **Comprehensive Coverage:** You've covered every method and its intended behavior.
* **Clear Descriptions:** The explanations are concise and easy to understand.
* **Contextualization:** You've correctly linked each method to its corresponding `ClientAgent` counterpart and the broader system (e.g., `SessionPublicService`, `HistoryPublicService`).
* **Logging and Lifecycle:** You've highlighted the importance of logging and the lifecycle management aspects (dispose, caching).

**Potential Areas for Clarification/Expansion:**

1. **Memoization Cache:** You correctly mention the memoization cache.  It would be beneficial to elaborate slightly on *why* this is used.  It's a key optimization – avoiding redundant object creation and ensuring consistent behavior when the same agent is requested multiple times.  You could add a sentence like: "The memoization cache ensures that a single `ClientAgent` instance is used for subsequent requests, improving performance and maintaining a consistent state."

2. **`commitToolOutput`, `commitSystemMessage`, `commitAssistantMessage`, `commitUserMessage`, `commitFlush`, `commitStopTools` -  The Role of History:** These methods are central to the agent's conversational memory.  Adding a brief explanation of *why* these are committed to the history would be valuable.  For example: "These methods commit the agent's interactions to the history, allowing the agent to maintain context across multiple turns of a conversation and enabling features like conversational memory and state tracking."

3. **`dispose` - More Detail on Cache Clearing:** You correctly state that the `dispose` method clears the cache.  It might be helpful to add a detail about *how* the cache is cleared.  Is it a simple deletion from a map?  Is there any cleanup associated with the underlying `ClientAgent` object?

4. **Error Handling:**  The description doesn't touch on error handling.  It's a crucial aspect of any API.  How does the `ClientAgent` handle errors from the underlying `ClientAgent` implementation?  Does it propagate errors up the chain, or does it provide a specific error response?

5. **Asynchronous Operations:**  The methods are all asynchronous (indicated by the `Promise` return types).  It would be helpful to briefly mention the underlying mechanism for handling asynchronous operations – callbacks or promises used by the `ClientAgent` implementation.

6. **`commitAgentChange` -  Relationship to SwarmPublicService:** You correctly note its potential connection to `SwarmPublicService`.  Expanding on this would be beneficial.  This method controls the agent's overall state and navigation, potentially directing it to different tasks or workflows.

**Revised Snippet Incorporating Suggestions (Focusing on `dispose` and `commitToolOutput`):**

“The `dispose` method ensures proper cleanup of the agent connection, clearing the memoized instance from the cache to prevent resource leaks and ensuring consistent behavior across multiple requests.  It checks if the agent exists in the memoization cache before calling `ClientAgent.dispose`, then clears the cache (by removing the entry from a map). Logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligns with AgentPublicService’s dispose and PerfService’s cleanup.

The `commitToolOutput`, `commitSystemMessage`, `commitAssistantMessage`, `commitUserMessage`, `commitFlush`, and `commitStopTools` methods commit the agent’s interactions to the history, allowing the agent to maintain context across multiple turns of a conversation and enabling features like conversational memory and state tracking.  These commits are typically handled asynchronously, using callbacks or promises to ensure efficient communication with the underlying `ClientAgent` implementation.”

**Overall:**

Your breakdown is excellent.  Adding a few more details about the underlying mechanisms and the rationale behind certain design choices would make it even more comprehensive and valuable.  This level of detail is exactly what's needed for understanding and maintaining this complex system.  Do you want me to elaborate on any specific aspect, such as the caching mechanism or the asynchronous operations?

## Class AdapterUtils

The AdapterUtils class offers a flexible way to connect to different AI completion services. It provides utility functions, each designed to interact with a specific provider.

Specifically, it includes:

*   **fromOpenAI:** This function creates a callable that allows you to utilize OpenAI’s chat completions API. You can specify the model and response format for your requests.
*   **fromLMStudio:**  This function generates a function to interact with LMStudio’s chat completions API, mirroring the functionality of the OpenAI adapter.
*   **fromOllama:** This adapter creates a function to communicate with Ollama’s chat completions API.  You can also configure the tool call protocol used by Ollama.

These adapters provide a consistent interface for interacting with these different AI models.


# agent-swarm-kit interfaces

## Interface IToolCall

The IToolCall interface represents a specific request made by an AI agent within the swarm system. It’s essentially a single execution of a tool, triggered by the model’s output.  

Each IToolCall has a unique identifier, like "tool-xyz123," which helps track the tool’s execution and link its results back to the original request.

The IToolCall also contains details about the tool itself, including its name and any required arguments, which are derived from the model’s output.  

Currently, all IToolCalls are of type "function," reflecting the swarm’s design of using callable functions as tools.  Agents use these IToolCall details to execute the tools, generate events like confirming a tool’s output, and record the interaction in the system’s history.

## Interface ITool

The ITool interface is a core component of the swarm system, acting as a blueprint for each available tool. It defines everything the agents need to know about a specific function – what it’s called, what it does, and what inputs it expects. 

Essentially, an ITool specifies the details of a callable tool, including its name, a description of its purpose, and a precise schema for its parameters. This schema dictates the data types and requirements for any input the tool needs.

The ITool information is integrated into the IAgentParams, specifically within the `tools` property, and is then passed to the `ICompletion.getCompletion` method. This allows the model to generate the correct `IToolCall` requests based on the defined tool specifications. The `function` property within the ITool is particularly important, as it’s matched against the `IToolCall.function` during execution, ensuring the correct tool is invoked.

## Interface ISwarmSessionCallbacks

The `ISwarmSessionCallbacks` interface defines a set of callbacks that allow you to respond to various events happening within a swarm session. These callbacks provide hooks for handling key moments like when a client connects, when a command is executed, or when a message is emitted.

Specifically, you can use the `onConnect` callback to perform actions when a new client joins the swarm, such as logging the connection or running initial setup. The `onExecute` callback is triggered each time a command is run, and the `onRun` callback is invoked for stateless completion runs.  

Furthermore, the `onEmit` callback lets you react to messages sent from the swarm, and the `onInit` and `onDispose` callbacks handle the session’s initialization and disconnection events, respectively.  This flexible system enables you to integrate custom logic directly into your swarm orchestration workflow.

## Interface ISwarmSchema

The ISwarmSchema interface defines the structure for creating and managing an AI agent swarm. It allows you to configure the swarm’s behavior, including how agents navigate and how they are managed.

Key features include:

*   **Configuration:** You can set options like enabling persistent storage of navigation stacks and defining access control policies using a list of policy names.
*   **Navigation Control:**  The schema provides functions to retrieve the initial navigation stack and to persist changes to it.
*   **Agent Management:**  It offers a mechanism to select the active agent within the swarm, defaulting to a specified agent if none is explicitly chosen.
*   **Customization:**  You can integrate lifecycle callbacks to respond to events during the swarm’s operation.

The schema also includes the swarm’s unique name and a list of available agent names within the swarm.

## Interface ISwarmParams

The `ISwarmParams` interface defines the configuration needed to create a new AI agent swarm. It builds upon the core swarm schema, adding flexibility for runtime adjustments.  This interface specifies essential details like a unique client ID, a logger for tracking activity and errors, and a bus for communication between agents.  Crucially, it includes a dynamic map, `agentMap`, which allows you to store and access individual agent instances by their names during the swarm’s operation. This `agentMap` provides a convenient way to manage and interact with the agents within the swarm.


## Interface ISwarmConnectionService

The `ISwarmConnectionService` interface acts as a specific type definition, building upon the broader `SwarmConnectionService`. Its primary purpose is to clearly delineate the public-facing aspects of a swarm connection service. By excluding any internal keys, it guarantees that the `SwarmPublicService` aligns precisely with the operations accessible to external users or systems, promoting a clean and well-defined API.

## Interface ISwarmCallbacks

The ISwarmCallbacks interface provides a set of functions to manage and monitor the lifecycle of an AI agent swarm. It builds upon standard session callbacks and adds specific functionality for tracking agent activity.

The primary callback, `onAgentChanged`, is triggered whenever the currently active agent within the swarm shifts. This allows you to react to navigation changes or update your application state based on the agent's location and identity.  The callback receives the agent's unique ID, its assigned name, and the name of the swarm it belongs to.


## Interface ISwarm

The ISwarm interface provides a central control point for managing a group of AI agents. It offers a suite of methods to handle the agents’ movement and activity. Primarily, the `navigationPop` method allows you to remove and retrieve the most recent agent from the swarm’s navigation stack, or to default to a predefined agent if needed.  You can also cancel any ongoing output operations using `cancelOutput`, which guarantees an empty string is returned when calling `waitForOutput`. This method waits for and returns the output generated by the currently active agent.  Furthermore, the interface provides ways to identify the active agent through `getAgentName` and retrieve the agent instance itself with `getAgent`. Finally, `setAgentRef` is used to register or update agent references within the swarm, and `setAgentName` allows you to designate a specific agent as the active one, triggering any necessary navigation adjustments.

## Interface IStorageSchema

The `IStorageSchema` interface defines the configuration for how a storage instance operates within the AI agent swarm. It controls aspects like whether data is saved persistently, how the storage is accessed, and how it’s indexed for searching.

Key settings include a `persist` flag to enable or disable saving data to a hard drive, a `storageName` to uniquely identify the storage within the swarm, and an `embedding` to specify the indexing mechanism.

You can customize storage behavior with optional functions like `getData` and `setData`, which allow you to override the default data retrieval and persistence methods.  A `callbacks` section provides a way to respond to storage events, and a `getDefaultData` function is used during persistence to provide initial data. Finally, the `createIndex` function generates unique identifiers for each stored item, facilitating efficient searching.

## Interface IStorageParams

The `IStorageParams` interface defines the runtime settings for managing storage within the AI agent swarm. It builds upon the core storage schema, adding details specific to each client and their associated embeddings.

Key features include:

*   **`clientId`**: A unique identifier for the client using this storage instance.
*   **`calculateSimilarity`**: A function that computes the similarity between embeddings, crucial for search functionality.
*   **`createEmbedding`**: A function used to generate embeddings for storage items, enabling indexing.
*   **`storageName`**: The unique name of the storage, provided for clarity within the swarm’s organization.
*   **`logger`**: An ILogger instance to track storage operations and any encountered errors.
*   **`bus`**: An IBus instance facilitating communication and event handling across the swarm.

## Interface IStorageData

The `IStorageData` interface outlines the basic structure of data stored within the orchestration framework. It establishes the essential properties that all storage items must have.  Each item is identified by a unique `id`, which is of type `StorageId` and is used for retrieving and deleting the data. This interface ensures a consistent format for all stored data, facilitating efficient management and retrieval within the swarm orchestration system.

## Interface IStorageConnectionService

The `IStorageConnectionService` interface acts as a specific type definition, building upon the broader `StorageConnectionService`. Its primary purpose is to precisely define `TStorageConnectionService` while intentionally omitting any internal implementation details. This ensures that the `StoragePublicService` remains focused solely on the public-facing operations, providing a clean and well-defined contract for external interactions.

## Interface IStorageCallbacks

The `IStorageCallbacks` interface defines a set of callbacks that allow you to react to various events related to the storage system. These callbacks provide hooks for handling updates to the stored data – triggered whenever items are added, removed, or modified. You can also use them to monitor search operations as they occur.

Specifically, the interface offers the following callbacks:

*   **onUpdate:** This callback is invoked when storage data changes. It receives the updated item list, the client ID, and the storage name, enabling you to log these changes or synchronize your application's state.
*   **onSearch:**  This callback is triggered during a search operation on the storage, providing you with the search query and the index of the search results.
*   **onInit:**  This callback is executed when the storage is initialized, offering a chance to perform setup tasks or log initialization details.
*   **onDispose:**  This callback is called when the storage is being disposed of, allowing you to perform any necessary cleanup or logging before the storage is released.

## Interface IStorage

The IStorage interface provides a core API for managing data within the AI agent swarm orchestration framework. It offers a set of methods to interact with the underlying storage, allowing you to retrieve, modify, and delete items.

Specifically, the `take` method enables similarity-based retrieval of items from the storage, using embeddings to find relevant results based on a search query and a specified total count. The `upsert` method handles both inserting new items and updating existing ones, ensuring the index is kept synchronized.  You can also use `remove` to delete items by their unique ID, and `get` to retrieve a single item based on its ID.

Furthermore, the `list` method provides a way to retrieve all items in the storage, with the option to filter them using a custom predicate. Finally, the `clear` method resets the entire storage to an empty state, persisting any changes that have been made.

## Interface IStateSchema

The `IStateSchema` interface is central to managing the state of individual agents within the swarm. It defines how each state is configured and how it behaves.

Key aspects of the `IStateSchema` include:

*   **`persist`**:  This boolean flag controls whether the state’s values are saved persistently, like to a hard drive, allowing states to retain information between agent restarts.
*   **`docDescription`**:  A descriptive string that can be used for documentation, helping to clarify the purpose and usage of a particular state.
*   **`shared`**:  When set to `true`, this flag indicates that the state can be accessed and modified by multiple agents within the swarm.
*   **`stateName`**:  This unique string identifies the state within the entire swarm, ensuring each state has a distinct name.
*   **`getDefaultState`**:  A function that provides the initial state value for a given state and client ID. It can return a pre-defined default or compute the state value dynamically.
*   **`getState`**:  An optional function that allows you to retrieve the current state value, potentially overriding the `getDefaultState` if a specific state needs to be fetched differently.
*   **`setState`**:  An optional function to update the state, offering a way to modify the state value and providing flexibility in how updates are handled.
*   **`middlewares`**:  An array of middleware functions that can be applied to the state during various lifecycle operations, allowing for pre-processing or post-processing of state data.
*   **`callbacks`**:  A partial set of lifecycle callbacks that enable you to customize events related to the state’s creation, update, or destruction, providing granular control over state management.

## Interface IStateParams

The `IStateParams` interface defines the runtime settings needed for managing state within the AI agent swarm. It builds upon a core state schema, adding details specific to each individual client.

Key properties include:

*   **clientId:** A unique string identifying the client to which this state instance belongs.
*   **logger:** An `ILogger` instance used to track state operations and any errors that occur.
*   **bus:** An `IBus` object facilitating communication between agents via events. This allows the swarm to coordinate actions based on state changes.

## Interface IStateMiddleware

The `IStateMiddleware` interface provides a flexible way to manage and control the state of your AI agent swarm. It acts as a central point where you can insert custom logic to modify or validate the state at different stages of the swarm’s lifecycle. This allows you to enforce rules, update data, or perform other necessary operations as agents interact and the swarm evolves. It’s designed to be easily integrated into the orchestration framework, offering a robust mechanism for maintaining consistent and reliable state.

## Interface IStateConnectionService

The `IStateConnectionService` interface serves as a type definition, specifically designed to refine the `StateConnectionService` interface. Its primary purpose is to create a more focused version, `StatePublicService`, by intentionally omitting any internal keys. This ensures that the public-facing operations of the system are clearly defined and don’t expose any underlying implementation details. It’s a mechanism for creating a cleaner, more manageable API.

## Interface IStateCallbacks

The `IStateCallbacks` interface defines a set of functions that allow you to react to key events within the AI agent swarm’s state management system. These callbacks provide hooks for managing the lifecycle of a state, offering control during initialization, when the state is being cleaned up, and whenever the state is loaded or modified.

Specifically, you can use the `onInit` callback to perform setup tasks or log information when a state is first created. The `onDispose` callback is triggered when a state is being removed, providing an opportunity for cleanup.  The `onLoad` callback is invoked when the state is retrieved, and the `onWrite` callback is executed whenever the state is updated or saved.  These functions give you fine-grained control over how the swarm’s state is handled.

## Interface IState

The IState interface is the core of the framework’s runtime state management. It offers a straightforward way to access, modify, and reset the application’s state.

You can use the `getState` method to retrieve the current state value. This method intelligently handles any configured middleware and custom logic defined within the schema.

To update the state, the `setState` method is used. This method requires a dispatch function, which takes the previous state and returns the new state. Like `getState`, it incorporates middleware and custom logic.

Finally, the `clearState` method provides a way to completely reset the state back to its initial default value, as defined in the schema’s `getDefaultState` property.

## Interface ISharedStorageConnectionService

This interface, ISharedStorageConnectionService, acts as a blueprint for defining a connection to shared storage. It’s specifically designed to represent the public-facing aspects of a shared storage connection. By excluding internal details, it ensures that the SharedStoragePublicService interface accurately reflects the operations available to external users and applications – focusing solely on the public-facing functionality.

## Interface ISharedStateConnectionService

This interface, ISharedStateConnectionService, acts as a specific type definition. It builds upon the broader SharedStateConnectionService, but crucially, it excludes any internal keys. This design ensures that the resulting type, TSharedStateConnectionService, accurately represents only the public-facing operations and data exposed by the SharedStatePublicService. It’s a focused type definition for clarity and consistency.

## Interface ISessionSchema

The `ISessionSchema` interface defines the structure for data associated with individual sessions.  Right now, it’s intentionally empty – this is a placeholder designed to accommodate future session-specific configurations.  As the framework evolves, this interface will hold details like agent roles, task priorities, and any other data needed to manage a particular session’s operation. It’s a foundational element for extending the framework’s capabilities to handle diverse session requirements.

## Interface ISessionParams

The `ISessionParams` interface defines the essential configuration needed to establish a session within the AI agent swarm orchestration framework. It bundles together the core session details, including the client’s unique identifier, a logging component for tracking activity and errors, and a policy object that governs the session’s behavior.  Furthermore, it incorporates the swarm instance itself, providing access to the swarm’s management capabilities, and the swarm’s name for identification. This comprehensive set of parameters ensures that each session is properly initialized and integrated within the overall swarm environment.

## Interface ISessionContext

The `ISessionContext` interface is a core component of the AI agent swarm orchestration framework. It acts as a container, holding all the necessary information for managing a single agent's activity within the swarm.  Essentially, it provides a snapshot of the agent's current state.

This context includes details about the agent itself, identified by its `clientId`, and the specific method it’s currently executing, if any.  Furthermore, it contains the `executionContext`, which tracks the progress and details of the current execution.  This layered approach allows the framework to intelligently manage and coordinate the actions of the swarm.


## Interface ISessionConnectionService

The `ISessionConnectionService` interface acts as a type definition, specifically designed to ensure consistency when working with the `TSessionConnectionService`. It’s used to precisely define the `TSessionConnectionService` type while intentionally omitting any internal implementation details. This approach guarantees that the public-facing operations, represented by `SessionPublicService`, remain focused solely on the externally visible aspects of the service.

## Interface ISessionConfig

The `ISessionConfig` interface defines the settings for managing individual sessions within an AI agent swarm. It’s designed to control how often or when a session should run, offering flexibility for scheduling tasks.

A key property is `delay`, which specifies the duration, in milliseconds, that a session should pause before executing again. This allows you to implement rate limiting or create staggered execution patterns for your swarm’s activities.


## Interface ISession

The `ISession` interface represents a core component within the AI agent swarm orchestration framework. It provides a structured way to manage interactions and computations within a single agent’s context.

Key functionalities include sending messages to the session via the `emit` method, allowing for both regular communication and the execution of stateless commands using the `run` method.  The `execute` method offers more control, enabling command execution with the ability to update the session’s chat history based on specified modes.

To manage the session’s state, you can commit messages to the history without triggering a response using `commitUserMessage` and `commitAssistantMessage`.  Additionally, you can flush the agent history entirely with `commitFlush`, and prevent the next tool from running with `commitStopTools`.

The `connect` method establishes a bidirectional communication channel, returning a receiver function to handle incoming messages. Finally, the `commitToolOutput` method allows you to record the output of specific tools within the session’s history or state.

## Interface IPolicySchema

The `IPolicySchema` interface defines the structure for configuring policies within the AI agent swarm. It’s the core mechanism for enforcing rules and managing bans across the swarm.

Key aspects of the schema include:

*   **`docDescription`**: An optional field for providing a clear description of the policy, aiding in understanding its purpose.
*   **`policyName`**: A unique identifier for the policy, ensuring it can be referenced consistently within the swarm.
*   **`banMessage`**:  A default message displayed when a client is banned, which can be customized using the `getBanMessage` function.
*   **`autoBan`**: A flag that automatically bans a client upon failing validation checks.
*   **`getBanMessage`**:  A function allowing you to dynamically generate a ban message based on the client ID, policy name, and swarm name.
*   **`getBannedClients`**:  A function to retrieve the list of currently banned clients associated with the policy.
*   **`setBannedClients`**: A function to manage the list of banned clients, providing an alternative to the default ban management.
*   **`validateInput`**:  An optional function for custom validation of incoming messages, allowing you to define specific rules for message content.
*   **`validateOutput`**: An optional function for validating outgoing messages, ensuring they adhere to policy constraints.
*   **`callbacks`**:  A flexible mechanism for handling policy events, enabling you to customize validation and ban actions through a set of callbacks.

## Interface IPolicyParams

The `IPolicyParams` interface defines the settings needed to create and configure a policy within the AI agent swarm orchestration framework. It builds upon the core policy schema, allowing you to include dynamic information and fully utilize callback functions for flexible behavior.

Key components of this interface include:

*   **logger:** This property specifies the logger instance. The logger is used to track and log policy-related events and any errors that occur during execution, providing valuable insights into the policy’s operation.
*   **bus:** This property designates the bus instance. The bus facilitates communication between agents within the swarm through event-driven messaging, enabling coordinated actions and responses.

## Interface IPolicyConnectionService

The `IPolicyConnectionService` interface acts as a specific type definition, building upon the broader `PolicyConnectionService`. Its primary purpose is to precisely define `TPolicyConnectionService` while intentionally omitting any internal details. This ensures that the `PolicyPublicService` remains focused solely on the public-facing operations, providing a clear and controlled interface for external interactions.

## Interface IPolicyCallbacks

The `IPolicyCallbacks` interface defines a set of callbacks that allow you to react to key events during the lifecycle of an AI policy. These callbacks provide hooks for managing the policy’s initialization, ensuring its inputs are valid, and handling actions like banning or unbanning clients.

Specifically, you can use the `onInit` callback to perform setup tasks or log information when the policy is initialized. The `onValidateInput` callback lets you monitor and validate incoming messages, while `onValidateOutput` provides a similar function for outgoing messages. Finally, the `onBanClient` and `onUnbanClient` callbacks enable you to track and respond to client banning and unbanning events, respectively. These callbacks offer a flexible way to integrate custom logic into the swarm orchestration framework.

## Interface IPolicy

The `IPolicy` interface defines the core logic for controlling interactions within the AI agent swarm. It acts as a central enforcement point, responsible for managing client bans and ensuring all messages – both incoming and outgoing – adhere to the swarm’s established rules.

Key functionalities include:

*   **`hasBan`**:  This method checks if a specific client is currently banned, given the swarm’s name.
*   **`getBanMessage`**: If a ban exists, this retrieves the corresponding ban message for the client.
*   **`validateInput`**:  It validates incoming messages from agents, preventing potentially harmful or invalid data from entering the swarm.
*   **`validateOutput`**: This method ensures that outgoing messages from agents comply with the policy’s rules before they are transmitted.
*   **`banClient`**:  This function adds a client to the banned list, effectively blocking their participation in the swarm.
*   **`unbanClient`**: Conversely, this removes a client from the banned list, restoring their access to the swarm.

## Interface IPersistSwarmControl

The `IPersistSwarmControl` interface provides a flexible way to manage the persistence of your AI agent swarm. It allows you to tailor how active agents and navigation stacks are stored, giving you control over the underlying data adapters.

Specifically, the `usePersistActiveAgentAdapter` method lets you define a custom adapter for storing information about active agents. Similarly, `usePersistNavigationStackAdapter` enables you to specify a custom adapter for managing the navigation stack data. This customization is key to integrating the swarm orchestration framework with your specific storage solutions and data models.


## Interface IPersistStorageData

This interface, `IPersistStorageData`, provides a way to manage and save your storage data persistently. It essentially acts as a container, holding an array of your storage data.  The core functionality revolves around the `data` property, which is an array (`T[]`) that holds all the data you want to keep track of. This allows you to easily store and retrieve your data, ensuring it remains available even after your application restarts.


## Interface IPersistStorageControl

The `IPersistStorageControl` interface provides a way to manage how your agent swarm’s data is persistently stored. It gives you the flexibility to tailor the storage process by allowing you to specify a custom persistence adapter. 

Specifically, the `usePersistStorageAdapter` method lets you inject your own adapter class, ensuring your swarm’s data is handled according to your specific needs and storage requirements. This method accepts a constructor function for the adapter class, providing a powerful mechanism for customization.

## Interface IPersistStateData

This interface, `IPersistStateData`, provides a standardized way to manage and save your AI agent swarm’s state information. It acts as a wrapper, ensuring that the underlying state data is consistently formatted for storage.  The core of the interface is the `state` property, which holds the actual state data itself – represented by the type `T`. This allows for flexible storage of complex state information within your swarm orchestration framework.

## Interface IPersistStateControl

The `IPersistStateControl` interface provides a way to manage how your agent swarm’s state is saved and retrieved. It gives you the flexibility to tailor the persistence process by allowing you to specify a custom adapter.

Specifically, the `usePersistStateAdapter` method lets you replace the default persistence logic with your own implementation. This is useful if you need to change where the state is stored, how it’s formatted, or any other aspect of the persistence process.  You pass in a constructor for the adapter class, which then handles the state saving and loading operations.

## Interface IPersistPolicyData

The `IPersistPolicyData` structure is designed to manage persistent policy information within the AI agent swarm system. It focuses on tracking which clients are banned under a particular policy. Specifically, it maintains a list of `SessionId` values that have been flagged as banned, all associated with a given `SwarmName` and a specific policy. This allows the swarm to consistently remember and enforce bans across multiple runs and deployments. The core of this data is represented by the `bannedClients` property, which is an array of strings – each string representing a SessionId.

## Interface IPersistPolicyControl

The `IPersistPolicyControl` module provides tools to manage how policy data is saved and retrieved. It gives you the ability to tailor the persistence process by injecting a custom adapter. This adapter is specifically designed to handle policy data linked to a `SwarmName`.

The core functionality is achieved through the `usePersistPolicyAdapter` method.  This method lets you replace the standard `PersistBase` implementation with your own, allowing you to implement specialized behaviors, such as keeping track of policy data directly within memory for a particular swarm.  Essentially, it offers flexibility in how your swarm’s policies are persistently stored.


## Interface IPersistNavigationStackData

This interface, `IPersistNavigationStackData`, provides a way to manage and store information related to the navigation history of an AI agent swarm. It’s designed to track the sequence of agents that have been active within the swarm’s operations.

The core component of this interface is the `agentStack` property. 

*   `agentStack`: This is a string array that holds the names of the agents, representing the order in which they were navigated through. Essentially, it’s a record of the swarm’s activity trail.


## Interface IPersistMemoryData

This interface, `IPersistMemoryData`, provides a standardized way to store and retrieve memory data. It acts as a wrapper, ensuring that all memory data is consistently formatted for storage. 

The core of the interface is the `data` property, which holds the actual memory data itself. This allows for flexible storage and retrieval, regardless of the underlying data format.  Essentially, it’s a container designed to manage the persistent storage of your memory data.


## Interface IPersistMemoryControl

The `IPersistMemoryControl` interface provides a way to manage how memory is persistently stored. It offers control over the underlying persistence adapter, allowing you to tailor the storage mechanism to your specific needs.

Specifically, the `usePersistMemoryAdapter` method lets you inject a custom adapter – defined by the `TPersistBaseCtor<string, IPersistMemoryData<unknown>>` type – to handle memory persistence. This gives you flexibility in choosing and configuring the storage system.


## Interface IPersistEmbeddingData

The `IPersistEmbeddingData` interface outlines how embedding data is stored within the AI agent swarm. It’s designed to manage numerical representations – specifically, embedding vectors – associated with unique string identifiers.  

The core of this interface is the `embeddings` property, which is an array of numbers.  Each number in this array represents a component of the embedding vector, providing a compact numerical representation of the original string data. This allows the swarm to efficiently store and retrieve these embeddings for later analysis or use.


## Interface IPersistEmbeddingControl

The `IPersistEmbeddingControl` class provides tools to manage how embedding data is saved and retrieved. It gives you the ability to tailor the embedding persistence process.

Specifically, the `usePersistEmbeddingAdapter` method lets you inject a custom adapter. This adapter can be used to modify how data associated with an `EmbeddingName` is stored.

You can use this method to replace the standard `PersistBase` implementation with a custom one. This is useful if you need specific behavior, like keeping track of embeddings in memory, perhaps tied to a `SwarmName`.

## Interface IPersistBase

The `IPersistBase` interface establishes a foundational set of methods for managing persistent data storage. It provides core functionality for interacting with a storage system.

Specifically, the `waitForInit` method handles the initial setup of the storage directory, automatically creating it if it doesn't exist and then ensuring all existing data is valid by removing any corrupted or outdated entries.

The `readValue` method allows you to retrieve a specific entity from storage using its unique identifier.

Furthermore, the `hasValue` method efficiently checks whether an entity with a given ID is currently present in the storage.

Finally, the `writeValue` method enables you to save or update an entity in storage, associating it with a particular ID.

## Interface IPersistAliveData

The `IPersistAliveData` interface outlines how the swarm system keeps track of client availability. It focuses on maintaining a record of whether a specific client, identified by its `SessionId`, is currently active or inactive within a particular `SwarmName`.  

The core of this interface is the `online` property, a boolean value.  When set to `true`, it signifies that the client represented by the `SessionId` is considered online. Conversely, a value of `false` indicates that the client is offline. This persistent status information is crucial for the swarm's coordination and decision-making processes.


## Interface IPersistAliveControl

The `IPersistAliveControl` module provides tools to manage how the alive status of swarm agents is tracked and stored. It offers a flexible way to customize this process.

Specifically, the `usePersistAliveAdapter` method lets you inject a custom persistence adapter. This adapter is designed to handle the storage of alive status information linked to a specific `SwarmName`.

You can use this method to replace the standard `PersistBase` implementation with a tailored solution, such as one that keeps track of alive status in memory for improved performance or specific tracking needs.


## Interface IPersistActiveAgentData

This interface, `IPersistActiveAgentData`, defines the structure for data that’s being saved and retrieved for active agents within the orchestration framework. It’s designed to hold information about each agent.

The core property is `agentName`, which is a string. This string uniquely identifies the active agent to which the data pertains.  Essentially, it’s a simple way to store and access details related to a specific agent that’s currently part of the swarm’s operation.


## Interface IPerformanceRecord

This interface, IPerformanceRecord, is designed to track the operational efficiency of processes within the swarm system. It aggregates performance data from multiple clients – like individual agent sessions – to provide a system-wide view.

The record contains a unique `processId` that identifies the specific execution context, such as a ClientAgent workflow.  It includes an array of `clients`, where each entry represents the performance metrics for a single client involved in the process.

Key metrics tracked include `totalExecutionCount`, which counts the total number of times a process executed, and `totalResponseTime`, representing the cumulative response time across all clients, formatted for easy readability.  The `averageResponseTime` provides a normalized view of typical response latency.

To aid in tracking events over time, the record also stores a `momentStamp` – a coarse timestamp representing the date of the record – and a `timeStamp` – a more precise timestamp within the day. Finally, a `date` field stores the date and time of the record in a standard UTC string format.  This allows for comprehensive monitoring and diagnostics of the swarm’s performance.

## Interface IPayloadContext

The `IPayloadContext` interface outlines the structure for managing data related to an AI agent’s task. It’s designed to hold both the actual data being processed and information about where it came from.

Specifically, each `IPayloadContext` includes:

*   **`clientId`**: A unique string identifying the client that originated this context. This allows tracking and potentially managing requests from different sources.
*   **`payload`**:  This property contains the actual data, defined by a generic type called `Payload`. This `Payload` type ensures consistent data handling across the framework.

## Interface IOutgoingMessage

The IOutgoingMessage interface defines how messages are sent out from the swarm system. It represents a message directed to a client, often an agent’s response or output. 

This interface encapsulates three key pieces of information: the `clientId`, which uniquely identifies the client receiving the message – matching the `clientId` specified in the message parameters; the `data`, which is the actual content of the message, such as a processed result or assistant response; and the `agentName`, which identifies the agent that originated the message.  This allows the system to track the source of each outgoing message, ensuring proper routing and accountability within the swarm.


## Interface IModelMessage

This interface, IModelMessage, is the fundamental building block for communication within the swarm system. It represents a single message exchanged between any part of the system – agents, tools, users, or the system itself. These messages are crucial for tracking the history of interactions, generating responses from the model, and broadcasting events throughout the swarm.

Essentially, every piece of data flowing through the system is encapsulated within an IModelMessage. The interface defines several key properties to manage this flow:

*   **role:** Specifies the origin of the message. Common roles include "assistant" (generated by the model), "system" (for system-level notifications), "tool" (for tool outputs), "user" (for user input), "resque" (for error recovery), and "flush" (for history resets).
*   **agentName:**  Links the message to a specific agent instance, providing context within the multi-agent environment.
*   **content:** Holds the actual data being communicated, such as user input, tool outputs, or model responses.
*   **mode:** Indicates the context of the message, either "user" (for user-initiated actions) or "tool" (for tool-related activities).
*   **tool_calls:** An optional array of tool calls associated with the message, present when the model requests tool execution.
*   **tool_call_id:** An identifier linking a tool output to its originating tool call request.

The IModelMessage interface is used extensively within the ClientAgent, particularly in the `execute` function, to manage the flow of information and ensure proper tracking of interactions. It’s the core data structure that enables the swarm to function effectively by facilitating communication and state management across all its components.

## Interface IMethodContext

The `IMethodContext` interface provides a standardized structure for tracking method calls within the swarm system. It acts as a central point for metadata, utilized by services like ClientAgent, PerfService, and LoggerService. 

At its core, the `IMethodContext` contains key information about each method invocation. This includes the `clientId`, a unique identifier linking to the client session and used for performance tracking. 

It also captures the `methodName`, the specific method being called, which is crucial for logging and performance analysis.  

Furthermore, the interface tracks the `agentName` – the name of the agent involved – and the `swarmName` – the swarm the agent belongs to. 

Finally, it incorporates details about the `storageName`, `stateName`, and `policyName` involved, providing a comprehensive view of the context surrounding the method call, and supporting documentation and analysis across the system.

## Interface IMetaNode

The `IMetaNode` interface provides a foundational structure for organizing information about agents and their connections within the AI agent swarm orchestration framework. It’s primarily used by the `AgentMetaService` to create a visual representation of the swarm’s architecture, much like a UML diagram.

Essentially, each `IMetaNode` represents a component – this could be an agent itself, or a related resource like a specific state.

Key aspects of the interface include:

*   **name:** This property holds the identifier for the node, which is typically the name of an agent or a key term like "States."
*   **child:** An optional array of `IMetaNode` objects. This allows you to build a hierarchical structure, representing dependencies between agents or nested resources.  For example, a node representing an agent could have a `child` array containing nodes representing its dependent agents.

## Interface IMakeDisposeParams

The `IMakeDisposeParams` interface defines the settings used when calling the `makeAutoDispose` function. It controls how and when the swarm agents are automatically shut down.

Specifically, it includes a `timeoutSseconds` property, which is a numerical value representing the maximum time (in seconds) the system will wait for agents to gracefully dispose themselves.

Additionally, the interface provides an `onDestroy` callback function. This function, named `onDestroy`, is invoked when the timeout expires or when the agent is explicitly requested to stop. It accepts the agent’s unique ID (`clientId`) and the name of the swarm (`swarmName`) for identification and logging purposes.


## Interface IMakeConnectionConfig

The `IMakeConnectionConfig` interface defines the settings used to control how messages are sent as part of an AI agent swarm.  It focuses on managing the timing and frequency of those messages.

Specifically, the `delay` property allows you to set a numerical delay, measured in seconds, before a message is sent. This provides a mechanism for scheduling or rate-limiting the communication within the swarm.


## Interface ILoggerInstanceCallbacks

The `ILoggerInstanceCallbacks` interface provides a way to customize the lifecycle and logging behavior of a logger instance within the AI agent swarm orchestration framework. It offers a set of callback functions that are triggered at specific points during the logger's operation.

Specifically, you can use these callbacks to:

*   **`onInit`**:  Receive notification when the logger instance is initialized, often during the `waitForInit` process. This allows you to perform any necessary setup or configuration.
*   **`onDispose`**:  Execute cleanup actions when the logger instance is being disposed, ensuring resources are released properly.
*   **`onLog`, `onDebug`, `onInfo`**:  Be notified whenever a log message (regardless of its severity level – log, debug, or info) is recorded, passing along the client ID, topic, and associated arguments. This enables you to react to log events in real-time.

## Interface ILoggerInstance

The `ILoggerInstance` interface provides a standardized way to manage logger instances, building upon the core functionality of the base `ILogger`. It’s primarily used by the `LoggerInstance` to enable tailored logging experiences for specific clients.

This interface offers essential lifecycle management features. The `waitForInit` method handles the initialization process, allowing for asynchronous setup and ensuring the `onInit` callback is invoked when appropriate.  Crucially, the `dispose` method is responsible for cleaning up resources associated with a client, guaranteeing proper resource management. These methods provide a robust framework for controlling the lifecycle of logging within a client environment.


## Interface ILoggerControl

The `ILoggerControl` interface provides a way to manage and customize the behavior of logging within the AI agent swarm framework. It’s primarily used by `LoggerUtils` to handle common logging adapters, callbacks, and constructor options.

Key functionalities include:

*   **`useCommonAdapter`**: This method allows you to set a standard logger adapter, overriding the default behavior provided by `swarm.loggerService`. This is useful for centralized logging across the entire swarm.
*   **`useClientCallbacks`**:  You can configure lifecycle callbacks specific to each logger instance. These callbacks are applied by the `LoggerUtils` LoggerFactory, giving you control over how instances are created and managed.
*   **`useClientAdapter`**: This method lets you replace the default logger instance constructor with a custom one, tailored to the needs of a particular client.
*   **`logClient`, `infoClient`, `debugClient`**: These methods provide the core logging functionality, sending messages to a specific client using the configured adapter.  Each method includes session validation and tracks the method context for detailed logging information.

## Interface ILoggerAdapter

The `ILoggerAdapter` interface is a core component of the AI agent swarm orchestration framework, providing a standardized way to manage logging for individual clients. It’s implemented by `LoggerUtils` to tailor logging operations to the specific needs of each client.

This interface defines methods for logging messages at different severity levels – `log`, `debug`, and `info`.  Each method takes the client ID and a topic as input, and then logs a message to the client’s dedicated logger instance.  Crucially, before logging, the framework performs session validation and initialization, guaranteeing that the logging setup is correctly configured.

The `dispose` method is used to cleanly remove the client’s logger instance from the cache, ensuring proper resource management and preventing potential issues when a client is no longer active.  Like the other logging methods, it also performs session validation and initialization prior to disposal.

## Interface ILogger

The ILogger interface is the core logging system for the entire swarm orchestration framework. It allows components – including agents, sessions, states, storage, and various other systems – to record messages at different levels of importance. 

You can use the `log` method to record general events and state changes, like agent executions or session connections. The `debug` method is designed for detailed diagnostic information, such as tracking intermediate steps during tool calls or embedding creation. Finally, the `info` method is used to record high-level informational updates, such as successful completions or policy validations, offering a clear overview of system activity.  This logging system is crucial for debugging, monitoring, and auditing the swarm’s operations.

## Interface IIncomingMessage

The `IIncomingMessage` interface defines how the swarm system receives messages from external sources. It essentially captures a message as it enters the system, often originating from a user or another client.

Each `IIncomingMessage` contains three key pieces of information:

*   **`clientId`**: A unique identifier for the client that sent the message. This helps track the origin of the message, matching identifiers used in runtime parameters like `this.params.clientId`.
*   **`data`**: The actual content of the message itself. This is typically a string, representing the raw input received by the system, such as a user command or a query.
*   **`agentName`**: The name of the specific agent responsible for handling this message. This ensures the message is routed to the correct agent instance, often defined in agent parameters like `this.params.agentName`.

## Interface IHistorySchema

The `IHistorySchema` interface outlines the structure for configuring how the AI agent swarm’s conversation history is managed. It essentially defines the system used to store and access the messages exchanged between the agents.

At its core, the `items` property utilizes an `IHistoryAdapter`. This adapter is the key component, handling the actual storage of the model messages and providing the functionality to retrieve them when needed.  It’s responsible for the technical details of managing the history data.

## Interface IHistoryParams

This interface, `IHistoryParams`, defines the settings needed when creating a history record for an AI agent within the swarm. It builds upon the core history structure, adding details specific to how each agent manages its own history.

Key properties include:

*   **agentName:** A unique identifier for the agent generating the history record.
*   **clientId:** A unique identifier for the client associated with this history.
*   **logger:**  A logger object used to track and log any history-related events or errors that occur.
*   **bus:** An instance of the swarm’s bus, enabling communication and event handling related to the history.

## Interface IHistoryInstanceCallbacks

The `IHistoryInstanceCallbacks` interface provides a set of callback functions designed to manage the lifecycle and message handling within an AI agent’s history instance. These callbacks allow you to customize how the history is initialized, updated, and processed during agent interactions.

Specifically, you can use `getSystemPrompt` to dynamically retrieve system prompt messages tailored to an agent’s needs. The `filterCondition` callback lets you selectively include or exclude messages from the history based on specific criteria.

Furthermore, `getData` is used to obtain the initial history data for an agent, while `onChange`, `onPush`, and `onPop` are triggered when the history array changes.  You can also utilize `onRead`, `onReadBegin`, and `onReadEnd` for fine-grained control during history iteration, and `onDispose` and `onInit` for managing the history instance’s lifecycle events. Finally, `onRef` provides a direct reference to the history instance after it’s created.

## Interface IHistoryInstance

The #IHistoryInstance interface provides a set of methods for managing an agent’s historical data. 

It offers an `iterate` function that allows you to step through all the messages recorded for a specific agent.

The `waitForInit` method is used to load any initial data associated with an agent’s history.

You can add new messages to an agent’s history using the `push` method, passing in the message and the agent’s name.

To retrieve the most recent message, the `pop` method removes and returns it for a given agent.

Finally, the `dispose` method cleans up the agent’s history, either removing all data or performing a more complete cleanup.

## Interface IHistoryControl

The `IHistoryControl` interface provides methods for managing how the AI agent swarm’s history is handled. It allows you to configure the lifecycle of history instances using the `useHistoryCallbacks` method, accepting a set of callbacks to control events like initialization and cleanup.  Furthermore, you can customize the history instance itself by providing a specific constructor through the `useHistoryAdapter` method, giving you fine-grained control over the underlying history implementation. This interface is central to managing the historical data used by the swarm.


## Interface IHistoryConnectionService

This interface, `IHistoryConnectionService`, acts as a specific type definition for the broader `HistoryConnectionService`. Its primary purpose is to ensure that the `HistoryPublicService` implementation adheres to a clean, public-facing design. By excluding any internal keys, it guarantees that the public API remains focused solely on the intended, accessible operations.

## Interface IHistoryAdapter

The `IHistoryAdapter` interface provides a standardized way to manage and interact with a history of messages. It offers several key methods for working with this history.

The `push` method allows you to add new messages to the history, identified by a client ID and an agent name.

The `pop` method retrieves and removes the most recent message from the history, again using a client ID and agent name.

The `dispose` method provides a way to clean up the history associated with a specific client and agent, potentially clearing all stored data.

Finally, the `iterate` method enables you to asynchronously loop through all messages in the history for a given client and agent, providing a flexible way to process the entire message log.


## Interface IHistory

The #IHistory interface manages the conversation history within the AI agent swarm. It offers methods to add, retrieve, and organize messages, allowing for a structured record of interactions.

The `push` method adds new model messages to the end of the history, updating the store asynchronously. The `pop` method retrieves and removes the most recent message from the history.

For specific agents, the `toArrayForAgent` method converts the history into an array, filtering or formatting messages based on a given prompt and any associated system prompts. Finally, the `toArrayForRaw` method provides a complete array of all raw model messages, without any agent-specific filtering.

## Interface IGlobalConfig

Okay, this is a comprehensive list of constants and default functions used within the `ClientAgent` system. Let's break down the key aspects and their implications:

**1. Core Configuration & Defaults:**

*   **`CC_SKIP_POSIX_RENAME`**:  This is a critical flag.  If set to `true`, it disables the standard POSIX-style file renaming operations. This could be important if the persistence layer uses a different file system or renaming mechanism.
*   **`CC_PERSIST_MEMORY_STORAGE`**:  This controls whether data is persistently stored in memory.  When enabled, data is retained even after the `ClientAgent` process restarts.
*   **`CC_AUTOBAN_ENABLED_BY_DEFAULT`**:  This determines whether the system automatically bans users or topics based on predefined policies.  It's disabled by default, giving administrators more control.
*   **`CC_PERSIST_ENABLED_BY_DEFAULT`**:  This controls whether persistence is enabled by default.  When enabled, data is retained across sessions.

**2. State Management:**

*   **`CC_DEFAULT_STATE_GET`**:  This is the default function used when retrieving state values.  It simply returns a `defaultState` value.  This allows customization via `setConfig`.
*   **`CC_DEFAULT_STATE_SET`**:  This is the default function used when setting state values.  It does nothing by default, allowing customization via `setConfig`.
*   **`CC_DEFAULT_STORAGE_GET`**: This is the default function used when retrieving data from storage. It returns a `defaultValue` value. This allows customization via `setConfig`.
*   **`CC_DEFAULT_STORAGE_SET`**: This is the default function used when setting data to storage. It does nothing by default, allowing customization via `setConfig`.

**3.  Exception Handling & Recovery:**

*   **`CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION`**: This is a crucial fallback mechanism.  If a tool call fails, this function can be invoked to handle the error.  The default implementation returns `null`, but it can be overridden to implement custom recovery logic (e.g., retry the call, return a default response, or log the error).
*   **`CC_RESQUE_STRATEGY`**: This is the strategy used when handling tool call exceptions.

**4.  Policy Enforcement & Control:**

*   **`CC_AUTOBAN_ENABLED_BY_DEFAULT`**:  As mentioned above, this controls automatic banning.
*   **`CC_BANHAMMER_PLACEHOLDER`**:  This is a placeholder response used when a user is banned.

**5.  Flexibility & Customization:**

*   **`CC_FN_PLANTUML`**:  This allows the system to process PlantUML diagrams, potentially for visualization.
*   **`CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION`**:  This is the most flexible option, allowing for complete control over how tool call exceptions are handled.

**Key Implications & Use Cases:**

*   **Customization:** The `setConfig` function is central to this system.  It allows developers to override these default behaviors and tailor the `ClientAgent` to their specific needs.
*   **Error Handling:** The `CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION` is vital for robust tool call handling.
*   **Persistence:** The flags (`CC_PERSIST_MEMORY_STORAGE`, `CC_PERSIST_ENABLED_BY_DEFAULT`) control how data is stored and retrieved.
*   **Policy Enforcement:** The `CC_AUTOBAN_ENABLED_BY_DEFAULT` and `CC_BANHAMMER_PLACEHOLDER` constants are used to enforce policies and handle banned users.

**In summary, this list of constants and default functions provides a flexible and configurable system for the `ClientAgent` to handle tool calls, manage state, and enforce policies.**  The ability to override these defaults via `setConfig` is a key design element.

Do you want me to delve deeper into a specific aspect of this list, such as:

*   How `setConfig` is used?
*   The role of the `IStorage` interface?
*   The details of the exception handling strategy?

## Interface IExecutionContext

The `IExecutionContext` interface provides a standardized way to manage information related to each execution within the swarm system. It acts as a central point for tracking and coordinating activities across various services, including ClientAgent, PerfService, and BusService.

Key aspects of the `IExecutionContext` are:

*   **`clientId`**: This string uniquely identifies the client session, linking to the `clientId` property within the ClientAgent and the `executionId` in PerfService.
*   **`executionId`**: This string serves as a unique identifier for the specific execution instance. It’s crucial for tracking performance metrics within PerfService, particularly during the `startExecution` operation, and for managing execution state within the BusService, specifically during `commitExecutionBegin`.
*   **`processId`**:  This string is derived from `GLOBAL_CONFIG.CC_PROCESSED_UUID` and is used within PerfService’s `IPerformanceRecord` to represent the process associated with the execution.

## Interface IEntity

The `IEntity` interface serves as the foundational building block for all data that needs to be stored and retrieved persistently within the AI agent swarm orchestration framework. It defines a standard set of properties that any entity, such as an agent or a task, will possess. 

Key aspects of the `IEntity` interface include:

*   **Unique Identifier:** Every entity must have a unique identifier to distinguish it from others.
*   **Metadata:**  Stores general information about the entity, like its creation timestamp and last updated time.
*   **Status:**  Provides a way to track the entity's current state, which could be active, inactive, pending, or completed.
*   **Persistence Support:**  Designed to integrate seamlessly with the framework’s persistence layer, ensuring data is reliably saved and loaded.


## Interface IEmbeddingSchema

The `IEmbeddingSchema` interface defines how the swarm manages and utilizes embedding mechanisms. It’s responsible for configuring the creation and comparison of embeddings.

Key aspects of this schema include:

*   **embeddingName:** A unique identifier for the embedding mechanism being used within the swarm.
*   **callbacks:** An optional set of callbacks that can be used to customize events related to embedding creation and comparison. This allows for flexible integration and monitoring.

The schema provides methods for:

*   **createEmbedding:** This method generates an embedding from a given text string. It’s the core function for creating the numerical representation of the text.
*   **calculateSimilarity:** This method computes the similarity between two embeddings, typically using a metric like cosine similarity. This is essential for tasks like searching and ranking based on semantic similarity.

## Interface IEmbeddingCallbacks

The `IEmbeddingCallbacks` interface offers a way to react to key events during the lifecycle of your AI agent embeddings. It provides two primary callback functions designed for flexibility and insight.

The `onCreate` callback is invoked immediately after a new embedding is generated. You can use this to log the embedding’s creation, perform any necessary post-processing steps, or simply track embedding generation activity.

The `onCompare` callback is triggered whenever two embeddings are compared for similarity. This allows you to capture the similarity score and associated context – like the text strings being compared and the client ID – for detailed analysis or logging of similarity results.  These callbacks give you control over how your system handles embedding creation and comparison, enabling you to tailor your workflow to specific needs.


## Interface ICustomEvent

The ICustomEvent interface provides a way to send custom data within the swarm system. It builds upon the broader IBaseEvent interface, offering a flexible approach to event handling. Unlike the standard IBusEvent, which has a fixed structure, ICustomEvent allows you to include any type of data in its `payload`. This is useful for creating event scenarios that don’t fit the predefined format of IBusEvent, such as sending specific status updates or tailored data. The `payload` property can hold data of any type, giving you the freedom to define events based on your particular needs.

## Interface IConfig

The `IConfig` class manages the settings for UML diagram generation. Specifically, it includes a `withSubtree` property. This boolean flag, when set to `true`, instructs the system to generate a complete UML diagram, including nested sub-diagrams and their relationships, rather than just the top-level structure. This allows for a more detailed and comprehensive visual representation of the agent swarm’s design.


## Interface ICompletionSchema

The `ICompletionSchema` interface defines the configuration for a completion mechanism used within the AI agent swarm. It specifies how the swarm generates responses to prompts.

Key aspects of this schema include:

*   **completionName:** A unique identifier for the completion mechanism itself, ensuring distinct behavior within the swarm.
*   **callbacks:** An optional set of callbacks that can be used to customize the actions taken after a completion is generated. This allows for flexible post-processing of the response.
*   **getCompletion:** This method is responsible for retrieving a completion. It takes arguments related to the prompt and context, and then generates a model response using the specified tools and information.

## Interface ICompletionCallbacks

The `ICompletionCallbacks` interface defines how you can react to the completion of an AI generation. It gives you hooks to perform actions after a completion is finished.

Specifically, it includes the `onComplete` callback.

This callback is executed once a completion has been successfully created. You can use it to:

*   Log the completion results.
*   Process the generated output.
*   Trigger any necessary side effects based on the completion.

The callback receives two arguments: `args` containing completion-related information and `output` which is the `IModelMessage` representing the generated text.


## Interface ICompletionArgs

The `ICompletionArgs` interface defines the structure for requesting a completion from a language model. It bundles together all the necessary information to generate a response, including the context and specific inputs.

Key elements within this interface are:

*   **`clientId`**: A unique identifier assigned to the client making the request.
*   **`agentName`**: The name of the agent responsible for handling the completion.
*   **`mode`**:  Specifies the origin of the last message, differentiating between user input and tool outputs.
*   **`messages`**: An array of messages that establish the conversation history and provide the model with the necessary context.
*   **`tools`**: An optional list of tools that the agent can utilize during the completion process, allowing for actions like tool calls.

## Interface ICompletion

The `ICompletion` interface defines the core functionality for generating responses from an AI model. It acts as a central point for any system needing to produce text-based outputs. This interface extends a broader completion schema, offering a fully-fledged API designed to handle the entire process of creating model responses. It’s intended to be a foundational element, providing a consistent way to interact with and control the generation of text-based answers.

## Interface IClientPerfomanceRecord

This `IClientPerformanceRecord` interface provides detailed performance data for individual clients within a process. It’s designed to be used for analyzing client-level execution metrics, memory usage, and state information. This record is a core component within the `IPerformanceRecord` structure, specifically targeting breakdowns by client, and is utilized for logging via `ILogger` or transmission via `IBus` – common practices in `ClientAgent` workflows.

The interface contains the following properties:

*   **`clientId`**: A string representing the unique identifier of the client, typically matching the `clientId` used in runtime parameters like `this.params.clientId` within a `ClientAgent` instance (e.g., "client-456"). This links the performance data directly to a specific session or agent.

*   **`sessionMemory`**: A `Record<string, unknown>` that stores arbitrary data used during the client’s operation. This mirrors the functionality of `IState`’s state management within `ClientAgent`, providing a space for temporary variables and cached values.  An example would be `{ "cacheKey": "value" }`.

*   **`sessionState`**: Another `Record<string, unknown>` representing persistent state data for the client, similar to `IState`’s role in tracking agent state.  An example would be `{ "step": 3, "active": true }`.

*   **`executionCount`**: A number indicating the total number of times the client’s execution was run. This contributes to the overall `executionCount` of the process.  For instance, a client that executed 10 commands would have a value of 10.

*   **`executionInputTotal`**: A number representing the total input size processed during all executions, measured in a consistent unit (e.g., bytes or characters). This is calculated as the sum of input data across all executions.

*   **`executionOutputTotal`**: A number representing the total output size generated during all executions, also measured in a consistent unit. This reflects the cumulative volume of output data.

*   **`executionInputAverage`**: The average input size per execution, calculated by dividing `executionInputTotal` by `executionCount`. This provides a normalized measure of input data volume.

*   **`executionOutputAverage`**: The average output size per execution, calculated by dividing `executionOutputTotal` by `executionCount`. This offers a normalized measure of output data volume.

*   **`executionTimeTotal`**: A string representing the total execution time for the client, formatted for readability (e.g., "300ms" or "1.5s"). This is the cumulative duration of all executions and contributes to the overall `totalResponseTime` of the process.

*   **`executionTimeAverage`**: A string representing the average execution time per execution, calculated as `executionTimeTotal` divided by `executionCount` (e.g., "30ms" per execution). This provides a normalized measure of latency for the client.

## Interface IBusEventContext

The `IBusEventContext` interface provides supplementary information surrounding an event within the swarm system. It’s designed to offer additional context beyond what’s present in a standard `IBusEvent`. Primarily, it includes identifiers for various system components – specifically, the agent, swarm, storage, state, and policy involved in the event.

Within the `ClientAgent`, the `agentName` is consistently populated, representing the unique name of the agent generating the event (like "Agent1").  The other fields – `swarmName`, `storageName`, `stateName`, and `policyName` – are available for broader use cases, particularly in swarm-wide events or when dealing with storage, state, or policy management.  These identifiers allow for precise tracking and correlation of events across different parts of the system.  For example, the `swarmName` might be "SwarmA" for a navigation event, while the `storageName` could be "Storage1" for a storage-related operation.

## Interface IBusEvent

The IBusEvent interface defines a structured event format used for communication within the swarm system’s internal bus. It’s designed to be extensively utilized by ClientAgent’s `bus.emit` calls, specifically for events like “run” and “commit-user-message.”

Each IBusEvent carries detailed information about an action or state change, allowing agents to broadcast events to the bus.  The event structure includes:

*   **source:**  This identifies the component that originated the event.  For ClientAgent, it’s consistently “agent-bus,” but can vary for other buses like “history-bus.”
*   **type:** A unique string identifier representing the event’s purpose, such as “run” or “commit-user-message.”
*   **input:**  A key-value object containing event-specific data, often linked to the `IModelMessage` content.
*   **output:** A key-value object holding event-specific results.
*   **context:**  Optional metadata, typically including the agent’s name, used for contextual information.

## Interface IBus

The IBus interface is the core mechanism for communication within the swarm system. It provides a way for agents, primarily ClientAgents, to send updates and information to other components asynchronously. Think of it as a central bulletin board where agents can post messages to be seen by the system.

Here’s how it works:

*   **Asynchronous Broadcasting:** Agents use the `emit` method to send events. This means the agent doesn’t have to wait for a direct response; the event is queued or sent through a channel, and the system will handle it later.
*   **Targeted Delivery:** Each event is sent to a specific client using its session ID (clientId). This ensures that the right client receives the information.
*   **Standardized Events:** All events follow a consistent structure defined by the IBaseEvent interface. This includes fields like `type` (a unique identifier for the event), `source` (who sent the event), `input` (data associated with the event), `output` (data resulting from the event), `context` (metadata like the agent’s name), and of course, the `clientId` for precise targeting.
*   **Common Event Types:** Agents typically use the bus to announce events like a completed run (`"run"`), the emission of validated output (`"emit-output"`), or the commit of messages and tools (`"commit-*"`).  The `output` field is often empty unless the event carries a result.

**Example Usage:**

A ClientAgent might use the bus to:

*   Signal that a stateless run has finished, sending the transformed result along with the event.
*   Broadcast the final output after validation.

**Key Features:**

*   **Redundancy:** The `clientId` is repeated in the event structure, which can be helpful for filtering or validation.
*   **Type Safety:** The use of generics (`<T extends IBaseEvent>`) ensures that events are always structured according to the IBaseEvent interface, promoting type safety.
*   **Integration:** The IBus works in conjunction with other system components, such as history updates (using `history.push`) and callbacks (using `onOutput`), to create a comprehensive system-wide awareness.

## Interface IBaseEvent

The `IBaseEvent` interface forms the core structure for all events within the swarm system. It establishes a fundamental framework for communication between different components, including agents and sessions.

This interface defines the essential fields present in every event, and serves as the basis for more specialized event types like `IBusEvent` and `ICustomEvent`.

Key properties include:

*   **source:** A string that identifies the origin of the event.  This is typically a generic string like "custom-source," but in practice, it’s often overridden (e.g., "agent-bus") to represent the specific source within the system.
*   **clientId:** A unique identifier for the client receiving the event. This value corresponds to the `clientId` used in runtime parameters, ensuring events are delivered to the correct session or agent instance – for example, "client-123".

## Interface IAgentToolCallbacks

The `IAgentToolCallbacks` interface defines a set of callbacks to manage the lifecycle of individual agent tools. It provides hooks you can use to control how tools are executed and handled.

Specifically, you can use the `onBeforeCall` callback to perform actions *before* a tool runs, such as logging or setting up necessary data.  The `onAfterCall` callback is invoked *after* the tool has finished, allowing you to handle cleanup, record results, or perform any post-execution tasks.

The `onValidate` callback gives you the ability to check the tool’s parameters *before* it runs, letting you implement custom validation rules. Finally, the `onCallError` callback is triggered if a tool execution fails, providing a place to log errors or attempt recovery. These callbacks offer granular control over the agent tool orchestration process.

## Interface IAgentTool

The IAgentTool interface is the core component for managing tools used by individual agents within the swarm. It builds upon the base ITool interface to provide a structured way to define and execute tools.

Each IAgentTool has a descriptive `docNote` that clarifies its purpose and how to use it.  A unique `toolName` is assigned to each tool, allowing for easy identification across the entire swarm.

The `callbacks` property offers flexibility, letting you customize the tool's execution flow with lifecycle events.

The `call` method is the primary way to run the tool. It accepts a data object containing the tool's ID, the agent's ID, the agent's name, parameters, and information about whether it's the last call in a sequence.

Finally, the `validate` method provides a crucial check on the tool's parameters before execution can begin. It can perform synchronous or asynchronous validation, depending on the complexity of the checks.


## Interface IAgentSchemaCallbacks

The `IAgentSchemaCallbacks` interface provides a set of callbacks to manage different stages of an agent’s lifecycle. These callbacks allow you to react to key events, such as when the agent is initialized, runs without history, or produces output.

Specifically, you can receive notifications when the agent begins execution (`onExecute`), when a tool generates output (`onToolOutput`), or when a system message is created (`onSystemMessage`).  

Furthermore, you can respond to user input (`onUserMessage`), agent output (`onOutput`), and the flushing of the agent’s history (`onFlush`). 

The interface also includes callbacks for handling agent resurrection after pauses or failures (`onResurrect`) and for managing the agent’s final state (`onDispose`). Finally, you can track the completion of tool sequences with the `onAfterToolCalls` callback.

## Interface IAgentSchema

The `IAgentSchema` interface defines the configuration for each agent within the swarm. It outlines the agent’s core settings, including its unique name, the primary prompt it responds to, and the specific completion mechanism used. Agents can be configured with a maximum number of tool calls they can execute in a single cycle, and they can utilize a defined set of tools and storage locations.

Furthermore, the schema allows for customization through optional features like system prompts – typically used to guide tool-calling behavior – and callbacks that trigger at various points during the agent’s lifecycle.  The `IAgentSchema` also provides mechanisms for validating the agent’s final output and transforming the model’s response before it’s processed further.  Finally, it includes a function to map assistant messages, enabling adaptation to different model formats.

## Interface IAgentParams

The `IAgentParams` interface defines the settings needed to run an individual agent within the swarm. It brings together key information like the agent’s unique identifier (`clientId`), a logging system (`logger`) for tracking activity, and a communication channel (`bus`) for interacting with other agents.  Crucially, it also includes a history component (`history`) to record the agent’s actions and a mechanism (`completion`) for generating responses.  Agents can optionally utilize available tools (`tools`) to perform specific tasks, and the `validate` function provides a final check on the agent’s output before it’s finalized.

## Interface IAgentConnectionService

The `IAgentConnectionService` interface serves as a type definition, specifically designed to represent an `AgentConnectionService`. Its primary purpose is to clearly outline the structure of an `AgentConnectionService` while excluding any internal implementation details. This ensures that the `AgentPublicService` consistently uses only the publicly accessible operations, promoting a cleaner and more predictable API.


## Interface IAgent

The `IAgent` interface defines the core runtime behavior for an agent within the orchestration framework. It provides methods for the agent to operate independently, processing input without altering the conversation history – this is achieved through the `run` method.  

More complex operations, where the agent might need to update its internal state based on the input and execution mode, are handled by the `execute` method.  After execution, the `waitForOutput` method retrieves the agent’s final response.

To integrate the agent’s output into the overall conversation, the `commitToolOutput`, `commitSystemMessage`, `commitUserMessage`, and `commitAssistantMessage` methods allow for committing messages to the agent’s history.  Finally, the `commitFlush` and `commitStopTools` methods offer control over resetting the agent’s state or halting further tool execution.
