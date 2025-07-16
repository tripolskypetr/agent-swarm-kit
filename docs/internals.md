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


---
title: docs/internals
group: docs
---

# agent-swarm-kit functions

## Function validate

This function checks that all your swarms, agents, and outlines are set up correctly. Think of it as a health check for your AI agent system. It's safe to run it multiple times because it only does the validation once each time it’s called, so you don't have to worry about it slowing things down.

## Function startPipeline

This function lets you kick off a predefined workflow, or "pipeline," using a specific AI agent. Think of it as telling the system, "Hey, run this sequence of tasks, using this particular agent, and here's some extra information it might need." You’ll need to provide a unique identifier for your client, the name of the pipeline you want to run, and the agent responsible for handling it.  Optionally, you can provide some data, called a payload, to help the agent perform its tasks. The function will then return a result based on the pipeline's execution.

## Function scope

This function lets you run a piece of code within a defined environment, essentially providing it with a set of tools and resources. You give it a function you want to execute, and it handles setting up the necessary context around it. You can also customize which tools – like AI agents or data processing pipelines – the function has access to, by providing optional settings. If you don’t customize, it will use the standard tools already set up in the system. This makes it easy to control and manage how your code interacts with the larger AI agent swarm.

## Function runStatelessForce

This function lets you send a message to your active AI agent without saving it to the conversation history. It’s useful for tasks like processing data from external systems or running quick, isolated actions where you don't want the history to grow too large.

Unlike other functions, this one *always* executes the message, even if the agent has changed or isn’t currently active. It handles the necessary setup, tracks performance, and notifies related systems, ensuring the task gets done in a controlled and monitored way. You provide the message you want the agent to process and a unique identifier for your client session.

## Function runStateless

This function lets you quickly run a command or message through an agent without it being recorded in the chat history. It's perfect for situations where you need to process data or perform a one-off task and don't want to clutter the conversation history, like when dealing with file uploads or handling data that shouldn't be part of the ongoing conversation.

The function ensures the agent is available and active before running the command and keeps track of how long the execution takes. It sets up a fresh environment for the agent to work in, ensuring a clean and consistent result. If the agent assigned to the session has changed, the command won’t be executed to prevent unexpected behavior.

You provide the message you want the agent to process, a unique identifier for your session, and the name of the agent you want to use. The function then returns the result of the agent's execution.

## Function questionForce

This function lets you directly trigger a focused question generation process for an AI agent swarm. Think of it as a way to prompt the system to dig deeper and provide a more specific answer based on a given message or question. You’re essentially telling the system, "I want a targeted response, using this input and considering this specific knowledge base." You'll need to provide the actual message you want answered, a unique identifier for who’s asking, and the name of the relevant knowledge source to guide the agents. The function then returns the generated response.

## Function question

This function lets you send a question to your AI agent swarm. It’s the starting point for getting answers within a conversation. You provide the question itself, a unique identifier for who's asking, the name of the agent responsible for answering, and the specific knowledge base (wiki) the agent should use. The function will then return the agent's response to your question.

## Function overrideWiki

This function lets you update a wiki's configuration within the swarm system. Think of it as a way to make changes to a wiki's settings, like its structure or rules, by providing a new or modified version of its schema. The function ensures these changes are made in a controlled way, separate from any ongoing processes.  If logging is turned on, the system will record that this wiki schema was changed. You provide the updated schema information as input, and it applies those changes to the existing wiki.

## Function overrideTool

This function lets you modify the details of a tool already registered within the swarm system. Think of it as updating a tool's instructions or capabilities. You provide a new or partial schema, and the function applies those changes, ensuring the update happens independently of any ongoing tasks. The system will record this override if logging is turned on. The `toolSchema` parameter defines the new or modified information for the tool.

## Function overrideSwarm

This function lets you modify a swarm’s configuration on the fly. Think of it as making adjustments to how a group of AI agents works together. You can provide a new or partial set of instructions, and this function will apply those changes to the existing swarm. Importantly, this change happens independently, ensuring a clean and isolated update process. If logging is turned on, you'll see a record of the change made. You just need to give it the new configuration details you want to apply.

## Function overrideStorage

This function lets you change how the swarm system handles data storage. Think of it as a way to tweak the existing storage configuration – you can update parts of it or even provide a completely new setup. It's designed to make these changes safely and independently, so it won't interfere with what the swarm is currently doing. The system will also keep a record of this change if you’ve enabled logging. You provide a new schema, and it updates the storage accordingly.

## Function overrideState

This function lets you change the structure of a state within the AI agent swarm. Think of it as updating a blueprint – you can add new properties or modify existing ones. It’s designed to make these changes cleanly and safely, without affecting other parts of the system, and it keeps a record of the change if you have logging turned on. You provide a new or partial schema as input, and the system applies it to the relevant state.

## Function overridePolicy

This function lets you change an existing policy within the AI agent swarm. Think of it as updating a rule that governs how the agents operate. You provide a new or partial set of rules, and this function applies them, effectively modifying the policy's behavior. It's designed to make these changes in a controlled way, separate from any ongoing processes. If logging is turned on, you'll see a record of this change happening. You only need to provide the parts of the policy you want to change; the rest remains as it was.

## Function overridePipeline

This function lets you modify an existing pipeline schema, essentially updating parts of it with new information. Think of it as patching or extending a blueprint for how your AI agents work together. You provide a schema containing the changes you want to make, and this function merges those changes into the original pipeline schema. This is useful for customizing workflows or adapting them to specific situations without completely redefining the whole pipeline. The function takes the existing pipeline schema and a partial schema with updates as input and returns the modified schema.

## Function overrideOutline

This function lets you modify an existing outline structure within the AI agent swarm. Think of an outline as a blueprint for how agents will organize and tackle a task. When you use this function, you're essentially updating that blueprint with new information or adjustments. It operates carefully to avoid unexpected side effects and keeps a record of the change if logging is turned on. You provide a partial outline – just the parts you want to change – and it merges them into the existing outline.

## Function overrideMCP

This function lets you modify existing Model Context Protocols, or MCPs, which are like blueprints for how AI agents share information. You provide a new or updated MCP definition, and this function applies those changes to the original. Think of it as a way to refine and improve the structure of how your AI agents communicate, allowing you to adjust things like the data they exchange or the way they interact. The input you give is a schema that describes what you want to change, and the function returns the modified MCP schema.

## Function overrideEmbeding

This function lets you change how the swarm system creates embeddings, which are numerical representations of text data. You can use it to update an existing embedding configuration, either by completely replacing it or just adding or modifying specific properties. Think of it as fine-tuning how the system understands and processes text. The update is done in a controlled way, separate from any ongoing tasks, and the system will record the change if logging is turned on. You provide a new or partial embedding schema to apply the changes.

## Function overrideCompute

This function lets you adjust how a compute task is handled. Think of it as modifying an existing blueprint for a specific job. You provide a partial update – only the parts you want to change – and it merges those changes into the original compute schema. It's a convenient way to tweak the way tasks are executed without rebuilding everything from scratch. You’re essentially providing a set of modifications that are applied to the existing structure.

## Function overrideCompletion

This function lets you modify how the system generates responses, essentially tweaking the underlying completion process. You can provide a new or partial schema to update a specific completion mechanism. Think of it as making targeted adjustments to the way the AI agents formulate their answers. The change happens independently, ensuring it doesn't interfere with ongoing processes.  If enabled, the system will record that you've made this modification. You just provide the properties you want to change – you don't have to provide the entire schema again.

## Function overrideAgent

This function lets you modify the blueprint for an agent within the swarm. Think of it as updating an agent's configuration – you can change its settings or add new ones. It ensures these changes happen independently, avoiding any interference with ongoing processes. The system will also record this change if logging is turned on. You provide a set of new or adjusted properties for the agent, and the function applies them to the agent's internal schema.

## Function notifyForce

This function lets you send a message out from your swarm session, acting like an output without triggering any of the usual message processing. It's specifically for sessions created using the "makeConnection" mode. Think of it as a way to directly communicate something to the agents, even if they're in a different state or have been changed. You provide the message content and a client ID to identify the session, and the system takes care of ensuring everything is set up correctly before sending the notification.

## Function notify

This function lets you send a message out from your agent swarm session, like a quick update or status notification. It's specifically for sessions set up in "makeConnection" mode. Think of it as a way to communicate directly without triggering any further processing within the swarm. 

Before sending, the system double-checks that the agent you’re sending through is still active and part of the swarm. It also creates a fresh environment for the message and keeps a log of what’s happening. If you try to use this function in a different session mode, it won't work.

You'll need to provide the message content, a unique ID for your client, and the name of the agent you want to send the notification through.

## Function markOnline

This function lets you tell the system that a specific client is now active within a particular swarm. Think of it as a simple “all clear” signal – you’re informing the framework that a client is ready to participate.  You'll need to provide the unique ID of the client and the name of the swarm it belongs to. This helps the system track which clients are available and ready to contribute to the swarm's tasks.

## Function markOffline

This function lets you tell the system that a particular client is no longer active within a specific group of agents. You provide the unique ID of the client and the name of the swarm it's part of, and the system updates its status accordingly. It's a simple way to manage the online/offline status of individual clients within your agent swarm. Essentially, you're informing the framework that the agent associated with the given client ID is no longer reachable in the swarm you specify.

## Function listenEventOnce

This function lets you listen for a single event from your AI agent swarm. You specify which agent (or all agents) to listen to and the type of event you’re interested in. It also allows you to define a filter, so you only get the event if it meets certain criteria. Once the event matches your filter, the provided callback function is executed with the event's details, and the listener automatically stops. To stop listening before the event occurs, a function is returned that you can call to unsubscribe.

## Function listenEvent

This function lets you tune in to messages being sent across your AI agent swarm. You can specify a particular client or listen to all clients by using a wildcard. When a message arrives on the topic you're listening to, a function you provide will be executed with the message data. To stop listening, the function returns another function you can call to cancel the subscription. It's designed to run safely and handles messages in the order they arrive, with built-in checks to prevent subscribing to reserved topic names.

## Function json

This function lets you request data structured according to a defined outline – think of it as asking for information in a specific, organized format. It takes the name of the outline you want to use, and optionally some parameters to guide the data generation. 

The function handles the request internally, keeping everything isolated to ensure a clean and reliable process.  Essentially, it's a straightforward way to get structured JSON data based on a predefined plan. You provide the outline's name and any necessary input, and it returns the results.

## Function hasSession

This function helps you quickly determine if an active session is associated with a specific client. It checks for a session's existence based on the provided client identifier. Behind the scenes, it uses a session validation service to perform the actual check. If logging is turned on, the function will record that it was called.

## Function hasNavigation

This function helps you determine if a particular agent is involved in guiding a client through a process. It verifies that both the client and the agent are active and then looks at the established route to see if the agent is included. Essentially, it tells you if the agent is on the roadmap for that client. You provide the client's ID and the agent's name, and it returns a simple yes or no answer. The system also keeps a record of these checks if logging is turned on.

## Function getWiki

This function lets you fetch a specific wiki's structure and content details from the AI agent swarm. You provide the name of the wiki you're interested in, and the function returns a detailed description of its schema. The system keeps track of these requests if logging is turned on. Essentially, it's a way to get the blueprint for a wiki within the swarm.

## Function getUserHistory

This function helps you access a user’s interaction history within a specific session. It pulls the raw history data and then isolates only the messages that the user has sent. Think of it as getting a clean record of what a particular user typed or submitted during their time using the system. You just need to provide the unique ID of the session you're interested in. The result is a list of those user-generated messages.

## Function getToolNameForModel

This function helps determine the specific name a tool should use when interacting with an AI model. It takes the tool’s registered name, a client identifier, and the agent’s name as input. Essentially, it figures out the right way to refer to a tool for a particular AI model, considering the context of the client and the agent involved. It's the primary way external code interacts with this part of the system.

## Function getTool

This function lets you fetch the details of a specific tool registered within your AI agent swarm. Think of it as looking up a tool's blueprint – you provide the tool's name, and it returns a description of what the tool can do and how it works.  If your system is configured to record activity, this retrieval process will also be logged. You simply provide the name of the tool you're interested in to get its schema.

## Function getSwarm

This function lets you fetch the configuration details of a specific AI agent swarm. Think of it as looking up the blueprint for how a group of agents is organized and will work together. You provide the swarm's name, and the function returns a schema that defines its structure and settings. The system keeps a record of this retrieval if logging is turned on.

## Function getStorage

This function lets you access and work with different storage configurations within the agent swarm. Think of it as a way to grab the blueprint for how data is organized and stored, identified by a specific name. When you call this function, the system keeps a record of the request if logging is turned on. You’ll need to provide the name of the storage you're interested in to successfully retrieve its details.

## Function getState

This function lets you fetch a specific state definition from the system. Think of it as asking for the blueprint of a particular state. You provide the name of the state you're interested in, and it returns the structure that defines it. The system might also record that you requested this state if logging is turned on.

## Function getSessionMode

This function lets you check the current status of a client's session within your AI agent swarm. It tells you whether the session is in a standard "session" mode, is attempting to establish a connection ("makeConnection"), or is in a finalized "complete" state. To do this, it verifies the session exists and logs the request if logging is enabled. The process runs independently to avoid any conflicts with existing operations, ensuring a reliable way to understand where a client session stands. You simply need to provide the unique identifier for the client session you're interested in.

## Function getSessionContext

This function helps you understand the environment your AI agents are working in. It gathers key information like a unique client identifier, the process ID, and details about available methods and execution contexts. Think of it as a way to peek behind the scenes and see how the system is set up for the current session. It automatically figures out the client ID based on what's already available, so you don't need to provide it. This function also logs its actions if logging is turned on and relies on other services to check for existing contexts.

## Function getRawHistory

This function lets you access the complete, unaltered conversation history for a specific client’s agent within your swarm. Think of it as getting the raw data straight from the system – no filtering or adjustments applied. 

It pulls the history for a given client, ensuring a clean and isolated process. The function verifies that the session and swarm are valid before retrieving the history and presenting it as an array of messages. 

You'll need to provide the unique identifier for the client session to retrieve the history.

## Function getPolicy

This function lets you fetch a specific policy definition from the system, identified by its name. Think of it as looking up the blueprint for how a particular task or process should be handled within the agent swarm.  The function will grab the policy's schema, which details its structure and rules.  If the system is set up to log actions, this retrieval will be recorded. You simply provide the name of the policy you want to retrieve.

## Function getPipeline

This function helps you fetch a pipeline definition by name from the AI agent swarm. Think of it as looking up the blueprint for a specific workflow. It retrieves the pipeline's schema, which describes the steps and components involved. If the swarm is set up to record its actions, this retrieval will also be logged. You simply provide the name of the pipeline you want to get, and it returns the schema describing that pipeline.

## Function getPayload

This function helps you grab the data currently being used by the agent swarm. Think of it as retrieving the "work order" or the specific instructions the agents are following. If there's no active work order, it will return nothing. It also keeps a record of this action if you've turned on logging.

## Function getNavigationRoute

This function helps you find the path an AI agent has taken within a group, or "swarm." It takes the unique ID of the client asking for the route and the name of the swarm itself. The function then returns a list of agent names that were visited along the way, essentially showing the route the agent followed. Think of it as tracing the steps of an agent as it interacts within a larger team of AI. It relies on another service to actually determine the route, and might record some information about the process depending on how the system is configured.

## Function getMCP

This function lets you fetch a specific Model Context Protocol (MCP) definition from the system. Think of an MCP as a blueprint for how AI agents interact and share information. You provide the name of the MCP you're looking for, and the function retrieves its detailed structure. The system keeps track of these MCPs, and this function provides a way to access them programmatically. It also records the request if the system is configured to log such actions.

## Function getLastUserMessage

This function helps you find the very last thing a user typed in a specific conversation. It looks through the history of messages for a given client to locate the most recent message they sent, specifically identifying messages where the role is "user" and the mode is "user". If it finds such a message, it returns the text of that message. Otherwise, if no user message is found in the history, it returns nothing. You’ll need to provide a unique identifier for the client you want to query.

## Function getLastSystemMessage

This function helps you access the last message sent by the system within a client's ongoing session. It digs into the session history to find the most recent message marked as being from the "system" role. If the system hasn't sent any messages yet, this function will return nothing. You need to provide a unique identifier for the client session to use this function.

## Function getLastAssistantMessage

This function helps you get the last message sent by the assistant during a client's interaction. It finds the most recent message where the assistant was the speaker. 

To use it, you just need to provide the unique identifier for the client’s session.

If the client hasn't received any messages from the assistant yet, the function will return nothing. It uses a clean environment to operate and records what it’s doing if logging is turned on.

## Function getEmbeding

This function lets you fetch the details of a specific embedding model that your AI agent swarm is using. You provide the name of the embedding model you're looking for, and it returns information about that model, like its configuration and expected input format. The system keeps track of these requests if logging is turned on. Essentially, it's how you get the blueprint for how to use a particular embedding model within your swarm.

## Function getCompute

This function lets you fetch information about a specific compute resource within the agent swarm. Think of it as looking up the details of a particular worker or tool available in the system. You provide the name of the compute you're interested in, and the function returns a structured description of it.  If logging is turned on, this retrieval process will be recorded for tracking and debugging purposes. The name you provide identifies which compute you want to access.

## Function getCompletion

This function lets you fetch a pre-defined completion—think of it as a reusable instruction set—by its name from the central system managing those instructions. It’s how you access the blueprints for your AI agents to follow. The system keeps track of whether logging is turned on globally, and will record this retrieval if it is. You just need to provide the name of the completion you want to use.

## Function getCheckBusy

This function lets you quickly see if a particular client's AI agent swarm is currently occupied with tasks. You simply provide the unique identifier for the client, and it returns a `true` or `false` value indicating whether the swarm is busy. It’s a handy way to check the availability of a client's swarm before sending new requests.

## Function getAssistantHistory

This function lets you see what your AI assistant has been saying during a specific client's session. It digs into the existing history and pulls out only the assistant’s messages, giving you a clear record of its contributions. To use it, you just need to provide the unique ID of the client session. The function ensures a controlled environment for retrieving the history and keeps a log of the process if logging is turned on.

## Function getAgentName

This function lets you find out what the name is of the agent currently working on a specific client's session within your swarm. It's like checking which agent is assigned to a particular task. 

You provide the unique identifier for the client session, and the function will return the agent's name. 

Behind the scenes, it makes sure the client session and swarm are valid, and it executes the request in a way that keeps things clean and separate from other ongoing operations.

## Function getAgentHistory

This function lets you see the past interactions and decisions made by a particular agent in your swarm. It pulls the agent's history, and importantly, factors in any “rescue” adjustments that might be active in the system to improve results. To use it, you’ll need the client's unique ID and the name of the agent you're interested in. The system checks that both the client and agent are valid before retrieving the history, and logs the request for monitoring purposes. It's designed to run independently of other processes to keep things clean and reliable.

## Function getAgent

This function lets you fetch the details of a specific agent within your AI agent swarm. Simply provide the name of the agent you're interested in, and the system will retrieve its configuration information. The process is tracked if logging is turned on, providing visibility into agent access. This is useful for inspecting agent setups or programmatically managing your swarm.

## Function fork

This function lets you run a piece of code – like a task for an agent – within a controlled environment. Think of it as creating a temporary, safe space for your agent’s work. You provide the code you want to run, and it receives information like a unique identifier for the client and the agent's name.  You also pass in some settings to customize how this isolated task is handled, ensuring everything runs smoothly and is cleaned up afterward. It's a way to keep your agent workflows organized and reliable.

## Function executeForce

