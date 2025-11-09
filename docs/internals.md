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


# agent-swarm-kit functions

## Function validate

This function checks the health and correctness of everything in your AI agent swarm – that includes the swarms themselves, the individual agents within them, and the outlines that guide their actions. It's designed to be safe to run repeatedly; it only validates once each time you run it, so you don't have to worry about it slowing things down if you accidentally call it multiple times. Think of it as a quick system check to ensure everything is set up properly.

## Function startPipeline

This function lets you kick off a pre-defined workflow, or "pipeline," within the AI agent system. Think of a pipeline as a sequence of steps handled by different agents. 

You specify which client this workflow belongs to using `clientId`, then identify the specific pipeline you want to run with `pipelineName`, and tell the system which agent should initially handle the request using `agentName`.  You can also provide data, called the `payload`, that the pipeline will use to do its work – this is optional. 

The function returns a promise that will eventually resolve with the result of the pipeline execution, which can be any type of data you define.

## Function scope

This function lets you run a piece of code – like a task or a function – within a controlled environment, ensuring it has access to the necessary tools and resources. Think of it as setting up a little workspace just for that specific task.

You provide the code you want to run, and it will execute within this workspace. Optionally, you can customize the tools available in the workspace, like specifying which AI agents or tools the code can use. This allows you to easily manage and control how your code interacts with the broader AI system. The code you provide receives details about the client and agent involved, giving it context for its operations.

## Function runStatelessForce

This function lets you send a message to your AI agent swarm without it being saved to the ongoing conversation history. It's perfect for tasks like processing data from storage or running quick, isolated commands.

Unlike other functions, this one *always* runs the message, even if the agent isn't currently considered 'active'. 

You provide the message content and a client ID to identify the session. The system handles the execution, tracks performance, and keeps an organized environment for reliable processing.

## Function runStateless

This function lets you send a message to one of your AI agents without adding it to the ongoing conversation history. Think of it as a way to quickly trigger an agent for a specific task, like processing data or handling a one-time request, without worrying about the chat history getting too long. 

You provide the message you want the agent to handle, along with a client identifier and the agent's name. The system ensures the agent is still available and running, and then executes the message, keeping track of how long it takes and notifying other parts of the system. It makes sure each message starts with a fresh slate, guaranteeing a consistent and reliable outcome for each request.


## Function overrideTool

This function lets you change how a tool works within the system. Think of it as updating a tool's instructions – you can modify its name, what it does, or any extra details. It’s designed to make these changes cleanly, without impacting anything else that's currently running. The system keeps track of these overrides, logging them if you've enabled logging. You simply provide the new or updated tool information, and the system takes care of the rest.

## Function overrideSwarm

This function lets you directly update a swarm's configuration. Think of it as replacing or modifying an existing swarm's blueprint. You provide a new schema, and it applies those changes to the swarm in the system. This update happens independently of any ongoing processes, guaranteeing a fresh start for the modifications. If logging is turned on, the system will record this override for tracking purposes. You just pass in the new schema you want the swarm to follow.

## Function overrideStorage

This function lets you change how your swarm system stores data. It allows you to update a storage configuration, adding or modifying its properties. Think of it as refining how your data is organized and managed. The change happens independently, ensuring a clean and isolated process. If your system is set up to log activities, this override will be recorded. You simply provide the updated information for the storage you want to modify.

## Function overrideState

This function lets you change how the swarm system manages a specific type of state. Think of it as a way to update the blueprint for a particular state—you can add new properties, modify existing ones, or even replace the whole thing. It's designed to make these changes directly and safely, separate from any ongoing processes.  The system keeps a record of these changes if logging is turned on. You provide a partial or complete state schema, and it gets applied to the current state configuration.

## Function overridePolicy

This function lets you update a policy's settings within the swarm. Think of it as making direct changes to how a policy behaves. You provide a new schema, which can be a complete replacement or just a few modifications to the existing policy.  The change happens in a separate, isolated environment to prevent conflicts. The system will also record this change in its logs if logging is turned on. You essentially provide the new policy details, and the function takes care of applying them.

## Function overridePipeline

This function lets you modify an existing pipeline definition. Think of it as a way to make small adjustments or corrections to a pipeline without having to rewrite the entire thing from scratch. You provide a partial pipeline schema – only the parts you want to change – and this function merges those updates into the original pipeline definition. This is useful for adapting pipelines based on different scenarios or correcting mistakes.

## Function overrideOutline

This function lets you modify an outline schema already in use by the swarm. Think of it as updating a blueprint for how tasks are organized. To keep things reliable and prevent unexpected conflicts, it starts with a fresh slate before making the changes. If your system is set up to log actions, this update will be recorded for tracking purposes. You simply provide the updated parts of the schema, and the function takes care of applying them.

## Function overrideMCP

This function lets you modify an existing Model Context Protocol (MCP) schema. Think of an MCP schema as a blueprint for how AI agents communicate and share information. 

You provide the original schema, and this function returns a new, updated version incorporating your changes. It's useful when you need to adapt an MCP to fit a specific need or integrate new data structures. Essentially, you're giving the framework a way to adjust how agents understand each other. The function takes the existing MCP definition as input and returns a modified version.

## Function overrideEmbeding

This function lets you change how the swarm handles embeddings, essentially updating the instructions it uses for understanding and comparing information. You provide a new set of rules or modify the existing ones for embedding, and this function applies those changes directly to the swarm’s configuration. It ensures that the change is made cleanly and independently, keeping things organized. If the swarm is set up to log activity, this override will be recorded for tracking purposes. You only need to provide the new embedding schema; you don't need to deal with the underlying mechanisms.

## Function overrideCompute

This function lets you modify existing compute configurations, allowing you to make targeted changes without rewriting everything from scratch. Think of it as a way to apply updates or adjustments to how a specific task or function is executed. You provide a partial configuration – just the bits you want to change – and the function merges it with the original configuration. This is particularly useful for fine-tuning agent behavior or adjusting resource allocation.

## Function overrideCompletion

This function lets you modify how the swarm generates responses. Think of it as a way to tweak the instructions given to the AI agents to ensure they produce the kind of output you need. You provide a new schema, which can be a complete replacement or just a few changes to an existing one, and the system applies those changes. The update happens independently, making sure it doesn’s interfere with what’s already happening. If logging is turned on, the system will record that you made this modification.

The key thing you pass in is a schema definition describing the desired completion behavior.

## Function overrideAgent

This function lets you update the blueprint for an agent already working within the swarm. Think of it as modifying an agent's instructions – you can provide a complete new set of instructions, or just tweak a few parts. It operates independently, ensuring a safe and isolated change. If your system is set up to log actions, this function will record that an agent's schema has been updated. You provide the new agent definition, and the framework handles applying those changes.

## Function overrideAdvisor

This function lets you update an advisor's configuration within the swarm. Think of it as making changes to how an advisor operates – you can specify new settings or modify existing ones.  It’s designed to make these changes cleanly and safely, keeping them separate from ongoing processes.  Only the information you provide in the `advisorSchema` will be updated; any settings you don’t include will stay as they are.  You'll need to provide the advisor's name as part of the schema you’re providing.

## Function notifyForce

This function lets you send a message out from your swarm session directly, like a quick announcement or status update, without having the swarm process it as a regular instruction. It’s specifically for sessions set up using the "makeConnection" method. 

Essentially, you provide the message content and a unique ID for the client session, and the system will send that message out. It checks to make sure everything is still working correctly before sending, and it's designed to work even if the agent assigned to the session has been updated. This helps keep things running smoothly and provides a way to communicate outside of the normal message flow.

## Function notify

This function lets you send messages out from your AI agent swarm session without triggering any of the usual processing steps. Think of it as a direct broadcast – it's useful for things like displaying status updates or providing feedback to a user in sessions created with "makeConnection."

It makes sure everything is set up correctly, verifying the session, the overall swarm, and the specific agent you're sending to is still working. If the agent has been replaced, the notification won’t be sent. 

You provide the message content, a unique ID for the client using the session, and the name of the agent you want the message associated with. The function handles the technical details to ensure a smooth delivery.


## Function markOnline

This function lets you tell the system that a particular client is now active and participating in a specific group of agents, which we call a swarm. Think of it as updating the status of a worker – you're essentially saying "this client is online and ready to go" within the context of a named swarm. You'll need to provide a unique identifier for the client and the name of the swarm you're updating. It doesn't return a value, it just confirms the update.


## Function markOffline

This function lets you tell the system that a particular client has gone offline. You're essentially informing the framework that a client, identified by its unique ID, is no longer actively participating in a specific swarm. It's useful for managing the state of your agents and ensuring accurate task assignments. To use it, you'll need the client's ID and the name of the swarm it was part of.

## Function listenEventOnce

This function lets you temporarily listen for a specific type of event happening within your agent swarm. It's designed to trigger a function only *once* when an event with a certain topic is received from a particular client, or from all clients if you choose. 

You can even provide a filter to ensure that only events that meet certain criteria will trigger your function. The function handles the setup and cleanup of the listener, ensuring everything runs smoothly and automatically unsubscribes after it has executed once. To cancel the listener before it triggers, the function returns a special function that you can call to stop it. 

Essentially, it's a simple way to react to a single event without needing to manage ongoing subscriptions. 

**Parameters:**

*   `clientId`: Identifies which client's events you want to listen to (or use "*" to listen to all).
*   `topicName`: The name of the event you're interested in.
*   `filterFn`: A function that checks if the event matches your needs.
*   `fn`: The function to run when a matching event is received.

## Function listenEvent

This function lets you set up a way to be notified when specific events happen within your AI agent swarm. You tell it which client or all clients you want to listen to, and what event topic you’re interested in. When an event matching your criteria occurs, a function you provide will be executed, giving you access to the event's data. 

It’s designed to keep things organized and prevent interference by using a controlled execution environment and restricting certain topic names. To stop receiving these notifications, the function provides a handy "unsubscribe" function that you can call. Think of it as subscribing to a channel and having a way to cancel that subscription when you no longer need it.

## Function json

This function lets you request and receive data in a structured JSON format, following a defined outline schema. Think of it as a way to ask for specific information and get it neatly packaged. 

You provide an `outlineName` which tells the system what kind of data you’re looking for. Optionally, you can also provide a `param` to refine your request. The function then handles the data retrieval and organization behind the scenes, ensuring everything runs smoothly and independently. You're guaranteed to get back a JSON response containing the requested data.

## Function hasSession

This function helps you quickly determine if a client has an active session. It takes a client ID as input and returns `true` if a session exists, and `false` otherwise. Behind the scenes, it uses a session validation service to do the actual checking. If your system is set up for logging, the function will also record that it was called.

## Function hasNavigation

This function helps you determine if a particular agent is involved in guiding a client through a process. It checks if an agent is part of the planned route for a client’s interaction. Behind the scenes, it verifies that the client and agent are valid, finds the relevant agent swarm, and then looks at the navigation route to see if the agent is included. The system will also record this check if logging is turned on. You provide the unique identifier for the client and the name of the agent you’re interested in knowing about.

## Function getUserHistory

This function helps you get a record of what a user has done during a specific session. It pulls the complete history for a client and then isolates the entries that were initiated by the user. Think of it as retrieving the user's contributions to a conversation or task. You just need to provide the unique ID for the client session to get their history.

## Function getToolNameForModel

This function helps determine the specific name a language model should use when interacting with a tool. It takes the tool's name, a client identifier, and the agent's name as input. Essentially, it translates a tool's internal name into something the language model understands within a particular context. You can use this function to ensure the right tool is called with the correct name, considering the client and agent involved. It's the primary way other systems can interact with this part of the framework.

## Function getTool

This function lets you fetch the definition of a specific tool used by your AI agents. Think of it as looking up the blueprint for a particular tool – it tells the system exactly how that tool works and what it can do. You provide the tool’s name, and the function returns its schema. The system will also keep a record of this request if logging is turned on. 


## Function getSwarm

This function lets you fetch the details of a specific AI agent swarm. Think of it as looking up a swarm’s configuration. You provide the swarm's name, and it returns a structured object containing its schema – essentially, a blueprint of how that swarm is set up and how it operates. If your system is configured for logging, this retrieval process will be recorded.

## Function getStorage

This function lets you grab the blueprint for a specific storage within your agent swarm. Think of it as looking up how a particular data store is structured and what kind of information it holds. You provide the name of the storage you're interested in, and the function returns a detailed description of its schema.  The system also keeps track of these requests if you’ve configured logging to be active. 

The only thing you need to provide is the name of the storage you want to examine.

## Function getState

This function lets you grab a specific state definition from the system, identifying it by its name. Think of it as looking up a blueprint for how a particular part of the swarm should behave. It's useful for inspecting the configuration of your agents or understanding their expected structure. The system will also record that you asked for this state information if logging is turned on. You just need to provide the name of the state you're interested in to get its definition.

## Function getSessionMode

This function lets you check the current status of a client's session within the swarm. It tells you if the session is active ("session"), attempting to establish a connection ("makeConnection"), or fully completed ("complete"). You provide the unique ID of the client session to find out its mode. The process includes verifying the session's validity and keeping a log of the action if logging is turned on, all while ensuring a fresh, isolated execution environment.

## Function getSessionContext

This function gives you access to the current session's details, like who's using the system and what resources are available. Think of it as a way to understand the environment your AI agents are operating in. It gathers information such as the client and process IDs, and available methods and execution contexts.  It automatically determines these details based on the current situation, so you don't need to provide any specific IDs – it figures it out on its own.  The function also keeps a record of this process if logging is turned on.

## Function getRawHistory

This function lets you peek directly at the complete history of messages for a specific client's agent swarm session. It gives you the raw data, exactly as it was recorded, without any changes or filtering applied. 

Think of it as retrieving the full, unedited log of the agent's interactions. To get this history, you'll need to provide the unique ID of the client session. 

The function handles the complexities of accessing the swarm's data and ensures a consistent environment for retrieving the history. You're given a brand new copy of the history data, so any changes you make won't affect the original.

## Function getPolicy

This function lets you fetch the details of a specific policy that's defined within your AI agent swarm. Think of it as looking up a recipe – you give it the recipe's name (the `policyName`), and it returns all the ingredients and instructions (the `IPolicySchema`). It also keeps a record of this lookup if you've set up logging for your swarm. You just need to provide the name of the policy you're interested in.

## Function getPipeline

This function lets you fetch the blueprint for a specific pipeline from the central management system. Think of it as requesting the instructions for how a particular process should run within your AI agent swarm. You simply provide the pipeline's name, and it returns the schema that defines its structure and steps. The system keeps a record of these requests if you’ve enabled logging.



The `pipelineName` is the unique identifier you use to specify which pipeline you want to retrieve.

## Function getPayload

This function lets you access the data being passed around within the agent swarm system. Think of it as a way to peek at the information an agent is working with. If there's no data currently available, it won’t return anything; it’s like checking a box that's empty. The system will also keep a record of this action if you're configured to track those kinds of events.

## Function getNavigationRoute

This function helps you figure out the path a client has taken through an AI agent swarm. It essentially tells you which agents a client has interacted with, giving you a clear picture of their journey. You provide the client's unique ID and the name of the swarm you're interested in, and it returns a list of agent names they've visited. Behind the scenes, it uses a navigation service to get this information, and it can optionally log details depending on how the system is configured.

## Function getMCP

This function lets you fetch the definition of a specific Model Context Protocol (MCP) from the system. Think of an MCP as a blueprint that describes how an AI agent interacts with the swarm. You provide the name of the MCP you're looking for, and the function returns its full schema. The system keeps track of these schemas, and this function provides a way to access them programmatically. If logging is turned on, the request to get the MCP is recorded.

## Function getLastUserMessage

This function helps you quickly access the last message a user sent. It digs into the session history for a specific client, looking for the most recent message they authored. If a user message exists, you're given its content as a string. If not, it returns null, indicating no user message was found. You just need to provide the unique identifier for the client's session to use it.

## Function getLastSystemMessage

This function helps you access the most recent message sent by the system within a specific client's ongoing session. Think of it as retrieving the last instruction or update the system provided. 

It digs through the complete history of messages for that client to find the most recent one labeled as a "system" message. If the system hasn't sent any messages yet, it will return nothing. You need to provide the unique identifier for the client you're interested in to use this function.

## Function getLastAssistantMessage

This function helps you get the last message sent by the AI assistant for a specific client. It digs into the client's conversation history to find the most recent message where the assistant spoke. If the assistant hasn't sent any messages yet, it will return nothing. You just need to provide the unique ID of the client’s session to use it.

## Function getEmbeding

This function lets you fetch the details of a specific embedding that your AI agent swarm is using. You provide the name of the embedding you're looking for, and it returns all the information associated with that embedding, like its structure and data types. Think of it as querying a catalog to understand the format of a particular embedding. The system also keeps a record of this request if logging is turned on.

## Function getCompute

This function lets you fetch details about a specific compute resource within your AI agent swarm. Think of it as looking up the configuration for a particular task or tool your agents use. You provide the name of the compute you're interested in, and the function returns its schema, which describes its settings and capabilities. The system will also record this retrieval if logging is turned on. 


## Function getCompletion

This function lets you fetch a pre-defined completion – think of it as a reusable pattern or template for your AI agents – by its unique name. It's how you access the building blocks your agents will use. Behind the scenes, it also keeps a record of the request if you've set up logging. You just need to provide the name of the completion you want to use.

## Function getCheckBusy

This function lets you quickly see if an AI agent swarm is currently working on a task. You simply provide the unique ID associated with the client session, and it will return `true` if the swarm is busy, and `false` otherwise. It's a simple way to check the swarm's status before sending it new work. The client ID identifies which swarm you’re inquiring about.

## Function getAssistantHistory

This function lets you see what an AI assistant has said during a particular conversation. It pulls up the complete history for a client session and then specifically shows only the assistant's messages. You provide a unique ID for the client session to retrieve the history. The result is a list of messages representing the assistant's responses within that conversation.

## Function getAgentName

This function helps you find out the name of the agent currently working on a particular client's session. You provide a unique ID for the client, and the function returns the agent's name. It ensures the client session is valid and handles the process securely, retrieving the agent's name from the swarm system. This is a simple way to identify which agent is responsible for a specific client interaction.

## Function getAgentHistory

This function lets you see the past interactions and adjustments made for a particular agent within a swarm. It's like looking at an agent’s log, but it also includes any "rescue" strategies applied to keep things running smoothly.

You'll need to provide the client ID, which identifies the session, and the agent's name to retrieve its history. 

The system ensures the request is valid and keeps a record of the process, pulling the agent’s history from the central history service. It's designed to run independently, minimizing any interference from other ongoing processes.

## Function getAgent

This function lets you fetch the details of a specific agent within your AI agent swarm. You provide the agent's name, and it returns all the configuration information associated with that agent. The system keeps track of these requests if logging is turned on. Think of it as looking up an agent's profile within the swarm. It’s useful when you need to know exactly how an agent is set up.

## Function getAdvisor

This function lets you fetch the configuration details for a specific advisor within your AI agent swarm. Think of it as looking up the blueprint for how an advisor should behave. You simply provide the name of the advisor you’re interested in, and the function returns its schema – which defines its capabilities and settings. The system will also record this retrieval if logging is turned on.

## Function fork

This function lets you run a piece of code – a function you provide – in a controlled environment, making sure everything related to that code's session is handled automatically. Think of it as creating a temporary, isolated space for your code to operate. 

You give it a function that contains the actual work you want to do. This function will receive a unique client ID and the name of the agent it's associated with. You also pass in some settings, like the client ID and the swarm name, to configure how this controlled environment behaves. The function then runs your code and returns the result. 


## Function executeForce

This function lets you send a message or command directly to an agent within your swarm, acting as if it came from a client. It's particularly useful for things like inspecting an agent’s work or starting a conversation between a model and your application. 

Unlike other functions, it doesn't wait to see if the agent is currently active – it forces the command to run even if the agent’s state has changed.  You provide the message content and a unique identifier for the client session, and the system handles validating the session, tracking performance, and ensuring a clean execution environment.

