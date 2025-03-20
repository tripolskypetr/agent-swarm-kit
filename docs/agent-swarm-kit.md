# agent-swarm-kit api reference

**Overall Architecture:**

This system built around a distributed, asynchronous architecture. Agents communicate via a message queue, and their interactions are orchestrated through a series of tools and processes. The core concept is to allow agents to perform tasks independently while still being part of a larger, coordinated system.

**Core Orchestration & Agent Management:**

* **IAgent:** This is the central interface. It represents the *runtime* of an individual agent. It's responsible for:
    * `run()`:  Executing the agent without relying on conversation history.
    * `execute()`:  Executing the agent *with* conversation history.
    * Committing messages (tool output, system messages, user messages).
    * Committing a flush (resetting state).
    * Committing stop tools.

* **IAgentParams:**  This interface defines the *configuration* needed to run an `IAgent`. It includes:
    * `clientId`: Unique identifier for the agent.
    * `logger`: Logging system.
    * `bus`: Communication channel.
    * `history`:  History tracker.
    * `completion`:  Component for generating responses.
    * `tools`:  List of available tools.
    * `validate`:  Function for validating output.

**Message Handling & Context:**

* **IAgentSchemaCallbacks:** This interface defines callbacks for managing different stages of an agent's lifecycle, triggered by events like initialization, tool output, and message commits.

* **IAgentSchema:** This interface defines the *configuration* for an `IAgent`, including its prompt, completion mechanism, and tool set.

**Communication & Integration:**

* **IAgentConnectionService:**  A type definition for an `AgentConnectionService`, ensuring a clean, public-facing representation of the service's operations.

**Tooling & Execution:**

* **IAgentParams:**  (Again)  Crucially, the `tools` property within `IAgentParams` is a list of tools the agent can utilize.

**Workflow & Communication:**

1. **Agent Configuration:** An `IAgentSchema` defines the agent's configuration (prompts, tools, etc.).
2. **Agent Execution:** The `IAgent` interface is used to execute the agent, potentially triggering tool calls.
3. **Tool Calls:** The agent uses its configured tools (defined in `IAgentTool`) to perform specific tasks.
4. **Communication:** Agents communicate via the `IAgentConnectionService` and the bus.

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

The service utilizes dependency injection to manage its logging, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting, and employs memoization to efficiently check for tool existence based on their names.  The `addTool` function registers new tools and their schemas, while the `validate` function performs checks against the tool map, providing a robust mechanism for verifying tool availability.

## Class ToolSchemaService

The ToolSchemaService is the core service for managing the definitions of tools used within the AI agent swarm. It acts as a central repository, utilizing the functools-kit ToolRegistry to store and quickly access these tool definitions – each represented as an IAgentTool instance.

This service performs shallow validation on each tool schema, ensuring key properties like toolName are strings, call and validate are functions, and function is an object, maintaining basic integrity.  It’s integrated with several other services: AgentSchemaService to manage tool references within agent schemas, ClientAgent for tool execution during agent runs, AgentConnectionService for agent instantiation, and SwarmConnectionService for swarm-level tool execution.

The service employs a LoggerService for logging operations at the info level, controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.  New tool schemas are registered using the `register` method, which validates the schema before adding it to the registry.  Existing tool schemas are retrieved using the `get` method, also logging operations when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled. The registry itself is immutable once initialized, updated only through the ToolRegistry’s register method to ensure a consistent collection of tool definitions.

## Class SwarmValidationService

The SwarmValidationService is a core component responsible for ensuring the integrity and validity of all swarms within the system. It maintains a central map of registered swarms, meticulously tracking each one’s configuration – including its unique name, associated agents, and applied policies.

To achieve this, the service leverages several supporting services through dependency injection. It collaborates closely with the AgentValidationService to verify the agents listed for each swarm, and the PolicyValidationService to confirm the policies are correctly configured.  The service also utilizes the ClientSwarm for agent management and policy enforcement.

The SwarmValidationService manages a dynamic map of swarms, populated and queried to perform thorough checks.  A key feature is its `validate` method, which is memoized by swarm name to optimize performance. This method performs comprehensive validation, ensuring the swarm’s existence, the inclusion of default agents, and the validity of all associated agents and policies.  The service also provides methods for retrieving the list of all swarms and for retrieving agent and policy lists, all while logging operations for monitoring and debugging.


## Class SwarmSchemaService

The SwarmSchemaService is the core service responsible for managing all swarm configurations within the system. It acts as a central registry, utilizing the ToolRegistry from functools-kit to store and retrieve ISwarmSchema instances. This registry ensures the integrity of swarm definitions by performing shallow validation on each schema.

The service integrates closely with several other components, including the LoggerService for logging operations at the info level (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), the SwarmConnectionService, and the ClientAgent.  It validates swarm configurations, specifically checking that the swarmName and defaultAgent are strings, the agentList contains unique AgentName references, and policies (if present) contain unique PolicyName references.

Key methods include registering new schemas using the `register` method, which validates the schema before adding it to the registry, and retrieving existing schemas using the `get` method.  These operations are crucial for orchestrating agent execution within the swarm ecosystem, supporting ClientSwarm instantiation and linking to other services like AgentConnectionService and PolicySchemaService. The service’s design is intended to provide a robust and consistent foundation for managing swarm configurations.


## Class SwarmPublicService

The SwarmPublicService provides a public interface for interacting with a swarm system. It acts as a central point of access, managing swarm-level operations and providing a consistent API. This service leverages the `SwarmConnectionService` for the core swarm interactions, while also incorporating the `MethodContextService` to ensure operations are correctly scoped to a specific client and swarm.

