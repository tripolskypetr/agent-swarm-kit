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

This framework component, the WikiValidationService, helps ensure your wikis conform to specific structures. Think of it as a quality control system for your knowledge base. 

You start by defining the structure each wiki should follow – this is done by adding a wiki schema using the `addWiki` function. Then, when you have new content for a wiki, you can use the `validate` function to check if it matches the defined schema. The service also keeps track of the wikis you’ve added internally.  It uses a logging service to record any issues found during validation, making debugging easier.

## Class WikiSchemaService

The `WikiSchemaService` helps manage and organize different wiki schema definitions within the system. Think of it as a central repository where you store and access blueprints for how your wikis should be structured.

You can register new schema blueprints using `register`, associating each with a unique key for easy identification. If a schema already exists, `override` allows you to update specific parts of it without replacing the entire definition. When you need a particular schema, `get` retrieves it quickly by its key. 

The service also relies on a logging system (`loggerService`) and a registry to keep track of available schemas, and offers shallow validation for initial schema checks.

## Class ToolValidationService

This service helps ensure that the tools your AI agents are using are properly configured and registered within the swarm. It keeps track of all the tools the system knows about, making sure there aren't any duplicates and that they actually exist. 

It works closely with other parts of the system like the tool registration service, agent validation, and logging. When you add a new tool, this service registers it and makes sure it's unique. When an agent needs to use a tool, it uses this service to confirm that the tool is properly set up. To make things efficient, the validation checks are cached so they don't have to be repeated unnecessarily.


## Class ToolSchemaService

The ToolSchemaService manages the definitions of tools used by agents within the swarm. Think of it as a central library where all the tool blueprints are stored and accessed. It ensures these blueprints are structurally sound before they're used.

Here's a breakdown of what it does:

*   **Tool Registry:** This service acts as a registry, keeping track of all available tools. It uses a specialized storage system for efficient access.
*   **Schema Validation:**  Before a tool can be used, the service checks its basic structure to make sure it's complete and valid.
*   **Registration:** You can add new tool definitions to the registry through this service.
*   **Retrieval:**  It allows other parts of the system to easily find and use the definitions of existing tools.
*   **Overriding:**  It provides a way to update existing tool definitions, allowing for changes and improvements over time.
*   **Logging:** The service logs important actions, providing insights into how tools are being managed.

This service is a foundational component, used by various services to ensure agents have the correct tools and their definitions are consistent.

## Class ToolAbortController

The ToolAbortController helps you manage how tasks are stopped if needed. It’s like a little helper that lets you create and control an AbortController, which is a standard way to signal that something should be cancelled mid-process.

Inside, it holds an AbortController – essentially the control panel for stopping things – and if that control panel isn’t available in your environment, it’s simply absent.

You can use the `abort` function to actually trigger the cancellation signal. If there's no AbortController available, calling `abort` won't cause any problems; it’s safe to use even if the underlying functionality isn't present.

## Class SwarmValidationService

This service acts as a central point for ensuring the configurations of your AI agent swarms are correct and consistent. It keeps track of all registered swarms and their associated details, like agent lists and policies.

Adding a new swarm involves registering it with this service, and it makes sure each swarm has a unique name. You can then retrieve lists of agents and policies assigned to specific swarms. 

The `validate` function is the workhorse; it checks a swarm's configuration to make sure everything is set up correctly, reusing previous checks for efficiency. This helps maintain the overall health and reliability of your swarm system. It relies on other services to handle agent and policy validation, logging operations, and managing swarm registrations.

## Class SwarmSchemaService

The SwarmSchemaService is the central place where the blueprints for your AI agent swarms are stored and managed. Think of it as a library of configurations, each defining how a group of agents should work together. It ensures these configurations are well-formed and consistent before they're used.

It keeps track of swarm schemas, using a registry to efficiently store and find them. When you add a new schema or update an existing one, it performs a quick check to make sure everything looks right. Logging is enabled for these operations to help with troubleshooting.

This service works closely with other components like the connection service, agent connection service, and policy schema service to enable a coordinated and reliable AI agent orchestration system. It allows you to easily define and retrieve the configurations needed for your AI agent swarms, making it a core part of the system's architecture. You can think of it as defining the ‘recipe’ for how your agents will operate.

## Class SwarmPublicService

This class acts as the main gateway for interacting with a swarm of agents. It provides a set of methods that allow you to send messages, control output, manage agents, and ultimately shut down the swarm, all while ensuring that these actions are tracked and associated with a specific client and swarm. Think of it as a public API built on top of more internal services, ensuring operations are handled consistently and with proper context.

It provides ways to:

*   **Send messages:** You can broadcast messages to the swarm for a particular client.
*   **Control agent flow:** Manage the agent stack (popping agents, setting the current agent, etc.).
*   **Handle output:** You can wait for output from the swarm or cancel any pending output.
*   **Manage agents:** Retrieve agent details or set agent references within the swarm.
*   **Clean up:** Properly dispose of the swarm and its resources when finished.

This class is designed to be used by other components, like client agents or agent-specific services, providing a standardized and controlled way to interact with the overall swarm system. It’s all about providing a safe and tracked way to work with the agents and ensure consistent behavior.

## Class SwarmMetaService

This service helps organize and visualize the structure of your AI agent swarms. It takes the raw information about a swarm – its agents, their relationships, and overall design – and transforms it into a diagram using UML notation. Think of it as a tool to create clear, understandable blueprints of your swarm systems.

It relies on other services to pull in the necessary data, like how agents are defined and what their roles are.  It builds a tree-like representation of the swarm and then converts that into a UML diagram. This makes it much easier to document, debug, and understand how your swarms are put together. The diagrams produced can be automatically generated and integrated into documentation.

## Class SwarmConnectionService

This service acts as a central point for connecting to and managing AI agent swarms. It efficiently handles creating and reusing swarm connections, caching them to avoid unnecessary setup. Think of it as a gatekeeper for your swarm environments.

It works closely with other components like agent management, session linking, and performance tracking, ensuring smooth operation and logging key events. It automatically retrieves configuration data for each swarm and manages agent instances.

Key functions include:

*   **Getting a Swarm:** This is the primary way to connect to a specific swarm environment. It retrieves or creates a connection, optimizing performance through caching.
*   **Emitting Messages:** Allows sending asynchronous messages to the active session within the swarm.
*   **Navigation:** Provides ways to move between agents within a swarm, popping from a navigation stack or returning to a default agent.
*   **Output Control:**  Handles waiting for and cancelling agent output, enabling control over agent interactions.
*   **Agent Information:** Retrieves information about the currently active agent, including its name and instance.
*   **Agent Management:**  Allows setting agent references and names to manage the active agent within the swarm.
*   **Cleanup:** Properly disposes of the swarm connection and clears cached instances when finished.

## Class StorageValidationService

This service helps keep track of all the storage systems used by your AI agents, making sure they're properly set up and working correctly. It essentially acts as a central authority for storage configurations.

When a new storage system is added, this service registers it and ensures that no two systems have the same name. It then performs validation checks, including verifying the setup of the embeddings associated with each storage. 

To improve performance, the validation process is optimized so it doesn't need to re-check configurations unnecessarily. The service integrates with other components to manage storage registration, perform operations, and log any issues.

## Class StorageUtils

This class helps manage how data is stored and accessed for individual clients and their agents within the system. It provides tools to get, add, update, and delete storage items, ensuring that the right agents have permission to work with the data they need.

You can use it to retrieve a limited number of items based on a search query, or to add or update data in storage.  It also allows you to remove items by their unique ID, retrieve specific items, list all items, and even clear out entire storage areas. 

Additionally, it can generate numeric indexes to keep track of the number of items in a storage area and provides a way to completely empty a storage area for a given client and agent. Before any action, it confirms that the client is authorized and that the agent is properly registered for the storage they're trying to use.

## Class StorageSchemaService

This service manages the blueprints for how data is stored within the swarm system. Think of it as a central catalog where different components can find out exactly how to interact with specific storage locations. It ensures these storage instructions are consistent and reliable by doing basic checks when they're added or updated.

It works closely with other services that handle storage connections, embedding references, and agent configurations, making sure everything is properly connected and working together. The system keeps a log of important actions, like registering or retrieving storage schemas, which can be helpful for troubleshooting.

You can use this service to:

*   **Define storage configurations:** Set up the rules for how data is indexed and related to embeddings.
*   **Register new storage methods:** Add new ways for components to store and retrieve data.
*   **Update existing storage methods:** Modify how specific storage locations work.
*   **Retrieve storage methods:** Find the correct instructions for interacting with a particular storage location.

## Class StoragePublicService

This service manages storage specifically for each client, keeping data separate and distinct from system-wide storage. It's like having individual storage containers for each user in your system.

It relies on other services for logging, connecting to the actual storage, and managing the overall context of operations.  You're able to retrieve, add, update, remove, list, and completely clear storage for a given client. 

Each action you take – whether it's adding data, searching for something, or cleaning up – is tracked for logging purposes (if enabled) and is tied to the specific client using the storage.  This makes it easy to track what's happening with each client's data and clean up resources when needed.

## Class StorageConnectionService

This service manages how your agent swarm interacts with different types of storage. It's the central point for getting, putting, and organizing data, making sure each agent has its own space, and allowing for shared storage as needed.

Think of it as a smart librarian – when an agent needs storage, this service finds or creates the right storage area, caches it for quick access, and handles things like keeping track of how much storage is being used.  It works closely with other services to manage configurations, embeddings (for finding similar data), and overall usage tracking.

Key functions include:

*   **Getting Storage:**  When an agent needs to store or retrieve data, this service finds the right place to do so, reusing existing areas to be efficient.
*   **Sharing Data:** It can also handle shared storage, allowing agents to access common data pools.
*   **Data Operations:** Provides core actions like adding, updating, deleting, and listing data items.
*   **Cleanup:**  When agents are finished, this service cleans up their storage areas, making sure resources are released efficiently. Shared storage is handled separately.



It's designed to be reliable and efficient, ensuring that your agent swarm can work seamlessly with its data.

## Class StateUtils

This class provides helpful tools for managing information related to individual clients and agents within the swarm. It lets you easily get, update, and reset specific pieces of data associated with a client and agent combination. When you need to retrieve information, update it, or clear it out, this class handles the details of interacting with the swarm's state service, making sure everything is validated and logged correctly. You can either provide a new value directly when setting state or use a function to calculate the new state based on what's already there.

## Class StateSchemaService

The StateSchemaService is like a central address book for all the "state" configurations used by the swarm system. These states define how agents interact with data and each other. It makes sure these configurations are valid and easy to find.

Think of it this way:

*   It keeps track of all the different state setups, allowing other services to easily access them.
*   It checks new state setups to ensure they're properly formatted before adding them to the registry.
*   If something changes, you can update an existing state setup without having to create a brand new one.
*   It logs these actions, so you can monitor what’s happening with your state configurations.



This service works closely with other components, such as the connection and configuration services, to provide a consistent and reliable state management system for the agent swarm.

## Class StatePublicService

The StatePublicService manages state specifically for individual clients within the swarm system. It’s like a dedicated space for each client’s data, distinct from system-wide settings or persistent storage. This service provides a public interface to interact with that client-specific state, allowing you to set, retrieve, clear, and dispose of it.

Think of it as a helpful assistant that handles client-related state changes – updating it when a client executes a function, tracking its performance, or simply cleaning up resources when needed.  Behind the scenes, it relies on other services to do the actual state operations and keeps things organized by adding context and logging information for debugging and monitoring. It's designed to work seamlessly with ClientAgent, PerfService, and DocService. You can control the level of logging to help with troubleshooting.

## Class StateConnectionService

This service acts as a central hub for managing how different parts of the system interact with and store state information. It helps organize and control how state is created, updated, and cleaned up, especially when dealing with states specific to individual clients.

Think of it as a smart cache; it remembers frequently used state information to avoid repeated work. When you need to access or modify state, this service first checks if it already has the information readily available. If not, it creates it, potentially fetching configurations and persisting data along the way.

It also handles situations where the state is shared among multiple clients, delegating those operations to another service. Importantly, it tracks which states are shared to avoid accidentally cleaning them up prematurely. 

The service also keeps an eye on things, tracking how state is used and ensuring that operations are performed safely and efficiently. Logging helps to trace what's happening, and the whole process is designed to work in sync with other system components. When a client is finished, this service cleans up its associated state information, freeing up resources.

## Class SharedStorageUtils

This class provides helpful tools for interacting with the shared storage used by your AI agent swarm. Think of it as a central hub for managing the data that agents share.