This function lets you send a message or command directly to the active agent in your swarm, essentially having it act as if the request came from the client. It's useful when you need to review the agent’s output or trigger a conversation, even if the agent isn’t actively working at that moment. Unlike other methods, this one guarantees the command will be executed without checking the agent’s current status. It handles the necessary setup, tracks performance, and keeps a record of the execution details. You provide the message you want the agent to process and a unique identifier for the client making the request.

## Function execute

This function lets you send messages or commands to a specific agent within a group of agents working together. Think of it as mimicking a message coming directly from a client application. It’s useful for things like having an agent review the results of a tool or starting a conversation between a model and a client.

Before sending the message, the system makes sure the agent you're targeting is still part of the group and hasn't been replaced.  It then executes the content, keeps track of how long it takes, and lets other parts of the system know what's happening.  It also sets up a fresh environment and manages extra details about the process.

You need to provide the message itself (the `content`), a unique identifier for the client making the request (`clientId`), and the name of the agent you want to send it to (`agentName`).

## Function event

This function lets your applications send messages to the AI agent swarm. Think of it as a way to broadcast information, like an announcement, to other parts of the system. You specify a unique client ID, a topic name to categorize the message, and the data you want to send. 

It’s designed to keep things organized and prevents you from using special topic names that are already reserved by the system. This helps ensure the swarm functions smoothly. The function handles the technical details of sending the message, so you can focus on what information needs to be communicated.

## Function emitForce

This function allows you to directly send a string as output from the AI agent swarm, essentially letting the agents "speak" without going through the usual message processing. It's specifically designed to work with sessions created using `makeConnection`, ensuring everything stays compatible. 

Think of it as a shortcut to inject text into the swarm's conversation.  It makes sure the session and swarm are valid before sending, and it won't work with other types of connections.

You provide the text you want to send (`content`) and a unique identifier for the client sending it (`clientId`).

## Function emit

This function lets you send a string as output from an agent within the swarm, essentially letting the agent “speak” without processing a full message. Think of it as a direct way to have an agent produce text.

It's designed to be used within connections created using `makeConnection` and carefully checks that the session, swarm, and agent are still valid and active. If the agent has been replaced, the output won't be sent.

You provide the text you want to send, a unique identifier for the client connection, and the name of the agent that should be sending the text. The system ensures a clean environment for this operation and logs it if logging is enabled. Critically, it won't work unless you’re using a connection established via `makeConnection`.

## Function commitUserMessageForce

This function lets you add a user's message to an agent's conversation history within a swarm session, even if the agent isn’t actively responding. It's a forceful addition, meaning it goes directly into the history without any checks. 

You provide the message content, along with information about the session and the client using it.  The function makes sure the session and swarm are valid, keeps a log of the action if logging is turned on, and then handles adding the message to the agent's history. It runs in a special environment to keep things clean and separate from other actions.


## Function commitUserMessage

This function lets you add user messages to an agent's record within an active swarm session. Think of it as quietly updating the agent’s history – it doesn’t automatically trigger a response from the agent. 

You're essentially telling the system, "This user said this, and it's important to note it for the agent's understanding," without wanting the agent to react immediately. The system makes sure the agent and session are still working correctly before adding the message, and it keeps a record of what’s happening. To use it, you'll need to provide the message content, how it should be handled, a unique ID for your session, and the name of the agent you're updating. You can also include extra data alongside the message if needed.

## Function commitToolRequestForce

This function lets you directly push tool requests to an agent within the swarm, essentially forcing the action. It skips some usual checks to make the process faster, but it's important to use it carefully. It’s designed to handle the necessary setup and record what's happening behind the scenes for tracking and management. You provide the requests you want to commit and the ID of the client making the request. The function then returns an array of strings, likely representing the results of the committed requests.

## Function commitToolRequest

This function lets you send tool requests to a specific agent within the AI agent swarm. It makes sure the agent you're targeting is actually the right one before sending the request. Behind the scenes, it handles managing the context for the request and keeps a log of what's happening. You'll need to provide the actual tool requests, a client identifier, and the name of the agent you want to send them to. The function will then return an array of strings.

## Function commitToolOutputForce

This function lets you directly push the result from a tool back into the agent's workflow. It’s designed to be a forceful commit, meaning it doesn’t verify if the agent is still available in the swarm before adding the tool's output. 

Essentially, it's for situations where you need to ensure the result is recorded quickly and don't want to wait for a confirmation that the agent is still ready.  The function takes the tool's ID, the result you want to commit, and a client identifier as input.  It handles session and swarm checks, logs the action if logging is enabled, and uses a special execution context to keep things running smoothly.

## Function commitToolOutput

This function lets an agent share the results it got from using a tool with the rest of the swarm. It's how agents communicate their progress and findings during a task.

Before sharing, it makes sure the agent is still authorized to do so, making the process secure. 

You provide the tool's ID, the tool's output as text, the client session's ID, and the agent's name to complete the sharing process. The function handles the rest, ensuring a clean and validated communication within the swarm.

## Function commitSystemMessageForce

This function lets you push a system message into a session, even if an agent isn’t actively handling it. It’s a way to ensure important system-level messages get through, bypassing typical agent checks. 

Essentially, it validates the session and swarm to make sure everything is in order before committing the message.  It’s like a direct line for system updates or control instructions, similar to the forceful assistant message commit. 

You’ll need to provide the message content and the client ID for the session. This function takes care of things like managing the execution environment and logging activities.

## Function commitSystemMessage

This function lets you send system-level messages to a specific agent within your AI agent swarm. Think of these messages as commands or configuration updates, rather than responses from the agent itself.

Before sending the message, it carefully checks that the agent, session, and swarm are all valid and that you’re targeting the correct agent. 

It's designed to be a safe and reliable way to manage your agents, automatically handling the necessary checks and logging everything for easy tracking. To use it, you’ll need the message content, a client ID to identify the session, and the name of the agent you want to communicate with.

## Function commitStopToolsForce

This function allows you to immediately halt the execution of any tools for a particular client within the AI agent swarm. It’s a forceful way to stop tool processing, bypassing typical checks to see which agent is currently active.

Essentially, it provides a way to override the system's normal flow and stop tools right away. 

It verifies that the session and swarm are valid before proceeding, and uses several internal services to manage the process, including session and swarm validation, tool execution stoppage, and logging. Think of it as a more assertive version of stopping tools – like flushing data forcefully versus a standard flush. You’re telling the system, "Stop processing tools for this client, now!". The function requires the client's ID to identify the session you want to affect.

## Function commitStopTools

This function gives you a way to temporarily pause a specific AI agent’s tool usage within a larger swarm system. It’s like putting a brief hold on what an agent is doing.

Essentially, you provide the client's ID and the agent’s name, and the system will prevent that agent from running its next tool.

Behind the scenes, it carefully checks to make sure the agent and session are valid before stopping the tool execution, and it keeps track of everything it's doing for auditing purposes. It's a way to control the flow of actions, distinct from clearing an agent's history – it simply prevents the *next* tool from running. 

The function validates the client and agent to ensure they are active and registered before stopping the tool.

## Function commitFlushForce

This function forcefully clears the agent's history for a particular client. It’s designed to ensure the history gets flushed even if there are unexpected situations or the agent isn't actively engaged.

It verifies that the session and swarm are valid before proceeding with the clear. Think of it as a more assertive version of a standard history clear, bypassing typical checks to guarantee the process happens.

To use it, you simply provide the client’s ID, which is used to confirm the session is valid. This function handles the behind-the-scenes work of session and swarm verification and logging, so you don’t have to.

## Function commitFlush

This function lets you completely clear the conversation history for a specific agent working on behalf of a particular client. It’s like hitting a reset button for that agent’s memory.

Before clearing the history, it double-checks that the agent and client are valid and that everything is working correctly within the system. It's designed to be a complementary action to functions that add messages, allowing you to discard the entire history instead of just appending new content. You provide the client’s ID and the agent's name to specify which agent’s history should be cleared.

## Function commitAssistantMessageForce

This function lets you directly push a message from an assistant into a session, bypassing the usual checks for an active agent. It's useful when you need to ensure a message is recorded, even if an agent isn't currently handling the session. 

Essentially, it guarantees the message gets added to the session history. It verifies that the session and swarm are valid before proceeding, and records the operation in the logs. 

You'll need to provide the message content and the client ID associated with the session for it to work. Think of it as a "force" option, similar to other forceful operations in the system.

## Function commitAssistantMessage

This function lets you record messages generated by an AI agent within our system. It essentially saves the agent’s output, associating it with a specific client and agent name.

Before saving, it double-checks that the agent, session, and the overall swarm are all valid and that the agent you’re specifying is the correct one for this message. 

Think of it as a way to permanently store the agent’s contributions, ensuring everything is properly linked and traceable within the system, unlike functions that might discard or cancel output. The process includes checks and logging to keep everything organized and accountable.

Here's what you need to provide: the actual message content, a client identifier to connect it to the user's session, and the name of the agent that produced the message.

## Function changeToPrevAgent

This function allows you to switch back to a previously used agent for a specific client. Think of it as a "back" button for agent selection. It will go to the last agent the client used, or if there's no history, it will use the default agent. The system checks to make sure the client session and agent are valid before making the change, and it keeps a log of the action if logging is turned on. The change is handled carefully, ensuring it happens reliably and doesn’t interfere with other processes.

## Function changeToDefaultAgent

This function allows you to easily revert a client’s agent selection back to the swarm's pre-configured default. It's like hitting a reset button for the agent handling a particular client session. 

The system will check to make sure the client session is valid and that a default agent is set up.  The switch happens in a controlled way, ensuring a smooth transition without interrupting other ongoing tasks. You provide the unique ID of the client session to specify which client's agent should be changed.

## Function changeToAgent

This function lets you switch which AI agent is handling a particular client's session within the swarm. It’s designed to be reliable – it checks that the switch makes sense, keeps a log of what's happening if you’re tracking those details, and uses a safe, queued process to actually make the change. Think of it as a controlled handover between agents for a specific client. You’ll need to provide the name of the agent you want to activate and the unique ID for the client session.

## Function cancelOutputForce

This function lets you quickly stop a client’s pending output, even if the system isn't sure what agents are currently working. It forcefully ends the output process by sending an empty response.

It checks to make sure the session and swarm are valid before proceeding with the cancellation.

Think of it as a more direct way to cancel output compared to other methods, useful when you need to ensure a response is stopped immediately without worrying about agent status. The `clientId` tells the system which client’s output to stop.

## Function cancelOutput

This function lets you stop an agent from sending you its results. It's useful when you realize you don't need the information anymore, or want to interrupt the process.

To use it, you'll need to provide the unique ID of the client requesting the output and the name of the agent that’s working on it.

Behind the scenes, the system checks to make sure the agent and session are valid before canceling the output, ensuring everything is handled correctly and safely. It also keeps track of what's happening with detailed logging.

## Function addWiki

This function lets you add a new wiki structure to the system. You provide a schema defining the wiki's organization, and the function returns a unique identifier for that wiki. Think of it as registering a new knowledge base for your agents to use.  The schema you provide outlines how the wiki is organized and what kind of information it contains.

## Function addTriageNavigation

This function lets you set up a special tool that helps an AI agent easily connect with a dedicated triage agent. Think of it as creating a shortcut or a guided pathway for the agent to seek assistance when needed.  You provide some configuration details – these are the "parameters" – and the function takes care of registering the tool so the agent can use it. The function then returns a string, likely an identifier or confirmation related to the setup.

## Function addTool

This function lets you add new tools to the system, so your AI agents can use them to complete tasks. Think of it as equipping your agents with new abilities. 

Before an agent can use a tool, it needs to be registered with this function. The system will then recognize and make it available for agent use. 

The registration process is handled in a way that keeps it separate from any ongoing tasks, ensuring a reliable setup. You’ll get back the name of the tool you just added to confirm everything went smoothly. The tool is defined by a schema that describes its name and how it works.

## Function addSwarm

This function lets you create a new "swarm" within the system, essentially setting up a container for organizing and running client sessions. Think of it as defining the blueprint for how your agents will interact and handle tasks together. It's how you tell the system what kind of sessions you’re planning to manage. Only swarms added using this function will be recognized and usable. To keep things clean, the process runs in a separate, isolated environment.  When everything goes well, the function will give you the name of the newly created swarm. The `swarmSchema` parameter holds all the important details about how your swarm will operate, including its name and default agent.

## Function addStorage

This function lets you add a new way for your AI agents to store and retrieve data, like a custom database or cloud storage. Think of it as registering a new tool for your swarm to use. By providing a schema, you define how this storage works and how it should be accessed.

If the storage is designated as shared, the system will automatically connect to the shared storage service and wait for it to be ready. This ensures everything is properly set up before the agents start using it.

Importantly, only storage engines added through this function are recognized by the AI agent swarm. The function executes in a clean environment and reports its actions, ultimately returning the name of the newly registered storage.

## Function addState

This function lets you define and register new states that your AI agent swarm can use. Think of it as creating building blocks of data that agents can share and interact with. Only states added through this function will be recognized by the system. If a state is designated as shared, the system automatically sets up the connection and waits for it to be ready. This function ensures a clean and isolated environment when registering states and provides the state's name once it's successfully registered. You'll need to provide a schema outlining the state’s properties, name, and whether it’s shared.

## Function addPolicy

This function lets you define and register rules, or “policies,” that guide how agents in your AI swarm operate. Think of it as setting the ground rules for your agents. 

It ensures that each policy you add is properly validated and its structure is managed. The process is handled carefully within a controlled environment, and actions are logged for tracking purposes. 

You'll provide a schema that outlines the specifics of the policy, including its name and configuration details. This helps to ensure that policies are consistently applied and that agent behavior aligns with your desired outcomes.

## Function addPipeline

This function lets you define and register a new workflow, or "pipeline," within the agent swarm orchestration system. Think of it as setting up a blueprint for how your agents will work together. It takes a description of the pipeline – what steps are involved and how they connect – and makes it available for use. The function checks that the pipeline definition is valid before adding it to the system, ensuring everything is set up correctly. Once registered, this pipeline can then be used to orchestrate agent actions.

## Function addOutline

This function lets you add a new outline structure to the AI agent swarm. Think of it as defining a blueprint for how agents will organize their work.

It carefully sets up a fresh environment before making the change, to prevent unexpected problems. The process is also logged if you've enabled that feature in the system’s settings. 

You provide the outline schema as input, which includes the outline's name and how it’s configured.

## Function addMCP

This function lets you add new blueprints for how AI agents communicate and share information. Think of it as defining a custom language for your agent swarm. You provide a schema, which describes the structure of the messages and data exchanged, and the system registers it, making it available for your agents to use. Essentially, it’s how you extend the framework with new ways for your AI agents to interact.

## Function addEmbedding

This function lets you add a new tool for creating embeddings – think of them as numerical representations of text or other data – to the system. By registering an embedding engine with this function, you make it available for the swarm to use in various tasks, like comparing how similar different pieces of information are. It's important to register embeddings this way because only those registered through this function are recognized. To keep things clean and separate from other ongoing operations, the registration happens in a dedicated environment. Finally, the function tells you the name of the embedding you just added. 

The `embeddingSchema` you provide acts as a blueprint, defining the embedding’s name and all its settings.

## Function addCompute

This function lets you define and register the blueprints for how your AI agents will actually *do* things. Think of it as creating a template for a task – it describes what data the agent needs, what actions it can take, and how the results are structured. When you register a compute schema, the system checks to make sure it's valid, and then it's ready to be used by your agents. The function returns a unique identifier for your compute schema, which you'll use to refer to it later.

## Function addCompletion

This function lets you add new ways for your AI agents to generate text, like connecting to different language models. Think of it as expanding the toolbox available to your agents. You provide a description of the new text generation method – including its name and settings – and this function registers it within the system. It makes sure the registration happens cleanly and logs the action for tracking purposes. Finally, it tells you the name of the newly added text generation method.

## Function addAgentNavigation

This function lets you set up a way for one agent in your swarm to directly navigate to another agent. It's like creating a simple "go to" functionality between agents. You provide some configuration details as parameters, and the function handles registering that navigation tool. The function returns a string, presumably a unique identifier for the newly created navigation tool.

## Function addAgent

This function lets you register a new agent so it can be used within the swarm. Think of it as adding an agent to the system's list of available workers. You provide a description of the agent – including its name – and the system adds it to its registry. Only agents added this way can participate in swarm tasks. The registration happens in a controlled environment, ensuring a fresh start each time. Upon successful registration, the function tells you the name of the agent you just added.

# agent-swarm-kit classes

## Class WikiValidationService

This service helps ensure that your wikis are set up correctly, following defined structures. Think of it as a gatekeeper for your wiki data.

You can add different wikis and their expected formats to the service, essentially defining how each wiki *should* look. Then, when you have data you want to add to a wiki, this service checks if it conforms to the rules you've established. It verifies that the wiki actually exists and has the expected structure before allowing changes. It uses a logger to keep track of what’s happening during the validation process.

## Class WikiSchemaService

The WikiSchemaService helps manage and organize your wiki schema definitions within the agent swarm orchestration framework. It's responsible for keeping track of different wiki schema versions and making sure they meet basic requirements.

You can think of it as a central repository for all your wiki schema blueprints. It allows you to register new schemas, update existing ones, and easily retrieve them when needed. The service also relies on a schema context service to handle schema-related operations and a logger service for tracking what’s happening. The `register` method adds a new schema, while `override` lets you modify an existing one. Finally, `get` allows you to retrieve a specific schema by its key.

## Class ToolValidationService

This service makes sure the tools used by your AI agent swarm are properly configured and unique. It keeps track of all the registered tools and their descriptions, acting as a central authority for tool validation. When a new tool is added, this service registers it and verifies that it doesn’t already exist. When an agent needs to use a tool, this service confirms that the tool is registered and valid. It's designed to work closely with other parts of the system, like the tool registration service and agent validation, and uses logging to keep track of what’s happening. The whole process is optimized to be fast and efficient by remembering the results of previous validations.

## Class ToolSchemaService

The ToolSchemaService manages the definitions of tools used by agents within the swarm system. Think of it as a central library where agents can find out how to perform specific tasks – like making API calls or validating data. It makes sure these tool definitions are consistent and valid before they are used. 

This service works closely with other parts of the system, such as the service that manages agent schemas and the connection services for agents and the swarm itself. It uses logging to keep track of what's happening, and it’s designed to be flexible, allowing tools to be registered, updated, and retrieved as needed. Essentially, it’s a foundational component that makes sure agents have the right tools to do their jobs.

## Class ToolAbortController

This class helps you control when operations are stopped, especially for tasks that might take a while. Think of it as a way to tell a running process, "Hey, you don't need to finish anymore!"

It manages an `AbortController` behind the scenes – a standard way to handle stopping asynchronous actions – so you don’t have to deal with the technical details directly.

If the environment doesn’t support `AbortController`, the class gracefully handles that, becoming essentially inactive.

You can call the `abort` method to actively tell any ongoing operations to stop.

## Class SwarmValidationService

This service acts as a central hub for ensuring the correctness of your AI agent swarms. It keeps track of all registered swarms and makes sure they’re properly configured. Think of it as a quality control system that verifies things like unique swarm names, the existence of agents, and the validity of policies.

It works closely with other services within the system, such as those managing agent and policy validation, swarm registration, and logging. To make things efficient, it remembers the results of previous validation checks so it doesn’t have to repeat them unnecessarily.

You can use this service to:

*   **Register new swarms:** Add a swarm and its configuration to the system.
*   **Get agent and policy lists:** Retrieve the agent and policy names associated with a specific swarm.
*   **Validate swarm configurations:**  Make sure a swarm is set up correctly, checking for things like agent and policy validity.
*   **View registered swarms:** See a list of all the swarms currently managed by the system.

The service relies on injected dependencies to interact with other services, and is designed to be highly efficient thanks to its use of caching.

## Class SwarmSchemaService

