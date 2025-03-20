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

**Further Questions & Considerations**

* **Data Transfer Objects (DTOs):** The interfaces mention `dto`s used in tool calls.  It would be helpful to understand the structure of these DTOs.
* **Validation:** The `validate` method (found in `IAgent` and `IAgentSchemaCallbacks`) is crucial.  What validation rules are enforced?
* **Completion Mechanism:**  What are the different completion mechanisms supported by the `IAgentSchema`?
* **Error Handling:** How are errors handled within the framework?


# agent-swarm-kit classes

## Class ToolValidationService

The ToolValidationService is a core component of the swarm system, responsible for ensuring the integrity of registered tools. It maintains a record of all tools within the swarm, verifying their uniqueness and existence. This service works closely with other key components, including the ToolSchemaService for tool registration, the AgentValidationService for agent tool validation, and the ClientAgent for tool usage.

The service utilizes dependency injection to manage its logging, allowing for controlled information-level logging based on the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting.  It employs a map, called _toolMap, to store tool names and their corresponding schemas, facilitating efficient validation checks.

The `addTool` function registers new tools with their schemas, integrating with the ToolSchemaService’s registration process and logging the operation. The `validate` function is the primary validation mechanism, leveraging memoization to optimize performance by checking if a tool name exists within the registered map. This function also logs the validation operation and supports the AgentValidationService’s broader validation efforts.

## Class ToolSchemaService

The ToolSchemaService is the core service responsible for managing all tool definitions within the swarm system. It acts as a central repository, utilizing the ToolRegistry from functools-kit to store and quickly access IAgentTool instances.  This service performs shallow validation on each tool schema to guarantee basic integrity – specifically checking that the toolName is a string, the ‘call’ and ‘validate’ properties are functions, and the ‘function’ property is an object.

The service integrates closely with several other components: it’s used by AgentConnectionService during agent instantiation, supports ClientAgent’s tool execution, and is referenced by AgentSchemaService through the ‘tools’ field.  A LoggerService is integrated to record information-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations, aligning with the logging patterns of other key services.

The ToolSchemaService maintains an immutable registry, updated solely through the ToolRegistry’s register method.  It provides a ‘get’ method to retrieve tool schemas by their names, and a ‘register’ method to add new schemas after validation, ensuring consistent tool definitions across the swarm.


## Class SwarmValidationService

The SwarmValidationService is a core component responsible for ensuring the integrity of the swarm system. It maintains a record of all registered swarms, meticulously verifying their uniqueness, the validity of the agents listed within each swarm, and the associated policies.  

This service works closely with several other components, including the SwarmSchemaService for initial swarm registration, the ClientSwarm service for managing swarm operations, and the AgentValidationService and PolicyValidationService for detailed agent and policy checks.  

To optimize performance, the SwarmValidationService utilizes dependency injection for its services and memoization, specifically caching validation results by swarm name.  Key operations include registering new swarms via `addSwarm`, retrieving agent and policy lists using `getAgentList` and `getPolicyList`, and performing comprehensive validation checks for any given swarm through the `validate` method.  The service also provides a list of all registered swarms via `getSwarmList`, ensuring a complete overview of the swarm system’s configuration.

## Class SwarmSchemaService

The SwarmSchemaService is the core service responsible for managing all swarm configurations within the system. It acts as a central registry, utilizing the ToolRegistry from functools-kit to store and retrieve ISwarmSchema instances. This service performs shallow validation on each schema to ensure basic integrity – specifically checking that the swarmName and defaultAgent are strings, the agentList contains unique AgentName references, and policies (if present) contain unique PolicyName references.

The service integrates closely with other key components, including the LoggerService for logging operations at the info level (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), the SwarmConnectionService, and the AgentConnectionService. It’s used to define and manage configurations like agent lists, default agents, and policies, which are essential for orchestrating agents within the swarm ecosystem.

The service provides two primary methods: `register` and `get`. The `register` method adds a new swarm schema to the registry after validation, while the `get` method retrieves an existing schema based on its name. Both methods are designed to support the instantiation of ClientSwarm configurations within the SwarmConnectionService, ultimately facilitating the execution of ClientAgent tasks. The registry itself is immutable once initialized, updated solely through the ToolRegistry’s register method.

## Class SwarmPublicService

The SwarmPublicService provides a public interface for interacting with a swarm system. It acts as a central point of access, managing swarm-level operations and providing a consistent API. This service leverages the `SwarmConnectionService` for the core swarm interactions, while also incorporating the `MethodContextService` to ensure operations are correctly scoped to a specific client and swarm.

Key functionalities include navigating the swarm’s agent flow, controlling output, waiting for agent results, retrieving agent information, and ultimately disposing of the swarm. Each operation is wrapped with the `MethodContextService` for context management and logged via the `LoggerService` when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with logging patterns used by `SessionPublicService` and `PerfService`.

The service utilizes several internal components, including the `SwarmConnectionService` for low-level swarm interactions, and integrates with other services like `ClientAgent` (for agent execution within `EXECUTE_FN`), `AgentPublicService`, `SessionPublicService`, and `PerfService`.  Methods like `navigationPop`, `cancelOutput`, and `waitForOutput` directly call the `SwarmConnectionService`, while methods like `getAgentName` and `getAgent` retrieve agent details.  The `dispose` method is responsible for cleaning up resources, mirroring the disposal patterns of other services.

## Class SwarmMetaService

The SwarmMetaService is a core component responsible for managing and visualizing the structure of the swarm system. It acts as a central hub for translating swarm schemas into a readily understandable format – UML diagrams.  

Specifically, it leverages the SwarmSchemaService to extract data from the swarm definitions, then uses the AgentMetaService to create the individual nodes within the swarm tree, including the default agent.  The service then employs a serialization function, created by AgentMetaService, to convert these nodes into a UML string representation. 

This UML string is ultimately used by the DocService, for example during the `writeSwarmDoc` process, to generate visual diagrams like `swarm_schema_[swarmName].svg`.  The service integrates with the LoggerService for informational logging, controlled by the `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` setting, ensuring consistent logging patterns across the system.  It supports the ClientAgent’s agent relationships and provides a mechanism for computing client state, contributing to both documentation and debugging capabilities within the swarm.

## Class SwarmConnectionService

The SwarmConnectionService is the core component for managing interactions within a swarm system. It acts as an interface to a specific swarm, identified by its client ID and name. This service is designed to efficiently handle operations like retrieving or creating a swarm instance, managing the active agent within that swarm, and retrieving output from the agent.

Key features include memoization using functools-kit’s memoize, which caches ClientSwarm instances based on the client ID and swarm name, optimizing performance by avoiding redundant instance creation. The service integrates with several other components, including ClientAgent for executing agents within the swarm, SwarmPublicService for a public API, and AgentConnectionService for managing agent instances.

The service provides methods for retrieving the active agent’s name and instance, as well as waiting for and retrieving output from the agent. It leverages a logger service for informational logging (enabled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) and a bus service for event propagation.  The service also utilizes a method context service to maintain the scope of the client ID and swarm name during operations.  Finally, it provides methods for setting and clearing agent references, allowing for dynamic agent management within the swarm.  The service’s lifecycle management, including disposal, is aligned with SswarmPublicService and PerfService, ensuring consistent cleanup across the system.

## Class StorageValidationService

The StorageValidationService is a core component of the swarm system, responsible for ensuring the integrity of all storage configurations. It maintains a record of registered storage locations, meticulously verifying that each one is unique, actually exists, and has a correctly configured embedding. 

This service works closely with several other key components. It leverages the StorageSchemaService to initially register storage details and relies on the ClientStorage service for operational checks.  Furthermore, it collaborates with the AgentValidationService and EmbeddingValidationService to guarantee the proper setup of agent storage and the validity of associated embeddings.

To optimize performance, the StorageValidationService employs dependency injection for its services and memoization, meaning it caches validation results for a given storage name to avoid redundant checks. The service utilizes a central storage map to track all registered storage configurations and is triggered by the `validate` method, which is called when a storage needs to be verified.  A logger service provides detailed logging of all validation activities, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting.


## Class StorageUtils

The `StorageUtils` class provides a centralized way to manage data storage within an agent swarm. It implements the `TStorage` interface, offering methods for retrieving, inserting, updating, deleting, and listing items stored by specific agents.  This utility handles client-specific storage, ensuring proper agent-storage registration and validation before any data operations are performed.  Key functionalities include the `take` method for retrieving a limited number of items based on a search query, the `upsert` method for adding or modifying items, the `remove` method for deleting items by ID, the `get` method for retrieving a single item, and the `list` method for listing all items within a storage.  Additionally, the `clear` method allows for the complete removal of data for a given agent and storage. All operations are executed within a logging context for monitoring and debugging purposes.

## Class StorageSchemaService

The StorageSchemaService is the core service for managing storage configurations within the swarm system. It acts as a central registry, utilizing the ToolRegistry from functools-kit, to store and retrieve IStorageSchema instances. This registry ensures the integrity of storage schemas through shallow validation, checking that each schema has a valid storage name, a function for creating indexes, and a reference to an EmbeddingName if applicable.

The service integrates closely with other key components, including StorageConnectionService, SharedStorageConnectionService, and AgentSchemaService, providing the necessary storage configurations for ClientStorage and shared storage instances.  It leverages a LoggerService for logging operations at the info level, controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.

The service’s primary methods are registration and retrieval. The `register` method adds a new schema to the registry after validation, while the `get` method retrieves an existing schema based on its name.  These operations are crucial for supporting ClientAgent execution and ensuring consistent storage configurations across the swarm.  The registry itself is designed to be immutable once set, updated only through the ToolRegistry’s register method to maintain a stable collection of storage schemas.

## Class StoragePublicService

This `StoragePublicService` class acts as a public interface for managing client-specific storage within the swarm system. It’s designed to provide a consistent way for other services, like the `ClientAgent`, to interact with individual clients’ storage data. The service relies on the `StorageConnectionService` for the actual storage operations and uses the `MethodContextService` to track the context of each operation, ensuring proper scoping and logging.

Key functionalities include retrieving, inserting, updating, deleting, and listing items within a client’s storage, all identified by a unique `storageName` and `clientId`. The service integrates with the `ClientAgent` for tasks like searching and storing data within `EXECUTE_FN`, and it supports tracking storage usage through `PerfService` and documenting storage schemas via `DocService`.

The service utilizes a `loggerService` for informational logging, controlled by the `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` setting.  Methods like `take`, `upsert`, `remove`, `get`, `list`, `clear`, and `dispose` are all wrapped with the `MethodContextService` and logging to provide detailed tracking and debugging capabilities.  It distinguishes itself from the `SharedStoragePublicService` by focusing on individual client storage, offering a granular approach to data management within the swarm.

## Class StateUtils

The StateUtils class is a core component designed to manage individual agent states within the AI agent swarm. It acts as a central point for retrieving, updating, and clearing state information specific to each client and agent. 

This utility provides methods – `getState`, `setState`, and `clearState` – that interact with the swarm’s state service.  `getState` allows you to retrieve the current state data, ensuring proper client session and agent-state registration are verified before accessing the data. The `setState` method offers flexibility, accepting either a direct state value or a function that calculates the new state based on the previous one. Finally, `clearState` resets the state data to its initial value, again validating client and agent registration. All operations are executed within a logging context for monitoring and debugging.

## Class StateSchemaService

The StateSchemaService is the core service responsible for managing all state schemas within the swarm system. It acts as a central repository, utilizing the ToolRegistry from functools-kit to store and retrieve IStateSchema instances.  This service performs shallow validation on each schema to guarantee basic integrity, checking the stateName and the presence of a valid getState function, along with any associated middlewares.

The service integrates closely with other key components, including StateConnectionService, SharedStateConnectionService, ClientAgent, AgentSchemaService, and StatePublicService.  It leverages a LoggerService for logging operations at the info level, controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.

The StateSchemaService provides the fundamental building blocks for defining and configuring state configurations, such as the getState function and middlewares, which are essential for both client-specific and shared states.  It supports the instantiation of ClientState within StateConnectionService and SharedStateConnectionService, ensuring that all state schemas are validated before being used by the swarm’s agents. The registry itself is immutable, updated only through the ToolRegistry’s register method.


## Class StatePublicService

This class, StatePublicService, manages client-specific state operations within the swarm system. It provides a public interface for interacting with state data, leveraging a generic type system to support various state formats. 

The service integrates with several key components: the ClientAgent for handling client-specific state updates during execution, PerfService for tracking state changes associated with individual client IDs, and DocService for documenting state schemas based on their names. 

StatePublicService relies on a LoggerService for logging operations at an info level (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) and utilizes a StateConnectionService for the underlying state management. 

Key functionalities include setting, clearing, retrieving, and disposing of client-specific state, all wrapped with MethodContextService for scoping and logging.  This service is distinct from SharedStatePublicService (which manages system-wide state) and SharedStoragePublicService (which handles persistent storage). 

The service offers a `setState` method to update client state, a `clearState` method to reset it, a `getState` method to retrieve the current state, and a `dispose` method to clean up resources. These methods are designed to be used within the ClientAgent during execution and by PerfService for monitoring state changes.

## Class StateConnectionService

The StateConnectionService is the core component for managing individual state instances within the swarm system. It implements the `IState` interface, providing a structured way to handle state data, updates, and lifecycle operations, all tied to a specific client and state name. This service intelligently manages both client-specific states and shared states, leveraging a `_sharedStateSet` to track delegation to the `SharedStateConnectionService`.

Key features include memoization using functools-kit’s memoize to efficiently reuse state instances based on their client and state name combination, ensuring performance and thread safety through queued state updates. The service integrates with several other components, including `ClientAgent`, `StatePublicService`, `SharedStateConnectionService`, and `AgentConnectionService`, facilitating seamless state management across the swarm.

The `getStateRef` method is central, retrieving or creating a memoized `ClientState` instance, applying state configurations from the `StateSchemaService` and handling persistence via `PersistStateAdapter` or GLOBAL_CONFIG defaults. It also manages state updates using a dispatch function, logging operations when enabled and mirroring the functionality of `StatePublicService`.

Furthermore, the service provides methods for clearing states (`clearState`) and retrieving current states (`getState`), all while maintaining a robust lifecycle management system through its `dispose` method, which cleans up memoized instances and updates the `SessionValidationService`. The `SharedStateConnectionService` is used for shared state delegation, ensuring consistent state management across the swarm.

## Class SharedStorageUtils

The SharedStorageUtils class provides a central interface for interacting with the swarm’s shared storage. It implements the `TSharedStorage` interface, offering a set of methods to manage data within the storage.

Key functionalities include retrieving items using the `take` method, which allows searching for items based on a query and specifying a total count.  The `upsert` method handles both inserting new items and updating existing ones within the shared storage.  You can also remove individual items using the `remove` method, identified by their unique ID.

Furthermore, the class provides the ability to retrieve a single item by its ID with the `get` method.  For managing the entire storage, the `list` method allows you to list all items, optionally filtered based on a provided condition. Finally, the `clear` method provides a way to remove all items from a specific storage.  All these operations are executed within a context that supports logging and validation, ensuring the storage name is valid before any operation is performed.

## Class SharedStoragePublicService

The `SharedStoragePublicService` class acts as a public interface for interacting with shared storage within the swarm system. It implements the `TSharedStorageConnectionService` to provide a consistent API for accessing shared storage, delegating the underlying storage operations to the `SharedStorageConnectionService`. This service handles the core storage tasks like retrieving, updating, and deleting items.