You can use it to fetch data – `take` lets you retrieve a limited number of items based on a search term, while `get` pulls a specific item by its ID.  `list` allows you to see all the items stored, with the option to filter them.

It also handles adding and updating data; `upsert` inserts new items or modifies existing ones.  If you need to remove items, `remove` lets you delete them by ID.  And if you want to wipe a storage clean, `clear` will do that for you. 

Each of these functions includes checks to make sure everything is working correctly and that storage names are valid.

## Class SharedStoragePublicService

This class manages how different parts of the system interact with shared storage – think of it as a controlled gateway for accessing and modifying shared data. It provides a public way to perform common operations like retrieving, updating, deleting, and listing items in the shared storage. The system keeps track of what's happening with these operations through logging, ensuring transparency and aiding in debugging. 

Here's a breakdown of what you can do with it:

*   **Retrieve Data:** You can search for and retrieve a list of items from the shared storage, specify how many you want, and even provide a score to prioritize results.
*   **Update Data:**  Easily insert new items or update existing ones in the shared storage.
*   **Delete Data:** Remove specific items from the shared storage.
*   **Get Specific Items:** Fetch a single, specific item from the storage using its unique ID.
*   **List All Items:** Get a list of all items currently stored in a particular storage area.
*   **Clear Storage:** Completely empty a storage area, removing all items.

The system relies on other services for logging and the actual storage operations, making it flexible and well-integrated with other components.

## Class SharedStorageConnectionService

This service manages shared storage connections within the system, ensuring everyone uses the same storage instance for a particular name. Think of it as a central place to keep data that all parts of the swarm can access. It's designed to be efficient, caching these storage connections to avoid repeated setup. 

When you need to access or modify shared data, this service provides methods like `getStorage` to retrieve the correct connection, and `take`, `upsert`, `remove`, `get`, `list`, and `clear` to interact with the data itself. All these operations are logged for debugging and monitoring, and they rely on other services like `StorageSchemaService` and `EmbeddingSchemaService` to configure the storage appropriately.  The `take` function, for example, can even use similarity searches to retrieve data.  Everything is designed to be consistent with how other parts of the system interact with storage.

## Class SharedStateUtils

This class offers helpful tools for coordinating agents within a swarm by managing a shared memory space. You can easily retrieve existing data stored under specific names, update that data with new values or calculations based on what's already there, and even completely reset a piece of shared data back to its starting point. Think of it as a way to make sure all your agents are on the same page and working with the most current information. It handles the details of interacting with the swarm’s shared state service, so you don’t have to.

## Class SharedStatePublicService

This service helps manage shared data across different parts of the system, allowing various components to access and modify the same information. It acts as a public interface for interacting with the underlying shared state, making sure operations are tracked and scoped correctly.

Essentially, it provides functions to set, clear, and retrieve this shared data. These functions are designed to be used by other services like ClientAgent and PerfService, and they include logging to help understand how the shared data is being used. The service relies on other components for logging and state connection, ensuring consistency and proper handling of operations.

## Class SharedStateConnectionService

This service is responsible for managing shared data across different parts of the system, ensuring everyone is working with the same information. Think of it as a central data store that agents can access and modify.

It intelligently caches these shared data instances, so it doesn’t have to recreate them every time they’re needed. This makes things much more efficient.

When updating the shared data, it handles these updates in a controlled and secure way, ensuring that changes are applied safely and without conflicts.

The service also provides ways to get the current state, reset the state completely, and configure how the data is stored and managed, integrating with other services to handle logging, event propagation, and schema management.

## Class SessionValidationService

This service acts as a central record-keeper for sessions within the agent swarm system. It meticulously tracks which sessions are active, what swarms and modes they're associated with, and which agents, histories, storages, and states are being utilized by each session. Think of it as a librarian, ensuring everything is properly cataloged and accessible.

The service relies heavily on logging for transparency and debugging. It remembers which agents are actively using a session and also which are involved in its history.  It also manages which storage and state resources are associated with particular sessions. 

You can register new sessions, keep track of agent usage, and even remove them when they're no longer needed. Importantly, it provides ways to check if a session exists, retrieve associated information like its swarm or mode, and quickly validate that a session is still valid.  For better performance, it uses memoization to avoid repeatedly validating sessions. Finally, it allows for cleaning up specific validation data without completely removing a session's information.

## Class SessionPublicService

This class acts as the main interface for interacting with sessions within the AI agent swarm. Think of it as a messenger that takes your instructions (like sending messages, running commands, or executing code) and relays them to the core session handling logic.

It's built to be very controlled, using logging to track activity and integrating with other services like performance tracking, event handling, and context management to ensure everything works smoothly and consistently.  You're essentially using a layer that provides a consistent way to send messages, run code, and manage a session's state – all while keeping things organized and monitored. Different functionalities like `execute`, `run`, `connect`, and various commit methods offer various actions for the session.


## Class SessionConnectionService

This service manages communication and actions within a swarm system, acting as a central point for connecting clients and swarms. Think of it as a facilitator, reusing existing connections for efficiency.

It’s responsible for setting up and managing “sessions,” which are like dedicated workspaces for interacting with the swarm. It caches these sessions to avoid unnecessary setup.

Here's a breakdown of what it does:

*   **Session Creation & Reuse:** It efficiently gets or creates a session workspace for each client and swarm, reusing them when possible.
*   **Message Handling:** It allows sending notifications, emitting messages, and executing commands within the session. This includes special actions like running stateless tasks, preventing tool execution, and clearing session data.
*   **Connecting Clients:** It establishes communication channels between clients and the swarm.
*   **Logging and Coordination:** It uses a logger to track activity and works with other services to handle policies, access swarm information, and track performance.
*   **History Management**: Allows commitment of user messages, assistant responses, system messages and tool outputs to the session.


## Class SchemaUtils

This class offers tools for working with session data and preparing data for transmission. It allows you to store and retrieve information associated with individual clients, ensuring that these operations are handled securely and with proper tracking. You can also use it to convert objects into neatly formatted strings, which is helpful for sending data between different parts of the system or for logging. Essentially, it provides a way to manage client-specific memory and present data in a consistent, readable form.

## Class RoundRobin

This class helps manage a rotating list of ways to create things, like different AI agents. Imagine you have several tools you want to use in sequence – this class ensures they are used one after another.

It keeps track of a list of "tokens," each representing a particular creation method.  The `create` method is key; it allows you to build a function that will automatically cycle through these creation methods, ensuring a predictable order.

Essentially, it provides a simple way to distribute tasks or requests across multiple resources in a rotating fashion.  The `instances` property holds the created instances, and `currentIndex` keeps track of where you are in the rotation.

## Class PolicyValidationService

This service is responsible for making sure the policies used by your AI agent swarm are valid and properly registered. It keeps track of all the registered policies and their definitions. 

You can add new policies to the service, and it will ensure that you don’t accidentally register the same policy twice. 

When a policy needs to be enforced, you can use this service to quickly check if it's a registered policy, optimizing performance through caching. It also logs its actions to help with debugging and monitoring.

## Class PolicyUtils

This class offers simple tools for managing client bans within your AI agent swarm's policies. It provides functions to ban a client, unban a client, and check if a client is currently banned. Before taking action, these tools automatically verify that the client ID, swarm name, and policy name are all valid. They also handle the necessary logging and tracking of actions taken. Essentially, it's designed to make managing client access and restrictions within your swarm straightforward and reliable.

## Class PolicySchemaService

The PolicySchemaService manages the rules that govern how our AI agents operate within the swarm. Think of it as a central library where we store and organize these rules, making sure they're valid and available where needed.

It uses a specialized registry to keep track of these rules, ensuring they're consistent and easy to access. Before a rule is added or updated, it undergoes a quick check to confirm its basic structure.

This service works closely with other parts of the system – making sure access controls are enforced, policies are applied during agent activity, and session management adheres to established guidelines. Logging is used to monitor these operations, helping us understand how the rules are being used. It's a vital component for defining and managing the behavior of our AI agents.

## Class PolicyPublicService

This service handles managing policies and restrictions within the swarm system, acting as the main point of contact for policy-related actions. It provides a simplified way to check if a client is banned, retrieve ban messages, validate data, and manage client bans and unbans. 

It works by connecting to the core policy management system and adding extra features like logging and context scoping for better control and debugging. It integrates with other services like performance monitoring and client interaction to enforce policies consistently. 

Essentially, it's a layer of abstraction that makes it easier to apply and manage policies across the swarm, while ensuring that actions are logged and performed within the correct context. You can use it to check if a client has permission to do something, find out why they are blocked, or manually restrict/remove those restrictions.

## Class PolicyConnectionService

This service manages how policies are applied and enforced within the system. It’s like a central coordinator that makes sure client actions align with the defined rules.

It efficiently reuses policy configurations by caching them, avoiding redundant setup. The service works closely with other components like the logging system and event bus to keep everything synchronized and informed.

It provides several key functions:

*   **Policy Retrieval:** It fetches or creates policy configurations, ensuring that rules are consistently applied.
*   **Ban Status Checks:** It verifies if a client is currently banned in a specific swarm.
*   **Input/Output Validation:** It checks incoming data and outgoing results against the policy's rules.
*   **Ban Management:** It allows for banning and unbanning clients from swarms based on policy.

Essentially, this service provides a standardized way to enforce policies throughout the system, making sure everything operates within the defined rules and keeping related systems informed of policy actions.

## Class PersistSwarmUtils

This class helps you manage the state of your AI agents and their navigation history across different clients and swarms. Think of it as a central place to remember which agent a client is currently using and the path they're taking.

It provides easy ways to get and set the currently active agent for each client within a specific swarm. If an agent hasn't been explicitly set, it can fall back to a default.  You can also track a "navigation stack" – a history of the agents a client has used – allowing for backtracking or easy switching between agents.

The system is designed to be efficient by making sure it only creates one persistence instance for each swarm.  If you need more control, you can even provide your own custom ways to store this information, like using in-memory storage or a different type of database.

## Class PersistStorageUtils

This class helps manage how data is saved and retrieved for different clients and storage areas within the swarm system. It provides a straightforward way to get and set data, ensuring that each storage area only uses one persistence instance for efficiency.

You can use it to easily access and store information for each client, like user profiles or logs. 

The system also allows you to customize how the data is persisted, letting you choose a specific method for storing and retrieving information, going beyond the default options.

## Class PersistStateUtils

This utility class helps manage how information is saved and retrieved for each agent within the swarm. It allows the system to remember things like an agent’s current context or variables. 

Essentially, it handles saving and loading data associated with a specific agent (identified by its `SessionId`) and a named piece of information (`StateName`). The system uses a persistence adapter to handle the actual saving and loading, and you can even customize this adapter to use different storage methods like in-memory storage or a database. 

The `getState` method retrieves previously saved data, and if nothing has been saved yet, it provides a default value. The `setState` method is used to save new or updated data. Finally, `usePersistStateAdapter` allows you to change how the data persistence works.

## Class PersistPolicyUtils

This utility class helps manage how policy information, specifically lists of banned clients, is saved and retrieved within your AI agent swarm. Think of it as a central hub for keeping track of which clients are restricted. 

It provides simple ways to get the current list of banned clients for a particular policy and swarm, and to update that list when needed. The system automatically handles saving this information so it's available later.

You can even customize how this data is stored, potentially using your own persistence method instead of the default. This allows for things like tracking policy data in memory or using a database. The goal is to provide flexibility in how policy data is managed across your swarm.

## Class PersistMemoryUtils

This class helps manage how memory is stored and retrieved for each individual user or session within the system. It acts as a central point for persisting and accessing temporary context data related to a specific user.

The system automatically creates and reuses memory storage for each user, making sure resources are used efficiently. You can also swap out the default memory storage method with your own custom solution, offering flexibility for different persistence needs like using a database or an in-memory store.

When a user's session ends, you can explicitly clean up their memory storage to free up resources.

## Class PersistEmbeddingUtils

This class helps manage where and how your embedding data is stored within the swarm system. It lets you define how your embeddings are persisted, whether that's in memory, a database, or another storage method. 

The class includes a way to cache embedding data, so you don’t have to recalculate it every time you need it.  A clever system ensures that you only ever use one persistence mechanism for each specific type of embedding data, which helps save resources.

You can even provide your own specialized "adapter" to completely customize how embedding data is saved and retrieved, offering a lot of flexibility.

## Class PersistAliveUtils

This utility class helps manage whether clients are considered online or offline within your AI agent swarm. It allows you to track each client’s availability, identified by a unique ID, within a specific swarm. 

The class provides simple ways to register a client as online or offline, ensuring that this status is saved so it can be checked later. You can also quickly verify if a client is currently considered online.