Key functionalities include navigating the swarm’s execution flow, controlling output, waiting for agent results, and managing agent references. The service utilizes a logger for informational logging (enabled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`) to track swarm interactions and aid in debugging.

Several methods are available, such as `navigationPop` to move through the swarm’s execution stack, `cancelOutput` to interrupt agent output, `waitForOutput` to await agent results, and `getAgentName` and `getAgent` to retrieve agent information.  The service also supports setting agent references and disposing of the swarm when no longer needed.  These operations are carefully managed using the `MethodContextService` and logging for traceability.

## Class SwarmMetaService

The SwarmMetaService is a core component responsible for managing and visualizing the structure of the swarm system. It operates by building detailed, hierarchical representations of the swarm – known as IMetaNode trees – from the swarm’s underlying schema data.

This service utilizes the SwarmSchemaService to retrieve the necessary swarm definitions, including the default agent, and the AgentMetaService to create the individual agent nodes within these trees.  The generated IMetaNode trees are then serialized into a standard UML format, primarily for use by the DocService.

Specifically, the service employs a `toUML` method to generate the UML string, which is subsequently used by DocService to create visual diagrams, such as the `swarm_schema_[swarmName].svg` files.  It also includes a `makeSwarmNode` method that constructs the IMetaNode tree, incorporating logging via the LoggerService when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled, ensuring consistent logging patterns across the system.  The service integrates with ClientAgent and PerfService to accurately represent agent relationships and system performance context.

## Class SwarmConnectionService

The SwarmConnectionService is the core component for managing interactions within a swarm system. It acts as an interface, implementing the `ISwarm` protocol to handle swarm instance creation, agent navigation, output retrieval, and lifecycle operations, all tied to a specific client ID and swarm name.

This service integrates with several other key components, including the ClientAgent for executing agents within the swarms, the SwarmPublicService for public API access, and the AgentConnectionService for managing agent instances. It leverages memoization using functools-kit’s memoize to efficiently reuse `ClientSwarm` instances, reducing overhead by caching them based on the client ID and swarm name.

The service utilizes a LoggerService for logging operations at an info level (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with the SwarmSchemaService to obtain swarm configurations and the AgentConnectionService to instantiate agents.  It relies on a BusService for event propagation, aligning with the broader swarm event system.

Key functionalities include retrieving or creating a `ClientSwarm` instance using memoization, navigating the swarm’s agent stack via `navigationPop`, canceling pending output with `cancelOutput`, waiting for agent output with `waitForOutput`, and retrieving the currently active agent’s name and instance with `getAgentName` and `getAgent`, respectively.  The service also provides methods for dynamically managing agents, such as `setAgentRef` and `setAgentName`. Finally, it includes a `dispose` method for cleaning up the swarm connection, clearing the memoized instance and aligning with other cleanup processes.

## Class StorageValidationService

The StorageValidationService is a core component of the swarm system, responsible for ensuring the integrity of all storage configurations. It maintains a record of registered storage locations, verifying that each one is unique, actually exists, and has a correctly configured embedding. 

This service works closely with several other components: the StorageSchemaService for initial storage registration, ClientStorage for performing operational checks, the AgentValidationService for agent-specific storage validation, and the EmbeddingValidationService for verifying embedding data. 

The service utilizes dependency injection to manage these components and employs memoization to speed up validation checks by storing results based on the storage name.  It’s controlled through the LoggerService, logging operations at the info level based on GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.  The core validation logic resides in the `validate` method, which checks for storage existence and validates its embedding, leveraging the ClientStorage service for operational integrity.  A new storage is added to the validation service via the `addStorage` method, which is synchronized with the StorageSchemaService.


## Class StorageUtils

The `StorageUtils` class provides a centralized way to manage data storage within an agent swarm. It implements the `TStorage` interface, offering methods for retrieving, inserting, updating, deleting, and listing items stored by specific agents.  This utility handles client-specific storage, ensuring proper agent-storage registration and validation before any data operations are performed.  Key functionalities include the `take` method for retrieving a limited number of items based on a search query, the `upsert` method for adding or modifying items, the `remove` method for deleting items by ID, the `get` method for retrieving a single item, and the `list` method for listing all items within a storage.  Furthermore, the `clear` method allows for the complete removal of data for a given agent and storage. All operations are executed within a logging context for monitoring and debugging purposes.

## Class StorageSchemaService

The StorageSchemaService is the core service for managing storage configurations within the swarm system. It acts as a central registry, utilizing ToolRegistry from functools-kit, to store and retrieve IStorageSchema instances. This registry ensures the integrity of storage schemas through shallow validation, checking that each schema has a valid storageName (as a string), a function for creating indexes, and a reference to an EmbeddingName from the EmbeddingSchemaService.

The service integrates with several other key components, including StorageConnectionService, SharedStorageConnectionService, AgentSchemaService, ClientAgent, and StoragePublicService.  It leverages a LoggerService for logging operations at the info level, controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.

The service’s primary methods are registration and retrieval. The `register` method adds a new schema to the registry after validation, while the `get` method retrieves an existing schema based on its name.  These operations are crucial for configuring ClientStorage instances within StorageConnectionService and SharedStorageConnectionService, supporting the dynamic needs of the swarm’s agent execution and storage management. The registry itself is designed to be immutable once initialized, updated solely through ToolRegistry’s register method to maintain a consistent collection of storage schemas.

## Class StoragePublicService

This `StoragePublicService` class acts as a public interface for managing client-specific storage within the swarm system. It’s designed to provide a consistent way for other services, like the `ClientAgent`, to interact with individual clients’ storage data. The service relies on the `StorageConnectionService` for the actual storage operations and uses the `MethodContextService` to track the context of each operation, ensuring proper scoping and logging.

Key functionalities include retrieving, inserting, updating, deleting, and listing items from this client-specific storage, all tied to a particular client identified by their `clientId`. The service integrates with the `ClientAgent` for tasks like searching and storing data within `EXECUTE_FN`, and it supports tracking storage usage through `PerfService` and documenting storage schemas via `DocService`.

The service utilizes a `loggerService` for informational logging, controlled by the `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` setting.  Methods like `take`, `upsert`, `remove`, `get`, `list`, `clear`, and `dispose` are all wrapped with the `MethodContextService` and logging to provide detailed tracking and debugging capabilities.  It’s distinct from the `SharedStoragePublicService` by focusing on storage dedicated to individual clients, offering a more granular control mechanism.

## Class StateUtils

The StateUtils class is a core component designed to manage individual agent states within the AI agent swarm. It acts as a central point for retrieving, updating, and clearing state information specific to each client and agent. 

This utility provides methods – `getState`, `setState`, and `clearState` – that interact with the swarm’s state service.  `getState` allows you to retrieve the current state data, ensuring proper client session and agent-state registration are verified before accessing the data. The `setState` method offers flexibility, accepting either a direct state value or a function that calculates the new state based on the previous one. Finally, `clearState` resets the state data to its initial value, again validating client and agent registration. All operations are executed within a logging context for monitoring and debugging.

## Class StateSchemaService

The StateSchemaService is the core service responsible for managing all state schemas within the swarm system. It acts as a central repository, utilizing a ToolRegistry to store and retrieve IStateSchema instances. This service performs shallow validation on each schema to guarantee basic integrity, ensuring that required fields and function definitions are present.

The StateSchemaService integrates closely with other key services, including StateConnectionService, SharedStateConnectionService, ClientAgent, AgentSchemaService, and StatePublicService. It’s used to define and configure state configurations, such as the `getState` function and associated middlewares, which are crucial for both client-specific and shared states.

The service leverages a LoggerService for logging operations at the info level, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting, mirroring the logging patterns of StateConnectionService and PerfService.  It’s designed to support the instantiation of ClientState within StateConnectionService and SharedStateConnectionService, and provides the necessary state configurations for ClientAgent execution.  The registry itself is immutable, updated only through the ToolRegistry’s `register` method to maintain a consistent collection of state schemas.


## Class StatePublicService

This class, StatePublicService, manages client-specific state operations within the swarm system. It provides a public interface for interacting with state data, leveraging a generic type system to support various state formats. 

The service integrates with several key components: the ClientAgent for handling client-specific state updates during execution, PerfService for tracking state changes associated with individual client IDs, and DocService for documenting state schemas based on their names. 

StatePublicService utilizes a LoggerService for logging operations at the info level, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting. It operates by delegating core state operations to a StateConnectionService, wrapping these calls with a MethodContextService for scoping and logging.

Key functionalities include setting, clearing, retrieving, and disposing of client-specific state, all managed through the `setState`, `clearState`, and `getState` methods. These methods are designed to be used within the ClientAgent (like during the `EXECUTE_FN` process) and by PerfService (for tracking session state per client). 

The service also includes a `dispose` method for cleaning up client-specific state when it’s no longer needed, aligning with the ClientAgent’s cleanup routines and PerfService’s disposal mechanisms.  The service relies on injected dependencies: a LoggerService and a StateConnectionService, both providing the underlying state management capabilities.

## Class StateConnectionService

The StateConnectionService is a core component within the AI agent swarm orchestration framework, designed to manage and interact with individual agent states. It implements the `IState` interface, providing a structured way to handle state instances, their manipulation, and their lifecycle. This service is scoped to both a client ID and a state name, ensuring that each state is uniquely identified and managed.

At its heart, the service utilizes memoization through functools-kit’s memoize, caching `ClientState` instances based on a composite key (client ID and state name) for highly efficient reuse. It’s also built for thread safety, serializing state updates to prevent conflicts. The service delegates shared state operations to the SharedStateConnectionService, and tracks these shared states within the `_sharedStateSet`.

Key integrations include ClientAgent, AgentConnectionService, StatePublicService, and SharedStateConnectionService. It leverages the LoggerService for logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), the StateSchemaService for state configurations, and the SessionValidationService for usage tracking. The service provides methods like `getState`, `setState`, and `clearState`, which mirror functionalities found in StatePublicService, supporting state updates and resets within agent execution.

The `getStateRef` method is central, retrieving or creating a memoized `ClientState` instance, applying schema data, and serializing state updates. The `dispose` method cleans up resources, clearing the memoized instance and updating the SessionValidationService, while ensuring shared states remain managed by the SharedStateConnectionService.

## Class SharedStorageUtils

The SharedStorageUtils class provides a central interface for interacting with the swarm’s shared storage. It implements the `TSharedStorage` interface, offering a set of methods to manage data within the storage.

Key functionalities include retrieving items using the `take` method, which allows searching for specific data based on a query and limits the number of results.  The `upsert` method handles both inserting new items and updating existing ones within the shared storage.  You can also remove individual items using the `remove` method, identified by their unique ID.

Furthermore, the class provides the ability to retrieve a single item by its ID with the `get` method.  For managing the entire storage, the `list` method allows you to retrieve all items, optionally filtered based on a provided condition. Finally, the `clear` method provides a way to remove all data from a specific storage.  All these operations are executed within a context that supports logging and validation, ensuring the integrity and security of the shared storage interactions.

## Class SharedStoragePublicService

The `SharedStoragePublicService` class acts as a public interface for interacting with shared storage within the swarm system. It implements the `TSharedStorageConnectionService` to provide a consistent API for accessing and managing shared storage data. This service handles common operations like retrieving, inserting, updating, deleting, and listing items from shared storage.

Key features include:

*   **Abstraction:** It encapsulates the underlying storage operations through the `SharedStorageConnectionService`, shielding users from direct interaction with the storage layer.
*   **Contextual Logging:**  The service utilizes a `LoggerService` for logging operations, controlled by the `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` setting, ensuring consistent logging patterns across the system.
*   **Integration:** It integrates seamlessly with components like the `ClientAgent` (for data retrieval and storage within `EXECUTE_FN`), the `PerfService` (for tracking storage usage and updates in `sessionState`), and the `DocService` (for documenting storage schemas via `storageName`).

The service offers several methods:

*   `take`: Retrieves a list of storage items based on a search query and total count.
*   `upsert`: Inserts or updates a single storage item.
*   `remove`: Deletes a specific storage item by its ID.
*   `get`: Retrieves a single storage item by its ID.
*   `list`: Retrieves a list of all storage items, optionally filtered.
*   `clear`: Removes all items from the storage.

Each method wraps the core storage operations with the `MethodContextService` for scoping and utilizes the `LoggerService` for logging, contributing to a robust and traceable system.

## Class SharedStorageConnectionService

The SharedStorageConnectionService is a core component responsible for managing shared storage instances within the swarm system. It implements the `IStorage` interface, providing a centralized way to handle data access and manipulation for all clients.  This service ensures a single, consistent view of shared data, regardless of the client requesting it.

Key functionalities include retrieving, updating, and deleting data from the shared storage, leveraging memoization via functools-kit’s memoize to optimize performance by caching `ClientStorage` instances keyed by storage name.  The service utilizes a fixed `clientId` of "shared" to maintain a unified storage experience.

The service integrates with several other components, including ClientAgent, StoragePublicService, and SharedStoragePublicService, facilitating seamless interaction with storage instances across the swarm.  It relies on dependency injection for its logger service, bus service, and storage schema service, enabling flexible logging and event propagation.  The `getStorage` method is central, dynamically configuring a `ClientStorage` instance with schema data, embedding logic, and persistence settings.

Methods like `take`, `upsert`, `remove`, `get`, and `list` delegate to the underlying `ClientStorage` after initialization, providing a familiar API for data retrieval and manipulation.  The `clear` method resets the shared storage to its default state.  The service’s design promotes scalability and maintainability by decoupling data access logic from the underlying storage implementation.

## Class SharedStateUtils

The SharedStateUtils class is a core utility designed to manage shared data across an agent swarm. It acts as an interface to the swarm’s shared state service, providing methods for retrieving, updating, and resetting state information.

Specifically, it offers:

*   **`getState`**: This method allows you to retrieve the current shared state data associated with a particular state name. It handles the underlying communication with the shared state service and includes logging for context.
*   **`setState`**:  This method enables you to modify the shared state. You can either provide a direct value to set the state, or, more powerfully, you can pass a function. This function takes the previous state as input and returns a new state, allowing for state updates based on complex logic.
*   **`clearState`**: This method resets the shared state for a given state name, returning it to its initial, empty state. Like the other methods, it operates within a logging context and delegates to the shared state service.

## Class SharedStatePublicService

The SharedStatePublicService acts as a central interface for managing shared state operations within the swarm system. It implements the `TSharedStateConnectionService` to provide a public API, delegating core state interactions to the underlying SharedStateConnectionService. This service is enhanced with MethodContextService for controlled scoping and utilizes LoggerService for consistent, info-level logging, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting.

The service’s key functionalities include `setState`, which updates shared state using a provided dispatch function and logging mechanism, and `clearState`, which resets the state to its initial value.  Additionally, the service offers a `getState` method for retrieving the current shared state. These methods are designed to integrate seamlessly with ClientAgent (for state management within EXECUTE_FN) and PerfService (for tracking and managing session state). The service’s architecture ensures robust state management and monitoring across the entire swarm system.


## Class SharedStateConnectionService

The SharedStateConnectionService is a core component responsible for managing shared state connections within the swarm system. It implements the `IState<T>` interface, providing a centralized mechanism for shared state instance management, manipulation, and access.  Designed for use across all clients, it operates with a fixed client ID of "shared."

This service integrates with several other key components, including ClientAgent, StatePublicService, SharedStatePublicService, and AgentConnectionService. It utilizes memoization through functools-kit’s memoize to efficiently cache `ClientState` instances by their `stateName`, ensuring a single, shared instance is used across all clients.  Updates are serialized and queued for thread-safe modifications.

The service relies on logging via LoggerService (enabled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) and coordinates with StateSchemaService for state configuration, applying persistence through PersistStateAdapter or defaults from GLOBAL_CONFIG.

Key functionalities include:

*   **getStateRef:** This method retrieves or creates a memoized `ClientState` instance, managing caching and applying state configurations via `StateSchemaService`. It supports ClientAgent, AgentConnectionService, and SharedStatePublicService.
*   **setState:** This method sets the shared state using a provided dispatch function, ensuring thread-safe updates and integration with ClientAgent’s state updates.
*   **clearState:** This method resets the shared state to its initial value, mirroring the behavior of `clearState` in SharedStatePublicService.

The service utilizes a LoggerService for informational logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), a BusService for event propagation, and a MethodContextService for accessing execution context. It leverages the StateSchemaService for retrieving state configurations and integrates with the PersistStateAdapter for persistence.


## Class SessionValidationService

The SessionValidationService is responsible for managing and verifying the existence and resource usage of sessions within the swarm system. It meticulously tracks each session’s associations with swarms, modes, agents, histories, and storage, ensuring that resources are utilized consistently and that sessions are properly managed.

This service integrates seamlessly with several key components, including SessionConnectionService, ClientSession, ClientAgent, ClientStorage, and ClientState, facilitating robust session lifecycle management. Dependency injection is employed for the logger, and memoization is utilized to optimize validation checks for efficiency.

Key functionalities include:

*   **Session Registration:** The `addSession` method registers new sessions, logging the operation and ensuring uniqueness.
*   **Resource Tracking:** Methods like `addAgentUsage`, `addHistoryUsage`, `addStorageUsage`, and `addStateUsage` track the utilization of agents, histories, storage, and states within each session.
*   **Data Retrieval:**  Methods like `getSessionMode`, `getSwarm`, `getSessionAgentList`, `getSessionHistoryList` provide access to session data for various operational needs.
*   **Validation:** The `validate` method performs thorough session existence checks, leveraging memoization for performance.
*   **Session Management:** The `removeSession` method cleans up session data and clears validation caches.

The service provides essential validation capabilities, ensuring session integrity and efficient resource management within the swarm environment.

## Class SessionPublicService

This `SessionPublicService` class acts as a central interface for interacting with a session within the swarm system. It implements the `TSessionConnectionService` to provide a public API, delegating core session operations to the `SessionConnectionService`.  The service is designed to wrap these operations with contextual information using `MethodContextService` and `ExecutionContextService` for robust scoping and tracking.

Key integrations include: `ClientAgent` (for session-level messaging and tool execution), `AgentPublicService` (for swarm-wide session management), `PerfService` (for detailed execution metrics and session state tracking), `BusService` (for event emission during session lifecycle events), and `SwarmMetaService` (for accessing swarm context details like the `swarmName`).

The service utilizes a `LoggerService` for informational logging, controlled by the `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` setting.  It offers several methods for managing session interactions: `connect` (establishing a messaging channel with performance tracking), `emit` (sending messages to the session), `commitToolOutput`, `commitSystemMessage`, `commitAssistantMessage`, `commitUserMessage`, `commitFlush`, `commitStopTools`, and `dispose` (cleaning up resources).  Each of these methods wraps the underlying `SessionConnectionService` calls with contextual information and logging.  The `connect` method is particularly important, integrating with the `ClientAgent` to facilitate session-level communication and tool execution.

## Class SessionConnectionService

Okay, here's a human-friendly summary of the `SessionConnectionService` API reference, aiming for clarity and a practical understanding:

**The SessionConnectionService is the core engine for managing individual sessions within your AI agent swarm.** Think of it as the central hub for any interaction happening inside a specific session. It’s designed to be efficient and reusable, primarily through caching.

**Here's what it does:**

*   **Creates and Manages Sessions:** It allows you to establish and control individual sessions, each tied to a unique client and swarm.
*   **Handles Communication:** It provides methods for sending and receiving messages within a session, allowing your agents to exchange data and instructions.
*   **Caches for Efficiency:**  It uses caching to avoid creating new sessions repeatedly, significantly improving performance.  When you request a session, it checks if one already exists with the same parameters.
*   **Supports Tool Interaction:** It facilitates the execution of tools (like OpenAI's tools) within a session, managing the flow of data and responses.
*   **Manages History:** It handles the storage and retrieval of session history (messages, tool outputs, etc.) for later analysis or use.
*   **Clean Shutdown:** It provides a way to gracefully close a session, releasing resources and clearing the cached session.

**Key Features:**

*   **Caching:**  The service intelligently caches sessions to avoid redundant creation, boosting performance.
*   **Modular Design:** It’s built with a modular architecture, allowing it to integrate seamlessly with other components of your swarm (like tool execution and history management).

**In essence, the `SessionConnectionService` is the fundamental building block for creating and controlling the interactions that drive your AI agents within individual sessions.**

---

Would you like me to:

*   Focus on a specific aspect of the service (e.g., caching, tool interaction)?
*   Provide an example of how you might use this service in code?

## Class SchemaUtils

The SchemaUtils class offers a set of tools focused on managing data within client sessions and converting objects to strings. It provides methods for writing data to a client’s session memory, ensuring the session is valid before the operation.  You can use `writeSessionMemory` to store data, and it’s designed to handle validation and logging.  Additionally, the class includes a `readSessionMemory` function to retrieve data from a client’s session, again with validation and logging. Finally, the `serialize` method converts objects – whether single objects or arrays of objects – into formatted strings. This function can flatten nested objects and allows for custom mapping of keys and values during the serialization process, giving you control over the output format.

## Class PolicyValidationService

The PolicyValidationService is a core component of the swarm system, responsible for ensuring the integrity of policies. It maintains a record of all registered policies, verifying their uniqueness and availability. This service works closely with several other systems: the PolicySchemaService for initial policy registration, the ClientPolicy system for enforcement, and the AgentValidationService for potential agent-level checks. 

The service utilizes dependency injection to manage logging, leveraging the LoggerService and its configuration via GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.  A key feature is the use of memoization – the `validate` function is cached based on the `policyName` to optimize performance. 

The `validate` function itself checks the existence of a policy within the `_policyMap`.  The `addPolicy` function registers new policies, logging the operation and ensuring that each policy is uniquely identified.  This robust system provides a centralized point for policy validation within the swarm.

## Class PolicyUtils

The PolicyUtils class offers a set of tools for managing client bans as part of a swarm policy system. It provides methods to safely and reliably handle banning, unbanning, and checking for bans within a swarm.

Key functionalities include:

*   **`banClient`**: This method allows you to ban a client under a defined policy within a specific swarm. It performs thorough validation of the client ID, swarm name, and policy name before sending the request to the policy service.
*   **`unbanClient`**:  This method reverses the `banClient` operation, unbanning a client from a policy within a swarm. Like `banClient`, it validates input and interacts with the policy service.
*   **`hasBan`**: This method checks whether a client is currently banned under a given policy within a swarm. It also validates the input and queries the policy service to determine the ban status.

All operations within PolicyUtils are designed to operate within a context, facilitating logging and tracking for auditing and monitoring purposes.

## Class PolicySchemaService

The PolicySchemaService is the central component for managing policy definitions within the swarm system. It acts as a registry, storing and retrieving IPolicySchema instances using a ToolRegistry for efficient management.  The service performs shallow validation of each schema, ensuring key elements like the `policyName` and `getBannedClients` function are present and valid.

It integrates closely with other services, including PolicyConnectionService, ClientAgent, SessionConnectionService, and PolicyPublicService, providing a consistent policy framework.  The service utilizes a LoggerService for informational logging (controlled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`) during operations like registration, retrieval, and validation.

Key functionalities include registering new schemas via the `register` method, which validates them before adding them to the registry, and retrieving existing schemas using the `get` method.  This allows for dynamic policy updates and consistent enforcement across the swarm’s various components.  The service’s design supports ClientAgent and SessionConnectionService by guaranteeing valid policy schemas are available for access control and session-level policy checks.


## Class PolicyPublicService

The PolicyPublicService acts as a central interface for managing public policy operations within the swarm system. It extends the `TPolicyConnectionService` to provide a public API, delegating core policy logic to the `PolicyConnectionService` while incorporating contextual information through the `MethodContextService`.  This service integrates with several components including `PerfService` for policy enforcement, `ClientAgent` for client-side validation, `DocService` for policy documentation, and `SwarmMetaService` to access swarm context details.

The service utilizes a `LoggerService` for logging operations at the INFO level, controlled by the `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` setting, ensuring consistent logging patterns with other services like `AgentPublicService` and `DocService`.

Key functionalities include:

*   **`hasBan`**: Checks if a client is banned from a specific swarm under a given policy, utilizing `PolicyConnectionService` and logging via the `LoggerService`.
*   **`getBanMessage`**: Retrieves the ban message for a client, also leveraging `PolicyConnectionService` and logging.
*   **`validateInput`**: Validates incoming data against a policy, again using `PolicyConnectionService` and logging.
*   **`validateOutput`**: Validates outgoing data against a policy, utilizing `PolicyConnectionService` and logging.
*   **`banClient`**: Bans a client from a swarm under a policy, employing `PolicyConnectionService` and logging.
*   **`unbanClient`**: Unbans a client from a swarm under a policy, utilizing `PolicyConnectionService` and logging.

These methods are designed to be used in scenarios such as policy-based access control (through `PerfService` and `ClientAgent`) and documentation (via `DocService`). The service provides a structured way to manage and enforce policies within the swarm environment.

## Class PolicyConnectionService

The PolicyConnectionService is a core component within the swarm system, designed to manage policy connections and operations. It implements the `IPolicy` interface, providing a structured way to handle policy instances, ban status checks, and input/output validation, all scoped to a specific policy name, client ID, and swarm name.

This service integrates with several other key components, including the ClientAgent for policy enforcement, SessionPublicService for session-level policy checks, and PolicyPublicService for public API access. It leverages the BusService for event emission, aligning with the event system used in SessionPublicService.

A central feature is its use of memoization, achieved through functools-kit’s memoize, to efficiently cache `ClientPolicy` instances by policy name. This dramatically reduces the overhead of creating new policy instances repeatedly. The service utilizes the LoggerService for logging information, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting, and coordinates with the PolicySchemaService to retrieve policy configurations.

Key methods include `getPolicy`, which retrieves or creates a memoized policy instance, `hasBan` for checking ban status, `getBanMessage` for retrieving ban messages, `validateInput` and `validateOutput` for input/output validation, and `banClient` and `unbanClient` for managing bans. Each of these methods delegates to the `ClientPolicy` for the actual enforcement, utilizing context from the MethodContextService for scoping and logging via the LoggerService when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.  This design mirrors functionality found in PolicyPublicService, supporting the ClientAgent’s execution restrictions and SessionPublicService’s policy checks.

## Class PersistSwarmUtils

The `PersistSwarmUtils` class provides a foundational toolkit for managing persistent data related to AI agent swarms. It acts as an implementation of `IPersistSwarmControl`, offering utilities to track and modify the active agents and navigation stacks associated with each swarm.

At its core, the class utilizes memoized functions – `getActiveAgentStorage` and `getNavigationStackStorage` – to ensure that storage instances are created only once per swarm name, promoting efficiency and preventing data duplication.

Key functionalities include retrieving the active agent for a specific client within a swarm using `getActiveAgent`, and setting that agent’s status with `setActiveAgent`. Similarly, it allows retrieval of the navigation stack for a client via `getNavigationStack` and setting it with `setNavigationStack`.

Furthermore, the `PersistSwarmUtils` class supports customization through `usePersistActiveAgentAdapter` and `usePersistNavigationStackAdapter`, enabling developers to inject their own persistence logic using a custom constructor, overriding the default `PersistBase` implementation. This flexibility allows for tailored persistence strategies to suit specific swarm requirements.

## Class PersistStorageUtils

The PersistStorageUtils class provides a flexible way to manage data persistence for individual clients, tied to specific storage names. It acts as a utility, offering methods to retrieve and store data, ensuring that each client has its own isolated storage instance.

This class utilizes a customizable persistence adapter, allowing you to tailor the underlying storage mechanism.  The core functionality revolves around the `getPersistStorage` function, which memoizes the creation of a storage instance for a given storage name, guaranteeing a single instance per name.

You can use `setData` to store data for a client within a particular storage, and `getData` to retrieve it, with a default value provided if the data isn't already present.  The `usePersistStorageAdapter` method lets you replace the standard persistence implementation with your own custom constructor, giving you full control over the storage process.

## Class PersistStateUtils

This utility class, `PersistStateUtils`, is designed to manage and persist state information for individual clients, based on a defined state name. It acts as a central control point for handling state data.

The core functionality revolves around a `PersistStateFactory` which is used to create and retrieve storage instances.  A key component is the `getStateStorage` function, a memoized function that guarantees a single storage instance is created for each unique state name.

