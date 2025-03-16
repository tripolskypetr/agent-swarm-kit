# agent-swarm-kit api reference

![schema](../assets/uml.svg)

**Overall Architecture:**

This system built around a distributed, asynchronous architecture. Agents communicate via a bus (likely a message queue), and their interactions are orchestrated through a series of tools and processes. The core concept is to allow agents to perform tasks independently while still being part of a larger, coordinated system.

**Key Interfaces and Their Roles:**

Here's a breakdown of each interface and its purpose:

* **`IAgent`:** The fundamental runtime unit. It's responsible for executing the agent's core logic – running stateless computations, managing its state, and handling communication.
* **`IAgentSchema`:** Defines the configuration for a specific agent, including its prompts, available tools, and limitations. This is the blueprint for how an agent is set up.
* **`IAgentParams`:**  The settings needed to run an individual agent, including its ID, logger, and connection services.
* **`IAgentConnectionService`:**  A service for managing the agent's connection to the system.
* **`IAgentSchemaCallbacks`:**  A set of callbacks that allow you to respond to key events during the agent's execution. This is where you'd add custom logic, logging, or other actions.
* **`IAgentTool`:** Represents a single tool that an agent can use.  This is the building block of the agent's capabilities.
* **`IAgentParams`:** Defines the settings needed to run an individual agent, including its ID, logger, and connection services.

**Workflow & Communication:**

1. **Agent Configuration:** An `IAgentSchema` defines the agent's configuration (prompts, tools, etc.).
2. **Agent Execution:** The `IAgent` interface is used to execute the agent, potentially triggering tool calls.
3. **Tool Calls:** The agent uses its configured tools (defined in `IAgentTool`) to perform specific tasks.
4. **Communication:** Agents communicate via the `IAgentConnectionService` and the bus.
5. **Callbacks:** The `IAgentSchemaCallbacks` interface allows you to respond to events during the agent's execution.

**Key Concepts:**

* **State Management:** Agents maintain their own state (conversation history, tool outputs, etc.).
* **Tool Orchestration:** The system orchestrates the execution of tools to achieve a desired outcome.
* **Asynchronous Communication:** Agents communicate asynchronously via a bus, allowing them to operate independently.
* **Flexibility:** The system is designed to be flexible, allowing developers to customize agents and their workflows.

**Potential Use Cases:**

This architecture could be used for a wide range of applications, including:

* **Chatbots:**  Agents could be used to power conversational AI systems.
* **Content Generation:** Agents could be used to generate text, images, or other content.
* **Data Analysis:** Agents could be used to analyze data and generate insights.

# agent-swarm-kit classes

## Class ToolValidationService

The ToolValidationService is a core component of the swarm system, responsible for ensuring the integrity of tool configurations. It maintains a record of all registered tools, verifying their uniqueness and existence to prevent conflicts. This service works closely with other key systems, including the ToolSchemaService for tool registration, the AgentValidationService for agent tool validation, and the ClientAgent for tool usage. 

The service utilizes dependency injection to manage its logging, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting, and employs memoization to efficiently check for tool existence based on their names. 

Key functions include `addTool`, which registers new tools with their schemas, and `validate`, which performs existence checks, optimizing performance through memoization.  The `validate` function is particularly important for supporting the AgentValidationService’s broader validation efforts.

## Class ToolSchemaService

The ToolSchemaService is the core service responsible for managing the definitions of tools used by agents within the swarm system. It acts as a central repository, storing and retrieving these tool definitions – represented as `IAgentTool` instances – using a registry built on functools-kit.  This registry ensures the integrity of the tool schemas through shallow validation, checking that key properties like `toolName`, `call`, `validate`, and `function` are present and of the correct type.

The service integrates closely with several other components, including the AgentSchemaService (providing tool references within agent schemas), the ClientAgent (for tool execution during agent runs), the AgentConnectionService (for instantiating agents with their required tools), and the SwarmConnectionService (for managing agent execution at the swarm level).

Key functionalities include the `validateShallow` method, which performs basic schema checks, and the `register` method, which adds validated tool schemas to the registry.  The `get` method allows retrieving tool schemas by their name.  Logging is handled via the `loggerService`, with operations logged at the info level when `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` is true, aligning with logging practices in other key services.  The registry itself is designed to be immutable after initialization, updated solely through the `register` method to maintain a consistent collection of tool definitions.


## Class SwarmValidationService

The SwarmValidationService is a core component responsible for ensuring the integrity and consistency of the entire swarm system. It maintains a record of all registered swarms, meticulously checking for uniqueness, verifying the validity of each swarm’s agent list, and confirming the adherence to associated policies.

This service leverages dependency injection, utilizing instances of the AgentValidationService, PolicyValidationService, and LoggerService to perform its checks.  A central map, `_swarmMap`, stores information about each swarm, allowing for efficient retrieval and validation.

Key functionalities include registering new swarms via the `addSwarm` method, retrieving agent and policy lists using `getAgentList` and `getPolicyList`, and obtaining a complete list of registered swarms with `getSwarmList`.  The `validate` method is the heart of the service, performing comprehensive checks on a given swarm – confirming its existence, default agent inclusion, and the validity of all associated agents and policies.  This method is memoized by swarm name to optimize performance and is integrated with ClientSwarm for operational support.  The LoggerService provides detailed logging of all validation operations and errors, ensuring traceability and aiding in debugging.


## Class SwarmSchemaService

The SwarmSchemaService is the central management component for all swarm configurations within the system. It acts as a registry, storing and retrieving ISwarmSchema instances using a ToolRegistry for efficient storage and retrieval.  This service performs shallow validation on each schema to ensure basic integrity – specifically checking that the swarm name and agent list are valid strings, and that policies, if present, are unique references.

The service integrates closely with other key components, including the SwarmConnectionService, AgentConnectionService, PolicySchemaService, ClientAgent, SessionConnectionService, and SwarmPublicService.  It’s used to define and manage configurations like agent lists, default agents, and policies, which are essential for orchestrating agents within the swarm.

The SwarmSchemaService utilizes a LoggerService for logging operations at the info level, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting, mirroring the logging patterns of other core services.  It provides methods for registering new schemas and retrieving existing ones, supporting the instantiation of ClientSwarm configurations and ultimately facilitating the execution of agents within the swarm ecosystem.


## Class SwarmPublicService

The SwarmPublicService acts as a central point of interaction for public swarm operations. It extends the functionality of the `TSwarmConnectionService` to provide a user-friendly API, managing the underlying swarm connections and delegating to specialized services like `SwarmConnectionService`. This service is designed to be used within the `ClientAgent` (e.g., during agent execution in `EXECUTE_FN`) and by other services such as `AgentPublicService`, `SwarmMetaService`, and `SessionPublicService`.

Key operations include navigating the swarm’s agent flow, controlling output, waiting for results, retrieving agent information, and ultimately disposing of the swarm connection. Each operation is carefully scoped to a specific client (`clientId`) and swarm (`swarmName`) to maintain context and ensure proper resource management. Logging is enabled at an info level (controlled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`) to aid in debugging and monitoring.

The service utilizes dependency injection to access the `loggerService` and `swarmConnectionService`, providing a flexible and testable architecture.  Methods like `navigationPop`, `cancelOutput`, and `waitForOutput` wrap the core `SwarmConnectionService` calls, adding context scoping and logging.  Furthermore, the `setAgentRef` and `setAgentName` methods allow for dynamic management of agent references within the swarm. Finally, the `dispose` method provides a mechanism for cleaning up resources associated with the swarm connection.

## Class SwarmMetaService

The SwarmMetaService is a core service within the swarm system, responsible for managing and representing the overall swarm structure. It achieves this by building detailed, hierarchical “meta nodes” from the swarm’s schema data, primarily using the SwarmSchemaService to retrieve this information.  These meta nodes are then used to create a visual representation of the swarm, generating UML strings that can be incorporated into diagrams for documentation and debugging.

The service leverages several other components to perform its functions. It utilizes the LoggerService for informational logging, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting, and the AgentMetaService to create the individual agent nodes within the swarm tree.  Furthermore, it integrates with the DocService to produce UML diagrams, specifically for use in the `writeSwarmDoc` function.

Key methods include `makeSwarmNode`, which constructs a single node in the meta-swarm tree, and `toUML`, which converts the entire tree structure into a UML string.  These methods are designed to align with the data provided by the ClientAgent and to support the visualization requirements of the DocService. The service’s architecture is designed for consistency and integration with other key components like AgentMetaService and LoggerService.

## Class SwarmConnectionService

The SwarmConnectionService is the core component for managing interactions within a swarm system. It provides an interface for creating and interacting with ClientSwarm instances, which are responsible for executing agents and handling their output. This service leverages memoization through functools-kit’s memoize to efficiently reuse ClientSwarm instances, reducing overhead by caching them based on a composite key of client ID and swarm name. 

It integrates with several other services, including ClientAgent for agent execution, AgentConnectionService for agent management, and SwarmSchemaService for retrieving swarm configurations. The service uses a LoggerService for logging operations at an info level (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) and a BusService for event propagation. 

Key functionalities include retrieving or creating a ClientSwarm instance, managing agent navigation and output, and providing access to the currently active agent. The service also supports dynamic agent management through the setAgentRef method and provides disposal functionality to clear the memoized instance. It mirrors the behavior of SwarmPublicService and ClientAgent, ensuring consistent operation across the swarm ecosystem.

## Class StorageValidationService

The StorageValidationService is a core component responsible for ensuring the integrity of storage configurations within the AI agent swarm. It maintains a record of all registered storage locations, actively verifying their uniqueness, existence, and that their embedding settings are valid. 

This service works closely with several other key components: the StorageSchemaService for initial storage registration, ClientStorage for handling storage operations, the AgentValidationService for agent-specific storage checks, and the EmbeddingValidationService for verifying embedding data. 

To optimize performance, the service employs dependency injection for its components and memoization, caching validation results based on storage name.  The `validate` method is the primary entry point, checking both the storage's existence and its embedding configuration, leveraging ClientStorage to maintain operational integrity.  A new storage is registered using the `addStorage` method, which logs the operation and integrates with the StorageSchemaService.

## Class StorageUtils

StorageUtils is a utility class designed to manage data storage specifically tailored for use within an agent swarm. It acts as an interface to the swarm’s underlying storage service, providing methods for retrieving, inserting, updating, deleting, and listing data items. 

The core functionality revolves around managing data for individual clients, agents, and storage locations.  It enforces validation checks, ensuring that client sessions, storage names, and agent-storage registrations are valid before any operations are performed. This validation layer helps maintain data integrity and security within the swarm.

Key methods include:

*   **`take`**:  Allows you to retrieve a specific number of items from storage based on a search query.  It takes parameters like client ID, agent name, storage name, and an optional score for ranking results.
*   **`upsert`**:  This method either inserts a new item or updates an existing one in the storage, again validating the necessary components before interacting with the storage service.
*   **`remove`**:  Removes a single item from the storage based on its unique ID, ensuring proper validation before the deletion.
*   **`get`**: Retrieves a single item from storage using its ID, validating the storage name and agent-storage registration.
*   **`list`**:  Lists all items within a storage location for a given client and agent, with an optional filter function to refine the results.
*   **`clear`**: Removes all items from a storage location for a specific client and agent.

All operations are executed within a logging context to facilitate debugging and monitoring.  The class is built to provide a robust and reliable way to interact with the swarm’s storage system.

## Class StorageSchemaService

The StorageSchemaService is the core component for managing storage configurations within the AI agent swarm. It acts as a central repository, utilizing the ToolRegistry from functools-kit to store and retrieve IStorageSchema instances.  This service performs shallow validation on each schema, ensuring it meets basic requirements like a valid storage name, a function for creating indexes, and a reference to an EmbeddingName from the EmbeddingSchemaService.

The service integrates with several other key components, including StorageConnectionService, SharedStorageConnectionService, AgentSchemaService, ClientAgent, and StoragePublicService.  It leverages a LoggerService for logging operations at the info level, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting, mirroring the logging patterns of related services.

The StorageSchemaService’s primary functions are to register new schemas using the `register` method, which validates them before adding them to the ToolRegistry, and to retrieve existing schemas using the `get` method.  This allows for consistent storage configuration across the swarm, supporting ClientStorage instantiation and providing the necessary data for AgentSchemaService and ClientAgent execution.  The registry itself is designed to be immutable once initialized, updated only through the ToolRegistry’s register method.

## Class StoragePublicService

This class, `StoragePublicService`, acts as a public interface for managing client-specific storage within the swarm system. It extends `TStorageConnectionService` to provide a standardized API for interacting with storage, delegating the underlying storage operations to `StorageConnectionService`.  The service is designed to scope storage access to individual clients, contrasting with system-wide storage managed by `SharedStoragePublicService`.

Key functionalities include retrieving, inserting, updating, deleting, and listing data within a client's dedicated storage space. These operations are wrapped with `MethodContextService` for context scoping and utilize the `LoggerService` for informational logging (enabled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`), aligning with the logging patterns of `StatePublicService` and `PerfService`.

The core methods include:

*   `take`:  Retrieves a list of storage items based on a search query and total count, primarily used in the `ClientAgent` for searching client-specific data.
*   `upsert`: Inserts or updates a single storage item, supporting both insertion and modification within a client’s storage.
*   `remove`: Deletes a specific storage item by its ID.
*   `get`: Retrieves a single storage item by its ID.
*   `list`: Retrieves a list of all storage items, optionally filtered based on a provided predicate.
*   `clear`: Removes all storage items from a client’s storage.
*   `dispose`: Cleans up resources associated with a client’s storage, aligning with the lifecycle management of the `ClientAgent` and `PerfService`.

The `StoragePublicService` relies on dependency injection to provide instances of `StorageConnectionService` and `LoggerService`, ensuring loose coupling and testability.  The service is tightly integrated with the `ClientAgent`, `DocService`, `PerfService`, and `StatePublicService` to facilitate client-specific data management and performance monitoring within the swarm.

## Class StorageConnectionService

This class, `StorageConnectionService`, is the core component for managing storage interactions within the swarm system. It provides an interface, named `IStorage`, to handle client-specific and shared storage, ensuring efficient data access and lifecycle management.

Here’s a breakdown of its key functionalities:

*   **Memoized Storage Instances:** The service utilizes functools-kit’s memoize to cache `ClientStorage` instances based on a composite key (clientId-storageName). This dramatically improves performance by reusing existing storage instances, avoiding redundant initialization.
*   **Storage Delegation:** It intelligently delegates storage operations to either `ClientStorage` for client-specific data or `SharedStorageConnectionService` for shared storage, tracked via the `_sharedStorageSet`.
*   **Integration with Services:** It seamlessly integrates with several other services including `ClientAgent`, `StoragePublicService`, `SharedStorageConnectionService`, `AgentConnectionService`, `StorageSchemaService`, `EmbeddingSchemaService`, `SessionValidationService`, and `PerfService`.
*   **Core Operations:** It provides methods like `getStorage`, `take`, `upsert`, `remove`, `get`, `list`, and `clear` to manage data within the storage. These methods delegate to `ClientStorage` after initialization, leveraging context from `MethodContextService` for accurate identification and logging via `LoggerService` when enabled.
*   **Lifecycle Management:** The `dispose` method carefully cleans up resources, clearing the memoized instance and updating the `SessionValidationService`, while ensuring shared storage is handled separately by `SharedStorageConnectionService`.

In essence, `StorageConnectionService` acts as a central hub for all storage-related activities, optimizing performance and facilitating integration with other system components.

## Class StateUtils

The StateUtils class is a core utility designed to manage individual agent states within the AI agent swarm. It acts as an interface between agents and the swarm’s state service, providing methods to retrieve, update, and remove specific state data.

The `getState` method allows you to fetch the current state information for a particular agent, identified by its client ID and agent name, and the specific state name you're interested in. It performs validation to ensure the client session and agent-state registration are valid before querying the state service, and it operates within a logging context for tracking.

The `setState` method offers flexibility in updating agent states. You can either provide a direct state value or, more commonly, a function that calculates the new state based on the previous state.  Like `getState`, it validates the agent’s registration and uses a logging context.

Finally, the `clearState` method resets a specific agent’s state to its initial value, effectively removing any existing state data associated with that agent and state name.  It also validates the agent’s registration and utilizes a logging context for monitoring.

## Class StateSchemaService

The StateSchemaService is the core service responsible for managing all state schemas within the swarm system. It acts as a central registry, utilizing ToolRegistry from functools-kit to store and retrieve IStateSchema instances.  The service performs shallow validation on each schema to guarantee basic integrity, checking that the stateName is a string and the getState function is properly defined.

It integrates closely with other key services, including StateConnectionService, SharedStateConnectionService, ClientAgent, and AgentSchemaService.  The service leverages a LoggerService for informational logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations, aligning with the logging patterns of related services.

The StateSchemaService provides the foundational configuration for ClientState, allowing for the creation and management of state schemas used in ClientAgent execution and referenced within AgentSchemaService.  It’s designed to be used with StateConnectionService and SharedStateConnectionService, ensuring consistent state definitions across the swarm.  New schemas are registered using the `register` method, and existing schemas are retrieved using the `get` method, both with logging enabled when GLOBAL_CONFIG.CC_ LOGGER_ENABLE_INFO is true.


## Class StatePublicService

The StatePublicService is a core service within the swarm system, designed to manage client-specific state data. It acts as a public interface for interacting with this state, providing methods for setting, clearing, retrieving, and disposing of data tied to individual clients.  This service leverages a StateConnectionService for the underlying state operations and integrates closely with the ClientAgent, PerfService, and DocService.