## Function execute

This function lets you send messages or commands to a specific agent within a group of agents working together. Think of it as directly communicating with one agent on behalf of a user or application. 

It's useful for things like reviewing an agent's work or starting a conversation between an agent and your system. 

Before sending the message, it makes sure the agent is still part of the group, the connection is valid, and then sends the content with tracking to monitor performance and keep everyone informed. It essentially creates a fresh, clean workspace for the message to be processed within a controlled environment.

## Function event

This function lets you send custom messages, called events, to other parts of your AI agent system. Think of it as a way for different agents to communicate with each other. 

You specify a unique identifier for the sender (`clientId`), a topic name to categorize the message, and the actual data you want to share (`payload`). The system makes sure you aren’t using any special, reserved topic names. 

Essentially, it’s a straightforward way to broadcast information within your agent swarm.

## Function emitForce

This function lets you send a piece of text directly as output from the AI agent swarm, like a simple message. It skips the usual processing of incoming messages and doesn't check which agent is currently active.

It’s specifically for sessions that were started using `makeConnection`, ensuring everything works together properly. The system sets up a fresh environment, verifies the session and swarm, and won't work if the session wasn't created through `makeConnection`.

You provide the text you want to send (`content`) and a unique ID for the session (`clientId`). The system keeps a record of this action if logging is enabled, and confirms when the text is successfully sent.

## Function emit

This function lets you send a message as output from an agent in the swarm, as if it were generated by the agent itself. 

It's specifically intended for use when you've established a connection using `makeConnection`, and allows you to inject content without triggering the normal message processing flow. 

Before sending, it double-checks that the connection, the swarm, and the agent you're referencing are still valid and active. It also creates a fresh environment for the action and keeps a log of what's happening. You can only use this function if the connection mode is set to "makeConnection."

You provide the message content, a unique identifier for the client session, and the name of the agent associated with the output.

## Function commitUserMessageForce

This function lets you directly add a user's message to the conversation history of an agent within a swarm session. It's useful when you need to record a message without automatically triggering a response from the agent, or when you want to ensure a message is recorded even if the agent isn’t currently active.

Think of it as a way to manually inject a message into the agent’s memory.

The function takes the message content, the execution mode, a client identifier, and optionally a data payload. It handles internal checks and logging, then adds the message to the agent's history. The function ensures that the process runs in a clean environment, independent of other ongoing operations.

## Function commitUserMessage

This function lets you add a user's message to an agent's record within a swarm session, essentially documenting the interaction. Think of it as quietly updating the agent's memory without actually prompting it to respond.

You provide the message content, the execution mode, a client ID to identify the source, and the name of the agent you're updating.  There's also an optional payload for any extra data you need to associate with the message. 

It makes sure everything is set up correctly before adding the message, logs what’s happening, and then securely handles the update within the swarm system. It runs in a controlled environment to prevent unexpected interference.


## Function commitToolRequestForce

This function allows you to directly push tool requests to an agent within the swarm, even if some validations might be skipped. It's like giving a direct order to the agent, useful in situations where you need to bypass certain checks. You're essentially telling the system to execute these requests immediately, and it does so under the watchful eye of the system’s context management and logging features. The function takes a list of tool requests and a client identifier, then returns a promise resolving to an array of strings.

## Function commitToolRequest

This function sends tool requests to a specific agent within your AI agent swarm. It makes sure the agent is valid and the session is active before sending the requests. Think of it as a secure way to tell an agent, "Hey, please do these tasks!" The function also handles the background work of keeping track of the execution context and recording what's happening. You’ll need to provide the requests themselves, a client identifier for tracking, and the name of the agent you want to target.

## Function commitToolOutputForce

This function lets you directly send the results from a tool back to the agent swarm, even if you're not entirely sure the agent is still actively participating. It's a shortcut for pushing tool output, essentially forcing the commit without a prior check on the agent's status.

Think of it as a direct line for delivering tool results – it handles the technical details of validating the swarm and logging the action, and then pushes the data to the session's public service. It ensures a fresh execution environment to avoid conflicts with other operations.

You'll need to provide the tool's ID, the actual result content, and the client's unique ID to use this function.


## Function commitToolOutput

This function lets you record the results of a tool's work within your AI agent swarm. Think of it as telling the system, "Hey, this tool just finished, and here's what it produced!" 

It makes sure the agent you're referencing is still actively involved in the process, ensuring everything stays synchronized. 

The process includes checks to keep things running smoothly and creates a fresh environment for the task. 

You’ll need to provide the tool’s ID, the results of its work (the content), a client identifier, and the name of the agent involved.

## Function commitSystemMessageForce

This function lets you directly push a system message into a session within the swarm, bypassing the usual checks for which agent is active. It's designed for situations where you need to ensure a system message is recorded, regardless of the current agent state.

Think of it as a way to forcefully commit a message; it validates the session and swarm before proceeding. It handles things like logging and session management behind the scenes, relying on several internal services to do the heavy lifting. 

You'll provide the message content and a unique identifier for the session to use this function. It's similar to the "force" commit option for assistant messages, offering a more direct way to record system messages.


## Function commitSystemMessage

This function lets you send special messages directly to an agent within the system – these aren’t responses from the AI, but rather instructions or configurations for the agent itself. 

Think of it as a way to communicate with the agent to tell it to do something specific.

Before sending the message, the system makes sure everything is set up correctly: that the agent and session exist, and that you're authorized to send messages to that particular agent. 

The function handles the behind-the-scenes details like managing the execution context and keeping a record of the message for tracking purposes. It's designed to work alongside functions that handle regular AI responses, offering a way to control the behavior and setup of your agents.

You'll need to provide the message content, a unique identifier for the client session, and the name of the agent you want to send the message to.

## Function commitStopToolsForce

This function provides a way to immediately halt the execution of tools for a particular client within the swarm. It's designed to be a forceful stop, bypassing usual checks to ensure the process is stopped regardless of what's currently happening.

Think of it as an emergency brake for tool execution – it’s used when you need to stop things quickly and don’t want to wait for normal checks to complete. It requires a client identifier to specify which session should be stopped. 

Behind the scenes, it carefully validates the session and the swarm before proceeding and keeps track of what's happening with logging. It’s similar to a forceful flush operation, but specifically for stopping tool execution.

## Function commitStopTools

This function lets you temporarily halt a specific agent’s tool execution within the swarm. Think of it as pausing an agent’s work – it prevents the agent from running its next tool. It carefully checks that you're stopping the correct agent within the right session and swarm to avoid any mistakes. It’s designed to work alongside other functions like commitFlush, but instead of wiping the agent’s memory, it just pauses its current actions. You’re telling the system, "Hold on, don't let this agent run its next tool for now." It requires the client’s ID and the name of the agent you want to pause.

## Function commitFlushForce

This function lets you forcefully clear the agent’s history for a particular user session. It's designed to be a more direct way to flush the history, bypassing checks to see if an agent is currently active. 

Think of it as a “reset” button for the agent’s memory for a specific user. 

It ensures the session and swarm are valid before proceeding with the history flush and keeps a detailed log of the process. This is helpful when you need to guarantee a history clear, even if the agent isn’t actively engaged. You provide the unique ID of the user's session to identify which history to clear.

## Function commitFlush

This function allows you to clear the history for a particular agent within a client's session. It's like hitting a reset button on an agent's memory. Before clearing the history, it double-checks that everything – the agent, the session, and the overall swarm – is set up correctly. 

Think of it as a companion to adding messages to an agent's history; instead of adding, it removes the existing record. 

You'll need to provide the unique ID of the client session and the name of the agent whose history you want to clear. This process is carefully managed and logged to ensure accuracy and track what's happening.

## Function commitDeveloperMessageForce

This function lets you directly push a developer message into a session within the swarm system, bypassing the usual checks for an active agent. Think of it as a way to ensure a message is recorded, even if an agent isn's currently handling the session.

It validates that the session and swarm are valid before committing the message.

You’ll need to provide the message content and the unique identifier for the client session.

This function is like a more forceful version of a regular message commit, similar to how `commitAssistantMessageForce` works compared to `commitAssistantMessage`. It utilizes several services under the hood to manage the session, validate components, and log the operation.

## Function commitDeveloperMessage

This function allows developers to send messages directly to a specific agent within the swarm. It's designed for situations where you need to provide instructions or data to an agent, like giving it new context or guiding its actions.

Before sending the message, the system checks to make sure everything is valid: the agent, the session, and the swarm itself.  It then carefully manages the process, keeping track of the operation and logging it for review.

Think of it as a way to inject developer-created content, distinct from the agent’s automatic responses or system-level communications. You’re essentially telling the agent something directly using a unique client identifier and agent name.


## Function commitAssistantMessageForce

This function lets you directly push a message from an assistant into a session, bypassing the usual checks to see which agent is currently active. 

Think of it as a way to ensure a message gets added to the session regardless of the agent's status – like a “force commit.”

It verifies that the session and swarm are valid before adding the message, and it keeps track of everything through logging. 

You'll need to provide the message content and a unique ID for the client session to use this function.

## Function commitAssistantMessage

This function lets you send a message generated by an AI assistant to a specific agent within your swarm. Think of it as a way to officially record what the assistant said. 

Before sending the message, the system double-checks that the agent, its associated session, and the overall swarm are all valid and that you're targeting the correct agent. 

It handles the details of keeping track of the context, logging everything that happens, and uses various services to make sure everything is secure and accurate. This function is useful for persisting assistant responses, unlike actions that might cancel or discard them.

You’ll need to provide the actual message content, a unique ID for the client session, and the name of the agent you want to associate the message with.

## Function chat

This function lets you interact with your AI agents by sending them a conversation. You provide the name of the AI service you want to use and a list of messages representing the ongoing conversation. The function then handles sending those messages to the AI service and returns the AI's response as a string. Think of it as the main way to have a back-and-forth dialogue with your AI agents.

## Function changeToPrevAgent

This function lets you switch a client back to a previous agent they were using, or to the default agent if they haven’t used one before. Think of it as a "back" button for agent selection. 

It handles the necessary checks to make sure the client and agent are valid, and keeps track of what's happening by logging if logging is turned on.  The change is managed carefully to avoid any conflicts and is designed to run independently of other processes. 

You need to provide the unique ID of the client's session to tell the system which client you're referring to.

## Function changeToDefaultAgent

This function helps you easily switch a client back to the swarm's standard agent. Think of it as a reset button for a client's agent assignment. It ensures the change is handled safely and reliably, verifying everything is set up correctly before making the switch and handling it in a way that doesn't interfere with ongoing tasks. You just need to provide the unique identifier of the client session you want to revert.

## Function changeToAgent

This function lets you switch which AI agent is handling a specific client session within your swarm. Think of it as assigning a different specialist to assist a client. It checks to make sure the session and agent are valid before making the change, and keeps a log of the switch if you’ve enabled that feature. The change happens in a controlled way, ensuring it’s handled reliably and doesn’t interfere with other ongoing operations. You provide the name of the new agent and a unique ID for the client session to make the switch.

## Function cancelOutputForce

This function lets you quickly and forcefully stop an agent from generating output for a particular client. It’s a way to interrupt the process without worrying about whether the agent is currently active or what it's doing. 

Think of it as an emergency stop button. 

It ensures the session and swarm are valid before canceling the output by sending an empty string, and handles all the necessary checks and logging behind the scenes. It’s a more direct approach compared to other cancellation methods because it bypasses some usual checks for speed and reliability. You just need to provide the client's ID to use it.

## Function cancelOutput

This function lets you stop an agent from producing more output for a particular client. It's useful if you realize you don't need the agent’s response anymore.

Essentially, it sends a signal to the agent, telling it to stop generating output, and cleans up any ongoing operations.

The function carefully verifies that the agent you're trying to stop is the one you expect, and it keeps track of what's happening through logging.

To use it, you'll need the unique identifier of the client and the name of the agent you want to cancel the output for.


## Function ask

This function lets you send a message to a specific advisor within your AI agent swarm and get back a response. You can send different kinds of messages – it could be a simple text string, or something more complex like an object or even a file. Think of it as posing a question or giving a task to a particular agent and waiting for their answer. The `message` parameter contains what you want to send, and `advisorName` tells the system which agent should handle it.

## Function addTriageNavigation

This function lets you set up a way for your AI agents to easily connect with a specialized triage agent, almost like providing a direct line for them to request help or guidance. It takes a configuration object that defines how this connection works, and then returns a unique identifier that confirms the navigation tool has been successfully registered. Think of it as creating a specific pathway within your AI agent system to ensure smooth handoffs and efficient problem-solving. The returned identifier can be used to manage or modify the triage navigation later on.

## Function addTool

This function lets you add new tools that agents can use within the system. Think of it as registering a new skill for your agents to leverage – they won’t know about it unless you add it here.

When you add a tool, it's essentially making it available for agents to perform specific tasks. The function ensures the registration happens in a clean environment and provides confirmation by returning the tool's name. You’ll need to define the tool’s details, like its name and how it functions, when you register it.

## Function addSwarm

This function lets you create a new group of AI agents, essentially defining how they'll work together to handle client sessions. Think of it as setting up a blueprint for how your agents will interact and manage tasks. It’s the way you register a swarm so the system knows about it and can use it. The system ensures this creation happens in a controlled environment, and it will give you a unique name for the swarm once it’s created. You’ll need to provide a schema that defines the swarm's structure and how the agents within it should operate.

## Function addStorage

This function lets you add a new way for the swarm system to store data, like connecting to a database or cloud service. Think of it as registering a tool that the swarm can use to remember things. Only storage methods registered this way will work with the swarm. 

If the storage is meant to be shared across agents, the system will automatically connect and wait for it to be ready. It runs in a special, clean environment to avoid any conflicts with what's already happening. The function will confirm the addition and give you the storage's name so you know it's successfully added.

You provide a description of the storage you want to add – essentially, a blueprint of how it works.

## Function addState

This function lets you define and register new states within the system, essentially creating containers for information that your AI agents can share and use. Think of it as adding a new type of data structure the swarm understands. Only states registered this way are recognized, so it's essential for creating the building blocks of your AI agent workflows. If the state is intended to be shared across agents, the function automatically handles setting up the connection and waiting for the shared state service to be ready. It ensures the process runs cleanly and independently, and provides confirmation by returning the state’s name. You can update existing states using this function, too.

## Function addPolicy

This function lets you define and register rules, or "policies," that govern how agents within the swarm operate. Think of it as setting up the guidelines for how agents should behave. It registers your policy with services that handle both validating the policy itself and managing its definition. This helps ensure your agents follow your intended rules and allows for consistent behavior across the swarm. The process is carefully tracked and logged, and it’s an important part of setting up the entire system, working alongside other functions that manage agent actions. You provide a schema defining the policy, and the function takes care of the rest.

## Function addPipeline

This function lets you register a new pipeline configuration or update an existing one. Think of it as adding a blueprint for how your AI agents will work together. It checks to make sure your blueprint is valid before adding it to the system, ensuring everything's set up correctly. The function returns a unique identifier for the pipeline, so you can easily refer to it later. You can provide partial updates to an existing pipeline, modifying just the parts you need to change.

## Function addOutline

This function lets you add or update an outline schema within the AI agent swarm. Think of an outline schema as a blueprint for how your agents will structure and organize information. When you call this function, it registers the schema, making it available for your agents to use. 

The function ensures everything runs smoothly and avoids conflicts with other ongoing operations. It also keeps a record of the action if logging is turned on. 

You provide the outline schema as input, which can be a complete definition or just changes to an existing one.

## Function addMCP

This function lets you add a new Model Context Protocol (MCP) to the system. Think of an MCP as a blueprint for how an AI agent shares information and context with others. By providing a schema definition, you’re essentially telling the framework how this new protocol works. The function returns a unique identifier for the registered MCP, allowing you to refer to it later. 

It's a crucial step in expanding the types of interactions your AI agents can have within the swarm.

## Function addFetchInfo

This function helps you set up a tool that lets your AI agent pull information – think of it as a way for the AI to "read" data without making any changes. 

You provide a configuration object, and the function registers this tool so the AI can use it.  Before the AI gets the data, it's possible to set up a validation step to make sure the AI is requesting the information in the right format. If validation fails, the tool won't execute.  If the data retrieval is successful, the AI gets the content; if the data is empty, a special handler can be triggered to manage that scenario.

## Function addEmbedding

This function lets you add a new embedding engine – think of it as a specialized tool for understanding and comparing text – into the swarm's toolbox. By registering your embedding engine with this function, you're telling the swarm, "Hey, I've built something that can help you understand text better!"  The swarm will only use embedding engines that are registered this way. To keep things clean and organized, the registration process runs independently of other ongoing tasks. Once registered, the function returns a name that identifies your new embedding engine. 

The key input is a schema that defines how your embedding engine works.

## Function addCompute

This function lets you register a new type of computational task for your AI agents, or update an existing one. Think of it as defining what kind of work your agents can do. It checks that the task definition is correct and then makes it available for the system to use. You provide a description of the task, and the function returns a unique identifier for that task. This identifier is how you’ll refer to this task when assigning it to an agent.



You can either create a brand-new task type or modify an existing one by providing partial updates.

## Function addCompletion

This function lets you add a new tool for generating text completions to the system. Think of it as adding a new language model or framework – like GPT4All or OpenAI – that agents can use. It registers the details of this tool, making it available for agents to use when they need to generate text. The process is handled carefully to keep things running smoothly, and you'll get a name confirming the tool has been successfully added. You provide a schema that describes how this tool works.

## Function addCommitAction

This function lets you define a specific action an AI agent can take to modify something – think of it as giving the AI a tool to write or change data. When the AI wants to use this tool, it sends information about what it wants to do.

First, the function checks if the information it received is correct. If not, it reports the error and stops. If everything looks good, the function actually performs the action and provides feedback to the AI. 

Essentially, it’s how you set up a step-by-step process where the AI can request changes, and your system handles those requests safely and reliably. You provide the instructions on how to validate and execute this action.


## Function addAgentNavigation

This function lets you set up a way for one agent in your swarm to easily navigate and interact with another. Think of it like giving one agent a direct connection or pathway to another. You provide some configuration details, and the function creates and registers this navigation tool, essentially telling the system how these two agents should be linked. It returns a unique identifier for this established connection, so you can manage it later if needed.

## Function addAgent

This function lets you register new agents to be used within the swarm. Think of it as officially adding an agent to the system so the swarm can recognize and utilize it.  You provide a schema describing the agent, and the system handles the rest, ensuring it's properly validated and ready for use.  Only agents registered this way can participate in swarm operations. The process is designed to run independently, keeping things clean and avoiding interference with existing workflows, and confirms the agent's name upon successful addition.

## Function addAdvisor

This function lets you register a new advisor into the agent swarm system. Think of an advisor as a specialized expert that can contribute to conversations. You provide a definition of the advisor, including its name and how it handles chat interactions, and the system takes care of making it ready to be used. This effectively adds the advisor to the pool of available experts the swarm can tap into.

# agent-swarm-kit classes

## Class ToolValidationService

This service helps ensure that the tools used by your AI agents are properly configured and registered within the swarm. It keeps track of all the tools the swarm knows about, making sure each one is unique and exists before it’s used.

Think of it as a tool registry and checker – when a new tool is added, this service registers it. And when an agent tries to use a tool, this service verifies that the tool is actually registered.

It works closely with other parts of the system, like the tool registration service and the agent validation service, making sure everything plays nicely together. To keep things efficient, it remembers previously validated tools, avoiding unnecessary checks. Logging is also included, allowing you to monitor tool validation activities.

## Class ToolSchemaService

This service manages the blueprints for the tools that agents use. Think of it as a central library where all the instructions for a tool – like how to call it, how to validate its input, and what data it provides – are stored and organized.