To customize how this status is stored – for example, using a database instead of in-memory storage – you can configure a custom persistence mechanism. This gives you flexibility in how the system tracks client availability.

## Class PerfService

The `PerfService` is responsible for meticulously tracking and logging performance data for client sessions within the swarm system. It acts as a data collector, measuring things like execution times, input and output sizes, and session states to provide detailed performance records.

Essentially, it works hand-in-hand with client agents (like those involved in execution and running processes), diligently recording key metrics. Data is logged, and state is computed with the help of various other services like validation and public services.

The service provides ways to start and stop tracking executions, retrieve aggregated metrics, and prepare performance data for reports and analytics. It utilizes several internal maps and structures to keep track of client-specific data, offering insights into individual session performance and overall system health. Cleaning up old data is also possible using `dispose`.


## Class OperatorInstance

This class represents a single instance of an operator within a swarm of AI agents. Think of it as a specific agent participating in a larger coordinated effort.

When you create an `OperatorInstance`, you’re essentially setting up a connection for a particular agent, identifying it with a client ID and an agent name. You can also configure callback functions to handle specific events.

The `connectAnswer` method lets you subscribe to receive answers from the agent.  `notify` is how you send information to the agent, and `answer` sends responses back.  `recieveMessage` is for incoming messages, and `dispose` gracefully shuts down and cleans up the agent’s resources when it's no longer needed.

## Class NavigationValidationService

This service helps orchestrate how agents move around within the swarm, making sure they don’t waste time retracing their steps. It keeps track of which agents have already been visited for a given client and swarm, preventing redundant navigation.

The `getNavigationRoute` function is a smart way to retrieve and manage these navigation paths, remembering them between different requests to improve performance.

You can use `shouldNavigate` to decide whether an agent should be navigated to, and it will automatically add the agent to the tracked route if it hasn't been visited before.

`beginMonit` lets you restart the tracking of navigation for a client and swarm, effectively wiping the slate clean. Finally, `dispose` is used to completely remove navigation tracking for a specific client and swarm when it's no longer needed. A logger service is used to record navigation events and help with debugging.

## Class MemorySchemaService

This service manages temporary, in-memory data for different sessions within the system. Think of it as a simple notebook for each session, allowing you to store and retrieve information specific to that session. It’s a quick and easy way to hold data that doesn't need to be saved permanently.

You can use it to write data for a session, read data back, or completely clear out the data associated with a session when it’s no longer needed. The system keeps track of these operations through logging, if enabled.

It works closely with other services to handle session management and agent interactions, providing a lightweight and flexible way to store session-specific runtime information without any schema validation or data persistence. Essentially, it’s a temporary holding space for session data.

## Class MCPValidationService

The MCPValidationService helps keep track of and confirm the structure of Model Context Protocols (MCPs). Think of it as a librarian for your MCP definitions, ensuring they're all properly registered and can be checked for correctness. 

It uses a system to store these MCPs and lets you add new ones, and then verify that a specific MCP actually exists and is set up correctly. The service relies on a logger to keep records of what’s happening, and it internally manages the collection of MCP schemas.

## Class MCPSchemaService

The MCPSchemaService helps manage and organize the blueprints, or schemas, that define how AI agents communicate and share information within the swarm. Think of it as a central library for these blueprints. 

You can use this service to add new schema definitions, update existing ones with new details, or simply look up a specific schema when needed. It relies on a logger to keep track of what's happening and stores schemas in a registry that uses the schema's name as a key. There's also a built-in check to make sure schemas have the basic, expected structure.

## Class MCPPublicService

This class provides a way to interact with the Model Context Protocol (MCP) for managing AI agent swarms. Think of it as a central hub to control and monitor the tools available to each agent.

You can use it to find out what tools are available to a particular agent, confirm if a specific tool exists, and actually run those tools with the data you provide. It relies on injected services for logging and handling the underlying MCP communication. The class also offers a method to release resources when an agent's work is complete.

## Class MCPConnectionService

The MCPConnectionService manages connections and interactions with different AI models using a standardized protocol. Think of it as a central hub for your AI agents to communicate and use tools.

It relies on other services, like a logger for tracking activity and a bus for communication. The `getMCP` function is a smart shortcut – it finds or creates a connection to a specific AI model, remembering it so you don't have to recreate it every time. 

You can use it to discover what tools are available to a particular agent, check if a tool exists, or actually execute a tool with specific input data.  Finally, when you're done, the `dispose` function cleans up resources and disconnects from the AI model.

## Class LoggerService

The LoggerService helps manage and record events within the system, providing different levels of detail like general logs, debug information, and informational messages. It intelligently routes these messages to both a system-wide logger and a client-specific logger, making it easy to track what's happening and diagnose problems.

The service uses context information about the method and execution to add useful details to the logs. You can control which types of messages are recorded through configuration settings.

It’s designed to be flexible—you can even swap out the system-wide logger while the application is running, which is helpful for testing or specialized logging needs. Think of it as a central hub for all logging activity, ensuring everything is recorded and easily accessible when needed.

## Class LoggerInstance

This class helps manage logging specifically for one client within the system. It lets you customize how log messages are handled, like sending them to a custom endpoint or performing actions when a logger is created or destroyed.

You can set up a `LoggerInstance` by giving it a unique client identifier and specifying callback functions to extend its behavior. The class ensures the logger initializes correctly just once, controlling whether messages show up in the console based on global configuration.

The logger provides standard logging levels—log, debug, info—and a `dispose` method for cleaning up resources. The `dispose` method executes a callback function, ensuring a clean shutdown.

## Class HistoryPublicService

This service manages how history information is accessed and handled within the swarm system. It acts as a public interface for interacting with an agent's history, making sure operations are tracked and properly scoped.

It works closely with other system components – like those responsible for agent communication, system messages, performance tracking, and documentation – ensuring consistent behavior. 

You can use it to:

*   **Add new history entries:** Push messages to an agent's history.
*   **Retrieve past history:** Pop the most recent message or get the entire history as an array.
*   **Prepare history for agent processing:** Convert the history into a format suitable for agents to work with, including adding a prompt.
*   **Clean up history:** Dispose of an agent’s history to free up resources.

All actions are logged to help with debugging and monitoring, and the logging can be easily controlled.

## Class HistoryPersistInstance

This component handles keeping a record of conversations for each agent, allowing you to save and retrieve the history. It stores messages both in memory and on disk for persistence.

When you create an instance, you provide a unique identifier for the agent and optionally configure callbacks for specific actions.

To get things started, the `waitForInit` method loads the existing history from storage. You can then add new messages with `push`, retrieve the most recent message with `pop`, and iterate through the whole conversation using `iterate`. Finally, `dispose` lets you clean up the history, optionally removing it entirely if needed.

## Class HistoryMemoryInstance

This class provides a simple way to keep track of conversations for AI agents in memory – meaning the history isn't saved permanently. It’s designed to be lightweight and easy to use when you don't need persistent storage.

When creating a new history, you're given a unique identifier for the agent, and can provide optional callback functions to be notified of various events like new messages, removals, or cleanup.

To get started, you'll initialize the history for a specific agent. Then, you can add messages using the `push` method. To view the history, use the `iterate` method to loop through the messages. Removing the last message is done with the `pop` method. Finally, when you're finished with the history, `dispose` clears it – either for a specific agent or globally. The `waitForInit` method ensures the history is ready for use by the agent.

## Class HistoryConnectionService

This service acts as a central hub for managing an agent's history – think of it as a record of what the agent has done and said. It cleverly avoids repeatedly creating these history records by caching them, making the whole system more efficient.

Here's a breakdown of what it does:

*   **Provides access to history:** It offers a way to retrieve or create a history record for a specific client and agent, reusing existing records whenever possible.
*   **Handles history updates:**  You can use it to add new messages ("push") or remove the latest message ("pop") from an agent's history.
*   **Formats history for agents:** It can transform the history into a specific format that an agent can understand ("toArrayForAgent").
*   **Provides raw history access:** It can also provide the raw history data if needed ("toArrayForRaw").
*   **Cleans up resources:** When it’s no longer needed, it properly disposes of the history record and clears the cache.
*   **Integrates with other services:** It works closely with services responsible for logging, event handling, and security validation, ensuring everything runs smoothly and securely.

## Class EmbeddingValidationService

This service helps keep track of all the embeddings used within the system, making sure they’re properly registered and available. It acts like a central registry, ensuring that when an embedding is used – perhaps for searching or by an agent – it actually exists and is valid.

The service registers new embeddings, ensuring each one is unique.  It also validates embeddings when they're used, which is particularly important when clients are performing searches or agents are using them in their tasks.  To make things efficient, the validation checks are cached, so they don't need to be repeated unnecessarily. Logging keeps track of what's happening, giving us visibility into the validation process.

## Class EmbeddingSchemaService

The EmbeddingSchemaService acts as a central hub for managing how data is represented and compared within the system. It keeps track of different "embedding schemas," which define the functions used to calculate similarities and create embeddings.

Think of it as a librarian for embedding logic – it makes sure the right embedding functions are available when needed, and verifies they’re set up correctly before they're used.

It works closely with other services like those handling storage and agent logic, ensuring that embedding operations are consistent and reliable.  The service validates new schemas and keeps a record of them, and it logs these actions to help with troubleshooting.  You can update existing schemas as needed, allowing for changes to embedding logic over time. Finally, you can easily retrieve a specific schema when you need it.

## Class DocService

The `DocService` is responsible for creating documentation about the swarm system, including the swarms and agents that make it up. It generates Markdown files for schemas and JSON files for performance data, helping developers understand how the system works.

It uses a bunch of other services (like `PerfService`, `swarmValidationService`, etc.) to pull the necessary information and organizes the output into a well-structured directory system. Logging is controlled by a global setting, and a thread pool handles documentation generation to manage performance.

Key functions include:

*   `writeSwarmDoc`: Creates documentation for a single swarm, detailing its components and providing a UML diagram.
*   `writeAgentDoc`: Generates documentation for an individual agent, including its tools, prompts, and a UML diagram.
*   `dumpDocs`: A main function that generates documentation for *all* swarms and agents in the system.
*   `dumpPerfomance`: Dumps overall system performance data to a JSON file.
*   `dumpClientPerfomance`: Generates performance data for a specific client, useful for understanding how individual client interactions are performing.

Essentially, this service is the go-to tool for creating comprehensive documentation of the entire AI agent orchestration system.

## Class CompletionValidationService

This service ensures that the names given to tasks (called "completions") within the AI agent swarm are unique and properly registered. It keeps track of all valid completion names and checks if a requested completion name is actually allowed. 

Think of it as a gatekeeper for completion names – it makes sure no one tries to use a name that doesn't exist or is already in use. 

The service uses logging to keep track of what’s happening and a technique called memoization to make checking completion names really fast. It works closely with other services to manage completion registration and agent validation, keeping everything synchronized and efficient.

## Class CompletionSchemaService

The CompletionSchemaService manages the definition of how agents within the swarm system complete tasks. Think of it as a central library for these completion methods. It stores and provides access to these “completion schemas,” making sure they are valid and consistent.

This service works closely with other parts of the system, like the agent definition service and the parts that actually run the agents, to ensure everything works together smoothly. If you’re defining how an agent should perform a particular action, this service is involved.

It validates new completion methods, logs activity for debugging purposes (when configured), and provides a simple way to retrieve them when needed. You can even update existing completion methods if requirements change. Essentially, it's the backbone for defining how agents perform their tasks.

## Class ClientSwarm

This class, `ClientSwarm`, is like the conductor of a group of AI agents working together. It manages these agents, keeping track of which one is active and how they're connected. Think of it as a central hub for orchestrating agent interactions.

It handles tasks like switching between agents, waiting for their output, and remembering the path of agents you've been working with. When an agent’s reference changes, the system proactively notifies other components, which makes it adaptable to dynamic environments. It’s designed to work seamlessly with other services in the swarm system, like those responsible for connecting to the swarm, managing individual agents, and handling events.

Key features include:

*   **Agent Management:** Keeps track of active agents and their history.
*   **Output Handling:**  Provides a way to reliably wait for and receive agent output, with cancellation support.
*   **Event-Driven:** Notifies subscribers when agents change or messages are emitted.
*   **Navigation:**  Maintains a 'stack' of previously used agents, allowing for easy backtracking.
*   **Cleanup:** Includes a `dispose` method to ensure all resources are released when no longer needed.

Essentially, this class provides a structured and coordinated way to work with a team of AI agents, ensuring smooth operation and responsiveness.

## Class ClientStorage

