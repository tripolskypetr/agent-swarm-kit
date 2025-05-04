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

This service helps you manage and check the structure of your wikis. Think of it as a quality control system for your knowledge base. 

You start by telling the service about the wikis you’re tracking, defining their expected formats. The `addWiki` method lets you register a new wiki and its structure. 

Then, when you have content you want to ensure fits that structure, you use the `validate` method to check it against the defined schema. Essentially, it's a way to make sure your wikis are well-formed and consistent.

## Class WikiSchemaService

This service manages and provides access to wiki schema definitions. Think of it as a central repository for the blueprints that dictate how a wiki should be structured.

It allows you to register new schema blueprints, update existing ones, and easily retrieve them when needed. The service keeps track of these schemas and provides a way to log events related to their management. 

You can register schemas with unique keys, providing a simple way to identify and access specific schema definitions. It also offers a method to update parts of an existing schema without replacing the entire thing. Finally, when you need a particular schema, you can simply request it by its key.

## Class ToolValidationService

This service helps ensure that the tools used by your AI agents are properly configured and exist within the system. It keeps track of all registered tools and their details, making sure there are no duplicates. 

When a new tool is added, this service logs it and verifies it's unique.  The `validate` function quickly checks if a tool exists, which is useful when agents are trying to use them – it avoids errors by confirming the tool is actually registered. It’s designed to work closely with other services to keep everything running smoothly and efficiently.

## Class ToolSchemaService

This service acts as a central hub for managing the blueprints of tools used by agents within the system. Think of it as a library where each tool's definition – how it works, what it expects – is carefully stored and checked.

When a new tool is added or an existing one is updated, this service ensures it's structurally sound before making it available to the rest of the swarm. It works closely with other services, like the agent connection and schema services, to keep everything synchronized.  Essentially, it's a foundational component that makes sure agents have access to reliable and well-defined tools to carry out their tasks. It also keeps a log of changes for monitoring purposes.

## Class ToolAbortController

The ToolAbortController is a helpful tool for controlling asynchronous tasks and ensuring they can be stopped if needed. It manages an `AbortController` behind the scenes, giving you access to its signal and allowing you to trigger an abort event. 

Think of it as a way to politely tell a running process to stop what it's doing. If your environment doesn't support `AbortController` natively, this class gracefully handles that too, preventing errors.

The `abort` method is how you actually tell the process to stop, and it's straightforward to use.

## Class SwarmValidationService

This service acts as a central authority for ensuring the configurations of your AI agent swarms are correct and consistent. It keeps track of all registered swarms and their settings, making sure each swarm has a unique name and valid agent and policy lists.

You can use it to add new swarms, retrieve lists of agents and policies associated with specific swarms, and to verify that a swarm's setup is sound. The system remembers past validation results to speed things up, and it relies on other specialized services to handle agent and policy validation, swarm registration, and more. Essentially, it's here to help maintain the health and integrity of your entire swarm system.

## Class SwarmSchemaService

This service acts as a central place to store and manage the blueprints for your AI agent swarms. Think of it as a library where you define what each swarm is made of – the agents involved, their roles, and any rules they should follow.

It makes sure these blueprints are reasonably well-formed before they're used, checking for things like ensuring that agent and policy names are valid.  The service uses a structured registry to organize these blueprints and makes it easy to look them up when needed. 

You can register new swarm blueprints, update existing ones, and retrieve them to configure different parts of your system, from setting up new swarms to linking them to agents and policies.  The service keeps track of these operations with logging to help with debugging and monitoring.

## Class SwarmPublicService

This class acts as a central point for interacting with a swarm of agents, providing a public interface for various operations. Think of it as a facilitator, handling requests like sending messages, controlling output, and managing agents within the swarm. It ensures these actions are properly tracked and scoped to a specific client and swarm, using logging for transparency.

Here's a breakdown of what it offers:

*   **Sending Messages:** It allows you to broadcast messages to the swarm for a specific client.
*   **Navigation:** You can manage the flow of agents within the swarm, popping elements from the navigation stack.
*   **Output Control:** It allows canceling or waiting for output from the swarm, useful for interrupting or retrieving results from agent processes.
*   **Agent Management:** You can retrieve agent details, set the currently active agent, or even dispose of the entire swarm, cleaning up resources when finished.

Essentially, it's a layer of abstraction that makes working with the swarm more structured and manageable, handling the underlying complexities and ensuring everything is done in a controlled and traceable manner.

## Class SwarmMetaService

This service acts as a central hub for understanding and documenting the structure of your AI agent swarms. It takes information about your swarms – their schemas, agents, and relationships – and transforms it into a visual representation using UML diagrams.

Think of it as a translator that converts complex swarm definitions into an easy-to-understand blueprint. It works closely with other services to gather the necessary data and generate these diagrams, ensuring consistency across your system.

Specifically, it builds a hierarchical view of your swarms, including details about the default agent within each swarm. This allows for clear documentation, better debugging, and a more intuitive grasp of how your AI agents are organized and interact. The process is logged to help trace operations and identify potential issues.

## Class SwarmConnectionService

This service manages connections and operations within a swarm of AI agents, essentially acting as the central hub for working with swarms. It cleverly reuses swarm instances to make things faster and more efficient.

It relies on other services to handle logging, event management, agent interactions, schema configuration, and persistent storage, ensuring everything works together seamlessly.

Here's a breakdown of what you can do with it:

*   **Get a Swarm:** Easily retrieve or create a connection to a specific swarm, automatically managing its configuration and agents.
*   **Send Messages:** Broadcast messages to a session connected to the swarm, useful for asynchronous communication.
*   **Navigate the Swarm:** Pop elements off a navigation stack to move between different agents.
*   **Control Output:** Cancel any pending output from the swarm.
*   **Retrieve Output:** Wait for and get the output from a running agent within the swarm.
*   **Inspect the Swarm:** Find out the name of the active agent, or get the agent itself.
*   **Manage Agents:** Add or update agents within the swarm.
*   **Change Agents:** Set the currently active agent.
*   **Clean Up:** Dispose of a swarm connection when you're done.

## Class StorageValidationService

This service helps keep track of all the storage systems your AI agents are using, making sure they are correctly set up and working as expected. It acts like a central registry for storage configurations, guaranteeing that each storage system is unique and has valid settings.

You can use it to register new storage systems, and it handles ensuring that no two systems have the same name. When you need to verify a specific storage system, it performs checks to confirm it exists and that its embedding details are correct. The system remembers previous validation results to speed up future checks. It relies on other services to handle logging, embedding validation, and storage operations, making sure everything works together smoothly.

## Class StorageUtils

This class helps manage how data is stored and accessed for different clients and agents within the swarm. It provides a set of tools to retrieve, add, update, and delete data, ensuring that only authorized agents can access the right storage areas.

You can use methods like `take` to fetch a specific number of items matching a search term, or `upsert` to add new data or update existing entries.  If you need to remove data, `remove` is available. `get` retrieves a single item, while `list` provides a way to view all items within a storage area, optionally filtering them.

To help with organizing and searching through larger datasets, `createNumericIndex` allows you to create an index for quicker lookups. Finally, `clear` provides a way to completely empty a storage area. Each operation verifies that the client and agent have permission to access the specified storage.

## Class StorageSchemaService

This service manages how different parts of the system know about and use storage configurations. Think of it as a central address book for storage setups. It makes sure these setups are valid and accessible, primarily using a system similar to a toolkit for managing tools.

It keeps track of storage schemas – definitions that describe how data is stored and accessed – and provides ways to register new schemas, update existing ones, and retrieve them when needed. Each schema is checked for basic correctness before being added.

This service works closely with other parts of the system like those handling connections to storage, embedding definitions, agent configurations, and the public API, ensuring consistent and reliable storage usage across the whole swarm. Logging is used to keep track of changes to these schemas, allowing for troubleshooting and auditing.

## Class StoragePublicService

This service manages storage specifically for each client, ensuring data is kept separate and secure. It's like having individual filing cabinets for each user within the system. 

It works by delegating the actual storage operations to another service, but adds extra features like logging and context awareness to track what's happening and who's accessing the data. Different parts of the system, like the client agent and performance tracking, use this service to store and retrieve information related to individual clients.

You can use it to perform common storage actions like retrieving, adding, updating, removing, listing, and completely clearing data—all while ensuring the operations are tied to a specific client. It differs from system-wide storage by keeping each client's data isolated within their own storage area. 

The service relies on injected dependencies for logging and underlying storage functionality, and uses logging to track activity when enabled.

## Class StorageConnectionService

This class manages how your AI agents store and access data within the swarm system. Think of it as a central hub for data storage, handling both storage specific to individual agents and shared storage used across the swarm.

It intelligently reuses storage connections to optimize performance, caching data behind the scenes. When an agent needs to store information, this service figures out where it should go and makes sure the data is properly handled, incorporating configurations and sometimes embedding data for similarity searches.

Here’s a breakdown of what it does:

*   **Provides Storage Access:** It retrieves or creates storage areas for agents, making sure they have the right configuration and access.
*   **Handles Different Storage Types:**  It manages storage that’s unique to an individual agent and also deals with shared storage used by multiple agents.
*   **Optimizes Performance:** It caches storage connections to avoid repeatedly setting them up, making things faster.
*   **Provides Common Operations:** It offers standard operations like adding data, retrieving data, deleting data, and clearing the entire storage.
*   **Cleans Up Resources:** When needed, it gracefully closes storage connections and releases resources.


## Class StateValidationService

This service helps manage and verify the structure of data representing the state of your AI agents. Think of it as a quality control system for your agent's information.

You can use it to define what a valid state looks like for each agent, specifying the expected data types and structure. The `addState` method lets you register these state definitions. 

When you need to ensure a piece of data conforms to a registered state, you can use the `validate` method, which checks it against the defined schema and helps you catch errors early. The service also includes logging capabilities to help you track validation issues. It keeps track of the defined states internally in a map.

## Class StateUtils

This class helps you manage specific pieces of information for each client and agent within the swarm. Think of it as a tool for keeping track of what each agent knows about each client.

You can use it to retrieve existing data, update it with new values (either directly or by building upon what’s already there), and completely reset the data back to its original state.

Before it does anything, the class makes sure the client is still active and that the agent is authorized to work with that specific piece of data. Every action is also logged for tracking purposes.

## Class StateSchemaService

This service acts as a central place to manage the blueprints for how different parts of the swarm system handle and store data – these blueprints are called state schemas. It keeps track of these schemas, making sure they're consistent and valid.

Think of it as a librarian organizing and verifying the rules for accessing information. When a new rule (schema) is added or an existing one is changed, this service ensures it's properly formatted and acceptable.

It works closely with other services, such as those responsible for connecting to states, defining agents, and providing public access to state information. When a new piece of state configuration is needed, this service provides the validated blueprint.



It uses logging to keep track of what's happening with these schemas, allowing you to monitor and debug issues. The underlying system uses a reliable registry to efficiently store and retrieve these state blueprints.

## Class StatePublicService

This service manages state specifically for each client interacting with the swarm system. Think of it as a way to keep track of information unique to each user or application. It's different from system-wide state and persistent storage because it focuses on what's relevant to a single client at a time.

It provides methods for setting, clearing, retrieving, and cleaning up this client-specific state. These methods are carefully wrapped to include context information and logging, and they work closely with other parts of the system, such as the ClientAgent and PerfService, to ensure smooth operation. The service uses a logger to track activity when logging is enabled, allowing for monitoring and debugging.

## Class StateConnectionService

This service is responsible for managing how your agents store and access data, particularly state information. Think of it as a central hub for client-specific data, making sure the data is used efficiently and securely.

It intelligently caches frequently used data to avoid unnecessary loading, ensuring fast performance. When data needs to be updated or accessed, it handles the process, working closely with other parts of the system to track usage, apply configurations, and ensure updates are safe for multiple agents.

The service also distinguishes between data that’s specific to a single client versus data that’s shared across multiple clients, delegating the management of shared data to a separate system. When you're finished with a particular state, the service cleans up resources to maintain efficient operation.

## Class SharedStorageUtils

This class provides tools to interact with the shared storage used by your AI agent swarm. Think of it as a central hub for managing data accessible to all agents.

You can use it to fetch data that matches a specific search, add new information or update existing records, and delete items you no longer need. It also allows you to retrieve individual items by their unique ID, list all items in a storage area, and completely empty a storage area if necessary. Each action performed through this class is carefully checked and logged to ensure proper operation and data integrity.

## Class SharedStoragePublicService

This service manages access to shared storage within the swarm system, acting as a public interface for different agents to interact with it. It handles operations like retrieving, adding, updating, and deleting data, ensuring everything is tracked and logged for auditing and performance monitoring.

Essentially, it’s a controlled way for different parts of the system to store and retrieve information, simplifying the process while maintaining accountability and efficiency. Think of it as a central repository that agents can use, with built-in checks and records of who's doing what.

Here’s a breakdown of what it lets you do:

*   **Retrieve data:** Search for and get specific items or lists of items from storage.
*   **Add or update data:** Insert new items or modify existing ones.
*   **Delete data:** Remove items from storage.
*   **Clear storage:** Completely empty a storage area.

The service keeps track of these actions and logs them, especially when enabled, ensuring transparency and aiding in troubleshooting. It works closely with other system components like ClientAgent, PerfService, and DocService to provide a seamless and integrated experience.

## Class SharedStorageConnectionService