It works closely with other services to ensure agents are properly equipped with the correct tools, and that those tools are reliable and consistent. The system checks new tools to make sure they have the essential information, and it keeps a record of them for easy access. You can register new tools, update existing ones, and retrieve them whenever needed. This system enables agents to perform specific tasks within the swarm, and it helps maintain a standardized approach to agent tooling.

## Class ToolAbortController

This class helps you manage the process of stopping asynchronous tasks, like those used by your AI agents. Think of it as a way to send a "cancel" signal to a running operation. 

It creates and holds an `AbortController`, which is a standard way to signal cancellation in JavaScript. If your environment doesn't support `AbortController`, this class gracefully handles that by doing nothing.

The `abort` method is the key – calling it sends that cancellation signal, effectively telling the operation to stop what it's doing.

## Class SwarmValidationService

The SwarmValidationService is like a quality control system for your AI agent swarms. It keeps track of all registered swarms and makes sure they're set up correctly.

It ensures each swarm has a unique name and valid configurations, like checking that the list of agents and policies are accurate. When you add a new swarm or modify an existing one, this service verifies everything lines up.

It works closely with other parts of the system, like the service that manages swarm registration, and uses smart caching to speed up the validation process. Think of it as a central place to confirm that your swarms are healthy and ready to go. It also logs all its actions for troubleshooting.

## Class SwarmSchemaService

This service acts as a central place to define and manage the blueprints for your AI agent swarms. Think of it as a library where you store the configurations that tell your agents how to work together.

It ensures these configurations are valid before they're used, checking for things like correct agent names and valid policies. This service is crucial for setting up the core components of your swarm system, including the agents themselves and how they interact.

It utilizes a registry, similar to a database, to store these swarm configurations. You can register new configurations, update existing ones, and retrieve them when needed.  The service keeps a log of these operations, helping you track changes and troubleshoot issues. It’s deeply integrated with other parts of the system, ensuring everything connects properly and works as expected, from configuring a new swarm to making sure agents are executing correctly.

## Class SwarmPublicService

This class provides a way to interact with a swarm of agents, acting as a public interface for common operations. It handles tasks like sending messages, navigating the agent flow, checking the swarm's status, and managing output. Think of it as a central hub that makes it easier to control and observe a group of agents working together, always aware of who's using it (the client) and which swarm is involved.

It logs actions for debugging if enabled, and relies on other services to handle underlying tasks and keep track of performance. This class offers methods for everything from getting the current agent’s name to safely cleaning up a swarm’s resources when it’s no longer needed. It helps coordinate activity between different components of the system, keeping things organized and traceable.


## Class SwarmMetaService

The SwarmMetaService helps manage and visualize the structure of your AI agent swarms. It takes information about your swarms – their schemas and agents – and organizes them into a tree-like structure. This structure can then be converted into a standard UML diagram, making it much easier to understand and document how your swarms are built and how their components relate to each other. 

Think of it as a translator that takes complex swarm data and turns it into a clear, visual representation. It works closely with other services to ensure consistency in logging and documentation, and it's particularly useful when you need to create diagrams for things like swarm architecture or agent relationships. It builds these diagrams by pulling data from other services and then transforms it into a format that can be easily displayed.

## Class SwarmConnectionService

This class, `SwarmConnectionService`, acts as the central hub for managing how your AI agents work together within a defined "swarm." Think of it as a traffic controller, efficiently handling connections and operations. It remembers previously created swarms to avoid unnecessary setup and ensures smooth communication.

Here's a breakdown of what it does:

*   **Connects and Creates Swarms:**  It retrieves or creates a connection to a specific swarm, caching these connections for speed and efficiency.
*   **Handles Agent Interaction:**  It helps agents communicate, retrieve output, and control their state (busy or idle).
*   **Manages Navigation:** It helps navigate between agents within a swarm.
*   **Provides Communication:** Allows sending messages and controlling agent output.
*   **Keeps Things Organized:** Uses logging and caching to make everything more efficient and traceable.

Essentially, this service simplifies the process of working with AI agents in a coordinated fashion, providing a standardized way to manage their interactions and lifecycle.

## Class StorageValidationService

This service is responsible for making sure all the different storage configurations used by your AI agents are set up correctly. It keeps track of all registered storages and their details, preventing duplicates and ensuring that the configuration information is valid.

The service works closely with other parts of the system, like the storage registration service and the component that handles storage operations. It also checks that embeddings are properly configured.

You can register new storage configurations with the service, and it will validate them to confirm everything is as it should be. The validation process is designed to be efficient, so it doesn't slow down the overall system.

## Class StorageUtils

This class provides a set of tools for managing data storage associated with different clients and agents within the swarm. It handles tasks like retrieving, updating, deleting, and listing data, ensuring proper authorization and registration before interacting with the underlying storage service.

The `take` method fetches a limited number of items based on a search query, while `upsert` lets you add or modify data.  You can also remove specific items with `remove` or retrieve a single item with `get`. `list` allows retrieving all items in a storage, potentially filtered. 

For more advanced operations, `createNumericIndex` establishes an index for quicker searches, and `clear` removes all data.  Before any action, the system verifies permissions and confirms that an agent is authorized to use the requested storage.

## Class StorageSchemaService

The StorageSchemaService acts as a central hub for managing how your AI agents interact with storage. It keeps track of storage configurations, ensuring they’re set up correctly and consistently across the system. Think of it as a librarian for storage blueprints.

It uses a registry – a kind of organized list – to store these blueprints. Before adding a new blueprint, it does a quick check to make sure it's complete and makes sense.

This service works closely with other parts of the system, like those that handle connections to storage and manage agent configurations. It’s a foundational piece that helps to keep your agent storage setup reliable and easy to manage. When something changes about the storage, this service lets you update the existing blueprint, ensuring everyone's on the latest version. Getting a specific blueprint is also straightforward—you just ask for it by name.

## Class StoragePublicService

This service manages storage specifically for each client, distinct from system-wide storage. It allows you to perform common storage operations like retrieving, adding, updating, deleting, listing, and clearing data, but always tied to a particular client’s context.

It relies on other services for logging, connecting to the underlying storage, and managing method contexts. Think of it as a layer of abstraction that ensures each client's data is isolated and handled correctly.

Here’s a quick rundown of what it offers:

*   **`take`**:  Fetches a list of items based on a search and optionally a score, identifying them by client and storage name.
*   **`upsert`**:  Adds or updates an item within a client’s storage space.
*   **`remove`**:  Deletes a specific item from a client’s storage.
*   **`get`**: Retrieves a single item by ID from a client’s storage.
*   **`list`**: Retrieves all items in a client’s storage, with options to filter the list.
*   **`clear`**: Empties all data from a client’s storage.
*   **`dispose`**: Cleans up resources related to a client’s storage.

Essentially, it's designed to keep client data organized and separate within the larger system.

## Class StorageConnectionService

This service manages how the system connects to and interacts with storage, like databases or file systems, for each agent. It cleverly reuses storage connections to avoid overhead, caching them for efficiency.

Think of it as a central hub that handles requests for storage. It delegates specific tasks—like retrieving, updating, or deleting data—to individual storage areas. It distinguishes between publicly shared storage and private storage for each agent, and tracks shared storage separately to ensure proper cleanup.

This service is a key component in the agent swarm system, working closely with other services to handle storage configurations, manage sessions, and track usage. Logging is enabled for troubleshooting, and everything is designed to be efficient and secure.

## Class StateValidationService

This service helps manage and ensure the consistency of data representing the status of your AI agents. Think of it as a data quality controller. 

You define the expected structure of this data – what information is needed and in what format – using the `addState` method.  The `validate` method then checks if the actual data received matches your defined structure, letting you know if there are any problems. 

The service keeps track of all the defined data structures internally using a map, and includes logging capabilities to help with debugging.

## Class StateUtils

This class helps manage the data associated with each client and agent in the system. Think of it as a tool to safely get, update, and reset information specific to a particular client’s interaction with a specific agent. 

You can use it to fetch existing data, like retrieving a client's preferences or the status of a task. It also allows you to update that data, either by providing a new value directly or by calculating the new value based on what already exists. Finally, it offers a way to completely reset data for a client and agent back to its original state. The system ensures that only authorized clients and agents can access and modify the data, and all operations are logged for tracking.

## Class StateSchemaService

This service acts as a central place to manage the blueprints for how your agents handle state. Think of it as a library of state definitions, each outlining how agents should interact with and store data.

It ensures these state definitions are consistent and valid before they're used by other parts of the system, like when agents are configured or when shared states are set up. It does this by performing a quick check on each definition to make sure it has the essential parts.

The service keeps track of these state blueprints using a specialized registry, making it easy to find and use them. It also logs key operations to help with debugging and monitoring. When updates are needed, you can override existing blueprints, and it integrates closely with other services involved in agent configuration and state management.

## Class StatePublicService

This service manages state specifically tied to individual clients within the swarm system. Think of it as a way to keep track of information unique to each client, distinct from system-wide settings or persistent storage. It uses a central state connection service to perform the actual state operations, but adds extra layers of context and logging for better tracking and control.

You'll find this service used in different areas, such as within the ClientAgent to handle client-specific actions or by the PerfService to monitor how state changes affect individual client sessions.

The core functions allow you to set, clear, retrieve, and release this client-specific state. Each operation is wrapped with extra information for logging and scoping, making it easier to understand what's happening with each client's data. It's designed to be a clear and controlled way to manage client-specific information within the swarm.

## Class StateConnectionService

This service manages how agents store and access state information within the swarm system. It acts as a central point for handling different types of state – client-specific and shared – ensuring efficient and thread-safe operations.

Think of it as a smart container that holds state data for individual agents. It intelligently reuses these containers to avoid unnecessary overhead, and makes sure updates are handled in a reliable way.

Here's a breakdown of what it does:

*   **State Handling:** It provides a consistent way to get, set, and clear state for individual agents.
*   **Shared State:** It works with a separate service to manage state that's shared across multiple agents.
*   **Smart Caching:** It remembers which states have already been created, so it doesn't have to recreate them every time.
*   **Thread Safety:**  It makes sure that updates to the state happen in the correct order, preventing conflicts.
*   **Cleanup:** When an agent is finished, this service ensures that its state information is properly cleaned up.



It’s heavily integrated with other parts of the system, like the logging service, event bus, and state schema service, to ensure everything works together seamlessly.

## Class SharedStorageUtils

This class provides a simple way to interact with the shared storage used by your agent swarm. Think of it as a toolbox for managing information across your agents.

You can use it to retrieve items, like fetching a specific document or a list of tasks, using `take` and `get`.  `upsert` lets you add new information or update what's already there. If you need to remove something, `remove` handles that.  `list` allows you to see everything in a particular storage area, and you can even filter that list. Finally, `clear` provides a way to completely wipe a storage area clean. Each of these operations is designed to be safe and reliable within the swarm environment.

## Class SharedStoragePublicService

This service handles interactions with shared storage across the system, acting as a public gateway for other components. It provides ways to get, put, update, delete, list, and clear data from shared storage areas. It’s designed to be used by various parts of the system, like client agents and performance tracking, and keeps a record of these operations for debugging and auditing purposes, if logging is enabled.

Here's a breakdown of what it lets you do:

*   **Get Data:** Retrieve a list of items based on a search, or a single item by its ID.
*   **Put/Update Data:** Add new items or update existing ones.
*   **Delete Data:** Remove items from storage.
*   **List Data:** Retrieve all items in a storage area, potentially filtered.
*   **Clear Storage:** Remove all items from a storage area.

This service uses other internal services for the actual storage operations and ensures that all actions are properly tracked and scoped within the system.

## Class SharedStorageConnectionService

This service manages shared storage for all clients in your swarm system, acting as a central hub for data. It ensures that only one instance of the storage exists, preventing conflicts and maintaining consistency across the entire system.

Think of it as a shared whiteboard where all agents can read and write – this service controls access to that whiteboard and makes sure everyone's changes are synchronized.

It gets help from other services like the logger, bus (for announcements), and schema services to configure and manage the storage.  The `getStorage` function is the main way to access a shared storage space, cleverly caching instances to optimize performance.

You can use it to retrieve data (`get`, `list`), add or update data (`upsert`), delete data (`remove`), and even clear the entire storage (`clear`). The `take` function lets you retrieve data based on a search query, potentially using similarity scores to find relevant items. Overall, this service simplifies working with shared data in a distributed environment.

## Class SharedStateUtils

This class provides simple tools for your agents to share information within the swarm. Think of it as a shared whiteboard where agents can read, write, and erase data.

You can use `getState` to check what's currently written on the whiteboard for a specific label. 

`setState` allows agents to update the whiteboard, either by providing a new value directly or by providing a function that calculates the new value based on what was already there.

Finally, `clearState` lets an agent completely wipe the whiteboard for a specific label, returning the initial value.

## Class SharedStatePublicService

This service provides a way to manage and share data across different parts of the system, allowing various components like client agents and performance trackers to work together efficiently. It acts as a central hub for accessing and modifying shared data, making sure operations are tracked and controlled.

You can use this service to set new shared data, clear existing data back to its starting value, or retrieve the current data that's being shared. Every action is carefully tracked through logging, and these operations are integrated with other services to provide a consistent and reliable way to handle shared information. Essentially, it's a controlled and organized way to share data across the swarm.

## Class SharedStateConnectionService

This service manages shared data accessible across all agents in your system. Think of it as a central whiteboard that everyone can read and, with proper permissions, write to. It ensures that all agents are working with the same version of the data, preventing inconsistencies.

It uses a clever caching system to avoid creating unnecessary copies of the shared data, making it efficient. When you need to update the shared data, it queues those changes to make sure everything happens in a safe, thread-friendly manner.

You can retrieve the current state, update it using a function that transforms the previous state, or completely reset it to its initial value. The service logs its actions when logging is enabled, and it works closely with other system components like the state schema and agent connection services to ensure everything is set up correctly and secure. It provides a consistent API mirroring what other parts of the system use, making interactions predictable and reliable.

## Class SharedComputeUtils

This utility class, `SharedComputeUtils`, helps manage shared computational resources within the agent swarm orchestration system. Think of it as a helper to keep track of and interact with these resources.

The `update` method lets you refresh the information about a specific compute resource, ensuring your system has the latest details.  You provide the name of the compute you want to update.

The `getComputeData` method retrieves information about a compute resource.  You specify the client ID and the compute name, and it returns data related to that compute in a format you define. It's a flexible way to fetch details about a compute resource for use elsewhere in your application.

## Class SharedComputePublicService

This service helps coordinate tasks that involve shared computing resources, keeping track of what's happening and allowing for context-aware execution. It relies on other services for logging and managing the actual compute connections.

You can use `getComputeData` to fetch results that have already been computed. 

If you need to force a recomputation, `calculate` will trigger a fresh calculation.  

`update` lets you manually refresh a shared compute, making sure you're working with the most up-to-date information.

## Class SharedComputeConnectionService

This component manages how different AI agents in your swarm share and use computing resources. It acts as a central hub for accessing and coordinating these resources, ensuring agents can work together effectively.

The service relies on several other services for logging, communication, managing context, handling shared state, and defining compute schemas. 

You can use `getComputeRef` to get a reference to a specific computing resource by name, and `getComputeData` to retrieve the result of a computation.  `calculate` triggers a computation based on a given state name, while `update` refreshes the available resources. Essentially, it's about making sure everyone in the swarm has access to the right computing power and the latest results.

## Class SessionValidationService

This service is responsible for keeping track of sessions within the swarm system and ensuring that everything related to a session – like which agents, storage, states, and swarms are using it – is consistent. Think of it as the central record keeper for active sessions.

It works closely with other services: it registers new sessions, manages usage of resources (like agents and storage) within those sessions, and verifies that sessions exist when needed. It keeps detailed records of what’s associated with each session, using maps to track things like which agents are using which sessions and how those sessions are configured.

The service uses a logger to record its actions and leverages memoization to speed up common validation checks. You can add or remove usage of various resources (agents, storage, etc.) to a session, check if a session exists, or retrieve lists of resources linked to a session. It also handles the cleanup of sessions when they are no longer needed, and it can be cleared for validation caching as needed.

## Class SessionPublicService

This service acts as the public interface for managing interactions within AI agent sessions. It simplifies how you send messages, run commands, and track activity within a session, abstracting away the more complex underlying operations.

Think of it as a messenger that relays instructions to the session, handles incoming messages, and keeps track of what’s happening. It uses other services to log events, measure performance, and manage the session's lifecycle.

You can use it to:

*   **Send messages** to the session for communication.
*   **Execute commands** within the session.
*   **Run stateless completions** for quick responses.
*   **Connect to a session** and establish a real-time messaging channel.
*   **Commit various message types** like tool outputs, system updates, developer notes, and assistant responses to the session's history.
*   **Manage the session’s lifecycle** by disposing of it when it's no longer needed.

Essentially, this service provides a safe and controlled way to interact with sessions while letting other parts of the system handle the details. It also helps in ensuring that all actions are logged and performance is tracked.


## Class SessionConnectionService

This service manages connections and actions within AI agent swarms, acting as a central hub for sessions. Think of it as a way to organize interactions between different agents working together.

It intelligently reuses session instances to improve efficiency, preventing redundant setups. When you need to start a new session, this service fetches existing data or creates one from scratch, making sure everything is set up correctly based on swarm configurations and policies.

It handles sending messages, running commands, and logging activity within each session, and offers a reliable way to manage resources and ensure clean shutdowns when finished. Essentially, it provides a structured and controlled environment for agents to collaborate and perform tasks effectively.


## Class SchemaUtils

This utility class provides helpful tools for working with session data and formatting information. You can use it to store and retrieve data associated with specific clients, ensuring that the session is valid. It also offers a way to convert objects and arrays into strings, which is useful for things like logging or sending data across systems. The serialization function can even help you customize how the data is formatted, allowing you to map keys and values as needed.

## Class RoundRobin

This component, called RoundRobin, helps manage a rotating selection of processes or "instance creators." Think of it as a way to fairly distribute tasks among a set of available workers.

It keeps track of a list of tokens, which are identifiers for these workers, and cycles through them one by one.  Each time you use the RoundRobin, it picks the next worker in the list and executes the task assigned to it.

The `create` method is the main way to set up a RoundRobin. You provide it with a list of tokens and a "factory" function that knows how to create an instance based on each token. The `create` method then returns a function that you can call to perform tasks, automatically rotating through the available workers. It essentially makes managing a rotating set of tasks simple and organized.

## Class PolicyValidationService

This service helps ensure that the policies used by your AI agent swarm are valid and consistent. It keeps track of all registered policies and their definitions, making sure each one is unique. 

When a new policy is added, this service registers it, and when a policy needs to be enforced, it verifies that the policy actually exists. To speed things up, the validation checks are cached, so frequently used policies are validated very quickly. 

The service relies on other components to handle logging and policy registration, working together to maintain a well-managed and reliable system.

## Class PolicyUtils

This class provides tools for managing client bans within your AI agent swarm. Think of it as a helper for keeping unwanted clients out. It offers simple ways to ban a client, unban a client, and check if a client is currently banned, all within the context of a particular swarm and policy. Before taking action, it makes sure everything is set up correctly, ensuring your actions are logged and tracked properly.

## Class PolicySchemaService

This service acts as a central place to manage and keep track of policy definitions used throughout the system. Think of it as a library for rules that control access and behavior. It uses a special registry to store these rules and ensures they have the basic structure needed to work correctly.

When a new rule is added or an existing one is changed, the service checks it to make sure it's valid and records this action for tracking purposes. Other parts of the system, like those responsible for enforcing policies or managing client sessions, rely on this service to get the correct rules to use. It’s a foundational piece for making sure the swarm operates according to its defined policies.

## Class PolicyPublicService

This service handles interactions related to policies within the swarm system. It acts as a public interface, making it easier for other parts of the system to manage things like client bans and data validation. 

Essentially, it provides a way to check if a client is banned, retrieve the reason for a ban, validate incoming or outgoing data based on policy rules, and manage client bans (both applying and removing them). 

