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

This function checks all your AI agent swarms, agents, and outlines to make sure everything is set up correctly. Think of it as a health check for your AI system. It’s designed to be safe to run repeatedly; it won’t cause any issues if you run it more than once during a single process.

## Function startPipeline

This function lets you kick off a pre-defined workflow, also known as a pipeline, within your AI agent swarm. You tell it which client this workflow belongs to, the name of the pipeline itself, and which agent should handle the initial steps.  You can also pass in some data, wrapped in a payload object, that the pipeline will use. The function will then return a result, the type of which you can specify when calling it. Essentially, it’s the main way to start things happening within your agent system.


## Function scope

This function lets you run a piece of code – a function – within a controlled environment, ensuring it has access to the necessary tools and resources. Think of it as setting up a specific workspace for your code to operate in. You provide the code you want to run, and optionally, you can customize the tools available to it, like specifying which AI agents or processing steps it uses. The function will execute your code and return its result, giving you a reliable way to manage and orchestrate your AI agent workflows. It helps you define the context in which your AI agents operate.

## Function runStatelessForce

This function lets you send a message to your AI agent swarm and have it process it immediately, without adding it to the ongoing chat history. Think of it as a way to execute quick tasks or handle outputs like storing data, even if the agent's status has changed. It guarantees the message will be processed, regardless of whether the agent is currently active, and provides tracking of the process. You provide the message content and a unique identifier for the client session to use this function.

## Function runStateless

This function lets you send a message to a specific agent within your swarm without adding it to the ongoing conversation history. Think of it as a way to run a quick task or process some data using an agent without cluttering up the chat log – useful for things like handling file uploads or one-time operations. 

You provide the message content, a client identifier to track the session, and the name of the agent you want to use. The system verifies everything is working correctly, ensures the agent is still active, and then runs the message. This helps prevent issues with long chat histories and keeps things organized. The execution is carefully managed to provide a fresh environment and track important details.

## Function questionForce

This function lets you trigger a specific question-answering process, essentially forcing a response based on the provided message. It's useful when you need to ensure a particular query is addressed within a conversation. You provide the message you want to use, a unique identifier for the client interacting, and the name of the knowledge base (wiki) to draw from. The function will then return a string, which represents the response generated by the orchestrated AI agents. Think of it as a way to directly prompt the swarm to focus on a specific question.


## Function question

This function lets you send a question or message to an AI agent within a specific conversation and context. Think of it as the primary way to interact with your agents. You need to provide the actual message you want to send, a unique ID for the conversation, the name of the AI agent you want to involve, and the knowledge base (wiki) it should use to answer. The function then handles the complex steps needed to process the message and get a response back, ultimately returning the agent's reply.

## Function overrideWiki

This function lets you replace or update the configuration of a wiki within the AI agent swarm. You provide a new schema definition, and it applies those changes directly to the wiki’s settings. Think of it as a way to quickly adjust a wiki’s structure and properties. The process is isolated to prevent conflicts with other operations, and it records the change in the system logs if logging is turned on. You essentially give it a blueprint for how the wiki should look, and it makes it happen.


## Function overrideTool

This function lets you change how a tool behaves within the AI agent swarm. Think of it as updating a tool's recipe – you can modify its name, what it does, or any extra details it holds.  The update happens independently, ensuring it doesn't interfere with ongoing processes. If the system is set up to log events, this override will be recorded. You provide the new or updated tool configuration to this function, and it applies those changes to the existing tool within the swarm.

## Function overrideSwarm

This function lets you directly update the settings for a swarm within the system. Think of it as a way to quickly change how a swarm operates, whether you're making a complete overhaul or just tweaking a few details. It makes the change independently, keeping things separate and controlled, and it records the change if you're tracking those kinds of actions. You provide a new schema as input, and it replaces the existing one for the specified swarm.

## Function overrideStorage

This function lets you update how the swarm system stores information. Think of it as modifying the blueprint for a particular storage area. You can provide a new or partial schema, and this function will apply those changes to the existing storage configuration. The change happens independently, ensuring it doesn't interfere with any ongoing operations. If the system is set up to log actions, this override will be recorded. You provide the new or updated schema as input, and the function takes care of the rest.

## Function overrideState

This function lets you change how the swarm system manages a specific type of data, or "state." Think of it as updating a blueprint for how information is structured and handled. You provide a new or modified version of the blueprint, and the system applies those changes. This update happens independently, ensuring it doesn’s interfere with anything else currently running. The system will also record this change if you’ve enabled logging. You only need to specify the parts of the state you want to change; you don't have to redefine the entire state configuration.

## Function overridePolicy

This function lets you change a policy’s settings within the swarm system. Think of it as updating a rule – you can either replace the whole thing or just tweak a few parts.  It makes these changes independently, ensuring a safe and isolated update process.  The system will also record this change if logging is turned on. You provide a new definition for the policy, and the function applies it.

## Function overridePipeline

This function lets you modify a pipeline definition, allowing you to make changes without completely redefining it from scratch. Think of it as a way to tweak an existing pipeline, perhaps to adjust a specific step or add a new one. You provide a partial pipeline definition – just the parts you want to change – and this function merges those changes into the original pipeline. This makes it easier to manage and update your AI agent workflows incrementally.

## Function overrideOutline

This function lets you modify an outline schema that’s already set up in the swarm system. Think of it as making adjustments to a plan or structure. 

It makes sure the change happens in a fresh environment, so it doesn’t accidentally mess with anything else going on. 

If the system is set up to log actions, this modification will be recorded as well. You provide a partial schema – just the changes you want to make – and it merges those changes into the existing outline.

## Function overrideMCP

This function lets you update or change an existing Model Context Protocol (MCP) schema. Think of it as a way to modify how your AI agents communicate and share information. You provide a new schema definition, and the function merges it with the existing one, effectively overriding parts of the original. This is useful when you need to adjust the structure or content of the information exchanged between agents. The input `mcpSchema` represents the updated definition you want to apply.

## Function overrideEmbeding

This function lets you change how the system handles embeddings, the way it converts data into numerical representations for processing. You can provide a complete new schema or just update a few specific parts of an existing one. Think of it as tweaking the system's understanding of data. It's designed to be a standalone action, separate from any ongoing tasks, to keep things stable and predictable. The system will also record this change if logging is turned on. You provide the new embedding schema as input, and the function does the rest.

## Function overrideCompute

This function lets you adjust a compute schema, essentially allowing you to modify how computations are handled within the agent swarm. Think of it as a way to fine-tune the settings for a specific type of calculation. You provide a partial schema – just the changes you want to make – and it merges those updates into the original configuration. This is useful for customizing behavior without needing to redefine an entire compute schema from scratch. It's particularly handy when you want to tailor calculations to specific environments or scenarios.

## Function overrideCompletion

This function lets you modify how the AI agents in the swarm generate responses. You can provide a new schema, or just update parts of an existing one. It's designed to make changes to the completion process independently, ensuring that the modifications don't interfere with other running tasks. The system will record these changes if logging is turned on. You provide the new or updated schema as input, and the function applies it to the swarm's configuration.

## Function overrideAgent

This function lets you modify an agent’s configuration within the swarm. Think of it as directly updating how an agent behaves. It takes a new schema – which can be a complete set of instructions or just a few changes – and applies it to the agent identified by its name. This update happens independently, ensuring a controlled and isolated change to the agent's setup. If the system is set up to log activity, this override will be recorded. You essentially provide the new schema, and the framework handles the rest.

## Function notifyForce

This function lets you send a message directly out of a swarm session, like an announcement or update, without triggering any of the usual message processing steps. It's specifically for sessions created using "makeConnection." 

Think of it as a way to broadcast information to the agents involved, even if they've been modified since the session started.  The function makes sure everything is set up correctly – verifying the connection and agent status – before sending the message and ensuring a fresh environment for the operation. You're providing the message content and a client ID to identify the session.

## Function notify

This function lets you send messages out from your swarm session without actually triggering any agent actions. Think of it as a way to broadcast information directly. It's specifically designed for sessions created using the "makeConnection" method. 

Before sending, the system makes sure your session, the swarm itself, and the agent you're targeting are still working correctly. If the agent has been replaced, the notification won't be sent.

You provide the message content, a unique client ID to identify the session, and the name of the agent you want associated with the notification. It's a straightforward way to communicate data outward from your swarm.

## Function markOnline

This function lets you tell the system that a particular client is now active and participating in a specific swarm. Think of it as registering a client's presence within a group of agents. You'll need to provide the unique ID for that client and the name of the swarm they’re joining. This is how you signal to the framework that a client is ready to receive and process tasks.


## Function markOffline

This function lets you tell the system that a client has become unavailable within a particular swarm. It's useful when a client unexpectedly disconnects or stops responding. You provide the unique ID of the client and the name of the swarm it belongs to, and the system will update its status to reflect that the client is no longer active. This helps the swarm intelligently redistribute tasks and avoid relying on clients that are offline.


## Function listenEventOnce

This function lets you temporarily listen for a specific type of event happening within your AI agent swarm. It's designed to react to an event just once, and then stop listening. 

You tell it which client (or all clients) to listen to, what the event is called (the 'topic'), and a filter to make sure you only react when the event contains the information you need. When a matching event arrives, a provided function will be executed with the event data. The function also provides a way to cancel the listener before it naturally unsubscribes.



**Parameters:**

*   `clientId`: Identifies the client sending the event; use "*" to listen to all.
*   `topicName`: The name of the event you want to hear.
*   `filterFn`: A test to see if the event is the one you're interested in.
*   `fn`: The action to perform when a matching event occurs.

## Function listenEvent

This function lets you listen for specific messages being sent across the agent swarm. You tell it which client (or all clients) you want to hear from and the name of the message topic. Whenever a message matching that topic is sent, a function you provide will be executed, giving you access to the message’s data.  It’s designed to be reliable, handling message processing in a controlled sequence and preventing interference with essential swarm operations.  You can easily stop listening at any time using the function it returns.


## Function json

This function lets you request structured data in JSON format from your AI agent swarm. Think of it as asking the swarm to fulfill a specific task and deliver the results neatly organized. You tell the function which outline – essentially a blueprint for the data – you want to use, and you can optionally provide some parameters to guide the process. The function handles the behind-the-scenes work of coordinating the agents and making sure everything runs cleanly and safely. The result will be a JSON object filled with the data generated by the swarm, ready for you to use in your application.

## Function hasSession

This function helps you quickly determine if a session is active for a specific client. It simply checks if a session exists based on the client's unique ID. Behind the scenes, it uses a session validation service to perform the actual check. If you have logging enabled, you'll see a record of this function being called. You provide the client's ID, and it returns `true` if a session is found, and `false` otherwise.

## Function hasNavigation

This function helps you quickly determine if an agent is currently involved in guiding a client through a process. It essentially checks if an agent is on the navigation path for a specific client session. Behind the scenes, it verifies both the client and the agent are active, finds the relevant swarm they belong to, and then looks at the current navigation route. If logging is turned on in the system, this check will also record its execution. You provide the client’s ID and the agent's name to use as inputs.

## Function getWiki

This function lets you fetch a specific wiki's information, like its structure and content guidelines, from the AI agent swarm. You simply provide the name of the wiki you're looking for, and it returns all the details associated with that wiki. The system keeps track of these requests if you've enabled logging in your settings.

## Function getUserHistory

This function lets you pull a user's interaction history from a specific session. It finds all the messages associated with a client and then filters them to show only the messages the user actually sent. Think of it as retrieving a user's chat log for a particular session. 

You provide the unique ID of the session you want to examine, and the function returns a list of messages the user contributed. The process is set up to run cleanly and logs activity based on global configuration settings.

## Function getToolNameForModel

This function helps you determine the specific name a language model will use for a tool, ensuring clear communication between your orchestration system and the AI models themselves. It takes the tool's original name, the client's ID, and the agent's name as input. The function then figures out the adjusted tool name that the model should use, based on the context of the client and agent. Essentially, it's a way to customize tool names for each agent and client interaction. You'll use this function when you need to make sure the model knows exactly which tool is being referenced.

## Function getTool

This function lets you fetch the definition of a specific tool registered within your AI agent swarm. Think of it as looking up the blueprint for a particular tool – it tells the system exactly what the tool can do and what inputs it expects. You provide the tool's name, and the function returns a detailed schema describing it. If your system is set up to track activity, this tool retrieval process will also be logged.

## Function getSwarm

This function lets you fetch the configuration details, or schema, of a specific swarm by providing its name. Think of it as looking up the blueprint for a particular group of AI agents. It’s useful for understanding how a swarm is set up and what its intended behavior is. If your system is set up to log activity, this function will record when it’s used. You just need to tell it the name of the swarm you're interested in.

## Function getStorage

This function lets you fetch details about a specific storage unit within the AI agent swarm. Think of it as looking up the blueprint or configuration for a particular storage location. You provide the name of the storage you're interested in, and the function returns all the information describing its structure and what kind of data it holds.  If logging is turned on, this retrieval process will also be recorded for monitoring purposes. It's a way to understand how your swarm is organized and where it's keeping its data.


## Function getState

This function lets you fetch a specific state definition, or schema, from the orchestration framework. Think of it as looking up the blueprint for a particular piece of information the swarm is managing. You provide the name of the state you’re interested in, and the function returns its schema. The system will also record that you requested this state if logging is turned on.


## Function getSessionMode

This function lets you check the current operational mode for a particular client’s session within the AI agent swarm. You provide the unique ID of the client session, and it returns the session's mode, which could be "session," "makeConnection," or "complete." It’s designed to safely retrieve this information, verifying the session and ensuring a clean environment for the process. Essentially, it's how you find out what stage a client session is currently in.

## Function getSessionContext

This function gives you access to the current session’s details, like who's using the system and what resources are available. Think of it as grabbing a snapshot of the environment your agent swarm is operating in. It gathers information such as the client ID, process ID, and details about available methods and execution contexts. It automatically figures out the client ID by looking at the current state, so you don't need to provide it. The function also keeps a log of its activity, if logging is turned on.

## Function getRawHistory

This function lets you access the complete, unaltered history of interactions for a specific client’s agent within the swarm. Think of it as getting the raw data before any adjustments or filtering happens. 

You provide the unique identifier for the client session, and the function returns an array containing all the messages exchanged during that session. 

It’s designed to provide a pristine view of the conversation history, making it useful for debugging or detailed analysis. The function handles the underlying complexities of accessing and retrieving this raw data, ensuring a clean and reliable process.

## Function getPolicy

This function lets you fetch the details of a specific policy that's defined for your AI agent swarm. You provide the name of the policy you're interested in, and it returns all the information associated with that policy, like its rules and configurations.  If your system is set up to log activity, this function will also record that you requested this policy. Essentially, it’s a way to get a clear view of how a particular policy is structured and what it governs within your swarm.


## Function getPipeline

This function lets you fetch a specific pipeline's blueprint – its schema – from the central system managing all the pipelines in your AI agent swarm. You simply provide the name of the pipeline you're interested in, and it returns the detailed description of how that pipeline is structured and operates. If your system is set up to record activity, this function will also log that you requested the pipeline's schema. It's a straightforward way to access the design of a pipeline within your orchestration framework.

## Function getPayload

This function helps you access the data being passed around within the agent swarm system. Think of it as a way to get the current “package” of information that the agents are working with. If there's no information currently being processed, it will return nothing.  It also quietly keeps a record of when it's used, if the system is configured to do so.

## Function getNavigationRoute

This function helps you find the path an agent has taken within a swarm, essentially showing you which agents it has interacted with. You provide the unique identifier for the client and the name of the swarm you're interested in, and it returns a list of agent names representing that route. It uses a dedicated service to perform the actual route retrieval and can optionally log this process based on system settings. Think of it as tracing an agent's journey through the swarm. 

The function requires two pieces of information: a client ID to identify the specific session and the name of the swarm you want to examine.

## Function getMCP

This function lets you fetch the blueprint, or schema, for a specific Model Context Protocol (MCP) from the system. Think of an MCP as a standardized way for AI agents to share information – this function helps you get the rules for that communication. You provide the name of the MCP you're looking for, and it returns a description of its structure. The system keeps track of these MCP schemas centrally, making it easy for agents to understand each other. If the logging is turned on, this action will be recorded for auditing or debugging purposes.

## Function getLastUserMessage

This function helps you access the last message a user sent during a specific session. It digs into the session history for a given client ID and pulls out the content of their most recent message where they were the one sending. If no user message exists for that client, it will return nothing. You provide the unique ID of the user's session to identify the history you're looking into.

## Function getLastSystemMessage

This function lets you grab the very last message sent by the system within a specific client's conversation history. Think of it as retrieving the most recent instruction or update given to the AI. 

It digs into the client's history, searches for the last message marked as coming from the "system," and returns its content. If no system messages were sent to that client, it will return nothing. You need to provide the unique ID for the client whose history you want to examine.

## Function getLastAssistantMessage

This function helps you get the last message sent by the assistant during a conversation with a specific client. It digs into the client's history to find the most recent message where the assistant was the one speaking. If the assistant hasn't sent any messages yet, it will return nothing. You just need to provide the unique ID for the client's conversation to use it.

## Function getEmbeding

This function lets you fetch the details of a specific embedding that your AI agent swarm is using. Think of it as looking up the blueprint for how an embedding works. You provide the name of the embedding you want, and the function returns all the information associated with it, like its format and size. It also keeps a record of this lookup if your system is set up to log activity.

## Function getCompute

This function lets you fetch the configuration details for a specific compute within your AI agent swarm. Think of it as looking up the blueprint for a particular worker. You provide the name of the compute you're interested in, and the function returns its schema, which defines how it operates. The system also keeps track of these requests if you've configured logging.

## Function getCompletion

This function lets you fetch a pre-defined task template, or "completion," by its name. Think of completions as blueprints for how your AI agents should work together. 

You provide the name of the completion you want, and the function will return its full definition, which describes all the steps and instructions for the agents to follow.

It also keeps a record of these retrieval requests if logging is turned on in your overall settings.



The `completionName` is the key piece of information you need to provide to get the correct completion.

## Function getCheckBusy

This function lets you quickly see if the AI agent swarm assigned to a specific client is actively working on something. You just need to provide the client's unique ID. It returns a simple true or false answer: true means the swarm is busy, and false means it's available. This is helpful for things like preventing new requests from being sent while existing ones are still processing.

## Function getAssistantHistory

This function lets you see what your assistant has said during a specific conversation. It pulls the entire chat history for a client and then filters it to only show the assistant's messages. You provide a unique ID representing the conversation, and it returns a list of the assistant's contributions. It's designed to be a straightforward way to review the assistant's responses within a particular session.

## Function getAgentName

This function lets you find out the name of the agent currently handling a specific client's session within your swarm. You provide the unique ID of the client session, and the function returns the agent's name. It's designed to work cleanly, independently of any existing processes, ensuring a reliable way to identify the agent in charge. Essentially, it's a simple way to look up the agent's identity for a given client.

## Function getAgentHistory

This function lets you see the past interactions and adjustments made for a particular agent in your swarm. It pulls the agent's history, taking into account any rescue strategies that might have been applied to improve its performance. To use it, you'll need to provide the client ID and the name of the agent whose history you want to view. The system ensures the agent and client are valid and keeps a log of the request.

## Function getAgent

This function lets you fetch the details of a specific agent within your AI agent swarm. You provide the agent's name, and it returns the agent's schema, which contains all the information about how that agent is configured and what it does. If you have logging set up, the system will record that you requested this agent's information. It's a simple way to access the configuration of individual agents in your swarm.

## Function fork

This function lets you run a piece of code—like a task for an AI agent—in a controlled environment. It takes care of setting up the necessary groundwork, such as creating a session and ensuring everything is valid, so you don't have to worry about those details. 

