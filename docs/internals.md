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

This function checks that all your AI agent swarms, individual agents, and outlines are set up correctly. It's designed to be safe to run repeatedly – it won't cause any problems even if you call it multiple times, as it only validates once per execution. Think of it as a quick health check for your entire AI agent setup.

## Function startPipeline

This function lets you kick off a pre-defined workflow, or "pipeline," involving multiple AI agents. Think of it as telling the system, "Hey, I want this specific sequence of agents to work on this data." You identify the pipeline by name, specify which agent should initially handle the task, and provide any data needed for the process – that’s the payload. The function then manages the coordination between agents, ensuring they work together effectively and returns a result based on the pipeline's outcome. Essentially, it's your way of starting a complex task involving your AI agents.


## Function scope

This function lets you run code within a controlled environment, ensuring it has access to the necessary tools and services like agents and pipelines. Think of it as creating a temporary workspace for your code. You provide a function that you want to execute, and this function will be run with a specific setup. You can also customize the tools available to that function by providing options, allowing you to tweak how it interacts with other services. The function you provide will receive information about the client and the agent it’s associated with.

## Function runStatelessForce

This function lets you send a message to your AI agent swarm and have it process it immediately, without adding it to the ongoing conversation history. Think of it as a way to handle tasks like storing information or running one-off commands without cluttering the agent’s memory. 

It’s designed to be forceful; it will always execute the message, even if the agent isn’t actively available, ensuring the task gets done. You provide the message content and a client identifier to track the session. The system handles the execution details, monitors performance, and keeps track of related data behind the scenes.

## Function runStateless

This function lets you quickly send a message to one of your AI agents without adding it to the ongoing conversation history. It’s useful for tasks like processing data or storing information where you don't want the agent's responses to build up a long chat log.

You provide the message you want the agent to handle, along with a client identifier and the name of the agent you want to use. The system verifies that the agent is available and then executes the message, keeping track of performance and notifying other parts of the system. 

Essentially, it’s a way to trigger an agent’s action in isolation, ensuring a clean execution environment. If the designated agent isn't active or has been replaced, the request is skipped.


## Function overrideTool

This function lets you modify how a tool operates within the AI agent swarm. Think of it as a way to update a tool’s instructions or capabilities without affecting other parts of the system. You provide a new schema – which can be a complete replacement or just a few tweaks – and the system applies those changes to the specified tool. It's designed to be a direct and isolated change, keeping everything else working smoothly. If the system is set up to log events, you’ll see a record of this override happening.




The `toolSchema` parameter is what you'll use to define those changes—it's the blueprint for how the tool will now function.

## Function overrideSwarm

This function lets you directly change the setup of an existing swarm within the system. Think of it as updating a swarm's blueprint – you can provide a complete new design or just tweak a few details. It's designed to be a clean operation, working independently to avoid unexpected interactions with ongoing tasks. The system keeps a record of these changes if logging is turned on. You give it a schema, and it updates the corresponding swarm’s configuration.

## Function overrideStorage

This function lets you modify how your swarm stores data. Think of it as updating a blueprint for a particular storage location. You provide a new or partial schema – essentially, a set of instructions – and it applies those changes to the existing storage configuration. This change happens independently, ensuring it doesn't interfere with other processes. The system also keeps a record of this change if logging is turned on. You only need to specify what you want to change; you don't need the entire original schema.

## Function overrideState

This function lets you directly change how a state is structured within the swarm. Think of it as a way to update a state's definition, whether you're making small adjustments or completely redefining it. It operates independently, ensuring a safe and isolated update process, and will log the change if you’ve enabled logging.  You provide a partial or complete state schema, and this function applies those changes to the existing state configuration.

## Function overridePolicy

This function lets you change a policy’s settings within the swarm. Think of it as updating a rule – you provide a new or modified version of the policy’s structure, and the system applies those changes. The update happens independently, making sure it doesn't interfere with anything else that's happening.  If logging is turned on, the system will record that you're making this change. You just give it the new policy definition, and it handles the rest.

## Function overridePipeline

This function lets you modify an existing pipeline definition. Think of it as a way to make targeted changes to how your AI agents work together. You provide a partial pipeline definition – only the parts you want to change – and this function merges those changes with the original pipeline. It’s handy for experimenting with slight adjustments or tailoring pipelines for specific scenarios without rewriting the entire thing. The `Payload` type ensures that your modifications are type-safe and aligned with the data your pipeline handles.

## Function overrideOutline

This function lets you modify an existing outline schema within the agent swarm system. Think of it as updating a blueprint – you're providing a partial outline schema with the changes you want to make. To keep things predictable and avoid conflicts, it operates in a fresh, isolated environment. The system will also record these changes if logging is turned on. You pass in the updated portion of the outline schema, and the function applies those changes to the existing configuration.

## Function overrideMCP

This function lets you adjust and customize the structure of an MCP, or Model Context Protocol, which is a way for AI agents to share information. Essentially, you provide an existing MCP definition, and this function allows you to update it with new rules or modifications. It's useful when you need to fine-tune how your AI agents communicate and share data. You’re providing a base schema, and this function allows you to build upon it.


## Function overrideEmbeding

This function lets you change how the swarm system handles embeddings, the way it represents data for understanding and comparison. You can provide a completely new embedding schema or just update parts of an existing one. This change happens independently, ensuring it doesn't interfere with anything else happening in the system. The system will also keep a record of the change if logging is turned on. You just need to provide the new or updated embedding schema as input.

## Function overrideCompute

This function lets you modify an existing compute schema, essentially updating parts of its configuration. Think of it as a way to tweak a pre-defined setup without creating a completely new one. You provide a partial schema containing the changes you want to make, and it merges those changes into the original schema. It’s useful for customizing configurations based on different needs or environments.


## Function overrideCompletion

This function lets you adjust how the AI agent swarm generates responses, allowing you to customize the completion process. You can provide a new schema or just update parts of an existing one. It works independently, ensuring the changes are applied cleanly without interfering with ongoing tasks. The system will also record this change if logging is turned on. You essentially provide the new or modified completion rules, and the framework takes care of applying them.

## Function overrideAgent

This function lets you change the blueprint for an agent already running in the swarm. Think of it as updating an agent's configuration – you can provide a complete new definition or just a few tweaks. The system handles this change carefully, isolating it from other operations to avoid conflicts, and it keeps a record of the change if logging is turned on. You provide the new or modified agent schema, and the framework takes care of applying it to the existing agent within the swarm.

## Function overrideAdvisor

This function lets you change how an advisor operates within the swarm. It allows you to update an advisor's settings by providing a new schema, which can be a complete replacement or just a few adjustments. Think of it as tweaking an advisor's personality or rules. This update happens independently, ensuring it doesn't interfere with anything else currently running. If your system is set up to record activity, this override will be logged for tracking purposes. You simply provide the new advisor schema, and the system takes care of applying the changes.

## Function notifyForce

This function lets you send a message out from a swarm session directly, without it being processed as a regular incoming message. Think of it as a way to push information out to the system. It’s specifically for sessions created using the “makeConnection” method and ensures the targeted agent is still available before sending.  You provide the message content and a unique client identifier to specify where the notification should be delivered. This ensures a clean environment for sending and logs the action if logging is turned on.

## Function notify

This function lets you send messages out from your AI agent swarm without triggering any of the usual message processing. Think of it as a way to broadcast information directly. 

It's specifically for sessions created using the "makeConnection" method. Before sending anything, the system checks to make sure the connection, the swarm, and the agent you specify are still working and haven't been replaced. 

You provide the message content, a unique client identifier, and the name of the agent you want to associate with the notification. The system keeps things tidy by creating a fresh environment before sending and logs the action if you’ve enabled logging.

## Function markOnline

This function lets you tell the system that a specific client is now active and participating in a particular swarm. Think of it as signaling that a worker is ready to receive tasks. You'll need to provide the unique ID of the client and the name of the swarm they're part of to use this function. Essentially, it keeps the orchestration framework aware of which clients are currently online and available.


## Function markOffline

This function lets you tell the system that a particular client is no longer active within a swarm. Think of it as signaling that a worker has disconnected or become unavailable. You'll need to provide the unique ID of the client and the name of the swarm where that client was participating. This helps the system rebalance tasks and avoid sending work to unavailable agents. It essentially updates the system's view of which clients are currently online and ready to work.

## Function listenEventOnce

This function lets you temporarily listen for a specific event happening within your AI agent swarm. You tell it which client or all clients to watch, and what kind of event (identified by its topic) you’re interested in. A filter helps you narrow down the events you care about, only triggering a callback when a relevant event arrives. Once that single event is processed, the listener automatically stops, ensuring it doesn't interfere with other processes. To cancel the listener before it fires, a function is returned, allowing you to remove it.

## Function listenEvent

This function lets you listen for specific messages being sent across the agent swarm. You tell it which client (or all clients) you want to hear from and what "topic" or message type you're interested in. When a message matching your criteria arrives, it will trigger a function you provide, allowing your agent to react to events happening within the swarm. To stop listening, the function gives you a way to easily unsubscribe and clean up the listener. The system ensures that certain reserved topic names aren't used and handles the message processing in a controlled sequence.

You can subscribe to events from a particular client, or use a wildcard to listen for events from any client.

## Function json

This function helps you retrieve data in a well-organized JSON format, following a predefined structure. Think of it as a way to request specific information and receive it neatly packaged. You provide a name that identifies the data you want, and optionally, you can pass along some parameters to fine-tune the request. It’s designed to run in a safe and isolated environment, preventing any interference with other processes. The result will be a structured JSON object containing the data you requested.

## Function hasSession

This function helps you quickly determine if a client has an active session. It takes a client identifier as input and returns `true` if a session exists, and `false` otherwise. Behind the scenes, it uses a session validation service to do the actual check. If your system is set up for logging, the function will also record that it was called.

## Function hasNavigation

This function helps you determine if a particular agent is involved in guiding a client through a process. It checks if the agent is on the navigation path assigned to a specific client session. Behind the scenes, it confirms the agent and client are valid, finds the relevant swarm, and looks at the navigation route to make its decision. If logging is turned on in the system’s settings, this check will also record its activity. You provide the client's ID and the agent’s name to use for this check.

## Function getUserHistory

This function helps you get a record of what a user has said or done during a specific session. You provide a unique identifier for the session, and it returns a list of messages representing the user's interactions. It pulls the raw session history and then carefully selects only the entries marked as being from the user. This makes it easier to track and understand a user's activity within a particular session.


## Function getToolNameForModel

This function helps determine the specific name a model will use to identify a tool, taking into account who is using it and which agent is involved. It's designed to be the primary way external systems interact with the tool naming process. To get the model-friendly tool name, you provide the tool's name, a unique identifier for the user's session, and the agent’s name. The function then returns a promise that resolves to the tool name as it should be presented to the AI model.


## Function getTool

This function lets you fetch the definition of a specific tool that's registered within your AI agent swarm. Think of it as looking up a tool’s blueprint – you provide the tool’s name, and the function returns its schema, detailing how it works and what it accepts. The system will also keep a record of this lookup if you’ve configured logging to be active. You just need to give it the name of the tool you're interested in to get its details.

## Function getSwarm

This function lets you fetch the configuration details – we call it the schema – for a specific swarm. Think of it as looking up the blueprint for how that swarm operates. You provide the swarm's name, and the function returns a detailed description of its setup. If your system is configured to log activity, this function will also record that you requested the swarm’s details.

## Function getStorage

This function lets you fetch the details of a specific storage space within your AI agent swarm. Think of it as looking up the blueprint for how a particular storage area is organized and what kind of data it holds. You provide the name of the storage you’re interested in, and the function returns a description of its structure and data types. The system will also record that you requested this information if logging is turned on.

## Function getState

This function lets you fetch a specific state definition from the orchestration system. Think of it as looking up the blueprint for a particular state within the swarm. You provide the name of the state you're interested in, and the function returns the details of that state’s structure. If your system is configured to log actions, this retrieval will also be recorded. The `stateName` parameter is essential; it tells the system exactly which state definition you want.

## Function getSessionMode

This function lets you find out the current operating mode of a specific client session within your AI agent swarm. Think of it as checking what stage a client is in – whether they’re actively in a session, attempting to connect, or have completed their task. You give it the unique ID of the client session, and it returns the mode, which will be one of three options: "session", "makeConnection", or "complete". It's designed to be reliable and runs in a controlled environment to ensure consistent results.

## Function getSessionContext

This function lets you peek into the current running environment for your AI agents. It gathers important details like who's using the system (client ID), which process is running, and what tools and resources are available. Think of it as getting a snapshot of the agent's current situation. It automatically figures out the client ID, so you don't need to provide it. It checks to make sure things are set up correctly and keeps track of what's happening for debugging purposes.

## Function getRawHistory

This function lets you access the complete, unfiltered history of interactions for a specific client session within your agent swarm. Think of it as getting the raw data directly from the system. 

It provides a way to retrieve all messages and data associated with a client’s agent, without any alterations or filtering applied. You simply provide the client's unique identifier, and it returns an array containing all the historical data. 

The function ensures a controlled execution environment and tracks the operation for debugging purposes if logging is enabled. It makes a fresh copy of the history data, so you’re working with a new dataset each time you call it.

## Function getPolicy

This function lets you fetch a specific policy definition from the system, identifying it by its name. Think of it as looking up the blueprint for a particular policy. When you call this function, the system will search for the policy with the provided name and return its full definition. It also keeps a record of this retrieval if the system is set up to log activity. You just need to give it the name of the policy you’re interested in, and it will return the detailed policy schema.

## Function getPipeline

This function lets you fetch the blueprint, or schema, for a specific pipeline within your AI agent swarm. Think of it as looking up the recipe for a particular workflow. You provide the name of the pipeline you want, and it returns the detailed structure that defines how that pipeline operates. The system also keeps a record of this retrieval if you’ve configured logging.



The only thing you need to provide is the name of the pipeline you’re interested in.

## Function getPayload

This function lets you easily grab the data currently being used by the agent swarm. Think of it as fetching the information the agents are working with right now. If there’s no data available – perhaps no agent is actively processing anything – it will return nothing. It also quietly keeps track of when it’s used if you have logging turned on.

## Function getNavigationRoute

This function helps you figure out the path a client has taken through an AI agent swarm. It essentially tells you which agents a client has interacted with, giving you a trace of their journey. You provide the unique identifier for the client and the name of the swarm you're interested in, and it returns a list of agent names representing that route. Behind the scenes, it uses a navigation validation service to get this information, and might also log activity depending on how the system is configured.

## Function getMCP

This function lets you fetch the blueprint, or schema, for a specific Model Context Protocol (MCP) used within your AI agent swarm. Think of it as looking up the instructions for how a particular agent should interact with the system. You provide the name of the MCP you're interested in, and the function returns its complete schema. The system also keeps track of these requests if you’ve configured logging.

The only information you need to provide is the name of the MCP you want to retrieve.

## Function getLastUserMessage

This function lets you easily grab the very last message a user sent during a conversation. It finds this message by looking through the conversation history associated with a specific client ID. If a user message exists, you'll get its content as a string; otherwise, it will return nothing. You just need to provide the unique ID of the client's session to use it.

## Function getLastSystemMessage

This function lets you grab the last message sent by the system within a client's ongoing session. It essentially digs into the client's history to find the most recent message specifically marked as coming from the system. If the client hasn't received any system messages yet, it will return nothing. You'll need to provide the unique identifier for the client session to use it.

## Function getLastAssistantMessage

This function helps you easily grab the last message sent by the assistant during a client's interaction. It digs into the client’s conversation history to find the most recent message where the assistant provided a response. You provide a unique identifier for the client, and the function returns the content of that last assistant message as text. If no assistant messages are present in the history, it will return nothing.

## Function getEmbeding

This function lets you fetch the details of a specific embedding that your AI agent swarm is using. Think of it as looking up the blueprint for how an embedding works. You provide the name of the embedding you're interested in, and the function returns all the information associated with it. It also keeps a record of this action if your system is configured to log activity.

## Function getCompute

This function lets you fetch the detailed configuration for a specific compute within your AI agent swarm. Think of it as looking up the blueprint for a particular worker. You provide the name of the compute you're interested in, and it returns all the information defining how that compute operates. If your swarm's logging is turned on, this function will also record that it was used.


## Function getCompletion

This function lets you fetch a specific completion schema, which defines how a particular task or action is performed, using its assigned name. Think of it as looking up the instructions for a certain job within the AI agent swarm. It’s a simple way to retrieve the details of a completion. If your system is set up to record activity, this function will also log when it’s used. You provide the name of the completion you're looking for, and it returns the associated schema.

## Function getCheckBusy

This function lets you quickly see if an AI agent swarm is currently working on a task. You simply provide the unique identifier for the client session, and it will return `true` if the swarm is busy and `false` otherwise. It's a handy way to monitor the status of your agent swarms and avoid sending new requests while they're already occupied. Essentially, it helps you keep track of what your swarms are doing.

## Function getAssistantHistory

This function lets you pull the conversation history of an AI assistant for a specific client session. Think of it as retrieving all the assistant's responses and contributions to a particular chat. It fetches the full history and then narrows it down to only show messages the assistant sent. It’s designed to run cleanly and provides logging for troubleshooting if needed. You just need to provide the unique ID of the client session to get the relevant history.

## Function getAgentName

This function helps you find out what an agent is called for a specific client. Think of it as looking up the agent’s name associated with a particular session in your swarm. It makes sure the session and swarm are valid, keeps a log if that's turned on, and then asks the swarm to provide the agent's name. To keep things running cleanly, it operates in a separate, isolated environment. You just need to give it the unique identifier for the client session you're interested in.

## Function getAgentHistory

This function lets you view the past interactions and adjustments made for a particular agent within your swarm. It pulls up the agent's history, taking into account any rescue algorithms the system is using to refine its responses. 

You provide the client ID to identify the session and the agent’s name to specify which agent’s history you want to see. The system verifies your request and carefully retrieves the history using the agent’s prompt configuration. This process is designed to run independently, keeping things clean and reliable.

## Function getAgent

This function lets you find a specific agent within your AI agent swarm, identifying it by its assigned name. Think of it as looking up an agent's blueprint or definition. It’s how you access the details of an agent so you can work with it. If your swarm is set up to keep a record of activity, this function will also create a log entry to track when the agent's information is accessed. You provide the agent's name, and it returns the agent's internal schema.

## Function getAdvisor

This function helps you find the details of a specific advisor within your AI agent swarm. Think of it as looking up a profile – you give it the advisor's name, and it returns all the information associated with that advisor. It’s useful for understanding what an advisor is responsible for and how it operates. If your system is set up to log activity, this function will also record that you requested the advisor's information. You simply provide the name of the advisor you’re interested in, and the function does the rest.

## Function fork

This function lets you run a piece of code – a function – inside a controlled environment, ensuring everything related to its session is handled automatically. You provide the function you want to execute, along with some settings like a client ID and swarm name. The function you provide will be called with the client ID and the agent’s name, allowing it to interact with the system. This approach simplifies managing the lifecycle of tasks and makes sure resources are cleaned up properly afterwards.


## Function executeForce

This function lets you directly send a message to an agent within a swarm session, acting as if it came from a client. It’s useful for things like checking what an agent has done or starting a conversation between the agent and a client application.

Crucially, this method bypasses checks for agent activity, guaranteeing the message gets through even if the agent isn’t currently running or has been replaced. 

You provide the message you want to send (the `content`) and a unique identifier for the client session (`clientId`) to track where the request came from. The system handles the details of sending the message, keeping track of performance and notifying other parts of the system.


## Function execute

This function lets you send messages or commands to a specific agent within your swarm, making it appear as if they came directly from a client. Think of it as a way to review an agent’s work, trigger a conversation, or generally interact with them programmatically.

Before anything happens, the system makes sure the agent you’re targeting is still part of the swarm and hasn't been replaced. The message itself is handled carefully, ensuring a clean environment and keeping track of performance and important events.

You'll need to provide the actual content of the message, a unique identifier for the client, and the name of the agent you want to interact with.

## Function event