Specifically, it uses a LoggerService for logging operations at the info level, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting.  The service is distinguished from system-wide state managed by SharedStatePublicService and persistent storage handled by SharedStoragePublicService because it focuses exclusively on state associated with each client, identified by a unique `clientId`.

Key functionalities include:

*   **`setState`:**  This method allows you to update a client's state. It takes a dispatch function to handle the state update, along with the client ID and state name. It wraps the core StateConnectionService.setState operation, incorporating logging and context scoping.
*   **`clearState`:** This method resets a client's state to its initial value, again using the `clientId` and `stateName` to identify the state.
*   **`getState`:** This method retrieves the current state for a client, providing access to the latest state data.
*   **`dispose`:** This method cleans up resources associated with a client's state, ensuring proper cleanup after a client's work is complete.

The service is designed to be used within the ClientAgent during operations like `EXECUTE_FN` and is also utilized by the PerfService for tracking state changes and managing session state per client.  It provides a structured and controlled way to manage client-specific state within the swarm system.

## Class StateConnectionService

The `StateConnectionService` is a core component within the swarm system, responsible for managing individual state instances and their connections. It acts as a central hub for state operations, ensuring efficient reuse and thread-safe modifications. This service provides an interface (`getStateRef`, `setState`, `clearState`) for accessing and manipulating state data, leveraging memoization via `functools-kit’s memoize` to optimize performance.

Key features include delegation to `SharedStateConnectionService` for shared states, tracked via the `_sharedStateSet`, and integration with several other services like `ClientAgent`, `AgentConnectionService`, `StatePublicService`, and `PerfService`. It utilizes dependency injection to receive services such as `LoggerService`, `BusService`, `MethodContextService`, `StateSchemaService`, and `SessionValidationService`.

The `getStateRef` method is central, employing memoization to cache `ClientState` instances based on a composite key (clientId-stateName), reducing redundant initialization. It handles both client-specific and shared state scenarios, utilizing the `SessionValidationService` for lifecycle tracking. The `setState` and `clearState` methods provide mechanisms for updating and resetting state data, respectively, while `dispose` cleans up resources and manages the lifecycle of client-specific states.  Logging is enabled via `LoggerService` when configured, and the service is designed to seamlessly integrate with the broader swarm architecture.

## Class SharedStorageUtils

This class, `SharedStorageUtils`, acts as a central tool for interacting with the swarm’s shared storage. It provides a consistent interface for managing data within the swarm, offering methods for retrieving, inserting, updating, deleting, and listing items. 

The core functionality revolves around the `take` method, which allows you to search for and retrieve a specific number of items based on a search query.  The `upsert` method handles both inserting new items and updating existing ones within the shared storage.  You can also remove individual items using the `remove` method, identified by their unique ID.

For retrieving a single item by its ID, the `get` method is available.  Furthermore, the `list` method enables you to list all items within a specific storage, with the option to filter the results based on a provided condition. Finally, the `clear` method provides a way to remove all data from a designated storage.  All these operations are executed within a controlled context, incorporating logging and validation to ensure data integrity and proper operation within the swarm.

## Class SharedStoragePublicService

This class, SharedStoragePublicService, provides a public interface for managing shared storage operations within the swarm system. It implements `TSharedStorageConnectionService` to offer a standardized API for interacting with shared storage, delegating the core storage operations to the `SharedStorageConnectionService`. This service is then wrapped with `MethodContextService` for robust scoping and context management.