This service is responsible for managing shared storage within the system, acting as a central point for accessing and manipulating data across different clients. It ensures that all clients work with the same storage instance, preventing conflicts and promoting consistency.

Think of it like a shared whiteboard that everyone in the system can read and write on – this service manages that whiteboard.

It relies on other services to handle things like logging, event handling, and schema management, making sure everything works together smoothly.  The `getStorage` method is key, as it’s how you actually get access to a specific shared storage area.  You're caching these areas so you don't have to recreate them repeatedly.

The `take`, `upsert`, `remove`, `get`, `list`, and `clear` methods provide standard storage operations, mirroring functionality found elsewhere in the system. These methods are essentially how you read, write, and delete data on that shared whiteboard.

## Class SharedStateUtils

This utility class helps coordinate and manage shared information across your AI agents. Think of it as a central whiteboard where agents can leave notes and update each other.

You can use it to fetch existing data, set new data—either directly or by calculating it based on what's already there—and even clear the board completely for a particular piece of information. Each action is carefully tracked, making it easy to understand how the shared state is changing over time. It simplifies interacting with the underlying shared state service.

## Class SharedStatePublicService

This service provides a way to manage shared data across your AI agent swarm. Think of it as a central place where agents can access and update common information. It handles setting, clearing, and retrieving this shared state, and it's designed to work smoothly with other parts of the system like agent execution and performance tracking. 

It uses a logging system to keep track of changes, and it’s built to be flexible, working with different types of data. The service relies on other services for underlying operations and for adding context around those operations, making sure everything is tracked and managed correctly. It’s essentially the backbone for agents to share and coordinate their actions.


## Class SharedStateConnectionService

This service manages shared data used across different parts of the system. Think of it as a central place where agents can access and update information that needs to be consistent across them.

It's designed to be efficient; it remembers previously created data instances to avoid recreating them repeatedly.  All changes to the shared data are handled in a controlled way to prevent conflicts when multiple agents try to update it at the same time.

The service relies on other components – like logging, event handling, and configuration management – to ensure it operates correctly and provides helpful feedback. You can get, set, and clear the shared data using methods provided by this service. These methods work similarly to how you’d interact with shared data through a public API.

## Class SharedComputeUtils

This utility class, `SharedComputeUtils`, helps you manage and interact with shared compute resources within the agent swarm. Think of it as a central point for getting information about and updating the status of these shared resources. 

The `update` method lets you refresh the details of a specific compute resource, ensuring your agents have the most current information. 

You can use the `getComputeData` method to retrieve data about a particular compute resource, like its available memory or processing power. It's flexible; you can specify the type of data you expect to receive, making it easy to integrate into your agents' workflows.

## Class SharedComputePublicService

This service acts as a central hub for managing and interacting with shared computational resources within your AI agent swarm. It provides a way to access and control the execution of computations across different agents. 

Think of it as a messenger – you tell it what calculation to run (using `calculate`), request data about a specific computation (`getComputeData`), or ask it to update the state of a shared resource (`update`).  It then handles the underlying communication and coordination with the agents that are actually performing the work.  The `loggerService` allows for monitoring and debugging, while `sharedComputeConnectionService` manages the connections to the individual compute resources.

## Class SharedComputeConnectionService

This class helps your AI agents coordinate and share resources. Think of it as a central hub that manages connections to shared computing environments. 

It uses logging and messaging systems to keep everything organized. The service has a memory feature, so it remembers where your agents are accessing computing resources, making things efficient.

You can use methods like `calculate` and `update` to trigger actions within the shared environment. `getComputeRef` lets you grab references to specific computing resources, and `getComputeData` allows you to retrieve data from them. Essentially, this class simplifies how your agents interact with and utilize shared computing power.

## Class SessionValidationService

The `SessionValidationService` keeps track of how sessions are used within the AI agent swarm system. It ensures that sessions are properly associated with swarms, modes, agents, histories, storage, states, and computes, making sure everything is consistent and resources are used correctly. 

It works closely with other services like the session manager, agent, storage, state and swarm services, and uses logging to keep track of what's happening.

Key functions include registering new sessions (`addSession`), tracking which agents, histories, storages, states and computes are used within each session (`addAgentUsage`, `addStorageUsage` etc.), and removing those associations when they’re no longer needed. You can check if a session exists (`hasSession`), retrieve its mode or swarm, or get lists of associated agents and resources. The service also has a validation function that's optimized for speed, and provides ways to clean up session data and clear validation caches.  Essentially, it’s a central hub for managing and verifying session activity within the swarm.


## Class SessionPublicService

This service acts as a public gateway for interacting with individual sessions within the swarm system. Think of it as a simplified way to send messages, run commands, and manage sessions without dealing with the underlying complexities.

It handles common operations like sending messages (`emit`, `notify`), running commands (`execute`, `run`), and committing various message types (user messages, assistant responses, system messages).  It also provides methods for managing sessions, such as connecting, flushing, stopping tools, and disposing them.

The service carefully tracks performance and logs activities, and ensures proper scoping and context for each operation, making it a central point for controlled interaction with individual sessions. It seamlessly integrates with other components like performance tracking, event buses, and logging systems. The `connect` method establishes a two-way communication channel with a session and tracks timing details. The `navigationValidationService` prevents infinite recursion.


## Class SessionConnectionService

This service manages connections and actions within a swarm system, acting as a central hub for sessions. It efficiently reuses session data thanks to caching, reducing overhead. Think of it as a traffic controller for agent activity – it handles messages, execution requests, and policy enforcement, all within the context of a client and swarm.

It’s integrated with several other services, like those that handle agent execution, public APIs, policies, and performance tracking. When debugging is enabled, it keeps a log of the actions it's taking.

Here's a breakdown of what it does:

*   **Session Management:** It creates or retrieves existing "session" environments to handle client requests and agent executions.
*   **Messaging:** It allows sending and receiving messages within a session, enabling communication between agents and external systems.
*   **Execution:** It executes commands or runs stateless tasks within a session.
*   **Policy Enforcement:**  It ensures that all actions comply with predefined policies.
*   **Connection Handling:**  It establishes and manages connections for two-way communication.
*   **History Tracking:** It commits various message types (user input, tool output, system updates, etc.) to the session history for later review and analysis.
*   **Cleanup:** It properly closes connections and releases resources when a session is no longer needed.

## Class SchemaUtils

This class offers helpful tools for managing how data is stored and formatted within the agent swarm's sessions. It lets you easily write information to a client's session memory, retrieve that information later, and convert objects into nicely formatted strings. Think of it as a central place to handle the behind-the-scenes work of keeping track of session data and preparing it for communication.

Specifically, you can use it to save data associated with each client, safely retrieve that data when needed, and create formatted strings from your data, which is useful for things like logging or sending information to other systems. You can also customize how those strings are created with optional mapping functions.

## Class RoundRobin

This component, RoundRobin, helps distribute tasks evenly among a set of creators. Think of it as a rotating manager – it cycles through a list of creators (defined by "tokens") to ensure no single creator is overloaded.

The RoundRobin keeps track of which creator it's currently using, and it logs this information for debugging purposes.

You can easily create a RoundRobin function, providing it with a list of creators and a function that knows how to build an instance based on a given token. This allows you to distribute work in a predictable and balanced way.


## Class PolicyValidationService

This service helps ensure that policies used within the agent swarm are valid and correctly registered. It keeps track of all registered policies and their details.

When a new policy is added, this service registers it and makes sure there aren’t any duplicates. 

The validation process checks if a policy exists before it’s used, making sure things run smoothly and efficiently. It also uses logging to keep track of what’s happening and makes validation faster by remembering previous checks. The service works with other parts of the system like the policy registration and enforcement components.

## Class PolicyUtils

This class provides helpful tools for managing client bans across your AI agent swarms. It simplifies the process of banning, unbanning, and checking the ban status of clients, ensuring everything is done securely and with proper tracking. Each method carefully verifies the information provided before interacting with the underlying policy system, helping to prevent errors and maintain a clear audit trail. You can use it to easily control which clients are allowed to interact with your swarms based on specific policies.

## Class PolicySchemaService

This service acts as a central hub for managing the rules that govern your AI agent swarm. It’s responsible for storing and providing access to these rules, ensuring they’re consistent and valid.

Think of it as a library of policy definitions – each definition dictates how agents should behave and who they should interact with. When a new rule is created or an existing one needs to be updated, this service handles the process.

It works closely with other parts of the system – it provides the rules that enforce access control, guides agent behavior during execution, and helps manage user sessions. The system keeps track of these changes and logs them for monitoring purposes, especially when debugging or auditing. It ensures that policies are checked for basic correctness before they're put into action.

## Class PolicyPublicService

This service manages how policies are enforced within the swarm system, acting as a central point for interacting with and managing those policies. It provides a public-facing API to check if a client is banned, retrieve ban messages, validate input and output data, and even ban or unban clients. The service is designed to work closely with other components like the logging system, performance tracking, client agents, and documentation services. Importantly, it uses a consistent logging approach for transparency and debugging, and it's integrated with context management to ensure operations are properly scoped.

## Class PolicyConnectionService

This service manages how policies are applied to clients within a swarm system. Think of it as the central point for enforcing rules and tracking client status. It caches policy information to ensure quick access and avoids unnecessary reloads. 

It provides several key functions:

*   **Retrieves Policies:** It fetches and caches policies based on their names.
*   **Checks for Bans:** It determines if a client is currently banned in a specific swarm.
*   **Provides Ban Messages:** If a client is banned, it can retrieve the reason.
*   **Validates Input & Output:**  It checks if data coming into or going out of a client complies with the active policy.
*   **Manages Bans:** It allows for banning and unbanning clients from a swarm, adhering to the defined policy.

Essentially, this service ensures consistent policy enforcement across different parts of the system, including agents, sessions, and public APIs. It leverages other services like logging, event handling, and schema management to operate efficiently and provide useful information.

## Class PersistSwarmUtils

This utility class helps manage how your AI agent swarms remember important information, like which agent is currently active for a user and the sequence of agents they're used. Think of it as a memory system for your swarm.

It allows you to define how this information is stored – you can use the default method, or plug in your own custom storage solutions.

You can easily retrieve the active agent assigned to a specific user and swarm, or set a new one, and the system remembers it for later. Similarly, it keeps track of the order agents are used, creating a navigation "stack" which is readily available.

If you need even more control, you can provide your own "adapters" to customize exactly how the active agents and navigation history are persisted.

## Class PersistStorageUtils

This class provides tools to manage how data is saved and retrieved for each client and storage name within the swarm system. It allows you to easily get and set data, ensuring that each storage name utilizes only one persistence instance for efficiency. You can think of it as a way to store and access information like user records or logs, making sure it's available later.

A key feature is the ability to customize how data is persisted, allowing for advanced options like using a database instead of the default method. This gives you flexibility in how you store your data.

## Class PersistStateUtils

This utility class helps manage how information is saved and retrieved for each client participating in the swarm. Think of it as a way to remember things like agent variables or context for each individual session.

It ensures that information is saved consistently and efficiently by using a single storage mechanism for each type of data.

You can also customize how the information is actually stored, allowing for different storage solutions like using an in-memory cache or a database.

The class provides simple methods to get and set this information, falling back to default values if something hasn’t been saved yet. Essentially, it allows the system to remember and restore important data for each client.

## Class PersistPolicyUtils

This class provides tools to handle how policy data, specifically lists of banned clients, is saved and retrieved for your AI agent swarms. It helps you keep track of which clients are restricted from participating.

The system remembers these restrictions so you don't have to re-apply them every time. It uses a clever system to ensure only one storage instance is used per swarm, saving resources.

You can easily check if a client is banned using `getBannedClients`, and manage the list of banned clients using `setBannedClients`. 

For advanced setups, `usePersistPolicyAdapter` allows you to customize *how* this data is stored – whether it's in memory, a database, or somewhere else entirely.

## Class PersistMemoryUtils

This utility class helps manage how memory is saved and retrieved for each individual client interacting with the swarm system. It acts like a central hub, using a persistence adapter you can customize to store data for each client’s session.

Think of it as a way to keep track of a client’s context – their temporary information – so the swarm can remember things like their preferences or progress.

The class uses a clever trick to avoid creating too many storage instances, ensuring efficient resource usage.  You can even swap out the default storage mechanism with your own custom implementation to connect to a database or use a different persistence strategy.  When a client’s session is over, you can explicitly clear their memory to free up resources.

## Class PersistEmbeddingUtils

This class helps manage how embedding data is saved and retrieved within the swarm system. It provides a way to store embedding vectors, so the system doesn’t have to recalculate them every time they’s needed. 

The system uses a "memoized" function to ensure each embedding has its own storage instance, which is efficient. You can check if an embedding has already been calculated and stored, or save a newly computed embedding for later use.

Furthermore, this class lets you customize how the embedding data is actually persisted—whether it's in memory, a database, or somewhere else—giving you flexibility in how your swarm handles data storage.

## Class PersistAliveUtils

This class helps keep track of which clients are currently online and available within your swarm system. It allows you to easily mark clients as online or offline, and then check their status later on. Think of it as a simple way to manage client availability.

It uses a system where each client gets its own storage for its online status, preventing unnecessary resource usage. You can also customize how this online status is stored and managed if you need something beyond the default behavior, like using a database instead of a simple file. This allows for more advanced tracking and management of client availability.

## Class PerfService