This function lets your application send messages, called events, to the rest of the AI agent swarm. Think of it as a way to broadcast information – your agent can send a notification, a request, or any data it wants to share.

You specify who is sending the message (`clientId`), what kind of message it is (`topicName`), and the actual information being sent (`payload`).

It's designed to keep things organized and avoid conflicts, so certain topic names are off-limits. The system ensures that your message is properly formatted and logged for tracking purposes.

## Function emitForce

This function lets you push a string directly into the AI agent swarm as output, essentially simulating a response without triggering any message processing or checking which agent is active. It's specifically designed to work with sessions created using `makeConnection`, ensuring everything functions smoothly within that environment. 

Think of it as a shortcut for injecting data into the system. The process creates a fresh context, verifies the session and swarm's health, and won't work if you've set up your connection differently. You'll need to provide the content you want to emit and a unique ID for the client session.

## Function emit

This function allows you to send information as output from an agent within the swarm, essentially letting the agent "speak" without processing a standard message. It's specifically designed for use when initially establishing a connection – think of it as a way to bootstrap the conversation.

Before sending anything, it makes sure the connection is valid, that the agent is still active and part of the swarm, and that the agent hasn’t been replaced. It sets up a fresh environment for the operation and keeps a record of it if logging is turned on. Importantly, you can only use this function when setting up the initial connection.

## Function commitUserMessageForce

This function lets you directly add a user's message to the agent's record within a swarm session. Think of it as manually updating the conversation history. It's a forceful action, meaning it doesn't wait to see if the agent is still running and skips some usual checks. 

You provide the message content, how it should be handled (the execution mode), and a client identifier. Optionally, you can include extra data in a payload object. The function ensures the process runs cleanly and independently, then passes the update to the session's service.


## Function commitUserMessage

This function lets you add a user's message to an agent's record within a swarm session, essentially documenting the interaction without automatically prompting a response from the agent. 

Think of it as a way to build up the agent's history of conversation.

It ensures the agent and session are still running smoothly, carefully logs the action, and then passes the message along to the session's central service for storage. The function is designed to run independently, avoiding interference from any ongoing processes.

You provide the message content, the execution mode, a client identifier, the agent’s name, and optionally, some extra data in a payload.

## Function commitToolRequestForce

This function lets you directly push tool requests to an agent within the swarm, essentially overriding some of the usual checks. It's useful when you need to ensure a request goes through immediately, even if the standard validation processes might have issues. You provide the tool requests themselves and a unique ID for the client session, and the function handles committing them while keeping track of what's happening. It's wrapped in a system that manages the execution environment and logs all actions for auditing.

## Function commitToolRequest

This function lets you send tool requests to a specific AI agent within the swarm. Think of it as submitting tasks for the agent to handle. 

It makes sure everything is set up correctly – verifying that the agent you’re targeting is actually the one you think it is, and managing the overall environment for the request. 

You provide a list of requests, a unique ID for your client session, and the name of the agent you want to send those requests to. The function then takes care of the rest, sending the requests and keeping track of what's happening.


## Function commitToolOutputForce

This function lets you directly submit the results from a tool back into the agent's workflow, even if you're unsure if the agent is still actively running. It's a way to push data forward without waiting for confirmation.

It handles behind-the-scenes checks for the session and swarm, and logs the action for tracking purposes. The process is isolated to prevent interference with other operations.

To use it, you'll need the tool's unique ID, the output content itself, and the client session ID.

## Function commitToolOutput

This function lets you record the results of a tool's work within your AI agent swarm. Think of it as telling the system, "Hey, this tool just finished, and here's what it produced!" 

It makes sure the agent you're referencing is still participating in the session before saving the output. 

Behind the scenes, it checks things are valid, logs the action if you're tracking those kinds of things, and then securely passes the information along. The function is designed to work reliably, regardless of what else might be happening in the system.

You'll need to provide the tool's ID, the content the tool generated, the client's ID, and the agent's name when you use it.

## Function commitSystemMessageForce

This function lets you directly add a system message to a conversation, bypassing the usual checks about which agent is currently active. It’s useful when you need to ensure a specific system message is included, regardless of the current agent's state.

Think of it as a way to force a system message into the conversation history. 

It verifies the session and swarm before adding the message, and it keeps track of what’s happening through logging.  You provide the message content and a unique identifier for the client session to use this function. This is similar to how `commitAssistantMessageForce` works compared to `commitAssistantMessage`.

## Function commitSystemMessage

This function lets you send important messages directly to an agent within your AI agent swarm. These messages aren't responses from the agent itself – think of them as system instructions or configuration updates.

It carefully checks that the agent you're targeting is valid and belongs to the correct session and swarm before sending the message. This function manages the process behind the scenes, handling things like logging and ensuring everything runs smoothly. 

You'll need to provide the message content, a client identifier to track the session, and the name of the specific agent you want to receive the message. It works similarly to sending regular assistant messages but specifically designed for these system-level communications.

## Function commitStopToolsForce

This function lets you immediately halt the execution of tools for a particular client, bypassing usual checks. Think of it as a forceful way to pause the process – it won't consider what agent is currently running or whether it's okay to stop. 

It's designed for situations where you need to quickly prevent further tool actions, similar to a forceful "flush" operation. To use it, you simply provide the client’s unique identifier. 

Behind the scenes, it confirms the session and swarm are valid, then stops the tool execution directly, while also keeping track of what's happening through logging. It's a way to take direct control and ensure tool execution stops for a specific client.

## Function commitStopTools

This function allows you to temporarily halt the execution of tools for a particular agent within a client's session. Think of it as a pause button for a specific agent's workflow. It carefully verifies that you're targeting the correct agent and session before stopping the tool execution, ensuring everything is secure and aligned. 

It works behind the scenes with several other components to manage the process, keeping track of what’s happening and making sure things are logged correctly. Unlike functions that might clear the agent's history, this one simply stops the agent from running the next tool, giving you more granular control over the workflow.

To use it, you'll need to provide the unique identifier for the client’s session and the name of the agent you want to pause.

## Function commitFlushForce

This function allows you to forcefully clear the history for a specific client’s session within the agent swarm. It's a more direct way to flush the history than the standard commitFlush, bypassing checks to see which agent is currently active.

Think of it as an emergency clear – it ensures the history is cleared regardless of the system’s current state. 

It handles security checks (session and swarm validation) and uses logging to keep track of what’s happening, and it’s designed to be a reliable way to reset a client’s history when needed. You just need to provide the unique identifier for the client session.

## Function commitFlush

This function lets you clear the history of a specific agent within a client’s session. Think of it as a way to essentially reset an agent's memory. It carefully checks that the agent you’re targeting actually exists and is valid before proceeding with the history clear. The process is managed to ensure everything runs correctly, and it keeps a record of the operation through logging. It’s designed to be a complementary action to adding messages, allowing you to wipe the slate clean instead of just adding to the agent's ongoing conversation. You need to specify the client's unique ID and the agent's name to use this function.

## Function commitDeveloperMessageForce

This function lets you directly push a message into a session, bypassing the usual checks for an active agent. Think of it as a way to manually inject a developer-created message when you need to, regardless of what the agents are currently doing. It verifies that the session and swarm are valid before adding the message, and records what's happening in the logs. You’re essentially forcing the message to be committed, similar to how you might forcefully commit an assistant message. 

You provide the message content and a unique identifier for the session where it should be added.

## Function commitDeveloperMessage

This function lets you send messages directly to a specific agent within the swarm, like giving it a developer instruction or user feedback. It makes sure the agent you're targeting is valid and part of the current session before sending the message.

Behind the scenes, it carefully manages the process, checks all the necessary components, and keeps a record of what's happening through logging. Think of it as a way to communicate directly with an agent, distinct from the system's own generated responses.

You’ll need to provide the actual message content, a unique ID for the user session, and the name of the agent you want to address.

## Function commitAssistantMessageForce

This function lets you directly push a message from an assistant into a conversation, even if the system isn’t expecting it. It’s designed for situations where you need to ensure a message gets recorded, bypassing typical checks about which agent is currently active. 

Essentially, it forces the message into the system's memory, verifying that the session and swarm are valid before proceeding. Think of it as a way to guarantee a message is logged, similar to how you might forcefully cancel an output. 

You provide the message content and a unique identifier for the client session so the system knows where to put it. The system handles checking the session and swarm and then commits the message, keeping track of everything with detailed logging.


## Function commitAssistantMessage

This function helps you record messages generated by an AI assistant and associate them with a specific agent within your swarm. It makes sure everything is correctly identified – the agent, the client session, and the swarm itself – before saving the message. Think of it as a way to permanently store the AI's responses, keeping a clear record of the conversation history for each agent. It handles the behind-the-scenes work of ensuring the process is secure and logged correctly. This is the tool you use to save an assistant's contribution, as opposed to discarding it.

You'll need to provide the message content, a unique client ID, and the agent’s name to use this function.

## Function changeToPrevAgent

This function lets you switch back to a previously used agent for a client, or to the default agent if there's no history. It's designed to manage agent transitions within a swarm, ensuring a smooth handover and validating that the client and agent are still valid. The process is handled carefully to prevent issues and logs the change if tracking is enabled. Essentially, it's a way to step back in the agent selection process for a specific user session. You need to provide the unique ID of the client’s session to use this function.

## Function changeToDefaultAgent

This function allows you to easily return a client's agent selection back to the swarm's pre-configured default. It's designed to handle client sessions and ensures a safe, queued transition to the default agent. The process includes checks to make sure everything is valid and logs activity if logging is turned on. It’s a reliable way to reset an agent choice without disrupting the overall system. You just need to provide the unique identifier for the client session you want to revert.

## Function changeToAgent

This function lets you switch which AI agent is handling a specific client's session within your swarm. It's designed to be a reliable way to change agents, ensuring everything is validated and logged appropriately. The change happens in a controlled manner using a queue, and it's handled independently of any ongoing processes. You'll need to provide the agent's name and the client's unique ID to use this function.

## Function cancelOutputForce

This function lets you quickly stop an agent from sending its output for a particular client. It's a forceful way to cancel, meaning it doesn't check if the agent is still running or active. 

Think of it as an emergency stop button – it immediately sends an empty response to the client, effectively halting the process. 

It makes sure the session and swarm are valid before cancelling and uses several internal services to manage the process safely and log any actions. It’s useful when you need to override what an agent is doing and ensure a clean stop, even if the agent isn’t responding normally.

You only need to provide the unique identifier (clientId) of the client you want to interrupt.

## Function cancelOutput

This function lets you stop an agent from producing further output for a specific client. It's useful when you want to interrupt a task that an agent is performing.

Essentially, it sends a signal to the agent to cease generating more information, and it confirms that the agent you're targeting actually exists and is the one you intended to cancel. 

The function takes the client's ID and the agent's name as input, and it handles all the necessary checks behind the scenes to ensure everything is working correctly. It's designed to be reliable and trackable, managing the execution context and logging actions along the way.

## Function ask

This function lets you send a message to your AI agent swarm and get a response. Think of it as posing a question or giving a task to your advisors. You provide the message you want processed, specify which advisor should handle it, and optionally include images to give more context. The function then returns a promise that resolves to the advisor's answer. It's the core way to interact with your AI agent swarm.

## Function addTriageNavigation

This function lets you set up a way for your AI agents to easily connect with a triage agent when they need assistance or a more specialized review. Think of it as creating a clear pathway for agents to escalate issues to a human expert. You provide some configuration details, and the function registers that navigation route so your agents know how to reach the triage agent. It returns a string representing the registered navigation identifier, which you can use later to manage or reference it.

## Function addTool

This function lets you add new tools that agents in your system can use. Think of it as registering a new skill for your agents – without registering it this way, the agents won't know about it. 

It's designed to keep things clean by running the registration process separately, and it tells you the tool's name once it’s successfully added. You’ll need to provide a schema that describes what the tool does and how it works.

## Function addSwarm

This function lets you register a new group of agents, essentially setting up a framework for managing how they interact and handle client sessions. Think of it as defining the blueprint for a specific type of agent collaboration. Only swarms created using this function will be recognized and work within the system. The process is designed to run independently, ensuring a fresh start for each new swarm. When successful, you'll receive a unique name for the newly created swarm. You'll provide a schema that outlines the swarm's structure and rules when you call this function.

## Function addStorage

This function lets you add a new way for your AI agents to store and retrieve information persistently. Think of it as registering a new type of database or file system that the entire swarm can use. 

By providing a schema, you're telling the system how this storage works and how to access it. If this storage is meant to be shared between multiple agents, it automatically sets up the connection and waits for it to be ready. The whole process runs independently to keep things clean and ensures that the swarm knows about and can use your new storage option. You’ll get back the name of the storage you just added.

## Function addState

This function lets you define and register new states within the agent swarm system. Think of states as containers for information the agents need to share or use. By adding a state, you're essentially telling the swarm "Hey, this is a new kind of data we'll be working with." If the state is designed to be shared across agents, this registration process also sets up the connection to the shared data service.  The function ensures this registration happens cleanly, independent of other ongoing processes, and provides a name for the registered state. You need to use this to formally introduce new states for the swarm to understand and utilize.

## Function addPolicy

This function lets you define and register rules, or "policies," that will guide the behavior of agents within your swarm. Think of it as setting up guardrails to ensure agents operate within defined boundaries. When you add a policy, it's both validated to make sure it’s structured correctly and registered for ongoing management. The system keeps track of these policies, allowing you to easily control and update them as needed, ensuring a well-managed and predictable swarm. It handles the technical details behind the scenes, including logging and schema management, so you can focus on defining the policies themselves.

## Function addPipeline

This function lets you register a new pipeline, or update an existing one, within the AI agent orchestration framework. Think of a pipeline as a sequence of steps your agents will follow – this function makes sure that pipeline definition is valid and properly registered so the system knows how to run it. You provide a description of the pipeline, essentially its blueprint, and the function returns a unique identifier for it. It's how you tell the system, "Hey, I've got a new way for agents to work together!" and allows for modifications to existing pipeline configurations.

## Function addOutline

This function lets you define and register the structure for outlining tasks within the AI agent swarm. Think of it as setting up the blueprint for how your agents will break down complex projects. 

When you call this function, it makes sure everything is handled cleanly and avoids conflicts with other ongoing tasks.  It also keeps a record of the operation if logging is turned on.

You provide an outline schema, which describes the structure of the outlining process, and the function takes care of registering it within the system. You can update existing outlines by providing a partial schema.

## Function addMCP

This function lets you define new ways for AI agents to share information and context within the swarm. Think of it as creating a blueprint for how agents can communicate and understand each other’s actions. When you register a new schema using `addMCP`, the system recognizes and supports that specific communication format. You provide the schema definition, and the function returns a unique identifier for that schema, allowing you to reference it later. Essentially, it’s how you customize the language spoken between the agents in your swarm.

## Function addFetchInfo

This function lets you set up a tool for your AI agents to pull information from external sources. Think of it as giving your AI a way to “read” data without changing anything.

The process works like this: the AI asks the tool for data, the tool checks if the request is properly formatted, then fetches the information. If the data is missing, a special handler can be triggered. Ultimately, the AI gets the information it requested. 

You provide a configuration object to define how the tool should work, specifying details about the data retrieval process.

## Function addEmbedding

This function lets you add a new way for the swarm to generate embeddings – think of it as teaching the system a new language for understanding data. By providing a schema, you’re essentially registering a new embedding engine that the swarm can then use for various tasks like finding similar pieces of information.  Only embeddings added this way will be recognized by the system.  The process runs in a controlled environment to ensure a clean operation, and it logs the addition for tracking purposes. You’ll get the name of the newly registered embedding back as confirmation.

## Function addCompute

This function lets you register new types of tasks your AI agents can perform, or update existing ones. Think of it as defining the different jobs your agents are capable of handling.  You provide a description of the task, and the system verifies that it's properly defined before making it available for agents to use. It returns a unique identifier for the registered compute, so you can refer to it later.



It’s designed to let you easily add and modify the range of actions your AI agents can take.

## Function addCompletion

This function lets you register new ways for your AI agents to generate text, like connecting to different language models. Think of it as adding a new tool to the agents' toolbox. When you register a completion engine using this function, it becomes available for all the agents in your swarm system to use. It ensures the registration process is clean and isolated, and it will give you a name to identify the newly added completion engine. You provide a description of the completion engine – its schema – to enable this integration.

## Function addCommitAction

This function lets you define a way for your AI agent to make changes to a system, like writing files or updating databases. Think of it as giving the AI a specific tool it can use to modify something. 

When the AI wants to make a change, it calls this function, providing details about what needs to be done. The system first checks if the provided details are correct. If not, the AI gets an error message. If everything looks good, the actual modification happens, and the AI receives feedback on the result. It’s a structured way to let the AI safely and reliably interact with and alter the environment.

## Function addAgentNavigation

This function lets you set up a way for one agent in your system to be directed to another. Think of it as creating a "navigation tool" that tells an agent how to find and interact with a specific agent. You provide some configuration details, and the function creates and registers this navigation tool, returning a unique identifier for it. It's a core part of allowing agents to coordinate and work together within the swarm.

## Function addAgent

This function lets you add agents to the system, essentially registering them so the swarm can use them. Think of it as formally introducing a new worker to the team. Only agents added this way will be recognized and usable by the swarm. To keep things clean and prevent conflicts, the process runs in a special, isolated environment. You’re given the agent's name back once it's successfully registered. You’ll need to provide a detailed schema definition for each agent you want to add.

## Function addAdvisor

This function lets you register a new advisor into the agent swarm orchestration system. You provide a schema that describes the advisor's capabilities and how it should behave. The function will then add this advisor to the system, making it available for agents to utilize. It returns a unique identifier for the registered advisor, allowing you to track and manage it later. Think of it as telling the system, "Hey, I'm adding a new expert to help!"

# agent-swarm-kit classes

## Class ToolValidationService

This service is responsible for making sure the tools your AI agents use are properly configured and exist within the swarm system. It keeps track of all registered tools and their definitions, ensuring that each tool is unique and present when needed.

The service works hand-in-hand with other parts of the system: it gets tool information from the ToolSchemaService, helps AgentValidationService verify agent tools, and interacts with ClientAgent when tools are used. It uses logging to keep track of what’s happening and speeds up validation checks by remembering previous results.

You can add new tools to the system using `addTool`, which registers them and makes sure they don't already exist. The `validate` function then checks if a tool is registered, making sure everything is in place before an agent tries to use it.

## Class ToolSchemaService

This service acts as a central place to manage the blueprints for the tools your agents use. Think of it as a library of tool definitions – each definition describes what a tool does, how to call it, and what kind of data it expects.

It ensures that these tool definitions are valid and consistent. Before a tool can be used by an agent, it's registered with this service, which performs a quick check to make sure it’s structurally sound.

The service works closely with other parts of the system: it gets information about schemas from the Schema Context Service, helps agents connect and execute tasks, and keeps track of agent tools throughout their lifecycle.

You can register new tools, update existing ones, and retrieve them whenever they're needed. The system keeps a log of these operations, providing visibility into how tools are managed within the agent swarm.

## Class ToolAbortController

This class helps you manage the process of stopping ongoing tasks, especially when dealing with asynchronous operations. Think of it as a way to gracefully halt something that's running.

It creates and handles an `AbortController`, giving you access to the signal that lets you interrupt work. 

Inside, it keeps track of the `AbortController` itself, and if your environment doesn’t have one, it will simply be empty.

You can use the `abort` method to actually trigger the interruption, effectively telling the running task to stop. If there's nothing to abort, this method won’t do anything.

## Class SwarmValidationService

This service is responsible for making sure your swarm configurations are set up correctly. It keeps track of all registered swarms and verifies their details, including the agents they use and the policies they follow. 

Think of it as a quality control system for your swarm setups. It works closely with other services to handle agent and policy validation, track swarm registrations, and manage operations. It’s designed to be efficient, using techniques to avoid unnecessary checks.

Here's what it can do:

*   **Register new swarms:** Adds a swarm to the system and ensures it's unique.
*   **Retrieve information:** Provides lists of agents and policies associated with a specific swarm, and a list of all swarms.
*   **Validate configurations:**  It checks a swarm's setup, making sure everything is as it should be, including agent and policy details. This is a key operation for ensuring that your swarms are working correctly.