This class handles storing and retrieving data within the swarm system, focusing on efficient searches using embeddings. Think of it as a central repository for information, allowing the system to quickly find relevant data based on similarity.

It manages data storage, embeddings (numerical representations of data used for similarity comparisons), and updates these operations in a controlled, queued manner. This ensures that changes are handled reliably and in the correct order.

Key functionalities include:

*   **Storing and Updating Data:** It allows adding, modifying, and removing data items.
*   **Similarity Search:**  It can find data items that are similar to a given search query, leveraging embeddings.
*   **Data Retrieval:**  Allows direct retrieval of data items by their unique identifiers, as well as listing all items or a filtered subset.
*   **Controlled Operations:**  All changes (adding, removing, clearing data) are processed in a queue to prevent conflicts and ensure consistency.
*   **Event Notifications:**  It emits events to inform other parts of the system about data changes and search activity.



It works closely with other services to load data, calculate embeddings, and manage connections to the underlying storage. When finished, it provides a way to cleanly shut down and release resources.

## Class ClientState

The ClientState class manages a single piece of data within the larger swarm system. It holds the current state information and provides a controlled way to read, write, and reset that data. Think of it as a secure container for a specific piece of information, making sure changes happen in a predictable and coordinated way.

It keeps track of pending actions to read or write the state, handling them safely even when multiple parts of the system are trying to access it at the same time.  It also supports middleware, allowing for extra steps to be taken before or after state changes.

You can use `waitForInit` to ensure the state is properly set up before you start using it. The `setState` and `clearState` methods allow you to update the state, with built-in support for saving changes and notifying other parts of the system.  `getState` lets you retrieve the current state data. Finally, `dispose` cleans up when the state is no longer needed, ensuring resources are released properly.

## Class ClientSession

This class, `ClientSession`, manages a single conversation or interaction within a swarm of AI agents. Think of it as a dedicated workspace for a client engaging with the swarm. 

It handles everything from sending and receiving messages to ensuring that those messages are valid and appropriate, and logging actions for tracking and debugging. It orchestrates communication between the client, the agents in the swarm, and various services that manage connections, policies, and history.

Here’s a quick rundown of what it does:

*   **Message Handling:** It sends notifications, emits messages to subscribers, and executes commands.
*   **Policy Enforcement:** It checks messages to make sure they follow the established rules before anything happens.
*   **Agent Interaction:** It interacts with the AI agents within the swarm to execute tasks.
*   **History Tracking:** It keeps a record of messages and actions taken during the session.
*   **Connection Management:** It connects to and disconnects from communication channels.

Essentially, `ClientSession` provides a structured and controlled environment for clients to interact with the AI swarm, ensuring consistent behavior and maintainability.

## Class ClientPolicy

The ClientPolicy class acts as a gatekeeper for your AI agent swarm, controlling access and ensuring messages adhere to established rules. It manages client bans, validates incoming and outgoing messages, and handles restrictions set at the swarm level. Think of it as a customizable filter that protects your swarm from unwanted behavior.

It keeps track of banned clients, fetching this list only when needed to keep things efficient.  You can configure it to automatically ban clients that fail validation, and customize the messages they receive when banned.  It works closely with other components of the system like the message handlers and connection services to implement and enforce these policies.  It also provides events to notify other parts of the system about bans and unbans.

## Class ClientOperator

The ClientOperator is a component responsible for managing interactions with an AI agent swarm. It's designed to be an intermediary, handling the flow of information and commands.

When you create a ClientOperator, you provide some initial setup parameters. It keeps track of outgoing messages and operator signals internally.

The ClientOperator’s core functions include executing instructions, waiting for responses from the agent swarm, and sending messages – both user-generated content and messages from the assistant. Some functions like running, committing tool output, system messages, assistant messages, flush and stopping tools are currently marked as not supported.  You can use it to commit user messages, and to signal changes in the agent’s behavior. Finally, there's a `dispose` method to clean up resources when you're finished with the ClientOperator.

## Class ClientMCP

This class, `ClientMCP`, helps manage the tools that your AI agents use. Think of it as a central hub for interacting with those tools.

When you create an instance, you provide initial setup information.  It keeps track of available tools, and importantly, it avoids repeatedly fetching the same tools by caching them for efficiency.

You can ask it to list all the tools available for a particular agent (identified by a client ID), or check if a specific tool is available. The core function is `callTool`, which allows you to actually execute a tool with the information you provide. Finally, when an agent is finished, `dispose` cleans up resources and clears out cached tools.

## Class ClientHistory

This class manages an agent’s conversation history within the swarm system. It stores and organizes messages, allowing for filtering and retrieval of specific entries. When a new message comes in, it's added to the history and the system is notified. Similarly, the most recent message can be removed and retrieved, which is useful for things like undoing actions.

You can get the entire history as a raw list of messages or, more commonly, retrieve a specially prepared list optimized for the agent’s current task, which might involve filtering out irrelevant messages and adding context like system prompts. Finally, when the agent is no longer needed, this class handles cleaning up and releasing any resources it's using.

## Class ClientAgent

This class, `ClientAgent`, acts as a core component in a swarm of AI agents. It's designed to manage and orchestrate message processing, tool usage, and history updates, ensuring everything runs smoothly and without conflicts. Think of it as the brain of an individual agent, handling everything from receiving a message to generating a response.

It relies on several other services to do its job: connecting to the larger system, managing agent history, understanding available tools, handling completions, coordinating within the swarm, and broadcasting events. The agent uses internal "Subjects" to keep track of important things like tool errors, agent changes, and model recovery events.

The `execute` method is how the agent processes incoming messages and instructions. Similarly, `run` provides a quicker, stateless way to get completions.

Key functions include resolving tools and system prompts, emitting and validating outputs, and handling errors by attempting to revive the model.  There are methods to commit various message types (user, assistant, system, tool outputs), as well as flush the agent's history and stop current tool executions. Finally, `dispose` cleans up and shuts down the agent when it's no longer needed.

## Class ChatUtils

The `ChatUtils` class manages chat sessions for different clients and their interactions with an AI agent swarm. It acts as a central point for creating, sending messages to, and cleaning up chat instances.

When you need a chat session for a client, `ChatUtils` will either create a new one or retrieve an existing one. You can start a new chat session for a client using `beginChat`, and then use `sendMessage` to send messages through that session. 

If you need to monitor when a chat session is finished, `listenDispose` allows you to register a function that will be called when a chat session is ready to be cleaned up. Finally, `dispose` handles the cleanup process when a chat session is no longer needed.

The `useChatAdapter` method allows you to customize how chat instances are created, while `useChatCallbacks` lets you configure functions that will be called at various points in the chat lifecycle.

## Class ChatInstance

The `ChatInstance` class manages a single chat session within a larger swarm of AI agents. It's responsible for keeping track of the chat's lifecycle, sending messages, and ensuring the session remains active.

When a `ChatInstance` is created, it receives a unique client ID, the name of the swarm it belongs to, a function to call when the chat is finished, and optional callback functions for handling specific events.

You can start a chat session using `beginChat()`, and send messages through the `sendMessage()` function.  The `checkLastActivity()` method periodically verifies if the chat is still active based on recent messages, helping to automatically clean up inactive sessions.

Finally, `dispose()` gracefully ends the chat session and releases associated resources, and `listenDispose` allows you to be notified when a chat session ends.

## Class BusService

The `BusService` is the central hub for communication within the swarm system, handling event subscriptions and announcements. Think of it as a message board where different parts of the system can listen for and broadcast information.

You can subscribe to specific types of events, or even subscribe generally to catch all relevant announcements.  It allows different agents, like the ClientAgent or the Performance Service, to interact and share data through a standardized event system.

The service is designed to be efficient. It remembers previously created communication channels to avoid unnecessary overhead. It also ensures that only authorized clients can send messages and provides logging for debugging and monitoring.

Here's a breakdown of what you can do with `BusService`:

*   **Listen for events:**  Subscribe to particular events to receive updates.
*   **Announce events:** Broadcast messages to subscribers.  There are shortcuts for common events like execution start and end.
*   **Clean up:**  Unsubscribe from events when they're no longer needed, ensuring efficient resource usage.
*   **Wildcard subscriptions:** Enable broadcasting to all subscribers of a specific source.

## Class AliveService

This class helps keep track of which clients are currently active within your agent swarms. It lets you easily tell the system when a client joins or leaves a swarm, and it records these changes for tracking purposes. The `markOnline` method indicates a client has become active, while `markOffline` signals that a client is no longer active. These status changes are saved persistently using a dedicated adapter, making sure the system remembers which clients are online even after restarts. It uses a logging service to record activity and relies on the global configuration for persistence settings.

## Class AgentValidationService

The AgentValidationService helps manage and verify the configurations of agents within your AI swarm system. It's like a central hub for ensuring each agent is properly set up and ready to operate.

It keeps track of each agent’s schema (blueprint) and its dependencies on other agents. You can use it to register new agents, check if agents have the required storage or states, and generally make sure everything is configured correctly.

The service relies on other specialized services for tasks like validating tools, storages, and completions, and it logs its operations for monitoring and debugging. To improve performance, it uses memoization, which means it remembers the results of previous validation checks so it doesn's have to repeat them unnecessarily.

You can retrieve lists of agents, their associated storage and wiki names, and check if one agent depends on another. The `validate` method is key – it runs comprehensive checks on an agent’s configuration and makes sure it’s all in order.

## Class AgentSchemaService

This service acts as a central place to store and manage the blueprints for your AI agents. Think of it as a library containing the definitions of each agent, outlining what they do, what tools they use, and how they interact.

It ensures these blueprints are well-formed by performing basic checks and keeps a record of them using a special registry. This registry makes it easy to find and use the correct blueprint when needed.

When a new agent blueprint is added or an existing one is changed, this service keeps track of the changes and logs them for informational purposes. It's a foundational component that works closely with other services to help build, connect, and manage your swarm of AI agents.




The service uses a logger to record its actions, allowing you to monitor how agent blueprints are being managed. It uses a registry to organize and efficiently store these agent blueprints. Before registering a new blueprint or making a change, the system performs basic checks.  The `get` method allows other services to retrieve agent blueprints quickly, and it’s used when setting up new agents and configuring the overall swarm.

## Class AgentPublicService

This service acts as a bridge for interacting with agents within the system. It provides a simplified, public interface for common operations like creating agents, executing commands, running quick completions, and managing agent history. 

Think of it as the main way external components (like the client agent) talk to the underlying agent system. Every action—from executing a command to committing a message—is carefully managed, often with logging to track what's happening.

Here's a breakdown of what you can do with this service:

*   **Create Agents:** Get a reference to a specific agent for a given client and method.
*   **Execute Commands:** Run a command on an agent with a specific mode.
*   **Run Quick Completions:**  Execute a stateless completion on the agent.
*   **Manage History:** Add user messages, assistant responses, tool outputs, system prompts, and flushes to the agent's conversation history.
*   **Control Execution:** Stop tool executions or prevent subsequent tools from running.
*   **Clean Up:** Properly dispose of an agent to release resources.

Essentially, it's a controlled and traceable way to interact with agents, ensuring consistency and providing valuable insight into system behavior.

## Class AgentMetaService

This service helps manage information about agents within the system, like their dependencies and capabilities. It takes agent descriptions and transforms them into a standardized format (UML) that's easy to visualize and understand. Think of it as a translator that converts agent details into a diagram.

It builds diagrams showing the relationships between agents, either detailed views or simplified versions focusing on just the connections. These diagrams are used to document the system and help with debugging.  The service relies on other components to get the agent data and handle logging, making it a central piece in understanding the agent network. It’s particularly useful for creating visual representations of agent interactions and dependencies for documentation purposes.

## Class AgentConnectionService

This service manages connections to AI agents, ensuring efficient reuse and coordinating various system components. Think of it as a central hub for creating, running, and tracking AI agents within the system.

It intelligently caches agents to avoid unnecessary creation, and relies on several other services for tasks like logging, event handling, agent configuration, usage tracking, and managing agent history and storage.  When you request an agent, this service fetches or creates it, making sure it's properly configured and ready to go.

You can use it to execute commands, run quick completions, commit messages to the agent's history, and properly clean up when an agent is no longer needed. It handles the behind-the-scenes details so you can focus on interacting with the agents themselves.

## Class AdapterUtils

This framework provides helpful tools to easily connect to different AI models, like Cohere, OpenAI, LMStudio, and Ollama. Think of it as a universal translator for talking to these AI engines. 

You can use these tools to create specific functions for each AI provider, letting you send requests and receive responses in a consistent way, regardless of which AI you're using. For example, the `fromCohereClientV2` function simplifies communication with Cohere, while `fromOpenAI` does the same for OpenAI.  Similarly, `fromLMStudio`, `fromOllama` are available for these platforms. You can specify which model you want to use with each function, making it flexible for different tasks.