You provide the code you want to run (`runFn`), which will be given a unique identifier (`clientId`) and the name of the agent it’s associated with (`agentName`).  You also pass in settings (`options`) to tell the system where and how to run the code. Ultimately, the function returns the result of your code execution.


## Function executeForce

This function lets you directly send a message or command to an agent within a swarm session, acting as if it came from the client. It’s useful when you need to force an action, like inspecting an agent's output or kicking off a conversation, even if the agent isn't actively running or has changed. 

Think of it as a way to bypass typical checks and just get something done within the swarm. You provide the message you want sent and a unique ID for the client session. 

The system takes care of validating the session, tracking the performance of the execution, and ensuring everything runs cleanly with helpful metadata.

## Function execute

This function lets you send messages or commands to a specific agent within your AI agent swarm. Think of it as relaying instructions from a client application directly to an agent, useful for things like inspecting the agent's work or triggering a conversation. 

It ensures the agent you're targeting is still running and part of the active swarm session. Behind the scenes, it prepares a fresh environment for the instruction, keeps track of how the execution goes, and notifies other parts of the system about what's happening. You'll need to provide the actual message content, a unique identifier for the client making the request, and the name of the agent you want to address.

## Function event

This function lets your agents communicate with each other within the swarm. Think of it as sending a message to a specific channel – you give it a client ID to identify the sender, a topic name to specify the channel, and some data (the payload) to share. 

It ensures messages are sent cleanly and prevents you from using special, reserved channel names. 

Essentially, it’s a straightforward way to broadcast information within your agent swarm, enabling different agents to react to and process those messages. You provide the sender's ID, the topic to publish to, and the information you want to share.

## Function emitForce

This function lets you directly send a piece of text as output from the AI agent swarm, without it triggering any normal message processing or checking which agents are currently active. Think of it as a direct line to push data out. 

It's specifically intended for use with sessions started using `makeConnection`, ensuring everything works together smoothly. 

Before sending, it makes sure the session and swarm are valid and that you’re using the correct "makeConnection" setup. 

You provide the text you want to send and a unique identifier for the client session, and the function handles the rest, creating a clean environment for the operation and logging the action if logging is turned on.

## Function emit

This function lets you send information as output from an agent within the swarm, effectively simulating what an agent might produce. It's specifically designed for use when initially setting up connections within the swarm. Before sending anything, the system checks that the connection is valid, the swarm is running correctly, and that the agent you've specified is still active. It also ensures that the agent hasn’t been replaced since the connection was made.

You provide the content you want to send, a unique identifier for the client session, and the name of the agent responsible for the output. The function creates a fresh environment for the operation, logs the action if logging is turned on, and won't work if the connection wasn’t established using the standard connection setup process.


## Function commitUserMessageForce

This function lets you directly add a user's message to the agent's history within a swarm session. It’s useful when you want to record a message without immediately prompting the agent to respond.

Think of it as a way to manually update the conversation record. It doesn't worry about whether the agent is currently active; it just makes sure the message gets logged.

You provide the message content, the execution mode, and a client ID to identify the source.  You can also include additional data via a payload object. The process ensures a clean execution and hands off the actual logging to the session's public service.

## Function commitUserMessage

This function lets you record a user's message for a specific agent participating in a swarm session. Think of it as adding a note to the agent's memory without expecting an immediate reply. 

You can use it to keep a clear record of the conversation flow. It makes sure the agent remains active within the swarm and handles some behind-the-scenes checks to ensure everything is running smoothly. 

The function takes the message content, an execution mode, a client identifier, the agent's name, and optionally some extra data as input. It's designed to operate independently, making sure it doesn’t interfere with ongoing processes.


## Function commitToolRequestForce

This function lets you directly push tool requests to an agent in the swarm, even if some checks aren't normally done. It's designed to be a forceful way to ensure a request is processed, useful in specific situations. You're giving it a list of requests and a client ID to identify the session they belong to. The function then takes care of the execution environment and keeps track of what's happening.

## Function commitToolRequest

This function sends tool requests to a specific agent within your AI agent swarm. It's like giving instructions to an agent to perform a task. Before sending the request, the system checks to make sure the agent is valid and that everything is set up correctly. The process is handled carefully, ensuring that all actions are logged and that the execution environment is managed properly. You provide the requests themselves, a unique identifier for the client using the agent, and the name of the agent you want to use. The function then returns an array of strings, which represent the response from the agent.

## Function commitToolOutputForce

This function lets you directly submit a tool's output to the agent swarm, even if you're unsure if the agent is still actively participating. It's a way to ensure the output is recorded, bypassing some checks for simplicity. 

Essentially, you provide the tool's ID, the output content, and the client's ID, and the system handles the rest. This process is designed to run cleanly and is logged if enabled, ensuring reliable operation. It's a shortcut for pushing data into the swarm session.

## Function commitToolOutput

This function lets you record the results from a tool that an agent used, making sure the system knows what happened. It takes the tool's ID, the actual output from the tool, a client identifier, and the agent’s name as input. 

Essentially, it's like saving a log of what the agent did. The system verifies that the agent is still part of the active session before recording the result. It keeps things organized by ensuring the record is saved in a controlled environment and helps track tool usage within the swarm.


## Function commitSystemMessageForce

This function lets you directly push a system message into a session within the swarm, bypassing the usual checks for which agent is currently active. It's designed for situations where you absolutely need to ensure a system message is recorded, even if an agent isn't actively participating. 

Essentially, it forcefully commits the message, verifying the session and swarm first, and then adding the message. It handles all the necessary validation and logging behind the scenes. Think of it as a direct route to adding a system message, similar to the forceful assistant message commit option. You're providing the message content and the client ID to identify the session.


## Function commitSystemMessage

This function lets you send special messages directly to an agent within the swarm system. These messages aren't typical responses from the agent; they're used for things like setting up the agent or giving it instructions.

Before sending the message, the system makes sure the agent you’re targeting is valid and that you have permission to send it. 

It's designed to work alongside functions for sending regular assistant messages, but specifically handles these system-level communications. You’ll need to provide the message content, a unique identifier for the client session, and the name of the agent you're addressing.


## Function commitStopToolsForce

This function lets you immediately halt tool execution for a particular client within the swarm, bypassing normal agent checks. It's like hitting an emergency stop – useful when you need to override the system's usual processes and prevent the next tool from running.

The function verifies the client’s session and swarm before stopping the tool execution. 

Think of it as a more forceful version of stopping tools, similar to how `commitFlushForce` works compared to `commitFlush`. To use it, you simply provide the unique identifier of the client session you want to affect.


## Function commitStopTools

This function puts a temporary halt to a specific agent’s tool usage within the system. It's like putting a pause button on a particular agent's actions.

It carefully checks that you're asking to stop the right agent and that everything is set up correctly.

Think of it as a way to manage the flow of tasks for an agent, similar to how `commitFlush` manages the agent’s memory but instead of clearing it, it temporarily prevents further tools from running.

You’re telling the system, "Don't let this agent run any more tools for now," and it does so while keeping track of what’s happening and verifying everything along the way. 

It needs the client’s unique ID and the agent’s name to perform this action.

## Function commitFlushForce

This function lets you forcefully clear the agent’s memory for a particular client session. It's a way to ensure the history gets flushed immediately, even if the system doesn't think it's the right time to do so.

Think of it as a more direct way to clear the agent's history than the standard flush process. It skips some checks normally in place, guaranteeing a forceful flush.

To use it, you just need to provide the unique ID of the client session you want to affect. This function handles validating the session and swarm and keeps track of its actions through logging.

## Function commitFlush

This function helps clean up an agent's history within the swarm system. It's used to essentially reset an agent's memory, useful for tasks like restarting a conversation or troubleshooting. 

You specify which client's session and which agent’s history you want to clear by providing a client ID and agent name. 

The system carefully checks that the agent you’re referencing actually exists and that you have the right permissions before proceeding to erase the history. It keeps track of everything it does through logging. It’s a different approach than adding new messages – instead of building on the history, it wipes it clean.


## Function commitDeveloperMessageForce

This function lets you directly add a developer-created message into a session within the AI agent swarm, bypassing the usual checks to see which agent is currently handling things. It’s a forceful way to ensure a message gets added, useful when you need to override the system's typical agent selection process.

Essentially, it confirms the session and swarm are valid, then immediately commits the message you provide, regardless of whether an agent is actively engaged. 

It's designed to be like a more direct version of a standard message commit, offering a way to push messages in when needed. You provide the message content and a unique client identifier to specify where the message should be added.

## Function commitDeveloperMessage

This function lets you send messages directly to a specific agent within the AI agent swarm. Think of it as a way to inject instructions or information from a developer, rather than having them come from the system or an assistant.

Before sending the message, the system checks to make sure the agent you're targeting is valid and part of the correct session and swarm.  It keeps track of everything happening and logs the operation for monitoring.

You’ll need to provide the message content, a unique identifier for the client session, and the name of the agent you want to send the message to. This is a key tool for developers who need to influence the agents’ behavior or provide them with specific data.

## Function commitAssistantMessageForce

This function lets you push a message from an assistant directly into a session, even if the system isn't expecting it. It's a way to force a message to be recorded, bypassing typical checks about which agent is currently handling the conversation. 

Think of it as a shortcut for situations where you absolutely need to ensure a message is saved, like a recovery scenario or a specific workflow. 

It takes the message content and a client identifier to know which session it belongs to. The system verifies the session and swarm before committing, and logs all the actions performed. This function is similar to `cancelOutputForce` in how it bypasses standard checks for a more forceful action.

## Function commitAssistantMessage

This function lets you send a message generated by an AI assistant to a specific agent within the overall swarm system. It makes sure everything is set up correctly – verifying the agent, the current session, and the swarm – before actually sending the message. 

Think of it as a secure way to deliver information to an agent, with built-in checks to prevent errors and keep things organized. It’s designed to work alongside other functions, providing a way to permanently store assistant-generated messages instead of discarding them.

You’re providing the message content, a unique ID for the client session, and the name of the agent you want to send the message to. The system takes care of the rest, ensuring it’s handled correctly and logged for tracking purposes.

## Function changeToPrevAgent

This function lets you switch a client back to the agent they were using before, or to the default agent if they haven't used any others yet. It's designed to handle client sessions safely and reliably, ensuring the change happens securely and doesn't interfere with other ongoing operations. You simply provide the unique identifier for the client's session, and the system takes care of the rest, managing the transition and keeping track of the agent history.

## Function changeToDefaultAgent

This function helps reset a client session back to the standard, pre-configured agent within the swarm. Think of it as a way to quickly revert to the baseline agent for a particular user's activity. It ensures the change is handled safely and reliably by queuing it up and making sure it runs independently of what else is happening in the system. You provide the unique identifier for the client session, and the function takes care of the rest, validating everything and keeping a record of the change if logging is enabled.

## Function changeToAgent

This function lets you switch which AI agent is handling a client's session within your swarm. It’s how you tell the system to start using a different agent for a specific client.

Behind the scenes, it makes sure everything is set up correctly, keeps a record of the change if logging is turned on, and handles the switch safely with a queue and time limit. This ensures the change happens reliably, even if other things are happening within the system at the same time. To make sure the process is isolated, it runs the change outside of any existing active operations. 

You’ll need to provide the name of the agent you want to use, and a unique ID for the client session.

## Function cancelOutputForce

This function lets you abruptly stop an AI agent's work on a client's request. It’s designed to force a cancellation, even if the agent isn't actively processing the request. 

Essentially, it sends an empty response to the client, immediately halting the process. This is different from other cancellation methods because it bypasses checks to see if an agent is actually running – it just cancels. 

You'll need to provide the unique ID of the client session to identify which request to cancel. The system handles verifying the session and ensuring the swarm is valid before proceeding with the forceful cancellation, and logs the operation for tracking.

## Function cancelOutput

This function allows you to stop an agent from continuing to generate output for a particular client. It essentially tells the agent, "We don't need your response anymore."

Before doing so, it double-checks that the agent you're asking to stop actually exists and is the one expected for that client.

It handles the necessary setup and logging behind the scenes to make sure everything runs smoothly and safely within the system. 

You’ll need to provide the unique ID of the client and the name of the agent you want to cancel the output for.

## Function addWiki

This function lets you add a new wiki to the system. You provide a schema, which defines the structure and rules for that wiki, and the function will register it. Think of it as telling the system, "Hey, I want to create a wiki that looks like this." The function then returns a unique identifier for the newly added wiki, so you can refer to it later.

## Function addTriageNavigation

This function lets you set up a special tool for your AI agents, allowing them to easily connect with a dedicated triage agent when needed. Think of it as creating a direct line for agents to request help or hand off a task. You provide some configuration details, and the function handles registering the tool so it's available for your agents to use. It essentially streamlines the process of getting agents the support they require.


## Function addTool

This function lets you add new tools that agents in the system can use. Think of it as expanding the agents' capabilities – you define what the tool does, and this function makes it available for them. To make sure the tool is recognized and works correctly within the swarm, you *must* register it using this function. It ensures a clean environment when registering, and will tell you the tool’s name once it’s added. You provide a configuration describing the tool, including its name and function.

## Function addSwarm

This function lets you create a new "swarm," which is like setting up a dedicated workspace for managing a group of client sessions and the AI agents working on them. Think of it as defining the rules and structure for how those agents will interact.  You provide a schema that describes how the swarm should operate, and this function registers it within the system. Only swarms created this way are recognized, ensuring consistency and proper management. The registration happens in a controlled environment to keep things clean, and you’re given the swarm's name as confirmation that it’s been successfully created.

## Function addStorage

This function lets you register a new way for your AI agents to store and retrieve data, like memories or results. Think of it as adding a new type of database the swarm can understand. 

Only storages added using this function will be recognized by the system. If the storage is meant to be shared among multiple agents, this function also sets up the connection to that shared storage. 

It makes sure the process runs cleanly, separate from any ongoing tasks, and it gives you back the name of the storage you just added so you can reference it later. You provide a schema outlining how the storage works.

## Function addState

This function lets you define and register new states within the system, acting like a way to tell the swarm what kind of data it will be working with. Think of it as creating a blueprint for a specific piece of information the agents need. 

Only states added this way are recognized by the swarm, so it’s essential for ensuring everything works correctly. 

If a state is designated as shared, this function also handles setting up the connection to a shared state service, making sure it's ready to go. 

It’s designed to run independently, preventing interference with existing processes, and it confirms the registration by returning the state's name. The schema you provide can be updates to existing states.

## Function addPolicy

This function lets you define and register rules, or "policies," that will guide the actions of your AI agents within the swarm. Think of it as setting up guardrails for how agents operate. 

It works by taking a policy definition (the `policySchema`) and registering it with services that handle validation and management of those policies. This process ensures the policies are correctly formatted and can be applied consistently. The function also keeps a record of the policy addition through logging. It’s a crucial step in configuring your swarm, allowing you to control agent behavior proactively.

## Function addPipeline

This function lets you register a new pipeline or update an existing one within the AI agent swarm orchestration framework. Think of a pipeline as a sequence of steps your agents will follow to accomplish a task. When you call this function, the system checks your pipeline definition to make sure it's valid, and then saves it for use by your agents. You provide a schema describing the pipeline, and the function returns a unique identifier for it. If you've made changes to a pipeline, you can use this function to apply those updates.

## Function addOutline

This function lets you add or update outline schemas within the AI agent swarm. Think of an outline schema as a blueprint for how agents should structure their work – it defines the expected steps or sections.

When you use this function, it registers the new or modified schema, making it available for the swarm to use. It also makes sure the process happens in a controlled environment and creates a log entry if logging is turned on. You provide the outline schema itself as input to this function.

## Function addMCP

This function lets you define and register a new Model Context Protocol (MCP) schema. Think of an MCP schema as a blueprint that describes how an AI agent shares information and context with others in the swarm. When you call `addMCP`, you’re essentially telling the system: "Here's a new way agents can communicate with each other." The function takes the schema definition as input and returns a unique identifier for that MCP, allowing you to reference it later. This is how you expand the framework’s understanding of agent communication patterns.

## Function addEmbedding

This function lets you add new ways for the system to generate embeddings, which are numerical representations of text or other data used for tasks like finding similar content. Think of it as registering a new tool for the AI swarm to use. Only embeddings added using this function will be recognized by the system.  It ensures a fresh start for the process and returns a name to confirm the embedding has been successfully added. You provide a schema that describes how the embedding engine works.

## Function addCompute

This function lets you register a new type of task for your AI agents to perform, or update an existing one. Think of it as defining what a specific job looks like – what inputs it needs and what it produces. The function checks that the job definition is valid before adding it to the system, ensuring everything is set up correctly. You’re essentially telling the orchestration framework, "Here's a new kind of work I want my agents to be able to handle." This allows the framework to understand and assign the right agents to the right tasks.


## Function addCompletion

This function lets you add new ways for agents to generate text, like connecting to different AI models. Think of it as expanding the toolkit available to your agents. When you add a new completion engine, it's registered and validated, so it’s ready for agents to use. The registration happens in a protected environment to keep things running smoothly and the engine’s name is returned to confirm it’s been added. You provide a schema describing the new completion engine, telling the system how it works.

## Function addAgentNavigation

This function lets you set up a way for one agent in your system to easily navigate and interact with another agent. Think of it as creating a "link" or a designated path between agents. You provide some configuration details—essentially, instructions on how this navigation should work—and the function registers it, making the connection available for the agent to use. It returns a unique identifier for this navigation setup, which can be useful for tracking or managing it later.

## Function addAgent

This function lets you register new agents so they can participate in the swarm. Think of it as formally introducing a new worker to the team. By providing the agent's schema, you’re telling the system what the agent can do and how it should behave. Only agents added using this function will be recognized and usable by the swarm system. The process runs in a protected environment to keep things clean and the function confirms the registration by giving you the agent's name.

# agent-swarm-kit classes

## Class WikiValidationService

This service helps you manage and check the structure of your wikis. You can think of it as a librarian ensuring each wiki follows a specific format. 

First, you tell the service about each wiki you want to manage – its name and the rules it should follow (the schema). Then, when you have some content for a wiki, you can ask the service to verify it against the defined rules. This helps ensure consistency and validity across all your wikis. The service uses a logger to track its actions, and keeps an internal record of the wikis it's overseeing.

## Class WikiSchemaService

The WikiSchemaService helps manage and organize your wiki schemas, essentially blueprints for how your wiki content is structured. It uses a logger to keep track of what's happening and relies on a schema context service to handle schema-related tasks.

You can register new schema blueprints with unique keys, allowing you to easily identify and access them later. If a schema already exists, you can update specific parts of it using the override function.  When you need a particular schema, the get function retrieves it for you. The service also includes a shallow validation check to make sure your schemas meet basic requirements.

## Class ToolValidationService

This service helps keep track of the tools used by your AI agents, making sure they're properly configured and unique. It essentially maintains a list of registered tools and their details.

When a new tool is added, this service registers it and verifies that it doesn't already exist. 

The `validate` function checks if a tool is registered, improving the efficiency of validating tools used by agents. It also logs important information about these operations. The service works closely with other parts of the system, like tool registration and agent validation, to ensure everything runs smoothly.

## Class ToolSchemaService

This service acts as a central hub for defining and managing the tools that agents use within the system. It's like a library of pre-defined actions agents can take, ensuring they're all properly set up and working correctly.

It keeps track of each tool's details, like how to execute it and how to validate its inputs, and makes sure these details are consistent. This service works closely with other parts of the system, like the agent schema management and the services that connect to and run agents, to provide these tools where they are needed.

You can register new tools, update existing ones, or simply retrieve a tool's definition when needed. It also makes sure the tools are validated to prevent issues during agent execution, and keeps a record of these operations for monitoring and debugging.

## Class ToolAbortController

