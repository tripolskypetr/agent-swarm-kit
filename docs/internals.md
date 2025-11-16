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

This function checks that everything is set up correctly within your AI agent swarm – ensuring your swarms, individual agents, and outlines are all valid. It’s designed to be safe to run repeatedly; it only runs the validation process once each time it’s called. Think of it as a quick health check for your agent system.

## Function startPipeline

This function lets you kick off a predefined sequence of actions, or "pipeline," within the AI agent swarm. Think of it as telling the system, "Hey, I want this specific process to run, using this particular agent." You provide a unique identifier for the client requesting the work, the name of the pipeline you want to execute, and the agent responsible for handling it. Optionally, you can also pass data, represented as a payload object, which the agent will use during the pipeline's execution. The function will then promise a result of type `T`, representing the outcome of the completed pipeline.


## Function scope

This function lets you run pieces of code – think of them as individual tasks – within a controlled environment that manages things like AI agents and data pipelines. 

You give it a function you want to execute, and it handles the underlying setup and resources needed for that function to work correctly.

Optionally, you can tweak how that function interacts with those resources, like specifying which AI agent to use or which data pipeline to access. 

The function will take care of setting everything up and then running your code, providing you with the result or confirming successful completion. It’s designed to simplify complex workflows and ensure consistency across different tasks.

## Function runStatelessForce

This function lets you send a message to your AI agent swarm and have it processed immediately, without adding it to the ongoing conversation history. It's perfect for things like saving data or running quick tasks where you don't want the agent's memory cluttered. 

Importantly, this function *always* runs the message, even if the agent isn’t actively working at the moment. It takes the message content and a unique client ID to identify the request. Behind the scenes, it ensures the session and swarm are valid, tracks how long the process takes, and provides notifications about what's happening.

## Function runStateless

This function lets you quickly send a message to a specific agent in your swarm without adding it to the ongoing conversation history. Think of it as a one-off command or a way to process data without cluttering the agent's memory. 

It’s especially useful for tasks like handling information from external storage or running isolated tasks where keeping a full chat record isn't necessary.

To use it, you provide the message content, a unique client identifier, and the name of the agent you want to use. The system makes sure the agent is still available and the operation is skipped if the agent has changed since the session started. 


## Function overrideTool

This function lets you update the details of a tool already registered within the agent swarm. Think of it as modifying a tool's definition – you can change its name, how it works, or its associated information.  It's designed to work independently, ensuring changes are isolated and doesn't affect ongoing processes. If your system is set up to log activity, this override will be recorded. You simply provide the new or modified tool configuration, and the function takes care of updating it in the swarm.

## Function overrideSwarm

This function lets you update a swarm’s configuration directly. Think of it as replacing or modifying a swarm's blueprint. You provide a new schema, and the system applies it to the specified swarm, essentially giving it a fresh set of instructions. It's designed to be a standalone operation, keeping things isolated and controlled, and it will record the change if logging is turned on. You’re giving the swarm a new set of rules to follow.


## Function overrideStorage

This function lets you change how your swarm stores data. Think of it as updating the blueprint for a specific storage location within the system. You can provide a new or partial schema, and it will adjust the existing configuration.  The update happens in a controlled environment to keep things isolated. If logging is turned on, you’ll see a record of this change. You just provide the changes you want to apply to the existing storage configuration.

## Function overrideState

This function lets you modify the structure and definition of a state within the swarm system. Think of it as updating a blueprint – you can change parts of it without rebuilding the whole thing. It’s designed to be a direct and isolated change, ensuring the modification happens cleanly and doesn't interfere with anything else happening in the system.  You provide a new or partial state schema, and this function applies those updates to the existing state configuration. The process is logged if logging is turned on in the global settings.


## Function overridePolicy

This function lets you change a policy's settings within the swarm system. Think of it as updating a rule – you can provide a completely new definition or just modify parts of an existing one. The update happens independently, ensuring it doesn't interfere with anything else that's currently running. If logging is turned on, this action will be recorded for tracking purposes. You simply give it a new policy definition, and it takes care of applying the changes.

## Function overridePipeline

This function lets you tweak an existing pipeline definition, essentially allowing you to make targeted changes without rewriting the whole thing. Think of it as a way to add or modify specific parts of a pipeline’s structure. You provide a partial pipeline schema—just the pieces you want to change—and this function merges those updates onto the original pipeline. This is useful when you need to adjust a pipeline’s behavior or configuration based on different scenarios or requirements.

## Function overrideOutline

This function lets you modify an existing outline schema, which defines how tasks are organized within the AI agent swarm. Think of it as updating a blueprint for how your agents work together. 

To ensure everything runs smoothly and doesn't conflict with other processes, it starts with a fresh, clean environment.  It also records what's happening if you're using logging.

You provide a partial outline schema—just the changes you want to make—and the function applies them to the current outline configuration.

## Function overrideMCP

This function lets you modify an existing Model Context Protocol (MCP) definition. Think of an MCP as a blueprint for how an AI agent understands its environment and tasks. 

You can use `overrideMCP` to update or extend this blueprint, essentially customizing how agents interpret information. It takes an existing MCP schema as input and returns a modified version. This is useful for tailoring the framework to specific use cases or integrating with custom agent designs.


## Function overrideEmbeding

This function lets you change how the system handles embeddings, acting as a way to update their configuration directly. You provide a new schema definition, and the system applies it to the specified embedding mechanism. Think of it as a way to tweak the embedding process without affecting ongoing operations – it runs independently to keep things clean. The system will also record this change if logging is turned on. You essentially give it a new blueprint for how embeddings should work.

## Function overrideCompute

This function lets you modify an existing compute schema, like tweaking settings or adding new parameters. Think of it as a way to adjust how a specific computation is handled within the agent swarm. You provide a partial schema—just the changes you want to make—and it merges those changes into the original compute schema. This gives you flexibility to customize computations without recreating them from scratch.

## Function overrideCompletion

This function lets you change how the swarm generates responses, essentially swapping out or modifying a completion strategy. Think of it as updating a recipe – you're providing a new set of instructions for the system to follow when crafting its replies.  It doesn’t affect anything else happening in the swarm, ensuring a focused change. The system keeps track of these changes too, logging the override if you’ve enabled that feature in the global settings.  You provide the new or updated schema as input, and the function handles the rest.

## Function overrideAgent

This function lets you update the blueprint for an agent already running in the swarm. Think of it as changing an agent's instructions – you can provide a completely new set of instructions or just tweak a few details. The system makes sure this change is handled separately, without interfering with any ongoing tasks.  It's a way to dynamically adjust agent behavior and ensures a controlled modification process. The function takes the new agent schema as input, which defines the agent's configuration.

## Function overrideAdvisor

This function lets you update the settings for an advisor within the swarm. Think of it as modifying an advisor's configuration on the fly. You provide a partial definition of the advisor's schema, including its name, and only the properties you specify will be changed – existing settings remain untouched.  It works independently, ensuring changes are isolated, and the system logs the action if logging is active.

## Function notifyForce

This function lets you send a message directly out of a swarm session, like a notification, without having it trigger any of the usual processing steps. It's specifically for sessions created using "makeConnection."

Think of it as a way to communicate with an agent without having it react to what you’re sending.

The system double-checks that the agent is still running and the session is valid before sending the message. It also creates a clean environment for the message and keeps a record of the action if logging is turned on. It won't work unless you're using a "makeConnection" session.

You provide the message content and a unique ID for the client session to use this function.

## Function notify

This function lets you send a message directly out of the swarm session, like a notification, without it being processed as a normal incoming message. It's specifically for sessions created using "makeConnection."

Think of it as a way to broadcast information to the agents, confirming something happened or providing updates.

Before sending, the system checks to ensure everything is still working correctly—the session, the swarm, and the agent you're targeting—and skips the notification if things have changed. It keeps things clean by creating a fresh environment and records the action in the logs if logging is enabled. It won't work unless you're using the "makeConnection" session type.

You're providing the actual message content, a unique ID for the connection, and the name of the agent you want to associate the notification with.

## Function markOnline

This function lets you tell the system that a specific client is now active and participating in a particular swarm. Think of it as a simple "status update" – you provide the client's unique ID and the swarm's name, and the system registers that the client is online. It's useful for tracking which clients are currently engaged in a swarm's activities. The function doesn’t return any data, it just updates the system’s internal state.

## Function markOffline

This function lets you tell the system that a particular client is no longer active within a swarm. Essentially, it’s how you signal that a client has disconnected or is unavailable. You’ll need to provide the unique ID of the client and the name of the swarm they were participating in. This helps the system manage resources and avoid assigning tasks to unavailable agents.

## Function listenEventOnce

This function lets you listen for a specific event from one or all clients within the system, but only once. Think of it as setting up a temporary ear to catch a single message. You tell it which client (or all clients) you're interested in, the name of the message topic, and a filter to ensure you only get the messages you want. When a matching message arrives, it triggers a callback function you provide. 

Crucially, this listener automatically stops working after it receives the first matching event, keeping your system clean and efficient.  You can also cancel the listener early using a function that the `listenEventOnce` provides. It's designed to work smoothly and securely within the system, handling things like message sequencing and preventing the use of reserved event names. 


## Function listenEvent

This function lets you tune into specific messages being sent across your agent swarm. You tell it which client you want to listen to – or choose to listen to all clients – and what kind of message topic you’re interested in. Whenever a message matching that topic is sent, a callback function you provide will be triggered with the message content.

To keep things organized and prevent interference, this setup handles message processing in a controlled environment, logs what's happening (if logging is turned on), and prevents you from subscribing to system-reserved message types. When you’re done listening, a special "unsubscribe" function is returned, allowing you to easily stop the listener and avoid unnecessary processing.

## Function json

This function lets you request data in a structured JSON format based on predefined outlines. Think of it as asking for specific information, and getting it back neatly organized. You tell the function which outline you need (like a template for the data) and optionally provide some parameters to customize the response. The function then handles the process internally, ensuring everything runs cleanly and safely. It's a core tool for getting consistent and predictable data from the system.

## Function hasSession

This function helps you quickly determine if an active session exists for a specific client. It takes a client ID as input and returns `true` if a session is found, and `false` otherwise. Behind the scenes, it uses a session validation service to do the actual checking, and if your system is configured for logging, it's noted when this function is used. It’s a simple way to verify whether a client is currently connected.

## Function hasNavigation

This function helps you determine if a particular agent is involved in guiding a client through a process. It checks if the agent is part of the planned navigation route for that specific client. Behind the scenes, it verifies that the client and agent are still active, finds the relevant swarm they belong to, and then looks at the navigation route to confirm the agent's presence. For troubleshooting, the function also keeps a log of its actions if logging is turned on in the system's settings. You'll need to provide the unique identifier for the client and the name of the agent you're checking.

## Function getUserHistory

This function lets you pull up a user’s interaction history for a specific session. It finds all the messages where the user contributed, essentially giving you a record of their actions within that session. You just need to provide the unique identifier for the client session to retrieve the history. The process ensures a controlled environment and logs the activity for monitoring purposes.

## Function getToolNameForModel

This function helps translate a tool's internal name into the specific name that the AI model needs to understand it. It takes the tool's name, a unique identifier for the user’s session (clientId), and the name of the agent involved as input. The function then figures out the correct model-friendly name for that tool, ensuring the AI knows exactly what's being referenced. It's designed to be the primary way external systems interact with this part of the framework.

## Function getTool

This function lets you fetch the definition of a specific tool that's available for your AI agents. Think of it like looking up the instructions for a particular gadget the agents can use. You provide the tool's name, and the function returns its schema, which describes how the tool works and what data it expects. If you've set up logging, this function will also record that you requested the tool's information.



The `toolName` parameter is essential – it tells the system precisely which tool you're interested in.

## Function getSwarm

This function lets you fetch the details of a specific swarm – think of it as looking up its configuration. You provide the swarm's name, and it returns a structured object containing all the information about that swarm. If your system is set up to log activity, this function will record that you requested the swarm's details. Essentially, it's a way to access the blueprint for how a particular swarm is set up and runs.

## Function getStorage

This function lets you fetch information about a specific storage unit within your AI agent swarm. Think of it as looking up the blueprint for how data is organized and stored. You provide the name of the storage you're interested in, and it returns a detailed schema describing its structure and the type of data it holds. The system also keeps a record of this request if logging is turned on.

## Function getState

This function lets you grab a specific state definition from the central state schema manager within the agent swarm. Think of it as looking up the blueprint for a particular state. You provide the name of the state you’re interested in, and it returns the schema that describes it. The system will also record this action if you’ve set up logging. 

Essentially, it's a way to access the structure and properties of a state within your swarm.


## Function getSessionMode

This function lets you check the current status of a client's session within the swarm. It tells you if the session is active ("session"), waiting to establish a connection ("makeConnection"), or has finished ("complete"). To use it, you simply provide the unique identifier for the client session you're interested in. The system verifies the session exists and logs the request if logging is turned on, then safely retrieves the session's mode.

## Function getSessionContext

This function lets you grab the overall environment details for your AI agent's session. Think of it as getting a snapshot of what's happening – it pulls together information like the client ID, the process ID, and what methods and execution environments are ready to go. It automatically figures out the client ID based on the current setup. You don't need to provide any specific ID to use it; it’s designed to work with the information already available in the system.

## Function getRawHistory

This function lets you access the complete, unaltered history of interactions for a specific client's agent within the swarm. Think of it as getting the raw data logs.

You provide the unique ID of the client session, and it returns an array containing all the messages exchanged during that session. 

It's designed to give you a full picture without any adjustments or filtering applied – perfect for debugging or in-depth analysis. The function ensures a secure environment and keeps track of its actions, according to global configuration settings.

## Function getPolicy

This function lets you fetch the details of a specific policy used by your AI agent swarm. You provide the policy's name, and it returns all the information defined within that policy – think of it as looking up the blueprint for how a particular agent should behave. The system will also record that you requested this policy if logging is turned on. You simply need to tell it which policy you're interested in, and it will provide the complete definition.

## Function getPipeline

This function lets you fetch the definition of a specific pipeline within your AI agent swarm. Think of it as looking up the blueprint for how a particular workflow is structured. You provide the pipeline's name, and it returns the schema describing its steps and configuration. If you're tracking activity in your swarm, this function will also record that you requested the pipeline definition. It's a straightforward way to access and understand how your pipelines are set up.


## Function getPayload

This function lets you easily access the data currently being worked on by the agent swarm. Think of it as a way to peek at what the agents are focusing on right now. It will give you that data, packaged as an object, or return nothing if there's no data being actively processed. The system also keeps a record of this action if you've set up logging.

## Function getNavigationRoute

This function helps you find the path an agent has taken within a swarm. 

It takes a client identifier and the swarm's name as input.

It returns a list of agent names that were visited along the navigation route, allowing you to track the agent's journey.

Under the hood, it uses a navigation service to determine the route and might log activity based on how the system is configured.

## Function getMCP

This function lets you fetch the blueprint, or schema, for a specific Model Context Protocol (MCP) from your AI agent swarm. Think of an MCP as a standardized way for agents to communicate and share information. 

You provide the name of the MCP you want to retrieve, and the function will get its definition from the swarm's central registry. If your swarm is set up to log activity, this function will record that it accessed the MCP schema. 

Essentially, it's how you ask the swarm, "Hey, what does this particular MCP look like?"

## Function getLastUserMessage

This function helps you retrieve the last message a user sent during a conversation. It finds the most recent message specifically marked as coming from the user, within a particular client's history. You provide the unique identifier for the client – think of it as a session ID – and the function returns the content of that last user message as text. If no user message exists, it will return nothing.

## Function getLastSystemMessage

This function helps you retrieve the last message sent by the system within a client’s conversation. Think of it as getting the most recent instruction or update from the central orchestration engine. 

It looks through the complete history of messages for a specific client, searching for the last one marked as a "system" message. 

You'll need to provide the unique identifier for the client you're interested in. 

If no system messages have been sent for that client, the function will return nothing.


## Function getLastAssistantMessage

This function helps you find the last response your AI assistant gave to a particular client. It digs into the client's conversation history to locate the most recent message where the assistant was the speaker. If the client hasn't received any messages from the assistant yet, this function will return nothing. You just need to provide the unique ID for that client's session to get the last assistant message.

## Function getEmbeding

This function lets you fetch the details of a specific embedding model that's registered with your agent swarm. Think of it as looking up the blueprint for how an agent should generate a numerical representation of text or other data. You provide the name of the embedding you want, and it returns all the information associated with that embedding, like its size and type. The system will also record this request if logging is turned on.

## Function getCompute

This function lets you fetch details about a specific compute within your AI agent swarm. Think of it as looking up the configuration for a particular worker or tool. You provide the name of the compute you're interested in, and it returns a structured description of that compute. If your system is set up to log activity, this function will also record that you requested the compute's information.



It’s helpful for understanding how a compute is set up and what it's capable of.

## Function getCompletion

This function lets you grab a pre-defined "completion" – think of it as a reusable instruction set for your AI agents – by its specific name. It’s how you tell the system exactly what kind of task you want the agents to perform.  The function looks up the completion definition and returns all the details you need to use it. If your system is set up to log activity, this action will be recorded. You provide the name of the completion you’re looking for to get started.

## Function getCheckBusy

This function lets you quickly see if an AI agent swarm is actively working on a task. You just provide the unique ID that identifies the specific swarm you’re interested in. It returns a simple `true` or `false` value, telling you whether the swarm is currently engaged or available for new requests. This is useful for avoiding overloading the system or managing workflows.


## Function getAssistantHistory

This function lets you pull the conversation history specifically from the AI assistant for a particular client session. Think of it as retrieving the assistant's side of the conversation. It digs up all available history and then isolates the messages where the assistant was the one speaking. The client ID tells the system which session’s history you want to see. You’re essentially getting a list of the assistant’s responses.

## Function getAgentName

This function helps you find out what the name is for the agent currently working on a particular client's session. You give it a unique ID for the client, and it returns the agent’s name. It makes sure the client and swarm are valid and keeps track of what's happening if you've set up logging. The process is handled carefully to prevent any interference with other ongoing operations. 

Essentially, it's a straightforward way to identify which agent is managing a specific client.

## Function getAgentHistory

This function lets you see what an agent has been doing within a session. 

It retrieves the agent's history, and importantly, it considers any rescue strategies that might have been applied to help the agent along the way. You need to provide the client's ID and the agent's name to access this history. The system checks that the client and agent are valid, keeps a log of the request if logging is turned on, and gets the history from a dedicated service. It runs independently of any existing processes to ensure a clean retrieval.

## Function getAgent

This function lets you fetch the details of a specific agent within your AI agent swarm. Think of it as looking up an agent's blueprint – you give it the agent's name, and it returns all the information defining that agent. The system will also record that you requested the agent’s details if logging is turned on.  You’ll need to provide the exact name of the agent you're trying to retrieve.

## Function getAdvisor

This function lets you fetch the blueprint, or schema, for a specific advisor within your AI agent swarm. Think of it as getting the detailed instructions on how that advisor should behave. You provide the name of the advisor you’re interested in, and the function returns its schema. The system will also record this retrieval if logging is turned on in your overall configuration. 


## Function fork

This function lets you run a piece of code – a "runFn" – within a controlled environment. Think of it as setting up a little container for your code to operate in. 

It handles all the behind-the-scenes work like creating a session and ensuring everything is valid, so you don't have to. 

You provide the code you want to run ("runFn") and some settings ("options") to tell it how to behave – like which client and swarm it should be associated with. The function will then execute your code and return the result.

## Function executeForce

This function lets you directly send a message or command to an agent within a swarm, acting as if it came from a client. It's particularly useful for things like inspecting an agent's output or starting a conversation directly to the client, even if the agent isn't actively working on something. 

Unlike other methods, this function guarantees the message will be processed, bypassing checks about the agent’s current state. It handles the process safely, keeping track of performance and notifying other parts of the system, and ensures everything runs cleanly with appropriate context. You'll need to provide the message itself and a unique identifier for the client session to use this function.

## Function execute

This function lets you send instructions or data to a specific agent that's already part of a running swarm session. Think of it as relaying a message from a client application to an agent, useful for things like checking the agent's results or starting a conversation.

It makes sure the agent is still available and running before sending the message, and keeps track of how long the process takes. The message is delivered in a controlled environment to keep things organized. 

You'll need to provide the actual message content, a unique identifier for your client session, and the name of the agent you want to communicate with.

## Function event