The service incorporates several supporting components: a logger for tracking operations (enabled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`), a method context service for scoping, and integrations with the `ClientAgent`, `PerfService`, and `DocService`.  The `take` method retrieves lists of storage items based on search criteria, while `upsert` inserts or updates individual items.  `remove` deletes items by ID, and `get` retrieves a single item.

The service also offers `list` for retrieving all items in a storage location, and `clear` to remove all items.  Each of these methods wraps the calls to the `SharedStorageConnectionService` to manage logging and context.  The service is designed to be used in scenarios such as searching storage within `EXECUTE_FN` (via the `ClientAgent`), tracking storage usage with the `PerfService`, and documenting storage schemas using the `DocService`.

## Class SharedStorageConnectionService

The SharedStorageConnectionService is a core component responsible for managing shared storage instances within the swarm system. It implements the `IStorage` interface, providing a centralized point for shared data access and manipulation. This service operates across all clients, utilizing a fixed client ID of "shared" to ensure consistent data management.

Key integrations include ClientAgent for shared storage execution, StoragePublicService and SharedStoragePublicService for client-specific and public API access, and AgentConnectionService for storage initialization. The service employs memoization via functools-kit’s memoize to maintain a single, shared ClientStorage instance, optimizing performance and resource usage.

The `getStorage` method is central, creating and caching ClientStorage instances based on the provided storage name. This method configures the storage with schema data from StorageSchemaService, embedding logic from EmbeddingSchemaService, and persistence settings via PersistStorageAdapter or GLOBAL_CONFIG defaults.

Common operations include `take` for retrieving data based on search queries and scores, `upsert` for inserting or updating data, `remove` for deleting data, `get` for retrieving individual items, and `list` for bulk data retrieval with optional filtering. All operations delegate to the underlying ClientStorage instance, leveraging logging via LoggerService (when enabled) and context information from MethodContextService for accurate data retrieval and management. The service mirrors functionality found in SharedStoragePublicService, supporting ClientAgent’s similarity-based data retrieval and data persistence.

## Class SharedStateUtils

The SharedStateUtils class is a core utility designed to manage shared data across an agent swarm. It acts as an interface to the swarm’s shared state service, providing methods for retrieving, updating, and resetting state information.

Specifically, it offers:

*   **`getState`**: This method allows you to retrieve the current shared state data associated with a particular state name. It handles the underlying communication with the swarm’s state service and includes logging for context.
*   **`setState`**:  This method enables you to modify the shared state. You can either provide a direct value to set the state, or, more powerfully, you can pass a function. This function takes the previous state as input and returns a *promise* that resolves to the new state, allowing for complex state calculations based on prior values.
*   **`clearState`**: This method resets the shared state for a given state name, returning it to its initial, empty state. Like the other methods, it operates within a logging context and interacts with the shared state service.

## Class SharedStatePublicService

The SharedStatePublicService acts as a central interface for managing shared state operations within the swarm system. It implements the `TSharedStateConnectionService` to provide a public API, delegating core state interactions to the underlying SharedStateConnectionService. This service is enhanced with MethodContextService for controlled scoping and utilizes LoggerService for consistent, info-level logging, enabled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting.

The service’s primary functions include `setState`, which updates the shared state using a provided dispatch function and supports operations within ClientAgent and PerfService.  Additionally, `clearState` resets the shared state to its initial value, and `getState` retrieves the current state value. These methods are designed to be robust and adaptable, aligning with the logging patterns of SessionPublicService and PerfService.  The service’s architecture facilitates integration with ClientAgent and PerfService, enabling state management and performance tracking across the swarm.


## Class SharedStateConnectionService

The SharedStateConnectionService is a core component responsible for managing shared state connections within the swarm system. It implements the `IState<T>` interface, providing a managed instance of shared state accessible across all clients, identified by a fixed client ID of "shared".

This service facilitates state manipulation and access, leveraging memoization through functools-kit’s memoize to efficiently reuse ClientState instances by state name.  It integrates with several other services including ClientAgent, StatePublicService, SharedStatePublicService, and AgentConnectionService, ensuring a cohesive system.

Key features include:

*   **State Management:**  Provides a central point for managing shared state, utilizing a fixed client ID for consistent access.
*   **Memoization:** Caches ClientState instances by stateName to optimize performance and reduce redundant initialization.
*   **Thread Safety:** Serializes state updates to ensure thread-safe modifications.
*   **Logging:** Uses the LoggerService for informational logging (enabled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO).
*   **Configuration:**  Retrieves state configurations from the StateSchemaService and applies persistence via PersistStateAdapter or GLOBAL_CONFIG defaults.

The service offers methods for:

*   **Setting State:** `setState` allows setting the shared state using a dispatch function, delegating to ClientState and handling serialization.
*   **Clearing State:** `clearState` resets the shared state to its initial value, also delegating to ClientState.
*   **Retrieving State:** `getState` retrieves the current shared state, similarly delegating to ClientState.

It relies on injected dependencies such as the LoggerService, BusService, MethodContextService, and StateSchemaService, and utilizes functools-kit’s memoize for caching.  The service supports ClientAgent state updates and aligns with the event system of AgentConnectionService.

## Class SessionValidationService

The SessionValidationService is responsible for managing and verifying the existence and usage of sessions within the swarm system. It meticulously tracks each session’s associations with swarms, modes, agents, histories, and storage, ensuring that resources are utilized correctly and consistently.

This service integrates seamlessly with several key components, including SessionConnectionService, ClientSession, ClientAgent, ClientStorage, and ClientState, facilitating robust session management.  It leverages dependency injection for the logger and memoization to optimize validation checks for performance.

Key functionalities include:

*   **Session Registration:** The `addSession` method registers new sessions, logging the operation and ensuring uniqueness.
*   **Resource Tracking:** Methods like `addAgentUsage`, `addHistoryUsage`, `addStorageUsage`, and `addStateUsage` track the usage of agents, histories, storage, and states within each session.
*   **Data Retrieval:**  Methods such as `getSessionMode`, `getSwarm`, `getSessionAgentList`, `getSessionHistoryList`, and `getSessionList` provide access to session information.
*   **Validation:** The `validate` method performs existence checks, utilizing memoization for efficiency.
*   **Cleanup:** The `removeSession` and `dispose` methods handle session removal and resource cleanup.

The service provides essential validation capabilities, supporting session lifecycle management and ensuring data integrity within the swarm environment.

## Class SessionPublicService

This `SessionPublicService` class acts as the central interface for interacting with a session within the swarm system. It implements the `TSessionConnectionService` to provide a public API, delegating core session operations to the `SessionConnectionService`.  The service is designed to wrap these operations with contextual information using `MethodContextService` and `ExecutionContextService` for robust scoping and tracking.

Key integrations include: `ClientAgent` for session-level messaging and tool execution, `AgentPublicService` for broader swarm context emission, `PerfService` for detailed execution metrics and session state tracking, `BusService` for event emission related to session lifecycle events, and `SwarmMetaService` to access swarm-level context via the `swarmName`.

The class utilizes a `LoggerService` (enabled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`) for informational logging, providing consistent logging patterns across the service and its dependencies.  Methods like `emit`, `execute`, `run`, and `connect` leverage the `SessionConnectionService` for the actual session interactions.

The `connect` method is particularly important, integrating with `ClientAgent`, `PerfService`, and `BusService` to manage the session lifecycle and capture performance data.  Furthermore, the service supports committing tool outputs, system messages, assistant messages, and user messages to the session's history, mirroring functionality within `AgentPublicService` and facilitating tracking by `PerfService`.  Methods like `commitFlush`, `commitStopTools`, and `dispose` provide control over the session's state and resource cleanup.

## Class SessionConnectionService

**The SessionConnectionService is the core component for managing individual sessions within your AI agent swarm.** Think of it as the central hub for interacting with a specific AI agent's workflow. It's designed to be efficient by caching session instances, so you don't repeatedly create them.

**Here's what it does:**

*   **Creates and Manages Sessions:** It handles the creation, retrieval, and disposal of sessions, which are essentially the contexts for an agent's interactions (like a conversation with a chatbot).
*   **Efficient Caching:**  It uses a cache to avoid redundant session creation, speeding up interactions.
*   **Handles Communication:** It provides methods for sending messages to and receiving responses from the agent within the session. This includes sending tool outputs, system messages, and user prompts.
*   **Integrates with Other Components:** It works closely with other parts of the swarm, such as the agent itself (through methods like `connect`, `commitToolOutput`, etc.) and the swarm's history tracking system.
*   **Clean Shutdown:** It ensures that sessions are properly closed and resources are released when they're no longer needed.

**Key Features:**

*   **Caching:**  The service uses a cache to store session instances, reducing overhead.
*   **Flexible Communication:** It offers various methods for sending and receiving data, including tool outputs, system messages, and user prompts.
*   **Robust Integration:** It’s designed to seamlessly integrate with other swarm components.

**In essence, the `SessionConnectionService` is the workhorse for managing individual AI agent sessions, providing a reliable and efficient way to interact with them.**

## Class SchemaUtils

The SchemaUtils class offers a set of tools focused on managing data within client sessions and converting objects to strings. It provides methods for writing data to a client’s session memory, ensuring the session is valid before the operation.  You can use `writeSessionMemory` to store data, and it’s designed to handle validation and logging.  Additionally, the class includes a `readSessionMemory` function to retrieve data from a client’s session, again with validation and logging built in. Finally, the `serialize` method converts objects – whether single objects or arrays of objects – into formatted strings. This method allows for flattening nested structures and applying custom key/value mapping functions during the serialization process for flexible output formatting.

## Class PolicyValidationService

The PolicyValidationService is a core component of the swarm system, responsible for ensuring the integrity of policies. It maintains a record of all registered policies, verifying their uniqueness and availability. This service works closely with several other systems: the PolicySchemaService for initial policy registration, the ClientPolicy system for enforcement, and the AgentValidationService for potential agent-level checks.

The service utilizes dependency injection to manage logging, leveraging the `loggerService` and controlling logging levels via `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`.  A central `_policyMap` stores policy names linked to their schemas, facilitating efficient validation checks.

The `validate` method is the primary function, employing memoization to quickly determine if a policy name exists within the map. This method also logs the validation attempt and supports the broader policy enforcement process managed by the ClientPolicy system. The `addPolicy` method is used to register new policies, ensuring they are added to the map and integrating with the PolicySchemaService’s registration workflow.

## Class PolicyUtils

The PolicyUtils class offers a set of tools for managing client bans as part of a swarm policy. It provides methods to reliably handle banning, unbanning, and checking for bans, all within the context of a swarm policy.

Key functionalities include:

*   **`banClient`**: This method allows you to ban a client under a defined policy within a specific swarm. It performs thorough validation of the client ID, swarm name, and policy name before sending the request to the policy service.
*   **`unbanClient`**:  This method reverses the `banClient` operation, unbanning a client from a policy within a swarm. Like `banClient`, it validates the input data.
*   **`hasBan`**: This method checks whether a client is currently banned under a given policy within a swarm. It also validates the input parameters before querying the policy service.

All operations within PolicyUtils are designed to be robust and trackable, incorporating validation and logging for comprehensive monitoring.

## Class PolicySchemaService

The PolicySchemaService is the central component for managing policy definitions within the swarm system. It acts as a registry, storing and retrieving IPolicySchema instances using a ToolRegistry for efficient management.  The service performs shallow validation of each schema, ensuring key elements like the `policyName` and `getBannedClients` function are present and valid.

It integrates closely with other services, including PolicyConnectionService, ClientAgent, SessionConnectionService, and PolicyPublicService, providing a consistent policy framework.  A LoggerService is integrated to record information-level logging (controlled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`) during operations like registration, retrieval, and validation.

The service utilizes a ToolRegistry to store schemas, and new schemas are added via the `register` method after validation.  Retrieval of schemas is handled through the `get` method, ensuring that the correct policy logic is available for enforcement across the swarm.  This foundational service is crucial for defining and applying access control rules and restrictions.


## Class PolicyPublicService

The PolicyPublicService acts as a central interface for managing public policy operations within the swarm system. It extends the `TPolicyConnectionService` to provide a public API, delegating the core policy logic to the `PolicyConnectionService`. This service wraps these calls with the `MethodContextService` to manage the scope of operations and utilizes the `LoggerService` for logging information-level events, controlled by the `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` setting.

Key functionalities include checking if a client is banned (`hasBan`), retrieving ban messages (`getBanMessage`), validating both incoming and outgoing data (`validateInput`, `validateOutput`), and directly banning or unbanning clients (`banClient`, `unbanClient`). These operations are all integrated with other system components such as `PerfService` (for policy enforcement in compute client state), `ClientAgent` (for validation and restrictions during execution), `DocService` (for policy documentation), and `SwarmMetaService` (for swarm context).

The service relies on the `PolicyConnectionService` for the underlying policy checks and manipulations, while the `MethodContextService` ensures proper context management. Logging is consistently handled via the `LoggerService` when `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` is enabled, aligning with the logging patterns of `AgentPublicService` and `DocService`.

## Class PolicyConnectionService

The PolicyConnectionService is a core component within the swarm system, designed to manage policy connections and operations. It implements the `IPolicy` interface, providing a structured way to handle policy instances, ban status checks, and input/output validation, all scoped to a specific policy name, client ID, and swarm name.

This service integrates with several other key components, including the ClientAgent for policy enforcement, SessionPublicService for session-level policy management, and PolicyPublicService for public API access. It also leverages the SwarmPublicService for context and the PerfService for performance tracking via the BusService.

A key feature is the use of memoization, achieved through functools-kit’s memoize, to efficiently cache `ClientPolicy` instances by policy name. This dramatically reduces the overhead of creating new policy instances repeatedly. The service utilizes a LoggerService for informational logging (controlled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`) and coordinates with the PolicySchemaService for retrieving policy configurations and the BusService for event emission.

The service offers several methods for managing policy interactions. The `getPolicy` method retrieves or creates a memoized `ClientPolicy` instance, configuring it with schema data from the PolicySchemaService and defaulting autoBan to `GLOBAL_CONFIG.CC_AUTOBAN_ENABLED_BY_DEFAULT` if not explicitly specified.  It supports the ClientAgent’s execution restrictions and SessionPublicService’s policy enforcement.

The `hasBan`, `getBanMessage`, `validateInput`, and `validateOutput` methods provide functionality for checking bans, retrieving ban messages, validating incoming and outgoing data, respectively, all while leveraging the context from the MethodContextService for accurate policy application and logging via the LoggerService when logging is enabled. These methods mirror the functionality of PolicyPublicService, supporting ClientAgent’s execution restrictions and SessionPublicService’s policy checks.

Finally, the `banClient` and `unbanClient` methods allow for the programmatic banning and unbanning of clients from specific swarms, again leveraging the context from the MethodContextService and logging via the LoggerService. These methods align with PolicyPublicService’s ban management capabilities, supporting ClientAgent’s enforcement actions and SessionPublicService’s policy actions.

## Class PersistSwarmUtils

The `PersistSwarmUtils` class provides a foundational toolkit for managing persistent data related to AI agent swarms. It implements the `IPersistSwarmControl` interface, offering utilities to reliably store and retrieve information about active agents and their navigation stacks.  This class centralizes the management of these persistent states, ensuring consistency across the swarm.

Key functionalities include memoized storage creation for both active agents and navigation stacks, identified by the swarm name.  You can retrieve the active agent for a specific client within a swarm, with a default agent provided if one isn't already defined.  Similarly, it allows you to retrieve the navigation stack for a client and swarm.

Furthermore, `PersistSwarmUtils` allows for customization of the underlying persistence mechanism.  You can use the `usePersistActiveAgentAdapter` and `usePersistNavigationStackAdapter` methods to inject your own constructor, overriding the default `PersistBase` implementation and tailoring the persistence logic to your specific needs.  This provides flexibility and control over how agent and stack data is stored and managed within the swarm.


## Class PersistStorageUtils

The PersistStorageUtils class provides a flexible way to manage data persistence for individual clients, tied to specific storage names. It acts as a utility, offering methods to retrieve and store data, ensuring that each client has its own isolated storage instance. 

At its core, PersistStorageUtils utilizes a PersistStorageFactory to create storage instances.  A key feature is the `getPersistStorage` function, which memoizes the creation of storage instances, guaranteeing a single, consistent storage object is used for each storage name.

This class allows you to define your own storage persistence logic through the `usePersistStorageAdapter` method, letting you customize how data is saved and retrieved.  The `getData` method provides a convenient way to fetch data from a storage, with a default value provided if the data isn't already present. Finally, the `setData` method enables you to persist data, wrapping it within an `IPersistStorageData` structure for consistent handling.

## Class PersistStateUtils

This utility class, `PersistStateUtils`, is designed to manage and persist state information for individual clients, based on a defined state name. It acts as a central point for retrieving and updating state data, offering flexibility through a customizable persistence adapter.

The core functionality revolves around a memoized `getStateStorage` function, which guarantees that only one storage instance is created for each state name, preventing conflicts and ensuring data consistency.

You can use the `setState` method to save state data for a client, packaged within an `IPersistStateData` structure. Conversely, the `getState` method retrieves existing state data, providing a default value if the state hasn't been previously set.

Furthermore, the `usePersistStateAdapter` method allows you to replace the default persistence implementation with your own custom constructor, giving you control over how state data is stored and retrieved. This provides a robust and adaptable solution for managing state persistence within your application.

## Class PersistPolicyUtils

The PersistPolicyUtils class provides tools for managing policy data persistence within the AI agent swarm system. It acts as a utility, offering methods to retrieve and update a list of banned clients associated with a specific policy and swarm. 

At its core, it utilizes a `PersistPolicyFactory` and a memoized function, `getPolicyStorage`, to ensure a single, optimized persistence instance is created for each swarm. This function is responsible for creating or retrieving the policy data storage.

The class offers two primary methods: `getBannedClients`, which retrieves the current list of banned clients for a given policy and swarm, defaulting to an empty array if no bans are defined.  It also includes `setBannedClients`, which allows you to persistently update the banned client list for a policy and swarm.