The service integrates with several key components: `ClientAgent` for tasks like data retrieval and storage within `EXECUTE_FN`, `PerfService` for tracking storage usage and updates in `sessionState`, and `DocService` for documenting storage schemas and contents via the `storageName`.  Logging is handled through the `LoggerService` (enabled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`), providing info-level logging consistent with other services.

Key functionalities include:

*   **`take`**: Retrieves a list of storage items based on a search query and total count, utilizing the `SharedStorageConnectionService`.
*   **`upsert`**: Inserts or updates a single item in shared storage, again leveraging the `SharedStorageConnectionService` and `MethodContextService`.
*   **`remove`**: Deletes a specific item from shared storage based on its ID.
*   **`get`**: Retrieves a single item from shared storage by its ID.
*   **`list`**: Retrieves a list of all items in shared storage, optionally filtered using a provided predicate.
*   **`clear`**: Removes all items from shared storage.

Each of these methods are designed to be robust and context-aware, utilizing `MethodContextService` for proper scoping and logging via the `LoggerService` when logging is enabled.  The service is injected with dependencies – a `LoggerService` instance and a `SharedStorageConnectionService` – to ensure loose coupling and testability.

## Class SharedStorageConnectionService

The SharedStorageConnectionService acts as the central hub for managing shared storage instances within the swarm system. It provides a single, consistent interface for clients to interact with shared data, ensuring data integrity and efficient retrieval. This service utilizes memoization to maintain a persistent, shared ClientStorage instance, optimized for performance and reducing redundant initialization.

Key functionalities include:

*   **Shared Instance Management:** The service creates and manages a single `ClientStorage` instance, identified by a `storageName`, accessible across all clients with a fixed `clientId` of "shared."
*   **Configuration and Schema Handling:** It leverages the `StorageSchemaService` and `EmbeddingSchemaService` to dynamically configure the shared storage with appropriate settings, including persistence mechanisms and embedding logic.
*   **Data Retrieval and Manipulation:** The service offers methods for retrieving, updating, and deleting data, delegating these operations to the underlying `ClientStorage` instance.
*   **Integration with Core Services:** It seamlessly integrates with services like `ClientAgent`, `AgentConnectionService`, `SharedStoragePublicService`, and `PerfService` for robust operation and performance monitoring.
*   **Event Propagation:** The service utilizes the `BusService` to propagate storage-related events, aligning with the broader event system of the swarm.

The service’s core mechanism is the `getStorage` method, which employs functools-kit’s memoize to cache the `ClientStorage` instance, guaranteeing a consistent view of the shared storage.  It also incorporates logging via `LoggerService` (when enabled) and utilizes the `MethodContextService` for accurate scoping and context-aware operations.  The service provides a robust and well-integrated solution for managing shared storage within the swarm architecture.

## Class SharedStateUtils

The SharedStateUtils class is a core tool for managing shared information across an agent swarm. It’s built around the concept of `TSharedState` and provides a simple way to interact with the swarm’s shared state service.

You can use SharedStateUtils to retrieve current state data for any named state. The `getState` method returns the data, handling logging and communication with the service.

Another key function is `setState`. This method allows you to update the shared state.  You can either provide a direct value to set, or, more powerfully, you can pass a function. This function takes the previous state and allows you to calculate the new state based on it – perfect for reactive updates.

Finally, `clearState` resets the shared state for a specific name, returning it to its initial, empty state. Like the other methods, it operates within a logging context and communicates with the shared state service.

## Class SharedStatePublicService

The SharedStatePublicService acts as a central interface for managing shared state operations within the swarm system. It’s built upon the `TSharedStateConnectionService` to provide a public API, handling the underlying state interactions while incorporating context management through the `MethodContextService`. This service integrates seamlessly with other components like the `PerfService` for tracking state changes and the `ClientAgent` for managing state within execution functions.  

Key functionalities include setting, clearing, and retrieving shared state, all wrapped with logging capabilities controlled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`.  The `setState` method updates the state using a provided dispatch function, while `clearState` resets it to its initial value.  `getState` provides access to the current state value.  The service leverages dependency injection to include the `loggerService` for consistent logging patterns and the `sharedStateConnectionService` for the core state management operations. These methods are utilized by the `ClientAgent` and `PerfService` to manage state effectively across the system.


## Class SharedStateConnectionService

This class, SharedStateConnectionService, manages connections and operations for shared state within the swarm system. It implements `IState<T>`, providing an interface for shared state instance management, manipulation, and access.  The scope of this service is fixed to the `stateName` across all clients, utilizing a consistent `clientId` of "shared."

It integrates with several key components including ClientAgent, StatePublicService, SharedStatePublicService, and AgentConnectionService.  For efficient operation, it employs memoization using functools-kit’s memoize to cache `ClientState` instances by `stateName`, ensuring a single shared instance is used across all clients.  Updates are queued for serialization, guaranteeing thread-safe modifications.

The service relies on logging via LoggerService (controlled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`) and coordinates with StateSchemaService for state configuration, applying persistence through PersistStateAdapter or defaults from `GLOBAL_CONFIG`.

Key functionalities include:

*   **getStateRef:** This method retrieves or creates a memoized `ClientState` instance for a given `stateName`, utilizing memoization for efficiency and thread safety. It configures the state with schema data from StateSchemaService and enforces shared=true.
*   **setState:** This method sets the shared state using a dispatch function, delegating to `ClientState.setState` after awaiting initialization and logging if enabled.
*   **clearState:** This method clears the shared state, resetting it to its initial value, also delegating to `ClientState.clearState` with logging and error checking.
*   **getState:** This method retrieves the current shared state, delegating to `ClientState.getState` with logging and error checking.

The service utilizes injected dependencies including LoggerService, BusService, MethodContextService, and StateSchemaService.  It leverages the BusService for event propagation (aligned with AgentConnectionService’s event system) and the MethodContextService for accessing execution context and `stateName`.


## Class SessionValidationService

The SessionValidationService is responsible for managing and verifying the status of sessions within the swarm system. It meticulously tracks each session’s connections to swarms, modes, agents, histories, and storage, ensuring that resources are used correctly and consistently.

This service integrates closely with several other components, including SessionConnectionService for session management, ClientSession for session lifecycle control, ClientAgent for agent usage tracking, ClientStorage for storage management, ClientState for state management, and SwarmSchemaService for defining session-swarm relationships.

The service utilizes dependency injection to manage its logger, controlled via GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO, and employs memoization techniques to optimize validation checks.

Key functionalities include:

*   **Session Registration:** The `addSession` method registers a new session, logging the operation and ensuring uniqueness.
*   **Resource Tracking:** Methods like `addAgentUsage`, `addHistoryUsage`, `addStorageUsage`, and `addStateUsage` track the usage of agents, histories, storage, and states within each session.
*   **Data Retrieval:**  Methods like `getSessionMode`, `getSwarm`, `getSessionAgentList`, `getSessionHistoryList`, and `getSessionList` provide access to session information.
*   **Validation:** The `validate` method performs thorough session existence checks, leveraging memoization for efficiency.
*   **Session Cleanup:** The `removeSession` method removes sessions and associated data, while `dispose` clears validation caches.

The service provides essential validation capabilities, supporting the core requirements of the swarm system by ensuring session integrity and resource management.

## Class SessionPublicService

This `SessionPublicService` class provides a public interface for interacting with a session within the swarm system. It implements `TSessionConnectionService` to manage session operations, delegating to `SessionConnectionService` for core functionality and utilizing `MethodContextService` and `ExecutionContextService` for scoping and detailed tracking.

The service integrates with several key components: `ClientAgent` for session-level messaging, `AgentPublicService` for swarm context emission, `PerfService` for execution metrics, and `BusService` for event handling.  It leverages `LoggerService` for informational logging (controlled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`), supporting operations like message emission, execution, connection handling, and session disposal.

Key methods include `emit`, `execute`, and `run` for sending commands and running stateless completions within the session, along with `connect` to establish a messaging channel with performance tracking.  The service also provides methods for committing tool output, system messages, and user messages to the session’s history, mirroring functionality found in `ClientAgent` and `AgentPublicService`.  Finally, `dispose` cleans up session resources.  The service utilizes dependency injection for `LoggerService`, `PerfService`, and `SessionConnectionService` instances, ensuring consistent logging patterns and efficient session management.

## Class SchemaUtils

The SchemaUtils class offers a set of tools designed to handle interactions with client session memory and the formatting of data. It provides methods for both writing data to and reading data from a client's session.

Specifically, the `writeSessionMemory` function allows you to store a value within a client's session memory, always operating within a controlled context for logging and validation to maintain session integrity. Conversely, the `readSessionMemory` function retrieves data from a client's session, again utilizing a validation context.

Furthermore, the `serialize` function is versatile, capable of converting objects – whether single instances or arrays – into structured strings. It supports flattening nested objects and includes an optional mapping system to customize the formatting process, giving you fine-grained control over how data is represented as a string.

## Class PolicyValidationService

The PolicyValidationService is a core component within the swarm system, responsible for ensuring the integrity of policies. It maintains a central registry of all registered policies, verifying their uniqueness and availability. This service works closely with other key components, including the PolicySchemaService for initial policy registration, the ClientPolicy service for enforcement, and the AgentValidationService. 

The service utilizes dependency injection to manage its logging, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting, and employs memoization to speed up policy existence checks. 

Key functionalities include:

*   **`addPolicy(policyName: string, policySchema: IPolicySchema) => void`**: This method registers a new policy with its schema, leveraging the PolicySchemaService’s registration process and logging the operation.
*   **`validate(policyName: string, source: string) => void`**: This method efficiently checks if a policy name exists in the registry, optimizing performance through memoization. It logs the validation attempt and supports the validation needs of the ClientPolicy service.

## Class PolicyUtils

The PolicyUtils class offers a set of tools for managing client bans within your swarm policy system. It’s designed to ensure robust operation by validating all inputs and executing within a context that supports logging and tracking.

Key functionalities include:

*   **`banClient`**: This method allows you to ban a client under a defined policy within a specific swarm. Before executing the ban, it thoroughly validates the client ID, swarm name, and policy name to maintain data integrity.

*   **`unbanClient`**:  This counterpart reverses the `banClient` operation, unbanning a client from a policy within a swarm.  Like `banClient`, it performs input validation.

*   **`hasBan`**: This method checks whether a client is currently banned under a given policy within a swarm.  It also validates the input parameters before querying the policy service.


## Class PolicySchemaService

The PolicySchemaService is the core service responsible for managing all policy schemas within the swarm system. It acts as a central registry, utilizing ToolRegistry from functools-kit to store and retrieve IPolicySchema instances. The service performs shallow validation on each schema, ensuring critical fields like `policyName` and `getBannedClients` are present and valid, aligning with the requirements of services like PolicyConnectionService, ClientAgent, and SessionConnectionService.

It leverages a LoggerService for informational logging (controlled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`) during registration, retrieval, and validation operations, mirroring the logging patterns of related services.  The service’s primary function is to provide validated policy logic, such as the `getBannedClients` function, which is fundamental to access control and restrictions across the swarm.

The service is initialized with a ToolRegistry and maintains an immutable registry, updated solely through the `register` method.  This ensures a consistent collection of policy schemas.  The `get` method retrieves schemas by name, supporting the execution of ClientAgent and the management of SessionConnectionService sessions.


## Class PolicyPublicService

This class, PolicyPublicService, acts as the central point of contact for all public policy operations within the swarm system. It leverages the `TPolicyConnectionService` to handle the core policy logic, while providing a user-friendly API.  The service wraps these calls with the `MethodContextService` to manage the scope of operations and ensures consistent logging using the `LoggerService`, controlled by the `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` setting.

Key functionalities include checking if a client is banned (`hasBan`), retrieving ban messages (`getBanMessage`), validating both incoming and outgoing data (`validateInput`, `validateOutput`), and directly banning or unbanning clients (`banClient`, `unbanClient`). These operations are integrated with other services like `PerfService` (for policy enforcement in compute states) and `ClientAgent` (for applying policies during client execution).  The `LoggerService` provides detailed logging for these actions, and the `MethodContextService` ensures proper context is maintained throughout the process.  The service relies on the `PolicyConnectionService` for its underlying policy operations.

## Class PolicyConnectionService

The PolicyConnectionService is a core component within the AI agent swarm orchestration framework, responsible for managing policy connections and operations. It implements the `IPolicy` interface, providing a centralized point for policy instance management, ban status checks, input/output validation, and ban management, all scoped to a specific policy name, client ID, and swarm name.

This service integrates with several other key components including ClientAgent (for policy enforcement during execution), SessionPublicService (for session-level policy enforcement), PolicyPublicService (for public API access), and SwarmPublicService (for swarm context), alongside PerfService for performance tracking via BusService. To optimize performance, the service utilizes memoization through functools-kit’s memoize, caching `ClientPolicy` instances by policy name for efficient reuse across calls.

The service’s core functionality is centered around the `getPolicy` method, which retrieves or creates a memoized `ClientPolicy` instance. It leverages the PolicySchemaService to obtain policy configurations, defaulting autoBan to `GLOBAL_CONFIG.CC_AUTOBAN_ENABLED_BY_DEFAULT` if not explicitly defined.

Key operations include checking for bans using `hasBan`, retrieving ban messages with `getBanMessage`, and validating both incoming and outgoing inputs and outputs using `validateInput` and `validateOutput`, respectively. These operations delegate to the `ClientPolicy` for actual enforcement, while maintaining a consistent logging mechanism via the LoggerService (controlled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`) and utilizing the MethodContextService for accurate scoping. Finally, the service provides methods for banning and unbanning clients, mirroring functionality found in PolicyPublicService and supporting ClientAgent and SessionPublicService’s policy actions, all coordinated through the BusService for event emission.

## Class PersistSwarmUtils

The PersistSwarmUtils class provides a foundational toolkit for managing persistent data related to AI agent swarms. It acts as an `IPersistSwarmControl` implementation, focusing on maintaining the state of active agents and their associated navigation stacks. 

At its core, the class offers utilities for retrieving and updating these persistent elements.  It utilizes memoized functions, `getActiveAgentStorage` and `getNavigationStackStorage`, to ensure a single, consistent storage instance is used for each swarm, identified by its name.

Key functionalities include `getActiveAgent`, which allows you to retrieve the currently active agent for a specific client within a swarm, with a default agent provided if none is defined. Conversely, `setActiveAgent` lets you designate a new active agent.  Similarly, `getNavigationStack` retrieves the navigation stack for a client, and `setNavigationStack` allows you to define a new one.

Furthermore, the class supports customization through adapters. The `usePersistActiveAgentAdapter` and `usePersistNavigationStackAdapter` methods enable you to inject your own persistence logic using a custom constructor, overriding the default `PersistBase` implementation for greater flexibility.

## Class PersistStorageUtils

This class, `PersistStorageUtils`, acts as a central tool for managing data persistence across different clients and for each unique storage name. It’s designed to ensure that each client has its own dedicated storage instance, preventing conflicts and maintaining data isolation.

The core functionality revolves around `getPersistStorage`, a memoized function that either retrieves an existing storage instance for a given storage name or creates a new one if it doesn’t already exist. This guarantees a single, consistent storage setup per name.

You can customize the underlying storage mechanism using the `usePersistStorageAdapter` method. This allows you to provide a custom constructor, replacing the default `PersistBase` with your own implementation for handling data persistence.

The `getData` method provides a way to retrieve data from a client’s storage. It intelligently handles situations where data isn’t yet present, falling back to a specified default value if needed. Finally, the `setData` method allows you to persist data for a client in a specific storage, encapsulating the data within an `IPersistStorageData` structure for consistent handling.

## Class PersistStateUtils

The PersistStateUtils class offers a flexible way to manage and persist state information for individual clients, based on a defined state name. It acts as a utility, providing methods to easily get and set state data, utilizing a configurable persistence adapter.

Key features include:

*   **State-Based Management:**  It organizes state data around specific state names, allowing for clear separation and organization.
*   **Custom Persistence:** You can supply your own persistence adapter through the `usePersistStateAdapter` method, giving you complete control over how state data is stored and retrieved.
*   **Memoized Storage:** The `getStateStorage` function ensures that only one storage instance is created per state name, optimizing performance and preventing unintended side effects.
*   **Client-Specific State:** The `setState` method allows you to set state data specifically for a given client, while the `getState` method retrieves it.
*   **Default Fallback:** The `getState` method provides a default state if the desired state hasn't been previously set.

## Class PersistMemoryUtils

This utility class, `PersistMemoryUtils`, is designed to manage a client’s memory data persistently. It acts as a central point for accessing and updating memory information, ensuring each client has its own dedicated storage.  The core functionality revolves around a `PersistMemoryFactory` which handles the creation of the underlying storage mechanism.

The `getMemory` method retrieves a client’s memory data, gracefully falling back to a specified default state if the data hasn’t been previously set.  Similarly, the `setMemory` method allows you to save memory data for a client, encapsulating it within an `IPersistMemoryData` structure.

To customize the persistence behavior, you can use the `usePersistMemoryAdapter` method, allowing you to provide a custom constructor for the persistence logic, overriding the standard `PersistBase` implementation. Finally, the `dispose` method provides a way to cleanly remove the memory storage associated with a specific client ID, releasing any resources.

## Class PersistList

The PersistList class extends the PersistBase framework to create a persistent, ordered list of entities. It utilizes numeric keys to maintain the order of items within the list. 

The class manages a counter, `_lastCount`, to track the number of items in the list and a unique key generation mechanism, `__@LIST_CREATE_KEY_SYMBOL@526`, to ensure each new entity receives a distinct, sequential key, even when multiple operations are running concurrently.

A key retrieval function, `__@LIST_GET_ LAST_KEY_SYMBOL@527`, is available to access the key of the most recently added item.  Furthermore, a dedicated `__@LIST_POP_SYMBOL@529` function provides atomic removal of the last item, guaranteeing consistency during concurrent operations.

The PersistList offers two primary methods: `push` which adds a new entity to the end of the list, assigning it a unique key and `pop` which removes and returns the last added entity. Both methods are asynchronous, returning a Promise for completion.

## Class PersistBase

The PersistBase class serves as the foundation for persistent storage of entities within the system. It’s designed to manage data using JSON files stored in a specified directory.

This class provides core functionality for interacting with the storage, including reading and writing entities based on their unique IDs.  The `waitForInit` method is crucial; it automatically initializes the storage directory, creating it if necessary and importantly, validates existing entities, removing any corrupted or outdated files.

Key methods include `_getFilePath`, which calculates the exact file path for an entity, and `writeValue`, which serializes an entity to JSON and writes it to the file system, ensuring data integrity through atomic file writing.  You can also use `readValue` to retrieve entities, `hasValue` to check for their existence, and `removeValue` to delete them.

The `PersistBase` class also offers advanced features like iterating over all stored entities using the `values` method, which yields them in ascending order by ID, and filtering entities based on specific criteria with the `filter` method.  It also provides an asynchronous iterator using the `__@asyncIterator@482` symbol.  Finally, the `take` method allows you to retrieve a limited number of entities, optionally filtered.

## Class PerfService

Okay, here’s a summary of the `PerfService` API reference, written in a more human-friendly style:

**The PerfService is the heart of performance tracking within the swarm system.** Its primary job is to meticulously monitor how client sessions are running, collecting detailed data about execution times, input/output lengths, and overall system performance.

**Here's how it works:**

*   **Tracking Sessions:** When a client starts a session (using functions like `startExecution`), the `PerfService` begins recording key metrics, such as the time it takes to complete the session and the amount of data being sent and received. It uses maps to store this information for each client.
*   **Measuring Performance:** The `PerfService` uses `startExecution` and `endExecution` to accurately measure the duration of each session.
*   **Creating Reports:**  It then compiles this data into structured reports (`toClientRecord` and `toRecord`) that provide insights into individual client performance and overall system health.
*   **Cleaning Up:** When a session ends, the `PerfService` cleans up the collected data to ensure accurate tracking and prevent memory issues.

**Key Features:**

*   **Detailed Metrics:** Tracks execution times, input/output lengths, and memory usage.
*   **Client-Specific Reports:** Generates reports tailored to individual clients.
*   **System-Wide Insights:** Creates aggregated reports for overall system performance.
*   **Flexible Tracking:** Uses `startExecution` and `endExecution` to handle session start and end events.

**In essence, the PerfService is a critical component for understanding and optimizing the performance of your swarm system.**

---

Would you like me to:

*   Focus on a specific aspect of the `PerfService` (e.g., its relationship to `startExecution` and `endExecution`)?
*   Generate a summary tailored to a particular use case (e.g., debugging performance issues)?

## Class MemorySchemaService

The MemorySchemaService provides a lightweight, in-memory key-value store specifically designed for managing session data within the swarm system. It utilizes a Map, associating each session’s unique identifier (clientId) with any type of object, offering a flexible, transient memory layer.

This service integrates closely with other components like SessionConnectionService, ClientAgent, and SessionPublicService, leveraging the LoggerService for logging operations at the INFO level (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO).

Key functionalities include:

*   **writeValue:**  Allows writing data to the memoryMap, merging the new value with any existing data for a given clientId.
*   **readValue:** Retrieves data from the memoryMap for a specific clientId, returning an empty object if no data exists.
*   **dispose:** Removes the session-specific data entry from the memoryMap, facilitating session termination or resets.

Essentially, the MemorySchemaService acts as a session-scoped, non-persistent memory layer, providing a central location for managing runtime data and supporting the overall operation of the swarm system.

## Class LoggerService

This LoggerService provides centralized logging functionality throughout the AI agent swarm system. It implements the ILogger interface, allowing for consistent logging practices across various components. The service intelligently routes log messages – including normal, debug, and info levels – to both client-specific loggers and a common logger.

It leverages MethodContextService and ExecutionContextService to attach relevant metadata to each log message, such as the client ID, ensuring traceability and context for debugging and monitoring.  The LoggerService dynamically adapts to the environment, utilizing configuration flags (like `CC_LOGGER_ENABLE_DEBUG` or `CC_LOGGER_ENABLE_INFO`) to control logging levels and behavior.

Key features include runtime logger replacement via the `setLogger` method, offering flexibility for testing or advanced configurations.  The service also utilizes a factory function (`getLoggerAdapter`) to efficiently create client-specific logger adapters, drawing configuration from `GLOBAL_CONFIG.CC_GET_CLIENT_LOGGER_ADAPTER`.  This design promotes modularity and adaptability within the swarm's architecture.


## Class LoggerInstance

The LoggerInstance is a core component designed to handle logging specifically for a particular client. It’s built upon the `ILoggerInstance` interface, providing a structured way to manage logging operations. 

You initialize a LoggerInstance by specifying a unique `clientId` and providing optional callbacks through the `callbacks` property. These callbacks allow you to customize the logging behavior.

The `waitForInit()` method ensures that the logger instance is initialized only once, using a memoized approach. This prevents redundant initialization and guarantees consistent behavior.

Key logging functions include `log`, `debug`, and `info`, which send messages to the console if console logging is enabled via the `GLOBAL_CONFIG`.  Each of these functions can also trigger custom callback functions defined in the `callbacks` object.

Finally, the `dispose()` method provides a clean way to shut down the logger instance, invoking a callback if one is defined, and performing synchronous cleanup.

## Class HistoryPublicService

The HistoryPublicService manages public history operations within the swarm system. It acts as a central interface, utilizing the HistoryConnectionService for the core history management tasks.  This service provides a public API, delegating operations like pushing, popping, and converting history to arrays.

It achieves this by integrating with several key components: the ClientAgent for message logging, AgentPublicService for system message handling, PerfService for performance tracking, and DocService for documenting history usage.  The service leverages a LoggerService for logging operations at the info level, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting.

Key functionalities include:

*   **`push`**: Adds a message to the agent's history, wrapped with MethodContextService for scoping and logging.  Used in scenarios like committing system or user messages within the ClientAgent and AgentPublicService.
*   **`pop`**: Retrieves the most recent message from the agent’s history, also wrapped with MethodContextService and logging.  Supports retrieving the last message in the ClientAgent’s EXECUTE_FN.
*   **`toArrayForAgent`**: Converts the agent’s history into an array, incorporating a prompt for agent processing, again with MethodContextService and logging.  Used in the ClientAgent for preparing EXECUTE_FN contexts and in the DocService for documenting history with prompts.
*   **`toArrayForRaw`**: Converts the agent’s history into a raw array of messages, also with MethodContextService and logging.  Supports raw history access in the ClientAgent and performance metrics in the PerfService.
*   **`dispose`**: Cleans up the agent’s history, utilizing MethodContextService and logging, aligning with AgentPublicService and PerfService disposal patterns.

The service relies on dependency injection to provide instances of the HistoryConnectionService and LoggerService, ensuring consistent logging behavior across the system.

## Class HistoryPersistInstance

The `HistoryPersistInstance` class provides a persistent way to track the messages exchanged within an AI agent system. It manages this history by storing messages both in memory and on disk, ensuring data isn't lost when the system restarts.

The class is initialized with a unique `clientId` and a set of optional callbacks that allow you to customize its behavior.  It internally uses an array to hold the messages and a persistent storage mechanism (likely a list) to reliably save and retrieve them.

A key feature is the `waitForInit` method, which ensures that the history is properly initialized for a specific agent, loading existing data from persistent storage if it's available.  The `iterate` method allows you to efficiently browse the history, applying any configured filters and system prompts.  You can also use this method to trigger callbacks during the iteration process.

The `push` method adds new messages to the history and automatically persists them to storage, while the `pop` method retrieves and removes the last message, also updating the persistent storage. Finally, the `dispose` method cleans up the history, removing all data if the agent's history is being discarded.


## Class HistoryMemoryInstance

The HistoryMemoryInstance is a core component of the AI agent swarm orchestration framework, designed to manage an in-memory record of messages. It operates without saving data to persistent storage, focusing on immediate message tracking.

You initialize a HistoryMemoryInstance by providing a unique `clientId` and an optional set of callbacks through the constructor. These callbacks allow you to react to key events like message additions, removals, and changes.

The `waitForInit` method is crucial for ensuring the history is properly set up for a specific agent. It handles the initial loading of data, streamlining the process for new agents.

The `iterate` method provides a powerful way to access and process the history. It allows you to efficiently retrieve messages while also triggering callbacks based on your configured filters and system prompts.

Key operations include adding messages with `push`, removing the last message with `pop`, and disposing of the instance when it’s no longer needed.  The `push` and `pop` methods also invoke callbacks when these actions occur, offering further customization.  Finally, the `dispose` method cleans up the history, either completely or just for a specific agent.

## Class HistoryConnectionService

The HistoryConnectionService manages history connections for agents within the swarm system. It implements the `IHistory` interface to provide a structured way to handle message storage and retrieval, scoped by both client ID and agent name. This service integrates with several core components, including ClientAgent for local history execution, AgentConnectionService for history provisioning, and HistoryPublicService for a public history API.

To optimize performance, the service utilizes memoization via functools-kit’s memoize, caching `ClientHistory` instances based on a composite key (clientId-agentName). This ensures efficient reuse of history connections across multiple calls.  Logging is handled through the LoggerService, controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO, and the service communicates with SessionValidationService for tracking usage and with BusService for event emission.

The `getHistory` method is central, retrieving or creating a memoized `ClientHistory` instance. The `push` method adds messages to the agent’s history, delegating to `ClientHistory.push` and logging activity. Similarly, `pop` retrieves the most recent message, and `toArrayForAgent` and `toArrayForRaw` convert the history to arrays for agent execution or raw reporting.

The service relies on injected dependencies such as the LoggerService, BusService, MethodContextService, and SessionValidationService.  The `dispose` method cleans up resources, clearing the memoized instance and updating SessionValidationService, mirroring the disposal patterns of HistoryPublicService and PerfService.

## Class EmbeddingValidationService

The EmbeddingValidationService is a core component of the swarm system, responsible for ensuring the integrity of embedding names. It maintains a central map of all registered embeddings and their associated schemas, guaranteeing uniqueness and verifying their existence. 

This service works closely with several other systems: the EmbeddingSchemaService for initial registration, ClientStorage for validating embeddings used in similarity searches, and AgentValidationService when checking embeddings for agents. 

The service utilizes dependency injection to manage logging, controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO, and employs memoization to efficiently validate embedding names.  The `validate` function is particularly important, as it checks for the existence of an embedding name within the map, supporting the validation needs of ClientStorage and AgentValidationService.  The `addEmbedding` function handles the registration of new embeddings, integrating with the EmbeddingSchemaService’s registration process.

## Class EmbeddingSchemaService

The EmbeddingSchemaService is the central component for managing embedding definitions within the swarm system. It acts as a registry, storing and retrieving IEmbeddingSchema instances using a ToolRegistry for efficient management. The service performs shallow validation on each schema, ensuring critical elements like `embeddingName`, `calculateSimilarity`, and `createEmbedding` functions are present and valid.

This service integrates closely with other key components, including StorageConnectionService and SharedStorageConnectionService, facilitating storage operations like similarity searches. It leverages a LoggerService for logging operations at the INFO level, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting, aligning with logging patterns used by StorageConnectionService and PerfService.

The service’s core functionality revolves around registering new schemas via the `register` method, which validates them before adding them to the ToolRegistry.  Retrieval of schemas is handled through the `get` method, also logging operations when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled.  Ultimately, the EmbeddingSchemaService provides the foundational embedding logic used in storage operations, ensuring consistency and integrity across the swarm ecosystem.


## Class DocService

The DocService is a core component of the swarm system, responsible for generating comprehensive documentation for swarms, agents, and performance data. It produces Markdown files detailing swarm and agent schemas, including UML diagrams created using PlantUML, and JSON files for performance metrics. The service integrates indirectly with the ClientAgent by documenting its schema and performance data, leveraging a thread pool for concurrent execution and a directory structure for organized output.

**Constructor:** The DocService constructor initializes its dependencies, including logging, performance, and schema services.

**Properties:**

*   **loggerService:** Provides logging capabilities, controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
*   **perfService:** Used to retrieve and serialize performance data.
*   **swarmValidationService:** Ensures only valid swarm names are documented.
*   **agentValidationService:** Ensures only valid agent names are documented.
*   **swarmSchemaService:** Retrieves ISwarmSchema objects for generating swarm documentation.
*   **agentSchemaService:** Retrieves IAgentSchema objects for generating agent documentation.
*   **policySchemaService:** Supplies policy descriptions for documenting banhammer policies.
*   **toolSchemaService:** Provides tool details for documenting agent tools.
*   **storageSchemaService:** Documents storage resources used by agents.
*   **stateSchemaService:** Documents state resources used by agents.
*   **agentMetaService:** Generates UML diagrams for agents.
*   **swarmMetaService:** Generates UML diagrams for swarms.

**Methods:**

*   **writeSwarmDoc:** Creates Markdown documentation for a swarm, including its schema, UML diagram, agents, and policies.
*   **writeAgentDoc:** Creates Markdown documentation for an agent, including its schema, UML diagram, prompts, tools, storage, and state.
*   **dumpDocs:** Generates documentation for all swarms and agents concurrently, utilizing the thread pool and integrating with ClientAgent.
*   **dumpPerfomance:** Dumps system-wide performance data to a JSON file.
*   **dumpClientPerfomance:** Dumps performance data for a specific client to a JSON file.

## Class CompletionValidationService

The CompletionValidationService is a core component within the swarm system, responsible for ensuring the integrity of completion names. It maintains a registry of all registered completion names, actively checking for uniqueness and existence during validation processes. 

This service integrates seamlessly with several other key components: the CompletionSchemaService for initial registration, the AgentValidationService for agent-level validation, and the ClientAgent for completion usage.  

The service utilizes dependency injection to manage its logging, leveraging the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting for controlled logging.  It employs memoization to optimize validation checks by storing results based on the completion name. 

Key functionalities include registering new completion names via the `addCompletion` method, which logs the operation and enforces uniqueness, and validating existing names using the `validate` method, which is optimized for performance.  The `validate` method is used by the AgentValidationService to confirm the validity of completion names when agents are utilizing them.

## Class CompletionSchemaService

The CompletionSchemaService is the core service for managing all completion logic within the swarm system. It acts as a central registry, utilizing ToolRegistry from functools-kit, to store and retrieve ICompletionSchema instances.  This service performs shallow validation on each schema to guarantee basic integrity, specifically checking that the `completionName` is a string and the `getCompletion` function is present – crucial for seamless execution by ClientAgent, AgentConnectionService, and SwarmConnectionService.

The service leverages a LoggerService for informational logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations, mirroring the logging patterns used in AgentSchemaService and PerfService.  It’s designed to be robust and adaptable, supporting the diverse needs of the swarm’s agent execution, from initial agent instantiation via AgentConnectionService to direct execution by ClientAgent.  New schemas are added to the registry via the `register` method, and existing schemas are retrieved using the `get` method, all while maintaining consistency and facilitating efficient agent workflows.


## Class ClientSwarm

ClientSwarm

Implements `ISwarm`

Manages a collection of agents within a swarm, implementing the `ISwarm` interface.
It handles agent switching, output waiting, and navigation stack management, utilizing queued operations and event-driven updates through the `BusService`.

## Constructor

```ts
constructor(params: ISwarmParams);
```

## Properties

### params

```ts
params: ISwarmParams
```

### _agentChangedSubject

```ts
_agentChangedSubject: Subject<[agentName: string, agent: IAgent]>
```

A `Subject` that emits when an agent reference changes, providing the agent name and the instance.
This is used by `setAgentRef` to notify subscribers (like `waitForOutput`) of updates to agent instances.

### _activeAgent

```ts
_activeAgent: string | unique symbol
```

The name of the currently active agent, or a symbol indicating it needs to be fetched.
It's initialized as `AGENT_NEED_FETCH` and lazily populated by `getAgentName` via `params.getActiveAgent`.
Updated by `setAgentName` and persisted via `params.setActiveAgent`.

### _navigationStack

```ts
_navigationStack: string[] | unique symbol
```

The navigation stack of agent names, or a symbol indicating it needs to be fetched.
It's initialized as `STACK_NEED_FETCH`, lazily populated by `navigationPop` via `params.getNavigationStack`.
Updated by `setAgentName` (push) and `navigationPop` (pop), persisted via `params.setNavigationStack`.

### _cancelOutputSubject

```ts
_cancelOutputSubject: Subject<{ agentName: string; output: string; }>
```

A `Subject` that emits to cancel output waiting, providing an empty output string and the agent name.
Triggered by `cancelOutput` to interrupt `waitForOutput`, ensuring responsive cancellation.

## Methods

### navigationPop

```ts
navigationPop(): Promise<string>;
```

Pops the most recent agent from the navigation stack, falling back to the default agent if the stack is empty.
Updates and persists the stack via `params.setNavigationStack`, supporting `ClientSession`’s agent navigation.

### cancelOutput

```ts
cancelOutput(): Promise<void>;
```

Cancel’s the current output wait by emitting an empty output string via `_cancelOutputSubject`, logging via `BusService`.
Interrupts `waitForOutput`, ensuring responsive cancellation for `ClientSession`’s execution flow.

### getAgentName

```ts
getAgentName(): Promise<AgentName>;
```

Retrieves the name of the active agent, lazily fetching it via `params.getActiveAgent` if not loaded.
Emits an event via `BusService` with the result, supporting `ClientSession`’s agent identification.

### getAgent

```ts
getAgent(): Promise<IAgent>;
```

Retrieves the active agent instance (`ClientAgent`) based on its name from `params.agentMap`.
Emits an event via `BusService` with the result, supporting `ClientSession`’s execution and history operations.

### setAgentRef

```ts
setAgentRef(agentName: AgentName, agent: IAgent): Promise<void>;
```

Updates the reference to an agent in the swarm’s agent map (`params.agentMap`), notifying subscribers via `_agentChangedSubject`.
Emits an event via `BusService`, supporting dynamic agent updates within `ClientSession`’s execution flow.

### setAgentName

```ts
setAgentName(agentName: AgentName): Promise<void>;
```

Sets the active agent by name, updates the navigation stack, and persists the change via `params.setActiveAgent`/`setNavigationStack`.
Invokes the `onAgentChanged` callback and emits an event via `BusService`, supporting `ClientSession`’s agent switching.


## Class ClientStorage

ClientStorage

This class manages storage operations within the AI agent swarm system, leveraging embedding-based search for efficient data retrieval. It implements the `IStorage<T>` interface, supporting operations like creating, updating, removing, and clearing items, alongside similarity searches.

Key integrations include:

*   `StorageConnectionService`: For instantiation and connection management.
*   `EmbeddingSchemaService`:  Used to generate embeddings for items.
*   `ClientAgent`:  The primary client interacting with the storage.
*   `SwarmConnectionService`:  For swarm-level storage coordination.
*   `BusService`:  For event emission and communication.

**Constructor:**

The `constructor` accepts an `IStorageParams<T>` object, configuring the storage instance.

**Properties:**

*   `params`:  The configuration parameters passed to the constructor.
*   `_itemMap`: An internal `Map` that stores items keyed by their unique IDs, facilitating fast retrieval and updates. This map is populated during initialization and modified by `upserT`, `remove`, and `clear` operations.
*   `dispatch`: A function that queues and executes storage actions (upserT, remove, clear) sequentially, ensuring thread-safe updates from the `ClientAgent` or other tools.
*   `_createEmbedding`: A memoized function that generates embeddings for items, caching results by item ID to avoid redundant calculations. It’s cleared when an item is upserTed or removed, ensuring embeddings remain current via `CREATE_EMBEDDING_FN`.

**Methods:**

*   `take(search, total, score?)`: Retrieves a specified number of items based on their similarity to a search string, utilizing embeddings and a `SortedArray` for efficient ranking. It performs similarity calculations concurrently using an execution pool, respecting global configuration settings. The result is filtered by a score and an event is emitted via `BusService`, supporting the `ClientAgent`’s search-driven tool execution.
*   `upserT(item)`:  Adds a new item to the storage by queuing the operation for sequential execution, supporting the `ClientAgent`’s data persistence needs.
*   `remove(itemId)`:  Removes an item from the storage by its ID, queuing the operation for sequential execution, supporting the `ClientAgent`’s data management.
*   `clear()`:  Clears all items from the storage by queuing the operation for sequential execution, supporting a complete storage reset.
*   `get(itemId)`:  Retrieves a single item from the storage by its ID directly from the internal `_itemMap`. An event is emitted via `BusService` with the retrieved item, supporting quick lookups by the `ClientAgent` or other tools.
*   `list(filter?)`: Lists all items in the storage from the internal `_itemMap`, optionally filtered by a provided predicate function. An event is emitted via `BusService` with the filtered result if a filter is provided, supporting the `ClientAgent`’s data enumeration.
*   `dispose()`: Disposes of the storage instance, invoking a disposal callback if provided and logging the disposal event via `BusService`. This ensures proper cleanup when the storage is no longer needed, coordinating with the `StorageConnectionService`.


## Class ClientState

The ClientState class is the core component for managing individual states within the AI agent swarm system. It implements the `IState<State>` interface, providing a robust mechanism for handling state data, queued operations, and communication with other swarm services.

At its heart, the ClientState manages a single `State` object, initially set to null and populated during the `waitForInit` process. This process leverages the `WAIT_FOR_INIT_FN` to ensure the state is properly initialized, integrating seamlessly with the `StateConnectionService`.

The class offers several key functionalities. The `dispatch` method allows for queued read and write operations to the state, delegating these actions to a central dispatch function (`DISPATCH_FN`). This ensures thread-safe state updates, accommodating concurrent access from the `ClientAgent` or external tools.

You can directly manipulate the state using the `setState` and `clearState` methods. `setState` applies middleware and persists the updated state via `params.setState`, while `clearState` resets the state to its default value, also persisting the change. Both methods trigger events via the `BusService` and notify the `ClientAgent` of state modifications.

Furthermore, the `getState` method provides a way to retrieve the current state data, similarly triggering events and notifying the `ClientAgent` of state queries. Finally, the `dispose` method handles the cleanup process, releasing resources and invoking the `onDispose` callback when the state is no longer needed, integrating with the `StateConnectionService`.

## Class ClientSession

Represents a client session within the swarm system, implementing the `ISession` interface. It manages message execution, emission, and interactions with agents, enforced through `ClientPolicy` and facilitated by `BusService` for event-driven communication. The session integrates with several services including `SessionConnectionService` for instantiation, `SwarmConnectionService` for access to the swarm and agents via `SwarmSchemaService`, `ClientAgent` for execution and history management, `ClientPolicy` for validation, and `BusService` for event emission.

## Constructor

```ts
constructor(params: ISessionParams);
```

## Properties

### params

```ts
params: ISessionParams
```

### _emitSubject

```ts
_emitSubject: Subject<string>
```

A `Subject` used for emitting output messages to subscribers, utilized in the `emit` and `connect` methods. It provides an asynchronous stream of validated messages, supporting real-time updates to external connectors.

## Methods

### emit

```ts
emit(message: string): Promise<void>;
```

Emits a message to subscribers via `_emitSubject` after validating it against the `ClientPolicy`. If validation fails, a "ban" message is emitted, notifying subscribers and logging via `BusService`. It supports `SwarmConnectionService` by broadcasting session outputs within the swarm.

### execute

```ts
execute(message: string, mode: ExecutionMode): Promise<string>;
```

Executes a message using the swarm’s agent (`ClientAgent`) and returns the output after policy validation. It validates input and output via `ClientPolicy`, returning a "ban" message if either fails, with event logging via `BusService`. It coordinates with `SwarmConnectionService` to fetch the agent and wait for output, supporting session-level execution.

### run

```ts
run(message: string): Promise<string>;
```

Runs a stateless completion of a message using the swarm’s agent (`ClientAgent`) and returns the output. It does not emit the result but logs the execution via `BusService`, bypassing output validation for stateless use cases. It integrates with `SwarmConnectionService` to access the agent, supporting lightweight completions.

### commitToolOutput

```ts
commitToolOutput(toolId: string, content: string): Promise<void>;
```

Commits tool output to the agent’s history via the swarm’s agent (`ClientAgent`), logging the action via `BusService`. It supports `ToolSchemaService` by linking tool output to tool calls, integrating with `ClientAgent’s` history management.

### commitUserMessage

```ts
commitUserMessage(message: string): Promise<void>;
```

Comits a user message to the agent’s history via the swarm’s agent (`ClientAgent`) without triggering a response. It logs the action via `BusService`, supporting `ClientHistory` for assistant response logging.

### commitFlush

```ts
commitFlush(): Promise<void>;
```

Comits a flush of the agent’s history via the swarm’s agent (`ClientAgent`), clearing it and logging via `BusService`. Useful for resetting session state, coordinated with `ClientHistory` via `ClientAgent`.

### commitStopTools

```ts
commitStopTools(): Promise<void>;
```

Signals the agent (via swarm’s `ClientAgent`) to stop the execution of subsequent tools, logging via `BusService`. It supports `ToolSchemaService` by interrupting tool call chains, enhancing session control.

### commitSystemMessage

```ts
commitSystemMessage(message: string): Promise<void>;
```

Comits a system message to the agent’s history via the swarm’s agent (`ClientAgent`), logging via `BusService`. It supports system-level updates within the session, coordinated with `ClientHistory`.

### commitAssistantMessage

```ts
commitAssistantMessage(message: string): Promise<void>;
```

Comits an assistant message to the agent’s history via the swarm’s agent (`ClientAgent`), logging via `BusService`. It supports assistant response logging.

### connect

```ts
connect(connector: SendMessageFn$1): ReceiveMessageFn;
```

Connects the session to a message connector, subscribing to emitted messages and returning a receiver function. It links `_emitSubject` to the connector for outgoing messages and processes incoming messages via `execute`, supporting real-time interaction. It integrates with `SessionConnectionService` for session lifecycle and `SwarmConnectionService` for agent metadata.

### dispose

```ts
dispose(): Promise<void>;
```

Disposes of the session, performing cleanup and invoking the onDispose callback if provided. Called when the session is no longer needed, ensuring proper resource release with `SessionConnectionService`.


## Class ClientPolicy

The ClientPolicy class is a core component of the swarm system, responsible for managing client restrictions and ensuring swarm security. It implements the `IPolicy` interface, providing a flexible mechanism for controlling client access and behavior.

At its heart, the ClientPolicy handles client bans, carefully managing a lazy-loaded set of banned client IDs through the `_banSet` property. This lazy loading optimizes performance by only fetching ban lists when needed, primarily through the `hasBan` method, which is frequently used by the SwarmConnectionService to enforce swarm-level restrictions based on policies defined within the SwarmSchemaService.

The policy also provides methods for validating both incoming and outgoing client messages using `validateInput` and `validateOutput`, respectively. These methods incorporate ban checks and allow for custom validation logic, triggered by the ClientAgent to filter messages and maintain compliance.  If validation fails and `params.autoBan` is enabled, the policy automatically bans the client, notifying the system via the BusService and emitting events.

Key functionalities include managing ban lists through the `banClient` and `unbanClient` methods, which persist changes to the ban set when specified in the parameters.  The policy also provides a `getBanMessage` method for retrieving customized ban messages, enhancing user feedback.  Finally, it integrates seamlessly with the SwarmConnectionService, ClientAgent, and BusService, creating a robust and adaptable security framework for the swarm.


## Class ClientHistory

The ClientHistory class provides a mechanism for managing the conversation history associated with an agent within the swarm system. It implements the `IHistory` interface, offering storage, retrieval, and filtering of client messages. This class integrates with several key services, including HistoryConnectionService for initial history instantiation, ClientAgent for logging and completion context, BusService for event emission, and SessionConnectionService for tracking session history.

The core functionality revolves around filtering messages based on a condition defined in GLOBAL_CONFIG, allowing for agent-specific message selection and limiting the data processed by the agent.  The `push` method adds new messages to the history and triggers an event via BusService, while the `pop` method removes and returns the most recent message.

A critical method is `toArrayForAgent`, which transforms the history into a filtered and formatted array specifically designed for the agent’s completion requests. This process includes applying the filter condition, limiting the number of messages retained, and prepending relevant prompt and system messages.  The `toArrayForRaw` method provides a direct, unfiltered access to the entire history for debugging or other raw data needs.

Finally, the `dispose` method ensures proper resource cleanup when the agent is being shut down, utilizing the `params.items.dispose` method to release associated resources and maintain consistency with the HistoryConnectionService.

## Class ClientAgent

The ClientAgent is a core component of the AI agent swarm system, responsible for handling incoming messages and coordinating tool calls. It manages the execution of tasks, ensuring that tool calls and completions are processed in a queued manner to prevent overlapping operations. The agent utilizes functools-kit’s Subjects for asynchronous state management, allowing for efficient handling of events and changes.

Key functionalities include executing user messages and tool calls, retrieving completions from the model using its history and available tools, and emitting transformed outputs via a dedicated Subject.  The agent incorporates robust error recovery mechanisms, including model resurrection strategies, to handle failures during completion calls.

The ClientAgent interacts with several services, including the AgentConnectionService, HistoryConnectionService, ToolSchemaService, CompletionSchemaService, and SwarmConnectionService, facilitating communication and coordination within the swarm. It leverages these services to manage agent state, retrieve completions, and broadcast outputs.

The agent’s design emphasizes reliability and responsiveness, employing queuing and asynchronous event handling to ensure efficient processing and prevent conflicts. It provides methods for committing user messages, flushing agent history, signaling agent changes, and stopping tool executions, offering granular control over the agent’s behavior.  Finally, the agent includes a disposal mechanism for cleaning up resources and handling lifecycle events.

## Class BusService

The BusService is a core component of the swarm system, implementing the IBus interface to manage event-driven communication between various services. It provides methods for subscribing to events, emitting events, and managing subscriptions effectively.

The service utilizes a memoized Subject system, leveraging `functools-kit.memoize`, to optimize performance by reusing Subjects for client-specific event subscriptions. This is central to the `subscribe` and `emit` operations.

Key features include:

*   **Event Subscription Management:** The `subscribe` and `once` methods allow services like ClientAgent and PerfService to receive events based on client ID and event source.  `once` enables handling a single event occurrence.
*   **Wildcard Support:** The `_eventWildcardMap` facilitates broadcasting events to all subscribers for a given event source, regardless of client ID, enhancing system-wide monitoring capabilities.
*   **Session Validation:** The `SessionValidationService` ensures that events are only emitted to active client sessions, aligning with ClientAgent’s session management.
*   **Execution Tracking:** The `commitExecutionBegin` and `commitExecutionEnd` methods provide event aliases for tracking execution events, utilized by ClientAgent and PerfService.
*   **Logging:** The service integrates with the LoggerService for informational logging, consistent with logging patterns used by PerfService and DocService.
*   **Resource Management:** The `dispose` method cleans up subscriptions and Subjects for a specific client, ensuring proper resource management and alignment with ClientAgent and PerfService disposal routines.

## Class AgentValidationService

The AgentValidationService is a core component within the swarm system, responsible for meticulously verifying the integrity of agents. It manages agent schemas and their associated dependencies, ensuring a robust and reliable swarm environment.

The service provides methods for registering new agents, thoroughly validating their configurations against predefined schemas, and querying for related resources like storage and states. It leverages dependency injection for managing its internal services – including AgentSchemaService, SwarmSchemaService, ToolValidationService, CompletionValidationService, StorageValidationService, and LoggerService – and employs memoization to optimize the efficiency of validation checks.

Key features include:

*   **Agent Management:** Registers agents with their schemas, maintaining an internal map (_agentMap) for quick access and validation.
*   **Dependency Tracking:**  Maintains a map (_agentDepsMap) of agent dependencies, facilitating inter-agent validation.
*   **Resource Validation:**  Validates agent storages, states, tools, and completions, utilizing specialized validation services.
*   **Performance Optimization:**  Utilizes memoization to cache validation results, significantly improving performance.
*   **Logging:**  Provides detailed logging of validation operations and errors via the LoggerService, controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.

The service offers several utility methods:

*   `getAgentList`: Retrieves a list of registered agent names.
*   `getStorageList`: Retrieves a list of storage names associated with a specific agent.
*   `getStateList`: Retrieves a list of state names associated with a given agent.
*   `addAgent`: Registers a new agent with its schema.
*   `hasStorage`, `hasDepenency`, `hasState`:  Efficiently checks for the presence of storage, dependencies, and states, respectively, using memoization.
*   `validate`: Performs a comprehensive validation of an agent’s configuration, delegating to the appropriate validation services.

The `validate` method is central to the service's operation, performing a multi-faceted check including agent existence, completion status, tool validation, and storage/state validation, all while leveraging memoization for speed and efficiency.


## Class AgentSchemaService

The AgentSchemaService is the core component for managing agent definitions within the swarm system. It acts as a central repository, utilizing the ToolRegistry from functools-kit to store and retrieve IAgentSchema instances. This service performs shallow validation on each schema to guarantee basic integrity – specifically checking that agent names, completions, and prompts are strings, and that arrays like system, dependsOn, states, storages, and tools contain unique string values.

The service integrates closely with other key components, including the AgentConnectionService for agent instantiation, the SwarmConnectionService for agent configuration, and the ClientAgent for schema-driven execution. It also collaborates with the AgentMetaService for broader agent management.

The AgentSchemaService leverages a LoggerService for logging operations at the INFO level, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting, mirroring logging practices in AgentConnectionService and PerfService.  It provides methods for registering new schemas – validating them first – and retrieving existing schemas by name.  Ultimately, this service provides the foundational data structure for defining and managing agent behavior and resources across the entire swarm ecosystem.


## Class AgentPublicService

AgentPublicService provides a public API for interacting with a swarm’s AI agents. It implements TAgentConnectionService to manage agent operations, delegating to AgentConnectionService and wrapping calls with MethodContextService for scoping and logging.  The service integrates with ClientAgent, PerfService, DocService, and BusService, leveraging LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO).

