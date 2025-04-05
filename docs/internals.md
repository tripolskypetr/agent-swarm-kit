---
title: docs/internals
group: docs
---

# agent-swarm-kit api reference

![schema](../assets/uml.svg)

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

## Class WikiValidationService

This service helps you manage and verify your wikis, ensuring they conform to the structures you've defined. You can think of it as a quality control system for your knowledge base. 

First, you add each wiki and its expected format (schema) to the service. Then, when you have new content for a wiki, you can use the service to validate it against that defined schema. This helps maintain consistency and accuracy within your wikis. The service also uses a logger to keep track of what's happening during the validation process.

## Class WikiSchemaService

The WikiSchemaService helps manage and organize different structures for wikis within the system. Think of it as a central place to store and access blueprints for how a wiki should be built.

It lets you register new wiki structures, giving them unique identifiers so you can easily find them later. You can then retrieve these registered structures by their identifier.

The service also includes a validation function to check if a new wiki structure meets basic requirements and a logging component for tracking what's happening. Internally, it uses a registry to keep track of all the registered wiki structures.

## Class ToolValidationService

This service helps ensure that the tools used by your AI agents are correctly configured and exist within the system. It keeps track of all registered tools and their specifications, making sure there aren’t any duplicates and that tools are properly set up before they're used. 

It works closely with other parts of the system – the tool registration service, the agent validation service, and the client agent – and uses logging to keep track of what's happening. To make things efficient, it caches the results of validation checks.

You can add new tools to this service using the `addTool` function, which also handles ensuring that the tool isn't already registered. The `validate` function then confirms that a tool exists, providing a quick check before an agent tries to use it.

## Class ToolSchemaService

This service manages the definitions of tools that agents use to perform tasks. Think of it as a central library where all the tool blueprints are stored and kept consistent. It ensures that each tool definition is valid before it's used by an agent, checking for things like the presence of essential functions and data.

When a new tool is added, it's checked for basic accuracy.  The service keeps track of all these tools and makes them accessible to different parts of the system, like when setting up agents or running tasks. It also keeps a record of its actions, providing helpful information when debugging or monitoring the swarm. It collaborates closely with other services to make sure agents have the right tools and those tools are being used correctly.

## Class ToolAbortController

This class helps you manage how asynchronous tasks are canceled, providing a clean way to stop things in progress. It essentially wraps the standard `AbortController` functionality, making it easier to use. 

Inside, it holds an `AbortController` – if your environment supports it – and gives you access to its signal.

You can use the `abort` method to signal that an operation should be stopped, which will notify any listeners that are set up to respond to the cancellation. If `AbortController` isn't available, the `abort` method simply won’t do anything.

## Class SwarmValidationService

This service acts as a guardian for your swarm configurations, ensuring they’re set up correctly. It keeps track of all registered swarms and verifies their details, like making sure each swarm has a unique name and valid lists of agents and policies. 

You can use it to register new swarms, retrieve agent and policy lists for existing swarms, or check if a swarm is properly configured. It’s designed to be efficient, remembering previous validation checks to speed things up. The service also logs its actions to help you understand what’s happening and troubleshoot any issues.

## Class SwarmSchemaService

This service acts as a central library for defining and managing the blueprints for your AI agent swarms. Think of it as a place to store all the necessary information – like which agents should be part of a swarm, what their roles are, and what rules they need to follow.

It carefully checks these blueprints to make sure they're structurally sound before they're used. This service interacts with several other parts of the system, ensuring that swarms can be configured, agents can be linked together, and public APIs can access swarm information.

You can register new swarm blueprints, retrieve existing ones, and the system keeps track of everything in a reliable and organized way, making it easy to build and manage your AI agent swarms.  It’s designed to work seamlessly with other services involved in swarm creation and management.

## Class SwarmPublicService

This class acts as the main entry point for interacting with a swarm of agents. Think of it as a friendly interface to manage and control the swarm's activities from the outside. It handles tasks like sending messages, controlling output, getting information about the current agent, and even cleaning up the entire swarm when it's finished.

Each action you take through this class is carefully tracked and scoped to a specific client and swarm, ensuring everything runs smoothly and predictably. It relies on several other services behind the scenes (like logging and connection management) to make everything work.

Essentially, it's the gatekeeper for all public-facing operations related to a swarm, providing a safe and organized way to manage its lifecycle and behavior. It allows other parts of the system, like agent execution or agent-specific operations, to safely interact with the swarm.

## Class SwarmMetaService

The SwarmMetaService helps organize and visualize your swarm system's structure. Think of it as a translator that takes the raw data describing your swarm—including its agents and their relationships—and transforms it into a standard UML diagram format.

It builds a tree-like representation of your swarm using information from other services, essentially creating a map of how everything connects. This map can then be used to generate visual diagrams that make understanding and debugging your swarm much easier.

The service integrates with logging and other components to keep things consistent, and it's designed to be a central point for creating these visualizations, which are particularly helpful for documentation and troubleshooting. You can think of it as the engine that powers the visual representation of your swarm's architecture.

## Class SwarmConnectionService

This service manages how different parts of the system connect and interact with swarms, which are essentially groups of agents working together. It's designed to be efficient, reusing swarm setups whenever possible.

Think of it as a central hub. It fetches or creates the necessary components for a specific swarm, like its configuration and agent instances. It’s heavily integrated with other services, handling everything from logging and emitting messages to controlling agent output and managing navigation.

It’s like having a manager who's responsible for setting up and coordinating a team of agents.

Here's a breakdown of what it offers:

*   **Getting Swarms Ready:** It creates and reuses swarm setups efficiently.
*   **Sending Messages:**  It broadcasts messages to the relevant sessions.
*   **Navigation:**  It allows for moving between different agents within a swarm.
*   **Controlling Output:** It can pause or retrieve the output generated by an agent.
*   **Tracking Agents:** It provides a way to check which agent is currently active.
*   **Updating Agent Information:**  Allows for updating and modifying the current swarm configuration.
*   **Cleaning Up:** It ensures resources are released when a swarm is no longer needed.

## Class StorageValidationService

This service acts as a guardian for your swarm's storage configurations. It keeps track of all registered storage locations and their setups, making sure each one is unique and correctly configured.

Think of it as a central registry – when you add a new storage location, this service registers it and verifies its details. When you want to use a storage, it double-checks that it exists and its embedding settings are valid. 

It works closely with other parts of the system to ensure everything is set up correctly, and it uses clever techniques to speed up the validation process. The whole process is logged to help you keep an eye on things.

## Class StorageUtils

This class provides helpful tools for managing data storage associated with specific clients and agents within the swarm. Think of it as a set of functions to put information into, retrieve it, update it, or remove it from storage, all while ensuring proper permissions and tracking activity.

You can use these functions to fetch a limited number of storage items based on a search term, insert or update items, delete them by ID, or retrieve a single item.  There's also a function to list all items in a storage area, optionally filtering them down based on specific criteria. 

For managing the overall storage, functions are provided to create numeric indexes or to completely clear the contents of a storage area. Before any action is taken, the system verifies that the client has the necessary permissions and that the agent is properly registered to use that storage.

## Class StorageSchemaService

The StorageSchemaService acts as a central place to manage how your agents handle storage. It keeps track of storage configurations, making sure they are set up correctly and consistently. Think of it as a library of storage blueprints that different parts of the system can use.

This service ensures storage setups are valid before they’re used, and it logs these actions to help with monitoring. It works closely with other services like those handling storage connections, agent configurations, and even the public storage API, ensuring everything plays nicely together.  Essentially, it simplifies the process of defining and using storage for your agents, promoting reliability and organization within the swarm.

## Class StoragePublicService

This service manages storage specifically for each client, allowing the system to keep data separate and organized. It's designed to work closely with other components like the client agent and performance tracking, ensuring client-specific data is handled correctly.

Here’s a breakdown of what it does:

*   **Client-Specific Storage:** It handles storage operations tied to individual clients, unlike system-wide storage.
*   **Core Functions:** It provides methods to retrieve, add, update, delete, list, and completely clear data for a given client's storage.
*   **Logging & Context:**  It carefully logs actions and ensures operations are scoped correctly for security and accountability.
*   **Integration:** It’s tightly integrated with components like the client agent and performance service, making sure storage is handled consistently across the system.



The `take` method retrieves a list of items, `upsert` adds or updates, `remove` deletes, `get` retrieves a single item, `list` retrieves all items, `clear` empties the storage, and `dispose` cleans up the storage area completely.

## Class StorageConnectionService

This service is the central point for managing how your AI agents access and interact with storage. It handles creating and reusing storage connections for each agent and storage location, making sure everything is efficient.

Think of it as a smart librarian, knowing where each agent's books are stored and ensuring they don't have to re-fetch the same information repeatedly.

Here's a breakdown of what it does:

*   **Manages Storage Connections:** It creates and reuses connections to storage locations specific to each agent.
*   **Smart Caching:** It caches frequently used storage connections to avoid unnecessary overhead.
*   **Handles Shared Storage:** It delegates management of shared storage locations to a separate service.
*   **Provides Common Operations:**  It provides methods like `take`, `upsert`, `remove`, `list`, and `clear` for interacting with storage data, aligning with a public API.
*   **Tracks Usage:** It keeps track of how storage is being used for monitoring and validation.
*   **Ensures Clean Up:** It properly releases resources when storage is no longer needed.

Essentially, this service simplifies how agents access and manage data within the system, boosting performance and making everything easier to maintain.

## Class StateUtils

This class offers helpful tools for managing data associated with individual clients and agents within the swarm. You can use it to fetch existing state information, update state values – either by providing a new value or calculating it from the existing one – and completely reset state data when needed. Before any operation, it verifies that the client is authorized and the agent is properly registered, and all actions are logged for tracking purposes.

## Class StateSchemaService

The StateSchemaService manages all the blueprints for how our agents handle and use data – these blueprints are called state schemas. Think of it as a central address book for state configurations, ensuring they're all set up correctly. It keeps track of these schemas and makes them accessible to other services within the system, like those responsible for connecting to states, managing agents, and providing public APIs. 

Before a schema can be used, it's checked for basic correctness, and each registration and retrieval is logged for monitoring. This service is fundamental to defining how client-specific and shared states operate within the swarm. It ensures that each state has a clear definition and can be reliably accessed and used by our agents.

## Class StatePublicService

This service manages state specifically tied to individual clients within the system. Think of it as a way to keep track of information unique to each client, as opposed to system-wide settings or long-term storage. It's designed to work closely with other components like the agent handling client interactions and the performance tracking system.

The service provides a straightforward set of operations: you can set new state for a client, clear existing state back to its initial condition, retrieve the current state, or clean up resources associated with that state.  All these actions are logged if logging is enabled, allowing for easy tracking of state changes.  Essentially, it's a dedicated place to handle and manage client-specific information within the larger swarm orchestration framework.

## Class StateConnectionService

This service is responsible for managing how your agents store and use data. It handles both data specific to individual clients and shared data that's accessible across the entire system.