The SwarmSchemaService manages the configurations used to orchestrate your AI agents. Think of it as a central library for storing and retrieving these blueprints. It makes sure these configurations are structurally sound before they're used, and keeps track of them using a reliable registry. 

It works closely with other services to ensure everything is properly linked – from how agents connect to how policies are applied.  You're able to register new configurations, update existing ones, and easily retrieve them when needed. The service also keeps a log of important actions, helping with troubleshooting and understanding how your swarm is being managed. This centralized approach makes it easier to set up, modify, and maintain your AI agent deployments.

## Class SwarmPublicService

This service acts as a public gateway for interacting with a swarm of agents. Think of it as the control panel for managing and observing the swarm's activities.

It handles things like sending messages, navigating between agents within the swarm, checking if the swarm is busy, canceling operations, waiting for output, and retrieving information about the current agent.  All these actions are carefully tracked and scoped to a specific client and swarm to ensure things run smoothly.

It's built on top of other services for logging, connection management, and performance tracking, allowing for detailed monitoring and control.  For example, it's used by components like the agent executor and agent management tools to make sure everything works together correctly and to provide a consistent view of the swarm's state. Actions like cleaning up the swarm after use are also managed through this service.

## Class SwarmMetaService

This class is like a translator and organizer for your AI agent swarm. It takes the underlying structure and information about your swarm – how the agents are connected and what they do – and turns it into a visual representation using UML diagrams. 

Think of it as building a family tree for your AI agents, then drawing that tree in a standard, easy-to-understand format. It uses other services to get the raw data (schemas, agent information), and it logs its work along the way for debugging. The resulting UML diagrams are used to document your swarm's design and help understand how everything fits together. You can create these diagrams automatically for each swarm.

## Class SwarmConnectionService

This service manages connections and operations within AI agent swarms. Think of it as the central hub for working with specific swarms – it handles things like getting a swarm ready, sending messages, and controlling the active agent.

It's designed to be efficient by caching swarm instances, which means it doesn't have to recreate them every time you need to use them. It works closely with other services like those handling agents, sessions, and performance tracking.

Here's a breakdown of what it does:

*   **`getSwarm`**: This is your primary way to access a swarm. It finds or creates a ready-to-use swarm based on your client and swarm name.
*   **`emit`**: Allows you to send messages to the swarm, often for asynchronous communication.
*   **`navigationPop`**: Moves the swarm back a step in its navigation history.
*   **`getCheckBusy`**: Lets you know if the swarm is currently busy processing something.
*   **`cancelOutput`**: Stops any pending output from the active agent.
*   **`waitForOutput`**: Retrieves the output from the active agent.
*   **`getAgentName`**: Tells you the name of the currently active agent.
*   **`getAgent`**: Provides direct access to the current agent instance.
*   **`setAgentRef`**: Allows adding or updating agents within the swarm.
*   **`setAgentName`**: Changes the currently active agent.
*   **`dispose`**: Cleans up the connection to the swarm.

The service keeps track of what’s going on by logging actions and cooperating with other services for performance and coordination.

## Class StorageValidationService

This service is responsible for making sure your storage configurations are set up correctly within the swarm. It keeps track of all registered storages, ensuring that each one is unique, exists, and has a valid embedding. 

It works closely with other services like the one that handles storage registration, the one that performs storage operations, and the one that validates agents and embeddings, all while keeping an eye on logging. To make things efficient, it uses a technique called memoization to avoid repeating validation checks. 

You can register a new storage using the `addStorage` function, and then validate its configuration using the `validate` function. The validation process verifies not only the storage's existence but also the validity of its embedding configuration.

## Class StorageUtils

This class provides tools for managing how data is stored and accessed within the agent swarm, specifically for individual clients and agents. Think of it as a helper for organizing and interacting with storage related to a particular client’s agents.

It allows you to retrieve data (like fetching a limited set of items based on a search term), update existing data, delete items, and list everything stored. You can also create numeric indexes for the storage and clear all data if needed.

Before performing any of these actions, it verifies that the client is authorized, that the storage name is valid, and that the agent is properly registered to use that storage. Every operation is also carefully tracked for auditing purposes.

## Class StorageSchemaService

This service acts as a central hub for managing how data is stored and accessed within the AI agent swarm. It's like a librarian, keeping track of the rules and structures for different storage configurations.

Think of it as a directory where each storage type (like a database or file system) is registered with a specific name and set of instructions. Before any storage is used, it's checked to make sure it’s set up correctly.

You can register new storage types, update existing ones, and easily retrieve the necessary information whenever needed.  The service keeps a record of these settings, and it also logs important actions for tracking and debugging. It works closely with other services, ensuring that everyone is using the same storage rules.

## Class StoragePublicService

The `StoragePublicService` class manages storage operations specifically tied to individual clients within the swarm system. Think of it as a way to keep data separate for each client, unlike shared, system-wide storage. This service uses logging for transparency and relies on other services like `LoggerService`, `StorageConnectionService`, and `MethodContextService` to handle its core functions.

It offers common storage actions like retrieving items (`take`, `get`), adding or updating items (`upsert`), deleting items (`remove`), listing all items (`list`), clearing the entire storage (`clear`), and releasing resources (`dispose`). These actions are always scoped to a particular client, identified by a `clientId`, and a specific storage area identified by `storageName`. 

The service is designed to be used by components like `ClientAgent` and `PerfService`, enabling them to interact with client-specific storage while maintaining context and logging information.  For example, `ClientAgent` might use this service to store and retrieve data for a specific client’s session, and `PerfService` might use it to track storage usage.  The `loggerService` is used for detailed logging if enabled.

## Class StorageConnectionService

This service manages how your swarm system connects to and interacts with storage. It handles creating, accessing, and cleaning up storage connections specifically for each client and storage name. Think of it as a central point for managing where your data lives and how the swarm can get to it.

It cleverly caches frequently used storage connections to avoid unnecessary overhead. If a connection is marked as “shared”, it delegates to a separate service to manage it.

Several other parts of the system work closely with this service, including logging, event handling, schema management, usage tracking, and shared storage. Essentially, this service is the gatekeeper for your swarm's storage needs, ensuring efficient and controlled access.

Here's a breakdown of what you can do with it:

*   **Get Storage:** Retrieve an existing storage connection or create a new one. This is the main way to interact with the storage.
*   **Take:** Search and retrieve data from storage.
*   **Upsert:** Insert or update data in storage.
*   **Remove:** Delete data from storage.
*   **Get:** Retrieve a single item from storage.
*   **List:** Retrieve a list of items from storage.
*   **Clear:** Empty the contents of a storage.
*   **Dispose:** Clean up resources and release a storage connection.



It's designed to be efficient, secure, and to work smoothly with other components of your swarm system.

## Class StateValidationService

The StateValidationService helps ensure that the information your AI agents are working with stays consistent and follows the expected format. Think of it as a quality control system for your agent's data.

It lets you define what a "state" should look like – essentially a blueprint for the data an agent might use or produce. You can add these state definitions, telling the service what to expect. 

When your agents update or provide data, the StateValidationService can check if it matches your defined blueprints, helping to catch errors early and maintain data integrity across your AI agent swarm. It uses a logging service to keep you informed of any issues it finds.

## Class StateUtils

This class helps manage the data associated with individual clients and agents within the swarm. Think of it as a toolkit for keeping track of information specific to each interaction. You can use it to fetch existing data, update it with new information, or completely reset it. Before any of these actions happen, the system checks to make sure everything is authorized and registered correctly. The operations are also logged for tracking and debugging purposes.

## Class StateSchemaService

The StateSchemaService acts as a central hub for managing the blueprints of how data is structured and accessed within the AI agent swarm. Think of it as a library where all the instructions for handling different types of state are stored.

It ensures that these blueprints, called "state schemas," are consistent and valid. This service works closely with other components – like those handling connections, shared data, and agent execution – to make sure everything interacts smoothly.

When a new state schema is added or an existing one is updated, the service verifies its basic integrity, logs the operation, and keeps track of it in a registry. You can then retrieve these blueprints when needed, providing the necessary configuration for tasks like retrieving data or applying processing steps. This ensures a reliable and structured way to manage state within the swarm.

## Class StatePublicService

The StatePublicService manages state specifically tied to individual clients within the swarm system. Think of it as a way to keep track of information unique to each client’s interactions. It works hand-in-hand with other services like ClientAgent and PerfService, enabling things like client-specific data updates and performance tracking.

It allows you to set, clear, retrieve, and dispose of this client-specific state. All operations are logged for debugging purposes if logging is enabled.

This service contrasts with system-wide state and persistent storage, focusing solely on the information related to a particular client. It uses a `StateConnectionService` for the underlying data operations and wraps those calls within a context to control access and logging.

## Class StateConnectionService

This service manages how different parts of the system interact with and store state information. Think of it as a central hub for handling client-specific and shared state data.

It's designed to be efficient, reusing existing state instances when possible and ensuring updates happen safely and in the correct order. It works closely with other services like logging, event handling, and security to keep things running smoothly.

Here's a breakdown of what it does:

*   **Manages State Connections:** It's responsible for getting and setting state for different clients and applications.
*   **Handles Both Client and Shared States:** It can deal with state that's specific to a single client, and also shared state that's accessible to multiple clients.
*   **Keeps Things Efficient:**  It remembers previously created state information (memoization) to avoid unnecessary work.
*   **Works with Other Services:** It integrates with various system components to handle logging, event propagation, security validation, and overall system health.

Key functions include:

*   `getStateRef`: Retrieves or creates state. It's a core function that intelligently manages state instances.
*   `setState`: Updates the state in a controlled and thread-safe manner.
*   `clearState`: Resets the state to its original condition.
*   `dispose`: Cleans up resources when state is no longer needed.





## Class SharedStorageUtils

This class provides helpful tools for interacting with a shared storage space used by agents working together. You can use it to fetch data based on a search query, add or update items, delete specific items by their ID, retrieve a single item, list all items with the option to filter them, or completely empty the storage. Each operation is carefully handled to make sure the storage name being used is correct and the process is properly logged.

## Class SharedStoragePublicService

This class manages how different parts of the system interact with shared storage. Think of it as a controlled gateway for accessing and manipulating data stored across the swarm. It simplifies storage operations, ensuring they are tracked and scoped correctly.

It works closely with other services like the logging service for record-keeping, and the underlying storage connection service to handle the actual data interactions.

Here's a breakdown of what it can do:

*   **Retrieve Data:** You can search for items, fetch a specific item by its ID, or get a list of all items.
*   **Modify Data:** It allows you to add new items or update existing ones.
*   **Remove Data:**  It can delete individual items or clear the entire storage.
*   **Logging:** All operations are logged, making it easier to monitor and debug storage-related activities, provided logging is enabled.

Essentially, this class provides a safe and manageable way for different components within the system to share and utilize data.

## Class SharedStorageConnectionService

This service manages shared storage connections within the swarm system, acting as a central hub for accessing and manipulating data. It ensures that all clients use the same storage instance for a given name, creating a truly shared resource.

It leverages several other services for configuration, event handling, and data persistence, making sure everything works together smoothly. It intelligently caches storage instances to avoid unnecessary setup.

Here's a breakdown of what it does:

*   **Retrieves Storage:** It gets or creates a shared storage instance for a given name, ensuring only one exists across the entire system.
*   **Data Retrieval:** It allows you to search and retrieve data from the shared storage, optionally using similarity scores for more relevant results.
*   **Data Manipulation:** It provides methods to add, update, delete, and list data within the shared storage, mirroring operations available to other clients.
*   **Clearing Storage:** It offers a way to completely reset the shared storage to its initial state.



It integrates closely with other system components, including logging, event propagation, and configuration management, providing a robust and centralized approach to shared data management.

## Class SharedStateUtils

This class offers helpful tools for managing shared information among agents in your swarm. Think of it as a central place where agents can read, update, and reset common data.

You can easily retrieve existing shared data using `getState`, specifying the name of the data you're looking for.  When you need to update that shared data, `setState` lets you either provide a new value directly or calculate it based on what's already there. If you need to completely reset a piece of shared information, `clearState` will bring it back to its original condition. All these operations are handled in a way that allows for monitoring and ensures communication with the swarm’s shared state system.

## Class SharedStatePublicService

This class manages how different parts of the system share and interact with data. Think of it as a central hub for shared information, making sure everyone can access and update it consistently. It allows different components like ClientAgent and PerfService to work together by providing a controlled way to manage shared data.

It offers straightforward methods for setting, clearing, and retrieving this shared data, always keeping track of what's happening through logging when enabled. The class relies on other services for logging and actual data handling, promoting a modular design and making it easier to understand how it fits into the larger system. It's a key element in ensuring that different parts of the swarm system operate in sync and have access to the information they need.

## Class SharedStateConnectionService

This service manages shared data accessible by all agents within the system. Think of it as a central repository for information that needs to be synchronized across the swarm.

It's designed to be efficient, reusing existing data whenever possible through a technique called memoization. It also ensures that any changes to the shared data are handled in a safe and orderly way, preventing conflicts.

Here's a breakdown of what it does:

*   **Provides access to shared data:** You can retrieve the current value of a specific piece of shared data.
*   **Allows updating shared data:** You can change the shared data using a function that determines the new value based on the current value.
*   **Resets shared data:** You can clear the shared data, returning it to its original state.
*   **Works with other services:**  It coordinates with other parts of the system like the logging service, event bus, and state schema service to ensure everything works together seamlessly.



It's built to be consistent with how other agents and services handle shared data, making it a reliable and predictable component of the overall system.

## Class SharedComputeUtils

This class, SharedComputeUtils, provides helpful tools for managing and retrieving information about shared computing resources. Think of it as a central hub for interacting with these resources. You can use it to refresh the status of a specific compute resource using the `update` method – it’s like hitting a refresh button.  The `getComputeData` method allows you to fetch data about a compute resource, and it's flexible because it can handle different data types, ensuring you get exactly what you need. It lets you ask, "Hey, what's the current status of this compute resource, and what kind of data can I expect back?"

## Class SharedComputePublicService

This class, `SharedComputePublicService`, acts as a bridge for accessing and managing shared computing resources within your AI agent swarm. It helps coordinate tasks across multiple compute units, ensuring agents can efficiently leverage available power. 

Think of it as a central hub; you can use it to request data from shared compute resources (`getComputeData`) and to trigger computations (`calculate`). The `update` method allows you to refresh information related to specific compute tasks. Internally, it relies on a `loggerService` for tracking activity and a `sharedComputeConnectionService` for handling the low-level communication with the compute infrastructure.

## Class SharedComputeConnectionService

This class, `SharedComputeConnectionService`, acts as a central hub for connecting agents within a swarm to a shared compute resource. It manages the communication and data exchange needed for agents to work together effectively.

Inside, you'll find services like logging, messaging, and context management, all essential for coordinating agent activities.  It provides a way to retrieve references to compute resources and fetch their data.

The `calculate` method initiates computations related to a specific state, while `update` ensures the shared compute is refreshed. Essentially, this service streamlines how agents interact with and benefit from a common computational space.


## Class SessionValidationService

This service is responsible for tracking and managing sessions within the AI agent swarm system. It keeps tabs on which agents, storage resources, histories, states, and computes are being used within each session, ensuring everything is consistent. It works closely with other services to handle session creation, agent usage, resource tracking, and logging.

The service uses logging to keep a record of session operations and utilizes memoization to optimize performance when validating sessions. 

Here’s a breakdown of what it does:

*   **Session Registration:** It registers new sessions, associating them with specific swarms and modes.
*   **Resource Tracking:** It tracks the usage of agents, storage, histories, states, and computes within each session.
*   **Session Validation:** It verifies if a session exists and is valid, preventing unauthorized access or actions.
*   **Session Management:**  It provides methods to retrieve session information, list all sessions, and remove sessions when they are no longer needed.
*   **Cleanup:** The service also allows clearing session validation data when a session is disposed.

## Class SessionPublicService

This class acts as the main gateway for interacting with AI agent sessions within the system. It handles sending messages, executing commands, and managing the overall session lifecycle.

Think of it as a middleman - it receives requests from clients (like user interfaces or other agents), and then safely passes those requests on to the underlying session management tools.  It also keeps track of key events like message sending, execution start/end, and errors, ensuring consistent logging and performance tracking.

Here's a breakdown of what it does:

*   **Message Handling:** It provides ways to send messages (both regular and system messages) to the session, allowing for two-way communication.
*   **Command Execution:** It can execute commands or run quick completions within the session, managing the process and tracking its progress.
*   **Session Management:** It handles connecting to sessions, committing changes to their history, and ultimately disposing of them when finished.
*   **Context & Logging:** Every action taken is carefully logged and scoped, ensuring that the system knows exactly what's happening within each session.
*   **Security and Validation:**  There are built-in checks to prevent issues like recursive tool calls or unauthorized actions.


## Class SessionConnectionService

This class manages connections and operations within an AI agent swarm session. Think of it as the central hub for a single conversation or workflow between an AI agent and a user. It efficiently reuses session data to avoid unnecessary overhead, relying on injected services for things like logging, event handling, and swarm configuration.  

It's responsible for retrieving or creating a session, sending notifications, executing commands, and handling different types of messages (user input, assistant responses, tool requests). It ensures consistency across various operations within the session by delegating to `ClientSession` and integrating with other services.  It’s also important for cleaning up resources when a session is no longer needed.

## Class SchemaUtils

The SchemaUtils class offers helpful tools for working with session memory and data formatting within the system. It allows you to store and retrieve data associated with specific clients, ensuring proper validation and logging during these operations. You can also use it to easily convert objects or lists of objects into formatted strings, which is useful for things like logging or transmitting data. This includes the ability to flatten complex objects and customize how keys and values are represented in the resulting string.

## Class RoundRobin

This class provides a simple way to rotate through a list of different "creators" – think of them as different ways to generate something or handle a task. It works by keeping track of a sequence of these creators and cycling through them one by one.

You give it a list of creators and a "factory" function that knows how to build an instance based on each creator.  

The `create` method lets you generate a rotating function, so you can consistently use different creators in a predictable order. It’s useful for distributing workload, testing different implementations, or providing alternatives for a service. The round robin keeps track of which creator it's currently using.

## Class PolicyValidationService

This service is responsible for making sure the policies used by your AI agent swarm are correctly registered and exist. It keeps track of all the policies you’ve defined, ensuring there are no duplicates.

The service works closely with other components like the policy registration system and the mechanism that actually enforces the policies, all while keeping an eye on performance through caching.  

You can add new policies to the system using the `addPolicy` function. When a policy needs to be used, the `validate` function confirms that the policy is registered and ready to go, a quick and efficient check that's optimized for speed. It uses logging to track what’s happening and makes sure everything runs smoothly.

## Class PolicyUtils

This class offers helpful tools for managing client bans within your AI agent swarm's policies. It provides a straightforward way to ban, unban, and check the ban status of clients, making sure everything is handled safely and with proper tracking.

Essentially, you can use it to:

*   **Ban a client:**  This method takes a client ID, swarm name, and policy name to prevent a client from accessing the swarm under that specific policy.
*   **Unban a client:**  This reverses the banning process, allowing a client to access the swarm again.
*   **Check if a client is banned:**  This tells you whether a client is currently banned under a specific policy within a swarm.

Before performing any of these actions, the class checks that everything is valid and records what’s happening for auditing purposes.

## Class PolicySchemaService

The PolicySchemaService acts as a central hub for managing and organizing the rules that govern your AI agent swarm. Think of it as a library where you store and retrieve sets of instructions (policy schemas) that dictate how agents behave and who they can interact with.

It ensures these rules are consistent and valid by performing basic checks before they're put into use. This service works closely with other components of the system, like those responsible for actually enforcing the rules, managing agent execution, and providing public access to policy information.

