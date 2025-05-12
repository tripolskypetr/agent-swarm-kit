# agent-swarm-kit api reference

![schema](../assets/uml.svg)



---
title: docs/internals
group: docs
---

# agent-swarm-kit classes

## Class WikiValidationService

This service helps ensure your wikis conform to specific structures. You can think of it as a gatekeeper for your wiki data.

First, you tell the service about the wikis you’re tracking, defining their expected formats using the `addWiki` function. This function registers a new wiki and associates it with a schema. 

Then, when you have content you want to integrate, you use the `validate` function. This checks if the content matches the defined wiki schema, providing a way to catch potential errors early on. The service also uses a logger to help track what’s happening during validation.


## Class WikiSchemaService

The WikiSchemaService helps manage and organize your wiki schemas, acting as a central hub for working with them. It's designed to keep track of different schema versions and ensure they meet basic requirements.

You can register new schemas, replace existing ones with updated information, and easily retrieve a specific schema when you need it. The service also has a built-in context manager to help with schema-related operations, such as validation. Think of it as a librarian for your wiki schemas, keeping everything neatly organized and accessible.

## Class ToolValidationService

This service is responsible for making sure the tools your agents use are correctly configured and registered within the swarm. It keeps track of all the tools and their details, preventing duplicates and ensuring everything is set up properly. 

It works closely with other parts of the system like the tool registration service and the agent validation process. 

You can add new tools to the system using the `addTool` function, which logs the addition and prevents the same tool from being registered multiple times. The `validate` function then confirms a tool is registered before it's used, speeding up the process with caching to avoid redundant checks. The service also logs important actions and errors to help with debugging and monitoring.

## Class ToolSchemaService

This service acts as a central place to define and manage the tools that agents use within the system. It's like a catalog of available actions agents can take.

You can register new tools, update existing ones, and retrieve them by name. Before a tool is added, it's checked to make sure it has the basic structure needed to work correctly.

This service works closely with other parts of the system, such as the agent connection service and schema service, to ensure agents are properly equipped with the tools they need to perform their tasks. It also keeps a record of these tools, allowing for logging and tracking of usage.

## Class ToolAbortController

This class helps you control and manage operations that might need to be stopped prematurely, like when an AI agent needs to pause or cancel a task. It essentially provides a simple way to create and use the standard `AbortController` functionality.

If your environment doesn't natively support `AbortController`, this class gracefully handles that by making sure everything still works smoothly.

You can use the `abort` method to signal that an operation should be stopped, which will notify any parts of your code that are listening for this signal.

## Class SwarmValidationService

The SwarmValidationService acts as a central guardian for your swarm configurations. It keeps track of all registered swarms and makes sure they're set up correctly, ensuring things like unique swarm names, accurate agent lists, proper default agents, and correct policies are in place.

Think of it as a quality control system; it works closely with other services to manage swarm operations, agent details, policies, and session information. To help things run smoothly, it uses a smart caching system to speed up validation checks.

You can use this service to register new swarms, retrieve lists of agents and policies associated with specific swarms, or to thoroughly validate an entire swarm setup. It logs all its actions to help with troubleshooting and monitoring.

## Class SwarmSchemaService

This service acts as a central place to manage the blueprints for your AI agent swarms. Think of it like a library of swarm configurations, where each configuration defines things like the agents involved, their roles, and any associated policies.

It keeps track of these configurations using a registry, ensuring each one is structurally sound before it's used. This service works closely with other components to make sure your swarm configurations are consistent and can be used effectively.

You can register new swarm configurations, update existing ones, and retrieve them when needed. The service also logs its activities to help you monitor and troubleshoot your swarm operations. Basically, this is the foundation for setting up and running your AI agent swarms, ensuring they're properly defined and ready to work together.

## Class SwarmPublicService

This class acts as the main entry point for interacting with a swarm of AI agents. It provides a public API to control and observe the swarm’s actions, ensuring everything happens within a specific client and swarm context. Think of it as a helpful intermediary that manages requests to the underlying swarm services, adding logging and context awareness along the way.

It allows you to send messages to the session, navigate between agents, cancel or wait for output, and get information about the current agent. You can also manage agents directly and safely dispose of the swarm when it's no longer needed. Everything is done while keeping track of who’s doing what and why, allowing for better monitoring and debugging. It is designed to be used by different components like the agent execution engine and agent management tools.

## Class SwarmMetaService

The SwarmMetaService helps manage information about your agent swarms and translate that information into easy-to-understand diagrams. It essentially builds a structured representation of your swarm's components and relationships, then converts that structure into a UML diagram – a visual way to depict the swarm's architecture.

This service relies on other parts of the system to gather information, like the schema definitions and agent details.  It creates these diagrams by first constructing a tree-like representation of the swarm and then using that tree to generate the UML output. If logging is enabled, it records these operations for troubleshooting and understanding how the system works.  The resulting UML diagrams can then be used for documentation or to get a clearer picture of your swarm’s design.

## Class SwarmConnectionService

This class acts as a central hub for managing connections to and operations within a swarm of AI agents. Think of it as a conductor orchestrating a team of specialized agents working together. It intelligently reuses connections to swarms, preventing unnecessary overhead and ensuring efficiency.

It utilizes several other services to manage agents, configurations, and communication – similar to how different departments in a company collaborate. It efficiently retrieves and manages agent configurations, handles agent execution, and emits messages.

Key functionalities include retrieving agents, controlling output streams, managing navigation within a swarm, and properly cleaning up connections when finished. This component is designed to be robust and reliable, ensuring smooth communication and coordination between clients and the swarm of agents. It’s built to be flexible, integrating seamlessly with various other parts of the system.

## Class StorageValidationService

This service acts as a guardian for your swarm’s storage configurations. It keeps track of all registered storage locations and their setups, making sure each one is unique and properly configured. 

It works closely with other services to ensure everything is working correctly – registering new storage locations, managing storage operations, validating agent storage, and checking embedding configurations. 

You can use it to register new storage locations and, most importantly, to validate that a specific storage location exists and is set up correctly. The validation process is designed to be fast and efficient.

## Class StorageUtils

This class provides tools for managing data storage associated with specific clients and agents within the swarm. Think of it as a way to organize and control what data each agent holds for each client.

You can use it to retrieve a limited number of items based on a search term, insert or update data, delete individual items, or retrieve a single item by its ID.  It also lets you list all the data stored for a client and agent, optionally filtering the results.

If you need to quickly understand the size of the data stored, you can generate a numeric index for a particular client and agent's storage.  Finally, there’s a way to completely clear all data associated with a client and agent’s storage. Before any action takes place, the system verifies that the client is authorized and the agent is properly registered to use the storage.

## Class StorageSchemaService

This service acts as a central place to manage how different parts of the system store and retrieve data. It keeps track of storage schemas, ensuring they are set up correctly and consistently.

Think of it as a librarian for storage configurations – it registers new ones, updates existing ones, and provides access to them when needed. This helps different components like client storage and agent execution all work together seamlessly.

Before a new storage setup is added, it performs a quick check to make sure it’s structurally sound.  The whole process is logged to help with debugging and monitoring. This service is essential for configuring storage for agents and other parts of the system, ensuring they function properly.


## Class StoragePublicService

This service manages storage specifically for individual clients within the swarm system. Think of it as a way to keep client data separate and organized. It builds upon the core storage functionality but ensures that operations are tied to a particular client.

It provides common storage actions – retrieving, updating, deleting, listing, clearing, and releasing – all while keeping track of what's happening for each client. This is essential for things like storing and retrieving client-specific information during task execution, documenting storage schemas, and tracking storage usage for performance analysis.

The service relies on other components like logging and performance tracking, and it works closely with the ClientAgent to handle client-specific data. It’s important to note that this service handles *client-specific* storage, distinct from the system-wide storage managed by a separate service.

## Class StorageConnectionService

This service manages how your agents interact with different types of storage within the system. Think of it as a central hub that figures out where your data lives and makes sure agents can access it efficiently. It cleverly caches storage connections to avoid unnecessary setup, and knows whether a storage area is specifically for one agent or shared among many.

When an agent needs to read, write, or delete data, this service handles the details, often delegating to other specialized services for things like shared storage or tracking usage. It also keeps a record of which storage areas are shared to prevent accidental cleanup of resources that are used by multiple agents.

Key features include:

*   **Efficient Storage Access:** It intelligently caches storage connections to speed up things.
*   **Handles Both Private & Shared Storage:**  It manages storage specific to a client and also handles shared storage.
*   **Centralized Management:** It acts as a single point for controlling how agents interact with storage.
*   **Logging and Tracking:** It logs actions and tracks storage usage to ensure accountability and optimize performance.

## Class StateValidationService

This service helps manage and ensure the correctness of data representing the state of your AI agents. Think of it as a quality control system for agent states. 

You can define different state types and their expected structures using the `addState` function. This lets the system know what data it should be looking for. 

The `validate` function then checks if a particular state's data conforms to the defined structure, ensuring your AI agents are operating with consistent and reliable information. The `loggerService` property lets you hook into logging to monitor validation activity. The `_stateMap` property holds the defined state schemas internally.

## Class StateUtils

This class helps manage information specific to each client and agent in the swarm. Think of it as a tool to access, update, and reset data associated with a particular client's interaction with a specific agent.

You can use it to fetch existing data for a client and agent, allowing you to see what's already known about their interactions. It also lets you set new data—either directly or by calculating it based on what's already there. Finally, it provides a way to completely reset a client's data for a specific agent. The system makes sure you’re authorized to perform these actions and keeps track of everything for monitoring.

## Class StateSchemaService

This service acts as a central hub for managing the blueprints of how agents store and use data within the swarm. Think of it as a library of standardized data structures.

It keeps track of these data structures, ensuring they are consistent and valid.  It uses a special registry to organize them and makes them accessible to other parts of the system.

When a new data structure is added or an existing one is updated, this service validates it to make sure everything is set up correctly.  It also keeps a log of these changes.

Other services like those managing agent connections, agent schemas, and the public state API all rely on this service to get the correct and validated data structure definitions. This ensures agents are using data in a predictable and reliable way.

## Class StatePublicService

This service helps manage state specifically tied to individual clients within the system. Think of it as a way to keep track of information unique to each client, differentiating it from system-wide settings or persistent storage.

It provides methods for setting, clearing, retrieving, and cleaning up this client-specific state. When you need to update or access a client’s data, this service acts as the go-between, ensuring everything happens in a controlled and logged way, if logging is enabled.

The service works hand-in-hand with other components like ClientAgent, PerfService, and DocService, providing a consistent approach to handling client state throughout the system. It's designed for situations where you need to track and manage data that’s particular to a specific client’s interaction.

## Class StateConnectionService

This service manages the connection and lifecycle of state within your agent swarm system. Think of it as the central hub for how different parts of the system remember and use data associated with a specific client and a named state. 

It intelligently reuses state information to avoid unnecessary overhead – if the same state is needed again, it pulls it from a cached version instead of recreating it. 

When a part of the system needs to update the state, this service handles the process, ensuring updates are safe and coordinated.  It works closely with other services like the logger and schema service to manage configurations, track usage, and maintain overall system health. 

Finally, when the system is finished with a specific state, this service cleans up and releases resources – although shared states are handled separately. It's designed to be the single point of contact for client-specific state management.


## Class SharedStorageUtils

This class provides a set of tools for working with shared storage across your agent swarm. Think of it as a central hub to manage the information your agents need to share.

You can use it to fetch data based on search terms and a specified number of results, or to add or update information in the shared storage. It also lets you delete specific items, retrieve them individually, list all items (optionally with filters), and even completely clear a storage area. Each operation is carefully managed to ensure data integrity and proper logging.

## Class SharedStoragePublicService

This service manages how different parts of the system interact with shared storage, providing a public-facing way to store and retrieve data. It acts as a middleman, using other services to handle the actual storage operations while keeping track of what's happening and ensuring security.

You can use it to retrieve lists of items based on search terms, add or update individual items, remove items, get a single item by its ID, list all items, or clear the entire storage.  It’s designed to be flexible, allowing different components like client agents and performance tracking systems to work with shared data.  Important operations are logged for debugging and monitoring, controlled by a system-wide setting.

## Class SharedStorageConnectionService

This service manages shared storage connections for the agent swarm system, ensuring all clients work with the same storage instance. Think of it as a central hub for data accessible across your agents.

It efficiently handles storage operations like retrieving, creating, updating, and deleting data. It remembers which storage instances it has already created to avoid unnecessary overhead.

Several other services work together with this one: a logger for tracking activity, a bus for broadcasting storage-related events, and schema services for handling storage configuration and embedding functionality.

The `getStorage` method is key – it's how you access the shared storage. `take`, `upsert`, `remove`, `get`, `list`, and `clear` are the standard methods for interacting with the data within that shared storage, behaving similarly to how you’d work with individual agent storages.

## Class SharedStateUtils

This class provides easy-to-use tools for agents to share information within the swarm. You can use it to fetch existing shared data, update it with new values or calculations, and even completely reset it. Think of it as a central whiteboard where agents can leave messages for each other – this class helps manage those messages safely and reliably. The methods are designed to be straightforward, handling the underlying complexity of the swarm’s shared state service so agents can focus on their tasks.

## Class SharedStatePublicService

This service provides a way to manage and interact with shared data across your AI agent swarm. Think of it as a shared whiteboard where different parts of your system can read and update information. It lets you set, clear, and retrieve this shared data, ensuring different agents have access to the same context.

The service carefully tracks these operations, logging them when enabled, and makes sure they’re properly scoped within the system. It's a key component for coordinating actions and maintaining consistency between agents, especially in scenarios like updating agent status, tracking performance metrics, or managing execution steps. Different parts of the system – like agent executors and performance tracking – rely on this service for reliable state management.

## Class SharedStateConnectionService