Think of it as a central hub that efficiently creates and manages these "state" objects for your agents. It caches these state objects to avoid unnecessary creation, making things faster. When a piece of data needs to be updated, it makes sure those changes are handled safely, even if multiple agents are trying to modify it at the same time.

It works closely with other services to keep track of what's happening, configure states, and ensure that agents are behaving as expected. This entire system helps organize and secure the data powering your agents.

Here's a quick rundown of what you can do with it:

*   **Get State:** Retrieve the current value of a specific data point.
*   **Set State:** Update a data point, ensuring changes are applied safely.
*   **Clear State:** Reset a data point to its initial value.
*   **Dispose:** Clean up resources associated with a state when it's no longer needed.

## Class SharedStorageUtils

This class offers tools for interacting with a shared storage space used by your AI agent swarm. Think of it as a central repository where agents can exchange information.

You can use it to fetch data based on search terms and the number of results you need, insert new data or update existing entries, delete specific items by their unique ID, and retrieve individual items.  It also allows you to list all items stored, potentially filtering them based on certain criteria, or completely erase the contents of a storage area. Each operation is carefully managed to ensure proper validation and logging.

## Class SharedStoragePublicService

This service manages how different parts of the system interact with shared storage, providing a public way to store and retrieve information. It works by translating requests into calls to the underlying storage connection service and keeps track of what's happening through logging.

Here's a breakdown of what you can do with this service:

*   **Retrieve data:** You can search for and get lists of items from storage, or fetch a specific item by its ID.
*   **Store and update data:** You can add new items to storage or modify existing ones.
*   **Delete data:** You can remove individual items or clear out the entire storage.
*   **Logging:** Operations are logged to help with debugging and monitoring, but this can be turned off.

This service is used by several components of the system, including client agents, performance tracking, and documentation tools, making sure all interactions with the shared storage are handled consistently.

## Class SharedStorageConnectionService

This service manages shared storage across different agents in your system. Think of it as a central repository where agents can share data, ensuring everyone is accessing the same information. 

It uses a clever caching system to avoid creating multiple copies of the same storage, keeping things efficient. When an agent needs to access or modify shared data, this service handles the details, ensuring consistency and coordinating with other parts of the system. 

You can use methods like `getStorage` to retrieve a specific storage area, and `take`, `upsert`, `remove`, `get`, `list`, and `clear` to perform operations like searching, adding, updating, deleting, retrieving, and resetting data within that shared space. These methods mirror operations you might find in other storage services, ensuring a consistent experience for different agents. The whole process is logged and configured to work seamlessly with other services in your architecture.

## Class SharedStateUtils

This class provides helpful tools for managing information shared among agents in your swarm. Think of it as a central repository where agents can read, write, and reset common data. 

You can use it to get existing shared data by name, update the data directly, or even calculate new data based on what's already there.  There’s also a convenient way to completely clear a piece of shared data back to its starting point. All these operations happen with some logging to help you understand what’s happening within your swarm.

## Class SharedStatePublicService

This service provides a way to manage shared data across your AI agent swarm. Think of it as a central repository where different agents can read and update information. It allows you to easily set, clear, and retrieve this shared data, making it possible for agents to coordinate and react to changes in a consistent way. The system keeps track of who's doing what and when, using logging for transparency, and it's designed to work seamlessly with other key parts of the swarm, like agent execution and performance monitoring. It’s built to be flexible, supporting different data types for the shared state.

## Class SharedStateConnectionService

This service helps manage shared data across different parts of your system, like different agents working together. Think of it as a central place where agents can access and update the same information safely.

It keeps track of these shared data pieces, making sure only one version exists and changes are handled in a controlled way. It remembers previously accessed data to avoid unnecessary work, and makes sure updates are processed one at a time, preventing conflicts.

You can retrieve the current state, update it by providing a function that modifies the previous state, or completely reset it to its original form. The service uses configuration to determine how the data is stored (if at all) and keeps a record of what's happening for debugging purposes, if enabled. It's designed to work seamlessly with other system components, ensuring consistent behavior and easy integration.

## Class SessionValidationService

The SessionValidationService manages the lifecycle of sessions within the swarm system, keeping track of how different components like agents, storage, and states are being used by each session. It essentially acts as a central record keeper for session activity.

When a new session is created, this service registers it and logs the event.  It maintains lists to monitor which agents, history entries, storage resources, and states are linked to each session. When resources are no longer needed within a session, the service removes them from these lists, ensuring a clean and consistent state.

To optimize performance, it uses memoization to avoid repeatedly checking for session existence – essentially remembering previous checks.  The service also works hand-in-hand with other components like the session management service, agent tracking, and storage management, helping to ensure everything functions correctly and efficiently. It's designed to be flexible, allowing for resource cleanup without fully removing a session’s data. Logging is a key part of the service, providing valuable insights into session activity and potential issues.

## Class SessionPublicService

This class acts as a public gateway for interacting with sessions within the swarm system. It handles sending messages, executing commands, and managing session state, while ensuring proper context and logging throughout. Think of it as a helpful assistant that forwards your requests to the underlying session machinery and keeps track of what's happening along the way.

It provides methods for things like sending messages (`notify`, `emit`), running commands (`execute`, `run`), connecting to a session (`connect`), and committing various types of messages like tool outputs, system messages, and user input. All of these operations are carefully wrapped with additional services for context, performance tracking, and logging, providing a standardized and controlled way to manage sessions. Essentially, it’s the public face of session management, ensuring operations are performed reliably and consistently.


## Class SessionConnectionService

This service manages connections and interactions within a swarm of AI agents, acting as a central hub for sessions. It efficiently reuses session instances by caching them based on client and swarm identifiers, saving resources and boosting performance. Think of it as a session manager, allowing various components to interact with AI agents in a controlled and consistent manner.

Several key features are enabled through this service:
*   **Session Creation and Reuse:** Automatically creates and reuses session environments for different clients and swarms.
*   **Message Handling:** Facilitates sending notifications, emitting messages, and executing commands within a session.
*   **Tool and System Message Management:** Enables the recording of tool outputs, system messages, and assistant responses for maintaining session history.
*   **Controlled Workflow:** Provides features like stopping tool execution and flushing session data for refined workflow control.
*   **Consistent Logging:** Logs important events for debugging and monitoring.

Essentially, this service provides a streamlined and efficient way to manage interactions within a swarm system, ensuring consistency and performance while providing tools for controlling the agent workflow.

## Class SchemaUtils

This class provides helpful tools for working with agent session data and formatting information. It lets you save data to and retrieve data from the memory associated with individual clients, making sure the sessions are valid during these operations. You can also use it to convert objects or lists of objects into nicely formatted strings, even handling nested data and allowing you to customize how keys and values are represented. Essentially, it simplifies managing and presenting data related to your agents' sessions.

## Class RoundRobin

This component, called RoundRobin, helps distribute tasks across a set of creators in a predictable, rotating order. Think of it like a queue where each item gets processed by the next available resource.

It works by keeping track of a list of “tokens,” which are essentially identifiers for the creators it will cycle through.  Each token is then used to invoke a specific creator function, passing along any arguments you provide.

The `create` method is the main way to use it - you give it your list of tokens and a function that knows how to create an instance based on a token.  This method then returns a new function that will automatically rotate through those creators.

Internally, it keeps track of which creator is currently active and logs information for debugging if you have logging enabled.

## Class PolicyValidationService

This service helps keep track of and verify policies used by your AI agents. It acts like a central registry, making sure each policy is unique and exists before it’s put into action. 

It works closely with other parts of the system, including the policy registration, enforcement, agent validation, and logging components. The service is designed to be efficient, using techniques like caching to speed up the validation process. 

You can add new policies to this registry, and it will ensure they are properly registered. The primary function is to validate if a policy exists, which is a key step before the agents actually use the policy.

## Class PolicyUtils

This class provides helpful tools for managing client bans within your AI agent swarm. Think of it as a central place to handle adding, removing, and checking if a client is blocked by a particular policy in a specific swarm. 

It offers three key functions: `banClient` to block a client, `unbanClient` to remove a block, and `hasBan` to quickly check if a client is currently banned. Before taking action, each function carefully verifies all details like the client ID, swarm name, and policy name to ensure everything is correct, and it keeps track of what's happening for auditing purposes.

## Class PolicySchemaService

This service acts as a central hub for managing the rules that govern how your AI agents operate within the swarm system. Think of it as a library where you store and organize the "policy schemas" - these schemas define things like who is allowed to do what, and under what conditions.

It keeps track of these policies using a special registry, and it ensures each policy is at least structurally sound before it’s put into use. This service works closely with other parts of the system, such as those responsible for enforcing rules, running agents, and managing user sessions, making sure everyone follows the established guidelines. Registration and retrieval operations are tracked for informational purposes, providing visibility into policy management activities.

## Class PolicyPublicService

This service manages how policies are applied and enforced within the agent swarm. It acts as a central point for checking if clients are banned, validating data they send and receive, and for actually banning or unbanning clients. Think of it as the gatekeeper ensuring everyone follows the rules defined by the policies.

It works closely with other services – like the logging service for detailed records, and the connection service for the actual policy checks – and ensures operations are scoped correctly and tracked. You can use it to check if a client is currently banned, get the reason for a ban, validate data against policy rules, or to directly ban or unban a client from a specific swarm. The whole process is designed to be flexible and well-documented, allowing for detailed logging and monitoring of policy-related actions.

## Class PolicyConnectionService

This class manages how policies are applied and enforced across different parts of the system. Think of it as a central point for controlling access and behavior based on rules you define.

It cleverly avoids repeating work by storing frequently used policy information in a cached memory. This makes things run much faster.

It integrates closely with other services like logging, event handling, and schema management, ensuring consistent behavior and communication.

Key functions include checking for bans, retrieving ban messages, validating input and output, and of course, banning or unbanning clients – all while working within the context of specific clients, swarms, and policies. It mirrors the functionality offered by other public services.

## Class PersistSwarmUtils

This class helps you manage how your AI agents and their navigation history are saved and retrieved. It's designed to keep track of which agent is currently active for each user and swarm, and to record the sequence of agents they've used.

It provides simple methods for getting and setting the active agent and navigation stack for a specific user and swarm. You can even customize how this data is stored – whether it's in a database, file, or even in memory – by using adapters. This allows you to tailor the persistence strategy to your specific needs. It ensures that persistence is handled efficiently, creating only one storage instance per swarm.

## Class PersistStorageUtils

This class provides tools for managing how data is stored and retrieved for different clients and storage areas within the swarm system. It lets you access and update data persistently, making sure information is saved and available later.

Essentially, it helps organize data for each client, giving each client its own dedicated storage space. It remembers what’s stored and automatically provides it when needed.

You can even customize how this data is stored, using different storage methods like databases, if you need something beyond the default approach. This provides a way to build more specialized storage solutions.


## Class PersistStateUtils

This class helps manage how data is saved and retrieved for each agent within the swarm. It allows you to store information – like agent variables or context – and then reliably load it later. 