It works closely with other services – like those responsible for performance monitoring, client interactions, and documentation – to ensure consistent policy enforcement and helpful information for users.  All operations are logged for debugging and auditing purposes, controlled by a global configuration setting.

## Class PolicyConnectionService

This service manages how policies are applied and enforced within the system. It acts as a central point for things like checking if a client is banned, validating data going in and out, and actually banning or unbanning clients.

Think of it as a layer of rules – it leverages other services to fetch policy details, log actions, and send notifications.  It avoids unnecessary work by caching commonly used policy configurations. The service is designed to work seamlessly with various parts of the system, including client agents, session management, and public API endpoints. It keeps things consistent by using common logging patterns and mirroring functionality found in other key services.

## Class PipelineValidationService

This service helps ensure your AI agent pipelines are set up correctly before they run. Think of it as a quality check system. 

You use it to register your pipeline definitions, essentially telling the system what your pipelines look like. Then, when you're ready to run a pipeline, this service can validate it against its definition to catch any potential errors early. 

It keeps track of your pipeline schemas, and the `validate` method checks if a given source (like a configuration file) aligns with a registered pipeline definition. It also has a logger service for recording validation activities.

## Class PipelineSchemaService

This service helps manage and organize the blueprints for your AI agent workflows, which we call pipeline schemas. It acts like a central repository where you can store, update, and retrieve these blueprints. 

The service relies on a context service to handle schema-related operations, ensuring everything works correctly. You can register new blueprints with unique names, easily replace existing ones with updated information, and then fetch those blueprints when you need them to build your AI agent workflows. Think of it as a well-organized library for your AI agent workflow designs.

## Class PersistSwarmUtils

This class helps manage how information about your AI agents – specifically which agent is currently active and the order they're used – is saved and retrieved. It acts as a central point for handling this data, ensuring that it's consistent and readily available.

You can think of it as a memory for your swarm, remembering which agent a user is working with and the path they took to get there. It’s designed to be flexible, allowing you to customize how this memory is stored, whether it's in a database, a file, or even in memory.

The class provides simple functions to get and set the current agent for each user and swarm, and to track the sequence of agents they’ve used. If you need to change how the information is saved (like using a different storage method), you can easily configure it.

## Class PersistStorageUtils

This class helps manage how data is saved and retrieved for each client within the swarm system. Think of it as a central place to handle persistent storage, ensuring that data is properly stored and easily accessed later.

It provides simple ways to get and set data for a specific client and storage name. If the data isn’t already saved, it can provide a default value.

The class also allows you to customize how the data is actually persisted – allowing integration with different storage technologies like databases – giving you a lot of flexibility. It remembers previously created storage instances to avoid creating unnecessary duplicates and optimize performance.

## Class PersistStateUtils

This class helps manage how information is saved and retrieved for each agent within the swarm. Think of it as a way to remember things about individual agents, like their settings or progress.

It uses a system of `SessionId` (a unique identifier for each agent) and `StateName` (a label for the type of information being saved) to organize this data. You can get and set this information, and the system automatically handles saving it for later use.

Importantly, it’s designed to be efficient, ensuring that only one persistence system is used for each type of data being saved.  

If you need more control, you can even customize how the data is stored using a custom persistence adapter.

## Class PersistPolicyUtils

This class helps manage how the swarm system remembers which clients are banned from participating. It provides ways to find out if a client is currently banned and to update the list of banned clients for a particular swarm. 

The system tries to be efficient by ensuring it only creates one persistence mechanism per swarm.

You can also customize how this data is stored, such as using a different storage method or database, allowing for more specialized tracking and management of banned clients. 

The `getBannedClients` method lets you check if a client is banned, while `setBannedClients` is used to add or remove clients from the banned list.

## Class PersistMemoryUtils

This utility class helps manage how memory data is saved and retrieved for each client within the swarm system. It acts as a central place to handle persistence, ensuring that each client's memory is stored and accessed efficiently.

You can think of it as a way to remember things for each client individually, like their temporary context or other session-specific data. The class uses a smart caching system to make sure you’re not creating unnecessary persistence instances, which saves resources.

If you need more control over where and how the memory is stored, you can even customize the way it persists data by providing your own storage constructor. Finally, when a client’s memory is no longer needed, you can easily clean it up using the `dispose` method.

## Class PersistEmbeddingUtils

This class helps manage how embedding data is saved and retrieved within the swarm system. It provides a way to store embedding vectors, ensuring they're readily available when needed and avoiding unnecessary recomputation. 

You can use it to read existing embeddings from storage, write new embeddings to storage, or even customize how the data is persisted using a custom adapter. This lets you choose how embedding data is tracked – whether it's held in memory or stored in a database, for example.  The system intelligently caches embeddings so the same data isn’t processed repeatedly, making the overall process more efficient.


## Class PersistAliveUtils

This utility class helps keep track of which clients are online and offline within your AI agent swarm. It allows you to easily mark clients as active or inactive, and quickly check their current status. The system remembers these statuses so you can rely on them later. 

The class uses a clever approach to ensure that each client's status is only stored once, which helps to keep things efficient.  You can also customize how the status is saved – for example, using a database instead of just memory.

## Class PerfService

The `PerfService` is responsible for meticulously tracking and logging performance data during client sessions within the swarm system. It essentially monitors how long tasks take, how much data is processed, and the overall state of these sessions.

Think of it as a detailed performance observer for each client interaction, gathering information like execution times, input and output sizes, and session status.  This data is then organized into readily digestible structures (`IPerformanceRecord` and `IClientPerfomanceRecord`) for reporting and analysis.

It works closely with other services—like validation and public services—to pull in necessary details and relies on a logger to record events (when enabled).

Key functions allow you to start and end execution tracking, retrieve performance metrics, and prepare the data for reporting.  The service also contains mechanisms for managing and cleaning up performance data when needed. Basically, it's a central component for understanding and optimizing the performance of the entire swarm system.

## Class OutlineValidationService

This service helps keep track of and verify the structure of outlines used by the agent swarm. It's like a librarian for outlines, making sure each one is properly registered and follows the correct format.

You can use it to add new outline structures, get a list of all registered outlines, and most importantly, check if a specific outline exists and is valid before your agents try to use it. To improve performance, the validation checks are cached, so they don't have to be repeated unnecessarily. This service relies on other services – a logger for recording activity and a completion schema service for handling outline completions – all working together to ensure a reliable system.

## Class OutlineSchemaService

This service helps manage the blueprints for how agents organize their work, called outline schemas. Think of it as a central place to store and update these blueprints.

It keeps track of schemas using an internal registry and relies on other services for logging and context management.

You can use it to add new schemas, update existing ones, or simply retrieve a schema when you need it. Before adding or updating, it checks the schema to make sure it's properly formatted, and it keeps a record of those actions.

## Class OperatorInstance

This class represents a single instance of an operator within an AI agent swarm. Think of it as a specific agent participating in a coordinated effort. 

When creating an instance, you’ll need to provide a unique client ID, the agent’s name, and some optional callback functions to handle specific events.

The `connectAnswer` method allows you to subscribe to incoming answers.  You can send notifications to the swarm using the `notify` method and responses using the `answer` method. The `recieveMessage` method is for receiving messages. Finally, `dispose` cleans up the instance when you’re finished with it.

## Class NavigationValidationService

This service helps keep track of where agents have already been navigated within the swarm, preventing unnecessary movements and wasted effort. It maintains a record of visited agents for each client and swarm, using a clever technique called memoization to store and reuse this information efficiently.

You can think of it as a memory for the swarm's navigation. 

The `beginMonit` function lets you clear that memory and start fresh. The `dispose` function completely removes the record. `shouldNavigate` is the key function that decides whether a navigation attempt is worthwhile, checking the existing record first. The service also integrates with a logging system for keeping tabs on navigation activity.

## Class NavigationSchemaService

This service helps keep track of which navigation tools are being used within the system. It maintains a list of registered tool names, allowing you to easily check if a specific tool is recognized. When you register a new tool, it's added to this list, and the system can optionally log this action. You can then use the `hasTool` method to quickly confirm whether a particular tool is part of the recognized set, which is helpful for validating tool usage and ensuring proper workflow.

## Class MemorySchemaService

This service manages temporary, in-memory storage for data associated with different sessions within the system. Think of it as a simple scratchpad for each session, allowing agents to store and retrieve information without relying on persistent storage. It's designed for quick access to session-specific data and is used in coordination with other services to handle session management, agent runtime, and performance tracking. The information stored here isn't saved permanently; it’s cleared when a session ends or needs to be reset. You can check if data exists for a session, write new data or merge it with existing data, read data back, or completely remove the session's data when it’s no longer needed. Logging is enabled for these operations to help monitor memory usage and activity.

## Class MCPValidationService

This class helps manage and check the structure of Model Context Protocols (MCPs), which are like blueprints for how AI agents share information. Think of it as a librarian for MCPs – it keeps track of them and makes sure they're well-formed.

You can add new MCP structures to the librarian’s collection using the `addMCP` method. 

The `validate` method is used to verify that a particular MCP exists and can be used. 

A logging service is included to help track what's happening as MCPs are added and validated. 

Internally, the class stores all the MCPs in a map, organized by their name.

## Class MCPUtils

This class, MCPUtils, helps manage updates to the tools used by clients connected through the Multi-Client Protocol (MCP). Think of it as a way to ensure everyone is using the right versions of everything. 

You can use it to update the tools for *all* connected clients at once, or to target a specific client for an update. It simplifies the process of keeping those tools synchronized. The `update` method is your go-to for performing these updates.

## Class MCPSchemaService

The MCPSchemaService helps manage the blueprints, or schemas, that define how AI agents interact and share information. Think of it as a central library for these blueprints.

It uses a logger to keep track of what’s happening and relies on a schema context service to handle the underlying management of these schemas.

You can register new schema blueprints, update existing ones with new details, and easily retrieve them by name. It also has a simple check to make sure a new schema is generally structured correctly before it's added to the system.

## Class MCPPublicService

This class helps you manage and interact with tools within a larger AI system using a standardized protocol. Think of it as a central hub for requesting and using different AI tools for specific clients.

It lets you see what tools are available, confirm if a tool exists for a particular client, and actually run those tools with the data you provide.  You can also refresh the list of available tools for all clients or just a single client.  The system relies on other services for logging and handling the underlying communication, and it offers a way to clean up resources when you're finished.

## Class MCPConnectionService

This class helps manage connections and interactions with different AI models using a standardized protocol. Think of it as a central hub for talking to various AI agents and getting work done. 

It keeps track of available tools each agent offers, allowing you to easily list them and check if a particular tool exists. You can also use this class to actually call those tools, providing them with input and receiving results. 

The system remembers previously accessed AI models to improve performance, and provides ways to refresh the list of available tools for individual clients or the entire system. When you're finished, you can tell it to clean up resources associated with a client. It relies on other services like logging, communication, and schema management to operate.

## Class LoggerService

The LoggerService handles logging messages within the swarm system, ensuring that information is recorded effectively and consistently. It combines system-wide logging with client-specific logging, making it possible to track events at a detailed level while also providing a reliable fallback mechanism.

It uses context information—like which client is involved and what’s currently being executed—to add detail to log entries. You can control the types of logs generated, from general information to very detailed debug messages, using configuration settings.

The system also provides the ability to switch out the main logging mechanism at runtime, which is useful for things like testing or tailoring logging behavior for different environments. Think of it as a flexible tool to keep track of what's happening in your swarm, giving you the details you need when you need them.

## Class LoggerInstance

The LoggerInstance helps manage logging specifically for a particular client, allowing you to customize how and where log messages appear. It’s designed to work alongside a global configuration to control whether messages go to the console and to provide hooks for your own custom logging behavior.

When you create a LoggerInstance, you give it a client identifier and optionally some callback functions. The `waitForInit` method ensures the logger is properly set up, triggering any initialization callbacks. 

You can then use methods like `log`, `debug`, `info`, and `dispose` to record messages, handle debugging information, and clean up resources, respectively. Console output is governed by the global configuration, so you can easily turn it on or off. The `dispose` method allows you to perform a final cleanup and trigger a custom disposal callback.

## Class HistoryPublicService

This service handles how history information is managed and accessed within the system, providing a public interface for different parts of the swarm to interact with agent history. It essentially acts as a gatekeeper, delegating the actual history operations to a lower-level service while adding extra context and logging.

The service allows you to:

*   **Push messages:** Add new entries to an agent's history, which is useful for tracking interactions and events. This is used by other services like the AgentPublicService and ClientAgent.
*   **Pop messages:** Retrieve the most recent entry from an agent's history. Similar to pushing, this function is used in ClientAgent and AgentPublicService.
*   **Convert history to arrays:** Transform the history data into an array format suitable for specific purposes, such as preparing context for an agent or documenting the history.
*   **Clean up history:** Dispose of the agent's history to release resources when no longer needed.

The service keeps detailed logs of these operations, and it integrates with other important services for things like performance tracking and agent documentation. Essentially, it’s about providing a structured and controlled way to work with agent history within the overall swarm system.

## Class HistoryPersistInstance

This component is responsible for keeping track of a conversation's history – the messages exchanged – and saving it so it doesn't disappear. It remembers the history for a specific agent, storing messages in memory and also on disk for safekeeping.

When you start using it, it initializes itself, loading any existing saved data.  You can add new messages to the history, and it will automatically save them.  It also allows you to retrieve and remove messages from the end of the history.  When you’re finished with the history, you can clear it completely, either for a specific agent or globally. This makes sure data persists across sessions and allows for easy access to past conversations.

## Class HistoryMemoryInstance

This class provides a simple way to keep track of messages for an AI agent, storing them directly in memory. It's useful when you don't need to save the history permanently.

When you create an instance, you’re essentially giving it an ID for the agent and setting up optional functions to be called when the history changes – like when a new message is added, removed, or the entire history is cleared.

The `waitForInit` method makes sure the history is ready to use for a specific agent.  You can then use `iterate` to go through the messages in order, potentially applying filters or system prompts. `push` adds new messages, and `pop` removes the most recent one. Finally, `dispose` cleans everything up, optionally removing the history for all agents at once.

## Class HistoryConnectionService

This service manages the history of interactions with individual agents within the swarm system. Think of it as a central hub for keeping track of what’s happened between a client and an agent, like a conversation log. It’s designed to be efficient, reusing history data whenever possible thanks to a clever caching system.

It works closely with other parts of the framework, handling things like logging, event tracking, and validating user permissions. When you need to access or modify an agent's history—whether that's retrieving past messages, adding new ones, or cleaning up resources—this service is the go-to place. It also helps ensure the framework keeps track of how often history data is being used.


## Class ExecutionValidationService

This service helps manage and validate how many times an AI agent is running within a system. It keeps track of active agent executions for each client and swarm, preventing runaway situations where agents spawn too many nested instances.

You can retrieve the current execution count for a client and swarm using `getExecutionCount`, which conveniently caches results for efficiency.  `incrementCount` increases the execution count while also checking for overly deep nesting, and `decrementCount` resets the count when an agent finishes.  If you need a complete reset for a client and swarm, `flushCount` clears all tracked executions, and `dispose` permanently removes the cached execution count data.

## Class EmbeddingValidationService

This service helps keep track of all the embedding models used within your AI agent swarm. Think of it as a registry ensuring each embedding model has a unique name and is properly registered.

It works closely with other services – registering new embeddings with the EmbeddingSchemaService, tracking their use with ClientStorage, and potentially validating them for agents. 

You can add new embeddings to the registry using `addEmbedding`, and the `validate` function checks if a specific embedding model is registered, saving time by remembering previous checks. The service also logs its activities for debugging purposes.

## Class EmbeddingSchemaService

This service acts as a central library for managing how data is represented as numerical vectors, a crucial step for searching and comparing information within the system. It keeps track of these "embedding schemas," essentially blueprints for converting data into a format suitable for searching.

Think of it as a secure and organized place to store and retrieve the rules for calculating those numerical representations. Before any embedding schema is used, it's checked to ensure it’s properly defined, and all actions are logged for transparency.

This service works closely with other parts of the system – the storage layer, the agent execution engine, and the agent definition system – to ensure that embeddings are handled consistently and reliably. It’s a foundational component for any process that involves searching or comparing data based on meaning or similarity. You can register new embedding methods, update existing ones, and easily access them when needed, all while benefiting from built-in validation and logging.

## Class DocService

This class is responsible for automatically generating documentation for your swarm system, including details about swarms, agents, and their performance. Think of it as a tool that makes it easier to understand and maintain your complex AI agent setup.

It works by pulling information from various services – like schema and performance data – and assembling it into Markdown files. The generated documentation includes descriptions, UML diagrams for visualizing agent structures, and performance metrics.

The `dumpDocs` function is your main entry point; it orchestrates the creation of all swarm and agent documentation, organizing the output into a structured directory. You'll also find functions for dumping system-wide and client-specific performance data to JSON files. This whole process is designed to improve developer understanding and make your system more transparent.

## Class ComputeValidationService

This class helps manage and verify the state of your AI agent swarm. Think of it as a central hub for ensuring everything is working correctly. 

It keeps track of different "compute" units – these are essentially the individual components of your swarm – and their expected structures. You can add new compute units, get a list of all registered ones, and most importantly, validate their current state against a predefined schema to catch errors early. The `loggerService` helps track what's happening, and the other services handle schema definitions and state validation.

## Class ComputeUtils

This class provides helpful tools for managing compute resources within the agent swarm. You can use it to update the status of a compute instance, telling the system it's ready or experiencing issues. 

It also lets you easily retrieve information about a specific compute resource, like its configuration or current load, using its client ID and name. The `getComputeData` method is flexible and can return data in whatever format is appropriate for the specific compute resource.

## Class ComputeSchemaService

This service helps manage and organize different schema definitions for your AI agents. Think of it as a central repository where you store and retrieve the blueprints for how your agents understand and process information.

It’s designed to be flexible, allowing you to register new schema types, update existing ones, and easily access them when needed. The schema context service is integrated to ensure that these schema definitions are handled correctly and consistently.  You can register a schema with a specific key, override existing schemas with updated information, and retrieve them using their assigned keys.

## Class ComputePublicService

This component provides a way to interact with and manage compute resources, keeping track of the context in which those resources are used. It relies on other services for logging and handling the actual compute connections.

You can use it to fetch previously computed data, trigger recalculations when needed, force updates to ensure the data is current, and properly clean up resources when they’re no longer required. Each of these actions is performed within a specific method and context, identified by parameters like method name, client ID, and compute name. The component handles the underlying details, allowing you to focus on orchestrating the overall process.

## Class ComputeConnectionService

This class manages connections and data retrieval for compute tasks within the AI agent swarm. It acts as a central point for accessing and updating compute operations. 

The class relies on several supporting services like logging, messaging, method context, schema management, session validation, and state connection to function properly. 

You can use `getComputeRef` to get a reference to a specific compute task, and `getComputeData` to retrieve the results of that task. The `calculate` method triggers a compute operation based on a given state name, while `update` and `dispose` handle ongoing and cleanup tasks respectively.

## Class CompletionValidationService

This service helps ensure that completion names used within the agent swarm are valid and unique. Think of it as a gatekeeper for completion names, making sure they’re properly registered and haven't been used before.

It keeps track of all the approved completion names and checks against this list whenever a completion is used. This helps prevent errors and ensures consistency across the swarm.

The service logs its activities for monitoring and debugging, and it’s designed to be efficient by remembering previous validation results. It works closely with other services to manage completion registration, agent validation, and overall system operations.

## Class CompletionSchemaService

This service acts as a central place to manage the rules and logic that agents use to respond to requests – think of it as a library of pre-defined actions. It keeps track of these actions, making sure they’re properly formatted and available when needed.

It works closely with other parts of the system, such as the agent definition service and the agent connection service, ensuring that agents have access to the correct actions. The service validates these actions to make sure they are usable and logs its activities to keep track of what's happening.