This service manages shared data across different parts of the system, like agents and clients. Think of it as a central place where everyone can access and update the same information, ensuring everyone's on the same page. 

It keeps track of these shared data instances, making sure there’s only one version being used, and it's designed to be efficient by reusing existing instances whenever possible. Updates to the shared data are handled carefully to avoid conflicts and ensure accuracy.

You can retrieve the current state, update it using a function that transforms the previous state, or completely reset it. The service also logs its actions for debugging and monitoring, and integrates with other services to manage configurations and events related to the shared data. Essentially, it provides a safe and controlled way to share and synchronize data across the entire system.

## Class SharedComputeUtils

This utility class, `SharedComputeUtils`, helps manage and interact with shared computing resources in your AI agent swarm. 

Think of it as a central place to check on and refresh the status of these shared resources. 

The `update` function allows you to trigger a refresh or update for a specific compute resource, ensuring your agents are using the latest information. 

The `getComputeData` function provides a way to retrieve data about a particular compute resource, identified by a client ID and the compute's name. This allows your agents to easily get the information they need to operate.

## Class SharedComputePublicService

This component handles interactions with a shared compute resource, acting as a bridge between your agents and the underlying computation infrastructure. It uses a logger to keep track of events and relies on another service to manage the actual connection to the shared compute.

You can use `getComputeData` to retrieve information about a specific computation. The `calculate` function triggers a calculation on the shared compute, using a given method and computation name. Finally, `update` lets you refresh the state of a particular computation.

## Class SharedComputeConnectionService

This service helps manage connections to shared computational resources, allowing different AI agents in your swarm to work together and share data. It acts as a central hub, providing a way to access and interact with these shared resources. 

Think of it as a librarian, providing access to pre-built computational "books" (compute resources) based on their names. You can request a specific compute resource, and this service will fetch it for you, keeping track of previously retrieved resources to avoid unnecessary loading.

You can also ask this service to refresh the data from these shared resources and trigger updates to the underlying computational processes. The service relies on other components for logging, message passing, context management, shared state handling, and schema management, ensuring everything runs smoothly.

## Class SessionValidationService

This service keeps track of sessions within your system, making sure everything is consistent and resources are used correctly. It acts like a central record-keeper, associating sessions with swarms, agents, storage, states, and histories.

Think of it as a librarian for your agent sessions. When an agent starts working, this service logs it and notes what it’s using (storage, agents, history, etc.). When the agent finishes, it cleans up those records.

It uses a logger to keep track of its actions and relies on other services like those managing agents, storage, and swarms.  It's designed to be efficient, remembering validation checks to avoid unnecessary work.

Here's a breakdown of what it does:

*   **Registers Sessions:**  It keeps a list of all active sessions and their settings.
*   **Tracks Resource Usage:**  It monitors which agents, storage, states and compute are being used by each session.
*   **Validates Sessions:** It quickly verifies if a session exists, saving time.
*   **Cleans Up:**  It removes sessions and associated resources when they're no longer needed.

Essentially, it’s a vital component for managing and organizing your agent swarms and ensuring everything runs smoothly and safely.

## Class SessionPublicService

This service acts as a bridge for interacting with sessions within the swarm system, providing a public-facing API that's built on top of other services. Think of it as a carefully wrapped package that manages how different parts of the system communicate during a session.

It handles everything from sending messages and executing commands to tracking performance and cleaning up resources.  Crucially, it adds extra layers of context and logging around those actions, making sure everything is tracked and done in a consistent way.

Each method provided, like `execute`, `run`, or `commitToolOutput`, essentially takes a request and passes it on to the underlying session connection service, but with added safety and traceability. This makes the whole process more reliable and easier to understand. The service also makes sure that messages and events are emitted correctly across the different components of the swarm.

## Class SessionConnectionService

The `SessionConnectionService` is the central manager for handling interactions within a swarm system's sessions. Think of it as the gatekeeper and coordinator for any activity happening in a session, which is a specific workspace for a client interacting with the swarm.

It keeps track of active sessions using a clever caching system, so it avoids creating unnecessary duplicates and maximizes efficiency. When a session needs to be created or accessed, it retrieves it from this cache.

This service handles a wide range of operations: sending notifications, executing commands, running stateless processes, and establishing connections. It's also responsible for coordinating with other services like policy enforcement, swarm configuration, and performance tracking, ensuring that everything runs smoothly and securely within the session’s context. Essentially, it's the backbone that connects clients to the power of the swarm, managing every step of their interactions. It provides consistent APIs for operations like executing commands, sending messages, and handling tool outputs, mirroring functionality found in related services.


## Class SchemaUtils

This class offers helpful tools for working with data associated with client sessions and for preparing data for storage or communication. It lets you easily store information linked to a specific client’s session, like their preferences or progress, and retrieve that information later. You can also use it to convert objects into strings, which is useful for things like saving data to a file or sending it over a network.  The serialization process can even be customized to reshape the data as it's being converted.

## Class RoundRobin

This class helps manage a rotating list of tasks, ensuring each one gets handled in order. Think of it like a round-robin tournament where each participant gets a turn.

It keeps track of a set of "tokens," which represent different ways to create an instance or perform a task.  It also stores the actual created instances.

The `create` method is your key tool for setting up a RoundRobin. You give it a list of tokens (like different functions or classes), and a "factory" – a function that knows how to create an instance based on each token. This returns a function that you can then call to cycle through those instances.  Each time you call that returned function, it uses the next token in the list to create and execute a task.

The system helps keep things organized and predictable when you need to distribute work evenly among multiple options.

## Class PolicyValidationService

This service helps ensure that policies used within the AI agent swarm are valid and properly registered. It keeps track of all known policies and their details, making sure no two policies have the same name. 

When a new policy is added, this service logs the action and verifies its uniqueness, working closely with the policy registration system. To speed things up, validation checks are cached, meaning frequently checked policies don't need to be re-validated every time. 

The service also logs information about its operations and any errors it encounters, and relies on another service for handling logging. Ultimately, it makes sure that policies are properly enforced by the agents in the swarm.

## Class PolicyUtils

This class offers simple tools for controlling which clients can interact with your AI agent swarm, based on rules you define. It lets you easily ban a client from participating, remove a ban to allow them back in, and quickly check if a client is currently blocked. Before taking any action, the class double-checks that everything – the client ID, swarm name, and policy name – is correct, and keeps track of what’s happening for auditing purposes. Think of it as a convenient way to manage access control for your AI agents.

## Class PolicySchemaService

This service acts as a central hub for managing the rules that govern how agents operate within the swarm. It keeps track of these rules, which define things like who is allowed to do what, and ensures they are valid before they are used.

Think of it as a librarian for policy documents – each document (policy schema) has a name, and this service stores and provides access to them. It checks that these rules are structured correctly before adding them, and keeps a record of when changes are made.

The service works closely with other components, like those responsible for enforcing policies and managing client access, ensuring everyone is following the established guidelines. It logs important actions to help track and debug policy-related issues, especially when debugging.


## Class PolicyPublicService

This service acts as a public gateway for managing policies within the swarm system. It handles requests related to client bans, data validation, and other policy-driven actions. Think of it as a controlled interface for interacting with the underlying policy enforcement mechanisms.

It leverages other services like logging and performance tracking to ensure consistent behavior and provides a way to check if a client is banned, retrieve the reason for a ban, validate incoming and outgoing data, and directly ban or unban clients from a swarm, all while respecting the overall context of the system. The service makes sure operations are logged if enabled, providing transparency into policy enforcement.

## Class PolicyConnectionService

This service is responsible for managing how policies are applied and enforced within the swarm system. It acts as a central point for things like checking if a client is banned, validating input and output data, and actually banning or unbanning clients. 

Think of it as a smart gatekeeper – it leverages cached policy information to efficiently handle requests and coordinates with other services to ensure consistent policy enforcement across different parts of the system. It also keeps a record of its actions via logging and event emission. The service is designed to be reusable and integrates seamlessly with various components, making it a cornerstone of the swarm's policy management.


## Class PipelineValidationService

This service helps ensure your AI agent pipelines are set up correctly before they start running. It acts as a safety check, verifying that the structure of your pipeline matches the expected design.

You can add pipeline definitions to this service, essentially registering the blueprints for how your AI agents should work together. The `addPipeline` method lets you register these designs.

Once a pipeline is defined, the `validate` method checks if a given source (like a configuration file) conforms to that registered blueprint. This helps catch errors early, preventing unexpected behavior and making your AI agent workflows more reliable. The service utilizes a logger to keep you informed about any validation issues it finds.

## Class PipelineSchemaService

This service helps manage and organize the blueprints for your AI agent workflows, which we call pipeline schemas. Think of it as a central place to store and retrieve these blueprints.

It uses a context service to understand the environment and validate the schemas. 

You can register new pipeline schemas, essentially adding them to the system’s library. If a schema already exists, you can override specific parts of it with new information.  Finally, you can easily retrieve a schema by its unique key when you need to use it in your agent workflows.


## Class PersistSwarmUtils

This class helps manage how your AI agents and their navigation history are saved and retrieved. Think of it as a central hub for keeping track of what agents are currently active for each user and swarm, and the path they're taking.

It allows you to easily get and set the currently active agent for a specific user and swarm, ensuring that information is saved for later use. It also tracks the sequence of agents a user has interacted with, which is helpful for understanding their workflow.

You can even customize how this data is stored, using your own storage solutions instead of the default. This gives you a lot of flexibility to adapt the system to your specific needs, whether it’s using an in-memory store or a more complex database. Essentially, it's about streamlining the process of keeping track of your AI agent swarms and how they're used.

## Class PersistStorageUtils

This utility class helps manage how data is stored and retrieved for each client within the swarm system. It allows you to associate specific data with a client's session and a descriptive storage name, like keeping track of user records or logs.

The class automatically handles creating and reusing storage instances, so you don't have to worry about creating too many. It offers a simple way to get data from storage, providing a default if nothing’s been saved yet, and equally straightforward way to save data for later use.

You can also customize how storage is handled using a special constructor, allowing for things like connecting to a database for long-term storage instead of a simpler approach.

## Class PersistStateUtils

This class provides tools for saving and retrieving information related to individual clients within the swarm system. Think of it as a way to remember specific details for each client, like their settings or ongoing tasks.

It lets you store data associated with a client (identified by a `SessionId`) and a descriptive name (`StateName`), using a flexible system that can be customized for different storage needs.  You can easily save and load this data, providing a way to restore a client's context later.

The system ensures that each named piece of data is only stored once, helping to optimize performance. You have the option to plug in your own storage mechanism if the default isn't suitable, allowing for things like in-memory storage or using a database.

## Class PersistPolicyUtils

This class helps manage how policy information, specifically lists of banned clients, is saved and retrieved for different swarms within the system. It provides simple ways to get and set these banned client lists, making it easy to control which clients can participate in a swarm.

The system is designed to avoid creating unnecessary persistence instances, reusing existing ones whenever possible.

You can even customize how this data is stored – for example, using an in-memory store instead of a database – by providing your own data persistence constructor. This allows for more specialized tracking and management of policy data.

## Class PersistMemoryUtils

This utility class helps manage how memory is saved and retrieved for each individual client within the AI agent swarm. It ensures that memory related to a specific client's session is handled efficiently and persistently. 

The class provides easy ways to store data for a client, retrieve that data later, and clean up when the session is over. You can also customize how the memory persistence works by providing your own storage mechanism. 

Essentially, it acts as a central place to handle saving and loading context and other data for each client’s ongoing interaction with the swarm.

## Class PersistEmbeddingUtils

This class helps manage how embedding data is saved and retrieved within the agent swarm. It provides tools to read and write these embeddings, allowing you to customize the storage method.

The system uses a memoized function, `getEmbeddingStorage`, to efficiently handle storage creation—it makes sure there's only one storage instance for each embedding name.  `readEmbeddingCache` lets you check if a particular embedding vector has already been computed and saved, and `writeEmbeddingCache` saves newly computed embeddings for later use.

Finally, `usePersistEmbeddingAdapter` provides a way to completely replace the default storage mechanism with your own custom solution, giving you flexibility in how embeddings are persisted, whether it's in memory, a database, or somewhere else.

## Class PersistAliveUtils

This class helps keep track of which clients are online and offline within your swarm system. It allows you to easily register a client as online or offline, and then later check their status. The system makes sure each client has its own dedicated persistence, so you aren’t wasting resources.

You can also customize how this tracking happens by providing your own persistence method. This is useful if you need to store the status in a specific place, like an in-memory cache or a database.

The `getAliveStorage` property is automatically managing the storage for each client.


## Class PerfService

The `PerfService` class is responsible for tracking and logging performance data related to client sessions within the swarm system. It gathers information like execution times, input/output lengths, and session states to produce comprehensive performance reports. 

Essentially, it works hand-in-hand with client agents (like when they execute tasks) by recording how long those actions take, how much data is being sent and received, and various status details. 

Think of it as a data collector; it pulls information from other services within the system (like validation and public services) to create detailed records of performance. It then consolidates this data into structured reports. The data collected is used to track key performance indicators such as average response times and data throughput. The service can be configured to log this data, providing valuable insights into system behavior. Finally, it allows for resetting tracking of individual client sessions.

## Class OperatorInstance

This class represents a single agent within your AI agent swarm, acting as a connection point for communication and task execution. When you create an instance of this class, you're essentially setting up a specific agent with a unique identifier (clientId) and a name (agentName). 

It allows you to subscribe to incoming answers, send notifications, provide answers back to the system, receive messages intended for that agent, and cleanly shut down the agent when it's no longer needed. Think of it as the agent’s dedicated communication channel and lifecycle management tool. 

The `connectAnswer` method sets up a way to receive answers from the agent, while `notify` allows you to send general information. `answer` is the method used to transmit responses, `recieveMessage` receives instructions, and `dispose` is used to safely release the agent's resources.