The `PerfService` class is responsible for tracking and logging how long client sessions take to execute tasks within the system. It acts as a performance monitoring system, gathering data on execution times, input/output sizes, and session states. Think of it as a detective, collecting clues (performance data) about what's happening within the swarm.

It works closely with other services—like those handling session validation, memory, and swarm status—to get all the information it needs.  It injects these dependencies, so it’s flexible and can adapt to changes.

The service lets you start tracking an execution, mark it as finished, and then generates reports with overall performance metrics or individual client details. If you'd like, it can also be cleaned up when a session ends, ensuring resources are released.  Logging is controlled by a system setting, so you can enable or disable the extra detail.

## Class OperatorInstance

This class represents a single instance of an operator within an AI agent swarm. Think of it as a specific agent performing a task.

Each instance is identified by a client ID and an agent name, and it can be configured with callback functions to handle events.

You can connect to receive answers from the agent, send notifications to it, and also send direct answers or messages. 

Finally, when the agent is no longer needed, you can dispose of the instance to release its resources.

## Class NavigationValidationService

This service helps manage how agents move around within the swarm, preventing them from going to the same place repeatedly. It keeps track of which agents have already been visited for each client and swarm.

You can use it to check if an agent should be navigated to; the system will remember previously visited agents. The service also offers a way to reset the navigation tracking for a specific client and swarm. Finally, it lets you completely remove the tracking information when it's no longer needed. This whole system is designed to make navigation more efficient and provides logging to help understand what's happening.

## Class MemorySchemaService

This service acts like a temporary scratchpad for data associated with each active session in the swarm. Think of it as a way to store bits of information that are specific to a single session, such as temporary settings or results of a calculation. It's designed to be simple and fast, storing data in memory and discarding it when the session ends.

You can use this to write data associated with a session, read data back, or completely clear that session's data when it’s no longer needed.  It's a lightweight way to manage session-specific information without the complexity of permanent storage.  The system keeps track of what's happening with logging, but only when that feature is turned on. It's often used in conjunction with other services handling sessions and agent communication.

## Class MCPValidationService

This class helps keep track of and check the format of Model Context Protocols, or MCPs. Think of it as a librarian for your MCP definitions, ensuring they're all in order. 

It uses an internal record to store these MCP schemas, organized by name. You can use the `addMCP` function to register a new MCP schema.  The `validate` function then lets you check if a particular MCP schema exists and is correctly formatted. A logging service is used to track what's happening during these operations.

## Class MCPUtils

This class, MCPUtils, helps manage updates to the tools used by clients participating in the Multi-Client Protocol. Think of it as a tool updater for your system. You can use it to refresh the tools available to every client, or target a specific client to update just their tools. It simplifies keeping everyone's tools current.

## Class MCPSchemaService

This service helps keep track of the blueprints – we call them MCP schemas – that guide how AI agents work together. It lets you add new blueprints, update existing ones, and easily find the blueprint you need. Think of it as a central place to define and manage the rules and structure for your AI agent swarm. The service uses a logger to keep track of what's happening and stores all the schemas in a registry. You can register a brand new schema, modify an existing one by providing just the changes you want to make, or simply fetch a schema by name when you need it.

## Class MCPPublicService

This class helps you manage and use tools within a larger system that uses the Model Context Protocol (MCP). Think of it as a central hub for interacting with those tools.

It lets you see what tools are available, check if a specific tool exists, and then actually run those tools, providing the necessary inputs. You can update tool lists for everyone using the system or for individual clients.

The class relies on other services for logging and handling the underlying MCP communication, so it doesn't worry about those details directly. It's designed to clean up resources when you're finished with a tool, making sure things are properly released.

## Class MCPConnectionService

This service manages connections and interactions with Model Context Protocols (MCPs), acting as a central point for your AI agents to access and use tools. It handles everything from retrieving available tools to actually running them.

Think of it as a toolbox manager: it keeps track of which tools are available to which agents, fetches them when needed, and makes sure they can be used correctly. It automatically remembers previously fetched tools to speed things up, and can update the list of tools for individual agents or for all of them. You can check if a tool exists before trying to use it, and this service handles the actual process of calling a tool with the necessary information. It also provides a way to clean up resources when an agent is finished.

## Class LoggerService

This class provides a central way to record events and data within the system, offering different levels of detail like general logs, debugging information, and informational messages. It intelligently includes context – like the client involved and the specific function being executed – to make it easier to understand what's happening. 

The system can use a dedicated logger for each client and also a central logger for system-wide tracking, and this can be changed on the fly, providing flexibility for things like testing or specialized setups.  You can control how much detail is recorded through configuration settings, enabling or disabling different logging levels. The class integrates with other parts of the system, like those responsible for performance monitoring and documentation, to ensure consistent and informative logging.

## Class LoggerInstance

This class helps manage logging for individual clients, giving you control over where messages go and how they're handled. When you create a `LoggerInstance`, you specify a unique client ID and optionally provide callback functions to customize its behavior. 

You can log messages at different levels – general logs, debug information, or informational messages – and these can be sent to the console (if enabled globally) or processed by your custom callbacks. 

The `waitForInit` method ensures the logger is properly set up, and the `dispose` method allows for a clean shutdown, triggering any final cleanup functions you’re using. This whole system is designed to give you flexible and controlled logging within your agent swarm orchestration.

## Class HistoryPublicService

This service manages how history information is accessed and handled within the swarm system, providing a public way to interact with it. It's designed to work closely with other services like those managing agents, performance, and documentation, ensuring consistency in how history is recorded and used.

The core functions allow you to add messages to an agent's history, retrieve the most recent message, convert the history into different array formats (either customized for agent processing or in a raw format), and clean up the history when it's no longer needed. Each of these operations is carefully managed to maintain context and to log activity when logging is enabled. Essentially, it's the go-to place for dealing with an agent's historical record.

## Class HistoryPersistInstance

This component handles keeping a record of messages, saving them both in memory and on disk so you don't lose them. Each instance is tied to a specific client ID and lets you define custom callbacks to handle different events.

It initializes itself when needed, loading any previously saved data. You can loop through the messages in the history, applying any filtering rules or system prompts you've set up.  When a new message arrives, it's added to the history and saved for later, and you can configure how those additions are handled.  Similarly, you can remove messages from the end of the history, with custom actions triggered by that removal. Finally, you can completely clear the history, either for a specific agent or for all agents.

## Class HistoryMemoryInstance

This class provides a simple way to keep track of a conversation or interaction within your AI agents, storing the messages directly in memory without saving them anywhere permanently. Each instance is tied to a specific client ID, and you can customize how it behaves by providing callback functions for actions like adding new messages, removing old ones, or when the history is cleared.

To get started, you create an instance of this class, and it's ready to record messages. You can add messages using the `push` method, remove the last message with `pop`, and iterate through the history using `iterate`. The `waitForInit` method ensures the history is properly set up for each agent, and `dispose` cleans everything up when you're done, optionally clearing the entire history if needed.

## Class HistoryConnectionService

This service manages the history of interactions with each agent within your swarm system. Think of it as a record of what's been said and done. It's designed to be efficient, reusing history data whenever possible to avoid unnecessary work.

Here's a breakdown of what it does:

*   **Keeps track of agent history:**  It creates and manages a "history" for each client and agent, storing messages and actions.
*   **Efficient data reuse:** It remembers these histories, so it doesn's have to recreate them every time.
*   **Provides core operations:** You can retrieve history, add new messages, remove the latest message, and get the history in different formats for different purposes (like feeding it to an agent for its next action).
*   **Integrates with other services:** It works closely with other components of the system, such as services for logging, tracking usage, and managing sessions.
*   **Clean up:** When it's finished, it cleans up the resources and removes the history from its memory.

## Class EmbeddingValidationService

This service helps ensure that the names of your embeddings are correct and consistent throughout the swarm system. It keeps track of all registered embeddings, preventing duplicates and confirming they actually exist when needed. 

Think of it as a registry for your embeddings, working closely with other services that manage embedding registration, usage, and agent validation. It’s designed to be efficient, remembering previous validation checks to speed things up. 

You can add new embeddings to the registry, and the service will validate their existence whenever you need to confirm they are valid, especially when performing searches. The service also keeps a log of its actions, which is helpful for troubleshooting.

## Class EmbeddingSchemaService

The EmbeddingSchemaService acts as a central place to manage how data is represented and compared within the system. It’s responsible for storing and providing access to these "embedding schemas," which define how data is converted into a format suitable for similarity searches and other operations.

Think of it as a library of instructions for turning data into a numerical representation – each instruction (schema) has a name and describes how to do it. This service makes sure those instructions are valid and accessible to other parts of the system that need them, like when searching for similar data or creating new data.

It performs simple checks to ensure the schemas are well-formed and keeps track of them using a specialized registry. The service also helps log important events related to managing these schemas, if logging is enabled, making it easier to understand how and when they's being used and updated. It's a foundational component for defining the logic used to find similar data within the swarm.

## Class DocService

This class helps automatically generate documentation for the system, including details about swarms, agents, and their performance. It simplifies understanding the system by creating well-organized Markdown files and JSON data files.

The `DocService` pulls information from various other services to build these documents, and uses logging to track its progress. It also manages multiple documentation tasks concurrently to speed up the process.

You can use `dumpDocs` to generate documentation for all swarms and agents, or use `dumpPerfomance` and `dumpClientPerfomance` to create reports on system performance. The generated documents and performance data provide valuable insights into the system’s structure and behavior.


## Class ComputeValidationService

The ComputeValidationService helps manage and validate different computations within your AI agent swarm. Think of it as a central hub for ensuring that each individual calculation or process is set up correctly. 

It keeps track of available computations and their expected formats. You can add new computations, listing their names and specifications, and then use the service to verify that a given source of data conforms to the expected structure for a particular computation. The service relies on other components like a logger and services for handling state and schema validation to accomplish its tasks.

## Class ComputeUtils

This utility class provides simple tools for managing and retrieving compute resources within your AI agent swarm. You can use it to register a compute resource, associating it with a specific client, through the `update` method.  This method lets you inform the system about a compute resource’s existence and its association with a client. 

The `getComputeData` method allows you to easily fetch information about a compute resource, returning the data in a type-safe manner. You can specify the expected data type when calling this method, ensuring you receive the information in the format you need.

## Class ComputeSchemaService

This service helps manage and organize the schemas used by your AI agents. Think of it like a central library where you define the structure of data your agents work with. 

You can register new schema definitions, essentially adding them to the library. If a schema already exists, you have the option to update parts of it, rather than replacing the entire definition. 

To use a schema, you retrieve it from the service using a unique key. The service also includes logging to help track what's happening and identify any issues.

## Class ComputePublicService

This class, `ComputePublicService`, acts as a central point for interacting with compute resources. It handles requests for data, triggers calculations, and manages updates and disposal of those resources. Think of it as a messenger, relaying instructions to and retrieving information from the underlying compute services. 

It relies on a logger for tracking activity and a compute connection service to actually manage the compute resources.  

The `getComputeData` method retrieves specific data based on a method name, client ID, and compute resource name. The `calculate` method initiates a calculation process. `update` applies changes to a compute resource, and `dispose` gracefully releases it when it's no longer needed. Each of these operations is tied to a method name, client ID, and compute resource name to ensure the right actions are taken on the correct resources.

## Class ComputeConnectionService

This class manages connections and data retrieval for computational tasks within the agent swarm. It acts as a central hub for accessing and coordinating different compute units, ensuring they work together effectively. 

It relies on several services like logging, messaging, context management, schema handling, session validation, and state connection to perform its functions. The `getComputeRef` method is key for obtaining references to specific compute units, while `getComputeData` retrieves the data associated with them.  `calculate` and `update` methods trigger processing based on state changes, and `dispose` cleans up resources when the connection is no longer needed. This class essentially provides a standardized way to interact with and orchestrate the computational processes within the system.

## Class CompletionValidationService

This service acts as a guardian for completion names used within the agent swarm. It keeps track of all the valid completion names, making sure no two are the same and preventing incorrect names from being used. 

It works closely with other parts of the system – ensuring completion names are properly registered, validating agent actions, and logging everything that happens. To speed things up, it remembers the results of previous validation checks. 

You can add new completion names to this service to keep the list of valid names up-to-date. When an agent tries to use a completion name, this service checks to make sure it’s a registered name, and logs the result of the check.

## Class CompletionSchemaService

The CompletionSchemaService acts as a central hub for managing the logic (completion functions) that agents use to perform tasks. It's like a library where agents can find the instructions they need.

This service keeps track of these instructions, ensuring they are valid and available to different parts of the system, such as when agents are created or when they’s running. It checks that the instructions are properly formatted before they're added to the library, and it allows you to update existing instructions.

The service logs its activities for monitoring purposes, and it’s designed to work closely with other core services in the swarm system, making sure agents can reliably execute their tasks using the correct logic. It uses a registry to store and quickly retrieve these instructions.

## Class ClientSwarm

This class, `ClientSwarm`, is like a conductor for a team of AI agents working together. It keeps track of which agent is currently active, manages how the agents switch between tasks, and handles the flow of information between them.

Think of it as a central hub:

*   **Agent Management:** It remembers which agents are available and manages when they are "active."
*   **Navigation:** It has a "navigation stack" – a record of how you're moving between agents to complete a task.
*   **Output Handling:** It waits for results from agents and delivers those results to whoever needs them. It also allows you to quickly cancel a pending result if needed.
*   **Communication:**  It sends out notifications whenever something changes—like when an agent is switched or a result is ready.