The system remembers state for each agent (identified by a `SessionId`) and for each specific piece of data you want to save (`StateName`). To make things efficient, it ensures that only one storage mechanism is used for each type of data being tracked.

You can also customize how this saving and loading happens by providing your own data storage method. This allows for advanced configurations, such as using a database instead of just keeping things in memory.


## Class PersistPolicyUtils

This class provides tools to manage how client ban information is stored and retrieved within your AI agent swarm. Think of it as a central place to keep track of which clients are blocked from participating.

It offers a way to get the current list of banned clients for a particular policy and swarm, falling back to an empty list if nothing’s been set. It also lets you update that list, ensuring the information is saved for later use.

You can even customize how this data is stored – for instance, using a database instead of a simple file – which gives you a lot of flexibility in how your swarm manages client access.

## Class PersistMemoryUtils

This class helps manage how your AI agents remember information for each individual user or session. It lets you save and retrieve data associated with a specific user ID, allowing agents to pick up where they left off. 

It uses a clever system to ensure that only one memory storage is created per user, which is efficient for the overall system. You can even customize how this data is stored – for example, you might use an in-memory store or a database. 

The class provides easy methods to save data (`setMemory`) and load it back (`getMemory`), along with a way to clean up memory when it's no longer needed (`dispose`). If you need to change how the memory is actually persisted, you can configure a custom storage adapter.

## Class PersistEmbeddingUtils

This utility class helps manage how embedding data is stored and retrieved within the swarm system. It's designed to work with a flexible adapter, allowing you to choose how and where your embedding vectors are persisted – whether that's in memory, a database, or another system.

The class keeps track of embedding storage, ensuring that you’re only using one persistence instance for each type of embedding data, which helps to conserve resources. You can check if a pre-calculated embedding already exists, and if not, store newly computed embeddings for later use.

You have the ability to customize how embedding data is handled by providing your own constructor, giving you a high level of control over the persistence process and enabling features like advanced tracking.

## Class PersistAliveUtils

This utility class helps keep track of which clients are online and offline within your AI agent swarm. It's designed to manage the persistence of this "alive" status, associating it with a specific client identifier and swarm name. The system cleverly memoizes storage so each client only has one persistence instance, making it efficient. You can easily mark clients as online or offline, and then check their status later to see if they're ready to participate. For more advanced scenarios, you can even swap out the default persistence method with your own custom solution.

## Class PerfService

The `PerfService` class is responsible for tracking and logging performance data for client sessions within the agent swarm system. It collects information like execution times, input/output sizes, and session states, compiling them into easily digestible reports.

Essentially, it acts as a performance monitoring tool that works behind the scenes when agents (like `ClientAgent`) are executing tasks.

Here’s a breakdown of what it does:

*   **Data Collection:** It starts and stops tracking execution timings, input and output sizes, and session states when clients are running processes.
*   **Aggregation:** It combines all of this data into structured records – one per client and one overall system view.
*   **Reporting:**  It can convert this data into a format suitable for reporting or analytics.
*   **Dependencies:** It relies on other services (like `SessionValidationService` and `StatePublicService`) to gather the necessary information.
*   **Configuration:**  It can be controlled by configuration settings (`GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`) to enable or disable certain logging behaviors.
*   **Clean up:** It allows you to clear performance data for specific clients when they are no longer active.



The class provides methods to start and end executions, calculate averages and totals, and ultimately generate performance reports for both individual clients and the entire swarm.

## Class NavigationValidationService

This service helps manage how agents navigate within the swarm, making sure they don't waste time retracing their steps. It keeps track of where agents have already been, preventing redundant journeys. 

You can inject a logger to record navigation activity and debug any issues. The core of the service is a smart function that remembers navigation routes for each client and swarm, so routes aren’t recreated every time. 

The service also includes functions to start monitoring a route, clear an existing route to begin fresh, and to completely remove a route when it's no longer needed.

## Class MemorySchemaService

This service manages temporary, in-memory data associated with individual sessions within the swarm system. Think of it as a simple scratchpad for each session, allowing agents to store and retrieve information without relying on persistent storage. It provides basic functions to put data in, get data out, and clear it when a session ends. This data isn't validated or saved long-term; it’s just a way to give each session its own little workspace. 

It works in conjunction with other services like the session connection service and agent components, and it keeps track of what's happening with logging.  Essentially, it’s a lightweight way to give each session its own short-term memory.

You can check if data exists for a particular session, write new data or update existing data, read data, and completely clear the data for a session when it's no longer needed.

## Class LoggerService

This class provides a central logging system for the entire agent swarm. It handles different levels of logging – normal, debug, and informational – and ensures these messages are sent to both a general system logger and a client-specific logger, allowing for detailed tracking and debugging.

The system automatically adds context like client IDs to log messages, helping trace where events originate. You can control which types of logs are generated through global configuration settings.

Importantly, you can change the default logging system at runtime, which is useful for testing or creating custom logging configurations. It integrates with other parts of the system like client agents and performance tracking tools to provide a comprehensive logging solution.

## Class LoggerInstance

This class handles logging specifically for a client, allowing you to customize how and where log messages appear. It lets you define what happens when a log message is generated, and integrates with a global configuration to control whether logs show up in the console.

When you create a `LoggerInstance`, you give it a unique client identifier and can provide custom callback functions to handle different logging levels.  The `waitForInit` method ensures that any initialization tasks, like running an `onInit` callback, happen only once.

You can use `log`, `debug`, `info`, and `dispose` to send messages, control console output, and clean up resources respectively. Finally, `dispose` lets you gracefully shut down the logger and run a final cleanup callback.

## Class HistoryPublicService

This service handles how history information is managed and accessed within the swarm system. It acts as a public interface for interacting with an agent’s history, ensuring operations are properly scoped and logged.

It allows you to:

*   **Add messages to the history:** The `push` method lets you add new messages, useful for recording actions taken by agents or system messages.
*   **Retrieve the most recent message:** The `pop` method is used to get the latest message from the history.
*   **Convert history to arrays:** You can transform the history into arrays for different purposes – whether it's preparing data for an agent's processing or creating documentation. One method creates arrays tailored for agent use, while another provides a raw array of items.
*   **Clean up the history:** The `dispose` method releases resources associated with the agent’s history when it’s no longer needed.

The service integrates with other components like logging, performance tracking, and agent management, ensuring a consistent and well-managed history across the entire swarm system. It's designed to be flexible, allowing for various use cases from internal system logging to client-facing interaction.

## Class HistoryPersistInstance

This class is responsible for keeping track of a conversation history for an agent, ensuring that messages are saved both in memory and on disk. When a new agent is created, this class initializes itself, potentially loading previous conversations from storage. 

You can add new messages to the history using the `push` method, which also handles saving the message persistently. To retrieve the complete history, you can iterate through the messages using `iterate`.  If you need to remove messages, `pop` lets you retrieve and remove the most recent one. When you're finished with the history, `dispose` cleans up any resources, optionally clearing all history for a specific agent or all agents.

## Class HistoryMemoryInstance

This component keeps track of a conversation's history in memory, without saving it permanently. It's designed to be used by individual agents within a larger system.

When creating a new history, you need to provide a unique identifier for the agent using it. You can also specify callback functions to be notified when messages are added, removed, or the history is cleared.

The `waitForInit` method sets up the history for a specific agent.  The `iterate` method lets you go through the history one message at a time, potentially applying some modifications or filters along the way. Adding a new message is done with `push`, removing the last message with `pop`, and finally, to completely clear the history (and free up memory), you can use `dispose`.

## Class HistoryConnectionService

This service is responsible for managing the history of interactions with each agent within your system. Think of it as a central place to store and retrieve the sequence of messages sent and received for a specific client and agent.

It cleverly reuses history data whenever possible by caching it – if the system needs to access the history for the same client and agent again, it doesn't have to recreate it from scratch. This caching is managed automatically.

The service interacts with several other components, like logging, event handling, and validation, ensuring everything works together smoothly. It provides methods to add messages to the history, retrieve messages, format history for agent use, and clean up resources when the history is no longer needed. Essentially, it’s the backbone for keeping track of what’s happening between your system and each agent.

## Class EmbeddingValidationService

This service keeps track of all the embeddings registered within the system, making sure they are unique and exist when needed. It works closely with other services, like the one that registers embeddings and the one that manages how embeddings are used in searches. 

Think of it as a central registry for embeddings, ensuring everything is in order. The service logs its activities and uses a clever trick called memoization to speed up validation checks. 

You can add new embeddings to the registry using `addEmbedding`, and verify if an embedding exists using `validate`, which is especially helpful when clients are trying to search based on embeddings.

## Class EmbeddingSchemaService

The EmbeddingSchemaService acts as a central place to manage how embeddings are created and used within the swarm system. It keeps track of different embedding definitions, ensuring they are structurally sound before they're used. Think of it as a library of embedding recipes – each recipe defines how to generate an embedding for a specific type of data.

It works closely with other services involved in storing and retrieving data, like StorageConnectionService, and ensures that the embedding logic (the ‘recipes’) is valid and consistent. This service is vital for performing searches and comparisons based on embeddings, powering features like finding similar items within the swarm. Registration and retrieval are logged to help track activity and troubleshoot issues, but this logging can be controlled.

## Class DocService

This class is responsible for creating documentation for your AI agent swarm system, including its swarms, agents, and performance data. It generates Markdown files describing swarm and agent schemas, and JSON files for tracking performance metrics.

It uses several other services to gather information, such as schema services for swarms and agents, and performance services for gathering metrics. It also includes services for generating diagrams.

The `dumpDocs` function is a key component – it generates documentation for all swarms and agents, creating a structured directory of Markdown files. `dumpPerfomance` and `dumpClientPerfomance` handle system-wide and client-specific performance data, respectively, writing them to JSON files.  The whole process is designed to be concurrent and well-logged.

## Class CompletionValidationService

This service helps ensure that completion names used within the agent swarm are valid and unique. It keeps track of all the registered completion names and checks them against new requests. 

When a new completion name is introduced, this service registers it, making sure it hasn't been used before.  When an agent tries to use a completion, this service checks to see if it’s a known and allowed name. 

It’s designed to work closely with other parts of the system, such as the completion registration service and agent validation, and uses logging to keep track of everything that's happening. To make things efficient, it remembers the results of previous validation checks.

## Class CompletionSchemaService

This service acts as a central place to manage the blueprints for how agents complete tasks. It keeps track of these blueprints, called completion schemas, and makes sure they're set up correctly.

Think of it as a librarian for agent logic – it stores and organizes the instructions agents use to finish their work. It verifies these instructions before adding them and provides a way to easily find them when needed.

The service works closely with other parts of the system, including agent creation and execution, ensuring that agents have access to valid and reliable completion logic. It provides a consistent way to define and access the steps involved in agent tasks, making the whole system more organized and dependable. The system keeps a record of everything it does, making it easier to troubleshoot issues.

## Class ClientSwarm