You can register new actions, update existing ones, and retrieve them as needed. This helps to standardize how agents respond and makes it easier to manage complex agent behaviors. The service uses a registry to store and retrieve these actions efficiently, ensuring everything runs smoothly.

## Class ClientSwarm

This class, `ClientSwarm`, is like a conductor for a team of AI agents, making sure they work together smoothly. It manages which agent is currently active and keeps track of where you're navigating between them. Think of it as a central hub for controlling and observing your agents.

It handles things like waiting for an agent to finish a task, canceling a task if needed, and keeping track of which agent you're using. You can subscribe to notifications about agent changes and output messages.

The `ClientSwarm` class is a core component for controlling AI agents in a larger system. It lets you check if the system is busy, emit messages, and manage the agent navigation stack. If something goes wrong, you can cancel an agent's current output, and the entire process is designed to be flexible and easily updated. When you're done with the swarm, there’s a `dispose` method to clean up everything properly.

## Class ClientStorage

This class is responsible for managing how data is stored and retrieved within the swarm system, and it's designed to work with data that can be represented by embeddings. Think of it as a specialized database that can also find similar data based on its characteristics.

It lets you add, update, and remove data, and it keeps track of everything in an internal map for quick access.  When you need to add or remove data, the operations are added to a queue to ensure they happen in a reliable order. 

The class can also generate "embeddings" – numerical representations of your data – so it can efficiently find items that are similar to a given search. 

Key features include:

*   **Adding and Updating Data:** Easily add new data or modify existing entries.
*   **Removing Data:** Delete items from the storage.
*   **Similarity Search:** Find data that is similar to a given search term.
*   **Queueing Operations:** Operations like adding, updating, or removing data are processed in a controlled sequence.
*   **Embedding Generation:** Automatically creates numerical representations of your data to facilitate similarity searches.
*   **Clean-up:** Provides a way to properly shut down and release resources when the storage is no longer needed.

## Class ClientState

This class manages a single piece of data within the swarm system, acting as a central hub for reading, writing, and reacting to changes. It keeps track of pending operations and allows for custom logic to be applied when the data is modified.

It's designed to work closely with other parts of the system, ensuring that changes are handled consistently and that all connected agents are aware of updates. You can subscribe to notifications when the data changes, and it offers ways to initialize, reset, and retrieve the data. When you've finished with the data, the class provides a way to clean up resources properly.

## Class ClientSession

This class, `ClientSession`, manages interactions within the agent swarm system for a single client. Think of it as a dedicated workspace for a client’s requests and the swarm's responses.

It handles everything from sending notifications and executing commands to logging actions and managing the session's history. The session works closely with other services to ensure proper communication, policy enforcement, and access to the agents within the swarm.

Here's a breakdown of what it does:

*   **Message Handling:**  It allows you to send notifications, execute commands, and run lightweight completions (without emitting results) – all while ensuring everything adheres to predefined rules.
*   **History Management:** The session meticulously tracks user messages, agent responses, tool outputs, and system updates, storing them in the agent’s history.
*   **Session Control:** You can use it to signal the agent to stop executing further tools, flush the session history, or add developer notes for internal purposes.
*   **Real-time Interaction:** It enables real-time communication by connecting to a message connector, allowing for a continuous flow of messages between the client and the swarm.
*   **Cleanup:**  When the session is finished, it properly cleans up resources to ensure everything runs smoothly.



Essentially, `ClientSession` provides a structured and controlled environment for clients to interact with the agent swarm.

## Class ClientPolicy

The ClientPolicy class is responsible for managing access control and message filtering for clients interacting with the swarm system. It keeps track of banned clients, handles input and output message validation, and provides feedback to clients when policies are violated. 

It uses a lazy-loaded list of banned clients, meaning the list is only fetched when needed, which optimizes performance. The class automatically bans clients if validation fails and a custom message can be provided to explain the ban. 

ClientPolicies work closely with other parts of the system, like the connection services, agent, and event bus, to ensure security and compliance across the swarm. Actions like banning or unbanning clients trigger events and can be customized with callbacks.

## Class ClientOperator

The ClientOperator is a core component for interacting with and controlling an AI agent swarm. Think of it as a manager that sends instructions and receives results from the agents. 

It handles the flow of information, allowing you to send inputs, wait for responses, and send messages – both for developers and the end-users.  While some functions like running, committing tool outputs, and flushing are currently unavailable, the others provide the necessary framework for orchestrating agent interactions. 

You can send user messages, commit assistant messages, and even signal agent changes. Finally, the `dispose` method cleanly shuts down the client operator when it's no longer needed.

## Class ClientMCP

This class lets your application manage and interact with tools used by AI agents. Think of it as a central hub for controlling what tools are available to each agent and executing them.

You can use it to find out what tools an agent has access to, check if a particular tool exists, or actually run a tool with specific data. The system remembers which tools are available to avoid unnecessary re-fetching, and lets you refresh the available tools whenever needed.

When an agent is no longer needed, this class helps to clean up any resources associated with it, ensuring a tidy and efficient operation.

## Class ClientHistory

This class manages the history of messages for a specific agent within the swarm system. Think of it as a record of everything the agent has said and done. It keeps track of these messages, allowing them to be retrieved and used later, particularly when the agent needs to remember past interactions for generating responses.

It filters messages to show only the ones relevant to the agent, based on configuration settings, and it can limit the number of messages kept. When a new message is added or an old one is removed, the system is notified. This class integrates with other parts of the swarm, like the connection service for initial setup and the agent itself to log actions and provide context. When the agent is finished, this history can be cleaned up and its resources released.

## Class ClientCompute

This component handles the calculations and updates on the client side for your AI agents. Think of it as the brain managing how your agents process data and react to changes.

It takes initial configuration settings when it's created, and it keeps track of how data changes impact those calculations. 

You can manually trigger recalculations based on specific data points, force a full update, or let it automatically react to changes. 

When you're finished with the component, a `dispose` method lets you clean everything up, ensuring no resources are left behind.

## Class ClientAgent

This class, `ClientAgent`, is the core of how individual agents operate within a larger swarm. Think of it as the brain of each agent, handling everything from receiving instructions to producing results. It manages the flow of messages, decides when to use tools, keeps track of the conversation history, and reports events.

Here's a breakdown of what it does:

*   **Receives and Processes Instructions:** When an agent receives a message, `ClientAgent` figures out what to do, potentially using tools or needing to retry if something goes wrong.
*   **Tool Management:** It keeps track of available tools, ensuring there aren't any duplicates. It also handles stopping or canceling tool executions when necessary.
*   **History Tracking:**  The agent carefully records all messages and actions, storing them in a history for context.
*   **Error Recovery:**  If something goes wrong, it has strategies to recover and try again, potentially re-generating a response.
*   **Communication:** It communicates with other parts of the system to share its progress and results.

**Key Components:**

*   **`execute` and `run`:** These methods are the primary ways to give the agent instructions. `execute` is used for more complex tasks that might involve tools. `run` is for simpler, stateless tasks.
*   **Subject-based State:** It uses "Subjects" to keep track of important changes, like tool errors or agent changes, allowing other parts of the system to react to these events.
*   **Commit Methods:** There are many "commit" methods (like `commitUserMessage`, `commitToolOutput`) which let other parts of the system interact with the agent's state without triggering a full response. These are used for logging, resetting, or coordinating actions.
*   **`dispose` method**: Cleanly shuts down the agent, releasing any resources it's using.



Essentially, `ClientAgent` is the workhorse that orchestrates the activities of a single agent within the swarm, ensuring smooth operation, error handling, and communication with the rest of the system.

## Class ChatUtils

The `ChatUtils` class helps manage chat sessions for different clients, acting as a central hub for coordinating interactions within an AI agent swarm. It handles the creation, sending, and disposal of chat instances, ensuring each client has a dedicated communication channel.

You can think of it as a factory and manager for chat sessions; it provides methods to start a chat (`beginChat`), send messages (`sendMessage`), and clean up resources when a chat is no longer needed (`dispose`). 

The `listenDispose` function allows you to be notified when a chat session is being terminated.  You have some control over how chat instances are created and what callbacks are used, allowing for customization of behavior.  Finally, `useChatAdapter` lets you define which class will be used to create the chat instances, and `useChatCallbacks` lets you specify functions to be executed during certain chat lifecycle events.

## Class ChatInstance

The `ChatInstance` class manages a single chat session within an AI agent swarm. It's given a unique identifier (`clientId`), the name of the swarm it belongs to (`swarmName`), a function to call when the chat is finished (`onDispose`), and optional callback functions for various events. 

Essentially, it's responsible for starting, sending messages within, and ultimately cleaning up a chat.  It keeps track of how recently the chat has been active to automatically end inactive sessions. You can also subscribe to be notified when a chat session is closed. The `beginChat` method kicks off the chat, `sendMessage` transmits messages, and `dispose` cleans everything up when you're done.

## Class BusService

The `BusService` acts as the central communication hub for the swarm system, handling all event-driven interactions. Think of it as a post office for events, ensuring messages get to the right recipients.

It lets different parts of the system – like client agents, performance trackers, and documentation services – subscribe to specific events. When something important happens, like a task starting or ending, the `BusService` broadcasts this as an event. This system supports broad notifications ("send this to everyone") as well as targeted messages for individual clients.

The service keeps track of all active subscriptions, ensures that only authorized clients can send events, and cleans up subscriptions when they're no longer needed. It's designed to be efficient, reusing communication channels whenever possible. It is also designed to log activities which can be useful in debugging.

Here's a breakdown of what it does:

*   **Subscriptions:** Clients sign up to receive specific event types.
*   **Event Emission:** When an event occurs, the `BusService` sends it to all subscribed clients.
*   **Cleanup:** When a client disconnects, all their subscriptions are automatically removed.
*   **Special Events:** It offers shortcuts for common events like execution beginnings and endings, simplifying how these are handled.

## Class AliveService

The `AliveService` helps keep track of which clients are currently active within your AI agent swarms. It provides simple ways to register a client as online or offline, and automatically saves this information so it's not lost.  You can think of it as a heartbeat monitor for your agents, letting you know if they’re still responding. It uses a system to store this status, ensuring it's persistent even if the service restarts.  The `markOnline` and `markOffline` functions allow you to easily update a client’s status within a particular swarm, and logging is included to help with debugging.

## Class AgentValidationService

This service is responsible for making sure all the agents in your system are properly configured and set up correctly. It acts as a central point for validating agents and their associated resources like storages, states, and dependencies.

Think of it as a quality control system for your agents.

Here's a breakdown of what it does:

*   **Agent Registration:**  You can register new agents with their configurations, and this service keeps track of them.
*   **Validation:** It validates the configuration of existing agents, checking things like their completion settings, tools, and storage connections.
*   **Dependency Tracking:** It manages and verifies dependencies between agents - ensuring that agents rely on each other correctly.
*   **Resource Queries:** It allows you to quickly find out what storage, state, and mcp resources are associated with a specific agent.
*   **Performance:** The validation checks are optimized to run quickly by remembering previous results.

The service relies on other specialized services for tasks like schema validation and storage management, and it keeps detailed records of registered agents and their relationships.  It also uses logging to track its operations and provides information for debugging and monitoring the system.

## Class AgentSchemaService

This service acts as a central place to define and manage the blueprints for your AI agents within the system. It's like a library of agent templates, ensuring each agent has a consistent structure and necessary components.

The service keeps track of these agent blueprints, validating them to make sure they are complete and well-formed before they can be used. It registers new blueprints, allows for updating existing ones, and provides a way to retrieve them when needed.

Think of it as a foundation for building your AI agents, providing a reliable and organized way to manage their definitions and ensuring they work together effectively within the swarm. It's used by other services to create agents, configure swarms, and manage their overall behavior.

## Class AgentPublicService

This class acts as a public gateway for interacting with agents within the swarm system. It provides a set of methods like `execute`, `run`, and `commitToolOutput` for common agent operations.

Think of it as a helper layer – when you want to do something with an agent (like run a command or log a message), you go through this class. It handles the underlying details of connecting to the agent and keeps things organized.

This class also adds extra features like logging and context scoping, making sure everything is tracked and consistent. Every method call is carefully logged if enabled, and each operation happens within a defined scope. 

It's designed to be reliable and easy to use, providing a standardized way to interact with agents while maintaining control and visibility into the process. You can think of it as a safe and well-documented interface for working with your agents.


## Class AgentMetaService

This service helps manage information about agents within the system and transform that information into diagrams. It essentially builds a structured representation of each agent, including its dependencies and capabilities. 

You can use this to get a complete view of an agent's connections, or a simpler view focusing just on its relationships with other agents. The service then converts these representations into a standardized diagram format (UML) that can be used for documentation and debugging – think of it as generating visual maps of your agents.

The system logs its actions when configured to do so, ensuring transparency in how these agent maps are created. It pulls information from other services to build a comprehensive picture of each agent and integrates with services responsible for documentation.

## Class AgentConnectionService

This service manages the lifecycle of AI agents within the swarm system, acting as a central point for creating, running, and coordinating them. It efficiently reuses agent instances to save resources, ensuring consistent behavior across calls. Think of it as a conductor for your AI agents, handling their creation, execution, and cleanup, while also keeping track of their usage and history.

It connects to various other services - like logging, event handling, and data storage – ensuring everything runs smoothly and consistently, and provides methods to execute commands, run completions, and manage agent interactions. The service focuses on efficient management and reuse of AI agent instances. By memoizing agent instances and relying on external services for logging, event handling, and data storage, it delivers consistent behavior and optimizes resource usage.

## Class AdvisorValidationService

This service helps manage and check the setup of AI advisors within your system. Think of it as a gatekeeper ensuring each advisor has a clear plan for how it should operate.

You can use it to register advisor schemas, defining their expected structure and requirements. The service keeps track of these registered advisors. 

Then, you can tell it to validate a specific advisor, confirming it’s properly configured according to its registered schema. This helps prevent errors and ensures consistency across your AI agent swarm.


## Class AdvisorSchemaService

This service helps manage and organize the blueprints for your AI agents – we call them "advisor schemas." It acts as a central place to store, update, and retrieve these blueprints.

The service keeps track of these blueprints using a registry, and it relies on another service to handle the underlying schema context, managing things like validation.

You can register new blueprints, update existing ones, and easily retrieve them by their unique identifier. This makes it simpler to ensure all your agents are following the correct structure and guidelines.

## Class AdapterUtils

This utility class provides easy ways to connect to different AI models and use them for generating responses. Think of it as a toolbox for talking to various AI services.

Each function within this class—like `fromHf`, `fromCortex`, `fromGrok`, and others—creates a specialized tool that handles the specifics of communicating with a particular AI platform, such as Hugging Face, Cortex, Grok, OpenAI, LMStudio, or Ollama. You just need to provide the necessary credentials or client objects, and it will take care of sending requests and receiving answers from the AI.  The `model` parameter allows you to select a specific model within the AI platform.

## Class ActionSchemaService

This service keeps track of the different action tools your AI agents can use. It's like a registry for available tools. 

You register a tool’s name using the `register` method, essentially adding it to the list of known tools. 

The `hasTool` method lets you quickly check if a specific tool is registered and ready to be used by your agents. 

The system also logs some of these actions, which can be useful for debugging or monitoring.

# agent-swarm-kit interfaces

## Interface ValidationResult

This object represents the outcome of validating tool arguments. It tells you whether the validation process completed successfully or not. 

If everything went well, you'll find the validated data inside the `data` property. 

If something went wrong, the `error` property will contain a message explaining what happened.

## Interface TAbortSignal

This interface lets you signal when an operation needs to be stopped, building upon the standard web API for handling interruptions. Think of it as a way to gracefully halt processes, especially useful when coordinating multiple AI agents working together. You can adapt and add your own custom features to this signal to better fit how your swarm interacts and cancels tasks.

## Interface JsonSchema

This describes a JSON Schema, which is essentially a blueprint for defining the structure of a JSON document. Think of it as a contract ensuring data conforms to a specific format. 

It lets you specify the data type of each field (like string, number, or object), list which fields are mandatory, and control whether extra, unexpected fields are allowed. The `additionalProperties` setting is particularly useful for adjusting how strictly you want to validate your JSON data – set it to `true` to be more flexible, or `false` for stricter validation.

## Interface ITriageNavigationParams

This interface defines the settings you can use to create a new tool for your AI agents to use. You specify the tool’s name and a description of what it does. There’s also a place to add a note for documentation purposes. Finally, you can provide a function to control when the tool is accessible – this lets you make a tool only available under certain conditions based on things like client ID or the name of another agent.

## Interface IToolRequest

This interface describes what’s needed to ask the system to run a specific tool. Think of it as a way for an agent to tell the swarm, "I need you to use this tool, and here's the information it needs to work." It has two main parts: the name of the tool you want to use, and the specific details or arguments that tool needs to do its job. The system checks these details against what the tool expects to make sure everything is set up correctly.

## Interface IToolCall

This interface describes a request to use a tool within the system, essentially a model asking to run a specific action. Each tool call has a unique ID so we can track it as it's processed. Right now, all tool calls are for functions, meaning they execute a specific piece of code. The `function` property tells us exactly which function to run, including its name and any arguments it needs.

## Interface ITool

This interface describes how tools are defined within the agent swarm system. Think of it as a blueprint for a function an agent can use. 

Each tool has a `type`, which is currently always "function," but might expand to include things like API integrations later on.

The core of the definition is the `function` property, which details the tool’s name, what it does (its description), and most importantly, the structure of the data it expects as input – including the types and descriptions of its parameters. This information helps the AI agent understand how to use the tool effectively.

## Interface ISwarmSessionCallbacks

This interface lets you listen for important events happening within your AI agent swarm. You can use it to track when agents connect, when commands are run, and when messages are sent. It also provides callbacks for session initialization and cleanup, allowing you to monitor the lifecycle of each agent's connection. Think of it as a way to get notified about what's going on inside the swarm and respond accordingly.

## Interface ISwarmSchema

This interface helps you define how a swarm of AI agents will operate. Think of it as a blueprint for creating and managing your swarm.

You can use it to give your swarm a unique name and specify which agents are available to participate.  It lets you set a default agent to use if no specific agent is selected.

It also allows you to control how the swarm remembers its progress – whether it saves its navigation history and active agent information. You can provide functions to retrieve and update this navigation stack and active agent information as needed. 

Finally, it provides a way to add custom actions that trigger at different stages of the swarm’s lifecycle, giving you flexibility in how the swarm behaves.

## Interface ISwarmParams

This interface defines the information needed to set up and run a swarm of AI agents. Think of it as the blueprint for creating a swarm. 

It includes the unique ID of the system requesting the swarm, a logger to keep track of what's happening, and a communication bus for the agents to talk to each other.  Finally, it holds a list of the individual agents that will be part of the swarm, allowing the swarm to interact with them directly.

## Interface ISwarmMessage

This interface defines the structure of messages that flow within the AI agent swarm system. Think of it as the fundamental unit of communication between agents, tools, and users. Each message has an `agentName` to identify which agent sent it, a `mode` indicating whether it originated from a user or a tool, and an optional `payload` that can contain extra information relevant to the message. These messages are vital for keeping track of what's happening, generating responses, and broadcasting events within the swarm.

## Interface ISwarmDI

This interface acts as a central hub for all the services that power the AI agent swarm system. Think of it as a toolbox containing essential utilities for managing everything from documentation and events to performance tracking and agent connections. It provides access to services for handling documentation, communication between agents, monitoring performance, ensuring system health, logging events, managing execution context, and connecting to various resources like agents, storage, and sessions.  Essentially, it's the foundation for how all the different parts of the swarm interact with each other. It also includes services responsible for validating data and enforcing rules across the swarm, ensuring the stability and integrity of the system. This central access point streamlines configuration and enables consistent access to core functionalities.

## Interface ISwarmConnectionService

This interface outlines how different agents within your AI agent swarm can communicate and coordinate with each other. Think of it as a blueprint for establishing connections – it defines the essential methods and properties needed for agents to talk and share information. It’s designed to provide a clear, public-facing definition for how agents connect, ensuring a consistent and predictable way for them to interact within the swarm. This helps to separate the core functionality from any internal workings of the connection service.