You can register new rules, update existing ones, and easily retrieve them when needed. The system keeps track of these schemas using a special registry, ensuring efficient storage and quick access. Logging is enabled to track actions taken, which helps with troubleshooting and auditing. Essentially, it's the foundation for defining and applying policy logic within your swarm.

## Class PolicyPublicService

This class helps manage how policies are applied within the system, acting as a public interface for interacting with policy-related operations. It handles checking if a client is banned, retrieving ban messages, validating both incoming and outgoing data, and managing client bans and unbans. 

The class relies on several other services like logging, policy connections, and context management, ensuring operations are properly scoped and tracked. It’s used across different parts of the system, including performance monitoring, client agents, and documentation. 

Specifically, it offers functions to:

*   Check if a client is currently banned.
*   Get a message explaining why a client might be banned.
*   Validate data being sent and received according to policy rules.
*   Ban or unban a client from a swarm.

It keeps a record of these actions through logging, controlled by a global configuration setting, and integrates with other services to provide a consistent experience.

## Class PolicyConnectionService

This class, `PolicyConnectionService`, acts as a central hub for managing policy-related actions within the swarm system. It essentially handles how policies are applied and enforced, ensuring consistency across different parts of the system.

It's designed to be efficient, caching frequently used policy configurations to avoid redundant work.  This service relies on several other components – logging, event emission, context management, and policy schema retrieval – to operate correctly.

Here's a breakdown of its key functions:

*   **Policy Retrieval & Management:** It retrieves and caches policy information, providing a consistent way to access policy details.
*   **Ban Status Checks:** It checks if a client is banned within a specific swarm.
*   **Ban Messaging:** It retrieves custom messages associated with a client's ban.
*   **Input/Output Validation:**  It validates data going into and out of the system, according to defined policies.
*   **Ban/Unban Actions:** It can ban or unban clients from a swarm, enforcing policy restrictions or granting access.



Essentially, this service is the behind-the-scenes engine that ensures policies are applied correctly and consistently throughout the swarm environment.

## Class PipelineValidationService

The PipelineValidationService helps you ensure your AI agent workflows, or pipelines, are correctly structured before you run them. It keeps track of the expected format for each pipeline you’re using.

You can add new pipeline definitions, specifying their expected structure using the `addPipeline` function. Then, when you have a pipeline source you want to check, the `validate` function will verify it against the defined structure, helping you catch errors early on.  The service relies on a logger to provide feedback and uses an internal map to store pipeline definitions.

## Class PipelineSchemaService

The PipelineSchemaService helps manage and organize the blueprints for your AI agent workflows. It acts as a central place to store and retrieve these blueprints, making sure they are consistent and reusable.

Think of it as a library for your agent workflows; you can register new workflow designs, update existing ones, and easily access them when needed. This service relies on a context service to handle the details of working with these workflows, and it keeps a record of everything it manages. It provides methods for registering new workflow schemas, updating existing ones, and retrieving them when you need to use them in your system.

## Class PersistSwarmUtils

This class helps manage how information about your AI agents – like which agent is currently active and their navigation history – is saved and retrieved. It works with specific "swarms" of agents and individual client sessions.

It provides simple ways to get and set the currently active agent for a client within a swarm. You can also track a navigation "stack," which is a record of the agents a client has recently used, allowing for easy backtracking or history.

Importantly, this class is designed to be flexible. It allows you to plug in your own custom storage solutions (adapters) for managing agent activity and navigation, letting you tailor the persistence to your specific needs beyond just using the default approach. This flexibility can be helpful for things like testing or using alternative storage technologies.

## Class PersistStorageUtils

This class helps manage how information is saved and retrieved for each user and application within the system. It provides a straightforward way to get and set data related to a specific user session and a named storage area. The system cleverly ensures that you're not creating duplicate storage instances, which makes it more efficient. 

You can also customize how the data is persisted by providing your own storage constructor, allowing for more advanced storage options like using a database. This gives you flexibility in how the data is stored and retrieved.

## Class PersistStateUtils

This class provides a way to manage and save information related to each client’s session within the swarm system. Think of it as a memory system that allows agents to remember things between interactions. 

You can store data for a specific client (identified by a unique ID) under a descriptive name. This data could represent anything like agent-specific variables or the context of an ongoing conversation. 

When you need to retrieve this information later, the class makes it easy to access, and if the data isn't already saved, you can provide a default value. 

You also have the flexibility to customize how the data is stored – for example, you can tell the system to use a special type of storage, instead of the built-in method. This allows for more advanced persistence solutions like storing data in a database or in memory.

## Class PersistPolicyUtils

This class helps manage which clients are blocked or restricted within your AI agent swarm. It lets you easily get and update lists of banned clients for each swarm, ensuring you can control access and behavior. The system remembers these bans so you don't have to reapply them every time.

The class also optimizes how it stores this information, making sure each swarm only uses one persistence method to avoid unnecessary resource usage. 

You can even customize the way this data is stored and retrieved, allowing for things like temporary bans in memory or more permanent storage in a database.

## Class PersistMemoryUtils

This class helps manage how memory is saved and retrieved for each client interacting with the swarm system. Think of it as a way to remember things a specific client has told the system, so it can pick up where it left off later.

It uses a clever trick to make sure each client has its own dedicated memory storage, which is efficient and avoids conflicts.  You can even customize how this memory is stored – for example, you might want to save it in a database instead of just keeping it in the system’s memory.

The `usePersistMemoryAdapter` feature is particularly useful if you want to change the underlying storage mechanism, like saving memory to a database rather than just using in-memory storage.  Functions like `getMemory` and `setMemory` allow you to retrieve and save client-specific data, while `dispose` helps clean up memory when it's no longer needed.

## Class PersistEmbeddingUtils

This utility class helps manage where and how embedding data is saved within the swarm system. It gives you ways to read and write embedding vectors, allowing for flexible storage options.

The system smartly reuses storage instances for each embedding, making sure resources are used efficiently. You can check if an embedding has already been computed and saved to avoid unnecessary work.

Furthermore, you have the power to customize how embeddings are persisted, choosing your own methods for advanced tracking or integration with specific data stores.

## Class PersistAliveUtils

This class helps keep track of whether clients (identified by a unique ID) are online or offline within a particular swarm. It lets you easily mark clients as active or inactive and check their current status. The system cleverly ensures that each client only has one persistence instance running, which helps with efficiency. You can even customize how this tracking is done by providing your own persistence method, allowing for advanced setups like storing status in memory or a database.

## Class PerfService

This class helps track and log performance data for client sessions within the AI agent system. It gathers metrics like execution times, input/output sizes, and session states, and organizes them into easy-to-understand records.

Think of it as a performance monitor for your AI agents. It collects information about how agents are performing, allowing you to identify bottlenecks and optimize the system.

It does this by integrating with various services (like validation and state services) to gather different pieces of information.  It also uses a logger to record important events, especially when troubleshooting.

The class provides methods to start and stop tracking performance for individual executions, retrieve overall performance metrics, and prepare the data for reporting or analysis.  It relies on several "helper" services that handle different aspects of the data gathering.  Essentially, it creates a performance snapshot that can be reviewed and acted upon.

## Class OutlineValidationService

The OutlineValidationService helps manage and check the structure of outlines used by the agent swarm. It keeps track of registered outlines and makes sure they exist before they're used. The service uses logging to keep track of what's happening and speeds things up by remembering the results of checks. 

It provides a way to register new outline structures, retrieve a list of all registered outlines, and verify that a specific outline exists. If an outline is missing, the service will let you know. It also works closely with other services to ensure completion schemas are correctly configured.

## Class OutlineSchemaService

The OutlineSchemaService is in charge of managing the blueprints, or schemas, that define how our AI agents organize their work. It's like a central library for these blueprints, letting us add new ones, update existing ones, and easily find the one we need.

It keeps track of these schemas internally, using a special tool registry to store them. It also works closely with other services to handle logging and schema management, ensuring everything runs smoothly.

You can use this service to register new schemas, update existing ones by providing just the changes you want to make, and retrieve schemas when needed. The service also makes sure that new schemas are properly formatted before they’s added, and records what's happening for monitoring purposes.

## Class OperatorInstance

This class represents a single instance of an operator within a swarm of AI agents. Each operator instance is uniquely identified by a client ID and an agent name. 

When creating an operator instance, you can provide optional callback functions to handle specific events.

The `connectAnswer` method allows you to subscribe to receive answers generated by the agent. The `notify` method sends a general notification. `answer` is used to send a definitive answer back to the system. You can also use `recieveMessage` to handle incoming messages. Finally, `dispose` provides a clean way to shut down the operator instance when it’s no longer needed.

## Class NavigationValidationService

This service helps manage how agents move around within the system, making sure they don't get stuck in loops or repeat unnecessary journeys. It keeps track of which agents have already been visited for each client and swarm, preventing redundant navigation. 

The service relies on a logger to record important events and utilizes a technique called memoization to store and quickly retrieve navigation routes, which improves performance. 

You can start fresh with navigation tracking for a specific client and swarm, or completely remove existing tracking when it's no longer needed. The system also provides a way to check if navigation to an agent is allowed based on its history.

## Class NavigationSchemaService

This service helps keep track of which navigation tools are being used within the system. It maintains a list of known navigation tool names, allowing you to check if a particular tool is registered. When you register a new tool, the service records this action, providing visibility into which tools are active. The service also provides a way to check if a tool name has already been registered, useful for preventing duplicates or ensuring compatibility.

## Class MemorySchemaService

This service manages temporary, in-memory data associated with specific sessions within the swarm. Think of it as a simple notebook for each session – you can write notes (values) into it, read them back, and then erase the notebook when the session ends.

It uses a straightforward key-value store (a Map) to hold this data, linking session identifiers (client IDs) to whatever information you want to store. This isn’t a permanent storage solution; the data disappears when the session is cleaned up.

The service keeps track of what's happening through logging, and it plays nicely with other parts of the system, like the session management and agent components. It provides ways to check if data exists, add new data, retrieve existing data, and completely remove data when it's no longer needed. It's all about providing a flexible, temporary workspace for session-specific information.

## Class MCPValidationService

This class helps keep track of and verify Model Context Protocols, or MCPs, which are like blueprints for how AI agents communicate. Think of it as a librarian for MCPs, making sure you have the right versions and that they’re correctly formatted.

It stores all your MCPs in an internal directory, organized by name.  You can use it to add new MCPs to your collection and to double-check that a specific MCP exists and is valid when you need it.  The `addMCP` method lets you register new MCPs, while `validate` confirms a particular MCP is available and ready to use. A logger is included to record what's happening during these operations.

## Class MCPUtils

This class, called MCPUtils, helps manage updates to tools used by different clients within a system that uses the Multi-Client Protocol. Essentially, it's designed to keep everyone's tools synchronized. You can use it to update tools for every client connected to the system, or you can target a single client for a specific update. It makes keeping multiple clients up-to-date much easier.

## Class MCPSchemaService

The MCPSchemaService is responsible for handling and organizing the blueprints, or schemas, that define how different AI agents communicate and share information. It allows you to register new schema definitions, update existing ones with new details, and easily retrieve them when needed. Think of it as a central library for all the agreed-upon structures used by your AI agents. The service relies on a logging system to keep track of its actions and works closely with a schema context service to manage the overall context around those schemas. It internally maintains a registry to store and access these schemas efficiently, keyed by the specific name of each schema.

## Class MCPPublicService

This class provides a way to interact with the Model Context Protocol (MCP) for managing AI agent tools. Think of it as a central hub for controlling which tools are available to different clients and executing them.

It handles tasks like listing the available tools for a particular client, updating the tool lists for all clients or just one, and checking if a specific tool is registered. The core functionality revolves around calling these tools with specific data, and also cleaning up resources when they’re no longer needed. It relies on injected services for logging and MCP connection management, making it flexible and adaptable to different environments.

## Class MCPConnectionService

This class manages connections and interactions with Model Context Protocols (MCPs), which are essentially the ways your AI agents communicate and use tools. Think of it as a central hub for agents to find and use their tools.

It relies on other services for logging, communication, and understanding the context of tool usage. The `getMCP` function is a smart shortcut – it remembers which MCPs it's already connected to, so it doesn't have to re-establish connections repeatedly.

You can use it to discover what tools are available to a particular agent, refresh the list of tools, check if an agent has access to a specific tool, and importantly, actually *call* a tool to get work done. Finally, it provides a way to clean up resources when an agent is no longer needed.

## Class LoggerService

The `LoggerService` is responsible for handling logging within the system, providing different levels of detail like normal, debug, and informational messages. It intelligently routes these logs to both a system-wide logger and a client-specific logger, ensuring you have visibility into what's happening at different levels.

The service uses information about the method being executed and the overall execution flow to add context to your logs, making it easier to track down issues. You can control whether different log levels (debug, info) are enabled through system-wide settings.

The `LoggerService` is flexible, allowing you to swap out the system-wide logger at runtime to customize how logs are handled, such as redirecting them to a file or console for testing or special configurations. It integrates with various parts of the system, including client agents, performance services, and documentation services, to provide comprehensive logging capabilities.

## Class LoggerInstance

This component handles logging messages specifically for a given client, allowing you to tailor how those messages are handled. You can customize its behavior by providing callback functions to perform actions when messages are logged, debugged, or when the logger is shut down. It integrates with a global configuration to control whether log messages appear in the console.

When you create a `LoggerInstance`, you provide a client identifier and optional callback functions. The `waitForInit` method ensures the logger is properly initialized, triggering any `onInit` callbacks. The `log`, `debug`, `info` methods all log messages, potentially to the console, and also trigger your custom callbacks. Finally, `dispose` cleans up the logger instance and executes a shutdown callback.

## Class HistoryPublicService

The `HistoryPublicService` acts as a gateway for managing an agent's history within the system. Think of it as the public-facing part of the history management process. It handles requests for adding messages, retrieving messages, converting history to usable formats, and cleaning up the history when needed. 

It works closely with other parts of the system – like the agent itself, the overall system messaging, performance tracking, and documentation – ensuring everything operates consistently.  The system logs activity related to the history if logging is enabled.

Here's a breakdown of what it lets you do:

*   **Add a Message:** You can push new messages to the agent's history.
*   **Retrieve a Message:** You can pull the most recent message from the agent's history.
*   **Convert History to Arrays:** You can get the agent's history formatted as arrays, either for specific agent processing or for raw data access.
*   **Clean Up History:** You can dispose of the agent's history to release resources.



These operations are carefully wrapped to ensure proper context and logging, contributing to the overall health and traceability of the system.

## Class HistoryPersistInstance

This component is responsible for keeping track of a conversation's history – think of it as a long-term memory for an AI agent. It stores messages both in memory for quick access and on disk for safekeeping. 

Each instance is uniquely identified by a client ID. It handles loading previous messages from storage when needed and saving new messages as they are created. 

You can use it to step through the conversation history one message at a time. New messages are automatically saved, and old ones can be removed. When you're done, you can clear the entire history. The system also lets you customize how the history is read and modified with specific callbacks.

## Class HistoryMemoryInstance

This component provides a way to keep track of a conversation's history entirely within the system's memory, without saving it to a file or database. It's designed for each agent to have its own dedicated history.

When you create a new history, you provide a unique identifier for the agent it belongs to, and can optionally configure callbacks for various actions like adding, removing, or reading messages. 

To get started, you'll initialize the history for a specific agent, and then you can easily add messages to the history. You can also retrieve the full conversation by iterating through the messages.  If you're finished with a history, you can dispose of it, which will clear all the stored messages, particularly useful when dealing with multiple agents.

## Class HistoryConnectionService

This service manages the history of interactions for each client and agent within the swarm system. Think of it as a central record-keeper for what's happening between a client and an agent.

It efficiently reuses history data by caching it, avoiding unnecessary creation and cleanup.  This caching is smart – it remembers history based on a unique combination of client and agent identifiers.

Here's a breakdown of what it does:

*   **Retrieves History:** It can fetch or create the history record for a specific client and agent.
*   **Adds Messages:** It allows you to add new messages (interactions) to an agent’s history.
*   **Removes Messages:** It lets you remove the most recent message from the history.
*   **Formats History:**  It can convert the history into a format suitable for the agent to use or for reporting purposes.
*   **Cleans Up:** It ensures that history resources are properly cleaned up when no longer needed, and it clears the cached history.

It works closely with other services to track usage, log activity, and coordinate events.  It's designed to be consistent with how history is handled in other parts of the swarm system.

## Class ExecutionValidationService

The ExecutionValidationService helps manage and track how many times an action is being executed within a particular system. It keeps a record of execution IDs, preventing runaway or excessively nested processes. 

You can retrieve the current execution count for a client and swarm using `getExecutionCount`. When an execution starts, `incrementCount` updates the count and checks to ensure it's not exceeding safe limits. When an execution finishes, `decrementCount` resets the count for that specific execution. 

If you need to completely clear the execution history for a client and swarm, `flushCount` will remove all tracked IDs, while `dispose` clears the memoized execution count. This service provides a way to monitor and control execution activity to maintain system stability.

## Class EmbeddingValidationService

This service keeps track of all the embedding names registered within the AI agent swarm, ensuring each one is unique and properly defined. It works closely with other services, like the one that manages embedding definitions and the one that handles storage and search. The service registers new embeddings and provides a way to confirm that an embedding name is valid before it’s used. To help with performance, validation checks are cached, and detailed logging is available to help troubleshoot any issues.

## Class EmbeddingSchemaService

The EmbeddingSchemaService manages how your AI agents define and use embedding logic – essentially, the math behind comparing and relating data. Think of it as a central library for these embedding rules. 

It keeps track of these rules, validating them to make sure they're structurally sound, and provides easy access for other parts of the system, like the storage and agent execution components. This service logs its actions to help with debugging and monitoring.

You can register new embedding rules, update existing ones, and retrieve them when needed. The system ensures these rules are consistent and reliable, crucial for tasks such as finding similar data items within your swarm.

## Class DocService

The `DocService` is responsible for automatically generating documentation for your AI agent swarm system. Think of it as a tool that creates easy-to-understand guides for your swarms, agents, and their performance.

It generates Markdown files describing your swarms (their structure, agents, policies), and agent schemas (tools, prompts), and also creates JSON files to record performance data. This documentation is organized in a clear directory structure.

The service uses a thread pool to handle documentation creation efficiently and relies on several other services (like `PerfService` and various schema validation services) to gather the necessary information.  It's designed to be flexible and extensible, allowing you to document complex systems with ease. The logging feature controlled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` lets you control the verbosity of the documentation process.  You can trigger complete documentation generation with `dumpDocs`, which handles swarms and agents. Finally, `dumpPerfomance` and `dumpClientPerfomance` help to create performance reports.

## Class ComputeValidationService

The ComputeValidationService helps manage and verify the structure and content of computations within your agent swarm orchestration. It's responsible for ensuring that each computation adheres to its defined schema.

Essentially, it provides a way to register different computation types (like data processing or analysis) along with their expected formats.  You can add new computation types, retrieve a list of registered types, and then validate a specific source against the schema for a chosen computation. The service relies on other components like a logger and state validation service to function effectively. 

Think of it as a quality control system for your computations, making sure everything is set up correctly before agents start working.

## Class ComputeUtils

This class, ComputeUtils, provides tools for managing and retrieving information about computational resources within the AI agent swarm. It essentially acts as a central point for interacting with these resources.

The `update` function lets you refresh the status of a specific compute resource, identified by its client ID and name, ensuring the system has the latest details.

The `getComputeData` function allows you to fetch data related to a compute resource. You can specify the type of data you expect to receive, making it flexible for different kinds of information like metrics or configuration settings.

## Class ComputeSchemaService