This class, `ClientSwarm`, is essentially the conductor of a group of AI agents working together. It manages which agent is currently active, keeps track of the order agents were used (the navigation stack), and handles messages flowing between them.

Think of it as a central hub. It's responsible for ensuring agents are properly connected and that their outputs are delivered reliably. If you need to change which agent is working, or need to cancel a task, this class provides the tools to do so. It also keeps track of changes and communicates those updates to other parts of the system.

It provides methods for sending messages, retrieving agent information, and managing the flow of work. When an agent produces an output, this class makes sure that information gets distributed correctly. It also handles errors gracefully, like validating messages and providing ways to cancel ongoing tasks.  Finally, when the swarm is finished working, a `dispose` method cleans everything up.

## Class ClientStorage

This class manages how data is stored and retrieved within the swarm system, offering features like searching based on similarity. It acts as a central hub for data operations, handling tasks like adding, removing, and clearing data, and ensuring these operations are performed in a controlled, sequential manner.

It remembers recently used data to speed things up and works closely with other parts of the system to keep everything synchronized. The class provides tools for quickly finding similar items, listing data, and efficiently managing storage lifecycle.

Here's a breakdown of what it does:

*   **Data Storage:** It’s responsible for storing and managing data within the system.
*   **Similarity Search:** It can find items similar to a given search term.
*   **Controlled Updates:** All changes (adding, removing, clearing) happen in a queue to avoid conflicts.
*   **Efficient Retrieval:** It uses internal caching to make retrieving data faster.
*   **Event Notifications:** It informs other parts of the system when data changes.
*   **Lifecycle Management:** It cleans up resources when it’s no longer needed.


## Class ClientState

This class manages the state for a single client within the swarm system. It’s responsible for holding the current data, handling read and write operations in a safe and controlled way, and notifying other parts of the system when the state changes.

Think of it as a central hub for a client's information, ensuring that updates and reads happen in the correct order and are consistent. It works closely with other services like the connection manager and the agent to make sure everything is synchronized.

You can use it to initially load data, make changes to the state, and safely retrieve information. When you're finished with a client's state, the `dispose` function ensures a clean shutdown and releases resources properly. It’s designed to make managing client-specific data within the larger swarm system reliable and straightforward.


## Class ClientSession

The `ClientSession` class manages a single conversation or interaction within your AI agent swarm. Think of it as a dedicated workspace for a client to interact with the swarm. It handles sending messages, validating them against rules, and coordinating the execution of tasks by the agents.

Here's a breakdown of what it does:

*   **Message Handling:** It lets you send messages to the swarm, either for execution by agents or just for notifications.
*   **Validation:** It checks messages against pre-defined policies to ensure they’re valid and safe.
*   **Agent Coordination:** It works with the agents in the swarm to actually process messages and retrieve results.
*   **History Tracking:** It keeps a record of messages and actions taken within the session, which can be useful for debugging and analysis.
*   **Real-time Communication:** It can connect to external systems to send and receive messages, enabling interactive applications.

The `ClientSession` class offers several methods to control the interaction, like `execute` for running tasks, `run` for quick stateless completions, and `commit...` methods to update the session’s history with user messages, tool outputs, and system updates.  Finally, the `connect` method is key for integrating the session with an external application. When a session is finished, `dispose` cleans up resources.

## Class ClientPolicy

The ClientPolicy class manages how clients interact with the swarm, acting as a gatekeeper to ensure security and compliance. It handles things like banning clients, checking their messages for validity, and restricting their access based on defined rules. 

This policy uses a list of banned clients that’s loaded only when needed, and it can automatically ban clients if they violate the rules. It’s designed to work closely with other parts of the system, such as the services that manage swarm connections and individual client agents. The policy can also be customized with your own rules and messages, providing a flexible way to control client interactions. Banning and unbanning clients updates a list that's managed, and these actions are communicated to the rest of the system.

## Class ClientHistory

This class manages the history of messages for a specific agent within the system. It essentially remembers the conversation so far, allowing the agent to refer back to previous interactions.

The system allows you to filter which messages are stored and retrieved, tailoring the history to the agent’s needs and preventing irrelevant information from being included. You can add new messages to the history, retrieve the most recent message, or get a full list of messages.

When an agent is finished, this class helps clean up and release any resources it's using, ensuring a tidy shutdown. The process involves specific parameters and interacts with other parts of the system to keep things organized and efficient.

## Class ClientAgent

This class, `ClientAgent`, is the heart of a client-side agent participating in a swarm system. Think of it as a controller managing how the agent receives messages, executes tasks, and interacts with other components. It carefully handles incoming instructions, orchestrating tool usage and historical updates.

Here's a breakdown:

*   **Managing Actions:** It receives user messages and determines what needs to be done—running a simple completion or kicking off a series of tool calls. It makes sure these actions don't overlap, preventing chaos.
*   **Built-in Recovery:** If things go wrong (like a tool failing), it has strategies for getting back on track, like re-trying the model or providing a temporary response.
*   **Staying Connected:** It communicates with various services to handle things like history, tools, completions, swarm coordination, and system-wide events.  It also keeps track of agent state changes and errors.
*   **Responding and Reporting:**  It emits outputs, which can be transformed, and signals various events, keeping everyone informed about what's happening.
*   **Cleanup:** The `dispose` method allows for proper shutdown and resource cleanup.

Essentially, this class provides a robust and organized way to run an AI agent within a larger, interconnected system.

## Class ChatUtils

This class, `ChatUtils`, manages chat sessions for different clients and coordinates them within a swarm. Think of it as the central hub for starting, sending messages, and ending conversations. 

It allows you to begin a chat session for a specific client and swarm, and then send messages back and forth. When a chat session is no longer needed, you can dispose of it to release resources. 

You can also register functions to be notified when a chat session is being cleaned up. The system is designed to be flexible; you can specify which type of chat instance constructor to use and customize how chat instances behave by providing callback functions.

## Class ChatInstance

This class represents an individual chat session within a swarm of AI agents. It’s given a unique identifier (clientId) and associated with a specific swarm name to keep track of its context. When the chat is no longer needed, the `dispose` method gracefully shuts it down and releases resources. 

You can use `sendMessage` to send a message within the chat, and it will be handled by the underlying swarm. The `checkLastActivity` method periodically verifies if the chat is still active, and `beginChat` starts the session itself. 

Finally, `listenDispose` allows you to be notified when a chat instance is being terminated.

## Class BusService

This class, `BusService`, is the central hub for managing communication within the swarm system. Think of it as a sophisticated messaging service.

It handles sending and receiving event notifications between different components, like client agents, performance trackers, and documentation services. It lets other parts of the system subscribe to specific events, and then sends those events out when they occur.

Here's a breakdown of what it does:

*   **Event Management:** It lets other components sign up to receive notifications about specific events happening in the system. It also handles sending those notifications to the correct subscribers.
*   **Wildcard Subscriptions:** It supports "wildcard" subscriptions, meaning components can subscribe to *all* events of a certain type – helpful for things like monitoring the entire system.
*   **Session Validation:** It ensures that only authorized clients can send and receive events, keeping the system secure.
*   **Performance Tracking:** Integrates with the performance tracking system so events can be used to measure and analyze system behavior.
*   **Cleanup:** Provides a way to easily unsubscribe all components from a client's events when that client is no longer needed.

Essentially, `BusService` is responsible for keeping all the different parts of the swarm system talking to each other in a controlled and efficient way. Specific functions, like `commitExecutionBegin` and `commitExecutionEnd`, are shortcuts for sending predefined events related to task execution.

## Class AliveService

This class helps keep track of which clients are currently active within your AI agent swarms. It allows you to easily signal when a client becomes online or offline, and it automatically saves this status so you don't lose track even if the system restarts. 

You can use the `markOnline` method to indicate a client has joined a swarm and is ready to work, and the `markOffline` method to signal when a client has disconnected or stopped responding.  The system remembers these status changes, keeping your swarm information up-to-date.

## Class AgentValidationService

The AgentValidationService is responsible for making sure agents within the swarm are properly configured and ready to operate. It acts as a central point for validating agent schemas, managing dependencies, and ensuring resources like storage and states are correctly set up.

Think of it as a quality control system for your agents. It registers new agents, checks their configurations, and lets you easily query information about their associated resources – like what storage they use or what states they manage.

It works closely with other services, like those responsible for agent schemas, tool validation, and storage management, making sure everything works together seamlessly.  The service uses techniques like memoization to speed up common checks, and logging to keep track of what’s happening.

You can use it to:

*   **Register** new agents into the system.
*   **Get lists** of agents, their storage, wikis, or states.
*   **Check** if an agent has a specific storage, wiki, dependency, or state.
*   **Validate** an agent's entire configuration.

## Class AgentSchemaService

The AgentSchemaService is like a central library for defining and managing the blueprints of your AI agents. It keeps track of all the agent schemas, which describe what each agent does, what tools it uses, and how it interacts with the system. Before an agent is created or used, its schema is checked to make sure it’s complete and correct.

This service uses a specialized registry to store these blueprints, ensuring they’re easily accessible and consistent. Whenever a new agent blueprint is added or an existing one is retrieved, it's logged for transparency and debugging. It works closely with other parts of the system, such as agent creation and configuration, to ensure everything runs smoothly. Think of it as the foundation for defining and executing your AI agents' behaviors.

## Class AgentPublicService

This class provides a public interface for interacting with agents within the swarm system. Think of it as the main doorway for requesting actions from agents, like running commands or getting completions.

It handles the underlying communication with the agents, keeping track of what's happening through logging and integrating with other services to monitor performance and manage agent behavior.  Everything you do with an agent – executing commands, running completions, committing messages – goes through this class.

Key functions let you:

*   **Create Agent References:** Get a handle to a specific agent for a given client and task.
*   **Execute Commands:** Run instructions on an agent, specifying how it should be executed.
*   **Run Completions:** Quickly perform stateless tasks on an agent.
*   **Wait for Output:** Retrieve the result of an agent's operation.
*   **Commit Messages:** Add user, assistant, or system messages to the agent’s memory.
*   **Flush Agent History:** Clear an agent's memory.
*   **Dispose of Agents:** Clean up agent resources.

Essentially, this class is the central point for all public agent operations, ensuring consistent behavior and providing valuable context for tracking and management.

## Class AgentMetaService

This service helps manage information about your agents, like their dependencies and capabilities, and transforms that information into diagrams. Think of it as a tool for understanding and documenting how your agents interact within the system.

It builds visual representations of agents, either in detail or focusing primarily on how they relate to each other. These representations can be exported as UML diagrams, making it much easier to grasp the overall architecture of your agent swarm.

The service uses other components to fetch agent definitions and create the diagrams, and it can be configured to log its actions for debugging purposes. It’s utilized to create comprehensive documentation and visualizations of your agent systems.

## Class AgentConnectionService

This service manages the lifecycle of individual AI agents within the swarm system, providing a central point for creating, executing, and managing them. Think of it as a factory and caretaker for each agent instance.