## Class SwarmSchemaService

This service acts as a central library for defining and managing the blueprints of your AI agent swarms. Think of it as a place to store and organize the configurations that tell your agents how to work together. It makes sure these configurations are valid before they're used, ensuring your swarms operate correctly.

It keeps track of swarm schemas—essentially, the settings for each swarm—using a special registry. This lets you easily find and update swarm configurations.

The service is designed to work closely with other parts of the system, like the connection service for clients and agents, and the policy management system. It logs its actions to help with debugging.

You can register new swarm configurations, update existing ones, or retrieve them when needed. The service validates configurations to make sure they have the essential pieces in place, and it makes it easy for other services to access and use these swarm definitions. It’s a core component for building and controlling your AI agent swarms.

## Class SwarmPublicService

This class acts as a public interface for interacting with a swarm of agents, providing a controlled way for clients to manage and observe swarm activity. It sits on top of the core swarm connection service, adding context and logging for better tracking and debugging.

Think of it as a translator – it takes requests from clients (like "get the current agent" or "cancel output") and translates them into actions on the underlying swarm infrastructure, ensuring everything happens within a specific context (client and swarm).

Here’s a breakdown of what it allows you to do:

*   **Communicate with the swarm:** Send messages, check if the swarm is busy, and wait for results.
*   **Manage the swarm's state:** Switch agents, set the current agent's name, and even dispose of the entire swarm.
*   **Keep things organized:** Operations are always tied to a specific client and swarm, making it easier to understand what’s happening and troubleshoot issues.
*   **Log activity:** The system provides detailed logging of all actions, which is useful for debugging and monitoring swarm performance (if enabled).

## Class SwarmMetaService

This service helps you understand and document your AI agent swarms. It takes the blueprints of your swarms – their schemas – and transforms them into easy-to-understand diagrams using a standard format called UML.

Think of it as a translator that converts complex swarm configurations into visual representations. It builds a structured view of your swarm, including its default agent, and then converts this view into a UML string.

This functionality is particularly useful for creating system documentation and helping to debug issues.  The service relies on other components to manage schemas, agents, and logging, ensuring consistent operation across the system.  The resulting UML diagrams are helpful for understanding how your swarms are built and for sharing that information with others.

## Class SwarmConnectionService

This service manages how different parts of your AI agent swarm work together. It's like a central hub that handles connections, keeps track of swarms, and makes sure things run smoothly. 

Think of it as a smart cache - it remembers frequently used swarm configurations to avoid repetitive setup. It also handles communication, lets you manage agents within a swarm, and gives you tools to control the flow of operations, like canceling output or checking if a swarm is currently busy.  Essentially, it’s responsible for coordinating activities across your swarm environment, providing a consistent and efficient interface for agents to interact with. You can emit messages to the session, navigate between agents, and even retrieve the current agent's information, all through this single service. It also helps clean up resources when swarms are no longer needed.

## Class StorageValidationService

This service is responsible for making sure the storage configurations used by your AI agent swarm are set up correctly. It keeps track of all the registered storage locations and their details.

You can add new storage locations to the system using `addStorage`, and the service will verify that each one is unique. 

The `validate` function checks if a specific storage exists and that its embedding configuration is valid, helping to ensure that the agents can reliably read and write data. The service also logs its actions to help with troubleshooting, and it’s designed to be efficient by remembering the results of previous validations.

## Class StorageUtils

This class provides tools for managing data storage for individual clients and agents within the swarm. Think of it as a helper for interacting with the swarm's storage system, ensuring that agents are properly authorized to access and modify data.

You can use it to retrieve items from storage, insert or update data, delete specific items, and list all items within a designated storage space.  It also allows you to create a numeric index for storage and completely empty a storage area.  Before any action is taken, the system verifies that the client and agent have the necessary permissions and are correctly registered within the swarm. This ensures security and proper data management.

## Class StorageSchemaService

This service manages how your AI agents store and access data within the system. Think of it as a central directory for defining storage configurations – like how data should be indexed or where embedding references are located.

It ensures that these storage configurations are valid before they're used, and keeps track of them using a registry. Whenever a new storage configuration is added or an existing one is updated, it logs these actions for monitoring. 

This service works closely with other parts of the system, like those managing storage connections, agent schemas, and even how agents themselves use storage during their work. It’s a foundational piece that makes sure data is stored and accessed in a consistent and reliable way.

## Class StoragePublicService

This service manages storage specifically for each client, distinct from system-wide storage. Think of it as a way to keep each client's data separate and organized. It handles common storage operations like retrieving, saving, updating, deleting, and cleaning out data.

It relies on other services for logging, connection management, and context scoping, and it's designed to be used by components like ClientAgent, PerfService, and DocService.  The service keeps track of what's happening with client storage, helping with debugging and performance monitoring.  Importantly, it ensures each client's data is isolated, making it a crucial element for managing data privacy and security within the system.

Here's a breakdown of what you can do with it:

*   **Retrieve Data:** Fetch a list of items based on a search query, or retrieve a single item by its ID.
*   **Save/Update Data:** Add new items or modify existing ones in the client's storage.
*   **Delete Data:** Remove specific items from the client's storage.
*   **List All Items:** Get a full list of items currently stored for a particular client.
*   **Clear Storage:** Completely empty a client's storage area.
*   **Dispose of Storage:** Release resources associated with the client's storage.

## Class StorageConnectionService

This class manages how your agent swarm interacts with storage, handling both client-specific and shared storage. Think of it as a central hub for getting, saving, and managing data for your agents.

It’s designed to be efficient – it caches storage connections so it doesn’t have to recreate them every time. When you need to read or write data, it figures out which storage to use, fetches any necessary configuration, and handles the actual data operations. It also keeps track of what storage is being shared across different agents.

Here's a breakdown of what it does:

*   **Fetching Storage:** When an agent needs to read or write data, this class gets the right storage connection.
*   **Data Operations:** It provides methods like `take` (retrieve), `upsert` (save/update), `remove`, `get`, `list`, and `clear` to interact with the storage.
*   **Sharing:** If data needs to be shared between agents, it handles that through a shared storage mechanism.
*   **Cleanup:** When done, it cleans up connections to free up resources.
*   **Tracking:** Keeps an eye on storage usage for tracking and validation.

## Class StateValidationService

This service helps manage and verify the structure of data used by your AI agents. Think of it as a way to ensure everyone's speaking the same language. 

You can define different "states" – essentially, data formats – using schemas, and tell the service about them.  The `addState` method is how you register these defined data structures. 

Then, when your agents are working, the `validate` method lets you check if the data they're providing matches the expected format.  This helps catch errors early and keeps your agents working reliably.

The service also uses a logger to keep track of what’s happening, which is accessible through the `loggerService` property, and internally manages state definitions via `_stateMap`.

## Class StateUtils

This class provides tools for managing information related to specific clients and agents within the swarm. Think of it as a way to keep track of what each client and agent knows or is doing.

You can use it to fetch existing data, update it, or completely reset it. Before retrieving, updating, or clearing data, the system makes sure everything is authorized and registered correctly. It also tracks these operations for monitoring and debugging purposes. 

Essentially, this class simplifies the process of working with client and agent-specific data within the larger agent swarm.

## Class StateSchemaService

The StateSchemaService acts as a central hub for managing the blueprints of how your agents handle data – these blueprints are called state schemas. It keeps track of these schemas, ensuring they are valid and accessible to different parts of the system.

Think of it as a librarian for agent data: it registers new schema definitions, provides a way to retrieve them, and even lets you update existing ones. It makes sure these schemas are set up correctly before they are used by your agents.

This service works closely with other components of the system, like those handling agent connections, agent execution, and schema definitions, ensuring a consistent and reliable way to manage state configurations. The service also keeps a log of its actions, allowing you to track and debug state management operations.

## Class StatePublicService

This class handles state management specifically for individual clients within the swarm system. Think of it as a way to keep track of data that's unique to each client, like their preferences or progress in a task. It's different from shared system-wide state or persistent storage.

It provides methods for setting, clearing, getting, and disposing of this client-specific state. Each of these actions is carefully wrapped with context information and logging, ensuring that operations are tracked and controlled. This class works closely with other services like ClientAgent, PerfService, and DocService to manage client data effectively.

Essentially, it's the central point for dealing with a client's individual state, offering a structured and logged way to interact with that data.

## Class StateConnectionService

This service manages how agents store and use data, especially when dealing with multiple agents and shared information. Think of it as a central hub for agent state.

It’s designed to efficiently handle individual agent's data and any shared data across the whole system. To avoid unnecessary work, it caches frequently used data.

It integrates with several other services to ensure that state is handled securely and tracked effectively, including logging, event handling, and schema management.

Key actions you can perform through this service include:

*   **Retrieving or creating state:** This is the main way to access data for an agent. It intelligently reuses data when possible.
*   **Updating state:**  Allows agents to change their data, ensuring changes are processed safely.
*   **Clearing state:** Resets an agent's data to its initial state.
*   **Disposing of connections:** Releases resources used by the connection, ensuring everything is cleaned up properly. Note that shared states aren’t cleaned up here, as they're managed elsewhere.

## Class SharedStorageUtils

This class provides tools to manage shared data accessible by all agents in your swarm. Think of it as a central repository where agents can store and retrieve information. 

You can use it to fetch data based on a search query (`take`), add or update data entries (`upsert`), delete specific items by ID (`remove`), retrieve items by their ID (`get`), list all data entries (with optional filtering) (`list`), or completely empty a storage area (`clear`). Before any operation, the system checks to ensure the storage name is valid.

## Class SharedStoragePublicService

This service provides a way for different parts of the system to interact with shared storage – think of it as a central place to store and retrieve information. It handles operations like getting, adding, updating, deleting, and clearing items from this shared storage.

The service keeps track of what’s happening by logging activity, and it works closely with other services to ensure everything runs smoothly. Different components like ClientAgent and PerfService rely on this service for storage-related tasks.

Here's a breakdown of what you can do:

*   **`take`**: Retrieves a list of items based on a search, ideal for finding specific data within the storage.
*   **`upsert`**: Adds new items or updates existing ones in the storage.
*   **`remove`**: Deletes specific items from the storage.
*   **`get`**: Retrieves a single item by its unique identifier.
*   **`list`**: Retrieves all items in a storage area, allowing you to see everything that's been stored.
*   **`clear`**: Empties an entire storage area, essentially resetting it.

The service is designed to be flexible and integrates well with other parts of the system, enabling different components to share and manage data effectively.

## Class SharedStorageConnectionService

This service manages shared storage within the system, acting as a central hub for data access and manipulation. Think of it as a single, unified storage space that all parts of the swarm can use.

It retrieves and creates storage areas based on their names, ensuring that all clients work with the same storage instance. When you request data or update something, this service fetches the right storage area for you and handles the underlying details.

Key functions include:

*   **Retrieving data:** You can search for items, retrieve specific items by ID, or list all items, potentially filtering them.
*   **Updating data:** You can add new items or modify existing ones.
*   **Clearing storage:** You can reset the entire shared storage to its initial state.

The service is designed to work seamlessly with other components, using logging and event handling to keep things organized and track activity. It smartly caches storage areas to avoid unnecessary overhead, making operations faster and more efficient.

## Class SharedStateUtils

This class provides simple tools for agents within a swarm to share and manage data. Think of it as a shared whiteboard where agents can write and read information. You can easily grab existing data using `getState`, update it directly or calculate a new version based on what's already there with `setState`, and even completely erase a piece of shared data using `clearState`. These operations are designed to be reliable and logged for better tracking within the swarm.

## Class SharedStatePublicService

This service provides a way to manage and share data across different parts of the swarm system. It acts as a public interface for interacting with shared state, handling operations like setting, clearing, and retrieving data. The system keeps track of what's happening with these operations through logging, and it’s designed to work seamlessly with other services like ClientAgent and PerfService. You can think of it as a central hub for accessing and updating shared information within the swarm. It uses a dispatch function when setting state, allowing for controlled and potentially asynchronous updates.

## Class SharedStateConnectionService

This service manages shared data across different parts of the system, acting as a central hub for accessing and updating that data. Think of it as a single source of truth for certain pieces of information that multiple agents need to see and potentially modify.

It keeps track of these shared data instances using a clever caching system, making sure everyone's working with the same version and preventing conflicts. When changes are made, it carefully sequences them to ensure that updates happen in a safe and orderly manner.

The service integrates closely with other parts of the system, handling things like logging, event notifications, and fetching configurations. It ensures that data is accessed and updated consistently, and it provides a standardized way for different agents to interact with shared information.  If you need a single, reliable place to store and manage data that’s shared across agents, this is the class you're looking for. You're able to get the current state, clear it, or set it using a provided function.

## Class SharedComputeUtils

This utility class provides helpful functions for interacting with shared compute resources within the AI agent swarm. Think of it as a toolkit to manage and retrieve information about the computational power being used by your agents.

The `update` function allows you to refresh the status of a specific compute resource, ensuring you have the latest information about its availability and performance. You can use it to keep your system synchronized with the current state of the compute environment.

The `getComputeData` function lets you request and retrieve data associated with a particular compute resource. It’s a flexible way to get the specific details you need, like resource usage statistics or configuration settings, and the type of data returned is defined by you.

## Class SharedComputePublicService

This service helps manage and coordinate shared computing tasks, keeping track of where and how computations are happening. It's designed to work with existing logging and connection services, so you don’t have to build those from scratch. 

You can use it to fetch previously computed data, request a fresh calculation for a specific compute task, or force an update of the shared compute. Think of it as a central hub for orchestrating shared compute operations, allowing your AI agents to efficiently reuse calculations and avoid unnecessary work.

## Class SharedComputeConnectionService

This component handles connections to shared computational resources, allowing agents in your swarm to work together and share data. It acts as a central hub for accessing and managing these shared resources.

The `SharedComputeConnectionService` uses logging and messaging services for communication and tracks the compute resources it manages, caching references for efficiency. It provides functions to retrieve data from these shared computations, and also triggers computations based on state changes. Think of it as a way to synchronize and coordinate tasks across multiple AI agents. It has mechanisms to update and refresh the state of these shared computations.

## Class SessionValidationService

The `SessionValidationService` keeps track of sessions used by your AI agent swarm, ensuring things stay consistent and organized. Think of it as a central record-keeper for each session, noting which swarms, agents, storage resources, and states are involved.

It works closely with other services like those managing session connections, agents, and storage to make sure everything is properly associated and cleaned up. The service logs important actions to help with debugging and uses memoization to speed up common validation checks.

You can use it to register new sessions, track which agents and resources are being used, remove those associations when they're no longer needed, and check whether a session exists.  It’s designed to be flexible, allowing you to query session details like its mode, associated swarm, and the list of agents currently using it. It also provides a way to clear out old validation data for specific sessions.

## Class SessionPublicService

This service acts as the public interface for managing interactions within AI agent sessions. Think of it as the main way client applications (like user interfaces) communicate with the core session handling logic. It's designed to be versatile, handling everything from sending messages to executing commands and tracking performance, all while ensuring proper context and logging. 

It relies heavily on other services like logging, performance tracking, and session management to do its job, ensuring consistent behavior across the system. The service provides methods for emitting messages, running commands, and handling connections, each carefully wrapped to maintain context and provide insights into what's happening within the session. You’re essentially getting a controlled and monitored access point to manipulate and observe AI agent sessions.


## Class SessionConnectionService

This service manages individual conversation sessions within the swarm system. It's like a central hub for all communication and actions happening during a single interaction with an AI agent. It cleverly reuses session data to avoid unnecessary overhead.

Think of it this way: whenever a client interacts with the swarm, this service creates or reuses a dedicated "session" to track everything happening. This ensures things like security policies, access to swarm data, and tracking performance are handled consistently.

Key functions include:

*   **getSession:** Creates or retrieves a session for a specific client and swarm - it avoids creating new ones if one already exists.
*   **notify & emit:** Sends messages to and from the session, enabling real-time communication.
*   **execute & run:** Allows for executing commands or running specific tasks within the session.
*   **connect:** Sets up the connection for bidirectional communication within the session.
*   **commit...Message:** These functions record events (like messages from the user, AI, or system) in the session’s history.
*   **dispose:** Cleanly shuts down a session when it's no longer needed.

Essentially, it's the backbone for orderly, secure, and trackable interactions within the AI agent swarm.

## Class SchemaUtils

This class provides helpful tools for managing data related to client sessions and formatting data for communication. 

You can use it to store information specific to each client in a session memory, retrieving it later when needed. This ensures that each client's data is handled securely and consistently.

Furthermore, it offers a way to convert objects or lists of objects into easily readable strings, making it simpler to share data between different parts of the system and potentially for human readability. You can even customize how the keys and values are represented during this serialization process.

## Class RoundRobin

This class helps you distribute tasks evenly among a group of different creators, like assigning requests to different AI agents. It works by keeping track of a list of creators (identified by "tokens") and rotating through them one by one. 

Think of it as a fair scheduler – each creator gets a turn in a predictable order. The `create` method is how you set up this rotating system, providing the list of creators and the function that actually builds the instance for each token. You can easily manage a pool of specialized agents and ensure no single agent gets overloaded. The class internally keeps track of which creator is currently active, allowing for predictable and balanced execution.

## Class PolicyValidationService

This service helps ensure that policies used within the agent swarm are valid and consistent. It keeps track of all registered policies and their definitions, making sure they haven't been duplicated and exist when needed. 

It works closely with other services – policy registration, policy enforcement, agent validation, and logging – to keep everything running smoothly.  The service efficiently manages its list of policies and reuses previous validation results to speed things up.

You can add new policies to the system using the `addPolicy` function, which also checks for duplicates.  The `validate` function confirms a policy exists before it’s used, which is crucial for proper policy enforcement.

## Class PolicyUtils

This class helps manage client bans within your AI agent swarm’s security policies. Think of it as a central place to handle adding, removing, and checking the ban status of clients. 

It provides straightforward methods – `banClient`, `unbanClient`, and `hasBan` – to perform these actions. Before anything happens, it makes sure the information provided (client ID, swarm name, policy name) is correct to keep things reliable.  Essentially, it simplifies the process of controlling which clients are allowed to interact with your swarm, all while keeping track of what's happening.

## Class PolicySchemaService

This service acts as a central place to manage the rules (policies) that govern how agents interact within the swarm. It's like a library of policy definitions, ensuring these rules are consistent and reliable. When a new rule is added or an existing one is changed, this service handles the process, making sure it’s properly validated and registered. It works closely with other parts of the system, like the agent execution environment and session management, to enforce these rules and control access. Keeping track of these policy changes is logged for transparency and debugging.

## Class PolicyPublicService

This service is your go-to for managing how policies affect clients interacting with the swarm. It acts as a public interface, handling tasks like checking if a client is banned, retrieving ban messages, and performing input/output validation. Think of it as the gatekeeper ensuring policy compliance.

Behind the scenes, it leverages other services for core functionality – logging for detailed tracking, and policy connection for actual enforcement.  It's used by various parts of the system, including performance monitoring and client agents, to maintain consistency and security.

You can use this service to:

*   Check if a client is blocked from a specific area of the swarm.
*   Find out why a client is banned.
*   Make sure data being sent or received complies with established rules.
*   Temporarily or permanently restrict a client’s access.
*   Restore a client's access.

## Class PolicyConnectionService

This service is responsible for managing how policies are applied and enforced within the swarm system. It acts as a central point for checking if a client is banned, retrieving ban messages, validating input and output data, and enacting ban/unban actions. To ensure efficiency, it caches frequently used policy information.

It relies on several other services for logging, event handling, retrieving policy configurations, and accessing execution context. It offers consistent functionality, mirroring the behavior of other public services to ensure uniformity across the system. 

Essentially, it's the engine that makes sure the swarm operates according to its defined rules and policies.

## Class PipelineValidationService

This service helps ensure your AI agent pipelines are set up correctly before you start running them. Think of it as a quality control check. 