The class also integrates with other parts of the system like how the swarm is initially set up, how individual agents are executed, and how events are tracked and handled. When you're finished with the swarm, you can cleanly shut it down to release resources.

## Class ClientStorage

This class handles storing and retrieving data within the agent swarm system, particularly focusing on data that needs to be searched based on its meaning (embeddings). Think of it as a central repository for information that agents can access and compare.

It provides ways to add, remove, and clear data, and importantly, it can find data similar to a given search term. The operations are handled in a controlled order, ensuring everything happens smoothly and safely, even when multiple parts of the system are trying to interact with the storage at the same time.

When new data is added or existing data is modified, the system automatically calculates and stores “embeddings” – mathematical representations of the data's meaning – so that similar data can be easily found. It also keeps track of when the storage is fully initialized and provides ways to clean up when the storage is no longer needed.

## Class ClientSession

The `ClientSession` is like a dedicated workspace for a client interacting with an AI agent swarm. It manages all the messages, actions, and interactions happening within that specific session.

Think of it as a central hub that handles sending messages, validating them against pre-defined rules (ClientPolicy), and making sure the right AI agents are involved.  It also keeps track of what's happening, logging events and potentially sending notifications to other parts of the system.

Here's a breakdown of what you can do with it:

*   **Send Messages:** You can send messages to the swarm for processing (using `execute` or `run`). `execute` follows the rules and policy checks, while `run` is more for quick, stateless tasks.
*   **Log Actions:**  It lets you record user inputs, assistant responses, and system-level actions within the session’s history.
*   **Control the Agent:** You can tell the agent to stop its current process (`commitStopTools`) or clear its memory (`commitFlush`).
*   **Connect and Interact:**  It allows real-time communication between the client and the swarm, allowing messages to be sent and received.
*   **Clean Up:** When the session is finished, it can safely shut down, releasing any resources.



Essentially, `ClientSession` provides a structured and controlled environment for interacting with the AI agent swarm, ensuring consistency and traceability.

## Class ClientPolicy

The ClientPolicy class manages how clients interact with the swarm, focusing on security and ensuring everyone follows the rules. It keeps track of banned clients, performs checks on messages going in and out, and can automatically ban clients that violate the defined policies.

Think of it as a gatekeeper – it verifies client identity, examines messages to make sure they're acceptable, and enforces restrictions set at the swarm level.  It can be configured to automatically ban clients if they fail validation and it provides customizable messages to explain why a client was banned.  The ban list itself isn’t loaded immediately, only when needed, making it efficient.

It works closely with other parts of the system like the ClientAgent (for message filtering) and the BusService (for announcing policy-related events).  The system allows for dynamically adding or removing clients from the ban list, which can be persistently stored if needed.

## Class ClientOperator

The `ClientOperator` class acts as a bridge, allowing you to interact with and manage a swarm of AI agents. It provides methods for sending instructions, retrieving results, and coordinating the agents’ actions. 

Think of it as a central hub. You use `commitUserMessage` to give the agents tasks, and `waitForOutput` to patiently await their responses. 

Currently, some features like committing tool outputs, system messages, assistant messages, or flushing are not functional, serving as placeholders for future expansion.  The `commitAgentChange` method allows you to signal changes within the agent system, and `dispose` cleans up resources when you’re finished.  The `execute` method is available for running input with specified mode.

## Class ClientMCP

This component, the ClientMCP, acts as a bridge between your application and the system's available tools. It manages tools for specific clients, keeping track of which tools are available and caching them to improve performance.

You can use it to see a list of tools a client has access to, verify if a tool exists for a client, or even call a tool with the necessary data.  When the tools need to be refreshed – perhaps because new ones have been added or updated – you can trigger a refresh for a single client or for all clients.

Finally, when a client is no longer needed, you can clean up resources and release cached tools using the dispose function.

## Class ClientHistory

This class keeps track of all the messages exchanged with an agent within the swarm system. It's like a logbook specifically for each agent's interactions. You can add new messages to the log, remove the most recent one, or retrieve the complete history.

The history can be presented in different ways: you can get the raw, unfiltered log for debugging or to see everything that's happened, or you can get a customized view tailored for the agent, which includes important system messages and considers agent-specific filtering rules.

When an agent is finished working, this class cleans up its resources to keep the system running smoothly.

## Class ClientCompute

This class, `ClientCompute`, is designed to manage and interact with a compute resource within your agent swarm orchestration system. Think of it as a controller for a specific processing unit.

It's initialized with configuration parameters that define its behavior and connection details. It holds internal functions for managing its lifecycle and retrieving data.

The `calculate` method initiates a processing cycle, driven by a specific state. The `update` method allows refreshing the compute resource’s status. The `getComputeData` method retrieves information about the compute resource. Finally, `dispose` gracefully shuts down and releases any resources held by this compute instance.

## Class ClientAgent

This class, `ClientAgent`, is the core of the AI agent system, handling all interactions and logic for a single agent within a swarm. It's responsible for executing instructions, managing tool usage, and keeping track of the conversation history. Think of it as the "brain" of an agent.

It's built with asynchronous operations in mind, preventing overlap and using subjects to manage various states like tool errors or agent changes. It connects to several other services for handling history, tools, completions, and coordination with other agents.

**Key features and how they work:**

*   **Execution:** It receives instructions (`execute`, `run`) and processes them, calling tools if needed. It prioritizes preventing multiple tasks from running at once.
*   **Tool Management:**  `_resolveTools` finds and organizes the tools the agent can use, making sure there are no duplicates. `commitToolOutput` records the results of using those tools.
*   **System Prompting:**  `_resolveSystemPrompt` puts together the initial context for the agent, combining static and dynamic instructions.
*   **Error Handling:** If something goes wrong, `_resurrectModel` tries to recover, potentially retrying the task or providing a placeholder result.
*   **Communication:**  It broadcasts outputs and events to other parts of the system and potentially to other agents in the swarm.
*   **Lifecycle:** `dispose` performs cleanup when the agent is no longer needed.

Essentially, this class orchestrates the agent's behavior, ensuring that it responds appropriately to instructions, manages its tools effectively, and interacts smoothly with the surrounding system.

## Class ChatUtils

This class helps manage and control chat sessions for clients interacting with an AI agent swarm. Think of it as a central hub that creates, sends messages to, and cleans up after these chat interactions.

The `getChatInstance` method is key—it either provides an existing chat session for a client or sets one up if it doesn't exist.  `beginChat` formally starts a new session, and `sendMessage` is how you actually transmit messages through that session.  If you need to be notified when a chat session is ending, `listenDispose` allows you to register a function that gets called when that happens. Finally, `dispose` is used to cleanly shut down a chat session.

You can customize how chat instances are created and how they behave by using `useChatAdapter` to specify a constructor and `useChatCallbacks` to provide custom event handlers.

## Class ChatInstance

The `ChatInstance` class manages a single chat session within an AI agent swarm. It’s given a unique client identifier and a name for the swarm it belongs to. It also uses a function to handle cleanup when the chat is finished and optionally, receives callback functions for various chat events. 

Internally, it tracks when the chat was last active, and keeps track of the chat session itself. The `checkLastActivity` method verifies if the chat is still considered active based on a timeout.  You can start a chat session using `beginChat`, and send messages with `sendMessage`. When you're done, `dispose` cleans everything up. Finally, `listenDispose` lets you register a function to be notified when the chat instance is disposed.

## Class BusService

This class, `BusService`, is the central hub for event-driven communication within the agent swarm. Think of it as the mailman, responsible for delivering messages (events) between different parts of the system. It manages subscriptions, making sure the right recipients get the events they're interested in.

You can subscribe to specific event types from a client, or even subscribe generally to catch all events of a certain type.  When an event occurs, `BusService` delivers it to all the interested subscribers.  It also handles special events like the start and end of execution tasks.

Crucially, it ensures only valid client sessions can receive events, and it keeps track of all subscriptions to allow for cleanup when a client disconnects. It's designed to be efficient, reusing connection resources whenever possible. The system can also send broad system-wide notifications to those subscribing with wildcards. Think of it as the nervous system for your AI agents.

## Class AliveService

This class helps keep track of which clients are currently active within your agent swarms. Think of it as a status checker. 

You can use it to tell the system that a client is online or offline, and it remembers this information, potentially saving it for later. The system logs these changes so you can see what's happening. The `markOnline` and `markOffline` methods are the primary way to manage client status, and they work within a defined swarm.

## Class AgentValidationService

This service acts as a central point for verifying the configurations of individual agents within the swarm. It keeps track of agent schemas, storage connections, and dependencies to ensure everything is set up correctly. 

Think of it as a quality control checkpoint for your agents. You can register new agents, check if they have the necessary storage or wiki connections, and validate their overall configuration. The system intelligently caches results to speed up these checks.

Here's a breakdown of what it does:

*   **Agent Registration:** You register new agents with their specific configuration details.
*   **Dependency Management:** It helps track how agents rely on each other.
*   **Resource Checks:** Easily find out what storage, wikis or states an agent utilizes.
*   **Comprehensive Validation:** The `validate` method performs a full check, ensuring tools, storage, and completion configurations are all valid.
*   **Logging:** The service logs its operations, which is useful for monitoring and debugging.

It integrates with other services like the Agent Schema Service and Storage Validation Service to perform these checks efficiently.

## Class AgentSchemaService

The AgentSchemaService acts as a central place to define and manage the blueprints for your AI agents within the swarm system. Think of it as a library of agent templates, each outlining what an agent needs to do, what tools it uses, and how it should behave.

It keeps track of these agent blueprints using a specialized registry, ensuring they're well-formed and consistent. Before an agent is created or a swarm is configured, this service validates that the agent's definition makes sense.

You can add new agent blueprints, update existing ones, and retrieve them whenever needed. The service also logs its activities to help you keep track of changes and troubleshoot issues. It's a crucial foundation for ensuring your AI agents work together reliably.

## Class AgentPublicService

This class, `AgentPublicService`, acts as the main gateway for interacting with agents within the system. It provides a user-friendly API for common operations like creating agents, executing commands, and managing their history.

Think of it as a layer of abstraction that sits on top of the core agent handling logic. It ensures that all interactions are properly tracked, logged, and scoped, making it easier to manage and debug agent behavior.

Here's a breakdown of what you can do with it:

*   **Creating Agents:** You can request a reference to an agent for a specific method and client.
*   **Executing Commands:** You can run commands on an agent, specifying the execution mode.
*   **Running Stateless Completions:**  You can perform quick, stateless tasks on an agent.
*   **Managing Agent History:** You can add user messages, assistant responses, system prompts, and tool outputs to an agent’s history. This is important for maintaining context and tracking conversations.
*   **Flushing Agent History:** You can completely clear an agent's history, effectively resetting its state.
*   **Controlling Tool Execution:** You can signal the system to prevent tool execution or to stop ongoing tools.
*   **Disposing of Agents:** You can release an agent's resources when it's no longer needed.

Essentially, `AgentPublicService` is your one-stop shop for working with agents in a controlled and traceable manner.  It provides a consistent way to interact with agents while ensuring that all actions are properly logged and managed.

## Class AgentMetaService

This service helps understand and visualize the relationships between different agents in your system. It takes information about each agent – its dependencies, states, and tools – and organizes it into a structured tree.

You can use this service to create either detailed views showing all aspects of an agent or simpler views focusing on its dependencies.  The service can then translate these structured views into a standard UML format, allowing you to generate diagrams that illustrate how agents interact.

It's designed to be flexible and integrates with other parts of the system, like documentation generation and performance monitoring, to provide a comprehensive picture of agent behavior. The process includes logging for debugging, which can be enabled or disabled.

## Class AgentConnectionService

This service manages how individual AI agents are created, used, and cleaned up within the system. It acts as a central point for getting agents, running commands, and handling the flow of messages between them. 

Think of it as a smart factory: When you need an agent (like an automated worker), this service makes sure you get the right one, keeps track of how it's being used, and efficiently reuses agents whenever possible. It relies on other services for things like logging, event handling, schema management, and data storage.

Here's a breakdown of what it does:

*   **Agent Creation & Reuse:** It creates or finds existing agents quickly, avoiding unnecessary creation.
*   **Command Execution:** It handles commands given to agents, making sure they're executed correctly and tracked.
*   **Message Handling:**  It manages the sending and receiving of messages to/from agents.
*   **Resource Cleanup:** When an agent is no longer needed, it cleans up any resources associated with it.
*   **Logging and Tracking:**  Keeps records of agent activity and usage for monitoring and debugging.
*   **Integration:** Works closely with other services to provide a complete AI agent solution.

## Class AdapterUtils

This utility class helps you easily connect to different AI models like Cohere, OpenAI, LMStudio, and Ollama. It provides pre-built functions that handle the specifics of each provider's API, so you don't have to write that code yourself. 

Essentially, you give it an instance of the AI provider’s client library (like CohereClientV2 or the OpenAI library), and it creates a function you can use to send requests and receive completions. You can also specify the model you want to use and, in some cases, how you want the responses formatted or the tool call protocol. This allows for a flexible and consistent way to work with various AI models within your system.

# agent-swarm-kit interfaces

## Interface TAbortSignal

This interface lets you signal when an operation needs to be stopped, building upon the standard web API for doing so. Think of it as a way to cleanly cancel things that are running in the background. You can adapt it to add your own specific details if needed, making it perfectly suited for your application's workflow.

## Interface IWikiSchema