When you need to use an agent, this service efficiently reuses previously created instances (memoization) to avoid unnecessary overhead. It’s deeply integrated with other services for things like logging, event handling, schema management (defining agent behavior and tools), and tracking usage.

The key functionalities include:

*   **Agent Creation and Retrieval:** Easily get or create existing agents, avoiding redundant setup.
*   **Execution:**  Run commands or request completions from agents.
*   **History Management:**  Record agent interactions, including user input, tool outputs, and system messages.
*   **Lifecycle Management:**  Properly dispose of agents when they are no longer needed, freeing up resources and ensuring everything is cleaned up.

Essentially, this service simplifies the process of working with AI agents and ensures they're handled in a consistent and efficient way throughout the system.

## Class AdapterUtils

This class provides easy ways to connect your AI agent swarm to different language models. Think of it as a toolbox for plugging into services like Cohere, OpenAI, LMStudio, and Ollama. Each function in this toolbox, like `fromCohereClientV2` or `fromOpenAI`, takes the specific client library for that service and turns it into a standardized way for your agents to request and receive completions. This helps keep your core logic clean and flexible, so you can easily swap out language models without changing a lot of code. You can also customize things like the model name and how the response is formatted.

# agent-swarm-kit interfaces

## Interface TAbortSignal

This interface lets you signal and control the cancellation of ongoing tasks, much like a way to tell something to stop what it's doing. It builds upon the standard web API for handling cancellations, allowing for more specific control within your application. You can modify it to add extra details or features your project needs.

## Interface IWikiSchema

This interface, `IWikiSchema`, defines the structure for representing a wiki knowledge base within our AI agent orchestration framework. Think of it as a blueprint for how the system understands and interacts with a specific wiki. 

It includes essential details like a unique name for the wiki (`wikiName`) and a description to help identify its purpose (`docDescription`). 

You can also provide custom functions (`callbacks`) to tailor how the system handles specific wiki-related actions. 

Finally, the `getChat` method allows your agents to easily retrieve information and generate responses based on the wiki’s content—it’s the primary way agents communicate with the wiki.

## Interface IWikiCallbacks

This interface, `IWikiCallbacks`, lets you plug into events happening within the AI agent swarm’s interaction with a knowledge base, specifically when there's a chat involved. You can provide a function that will be called whenever a chat interaction takes place. This allows your application to react to these chat operations, perhaps to log them, display them in a user interface, or perform other custom actions based on the conversation. The `onChat` property defines this callback function, and it receives information about the chat interaction through the `IChatArgs` object.

## Interface IToolCall

This interface describes a request to use a specific tool within the system. Think of it as a way for the AI model to ask the system to run something for it, like making an API call or running a calculation.

Each tool request has a unique identifier to keep track of it. 

The type of tool being called is currently limited to "function," meaning it’s a callable piece of code. 

The interface also details exactly which function should be executed, including its name and any arguments it needs.

## Interface ITool

This interface describes what a tool looks like within the AI agent system. Think of it as a blueprint for defining a function an agent can use. It specifies the tool's type – currently, only "function" is supported – and importantly, the details of that function: its name, what it does, and the format of any input parameters it expects. This information helps the AI model understand what actions are available and how to correctly use them when making decisions. The structure ensures that the model can generate valid requests to use the tool and that the system can properly execute those requests.

## Interface ISwarmSessionCallbacks

This interface lets you listen in on important happenings within your AI agent swarm. You can get notified when a new agent connects, when commands are run, or when messages are sent. It also provides callbacks for when a swarm session begins, ends, or is simply initialized. Think of it as a way to keep tabs on what’s going on and react to specific events as they occur, allowing you to customize your swarm’s behavior. These notifications include details like the agent's ID, the swarm's name, and the content of any messages or commands being processed.

## Interface ISwarmSchema

This interface defines the blueprint for how a swarm of AI agents is structured and operates. Think of it as the configuration file for your swarm.

It lets you name your swarm, specify a default agent to start with, and define which agents are available within the swarm. You can also provide functions to manage the swarm's navigation history – how it remembers where it's been – and keep track of which agent is currently active.

The interface allows for optional persistence, so the swarm’s state can be saved and restored later.  You can also add descriptive information for documentation purposes and configure access control rules. Finally, it provides hooks, called callbacks, for you to customize swarm behavior at different stages of its lifecycle.

## Interface ISwarmParams

This interface defines the information needed to set up a swarm of AI agents. Think of it as the blueprint for creating a coordinated group of agents. 

It includes things like a unique identifier for the system creating the swarm (clientId), a way to log important events and errors (logger), a communication channel for agents to talk to each other (bus), and a list of the agents that will be part of the swarm (agentMap). Essentially, it’s all the key pieces needed to bring a swarm to life and get it working together.

## Interface ISwarmDI

This interface acts as a central hub, providing access to all the core services that power the AI agent swarm system. Think of it as a toolbox containing everything needed to manage, connect, and configure the swarm. It bundles services for documentation, communication, performance monitoring, agent connections, storage, session management, schema definitions, metadata, and validation, streamlining access to these functionalities and ensuring a consistent system-wide approach. Each property represents a specialized service, offering specific capabilities related to the swarm’s operation.

## Interface ISwarmConnectionService

This interface helps define how different parts of the AI agent swarm system connect and communicate. Think of it as a blueprint for creating a reliable connection service. It's designed to be used internally to build the public-facing connection service, ensuring that only the intended operations are exposed. It’s a way to keep the system organized and safe by separating the details of how things work behind the scenes from what users or other systems directly interact with.

## Interface ISwarmCallbacks

This interface lets you listen in on important events happening within your AI agent swarm. Specifically, you're notified whenever an agent's role or status changes within the swarm – you’ll receive the agent’s ID, its new name, and the name of the swarm it belongs to. You can use this information to keep track of where your agents are, adjust the system’s behavior based on their current roles, or update any relevant displays.

## Interface ISwarm

This interface lets you interact with a group of AI agents working together. You can use it to manage which agent is currently active, get information about the agents, and get their combined output. 

Think of it like directing a team – you can switch between agents, see who’s doing what, and retrieve the team’s final result. It also allows you to pause the team’s work if needed, and send messages to the overall session. Essentially, this provides a way to control and monitor a coordinated effort between multiple AI agents.

## Interface IStorageSchema

This interface describes how your AI agents will store and manage data. It lets you control things like whether the data is saved permanently, how it's indexed for searching, and even allows you to customize how data is retrieved and saved.

You can choose to have your storage shared between all your agents or keep it private. The `createIndex` function is how you’ll generate search keys for your data, making it easy to find specific items. If you need more control, you can also provide your own functions for getting, setting, and providing default data. Finally, you can add descriptions to help document how each storage area is used.

## Interface IStorageParams

This interface defines how the AI agent swarm interacts with storage. It provides tools to manage where and how the swarm's data is kept, including client identification and embedding caching.

You'll find functions to calculate similarity between data representations (embeddings), write and read pre-computed embeddings to improve performance, and create embeddings for new items. The interface also includes ways to log activities and communicate within the swarm system, ensuring everything runs smoothly and errors can be tracked. The storage name clarifies which storage system is being used within the overall swarm environment.

## Interface IStorageData

This interface describes the basic information that gets saved when using the framework's storage system. Every item stored will have a unique `id`, which acts like a name tag to find it again later or to delete it. Think of it as a primary key for the data you're keeping track of.

## Interface IStorageConnectionService

This interface helps ensure that the publicly accessible parts of your storage connection service are clearly defined and typed in TypeScript. It builds upon the base `StorageConnectionService` but removes any internal details, so you have a clean, type-safe representation of what users of your service should expect. Think of it as a blueprint for creating a public-facing storage connection service, guaranteeing consistency and preventing accidental exposure of implementation specifics.

## Interface IStorageCallbacks

This interface helps you stay informed about what's happening with your data storage. You can register functions to be notified whenever data is changed, searched for, or when the storage is first set up or taken down. Think of it as a way to listen in on the storage's lifecycle – tracking updates, observing searches, and knowing when things are ready or being cleaned up. This lets you build systems that react to storage events, whether it's logging changes, syncing information elsewhere, or performing specific setup and teardown actions.

## Interface IStorage

This interface provides a set of tools for managing data within the AI agent swarm orchestration system. Think of it as a central place to store and retrieve information that your agents need.

You can use `take` to fetch a specific number of items based on a search term, like finding documents relevant to a particular task.  `upsert` lets you add new items or update existing ones, keeping everything current.  If you need to discard something, `remove` deletes an item by its unique identifier. `get` allows you to retrieve a single item if you already know its ID.

The `list` function is handy for viewing all the stored items, and you can even narrow down the results with a filter. Finally, `clear` provides a way to completely erase the storage and start fresh.

## Interface IStateSchema

The `IStateSchema` interface describes how a piece of data, or "state," is managed within the agent swarm. It essentially defines the rules and behavior for each state.

You can choose to make a state persistent, saving its value even after the swarm stops running. A descriptive name and an optional description helps others understand the state's purpose.

The schema also lets you decide if a state should be shared between different agents. You can provide functions to get the initial state and to retrieve or update its value.

To further customize state handling, you can add middleware functions to process state changes and specify callback functions to react to specific events during the state’s lifecycle.

## Interface IStateParams

This interface helps manage how different parts of your AI agent swarm interact and keep track of what's happening. Think of it as a set of instructions for each agent, telling it who it’s working with (identified by `clientId`), how to report problems or important events (`logger`), and how to send messages to other agents within the swarm (`bus`). It ensures that everyone stays coordinated and informed during the process.

## Interface IStateMiddleware

This interface defines how you can add custom logic to control and adjust the state of your AI agents as they work together. Think of it as a way to intercept and potentially change the information being passed around—maybe to ensure data is in the right format or to apply specific rules. You can use this to build a more controlled and reliable agent workflow. It lets you hook into the state lifecycle, giving you a place to validate or transform the data as it moves through the system.

## Interface IStateConnectionService

This interface helps define how different parts of the system communicate and share information about the agent swarm's current state. Think of it as a blueprint for a service that manages connections and data flow – it makes sure the public-facing parts of the system work consistently and predictably. It’s designed to be a clean, type-safe way to handle state information, focusing on what's important for external components to know and use.

## Interface IStateCallbacks

This interface lets you listen in on what's happening with your agent swarm's state. You can use it to get notified when a state is first created, when it's being cleaned up, or when it's loaded from somewhere. It also provides notifications when the state is read or updated, allowing you to keep track of changes and potentially react to them. Essentially, it's a way to get notified about key moments in the lifecycle of a state within the agent swarm.

## Interface IState

This interface lets you manage the agent swarm's current operating conditions. You can check what the swarm is currently doing with `getState`, allowing you to monitor its progress. To make changes, `setState` lets you update the swarm's status by providing a function that calculates the new state based on the old one. Finally, `clearState` provides a way to reset everything back to the initial setup, effectively restarting the process.

## Interface ISharedStorageConnectionService