This function lets your agents communicate with each other within the swarm. You can use it to send custom messages, or "events," to a specific topic. Think of it as broadcasting a notification – other agents listening on that topic will receive it.

You’re required to specify which client is sending the event, the topic it’s being sent to, and the data you want to send along with it. 

The system prevents you from using certain reserved topic names to avoid conflicts, and it handles the technical details of sending the event reliably.

## Function emitForce

This function lets you directly push a string as output from the agent swarm, kind of like injecting a message. It skips the usual checks and processing that happen when a message is received.

It’s specifically for sessions created using `makeConnection`, so it's built to work with that connection style.

Think of it as a shortcut for scenarios where you need to provide data directly to the swarm without going through the standard message flow.

You provide the content you want to send and a unique identifier for the connection, and the function handles the rest, ensuring the session is valid and the environment is clean before sending.

## Function emit

This function lets you send a piece of text as output from an agent within the swarm, acting like a direct message. It's specifically for sessions created using `makeConnection`.

Before sending the text, it double-checks that the session is still valid, the swarm is running, and the agent you're referencing is still active. If things have changed since the session began, the sending is skipped.

The process includes setting up a fresh environment and logging the action if logging is enabled. It’s important to note that you can only use this function within sessions established using `makeConnection`.

You’re providing the text you want to send (`content`), a unique ID for the session (`clientId`), and the name of the agent that’s sending the text (`agentName`).

## Function commitUserMessageForce

This function lets you directly add a user's message to an agent's history within a swarm session. Think of it as a way to manually record what a user said, even if the agent isn’s currently responding or you want to ensure the message is always logged. 

It's a forceful action, meaning it skips checks to see if the agent is still working, and it's designed to be executed cleanly, separate from other processes. You provide the message content, the execution mode, a client identifier, and optionally, additional data through a payload object. The system handles the session validation, logging, and then passes the commit to the session's public service.


## Function commitUserMessage

This function lets you add a user's message to an agent's record within a swarm session, essentially creating a history of interactions. It's useful when you want to log a message without automatically prompting the agent to respond. 

You provide the message content, how it should be handled, a client identifier, the agent's name, and optionally some additional data. The system will ensure the agent and session are still valid, keep a log of the action if logging is turned on, and then safely record the message in the agent's history. This process is designed to operate independently of any existing ongoing tasks or contexts, ensuring a reliable record.

## Function commitToolRequestForce

This function lets you directly push tool requests to an agent within the swarm, even if some checks are normally skipped. It’s useful when you need to ensure a request goes through immediately, bypassing standard agent validation.  You provide the requests you want to execute and a unique ID identifying the client session. The function then handles the execution within a controlled environment, keeping track of what’s happening through logging.


## Function commitToolRequest

This function lets you send tool requests to a specific agent within your AI agent swarm. It's like telling an agent, "Hey, I need you to do these things!"

Before sending the requests, the system double-checks that you're targeting the correct agent. 

It handles the process carefully, managing the environment and keeping a record of what's happening behind the scenes. You provide the requests you want to execute, a client identifier to track the session, and the name of the agent you're addressing. The function will then return an array of strings.

## Function commitToolOutputForce

This function lets you directly push tool output back into the swarm session, even if you’re unsure if the agent is still actively participating. It’s a forceful commit, so it skips the usual checks to make sure the agent is still connected.

The process includes some internal checks to validate the session and swarm and will log the action if logging is turned on. It then hands off the actual commit to the session’s public service.

To keep things clean and prevent conflicts, this function runs in its own isolated environment.

Here’s what you need to provide:

*   `toolId`: A unique code identifying which tool generated the output.
*   `content`: The actual data or result from the tool.
*   `clientId`: A unique identifier for the client that started the session.

## Function commitToolOutput

This function lets you record what a tool did during an agent's work within a larger group of agents collaborating on a task. It sends the tool's results – the `content` – back to the specific `agentName` that used the tool. 

Think of it like a way to save the tool's output so everyone knows what happened. 

It makes sure the agent is still part of the ongoing session before saving the information, and it does this in a safe and isolated way, making sure everything runs cleanly. You’ll need to provide a unique ID for the tool (`toolId`), the data from the tool (`content`), a client ID (`clientId`), and the name of the agent that used the tool (`agentName`).

## Function commitSystemMessageForce

This function lets you directly push a system message into a conversation session, bypassing the usual checks for which agent is currently active. Think of it as a way to ensure a specific message gets delivered, even if an agent isn't actively managing the conversation.

It verifies that the session and swarm exist before committing the message. 

You're providing the message content and a unique identifier for the client session. This is like a "force commit" option, similar to how assistant messages can be forced, giving you more control over the conversation flow when necessary. The process is carefully managed and logged to keep track of what’s happening.

## Function commitSystemMessage

This function lets you send important messages directly to an agent within your AI agent swarm. Think of these messages as system announcements or control signals, rather than responses from the agent itself. 

It makes sure everything is in order – verifying the agent, session, and swarm – before sending the message. 

You provide the message content, a client identifier, and the agent's name to specify where the message should go. Behind the scenes, it uses several services to validate and process the message, ensuring it's delivered correctly and tracked appropriately.

## Function commitStopToolsForce

This function lets you immediately halt the next tool execution for a particular client, overriding any ongoing processes. It’s a forceful way to stop things, bypassing typical checks to ensure a swift interruption. 

Essentially, it’s a more aggressive version of stopping tool execution, similar to how `commitFlushForce` works compared to `commitFlush`. 

You provide the client's unique ID to tell the system which session to affect. 

Behind the scenes, it verifies the session and swarm, logs its actions, and uses several services to make sure the stop happens correctly.

## Function commitStopTools

This function lets you pause a specific agent's tool execution within the swarm. Think of it as a temporary halt – it prevents the agent from running its next tool, which is useful for controlling the agent's workflow.

It carefully checks that you're stopping the correct agent within the intended session and swarm to ensure everything is working as expected.

Behind the scenes, it utilizes several services to manage the execution context, validate components, and keep a record of what’s happening through logging. This isn't about clearing the agent's history like `commitFlush` does, but rather about temporarily interrupting its tool sequence.

You need to provide the unique identifier of the client session, and the name of the agent you wish to pause.

## Function commitFlushForce

This function lets you aggressively clear the history for a specific client’s session within the agent swarm. It’s a forceful way to flush the history, skipping checks to see if an agent is currently active. 

Think of it as a more direct alternative to a standard history flush – it prioritizes clearing the history right away.

You’ll need to provide the unique identifier (clientId) for the client whose history you want to flush. 

Behind the scenes, it confirms the session and swarm are valid, then clears the history, and keeps track of everything with detailed logging.


## Function commitFlush

This function lets you completely clear the conversation history for a specific agent within a client’s session. Think of it as a way to reset an agent's memory. It carefully checks to make sure everything is in order – the client, the agent, and the overall system – before actually clearing the history. The process is managed carefully, with detailed logging to track what's happening. It's a way to start fresh with an agent, unlike adding new messages to the conversation. You need to provide the unique identifier for the client and the name of the agent whose history you want to erase.

## Function commitDeveloperMessageForce

This function lets you directly push a developer message into a session within the swarm, bypassing usual checks. It’s designed for situations where you need to ensure a message is recorded, regardless of what agents are currently active or what state the system is in. 

Essentially, it acts as a forceful way to record developer input, similar to how assistant messages can be forced into the system. You provide the message content and a unique identifier for the client session, and the function handles the rest, validating the session and swarm before committing. 

Behind the scenes, it uses various services to manage the process, including checking the session, validating the swarm, and logging actions. Remember that this is a powerful tool, so use it carefully when you need to guarantee a message gets recorded.

## Function commitDeveloperMessage

This function lets you send messages directly to a specific agent within the swarm. Think of it as a way to give instructions or provide context to an agent, bypassing the usual assistant or system responses. 

Before sending the message, it carefully checks that the agent, session, and overall swarm are all valid and that you're targeting the correct agent. It keeps track of everything happening behind the scenes through logging.

To use it, you'll need to provide the actual message content, a unique ID for the client session, and the name of the agent you want to communicate with.

## Function commitAssistantMessageForce

This function allows you to directly push a message from an assistant into a session, bypassing the usual checks for which agent is currently active. Think of it as a way to ensure a message gets committed, even if the system isn's fully ready or you want to override the standard workflow.

It validates that the session and swarm are in a good state before committing the message, and keeps track of what's happening through logging.

You provide the message content and a unique ID for the client session to use this function. It's like the 'cancelOutputForce' command – a more forceful way to take action within the swarm.

## Function commitAssistantMessage

This function lets you record messages generated by an AI assistant and associate them with a specific agent within your swarm. It makes sure everything is set up correctly – the agent, the session, and the swarm – before saving the message.

Think of it as a way to permanently store an assistant’s output, kind of like saving a draft.

You'll need to provide the message content itself, a client ID to identify the session, and the name of the agent you want to link the message to. It handles all the behind-the-scenes checks and logging to keep things organized. It’s a counterpart to functions that might cancel an agent's output, ensuring that, instead, the message is saved.

## Function chat

This function lets you interact with a specific AI chat service, sending it a sequence of messages to continue a conversation or generate a response. You tell it which chat service to use by providing its name, and then pass in an array of messages that represent the conversation so far. The function then handles the communication with the AI and returns the AI's reply as text. Essentially, it’s your go-to tool for having a conversation with an AI agent.


## Function changeToPrevAgent

This function lets you switch a client back to the agent they were using before, or if there's no history, to a default agent. Think of it like a "back" button for agent selection. It makes sure the client session and agent are valid before making the change. The process is handled carefully, ensuring it happens reliably even if other things are happening in the system. You provide a unique identifier for the client session to tell the system which session to adjust.

## Function changeToDefaultAgent

This function helps you easily switch a client session back to the swarm's standard agent. It’s designed to reliably revert a client's active agent, making sure the change is properly handled and logged. You provide the unique identifier for the client session, and the system takes care of the rest, including verifying the session and agent setup. It's like a reset button for your agent assignments within a client’s interaction.

## Function changeToAgent

This function lets you switch which AI agent is handling a specific client's session within the swarm. It's designed to make these changes safely and reliably. The system verifies that the change is valid and logs the activity for tracking purposes.  The actual switch happens in a controlled manner, ensuring that it's processed within a set time limit and queued for execution. Essentially, it’s a way to seamlessly redirect a client's interaction to a different AI agent. You need to provide the name of the agent you want to use and the unique identifier for the client's session.

## Function cancelOutputForce

This function lets you forcefully stop an agent's output for a particular client. It essentially clears the expected output, even if the agent isn't actively working. 

Think of it as an emergency stop button – it bypasses some usual checks to ensure the cancellation happens quickly. It's useful when you need to interrupt a process immediately.

To use it, you just need to provide the unique ID of the client session you want to cancel. Behind the scenes, it ensures everything is set up correctly, validates the session and swarm, and keeps track of what’s happening via logging. It's a more direct way to cancel output compared to other methods, skipping checks for active agents.

## Function cancelOutput

This function lets you stop an agent from producing more output for a particular client. It's useful when you need to interrupt a process or redirect an agent's actions. 

The function ensures everything is set up correctly – verifying the agent and related system components – before stopping the agent’s output by sending an empty signal. It also keeps track of what's happening through logging.

You'll need to provide the unique ID of the client and the name of the agent you want to stop.

## Function ask

This function lets you send a message to one of your AI advisors and get a response back. You can send different kinds of messages – it could be a simple text string, or something more complex like an object or even a file.  Just specify what you want to send and which advisor should handle it, and the function will return the advisor's reply. It's the core way to interact with your AI advisors and get their insights.

## Function addTriageNavigation

This function lets you set up a way for your AI agents to easily connect with a dedicated triage agent – think of it as creating a guided path for them to get help when needed. It takes a configuration object with all the necessary details to define how this navigation will work. The function then registers this navigation setup, making it ready for your agents to use. Essentially, it’s about streamlining the process of getting agents to the right support.

## Function addTool

This function lets you register new tools that your AI agents can use. Think of it as adding capabilities to your agents – it allows them to perform specific actions or tasks. To make sure agents can use a tool, you need to register it with this function. It's designed to work cleanly, ensuring the registration process isn't affected by other operations. Once registered, the function will give you the tool's name to confirm it’s been successfully added to the system. The tool’s configuration details, like its name and how it works, are passed through the `toolSchema` parameter.

## Function addSwarm

This function lets you create new groups, or “swarms,” to organize and manage client interactions. Think of a swarm as a blueprint that defines how your agents will work together and how sessions will flow. By using this function, you're officially registering a swarm so the system knows about it and can use it. It ensures a fresh start for the operation, and you’ll get the swarm's name back as confirmation it's been successfully set up. You provide a schema, which is like a detailed description of how the swarm should behave.

## Function addStorage

This function lets you register a new way for your AI agents to store and retrieve data, like files or databases. Think of it as adding a new tool to the swarm’s toolkit for managing information.  Only storages added this way are recognized by the system.

If the storage is intended to be shared amongst multiple agents, this function also handles setting up the connection to that shared storage. The registration happens in a clean environment, preventing interference with existing processes.  You'll get back the name of the storage you just registered. 

The `storageSchema` parameter lets you define or update how this storage engine works.

## Function addState

This function lets you define and register new states within the swarm system. Think of a state as a container for information your agents need to share or track. By registering a state with this function, you're telling the swarm about its existence, allowing agents to access and modify it. If the state is designated as shared, this function also handles setting up the necessary connection to a shared data service. It's designed to run independently of other operations to keep things clean and returns the name of the newly registered state.

## Function addPolicy

This function lets you add rules, or policies, to your AI agent swarm. Think of it as defining the boundaries and guidelines for how the agents should behave. It registers the policy so the system can validate it and keep track of its structure. Behind the scenes, it handles things like ensuring the policy is valid and recording everything for auditing. This is a key step in setting up your swarm, helping to maintain control and consistency in agent operations. The `policySchema` tells the system exactly what the new policy looks like.

## Function addPipeline

This function lets you register a new pipeline, or update an existing one, within the AI agent swarm orchestration framework. Think of a pipeline as a series of steps your agents will follow to complete a task. When you call this function, the system checks that your pipeline definition is valid and then adds it to the system’s registry, making it available for agents to use. You provide a schema describing the pipeline, and the function returns a unique identifier for that pipeline. This identifier is how you’ll refer to the pipeline later. You can use this function to define and manage the workflows for your AI agents.


## Function addOutline

This function lets you add or update a blueprint for how your AI agents should structure their work. Think of it as defining a template for a task, specifying the steps and information needed.

It ensures the addition happens cleanly, so it doesn’t mess with anything else already running.

If your system is set up to log activity, this function will record that the outline has been added or updated. You provide the outline schema as input, which contains the details of the task's structure.

## Function addMCP

This function lets you define and register a new Model Context Protocol, or MCP, which acts as a blueprint for how AI agents share information. Think of it as creating a standardized language for your agents to communicate. You provide a schema describing the structure of the data they'll exchange, and the system assigns a unique identifier to that schema. This allows the orchestration framework to understand and manage how agents interact using this specific protocol. Essentially, it's how you tell the system, "Here's a new way for my agents to talk to each other."

## Function addFetchInfo

This function lets you set up a tool that your AI agents can use to fetch information. Think of it as giving your AI a way to "look things up" – it allows them to retrieve data without changing anything.

The function creates a registered tool that the AI can then call with specific parameters. Before fetching data, you can provide a validation step to make sure the parameters are correct. If validation fails, the tool won't execute. Once validated, the function retrieves the content and returns it to the AI.  If no content is found, a special handler can be triggered to deal with that situation.


## Function addEmbedding

This function lets you add new embedding engines to the system, essentially teaching the swarm how to work with different types of vector data. Think of it as registering a new tool for the swarm to use when it needs to create or compare vectors. To be recognized by the swarm, any embedding engine must be added using this function. It ensures a fresh start for the process, and confirms successful registration by returning the name of the newly added embedding. You'll need to provide a schema definition for the embedding as part of the process.

## Function addCompute

This function lets you register and manage different types of computational tasks your AI agents can perform. Think of it as defining the "skills" your agents have. You provide a blueprint describing what a specific task looks like – what data it needs, what it does, and what it returns. The function checks this blueprint to make sure it's valid and then saves it so your agents can use it later. You can also use this function to update existing task definitions.

## Function addCompletion

This function lets you register new ways for your AI agents to generate text completions, like using different language models. Think of it as adding a new tool to your agents' toolbox.  When you add a completion engine, it becomes available for your agents to use, and the system checks to make sure it's properly configured. The process runs in a protected environment to keep things clean and consistent, and you're given a confirmation of the new engine’s name once it's added. You provide a schema that defines how the completion engine works.

## Function addCommitAction

This function lets you define a tool that allows your AI agent to make changes to a system – think of it as giving the AI the ability to "write" or modify something. 

When the AI wants to make a change, it calls this function with a set of instructions. First, those instructions are checked for correctness. If there's a problem, an error message is given back to the AI, and a defined response is triggered. 

If everything looks good, the action is carried out, and the result (or confirmation of success) is passed back to the AI. This function is essential for allowing your AI to actively influence and change the environment it operates within.

## Function addAgentNavigation

This function lets you create a pathway for one AI agent to interact with another within the swarm. Think of it as building a bridge between agents, allowing them to directly access and utilize each other's capabilities. You provide a set of instructions, and the function handles the setup, giving you a unique identifier to manage this connection. It's a straightforward way to coordinate agent interactions and build more complex workflows within your AI swarm.

## Function addAgent

This function lets you register a new agent so it can be used by the swarm. Think of it as adding an agent to the system's directory. You provide a schema describing the agent, and the system validates and stores it, making it ready for tasks. Only agents registered this way can participate in the swarm's operations. The process ensures a clean start by running independently of any existing activity, and it logs the action for tracking purposes. The function then gives you back the agent's name to confirm it's been successfully added.

## Function addAdvisor

This function lets you register a new advisor to your AI agent swarm. Think of an advisor as a specialized expert that can contribute to conversations.

You provide a schema describing the advisor, which includes its name and how it will handle chats. 

Once registered, the advisor is ready to participate in discussions and provide its expertise. The function returns a unique identifier for the advisor, allowing you to manage it later.

# agent-swarm-kit classes

## Class ToolValidationService

This service helps ensure that the tools used by your AI agents are properly configured and exist within the system. Think of it as a gatekeeper for your tools.

It keeps track of all the registered tools and their details, making sure there aren't any duplicates and that tools exist before they're used. 

You can add new tools to its registry, and it checks whether a tool is registered before agents try to use it. The whole process is designed to be efficient, with checks cached for faster validation. 

This service works closely with other parts of the system, including tool registration, agent validation, and logging, to maintain a consistent and reliable tool environment.

## Class ToolSchemaService

The ToolSchemaService acts as a central library for defining and managing the tools that agents use within the swarm. Think of it as a place where the blueprints for each tool – like a function to call an API or a way to validate user input – are stored and checked for correctness.

It works closely with other services to ensure that agents are properly equipped with the right tools and that those tools are functioning correctly. When a new tool is added or an existing one is updated, this service validates it to make sure it’s safe and reliable before making it available.

Essentially, this service guarantees that agents have the tools they need, and those tools are well-defined, all while keeping track of changes and ensuring consistent behavior across the entire system. It’s a crucial component for building a robust and trustworthy AI agent swarm.

## Class ToolAbortController

ToolAbortController helps you manage the process of stopping ongoing tasks, especially those that take time to complete. It's like having a simple way to tell a long-running job, "Hey, you don't need to finish anymore!"

It creates and takes care of an `AbortController` behind the scenes – you don't have to worry about the technical details.

If your environment doesn't support `AbortController`, it gracefully handles that and won't break.

The `abort` method is how you tell the task to stop. It’s a quick way to signal that the process should be cancelled.

## Class SwarmValidationService

The Swarm Validation Service acts as a central authority for ensuring the health and consistency of your agent swarms. It keeps track of all registered swarms, verifies their configurations, and helps prevent errors.

Think of it as a quality control system: it makes sure each swarm has a unique name, a correctly defined list of agents, and properly configured policies. It works closely with other services, like those responsible for registering swarms, managing agents, and enforcing policies, to maintain overall system reliability.

You can add new swarms to the system using `addSwarm`, and easily retrieve information like agent lists (`getAgentList`, `getAgentSet`) and policy lists (`getPolicyList`). The `validate` function performs a comprehensive check of a swarm's configuration, which is particularly useful for verifying changes or ensuring operational integrity. The entire process is designed to be efficient, leveraging caching to avoid unnecessary checks.