# agent-swarm-kit interfaces

## Interface TAbortSignal

This interface lets you signal when an operation needs to be stopped, similar to how you might cancel a download. It builds on the standard web `AbortSignal` but allows for more specific typing within your application. Think of it as a way to gracefully halt ongoing tasks and clean up resources. You can even add your own extra features or information to this signal if your project needs it.

## Interface IWikiSchema

This interface, `IWikiSchema`, defines the structure for a wiki that an AI agent swarm can interact with. Think of it as a blueprint for how the swarm understands and uses the wiki. 

It includes essential information like the wiki's name (`wikiName`) and a description of the wiki documentation (`docDescription`). 

You can also provide custom actions through `callbacks` to extend the wiki's functionality. 

Finally, `getChat` allows the swarm to query the wiki and receive responses, which is key for them to use the wiki’s knowledge.

## Interface IWikiCallbacks

This interface defines a set of optional functions that can be used to get notified about events happening within the system. Specifically, the `onChat` function allows you to react to chat interactions – you're essentially told when a chat message is processed or generated. If you want to monitor or react to these chat events, you can implement this interface and provide your own function for `onChat`.

## Interface IToolCall

This interface describes a request to use a tool within the agent system. Think of it as a specific instruction from an agent asking to run a particular tool with certain inputs. Each tool call has a unique ID to keep track of it, and for now, it always represents a function call. The details of the function – its name and the arguments it needs – are included here so the system knows exactly which tool to run and what information to give it.

## Interface ITool

This interface defines what a tool looks like within the system, essentially providing a blueprint for functions that AI agents can use. It tells the agents what functions are available and how to use them.

The `type` property categorizes the tool, and currently, it’s always "function". 

The `function` property contains all the details about the tool’s function, including its name, a description of what it does, and a detailed description of the parameters it expects – including their types and whether they're required. This information allows the AI model to understand and correctly use the tool.

## Interface ISwarmSessionCallbacks

This interface lets you listen in on what’s happening within a swarm session. You can set up functions to be notified when a new client joins the swarm, when a command is run, when a stateless completion is processed, or when a message is broadcast. You also get callbacks for session initialization and cleanup, allowing you to track the lifecycle of each connection. These callbacks give you a way to monitor activity, log events, or even perform actions based on what’s happening within the swarm.

## Interface ISwarmSchema

This interface, `ISwarmSchema`, acts as a blueprint for setting up and managing a group of AI agents working together – a swarm. It lets you define how the swarm behaves, where it navigates, and how its agents are managed.

You can configure whether the swarm remembers its progress by enabling persistence.  A descriptive text can be added for clarity and documentation. Rules and restrictions for the swarm's actions can be set using policies. 

You have the flexibility to provide functions for retrieving and saving the swarm's navigation history, as well as selecting which agent is currently active. A default agent is designated to be used if none is explicitly chosen.  The swarm's name and the list of available agents are also defined within this schema. Finally, you can define certain events where you want to customize the swarm's response using optional callbacks.

## Interface ISwarmParams

This interface describes the information needed to set up a swarm of AI agents. Think of it as the configuration blueprint. It requires a unique identifier for the application creating the swarm, a way to log what's happening (for debugging and monitoring), a communication channel for the agents to talk to each other, and a list of the agents themselves, so the swarm knows which agents are participating. It's essentially all the essential pieces to get a swarm up and running.


## Interface ISwarmDI

This interface acts as a central hub, providing access to all the core services that power the AI agent swarm system. Think of it as a toolbox containing everything needed to manage and interact with the swarm.

It bundles essential services like documentation management, event handling, performance tracking, and agent connection management. You're essentially getting a comprehensive set of utilities for handling everything from logging and context management to agent schemas and validation.

Each property represents a specific service with a defined purpose, allowing for modular access to the swarm's functionalities. It provides a structured way to access and utilize the core capabilities of the agent swarm orchestration framework.


## Interface ISwarmConnectionService

This interface helps define how different AI agents connect and communicate within a swarm. Think of it as a blueprint for building services that manage those connections. It’s designed to be a controlled version, removing some internal details to make sure the public-facing parts of the swarm connection service behave consistently and predictably. It ensures that the visible functionality remains clean and well-defined.

## Interface ISwarmCallbacks

This interface lets you listen in on important events happening within your AI agent swarm. Specifically, it notifies you whenever an agent starts working on a new task or switches its focus. You're given the agent's unique identifier, its name, and the name of the swarm it belongs to, so you can update your own system or keep track of what's happening. Think of it as a way to be informed about the agent's journey as it navigates the swarm's workload.

## Interface ISwarm

This interface lets you interact with a group of AI agents working together. You can think of it as controlling a team of specialists.

It lets you retrieve the name and details of the agent currently leading the work. You can also switch between different agents in the group.

If an agent is generating a result, you can cancel that process and get an empty result instead. Otherwise, you can wait for the current agent to finish its task and get its output. 

You can also send messages to the team’s communication channel. Finally, there's a way to manage the order in which agents are used, effectively creating a history of agent selection.

## Interface IStorageSchema

This interface describes how data is stored and managed within the agent swarm. It lets you control whether data is saved permanently, provide a helpful description for understanding its purpose, and determine if it's accessible by all agents. 

You can customize how data is retrieved and saved, and specify the method used to create indexes for searching. The `storageName` gives each storage a unique identifier, and you can add custom lifecycle functions to respond to storage events. Finally, there’s a way to provide default data that will be used when the storage is first initialized or data is missing. The `createIndex` function allows generating an index for a storage item.

## Interface IStorageParams

This interface defines how your application interacts with the storage system for AI agents. Think of it as a set of tools you’re given to manage and work with data related to your agents.

You'll use this interface to identify which client the storage belongs to (using `clientId`) and to give the storage a clear name (`storageName`). It also provides functions to create new embeddings (`createEmbedding`), retrieve pre-calculated ones from a cache (`readEmbeddingCache`), and store embeddings for later use (`writeEmbeddingCache`).  There's a method to compare embeddings (`calculateSimilarity`), and you’ll also have access to logging (`logger`) and event communication tools (`bus`) for keeping track of what’s happening and coordinating with other parts of the system.

## Interface IStorageData

This interface describes the basic information needed to store data within the system. Every piece of information saved will have a unique `id`, which acts like a name tag so we can easily find and manage it later. Think of it as the primary key for each stored item.

## Interface IStorageConnectionService

This interface helps ensure that the publicly available parts of your storage connection service are well-defined and consistent. It builds upon the base `StorageConnectionService`, but strips out any internal details that shouldn’t be exposed to external users. Think of it as a blueprint for creating a public-facing storage connection service that adheres to a specific structure. It’s used to create a type definition, `TStorageConnectionService`, that focuses solely on the features intended for public use.

## Interface IStorageCallbacks

This interface lets you listen in on what’s happening with your storage system. You can register functions to be notified when data is changed, when searches are performed, when the storage is first set up, or when it's being cleaned up. Think of it as a way to get updates about your data and perform actions like logging changes, syncing data elsewhere, or running setup/cleanup routines when needed. You'll receive information like the changed data, who made the change, and the name of the storage involved.

## Interface IStorage

This interface gives you the tools to manage information stored by your AI agents. You can fetch items using a search query and specify how many you want, essentially finding similar information. It also lets you add or update items – the system handles keeping track of everything. Need to get rid of something? You can remove items by their unique ID. Want to see a specific item? You can retrieve it by its ID. To view all items, you can list them, and even narrow down the view using filters. Finally, you have the option to completely wipe the storage clean.

## Interface IStateSchema

This interface describes how each piece of information managed within the agent swarm is structured and behaves. It lets you define whether a state needs to be saved persistently, provides a way to add descriptions for documentation, and controls whether multiple agents can access the same state.

You can specify a unique name for each state, and provide functions to generate initial state values or customize how existing states are retrieved and updated.  It also allows you to chain together functions (middlewares) that run when the state changes, and set up special functions (callbacks) to react to certain events related to the state.

## Interface IStateParams

This interface, `IStateParams`, holds the information needed to manage a specific state within the AI agent swarm. Think of it as a little package of details – it includes a unique identifier for which client is using this state, a logger to keep track of what's happening, and a communication channel (the "bus") to allow different parts of the swarm to talk to each other about this state. Essentially, it's how the system knows who's responsible for the state and how they interact with it.

## Interface IStateMiddleware

This interface defines how you can hook into the AI agent swarm's state management process. Think of it as a way to observe and potentially adjust the data the swarm is using. You can use this to ensure the state is always in a valid format, or to make changes to it as the agents are working. It lets you customize how the swarm handles its data, giving you fine-grained control.

## Interface IStateConnectionService

This interface helps define how different parts of the system interact and share information about the current state of the AI agents. Think of it as a blueprint for a service that manages connections and data flow, but specifically designed to be a public-facing component. It ensures a clear and consistent way for external services to understand and work with the system's state information, while hiding the internal workings.

## Interface IStateCallbacks

This interface lets you listen in on important moments in a state's life. You can use it to be notified when a state is first set up (`onInit`), when it's cleaned up (`onDispose`), or when it's initially loaded with data (`onLoad`).  You also get callbacks when the state's information is read (`onRead`) or modified (`onWrite`), allowing you to track what's happening and react accordingly. Think of these callbacks as hooks you can use to observe and interact with the state's behavior.

## Interface IState

This interface lets you manage the core data your AI agents are working with during their tasks. You can think of it as the central repository for information that all agents can access and modify. 

The `getState` method lets you peek at the current data, allowing you to see what the agents are working with at any time. 

The `setState` method is how you update the data, but instead of directly setting a new value, you provide a function that calculates the new state based on the old one—this ensures controlled and predictable changes.

Finally, `clearState` provides a way to reset everything back to the starting point, essentially giving your agents a fresh start.

## Interface ISharedStorageConnectionService

This interface outlines how different parts of the system can connect to and interact with shared storage. Think of it as a blueprint for building connections, ensuring everyone uses a consistent approach. It focuses on the public-facing aspects of storage interaction, leaving out the internal details that aren’t needed for external use. Essentially, it's a way to make sure everyone accesses shared data in a predictable and standardized way.

## Interface ISharedStateConnectionService

This interface helps us define how different parts of the AI agent swarm system share information. It's a blueprint for a service that manages connections and data exchange, but it specifically leaves out any internal details – think of it as the public-facing side of how agents coordinate. This ensures the system's core workings remain protected while providing a clear, usable interface for sharing state.

## Interface ISessionSchema

This interface, `ISessionSchema`, acts as a blueprint for how session information will be structured in the future. Right now, it’s a simple placeholder, but it’s designed to hold details about session configurations as the system evolves. Think of it as a reserved space to define what data will be associated with each session later on.

## Interface ISessionParams

This interface outlines all the information needed to start a new session within the AI agent swarm. Think of it as a blueprint – it specifies things like a unique ID for the client using the session, a way to log what’s happening, rules and limits for the session, and how the session will communicate with other agents.  It also includes references to the larger swarm system that's managing everything and a name to identify which specific swarm this session belongs to. Essentially, it's a package of settings and connections to get a session up and running.

## Interface ISessionContext

This interface describes the information available about a running session within the system. Think of it as a container holding details about who initiated the session, what they're trying to do, and the surrounding environment. 

It includes the client's unique identifier, a process ID to track the specific operation, and, if applicable, context related to the method being executed and the environment in which it’s running. It essentially gives you a snapshot of the session's state.

## Interface ISessionConnectionService

This interface outlines how different services connect and manage sessions within the AI agent swarm. Think of it as a blueprint for creating a reliable connection between agents, ensuring they can work together seamlessly. It’s designed to provide a clear, public-facing way to handle these connections, hiding the technical details of how it all works under the hood. It helps keep things organized and consistent when different parts of the system interact with each other.

## Interface ISessionConfig

This interface, `ISessionConfig`, lets you control how often or when your AI agents run. You can set a `delay` property – a number representing the time in milliseconds – to space out sessions and prevent overwhelming the system.  The `onDispose` property allows you to define a function that will be executed when the session ends, giving you a chance to clean up resources or perform any necessary final actions. Think of it as a way to manage the timing and cleanup of your agent sessions.

## Interface ISession

The `ISession` interface acts as the central hub for interacting with a single AI agent conversation within the swarm. It provides ways to send messages, trigger actions, and manage the conversation's state.