This class helps you control when asynchronous tasks are stopped prematurely. It essentially wraps the standard `AbortController` to give you a simple way to signal that something should be cancelled. 

If your environment doesn’t support `AbortController` directly, this class will gracefully handle that and won't break. 

The `abort` method is the key – calling it tells any associated operations that it’s time to stop what they're doing.

## Class SwarmValidationService

This service acts as a central point for ensuring the configurations of your AI agent swarms are correct and consistent. It keeps track of all registered swarms and their associated details, like agent lists and policies.

You can use it to register new swarms, retrieve lists of agents and policies for a specific swarm, and get a full list of all registered swarms. The core functionality lies in the `validate` method, which meticulously checks a swarm's configuration to guarantee its integrity – ensuring agents and policies are correctly defined and exist. To improve performance, validation checks are cached, so frequently used checks don't need to be repeated.  It works closely with other services to manage swarms, validate agents and policies, and handle logging.

## Class SwarmSchemaService

This service acts as a central library for managing the blueprints that define how your AI agents work together within a swarm. Think of it as a place to store and organize all the necessary information about a swarm – things like the agents involved, their roles, and any specific policies they should follow.

It makes sure these blueprints are structurally sound by performing basic checks when they're added or updated. This helps prevent errors and ensures the swarm operates smoothly.

The service keeps track of all these blueprints and makes them easily accessible to other parts of the system, such as when setting up a new swarm or coordinating agent activity. It logs its actions for monitoring, making it easier to understand what's happening behind the scenes. You can dynamically update swarm configurations, like adjusting the agent list or policies, as needed.

## Class SwarmPublicService

This service acts as the public interface for interacting with a swarm of agents. It provides methods for sending messages, navigating the agent flow, checking the swarm's status (busy or not), controlling output, retrieving agent information, and ultimately disposing of the swarm. Think of it as the front door for clients to manage and interact with their swarm.

It carefully tracks operations using logging and context scoping, ensuring everything is tied to a specific client and swarm. Methods like `navigationPop`, `waitForOutput`, and `dispose` all provide controlled access to the underlying swarm functionality. It's designed to be used by various components like ClientAgent, AgentPublicService, and SessionPublicService to coordinate and manage the swarm's lifecycle.

## Class SwarmMetaService

This service is responsible for organizing and visualizing information about your agent swarms. It takes the raw details of a swarm – its structure, agents, and connections – and transforms them into a clear, standardized format that can be represented as a UML diagram.

Think of it as a translator that converts your swarm's internal data into a visual blueprint. It pulls data from other services to build a tree-like representation of the swarm, then uses that tree to create a UML string, which can then be used to generate diagrams. 

It works closely with other parts of the system, like the services that manage agent definitions and documentation, ensuring everything is consistent and easy to understand. This helps with both debugging and creating system documentation.

## Class SwarmConnectionService

This service acts as a central hub for managing connections and interactions with AI agent swarms. Think of it as the conductor of an orchestra, ensuring everything runs smoothly.

It intelligently caches swarm instances to avoid unnecessary setup, making things faster and more efficient.  It works closely with other services to handle agent execution, communication, and configuration.

Here's a breakdown of what it does:

*   **Getting Swarms:** It fetches or creates pre-configured swarms based on client and swarm names.
*   **Communication:** It allows you to send messages to the swarm and retrieve output from active agents.
*   **Navigation:** It helps you move between agents within a swarm, and handles cases where you need to go back a step.
*   **Status Updates:** It provides a way to check if a swarm is busy processing something, and to adjust that status.
*   **Agent Management:** It lets you access and modify the active agent within the swarm.
*   **Cleanup:** When you're done, it cleans up the swarm connection to release resources.



The service keeps track of all these actions through logging, helping with debugging and monitoring. It's designed to work seamlessly with various parts of the system, ensuring consistent behavior and efficient performance.

## Class StorageValidationService

This service helps ensure that the storage systems used by your AI agent swarm are set up correctly and consistently. It keeps track of all registered storage systems and verifies their configurations.

You can register new storage systems with this service, and it will make sure each one is unique. When you need to confirm a storage system is ready, the service checks for its existence and validates any associated embedding information. To avoid unnecessary checks, it remembers previous validation results for faster performance. The service relies on other components, like logging and schema validation, to work properly.

## Class StorageUtils

This class helps manage how data is stored and accessed for individual clients and agents within the swarm. It provides tools for retrieving, updating, deleting, and listing data, ensuring that agents are properly authorized to interact with specific storage areas.

You can use it to fetch a limited number of data items that match a search term, or to insert or update data associated with a client and agent. It's also possible to remove individual items, retrieve a specific item by its ID, or list all items in a particular storage area.

Additionally, the class allows you to create numeric indexes for storage and clear all data from a storage area, with appropriate validation and logging built in. Essentially, it provides a controlled and secure way to handle data storage for the entire agent swarm.

## Class StorageSchemaService

This service acts as a central hub for managing how your agents store and access data. It keeps track of storage configurations, ensuring they’re set up correctly and consistently. Think of it as a librarian for your agent's data storage needs.

It carefully validates these storage configurations before they're used, making sure the rules for indexing and embedding data are in place. It works closely with other services that handle storage connections, agent schemas, and public storage access.

You can register new storage configurations, update existing ones, or simply retrieve a configuration when needed. The whole process is logged to help with troubleshooting and monitoring. It provides essential storage settings, such as how to index data or references to embedding definitions, which are critical for client-specific and shared storage instances within the swarm.

## Class StoragePublicService

This service manages storage specifically for individual clients within the system. Think of it as a way to keep each client's data separate and organized. It builds upon the underlying storage connection service, adding client-specific scoping and logging to ensure operations are tracked and secure.

It provides common storage actions like retrieving, adding, updating, deleting, listing, and cleaning out data – all tied to a particular client.  This contrasts with system-wide storage, providing a focused way to manage client-specific data. 

The service utilizes logging for tracking activity, and integrates with other components such as ClientAgent, PerfService, and DocService to handle data management and performance monitoring for each client.  It's designed to be a secure and organized way to deal with client-specific storage needs within the swarm.

## Class StorageConnectionService

This service manages how your AI agents interact with different storage locations, like databases or file systems. It's designed to be efficient and track usage.

Think of it as a central hub. When an agent needs to read, write, or manage data, it comes through here. It intelligently reuses storage connections to avoid unnecessary setup and ensures that shared storage isn’s accidentally cleaned up.

Here’s a breakdown of what it does:

*   **Connects to Storage:** It handles the details of connecting to different storage systems, based on configuration.
*   **Memoization:** It remembers which storage locations are already in use, so it doesn't have to reconnect every time.
*   **Shared vs. Private Storage:** It distinguishes between storage used by all agents and storage specific to a single agent.
*   **Tracks Usage:** It keeps tabs on how much storage is being used for billing or monitoring.
*   **Provides Core Operations:** It offers common storage operations like getting, putting, deleting, and listing data.
*   **Logging and Monitoring:** It records what’s happening for debugging and performance tracking.



Essentially, this service makes interacting with storage easier and more efficient for your AI agents.

## Class StateValidationService

This service helps ensure the data your AI agents are working with is consistent and follows a defined structure. Think of it as a quality control system for your agents’ state.

You start by defining the expected format for each state your agents use – this is done using `addState`, which registers the state's name and its structure. Then, when your agents update their state, you use the `validate` function to check if the new data matches the expected structure. This helps prevent errors and ensures everyone’s on the same page. The service also includes a logger for tracking any validation issues. The internal `_stateMap` keeps track of all registered states and their associated schemas.

## Class StateUtils

This class helps manage the data associated with individual clients and their interactions with agents within the swarm. It provides simple functions to fetch, update, and reset this client-specific information. 

You can use these functions to get a client's current state, to update that state—either with a new value directly or by providing a function that calculates it based on what’s already there—and to completely erase a specific piece of client data. Before any of these actions happen, the system verifies that the client is authorized and that the agent involved is properly registered, ensuring everything is secure and controlled. Each operation is also tracked for logging purposes.

## Class StateSchemaService

The StateSchemaService acts as a central place to manage and keep track of the blueprints for how agents handle data, ensuring everyone is using the correct structure. It’s like a librarian for agent state configurations.

It uses a registry to store these blueprints, making it easy to find and use the right one. Before adding a new blueprint or updating an existing one, it performs a quick check to make sure it's structurally sound.

This service is deeply connected to other parts of the system, providing the state information used by agents, how they connect to states, and how those states are made available publicly. It also keeps a log of what’s happening, which helps with debugging and understanding how the system is working. Think of it as the foundation for defining the "rules of the game" regarding how agents interact with and store data.

## Class StatePublicService

This class manages state specifically for each client interacting with the swarm system. Think of it as a way to keep track of information unique to a particular client, distinct from system-wide data or persistent storage.

It provides simple methods to set, clear, retrieve, and dispose of this client-specific state. These actions are wrapped to ensure proper context and are logged for debugging purposes, if enabled.

The class relies on other services for its core functionality (like state connection and logging) and is used by components like the ClientAgent and PerfService to handle client-specific operations and track performance. It's designed to be a clean, controlled way to manage individual client data within the larger swarm.

## Class StateConnectionService

This service manages how agents store and interact with their state within the system. Think of it as the central hub for state information, ensuring that each agent’s data is handled consistently and efficiently.

It keeps track of different states for each client, and if a state is meant to be shared across multiple clients, it delegates that responsibility to a separate shared state service. To make things fast, it caches often-used states to avoid unnecessary reloading. 

When you need to get, set, or clear an agent's state, this service handles it, making sure that any changes are logged and handled safely. When an agent is finished, the service cleans up the resources, freeing them for other uses. Basically, it's the behind-the-scenes engine that keeps all the agent data organized and available.

## Class SharedStorageUtils

This class provides a set of tools for interacting with the shared storage used by your agent swarm. Think of it as a way to manage data that all agents can access and share.

You can use it to fetch data based on a search query, insert or update data, remove specific items, retrieve individual items by their ID, list all items (with the ability to filter them), and even clear out the entire storage.

Before any action is taken, the system verifies that the storage name you're using is valid, ensuring data integrity and proper logging. This makes it a reliable and safe way to manage your swarm’s shared data.

## Class SharedStoragePublicService

This class acts as the public gateway for interacting with shared storage across the system. It handles common operations like retrieving, updating, deleting, listing, and clearing data from shared storage. Think of it as a controlled way for different parts of the system, like client agents or performance monitoring tools, to access and manage shared data.

It relies on other services for its functionality – a logger for recording actions and a connection service to actually interact with the storage itself.  Each operation it performs is wrapped to ensure proper context and logging, and it's designed to work consistently with other services in the system, such as those used for client agent tasks or performance tracking.

Here's a quick rundown of what it lets you do:

*   **Retrieve data:** Find a list of items based on a search query, or get a specific item by its ID.
*   **Update or insert data:** Either add a new item or modify an existing one in shared storage.
*   **Delete data:** Remove a specific item from the storage.
*   **List all data:** Get a list of everything currently in the storage, optionally filtering the results.
*   **Clear the storage:**  Remove all items from the storage entirely.



It’s built with the idea that all storage interactions should be transparent, logged when appropriate, and tightly controlled within the system's architecture.

## Class SharedStorageConnectionService

This service manages shared storage, acting as a central hub for data across different parts of the system. Think of it as a common, persistent storage area that everyone can access.

It uses a clever caching system to ensure that there's only one instance of each shared storage area, which helps avoid confusion and ensures consistency. It’s designed to work closely with other services like the logging system, event bus, and schema services to make sure everything works together smoothly.

The `getStorage` method is key - it's how you actually get access to a shared storage area.  The `take`, `upsert`, `remove`, `get`, `list`, and `clear` methods are familiar data manipulation operations performed on the shared storage. Essentially, they provide a way to read, write, and manage the information within these shared storage areas.

## Class SharedStateUtils

This class provides easy ways to interact with the shared memory used by your agents. Think of it as a central whiteboard where agents can leave notes and updates for each other.

You can use `getState` to read information that’s been written to the whiteboard, `setState` to write new information or update what’s already there—either by providing a new value directly or by providing a function to calculate the new value based on what’s already present—and `clearState` to erase a particular piece of information from the whiteboard. These functions handle logging and communication with the underlying shared state system, so you don't have to worry about those details.

## Class SharedStatePublicService

This service provides a way for different parts of the system to share and manage data, making sure everyone has access to the information they need. It acts as a middleman, handling requests to read, write, or clear shared data. The service logs actions to keep track of what’s happening and ensures that operations are performed within a specific context. It's designed to work with various components like ClientAgent and PerfService, allowing them to easily update and retrieve shared information. You can use it to set new values, reset existing ones, or simply check the current status of the shared data.

## Class SharedStateConnectionService

This service manages how different parts of the swarm system share and update data. Think of it as a central place where agents can all access and modify the same information, ensuring everyone is working with the most current version.

It keeps track of these shared data instances, making sure there's only one copy used across all clients. When you need to access or change this data, it uses a clever caching system to make things fast and efficient.

Updates to the shared data are carefully handled to prevent conflicts, and the system keeps a log of what’s happening. The service works closely with other components to configure the shared data and manage its lifecycle, including the ability to completely reset it to a starting point. It’s designed to be reliable and predictable, ensuring smooth communication and coordination within the agent swarm.

## Class SharedComputeUtils

This utility class, `SharedComputeUtils`, helps manage shared computing resources within the agent swarm. Think of it as a central point for interacting with and querying those resources. 

You can use the `update` function to refresh the state of a specific compute resource; it's useful when you need to ensure you have the latest information. 

The `getComputeData` function is your go-to for retrieving data related to a particular compute resource, letting you specify what kind of data you're expecting to receive. It takes a client ID and the compute name to pinpoint the data you need.

## Class SharedComputePublicService

This component handles managing and interacting with shared computing resources, allowing for context-aware execution of tasks. It relies on injected services for logging and managing compute connections. 

You can use it to retrieve pre-calculated data using `getComputeData`, which allows you to access results from previous computations within a specific method. It also provides a way to trigger a fresh calculation using `calculate` or to force an update of the shared compute using `update`, both of which operate within the context of a particular method and compute name. Essentially, it provides the tools to manage and refresh shared compute instances when needed.

## Class SharedComputeConnectionService

This class helps manage connections to shared computing resources within the agent swarm. Think of it as a central hub for agents to access and share their work. 

It keeps track of various services like logging, message passing, and managing state, all essential for coordinated action. 

The `getComputeRef` method lets agents easily grab a reference to a specific compute resource by name, allowing them to interact with it. `getComputeData` provides access to the results of any ongoing computations.  The `calculate` method triggers a computation process related to a specified state, while `update` refreshes the current state.

## Class SessionValidationService

This service acts as a central manager for sessions within the agent swarm system, keeping track of how different resources – agents, storage, states, and computes – are being used by each session. Think of it as a librarian, ensuring everything is properly associated and accounted for.

It registers new sessions and their associated details like swarm and mode, and keeps records of which agents, storages, states, and computes are being used by each session. When a session is finished, it cleans up those associations.

The service logs important actions to aid in debugging and monitoring, and uses techniques like memoization to make checks faster. It integrates closely with other services within the system to manage sessions, track resource usage, and ensure everything runs smoothly. It allows services like the session manager, client agent, and swarm schema service to interact with sessions in a controlled and consistent way. It can quickly confirm if a session exists and retrieve details like which agents or computes are associated with a session.

## Class SessionPublicService

This class manages how clients interact with the AI agent swarm sessions. Think of it as the public interface for sending messages, running commands, and generally controlling a session within the swarm.

It handles messages and commands by delegating to lower-level services, but adds extra context and logging to keep track of what's happening.

Here's a breakdown of what it does:

*   **Messaging:** It lets you send messages (`emit`, `notify`) and commit different kinds of messages like system messages or developer messages to the session's history.
*   **Execution:** It allows you to execute commands (`execute`, `run`) or run stateless completions within the session.
*   **Connection Management:**  You can connect to a session (`connect`) and disconnect it (`dispose`) to establish and terminate communication.
*   **Tool Control**: The class allows to commit tool requests and stop tools from being executed in a session.
*   **Logging & Tracking:**  It meticulously logs activity and tracks performance metrics, helping you understand and optimize session behavior.



Essentially, this class provides a user-friendly way to interact with AI agent swarm sessions while ensuring proper context, tracking, and event handling.

## Class SessionConnectionService

This service manages connections to individual AI agent sessions within a larger swarm system. Think of it as a central point for creating, accessing, and controlling these sessions, ensuring efficient reuse and consistent behavior. It's responsible for handling communication, executing commands, and managing the lifecycle of each session.

When a session is needed, this service efficiently retrieves it from a cache, preventing redundant setup. It works closely with other components to handle tasks like applying policies, accessing swarm data, and tracking performance.

You can use this service to:

*   **Create sessions:** Get a new session for a client and swarm.
*   **Send notifications:** Relay messages to connected listeners.
*   **Execute commands:** Run specific actions within a session.
*   **Communicate with agents:** Send and receive messages to/from the agents within the session.
*   **Commit messages:** Record interactions, including user inputs, assistant responses, and tool requests.
*   **Clean up sessions:** Properly release resources when a session is no longer needed.

Essentially, it's the glue that connects everything for individual AI agent interactions within the overall swarm environment.

## Class SchemaUtils

This class provides helpful tools for managing data related to client sessions and formatting information. You can use it to store and retrieve data associated with individual clients, ensuring session validity along the way. It also includes a method to convert objects or arrays of objects into strings, which is useful for sending data or storing it in a readable format, offering flexibility with optional key and value mapping.

## Class RoundRobin

This component, called RoundRobin, provides a simple way to rotate through a list of functions, ensuring each one gets a turn. Think of it like a queue for your different AI agents or processes. 

You define a set of "tokens," which are identifiers linked to specific functions you want to execute sequentially.  The RoundRobin then cycles through these tokens, calling the linked function each time. 

The `create` method is key: it's how you build a RoundRobin instance, associating tokens with their corresponding function creators. It’s a straightforward way to distribute work across a pool of resources.

## Class PolicyValidationService

This service helps ensure that the policies used by your AI agent swarm are valid and consistent. It keeps track of all registered policies and their details, making sure each one is unique.

When a new policy is added, this service registers it and logs the action.

The validation process checks if a policy exists before it's used, improving efficiency through a performance optimization technique called memoization. The service also relies on logging to track its actions and any errors that occur. It works closely with other parts of the system, like the policy registration and enforcement components, to keep everything running smoothly.

## Class PolicyUtils

This class helps manage client bans across your AI agent swarm, making sure everything is handled correctly and tracked. It provides simple methods for banning, unbanning, and checking if a client is currently banned. Before taking action, the class carefully verifies the client ID, swarm name, and policy involved, then passes the request to the underlying policy system for actual execution, while logging relevant information along the way. Think of it as a controlled interface for managing who is allowed into your AI agent swarm based on your defined policies.

## Class PolicySchemaService

This service acts as a central hub for managing the rules (policies) that govern how our AI agents operate within the swarm. It stores and organizes these rules, ensuring they're valid and accessible to various components of the system. Think of it as a rulebook for the agents, ensuring everyone follows the same guidelines.

When a new rule is added or an existing one is changed, this service validates it to make sure it's correctly formatted. It keeps track of these rules using a special storage system and makes them available to other services responsible for enforcing them – like the connection service and the agents themselves. The whole process is logged to help track changes and troubleshoot issues. It’s designed to allow policy updates dynamically, so the swarm can adapt to new requirements quickly.

## Class PolicyPublicService

This service acts as a central point for managing policy-related actions within the agent swarm system. It provides a simplified way to check if a client is banned, retrieve ban messages, validate data entering or leaving the system, and directly ban or unban clients.