This interface helps define how different parts of the system connect to shared storage. Think of it as a blueprint for creating services that can access and manage shared data. It’s designed to ensure that the publicly accessible parts of the storage connection service only expose the functionality intended for external use, hiding internal workings. By using this interface, developers can create consistent and reliable connections to shared storage within the AI agent swarm.

## Interface ISharedStateConnectionService

This interface helps us define how different parts of the AI agent swarm system share information. It’s a blueprint for a service that lets agents connect and exchange data, but it leaves out some of the internal details to keep the public-facing parts clean and consistent. Think of it as a simplified view of the overall data sharing mechanism.

## Interface ISessionSchema

This interface, `ISessionSchema`, acts as a blueprint for how session information will be structured in the future. Think of it as a promise for more detailed session configuration options – right now, it's intentionally blank but will hold important details about session data later on. It provides a defined structure to build upon as the system evolves and needs to manage session-specific settings.

## Interface ISessionParams

This interface defines all the information needed to kick off a new session for your AI agents. Think of it as the blueprint for creating a workspace where your agents can collaborate. It includes details like a unique identifier for the application using the session, a way to log important events and errors, rules and guidelines the session must follow, a communication channel for agents to talk to each other, and the overall management system for the agent group. You also specify the name of the agent group participating in the session.

## Interface ISessionContext

This interface describes the information maintained for each active session within the AI agent swarm. Think of it as a container holding details about who initiated the session (clientId), what process it's associated with (processId), and any specific method or execution details currently in progress. It allows you to track the flow and state of a session, providing a complete picture of its context. The session context holds information about the client, the specific task being performed, and details about the execution environment.

## Interface ISessionConnectionService

This interface acts as a blueprint for how services connect to and manage sessions within the AI agent swarm. Think of it as a way to ensure that the public-facing parts of session connection services are consistent and well-defined. It's used to create a typed version of a session connection service, but without any of the internal workings, so it focuses purely on the external interface.

## Interface ISessionConfig

This interface, `ISessionConfig`, helps manage how often your AI agents run or how quickly they can execute tasks. It lets you control the timing of sessions, either by setting a `delay` – a time interval between runs – or by defining an `onDispose` function to run when a session ends. Think of it as a way to ensure your agents don’t overwhelm resources or operate too rapidly. The `delay` property specifies the waiting time, and `onDispose` allows you to perform any necessary cleanup actions when a session completes.

## Interface ISession

The `ISession` interface is like the central hub for managing a conversation or task within your AI agent swarm. It provides the tools to control how messages are sent, processed, and stored.

You can use `commitUserMessage`, `commitAssistantMessage`, and `commitSystemMessage` to add messages to the session’s record – these actions don't immediately trigger further actions.  `commitToolOutput` specifically handles messages coming from tools used by the agents.  `commitFlush` gives you a way to wipe the session history and start fresh.  `commitStopTools` allows you to halt the agent's tool usage temporarily.

For sending updates or notifications, there's the `notify` method.  `emit` sends general messages through the session’s communication channel.  `run` lets you quickly perform a task without changing the ongoing conversation's history.  `execute` is the main method to actually carry out commands and potentially update the history.

`connect` is powerful – it establishes a two-way communication link between your system and the session.

## Interface IPolicySchema

This interface outlines the structure for defining policies that govern how your AI agent swarm manages and restricts clients. It lets you customize how bans are applied, messages are displayed, and data is stored.

You can choose to save banned client information persistently, add descriptions for clarity, and give each policy a unique name. More importantly, it allows you to define custom logic for validating both incoming and outgoing messages, essentially creating your own rules for what's acceptable.

The framework also provides ways to handle the list of banned clients directly, fetch custom ban messages, and trigger specific actions based on policy events through callbacks, offering a high degree of control and flexibility.

## Interface IPolicyParams

This interface defines the information needed to set up a policy within the AI agent swarm. Think of it as a configuration guide – it tells the system how the policy should behave and how it should interact with the rest of the swarm. You'll need to provide a logger to track what the policy is doing, and a bus for it to communicate with other agents and processes in the swarm. Essentially, it’s all about setting up the policy for proper logging and communication.

## Interface IPolicyConnectionService

This interface helps define how different parts of the system connect and manage policies. Think of it as a blueprint for managing rules and procedures within the AI agent swarm. It's designed to clearly separate the publicly accessible functionality from the internal workings, ensuring only the intended operations are exposed. By using this interface, developers can build components that interact with policies in a standardized and predictable way.

## Interface IPolicyCallbacks

This interface lets you connect your own code to specific moments in a policy’s life cycle. You can register functions to be called when a policy starts up, when it checks incoming messages, when it checks messages going out, or when a client gets banned or unbanned. These callbacks provide opportunities for logging, monitoring, or automating actions related to the policy's behavior. Think of them as event listeners that let your system react to what's happening with the policies.

## Interface IPolicy

This interface defines how a policy is enforced within the agent swarm system. It allows you to check if a client has been banned, retrieve the reason for a ban, and validate both incoming and outgoing messages to ensure they comply with the swarm's rules. You can also use it to actively ban or unban clients, effectively controlling access and behavior within the swarm. Essentially, this interface gives you the tools to manage client access and message integrity.

## Interface IPersistSwarmControl

This interface lets you tailor how your AI agent swarm's data is saved and retrieved. Think of it as a way to plug in your own custom storage solutions instead of relying on the default methods. 

You can use it to define how the information about which agents are currently active is saved, or how the "memory" of the swarm's navigation paths is persisted. This is useful if you need a specific storage method, like using a database instead of simple files, or if you want to experiment with in-memory storage for testing. By providing your own adapter, you’re essentially customizing the long-term storage mechanism for your swarm’s core data.

## Interface IPersistStorageData

This interface describes the format used to save data for later retrieval within the AI agent swarm. Think of it as a container holding a list of information – like a collection of key-value pairs or records – that needs to be saved. The `data` property contains this actual list of information ready to be persisted. It's a standard way to package the data before it's written to storage, handled by the `PersistStorageUtils`.

## Interface IPersistStorageControl

This interface lets you plug in your own way of saving and loading data for a specific storage area. Think of it as replacing the standard saving mechanism with something tailored to your needs, like storing data in a database instead of a simple file. You provide a class that handles the saving and loading, and this interface allows you to tell the system to use your custom class. This is useful if you need to manage data persistence in a non-standard way.

## Interface IPersistStateData

This interface describes how data is saved and loaded for our AI agent swarm. Think of it as a container for any information you want to preserve, like settings for each agent or details about an ongoing session. The `state` property within this structure holds the actual data itself – it’s a placeholder for whatever information your agents need to remember. This is used to help manage the swarm’s memory across restarts or changes.

## Interface IPersistStateControl

This interface lets you hook in your own way of saving and loading agent states. Think of it as a way to tell the system, "Hey, don't use your usual method for this particular state; let me handle it instead." You can provide a custom class that knows how to persist data, like storing it in a database instead of just in memory. This is helpful when you need very specific control over where and how agent state is saved.

## Interface IPersistPolicyData

This interface helps the AI agent swarm remember which clients should be blocked. It’s used to store a list of session IDs – essentially unique identifiers for individual users or applications – that have been banned from participating in a particular swarm. Think of it as a blacklist for specific groups of agents working together. The interface ensures that this banned client information is saved and retrieved consistently across the system.

## Interface IPersistPolicyControl

This interface lets you tailor how policy information is saved and retrieved for your AI agent swarms. 

Essentially, it gives you a way to swap out the default storage mechanism with your own custom solution. 

Think of it as plugging in your own specialized system to handle saving and loading policy data related to a specific swarm, allowing for flexibility like in-memory storage or integration with a unique data store. 

You can use the `usePersistPolicyAdapter` method to provide your own persistence adapter class, which needs to be compatible with the expected data structure and functionality.

## Interface IPersistNavigationStackData

This interface outlines how navigation data – specifically, the history of which agents a user has interacted with – is saved and restored. It's used to keep track of the sequence of agents a user has navigated through, allowing them to return to previous interactions. The `agentStack` property holds a list of agent names, essentially creating a navigation trail within the swarm. Think of it as a "back" button for agent interactions.

## Interface IPersistMemoryData

This interface describes how memory information is saved and retrieved within the AI agent swarm. Think of it as a container for whatever data your agents need to remember – whether that’s details about a conversation or a temporary calculation. The `data` property holds that actual information, and it can be any kind of data relevant to the agents’ tasks. It's used by a utility function that handles the actual saving and loading of this information.

## Interface IPersistMemoryControl

This interface lets you plug in your own way of saving and loading memory data associated with a specific session. Think of it as a way to swap out the default memory storage with something tailored to your needs, like saving data in a database instead of just keeping it in the application's memory. You can use this to control exactly how memory related to a session is persisted, allowing for flexibility and customization.

## Interface IPersistEmbeddingData

This interface helps the AI agent swarm remember information by storing numerical representations of data. Think of it like creating a fingerprint for a piece of text or concept. The `embeddings` property holds the actual numerical values that make up this fingerprint, allowing the swarm to easily compare and recall related information. It’s used to associate a numerical embedding with a specific identifier within the swarm system.

## Interface IPersistEmbeddingControl

This interface lets you tailor how embedding data is saved and retrieved. You can provide your own storage mechanism instead of relying on the default one. This is helpful if you need to store embedding information in a specific location or with particular formatting, like keeping it temporarily in memory for a swarm. Essentially, it allows you to plug in your own logic for managing embedding persistence.

## Interface IPersistBase

This interface provides the foundation for reliably saving and retrieving data within the agent swarm system. It allows you to manage data stored as JSON files, ensuring the system can recover and maintain its state.

The `waitForInit` method prepares the storage area, setting things up and cleaning up any potentially damaged files to make sure everything is ready to go. `readValue` lets you retrieve specific data by its unique ID, like an agent’s current status or its memory. Need to quickly check if a piece of data exists? `hasValue` lets you do that without needing to load the whole thing. Finally, `writeValue` is used to save data, making sure it’s written safely and securely.

## Interface IPersistAliveData

This interface helps us keep track of whether clients are actively participating in our AI agent swarm. It's like a simple check-in system, noting if a specific client, identified by its session ID, is currently online within a particular swarm. The key piece of information is a boolean value: `online`, which clearly tells us whether the client is considered active or not.

## Interface IPersistAliveControl

This interface lets you customize how the system keeps track of whether your AI agents are still active. It provides a way to plug in your own storage solution – maybe you want to use a database, a file, or even just keep the information in memory – instead of relying on the default approach. By providing your own persistence adapter, you have fine-grained control over where and how the alive status of your agents is saved, allowing for greater flexibility and potentially improved performance or data management. This is particularly useful for scenarios where you need specific data formats or need to integrate with existing systems.

## Interface IPersistActiveAgentData

This interface describes how we keep track of which agent is currently active for each client participating in a swarm. Think of it as a simple record noting which agent is "in charge" for a particular client and swarm combination. The core piece of information stored is the agent's name, which acts as a label to identify that specific agent within the swarm. It allows the system to remember the state and context of interactions.