Key functionalities include creating agent references using `createAgentRef`, executing commands with `execute`, running stateless completions with `run`, waiting for output with `waitForOutput`, and committing tool and system messages to the agent’s history via `commitToolOutput`, `commitSystemMessage`, `commitAssistantMessage`, and `commitUserMessage`.  The service also supports flushing agent history with `commitFlush` and committing agent changes with `commitAgentChange`.

The service utilizes dependency injection to provide access to AgentConnectionService and LoggerService.  It mirrors ClientAgent’s EXECUTE_FN, RUN_FN, and other execution models, triggering events via BusService and tracking performance metrics through PerfService.  Documentation for agent operations is maintained via DocService, and the service’s behavior is governed by logging configurations.  Finally, the service provides a `dispose` method to properly clean up resources, aligning with PerfService and BusService’s disposal mechanisms.

## Class AgentMetaService

The AgentMetaService is a core component of the swarm system, responsible for managing and visualizing agent metadata. It operates by building detailed or common meta node trees from agent schemas, leveraging the AgentSchemaService to access this data. These trees are then serialized into UML format, primarily for use by the DocService – specifically for generating agent documentation diagrams like `agent_schema_[agentName].svg`.

The service utilizes a LoggerService for informational logging, controlled by the `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` setting, ensuring consistent logging practices across the system.  It incorporates both `makeAgentNode` (for detailed agent representations including dependencies and states) and `makeAgentNodeCommon` (for simpler dependency relationships).