This interface, `IWikiSchema`, defines the structure for a wiki knowledge base used by our AI agent swarm. Think of it as a blueprint for organizing information. 

Each wiki has a name, identified by `wikiName`, and a short description, stored in `docDescription`.  You can also provide custom actions to be performed during wiki operations using `callbacks`. 

Finally, the `getChat` method allows your agents to query the wiki and receive a textual response, using provided arguments to guide the search.

## Interface IWikiCallbacks

This interface defines a set of optional functions that you can provide to integrate with the Wiki component of the agent swarm. Specifically, the `onChat` function lets you be notified whenever a chat interaction happens – you can use this to log chat content, analyze conversation flow, or react to specific requests made during a chat session. Think of it as a way to peek in and understand what's happening during the agent's interactions with a Wiki.

## Interface ITriageNavigationParams

This interface defines the information needed to set up how an AI agent navigates through a triage process. You specify a `toolName` which is essentially the name of the tool the agent will use.  A `description` helps explain what the tool does.  There’s also an optional `docNote` for extra documentation, and a `skipPlaceholder` that’s used to avoid repeated outputs when multiple navigation options are available. It’s all about creating clear instructions for the agents to follow during triage.

## Interface IToolCall

This interface describes a single request to use a tool within the agent swarm. Think of it as the system's way of understanding what a model wants a tool to do. Each tool call has a unique ID to keep track of it, a type indicating it's a function call, and details about which function to run and what arguments it needs. The system uses these details to execute the tool and link its results back to the original request.

## Interface ITool

This interface describes what a tool looks like within the agent swarm system. Think of it as a blueprint for defining a function an agent can use.

It tells the AI model what functions are available, including their names, what they do, and what inputs they need. The model can then use this information to decide when and how to use these tools.

Currently, tools are primarily function calls, but the design allows for future expansion to include other types like API calls or scripts. The key details like the function’s name, description, and parameter structure are all defined here, ensuring the model and the swarm system are in sync.

## Interface ISwarmSessionCallbacks

This interface lets you listen in on important happenings within your AI agent swarm. You can use these callbacks to track when agents join or leave the swarm, to observe the commands being executed, or to monitor messages being sent between agents.  It provides a way to log activity, perform custom initialization steps, or react to events as they occur during the swarm’s operation. Specifically, you’re notified when a session starts, when a task is run, when a message is broadcast, and when a session ends.

## Interface ISwarmSchema

This interface helps you define how your AI agent swarm will operate. It lets you configure things like saving the swarm's progress, setting a default agent to use, and providing lists of available agents. You can also customize the swarm's behavior by adding functions to control the navigation stack, the currently active agent, and even define access control policies. Providing a description helps document the swarm’s purpose and usage, while optional callbacks enable you to respond to specific lifecycle events within the swarm.

## Interface ISwarmParams

This interface defines the information needed to get a swarm of AI agents up and running. Think of it as the blueprint for setting up the swarm – it specifies who's starting the swarm (clientId), how to track what’s happening (logger), how agents will communicate (bus), and a list of the individual agents that will be part of the swarm (agentMap). It's like providing the swarm with its identity, its communication channels, and its team members all at once.

## Interface ISwarmDI

The `ISwarmDI` interface acts as a central hub for all the specialized services that power the AI agent swarm system. Think of it as a toolbox containing everything the swarm needs to operate, from managing documentation and handling events to tracking performance and connecting to various resources. Each property within this interface represents a specific service responsible for a particular aspect of the system, like agent connections, storage, or policy enforcement. Essentially, this interface defines the complete set of dependencies that the swarm relies on to function correctly.

## Interface ISwarmConnectionService

This interface outlines the public-facing methods for connecting to and managing an AI agent swarm. Think of it as a blueprint that guarantees the core functionality for interacting with the swarm remains consistent and predictable. It's designed to be used when creating specific implementations of swarm connection services, ensuring that the public-facing aspects are well-defined and separate from any internal workings. Essentially, it ensures that anyone using the swarm connection service can rely on a standardized set of actions.

## Interface ISwarmCallbacks

This interface lets you hook into key moments in your AI agent swarm's life. You can use it to track which agent is currently active, receiving notifications whenever the active agent shifts within the swarm. This is helpful for things like monitoring the swarm’s behavior or updating a user interface to reflect the current agent's task. Essentially, it’s a way to stay informed about changes happening inside the swarm as agents take over different roles.

## Interface ISwarm

This interface lets you interact with a group of AI agents working together. You can think of it as a way to control and observe a team of AI workers. 

It allows you to retrieve the name and details of the current agent that’s actively working, and to switch between different agents in the swarm. You can also tell the swarm to stop what it’s doing and clear any pending output. 

The `emit` method lets you send messages to the overall communication system, useful for logging or sending information outside the swarm’s immediate processing. Finally, you can use `waitForOutput` to get the result of the swarm's work.

## Interface IStorageSchema

This interface describes how a storage component functions within the agent swarm. It lets you customize storage behavior such as whether data is saved permanently, how it's accessed, and how it's indexed for searching.

You can provide descriptions for documentation, control whether the storage is shared between agents, and even replace the default methods for getting and setting data. A key part is defining the embedding mechanism used for indexing items, and assigning a unique name to identify the storage. 

You also have the option to define custom lifecycle callbacks, and provide default data. Importantly, you can create an index for each item, which is crucial for efficient searching and retrieval.

## Interface IStorageParams

This interface defines how your application interacts with the storage system used by the AI agent swarm. Think of it as a set of tools for managing and using embeddings – those numerical representations of text that help agents understand and compare information.

It lets you identify which client is using the storage, calculate similarities between embeddings to find related content, and most importantly, cache and retrieve pre-computed embeddings to speed things up. You're also able to create new embeddings for items that need to be indexed and receive logging and communication tools to track what’s happening and coordinate with other parts of the system. Essentially, this interface provides everything needed to effectively store and use embeddings within the swarm environment.

## Interface IStorageData

This interface, `IStorageData`, outlines the basic information that's saved within the system. Every piece of data stored will have a unique `id`, which acts like a name tag to find it again later or to delete it. Think of it as the primary key for anything you want to keep track of.

## Interface IStorageConnectionService

This interface helps define how your AI agent swarm will connect to and interact with storage systems. Think of it as a blueprint for managing those connections – it lays out the essential methods and properties you’ll need. It's designed to be a clean, public-friendly version, stripping away any behind-the-scenes details that aren't directly needed for external use. It ensures a consistent and reliable way for your agents to access and manage data.

## Interface IStorageCallbacks

This interface lets you listen in on what's happening with your data storage. You can get notified when data is changed, when someone searches for information, or when the storage itself is set up or taken down. Think of it as a way to keep track of important events and perform actions like logging or synchronizing data whenever something significant occurs with your storage system. You’ll receive updates whenever data is added, removed, or modified, and you can also respond to search requests and handle the initial setup and final cleanup of the storage.

## Interface IStorage

This interface lets your AI agents manage and work with shared data. Think of it as a central hub for storing information and making it accessible to everyone in the swarm. 

You can use `take` to fetch a few relevant items based on a search term, like pulling up recent documents related to a specific topic. `upsert` lets you add new information or update existing data to keep everything current. If an item is no longer needed, `remove` allows you to delete it. 

Need to find a specific item? Use `get` with its unique ID. `list` helps you view all items or a filtered subset, and `clear` provides a way to wipe the slate clean and start over.

## Interface IStateSchema

The `IStateSchema` interface describes how a piece of information, or "state," is managed within the agent swarm. It outlines the state's properties and how it behaves. 

You can choose whether the state data is saved persistently, and provide a description to help others understand its purpose.  The `IStateSchema` also defines if the state can be accessed and used by different agents in the swarm.

Crucially, you define a function to create the initial state, and optionally customize how the state is retrieved, updated, and saved. You can also add middleware functions to process the state during its lifecycle, and use callbacks to tailor how the state reacts to different events.

## Interface IStateParams

This interface defines the information needed to manage a state within the AI agent swarm. Think of it as a container holding the specific details for a particular state instance. 

It includes the unique identifier for the client that owns the state, a logger to track what’s happening with the state, and a communication bus allowing the state to interact with other parts of the swarm. Essentially, it's the set of ingredients needed for a state to function correctly within the overall system.

## Interface IStateMiddleware

This interface lets you step into the process of how your AI agents are interacting with the shared state. Think of it as a customizable checkpoint where you can inspect or adjust the data before it's used or saved. You can use it to enforce rules, log changes, or even make modifications to the state as it flows through the system, providing a powerful way to control and refine the overall behavior of your agent swarm.

## Interface IStateConnectionService

This interface helps define how different parts of the AI agent swarm orchestration framework communicate and share information about the system's current state. Think of it as a blueprint for managing the flow of data – it ensures that only the necessary information is exposed, keeping things organized and secure for external use. It’s used to create a clear and consistent way for different components to interact and understand what’s happening within the swarm.

## Interface IStateChangeContract

This interface defines how different parts of the AI agent swarm orchestration framework communicate about changes in state. Specifically, it provides a way for components to signal that the state of something – perhaps a task, an agent, or the overall system – has been updated. The `stateChanged` property is the key here; it uses a special mechanism to broadcast the new state string to interested listeners, ensuring everyone stays informed about what's happening within the swarm. It’s a simple but powerful way to keep things synchronized and responsive.

## Interface IStateCallbacks

This interface lets you listen in on what's happening with your application's state. You can register functions to be called when a new state is created, when it's no longer needed, or when it's first loaded. It also provides notifications whenever the state is read from or written to, so you can keep track of changes and potentially react to them in real time. Essentially, it's a way to be informed about the lifecycle and activity of your application’s data.

## Interface IState

This interface lets you manage the current status of your AI agent swarm. Think of it as a central place to see how things are going and to make adjustments.

You can use `getState` to peek at the current status – it accounts for any extra processing or rules you've set up.

`setState` allows you to update the status, but it does so by giving you a function to calculate the new status based on the old one, ensuring a controlled change.

Finally, `clearState` provides a way to reset everything back to the original starting point defined in your setup.

## Interface ISharedStorageConnectionService

This interface helps define how different parts of the system connect to shared storage. Think of it as a blueprint for managing access to a common data space. It’s designed to ensure that only the parts that users and external systems need to interact with are exposed, keeping the internal workings hidden. This helps create a cleaner and more secure way to work with shared data.

## Interface ISharedStateConnectionService

This interface outlines how different parts of the system can share information and coordinate their actions. It's a blueprint for a service that handles the connection and exchange of data, but specifically designed to hide some of the behind-the-scenes workings. Think of it as a standardized way for agents to talk to each other and share what they know, while keeping the core implementation details private. It ensures a consistent and predictable way to manage shared data across the swarm.

## Interface ISharedComputeConnectionService

This service lets your AI agents connect to and utilize shared computing resources, like specialized hardware or remote servers. Think of it as a central hub where agents can request and access computational power when they need it, rather than each agent needing its own dedicated setup. It provides methods for establishing connections, managing resources, and ensuring agents can reliably use these shared resources for tasks like complex calculations or simulations. The service handles the behind-the-scenes complexity of resource allocation and connection management, allowing your agents to focus on their core intelligence.

## Interface ISessionParams

This interface outlines everything you need to set up a new session for your AI agent swarm. Think of it as a blueprint that gathers all the key pieces together. You’ll provide a unique identifier for the client using the `clientId`, a way to record what's happening with `logger`, rules and limitations with `policy`, a communication channel through `bus`, and the overall swarm managing everything with `swarm` and `swarmName`. It's a way to ensure a session is properly configured and connected to the larger system.

## Interface ISessionContext

The `ISessionContext` interface holds all the important details about a session within the AI agent swarm. Think of it as a container for information about who initiated the session (the `clientId`), which process is running (`processId`), and what specific task or method is currently being executed (`methodContext`). It also includes details about the execution environment itself, captured in the `executionContext`. Having access to this context allows for better tracking, debugging, and overall management of agent interactions.

## Interface ISessionConnectionService

This interface helps define how different parts of the system interact when establishing and managing connections for AI agents. Think of it as a blueprint ensuring that the publicly accessible connection services only expose what's necessary and avoid internal details. It’s used to create a reliable and consistent way for agents to connect and communicate within the swarm.

## Interface ISessionConfig

This interface, `ISessionConfig`, helps manage how your AI agents run, particularly when you need to control their timing or prevent them from overwhelming resources. You can use it to set a `delay`, which specifies a pause between agent executions, ensuring they don't all run at once.  It also lets you define an `onDispose` function—a piece of code that runs when the session ends, allowing you to clean up any resources or perform final actions. Think of it as a way to schedule or throttle your agents’ activity and handle what needs to happen when their work is complete.

## Interface ISession

The `ISession` interface is like the central control panel for each conversation happening within the agent swarm. It provides the tools to manage the flow of messages, control how the agents respond, and keep track of the conversation's progress.

You can use it to send messages from a user, which are stored in the conversation history without immediately prompting a reply. Similarly, you can add messages from the agents (assistant messages) or system-level instructions to the conversation record.

The interface also lets you pause the execution sequence to prevent the next agent tool from running, and to clear the entire history, essentially starting a fresh conversation. 

It enables connecting external systems to send and receive messages, allowing for real-time interaction with the agents. The `run` method lets you perform one-off tasks or test responses outside of the normal conversation flow, while `execute` handles the standard processing of user input. Finally, you can record the output from any tools the agents use.

## Interface IPolicySchema