## Interface IPerformanceRecord

This interface defines a way to track how well a process is running within the swarm system. It gathers performance data from multiple clients – think of them as individual sessions or agent instances – and bundles it together for a complete picture.

Each record keeps track of things like the process's unique ID, how many times it ran, the total time it took, and average response times. You’re also able to see when the record was created, using both a broader date and a more precise time stamp. This information is used to monitor system performance and troubleshoot issues. The `clients` property allows for digging deeper into the performance of each individual client involved in the process.


## Interface IPayloadContext

This interface, `IPayloadContext`, is like a container for information needed when an AI agent is working. It holds two key pieces: a `clientId` which identifies who or what requested the work, and the actual `payload` – the data the agent is meant to process. Think of it as a labeled package ensuring the right data gets to the right agent for the right task. This structure helps keep things organized and traceable within the agent swarm system.

## Interface IOutgoingMessage

This interface describes a message that’s being sent out from the agent swarm system to a client. Think of it as a package containing information to be delivered.

Each message has a `clientId`, which acts like an address to make sure the message gets to the right client – it's how the system knows who to send it to.

The `data` property holds the actual content of the message, like a response from an agent or a notification. It's the main information being communicated.

Finally, `agentName` tells you which agent within the swarm created and sent the message, providing context about the origin of the information.

## Interface IModelMessage

This interface defines the structure for messages exchanged within the agent swarm system. Think of it as the standard way information is passed between agents, tools, users, and the system itself. It’s central to tracking conversation history, generating responses, and handling events.

Here’s a breakdown of what each part represents:

*   **role:** Specifies who or what sent the message – is it a model, a user, a tool, or the system itself? Common roles include 'user', 'assistant', 'tool', and 'system'.
*   **agentName:** Identifies the specific agent that sent the message. This is important when dealing with multiple agents working together.
*   **content:** The actual text or data being communicated in the message. This is the core information being passed.
*   **mode:** Indicates whether the message originated from user input or a tool’s action. This helps determine how the message should be processed.
*   **tool\_calls:** A list of tool calls the model is requesting, if applicable. This is how the model asks the agent to execute a specific tool.
*   **images:**  Allows the message to include image data, useful for visual context or responses.
*   **tool\_call\_id:**  Links a tool’s response back to the original tool call request.
*   **payload:** Provides extra information or context that accompanies the message.

## Interface IMethodContext

This interface, `IMethodContext`, provides a consistent way to track details about any method call within the swarm system. Think of it as a little packet of information attached to each method execution. It bundles together key identifiers like the client's session ID, the name of the method being called, and the names of the agents, swarms, storage, state, and policies involved. These identifiers are used by different services, such as performance monitoring, logging, and documentation, to provide richer insights into how the system is operating and what resources are being utilized. This context helps understand where a method call originated, what components it interacted with, and what rules it adhered to.

## Interface IMetaNode

This interface, `IMetaNode`, helps organize information about agents and their connections within the system. Think of it as a way to build a family tree for your agents, showing how they depend on each other and what resources they use. Each node in this tree has a `name`, which is usually the agent's name or a description of a resource. It can also have `child` nodes, which represent more detailed dependencies or resources linked to the parent node, creating a hierarchical structure.

## Interface IMakeDisposeParams

This interface defines the settings you can provide when automatically setting up a disposal mechanism for an AI agent within a swarm. The `timeoutSeconds` property lets you specify how long to wait before automatically disposing of an agent if it becomes unresponsive. You can also provide an `onDestroy` function, which will be called when an agent is automatically disposed, allowing you to perform cleanup tasks or log information about the event, including the agent's ID and the name of the swarm it belonged to.

## Interface IMakeConnectionConfig

This interface helps you control how frequently your AI agents connect and communicate. It lets you specify a `delay`, which is a number representing the wait time, in milliseconds, between connection attempts. You can use this to prevent overwhelming resources or to manage the flow of information within your agent swarm. Essentially, it's a way to throttle the connection process.

## Interface ILoggerInstanceCallbacks

This interface lets you connect to a logger to be notified about important events. You can listen for when a logger starts up, when it shuts down, and whenever a new log message—whether it's a regular log, a debug message, or an informational message—is created. Each event provides a client ID and a topic, allowing you to track which part of your system is generating the log. This is useful for monitoring, debugging, or customizing how your agent swarm handles logging.

## Interface ILoggerInstance

This interface defines how logger instances should behave, adding setup and cleanup steps on top of basic logging functionality. 

It lets you control when a logger actually starts working and when it’s time to shut it down properly. 

The `waitForInit` method handles the initial setup, making sure things are ready to go, and the `dispose` method ensures resources are released when the logger is no longer needed. These lifecycle methods are particularly useful when dealing with client-specific logging and managing resources associated with each client.

## Interface ILoggerControl

This interface gives you ways to customize how logging works within your AI agent swarm. You can set a standard logging adapter for all operations, configure lifecycle callbacks for logger instances, or even provide your own custom logger constructor. It also lets you log specific messages associated with different clients, including info, debug, and general messages, all while ensuring proper session validation and tracking where the logging originates. Essentially, it provides granular control over the logging behavior of your agent swarm.

## Interface ILoggerAdapter

This interface provides a standardized way for the AI agent swarm orchestration framework to communicate with different logging systems. Think of it as a translator – it allows the framework to send logging messages (like errors, informational updates, or debug details) regardless of whether it's sending them to a file, a cloud service, or a custom console.

Each implementation of this interface, like the one provided by LoggerUtils, handles the specifics of sending those messages to the correct destination. The `log`, `debug`, and `info` methods all work similarly: they take a client identifier and a topic (essentially, a category for the message) along with any data you want to include in the log. The `dispose` method is used to clean up resources and remove the client's logging instance when it's no longer needed.


## Interface ILogger

This interface defines how different parts of the AI agent swarm system record information. It provides a simple way to track what's happening, from basic events to detailed debugging information. You can use it to log general messages, specific debugging details, or informational updates about successful operations. These logs are invaluable for understanding how the swarm is working, identifying problems, and keeping track of important lifecycle events.

## Interface IIncomingMessage

This interface describes a message that arrives at the swarm system, like a request from a user or another application. Each message has a unique identifier for the client that sent it, so we know where it came from. It also carries the actual data – the content of the message itself, such as a question or command. Finally, it specifies which agent within the swarm is responsible for handling that message.

## Interface IHistorySchema

This interface outlines how your AI agent swarm keeps track of past conversations and interactions. Think of it as the blueprint for the system's memory. 

It focuses on a key part: the `items` property. This property specifies which method the system will use to actually store and retrieve those messages – whether it’s a database, a file, or something else entirely. It’s all about choosing the right storage solution for your agent swarm’s history.

## Interface IHistoryParams

This interface defines the information needed to create a record of an agent's actions and interactions within the system. Think of it as a template for storing details about what a specific agent, identified by its name and the client using it, has been doing. It also includes tools for logging important events and communicating with other parts of the overall agent network. You'll need to provide an agent's name, a client identifier, a logging mechanism, and a communication channel when you build a history record.

## Interface IHistoryInstanceCallbacks

This interface defines functions that let you customize how agent conversation history is managed. You can use these functions to dynamically adjust the system prompts used by agents, decide which messages are saved, retrieve initial conversation data, and react to changes in the history – like when a new message is added or an old one is removed. The interface also provides callbacks for actions like starting and finishing a history read, initializing and disposing of the history, and receiving a direct reference to the history instance itself. These callbacks give you fine-grained control over the entire lifecycle of an agent's conversation history.

## Interface IHistoryInstance

This interface helps manage the conversation history for each AI agent in your swarm. Think of it as a way to keep track of what each agent has said and done.

You can use the `iterate` method to look at all the messages associated with a specific agent's history, allowing you to review past interactions. 

The `waitForInit` function makes sure the agent's history is properly set up and ready to go.

To add a new message to an agent’s record, use the `push` method.

If you need to retrieve the most recent message an agent sent, `pop` will give it to you and remove it from the history.

Finally, `dispose` lets you clean up the history data for an agent when you're finished with it.

## Interface IHistoryControl

This interface lets you fine-tune how your AI agents remember and track their actions. You can tell the system what events to log and when, essentially customizing the history-keeping process. 

It also allows you to provide your own way of creating history objects, giving you more control over the underlying data structures used to manage the agents' past interactions. This is useful if you need a specific format or want to integrate with existing systems.

## Interface IHistoryConnectionService

This interface acts as a blueprint for how external systems should interact with the history connection service. It specifically outlines the features and methods available for managing and accessing historical data, leaving out the internal workings and implementation details. Think of it as a contract, defining what capabilities are offered without revealing *how* they’re achieved. This ensures a stable and predictable interface for anyone building upon this service.

## Interface IHistoryAdapter

This interface outlines how different systems can manage a record of interactions between agents. Think of it as a way to keep track of what agents have said and done.

You can use it to add new messages to the history, retrieve the most recent message, or clear the history completely for a specific agent and client.

The `iterate` method lets you step through the history of messages in order, useful for reviewing or analyzing past conversations. Each of these functions helps ensure that a consistent record of agent activity is maintained.

## Interface IHistory

This interface helps keep track of all the messages exchanged with AI models within your agent swarm. You can use it to add new messages to the history, retrieve the most recent message, and format the history for specific agents or for a general overview of model interactions. Think of it as a logbook for your AI agents, allowing you to see and manage the conversation flow. 

You can add messages one by one, grab the latest interaction, or easily create lists of messages to be used when interacting with a particular agent or to examine all raw data.

## Interface IGlobalConfig

This interface holds global settings and functions used across the entire AI agent orchestration system. Think of it as a central control panel that influences how the swarm behaves.

**Key areas of influence:**

*   **Tool Handling:**  How the system deals with tool calls, including how to recover from errors (options include resetting or retrying).
*   **Logging:** Controls the level of detail in the system's logs (debug, info, etc.).
*   **Conversation Management:** Determines how the system responds when a model provides an empty output (e.g., greeting the user).
*   **Agent/Swarm Behavior:** Defines how agent changes and navigation within a swarm are handled.
*   **Data Persistence:**  Controls whether data is stored or is volatile.

**Specific settings you can tweak:**

*   **Error Handling:** Customize prompts to clear issues after tool call exceptions.
*   **Conversation Flow:** Influence how the system guides user interactions.
*   **History Management:**  Limit the number of past messages stored for each agent.
*   **Tool Call Limits:** Cap the number of tools an agent can use in one go.
*   **Agent Mapping:** Modify how tool calls are processed for specific agents.
*   **Logging Levels:**  Control verbosity of system logs (debug, info, general).
*   **Data Caching:** Cache embeddings for quicker responses.

The `setConfig` function lets you change these settings dynamically, allowing you to tailor the system's behavior without modifying code.

## Interface IExecutionContext

This interface helps keep track of what's happening in the system. Think of it as a little package of information that travels with each task or process. It contains a unique ID for the client using the system, a specific ID for the current execution, and an ID representing the overall process. These identifiers are used by different parts of the framework, like the client agent, performance tracking, and communication bus, to coordinate and monitor activity.