## Class NavigationValidationService

This service helps manage how agents move around within the swarm, making sure they don’t waste time revisiting the same spots. It keeps track of which agents have been visited for each client and swarm, so navigation can be more efficient.

The service uses a special technique called memoization to remember navigation routes, which means they’re readily available when needed and performance is optimized. It also works with a logging system to record navigation events, which is helpful for troubleshooting.

You can start fresh with a client’s navigation by using `beginMonit`, which clears out any existing routes. When you’re finished with a client's navigation, `dispose` allows you to clean up the stored route. The `shouldNavigate` function decides if an agent should be navigated to, preventing redundant trips.

## Class MemorySchemaService

The MemorySchemaService acts like a temporary notepad for each session within the system. It lets different parts of the swarm remember specific data related to a single session, using a simple key-value approach. Think of it as a place to store information that doesn's need to be saved permanently.

It's designed to work closely with other services – making sure session-specific memory is managed correctly and tracked for performance.  You can write data, read data, and clear the memory when a session is finished, all while keeping an eye on things with logging. 

Importantly, this isn’t a database; it's just a quick, in-memory way to hold onto session-related information that doesn't require complex storage or validation. It’s useful for components like ClientAgents to temporarily store runtime data.

## Class MCPValidationService

This service helps manage and check the structure of Model Context Protocols, or MCPs. Think of MCPs as blueprints for how different AI agents communicate. 

It keeps track of all the MCP blueprints it knows about in an internal collection. You can add new blueprints to this collection using the `addMCP` function, and you can check if a specific blueprint exists and is properly formatted using the `validate` function. A logger is also included to keep track of what's happening during these operations.

## Class MCPUtils

This utility class, called MCPUtils, helps you keep the tools available to your clients up to date. Think of it as a central place to manage software updates for everyone connected through the Multi-Client Protocol. You can use it to update tools for all clients simultaneously or, if needed, to target a specific client for an update. Essentially, it simplifies the process of ensuring all your clients are running the latest versions of the tools they need.

## Class MCPSchemaService

This service helps you manage the blueprints, or schemas, that define how AI agents share information and coordinate their actions. Think of it as a central place to store and update these blueprints. 

It lets you register new blueprints, update existing ones with new details, and easily retrieve the blueprint you need.  A logging system is built-in to track what's happening, and it uses a separate service to handle the overall context around these blueprints. Internally, it keeps track of all registered blueprints in a registry, and includes a quick way to check if a blueprint is structurally correct.

## Class MCPPublicService

This class helps you manage and use tools within a larger system called MCP. Think of it as a central hub for interacting with different tools assigned to specific clients.

You can use it to see what tools are available, check if a particular tool exists for a client, and actually run those tools with given data. It also provides a way to update the available tools, either for all clients or just for a single client. Finally, it handles cleaning up resources when you're done with a tool.

The class relies on other services for logging and managing the underlying MCP connections.

## Class MCPConnectionService

The MCPConnectionService helps manage connections and interactions with different AI models using a standardized protocol, MCP. It acts as a central point for retrieving and using tools exposed by these models.

This service uses injected components for logging, communication, accessing method context, and managing MCP schemas.  You can get a connection to a specific AI model (an MCP) through the `getMCP` function, which remembers previously used connections to improve performance.

The service provides ways to list the tools available for a client, refresh those lists, and check if a particular tool exists.  Crucially, it allows you to actually *call* a tool with specific inputs, providing a standardized way to interact with the underlying AI models.  When you’re finished, you can use the `dispose` method to clean up resources associated with a client.

## Class LoggerService

The `LoggerService` is responsible for managing and delivering log messages throughout the AI agent swarm. It provides different levels of logging – normal, debug, and informational – and ensures these messages are recorded both for the specific client involved and for system-wide monitoring.

It automatically adds helpful context to log messages, such as which method was running and what execution was in progress, making it easier to track down issues. The logging behavior is highly configurable, allowing you to control which types of messages are recorded and even swap out the main logging system at runtime.

You can think of it as the central hub for all the system's logging, providing a consistent and flexible way to monitor and debug the swarm’s operations. The ability to change the main logger gives you the power to adapt logging behavior to different scenarios, like running tests or directing logs to a particular destination.

## Class LoggerInstance

This class manages logging specifically for a client, letting you customize how and where those logs appear. You can set up callbacks to handle log messages in unique ways, and control whether logs are sent to the console. 

When you create a `LoggerInstance`, you provide a client identifier and optionally, some functions to handle different logging events. The `waitForInit` method makes sure the logger is properly set up, and it will only run once. 

The `log`, `debug`, `info`, and `dispose` methods allow you to record messages, control console output, and gracefully shut down the logger, respectively. The `dispose` method is for quick cleanup when you no longer need the logger.

## Class HistoryPublicService

This service manages how history is accessed and modified within the swarm system, providing a public interface for interacting with agent history. It's designed to work closely with other services like AgentPublicService and ClientAgent, ensuring consistent logging and context scoping.

You can use this service to add messages to an agent's history, retrieve the most recent message, convert the history into arrays for different purposes (like agent processing or documentation), and clean up the history when it's no longer needed.  It leverages logging to track these operations, and ensures that operations are performed within a specific context for better organization. The service's functionality is built upon underlying history operations and offers a convenient, controlled way to manage agent history.

## Class HistoryPersistInstance

This component is responsible for keeping a record of messages, allowing them to be saved and retrieved later. Each instance is tied to a specific client identifier.

It manages the message history both in memory and on disk, ensuring data persistence. Before using it, you're required to initialize it for a specific agent which might load previously stored data. 

You can add new messages using the `push` method, which also saves them persistently.  Retrieve messages with `iterate`, and remove the most recent one using `pop`. When you're finished, you can `dispose` of the history, optionally clearing all stored data.

## Class HistoryMemoryInstance

This class provides a simple way to keep track of messages within an agent, storing them in memory and not saving them permanently. When you create an instance, it's linked to a specific agent using a client ID, and you can optionally provide callback functions to handle events like adding or removing messages. 

The `waitForInit` method prepares the history for a particular agent. To see the messages in the history, you can use the `iterate` method, which lets you go through them one by one, potentially applying filters or extra system prompts along the way.

Adding a new message is done with `push`, and `pop` retrieves and removes the most recent message. Finally, `dispose` clears the history, either for a single agent or for all agents if needed.

## Class HistoryConnectionService

This service manages the history of interactions with individual agents within the system. Think of it as a central hub for tracking what's happened during an agent's execution, allowing us to retrieve, modify, and analyze that history.

It's designed to be efficient, using caching to avoid repeatedly creating history records for the same agent. This caching relies on the client ID and agent name to uniquely identify each history.

You can use this service to:

*   **Retrieve the history:** Get a snapshot of the agent's interaction history.
*   **Add messages:** Append new messages to the agent's history log.
*   **Remove messages:** Retrieve the last message from the agent's history.
*   **Format the history:** Convert the history into a structured format suitable for the agent to use, or for external reporting.
*   **Clean up:** Properly release resources and clear the cached history when it’s no longer needed.

It works closely with other services in the system to ensure consistent tracking, validation, and event handling.

## Class EmbeddingValidationService

This service is like a gatekeeper for embedding names within the AI agent system. It keeps track of all the embeddings that are registered, ensuring that each one has a unique name and is properly defined.

When a new embedding is added, this service registers it and makes sure it’s not already in the system. 

Whenever the system needs to use an embedding, this service verifies that it exists and has been properly registered, improving the reliability of searches and operations. It's designed to be fast and efficient, remembering past checks to avoid unnecessary work. It also keeps a log of its actions for troubleshooting.

## Class EmbeddingSchemaService

This service is responsible for managing how embedding data is structured and used within the system. Think of it as a central catalog for defining the logic behind calculating and creating embeddings – the numerical representations of data used for things like searching and comparing.

It keeps track of these "embedding schemas," making sure they are correctly formatted and available to other parts of the system, like the services that handle data storage and agent execution. When a new embedding schema is added or an existing one is updated, it performs basic checks to ensure it's set up properly.

This service works closely with other components, ensuring that the way embeddings are calculated and used is consistent across the entire swarm, especially when dealing with data storage and agent logic. It logs its actions for monitoring and debugging purposes, letting you see how embedding schemas are being managed.

## Class DocService

This class is responsible for creating documentation for your swarm system, including details about swarms, agents, and their performance. Think of it as a documentation generator that helps developers understand the system's design.

It gathers information from various services – like those managing swarm and agent definitions, performance data, and even UML diagrams – to produce Markdown files and JSON performance reports. These reports and files are organized into a structured directory system.  The process leverages a thread pool to handle many documentation tasks concurrently, and uses logging to track progress. The service will create documentation for the schema of ClientAgent and its related tools and prompts.

The `dumpDocs` function is a key function to generate all documentation. `dumpPerfomance` and `dumpClientPerfomance` generate JSON files containing performance data for the entire system and for individual clients, respectively.

## Class ComputeValidationService

This class, ComputeValidationService, helps manage and validate data for different computations within your AI agent swarm. It acts as a central hub for defining, storing, and verifying the structure of data used by these computations.

Think of it like this: you have different tasks your agents need to do, and each task requires specific data in a particular format. This service allows you to register those tasks (or "computes"), describe what data they expect, and then confirm that the data being fed to them actually matches that expected format. 

It uses internal services to handle logging, validating state, and managing the schemas for each compute. You can add new computations, get a list of all registered computations, and use the `validate` function to ensure the data you’re providing is correct before passing it on to your agents.

## Class ComputeUtils

This class, ComputeUtils, provides tools for managing and retrieving information about computational resources within the agent swarm. You can use it to update the status of a specific compute resource, identifying it by a client ID and compute name. It also lets you fetch data related to a compute resource; the type of data you receive depends on what you specify when requesting it. Essentially, it simplifies the process of interacting with and understanding the operational state of individual compute components in the swarm.

## Class ComputeSchemaService

This service helps manage and compute schema definitions used within the agent swarm. Think of it as a central place to store and work with the blueprints for how agents should behave and interact. 

It uses a logger to keep track of what's happening and relies on a schema context service to handle schema-related operations. 

You can register new schema definitions with unique keys, effectively creating reusable templates. If a definition already exists, you can override parts of it to customize behavior. Finally, you can easily retrieve registered schema definitions when needed.

## Class ComputePublicService

This class, `ComputePublicService`, provides a way to interact with compute resources within the AI agent swarm. It essentially acts as a public interface for managing and controlling these compute tasks.

Think of it as a central hub for requesting calculations, updating states, and cleaning up resources. You can use it to tell the swarm to perform specific computations (`calculate`), modify existing data (`update`), or release resources after they've been used (`dispose`).  The `getComputeData` method allows retrieving data related to computations. The system relies on a logger and another compute connection service to function properly. Finally, `dispose` method ensures proper cleanup when a compute task is finished.

## Class ComputeConnectionService

This class, `ComputeConnectionService`, acts as a central hub for managing and interacting with computational tasks within the agent swarm. It handles connecting to and retrieving compute resources, coordinating state updates, and ensuring proper validation. 

Think of it as a facilitator; it doesn't directly *do* the computations but provides the necessary links and infrastructure for other parts of the system. The service relies on several other services like logging, messaging, and schema management to function correctly. 

It offers methods to get references to specific computational units (`getComputeRef`), fetch their data (`getComputeData`), trigger calculations (`calculate`), and update the overall system state (`update`). When things are complete, you can cleanly shut down the service and release resources using the `dispose` method.

## Class CompletionValidationService

This service keeps track of all the valid names used for completions within your AI agent swarm. Think of it as a gatekeeper ensuring only registered names are used. 

It allows you to register new completion names, making sure they are unique. When an agent wants to use a completion, this service checks to see if the name is valid, and it remembers past checks to speed things up. 

This service works closely with other parts of the system, like the service that registers completion names and the one that validates agent activity, providing important checks and logging events to keep everything running smoothly.

## Class CompletionSchemaService

The CompletionSchemaService acts as a central hub for managing the logic that agents use to complete tasks. It's like a library where all the "how-to" instructions for agents are stored and organized. Before an agent can use a particular piece of logic, it's checked to ensure it's properly formatted and ready to use. 

This service is tightly connected to other parts of the system, making sure agents can be created, connected, and run smoothly. It keeps track of these instructions, allowing them to be updated and retrieved as needed. When new logic is added or existing logic is changed, this service handles it, ensuring everything remains consistent and reliable for the agents performing their work. Logging is used to track operations, providing visibility into how these instructions are managed.

## Class ClientSwarm

This class, `ClientSwarm`, is like the conductor of a team of AI agents working together. It manages the agents, keeps track of which one is currently active, and handles messages flowing between them. Think of it as a central hub that ensures everyone is on the same page.

It allows you to switch between agents, wait for their output, and navigate through a history of agent interactions.  The `ClientSwarm` handles the behind-the-scenes logistics – making sure the right agent is doing the right thing at the right time.

You can subscribe to notifications when an agent changes, or when output is ready. It also provides a way to cancel ongoing operations, guaranteeing a responsive experience.  Essentially, this class gives you a structured and controlled environment to orchestrate your AI agent interactions. The `dispose` method cleans up everything when you are finished with the swarm.

## Class ClientStorage

This class handles storing and retrieving data within the swarm system, enabling search based on data similarities. It's designed to work with other components like data connectors, embedding generators, and event buses to manage storage operations reliably.

The system keeps track of data using an internal map for quick access and uses a queue to ensure operations happen in order, preventing conflicts. It also remembers previously calculated data similarities (embeddings) to avoid redundant calculations.

You can use this class to:

*   **Store and update data:** The `upsert` method adds or updates data, while `remove` deletes items. `clear` empties the entire storage.
*   **Search for similar data:** The `take` method lets you find items similar to a given search term, using data embeddings.
*   **Retrieve data:**  `get` provides access to a specific item, and `list` retrieves all or filtered data.
*   **Manage the storage’s lifecycle:**  `dispose` cleans up resources when the storage is no longer needed.