Finally, the `usePersistPolicyAdapter` method allows you to customize the underlying persistence mechanism. You can provide a custom constructor to integrate with different storage options, such as in-memory or database-backed persistence, giving you greater control over how policy data is managed.


## Class PersistMemoryUtils

The PersistMemoryUtils class provides a flexible way to manage memory data for individual clients within an AI agent swarm. It acts as a central utility, offering methods to both store and retrieve memory information.  At its core, it utilizes a PersistMemoryFactory to create and manage storage instances, ensuring each client has its own dedicated storage.

The class offers a `setMemory` method to persistently save data for a client, packaged within an `IPersistMemoryData` structure. Conversely, the `getMemory` method retrieves existing memory, gracefully falling back to a specified default state if the data isn't already present.

Developers can customize the persistence mechanism by leveraging the `usePersistMemoryAdapter` method, allowing them to inject their own persistence logic through a custom constructor. Finally, the `dispose` method provides a clean way to release the memory storage associated with a specific client ID.

## Class PersistList

The PersistList class extends the base PersistBase structure to create a persistent, ordered list of entities. It uses numeric keys to maintain the order of items within the list.  

Key features include a `_lastCount` property that tracks the number of items in the list, and a unique function (`__@LIST_CREATE_KEY_SYMBOL@526`) to generate sequential numeric keys, even when multiple calls are happening simultaneously.  

The PersistList provides methods for adding and removing entities. The `push` method adds a new entity to the end of the list, assigning it a unique numeric key.  The `pop` method removes and returns the last entity from the list.  It also includes a `__@LIST_GET_LAST_KEY_SYMBOL@527` property to retrieve the key of the last item, and a `__@LIST_POP_SYMBOL@529` function to ensure atomic removal of the last item under concurrent conditions.

## Class PersistEmbeddingUtils

The PersistEmbeddingUtils class is a core tool within the AI agent swarm system, designed to handle the storage and retrieval of embedding data. It acts as a utility, providing methods to read and write embedding vectors, and crucially, it manages these operations with a flexible adapter. 

At its heart, PersistEmbeddingUtils utilizes a `PersistEmbeddingFactory` to create and manage individual persistence instances for each embedding, ensuring efficient resource utilization.  The `getEmbeddingStorage` function is a memoized retrieval mechanism, guaranteeing that only one persistence instance is active for a given embedding name.

Key functionalities include the `readEmbeddingCache` method, which checks the cache for existing embeddings based on their hash, and the `writeEmbeddingCache` method, which persists newly computed embeddings for later access.  

Finally, the `usePersistEmbeddingAdapter` method allows developers to customize the embedding persistence process by providing a custom constructor, enabling support for various storage options like in-memory or database-backed persistence, offering a high degree of control over the system’s data management.


## Class PersistBase

The PersistBase class serves as the foundation for persistent storage of your entities, managing their data within the file system. It’s designed to read and write entities as JSON files, providing a straightforward way to save and retrieve your data.

When you create a PersistBase instance, you specify the name of the entity you’re storing and the base directory where the files will be located.  The class maintains a directory path and uses it to manage all your entity files.

A key feature is the `waitForInit` method, which automatically initializes the storage directory if it doesn't exist.  Crucially, this method also validates existing entities, removing any that are corrupted or invalid during initialization.

The class offers several methods for interacting with your entities, including `readValue` to retrieve a specific entity by its ID, `writeValue` to save an entity, and `removeValue` to delete it.  It also provides `getCount` to determine the number of stored entities and `values` to iterate through all stored entities in sorted order by ID.

Furthermore, the PersistBase class implements the async iterator protocol, allowing you to efficiently process all stored entities.  You can filter and take a limited number of entities during iteration.  The class ensures data integrity through atomic file writing and handles validation and cleanup of your storage directory.


## Class PersistAliveUtils

The PersistAliveUtils class provides a core mechanism for managing client availability within the swarm system. It implements the `IPersistAliveControl` interface, offering a centralized way to track whether each client (`SessionId`) is currently online.

At its heart, PersistAliveUtils utilizes a `PersistAliveFactory` to create and manage individual persistence instances for each client.  A memoized `getAliveStorage` function ensures that only one persistence object is created per client ID, improving efficiency.

Key methods include `markOnline` and `markOffline`, which allow you to update a client’s status, persisting the change for future checks.  The `getOnline` method retrieves the current online status, defaulting to `false` if no status has been set.

Finally, the `usePersistAliveAdapter` method allows for flexible configuration. You can supply a custom constructor (`Ctor`) to tailor the persistence behavior, such as using in-memory storage or integrating with a database, providing a highly adaptable solution for managing client availability within the swarm.

## Class PerfService

**Overall Design & Purpose**

The `PerformanceTracker` class is designed to meticulously track the performance of individual clients (and potentially the entire system) during execution. It's a central component for gathering metrics related to:

*   **Execution Time:** How long each execution takes.
*   **Input/Output Data:** The size of data being processed.
*   **State Information:**  Potentially, memory usage or other system state.
*   **Frequency:** How often a client is executing.

It appears to be heavily influenced by the `ClientAgent` pattern, suggesting it's used to monitor and debug client-side execution.

**Key Components & Their Roles**

*   **Maps (executionData, activeSessions):** The core of the tracker. These maps store the performance data for each client, allowing for efficient retrieval and aggregation.
*   **`startExecution`:**  Marks the beginning of an execution, initializing the relevant data structures and incrementing counters.
*   **`endExecution`:**  Calculates the execution time, updates the data maps, and signals the end of the execution.
*   **`toClientRecord` & `toRecord`:**  Aggregate the client-specific data into a higher-level performance record for reporting or analysis.
*   **`getActiveSessions`:**  Provides a list of active client IDs, useful for monitoring session activity.
*   **`dispose`:**  Crucial for cleanup, releasing resources and resetting data when a client's session ends.

**Strengths of the Design**

*   **Detailed Tracking:** The use of maps allows for granular tracking of various performance metrics.
*   **Client-Centric:**  The design is clearly focused on monitoring individual client executions.
*   **Integration with `ClientAgent`:** The design aligns well with the `ClientAgent` pattern, suggesting a common use case.
*   **Resource Management:** The `dispose` method is essential for preventing memory leaks and ensuring proper resource cleanup.

**Potential Improvements & Considerations**

1.  **Error Handling:** The code lacks explicit error handling.  `endExecution` should handle potential errors during the execution and log them appropriately.  Consider adding try/catch blocks.

2.  **Concurrency:** If multiple threads or processes are using this tracker, you'll need to implement proper synchronization (e.g., locks) to prevent race conditions when updating the maps.

3.  **Logging:**  More detailed logging would be extremely helpful for debugging and monitoring.  Log key events (start/end of execution, errors, etc.).  Use a logging framework (e.g., Winston, Bunyan) for structured logging.

4.  **Configuration:**  Consider making some parameters (e.g., logging level, default timeout values) configurable.

5.  **Metrics Granularity:**  Think about what other metrics might be useful to track (e.g., CPU usage, memory usage, network latency).

6.  **Testing:**  Write thorough unit tests to verify the correctness of the `startExecution`, `endExecution`, and `toClientRecord` methods.  Consider integration tests to simulate client-side execution.

7.  **Data Structures:**  For very high-volume tracking, you might explore more efficient data structures than simple JavaScript objects.

8.  **Time Synchronization:**  If you're collecting performance data across multiple systems, ensure that the clocks are synchronized to avoid discrepancies.

**Example Use Case Scenario**

Imagine a system where you're monitoring the performance of a web application.  The `PerformanceTracker` would be used to:

1.  When a user requests a page, the `PerformanceTracker` is initialized for that user.
2.  The `ClientAgent` (or equivalent) starts the execution.
3.  The `startExecution` method is called, recording the start time and input length (e.g., the size of the request).
4.  The web server executes the request.
5.  The `endExecution` method is called, calculating the execution time and updating the performance data.
6.  When the request is complete, the `toClientRecord` method is called to generate a performance report for that user.
7.  The `dispose` method is called to clean up the tracking data for that user.

**In summary, this `PerformanceTracker` class is a solid foundation for monitoring client-side execution.  With a few enhancements (error handling, concurrency, logging), it can be a powerful tool for debugging, performance analysis, and system optimization.**

To help me refine my response further, could you tell me:

*   What programming language is this class written in?
*   What is the overall architecture of the system where this `PerformanceTracker` is used?
*   Are there any specific performance metrics you're particularly interested in tracking?

## Class MemorySchemaService

The MemorySchemaService is a core component designed to manage temporary in-memory data for individual sessions within the swarm system. It functions as a simple key-value store, utilizing a Map to associate each session’s unique identifier – represented as a `clientId` – with any arbitrary object. This service provides a lightweight, non-persistent layer for session-scoped data, distinct from more persistent storage mechanisms.

The service relies on a `loggerService` for logging operations at the INFO level, controlled by the `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` setting, ensuring consistency with logging patterns used by other services like SessionConnectionService and PerfService.  The primary data storage is handled through the `memoryMap`, a Map instance that stores these session-specific objects.

Key operations include `writeValue`, which allows you to write data to the memory map for a given `clientId`, merging the new value with any existing data using `Object.assign`.  Also available is `readValue`, which retrieves data from the `memoryMap` based on the `clientId`, returning an empty object if no data exists for that session. Finally, the `dispose` method removes the session’s data from the `memoryMap` when a session is terminated or reset. This service is designed to support ClientAgent’s runtime memory needs and aligns with the data access patterns of SessionPublicService and SessionConnectionService.

## Class LoggerService

The LoggerService provides centralized logging functionality throughout the AI agent swarm system. It implements the `ILogger` interface, enabling the recording of log, debug, and info messages with detailed context.  The service leverages `MethodContextService` and `ExecutionContextService` to attach method-level and execution-level metadata, respectively, ensuring traceability across different components like `ClientAgent`, `PerfService`, and `DocService`.

It routes logs to both a client-specific logger (determined by `GLOBAL_CONFIG.CC_GET_CLIENT_LOGGER_ADAPTER`) and a common logger, offering flexibility in logging configurations controlled by flags like `GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG` and `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`.  The service supports runtime logger replacement via the `setLogger` method, allowing for dynamic configuration changes.

Key features include:

*   **Contextual Logging:**  Uses `MethodContextService` and `ExecutionContextService` to include relevant information like `clientId` in log messages.
*   **Client-Specific Routing:**  Logs are directed to a client-specific logger based on the client's ID.
*   **Runtime Configuration:**  The `setLogger` method enables dynamic control over the common logger.
*   **Flexible Levels:** Supports logging at normal, debug, and info levels, controlled by global configuration flags.

## Class LoggerInstance

The LoggerInstance is a core component designed to manage logging specifically for a particular client. It provides a flexible way to record events and messages, allowing for customization through callbacks.  The instance is initialized using a `clientId` to identify the client it’s serving, and configured with optional callbacks to tailor its behavior.

Key features include a `waitForInit` method that guarantees the logger is initialized only once, preventing redundant setup.  Logging functionality – including `log`, `debug`, and `info` – is controlled via the `GLOBAL_CONFIG` to manage console output.  Furthermore, a `dispose` method ensures proper cleanup when the logger is no longer needed, triggering a callback if one is defined.  This component offers a robust and configurable logging solution within the swarm orchestration framework.


## Class HistoryPublicService

This `HistoryPublicService` class manages public history operations within the swarm system. It implements `THistoryConnectionService` to provide a public API for interacting with agent history. The service delegates core history operations to `HistoryConnectionService`, utilizing `MethodContextService` for scoped context management.

Key functionalities include:

*   **Logging:**  It leverages a `LoggerService` (enabled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`) for consistent logging patterns, mirroring those used by `AgentPublicService` and `DocService`.
*   **Pushing Messages:** The `push` method adds messages to an agent’s history, utilizing `MethodContextService` and the `LoggerService` for context and logging. This is used in scenarios like `AgentPublicService`’s `commitSystemMessage` and `commitUserMessage` operations, as well as `ClientAgent`’s `EXECUTE_FN` message logging.
*   **Popping Messages:** The `pop` method retrieves the most recent message from an agent’s history, again employing `MethodContextService` and the `LoggerService`. It’s utilized in `ClientAgent`’s `EXECUTE_FN` context preparation and `AgentPublicService`’s history manipulation.
*   **Converting to Arrays:** The `toArrayForAgent` method converts an agent’s history into an array, incorporating a prompt for agent processing. This is used in `ClientAgent`’s `EXECUTE_FN` context preparation and `DocService`’s history documentation. The `toArrayForRaw` method provides a raw array of history items, used in `ClientAgent`’s raw history access and `PerfService`’s performance metrics.
*   **Disposing Resources:** The `dispose` method cleans up resources associated with an agent’s history, aligning with `AgentPublicService` and `PerfService`’s disposal mechanisms.

The service is configured with injected dependencies: a `LoggerService` and a `HistoryConnectionService`.  These dependencies are crucial for logging and underlying history management, respectively.  The `MethodContextService` is used to manage the scope of operations within the history.

## Class HistoryPersistInstance

The `HistoryPersistInstance` class provides a persistent history management system for AI agents. It stores message history in both memory and on disk, ensuring data is retained across agent restarts. 

The class is initialized with a client ID and a set of callback functions for handling events like message additions and removals.  It manages this history using an internal array and a persistent storage mechanism.

Key functionalities include initializing the history for a specific agent, iterating through the stored messages with optional filtering, adding new messages to the history and persisting them to storage, and retrieving the last message.  The `dispose` method allows for cleaning up the history data when an agent is no longer needed.  Callbacks are provided for events like message pushes, changes, and disposals, offering flexibility in handling these actions.

## Class HistoryMemoryInstance

The HistoryMemoryInstance is a core component of the AI agent swarm orchestration framework, designed to manage an in-memory record of messages. It operates without persistent storage, focusing on immediate message tracking.

The class is initialized with a unique `clientId` and an optional set of callbacks, allowing for customization of behavior.  It maintains an internal array of `IModelMessage` objects.

Key functionalities include initializing the history for a specific agent using the `waitForInit` method, which ensures the initialization process only happens once per agent.  The `iterate` method provides an asynchronous iterator for accessing the history, applying any configured filters and system prompts during the process and triggering `onRead` callbacks if they are defined.

The `push` method adds new messages to the history, and the `pop` method retrieves and removes the last message. Both methods can trigger `onPush` and `onChange` callbacks respectively. Finally, the `dispose` method clears the history data when the agent is no longer needed, again utilizing callbacks if configured.

## Class HistoryConnectionService

The HistoryConnectionService manages history connections for agents within the swarm system. It implements the `IHistory` interface to provide a structured way to handle message storage, manipulation, and conversion, specifically scoped to a client ID and agent name. This service integrates with several other components, including ClientAgent for history within agent execution, AgentConnectionService for history provisioning, HistoryPublicService for a public history API, SessionPublicService, and PerfService for performance tracking via the BusService.

To optimize performance, the service utilizes memoization via functools-kit’s memoize, caching `ClientHistory` instances by a composite key (clientId-agentName) to avoid redundant creation. It leverages the LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) and coordinates with SessionValidationService and BusService.

The `getHistory` method retrieves or creates a memoized `ClientHistory` instance. It initializes the history with data from GLOBAL_CONFIG.CC_GET_AGENT_HISTORY_ADAPTER and integrates with SessionValidationService. The `push` method adds messages to the agent’s history, delegating to `ClientHistory.push` and utilizing the MethodContextService for context. The `pop` method retrieves the most recent message from the history, mirroring the functionality of HistoryPublicService.

Furthermore, the `toArrayForAgent` and `toArrayForRaw` methods convert the agent’s history into arrays, supporting agent-specific formatting and raw data extraction. The `dispose` method cleans up resources, clearing the memoized instance and updating SessionValidationService, aligning with the logging patterns of HistoryPublicService and PerfService.

## Class EmbeddingValidationService

The EmbeddingValidationService is a core component of the swarm system, responsible for ensuring the integrity of embedding names. It maintains a central map of all registered embeddings and their associated schemas, guaranteeing uniqueness and verifying their existence. 

This service works closely with several other key systems: the EmbeddingSchemaService for initial registration, ClientStorage for validating embeddings used in similarity searches, and AgentValidationService for potential agent-level validation. 

The service utilizes dependency injection to manage logging, allowing for controlled info-level logging based on GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO, and employs memoization to optimize the performance of validation checks by caching results based on the embedding name. 

Key functionalities include registering new embeddings via the `addEmbedding` method, which logs the operation and integrates with the EmbeddingSchemaService, and validating existing embeddings using the `validate` method, which efficiently checks for existence and supports validation within ClientStorage.


## Class EmbeddingSchemaService

The EmbeddingSchemaService is the central component for managing embedding logic within the swarm system. It acts as a registry, storing and retrieving IEmbeddingSchema instances using a ToolRegistry for efficient management.  The service performs shallow validation of each schema, ensuring that required fields like `embeddingName`, `calculateSimilarity`, and `createEmbedding` are present and valid.

It integrates closely with other services, including StorageConnectionService and SharedStorageConnectionService, providing the embedding definitions used for storage similarity searches.  The service utilizes a LoggerService for logging operations at the info level, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting, mirroring logging patterns in related services.

The service’s core functions are registration and retrieval.  The `register` method adds new schemas to the registry after validation, while the `get` method retrieves existing schemas based on their name.  Ultimately, this service is crucial for supporting storage operations and similarity searches across the swarm ecosystem.


## Class DocService

The DocService is a core component responsible for generating and writing comprehensive documentation for the entire swarm system. It handles documentation for swarms, individual agents, and performance data, primarily outputting Markdown files for easy understanding.  This service leverages a thread pool (THREAD_POOL_SIZE) to manage concurrent documentation generation, enhancing efficiency.

Key functionalities include generating UML diagrams for both swarms and agents using PlantUML, and creating JSON files for performance metrics using the PerfService.  The service integrates with ClientAgent by documenting its schema and performance data.  It relies on a loggerService (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) for detailed logging of its activities.

The DocService organizes its output into a structured directory hierarchy (SUBDIR_LIST) and provides methods for generating documentation for all swarms and agents simultaneously (dumpDocs) or for specific clients (dumpClientPerfomance).  It utilizes several supporting services, including swarmSchemaService, agentSchemaService, and toolSchemaService, to retrieve detailed schema information.  Furthermore, it includes services for generating UML diagrams (agentMetaService, swarmMetaService) and for dumping performance data (dumpPerfomance, dumpClientPerfomance).  The service’s core methods, such as writeSwarmDoc and writeAgentDoc, are executed within the thread pool, ensuring efficient documentation generation.

## Class CompletionValidationService

The CompletionValidationService is a core component of the swarm system, responsible for ensuring the integrity of completion names. It maintains a record of all registered completion names, actively checking for uniqueness during registration and validating their existence when requested.  

This service integrates closely with several other key systems: it works with the CompletionSchemaService to manage new registrations, collaborates with the AgentValidationService to confirm completion validity for agents, and utilizes the ClientAgent for completion usage.  

The service employs dependency injection, specifically using a logger service controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO, and leverages memoization to optimize validation checks by completion name.  The `validate` function is the primary method for checking completion existence, and the `addCompletion` function handles the registration process, logging each operation for tracking and error reporting.

## Class CompletionSchemaService

The CompletionSchemaService is the central component for managing all completion schemas within the swarm system. It acts as a registry, storing and retrieving ICompletionSchema instances using a ToolRegistry from functools-kit. This registry ensures the integrity of the schemas through shallow validation, checking that each schema has a required completionName and a valid getCompletion function – crucial for the execution of agents.

The service integrates closely with several other services, including AgentSchemaService, ClientAgent, AgentConnectionService, and SwarmConnectionService. It leverages a LoggerService for logging operations at the info level, controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.

Key functionalities include registering new schemas via the `register` method, which validates them before adding them to the registry, and retrieving schemas by their name using the `get` method.  The service’s design supports the core execution patterns of the swarm, particularly those used by ClientAgent and AgentConnectionService, ensuring that agents have access to the correct completion logic.


## Class ClientSwarm

The ClientSwarm class implements the `ISwarm` interface and manages a collection of agents within a swarm. It handles agent switching, output waiting, and navigation stack management, utilizing a BusService for event emission and queued operations.

Key features include:

*   **Agent Management:**  The class manages agent references through `params.agentMap` and utilizes `setAgentRef` to update these references, triggering notifications via the `_agentChangedSubject`.
*   **Output Handling:** The `waitForOutput` method waits for output from the active agent, ensuring only one wait operation runs at a time and supports cancellation via the `_cancelOutputSubject`.
*   **Navigation Stack:** The `_navigationStack` tracks the sequence of agent names, managed by `navigationPop` (to remove the last agent) and `setAgentName` (to push new agents).
*   **Event-Driven Updates:** The `BusService` is used to emit events related to agent changes and output cancellations, enabling coordinated interactions between swarm components.

Specific properties and methods:

*   `_agentChangedSubject`: A `Subject` that emits when the agent reference changes, providing the agent name and instance. This is used by `setAgentRef` to notify subscribers like `waitForOutput`.
*   `_activeAgent`:  The name of the currently active agent, initially set to `AGENT_NEED_FETCH` and lazily populated via `params.getActiveAgent`.
*   `_navigationStack`: The navigation stack of agent names, initially set to `STACK_NEED_FETCH` and managed by `navigationPop` and `setAgentName`.
*   `_cancelOutputSubject`: A `Subject` that emits to cancel output waiting, providing an empty output string and agent name.
*   `waitForOutput()`: Waits for output from the active agent, delegating to a `WAIT_FOR_OUTPUT_FN` and handling cancellation and agent changes.
*   `navigationPop()`: Pops the most recent agent from the navigation stack, falling back to the default agent if empty.
*   `cancelOutput()`: Cancels the current output wait by emitting an empty string via the `_cancelOutputSubject`.
*   `getAgentName()`: Retrieves the name of the active agent, lazily fetching it via `params.getActiveAgent` and emitting an event via `BusService`.
*   `getAgent()`: Retrieves the active agent instance (ClientAgent) based on its name from `params.agentMap`, emitting an event via `BusService`.
*   `setAgentRef(agentName, agent)`: Updates the reference to an agent in the swarm’s agent map, notifying subscribers via `_agentChangedSubject`.
*   `setAgentName(agentName)`: Sets the active agent by name, updates the navigation stack, and persists the change.

## Class ClientStorage

The ClientStorage class is a core component within the AI agent swarm system, designed to manage storage operations with a focus on embedding-based search. It implements the `IStorage<T>` interface, providing functionalities for upserting, removing, clearing, and searching items within the swarm.

Key aspects of the ClientStorage include its integration with several services: StorageConnectionService for instantiation, EmbeddingSchemaService for generating embeddings, ClientAgent for data persistence, SwarmConnectionService for swarm-level storage, and BusService for event emission.

The class utilizes an internal `_itemMap` (a Map) to efficiently store and retrieve items based on their unique IDs, facilitating fast updates and retrievals.  A `dispatch` method queues storage actions (upsert, remove, clear) for sequential execution, ensuring thread-safe updates from the ClientAgent or other tools.

The `_createEmbedding` method is responsible for generating embeddings for items, employing memoization via a `ClearableMemoize` interface to avoid redundant calculations. This is managed by the `CREATE_EMBEDDING_FN` and ensures embeddings are always fresh.

The `waitForInit` method waits for the storage to initialize, loading initial data and creating embeddings. This is a `ISingleshotClearable` ensuring initialization happens only once, synchronized with the lifecycle of the StorageConnectionService.

The `take` method performs similarity searches, retrieving a specified number of items based on a search string. It leverages embeddings and a `SortedArray` to execute similarity calculations concurrently, respecting global configuration settings.  It emits events via BusService, supporting the execution of search-driven tools by the ClientAgent.

The `upsert`, `remove`, and `clear` methods queue storage operations for sequential execution, supporting the ClientAgent’s data persistence and management needs.

The `get` method provides a direct lookup of an item from the `_itemMap`, emitting an event via BusService for quick access by the ClientAgent or other tools.

The `list` method lists all items in the storage, optionally filtered by a provided predicate, emitting a filtered result via BusService if a filter is used.

Finally, the `dispose` method cleans up the storage instance, invoking a disposal callback and logging events via BusService, ensuring proper resource cleanup when the storage is no longer required, synchronized with the StorageConnectionService.


## Class ClientState

The ClientState class is a core component of the swarm system, responsible for managing a single state object and facilitating its interaction with the broader swarm. It implements the `IState<State>` interface, providing a centralized location for handling state data, queued read and write operations, and event-driven updates.

This class integrates seamlessly with several key services: StateConnectionService for state instantiation, ClientAgent to drive state-driven behavior, SwarmConnectionService for managing swarm-level state, and BusService for emitting events.

The `ClientState` manages its state data within the `_state` property, initially set to null and populated during the `waitForInit` process.  The `dispatch` function is central to its operation, queuing actions to read or write the state, delegating to a defined dispatch function, and ensuring thread-safe access.

Key methods include `setState`, which allows you to update the state using a provided dispatch function, triggering middleware and persisting the changes.  `clearState` resets the state to its initial value, also persisting the result and emitting events.  The `getState` method retrieves the current state, similarly triggering events. Finally, the `dispose` method handles cleanup and resource release when the state is no longer needed, integrating with StateConnectionService.


## Class ClientSession

The ClientSession is a core component within the AI agent swarm system, acting as a client interface for interacting with the swarm. It implements the `ISession` interface, managing message execution, emission, and agent interactions. The session relies on several services for its operation, including ClientPolicy for validation, BusService for event-driven communication, and SessionConnectionService for instantiation and lifecycle management.

Key functionalities include emitting validated messages to subscribers via a Subject, executing messages using the swarm’s agent (ClientAgent) while enforcing policies, and committing tool and user messages to the agent’s history. The session integrates with services like SwarmConnectionService to access agents and the swarm, and ClientPolicy to ensure message validity.

The `emit` method sends validated messages to subscribers, while the `execute` method runs messages through the agent, validating them against the policy and logging any failures via BusService.  `run` provides a stateless execution path, and `commitToolOutput` and `commitUserMessage` methods manage the agent’s history.  `commitFlush` allows resetting the agent’s state, and `commitStopTools` provides session-level control over tool execution. `commitSystemMessage` and `commitAssistantMessage` handle system and assistant messages respectively.

The `connect` method establishes a real-time connection to the swarm, subscribing to emitted messages and enabling bidirectional communication. Finally, the `dispose` method cleans up resources and handles session lifecycle events.  This integration with various services ensures robust and flexible operation within the AI agent swarm.

## Class ClientPolicy

The ClientPolicy class implements the IPolicy interface, acting as a central component for managing security and restrictions within the AI agent swarm system. It handles client bans, meticulously validating both incoming and outgoing messages to ensure compliance with swarm-level policies. 

This policy operates with a lazy-loaded ban list, fetched only when needed through the `hasBan` method, and integrates seamlessly with the PolicyConnectionService for instantiation and the SwarmConnectionService to enforce swarm-level restrictions. 

Key functionalities include automated banning based on validation failures, configurable ban messages, and event emission via the BusService. The `validateInput` and `validateOutput` methods are crucial for filtering messages processed by the ClientAgent, while the `banClient` and `unbanClient` methods provide dynamic control over client access.  The policy’s design allows for flexible adaptation to changing swarm requirements and provides a robust mechanism for maintaining security and compliance within the swarm.


## Class ClientHistory

The ClientHistory class provides a robust mechanism for managing the conversation history within the swarm system. It implements the `IHistory` interface, offering storage, retrieval, and filtering of client messages, primarily used by the ClientAgent. 

This class integrates seamlessly with several key services, including HistoryConnectionService for initial instantiation, ClientAgent for logging and completion context, BusService for event emission, and SessionConnectionService for tracking session history. 

The history is tailored to each agent’s needs using a filter condition defined in GLOBAL_CONFIG.CC_AGENT_HISTORY_FILTER, allowing for the exclusion of irrelevant messages.  It supports both raw message access via `toArrayForRaw` and agent-specific message arrays generated by `toArrayForAgent`, which incorporates prompts, system messages, and tool call consistency checks. 

When the ClientAgent is disposed, the `dispose` method ensures proper resource management by releasing resources and performing cleanup, coordinating with HistoryConnectionService.  The class provides methods for pushing new messages into the history, popping the most recent message, and converting the history into various formats for different use cases.


## Class ClientAgent

The ClientAgent is a core component of the AI agent swarm system, designed to handle individual agent interactions. It manages the execution of messages, including tool calls, ensuring that operations are performed in a controlled, queued manner to prevent conflicts.

Here’s a breakdown of its key features:

*   **Message Processing:** The ClientAgent receives incoming messages and processes them, intelligently managing tool calls as needed.
*   **Queued Execution:** To avoid overlapping operations, all message processing and tool calls are executed in a queue, guaranteeing that each step completes before the next begins.
*   **Integration with Services:** It seamlessly connects with several services, including the AgentConnectionService, HistoryConnectionService, ToolSchemaService, CompletionSchemaService, and SwarmConnectionService, enabling communication and coordination within the swarm.
*   **Error Recovery:** The agent incorporates robust error recovery mechanisms, particularly through the `_resurrectModel` function, to handle model failures and ensure continued operation.
*   **Event Management:** It utilizes `functools-kit`’s Subjects for asynchronous state management, emitting events via the BusService to keep other components informed of changes.
*   **Output Emission:** The `_emitOutput` function handles the transformation and emission of outputs, supporting broadcasting within the swarm via the SwarmConnectionService.

The ClientAgent provides a robust and flexible foundation for building intelligent agents within a collaborative swarm environment.

## Class BusService

The BusService is the core component responsible for managing event communication within the swarm system. It implements the IBus interface, providing methods for subscribing to and emitting events, alongside managing resources efficiently. The service utilizes a Subject-based architecture, employing memoized Subjects for each client and event source combination to optimize performance and reduce memory overhead.

Key functionalities include subscribing to events triggered by ClientAgents (like execution events), tracking execution metrics through integration with PerfService, and logging event activity via the LoggerService, all while ensuring session validity through the SessionValidationService. The BusService supports wildcard subscriptions (using clientId="*") to enable broad event distribution, particularly useful for system-wide monitoring.

The `subscribe` method registers event sources and callbacks, while the `once` method allows for single-use event handling. The `emit` method broadcasts events to relevant subscribers, validating client sessions and integrating with PerfService for execution tracking.  Specific execution events are handled via `commitExecutionBegin` and `commitExecutionEnd` aliases, streamlining integration with ClientAgent and PerfService.

Finally, the `dispose` method cleans up subscriptions and Subjects, ensuring proper resource management and alignment with the lifecycle of ClientAgent sessions, contributing to overall system stability. The service leverages dependency injection for LoggerService and SessionValidationService, promoting modularity and testability.

## Class AliveService

The `AliveService` is responsible for tracking the online status of individual clients participating in a swarm. It offers methods to easily mark clients as either online or offline, directly within the swarm context.  The service utilizes a `PersistAliveAdapter` to reliably store these status changes, ensuring that the information is retained even across restarts.  Specifically, the `markOnline` method allows you to designate a client as active, while `markOffline` designates it as inactive. Both actions are logged for monitoring and debugging purposes, and the persistence of these changes is governed by the global configuration settings.

## Class AgentValidationService

The AgentValidationService is a core component within the swarm system, responsible for ensuring the integrity and compatibility of agents. It manages agent schemas and dependencies, providing methods to register agents and perform thorough validation checks.

This service utilizes dependency injection to manage its internal components, including the logger service, tool validation service, completion validation service, storage validation service, and AgentSchemaService.  It employs memoization techniques to optimize validation checks, improving performance.

The service maintains an internal agent map (_agentMap) to store agent schemas and a dependency map (_agentDepsMap) to track inter-agent relationships.  Key functionalities include retrieving lists of registered agents, retrieving storage and state lists associated with specific agents, and registering new agents with their corresponding schemas.

The `validate` method is central to the service, performing comprehensive validation of an agent’s configuration, including its schema, tools, completion, and storage.  It leverages the other validation services and memoization to efficiently process validation requests.  The service is designed to integrate seamlessly with other services like AgentSchemaService and SwarmSchemaService, facilitating a robust and scalable swarm management system.


## Class AgentSchemaService

The AgentSchemaService is the core service responsible for managing agent schemas within the swarm system. It acts as a central repository, utilizing the ToolRegistry from functools-kit to store and retrieve IAgentSchema instances.  The service performs shallow validation on each schema to ensure basic integrity – specifically checking that required fields like agentName, completion, and prompt are present, and that arrays for system, dependencies, states, storages, and tools contain unique string values.

It integrates closely with other services, including AgentConnectionService for agent instantiation, SwarmConnectionService for agent configuration, ClientAgent for schema-driven execution, and AgentMetaService for broader agent management.  The service leverages a LoggerService for logging operations at the info level, controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.

Key functionalities include registering new schemas using the `register` method, which validates them before adding them to the ToolRegistry, and retrieving existing schemas via the `get` method.  The `register` method is crucial for maintaining a consistent collection of agent schemas, and the `get` method supports the instantiation of agents through services like AgentConnectionService and ClientAgent.


## Class AgentPublicService

The `AgentPublicService` class provides a public API for interacting with a swarm of agents. It implements `TAgentConnectionService` to manage agent operations, delegating to `AgentConnectionService` and wrapping calls with `MethodContextService` for context scoping and logging.  The service integrates with `ClientAgent`, `PerfService`, `DocService`, and `BusService`.

Key functionalities include: creating agent references (`createAgentRef`), executing commands (`execute`, `run`, `waitForOutput`), committing tool and system messages (`commitToolOutput`, `commitSystemMessage`, `commitAssistantMessage`, `commitUserMessage`), flushing agent history (`commitFlush`), and managing agent changes (`commitAgentChange`).  Each operation is wrapped with `MethodContextService` for context scoping and utilizes the `LoggerService` for info-level logging (controlled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`).  The service supports various agent interactions, mirroring functionalities found in `ClientAgent` and `PerfService`, and provides eventing capabilities through `BusService`.  The `dispose` method cleans up resources, aligning with `PerfService` and `BusService`.  The service relies on injected dependencies, including `agentConnectionService` and `loggerService`.