## Interface ISwarmCallbacks

This interface lets you listen in on important moments in your AI agent swarm's life. Specifically, it allows you to be notified whenever an agent starts or stops participating in the swarm. 

You'll receive details like the agent's ID, the name of the agent, and the swarm it belongs to, so you can adjust your application accordingly – maybe update a user interface or track agent activity. Think of it as a way to stay informed about what’s happening with your swarm in real time.

## Interface ISwarm

This interface lets you interact with a group of AI agents working together. You can use it to get the name of the currently active agent, or even retrieve the agent itself as an object.

Need to change which agent is actively working? You can set the active agent by name, and the system keeps track of your navigation choices. 

The system can also wait for the group's output, cancel ongoing operations, and send messages to the communication channel. You can check if the group is currently busy processing something, or manually set its busy state for things like debugging and controlling your application's flow.

## Interface IStorageSchema

This interface defines how your AI agents’ data is stored and managed. It lets you configure things like whether the data is saved permanently, whether multiple agents can access the same data, and how the data is indexed for searching.

You can provide custom functions to control how data is retrieved, saved, and initially populated. It also gives you the ability to add custom logic for storage events and generate unique indexes for each piece of data, allowing for efficient searching. The `storageName` property uniquely identifies each storage area within the system.

## Interface IStorageParams

This interface defines how your AI agent swarm interacts with storage. Think of it as a set of tools and rules for managing the data your agents use and create.

It includes ways to identify which client is using the storage, a function to measure how similar two pieces of data are, and methods for caching embeddings (numerical representations of text) to speed up processing. You'll also find functions for creating new embeddings and reading from the storage, alongside tools for logging activities and sending messages around the swarm. Essentially, it's all the necessities for your agents to store, retrieve, and work with information effectively.

## Interface IStorageData

This interface, `IStorageData`, outlines the basic information that any piece of data held within the system needs to have. Every item stored will have a unique `id`, which acts like a name tag so we can easily find it later or delete it if needed. Think of it as the essential building block for everything we save.

## Interface IStorageConnectionService

This interface helps us define how different parts of the system will interact with storage connections, but in a way that focuses on the public-facing functionality. It's designed to provide a clear blueprint for creating storage connection services while hiding internal details that users shouldn't need to worry about. Think of it as a template for building reliable and consistent storage connections within the agent swarm orchestration framework.

## Interface IStorageCallbacks

This interface defines a set of functions that allow your application to be notified about what's happening with the storage system. Think of them as event listeners – you can use them to react to changes, track searches, or perform setup and cleanup tasks when the storage is created or removed. 

You're given callbacks to respond to data updates, be aware of search activity, handle storage initialization, and manage disposal of the storage. This allows you to monitor the storage's behavior or perform actions in response to those events.


## Interface IStorage

This interface lets your AI agents easily manage and access data during their work. Think of it as a shared workspace where agents can store information they find, update their knowledge, and retrieve what they need. 

You can retrieve data using a search term, bringing back a set number of matching items. It also allows agents to add new information or update existing entries. 

Individual items can be removed by their unique identifier, and you can retrieve a single item by its ID. If you need to see everything, you can list all items, even filtering them based on specific criteria. Finally, if you need a fresh start, you can clear the entire workspace.

## Interface IStateSchema

The `IStateSchema` interface helps you define how your agents manage data within the swarm. It lets you control things like whether the data is saved permanently, how to initially set up the data, and how to retrieve or update it. 

You can give each piece of data a unique name and provide functions to get the starting value or to change the data. Want to share data between agents?  You can enable that. Finally, you can even add custom functions (middlewares) to handle the data as it changes, and set up events to be notified when the data is modified.

## Interface IStateParams

This interface, `IStateParams`, defines the essential information needed to manage a state within your AI agent swarm. Think of it as the set of ingredients needed to keep a specific state running smoothly. 

Each state instance knows its unique `clientId`, which helps identify it within the system. 

You also get a `logger` to record what's happening and catch any problems, and a `bus` for sending and receiving messages across the swarm. These components ensure the state can communicate and be monitored effectively.

## Interface IStateMiddleware

This interface helps you control and shape the data used by your AI agents. Think of it as a checkpoint where you can inspect or adjust the agent's state—the information it’s using—as it progresses through its tasks. You can use this to make sure the data is always in the correct format, or to add extra information that the agents might need. This middleware essentially gives you a place to intervene and guide the data flow within the system.

## Interface IStateConnectionService

This interface helps define how different parts of the system connect and share information about the agent swarm's state. Think of it as a blueprint for making sure the public-facing parts of the orchestration framework have a consistent and predictable way to access and update the swarm's status. It focuses on the essential connections without including any internal workings, helping to keep things organized and reliable.

## Interface IStateChangeEvent

This interface helps you keep track of changes happening within the system. Think of it as a notification system – when something changes, you'll be informed. 

The `stateChanged` property is the key here; it's like a channel that sends out a signal whenever a state changes. You can "subscribe" to this channel to be notified and respond to those changes in your code. It allows different parts of your application to react to changes happening elsewhere.

## Interface IStateChangeContract

This interface helps you keep track of when the system's state changes. It provides a way to be notified whenever a state is updated. Think of it as a notification bell that rings when a new state becomes active, letting you respond to those changes in a reactive way. You can subscribe to this notification to know exactly when and what state has changed.

## Interface IStateCallbacks

This interface lets you listen in on important moments in a state’s life cycle. You can use it to be notified when a state is first created, when it’s being cleaned up, or when its data is loaded, read, or updated. Think of it as a way to get notified about what’s happening with your state data—perfect for things like logging, monitoring, or triggering other actions based on those changes. Each callback provides you with information about the state's ID, its name, and the data itself.

## Interface IState

This interface lets you manage the current status of your AI agents. You can easily check what the current state is using `getState`. When you need to update the status, `setState` lets you calculate the new status based on the old one – it’s like providing a recipe for how the status should change. Finally, `clearState` provides a simple way to reset everything back to the starting point, as defined in your agent configuration.

## Interface ISharedStorageConnectionService

This interface helps define how different parts of the system connect to shared storage, like a central place to hold information. Think of it as a blueprint for managing those connections, specifically designed to ensure the publicly accessible parts of the system only interact with storage in a safe and predictable way. It's used to create a reliable and controlled way for AI agents to share data and coordinate their actions.

## Interface ISharedStateConnectionService

This interface helps define how different parts of the AI agent swarm can share information. Think of it as a blueprint for a service that allows agents to communicate and coordinate, but it specifically leaves out the internal workings so that the public-facing parts remain clear and consistent. It's designed to make sure the way agents interact with the shared state is predictable and well-defined.

## Interface ISharedComputeConnectionService

This interface defines how your AI agents connect to and utilize shared computational resources. Think of it as the bridge between your agents and the power they need to run – whether that's processing data, running simulations, or interacting with external tools. By implementing this service, you allow your agents to dynamically request and utilize these resources, making your swarm more efficient and adaptable. It builds upon the `SharedComputeConnectionService`, ensuring a consistent and type-safe way to manage these connections within your agent ecosystem.

## Interface ISessionSchema

This interface, `ISessionSchema`, is essentially a space for future expansion. Think of it as a promise for more detailed session settings down the line. Right now, it doesn’t hold any specific data, but it's here to reserve a place for session-related configurations as the framework develops. It acts as a structural blueprint for how session information might be organized in the future.

## Interface ISessionParams

This interface defines the information needed to set up a new session for your AI agent swarm. Think of it as a blueprint containing all the essential components.

It includes details like the client's unique identifier, a way to log activities and track errors, rules and limits for the session, a communication channel for agents within the swarm, the swarm itself for management, and the specific name of the swarm the session belongs to. All these pieces work together to define the environment and controls for your AI agents.

## Interface ISessionContext

This interface describes the data that’s held for each active session within the swarm. Think of it as a container for key information about who’s using the system, what they’re doing, and how things are running. 

It includes a unique identifier for the client (clientId), a unique identifier for the process running the swarm, and then two optional containers: one for details about the specific method being used (methodContext) and another for data about the current execution step (executionContext). If a method or execution isn't happening right now, those containers will be empty.

## Interface ISessionConnectionService

This interface helps us define how the system connects to different AI agents. Think of it as a blueprint for establishing those connections – it outlines the necessary components without including any internal workings. We use it to create a public-facing version of the connection service, focusing only on what users and external systems need to know and use.

## Interface ISessionConfig

This interface helps you define how often your AI agents should run or interact, especially when you need to control the pace to avoid overwhelming resources. You can set a `delay` to specify a minimum time between sessions, ensuring agents don't run too frequently.  There’s also an `onDispose` function you can provide; this is a handy way to clean up any resources your agents might be using when a session ends, like closing connections or releasing memory.

## Interface ISession

The `ISession` interface defines how you interact with a single conversation or "session" within the AI agent swarm. It provides methods to send messages, control the flow of execution, and manage the session's internal state.

You can use `commitUserMessage` and `commitAssistantMessage` to add messages to the conversation without triggering an immediate response, while `commitSystemMessage`, `commitDeveloperMessage` and `commitToolRequest` allow for adding specific message types to the session’s history. `commitToolOutput` lets you record the results of a tool's execution.

To trigger an AI agent to process content, use `execute` or `run`, with `execute` also allowing you to specify how the session’s history is handled. You can also clear the entire conversation history with `commitFlush`.  `notify` is for sending alerts that other parts of the system can listen for, and `emit` for general communication within the session.

`connect` establishes a two-way communication link, and `commitStopTools` is used to halt the execution of tools within the session.

## Interface IScopeOptions

This interface, `IScopeOptions`, helps you configure how a specific operation within your AI agent swarm will run. You can specify a unique `clientId` to track the session, and a `swarmName` to indicate which predefined swarm setup should be used. If something goes wrong, you can also provide an `onError` function to gracefully handle any errors that pop up during the process.

## Interface ISchemaContext

This object acts as a central hub for all the different types of schemas used by the AI agent swarm. Think of it as a directory that holds information about how agents are defined and how they communicate. It organizes schema definitions into categories, like agent structures and message formats, making it easy to access and manage them throughout the system. You can use this to find and work with the blueprints for your AI agents and the messages they send to each other.

## Interface IPolicySchema

This interface defines the structure for creating and configuring policies within the agent swarm. It lets you dictate how the swarm manages bans and enforces rules. 

You can choose to persist ban information to storage, add descriptions for clarity, and assign unique names to your policies. 

The interface provides ways to customize ban messages, automate the banning process, and even define your own validation logic for incoming and outgoing messages. You can also retrieve and manage lists of banned clients, or completely replace the default ban list management.  Finally, you can define callbacks to extend the functionality and create custom actions when validation or banning events occur.

## Interface IPolicyParams

This interface defines the information needed to set up a policy, which acts as a rule or guideline for your AI agents. Think of it as giving the policy a way to keep track of what's happening (using a logger) and a way to communicate with the rest of the system (using a bus for sending and receiving messages). It's designed to be flexible and include all the necessary details for the policy to function correctly within the larger AI agent swarm.

## Interface IPolicyConnectionService

This interface helps us clearly define how external systems interact with our agent swarm orchestration framework. Think of it as a blueprint that ensures the public-facing parts of the connection service are consistent and predictable. It's designed to strip away any internal details, leaving only the essential functions and properties that others need to use. Essentially, it's about providing a clean and reliable interface for connecting and managing policies within the system.

## Interface IPolicyCallbacks

This interface lets you connect custom actions to important moments in a policy’s lifecycle. Think of it as a way to get notified and react to events like when a policy starts, when it checks incoming messages, when it sends outgoing messages, or when a client gets banned or unbanned.

You can provide functions for `onInit` to run code when a policy is first created, and `onValidateInput` and `onValidateOutput` to monitor and potentially influence message validation.  Furthermore, `onBanClient` and `onUnbanClient` allow you to be notified and react whenever a client's access is restricted or restored.  These callbacks give you flexibility to log actions, trigger other processes, or implement custom behaviors in response to these key policy events.

## Interface IPolicy

This interface defines how policies are enforced within the agent swarm. It lets you check if a client is banned, retrieve the reason for a ban, and validate both incoming and outgoing messages to ensure they comply with the swarm's rules. You can also programmatically ban and unban clients using this interface, giving you fine-grained control over access and behavior within the swarm. Essentially, this is your toolbox for managing client restrictions and message integrity.

## Interface IPipelineSchema

This interface describes the blueprint for how a sequence of AI agents will work together. Each pipeline gets a unique name to identify it.

The core of the pipeline is the `execute` function, which defines the steps involved in running the pipeline, taking into account a client identifier, the agent's name, and some data to work with.

Finally, `callbacks` let you add optional hooks to monitor the pipeline’s progress, gracefully handle any errors that might occur, and generally tweak how it behaves during execution. Think of them as points where you can jump in and influence the pipeline's actions.

## Interface IPipelineCallbacks

This interface lets you hook into what's happening as your AI agent pipelines run. You can define functions to be notified when a pipeline begins, when it finishes (whether successfully or with an error), and specifically when an error occurs. Think of these as event listeners – they allow your system to react to and log pipeline activity, handle failures gracefully, or trigger other actions based on pipeline status. By providing these callbacks, you gain visibility and control over the entire pipeline execution process.

## Interface IPersistSwarmControl

This interface lets you tailor how your AI agent swarm's data is saved and loaded. Think of it as a way to swap out the default storage system for things like which agents are active or the path each agent has taken. 

You can use `usePersistActiveAgentAdapter` to define how the swarm keeps track of which agents are currently working, allowing you to plug in your own way of saving that information. Similarly, `usePersistNavigationStackAdapter` lets you customize how the swarm remembers the routes agents have explored, letting you use a different method to store those paths. This gives you a lot of flexibility in how the swarm’s state is managed.

## Interface IPersistStorageData

This interface describes the format for saving data within the agent swarm. Think of it as a container holding a list of information you want to store, like settings or results. It's used to bundle up multiple pieces of data together so they can be reliably saved and retrieved later. The `data` property simply holds the actual list of things you want to persist.

## Interface IPersistStorageControl

This interface lets you swap out the default way data is saved and loaded for a particular storage area. Think of it as a way to plug in your own custom storage solution, like using a database instead of a simple file. By providing a custom "adapter," you can tailor how the framework manages the storage associated with a specific name. This gives you fine-grained control over persistence operations.

## Interface IPersistStateData

This interface describes the format used when saving state information for your AI agents. Think of it as a container that holds whatever data you need to remember about an agent – maybe its settings, or the progress of a task. The `state` property within this container holds the actual data itself, and it can be any type of data relevant to your application. This structure is used by the system to easily store and retrieve agent state.

## Interface IPersistStateControl

This interface lets you personalize how the system saves and reloads agent states. Think of it as a way to swap out the standard storage method with something you build yourself, like connecting to a database instead of using local storage. You can use the `usePersistStateAdapter` method to provide your own custom adapter, tailoring the persistence process for specific agent states. This gives you greater control over state management and opens the door to more advanced storage solutions.

## Interface IPersistPolicyData

This interface describes how policy data, specifically lists of banned clients, are stored within the swarm system. Think of it as a way to keep track of which clients shouldn’t be participating in a particular swarm. It holds a list of session IDs – unique identifiers for clients – that are currently blocked from joining or interacting with a swarm. This allows the system to enforce rules and prevent unwanted behavior.

## Interface IPersistPolicyControl

This interface lets you tailor how policy data is saved and retrieved for your AI agent swarm. 

Essentially, it provides a way to swap out the standard data storage mechanism with your own custom solution. This is useful if you need to store policy information in a specific location, like an in-memory cache, a custom database, or any other system that isn't the default. By providing your own persistence adapter, you have fine-grained control over how that policy data is managed.

## Interface IPersistNavigationStackData

This interface describes how to save and restore the history of which agents you're interacting with. Think of it as a "back" button for your agent interactions – it keeps track of the agents you've recently used. The `agentStack` property holds a list of agent names, essentially creating a trail of your navigation through the swarm. This lets the system remember where you were and easily bring you back to a previous agent.

## Interface IPersistMemoryData

This interface helps the swarm system remember things between runs. Think of it as a way to package up any kind of data – like information about an ongoing conversation or temporary calculations – so it can be saved and loaded later. The `data` property holds the actual information you want to persist, and it can be any type of data relevant to your agent swarm’s needs. It’s a simple structure designed to make saving and retrieving memory straightforward.

## Interface IPersistMemoryControl

This interface lets you plug in your own way of saving and loading memory data associated with a session. Think of it as a way to tell the system *how* to remember things for each session, instead of relying on the built-in method. You can use this to store memory in a database, a file, or any other system you prefer, giving you full control over how the memory is handled. It’s particularly useful if you need to implement unique storage requirements for different session types.

## Interface IPersistEmbeddingData

This interface outlines how embedding data is stored within the swarm system. Think of it as a way to save the numerical representation of a string – essentially, turning text into a list of numbers that the system can understand and use. The core of this data is the `embeddings` property, which is simply an array of numbers representing that numerical representation. It’s a structured way to keep track of these embeddings associated with a specific string.

## Interface IPersistEmbeddingControl

This interface lets you tailor how embedding data is saved and retrieved. 

You can plug in your own code to handle the persistence of embeddings, giving you complete control over where and how that data is stored. 

Think of it as swapping out the default storage mechanism with your own custom solution, which can be useful for things like testing or using a non-standard data store. This method lets you provide a blueprint (called a "Ctor") for your custom persistence adapter.

## Interface IPersistBase

This interface is the foundation for how the swarm system saves and retrieves data. It lets you manage entities – think of them as pieces of information like agent states or memory – by storing them as JSON files. 

The `waitForInit` method gets things started, creating the storage folder if it doesn't exist and cleaning up any bad data.  `readValue` lets you pull a specific piece of data back based on its ID. If you just need to know if data exists, `hasValue` is a quick check without loading the full information. Finally, `writeValue` is used to save data to the persistent storage, ensuring the information is reliably written to disk.

## Interface IPersistAliveData

This interface helps the system keep track of which clients are currently active within a specific swarm. It’s a simple way to note whether a client, identified by its session ID, is online or offline. The `online` property directly tells us the client's status – a `true` value means they’re online, and `false` means they're offline.

## Interface IPersistAliveControl

This interface lets you customize how the system keeps track of whether an agent is still active. It provides a way to plug in your own persistence method – maybe you want to store alive status in a database, a file, or even just keep it in memory. By providing your own adapter, you can control exactly how this vital information is saved and retrieved for each swarm.

## Interface IPersistActiveAgentData

This interface describes how we keep track of which agent is currently active for each client within a swarm. Think of it as a simple record noting which agent is "on duty" for a particular client. It uses a name, like "agent1", to identify that agent. This information is vital for the framework to ensure things are working correctly and to restore state if needed.

## Interface IPerformanceRecord

This interface describes a record of how a process performed within the system, collecting data from all the clients involved. It essentially tracks key metrics like the number of times a process ran, the total time it took, and how long each individual client took to respond.

Think of it as a way to monitor the health and efficiency of your AI agents – you can see how many tasks they completed, how quickly they responded, and get a breakdown of performance for each agent.

The record includes a unique identifier for the process itself, along with details like total execution counts and response times. Timestamps are provided in multiple formats, allowing for both broad historical tracking and more precise event logging. The `clients` property holds specific performance details for each individual client that participated in the process.

## Interface IPayloadContext

This interface, `IPayloadContext`, acts like a container to hold all the important information needed when a task is being handled. Think of it as a package that includes both the data itself (the `payload`) and details about where that data came from – specifically, the `clientId` which identifies the client initiating the work. This structure makes sure you know both *what* is being processed and *who* requested it.

## Interface IOutlineValidationFn

This interface defines a function used to check if an outline operation is valid. Think of it as a quality check for your AI agent's plans – it receives the initial idea (input) and the detailed plan (data) and determines if the plan makes sense and aligns with the original goal. It's used to ensure your AI agents are creating sound and achievable strategies.