You can use methods like `commitUserMessage` and `commitAssistantMessage` to add messages to the conversation history, allowing the AI agents to build upon each other's responses. `commitSystemMessage` lets you add system-level instructions or context to the session.

To control the conversation flow, `execute` allows you to run commands, while `commitStopTools` can halt the execution of further actions. `commitFlush` resets the entire conversation history to a clean slate.

The `connect` method is key for integrating the session with external systems, creating a two-way communication channel.  `notify` sends out internal notifications, and `run` lets you perform quick, isolated computations without altering the ongoing conversation. Finally, `commitToolOutput` allows you to record the results of tools used by the agents.

## Interface IPolicySchema

This interface describes how to set up a policy for your AI agent swarm, defining its rules and how it handles banned clients. You can give your policy a name and an optional description for clarity. 

You have the option to automatically ban clients that fail validation, or provide a custom message when a ban occurs. The framework lets you either store the list of banned clients persistently or retrieve and update this list programmatically. 

For maximum control, you can define your own functions to validate incoming and outgoing messages, or customize the actions taken during validation and banning processes. You can also set up callback functions to react to specific events within the policy.

## Interface IPolicyParams

This interface defines the information needed to set up a policy within the AI agent swarm. Think of it as a blueprint for how a policy should behave.

It requires a logger to keep track of what the policy is doing and any problems it encounters.

It also needs a bus, which is a way for the policy to communicate with other agents and components within the swarm. Essentially, it's a messenger service to keep everyone informed and coordinated.

## Interface IPolicyConnectionService

This interface helps us define how different parts of the system connect and coordinate actions based on pre-defined policies. Think of it as a blueprint for ensuring that AI agents within the swarm work together effectively, following specific rules and guidelines. It’s designed to focus on the parts that are visible and usable by outside components, hiding the internal workings that manage those connections. This separation helps keep things organized and prevents accidental modification of core functionality.

## Interface IPolicyCallbacks

This interface lets you plug in your own functions to be notified about what's happening with a policy. You can get a heads-up when a policy is first set up, and also when messages are being checked for validity – both incoming and outgoing. 

If a client ever gets banned or unbanned because of a policy, you're also notified with these callbacks. Think of them as event listeners that allow your system to react to important policy-related changes.

## Interface IPolicy

This interface defines how the AI agent swarm enforces rules and manages client interactions. It allows you to check if a client is currently banned, retrieve the reason for a ban, and validate messages going in and out of the swarm. You can also use it to actively ban or unban clients, effectively controlling access and ensuring messages adhere to specified guidelines. Essentially, it’s the framework for setting boundaries and maintaining order within the swarm.

## Interface IPersistSwarmControl

This interface lets you tailor how the AI agent swarm remembers things. Specifically, you can swap out the default storage methods for two key pieces of information: the active agents currently running and the navigation stacks they use. 

Think of it as providing your own custom "memory" for the swarm. You can use this to store data in different ways, like keeping it only in memory, or using a database. This gives you precise control over how the swarm's data is saved and retrieved.


## Interface IPersistStorageData

This interface describes how data is saved and retrieved for the AI agent swarm. Think of it as a container holding all the information you want to store, like settings or intermediate results. It’s a simple structure: it just holds a list of data items. You'll find this used when saving and loading information for the entire system to ensure everything is consistent.

## Interface IPersistStorageControl

This interface lets you swap out the default way data is saved and loaded for a specific storage area. Think of it as plugging in your own custom data handler. You can use this to connect your storage to a database or any other persistence mechanism you prefer, instead of relying on the built-in storage methods. It gives you precise control over how data is handled for a particular storage location.

## Interface IPersistStateData

This interface describes how information about the agents in the swarm – things like their settings or ongoing session details – is saved and loaded. It acts as a container for whatever data needs to be preserved, allowing the system to remember important details between sessions. Think of it as a way to package up the agent's memory for safekeeping. The `state` property within this interface holds the actual data that needs to be persisted.

## Interface IPersistStateControl

This interface lets you fine-tune how your agent swarm's state is saved and retrieved. Think of it as a way to swap out the default state-saving mechanism with your own custom solution. You can use it to connect your swarm's state to a specific database, file system, or any other storage system you prefer, allowing for more control over persistence. Essentially, it provides a way to inject your own state persistence logic.

## Interface IPersistPolicyData

This interface outlines how we store information about which clients are restricted within a particular swarm. Essentially, it’s a way to keep track of session IDs – think of them as unique identifiers for connected devices – that are currently blocked from participating in a specific swarm.  The `bannedClients` property simply holds a list of these blocked session IDs. This lets the system enforce restrictions and manage access to different swarms.

## Interface IPersistPolicyControl

This interface lets you tailor how policy information is saved and retrieved for your AI agent swarms. Think of it as a way to swap out the standard storage method with your own custom solution. You can use it to connect to a database, store data in memory, or use any other mechanism you prefer, all while keeping the overall swarm orchestration framework consistent. Essentially, you're providing a replacement component that handles the behind-the-scenes work of managing policy data for a specific swarm.

## Interface IPersistNavigationStackData

This interface describes how we keep track of the agents a user has interacted with during a session. It's like a history list of agent names, allowing us to remember the navigation path within the swarm. The `agentStack` property simply holds this list of agent names, acting as a record of which agents were accessed and in what order. This data is used to help users navigate back to previous agents or understand their interaction history.

## Interface IPersistMemoryData

This interface describes how information related to an agent's memory is saved and loaded. Think of it as a container holding the actual data – whatever that data might be – that needs to be stored for later use. The `data` property holds this information, allowing the system to manage and persist the memory of individual agents within the swarm.

## Interface IPersistMemoryControl

This interface lets you customize how your AI agent's memory is saved and loaded. Think of it as a way to plug in your own system for handling memory data, instead of relying on the default approach. You can use this to, for example, store memory data in a database, a file, or even just keep it in the current session if you need a temporary solution. It gives you fine-grained control over where and how the memory associated with each session is persisted.

## Interface IPersistEmbeddingData

This interface describes how data representing embeddings is stored for later use within the AI agent swarm. Think of it as a way to save the numerical representation of a text or concept. It holds an array of numbers, where each number contributes to the overall meaning or "fingerprint" of the original text. This saved data can then be used to compare and relate different pieces of information within the swarm.

## Interface IPersistEmbeddingControl

This interface gives you the ability to tailor how embedding data is saved and retrieved. It lets you swap out the default way embeddings are persisted with your own custom solution. Think of it as a way to plug in your preferred storage mechanism, whether it’s a database, a file system, or something else entirely – all while keeping things organized by the embedding’s name. This is especially helpful if you need unique storage behavior for specific swarm configurations.

## Interface IPersistBase

This interface provides the foundation for reliably saving and retrieving information within the swarm system. It lets you manage entities – things like agent states or memory – by storing them as JSON files. 

The `waitForInit` method sets up the storage area, making sure it’s ready to go and cleaning up any damaged files. 

`readValue` lets you grab a specific entity by its ID, while `hasValue` allows you to quickly check if an entity exists without actually loading it. 

Finally, `writeValue` is used to save entities to persistent storage, making sure the data is written safely and consistently.

## Interface IPersistAliveData

This interface helps the system remember whether a client is currently active. It's like a simple check-in mechanism. It tracks if a particular client, identified by its session ID, is online or offline within a specific swarm. The `online` property is the key piece of information – it's a straightforward `true` or `false` value indicating the client’s status.

## Interface IPersistAliveControl

This interface lets you tailor how the system remembers whether an AI agent swarm is still active. Think of it as a way to plug in your own method for saving and loading that "alive" status. If the built-in way of handling this isn't quite what you need – perhaps you want to track it in a specific database or just keep it in memory – you can use this to swap in a custom solution. You provide the blueprint for your custom persistence method, and the framework will use it to manage the swarm's alive status.

## Interface IPersistActiveAgentData

This interface describes how we keep track of which agent is currently running for each client participating in a swarm. It’s essentially a way to remember the active agent, using a simple name like "agent1", so we know where to pick up if things get restarted. This information is used internally to manage the agents within the swarm.

## Interface IPerformanceRecord

This interface helps track how well a process is running within the AI agent swarm. It collects performance data from all the clients involved, like individual sessions or agents. Think of it as a report card for a specific task, showing how many times it ran, how long it took, and when it happened.

The `processId` uniquely identifies the specific task being monitored.  You’ll see a breakdown of performance for each client within the `clients` array, allowing you to pinpoint any bottlenecks. The record also keeps track of overall numbers – total executions, total response time, and average response time – giving you a clear picture of the process's efficiency. Finally, several timestamps (`momentStamp`, `timeStamp`, and `date`) provide detailed timing information for accurate tracking and analysis.


## Interface IPayloadContext

This interface, `IPayloadContext`, acts as a container for important information related to a task or request. Think of it as a little package that holds everything needed for an agent to understand what to do and where it came from. It includes a `clientId` which identifies the specific client or system that initiated the request, ensuring accountability and tracking. Inside this package, you'll find the actual `payload` – the data the agent will be working with, and its type is flexible to accommodate different kinds of tasks.

## Interface IOutgoingMessage

This interface describes a message that the swarm system sends out to a client, like an agent's response or a notification. It's how the system communicates back to clients, ensuring the right information gets to the intended recipient.

Each message has a `clientId`, which is a unique identifier for the client that should receive it – think of it as the client’s address within the system.  It also includes `data`, which is the actual content of the message – the information being sent.  Finally, `agentName` tells you which agent within the swarm generated the message, helping you track down the source of the response.

## Interface IOperatorSchema

The `IOperatorSchema` interface defines how different AI agents within your swarm can communicate and coordinate. 

Specifically, `connectOperator` is the key method that lets you establish a connection between a client (identified by a `clientId`) and a particular agent (identified by `agentName`).  

This connection creates a communication channel where the client can send messages to the agent, and the agent can respond. The connection is managed using a `DisposeFn`, ensuring proper cleanup when the interaction is complete. Think of it as the handshake that sets up the conversation between your agents and the outside world.

## Interface IOperatorParams

This interface, `IOperatorParams`, defines the essential information needed to configure and run an operator within the agent swarm orchestration framework. Think of it as a set of building blocks – each property provides a vital piece of the puzzle for the operator to function correctly.  

`agentName` identifies the specific agent this operator is associated with. `clientId` helps track and manage different client requests. The `logger` allows the operator to record important events and debug issues. The `bus` provides a communication channel to interact with other agents or systems. Finally, `history` enables the operator to remember past interactions and decisions, contributing to a more informed workflow.

## Interface IOperatorInstanceCallbacks

This interface helps you keep track of what's happening with individual agent instances within the swarm. Think of it as a way to listen in on key moments of an agent’s lifecycle – when it starts up, provides an answer, receives a message, is shut down, or sends out a notification. You can use these callbacks to build custom logic that reacts to these events, like logging them, displaying information to a user, or triggering other actions. Each callback provides information about which client the agent is working with and the agent's name, so you know exactly which instance is involved in the event.

## Interface IOperatorInstance

This interface defines how you interact with a single agent within a larger swarm. Think of it as the main control panel for one agent.

You can use `connectAnswer` to set up a way to receive responses from the agent – it's like registering a listener for incoming messages. The `answer` method is your way to send information back to the agent. 

`init` establishes the initial connection with the agent, while `notify` is for sending out status updates or alerts.  `recieveMessage` handles receiving general messages intended for the agent. Finally, `dispose` gracefully shuts down the connection to the agent when you're done with it.

## Interface IOperatorControl

This interface lets you configure how your AI agent operators behave. You can tell the system which functions you want to use to respond to events happening within your operators, essentially customizing their communication. 

Furthermore, you can plug in your own specialized "adapter" to change how operators are created and managed, allowing for greater flexibility in how they function within your orchestration framework. This adapter essentially acts as a middleman, letting you tailor the operator lifecycle to your specific needs.

## Interface IModelMessage

This interface defines the structure for messages exchanged within the agent swarm system. Think of it as a standardized way to represent any communication – whether it’s a user’s input, a tool’s output, a system notification, or a message during error recovery.

Each message has a `role` to indicate who or what sent it (user, tool, assistant, system, or for special operations like error recovery or history resets).  The `agentName` tells you which agent created the message, which is vital in a swarm environment with multiple agents working together. The `content` is the actual text or data being passed.

The `mode` property clarifies the message's origin, distinguishing between user-initiated actions and tool-related processes.  If the message involves a tool execution request, you'll find details about those calls in the `tool_calls` array. Images can be included with messages too, and sometimes messages carry extra data in a `payload`. Lastly, `tool_call_id` connects tool outputs back to their original requests.

## Interface IMethodContext