## Interface IEntity

This interface, `IEntity`, serves as the foundation for all data objects that are stored and managed within the AI agent swarm. Think of it as the parent for all other entity types. When you need to represent something that the swarm needs to remember or track, it will inherit from `IEntity`, and then more specialized interfaces will add specific details about what that entity contains.

## Interface IEmbeddingSchema

This interface lets you define how your AI agents understand and compare information within the swarm. You can choose whether to save agent data for later use, and give your embedding method a unique name. 

The system allows you to both store and retrieve pre-calculated embeddings to speed things up—avoiding the need to recalculate them repeatedly. You can also customize the embedding process with optional callbacks.

The framework provides tools to create new embeddings from text and to measure how similar two embeddings are to each other.

## Interface IEmbeddingCallbacks

This interface lets you tap into what's happening as embeddings are generated and compared. You can use it to keep track of how embeddings are being created, like logging the text used to generate them and the client associated with the request. 

Similarly, it gives you a way to observe and potentially analyze the results of comparing two pieces of text to see how similar they are, again knowing which client requested the comparison. Think of it as a way to get notified and potentially react to the embedding process as it unfolds.

## Interface ICustomEvent

This interface lets you create and send custom events within the swarm system. Think of it as a way to communicate information that doesn's fit neatly into the standard event formats. You can attach any kind of data you need to these events using the `payload` property, making it ideal for unique or specialized scenarios. It extends the basic event interface, offering greater flexibility for sharing information between different parts of the system.

## Interface IConfig

This interface defines the configuration options for generating diagrams representing relationships between different parts of a system. Specifically, the `withSubtree` property lets you control whether the diagram should include detailed, nested views of the connections, allowing for a more comprehensive visualization of the system's structure. When set to `true`, the diagram will show sub-elements and their connections, providing a more granular understanding. If set to `false`, it will show only the top-level connections.

## Interface ICompletionSchema

This interface outlines the structure for setting up how your AI agents within the swarm generate completions, or suggested actions. Each completion mechanism needs a unique name to identify it.

You can optionally customize what happens after a completion is generated by providing callback functions. 

The `getCompletion` method is the core function – it's what you call to actually request a completion from the mechanism, providing the necessary context and available tools. It returns a promise that resolves with the model's response.

## Interface ICompletionCallbacks

This interface lets you listen for when an AI agent completes a task. 

Specifically, `onComplete` is a function you provide that gets called once the AI agent successfully finishes its work. 

You can use this callback to do things like save the results, display them to a user, or start another process based on the outcome. It receives information about the task and the generated output, allowing for flexible post-processing.

## Interface ICompletionArgs

This interface defines the information needed when asking the system to generate a response. Think of it as a package containing all the details about the request, including who's making it (identified by a client ID and agent name), the history of the conversation so far, and what kind of input it is (user or tool). It also includes a list of tools the agent might be able to use to help it formulate a response. Essentially, it's a structured way to provide context and instructions to the AI agent.

## Interface ICompletion

This interface defines how to get responses from your AI agents. Think of it as a standard way to request and receive results, ensuring that different agents can be used consistently within your swarm. It builds upon a basic completion structure, providing a full set of tools for interacting with and getting output from your AI models.

## Interface IClientPerfomanceRecord

This interface describes the performance data collected for each individual client, like a user session or agent instance, within a larger process. It’s designed to give you a detailed breakdown of how each client is performing.

Each client's record includes things like a unique identifier (`clientId`), the data stored within the client's session (`sessionMemory` and `sessionState`), and metrics on its execution, such as the number of times it's run (`executionCount`), the size of data it processes (`executionInputTotal`, `executionOutputTotal`), and how long its operations take (`executionTimeTotal`, `executionTimeAverage`). These records help you understand if some clients are experiencing performance bottlenecks or consuming excessive resources. Essentially, it gives you a granular view of performance at the client level.

## Interface IChatInstanceCallbacks

This interface defines a set of callbacks that let you track the lifecycle and activity of individual chat instances within a swarm of AI agents. You can use these callbacks to monitor when a chat instance is created, when it's ready, and when it’s being shut down. 

Specifically, you’ll receive notifications when an agent checks its activity status, when a chat session starts, and when a message is sent. The `onInit` callback gives you access to the `IChatInstance` object, allowing you to interact with the specific agent. Similarly, `onDispose` signals that the agent is being cleaned up.

## Interface IChatInstance

This interface defines how to interact with a single chat session within the agent swarm. You use it to start a chat, send messages to it, and receive responses. The `beginChat` method gets things rolling, while `sendMessage` lets you send content to the chat.  `checkLastActivity` helps you monitor how recently the chat has been active. When you're finished, `dispose` cleans up the chat session. Finally, `listenDispose` allows you to be notified when a chat session is being closed.

## Interface IChatControl

This framework lets you easily swap in different chat interfaces – think of it as providing a way to plug in different "chat engines." The `useChatAdapter` function allows you to specify which chat engine class the system will use.

You can also customize how the chat engine behaves. `useChatCallbacks` lets you define specific actions or responses that will trigger at different points during the chat process, giving you fine-grained control over its functionality.

## Interface IChatArgs

This interface defines the data needed to send a message to an AI agent within the system. It's a simple structure that includes a unique identifier for the application sending the message (clientId), the name of the specific agent responsible for handling the conversation (agentName), and the actual text of the message itself. Think of it as a standardized way to tell an agent, “Here's a message from this client, and you're the one who should deal with it.”

## Interface IBusEventContext

This interface provides extra information about events happening within the AI agent swarm. Think of it as a way to tag events with details about which agent, swarm, storage, state, or policy is involved.

While a client agent typically only uses the `agentName` field to specify which agent triggered the event, other parts of the system might use the other fields like `swarmName`, `storageName`, `stateName`, or `policyName` to provide more context for different kinds of events. For example, a swarm-level event might use `swarmName` to indicate which swarm is involved, or a policy enforcement event might use `policyName` to identify the policy being applied. It’s a structured way to add clarity and traceability to events across the entire system.

## Interface IBusEvent

This interface describes the structure of messages sent across the system's internal communication channels. Think of it as a standardized way for different parts of the system, particularly agents, to talk to each other and notify the core system about what's happening. Each message contains information about where it came from (the source), what kind of action it represents (the type), any data being sent along with it (input), any results from that action (output), and some extra information about the context of the message (context). Agents use this structure to share details about their actions, like running a function, sending a user message, or reporting the result of a tool execution.

## Interface IBus

The `IBus` interface provides a way for different parts of the AI agent swarm to communicate with each other, particularly to notify clients about what's happening. Think of it as a central messaging system.

Agents use the `emit` method to send structured events to specific clients. These events contain information about actions like completing a task, producing output, or committing data. The events follow a consistent format, including details about the event type, where it came from, any input data, any output results, and the client it's intended for.

This system ensures that clients are kept up-to-date with what agents are doing, and that communication between components is handled in a reliable and organized manner. It's like a broadcast system, but targeted at specific clients, allowing for a coordinated and transparent workflow within the AI swarm. The `clientId` is included in the event for extra confirmation and filtering.

## Interface IBaseEvent

This interface sets up the basic building blocks for all events happening within the system, like messages passed between agents. Every event will have a `source`, which tells you where the event came from – like a specific agent or a core system component. It also includes a `clientId`, which ensures the event reaches the right client or agent instance. Think of it as providing the “who” and “where” information for every action happening within the swarm.

## Interface IAgentToolCallbacks

This interface lets you customize how tools within your AI agent swarm behave. You can hook into different stages of a tool's lifecycle to add extra functionality. 

For example, `onBeforeCall` lets you do things like log what's about to happen or prepare data before a tool runs. `onAfterCall` is your chance to clean up or record the results afterward. 

`onValidate` provides a way to check if a tool’s inputs are correct before it even starts. And finally, `onCallError` helps you handle any issues that might arise during tool execution. Essentially, it’s a way to add layers of control and monitoring to your agent tools.

## Interface IAgentTool

This interface, `IAgentTool`, describes a specific tool that an AI agent can use within a larger group of agents. Each tool has a name to identify it, and an optional description to help users understand how it works. 

Before a tool runs, the `validate` function checks if the provided input is correct. You can customize the tool's behavior even further using optional lifecycle callbacks. 

Finally, the `call` function is how you actually run the tool, giving it the parameters and context it needs to perform its task.

## Interface IAgentSchemaCallbacks

This interface lets you tap into key moments in an agent's lifecycle. You can use these callbacks to monitor what's happening, react to events, or even customize the agent's behavior.

For example, you can listen for when an agent starts running (`onRun`, `onExecute`), when a tool finishes generating a response (`onToolOutput`), or when a user sends a message (`onUserMessage`).

You also have hooks for managing the agent's state, like flushing its history (`onFlush`) or restoring it after a disruption (`onResurrect`), and for tracking its initialization and disposal (`onInit`, `onDispose`). Lastly, there’s a callback (`onAfterToolCalls`) to know when a series of tool calls has completed.

## Interface IAgentSchema

This interface defines how an agent is configured within the swarm. Think of it as a blueprint that specifies everything about an agent, from its name and the prompt it uses, to the tools it can access and how its output is handled. 

You can customize an agent by providing descriptions for documentation or limiting the number of tools it can use in a cycle. The `agentName` property is crucial for identifying each agent uniquely. 

It also lets you control how the agent interacts with other components, like mapping messages or validating outputs. If an agent needs to rely on another agent for certain operations, you can define a dependency using `dependsOn`. Finally, you have the flexibility to add custom actions using callbacks to tailor the agent's behavior to specific needs.

## Interface IAgentParams

This interface defines the information needed to run an individual agent within the larger AI agent swarm. Think of it as a configuration package that tells the agent how to operate, who it’s working for (clientId), and provides it with tools for communication and record-keeping.  It includes a logger for tracking activity, a bus for sending messages around the swarm, a history tracker, and a mechanism for generating responses. You can also provide the agent with a list of tools it can use, and a validation step to check its output before it’s finalized.

## Interface IAgentConnectionService

This interface helps define how different AI agents connect and communicate within the system. Think of it as a blueprint that ensures the publicly accessible parts of the connection service are consistent and predictable. It's designed to strip away any internal workings, so only the essential connection details are exposed for external use, keeping things clean and organized.

## Interface IAgent

This interface describes how you interact with an individual agent within the system. Think of it as a blueprint for how an agent functions.

You can use the `run` method to quickly test an agent with some input without affecting its memory or past interactions. The `execute` method is the main way to make an agent work, potentially changing its memory based on the chosen mode.

To get the agent's final result, use `waitForOutput`.

Beyond simply running the agent, you have methods for managing its internal state. These allow you to manually add messages – system prompts, user inputs, and assistant responses – without triggering a full response cycle. You can even clear the agent’s entire history with `commitFlush` or temporarily halt tool execution with `commitStopTools` and `commitAgentChange`.