Essentially, it’s the core mechanism for persistent data management and intelligent data retrieval within the swarm.

## Class ClientState

The ClientState class is essentially the heart of how a client interacts with and manages its piece of the larger AI agent swarm's data. It holds the current state information and provides a safe, organized way to read, write, and update it. 

Think of it as a manager for a specific piece of data; it handles incoming requests to modify that data, ensuring changes are handled in the correct order and any necessary background processes run smoothly. It also keeps track of when the data is ready and notifies other parts of the system when changes occur.

This class works closely with other components like the connection service and agent, making sure everything stays synchronized and that the data is handled correctly across the entire system. It also offers a way to clean up resources when the data is no longer needed, preventing issues down the road.

## Class ClientSession

The `ClientSession` is essentially the central hub for a client interacting with a swarm of AI agents. Think of it as a dedicated workspace for a conversation or task. It handles all the back-and-forth communication – sending messages, receiving responses, and ensuring everything is done safely and efficiently.

When you send a message, the `ClientSession` first checks if it’s valid based on defined rules. If everything's good, it uses an AI agent within the swarm to process the message. The session also keeps track of what's been said and done, storing messages and actions so you can review the history.

You can connect this session to a messaging system, allowing for real-time interaction. When the session is finished, it cleans up, ensuring resources are released properly. It provides methods to submit tool requests, system messages, and assistant responses, and offers a way to signal the agent to stop ongoing processes. Ultimately, the `ClientSession` manages the entire lifecycle of a client's interaction with the AI swarm.

## Class ClientPolicy

The ClientPolicy class acts as a gatekeeper for your AI agent swarm, managing who can interact and what they can do. It's responsible for enforcing rules regarding client access, verifying messages going in and out, and handling bans.

Think of it like this: it keeps track of banned clients, validates messages to ensure they’re acceptable, and can automatically ban clients that violate the rules. It works closely with other parts of the system, like the connection services and the message handling agents. The list of banned clients is loaded only when needed, and the system can be configured to automatically ban clients on validation failures, with the ability to customize the reason provided to the user. The class also handles removing clients from the ban list when necessary, giving you the flexibility to dynamically adjust access control.

## Class ClientOperator

The `ClientOperator` helps manage and interact with an AI agent swarm. Think of it as a central hub for sending instructions and receiving results from your agents.

It allows you to send input to the agents (`execute`) and wait for their responses (`waitForOutput`). You can also send messages – both from users (`commitUserMessage`) and from the system (`commitAssistantMessage`, though some are currently marked as not supported). 

The `ClientOperator` provides methods to handle various stages of the agent workflow, like committing tool requests and flushing data, although many of these functions are currently unavailable. Finally, the `dispose` method cleans up resources when you’re finished using the operator.


## Class ClientMCP

This component handles interacting with tools for your AI agents. Think of it as a central hub for managing and using those tools.

It keeps a record of available tools and their properties, and it cleverly caches this information to avoid unnecessary re-fetching. You can use it to see what tools are available to a specific agent, check if a particular tool exists, or refresh the tool list.

The core functionality revolves around executing tools, providing the tool name and necessary data.  It also provides a way to release resources associated with an agent when you're finished with it. Basically, it's your go-to for tool management and execution within your agent system.

## Class ClientHistory

This class manages the history of messages for a specific agent within the swarm system. It’s responsible for storing, retrieving, and shaping those messages to provide the agent with the context it needs.

It keeps track of messages and allows you to add new ones, retrieve the most recent message to potentially undo actions, and get a complete list of messages. The system can also be notified when messages are added or removed.

When getting messages for the agent to use, the system can filter them based on predefined rules and agent-specific needs, limit the number of messages included, and add initial system prompts and instructions. The history is also cleaned up properly when an agent is no longer needed.

## Class ClientCompute

This class, `ClientCompute`, manages the interaction with a compute resource within your AI agent swarm. Think of it as a dedicated controller for a specific computational task.

It's initialized with configuration parameters that dictate how it connects to and operates on the compute resource. It provides methods for retrieving data, performing calculations, updating the compute resource’s state, and cleaning up when it’s no longer needed. The `calculate` method triggers computations, while `update` handles synchronization or modification of the underlying compute. Finally, `dispose` ensures proper resource release when the client is finished.

## Class ClientAgent

This class, `ClientAgent`, is the core of the AI agent swarm orchestration framework, representing a single agent within the system. Think of it as a mini-program responsible for receiving instructions, deciding what to do (potentially involving tools), and responding.

It’s designed to handle tasks like executing user messages, running simple completions, and managing the lifecycle of tools – ensuring that these processes don't overlap and are handled correctly. It also deals with potential errors, trying to recover and continue operation.

**Here's a breakdown of how it works:**

*   **Receiving Instructions:** It receives messages (`execute`, `run`) and then decides what needs to be done, potentially calling tools or generating completions.
*   **Tool Management:** It finds, resolves, and executes tools, and handles stopping them if necessary. The `_resolveTools` method combines tools from different sources and makes sure there are no name conflicts.
*   **Error Handling & Recovery:**  If something goes wrong, the agent tries to recover gracefully, like flushing the history or trying a new completion.
*   **Communication:** It communicates with other parts of the system through various services like the history service, tool schema service, and event bus.
*   **State Management:** It uses "subjects" (similar to event listeners) to track important things like agent changes, tool errors, and when a tool has completed. This allows different parts of the system to react to these events.

Essentially, the `ClientAgent` class encapsulates all the logic required to run an agent within the swarm, ensuring it can reliably process requests, handle tools, recover from errors, and interact with the rest of the system. The `dispose` method is important to remember for cleanup operations when the agent is no longer needed.

## Class ChatUtils

This class, `ChatUtils`, manages and controls chat sessions for different clients within an AI agent swarm. It acts as a central hub for creating, sending messages to, and cleaning up chat instances.

Think of it as a coordinator – when a client needs to start a conversation (a "chat session"), `ChatUtils` handles the setup. It provides methods to begin a chat (`beginChat`), send messages (`sendMessage`), and gracefully end the conversation (`dispose`).  

You can customize how chat instances are created by setting a specific "chat adapter" or adjusting the callbacks used during the chat lifecycle. This allows for tailoring the chat behavior to different scenarios and agent swarms. The `listenDispose` method allows you to react to when a chat session is being closed.


## Class ChatInstance

The `ChatInstance` class manages a single chat session within a larger AI agent swarm. It’s essentially a wrapper around a specific conversation, identified by a unique client ID and associated with a particular swarm. When you create a `ChatInstance`, you're setting up a dedicated space for a chat to take place.

This class handles the lifecycle of the chat, including starting a session (`beginChat`), sending messages (`sendMessage`), and gracefully shutting down the chat (`dispose`). The `checkLastActivity` method periodically verifies that the chat is still active, ensuring resources aren't unnecessarily held.  You can also subscribe to disposal events to be notified when a chat is terminated using `listenDispose`. Think of it as a controlled environment for conversations between AI agents within your swarm.

## Class BusService

This class, `BusService`, is the central hub for communication within the agent swarm. Think of it as a messaging system where different parts of the system can send and receive information. It manages subscriptions to events, ensuring that only the relevant parts of the system receive specific messages.

You can subscribe to events, or even subscribe just once for a single instance of a particular event. It also allows for "wildcard" subscriptions, meaning a broader audience can receive events.

When something important happens, like the start or end of an execution, `BusService` makes sure the right people are notified. It validates that sessions are active before sending messages, logs activity for debugging, and works closely with other services to track performance and manage the overall system.  Finally, you can "dispose" of subscriptions, essentially clearing out all messages for a specific client when they's no longer needed.

## Class AliveService

The AliveService helps keep track of which clients are actively participating in your AI agent swarms. It allows you to easily tell the system when a client becomes available (online) or unavailable (offline) within a particular swarm. When you mark a client as online or offline, the system records this event and saves the status, making sure the information is retained even if the system restarts. This service uses a `PersistAliveAdapter` to handle the saving of these status changes, and it uses a logger to keep a record of all actions.

## Class AgentValidationService

This service acts as a central point for ensuring agents within the swarm system are properly configured and connected. It keeps track of all registered agents, their schemas, and how they depend on each other.

Think of it as a gatekeeper; before an agent can operate, this service checks its configuration and makes sure it has the necessary tools, storage, and connections.

Here's a breakdown of what it does:

*   **Agent Registration:** It registers new agents, maintaining a record of their configuration.
*   **Dependency Management:** It tracks dependencies between agents, making sure agents have what they need from other agents.
*   **Resource Validation:** It verifies that agents have the correct storage, wikies, states and tools they need to function.
*   **Performance:** It uses caching to make the validation process faster and more efficient.
*   **Logging:** It keeps a record of validation operations for troubleshooting and monitoring.

You can use it to retrieve lists of agents, check if an agent has a particular resource or dependency, and perform a full validation of an agent’s setup.  Essentially, it ensures the entire swarm operates smoothly and reliably.

## Class AgentSchemaService

The AgentSchemaService acts as a central librarian for agent blueprints within the swarm. It keeps track of all the agent schemas, ensuring they are consistent and valid before they’re used. Think of it as a place where the system knows exactly what each agent *is* and what it's capable of.

This service verifies that agent blueprints have the necessary components – like a name, a completion signal, and instructions – and that any dependencies or resources listed are correctly defined. When a new agent blueprint is added or an existing one is updated, the service logs these changes for tracking and troubleshooting.

It works closely with other services to help build and manage agents, including those responsible for agent connections, swarm configurations, and meta-level agent management.  Essentially, it provides the foundational information needed for the swarm to function properly.

## Class AgentPublicService

This class provides a public interface for interacting with agents within the swarm system. It acts as a middleman, delegating operations to lower-level services and adding context and logging for better control and monitoring.

Think of it as the primary way other parts of the system – or even external clients – will communicate with agents.

Key functions let you create references to agents, execute commands, run quick stateless tasks, wait for agent output, and manage the agent's history by committing messages (user, assistant, system, tool requests, and flushes). The `commit` methods are like adding entries to a log or record of the agent’s activity.

It heavily relies on logging for debugging and monitoring, which can be enabled or disabled globally.  Each function essentially wraps a core operation, adding a layer of context and logging. It helps track things like agent usage, performance, and tool executions. Finally, it provides a way to safely clean up agent resources.

## Class AgentMetaService

The AgentMetaService is responsible for understanding and representing the structure of agents within the swarm system. It takes information about each agent – like what it depends on, its states, and its tools – and organizes it into a visual representation using UML diagrams.

Think of it as a translator; it takes complex agent data and turns it into an easy-to-understand picture. This is particularly useful for documenting the system and for helping developers understand how different agents interact.

You can choose to create either a detailed view of an agent’s structure or a simpler view focusing just on its dependencies. The service also keeps track of dependencies to avoid getting stuck in loops when building these visual representations. Detailed diagrams are created by DocService, enabling you to easily generate documentation and visualize agent relationships.

## Class AgentConnectionService

This service manages the connections and operations for AI agents within the system. Think of it as a central hub responsible for creating, running, and tracking agents.

It cleverly reuses agent instances to improve efficiency, caching them based on client and agent names.  It’s deeply connected to other services within the system, handling things like logging, event emissions, agent configuration, and usage tracking. 

You can use it to:

*   **Get an agent:**  `getAgent` retrieves or creates an agent, ensuring that existing agents are reused rather than constantly recreated.
*   **Run commands:** `execute` and `run` let you give the agent instructions to process, with `run` specifically for quick, stateless responses.
*   **Commit messages:** Various `commit...` methods (like `commitToolOutput`, `commitSystemMessage`) track different types of messages (tool responses, system prompts, user input) to maintain a history of the agent's interactions. This is particularly important for OpenAI-style tool calls.
*   **Control flow:** `commitAgentChange` and `commitStopTools` provide mechanisms to influence the agent’s behavior and interrupt ongoing tasks.
*   **Clean up:** `dispose` ensures that resources used by an agent are released when it's no longer needed.

## Class AdapterUtils

This utility class simplifies how your system connects to different AI services like Cohere, OpenAI, LMStudio, and Ollama. It provides easy-to-use functions that handle the specifics of each platform’s API, so you don't have to write custom code for each one. These functions take the underlying client library for the AI service and an optional model name as input, and return a standardized function ready to generate completions. You can use this standardized function in your agent orchestration framework without worrying about the low-level API details of each provider.

# agent-swarm-kit interfaces

## Interface TAbortSignal

This interface lets you signal when an ongoing task should be stopped. It builds on the standard web API for aborting requests, allowing you to gracefully halt operations like sending data or running a process. Think of it as a way to tell a task, "Hey, you don't need to finish anymore!" You can tailor this interface to fit your application’s unique needs by adding more information or actions related to the cancellation.

## Interface IWikiSchema

This interface, `IWikiSchema`, defines the structure for how your AI agents interact with a wiki. Think of it as a blueprint for connecting to and using a wiki's information.

It includes essential details like the wiki's name (`wikiName`) and a brief description (`docDescription`) for clarity.

You can also add custom actions to the wiki using `callbacks`, allowing agents to perform specific tasks. 

Finally, the `getChat` method lets your agents directly request responses from the wiki, essentially allowing them to ask questions and receive answers.

## Interface IWikiCallbacks

This interface defines functions that you can provide to receive updates about what's happening with chat operations. Specifically, the `onChat` property lets you register a function that will be called whenever a chat interaction takes place. This allows your application to react to and potentially influence the ongoing conversation.

## Interface ITriageNavigationParams