This interface defines the structure for configuring policies that control how your AI agent swarm manages client access and enforces rules. You can use it to specify a unique name for your policy, optionally provide a description for documentation, and determine whether banned clients should be saved persistently.

It allows you to customize how clients are banned, including providing a custom ban message or overriding the default ban list management.  The interface also offers powerful validation hooks, letting you define your own functions to validate incoming and outgoing messages against your specific rules. Finally, it gives you a way to react to different policy events with customizable callbacks.

## Interface IPolicyParams

This interface defines the information needed to set up a policy within the AI agent swarm. Think of it as the blueprint for how a policy will behave and interact.

It requires a logger, which is how the policy will report what it's doing and any problems it encounters.

It also needs a bus, which is the communication channel that allows the policy to talk to and coordinate with other agents in the swarm. Essentially, it’s how the policy participates in the overall system.


## Interface IPolicyConnectionService

This interface helps us ensure the public-facing parts of our system for managing connections between AI agents are clearly defined and consistent. Think of it as a blueprint for how external tools or developers should interact with the connection management system. It's designed to exclude any internal workings, so only the necessary functions and data are exposed. This keeps things organized and prevents accidental misuse of private components.

## Interface IPolicyCallbacks

This interface defines a set of optional functions you can use to get notifications and react to events happening within a policy. You can hook into the policy's initialization process with `onInit`, receive alerts when input is being validated via `onValidateInput`, and monitor output validation with `onValidateOutput`. If a client is ever banned, `onBanClient` will notify you, and `onUnbanClient` lets you know when a ban is lifted. These callbacks offer a way to track and respond to important policy lifecycle events.

## Interface IPolicy

This interface defines how policies are enforced within the AI agent swarm. It provides methods to check if a client is banned, retrieve the reason for a ban, and validate messages both coming into and leaving the swarm. You can use it to ban or unban clients, effectively controlling access and ensuring messages adhere to specific rules within a particular swarm. Think of it as a gatekeeper for your agents, dictating who can participate and what they can say.

## Interface IPersistSwarmControl

This interface lets you tailor how your AI agent swarm remembers its state. You can hook in your own custom storage solutions for both the active agents within the swarm and the navigation paths they follow. Think of it as swapping out the default memory with something more suitable for your specific needs, whether that's keeping data in memory, using a database, or something else entirely. It provides a way to inject your own persistence logic, allowing for greater flexibility in managing swarm data.

## Interface IPersistStorageData

This interface describes how to package up data for saving and loading within the AI agent swarm. Think of it as a container holding a list of information – like a collection of settings or observations – that needs to be stored. The `data` property simply holds that list of items, whatever format they happen to be in. It's used behind the scenes to help manage the swarm’s long-term memory.

## Interface IPersistStorageControl

This interface lets you plug in your own way of saving and loading data for a specific storage area. Think of it as swapping out the default saving mechanism with something tailored to your needs, like using a database instead of a simple file. You provide a blueprint for your custom saving tool, and the framework takes care of using it to manage the storage. This gives you greater control over how the data is persisted.

## Interface IPersistStateData

This interface describes how to save and load data related to your AI agents. Think of it as a container for any information you want to keep around, like how each agent is set up or the progress of a specific task. The `state` property within this interface holds the actual data you're saving, and it can be anything you need it to be – configurations, session details, or anything else relevant to your agents' behavior. It provides a standardized way to manage this data so your swarm system can reliably remember important information between sessions.

## Interface IPersistStateControl

This interface lets you hook into how the system saves and retrieves agent state information. It provides a way to replace the default saving mechanism with your own custom solution. If you need to store agent state in a specific place, like a database instead of the usual method, this is how you tell the framework to use your custom code. You essentially provide a blueprint for your custom saving process.

## Interface IPersistPolicyData

This interface outlines how the system remembers which clients are currently restricted within a particular swarm. It's used to store a list of "banned" session IDs – essentially, unique identifiers for clients – associated with a specific swarm's operational policy. Think of it as a blacklist for clients that shouldn't be interacting with the swarm. The `bannedClients` property holds this list of session IDs.

## Interface IPersistPolicyControl

This interface lets you plug in your own way of saving and loading policy data for a specific swarm. Think of it as customizing how the system remembers its rules. If you need a non-standard storage method, like storing policies in memory instead of a database, you can use this to replace the default behavior. It gives you the flexibility to adapt the framework to your specific environment and data storage preferences.

## Interface IPersistNavigationStackData

This interface helps keep track of where you're navigating within your AI agent swarm. Think of it as a history log for your interactions. It stores a list of agent names, creating a stack that remembers the order in which you've been working with different agents. This is useful for remembering your path and allowing you to easily go back to previous agents. The `agentStack` property is simply an array of strings, where each string represents the name of an agent you've interacted with.

## Interface IPersistMemoryData

This interface describes how memory information is saved and loaded within the AI agent swarm. Think of it as a container for whatever data you want to remember – it could be details about a conversation, a temporary calculation, or any other relevant information. The `data` property holds the actual memory content, and its type is flexible, allowing you to store different kinds of data depending on your needs. This standardized structure ensures that the swarm system can consistently handle memory persistence.

## Interface IPersistMemoryControl

This interface lets you plug in your own way of saving and loading memory data associated with a session. Think of it as a way to replace the default storage mechanism – maybe you want to use a database instead of a simple file, or perhaps you need an in-memory solution for testing. You provide a custom "adapter" that handles the actual saving and loading, and this interface gives you the hook to tell the system to use yours instead of the built-in one. This is useful when you need very specific control over how memory is persisted.

## Interface IPersistEmbeddingData

This interface describes how embedding data is stored within the system. Think of it as a container for numerical representations of text or other data, linked to a specific identifier. The `embeddings` property holds the actual numerical data – a list of numbers that describe the meaning or characteristics of the original data. Each set of numbers represents a single embedding.

## Interface IPersistEmbeddingControl

This interface lets you customize how embedding data is saved and retrieved. You can plug in your own way of storing these embeddings, which is helpful if you need something different than the default behavior. Think of it as swapping out the system that handles saving and loading embedding information, allowing you to control where and how that data lives. This is particularly useful when you need to track embeddings in a unique location or with specific characteristics.

## Interface IPersistBase

This interface provides the basic tools for saving and retrieving data persistently within the agent swarm. It's the foundation for how the swarm remembers things like agent states or memory.

You can use `waitForInit` to prepare the storage area, which will create the directory if it doesn’t exist and clean up any problematic data. `readValue` lets you load a specific piece of data based on its ID.  `hasValue` allows you to quickly check if a piece of data exists without loading it entirely. Finally, `writeValue` saves data to storage, ensuring it’s written reliably as a JSON file.

## Interface IPersistAliveData

This interface helps keep track of whether a client is currently active within a specific group of agents. It's a simple way to mark a client as online or offline, which is useful for coordinating tasks and managing resources in the swarm. The interface only includes a single property, `online`, which is a true or false value representing the client's status.

## Interface IPersistAliveControl

This interface lets you connect your own way of saving and loading the "alive" status of an AI agent swarm. Think of it as a way to swap out the default method for keeping track of whether a swarm is active, using your own custom logic – maybe you want to store this information in a database instead of a simple file. You can plug in a specific class that handles this persistence, allowing for flexible and tailored solutions for different swarm environments.

## Interface IPersistActiveAgentData

This interface describes the information used to remember which agent is currently running for a particular client participating in a swarm. Think of it as a way to keep track of the "active" agent – the one currently doing the work – for each client within a swarm. It stores the agent's name, which acts as its unique identifier within the swarm system. This helps the system understand which agent is currently engaged and ready to receive instructions or process data.

## Interface IPerformanceRecord

This interface defines how performance data for a process within the AI agent swarm is tracked. It collects metrics like execution counts and response times from multiple clients participating in that process. Think of it as a way to monitor how well the swarm is operating, allowing you to spot bottlenecks or inefficiencies.

Each record includes a unique identifier for the process itself, as well as a list of performance records for each individual client involved. You’re also given overall totals, like the total number of executions and total response time, plus averages to provide a clearer picture of typical performance. Finally, it captures the exact time the data was recorded, using both a coarse date and a more precise time-of-day value.

## Interface IPayloadContext

This interface, `IPayloadContext`, is like a container that holds all the extra information needed alongside your actual data when sending something to the AI agent swarm. Think of it as a package with two key parts.  The `clientId` lets you know which client initiated the request, providing a way to track things back to their source.  Then, there's the `payload` – this is where the actual data you want the agents to work with goes, and it’s flexible because it can be whatever type of data you need.

## Interface IOutgoingMessage

This interface describes a message being sent out from the orchestration system, typically to an agent client. Think of it as the system’s way of delivering information back—like a response, result, or notification—to a specific client.

Each message has a `clientId` to make sure it reaches the right client, a `data` field containing the actual content of the message (the result or the information being conveyed), and an `agentName` indicating which agent within the system generated the response. It's like an envelope with the recipient's address, the letter inside, and the return sender's name.

## Interface IOperatorSchema

This interface defines the structure for connecting an operator to the AI agent swarm. Think of it as a way for a human to interact with and guide the agents. The `connectOperator` function is the key – it establishes a communication channel, allowing the operator to send messages to a specific agent and receive responses. It also provides a way to cleanly disconnect when the interaction is complete. Essentially, it's the bridge between a human and the automated agent network.


## Interface IOperatorParams

This interface defines the configuration needed to run an individual agent within our swarm orchestration framework. Think of it as a blueprint for setting up each agent. 

It specifies essential components: `agentName` lets you identify the agent, `clientId` helps track its origin or purpose, and `logger` handles all the logging information.  The `bus` property provides a communication channel for the agent to interact with others in the swarm, while `history` allows it to remember past interactions and decisions. Essentially, this interface describes what each agent needs to know and use to function effectively within the overall swarm.

## Interface IOperatorInstanceCallbacks

This interface lets you listen in on what's happening with individual agents within your swarm. Think of it as a way to get updates about an agent’s lifecycle and actions.

You can set up functions to be triggered when an agent starts (`onInit`), gives you an answer (`onAnswer`), receives a message (`onMessage`), finishes its work and is cleaned up (`onDispose`), or sends a notification (`onNotify`). Each of these functions receives information about which client the agent is working on and the agent’s name, so you can tailor your responses accordingly. This lets you react to agent behavior in real time or log important events.

## Interface IOperatorInstance

This interface defines how you interact with a single agent within a swarm, giving you the tools to communicate with it. You can use `connectAnswer` to set up a way to receive responses from the agent. To actually send information to the agent, you're able to use `answer`.  `init` establishes the initial connection, while `notify` allows you to send alerts or updates. `recieveMessage` is for receiving messages back from the agent. Finally, `dispose` gracefully shuts down the agent's connection when you're finished with it.


## Interface IOperatorControl

This interface, `IOperatorControl`, lets you customize how your AI agent operators work. Think of it as a way to plug in your own logic and behaviors. 

You can use `useOperatorCallbacks` to register functions that will be called at specific points in the operator’s lifecycle, allowing you to react to and potentially influence its actions. 

Alternatively, `useOperatorAdapter` allows you to swap out the default operator implementation with a custom one you've created, giving you complete control over the operator's core functionality.

## Interface INavigateToTriageParams

This interface lets you customize how your agents communicate while they’re being guided towards a triage agent. Think of it as a way to fine-tune the messages they send and receive during this process.

You can define specific messages to be sent when a navigation step is complete (lastMessage), when data needs to be cleared (flushMessage), when an action is being executed (executeMessage), and when the agent successfully accepts or rejects output from a tool (toolOutputAccept, toolOutputReject). These messages can be simple strings or functions that dynamically generate content based on factors like the client ID and the currently active agent. This provides a flexible way to ensure consistent and informative communication throughout the navigation workflow.

## Interface INavigateToAgentParams

This interface lets you customize how your agent swarm handles transitions between agents. Think of it as a way to shape the messages and actions that happen when moving from one agent to another. 

You can provide default messages for things like flushing data, processing tool outputs, emitting status updates, or executing commands during that transition.  

The options let you specify a fixed message, or a function that dynamically generates a message based on factors like the client ID, the agent’s name, and the previous user's input. This allows for very tailored and context-aware communication during navigation.

## Interface IModelMessage

This interface, `IModelMessage`, represents a single message that flows through the AI agent swarm. Think of it as the basic unit of communication – whether it’s a user’s prompt, a tool’s output, or a system notification. It's used to track what’s happened in a conversation, generate responses, and pass information around.

Each message has a `role` to indicate who or what sent it: `tool`, `user`, `assistant` (the AI model), `system` (for system-level messages), `resque` (related to error recovery), or `flush` (for resetting history).  A `agentName` identifies which agent sent the message. The `content` is the actual text or data being communicated.

The `mode` tells you whether the message came from a `user` or a `tool`, influencing how it’s processed.  `tool_calls` are included when the model requests a tool to be executed.  If a tool responds, the `tool_call_id` links that response back to the original tool request. Finally, a `payload` allows for attaching extra data to the message.

## Interface IMethodContext

This interface, `IMethodContext`, provides a standardized way to track information about each method call within the swarm system. Think of it as a little package of details that travels with every method execution, helping different services like logging, performance monitoring, and documentation keep tabs on what's happening. It includes things like the client's session ID, the name of the method being called, and the names of the agents, swarms, storage, state, compute, policy and mcp resources involved. This structured data allows for more organized and insightful tracking across the entire system.

## Interface IMetaNode