You can add your pipeline definitions to this service, describing what each pipeline looks like. Then, when you want to test a pipeline, you provide the source code, and the service will validate it against your defined schema. It uses a logger to keep track of any issues it finds during validation, providing valuable feedback to help you catch errors early. Essentially, it's designed to streamline the setup and debugging of your AI agent workflows.

## Class PipelineSchemaService

This service helps manage and organize the blueprints for your AI agent workflows – we call them pipeline schemas. Think of it as a central place to store and retrieve these blueprints, ensuring everyone’s using the right structure. 

It allows you to register new blueprints, update existing ones, and easily retrieve them when needed. The service keeps track of schema-related information, and provides context for working with those schemas. It’s designed to be flexible and integrates with other parts of the system, enabling streamlined workflow orchestration.

## Class PersistSwarmUtils

This class helps manage how your AI agents and their navigation history are saved and retrieved. It’s designed to keep track of which agent is currently active for each user session and swarm, and to store the sequence of agents a user has interacted with.

You can think of it as a central place to store information about active agents and their navigation paths, allowing you to easily load and save this data as needed. 

It also allows you to customize how this data is stored – for example, using a database or even keeping it in memory – providing flexibility for different deployment scenarios.  The system ensures that each swarm has its own dedicated storage, which optimizes performance and resource usage.

## Class PersistStorageUtils

This utility class helps manage how data is stored and retrieved for each client within the swarm system. It provides a simple way to get and set data associated with a specific client and a descriptive name for that data, like user profiles or session logs.

The class automatically handles creating and reusing storage instances to ensure efficiency. You can also customize how the data is persisted by plugging in your own storage mechanisms, allowing for more advanced options like using a database instead of a simple file. Essentially, it provides a flexible and efficient way to keep track of data for each client in the swarm.

## Class PersistStateUtils

This utility class helps manage how information is saved and retrieved for each agent in the swarm. Think of it as a way to remember things like an agent's current settings or variables.

It allows you to store data associated with a specific agent (identified by a unique ID) and a named piece of information.  You can retrieve this information later, or provide a default value if the information hasn't been saved yet.

Importantly, the system is designed to avoid creating unnecessary duplicate storage.  It intelligently creates and reuses storage instances.

You can also customize how the information is actually stored – perhaps in memory, or in a database – using a custom constructor. This gives you a lot of flexibility in managing the persistence layer.

## Class PersistPolicyUtils

This class helps manage how policy information, specifically lists of banned clients, is saved and retrieved within the AI agent swarm. It provides easy ways to get and set these banned client lists for a particular swarm, making it simple to control which clients can participate. 

The system cleverly memoizes the storage mechanism, so it doesn't repeatedly create persistence instances, which helps conserve resources. You can also customize how policy data is stored by providing your own persistence adapter, allowing for advanced tracking options. 

Essentially, this class streamlines the process of managing and persisting client ban status within your swarm environment.

## Class PersistMemoryUtils

This utility class helps manage how memory is stored and retrieved for each client within the swarm system. It's designed to keep track of information related to a specific client session, allowing the system to remember things like context or progress.

The class uses a clever caching mechanism to ensure that memory isn’t needlessly duplicated - there's only one storage instance for each client. You can retrieve memory data, set new data, or completely clear the memory when a client session is over.

If you need more control over how the memory is persisted – maybe you want to use a database instead of a simple file – you can also customize the way it works by providing your own storage constructor.

## Class PersistEmbeddingUtils

This class helps manage how embedding data is saved and retrieved within the swarm. It provides tools to read and write embedding vectors, letting you customize how this process happens.

It keeps track of embedding storage, making sure we don't create unnecessary instances to save resources. The class offers a way to check if an embedding has already been computed and saved, preventing redundant work. 

You can also configure how the embedding data is persisted, allowing for advanced options like in-memory or database storage instead of the default behavior.

## Class PersistAliveUtils

This utility class helps keep track of which clients are currently online and available within your swarm system. It manages their online/offline status, allowing you to reliably check if a client is ready to participate in tasks. The system efficiently handles persistence, ensuring that each client's status is stored only once.

You can use this class to easily mark a client as online or offline and then quickly check their status later.  It also lets you customize how the system persists this status, so you can integrate it with different storage methods like in-memory stores or databases. Essentially, it's designed to make sure your swarm knows who's active and ready to work.

## Class PerfService

The `PerfService` is responsible for tracking and logging performance data related to client sessions within your system. It monitors things like execution times, input/output sizes, and session states. Think of it as a performance detective, gathering clues to see how efficiently your agents are working.

It collects information during the execution of client tasks (using the `startExecution` and `endExecution` methods) and organizes it into structured records, which you can then use for reporting or analytics. 

The service relies on several other services (like session validation, memory schema, and state services) to gather all the necessary information, and the logging of detailed information is controlled by a system-wide setting. 

You can retrieve performance metrics for individual clients or the entire system, and there's a way to completely clear out the tracked data for a specific client when it’s no longer needed. Essentially, it provides a comprehensive view of how your AI agents are performing over time.

## Class OutlineValidationService

This service helps keep track of and verify the structure of outlines used by the agent swarm. It’s responsible for ensuring each outline has a defined schema and that these schemas are unique.

It lets you register new outline structures, providing a way to add them to the system. You can also retrieve a list of all the registered outline names.

The core function is to validate outlines – making sure they exist and are properly configured before they're used. This validation is designed to be fast thanks to caching, and it logs details about the validation process. It also relies on other services to handle logging and manage completion schemas.

## Class OutlineSchemaService

This service helps manage the blueprints, or schemas, that guide your AI agents as they work together. It’s responsible for keeping track of these blueprints, making sure they’re well-formed, and providing ways to add new ones or update existing ones.

Think of it as a librarian for your agent blueprints – it registers them, keeps them organized, and lets you quickly find the one you need. It uses a central logging system to record activity, and it works with other parts of the system to handle context-specific blueprint management.

You can add new blueprints, change existing ones, or simply retrieve a blueprint when needed. The service also checks that each blueprint has the necessary elements before it’s added to the system.

## Class OperatorInstance

This class represents a single instance of an operator within a swarm of AI agents. Think of it as a specific agent participating in a coordinated task.

Each operator instance is identified by a client ID and a name, and it has a set of callback functions to handle different events.

You can connect to receive answers from the operator, and methods are provided to send notifications, answers, and messages. Finally, a `dispose` method allows you to properly shut down and release resources associated with the operator instance when it's no longer needed.

## Class NavigationValidationService

The NavigationValidationService helps manage how agents move around within the swarm, preventing unnecessary trips and making sure navigation is efficient. It keeps track of which agents have already been visited for each client and swarm. 

You can think of it as a memory for the swarm's navigation – it remembers where agents have been.  It uses a logger to record important events and uses a technique called memoization to quickly access and update this navigation history. 

To start tracking navigation, you can use `beginMonit`. If you need to clear the memory and start over, you can use `dispose`. The `shouldNavigate` function is the core of the service; it decides whether a new agent should be navigated to, based on whether it's already been visited.

## Class NavigationSchemaService

This service keeps track of which navigation tools are registered within the system. It uses an internal list to store these tool names.

You can register a tool by providing its name using the `register` function, and the system will log this action. 

The `hasTool` function lets you quickly check if a particular navigation tool has already been registered. This is also logged if logging is enabled. Essentially, it's a simple way to manage and verify which navigation tools are part of your AI agent setup.

## Class MemorySchemaService

This service acts as a temporary, in-memory storage for data associated with individual sessions within the system. Think of it as a scratchpad where each session has its own space to hold information. It's designed to be lightweight and doesn’t store data permanently or validate its structure.

You can use it to write, read, and remove data specific to each session.  Each session is identified by its ID (which is the same as its client ID). This service works in conjunction with other components like the session connection and agent services, and keeps track of its actions through logging.  It's a simple way to manage session-specific data without relying on more complex storage solutions. When a session ends or resets, this data is simply cleared.

## Class MCPValidationService

This service helps you keep track of and make sure your Model Context Protocols (MCPs) are working correctly. Think of it as a central place to register and check the structure of your MCPs. 

It stores your MCP schemas in a handy map, allowing you to easily add new ones and confirm they're set up as expected. The service uses a logger to record its actions, making it easier to troubleshoot any issues. You can add MCP schemas by name and then validate them against a source to ensure everything lines up.

## Class MCPUtils

This class, MCPUtils, helps manage updates to the tools used by your clients connected through the Multi-Client Protocol. Think of it as a way to distribute new versions of tools or software to keep everyone working with the latest versions. You can update the tools for every client connected to your system, or target a specific client for a more focused update. Essentially, it simplifies the process of ensuring all your clients have the tools they need.

## Class MCPSchemaService

This service is responsible for handling and organizing the blueprints, or schemas, that define how AI agents communicate and share information within a swarm. Think of it as a central library for these blueprints. 

It allows you to add new schema blueprints, update existing ones, and easily find the blueprint you need. The service keeps track of these schemas using an internal registry. 

It also uses a logger to record its actions and relies on a schema context service to manage related operations like validating and retrieving schemas.



Here's a breakdown of what you can do:

*   **Register Schemas:** Add new blueprints to the central library.
*   **Override Schemas:** Update existing blueprints, perhaps to correct an error or add a new feature.
*   **Retrieve Schemas:** Find a specific blueprint by its name.

## Class MCPPublicService

This class provides a way to interact with Model Context Protocol (MCP) operations, essentially managing how AI agents within a system can use and access tools. It allows you to list available tools for a client, refresh the list of tools for everyone or just a single client, and check if a particular tool exists. You can also use this class to actually execute a tool, providing the necessary parameters and getting the output. The class relies on injected services for logging and handling the underlying MCP connections.

## Class MCPConnectionService

This service is responsible for managing connections and interactions with Model Context Protocol (MCP) resources. Think of it as the central hub for accessing and using tools exposed by AI models.

It handles things like listing available tools, checking if a tool exists, and actually calling those tools with the information you provide. The service keeps track of these connections to avoid unnecessary re-creation and efficiently manage resources.

You can request a list of tools available for a specific client, refresh that list, or directly execute a tool, and this service takes care of the underlying communication. When you’re finished, it also provides a way to release those connections cleanly. It relies on other services for logging, communication, and managing the context of those tool interactions.

## Class LoggerService

This component handles all the logging within the agent swarm system. It provides a way to record events and information at different levels – normal, debug, and informational – making it easier to track what’s happening and troubleshoot issues.

It automatically includes details about the specific method and execution context alongside each log message, giving you more context when reviewing them. It sends logs to both a central system logger and a client-specific logger, ensuring nothing is missed. 

The system allows you to easily swap out the central logger if you need to redirect logs somewhere different, for example, to a testing environment or to a file. The level of detail logged (debug, info) is controlled by system-wide settings.


## Class LoggerInstance

This component handles logging specifically for a particular client. It lets you customize how messages are logged, including whether they appear in the console and what extra actions you want to take when a log is generated.

You set up a `LoggerInstance` by giving it a client identifier and a set of optional callback functions. These callbacks let you define custom behaviors for logging, like sending logs to a remote server or triggering specific actions based on log messages.

The logger makes it easy to record different types of messages – regular logs, debug messages, and informational messages – and it ensures that initialization only happens once.  When you're finished with a logger, you can dispose of it to run any cleanup routines and trigger a final callback. The console output is controlled by a global configuration setting, so you can easily turn it on or off.

## Class HistoryPublicService

This service manages how history information is accessed and handled within the swarm system, providing a public-facing interface. It's the go-to place for actions like adding messages to an agent's history, retrieving the most recent message, and getting a complete view of the history as an array. 

Think of it as a controlled access point to the underlying history data, ensuring consistency and providing a place to add extra context and logging. It works closely with other services like the logging system, the core history management, and the agent interaction layer.

You'll use this service when you need to:

*   **Add a message:**  Push a new message onto an agent’s history, for example, when a system message is committed or when an agent executes a function.
*   **Retrieve a message:** Get the most recently added message, useful when you need to see what just happened.
*   **View the history:**  Get the entire history as an array, perhaps to prepare context for an agent or to document the history.
*   **Clean up:** Dispose of the history data when an agent is no longer needed, releasing resources.



It's designed to be consistent with how other parts of the system handle similar operations, ensuring a unified approach to history management.

## Class HistoryPersistInstance

This component keeps track of a conversation's history, saving messages both in memory and on disk for later use. Each history instance is tied to a specific client ID and allows you to define callback functions for different actions like adding, removing, or reading messages.

The `waitForInit` method sets everything up initially, potentially loading existing data from storage. You can loop through the history using `iterate`, and `push` adds new messages, persisting them.  If you need to retrieve the most recent message, `pop` removes and returns it. Finally, `dispose` cleans up the history, either for a specific agent or completely.

## Class HistoryMemoryInstance

This class provides a simple way to keep track of a conversation's history within an agent's memory, but without saving that history permanently. It's designed for situations where you need to remember what's been said for the current session only.

When you create an instance, you're essentially giving it an ID for the agent it's managing and setting up a few optional "hooks" (callbacks) to be notified when things change within the history.

The `waitForInit` method sets up the history for a specific agent.  You can then add new messages using `push`, remove the last message with `pop`, and go through the history messages one by one using `iterate`.  Finally, `dispose` lets you clear the memory completely, either for a single agent or for all agents if you provide a null agent name.

## Class HistoryConnectionService

This service manages the history of interactions with each agent within the swarm system. Think of it as keeping track of what each agent has done and said. It's designed to be efficient, reusing history information whenever possible to avoid unnecessary work.

It works closely with other parts of the system, like the agent itself, the connection service, and the public history API, making sure everything stays synchronized. It also logs important actions and tracks usage to monitor performance and security.

Key features include:

*   **Efficient History Management:** It intelligently reuses stored history data, preventing redundant creation.
*   **Centralized Tracking:** It keeps a record of what each agent is doing.
*   **Integration with Other Services:** It cooperates with various services to provide a consistent and reliable history tracking solution.
*   **Controlled Logging:** It logs actions for auditing and debugging purposes.
*   **Proper Cleanup:** It ensures resources are released when history tracking is no longer needed.



You can retrieve a history for a specific agent using the `getHistory` method.  Adding new messages to the agent's history is done with the `push` method, and removing the most recent message is handled by `pop`.  The `toArrayForAgent` and `toArrayForRaw` functions offer ways to get the history as formatted arrays, depending on the needs. Finally, the `dispose` method cleans up when the history is no longer required.

## Class ExecutionValidationService

This service helps manage and validate how many times an AI agent is running within a specific group (swarm) for a particular client. It keeps track of running agent executions to prevent issues caused by too many nested runs.

You can use it to check how many executions are currently happening, increment the count when a new agent starts, or decrement it when an agent finishes.  If things get out of control, you can clear the current tracked executions or completely remove the count for a client and swarm. Think of it as a way to ensure your AI agents are running in a controlled and stable manner.

## Class EmbeddingValidationService

This service helps ensure that the names of embeddings used throughout the system are correct and consistent. It keeps track of all registered embeddings and their details. 

When a new embedding is added, this service registers it and makes sure the name isn't already in use. 

When someone tries to use an embedding (like in a search), this service verifies that the embedding name actually exists and is valid. It does this quickly by remembering previous checks. 

The service uses logging to keep track of what's happening and relies on other parts of the system to manage embedding registration and provide information.

## Class EmbeddingSchemaService

This service manages how embedding logic – the way data is transformed into a numerical representation for tasks like similarity search – is stored and used within the system. It acts as a central place to register and retrieve these embedding definitions, making sure they’re consistent and valid.

Think of it as a library of embedding recipes. When a component needs to perform a similarity search or generate embeddings, it uses this service to find the right "recipe."

It checks new embedding definitions to ensure they have the necessary parts and logs these actions for tracking purposes. It works closely with other services responsible for storage, client agents, and agent schema management. This helps ensure the system consistently uses the correct embedding logic for operations like retrieving data based on similarity. The service provides functions to register new embedding definitions, update existing ones, and retrieve them when needed.

## Class DocService

This class is responsible for creating documentation for your swarm system, including the agents, policies, and their underlying schemas. It generates Markdown files for easy readability and JSON files for performance metrics. Think of it as the documentation engine that helps you understand and debug your AI agent swarms.

The class pulls information from various other services to create these documents, making it a central hub for generating comprehensive system documentation. It uses a thread pool to handle documentation creation efficiently and logs activities for debugging.

Key features include:

*   **Automatic Documentation Generation:**  Automatically creates documentation for swarms and agents, keeping your documentation up-to-date.
*   **Visual Schema Representations:** Generates UML diagrams for agents and swarms, providing visual overviews of their structures.
*   **Performance Data Logging:** Captures and logs system-wide and client-specific performance data in JSON format.
*   **Organized Output:**  Organizes documentation into a structured directory system.
*   **Dependency on Other Services:** Relies on various other services to retrieve information about swarms, agents, policies, and more.


## Class ComputeValidationService

This class, ComputeValidationService, helps manage and validate the configurations for individual computations within your AI agent swarm. It’s designed to ensure that each computation has the correct structure and data it needs to run properly.

The service uses a logger to track what's happening and relies on other services for validating state and schemas. It keeps track of the computations you’re using in a map.

You can add new computations to the service, listing all available computations, and then validate specific computations against a source to make sure they're set up correctly. Think of it as a quality control system for your agent swarm’s individual tasks.

## Class ComputeUtils

This set of tools, ComputeUtils, helps manage and retrieve information about computing resources within the agent swarm. You can use it to update the status of a specific compute resource, identifying it by a client ID and a compute name. It also provides a way to fetch data associated with a compute resource, letting you access details like configuration or performance metrics, and the type of data fetched is flexible, adapting to the specific information you need. Essentially, it simplifies interacting with and understanding the state of your computing infrastructure within the swarm.

## Class ComputeSchemaService

The ComputeSchemaService helps manage and organize different schema definitions used within the system. It acts as a central place to store, update, and retrieve these schema blueprints. 

Think of it as a library where you can register new schema types, modify existing ones, and easily access them when needed. The service is designed to keep track of schema-related information, providing a structured way to interact with these definitions and ensuring consistency across the system. 

It uses a logger to track events and relies on a schema context service to handle the underlying management of schema contexts. You can register new schema definitions, override existing ones with updates, and retrieve specific schemas by their key.

## Class ComputePublicService

This class provides a way to interact with compute resources, making sure operations happen within the right context. It relies on other services to handle logging and the actual compute connections.

You can use `getComputeData` to fetch calculated values, and `calculate` to force a re-evaluation. If you need to refresh a compute instance, `update` will do the trick. Finally, `dispose` allows you to properly clean up when a computation is finished. It helps manage the lifecycle of compute tasks, ensuring things run smoothly and efficiently.

## Class ComputeConnectionService

This class manages connections and data flow within the agent swarm. It acts as a central hub, coordinating how different computational units interact and share information.

It uses logging and messaging services to keep track of what's happening and communicate effectively. The class also handles validation and manages the overall state of the computations.

You can retrieve computed data using `getComputeData`, and `calculate` initiates a new calculation based on a specific state. The `update` method likely refreshes or synchronizes the compute process, while `dispose` cleans up resources when the connection is no longer needed. It also allows retrieving references to specific computational units with `getComputeRef`.

## Class CompletionValidationService

This service helps keep track of valid completion names used within the system, making sure they are unique and properly registered. It’s like a gatekeeper ensuring agents are only using approved completion names.

It works closely with other services, including the completion registration service and agent validation, and it uses logging to record its actions. To speed things up, it remembers the results of past validation checks.

You can add new completion names to the list using `addCompletion`. The `validate` function then checks if a given completion name is valid and keeps track of whether it has been seen before.

## Class CompletionSchemaService

The CompletionSchemaService manages how agents within the swarm system define and use specific actions or tasks, essentially acting as a central library for these actions. It keeps track of these actions, making sure they're properly defined and available to the agents that need them.

Think of it like this: each action has a name and a way to perform it (the 'getCompletion' function). This service registers these actions, validates they're set up correctly, and makes them accessible to other parts of the system.

It works closely with other services – ensuring agents are properly connected and executing correctly – and keeps a record of all registered actions for easy access. The system logs actions performed by this service to provide transparency and help with troubleshooting. Actions can even be updated or replaced dynamically, allowing for changes in how agents operate.