This interface defines the information needed to set up how an AI agent navigates through different tasks. You essentially provide a name and description for each tool the agent can use. There's also a space to add extra notes for documentation, and an optional setting to help manage situations where multiple navigation options are available. It's all about giving the AI clear instructions on what tools are at its disposal and how to proceed.

## Interface IToolRequest

This interface describes what's needed to ask the system to use a specific tool. Think of it as a request form – it tells the system which tool you want to run and what information the tool needs to do its job. 

You specify the tool’s name so the system knows exactly what to execute. 

Alongside the tool name, you provide any necessary parameters, like arguments or data the tool needs to work with. These parameters are specific to each tool, so you’ll need to know what a particular tool expects.

## Interface IToolCall

This interface describes a request to use a tool within the system, acting as a bridge between what the AI model wants to do and the actual execution of that action. Each tool call has a unique ID to track it throughout the process. Right now, it only supports calling functions, specifying both the function's name and the arguments it needs. Think of it as the AI saying, "I want to run this function with these inputs," and this interface represents that request.

## Interface ITool

This interface describes what a tool looks like within the system, essentially providing a blueprint for agents to understand and use available functions. Think of it as defining the rules and structure for a tool – its category, what it does, and what inputs it expects. 

The `type` property specifies the kind of tool it is, currently limited to "function", but potentially expanding to other categories in the future. 

The `function` property contains detailed information about the tool itself, including its name, a description of its purpose, and a schema outlining the expected parameters, including their types and whether they’re required. This allows the AI model to generate appropriate calls to the tool and ensures the calls are correctly formatted.

## Interface ISwarmSessionCallbacks

This interface lets you listen in on what's happening within your AI agent swarm. You can use these callbacks to track when new agents connect, when commands are run, or when messages are sent between them. It’s like having a notification system for your swarm's activity, allowing you to log events, perform initial setup, or react to specific actions. You'll be notified when a session starts, when it ends, and when data is actively being processed.

## Interface ISwarmSchema

This interface describes the blueprint for how a swarm of AI agents is set up and managed. It lets you define the swarm's name, the list of agents it contains, and which agent should be active by default. 

You can also specify how the swarm remembers its path and agent state – optionally saving this information for later use. This blueprint allows customization through callbacks, so you can trigger actions at different points in the swarm's lifecycle, and provides a space for documentation to explain how the swarm functions. It even allows setting up access control rules or "banhammers" to manage the swarm’s behavior.

## Interface ISwarmParams

This interface defines the settings needed to start up a group of AI agents working together – a swarm. Think of it as the blueprint for configuring the swarm's environment.

It requires a unique identifier for the client launching the swarm, a way to log activities and potential problems, a communication channel for agents to talk to each other, and a list of the individual agents that will be participating. Essentially, it’s all the information the system needs to get the swarm up and running.


## Interface ISwarmDI

This interface acts as a central hub for all the core services within the AI agent swarm system, providing access to essential functionalities. Think of it as a toolbox containing everything needed to manage and interact with the swarm.

It bundles services for documentation, event-driven communication, performance monitoring, component health tracking, logging, and context management at different levels – method, payload, execution, schema and agent. It also manages connections to various resources like agents, history, sessions, storage, state, policies, compute, and wikies.

Beyond connections, it offers services for defining and validating schemas for agents, tools, swarms, completions, embeddings, storage, state, policies, compute, and pipelines. Public APIs are exposed for interacting with these services, alongside metadata management and data validation ensuring system stability and accuracy. Essentially, it's the foundation for a well-organized and functional AI agent swarm.


## Interface ISwarmConnectionService

This interface helps us define how external systems interact with the AI agent swarm. Think of it as a blueprint for the public-facing connection service, ensuring that only the intended operations are exposed. It's used to create a specific type of connection service, stripping away any internal details that aren't meant for outside use, and guaranteeing consistency in how the swarm is accessed.

## Interface ISwarmCallbacks

This interface lets you listen in on important events happening within your AI agent swarm. Specifically, it tells you when a particular agent becomes the "active" one, identifying it by its client ID, name, and the swarm it belongs to. Think of it as a notification system that keeps you informed about which agent is currently leading the charge in your swarm's activities. You can use this information to update your application's display or track the flow of control.

## Interface ISwarm

This interface lets you interact with a group of AI agents working together as a swarm. You can use it to control which agent is currently active and to get output from them. 

It allows you to retrieve the name or the actual agent object that's currently handling tasks. If an agent is performing an action, you can wait for its result. If you need to stop a task in progress, you can cancel the output. The interface also lets you register and update agent references, and send messages to the swarm's communication channel. Finally, you can manage the order of agents to be used in navigation.

## Interface IStorageSchema

This interface describes how a storage component functions within the agent swarm. It defines characteristics like whether data is saved persistently, provides a description for documentation, and indicates if the storage is accessible by all agents. You can customize how data is retrieved and saved by providing your own functions for those actions.  The `embedding` property specifies the method used to organize the data, and each storage has a unique `storageName`. Optionally, you can register lifecycle callbacks for specific storage events. The `createIndex` method allows you to generate a unique identifier for each item stored, crucial for efficient searching.

## Interface IStorageParams

This interface defines how your application interacts with the system's storage. It’s responsible for managing where data is kept and how embeddings (numerical representations of text) are handled.

You’ll provide a client ID to identify your application's data, and the interface handles creating, retrieving, and storing embeddings. The `calculateSimilarity` function lets the system compare these embeddings to find related information.

The interface also includes tools for caching computed embeddings so the system doesn’t have to re-calculate them repeatedly, and a way to log activity and communicate with other parts of the AI agent swarm. Finally, it allows you to specify the name of the storage being used.

## Interface IStorageData

This interface describes the basic information held within our system's storage. Every piece of data saved will have a unique `id`, which acts like a name tag to easily find and manage it later. Think of it as the primary key for identifying each stored item.

## Interface IStorageConnectionService

This interface helps define how your system connects to storage, making sure the public-facing parts of that connection are clearly outlined. It's a way to specify the essential storage connection functions, while keeping internal details separate. Think of it as a blueprint for a storage connection, focused on what users and external systems need to interact with.

## Interface IStorageCallbacks

This interface lets you listen in on what's happening with your storage system. You can use it to react to changes—like when data is added, removed, or modified—and to be notified when the storage is first set up and later cleaned up. It also provides a way to monitor search operations. Think of these callbacks as events you subscribe to, enabling you to track the storage's lifecycle and respond to specific actions.

## Interface IStorage

This interface lets your AI agents easily manage and work with data stored within the system. You can use it to find specific pieces of information by searching for keywords, adding new data or updating existing entries, and removing items that are no longer needed. It also provides ways to retrieve individual items by their unique ID, list all stored data (potentially with filters), and completely empty the storage when necessary. The system handles updating indexes and persisting changes automatically, simplifying data management for your agents.

## Interface IStateSchema

This interface describes how a piece of information, or "state," is managed within the agent swarm. It lets you define if that state should be saved persistently, provide a description for documentation, and control whether it’s accessible by multiple agents. 

You can specify a function to create the initial state value, or a function to retrieve the current state, falling back to the initial value if needed. Similarly, you can define a function to update the state. To further customize behavior, you can add functions to process the state as it changes or register callbacks to respond to specific state events. Finally, it allows you to chain middleware functions to further customize the lifecycle of your state.

## Interface IStateParams

This interface defines the information needed to manage a state within our agent swarm system. Think of it as a container for essential details about a particular state, allowing it to operate correctly. It includes the unique identifier for the client using the state, a logger to track what’s happening, and a communication channel (the bus) to talk to other parts of the swarm. Essentially, it's how we ensure each state knows who's using it, can report issues, and can coordinate with the rest of the agents.

## Interface IStateMiddleware

This interface defines a way to step into the process of managing the agent swarm's internal state. Think of it as a customizable checkpoint where you can inspect or change the data being used to coordinate the agents. It lets you add your own logic to ensure the state is always in a valid or desired condition before the swarm moves on to the next step. You can use this to enforce rules, log changes, or prepare the data in a specific way.

## Interface IStateConnectionService

This interface helps define how different parts of the system connect and share information about the state of the AI agents. Think of it as a blueprint for establishing reliable communication pathways. It's designed to ensure the external, public-facing components of the system have a clear and consistent view of the agent’s state, without exposing any internal workings. By using this interface, we guarantee that the public-facing services interact with the state connection service in a predictable and controlled way.

## Interface IStateChangeContract

This interface, `IStateChangeContract`, defines a way for different parts of your AI agent swarm to communicate about changes in state. Specifically, it includes a property called `stateChanged`. Think of this as a notification system—whenever something important changes within your agents or the overall swarm, this `stateChanged` property lets other parts of the system know about it and what the new state is. It uses a generic type, `TSubject<string>`, allowing it to handle various state types while ensuring the notification includes a descriptive string.

## Interface IStateCallbacks

This interface lets you listen in on important moments in a state’s life cycle. You can set up functions that run when a state is first created, when it's no longer needed, or when it’s loaded, read, or written. These callbacks provide opportunities to perform setup tasks, clean up resources, monitor activity, or react to changes in the state. Essentially, they're hooks allowing you to customize how the state behaves and get notified about its actions.

## Interface IState

This interface gives you tools to manage the agent swarm's overall condition during operation. You can check what the current state is using `getState`, allowing you to see how things are progressing. When you need to change the state, `setState` lets you calculate the new state based on the old one, making updates controlled and predictable. Finally, `clearState` provides a way to reset everything back to the starting point, like a fresh start for the swarm.

## Interface ISharedStorageConnectionService

This interface outlines the publicly accessible methods for connecting to and interacting with shared storage. Think of it as a blueprint for how different agents in your swarm can share data and information, ensuring everyone uses a consistent and safe way to do so. It specifically focuses on the core functionalities, leaving out any internal workings that aren’t intended for external use, which helps keep things organized and secure. By adhering to this interface, your agents can reliably exchange data without unexpected complications.

## Interface ISharedStateConnectionService

This interface helps define how different parts of the AI agent swarm can share information safely. It's a blueprint for creating a service that manages shared data, but specifically excludes internal workings to make sure the public-facing parts are clear and predictable. Think of it as a way to create a clean and reliable system for agents to collaborate.

## Interface ISharedComputeConnectionService

This service lets your AI agents easily connect to and use shared computing resources, like virtual machines or cloud functions. Think of it as a central hub that manages access, ensuring agents don’t need to worry about the technical details of connecting to these resources. It provides a consistent way for agents to request and utilize compute power, simplifying their interactions and promoting efficient resource allocation within your swarm. You can define different compute connection profiles, allowing agents to request specific types of resources based on their needs. Essentially, it’s designed to abstract away the complexities of infrastructure management for your AI agent swarm.

## Interface ISessionParams

This interface defines all the information needed to kick off a new session within your AI agent swarm. Think of it as the blueprint for starting a session.

It includes things like a unique identifier for the client using the session, a way to log what's happening, rules and constraints for the session, and the communication channels the agents will use. 

You'll also find references to the overall swarm managing the session and its unique name – essentially tying the session to a specific swarm environment. This provides a comprehensive package for initializing and running your orchestrated agent sessions.

## Interface ISessionContext

This interface holds all the important details about a running session within the AI agent swarm. Think of it as a container for information about who initiated the session (the client ID), which process is handling it (process ID), what task the agents are currently working on (method context), and the surrounding environment for the execution (execution context). It provides a structured way to access key metadata about the session's lifecycle and operations. You can use it to track progress, understand the origin of requests, and monitor the overall workflow.

## Interface ISessionConnectionService

This interface helps us define how a connection to an AI agent session should work from the outside. Think of it as a blueprint for creating services that manage those connections, but it leaves out the details that are only used internally. This ensures that the parts of the system that users or other services interact with are clean and focused on the core functionality of establishing and maintaining those agent session connections.

## Interface ISessionConfig

This interface defines how a session, whether it's running on a timer or has usage limits, should be configured. The `delay` property lets you specify how long the session should wait before starting or continuing, expressed as a number representing the wait time.  You can also set an `onDispose` function, which is a special callback that gets executed when the session is finished or needs to be stopped – a good place to clean up resources or perform final actions.

## Interface ISession

The `ISession` interface provides the core functionality for managing interactions within your AI agent swarm. Think of it as the central hub for a conversation or a set of tasks.

You can use it to send messages to the agents (`emit`), trigger specific actions (`execute`), and even run quick, isolated computations without impacting the main conversation history (`run`). There are also methods to inject messages directly into the session's record – whether that’s a user message, a response from an agent, or a system instruction – without triggering further processing.

The `connect` method establishes a two-way communication link for real-time interaction. Need to reset the conversation? `commitFlush` clears the agent history. You can also control the flow of tasks by preventing tool execution with `commitStopTools`. Finally, specialized methods exist for managing tool requests and outputs (`commitToolRequest`, `commitToolOutput`).

## Interface IScopeOptions

This interface, `IScopeOptions`, helps you configure the environment for your AI agent swarm. Think of it as setting up the stage for your agents to work together. 

You’ll specify a unique `clientId` to identify your application or integration and a `swarmName` to group your agents within a larger system. 

Finally, the `onError` property lets you define what happens when something goes wrong – it's your chance to handle errors gracefully and keep your swarm running smoothly.

## Interface ISchemaContext

This interface provides a central place to access different schema registries within your AI agent swarm. Think of it like a directory listing all the different kinds of tools your agents might use, but specifically focusing on their structure and expected data. Each registry, like `agentSchemaService` or `wikiSchemaService`, holds information about a particular type of tool, allowing your orchestration framework to understand what each agent is capable of and how to interact with it effectively. It simplifies managing and providing access to this vital schema information for your entire system.

## Interface IPolicySchema

This interface describes how a policy is structured within the AI agent swarm orchestration framework. It lets you define rules and manage bans for agents within the swarm.

You can configure whether ban information is saved permanently, add descriptions for documentation, and assign a unique name to each policy.  It also lets you customize the message displayed when a client is banned, or provide a function to generate dynamic ban messages. 