This interface describes the basic building block for organizing information about your agents and their connections. Think of it as a way to represent a tree-like structure where each node holds details about an agent or a resource it uses. 

Each node has a `name`, which is a descriptive label, like the agent's name or a resource identifier. It can also have `child` nodes, allowing you to build more complex relationships showing how agents depend on each other or use particular resources. This structure is used to create visual representations and understand agent dependencies.

## Interface IMCPToolCallDto

This interface defines the structure of data used when a tool is called within the agent swarm orchestration framework. Think of it as a message being passed around to coordinate actions. 

It includes things like a unique ID for the tool being used, who requested the call (the client ID), and the name of the agent responsible. 

The `params` field holds the specific data needed for the tool to function, while `toolCalls` tracks any further calls that are part of a larger process.  You can also include a signal to stop a tool call mid-execution, and a flag to indicate if this is the final call in a chain.

## Interface IMCPTool

This interface describes what a tool looks like within the agent swarm system. Each tool needs a name, so the system knows what it is. You can also provide a description to explain what the tool does. Finally, the `inputSchema` tells the system what kind of information the tool expects to receive – it outlines the structure and necessary fields for input.

## Interface IMCPSchema

This interface outlines the blueprint for a core component within the agent swarm system – the MCP (Mission Control Process). Think of an MCP as a specialized worker responsible for managing a specific task or set of tasks within the swarm.

It needs a unique name to identify itself, and you can optionally provide a description to explain what it does.

Crucially, it defines how the system interacts with the MCP: It needs a way to discover the tools (capabilities) the MCP offers to clients, and a method to actually *use* those tools by providing data.  Finally, you can set up optional hooks to be notified about important events in the MCP's lifecycle.

## Interface IMCPParams

This interface defines the essential components needed to run a Managed Control Plane (MCP). Think of it as a blueprint for configuring how your MCP will operate. 

It requires a `logger` – a way to record what's happening during MCP execution, which is crucial for debugging and monitoring. 

It also necessitates a `bus`, which acts as a communication channel for the MCP to interact with other parts of the system, sending and receiving messages or events. These two elements work together to enable the MCP to function reliably and transparently.

## Interface IMCPConnectionService

This interface defines how different parts of the AI agent swarm system connect and communicate using a custom protocol, MCP. Think of it as the foundation for agents to reliably exchange messages and data. It provides methods for establishing connections, sending and receiving data, and handling connection errors. Implementing this service allows for flexible communication patterns within the swarm, independent of underlying transport mechanisms. You'll use it to build components responsible for managing those vital agent-to-agent links.

## Interface IMCPCallbacks

This interface defines the functions your application can use to react to what's happening with the agent swarm orchestration framework. Think of these functions as notification hooks – they let you know when the framework is starting up, when a client's resources are being cleaned up, or when tools are being requested or used. 

You’ll get a notification (`onInit`) when everything gets set up. `onDispose` lets you know when a client’s connection is ending.  `onFetch` signals that tools are being prepared for a client, while `onList` is triggered when you're listing available tools. 

The most important one is `onCall` – this is how you’re alerted whenever a tool is actually being used by an agent, providing information about which tool was used and the data involved. Finally, `onUpdate` tells you when the available tools for a client have changed.

## Interface IMCP

This interface lets you manage the tools available to your AI agents. Think of it as a control panel for what your agents can do.

You can use it to find out what tools are currently offered to a particular agent, or to check if a specific tool is available.  The real power comes from the ability to actually *use* those tools; you can call a tool and provide it with data to work on, and it will return a result.

Finally, you can refresh the list of tools for all agents or for a single agent, ensuring they have the most current options.

## Interface IMakeDisposeParams

This interface defines the information you provide when you want to automatically handle the cleanup of an AI agent swarm. 

It lets you specify a timeout duration, in seconds, after which the swarm will be automatically shut down if it's not actively managed. 

You can also provide a function that will be called when a swarm is being disposed, allowing you to perform any necessary actions before it’s completely stopped, and it receives the client ID and swarm name as arguments.

## Interface IMakeConnectionConfig

The `IMakeConnectionConfig` interface helps control how quickly your AI agents try to connect and communicate. It’s like setting a gentle pace to prevent overwhelming the system or other agents. The `delay` property lets you specify a waiting time, in milliseconds, before an agent attempts a connection – ensuring a more manageable flow of interactions.

## Interface ILoggerInstanceCallbacks

This interface defines a set of optional functions you can provide to control how a logger is created, shut down, and how log messages are handled. Think of it as a way to "plug in" your own custom behavior when a logger starts up, when it's finished, or whenever a new log message appears.

You can use `onInit` to perform setup actions when the logger is first created, `onDispose` to release any resources when the logger is being shut down, and `onLog`, `onDebug`, and `onInfo` to receive notifications whenever a log message of that level is written. Essentially, this allows your system to react to and potentially modify the logging process itself.

## Interface ILoggerInstance

This interface defines how a logger component should behave within the agent swarm system. It builds upon a basic logging function and adds methods for managing its lifecycle, ensuring it's properly set up and cleaned up when needed. Specifically, `waitForInit` lets you prepare the logger for use, potentially doing some setup work and guaranteeing it's ready before any logging happens.  Then, `dispose` is used to gracefully shut down the logger, releasing any resources it's holding and performing any necessary cleanup tasks. This helps keep things organized and prevents issues when an agent or its associated logger is no longer needed.

## Interface ILoggerControl

This interface gives you ways to customize how your AI agent swarm logs information. You can use it to set up a central logging system, define specific actions when a logger instance starts or stops, or even provide your own way to create logger instances. It also lets you log messages specifically tied to individual clients, ensuring you know where each log originates and that the session is valid. These methods simplify tracking and understanding the behavior of your agents.

## Interface ILoggerAdapter

This interface outlines how different parts of the system can communicate with logging tools. Think of it as a standard way to send messages – like logs, debug information, and general status updates – to different destinations, tailored for each client. 

Each client gets its own dedicated logging setup, and this interface provides methods to record various levels of messages, from simple notifications to detailed debugging information. 

Finally, there’s a way to cleanly shut down the logging for each client when it’s no longer needed, ensuring a tidy cleanup process.

## Interface ILogger

The `ILogger` interface defines how different parts of the AI agent swarm system record information. Think of it as a central way to keep track of what's happening. It provides simple methods – `log`, `debug`, and `info` – for recording different kinds of messages. `log` is for important events, `debug` is for detailed developer information, and `info` is for general updates on successful actions. This logging helps with understanding how the system works, finding and fixing problems, and keeping a record of what occurred.

## Interface IIncomingMessage

This interface describes a message coming into the system, like a request from a user or a piece of data from an external source. Each message has a unique identifier, `clientId`, that tells us which client it came from, ensuring we know who sent it. The message also carries some actual content, `data`, which is the information the client is sending – this might be a question, a command, or something else. Finally, `agentName` tells the system which agent is responsible for handling that message.

## Interface IHistorySchema

This interface describes how your AI agent swarm keeps track of its conversations and decisions. Think of it as the blueprint for the system's memory. 

Specifically, it focuses on the `items` property, which defines the component responsible for actually storing and retrieving those messages. This adapter handles the technical details of where and how the history is saved, letting the rest of the framework focus on the AI logic.

## Interface IHistoryParams

This interface defines the information needed to build a record of what an agent has been doing. Think of it as a blueprint for creating a history log. It requires you to specify the agent’s name, the client using the agent, a way to record what’s happening (a logger), and a communication channel for the swarm to use. This setup lets you track and understand how each agent contributes to the overall system.

## Interface IHistoryInstanceCallbacks

This interface defines a set of functions that allow you to customize how agent history is managed and processed. You can use these callbacks to retrieve the initial history for an agent, filter which messages are included, and react to changes in the history array, such as when a new message is added or removed. It also provides hooks to be notified at the start and end of reading the history, and when the history instance is initialized, disposed, or receives a reference to itself. You can use these functions to adjust prompts, handle data, or perform actions based on the agent's history.

## Interface IHistoryInstance

This interface helps manage the history of conversations and actions for each AI agent in your swarm. You can use it to step through past interactions, make sure each agent's history is properly loaded at the start, add new messages as they occur, retrieve the most recent message, and clean up the history when an agent is no longer needed. Essentially, it provides a way to keep track of what each agent has done and said.

## Interface IHistoryControl

This interface gives you control over how history is managed within the AI agent swarm. You can tell the system when to record events or what to do with those records by setting up lifecycle callbacks. 

Additionally, you can customize how history instances are created by providing your own constructor function. This lets you tailor the history management process to your specific needs.

## Interface IHistoryConnectionService

This interface acts as a blueprint for how external systems can interact with the history connection service. It focuses on the public-facing aspects of managing historical data connections, leaving out the internal workings. Think of it as a contract – it defines what functionality is available for others to use without exposing the underlying complexity. It's designed to help maintain a clean and stable public interface.

## Interface IHistoryAdapter

This interface lets you manage a record of conversations between AI agents. Think of it as a way to store and retrieve the back-and-forth of an interaction.

You can add new messages to the history using the `push` method, specifying the message content, a client identifier, and the agent's name. To retrieve the most recent message, use `pop`, which removes it from the record. 

If you've finished with a specific conversation, `dispose` lets you clear its history. 

Finally, `iterate` provides a way to step through all the messages within a conversation’s history, one at a time.

## Interface IHistory

This interface helps track the sequence of messages exchanged with an AI model, whether it's a conversation with a specific agent or raw model usage. You can add new messages to the history using the `push` method, and retrieve the most recent message with `pop`. If you need to prepare the history for a particular agent, `toArrayForAgent` formats the messages based on the agent's prompt and system instructions. For simply getting all the messages in their original form, use `toArrayForRaw`.

## Interface IGlobalConfig

This configuration file acts as the central control panel for the AI agent swarm system, influencing everything from how tools are called to how errors are handled.

Think of it as a set of customizable settings that dictate how the system behaves. You can tweak these settings to fine-tune the swarm's performance and adapt it to specific needs.

**Error Handling & Recovery:**  When things go wrong with tool calls, you can choose how the system responds – whether to retry the call, reset the conversation, or use a custom approach. The `CC_RESQUE_STRATEGY` setting controls this.

**Tool Management:**  The system allows control over how tools are called and processed. You can map tool calls for different agents and define how the system validates tool parameters.

**Logging & Debugging:**  Control the level of detail in system logs, from general information to highly detailed debug output.

**Agent Behavior:**  Customize how agents handle outputs, including removing unwanted tags and transforming messages. This allows you to ensure a consistent and clean experience.

**Persistence & Storage:** Configure how the system saves and retrieves data, including embeddings and agent history.  Settings control data retention and caching behavior.

## Interface IFactoryParams

This interface lets you customize how your AI agent swarm interacts with users and handles different events. You can define what message is sent when the system needs to clear its memory, or when a tool produces an output. It also allows you to tailor the messages shown when an agent is executing a task or sending a new message back to the user, including the previous user's message in the message if needed. Essentially, it gives you fine-grained control over the communication flow within your agent swarm.

## Interface IFactoryParams$1

This interface lets you customize how your AI agents communicate during navigation. You can define specific messages or even functions to be used when the system needs to clear data, execute a task, or handle the results of a tool's output. These custom messages can include information like the client ID and the default agent, allowing for more tailored and informative interactions. Essentially, it provides a way to personalize the agent’s conversational flow.

## Interface IExecutionContext

This interface describes the shared information that different parts of the system use to keep track of a single run or task. Think of it as a common label attached to everything happening during a particular job.

It includes a `clientId` to identify the user or session, an `executionId` to uniquely mark a specific run, and a `processId` that’s like a fingerprint for the process itself. 

This shared context helps services like the client agent, performance tracking, and communication bus understand exactly what’s going on and correlate data across the entire system.

## Interface IEntity

This interface, `IEntity`, is the foundation for everything that gets stored and managed within the AI agent swarm. Think of it as the basic building block – all other persistent objects in the system inherit from it. By extending `IEntity`, different types of entities, like those tracking agent health or state, get a common structure and ensure they play nicely together.

## Interface IEmbeddingSchema

This interface helps you define how your AI agents understand and compare information within the swarm. You can configure whether the system remembers past states and agent activity, and importantly, you specify a unique name for the method used to generate these representations.

The interface lets you control how embeddings (numerical representations of text) are stored and retrieved – you can write embeddings to a cache for later use, and check if a cached embedding already exists.

You can also customize the embedding process by providing callbacks to handle specific events.  Finally, you're given functions for creating new embeddings from text and calculating how similar two embeddings are.

## Interface IEmbeddingCallbacks

This interface lets you tap into what's happening when the system generates or compares embeddings, which are numerical representations of text. You can use the `onCreate` callback to be notified whenever a new embedding is made, letting you track or adjust them as needed.  Similarly, the `onCompare` callback lets you observe how two pieces of text are assessed for similarity, providing insight into the comparison process. These hooks are great for debugging, monitoring performance, or even adding custom logic around embedding creation and comparison.

## Interface ICustomEvent

This interface lets you create and send events with any kind of information attached – it’s designed for situations where the standard event structure isn't enough. Think of it as a way to signal something specific happening in your swarm, like a custom task completion or a change in status, and include the details relevant to that event. The `payload` property holds this custom data, giving you the freedom to define exactly what information is communicated.

## Interface IConfig