The ComputeSchemaService helps manage and organize different schema definitions used by your AI agents. It acts like a central hub where you can register, retrieve, and even update schema configurations. It relies on a schema context service to handle schema-related operations and uses a logger for tracking and debugging. Think of it as a way to keep all your agent's schema blueprints neatly organized and accessible. You can register new schema blueprints, easily grab existing ones when needed, or modify existing blueprints with new information.

## Class ComputePublicService

This class, `ComputePublicService`, provides a way to interact with compute resources, acting as a bridge between different parts of the system. It manages connections and handles requests related to compute tasks. 

The class relies on a logging service and a compute connection service to function. 

You can use `getComputeData` to retrieve information about a specific compute resource, providing its name, the client it belongs to, and the method to use.  The `calculate` method triggers a computation process, while `update` allows you to modify existing compute data. Finally, `dispose` cleans up resources associated with a compute task, ensuring proper shutdown.

## Class ComputeConnectionService

The `ComputeConnectionService` acts as a central hub for managing and interacting with AI agent computations within the system. It handles connections to compute resources and orchestrates the flow of data.

Inside, it utilizes various services like logging, messaging, schema management, and session validation to ensure smooth operations. It keeps track of available compute resources and provides methods to retrieve them by name and client ID. 

The `calculate` method triggers computation processes based on specified state names, while `update` synchronizes the system's data.  Finally, `dispose` provides a way to cleanly shut down and release associated resources when no longer needed.

## Class CompletionValidationService

This service helps keep track of all the valid completion names used within the swarm, ensuring that agents and the system are using approved names. It registers new completion names and then verifies if a name is valid when needed. 

The service is designed to work closely with other parts of the system, like the service that handles completion registration and the one that validates agent actions. It also keeps a record of all registered names for quick and efficient checking. Logging is used to monitor its operations, and it's built to be performant through caching.

## Class CompletionSchemaService

The CompletionSchemaService acts as a central place to manage and keep track of the logic (called "completions") that agents use to perform tasks. Think of it as a library where you store and retrieve these logic pieces, ensuring they're set up correctly before agents use them.

It works closely with other parts of the system, like the services that manage agent definitions and connections, ensuring everything is coordinated.  Whenever a new piece of logic is added or an existing one is updated, the system checks that it's properly formatted and functioning.

The service also keeps a record of everything that happens, allowing for monitoring and debugging. It uses a specialized registry to store and find these pieces of logic efficiently. You can register new logic, update existing logic, and easily retrieve it when needed.

## Class ClientSwarm

This class, `ClientSwarm`, is like a conductor for a team of AI agents working together. It manages these agents, handles their interactions, and keeps track of what each one is doing. Think of it as a central hub that ensures everyone is on the same page and working efficiently.

It lets you switch between agents, wait for them to finish tasks, and keeps a record of the order in which agents are used. The system is designed to be flexible and responsive, with automatic updates and notifications whenever something changes.

You can think of it as having several internal components: it uses a system for sending messages to those interested in what’s happening, a way to notify users when an agent changes, and a way to cancel ongoing tasks.  It also keeps track of whether the swarm is currently busy with a task.

The `waitForOutput` function lets you wait for a specific agent to finish its work, and `cancelOutput` lets you interrupt that process if needed. You can also retrieve the name and the actual agent instance at any point. Changing the active agent or navigating through the order of agents is also easily done. Finally, when you’re done, you can safely shut down the swarm and free up its resources.

## Class ClientStorage

This class is responsible for managing how data is stored and retrieved within the AI agent swarm. It uses a combination of fast in-memory storage and embedding-based search to efficiently handle large amounts of data.

When you create a `ClientStorage` instance, it sets up a system for storing items, creating their embedding representations for similarity search, and ensuring operations are processed in a controlled order. Think of it as a central data repository for your agents.

Key features include:

*   **Fast Data Access:** It keeps a quick-access map of stored items for fast retrieval.
*   **Similarity Search:** It allows you to find items similar to a given search query by using embeddings.
*   **Controlled Updates:** All data changes (adding, removing, clearing) happen in a queue, making sure things happen in the right order.
*   **Event Notifications:** It sends out notifications when data changes, allowing other parts of the system to react accordingly.

You can add new items, remove existing ones, clear everything out, or perform searches to find related data. The system handles the complexities of managing embeddings and coordinating operations to keep everything running smoothly. When finished, you can properly clean up the storage.

## Class ClientState

The ClientState class is the central hub for managing a single piece of data within the larger swarm system. Think of it as a container holding the current state and handling all changes to it. It makes sure that updates and reads to this data happen in a controlled and safe way, even if multiple parts of the system are trying to access it at the same time.

When you create a ClientState, it connects to other services to get things set up initially. As the system works, different components might need to read or modify the data held by this ClientState. The ClientState ensures that these changes are tracked, handled correctly, and communicated to the rest of the swarm. 

It provides a way to wait for the state to be ready, methods to update it, and a way to reset it to its default settings.  When you're done with a ClientState, it also has a way to clean up and release any resources it was using. Essentially, it’s designed to keep everything organized and consistent when dealing with the state of an agent in the swarm.

## Class ClientSession

The `ClientSession` manages interactions with an AI agent swarm for a single client. Think of it as a dedicated workspace for a client's conversations and tasks within the larger swarm system.

It handles sending messages to the swarm for processing, receiving notifications, and ensuring that all interactions follow defined policies.  It keeps track of the entire conversation history for each client, allowing for context and continuity.

Here's a breakdown of what it can do:

*   **Sending Messages:** You can use it to send messages to the swarm for execution, or even just log actions without expecting a response.
*   **Policy Enforcement:** It ensures that all messages adhere to security and usage rules before they are sent.
*   **History Tracking:**  It records all messages, tools used, and actions taken during a session.
*   **Notifications:**  It allows for real-time updates and notifications to be sent to the client.
*   **Connecting and Disconnecting:** It manages the lifecycle of a session, connecting and disconnecting as needed.



Essentially, the `ClientSession` is the central point for a client's interactions with the AI agent swarm, ensuring a secure, consistent, and trackable experience.

## Class ClientPolicy

The `ClientPolicy` class manages security and restrictions for clients interacting with the swarm. It’s like a gatekeeper, controlling who can participate and what they can do.

It keeps track of banned clients, either immediately or by fetching the list when needed. This list can be updated and saved if configured to do so.

The class provides methods to:

*   Check if a client is banned for a specific swarm.
*   Get a customized message explaining why a client is banned.
*   Validate incoming messages from clients, automatically banning them if necessary.
*   Validate outgoing messages to clients, ensuring they meet policy requirements and potentially banning the client if not.
*   Manually ban a client.
*   Unban a client.

These methods work together to enforce rules and keep the swarm secure, and automatically report changes through notifications. The `ClientPolicy` integrates with other parts of the system to handle validation, access control, and communication.

## Class ClientOperator

The ClientOperator is a component responsible for interacting with and orchestrating a group of AI agents. It's designed to receive instructions and manage the flow of information between agents.

Think of it as a central hub that takes requests, guides the agents' actions, and collects their responses. 

Currently, many of its functions are marked as "not supported," indicating that they are placeholders for future functionality. 

You can send messages to the agents using `commitUserMessage`, and the system can acknowledge these actions using the `commitAgentChange`. The `execute` method allows you to trigger actions with specific modes, and `waitForOutput` will pause until a response is received. Finally, `dispose` cleans up resources when the operator is no longer needed.

## Class ClientMCP

This component, called ClientMCP, helps manage tools and their usage for different clients within your AI agent system. Think of it as a central hub that knows which tools are available to which agents and handles requests to run them.

It keeps track of tools and their configurations, so you don't have to constantly retrieve them. The system caches these tools for efficiency, but it also provides a way to refresh the list when needed.

You can use it to find out what tools a client has access to, check if a specific tool is available, or actually trigger a tool to run with specific instructions. When a client is no longer needed, you can tell the system to release its resources and clean up any associated data.

## Class ClientHistory

The ClientHistory class manages an agent’s conversation history within the swarm system. It stores messages, allowing for retrieval and filtering based on agent-specific requirements defined in the global configuration. When a new message is received, it’s added to the history and a notification is sent out. The class can also retrieve the most recent message, and provides methods to get the complete history or a filtered version optimized for the agent's use in generating responses. Finally, when an agent is no longer needed, this class cleans up any resources it's using.

## Class ClientCompute

The `ClientCompute` class helps you interact with a compute resource within the agent swarm orchestration framework. It's designed to manage and execute computations, essentially acting as a client to a specific compute instance.

When you create a `ClientCompute` object, you provide initial parameters that define how it connects to and interacts with the compute resource.

The `getComputeData` method allows you to retrieve data from the compute resource.  The `calculate` method triggers a calculation process on the compute resource, which you can specify using a `StateName`.  The `update` method refreshes the compute resource’s state. Finally, `dispose` cleans up resources associated with the client and disconnects it from the compute.

## Class ClientAgent

The `ClientAgent` is the heart of the AI agent swarm, handling incoming messages and orchestrating tool calls. Think of it as a worker bee within a larger hive. It receives instructions, decides which tools to use, and manages the whole process, carefully avoiding conflicts.

This agent relies on several supporting services to manage connections, histories, tools, and events. It uses a system of “subjects” to track changes like tool errors or agent updates, allowing for flexible and asynchronous behavior.

Here's a breakdown of what it does:

*   **Receives and processes messages:** It takes incoming text, decides which tools (if any) to use, and manages the workflow, making sure things don’t overlap.
*   **Manages tools:** It resolves available tools, ensuring there are no duplicates.
*   **Handles errors:** If something goes wrong, it tries to recover—it might retry, flush the history, or generate a placeholder response.
*   **Keeps track of changes:** It broadcasts updates and can halt tool executions when needed.
*   **Provides external access:** Other components (like the swarm) can wait for the agent’s output and interact with its progress.
*   **Supports cleanup:** When the agent is finished, it cleans up resources to ensure a clean shutdown.

Essentially, the `ClientAgent` is responsible for safely and reliably executing tasks within the agent swarm, acting as a robust and adaptable worker.

## Class ChatUtils

This component helps manage chat sessions for different clients participating in a swarm of AI agents. It acts as a central hub for starting, sending messages within, and ending these chat sessions. 

You can think of it as a controller that creates and maintains individual chat instances, allowing your agents to communicate with each other in a structured way. The framework lets you specify how those chat instances are created and what actions are triggered during their lifecycle.

You can customize the type of chat instance used and define specific callback functions that get executed at various points in the chat process. The framework handles the behind-the-scenes creation, message routing, and cleanup of these chat instances, allowing you to focus on the logic of your agent swarm. 

It provides methods to begin a chat, send messages, and gracefully end a chat session for each client. You can also register to be notified when a chat session is being disposed.

## Class ChatInstance

This class manages a single chat session within a larger swarm of AI agents. Think of it as a dedicated space for one conversation. 

When a chat instance is created, it's given a unique identifier and associated with a specific swarm. The instance keeps track of when it was last active, and it provides methods to start a conversation, send messages, and ultimately, clean up when it's no longer needed. 

You can register to be notified when a chat instance is being shut down, ensuring that any related resources are properly handled. The `checkLastActivity` method is used internally to determine if the chat session should be closed due to inactivity.

## Class BusService

This class manages how different parts of the system communicate using events. Think of it as a central hub for sending and receiving updates.

It allows different services, like those handling client execution or performance tracking, to subscribe to specific types of events and get notified when they happen. You can also send events to everyone or just to a single client.

The system keeps track of who's subscribed to what, and makes sure events are only sent to valid clients. It's designed to be efficient by reusing resources and providing convenient shortcuts for common events like marking the start or end of an execution. It also logs actions for monitoring and debugging. If you need to stop a client from receiving any more updates, you can easily unsubscribe them using the `dispose` method.

## Class AliveService

The `AliveService` class is responsible for keeping track of whether your clients are currently active within a swarm. It allows you to easily signal when a client becomes online or offline, which is crucial for coordinating tasks and ensuring efficient operation. 

Behind the scenes, it logs these status changes and uses a persistent storage mechanism to remember the online/offline state even if the system restarts. You can think of it as a heartbeat monitor for your agents, allowing the swarm to react appropriately based on their availability. It utilizes a `loggerService` for logging actions and a `PersistAliveAdapter` for persistent storage based on the global configuration settings.


## Class AgentValidationService

This service acts as a central point for ensuring the configurations of agents within your swarm are correct and consistent. It handles registering new agents, verifying their settings, and providing access to related resources like storage and dependencies.

It relies on other specialized services for tasks like schema validation, tool checks, and storage verification, working together to guarantee the overall health of your agent ecosystem.  It keeps track of registered agents and their dependencies for easy access and efficient validation.

Here's a breakdown of what it does:

*   **Agent Registration:** Allows you to register agents, including their schemas and dependencies.
*   **Resource Access:** Provides ways to retrieve lists of resources associated with agents, such as their storage and state configurations.
*   **Validation:** It checks that agents are set up correctly, leveraging other services to perform specific validation tasks.
*   **Dependency Management:** Tracks dependencies between agents to make sure they're compatible.
*   **Performance Optimization:** Uses caching to speed up common validation checks.



Essentially, this service is your quality control system for your AI agent swarm, making sure everything is working as expected and integrated properly.

## Class AgentSchemaService

The AgentSchemaService acts as a central place to manage the blueprints for your AI agents within the system. Think of it as a library holding the definitions of what each agent *is* – what tools it uses, what states it can be in, and how it should behave.

It keeps track of these agent blueprints (called schemas) using a special registry, making it easy to find and use them. Before adding a new blueprint, it performs a quick check to make sure it's structurally sound.

This service works closely with other parts of the system, like the agent creation process, the swarm configuration, and even the client agents themselves, providing them with the necessary information to function correctly.  You can log actions like registering, retrieving, or updating schemas to help with troubleshooting and monitoring.

Essentially, it ensures that all agents are built according to a consistent and validated set of instructions, leading to a more reliable and predictable swarm. You can update existing blueprints too, allowing for dynamic changes to agent behavior.

## Class AgentPublicService

This class provides a public interface for interacting with agents within the system, essentially acting as a middleman between external requests and the underlying agent operations. It handles tasks like creating agents, executing commands, running stateless processes, and managing agent history (like logging user messages, tool outputs, and system prompts).

Think of it as a layer of abstraction that ensures consistency in how agents are managed – it wraps lower-level functions with added context and logging, making sure everything is tracked and scoped correctly. Operations like running commands or logging messages are handled through this class, ensuring proper context and potential logging for debugging or monitoring.  It’s also designed to work closely with other services, such as those responsible for performance tracking, documentation, and event handling. This makes it a central point for controlling and observing agent behavior within the swarm.

## Class AgentMetaService

This service helps manage information about your AI agents and translate that information into visual diagrams. Think of it as a translator that takes the technical details of your agents – their dependencies, states, and tools – and turns them into easy-to-understand UML diagrams.

It builds a structured representation of each agent, either a complete view or a simplified one focusing on how agents relate to each other. This helps with understanding how your AI agents work together and how they depend on one another.

The service leverages other parts of the system for logging and retrieving agent data, ensuring consistency and facilitating debugging. Ultimately, it's used to generate visuals that improve documentation and provide a clearer picture of your AI agent swarm.

## Class AgentConnectionService

This service manages connections to AI agents, acting as a central hub for creating, running, and tracking their activity within the swarm system. It efficiently reuses agent instances by caching them, and integrates with various other services to handle tasks like logging, event emission, configuration, and usage tracking. Think of it as a smart conductor, orchestrating the agents and ensuring they operate smoothly and efficiently.

It provides ways to:

*   **Get an Agent:**  Retrieves or creates an agent based on a client and agent name, reusing existing instances for efficiency.
*   **Run Commands:** Executes commands on an agent, providing different modes of execution.
*   **Handle Output:**  Waits for and commits various types of messages – tool outputs, system messages, user input – to the agent's history.
*   **Control Flow:** Provides methods to prevent tool execution, reset the agent state, and manage the overall agent lifecycle.
*   **Clean Up:** Properly disposes of agent connections and resources when they're no longer needed.

Essentially, this service simplifies working with agents by providing a consistent and controlled interface.

## Class AdapterUtils

This class provides helpful tools to connect your AI agent swarm to different AI services. It offers pre-built functions that simplify the process of talking to popular AI completion providers like Cortex, Grok, Cohere, OpenAI, LMStudio, and Ollama. Each function essentially wraps the specific API calls for these services, allowing you to use a consistent interface regardless of which AI model you're using. You can easily create these connection functions by providing the necessary configuration details for each service.

# agent-swarm-kit interfaces

## Interface TAbortSignal

This interface provides a way to signal and manage the cancellation of ongoing tasks, building on the standard `AbortSignal` that JavaScript already uses. Think of it as a tool for telling a running process to stop, ensuring it doesn't continue unnecessarily. It’s designed to be flexible, so you can add your own unique features or data to it if your application needs something beyond the basics.

## Interface IWikiSchema

This interface, `IWikiSchema`, defines the structure for how our AI agents interact with a wiki knowledge base. Think of it as a blueprint for connecting to and querying a wiki. It includes essential information like the wiki's name and an optional description. You can also provide custom functions, called callbacks, to handle specific wiki operations. 

The `getChat` method is a key function allowing agents to ask questions to the wiki and receive text-based responses, enabling them to access and utilize the knowledge contained within.

## Interface IWikiCallbacks

This interface defines optional functions you can use to get notified about certain events happening within the system. Specifically, the `onChat` function lets you react whenever a chat interaction takes place. You can think of it as a way to listen in on conversations and potentially respond to them programmatically. If you're building a custom extension or want to monitor chat activity, implementing this interface allows you to do just that.

## Interface ITriageNavigationParams

This interface defines the information needed to set up how an AI agent navigates through different tasks. It lets you specify the name of a tool, which is essentially a specialized function the agent can use. You also provide a description to explain what the tool does, and optionally add a note for documentation purposes. Think of it as creating a new step in the agent’s workflow, giving it a clear purpose and a way to execute it.

## Interface IToolRequest

This interface describes what's needed to tell the system to run a specific tool. Think of it as a request form – it tells the system *which* tool to use and *what* information to give it. 

It has two main parts: the tool’s name, which needs to be a tool already registered in the system, and then a set of parameters, which are the specific inputs that tool needs to do its job. The parameters you provide will need to match what the tool expects, so it can work correctly.

## Interface IToolCall

This interface describes a request to use a specific tool within the system. Think of it as a structured way for the AI model to ask the framework to run a tool, like making an API call or running a Python script.

Each tool call has a unique identifier, so the system can track it and link the results back to the original request. Currently, these requests are always for "function" tools, which means they’re calls to defined functions with specific arguments.

The `function` property within the call specifies exactly which function needs to be executed and what information it needs to do so, allowing the system to understand and act upon the model's request.

## Interface ITool

This interface describes what a tool looks like within the agent swarm system. Think of it as a blueprint that tells the AI agents what functions are available to them. It defines the tool's type, which is currently just "function," and details about the function itself – its name, what it does, and what inputs it expects. This information is how the AI understands what actions it can take and how to use them correctly.

## Interface ISwarmSessionCallbacks

This interface lets you listen for important events happening within your AI agent swarm. You can use it to track when agents join the swarm, when commands are run, when messages are shared, and when sessions begin or end. Each callback function provides details like the agent's ID, the swarm’s name, and relevant data associated with the event, enabling you to build custom monitoring, logging, or initialization logic. Think of these callbacks as a way to be notified and react to what’s happening inside the swarm in real time.

## Interface ISwarmSchema

This interface defines the blueprint for how a swarm of AI agents is structured and behaves. It lets you configure things like whether the swarm saves its progress, provides a helpful description for users, and defines access control rules.

You can specify a default agent to use, list the agents available within the swarm, and give the swarm a unique name. It also allows for customizing how the swarm manages its navigation history and keeps track of the currently active agent, and how it handles events through optional callback functions. This framework provides a way to control and understand how your AI agents work together.