## Class AgentMetaService

The AgentMetaService is a core component of the swarm system, responsible for managing and documenting agent metadata. It builds structured agent representations, known as IMetaNode trees, from agent schemas provided by the AgentSchemaService. These trees are then converted into UML format, primarily for visualization and documentation purposes, leveraging the DocService to generate diagrams like agent_schema_[agentName].svg.

The service utilizes a LoggerService for logging operations at the info level, controlled by the GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO setting, ensuring consistent logging across the system alongside DocService and PerfService.  It offers two primary methods for creating these meta nodes: `makeAgentNode` which generates detailed representations including dependencies, states, and tools, and `makeAgentNodeCommon` which focuses on dependency relationships.

The `toUML` method converts the generated meta node tree into a UML string, allowing for flexible subtree inclusion.  This functionality is crucial for the DocService, enabling the creation of agent documentation diagrams. The service integrates with ClientAgent and PerfService, providing context for agent metadata and supporting performance analysis.

## Class AgentConnectionService

This is an excellent and thorough breakdown of the `ClientAgent` class. You've accurately captured the key functionalities, delegation patterns, and logging considerations. Here's a further breakdown with some potential enhancements and considerations:

**Key Strengths of Your Analysis:**

* **Clear Delegation:** You've correctly identified the core pattern: delegating to `ClientAgent` for all actual execution and interaction with the underlying agent.
* **Logging:**  The emphasis on logging via `LoggerService` is crucial for debugging and monitoring.
* **Lifecycle Management:**  You've highlighted the importance of `dispose` for resource cleanup and cache invalidation.
* **Session Validation:**  The mention of `SessionValidationService` during disposal is a critical detail – ensuring the agent isn't used after it's been properly cleaned up.
* **Tool Execution Control:**  You've accurately described the various `commit...` methods for managing tool execution and agent state.

**Further Considerations and Potential Enhancements:**

1. **Caching Strategy:**  You've correctly identified the use of `functools.lru_cache` (or a similar mechanism) for memoization.  It's worth explicitly stating *why* this is beneficial:
   * **Performance:**  Reduces redundant calls to the `ClientAgent`, especially for frequently used functions.
   * **State Management:**  Ensures that the same `ClientAgent` instance is used for subsequent calls, maintaining consistent state.

2. **Error Handling:**  The description doesn't explicitly mention error handling.  It's vital to consider:
   * **`ClientAgent` Error Propagation:** How does the `ClientAgent` handle errors from the underlying agent?  Does it re-throw, return an error object, or handle it internally?
   * **Retry Logic:**  Should there be retry logic for transient errors?
   * **Error Logging:**  Detailed error logging is essential.

3. **Concurrency and Thread Safety:**  If this class is intended for use in a multi-threaded or asynchronous environment, you'll need to address concurrency issues.  This might involve:
   * **Locking:**  Protecting shared resources (e.g., the `ClientAgent` instance) with locks.
   * **Thread-Safe Data Structures:**  Using thread-safe data structures.

4. **`dispose` Details:**  Expand on the `dispose` method:
   * **Cache Invalidation:**  The most important step is clearing the memoization cache.
   * **Resource Release:**  The `ClientAgent` might have other resources (e.g., network connections) that need to be explicitly released.
   * **Session Validation Update:**  Updating the `SessionValidationService` to reflect the agent's disposal.

5. **Tool Output Format:**  The `commitToolOutput` methods suggest a structured format for tool output (e.g., JSON).  It would be helpful to clarify this.

6. **Agent State Management:**  The class seems to be managing the agent's state (e.g., tool execution control, system prompt updates).  It would be beneficial to describe how this state is represented and updated.

7. **Asynchronous Operations:**  The use of `waitForOutput` and other methods suggests asynchronous operations.  It's important to consider the implications for concurrency and error handling.

**Example of Enhanced Description (Focusing on `dispose`):**

"The `dispose` method is crucial for releasing resources and ensuring the agent is properly cleaned up.  It first checks if a `ClientAgent` instance exists in the memoization cache. If so, it invalidates the cache, removing the instance to prevent its accidental reuse.  It then calls `ClientAgent.dispose()`, which handles any necessary resource cleanup (e.g., closing network connections). Finally, it updates the `SessionValidationService` to reflect that the agent has been disposed of, preventing any subsequent operations from using a stale or invalid agent."

**Overall:**

Your analysis is excellent. By considering the points above, you can create an even more comprehensive and robust understanding of the `ClientAgent` class and its role in managing interactions with the underlying agent.  This level of detail is essential for designing and maintaining a reliable and performant system.


## Class AdapterUtils

The AdapterUtils class offers a flexible way to connect to different AI completion services. It provides utility functions, each designed to interact with a specific provider.

Specifically, it includes:

*   **fromOpenAI:** This function creates a callable that allows you to utilize OpenAI’s chat completions API, taking an OpenAI object and optional model and response format parameters.
*   **fromLMStudio:**  This function similarly generates a callable for interacting with LMStudio’s chat completions API, accepting an OpenAI object, model, and response format.
*   **fromOllama:** This function creates a callable for interacting with Ollama’s chat completions API, accepting an Ollama object and an optional tool call protocol.

These functions provide a consistent interface for interacting with these diverse AI completion platforms.


# agent-swarm-kit interfaces

## Interface IToolCall

The IToolCall interface represents a specific request made by an AI agent within the swarm system. It’s designed to connect the model’s instructions to actual actions. Essentially, it captures a single invocation of a tool, which is then used by agents like the ClientAgent to execute tasks, trigger events – such as sending updates via the IBus – and maintain a record of the process within the IHistory.

Each IToolCall has a unique identifier, “id,” generated to differentiate it from other tool calls, often using a random string. This ID is crucial for tracking the results of the tool execution and linking them back to the original request.

The “type” property is always “function,” reflecting the swarm’s architecture where tools are implemented as callable functions.  

Finally, the “function” property contains the details of the tool being called, including its name and any required arguments, derived from the model’s output. Agents use this information to correctly execute the tool using a callback function.

## Interface ITool

The ITool interface is a core component of the swarm system, acting as a blueprint for each available tool. It defines everything the agents need to know about a specific function – essentially, how to call it. 

Each ITool specifies a `type`, currently always "function," which indicates the tool’s category. This aligns with the `type` property in the `IToolCall` object.

Crucially, it includes a `function` property that contains detailed information about the tool. This includes the tool’s `name`, a `description` of what it does, and a schema outlining the expected `parameters`. This parameter schema defines the data types and requirements for any input the tool needs, ensuring that the model can correctly generate and execute tool calls.  The parameter schema is matched against the `function` property during execution, allowing the system to accurately target the correct function within the agent.

## Interface ISwarmSessionCallbacks

The `ISwarmSessionCallbacks` interface defines a set of callbacks that allow you to react to various events happening within a swarm session. These callbacks provide hooks for key moments like when a client connects, when a command is executed, or when a message is emitted.

Specifically, you can use the `onConnect` callback to perform actions when a new client joins the swarm, such as logging the connection or running initial setup. The `onExecute` callback is triggered each time a command is run, and the `onRun` callback is invoked during stateless completion runs.  Furthermore, the `onEmit` callback lets you respond to messages sent from the swarm, and the `onInit` callback handles the session initialization. Finally, the `onDispose` callback is called when a session is disconnected or shut down.

## Interface ISwarmSchema

The ISwarmSchema interface defines the structure for creating and managing an AI agent swarm. It allows you to configure the swarm’s behavior, including how agents navigate and how they are managed.

Key features include:

*   **Configuration:** You can set options like enabling persistent storage of navigation stacks and defining access control policies using a list of policy names.
*   **Navigation Control:**  The schema provides functions to retrieve the initial navigation stack and to persist changes to it.
*   **Agent Management:** It offers a way to determine the active agent within the swarm, either upon initialization or after navigation changes.
*   **Customization:**  You can integrate lifecycle callbacks to respond to events within the swarm’s operation.

The schema also includes essential identifiers like the swarm’s unique name and a list of available agent names.  A default agent name is provided for situations where no specific active agent is designated.

## Interface ISwarmParams

The `ISwarmParams` interface defines the configuration needed to create a swarm. It builds upon the core swarm schema, adding dynamic elements for managing agents during operation. This interface specifies essential details like a unique client ID, a logger for tracking events and errors, and a bus for communication between swarm members.  Crucially, it includes a map – `agentMap` – that allows you to access and manage individual agent instances by their names. This `agentMap` is a key component for dynamically controlling the swarm’s behavior.


## Interface ISwarmConnectionService

The `ISwarmConnectionService` interface acts as a specific type definition, building upon the broader `SwarmConnectionService`. Its primary purpose is to clearly outline the structure of a service intended for public interaction. By excluding any internal keys, it guarantees that the service’s exposed operations align precisely with what’s intended for external use, promoting a clean and well-defined public API.

## Interface ISwarmCallbacks

The ISwarmCallbacks interface provides a set of functions to manage and monitor the lifecycle of an AI agent swarm. It builds upon standard session callbacks and adds specific functionality related to individual agents.

The `onAgentChanged` callback is a key component. It’s triggered whenever the currently active agent within the swarm shifts. This allows you to track agent movement, update your application’s state based on the new active agent, or perform other actions related to navigation events.  This callback receives the agent’s unique ID, its name, and the name of the swarm it belongs to.


## Interface ISwarm

The ISwarm interface provides a central control point for managing a group of AI agents. It offers a suite of methods to handle the agents’ movement and activity. Primarily, the `navigationPop` method allows you to remove and retrieve the most recent agent from the swarm’s navigation stack, or to default to a pre-defined agent if needed.  You can also cancel any ongoing output operations using `cancelOutput`, which guarantees an empty string is returned when calling `waitForOutput`. This method waits for and returns the output generated by the currently active agent.  Furthermore, the interface includes functions to obtain the agent’s name via `getAgentName` and to retrieve the agent instance itself using `getAgent`. Finally, `setAgentRef` is used to register or update agent references within the swarm, and `setAgentName` allows you to designate the active agent for navigation purposes.

## Interface IStorageSchema

The `IStorageSchema` interface defines how a storage component within the AI agent swarm operates. It controls aspects like whether data is saved persistently, how the storage is accessed, and how it’s indexed for efficient searching.

Key features include an optional `persist` flag to manage data persistence, a `storageName` to uniquely identify the storage instance, and a `callbacks` object for handling storage-related events.  You can customize data retrieval and setting using the `getData` and `setData` functions, respectively.

The `embedding` property specifies the indexing mechanism used, and the `getDefaultData` function provides default data during persistence.  Finally, the `createIndex` method generates a unique index for each stored item, crucial for search functionality.

## Interface IStorageParams

The `IStorageParams` interface defines the runtime settings for managing storage within the AI agent swarm. It builds upon the core storage schema, adding details specific to each client and their associated embeddings.

Key features include:

*   **`clientId`**: A unique identifier for the client using this storage instance.
*   **`calculateSimilarity`**: A function that computes the similarity between embeddings, crucial for search functionality.
*   **`createEmbedding`**: A function used to generate embeddings for storage items, enabling indexing.
*   **`storageName`**: The unique name of the storage, provided for clarity within the swarm’s organization.
*   **`logger`**: An instance of the logger, used to record storage-related events and any encountered errors.
*   **`bus`**:  The bus object facilitating communication between swarm components through events.

## Interface IStorageData

The `IStorageData` interface outlines the basic structure of data stored within the orchestration framework. It establishes the essential properties needed for any storage item.

Specifically, each storage item must have a unique identifier, represented by the `id` property. This `id` is a `StorageId` and is crucial for locating and deleting the item from the system.  It ensures consistent identification across the entire swarm.

## Interface IStorageConnectionService

The `IStorageConnectionService` interface acts as a specific type definition, building upon the broader `StorageConnectionService`. Its primary purpose is to precisely define `TStorageConnectionService` while intentionally omitting any internal implementation details. This ensures that the `StoragePublicService` remains focused solely on the public-facing operations, providing a clean and well-defined contract for external interactions.

## Interface IStorageCallbacks

The `IStorageCallbacks` interface defines a set of callbacks that allow you to react to various events related to the storage system. These callbacks provide hooks for handling updates to the stored data – triggered whenever items are added, removed, or modified. You can also use them to monitor search operations as they occur.

Specifically, the `onUpdate` callback is invoked when storage data changes, offering a chance to log these updates or synchronize your application’s state. The `onSearch` callback is triggered during a search, providing insight into the search process.

Furthermore, the `onInit` callback is executed when the storage is initially set up, and the `onDispose` callback is called when the storage is being shut down, enabling you to perform necessary cleanup tasks. These callbacks offer a flexible way to integrate your application with the storage system's lifecycle.

## Interface IStorage

The IStorage interface provides a core API for managing data within the AI agent swarm orchestration framework. It offers a set of methods to interact with the underlying storage, allowing you to retrieve, modify, and delete items.

Specifically, the `take` method enables similarity-based retrieval of items from the storage, utilizing embeddings for efficient searching. The `upsert` method handles both inserting new items and updating existing ones, ensuring the index is kept current.  You can also use `remove` to delete items based on their unique ID, and `get` to retrieve a single item.

For broader data access, the `list` method allows you to retrieve all items, with the option to filter them based on a specified criteria. Finally, the `clear` method provides a way to reset the entire storage to an empty state.

## Interface IStateSchema

The `IStateSchema` interface is central to managing the state of individual agents within the swarm. It defines how each state is configured and how it behaves.

Key aspects of the `IStateSchema` include:

*   **`persist`**:  This boolean flag controls whether the state’s values are saved persistently, like to a hard drive, allowing states to retain information between agent restarts.
*   **`docDescription`**:  A descriptive string that provides context and documentation for the state, aiding in understanding its purpose and usage.
*   **`shared`**:  When set to `true`, this flag indicates that the state can be accessed and modified by multiple agents, facilitating coordination.
*   **`stateName`**:  A unique identifier for the state within the swarm, ensuring distinct state definitions.
*   **`getDefaultState`**:  A function that either retrieves a pre-defined default state value or computes it dynamically, based on the agent’s ID and the state name.
*   **`getState`**:  An optional function that allows you to retrieve the current state, providing a fallback to the `getDefaultState` if the current state isn’t available.
*   **`setState`**:  An optional function for setting or updating the state, overriding the default setting behavior if provided.
*   **`middlewares`**:  An array of middleware functions that can be applied to the state during its lifecycle, allowing for pre-processing or post-processing of state data.
*   **`callbacks`**:  A partial set of lifecycle callbacks that can be used to trigger actions or events at specific points in the state’s lifecycle, offering customization options.

## Interface IStateParams

The `IStateParams` interface defines the runtime settings needed for managing state within the AI agent swarm. It builds upon a core state schema, adding details specific to each individual client.

Key properties include:

*   **clientId:** A unique string identifying the client to which this state instance belongs.
*   **logger:** An `ILogger` instance used to track state operations and any errors that occur.
*   **bus:** An `IBus` object facilitating communication between agents via events. This allows the swarm to coordinate actions based on state changes.

## Interface IStateMiddleware

The `IStateMiddleware` interface provides a standardized way to manage and control changes to your application’s state. It acts as a central point for any middleware logic that needs to interact with the state. This allows you to validate state updates, transform state data, or perform other necessary operations before the state is finalized. Essentially, it ensures a consistent and controlled flow of state updates throughout your AI agent swarm orchestration framework.

## Interface IStateConnectionService

The `IStateConnectionService` interface serves as a type definition, specifically designed to refine the `StateConnectionService` interface. Its primary purpose is to create a more focused version, `StatePublicService`, by intentionally omitting any internal keys. This ensures that the public-facing service only exposes the necessary operations, promoting a cleaner and more manageable API.

## Interface IStateCallbacks