## Class SwarmSchemaService

This service acts as a central hub for managing the blueprints of your AI agent swarms. Think of it as a library where you store and retrieve the configuration details for each swarm, including things like the list of agents involved and the rules they should follow.

Before a swarm can be created, its configuration needs to be registered here.  This process includes a basic check to make sure the configuration is structurally sound.  You can also update existing swarm configurations, allowing you to dynamically adjust your swarms without rebuilding them.

When you need to use a swarm, this service provides the necessary configuration information to other parts of the system, ensuring consistency and preventing errors. Logging is enabled to track these operations, providing valuable insights into how your swarms are being managed.  Essentially, it’s the foundation for defining and using your AI agent swarms.

## Class SwarmPublicService

This class provides a way to interact with the AI agent swarm at a high level, handling the details behind the scenes. Think of it as the main control panel for your swarm. It allows you to send messages, manage the swarm's busy state (whether it's actively working), get information about the current agent, and ultimately clean up the swarm when you's done.

It's designed to be secure and aware of the context – meaning it tracks who's interacting with the swarm (a client) and which swarm they's working with.  All actions are logged for debugging and monitoring if logging is enabled.

Here's a breakdown of what you can do:

*   **Send Messages:** Easily send messages to the swarm and session, useful for communication and updates.
*   **Manage Navigation:** Pop the navigation stack to go back in the workflow or get the default agent.
*   **Check Swarm Status:**  See if the swarm is currently busy processing something.
*   **Control Output:** Cancel pending output from the swarm or wait for the result.
*   **Get Agent Details:** Retrieve information about the current agent or even get a direct reference to the agent object.
*   **Control Agent Name:** Switch the active agent in the swarm.
*   **Clean Up:**  Dispose of the swarm when you's finished with it, ensuring resources are released.



This class acts as a layer of abstraction, so you don't need to worry about the underlying complexities of managing the swarm directly.

## Class SwarmMetaService

This service manages the overall structure and documentation of your agent swarms. It takes the information describing your swarms – their agents, relationships, and configurations – and transforms it into a visual UML diagram. Think of it as automatically generating a blueprint of your swarm system.

It relies on other services to gather information about the swarm’s schema and agents. It builds a tree-like representation of the swarm and then uses that structure to create a UML string, which can be used for documentation or debugging purposes. The generation of these diagrams is controlled by configuration settings and integrated with other system components like documentation and agent management.

## Class SwarmConnectionService

This service manages how different parts of your AI agent system connect and work together within a specific "swarm." Think of a swarm as a dedicated workspace for your agents to collaborate.

It remembers frequently used swarms to avoid unnecessary setup, making things faster. This service also handles sending messages to the swarm and coordinating actions like retrieving output or controlling the swarm's busy state (like waiting for a task to complete).

It's like a central hub that ties together agent execution, configuration, and event handling, using various helper services to manage logging, communication, and data persistence. The `getSwarm` method is especially important as it's used to retrieve or create a workspace for your agents, and it’s optimized for efficiency.

## Class StorageValidationService

This service helps keep track of the storage configurations used by your AI agent swarm, ensuring they’re all set up correctly and don't conflict with each other. It acts as a central authority for verifying storage details, working closely with other services that handle storage registration, operations, agent validation, and embedding checks. 

Essentially, it maintains a list of registered storage configurations and performs checks to confirm they’re unique, exist, and have valid embedding settings. The service is designed to be efficient, reusing previous validation results to avoid unnecessary checks. 

You can use it to register new storage configurations and to validate existing ones, giving you confidence that your storage setup is reliable and consistent across your swarm.

## Class StorageUtils

This class helps manage data storage for individual clients and agents within the swarm. It provides a set of tools to retrieve, add, update, delete, and list data, ensuring that access is properly authorized and tracked.

You can use `take` to fetch a limited number of items based on a search query, `upsert` to add new data or update existing entries, and `remove` to delete specific items by their unique identifier.  The `get` function allows you to retrieve a single item, while `list` helps you view all items within a specific storage area, optionally filtered.

If you need to create an index to track the number of items in a storage, `createNumericIndex` can do that. Finally, `clear` offers a way to completely empty a storage area. Before performing any action, these methods verify that the client has the right permissions and that the agent is properly registered for the specified storage.

## Class StorageSchemaService

The StorageSchemaService acts as a central place to define and manage how your AI agents interact with storage. Think of it as a library of storage blueprints, each describing how data should be structured and accessed.

It ensures that these blueprints are consistent and valid before they're used, and it keeps track of them using a reliable registry. This service works closely with other components to provide a seamless experience for agents needing to read and write data.

It allows you to register new storage configurations, update existing ones, and retrieve them when needed. The service is designed to be flexible, supporting both client-specific and shared storage setups. It also keeps a record of what's happening, logging activities for monitoring and debugging purposes.

## Class StoragePublicService

This service manages storage specifically for each client within the swarm system. Think of it as a way to keep each client's data separate and organized. It works closely with other services like ClientAgent and PerfService to handle storage operations like saving, retrieving, and deleting data.

Here's a breakdown of what you can do with this service:

*   **Get Data:** Retrieve a list of storage items based on a search, or fetch a specific item by its ID.
*   **Save/Update Data:**  Add new items or update existing ones in a client's storage.
*   **Delete Data:** Remove individual items or clear out an entire client's storage.
*   **List Contents:** View all items in a client's storage, optionally filtering them.
*   **Cleanup:** Dispose of a client’s storage, freeing up resources.

This service ensures that data is kept private and traceable to individual clients, distinguishing it from system-wide storage. It's designed to be flexible, allowing for logging and integration with various other components of the swarm system.

## Class StorageConnectionService

This service manages how your agents connect to and interact with storage. Think of it as a central hub for accessing data. It intelligently reuses storage connections to avoid unnecessary overhead, and it handles different types of storage, including shared resources.

Here's a breakdown of what it does:

*   **Connection Management:** It sets up and manages connections to different storage locations, remembering which connections have already been established.
*   **Storage Types:**  It supports both private storage for individual agents and shared storage accessible to multiple agents.
*   **Data Operations:** It provides a consistent way to perform common operations like retrieving, adding, updating, and deleting data.
*   **Efficient Reuse:**  It caches storage connections to speed things up and reduce resource usage.
*   **Integration:** Works closely with other parts of the system like agent execution, public APIs, and session management.

The `getStorage` function is the main entry point for accessing storage, it either finds an existing connection or creates a new one.  The `take`, `upsert`, `remove`, `get`, `list`, and `clear` functions provide standard data manipulation tools, while `dispose` cleans up resources when a storage connection is no longer needed.

## Class StateValidationService

This service helps manage and ensure the consistency of data representing the current status of your AI agents. Think of it as a guardian for your agents' state, making sure they're operating with accurate and well-defined information. 

You start by defining the structure of each state using `addState`, essentially telling the service what information each agent’s state should contain.  The `validate` function then checks if an agent's current state conforms to the rules you’ve established – a kind of quality control for your agents’ data. The service also uses a logger to record important events and issues encountered during state validation.  Internally, it keeps track of all the defined states in a map for efficient management.

## Class StateUtils

This class helps manage information specific to each client and agent within the swarm. It provides easy ways to fetch, update, and reset data associated with a particular client, agent, and a named piece of state. Before accessing or modifying any state, the system checks to make sure the client is authorized and the agent is properly registered. These operations are tracked for logging and auditing. 

You can get data using `getState`, update it with `setState` – either directly or by calculating a new value from the existing one – and completely reset a piece of state using `clearState`.

## Class StateSchemaService

The StateSchemaService acts as a central hub for managing the blueprints of how our agents handle data – we call these blueprints "state schemas." It keeps track of these schemas, making sure they're valid and accessible to different parts of the system. Think of it as a librarian for agent data structures.

It works closely with other services like the connection and configuration services, ensuring that state configurations are set up correctly and agents can use them effectively. The service also validates these schemas to prevent errors.

This service stores schemas using a specialized registry that allows for easy lookup and management, and it logs its actions to help with debugging. Overall, it's a core component that defines how data is handled and shared among the agents in our swarm. It allows us to define the structure of information that client-specific and shared states utilize.

## Class StatePublicService

This service manages state specifically tied to individual clients within the swarm system. Think of it as a way to track and control data unique to each client interacting with the system. It’s different from system-wide state and persistent storage, focusing solely on client-specific information.

You can use this service to set, clear, retrieve, and dispose of this client-specific data. It uses a dispatch function when setting state, and it's designed to work closely with other components like ClientAgent and PerfService to track and manage client interactions and performance. Logging is enabled for information-level events, providing visibility into state operations when configured.

## Class StateConnectionService

This service manages how agents within the swarm store and use data – their "state." Think of it as a central place where each agent's data lives and is updated. It's designed to be efficient, reusing data whenever possible and keeping things thread-safe to avoid conflicts.

It intelligently handles both data specific to a single agent (client) and shared data used by multiple agents. When an agent needs to read or write its data, this service figures out where that data is stored, whether it’s cached, and makes sure everything happens correctly.

The service relies on a few helpers: a logger for recording activity, a bus for broadcasting state changes, and other specialized services to handle configuration, validation, and shared data management. Because it caches frequently used data, it minimizes delays and ensures smooth operation of your swarm.

Essentially, this service is the backbone for managing data across your agents, making sure they can work together seamlessly. When an agent is finished, this service also cleans up and releases resources associated with that state.

## Class SharedStorageUtils

This class provides tools for interacting with a shared storage area used by your agents. Think of it as a central repository where agents can store and retrieve information.

You can use it to fetch a set of items based on a search term and quantity, add new items or update existing ones, delete items by their unique identifier, or retrieve a single item. It's also possible to list all items within a storage area, filter them down with custom logic, or completely empty a storage area. Each of these operations is carefully handled to ensure data integrity and proper logging.

## Class SharedStoragePublicService

This class manages access to shared storage across the system, acting as a public interface for interacting with it. It handles retrieving, adding, updating, deleting, and clearing data from shared storage areas. 

Think of it as a gatekeeper for storage operations, ensuring they’re logged and properly scoped. It relies on other services for the actual storage work, as well as for logging and performance tracking.

Here's a quick rundown of what it lets you do:

*   **Retrieve Data:** Search for and get lists of items within a specific storage area.
*   **Add or Update Data:** Insert new items or update existing ones.
*   **Delete Data:** Remove individual items from storage.
*   **Get a Single Item:** Retrieve a specific item by its ID.
*   **List All Items:** Get a list of all items in a storage area, potentially filtering them.
*   **Clear Storage:** Remove all items from a storage area.

Essentially, this class provides a controlled and documented way for different parts of the system (like Client Agents and Performance Services) to work with shared storage.

## Class SharedStorageConnectionService

This service manages shared storage connections for the swarm system, acting as a central point for data access and manipulation. Think of it as a communal storage space where all parts of the system can share information. It cleverly caches these shared storage areas to ensure everyone is using the same version, preventing confusion and conflicts.

It's designed to work closely with other services within the swarm, like those responsible for logging, event handling, and understanding storage configurations. 

Here's a breakdown of what it can do:

*   **Get Storage:** Creates or retrieves a shared storage space, ensuring a single instance is used across the entire system.
*   **Take (Search):** Retrieves a list of data items matching a specific search query. This allows for finding relevant information within the shared storage.
*   **Upsert (Insert/Update):** Adds new items to the shared storage or updates existing ones.
*   **Remove:** Deletes an item from the shared storage.
*   **Get:** Retrieves a specific item by its ID.
*   **List:** Retrieves a list of items, optionally filtered by specific criteria.
*   **Clear:** Empties the entire shared storage.

Essentially, this service makes it easy for different parts of the AI agent swarm to access and manage shared data in a consistent and reliable way.

## Class SharedStateUtils

This class provides easy ways to interact with the shared information accessible to all agents in your swarm. You can use it to get the current value of a specific piece of shared data, update that data (either by providing a new value directly or by calculating it based on what's already there), and even completely reset a piece of shared data to its starting point. Think of it as a central hub for coordinating information between your agents.

## Class SharedStatePublicService

This service manages shared data across your agent swarm, allowing different parts of the system to access and modify the same information. It provides a public way to interact with that shared data, handling tasks like setting new values, clearing existing ones, and retrieving the current state.  The service keeps track of what's happening with these operations and logs relevant details when configured to do so.

It works by relying on another service for the actual data storage and modification, and it uses context scoping to ensure operations are performed within defined boundaries. You'll find this service in use when agents are executing tasks and when the system is monitoring performance. Think of it as a central repository for critical data that needs to be shared and synchronized throughout the entire swarm.

## Class SharedStateConnectionService

This service acts as a central hub for managing shared data across different parts of your agent swarm system. Think of it as a whiteboard everyone can look at and occasionally write on, but in a controlled and organized way. 

It handles creating and accessing this shared data, making sure everyone's working with the same version and changes are applied safely. It remembers previously created data to avoid unnecessary work and provides a consistent way to update and reset the shared state. 

This service interacts with other components to handle everything from initial setup and applying configuration to logging changes and propagating events. It ensures that updates are handled in a thread-safe manner and integrates seamlessly with the broader agent execution and communication infrastructure. Basically, it's the foundation for reliable data sharing within your agent swarm.


## Class SharedComputeUtils

This utility class, SharedComputeUtils, helps manage and interact with shared computing resources within the agent swarm. Think of it as a central point for retrieving information and updating the status of these resources. 

The `update` property allows you to refresh the details of a specific compute resource, ensuring you're always working with the latest information.  You can use it to signal to the system that the compute details need to be checked again.

The `getComputeData` property provides a way to fetch specific data related to a compute resource. You tell it the client ID and the name of the compute you're interested in, and it returns the data in a format you specify (or a default format if you don't specify one).


## Class SharedComputePublicService

This service helps coordinate how AI agents share and reuse computational tasks. Think of it as a central hub that manages shared calculations, making sure everyone is using the most up-to-date results.

It uses a logger to keep track of what’s happening and relies on another service to actually handle the compute operations. 

You can use it to fetch previously calculated data, manually trigger a recalculation when needed, or force an update to ensure everyone’s working with the latest version. Essentially, it's designed to streamline and optimize how your AI agents collaborate and leverage shared computation.

## Class SharedComputeConnectionService

This component manages connections to a shared computing resource, acting as a central point for agents within a swarm to access and share computational work. It facilitates access to pre-defined compute tasks, allowing agents to leverage existing processes without needing to build them from scratch.

The `SharedComputeConnectionService` has several dependencies, including a logger, a messaging bus, a method context service, a shared state connection service, and a compute schema service – all essential for coordination and communication.

You can retrieve references to specific compute tasks using `getComputeRef`, which helps ensure that agents are using the correct and most efficient implementation. The `getComputeData` method lets you access the result of a computation whenever it's ready. 

Finally, `calculate` triggers a computation based on a state name, and `update` provides a mechanism to refresh or re-execute computations as needed.

## Class SessionValidationService

This service is responsible for keeping track of sessions within your AI agent swarm. Think of it as a central record of which agents are using which resources (like storage, history, states, and computes) within a particular session.

It registers new sessions and their associated details, and it removes them when they're no longer needed. This ensures that everything stays consistent and that agents are using the right resources.

The service also includes methods for tracking agent usage, history, storage, states, and computes, and for removing them when they're no longer in use. It logs all actions for easy troubleshooting.

For performance, it memoizes session validation checks, meaning it remembers the results of previous checks so it doesn't have to re-check frequently.  You can even clear the validation cache for specific sessions if needed.

In essence, this service acts as a reliable and efficient manager of sessions and resource usage in your swarm system.

## Class SessionPublicService

This service acts as the public-facing interface for managing interactions within the swarm system's sessions. It provides a set of functions like sending messages, executing commands, and tracking performance, all while ensuring context and logging are handled correctly.

Think of it as a bridge - it takes requests from external agents (like a client application) and translates them into actions within the swarm's session environment. It leverages other services for tasks like performance tracking, event handling, and ensuring security, and provides a way to emit and manage messages within a session.

Here's a breakdown of what you can do:

*   **Send Messages:** `notify` and `emit` let you send messages to the session for asynchronous communication or for specific clients.
*   **Execute Commands:** `execute` and `run` allow you to run commands within the session, with `execute` providing more control over execution mode.
*   **Connect & Track:** `connect` establishes a connection, enabling two-way communication and tracking execution metrics.
*   **Commit Actions:** Functions like `commitToolOutput`, `commitSystemMessage`, and `commitUserMessage` allow you to record specific actions taken within the session (e.g., tool calls, system updates, user input).
*   **Control Flow:** Functions like `commitStopTools` provide ways to interrupt or control the flow of actions within the session.
*   **Cleanup:** `dispose` ensures proper resource cleanup when a session is no longer needed.

Essentially, this service is your go-to for any operation you need to perform within a swarm session, providing a safe and well-managed way to interact with the system.

## Class SessionConnectionService

This service acts as a central hub for managing connections and interactions within your swarm system. Think of it as a session manager, handling communication, execution, and overall lifecycle of each session. It intelligently reuses session data to improve efficiency, and coordinates with various other services, such as policy enforcement, agent execution, and swarm configuration.  Essentially, it’s the behind-the-scenes orchestrator, ensuring everything runs smoothly within a specific client and swarm environment.

It provides methods to send messages, execute commands, commit updates to the session history (like tool requests or developer messages), and ultimately dispose of the connection when it's no longer needed. It focuses on providing a consistent and reliable interface for your agents and swarm to work together.

## Class SchemaUtils

This class provides helpful tools for managing how data is stored and formatted within the system. It allows you to save information related to a specific client's session, like preferences or intermediate results, and retrieve it later. 

You can easily write data to a client's session memory, and this happens in a controlled way that ensures the session is secure and validated. Similarly, retrieving data from a client’s session is also handled securely.

Furthermore, this class offers a handy way to convert objects or lists of objects into formatted strings, which is useful for things like logging or transmitting data – essentially flattening complex structures and allowing you to customize how the information is presented.

## Class RoundRobin

This class provides a simple way to rotate through a list of creators, ensuring each one gets a turn. Think of it like a round-robin tournament where each participant gets a chance. 

You define a set of "tokens" – these act as identifiers for different creators you want to cycle through.  The `create` method lets you build a new round-robin function, specifying these tokens and a function (the "factory") that actually generates the instances you need.

Internally, it keeps track of which creator is currently active and rotates to the next one each time it’s called. It can also be configured to log this rotation for debugging or monitoring purposes. 

Essentially, this provides a controlled and predictable way to distribute work across multiple creators.

## Class PolicyValidationService

This service helps ensure that the policies used by your AI agents are valid and consistent across the swarm. It acts like a central registry for all registered policies, keeping track of them and verifying they exist when needed.

The service registers new policies, preventing duplicates and working closely with the policy registration system. When an agent needs to enforce a policy, this service quickly checks to make sure the policy is actually registered. 

It uses a logger to keep track of actions and performance, and it’s designed to be efficient by remembering the results of previous validation checks. This makes things faster overall for the swarm system.

## Class PolicyUtils

This class offers helpful tools for managing client bans within your AI agent swarm's security policies. It provides easy ways to ban a client, remove a ban, and check if a client is currently banned, all while ensuring proper validation and keeping track of actions. Think of it as a simplified interface for interacting with your swarm's security rules related to client access. Each function handles the details of checking inputs and recording activity, letting you focus on the bigger picture of swarm management.

## Class PolicySchemaService

This service manages the rules and restrictions applied throughout the swarm system. Think of it as a central library for policy definitions. It keeps track of these policies, ensuring they're valid and accessible to other parts of the system, like the agents that carry out tasks and the connections that handle sessions.

It validates new policies to make sure they're set up correctly, and provides a way to update existing ones.  You can register new policies, fetch existing ones by name, or even replace ones that are already in place. The system logs these actions, and integrates with other services to apply these policies to different aspects of the agent swarm. It ensures that the system operates within the defined boundaries and restrictions.

## Class PolicyPublicService

This service manages how policies are applied and enforced within the AI agent swarm. It acts as a central point for checking if clients are banned, validating their inputs and outputs, and actually applying bans or unbans. 

It relies on other services like the logging service and the core policy connection service to do its work, and it ensures actions are scoped correctly and logged when enabled. 

You can use it to:

*   Determine if a client is currently banned.
*   Retrieve the reason behind a ban.
*   Verify that client inputs and outputs conform to established policies.
*   Apply or remove bans for specific clients.

## Class PolicyConnectionService

This service manages how policies are applied within the swarm system, acting as a central point for things like checking for bans, validating inputs and outputs, and enforcing those policies. It smartly caches policy details to avoid unnecessary work and uses logging to track activity.

Here's a breakdown of what it does:

*   **Fetching Policies:** It retrieves and caches policy information, making it quick to access the rules for a specific policy name.
*   **Checking Bans:** It verifies whether a client is currently banned in a particular swarm.
*   **Providing Ban Messages:** If a client is banned, it retrieves the reason for the ban.
*   **Validating Data:** It ensures that both incoming data and outgoing data conform to the policy rules.
*   **Banning and Unbanning Clients:** It provides methods to ban and unban clients from the swarm, enforcing policy restrictions or lifting them.

Essentially, this service provides a consistent and efficient way to apply and manage policy enforcement across various components of the swarm system.

## Class PipelineValidationService

This service helps ensure your AI agent pipelines are set up correctly before you start running them. Think of it as a quality check system. 

You can add your pipeline definitions to it, telling the service what each pipeline looks like. Then, when you're ready to run a pipeline, you can use this service to validate it, making sure the setup matches the expected structure. This helps catch errors early and prevents unexpected behavior when your AI agents are working. 

The `addPipeline` method lets you register a pipeline with a name and its schema. The `validate` method then checks if a specific pipeline, based on a given source, is valid according to its registered schema. A logger service is also available to help track and understand the validation process.

## Class PipelineSchemaService

This service is responsible for managing and providing access to pipeline schemas. Think of it as a central repository for defining how your AI agents will work together. 

It uses a schema context service to ensure your schemas are valid and consistent. Internally, it keeps track of all registered schemas.

You can register new schema definitions, update existing ones, or retrieve them when needed. The service provides methods to register, override, and retrieve pipeline schemas using unique keys.

## Class PersistSwarmUtils

This class helps manage how information about your AI agents—specifically which agent is active and the history of agents used—is saved and retrieved. Think of it as a central place to keep track of agent states for each client and swarm.

It provides simple methods to find out what agent a client is currently using, set a new active agent, and view or update the sequence of agents they're been using (the "navigation stack").

You can even customize how this information is stored, allowing you to use different storage mechanisms beyond the default, if needed. This makes it flexible for different deployment scenarios.


## Class PersistStorageUtils

This class helps manage how data is saved and retrieved for each client within the swarm system. It provides a simple way to store information, like user records or logs, persistently. 

You can think of it as a central place to manage data linked to individual clients and specific storage names. The `getPersistStorage` function makes sure that you're always using the same storage instance for a particular storage name, which helps with efficiency. 

The `getData` method lets you easily retrieve saved information, and `setData` allows you to store new data. 

If you need even more control over how the data is persisted, you can customize the storage mechanism using `usePersistStorageAdapter`.

## Class PersistStateUtils

This utility class helps keep track of data associated with each client and state name within the swarm system. Think of it as a way to remember specific information for each agent, like its current settings or progress.

You can store data using the `setState` method, which saves information for a particular client and state name so it can be recalled later.  If you need to retrieve that saved information, the `getState` method allows you to do so, providing a default value if the data isn't already saved.

The system intelligently manages how that data is stored, ensuring that only one persistence mechanism is used for each state type.  If you need more control over how this data is actually saved (perhaps using a database instead of the default method), you can customize the persistence mechanism with `usePersistStateAdapter`.

## Class PersistPolicyUtils

This class helps manage how policy information, specifically lists of banned clients, is stored and retrieved for each swarm within the system. It allows you to easily get the current list of banned clients for a particular policy in a swarm, or update that list when you need to block or unblock clients. 

You can also customize how this data is persisted – for example, storing it in memory, a database, or another system – by providing your own persistence adapter.  This ensures that the system reuses the same persistence mechanism for each swarm, which is more efficient. Essentially, it's your go-to tool for controlling who's allowed to participate in each swarm.

## Class PersistMemoryUtils

This utility class helps manage how memory is saved and retrieved for each individual user session within the swarm system. It ensures that memory data specific to a user (identified by a `SessionId`) is persisted and can be restored later.

The class uses a smart caching system – it remembers which persistence method is being used for each user session, so it doesn’t create unnecessary copies and uses resources efficiently. You can also customize the way memory is stored by providing your own persistence method. 

Methods are provided to easily save data for a user, retrieve that data, and clear out the memory when it’s no longer needed.

## Class PersistEmbeddingUtils

This class helps manage how embedding data is stored and retrieved within the swarm. It’s designed to efficiently handle embedding vectors, preventing repeated calculations by caching them.

You can think of it as a central hub for embedding persistence. It provides simple ways to read existing embedding data and save newly computed embeddings.

A key feature is the ability to customize how the embeddings are actually stored – you can plug in your own persistence mechanisms using `usePersistEmbeddingAdapter`. This allows for flexibility, whether you need to store embeddings in memory, a database, or another system.

The `getEmbeddingStorage` function intelligently manages storage instances, ensuring resources are used effectively by only creating one storage instance per embedding name.

## Class PersistAliveUtils

This class helps keep track of whether clients are online or offline within your AI agent swarm. It manages this information persistently, so the system remembers a client’s status even if it temporarily disconnects. 

You can use it to mark clients as online or offline, and easily check their current status. The system is designed to avoid creating unnecessary persistence instances – it reuses them when dealing with the same client. 

It also provides a way to customize how this status is stored, allowing you to use a different persistence method if needed, such as storing it in memory or a database. This offers flexibility for more advanced tracking scenarios.

## Class PerfService

The `PerfService` is responsible for collecting and logging performance data related to client interactions within the swarm system. It essentially monitors how long different actions take, the sizes of data being processed, and the overall state of those interactions.

Think of it as a detective tracking the efficiency of your AI agent workflows. It keeps tabs on how long each execution takes, how much data is sent and received, and even collects information about the sessions themselves (like active sessions and their states).

This class relies heavily on other services to gather this information, with injected dependencies like `sessionValidationService` and `statePublicService`. The service offers methods to start and stop tracking executions, calculate performance averages, and ultimately serialize this data into easily understandable reports or analytical dashboards. When a session ends, you can clean up any associated performance data using `dispose`. The level of logging is controlled by `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO`.

## Class OutlineValidationService

This service helps manage and check the structure of outlines used by the agent swarm. Think of outlines as blueprints for how agents work together.

It keeps track of all registered outlines, ensuring each one has a unique name. When you want to use an outline, this service verifies that it exists and is properly set up. It also helps to avoid redundant checks by remembering validation results.

You can register new outline structures, get a list of all registered outlines, and most importantly, validate if an outline exists before using it in your system. The service uses logging to keep track of what's happening and error handling to prevent issues.

## Class OutlineSchemaService

This service helps manage the blueprints, or schemas, that guide how our AI agents create outlines. Think of it as a central place to store and update these blueprints. 

It keeps track of these blueprints, allowing you to register new ones, update existing ones with just the changes needed, and easily retrieve them when an agent needs to use them. 

The service uses a special logger to keep track of what’s happening and works with other services to keep things organized and consistent throughout the system. Before adding or changing a blueprint, it checks to make sure it’s set up correctly.

## Class OperatorInstance

This class represents a specific instance of an operator within a swarm of AI agents. Think of it as one agent actively participating in a coordinated task. 

Each instance is identified by a client ID and a name, and can receive callbacks to handle specific events. You can set up a connection to receive answers from this agent, send notifications to it, or directly provide answers and messages. When the agent's work is complete, you can trigger its disposal to clean up resources.

## Class NavigationValidationService

This service helps manage how agents within the swarm move around. It keeps track of which agents have already been visited to avoid sending agents on unnecessary trips.

The service uses a logger to record what’s happening during navigation, and it’s cleverly designed to remember previously calculated routes so it doesn’t have to recalculate them every time.

You can start monitoring navigation for a specific client and swarm, reset that monitoring to start fresh, or completely dispose of the navigation route when it's no longer needed. The `shouldNavigate` function is the key to deciding whether an agent should be sent somewhere new, checking the tracking information first.

## Class NavigationSchemaService

This service keeps track of which navigation tools are being used within the system. It essentially manages a list of recognized tool names. 

You can add a tool to the list using the `register` method, which also logs the action if logging is enabled.  

The `hasTool` method lets you quickly check if a particular navigation tool is already registered. It also logs the check if logging is active.

## Class MemorySchemaService

This service manages temporary, in-memory data associated with different sessions within the swarm. Think of it as a simple scratchpad for each session, allowing different components to store and retrieve small pieces of information. It's not a database; the data disappears when the session ends.

Each session gets its own space in this memory, and components can write, read, or clear this data as needed. This system keeps track of the activity by logging operations, but doesn’t store anything permanently or validate its format. It's designed to work closely with other services like session management and agent communication, providing a lightweight way to share data specific to each session.


## Class MCPValidationService

This service helps you keep track of and verify Model Context Protocols, or MCPs. Think of it as a librarian for your MCPs, ensuring they're all present and correct. 

It stores your MCP schemas in a handy map, allowing you to easily add new ones and check if existing ones are valid. The service uses a logger to record its actions, helping you understand what’s happening behind the scenes. You can add new MCP definitions and then use the validation method to confirm that each one exists and is properly defined.

## Class MCPUtils

This class, `MCPUtils`, helps manage updates to the tools used by clients connected through the Multi-Client Protocol. Think of it as a way to ensure everyone has the latest version of what they need. You can use it to push updates to all connected clients at once, or to target a single client to keep their tools current. It simplifies the process of keeping clients synchronized with the latest tools.

## Class MCPSchemaService

This service helps manage the blueprints, or schemas, that define how AI agents communicate and share information within a swarm. It acts as a central place to store, update, and access these schemas.

The service relies on a logger for tracking activities and a schema context service to handle the details of managing the schemas themselves. Internally, it keeps a record of all registered schemas.

You can use it to add new schema definitions, modify existing ones, or simply look up a schema when needed. It offers a simple way to ensure everyone in the swarm is using the correct and most up-to-date schema definitions.

## Class MCPPublicService

This class provides a way to interact with the Model Context Protocol (MCP) to manage and use AI tools. Think of it as a central hub for coordinating actions related to those tools.

You can use this class to find out what tools are available, check if a particular tool exists, and actually run those tools. It handles the underlying communication and resource management, allowing you to focus on using the tools themselves.

It also allows you to update the list of available tools, either for all clients or for a specific one, ensuring everyone has the most current options. 

Essentially, this class is the gateway to leveraging AI tools within a controlled environment.

## Class MCPConnectionService

This class helps manage connections and interactions with different AI models using a standardized protocol, MCP. Think of it as a central hub for letting your agents talk to various AI tools.

It keeps track of available tools for each agent and handles requests to those tools.  You can use it to find out what tools are available, check if a tool exists, and actually execute a tool with specific inputs. The system intelligently caches these connections to make things faster, and there's a way to clean up resources when an agent is finished. It relies on other services for logging, communication, and managing tool definitions.

## Class LoggerService

The `LoggerService` is responsible for managing and directing log messages throughout the AI agent swarm system. It provides a central point for logging, allowing you to track events and debug issues effectively.

It captures important details like the client ID and execution context, adding context to your log messages so you can understand where they originated.  Logs are sent to both a system-wide logger and a client-specific logger, giving you flexibility in how you handle them.

You can customize the logging behavior at runtime by swapping out the common logger, which is helpful for things like testing or advanced configurations.  Different logging levels (log, debug, info) are available, and these are controlled by system-wide configuration flags. This allows you to easily enable or disable detailed logging based on your needs.

## Class LoggerInstance

The `LoggerInstance` helps manage logging specifically for a client, giving you a way to track what's happening and customize how that information is handled. You create a `LoggerInstance` by giving it a client identifier and optional callback functions to control things like what gets logged and where it goes.

It allows you to control whether log messages appear in the console, and you can define your own functions to be triggered when certain events happen, like initialization, logging, or cleanup. The `waitForInit` method ensures that any initial setup runs just once.

You can use `log`, `debug`, `info` to send messages, and `dispose` to clean up when you're finished with the logger. It’s designed to make your logging flexible and easy to manage for each individual client.

## Class HistoryPublicService

This service manages how history is accessed and modified within the agent swarm. It provides a public interface for interacting with the history, acting as a bridge between external requests and the core history management system.

Think of it as a gatekeeper for the agent's memory – allowing controlled access for logging, retrieving, and clearing history data.

Here's a breakdown of what it does:

*   **Pushing History:** It lets you add new messages or events to an agent’s history, recording actions and communications.
*   **Retrieving History:** You can pull the most recent message or a complete list of past interactions.
*   **Formatting History:** It can transform the history into an array, making it easier for agents to process and understand.
*   **Cleaning Up History:**  It offers a way to clear an agent's history when it's no longer needed.

This service carefully tracks and logs these operations and works closely with other parts of the system like message handling, performance tracking, and documentation to ensure everything runs smoothly and is properly recorded.

## Class HistoryPersistInstance

This component keeps track of conversations for your AI agents, remembering what's been said and storing it so it doesn't get lost. It handles both in-memory storage and saving the history to disk, ensuring data is preserved.

Each history instance is tied to a specific agent using a client ID. It provides methods for adding new messages, retrieving the last message, and iterating through the entire history. Importantly, it makes sure initialization happens only once per agent. When you’re finished with a history, it can be disposed of, optionally clearing all associated data. It also allows for custom callbacks to be used to react to events like adding, removing, or reading messages.

## Class HistoryMemoryInstance

This component acts as a temporary record keeper for conversations happening between AI agents. It stores messages in memory, meaning the history isn't saved permanently.

Each history instance is tied to a specific client ID and can be configured with callbacks to handle events like adding, removing, or reading messages.

To get started, you create an instance and then use methods like `push` to add messages, `pop` to remove them, and `iterate` to go through the conversation history.  The `waitForInit` method ensures things are properly set up before you start using it. When you're finished, the `dispose` method allows you to clear the history, optionally for all agents at once.

## Class HistoryConnectionService

This service manages the history of interactions with agents within the swarm system. Think of it as a central hub for tracking what's happening with each agent – the messages sent and received. It's designed to be efficient, reusing history data whenever possible to avoid unnecessary work.

It works closely with other components like the agent execution environment and the public API, and it keeps track of usage for monitoring and resource management. When you need to retrieve or update an agent’s history, this service handles it, often using cached data to make things faster.

Here's a breakdown of what you can do with this service:

*   **Retrieve History:** It provides a way to get the history of a specific client and agent.
*   **Add Messages:** You can push new messages to an agent’s history.
*   **Remove Messages:** It allows you to pop the most recent message from an agent’s history.
*   **Format History:**  It can convert the history into different formats, like arrays, suitable for use by the agent itself or for reporting.
*   **Clean Up:** It properly disposes of the history when it's no longer needed, releasing resources and updating usage tracking.

## Class ExecutionValidationService

This service helps keep track of how many times an AI agent has been told to perform a task, and makes sure things don't get too deeply nested. It uses a system that remembers these counts so it can quickly check them later.

You can use it to see how many execution attempts are ongoing for a specific client and swarm. If things get out of control, it can increment or decrement those counts to monitor the process.  If you need a fresh start, you can clear out the execution IDs for a particular client and swarm. Finally, if you want to completely remove the remembered information, you can dispose of the count.

## Class EmbeddingValidationService

This service helps ensure that the names of your embeddings are correct and consistent throughout the system. It keeps track of all registered embedding names, making sure there are no duplicates and that they actually exist when they're used. 

It works closely with other parts of the system – like the embedding registration service and the component handling similarity searches – to keep everything synchronized. The service uses logging to record its actions and uses a technique called memoization to make validation checks faster.

You can add new embeddings to the service, and then validate them to confirm their existence. This helps prevent errors and ensures reliable operation.

## Class EmbeddingSchemaService

This service manages the blueprints for how embedding logic works within the system. Think of it as a central place to store and retrieve instructions on how to create and compare embeddings – those numerical representations of data used for similarity searches.

It ensures these blueprints are set up correctly by doing some basic checks when they're added or updated. The system uses this service to make sure embedding logic is available where it's needed, like when retrieving data from storage or when agents need to work with embeddings.

The service keeps track of these embedding blueprints using a registry, and it’s designed to work closely with other components to maintain consistency and efficiency throughout the entire swarm ecosystem. You can register new blueprints, get existing ones, or even update them if necessary, all while the system keeps a log of what's happening.

## Class DocService

This class is responsible for generating and organizing documentation for the entire system, including swarms, agents, and their performance metrics. It's essentially a documentation generator that helps developers understand the architecture and behavior of the swarm system.

Think of it as a Swiss Army knife for documentation: it creates Markdown files describing swarm and agent schemas, JSON files for performance data, and even generates UML diagrams to visualize the relationships between components.  

It leverages a series of other services (like schema validation and performance tracking) to gather the necessary information and writes the output in a structured directory layout, making it easier to navigate and understand.  The whole process is designed to be efficient, using a thread pool to handle documentation generation concurrently.  The system can be configured to log its actions for detailed insight into documentation creation.

## Class ComputeValidationService

This service helps manage and validate the configuration of individual compute tasks within your agent swarm. Think of it as a central place to ensure each task is set up correctly before it begins its work.

It uses other services for logging, validating state, and handling schemas, making it easy to integrate with your existing infrastructure.

You can add new compute tasks, each with its own specific setup (defined by a schema), and this service keeps track of them.

The core function is the validation process – it checks if a compute task's configuration is valid according to its defined schema, helping to prevent errors and ensure smooth operation of your agent swarm. It keeps a record of which computations are registered.

## Class ComputeUtils

This class, ComputeUtils, provides tools for managing and retrieving information about computational resources within the agent swarm. Think of it as a helper for understanding what compute power is available and making sure it's properly assigned. 

The `update` method lets you mark a compute resource as updated or available, associating it with a specific client and compute name.  It's a way to signal that a compute task has finished or a resource is ready for a new assignment.

The `getComputeData` method lets you fetch details about a particular compute resource, such as its status or configuration. You can specify the client and compute name to retrieve the data you need, and the method will return it in a format you define.

## Class ComputeSchemaService

This service helps manage and organize different schema definitions used by your AI agents. Think of it like a central library where you store and retrieve blueprints for how your agents should understand and process information. 

It uses a logging service to keep track of what's happening and a schema context service to handle all the underlying schema management tasks.

You can register new schema definitions, replace existing ones, and easily retrieve them when needed. The service provides methods to add, update, and access these schema blueprints, making it simple to ensure consistency and organization across your agent swarm.

## Class ComputePublicService

This component handles interactions with compute resources, allowing you to manage and refresh data based on specific conditions. It relies on a logger for tracking activity and a compute connection service to actually perform the operations.

You can use `getComputeData` to fetch computed information, `calculate` to force a recalculation, `update` to refresh data, and `dispose` to properly clean up resources when they're no longer needed. Each of these actions can be targeted within a particular method and client context. The system keeps track of what's happening through the injected logger.

## Class ComputeConnectionService

The ComputeConnectionService acts as a central hub for managing and interacting with compute operations within the agent swarm. It handles connecting to and retrieving data from compute resources, leveraging services for logging, communication, context management, schema validation, and state connection.

You can think of it as a way to access and refresh computed results, using its `getComputeData` method to get the latest results.  The `calculate` method triggers the process of computing new results based on a given state. When things are finished, `update` helps synchronize data and `dispose` cleans up resources when no longer needed. The `getComputeRef` method provides a way to get a reference to a specific compute operation.

## Class CompletionValidationService

This service is responsible for making sure completion names used within the agent swarm are unique and valid. It keeps track of all registered completion names and checks them against new requests. 

The service logs its actions for monitoring and uses a technique called memoization to speed up the validation process. It works closely with other services – it receives new completion names from the CompletionSchemaService, verifies completions used by agents through the AgentValidationService, and handles completion usage through the ClientAgent. The LoggerService is also used for logging details about validation operations.

You can add new completion names using the `addCompletion` method. The `validate` method is used to confirm that a given completion name is registered and valid, and this check is cached to improve efficiency.

## Class CompletionSchemaService

The CompletionSchemaService acts like a central library for defining and managing the logic agents use to complete tasks. Think of it as a place where you store and organize the "recipes" agents follow. 