## Interface IOutlineValidationArgs

This interface helps you pass information needed for validating the results of an AI agent's work. Think of it as a container holding both the initial input and the actual data that needs to be checked. The `data` property specifically holds the output from an agent’s task – it's the information you want to make sure is correct or meets certain criteria. Essentially, it's a way to bundle everything needed for a validation process into a single, organized object.

## Interface IOutlineValidation

This interface describes how to set up checks for your outline data, ensuring it meets certain requirements. Think of it as defining rules to make sure your data is correct and consistent. You provide a function that performs the actual validation, and you can also add a description to explain what that validation does – making it easier to understand and maintain. It’s designed to be flexible, allowing you to chain validations together or reuse them across different parts of your system.

## Interface IOutlineSchemaFormat

This interface lets you define how your agent outlines should be structured using a JSON schema. Think of it as a blueprint – you tell the system what data types are expected and how the outline should be organized. The `type` property simply identifies the format as being based on a JSON schema, and the `json_schema` property holds the actual schema definition that the system will use to check the outline's validity. This ensures all agent outlines conform to your desired structure.

## Interface IOutlineSchema

The `IOutlineSchema` defines how an outline operation is configured within the AI agent system. Think of it as a blueprint for creating a specific type of outline – a structured plan or framework.

You're able to specify a `prompt` to send to the AI model to kick things off, and that prompt can be a simple text string or a more complex function that adjusts the prompt based on the outline's name.  You can also provide `system` prompts to set the context and instructions for the AI model before any user interaction.

The `format` property lets you define the expected structure of the data the outline will produce, ensuring it meets certain standards.  `validations` allow you to check if the generated data is correct and complete, and the system will retry a certain number of `maxAttempts` if those checks fail.

For more control, `callbacks` let you customize how different stages of the outline process are handled. Finally, `getOutlineHistory` helps produce structured data utilizing parameters and prior history.

## Interface IOutlineResult

This interface defines what you get back after running an outline operation – think of it as a structured report on how the process went. It tells you whether the outline was successful, provides a unique ID to track it, and keeps a record of all the messages exchanged during the operation. If anything went wrong, you'll find an error message here, and you can see the original input parameters alongside the data that was produced. Finally, a counter keeps track of how many times the operation has been attempted.

## Interface IOutlineObjectFormat

This interface defines the structure and rules for how outline data should be organized. Think of it as a blueprint ensuring everyone uses the same format when working with outlines. 

It tells you what the basic type of the outline should be (like a JSON object or just a general object), which fields are absolutely necessary, and provides detailed information about each field – what type of data it holds and what it represents. Using this interface helps avoid confusion and ensures that different parts of the system can reliably understand and process outline data.


## Interface IOutlineMessage

This interface defines the structure for messages within the system's outline, which helps organize interactions between users, assistants, and the overall system. Think of it as a template to ensure all messages, whether from a user, an AI assistant, or the system itself, are consistently formatted and contain essential information like who sent it and what the content is. It’s all about keeping the conversation history clear and well-organized.

## Interface IOutlineHistory

This interface helps you keep track of the messages used in creating an outline. It lets you add new messages to the history, either one at a time or in batches. If you need to start fresh, you can easily clear the entire history. Finally, you can retrieve a complete list of all the messages that have been added, allowing you to review the steps taken in outline generation.

## Interface IOutlineFormat