The `IStateCallbacks` interface defines a set of functions to handle events related to the lifecycle of a state within the AI agent swarm orchestration framework. These callbacks allow you to react to key moments, such as when a state is initially set up, when it’s being cleaned up, or when data is being loaded or modified.

Specifically, you can use the `onInit` callback to perform actions during state initialization, like logging or setting up initial configurations. The `onDispose` callback is triggered when a state is being cleaned up, providing an opportunity for cleanup tasks.

The `onLoad` callback is invoked when a state is loaded, typically from storage, and the `onRead` and `onWrite` callbacks are triggered during state read and write operations respectively. These callbacks offer a way to monitor state changes and potentially trigger side effects based on the state’s content.

## Interface IState

The IState interface is the core of the framework’s runtime state management. It offers a straightforward way to access, modify, and reset the application’s state.

You can use the `getState` method to retrieve the current state value. This method intelligently handles any configured middleware and custom logic defined within the schema.

To update the state, the `setState` method is used. This method requires a dispatch function, which takes the previous state and returns the new state. Like `getState`, it incorporates middleware and custom logic.

Finally, the `clearState` method provides a way to completely reset the state back to its initial default value, as defined in the schema’s `getDefaultState` property.

## Interface ISharedStorageConnectionService

This interface, ISharedStorageConnectionService, acts as a blueprint for defining a connection to shared storage. It’s specifically designed to represent the public-facing aspects of a shared storage connection. By excluding internal details, it ensures that the SharedStoragePublicService interface accurately reflects the operations available to external users and applications. Essentially, it provides a clean and focused definition for the public API of the shared storage service.


## Interface ISharedStateConnectionService

This interface, ISharedStateConnectionService, acts as a specific type definition. It builds upon the broader SharedStateConnectionService, but crucially, it’s designed to represent only the public-facing aspects of that service.  By excluding internal keys, it guarantees that any code using this type will only interact with the parts of the service intended for external use, promoting a cleaner and more focused API. It’s a way to clearly delineate between the internal workings and the public-facing operations of the SharedStateConnectionService.

## Interface ISessionSchema

The `ISessionSchema` interface defines the structure for data associated with individual sessions within the AI agent swarm.  Right now, it’s intentionally empty – think of it as a foundational placeholder.  This allows the framework to easily accommodate future session-specific configurations, such as unique task parameters, agent roles, or specialized data requirements for each session. It provides a clear and extensible design for managing session-related information as the swarm orchestration system evolves.

## Interface ISessionParams

The `ISessionParams` interface defines the essential configuration needed to establish a session within the AI agent swarm orchestration framework. It bundles together the core session details, including the client’s unique identifier, a logging component for tracking activity and errors, and a policy object that governs the session’s behavior.  Furthermore, it incorporates the bus for inter-agent communication and a reference to the managing swarm instance itself. Finally, the `swarmName` property ensures each session is clearly associated with its specific swarm.

## Interface ISessionContext

The `ISessionContext` interface is a core component of the AI agent swarm orchestration framework. It acts as a container, holding all the necessary information for managing a single agent’s activity within the swarm.  Essentially, it provides a snapshot of the agent’s current state.

This context includes:

*   **clientId:** A unique identifier for the client session.
*   **processId:**  A unique identifier for the process associated with the session.
*   **methodContext:**  Details about the specific method currently being executed, if one is active.
*   **executionContext:**  Information related to the overall execution environment, such as timing and resource constraints.

The `ISessionContext` is designed to be a centralized source of truth for all agents interacting within the swarm.


## Interface ISessionConnectionService

The `ISessionConnectionService` interface acts as a type definition, specifically designed to ensure consistency when working with the `TSessionConnectionService`. It’s used to precisely define the `TSessionConnectionService` type while intentionally excluding any internal implementation details. This approach guarantees that the public-facing operations, represented by `SessionPublicService`, remain focused solely on the externally visible aspects of the service.

## Interface ISessionConfig

The `ISessionConfig` interface defines the settings for managing individual sessions within an AI agent swarm. It’s designed to control how often or when a session should run, offering flexibility for scheduling tasks.

The core property is `delay`, which specifies the duration, in milliseconds, that a session should wait before executing. This allows you to implement rate limiting, ensuring agents don’t overwhelm a system or resource with too many requests at once.  It’s a fundamental building block for creating sophisticated orchestration strategies.


## Interface ISession

The `ISession` interface represents a core component within the AI agent swarm orchestration framework. It provides a structured way to manage interactions and computations within a single agent’s context.

Key functionalities include sending messages to the session via the `emit` method, allowing for both regular communication and the execution of stateless commands using the `run` and `execute` methods. The `execute` method offers flexibility with an `ExecutionMode` parameter, potentially updating the session’s chat history based on the chosen mode.

To control the flow of execution, the `commitStopTools` method prevents the next tool from running.  Additionally, the `commitUserMessage`, `commitAssistantMessage`, and `commitSystemMessage` methods allow for committing messages to the session’s history without triggering a response, providing control over the conversation’s state.

The `connect` method establishes a bidirectional communication channel, returning a receiver function to handle incoming messages. Finally, the `commitToolOutput` method commits tool output to the session’s history or state, ensuring that all interactions are recorded and managed effectively.


## Interface IPolicySchema

The `IPolicySchema` interface defines the structure for configuring policies within the AI agent swarm. It’s the core mechanism for enforcing rules and managing bans across the swarm.

Key aspects of the schema include:

*   **`docDescription`**: An optional field for providing a clear description of the policy, aiding in understanding its purpose.
*   **`policyName`**: A unique identifier for the policy, ensuring it can be referenced consistently within the swarm.
*   **`banMessage`**:  A default message displayed when a client is banned, which can be customized using the `getBanMessage` function.
*   **`autoBan`**: A flag that automatically bans a client upon failing validation checks.
*   **`getBanMessage`**:  A function allowing you to generate a dynamic, personalized ban message based on the client ID, policy name, and swarm name.
*   **`getBannedClients`**:  A function to retrieve the list of currently banned clients associated with the policy.
*   **`setBannedClients`**:  A function to manage the list of banned clients, providing an alternative to the default ban management.
*   **`validateInput`**:  An optional function to perform custom validation on incoming messages, ensuring they adhere to specific policy rules.
*   **`validateOutput`**:  An optional function to validate outgoing messages, adding another layer of control and security.
*   **`callbacks`**:  A flexible mechanism for handling policy events, enabling you to customize validation and ban actions through a set of callbacks.

## Interface IPolicyParams

The `IPolicyParams` interface defines the settings needed to create and configure a policy within the AI agent swarm orchestration framework. It builds upon the core policy schema, allowing you to include dynamic information and fully utilize callback functions for flexible behavior.

Key components of this interface include:

*   **logger:**  This property specifies the logger instance. The logger is used to track and record all policy-related actions and any errors that might occur during execution, providing valuable insights for monitoring and debugging.
*   **bus:** This property designates the bus instance. The bus facilitates communication between agents within the swarm through event-driven messaging, enabling coordinated actions and responses.

## Interface IPolicyConnectionService

The `IPolicyConnectionService` interface acts as a specific type definition, building upon the broader `PolicyConnectionService`. Its primary purpose is to precisely define `TPolicyConnectionService` while intentionally omitting any internal details. This ensures that the `PolicyPublicService` remains focused solely on the publicly accessible operations and data, maintaining a clear separation between the internal implementation and the external API.

## Interface IPolicyCallbacks

The `IPolicyCallbacks` interface defines a set of callbacks designed to manage and monitor the lifecycle of policies within the swarm orchestration framework. It provides hooks that can be used at various stages, including when a policy is initialized, when incoming or outgoing messages are validated, and when a client is banned or unbanned.

Specifically, you can register a callback function named `onInit` to be executed immediately after a policy is initialized.  The `onValidateInput` callback allows you to intercept and examine incoming messages, offering a chance for logging or monitoring. Similarly, `onValidateOutput` provides a mechanism to validate outgoing messages.

Finally, the `onBanClient` and `onUnbanClient` callbacks are triggered when a client is either banned or unbanned from the swarm, enabling you to log these events or perform any necessary actions related to client management. These callbacks offer a flexible way to observe and interact with the policy execution process.

## Interface IPolicy

The `IPolicy` interface defines the core logic for controlling behavior within the AI agent swarm. It acts as a central enforcement point, responsible for managing client bans and ensuring all communication adheres to established rules.

Specifically, the `IPolicy` interface provides the following capabilities:

*   **`hasBan(clientId, swarmName)`:**  This method checks if a given client is currently banned within the specified swarm.
*   **`getBanMessage(clientId, swarmName)`:**  If a client is banned, this retrieves the corresponding ban message.
*   **`validateInput(incoming, clientId, swarmName)`:**  It validates incoming messages from agents, ensuring they comply with the policy’s defined rules.
*   **`validateOutput(outgoing, clientId, swarmName)`:** This method validates outgoing messages from agents, guaranteeing they meet policy requirements before being sent.
*   **`banClient(clientId, swarmName)`:**  This function adds a client to the banned list, preventing them from participating in the swarm.
*   **`unbanClient(clientId, swarmName)`:**  Conversely, this removes a client from the banned list, restoring their access to the swarm.

## Interface IPersistSwarmControl

The `IPersistSwarmControl` interface provides a flexible way to manage the persistence of your AI agent swarm. It allows you to tailor how active agents and navigation stacks are stored, giving you control over the underlying data adapters.

Specifically, the `usePersistActiveAgentAdapter` method lets you define a custom adapter for storing information about active agents. Similarly, `usePersistNavigationStackAdapter` enables you to specify a custom adapter for managing the navigation stack data. This customization is key to integrating the swarm orchestration framework with various data storage solutions and adapting to different operational needs.


## Interface IPersistStorageData

This interface, `IPersistStorageData`, provides a way to manage and save your storage data persistently. It essentially acts as a container, holding an array of your storage data.  The core functionality revolves around the `data` property, which is an array (`T[]`) that holds all the data you want to keep track of. This allows you to easily store and retrieve your data in a structured manner, ensuring it remains available even after the application restarts.


## Interface IPersistStorageControl

The `IPersistStorageControl` interface provides a way to manage how your agent swarm’s data is persistently stored. It gives you the flexibility to tailor the storage process by allowing you to specify a custom persistence adapter.  

Specifically, the `usePersistStorageAdapter` method lets you inject your own adapter class, which is expected to implement a specific interface (`TPersistBaseCtor<string, IPersistStorageData<IStorageData>>`). This enables you to adapt the storage behavior to your application’s needs and potentially integrate with different storage solutions.

## Interface IPersistStateData

This interface, `IPersistStateData`, provides a standardized way to manage and save your AI agent swarm’s state information. It acts as a wrapper, ensuring that the underlying state data is stored in a consistent, structured format.  

The core of the interface is the `state` property, which holds the actual state data itself. This allows for flexible storage and retrieval of the swarm’s current situation and parameters.

## Interface IPersistStateControl

The `IPersistStateControl` interface provides a way to manage how your agent swarm’s state is saved and retrieved. It gives you the flexibility to tailor the persistence process by allowing you to specify a custom adapter.

Specifically, the `usePersistStateAdapter` method lets you replace the default persistence logic with your own implementation. This is useful if you need to change where the state is stored, how it’s formatted, or any other aspect of the persistence process.  You pass in a constructor for your custom adapter, enabling you to control the entire state persistence workflow.


## Interface IPersistPolicyData

The `IPersistPolicyData` structure is designed to manage persistent policy information within the AI agent swarm system. It focuses on tracking which clients are banned under a particular policy. Specifically, it maintains a list of `SessionId` values that have been flagged as banned, all associated with a given `SwarmName` and a specific policy. This allows the swarm to consistently remember and enforce bans across multiple runs and deployments. The core of this data is represented by the `bannedClients` property, which is an array of strings – each string representing a SessionId.

## Interface IPersistPolicyControl

The `IPersistPolicyControl` module provides tools to manage how policy data is saved and retrieved. It gives you the ability to tailor the persistence process by injecting a custom adapter. This adapter is specifically designed to handle policy data linked to a `SwarmName`.

The core functionality is achieved through the `usePersistPolicyAdapter` method.  This method lets you replace the standard `PersistBase` implementation with your own, allowing you to implement specialized behaviors, such as keeping track of policy data directly within memory for a particular swarm.  Essentially, it offers flexibility in how your swarm’s policies are persistently stored.


## Interface IPersistNavigationStackData

This interface, `IPersistNavigationStackData`, provides a way to manage and store information related to the navigation history of an AI agent swarm. It’s designed to track the sequence of agents that have been active within the swarm.

The core of this interface is the `agentStack` property, which is a simple array of strings. Each string in this array represents the name of an agent that was part of the navigation stack at a particular point in time.  This allows the system to reconstruct the agent’s journey through the swarm based on this stored history.


## Interface IPersistMemoryData

This interface, `IPersistMemoryData`, provides a standardized way to store and retrieve memory data. It acts as a wrapper, ensuring that all memory data is consistently formatted for storage.  The core of the interface is the `data` property, which holds the actual memory data itself, represented by the type `T`. This allows for flexible storage of various types of memory information.

## Interface IPersistMemoryControl

The `IPersistMemoryControl` interface provides a way to manage how memory is persistently stored. It offers control over the underlying persistence adapter, allowing you to tailor the storage mechanism to your specific needs.

Specifically, the `usePersistMemoryAdapter` method lets you inject a custom adapter – defined by the `TPersistBaseCtor<string, IPersistMemoryData<unknown>>` type – to handle memory persistence. This gives you flexibility in choosing and configuring the storage system.


## Interface IPersistEmbeddingData

The `IPersistEmbeddingData` interface outlines how embedding data is stored within the AI agent swarm. It’s designed to manage numerical representations – specifically, embedding vectors – associated with unique string identifiers.  

The core of this interface is the `embeddings` property, which is an array of numbers.  Each number in this array represents a component of the embedding vector, providing a compact numerical representation of the original string data. This allows the swarm to efficiently store and retrieve these embeddings for later analysis or use.


## Interface IPersistEmbeddingControl

The `IPersistEmbeddingControl` class provides tools to manage how embedding data is saved and retrieved. It gives you the ability to tailor the embedding persistence process.

Specifically, the `usePersistEmbeddingAdapter` method lets you inject a custom adapter. This adapter replaces the standard `PersistBase` implementation, enabling you to implement specialized behavior, such as storing embeddings in memory alongside a `SwarmName`. This customization is particularly useful when you need to manage embedding data in a way that isn't covered by the default persistence settings.


## Interface IPersistBase

The `IPersistBase` interface establishes a foundational set of methods for managing persistent data storage. It provides core functionality for interacting with a storage system.

Specifically, the `waitForInit` method handles the initial setup of the storage directory, automatically creating it if it doesn’t already exist and then cleaning up any outdated or invalid data.

The `readValue` method allows you to retrieve a specific entity from storage using its unique identifier.

Furthermore, the `hasValue` method efficiently checks whether an entity with a given ID is currently present in the storage.

Finally, the `writeValue` method enables you to save a new or updated entity to storage, associating it with its designated ID.

## Interface IPersistAliveData

The `IPersistAliveData` interface outlines how the swarm system keeps track of client availability. It focuses on recording whether a specific client, identified by its `SessionId`, is currently active or inactive within a particular `SwarmName`.  

The core of this interface is the `online` property, a boolean value.  It’s set to `true` when the client is considered online and `false` when it’s offline. This persistent status information is crucial for the swarm’s coordination and decision-making processes.


## Interface IPersistAliveControl

The `IPersistAliveControl` module provides tools to manage how the alive status of swarm agents is tracked and stored. It gives developers the ability to tailor this process by injecting a custom adapter.

Specifically, the `usePersistAliveAdapter` method lets you replace the standard persistence mechanism with your own implementation. This is useful if you need to store the alive status in a way that’s specific to your application, such as keeping track of it in memory for a particular swarm name.  You would pass in a constructor for your custom adapter, allowing you to define the behavior for persisting the alive status.


## Interface IPersistActiveAgentData

This interface, `IPersistActiveAgentData`, defines the structure for data that’s being saved and retrieved for active agents within the orchestration framework. It’s designed to hold information about each agent.

The core property is `agentName`, which is a string. This string uniquely identifies the active agent to which the data pertains.  Essentially, it provides a way to store and access details related to a specific agent that’s currently part of the swarm’s operation.


## Interface IPerformanceRecord

This interface, IPerformanceRecord, is designed to track the operational efficiency of processes within the swarm system. It aggregates performance data from multiple clients – like individual agent sessions – to provide a system-wide view.

The record centers around a specific process, identified by its `processId`, which could be a unique identifier for a swarm run or agent workflow.