It makes sure these "recipes" are valid before they’re used, and it keeps track of them using a reliable system. This service works closely with other parts of the agent system, helping to ensure that agents are properly configured and can execute their tasks effectively.

It provides methods to register new completion logic, update existing ones, and retrieve them when needed. The service also has built-in logging to help track operations and debug any issues. Overall, it's a crucial component that allows agents to perform complex tasks by providing a standardized and manageable way to define their core functionality.

## Class ClientSwarm

This class, `ClientSwarm`, is the central manager for your AI agents within a swarm. It's like a conductor coordinating a team of agents, ensuring they work together smoothly.

Think of it as having a stack of agents you can move between. `ClientSwarm` keeps track of which agent is currently active and the order in which you're moving between them (the navigation stack). It handles waiting for output from agents and notifying you when things happen, like an agent being updated or an output being canceled.

You can use it to:

*   **Check if the swarm is busy** (waiting for an agent to finish, for example).
*   **Send messages** to agents and receive updates.
*   **Move between agents** in a specific order.
*   **Cancel ongoing operations** like waiting for output.
*   **Get details** about the active agent or its properties.

The system uses internal events to communicate changes – like when an agent is switched – so other parts of your application can react accordingly. When the swarm is no longer needed, you can dispose of it to release resources.

## Class ClientStorage

This class handles storing and retrieving data within the swarm system, allowing for efficient searches based on similar data. It’s designed to manage data storage operations, including adding, removing, and clearing items, while also keeping track of how similar each item is to others using embeddings.

The class works by keeping a local copy of the data and using a queue to handle storage changes, which makes sure everything happens in the right order. It also caches calculations to speed things up and automatically updates this cache when data changes.

You can use it to:

*   **Store and retrieve data:** Add new items, get existing ones, or remove them entirely.
*   **Search for similar data:** Find items that are like a particular search term.
*   **Manage data changes:** Ensure data updates happen reliably and in the correct sequence.
*   **Keep track of data updates:** The system can notify other parts of the swarm when data is added, removed, or changed.

Essentially, this class provides a reliable and efficient way to manage and search through data within the swarm system, ensuring that information is stored, retrieved, and updated in a controlled and organized manner.


## Class ClientState

This class manages the data and behavior of a single client's state within the larger swarm system. Think of it as a container holding the client's information and handling how that information is read, written, and shared.

It keeps track of state changes and uses a system of callbacks and events to notify other parts of the system when something changes.  It makes sure that reading and writing the data is done safely, even if multiple clients or tools are accessing it at the same time.

You can use this class to initialize the client's data, set new data, clear it completely, or retrieve the current information. When the client is finished, it can be disposed of to clean up resources. It works closely with other services to manage the state’s lifecycle and ensure everything runs smoothly.

## Class ClientSession

This class, `ClientSession`, manages interactions within a swarm of AI agents for a single client. Think of it as a dedicated workspace for a conversation or task.

It handles sending messages, processing responses, and keeping track of what’s happened during the session.  It works closely with other system components like policy enforcement, event handling, and agent communication.

Here’s a breakdown of what it does:

*   **Message Handling:** It allows you to send messages to the swarm, execute them using an agent, and receive results. You can also trigger stateless executions which skip certain checks.
*   **History Tracking:** It keeps a record of user messages, assistant responses, and system actions within the session.  This history is managed through the `ClientAgent`.
*   **Session Control:** You can signal the agent to stop tool execution or clear the entire session history.
*   **Real-time Communication:** It can be connected to a message connector, enabling real-time interactions.
*   **Cleanup:** When the session is finished, it can be disposed of to release resources.



Essentially, `ClientSession` is the central point for managing a client's experience within the AI agent swarm.

## Class ClientPolicy

The ClientPolicy class is like a gatekeeper for your AI agent swarm, ensuring only authorized and well-behaved clients can participate. It manages things like banning problem clients, validating their messages (both incoming and outgoing), and enforcing rules specific to each swarm.

Think of it as having a list of banned clients – this list is loaded only when needed to keep things efficient.  If a client tries to send a message that doesn't meet the rules, the policy can automatically ban them and provide a helpful message.  

This class works closely with other components like the connection services, agent, and the event bus to manage access control, apply rules, and keep your swarm secure and compliant.  You can customize how bans are handled, including automatic banning and personalized ban messages. The system also allows for easy unbanning of clients when necessary.

## Class ClientOperator

The `ClientOperator` helps you interact with a swarm of AI agents. Think of it as a central point for sending instructions and receiving results from these agents. 

You initialize it with some basic configuration. The `run` and `commitToolOutput` methods aren't currently functional, serving as placeholders for potential future features.  

The `execute` method is key - you use it to send input to the agent swarm and specify how that input should be handled. `waitForOutput` pauses execution until the agents have completed their tasks.  You can send messages to the agents – user messages, assistant messages, and developer messages – and the `commit...` methods handle the process of delivering these messages.  The `dispose` method cleans up resources when you're finished interacting with the agent swarm. Finally, `commitAgentChange` signals a shift in the agent configuration.

## Class ClientMCP

This component, the ClientMCP, handles how tools are accessed and used for a specific client within the system. Think of it as a central manager for a client's toolset.

It keeps track of the tools available to a client, caching them for quick access. You can use it to see what tools a client has, check if a specific tool exists, or refresh the list of tools.

The core function is `callTool`, which lets you actually run a tool with specific instructions, returning a result. When a client is no longer needed, you can `dispose` of it, cleaning up resources and ensuring things are properly released. Essentially, it's responsible for managing a client's tools from beginning to end.

## Class ClientHistory

This class keeps track of all the messages exchanged with an agent in the swarm system. It's responsible for storing, retrieving, and cleaning up these messages.

You can add new messages using the `push` method, which also broadcasts that a new message has been added.  The `pop` method lets you remove and retrieve the most recent message, useful for things like undoing actions.

If you need to see all the messages without any filtering, `toArrayForRaw` gives you the complete history.  For agent-specific tasks, `toArrayForAgent` creates a customized list of messages, filtering them based on pre-defined rules and adding context like prompts and system instructions.

Finally, `dispose` cleans up the resources used by the history when the agent is no longer needed, ensuring everything is properly released.

## Class ClientCompute

This component handles the computations that happen on the client side, keeping track of the data and reacting to changes. When you need to recalculate something based on new information, you can use the `calculate` method. If you want to force a complete refresh of the computations, the `update` method does that. The `getComputeData` method fetches the computed results, and when you're done with the component, the `dispose` method ensures everything is cleaned up properly, like unsubscribing from updates and running any cleanup code you’re using.

## Class ClientAgent

This class, `ClientAgent`, is the core of your AI agent’s behavior, handling everything from receiving user input to coordinating tool calls and managing errors. Think of it as the brain of your agent, responsible for taking actions and communicating with other parts of the system.

It’s designed to handle messages, calls to tools (like searching the web or running code), and tracking the history of those interactions. Importantly, it prevents overlaps in what it's doing to keep things running smoothly.

Here's a breakdown of what it does:

*   **Receives and Processes Requests:** It takes user messages and decides what to do, potentially involving calls to different tools.
*   **Manages Tools:** It figures out which tools are available and ensures there are no duplicates, then executes them and tracks their results.
*   **Handles Errors:** If something goes wrong (a tool fails, for example), it has strategies for recovering and trying again.
*   **Keeps Track of History:**  It records all interactions so the agent can “remember” previous conversations.
*   **Communicates with Others:** It relays information to other components like the swarm management system and the history tracker.

The class uses a system of "subjects" to signal changes in state, allowing other parts of your application to react to events like errors or agent updates.  It’s a central point for managing the agent's lifecycle and coordinating its actions.  The `dispose` method, in particular, allows for cleanup when the agent is no longer needed.


## Class ChatUtils

This class, `ChatUtils`, is like the central manager for all your chat sessions within an AI agent swarm. It handles creating, sending messages to, and cleaning up these chat instances.

Think of it as the traffic controller, ensuring each client gets the right chat session and that everything is properly shut down when it's no longer needed.

You can tell it which type of chat instance to use with `useChatAdapter`, and customize how it behaves with `useChatCallbacks`.

The `beginChat` method starts a new chat session, `sendMessage` sends a message, `listenDispose` allows you to monitor when a chat session ends, and `dispose` properly shuts it down. The `getChatInstance` method retrieves or creates a chat instance for a specific client.

## Class ChatInstance

The `ChatInstance` represents an individual chat session within an AI agent swarm. It's given a unique identifier (`clientId`) and associates with a specific swarm (`swarmName`).  You also provide a function to call when the chat is closed (`onDispose`) and can optionally pass in callbacks for specific events.

Internally, the instance tracks its activity and manages the chat session lifecycle. 

Key actions you can perform include starting a new chat (`beginChat`), sending messages (`sendMessage`), and gracefully ending the chat session (`dispose`).  There's also a mechanism to be notified when a chat session is closed using `listenDispose`. The `checkLastActivity` method is used to verify activity within a defined timeout.

## Class BusService

This class, `BusService`, is the central hub for managing event-driven communication within the system. It allows different parts of the swarm, like client agents and performance tracking services, to easily send and receive updates.

Think of it as a post office – you can subscribe to receive specific types of messages (events) from a particular sender (client or service). The `subscribe` and `once` methods allow you to register for those messages. You can even subscribe to a "wildcard" to catch all messages of a certain type.  The `emit` method is how you actually send those messages, ensuring they reach the correct recipients after verifying the client session.

Specialized methods like `commitExecutionBegin` and `commitExecutionEnd` are shortcuts for emitting predefined event structures related to execution tasks.  Finally, `dispose` is used to clean up everything when a client disconnects, making sure no resources are left behind. The system automatically keeps track of the subscriptions and efficiently manages them to avoid unnecessary overhead.

## Class AliveService

The `AliveService` class helps keep track of which clients are currently active within your AI agent swarms. It's responsible for updating and recording whether a client is online or offline. You can use it to tell the system when a client connects or disconnects, and it automatically saves this information so the system remembers even if it restarts. The `markOnline` function sets a client's status to online, while `markOffline` does the opposite. Both actions also log the event and use a persistent storage adapter to ensure the status is saved.

## Class AgentValidationService

The AgentValidationService is responsible for making sure agents in your swarm system are set up correctly and work well together. It manages information about each agent, including their configuration and dependencies.

Think of it as a quality control checkpoint for your agents. It registers new agents, checks their settings, and verifies they have the resources they need (like storage and states). 

It relies on other services like the AgentSchemaService and SwarmSchemaService to do its job, and it keeps track of things like agent dependencies to ensure they interact properly.  It also logs activities for debugging and monitoring.

Here's a breakdown of what it does:

*   **Registration:** Adds new agents and their configurations to the system.
*   **Verification:** Checks if agents have the necessary components (storage, states, tools).
*   **Dependency Management:**  Confirms that agents have the dependencies they need to function.
*   **Information Retrieval:** Provides lists of agents, their storage, states and dependencies.
*   **Performance Optimization:** Uses techniques like memoization to speed up validation checks.

## Class AgentSchemaService

The AgentSchemaService acts as a central place to define and manage the blueprints for your AI agents within the swarm system. It's like a library where each agent's characteristics—what it does, what it needs, and how it interacts—are carefully recorded.

This service makes sure these blueprints are consistent and valid before they're used, ensuring agents behave as expected. It helps different parts of the system, like agent creation, swarm configuration, and client-side execution, all work together using the same reliable information about each agent.

You can register new agent blueprints, update existing ones, and retrieve them when needed. The service keeps track of these blueprints using a registry and provides logging to help you understand what's happening. Think of it as the foundation for defining and controlling the behavior of your AI agents.

## Class AgentPublicService

This class, `AgentPublicService`, is the main way to interact with agents in the swarm system. Think of it as a friendly interface built on top of more complex internal services.

It handles common operations like creating agents, running commands, and managing their history (messages, tools used, etc.). Crucially, it provides a consistent way to log these actions and ensure context is maintained during execution.

Here's a breakdown of what you can do with it:

*   **Agent Creation:** You can create a reference to an agent for a specific client and method.
*   **Running Commands:** You can execute commands on agents, either with a full execution (`execute`) or a quick, stateless completion (`run`).
*   **Managing History:** You can add various types of messages to an agent's history: user input, system prompts, developer notes, tool requests, and responses. This provides a record of the agent's actions.
*   **Cleanup:** You can dispose of an agent to free up resources.
*   **Logging:** It automatically logs relevant events, controlled by a global configuration setting, ensuring transparency and auditability.

Essentially, `AgentPublicService` simplifies agent interaction while maintaining important context and ensuring proper logging throughout the process. It acts as a gatekeeper, organizing and managing agent-related activities within the swarm.

## Class AgentMetaService

The AgentMetaService helps you understand and visualize the relationships between different agents in your swarm system. It essentially takes information about each agent—their dependencies, states, and tools—and organizes it into a structured tree.

You can use it to create either detailed or simplified views of these agent relationships, and it can even generate diagrams in a standard UML format. This is particularly useful for documentation and debugging, allowing you to easily see how agents interact and what their roles are.

The service relies on other components for getting agent information and logging, and it’s designed to work closely with services that generate documentation and performance reports. It's a central piece for making the complex interactions within your agent swarm more understandable.

## Class AgentConnectionService

This service acts as the central hub for managing connections to AI agents within the system. It efficiently handles the creation, execution, and lifecycle of these agents by caching them and reusing them whenever possible.

Think of it as a factory for agents: When you need an agent, this service retrieves one from a pool, or creates a new one if it doesn’s already available. It's designed to be resource-conscious, avoiding unnecessary agent creation.

It integrates seamlessly with other parts of the system to handle tasks like logging events, tracking usage, managing history, and ensuring the agent has access to necessary configurations and tools. When you’re done with an agent, this service cleans up the resources it was using.


## Class AdvisorValidationService

This service helps ensure your AI agents, or "advisors," are set up correctly. Think of it as a quality control system. 

You can register advisor schemas, essentially defining what each advisor *should* look like, using the `addAdvisor` method. 

Then, the `validate` method checks if an advisor exists based on its name, helping you catch potential configuration errors early on. It keeps track of the advisors you've registered internally.

## Class AdvisorSchemaService

This service helps manage and work with advisor schemas, which are essentially blueprints for how AI agents should behave. 

It's designed to be flexible, allowing you to register new schema definitions, update existing ones, and easily retrieve them when needed. The service keeps track of the schema context, providing tools for validating and interacting with these schemas. 

Think of it as a central hub for defining and maintaining the rules that guide your AI agent swarm. You can register a new schema, update a schema's properties, or simply fetch a schema when you need it.

## Class AdapterUtils

This class provides easy ways to connect to different AI services for generating text. Think of it as a toolbox with pre-built connections to platforms like Hugging Face, Cortex, Grok, Cohere, OpenAI, LMStudio, and Ollama. Each function within this toolbox (like `fromHf`, `fromCortex`, `fromOllama`) creates a specific function you can use to send requests to that service's chat completion API. You'll typically provide credentials or configuration details for the AI provider when using these functions.  The `model` parameter allows you to specify which AI model to use within that provider.

## Class ActionSchemaService

This service helps manage a list of available action tools for your AI agents. Think of it as a registry that keeps track of which tools are ready to be used. You can register new tools with the `register` method, essentially adding them to the list. The `hasTool` method lets you quickly check if a particular tool is already registered and available for use. The service also includes logging capabilities to monitor registrations and lookups, if logging is enabled in your configuration.

# agent-swarm-kit interfaces

## Interface ValidationResult

This object represents the outcome of checking if the arguments you're sending to a tool are valid. It tells you whether the validation passed or failed. 

If everything is good, you’ll find the validated data neatly packaged in the `data` property. If there's a problem with the arguments, the `error` property will contain a message explaining what went wrong. The `success` property simply confirms whether the entire validation process was successful.

## Interface TAbortSignal

This interface helps you control and manage the cancellation of ongoing tasks, like stopping a process mid-execution. It builds on the standard way JavaScript handles cancellation signals, offering a typed version to make things clearer and more organized in your code. Think of it as a way to cleanly pause or stop actions that might take some time, ensuring your application behaves predictably. You can even add your own extra features to this interface if your project needs something unique.

## Interface JsonSchema

This describes a JSON Schema, which is a way to define the structure of JSON data. Think of it as a blueprint that ensures data conforms to a specific format. 

It outlines key elements like the data type (string, number, boolean, etc.), properties (the individual fields within the data), and which properties are mandatory.  

You can also control how strict the validation is by specifying whether extra, unexpected properties are allowed. This is useful for balancing flexibility and ensuring data integrity.

## Interface ITriageNavigationParams

This interface defines the settings you can use to set up how an AI agent navigates through different tasks or tools. You specify a `toolName` – essentially, what you want to call this particular tool.  A `description` helps explain what the tool does. You can also add a `docNote` for extra documentation. Finally, you have the flexibility to define an `isAvailable` function; this lets your system dynamically decide if a tool should be offered based on factors like the client, the agent, or other contextual information.

## Interface IToolRequest

This interface describes what’s needed to ask the swarm to run a specific tool. Think of it as a way for agents to tell the system, "Hey, I need to use this tool and here's the information it needs to work." 

It has two main parts: the `toolName` which is like the tool's identifier, letting the system know exactly which tool to use, and `params`, which are the inputs the tool needs – it’s the tool’s data for the specific task. The system checks these parameters to make sure they’re valid for the tool being used.

## Interface IToolCall

This interface describes a request to use a tool within the agent swarm. Think of it as a specific instruction for an agent to run a particular tool, providing the tool's name and the information it needs to work with. Each tool call has a unique ID so the system can track it, and right now, all tools are treated as functions – meaning they're designed to be executed with inputs. The `function` property details precisely which function should be called and what arguments it should receive, pulling this information directly from the model’s instructions.

## Interface ITool

This interface, `ITool`, describes the structure of a tool available to the AI agents. Think of it as a blueprint for a function that an agent can use.

It outlines the tool’s type – currently, it’s always a "function" – and crucially, defines the function's details. This includes the function’s name and a description, so the AI understands what it does.  Most importantly, it describes the expected parameters, including their types and whether they're required. This parameter information allows the AI to construct valid requests for the tool. The AI agents use this information to decide when and how to use the tool.

## Interface ISwarmSessionCallbacks

This interface lets you listen in on important happenings within your AI agent swarm. You can use these callbacks to track when agents connect, when commands are run, and when messages are sent between them. Think of them as notification hooks – you can use them to log activity, perform setup tasks when a new agent joins, or react to specific messages being broadcast within the swarm. There are also callbacks to monitor the initial setup and cleanup of sessions, giving you a complete view of the swarm's lifecycle.

## Interface ISwarmSchema

This interface defines the blueprint for how a swarm of AI agents is set up and managed. Think of it as a configuration file that dictates the swarm's personality and how it operates.

You can use it to give your swarm a unique name, specify which agents are available to it, and even designate a default agent to use when no specific agent is selected. It also lets you define rules (policies) that control the swarm’s behavior.

Furthermore, you can choose to save the swarm's progress and active agent information so it can resume where it left off. There’s also the option to provide custom functions to manage the navigation stack – essentially, the history of where the swarm has been – and to handle the selection of active agents during the swarm’s lifecycle. Finally, you can add custom events and hooks to respond to specific swarm actions.

## Interface ISwarmParams

This interface defines the settings needed to kick off a swarm of AI agents. Think of it as the blueprint for setting up your agent team. It includes things like a unique identifier for who's launching the swarm, a way to log what's happening (for debugging or monitoring), a communication channel for the agents to talk to each other, and a list of the individual agents participating in the swarm, so the system knows who's involved. Essentially, it ensures everything is configured correctly before the swarm gets to work.

## Interface ISwarmMessage

This interface defines the structure of a message passed around within the agent swarm system. Think of it as the basic unit of communication – it’s how agents, tools, users, and the core system exchange information. 

Each message has a name identifying which agent sent it. It also includes a 'mode' that clarifies whether the message originates from a user or a tool, which helps the system handle it appropriately. Finally, it can contain optional extra data in the 'payload' section, allowing for more detailed communication. These messages are essential for keeping track of what's happening, generating completions, and triggering events within the swarm.

## Interface ISwarmDI

This interface acts as a central hub for all the key services within the AI agent swarm system. Think of it as a toolkit containing everything needed to manage the swarm's behavior and interactions.

It provides access to services for documentation, event communication, performance monitoring, and ensuring system health. There are also services dedicated to managing execution context, payload data, agent connections, and various data storage and state management functionalities.