The framework allows you to automatically ban clients on validation failure, retrieve the current list of banned clients, or even replace the default management of banned clients.  You can also inject your own functions to perform custom input and output validation, controlling exactly how messages are assessed. Finally, optional callbacks provide a way to react to policy events and tailor the behavior of the validation and ban processes.

## Interface IPolicyParams

This interface defines the essential setup information needed to create a policy within the agent swarm. Think of it as a blueprint for configuring how a policy will operate. It includes a logger, which helps track what the policy is doing and identify any problems, and a bus, which allows the policy to communicate with other parts of the swarm using events. These components ensure the policy can record its actions and interact effectively with the broader system.

## Interface IPolicyConnectionService

This interface helps define how different parts of the system connect and interact based on defined policies. It's a blueprint used internally to ensure the public-facing parts of the system are clean and focused on what users and external systems need. Think of it as a way to keep the internal workings separate from the external interface, ensuring a clear and predictable way for different components to work together. It's used to create a standardized way for policy connections to be managed.

## Interface IPolicyCallbacks

This interface lets you plug in your own functions to respond to key events happening within a policy. You can specify functions to run when a policy is first set up (`onInit`), when data is received and needs checking (`onValidateInput`), or when the system prepares to send data (`onValidateOutput`).  It also provides hooks to react when a client is blocked (`onBanClient`) or allowed again (`onUnbanClient`), enabling custom logging or automated responses to these actions. Essentially, it provides a way to extend and monitor the behavior of your policies.

## Interface IPolicy

This interface defines how to control and monitor client interactions within your AI agent swarm. It allows you to set up rules and restrictions, like banning troublesome clients or checking messages before they're sent or received. 

You can use it to see if a client is currently banned, retrieve the reason for a ban, and check if incoming or outgoing messages comply with your defined policies. If a client needs to be restricted, you can ban them using this interface, and if they're wrongly banned, you can remove the restriction. Essentially, it's a core component for managing the security and behavior of clients interacting with your swarm.

## Interface IPipelineSchema

This interface, `IPipelineSchema`, defines the structure for a pipeline that orchestrates AI agent swarms. Every pipeline you build will conform to this blueprint.

It requires a `pipelineName`, which is simply a descriptive label for your pipeline.

The core of the pipeline is the `execute` function.  This is how you actually trigger the swarm to do its work, providing a client identifier, the name of the agent to run, and any data (`payload`) you want it to process. The `execute` function returns a promise that resolves with either void or the type `T` which is the type of data the pipeline is expected to produce.

Finally, the `callbacks` property lets you define functions that will be called at different points in the pipeline's execution, providing a way to monitor progress or react to specific events. These callbacks are optional.


## Interface IPipelineCallbacks

This interface lets you hook into the lifecycle of a pipeline within the agent swarm. You can define functions to be called when a pipeline begins (`onStart`), finishes (`onEnd`), or encounters an error (`onError`). Each of these functions receives information about the pipeline – its ID, name, associated data (`payload`), and details about any errors that occurred. This allows you to track pipeline progress and respond to events programmatically.

## Interface IPersistSwarmControl

This API lets you personalize how your AI agent swarm's data is saved and loaded. Specifically, you can swap out the standard way the swarm keeps track of which agents are active and the paths they've taken. 

Think of it as plugging in your own custom storage solutions – maybe you want to use a database instead of simple files, or perhaps an in-memory store for testing. These methods allow you to define these specialized behaviors and tailor the persistence of your agent swarm's active agents and navigation history.

## Interface IPersistStorageData

This interface describes how data is saved and retrieved for the agent swarm. Think of it as a container holding all the information that needs to be kept around, like settings or agent states. It’s essentially a list of data items – it doesn't specify *what* that data is, just that it’s a collection of things to be stored. The `data` property within this structure represents that list of data items.

## Interface IPersistStorageControl

This interface lets you tailor how data is saved and retrieved for your AI agent swarm. You can plug in your own storage solutions, like connecting to a database instead of using the default file storage. This gives you more control over where and how your agent swarm's data is persisted. Essentially, it's a way to customize the underlying storage mechanism for a specific storage area.

## Interface IPersistStateData

This interface describes how to package up data that needs to be saved and later retrieved, like settings or important information about a running agent. Think of it as a container for whatever information you want to keep track of. The `state` property inside holds the actual data, and it can be any type of information relevant to your agents’ operation. It's used to easily manage and store data for the swarm system.

## Interface IPersistStateControl

This interface lets you fine-tune how your agent swarm’s state is saved and loaded. It provides a way to swap out the default storage method with your own custom solution. Think of it as a way to plug in a different kind of memory for your agents, perhaps using a database instead of simple files. You can use the `usePersistStateAdapter` method to specify your custom adapter, allowing for more specialized persistence behavior.

## Interface IPersistPolicyData

This interface outlines how the system stores information about clients that are prevented from participating in the swarm. Specifically, it keeps track of which session IDs – essentially unique identifiers for individual client connections – are blocked within a particular swarm. Think of it as a blacklist for clients, associating them with a specific swarm to ensure they can't join. The system uses this data to maintain control and security within the swarm environment.

## Interface IPersistPolicyControl

This interface lets you swap out the default way policy data is saved and retrieved for a specific swarm. If you need to store policy information somewhere unusual, like in a database or a temporary file, you can use this to plug in your own custom storage mechanism. It provides a way to extend the system’s behavior without changing its core code, making it more flexible for different environments and use cases. You essentially provide a blueprint for how to handle saving and loading policy information.

## Interface IPersistNavigationStackData

This interface describes how to save and restore the history of which agents a user has interacted with. It’s used to keep track of the order a user switched between agents within a swarm, allowing them to easily go back to previous interactions. Think of it like a "back" button for agent sessions – it remembers the list of agents you've used. The `agentStack` property holds this list, with each entry representing the name of an agent.

## Interface IPersistMemoryData

This interface outlines how memory information is saved and retrieved within the agent swarm. Think of it as a container holding the actual data – whether that’s a session’s history, a temporary calculation, or anything else the agents need to remember. It's designed to be flexible, able to hold different kinds of data because it uses a generic type `T` to represent the data itself. The `data` property simply holds the information that needs to be saved.

## Interface IPersistMemoryControl

This interface lets you plug in your own way of saving and loading memory data associated with a specific session. Think of it as a way to swap out the default memory storage system with something tailored to your needs, like using a database instead of just keeping everything in the program's memory. By providing your own persistence adapter, you can control exactly how the memory for each session is stored and retrieved.

## Interface IPersistEmbeddingData

This interface describes how the system stores numerical data representing embeddings. Think of it as a way to save the "meaning" of a piece of text or information as a list of numbers. Each list of numbers, stored within this structure, is linked to a specific identifier, allowing the swarm to remember and reuse this information later. The `embeddings` property holds the actual numerical values that make up that representation.

## Interface IPersistEmbeddingControl

This interface lets you tailor how embedding data is saved and retrieved. If the default way of saving isn't quite what you need, you can plug in your own custom storage mechanism. Essentially, it provides a way to swap out the standard persistence logic for embedding information, allowing for things like testing or using a different database. By providing a custom adapter, you gain more control over where and how your embedding data is stored.

## Interface IPersistBase

This interface is the foundation for how our system remembers things. It handles saving and retrieving data, like agent states or memory, as JSON files. 

The `waitForInit` method makes sure the storage area is set up correctly, creating it if it doesn't exist and cleaning up any bad data. 

`readValue` fetches a specific piece of data by its unique ID, while `hasValue` quickly checks if that data exists without needing to load it. 

Finally, `writeValue` saves data to storage, ensuring that the process is reliable and avoids data corruption.

## Interface IPersistAliveData

This interface helps the swarm keep track of which clients are currently active. It’s a simple way to record whether a particular client, identified by its session ID, is online or offline within a specific swarm. The `online` property is the core of this, simply stating whether the client is presently connected.

## Interface IPersistAliveControl

This interface lets you customize how the system keeps track of whether an AI agent swarm is still active. By default, the system manages this itself, but this interface gives you the flexibility to plug in your own solution. You can provide your own persistence mechanism, like saving the swarm's alive status to a database or using an in-memory store, instead of relying on the system's built-in approach. This is useful if you need specific data storage or integration with external systems.

## Interface IPersistActiveAgentData

This interface describes how we keep track of which agent is currently "active" for a particular client and swarm. Think of it as a simple record noting which agent is currently running a task or handling a connection. The `agentName` property holds that identifier – a string like "agent1" – that uniquely identifies that agent within the swarm. This helps the system remember the state of active agents across sessions.

## Interface IPerformanceRecord

This interface helps track how well a process is running within the system. It gathers performance data from all the clients involved, like individual sessions or agent instances, and organizes it in one place. You're essentially getting a snapshot of a process's activity, including how many times it ran, how long it took, and when it happened.

Each record includes a unique ID for the process itself, a list of performance details for each client, and summary numbers like total executions and overall response times. There are also timestamps – both a date and time, and a breakdown of seconds since the start of that day – to help pinpoint exactly when the data was collected. This information is useful for monitoring system health and diagnosing any performance bottlenecks.

## Interface IPayloadContext

This interface, `IPayloadContext`, acts as a container for all the important information related to a task being performed. Think of it as a package that holds both the data needed for the task (the `payload`) and who requested it (`clientId`). The `clientId` lets you know which client initiated the work, while the `payload` contains the actual data the AI agents will work with. Essentially, it ensures that all necessary information is bundled together for a specific operation.

## Interface IOutgoingMessage

This interface describes a message that the swarm system sends back to a client, like an agent's response or a notification. 

Each message has a `clientId` to specify exactly which client should receive it – think of it as the client's unique address within the system. The `data` property holds the actual content of the message, which could be anything from a processed result to a simple text response. Finally, `agentName` tells you which agent within the swarm generated the message, helping you trace the origin of the information.

## Interface IOperatorSchema

This function lets you establish a connection between a client and a specific agent within the swarm. Think of it as creating a direct line of communication. It takes a client identifier and the name of the agent to connect to. The returned function then handles sending messages and receiving responses from that agent, allowing you to build interactive workflows.  The function also includes a `DisposeFn$2` to gracefully close the connection when it's no longer needed.


## Interface IOperatorParams

This interface, `IOperatorParams`, defines the information needed to configure and run an operator within the agent swarm. Think of it as a blueprint for setting up a worker. It includes essential details like the name of the agent the operator represents (`agentName`), a unique identifier for the client using the operator (`clientId`), a logger for recording events (`logger`), a messaging bus for communication (`bus`), and a history manager to track the operator’s actions (`history`). Each operator gets its own set of these parameters, ensuring it’s properly identified and integrated into the swarm's workflow.

## Interface IOperatorInstanceCallbacks

This interface helps you listen for important events happening within each individual agent in your swarm. Think of it as a way to get notified about what's going on with each agent. 

You can define functions to be called when an agent starts up (`onInit`), provides an answer (`onAnswer`), receives a message (`onMessage`), is shut down (`onDispose`), or sends a notification (`onNotify`). Each of these functions will receive information like the client ID, the agent's name, and the content of the answer or message. This allows you to build systems that react to, or monitor, the actions of your agents in real time.

## Interface IOperatorInstance

This interface defines how you interact with a single agent within a swarm. Think of it as a way to communicate with one agent, sending it information and receiving responses. 

You can use `init` to get the agent ready to go. `recieveMessage` lets you pass data to the agent, while `answer` allows the agent to send back information to the swarm. `notify` is similar to `answer` but might be used for less critical updates.  When the agent has finished its work, you can use `dispose` to clean up its resources. The `connectAnswer` method provides a way to set up a listener for incoming answers from the agent.

## Interface IOperatorControl

This interface, `IOperatorControl`, lets you configure how your AI agent operators work. You can tell the system which functions your operators should use to receive updates and notifications by setting the `useOperatorCallbacks` property. Alternatively, if you need more flexibility, you can provide your own custom operator adapter using `useOperatorAdapter`, allowing you to build operators with unique behaviors and logic. Essentially, it's about tailoring the way your operators interact with the overall system.

## Interface INavigateToTriageParams

This interface lets you customize how your agents navigate to a triage process. It’s all about tailoring the messages they send and receive during that journey.

You can define what message is sent as the 'last message', or provide functions to generate different messages based on the client, the agent, and other factors. 

Similarly, you can specify what's sent when the agent needs to 'flush' information, 'execute' a task, or when dealing with a tool's output, either accepting or rejecting it. These options allow for a very fine-grained level of control over the agent's communication and workflow.

## Interface INavigateToAgentParams

This interface helps you customize how your AI agents communicate and react during a navigation process. Think of it as a way to fine-tune the messages sent and actions taken as your agents move between tasks or respond to user input. 

You can use the `flushMessage` property to define a message that gets sent when a navigation action is completed. Similarly, `toolOutput` lets you control the message displayed when an agent’s tool generates a result.

The `emitMessage` property allows you to shape the messages sent when an agent starts a new task, considering the user's last input and the agent that handled it previously. Finally, `executeMessage` gives you control over the message shown when an agent actually starts performing a task, again taking into account the user's last message and the agent’s identity. 

These properties can be simple strings or functions that dynamically generate messages based on various context details, allowing for highly tailored interactions.


## Interface IModelMessage

This interface defines the structure for messages moving around within the agent swarm system. Think of it as the standard way agents, tools, and users communicate with each other and the core system.

Each message has a `role` indicating who or what sent it – whether it's a response from the model (`assistant`), a system notification (`system`), output from a tool (`tool`), user input (`user`), an error recovery message (`resque`), or a marker to reset history (`flush`).

A `agentName` identifies which agent is associated with the message, crucial for tracking context in multi-agent scenarios. The `content` is the actual message itself – the text, data, or instruction being passed.  `mode` classifies the origin as either user input or a tool/system action, influencing how the message is processed.