The `setState` method allows you to set the state data for a client, wrapping the data within an `IPersistStateData` structure for persistence. Conversely, the `getState` method retrieves the state data for a client, providing a default state if the data hasn't been previously set.

Finally, the `usePersistStateAdapter` method enables you to customize the persistence mechanism by providing a custom constructor, overriding the default `PersistBase` implementation and tailoring the persistence behavior to your specific needs.

## Class PersistPolicyUtils

This utility class, `PersistPolicyUtils`, provides tools for managing policy data within the AI agent swarm system. It acts as a central point for handling banned client information, offering methods to retrieve and update this data.

The core functionality revolves around a `PersistPolicyFactory` and a memoized `getPolicyStorage` function. `getPolicyStorage` ensures that only one persistence instance is created per swarm, improving resource efficiency.

Key methods include `getBannedClients`, which retrieves the list of banned clients for a given policy and swarm, defaulting to an empty array if no bans are defined.  This is used to check client status during swarm operations.

The `setBannedClients` method allows you to update the banned client list for a specific policy and swarm, persisting these changes for future use.

Finally, the `usePersistPolicyAdapter` method allows you to customize the underlying persistence mechanism. You can provide a custom constructor to manage persistence using different storage options, such as in-memory or database-backed storage, giving you fine-grained control over how policy data is stored and retrieved.


## Class PersistMemoryUtils

The PersistMemoryUtils class provides a flexible way to manage memory data for individual clients within an AI agent swarm. It acts as a utility, offering methods to both retrieve and store memory information, all while utilizing a customizable persistence adapter.  

At its core, PersistMemoryUtils employs a memoized function, `getMemoryStorage`, to ensure that each client has a single, dedicated storage instance. This function creates or retrieves the storage based on the client's ID.

Key functionalities include `setMemory`, which allows you to persist memory data for a client, packaged within an `IPersistMemoryData` structure, and `getMemory`, which retrieves this data, providing a default state if the memory hasn't been previously set.

Furthermore, the class supports custom persistence logic through the `usePersistMemoryAdapter` method, enabling you to replace the default `PersistBase` implementation with your own. Finally, the `dispose` method provides a way to cleanly remove the memory storage associated with a specific client ID.

## Class PersistList

The PersistList class extends the base PersistBase structure to create a persistent, ordered list of entities. It utilizes numeric keys to maintain the order of items within the list.  The class manages these keys to ensure consistent ordering, even when multiple operations are happening simultaneously.

Key features include a mechanism for generating unique numeric keys, guaranteeing sequential key creation regardless of concurrent calls.  It provides functions for both adding and removing entities from the list.

Specifically, the `push` method adds a new entity to the end of the list, assigning it a unique numeric key. The `pop` method removes and returns the last entity from the list.  Both operations are designed to be atomic, ensuring data integrity under concurrent access scenarios.  The `pop` function returns `null` if the list is empty.


## Class PersistBase

The PersistBase class serves as the foundation for persistent storage of your entities, managing their data within the file system. It’s designed to read and write entities as JSON files, providing a straightforward way to save and retrieve your data.

When you create a PersistBase instance, you specify the name of the entity you’re storing and the base directory where the files will be located.  The class maintains a directory path and utilizes a mechanism to ensure initialization runs only once.

Key methods include calculating the file path for each entity, initializing the storage directory if it doesn’t exist, and validating existing entities by removing any invalid ones.  You can retrieve the total number of stored entities, read a specific entity by its ID, or write a new entity to storage.  Furthermore, the class offers methods to remove individual entities or all entities associated with a given name.

The PersistBase class also provides an asynchronous iterator, allowing you to efficiently iterate over all stored entities, sorted numerically by their IDs.  This iterator can be filtered to retrieve only entities that meet specific criteria.  The class ensures data integrity through atomic file writing and provides a robust way to manage your entity data persistently.


## Class PersistAliveUtils

The PersistAliveUtils class provides a core mechanism for managing client availability within the swarm system. It implements the `IPersistAliveControl` interface, offering a utility to track whether each client (`SessionId`) is currently online.  The class utilizes a `PersistAliveFactory` to create and manage individual persistence instances for each client, optimizing resource usage.

Key functions include `markOnline` and `markOffline`, which allow you to update a client’s status as online or offline, respectively, ensuring this information is persistently stored.  The `getOnline` method retrieves the current online status for a client, returning `true` if online and `false` if not yet set.

Furthermore, the `usePersistAliveAdapter` method allows for flexible configuration. You can supply a custom constructor, enabling integration with various persistence backends – such as in-memory storage or database solutions – tailoring the system’s tracking capabilities to your specific needs.

## Class PerfService

Okay, this is a comprehensive breakdown of the `PerformanceTracker` class (or similar) – a core component for monitoring and analyzing application performance. Let's break down the key aspects and implications of this design:

**Core Functionality & Design Principles**

* **Event-Driven Monitoring:** The design strongly suggests an event-driven architecture.  `startExecution` and `endExecution` are central to this, mirroring the behavior of systems like ClientAgent. This allows for granular tracking of individual executions.
* **Aggregation & Summarization:** The `toClientRecord` and `toRecord` methods are crucial for aggregating data from individual client executions into higher-level performance metrics.
* **Stateful Tracking:** The use of maps (e.g., `executionId`, `clientId`) within the class indicates that it maintains state – tracking the progress of each execution.
* **Dependency Injection (Likely):** The design strongly hints at dependency injection. The use of interfaces (like `IClientPerfomanceRecord` and `IPerformanceRecord`) and the ability to pass in dependencies (like `sessionValidationService`) are hallmarks of a well-structured, testable design.

**Detailed Breakdown of Methods**

* **`startExecution(executionId, clientId, inputLen)`:**
    * **Purpose:** Marks the beginning of an execution for a client.
    * **Key Actions:**
        * Initializes the `executionId` map.
        * Increments execution counts.
        * Records the input length.
    * **Significance:** This is the entry point for tracking an execution.  It's the equivalent of `ClientAgent.execute`'s initial setup.
* **`endExecution(executionId, clientId, outputLen)`:**
    * **Purpose:** Marks the end of an execution for a client.
    * **Key Actions:**
        * Calculates the execution duration (time difference between start and end).
        * Updates the `outputLen` map.
        * Clears the `executionId` map.
    * **Significance:**  This is the counterpart to `startExecution`.  It's where the actual performance measurement happens.
* **`toClientRecord(clientId)`:**
    * **Purpose:** Creates a `IClientPerfomanceRecord` for a single client.
    * **Key Actions:** Aggregates all the data collected during the execution (counts, lengths, times) for that client.
    * **Significance:** This is the building block for reporting on individual client performance.
* **`toRecord()`:**
    * **Purpose:** Creates a `IPerformanceRecord` containing aggregated data across *all* clients.
    * **Key Actions:**  Combines the `IClientPerfomanceRecord` objects to provide a system-wide view of performance.
* **`dispose(clientId)`:**
    * **Purpose:** Cleans up all performance data associated with a client.
    * **Key Actions:**  Removes all entries related to a specific client, ensuring that memory is released and data is reset.

**Relationships to Other Components (Based on the Description)**

* **`sessionValidationService`:**  This is a critical dependency. It's used to determine if a session is still active, allowing the `PerformanceTracker` to track only active sessions.
* **`IClientPerfomanceRecord` & `IPerformanceRecord`:** These are interfaces that define the structure of the performance data objects.  They have properties for things like:
    * `executionCount`
    * `averageResponseTime`
    * `totalInputLength`
    * `totalOutputLength`
    * `averageInputLength`
    * `averageOutputLength`
    * `executionTimeAverage`
    * `executionInputAverage`
    * `executionOutputAverage`
    * `memoryUsage`
    * `sessionData`

**Potential Use Cases**

* **ClientAgent Integration:** This design seems specifically tailored to work with ClientAgent, providing a way to monitor the performance of individual client sessions.
* **System-Wide Performance Monitoring:**  The `toRecord` method allows for generating reports on overall system performance.
* **Troubleshooting:**  By tracking individual executions, you can pinpoint the source of performance bottlenecks.

**Questions & Considerations**

* **Concurrency:**  How does this class handle concurrent access?  Are there any locking mechanisms or thread-safe data structures in place?
* **Error Handling:**  What happens if an execution fails or an error occurs?  Are there any mechanisms for logging or reporting errors?
* **Scalability:**  How does this design scale to handle a large number of clients and executions?
* **Memory Management:**  How is memory used efficiently?  Are there any strategies for minimizing memory consumption?

**In summary, this `PerformanceTracker` design is a robust and well-structured approach to monitoring application performance, particularly in the context of ClientAgent.  It's built around event-driven tracking, aggregation, and summarization, making it a valuable component for identifying and resolving performance issues.**

Do you want me to delve deeper into any specific aspect of this design, such as:

*   Concurrency considerations?
*   Error handling?
*   The interfaces (`IClientPerfomanceRecord`, `IPerformanceRecord`) in more detail?

## Class MemorySchemaService

The MemorySchemaService is a core component designed to manage temporary data for individual sessions within the swarm system. It functions as a simple, in-memory key-value store, utilizing a Map to associate each session’s unique identifier – represented as a `clientId` – with any arbitrary object. This service provides a lightweight, non-persistent layer for session-scoped data, distinct from more persistent storage mechanisms.

The service relies on a `loggerService` for logging operations at the INFO level, controlled by the `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` setting, ensuring consistency with logging patterns used by other services like SessionConnectionService and PerfService.  The core of its functionality resides in the `memoryMap`, a Map instance that stores these session-specific objects.

Key operations include `writeValue`, which allows you to write data to the memory map, merging the new value with any existing data for the given `clientId` using `Object.assign`.  Also, `readValue` retrieves data from the `memoryMap` based on the `clientId`, returning an empty object if no data exists for that session. Finally, `dispose` removes the session’s data from the `memoryMap` when a session is terminated or reset.  This service is designed to support ClientAgent’s runtime memory needs and aligns with the data access patterns of SessionPublicService and SessionConnectionService.

## Class LoggerService

The LoggerService provides centralized logging functionality throughout the AI agent swarm system. It implements the `ILogger` interface, enabling the recording of log, debug, and info messages.  The service utilizes MethodContextService and ExecutionContextService to attach relevant metadata – like the `clientId` – to each log message, ensuring traceability across different components, including ClientAgent, PerfService, and DocService.

It routes these messages to both a client-specific logger (determined by GLOBAL_CONFIG.CC_GET_CLIENT_LOGGER_ADAPTER) and a common logger.  The common logger defaults to a `NOOP_LOGGER` but can be dynamically replaced using the `setLogger` method, offering flexibility for testing or advanced logging configurations.

Key features include:

*   **Contextual Logging:**  Attaching `clientId` information for detailed tracking.
*   **Client-Specific Routing:**  Using a client-specific logger adapter for targeted logging.
*   **Runtime Customization:**  The `setLogger` method allows changing the common logger at runtime.
*   **Level Control:** Supports logging at normal, debug, and info levels, controlled by GLOBAL_CONFIG flags.

## Class LoggerInstance

The LoggerInstance is a core component designed to manage logging specifically for a particular client. It provides a flexible way to record events and messages, allowing for customization through callbacks.  The instance is initialized using a `clientId` to identify the client it’s serving, and configured with optional callbacks to tailor its behavior.

Key features include a `waitForInit` method that guarantees the logger is initialized only once, preventing redundant setup.  Logging functionality – including `log`, `debug`, and `info` – is controlled via the `GLOBAL_CONFIG` to manage console output.  Furthermore, a `dispose` method ensures proper cleanup when the logger is no longer needed, triggering a callback if one is defined.  This component offers a robust and configurable logging solution within the swarm orchestration framework.


## Class HistoryPublicService

This `HistoryPublicService` class manages public history operations within the swarm system. It extends `THistoryConnectionService` to provide a public API for interacting with agent history. The service integrates with several key components, including `ClientAgent`, `AgentPublicService`, `PerfService`, and `DocService`.