## Class ClientSwarm

The `ClientSwarm` class acts as a central manager for a group of AI agents working together. It keeps track of which agent is currently active, manages a history of agent switches, and handles the flow of information between the agents and external systems. Think of it like an air traffic controller for your AI agents, ensuring they operate smoothly and efficiently.

It provides ways to wait for an agent to finish its task and cancel ongoing operations if needed.  The class uses a system of notifications to let other parts of the application know when an agent's status changes or output is received.  You can use it to dynamically switch between agents, monitor their progress, and manage their interactions, all while handling errors and ensuring a reliable workflow. Essentially, it provides a structured way to orchestrate a team of AI agents, making their combined efforts more predictable and manageable. The class also ensures everything is cleaned up when it's no longer needed.

## Class ClientStorage

This class manages how your agent swarm stores and retrieves data, offering efficient search capabilities. Think of it as a central hub for your agents to persist and find information.

It handles operations like saving new data (upsert), deleting data (remove), and clearing everything out (clear). When you need to find similar items, it uses embeddings to perform a similarity search. These actions are processed in a controlled order to ensure everything happens correctly.

The class keeps track of data internally, allowing for quick lookups. It also creates "embeddings" – numerical representations of your data – which help with the similarity search.  It’s designed to work with other parts of the system, like services that handle connections and events, so data stays synchronized. Finally, when you're done with the storage, it provides a way to cleanly shut it down.

## Class ClientState

This class manages the data and interactions related to a single state within a swarm of AI agents. It acts as a central hub for reading, writing, and reacting to changes in that specific piece of data.

Think of it as a safe and organized way for agents to share information – it queues actions, handles updates, and ensures that everyone stays informed about what’s happening. 

It integrates with other parts of the system to handle initialization, connecting to the swarm, and keeping everything synchronized. You can subscribe to notifications when the state changes, allowing other agents to respond to those updates. When you're done with a state, the `dispose` method ensures it's cleaned up properly.

## Class ClientSession

This class, `ClientSession`, is the core for managing interactions within your AI agent swarm. Think of it as a dedicated workspace for a client to communicate with the agents. It handles everything from sending messages and validating them against policies to logging actions and maintaining a history of the conversation.

It acts as a central hub, coordinating with other services to ensure smooth communication and responsible agent behavior. For example, it uses a system to broadcast messages to interested listeners and it integrates with a service to fetch the correct agent for the task.

Here's a breakdown of what you can do with `ClientSession`:

*   **Send Messages:** You can send notifications and regular messages, each handled differently – notifications are simple alerts while regular messages undergo policy checks.
*   **Execute Tasks:** It allows you to run specific tasks through the swarm's agents, returning the results and enforcing rules along the way.
*   **Manage History:**  You can commit various types of messages (user input, system updates, developer notes) to the agent’s history, allowing you to track the conversation.
*   **Control Agent Behavior:**  You can signal the agent to stop further processing or request specific tools.
*   **Connect and Disconnect:** It provides a way to hook up the session to a real-time communication channel.
*   **Clean Up:** When you're finished, it handles proper resource cleanup.



Essentially, `ClientSession` is your go-to class for reliable and controlled interaction with your AI agent swarm.

## Class ClientPolicy

The ClientPolicy class is a core component for managing security and compliance within the swarm system. It essentially acts as a gatekeeper, controlling which clients can interact with the swarm and what they're allowed to send and receive.

It handles banning clients, ensuring their input and output messages meet specific requirements, and managing custom messages related to bans. The ban lists are loaded only when needed, which helps with performance. 

When a client attempts to interact, this policy checks if they’re banned, validates their messages, and can automatically ban them if necessary.  It communicates with other parts of the system like the connection services, agent, and event bus to enforce these policies and keep everyone informed of any actions taken.  The system remembers bans, optionally persists them, and allows for dynamic adjustments to who is allowed to participate in the swarm.

## Class ClientOperator

The ClientOperator acts as a central hub for coordinating the actions of AI agents within a swarm. It’s responsible for sending instructions and receiving results from the agents. 

Think of it as a manager relaying tasks and gathering information. It allows you to send data to the agents, control how they operate, and track their progress. Some functions like running, committing tool output, system messages, and flushing are currently unavailable.  You can send messages to the agents, including user and assistant messages, and track changes in agent configuration. Finally, it handles cleanup and releases resources when it's no longer needed.


## Class ClientMCP

This class helps your application work with tools for AI agents, acting as a bridge between your code and the available tools. It keeps track of which tools are available to different clients and lets you easily call those tools with the necessary information.

You can use it to find out what tools are available to a particular client, check if a specific tool exists, and refresh the list of tools when needed. The class also manages the tools' lifecycle, allowing you to release resources when a client is no longer needed. When you want to run a tool, you simply provide the tool's name and the data it needs, and this class handles the rest.

## Class ClientHistory

This class keeps track of all the messages exchanged with an agent, acting like a memory for the system. It’s designed to store, retrieve, and filter these messages to provide the agent with relevant context.

The system uses a filter to make sure the agent only sees the most important messages. You can add new messages, retrieve the most recent one, or get the full history as a list.  

When an agent is finished, this class makes sure all resources used for the history are cleaned up properly. It works closely with other parts of the system to manage messages and keep the agent's context up-to-date. It also ensures that tool calls and their results are linked together, which helps the agent understand the flow of information.

## Class ClientCompute

This component handles the logic for performing calculations on the client side, reacting to changes in the application's data. When data changes, it recalculates values as needed, and it keeps track of previously computed results to avoid unnecessary work. 

You can manually trigger a recalculation using the `calculate` method, or force an update with `update`.  When you're finished with the component, the `dispose` method ensures that all resources are cleaned up and it unsubscribes from any data streams.  It also makes sure any necessary cleanup actions are executed.

## Class ClientAgent

The `ClientAgent` manages how a client-side agent interacts within the swarm system. Think of it as the core engine for processing messages, executing tools, and keeping track of history. It's built to be reliable, preventing overlapping tasks and handling errors gracefully.

Here’s how it works:

*   **Message Handling:** It receives messages, figures out what tools to use, and then executes them. It ensures that multiple tasks don't run at the same time.
*   **Error Recovery:** If something goes wrong (like a tool failing), it tries to recover – it might retry a tool call or use a placeholder response.
*   **State Management:** The agent keeps track of its own changes and important events (like tool errors or agent switches) using specialized "subjects" that signal updates to other parts of the system.
*   **Connections:**  It relies on other services to handle things like connecting to the swarm, managing the history of interactions, defining available tools, and broadcasting events.

**Key Features:**

*   **Tool Management:**  It resolves available tools, making sure there are no duplicates, and allows for stopping or canceling tool execution.
*   **System Prompt Handling:** It combines static and dynamic prompts to create the context for the agent.
*   **Output Management:** It emits the output after validating it and supports broadcasting agent outputs within a swarm.
*   **History Management:** It lets you flush or add messages to the agent’s history, which is important for resetting the agent or logging actions.

Essentially, the `ClientAgent` acts as a central hub for message processing, error recovery, and communication within the AI agent swarm.

## Class ChatUtils

This component, `ChatUtils`, is like a central manager for handling chat sessions across different AI agents. It's designed to make it easy to start, manage, and end conversations for users or clients.

Think of it as a factory – it creates and organizes chat instances. You can tell it to begin a chat session for a particular client and swarm, send messages within that session, and even listen for when a chat is finished.

To get it working, you can configure it with a specific way to build chat instances and specify callback functions to handle certain events. It also allows you to properly clean up chat resources when they are no longer needed, ensuring efficient operation. Essentially, it provides a structured way to orchestrate chat interactions within your AI agent system.

## Class ChatInstance

The `ChatInstance` class manages a single chat session within an AI agent swarm. It's designed to represent an active conversation and keeps track of its lifecycle. 

When you create a `ChatInstance`, you provide a unique identifier for the client, the name of the swarm the chat belongs to, a function to call when the chat is finished, and optional callback functions for handling specific events. 

The class provides methods to start a chat (`beginChat`), send messages (`sendMessage`), and most importantly, clean up resources when the chat is done (`dispose`). The `checkLastActivity` method helps automatically manage inactive chats, and `listenDispose` allows you to be notified when a chat session ends. Essentially, it provides a structured way to interact with and monitor a chat within the larger AI agent system.

## Class BusService

This class, `BusService`, is the central hub for communication within the AI agent swarm. It's like a post office, managing who's listening for what messages (events) and delivering those messages when they's sent.

You can think of it as providing ways for different parts of the system – like the ClientAgents, Performance tracking, and documentation tools – to talk to each other using a standardized event system.

Here's a breakdown of what it does:

*   **Sending messages (Events):** The `emit`, `commitExecutionBegin`, and `commitExecutionEnd` methods allow different components to broadcast information. `commitExecutionBegin` and `commitExecutionEnd` are shortcuts for `emit`, specialized for tracking execution events.
*   **Receiving messages (Subscriptions):** `subscribe` lets components sign up to receive specific types of events, while `once` provides a way to listen for a single instance of an event.
*   **Managing connections:** The `dispose` method cleans up all subscriptions for a client, ensuring resources are released when they’re no longer needed.
*   **Flexible routing:** It supports "wildcard" subscriptions, allowing some events to be sent to all subscribers, and it efficiently reuses connection paths for performance.
*   **Security and logging:** It verifies that clients are authorized to send and receive events and provides detailed logging to aid in debugging and understanding system behavior.

## Class AliveService

This service helps you keep track of which clients are actively participating in your AI agent swarms. It lets you easily signal when a client comes online or goes offline, and importantly, it can optionally save that status information so you don’t lose track even if the system restarts. The `markOnline` and `markOffline` methods are your main tools for updating the status, and they’re designed to work within a specific swarm, associating the status change with a particular method call. The service also uses a logger to record these status changes.

## Class AgentValidationService

The AgentValidationService is responsible for ensuring that agents within the swarm are properly configured and can interact correctly. Think of it as a quality control system for your agents.

It keeps track of registered agents and their associated schemas, dependencies, storage, states, and tools. You can register new agents using `addAgent`, and then retrieve lists of storage, states, and MCP associated with an agent using functions like `getStorageList`, `getStateList`, and `getMCPList`.

The core function, `validate`, checks an agent’s entire configuration, verifying things like its completion, tools, and storage.  It’s designed to be efficient, using techniques like memoization to avoid redundant checks. The service also manages dependencies between agents to ensure compatibility. This validation service works closely with other services, like those handling agent schemas, tools, and storage, to maintain a consistent and reliable agent ecosystem.


## Class AgentSchemaService

The AgentSchemaService is the central place where the system keeps track of all the different types of AI agents that can run within the swarm. Think of it as a library containing blueprints for each agent, defining what they do, what resources they need, and how they interact with the rest of the system.

When a new agent type is added, or an existing one is modified, this service ensures the details are correct and consistent. It uses a registry to store these agent blueprints and provides ways to register new ones, update existing ones, and easily retrieve them when needed.

The service also logs important events related to managing these agent blueprints, which helps with troubleshooting and understanding how agents are being used. It's a key component that enables other services to work with agents in a standardized and reliable way, allowing for flexible and scalable AI agent orchestration.

## Class AgentPublicService

This class, `AgentPublicService`, acts as the main entry point for interacting with agents in the swarm system. It provides a public-facing API, handling common agent operations like creating agents, running commands, committing messages, and cleaning up resources. 

Think of it as a friendly layer on top of the more technical agent connection service. It ensures that every action is properly logged, scoped to specific contexts, and integrated with other services for performance tracking and documentation.

Here's a breakdown of what it does:

*   **Creating and Executing Agents:** It provides methods like `execute` and `run` to command agents, mirroring how client applications would interact. `execute` is for general commands, while `run` is for quick, stateless operations.
*   **Message Management:** Functions like `commitToolOutput`, `commitSystemMessage`, and `commitUserMessage` allow you to add messages to the agent's history. These are useful for tracking conversations, providing instructions, or adding developer notes.
*   **Tool Interactions:** Several methods are specifically for managing tool requests and responses (e.g., `commitToolRequest`, `commitAssistantMessage`).
*   **Cleanup & Control:** Methods like `dispose` and `commitStopTools` handle cleaning up resources and preventing unwanted actions.
*   **Logging & Context:** Every action taken through this service is logged and associated with a specific method and client, making it easier to monitor and debug.



In essence, `AgentPublicService` simplifies agent interaction while maintaining consistency and providing valuable operational context.

## Class AgentMetaService

The AgentMetaService helps manage information about your AI agents, turning it into a visual format like UML diagrams. It essentially builds a map of how agents connect and what they do, allowing for better understanding and debugging of the entire swarm system.

This service takes agent definitions and creates structured representations, which can be detailed or focused on just the relationships between agents. It integrates with other services to provide comprehensive agent documentation, including creating visualizations that can be saved as diagrams. The system can log its actions for more detailed troubleshooting, and prevents circular dependencies when building these agent maps. You can request either a complete overview or a simplified view of how agents interact.

## Class AgentConnectionService

This service manages how AI agents are created, used, and cleaned up within the system. It acts as a central point for getting agents ready to run, executing commands, and tracking their usage.

Think of it as a factory and coordinator for AI agents. When you need an agent, it gets one ready, reusing existing ones whenever possible to save resources. It handles everything from setting up the agent's configuration to tracking its history and managing any related data storage.

The service also provides methods for executing commands, running quick tests, and committing messages to the agent's history. It's designed to be consistent with other parts of the system, ensuring a standardized approach to agent lifecycle management and performance tracking. When you're done with an agent, the service makes sure it's properly cleaned up, freeing up resources for other tasks.

## Class AdvisorValidationService

This service helps ensure your AI advisors are properly defined and ready to be used within the system. It acts like a quality control checkpoint, keeping track of the schemas that describe each advisor. 

You can add advisor schemas using the `addAdvisor` method, essentially registering them with the validation service. The `validate` method then checks if a specific advisor has been registered, making sure everything is set up correctly before it's put into action. Think of it as verifying that each advisor has its instructions and knows what it's supposed to do.

## Class AdvisorSchemaService

This service helps manage and work with advisor schemas, which define the structure and rules for advisors in your system. It’s designed to keep track of these schemas, allowing you to register new ones, update existing ones, and easily retrieve them when needed. The service uses a context service to handle schema-related operations and a logger to keep track of what's happening.

You can register new advisor schemas using the `register` method, update existing ones with the `override` method, and get a specific schema using the `get` method. Think of it as a central repository for your advisor schema definitions. The `validateShallow` property is used to check the very basic requirements of a schema.

## Class AdapterUtils

This utility class offers simple ways to connect to different AI models and services, letting your swarm orchestrate completions across them. It provides pre-built functions to easily interact with popular providers like Hugging Face, Cortex, Grok, Cohere, OpenAI, LMStudio, and Ollama. Each function creates a specialized completion function tailored to the specific API, making it straightforward to integrate different AI models into your agent workflows without needing to handle the underlying API details directly. You can specify the model name and other API-specific parameters when creating these completion functions to customize how your agents communicate with each AI service.

## Class ActionSchemaService

The ActionSchemaService helps keep track of which action tools are available for your AI agents. It's like a registry for your tools. 

You can register new tool names using the `register` function, which logs the event for informational purposes if logging is enabled. 

To see if a particular tool is registered, you can use the `hasTool` function. It also records the check if logging is turned on. This service uses a logger to record important actions, helping you monitor and troubleshoot.

# agent-swarm-kit interfaces

## Interface ValidationResult

This interface represents the outcome of checking if the arguments provided to a tool are valid. It tells you whether the validation passed or failed. 

If everything is good, you'll get back the validated data itself. If there's a problem, you'll receive a descriptive error message explaining what went wrong. Essentially, it's a clear way to know if your tool is receiving the information it needs in the expected format.

## Interface TAbortSignal

This interface helps you signal when an operation should be stopped, similar to how you might cancel a download. It builds on the standard web `AbortSignal` functionality, providing a way to manage and track cancellations in your asynchronous tasks. You can think of it as a standardized way to tell a running process, "Hey, stop what you're doing." It's flexible, so you can add your own custom features if you need something beyond the basic cancellation signal.

## Interface JsonSchema

This describes a JSON Schema, which is a way to define the structure and rules for a JSON object. Think of it as a blueprint for your data.

The `type` property simply indicates what kind of data is expected, like a string or an object.

`properties` lists the specific fields that are expected in your JSON data and what kind of values they should hold. 

`required` tells you which fields are absolutely necessary for a valid JSON object.

`additionalProperties` lets you control how strictly the JSON object must adhere to the defined schema. Setting it to `true` allows extra fields that weren't explicitly listed; setting it to `false` enforces a more rigid structure.

## Interface ITriageNavigationParams

This interface lets you define how a tool behaves during the triage process. You specify the tool's name and a short explanation of what it does. You can also add an optional note for documentation purposes. Most importantly, you can provide a function that decides whether the tool is accessible based on factors like the client ID and the name of the agent it's interacting with. This allows for dynamic tool availability, adapting to different situations and contexts.

## Interface IToolRequest

This interface defines how agents ask the system to run a specific tool. Think of it as a standardized request form. 

It clearly states *which* tool should be used (using the `toolName` property) and provides the necessary information for that tool to work (using the `params` property). 

Essentially, it’s the way agents communicate their needs to the orchestration system, ensuring tools are executed correctly with the right inputs. The system validates these inputs to make sure they match what the tool expects.

## Interface IToolCall

This interface describes a request to use a specific tool within the agent swarm. Think of it as a blueprint for telling the system, "Hey, I need to run this tool with these particular instructions."

Each tool call has a unique ID to keep track of it and a type that currently indicates it’s a function.

Crucially, it contains information about the function itself - its name and the arguments it needs to run correctly. This lets the system know precisely which tool to execute and what data to provide it.

## Interface ITool

This interface describes what a tool looks like within the system. Think of it as a blueprint for functions your AI agents can use.

Each tool has a `type`, which is currently always "function," and detailed information about that function including its `name`, a helpful `description`, and the expected `parameters`. 

This definition allows the AI model to understand what actions are available and how to properly request them. The model uses this information to generate requests, and the system uses it to make sure requests are valid.

## Interface ISwarmSessionCallbacks

This interface lets you listen in on important happenings within your AI agent swarm. You can receive notifications when a new agent connects, when an agent runs a task, when a message is sent, and when a session starts or ends. Think of these notifications as signals that keep you informed about what's going on inside your swarm, allowing you to track progress, log activity, or trigger other actions as needed. You can specify functions to be called when a client connects, a task is executed, a stateless run completes, a message is sent, a session is initialized, or a session is closed.

## Interface ISwarmSchema

This interface defines the blueprint for how a swarm of AI agents is structured and behaves. It lets you configure things like whether the swarm saves its progress, provides a description for documentation, and sets rules for agent access. 

You can specify a default agent to start with, list the available agents, and provide functions to manage the swarm's navigation history and which agent is currently active.  There’s also a way to add your own custom code to be triggered at different points in the swarm’s lifecycle, making it highly adaptable. Essentially, this interface provides the foundation for creating and managing unique AI agent swarms.

## Interface ISwarmParams

This interface defines the essential information needed to set up and run an AI agent swarm. Think of it as a blueprint for creating a swarm – it specifies things like a unique identifier for the client starting the swarm, a way to log activity and track errors, a communication channel for agents to talk to each other, and a directory of the agents that will be participating.  Essentially, it bundles together the necessary configuration and agent details to get the swarm up and running.

## Interface ISwarmDI

This interface acts as a central hub, providing access to all the core components that make up the AI agent swarm system. Think of it as a toolbox filled with services – documentation, communication, performance tracking, and much more – all essential for the swarm to function. It essentially defines all the building blocks needed to manage and orchestrate the swarm, handling everything from agent connections and data storage to policy enforcement and schema validation. By providing these services in a structured way, it simplifies development and ensures a consistent approach to building and managing the AI agent swarm. Each property represents a distinct service offering specific capabilities within the swarm environment.

## Interface ISwarmConnectionService