The `IMethodContext` interface provides a standard way to track details about each method call within the system. Think of it as a little packet of information that travels with every method invocation, ensuring everyone has the same understanding of what's happening.

It contains key identifiers like the client's session ID, the name of the method being called, and the names of the agent, swarm, storage, state, policy, and MCP involved. This information is used by various services to monitor performance, generate logs, and provide documentation, all working together to give a clear picture of the system's activity. It’s a foundational piece for understanding how different parts of the system interact.

## Interface IMetaNode

This interface describes the basic building block for representing how agents and resources are connected within the system. Think of it as a node in a family tree, but for AI agents. Each node has a `name` which identifies it – this could be the agent’s name or a specific resource it uses. It can also have `child` nodes, which are other nodes representing dependencies or related components, effectively creating a hierarchical structure. This structure allows the system to visualize and understand the relationships between agents and their resources.

## Interface IMCPToolCallDto

This interface defines the structure for passing information related to a tool call within the AI agent swarm orchestration framework. It bundles together key details like a unique ID for the tool being used, who is requesting the tool (the client ID), and the name of the agent initiating the call. 

You'll find the specific parameters needed for the tool in the `params` field, alongside any related tool calls. There’s also a way to signal the operation to be stopped prematurely, and a flag to indicate if this is the final tool call in a series of actions. Essentially, it's a package of information facilitating communication about a tool's execution.

## Interface IMCPTool

This interface describes a tool used within an AI agent swarm. Each tool needs a name to identify it, and optionally a description to explain what it does. Crucially, it also specifies an `inputSchema` which dictates the format and required data the tool expects to receive – think of it as defining the tool’s specific needs for successful operation. This schema ensures the agents pass the right kind of information to the tool when they need it.

## Interface IMCPSchema

The `IMCPSchema` interface describes how a Managed Control Plane (MCP) operates within the agent swarm. Think of it as a blueprint that tells the system what an MCP *is* and what it can *do*. 

Each MCP has a unique `mcpName` to identify it, and can also have a `docDescription` to explain its purpose.

The `listTools` function lets the MCP tell the system which tools it offers to a particular client. 

The `callTool` function is how the system actually triggers a tool within the MCP, sending it information needed for its task.

Finally, `callbacks` allow the MCP to receive notifications about important events happening within the overall system, letting it react and adjust accordingly.

## Interface IMCPParams

This interface defines the required settings when configuring a Message Coordination Protocol (MCP) process. Think of it as a blueprint for how your MCP should behave. It includes a logger, which is essential for tracking what’s happening and debugging issues, and a bus for sending and receiving messages related to the swarm's activities. You'll provide these components when setting up your MCP to ensure proper communication and monitoring.

## Interface IMCPConnectionService

The `IMCPConnectionService` interface helps manage connections to your AI agents. Think of it as the central hub for talking to and receiving information from your swarm. It provides methods to establish, maintain, and close these vital communication links, ensuring your agents can effectively participate in the orchestration framework. This interface is key for setting up the foundation of how your agents receive instructions and report back their progress and findings. It facilitates a reliable and structured interaction model for your agent swarm.

## Interface IMCPCallbacks

This interface lets you hook into important moments in the agent swarm’s lifecycle. You can use these callbacks to monitor and react to what’s happening.

When the entire system starts up, the `onInit` callback gets triggered. When a client's resources are cleaned up, `onDispose` is called, letting you know a connection is ending. 

If you need to know when tools are being gathered for a client, `onFetch` will notify you. Similarly, `onList` lets you know when tools are being listed.

Finally, the `onCall` callback is your go-to for when an agent actually uses a tool – it provides information about which tool was used and any data associated with the call.

## Interface IMCP

This interface, called IMCP, defines how to interact with the tools available to your AI agents. 

Think of it as the way you tell your agents which tools they can use and then instruct them to actually *use* those tools.

You can use `listTools` to see what tools are accessible to a particular agent. 

`hasTool` lets you quickly check if an agent even *has* a specific tool before trying to use it.

Finally, `callTool` is how you actually trigger a tool to run, passing in the data it needs to do its job.

## Interface IMakeDisposeParams

This interface defines the information needed when you want to automatically handle the cleanup of an AI agent within a swarm. It lets you specify a timeout – a maximum time to wait for the agent to finish its work – and a function that will be called when the agent is being shut down. You provide the client ID and swarm name to this `onDestroy` function, allowing you to perform any necessary cleanup or logging related to that specific agent’s termination. Essentially, this interface helps ensure orderly agent lifecycle management within your swarm orchestration system.


## Interface IMakeConnectionConfig

This interface, `IMakeConnectionConfig`, helps you control how quickly your AI agents connect and communicate. It allows you to introduce pauses or limits. The `delay` property lets you specify a time interval, in milliseconds, that should be waited before a connection is established, giving you fine-grained control over the timing of interactions between agents.

## Interface ILoggerInstanceCallbacks

This interface provides a way for other parts of your application to interact with a logger. Think of it as a set of hooks that get triggered at key moments in the logger's life – when it starts up, when it shuts down, and whenever a log message is created. You can use these hooks to monitor the logger's activity, react to log events, or even customize how logging works in your system. Specifically, you’re given functions to execute when the logger is initialized, when it’s being cleaned up, and for each type of log message (debug, info, and standard log) generated.

## Interface ILoggerInstance

This interface defines how a logger should behave when it's brought online and then taken offline within the AI agent swarm orchestration framework. 

It allows for controlled initialization, potentially involving asynchronous setup, and guarantees that the logger is properly cleaned up when it's no longer needed. Think of it as a way to manage the lifecycle of logging, making sure everything is ready to go when it should be, and that resources are released when they’re done. 

Specifically, `waitForInit` handles the startup process and `dispose` handles the shutdown and cleanup.

## Interface ILoggerControl

This interface lets you customize how logging works across your AI agent swarm. You can influence the central logging system by setting up common adapters or swapping out the standard logger with your own custom version. It also allows you to define specific lifecycle callbacks for individual logger instances. Finally, you can directly log messages—info, debug, or general— tied to particular clients, ensuring you capture the context of where those logs originated, complete with session verification.

## Interface ILoggerAdapter

This interface outlines how different parts of the AI agent system can connect and use logging services. It defines the basic actions like logging messages, debugging information, and providing general status updates, all tied to a specific client. Each logging action includes client identification and a topic to categorize the message. There's also a way to clean up and release resources used by a client's logger when it's no longer needed. This ensures that logging is handled consistently and cleanly across the entire system.

## Interface ILogger

This interface defines how different parts of the AI agent swarm system can record information. It's like a central place for writing down what’s happening, allowing you to track events, debug problems, and keep an audit trail.

You can use the `log` method for general notes about what's occurring, like when an agent starts or finishes a task.  The `debug` method is for very detailed information, often used during development to understand the inner workings of the system, such as what's happening when a tool is used. Finally, `info` lets you record important updates, such as successful policy checks or when history is saved.

## Interface IIncomingMessage

This interface describes a message coming into the AI agent system. It represents information sent from a client, such as a user's input, and routed to a specific agent for processing.

Each message includes a unique identifier for the client who sent it, the actual content of the message itself, and the name of the agent that should handle it. Think of it as a structured way to deliver instructions and data to the right agent within the swarm. The `clientId` helps track which client is sending what, the `data` holds the message content, and the `agentName` directs the message to the intended agent for action.

## Interface IHistorySchema

This interface describes how your AI agent swarm keeps track of past conversations and interactions. Think of it as the blueprint for the history system – it defines how messages are stored and accessed. The core of this system is the `items` property, which specifies the exact method used to handle the message history, whether that's a database, a simple file, or another storage technique. This adapter is the key to ensuring your agent swarm remembers what it's done.

## Interface IHistoryParams

This interface defines the information needed to create a record of an agent's activities. Think of it as a template for keeping track of what each agent does – you’re telling the system which agent is doing something, who initiated the request (the client ID), and how to log any issues that arise. It also includes a way to send messages between different parts of the system, allowing agents and other components to communicate effectively. Essentially, it’s all about providing context and ensuring reliable tracking and communication for each agent within the swarm.

## Interface IHistoryInstanceCallbacks

This interface defines a set of functions you can use to customize how the history of messages for an AI agent is managed. You can use these functions to get initial data for an agent’s history, determine which messages should be saved, and react to changes like adding or removing messages.  You can also define actions to take when the history is first loaded, when it's being read, or when it’s no longer needed.  Essentially, it gives you hooks into the lifecycle of an agent's message history, allowing you to tailor its behavior to your specific application needs. A reference to the complete history object is also provided for more direct interaction when required.

## Interface IHistoryInstance

This interface describes how to work with a history of interactions for each agent in the swarm. It provides ways to retrieve past messages, make sure the history is ready, add new messages as they happen, and clean up when an agent is no longer needed. You can use the `iterate` method to step through all the messages an agent has sent or received, and `push` to record new interactions. The `waitForInit` method helps get everything set up at the beginning, while `pop` lets you remove the most recent entry. Finally, `dispose` allows you to properly clean up an agent’s history when it's time to release resources.

## Interface IHistoryControl

This interface lets you fine-tune how history is managed within the agent swarm orchestration framework. You can use it to tell the system when certain events happen during the history lifecycle, like when a history item is created or deleted, by providing custom callback functions. 

Additionally, you have the flexibility to define your own way of creating history instances, allowing you to tailor the history management to your specific needs by supplying a custom constructor. This provides a way to inject specialized logic into the history creation process.

## Interface IHistoryConnectionService

This interface, IHistoryConnectionService, is essentially a blueprint for how to connect and manage historical data. Think of it as a standardized way to interact with past events and information within the system. It’s designed to be a public-facing definition, meaning it outlines the core functionality available without exposing the internal workings of the system. By using this interface, developers can be sure they're using a consistent and reliable way to access historical records.

## Interface IHistoryAdapter

This interface helps manage the conversation history for your AI agents. Think of it as a way to record and retrieve past interactions.

You can use the `push` method to add new messages to the history, specifying the message content, the client identifier, and the agent's name.  The `pop` method lets you retrieve and remove the most recent message, useful for things like showing the latest interaction.  If you need to completely clear the history for a specific client and agent, `dispose` is the way to go. 

Finally, `iterate` provides a way to loop through all the messages stored in the history for a particular client and agent, letting you process or display them as needed.

## Interface IHistory

This interface helps you keep track of all the messages exchanged with AI models within your swarm. Think of it as a logbook for your agents’ conversations.

You can add new messages using the `push` method, retrieve the last message with `pop`, and get the history ready for a specific agent using `toArrayForAgent`. The `toArrayForRaw` method lets you see all the messages in their original form, unfiltered and unformatted. It’s designed to help you understand and manage the flow of information within your swarm.

## Interface IGlobalConfig

The `IGlobalConfig` interface defines a central hub for configuring and controlling the AI agent swarm system. Think of it as a control panel with numerous settings that influence how the system behaves.

**Core Functionality and Settings:**

*   **Error Handling:** It provides options like `CC_RESQUE_STRATEGY` to handle tool call exceptions, allowing you to choose between resetting the conversation (`flush`), retrying tool calls (`recomplete`), or using a custom approach.  It also includes prompts to fix tool call errors, specifically designed for certain models.
*   **Conversation Management:** Settings like `CC_EMPTY_OUTPUT_PLACEHOLDERS` help create a better user experience when the model outputs nothing. `CC_KEEP_MESSAGES` controls the history size.
*   **Tool Usage:** `CC_MAX_TOOL_CALLS` limits the number of tools an agent can use per execution.
*   **Customization:**  Many settings are function callbacks (`CC_AGENT_MAP_TOOLS`, `CC_GET_AGENT_HISTORY_ADAPTER`) that allow you to modify how tools are called, how history is managed, and how logging is handled.
*   **Logging:**  You can control the verbosity of logging with flags like `CC_LOGGER_ENABLE_DEBUG` and `CC_LOGGER_ENABLE_INFO`.
*   **Agent and Swarm Behavior:** It manages agent defaults, navigation stacks, and includes callbacks for when agents or stacks change.
*   **Output Processing:** `CC_AGENT_OUTPUT_TRANSFORM` cleans agent outputs by removing unwanted tags and symbols.
*   **Storage and Caching:** Settings exist for managing persistent storage, caching embeddings to reduce costs, and controlling the fetching of data.
*   **Operational Limits:** Functions like `CC_DEFAULT_CONNECT_OPERATOR` enable connections between clients and agents, and `CC_ENABLE_OPERATOR_TIMEOUT` helps manage operator timeouts.

Essentially, `IGlobalConfig` gives you granular control over every aspect of the agent swarm's operation, allowing you to fine-tune its behavior for specific use cases and environments.