The service relies on other components like the logging service and policy connection service to handle the underlying operations and provides a consistent way to log activity when logging is enabled. You can use it to verify if a client is blocked, understand why, ensure data complies with defined policies, and directly manage client access based on those policies. It's a key component for ensuring consistent and controlled interaction within the swarm.

## Class PolicyConnectionService

This service is the central hub for managing how policies are applied within your swarm system. Think of it as the traffic controller for policy enforcement, ensuring agents adhere to defined rules. It's designed to be efficient, caching frequently used policy configurations to avoid unnecessary work.

Here's a breakdown of what it does:

*   **Policy Retrieval:** It fetches and caches policy details, like allowed input/output and ban status.
*   **Ban Management:** It can check if a client is banned, retrieve ban messages, and enforce bans or removals.
*   **Input/Output Validation:** It verifies that data going in and out of the system complies with policy guidelines.
*   **Integration:** It works closely with other components like agent execution, session management, and public APIs to maintain consistent policy enforcement.
*   **Logging & Configuration:** It’s designed to be configurable and informative, with detailed logging capabilities for troubleshooting.

## Class PipelineValidationService

This service helps ensure your AI agent pipelines are set up correctly before they run. Think of it as a quality control system for your workflows. 

It lets you register different pipeline configurations, defining what they should look like with the `addPipeline` method. Then, using the `validate` method, you can check a pipeline's configuration against its defined structure, verifying everything is in order based on the provided source. The service uses a logger to keep track of what it’s doing and provides feedback on any issues it finds, making it easier to debug and maintain your AI agent setups.

## Class PipelineSchemaService

This service is responsible for managing and providing access to pipeline schema definitions. Think of it as a central place to store and retrieve blueprints for how your AI agents will work together.

It uses a schema context service to handle schema-related tasks like validation. 

You can register new schema definitions, update existing ones, and easily retrieve them when needed. The service keeps track of these definitions, allowing you to reuse and organize your agent workflows effectively.

## Class PersistSwarmUtils

This class helps manage the state of your AI agent swarms – specifically, which agent is active for each user and the history of agent transitions. It acts like a memory for your swarm, letting you track what's happening.

You can think of it as a central place to store and retrieve information about which agent a user is currently using and the sequence of agents they're navigated through. It remembers this information based on a unique identifier for the user (clientId) and the specific swarm they are interacting with (swarmName).

The class uses specialized "adapters" to handle the actual storage – meaning you can choose where this information is saved (like a database, or even just in memory) and customize how it's done. If you don't specify an adapter, it uses a default storage mechanism.

It provides simple functions to get and set the active agent for a user in a specific swarm, and to manage the "navigation stack" - a list of agents a user has visited. This allows for easy switching between agents and the ability to trace the user's journey.

## Class PersistStorageUtils

This class helps manage how data is saved and retrieved for each user and storage type within the system. Think of it as a central place to handle persistent information.

It uses a smart caching system (`getPersistStorage`) to make sure we don’t create unnecessary storage instances, saving resources.

You can easily get data (`getData`) that’s already stored, or use a default value if nothing is there.  Similarly, `setData` lets you save data for later use.

If you need more control, `usePersistStorageAdapter` allows you to plug in your own custom storage solutions.

## Class PersistStateUtils

This class helps manage how information is saved and retrieved for each agent in the swarm. It allows the system to remember things like agent variables or context, ensuring that agents can pick up where they left off.

The class uses a clever trick to make sure each type of information (identified by a `StateName`) only uses one persistence mechanism, which helps keep things efficient. 

You can even customize how the data is stored – for example, using an in-memory store or a database – by providing your own storage constructor. 

The `setState` method is used to save information for a specific agent, while `getState` retrieves that saved information, providing a default value if nothing has been saved yet.

## Class PersistPolicyUtils

This class helps manage how policy data, specifically lists of banned clients, is saved and retrieved within the swarm system. Think of it as a tool for keeping track of which clients are restricted in each swarm.

It offers a way to get the current list of banned clients for a particular policy and swarm, and another way to update that list, ensuring the changes are saved for later use.

You can even customize how the data is stored – for instance, you might want to use a database instead of simple file storage – and this class lets you plug in your own storage mechanism. The system tries to be efficient by making sure only one persistence instance is used per swarm.

## Class PersistMemoryUtils

This utility class helps the system remember information specific to each client session. It handles saving and retrieving that information using a flexible persistence mechanism.

Think of it as a way to give each client their own little notebook where the system can jot down details and later refer back to them.

The class ensures that each client only has one persistence instance used, which helps keep things efficient. You can even customize how this memory is stored, like using a database instead of just temporary storage. 