Beyond core functionality, it offers services for defining and enforcing rules via schemas and validations for agents, tools, sessions, and the swarm as a whole, ensuring integrity and correct operation. It also provides public APIs for interacting with these services, allowing external components to control and monitor the swarm. The interface provides services that are required in different areas to implement the orchestration framework.

## Interface ISwarmConnectionService

This interface lays out the blueprint for how different parts of the system connect and communicate within the agent swarm. Think of it as a contract—it specifies the methods and properties that a connection service *must* provide to be considered a valid component. It's designed to ensure that the public-facing connection services are consistent and predictable, hiding the internal workings of how those connections are managed. The purpose is to clearly define what a SwarmConnectionService offers to the outside world, while keeping internal implementation details separate.

## Interface ISwarmCompletionArgs

This interface defines the information you need to provide when requesting a chat completion from your AI agent swarm. Think of it as a way to tell the system *which* agent is responding, where the last message came from (a tool or a user), and what tools are available for the agent to use. Specifying the agent name is essential for context, while indicating the message source helps the system understand the flow of the conversation. Providing a list of tools allows the agent to dynamically use external functions and systems during its response.

## Interface ISwarmCallbacks

This interface lets you hook into important events happening within your AI agent swarm. Specifically, you're notified whenever an agent's role or assignment changes inside the swarm. It's like getting a signal that tells you which agent is now active and what its name and the overall swarm name are, so you can update your system accordingly – perhaps to track navigation or just keep an internal record of what’s going on.

## Interface ISwarm

This interface gives you control over a group of AI agents working together. You can use it to tell the swarm which agent to use, retrieve the name or instance of the active agent, and get the output they're producing. It also lets you cancel ongoing operations and manage the swarm’s overall state, like pausing it or checking if it’s currently working on something. You can even send messages through the swarm to communicate with the underlying system.

## Interface IStorageSchema

This interface outlines how storage is configured within the AI agent swarm. It defines whether data is saved persistently, provides a way to describe the storage for documentation, and allows you to share storage across multiple agents. 

You can also customize how data is fetched and saved by providing your own functions for retrieving and persisting data. The `embedding` property specifies the method used for indexing data, while `storageName` gives each storage instance a unique identifier. 

The optional `callbacks` allow you to react to specific storage events. A way to provide default data is also included and there's a method to create indexes for efficient searching and retrieval of storage items.

## Interface IStorageParams

This interface defines how the system manages data storage, tailoring it to specific clients and embedding processes. It includes details like the client’s unique identifier and the name of the storage being used. 

You'll find functions here for calculating similarity between data representations (embeddings), and for saving and retrieving those pre-computed embeddings to speed things up. The interface also provides ways to generate new embeddings for data items and includes components for logging activity and communicating events within the larger system.

## Interface IStorageData

This interface describes the basic information held within our storage system. Every item saved will have a unique identifier, called `id`, which allows us to easily find and delete it later. Think of it as a primary key for each piece of data we keep.

## Interface IStorageConnectionService

This interface helps define how your AI agent swarm connects to storage, making sure the public-facing connection methods are clear and consistent. It’s a way to precisely specify the storage connection service, focusing on what's important for external use and leaving out the internal workings. Think of it as a blueprint for how your agents interact with storage in a standardized way.

## Interface IStorageCallbacks

This interface defines a set of functions your code can use to stay informed about what's happening with the data storage system. Think of it as a way to listen in on important events.

You're notified whenever data is changed, including when items are added or removed. There's also a callback for when searches are performed, allowing you to potentially optimize search behavior.

Furthermore, you’re alerted when the storage is first set up and when it’s shut down, providing opportunities for initial configuration and final cleanup tasks. These callbacks help you manage and monitor the storage system's lifecycle.

## Interface IStorage

This interface provides a simple way to manage data within your AI agent swarm. You can think of it as a central place to store and retrieve information for your agents to use.

The `take` method lets you find similar items based on a search query – useful for finding related documents or data points.  `upsert` allows you to add new data or update existing data, keeping your storage current. If you need to delete something, `remove` gets rid of items by their unique ID.  

Need to look up a specific item? Use `get` to retrieve it by ID.  If you want to see everything or just a selection of items, `list` gives you that functionality, allowing you to filter what you see. Finally, `clear` wipes the entire storage clean, giving you a fresh start.

## Interface IStateSchema

The `IStateSchema` interface outlines how a piece of information, or "state," is managed within the AI agent swarm. It lets you define how this state is stored, shared, and updated.

You can tell the system whether the state needs to be saved persistently, provide a helpful description for documentation, and control if it’s accessible by multiple agents.

The `stateName` property ensures each state has a unique identifier.  You can also customize how the initial state is created (`getDefaultState`) or how its current value is retrieved (`getState`), and even control the process of setting or updating the state (`setState`). Finally, `middlewares` let you add custom processing steps, and `callbacks` allow you to react to specific events related to the state's lifecycle.

## Interface IStateParams

This interface defines the information needed to manage a state within the AI agent swarm. Think of it as a set of instructions and tools for keeping track of what's happening. 

It includes a unique identifier for the client using the state, a logger for recording events and troubleshooting, and a communication channel (the "bus") to allow different parts of the swarm to talk to each other. Essentially, it's all the necessary context for running and monitoring a specific state within the larger system.

## Interface IStateMiddleware

This interface lets you step in and tweak or check the state of your AI agents as they’re working. Think of it as a way to add extra layers of control or verification during the agent's operations. You can use it to ensure the state is always in a valid format or to make adjustments as needed. It’s a flexible way to customize how your agents handle their internal data.

## Interface IStateConnectionService

This interface helps us clearly define how external services connect and share data within the AI agent swarm. It's a blueprint, ensuring that the publicly accessible parts of the connection service are consistent and predictable. Think of it as a way to ensure everyone interacts with the connection service in a standardized way, keeping the internal workings separate. It helps us create a reliable and user-friendly system for sharing information between agents.

## Interface IStateChangeEvent

This interface helps you listen for changes in the overall state of the AI agent swarm. Think of it as a notification system; whenever the swarm moves to a new state (like "planning," "executing," or "waiting"), you'll get notified. You can subscribe to these notifications and react accordingly, ensuring different parts of your system are always in sync with the swarm's current activity. The `stateChanged` property is the key to receiving these updates – it’s the signal that something's changed.

## Interface IStateChangeContract

This interface helps you keep track of when the system's states change. It provides a stream of notifications whenever a state is updated, so you can build your code to respond dynamically to these changes. Think of it as a way to be informed about what's happening within the agent swarm orchestration framework. You can subscribe to this stream to receive updates about the changing states.

## Interface IStateCallbacks

This interface lets you listen in on what’s happening with your agent’s state. Think of it as a set of notification hooks. You can use these hooks to be notified when a state is first set up, when it’s cleaned up, or when it's loaded or changed. It's a way to keep track of state activity or perform actions in response to those changes, like logging updates or triggering other processes. Each hook provides information about which agent (clientId) and which specific state (stateName) the event relates to.

## Interface IState

This interface gives you the tools to manage the agent swarm's overall status during operation. You can easily check what the current state is with `getState`. When you need to update the state, use `setState`, which lets you calculate the new state based on what it was before – a helpful way to keep things consistent. Finally, `clearState` provides a simple way to reset everything back to the starting point defined in the system’s configuration.

## Interface ISharedStorageConnectionService

This interface outlines the public methods available for connecting to and interacting with shared storage. Think of it as a blueprint for how different parts of the system can talk to a shared storage location, like a cloud drive or a database. It focuses on the essential actions – establishing a connection and retrieving data – without exposing any internal workings. By using this interface, we ensure that the ways external components interact with shared storage remain consistent and predictable.

## Interface ISharedStateConnectionService

This interface helps define how different parts of the AI agent swarm can share information safely. Think of it as a blueprint for a service that manages connections and makes sure only the necessary data is exposed publicly. It’s designed to keep the internal workings separate from what the outside world can see, making the system more secure and easier to understand. Essentially, it’s a way to create a well-defined public interface for shared state.

## Interface ISharedComputeConnectionService

This interface helps your AI agents connect to and utilize shared computing resources, like a pool of virtual machines or specialized hardware. Think of it as a standardized way for your agents to access the power they need to run complex tasks, regardless of the underlying infrastructure. It builds upon the base `SharedComputeConnectionService`, ensuring consistent behavior and type safety across your agent swarm.

## Interface ISessionSchema

This interface, `ISessionSchema`, acts as a blueprint for how session data will be structured in the future. Right now, it doesn't contain any specific properties, but it's reserved to hold details about session configurations as the framework develops. Think of it as a promise of session-specific settings to come.

## Interface ISessionParams

This interface outlines all the necessary information to set up a new session within your AI agent swarm. Think of it as the blueprint for launching a coordinated effort among your agents. 

It requires a unique identifier for the client initiating the session, a way to track what's happening (logging), rules to guide the session's behavior (policy), a communication channel for the agents to talk to each other (bus), and the core swarm management system itself.  Finally, it needs the name of the specific swarm being used, ensuring everything is properly linked and organized.

## Interface ISessionContext

This interface describes the information available during a session within the AI agent swarm. Think of it as a container holding details about who's using the system (the client), what they're trying to do (the method), and how things are running (the execution). 

It includes a unique ID for the client's session and for the swarm process itself. 

You’ll also find information about the specific method being called, along with data about the current execution stage. Both method and execution information can be missing if they aren't currently relevant.

## Interface ISessionConnectionService

This interface helps ensure that the public-facing parts of your session connection service are clearly defined and consistent. Think of it as a blueprint for how the outside world interacts with your session connections, stripping away any internal workings that aren't meant to be exposed. It's used to create a type-safe version of your session connection service specifically for public use, guaranteeing a predictable and reliable interface.

## Interface ISessionConfig

This interface helps you define how long a group of AI agents will work together on a task, or how frequently they’re allowed to run. You can specify a `delay` to control the timing – for example, setting a delay between sessions to prevent overwhelming resources. 

Additionally, you have the option of providing an `onDispose` function. This allows you to specify a specific action that should be taken when the session ends, like releasing memory or closing connections, ensuring a clean and orderly shutdown.

## Interface ISession

The `ISession` interface provides the core functionality for managing interactions within an AI agent swarm. It allows you to send messages, trigger actions, and control the flow of a conversation or task.

You can use methods like `commitUserMessage` and `commitAssistantMessage` to add messages to the session history, essentially recording the conversation. `commitSystemMessage` and `commitDeveloperMessage` are for adding messages that aren’t direct user or agent responses, likely for internal logging or control.

If you need to run a quick calculation or preview something without impacting the session's memory, use `run`. For more standard execution within the session’s context, use `execute`. 

`connect` enables a two-way communication link, and tools can be managed using `commitToolRequest` and `commitToolOutput`.  `commitFlush` allows you to completely reset the session’s history, effectively starting fresh. Finally, `notify` allows you to send messages to external listeners, and `commitStopTools` stops the next tool from running.

## Interface IScopeOptions

This interface, IScopeOptions, helps you configure how a specific task or set of actions are executed within the AI agent swarm. You'll use it to specify a unique client ID, which acts like a session identifier for tracking purposes.  It also lets you define which swarm, or group of agents, should handle the work by setting the swarm name. Finally, you can provide a function to be called if something goes wrong during the process, allowing you to handle errors in a tailored way.

## Interface ISchemaContext

This object acts as a central hub for all the schema definitions used by your AI agent swarm. Think of it as a library containing blueprints for how agents communicate and work together. It organizes different kinds of schemas—like agent descriptions or message formats—into separate registries, making it easy to find and manage them. You'll use this to access and interact with the various schema services that define your swarm's behavior.

## Interface IPolicySchema

This interface describes the structure for defining policies within the AI agent swarm. A policy essentially dictates how the swarm handles and restricts connections – it determines what's allowed and what's blocked.

You can configure a policy with a unique name and an optional description for clarity.  Policies can be set up to automatically ban clients upon validation failure, or to use a custom message when a ban is applied.

To give you even more control, you can provide functions to retrieve custom ban messages, manage the list of banned clients, and define your own logic for validating incoming and outgoing messages.  A persistence flag lets you save banned clients so they remain blocked even after a system restart. Finally, callbacks provide a way to hook into specific policy events for highly customized actions.

## Interface IPolicyParams

This interface defines the information needed to set up a policy within the AI agent swarm. Think of it as a blueprint that tells the system how the policy should behave and how it should interact with the rest of the swarm. 

It includes a way to connect a logger, which is essential for tracking what the policy is doing and catching any problems. 

It also allows the policy to communicate with other agents in the swarm using a messaging bus.

## Interface IPolicyConnectionService

This interface helps us define how different parts of the system connect and communicate based on established policies. Think of it as a blueprint for ensuring that connections between components are managed according to specific rules. It's designed to be a clear, public-facing definition, stripping away internal details to focus on how external services should interact. It acts as a foundation for creating services that handle policy-driven connections in a predictable and consistent way.

## Interface IPolicyCallbacks

This interface allows you to hook into different stages of a policy's lifecycle, giving you a way to react to important events. You can use the `onInit` callback to perform setup tasks when a policy is first created. The `onValidateInput` and `onValidateOutput` callbacks let you monitor and log what data is being accepted and sent, respectively, helping you keep an eye on the policy's behavior. Finally, the `onBanClient` and `onUnbanClient` callbacks notify you when a client is restricted or allowed to participate, enabling you to manage client access and track bans.

## Interface IPolicy

This interface defines how your AI agent swarm enforces rules and manages client access. It allows you to check if a client is banned, retrieve the reason for a ban, and validate both incoming and outgoing messages to ensure they meet your defined policies. You can also use it to actively ban or unban clients from participating in the swarm. Essentially, it's the gatekeeper for your agent swarm, controlling who can join and how they communicate.

## Interface IPipelineSchema

This interface outlines the structure for defining a pipeline within our AI agent orchestration framework. Each pipeline needs a unique name to identify it.

The core of a pipeline is the `execute` function, which dictates the steps the agents will take and receives a client identifier, the agent's name, and relevant data to work with. 

Finally, you can add optional callback functions to the pipeline. These callbacks allow you to observe the pipeline’s progress, respond to errors gracefully, and fine-tune its behavior as needed.

## Interface IPipelineCallbacks

This interface lets you hook into the key moments of a pipeline’s life – when it begins, when it finishes, and if anything goes wrong. You can use these callbacks to monitor your pipelines, log their progress, or react to errors in real-time. Essentially, it gives you a way to be notified about what's happening with each pipeline run. The `onStart` callback tells you when a pipeline is beginning, `onEnd` informs you when it’s complete (whether successful or not), and `onError` lets you know immediately if any errors pop up during the process.

## Interface IPersistSwarmControl

This framework lets you tailor how your AI agent swarm's data is saved and loaded. Specifically, you can swap out the default methods for handling active agent information and the navigation stacks they use. This is useful if you need to store this data in a particular way, like using a database instead of a simple file, or if you want to keep it entirely in memory. You do this by providing your own "persistence adapters" – custom code that handles the saving and loading process.

## Interface IPersistStorageData

This interface describes how data is saved and retrieved for the AI agent swarm. Think of it as a container holding a list of information – like key-value pairs or detailed records – that needs to be stored somewhere. It's designed to work with tools that handle saving and loading this data, ensuring the swarm remembers important information. The `data` property simply holds the actual list of data items to be persisted.

## Interface IPersistStorageControl

This interface lets you plug in your own way of saving and loading data for a specific storage area. Think of it as swapping out the default way data is stored with your own custom solution. You can use this to connect your storage to a database, a different file format, or any other persistence mechanism you need. It's designed to give you fine-grained control over how your agent swarm's data is handled.

## Interface IPersistStateData

This interface helps the system remember important information, like how agents are configured or what stage a session is in. Think of it as a container for whatever data needs to be saved. The `state` property holds the actual data – it can be anything you need it to be, based on the specific application. This allows the swarm to reliably recover and continue its work even if it's temporarily interrupted.

## Interface IPersistStateControl

This interface lets you tailor how your agent swarm's state is saved and retrieved. Think of it as a way to swap out the standard storage method with something more specific to your needs.

You can use it to plug in your own storage solution, perhaps connecting to a database instead of relying on the default persistence mechanism. This gives you fine-grained control over where and how the agent swarm remembers things.

## Interface IPersistPolicyData

This interface outlines how the system stores information about clients that are restricted within a particular swarm. It essentially acts as a record of which session IDs – essentially unique identifiers for client connections – are currently blocked within a specific swarm environment. Think of it as a blacklist for clients participating in the swarm. The core of this record is a list of those banned session IDs.

## Interface IPersistPolicyControl

This interface lets you swap out how policy data is saved and retrieved for a specific swarm. Think of it as a way to plug in your own system for managing those policies, whether you need to store them in a database, a file, or even just keep them in memory temporarily. By providing your own persistence adapter, you can tailor the way the swarm handles policy data to fit your specific needs.

## Interface IPersistNavigationStackData

This interface describes how navigation data – specifically, the history of which agents a user has interacted with – is saved and restored. It's used to keep track of the order in which agents were used within a session, allowing users to easily return to previous agents. The `agentStack` property holds an array of agent names, representing the sequence of agents accessed. Think of it like a 'back' button for your agent interactions.

## Interface IPersistMemoryData

This interface helps us store and retrieve memory information used by our AI agents. Think of it as a container that holds the data – like session details or temporary calculations – that agents need to remember. The `data` property within this container holds the actual information being saved, and it can be any type of data relevant to the agent's work. This allows the system to keep track of important details across different interactions and agent actions.

## Interface IPersistMemoryControl

This interface lets you customize how memory data is saved and loaded, particularly for specific sessions identified by a `SessionId`. Think of it as a way to plug in your own storage mechanism, like a database or even just keeping things in memory, instead of using the framework’s default persistence method. You can use this to tailor the memory handling to your application’s needs, whether it's for testing, specialized data storage, or simply avoiding writing to a persistent store. By providing your own persistence adapter, you effectively replace the standard way the framework handles saving and retrieving memory.

## Interface IPersistEmbeddingData

This interface describes how data related to embedding vectors is stored for later use. Think of it as a container for holding a numerical representation of a piece of text or information, linked to a specific identifier. The `embeddings` property holds the actual numbers that make up that numerical representation, allowing the system to compare and relate different pieces of information based on their similarity.

## Interface IPersistEmbeddingControl

This interface lets you fine-tune how embedding data is saved and retrieved. Think of it as a way to swap out the default storage mechanism for embeddings with your own custom solution. You can use it to create specialized storage, like keeping embeddings in memory instead of a database, which can be helpful for testing or specific performance needs. By providing your own adapter, you have complete control over where and how this data is handled.

## Interface IPersistBase

This interface provides the foundation for saving and retrieving data within the agent swarm. It allows the system to store information like agent states or memory as JSON files.

The `waitForInit` method sets up the storage area, making sure it exists and cleaning up any potentially corrupted data. `readValue` lets you fetch a specific piece of data using its ID, while `hasValue` provides a quick check to see if a piece of data even exists before trying to load it. Finally, `writeValue` handles saving data to the storage, making sure the process is reliable and keeps your data safe.

## Interface IPersistAliveData

This interface helps the system keep track of whether each client is currently active. It's used to mark a client as online or offline within a specific swarm, essentially providing a simple way to know if a client is still connected and participating. The key piece of information it stores is a boolean value, telling you whether the client is currently online.

## Interface IPersistAliveControl

This interface lets you customize how the system remembers if an AI agent is still active. 

Essentially, it allows you to plug in your own way of saving and retrieving this "alive" status. 

You can use this to store the alive status in a database, a file, or even just keep it in memory - whatever best suits your specific needs. This is especially useful if you need something beyond the default behavior.

## Interface IPersistActiveAgentData

This interface describes how we keep track of which agent is currently running for each client within a swarm. Think of it as a simple record showing which agent is "on" for a particular client in a specific swarm. It's used to help the system remember the active agent, so we don't lose track of it. The key piece of information is the `agentName`, which is just a name identifying that active agent.

## Interface IPerformanceRecord

This interface helps track how well a specific process is running within the system. It gathers performance data from all the clients involved, like individual sessions or agent instances, to give a comprehensive view of its efficiency.