## Interface ISwarmParams

This interface defines the essential settings needed to kick off an AI agent swarm. It specifies things like a unique client identifier, a logger to track what's happening, and a communication bus for the agents to talk to each other. 

You’ll also provide a map that tells the swarm exactly which agents are participating and how to access them during operation. Think of it as a roster of the agents that will be working together.

## Interface ISwarmDI

This interface acts as a central hub, providing access to all the core services that power the AI agent swarm orchestration framework. Think of it as the toolbox containing everything needed to manage and interact with the system.

It organizes and provides access to services for tasks like documentation generation, event handling, performance monitoring, agent connections, state management, validation of data, and more. Each property represents a specific service within the swarm, offering functionality like agent lifecycle management, persistent storage, and rule enforcement. Essentially, this interface simplifies access to all the components working together to orchestrate the agent swarm.

## Interface ISwarmConnectionService

This interface defines how different agents within a swarm connect and communicate with each other. It's designed to be a blueprint for publicly accessible connection services, ensuring that only the necessary communication methods are exposed. Think of it as a contract outlining how agents can reliably talk to one another within the swarm, hiding the complex inner workings. It helps keep the public-facing parts of the swarm’s connection system clean and organized.

## Interface ISwarmCallbacks

This interface lets you listen in on important events happening within your AI agent swarm. Specifically, you can use it to be notified whenever an agent’s role or active participation changes. The `onAgentChanged` callback will tell you the unique identifier of the agent, its name, and the name of the swarm it belongs to, allowing you to update your system or track agent activity as needed.

## Interface ISwarm

This interface gives you a way to interact with a group of AI agents working together. It lets you control which agent is currently active, get the agent's name or a reference to its object, and send messages to the agents. You can also use it to wait for the agents to produce a result, cancel an ongoing process, or check if the swarm is currently busy with a task. Essentially, it provides the core tools to manage and communicate with your AI agent swarm.

## Interface IStorageSchema

This interface defines how storage for the AI agent swarm will work. It lets you configure things like whether data is saved permanently, how to access and modify the data, and how it's indexed for searching. 

You can specify a descriptive name for the storage, and choose whether the storage is accessible by all agents within a client’s environment.  The `createIndex` function is used to build a search index for each item stored, making it easier to find data later.  You also have the option to customize how data is retrieved and saved, and to define functions for providing default data. Finally, you can set up event callbacks to further tailor the storage's behavior.

## Interface IStorageParams

This interface defines how your AI agents can interact with the system's storage. It acts as a set of tools for handling and managing embeddings – those numerical representations of text used for searching and comparison. 

Essentially, it lets agents save computed embeddings to a cache so they don't have to do the work twice, retrieve them when needed, and create new embeddings on demand.  You'll also find properties for things like logging, event communication, and identifying the specific storage being used within the overall system. It links the agent's embedding work with the larger storage infrastructure.

## Interface IStorageData

This interface describes the basic information held within the storage system. Every item stored will have a unique identifier, called `id`, which is essential for finding and deleting it later. Think of it like a primary key for each piece of data you’re keeping track of.

## Interface IStorageConnectionService

This interface helps us clearly define how different parts of the system interact with storage connections. It's a blueprint for creating storage connection services, specifically designed to make sure the public-facing parts only expose the necessary functionality. Think of it as a way to build a reliable and well-defined system for managing storage. It's used internally to ensure consistency and prevent exposing sensitive details.

## Interface IStorageCallbacks

This interface defines functions that your storage system can use to notify your agent swarm orchestration framework about important events. You can use these callbacks to keep track of changes to your data, see when searches are happening, and know when a storage area is being set up or taken down. Think of them as notification hooks – you provide the functions, and the storage system calls them when specific actions occur, allowing you to react to what’s happening with your data. This lets you log activity, synchronize states, or handle any cleanup tasks needed during initialization or disposal.

## Interface IStorage

The `IStorage` interface lets your AI agents easily manage and access information. Think of it as a central place to store and retrieve data the agents use. 

You can pull data using a search query with `take`, letting agents find what they need based on similarity.  `upsert` handles adding new data or updating existing entries, keeping everything current.  If you need to remove something, `remove` lets you delete items by their unique ID. 

Retrieving specific data is simple with `get`, and `list` allows you to view all data or a filtered subset. Finally, `clear` gives you the option to completely erase all stored information and start fresh.

## Interface IStateSchema

This interface describes how a piece of information – we call it a "state" – is managed within the system. It outlines the configuration options available for each state.

You can choose whether the state data should be saved persistently, like to a file. A short description can be added to explain the state's purpose. It's possible to make a state accessible to multiple agents within the swarm, allowing for shared information.

Every state needs a unique name. A function can be provided to generate the initial value of the state, or to retrieve the currently stored value, potentially falling back to the initial value if needed. Similarly, you can define a function to handle setting or updating the state’s value.

Middleware functions can be chained to modify the state during its lifecycle, and optional callbacks allow you to react to specific events related to the state.

## Interface IStateParams

This interface defines the information needed to manage the state of an agent within the swarm. Think of it as a container holding key details about the agent's context. 

It includes a unique identifier for the client using the agent, a logger for recording what's happening, and a communication channel (the bus) to allow the agent to interact with the rest of the swarm. Essentially, it's the agent's passport and communication tools for operating within the larger AI system.

## Interface IStateMiddleware

This interface defines a way to hook into how the AI agent swarm manages its internal state. Think of it as a place where you can step in and either tweak the state before it's used or make sure it's in a valid format. It allows you to customize the state lifecycle, ensuring things are set up exactly as needed for your specific AI agent setup.

## Interface IStateConnectionService

This interface helps us define how different parts of the system connect and share information about the current state. Think of it as a blueprint for building those connections, ensuring everyone uses a consistent approach. It's designed to be a clean, public-facing view of the state connection service, hiding the technical details underneath. By using this interface, we make sure the ways agents interact and understand the system's status remain clear and predictable.

## Interface IStateChangeContract

This interface, `IStateChangeContract`, defines how the system signals when the state of an agent or the overall swarm changes. Specifically, it includes a property called `stateChanged`, which provides a way to observe changes to a string representing the new state. Think of it as a notification channel - whenever the system's state updates, you can subscribe to `stateChanged` to receive that update. It allows components to react dynamically to changes happening within the AI agent swarm orchestration framework.

## Interface IStateCallbacks

This interface lets you listen in on what's happening with a specific piece of data managed by the system. You can get notified when the data is first set up, when it’s cleaned up, when it’s first loaded or created, and whenever it's read or updated. These notifications allow you to perform actions like logging, monitoring, or triggering other processes in response to these events. Each notification includes information about which client is using the data and the name of the data itself.

## Interface IState

This interface helps you manage the data your AI agents are sharing and using. Think of it as a central place to store and update information across your swarm.

You can use `getState` to see the current data being used.  `setState` lets you update that data, but in a controlled way—you provide a function that knows how to calculate the new data based on what’s already there. Finally, `clearState` allows you to reset everything back to the starting point defined in your configuration.

## Interface ISharedStorageConnectionService

This interface outlines how different parts of the system will connect to a shared storage space. Think of it as a blueprint for reliable connections – it guarantees everyone uses the same methods for accessing and managing shared data. It’s designed to specifically define what’s accessible publicly, hiding the internal workings of how those connections are actually made. This helps keep the system organized and prevents unintended changes to how data is handled.

## Interface ISharedStateConnectionService

This interface helps define how different parts of the system share information, specifically when dealing with agents working together. Think of it as a blueprint for how agents can exchange data and coordinate their actions. It’s designed to be a clear and controlled way to manage this shared state, making sure that only the necessary parts are exposed and avoiding internal complexities. By using this interface, we ensure that the public-facing services are consistent and well-defined.

## Interface ISharedComputeConnectionService

This interface defines how your AI agent swarm connects to and utilizes shared computing resources. Think of it as the bridge between your agents and the machines they need to run their tasks. It provides methods for establishing connections, ensuring resources are available, and cleanly disconnecting when done. Developers use this to abstract away the specifics of how the swarm gets its processing power, whether that's cloud servers, local machines, or something else entirely. It's all about giving your agents the compute they need, when they need it, without getting bogged down in the technical details of the infrastructure.

## Interface ISessionSchema

This interface, called ISessionSchema, is essentially a blueprint for how session data will be structured in the future. Right now, it doesn’t contain any specific information, but it’s designed to hold details about session configurations as the framework develops. Think of it as a reserved space to define what a session "looks like" when more session-related features are added.

## Interface ISessionParams

This interface describes what's needed to set up a new session within your AI agent swarm orchestration framework. Think of it as the blueprint for starting a conversation or project involving your agents. 

It bundles together essential pieces of information, including a unique identifier for the client initiating the session, a logging system to track what's happening, rules and constraints that guide the session, a communication channel for agents to talk to each other, and the overall swarm managing the session. You’ll also need to specify the name of the swarm the session is part of.

## Interface ISessionContext

The `ISessionContext` interface holds all the important details about a client’s active session within the agent swarm. Think of it as a container for session information. It includes the unique identifier for the client (`clientId`), a process ID (`processId`), and potentially information about the method currently being executed (`methodContext`).  You'll also find details about the overall execution environment (`executionContext`) associated with the session. It’s designed to give you a complete picture of what’s happening during a client's interaction with the swarm.

## Interface ISessionConnectionService

This interface acts as a blueprint for how services that manage connections to AI agents should behave. It's designed specifically to create a version of a connection service that's suitable for external use, removing any internal details that aren’t part of the public-facing functionality. Think of it as a simplified, clean version of a connection service, guaranteeing consistency in how connections are handled from the outside.

## Interface ISessionConfig

This interface, `ISessionConfig`, lets you control how frequently or when your AI agents run. It's all about setting up a rhythm for your swarm. You can use the `delay` property to specify a waiting period between sessions, allowing you to pace the agent activity.  The `onDispose` property lets you define a function that will be executed when the session is finished or cancelled, allowing for clean-up or final actions.

## Interface ISession

The `ISession` interface manages interactions within an AI agent swarm. It provides ways to send messages, trigger actions, and control the flow of a conversation.

You can add user input to the session's record with `commitUserMessage`, or clear the entire conversation history with `commitFlush`.  `commitStopTools` provides a way to pause the execution of automated tasks within the session.

The `notify` method sends messages to interested listeners, while `emit` simply sends a message through the session's communication channel. `run` allows for quick, isolated computations without altering the session's memory. `execute` is the primary method for processing commands within the session, influencing its state.

`connect` establishes a two-way communication link, letting you send and receive messages.  Specific actions like adding tool output or requests, adding assistant or system messages, are handled by dedicated commit methods that update the session’s history.

## Interface IScopeOptions

This interface, IScopeOptions, helps you configure the environment where your AI agents work together. Think of it as setting up the basic rules of the game. You're required to provide a unique client ID to identify your application and a name for the swarm of agents you’re managing. It also allows you to define a function that gets called whenever an error occurs, giving you a way to handle unexpected issues gracefully.

## Interface ISchemaContext

This interface, `ISchemaContext`, is like a central hub for all the different blueprints used to define your AI agents and their tools. Think of it as a library containing various schema services. Each service within this context manages a specific type of schema, such as blueprints for agents themselves or the tools they use for tasks like code generation or summarization. The `registry` property holds all these schema services, making them easily accessible and organized for your orchestration framework. It's the place where the system knows what kinds of agents and tools are available to work with.

## Interface IPolicySchema

This interface defines the structure for configuring policies within the AI agent swarm. Think of it as a blueprint for how the swarm will enforce rules and handle blocked connections.

You can use it to control things like whether banned clients are saved persistently, add descriptions for clarity, and give each policy a unique name. 

The interface allows you to customize how bans are handled by providing functions to generate custom ban messages, manage lists of banned clients, and even create your own validation logic for incoming and outgoing messages. You can also use callbacks to react to specific events during validation or banning.

## Interface IPolicyParams

This interface defines the necessary settings for creating a policy within the AI agent orchestration framework. Think of it as the blueprint for how a policy will behave and interact with the system. 

It includes essential components like a logger, which allows the policy to record what it’s doing and any problems it encounters, and a bus for communication with other parts of the agent swarm. These components enable the policy to function properly and integrate seamlessly within the broader system.

## Interface IPolicyConnectionService

This interface helps us define a consistent way to interact with services that manage connections based on policies. Think of it as a blueprint that outlines the key actions and data you can expect when working with these connections. It’s designed to be a clean, public-facing definition, leaving out any implementation details that aren’t directly relevant to users of the system. This ensures a clear and predictable experience when working with policy-driven connections.

## Interface IPolicyCallbacks

This interface provides a way to get notified about important events happening within a policy, like when it's first set up, when it's checking incoming or outgoing messages, or when a client is blocked or allowed. You can use these notifications to do things like record what's happening, keep track of input and output, or automatically take actions when a client is banned or unbanned. Each callback function gives you details about the policy involved, the client in question, and the swarm the policy belongs to.

## Interface IPolicy

This interface defines how policies are enforced within the agent swarm. It handles client bans and ensures messages flowing in and out adhere to defined rules. 

You can use it to check if a client is banned, retrieve the reason for a ban, and validate both incoming and outgoing messages. 

The interface also provides functions to ban and unban clients, allowing you to actively manage which clients are allowed to participate in the swarm.

## Interface IPipelineSchema

This interface defines the structure for a pipeline within our AI agent swarm orchestration framework. Each pipeline has a descriptive `pipelineName` so you can easily identify its purpose. 

The crucial part is the `execute` function; this is how you trigger the pipeline’s actions, specifying a client ID, the agent to invoke, and the data it should work with.  The pipeline can either complete without a return value, or it can return data of a specified type.

Finally, `callbacks` allow you to hook into different stages of the pipeline's execution to respond to events and track progress – it’s a flexible way to customize the pipeline’s behavior.

## Interface IPipelineCallbacks

This interface defines a set of optional callbacks you can use to monitor the progress of your AI agent pipelines. Think of them as hooks that let you react to key events in a pipeline's lifecycle. 

You can provide an `onStart` function to be notified when a pipeline begins, receiving the client ID, pipeline name, and initial data.  Similarly, `onEnd` lets you know when a pipeline completes, including whether it finished successfully or encountered an error, along with all the relevant data. Finally, the `onError` callback is triggered if something goes wrong during a pipeline's execution, giving you details about the error and associated data. These callbacks offer a way to track your pipelines and implement custom logic based on their status.

## Interface IPersistSwarmControl

This interface lets you tailor how your AI agent swarm's data is saved and loaded. Think of it as a way to plug in your own custom storage solutions instead of relying on a built-in one.

You can use it to define how the active agents within a swarm are persisted – perhaps you want to store them in a specific database or an in-memory cache. 

Similarly, you can customize how the navigation stacks, which guide the agents, are saved and restored. This offers flexibility to match your application's needs, whether that's using a file system, a cloud service, or something else entirely.

## Interface IPersistStorageData

This interface outlines how data is saved and loaded within the agent swarm. Think of it as a container holding a collection of information – like a list of key-value pairs – that needs to be reliably stored and retrieved. It's used by the system's tools for handling persistent storage, ensuring that important data isn't lost. The 'data' property holds the actual information being saved.

## Interface IPersistStorageControl

This interface lets you tailor how your AI agent swarm's data is saved and retrieved. It provides a way to swap out the default storage mechanism with your own custom solution. 

Essentially, you can inject a specific storage adapter – like connecting to a database instead of a file – to manage the data associated with a particular storage area. This allows for greater flexibility and control over data persistence.

## Interface IPersistStateData

This interface outlines how data can be saved and retrieved for components within the swarm. Think of it as a standardized way to package up any kind of information—like how an agent is set up or the status of a session—so it can be stored reliably.  It’s used to make sure that important information isn't lost, even if the system needs to be restarted or components need to be recreated.  The core of this is the `state` property, which simply holds the actual data you want to preserve.

## Interface IPersistStateControl

This interface lets you fine-tune how your AI agents' states are saved and loaded. If the built-in state saving isn't quite what you need, you can plug in your own custom saving mechanism. Specifically, the `usePersistStateAdapter` method allows you to provide a custom class that handles the actual persistence logic, offering flexibility for things like storing agent data in a database instead of a simple file. It's a way to tailor the persistence behavior to your specific application requirements.

## Interface IPersistPolicyData

This interface describes how policy information, specifically lists of banned client sessions, is saved and retrieved within the AI agent swarm. It acts as a blueprint for storing data related to which clients are currently blocked from participating in a particular swarm.  The core of this data is a simple list of session IDs, representing the clients that have been restricted. This allows the system to remember and enforce these bans across restarts or system updates.

## Interface IPersistPolicyControl

This interface lets you tailor how policy data is saved and retrieved for your AI agent swarms. You can essentially plug in your own system for managing this data, allowing you to store it wherever you need, like a database or even just in memory. This is particularly useful when you want to move beyond the default storage mechanism and need a more customized approach for a specific swarm. By providing a custom adapter, you gain fine-grained control over the persistence of policy information.

## Interface IPersistNavigationStackData

This interface describes how information about the order of agents you're working with is saved. Think of it as a history log of which agents were active during a session. It's used to remember the sequence of agents you've navigated through, allowing you to potentially return to previous agents easily. The core of this information is a list of agent names – strings that identify each agent in your swarm system.

## Interface IPersistMemoryData

This interface helps manage how your AI agents’ memory is saved and retrieved. It’s a way to package up any kind of data – like session information or temporary results – that your agents need to remember. Think of it as a container holding the specific information your agents need to keep track of across different interactions. The `data` property within this container holds the actual memory content, which can be any type of data your application requires.

## Interface IPersistMemoryControl

This interface lets you tailor how memory is saved and retrieved for your AI agents. It provides a way to swap out the standard memory persistence system with your own custom solution. 

Essentially, you can use this to control where and how the agents' memories are stored – perhaps using a database, a file system, or even keeping them entirely in memory. This is particularly useful if you need to handle memory in a unique way for a specific session. You inject a custom adapter to manage this persistence.

## Interface IPersistEmbeddingData

This interface describes how the swarm system saves embedding data. It's used to store numerical representations (embeddings) of text strings, identified by a unique hash. The core of this interface is the `embeddings` property, which holds the actual numbers that make up the embedding vector. Think of it as a way to remember what a particular piece of text "means" in a numerical format, so the swarm can use it later.

## Interface IPersistEmbeddingControl

This interface lets you tailor how embedding data is stored and retrieved. If you need more control over where and how embeddings are saved, you can provide your own storage mechanism. It’s designed to allow you to swap in custom solutions, like using an in-memory store instead of a database, for specific embedding names. This provides flexibility to adapt the system to your unique storage requirements.

## Interface IPersistBase

This interface is the foundation for saving and loading information within the AI agent swarm. It lets the system reliably store data like agent states or memory to files.

Before you start using the system, `waitForInit` sets up the storage area, creating it if it doesn't exist and cleaning up any messed-up files.

`readValue` retrieves a specific piece of data based on its unique ID, pulling it from a JSON file.  `hasValue` quickly checks if a piece of data even exists without actually loading it. Finally, `writeValue` saves a piece of data to the storage, making sure it's saved safely and correctly.

## Interface IPersistAliveData

This interface helps the system keep track of which clients are currently active. It's all about knowing if a particular client, identified by its session ID, is online or offline within a specific swarm. The key piece of information it holds is a simple `online` flag – a `true` value means the client is online, while `false` means it's offline.

## Interface IPersistAliveControl

This interface lets you fine-tune how the system remembers whether your AI agents are still active. 

You can swap out the standard way the system tracks alive status with your own custom implementation. 