There are methods to set the memory, retrieve it (with a default backup if nothing's been saved), and clean up when a session is over.

## Class PersistEmbeddingUtils

This utility class helps manage how embedding data is stored and retrieved within the swarm system. It allows you to define how embeddings are persisted – whether that’s in memory, a database, or some other custom method.

The class keeps track of embedding data, making sure that the same embedding isn't recomputed unnecessarily by caching results. You can use a pre-defined storage or bring your own persistence mechanism by customizing the embedding storage constructor.

It's designed to optimize resource usage by ensuring only one persistence instance is used for each type of embedding data. When you need to access an embedding, it first checks the cache; if it’s not there, it will be retrieved from the configured storage.

## Class PersistAliveUtils

This class helps keep track of which clients (identified by a SessionId) are online and available within a swarm. It provides simple ways to signal when a client becomes online or offline, and to check their current status. Think of it as a central registry that ensures the swarm knows who’s participating.

To optimize performance, the system remembers a single storage location for each client’s alive status.  You can also customize how this tracking happens by providing your own persistence mechanism, allowing for more advanced setups like in-memory storage or integration with a database. This gives you flexibility in how you manage and store client availability information.

## Class PerfService

The `PerfService` class meticulously tracks performance data for client sessions within your system, acting like a behind-the-scenes performance monitor. It gathers information on how long tasks take, the size of data exchanged, and the state of client sessions, compiling this data into structured records.

Think of it as a data collector that plugs into your ClientAgent workflows (like "execute" or "run") to measure performance and provide insights. It's powered by various services to retrieve data, and uses logging to record important events (if enabled).

The `PerfService` helps you understand the performance characteristics of your clients, provides insights into bottlenecks, and offers data for reporting and analysis. It carefully records start and end times for each execution, allowing it to calculate response times, track data sizes, and aggregate overall performance metrics.

When needed, it can be shut down for individual clients to clear accumulated data and reset tracking. It integrates various services for validation and state computation, and serializes performance data into structured records that can be used for reporting and analysis.

## Class OutlineValidationService

This service helps ensure that the blueprints (called outlines) used by the agent swarm are well-defined and consistent. It keeps track of all registered outlines, making sure each one has a unique name.

When you add a new outline, this service registers it and prevents duplicates. You can also easily get a list of all registered outline names. 

The core function is validating outlines—it checks if an outline exists and throws an error if it doesn't. This process is optimized for speed by remembering the results of previous validations. It relies on other services to handle logging and completion checks, which helps keep things organized and efficient.

## Class OutlineSchemaService

This service helps manage the blueprints, or outlines, used by the agent swarm. It keeps track of these outlines, allowing you to add new ones, update existing ones, and easily retrieve them when needed. Think of it as a central library for outlining structures that the agents use to organize their work.

The system automatically logs important activities like adding or changing outlines, and it ensures that new outlines meet certain standards before being added. The system also allows to easily integrate with existing logging and schema management tools. 

It stores these outlines internally and uses a special registry to keep everything organized, letting you work with outlines by name.

## Class OperatorInstance

This class represents a single instance of an operator within your AI agent swarm. Think of it as a worker assigned to a specific agent and identified by a client ID and a name. 

When you create an `OperatorInstance`, you’re essentially setting up a connection point for that agent to communicate and receive instructions. You can provide optional callback functions to customize how the instance handles certain events.

Key actions you can perform with an `OperatorInstance` include sending notifications, submitting answers, receiving messages, and finally, safely shutting it down with the `dispose` method. The `connectAnswer` method is used to subscribe for receiving answers from the operator.

## Class NavigationValidationService

This service helps manage how agents move around within the swarm, preventing them from repeatedly visiting the same spots. It keeps track of where agents have already been, which makes navigation more efficient.

The service uses a logging system to record what’s happening during navigation and employs a technique called memoization to remember previously calculated routes, speeding things up.

You can start fresh with a client's navigation route using `beginMonit`, and clean up routes that are no longer needed with `dispose`. The `shouldNavigate` function decides whether an agent should move to another based on whether it has already been visited. Finally, `getNavigationRoute` lets you access the recorded route information, and is optimized to avoid recalculations.

## Class NavigationSchemaService

This service helps keep track of which navigation tools are being used within the system. It maintains a list of registered tool names, allowing you to easily check if a specific tool is recognized. When you register a new navigation tool, the service records this action, providing visibility into which tools are active. Similarly, when you check if a tool exists, that check is also logged for informational purposes. It’s a straightforward way to manage and monitor the navigation tools your agents are utilizing.

## Class MemorySchemaService

This service manages temporary, in-memory storage for each session within the swarm system. Think of it as a simple notepad for each session, allowing you to store and retrieve data associated with a specific session ID. It's designed to be lightweight and doesn't persist data – once the session ends, the data is gone.

You can use it to store anything you need for a particular session, like configuration settings or temporary results, and it integrates with other services to track its activity. It provides straightforward methods to put information in, retrieve it, and clear it out when a session is finished. Essentially, it’s a convenient way to keep track of session-specific information without needing a more complex database solution.

## Class MCPValidationService

This service helps you keep track of and make sure your Model Context Protocols (MCPs) are set up correctly. Think of it as a librarian for your MCPs, keeping them organized and checking their validity. 

It uses an internal record to store your MCP schemas, identified by a unique name. You can add new MCP schemas to this record, and it provides a way to verify that a specific MCP exists and is properly configured. 

A logger is used to track what’s happening, so you can see any errors or important events related to MCP management.

## Class MCPUtils

This class, MCPUtils, helps manage updates to the tools used by your clients connected through the Multi-Client Protocol (MCP). Think of it as a way to ensure everyone is using the latest and greatest versions of the tools they need. You can use it to push updates to all your clients simultaneously, or target a single client specifically. Essentially, it simplifies the process of keeping your clients’ tools synchronized.

## Class MCPSchemaService

This service helps manage the blueprints, or schemas, that define how different AI agents understand and share information – we call them Model Context Protocols (MCPs). It acts as a central place to register new schema definitions, update existing ones, and easily find the schema you need.

The service keeps track of all registered schemas in a registry and relies on a logger for tracking activity. It also works closely with a schema context service to handle the underlying management of these schemas. 

You can use this service to add new schema types, modify existing ones with updated information, and retrieve the schema associated with a particular name. Essentially, it provides a way to organize and control the structure of communication between your AI agents.

## Class MCPPublicService

This class provides a way to interact with and manage tools within a system that uses the Model Context Protocol. Think of it as a control panel for your AI agents' capabilities.

You can use it to see a list of available tools, check if a particular tool is available for a specific agent, and actually run those tools. It also lets you update the list of tools available to agents, either for all of them or just one at a time, and properly clean up resources when done. 

Essentially, it provides a structured way to control and orchestrate the tools used by your AI agents. It relies on injected services for logging and handling the underlying MCP communication.

## Class MCPConnectionService

The MCPConnectionService helps manage connections and interactions with different AI models using a standardized protocol. Think of it as a central hub for your AI agents.

It keeps track of available tools for each agent, allowing you to easily list what's available, refresh those lists, and check if a specific tool exists.

When you want an agent to perform a task, this service handles calling the appropriate tool with the necessary information and returning the result.

It also cleans up resources when an agent is finished, ensuring efficient operation. The service relies on other components for logging, communication, and managing the details of the AI models themselves.

## Class LoggerService

This class provides a centralized way to handle logging within the agent swarm. It manages different levels of logging – normal, debug, and informational – and ensures messages are sent to both a general system logger and a client-specific logger when available.

It’s designed to automatically add helpful context to each log message, like the client ID and the method being executed, making it easier to track down issues. You can control which types of logging are active through global configuration settings.

The system is flexible too – you can swap out the common logger at any time, allowing for things like redirecting logs to a file for detailed analysis or using a mock logger during testing. Essentially, it provides a consistent and configurable way to keep track of what’s happening throughout the agent swarm’s operation.

## Class LoggerInstance

This class manages logging for a specific client, letting you customize how log messages are handled. When you create a logger, you provide a client ID and some optional callbacks to control its behavior. 

You can control whether messages appear in the console through a global configuration setting. The `waitForInit` method ensures the logger is properly set up, and it only runs the initial setup once. 

The `log`, `debug`, `info`, and `dispose` methods allow you to record messages, handle debugging information, and clean up the logger when it's no longer needed, potentially triggering custom callbacks during these actions. It's a straightforward way to keep track of what’s happening within your clients while integrating with a central configuration for console logging.

## Class HistoryPublicService

This service manages how history information is accessed and handled within the swarm system. It acts as a central point for interacting with agent history, providing a public-facing API that’s carefully controlled and logged.

It relies on other services to do its work—like a logger for recording actions, and a core history connection service for the actual data manipulation.  You're able to add messages to the history, retrieve the most recent message, get the history as an array for processing or documentation, and completely clear the history when it’s no longer needed.

Each of these operations is tracked and handled within a specific context, allowing for controlled access and detailed logging whenever enabled. Different parts of the system – like agents, public services, and performance tracking – all utilize this service for consistent and manageable history interactions.

## Class HistoryPersistInstance

This component keeps track of the conversation history for an AI agent, saving messages both in memory and on disk for later retrieval. When you create an instance, it’s tied to a specific client ID and can be configured with callback functions to respond to different events like adding, removing, or disposing of messages.

The `waitForInit` method sets up the history for an agent, loading any previously saved data. To see the conversation history, you can use the `iterate` method, which allows you to go through messages one by one, optionally applying filters. Adding a new message is done through the `push` method, ensuring it’s both added to the ongoing conversation and saved persistently. To remove the last message, use `pop`.  Finally, `dispose` is used to clear the history, either for a specific agent or globally.

## Class HistoryMemoryInstance

This component acts as a temporary memory for your AI agents, storing conversation history in its immediate memory without saving it permanently. When you create an instance, you provide a unique identifier for the agent and can optionally supply functions to be triggered during key operations.

It handles the initial setup of the agent's history, and provides a way to loop through previous messages, filtering or modifying them as needed. You can add new messages to the history, and remove the most recent one. Finally, it allows you to completely clear the history, either for a specific agent or for all agents managed by this instance. It ensures that the initialization happens only once per agent.

## Class HistoryConnectionService

This service manages the history of interactions with individual agents within the swarm. Think of it as keeping track of what's been said and done during an agent's execution.

It efficiently reuses history information, avoiding redundant creation by caching instances for each client and agent. This caching is handled automatically, so you don’t have to worry about it.

The service logs activities when enabled and keeps track of history usage for monitoring purposes. It works closely with other services to manage agent history, ensure security and handle events related to history changes.

You can retrieve a history instance for a specific client and agent, push new messages into the history, retrieve the latest message, convert the history to an array format, or completely dispose of the history when it's no longer needed. All these operations are designed to be consistent with how other parts of the swarm system work.

## Class ExecutionValidationService

This service helps manage and validate how many times an AI agent swarm is being used. It keeps track of execution IDs for each client and swarm to prevent issues caused by too many nested runs. 

You can use it to get a snapshot of current execution counts, increase those counts as executions happen, or decrease them when an execution finishes.  If you need to completely reset the execution count for a client and swarm, you can flush the data.  Finally, `dispose` allows you to clear the cached execution counts entirely, removing the memoized entry.


## Class EmbeddingValidationService

This service keeps track of all the embedding names used within the system, ensuring they are unique and properly registered. It’s like a central registry for embeddings, preventing errors when agents or clients try to use them.

You can add new embeddings to this registry, and it ensures no duplicates are added. The service also validates whether an embedding exists when it's being used, which is important for reliable similarity searches.

To make things faster, it uses a technique called memoization so it doesn't have to re-check embeddings it has already validated. The service keeps a log of what it’s doing, and relies on other services to manage embedding schemas and handle client storage requests.

## Class EmbeddingSchemaService

This service manages how your agents understand and work with embeddings – think of embeddings as numerical representations of data that allow agents to find similar items. It acts as a central place to store and retrieve these "embedding blueprints," ensuring they're set up correctly.

When you add a new embedding blueprint, this service first checks that it's structurally sound. It keeps track of these blueprints using a special registry, making it easy to find the right one when needed.

You can also update existing blueprints, and retrieve them easily for use by other parts of the system, particularly those dealing with storage and agent logic. The system will log important operations for debugging purposes, but only if that logging feature is turned on.

## Class DocService

This class is responsible for generating documentation for the entire system, including swarms, agents, and their performance data. It creates Markdown files describing schemas and UML diagrams, and JSON files for performance metrics.

It pulls information from various services to build the documentation, like schemas for swarms and agents, and details about tools, prompts, and policies. The process is logged based on configuration, and utilizes a thread pool to handle multiple documentation tasks simultaneously.

Key functions include:

*   `writeSwarmDoc`: Creates documentation for a specific swarm, outlining its structure, agents, and policies.
*   `writeAgentDoc`: Creates documentation for an agent, detailing its functionality and components.
*   `dumpDocs`: Generates documentation for all swarms and agents.
*   `dumpPerfomance`: Exports system-wide performance data.
*   `dumpClientPerfomance`: Exports performance data for a particular client.

The overall goal is to provide clear, organized, and visually informative documentation for developers working with the AI agent orchestration framework.


## Class ComputeValidationService

This service helps manage and check the configuration of different computational units within your AI agent swarm. Think of it as a central place to ensure everything is set up correctly. 

It keeps track of the schemas for each computational unit – what data they expect and how they should be structured. You can add new computational units by registering their schemas. 

The core function is validation. You give it the name of a computational unit and a source of data, and it checks if the data conforms to the unit's defined schema. This helps catch errors early and ensures smooth operation of your agent swarm. 

Internally, it utilizes logging and state validation services to keep things organized and reliable.

## Class ComputeUtils

This class, `ComputeUtils`, provides tools for managing and retrieving information about computational resources within the agent swarm. You can think of it as a helper for keeping track of what computing tasks are running and where.

The `update` method allows you to signal that a particular compute task, identified by a client ID and compute name, has been updated or completed. 

The `getComputeData` method lets you request specific data about a compute task. It's flexible because you can define the type of data you expect when you call it, ensuring you receive exactly what you need.

## Class ComputeSchemaService

This service is responsible for managing and providing access to different schema definitions used within the agent swarm system. Think of it as a central library where you store and retrieve blueprints for how agents should operate and interact.

It uses a logger to keep track of what’s happening and relies on a schema context service to handle schema-related tasks.

You can register new schema definitions, update existing ones, and easily retrieve them by their unique keys. This allows for flexible configuration and modification of agent behaviors without needing to directly change the core system code.

## Class ComputePublicService

This class provides a way to manage and interact with compute resources, making sure operations happen with the right context. It uses a logger to keep track of what's going on and relies on another service to handle the actual compute tasks.

You can use functions like `getComputeData` to retrieve results, `calculate` to force a recomputation, `update` to trigger a refresh, and `dispose` to clean things up when you're finished. Each of these functions operates within a specific method and client context.

## Class ComputeConnectionService

This component, `ComputeConnectionService`, manages how different parts of your AI agent swarm communicate and share computed results. It acts as a central hub, coordinating access to computed data and ensuring everything stays synchronized.

Think of it as a traffic controller for computations – it handles requests for computed information (`getComputeData`), manages how computations are triggered (`calculate`), keeps the data up-to-date (`update`), and cleans up resources when no longer needed (`dispose`). 

It relies on several other services like logging, messaging, and schema management to operate effectively. The `getComputeRef` property is a special tool for quickly retrieving references to specific computations.

## Class CompletionValidationService

This service acts as a gatekeeper for completion names used within the agent swarm. It keeps track of all allowed completion names, making sure that each one is unique and properly registered. When a new completion name needs to be added, this service handles the registration process and ensures it's valid. Similarly, when an agent tries to use a completion, this service verifies that the name is recognized and allowed, helping prevent errors and maintain order within the swarm. To make things efficient, it remembers previously checked completion names, avoiding unnecessary checks. It works closely with other services like the completion registration service, agent validation, and the logging system to ensure everything functions smoothly.

## Class CompletionSchemaService

The CompletionSchemaService acts as a central place to manage and organize the logic that agents use to complete tasks. It's like a library of pre-defined functions, each with a unique name, that agents can call upon.

This service makes sure these functions are set up correctly before agents try to use them, performing basic checks to avoid errors. It's closely tied to other services within the system, ensuring smooth operation when agents are created, connected, or executing tasks.

You can register new functions, update existing ones, and easily retrieve them when needed. The service keeps track of everything and logs important activities, helping to diagnose and resolve any issues that might arise. Essentially, it's a critical component for defining and using completion logic throughout the entire agent swarm.

## Class ClientSwarm

This class, `ClientSwarm`, is like the conductor of an orchestra of AI agents working together. It manages the agents, keeps track of which one is currently active, and handles the flow of information between them.

Think of it as a central hub that ensures all the agents are working in sync and that their outputs are delivered correctly.  It can wait for outputs from agents, switch between them, and manage a history of which agents have been used. It’s designed to be responsive, so you can cancel operations if needed.

Here's a quick breakdown of what it does:

*   **Agent Management:** Keeps track of all the agents in the swarm and allows you to switch between them.
*   **Output Handling:**  Waits for output from the current agent and can be cancelled.
*   **Navigation:**  Maintains a "navigation stack" to remember the order agents were used.
*   **Notifications:** It provides a way for other parts of your system to be notified when an agent changes or output is ready.
*   **Cleanup:** When you're done with the swarm, it cleans up any resources it's using.


## Class ClientStorage

This class manages how data is stored and retrieved within the swarm system, enabling search based on data embeddings. It provides a way to add, remove, and clear data, as well as efficiently find similar items.

It works by keeping track of data in a local map for quick access, while also managing operations in a queue to ensure things happen in the right order and safely. When data changes, it also updates the "embeddings" – numerical representations that allow for similarity-based searches.

Here's what you can do with it:

*   **Store Data:** Add or update items using `upsert`.
*   **Find Similar Items:** Search for items that are similar to a given search term using `take`.
*   **Remove Data:** Delete items using `remove`.
*   **Clear All Data:** Remove all items with `clear`.
*   **Retrieve Specific Items:** Get a single item by ID using `get`.
*   **List All Items:**  Retrieve all data, optionally filtered, using `list`.
*   **Clean Up:** Properly dispose of the storage when you're finished with it using `dispose`.

The class interacts with other parts of the system to handle things like creating embeddings, managing connections, and sending notifications about changes.

## Class ClientState

The `ClientState` class manages a single piece of data within the swarm system, acting as a central hub for reading, writing, and reacting to changes. It’s designed to work seamlessly with other components like the state connection service and client agents.

Think of it as a smart data container that keeps track of when the data changes and allows other parts of the system to be notified.

It provides a way to safely update the data, ensuring operations are handled in the correct order and any necessary actions (like notifying other agents or saving changes) are taken. You can subscribe to notifications when the data changes, and the class makes sure that any cleanup needed happens when the data is no longer used. The `waitForInit` method ensures the initial data is loaded correctly, while `setState`, `clearState`, and `getState` provide the primary ways to interact with the data.

## Class ClientSession

The `ClientSession` manages interactions within the AI agent swarm for a single client. Think of it as a dedicated workspace for a user’s session. It handles sending messages, validating them against defined rules, and coordinating with the agents that do the actual work.

Here's a breakdown of what it does:

*   **Message Handling:** It allows you to send notifications, messages to be processed by agents, and even system or developer messages for debugging purposes.
*   **Execution & Validation:** When you ask it to "execute" a message, it sends it to an agent, checks that the message is valid, and returns the result.  `run()` provides a similar process but skips validation for quicker, stateless operations.
*   **History Tracking:** It keeps a record of all actions within the session – messages sent, tools used, and so on.
*   **Integration:** It works closely with other parts of the system, like services for managing sessions and agents, and for handling events.
*   **Real-time Communication:** It can connect to external systems for real-time message exchange.
*   **Cleanup:** It provides a way to properly shut down the session when it's no longer needed.



In essence, it's the central hub for a client's experience within the AI agent swarm.

## Class ClientPolicy

The ClientPolicy class acts as a gatekeeper for your AI agent swarm, managing who can join and what they can do. It's responsible for enforcing rules, like banning clients or checking messages for compliance.

Think of it as a system that keeps unwanted agents out and makes sure everyone plays by the rules. It can automatically ban clients if they violate the established guidelines and provides feedback when things go wrong.

The ClientPolicy relies on a list of banned clients, which it loads only when needed to keep things efficient. It works closely with other parts of the system, like the connection services and message handlers, to ensure a secure and well-managed swarm environment. You can customize how bans are handled and what messages are displayed to banned clients.

## Class ClientOperator

The ClientOperator helps manage and interact with a group of AI agents. Think of it as a central hub for sending instructions and receiving results from those agents. 

You can use it to provide input to the agents, specify how they should process that input, and wait for their responses. It also allows you to send messages – both for developers and directly from users – to influence the agents' behavior. 

While some functions, like committing tool output or assistant messages, aren't currently supported, the core functionality focuses on sending instructions, receiving results, and communicating with the agents. Finally, there's a way to properly shut down and release resources used by the ClientOperator when you're finished with it.

## Class ClientMCP

The ClientMCP class helps your application interact with and manage the tools available to different clients. Think of it as a central hub for controlling which tools are used and how.

It keeps track of tools for each client, remembering them so you don't have to repeatedly fetch the same information.  You can easily check if a particular tool is available for a specific client or request the full list of tools they can use.

When the list of tools needs to be refreshed, the ClientMCP will clear its memory and get the latest information. You can trigger this for individual clients or for all clients at once.

To actually *use* a tool, you call its function through the ClientMCP, providing the necessary data.  Finally, when you’re finished with a client’s tools, you can clean up resources and release cached information.

## Class ClientHistory

The ClientHistory class keeps track of all the messages sent and received by an agent within the swarm system. Think of it as a logbook for the agent's interactions. It's designed to store, manage, and retrieve these messages, filtering them based on specific criteria to ensure the agent only sees the most relevant information. 

You can add new messages to the history using the `push` method, and retrieve the most recent one with `pop`. The `toArrayForAgent` method is particularly useful as it prepares a customized list of messages for the agent, incorporating prompts, system messages, and applying a filter based on global configuration. Finally, `dispose` helps clean up resources when the agent is no longer needed. It’s all about keeping a clean and relevant record of the agent's communication history.

## Class ClientCompute

This component handles the calculations and data updates on the client side, specifically for a compute process. It’s designed to react to changes in the underlying data, re-running calculations as needed.

When the component is initialized, it receives parameters that define how the computations should be performed. It keeps track of previously calculated data to avoid unnecessary work.

You can manually trigger a recalculation using the `calculate` method, telling it which data element triggered the need for a fresh calculation.  The `update` method forces a recalculation regardless of any specific data changes. 

Finally, the `dispose` method is crucial for cleaning up when the component is no longer needed, unsubscribing from any data streams and releasing associated resources.

## Class ClientAgent

The `ClientAgent` is the core component that handles interactions within your AI agent swarm. Think of it as the brain of a single agent, managing incoming messages, triggering tool calls, and keeping track of the conversation history. It works behind the scenes, preventing conflicts and ensuring a smooth workflow.

Here’s a breakdown of how it works:

*   **Message Handling:** When a message arrives, the `ClientAgent` uses `execute` and `run` to process it, which queues the tasks to avoid overlap.  `execute` deals with general messages while `run` handles simpler completion requests.
*   **Tool Management:** It dynamically resolves and uses tools (`_resolveTools`) and deals with errors if tools fail (`_resurrectModel`).
*   **History & State:** It meticulously tracks the conversation history (`commitUserMessage`, `commitAssistantMessage`, `commitSystemMessage`) and agent changes (`commitAgentChange`). It provides ways to flush the history (`commitFlush`) and logs activities (`commitDeveloperMessage`).
*   **System Integration:** It communicates with various services like `HistoryConnectionService`, `ToolSchemaService`, and `SwarmConnectionService` to maintain consistency and coordinate actions within the larger swarm.
*   **Error Recovery:** If things go wrong, it intelligently attempts to recover (`_resurrectModel`), providing placeholders and signals for retries.  The `waitForOutput` method is crucial for systems that need to wait for the agent’s response.
*   **Cleanup:**  The `dispose` method ensures all resources are properly released when the agent is no longer needed.



In essence, the `ClientAgent` provides a structured way to build and manage individual agents in your swarm, simplifying communication and error handling while providing a centralized point for managing agent state and interactions.

## Class ChatUtils

This class, `ChatUtils`, helps manage chat sessions for different clients interacting with an AI agent swarm. Think of it as a central controller. It's responsible for creating and managing individual chat instances, ensuring they’re properly set up and cleaned up when needed.

You can use it to start a new chat session for a client using `beginChat`, send messages through `sendMessage`, and gracefully end a chat session with `dispose`. The `listenDispose` method allows you to be notified when a chat is being closed.

The `useChatAdapter` function lets you customize how chat instances are created, while `useChatCallbacks` allows for custom actions to be performed during certain events within a chat session. Essentially, it provides a framework for handling chat interactions within your AI agent system.

## Class ChatInstance

The `ChatInstance` class manages a single chat session within an AI agent swarm. Each instance is tied to a specific client and swarm, and has a way to be cleaned up when it’s no longer needed.

It provides methods for starting a chat (`beginChat`), sending messages (`sendMessage`), and ultimately ending the session (`dispose`).  The system also has a built-in mechanism to track activity and automatically end inactive chats (`checkLastActivity`). Finally, you can register a function to be notified when a `ChatInstance` is disposed of, keeping you informed about its lifecycle.

## Class BusService

The `BusService` acts as a central hub for event-driven communication within the system. Think of it as a message board where different parts of the swarm can send and receive updates. It manages subscriptions to these events, ensuring that the right components receive the information they need.

You can subscribe to events using `subscribe` for ongoing updates, or `once` for a single notification when a specific condition is met.  When an event happens, `emit` sends it out to all interested subscribers, which can include system-wide listeners via wildcard subscriptions.  There are also convenience methods like `commitExecutionBegin` and `commitExecutionEnd` for common execution events. Finally, `dispose` allows you to cleanly remove all subscriptions for a particular client when they’re no longer needed, ensuring a tidy system.  The service also keeps track of active sessions and logs activity for debugging and monitoring.

## Class AliveService

The `AliveService` helps keep track of whether clients are online or offline within your AI agent swarms. It allows you to explicitly mark a client as online or offline, ensuring that the system knows their current status. These status changes are recorded and, if configured, saved persistently so the information isn't lost. Think of it as a heartbeat monitor for your agents, letting you know who's actively participating and who isn't. You specify which client, which swarm they belong to, and a method name for context when marking them as online or offline.

## Class AgentValidationService

The AgentValidationService acts as a central hub for ensuring agents within your swarm system are correctly configured and interconnected. It essentially manages agent blueprints (schemas) and keeps track of how agents depend on each other.

You can think of it as a quality control system for your agents. You register agents with their configurations, and the service verifies that everything is set up correctly – including their tools, storage, and dependencies on other agents.

It leverages other specialized services for tasks like validating agent schemas, tools, and storage, and it's designed to be efficient, remembering results to avoid repetitive checks. The service also maintains lists of registered agents, their storage, wikis, states, and dependencies for easy querying. This helps to ensure agents are properly connected and functioning as expected within the swarm.

## Class AgentSchemaService

The AgentSchemaService acts as a central place to define and manage the blueprints for your AI agents within the swarm. Think of it as a library of agent templates, each describing what an agent does, what tools it uses, and how it interacts with the system.

It ensures that these blueprints are well-formed before they're used, performing basic checks to avoid common errors.  You can register new agent blueprints, update existing ones, and easily retrieve them when needed.

This service works closely with other parts of the system, like the agent connection and swarm configuration services, providing the necessary information for agents to be created and run.  It also keeps a log of its actions for troubleshooting and monitoring.

## Class AgentPublicService

This class, `AgentPublicService`, acts as the main gateway for interacting with agents within the swarm system. Think of it as a simplified interface built on top of the core agent handling logic. It wraps lower-level operations to add context scoping and logging, ensuring everything is tracked and operates within defined boundaries.

It provides methods for common tasks such as creating agents, executing commands, running quick stateless operations, committing messages (like user input, assistant responses, or tool outputs), and cleaning up resources.  These methods are designed to be consistent with how other parts of the system, like the client agent and performance tracking services, work.

Essentially, it's the go-to place for most public-facing agent interactions, ensuring that operations are handled correctly and that important events are logged and tracked. Logging is enabled if a system-wide setting is turned on, which provides detailed information about agent activity. Finally, it provides a way to dispose of an agent to clean up any lingering resources after use.

## Class AgentMetaService

This service helps manage information about your AI agents and turns it into easily understandable diagrams. It essentially builds a visual map of how agents connect to each other, what they do, and what resources they use.

It creates detailed and simplified versions of these agent maps, allowing you to see the big picture or just focus on relationships between agents. The service uses the agent's underlying definitions to generate these maps, and it’s designed to work closely with other parts of the system to produce documentation and help with debugging.

You can think of it as a translator, converting the technical details of your agents into a visual representation that's much easier to grasp, and this visual output can be saved as diagrams for later reference. It’s particularly helpful for understanding complex agent interactions and creating clear documentation.

## Class AgentConnectionService

This service manages connections and actions for AI agents within a larger system. Think of it as the central hub for creating, running, and overseeing individual agents. It reuses agents efficiently by caching them, and it's carefully integrated with other services to handle logging, tracking usage, managing history, and ensuring everything runs smoothly.

Here's a breakdown of what it does:

*   **Agent Creation & Reuse:** It creates agents and keeps them ready for use, avoiding unnecessary re-creation.
*   **Execution & Logging:** It handles executing commands, runs quick completions, and records what's happening, ensuring transparency and debuggability.
*   **History & State:**  It keeps track of the agent's history (messages, tool calls) and its current state.
*   **Integration:** It coordinates with a bunch of other services for things like schema validation, usage tracking, and storage.
*   **Clean Up:** When an agent is no longer needed, it cleans up its resources.

Essentially, this service provides a controlled and organized way to work with AI agents, ensuring consistency and efficiency across the entire system.

## Class AdapterUtils

This class provides easy ways to connect to different AI services for generating text. Think of it as a toolbox with pre-built functions to talk to services like Hugging Face, Cortex, Grok, Cohere, OpenAI, LMStudio, and Ollama. Each function, like `fromHf` or `fromOpenAI`, sets up a way to send requests and receive responses specifically designed for that AI provider’s chat completion API. You can use these functions to build your own AI agent orchestrations without having to worry about the specific details of each service's API. Providing a model name can help specify which model to use within that service. Some functions allow you to customize things like the response format or specify a base URL for the API.

# agent-swarm-kit interfaces

## Interface ValidationResult

This object represents the outcome of validating the arguments you provide to a tool. It tells you whether the arguments were valid and, if not, why. 

If everything went well, the `success` property will be true, and you'll find the parsed and validated data in the `data` property. If something went wrong during validation, `success` will be false, and a helpful error message will be provided in the `error` property to help you correct the input. Think of it as a clear way to understand if your tool arguments are in the expected format and contain the right information.

## Interface TAbortSignal

This interface lets you signal when an operation needs to be stopped, similar to how you might interrupt a download. It builds on the standard web technology for cancellation, allowing you to more easily manage and coordinate tasks that might need to be stopped midway. Think of it as a way to politely tell a process "Hey, I need you to stop what you're doing now." You can modify this base to add your own specific controls or information related to stopping tasks.

## Interface JsonSchema

This describes a JSON Schema, which is a way to define the structure of JSON data and ensure it's valid. Think of it as a blueprint for your data.

It has a `type` property to specify what kind of data it represents (like a string, number, or object).  

The `properties` section lists the specific fields within an object, along with their data types.  

`required` tells you which fields *must* be present in the JSON data.

Finally, `additionalProperties` is a setting that dictates whether extra, unexpected fields are allowed; setting this to `true` allows for more flexibility, while `false` enforces a stricter data structure.

## Interface IWikiSchema

This interface, `IWikiSchema`, defines the structure for interacting with a wiki-based knowledge source. Think of it as a blueprint for how your AI agents will access and use information stored in a wiki.

Each wiki you connect to will have a schema that includes a name (`wikiName`) and a description (`docDescription`) to help you identify it.

You can also provide custom actions (`callbacks`) to extend the wiki's functionality. 

Finally, the `getChat` method allows your agents to query the wiki and receive text-based responses, effectively letting them "chat" with the knowledge contained within.

## Interface IWikiCallbacks

This interface defines a set of optional callbacks you can use to get notified about events happening within a wiki-related process. Specifically, the `onChat` property lets you receive information whenever a chat interaction takes place, allowing you to react to and potentially influence those conversations. Think of it as a way to listen in and respond to what's being discussed. You don't *need* to use these callbacks, but they are available if you want to build custom functionality around chat events.

## Interface ITriageNavigationParams

This interface defines the information needed to set up how an AI agent navigates through different tasks. It lets you specify the name of a particular tool the agent will use, provide a clear description of what that tool does, and optionally add some extra notes for documentation. Think of it as a blueprint for building and understanding the tools that guide the agent's work.

## Interface IToolRequest

This interface defines what's needed to ask the system to run a specific tool. Think of it as a structured way for an agent to say, "Hey, I need to use the 'search' tool, and I want it to search for 'example'." 

It has two main parts: the name of the tool you want to use (like "search" or "calculator"), and a set of parameters – the specific details the tool needs to do its job. These parameters are essentially the tool's input. The system will check to make sure the parameters you provide make sense for the tool you're using.


## Interface IToolCall

This interface describes a request to use a tool within the system. Think of it as the system understanding what a model wants a tool to do. Each tool call has a unique ID to keep track of it, and currently, all calls are for functions – meaning they represent a specific function to be executed. The details of the function, including its name and the arguments it needs, are included in the request.

## Interface ITool

This interface describes a tool that agents within the system can use. Think of it as defining a function – it includes the function's name, a description of what it does, and a detailed outline of what inputs it expects. 

The `type` property always indicates that this is a function currently, but the system is designed to potentially support other tool types in the future. 

The `function` property breaks down the tool's specific capabilities, allowing the AI model to understand how to use it and to correctly format requests to call it.

## Interface ISwarmSessionCallbacks

This interface lets you listen in on important events happening within your AI agent swarm. You can use these callbacks to track when agents connect, when tasks are executed, when messages are sent, and when sessions start or end. Think of them as notification hooks that give you visibility into the swarm's activity, allowing you to build custom monitoring or logging systems. You can specify functions to run when a client joins the swarm, when a command is processed, when a stateless run completes, when a message is sent, or when a session is initialized or closed.

## Interface ISwarmSchema

This interface helps you define how your AI agent swarm will operate. You can use it to specify a unique name for your swarm, and list the agents that will be part of it. It lets you set a default agent to be active when the swarm starts up. 

You can also configure the swarm to remember its navigation history and the active agent, saving that information so it can be restored later. You can create custom functions to manage the swarm's navigation stack and active agent, or define rules and access controls for the agents. Finally, you can add callbacks to your swarm to respond to different events and tailor its behavior even further.

## Interface ISwarmParams

This interface defines the information needed to set up a group of AI agents working together. Think of it as the blueprint for creating a swarm. 

It includes a unique identifier for the system creating the swarm, a way to log activities and errors, a communication channel for agents to talk to each other, and a list of the individual agents that will be part of the group. Essentially, it's all the key ingredients for a coordinated AI team.

## Interface ISwarmDI

This interface acts as a central hub for all the services that power the AI agent swarm system. Think of it as the system's toolbox, providing access to everything needed to manage agents, handle events, track performance, manage connections, and validate data. It gives you a single point of access to services like documentation, event handling, agent connections, and schema management, ensuring everything works together seamlessly.  It's designed to streamline development and provide a consistent way to interact with the core components of the swarm.

## Interface ISwarmConnectionService

This interface helps define how different parts of the AI agent swarm framework connect and communicate. Think of it as a blueprint for creating a reliable link between agents, ensuring a clear and predictable way for them to work together. It's designed to isolate the public-facing connection methods, keeping the internal workings separate and organized. This separation helps maintain a clean and stable system for everyone interacting with the swarm.

## Interface ISwarmCallbacks

This interface lets you listen in on important moments in your AI agent swarm's lifecycle. Specifically, it tells you whenever an agent’s role or responsibility changes within the swarm. You can use this notification to keep track of what agents are doing or to update your system's state based on those changes. Think of it as a way to get notified when an agent takes on a new task or shifts its focus within the overall swarm operation.

## Interface ISwarm

This interface lets you interact with a group of AI agents working together. You can use it to get the name of the agent currently in charge, or even the agent itself as an object. To control the process, you can ask the swarm to pause its current task or switch to a different agent. It also provides a way to send messages to the swarm and check if it's currently busy with a task, which is useful for tracking its progress and ensuring smooth operation. You can register new agents or update existing ones within the swarm using the provided methods.

## Interface IStorageSchema

This interface outlines how your AI agents will store and manage data. It lets you configure whether data is saved permanently, add descriptions for clarity, and determine if the storage is accessible by all agents.

You can customize how data is read and written, and specify the method used for indexing data to make searching efficient. The `storageName` provides a unique identifier for each storage area. 

You can also set up callbacks to react to storage-related events and define what default data should be provided. The `createIndex` function is used to generate searchable indexes for each item stored.

## Interface IStorageParams

This interface defines how your application interacts with the storage system used by the AI agent swarm. It's essentially a set of tools and configurations needed to manage and work with embeddings – those numerical representations of text that help agents understand and compare information.

You'll use it to tell the system where to store data, how to calculate similarity between pieces of information, and how to efficiently reuse previously computed embeddings by caching them. It also provides access to logging and communication channels within the swarm, ensuring you can track activity and receive updates. 

The `clientId` identifies which client is using the storage, while `storageName` clarifies the specific storage instance within the larger system. Functions like `createEmbedding`, `writeEmbeddingCache`, and `readEmbeddingCache` are key to handling embeddings effectively.

## Interface IStorageData

This interface describes the basic information that's saved and retrieved from our system's storage. Every piece of data we store will have a unique `id`, which acts like its name and lets us find it again later or delete it. Think of it as a primary key for each stored item.

## Interface IStorageConnectionService

This interface helps define how your application connects to storage, ensuring a clear and consistent way to interact with storage services. It's designed to be a typed version of a core storage connection service, focusing on the parts that are meant for external use. By using this interface, you can be sure your public-facing storage operations are well-defined and predictable.

## Interface IStorageCallbacks

This interface lets you listen in on what's happening with your data storage. You can get notified when data is changed, like when items are added or removed. It also provides a way to track searches, and you're alerted when the storage is first set up and when it’s being shut down. These notifications allow you to monitor storage activity, keep track of changes, or perform any necessary setup or cleanup tasks.

## Interface IStorage

This interface lets you manage data stored within the AI agent swarm system. You can think of it like a central place to keep track of information used by the agents.

The `take` method allows you to fetch a number of items based on a search term – the system uses clever techniques to find items that are similar to what you're looking for. 

`upsert` lets you add new items or update existing ones; it automatically keeps everything organized. 

If you need to remove something, `remove` lets you delete an item by its unique identifier. 

`get` is for retrieving a specific item when you know its identifier.

`list` provides a way to see all the data, and you can even filter it to only see certain items.

Finally, `clear` will wipe the entire storage, starting fresh.

## Interface IStateSchema

The `IStateSchema` interface describes how each piece of information, or "state," is managed within the AI agent swarm. It lets you configure things like whether the state is saved persistently, provides a description for documentation, and controls whether it can be used by multiple agents.

You can define a unique name for each state and provide a function to create its initial value. It's also possible to customize how the current state is retrieved and updated by providing your own functions, and you can even add middleware to process the state during its lifecycle. Finally, you can register callbacks to be notified of different state events.

## Interface IStateParams

This interface defines the information needed to manage the state of an AI agent within the larger swarm system. Think of it as a set of instructions that tells the system *who* this state belongs to (identified by `clientId`), how to keep track of what’s happening (using a `logger`), and how to communicate with the rest of the swarm (`bus`). Essentially, it connects the individual agent's state to the broader operational context.

## Interface IStateMiddleware

This interface lets you hook into how the AI agent swarm's internal state is being handled. Think of it as a way to step in and check or adjust the information the system is using behind the scenes. You can use it to make sure the state is always in a consistent and valid form, or to add extra information as the agents are working. It's a way to customize the flow of data and ensure everything runs smoothly.

## Interface IStateConnectionService

This interface helps ensure a clear and consistent way to interact with services that manage the state of your AI agents. Think of it as a blueprint for how these services should behave, specifically focusing on the parts that are meant for public use. It's designed to be used when you're creating a service, making sure that only the necessary functions and data are exposed, keeping things organized and secure. It's a technical detail to help developers build reliable and predictable agent orchestration systems.

## Interface IStateChangeContract

This interface lets you listen for changes in the system's states. Whenever a state transitions, a notification is sent out, so you can update your components or trigger actions based on those changes. Think of it as a way to be notified whenever something significant changes within the agent swarm.

## Interface IStateCallbacks

This interface lets you listen in on important moments in a state's life cycle. You can use it to be notified when a state is first created (onInit), when it's being cleaned up (onDispose), or when it's loaded with data.

You also get notified whenever the state’s data is read (onRead) or written (onWrite), allowing you to track what's happening with the state’s information. These notifications are helpful for things like logging, debugging, or reacting to state changes. Each notification tells you which client and state name the event relates to.

## Interface IState

This interface lets you manage the ongoing condition of your AI agents. You can check the current status using `getState`, allowing you to see what's happening in real-time. When you need to adjust things, `setState` provides a way to calculate the new state based on the old one, giving you fine-grained control. And if you need to start fresh, `clearState` will reset everything back to the initial setup defined in your agent configuration.

## Interface ISharedStorageConnectionService

This interface helps define how different parts of the AI agent swarm can safely share information. Think of it as a blueprint for a secure connection to a shared storage space. It’s designed to ensure that only the intended, public-facing functions are exposed, keeping the internal workings of the storage connection hidden and protected. This interface is used to create a specific implementation that focuses on the publicly available features for sharing data.

## Interface ISharedStateConnectionService

This interface helps define how different parts of the AI agent swarm can share information securely. Think of it as a blueprint for a service that manages this shared data, but it's designed to hide some internal details. It’s specifically used to create a publicly accessible version of the shared state connection service, ensuring that users only interact with the features meant for them.

## Interface ISharedComputeConnectionService

This interface defines how your AI agents connect to and utilize shared computing resources. Think of it as a bridge enabling agents to request and utilize things like processing power or memory. It builds upon the foundation of `SharedComputeConnectionService`, ensuring that your code can reliably interact with these shared resources in a predictable way. It's a key component for orchestrating agent swarms that need access to more computational muscle than a single agent can provide.

## Interface ISessionSchema

This interface, ISessionSchema, acts as a blueprint for how session data will be structured in the future. Right now, it doesn't contain any specific properties, but it's reserved to hold configuration details related to individual sessions as the system evolves. Think of it as a promise for more session-level control and customization down the line.

## Interface ISessionParams

This interface defines all the essential information needed to start a new session within the AI agent swarm. Think of it as a blueprint for creating a session. 

It includes details like a unique client ID to identify who initiated the session, a logger for keeping track of what’s happening, and a policy to ensure the session operates within defined rules. You’ll also find references to the communication bus and the overall swarm management system, along with the specific name of the swarm the session is part of. Essentially, it’s a container holding everything the system needs to properly run a session.

## Interface ISessionContext

This interface describes the information available during a session within the AI agent swarm system. Think of it as a container holding details about who initiated the session (the client), what they're trying to do (the method), and the specific instance of the swarm that's handling the request.

It includes a unique ID for the client session, an ID for the swarm process itself, and potentially information about the specific method being called or the current execution step. This context allows different parts of the swarm to understand and coordinate activities related to a single user interaction. You’ll find details like the client’s identifier and execution-specific data packed into this single object.

## Interface ISessionConnectionService

This interface helps us ensure a consistent and predictable way for external systems to interact with our agent swarm orchestration. Think of it as a blueprint – it lays out exactly what features and methods should be available when connecting to a session. It’s designed to keep the publicly accessible parts of the connection service clean and separate from the internal workings, making it easier to understand and use.

## Interface ISessionConfig

This interface defines how to set up a session, either for running tasks at specific intervals or to control how frequently they execute. You can specify a `delay` to determine the time between session runs. 

If you need to clean up resources when a session ends, you can provide an `onDispose` function that will be called automatically during the session's cleanup process, allowing you to release any held connections or perform other necessary actions.

## Interface ISession

The `ISession` interface is the core for managing interactions within the AI agent swarm. It provides ways to send messages, trigger actions, and control the flow of a conversation or task.

You can use methods like `commitUserMessage` and `commitAssistantMessage` to add messages to the session's history, building up the conversation.  `commitSystemMessage` and `commitDeveloperMessage` are designed for internal messages or debugging purposes.  If you need to run a simple computation without affecting the session’s memory, use `run`.

`execute` handles running commands and potentially updating the session's history based on the execution mode.  The `connect` method sets up communication channels to send and receive messages.  Tools can be managed using `commitToolOutput`, `commitToolRequest`, and `commitStopTools`, allowing you to control and interrupt tool execution.  Finally, `commitFlush` provides a way to reset the session to a clean state, clearing out the agent's history.

## Interface IScopeOptions

This interface, `IScopeOptions`, lets you configure how operations are performed within a specific context for your AI agent swarm. Think of it as setting the stage for your agents. You specify a unique `clientId` to track the session, and a `swarmName` to tell the system which pre-defined group of agents to use. You can also provide an `onError` function to gracefully handle any issues that pop up during the process and implement custom error handling.

## Interface ISchemaContext

This object acts as a central hub for accessing all the schema definitions used by the agent swarm. Think of it as a library containing blueprints for different types of agents and how they interact. Inside, you'll find registries – organized collections – for various schema types like agent schemas and completion schemas, making it easy to retrieve and manage them. It simplifies accessing these essential components across the entire system.

## Interface IPolicySchema

This interface describes the structure for defining a policy that governs how the AI agent swarm handles client interactions and bans. You can use it to configure rules for your swarm, specifying how to manage banned clients—whether to save that information permanently or not. It allows you to provide descriptions for clarity and assign unique names to each policy.

You can customize the messages displayed when a client is banned and even define functions to generate personalized ban messages. The interface lets you retrieve lists of currently banned clients and, optionally, replace the default mechanism for managing that list.

Most importantly, it allows for custom validation of both incoming and outgoing messages based on your specific needs. It also provides a way to register callback functions to react to various policy events, granting further control over the swarm's behavior.

## Interface IPolicyParams

This interface defines the information needed to set up a policy within the AI agent swarm. Think of it as a blueprint for creating a policy—it tells the system what it needs to function correctly. 

It requires a logger to keep track of what's happening with the policy, which is essential for debugging and monitoring.  It also needs a communication channel, called a bus, to allow the policy to interact with other parts of the swarm. Essentially, it provides the policy with the tools it needs to listen, react, and share information within the larger AI agent system.

## Interface IPolicyConnectionService

This interface helps us create a standardized way to manage connections based on defined policies. Think of it as a blueprint for services that handle how different parts of our system interact based on rules. It’s designed to be a clean, public-facing version, stripping away the behind-the-scenes details that aren't meant for outside use. By using this interface, we guarantee a consistent and predictable way to handle policy-driven connections.

## Interface IPolicyCallbacks

This interface lets you connect your own functions to key events happening within a policy. Think of it as a way to get notified and react to what's going on.

You can specify a function to run when a policy is first set up (`onInit`), when a message is being checked for validity before it's sent (`onValidateInput`), or when a message is being validated before it's sent to a client (`onValidateOutput`). 

You also have hooks to respond to client bans (`onBanClient`) and unbans (`onUnbanClient`), allowing you to log these actions or trigger other processes related to client management. These callbacks provide a way to customize and extend the behavior of your policies.

## Interface IPolicy

This interface defines how policies are applied within the agent swarm, acting as a gatekeeper for client interactions. It allows you to check if a client is blocked, retrieve the reason for a ban, and to verify both incoming and outgoing messages to ensure they comply with defined rules. You can also use it to actively ban or unban clients from participating in a specific swarm. Essentially, it provides the controls to manage client access and content filtering within the system.

## Interface IPipelineSchema

This interface describes the structure of a pipeline within the agent swarm orchestration framework. A pipeline has a name to identify it, and a core `execute` function that defines the sequence of actions to be performed – it takes a client ID, agent name, and a payload of data as input and returns a promise.  You can also optionally include `callbacks` to be notified about different stages of the pipeline's run, allowing you to monitor progress, handle problems, or inject custom actions. These callbacks give you flexibility in observing and influencing how the pipeline operates.

## Interface IPipelineCallbacks

This interface lets you listen in on what's happening as your AI agent pipelines run. You can define functions to be notified when a pipeline begins, when it finishes – whether successfully or with an error – and specifically when an error occurs during the process. This lets you track progress, handle unexpected issues, and generally keep a close eye on how your pipelines are performing. Essentially, it's your way to react to the different stages of a pipeline's lifecycle.


## Interface IPersistSwarmControl

This framework lets you tailor how the system saves and loads information about your AI agent swarms. Specifically, you can now define how the data about which agents are active and the paths they're taking are stored. 

You have the ability to replace the default storage methods with your own custom solutions. This is useful if you want to use a specific database, an in-memory store, or another way to manage this critical swarm information.

Essentially, these controls allow you to customize the persistence layer for both active agent data and navigation stacks, giving you greater flexibility in how your swarms are managed.

## Interface IPersistStorageData

This interface outlines how data intended for long-term storage within the AI agent swarm is structured. Think of it as a container holding a collection of data – like a list of items – that needs to be saved. It’s specifically designed to work with the tools responsible for handling that storage process, ensuring everything is organized correctly for saving and later retrieval. The `data` property holds the actual information to be stored, whatever format it might be in.

## Interface IPersistStorageControl

This interface lets you tailor how data is saved and retrieved for a specific storage area. You can swap out the default storage mechanism with your own custom solution. This is useful if you need to store data in a database, a cloud service, or any other system beyond the framework's built-in persistence. Essentially, it provides a way to control the underlying storage implementation for a designated storage area.

## Interface IPersistStateData

This interface describes how to package up data that needs to be saved and retrieved later by the swarm system. Think of it as a container for whatever information an agent or the overall system needs to remember. It has a single property called 'state', which holds the actual data you want to store – whether that's details about an agent's settings or information about a user's session. The type of this 'state' property can be anything, represented by 'T', making it highly flexible.

## Interface IPersistStateControl

This interface gives you the power to manage how agent swarm states are saved and retrieved. You can plug in your own custom storage solution, like a database or a specific file format, instead of relying on the default persistence mechanism. This lets you tailor the state management to your application's unique needs and environment. Essentially, it’s about extending the framework's ability to handle the data that tracks the swarm’s progress.


## Interface IPersistPolicyData

This interface describes how the swarm system remembers which clients have been restricted. It’s used to store a list of session IDs – think of them as unique identifiers for each user – that have been blocked within a particular swarm. Essentially, it helps the system keep track of clients that shouldn't be interacting with a specific swarm. The `bannedClients` property holds this list of session IDs.

## Interface IPersistPolicyControl

This interface lets you tailor how policy data is saved and retrieved for your AI agent swarms. Think of it as a way to plug in your own storage solution – maybe you want to use a database, a file system, or even just keep the data in memory temporarily. By using the `usePersistPolicyAdapter` method, you can replace the default persistence mechanism with your own custom adapter, giving you fine-grained control over where and how the policy data for a specific swarm is managed. This is useful for scenarios requiring specialized persistence strategies.

## Interface IPersistNavigationStackData

This interface describes how we keep track of where a user has navigated within a group of AI agents. Think of it like a history button – it stores a list of the agent names the user has visited, so they can easily go back. The `agentStack` property holds this list of agent names, allowing the system to remember the order in which agents were accessed. This helps provide a smooth and intuitive experience when interacting with a swarm of AI agents.

## Interface IPersistMemoryData

This interface describes how memory information is saved and retrieved within the AI agent swarm. Think of it as a container for any data you want to store, like a session's details or a temporary calculation. It has a single piece of information: `data`, which holds the actual memory content you're persisting. This structure helps the system keep track of important information across different interactions and agent actions.

## Interface IPersistMemoryControl

This interface lets you customize how memory data is saved and loaded, particularly for individual sessions identified by a `SessionId`. You can plug in your own storage mechanism, like saving data to a database or a file system, instead of relying on the default behavior. This is useful if you need more control over where and how memory is persisted, perhaps for testing or specialized storage requirements. The `usePersistMemoryAdapter` method is how you provide your custom adapter.

## Interface IPersistEmbeddingData

This interface describes how data representing the numerical "fingerprint" of text is stored long-term within the swarm. Think of it as a way to remember what a piece of text is like – a collection of numbers that capture its meaning. The `embeddings` property holds that numerical representation, allowing the system to recall and compare text based on its meaning rather than just its exact wording.

## Interface IPersistEmbeddingControl

This interface lets you tailor how embedding data is saved and retrieved. Think of it as a way to swap out the default storage mechanism for embeddings with something you build yourself. You can use this to manage embedding data in a specific way, such as storing it in a database, a file, or even just keeping it in memory temporarily. This customization is particularly useful when you need fine-grained control over where and how embedding information is persisted.

## Interface IPersistBase

This interface handles saving and retrieving data from files, acting as the foundation for storing information within the swarm. It ensures the storage area is set up correctly and validates the data it contains.

You can use it to check if a specific piece of data is saved, read data by its ID, and write new data or updates to files. The system guarantees that writing data is done reliably to prevent data corruption.

## Interface IPersistAliveData

This interface helps the system keep track of which clients are currently active within a particular swarm. It's a simple way to note whether a client, identified by its session ID, is online or offline within a swarm. The `online` property is the key here, simply telling us whether the client is currently considered active.

## Interface IPersistAliveControl

This interface lets you tailor how the system remembers whether an agent swarm is still active. 

Essentially, it provides a way to plug in your own custom storage mechanism – maybe you want to track alive status in a database, a file, or even just in memory. 

By using the `usePersistAliveAdapter` method, you can replace the default way the system handles this alive status persistence with your preferred solution, giving you more control over how the swarm's activity is tracked.


## Interface IPersistActiveAgentData

This interface describes how we keep track of which agent is currently running for each client within a swarm. Think of it as a simple record – it tells us the name of the active agent. This information helps the system remember the state of the agents as they work together in a swarm. The `agentName` property is simply a descriptive label for the agent, like "agent1" or "taskRunner."

## Interface IPerformanceRecord

This interface defines a record that tracks how well a particular process is performing within the swarm. It gathers data from multiple clients involved in that process, like individual agent instances or sessions, to give you a clear picture of overall system health.

Each record includes details like the unique identifier of the process, a list of performance data for each client involved, and key metrics such as the total number of executions, total and average response times, and timestamps. This information is helpful for monitoring the swarm’s efficiency, diagnosing issues, and understanding how different processes are behaving.

The record also incorporates timestamps, providing context for when the performance data was collected and allowing you to track performance trends over time. Think of it as a snapshot of a process’s behavior, allowing you to see how it's doing and where there might be room for improvement.

## Interface IPayloadContext

This interface, `IPayloadContext`, acts like a container for information related to a task being processed. Think of it as a little package that carries not just the data you need (`payload`), but also identifies *who* requested it (`clientId`). The `clientId` is simply a unique label to track requests from different sources, while the `payload` holds the actual data being worked on – whatever kind of data it may be.

## Interface IOutlineValidationFn

This type describes a function used to check if an outline operation is set up correctly. Think of it as a quality control step – it receives some input data and the outline's information, and then determines if everything is valid and ready to proceed. It's designed to ensure that the system doesn’t try to execute actions based on incomplete or incorrect outline data. The function essentially confirms the outline's readiness before any work begins.

## Interface IOutlineValidationArgs

This interface helps you pass information needed to validate the results of an operation within the AI agent swarm. Think of it as a package containing both the original input and the data that's been produced – the 'data' property – which needs to be checked for correctness. This 'data' is usually structured, representing a result or output from a previous step in the agent's process. You’re essentially passing the relevant context to the validation function.

## Interface IOutlineValidation

This interface helps you define how to check if an outline is set up correctly within your AI agent swarm. Think of it as a way to specify rules and explanations for verifying the structure of your outline data. 

You'll use it to provide a validation function – essentially, a check to see if the outline meets your requirements.  You can also include a helpful description to explain what this validation does for anyone reading the code or documentation. This allows you to create reusable and well-documented validation steps.

## Interface IOutlineSchemaFormat

This interface lets you define a specific format for the data your AI agents will be working with, using a complete JSON schema to ensure consistency. Think of it as providing a blueprint for the data – it tells the system what kind of structure to expect and how to validate it. The `type` property identifies the format being used (currently just "json_schema"), while the `json_schema` property holds the actual JSON schema object that defines the data's rules.

## Interface IOutlineSchema

This interface, `IOutlineSchema`, is your blueprint for defining how an AI outline operation will work. It lets you specify everything from the prompt used to kick things off to how the resulting data will be validated.

You can set a static prompt, or even have the prompt change dynamically based on the outline's name. Similarly, you can provide fixed instructions for the AI model (the "system prompt"), or create those instructions on the fly. 

The schema defines the expected structure of the outline data, allowing for validation to ensure the results are in the correct format. You can also add optional descriptions for documentation and limit the number of attempts if things go wrong. 

Finally, there's a function called `getOutlineHistory` that takes input and generates the outline data, and callbacks that let you customize certain parts of the process.

## Interface IOutlineResult

This interface describes what you get back after running an outline process, which is essentially a structured plan or framework. It tells you if the outline was successful, giving you a unique ID to identify that specific run. You’ll also see a record of all the messages exchanged during the process – what you asked, what the system responded, and so on. If something went wrong, you'll find an error message here. 

The interface also holds the original input parameters used to generate the outline, along with the resulting data (if any). Finally, it keeps track of how many times the outline process has been attempted, useful for troubleshooting or monitoring.

## Interface IOutlineObjectFormat

This interface defines the structure for how outline data should be organized. Think of it as a blueprint, specifying what fields are necessary and what kind of information each field should contain. It ensures that the data being used is consistent and understandable, whether you're working with OpenAI, using Ollama, or generating schemas. The interface details the data's root type, a list of mandatory fields, and provides descriptions and possible values (enums) for each property within the outline.

## Interface IOutlineMessage

This interface defines the structure for messages within the system, helping to organize interactions between users, assistants, and the overall system. Each message has a clearly defined role, indicating who sent it – whether it's a user, an assistant, the system itself, or a tool. You can also attach images to a message, either as raw binary data or encoded strings, for situations involving visuals.  The main text of the message is stored in the `content` property.  Additionally, messages can be linked to specific tool calls via `tool_calls` and `tool_call_id`, providing context for actions performed by agents.

## Interface IOutlineHistory

This interface lets you keep track of the steps and decisions made during an outline creation process. It provides a way to store messages related to the outline, letting you review what happened or even reset the history. You can add individual messages or groups of messages at once, clear the entire history if needed, and easily retrieve the complete list of messages to see the sequence of events.

## Interface IOutlineFormat

This interface defines the expected structure for your outline data – think of it as a blueprint. It tells you what fields are absolutely necessary and provides details about each field, like what kind of data it should contain and what it represents. By using this interface, you can ensure that the data you’re working with is consistently formatted and easily understood by the entire system. It helps to organize and validate the outline data to prevent errors.

## Interface IOutlineCallbacks

This interface lets you listen in on what’s happening as an outline is created and checked. You can use these callbacks to keep track of when an attempt to generate an outline begins, or to react to the outline itself once it’s ready. 

Specifically, you can get notified when a successful outline is produced, or when something goes wrong during validation. This gives you a way to monitor the process, log details, or trigger other actions based on the outline’s status.

## Interface IOutlineArgs

This interface defines the information needed when creating an outline – think of it as the starting point for generating a plan or structure. It bundles together the actual input you're working with, a counter to track how many times you've tried, the desired output format, and a way to keep track of past interactions or messages.  This helps manage the process and provide context for the AI agents involved. Essentially, it’s a package containing what needs to be outlined, how many attempts have been made, the desired layout, and a record of previous steps.

## Interface IOutgoingMessage

This interface describes a message that's being sent out from the orchestration system to a client, usually an agent. Think of it as a way to deliver information – like a response or notification – back to the agent that requested it. 

Each message has a `clientId`, which is like an address, ensuring it reaches the correct client. The `data` property holds the actual content of the message, such as a processed result or a natural language response. Finally, `agentName` tells you which agent within the system generated the message, making it clear where the information came from.

## Interface IOperatorSchema

This function lets you link your AI agents to an operator dashboard, allowing a human operator to view and potentially intervene in ongoing conversations. It essentially creates a bridge, passing messages back and forth between the agents and the operator's view.  The operator can then use this connection to monitor what's happening and even send responses that will be treated as if they came from the agent. It requires a client ID to identify the connection and the agent’s name to know which agent’s conversation is being monitored.

## Interface IOperatorParams

This interface, `IOperatorParams`, defines the essential pieces of information needed to run an agent within our AI agent swarm orchestration system. Think of it as a configuration package. 

It includes the name of the agent, a client identifier to track its usage, a logger for recording its actions and debugging, a messaging bus for communication with other agents and the system, and a history service to keep track of past conversations. The history service is especially important for giving the agent context and allowing us to analyze how interactions have unfolded over time.

## Interface IOperatorInstanceCallbacks

This interface lets you listen in on what’s happening with individual AI agents within your swarm. Think of it as a way to get notified about key moments in an agent's lifecycle and interactions. 

You can receive a notification when an agent first starts up (`onInit`), when it provides an answer to a question (`onAnswer`), or when it sends a message (`onMessage`). 

The `onNotify` callback tells you when an agent sends a notification, and `onDispose` lets you know when an agent is shutting down. Each of these callbacks includes information about the client involved, the agent's name, and the content of the message or answer.

## Interface IOperatorInstance

This interface describes how you interact with a single agent within a larger system of agents working together. Think of it as a way to control and communicate with one agent at a time. 

You can use `init` to get the agent ready to work. Once initialized, `recieveMessage` lets you send information to the agent, and `answer` allows the agent to respond back to you.  `notify` is for sending less critical information. 

When you’re finished with the agent, `dispose` cleans up its resources and stops its connection. `connectAnswer` sets up a special function that will be called whenever the agent sends an answer.

## Interface IOperatorControl

This interface lets you customize how your AI agents work together within the orchestration framework. You can essentially tell the system which specific functions you want it to use when interacting with individual AI agents. 

Think of it as providing building blocks for how the framework manages and communicates with each agent. 

The `useOperatorCallbacks` property allows you to define what actions the framework should take when certain events happen during an agent's operation. The `useOperatorAdapter` property enables you to provide your own specialized class to handle the creation and management of individual agent instances.

## Interface INavigateToTriageParams

This interface helps you customize how your system handles moving between AI agents, specifically when navigating to a triage agent. You can use it to inject custom messages or functions at different points in the process.

Before an agent switch happens, you can provide a `beforeNavigate` function to perform checks or setup. The `lastMessage` function allows you to modify the previous user message to better inform the next agent. If navigation fails, a `flushMessage` can be sent to clear the session.  If no navigation is needed, `executeMessage` provides a way to provide a continuation prompt.  Finally, `toolOutputAccept` and `toolOutputReject` let you tailor feedback to the user depending on whether the navigation was successful or not.

## Interface INavigateToAgentParams

This interface lets you fine-tune how the system navigates between different AI agents. You can use it to inject custom messages or functions at various points during the navigation process. 

Before an agent starts navigating, you can provide a `beforeNavigate` function to run any necessary setup or checks. If navigation fails and a session needs to be restarted, you can specify a `flushMessage` – either a static message or a function that generates one. 

You can also provide a `toolOutput` message to give feedback to the AI model about the navigation action. The `lastMessage` property allows you to modify the user's previous message before sending it to the new agent, ensuring it's properly formatted for the new context. 

If navigation happens without any action needing to be executed, the `emitMessage` property lets you send a specific message.  Finally, when the navigation requires an actual command to be run on the new agent, the `executeMessage` property defines what that command will be.

## Interface IModelMessage

This interface, `IModelMessage`, represents a single message exchanged within the agent swarm system. Think of it as the fundamental unit of communication – it’s what agents, tools, users, and the system itself use to talk to each other. It’s crucial for keeping track of what's happened, generating responses, and broadcasting events across the swarm.

Each message has a `role` indicating who or what sent it (like a user, an assistant model, or a tool). There's also an `agentName` to identify which specific agent created the message, especially important in swarms with multiple agents working together. The `content` is the actual text or data being transmitted.

To clarify the origin of the message, there's an `mode` property, which helps distinguish between user inputs and tool outputs. If a model wants a tool to run, the message might include `tool_calls` – a list of instructions for those tools. You can also find optional `images` or a more detailed `payload` attached to the message if needed. Finally, the `tool_call_id` connects a tool's output to its originating request.

## Interface IMethodContext

This interface, `IMethodContext`, acts like a little passport for each method call within the AI agent swarm. It holds key information about that specific call, like which client is making the request, which method is being used, and which resources – storage, compute, policies – are involved. Services throughout the system, like those handling performance monitoring, logging, and documentation, use this context to keep track of what’s happening and provide useful insights. Think of it as a standardized way to tag each action, enabling better overall visibility and management of the agent swarm.

## Interface IMetaNode

This interface, `IMetaNode`, describes how information about agents and their connections are organized. Think of it as a blueprint for building a tree-like structure that visually represents how agents relate to each other and what resources they use. Each node in this tree has a `name`, which clearly identifies what it represents, like an agent's name or a specific resource. It can also have `child` nodes, allowing you to show more detailed relationships and dependencies—like showing which agents rely on other agents or utilize particular resources. Essentially, it’s a way to map out the agent network and make it understandable.

## Interface IMCPToolCallDto

This interface describes the information passed around when an agent requests a tool to perform a task. Think of it as a structured message containing details about the tool being used, who's requesting it (the agent and client), the specific parameters needed for the task, and whether it's the final step in a chain of actions. It also includes a way to cancel the request if needed and keeps track of any related tool calls. Essentially, it's how the system manages tool usage by agents.

## Interface IMCPTool

This interface outlines what makes up a tool within the agent swarm system. Every tool needs a name so we know what it is. 

You can also provide a description to help others understand what the tool does. 

Finally, and importantly, each tool needs a defined input schema – this tells the system what kind of data the tool expects to receive to function correctly, specifying the data types and required fields.

## Interface IMCPSchema

This interface outlines the blueprint for a core component within the agent swarm – the MCP (Mission Control Process). Think of an MCP as a mini-program designed to manage and coordinate a specific task.

Each MCP has a unique name and can optionally have a description to help understand its purpose. 

Crucially, an MCP knows how to list the tools it offers to different clients and how to actually *use* those tools by calling them with specific data. Finally, developers can set up optional callbacks to respond to events happening within the MCP’s lifecycle.

## Interface IMCPParams

This interface defines the required settings for managing and coordinating a group of AI agents – think of it as the blueprint for how your swarm will communicate and keep track of what's happening. It ensures each agent swarm has a way to log its actions and a system for sending messages and reacting to events within the group. Specifically, it requires a logger to record important information and a bus to facilitate communication between the agents.

## Interface IMCPConnectionService

This interface defines how different parts of the system communicate using a simple message-passing protocol, similar to how computers send data to each other. It provides a way to reliably send and receive messages between agents, ensuring that instructions and information get where they need to go. Think of it as the postal service for your AI agents – it handles the delivery process. You'll use these methods to establish connections, send commands, and receive responses, allowing your swarm to coordinate its actions. It provides the foundation for a dependable and structured communication channel within the agent network.

## Interface IMCPCallbacks

This interface defines a set of functions that your application can use to be notified about what's happening with the AI agent swarm orchestration framework. Think of it as a way to "listen" for important events.

You’re notified when the framework first starts up, and again when resources related to a specific client are released. When the framework needs to gather available tools for a client, or when it’s generating a list of those tools, you’re alerted. 

Most importantly, you’re called whenever a tool within the swarm is actually used—this provides details about which tool was called and the data associated with the call. Finally, you receive updates whenever the available tools for a particular client change.

## Interface IMCP

This interface lets you manage the tools available to your AI agents. You can use it to see what tools are offered to a particular agent, check if a specific tool is available, and actually run a tool with given inputs. The system also allows you to refresh the list of tools, either globally or for a single agent, ensuring you always have the latest options. Think of it as a central control panel for what your agents can do.

## Interface IMakeDisposeParams

This interface defines the settings you can provide when you want to automatically shut down an AI agent session. 

You can specify a `timeoutSeconds` value, which determines how long the session will run before it's automatically closed. 

Optionally, you can also provide an `onDestroy` callback function. This function will be called after the session is automatically closed, allowing you to perform any necessary cleanup tasks. It tells you which client and swarm are being shut down.

## Interface IMakeConnectionConfig

This interface helps you control when messages are sent from your AI agent swarm. It lets you specify a delay, measured in milliseconds, to schedule messages or to limit how frequently they're sent. Think of it as a way to prevent your agents from overwhelming a system or to ensure they operate at a reasonable pace.

## Interface ILoggerInstanceCallbacks

This interface lets you customize how a logger works within your agent swarm. You can think of it as a set of hooks that allow you to react to different stages of the logger's life – when it starts up, when it shuts down, and whenever it records a log message.

Specifically, you can define functions to be called when the logger is initialized, when it’s time to clean up, and each time a debug, info, or regular log is written. These callbacks provide a way to monitor, react to, or even modify the logging behavior of your agents. The `clientId` helps you identify which agent is producing the log messages.

## Interface ILoggerInstance

This interface defines how a logger should behave within the orchestration framework, allowing for specific setup and cleanup actions for each client. 

Each logger implementation needs a way to be initialized, which the `waitForInit` method provides; it allows for an initial state to be checked and handles potential asynchronous setup. 

Similarly, `dispose` provides a way to cleanly shut down the logger, releasing any resources it’s using and performing necessary cleanup actions. This ensures that the framework can properly manage and release resources associated with each client.

## Interface ILoggerControl

This interface lets you fine-tune how logging works within your AI agent swarm. You can use it to set up a central logging system, customize how logger instances are created, and define lifecycle callbacks to control their behavior. It also provides convenient methods to log messages—info, debug, and general—specifically tied to individual clients, ensuring each client’s logs are tracked separately and securely. You can effectively shape the entire logging process to fit your application's needs.

## Interface ILoggerAdapter

This interface outlines how different systems can connect to our agent swarm orchestration framework and send log messages. It provides a standard way to record events, debug issues, and monitor the overall health of the system, regardless of where the logging is actually happening. 

Each logging function—log, debug, info—takes a client identifier and a topic, allowing us to pinpoint the origin of the message. The `dispose` function lets you clean up a client’s logging resources when they’re no longer needed, ensuring efficient resource management. Essentially, it's the bridge between our core system and the specific logging tools you want to use.

## Interface ILogger

This interface defines how different parts of the AI agent swarm system can record information. It allows components to send messages about what's happening – whether it's a simple update, a detailed debug message, or just a notification that something completed successfully. This logging is really helpful for understanding how the system is working, spotting problems, and keeping track of what's been done. You'll find it used by agents, session managers, and other parts of the framework to provide insights into their operation.

## Interface IIncomingMessage

This interface describes a message that arrives within the AI agent swarm. It represents information coming from an external source, like a user's input or a connected application.

Each message has a `clientId`, which is a unique identifier for the client that sent it – think of it as knowing *who* sent the message. It also carries `data`, which is the actual content of the message, like the user's query. Finally, `agentName` tells the system which agent is responsible for handling that specific message. This ensures the right agent processes the information and takes appropriate action.

## Interface IHistorySchema

This interface describes how your AI agent swarm keeps track of past conversations. Think of it as the blueprint for the system that remembers what's been said. It focuses on how that history is stored and retrieved, using an adapter that handles the specifics of the storage mechanism—whether it's a database, a file, or something else. The `items` property defines exactly which adapter is being used to manage those historical messages.

## Interface IHistoryParams

This interface defines the information needed to set up a record of an agent's activity. Think of it as a blueprint for how we keep track of what an agent does. It includes the agent's name, a way to limit how much of the conversation we store to manage memory, a client identifier, a logger for recording events, and a communication channel (bus) for sending updates within the larger system.  Essentially, it’s all the details required to build a historical record for a specific agent working within the swarm.

## Interface IHistoryInstanceCallbacks

This interface lets you customize how the history of an AI agent's conversations is managed. You can define functions to get the initial set of messages, filter which messages are included, and react to changes in the history—like when a new message is added or the last one is removed.  It also provides callbacks for marking the start and end of reading the history, and for handling the lifecycle of the history instance itself, including when it's first created and when it’s no longer needed. A reference to the history instance is also passed when available, allowing for direct interaction if needed.

## Interface IHistoryInstance

This interface describes how to work with a history of messages for each agent in your AI agent swarm. It lets you go through past interactions for a specific agent, ensuring the history is ready to use, adding new messages as they happen, retrieving the most recent message, and cleaning up the history when an agent is no longer needed. You can think of it as a way to manage and access the ongoing conversation for each agent, allowing you to track and potentially analyze their activities. The `iterate` method is for reviewing past events, `waitForInit` makes sure everything is set up correctly, `push` adds new data, `pop` retrieves the latest, and `dispose` cleans up the space.

## Interface IHistoryControl

This interface lets you fine-tune how your AI agent swarm remembers and tracks its actions. 

You can use `useHistoryCallbacks` to specify functions that get called at key moments in the history's lifecycle, allowing for custom logging or monitoring. 

Alternatively, `useHistoryAdapter` gives you the power to completely replace the default history mechanism by providing your own custom constructor for creating history instances, enabling deeper integration or specialized behavior.

## Interface IHistoryConnectionService

This interface helps us define how services that manage the history of interactions within our AI agent swarm will work. It's a way to clearly outline the actions and data these services expose, while keeping the internal workings separate. Think of it as a blueprint for building reliable and predictable history management systems within the swarm. It ensures that the publicly available features of a history service match exactly what users and other components can expect.

## Interface IHistoryAdapter

This interface lets you manage a record of conversations between agents. You can think of it as a logbook for your AI agents.

The `push` method allows you to add new messages to this logbook, associating them with a specific client and the agent involved. 

You can retrieve the most recent message using `pop`, which removes it from the log.

The `dispose` method provides a way to clear the entire conversation history for a particular client and agent, effectively ending their record.

Finally, `iterate` lets you step through the history of messages for a specific client and agent, allowing you to review past interactions.

## Interface IHistory

This interface lets you keep track of all the messages exchanged with an AI model, whether it’s part of a larger agent swarm or used directly. You can add new messages using the `push` method, and retrieve the most recent message using `pop`. 

Need to format the history for a specific agent? The `toArrayForAgent` method lets you tailor the message sequence based on a prompt and system instructions. If you just need all the raw messages, the `toArrayForRaw` method provides them in an array.

## Interface IGlobalConfig

This section describes a set of configuration settings that control the behavior of an AI agent swarm orchestration framework. It's designed to be customizable, allowing you to tailor the system's actions to specific needs.

Here's a breakdown of what these settings do:

*   **Handling Errors:** You can configure how the system responds to errors in tool calls, choosing to flush the conversation, retry with corrections, or use a custom approach.
*   **User Experience:** Settings manage placeholder responses for empty outputs, enhancing user interaction.
*   **Agent Behavior:** Limits are set for the number of tool calls per execution and the number of messages stored in the conversation history. Functions determine default agents for swarms and manage navigation stacks.
*   **Logging & Debugging:** Several flags control the level of logging – from basic information to detailed debugging data – helping diagnose and monitor system performance.
*   **Customization Hooks:**  Many settings are callbacks or functions that can be overridden to add custom logic, like transforming agent outputs, validating tool parameters, or managing data storage.
*   **Persistent Storage:** Settings enable or disable persistent storage for various components, including embeddings and data.
*   **Security & Validation:** Configuration dictates how banned clients are managed and how tool validations are carried out.
*   **Preventing infinite loops:** System configuration to throw error in certain recursion scenarios.

This framework aims to provide a flexible and adaptable environment for managing complex AI agent interactions, allowing developers to fine-tune system behavior and tailor the experience to their specific applications.

## Interface IExecutionContext

This interface, `IExecutionContext`, acts as a central record for tracking what's happening within your AI agent swarm. Think of it as a digital breadcrumb trail, ensuring different parts of the system – like the client interface, performance monitoring, and message routing – all have a shared understanding of a particular task.  It includes a unique identifier for the client session, a specific execution instance, and the overall process it belongs to.  This shared context helps with debugging, performance analysis, and overall system coordination.

## Interface IEntity

This interface forms the foundation for all data objects that are stored and managed within the AI agent swarm. Think of it as the common blueprint – every piece of information the swarm keeps track of inherits from it.  It establishes a basic structure that specialized interfaces build upon, allowing for different kinds of entities like those tracking agent status or detailed state information to have their own unique properties while still sharing a common base.

## Interface IEmbeddingSchema

This interface helps you set up how your AI agents understand and compare information within the swarm. You can tell it to save agent states and navigation details for later use, and give it a unique name so the swarm knows which embedding method is being used. 

It lets you define how embeddings (numerical representations of text) are stored and retrieved, preventing the swarm from repeatedly calculating the same embeddings. You can also customize what happens during the creation and comparison of these embeddings through optional callback functions.

The interface provides tools to generate embeddings from text and to measure how similar two embeddings are – essential for things like finding related information or ranking agent responses.

## Interface IEmbeddingCallbacks

This interface lets you tap into what's happening when your AI agents are generating and comparing embeddings – those numerical representations of text. You can use the `onCreate` callback to observe when a new embedding is made, which is helpful for tracking or tweaking the embedding process. Similarly, the `onCompare` callback lets you see what happens when two pieces of text are compared for similarity, letting you monitor how close or different the AI considers them to be. It's all about getting insights into the embedding calculations your agents are doing.

## Interface ICustomEvent

This interface lets you create and send custom events within the swarm system, offering a way to share information beyond the standard event types. Think of it as a flexible way to communicate specific data between agents when a predefined event isn't suitable. It builds upon a base event structure, but the key difference is the ability to include any kind of data you need through the 'payload' property.  This lets you tailor events for unique scenarios, such as signaling a process completion or passing along specialized results.

## Interface IConfig

This configuration setting lets you control how much detail appears in the diagrams. When enabled, the diagrams will show relationships and dependencies within subtrees, providing a more comprehensive view. Disabling it keeps the diagram focused on the top-level connections.

## Interface IComputeSchema

The `IComputeSchema` interface describes the blueprint for a compute unit within your AI agent swarm. Think of it as a recipe that tells the system how to run a specific task. 

It includes details like a descriptive name (`computeName`), whether it's shared among agents (`shared`), and how long it should remain active (`ttl`). You can specify dependencies on other compute units (`dependsOn`) to ensure tasks run in the correct order. 

The `getComputeData` function defines how the system retrieves the actual data needed for the compute.  `middlewares` allow you to add extra steps before or after the core logic. Finally, `callbacks` provide a way to react to different stages of the compute unit's lifecycle, such as when data changes or the unit is updated.

## Interface IComputeParams

This interface defines the information needed to run a computation within our agent swarm orchestration framework. It includes a unique client identifier to track the request, a logger for recording events, and a messaging bus for communication. Crucially, it also specifies a list of state changes that, when they happen, should trigger the computation to re-run and the data to update. Think of it as telling the system "pay attention to these specific changes and recalculate when they occur."

## Interface IComputeMiddleware

This interface defines the structure for middleware components that sit between your AI agents and the core orchestration logic. Think of it as a way to intercept and modify data flowing in and out of your agents, allowing you to add custom functionality like data validation, logging, or even transformation. Each middleware implementation should provide functions to handle incoming agent responses and outgoing tasks, providing a consistent point for adding your own specialized behavior to the agent swarm. It's designed to be flexible, letting you tailor the interaction flow to your specific needs.

## Interface IComputeConnectionService

This interface defines how your AI agents connect to external compute resources, like databases or APIs. Think of it as a blueprint for establishing reliable links between your agents and the tools they need to work. It builds upon the basic ComputeConnectionService, ensuring consistency in how these connections are managed within the system.

## Interface IComputeCallbacks

This interface provides a way to hook into the lifecycle of a compute unit within the AI agent swarm. Think of it as a set of event listeners you can register to be notified about important moments.

You're notified when a compute unit is first initialized, allowing you to set up any initial configurations. Similarly, you'll receive a notification when a compute unit is being disposed of, enabling clean-up tasks.

Whenever the compute unit actually performs a calculation, you’re informed. You're also alerted when the data stored within the compute unit changes, giving you a chance to respond to those updates. Finally, you're notified when the compute unit’s configuration is updated.

## Interface ICompute

The `ICompute` interface defines how you can interact with a compute component within the agent swarm. It allows you to trigger calculations by providing a state name, update the status of a computation, and retrieve the results of the computation. Think of it as a way to manage and monitor ongoing calculations within your swarm, getting the data when it's ready. The `calculate` function initiates a new computation, `update` keeps track of its progress, and `getComputeData` lets you access the final output.

## Interface ICompletionSchema

This interface describes how different parts of the AI agent swarm create and handle completions, like generating text or outlines. Each completion mechanism gets a unique name for easy identification. You can specify whether the completion should be formatted as JSON, and provide a list of flags to pass to the underlying language model, such as disabling reasoning steps. The interface also lets you define optional callback functions to run after a completion is generated, giving you control over what happens next. Finally, the `getCompletion` method is the main way to request a completion, taking arguments and returning either a model's response or a structured outline.

## Interface ICompletionCallbacks

This interface lets you hook into what happens after an AI agent completes its task. 

You can define a function – specifically, the `onComplete` property – that gets called when the agent finishes. 

This function receives information about the completion itself and any resulting output from the model, allowing you to take actions like saving results, displaying progress, or starting another process. It's a way to customize the workflow beyond the core agent execution.

## Interface ICompletionArgs

This interface defines what's needed when you ask the system to generate a response, like finishing a thought or creating a piece of code. It includes identifying information about who's making the request (the `clientId`), which agent needs the response (`agentName`), and if the response should fit a specific structure (`outlineName`).

You provide the context for the response by sending previous messages (`messages`), and you can optionally tell the system which tools are available to use (`tools`).  If you want the response to follow a pre-defined format (like a JSON outline), you can specify the `format`. The `mode` property tells the system whether the last message came from a tool or directly from a user.

## Interface ICompletion

This interface defines how your AI agents can get responses from a language model. Think of it as a standard way for agents to ask a model a question and receive an answer. It builds upon a basic completion structure, but adds all the necessary pieces to make the process reliable and flexible, allowing you to control how the agent gets its information.

## Interface IClientPerfomanceRecord

This interface describes the performance data collected for each individual client, like a specific user session or agent instance, within a larger process. Think of it as a detailed report card for each client’s activity.

It tracks things like the client's unique ID, any data it's storing temporarily (`sessionMemory`), and its persistent state (`sessionState`).

You’re also getting information about how much the client is working – the number of times it's executed commands, the size of the data it’s sending and receiving, and how long those executions take, both in total and on average. This data helps you understand how each client is performing and identify any bottlenecks or inefficiencies.

## Interface IChatInstanceCallbacks

This interface defines a set of callbacks that your application can use to stay informed about the lifecycle and activity of a chat instance within an AI agent swarm. 

You're notified when an instance first starts up (`onInit`), when it's finished and being cleaned up (`onDispose`), and when a chat session actually begins (`onBeginChat`). 

You're also alerted whenever a message is sent (`onSendMessage`), and when the system checks if an instance is still active (`onCheckActivity`), giving you data about its status and last activity. These callbacks provide a way for your system to react to changes and manage the chat instances effectively.

## Interface IChatInstance

This interface defines how to interact with a single chat session within the agent swarm. You can start a chat using `beginChat`, and then send messages to the other agents involved with `sendMessage`.  To keep the chat session alive, `checkLastActivity` verifies if there's been recent interaction. When you're finished with the chat, `dispose` cleans up resources. Finally, `listenDispose` allows you to be notified when a chat session is being closed.

## Interface IChatControl

This framework lets you easily connect different chat interfaces – think of it like swapping out the way your AI agents communicate. The `useChatAdapter` method is how you tell the system which chat interface you want to use, providing a blueprint for creating those chat connections. 

Similarly, `useChatCallbacks` allows you to customize how your AI agents respond to events and actions within the chat, letting you tweak their behavior and add extra functionality. You can provide a set of functions that the system will call at specific moments, effectively plugging in your own logic.

## Interface IChatArgs

This interface, `IChatArgs`, defines the data needed for a chat interaction within the AI agent swarm. Think of it as a standard container for the information being passed between components. Each chat request needs a `clientId`, which is a unique way to identify where the request came from. You also need to specify which `agentName` is responsible for handling the conversation. Finally, the core of the interaction is the `message` itself, which is the actual text being sent or received.

## Interface IBusEventContext

This interface helps give events more context within the swarm system. Think of it as a way to tag an event with information about which agent, swarm, storage, state, compute, or policy it relates to.

When an agent is doing something, like a ClientAgent, it will usually just include the agent’s name in this context. However, other parts of the system, like when a swarm is managing tasks or a policy is being applied, might use all these fields to provide more details about what's happening. 

It's a way to connect events to specific components within the swarm, making it easier to track and understand what's going on. Each field – agentName, swarmName, storageName, stateName, computeName, and policyName – represents a unique identifier for those respective components.

## Interface IBusEvent

This interface describes the structure of messages sent across the swarm system's internal communication channels. Think of it as a standardized way for different parts of the system, particularly agents, to tell each other what's happening.

Each message has a `source` indicating where it came from (usually "agent-bus" for messages originating from an agent), a `type` which defines the action being performed (like "run" or "commit-user-message"), and `input` and `output` sections to carry any relevant data.  There's also a `context` section that provides additional information, typically including the agent's name.  This consistent format allows the system to understand and react appropriately to different events.

## Interface IBus

The `IBus` interface acts as a central communication channel within the swarm system. It allows agents to send notifications and updates to specific clients, promoting a loosely coupled architecture. Think of it as a way for different parts of the system to talk to each other without needing to know the details of how the other part works.

Agents use the `emit` method to broadcast events like message commitments, tool executions, or the completion of tasks. These events are structured and follow a standard format, including information about the event's type, origin, data, and the target client. The `emit` method sends these events asynchronously, meaning they’re queued for delivery rather than processed immediately. 

The `clientId` in the event is a key piece of information, ensuring that messages reach the correct recipient.  This method is often used to keep clients informed of activity within the system, like updates to history or results from tools. Events often contain information about the origin agent, ensuring accountability and traceability. The generic type `<T>` helps maintain a consistent structure for the events being sent.

## Interface IBaseEvent

This interface sets the groundwork for all events happening within the AI agent swarm. Every event, no matter its purpose, will have a `source` to tell you where it came from and a `clientId` to specify which agent or session it's intended for. Think of the `source` as the event's origin point – like "custom-source" for a basic event or "agent-bus" when it’s coming from an agent. The `clientId` acts like a delivery address, guaranteeing the message gets to the right place within your system, such as a specific user session.

## Interface IAgentToolCallbacks

This interface lets you customize how individual tools within your AI agent swarm operate. You can use these callbacks to track what’s happening, make sure things are set up correctly before a tool runs, or handle errors that might occur.

Specifically, `onBeforeCall` lets you run code just before a tool is used – think of it as a chance to log the call or prepare some data. `onAfterCall` is its counterpart, running after the tool has finished, perfect for cleanup or confirming results. 

`onValidate` gives you the power to ensure the input parameters for a tool are correct before it even starts, preventing unexpected problems. Finally, `onCallError` helps you gracefully manage any errors that happen during tool execution, allowing you to log them or even attempt to recover.

## Interface IAgentTool

This interface, `IAgentTool`, describes a tool that an AI agent can use within a swarm. Each tool needs a name to be recognized, and a way to check if it's ready to be used – maybe it depends on some external resource.

Before a tool runs, it’s important to make sure the input is correct, which is handled by a validation step. You can also add optional callbacks to customize how the tool behaves during its lifecycle.

The `call` method is how the tool is actually executed, taking into account the client, agent, parameters, and other context. A dynamic factory is also provided for resolving tool metadata.

## Interface IAgentSchemaInternalCallbacks

This interface provides a way to plug in custom actions at different points in an agent's lifecycle. You can use these callbacks to monitor what the agent is doing, log important events, or even influence its behavior.

There are callbacks for when the agent starts (`onInit`), runs a stateless action (`onRun`), begins execution (`onExecute`), tools produce output (`onToolOutput`), system or developer messages are generated, and when a tool request is made (`onToolRequest`). You can also hook into events like tool errors (`onToolError`), assistant and user messages, history flushing (`onFlush`), and agent disposal (`onDispose`).

Furthermore, there’s a callback that fires when an agent is revived after a pause or failure (`onResurrect`), one for when the agent generates a final output (`onOutput`), and one for after all tools have been called (`onAfterToolCalls`). Each callback provides details like client ID, agent name, and relevant data for the specific event.

## Interface IAgentSchemaInternal

This interface defines how an agent is configured within the system. It describes all the settings that shape an agent's behavior, from its name and core prompt to the tools it can use and how it interacts with other agents.

You can specify the agent's purpose with a `prompt` and provide additional context with `system` prompts. The `tools` and `storages` arrays list the resources the agent has access to. The `dependsOn` property allows an agent to rely on the output or state of another agent.

The system provides ways to control the agent’s actions: you can limit the number of tool calls with `maxToolCalls` and manage the size of the conversation history with `keepMessages`.  There’s a way to adjust the agent's output before it's used, either by validating it with a `validate` function or transforming it with a `transform` function. Finally, `callbacks` let you customize specific moments in the agent’s lifecycle.

## Interface IAgentSchemaCallbacks

This interface defines a set of optional callbacks that you can use to monitor and react to different stages of an agent's lifecycle. Think of them as hooks that allow you to tap into what's happening behind the scenes as the agent runs – whether it's when it first starts, when it's using tools, generating output, or even recovering from a pause. You can use these callbacks for things like logging, debugging, or custom integrations.

Here's a breakdown of what each callback does:

*   `onRun`: Notifies you when the agent executes without saving any history.
*   `onExecute`: Lets you know when an agent starts running.
*   `onToolOutput`: Signals when a tool used by the agent has produced a result.
*   `onSystemMessage`:  Alerts you to any messages generated by the system related to the agent.
*   `onToolRequest`: Triggers when the agent needs to use a tool, giving you a chance to handle the request.
*   `onAssistantMessage`: Informs you when the agent commits a message.
*   `onUserMessage`:  Notifies you when a user sends a message to the agent.
*   `onFlush`:  Indicates that the agent's history is being cleared.
*   `onOutput`:  Signals that the agent has produced some output.
*   `onResurrect`:  Lets you know when the agent is restarted after a pause or error.
*   `onInit`:  Provides a notification when the agent is initialized.
*   `onDispose`:  Signals that the agent is being shut down.
*   `onAfterToolCalls`:  Alerts you when all the tools the agent planned to use in a sequence have finished.

## Interface IAgentSchema

This interface, `IAgentSchema`, defines the structure for configuring individual agents within the swarm. It allows you to specify instructions and context for each agent using system prompts. 

You can provide static system prompts directly as strings or arrays of strings.  The `systemStatic` property is simply another way to define those static prompts.

For more complex scenarios, the `systemDynamic` property lets you create system prompts that change based on the agent's identity and the current context. This is achieved with a function that generates prompts dynamically.

## Interface IAgentParams

This interface defines how an individual agent within the system operates. It bundles together essential components like a unique client ID, a logging system for tracking activity, and a communication bus to interact with other agents. Agents also have access to tools for performing actions, a history tracker, and a completion mechanism to generate final results. Furthermore, there's a validation step to ensure the agent's output is correct before it's finalized. Think of it as a blueprint for how each agent knows who it is, what it can do, and how it fits within the larger swarm.

## Interface IAgentNavigationParams

This interface helps you define how an agent should move or interact with other agents within the system. Think of it as a set of instructions for an agent’s journey. You specify the tool's name and what it does with a description. You also tell it which agent it needs to reach using `navigateTo`. Finally, you can add some extra notes for documentation purposes with the `docNote` field.

## Interface IAgentConnectionService

This interface helps define how different AI agents connect and communicate within the system. Think of it as a blueprint for establishing links between agents, but it's designed to focus on the parts that are meant to be public and accessible, hiding the underlying technical details. It ensures that the external-facing services related to agent connections are well-defined and consistent.

## Interface IAgent

This interface defines how you interact with an individual agent within a larger orchestration system. You can use the `run` method for quick, isolated tasks without affecting the agent’s memory. The `execute` method is used for regular operations that might update the agent's history.

To manage the agent’s state and memory, you have several commit methods. These let you add messages – user inputs, system instructions, tool outputs, and developer messages – to the agent’s history.  You can also submit tool requests and handle assistant responses.

The interface provides ways to control the agent’s flow, like flushing its memory, stopping tool execution, and canceling ongoing outputs. These methods give you fine-grained control over the agent’s behavior and lifecycle.