This interface helps us define how different parts of the AI agent swarm connect and communicate. Think of it as a blueprint for creating connection services that are meant for public use. It's designed to strip away any internal workings, so the visible parts focus on the essential connections and interactions within the swarm. This ensures consistency and clarity for anyone building upon or interacting with the system.

## Interface ISwarmCallbacks

This interface provides a way to listen in on important events happening within your AI agent swarm. Specifically, it lets you know when an agent's role or assignment changes within the swarm, giving you the client ID, the new agent's name, and the swarm's name. You can use this to keep track of what agents are doing and adjust your application accordingly. It's like getting notified whenever an agent takes on a new task or responsibility.

## Interface ISwarm

This interface lets you interact with a group of AI agents working together. You can use it to control how the agents navigate through tasks, manage individual agents within the group, and get the results of their work. 

It allows you to retrieve the most recently used agent, cancel any ongoing output, and get the output from the currently active agent. You can also check which agent is currently active, get a direct reference to that agent, and register new agents to be used later.

The interface also provides methods for setting which agent is currently in charge, sending messages to the overall communication channel, and managing the swarm’s “busy” state, which is helpful for understanding if it’s currently working on something.

## Interface IStorageSchema

This interface describes how a storage component functions within the AI agent swarm. It defines settings like whether data is saved permanently, a descriptive label for documentation, and whether it's shared between agents.

You can customize data retrieval and saving with optional functions for getting and setting data. The interface also specifies the embedding technique used for indexing data, gives the storage a unique name, and allows for custom lifecycle callbacks.

The `createIndex` function lets you define how items are indexed for searching and retrieval. This interface essentially outlines the behavior and configuration options for any storage component used by the swarm.

## Interface IStorageParams

This interface defines how the system manages and interacts with storage. It handles things like connecting to a specific client's storage, calculating similarities between data points, and caching previously computed embeddings to speed up performance. You'll find functions here to create new embeddings for indexing, retrieve cached embeddings, and to log activity and communicate with other parts of the AI agent swarm. It essentially provides the tools needed to manage the persistence and retrieval of data within the overall system.

## Interface IStorageData

This interface describes the basic information held within our system's storage. Every piece of data saved will have a unique `id`, which acts like a name tag to help us find and manage it. Think of it as the primary key for your stored information.

## Interface IStorageConnectionService

This interface lays out the blueprint for how different parts of the system connect to storage – think databases or file systems. It's designed to be a clear, typed definition, ensuring consistency and making it easy to understand what a storage connection service should do. This specific version is stripped down to show only the parts that are meant to be used publicly, keeping the internal workings hidden.

## Interface IStorageCallbacks

This interface lets you listen for important events happening within your data storage. Think of it as a way to be notified when data changes, when someone searches for something, or when the storage itself is being set up or taken down. You can use these notifications to track what’s going on, keep other systems in sync, or perform any necessary clean-up routines. Specifically, you’ll get called when data is updated, when a search is performed, when the storage starts up, and when it shuts down, all with information about who triggered the event and what storage it affected.

## Interface IStorage

This interface lets you manage data within the agent swarm's memory. You can think of it as a way to store and retrieve information that agents need to work together. 

The `take` method searches the memory and pulls back a specific number of relevant results – it's great for finding information similar to a given query. The `upsert` method is for adding new data or updating existing entries, keeping everything synchronized.  Need to get rid of something? Use `remove` to delete an item by its unique ID.  `get` is your go-to for retrieving a specific item.  You can also `list` all items, possibly narrowing down the results using a custom filter. Finally, `clear` empties the entire memory, giving you a fresh start.

## Interface IStateSchema

The `IStateSchema` interface describes how a piece of information, or "state," is managed within the agent swarm. It lets you configure things like whether the state is saved permanently, add a description for clarity, and control whether multiple agents can access the same state.

You can specify a function to generate the initial state value and another to retrieve the current state, providing custom logic if needed. The `setState` function allows you to define how state updates are handled, and you can include middleware to process the state during its lifecycle. Finally, you can register callbacks to respond to specific state events.

## Interface IStateParams

This interface defines the information needed to manage a state within the agent swarm. Think of it as a package of context – it includes a unique identifier for the client using the state, a way to log what's happening, and a communication channel to share updates with the rest of the swarm. Each state instance gets its own set of these parameters, ensuring everything is properly tracked and coordinated. It's all about providing the necessary tools for each state to function correctly and interact with the larger system.


## Interface IStateMiddleware

This interface lets you hook into how the AI agent swarm's internal state is managed. Think of it as a way to step in and adjust or check the state before or after certain actions happen within the framework. You can use it to ensure the state is always in a valid form, or to make changes based on specific conditions. It’s all about giving you control over the data that drives the agent swarm's behavior.

## Interface IStateConnectionService

This interface helps ensure the public-facing parts of your agent swarm orchestration framework are clearly defined and consistent. It’s a blueprint for creating services that manage the state connections, but specifically excludes any internal workings. Think of it as a way to guarantee that what developers see and use is the intended public interface, avoiding confusion and unexpected behavior. It's used to create a specialized version of StateConnectionService that focuses only on the essential, outward-facing features.

## Interface IStateChangeContract

This interface lets you listen for changes in the agent swarm’s state. It provides a notification whenever the swarm transitions to a new state, so you can build systems that respond to these changes, like updating a user interface or triggering new workflows. You can subscribe to this notification to be informed about which state the swarm is currently in.

## Interface IStateCallbacks

This interface lets you listen for important events related to your agent's state – think of it as getting notified about what's happening behind the scenes. You can set up functions to run when a state is first created, when it's being cleaned up, when data is loaded, when it’s read, or when it's updated. These notifications are handy for things like setting up initial configurations, performing cleanup tasks, keeping an eye on data changes, or logging activity. Essentially, it provides a way to react to different stages of your state's lifecycle.

## Interface IState

This interface helps you manage the current condition of your AI agents. You can think of it as a way to keep track of what's happening and how things are progressing.

The `getState` method lets you see the current status, taking into account any special processing or rules that might be in place.

`setState` provides a way to update the status, but it does so by letting you define how the new status should be calculated based on the previous one – this allows for complex and controlled changes.

Finally, `clearState` provides a simple way to reset everything back to the starting point defined in your setup.

## Interface ISharedStorageConnectionService

This interface helps define how different parts of the system interact with shared storage. It acts as a blueprint, laying out the essential methods and properties needed for securely accessing and managing data. Think of it as a standardized way for different AI agents to share information, ensuring everyone is using the same rules and procedures for accessing the shared storage. The goal is to make sure the publicly available functions for working with the storage are clearly defined and consistent.

## Interface ISharedStateConnectionService

This interface helps define how different parts of the AI agent swarm can share information safely. It acts as a blueprint, ensuring that only the necessary information is exposed publicly and keeping internal workings separate. Think of it as a controlled way to pass data between agents, promoting clarity and security within the overall system. It’s used to create a specific implementation that focuses on the public-facing features for shared state connections.

## Interface ISharedComputeConnectionService

This interface defines a service that manages connections to shared computing resources, like virtual machines or containers, ensuring a consistent way for different parts of the system to access them. It builds upon the base `SharedComputeConnectionService`, providing type safety and clarity within the AI agent swarm orchestration framework. Think of it as a standardized way to connect your agents to the processing power they need to function.

## Interface ISessionSchema

This interface, ISessionSchema, is essentially a reserved space for information related to individual sessions within the agent swarm. Right now, it doesn't contain any specific properties, but it’s designed to hold session-specific settings and data as the framework evolves. Think of it as a promise for more detailed session management in the future.

## Interface ISessionParams

This interface outlines all the information needed to kick off a new session within the agent swarm system. Think of it as the blueprint for starting a session – it includes things like a unique identifier for the client using the session, a way to track what's happening (logging), rules and limitations for the session, and how the session communicates with the rest of the swarm. It also specifies the swarm itself and its name, establishing the session's place within the larger system.

## Interface ISessionContext

This interface acts as a central hub for information about a client's interaction with the AI agent swarm. It bundles together key details, including a unique identifier for the client's session and the process running the swarm. 

If a specific method or execution is in progress, you’ll also find related metadata like client details and state information contained within this context. Think of it as a single place to get a snapshot of what's happening in a client's session, whether it's a simple request or a complex workflow. It gives you access to client identifiers, the running process ID, and potentially more details about the method and execution taking place.

## Interface ISessionConnectionService

This interface helps define how different parts of the system connect and communicate during a session. Think of it as a blueprint that ensures the public-facing connection service works consistently and predictably. It’s designed to strip away the internal workings, focusing only on the essential elements that are exposed to the outside world. By using this interface, we can guarantee a clean and reliable connection experience.

## Interface ISessionConfig

This interface lets you define how long a session can run or how often it can be triggered. You can specify a `delay` to control the timing, essentially setting a pause between session executions. 

If you need to clean up anything specific when a session ends, you can provide an `onDispose` function. This function will be automatically called when the session is finished, allowing you to release resources or perform other necessary actions.

## Interface ISession

The `ISession` interface is like the central control panel for a conversation or workflow managed by your AI agent swarm. It provides the tools to send messages, run commands, and manage the overall state of the session. 

You can use it to quietly add messages to the session history without triggering a response, for example when adding context or logging.  There's also a way to completely reset the agent's memory by flushing the session. To halt the sequence of tools being used, you can use `commitStopTools`.

The `notify` function allows you to send messages to listeners.  `emit` sends a general message through the session's channel, while `run` lets you perform quick, isolated tasks without affecting the ongoing conversation. `execute` is the primary way to run commands within the session, and it can update the chat history.

`connect` creates a two-way communication link, allowing messages to be sent and received. You can also explicitly add tool outputs, tool requests, assistant messages, system messages, and developer messages to the session's record.

## Interface IScopeOptions

This interface, IScopeOptions, helps you define how a specific operation within your AI agent swarm will run. You use it to provide a unique identifier, `clientId`, to track the session. It also lets you specify the `swarmName`, so the system knows which pre-configured swarm to use. Finally, you can provide an `onError` function to catch and manage any errors that pop up during the operation, giving you a way to respond gracefully to problems.

## Interface ISchemaContext

This section describes a central hub for accessing different types of schema information used by the AI agent swarm. Think of it as a library where you can find blueprints for how agents work, how they communicate, and how they generate responses. It organizes various schema services – like those defining agent structures, completion methods, and outlines – into a single, easy-to-use collection. This allows different parts of the system to consistently access and utilize these schema definitions.

## Interface IPolicySchema

This interface describes how you configure a policy for your AI agent swarm. It lets you define rules and manage banned clients in a consistent way. 

You can choose to save the list of banned clients permanently, add descriptions for documentation, and give each policy a unique name. The `policyName` is crucial for identifying and managing each rule set.

You can also customize the message shown when a client is banned, or provide functions to generate these messages dynamically.  If you need more control, you can specify how to retrieve, set, or validate client data, and even override the standard validation process for incoming and outgoing messages.  Finally, you can register callbacks to extend the policy's behavior, triggering custom actions during validation or ban events.

## Interface IPolicyParams

This interface defines the information needed to set up a policy, essentially a rule or guideline for your AI agent swarm. It combines the basic policy structure with tools for tracking what's happening and communicating with other agents. 

You'll provide a logger to record events and errors associated with the policy, helping you debug and monitor its behavior. 

Also, you need to specify a communication channel, called a bus, that allows the policy to send and receive messages within the agent swarm.

## Interface IPolicyConnectionService

This interface helps us define how services that manage connections based on policies will work. Think of it as a blueprint – it lays out the essential parts of a policy-driven connection service, but leaves out the internal workings. It's specifically designed to create a public-facing service that focuses on what users can actually do, keeping the complex details hidden.

## Interface IPolicyCallbacks

This interface lets you plug in custom functions that respond to key events within a policy. Think of it as a way to listen in on what's happening with your policy – when it's first created, when it checks incoming or outgoing messages, and when a client is banned or unbanned.

You can provide a function for `onInit` to perform setup tasks when a policy is initialized.  `onValidateInput` and `onValidateOutput` are there to let you monitor or log how incoming and outgoing messages are being checked.  Finally, `onBanClient` and `onUnbanClient` give you hooks to react to when a client is blocked or released.


## Interface IPolicy

This interface defines how your AI agent swarm enforces rules and manages client access. It lets you check if a client is banned, retrieve the reason for a ban, and ensures messages going in and out of the swarm adhere to your defined policies. You can also programmatically ban or unban clients using this interface, giving you granular control over swarm participation. Essentially, it’s the gatekeeper for your AI agents, maintaining order and security.

## Interface IPipelineSchema

This interface outlines the structure for defining a pipeline within the agent swarm orchestration framework. Each pipeline needs a descriptive name, and crucially, a function called `execute` that dictates the steps the pipeline will take when triggered. This `execute` function receives information about the client, the agent involved, and any data needing to be processed.

You can also optionally add `callbacks` to your pipeline. These callbacks let you monitor the pipeline’s progress, respond to errors, or add custom actions at different stages of its run. Think of them as hooks you can use to fine-tune and observe how the pipeline behaves.

## Interface IPipelineCallbacks

This interface lets you hook into what's happening as your AI agent pipelines run. You can define functions to be notified when a pipeline begins, when it finishes – whether successfully or with an error – and when a specific error pops up during the process. Think of it as a way to get updates and react to the lifecycle of your agent workflows. These callbacks provide essential tools for monitoring and troubleshooting your agent orchestrations.

## Interface IPersistSwarmControl

This framework lets you tailor how your AI agent swarm’s data is saved and loaded. You can swap out the standard storage mechanisms for active agents – the agents actively working within the swarm – and for the navigation stacks – the history of where agents have been – with your own custom solutions. 

Think of it like this: the default behavior is a certain way of saving, but if you need something different, like storing agent data in a database instead of a file, or managing navigation stacks in a unique way, you can now plug in your own persistence adapters. This gives you a lot of flexibility in how your swarm’s information is managed, enabling specialized behaviors for different scenarios.

## Interface IPersistStorageData

This interface describes how data is saved and loaded for the agent swarm. Think of it as a container holding the information that needs to be stored – it's essentially a list of data items. This structure is used to ensure that the swarm remembers important details between sessions or when needing to recover from interruptions. It's the building block for reliably preserving the swarm's state.

## Interface IPersistStorageControl

This interface lets you plug in your own way of saving and loading data for a specific storage area. Think of it as swapping out the default saving mechanism with something tailored to your needs, like using a database instead of a simple file. You provide a blueprint for your custom saving tool, and this interface handles integrating it into the system. It gives you fine-grained control over how data is persisted.

## Interface IPersistStateData

This interface describes how to save and load information needed by the swarm, like settings or the status of a conversation. Think of it as a container for whatever data an agent needs to remember. The `state` property simply holds that data, and it can be any type of information relevant to the agent's operation. It's used behind the scenes to handle saving and retrieving this data.

## Interface IPersistStateControl

This interface lets you tailor how the system saves and retrieves agent states. Think of it as a way to plug in your own storage solution, like a database, instead of relying on the default method. You can use it to manage state data specifically for certain agents, allowing for more advanced or specialized storage needs. This gives you greater control over how agent information is handled and preserved.

## Interface IPersistPolicyData

This interface describes how information about banned clients is stored within the swarm system. Essentially, it's a way to keep track of which client sessions (`SessionId`) are blocked from participating in a particular swarm (`SwarmName`). The core of this data is a list of those banned session IDs.

## Interface IPersistPolicyControl

This interface lets you plug in your own way of saving and loading policy data for a specific swarm. Think of it as a way to customize how the system remembers what policies are active for each swarm. You can use it to store policies in a database, a file, or even just keep them in memory – whatever works best for your needs. By providing your own persistence adapter, you're essentially taking control of how the system handles policy data storage.

## Interface IPersistNavigationStackData

This interface outlines how we keep track of the agents you're interacting with as you navigate within an AI agent swarm. Think of it as a history log for your session. The `agentStack` property holds a simple list of agent names, allowing the system to remember the order in which you've been working with different agents. This helps when you want to go back to a previous agent or understand your navigation path within the swarm.

## Interface IPersistMemoryData

This interface describes how memory information is stored within the agent swarm. Think of it as a container holding whatever data an agent needs to remember, like the details of a conversation or the result of a calculation.  The `data` property inside this container holds the actual information being saved, and it can be any type of data relevant to the agent's tasks. This standardized format makes it easy for the system to manage and retrieve that memory later.

## Interface IPersistMemoryControl

This interface lets you customize how memory data is saved and retrieved. Think of it as a way to plug in your own system for managing memory, rather than relying on the framework's default. You can use this to store memory in a database, a file, or even just keep it in the program's memory – whatever best suits your needs. By providing your own persistence adapter, you're essentially swapping out the way memory is handled for specific session identifiers.

## Interface IPersistEmbeddingData

This interface describes how embedding data – those numerical representations of text or other data – is stored within the swarm system. Think of it as a way to remember what concepts are related to each other. It holds a list of numbers, forming a vector, which represents the embedding for a specific piece of information identified by a unique string hash and a descriptive name. Essentially, it's a container for the numerical “fingerprint” of a particular data point.

## Interface IPersistEmbeddingControl

This interface lets you take control of how embedding data is saved and retrieved. By default, the system handles embedding persistence, but if you need something different—like storing embeddings in a custom database or just keeping track of them temporarily—you can plug in your own persistence adapter. This adapter will manage the saving and loading of embedding data associated with a specific embedding name. It's useful for situations where you want to customize how embedding information is managed, perhaps for testing or integrating with external systems.

## Interface IPersistBase

This interface provides the basic tools for saving and retrieving data persistently within the agent swarm system. Think of it as the foundation for remembering things like agent states or memory.

It handles setting up the storage area, ensuring everything is in good shape before the system starts. You can use it to check if a specific piece of data already exists, read existing data by its unique identifier, or save new data to the storage. The saving process is designed to be very reliable, protecting against data corruption.

## Interface IPersistAliveData

This interface helps keep track of which clients are currently active within your AI agent swarm. It's a simple way to mark a client as online or offline, associating that status with a specific swarm. Essentially, it lets you know if a client is still connected and participating. The key information it holds is whether a client, identified by its session ID, is currently online or not within a particular swarm.

## Interface IPersistAliveControl

This interface lets you customize how the system keeps track of whether an AI agent swarm is still active. Think of it as a way to plug in your own method for saving and retrieving the "alive" status of a swarm. You can use this to, for example, store this status in a database instead of using the default approach, or to create a temporary in-memory solution for testing. By providing your own persistence adapter, you have complete control over where and how this critical information is managed.

## Interface IPersistActiveAgentData

This interface describes the information needed to keep track of which agent is currently active for each client participating in a swarm. It essentially links a client to a specific agent within a larger swarm system. The `agentName` property holds the identifier of that active agent, like "agent1," allowing the system to know which agent is responsible for a client's actions. This data helps the framework remember the agent state when needed.

## Interface IPerformanceRecord

This interface helps track how well a specific process is running within the system. Think of it as a report card for a task, gathering data from all the clients involved.

It records key details like the process's unique ID, a list of performance records for each individual client, and overall metrics like the total number of executions, total and average response times, and timestamps. These timestamps use a combination of days since a starting point and seconds since midnight for precise tracking. The date is also recorded in a standard UTC format for easy understanding and reporting. It’s designed to give you a clear picture of process efficiency and pinpoint any performance bottlenecks.

## Interface IPayloadContext

This interface, `IPayloadContext`, acts as a container for information related to a task being processed. Think of it as a package that holds both the data for the task itself (the `payload`) and information about *who* requested it – specifically, a unique identifier called `clientId`. This helps track and manage tasks from different clients or sources. Essentially, it provides a structured way to bundle everything needed for a task's execution, keeping related details together.


## Interface IOutlineValidationFn

This type describes a function that checks if an outline operation is set up correctly. Think of it as a quality control step – it takes the details of what needs to be done and the data involved, and determines whether everything is valid and ready to proceed. It's used to ensure that the outline system operates reliably and avoids errors caused by incorrect data or configurations.

## Interface IOutlineValidationArgs