You're essentially collecting metrics like the total number of times a process ran, how long each execution took, and when it happened. The `processId` identifies which process the data belongs to. Inside, you'll find details about each client's performance, as well as overall numbers like total execution count and response times. Timestamps are included for accurate logging and tracking. This information is useful for identifying bottlenecks and optimizing the system's overall performance.

## Interface IPayloadContext

This interface, `IPayloadContext`, helps organize information related to tasks being handled by the AI agent swarm. Think of it as a container holding two key pieces of data: a `clientId` which identifies who or what requested the task, and the `payload` itself – the actual data the agents need to work with. This structure helps keep track of where tasks come from and what they involve.

## Interface IOutlineValidationFn

This interface defines a function used to check if an outline operation is set up correctly. Think of it as a quality check for the steps in a larger process. The function receives the initial input and the data being processed, allowing it to verify that everything lines up as expected before proceeding. It's a key piece for ensuring the stability and reliability of the overall workflow.

## Interface IOutlineValidationArgs

This interface helps validation functions work with the information they need. Think of it as a way to pass both the original input and the processed data alongside each other. 

The `data` property holds the results of an outline operation—essentially, the information being validated, often in a structured format. It’s the core information the validation process is checking.

## Interface IOutlineValidation

This interface helps you define how to check if an outline is correct, especially when working with AI agents that need to build something step-by-step. It lets you specify a function that does the actual validation – essentially, a rule to make sure the outline makes sense. You can also add a short description to explain what this validation rule is for, making it easier for others (or your future self) to understand how it works. Think of it as setting up checks and explanations for each step in a larger process.

## Interface IOutlineSchemaFormat

This interface describes how to define a format for your outlines using a standard JSON schema. Think of it as a way to precisely describe the structure of your outline data, ensuring it conforms to specific rules. The `type` property simply identifies the format as being a "json_schema," while the `json_schema` property holds the actual JSON schema object that defines the outline's structure and validation requirements. It's used when you want to enforce a strict, schema-driven approach to your outline data.

## Interface IOutlineSchema

This interface, `IOutlineSchema`, describes how to set up a specific task within our AI agent swarm – think of it as defining a recipe for a particular operation. It tells the system what prompt to use, what instructions to give the AI model (the "system" prompt), and how to handle the generated results.

You can provide a simple, fixed prompt, or create prompts dynamically based on the outline's name.  Similarly, the system instructions can be preset or generated on the fly.  The `format` property is crucial – it defines the expected structure of the AI's output so we know what to expect and can validate it.

We're also able to include documentation descriptions to explain what the outline does.  There's a way to set a maximum number of tries for the operation, and you can even hook into different parts of the process with optional callbacks.  Finally, a function called `getOutlineHistory` handles the specific steps to generate data based on input and past results.

## Interface IOutlineResult

The `IOutlineResult` interface holds all the information you get back after running an outline operation – think of it as a report card for that run. It tells you if the outline was successful (`isValid`), gives it a unique ID (`resultId`) for easy tracking, and keeps a record of what happened during the process in the `history` section, detailing any user inputs, assistant responses, or system messages.

If something goes wrong, you'll find an explanation in the `error` field.  You can also see what initial instructions were given (`param`) and what data was ultimately generated (`data`). Finally, `attempt` indicates how many times the outline process has been tried.

## Interface IOutlineObjectFormat

This interface describes the expected structure for outline data used within the framework. Think of it as a blueprint ensuring everyone is using the same format. It clearly defines the main type of data, like whether it’s a JSON object or a simple object. 

You'll also find a list of necessary fields that absolutely must be present. Finally, it details each individual field, outlining its data type and providing a description to make understanding its purpose straightforward.

## Interface IOutlineMessage

This interface defines the structure of messages used within the outline system, which helps organize and track interactions like those between a user, an assistant, or the system itself. Think of it as a template for how messages are recorded and managed within the framework. It ensures that each message has consistent information, making it easier to understand the flow of a conversation or process.

## Interface IOutlineHistory

This interface lets you keep track of the messages generated during outline creation or modification. You can think of it as a log of how the outline evolved. 

The `push` method is how you add new messages to the log – you can add one message at a time, or a whole bunch at once. Need to start fresh? The `clear` method wipes the entire history. Finally, `list` lets you see all the messages that are currently in the history.

## Interface IOutlineFormat

This interface defines the expected structure for outline data used within the system. Think of it as a blueprint that ensures everyone is using the same format when creating or modifying outline information. It specifies the data type for each field, lists which fields are mandatory, and provides descriptions to clarify their purpose. Essentially, it promotes consistency and clarity when working with outline data.

## Interface IOutlineCompletionArgs

This interface defines what information is needed when requesting a completion that produces a structured JSON outline. Think of it as telling the system *exactly* what shape the JSON data should take. You'll provide a name for the outline schema – essentially, a label that identifies the specific structure – and you’ll also specify the format itself, which gives more detailed instructions on how the completion should be organized. Providing both the outline name and format ensures the AI generates output that fits a predictable and usable JSON format.

## Interface IOutlineCallbacks

This interface lets you connect to important moments in the outline creation process. You can set up functions to be notified when a new attempt to create an outline begins, whenever a document is successfully generated, or when a document passes or fails validation. These notifications allow you to monitor progress, log information, or even implement retry logic based on validation results. Think of them as event listeners for your outline creation workflow.

## Interface IOutlineArgs

This interface defines the information needed when performing an outline task. Think of it as a package of data containing the actual input you want outlined, a counter to track how many times you've tried, and a record of what’s happened so far. It also includes the expected output format and a way to access the conversation history, which can be helpful for understanding the context. Essentially, it's all the necessary pieces to get an outline operation running smoothly.

## Interface IOutgoingMessage

This interface describes a message that the swarm system sends out to a client, like an agent's reply or a notification. Think of it as the system's way of communicating back to the agent that requested something or is actively participating.

Each outgoing message has a `clientId`, which is a unique identifier that specifies which client should receive the message – ensuring it gets to the right agent. There’s also `data`, which is the actual content of the message – the information being sent. Finally, `agentName` tells you which agent within the swarm created the message, providing context about its origin.

## Interface IOperatorSchema

This function lets you connect an operator dashboard to your agent swarm. Think of it as a way to pipe conversations happening between agents and users to a screen where a human operator can see and potentially intervene. You provide a client ID and the name of the agent, and then the function gives you a tool to send messages and receive responses – it's how the operator dashboard gets its information. The provided function also handles cleanup when the connection is no longer needed.

## Interface IOperatorParams

This interface, `IOperatorParams`, defines the essential tools and information needed for an agent to operate within the swarm. Think of it as a package containing everything an agent needs to function correctly. It includes details about the agent's name, a client identifier, logging capabilities, a communication bus for interacting with other agents, and a history service to keep track of conversations. The history service is particularly useful for remembering past interactions and providing context for new ones.

## Interface IOperatorInstanceCallbacks

This interface lets you listen for important events happening within an individual agent within your swarm. Think of it as a way to be notified about what's going on with each agent.

You can get notified when an agent starts up (onInit), when it provides an answer (onAnswer), when it receives a message (onMessage), when it shuts down (onDispose), or when it sends out a notification (onNotify). Each of these events includes information like the client ID, the agent's name, and the content of the answer or message. This lets you build custom logic to react to specific agent behaviors.

## Interface IOperatorInstance

This interface defines how you interact with a single agent within a larger swarm. Think of it as a way to talk to one agent and tell it what to do.

You can use `init` to get the agent ready to work, and `dispose` when you're finished with it.  `connectAnswer` lets you set up a listener to receive answers from the agent.  To send an answer back, use the `answer` method.  The `notify` method is for sending general notifications, while `recieveMessage` handles receiving messages. Essentially, this interface provides the basic building blocks to control and communicate with an individual agent in your swarm.

## Interface IOperatorControl

This interface, `IOperatorControl`, allows you to customize how an operator within the AI agent swarm functions. You can essentially plug in your own logic to control its behavior.

First, `useOperatorCallbacks` lets you define specific actions the operator should take in response to certain events – think of it as setting up event listeners for the operator.

Then, `useOperatorAdapter` provides a way to completely replace the default operator with one you’ve built yourself, giving you even greater control over its internal workings.

## Interface INavigateToTriageParams

This interface lets you fine-tune how your AI agent swarm handles transitions to a triage agent. You can use it to inject custom messages or actions at various points in the navigation process. 

Before moving to the triage agent, you can run a `beforeNavigate` function to perform checks or setup. The `lastMessage` function allows you to modify the previous user message to provide more context.

If the navigation fails, a `flushMessage` can be sent to reset the session. When no navigation is needed, the `executeMessage` function can be used to continue with the current agent.

Finally, `toolOutputAccept` provides feedback when navigation is successful, while `toolOutputReject` explains to the user why navigation wasn't necessary.

## Interface INavigateToAgentParams

This interface helps you control how your AI agents move between tasks or agents. It lets you customize what happens before, during, and after an agent navigates to a new one. 

You can define custom messages or functions to handle situations where navigation fails and the session needs to be cleared, or to provide feedback to the model about the navigation process. You also have control over how the last user message is incorporated into the navigation context and what message is sent to the new agent when navigation happens, whether it involves executing a specific action or just sending a message. Ultimately, this interface offers a way to fine-tune the agent’s navigation behavior and ensure it responds appropriately in different scenarios.

## Interface IModelMessage

This interface, `IModelMessage`, acts as the fundamental building block for communication within the AI agent swarm system. Think of it as the standard format for any message exchanged – whether it’s from a user, an agent, a tool, or the system itself.

Each message has a `role`, which clarifies who or what sent it (like a user, an assistant AI, or a tool).  It also includes an `agentName` to track which agent is involved, and of course, the actual `content` of the message.

The `mode` property indicates whether the message originates from user input or a tool's action.  If a model requests a tool to be used, `tool_calls` will contain the details of that request.  `images` holds any images associated with the message, and `tool_call_id` links tool outputs back to their original requests. Finally, `payload` allows for the inclusion of additional, custom data.  Essentially, `IModelMessage` provides a structured way to manage and understand all interactions within the agent swarm.

## Interface IMethodContext

This interface, `IMethodContext`, provides a standardized way to track details about each method call within the AI agent swarm. It acts as a container for essential information like the client session ID, the name of the method being executed, and the specific agents, swarms, storage, state, compute, policy, and MCP resources involved. This contextual data is used across different services – from performance monitoring to logging and documentation – to provide a comprehensive understanding of how the system is operating and to link actions to their underlying resources. Think of it as a consistent label attached to each method call, allowing different parts of the system to understand and react to it.

## Interface IMetaNode

This interface, `IMetaNode`, describes the basic building block for organizing information about your AI agents and their connections. Think of it as a way to represent a node in a family tree or organizational chart. Each node has a `name` – this could be the agent's name itself, or a label describing a resource it uses. It can also have `child` nodes, which are like branches extending from the main node, showing how agents depend on each other or use specific resources. These nodes are used to create a structured view of your agent swarm, making it easier to understand their relationships and dependencies.

## Interface IMCPToolCallDto

This interface defines the structure of information passed around when an AI agent requests a tool to be used. It packages details like which tool is being requested, who's making the request (the client and agent), what parameters the tool needs, and whether it’s part of a larger sequence of actions.  You’ll see fields for a unique tool ID, the client identifier, the agent’s name, the tool's name, and the data needed for the tool itself. The `abortSignal` property lets you cancel the tool call if needed, and `isLast` indicates if it's the final action in a series. It also includes a list of other related tool calls.

## Interface IMCPTool

This interface outlines the structure for a tool used within an AI agent swarm. Each tool needs a descriptive name so agents can recognize it. You can also add a description to give agents more context about what the tool does. Crucially, the `inputSchema` defines exactly what kind of data the tool expects as input—think of it as a contract ensuring agents provide the right information. It specifies the data types and required fields, making sure the tool receives the correct information to function properly.

## Interface IMCPSchema

This interface describes the blueprint for a core component in our agent swarm system – the MCP, or Mission Control Process. Think of it as defining how a particular task or agent manages its operations. 

Each MCP has a unique name and can optionally include a description to explain its purpose. 

The MCP defines how it interacts with its environment by providing a way to list available tools for a client and a way to actually *use* those tools, passing in the necessary data. 

Finally, it can be configured with optional callback functions to be notified about important events in its lifecycle.

## Interface IMCPParams

This interface, `IMCPParams`, defines the core information needed to run a Managed Compute Process (MCP). Think of it as a container for essential tools and connections. It includes a `logger` so you can track what's happening during the MCP's execution, and a `bus` which facilitates communication and event handling, allowing different parts of the system to interact. Essentially, it ensures your MCP has the necessary logging and communication infrastructure in place.

## Interface IMCPConnectionService

This service handles the connection management for your AI agent swarm. Think of it as the central hub that ensures agents can talk to each other and to the overall orchestration system. It's responsible for establishing, maintaining, and closing communication channels, ensuring reliable message passing between agents. You'll primarily use this to manage how agents connect and interact within the swarm. The interface provides methods for creating connections, checking their status, and gracefully closing them when needed.

## Interface IMCPCallbacks

This interface defines the functions your application can use to react to different events happening within the agent swarm orchestration system. Think of these as hooks that let you listen in on what's going on.

You’ll get a notification when the system starts up (`onInit`), when a client’s resources are cleaned up (`onDispose`), and when tools are loaded for a client (`onFetch`).

`onList` lets you respond to requests to see a list of available tools, and `onCall` signals that a tool has been used – it gives you details about which tool was used and how. Finally, `onUpdate` alerts you when the available tools change for a particular client.

## Interface IMCP

This interface lets you manage the tools available to your AI agents. You can use it to see what tools are available for a particular agent, check if a specific tool exists, and actually run those tools with provided data. There's also functionality to refresh the tool lists, either globally or for a single agent, ensuring your agents always have access to the most up-to-date tool options. Essentially, it's the central place to control and interact with the tools your agents can use.


## Interface IMakeDisposeParams

This interface defines the information you can provide when setting up an automated disposal process for an AI agent session. 

You specify a `timeoutSeconds` value to determine how long the session should run before being automatically cleaned up.

Optionally, you can include an `onDestroy` callback function. This function gets called when the session is successfully shut down, allowing you to perform any necessary cleanup actions or notifications, and it provides the client ID and swarm name for context.

## Interface IMakeConnectionConfig

This interface helps you control how often messages are sent from your AI agent swarm. It’s all about timing. The `delay` property lets you specify a waiting period, in milliseconds, before the next message is sent. This is useful for preventing your agents from overwhelming systems or for ensuring a more measured pace of communication.

## Interface ILoggerInstanceCallbacks

This interface lets you plug your own code into a logger's lifecycle. Think of it as a way to listen in on what the logger is doing and react accordingly. 

You can define functions to be called when a logger starts up (onInit), shuts down (onDispose), or when different types of log messages are generated (onLog, onDebug, onInfo). This allows you to perform custom actions, like sending logs to a central monitoring system or adjusting behavior based on the log level. Each callback receives a client identifier and the log topic, giving you context for the logged event.

## Interface ILoggerInstance

This interface defines how a logger should behave within the AI agent swarm system, especially concerning when it's ready to be used and when it needs to be shut down. It allows loggers to be properly set up and cleaned up, which is crucial for managing resources effectively when dealing with different clients. The `waitForInit` method ensures a logger is fully prepared before it starts logging, possibly involving asynchronous tasks. Similarly, `dispose` provides a way to gracefully release resources and perform final cleanup actions when a logger is no longer needed.

## Interface ILoggerControl

This interface gives you control over how logging works within your AI agent swarm. You can set up a central logging system using `useCommonAdapter`, customize how logger instances are created with `useClientAdapter`, and define callbacks to manage their lifecycle with `useClientCallbacks`. 

Need to log information specifically for a client? `logClient`, `infoClient`, and `debugClient` are your go-to methods; they automatically handle session checks and keep track of where the log originated. Essentially, this interface lets you tailor the logging behavior to fit your application's precise needs.

## Interface ILoggerAdapter

This interface outlines how different parts of the system can talk to logging tools. It allows you to send log messages – whether they're regular logs, debug information, or informational updates – specifically tied to a particular client. The system handles making sure the logging is properly set up before sending anything, and provides a way to clean up and release the logging resources associated with a client when they're no longer needed. Think of it as a standardized way to communicate logging requests to the underlying system, allowing for flexible integrations with different logging platforms.

## Interface ILogger

This interface defines how different parts of the system – like the agents themselves, the sessions they participate in, and the storage that holds data – can record events and information. Think of it as a way to keep a detailed record of what's happening.

You can use it to log general messages about significant events, or more detailed debug information to help diagnose problems. It also lets you record informational updates to get a general overview of the system's activity. The logging system is crucial for tracking what's happening, troubleshooting issues, and monitoring performance.

## Interface IIncomingMessage

This interface describes a message that’s coming into the AI agent swarm system. Think of it as a way to pass information from the outside world—like a user’s request—to the agents within the system. 

Each message has a `clientId`, which identifies the specific client that sent it, like a unique user session. The `data` property holds the actual content of the message, such as the user's question or command. Finally, `agentName` specifies which agent is responsible for handling the message, helping to route it to the right place for processing.

## Interface IHistorySchema

This interface, `IHistorySchema`, outlines how your agent swarm keeps track of past conversations and data. Think of it as the blueprint for the system's memory. 

The core of this schema is the `items` property. This `IHistoryAdapter` is the crucial component that actually handles saving and loading the history of messages – it's the part that deals with where and how that data is stored.

## Interface IHistoryParams

This interface defines the information needed to set up a record of an AI agent’s activity. Think of it as a blueprint for creating a history log for each agent. 

It includes details like the agent’s unique name, how much of the agent's past messages to keep for context, a client identifier, a logger to track what's happening, and a communication channel (bus) to share information within the overall system. Essentially, it structures the data necessary for managing and understanding how each agent operates within the swarm.

## Interface IHistoryInstanceCallbacks

This interface defines a set of functions you can use to customize how agent history is managed. You can use `getSystemPrompt` to dynamically adjust the instructions given to an agent. `filterCondition` allows you to decide which messages should be saved in the history. `getData` provides the initial set of messages for an agent’s history. 

Several callback functions let you react to changes in the history: `onChange` is triggered when the history array itself is modified, while `onPush` and `onPop` are specific to adding and removing messages respectively.  `onRead` gets called as each message is processed, and `onReadBegin` and `onReadEnd` mark the start and finish of that processing. Finally, `onDispose` is called when the history is no longer needed, and `onInit` signals the history is ready. The `onRef` function gives you direct access to the history instance itself.

## Interface IHistoryInstance

This interface helps manage the history of interactions for each agent in your swarm. Think of it as a logbook for each agent, recording what they’re doing and saying.

You can use `iterate` to look through past messages for a specific agent, letting you review their actions over time. `waitForInit` sets things up initially, possibly loading any existing data for an agent’s history.

`push` adds a new event or message to an agent’s log, keeping track of their current state. If you need to retrieve the most recent interaction, `pop` removes and returns the last message. Finally, `dispose` cleans up the history for an agent when it's no longer needed, providing a way to release resources.

## Interface IHistoryControl

This interface lets you fine-tune how your AI agents remember and track their past actions and decisions. 

You can tell the system what events or actions should be recorded and how they should be handled using lifecycle callbacks. Essentially, you're customizing the "memory" of your agents.

Also, if you need a very specific way to create history records, you can provide your own custom "blueprint" (a constructor) for how those history objects are built.

## Interface IHistoryConnectionService

This interface outlines how to manage and access the history of interactions within the AI agent swarm. It’s designed to be a clear, public-facing definition, ensuring consistency and predictable behavior when dealing with the system’s historical data. Think of it as the blueprint for how external components interact with the swarm’s memory of past actions and decisions. It separates the publicly accessible features from the internal workings of the history management system.

## Interface IHistoryAdapter

This interface lets your application manage a record of interactions between agents – think of it as a logbook for your AI swarm. 

You can use it to add new messages to the log with `push`, retrieve and remove the most recent message with `pop`, and clean up the history when it's no longer needed using `dispose`. 

If you need to review past interactions, the `iterate` method allows you to step through the messages in order for a specific agent and client. Essentially, it provides a way to remember and revisit what happened during your AI swarm's operations.

## Interface IHistory

This interface keeps track of all the messages exchanged with AI agents or used directly. You can add new messages to the history using the `push` method, and retrieve the most recent message with `pop`. 

Need to format the history for a particular agent? The `toArrayForAgent` method lets you get a specially prepared list of messages, customized for the agent’s context using a prompt and system messages. Alternatively, `toArrayForRaw` gives you the complete, unfiltered history of messages.