## Interface IFactoryParams

This interface lets you customize how your AI agents communicate during navigation. You can provide specific messages or functions to handle situations like clearing the agent's memory, displaying tool outputs, sending messages, or triggering actions. 

The `flushMessage` property lets you define what happens when the agent's memory needs to be cleared, either a static message or a function that dynamically generates one.

`toolOutput` allows you to control how the output from tools used by the agent is presented.

`emitMessage` lets you determine the message sent during agent navigation.

Finally, `executeMessage` allows you to shape the message used when the agent takes action. 

These properties give you a lot of flexibility in tailoring the agent's behavior and communication style.

## Interface IFactoryParams$1

This interface helps you customize how your AI agents communicate during navigation. It lets you define specific messages or functions to be used when the agents need to clear data, execute tasks, or process the results of using tools. You can provide a simple text message for each scenario, or use a function that dynamically generates the message based on factors like the client ID and the default agent involved. This gives you a flexible way to control and tailor the agent’s interactions.

## Interface IExecutionContext

This interface, `IExecutionContext`, acts like a shared notebook for different parts of the system as an operation unfolds. It holds key information – a client ID to identify who initiated the work, a unique execution ID to track the specific run, and a process ID linking it to the overall system configuration. Think of it as a way to connect the dots between the user, the execution itself, and the larger process it’s a part of, allowing various services to understand and monitor what's happening.

## Interface IEntity

This interface serves as the foundation for all data objects that are saved and managed within the agent swarm. Think of it as a common blueprint – each distinct type of data, like agent status or environmental information, builds upon this base to add its own specific details. It ensures consistency and provides a shared understanding of how these data elements are handled throughout the system.

## Interface IEmbeddingSchema

This interface lets you configure how your AI agents understand and compare information. You can choose whether to save agent data for later use, assign a unique name to your embedding method, and define how embeddings are stored and retrieved from a cache to speed things up. 

You have the flexibility to customize events related to creating and comparing embeddings with optional callbacks. The system provides functions to generate embeddings from text and to measure how similar two embeddings are, essential for tasks like searching and ranking.

## Interface IEmbeddingCallbacks

This interface lets you tap into what's happening as your AI agents generate and compare embeddings – those numerical representations of text. You can use the `onCreate` callback to monitor when a new embedding is made, perhaps to track which text led to which embedding or to perform some extra processing. Similarly, the `onCompare` callback gives you a notification whenever two embeddings are compared to see how similar they are, letting you keep an eye on the similarity calculations. These callbacks offer a way to customize and understand the embedding process within your swarm orchestration.

## Interface ICustomEvent

This interface lets you create and send custom events within the swarm system. Think of it as a way to communicate specific, unique information that doesn’t fit into the standard event formats. You can attach any kind of data you need to these events using the `payload` property, making it ideal for situations requiring more flexibility. This is particularly useful when you want to trigger actions or share information in a way that's tailored to your specific needs, rather than relying on pre-defined event structures.

## Interface IConfig

This interface defines the configuration options for generating a UML diagram, specifically related to whether to include subtrees in the visualization. The `withSubtree` property, a simple boolean, controls this inclusion—setting it to `true` means subtrees will be shown, and `false` means they will be omitted. This allows you to adjust the level of detail in the generated UML diagram to suit your needs, creating a broader overview or a more granular representation.

## Interface ICompletionSchema

This interface describes how different components within the system can generate and manage completion actions. Think of it as a blueprint for creating ways to automatically respond or take actions based on the swarm's decisions. 

Each completion mechanism has a unique name to identify it. You can also customize what happens after a completion is generated by providing callbacks for different events. 

The core function, `getCompletion`, is how you actually request a completion. It takes some input data and produces a response from the model, potentially using available tools.

## Interface ICompletionCallbacks

This interface gives you a way to be notified when an AI agent successfully finishes a task. Specifically, the `onComplete` property lets you define a function that gets called after the completion. You can use this function to do things like record what happened, process the results, or start another action based on the completion. It’s a handy way to extend the behavior of the AI agent swarm orchestration.

## Interface ICompletionArgs

This interface defines the information needed to ask the AI agents to generate a response. Think of it as a package of data containing everything the agents need to understand the request.

It includes a client ID to identify who is making the request, the name of the agent involved, and the execution mode, which tells us whether the message came from a tool or a person. 

The most important part is the `messages` array – this holds the history of the conversation so the agent can understand the context.  Finally, there’s a list of available tools the agent might use to answer.

## Interface ICompletion

This interface defines how your AI agents can generate responses. Think of it as a blueprint for creating a system where agents can produce outputs, whether that's text, code, or something else entirely. It builds upon a standard completion process, adding extra features to make the whole response generation process more robust and flexible.

## Interface IClientPerfomanceRecord

This interface tracks the performance details for individual clients, like user sessions or agent instances, within a larger process. It provides a way to understand how each client is performing, not just the overall system.

Each client has a unique identifier (`clientId`) allowing you to correlate performance data to a specific session or agent. The `sessionMemory` and `sessionState` properties store temporary data and persistent configuration information for each client, similar to how an agent manages its internal state.

You’re also able to measure how much data is being processed (`executionInputTotal`, `executionOutputTotal`), as well as average sizes and total execution times for a complete picture of client-level performance. The time values are provided as strings for easy readability.

## Interface IChatInstanceCallbacks

This interface defines a set of callbacks that allow you to react to events happening within a chat instance managed by the AI agent swarm orchestration framework. You can use these callbacks to monitor the lifecycle of a chat, from its initialization to when it’s finished, and to be notified when messages are sent. 

Specifically, you'll get notified when a chat instance starts up (`onInit`), when it's finished and cleaned up (`onDispose`), when a new chat session begins (`onBeginChat`), and when a message is sent during the chat (`onSendMessage`). You can also use `onCheckActivity` to keep track of whether a client is still active in the swarm and when they last interacted.

## Interface IChatInstance

This interface represents a single chat session within the agent swarm. It provides methods to start a chat, send messages, and check for activity to keep the session alive. You can also use it to clean up resources when the chat is no longer needed through the `dispose` method. Finally, if you want to be notified when a chat session is closed, you can register a listener to receive dispose events.

## Interface IChatControl

This framework lets you define how your AI agents communicate and collaborate. 

The `IChatControl` interface provides a way to customize the underlying chat functionality. You can specify which class will be used to create chat instances with `useChatAdapter`, essentially choosing the engine powering the agent conversations. 

Additionally, `useChatCallbacks` allows you to hook into specific events happening within the chat process, giving you more fine-grained control over how the agents interact. This lets you tailor the communication flow to your specific needs.

## Interface IChatArgs

The `IChatArgs` interface defines the information needed to initiate a chat with an agent. It includes a `clientId` which uniquely identifies the client sending the message. You'll also specify which `agentName` should handle the conversation. Finally, the `message` property holds the actual text of what the client wants to communicate.

## Interface IBusEventContext

This interface provides extra details about events happening within the agent swarm system. Think of it as a way to add labels to events, helping to identify which agent, swarm, or other system components were involved. When an agent is sending information, it usually just includes its own name. However, other parts of the system might use this interface to specify details like the swarm or storage involved in a particular event. It’s a way to provide more context and traceability for what's going on.

## Interface IBusEvent

This interface defines a standardized way for different parts of the system to communicate events, especially within the agents themselves. Think of it as a structured message being sent around – it ensures everyone understands what's happening and why.

Each event includes information about where it came from (the source), what kind of event it is (the type), and any data that’s relevant – both input and output. Contextual information, like the agent’s name, is also included to provide more background. This structure makes it easier for the system to react to events and track what's going on in the swarm.

## Interface IBus

The `IBus` interface provides a way for different parts of the system, especially agents, to communicate with each other asynchronously. Think of it as a central messaging system where agents can broadcast updates and information to specific clients.

It has one main method, `emit`, which is used to send these messages.  When an agent does something important – like completing a task, generating an output, or saving data – it uses `emit` to inform the system and, more importantly, to notify the intended client. 

Each message, or "event," follows a standard format. It includes information about what happened (the `type`), where it came from (`source`), any input data, any resulting output, and crucially, the ID of the client it's being sent to.  The client ID is repeated in the event itself for extra certainty.

The `emit` method returns a promise, confirming that the message has been queued for delivery, rather than being instantly guaranteed to arrive. This allows for flexible routing and processing of messages.  This helps keep the different components of the system working independently and efficiently.

## Interface IBaseEvent

This interface establishes a standard way for different parts of the system to communicate using events. Every event, whether it’s a core system message or a custom one, will have at least a `source` to indicate where it came from and a `clientId` to specify which client the event is intended for. Think of `source` as the department sending a message and `clientId` as the specific recipient within that department. This foundational structure helps ensure events are routed correctly and consistently across agents, sessions, and the swarm itself.

## Interface IAgentToolCallbacks

This interface defines a set of optional functions you can use to interact with and monitor the lifecycle of an agent tool. Think of these functions as hooks that let you step in before, after, or even during a tool's execution.

You can use `onBeforeCall` to perform tasks like logging or preparing data just before a tool runs. `onAfterCall` allows you to clean up or record results after the tool finishes. 

If you need to ensure a tool's inputs are correct before it runs, `onValidate` lets you create custom validation logic. And if a tool encounters an error, `onCallError` provides a way to handle it gracefully, perhaps by logging the problem or attempting a retry. Each of these functions gives you more control and insight into how your agent tools are working.

## Interface IAgentTool

This interface describes a tool that an AI agent can use, building upon a more general tool definition. Each tool has a name for identification and an optional description to help users understand how to use it.

Before a tool runs, a validation step confirms whether the provided input is correct, which can happen immediately or after a short delay.

You can also customize a tool's behavior by providing optional lifecycle callbacks that run at different points during its execution.

Finally, the `call` method is how the tool actually runs, taking parameters, context information, and a signal to handle potential interruptions.

## Interface IAgentSchemaCallbacks

This interface lets you hook into different moments in an agent's lifecycle. You can set up functions to be called when an agent starts running, when a tool generates output, or when the agent produces a message – essentially giving you a way to observe and react to what's happening with each agent. There are also callbacks for less common events, like when an agent is reset or brought back online after a pause, or when its history is cleared. It provides fine-grained control and visibility into agent behavior.

## Interface IAgentSchema

This interface defines the blueprint for how each individual agent within the AI swarm operates. Think of it as a set of instructions that tells the agent what it's called, what tools it can use, and how it should behave.

You can give each agent a unique name and a descriptive explanation for documentation purposes. It specifies a primary prompt that guides the agent’s actions, and also allows for optional system prompts to manage things like tool usage protocols.

The agent can be configured with lists of tools, storage options, and dependencies on other agents. There are also functions that allow you to control the agent’s tool calls, validate its output, and even transform messages before they are processed. For agents that handle operator interactions, a special connection function is available for transferring chat sessions to an operator dashboard. Lastly, lifecycle callbacks provide a flexible way to customize the agent's execution.

## Interface IAgentParams

This interface defines the information needed to run an individual agent within the AI agent swarm. Think of it as a set of instructions and resources given to each agent when it's starting up. 

It includes things like a unique client ID to identify who’s using the agent, a logger for recording what the agent does, and a communication bus for interacting with other agents in the swarm. 

The agent also gets a way to call external tools (via the `mcp` property), access a history of its interactions, and generate responses (`completion`). Optionally, a list of available tools can be provided.  Finally, there's a validation step that allows you to check the agent's output before it's considered finished.

## Interface IAgentConnectionService

This interface helps us clearly define how different agents connect and communicate within the swarm. It's a blueprint for building services that manage these connections, ensuring that only the necessary, public-facing parts are exposed. Think of it as a standardized way to build agent connection managers, keeping things organized and predictable for anyone interacting with the system. It makes sure the core workings stay hidden while providing a consistent way to connect agents.

## Interface IAgent

This interface describes how you interact with an individual agent within the swarm. Think of it as a blueprint for how an agent behaves and responds.

You can use the `run` method to quickly test an agent with a given input without affecting its memory or past conversations. `execute` is used to make the agent actually process information, potentially changing its internal state. The `waitForOutput` method lets you retrieve the result after the agent has finished its work.

There are also methods to manage the agent's "memory" or history. `commitToolOutput` and `commitSystemMessage` allow you to add information that the agent will consider in future interactions. `commitUserMessage`, `commitAssistantMessage`, and `commitAgentChange` offer finer-grained control over the flow and state of the conversation. Finally, `commitFlush` lets you completely reset the agent to a fresh start, and `commitStopTools` allows you to halt ongoing tool execution.