This interface helps you pass information needed to check if something is correct within your AI agent workflow. Think of it as a package containing both the initial input and the result of a previous step – the "data." This "data" holds the information you want to make sure is valid, like structured results from a task. It's designed to simplify passing everything needed for validation checks in a clear and organized way.

## Interface IOutlineValidation

This interface describes how to set up checks for your AI agent outlines. Think of it as defining rules to make sure the outline data is correct and useful. You specify a `validate` function – this is the actual logic that performs the check. Optionally, you can add a `docDescription` to explain what that validation is doing, which is really helpful for understanding and maintaining the system. You can even chain validations together or reuse them.

## Interface IOutlineSchemaFormat

This interface describes how an outline is structured using a JSON schema. Think of it as a way to tell the system exactly what shape the data should take. It has two key parts: a "type" that identifies this as a JSON schema format, and the actual JSON schema object itself, which contains all the rules for how the outline should be built. This helps ensure everyone’s on the same page about the data’s format.

## Interface IOutlineSchema

This interface, `IOutlineSchema`, helps you define how an outline operation will work within the system. Think of it as a blueprint for creating structured data.

You're able to specify the prompt that will be sent to an AI model to generate the outline, along with system prompts to give the model context and instructions. There's also space for a description that makes it easier to understand what the outline is intended to do.

The `IOutlineSchema` lets you set up validations to ensure the generated data is correct and follows a defined format. You can even control how many attempts the system will make if something goes wrong. Finally, it includes a way to customize certain steps in the outline generation process with callback functions.

The `getOutlineHistory` method is responsible for producing the actual structured data that the outline represents, taking into account previous attempts and any associated parameters.

## Interface IOutlineResult

This interface describes what you get back after running an outline operation, like generating a plan or structure. It tells you if the operation was successful, provides a unique ID for tracking it, and gives you a record of what happened during the process—including any user inputs, assistant responses, and system messages. You're also given the original input parameters and the data that was produced, if any. Finally, it keeps track of how many times the operation was attempted.

## Interface IOutlineObjectFormat

This interface defines how your outline data should be structured, acting as a blueprint for its format. Think of it as a rulebook ensuring everyone's on the same page about the data's shape. 