This is useful if you need to store the alive status somewhere specific, like in a database or a temporary memory store, rather than relying on the system’s default approach. Essentially, it provides a way to tailor the persistence of agent activity to your particular requirements.

## Interface IPersistActiveAgentData

This interface describes how we keep track of which agent is currently running for each client participating in a swarm. It’s like a little record that lets us know, “Hey, for this particular client and swarm, ‘agent1’ is the one handling things right now.”  The key piece of information here is the `agentName`, which simply identifies the agent – think of it as a unique nickname for that agent within the system. This information helps us manage and coordinate the actions of the agents within a swarm.

## Interface IPerformanceRecord

This interface describes how to track performance data for a process running within the agent swarm. Think of it as a way to monitor how well the system is doing overall, or to diagnose specific issues.

It bundles together information about a particular process, including details about each client (like a session or agent) that participated. You're able to see the total number of times a process was executed, how long it took in total, and the average response time per execution.

The record also includes precise timing information – essentially a way to know exactly when the performance data was collected, broken down into days since a standard starting point, seconds within that day, and a standard date/time format. This information can be used for logging and reporting on system performance.

## Interface IPayloadContext

This interface, `IPayloadContext`, helps organize information needed for running tasks within the system. It bundles together the client identifier – essentially who requested the task – and the actual data being processed, which we call the payload. Think of it as a container holding both the "who" and the "what" of an operation. The `clientId` property tells you which client initiated the process, while the `payload` property holds the specific data the agents will work with.

## Interface IOutlineValidationFn

This interface defines a function that validates the structure of an outline, essentially checking if the steps in a task are organized in a logical and correct sequence. It's used to ensure the AI agent swarm is following a well-defined plan. The function takes an outline, represented as a structured data object, and returns a boolean indicating whether the outline is valid. If the outline is invalid, you can also provide error messages to help diagnose the issue and refine the agent's planning process. Think of it as a quality control mechanism for the agent's roadmap.

## Interface IOutlineValidationArgs

This interface helps you pass information to validation steps within your AI agent workflows. Think of it as a package containing both the initial input and the data that’s been processed up to that point. The `data` property holds the results of previous operations, allowing validation functions to check if the intermediate outcome is in the expected format and content. It's designed to make it easy to validate the progress of your agent swarm.

## Interface IOutlineValidation

This interface helps you define how to check and confirm the structure of your AI agent outlines. Think of it as a way to set rules and descriptions for validating those outlines. 

The `validate` property is where you put the actual check – a function that examines the outline data and makes sure it's correct.  You can even build complex validation routines by linking validations together.

The `docDescription` property lets you add a plain-language explanation of what the validation does, making it easier for others (or your future self) to understand its purpose.

## Interface IOutlineSchemaFormat

This interface describes how to define an outline format using a JSON schema. Essentially, it lets you specify that your outline will follow a specific structure and rules defined by a JSON schema. You're telling the system what kind of data to expect and how it should be organized. 

It has two key parts: a `type` which tells the system that the format is based on a JSON schema, and a `json_schema` property that holds the actual JSON schema object itself, which dictates the format's structure and validation requirements.

## Interface IOutlineSchema

This interface defines how to set up a specific outline – think of it as a blueprint for a task within a larger AI agent swarm. It describes exactly what prompt, system instructions, and data format to use.

You can provide a static prompt and system instructions, or you can make them dynamic, tailoring them based on the outline's name. It lets you define the expected structure of the data produced, and even includes validation steps to ensure the data is correct. 

You can also set limits on how many times the system tries to complete the outline and add custom actions for different stages of the process. Finally, there's a function for generating a history of the outline's execution.

## Interface IOutlineResult

This interface describes the outcome of running an outline generation process. It tells you if the generation was successful and provides details about what happened. You'll find a unique ID for tracking specific outline runs, a record of all the messages exchanged during the process (like user requests, assistant responses, and system prompts), and an error message if something went wrong. It also remembers the original input used to trigger the outline, the resulting data (if any), and how many times the process was attempted.

## Interface IOutlineObjectFormat

This interface defines the structure for data used in outlining tasks. Think of it as a blueprint that ensures everyone's on the same page about what information is needed and how it’s organized. 