If the model asks for a tool to be used, the message will include a list of `tool_calls`.  Sometimes messages will also contain `images` or a `payload` for extra data or context. Finally, a `tool_call_id` links tool outputs back to the initial request for that tool.

## Interface IMethodContext

This interface, `IMethodContext`, acts like a little envelope carrying important details about any method call within the AI agent swarm. Think of it as a way to tag and track what's happening – which client is making the request, what method is being used, and which resources (like storage, compute, or policies) are involved. Different parts of the system, such as the client agent, performance monitoring tools, and logging services, all use this context to keep things organized and provide useful information. Each property within the envelope represents a specific resource or component at play during the method invocation.

## Interface IMetaNode

This interface, `IMetaNode`, describes a building block for organizing information about your AI agents and the resources they use. Think of it as a way to create a visual map of how agents relate to each other and what they depend on. Each node has a `name` to identify it, like the name of an agent or a specific resource. Optionally, it can have `child` nodes, which are like branches extending from the main node, showing more detailed relationships and dependencies. It's used to build these hierarchical structures that can be saved and shared, making it easy to understand the overall system.

## Interface IMCPToolCallDto

This interface defines the information passed when a tool is called as part of an AI agent swarm. It bundles details like the tool's unique ID, who’s requesting it (the client ID and agent name), the specific parameters needed for the tool to work, and any linked tool calls. It also includes a mechanism to cancel the operation and a flag to show if this is the final call in a series of tool requests. Essentially, it’s a container for all the necessary data to execute a tool within the swarm orchestration.

## Interface IMCPTool

This interface, `IMCPTool`, describes the building blocks – tools – that make up your AI agent swarm. Each tool needs a clear name so the system knows what it is, and a description is helpful for understanding its purpose. Crucially, every tool also needs a defined input schema, which specifies the structure of the information it expects to receive; this ensures the system can correctly format requests and pass data to the tool. Think of it as setting the rules for how the tool should be used.

## Interface IMCPSchema

This interface outlines the blueprint for a core component – an MCP – within our AI agent swarm orchestration framework. Think of it as defining what an MCP *is* and what it *does*. 

Each MCP has a unique name and can optionally include a description for documentation purposes. 

Crucially, it defines how the system can discover available tools for a given client and how to actually *use* those tools, providing the parameters needed for each call.

Finally, the interface allows for optional callbacks, letting you hook into key moments in the MCP's lifecycle.

## Interface IMCPParams

This interface defines the essential components needed to run an orchestration process – think of it as the foundational structure for how your AI agents communicate and coordinate. It requires a logger to keep track of what's happening and a bus, which acts like a central messaging system for agents to exchange information. Essentially, this sets up the infrastructure for a reliable and traceable AI agent swarm.

## Interface IMCPConnectionService

This interface defines how your agents connect to the central orchestration system using a custom Message Control Protocol (MCP). Think of it as the bridge allowing agents to send messages and receive instructions from the swarm manager. You're essentially setting up the communication channel for each agent to participate in the larger, coordinated effort. Implementing this interface allows you to manage the connection lifecycle—establishing, maintaining, and gracefully closing these agent-to-orchestration links. It provides a standardized way for agents to interact, regardless of their underlying technology.

## Interface IMCPCallbacks

This interface helps you react to important moments in the agent swarm’s lifecycle. You can use these callbacks to do things like log activity, track resource usage, or customize behavior based on what's happening.

When the whole system starts up, `onInit` lets you know. `onDispose` tells you when a client’s resources are being cleaned up. If you want to know when tools are being gathered for a client, use `onFetch`. Similarly, `onList` notifies you when a list of tools is being generated.

The `onCall` callback is triggered whenever a tool is actually used; it provides details about which tool was used and the data associated with the call. Finally, `onUpdate` lets you know when the available tools change for a particular client.

## Interface IMCP

This interface lets you manage the tools available to your AI agents. You can use it to see what tools are offered to a particular agent, check if a specific tool is available, and most importantly, actually run those tools with the data you provide. There's also functionality to refresh the list of available tools, either globally or for a specific agent, ensuring your agents always have the latest options. Think of it as the control panel for equipping and using your agents’ abilities.

## Interface IMakeDisposeParams

This interface defines the settings you can provide when automatically managing the lifecycle of an AI agent within a swarm. You can specify a `timeoutSeconds` value to control how long the system will wait for an agent to complete its work before potentially intervening. 

Additionally, you can provide an `onDestroy` callback function, which lets you define custom actions to be taken when an agent is being shut down – allowing you to clean up resources or log events related to its termination. This callback receives the client ID and swarm name as arguments.

## Interface IMakeConnectionConfig

This interface helps you control how often your AI agents communicate with each other. It lets you set a delay, measured in milliseconds, to regulate the flow of messages and prevent overwhelming the system. Think of it as a gentle pause button to ensure a smooth and manageable interaction between your AI agents. By adjusting the delay, you can fine-tune the overall performance and stability of the swarm.

## Interface ILoggerInstanceCallbacks

This interface lets you customize how a logger behaves within the AI agent swarm. Think of it as a way to plug in your own code to be notified about important logger events – when it starts up, shuts down, or records different types of messages. You can use these callbacks to track logging activity, monitor resource usage, or even react to specific log messages in real-time. Each callback receives information like a client ID and the log topic, allowing you to tailor your response to what's happening within the system.

## Interface ILoggerInstance

This interface defines how a logger should behave when it’s brought online and taken offline within the agent swarm system. It allows for controlled setup and cleanup, giving you a way to manage resources specific to each client. 

The `waitForInit` method lets you prepare the logger—potentially doing things like connecting to a remote service—and it guarantees this preparation only happens once.  The `dispose` method provides a way to properly shut down the logger and release any resources it’s holding when it’s no longer needed.

## Interface ILoggerControl

This interface gives you tools to customize how logging works across your AI agent swarm. You can set up a central logging system, define specific actions that happen when logger instances are created, or even replace the standard logger with your own custom version. There are also convenient shortcuts for logging messages – info, debug, and general messages – specifically tied to a particular client, ensuring everything is tracked and validated. Essentially, it allows you to fine-tune the logging behavior to match your application’s unique needs.

## Interface ILoggerAdapter

This interface outlines how different parts of the system can talk to logging services. Think of it as a standard way to send messages – whether they are regular logs, debug information, or general updates – to the right logging destination for a specific client. 

The `log`, `debug`, and `info` methods all work the same way: they take a client identifier, a topic describing the message, and then any information you want to include in the log. The `dispose` method is used to clean up and release resources associated with a client's logging setup when it’s no longer needed.

## Interface ILogger

This interface defines how different parts of the AI agent swarm system record information. Think of it as a central way to keep track of what's happening.

It lets the system log general messages, detailed debugging information, and informational updates. These logs are used to follow the lifecycle of agents, track tool usage, confirm policies are working correctly, and understand any errors that might occur. This helps with troubleshooting, monitoring the system's performance, and keeping an audit trail of events. 

Essentially, it’s a standard way to write down important events so you can understand how the entire swarm system is operating.


## Interface IIncomingMessage

This interface describes a message that comes into the AI agent swarm system. Think of it as the way information gets passed from the outside world – like a user typing a question – to the agents that are working within the system. 

Each message has a client identifier, which lets the system know which client (like a particular user session) sent the message. The message also contains the actual content or data being sent, which is usually text. Finally, it specifies which agent is responsible for handling that specific message, ensuring it gets to the right place within the swarm.

## Interface IHistorySchema

This interface describes how your AI agent swarm keeps track of past conversations. Think of it as the blueprint for how the system remembers what's been said. Specifically, it focuses on the `items` property, which dictates which tool – an "adapter" – is used to store and access the history of messages. Different adapters can be used to store this history in various ways, such as in a database, a file, or even in memory.

## Interface IHistoryParams

This interface defines the information needed to set up a record of an agent’s actions and interactions. Think of it as the blueprint for creating a history log for a specific agent. 

It includes details like the agent’s name, a limit on how many past messages to keep to manage context, a client identifier, a logger for recording activity, and a communication channel (bus) for sending updates within the larger system. This allows the framework to track what each agent does and share relevant information across the swarm.

## Interface IHistoryInstanceCallbacks

This interface defines a set of callback functions you can use to control how an agent's message history is managed. You can use `getSystemPrompt` to customize the initial instructions given to an agent. `filterCondition` lets you decide which messages should be saved in the history. `getData` allows you to load existing historical data when an agent is first set up.

The `onChange` function is triggered whenever the history of messages changes, while `onPush` and `onPop` notify you when new messages are added or removed from the history respectively. `onRead` is called as each message is processed, and `onReadBegin` and `onReadEnd` signal the start and finish of a full read operation. `onDispose` and `onInit` are called when the history is being cleaned up or first set up, and `onRef` allows you to access the full history instance itself.

## Interface IHistoryInstance

This interface outlines how to work with the history of interactions for each agent within the swarm. Think of it as managing a log file for each agent, keeping track of what they’re doing and saying.

You can use the `iterate` method to step through the history of messages for a specific agent, like reading through a conversation. `waitForInit` helps ensure the history is ready to go before you start working with it, potentially loading any pre-existing data.  To add a new interaction to an agent's history, you’re using `push`. If you need to retrieve and remove the most recent interaction, `pop` does that for you. Finally, `dispose` lets you clean up the history for an agent, releasing any resources and potentially erasing the data.

## Interface IHistoryControl

This interface lets you fine-tune how history is managed within the AI agent system. You can tell the system when to trigger specific actions, like logging or cleanup, during the history’s lifecycle by providing callback functions. 

Additionally, you can customize the underlying structure of the history instances themselves by providing your own constructor function, allowing for more specialized history management. Essentially, it provides hooks for both the events related to history and the history's core construction.

## Interface IHistoryConnectionService

This interface helps us keep track of how agents interact over time. It’s a blueprint for services that manage a history of connections between agents, making sure the publicly available features align with what users actually see and use. Think of it as a way to define a consistent way to record and provide access to agent communication history.

## Interface IHistoryAdapter

This interface lets your system connect to different ways of storing conversation history, like databases or files. 

It provides a set of functions to manage that history. You can add new messages using `push`, retrieve the most recent message with `pop`, and clear out the entire history for a specific conversation with `dispose`. 

If you need to look back through the full conversation, the `iterate` function lets you step through the messages one by one. This flexibility makes it easy to adapt to different storage solutions without changing the core orchestration logic.

## Interface IHistory

This interface helps keep track of all the messages exchanged with AI models, whether those are part of a specific agent's conversation or just general usage. You can add new messages to the history using the `push` method, and retrieve the last message using `pop`.

Need to prepare the history for a specific AI agent? The `toArrayForAgent` method formats the history based on a prompt and system instructions. If you just need all the raw messages in order, `toArrayForRaw` provides that.

## Interface IGlobalConfig

This file defines a central configuration for the AI agent swarm system, setting global behaviors and functions used across different components. Think of it as the system’s rulebook, which can be customized to fine-tune how agents interact, handle errors, and manage data.

You can modify this configuration to adapt the system to specific needs. For instance, you can change how the system handles tool call errors (using "flush" to reset, "recomplete" to retry, or a custom function), or adjust the verbosity of logging.

The configuration covers a wide range of areas, including:

*   **Error Handling:** How to react when tool calls fail.
*   **Logging:** Controlling debug and informational messages.
*   **History Management:** How much conversation history to keep.
*   **Tool Call Limits:** Preventing excessive tool usage.
*   **Data Persistence:** Managing storage and caching.
*   **Navigation and Swarm Behavior:** Defining agent hierarchies and stacks.
*   **Validation and Transformation:** Ensuring correct outputs and cleaning data.
*   **Agent Interaction:** Connecting operators and managing timeouts.

By adjusting these settings, you can tailor the swarm system's performance and behavior to match your specific requirements. It’s about influencing how agents work and behave.

## Interface IFactoryParams

This interface lets you customize how your AI agent swarm interacts with users. It provides ways to control the messages sent during different stages of the process, like when the system needs to clear buffers, when a tool generates output, or when executing instructions. You can either provide a simple text message for each of these situations, or use a function that allows for dynamic message generation, potentially incorporating details like the client ID, agent name, or the last user message to create more context-aware responses. Think of it as a way to fine-tune the conversational flow and provide more informative feedback to the user.

## Interface IFactoryParams$1

This interface lets you customize how your AI agents communicate during navigation. It allows you to provide specific messages or functions that are triggered when the system needs to flush information, execute a task, or process the output from a tool. You can define these as simple text strings, or use functions to create more dynamic messages based on things like the client ID or the default agent involved. Essentially, this gives you granular control over the agent's interaction flow.

## Interface IExecutionContext

This interface describes the shared information used to track a single run or task within the AI agent swarm. Think of it as a common set of details that different parts of the system – like the client interface, performance monitoring, and messaging – all use to keep things organized. 

It includes a client identifier to link back to the user or application initiating the task, a unique execution ID for precise tracking, and a process ID for identifying the specific component running the work. This shared context ensures consistent monitoring and linking of events throughout the swarm's operations.

## Interface IEntity

This interface serves as the foundation for all data that's stored and managed within the AI agent swarm. Think of it as a common blueprint that all other, more specialized data types build upon. When you need to work with data that the swarm keeps track of, it will likely implement this `IEntity` interface, which ensures a certain level of consistency across different types of information. Specific data structures will then extend this base to add their own unique fields and details.

## Interface IEmbeddingSchema

This interface lets you configure how the AI agent swarm creates and compares embeddings, which are numerical representations of text used for tasks like searching and ranking. 

You can choose whether to save the agent's state and navigation history persistently.  Each embedding mechanism needs a unique name to identify it within the swarm. 