It tells you what the overall type of the outline is (like whether it's a JSON object), lists the properties that absolutely must be present, and then details what each property should look like – its data type and what it represents. You can even specify allowed values for certain properties using an enumeration. This ensures consistency and clarity when working with outline data.

## Interface IOutlineMessage

This interface defines the structure of a message within the system, essentially how interactions are recorded. Each message has a `role` indicating who sent it – a user, an assistant, the system, or a tool.

Messages can optionally include `images`, either as raw binary data or encoded strings, for things like visual content. The main text or parameters of the message are stored in the `content` property.

If a message is linked to a tool call, information about that call is attached through `tool_calls` and an optional `tool_call_id` allowing for tracking and analysis.

## Interface IOutlineHistory

This interface helps you keep track of the messages used during outline generation. Think of it as a log of what happened. 

You can add new messages to this log using the `push` method, which can handle adding one message at a time or several messages together. If you need to start fresh, the `clear` method will erase everything in the history. Finally, the `list` method allows you to see all the messages that have been recorded so far.

## Interface IOutlineFormat

This interface defines the expected structure for outline data used within the system. Think of it as a blueprint – it tells you what fields are necessary, what data types they should be (like strings or objects), and provides helpful descriptions for each one. It ensures everyone is working with the same understanding of the outline’s format and helps keep the data consistent. The `type` property indicates the overall data structure, `required` lists the essential fields, and `properties` details the specifics of each field's type and purpose.

## Interface IOutlineCallbacks

This interface helps you keep track of what's happening during the outline generation process. You can use the `onAttempt` callback to know when a new attempt starts, which is great for monitoring. The `onDocument` callback lets you work with the generated document as soon as it's available. If the document is successful, the `onValidDocument` callback will notify you, and if it fails validation, `onInvalidDocument` gives you a chance to react, perhaps by triggering a retry. Essentially, these callbacks offer you points to plug in your own logic and respond to different stages of the outline creation.

## Interface IOutlineArgs

This interface defines the information needed when creating an outline – essentially, it’s a container for all the important details. It includes the actual input parameter you want to outline, a counter to keep track of how many times we’ve tried outlining it (helpful if things need to be retried), and the desired format for the output. You'll also find the history of messages related to this outlining process, which can be useful for debugging or understanding how the outline was generated.

## Interface IOutgoingMessage

This interface describes a message being sent out from the orchestration system, acting as a way to relay information back to a client, often an agent. Think of it as a notification or a result being passed along.

Each message has a `clientId`, which is like an address – it tells the system exactly which client should receive the information. The `data` property holds the actual content of the message, such as the processed result or a response from an agent. Finally, `agentName` identifies which agent is responsible for sending the message, providing context about its origin.

## Interface IOperatorSchema

This function lets you link your AI agents to an operator dashboard. Think of it as creating a bridge so a human operator can see what the agents are saying and, if needed, step in and take over the conversation. It allows you to monitor agent interactions and potentially intervene when necessary. The function takes a client identifier and the agent's name to establish the connection and then provides a way to pass messages back and forth between the agent and the operator.

## Interface IOperatorParams

This interface, `IOperatorParams`, defines the essential tools and information needed to run an agent within our AI agent swarm. Think of it as a configuration package for each agent. 

It includes the agent's name, a client identifier for tracking, and logging and messaging services to help it communicate and keep track of its actions. The `history` component is particularly important; it allows the agent to remember past interactions, maintaining context and providing a record of conversations.

## Interface IOperatorInstanceCallbacks

This interface lets you listen in on what's happening with individual agents within your swarm. You can register functions to be called when an agent starts up (`onInit`), provides an answer (`onAnswer`), receives a message (`onMessage`), shuts down (`onDispose`), or sends a notification (`onNotify`). Each of these functions receives information about the client, agent name, and relevant data associated with the event. It's a way to react to and potentially influence the behavior of your agents in real-time.

## Interface IOperatorInstance

This interface defines how you interact with a single agent within a swarm. Think of it as the doorway to controlling one agent.

You can use `connectAnswer` to set up a way for the agent to send you responses.  The `answer` method lets you send information back to the agent.  `init` gets the agent ready to go, establishing the necessary connections.  You can also use `notify` to send messages that aren't necessarily answers. `recieveMessage` allows you to get information from the agent.  Finally, `dispose` gracefully shuts down the agent's connection when you're finished with it.

## Interface IOperatorControl

This interface provides a way to manage and customize how operators within your AI agent swarm behave. You can use it to define what actions operators should take and how they should interact with the system. 

Specifically, `useOperatorCallbacks` lets you register functions that will be called by the operators at certain points in their lifecycle, allowing you to hook into their actions. `useOperatorAdapter` gives you the ability to swap out the default operator implementation with your own, providing full control over its functionality. This helps tailor your agent swarm to very specific needs.

## Interface INavigateToTriageParams

This interface helps you fine-tune how your agent swarm navigates to a triage agent. You can customize different stages of this process with optional functions.

Before moving to the triage agent, you can run a `beforeNavigate` function to perform checks or run custom logic. The `lastMessage` function allows you to modify the previous user message to provide better context for the new agent.

If navigation fails, you can use the `flushMessage` to send a message to the user indicating a reset is needed.  If the agent is already on the correct agent, you can use `executeMessage` to continue processing.

Finally, you can use `toolOutputAccept` when navigation is successful and `toolOutputReject` to let the user know navigation wasn't required because they are already at the destination agent.

## Interface INavigateToAgentParams

This interface lets you fine-tune how the system handles moving between different AI agents. Think of it as a set of customizable hooks you can use to control the process.

You can provide functions to run before the move happens (`beforeNavigate`), to give feedback to the AI about the move (`toolOutput`), or to define what happens when the move doesn't quite work out (`flushMessage`). 

There are also hooks to modify the previous user message before the move (`lastMessage`) or to send specific messages to the AI based on whether the move involves an action or just a message (`emitMessage`, `executeMessage`). Essentially, it gives you a lot of control over the agent transition process.

## Interface IModelMessage

This interface defines the structure of a message used throughout the agent swarm system. Think of it as a standardized way for agents, tools, users, and the system itself to communicate.

Each message has a `role` indicating who or what sent it – whether it’s a response from the AI assistant, a message from a tool, something initiated by the user, or a system notification. The `agentName` identifies which agent is involved.

The core of the message is the `content`, which is the actual text or data being transmitted.  There's also an `mode` that specifies whether the message originated from user input or a tool.

Messages might also include details about tool calls (`tool_calls`, `tool_call_id`), images, or a custom `payload` for extra information. This structure allows for a detailed record of interactions and helps keep track of the entire conversation flow across multiple agents.

## Interface IMethodContext

This interface, `IMethodContext`, provides a standard way to track details about a method call within the AI agent swarm. Think of it as a little packet of information that travels along with each method execution. It includes things like the client's session ID, the name of the method being called, and the names of the agents, swarms, storage, state, compute, policy, and MCP resources involved. Different services like the ClientAgent, performance tracking, logging, and documentation tools all use this context to understand and monitor the method calls happening within the system.

## Interface IMetaNode

This interface, `IMetaNode`, helps organize information about the agents in your swarm. Think of it as a way to build a family tree or diagram showing how agents relate to each other and what resources they use. Each node in this tree has a `name`, which identifies the agent or resource it represents, like "AgentA" or "DatabaseConnection".  It can also have `child` nodes, which represent agents or resources that depend on it, creating a hierarchical structure to visualize complex relationships within the swarm. This structure is particularly useful for understanding agent dependencies and for creating visual representations like UML diagrams.

## Interface IMCPToolCallDto

This interface defines the structure of data used when a tool is called within the agent swarm system. Think of it as a message passed around to keep track of who's calling what tool and with what instructions. 

It includes details like a unique ID for the tool itself, who's making the request (the client), the name of the agent involved, and the specific parameters being passed to the tool. There’s also a way to cancel an operation mid-way, and a flag to indicate whether this call is the final one in a series of related calls. You’ll find an array to manage multiple related tool calls bundled together.

## Interface IMCPTool

This interface outlines the structure of a tool used within the AI agent swarm orchestration framework. Every tool needs a `name` to identify it and a way to understand what kind of data it expects – this is handled by the `inputSchema`. The `description` is a friendly explanation of what the tool does, helpful for understanding its purpose. The `inputSchema` specifies what kind of data the tool needs to work, acting like a blueprint for the input it accepts.

## Interface IMCPSchema

This interface describes the blueprint for a Managed Control Process (MCP), essentially defining how an AI agent within a swarm will operate. Each MCP has a unique name and can optionally include a description for documentation purposes. 

A key function allows the MCP to list the available tools it can use, tailored to a specific client’s needs.  Another crucial function lets you actually *use* those tools, providing a tool's name and specific data for it to process and return a result. Finally, the MCP can also register optional callbacks to be notified about important events happening during its lifecycle.

## Interface IMCPParams

This interface defines the necessary components for managing and tracking your AI agent swarm orchestrations. Think of it as a blueprint that ensures your system has a way to log important events and a communication channel for agents to interact. It requires a logger to record what's happening and a bus to handle messages and coordinate actions within the swarm. This setup allows for better monitoring, debugging, and overall control of your AI agents.

## Interface IMCPConnectionService

This interface defines how your AI agents connect and communicate with the central orchestration system. Think of it as the foundational link enabling agents to receive instructions and report back on their progress. It specifies methods for establishing a secure connection, sending messages to the agents, and receiving status updates from them. Implementing this interface allows your agents to participate in the swarm and receive tasks efficiently. The connection service is crucial for managing the agents' interaction with the broader orchestration framework.

## Interface IMCPCallbacks

This interface defines a set of functions your code can use to listen for and react to important events happening within the AI agent orchestration system. Think of it as a way to be notified when the system is starting up, when a client disconnects, when tools are loaded, or when a tool is actually used. You can hook into these events to perform actions like logging, sending notifications, or updating your application's state. The `onCall` function is especially useful, as it provides details about which tool was used and the data involved in the tool's execution. The `onUpdate` function lets you know when the available tools for a client have changed.

## Interface IMCP

This interface lets you manage the tools available to your AI agents. You can use it to see what tools are offered to a particular agent, check if a specific tool is available, and actually run a tool with the data it needs. There's also functionality to refresh the list of available tools, either for all agents or just one specific agent. This helps keep your agent’s toolkit up-to-date.

## Interface IMakeDisposeParams

This interface defines the settings you can provide when you want to automatically shut down an AI agent session. It lets you specify a timeout – how long the session should run before it's automatically closed. You can also provide a function to be called when the session ends, allowing you to perform cleanup actions or receive notifications that the session has been properly terminated. This helps ensure resources are released and sessions are handled gracefully.


## Interface IMakeConnectionConfig

This interface lets you control how often messages are sent. Think of it as a way to pause or space out communication between agents. The `delay` property specifies how long, in milliseconds, you want to wait before sending the next message. This is useful for preventing agents from overwhelming systems or for coordinating their actions over time.

## Interface ILoggerInstanceCallbacks

This interface provides a way to connect to a logger, letting you react to important events in its lifecycle. Think of it as a set of hooks – you can define functions to be called when the logger starts up, shuts down, or whenever it records a log message (whether it's a debug, info, or regular log). It’s useful for things like monitoring the logger’s status, capturing log data for analysis, or performing cleanup tasks when the logger is no longer needed. Each callback function receives a client ID and a topic, along with any arguments passed to the logging methods.

## Interface ILoggerInstance

This interface defines how a logger should behave within the AI agent swarm system, going beyond simple logging. It allows for controlled setup and cleanup of logging functionality specific to each client. The `waitForInit` method lets you ensure the logger is properly initialized, potentially setting it up asynchronously, and prevents it from being initialized more than once. Similarly, the `dispose` method provides a clean way to release any resources the logger is using when it's no longer needed, potentially triggering a final cleanup action.

## Interface ILoggerControl

This interface gives you ways to control how logging works within the system, particularly for different clients. You can use it to set up a central logging adapter for all operations, customize the lifecycle of individual logger instances, or even define your own way of creating those logger instances. 

It also provides methods to log messages—info, debug, and general log entries—specifically tied to a particular client, ensuring that messages are tracked and validated correctly. Think of it as a toolkit to shape and manage the logging experience for various parts of your application.

## Interface ILoggerAdapter

This interface helps connect our agent swarm system to different logging tools. Think of it as a translator – it provides a standard way to send log messages, whether you’re using a simple console, a fancy database, or a dedicated logging service.

Each method – `log`, `debug`, `info`, and `dispose` – allows you to record different types of information related to a specific client. Before sending anything, the system makes sure everything is set up correctly.

The `dispose` method is used to clean up after a client is finished, releasing resources used for logging.

## Interface ILogger

The `ILogger` interface defines how different parts of the AI agent swarm system record information. It provides simple functions for logging messages at different levels of importance: general messages (`log`), detailed debugging information (`debug`), and informational updates (`info`). These logs track everything from agent actions and policy checks to storage operations and successful completions, helping to understand how the system is working and troubleshoot any problems. Think of it as a way to leave a trail of what's happening under the hood.

## Interface IIncomingMessage

This interface describes a message that comes into the agent swarm system. Think of it as a standardized way to pass information from somewhere outside the system—like a user's request—into the agents that are working within the swarm.

Each incoming message includes the identifier of the client that sent it (so we know where it originated), the actual content of the message itself, and the name of the agent that’s supposed to handle it. This allows the system to correctly route messages to the right agent for processing and track the origin of the data.

## Interface IHistorySchema

This interface describes how your AI agent swarm remembers past conversations. Think of it as defining the storage system for all the messages exchanged between the agents and the user. It focuses on the `items` property, which specifies the adapter – the specific tool – used to actually save and load that history, allowing you to choose different storage methods like a database, local storage, or even a simple array. This lets you customize how your agent swarm’s memory is managed.

## Interface IHistoryParams

This interface defines the information needed to set up and manage a history record for a specific agent within the system. Think of it as a blueprint for how the system remembers what an agent has done. 

It includes details like the agent’s name, a limit on how many messages to store for context, a client identifier, a logger to track what’s happening, and a communication channel for the agent to interact with the rest of the swarm. Each history record uses these parameters to keep a structured log of an agent's interactions.

## Interface IHistoryInstanceCallbacks

This interface defines a set of callbacks that allow you to customize how the history of an AI agent's interactions is managed. You can use these callbacks to fetch the initial messages for an agent, decide which messages are important enough to keep, and react to changes in the message history – whether a new message is added, an old one is removed, or the entire history is being read.  There are also hooks to run code when the history is first created, cleaned up, or when the whole process of reading the history begins and ends. Finally, you can get a direct reference to the history instance itself to interact with it more directly.

## Interface IHistoryInstance

This interface describes how a history component should work within the agent swarm system. Think of it as a way to keep track of conversations or actions performed by each agent.

The `iterate` method lets you loop through all the messages associated with a specific agent, allowing you to review their past interactions. 

`waitForInit` sets up the history for an agent, potentially loading any existing data they might have.

`push` is used to add a new message to an agent’s history.

`pop` retrieves and removes the most recent message from an agent's record.

Finally, `dispose` cleans up the history for a particular agent, giving you the option to erase all the stored information.

## Interface IHistoryControl

This interface lets you fine-tune how history is managed within your agent swarm. You can tell the system which functions to run at different points in a history instance's lifecycle – like when it's created or destroyed – by using `useHistoryCallbacks`.  If you need more control, `useHistoryAdapter` lets you provide your own custom way of building history instances, allowing for tailored behavior.

## Interface IHistoryConnectionService

This interface lays out the public-facing methods for managing historical data connections within the AI agent swarm. Think of it as a blueprint for how developers can interact with the system to access and potentially modify historical records. It’s designed to clearly define what actions are available without exposing any internal workings, ensuring a stable and predictable interface for everyone using the framework. By providing this type definition, it guarantees that the publicly accessible history service behaves as expected.

## Interface IHistoryAdapter

This interface helps you connect to different ways of storing conversation history – think databases, files, or even in-memory lists. It provides a standard way to add new messages to the history, retrieve the most recent message, clear out history for a specific conversation, and go through all the messages in a conversation step-by-step. Essentially, it lets your AI agent swarm keep track of what’s been said and manage that information regardless of where it's stored.

## Interface IHistory

This interface helps you keep track of all the messages exchanged with an AI model, whether they're part of a specific agent's conversation or just general usage. You can add new messages using the `push` method, and retrieve the most recent message with `pop`. Need to prepare the message history for a particular agent? The `toArrayForAgent` method lets you format it specifically for them, using a prompt and system messages. And if you just need all the raw messages in sequence, `toArrayForRaw` provides that for you.

## Interface IGlobalConfig

This section defines global configuration settings that control how the AI agent swarm system functions. Think of it as a central control panel for core behaviors like tool handling, logging, and history management. Many aspects, like how the system recovers from errors or how tool calls are processed, are influenced by these settings.

You can customize these settings using `setConfig` to tailor the system to specific needs.

**Error Handling & Recovery:**

*   **`CC_TOOL_CALL_EXCEPTION_FLUSH_PROMPT`:**  If a tool call fails, this prompt is used to reset the conversation. This is helpful for troubleshooting, especially with specific language models.
*   **`CC_TOOL_CALL_EXCEPTION_RECOMPLETE_PROMPT`:**  When a tool call goes wrong, this prompt helps the system retry and correct the call.
*   **`CC_RESQUE_STRATEGY`:**  Determines how the system handles issues during model execution ("flush," "recomplete," or "custom").

**Conversation History & Logging:**

*   **`CC_KEEP_MESSAGES`:** Limits the number of messages stored in the conversation history.
*   **`CC_AGENT_SYSTEM_PROMPT`:**  Allows you to add specific instructions for agents to their conversation history.
*   **`CC_LOGGER_ENABLE_DEBUG` & `CC_LOGGER_ENABLE_INFO`:** Control the verbosity of logs - you can enable more details for debugging.

**Agent Behavior and Tool Calls:**

*   **`CC_MAX_TOOL_CALLS`:** Restricts the number of tool calls allowed in a single run.
*   **`CC_AGENT_OUTPUT_TRANSFORM`:**  Removes unwanted tags (like "tool\_call") from agent responses to clean up the output.
*   **`CC_DEFAULT_AGENT_TOOL_VALIDATE`:** Validates tool parameter before call it.

**Swarm Management:**

*   **`CC_SWARM_DEFAULT_AGENT`:**  Determines the default agent selected for a swarm.
*   **`CC_SWARM_DEFAULT_STACK`:**  Defines the initial navigation stack used by a swarm.

**Storage and Caching**

*   **`CC_PERSIST_MEMORY_STORAGE`:** Enables persistent storage of schema data.
*    **`CC_PERSIST_EMBEDDING_CACHE`:** Will allow to reduce costs while using openai embeddings cache

**Other Utility Functions**

*   **`CC_NAME_TO_TITLE`:** Converts names to a more readable format.
*   **`CC_DEFAULT_OPERATOR_TIMEOUT`:** Enables operator timeout

These settings provide a foundation for the AI agent swarm's core functionalities, allowing for significant customization of its behavior.


## Interface IFetchInfoToolParams

This interface defines how to set up a tool that can retrieve information for an AI agent, acting as a read-only resource. You'll provide a name for the tool, and crucially, a function that describes what the tool does – including its name, what it does, and what parameters it expects. 

You can also add notes to help the AI understand the tool's purpose.  There's an optional way to control when the tool is usable, based on the client and agent involved. Finally, you can set up a check to confirm that the input parameters are correct before the tool actually tries to fetch any information.

## Interface IFetchInfoParams

This interface, `IFetchInfoParams`, helps you define how data is retrieved for your AI agents. Think of it as the recipe for getting the information an agent needs to work with. 

You'll provide a function, `fetchContent`, which is the core of this recipe – it's where you actually get the data. There's also an optional `fallback` function you can use to gracefully handle any errors that might occur while trying to fetch the data. Finally, if the data retrieval comes up empty, `emptyContent` allows you to provide a custom message as the result.

## Interface IExecutionContext

This interface, `IExecutionContext`, acts like a shared notebook for different parts of the swarm system. It holds key information about a single run or task, allowing services like the client agent, performance tracking, and message bus to all stay on the same page. Think of it as a way to link everything together – each execution gets a unique client ID, a unique execution ID, and a process ID to identify where it originated. This consistent labeling allows for detailed tracking and coordination across the whole system.

## Interface IEntity

This interface, `IEntity`, acts as the foundation for everything that's stored and managed within the agent swarm. Think of it as the blueprint for all persistent data—it ensures that every piece of information has a consistent structure.  Specific types of entities, like those tracking alive status or system state, build upon this base to include their own specialized data.

## Interface IEmbeddingSchema

This interface helps you set up how your AI agents understand and compare information. You can tell it whether to save the agents' progress and how to name the embedding method being used.

It defines functions for storing and retrieving pre-calculated embeddings, allowing the system to avoid repeating calculations. You can also customize how embeddings are created and compared by providing your own callback functions.

The `createEmbedding` function is used to generate embeddings from text, and `calculateSimilarity` measures how alike two embeddings are – crucial for things like finding similar documents or choosing the best agent for a task.

## Interface IEmbeddingCallbacks

This interface lets you tap into what's happening behind the scenes when your AI agents are working with text and creating numerical representations of it – embeddings. You can use it to keep track of when new embeddings are generated, getting information like the original text, the embedding values themselves, and details about which client and embedding name were involved. Similarly, you can monitor the comparisons between different embeddings, seeing which texts are considered similar and how that similarity is measured, again with helpful details about the context of the comparison. This lets you build custom monitoring, debugging, or even adaptive learning systems around your embedding processes.

## Interface ICustomEvent

This interface lets you create and send custom events within the system, giving you a lot of freedom to include whatever information you need. Think of it as a way to communicate specialized details that don’t fit neatly into the standard event formats. You can attach any kind of data you want to these events through the 'payload' property, allowing for very specific and unique messages to be passed around the system. It’s perfect for situations where you need to share user-defined information or track something beyond the usual metrics.

## Interface IConfig

This setting lets you control how detailed your UML diagram will be. When enabled, the diagram will show relationships and dependencies within subtrees of your agent swarm, providing a more complete picture of the system's structure. Disabling it will create a simpler, higher-level view.

## Interface IComputeSchema

The `IComputeSchema` interface defines the structure for configuring a compute unit within the AI agent swarm. It essentially describes what a specific compute task looks like and how it operates. 

You’re telling the system its name, a short description, and whether it’s meant to be shared across the swarm. The `ttl` property sets a time-to-live, specifying how long the data associated with the compute should be kept around. 

The most crucial part is the `getComputeData` function – this is how the system retrieves the actual data that the compute unit processes. Dependencies are listed using `dependsOn`, indicating what other computes need to run first. `middlewares` allows you to add custom logic to the compute's execution, and `callbacks` gives you optional hooks to listen for and react to events related to the compute’s lifecycle, such as updates or changes in data.

## Interface IComputeParams

This interface outlines the essential components needed when you’re setting up a computation process within the system. Think of it as a recipe – you're providing the system with information about who's requesting the computation (the `clientId`), a way to log progress and errors (`logger`), a messaging system for coordination (`bus`), and most importantly, a list of conditions (`binding`) that will trigger a new calculation or data refresh. The `binding` section is particularly important because it allows you to define exactly when your computations should run based on changes in the system's state.

## Interface IComputeMiddleware

This interface defines the structure for middleware components that sit between the orchestration engine and the AI agents. Think of it as a way to inject custom logic – perhaps for logging, data transformation, or rate limiting – into the communication flow with your agents.  Any class that implements `IComputeMiddleware` must provide a `compute` function; this function takes agent input and output, allowing you to modify or observe the data as it moves through the system.  Essentially, it’s a powerful tool for customizing how your agent swarm interacts with the core orchestration.


## Interface IComputeConnectionService

This interface helps manage connections to computing resources needed by your AI agents. Think of it as a standardized way to link your agents to the infrastructure they need to run, ensuring everything works together smoothly. It builds upon an existing ComputeConnectionService to make sure the types and data structures are consistent across your system.

## Interface IComputeCallbacks

This interface lets you define callbacks to be notified about different stages of a compute's lifecycle. You can use `onInit` to run code when a compute is first set up, and `onDispose` to clean up resources when it's no longer needed. The `onCompute` callback gets triggered when a compute needs to process some data. If a compute needs to recalculate something, you'll receive a notification through `onCalculate`. Finally, `onUpdate` is called whenever the compute's data or settings are modified, providing a way to react to changes in real-time.

## Interface ICompute

The `ICompute` interface defines how you interact with a compute component within the agent swarm. It lets you trigger calculations with `calculate`, updating the compute's status with `update`, and retrieving the result of the computation using `getComputeData`. Think of `calculate` as sending a request to run a specific task, `update` as providing feedback on its progress, and `getComputeData` as getting the final answer. This interface allows you to manage and monitor the computation process within the swarm.

## Interface ICompletionSchema

This interface lets you define how your AI agents within the swarm generate responses – essentially, how they "complete" a task or thought process. You'll use it to name each completion method and customize its behavior.

You can specify flags to pass directly to the language model, like disabling certain thinking processes. 

It also allows you to set up callbacks so you can respond to events after a completion happens, giving you more control over the overall workflow.

Finally, the `getCompletion` method is how you actually trigger a response generation based on the defined configuration and some input arguments.

## Interface ICompletionCallbacks

This interface lets you define what happens after an AI agent completes its task. You can use the `onComplete` callback to react to the finished work—maybe you want to record the result, adjust settings based on the output, or start another process automatically. It gives you a way to tie into the completion process and make things happen afterwards. The callback receives information about the completion itself and the actual output from the AI model.

## Interface ICompletionArgs

This interface defines the information needed to ask the system to generate a completion, like a response to a question or a continuation of a task. You’ll provide a unique identifier for your application (`clientId`), specify which agent you're interacting with (`agentName`), and optionally indicate an `outlineName` if the completion should follow a specific JSON structure. 

The `messages` property holds the conversation history – what’s already been said – to give the system the context it needs. If the agent has access to tools, you can list them in the `tools` array. Finally, `format` allows you to further refine the expected structure of a JSON completion.

## Interface ICompletion

This interface defines how your AI agents can request and receive responses from language models. Think of it as the standard way agents talk to the AI to get their work done. It provides all the necessary methods and properties to ensure consistent and reliable communication, letting you build complex AI agent workflows with ease.

## Interface ICommitActionToolParams

This interface defines how to set up a tool that can make changes and affect the system's state – think of it as a way to let an AI agent directly interact with and modify something. 

You’re essentially describing the tool’s identity with a `toolName`.  The core of the tool is defined by its `function`, which includes a name, description, and the expected parameters for it to work.  You can also add a `docNote` to provide extra information about the tool.  Finally, an optional `isAvailable` function lets you control when the tool can be used, based on things like the client and agent involved.

## Interface ICommitActionParams

This interface helps you set up how actions are performed, especially when those actions modify some state. Think of it as defining the rules and procedures for a specific task. 

You can provide functions to check if the action parameters are correct before it’s executed, and to handle any errors that might occur during the process. There's also a way to define what happens if the action doesn’t produce any results – you can provide a custom message to be used. Finally, you can define success and failure messages that will be used after the action is completed, which will be displayed as tool output.

## Interface IClientPerfomanceRecord

This interface defines how we track performance details for each individual client, like a specific user session or agent. It collects information about how much memory and data is being used, how many operations are being performed, and how long those operations take.

Each client record includes a unique identifier (`clientId`) so we can easily link the performance data back to the originating session or agent. You'll find details on things like session memory (`sessionMemory`), persistent state (`sessionState`), the total number of executions (`executionCount`), and the amount of data processed for inputs and outputs (`executionInputTotal`, `executionOutputTotal`).

We also capture timing information, including total execution time (`executionTimeTotal`) and the average time per execution (`executionTimeAverage`), which is crucial for identifying bottlenecks and optimizing performance. This data allows us to understand precisely how each client is impacting the overall system performance.

## Interface IChatInstanceCallbacks

This interface defines a set of callbacks that allow you to be notified about key events happening within a chat instance managed by the AI agent swarm orchestration framework. You'll receive updates when a chat is initialized, when it's finished, and when messages are sent. Specifically, `onInit` lets you know when a new chat instance starts, `onDispose` signals when it's being shut down, `onBeginChat` announces the beginning of a conversation, and `onSendMessage` is triggered each time a message is transmitted. You also get information about activity status through `onCheckActivity`, including whether an agent is active and the timestamp of its last activity.

## Interface IChatInstance

This interface represents a single chat session within your AI agent swarm. Think of it as a container for one conversation happening between agents. 

You use the `beginChat` method to start a new conversation. To keep things running smoothly, `checkLastActivity` lets you periodically verify the chat is still active. When you have a message to send, `sendMessage` handles delivering it.  When the chat is finished, `dispose` cleans up the resources associated with it. Finally, `listenDispose` allows you to be notified when a chat session is closed, so you can handle any necessary cleanup or updates on your end.

## Interface IChatControl

This API lets you configure how your AI agent swarm interacts and communicates. Specifically, you can tell the system which class to use for creating chat instances, essentially defining the underlying technology handling the conversations. 

You also have the ability to customize the system’s behavior by providing callback functions, allowing you to react to certain events within the chat process. This lets you inject your own logic and responses based on what’s happening in the agent swarm's conversations.

## Interface IChatArgs

This interface, `IChatArgs`, defines the information needed to send a message to an AI agent. It's essentially a container for what you want the agent to know. You provide the core message content through the `message` property, which is a simple text string. If your message includes images, you can also include an array of image data using the `images` property. This allows you to provide visual context alongside your text.

## Interface IBusEventContext

This interface provides extra information about what's happening within the agent swarm system. Think of it as a way to label events with details about the agents, swarms, storage, states, compute resources, or policies involved.

When an agent sends an event, it often includes its own name (agentName) to help track its activity. Other fields, like swarmName, storageName, stateName, computeName, and policyName, are mainly used for events happening at a larger system level, not typically filled in by individual agents. Basically, it's a toolkit for providing context around various system events, helping to understand where and why things are happening.

## Interface IBusEvent

This interface defines the standard format for messages sent between different parts of the agent swarm system. Think of it as a structured way for agents and other components to communicate.

Each message contains information about where it's coming from (the `source`), what it's about (`type`), any data it's carrying (`input` and `output`), and some extra details about the situation (`context`).  The `source` consistently indicates it's coming from an agent, while the `type` specifies the action being performed – like running a function or committing a message.  The `input` and `output` properties hold the relevant data for that action, and the `context` usually includes the agent’s name.

## Interface IBus

The `IBus` interface provides a way for different parts of the system, especially agents, to communicate with each other without needing to know all the details about how the other part works. Think of it as a central messaging system.

Agents use the `emit` method to send notifications about what they're doing. These notifications, or events, are targeted to a specific client, ensuring the right recipient gets the information. Events contain important details like the event type, where it came from, any input data, any results, and metadata about the originating agent.

For example, when an agent finishes a task or produces an output, it uses `emit` to send a message to the client. This keeps everyone informed about the system's progress. The `clientId` is included in both the target and within the event itself for extra certainty. The `emit` function uses a promise, meaning the messages are handled asynchronously, improving overall system responsiveness.

## Interface IBaseEvent

This interface lays the groundwork for all events happening within the agent swarm system. Every event, whether it’s a standard message or something custom, inherits from this base. 

Think of it as the essential building block for communication—it ensures all events have a defined origin ("source") and a target ("clientId"). The "source" tells you where the event came from, like a specific agent or a system component. The "clientId" makes sure the event reaches the right session or agent that needs to handle it. This consistent structure makes it easy for different parts of the system to understand and react to events.

## Interface IAgentToolCallbacks

This interface defines events you can subscribe to when an agent uses a tool. Think of it as a way to listen in on what's happening and react accordingly. 

You can use `onBeforeCall` to run some code *before* a tool is used, like recording what's about to happen.  Similarly, `onAfterCall` lets you run code *after* a tool completes its work, good for cleaning up or logging results. 

`onValidate` provides a chance to check the input parameters to a tool before it’s run, ensuring everything is correct.  Finally, `onCallError` lets you handle situations where a tool fails – log the error or try a different approach. Each of these callbacks gives you control and visibility into the tool’s lifecycle.

## Interface IAgentTool

This interface defines a tool that an AI agent can use, building upon a more general tool definition. Each tool has a name for easy identification and an optional description to help users understand how to use it. You can specify when a tool is available for use, and you can also implement checks to ensure the provided input parameters are valid before the tool runs.

To customize how a tool behaves, you can add lifecycle callbacks. A tool's functionality is described through a `function` property, which can include details about its parameters. The `call` method is the primary way to actually run the tool, passing along information about the client, agent, and the reason for the call.

## Interface IAgentSchemaInternalCallbacks

This interface defines a set of optional hooks you can use to monitor and react to different stages in an agent's lifecycle. Think of them as event listeners that give you insight into what the agent is doing.

You can use `onRun` to be notified when an agent executes without storing its conversation history. `onExecute` lets you know when an agent actually begins processing a request. `onToolOutput` is triggered whenever a tool used by the agent generates some output, while `onSystemMessage` alerts you to any messages the system itself produces.

If you need to track developer interactions, `onDeveloperMessage` is available. `onToolRequest` fires when the agent decides to use a tool, and `onToolError` handles any errors that occur during tool usage.

`onAssistantMessage` provides insight into the agent's responses, and `onUserMessage` notifies you when a user message is received.  `onFlush` tells you when the agent's memory of past conversations is cleared. `onOutput` is a more general callback for agent output, and `onResurrect` alerts you when an agent recovers from a pause or problem. 

Initialization and cleanup are also covered: `onInit` triggers when an agent is first created, and `onDispose` when it’s being shut down. Finally, `onAfterToolCalls` lets you know when a series of tool usages is complete.

## Interface IAgentSchemaInternal

This interface defines the blueprint for how an agent within the swarm will behave and function. It outlines all the key settings, from its name and primary instructions to the tools and data it can access.

You can specify a name for the agent and give it a description to help users understand its purpose. It dictates how the agent responds, including what prompts it follows and whether it’s designed to hand off conversations to a human operator.

The configuration includes settings for managing the number of tool calls and messages to maintain context, as well as options to customize its behavior through callback functions. This lets you precisely control the agent's tools, how it handles data, and how it interacts with other agents in the swarm. You can also define what validations and transformations the agent's output will undergo before it's finalized.

## Interface IAgentSchemaCallbacks

This interface lets you hook into different moments in an agent's lifecycle. You can register functions to be notified when an agent starts running, when it uses a tool, when it produces system messages, or when it's initialized or disposed. It’s a way to observe and potentially influence the agent’s behavior without directly modifying its core logic, offering flexibility for monitoring, logging, or custom integrations. Specific callbacks exist for tool requests, assistant and user messages, and even for situations like when an agent is resurrected after a pause. You can also be notified when an agent’s memory is cleared or when it finishes processing a series of tool calls.

## Interface IAgentSchema

This interface, `IAgentSchema`, defines the structure for describing an individual agent within a swarm. Think of it as a blueprint for creating agents.

It allows you to specify the initial instructions given to each agent using the `system` property – this could be a single string or an array of strings. `systemStatic` serves as another way to provide these initial instructions, effectively acting as an alias for `system`.

For more complex setups, the `systemDynamic` property lets you define instructions that change based on the agent's client ID and name. This means the system prompt can be customized on the fly, allowing for more adaptable and personalized agent behavior.


## Interface IAgentParams

This interface defines the information needed to run an individual agent within the larger orchestration system. Think of it as a configuration package that tells the agent how to operate. It includes things like a unique client ID, a way to log activity, communication channels for interacting with other agents, tools the agent can use, a way to track past interactions, and a mechanism for generating responses.  There’s also a validation step to ensure the agent’s output is correct before it's considered finished. Essentially, this interface holds all the context an agent needs to do its job effectively.

## Interface IAgentNavigationParams

This interface defines the settings you use to tell your agents how to move between each other and use tools. It lets you specify the name and description of a new tool, along with the agent it should navigate to. You can also add a helpful note to explain the tool's purpose and provide a function to dynamically control whether a tool is accessible based on the client and agent involved.

## Interface IAgentConnectionService

This interface helps define how different agents connect and communicate within the system. It's designed to ensure that the parts of the agent connection service that are meant for public use – the parts other components interact with – are clearly defined and consistent. Think of it as a blueprint for creating agent connection services, focusing on the features that are exposed to the outside world while keeping internal workings separate.

## Interface IAgent

This interface describes how you interact with an agent within the system. You can use the `run` method to quickly test what an agent will do with a given input without affecting its ongoing memory. The `execute` method is used to actually run the agent and potentially update its history.

To manage the agent's internal workings, you have several methods. `commitToolOutput` lets you record the results from tools the agent uses. You can add system messages, messages for developers, or regular user messages to the agent’s history.  `commitToolRequest` is used to log and process tool requests the agent makes.

You can also control the agent's behavior by flushing its memory with `commitFlush`, stopping ongoing tool execution with `commitStopTools`, unlocking the execution queue with `commitAgentChange`, or cancelling output with `commitCancelOutput`. These methods provide fine-grained control over the agent's lifecycle.

## Interface IAdvisorSchema

This interface, `IAdvisorSchema`, defines the structure for an advisor within the AI agent swarm. Think of it as a blueprint for how each advisor should be set up. 

Each advisor needs a descriptive name (`advisorName`) so you can easily identify it. You can also provide a `docDescription` to explain what the advisor does. 

Optionally, you can include `callbacks` to hook into specific advisor actions.

Finally, every advisor has a `getChat` method, which is the core function it uses to generate responses based on the input provided in `IChatArgs`.

## Interface IAdvisorCallbacks

This interface defines a set of optional callbacks that can be used to receive notifications about events within the AI agent swarm orchestration framework. Specifically, the `onChat` callback is triggered whenever a chat interaction happens, providing you with details about that chat session. You can use these callbacks to monitor activity, log interactions, or react to specific chat events in real-time.