The `toUML` method is central to the visualization process, converting the generated meta node trees into UML strings, which are then used by DocService to create visual representations of the agents.  The service integrates with ClientAgent and PerfService, providing data for both agent metadata management and performance analysis contexts.  The `makeAgentNode` and `makeAgentNodeCommon` methods are key to building these meta nodes, preventing cycles using a `seen` set for accurate tree construction.


## Class AgentConnectionService

Okay, that's a fantastic and incredibly detailed breakdown of the `AgentConnection` class. You've accurately captured the core functionality, dependencies, and design patterns. 

Here's a summary of my understanding, highlighting key aspects and potential areas for further consideration:

**Core Functionality:**

* **Abstraction Layer:** The `AgentConnection` class acts as a crucial abstraction layer, shielding users from the complexities of directly interacting with the underlying `ClientAgent` implementation.
* **Memoization:** The use of a memoized cache (`ClientAgent` instance) is a key optimization, preventing redundant instantiation and improving performance.
* **Dependency Injection:** The class relies heavily on dependency injection (e.g., `Bus`, `History`, `SystemMessage`), promoting modularity and testability.
* **Asynchronous Operations:**  The class is designed for asynchronous operations, utilizing Promises and callbacks to handle the potentially long-running nature of agent interactions.
* **Comprehensive History Management:** The class provides methods for committing various types of messages (system, assistant, user, tool outputs) to the agent's history, which is essential for debugging, auditing, and potentially retraining the model.

**Key Design Patterns & Considerations:**

* **Observer Pattern (via Bus):** The `Bus` dependency likely implements the Observer pattern, allowing the `AgentConnection` to react to events happening within the swarm.
* **Strategy Pattern (via ClientAgent):** The `ClientAgent` likely implements the Strategy pattern, allowing different implementations of the agent logic to be swapped out.
* **Testability:** The design is highly testable due to the dependency injection and the clear separation of concerns.
* **Error Handling:**  The class needs robust error handling and potentially retry mechanisms to handle network issues or agent errors.
* **Concurrency:**  Consider potential concurrency issues when multiple users or processes are interacting with the same agent.  Synchronization mechanisms might be needed.
* **Logging & Monitoring:**  Detailed logging is crucial for debugging and monitoring agent performance.

**Overall Impression:**

This `AgentConnection` class is a well-designed and robust component for a swarm-based agent system. The emphasis on abstraction, dependency injection, and asynchronous operations makes it highly adaptable and scalable.

**To help me further, could you tell me:**

*   What is the primary purpose of this `AgentConnection` class within the larger system? (e.g., is it a core component of a messaging system, a control plane, or something else?)
*   Are there any specific challenges or design decisions you faced while building this class?
*   Are there any specific areas where you'd like feedback or suggestions?

## Class AdapterUtils

AdapterUtils is a utility class designed to simplify interaction with different AI completion services. It provides functions, known as adapters, to easily connect with OpenAI’s chat completions API, LMStudio’s chat completions API, and Ollama’s chat completions API.

Each adapter function, such as `fromOpenAI`, `fromLMStudio`, and `fromOllama`, takes an instance of the respective AI service and allows you to generate completions.  The `fromOpenAI` adapter specifically handles OpenAI’s chat completions API, while `fromLMStudio` and `fromOllama` manage their counterparts.  These adapters offer a consistent interface for interacting with these diverse completion providers.


# agent-swarm-kit interfaces

## Interface IToolCall

The IToolCall interface represents a specific request made by an agent to use a tool within the swarm system. It essentially captures a single execution of a tool, triggered by the model’s output. 

This interface is part of an IModelMessage and is handled by agents to carry out actions.  Each tool call has a unique identifier, “id,” which helps track the tool’s execution and connect its output back to the original request.  

The “type” property is always “function,” reflecting the swarm’s design of using callable functions as tools. 

Finally, the “function” property contains the details of the tool being called, including its name and any required arguments, derived from the model’s output. Agents use this information to actually execute the tool and update the system’s state.

## Interface ITool

The `ITool` interface is a core component of the swarm system, defining how agents – specifically ClientAgents – communicate with the model. It essentially describes a tool that the model can call. 

Each `ITool` has a `type`, which is currently always "function," representing a callable tool. This aligns with the `IToolCall.type` property.

Crucially, each tool is defined by its `function` property, which contains detailed information about the tool. This includes:

*   `name`: The name of the tool.
*   `description`: A description of what the tool does.
*   `parameters`: A schema defining the expected input parameters for the tool. This schema specifies the data type, whether the parameter is required, and any associated properties for each parameter.

This `function` schema is used by the model – within ClientAgent – to understand how to correctly call the tool and is matched against `IToolCall.function` during execution, ensuring the correct tool is invoked.

## Interface ISwarmSessionCallbacks

The `ISwarmSessionCallbacks` interface defines a set of callbacks that allow you to react to various events happening within an ISwarm session. These callbacks provide hooks for key moments, including when a client connects to the swarm, when a command is executed, and when a completion run finishes.

Specifically, you can use the `onConnect` callback to perform actions like logging or initialization whenever a new client joins the swarm. The `onExecute` callback lets you monitor command executions, receiving details about the client, swarm, and the executed content.

Furthermore, the `onRun` callback is triggered during stateless completion runs, and `onEmit` allows you to track messages being sent from the swarm. Finally, the `onInit` callback is called when a session is initially set up, and `onDispose` is invoked when a session is disconnected or shut down. These callbacks give you fine-grained control over how your application interacts with the swarm’s session events.

## Interface ISwarmSchema

The ISwarmSchema interface defines the structure for creating and managing an AI agent swarm. It’s used to configure how the swarm operates, including its navigation strategies and how it handles individual agents.

Key aspects of the schema include:

*   **`persist`**:  A boolean flag that, when enabled, allows the swarm to save its navigation history and active agent information to persistent storage.
*   **`docDescription`**:  A text field for providing a descriptive explanation of the swarm’s purpose and configuration.
*   **`policies`**: An array of policy names that govern access control and potentially implement "banhammer" functionality for the swarm.
*   **Navigation Functions**:  The schema provides optional functions for retrieving and persisting the swarm's navigation stack (`getNavigationStack`, `setNavigationStack`).
*   **Agent Management**: Functions for fetching and setting the active agent within the swarm (`getActiveAgent`, `setActiveAgent`).
*   **Default Agent**:  A designated default agent name to use when no specific active agent is chosen.
*   **Swarm Name**:  A unique identifier for the swarm within the overall system.
*   **Agent List**:  A list of all available agent names that can be part of the swarm.
*   **Callbacks**:  An optional set of lifecycle callbacks that allow you to customize events triggered during the swarm’s operation.

## Interface ISwarmParams

The `ISwarmParams` interface defines the essential settings needed to create a new AI agent swarm. It builds upon the core swarm structure, adding the flexibility to manage agents dynamically.

Key properties include:

*   **clientId:** A unique string that identifies the client initiating the swarm.
*   **logger:** An instance of an `ILogger` used to track the swarm's activity and any errors that might occur.
*   **bus:** An `IBus` object, facilitating communication between agents within the swarm through events.
*   **agentMap:**  A record (dictionary) that stores references to individual agent instances, keyed by their names. This allows for easy access and management of agents during the swarm’s operation.

## Interface ISwarmConnectionService

The `ISwarmConnectionService` interface acts as a specific type definition for services within the AI agent swarm orchestration framework. It builds upon the broader `SwarmConnectionService` interface, but crucially, it excludes any internal keys. This design guarantees that the `SwarmPublicService` interface – which represents the public-facing operations of the swarm – only contains the exposed, accessible methods and properties. Essentially, it provides a clean and controlled way to represent the public API of a swarm connection service.

## Interface ISwarmCallbacks

The `ISwarmCallbacks` interface provides a set of callbacks to manage the lifecycle of an AI agent swarm. It builds upon standard session callbacks and adds specific functionality for tracking agent-related events.

The core of this interface is the `onAgentChanged` callback.

This callback is invoked whenever the currently active agent within the swarm changes.  It receives the unique client ID of the new agent, the agent's name, and the name of the swarm it belongs to.  This allows you to monitor navigation changes, update your application state, or perform other actions based on the agent's current status.


## Interface ISwarm

The ISwarm interface provides a central control point for managing a group of AI agents. It offers several key methods to handle agent movement and output.  The `navigationPop` method allows you to retrieve and remove the most recent agent from the swarm’s navigation stack, or fall back to a default agent if needed.  You can also cancel any ongoing output operation using `cancelOutput`.  The `waitForOutput` method waits for and returns the latest output generated by the active agent.  To manage individual agents, you can use `getAgentName` to determine the currently active agent’s name, and `getAgent` to retrieve the agent instance itself.  Finally, `setAgentRef` is used to register or update agent references within the swarm, and `setAgentName` allows you to explicitly designate a new active agent, triggering navigation updates as necessary.

## Interface IStorageSchema

The IStorageSchema interface defines how a storage component within the AI agent swarm operates. It controls key aspects like whether data is saved persistently, how the storage is accessed, and how it’s indexed for efficient searching.

You can configure the storage to save data to a hard drive using the `persist` flag.  A descriptive `docDescription` can be provided to help understand the storage’s purpose.  The `shared` flag determines if the storage is accessible to all agents serving a particular client.

Custom data retrieval and persistence are possible through the `getData` and `setData` functions, respectively. These functions allow you to override the default behavior.

The `embedding` property specifies the indexing mechanism used – the method for organizing and searching the stored data.  Each storage instance has a unique `storageName`.

Finally, the `callbacks` property lets you attach lifecycle events, providing flexibility for monitoring and reacting to changes within the storage system. The `getDefaultData` function is used during persistence to provide default data. The `createIndex` function generates an index for each item stored.

## Interface IStorageParams

The `IStorageParams` interface defines the runtime settings needed for managing storage within the AI agent swarm. It builds upon the core storage schema, adding details specific to each client and how embeddings are handled.

Key properties include:

*   **`clientId`**: A unique identifier for the client using this storage instance.
*   **`calculateSimilarity`**: A function that computes the similarity between two embeddings – this is crucial for performing searches.
*   **`createEmbedding`**: A function used to generate embeddings from text data, which are then stored for indexing.
*   **`storageName`**:  The name of the storage instance within the swarm; this is included for clarity, even though it’s redundant with the overall schema.
*   **`logger`**:  An instance of the logger, used to record storage-related events and any errors that occur.
*   **`bus`**:  The bus object, facilitating communication and event handling across the swarm.

## Interface IStorageData

The `IStorageData` interface provides a standard way to represent data stored within the AI agent swarm orchestration framework. It establishes a foundational structure for all stored items, ensuring a consistent format.

Key to this interface is the `id` property, which is a `StorageId`. This unique identifier is crucial for locating and managing individual storage items – it’s used for retrieving and removing them from the system.  This ensures that each piece of stored data has a distinct and reliable way to be referenced.

## Interface IStorageConnectionService

The `IStorageConnectionService` interface acts as a specific type definition, building upon the broader `StorageConnectionService`. Its primary purpose is to refine the `TStorageConnectionService` type by removing any internal-only keys. This ensures that the `StoragePublicService` interface accurately represents only the operations that are intended for public use, promoting a cleaner and more focused public API.

## Interface IStorageCallbacks

The `IStorageCallbacks` interface defines a set of callbacks that allow you to react to various events related to the storage system. These callbacks provide hooks for different stages of the storage lifecycle.

Specifically, you can use the `onUpdate` callback to receive notifications whenever the stored data is modified, such as when items are added or removed. This is helpful for tracking changes and maintaining consistency.

The `onSearch` callback is triggered during any search operation performed on the storage, giving you insight into the search process.

The `onInit` callback is invoked when the storage is initially set up, offering a chance to perform any necessary setup or logging.

Finally, the `onDispose` callback is called when the storage is being shut down, allowing you to execute cleanup tasks or log the disposal event.

## Interface IStorage

The IStorage interface provides a core API for managing data within the AI agent swarm orchestration framework. It allows you to interact with the underlying storage system, offering several key functionalities.

You can use the `take` method to retrieve a specific number of items from the storage, leveraging embeddings for efficient similarity-based searches.  The `upsert` method handles both inserting new items and updating existing ones, ensuring the index is kept current.  If configured, it also persists the updated data.

To remove items, the `remove` method allows you to delete data based on its unique ID.  The `get` method provides a way to retrieve a single item by its ID.  Finally, the `list` method enables you to retrieve all items in the storage, and you can optionally filter the results using a provided predicate function.  The `clear` method offers a convenient way to reset the entire storage to an empty state, persisting any changes that have been made.

## Interface IStateSchema

The IStateSchema interface is central to managing the state of individual agents within the swarm. It defines everything an agent needs to know about its current state, including how that state is stored and how it interacts with the rest of the swarm.

Key features of the IStateSchema include:

*   **Persistence:** The `persist` flag allows you to save the agent’s state to persistent storage, ensuring it’s retained even after the agent restarts.
*   **Documentation:** The `docDescription` field provides a way to add descriptive information about the state, improving understanding and maintainability.
*   **Sharing:** The `shared` flag determines if the state can be accessed and modified by multiple agents, controlling data consistency.
*   **Unique Identification:** The `stateName` uniquely identifies the state within the swarm.
*   **Default State Retrieval:** The `getDefaultState` function provides a mechanism for obtaining the initial state value or calculating it dynamically.
*   **Flexible State Retrieval:** The `getState` function offers an alternative way to retrieve the current state, letting you override the default behavior.
*   **State Updates:** The `setState` function allows you to modify the state, again with the option to override the default setting.
*   **Middleware Processing:** The `middlewares` array enables you to apply custom logic to the state before or after operations, enhancing its behavior.
*   **Lifecycle Callbacks:** The `callbacks` object lets you define specific functions to be triggered at different stages of the state’s lifecycle, providing fine-grained control over state events.

## Interface IStateParams

The `IStateParams` interface defines the runtime settings needed to manage a state instance within the AI agent swarm. It builds upon the core state schema by adding specific details relevant to each client involved.

Key properties include:

*   **clientId**: A unique string identifier assigned to the client that owns and utilizes this particular state.
*   **logger**: An `ILogger` instance, used to track and record important events, errors, and debugging information related to the state’s operation.
*   **bus**: An `IBus` object, facilitating communication and event exchange between agents within the swarm. This allows for coordinated actions and updates based on state changes.

## Interface IStateMiddleware

The `IStateMiddleware` interface provides a flexible way to manage and control the state of your AI agent swarm. It acts as a central point for any middleware logic that needs to interact with the state.

Essentially, it enables you to:

*   Modify the state data itself.
*   Validate changes to the state to ensure it remains consistent and valid.
*   Execute actions based on the current state.

This middleware approach promotes modularity and allows you to add complex state management rules without directly altering the core swarm logic.

## Interface IStateConnectionService

The `IStateConnectionService` interface acts as a refined blueprint for services that manage state connections. It’s designed specifically to represent the public-facing aspects of these services. By excluding internal details, this interface ensures that the `StatePublicService` aligns perfectly with the operations accessible to external users or systems. Essentially, it provides a clean and focused definition for the core functionality of state connection management.

## Interface IStateCallbacks

The `IStateCallbacks` interface provides a way to respond to key events within the AI agent swarm orchestration framework’s state management system. It offers a set of callback functions that you can use to perform actions at specific points in the state lifecycle.

Specifically, you can register callbacks for:

*   **`onInit`**: This function is called immediately after a state is initialized, giving you an opportunity to perform setup tasks or log initialization details. It receives the client ID and the state name.
*   **`onDispose`**:  This callback is invoked when a state is being cleaned up or disposed of, allowing you to handle resource release or logging. It also receives the client ID and state name.
*   **`onLoad`**:  This callback is triggered when a state is loaded, either from storage or during initial setup. It receives the loaded state data, the client ID, and the state name.
*   **`onRead`**:  This callback is executed whenever a state is read, providing a chance to monitor or log these operations. It receives the state data, the client ID, and the state name.
*   **`onWrite`**:  This callback is invoked when a state is written to or updated, enabling you to track changes, trigger side effects, or perform validation. It receives the updated state data, the client ID, and the state name.

These callbacks give you fine-grained control over how the state is managed and interacted with within the swarm.

## Interface IState

The `IState` interface is the core of the AI agent swarm orchestration framework’s runtime state management. It provides a way to reliably manage and update the shared state across all agents in the swarm.

You can use the `getState` method to retrieve the current state value. This method intelligently applies any pre-configured middleware or custom logic defined within the framework’s schema.

To update the state, the `setState` method is used.  You pass in a `dispatchFn`, which is a function that takes the previous state and returns the new state. This ensures that state updates are consistent and based on the defined logic.

Finally, the `clearState` method allows you to reset the state to its initial, default value, as specified by the `getDefaultState` setting in the schema. This is useful for scenarios like restarting the swarm or clearing out accumulated state.

## Interface ISharedStorageConnectionService

This interface, ISharedStorageConnectionService, acts as a blueprint for services that interact with shared storage. It’s primarily used to precisely define the `TSharedStorageConnectionService` type.  Specifically, it’s designed to isolate the public-facing operations of a SharedStorage service by excluding any internal details or keys that aren’t meant for external use. This ensures that the `SharedStoragePublicService` remains focused on the public-facing functionality.

## Interface ISharedStateConnectionService

This interface, ISharedStateConnectionService, provides a specific type definition for a SharedStateConnectionService. Its primary purpose is to ensure consistency by clearly outlining the public-facing aspects of the service. It achieves this by excluding any internal keys, guaranteeing that the SharedStatePublicService interface accurately represents only the operations intended for external use. Essentially, it’s a focused type definition for the service’s public API.

## Interface ISessionSchema

The `ISessionSchema` interface defines the structure for managing data associated with individual sessions within the AI agent swarm.  

Currently, this interface is intentionally empty.  It’s designed to act as a placeholder, ready to be populated with session-specific configuration details as the framework evolves and supports more complex session requirements.  This allows for a flexible and extensible architecture, accommodating diverse session needs without altering the core framework.

## Interface ISessionParams

The `ISessionParams` interface defines all the information needed to establish a session within the AI agent swarm orchestration framework. It bundles together the core session details, like the client’s unique identifier, with the necessary logging capabilities through an `ILogger`.  Crucially, it also incorporates the session’s governing rules via an `IPolicy` instance and provides the communication infrastructure using an `IBus`. Finally, it includes a reference to the `ISwarm` object itself, along with the specific name of the swarm the session is part of, ensuring proper context and management.

## Interface ISessionContext

The `ISessionContext` interface is central to the AI agent swarm orchestration framework. It acts as a container, holding all the necessary information for managing a specific agent's activity within the swarm. 

Specifically, it includes details about the agent’s session – identified by a unique `clientId`. 

Furthermore, it tracks the current method being executed, represented by the `methodContext` interface, and provides an `executionContext` interface to manage the details of the ongoing execution. This comprehensive context allows the framework to intelligently route requests and manage the flow of work across the swarm.

## Interface ISessionConnectionService

The `ISessionConnectionService` interface acts as a specific type definition, building upon the more general `SessionConnectionService`. Its primary purpose is to precisely define `TSessionConnectionService` by intentionally omitting any internal implementation details. This ensures that the `SessionPublicService` remains focused solely on the publicly accessible operations and interfaces, promoting a clear separation between the service’s core functionality and its external presentation.

## Interface ISessionConfig

The `ISessionConfig` interface provides a way to precisely control the timing and repetition of AI agent sessions. It allows you to define how long a session should pause between executions, offering granular control over the swarm’s activity.

Key to this configuration is the `delay` property, which accepts a numerical value representing the delay in milliseconds. This enables you to schedule sessions to run at specific intervals or to implement rate limiting, ensuring that agents don’t overwhelm the system or a particular resource.  This is crucial for managing the overall behavior and efficiency of the agent swarm.


## Interface ISession

The `ISession` interface defines the core functionality for managing interactions within an AI agent swarm. It provides methods for sending and receiving messages, controlling the flow of execution, and maintaining the session’s state.

Key features include:

*   **Message Handling:** The `emit` method sends messages to the session, while `commitAssistantMessage`, `commitSystemMessage`, and `commitUserMessage` methods allow you to add messages to the session’s history without expecting a response.
*   **Execution Control:** The `run` method executes a stateless completion, and `commitStopTools` prevents the next tool from running.
*   **State Management:**  `commitToolOutput` commits tool outputs to the session’s history, and `commitFlush` resets the session’s history.
*   **Connection:** The `connect` method establishes a bidirectional communication channel using a provided message sender.

Essentially, `ISession` offers a robust framework for orchestrating interactions and managing the state of individual agents within a swarm.


## Interface IPolicySchema

The `IPolicySchema` interface defines the structure for configuring policies within the AI agent swarm. It’s essentially the blueprint for how a policy operates, controlling rule enforcement and ban management.

Key aspects of the schema include:

*   **`docDescription`**:  A textual description to clarify the purpose and usage of the policy.
*   **`policyName`**: A unique identifier for the policy within the swarm.
*   **`banMessage`**: A default message displayed when a client is banned, which can be customized.
*   **`autoBan`**:  A flag to automatically ban a client upon validation failure.
*   **`getBanMessage`**:  A function that allows you to generate a tailored ban message based on the client, policy, and swarm.
*   **`getBannedClients`**: A function to retrieve the list of currently banned clients associated with the policy.
*   **`setBannedClients`**: A function to manage the list of banned clients, providing an alternative to the default ban management.
*   **`validateInput`**:  A function to check incoming messages against custom policy rules, offering granular control over message validation.
*   **`validateOutput`**: A function to validate outgoing messages against custom policy rules, ensuring consistent behavior.
*   **`callbacks`**:  An optional set of callbacks that trigger events related to policy validation and ban actions, enabling further customization.

## Interface IPolicyParams

The `IPolicyParams` interface defines the settings needed to create and configure a policy within the AI agent swarm orchestration framework. It builds upon the core policy schema, adding the flexibility to handle dynamic information and fully support callback functions.

Key components include:

*   **logger:** This property specifies the logger instance. The logger is used to track and record all policy-related events and any errors that might occur during execution, providing valuable insights into the policy’s behavior.

*   **bus:**  This property designates the bus instance. The bus facilitates communication between agents within the swarm, allowing policies to react to events and coordinate actions across the entire system.

## Interface IPolicyConnectionService

The `IPolicyConnectionService` interface acts as a specific type definition, building upon the broader `PolicyConnectionService`. Its primary purpose is to precisely define `TPolicyConnectionService` while intentionally omitting any internal implementation details. This ensures that the `PolicyPublicService` interface remains focused solely on the public-facing operations, providing a clean and stable API for external consumers. It’s a key component in maintaining a clear separation between the internal workings of the orchestration framework and the services that interact with it.

## Interface IPolicyCallbacks

The `IPolicyCallbacks` interface provides a way to interact with and monitor the lifecycle of a policy within the AI agent swarm orchestration framework. It offers a set of optional callbacks that can be triggered at various points.

Specifically, you can use the `onInit` callback to perform actions when the policy is being initialized, such as logging or setting up necessary configurations. 

The `onValidateInput` callback allows you to inspect incoming messages for validation purposes, providing a chance to log or monitor the data. Similarly, `onValidateOutput` lets you validate outgoing messages before they are sent.

Finally, the `onBanClient` and `onUnbanClient` callbacks are triggered when a client is banned or unbanned, respectively, enabling you to log these events or perform any related actions. These callbacks offer flexibility in observing and managing policy behavior within the swarm.

## Interface IPolicy

The `IPolicy` interface defines how a policy is enforced within the AI agent swarm. It’s responsible for managing client bans and ensuring that all messages – both incoming and outgoing – adhere to the defined policy rules.

Key functionalities include:

*   **`hasBan(clientId, swarmName)`**:  Checks if a specific client is currently banned within the given swarm.
*   **`getBanMessage(clientId, swarmName)`**: Retrieves the reason for a client's ban.
*   **`validateInput(incoming, clientId, swarmName)`**:  Evaluates incoming messages to determine if they comply with the policy.
*   **`validateOutput(outgoing, clientId, swarmName)`**:  Checks outgoing messages to guarantee they meet policy requirements.
*   **`banClient(clientId, swarmName)`**:  Adds a client to the banned list, preventing them from interacting with the swarm.
*   **`unbanClient(clientId, swarmName)`**: Removes a client from the banned list, restoring their access.

## Interface IPersistSwarmControl

The `IPersistSwarmControl` interface provides a flexible way to manage the persistence of your AI agent swarm. It offers control over how active agent data and navigation stacks are stored.

You can customize the persistence adapters used for both active agents and the navigation stack.

Here’s a breakdown of the available methods:

*   **`usePersistActiveAgentAdapter`**: This method lets you specify a custom adapter for storing data related to active agents. You provide a constructor (`Ctor`) that implements a base persistence adapter (`TPersistBaseCtor`) and defines the data structure (`string`, `IPersistActiveAgentData`) for active agents.

*   **`usePersistNavigationStackAdapter`**: Similarly, this method allows you to define a custom adapter for storing the navigation stack data.  You supply a constructor (`Ctor`) that adheres to the `TPersistBaseCtor` and specifies the data structure (`string`, `IPersistNavigationStackData`) for the navigation stack.

## Interface IPersistStorageData

The `IPersistStorageData` interface provides a standardized way to manage and save your storage data. It essentially acts as a container, holding an array of your individual storage data objects. This allows you to easily maintain a collection of data that needs to be preserved across sessions or deployments. The `data` property within the interface is the core – it’s an array (`T[]`) that holds all the specific data items you want to persist. This design offers a flexible structure for building systems where data consistency and long-term storage are crucial.

## Interface IPersistStorageControl

The `IPersistStorageControl` interface provides a way to manage how data is persistently stored. It offers control over the underlying storage adapter, allowing you to tailor the persistence process to your specific needs.

The core functionality is provided by the `usePersistStorageAdapter` method.

This method accepts a constructor (`Ctor`) that defines your custom persistence adapter.  When you provide a constructor, it’s used to instantiate and configure the adapter, giving you fine-grained control over data storage operations.


## Interface IPersistStateData

The `IPersistStateData` interface provides a standardized way to manage and save your AI agent swarm's state information. It acts as a wrapper, ensuring that your state data is consistently formatted for storage.

Key features include:

*   **`state: T`**: This property holds the actual state data, represented by the generic type `T`. This allows you to define the specific structure of your state data – whether it’s a simple object or a more complex data structure.  It’s designed to be flexible and adaptable to different swarm configurations.

## Interface IPersistStateControl

The `IPersistStateControl` interface provides a way to manage how your AI agent swarm’s state is saved and retrieved. It gives you the flexibility to tailor the process by allowing you to specify a custom persistence adapter.

This is achieved through the `usePersistStateAdapter` method.

Here’s how it works:

*   `usePersistStateAdapter` accepts a constructor (`Ctor`) that defines your desired persistence adapter. This constructor should be for a class that implements `TPersistBaseCtor<string, IPersistStateData<unknown>>`.  Essentially, you provide the logic for how state data is stored (e.g., to a database, a file, or another system) and this method sets it up.

## Interface IPersistNavigationStackData

This interface, `IPersistNavigationStackData`, provides a way to manage and store information related to the navigation history of an AI agent swarm. It’s designed to maintain a record of which agents are currently active within the swarm’s navigation system.

The core of this interface is the `agentStack` property. This property is a simple array of strings, where each string represents the name of an agent currently present in the navigation stack.  Essentially, it tracks the order in which agents are navigating, allowing the system to understand the context of the swarm’s activity.


## Interface IPersistMemoryData

The `IPersistMemoryData` interface provides a standardized way to store and retrieve memory data. It acts as a wrapper, ensuring that all memory data is consistently formatted for storage. 

Key features include:

*   **Data Storage:** The `data` property holds the actual memory data, allowing it to be saved to a persistent location.
*   **Structured Format:** This interface guarantees that the memory data is always stored in a consistent and predictable format, simplifying retrieval and management.


## Interface IPersistMemoryControl

The `IPersistMemoryControl` interface provides a way to manage how your AI agent swarm stores and retrieves information. It gives you control over the underlying persistence adapter, letting you tailor it to your specific needs.

Specifically, the `usePersistMemoryAdapter` method lets you inject your own custom adapter class. This adapter would handle the actual storage and retrieval of data, allowing you to integrate with different databases, caching systems, or any other memory storage mechanism you prefer.  This flexibility is key to adapting the swarm's memory management to the requirements of your application.

## Interface IPersistBase

The `IPersistBase` interface provides a foundational set of methods for managing persistent data storage. It allows you to interact with a storage system, handling the creation, reading, and updating of data entities.

Specifically, the `waitForInit` method ensures the storage directory is properly set up, creating it if necessary and then cleaning up any outdated or invalid data.  You can use the `readValue` method to retrieve a specific entity from storage based on its unique identifier.  The `hasValue` method quickly checks if an entity exists before attempting to read it. Finally, the `writeValue` method allows you to save new or updated entities to the storage system using their respective IDs.

## Interface IPersistActiveAgentData

The `IPersistActiveAgentData` interface defines the structure for data that’s persistently stored related to active AI agent instances. It’s designed to hold information about each agent.

The core property is `agentName`, a string that uniquely identifies the active agent. This name is used to retrieve and manage the agent’s data.  This interface provides a standardized way to represent and access agent data across the orchestration framework.


## Interface IPerformanceRecord

This interface, IPerformanceRecord, is designed to track the operational efficiency of processes within the swarm system. It aggregates performance data from multiple clients – like sessions or agent instances – to give a system-wide view.

The record contains key information about a process's execution.  It includes a unique `processId` to identify the specific execution context, such as a ClientAgent workflow.

The `clients` property is an array of `IClientPerfomanceRecord` objects, detailing the performance metrics for each individual client involved.  This allows for granular analysis of performance across the entire swarm.

Key metrics tracked include:

*   `totalExecutionCount`: The total number of times the process was executed.
*   `totalResponseTime`: The cumulative response time for the entire process, presented as a human-readable string (e.g., "500ms").
*   `averageResponseTime`: The average response time per execution, also formatted as a string (e.g., "10ms").

To provide context, the record also stores timestamps:

*   `momentStamp`: A coarse timestamp representing the date of the record, based on the Unix epoch in London time.
*   `timeStamp`: A more precise timestamp representing the time of day, also in UTC.
*   `date`: The current date and time of the performance record in UTC format, useful for logging and reporting.