It contains an array of `clients`, where each client is represented by an `IClientPerfomanceRecord` object. These objects detail the execution metrics for each client, allowing for granular analysis of resource usage and performance.

Key metrics include `totalExecutionCount`, representing the total number of times a process was executed, and `totalResponseTime`, which is the cumulative response time across all clients, formatted for easy readability.  The `averageResponseTime` provides a normalized view of the typical response time per execution.

Finally, the record includes timestamps for context: `momentStamp` (a coarse date based on the Unix epoch) and `timeStamp` (a more precise time within the day), all stored as numerical values for efficient tracking and historical analysis. The `date` property provides a human-readable date and time string.

## Interface IPayloadContext

The `IPayloadContext` interface outlines the structure for managing data related to an AI agent’s task. It’s designed to hold both the actual data being processed and information about where it came from.

Specifically, each `IPayloadContext` includes a `clientId`, which is a unique identifier for the client generating or requesting the data.

Crucially, it also contains a `payload` property. This `payload` is defined using a generic type `Payload`, meaning it conforms to a specific data structure defined elsewhere within the framework. This ensures consistent handling of data across different agent operations.


## Interface IOutgoingMessage

The IOutgoingMessage interface defines how messages are sent out from the swarm system. It represents a single message directed to a client, often an agent’s response. 

This interface encapsulates three key pieces of information: the `clientId`, which uniquely identifies the client receiving the message – crucial for directing the message to the correct session, like "client-123"; the `data`, which is the actual content of the message, such as a processed result or an agent’s response; and the `agentName`, which specifies the agent that originated the message, allowing you to trace the response back to its source, for example, "WeatherAgent".

## Interface IModelMessage

This interface, IModelMessage, is the fundamental building block for communication within the swarm system. It represents a single message exchanged between any part of the system – agents, tools, users, or the system itself. These messages are crucial for tracking the history of interactions, generating responses from the model, and broadcasting events throughout the swarm.

The core of an IModelMessage is its `content`, which holds the actual data being communicated, like user input, model responses, or tool outputs.  The `role` property specifies the origin of the message, with common roles including "assistant" (generated by the model), "system" (for system-level notifications), "tool" (for tool outputs), and "user" (for user-initiated messages).

To provide context, each IModelMessage includes an `agentName`, linking the message to a specific agent instance.  Additionally, the `mode` property indicates the context of the message, typically "user" for stateless runs or "tool" for tool-related outputs.

When the model requests a tool execution, an IModelMessage can contain an array of `tool_calls` – objects representing the tool requests.  A unique `tool_call_id` is associated with each tool call, allowing the system to track the relationship between the tool request and its corresponding output.  This structure ensures a complete and traceable record of all interactions within the swarm.


## Interface IMethodContext

The `IMethodContext` interface provides a standardized structure for tracking method calls within the swarm system. It acts as a central point for metadata, utilized by services like ClientAgent, PerfService, and LoggerService. 

This context includes key identifiers for accurate tracking. Specifically, it contains the `clientId`, which links to the client session and is used by ClientAgent for agent-specific execution.  The `methodName` is recorded for logging purposes by LoggerService and for performance analysis by PerfService.

Furthermore, the `agentName` identifies the agent involved, sourced from the Agent interface, and is used in ClientAgent and DocService.  The `swarmName`, derived from the Swarm interface, is crucial for performance tracking within PerfService and documentation within DocService. 

Finally, the `storageName` (from Storage.interface), `stateName` (from State.interface), and `policyName` (from Policy.interface) provide additional context for accessing storage resources, managing session states, and understanding policy constraints, respectively, all of which are leveraged across various services.

## Interface IMetaNode

The `IMetaNode` interface provides a foundational structure for organizing information about agents and their relationships within the AI agent swarm orchestration framework. It’s primarily used by the `AgentMetaService` to create a hierarchical representation of the swarm, much like a UML diagram.

Each `IMetaNode` represents a specific element, such as an agent or a resource, and is identified by a `name`. This name could be the identifier of an agent itself, or a broader category like "States."

Optionally, a node can have a list of `child` nodes. These children represent the dependencies or sub-elements associated with the parent node – for example, a list of agents that depend on a particular agent, or the different states an agent can be in. This allows for a structured and nested view of the entire agent swarm.


## Interface IMakeDisposeParams

The `IMakeDisposeParams` interface defines the settings used when calling the `makeAutoDispose` function. It controls how and when the swarm agents are automatically cleaned up.

Specifically, the `timeoutSseconds` property sets the maximum duration, in seconds, that the swarm agents are allowed to remain active before being automatically terminated.

The `onDestroy` property is a callback function. This function is invoked when the timeout expires, receiving the unique ID of the agent (`clientId`) and the name of the swarm (`swarmName`) to ensure proper cleanup.


## Interface IMakeConnectionConfig

The `IMakeConnectionConfig` interface defines the settings used to control how messages are sent as part of an AI agent swarm. Specifically, it includes a `delay` property. This `delay` property allows you to specify a time interval – measured in seconds – between the sending of messages. This is useful for rate-limiting or introducing pauses within the swarm’s communication patterns.

## Interface ILoggerInstanceCallbacks

The `ILoggerInstanceCallbacks` interface provides a way to interact with and customize the lifecycle of a logger instance within the AI agent swarm orchestration framework. It offers callbacks that are triggered at specific points – during initialization, when the instance is disposed, and whenever a log message is recorded.

Specifically, the `onInit` callback is invoked immediately after the logger instance is initialized, often during the `waitForInit` process.  The `onDispose` callback is executed when the logger instance is being cleaned up, allowing for resource release.

Furthermore, the `onLog`, `onDebug`, and `onInfo` callbacks are triggered based on the log level (log, debug, or info) of the recorded message, providing a flexible mechanism to handle different types of log events. These callbacks receive the client ID, the log topic, and any associated arguments, enabling developers to respond to log events in a tailored manner.

## Interface ILoggerInstance

The `ILoggerInstance` interface provides a standardized way to manage logger instances, building upon the core functionality of the `ILogger`. It’s specifically designed for client-specific logging, offering features like initialization and cleanup.

The `waitForInit` method handles the setup of the logger instance, allowing for asynchronous initialization and the execution of an `onInit` callback if one is provided.  This ensures the logger is ready for use.

The `dispose` method is responsible for cleaning up resources associated with the client ID, guaranteeing proper resource management and preventing potential issues when the client is no longer needed. It also supports an `onDispose` callback for any necessary final actions.


## Interface ILoggerControl

The `ILoggerControl` interface provides a way to manage and customize the behavior of the logging system within the AI agent swarm framework. It’s primarily used by `LoggerUtils` to handle common logging adapters, callbacks, and the construction of logger instances.

Key functionalities include:

*   **`useCommonAdapter`**: This method allows you to set a standard logging adapter, overriding the default behavior provided by `swarm.loggerService`. This is useful for centralized logging across the entire swarm.
*   **`useClientCallbacks`**:  You can configure lifecycle callbacks specific to each logger instance. These callbacks are applied when instances are created by the `LoggerUtils` LoggerFactory, giving you control over instance initialization and cleanup.
*   **`useClientAdapter`**: This method lets you replace the default logger instance constructor with a custom one. This enables client-specific logging configurations.
*   **`logClient`, `infoClient`, `debugClient`**: These methods provide the core logging functionality, sending messages to a specific client with associated topics and arguments.  Each method utilizes the common adapter and includes session validation and method context tracking for detailed logging information.

## Interface ILoggerAdapter

The `ILoggerAdapter` interface is a core component of the AI agent swarm orchestration framework, providing a standardized way to manage logging for individual clients. It’s implemented by `LoggerUtils` to tailor logging operations to the specific needs of each client.

This interface defines methods for logging messages at different severity levels – `log`, `debug`, and `info`.  Each method takes the client ID and a topic as input, and then logs a message to the client’s dedicated logger instance.  Crucially, before logging, the framework performs session validation and initialization, guaranteeing that the logging setup is ready.

The `dispose` method is used to cleanly remove the client’s logger instance from the cache, ensuring proper resource management and preventing potential issues when a client is no longer active. Like the other logging methods, it performs session validation and initialization prior to clearing the logger.

## Interface ILogger

The ILogger interface is the core logging system for the entire swarm orchestration framework. It allows components – including agents, sessions, states, storage, and various other systems – to record messages at different levels of importance. 

You can use the `log` method to record general events and state changes, like agent executions or session connections.  The `debug` method is specifically designed for detailed diagnostic information, such as tracking intermediate steps during tool calls or embedding creation. Finally, the `info` method is used to record high-level informational updates, such as successful completions or policy validations, offering a clear overview of system activity.  This robust logging system supports debugging, monitoring, and auditing throughout the swarm’s operation.


## Interface IIncomingMessage

The `IIncomingMessage` interface defines how the swarm system receives messages from external sources. It essentially captures a message as it enters the system, often originating from a user or another client.

Each `IIncomingMessage` contains three key pieces of information:

*   **`clientId`**: A unique identifier for the client that sent the message. This helps track the origin of the message, matching identifiers used in runtime parameters like `this.params.clientId`.
*   **`data`**: The actual content of the message itself. This is typically a string, representing the raw input received by the system, such as a user command or a query.
*   **`agentName`**: The name of the specific agent responsible for handling this message. This allows the system to route the message to the correct agent instance, often defined in agent parameters like `this.params.agentName`.

## Interface IHistorySchema

The `IHistorySchema` interface outlines the structure for managing a history of model messages. It’s the blueprint for how the system stores and accesses these messages.

At its core, it utilizes an `IHistoryAdapter`. This adapter is responsible for handling the actual storage and retrieval of the model messages, providing the necessary functionality for the history mechanism to operate. It’s the component that deals with the underlying data storage.


## Interface IHistoryParams

This interface, `IHistoryParams`, defines the settings needed when creating a history instance for an AI agent swarm. It builds upon the core history schema, adding specific details tailored to how each agent manages its own history.

Key properties include:

*   **agentName:** A unique identifier for the agent that will use this history.
*   **clientId:** A unique identifier for the client associated with this history instance.
*   **logger:**  A logger object used to track and record any activity or errors related to the history.
*   **bus:** An instance of the swarm's bus, enabling communication and event handling within the swarm system.

## Interface IHistoryInstanceCallbacks

The `IHistoryInstanceCallbacks` interface provides a set of callback functions designed to manage the lifecycle and message handling within an AI agent’s history instance. These callbacks allow you to customize how the history is initialized, updated, and processed during agent interactions.

Specifically, you can use `getSystemPrompt` to dynamically retrieve system prompt messages tailored to an agent’s needs. The `filterCondition` callback lets you selectively include or exclude messages from the history based on specific criteria.

Furthermore, `getData` is used to obtain the initial history data for an agent, while `onChange`, `onPush`, and `onPop` are triggered when the history array changes.  You can also utilize `onRead`, `onReadBegin`, and `onReadEnd` for fine-grained control during history iteration, and `onDispose` and `onInit` for managing the history instance’s lifecycle events. Finally, `onRef` provides a direct reference to the history instance after it’s created.

## Interface IHistoryInstance

The #IHistoryInstance interface provides a set of methods for managing an agent’s historical data. 

It offers an `iterate` function that allows you to step through all the messages recorded for a specific agent. 

To get started, you can use the `waitForInit` method to load any initial data associated with an agent. 

The `push` method is used to add new messages to the agent’s history. 

When you need to retrieve a message, the `pop` method removes and returns the most recent message. 

Finally, the `dispose` method cleans up the agent’s history, allowing you to release any associated resources.

## Interface IHistoryControl

The `IHistoryControl` interface provides a way to manage the behavior of an AI agent’s history. It offers methods to control how the history is managed throughout the agent’s lifecycle.

Specifically, you can use the `useHistoryCallbacks` method to register callbacks that will be triggered at various points during the history instance’s lifecycle. This allows you to customize actions like initialization, cleanup, or data handling.

Additionally, the `useHistoryAdapter` method lets you specify a custom constructor for the history instance adapter, giving you greater flexibility in how the adapter is created and configured.


## Interface IHistoryConnectionService

This interface, `IHistoryConnectionService`, acts as a specific type definition for the broader `HistoryConnectionService`. Its primary purpose is to ensure that the `HistoryPublicService` implementation adheres to a clean, public-facing design. By excluding any internal keys, it guarantees that the public API remains focused solely on the operations intended for external use, promoting a clear separation of concerns within the system.


## Interface IHistoryAdapter

The `IHistoryAdapter` interface provides a standardized way to manage and interact with a history of messages. It offers several key methods for working with this history.

The `push` method allows you to add new messages to the history, identified by a client ID and an agent name.

The `pop` method retrieves and removes the most recent message from the history, again using a client ID and agent name.

The `dispose` method provides a way to clean up the history associated with a specific client and agent, potentially clearing all stored data.

Finally, the `iterate` method enables you to asynchronously loop through all messages in the history for a given client and agent, providing a flexible way to access and process the historical data.


## Interface IHistory

The IHistory interface manages the conversation history within the AI agent swarm. It offers methods to add, retrieve, and organize messages, allowing for a structured record of interactions.

The `push` method adds new model messages to the end of the history, updating the underlying store asynchronously.  The `pop` method retrieves and removes the most recent message from the history.

To facilitate targeted analysis or processing, the `toArrayForAgent` method converts the history into an array, filtering or formatting messages based on a given prompt – useful for tailoring responses to specific agents.  Finally, the `toArrayForRaw` method provides a complete, unfiltered array of all model messages within the history.

## Interface IGlobalConfig

**1. Core Configuration & Defaults:**

*   **`CC_SKIP_POSIX_RENAME`**:  This is crucial for file operations.  If set to `true`, it might bypass standard POSIX rename commands, potentially simplifying file handling within the persistence layer.
*   **`CC_PERSIST_MEMORY_STORAGE`**:  This controls whether data is persistently stored in memory.  Enabled by default, suggesting a focus on rapid access and potentially less robust data retention.
*   **`CC_PERSIST_ENABLED_BY_DEFAULT`**:  This flag determines whether persistence is enabled by default.  It's currently disabled (false), meaning that persistence is only activated if explicitly configured.
*   **`CC_AUTOBAN_ENABLED_BY_DEFAULT`**:  This flag determines whether automatic banning is enabled by default. It's currently disabled (false), meaning that banning is only activated if explicitly configured.

**2. Persistence & State Management:**

*   **`CC_DEFAULT_STATE_SET`, `CC_DEFAULT_STATE_GET`, `CC_DEFAULT_STORAGE_GET`, `CC_DEFAULT_STORAGE_SET`**: These functions provide default implementations for state and storage operations.  They are essentially no-ops (return the provided arguments) by default.  This allows for customization via `setConfig`, which is the recommended way to override these behaviors.  This is a key design pattern for extensibility.

**3. Exception Handling & Recovery:**

*   **`CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION`**: This is a critical function for handling exceptions that occur during tool calls.  The default implementation returns `null`, but it can be overridden to implement custom recovery logic.  This is essential for gracefully handling errors and preventing the system from crashing.
*   **`CC_RESQUE_STRATEGY`**: This is used in conjunction with `CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION` to handle tool call exceptions.

**4.  System-Wide Identifiers & Placeholders:**

*   **`CC_PROCES_UUID`**:  A unique identifier for the current process, useful for logging and tracking.
*   **`CC_BANHAMMER_PLACEHOLDER`**:  A placeholder response used when a client attempts to engage in banned topics or actions.

**5.  Extensibility & Customization:**

*   The use of default functions with the ability to override them via `setConfig` is a cornerstone of the system's design. This allows developers to tailor the behavior of the `ClientAgent` to specific needs without modifying the core code.

**Key Implications & Design Considerations:**

*   **Flexibility:** The system is designed to be flexible and adaptable.
*   **Configuration-Driven:** Behavior is primarily determined by configuration settings.
*   **Extensibility:** The `setConfig` mechanism enables developers to extend the system's functionality.
*   **Error Handling:** The `CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION` is a vital component for robust error handling.

**In essence, this list of constants and default functions represents the foundational building blocks of the `ClientAgent` system, providing a framework for building a flexible, extensible, and robust application.**

Do you want me to delve deeper into a specific aspect of these constants or functions, such as:

*   How `setConfig` is used?
*   The role of the `IStorage` interface?
*   The purpose of the `IPolicy` interface?

## Interface IExecutionContext

The `IExecutionContext` interface establishes the foundational structure for managing execution details within the swarm system. It acts as a central point for tracking individual executions, providing metadata that’s consistently utilized by various services, including the ClientAgent, PerfService, and BusService.

Key properties within this interface include:

*   **`clientId`**: A unique string identifier that connects to the ClientAgent’s `clientId` and is crucial for tracking the client session.
*   **`executionId`**: A unique string identifier used primarily by the PerfService, particularly during the `startExecution` operation, and also by the BusService when initiating execution commits with `commitExecutionBegin`.
*   **`processId`**: This string identifier is derived from the `GLOBAL_CONFIG.CC_PROCESSED_UUID` and is used within the PerfService’s `IPerformanceRecord` object to represent the process associated with the execution.

## Interface IEntity

The `IEntity` interface serves as the foundational building block for all data that needs to be stored and retrieved persistently within the AI agent swarm orchestration framework. It defines a standard set of properties that any entity, such as an agent or a task, will possess. 

Key aspects of the `IEntity` interface include:

*   **Unique Identifier:** Every entity must have a unique identifier to distinguish it from others.
*   **Metadata:**  It includes common metadata fields like creation timestamp, last updated timestamp, and potentially a status flag.
*   **Base for Extensions:** This interface is designed to be extended with specific properties relevant to each type of entity within the swarm. 

Essentially, `IEntity` provides a consistent structure for managing and interacting with all persistent components of the system.

## Interface IEmbeddingSchema

The `IEmbeddingSchema` interface defines how the swarm manages and utilizes embedding mechanisms. It’s responsible for configuring the creation and comparison of embeddings.

Key aspects of this schema include:

*   **embeddingName:** A unique identifier for the embedding mechanism being used within the swarm.
*   **callbacks:** An optional set of callbacks that can be used to customize events related to embedding creation and comparison. This allows for flexible integration and monitoring.

The schema provides two core methods:

*   **createEmbedding:** This method takes text as input and returns a Promise that resolves with the generated embeddings. It’s primarily used for indexing or searching within storage systems.
*   **calculateSimilarity:** This method accepts two embeddings and returns a Promise that resolves with a similarity score, typically calculated using a metric like cosine similarity. This is fundamental for search and ranking operations.

## Interface IEmbeddingCallbacks

The `IEmbeddingCallbacks` interface offers a way to react to key events during the lifecycle of your AI agent embeddings. It provides two primary callback functions designed for flexibility and insight.

The `onCreate` callback is invoked immediately after a new embedding is generated. You can use this to log the embedding’s creation, perform any necessary post-processing steps, or simply track embedding generation activity.

Additionally, the `onCompare` callback is triggered whenever two embeddings are compared for similarity. This allows you to capture the similarity score and relevant context – like the two texts being compared and the client ID – for detailed analysis or logging of similarity results.  These callbacks give you control over how your system handles embedding creation and comparison.


## Interface ICustomEvent

The ICustomEvent interface provides a way to send custom data within the swarm system. It builds upon the broader IBaseEvent interface, offering a flexible approach to event handling. Unlike the standard IBusEvent, which has a fixed structure, ICustomEvent allows you to include any type of data in its `payload`. This is useful for creating event scenarios that don’t fit the predefined format of IBusEvent, such as sending a specific status and data object, like a "complete" event with a value of 42. Essentially, it’s designed for events with unique, non-standard information.


## Interface IConfig

The `IConfig` class manages the settings for UML diagram generation. Specifically, it includes a `withSubtree` property. This boolean flag, when set to `true`, instructs the system to generate a UML diagram that includes nested sub-diagrams, providing a more detailed representation of the system’s structure.


## Interface ICompletionSchema

The `ICompletionSchema` interface defines the structure for configuring completion mechanisms within the AI agent swarm. It specifies how the swarm generates responses for tasks.

Key aspects of this schema include:

*   **completionName:** A unique identifier for each completion mechanism used within the swarm.
*   **callbacks:** An optional set of callbacks that can be used to customize the behavior after a completion is generated. This allows you to react to completion events in a tailored way.

The `getCompletion` method is the core function, responsible for retrieving a completion based on specific arguments. It utilizes the provided context and tools to generate a model response, effectively driving the completion process.


## Interface ICompletionCallbacks

The `ICompletionCallbacks` interface defines how you can respond to successful completion events from the AI agent swarm orchestration framework. It offers a mechanism to execute custom actions after a completion is generated.

Specifically, the `onComplete` callback is triggered when a completion is successfully produced. 

This callback accepts two arguments:

*   `args`: Contains general arguments related to the completion event.
*   `output`: Represents the generated completion message itself, typically an `IModelMessage`.

You can use this callback to perform tasks like logging the completion, processing the output data, or initiating any necessary side effects based on the generated text.

## Interface ICompletionArgs

The `ICompletionArgs` interface defines the structure for requesting a completion from a language model. It bundles together all the necessary information to generate a response, including the client’s identification, the specific agent involved, and the conversation history. 

Key elements within this interface include:

*   **clientId:** A unique identifier assigned to the client making the request.
*   **agentName:** The name of the agent responsible for handling the completion.
*   **mode:**  Specifies the origin of the last message, distinguishing between user input and tool outputs.
*   **messages:** An array of messages that provide the context for the model, essentially the conversation history.
*   **tools:** An optional list of tools that the agent can utilize during the completion process, allowing for tool calls and integrations.

## Interface ICompletion

The `ICompletion` interface defines the core functionality for generating responses from an AI model. It acts as a central point for any system needing to produce text-based answers. This interface extends a broader completion schema, offering a fully-fledged API designed to handle the entire process of creating model responses. It’s intended to be a foundational element, providing a consistent and robust way to interact with completion capabilities.

## Interface IClientPerfomanceRecord

This interface, `IClientPerfomanceRecord`, provides detailed performance data for individual clients within a process. It’s designed to be used for analyzing client-level execution metrics, memory usage, and state information.

The record is nested within the broader `IPerformanceRecord` structure, specifically under the `clients` property, allowing for granular breakdowns of performance data for each client instance – often used in workflows like ClientAgent.

Here’s a breakdown of the key properties:

*   **`clientId`**: A unique string identifier (e.g., "client-456") associated with the client, typically matching the `clientId` used in runtime parameters like `this.params.clientId` within a ClientAgent instance. This links the performance data directly to a specific session or agent.

*   **`sessionMemory`**: A `Record<string, unknown>` that stores arbitrary data used during the client’s operation. This mirrors the functionality of `IState`’s state management within ClientAgent, providing a space for temporary variables and cached values.  An example would be `{ "cacheKey": "value" }`.

*   **`sessionState`**: Another `Record<string, unknown>` representing persistent state data for the client, similar to `IState`’s role in tracking agent state.  An example would be `{ "step": 3, "active": true }`.

*   **`executionCount`**: A numeric value representing the total number of times the client’s execution was run (e.g., 10 for a client that executed 10 commands). This contributes to the overall `executionCount` of the process.

*   **`executionInputTotal`**: The cumulative total input size (in a numeric unit like bytes) processed during all executions of the client.  This measures the total data volume received (e.g., incoming messages in `ClientAgent.execute`).  An example would be 1024 for 1KB of total input.

*   **`executionOutputTotal`**: The cumulative total output size (in a numeric unit) generated during all executions. This measures the total data volume sent (e.g., results in `ClientAgent._emitOutput`). An example would be 2048 for 2KB of total output.

*   **`executionInputAverage`**: The average input size per execution, calculated by dividing `executionInputTotal` by `executionCount`. This provides a normalized measure of input data volume (e.g., 102.4 for an average of 102.4 bytes per execution).

*   **`executionOutputAverage`**: The average output size per execution, calculated as `executionOutputTotal` divided by `executionCount`. This offers a normalized measure of output data volume (e.g., 204.8 for an average of 204.8 bytes per execution).

*   **`executionTimeTotal`**: The total execution time for the client, formatted as a string (e.g., "300ms" or "1.5s"). This represents the cumulative duration of all executions and contributes to the overall `responseTime` of the process.

*   **`executionTimeAverage`**: The average execution time per execution, formatted as a string (e.g., "30ms" per execution). This is calculated by dividing `executionTimeTotal` by `executionCount`, providing a normalized latency metric.

## Interface IBusEventContext

The `IBusEventContext` interface provides supplementary information surrounding an event within the swarm system. It’s designed to enrich the standard event data, offering details about the components involved. Primarily, it includes the `agentName`, which is consistently populated in ClientAgent events – for instance, “Agent1” for a running agent.

Beyond the agent, the context can also contain information about the `swarmName` (like “SwarmA” for a swarm-level event), the `storageName` (e.g., “Storage1”), the `stateName` (like “StateX”), and the `policyName` (e.g., “PolicyY”). 

These additional fields are intended for broader system use cases, such as swarm-wide events or policy enforcement, though they are typically not populated within ClientAgent’s agent-centric emissions. The context is a flexible mechanism for associating events with specific instances of agents, swarms, storage, states, and policies.

## Interface IBusEvent

The IBusEvent interface defines a structured event format used for communication within the swarm system. It’s designed for the internal bus, primarily utilized by ClientAgents through their `bus.emit` calls, such as sending events for actions like “run” or “commit-user-message”.

Each IBusEvent contains key pieces of information: a `source` that identifies the component originating the event – consistently “agent-bus” from ClientAgents – and a `type` string that specifies the event’s purpose, like “run” or “commit-user-message”.

Furthermore, an IBusEvent includes an `input` object, which holds event-specific data, often linked to the `IModelMessage` content.  An `output` object provides results related to the event, and a `context` object, partially implementing `IBusEventContext`, typically contains agent-specific details like the agent’s name. This structured approach allows for detailed, agent-driven event broadcasting with relevant data and context.


## Interface IBus

The IBus interface is the core mechanism for communication within the swarm system. It provides a way for agents, primarily ClientAgents, to send asynchronous updates and notifications to other components. Think of it as a central messaging system.

Here’s how it works:

*   **Event Dispatching:** Agents use the `emit` method to broadcast events. These events can signal a wide range of things, such as a completed run of a tool, the emission of validated output, or the commit of messages.
*   **Structured Events:** All events adhere to a consistent structure defined by the `IBaseEvent` interface. This structure includes essential information like an event identifier (`type`), the source of the event (`source`), input data (`input`), output data (`output`), contextual metadata (including the agent’s name – `context`), and the target client’s ID (`clientId`).
*   **Asynchronous Delivery:** The `emit` method returns a promise. This means that events are handled asynchronously, likely through a queuing or channel system. The promise resolves once the event has been successfully dispatched.
*   **Client Targeting:**  Each event is specifically targeted to the client’s session ID, ensuring that the correct recipient receives the notification.
*   **Notification Focus:** The IBus is primarily designed for one-way notifications – informing clients about changes or results. The `output` field of an event is often empty unless it’s carrying a specific result.

**Example Usage:**

*   **Stateless Run Completion:** A ClientAgent might use the IBus to signal that a stateless run has finished, sending an event with the transformed result.
*   **Output Emission:**  After validating output, an agent can broadcast the final result to clients via the IBus.

**Key Features:**

*   **Redundancy:** The `clientId` field is duplicated in the event structure, which can be helpful for filtering or validation.
*   **Type Safety:** The use of generics (`<T extends IBaseEvent>`) ensures that events are always structured according to the `IBaseEvent` interface, promoting type safety.
*   **Integration:** The IBus works in conjunction with other system components, such as history updates and callbacks, to provide a comprehensive view of the swarm’s state.

## Interface IBaseEvent

The `IBaseEvent` interface forms the core structure for all events within the swarm system. It establishes a fundamental framework for communication between different components, including agents and sessions.

This interface defines the essential fields present in every event, and serves as the basis for more specialized event types like `IBusEvent` and `ICustomEvent`.

Key properties include:

*   **source:** A string that identifies the origin of the event.  This is typically a generic string like "custom-source," but in practice, it’s often overridden to be more specific, such as "agent-bus" as seen in the `ClientAgent`.
*   **clientId:** A unique identifier for the client receiving the event. This value corresponds to the `clientId` used in runtime parameters, ensuring events are delivered to the correct session or agent instance – for example, "client-123".

## Interface IAgentToolCallbacks

The `IAgentToolCallbacks` interface defines a set of callbacks to manage the lifecycle of individual tools within an agent swarm. These callbacks provide granular control over each tool’s execution.

Specifically, you can use the `onBeforeCall` callback to perform actions *before* a tool runs, such as logging, preparing data, or setting up necessary resources.  Conversely, the `onAfterCall` callback lets you execute tasks *after* a tool has completed, like cleaning up resources or recording results.

The `onValidate` callback offers a way to enforce custom validation rules for tool parameters, ensuring that only valid data is passed to the tool. Finally, the `onCallError` callback is invoked when a tool execution encounters an error, enabling you to handle and potentially recover from failures.  These callbacks offer a flexible way to monitor and manage the behavior of your agent swarm.

## Interface IAgentTool

The IAgentTool interface is the core component for managing tools used by individual agents within the swarm. It builds upon the broader ITool interface, providing a structured way to define and control how each tool operates.

Key aspects of the IAgentTool include:

*   **Documentation:** A `docNote` property allows for a descriptive explanation of the tool's purpose and usage.
*   **Identification:**  A unique `toolName` ensures each tool can be reliably identified across the swarm.
*   **Customizable Execution:** The `callbacks` property offers a flexible mechanism for adding lifecycle hooks, enabling developers to tailor the tool's execution flow.

The interface provides two primary methods for managing tool execution:

*   **`call`:** This method is responsible for actually running the tool, taking a data transfer object (`dto`) containing the tool's ID, the agent's ID, the agent's name, parameters, and information about whether it's the last call in a sequence.
*   **`validate`:** Before a tool is executed, the `validate` method is called to ensure the provided parameters are valid. This method can perform synchronous or asynchronous validation, depending on the complexity of the checks.

## Interface IAgentSchemaCallbacks

The `IAgentSchemaCallbacks` interface provides a set of callbacks to manage different stages of an AI agent’s lifecycle. These callbacks allow you to react to key events, such as when the agent is initialized, runs without historical context, or when a tool produces output.

Specifically, you can use these callbacks to respond to:

*   `onInit`:  Triggered when the agent is first set up.
*   `onRun`:  Called when the agent executes without relying on previous conversation history.
*   `onExecute`:  Invoked at the beginning of an agent’s execution.
*   `onToolOutput`:  Notified when a tool generates a result.
*   `onSystemMessage`:  Triggered when the agent sends a system message.
*   `onAssistantMessage`:  Called when the agent commits a message to the conversation.
*   `onUserMessage`:  Notified when a user sends a message.
*   `onFlush`:  Called when the agent’s history is cleared.
*   `onOutput`:  Triggered when the agent produces any output.
*   `onResurrect`:  Called when the agent is brought back to life after a pause or failure.
*   `onAfterToolCalls`:  Invoked after all tool calls within a sequence have finished.
*   `onDispose`:  Called when the agent is being shut down.

These callbacks offer fine-grained control over how your application interacts with and responds to the agent’s activities.

## Interface IAgentSchema

The `IAgentSchema` interface defines the configuration for each agent within the swarm. It outlines the agent’s core settings, including its unique name, the primary prompt it uses to guide its actions, and the specific completion mechanism employed.

Agents can be configured with a maximum number of tool calls they’re allowed to execute during a cycle, and they can utilize a defined set of tools and storage options.  Furthermore, agents can depend on other agents for coordinated transitions, and their output can be validated or transformed using optional callback functions.

The `IAgentSchema` also supports customization through the `callbacks` property, providing a mechanism to manage the agent’s lifecycle events.  This flexible schema allows for fine-grained control over individual agent behavior and integration within the larger swarm architecture.


## Interface IAgentParams

The `IAgentParams` interface defines the settings needed to run an individual agent within the swarm. It brings together key information like the agent’s unique identifier (`clientId`), a logging system (`logger`) for tracking activity, and a communication channel (`bus`) for interacting with other agents.  Crucially, it includes a history component (`history`) to record the agent’s actions and a mechanism (`completion`) for generating responses.  Agents can optionally utilize a set of tools (`tools`) to perform specific tasks, and the `validate` function provides a final check on the agent’s output before it’s finalized.

## Interface IAgentConnectionService

The `IAgentConnectionService` interface serves as a type definition, specifically designed to represent an `AgentConnectionService`. Its primary purpose is to clearly outline the structure of an `AgentConnectionService` while excluding any internal implementation details. This ensures that the `AgentPublicService` consistently uses only the publicly accessible operations, promoting a cleaner and more predictable API.


## Interface IAgent

The `IAgent` interface defines the core runtime behavior for an agent within the orchestration framework. It provides methods for the agent to operate independently, processing input without altering the conversation history – this is achieved through the `run` method.  

More complex operations, where the agent might need to update its internal state or conversation history, are handled via the `execute` method, which accepts an input and an execution mode.  

The `IAgent` also manages the flow of information with methods like `commitToolOutput`, `commitSystemMessage`, and `commitUserMessage`, allowing you to add messages to the agent’s context.  Finally, it includes methods for controlling the agent’s lifecycle, such as `commitFlush` to reset the agent’s state and `commitStopTools` to halt tool execution.