This interface, `IConfig`, holds the configuration options needed to generate UML diagrams. It's a simple way to control how the diagram creation process works. Currently, the only setting you can adjust is `withSubtree`, which is a boolean value. Setting `withSubtree` to `true` will ensure that the generated UML diagram includes subtrees, providing a more detailed view of the system's structure. If it’s `false`, those subtrees will be omitted, resulting in a more compact diagram.

## Interface IComputeSchema

This interface, `IComputeSchema`, defines the structure for how individual computational tasks are described within the agent swarm system. Think of it as a blueprint for each piece of work the swarm will handle. 

It includes a short description (`docDescription`) to explain what the compute does. The `shared` flag indicates whether this compute can be reused across different clients. Each compute needs a unique `computeName` for identification, and a function `getComputeData` retrieves the actual data needed for processing. 

`dependsOn` specifies any other computes that must complete before this one can run, establishing a processing order.  `middlewares` allows for adding extra steps before or after the core computation. Finally, `callbacks` provides a way to hook into different stages of the compute's lifecycle.

## Interface IComputeParams

This interface, `IComputeParams`, provides the essential tools and context needed for a component to perform its computation within the agent swarm orchestration framework. It includes a `clientId` to identify the specific computation, a `logger` for recording events and debugging, and a `bus` for inter-component communication. Crucially, it also contains a `binding`—an array of contracts—that outlines the state changes the computation is responsible for managing and reacting to. Essentially, this interface gives the computation everything it needs to work effectively within the larger orchestrated system.


## Interface IComputeMiddleware

This interface defines how different pieces of your AI agent swarm can communicate and work together. Think of it as a standardized way for agents to hand off tasks or information to each other – like passing a message between team members. It ensures that everyone understands the format of the data being exchanged, regardless of their specific role in the swarm. Implementations of this interface handle the processing and forwarding of compute tasks within the orchestration framework. It allows for flexible workflows where tasks can be routed and modified as they move between agents.

## Interface IComputeConnectionService

This interface defines how your AI agents connect to and interact with external compute resources, like databases, APIs, or other services. Think of it as the bridge that allows your agents to access and utilize the information and functionality they need to complete their tasks.  It outlines methods for establishing connections, ensuring secure access, and handling any errors that might arise during these interactions. Implementing this interface allows your swarm to dynamically connect to various compute resources without needing to hardcode specific connection details. You'll use this to configure how your agents reach out and work with external systems.

## Interface IComputeCallbacks

This interface defines a set of optional callback functions that you can provide to customize how compute tasks are handled within the agent swarm. Think of these callbacks as hooks that let you react to different stages of a compute's lifecycle. 

`onInit` gets called when a compute is first being initialized, allowing you to perform setup tasks specific to a client and compute name. `onDispose` is triggered when a compute is being shut down, giving you a chance to clean up resources. 

`onCompute` lets you respond to the actual computation happening, receiving the data produced. `onCalculate` is invoked when a state needs to be calculated. Finally, `onUpdate` signals that a compute has been updated. By implementing these callbacks, you can tailor the framework's behavior to your specific needs.

## Interface ICompute

The `ICompute` interface defines how a compute resource can be managed within the AI agent swarm. Think of it as a blueprint for a component responsible for performing calculations or processing data.

It provides methods to trigger calculations (`calculate`), allowing you to initiate a specific computation identified by its state name. You can also use `update` to refresh the status of a compute resource, associating it with a client and a name. Finally, `getComputeData` lets you retrieve the current data associated with the compute resource, giving you a snapshot of its status and results. This data is represented by the generic type `T`, allowing for flexibility in the kind of information stored.

## Interface ICompletionSchema

This interface helps define how your AI agents within a swarm generate and manage completions, like suggestions or responses. Think of it as a blueprint for creating a specific type of completion process.

You give each completion process a unique name using the `completionName` property. 

The `callbacks` property allows you to customize what happens *after* a completion is generated – you can hook into events and tailor the behavior.

Finally, the `getCompletion` method is the core action; it takes input data and produces a completion response from your AI models, considering the context and available tools.

## Interface ICompletionCallbacks

This interface lets you define actions to take after an AI agent successfully finishes a task. Specifically, `onComplete` is a function you can provide to be notified when a task is done. This callback gives you the task's arguments and the AI model's response, allowing you to log results, process data, or start a new step in a workflow. You can use it to build in extra logic for tasks, like saving the result to a database or updating a user interface.

## Interface ICompletionArgs

This interface defines the information needed when you ask the AI agent swarm to generate a response. Think of it as a package containing everything the agent needs to understand the request. 

It includes a client identifier, the name of the agent making the request, and a way to track where the last message came from – whether it was from a user or a tool the agent is using. You're also expected to provide the conversation history, which is a list of previous messages. Finally, you can specify any tools the agent might need to use to fulfill the request.

## Interface ICompletion

This interface defines how your AI agents can get responses from a language model. Think of it as the standard way your agents request and receive information. It builds upon existing completion methods to give you a full set of tools for interacting with the language model and getting the results you need for your agents' tasks.

## Interface IClientPerfomanceRecord

This interface tracks performance details for individual clients, like user sessions or agent instances, within the overall system. It essentially provides a granular view of how each client is performing.

Each client record includes information about its memory usage, persistent state, and the number of times it has executed tasks. You're also able to see the total and average sizes of the data being sent to and from the client, as well as the total and average time it takes to complete those tasks. This data helps pinpoint performance bottlenecks specific to certain clients.

The `clientId` property uniquely identifies each client, allowing you to directly link this performance data back to a specific session or agent. Memory and state data provides a snapshot of what the client was doing during its operation. The execution metrics give you a sense of how long each task took, and how much data was processed.

## Interface IChatInstanceCallbacks

This interface defines a set of optional callbacks that you can use to monitor and react to events within a chat instance managed by the swarm orchestration framework. Think of these as hooks that let you know what's happening – whether a chat is starting, a message is sent, or an instance is being set up or shut down. You can implement these callbacks to track activity, log messages, or perform actions based on the status of the chat instances. The `onCheckActivity` callback provides updates on whether a client is active and when their last activity was.  `onInit` and `onDispose` notify you when a chat instance is created and destroyed respectively, while `onBeginChat` signals the start of a conversation and `onSendMessage` lets you know when a message has been transmitted.

## Interface IChatInstance

This interface, `IChatInstance`, represents a single chat session within your agent swarm. Think of it as a container for a conversation happening between agents.

You use `beginChat` to start a new chat. To keep the chat alive, `checkLastActivity` periodically verifies if it's still active, preventing premature closure.  `sendMessage` is how you feed content into the chat, and it returns the agent's response. When a chat is no longer needed, `dispose` gracefully shuts it down. Finally, `listenDispose` lets you be notified when a chat is being cleaned up.

## Interface IChatControl

This API lets you configure how your AI agents communicate. You can tell the system which class to use for handling chat interactions, essentially defining the foundation for how agents exchange messages. Furthermore, you can customize what happens during chat events by providing callback functions, allowing you to react to specific moments in the conversation flow and build in custom behaviors.

## Interface IChatArgs

This interface, `IChatArgs`, defines the information needed to pass a message to an AI agent within the swarm orchestration framework. Think of it as a standardized package for sending a chat request. It includes a `clientId` to identify the source of the request, the `agentName` indicating which agent should handle the communication, and the actual `message` content that's being sent. Essentially, it's all the details necessary to route and process a chat interaction.

## Interface IBusEventContext

This interface provides extra information about events happening within the AI agent swarm. Think of it as a way to tag events with details about which agent, swarm, or other system components are involved.

Typically, when an agent is sending an event, only the `agentName` is filled in, which simply identifies the agent sending the message. However, other fields like `swarmName`, `storageName`, `stateName`, `computeName`, and `policyName` become useful for system-wide events or when tracking activity at a higher level, such as within a particular swarm or related to a specific policy. Each of these fields provides a unique identifier for a component participating in the event, helping to provide a richer understanding of what’s happening.

## Interface IBusEvent

This interface defines the structure of messages sent through the system's internal communication bus. Think of it as a standardized way for different parts of the system, especially the agents, to talk to each other and share information.

Each message has a clear origin, identified by its `source`.  It also has a `type` which tells other components what the message is about—like notifying the system a task is starting or sharing a tool’s output.

Along with the core information, messages can carry `input` data needed to perform an action or `output` data representing the result of an action.  Finally, a `context` section provides extra information, like the agent that sent the message. This helps keep track of who did what and allows for more informed responses across the system.

## Interface IBus

The `IBus` interface provides a way for different parts of the system, especially agents, to send updates and information to specific clients. Think of it as a central messaging system.

Agents use the `emit` method to broadcast events like message commits, tool executions, or completed runs to a designated client.  Each event follows a standard format, including details about its origin, data, and intended recipient. This ensures everyone on the system receives the information they need in a consistent way.

The `emit` method always targets a specific client ID, making sure the information reaches the right place.  It’s primarily used for notifications—for example, informing clients about changes or the results of actions—and the process is asynchronous, meaning events are handled efficiently behind the scenes. The `clientId` field is repeated in the event itself, which can be helpful for confirming the message was intended for the correct client. Events must adhere to a defined structure, ensuring consistency and allowing for easier processing.

## Interface IBaseEvent

This interface lays the groundwork for all events happening within the AI agent swarm. Every event, no matter its purpose, will have at least a `source` and a `clientId`. The `source` tells you where the event came from within the system, like a specific agent or service. The `clientId` ensures that the event is delivered to the correct client or agent instance – think of it as an address for the event. This common structure allows different parts of the system to communicate using a standardized event-driven approach.

## Interface IAgentToolCallbacks

This interface lets you listen in on what an agent tool is doing and react to different stages of its use. 

You can get notified before a tool runs ( `onBeforeCall` ), giving you a chance to prepare or record the action about to happen. 

After the tool finishes, `onAfterCall` lets you clean up or process the results. 

If you want to check if the tool's inputs are correct before it even starts, use `onValidate`. 

And if something goes wrong during tool execution, `onCallError` lets you handle the error and potentially recover.

## Interface IAgentTool

This interface describes a tool that an AI agent can use, building upon a more general tool definition. Each tool has a name to identify it within the system and an optional description to help users understand how to use it.

Before a tool runs, a validation step checks if the provided inputs are correct. This validation can be simple or complex, handled synchronously or asynchronously.

You can also add custom actions that are triggered at different points in the tool's lifecycle, like before or after execution.

Finally, the `call` method is how you actually tell the tool to run, providing the necessary information about the agent, client, and the parameters it needs.

## Interface IAgentSchemaCallbacks

This interface lets you hook into the lifecycle of an AI agent, providing opportunities to respond to key events as it runs. You can set up functions to be notified when an agent starts, finishes a task, generates output, receives messages, or undergoes initialization and disposal. These callbacks give you a way to monitor agent activity, log important information, or react to specific situations that arise during execution, allowing for greater control and insight into how the agents are behaving. You can also receive notifications when tools within the agent produce results or when the agent's history is cleared.

## Interface IAgentSchema

This interface defines the blueprint for configuring an agent within the swarm system. It specifies what an agent *is* and how it behaves.

You'll find settings here to control its name, the core prompt that guides its actions, and any system prompts it uses, particularly for tool usage.  You can limit the number of tools it can use in a cycle, and optionally provide descriptions for easier understanding.

For agents that need to hand off conversations to human operators, there's a special connection function.  The configuration also includes arrays to specify the tools, storage, and other resources the agent can access.

There are numerous optional settings for customizing the agent's behavior, including functions to validate and transform output, map messages, and to define callbacks that trigger at various points in the agent's lifecycle.  You can even specify other agents this one relies on.


## Interface IAgentParams

This interface defines the setup information given to each agent within the system. Think of it as a configuration package that equips the agent with everything it needs to operate. 

It includes things like a unique client ID for identification, a logger to record what’s happening, and a communication bus to talk to other agents. The agent also receives access to tools it can use, a history tracker for past interactions, and a way to generate responses. 

Finally, there's a validation function that checks the agent's output before it's considered final.

## Interface IAgentNavigationParams

This interface helps you define how an AI agent should move between different tasks or agents within a larger system. Think of it as a set of instructions telling the agent where to go and what it's supposed to do when it gets there. You specify the tool's name and provide a clear description of its purpose. The `navigateTo` property identifies the specific agent the current one should interact with next, and a `docNote` allows for extra documentation. Finally, `skipPlaceholder` lets you control the output when multiple navigation steps are involved.

## Interface IAgentConnectionService

This interface helps us make sure the public parts of our agent connection service are clearly defined and consistent. It’s essentially a blueprint, used to create a version of the service that only shows the features users should interact with, hiding the inner workings. Think of it as a way to create a clean, user-friendly view of a more complex system.

## Interface IAgent

This interface outlines how you interact with individual agents within the swarm. Think of it as a blueprint for what an agent *can do*.

The `run` method lets you quickly test an agent's capabilities with a given input without affecting its memory or past conversations.  `execute` is the main way to get an agent working, and it determines whether the agent will remember the interaction. `waitForOutput` simply retrieves the agent's completed response.

You can also manage the agent’s internal state using methods like `commitToolOutput` to record the results of tools it uses, or `commitSystemMessage` to inject instructions. `commitUserMessage` and `commitAssistantMessage` let you add messages to the agent’s history without initiating a full response cycle.  Finally, `commitFlush` lets you completely reset the agent’s memory, while `commitStopTools` and `commitAgentChange` provide ways to control the flow of its tool execution and overall operation.