## Interface IGlobalConfig

This file defines global configuration settings used throughout the AI agent swarm system. Think of it as a central control panel, allowing you to adjust how the system behaves.

It covers various aspects, including how the system handles tool calls that fail (using strategies like "flush" to reset or "recomplete" to retry), how it manages message history, and how it processes agent outputs. You can customize this system by modifying these settings, for example, to change the way error messages are displayed or to limit the number of tools an agent can use.

Here's a breakdown of what's controlled:

*   **Error Handling:** Strategies for dealing with problems during tool calls, like resetting the conversation or attempting a fix.
*   **Message History:** Limits on how many past messages are stored.
*   **Tool Usage:** Restrictions on the number of tools an agent can call.
*   **Logging:** Control over the level of detail in system logs (debug, info, etc.).
*   **Agent Behavior:** Customization of how agents process and transform their outputs, including removing unwanted tags.
*   **Persistence:**  Settings for how data is stored and retrieved, including agent states and tool call information.
*   **Security:**  Options for handling banned clients and preventing recursive agent changes.
*   **Operator Connections:**  Default settings for connecting operators to agents for message handling.
*   **Caching**: Enable or disable caching for embeddings, for better performance in local ollama environment

## Interface IFetchInfoToolParams

This interface defines how to set up a tool that can retrieve information – think of it as a "read-only" tool for your AI agents. You provide a name for the tool, and then describe what the function does, including the expected input parameters. 

You can also add extra details like a documentation note to help the AI understand the tool’s purpose.  

To give you more control, you can specify a function to decide when the tool is actually usable, and another to validate the input before the tool runs. These optional functions help ensure the tool is used appropriately and safely within your agent ecosystem.

## Interface IFetchInfoParams

This interface helps you define how data is retrieved for your AI agents. Think of it as the instruction manual for getting the information an agent needs to do its job. 

You’ll specify a main function, `fetchContent`, which is responsible for actually pulling the data.  If something goes wrong during that retrieval, you can provide a `fallback` function to handle the error gracefully. 

Finally, if the `fetchContent` function returns nothing, an optional `emptyContent` function allows you to craft a helpful message for the agent to use as output. This lets you guide the agent even when the primary data source is empty.

## Interface IExecutionContext

This interface, `IExecutionContext`, acts like a shared notebook for different parts of the system when they're working on a specific task. It holds essential information like a unique ID for the user session (`clientId`), a unique ID for the current task being performed (`executionId`), and a unique ID for the overall process (`processId`). Think of it as a way to consistently track and link everything happening during an execution, so services like the client interface, performance monitoring, and message handling can all work together seamlessly.

## Interface IEntity

This interface, `IEntity`, serves as the foundation for all the data objects that are stored and managed within the swarm. Think of it as a common blueprint—every piece of information the swarm keeps track of inherits from it. Specific types of entities, like those dealing with alive status or state information, build upon this base to add their own details.

## Interface IEmbeddingSchema

This interface lets you configure how your AI agents understand and compare information within the swarm. You can specify a unique name for your embedding method, and control whether its data is saved for later use. The interface also provides functions to store and retrieve pre-calculated embeddings, speeding up processes like searching and ranking. You can even customize how embeddings are created and compared by adding your own callback functions. The `createEmbedding` function lets you generate embeddings from text, and `calculateSimilarity` helps determine how close two embeddings are to each other.

## Interface IEmbeddingCallbacks

This interface lets you tap into what's happening during the creation and comparison of embeddings, which are numerical representations of text. You can use the `onCreate` callback to monitor when a new embedding is generated, allowing you to log details or perform actions afterward. Similarly, the `onCompare` callback gives you a chance to track and analyze how embeddings are being compared to determine their similarity. This provides flexibility to customize the embedding process and gain insights into its behavior.

## Interface ICustomEvent

This interface lets you create and send events with unique, custom data within the system. Think of it as a way to communicate information beyond the standard event types. It builds on a basic event structure, but instead of fitting into a predefined shape, it lets you attach any kind of data you need through a property called `payload`. This is useful for situations where you want to share specific, non-standard information between agents. For instance, you could use it to signal a specific task completion with custom details.

## Interface IConfig

This setting lets you control how detailed your UML diagrams are. When enabled, the diagrams will show relationships within subtrees, giving you a more comprehensive view of the agent interactions and dependencies. Disabling it simplifies the visualization, focusing on the top-level connections.

## Interface IComputeSchema

This interface, `IComputeSchema`, defines the structure for how individual computation tasks are set up within the agent swarm. Think of it as a blueprint for each piece of work the swarm needs to do.

It includes details like a descriptive name (`docDescription`), whether the computation is shared across the swarm (`shared`), and a unique identifier (`computeName`).  You can also specify how long data from the computation should be stored (`ttl`).

Crucially, it outlines how to retrieve the results of the computation (`getComputeData`), lists any other computations this one relies on (`dependsOn`), and lets you add custom code to run before or after the main task (`middlewares`). Finally, it provides a way to hook into important moments in the computation’s life, like data changes or completion (`callbacks`).


## Interface IComputeParams

This interface defines the information needed to run a compute task within the agent swarm. It includes a unique identifier for the client initiating the task (clientId), a logger for recording activity, and a communication bus to interact with the swarm. Crucially, it also specifies which state changes should trigger the compute task to run again, ensuring data is updated and reprocessed based on relevant changes. This allows the framework to react to changes in the environment and dynamically adjust computations.

## Interface IComputeMiddleware

This interface outlines the structure for components that modify or enhance the data flowing between AI agents within the swarm. Think of it as a customizable pipeline – you can use middleware to transform agent responses, add context, or even filter information before it reaches the next agent. Implementing this interface lets you inject your own logic to fine-tune how the swarm processes requests and delivers results, offering a flexible way to adapt the system to specific needs. It expects a function that receives the agent's output and returns a modified version of that output.

## Interface IComputeConnectionService

This interface provides a way to manage connections to compute resources, ensuring type safety when working with those connections in your TypeScript code. It builds upon the base `ComputeConnectionService` to offer a more reliable and predictable way to interact with your computational environment, helping you avoid common errors and build more robust applications. Think of it as a guarantee that your connection setup and management will work as expected within the larger orchestration framework.

## Interface IComputeCallbacks

This interface lets you hook into the lifecycle of a compute unit within the agent swarm. Think of it as a way to get notified about key events happening to a specific task or calculation. 

You can define functions to run when a compute unit is first initialized, when it’s being shut down, and when it’s actively performing calculations. 

There's also a notification when the compute unit's data or settings are updated – this is useful for building systems that react to changes in real-time. Essentially, it provides a way to listen in on what’s happening with individual compute tasks.

## Interface ICompute

The `ICompute` interface defines how to interact with a computation process within the agent swarm. You can trigger calculations using the `calculate` method, specifying the state name for the computation. The `update` method allows you to modify the compute process, identifying it by client and compute names. Finally, `getComputeData` provides a way to retrieve the results of the ongoing computation, giving you access to the latest computed values.

## Interface ICompletionSchema

This interface describes how a component within the AI agent swarm creates and manages its responses. 

Think of it as a blueprint for a specific way to generate text, with a unique identifier. It lets you specify things like whether the output should be formatted as JSON, provide flags to control the underlying language model, and even customize what happens after a response is generated.

The `getCompletion` method is the core of this component – it's how you actually request a new text output, providing the necessary context and information for the agent to work with.

## Interface ICompletionCallbacks

This interface lets you hook into what happens after an AI agent finishes its task. Specifically, the `onComplete` property allows you to define a function that gets called when the AI agent successfully completes its work. You can use this function to do things like record the results, process the output, or start another action based on the completion. It's a way to be notified and react to the end of an agent's execution.

## Interface ICompletionArgs

This interface defines what information is needed to ask for a completion from the AI agent swarm. Think of it as a request form - it gathers details like who's making the request (`clientId`), which agent needs to respond (`agentName`), and what outline (if any) the completion should follow (`outlineName`).  The request also includes the conversation history (`messages`) to give context, along with any tools the agent might need to use. Finally, it specifies the origin of the last message (`mode`) and provides formatting details for outline-based completions (`format`).

## Interface ICompletion

This interface defines how your AI agents can communicate and receive responses. Think of it as a standard way for agents to get answers or results from a language model. It provides all the necessary tools to ensure the model generates responses in a predictable and useful way, letting you build a reliable AI agent swarm.

## Interface ICommitActionToolParams

This interface defines the structure for setting up a special tool that lets your agents make changes to the system, like committing code or updating files. You'll provide a name for the tool, and importantly, you’ll describe what the tool *does* – including the expected input parameters, their types, and what they represent. 

You can also add a helpful note to describe the tool for other agents to understand.  

Finally, you can create a check to control when the tool is accessible, based on the client and agent involved. This lets you restrict tool usage to certain situations.

## Interface ICommitActionParams

This interface describes how to set up a handler for actions that change the system's state, like committing a change.

You can provide functions to check if the action’s data is correct with `validateParams`.  If the validation fails, you can specify a `failureMessage` that will be used. If validation passes, `executeAction` handles the actual change, and returns a result. If the `executeAction` returns nothing, `emptyContent` provides a fallback message. To confirm a successful action, `successMessage` dictates the confirmation.  Finally, `fallback` allows you to gracefully manage any unexpected errors that might occur during the process.

## Interface IClientPerfomanceRecord

This interface describes the performance data collected for a single client, like a user session or an agent instance, as part of a larger process. It gives you a breakdown of what's happening for each client individually.

Each client record contains information like a unique identifier (`clientId`), any data stored within the client’s session (`sessionMemory` and `sessionState`), and metrics on how many operations it’s performed (`executionCount`), how much data it’s processed (`executionInputTotal`, `executionOutputTotal`), and how long those operations are taking (`executionTimeTotal`, `executionTimeAverage`). The memory and state records allow you to track specific data used by the client, while the execution metrics paint a picture of its workload and efficiency. The average execution values are calculated to provide a normalized view of performance.

## Interface IChatInstanceCallbacks

This interface defines a set of callbacks that let you stay informed about what’s happening with individual AI agent chat instances within a swarm. You'll receive notifications when an instance is first set up (`onInit`), when it's finished and cleaned up (`onDispose`), and when a chat session begins (`onBeginChat`).  You’re also alerted when a message is sent by the agent (`onSendMessage`). Finally, `onCheckActivity` lets you know about the agent's activity status, including whether it’s currently active and when it last performed an action. These callbacks provide a way to monitor and react to the lifecycle and actions of each chat instance in your swarm.

## Interface IChatInstance

This interface represents a single chat session within your AI agent swarm. Think of it as a dedicated space for a conversation. 

You can start a chat using `beginChat`, and send messages to it with `sendMessage`, which will return the agent's response.  `checkLastActivity` lets you monitor if the conversation is still considered active, useful for managing resources. When you're finished, `dispose` gracefully shuts down the chat session.  If you need to know when a chat is being closed, `listenDispose` allows you to register a function that will be called when that happens.

## Interface IChatControl

This API lets you configure how your AI agent swarm interacts with chat interfaces. You can tell the framework which type of chat instance to use by providing a constructor. 

Additionally, you can customize the framework's behavior by setting callbacks—essentially, you're defining what happens when specific events occur during the chat process. This lets you react to and influence the flow of conversations.

## Interface IBusEventContext

This interface helps provide extra information about events happening within the AI agent swarm. Think of it as a way to tag events with details about which agent, swarm, storage, state, compute, or policy is involved.

When an agent is sending an event, it usually just includes its own name (agentName).  However, other parts of the system might use this interface to add more context, such as identifying the swarm the event relates to or the policy that triggered it.  Essentially, it’s a flexible way to add labels to events for better tracking and understanding of what’s happening in the system.

## Interface IBusEvent

This interface describes the format of messages sent across the system's internal communication channels. Think of it as a standardized way for different parts of the AI agent swarm to talk to each other. 

Each message includes information about where it came from (the `source`), what kind of action it represents (`type`), any data needed for the action (`input`), any results generated by the action (`output`), and some extra details about the context (`context`).  For example, an agent might send a message to signal that it has completed a task, including the results of that task and identifying which agent performed the work. The system uses these messages to keep everyone informed about what's happening and coordinate actions.

## Interface IBus

The `IBus` interface provides a way for different parts of the swarm system to communicate with each other, especially to send updates and information to specific clients. Think of it as a central messaging system.

Agents, like `ClientAgent`, use this bus to announce things happening – like when a task is finished, a message is committed, or a tool produces an output.  It’s designed to keep components independent by allowing them to send messages without needing to know exactly who’s listening.

The main method, `emit`, sends a structured event to a designated client. When an agent does something noteworthy, it packages the information into an event (containing details like the event type, origin, data, and the client ID) and sends it through the bus. The client ID ensures the message is delivered to the correct recipient.

These events are often notifications—telling the system about something that happened—and frequently include an `output` field, which can be empty if no data needs to be sent back.  The process is asynchronous, meaning the sending agent doesn’t wait for confirmation that the client received the message.




It's a crucial part of how the system keeps everyone informed and coordinated, with a focus on clear, structured messages.

## Interface IBaseMessage

This interface sets the basic structure for all messages moving around within the agent swarm. Every message, whether it's coming from an agent, a tool, or a user, will follow this template.

Each message will have a `role` to indicate who sent it – like “assistant,” “system,” or "user." There's also the main `content` which is the actual information being passed.

If a message involves a tool being used, it might include `tool_calls` listing the tool requests.  For messages with images, there’s a place to attach those as well. Finally, if a message is a response to a specific tool request, it's linked back by `tool_call_id`.

## Interface IBaseEvent

This interface lays out the fundamental structure for all events happening within the AI agent swarm system. Every event, whether it’s a standard broadcast or a custom message, needs to include information about where it came from (the `source`) and which client it’s intended for (`clientId`). Think of `source` as identifying the component sending the message, like a specific agent or bus, and `clientId` as making sure the message reaches the correct user session or agent. This basic structure allows different parts of the system to communicate reliably and consistently.

## Interface IBaseCompletionArgs

This interface defines the basic information needed when you're asking the AI agent swarm to do something, like generating text or outlining a plan. Every request needs a `clientId` to help track and manage things, and it also needs a list of `messages` – think of these as the conversation history or the context you're giving the AI to understand what you want. Specific types of requests, like generating outlines or orchestrating the swarm, will build upon this base to include additional details.

## Interface IAgentToolCallbacks

This interface defines a set of optional callbacks you can use to interact with an agent tool's lifecycle. Think of them as hooks that let you tap into what’s happening before, during, and after a tool runs.

You can use `onBeforeCall` to perform actions like logging or setting things up just before the tool gets to work. `onAfterCall` lets you do cleanup or record what happened after the tool has finished.

`onValidate` provides a way to check if the parameters you're passing to the tool are correct before it even starts running. And if something goes wrong during the tool’s execution, `onCallError` will fire, allowing you to handle the error gracefully. 

These callbacks give you fine-grained control and visibility into how your agent tools are operating.

## Interface IAgentTool

This interface defines a tool that an AI agent can use to perform tasks. Each tool has a name and a description to help users understand how to use it. 

Before a tool can be used, `isAvailable` checks if it's ready to execute, and `validate` ensures the provided input is correct. 

You can also customize a tool's behavior using optional lifecycle callbacks. The core functionality is handled by the `call` method, which executes the tool and takes into account information like the client ID, agent name, tool name, parameters, and whether it's the final action needed. The tool’s `type` is currently defined as `function`.

## Interface IAgentSchemaInternalCallbacks

This interface lets you hook into the different stages of an agent's lifecycle, providing opportunities to monitor its activity and potentially influence its behavior. You can choose to listen for events like when the agent starts running, produces output, uses a tool, encounters an error, or is reset. These callbacks provide details like the client ID, agent name, input, and specific data related to the event that occurred. This gives you a way to track what's happening with your agents and respond to different situations as needed. You can also set up notifications for when the agent is initialized, disposed, or resurrected, giving you a comprehensive view of its overall operation.

## Interface IAgentSchemaInternal

This interface defines how an agent is configured within the swarm. It lets you specify the agent's name, the prompt it uses, and what tools it can access. You can also set limits, like the maximum number of tool calls or messages to keep in context.

For more complex scenarios, you can provide functions to dynamically adjust the prompt, filter tool calls, or transform the agent's output.  There's also support for connecting the agent to an operator dashboard and defining lifecycle events that allow you to customize the agent's behavior.  The `dependsOn` property allows agents to be linked, allowing transitions between them. Finally, you can provide validations for the agent's output and callbacks for controlling different stages of its execution.

## Interface IAgentSchemaCallbacks

This interface lets you hook into different points in an agent's lifecycle, allowing you to react to what’s happening. You can choose which callbacks you want to use to observe agent behavior, like when it starts, runs without history, produces output, or when tools are used. There are also callbacks for system messages, user messages, and actions like flushing the history or resurrecting a paused agent. It allows you to build custom logic around agent execution, such as logging, monitoring, or triggering external actions based on the agent’s activities. You can also track when tool requests are made, when a tool produces its results, and when a sequence of tools has finished running.

## Interface IAgentSchema

This interface, `IAgentSchema`, defines the structure for describing an AI agent. It allows you to specify how the agent should behave and interact.

You can provide static instructions for the agent using the `system` property, which accepts a single instruction or an array of instructions. `systemStatic` is simply another way to specify the same instructions. 

For more complex scenarios, `systemDynamic` lets you define instructions that change based on the client and agent name – allowing for personalized or context-aware behavior. This property takes a function that generates the system prompts dynamically.

## Interface IAgentParams

This interface defines the settings and resources an agent needs to run. Think of it as a blueprint for configuring each agent within the swarm. 

It includes essential components like a client identifier, a logging system for tracking activity, a communication bus for interacting with other agents, and a mechanism for calling external tools.  You'll also find settings for managing agent history and generating responses. Optionally, you can provide a list of tools the agent can use, and a validation function to check the agent’s output.

## Interface IAgentNavigationParams

This interface defines the settings you use to set up how agents move between different tools or tasks. It lets you specify a tool’s name, a short explanation of what it does, and which agent it should move to. You can also add a helpful note for documentation and, importantly, provide a way to dynamically control whether the tool is even available to an agent based on things like the client or the agent's current state.

## Interface IAgentConnectionService

This interface helps ensure the public-facing parts of your agent connection service are clearly defined and consistent. Think of it as a blueprint for how others should interact with your agent connection service, excluding any internal details that aren’t relevant to them. It's designed to make sure that the part of the service everyone sees and uses matches what's expected, promoting predictability and ease of use.

## Interface IAgent

The `IAgent` interface describes how agents behave and interact within the orchestration framework. It outlines the core functions for running agents, providing input, and managing their lifecycle.

You can use the `run` method to quickly test an agent with a specific input without affecting its memory or past conversations.  The `execute` method is the main way to run an agent, potentially updating its memory based on the chosen execution mode.

The `waitForOutput` function allows you to retrieve the agent's results after it’s finished processing.

Several `commit...` methods let you manually add messages – system prompts, developer instructions, user inputs, tool outputs, and assistant responses – to the agent's history or internal state. These are useful for debugging or controlling the agent’s conversational flow.  You can also use methods like `commitStopTools`, `commitAgentChange`, and `commitCancelOutput` to directly influence the agent's ongoing operations and halt certain actions, like further tool calls. Finally, `commitFlush` provides a way to completely reset the agent's memory and start fresh.

## Interface IAdvisorSchema

This interface, `IAdvisorSchema`, defines the structure for an advisor within our AI agent swarm orchestration system. Think of it as a blueprint for how each advisor should behave and interact. 

Every advisor needs a name (`advisorName`) to identify it and an optional description (`docDescription`) to explain its purpose. 

You can also provide `callbacks` to hook into specific advisor actions, letting you customize its behavior. 

Finally, each advisor *must* have a `getChat` method—this is the function the system uses to get a textual response from the advisor based on the input message.

## Interface IAdvisorCallbacks

This interface defines a set of optional notifications your application can listen for when working with the AI agent swarm orchestration framework. If you want to be informed about ongoing chat interactions, you can provide a function for the `onChat` property, which will be called whenever a chat message is generated. Similarly, if you need to know when a particular task or query has finished processing and a result is available, you can implement the `onResult` callback, providing you with the result ID and the content. These callbacks let you react to events happening within the agent swarm without needing to constantly poll for updates.