It specifies the fundamental type of data being used (like whether it's a JSON object or a generic object). 

You're also able to indicate which pieces of information are essential, and details about each piece of data, including its data type and a description to clarify its purpose.

## Interface IOutlineMessage

This interface defines the structure of a message within the system, helping to organize interactions between users, assistants, and the overall process. Each message includes who sent it – whether it was a user, the assistant, or the system itself – and the actual content of that message. 

You can also attach details about tool calls to a message, specifying which agent initiated the call and even including an ID to track its progress. This helps to keep everything linked and understandable when reviewing the history of a conversation or task.

## Interface IOutlineHistory

This interface helps you keep track of the conversation or steps taken during an outline generation process. It lets you add new messages or actions to the history, clear the entire history if needed, or retrieve a complete list of what's happened so far. You can add messages one at a time or in groups, providing a simple way to manage the sequence of events.

## Interface IOutlineFormat

This interface defines the structure for outline data used within the AI agent swarm orchestration framework. Think of it as a blueprint that ensures all outline data conforms to a consistent format. It specifies what kind of data is expected (like objects or strings), lists which fields are absolutely necessary, and provides details about each property, including its data type and a helpful description. Essentially, it's all about making sure everyone’s on the same page when dealing with outline information.

## Interface IOutlineCallbacks

This interface lets you listen in on what's happening as an outline is created and checked. You can set up functions to be called when a new outline attempt begins, when a document is successfully generated, when a document passes validation, or when a document fails validation. These callbacks provide a way to monitor the process, log events, or implement retry logic based on the outcome of each step. They help you keep track of how outlines are being created and if they meet the required standards.

## Interface IOutlineArgs

This interface helps manage the information needed when creating an outline. Think of it as a package containing everything an AI agent needs to work on outlining something – the actual input, a counter to track attempts, and a way to keep track of what's already happened. The `param` holds the content that needs outlining, the `attempt` number is useful for figuring out if a process is retrying, and the `history` allows the system to remember past steps and context.  The `format` property defines how the final outline should be structured.

## Interface IOutgoingMessage

This interface describes a message being sent *from* the AI agent swarm system *to* a client, like an agent itself or a user interface. Think of it as the system's way of communicating results or notifications back.

Each message has a `clientId`, which is a unique identifier to make sure it reaches the right recipient, similar to addressing an envelope.  There’s also `data`, which is the actual content of the message – this could be a processed result, a response, or any other information being sent. Finally, `agentName` tells you which agent within the swarm generated the message, providing context for the data.

## Interface IOperatorSchema

The `IOperatorSchema` defines how different AI agents within a swarm can connect and communicate with each other. Think of it as a blueprint for setting up channels for agents to exchange messages. The `connectOperator` property is the core of this – it's a function that establishes a connection between a client (which could be another agent or an external system) and a specific agent within the swarm, identified by its name. This connection allows the client to send messages to the agent, and the agent can then respond. The connection is managed and can be closed using a "dispose function" provided by the `connectOperator`.

## Interface IOperatorParams

This interface defines the required information needed to configure and run an operator within the AI agent swarm orchestration system. Think of it as a set of instructions for each agent—it needs to know its own name (`agentName`) to identify itself, a `clientId` to track its origin or purpose, and tools for logging (`logger`), communication (`bus`), and maintaining a record of its actions (`history`). These properties collectively provide the context and necessary utilities for an agent to function effectively within the larger swarm.

## Interface IOperatorInstanceCallbacks

This interface defines the events you can listen for when working with an individual operator within the agent swarm. Think of it as a way to get notified about what's happening with each agent – when it starts, provides an answer, receives a message, sends a notification, or finishes its work. You can hook into these events to track the agent's progress and respond accordingly, such as logging activities or updating a user interface. Each event provides details like the client ID and agent name, allowing you to identify which agent is involved in the action.

## Interface IOperatorInstance

This interface defines the core functions you'll use to interact with an individual agent within your AI agent swarm. Think of it as the way you talk to one agent at a time.

You'll use `init` to get the agent ready to go.  `connectAnswer` sets up a listener so you can receive answers from the agent.  When the agent has something to say, you'll send it using the `answer` method. The `notify` function lets you send general messages to the agent. `recieveMessage` is how the agent will send information back to you. Finally, `dispose` is used to clean up and shut down the agent when you're finished with it.

## Interface IOperatorControl

This interface, `IOperatorControl`, provides a way to configure how an operator within the AI agent swarm framework behaves. You can customize its actions by setting callback functions that respond to different events.  It also allows you to provide a custom "adapter" – essentially a blueprint – to define the specific type of operator you want to use, offering a high degree of flexibility in how your agents operate. Think of it as a control panel for shaping the operator's functionality.

## Interface INavigateToTriageParams

This interface helps you customize how your AI agents navigate and interact during a triage process. It allows you to inject specific messages or actions before, during, or after the navigation, giving you control over the agent's behavior.

You can define what happens right before the navigation starts with `beforeNavigate`. `lastMessage` lets you craft a tailored message to be used as a reminder or context.  The `flushMessage` property allows for custom messaging when the navigation needs to be cleared, and `executeMessage` handles the messages associated with an action’s execution. Finally, `toolOutputAccept` and `toolOutputReject` give you ways to manage responses when a tool's output is accepted or rejected, respectively. Each of these properties can be a simple string or a function that dynamically generates a message based on the situation.

## Interface INavigateToAgentParams

This interface lets you customize how navigation to a specific agent happens. It’s all about controlling what happens before, during, and after an agent is selected.

You can define functions to handle situations like preparing for the agent selection (`beforeNavigate`), crafting an initial message to send (`flushMessage`), managing tool outputs (`toolOutput`), and defining custom messages for different stages of interaction (`lastMessage`, `emitMessage`, `executeMessage`). 

These options allow for tailored experiences, letting you influence the flow of interaction and add custom logic for each agent selection process. You can use pre-set messages or dynamic functions that respond to the conversation history and agent details.

## Interface IModelMessage

This interface, `IModelMessage`, represents a single message that moves around within the AI agent system. Think of it as the basic unit of communication between agents, tools, users, and the system itself. It’s used to keep track of the conversation history, generate responses, and to share important updates.

Each message has a `role` indicating who or what sent it – whether it's a response from the AI assistant, a notification from the system, output from a tool, or input from a user.  It also includes the `agentName` to tie the message to a specific agent within the swarm.  The `content` property holds the actual message text.  The `mode` property distinguishes between user input and tool-related actions.

Sometimes, messages contain requests to run tools, described in the `tool_calls` array.  `images` lets you send images, and `tool_call_id` links a tool’s output back to the original request. Finally, the `payload` property allows attaching extra data to the message when needed, like a reference to an image that was sent.


## Interface IMethodContext

The `IMethodContext` interface provides a standard way to track information about each method call within the AI agent system. It bundles together key details like the client session, the name of the method being called, and the specific agents, swarms, storage, state, compute, policy, and MCP resources involved in that call. This context is used by various services to monitor performance, log events, and provide documentation about how the system is being used. Think of it as a shared record allowing different parts of the system to understand what's happening during each method execution.

## Interface IMetaNode

This interface describes the basic structure for organizing information about agents and their relationships within the system. Think of it like building a family tree, but for your AI agents and the resources they use. Each node represents a single agent or a specific resource, and it has a name to identify it. Optionally, it can also have a list of "child" nodes, which show how it connects to other agents or resources – creating a nested structure to illustrate dependencies. This structure helps visualize and understand the overall system architecture.

## Interface IMCPToolCallDto

This interface describes the data used when an AI agent requests a tool to be used as part of a larger orchestrated workflow. It packages together information about which tool is being called, who is making the request (both the client and the agent), the parameters needed for that tool, and whether it's the final step in a series of tool calls. A way to cancel the tool call is also included.

## Interface IMCPTool

This interface outlines the structure for tools used within an AI agent swarm orchestration framework. Each tool needs a descriptive name to identify it, and can optionally include a description to provide more context. Crucially, every tool must also define an input schema – essentially a blueprint that specifies the format and required data the tool expects to receive. This schema uses a standard object structure and allows you to detail the properties, and which ones are essential for the tool to function correctly.

## Interface IMCPSchema

The IMCPSchema interface outlines the blueprint for how an AI agent orchestration process, known as an MCP, will operate. Every MCP needs a unique name, and can optionally include a descriptive explanation for documentation purposes. 

To enable the agents within the MCP to interact with external tools, the schema defines a method to list what tools are available and another way to actually call those tools, providing parameters as needed. Finally, the schema allows for optional callbacks to be used for tracking specific events happening within the MCP’s lifecycle.

## Interface IMCPParams

This interface defines the necessary components for managing Message Command Processing (MCP). Think of it as a blueprint for how your system handles messages and coordinates actions. It ensures that you have a way to log what's happening during processing, providing valuable insights for debugging and monitoring. It also includes a communication channel, allowing your system to react to events and share information with other parts of the larger agent swarm.

## Interface IMCPConnectionService

This interface defines how your AI agents connect and communicate with the central orchestration system. Think of it as the shared language they all use to talk to the boss. It handles the technical details of establishing and maintaining those connections, letting you focus on what your agents are actually doing. The service manages everything from setting up the initial link to keeping it stable and handling any errors that might pop up. You'll use this to ensure all your agents can reliably receive instructions and report their progress.

## Interface IMCPCallbacks

This interface defines a set of functions that your application can use to respond to important events happening within the AI agent orchestration system. Think of these functions as notification hooks – they're triggered when the system starts up, when resources are cleaned up, when tools are retrieved or updated, or when a tool is actually used.  Specifically, `onInit` lets you run code when the system is ready, `onDispose` handles resource cleanup after a client connection ends, `onFetch` signals when tools are being loaded, `onList` notifies you when a tool list is being generated, `onCall` is triggered when a tool is executed, and `onUpdate` informs you when the available tools change.  You can use these callbacks to monitor the system’s activity and react accordingly.

## Interface IMCP

This interface, called IMCP, provides a way to interact with the tools available to different AI agents within the swarm. 

You can use it to find out what tools are available to a specific agent, check if a particular tool exists for an agent, and actually execute those tools with given inputs. 

The system also allows for refreshing the tool lists, either globally or for individual clients, ensuring you have the most up-to-date information about available tools. Essentially, it's the central hub for managing and using the tools your AI agents can leverage.

## Interface IMakeDisposeParams

This interface defines the information needed when you want to automatically handle the cleanup of an AI agent swarm. It allows you to specify how long you want the swarm to run before it’s automatically shut down – this is controlled by the `timeoutSeconds` property.  Additionally, you can provide a function, `onDestroy`, which will be called when the swarm is terminated, giving you a chance to perform any necessary cleanup actions, and it will provide the client ID and swarm name for context.

## Interface IMakeConnectionConfig

This interface defines how often or how quickly connections can be made. It includes a `delay` property, which lets you control the rate at which new connections are established, preventing overwhelming the system or external services. Think of it as a way to gently pace the creation of connections. You can adjust this delay to fine-tune the behavior of your agent swarm.

## Interface ILoggerInstanceCallbacks

This interface lets you connect to a logger and be notified about key events in its life. You can use it to listen for when a logger starts up, when it’s shut down, and whenever a log message – whether it’s a debug, info, or standard log – is recorded. Each callback function receives a client ID to identify the specific logger instance that triggered the event, along with details about the log topic and any associated arguments. Essentially, it provides a way to monitor and react to what a logger is doing.

## Interface ILoggerInstance

This interface defines how client-specific loggers should behave within the system. It builds upon the basic logging functionality and adds ways to properly set up and shut down each logger. 

Before a logger can be used, you’ll need to initialize it using `waitForInit`, which handles setup and can be done asynchronously. When you’re finished with a logger, `dispose` allows you to clean up any resources and ensure a clean exit. This helps manage each client's logging process effectively.

## Interface ILoggerControl

This interface provides tools to manage how logging works within the agent swarm. You can use it to set up a central logging system, customize how logger instances are created, and configure callbacks for when those instances are created or destroyed. It also lets you directly log messages—info, debug, or general—specifically tied to a client, ensuring proper session checks and tracking where the log originated. Think of it as a way to control and tailor the logging behavior for different clients or overall system needs.

## Interface ILoggerAdapter

This interface outlines the methods available for connecting to and using a logging system. It allows your application to send log messages – including debug, informational, and general logs – specifically tied to a client identifier. The framework handles the technical details of initializing and validating the logging connection before each message is sent.  There's also a method to cleanly release the resources associated with a client's logging connection when it's no longer needed.

## Interface ILogger

The `ILogger` interface defines how different parts of the AI agent swarm system record information. It provides a way to log messages about what's happening, from general events to detailed debugging information. 

You can use it to record everything – like when agents start or stop, what tools they're using, whether policies are being followed, and if there are any problems saving data. This logging helps with understanding how the system is working, troubleshooting issues, and keeping track of what has happened over time. 

The `log` method is for general-purpose messages, `debug` is for highly detailed information used during development or problem solving, and `info` is for reporting successful actions and validations.

## Interface IIncomingMessage

This interface defines the structure of a message coming into the system, like a request from a user or a notification from another application. It's how information gets passed to the AI agents that make up the swarm.

Each message includes a unique identifier for the client that sent it, allowing the system to track the origin of requests. It also carries the actual content of the message – the user's input or data to be processed. Finally, it specifies which agent should handle this particular message, ensuring it’s routed to the correct component for action.

## Interface IHistorySchema

This interface outlines how your AI agent swarm keeps track of past conversations and interactions. Think of it as the blueprint for the system’s memory.

It primarily focuses on the `items` property, which specifies the method used to store and retrieve those historical messages – whether that's a database, a simple array, or something else. This adapter handles the details of saving and loading the conversation history.

## Interface IHistoryParams

This interface defines the information needed to set up a record of an agent’s activities. Think of it as a blueprint for keeping track of what an agent does.

It includes the agent's name, a unique ID for the client using the agent, and the agent’s logger and bus for communication. You can also specify how many messages to keep to manage context size. This helps ensure you have a complete picture of the agent's work and can easily debug or analyze its performance.

## Interface IHistoryInstanceCallbacks

This interface defines a set of functions that allow you to customize how an agent's conversation history is managed. You can use these functions to dynamically adjust the system prompts, decide which messages get saved, retrieve initial data, and be notified of changes to the history, such as when a new message is added or an old one is removed. It also provides lifecycle hooks like initialization and disposal, letting you perform setup and cleanup tasks. You're even given a reference to the history object itself, allowing for more advanced manipulations.

## Interface IHistoryInstance

The `IHistoryInstance` interface provides a way to manage and access the message history for individual agents within the swarm. You can use the `iterate` method to step through the messages associated with a specific agent, allowing you to review their interactions. The `waitForInit` method ensures the history is properly set up and any necessary initial data is loaded for an agent.  New messages are added to an agent’s history using the `push` method, and the `pop` method lets you retrieve and remove the most recent message. Finally, the `dispose` method provides a way to clean up an agent's history when it's no longer needed.

## Interface IHistoryControl

This interface lets you fine-tune how history is managed within the agent swarm orchestration framework. You can tell the system what callbacks you want to use when history instances are created or destroyed, essentially allowing you to react to specific lifecycle events.  It also provides a way to swap out the default history instance creator with your own custom one if you need more specialized behavior. Think of it as giving you control over the history recording and handling process.

## Interface IHistoryConnectionService

This interface, IHistoryConnectionService, serves as a blueprint for managing how our system interacts with historical data connections. It's designed to be a clear and consistent way to define the external capabilities of our history services, specifically focusing on what users and other parts of the system need to know. Think of it as a simplified view, leaving out the complicated internal workings. By using this interface, we ensure that the publicly accessible history services behave predictably and reliably.

## Interface IHistoryAdapter

This interface helps your system remember and manage the conversations happening between agents. It lets you add new messages to the history, retrieve the most recent message, and clear out the history for a specific client and agent when it's no longer needed. You can also loop through all the messages recorded for a client and agent to review their interaction.

## Interface IHistory

This interface helps you keep track of the conversations your AI agents have had. It lets you add new messages to the record, retrieve the last message exchanged, and format the history specifically for an agent’s context or get it as raw data. Think of it as a log of what's been said and done, which you can adapt depending on how you want to use it. You can add messages, remove the most recent one, or get the history prepared for a particular agent's use or simply as a complete list of all messages.

## Interface IGlobalConfig

This interface, `IGlobalConfig`, acts as the central control panel for the entire AI agent swarm system. It's packed with settings and functions that influence how the swarm behaves, like how it handles tool calls, logs activity, and manages agent history. Think of it as the master configuration file you can tweak to fine-tune the swarm's performance and adapt it to different scenarios.

Many parts of the system, including the `ClientAgent`, rely on these settings, so changing them can have widespread effects.  You can adjust things like how errors during tool calls are handled (e.g., resetting the conversation or trying to fix them), what placeholder responses are used when the model doesn't output anything, and how much logging detail is displayed.

Here's a breakdown of what you can control:

* **Tool Call Recovery:**  You can choose how the system reacts when tool calls fail – retry the call, clear the conversation, or use a custom function.
* **Placeholder Responses:**  Customize what the system says when the model produces no output.
* **Agent History:** Control how many messages are stored in an agent's history.
* **Tool Call Limits:** Prevent excessive tool call loops by setting a maximum number of calls per execution.
* **Agent Mapping and History:**  Modify how tool calls are handled and filtered for agent history, enabling custom processing.
* **Logging Levels:** Adjust the level of detail in logs, from basic information to extensive debug information.
* **Navigation:** Fine-tune navigation stacks and manage stack changes.
* **Output Transformation:**  Clean up agent responses by removing unwanted tags or symbols.
* **Persistence:**  Control whether data is stored persistently and how embeddings are cached.
* **Agent Validation:** Validate tool parameter before executing agent runs
* **Operator Connection**: Set functions to connect operators for handling message and response.



Changing these settings dynamically through `setConfig` lets you adapt the system’s behavior without restarting or redeploying.  This central configuration ensures a consistent and controllable swarm environment.

## Interface IFactoryParams

This interface lets you customize how your AI agent swarm interacts with users and handles specific events. You can define custom messages or functions to control what's displayed when the system needs to clear its memory (flush), when an agent produces a tool output, when a message is emitted, or when an action is executed. These customizations can include incorporating the most recent user message to provide a more contextual experience. You have the flexibility to use simple text strings or more complex functions that react to different parameters like client ID and agent names.

## Interface IFactoryParams$1

This interface lets you customize how navigation works with your triage agents. It provides a way to define specific messages or functions that will be used when the agent needs to clear its memory (flush), begin a new task (execute), or receive the result of using a tool (tool output). You can set these as simple text messages, or as functions that dynamically generate messages based on factors like the client's ID or the default agent being used. This allows for flexible and context-aware communication with your agents during the navigation process.

## Interface IExecutionContext

This interface, `IExecutionContext`, helps keep track of what's happening within the AI agent swarm. It acts like a shared notebook, containing key details about a single activity or "execution." Think of it as a way to link together information across different parts of the system, like how a client session is identified, when an activity begins, and what process is involved. Each execution gets its own unique ID, and this interface ensures everyone’s on the same page about which activity is which.

## Interface IEntity

This interface, `IEntity`, acts as the foundation for everything that gets stored and managed within the AI agent swarm. Think of it as the parent for all other entity types. If you're dealing with a piece of data that needs to be saved or tracked, it will likely inherit from this `IEntity` interface, with more specialized interfaces like `IPersistAliveData` or `IPersistStateData` adding extra details.

## Interface IEmbeddingSchema

The `IEmbeddingSchema` interface lets you configure how your AI agent swarm generates and compares embeddings – essentially, numerical representations of text. It allows you to decide whether to save these embeddings for later use, giving your agents a memory. You specify a unique name for your embedding method and define functions to write and read these embeddings from a storage, so they don’t have to be recalculated every time. It also provides hooks for custom events related to embedding creation and comparison. The `createEmbedding` function generates embeddings from text, and `calculateSimilarity` measures how alike two embeddings are.

## Interface IEmbeddingCallbacks

This interface lets you tap into what's happening when your AI agents are working with embeddings – those numerical representations of text. You can use it to track when a new embedding is generated, giving you the text that was embedded, the details of the embedding process, and a unique identifier. 

It also allows you to monitor how two different texts are being compared for similarity, providing the original text, a score representing how similar they are, and relevant process information. Think of it as a way to peek under the hood and understand or customize the embedding process as it unfolds.

## Interface ICustomEvent

This interface defines a way to send custom events within the swarm system. Think of it as a catch-all for situations where the standard event types aren’t enough. It builds on a base event structure and lets you attach any kind of data you need to the event – it’s really useful for user-defined events or scenarios that require flexible data. Essentially, it allows you to create and share bespoke event notifications with custom information attached.

## Interface IConfig

This interface, `IConfig`, defines the settings used when generating UML diagrams. It allows you to control the level of detail included in the diagram. The `withSubtree` property, when set to true, instructs the system to include subtrees within the diagram, providing a more complete representation of the relationships and components. If false, only the immediate connections will be displayed, offering a simpler view.

## Interface IComputeSchema

The `IComputeSchema` interface describes the configuration for a computational unit within the agent swarm orchestration framework. It defines how a specific task or piece of work should be executed.

It includes a descriptive text for documentation purposes, a flag indicating whether the compute is shared among clients, and a unique name to identify it.  The interface also specifies a time-to-live (TTL) value, dictating how long the data associated with this compute should be stored.

Crucially, it requires a function (`getComputeData`) that retrieves the data needed for the computation, and optionally lists other computes it depends on. You can also provide a list of middlewares to modify the data flow and a set of callbacks for specific lifecycle events.

## Interface IComputeParams

This interface, `IComputeParams`, defines the essential information needed to run a computation within the agent swarm orchestration framework. Think of it as a package of context passed to each agent. 

It includes a unique `clientId` to identify the specific request, a `logger` for recording important events and debugging, and a `bus` to facilitate communication between agents. Finally, it contains a `binding` - an array of contracts that dictate how the computation's state changes should be tracked and managed.

## Interface IComputeMiddleware

This interface defines how different components can be plugged into the AI agent swarm's processing pipeline. Think of it as a standardized way to modify or enhance the information flowing between agents. By implementing this interface, you can inject custom logic to, for example, filter data, enrich it with external information, or reformat it before it reaches the next agent. It’s designed to make the system flexible and extensible, allowing you to tailor the agent swarm’s behavior without changing the core orchestration engine.

The key method, `compute`, allows you to receive the data from the previous agent and return modified data for the next one. You're essentially acting as a gatekeeper or transformer in the agent network.

## Interface IComputeConnectionService

This interface defines how your AI agents connect to and interact with a compute resource, like a server or a cloud environment. Think of it as the bridge that allows your agents to actually *do* things, rather than just thinking and planning. It provides methods for establishing a connection, executing commands remotely, and handling any potential errors that might occur during those interactions. By implementing this interface, you can create flexible and adaptable systems where agents can work together and leverage external resources to achieve complex tasks. This ensures a standardized way for agents to communicate with and utilize compute infrastructure.

## Interface IComputeCallbacks

This interface, `IComputeCallbacks`, provides a way to hook into the lifecycle of a compute unit within the AI agent swarm orchestration framework. It’s essentially a set of functions you can supply to receive notifications and potentially influence the behavior of a specific compute unit. 

You’re given functions like `onInit` to be called when a compute unit starts up, `onDispose` when it shuts down, and `onCompute` when it processes data. `onCalculate` lets you respond to calculations being performed, while `onUpdate` signals changes to the compute unit. By providing these callbacks, you can monitor and react to what’s happening within the swarm’s processing pipeline.

## Interface ICompute

This interface defines the core functionality for a compute component within the AI agent swarm. It allows you to trigger calculations, update the component's status, and retrieve its data. The `calculate` method initiates a computation based on a given state name, while `update` is used to manage the component's lifecycle and status based on client and compute identifiers. Finally, `getComputeData` provides a way to access the current data associated with the compute component, allowing you to monitor its progress or retrieve results.

## Interface ICompletionSchema

This interface, `ICompletionSchema`, helps you set up how your AI agents generate responses within the swarm. Think of it as defining the recipe for how each agent comes up with its answer. 

You give each completion mechanism a unique `completionName` so the system knows which one you'll be using. There’s also an option to specify if the response should be in `json` format.

You can pass `flags` to the underlying language model, these are special instructions specific to the model you're using—like `/no_think` to tell a model not to explicitly state its reasoning process.

For more control, you can provide `callbacks` that let you customize what happens after a completion is generated. Finally, the `getCompletion` method is how you actually trigger a response from the configured completion mechanism, using the context and available tools to generate a relevant model message.

## Interface ICompletionCallbacks

This interface lets you listen in on what happens after an AI agent completes a task. Specifically, you can use it to run extra actions or get notified when a task finishes successfully. The `onComplete` property is the key here; it's a function you provide that gets called when the task is done, giving you information about the completed task and any output generated. You can use this to do things like save results, display progress, or kick off another process.

## Interface ICompletionArgs

The `ICompletionArgs` interface defines what’s needed to ask the system to generate a response. Think of it as a container for all the information the AI needs to understand your request.

It includes a unique identifier for who's making the request (`clientId`), the specific agent you’re interacting with (`agentName`), and potentially an outline (`outlineName`) that dictates the structure of the response, especially useful for JSON outputs. 

You also provide the conversation history through `messages`, specify available tools (`tools`), and indicate the origin of the latest message (`mode`). Finally, you can customize the output format with `format`, which is like setting rules for how the AI should structure its response.

## Interface ICompletion

This interface defines how your AI agents can receive suggestions or completions, essentially providing a way for them to get hints or build responses incrementally. Think of it as the standard way agents communicate their progress or request more information. It's designed to give you a full toolkit for getting those AI-generated responses.

## Interface IClientPerfomanceRecord

This interface, `IClientPerformanceRecord`, is all about tracking how individual clients – think user sessions or specific agents – are performing within your system. It's a way to drill down from overall process performance to understand what's happening with each client.

Each record contains details like a unique client ID, as well as memory and state snapshots. You're also getting metrics about how many times the client has executed tasks, the total amount of data it’s processed (both input and output), and the time it takes to complete those executions. These metrics help you identify bottlenecks or inefficiencies specific to certain clients. Think of it as a detailed performance report for each participant in your agent workflows.

## Interface IChatInstanceCallbacks

This interface defines a set of callbacks that allow your application to respond to events happening within a chat instance managed by the AI agent swarm orchestration framework. You can use these callbacks to track the lifecycle of a chat – from when it starts and an instance is prepared, to when messages are sent, and finally when the chat is concluded.  The `onCheckActivity` callback helps you monitor the activity status of a specific AI agent within a swarm, while `onInit` and `onDispose` signal the setup and teardown of a chat instance. `onBeginChat` is triggered when a new conversation starts, and `onSendMessage` lets you know when a message has been transmitted.

## Interface IChatInstance

The `IChatInstance` interface represents a single chat session within your agent swarm orchestration system. Think of it as a connection point for an AI agent to interact with a user or another agent.

You start a chat using `beginChat`, and send messages to the other participant with `sendMessage`.  `checkLastActivity` lets you monitor if the chat is still active, useful for keeping connections alive or timing out inactive ones. 

When you're finished with a chat, `dispose` cleans up resources associated with it. Finally, `listenDispose` allows you to be notified when a chat is being terminated, so you can handle any necessary cleanup or post-termination actions.

## Interface IChatControl

This interface lets you configure how your AI agent swarm interacts with chat systems. You can tell the framework which type of chat system it should use by providing a constructor for the chat instance. It also allows you to customize the framework’s behavior by setting callbacks that respond to various chat events, letting you tailor the agent swarm's responses and actions.

## Interface IChatArgs

This interface, `IChatArgs`, defines the information needed to pass a chat message to an AI agent. It includes a unique client identifier, the name of the agent currently processing the chat, and the actual message content itself. Think of it as a structured way to deliver a conversation turn to the right agent within the swarm. It ensures each message is clearly linked to its source and handled by the appropriate AI.

## Interface IBusEventContext

This interface provides extra information about an event happening within the swarm system. Think of it as a way to add labels or identifiers to events, helping to understand where the event originated and which components were involved. 

When an agent is directly involved, like in a typical client agent scenario, you're most likely to see the `agentName` filled in. However, other fields like `swarmName`, `storageName`, and `policyName` are available to provide more context for system-wide events. Essentially, it's a way to specify which agent, swarm, storage, state, compute, or policy is related to a particular event.

## Interface IBusEvent

This interface defines the structure of messages sent across the internal communication system within the swarm. Think of it as a standardized way for different parts of the system, especially agents, to talk to each other and share information.

Each message uses a specific source to identify where it’s coming from (usually “agent-bus” for messages originating from an agent). It also has a type that describes what the message is about – for instance, "run" to signal a task starting or "commit-user-message" to share a user's input.

Messages can also carry data, split into ‘input’ and ‘output’ sections, to pass relevant details.  A ‘context’ section allows for adding extra information about the message, like which agent sent it. This makes it clear where actions are originating and provides important metadata for understanding the event.

## Interface IBus

The `IBus` interface acts as a central communication hub for the swarm system. It allows different parts of the system, especially agents, to send updates and information to specific clients in a reliable and asynchronous way. Think of it as a delivery service that ensures everyone gets the messages they need.

The core function, `emit`, is how agents broadcast updates. When an agent needs to notify the system about something – whether that’s finishing a task, sending output, or confirming a commit – it uses `emit` to send a structured event to a specific client. These events follow a standard format, including details like the event type, the agent that sent it, the data involved, and the target client's ID.

This system keeps things organized by allowing agents to operate independently while still keeping the entire swarm system aware of what's happening. The `clientId` within the event reinforces the target for delivery, ensuring updates reach the right place. It's a type-safe way to share information and maintain a synchronized experience for everyone involved.





## Interface IBaseEvent

This interface lays the groundwork for all events happening within the AI agent swarm. Think of it as the basic template for any message being sent between agents, sessions, or other parts of the system. 

Every event needs to have a `source` - a way to identify where the event came from, like a specific agent or bus. It also needs a `clientId` to ensure the message is delivered to the correct client or agent instance. These two properties guarantee events are properly routed and understood throughout the swarm.

## Interface IAgentToolCallbacks

This interface defines ways for you to interact with and observe the lifecycle of a tool used by an AI agent. It provides specific points where you can hook in your own code to do things like log activity, check if a tool is ready to run, or handle errors that might occur.

You can use `onBeforeCall` to run code right before a tool starts its work – think of it as a setup or preparation step.  `onAfterCall` lets you run code after the tool finishes, which could be for cleanup or reviewing the results.

`onValidate` is helpful if you need to make sure the information passed to a tool is correct before it even starts running. Finally, `onCallError` is there to help you deal with any problems that might happen during a tool’s execution, allowing you to log errors or attempt recovery.

## Interface IAgentTool

This interface defines what a tool looks like within our agent swarm system. Each tool has a unique name and a description to help users understand how to use it.

Before a tool can run, it checks if it's currently available, potentially based on the client or agent involved. It also validates the input parameters to ensure they're correct. 

You can add optional lifecycle callbacks to customize how the tool behaves during execution. The tool itself is identified by a type, which currently should be `function`, and it has a method called `call` that handles the actual execution with provided data like client ID, agent name, and parameters. This `call` method handles the tool's logic with provided context.

## Interface IAgentSchemaInternalCallbacks

This interface lets you hook into different stages of an agent's lifecycle, giving you opportunities to monitor or react to what's happening. You can provide callbacks for when an agent starts running, when it produces output, or when a tool generates results. There are also hooks for handling errors, dealing with system messages, and managing the agent’s history, including when it's cleared or restarted. This gives you fine-grained control and visibility into the agent’s behavior. You can also listen for initialization and disposal events, and events triggered after all tools have completed their calls.

## Interface IAgentSchemaInternal

This interface defines how an AI agent is configured within the swarm. Think of it as a blueprint that describes the agent’s personality, capabilities, and how it interacts with other agents and systems.

The agent has a unique name to identify it within the swarm. It also has a primary prompt that guides its behavior, and optionally, a description for documentation purposes.

The agent can use tools to interact with the environment; you can limit the number of tools it uses, and even modify the tool calls before they’re executed. It’s also possible to define system prompts to guide tool-calling protocols.

You can control the agent's memory by setting a maximum number of messages to keep in context.  The agent can also depend on other agents to handle different tasks or transitions.

There are several optional functions to customize the agent’s behavior: a validation function to check the agent’s output, a transformation function to alter the output, and a mapping function to process assistant messages.  Finally, you can define lifecycle callbacks to further fine-tune how the agent executes its tasks, and if the agent is an operator, it can handle chat passing to operator dashboard.

## Interface IAgentSchemaCallbacks

This interface lets you hook into different stages of an agent's lifecycle. You can use these callbacks to monitor what the agent is doing, react to specific events, or even influence its behavior. For example, you can be notified when the agent starts running, when a tool generates output, or when the agent's memory is cleared. These callbacks give you flexibility in how you manage and observe your AI agents. You can also react to tool requests, assistant or user messages, or when an agent is restarted after an interruption.

## Interface IAgentSchema

This interface defines the structure for describing an AI agent within the orchestration framework. Think of it as a blueprint for creating agents. 

It lets you specify what instructions or "system prompts" you want the agent to follow. You can provide these instructions directly as a single string or as an array of strings for more complex scenarios. 

There are three ways to define these instructions: a static set, a static alias for system, or a dynamic set generated by a function. The dynamic approach allows you to customize the agent's instructions based on factors like the client ID or the agent's name, making each agent more adaptable to different situations.

## Interface IAgentParams

This interface defines the settings an agent uses when it's running. Think of it as the agent's configuration file. It includes things like a unique identifier for the client using the agent, a way to log activities, a communication channel within the larger system, a tool for calling external tools, a record of past interactions, and a mechanism for generating responses.  You can also provide a list of tools the agent can use and a function to check the agent's output before it's considered finished.

## Interface IAgentNavigationParams

This interface defines the settings you can use to tell an agent how to move and interact with other agents within the system. Think of it as a blueprint for instructing an agent to use a specific tool, explaining what that tool does, specifying which agent it should interact with, and optionally providing extra notes about its use. It lets you precisely control how agents connect and collaborate. The `toolName` specifies what the agent will use, `description` helps understand what it does, `navigateTo` identifies the target agent, and `docNote` allows for optional additional information.

## Interface IAgentConnectionService

This interface helps us clearly define how different agents connect and communicate within the system. Think of it as a blueprint that ensures the public-facing connection methods are consistent and reliable. It's designed to strip away any internal workings, so developers only see the core functionality for agent connections. This helps keep things organized and predictable when building and using the agent swarm.

## Interface IAgent

The `IAgent` interface defines how individual AI agents within a larger orchestration framework behave and interact.  It provides methods for running agents, executing commands that potentially update their internal history, and retrieving outputs. 

You can use the `run` method for quick, stateless computations with an agent, while `execute` handles more involved processes that might change the agent's memory.

To manage the agent’s workflow, methods like `commitToolOutput`, `commitSystemMessage`, and `commitUserMessage` allow you to add information to its history.  You can also control tool requests with `commitToolRequest` and pause or cancel tool execution using methods like `commitStopTools` or `commitCancelOutput`. Finally, `commitFlush` provides a way to completely reset an agent to its initial state.