The `writeEmbeddingCache` function allows you to store computed embeddings so you don't have to recalculate them repeatedly. Conversely, `readEmbeddingCache` lets you check if a previously computed embedding is already available.

You can also customize embedding creation and comparison processes by providing your own callback functions.

The `createEmbedding` function is used to generate embeddings from text, while `calculateSimilarity` determines how closely related two embeddings are.

## Interface IEmbeddingCallbacks

This interface lets you tap into what's happening when embeddings are generated and compared. 

You can use the `onCreate` callback to track when a new embedding is made, allowing you to log details or perform actions after it's created. 

The `onCompare` callback is triggered whenever two embeddings are checked for similarity, giving you a way to record or analyze those comparison results. Essentially, these callbacks provide a way to monitor and potentially react to the embedding process.

## Interface ICustomEvent

This interface lets you create and send custom events within the swarm system, going beyond the standard event types. Think of it as a way to communicate specific, unique information between agents when the predefined event structure isn't enough. 

It's built on top of the basic event interface, so it can be handled in the usual way, but it allows you to attach any type of data you need – anything from simple numbers to complex objects – using the `payload` property. This is particularly useful for user-defined events or when you need to pass information that doesn't fit neatly into the existing event categories.

## Interface IConfig

This interface, `IConfig`, defines the configuration settings used when generating UML diagrams.  It currently only includes a single setting, `withSubtree`.  Setting `withSubtree` to `true` will instruct the system to include subtree relationships in the generated UML diagram, providing a more detailed view of the connections between elements. If it's `false`, only direct relationships will be shown.

## Interface IComputeSchema

This interface describes the structure for defining a computational unit within an AI agent swarm. Think of it as a blueprint for a task that agents can execute. 

It includes a descriptive text (`docDescription`) to explain what the computation does. The `shared` flag indicates whether this computation can be used by multiple agents.  You'll also give it a unique `computeName` so it can be easily referenced.  `ttl` sets a time-to-live, representing how long the data associated with this computation is valid.

Crucially, `getComputeData` defines how to retrieve the data needed for the computation, and `dependsOn` specifies other computations that must complete first. `middlewares` allow you to add pre and post-processing steps, and `callbacks` provide hooks to trigger actions upon completion or failure.

## Interface IComputeParams

The `IComputeParams` interface defines the information needed to run a computation within the agent swarm. Think of it as a container holding all the tools and context a worker needs to do its job. It includes a unique identifier, `clientId`, to track the computation. 

A `logger` is provided for recording important events and debugging. The `bus` allows the computation to communicate with other parts of the system. Finally, `binding` specifies the state changes this computation is responsible for tracking and managing.

## Interface IComputeMiddleware

This interface defines how different pieces of your AI agent swarm can communicate and process information. Think of it as a standardized way to plug in components that prepare data for your agents or refine the results they produce. Implementing this interface allows you to easily add custom logic to your agent workflow, like filtering requests or transforming agent responses, without altering the core orchestration engine. You can create specialized middleware to handle specific data types or tasks, making your swarm adaptable and reusable. Essentially, it’s a flexible way to extend your agent system's capabilities.

## Interface IComputeConnectionService

This interface defines how your system connects to and communicates with the compute resources that power your AI agents. Think of it as the bridge between your orchestration framework and the actual processing power. It outlines the methods you'll use to establish connections, send tasks to be executed by agents, and receive results back – essentially, managing the flow of work. It includes functionality to create, manage, and close these connections, ensuring your agents can consistently access the resources they need to operate. The methods described here cover everything from initial setup to error handling and graceful shutdowns.

## Interface IComputeCallbacks

This interface defines a set of optional callback functions you can provide when setting up a compute unit within the AI agent swarm. Think of these callbacks as notification points – the framework will call them at specific moments in the compute unit's lifecycle.

`onInit` is triggered when a compute unit is initialized, letting you perform any setup tasks.
`onDispose` is called when the compute unit is being shut down, allowing you to clean up resources.
`onCompute` receives the data being processed by the compute unit, along with identification information.
`onCalculate` signals that a calculation is underway, giving you a chance to monitor progress.
Finally, `onUpdate` notifies you when the compute unit's status has changed. 

You don't *need* to provide all of these callbacks; they’re designed to give you flexibility in how you interact with and observe the behavior of your compute units.

## Interface ICompute

The `ICompute` interface defines how different components in the agent swarm can perform calculations and manage their state. The `calculate` method allows a component to trigger a computation based on a given state name, ultimately updating the overall system.  The `update` method lets one component signal another about changes, using a client identifier and compute name to specify the target. Finally, `getComputeData` provides a way to retrieve the current data associated with a compute component.

## Interface ICompletionSchema

This interface describes how to set up a system for generating suggestions or completions within your AI agent swarm. Think of it as a blueprint for creating a component that can provide helpful responses or actions based on the current situation.

You'll give it a unique name to identify it, and you can optionally provide callbacks to handle events that happen after a completion is generated, allowing you to customize what happens next.

The core of this interface is the `getCompletion` method, which is what you'll use to actually request a suggestion. It takes information about the context and available tools and returns a predicted response from the AI model.

## Interface ICompletionCallbacks

This interface lets you define what happens after an AI agent successfully finishes a task. Think of it as a way to hook into the moment a task is done. You can use the `onComplete` property to specify a function that gets called with information about the completed task, like any arguments passed to it and the output received from the AI model. This allows you to log the event, process the output, or start another action based on the completed task.

## Interface ICompletionArgs

This interface defines the information needed to ask the AI agent swarm to generate a response. Think of it as a package containing all the relevant details for a single request. 

It includes a client identifier, the name of the agent making the request, and whether the last message came from a tool or a user. Crucially, it holds the complete conversation history – all the previous messages – to give the agent the context it needs. Optionally, you can also provide a list of tools the agent can use to answer.

## Interface ICompletion

This interface defines how different parts of the system can generate responses from AI models. Think of it as a blueprint for creating ways to get answers from AI, whether that's through text generation, code completion, or something else. It provides a full set of tools and methods for building these completion processes, ensuring a consistent and reliable way to interact with AI models.

## Interface IClientPerfomanceRecord

This interface describes the performance data collected for each individual client, like a user session or an agent, as part of a larger process. It provides a detailed view of how each client is performing, including memory usage, state, and timing information.

Each client record includes a unique identifier (`clientId`) to easily link performance data back to the specific session or agent.  You’re also getting a snapshot of the client's memory (`sessionMemory`) and persistent state (`sessionState`), much like what's managed internally in an agent.

The record also tracks how many times the client has executed tasks (`executionCount`), the total amount of data it has processed (`executionInputTotal`, `executionOutputTotal`), and the average sizes and times for those executions.  The total and average execution times (`executionTimeTotal`, `executionTimeAverage`) are especially helpful for identifying bottlenecks and optimizing client-specific performance.

## Interface IChatInstanceCallbacks

This interface defines a set of callbacks that your application can use to stay informed about what's happening with a chat instance within the AI agent swarm. You're essentially getting notified about key events like when an instance starts up, shuts down, or begins a chat session. 

The callbacks also tell you when a client is checked for activity, when a message is sent, and provide data like the client ID, swarm name, and sometimes the chat instance itself. This allows your application to react to changes in the agent swarm's behavior and potentially display information or perform actions based on these events.

## Interface IChatInstance

This interface represents a single chat session within the agent swarm. It allows you to start a chat, send messages to it, and check if the conversation is still active. You can also clean up the chat session when you're finished with it using the `dispose` method. Finally, you can register a function to be notified when the chat session is closed.

## Interface IChatControl

This framework lets you customize how your AI agents interact and communicate. The `IChatControl` interface provides a way to inject different chat components into the system. 

You can use `useChatAdapter` to swap out the underlying technology handling the conversations—essentially, to tell the framework which class should be used to manage the actual chat interactions.  Similarly, `useChatCallbacks` allows you to plug in your own functions to be notified about specific events happening within the chat process, enabling you to build custom logic or monitoring around these events. Think of it as defining how the system reacts to messages and how it handles the overall flow of the conversation.

## Interface IChatArgs

This interface, `IChatArgs`, defines the information needed when sending a message to an agent within the system. Think of it as a standard format for passing chat-related data. 

It includes three key pieces of information: a `clientId` to identify who initiated the chat, the `agentName` which specifies which agent should handle the message, and the actual `message` content itself. This structure ensures everyone’s on the same page when dealing with agent conversations.

## Interface IBusEventContext

This interface helps track the background details of events happening within the system. Think of it as adding extra information to an event to know *who* or *what* was involved.

For agents, it's common to see the `agentName` filled in, linking the event directly to a specific agent.  However, other fields like `swarmName`, `storageName`, and `policyName` exist to provide context for broader system-level events.

Essentially, it’s a way to give events a richer context, allowing for more detailed tracking and understanding of what's going on.  The specific fields used will depend on the type of event and what information is relevant.

## Interface IBusEvent

This interface describes the structure of messages sent through the system's internal communication channels. Think of it as a standardized way for different parts of the AI agent swarm to talk to each other, particularly from the agents themselves. Each message has a clear origin (identified by its `source`), a specific action or purpose (`type`), and can carry data being passed along (`input` and `output`). It also includes extra information about the message's context, like which agent sent it (`context`). The system uses this structure to reliably distribute information about actions, results, and changes in state across the swarm.

## Interface IBus

The `IBus` interface provides a way for different parts of the system, particularly agents, to communicate with each other asynchronously. Think of it as a central messaging system.

Agents use the `emit` method to send notifications to specific clients. These notifications, or events, announce things like a run completion, the emission of an output, or the commitment of a message. The events are structured and include information about the event's origin, associated data, and the target client.

The `emit` method ensures these messages are delivered to the right place and enables the system to react to agent actions in a decoupled way – the sending agent doesn’t need to know exactly who's listening. The client ID is included within the event itself, offering an extra layer of targeting.  You can use it to broadcast updates and results to clients, keeping everyone informed about what’s happening within the swarm.

## Interface IBaseEvent

This interface sets up the basic information that every event in the system will have. Think of it as a common template.

Each event will need to specify where it came from – this is the `source`.  It also needs to indicate which client it's meant for – that's the `clientId`.

These two pieces of information help make sure events are routed correctly to the right part of the system, whether it's an agent, a session, or the swarm itself.  More specific event types build upon this foundation, adding their own details.

## Interface IAgentToolCallbacks

This interface defines a set of optional callbacks that let you customize how individual tools within an AI agent swarm are used. You can use `onBeforeCall` to do things like logging or preparing data just before a tool runs.  `onAfterCall` lets you clean up or process results after a tool completes its work.  `onValidate` allows you to create custom checks to make sure the tool receives the correct parameters. Finally, `onCallError` provides a place to handle and log any errors that occur during tool execution, allowing for more robust agent behavior.

## Interface IAgentTool

This interface, `IAgentTool`, describes a tool that an AI agent can use to accomplish tasks within a larger swarm. Each tool has a name to easily identify it, and an optional description that helps users understand how to use it.

Before a tool runs, the `validate` method checks if the provided parameters are correct, which can be done quickly or take a bit longer depending on the complexity of the check. 

You can also add lifecycle callbacks to a tool to customize what happens before or after it runs, and the `call` method is what actually executes the tool, taking into account various context information like its ID and whether it's the last step in a sequence.

## Interface IAgentSchemaCallbacks

This interface lets you tap into key moments during an agent's lifecycle. You can register functions to be notified when an agent starts running, begins execution, or finishes a tool call. It provides a way to monitor what's happening behind the scenes, like when a tool generates output, a system message is created, or a user sends a message. You can also hook into agent initialization, disposal, and when its memory is cleared. Essentially, it’s like setting up event listeners for your agents to customize their behavior or track their actions.

## Interface IAgentSchema

This interface defines how an agent is configured within the swarm system. It outlines the agent’s essential characteristics like its name, the prompt that guides its actions, and the tools it can utilize. You can also specify how the agent handles tool calls, manage the number of messages it remembers for context, and even customize its behavior through optional functions like input transformation and output validation. It includes options for defining system prompts, setting up operator handoffs, and detailing dependencies on other agents within the swarm. Finally, lifecycle callbacks allow for even deeper control over the agent's execution.

## Interface IAgentParams

This interface defines the essential setup for each agent participating in the swarm. Think of it as the agent's configuration – it provides the agent with its identity (clientId), a way to log its actions (logger), a channel for communicating with other agents (bus), access to external tools (mcp), a memory of past interactions (history), capabilities for crafting responses (completion), and optionally, a set of tools it can use.  It also includes a validation function to check the agent’s output before it’s considered complete.

## Interface IAgentNavigationParams

This interface lets you define how agents move between each other within the system. You specify a `toolName` and `description` to clearly identify the navigation action. The `navigateTo` property indicates which agent the navigation will target.  A `docNote` allows you to add extra documentation for clarity, and `skipPlaceholder` helps manage situations where multiple navigation actions are possible, letting you choose which one to prioritize.

## Interface IAgentConnectionService

This interface helps ensure that the publicly accessible parts of your agent connection service are clearly defined and consistent. It's designed to create a clean, type-safe definition of the connection service, specifically removing any internal details that shouldn't be exposed. Think of it as a blueprint for building a reliable and predictable agent connection service that others can easily work with.

## Interface IAgent

This interface defines how you interact with an individual agent within the swarm orchestration system. It outlines the actions you can take, from running simple computations to managing the agent's internal state and lifecycle.

You can use the `run` method for quick, isolated tasks without affecting the agent's memory.  The `execute` method is the primary way to get the agent working, potentially updating its history based on the chosen mode.  `waitForOutput` lets you retrieve the result after execution is complete.

Beyond these core actions, you have fine-grained control over the agent’s memory. You can manually add tool outputs, system messages, user messages, and assistant messages, or even stop the tool execution flow or completely reset the agent's history. This allows for very precise control and debugging of agent behavior.