Specifically, it utilizes a `loggerService` (injected via dependency injection) for logging operations, controlled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`. This logger is consistent with logging patterns used by `AgentPublicService` and `DocService`.

The core functionality is driven by the `historyConnectionService` (also injected), which handles the underlying history operations like pushing, popping, and converting history to arrays.

Key methods include:

*   `push`: This method pushes a message to the agent’s history, taking into account the client ID, method name, and agent name. It wraps the `HistoryConnectionService.push` call with `MethodContextService` for scoping and utilizes the `loggerService` for logging when `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` is enabled. It’s used in scenarios like `AgentPublicService`’s `commitSystemMessage` and `commitUserMessage` operations, and `ClientAgent`’s `EXECUTE_FN` message logging.

*   `pop`: This method retrieves the most recent message from the agent’s history, again using `MethodContextService` and the `loggerService` for logging. It’s utilized in `ClientAgent`’s `EXECUTE_FN` context preparation and `AgentPublicService`’s history manipulation.

*   `toArrayForAgent`: This method converts the agent’s history into an array, incorporating a prompt for agent processing. It leverages `MethodContextService` and the `loggerService` for logging. It’s used in `ClientAgent`’s `EXECUTE_FN` context preparation and `DocService`’s history documentation with prompts.

*   `toArrayForRaw`: This method converts the agent’s history into a raw array of items. It uses `MethodContextService` and the `loggerService` for logging. It supports `ClientAgent`’s raw history access and `PerfService`’s performance metrics.

*   `dispose`: This method cleans up the agent’s history, releasing resources. It wraps `HistoryConnectionService.dispose` with `MethodContextService` and the `loggerService` for logging, aligning with `AgentPublicService` and `PerfService`’s disposal patterns.

## Class HistoryPersistInstance

The `HistoryPersistInstance` class provides a persistent history management system for AI agents. It’s designed to store message interactions, both in memory and on disk, ensuring data isn't lost when the agent restarts.

The class is initialized with a unique `clientId` and a set of optional callbacks to handle events like message additions or changes.  It maintains the message history within the `_array` property and utilizes `_persistStorage` for persistent storage.

A key feature is the `waitForInit` method, which ensures the history is properly initialized only once per agent, preventing redundant setup.  The `iterate` method allows you to asynchronously browse the entire history, applying any configured filters or system prompts.  It also triggers `onRead` callbacks during iteration.

You can add new messages to the history using the `push` method, which persists the message to storage and triggers `onPush` and `onChange` callbacks if they are defined.  Similarly, the `pop` method retrieves and removes the last message, updating persistent storage and triggering `onPop` and `onChange` callbacks.

Finally, the `dispose` method cleans up the history, removing all data if no agent name is provided, and invokes the `onDispose` callback if configured.

## Class HistoryMemoryInstance

The HistoryMemoryInstance is a core component of the AI agent swarm orchestration framework, designed to manage an in-memory record of messages. It operates without persistent storage, focusing on immediate message tracking.

The class is initialized with a unique `clientId` and an optional set of callbacks, allowing for customization of behavior.  It maintains an internal array (`_array`) of `IModelMessage` objects.

A key feature is the `waitForInit` method, which ensures the history is properly initialized for a specific agent, loading any relevant initial data.  The `iterate` method provides an asynchronous iterator for accessing the history, applying configured filters and system prompts during the process and triggering `onRead` callbacks if they are defined.

You can add new messages to the history using the `push` method, which also triggers `onPush` and `onChange` callbacks.  Similarly, the `pop` method retrieves and removes the last message, again with callback support. Finally, the `dispose` method cleans up the history, clearing all data when no agent name is provided.

## Class HistoryConnectionService

The HistoryConnectionService manages history connections for agents within the swarm system. It implements the `IHistory` interface to provide a structured way to handle message storage, manipulation, and conversion, specifically scoped to a client ID and agent name. This service integrates with several other components, including ClientAgent for history within agent execution, AgentConnectionService for history provisioning, HistoryPublicService for a public history API, SessionPublicService, and PerfService for performance tracking via the BusService.

To optimize performance, the service utilizes memoization through functools-kit’s memoize, caching `ClientHistory` instances by a composite key (clientId-agentName). This ensures efficient reuse of history instances across multiple calls. The service leverages a LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) and coordinates with SessionValidationService for usage tracking and event emission via BusService.

The `getHistory` method retrieves or creates a memoized `ClientHistory` instance, utilizing the memoized cache and integrating with SessionValidationService. It supports ClientAgent, AgentConnectionService, and HistoryPublicService. The `push` method adds a message to the agent’s history, delegating to `ClientHistory.push`, logging if logging is enabled, and mirroring HistoryPublicService’s push functionality. The `pop` method retrieves and removes the most recent message from the agent’s history, also delegating to `ClientHistory.pop` and mirroring HistoryPublicService’s pop. The `toArrayForAgent` method converts the agent’s history into an array formatted for agent use, incorporating a prompt, while `toArrayForRaw` converts the history to a raw array. Finally, the `dispose` method cleans up resources, clears the memoized instance, and updates SessionValidationService, aligning with logging patterns used by HistoryPublicService and PerfService.

## Class EmbeddingValidationService

The EmbeddingValidationService is a core component of the swarm system, responsible for ensuring the integrity of embedding names. It maintains a central map of all registered embeddings and their associated schemas, guaranteeing uniqueness and verifying their existence. 

This service works closely with several other key systems: the EmbeddingSchemaService for initial registration, ClientStorage for validating embeddings used in similarity searches, and AgentValidationService for potential agent-specific checks. 

To optimize performance, the service utilizes dependency injection for its logging capabilities, controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO, and memoization to quickly validate embedding names. The `validate` function is particularly important, checking for the existence of an embedding name within the map, and supporting validation processes initiated by ClientStorage. The `addEmbedding` function registers new embeddings, logging the operation and ensuring that each embedding is uniquely identified.

## Class EmbeddingSchemaService

The EmbeddingSchemaService is the central component for managing embedding logic within the swarm system. It acts as a registry, storing and retrieving IEmbeddingSchema instances using a ToolRegistry for efficient management.  This service performs shallow validation of each schema, ensuring that required fields like `embeddingName`, `calculateSimilarity`, and `createEmbedding` are present and valid.

The service leverages a LoggerService for logging operations at the info level, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting, aligning with logging practices in other core services.  It’s tightly integrated with StorageConnectionService and SharedStorageConnectionService, providing the embedding logic needed for storage similarity searches and referenced in agent schemas.

The service’s core functions include registering new schemas via the `register` method, which validates them before adding them to the registry, and retrieving existing schemas using the `get` method.  Ultimately, the EmbeddingSchemaService is crucial for enabling efficient and reliable storage operations based on embedding similarity within the swarm.


## Class DocService

The DocService is a core component designed to comprehensively document the entire swarm system. It generates detailed Markdown files for both swarms and individual agents, alongside UML diagrams created using PlantUML. The service leverages a thread pool for concurrent execution, organized within a defined directory structure.

Key functionalities include generating documentation for swarms, detailing their schemas, agents, policies, and callbacks, and similarly documenting agents with their schemas, prompts, tools, storage, and states.  UML diagrams are generated for both swarms and agents, enhancing visual understanding of the system’s architecture.

The DocService utilizes dependency injection to manage its components, including logging (via the loggerService), performance data retrieval (through PerfService), and schema access (via various schema services like swarmSchemaService and agentSchemaService).  It’s designed to integrate with ClientAgent by documenting its schema and performance data.

The service provides several key methods for generating documentation: `dumpDocs` which generates documentation for all swarms and agents, `writeSwarmDoc` and `writeAgentDoc` which handle the individual documentation generation for swarms and agents respectively, and methods for dumping performance data (`dumpPerfomance` and `dumpClientPerfomance`) to JSON files. These methods are executed within a thread pool to manage concurrency and are controlled by logging settings defined in GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO. The output is organized into a directory structure, facilitating easy access and navigation to the generated documentation.

## Class CompletionValidationService

The CompletionValidationService is a core component of the swarm system, responsible for ensuring the validity of completion names. It maintains a record of all registered completion names and rigorously checks for their uniqueness. 

This service integrates seamlessly with several other key systems: the CompletionSchemaService for initial registration, the AgentValidationService for agent-level validation, and the ClientAgent for completion usage.  

The service utilizes dependency injection to manage its logging, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting, and employs memoization to optimize the performance of validation checks based on completion name. 

Key functionalities include registering new completions via the `addCompletion` method, which logs the operation and enforces uniqueness, and validating existing completions using the `validate` method, which is memoized for efficiency.


## Class CompletionSchemaService

The CompletionSchemaService is the central component for managing all completion schemas within the swarm system. It acts as a registry, storing and retrieving ICompletionSchema instances using a ToolRegistry from functools-kit, ensuring basic schema integrity through shallow validation.

This service integrates closely with several other key components: it works with AgentSchemaService to handle references to completions within agent schemas, supports execution via ClientAgent, facilitates agent instantiation with completions through AgentConnectionService, and aligns with the broader swarm execution strategy managed by SwarmConnectionService.

The service utilizes a LoggerService for logging operations at the info level, controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.  It validates new schemas using the `validateShallow` method, confirming the presence of a required `completionName` and a valid `getCompletion` function – crucial for agent execution.

New schemas are registered into the ToolRegistry, and existing schemas are retrieved by name.  These operations are logged when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled, maintaining consistency with logging patterns used in other services like AgentSchemaService and PerfService.  Ultimately, the CompletionSchemaService provides a robust foundation for defining and accessing completion logic, enabling agents to execute effectively within the swarm.


## Class ClientSwarm

The ClientSwarm class implements the `ISwarm` interface and manages a collection of agents within a swarm. It handles agent switching, output waiting, and navigation stack management, utilizing a BusService for event emission and queued operations.

Key features include:

*   **Agent Management:**  The class manages agent references through `params.agentMap` and dynamically updates them via `setAgentRef`.
*   **Output Waiting:** The `waitForOutput` method waits for output from the active agent, handling cancellation and agent changes, integrating with ClientSession’s output retrieval.
*   **Navigation Stack:**  The `_navigationStack` tracks agent names for navigation, managed through `navigationPop` and `setAgentName`.
*   **Cancellation:** The `cancelOutput` method interrupts output waits via the `_cancelOutputSubject`, ensuring responsive cancellation.
*   **Event-Driven Updates:**  The class uses a Subject (`_agentChangedSubject`) to notify subscribers of agent changes and emits events via the BusService for various operations.

The class provides methods for:

*   `navigationPop()`: Pops the most recent agent from the navigation stack.
*   `cancelOutput()`: Cancels the current output wait.
*   `getAgentName()`: Retrieves the name of the active agent.
*   `getAgent()`: Retrieves the active agent instance.
*   `setAgentRef()`: Updates the reference to an agent in the swarm’s agent map.
*   `setAgentName()`: Sets the active agent by name, updating the navigation stack and persisting the change.

## Class ClientStorage

The ClientStorage class is a core component within the swarm system, responsible for managing data storage operations. It leverages embedding-based search to provide efficient data retrieval. This class implements `IStorage<T>`, offering functionalities like upsering, removing, clearing, and similarity-based searching.

Key aspects of the ClientStorage include its integration with several services: StorageConnectionService for instantiation, EmbeddingSchemaService for generating embeddings, ClientAgent for data persistence, SwarmConnectionService for swarm-level storage, and BusService for event emission.

The class utilizes an internal `_itemMap` (a Map) to store items quickly by their unique identifiers, facilitating fast retrieval and updates. The `dispatch` method handles the queuing and execution of storage actions (upserting, removing, or clearing), ensuring thread-safe updates from ClientAgent or other tools.

A crucial feature is the `_createEmbedding` method, which memoizes the creation of embeddings for each item using a cached result. This memoization, facilitated by `CREATE_EMBEDDING_FN`, avoids redundant embedding calculations, improving performance. The caching is cleared when items are upsered or removed, guaranteeing that embeddings reflect the most current data.

The `waitForInit` method waits for the storage to initialize, loading initial data and generating embeddings. This initialization process is managed using `WAIT_FOR_INIT_FN` and is executed only once via a `singleshot` mechanism, ensuring proper lifecycle management with the StorageConnectionService.

When a search query is received, the `take` method retrieves a specified number of items based on their similarity to the search string, utilizing embeddings and a `SortedArray` for efficient ranking. The method concurrently executes similarity calculations using an execution pool, respecting GLOBAL_CONFIG.CC_STORAGE_SEARCH_POOL.  It emits an event via BusService, supporting ClientAgent’s search-driven tool execution.

The `upsert`, `remove`, and `clear` methods handle the addition, deletion, and reset of items, respectively, all queued and executed sequentially via the dispatch queue. These methods support the data management needs of the ClientAgent.

The `get` method provides a direct lookup of an item from the `_itemMap`, emitting an event via BusService with the result to support quick access by ClientAgent or other tools.

Finally, the `list` method retrieves all items from the `_itemMap`, optionally filtered by a provided predicate, emitting an event via BusService with the filtered result to support ClientAgent’s data enumeration. The `dispose` method cleans up the storage instance, including logging via BusService and ensuring proper shutdown with the StorageConnectionService.


## Class ClientState

The ClientState class is a core component of the swarm system, responsible for managing the individual state of a client within the swarm. It implements the `IState<State>` interface, providing a centralized location for storing and updating state data.

This class handles a single state object, along with a queue of read and write operations, allowing for middleware processing and event-driven updates through the BusService. It integrates seamlessly with the StateConnectionService for state instantiation, the ClientAgent to drive state-dependent behavior, and the SwarmConnectionService for managing swarm-level state information.

The `ClientState` utilizes a `waitForInit` function to ensure the state is properly initialized, leveraging the StateConnectionService’s lifecycle management.  It provides a `dispatch` function for queuing state modifications, guaranteeing thread-safe operations and supporting concurrent access.

Key methods include `setState`, which updates the state based on a provided dispatch function, and `clearState`, which resets the state to its default value. Both methods trigger callbacks and emit events via the BusService, facilitating communication with the ClientAgent and other swarm components.  Finally, the `dispose` method handles cleanup and resource release when the state is no longer required.


## Class ClientSession

The `ClientSession` class is the core component for managing interactions within the AI agent swarm system. It implements the `ISession` interface, providing a central point for executing messages, handling agent interactions, and communicating with other system services.

Here’s how it works:

*   **Message Management:** The `ClientSession` is responsible for receiving messages, validating them against defined policies (using `ClientPolicy`), and then executing them through the swarm’s agent (via `ClientAgent`).
*   **Event-Driven Communication:** It utilizes a `Subject` (`_emitSubject`) to emit validated messages to subscribers in real-time, enabling dynamic updates to external connectors.
*   **Swarm Integration:** The session tightly integrates with several key services:
    *   `SessionConnectionService`: Handles session instantiation and lifecycle management.
    *   `SwarmConnectionService`: Provides access to the swarm and its agents, facilitating communication and coordination.
    *   `ClientAgent`: Executes messages and manages the agent’s history.
    *   `ClientPolicy`: Enforces validation rules for messages.
    *   `BusService`:  Handles event emission and logging.
*   **Methods:**
    *   `emit(message: string)`: Sends a validated message to subscribers.
    *   `execute(message: string, mode: ExecutionMode)`: Executes a message using the agent, validating it and returning the output.
    *   `run(message: string)`: Executes a stateless message, logging the execution but skipping validation.
    *   `commitToolOutput(toolId: string, content: string)`: Commits tool output to the agent’s history.
    *   `commitUserMessage(message: string)`: Commits a user message to the agent’s history.
    *   `commitFlush()`: Clears the agent’s history.
    *   `commitStopTools()`: Signals the agent to stop tool execution.
    *   `commitSystemMessage(message: string)`: Commits a system message to the agent’s history.
    *   `commitAssistantMessage(message: string)`: Commits an assistant message to the agent’s history.
    *   `connect(connector: SendMessageFn$1)`: Connects the session to a message connector, enabling real-time communication.
    *   `dispose()`:  Releases resources and handles cleanup.

In essence, the `ClientSession` acts as the intelligent interface for interacting with the AI agent swarm, orchestrating message flow and ensuring adherence to system policies.

## Class ClientPolicy

The ClientPolicy class implements the IPolicy interface, acting as a central component for managing security and restrictions within the AI agent swarm system. It handles client bans, meticulously validating both incoming and outgoing messages to ensure compliance with swarm-level policies. 

This policy operates with a lazy-loaded ban list, populated only when needed through the `hasBan` method, and utilizes the BusService to emit events related to ban and unban actions.  It integrates closely with the PolicyConnectionService for instantiation, the SwarmConnectionService to enforce swarm-level restrictions, and the ClientAgent for message validation and feedback.

Key functionalities include checking client bans using `hasBan`, retrieving ban messages via `getBanMessage`, and validating input and output messages with `validateInput` and `validateOutput`.  The `banClient` and `unbanClient` methods manage the ban list, automatically banning clients upon validation failure if configured, and persisting changes through the `setBannedClients` parameter.  This robust system safeguards the swarm by dynamically controlling client access and ensuring adherence to defined policies.


## Class ClientHistory

The ClientHistory class provides a robust mechanism for managing the conversation history of an agent within the swarm system. It implements the `IHistory` interface, offering storage, retrieval, and filtering of client messages.  This class integrates seamlessly with other system components, including the HistoryConnectionService for instantiation, the ClientAgent for logging and completion context, the BusService for event emission, and the SessionConnectionService for tracking session history.

Specifically, the ClientHistory uses a filter condition, defined in GLOBAL_CONFIG.CC_AGENT_HISTORY_FILTER, to tailor the message arrays to the agent's specific needs, excluding irrelevant entries.  It supports pushing new messages into the history and popping the most recent message for inspection or undoing actions.

The `toArrayForAgent` method is particularly important, as it transforms the history into a filtered and formatted array specifically designed for the ClientAgent’s completion requests. This method incorporates the agent’s prompt and system message, ensuring consistency with tool calls and supporting the CompletionSchemaService’s context requirements.  Finally, the `dispose` method ensures proper resource management when the agent is no longer needed, releasing resources and cleaning up the underlying storage.


## Class ClientAgent

The ClientAgent is a core component of the AI agent swarm system, designed to handle individual agent interactions. It manages the execution of messages, including tool calls, ensuring that operations are performed in a queued manner to prevent conflicts. This agent integrates with several services, such as the AgentConnectionService, HistoryConnectionService, and ToolSchemaService, to coordinate its actions within the swarm.

Key features of the ClientAgent include:

*   **Queued Execution:**  It uses functools-kit’s queued decorator to manage message execution, preventing overlapping operations and ensuring reliable processing.
*   **Error Recovery:** The agent incorporates mechanisms for model resurrection and output validation, attempting to recover from errors using strategies defined in the CompletionSchemaService.
*   **Event Emission:** It utilizes a BusService to emit events related to agent changes, tool executions, and output completions, facilitating communication within the swarm.
*   **Dynamic Agent Switching:** The agent supports dynamic agent switching within the swarm, allowing for flexible and adaptable agent behavior.

The ClientAgent provides methods for:

*   **Executing Messages:** The `execute` method processes incoming messages and tool calls, while the `run` method handles stateless completions.
*   **Emitting Outputs:** The `_emitOutput` method transforms and emits outputs, potentially triggering model resurrection and broadcasting within the swarm.
*   **Managing History:** It provides methods for committing user, system, and assistant messages to the history, ensuring a comprehensive record of interactions.
*   **Stopping Tools:** The `commitStopTools` method allows for interrupting tool call chains.
*   **Disposing Resources:** The `dispose` method performs cleanup and handles agent disposal.

Essentially, the ClientAgent acts as a robust and adaptable unit within the swarm, responsible for handling individual agent requests and maintaining a consistent state across the system.

## Class BusService

The BusService is the core component responsible for managing event communication within the swarm system. It implements the IBus interface, facilitating the subscription and emission of events between various system components. The service utilizes memoized Subject instances for optimized performance, reducing the overhead of creating and destroying Subjects for each event.

Key functionalities include subscribing to events from ClientAgents (e.g., monitoring execution events), emitting events to registered subscribers, and managing session validation to ensure events are only delivered to active clients. Wildcard subscriptions (using clientId="*") provide broad event distribution, while execution-specific event aliases support targeted event handling.

The BusService integrates closely with the ClientAgent, PerfService, and DocService, leveraging the LoggerService for informational logging and the SessionValidationService to maintain session integrity.  It achieves this through methods like `subscribe`, `once`, and `emit`, each designed to handle specific event scenarios.  The `commitExecutionBegin` and `commitExecutionEnd` methods offer streamlined event emission for execution-related events, aligning with the ClientAgent’s execution lifecycle. Finally, the `dispose` method ensures proper resource cleanup by unsubscribing from all events for a given client, mirroring the session management practices of ClientAgent and PerfService.

## Class AliveService

The `AliveService` is responsible for tracking the online status of individual clients participating in a swarm. It offers methods to easily mark clients as either online or offline, directly within the swarm context.  

The service utilizes a `PersistAliveAdapter` to store this status persistently, based on global configuration settings.  

Key functionalities include:

*   `markOnline`:  This method allows you to designate a client as online, logging the action and saving the status to persistent storage.
*   `markOffline`: Similarly, this method marks a client as offline, logging the action and persisting the change.

The `AliveService` relies on a `loggerService` for recording these actions.

## Class AgentValidationService

The AgentValidationService is a core component within the swarm system, responsible for ensuring the integrity and compatibility of agents. It manages agent schemas, tracks dependencies between agents, and validates associated resources like storage and states.

The service utilizes dependency injection to manage its internal components, including the logger service, tool validation service, completion validation service, storage validation service, and AgentSchemaService.  It employs memoization techniques to optimize validation checks, improving performance by caching results based on agent names.

Key functionalities include registering new agents with their schemas, validating existing agents against their defined schemas, and querying for associated resources.  The service maintains internal maps – `_agentMap` to store agent schemas and `_agentDepsMap` to track inter-agent dependencies.

The service provides methods for retrieving lists of registered agents, their associated storage names, and state names.  It also offers a `validate` method that performs comprehensive validation, checking agent existence, completion configurations, tool availability, and storage configurations, delegating specific validation tasks to other services.  Logging is handled through the logger service, with operations logged at the INFO level when enabled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting.


## Class AgentSchemaService

The AgentSchemaService is the core service responsible for managing all agent schemas within the swarm system. It acts as a central registry, utilizing ToolRegistry from functools-kit to store and retrieve IAgentSchema instances.  The service performs shallow validation on each schema to ensure basic integrity – specifically checking that required fields like agentName, completion, and prompt are present, and that arrays for system, dependencies, states, storages, and tools contain unique string values.

It integrates closely with other key services, including AgentConnectionService for agent instantiation, SwarmConnectionService for agent configuration, ClientAgent for schema-driven execution, and AgentMetaService for broader agent management.  The service leverages a LoggerService for logging operations at the info level, controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.

The service’s primary functions are registration and retrieval. The `register` method adds a new schema to the registry after validation, while the `get` method retrieves an existing schema based on its name.  Both operations are logged via the LoggerService when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled, maintaining consistency with other logging patterns within the swarm.  Ultimately, this service provides a robust foundation for defining and managing agent behavior and resources.


## Class AgentPublicService

The `AgentPublicService` class provides a public API for interacting with agents within the swarm system. It implements `TAgentConnectionService` to manage agent operations, offering a centralized interface for common tasks like agent creation, execution, and message handling. This service integrates with several core components, including `ClientAgent`, `PerfService`, `DocService`, and `BusService`, leveraging their functionalities for efficient and traceable agent interactions.

Key functionalities include:

*   **Agent Creation (`createAgentRef`):**  Creates agent references using `AgentConnectionService` with context scoping and logging.
*   **Execution (`execute`, `run`, `waitForOutput`):**  Executes commands and stateless completions on agents, mirroring `ClientAgent`’s execution models and triggering relevant events and tracking via `PerfService`.
*   **Message Handling (`commitToolOutput`, `commitSystemMessage`, `commitAssistantMessage`, `commitUserMessage`):**  Manages agent history by committing tool outputs, system messages, assistant messages, and user messages, supporting `ClientAgent`’s tool execution and documented through `DocService`.
*   **System Operations (`commitFlush`, `commitAgentChange`, `commitStopTools`):**  Provides system-level operations like flushing agent history, committing agent changes, and stopping tools, ensuring proper resource management and session control.
*   **Resource Cleanup (`dispose`):**  Disposes of agents, cleaning up resources and aligning with `PerfService` and `BusService`’s disposal mechanisms.

The `AgentPublicService` class utilizes logging through the `logger` property and provides a robust and well-documented interface for managing agent interactions within the swarm.

## Class AgentMetaService

The AgentMetaService is a core component of the swarm system, responsible for managing and visualizing agent metadata. It operates by building detailed or common agent nodes from agent schemas, utilizing the AgentSchemaService to retrieve this data.  The service then converts these nodes into UML format, which is crucial for documentation and debugging.

It achieves this through several key methods:

*   **`makeAgentNode`**: This method constructs a comprehensive meta node for an agent, incorporating details like dependencies, states, storage, and tools. It uses a `seen` set to prevent infinite loops when building the tree structure and logs information via the LoggerService when enabled. This method is used to generate full agent visualizations for DocService.
*   **`makeAgentNodeCommon`**: This method creates a simplified meta node focusing primarily on dependency relationships. Like `makeAgentNode`, it employs a `seen` set for cycle prevention and utilizes the LoggerService for logging. It’s used in conjunction with `makeAgentNode` and supports ClientAgent and PerfService contexts.
*   **`toUML`**: This method transforms the generated meta nodes into a UML string.  It leverages `makeAgentNode` to build the tree and then serializes it to produce the UML representation.  The `toUML` method is directly called by DocService to generate UML diagrams, such as `agent_schema_[agentName].svg`, providing visual documentation of the agents.

The service integrates with other system components through dependency injection, utilizing the LoggerService for consistent logging and leveraging data from ClientAgent and PerfService to provide a complete picture of agent behavior and system state.

## Class AgentConnectionService

Okay, this is a fantastic and incredibly detailed breakdown of the `ClientAgent` class. You've done a phenomenal job of outlining its functionality, its interactions with other components, and the rationale behind its design choices.  Let's break down what makes this documentation so effective and consider some potential areas for even further refinement.

**Strengths of this Documentation:**

* **Comprehensive Functionality Coverage:** You've covered *every* method exposed by the `ClientAgent` class. This is crucial for understanding how to use the class effectively.
* **Clear Delegation Explanation:** The repeated use of "Delaetes to ClientAgent..." is brilliant. It immediately communicates the core design pattern: the `ClientAgent` is a wrapper that delegates to a lower-level implementation. This is key to understanding the class's architecture.
* **Detailed Rationale:**  The explanations for *why* each delegation occurs (e.g., "aligns with SessionPublicService’s commitToolOutput") are invaluable. They provide context and demonstrate the design decisions behind the class.
* **Emphasis on Design Patterns:**  You've correctly identified the use of delegation as a core design pattern.
* **Resource Management:** The `dispose` method's explanation, including the cache clearing and `SessionValidationService` update, is critical for understanding how the class handles resource cleanup.
* **Logging Context:**  The inclusion of logging conditions based on `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` is a good practice for debugging and monitoring.

**Potential Refinements & Considerations:**

1. **Clarify the `ClientAgent`'s Role:** While you've described *what* it does, it would be helpful to explicitly state *why* this class exists. What problem does it solve? Is it a simplified interface for interacting with a more complex underlying agent implementation?  Adding a brief introductory sentence or two about its purpose would be beneficial.

2. **Caching Details:**  Expand slightly on the caching mechanism.  You mention "memoization cache."  What data is stored in this cache?  Is it just the `ClientAgent` instance itself, or are there other relevant state variables cached?  Knowing the scope of the cache is important.

3. **`SessionValidationService` Interaction:**  You mention updating the `SessionValidationService`.  What does this service do?  Is it responsible for tracking the agent's state, validating inputs, or something else?  A brief description of its role would improve understanding.

4. **Error Handling:**  The documentation doesn't address error handling.  What types of errors might the `ClientAgent` throw?  How are these errors handled (e.g., are they propagated up the call stack, or are they handled internally)?

5. **Asynchronous Operations:**  All the methods are asynchronous (indicated by the `Promise` return types).  It would be helpful to briefly explain the asynchronous nature of these operations and how they relate to the underlying agent implementation.

6. **Tool Execution Flow:**  Consider adding a high-level diagram or flowchart illustrating the typical flow of execution for a tool call (e.g., user input -> `execute` -> tool execution -> output -> `commitToolOutput`).

7. **`commitAgentChange` and `commitStopTools`:** These methods are particularly interesting.  Expanding on their purpose – how do they control the agent's execution flow? – would be valuable.

**Example of a Slightly Enhanced Introductory Sentence:**

"The `ClientAgent` class provides a simplified, asynchronous interface for interacting with the underlying agent implementation. It handles the complexities of communication, state management, and output handling, allowing developers to focus on their application logic."

**Overall:**

This is an exceptionally well-written and detailed documentation. Your thoroughness and understanding of the class's design are evident.  The suggested refinements are minor and aimed at providing even greater clarity and context.  Excellent work!  Do you want me to elaborate on any of these points, or perhaps create a more detailed diagram illustrating the execution flow?

## Class AdapterUtils

The AdapterUtils class offers a flexible way to connect to different AI completion services. It provides utility functions, each designed to interact with a specific provider.

Specifically, it includes:

*   **fromOpenAI:** This function creates a callable that allows you to use OpenAI’s chat completions API. You can specify the model to use and the desired response format.
*   **fromLMStudio:**  Similar to fromOpenAI, this function generates a callable for interacting with LMStudio’s chat completions API, letting you define the model and response format.
*   **fromOllama:** This function creates a callable for utilizing Ollama’s chat completions API, again with options for model selection and the tool call protocol.

These adapter functions provide a consistent interface for working with different AI completion services, simplifying the process of integrating them into your application.

# agent-swarm-kit interfaces

## Interface IToolCall

The IToolCall interface represents a specific request made by an AI agent within the swarm system. It’s designed to connect the model’s instructions to actual actions.  Essentially, it captures a single invocation of a tool, allowing agents like the ClientAgent to translate what the model wants into something the system can do.

Each IToolCall has a unique identifier, “id,” which is generated to track this specific request. This ID is used to link the tool’s output back to its original request, for example, in the IModelMessage.

The “type” property is always “function,” reflecting the swarm’s architecture where tools are implemented as functions.

Finally, the “function” property contains the details of the function being called, including its name and any required arguments. This information is derived from the model’s output and used to trigger the appropriate function execution.

## Interface ITool

The ITool interface is a core component of the swarm system, acting as a blueprint for each available tool. It defines everything the agents need to know about a specific function – what it’s called, what it does, and what inputs it expects. 

Essentially, an ITool specifies the details of a callable tool, including its name, a description of its purpose, and a precise schema for its parameters. This schema dictates the data types and requirements for any input the tool needs.

The ITool information is integrated into the IAgentParams, specifically within the `tools` property, and is then passed to the `ICompletion.getCompletion` method. This allows the model to generate the correct `IToolCall` requests based on the defined tool specifications. The `function` property within the ITool is particularly important, as it’s matched against the `IToolCall.function` during execution, ensuring the correct tool is invoked.

## Interface ISwarmSessionCallbacks

The `ISwarmSessionCallbacks` interface defines a set of callbacks that allow you to respond to various events happening within a swarm session. These callbacks provide hooks for handling key moments like when a client connects, when a command is executed, or when a message is emitted.

Specifically, you can use the `onConnect` callback to perform actions when a new client joins the swarm, such as logging the connection or running initial setup. The `onExecute` callback is triggered each time a command is run, and the `onRun` callback is used for stateless completion runs.  The `onEmit` callback lets you react to messages sent from the swarm, and finally, the `onInit` and `onDispose` callbacks handle the session’s initialization and disconnection events, respectively.  These callbacks give you fine-grained control over how your application interacts with the swarm session.

## Interface ISwarmSchema

The ISwarmSchema interface defines the structure for creating and managing an AI agent swarm. It allows you to configure the swarm’s behavior, including how agents navigate and how they are managed.

Key features include:

*   **Configuration:** You can set options like enabling persistent storage of navigation stacks and defining access control policies using a list of policy names.
*   **Navigation Control:**  The schema provides functions to retrieve and persist the swarm’s initial navigation stack, giving you control over the agents’ routes.
*   **Agent Management:** You can specify a default agent to use if none is explicitly assigned, and update the active agent as navigation changes occur.
*   **Customization:**  The `callbacks` property lets you attach lifecycle events to the swarm, providing flexibility for reacting to changes in the swarm’s state.

The interface also includes the swarm’s unique name and a list of available agent names within the swarm.

## Interface ISwarmParams

The `ISwarmParams` interface defines the configuration needed to create a new AI agent swarm. It builds upon the core swarm schema, adding flexibility for runtime adjustments.  This interface specifies essential details like a unique client identifier (`clientId`) to track the swarm’s origin.  It also includes a logger (`logger`) for detailed logging of swarm operations and any encountered issues.  Crucially, it provides a mechanism for accessing and managing individual agents through an agent map (`agentMap`), which is a record associating agent names with their respective agent instances. This map allows for dynamic interaction with the agents within the swarm.


## Interface ISwarmConnectionService

The `ISwarmConnectionService` interface acts as a specific type definition, building upon the broader `SwarmConnectionService`. Its primary purpose is to clearly delineate the public-facing aspects of a swarm connection service. By excluding any internal keys, it guarantees that the `SwarmPublicService` aligns precisely with the operations accessible to external users or systems, promoting a clean and well-defined public API.

## Interface ISwarmCallbacks

The ISwarmCallbacks interface provides a set of functions to manage and monitor the lifecycle of an AI agent swarm. It builds upon standard session callbacks and adds specific functionality related to individual agents.

The `onAgentChanged` callback is a key component. It’s triggered whenever the currently active agent within the swarm shifts. This allows you to track agent movement, update your application’s state based on the new active agent, or perform other actions related to navigation events.  This callback receives the agent’s unique ID, its name, and the name of the swarm it belongs to.


## Interface ISwarm

The ISwarm interface provides a central control point for managing a group of AI agents. It offers a suite of methods to handle the agents’ movement and activity. Primarily, the `navigationPop` method allows you to remove and retrieve the most recent agent from the swarm’s navigation stack, or to default to a pre-defined agent if needed.  You can also cancel any ongoing output operations using `cancelOutput`, which guarantees an empty string is returned when calling `waitForOutput`.  `waitForOutput` then waits for and returns the output generated by the currently active agent.  Furthermore, the interface provides ways to identify the active agent through `getAgentName` and retrieve the agent instance itself with `getAgent`. Finally, `setAgentRef` is used to register or update agent references within the swarm, and `setAgentName` allows you to designate a specific agent as the active one, triggering any necessary navigation adjustments.

## Interface IStorageSchema

The `IStorageSchema` interface defines how a storage component within the AI agent swarm operates. It controls aspects like whether data is saved persistently, how the storage is accessed, and how it’s indexed for efficient searching.

Key features include an optional `persist` flag to manage data persistence, a `storageName` to uniquely identify the storage instance, and a `callbacks` object for handling storage-related events.  You can customize data retrieval and setting using the `getData` and `setData` functions, respectively, overriding the default behavior.

The `embedding` property specifies the indexing mechanism used, and the `getDefaultData` function provides default data to be used during persistence. Finally, the `createIndex` method generates a unique index for each stored item, crucial for search functionality.

## Interface IStorageParams

The `IStorageParams` interface defines the runtime settings for managing storage within the AI agent swarm. It builds upon the core storage schema, adding details specific to each client and their associated embeddings.

Key features include:

*   **`clientId`**: A unique identifier for the client using this storage instance.
*   **`calculateSimilarity`**: A function that computes the similarity between embeddings, crucial for search functionality.
*   **`createEmbedding`**:  A function used to generate embeddings for storage items, enabling indexing.
*   **`storageName`**:  The name of the storage instance, provided for clarity within the swarm.
*   **`logger`**:  An instance of the logger, used to record storage-related events and errors.
*   **`bus`**:  The bus object facilitating communication between swarm components.

## Interface IStorageData

The `IStorageData` interface outlines the basic structure of data stored within the orchestration framework. It establishes the essential properties needed for any storage item.

Specifically, each storage item must have a unique identifier, represented by the `id` property, which is of type `StorageId`. This `id` is crucial for locating and managing individual storage items within the system.

## Interface IStorageConnectionService

The `IStorageConnectionService` interface acts as a specific type definition, building upon the broader `StorageConnectionService`. Its primary purpose is to precisely define `TStorageConnectionService` while intentionally omitting any internal implementation details. This ensures that the `StoragePublicService` remains focused solely on the public-facing operations, providing a clean and well-defined contract for external interactions.

## Interface IStorageCallbacks

The `IStorageCallbacks` interface defines a set of callbacks that allow you to react to various events related to the storage system. It provides hooks for managing updates to the stored data – triggered whenever items are added, removed, or modified. You can also use these callbacks to monitor search operations as they occur.

Specifically, the `onUpdate` callback is invoked each time the storage data changes, offering a chance to log these updates or synchronize your application’s state with the storage. The `onSearch` callback is triggered during any search performed on the storage. Finally, the `onInit` callback is called when the storage is initially set up, and the `onDispose` callback is executed when the storage is being shut down, providing opportunities for cleanup or logging.

## Interface IStorage

The IStorage interface provides a core API for managing data within the AI agent swarm orchestration framework. It offers a set of methods to interact with the underlying storage, allowing you to retrieve, modify, and delete items.

Specifically, the `take` method enables similarity-based retrieval of items from the storage, using embeddings to find relevant results based on a search query and a specified total count. The `upsert` method handles both inserting new items and updating existing ones, ensuring the index is kept current.  You can also use `remove` to delete items by their unique ID, and `get` to retrieve a single item by its ID.

Furthermore, the `list` method provides a way to list all items in the storage, with the option to filter the results based on a given predicate. Finally, the `clear` method allows you to completely reset the storage to an empty state, persisting any changes that have been made.

## Interface IStateSchema

The `IStateSchema` interface is central to managing the state of individual agents within the swarm. It defines how each state is configured and how it behaves.

Key aspects of the `IStateSchema` include:

*   **`persist`**:  This boolean flag controls whether the state’s values are saved to persistent storage, like a hard drive, ensuring data isn’t lost when an agent restarts.
*   **`docDescription`**:  A descriptive string that provides context and documentation for the state, aiding in understanding its purpose and usage.
*   **`shared`**:  When set to `true`, this flag indicates that the state can be accessed and modified by multiple agents within the swarm.
*   **`stateName`**:  A unique identifier for the state, ensuring it can be distinguished from other states within the swarm.
*   **`getDefaultState`**:  A function that either retrieves a pre-defined default state value or computes one dynamically, based on the agent’s ID and the state name.
*   **`getState`**:  This function provides a way to retrieve the current state value. It can optionally use a provided default state if the current state isn’t available.
*   **`setState`**:  Allows you to set or update the state value, overriding the default behavior if a custom setting is provided.
*   **`middlewares`**:  An optional array of middleware functions that can be applied to the state during its lifecycle, offering a way to modify or process the state before it’s used.
*   **`callbacks`**:  A partial set of lifecycle callbacks that can be used to trigger actions or events at specific points in the state’s lifecycle, providing flexibility for custom behavior.

## Interface IStateParams

The `IStateParams` interface defines the runtime settings needed for managing state within the AI agent swarm. It builds upon a core state schema, adding details specific to each individual client.

Key properties include:

*   **clientId:** A unique string identifying the client to which this state instance belongs.
*   **logger:** An `ILogger` instance used to track state operations and any errors that occur.
*   **bus:** An `IBus` object, facilitating communication between agents via events within the swarm.

## Interface IStateMiddleware

The `IStateMiddleware` interface provides a standardized way to manage and control changes to your application’s state. It acts as a central point for any middleware logic that needs to interact with the state. 

Specifically, this interface enables you to:

*   Modify the state itself.
*   Validate changes to the state before they are applied.
*   Potentially perform side effects related to state updates.

This design promotes a clean and organized approach to state management within the AI agent swarm orchestration framework.


## Interface IStateConnectionService

The `IStateConnectionService` interface serves as a type definition, specifically designed to refine the `StateConnectionService` interface. Its primary purpose is to create a more focused version, `StatePublicService`, by intentionally omitting any internal keys. This ensures that the public-facing service only exposes the necessary operations, promoting a cleaner and more manageable API.

## Interface IStateCallbacks

The `IStateCallbacks` interface defines a set of functions to handle key events during the lifecycle of an AI agent’s state. It provides hooks that allow you to react to important moments, such as when a state is initially set up (`onInit`), when it’s being cleaned up (`onDispose`), or when it’s loaded or updated.

Specifically, you can use these callbacks to:

*   Log information about the state’s initialization or disposal.
*   Monitor state loading or changes.
*   Trigger actions based on state updates – for example, updating other parts of the system or performing side effects.

The `onInit` callback is called immediately after the state is set up. The `onDispose` callback is invoked when the state is being cleaned up. The `onLoad` callback is triggered when the state is loaded, and the `onRead` and `onWrite` callbacks are invoked during state read and write operations, respectively.

## Interface IState

The IState interface is the core of the framework’s runtime state management. It offers a straightforward way to access, modify, and reset the application’s state.

You can use the `getState` method to retrieve the current state value. This method intelligently applies any configured middleware and custom logic defined within the schema.

The `setState` method allows you to update the state by providing a function. This function takes the previous state as input and returns the new state, ensuring a consistent and predictable state transition. Like `getState`, it also incorporates middleware and custom logic.

Finally, the `clearState` method provides a way to completely reset the state back to its initial, default value, as defined in the schema’s `getDefaultState` property.

## Interface ISharedStorageConnectionService

This interface, ISharedStorageConnectionService, acts as a blueprint for defining a connection to shared storage. It’s specifically designed to represent the public-facing aspects of a shared storage connection. By excluding internal details, it ensures that the SharedStoragePublicService interface accurately reflects the operations available to external users and applications – focusing solely on the public-facing functionality.

## Interface ISharedStateConnectionService

This interface, ISharedStateConnectionService, acts as a specific type definition. It builds upon the broader SharedStateConnectionService, but crucially, it excludes any internal keys. This design ensures that the resulting type, TSharedStateConnectionService, focuses solely on the public-facing operations and data accessible to external services, maintaining a clear separation between internal implementation details and the public API.

## Interface ISessionSchema

The `ISessionSchema` interface defines the structure for managing data associated with individual sessions.  Right now, it’s intentionally empty – this is a placeholder designed to accommodate future session-specific configurations.  As the framework evolves, this interface will hold details like agent roles, task priorities, and any other data needed to tailor each session’s behavior. It’s a foundational element for extending the swarm orchestration capabilities.

## Interface ISessionParams

The `ISessionParams` interface defines the foundational settings needed to establish a session within the AI agent swarm orchestration framework. It bundles together essential elements like the session’s structure, the specific actions to take during its execution, and any external resources the session relies on.

Key properties include:

*   **clientId:** A unique identifier assigned to the client driving the session.
*   **logger:**  An instance of the logger, used to track session activity and capture any errors that might occur.
*   **policy:**  A policy object that dictates the rules and limitations governing the session’s behavior.
*   **bus:**  The communication channel (bus) facilitating event exchange within the swarm.
*   **swarm:**  The swarm instance responsible for managing the session’s overall operation.
*   **swarmName:**  A distinct name identifying the swarm to which this session belongs.

## Interface ISessionContext

The `ISessionContext` interface is a core component of the AI agent swarm orchestration framework. It acts as a container, holding all the necessary information for managing a specific session within the swarm.  This context includes details about the client involved, the currently executing method, and the broader execution environment.

Specifically, the `ISessionContext` provides the following key pieces of data:

*   **clientId:** A unique identifier for the client session.
*   **processId:**  An identifier for the process associated with the session.
*   **methodContext:**  Details about the method currently being executed, if one is active.
*   **executionContext:**  Information related to the overall execution environment within the swarm.

## Interface ISessionConnectionService

The `ISessionConnectionService` interface acts as a type definition, specifically designed to ensure consistency when working with the `TSessionConnectionService`. It’s used to precisely define the `TSessionConnectionService` type while intentionally excluding any internal implementation details. This approach guarantees that the public-facing operations, represented by `SessionPublicService`, remain focused solely on the externally visible aspects of the service.

## Interface ISessionConfig

The `ISessionConfig` interface defines the settings for managing individual sessions within an AI agent swarm. It’s designed to control how often or when a session should run, offering flexibility for scheduling tasks.

A key property is `delay`, which specifies the duration, in milliseconds, that a session should pause before executing again. This allows you to implement rate limiting or create staggered execution patterns for your swarm’s activities.


## Interface ISession

The `ISession` interface represents a core component within the AI agent swarm orchestration framework. It provides a central point for managing communication and execution within a swarm’s individual agents.

Key functionalities include the ability to send messages to the session, effectively clearing the agent history with a `commitFlush` operation, and preventing tool execution with `commitStopTools`.  

The `ISession` also offers methods for running stateless completions using `run`, executing commands with potential history updates via `execute`, and managing the session’s state through `commitToolOutput`, `commitAssistantMessage`, and `commitSystemMessage`.  

Finally, it establishes a bidirectional communication channel with `connect`, returning a receiver function to handle incoming messages.

## Interface IPolicySchema

The `IPolicySchema` interface defines the structure for configuring policies within the AI agent swarm. It’s the core mechanism for enforcing rules and managing bans across the swarm.

Key aspects of the schema include:

*   **`docDescription`**: An optional field for providing documentation and context about the policy’s purpose.
*   **`policyName`**: A unique identifier for the policy, ensuring it can be referenced consistently.
*   **`banMessage`**:  A default message displayed when a client is banned, which can be customized.
*   **`autoBan`**:  A flag that automatically bans a client upon failing validation checks.
*   **`getBanMessage`**:  A function allowing you to dynamically generate a ban message based on the client, policy, and swarm.
*   **`getBannedClients`**:  A function to retrieve a list of currently banned clients associated with the policy.
*   **`setBannedClients`**:  A function to manage the list of banned clients, providing an alternative to the default ban management.
*   **`validateInput`**:  An optional function to perform custom validation on incoming messages, ensuring they adhere to specific policy rules.
*   **`validateOutput`**:  An optional function to validate outgoing messages, adding another layer of control and security.
*   **`callbacks`**:  A flexible mechanism for handling policy events, enabling you to customize validation and ban actions through a set of callbacks.

## Interface IPolicyParams

The `IPolicyParams` interface defines the settings needed to create and configure a policy within the AI agent swarm orchestration framework. It builds upon the core policy schema, allowing you to include dynamic information and fully utilize callback functions for flexible behavior.

Key components of this interface include:

*   **logger:**  This property specifies the logger instance. The logger is used to track and log all policy-related actions and any errors that might occur during execution, providing valuable insights for monitoring and debugging.
*   **bus:** This property designates the bus instance. The bus facilitates communication between agents within the swarm through event-driven messaging, enabling coordinated actions and responses.

## Interface IPolicyConnectionService

The `IPolicyConnectionService` interface acts as a specific type definition, building upon the broader `PolicyConnectionService`. Its primary purpose is to precisely define `TPolicyConnectionService` while intentionally omitting any internal details. This ensures that `PolicyPublicService` remains focused solely on the public-facing operations, providing a clean and manageable interface for external interactions.

## Interface IPolicyCallbacks

The `IPolicyCallbacks` interface defines a set of callbacks used to manage and monitor the lifecycle of policies within the AI agent swarm orchestration framework. These callbacks provide developers with hooks to react to key events, such as when a policy is initialized, or when incoming or outgoing messages require validation.

Specifically, you can use the `onInit` callback to perform setup tasks or log initialization details for a policy. The `onValidateInput` callback allows you to inspect and potentially modify incoming messages, while `onValidateOutput` provides a similar mechanism for outgoing messages.  Finally, the `onBanClient` and `onUnbanClient` callbacks enable you to track and respond to client banning and unbanning actions, respectively. These callbacks are crucial for logging, monitoring, and implementing custom behavior related to policy execution.

## Interface IPolicy

The `IPolicy` interface defines the core logic for controlling interactions within the AI agent swarm. It acts as a central enforcement point, responsible for managing client bans and ensuring all messages – both incoming and outgoing – adhere to the swarm’s established rules.

Key functionalities include:

*   **`hasBan`**:  This method checks if a specific client is currently banned within the swarm, identified by their ID and the swarm’s name.
*   **`getBanMessage`**: If a ban exists, this retrieves the corresponding ban message for the client.
*   **`validateInput`**:  It scrutinizes incoming messages, verifying they comply with the policy’s rules before allowing them to proceed.
*   **`validateOutput`**: Similarly, it checks outgoing messages to guarantee they meet the policy’s requirements.
*   **`banClient`**: This method adds a client to the banned list, preventing them from further interacting with the swarm.
*   **`unbanClient`**: Conversely, this removes a client from the banned list, restoring their access.

## Interface IPersistSwarmControl

The `IPersistSwarmControl` interface provides a flexible way to manage the persistence of your AI agent swarm. It allows you to tailor how active agents and navigation stacks are stored, giving you control over the underlying data adapters.

Specifically, the `usePersistActiveAgentAdapter` method lets you define a custom adapter for storing information about active agents. Similarly, `usePersistNavigationStackAdapter` enables you to specify a custom adapter for managing the navigation stack data. This customization is key to integrating the swarm orchestration framework with various data storage solutions and adapting to different operational needs.


## Interface IPersistStorageData

This interface, `IPersistStorageData`, provides a way to manage and save your storage data persistently. It essentially acts as a container, holding an array of your storage data.  The core functionality revolves around the `data` property, which is an array (`T[]`) that holds all the data you want to keep track of. This allows you to easily store and retrieve your data as needed within the orchestration framework.

## Interface IPersistStorageControl

The `IPersistStorageControl` interface provides a way to manage how your agent swarm’s data is persistently stored. It gives you control over the underlying storage adapter, letting you tailor it to your specific needs.

Specifically, the `usePersistStorageAdapter` method allows you to inject a custom persistence adapter. This adapter can be used to handle the details of reading and writing data to the storage system, offering flexibility and customization for your agent swarm’s data persistence.


## Interface IPersistStateData

This interface, `IPersistStateData`, provides a standardized way to manage and save your AI agent swarm’s state information. It acts as a wrapper, ensuring that the underlying state data is consistently formatted for storage.  The core of the interface is the `state` property, which holds the actual state data itself – represented by the type `T`. This allows for flexible storage of complex state information within your swarm orchestration framework.

## Interface IPersistStateControl

The `IPersistStateControl` interface provides a way to manage how your agent swarm’s state is saved and retrieved. It gives you the flexibility to tailor the persistence process by allowing you to specify a custom adapter.

Specifically, the `usePersistStateAdapter` method lets you replace the default persistence logic with your own implementation. This is useful if you need to change where the state is stored, how it’s formatted, or any other aspect of the persistence process.  You pass in a constructor for the adapter class, enabling you to control the entire state persistence behavior.


## Interface IPersistPolicyData

The `IPersistPolicyData` structure is designed to manage persistent policy information within the AI agent swarm system. It focuses on tracking which client sessions – identified by their `SessionId` – have been banned under a particular `SwarmName` and associated policy.  The core of this data is the `bannedClients` property, which is an array containing the specific `SessionId` values that have been flagged as banned. This allows the swarm to maintain a record of restricted sessions for that policy.


## Interface IPersistPolicyControl

The `IPersistPolicyControl` module provides tools to manage how policy data is saved and retrieved. It gives you the ability to tailor the persistence process, specifically for data linked to a `SwarmName`.

You can inject a custom adapter using the `usePersistPolicyAdapter` method. This adapter replaces the standard `PersistBase` implementation, letting you implement specialized logic, such as keeping track of policy data directly in memory for a particular swarm. This offers flexibility to adapt the persistence behavior to your specific needs.


## Interface IPersistNavigationStackData

This interface, `IPersistNavigationStackData`, provides a way to manage and store information related to the navigation history of an AI agent swarm. It’s designed to track the sequence of agents that have been active within the swarm.

The core of this interface is the `agentStack` property, which is a simple array of strings. Each string in this array represents the name of an agent that was part of the navigation stack at a particular point in time.  This allows the system to reconstruct the agent's journey through the swarm based on this stored history.


## Interface IPersistMemoryData

This interface, `IPersistMemoryData`, provides a standardized way to store and retrieve memory data. It acts as a wrapper, ensuring that all memory data is consistently formatted for storage.  The core of the interface is the `data` property, which holds the actual memory data itself, represented by the type `T`. This allows for flexible storage of various types of memory information.

## Interface IPersistMemoryControl

The `IPersistMemoryControl` interface provides a way to manage how memory is persistently stored. It offers control over the underlying persistence adapter, allowing you to tailor the storage mechanism to your specific needs.

Specifically, the `usePersistMemoryAdapter` method lets you inject a custom adapter – defined by the `TPersistBaseCtor<string, IPersistMemoryData<unknown>>` type – to handle memory persistence. This provides flexibility in choosing and configuring the storage strategy.


## Interface IPersistBase

The `IPersistBase` interface establishes a foundational layer for managing persistent data within the AI agent swarm framework. It provides core methods for interacting with a storage system.

Specifically, the `waitForInit` method handles the initial setup of the storage directory, automatically creating it if it doesn't exist and then cleaning up any outdated or invalid data.

The `readValue` method allows you to retrieve a specific entity from storage using its unique identifier.

Furthermore, the `hasValue` method efficiently checks whether an entity with a given ID already exists in the storage.

Finally, the `writeValue` method enables you to persistently store a new entity or update an existing one, associating it with a designated ID.

## Interface IPersistAliveData

The `IPersistAliveData` interface outlines how the swarm system keeps track of client availability. It’s designed to record whether a specific client, identified by its `SessionId`, is currently active or inactive within a particular `SwarmName`.  The core of this interface is the `online` property, a boolean value that clearly indicates whether the client is considered to be online (represented as `true`) or offline (`false`). This persistent status information is crucial for the swarm’s coordination and decision-making processes.


## Interface IPersistAliveControl

The `IPersistAliveControl` module provides tools to manage how the alive status of swarm agents is tracked and stored. It offers a flexible way to customize this process.

Specifically, the `usePersistAliveAdapter` method lets you inject a custom persistence adapter. This adapter is designed to handle the storage of alive status information linked to a specific `SwarmName`.

You can use this method to replace the standard `PersistBase` implementation with a tailored solution, such as one that keeps track of alive status in memory for improved performance or specific tracking needs.


## Interface IPersistActiveAgentData

This interface, `IPersistActiveAgentData`, defines the structure for data that’s being saved and retrieved for active agents within the orchestration framework. It’s designed to hold information about each agent.

The core property is `agentName`, which is a string. This string represents the unique identifier or name assigned to the active agent. This name is used to track and manage the agent’s state and data throughout the orchestration process.


## Interface IPerformanceRecord

This interface, IPerformanceRecord, is designed to track the operational efficiency of processes within the swarm system. It aggregates performance data from multiple clients – like individual agent sessions – to provide a system-wide view.

The record centers around a specific process, identified by its `processId` (a unique identifier like "proc-123").  It contains an array of `clients`, each represented by an `IClientPerfomanceRecord` object, detailing the performance metrics for that individual client.

Key metrics tracked include `totalExecutionCount`, representing the total number of times a process was executed, and `totalResponseTime`, which is the cumulative response time across all clients, formatted for easy reading (e.g., "500ms").  The `averageResponseTime` is calculated as the average response time per execution.

To provide context, the record also includes `momentStamp`, a Unix timestamp representing the date of the record's creation, and `timeStamp`, a more granular timestamp representing the time of day. Finally, the `date` property stores the date and time of the record in a standard UTC string format.  This comprehensive set of data allows for detailed monitoring and diagnostics of the swarm’s processes.


## Interface IPayloadContext

The `IPayloadContext` interface outlines the structure for managing data related to an AI agent’s task. It’s designed to hold both the actual data being processed and information about where it came from.

Specifically, each `IPayloadContext` includes:

*   **`clientId`**: A unique string identifying the client that originated this context. This allows tracking and potentially managing requests from different sources.
*   **`payload`**:  This property contains the actual data, defined using the `Payload` generic type. This ensures consistent data handling across the framework.

## Interface IOutgoingMessage

The IOutgoingMessage interface defines how messages are sent out from the swarm system. It represents a single message directed to a client, often an agent’s response. 

This interface encapsulates three key pieces of information: the `clientId`, which uniquely identifies the client receiving the message – crucial for directing the message to the correct session, like "client-123"; the `data`, which is the actual content of the message, such as a processed result or assistant response; and the `agentName`, which specifies the agent that originated the message, allowing you to trace the response back to its source, for example, "WeatherAgent". Essentially, it’s a standardized way to communicate results and notifications from agents to their clients within the swarm.


## Interface IModelMessage

This interface, IModelMessage, is the fundamental building block for communication within the swarm system. It represents a single message exchanged between any part of the system – agents, tools, users, or the system itself. These messages are crucial for tracking the history of interactions, generating responses from the model, and broadcasting events throughout the swarm.

Essentially, every piece of data flowing through the system is encapsulated within an IModelMessage.

Here’s a breakdown of the key components:

*   **role:** This property defines the origin of the message. It can be “tool,” “user,” “assistant,” “system,” “resque,” or “flush.” For example, an “assistant” role indicates a response generated by the model, while a “tool” role represents the output of a tool.

*   **agentName:** This uniquely identifies the agent associated with the message, allowing the system to track the context of each interaction within the multi-agent environment.

*   **content:** This is the actual data contained within the message – it could be user input, a tool’s output, a model’s response, or an error message.

*   **mode:** This property indicates the context of the message, categorized as either “user” or “tool,” influencing how the system processes the message.

*   **tool_calls:** This optional array is populated when the model requests a tool execution, providing details about the tool call.

*   **tool_call_id:** This identifier links a tool’s output back to its corresponding tool call, ensuring traceability.

The IModelMessage interface is central to the swarm’s operation, providing a standardized way to manage and route information, enabling the system to intelligently respond to and interact with its environment.

## Interface IMethodContext

The `IMethodContext` interface provides a standardized structure for tracking method calls within the swarm system. It acts as a central point for metadata, utilized by services like ClientAgent, PerfService, and LoggerService. 

This context includes key identifiers for accurate tracking. Specifically, it contains the `clientId`, which links to the client session and is used by ClientAgent for agent-specific execution.  The `methodName` is recorded for logging purposes by LoggerService and for performance analysis by PerfService.

Furthermore, the `agentName` identifies the agent involved, sourced from the Agent interface, and is used in ClientAgent and DocService.  The `swarmName` represents the swarm the method belongs to, derived from the Swarm interface, and is important for PerfService and DocService. 

Finally, the `storageName`, `stateName`, and `policyName` provide details about the storage resource, state, and policy involved in the method call, respectively, all sourced from their respective interfaces and used across various services for documentation and analysis.

## Interface IMetaNode

The `IMetaNode` interface provides a foundational structure for organizing information about agents and their connections within the AI agent swarm orchestration framework. It’s primarily used by the `AgentMetaService` to create a hierarchical representation of the swarm, much like a UML diagram.

Each `IMetaNode` represents a component, such as an agent or a resource, and is identified by a `name`. This name could be the identifier of an agent itself, or a broader category like "States."

Optionally, a node can have a list of `child` nodes. These children represent the dependencies or sub-components associated with the parent node – for example, a list of agents that this agent relies on, or the different states an agent can be in. This allows for a detailed and structured view of the entire swarm’s architecture.

## Interface IMakeDisposeParams

The `IMakeDisposeParams` interface defines the settings used when calling the `makeAutoDispose` function. It controls how and when the swarm agents are automatically cleaned up.

Specifically, it includes a `timeoutSseconds` property, which is a numerical value representing the maximum time (in seconds) the system will wait for agents to complete their tasks before initiating disposal.

Additionally, it provides an `onDestroy` callback function. This function, named `onDestroy`, is invoked when the disposal process begins. It receives the unique identifier (`clientId`) of the agent being disposed and the name of the swarm (`swarmName`) to which the agent belongs, allowing you to perform any necessary cleanup actions for that specific agent.


## Interface IMakeConnectionConfig

The `IMakeConnectionConfig` interface defines the settings used to control how messages are sent as part of an AI agent swarm.  It allows you to manage the timing of message delivery.

Specifically, the `delay` property lets you specify a numerical delay in seconds before a message is sent. This provides a way to rate-limit or schedule the flow of communication within the swarm.


## Interface ILoggerInstanceCallbacks

The `ILoggerInstanceCallbacks` interface provides a way to customize the lifecycle and logging behavior of a logger instance within the AI agent swarm orchestration framework. It offers a set of callback functions that are triggered at specific points during the logger's operation.

Specifically, you can use these callbacks to:

*   **`onInit`**:  Receive notification when the logger instance is initialized, often during the `waitForInit` process. This allows you to perform any necessary setup or configuration.
*   **`onDispose`**:  Execute cleanup actions when the logger instance is being disposed, ensuring resources are released properly.
*   **`onLog`, `onDebug`, `onInfo`**:  React to log messages of different severity levels (log, debug, info) as they are recorded, enabling you to handle specific log events based on their content and the originating agent ID.  Each callback receives the client ID, the log topic, and any associated arguments.

## Interface ILoggerInstance

The `ILoggerInstance` interface provides a standardized way to manage logger instances, building upon the core functionality of the base `ILogger`. It’s specifically designed for client-specific logging scenarios, offering features like initialization and cleanup.

The `waitForInit` method handles the setup of the logger instance, allowing for asynchronous initialization and triggering an `onInit` callback if one is provided. This ensures the logger is ready for use.

The `dispose` method is responsible for cleaning up resources associated with a particular client. It invokes an `onDispose` callback if configured, guaranteeing proper resource release when the client is no longer needed.


## Interface ILoggerControl

The `ILoggerControl` interface provides a way to manage and customize the behavior of logging within the AI agent swarm framework. It’s primarily used by `LoggerUtils` to handle common logging adapters, callbacks, and constructor options.

Key functionalities include:

*   **`useCommonAdapter`**: This method allows you to set a standard logger adapter, overriding the default behavior provided by `swarm.loggerService`. This is useful for centralized logging across the entire swarm.
*   **`useClientCallbacks`**: You can configure lifecycle callbacks specific to each logger instance. These callbacks are applied by the `LoggerUtils` LoggerFactory, giving you control over how instances are created and managed.
*   **`useClientAdapter`**: This method lets you replace the default logger instance constructor with a custom one, tailored to the needs of a particular client.
*   **`logClient`, `infoClient`, `debugClient`**: These methods provide the core logging functionality, sending messages to a specific client using the configured adapter. Each method includes session validation and method context tracking for detailed logging information.

## Interface ILoggerAdapter

The `ILoggerAdapter` interface is a core component of the AI agent swarm orchestration framework, providing a standardized way to manage logging for individual clients. It’s implemented by `LoggerUtils` to tailor logging operations to the specific needs of each client.

This interface defines methods for logging messages at different severity levels – `log`, `debug`, and `info`.  Each method takes the client ID and a topic as input, and then logs a message to the client’s dedicated logger instance.  Crucially, before logging, the framework performs session validation and initialization, guaranteeing that the logging setup is ready.

The `dispose` method is used to cleanly remove the client’s logger instance from the cache, ensuring proper resource management and preventing potential issues when a client is no longer active. Like the other logging methods, it performs session validation and initialization prior to clearing the logger.

## Interface ILogger

The ILogger interface is the core logging system for the entire swarm orchestration framework. It allows components – including agents, sessions, states, storage, and various other systems – to record messages at different levels of importance. 

You can use the `log` method to record general events and state changes, like agent executions or session connections. The `debug` method is designed for detailed diagnostic information, such as tracking intermediate steps during tool calls or embedding creation. Finally, the `info` method is used to record high-level informational updates, such as successful completions or policy validations, offering a clear overview of system activity.  This robust logging system is crucial for debugging, monitoring, and auditing the swarm’s operations.


## Interface IIncomingMessage

The `IIncomingMessage` interface defines how the swarm system receives messages from external sources. It essentially captures a message as it enters the system, often originating from a user or another client.

Each `IIncomingMessage` contains three key pieces of information:

*   **`clientId`**: A unique identifier for the client that sent the message. This allows the system to track the origin of the message, matching identifiers used in runtime parameters like `this.params.clientId`.
*   **`data`**: The actual content of the message itself. This is typically a string, representing the raw data received, such as a user command or a query.
*   **`agentName`**: The name of the agent responsible for handling the message. This links the message to a specific agent instance, often defined in agent parameters like `this.params.agentName`.

This structured approach ensures that messages are correctly routed and processed by the appropriate agents within the swarm system.


## Interface IHistorySchema

The `IHistorySchema` interface outlines the structure for configuring how a model’s conversation history is managed. It essentially defines the system used to store and access the messages exchanged during a conversation.

At its core, the `items` property utilizes an `IHistoryAdapter`. This adapter is the key component, handling the actual storage and retrieval of all the model messages, ensuring a persistent record of the interaction. It’s responsible for managing the entire history data.

## Interface IHistoryParams

This interface, `IHistoryParams`, defines the settings needed to build a history object for an AI agent within a swarm. It extends the basic history structure to include information specific to each agent’s needs.

Key properties include:

*   `agentName`: A unique identifier for the agent that this history belongs to.
*   `clientId`: A unique identifier for the client that’s using this history.
*   `logger`:  An instance of a logger, used to track and record any activity or errors related to the history.
*   `bus`:  An instance of a bus, facilitating communication and event handling within the swarm.

## Interface IHistoryInstanceCallbacks

The `IHistoryInstanceCallbacks` interface provides a set of callback functions designed to manage and interact with an AI agent’s history instance. These callbacks offer fine-grained control over how the history is populated, processed, and ultimately utilized. Specifically, you can dynamically retrieve the agent’s system prompt using `getSystemPrompt`, filtering incoming messages based on a custom condition with `filterCondition`, and fetching the initial history data with `getData`.  Furthermore, these callbacks allow you to react to changes within the history, such as when a new message is added (`onPush`), removed (`onPop`), or during iteration (`onRead`, `onReadBegin`, `onReadEnd`).  You can also respond to the lifecycle events of the history instance, including initialization (`onInit`) and disposal (`onDispose`), and receive a reference to the instance itself (`onRef`).  This robust set of callbacks enables developers to tailor the history instance’s behavior to specific agent and application requirements.

## Interface IHistoryInstance

The #IHistoryInstance interface provides a set of methods for managing an agent’s historical data. 

It offers an `iterate` function that allows you to step through all the messages recorded for a specific agent. 

The `waitForInit` method is used to load any initial data associated with an agent’s history. 

You can add new messages to the history for an agent using the `push` method, which accepts a message and the agent’s name. 

To retrieve and remove the most recent message, the `pop` method is available, returning the last message added for a given agent. 

Finally, the `dispose` method allows you to clean up the agent’s history, optionally clearing all stored data.

## Interface IHistoryControl

The `IHistoryControl` interface provides a way to manage the behavior of an AI agent’s history. It offers methods to control how the history is managed throughout the agent’s lifecycle.

Specifically, you can use the `useHistoryCallbacks` method to set up callbacks that trigger actions at key moments, such as when a history instance is created or destroyed. This allows you to customize the history’s behavior based on your agent’s needs.

Additionally, the `useHistoryAdapter` method lets you specify a custom constructor for the history instance adapter, giving you fine-grained control over the adapter’s creation process.


## Interface IHistoryConnectionService

This interface, `IHistoryConnectionService`, acts as a specific type definition for the broader `HistoryConnectionService`. Its primary purpose is to ensure that the `HistoryPublicService` implementation adheres to a clean, public-facing design. By excluding any internal keys, it guarantees that the public API remains focused solely on the intended, accessible operations.

## Interface IHistoryAdapter

The `IHistoryAdapter` interface provides a standardized way to manage and interact with a history of messages. It offers several key methods for working with this history.

The `push` method allows you to add new messages to the history, identified by a client ID and an agent name.

The `pop` method retrieves and removes the most recent message from the history, again using a client ID and agent name.

The `dispose` method provides a way to clean up the history associated with a specific client and agent, potentially clearing all stored data.

Finally, the `iterate` method enables you to asynchronously loop through all messages in the history for a given client and agent, providing a flexible way to process the entire message log.


## Interface IHistory

The IHistory interface manages the conversation history within the AI agent swarm. It allows you to track and manipulate the sequence of messages exchanged with the model.

Key features include:

*   **push:**  Adds a new model message to the end of the history, updating the record asynchronously.
*   **pop:** Removes and returns the most recently added message from the history.
*   **toArrayForAgent:** Converts the history into an array of messages, specifically formatted for a particular agent. This function filters or adapts the messages based on a given prompt and any associated system prompts.
*   **toArrayForRaw:** Retrieves the entire history as a single array of raw model messages, without any agent-specific filtering or formatting. This provides access to the complete conversation log.

## Interface IGlobalConfig

Okay, this is a comprehensive list of configuration constants and default functions used within the `ClientAgent` system. Let's break down the key aspects and their implications:

**1. Core Configuration Constants:**

*   **`CC_SKIP_POSIX_RENAME`:**  Controls whether the system uses standard POSIX-style file renaming.  Turning this off could be important if the persistence layer uses a different file system or renaming mechanism.
*   **`CC_PERSIST_MEMORY_STORAGE`:**  This is a critical flag.  When enabled, data is persisted in the hard drive or database
*   **`CC_PROCES_UUID`:**  A unique identifier for the current process.  This is useful for tracking and logging.
*   **`CC_BANHAMMER_PLACEHOLDER`:**  A placeholder response used when a client attempts to engage in banned topics or actions.
*   **`CC_DEFAULT_STATE_SET`, `CC_DEFAULT_STATE_GET`, `CC_DEFAULT_STORAGE_GET`, `CC_DEFAULT_STORAGE_SET`:** These are default functions for managing state and storage.  They provide fallback behavior when the user hasn't explicitly configured them.  The `<T = any>` and `<T extends IStorageData = IStorageData>` generics allow for flexible data types.

**2. Exception Handling & Recovery:**

*   **`CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION`:** This is a crucial function for handling exceptions that occur during tool calls.  The `Promise<IModelMessage>` return type allows the system to gracefully handle errors and potentially retry the tool call or return a default response.  The default implementation returns `null`, but this can be overridden to implement custom recovery logic.

**3. Persistence & Data Management:**

*   **`CC_PERSIST_ENABLED_BY_DEFAULT`:**  Determines whether persistence is enabled by default.
*   **`CC_AUTOBAN_ENABLED_BY_DEFAULT`:**  Determines whether automatic banning is enabled by default.
*   **`CC_SKIP_POSIX_RENAME`:**  As mentioned above, this affects file operations within the persistence layer.

**4.  Default Functions (Important for Flexibility):**

*   The default functions for `IState.setState`, `IState.getState`, `IStorage.take`, and `IStorage.upsert` are no-ops. This means they don't actually do anything unless the user has configured them. This allows for customization of these operations.

**Key Implications & Use Cases:**

*   **Customization:** The use of default functions and configurable constants allows for significant customization of the `ClientAgent` system.
*   **Error Handling:** The `CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION` is vital for robust tool call handling.
*   **Persistence Layer:** The `CC_SKIP_POSIX_RENAME` constant highlights the importance of understanding the underlying file system and renaming mechanisms.
*   **State Management:** The `IState` and `IStorage` interfaces, combined with these default functions, provide a flexible way to manage application state and data.

**To fully understand how these constants and functions are used, you'd need to examine the code that defines the `IState`, `IStorage`, `IPolicy`, and `ClientAgent` interfaces and the associated implementation logic.**

Do you want me to elaborate on a specific aspect of these constants or functions, such as:

*   How the `IState` and `IStorage` interfaces work?
*   How the `IPolicy` interface is used for banning?
*   How the `CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION` is implemented?

## Interface IExecutionContext

The `IExecutionContext` interface provides a standardized way to manage information related to each execution within the swarm system. It acts as a central point for tracking and coordinating activities across various services, including ClientAgent, PerfService, and BusService.

Key aspects of the `IExecutionContext` are:

*   **`clientId`**: This string uniquely identifies the client session, linking to the `clientId` property within the ClientAgent and the `executionId` in PerfService.
*   **`executionId`**: This string serves as a unique identifier for a specific execution instance. It’s crucial for tracking performance metrics within PerfService, particularly during the `startExecution` operation, and for managing execution state within the BusService, specifically during `commitExecutionBegin`.
*   **`processId`**:  This string is derived from the `GLOBAL_CONFIG.CC_PROCESSED_UUID` and is used within PerfService’s `IPerformanceRecord` to represent the process associated with the execution.

## Interface IEntity

The `IEntity` interface serves as the foundational building block for all data that needs to be stored and retrieved persistently within the AI agent swarm orchestration framework. It defines a standard set of properties that any entity, such as an agent or a task, will possess. 

Key aspects of the `IEntity` interface include:

*   **Unique Identifier:** Every entity must have a unique identifier to distinguish it from others.
*   **Metadata:**  Stores general information about the entity, like its creation timestamp and last updated time.
*   **Status:**  Provides a way to track the entity's current state (e.g., active, inactive, pending, completed).
*   **Persistence Support:**  Designed to integrate seamlessly with the framework’s persistence mechanisms, ensuring data durability.


## Interface IEmbeddingSchema

The `IEmbeddingSchema` interface defines how the swarm manages and utilizes embedding mechanisms. It’s responsible for configuring the creation and comparison of embeddings within the system.

Key aspects of this schema include:

*   **embeddingName:** A unique identifier assigned to each embedding mechanism, allowing for distinct management within the swarm.
*   **callbacks:** An optional set of callbacks that can be used to customize events related to embedding creation and comparison, providing flexibility for specific needs.

The schema provides methods for:

*   **createEmbedding:** This method generates an embedding from a given text string, often used for indexing or storing embeddings in a persistent storage.
*   **calculateSimilarity:** This method computes the similarity between two embeddings, typically employing metrics like cosine similarity for tasks such as search or ranking.

## Interface IEmbeddingCallbacks

The `IEmbeddingCallbacks` interface offers a way to react to key events during the lifecycle of your AI agent embeddings. It provides two primary callback functions designed for flexibility and insight.

The `onCreate` callback is invoked immediately after a new embedding is generated. This allows you to log the embedding’s creation, perform any necessary post-processing steps, or track embedding generation metrics.

The `onCompare` callback is triggered whenever two embeddings are compared for similarity. This is particularly useful for monitoring similarity scores, analyzing the results of comparisons, and potentially adjusting your agent’s behavior based on the similarity data.  Both callbacks receive relevant information like the text strings being compared, the similarity score, and client and embedding identifiers for detailed tracking.

## Interface ICustomEvent

The ICustomEvent interface provides a way to send custom data within the swarm system. It builds upon the broader IBaseEvent interface, offering a flexible approach to event handling. Unlike the standard IBusEvent, which has a fixed structure, ICustomEvent allows you to include any type of data in its `payload`. This is useful for creating event scenarios that don’t fit the predefined IBusEvent format, and is dispatched using `IBus.emit<ICustomEvent>`.  The `payload` property can hold data like a custom status update or specific information relevant to a particular task.

## Interface IConfig

The `IConfig` class manages the settings for UML diagram generation. Specifically, it includes a `withSubtree` property. This boolean flag, when set to `true`, instructs the system to generate a UML diagram that includes nested or sub-diagrams, providing a more detailed representation of the system’s architecture.


## Interface ICompletionSchema

The `ICompletionSchema` interface defines the configuration for a completion mechanism used within the AI agent swarm. It specifies how the swarm generates responses for completion tasks.

Key aspects of this schema include:

*   **completionName:** A unique identifier for the completion mechanism itself, ensuring distinct behavior within the swarm.
*   **callbacks:** An optional set of callbacks that can be used to customize the actions taken after a completion is generated. This allows for flexible post-processing of the response.
*   **getCompletion:** This method is responsible for retrieving a completion. It takes arguments and generates a model response, utilizing the provided context and available tools.

## Interface ICompletionCallbacks

The `ICompletionCallbacks` interface defines how you can respond to successful completion events from the AI agent swarm framework. It offers a way to execute custom code after a completion has been generated.

Specifically, the `onComplete` callback is triggered when a completion is successfully produced.

This callback accepts two arguments:

*   `args`: Contains general arguments related to the completion event.
*   `output`: Represents the generated completion message itself, typically an `IModelMessage`.

You can use this callback to perform actions like logging the completion, processing the output, or initiating any necessary side effects based on the generated text.


## Interface ICompletionArgs

The `ICompletionArgs` interface defines the structure for requesting a completion from a language model. It bundles together all the necessary information to generate a response, including the client’s identification, the specific agent involved, and the conversation history. 

Key elements within this interface are:

*   **`clientId`**: A unique identifier for the client making the request.
*   **`agentName`**: The name of the agent responsible for handling the completion.
*   **`mode`**:  Specifies the origin of the last message, distinguishing between user input and tool outputs.
*   **`messages`**: An array of messages that provide the context for the model, essentially the conversation history.
*   **`tools`**: An optional list of tools that the agent can utilize during the completion process, allowing for tool calls if needed.

## Interface ICompletion

The `ICompletion` interface defines the core functionality for generating responses from an AI model. It acts as a central point for any system needing to produce text-based outputs. This interface extends a broader completion schema, offering a fully-fledged API designed to handle the entire process of creating model responses. It provides a standardized way to interact with and control the generation of text, ensuring consistency across different implementations.

## Interface IClientPerfomanceRecord

This `IClientPerformanceRecord` interface provides detailed performance data for individual clients within a process. It’s designed to be used for analyzing client-level execution metrics, memory usage, and state information. This record is a core component within the `IPerformanceRecord` structure, specifically targeting breakdowns by client, and is utilized for logging through `ILogger` or transmission via `IBus` – common mechanisms in ClientAgent workflows.

The interface contains the following properties:

*   **`clientId`**: A string representing the unique identifier of the client, often matching the `clientId` used in runtime parameters like `this.params.clientId` within a `ClientAgent` instance. This allows you to directly link performance data to a specific session or agent. For example, it might be "client-456" for a user session.

*   **`sessionMemory`**: A `Record<string, unknown>` that stores arbitrary data used during the client’s operation. This mirrors the functionality of `IState`’s state management within `ClientAgent`, providing a space for temporary variables or cached values.  An example would be `{ "cacheKey": "value" }`.

*   **`sessionState`**: Another `Record<string, unknown>` representing persistent state data for the client, similar to `IState`’s role in tracking agent state.  An example could be `{ "step": 3, "active": true }`.

*   **`executionCount`**: A number indicating the total number of times this client’s execution was run within the process. This contributes to the overall `executionCount` of the process.  For instance, a client might have `executionCount: 10` if it executed 10 commands.

*   **`executionInputTotal`**: A number representing the total input size processed during all executions of this client, measured in a consistent unit (e.g., bytes or characters). This reflects the cumulative input data, such as messages received in `ClientAgent.execute`.  An example would be `1024` for a total of 1KB of input.

*   **`executionOutputTotal`**: A number representing the total output size generated during all executions, also measured in a consistent unit. This reflects the cumulative output data, such as results emitted from `ClientAgent._emitOutput`. An example would be `2048` for 2KB of output.

*   **`executionInputAverage`**: The average input size per execution, calculated by dividing `executionInputTotal` by `executionCount`. This provides a normalized measure of input volume (e.g., "102.4" bytes per execution).

*   **`executionOutputAverage`**: The average output size per execution, calculated similarly to `executionInputAverage`. This provides a normalized measure of output volume (e.g., "204.8" bytes per execution).

*   **`executionTimeTotal`**: A string representing the total execution time for the client, formatted for readability (e.g., "300ms" or "1.5s"). This is the cumulative duration of all executions.

*   **`executionTimeAverage`**: A string representing the average execution time per execution, formatted for readability. This is the average duration of each execution, providing a normalized latency metric (e.g., "30ms" per execution).

## Interface IBusEventContext

The `IBusEventContext` interface provides supplementary information surrounding an event within the swarm system. It’s designed to offer additional context beyond what’s present in a standard `IBusEvent`.

Primarily used in ClientAgent, the context typically contains only the `agentName`, consistently linking the event to a specific agent instance – for example, “Agent1”.

However, for broader system-level events, such as those involving swarms or policies, the context can include more detailed information. Specifically, it can contain:

*   `agentName`: The unique name of the agent generating the event.
*   `swarmName`: The unique name of the swarm involved, useful for swarm-wide events.
*   `storageName`: The unique name of the storage associated with the event, relevant for storage-related events.
*   `stateName`: The unique name of the state associated with the event, utilized for state change events.
*   `policyName`: The unique name of the policy associated with the event, relevant for policy enforcement events.

These additional fields allow for a more granular understanding of the event’s origin and scope within the complex swarm architecture.

## Interface IBusEvent

The IBusEvent interface defines a structured event format used for communication within the swarm system. It’s designed for the internal bus, primarily utilized by ClientAgents through their `bus.emit` calls, such as sending events for actions like “run” or “commit-user-message”.

Each IBusEvent contains key properties to provide detailed information about the event. The `source` property identifies the component that originated the event; it’s consistently “agent-bus” for ClientAgent events, but can hold other values for different internal buses.

The `type` property specifies the event’s purpose, like “run” or “commit-user-message”, acting as a unique identifier for the event’s intent.

The `input` property holds event-specific data, often a key-value object containing information relevant to the event’s action, frequently linked to the `IModelMessage` content.

The `output` property provides event-specific results, typically an empty object for notification events like “commit-flush”.

Finally, the `context` property offers optional metadata, primarily including the `agentName` for ClientAgent events, allowing for richer contextual information when needed.

## Interface IBus

The IBus interface is the core mechanism for communication within the swarm system. It provides a way for agents, primarily ClientAgents, to send asynchronous updates and notifications to other components. Think of it as a central messaging system.

Here’s how it works:

*   **Event Dispatching:** Agents use the `emit` method to broadcast events. These events can signal a wide range of things, such as a completed run of a tool, the emission of validated output, or the commit of messages.
*   **Structured Events:** All events follow a consistent structure defined by the `IBaseEvent` interface. This includes fields like `type` (to identify the event), `source` (indicating the event's origin), `input` (containing any necessary data), `output` (holding the result of the event), `context` (providing metadata like the agent’s name), and crucially, `clientId` (the target client).
*   **Asynchronous Delivery:** The `execute` method returns a Promise. This means the event is not immediately processed but is queued or sent through a channel. The Promise resolves once the event has been successfully delivered to the target client.
*   **Client Targeting:** The `clientId` field ensures that events are always delivered to the correct client, regardless of how the system is configured.
*   **Notification Focus:** The IBus is primarily designed for one-way notifications. The `output` field is often empty, except when carrying results, such as the outcome of a tool run or the validated output of a process.

**Example Usage:**

*   **Stateless Run Completion:** A ClientAgent might use `emit` to signal that a stateless run has finished, sending the transformed result through the `output` field.
*   **Output Emission:**  After validating output, an agent can broadcast the final result using the `emit-output` event type.

**Key Features:**

*   **Redundancy:** The `clientId` is duplicated in the event structure, which can be helpful for filtering or validation.
*   **Type Safety:** The use of generics (`<T extends IBaseEvent>`) ensures that events are always structured correctly.
*   **Integration:** The IBus works in conjunction with other system components, such as history updates and callbacks, to provide a comprehensive view of the swarm’s state.

## Interface IBaseEvent

The `IBaseEvent` interface forms the core structure for all events within the swarm system. It establishes a fundamental framework for communication between different components, including agents and sessions.

This interface defines the essential fields present in every event, and serves as the basis for more specialized event types like `IBusEvent` and `ICustomEvent`.

Key properties include:

*   **source:** A string that identifies the origin of the event.  This is typically a generic string like "custom-source," but in practice, it’s often overridden (e.g., "agent-bus") to represent the specific source within the system.
*   **clientId:** A unique identifier for the client receiving the event. This value corresponds to the `clientId` used in runtime parameters, ensuring events are delivered to the correct session or agent instance – for example, "client-123".

## Interface IAgentToolCallbacks

The `IAgentToolCallbacks` interface defines a set of callbacks to manage the lifecycle of individual tools within an agent swarm. It provides hooks you can use to control how tools are handled throughout their execution.

Specifically, you can use the `onBeforeCall` callback to perform actions *before* a tool runs, such as logging details or preparing the necessary data.  After a tool completes, the `onAfterCall` callback allows you to execute cleanup tasks, record results, or perform any post-processing.

The `onValidate` callback gives you the ability to check the tool’s parameters *before* execution, letting you implement custom validation rules. Finally, the `onCallError` callback is triggered if a tool fails, providing a place to log errors and potentially attempt recovery. These callbacks offer granular control and flexibility in orchestrating your agent swarm.

## Interface IAgentTool

The IAgentTool interface is the core component for managing tools used by individual agents within the swarm. It builds upon the base ITool interface to provide a structured way to define and execute tools.

Each IAgentTool has a descriptive `docNote` that clarifies its purpose and how it should be used.  A unique `toolName` is assigned to each tool, allowing the swarm to identify and manage them effectively.

The `callbacks` property offers flexibility, letting you customize the tool's execution flow with lifecycle events.

The primary method, `call`, executes the tool, taking in parameters like the tool ID, client ID, agent name, and a list of tool calls.  Crucially, it also handles the `isLast` flag, indicating the final call in a sequence.

Before execution, the `validate` method is invoked to ensure the tool parameters are valid. This validation can be synchronous or asynchronous, depending on the complexity of the checks.

## Interface IAgentSchemaCallbacks

The `IAgentSchemaCallbacks` interface provides a set of callbacks to manage different stages of an agent’s lifecycle. These callbacks allow you to react to key events, such as when the agent is initialized, runs without historical context, or when a tool produces output.

Specifically, you can use these callbacks to handle:

*   The `onInit` event when the agent is first set up.
*   The `onRun` event when the agent executes without relying on previous conversation history.
*   The `onExecute` event at the beginning of an agent’s execution.
*   The `onToolOutput` event when a tool generates a response.
*   The `onAssistantMessage` event when the agent commits a message.
*   The `onUserMessage` event when a user sends a message.
*   The `onFlush` event when the agent’s history is cleared.
*   The `onOutput` event when the agent produces general output.
*   The `onResurrect` event if the agent needs to be restarted after a pause or error.
*   The `onAfterToolCalls` event after all tool calls within a sequence have finished.
*   The `onDispose` event when the agent is being shut down.

These callbacks offer granular control over how your application interacts with and responds to the agent’s activities.

## Interface IAgentSchema

The `IAgentSchema` interface defines the configuration for each agent within the swarm. It outlines the agent’s core settings, including its unique name, the primary prompt it uses to guide its actions, and the specific completion mechanism employed.

Agents can be configured with a maximum number of tool calls they’re allowed to make during a cycle, and they can utilize a defined set of tools and storage options.  Furthermore, agents can depend on other agents for coordinated transitions, and their output can be validated or transformed using optional callback functions.

The `IAgentSchema` also allows for customization through the `callbacks` property, providing a way to manage the agent’s lifecycle and execution flow.  This schema provides a flexible framework for managing and controlling individual agents within the larger swarm system.


## Interface IAgentParams

The `IAgentParams` interface defines the settings needed to run an individual agent within the swarm. It brings together key information like the agent’s unique identifier (`clientId`), a logging system (`logger`) for tracking activity, and a communication channel (`bus`) for interacting with other agents.  Crucially, it also includes a history tracker (`history`) to record the agent’s actions and a component (`completion`) responsible for generating responses.  Agents can optionally utilize a set of tools (`tools`) for performing specific tasks, and the `validate` function allows for final checks on the agent’s output before it’s finalized.

## Interface IAgentConnectionService

The `IAgentConnectionService` interface serves as a type definition, specifically designed to represent an `AgentConnectionService`. Its primary purpose is to create a clear, public-facing representation of this service. By excluding internal keys, it guarantees that the `TAgentConnectionService` type accurately reflects only the operations accessible to external systems, aligning perfectly with the intended public-facing behavior of the agent connection service.

## Interface IAgent

The `IAgent` interface defines the core runtime behavior for an agent within the orchestration framework. It provides methods for the agent to operate independently, processing input without altering the conversation history – this is achieved through the `run` method.  

More complex operations, where the agent might need to update its internal state or conversation history, are handled via the `execute` method, which accepts an input and an execution mode.  

The `IAgent` also manages the flow of information through methods like `commitToolOutput`, `commitSystemMessage`, and `commitUserMessage`, allowing for the addition of messages to the agent’s context.  Finally, the `commitFlush` method allows for a complete reset of the agent’s state, and `commitStopTools` prevents further tool execution.