This interface describes the expected structure for your outline data – think of it as a blueprint. It defines what types of data are allowed, which fields are absolutely necessary, and provides descriptions for each field to ensure everyone is on the same page. By using this interface, you can guarantee that the data being passed around is consistent and well-understood, making your AI agent swarm orchestration smoother. The “type” field tells you the overall format (like whether it's an object or something else), “required” lists the essential fields, and “properties” details each field's data type and purpose.

## Interface IOutlineCallbacks

This interface helps you keep track of what's happening as outlines are created and checked. You can use it to be notified when a new outline creation process begins, when a document is successfully generated, or when a document passes validation. Conversely, you can also be informed if a document fails validation, allowing you to respond to those situations, perhaps by retrying the process. Think of these callbacks as notifications that let you react to different stages of the outline creation workflow.

## Interface IOutlineArgs

This interface defines the information needed when working with an outline process. Think of it as a package containing everything the system needs to understand what's being outlined, how many times it's been tried, and what's already happened. It includes the initial input data – the "param" – a counter to track attempts, the desired output format, and a way to access a log of previous interactions. This helps the system keep track of progress and context during complex outlining tasks.

## Interface IOutgoingMessage

This interface defines what an outgoing message looks like when the system sends information back to a client, like an agent's response. Think of it as the structured way the system delivers results or notifications. 

Each message has three key pieces of information: a `clientId` that specifies which client session should receive it, `data` which holds the actual content of the message (like the answer or a notification), and `agentName` to indicate which agent created the message. This helps ensure the right client gets the correct information from the right agent.

## Interface IOperatorSchema

This function lets you link your AI agent swarm to an operator dashboard. Think of it as creating a bridge where a human operator can see what's happening in the agent conversations and even step in. You provide a client ID and the name of the agent, and the function returns a way to send messages and receive responses, allowing the operator to actively manage the agents' work. It's like having a control panel for your AI team.

## Interface IOperatorParams

This interface defines the essential information needed to configure and run an operator within the AI agent swarm. Think of it as a blueprint for setting up each individual agent. It includes things like the agent's name, a client identifier to track its origin, a logger for recording activity, a communication bus to send and receive messages, and a history service to remember past interactions. The history service is particularly important, enabling agents to learn from and build upon previous conversations.

## Interface IOperatorInstanceCallbacks

This interface lets you listen in on what's happening with individual AI agents as they work within the swarm. Think of it as a way to get notified about key moments in an agent's lifecycle. 

You can be alerted when an agent starts working (onInit), provides an answer (onAnswer), receives a message (onMessage), is finished and cleaned up (onDispose), or sends out a notification (onNotify). Each of these events includes information like the client identifier, the agent's name, and the specific data related to the event. This allows you to monitor and potentially react to agent behavior in real-time.

## Interface IOperatorInstance

This interface defines how you interact with a single agent within a larger swarm system. Think of it as a blueprint for how to control and communicate with one agent.

You can use `connectAnswer` to set up a way for the agent to send responses back to your application. The `answer` method is used to send content from your application to the agent. 

`init` establishes the initial connection with the agent, while `notify` lets you send non-blocking messages. `recieveMessage` allows you to receive incoming messages from the agent. Finally, `dispose` cleanly shuts down and releases resources when you're finished with the agent.

## Interface IOperatorControl

This interface lets you configure how an operator behaves within the AI agent swarm. You can essentially plug in your own code to handle specific actions. 

The `useOperatorCallbacks` method lets you provide a set of functions that the operator will use for various tasks; you don't have to define all of them, just the ones you want to customize.

Similarly, `useOperatorAdapter` allows you to swap out the default way an operator is created with your own custom constructor, giving you full control over its initialization.

## Interface INavigateToTriageParams

This interface helps you customize how your AI agent swarm handles transitions to a triage agent. Think of it as a set of options to fine-tune the communication and actions that happen before, during, and after these transitions.

You can define custom messages or functions to control what happens *before* the agent navigates, to modify the previous user message used for context, and to provide feedback to the user. There are also options to handle situations where navigation isn't possible, or where the agent is already where it needs to be. Basically, it gives you a way to tailor the agent's behavior for a smoother and more informative user experience during these agent-to-agent handoffs.

## Interface INavigateToAgentParams

This interface lets you fine-tune how your AI agent swarm navigates between agents. Think of it as a set of customizable hooks you can use to shape the navigation process.

You can provide functions to handle specific situations, such as what happens right before navigation starts (`beforeNavigate`), what to say if navigation fails and the session needs a reset (`flushMessage`), or how to provide feedback to the model when it successfully navigates (`toolOutput`).  You can even modify the previous user's message before it's used in the navigation context with `lastMessage`.  There are also hooks for emitting messages when navigation happens without action (`emitMessage`) and for defining a message that should be executed on the new agent after navigation (`executeMessage`). This allows for a lot of control over the overall experience and flow of interactions within your agent swarm.

## Interface IModelMessage

This interface, `IModelMessage`, represents a single message exchanged within the AI agent swarm system. Think of it as the standard format for any communication happening between agents, tools, users, or the system itself. It's essential for keeping track of the conversation history, managing how agents generate responses, and broadcasting events.

Each message has a `role` which describes who or what sent it – whether it’s a response from the AI assistant (`assistant`), a system notification (`system`), output from a tool (`tool`), a user's input (`user`), or something related to error recovery (`resque`).  It also includes the `agentName` to identify the agent involved in the message.

The core content of the message is found in the `content` property, which holds the actual text or data being shared.  You’re also able to specify an `mode` indicating whether it originates from a user or a tool. When the AI suggests a tool to execute, information about that tool request is packaged in the `tool_calls` array. Images can be sent as well using the `images` property. Finally, messages pertaining to tool responses will have the `tool_call_id` to help connect them back to their original request, and an optional `payload` can be added for extra data or metadata.

## Interface IMethodContext

This interface helps track details about each method call within the system. It provides a standard way to bundle information like the client, the method being called, and the resources involved – such as storage, compute, or policies – all together. Services use this context to monitor performance, generate logs, and provide documentation related to specific method executions. Think of it as a shared set of labels attached to each action taken by an agent, making it easier to understand and analyze what's happening across the swarm.

## Interface IMetaNode

This interface, `IMetaNode`, describes the building blocks for representing how agents and resources relate to each other. Think of it like creating a family tree, but for your AI agents – it lets you show which agents depend on others or use specific resources. Each node has a `name`, which is usually the agent’s name or a key identifier for a resource, and it can optionally have `child` nodes to show a hierarchy of dependencies. This structure helps build a clear picture of the relationships within your agent swarm.

## Interface IMCPToolCallDto

This interface defines the information passed around when an agent requests a tool to be used. It bundles together details like which tool is being used (identified by its ID and name), who is requesting it (the client and agent), the parameters needed for the tool, and whether the call should be stopped prematurely. The `toolCalls` property allows for complex sequences of tool usage to be tracked, and `isLast` signals the end of a particular call chain. Essentially, it’s the blueprint for a request to use a specific tool within the agent swarm.

## Interface IMCPTool

This interface, `IMCPTool`, outlines the essential information needed to describe a tool used within an AI agent swarm. Each tool needs a clear `name` so the system knows what it is, and an optional `description` can provide more context for users or developers. Crucially, the `inputSchema` defines exactly what information the tool expects to receive – it specifies the type and structure of the data it needs to function correctly. Think of it as the tool's data contract.

## Interface IMCPSchema

This interface describes the blueprint for a Managed Client Process (MCP), which is the core unit of work within the agent swarm orchestration framework. Think of it as defining what an MCP *is* – its name, a brief explanation, and how it interacts with the system. 

Specifically, it outlines how to identify an MCP (using `mcpName`), provide extra documentation (`docDescription`), determine what tools are available to different clients (`listTools`), and actually *use* those tools with provided data (`callTool`). Finally, it allows for optional hooks (`callbacks`) to be triggered at different points in the MCP's lifecycle, letting you monitor or react to its progress.


## Interface IMCPParams

This interface, `IMCPParams`, helps manage the settings needed for orchestrating AI agents. Think of it as a container for essential tools. It includes a `logger` so you can track what's happening during agent operations and a `bus` which allows for communication and event handling between different parts of the system. Basically, it sets up the foundational components for coordinating your AI agents.

## Interface IMCPConnectionService

This service manages the connections between your AI agents and the central orchestration system, acting like a reliable messenger. It handles setting up, maintaining, and closing these communication pathways. Think of it as ensuring each agent can clearly receive instructions and report back on its progress. The `IMCPConnectionService` allows your agents to reliably participate in the swarm, receiving tasks and sharing results. You'll use this to make sure communication stays strong throughout the entire operation.

## Interface IMCPCallbacks

This interface defines the functions your application can use to listen for and react to key events happening within the AI agent swarm orchestration framework. Think of it as a way to be notified when something important happens, like when the system is starting up, when a client’s resources are cleaned up, or when a tool is actually used. 

You'll get callbacks for tool fetching and listing, allowing you to observe the availability of tools for each client.  The `onCall` function is particularly important – it's triggered every time a tool is invoked, providing details about which tool was used and by whom. Finally, you’re notified whenever the list of available tools is updated.

## Interface IMCP

The Model Context Protocol (MCP) interface lets you manage the tools available to your AI agents. You can use it to see what tools are available for a particular agent, check if a specific tool is offered, and actually execute a tool with given inputs. There are also functions to refresh the tool lists, either globally or for a single agent, ensuring your agents always have the most up-to-date tool options. Essentially, this interface is your control panel for tool management within the system.

## Interface IMakeDisposeParams

This interface defines the settings you can provide when setting up an automatically disposable AI agent session.

You can specify a `timeoutSeconds` value to determine how long the session will run before being automatically shut down.

Optionally, provide an `onDestroy` callback function. This function will be called once the session is closed, giving you a chance to perform cleanup actions. It will tell you the client ID and swarm name associated with the session that’s ending.

## Interface IMakeConnectionConfig

This interface, `IMakeConnectionConfig`, helps control how frequently messages are sent between AI agents. It allows you to specify a `delay`, measured in milliseconds, which determines the interval at which messages are sent. Think of it as setting a pace for the communication between your agents, preventing them from overwhelming each other or external systems.

## Interface ILoggerInstanceCallbacks

This interface lets you plug into the lifecycle and activity of a logger. Think of it as a way to be notified when a logger starts up, shuts down, or whenever it records a message. 

You can define functions to be called when a logger is initialized (`onInit`), when it's finished and resources are cleaned up (`onDispose`), and each time a log message is created, whether it’s a regular log, a debug message, or an informational message (`onLog`, `onDebug`, `onInfo`). These callbacks provide a way to monitor and potentially react to the logger's behavior. The `clientId` helps you identify which specific logger these events are related to.

## Interface ILoggerInstance

This interface defines how a logger should behave within the agent swarm system, going beyond just basic logging. It allows for controlled setup and cleanup of logging functionality for each connected client. 

The `waitForInit` method lets you ensure the logger is properly initialized, potentially with asynchronous tasks, and only happens once. 

The `dispose` method provides a way to gracefully shut down the logger and release any resources it's using when the client connection is closed.

## Interface ILoggerControl

This interface gives you tools to customize how logging works within your application. You can set up a central logging adapter to handle all logging messages in one place, or define specific callbacks to manage the lifecycle of individual logger instances. 

It also allows you to create custom logger constructors tailored to your client’s needs, replacing the default behavior. Finally, you can easily log messages – info, debug, or general messages – tied to a particular client, ensuring clear identification and tracking of events within your system.

## Interface ILoggerAdapter

This interface outlines how different parts of the system can communicate with a logging system. Think of it as a contract – it defines the methods available to log messages, debug information, or even shut down logging for a particular client. Each client gets its own logging setup, and these methods ensure those setups are handled correctly, including making sure everything's ready to go before a log entry is created and properly cleaning up when logging is no longer needed. The `log`, `debug`, and `info` methods all work similarly, allowing you to send various types of messages, while `dispose` provides a way to release resources associated with a client’s logging.

## Interface ILogger

This interface defines how different parts of the AI agent swarm system communicate about what's happening. It's a standard way to record events, from simple messages to detailed debugging information.

You can use it to track things like when agents start up, how tools are used, if policies are approved, and even any errors that pop up. Think of it as a central place to keep a record of the swarm’s activity, useful for understanding how things are working and diagnosing problems.

There are three main ways to log information: `log` for general messages, `debug` for very detailed information (usually for developers), and `info` for important updates and confirmations.

## Interface IIncomingMessage

This interface describes a message that arrives at the AI agent swarm system. Think of it as a package of information being delivered to the system, often originating from a user or another application. 

Each message has a unique identifier for the client that sent it (clientId), the actual content of the message (data), and the name of the agent that's supposed to handle it (agentName). This helps the system know who sent the message, what the message is, and which agent is responsible for dealing with it, ensuring the message gets to the right place for processing.

## Interface IHistorySchema

This interface, `IHistorySchema`, outlines how your AI agent swarm keeps track of past conversations. Think of it as the blueprint for the system's memory. The core of this memory is the `items` property, which uses a special adapter – `IHistoryAdapter` – to handle actually saving and loading those conversation messages.  This adapter decides where that history is stored, whether it's a simple array in memory, a database, or something else entirely.

## Interface IHistoryParams

This interface defines the information needed to set up a record of an agent's actions and interactions. Think of it as a blueprint for keeping track of what an agent is doing. 

You'll need to specify the agent's name to identify it, and a client ID to link the history to a specific user or application.  It also includes a way to limit the amount of past messages stored to manage resources and keep things efficient, and provides logging and event communication tools for managing and observing the history.

## Interface IHistoryInstanceCallbacks

This interface defines a set of callback functions that allow you to customize how the history of an AI agent's interactions is managed. You can use these callbacks to tailor the system prompts, filter messages, load initial data, and react to changes in the history, like adding or removing messages. There are also hooks to monitor the beginning and end of history reading operations, and to respond when the history instance is created, modified, or discarded. Finally, a reference to the complete history instance is provided after creation so you can interact directly with it if necessary.

## Interface IHistoryInstance

This interface outlines how different history implementations should behave. Think of it as a blueprint for managing a record of interactions for each agent in your swarm.

You can use the `iterate` method to step through the history of messages sent and received by a specific agent. `waitForInit` helps get things started by loading any existing data for an agent's history. When a new message comes in, `push` is used to add it to the agent's record. If you need to review or remove the most recent interaction, `pop` lets you take the last message out. Finally, `dispose` provides a way to clean up the history for an agent, potentially clearing all associated data when it's no longer needed.

## Interface IHistoryControl

This interface lets you fine-tune how the system manages its history. You can tell the framework when and how to record events using lifecycle callbacks. 

It also provides a way to completely replace the default history instance creation with your own custom logic, giving you maximum control over the history objects themselves. Think of it as providing your own blueprints for building the history records.

## Interface IHistoryConnectionService

This interface outlines how different services can interact to keep track of what's happening within your AI agent swarm. Think of it as a blueprint for managing a log of actions and data. It's specifically designed to be a public-facing definition, stripping away any internal details that wouldn't be needed for external use, making sure the overall system remains predictable and easy to understand.

## Interface IHistoryAdapter

This interface lets you manage a record of interactions within the agent swarm. Think of it as a logbook for what your agents are saying and doing. 

You can add new entries to this logbook using the `push` method.  If you need to retrieve the most recent interaction, `pop` lets you remove and get it. The `dispose` method is used to clean up the history associated with a specific client and agent, essentially resetting it. Finally, `iterate` allows you to step through the history messages in order, one by one, for a particular client and agent.

## Interface IHistory

This interface helps you keep track of all the messages exchanged with your AI agents or used directly within the orchestration framework. 

You can add new messages to the history using the `push` method, and remove the last message with `pop`. 

If you need to prepare the history for a particular agent, `toArrayForAgent` transforms it into a structured format based on a prompt and system instructions. Conversely, `toArrayForRaw` gives you access to the complete, unfiltered history of all messages.

## Interface IGlobalConfig

This configuration file defines global settings for the AI agent swarm system. Think of it as the central control panel that influences how agents interact, handle tools, log events, and persist data. It's designed to be flexible; you can adjust these settings to tailor the system’s behavior to your specific needs.

Here’s a breakdown of what you can tweak and why:

**Agent Behavior & Recovery:**

*   **Handling Errors:** When things go wrong (like a tool call failing), you can choose how the system responds. Options include flushing the conversation to start fresh or attempting to correct the tool call.
*   **Tool Usage Limits:** There's a cap on how many tools a single agent can use in one go, preventing runaway tool loops.
*   **System Prompts & Output Cleaning:**  You can add instructions to agents' conversations (system prompts) and filter out unwanted elements from their responses (like XML tags).

**Logging & Debugging:**

*   Control the level of detail in the system's logs, from basic info to very detailed debug output.

**Storage & Persistence:**

*   You can enable or disable the system’s ability to save data, like agent histories or precomputed embeddings.

**Navigation and Recursion**:

*   Added a limit on the maximum amount of agents being changed in a swarm, along with a method to enable operator timeout and also disable data fetching from all storages to enable faster testing.

**Essentially, this configuration file lets you fine-tune the system's overall operation, from how it handles errors to how it saves data, making it adaptable to various applications.**

## Interface IFetchInfoToolParams

This interface describes how to set up a tool that allows your AI agent to retrieve information – it's designed for "read-only" actions. You define the tool by giving it a name and providing a function that outlines what inputs the AI needs to provide.

You can also add extra details like documentation notes or specify conditions that must be met before the tool can be used. 

There’s an optional validation step too, allowing you to double-check the inputs provided to the tool before the information is fetched. This ensures the AI is requesting the correct data in the right format.

## Interface IFetchInfoParams

This interface helps you define how data is retrieved for your AI agents. Think of it as setting up a reliable way to get the information an agent needs to work. 

You provide functions to handle the actual data fetching (`fetchContent`), what happens if there's an error (`fallback`), and how to deal with situations where the fetch returns nothing (`emptyContent`). These functions all receive context like the client ID and agent name to help you tailor the data retrieval to the specific situation. Ultimately, this interface allows you to control the data flow to your agents without changing the core system.

## Interface IExecutionContext

This interface describes the information available to different parts of the system during a particular run or task. Think of it as a shared record that ties together the client, the specific execution, and the process it’s running within. Each execution gets its own context, allowing services to track progress and performance. The `clientId` links back to the client session, `executionId` identifies the specific run, and `processId` identifies the process responsible for the work.

## Interface IEntity

This interface acts as the foundation for everything the system remembers and keeps track of. Think of it as a basic template – it ensures all different kinds of data stored within the swarm share a common structure, even though they represent different things. Specialized interfaces build upon `IEntity` to add the specific details for each type of data the swarm manages.

## Interface IEmbeddingSchema

This interface lets you customize how your agent swarm understands and compares information. It's all about defining how text is converted into numerical representations, called embeddings, which the agents use to make decisions.

You can choose whether to save these embeddings for later use – a handy way to avoid recalculating them repeatedly. Each embedding mechanism has a unique name to keep things organized.

The framework provides ways to store and retrieve embeddings, essentially creating a memory for your swarm. You can also add your own custom logic to handle events related to embedding creation and comparison.

Finally, there are built-in functions for generating embeddings from text and for calculating how similar two embeddings are to each other.

## Interface IEmbeddingCallbacks

This interface lets you tap into what's happening behind the scenes when the system is creating and comparing embeddings, which are essentially numerical representations of text. 

You can use the `onCreate` callback to track when a new embedding is generated, allowing you to log the text used or perform additional processing. 

The `onCompare` callback gives you insight into how similar two pieces of text are, providing a way to monitor and analyze the comparison results. It provides text being compared and similarity score.

## Interface ICustomEvent

This interface lets you create and send custom events within the swarm system, providing a way to communicate information beyond the standard event types. Think of it as a flexible container for any data you want to share between agents. It builds upon the basic event structure, but offers the freedom to include your own unique data through the `payload` property.  You can use this to signal specific conditions or pass along information that doesn’t fit neatly into the predefined event schemas.

## Interface IConfig

This setting lets you control how detailed the generated UML diagram is. When enabled, the diagram will show relationships and dependencies within subtrees, providing a more complete view of the system's structure. Disabling it simplifies the diagram, focusing on the top-level components.

## Interface IComputeSchema

The `IComputeSchema` interface describes the configuration for a computational unit within the agent swarm. It outlines essential details like a descriptive name (`computeName`), whether it’s shared across the system (`shared`), and how long its data should be stored (`ttl`). 

You can also specify dependencies on other compute units (`dependsOn`) and chain together processing steps using middlewares. 

To allow for custom logic, there's a way to define callbacks that are triggered at various points in the compute’s lifecycle, such as when data is updated or the compute is modified.  Finally, `getComputeData` defines a function to retrieve data associated with the compute, given a client identifier and the compute's name.

## Interface IComputeParams

This interface defines the information needed to run a compute task within the AI agent swarm. It includes a client identifier to track who initiated the work, a logger for recording activity, and a messaging bus for communication. Crucially, it specifies which state changes will automatically trigger a recomputation – essentially telling the system when to refresh data based on external events. Think of it as the blueprint for how a task runs and when it's updated.

## Interface IComputeMiddleware

This interface defines how custom logic can be injected into the agent computation process within the swarm orchestration framework. Think of it as a way to add your own checks, modifications, or enhancements before or after an agent performs its task. It allows you to tailor the behavior of the agents to your specific needs, potentially for things like data validation, security checks, or even adding extra processing steps. Implementing this interface lets you seamlessly integrate your own middleware into the agent workflow.

## Interface IComputeConnectionService

This interface, `IComputeConnectionService`, helps manage connections to computing resources, ensuring everything works smoothly and consistently within the agent swarm. Think of it as a blueprint for how different parts of the system communicate with and access the computing power they need. It builds upon the base `ComputeConnectionService`, providing extra type safety and clarity when working with these connections in your TypeScript code.

## Interface IComputeCallbacks

This interface lets you define callbacks that will be triggered during the lifecycle of a compute unit within the agent swarm. Think of it as a way to hook into what's happening with each compute – you can react to it.

You’re given functions to respond when a compute unit is first created (`onInit`), when it's being cleaned up (`onDispose`), when it performs a calculation (`onCompute`), when a calculation is starting (`onCalculate`), and when its data is updated (`onUpdate`). Each of these callbacks provides information about the client and the specific compute unit involved, letting you tailor your response accordingly.


## Interface ICompute

The `ICompute` interface defines how to interact with a compute component within the AI agent swarm. It provides methods for triggering calculations (`calculate`), updating the component's state (`update`), and retrieving the results of the computation (`getComputeData`). Think of `calculate` as starting a computation job, `update` as informing the component about changes, and `getComputeData` as checking what the computation has produced so far. The `getComputeData` method is particularly useful for monitoring the progress of a longer-running calculation.

## Interface ICompletionSchema

This interface, `ICompletionSchema`, helps you define how your AI agents within the swarm will generate responses or completions. Think of it as a blueprint for creating a specific completion method. 

You'll give it a unique name (`completionName`) to identify it. You can also specify if the completion should be formatted as JSON, and provide a list of flags to pass to the underlying language model.

Optionally, you can add callbacks to customize what happens after a completion is generated. The core of the schema is the `getCompletion` method, which is what’s actually used to retrieve a completion based on given input.

## Interface ICompletionCallbacks

This interface lets you react to when an AI agent completes its task. You can use it to do things like record the results, process the output in a special way, or even start another process based on the completed work. The `onComplete` property is your main entry point—it's a function you provide that gets called when the agent finishes, giving you the original request details and the generated response.

## Interface ICompletionArgs

This interface describes what’s needed to ask for a completion from the system. Think of it as a container for all the information the AI agent needs to understand your request and generate a relevant response. 

You’ll provide a unique identifier for who's making the request (the `clientId`), the name of the agent that should handle it (`agentName`), and if you’re expecting a structured JSON response, the name of the outline to follow (`outlineName`). The `messages` property is the core – this is the conversation history, providing context for the completion. Optionally, you can specify tools the agent can use (`tools`) and define the output format with `format`. The `mode` lets the agent know if the last message came from a tool or directly from a user.

## Interface ICompletion

This interface defines how your AI agents can get responses from language models. Think of it as the standard way your agents ask for and receive answers, ensuring everything works together smoothly. It provides all the necessary functions to generate model responses, giving you a reliable and predictable way to interact with AI models within your orchestration framework.

## Interface ICommitActionToolParams

This interface defines how to set up a tool that allows an AI agent to make changes to a system, specifically using the "WRITE" action pattern. You'll provide a name for the tool, and then describe what it does with a function – including its name, a description, and the expected parameters. 

You can also add a helpful note to the documentation for the tool and, if needed, define a function that determines when the tool should be made available to an agent. This allows for fine-grained control over which agents can use which tools.

## Interface ICommitActionParams

This interface helps you define how an action is committed – think of it as the recipe for safely updating something based on an AI agent's work.

You can provide a fallback function to gracefully handle any errors that might happen while trying to commit the action.

There's also a way to validate the action's parameters beforehand; this allows you to check if the information is correct before proceeding.

The core of the interface is the `executeAction` function, which contains the actual logic for committing the change.

If the action results in no data, an `emptyContent` function can generate a message to represent that.

You can set a `successMessage` to be displayed after a successful commit, and a `failureMessage` to inform the user if something went wrong during validation.

## Interface IClientPerfomanceRecord

This interface describes performance data collected for a single client, like a user session or an agent. It's a way to track how each client is performing within a larger process.

You're essentially getting a breakdown of what's happening on an individual client level. Things like memory usage, the number of operations performed, input and output sizes, and overall execution time are all recorded.

Each record includes a unique identifier for the client (clientId) to easily connect the data to a specific session or agent. You're also able to see key-value stores representing client memory and state, mimicking how data might be managed within the client itself. The data helps identify bottlenecks or areas for improvement related to specific client interactions.

## Interface IChatInstanceCallbacks

This interface defines a set of callbacks that you can use to monitor and react to events happening within a chat instance managed by the AI agent swarm orchestration framework. Think of these callbacks as notifications – they let your application know when a chat session starts, when a message is sent, or when an instance is set up or taken down. You can use `onInit` to prepare your application when a new chat instance is ready, `onDispose` to clean up resources when one is finished, and `onCheckActivity` to track how active the chat instance is. `onBeginChat` signals the start of a conversation, while `onSendMessage` lets you know when a message has been transmitted.

## Interface IChatInstance

This interface, `IChatInstance`, represents a single chat session within the agent swarm. Think of it as a dedicated space for an agent to communicate. 

You can start a chat using `beginChat`, and send messages to the chat with `sendMessage`, which will return the agent's response.  To keep the chat alive, `checkLastActivity` periodically verifies if the chat is still considered active.  When you’re finished, `dispose` gracefully shuts down the chat session and frees up resources. 

If you want to be notified when a chat session ends, you can register a listener with `listenDispose`, which will provide you with the client ID of the session being closed.

## Interface IChatControl

This framework lets you easily swap in different chat adapters, which are the engines that actually handle the conversation with your AI agents. The `useChatAdapter` method allows you to specify which adapter you want to use by providing a constructor for the chat instance.

You can also customize how the chat instances behave by setting callbacks. The `useChatCallbacks` method lets you provide a set of functions that will be triggered at different points during the chat process, giving you fine-grained control over the interaction.

## Interface IBusEventContext

This interface provides extra information about what's happening within the agent swarm system. Think of it as a way to tag events with details about the agent, swarm, storage, state, compute, or policy involved.

When an agent is doing something, like sending a message, the `agentName` will usually be included to identify which agent triggered the event. Other fields like `swarmName`, `storageName`, `stateName`, `computeName`, and `policyName` are available for broader system events, offering context beyond just the agent’s actions. They help understand the larger operation within the swarm.

## Interface IBusEvent

This interface defines the structure for messages sent across the system’s internal communication channels. Think of it as a standardized way for different parts of the system, particularly agents, to talk to each other and inform the core system about what's happening.

Each message will have a clear origin, identified as "agent-bus" for events originating from an agent, although other buses might use different sources. The `type` property specifies the kind of event, like a request to run a function or a notification about a message being processed.  

The `input` and `output` properties carry specific data relevant to that event - things like the content of a message being sent, or the result of a task being completed. Finally, `context` provides additional information, typically including the name of the agent sending the message, allowing the system to track who is doing what.

## Interface IBus

The `IBus` interface is the central communication channel within the agent swarm system. Think of it as a way for different parts of the system, especially agents, to send updates and information to specific clients.

It provides a way to broadcast things like when an agent finishes a task, a tool generates output, or a message is committed.  This keeps different components loosely connected – one agent doesn't need to know exactly *how* another agent or the client handles the information it sends.

The main method, `emit`, is how you send these messages. It takes a client identifier and an event object.  The event object always follows a standard structure, including information about the event's type, where it came from, the input and output data, metadata about the agent that sent it, and confirmation of the intended client.

This `emit` method sends the event asynchronously, meaning it's added to a queue or sent over a channel and the process continues without waiting for immediate confirmation. The client ID is repeated within the event data itself, which can be helpful for filtering and verification later on. The process is designed to be safe and reliable, using types to ensure events are properly structured.

## Interface IBaseMessage

The `IBaseMessage` interface describes the fundamental structure of any message sent within the agent swarm. Every message, whether from an agent, a tool, a user, or the system itself, will adhere to this base structure. 

Each message will always have a `role` indicating who sent it, and `content` which holds the actual message data.

Additionally, messages can optionally include `tool_calls` if a tool needs to be used, an identifier for a specific `tool_call`, or `images` to represent visual data. These optional properties provide flexibility for different communication scenarios.

## Interface IBaseEvent

This interface sets the groundwork for all events happening within the AI agent swarm system. Every event, whether it’s a standard message or something custom, will inherit from this structure.

Each event will have a `source` property, telling you where the event came from – it could be a specific agent or a system component.  It also includes a `clientId` property, which ensures that the event reaches the correct client or agent instance. Think of it as an address label for your events, making sure they get delivered to the right place.

## Interface IAgentToolCallbacks

This interface lets you hook into the lifecycle of individual tools used by your AI agents. Think of it as a way to add extra steps before, after, or even during a tool’s use.

You can use `onBeforeCall` to do things like record what’s about to happen, or prepare some data.  `onAfterCall` lets you clean up afterwards, perhaps logging the results.  Want to make sure the tool gets the right input? `onValidate` allows you to check the parameters before anything runs.  And finally, `onCallError` gives you a way to gracefully handle any problems that might occur while the tool is running. These callbacks give you fine-grained control and visibility into how your agents are using tools.

## Interface IAgentTool

This interface defines a tool that an AI agent can use, building upon a more basic tool definition. Each tool has a name and a description to help users understand its purpose. Before a tool runs, it’s checked to see if it's available and its parameters are validated to ensure everything is correct. You can also add custom actions that happen before or after the tool runs, giving you more control over its behavior. The tool itself can be a standard function or defined using a dynamic factory to provide more flexibility in how it's resolved. Finally, the `call` method is what actually runs the tool, passing in all the necessary information about the request and the agent’s current state.

## Interface IAgentSchemaInternalCallbacks

This interface lets you tap into the key moments in an agent’s lifecycle. Think of it as a series of notification hooks that give you visibility into what the agent is doing – from when it first starts up (`onInit`) to when it's finally shut down (`onDispose`). You can use these callbacks to monitor the agent's progress, log important events, or even react to specific actions like when a tool is used (`onToolOutput`) or a request is made to an external tool (`onToolRequest`).  There are hooks for tracking system messages (`onSystemMessage`), developer-specific messages (`onDeveloperMessage`), and even messages from the assistant (`onAssistantMessage`) or user (`onUserMessage`).  If the agent encounters an error with a tool, you’ll be notified through `onToolError`, and if the agent needs to be restarted after a pause or failure, `onResurrect` will alert you. You can even receive a notification when the agent’s history is cleared (`onFlush`) or after a series of tool calls is finished (`onAfterToolCalls`).

## Interface IAgentSchemaInternal

This interface defines the blueprint for how an AI agent functions within a larger swarm. It outlines all the settings you can use to configure an agent’s behavior, including its name, the initial prompt that guides its actions, and the tools it can use.

You can control aspects like the maximum number of tool calls allowed, how much conversation history the agent remembers, and provide detailed descriptions for documentation purposes. The interface also allows defining dynamic system prompts that change based on the specific client and agent involved. 

For advanced setups, you can customize how the agent handles tool calls, maps messages, validates output, and even connect to an operator dashboard. A series of optional callbacks let you fine-tune the agent's lifecycle events and integrate it with other systems. Finally, it specifies dependencies on other agents within the swarm.

## Interface IAgentSchemaCallbacks

This interface lets you hook into different points in an agent's lifecycle, giving you opportunities to monitor its behavior or intervene if needed. You can set up callbacks to be notified when an agent starts running, when it uses a tool, when it generates messages, or when its memory is cleared. There are also callbacks for specific events like agent initialization, disposal, and resurrection after interruptions, allowing you to manage the agent's overall state and respond to different scenarios. These hooks enable custom logic around tool requests, assistant messages, user inputs, and the completion of tool call sequences.

## Interface IAgentSchema

This interface defines the structure for describing an AI agent's foundational instructions. Think of it as the blueprint for how an agent should behave. 

You can provide a set of static instructions for the agent using the `system` property – this is a common way to guide its actions. The `systemStatic` property works identically to `system` and can be used as an alias. 

For more adaptable instructions, the `systemDynamic` property lets you provide a function that generates system prompts. This function can tailor the instructions based on things like a client identifier or the agent's name, allowing for much more personalized and flexible agent behavior.

## Interface IAgentParams

This interface defines the information needed to run an agent within the system. Think of it as a set of instructions and resources given to each agent. 

It includes things like a unique ID for the client using the agent, a logger for tracking what the agent is doing, and a communication channel (the 'bus') for talking to other agents. There's also a way to access external tools ('mcp'), keep track of past interactions ('history'), generate responses ('completion'), and a list of available tools the agent can use. Finally, there's a validation step to ensure the agent's output is correct before it's used.

## Interface IAgentNavigationParams

This interface defines the settings you use to tell the system how an agent should move and interact with others. You specify a `toolName` to identify the action the agent will take, along with a `description` explaining what that action does. Crucially, you define the `navigateTo` property to indicate which agent the action is directed towards.  A `docNote` allows you to add extra context or instructions.  Finally, an optional `isAvailable` function lets you dynamically control whether this tool can be used depending on the client, agent, and tool name—essentially, you can decide if the action is possible in a given situation.

## Interface IAgentConnectionService

This interface helps define how different AI agents connect and communicate within the orchestration framework. Think of it as a blueprint for managing those connections, making sure the public-facing parts are clearly defined and consistent. It's designed to be used when creating a specific connection service, focusing on the essential interactions without including any internal workings.

## Interface IAgent

The `IAgent` interface defines how you interact with an individual agent within the swarm orchestration framework. Think of it as the blueprint for an agent's behavior and how it handles information.

You can use the `run` method for quick, isolated tasks without affecting the agent’s memory.  The `execute` method is the main way to make the agent work, potentially updating its memory along the way. You can retrieve the agent’s output with `waitForOutput`.

To manage the agent's memory and history, there are several `commit...` methods.  These allow you to add information like tool outputs, system instructions, developer notes, user prompts, tool requests, assistant responses, and even clear the history entirely with `commitFlush`. You can also use methods like `commitStopTools` and `commitCancelOutput` to control the agent's execution flow and stop further actions.

## Interface IAdvisorSchema

This interface, `IAdvisorSchema`, defines the structure for an advisor within your AI agent swarm orchestration framework. Think of an advisor as a specialized agent with a specific role.

It includes a `docDescription` for clarifying what the advisor does and an `advisorName` to easily identify it.

You can also provide `callbacks` to hook into the advisor's lifecycle events, allowing for customization and monitoring. 

The core functionality of an advisor is handled by the `getChat` method. This method takes a message as input and returns a promise that resolves to the advisor's response – essentially, its answer or action based on that message.

## Interface IAdvisorCallbacks

This interface defines a set of optional callbacks that you can use to receive updates from the Advisor component. Specifically, the `onChat` property lets you listen for chat messages – essentially, you're notified whenever a chat interaction happens, and you receive the chat message data. You can think of it as a way to stay informed about what's happening in the chat process.