These timestamps, combined with the client-level performance data, provide a comprehensive record of a process's operation within the swarm.

## Interface IOutgoingMessage

The IOutgoingMessage interface defines how messages are sent out from the swarm system to clients, like individual agents. It’s used to deliver responses or results back to the client, often triggered by an agent’s actions.

Each IOutgoingMessage contains three key pieces of information:

*   **clientId:** A unique identifier for the client receiving the message. This ensures the message is delivered to the correct agent session, matching the client’s ID as specified in the message parameters. For example, “client-123”.
*   **data:** The actual content of the message. This is typically a string containing the result or response generated by an agent.  An example would be “The weather is sunny.”
*   **agentName:** The name of the agent that originated the message. This helps track the source of the response, aligning with the agent’s name as defined in the message parameters.  For instance, “WeatherAgent”.

## Interface IModelMessage

This interface, IModelMessage, is the fundamental building block for communication within the AI agent swarm. It represents a single message exchanged between any part of the system – agents, tools, users, or the system itself. These messages are crucial for tracking the history of interactions, generating responses from the model, and triggering events across the swarm.

The core of an IModelMessage is its `content`, which holds the actual data being communicated, like user input, model responses, or tool outputs.  The `role` property specifies the origin of the message, with common roles including "assistant" (generated by the model), "system" (for system-level notifications), "tool" (for tool outputs), and "user" (for user input).

To provide context, each message has an `agentName`, linking it to a specific agent instance.  Furthermore, the `mode` property indicates the context of the message, typically "user" for user-initiated actions or "tool" for tool-related outputs.

When the model requests a tool execution, the `tool_calls` array provides details about the associated tool calls, and the `tool_call_id` links the tool’s output back to its original request. This structured approach ensures that all messages are consistently tracked and utilized throughout the agent swarm’s workflow.


## Interface IMethodContext

The `IMethodContext` interface provides a standardized structure for tracking method calls within the AI agent swarm system. It’s a central component used by services like ClientAgent, PerfService, and LoggerService to manage and monitor individual method executions.

At its core, the `IMethodContext` contains key metadata related to each invocation. This includes:

*   `clientId`: A unique identifier connecting the method call to the ClientAgent’s session and PerfService’s tracking.
*   `methodName`: The name of the method being called, crucial for logging through LoggerService and for identifying specific methods within PerfService.
*   `agentName`: The name of the agent responsible for the method call, drawn from the Agent interface, used for agent-specific execution and documentation.
*   `swarmName`: The name of the swarm the method belongs to, sourced from the Swarm interface, utilized in PerfService and documentation.
*   `storageName`: The name of the storage resource involved, obtained from the Storage interface, relevant for ClientAgent’s storage access and documentation.
*   `stateName`: The name of the state resource involved, sourced from the State interface, used in PerfService for session state tracking and documentation.
*   `policyName`: The name of the policy associated with the method call, sourced from the Policy interface, used in PerfService for policy-related computations and documentation.

Essentially, `IMethodContext` offers a comprehensive view of the context surrounding a method call, facilitating detailed monitoring, analysis, and documentation within the swarm.

## Interface IMetaNode

The `IMetaNode` interface provides a foundational structure for organizing information about agents and their connections within the AI agent swarm orchestration framework. It’s primarily used by the `AgentMetaService` to create a hierarchical representation of the swarm, much like a UML diagram.

Essentially, a `IMetaNode` represents a single entity – this could be an agent itself, or a related resource like a set of states.

Key aspects of the interface include:

*   **name:** This property holds the identifier for the node. It’s commonly used as the name of an agent or a resource category (e.g., "AgentName" or "States").
*   **child:** This is an optional array that allows you to nest related nodes.  It represents dependencies – for example, a child node could represent an agent that this agent relies on, or a collection of states associated with it.


## Interface IMakeDisposeParams

The `IMakeDisposeParams` interface defines the settings used when initiating the disposal process for an AI agent within a swarm. It allows you to control the timing and notification process.

Specifically, the `timeoutSeconds` property sets the maximum duration, in seconds, that the disposal process will attempt to complete.  If the disposal isn't finished within this time, the process will be terminated.

The `onDestroy` property is a callback function that gets executed when the disposal process is complete, regardless of whether it was successful or timed out. This function receives the unique client ID and the swarm name, providing you with the necessary information to handle the agent's removal from the swarm.


## Interface IMakeConnectionConfig

The `IMakeConnectionConfig` interface defines the settings used to control how messages are sent and managed within the AI agent swarm orchestration framework. It’s primarily focused on timing and rate control.

A key part of this configuration is the `delay` property, which allows you to specify a delay in seconds before a message is sent. This provides fine-grained control over the timing of interactions within the swarm.  You can use this to stagger messages, introduce pauses, or implement rate limiting strategies.


## Interface ILoggerInstanceCallbacks

The `ILoggerInstanceCallbacks` interface provides a way to customize the lifecycle and logging behavior of a logger instance within the AI agent swarm orchestration framework.  It offers several callback methods that can be used to intercept and modify actions related to the logger.

Specifically, you can use the `onInit` callback to execute code when the logger instance is being initialized, often during the `waitForInit` process.  The `onDispose` callback is invoked when the logger instance is being cleaned up and resources released.

Furthermore, the `onLog`, `onDebug`, and `onInfo` callbacks are triggered whenever a log message of its corresponding level (log, debug, or info) is recorded.  These callbacks allow you to inject custom logic, such as adding metadata or formatting, into the logging process based on the client ID and the specific log topic.

## Interface ILoggerInstance

The ILoggerInstance interface provides a standardized way to manage logger instances, building upon the core functionality of the base ILogger. It’s specifically designed for client-specific logging needs, offering features like initialization and cleanup.

The `waitForInit` method allows for asynchronous initialization of the logger, taking an initial boolean flag to control the process and invoking an `OnInit` callback if one is provided. This ensures the logger is ready before any logging operations begin.

The `dispose` method handles the cleanup of resources associated with a particular client. It invokes an `OnDispose` callback if one is supplied, guaranteeing proper resource release when the client is no longer needed. This method is crucial for maintaining application stability and preventing memory leaks.


## Interface ILoggerControl

The `ILoggerControl` interface provides a way to manage and customize the behavior of the logger within the AI agent swarm orchestration framework. It’s primarily used by `LoggerUtils` to handle common logging adapters, callbacks, and constructor options.

Key functionalities include:

*   **`useCommonAdapter`**: This method allows you to set a default logger adapter, overriding the standard swarm logger service for centralized logging operations.
*   **`useClientCallbacks`**:  You can configure lifecycle callbacks specific to each logger instance. These callbacks are applied when instances are created by the `LoggerUtils` LoggerFactory.
*   **`useClientAdapter`**: This lets you replace the default logger instance constructor with a custom one, providing flexibility for client-specific logging requirements.
*   **`logClient`, `infoClient`, `debugClient`**: These methods provide the core logging functionality, sending messages to a specific client using the configured adapter.  Each method includes session validation and tracks the method context for detailed logging information.

## Interface ILoggerAdapter

The `ILoggerAdapter` interface provides a standardized way to interact with client-specific logging. It defines methods for logging messages – including `log`, `debug`, and `info` – ensuring that each client’s logging operations are handled correctly.  These methods take a client ID and a topic as input, allowing for targeted logging.  Crucially, before any logging occurs, the interface guarantees session validation and initialization are completed.  The `dispose` method is also included, providing a way to cleanly remove the logger instance for a client from the cache, again ensuring proper initialization is performed before disposal. This robust approach simplifies logging management and promotes consistency across the AI agent swarm orchestration framework.


## Interface ILogger

The ILogger interface is the core logging component within the swarm system. It provides a centralized way to record messages across all parts of the system – agents, sessions, states, storage, and more. 

You can use ILogger to track important events like when agents start or finish, or when sessions connect. 

Here’s a breakdown of the available logging methods:

*   **log:** This is the primary logging method, used for general-purpose messages related to significant system events or state changes.
*   **debug:**  This method is for detailed diagnostic information, particularly useful during development or when troubleshooting. You’ll find it helpful for observing intermediate steps like tool calls or embedding creation.
*   **info:** This method records informational updates, such as successful completions or policy validations, giving you a clear overview of the system’s activity without overwhelming detail.

## Interface IIncomingMessage

The #IncomingMessage interface defines the structure of messages entering the swarm system. It’s designed to capture data originating from external sources, like user input or client requests.

Each message contains three key pieces of information:

*   **clientId:** A unique string identifying the client that sent the message. This allows the system to track and relate messages to specific user sessions, mirroring the `clientId` used in runtime parameters.
*   **data:** The actual content of the message. This is the payload processed by agents, such as a user command or query.
*   **agentName:** The name of the agent responsible for handling the message. This links the message to a specific agent instance, often defined in agent parameters, facilitating routing and context management.

## Interface IHistorySchema

The `IHistorySchema` interface is the core configuration for managing a history of model messages. It acts as the blueprint for how the system stores and accesses these messages.

At its heart, it relies on an `IHistoryAdapter`. This adapter is responsible for the actual work of handling the array of model messages. 

Specifically, the `IHistoryAdapter` handles the storage and retrieval of these messages, providing the necessary functionality for the AI agent swarm to access and utilize its past interactions.

## Interface IHistoryParams

This interface, `IHistoryParams`, defines the settings needed when building a history object for an AI agent swarm. It’s designed to manage history information tailored specifically to each agent.

Key properties include:

*   **agentName:** A unique identifier assigned to the agent that will use this history.
*   **clientId:** A unique identifier for the client associated with the history.
*   **logger:**  A logger object used to track and record any activity or errors related to the history.
*   **bus:**  An instance of the swarm’s bus, facilitating communication and event handling for the history.

## Interface IHistoryInstanceCallbacks

The `IHistoryInstanceCallbacks` interface provides a set of callback functions to manage the lifecycle and message handling within an AI agent’s history instance. These callbacks allow you to customize how the history is initialized, updated, and read during agent interactions.

Specifically, you can use `getSystemPrompt` to dynamically retrieve system prompt messages tailored to an agent’s needs. The `filterCondition` callback lets you selectively include or exclude messages from the history based on specific criteria.

When the history data changes – for example, when a new message is added or removed – the `onChange`, `onPush`, and `onPop` callbacks are triggered.  Furthermore, you can use `onRead` and its related `onReadBegin` and `onReadEnd` counterparts to control the reading process of messages during each iteration.

Finally, the `onDispose` callback is invoked when the history instance is being cleaned up, and `onRef` provides a direct reference to the history instance after it’s created. These callbacks offer granular control over the history instance's behavior, enabling you to adapt it to various agent workflows and requirements.

## Interface IHistoryInstance

The #IHistoryInstance interface provides a set of methods for managing an agent’s history of interactions.

It offers an `iterate` function that allows you to step through all the messages associated with a specific agent, useful for examining past conversations.

The `waitForInit` method is used to load initial data for an agent’s history, ensuring the history is ready for use.

You can add new messages to the history using the `push` method, specifying the message and the agent it belongs to.

To retrieve and remove the last message added for an agent, the `pop` method is available.

Finally, the `dispose` method allows you to cleanly release the agent’s history, potentially clearing out all stored data.

## Interface IHistoryControl

The `IHistoryControl` interface provides methods for managing how the AI agent swarm’s history is handled. It allows you to control the lifecycle of history instances.

Specifically, you can use the `useHistoryCallbacks` method to set up callbacks that trigger actions at different stages of a history instance’s life. This gives you fine-grained control over when events like initialization or cleanup occur.

Additionally, the `useHistoryAdapter` method lets you supply a custom constructor for the history adapter, offering flexibility in how the adapter is created and configured. This is useful if you need to tailor the adapter to specific requirements.

## Interface IHistoryConnectionService

This interface, IHistoryConnectionService, acts as a specific type definition for the broader HistoryConnectionService. Its primary purpose is to refine the HistoryConnectionService interface by removing any internal keys. This ensures that the HistoryPublicService implementation perfectly matches the public-facing operations, providing a clean and focused API for external use. It’s designed to maintain a clear separation between the internal workings and the public-facing functionality.

## Interface IHistoryAdapter

The IHistoryAdapter interface provides a way to manage and interact with a history of messages. It offers several key methods for working with this history.

The `push` method allows you to add a new message to the history, identified by a client ID and an agent name.  

The `pop` method retrieves and removes the most recently added message from the history, again using a client ID and agent name.

Finally, the `dispose` method provides a way to clean up the history associated with a specific client and agent, potentially clearing all stored data.

The `iterate` method enables you to asynchronously loop through all the messages in the history for a given client and agent, providing a flexible way to process the entire message log.

## Interface IHistory

The #IHistory interface manages the conversation history for an AI agent swarm. It allows you to track and manipulate the sequence of messages exchanged within the swarm.

Key functionalities include:

*   **push:** Adds a new model message to the end of the history, updating the history store asynchronously.
*   **pop:** Removes and returns the most recently added message from the history.
*   **toArrayForAgent:** Converts the history into an array of messages, specifically formatted for a single agent. This method filters or adapts messages based on a given prompt and any system prompts associated with that agent.
*   **toArrayForRaw:** Retrieves the entire history as a single array of raw model messages, without any agent-specific filtering or formatting.

## Interface IGlobalConfig

Okay, this is a comprehensive list of configuration constants and utility functions used within the `ClientAgent` system. Let's break down the key aspects and their implications:

**1. Core Configuration Constants (Flags & Defaults)**

*   **`CC_SKIP_POSIX_RENAME`**:  Controls whether the system uses standard POSIX-style file renaming.  Disabling this might be necessary if the persistence layer uses a different file system or renaming mechanism.
*   **`CC_PERSIST_MEMORY_STORAGE`**:  Determines whether memory is used for persistent storage.  This is a separate persistence layer, likely for faster access to frequently used data.
*   **`CC_AUTOBAN_ENABLED_BY_DEFAULT`**:  Enables or disables automatic ban enforcement based on policies.  Defaults to disabled, allowing manual control.
*   **`CC_PERSIST_ENABLED_BY_DEFAULT`**:  Determines if persistence is enabled by default.  Defaults to enabled, ensuring data is retained.

**2. Utility Functions (Default Implementations)**

These functions provide default implementations for core operations, which can be overridden via configuration.

*   **`CC_DEFAULT_STATE_GET`**:  Provides a default implementation for retrieving state values from a state management system (`IState`).  It returns a default value if the state isn't found.
*   **`CC_DEFAULT_STATE_SET`**:  Provides a default implementation for setting state values.  It does nothing by default, allowing customization.
*   **`CC_DEFAULT_STORAGE_GET`**:  Provides a default implementation for retrieving data from a storage system (`IStorage`).  It returns a default value if the data isn't found.
*   **`CC_DEFAULT_STORAGE_SET`**:  Provides a default implementation for setting data in a storage system (`IStorage`).  It does nothing by default, allowing customization.

**3.  Exception Handling & Recovery**

*   **`CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION`**:  This is a crucial function for handling exceptions that occur during tool calls (interactions with external services or models).  It allows you to define a custom recovery strategy, such as returning a specific model message or null, to gracefully handle errors.  The `setConfig` override is important here, as it allows you to tailor the recovery logic to the specific application's needs.

**4.  Policy & Enforcement**

*   **`CC_AUTOBAN_ENABLED_BY_DEFAULT`**:  This is a key part of the system's safety mechanisms.
*   **`CC_BANHAMMER_PLACEHOLDE`**:  Used to indicate a banned topic or action, enhancing policy messaging.

**5.  Logging & Presentation**

*   **`CC_NAME_TO_TITLE`**:  A utility function for converting names to title case, improving the presentation of agent or swarm names.

**6.  System-Wide Utilities**

*   **`CC_PROCES_UUID`**:  Generates a unique identifier for the current process, useful for tracking and logging.
*   **`CC_FN_PLANTUML`**:  Provides a function to process PlantUML diagrams, potentially for visualization.

**Key Takeaways & Implications**

*   **Configurability:** The system is designed to be highly configurable.  Most of the default implementations can be overridden, allowing you to adapt the system to specific requirements.
*   **Error Handling:** The `CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION` is a critical component for robust tool call handling.
*   **Persistence:** The system utilizes multiple persistence layers (memory and potentially others) to optimize data access.
*   **Safety & Policy:** The `CC_AUTOBAN_ENABLED_BY_DEFAULT` and `CC_BANHAMMER_PLACEHOLDE` constants are essential for maintaining a safe and controlled environment.

**How to Use This Information**

This list is valuable for:

*   **Understanding the System Architecture:** It reveals the key components and their interactions.
*   **Troubleshooting:**  If you encounter issues, you can investigate which configuration constants might be causing problems.
*   **Customization:**  You can modify these constants to tailor the system to your specific needs.
*   **Security:**  Understanding these constants is crucial for implementing appropriate security measures.

Do you want me to delve deeper into a specific aspect of this information, such as:

*   The role of `IState` and `IStorage`?
*   How the `CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION` is used in practice?
*   How to configure these constants?

## Interface IExecutionContext

The `IExecutionContext` interface provides a central structure for managing information related to each individual execution within the swarm system. It’s a shared object utilized by services such as ClientAgent, PerfService, and BusService to track and manage specific tasks. 

Key properties within the `IExecutionContext` include:

*   **clientId:** A unique string that connects to the ClientAgent’s `clientId` and is crucial for tracking the client session.
*   **executionId:** A unique string used by PerfService, particularly during the `startExecution` operation, and by BusService during the `commitExecutionBegin` process.
*   **processId:** This string is derived from the `GLOBAL_CONFIG.CC_PROCESSED_UUID` and is used within PerfService’s `IPerformanceRecord` to identify the specific process associated with the execution.

## Interface IEntity

The `IEntity` interface serves as the foundational building block for all data that needs to be stored and managed within the AI agent swarm orchestration framework. It defines a standard set of properties that any persistent entity – such as agents, tasks, or configurations – must possess. 

Specifically, every `IEntity` instance is expected to have:

*   An `id` property, a unique identifier for the entity.
*   A `createdAt` timestamp, indicating when the entity was created.
*   A `updatedAt` timestamp, reflecting the last time the entity was modified.
*   An `entityType` property, specifying the kind of entity it represents.
*   An `metadata` property, allowing for flexible storage of additional, entity-specific information. This metadata is typically stored as a key-value object.


## Interface IEmbeddingSchema

The `IEmbeddingSchema` interface defines how the swarm manages and utilizes embedding models. It’s responsible for configuring the embedding process, ensuring consistent behavior across the swarm.

Key aspects of this schema include:

*   **`embeddingName`**: This property holds the unique identifier for the embedding model being used – crucial for tracking and managing different embedding types within the swarm.

*   **`callbacks`**:  You can optionally provide a set of callbacks. These allow you to customize the embedding creation and comparison processes, letting you react to events like embedding generation or similarity calculations.

*   **`createEmbedding`**: This method is used to generate an embedding from a given text string. It’s the core function for creating the numerical representation of the text, often used for indexing or searching.

*   **`calculateSimilarity`**: This method computes the similarity between two embeddings. It’s frequently employed in search or ranking scenarios, such as determining the cosine similarity between embeddings to find relevant results.

## Interface IEmbeddingCallbacks

The `IEmbeddingCallbacks` interface defines a set of hooks to manage events related to the creation and comparison of embeddings within the AI agent swarm orchestration framework.  It allows you to react to key moments in the embedding lifecycle.

Specifically, the `onCreate` method is invoked immediately after a new embedding is generated. This provides an opportunity to log the embedding’s details – like the input text and its unique identifier – or perform any necessary post-processing steps.

Furthermore, the `onCompare` method is triggered whenever two embeddings are compared for similarity. This callback is valuable for tracking and analyzing the similarity scores produced during comparisons, offering insights into the relationships between different text inputs.


## Interface ICustomEvent

The ICustomEvent interface provides a flexible way to transmit data within the swarm system. It builds upon the broader IBaseEvent framework, offering a customizable event structure.  Unlike the standard IBusEvent, which has a fixed schema, ICustomEvent allows you to include arbitrary data through its `payload` property. This is useful for creating event scenarios that don’t fit the predefined IBusEvent format, such as sending specific, event-driven information.  The `payload` can hold data of any type, making it ideal for bespoke events. For example, you might use it to signal a custom completion status alongside associated data.

## Interface IConfig

The `IConfig` class is a configuration object used specifically for UML diagram generation. It allows you to control various aspects of the diagram creation process.

A key property within this configuration is `withSubtree`, which is a boolean flag.  When set to `true`, this indicates that the generated UML diagram should include subtrees, providing a more detailed and hierarchical representation of the system being modeled.  This setting influences the depth and complexity of the resulting diagram.


## Interface ICompletionSchema

This interface, `ICompletionSchema`, defines how the system creates and manages completion mechanisms within the AI agent swarm. It’s used to configure the generation of responses for tasks.

Key aspects of this schema include:

*   **completionName:** A unique identifier for each completion mechanism, ensuring they can be distinguished within the swarm.
*   **callbacks:**  An optional set of callbacks that you can use to customize what happens after a completion is generated. This allows you to react to the completion results in a tailored way.
*   **getCompletion:** This method is responsible for actually retrieving a completion. It takes arguments related to the completion request and then generates a model response, utilizing the provided context and available tools.

## Interface ICompletionCallbacks

The `ICompletionCallbacks` interface defines how you can respond to successful completion events from the AI agent swarm framework. It gives you specific hooks to execute actions after a completion has been generated.

The core of this interface is the `onComplete` callback.

Here's what the `onComplete` callback does:

*   It’s called automatically when a completion is successfully created.
*   It receives two key arguments:
    *   `args`:  Contains general arguments related to the completion event.
    *   `output`:  This holds the actual generated completion result, typically in the form of an `IModelMessage`.

You can use this callback to perform tasks like logging the completion, processing the output data, or initiating any other necessary side effects based on the generated response.

## Interface ICompletionArgs

The `ICompletionArgs` interface defines the structure for requesting a response from a language model. It bundles together all the necessary information to ensure the model understands the context and what’s being asked.

Specifically, it includes:

*   **`clientId`**: A unique identifier for the client making the request, allowing for tracking and management.
*   **`agentName`**: The name of the agent responsible for handling the request.
*   **`mode`**:  Indicates the origin of the last message – whether it came from a user or a tool, helping the model understand the flow of conversation.
*   **`messages`**: An array of messages that provide the full conversation history or relevant context for the model to consider.
*   **`tools`**: An optional list of available tools that the agent can utilize during the completion process, such as calling external APIs.

## Interface ICompletion

The `ICompletion` interface defines the core functionality for generating responses from an AI model. It acts as a blueprint for any system that needs to produce text-based answers. This interface ensures that all implementations share a consistent set of methods for tasks like generating the response itself, handling potential errors, and managing the overall process of creating a complete answer. Essentially, it’s a standardized way to interact with and control the completion process within the AI agent swarm framework.

## Interface IClientPerfomanceRecord

The `IClientPerformanceRecord` interface provides a detailed breakdown of a client’s performance within a process. It’s designed to be used for analyzing individual client behavior, particularly within workflows like ClientAgent.

This record captures key metrics related to a client’s operations, offering insights into its efficiency and resource usage.  It’s structured to be easily integrated with logging mechanisms (like `ILogger`) or monitoring systems (like `IBus`).

Here’s a breakdown of the data contained within a `IClientPerformanceRecord`:

*   **`clientId`**:  A unique identifier for the client – typically a session or agent ID. This links the performance data directly to a specific client instance, mirroring the `clientId` used in runtime parameters.  For example, it might be "client-456".

*   **`sessionMemory`**:  A record storing temporary data used by the client during its operation.  This is similar to the `IState`’s state management capabilities within ClientAgent, holding things like cached values or temporary variables.  An example would be `{ "cacheKey": "value" }`.

*   **`sessionState`**:  A record representing the persistent state of the client, mirroring the `IState`’s role in tracking agent state. This could include things like the current step in a process or whether a client is currently active.  An example might be `{ "step": 3, "active": true }`.

*   **`executionCount`**: The total number of times the client’s operations (like commands or tool calls) were executed.  This contributes to the overall `totalExecutionCount` of the process.  For instance, a client might have an `executionCount` of 10.

*   **`executionInputTotal`**: The total amount of input data processed by the client across all executions, measured in a unit like bytes or characters.  This reflects the cumulative input data, such as incoming messages in `ClientAgent.execute`.  An example would be 1024 bytes.

*   **`executionOutputTotal`**: The total amount of output data generated by the client during its executions, also measured in a unit like bytes or characters. This represents the cumulative output data, such as results emitted from `ClientAgent._emitOutput`.  An example would be 2048 bytes.

*   **`executionInputAverage`**: The average input size per execution, calculated by dividing `executionInputTotal` by `executionCount`. This provides a normalized measure of input data volume.  For example, 102.4 bytes per execution.

*   **`executionOutputAverage`**: The average output size per execution, calculated by dividing `executionOutputTotal` by `executionCount`. This offers a normalized measure of output data volume.  For example, 204.8 bytes per execution.

*   **`executionTimeTotal`**: The total execution time for the client, formatted as a string (e.g., "300ms" or "1.5s"). This represents the cumulative duration of all executions.

*   **`executionTimeAverage`**: The average execution time per execution, formatted as a string (e.g., "30ms" per execution). This provides a normalized measure of latency.


## Interface IBusEventContext

The `IBusEventContext` interface provides supplementary information surrounding an event within the swarm system. It’s designed to offer additional context beyond the basic event data.

Primarily, the `IBusEventContext` contains identifiers for various system components.  Specifically, it includes:

*   **agentName:** A unique name representing the agent involved in the event. This is consistently populated, like "Agent1," and is crucial for linking events to individual agent instances.
*   **swarmName:** The name of the swarm associated with the event. This field is typically populated for swarm-level events, but isn’t used by the ClientAgent.
*   **storageName:** The name of the storage instance related to the event.  This is primarily relevant for storage-related events and isn’t utilized by the ClientAgent.
*   **stateName:** The name of the state instance involved in the event. This field is intended for state change events and isn’t populated in ClientAgent’s context.
*   **policyName:** The name of the policy associated with the event. This is intended for policy enforcement events and isn’t populated in ClientAgent’s emissions.

These contextual fields allow for more granular tracking and analysis of events across the swarm system.

## Interface IBusEvent

The `IBusEvent` interface is a core component of the swarm system’s internal communication. It represents a structured event designed for use with the internal bus, primarily through calls like `ClientAgent.bus.emit`. These events, such as “run” or “commit-user-message,” are used to signal actions, outputs, or state changes originating from agents.

Each `IBusEvent` contains key pieces of information:

*   **source:** This identifies the component that generated the event.  It’s consistently “agent-bus” for events from ClientAgents (like during an “emit-output” call), but can hold other values for events originating from different internal buses.
*   **type:** This is a unique string identifier that defines the event’s purpose, such as “run” or “commit-user-message.”
*   **input:** This is a key-value object that holds event-specific data, often linked to the content of an `IModelMessage`.
*   **output:**  This key-value object contains event-specific results. It’s frequently empty for notification-only events.
*   **context:**  This provides additional metadata, typically including the agent’s name, and is partially implemented using the `IBusEventContext` interface.

## Interface IBus

The IBus interface is the core mechanism for asynchronous communication within the swarm system. It provides a way for agents, primarily ClientAgents, to broadcast operational updates and lifecycle changes to the system. This decoupling is achieved through event dispatching, allowing components to react to changes without direct dependencies.

The `emit` method is the central function, taking a client ID and an event object. This asynchronous operation dispatches the event to the specified client, enabling agents to notify the system of actions like message commits, tool outputs, or execution results. All events adhere to a consistent schema defined by the IBaseEvent interface, ensuring structured payloads.

Key aspects of the IBus include:

*   **Event Structure:** Each event includes a `type` (event identifier), `source` (originating agent), `input` (data), `output` (result data), `context` (agent information), and the redundant `clientId` for targeting.
*   **Asynchronous Delivery:** The `emit` method returns a promise, indicating that events are queued or sent via a channel, resolving upon successful dispatch.
*   **Client Targeting:** Events are always sent to the client’s session ID, guaranteeing precise delivery.
*   **Notification Focus:** Primarily used for one-way notifications, with the `output` field often empty unless carrying results.

Here are some common usage examples within a ClientAgent:

*   **Stateless Run Completion:**  An agent can signal a completed stateless run by emitting a `"run"` event with the transformed result.
*   **Output Emission:**  After validating an output, an agent can broadcast the final result via an `"emit-output"` event.

The IBus is designed for type safety through generics (`<T extends IBaseEvent>`) and integrates seamlessly with other system components, such as history updates and callbacks, creating a robust and responsive swarm environment. The redundant `clientId` field offers an additional layer of validation and filtering capabilities.

## Interface IBaseEvent

The IBaseEvent interface forms the core structure for all events within the swarm system. It establishes the fundamental fields needed for every event, acting as a base for more specialized event types like IBusEvent and ICustomEvent. This interface is primarily used within the IBus system for generic event emission.

Key aspects of IBaseEvent include:

*   **source:** This property holds a string representing the origin of the event. It’s typically a generic “EventSource” (like "custom-source") but is often overridden in specific contexts, such as “agent-bus” within a ClientAgent.

*   **clientId:**  This string uniquely identifies the client receiving the event. It mirrors the `clientId` used in runtime parameters, guaranteeing events are delivered to the correct session or agent instance – for example, “client-123”.

## Interface IAgentToolCallbacks

The IAgentToolCallbacks interface provides a set of callbacks to manage the lifecycle of an agent tool. These callbacks offer flexibility in controlling how a tool is used and handled within the orchestration framework.

Specifically, you can use the `onBeforeCall` callback to perform actions *before* a tool is executed, such as logging, preparing data, or setting up necessary resources.  The `onAfterCall` callback allows you to execute tasks *after* the tool has run, like cleanup, recording results, or performing post-processing.

Furthermore, the `onValidate` callback gives you the ability to check the tool's parameters *before* execution, letting you implement custom validation rules. Finally, the `onCallError` callback is triggered if any errors occur during tool execution, providing a place to log errors or attempt recovery.

## Interface IAgentTool

The IAgentTool interface is the core component for managing tools within an AI agent swarm. It builds upon the general ITool interface to provide specific logic for each tool's operation.

Key features of IAgentTool include:

*   **Documentation:** The `docNote` property allows you to add a descriptive note about the tool, making it easier for agents to understand its purpose and how to use it.
*   **Unique Identification:** The `toolName` property ensures each tool is uniquely identified within the swarm.
*   **Customizable Execution:** The `callbacks` property lets you define lifecycle events, giving you control over the tool's execution flow.
*   **Execution Control:** The `call` method is the primary method for running the tool, accepting a data transfer object (`dto`) containing tool-specific information like ID, client ID, agent name, parameters, and execution status.
*   **Validation:** The `validate` method provides a mechanism to check the tool's parameters before execution, ensuring data integrity and preventing errors. This method can perform validation synchronously or asynchronously, depending on the complexity of the checks.

## Interface IAgentSchemaCallbacks

The `IAgentSchemaCallbacks` interface provides a set of callbacks to manage the lifecycle and interactions of an AI agent. These callbacks allow you to respond to key events during the agent's execution, offering fine-grained control over its behavior.

Specifically, you can register callbacks for:

*   **`onInit`**: Triggered when the agent is initially set up.
*   **`onRun`**: Called when the agent runs without any historical context.
*   **`onExecute`**:  Invoked at the beginning of an agent's execution.
*   **`onToolOutput`**:  Notified when a tool generates a result.
*   **`onSystemMessage`**:  Called when the agent sends a system message.
*   **`onAssistantMessage`**:  Triggered when the agent sends a message to the user.
*   **`onUserMessage`**:  Called when the agent receives a message from the user.
*   **`onFlush`**:  Executed when the agent's history is cleared.
*   **`onOutput`**:  Notified when the agent produces general output.
*   **`onAfterToolCalls`**:  Called after all tool calls within a sequence have finished.
*   **`onResurrect`**:  Triggered when the agent is brought back to life after a pause or failure.
*   **`onDispose`**:  Called when the agent is being shut down.

These callbacks give you the flexibility to integrate custom logic, logging, or other actions directly into the agent's workflow.

## Interface IAgentSchema

The `IAgentSchema` interface defines the configuration for each agent within the swarm. It outlines the agent’s core settings, including the prompts it uses – a primary prompt and optional system prompts – to guide its behavior.  Agents can be limited to a maximum number of tool calls per cycle, and they can utilize a specific completion mechanism.

The schema also specifies the available tools the agent can access, along with any associated storage and state management.  Agents can depend on other agents for coordinated transitions.

Furthermore, the `IAgentSchema` provides mechanisms for customizing the agent’s workflow through lifecycle callbacks and optional transformation and mapping functions. These functions allow developers to validate output, modify model responses, and adapt messages for compatibility with different models, offering a flexible framework for orchestrating complex agent interactions.

## Interface IAgentParams

The `IAgentParams` interface defines the settings needed to run an individual agent within the swarm. It brings together crucial information like the agent's unique identifier (`clientId`), a logger for tracking its activity and errors, and a bus for communication with other agents. 

Key components include a history tracker to record interactions and a completion service for generating responses.  

Additionally, agents can utilize a set of available tools, specified as an array of `IAgentTool` objects. Finally, a validation function (`validate`) is provided to ensure the agent's output meets specific criteria before it's finalized.

## Interface IAgentConnectionService

The `IAgentConnectionService` interface acts as a specific type definition, building upon the more general `AgentConnectionService`. Its primary purpose is to precisely define `TAgentConnectionService` by intentionally omitting any internal details. This ensures that the `TAgentConnectionService` always represents only the public-facing operations and properties, promoting a clear separation between the internal implementation and the externally accessible API.

## Interface IAgent

The IAgent interface defines the core runtime behavior for an AI agent. It provides methods for the agent to operate independently, processing input and managing its internal state.

Key functionalities include:

*   **`run`**:  This method allows the agent to perform stateless computations or generate previews without considering the conversation history.
*   **`execute`**: This method executes the agent with a given input, potentially updating the conversation history depending on the specified execution mode.
*   **`waitForOutput`**: This method waits for and retrieves the final output generated by the agent after its execution.

Beyond execution, the interface offers methods for managing the agent's state:

*   **`commitToolOutput`**:  Allows you to record the results of tool calls within the agent's history.
*   **`commitSystemMessage` & `commitUserMessage` & `commitAssistantMessage`**: These methods enable you to add messages to the agent's history, representing different parts of the conversation.
*   **`commitFlush`**:  This method resets the agent’s history, effectively starting it from a clean slate.
*   **`commitStopTools`**:  This method prevents the next tool in the execution chain from running.
*   **`commitAgentChange`**: This method signals a change in the agent’s state, halting further tool executions.
