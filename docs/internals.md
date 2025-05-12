# agent-swarm-kit api reference

![schema](../assets/uml.svg)

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

## Function startPipeline

This function lets you kick off a sequence of tasks, or a "pipeline," using a specific AI agent to handle the work. You tell it which client is requesting the pipeline, what the pipeline is called, and which agent should run it.  You can also provide some data, called a payload, that the pipeline needs to work with. The function will then start the pipeline and eventually return a result, which can be any type of data depending on what the pipeline is designed to produce. Think of it as sending a job request to a team of AI agents to complete a specific task.


## Function scope

This function lets you run a piece of code – like a task or a calculation – inside a defined environment. Think of it as setting up a little sandbox for your code to operate in. 

You provide the code you want to run, and it will execute within this controlled space, potentially using various tools and services. 

You can also customize which tools and services it uses by providing specific settings. If you don’t specify any customizations, it will use the standard tools already set up. This allows you to easily manage and isolate different code executions within your overall system.

## Function runStatelessForce

This function lets you run a message or command through your AI agent swarm immediately, without adding it to the conversation history. Think of it as a way to quickly process one-off tasks or handle data that shouldn’s be part of the ongoing chat. It's designed to be reliable; even if the agent handling tasks has changed or isn't currently active, the command will still be executed. 

You provide the message you want processed and a unique identifier for the client making the request. The system then handles the execution, tracks performance, and keeps things organized behind the scenes to ensure everything runs smoothly and consistently.


## Function runStateless

This function lets you quickly send a message to a specific agent in your system without adding it to the ongoing conversation history. Think of it as a way to run a quick task or process output without cluttering the agent's memory.

It’s useful for situations like handling data from external sources or performing one-time jobs where maintaining a full chat log isn’t necessary. The function confirms the agent is available before running the command, and keeps track of performance details during execution. 

You provide the message content, a unique client identifier, and the name of the agent you want to use. The agent will process the message and return a result.

## Function questionForce

This function lets you directly trigger a question-answering process, bypassing typical chat flow. Think of it as a way to force the system to focus on a specific question and retrieve information. You provide the actual question as a `message`, a unique `clientId` to identify who’s making the request, and the `wikiName` that defines the knowledge base it should pull from. The function will then return the answer it finds.

## Function question

This function lets you send a question to your AI agent swarm. It takes the actual question you want answered, a unique identifier for who's asking, the name of the specific agent you want to handle it, and the relevant knowledge source (like a wiki) it should draw from. The function will then return the agent's response to your question. Think of it as the main entry point for getting answers from your AI agents. 

The `message` parameter holds the question itself. 
`clientId` helps track requests. 
`agentName` directs the question to a particular agent.
`wikiName` points to the knowledge base used for answering.

## Function overrideWiki

This function lets you change how a wiki is set up within the swarm system. Think of it as updating a wiki's blueprint – you can provide new or modified settings to adjust its behavior. This update happens independently, ensuring a fresh start for the configuration change. If logging is turned on, you'll see a record of this change in the logs. You only need to provide the parts of the wiki's setup you want to change, as it can handle partial updates.

## Function overrideTool

This function lets you change how a tool behaves within the agent swarm. Think of it as updating a tool’s definition – you can modify its capabilities or how it interacts with the system. It’s designed to work independently, making sure your changes don't interfere with ongoing processes. If you’re keeping a record of what’s happening, it will log that you're updating a tool. You just provide the new or updated information about the tool, and it handles the rest.

## Function overrideSwarm

This function lets you directly change the blueprint for a swarm, updating its settings with new information or modifications. Think of it as providing a revised plan for how the swarm operates. It makes these changes independently, ensuring a fresh start for the update process. If your system is set up to record activity, this function will also create a log entry detailing the change. You provide a partial schema – you don't need to redefine the entire swarm, just the parts you want to change.

## Function overrideStorage

This function lets you modify how the swarm system stores data. You can use it to change specific aspects of a storage configuration, like its size or access permissions. It’s designed to make these changes independently, ensuring a clear and controlled update process.  Think of it as a way to fine-tune your storage setup without affecting other ongoing operations. The system will record these changes if logging is turned on. You provide a partial description of the desired storage configuration as input.

## Function overrideState

This function lets you change the structure of a state within the swarm system. Think of it as updating a blueprint – you can modify existing parts or add new ones. It's designed to be a clean, isolated operation, ensuring that the changes don't interfere with ongoing processes. You can use it to adjust how the swarm handles data and information, and it will log the change if you have logging turned on. You provide a partial schema with the changes you want to make.

## Function overridePolicy

This function lets you change a policy's settings within the AI agent swarm. Think of it as updating a rule – you can provide a new or modified version of the policy's details, and it will apply those changes. It operates independently to keep things clean and records the change if logging is turned on. You can provide only the parts of the policy you want to change; it doesn't require a complete new policy definition.

## Function overridePipeline

This function lets you modify an existing pipeline definition. Think of it as a way to tweak a pipeline schema – you provide a partial update, and it merges with the original to create a new, adjusted schema. It's handy when you need to make small changes or customize a pipeline without rebuilding it from scratch. You essentially provide the changes you want, and the function combines them with the existing structure.

## Function overrideMCP

This function lets you modify an existing Model Context Protocol (MCP) schema. Think of it as a way to update or add to the structure of information that agents use to communicate. You provide the original MCP schema, and the function returns a new, updated version incorporating your changes. It’s particularly useful for customizing the format of data exchanged within your agent swarm. The input MCP schema defines what you want to change, essentially providing the blueprint for the new structure.

## Function overrideEmbeding

This function lets you change how the swarm understands and represents information – specifically, how it converts data into numerical representations called embeddings. Think of it as modifying the blueprint for how the swarm processes and compares information. You can provide a complete new schema or just a few tweaks to existing settings. This change happens independently of any ongoing tasks, ensuring a controlled update to the system’s understanding of data. The system will keep a record of this alteration if logging is turned on. 

You provide the new or modified embedding schema as input, and the function takes care of applying those changes to the swarm's configuration.

## Function overrideCompute

This function lets you modify an existing compute schema, which describes how your AI agents will perform tasks. Think of it as a way to tweak the instructions or resources given to your agents without completely rebuilding the whole schema. You provide a partial update – only the parts you want to change – and this function merges them with the original schema. It’s useful for making small adjustments or applying common modifications to several schemas.


## Function overrideCompletion

This function lets you adjust how the AI agent swarm generates text, essentially modifying its completion behavior. You can provide a new or partial schema to change specific aspects of the text generation process. It works independently of any ongoing tasks, ensuring a clear and isolated update. The system will record this change if logging is turned on. You supply a set of properties that will be applied to the existing completion schema.

## Function overrideAgent

This function lets you update the blueprint for an agent already running in the swarm. Think of it as modifying an agent's configuration on the fly. You provide a new or partial set of instructions, and this function applies those changes directly. It's designed to be a clean operation, ensuring it doesn't interfere with anything else happening in the system. If you're tracking activity, the system will log that you've made this change.

You specify what you want to change by providing a `agentSchema`, which is a set of properties that will be used to update the agent's configuration.

## Function notifyForce

This function lets you send a message directly out of a swarm session, like an announcement or status update, without triggering any other actions. It's specifically for sessions created using the "makeConnection" setup.

Essentially, you provide a string – that's your message – and a client ID to identify where the message is coming from.

Before sending, the system checks that the session and agent are still valid and active, ensuring the message gets delivered correctly. The system also makes sure the session uses "makeConnection" mode. It's a way to communicate with the swarm, even if things have changed since the session started.

## Function notify

This function lets you send a message out from the AI agent swarm without triggering any further actions within the swarm itself. Think of it as a way to broadcast information – like a simple alert or status update – directly from a specific agent. 

It’s specifically designed for sessions that were initially established using the "makeConnection" method. Before sending the message, the system double-checks that the agent you’re sending it from is still available and hasn’t been replaced. 

You’re required to specify what message to send, a unique ID for the connection sending the message, and the name of the agent that should be sending the notification.


## Function markOnline

This function lets you tell the system that a particular client is now active and participating in a specific group, or "swarm." Think of it as signaling that a worker is ready to receive tasks. You need to provide the unique ID of the client and the name of the swarm it belongs to when you use it. It's a simple way to update the system's view of which clients are currently available.

## Function markOffline

This function lets you tell the system that a particular client is no longer active within a specific swarm. Think of it as updating the system's knowledge about which clients are currently participating. You're essentially telling the framework, "This client, identified by this ID, is offline in this swarm." It’s useful for maintaining an accurate view of your agent swarm's status and ensuring tasks are routed appropriately. You need to provide the client's unique ID and the name of the swarm it belongs to. This action doesn't return any data; it simply updates the system's internal records.


## Function listenEventOnce

This function lets you set up a temporary listener on the swarm bus, reacting to a specific event just once. Think of it as tuning in to hear a single message on a radio station. 

You specify which client you want to listen to (or "all" clients), the name of the event topic, and a filter – this filter determines which events trigger your reaction.  When an event arrives that matches your filter, a callback function executes, processing the event’s information. 

The function handles the technical details, including ensuring your callback runs cleanly and preventing use of reserved event names.  It also provides a way to stop the listener early if needed – a function is returned that you can call to cancel the subscription.

## Function listenEvent

This function lets you tune in to specific messages happening within the agent swarm. You tell it which client or all clients you want to hear from, and which "topic" – or type of message – you're interested in. When a message matching your criteria arrives, a function you provide will be run, giving you access to the message's content. To stop listening, the function returns another function that you can call to unsubscribe. It's designed to keep things orderly, ensuring messages are processed in the right sequence and preventing you from listening to reserved system topics.

## Function hasSession

This function helps you quickly determine if a client has an active session. It checks for a session associated with a specific client ID, essentially verifying if the client is currently connected or recognized. Behind the scenes, it relies on a session validation service to do the actual check. If your system has logging enabled, you’ll also see the function name recorded for debugging purposes. You provide the unique client identifier, and it returns a simple yes or no (true or false) answer about the session’s existence.

## Function hasNavigation

This function helps determine if an agent is involved in guiding a client through a process. It verifies the client and agent are valid, looks at the agent swarm they've joined, and then checks if the agent is on the navigation path for that client. The function keeps a record of these checks if logging is turned on in the system's settings. You provide the unique ID of the client and the name of the agent you want to check.

## Function getUserHistory

This function lets you get a list of messages a specific user has sent during a conversation. 

You provide a unique ID for the conversation, and it returns an array of messages that were specifically from that user. 

Behind the scenes, it gathers all the raw messages and then filters them to only show the user’s contributions. 

It's designed to run cleanly and will log activity if logging is turned on in the system's settings.

## Function getSessionMode

This function lets you check the current operational state of a client session within your AI agent swarm. Think of it as asking, "What's this client doing right now?"

It takes a unique ID for the client session and returns a value indicating its mode – whether it's actively running a session, attempting to establish a connection, or has reached a completed state.

Behind the scenes, this function verifies the session's validity, records what's happening if logging is turned on, and uses a specialized service to determine the correct mode. It's designed to run independently, ensuring a reliable and isolated check of the session’s status.

## Function getSessionContext

This function lets you grab the current session details for your agent swarm. Think of it as getting a snapshot of the environment your agents are operating in. It gathers information like the unique identifier for the client, the process ID, and what methods and execution environments are available. The system automatically figures out the client ID, so you don't need to provide it. It's a quick way to access vital context information without needing to validate anything.

## Function getRawHistory

This function lets you get the complete, unfiltered history of a client's interactions with the agent swarm. It's like pulling up the raw data, exactly as it was recorded during the session. 

You provide the unique ID of the client session, and the function returns an array of messages representing the full history. 

Think of it as a way to see everything that happened, without any modifications or filtering applied. It's useful for debugging or in-depth analysis.

## Function getPayload

This function lets you grab the data being passed around within the system – think of it as retrieving a package that's been sent along. It’s designed to work with any kind of object you're using as your data. If there's no data currently available, it returns nothing (null). Plus, it keeps a record of when it's used, if you're tracking those kinds of things.

## Function getNavigationRoute

This function helps you discover the path a client has taken through an AI agent swarm. It finds the sequence of agents a client has interacted with, represented as a list of agent names. You provide the client's ID and the swarm's name to get this route. Behind the scenes, it uses a navigation service to determine the route and might include logging based on system settings.

## Function getLastUserMessage

This function lets you grab the very last message a user sent during a specific conversation. You provide a unique identifier for the conversation, and it digs through the history to find it. If a user message exists, you'll get its content as text. Otherwise, it will return nothing. It's designed to work cleanly and quietly, with logging options to keep you informed about what's happening behind the scenes.

## Function getLastSystemMessage

This function lets you grab the latest message sent by the system within a client’s ongoing conversation. It digs into the complete history of messages for that client and finds the very last one labeled as a "system" message. If no system messages were sent, it will return nothing. You'll need to provide the unique identifier for the client to retrieve the message.

## Function getLastAssistantMessage

This function helps you quickly get the latest message sent by the AI assistant for a specific client. It digs into the client’s conversation history and pulls out the content of the very last assistant message. If the client hasn't received any messages from the assistant yet, it will return nothing. You just need to provide the unique identifier for the client's session to use it.

## Function getAssistantHistory

This function lets you see what your assistant has said during a specific client's session. It pulls up all the history related to that session and then isolates just the assistant’s messages. Think of it as a way to review the conversation flow from the assistant’s perspective. You provide a unique ID for the client session, and it returns a list of messages the assistant generated. It's designed to keep things tidy during execution and will log the process if logging is turned on.

## Function getAgentName

This function lets you find out the name of the agent currently working on a specific client's session within your AI agent swarm. You just need to provide the client's unique ID. It’s designed to be reliable, checking that everything is set up correctly and keeping a log if you have that feature enabled. The process is handled in a way that keeps it separate from any ongoing operations, making sure it runs cleanly.

## Function getAgentHistory

This function lets you access the past interactions and decisions made by a particular agent within your swarm. It's designed to give you a record of how the agent has been operating, potentially including adjustments made by rescue algorithms. 

To use it, you’re going to need the unique identifier for the client session and the name of the agent you're interested in. The function retrieves this history, taking into account any configured rescue strategies that might have been applied to the agent’s responses. Think of it as a way to audit an agent's actions and understand its decision-making process. 


## Function fork

This function lets you run a piece of code – a function you provide – within a controlled environment. Think of it as giving your code a safe space to operate. It takes care of the setup, like creating a session and checking things are valid, and also cleans up afterward.  You'll pass in the code you want to run, and it will be executed with information about the client and agent involved. This simplifies managing the lifecycle of your code's execution.

## Function executeForce

This function lets you directly send a command or message to an agent in your swarm, making it appear as though it came from a client. It’s helpful when you need to force an action, like reviewing an agent’s output or starting a conversation, even if the agent isn’t actively running. 

Essentially, it bypasses the usual checks to ensure the command gets executed, making it a powerful tool for specific workflows. You'll provide the message you want sent and a unique identifier for the client making the request. The system takes care of verifying the session, monitoring performance, and ensuring a clean execution environment.

## Function execute

This function lets you send messages or commands to a specific agent within a swarm, acting as if they came directly from a client. It's useful for things like reviewing what an agent has generated or starting a conversation back to the client.

Before sending anything, it makes sure the agent is still part of the swarm and that the session is valid. The function also tracks performance and notifies other parts of the system about the execution. 

You'll need to provide the message content, a unique ID for the client making the request, and the name of the agent you want to send the message to. Essentially, it's a way to interact with individual agents in your swarm from the client side.

## Function event

This function lets your application send messages, or "events," to the rest of the agent swarm. Think of it as a way to broadcast information to other parts of the system. 

You specify a unique client ID, a topic name for the message, and the actual data you want to send.

The system prevents you from using certain reserved topic names to avoid conflicts.

It’s designed to be reliable, running within a controlled environment and logging activity when needed.


## Function emitForce

This function lets you send a string directly as output from the AI agent swarm, essentially acting as a manual injection of content. It's a way to bypass the normal message processing and agent checks. 

Crucially, it's meant for use with sessions created using `makeConnection` to maintain compatibility. It prepares a fresh environment for the output and confirms the session and swarm are properly set up. If you're not using `makeConnection`, this function won’t work. 

You’re required to provide the content you want to emit and a unique identifier for the client session making the request.

## Function emit

This function lets you send text as output from an agent in the swarm, essentially simulating what the agent would say. It's specifically for use when you've created a connection with `makeConnection`.

Before sending the text, the system double-checks that the connection is valid, the swarm is running, and the specified agent is still active. It ensures everything is ready to go and avoids sending output if the agent has been replaced.

The function creates a fresh environment for the output, records the action if logging is turned on, and won't work if you're not using a connection made with `makeConnection`. You provide the text you want to send, a unique ID for the client, and the name of the agent you want it to come from.

## Function commitUserMessageForce

This function lets you directly add a user's message to the agent's conversation history within a swarm session. It’s designed to force this addition, even if the agent isn’t actively responding.

Think of it as a way to manually update the conversation log—useful in situations where you need to ensure a message is recorded without initiating a new agent response.

It handles the necessary checks on the session and swarm setup, keeps a record of the action if logging is turned on, and then securely adds the message to the agent’s history. To ensure proper execution, it operates independently of any ongoing processes.

You’ll need to provide the message content, a mode setting, a client identifier to track the session, and an optional payload for additional data.

## Function commitUserMessage

This function lets you add a user's message to an agent's ongoing conversation history within a swarm session. Think of it as quietly updating the agent's memory without causing it to immediately react or generate a response. 

You provide the message content, the session mode, a client identifier, and the name of the agent you’re updating. There’s also an optional payload you can include for extra data.

The system makes sure the agent and session are still valid, records the action if logging is turned on, and then adds the message to the agent's history. It's designed to run independently, keeping things clean and consistent.

## Function commitToolRequestForce

This function lets you directly push tool requests to an agent within the swarm, even if some checks might usually be skipped. It's useful when you need to ensure a request goes through quickly, bypassing standard agent validation steps. Think of it as a way to directly tell the agent what to do. You'll need to provide the tool requests you want to commit and also the ID of the client initiating the request. The system handles the execution details and keeps track of what's happening through logging.

## Function commitToolRequest

This function lets you send tool requests to a specific agent within the swarm. It makes sure everything is set up correctly – verifying the agent, session, and swarm – before actually sending the request. Think of it as carefully packaging and delivering a task to the right agent. It keeps track of what's happening and handles the necessary setup behind the scenes to make sure the process is reliable and organized. You provide the requests, a client ID for tracking, and the name of the agent you want to work on them.

## Function commitToolOutputForce

This function lets you directly push the result from a tool back into the agent's workflow, even if the agent isn't actively responding. It's like a shortcut to ensure the result is recorded.

Think of it as a way to force an update to the agent's progress without needing to confirm it's still listening. 

You’ll need to provide the tool's ID, the output itself, and the client session ID to use it. It handles some internal checks and logging, and ensures the commit is done cleanly, independent of other ongoing processes.

## Function commitToolOutput

This function lets an agent in your swarm tell the system about the results it got from using a tool. Think of it as the agent formally submitting its work. 

It makes sure the agent is still authorized to do so, and it carefully logs the process for auditing. The function is designed to run independently, ensuring a reliable and clean way to record tool results within the swarm.

You'll need to provide the tool’s ID, the tool’s output content, a client identifier, and the name of the agent doing the submission.

## Function commitSystemMessageForce

This function lets you directly add a system message to a session within the agent swarm, even if no agent is currently active. It's a way to inject system-level information or commands into a session, bypassing the usual checks for an active agent.

Essentially, it’s a more forceful version of adding a system message, similar to how you might forcefully add an assistant's message.

The process confirms that the session and swarm are valid before committing the message, and it keeps track of the operation through logging. You'll need to provide the content of the message and the client ID associated with the session.

## Function commitSystemMessage

This function lets you send system-level messages to a specific agent within your AI agent swarm. Think of it as a way to send instructions or updates to an agent, rather than a response to a user's request.

Before sending the message, it carefully checks that the agent, its session, and the overall swarm are all valid and that you’re targeting the correct agent.

It handles sending these system messages—like configuration changes or control signals—and makes sure everything is logged for tracking and debugging. You’re providing the message content, a client identifier for verification, and the name of the agent you want to send the message to.

## Function commitStopToolsForce

This function lets you quickly halt the execution of tools for a particular client within the swarm. It’s designed to be a forceful stop, bypassing checks about what agent is currently active. 

Essentially, it guarantees that the next tool won't run for the specified client.

It confirms the session and swarm are valid before stopping tool execution, ensuring everything is in order. The system handles logging and context management behind the scenes. 

Think of it as a more direct way to stop a tool's execution compared to other methods – it’s like a “force flush” for tools. You just need to provide the client's ID.

## Function commitStopTools

This function lets you temporarily pause a specific agent within the swarm system from running its next tool. Think of it as putting a brief hold on what an agent is doing. 

It carefully checks to make sure the agent and the session you’ve specified are valid before stopping the tool execution. 

This isn’t about clearing history or resetting anything – it's a way to control the flow of tools for a particular client and agent.

You’ll need to provide the client's ID and the agent's name to use this function. It operates behind the scenes, managing the execution environment and recording its actions for tracking purposes.

## Function commitFlushForce

This function allows you to forcefully clear the history for a particular client’s interactions with the agent swarm. It's designed to be a more direct way to refresh the interaction history, bypassing usual checks to see if an agent is currently active.

Think of it as a way to ensure a clean slate for a client's session, useful in situations where you absolutely need to clear the history regardless of the current agent state.

It carefully manages the process by verifying the session and swarm, logs every step, and works seamlessly with several internal services to ensure a reliable and controlled flush. The `clientId` tells the system exactly which client's history to clear.

## Function commitFlush

This function lets you completely wipe the memory of a specific agent for a particular client. Think of it as resetting an agent back to a clean slate. It carefully verifies that the agent and the client session are valid before proceeding, ensuring everything is secure. It’s designed to clear out past interactions, providing a way to refresh an agent's state without adding new messages, unlike functions that simply add to its history. You'll need to provide the client's ID and the agent’s name to use this function.

## Function commitAssistantMessageForce

This function lets you directly add a message from an assistant to a conversation, bypassing the usual checks for which agent is currently handling it. It’s useful when you need to ensure a message is recorded, even if the system isn't in a standard active state. 

Essentially, it forcefully adds the provided message to the conversation session, verifying the session and swarm before committing. The function utilizes several internal services for validation, message handling, and logging. Think of it as a more direct way to add a message compared to the standard commit process. 

You'll need to provide the message content and the client ID associated with the session.

## Function commitAssistantMessage

This function sends a message generated by an AI agent into the system, associating it with a specific agent and client. It carefully checks that the agent and client are valid and part of an active session before actually sending the message. Think of it as permanently recording what the agent said, providing a record of the conversation and ensuring everything is properly tracked. It’s designed to work alongside other functions, like canceling an output, but instead of discarding information, this function saves it. You’ll need to provide the message content, the client's ID, and the agent's name to use it.

## Function changeToPrevAgent

This function lets you switch a client back to the agent they were using before, or to a default agent if they haven't used one yet. It’s designed to manage agent transitions within a group of AI agents working together. The system makes sure the client session and agent are valid before making the change, and keeps a record of the switch if logging is turned on. It handles the transition carefully, ensuring it happens in a controlled and reliable way. You just need to provide the unique identifier for the client session to trigger the switch.

## Function changeToDefaultAgent

This function allows you to easily switch a client back to the standard, default agent within your AI agent swarm. Think of it as a reset button for a client’s agent selection. It takes a client ID to identify the session you want to modify. Behind the scenes, it verifies that the session and default agent are valid, keeps a log of the change if logging is turned on, and handles the switch safely using a system that prevents delays and prioritizes tasks. It makes sure the change happens independently of any other operations that might be in progress.

## Function changeToAgent

This function lets you switch which AI agent is actively handling a client's session within your swarm. It's designed to safely manage these changes, checking that everything is set up correctly and logging the action for tracking purposes. The switch happens reliably through a queued system and is handled in a way that prevents conflicts with other ongoing tasks. To use it, you'll need to specify the name of the agent you want to activate and the unique ID of the client session.

## Function cancelOutputForce

This function lets you abruptly stop an agent's output for a particular client. It's a forceful way to cancel, bypassing checks to see if the agent is still running or even active. Think of it as an emergency stop button. 

It ensures the client is still valid and connected to a swarm before proceeding, and it handles any necessary logging. 

The `clientId` you provide identifies the client whose output you want to cancel. This is useful when you need to immediately interrupt a process, regardless of the agent's current status.

## Function cancelOutput

This function allows you to stop an AI agent from generating a response for a particular client. It's useful when you need to interrupt a process and prevent further output.

Essentially, you provide the client's ID and the agent's name, and the system makes sure everything is valid before stopping the agent's work. 

It carefully checks that the agent and session exist and that you're allowed to cancel the output. The function quietly handles the necessary checks and communication behind the scenes to ensure a clean interruption.


## Function addWiki

This function lets you register a new wiki structure within the orchestration framework. Think of it as defining the blueprint for how a particular knowledge base will be organized. You provide a schema that describes the wiki's layout, and the system adds it to its internal registry. The function returns a unique identifier for the newly added wiki, which you'll use to reference it later. Basically, it’s how you tell the system about a new knowledge source.


## Function addTriageNavigation

This function lets you set up a special tool that helps your AI agents find and connect with a triage agent, essentially creating a guided pathway for them. It takes a set of instructions – think of them as configuration details – to define how this navigation tool works. The function then creates and activates the tool, allowing the agent to seamlessly request assistance or be directed to the appropriate expert. The result is a unique identifier that confirms the tool is registered and ready for use.

## Function addTool

This function lets you add new tools that your AI agents can use. Think of it as expanding their skillset – you define what the tool does, its name, and a description, and this function registers it within the system. Once registered, any agent in the swarm can potentially use this tool to accomplish tasks. It’s important to register tools this way so they’re recognized and available to the agents. The function makes sure the registration happens cleanly and returns the tool's name to confirm it’s been added.

## Function addSwarm

This function lets you register a new swarm, which is essentially a blueprint for how your agent sessions will be managed. Think of it as defining the rules and starting point for a group of agents working together. By providing a schema, you're telling the system how these agents should interact and what their overall workflow should be. Only swarms added using this function are recognized, so it's the key to setting up your agent groups. The system ensures this registration happens in a clean environment, and you’ll get the swarm’s name back to confirm it’s been added.

## Function addStorage

This function lets you add a new way for your AI agents to store and retrieve data, like connecting to a database or cloud storage. Think of it as registering a new tool the swarm can use. Only storages added this way are recognized by the system, ensuring consistency across all agents. If the storage is designed to be shared among multiple agents, this function also sets up the connection and waits for it to be ready. It runs in a special environment to keep things clean and reports back the name of the storage you just added.



The `storageSchema` you provide describes how the storage works – its name, whether it's shared, and other important settings.

## Function addState

This function lets you define and register new states that your AI agent swarm can use. Think of it as adding a new type of data the swarm can understand and work with. Only states registered this way are recognized by the system, so it’s essential for setting up the swarm's data handling.

If a state is designated as "shared," this function also handles the initial setup to connect to a shared state service. This registration is done in a special way to keep things clean and separate from other operations.  You’re essentially giving the swarm a new piece of information to track and use. The function confirms the registration by returning the name of the newly added state.

## Function addPolicy

This function lets you define and register new rules, or "policies," for your AI agent swarm. It essentially sets up the system to understand and enforce these policies.  When you add a policy, it’s both validated for correctness and registered for management. The process is handled carefully within a controlled environment, and all actions are logged for tracking. This function is a key part of setting up your swarm, allowing you to proactively guide how your agents operate, alongside runtime actions like generating messages. You provide the policy's structure, including its name and configuration details, and the system takes care of the rest.

## Function addPipeline

This function lets you register a new pipeline, essentially defining a workflow for your AI agents. It takes a schema describing the pipeline – what steps it involves and what data it needs – and makes it available for use within the system. The function checks that the schema is valid before adding it, ensuring your pipelines are set up correctly. Once registered, the pipeline can be used to orchestrate agent tasks. The function returns a unique identifier for the registered pipeline.

## Function addMCP

This function lets you add a new Model Context Protocol (MCP) schema to the orchestration framework. Think of an MCP schema as a blueprint for how an AI agent understands and shares information. By providing a schema object, you're essentially telling the system about a new way agents can communicate and collaborate, allowing them to exchange data in a structured and predictable manner. The function returns a unique identifier for the registered schema, which you can use to refer to it later.

## Function addEmbedding

This function lets you register a new embedding engine, essentially telling the swarm system about a new way to generate vector representations of data. Think of it as adding a new tool to the swarm’s toolkit. Only embedding engines registered this way will be recognized and used by the system. It runs in a special, isolated environment to keep things clean and reliable, and it confirms registration by providing the name of the new embedding engine. You’ll need to provide a schema that describes how the embedding engine works and what its settings are.

## Function addCompute

This function lets you register new types of tasks your AI agents can perform. Think of it as defining what actions your agents are capable of. When you provide a schema, the system checks it to make sure it's properly formatted and then stores it for later use. This registration process makes those defined actions available for your AI agents to utilize within the orchestration framework. You can specify the data structure your compute function will use or let the system use a default.

## Function addCompletion

This function lets you add new tools for generating text completions into the system, allowing your AI agents to use them. Think of it as registering a new model like GPT-3 or a local alternative. 

When you add a completion engine, it’s validated and made available for agents to use, giving them more options for creating content. The process ensures a safe and isolated execution environment. 

The function confirms the addition by returning the name of the newly registered completion tool. You’ll need to provide a schema describing how that tool works and what it needs to function.

## Function addAgentNavigation

This function lets you set up a way for agents within the swarm to find and interact with each other. Think of it as creating a roadmap, allowing one agent to specifically navigate to and work with another. You provide some details about how this navigation should happen, and the function creates and registers that connection. It returns a unique identifier that you can use to manage or refer to this specific navigation link later.

## Function addAgent

This function lets you register a new agent so it can participate in the swarm. Think of it as officially adding an agent to the system’s list of available helpers. You provide a description of the agent, including its name, and the system will then recognize and use it for swarm tasks. Only agents added this way can be used by the swarm, and the process happens in a controlled environment to keep things running smoothly. The function confirms the agent's addition by returning its name.

# agent-swarm-kit classes

## Class WikiValidationService

The WikiValidationService helps ensure your wikis are set up correctly and consistently. Think of it as a quality control system for your wiki structures. 

You start by adding each wiki you want to manage, along with its specific schema – essentially a blueprint of how that wiki should be organized. Then, when you have content for a wiki, you can use the validation service to check that it conforms to the defined schema. This helps catch errors early and maintain a reliable structure across all your wikis. 

The service relies on a logger to keep track of what's happening, and it internally keeps track of the wikis and their schemas it's managing.

## Class WikiSchemaService

The WikiSchemaService helps manage and work with wiki schema definitions within the system. It keeps track of different schema versions, allowing you to register new ones, update existing ones, and easily retrieve them by a unique identifier. It relies on a schema context service to handle schema-related operations and uses a logger to keep track of what's happening. Think of it as a central repository for defining and managing how your wikis are structured. You can register new schemas, modify existing ones, and get a specific schema whenever you need it.

## Class ToolValidationService

The ToolValidationService helps ensure that tools used within the agent swarm are properly configured and exist. It keeps track of registered tools and their descriptions, making sure each tool name is unique. When a new tool is added, this service logs the action and verifies that the tool hasn’t already been registered. Similarly, when a tool is being used or validated, this service checks to see if it’s a known and valid tool, keeping things running smoothly and efficiently. The service also relies on logging to record activity and potential issues, helping with troubleshooting and monitoring.

## Class ToolSchemaService

The ToolSchemaService acts as a central place to manage the blueprints for the tools your AI agents use. Think of it as a library where each tool's definition (like how it should behave and what it expects) is carefully stored and organized. 

It checks these tool definitions to make sure they're structurally correct before they're used. This service works closely with other parts of the system to ensure agents are created and run correctly, and it keeps a log of important actions for monitoring.

Here's a breakdown of what it does:

*   **Registration:** It allows you to add new tool definitions to the system.
*   **Retrieval:** It provides access to the existing tool definitions when needed.
*   **Updates:** It allows you to modify existing tool definitions.
*   **Validation:**  It performs basic checks on tool definitions to ensure they are set up properly.

## Class ToolAbortController

The ToolAbortController helps you control and manage operations that might need to be stopped early. It's designed to work with asynchronous tasks, like when an agent is waiting for a response.

Think of it as a way to tell a task, "Hey, you don't need to finish anymore – cancel what you're doing!".

It creates and handles an `AbortController` behind the scenes – you don't need to worry about the technical details.  If your environment doesn’s natively support `AbortController`, this class gracefully handles that by doing nothing. 

The `abort()` method is how you actually tell the task to stop.

## Class SwarmValidationService

This service acts as a central point for ensuring the configurations of your AI agent swarms are correct and consistent. It keeps track of all registered swarms, making sure their names are unique and that their settings – including the agents and policies they use – are valid.

It works closely with other services, like those handling agent and policy validation, and uses a system of checks to make sure everything lines up. When you add a new swarm or make changes to an existing one, this service verifies that everything is set up properly, and it does so in a way that's optimized for performance.

You can use it to:

*   Register new swarms.
*   Retrieve lists of agents and policies associated with a specific swarm.
*   Get a complete list of all registered swarms.
*   Thoroughly validate a swarm's configuration.

## Class SwarmSchemaService

The SwarmSchemaService acts as a central hub for managing the blueprints, or schemas, that define how your AI agent swarms operate. Think of it as a library where you store and retrieve the configurations for each swarm, ensuring they're consistent and valid.

It carefully checks these configurations before they're used, verifying basic information like the swarm's name, the agents involved, and any policies that apply. This validation helps prevent errors and ensures smooth operation.

The service keeps track of these schemas using a specialized registry, and works closely with other components like the agent connection service, policy schema service, and swarm connection service to orchestrate agents and manage swarm configurations. It also logs its actions to help with debugging and monitoring.

You can register new swarm schemas, retrieve existing ones, or even update them to dynamically change how your swarms behave. This makes it easy to adapt your swarm configurations as needed.

## Class SwarmPublicService

This class acts as the main entry point for interacting with a swarm of agents from the outside. It handles requests like getting agent information, controlling output, and disposing of the swarm, making sure everything is properly scoped and logged. 

Essentially, it provides a public interface for managing the swarm, delegating the actual work to other services while adding context and logging for better tracking and control. Think of it as a friendly helper that makes sure all requests to the swarm are handled correctly and with the right level of detail.

Here's a breakdown of what you can do with it:

*   **Control Output:** You can cancel or wait for output from the swarm, which is useful for interrupting processes or retrieving results.
*   **Manage Agents:** You can get information about the current agent, switch between agents, or even set up new agents within the swarm.
*   **Navigate the Swarm:** The `navigationPop` function lets you control the flow of agents.
*   **Clean Up:**  The `dispose` function ensures resources are properly released when the swarm is no longer needed.
*   **Log Activity:** All operations are tracked, providing valuable insights into how the swarm is being used.

## Class SwarmMetaService

The SwarmMetaService helps manage and visualize the structure of your AI agent swarms. It takes the information defining your swarms – their agents, their relationships – and transforms it into a standard UML diagram format. This allows for easier understanding and debugging of complex swarm systems.

Think of it as a translator that converts your swarm's internal definitions into a visual blueprint. It works by using other services to gather swarm data, build a hierarchical representation of the swarm (a tree-like structure), and then convert that structure into UML notation.  It integrates with logging and documentation tools to make this process traceable and visually accessible. You can use it to generate diagrams that clearly illustrate the layout and components of your swarms, useful for both developers and anyone needing to understand the system's architecture.

## Class SwarmConnectionService

This service manages how AI agents work together within a "swarm." Think of it as a central hub that creates and reuses configurations for these agent groups, ensuring efficient operations and consistent access. It intelligently caches these configurations to avoid repetitive setup.

Here's a breakdown of what it does:

*   **Handles Swarm Creation & Reuse:**  It creates and manages pre-configured groups of agents (a "swarm") and reuses them when needed, making things faster and more efficient.
*   **Connects to Different Services:** It works closely with other parts of the system to manage agents, handle events, and track performance.
*   **Provides a Public API:** It offers a way to interact with these agent groups through a public interface, making them accessible.
*   **Logging and Context:** It keeps track of what's happening and ensures actions are tied to the correct client and swarm.
*   **Key Functions:**
    *   `getSwarm`: Creates or retrieves a pre-configured agent group.
    *   `emit`:  Sends messages between the swarm and connected components.
    *   `navigationPop`: Moves "backwards" through a sequence of agent actions.
    *   `cancelOutput`: Stops the swarm from sending a response.
    *   `waitForOutput`: Retrieves the response from a running agent.
    *   `getAgentName` & `getAgent`: Provides information about the currently active agent within the swarm.
    *   `dispose`: Cleans up the swarm's configuration when it’s no longer needed.


## Class StorageValidationService

This service helps ensure that your storage configurations within the agent swarm are set up correctly. It keeps track of all registered storage locations and their details, making sure each one is unique, exists, and has a valid embedding setup. 

It works closely with other services to manage storage registration, handle storage operations, and validate agent-related storage. To make things efficient, it remembers the results of previous validation checks.

You can add new storage locations to this service, and it will log the process and verify that the name hasn't already been used. When you need to confirm if a specific storage is set up properly, the validation process checks for its existence and validates its embedding.

## Class StorageUtils

This class provides tools for managing data storage related to specific clients and agents within the swarm. It helps to ensure that only authorized agents can access and modify data for their designated clients.

You can use it to retrieve a limited number of items based on a search query (`take`), insert or update data (`upsert`), delete individual items (`remove`), retrieve a single item by ID (`get`), list all items (`list`), create a numeric index for storage (`createNumericIndex`), and even clear all data from a storage area (`clear`). Each of these methods performs checks to make sure that the client, agent, and storage area are correctly registered and authorized before any data operations are performed.

## Class StorageSchemaService

The StorageSchemaService is responsible for managing the blueprints for how data is stored within the AI agent swarm. Think of it as a central catalog where all the storage configurations are kept organized. It ensures these configurations are valid and consistent, and it integrates with other services like those handling storage connections, embedding references, and agent definitions.

The service uses a registry – a tool for quickly finding and managing storage schemas. Before adding a new storage configuration, it performs a quick check to make sure it's structurally sound.

You can register new storage configurations, update existing ones, and easily retrieve them when needed.  This helps ensure client-specific and shared storage instances are properly set up and work reliably within the overall system, and provides the necessary configuration for things like indexing data and referencing embeddings.  Everything is logged to help track and troubleshoot storage operations.

## Class StoragePublicService

This service manages storage specifically for each client within the swarm system, offering a way to isolate data and operations. Think of it as a personalized storage area for each client. It builds upon the underlying storage connection service and incorporates logging and context scoping to ensure controlled and traceable interactions.

The service integrates with other key components like the client agent to handle data related to individual client executions, the performance service for tracking storage usage, and the documentation service for documenting storage schemas.  It's designed to provide controlled access to storage, unlike system-wide storage.

Key actions available include retrieving, adding or updating, removing, listing, clearing, and disposing of client-specific storage data. Each operation is wrapped for context and logging to maintain transparency and consistency across the system. This makes it suitable for tasks like searching, storing, deleting, or cleaning up data associated with a specific client's activity.  The service relies on injected dependencies for logging and connecting to the core storage, promoting modularity and testability.

## Class StorageConnectionService

The `StorageConnectionService` manages how your system connects to and interacts with different storage locations. It’s the central point for getting a connection to a storage instance, making sure connections are reused when possible to improve efficiency.

Think of it like a helpful assistant that retrieves or creates a connection to storage based on a client's ID and a storage name. It remembers those connections so it doesn’t have to recreate them every time.

It works closely with other services: it gets information about storage configurations, tracks usage for security and quota purposes, and even handles embedding logic for more advanced searching. 

This service understands the difference between regular and shared storage, making sure shared storage isn’t accidentally cleared. It also delegates cleanup tasks to other services to maintain a clean and organized system. When you need to read, write, or delete data, this service handles the connection and ensures the process follows established protocols.

## Class StateValidationService

The StateValidationService helps manage and ensure the correctness of data representing the state of your AI agents. Think of it as a quality control system for agent states.

It allows you to define the expected structure of each state using schemas, essentially telling the system what data it should be looking for.  You register these state schemas with the service, giving each state a name and its expected format.

When your agents report their status or data, the StateValidationService can then verify that the reported data conforms to the defined schema for that specific state. This validation process helps catch errors early, making sure your agents are operating with consistent and reliable information. 

The `addState` function registers a new state and its schema, while `validate` checks if a given piece of data matches the registered schema for a particular state. It uses a logging service (the `loggerService`) to report any validation issues.

## Class StateUtils

This class helps manage the specific information each client and agent uses within the swarm. Think of it as a toolkit for keeping track of what each participant knows and needs.

You can use it to easily get the current state information associated with a client, an agent, and a particular piece of data. It also allows you to update that state, either by providing a new value or by providing a function to calculate the new state based on what's there already. Finally, it has a simple way to completely reset the state data for a client and agent. 

Before getting, setting, or clearing any state, it makes sure everything is properly authorized and registered within the swarm system, and it records all actions for monitoring purposes.

## Class StateSchemaService

The StateSchemaService acts like a central library for defining and managing how your AI agents store and access data. Think of it as the place where you define the "shape" of the data each agent uses – what information it holds, and how it's accessed.

It keeps track of these data structures (called "state schemas") in a registry, making them easy to find and use throughout the system. Before adding a new schema, it performs a quick check to make sure it’s structurally sound.

This service works closely with other parts of the system:

*   It’s linked to the logging system to provide insight into what’s happening with state schemas.
*   It relies on a schema context service to manage schema-related operations.
*   It helps other services like the state connection and agent schema services by providing these validated and organized state definitions.

Essentially, it’s a foundational element for organizing and ensuring consistency in how your AI agents handle data. You define the structure here, and other services rely on those definitions.

## Class StatePublicService

This class helps manage state specifically for individual clients within the swarm system. Think of it as a way to keep track of information that belongs to a single user or device, differentiating it from system-wide settings or persistent storage. It works closely with other parts of the system like client agents and performance tracking, providing a public interface for getting, setting, clearing, and releasing client-specific data.

It relies on injected services for logging and managing the underlying state operations. When enabled, logging will provide information about state changes. The main functions allow you to:

*   **Set State:** Update a client's state using a function that takes the previous state and returns the new state.
*   **Clear State:** Reset a client's state back to its default.
*   **Get State:** Retrieve the current state of a client.
*   **Dispose:** Clean up resources associated with a client's state.

Essentially, it's a dedicated place to handle client-specific data and perform actions on it, ensuring a clean and organized approach to managing state within the agent swarm.

## Class StateConnectionService

This service is responsible for managing how different parts of the system interact with and store state information – think of it as the central hub for state management within the swarm. It handles both client-specific states and shared states, making sure things run smoothly and efficiently.

It relies on several other services, like logging, event handling, and state schema management, to do its job. It intelligently caches state instances to avoid unnecessary creation and uses queues to make sure updates happen safely and in the correct order.

Here's a breakdown of what it does:

*   **Gets State:** It retrieves or creates state based on client and state name. It smartly caches these instances for faster access.
*   **Sets State:** Updates the state, handling changes and ensuring thread safety.
*   **Clears State:** Resets the state to its initial value.
*   **Retrieves State:** Gets the current state value.
*   **Disposes of State:** Cleans up resources and releases state when it's no longer needed.


## Class SharedStorageUtils

This class provides a set of tools for interacting with the shared storage used by your agent swarm. Think of it as a central hub for agents to access and modify common data.

You can use `take` to fetch a specific number of items based on a search term, `upsert` to add new data or update existing entries, and `remove` to delete items by their unique ID.  `get` allows agents to retrieve a specific item, while `list` helps you view all the data in a storage area, potentially applying filters to narrow down the results. Finally, `clear` provides a way to wipe out all data from a particular storage area when needed. Each of these operations is carefully controlled to ensure data integrity and proper logging.

## Class SharedStoragePublicService

This class manages how different parts of the system interact with shared storage. Think of it as a public-facing interface for storing and retrieving data across the swarm. It's built to be flexible, using other services to handle the actual storage operations and adding helpful features like logging for tracking what's happening.

It provides core functions like taking items (searching and retrieving), adding or updating items (upserting), deleting items (removing), getting a specific item, listing all items, and clearing all items from a designated storage area.  

The system uses a logger to track operations if logging is enabled, and relies on other services to handle the underlying storage mechanics and make sure things run smoothly within the context of the overall system. Different components, like ClientAgent and PerfService, rely on this class to manage shared storage needs.

## Class SharedStorageConnectionService

This service manages shared storage for the swarm system, acting as a central hub for data. Think of it as a single, shared notebook accessible by all parts of the swarm. It makes sure that every component working with this shared data is using the same instance, avoiding confusion and inconsistencies.

It relies on other services within the system to handle tasks like logging, event broadcasting, and schema management.  The service uses a smart caching system to ensure efficiency, so it doesn't have to re-create storage instances every time they are needed.

Here's a breakdown of what it lets you do:

*   **Get or Create Storage:**  It provides a way to retrieve an existing shared storage area or create a new one if it doesn't already exist.
*   **Take (Search and Retrieve):**  Lets you search the shared storage and retrieve a list of data items.
*   **Upsert (Insert or Update):** Adds new items or updates existing ones in the shared storage.
*   **Remove:** Deletes items from the shared storage.
*   **Get:** Retrieves a single item by its ID.
*   **List:** Retrieves all items, optionally filtering them based on certain criteria.
*   **Clear:** Completely resets the shared storage, removing all data.



In essence, this service is the backbone for reliable and synchronized data sharing across the entire swarm system.

## Class SharedStateUtils

This class helps coordinate agents within a swarm by providing easy ways to share information. Think of it as a central whiteboard where agents can leave messages for each other.

You can use it to fetch existing shared data using `getState`, update that data with `setState` (either providing a new value directly or providing a function to calculate the new value based on what's already there), and to completely reset a piece of shared information using `clearState`.  Each of these operations is handled in a way that keeps track of what's happening and communicates with the swarm’s shared state system.

## Class SharedStatePublicService

This service manages shared data accessible across different parts of the system, like agents and performance tracking tools. It provides a public interface for interacting with this shared data, handling operations such as setting, clearing, and retrieving data. Think of it as a central repository for information that various components need to access and update. 

It keeps track of what's happening with logging, and relies on other services for core functionality and context management. It's used in several places, including managing agent execution and monitoring performance. The service ensures operations are properly scoped and logged, and it's configurable to control the level of logging detail.

## Class SharedStateConnectionService

This service manages shared data across all agents in your system, acting like a central repository for information that needs to be accessed and updated consistently. Think of it as a single, shared whiteboard visible to every agent.

It ensures that only one instance of each shared data set exists, preventing conflicts and maintaining data integrity.  It's designed to be efficient, using caching to avoid unnecessary work and employing techniques to handle updates safely, even when multiple agents are trying to modify the data at the same time.

You can retrieve the current state, update it using a function that transforms the previous version, or even completely reset it to its initial value.  The service keeps track of everything happening through logging and integrates with other parts of the system for event propagation and configuration. It's all about controlled, reliable sharing of data between agents.

## Class SharedComputeUtils

This class, SharedComputeUtils, provides helpful tools for managing and retrieving information about shared computing resources. Think of it as a central place to check on the status and configuration of these resources.

The `update` function lets you refresh the details for a specific compute resource, ensuring you have the latest information. 

The `getComputeData` function is your way to fetch details about a compute resource; you can specify the client ID and compute name, and it will return the data as a promise. You can also define what kind of data you expect to receive when you call this function.

## Class SharedComputePublicService

This class, `SharedComputePublicService`, acts as a bridge, connecting your AI agents to a shared computing resource. It provides a straightforward way to request and utilize these resources without needing to manage the underlying infrastructure directly. 

You can think of it like ordering a specialized calculation – you specify what you need (`methodName`, `computeName`), and the service handles getting the data or performing the computation for you. The `calculate` function triggers a computation, while `update` allows you to refresh information related to a specific compute resource. The `getComputeData` function retrieves data associated with a particular calculation. It uses a logger service for tracking and a shared compute connection service to manage the actual communication.

## Class SharedComputeConnectionService

This component, `SharedComputeConnectionService`, manages connections to shared compute resources, allowing agents in your swarm to work together and share data. It relies on several other services like logging, message passing, and state management to function effectively.

The `getComputeRef` method provides a way to retrieve references to specific compute resources, offering a cached and controlled access mechanism.  `getComputeData` lets you fetch the data currently held by these shared compute resources.  You can use `calculate` to trigger calculations related to a particular state, and `update` to refresh or synchronize the shared compute data. Essentially, it's a central point for agents to interact with and update shared computational tasks.

## Class SessionValidationService

This service manages session lifecycles within the agent swarm system, keeping track of how sessions relate to swarms, agents, storages, states, and more. It's designed to ensure everything stays consistent and works together properly.

It acts as a central point for tracking these relationships and validating session activity, relying on other services like session management, client agents, and logging. Think of it as a record-keeper for sessions, making sure everything is accounted for.

The service uses a series of maps to link sessions to related elements (like agents, storages, etc.) and it uses memoization to optimize its validation checks and improve performance.

You can add sessions and track what agents, storages, states, and computes are associated with them.  Conversely, you can remove these associations and even remove the entire session itself. Several methods exist to retrieve lists of associated elements for a given session. Finally, there's a 'validate' function to check if a session is valid, which is optimized for efficiency.

## Class SessionPublicService

This class manages how users interact with the swarm system's sessions. It acts as a public interface for session-related tasks, delegating to other services and ensuring operations are properly tracked and logged. 

Think of it as the main control panel for sessions—sending messages, executing commands, and handling events. It carefully coordinates with services like logging, performance tracking, and event handling, to ensure everything runs smoothly and can be monitored. 

Here's a breakdown of what you can do with it:

*   **Send Messages:** You can send messages to a specific session, either as regular messages or as system messages.
*   **Run Commands:** You can execute commands within a session, specifying how they should be processed.
*   **Connect to Sessions:**  You can establish a connection to a session to enable ongoing communication.
*   **Track Tool Usage:** The class helps commit tool outputs, requests, and responses, important for interactions that involve tools.
*   **Manage Session State:** You can flush the session history or stop tool execution to manage the session’s state.
*   **Clean Up Resources:**  You can properly dispose of the session when it’s no longer needed.



Essentially, it provides a standardized and reliable way to interact with sessions, ensuring consistency and observability across the swarm system.

## Class SessionConnectionService

The `SessionConnectionService` manages connections and operations within a swarm system, acting as a central point for session management. It efficiently reuses session data by caching them, preventing redundant setups.

Think of it as a control panel for individual "conversations" (sessions) happening within your AI swarm.  It handles sending messages, executing commands, and keeping track of everything happening within a session.

Here's a breakdown of what it does:

*   **Session Creation & Reuse:** It creates and reuses "sessions" – distinct environments for interactions – efficiently by caching them.
*   **Centralized Management:** It coordinates various components like logging, event handling, policy enforcement, and swarm access.
*   **Message Handling:**  It facilitates sending notifications, emitting messages, executing commands, running tasks, and connecting clients to the session.
*   **Tool Interaction:** It handles commitments of tool requests, responses, and stopping tools within the session's workflow.
*   **Session Lifecycle:** It ensures proper cleanup and disposal of sessions when they’re no longer needed, clearing the cached data.



It’s built to make sure sessions are handled consistently and efficiently across your AI swarm, providing a reliable foundation for interactions.

## Class SchemaUtils

The `SchemaUtils` class offers helpful tools for managing how your AI agents store and share information. It allows you to securely write data to a client’s session memory, keeping track of things like their progress or preferences. You can also retrieve this stored information when needed.

Beyond session memory, `SchemaUtils` provides a way to convert objects into easily readable strings, which is useful for logging or transmitting data. This serialization process can even customize how the data is represented, letting you adjust the keys and values as needed.

## Class RoundRobin

This class provides a simple way to rotate through a set of tasks or agents, ensuring each one gets a turn in a predictable order. Think of it like a round-robin tournament where each participant gets a chance.

You give it a list of "tokens," which are identifiers for different instance creators – these creators are responsible for generating the actual agents or tasks. The class cycles through these tokens, using each one to create an instance and execute it. 

It keeps track of which token it's currently using and can optionally log this information for debugging or monitoring. There's a helper function to easily create a RoundRobin object, associating tokens with the logic needed to create instances.

## Class PolicyValidationService

This service acts as a gatekeeper for policies used by your AI agent swarm. It keeps track of all registered policies and their definitions, making sure they're unique and available when needed. When a policy is added, it's registered here, and when a policy needs to be enforced, this service verifies its existence. It's designed to work closely with other services to manage policies effectively and efficiently, using logging to keep track of what's happening and memoization to speed up the validation process. Essentially, it ensures that the swarm is using valid and known policies.

## Class PolicyUtils

This class provides helpful tools for managing client bans within your AI agent swarm's policies. It offers a simple way to ban, unban, and check the ban status of clients. 

Each method, like banning or unbanning a client, carefully verifies the information provided and handles the process within a controlled environment for reliable tracking and logging. 

You can use these methods to quickly manage client access based on your swarm’s defined policies. The `hasBan` method lets you easily check if a client is currently restricted.

## Class PolicySchemaService

The PolicySchemaService acts as a central hub for managing and providing access to policy definitions within the swarm system. Think of it as a library of rules that govern how different parts of the system interact.

It keeps track of these policies, ensuring they are valid and accessible to various services like those handling client connections, agent execution, and session management. The service verifies policies before they're registered, and it keeps a record of them using a specialized registry.

You can register new policies, update existing ones, and easily retrieve them when needed. The entire process is carefully logged to help with monitoring and debugging. The service makes sure that the rules used to control access and restrictions are always up-to-date and reliable across the entire swarm.

## Class PolicyPublicService

This service acts as a central point for managing policy-related actions within the swarm system. It provides a public interface for checking if a client is banned, retrieving ban messages, validating data (both incoming and outgoing), and managing client bans and unbans. Behind the scenes, it relies on other services like the policy connection service, logger, and context scoping, ensuring consistent logging and proper context awareness for all policy operations. It’s utilized by various components, including performance monitoring, client agents, and documentation services, to enforce and manage policies effectively. The service also provides methods for explicitly banning or unbanning clients from a swarm, governed by specific policies.

## Class PolicyConnectionService

This class, `PolicyConnectionService`, manages how policies are applied and enforced within the swarm system. It acts as a central point for policy-related operations, reusing cached policy information for efficiency.

It relies on several other services: a logger for recording activity, a bus for sending notifications about policy changes, a method context service for determining the current policy in use, a policy schema service to retrieve policy configurations, and a performance tracking service.

The `getPolicy` method is key – it efficiently retrieves or creates policy configurations, remembering them for later use.  Other methods, like `hasBan`, `getBanMessage`, `validateInput`, `validateOutput`, `banClient`, and `unbanClient`, delegate work to individual `ClientPolicy` instances, providing a consistent interface for policy enforcement across different components like ClientAgents, SessionPublicService, and PolicyPublicService. The logging and event emission are also managed within this class.

## Class PipelineValidationService

This service helps ensure your AI agent pipelines are set up correctly before they start running. It essentially acts as a validator, checking the structure and contents of your pipelines against predefined blueprints. 

You can think of it as a way to register your pipelines and then run checks to confirm they're ready to execute. The `addPipeline` method lets you register a new pipeline with its schema, and the `validate` method allows you to run a validation check on a specific pipeline and its data source.  The service also incorporates logging to help you track and understand the validation process.

## Class PipelineSchemaService

The PipelineSchemaService helps manage and organize the blueprints for your AI agent workflows – think of them as templates that define how your agents should operate. It uses a context service to understand the specifics of each blueprint, ensuring they are valid and consistent.

This service keeps track of these blueprints, allowing you to register new ones, update existing ones, and easily retrieve them when needed. It’s like a central library for your AI agent workflow designs. 

Behind the scenes, it has a logging system for tracking activity and a private registry to store and manage these blueprints. You can think of `register` as adding a new blueprint, `override` as modifying an existing one, and `get` as looking up a specific blueprint.

## Class PersistSwarmUtils

This class helps manage how information about your AI agent swarms is saved and retrieved. It keeps track of which agent is currently active for each user and swarm, and it also stores the history of agent navigation for each user. 

You can think of it as a central place to manage these key details. It simplifies saving and loading this data, making it easier to keep track of user sessions and agent workflows.

It also offers flexibility – you can customize how these details are stored, allowing you to use different storage methods for active agents and navigation history. This allows you to tailor the persistence layer to your specific needs, whether that means using a database, a file, or something else entirely.

## Class PersistStorageUtils

This utility class helps manage how information is saved and retrieved for each user and storage area within the system. Think of it as a way to keep track of things like user settings or activity logs, making sure the data is available when needed. It makes sure each storage area uses the same persistence method to avoid unnecessary duplication and improve efficiency.

The class includes a function to easily create or get access to a specific storage area, and provides methods to get and set data within these areas. You can even customize how data is persisted by providing your own storage constructor.

## Class PersistStateUtils

This class helps manage how information is saved and retrieved for each client interacting with the system. Think of it as a way to remember things about each client's session, like their settings or the progress of their tasks. It allows you to store and access this information consistently.

The class uses a persistence adapter, which can be customized, to handle the actual saving and loading of data.  This makes it flexible to use different storage methods, like keeping things in memory or using a database.

You can use it to save data for a particular client and state name, and then retrieve that data later. If the data isn't already saved, it can use a default value. The system ensures there’s only one persistence instance for each type of state, which is efficient. You can also swap out the default persistence mechanism with your own custom solution.

## Class PersistPolicyUtils

This class provides tools for managing which clients are blocked within a swarm system. It allows you to retrieve and update lists of banned clients for a particular policy, ensuring these restrictions are saved and accessible later. The system efficiently handles persistence by creating only one storage instance per swarm. You can also customize how the policy data is stored by using a custom persistence adapter, allowing for different storage methods like in-memory solutions or databases.

## Class PersistMemoryUtils

This class helps manage how memory is saved and retrieved for each individual client interacting with the swarm system. Think of it as a way to remember what each client was doing, so the process can be resumed later. 

It uses a technique called memoization to make sure each client has its own dedicated memory storage, preventing unnecessary duplication and saving resources.  You can set and retrieve memory data for a client, and if no data exists, a default value can be provided.  When a client's session is over, this class also allows you to clean up the memory storage. 

Importantly, you have the flexibility to customize how the memory is actually stored – for example, using an in-memory solution or connecting to a database – by configuring a custom memory persistence adapter.

## Class PersistEmbeddingUtils

This class helps manage how embedding data is stored and retrieved within the swarm system. It's designed to be flexible, allowing you to customize how embeddings are persisted using adapters.

The system keeps track of embedding data and makes sure that each set of embeddings is only stored once, saving resources. You can check if an embedding has already been calculated and stored, or save a newly computed embedding for later use. 

If you need more control, you can configure a specific method for storing embedding data, like using an in-memory store or a database.

## Class PersistAliveUtils

This class helps keep track of whether your AI agents (clients) are online or offline within a particular swarm. Think of it as a central registry for agent availability. It allows you to easily mark agents as online when they join the swarm, offline when they leave, and check their current status. The system remembers this information, so you don't have to constantly re-check.  You can even customize how this tracking is done if you need more than the default behavior, for example, storing the status in a database instead of in memory. This helps ensure that your swarm can operate reliably and efficiently, knowing the state of each agent.

## Class PerfService

The `PerfService` class is responsible for tracking and logging performance data for client sessions within the AI agent swarm system. It's like a detailed performance monitoring tool.

It gathers information about how long client actions take, how much data is sent and received, and the overall state of those sessions. This data is then organized and can be used for reporting or analytics.

The service relies on several other services, injected to provide access to session information, validation data, and state computation. Think of them as helpers for retrieving the data needed to build the performance records. 

Key functionalities include starting and stopping execution timers, calculating average response times, and generating reports on performance metrics for individual clients or the entire system. When an action happens (like a client request), the service starts a timer; when it finishes, it stops the timer and records the details. It also provides methods for clearing out old data when needed.

## Class OperatorInstance

This class represents a single instance of an operator within your AI agent swarm. Think of it as a worker responsible for specific tasks within the larger system. 

Each instance is identified by a client ID and an agent name, helping to track its role and origin. It can receive notifications, send answers and messages, and connect to receive answer streams.  The `dispose` method allows you to cleanly shut down the operator's resources when it’s no longer needed. When working with this class, you can provide optional callback functions to handle certain events, tailoring its behavior to your application’s needs.

## Class NavigationValidationService

This service helps keep track of where agents are navigating within the system and prevents them from repeatedly visiting the same places. It’s designed to efficiently manage navigation routes for each client and swarm, ensuring agents move as intended. 

The service uses a special technique called memoization, which basically remembers previous calculations so it doesn't have to repeat them, making everything faster.  It also works with a logging system to keep a record of navigation activity and aid in debugging.

You can start fresh with navigation monitoring for a specific client and swarm, and also completely remove that navigation tracking when it's no longer needed. The `shouldNavigate` function is the core of the service – it checks if an agent has already been visited before allowing it to be navigated to.

## Class MemorySchemaService

This service manages temporary, in-memory data associated with different sessions within the swarm. Think of it as a simple scratchpad for each session, allowing the system to store and retrieve data without needing to persist it anywhere.

It’s essentially a key-value store where the "key" is a session identifier and the "value" can be any kind of object. This allows different components, like agents or public session APIs, to share and access information relevant to a specific session.

The service provides simple methods to write data, read data, and completely clear out a session's data when it’s no longer needed. Importantly, this isn’t a permanent storage solution – the data disappears when the service is reset or the entry is explicitly disposed. It also logs its actions to help with debugging, under certain configuration settings.

## Class MCPValidationService

This class helps you keep track of and check the structure of Model Context Protocols, or MCPs. Think of it as a librarian for your MCP definitions. It lets you register new MCPs, essentially adding them to its collection, and then verify that an MCP actually exists when you need it. The class uses a logging system to record what it's doing, and it internally manages a list of these MCP definitions for easy access.

## Class MCPUtils

This class, called MCPUtils, helps manage updates to the tools used by clients connected through the Multi-Client Protocol. Think of it as a central place to ensure everyone has the latest versions of what they need.

You can use it to refresh the tools for every client connected to the system or target a specific client for an update. The `update` method handles this process, making it easy to keep things synchronized.

## Class MCPSchemaService

This service helps manage the blueprints – or schemas – that define how different AI agents communicate and share information within the system. It allows you to register new schema designs, update existing ones with modifications, and easily retrieve them when needed. The service keeps track of all registered schemas, using a registry to organize them by name. It also has built-in tools for checking if a schema is structurally sound. The service relies on another component to handle context-related operations and uses a logger to record its actions.

## Class MCPPublicService

The MCPPublicService class lets you manage and interact with tools used by AI agents. Think of it as a central hub for controlling which tools are available and how they're used.

You can use this class to see a list of all available tools, update that list for all agents or just one, and check if a particular tool exists. It also provides a way to execute specific tools and get results, all while keeping track of the agent's context. The service relies on injected components for logging and MCP communication, which helps keep things organized and maintainable.

## Class MCPConnectionService

The MCPConnectionService acts as the central hub for interacting with Model Context Protocol (MCP) connections. It's responsible for managing the connections themselves and handling requests like listing available tools, checking if a tool exists, and actually executing those tools. Think of it as a facilitator that connects the agent swarm to the underlying tools it needs to use. 

It relies on other services – a logger for tracking what's happening, a bus for communication, a method context service for accessing information about how things are being used, and an MCP schema service for defining and managing the tools available. It efficiently caches MCP instances to avoid repeatedly establishing connections. You can also tell it to clear out cached information when a client is finished.

## Class LoggerService

The `LoggerService` handles logging messages – like normal logs, debug information, and informational updates – throughout the system. It ensures these logs are sent to both a central logging system and a client-specific one, using information about the method and overall execution to provide context.

It's designed to be flexible, allowing you to swap out the default logging system with a custom one if needed. The service integrates with other parts of the swarm system, such as the ClientAgent, Performance Service, and Documentation Service, to provide relevant logging during their operations.

Here's a breakdown of what it does:

*   **Centralized and Client-Specific Logging:** Sends log messages to a common logger for system-wide monitoring, and also routes messages to a client-specific logger for more targeted analysis.
*   **Contextual Information:**  Includes details about the method and execution being performed in the logs, making it easier to understand what’s happening.
*   **Configurable:** Logging levels (like debug or info) can be enabled or disabled through system configuration.
*   **Runtime Changes:** You can swap out the main logger at any time, which is useful for testing or customizing logging behavior.

## Class LoggerInstance

This class helps manage logging specifically for each client within your system. You create a LoggerInstance for each client, and it keeps track of logs and allows you to customize how those logs are handled. 

You can tell it what client it’s for and provide custom functions to be called when logs are created or when the logger is shut down. The class makes sure logs appear in the console only if the global configuration allows it, and ensures initialization happens only once.

The `waitForInit` method initializes the logger and calls any custom setup functions. The `log`, `debug`, `info`, and `dispose` methods provide ways to record messages and clean up resources respectively, while also allowing for callback execution. Finally, `dispose` lets you gracefully shut down the logger and trigger any cleanup routines.

## Class HistoryPublicService

This class helps manage and interact with the history of interactions within the agent swarm system. Think of it as a central hub for recording and retrieving information about what agents are doing. It provides a public way to push new messages to the history, retrieve old ones, convert the history into lists, and clean up the history when it's no longer needed.

It works closely with other parts of the system – like the agents themselves, the service that handles client interactions, and the performance tracking system – to ensure everything is coordinated.  The class keeps a record of actions through logging, and it handles requests within a defined context to keep things organized.

Here's a breakdown of what you can do with it:

*   **Push Messages:** Add new interaction details (like messages) to an agent’s history.
*   **Pop Messages:** Retrieve the most recent interaction details from an agent’s history.
*   **Convert to Arrays:** Get the history as a list for further processing or documentation. You can get either a prepared list suitable for the agent or a raw list for technical purposes.
*   **Dispose of History:** Clean up the history to free up resources.

## Class HistoryPersistInstance

This component helps keep track of conversations or interactions for each agent, saving them both in memory and on disk. When you create an instance, it's tied to a specific client ID and can receive callbacks for various events.

It handles loading existing conversation history from storage during initialization and provides a way to add new messages. You can iterate through past messages, and the system ensures efficient initialization, guaranteeing it only runs once per agent. 

The component also offers methods to remove the last message in the conversation history and gracefully clean up resources when needed, either for a specific agent or for all agents. Finally, various callbacks allow you to react to changes in the history, such as new messages being added or messages being removed.

## Class HistoryMemoryInstance

This class provides a simple way to keep track of messages exchanged with an agent, storing them in memory without saving them permanently. 

When you create an instance, you give it a unique identifier (clientId) and optionally provide callbacks to be notified of different events like when a message is added, removed, or when the history is cleared. 

The `waitForInit` method sets up the history for a specific agent, while `iterate` allows you to loop through the messages, potentially applying filters or system prompts. `push` is used to add new messages, and `pop` to remove the most recent one.  Finally, `dispose` cleans up the history, either for a specific agent or globally.

## Class HistoryConnectionService

This service manages how history is stored and accessed for individual agents within the swarm system. Think of it as a central hub for handling agent-specific logs and interactions.

It intelligently caches history information using a technique called memoization, which means it avoids re-creating the same history data unnecessarily, making things run faster. It relies on other services like logging, event handling, and session validation to function correctly.

Here's a breakdown of what it lets you do:

*   **Get History:** Retrieves or creates the history for a specific client and agent, caching it for efficient reuse.
*   **Push Messages:** Adds new messages or events to an agent’s history.
*   **Pop Messages:** Retrieves the most recent message from an agent’s history.
*   **Convert to Arrays:** Formats the history data into different array formats – one designed for the agent to use and another for raw data access.
*   **Dispose:** Cleans up the history connection and releases resources when no longer needed.

Essentially, this service provides a structured way to keep track of what’s happening with each agent, and makes it accessible to different parts of the system.

## Class EmbeddingValidationService

This service helps ensure that the embedding names used throughout the system are valid and consistent. It keeps track of all registered embedding names and their details, making sure there aren't any duplicates and that they actually exist when needed. 

It works closely with other services like the embedding registration service and the client storage to coordinate embedding usage and validation.  The service is designed to be efficient, using techniques to avoid unnecessary checks. 

You can register new embedding names with their associated information using the `addEmbedding` function.  The `validate` function then checks if a given embedding name is registered, providing a quick and reliable way to verify embedding names during operations. The process includes logging to track what’s happening and help with troubleshooting.

## Class EmbeddingSchemaService

The EmbeddingSchemaService manages how your agent swarm defines and uses embedding logic – essentially, the math behind comparing and creating data representations. It acts like a central library, storing and providing these embedding definitions for different purposes. 

This service ensures these definitions are consistent and valid before they're used by other parts of the system, like when storing data or searching for similar items. It keeps track of these definitions using a specialized registry, and logs its actions to help with debugging.

You can register new embedding definitions, update existing ones, and retrieve them when needed. The service works closely with other components to provide the necessary embedding functionality for various storage and search operations.

## Class DocService

This class is responsible for creating documentation for your swarm system, including details about swarms, agents, and their performance. It generates Markdown files for swarm and agent schemas, including helpful UML diagrams, and creates JSON files for performance metrics.

Think of it as a documentation generator that automatically creates files describing the different parts of your system. It uses several other services to gather the necessary information and organizes the output into a structured directory.  The system also logs its activities, especially when generating the documentation, and uses a pool of threads to handle tasks efficiently.

Here’s a breakdown of its key functionalities:

*   **Schema Documentation:** It generates documentation for swarms (groups of agents working together) and individual agents, detailing their structure, components, and behaviors.
*   **Performance Reporting:** It creates reports on overall system performance and the performance of specific clients.
*   **Visual Aids:** It produces UML diagrams to visually represent agent schemas, making it easier to understand their inner workings.
*   **Organized Output:**  The generated documentation is neatly arranged in a directory structure, making it easy to navigate and find information.
*   **Controlled Logging:**  Logging is enabled based on a global configuration setting, providing insights into the documentation generation process.



The class uses several internal services to pull information about the system, including those dealing with agent validation, schema generation, and performance tracking. The final documentation helps developers understand and maintain the system.

## Class ComputeValidationService

This class, `ComputeValidationService`, is designed to help ensure the accuracy and consistency of computations performed by your AI agents. It manages a collection of different computation types, each with its own set of rules and expectations.

Think of it as a quality control system for your agent's work. You can register various computations – like calculating costs, analyzing data, or generating reports – and the service will validate them against defined schemas.

The `addCompute` method lets you register a new computation type, associating it with a specific schema to guide validation. You can easily retrieve a list of registered computations with `getComputeList`.  The `validate` method then performs the actual validation process, checking if a given source conforms to the rules of the registered computation. The service relies on logging and state management components handled by the `loggerService`, `stateValidationService`, and `stateSchemaService` properties.

## Class ComputeUtils

This class, ComputeUtils, provides tools to manage and retrieve information about computational resources within the system. You can use it to update the status of a compute resource, associating it with a specific client, and to fetch details about a compute resource, allowing you to retrieve data in a format you define. Essentially, it simplifies interacting with and keeping track of your compute resources. The `update` method allows you to register or refresh the status of a compute, while `getComputeData` lets you pull the associated data back in a type-safe way.

## Class ComputeSchemaService

This service helps manage and organize how AI agents understand and process data structures, essentially defining the “shapes” of the information they work with. It acts as a central repository for these data structure definitions, allowing different agents to consistently interpret the same data. 

The service relies on a logger for tracking activity and a schema context service to handle schema-related operations. 

You can register new data structure definitions, replace existing ones, or retrieve them when needed. Think of it like a dictionary where each key represents a specific data structure, and the value is a detailed description of what that data should look like. This ensures everyone is on the same page when it comes to data.

## Class ComputePublicService

This class, `ComputePublicService`, is a central point for interacting with compute resources. It manages connections and provides methods to retrieve, process, and update data related to those compute resources. 

You’ll find properties like `loggerService` and `computeConnectionService` which handle logging and connection management respectively. 

The `getComputeData` method lets you fetch specific data based on the method name, client ID, and the name of the compute resource. The `calculate` method performs computations, while `update` allows modifications, and `dispose` handles the cleanup process. Essentially, this class provides a clean interface for managing and working with compute resources within the swarm orchestration framework.

## Class ComputeConnectionService

The ComputeConnectionService is a central component for managing and executing computational tasks within the AI agent swarm. It handles connecting to and retrieving compute resources, using services for logging, messaging, context management, schema validation, session management, and state persistence. It also uses a shared compute set for efficient resource utilization. 

You can think of it as the traffic controller, responsible for getting the right compute resources involved in specific tasks. The `calculate` method triggers computations based on state information, while `update` refreshes data, and `dispose` cleans up resources when no longer needed. It keeps track of compute references for optimized access and provides methods for fetching and updating compute data.

## Class CompletionValidationService

This service makes sure that completion names used within the agent swarm are unique and properly registered. It keeps track of all approved completion names, preventing conflicts and ensuring consistency. 

It works closely with other parts of the system, like the service that handles completion registration and the service that validates agent behavior.  The service is designed to be efficient, reusing previous validation results to avoid unnecessary checks.

You can add new completion names to the system using the `addCompletion` method.  The `validate` method then checks if a given completion name is valid, and it remembers previous checks to speed things up. The service also logs important events, giving you visibility into the validation process.

## Class CompletionSchemaService

The CompletionSchemaService manages the definitions of completion logic used by agents in the swarm. Think of it as a central library where agents can find instructions on how to complete tasks. It makes sure these instructions are valid and consistent, working closely with other services like the agent schema and connection services. 

This service stores these definitions—called "completion schemas"—and provides ways to add new ones, update existing ones, and retrieve them when needed. It keeps a record of these schemas, making sure they're properly registered and easily accessible to the various parts of the swarm system. It also validates these schemas to ensure they're set up correctly before they’re used, which is crucial for reliable agent execution. Logging is used to track what's happening with these schemas to help with troubleshooting and monitoring.

## Class ClientSwarm

This class, `ClientSwarm`, is like a conductor for a team of AI agents. It manages all the agents within a swarm, ensuring they work together smoothly. Think of it as a central hub that handles tasks like switching between agents, waiting for their output, and keeping track of where you are within the agent workflow.

It's built to be flexible and responsive, constantly updating information about agent changes and providing real-time output notifications.  It integrates with other parts of the system to handle everything from creating the swarm to executing agent tasks and managing their output.

Here’s a breakdown of what it does:

*   **Manages Agents:** Keeps track of all the agents in the swarm and handles switching between them.
*   **Waits for Output:**  Provides a way to wait for an agent to finish its task and provide a result, making sure only one wait operation happens at a time.
*   **Navigation:**  Remembers the path you’re taking through the agents, allowing you to go back and forth.
*   **Notifications:**  Keeps everyone informed about changes in agents and their output.
*   **Cleanup:** Provides a way to properly shut down the swarm when it's no longer needed.



Essentially, `ClientSwarm` simplifies working with multiple agents, ensuring they communicate effectively and their actions are coordinated.

## Class ClientStorage

This class, called `ClientStorage`, is responsible for managing data storage within the swarm system, making it easily searchable using embeddings. Think of it as a central place to store and retrieve data, optimized for finding similar items.

When you create a `ClientStorage` instance, it handles storing, removing, and updating data.  It’s also able to quickly find items that are similar to a given search term.  The system uses a combination of internal maps for fast access and a queued dispatch system to ensure operations happen in the correct order, making it safe for multiple parts of the system to interact with the storage.

Key features include:

*   **Embedding-based Search:** Finds items that are semantically similar, not just matching keywords.
*   **Queued Operations:** Ensures storage changes happen one at a time, preventing conflicts.
*   **Caching:** Avoids unnecessary computations by remembering previously calculated embeddings.
*   **Event-driven updates:** Notifies other parts of the system when data changes.

The `take` method is your go-to for finding similar items. `upsert`, `remove`, and `clear` handle data modification.  `get` and `list` allow you to retrieve data directly, while `dispose` cleans up the storage when it’s no longer needed.

## Class ClientState

The ClientState class manages the data and behavior for a single agent within the swarm system. It’s like a central hub for an agent's information, handling reads and writes to that data in a controlled and organized way. Think of it as a way to make sure all changes to an agent's state happen safely and consistently, even if multiple parts of the system are trying to access it at the same time.

It's designed to work closely with other components, like services that handle connections and agents that use the state to make decisions. The ClientState keeps track of when the state is ready, ensures changes are written properly, and lets other parts of the system know when the data has been updated.

You can use it to initialize an agent’s starting data, update that data over time, and safely retrieve the latest information. It also provides a way to clean up resources when the agent is finished with its work. Essentially, ClientState makes sure each agent has a reliable and well-managed data foundation.

## Class ClientSession

The `ClientSession` manages interactions within a swarm of AI agents for a single client. Think of it as a dedicated workspace where the client's requests and agent responses are handled.

When a client sends a message, the `execute` method uses the swarm's agents to process it, checking for policy compliance and returning the result. For quick, stateless tasks, the `run` method provides a faster execution path without output validation or emission.

Several methods allow you to record actions within the session, like logging tool outputs (`commitToolOutput`), user messages (`commitUserMessage`), or system updates (`commitSystemMessage`). These actions are tracked within the agent's history.

You can connect to a message connector to receive real-time updates from the session using `connect`, and when the session is finished, the `dispose` method cleans up resources. This whole system is designed to keep track of client activity and ensure the AI agents are working within defined boundaries.

## Class ClientPolicy

The `ClientPolicy` class acts as a gatekeeper for your AI agent swarm, controlling access and ensuring messages are safe and compliant. It manages who can connect, filters incoming and outgoing messages, and handles banning clients who violate the rules.

Think of it as having a customizable security system that automatically blocks unwanted connections, checks messages for problems, and can even temporarily or permanently ban clients that misbehave.

This class works closely with other parts of the system. It gets its rules and initial banned client lists from configuration, enforces swarm-level restrictions defined elsewhere, validates messages before they are sent or received, and signals events to notify other components about changes like bans or unbans.  The list of banned clients isn's immediately loaded, it’s fetched only when needed for efficiency.

If a client tries to send a message that doesn't meet the rules, the system can automatically ban them and provide a message explaining why.  The system is also designed to easily customize how bans are handled, including how messages are generated and whether bans are persistent.

## Class ClientOperator

The ClientOperator is a key component for managing interactions within the AI agent swarm. Think of it as the bridge between the user and the agents. It's responsible for sending instructions and receiving responses, essentially coordinating the flow of information.

It handles things like sending user messages, assistant messages, and requests for tools. You can instruct it to execute specific actions, wait for results, and manage changes to the agents involved. The ClientOperator also provides methods for cleanup and releasing resources when its work is complete.

## Class ClientMCP

This component, the ClientMCP, helps manage the tools available to different AI agents. Think of it as a central place to find and use tools.

It remembers which tools are available for each agent, so it doesn't have to constantly check. You can ask it to list all tools for a particular agent, or check if a specific tool exists.

If the list of tools changes, you can refresh it for a single agent or for all agents. When you want an agent to use a tool, you use this component to actually run the tool with the right instructions.

Finally, when an agent is finished, you can tell the component to clean up resources associated with that agent, removing any cached tools.

## Class ClientHistory

The ClientHistory class manages an agent's conversation history within the swarm system. It stores, retrieves, and filters messages, and keeps everything in sync with other parts of the system through events.

When a new message arrives, the `push` method adds it to the history and signals this change to other components. The `pop` method retrieves and removes the most recent message, useful for actions like undoing steps.

To get a complete, unfiltered view of the history, you can use `toArrayForRaw`. For generating completions for an agent, `toArrayForAgent` is used. This method carefully filters and formats the messages, taking into account agent-specific rules and configuration.

Finally, `dispose` cleans up resources when the agent is no longer needed, ensuring efficient memory usage.

## Class ClientCompute

The `ClientCompute` class is designed to handle the interactions and computations needed by an AI agent swarm. It’s essentially a way to manage and execute tasks within the swarm’s computational environment.

When you create a `ClientCompute` instance, you provide initial setup information through parameters. It holds these parameters for later use.

The `getComputeData` method fetches data related to the computation, allowing you to retrieve necessary information for processing.

The `calculate` method is the workhorse – it performs the core computations for a specific state within the swarm.

The `update` method allows you to refresh the computation's status or data.

Finally, `dispose` is used to clean up resources when the computation is no longer needed, ensuring proper resource management.


## Class ClientAgent

The `ClientAgent` manages how an agent within a larger system receives and processes messages, and coordinates interactions with tools and other services. It's responsible for running messages, executing tools, and keeping track of the agent's history, all while preventing overlaps in operations.

Think of it as the core engine that handles incoming instructions, figures out what tools to use, manages errors, and makes sure everything is logged and communicated correctly within the overall system.

Here’s a breakdown of what it does:

*   **Handles Messages:**  It receives instructions ("messages") and decides what to do with them, including running tools or generating responses.
*   **Tool Management:** It figures out which tools are available, resolves any conflicts, and executes them as needed. It can also stop tool execution if necessary.
*   **Error Recovery:** If things go wrong (like a tool failing), it has strategies to try and recover, like re-trying or generating a placeholder response.
*   **Communication:** It communicates changes and outputs to other parts of the system, like logging interactions and broadcasting results.
*   **State Tracking:**  It meticulously keeps track of everything that happens – messages, tools, errors – ensuring a complete record of the agent’s activity.



The `ClientAgent` has several components that make these actions possible:



*   **`_toolAbortController`**: Manages the lifecycle of tool executions.
*   **`_agentChangeSubject`**: Signals changes to the agent's state, allowing for controlled interruptions.
*   **`_resqueSubject`**:  Indicates a model resurrection event, used for error recovery.
*   **`_toolErrorSubject`**:  Reports errors during tool execution.
*   **`_toolStopSubject`**:  Signals a halt to tool execution.
*   **`_toolCommitSubject`**: Indicates tool output commitments.
*   **`_outputSubject`**:  Emits transformed outputs.



Methods like `execute` and `run` handle the actual processing of messages, while others like `commitUserMessage` and `commitToolOutput` manage the logging and communication of events.  `dispose` cleans up the agent when it's no longer needed.

## Class ChatUtils

The `ChatUtils` class is designed to manage and control AI chat sessions for different clients, acting as a central hub for orchestrating these conversations. It handles the creation, sending, and cleanup of chat instances, allowing you to easily start and stop conversations. 

You can configure the framework by specifying which chat instance constructor to use with `useChatAdapter` and customizing the callbacks used during chat sessions via `useChatCallbacks`.  The `beginChat` method kicks off a chat session for a specific client, while `sendMessage` allows you to send messages within that session.  The `listenDispose` method provides a way to monitor when a chat session is complete, and `dispose` cleans up resources associated with a chat instance. This class helps organize the entire lifecycle of an AI agent's conversations.

## Class ChatInstance

The `ChatInstance` class represents a single chat session within an AI agent swarm. It's responsible for managing the lifecycle of that chat, from starting it to sending messages and eventually cleaning up resources. 

Each instance is uniquely identified by a client ID and associated with a specific swarm. When a `ChatInstance` is no longer needed, the `dispose` method allows you to gracefully shut it down and release associated resources. 

You can send messages to the chat using `sendMessage`, and the system automatically checks for inactivity using `checkLastActivity` to ensure the chat remains responsive. To be notified when a chat is disposed, you can register a listener using `listenDispose`. The `beginChat` method initiates the chat session.

## Class BusService

The `BusService` acts as a central hub for communication within the AI agent swarm, managing how different parts of the system send and receive information. Think of it like an internal messaging system.

It lets different agents subscribe to specific types of events, so they get notified when something interesting happens – for example, when a task starts or finishes.  You can also subscribe to events for *all* agents ("wildcard" subscriptions) if you need a broad overview.

When something happens, the `BusService` emits an event, which is then delivered to all the subscribed agents.  The service keeps track of everything, and it’s designed to be efficient, reusing internal components to avoid unnecessary overhead.

It integrates closely with other services like the logging and session validation systems, ensuring that everything is tracked and secure.  Functions like `commitExecutionBegin` and `commitExecutionEnd` are essentially shortcuts for common event types related to task execution, simplifying the process for other components. Finally, `dispose` provides a way to clean up subscriptions when an agent is no longer needed, freeing up resources.

## Class AliveService

The `AliveService` class helps keep track of which clients are actively participating in your AI agent swarms. It allows you to easily signal when a client comes online or goes offline within a particular swarm. The service handles logging these status changes and, if configured, saves this information for later retrieval, using a persistent storage adapter. Think of it as a heartbeat monitor for your swarm members, ensuring you always know who’s currently engaged. The `markOnline` method indicates a client is available, while `markOffline` signifies it’s no longer active.

## Class AgentValidationService

This service manages and verifies the configurations of agents within the swarm system. It acts as a central point for ensuring agents are properly set up and compatible with each other.

Think of it as a quality control system for your agents. It keeps track of their schemas (definitions), storage resources, and any dependencies they have on other agents.

You can use this service to:

*   Register new agents and their configurations.
*   Check if an agent has specific resources like storage or a dependency on another agent.
*   Fully validate an agent's setup to ensure it’s ready to run.

It works closely with other services to handle tasks like schema validation, tool checks, and storage verification, and it uses caching to make these checks faster.  It also keeps a log of important operations, helpful for debugging and monitoring the swarm's health.

## Class AgentSchemaService

This service acts as a central place to define and manage the blueprints for your AI agents within the swarm system. Think of it as a library of agent templates.

It keeps track of agent schemas, ensuring they are consistent and valid. These schemas describe what an agent *is* – its name, what it does, what it depends on, and what resources it needs. 

When you create or update an agent, this service validates its schema and makes sure it's well-formed. It also logs activity so you can keep track of what's happening.

You can use this service to:

*   **Register** new agent types, essentially adding them to the library.
*   **Retrieve** existing agent types when you need to create or configure agents.
*   **Update** existing agent types to change their behavior.

The service relies on other components for logging and schema context management, and it plays a key role in ensuring the entire agent swarm functions properly.

## Class AgentPublicService

This service acts as a public interface for interacting with agents in the swarm system. It handles common operations like creating agents, executing commands, running quick completions, and managing the agent’s history (like adding user messages, tool outputs, and system prompts).

Essentially, it simplifies how you work with agents by wrapping underlying operations and adding extra features like logging and context management. Each method—execute, run, commitToolOutput, and others—adds context, logs actions if enabled, and often triggers related events and performance tracking within the larger system. Think of it as a friendly layer on top of the core agent management, making it easier to use and more integrated with the rest of the swarm. 

It relies on other services for logging, agent connections, and managing performance and documentation, ensuring everything operates consistently. This service provides a streamlined way to manage agent activity and keeps track of what’s happening.

## Class AgentMetaService

This service helps manage information about your AI agents, making it easier to understand how they relate to each other. It takes the structured data describing each agent – like its dependencies and states – and transforms it into a visual format, specifically UML diagrams. Think of it as creating a map of your agent swarm.

The service builds these maps in two ways: one that includes all the details and another that focuses on just the connections between agents.  You can then use these diagrams for documentation, debugging, or to simply get a better overview of your system.  The system also keeps track of activity with logging, and it integrates with other parts of the framework like the documentation and performance monitoring services.

## Class AgentConnectionService

This service manages agent connections and operations within the AI agent swarm system. Think of it as a central hub for creating, running, and tracking agents. It reuses agent instances efficiently through caching, and connects to various other services to handle everything from logging and event emission to storing history and tracking usage. 

It provides methods to:

*   **Get an agent:** Retrieves or creates a cached agent instance for a given client and agent name.
*   **Run commands:** Executes commands and runs stateless completions on the agent.
*   **Manage history:** Logs different types of messages (user messages, tool outputs, system prompts) to the agent's history.
*   **Control execution:** Provides methods to interrupt tool execution or clear the agent's history.
*   **Clean up:** Disposes of the agent connection and clears cached instances.

Essentially, this service makes it easier to work with AI agents by taking care of the underlying connection management and coordinating with other parts of the system.

## Class AdapterUtils

This class provides helpful tools for connecting to different AI services and getting them to work together. Think of it as a translator, letting your system talk to Cohere, OpenAI, LMStudio, and Ollama in a consistent way. 

It offers functions to create specific "completion functions" for each of these services – essentially, you give it the service’s client library and it prepares a reusable function you can use to send requests and get responses. You can even specify the AI model you want to use and other details like the format of the response to tailor the interaction.

# agent-swarm-kit interfaces

## Interface TAbortSignal

This interface lets you signal when an operation needs to be stopped, like canceling a long-running task. It builds upon the standard web API for abort signals, giving you a typed version for better control within your AI agent swarm orchestration. Think of it as a way to gracefully halt processes when needed, ensuring your system behaves predictably. You can tailor this interface to add custom features or data relevant to your specific application's cancellation needs.

## Interface IWikiSchema

This interface, `IWikiSchema`, defines the structure for a wiki knowledge base that AI agents can interact with. It's like a blueprint for how the wiki is organized and how agents can pull information from it.

The `wikiName` property provides a unique identifier for the wiki.  You can optionally add a `docDescription` to explain what the wiki is about. To allow for customized behavior, there's a `callbacks` property which lets you hook into the wiki’s operations.

Finally, the `getChat` method lets agents request specific responses or information from the wiki, taking arguments to guide the request and returning a string containing the AI's reply.

## Interface IWikiCallbacks

This interface defines a set of optional callbacks you can use to be notified about events happening within a system that interacts with a wiki. Specifically, the `onChat` callback will be invoked whenever a chat-related action takes place, providing you with details about that interaction through the `IChatArgs` object. Think of it as a way to "listen" for chat activity and react accordingly, such as logging messages or triggering other processes.  You don't *have* to implement these callbacks, but if you want to monitor and respond to chat events, providing them is the way to do it.

## Interface ITriageNavigationParams

This interface defines the information needed to set up how an AI agent navigates through tasks. It lets you specify the name of a tool the agent will use, provide a clear description of what that tool does, and optionally add a documentation note for clarity. You can also configure it to skip specific outputs when the agent has multiple navigation options, streamlining the workflow. Essentially, it's a blueprint for guiding the agent's actions and ensuring it uses the right tools for the job.

## Interface IToolRequest

This interface defines what’s needed to ask the system to run a specific tool. Think of it as a request form – it tells the system which tool you want to use and what information it needs to work. 

It has two main parts: the name of the tool you want to run, and then any information the tool needs to actually do its job, like search queries or file paths. The system checks these inputs to make sure they make sense for the tool you're trying to use.

## Interface IToolCall

This interface describes a request to use a specific tool within the agent system. Think of it as a note passed from the AI model to an agent, saying "Hey, I need you to run this tool."

Each tool call has a unique ID so the system can keep track of it. 

Currently, all tool calls are function calls, meaning they involve executing a defined function with specific arguments provided by the model. The interface specifies both the name of the function and the data it needs to run.

## Interface ITool

The `ITool` interface describes a tool that can be used by agents within the system. Think of it as defining what a tool *is* – its type, and what it can do. 

It specifies the tool's type, which is currently limited to "function," but could expand to include other options like APIs or scripts later on.  More importantly, it details the function itself: its name, what it does (description), and the format of the data it expects as input (parameters). This information lets the AI agent understand how to use the tool and generate appropriate requests to execute it. The system uses this definition to match the tool to its actual implementation when a call needs to be executed.

## Interface ISwarmSessionCallbacks

This interface provides a way to listen for important events happening within your AI agent swarm sessions. You can use these callbacks to track when a client connects, when commands are run, when messages are sent, and when sessions are initialized or ended. Think of them as notification hooks – they let you react to what’s going on inside the swarm, maybe for logging, debugging, or triggering other actions.  Each callback tells you which client is involved, the swarm's name, and relevant data like the command being executed or the message being sent.

## Interface ISwarmSchema

This interface defines the blueprint for how a swarm of AI agents is set up and managed. It lets you configure things like saving the swarm's progress and state so you can resume later, giving it a descriptive name for documentation, and setting up access control policies. 

You can also customize the swarm’s initial navigation path, how it selects which agent is currently in charge, and even provide your own functions to handle important events.  The interface specifies a default agent to use when one isn't explicitly chosen, provides a unique name for the swarm, lists all the agents that can participate, and allows for optional callback functions to extend its behavior.

## Interface ISwarmParams

This interface defines the information needed to set up a swarm of AI agents. Think of it as a blueprint for creating and configuring the swarm. 

It includes a unique ID for the client launching the swarm, a logger to keep track of what's happening, and a communication bus so agents can talk to each other. You also provide a list of the agents themselves, so the swarm knows who's participating. Essentially, it bundles together the essentials for the swarm to operate.

## Interface ISwarmDI

This interface acts as a central hub for accessing all the critical services that power the AI agent swarm system. Think of it as a toolbox containing all the essential components for managing the swarm’s behavior, connecting its parts, and ensuring its reliable operation. It provides access to services for documentation, communication, performance monitoring, agent lifecycle management, and much more, allowing you to interact with and control the system's various functions. Essentially, it’s the key to unlocking and interacting with the core functionality of the AI agent swarm.


## Interface ISwarmConnectionService

This interface defines how different agents within your AI swarm can connect and communicate with each other. It's essentially a blueprint for building reliable connections, ensuring that only the necessary functions are exposed publicly. Think of it as a way to control which features are available to the outside world while keeping the internal workings of the swarm connection service organized and secure. By using this interface, you're creating a clear and consistent way for agents to interact, leading to a more stable and predictable swarm environment.

## Interface ISwarmCallbacks

This interface lets you listen in on important events happening within your AI agent swarm. Specifically, you can set up a function to be notified whenever an agent's role or responsibility changes within the swarm. This is handy if you need to keep track of which agent is doing what, or if you want to update the user interface to reflect the current state of the swarm's operations. Think of it as getting real-time updates about agent assignments within the swarm.

## Interface ISwarm

The `ISwarm` interface lets you interact with a group of AI agents working together. You can use it to get the name of the agent currently leading the work, or to directly access the agent itself. Need to step back and undo a recent action? `navigationPop` lets you rewind the navigation stack. To stop an ongoing process and get an empty result, use `cancelOutput`. `waitForOutput` retrieves the combined output from the active agent. You can also send messages to the session using `emit`, or manage the agents themselves by registering or updating them with `setAgentRef`. Finally, `setAgentName` allows you to choose which agent is currently in charge.

## Interface IStorageSchema

This interface defines how storage behaves within the agent swarm, covering aspects like whether data is saved permanently, how it's accessed, and how it's indexed. You can configure the storage to save data to disk, provide a description for documentation purposes, and even share it between agents. Developers have the flexibility to customize data retrieval and persistence through optional functions, define how data is indexed for searching, and tailor storage behavior with lifecycle callbacks. The unique name assigned to each storage instance helps manage and identify it within the swarm, and a function allows for generating indexes to improve search capabilities.

## Interface IStorageParams

This interface defines how the system manages and interacts with storage. It’s like a blueprint for how different components connect to and use a storage resource.

Each storage instance needs a unique client ID to identify its owner. The system also uses this interface to calculate how similar two pieces of data are, and to save and retrieve calculated embeddings – these are numerical representations of text used for searching. When new text needs to be indexed, the interface provides a way to generate an embedding. It also includes a name for the storage and ways to log events and communicate within the larger system.

## Interface IStorageData

This interface describes the basic structure of information that’s saved within the system. Every piece of data you store will have an `id`, which acts like a unique name so the system can easily find and manage it. Think of it as a primary key for each saved item.

## Interface IStorageConnectionService

This interface helps us define how agents connect to storage, but in a way that focuses on what users actually need to know. It's like a blueprint for building those connections, making sure the public-facing parts are clear and consistent. We use it to create a standardized way for agents to interact with storage, hiding the complex internal details.

## Interface IStorageCallbacks

This interface defines a set of notification functions you can use to monitor and react to events happening within a storage system. You can register these functions to get notified when data is changed, when a search is performed, or when the storage is being set up or cleaned up. Think of them as hooks that allow you to build custom logic around storage operations, like logging changes or synchronizing data with other systems. You'll receive information about the specific items involved, the client making the request, and the name of the storage being used.

## Interface IStorage

This interface provides a way to manage data within the AI agent swarm orchestration framework. It allows you to fetch data based on search queries, insert or update existing data entries, and delete specific items using their unique IDs. You can also retrieve individual items by ID, list all items with optional filtering, and even completely clear the storage. Think of it as a central hub for organizing and accessing the information needed by the agents in your swarm.

## Interface IStateSchema

This interface describes how a piece of data, or “state,” is managed within the system. It's a blueprint for how this data is configured and behaves.

You can choose to save the state data permanently, add a description to make it easier to understand its purpose, or allow multiple agents to share it. 

The interface also lets you define how the initial state is created, how its current value is retrieved, and how it's updated. It even allows you to add custom logic that runs when the state changes, and to process the state with middleware functions to handle it in specific ways.

## Interface IStateParams

This interface defines the information needed to manage a state within the agent swarm. Think of it as the set of tools and identifiers used to keep track of and interact with a particular state. 

Each state gets a unique client ID to identify it, and a logger to record what's happening. 

Finally, it uses a communication bus to send and receive messages with other parts of the swarm.

## Interface IStateMiddleware

This interface defines how you can create components that sit between different steps in your AI agent swarm's process—think of them as checkpoints. They let you peek at the current state, potentially tweak it, or even make sure it’s in the right format before things move forward. This is useful for things like ensuring data consistency or adding extra information during the workflow. Essentially, it provides a way to customize how the swarm handles its internal data as it progresses through its tasks.

## Interface IStateConnectionService

This interface helps ensure a clear and consistent way to interact with the agent swarm's internal state. It’s designed to provide a specific, type-safe view of the state connection service, hiding the implementation details and focusing on what's meant for public use. Think of it as a blueprint for how external systems should connect and manage the swarm's state, guaranteeing a predictable and reliable interaction.

## Interface IStateChangeContract

This interface defines a contract for how components communicate state changes within the AI agent swarm orchestration framework. Specifically, it outlines a mechanism for notifying subscribers when the state of a subject – represented by a string identifier – has changed. Think of it as a way to broadcast updates about the current status of different aspects of your swarm, allowing various components to react accordingly. The `stateChanged` property is key here; it provides a way to listen for these state updates and respond to them as needed.

## Interface IStateCallbacks

This interface helps you keep track of what’s happening with your agent swarm’s state. It provides a way to be notified when a state is first set up, when it’s being cleaned up, when it’s loaded, and whenever its data is read or written. You can use these notifications to perform actions like logging, setting up initial configurations, or responding to changes in the state. Think of it as a way to listen in on the lifecycle of your agent's data.

## Interface IState

This interface helps you manage the information your AI agents are using and sharing. Think of it as a central place to store and update the collective knowledge of your agent swarm. 

You can retrieve the current state at any time using `getState`. When you need to change the state, you don’t directly modify it; instead, you provide a function, `dispatchFn`, that calculates the new state based on the old one, and `setState` handles the update. Finally, `clearState` allows you to reset everything back to the starting point defined in your system's configuration.

## Interface ISharedStorageConnectionService

This interface helps us define how different parts of the AI agent swarm orchestration framework can connect to shared storage. Think of it as a blueprint – it lays out the essential functions needed for interacting with storage, but it leaves out the internal details. This ensures that the publicly accessible parts of the storage connection service are consistent and well-defined, allowing different components to work together smoothly. It’s specifically designed to create a clear and predictable way for the system to share information between agents.

## Interface ISharedStateConnectionService

This interface helps define how different parts of the system connect and share information. Think of it as a blueprint that makes sure the public-facing connections are consistent and excludes any internal workings. It's designed to be used when creating specific connection services, guaranteeing they stick to the expected behavior and don't expose anything that's not meant to be public.

## Interface ISharedComputeConnectionService

This interface defines how your AI agents connect to a shared computing environment, like a cluster or server. It provides a standardized way for agents to request resources, such as processing power or memory, and to be notified when those resources are available or when the connection changes. Think of it as the common language agents use to talk to the underlying infrastructure they need to run their tasks. It allows for flexibility in how the actual connection is implemented, whether it's through a cloud provider or a local server, while still providing a consistent interface for the agents. The `ISharedComputeConnectionService` helps to orchestrate and manage the agents effectively by ensuring they can reliably access and utilize computational resources.

## Interface ISessionParams

This interface outlines the essential information needed to kick off a new session within your AI agent swarm orchestration framework. Think of it as the blueprint for setting up a session – it includes things like a unique client identifier, a logger for tracking what's happening, and rules (a policy) to guide the session’s behavior. It also incorporates the communication system (bus) and the overarching swarm management structure. Finally, it specifies the name that identifies the specific swarm this session is operating within.

## Interface ISessionContext

The `ISessionContext` interface holds all the key details about a client's session within the AI agent swarm. Think of it as a container for information like which client initiated the request (`clientId`), what process is currently running (`processId`), and any specifics about the method being used or the current execution stage. It gives you a comprehensive view of the ongoing activity within the system, making it easier to track and manage different client interactions and tasks. The `methodContext` and `executionContext` provide more granular details if they are relevant to the session.

## Interface ISessionConnectionService

This interface defines the public-facing methods for managing connections within the agent swarm orchestration system. Think of it as a blueprint for how external components interact with the system's connection management. It's specifically designed to provide a clear and predictable way to establish and handle communication links without exposing any internal workings. By using this interface, we can ensure a stable and reliable connection experience for anyone interacting with the agent swarm.

## Interface ISessionConfig

This interface, `ISessionConfig`, helps you control how often your AI agents run or how quickly they can execute tasks. Think of it as a way to prevent your agents from overwhelming resources or running too fast.  You can set a `delay` property, which is a number representing the time (in milliseconds) you want to wait between each session or task execution.  Additionally, the `onDispose` property lets you define a function that will be called when the session is finished or cleaned up, allowing you to perform any necessary final actions.

## Interface ISession

The `ISession` interface defines how you interact with a single conversation or workflow within the AI agent swarm. Think of it as the main control panel for a specific task the agents are working on.

You can add messages to the session’s record—both from the user and from the AI assistants—using `commitUserMessage`, `commitAssistantMessage`, and `commitSystemMessage`.  `commitToolOutput` and `commitToolRequest` allow you to manage the tools the agents use.  `commitFlush` resets the session, clearing out all previous interactions. `commitStopTools` will prevent the AI from continuing its actions.

The `notify` function is for sending updates to external listeners, while `emit` just sends a message through the session’s channel.  `run` lets you quickly test something without permanently adding it to the conversation history. `execute` is the primary way to trigger agent actions and can be configured to impact the session’s history.

`connect` establishes a two-way communication link, allowing your application to send and receive messages.

## Interface IScopeOptions

This interface, `IScopeOptions`, helps you configure how your AI agent swarm operates within a specific context. Think of it as setting the environment for your agents. 

You'll use it to provide a unique identifier for your application, known as the `clientId`, and a descriptive name for the group of agents you’re working with, the `swarmName`. 

Finally, it allows you to define a function, `onError`, which will be called if something goes wrong during the swarm's operation – providing a way to handle any unexpected errors gracefully.

## Interface ISchemaContext

This interface, `ISchemaContext`, acts as a central hub for accessing various schema registries within the agent swarm orchestration framework. Think of it as a directory containing tools for understanding and validating the structure of different agent types and their interactions. Each property within `ISchemaContext`, like `agentSchemaService` and `completionSchemaService`, provides a dedicated registry for a specific type of schema – agent definitions, completion suggestions, and more. This allows your code to easily retrieve and work with the schema information it needs, ensuring agents operate consistently and correctly. You can use these registries to validate agent configurations and understand the expected format of data exchanged between them.


## Interface IPolicySchema

The `IPolicySchema` defines the structure for configuring how your AI agent swarm enforces rules and manages banned clients. It lets you customize aspects like whether banned clients are saved permanently, provides a description for documentation, and assigns a unique name to the policy. 

You can specify a default message to display when a client is banned, or even provide a function to generate custom ban messages. It also includes options to automatically ban clients after failed validations, retrieve the current list of banned clients, or completely replace the default way of managing that list.

Most importantly, you can implement your own validation logic for incoming and outgoing messages, and hook into specific policy events using callbacks for greater control over your swarm’s behavior.

## Interface IPolicyParams

This interface defines the essential information needed to set up a policy within the agent swarm. Think of it as a blueprint that ensures each policy has the tools it needs to function correctly. 

It includes a way to log activity and any errors that might occur, helping you track how the policy is performing. 

It also provides access to a communication channel, called a bus, allowing the policy to interact with other agents and components within the swarm.

## Interface IPolicyConnectionService

This interface helps us make sure the parts of our system that developers interact with are clearly defined and don't include any internal workings. It's a way to create a clean, public-facing definition of how to connect and manage policies within the agent swarm. Think of it as a blueprint for how developers should use the policy connection service, stripped of any implementation details.

## Interface IPolicyCallbacks

This interface lets you hook into key moments in a policy's life, giving you opportunities to react to what’s happening. You can use the `onInit` callback to perform setup tasks when a policy is first created. The `onValidateInput` and `onValidateOutput` callbacks are helpful for keeping an eye on incoming and outgoing messages during the validation process. Finally, the `onBanClient` and `onUnbanClient` callbacks notify you when a client is either blocked or allowed to interact with the swarm.

## Interface IPolicy

This interface defines how a policy manages client interactions within the agent swarm. It allows you to check if a client is banned, retrieve a ban message if applicable, and validate both incoming and outgoing messages to ensure they adhere to established rules. You can also use it to actively ban or unban clients, controlling their participation in the swarm. Essentially, it's the gatekeeper for client behavior and message content.

## Interface IPipelineSchema

This interface defines the structure for a pipeline within our agent swarm orchestration framework. Each pipeline has a unique `pipelineName` to identify it. 

The `execute` function is the core of the pipeline; it's how you trigger the pipeline’s workflow, specifying a client ID, the agent to start with, and any necessary data in the `payload`. The function returns a promise that resolves either with the result of the pipeline or nothing if no result is expected.

Finally, `callbacks` allow you to hook into different stages of the pipeline's execution. You can specify functions to be called at specific points, giving you more control and visibility into what’s happening.

## Interface IPipelineCallbacks

This interface defines a set of optional callback functions you can use to monitor the progress and status of your AI agent pipelines. Think of them as notification hooks – you provide these functions, and the framework calls them at specific points in the pipeline's lifecycle. 

You’re given an `onStart` function to know when a pipeline begins, providing the client ID, pipeline name, and any initial data.  The `onEnd` function lets you track when a pipeline completes, including whether it finished successfully or encountered an error, again with details like client ID, pipeline name, and final data.  Finally, `onError` is triggered if anything goes wrong during the pipeline execution, giving you the client ID, pipeline name, payload, and the error object itself, so you can handle issues gracefully.  By implementing these callbacks, you gain visibility into what your AI agent swarm is doing and can react to events in real time.

## Interface IPersistSwarmControl

This interface lets you personalize how your AI agent swarm's data is saved and retrieved. Think of it as a way to swap out the default storage mechanism for specific parts of the system.

You can use it to provide your own custom storage solutions, like using an in-memory database for active agents or connecting to a database for managing navigation stacks. This gives you a lot of flexibility in how you manage your swarm’s state, allowing you to tailor it to your specific needs and environment. Basically, it’s about controlling where and how the swarm’s active agents and navigation information are persistently stored.

## Interface IPersistStorageData

This interface describes how storage information is saved and retrieved within the AI agent swarm. Think of it as a container holding a list of data – things like key-value pairs or records – that needs to be stored persistently. It’s a standard format used by the system to ensure that important information isn't lost, and it’s a key part of how the swarm remembers things over time. The `data` property simply represents that list of information that needs saving.

## Interface IPersistStorageControl

This interface lets you tailor how your agent swarm's data is saved and retrieved. You can plug in your own storage solution instead of relying on the built-in default. This is useful if you need to connect to a specific database or use a custom persistence mechanism for a particular storage area. Essentially, you're swapping out the standard storage behavior with something more specialized to fit your needs.

## Interface IPersistStateData

This interface outlines how to save and load data related to your AI agents within the swarm. Think of it as a standard way to package up any information you want to keep around, like an agent’s settings or the progress of a session. It's designed to work with the persistence tools in the framework, ensuring that your agents can remember things between runs. The key part is the `state` property, which holds the actual data you want to store—it can be anything you need it to be.

## Interface IPersistStateControl

This interface lets you fine-tune how the system saves and retrieves the internal state of your AI agents. Think of it as a way to swap out the default storage mechanism with something tailored to your needs, like storing agent states directly in a database instead of a simple file. The `usePersistStateAdapter` method is the key to this customization, allowing you to provide your own specialized persistence logic.

## Interface IPersistPolicyData

This interface describes how to store and retrieve information about which clients are currently blocked within a specific swarm. It essentially keeps a list of session IDs, representing individual client connections, that have been banned as part of a defined policy for a particular swarm. Think of it as a blacklist for clients participating in a swarm, managed through the system's policies. The `bannedClients` property holds this list of blocked session IDs.

## Interface IPersistPolicyControl

This interface lets you customize how policy information is saved and retrieved for your AI agent swarms. If you need more control over where and how this data is stored – maybe you want to use an in-memory database instead of a traditional one – you can use this to plug in your own data storage solution. Essentially, it provides a way to swap out the default storage mechanism with your own custom adapter, allowing you to tailor the persistence behavior specifically for each swarm.

## Interface IPersistNavigationStackData

This interface describes how navigation history for agents within a swarm is saved and restored. Think of it as a list of agent names, like breadcrumbs, showing the path a user took while interacting with different agents. The `agentStack` property holds this list, keeping track of the order in which agents were used so you can easily return to previous interactions. It’s used internally by the framework to remember where you were within the agent swarm.

## Interface IPersistMemoryData

This interface describes how memory information is saved and loaded within the AI agent swarm. Think of it as a container holding the actual data – like session details or temporary working files – that your agents need to remember.  The `data` property inside this container represents the specific information being stored, and it can be any kind of data your agents need to preserve. This structure helps the system manage and store that important agent memory.

## Interface IPersistMemoryControl

This interface lets you tailor how memory is saved and retrieved for each session. Essentially, it provides a way to plug in your own custom storage solution instead of relying on the framework's default memory persistence. This is useful if you want to use a specific database, in-memory store, or any other method for managing session-related data. You can inject your own persistence adapter to control precisely how that memory is handled.

## Interface IPersistEmbeddingData

This interface describes how the system stores numerical representations of text – think of them as fingerprints for different pieces of information. It's used to save these "fingerprints" alongside a unique identifier (called `stringHash`) and a descriptive name (`EmbeddingName`).  Essentially, it's a way to keep track of what a particular piece of text looks like mathematically, allowing the system to quickly compare and match related information. The core of this is the `embeddings` property, which is a list of numbers forming the embedding vector.

## Interface IPersistEmbeddingControl

This interface lets you tailor how embedding data is saved and retrieved. Think of it as a way to swap out the default storage mechanism for embeddings with your own custom solution.  You can use this to, for example, temporarily store embeddings in memory instead of a database, or to integrate with a specific external storage system. The `usePersistEmbeddingAdapter` method is your tool for making this switch, allowing you to provide your own persistence adapter class to handle embedding data management.

## Interface IPersistBase

This interface provides a foundation for how the system stores and retrieves data. It handles managing files on your computer, specifically JSON files that represent different pieces of information within the swarm.

Before you start using the system, `waitForInit` sets everything up, creating the storage folder if it doesn't exist and cleaning up any damaged files.

`readValue` lets you fetch specific information by its unique identifier, like an agent's current state. `hasValue` allows you to quickly check if a piece of information has been saved without actually retrieving it.

Finally, `writeValue` is used to save information, making sure the data is written safely and reliably.

## Interface IPersistAliveData

This interface helps the system keep track of whether your agents are currently active. It’s used to record the online or offline status of a specific agent (identified by its SessionId) within a particular swarm. Essentially, it’s a simple way to mark agents as present or absent, allowing the swarm to manage its resources and operations effectively. The `online` property is a straightforward boolean – it's either `true` (agent is online) or `false` (agent is offline).

## Interface IPersistAliveControl

This interface lets you tailor how the system remembers the "alive" status of your AI agent swarm. It provides a way to plug in your own code to handle saving and loading this status, instead of relying on the built-in methods. This is useful if you need to store the alive status in a specific location, like an in-memory database or a custom external service, and want more control over the process. Essentially, you can provide your own persistence logic that's linked to the name of your swarm.

## Interface IPersistActiveAgentData

This interface describes how we keep track of which agent is currently running for each client within a swarm. Think of it as a record that tells us, “Client X is currently using Agent Y in Swarm Z.” It's a simple way to manage which agent is active, letting us easily remember and restore that information. The `agentName` property holds the identifier, like “agent1”, that uniquely identifies the active agent.

## Interface IPerformanceRecord

This interface describes how to track the performance of a process within the AI agent swarm system. It collects metrics from different client instances to give a clear picture of how well a specific process is running.

Each performance record includes a unique identifier for the process itself (processId). It also contains a detailed breakdown of performance data from each individual client involved, captured in a list of client performance records.

Key metrics like the total number of executions, the total response time, and the average response time are all recorded.  Timestamps, including a coarse date (momentStamp), a more precise time of day (timeStamp), and a full date/time string (date), are also included to provide context. This information is designed for monitoring system efficiency and diagnosing any issues.

## Interface IPayloadContext

This interface, `IPayloadContext`, acts like a container for important information related to a task being processed. It holds two key pieces of data: a `clientId` which identifies who requested the task, and a `payload` which contains the actual data the task needs to work with. Think of it as a way to bundle together the “who” and the “what” for each operation.

## Interface IOutgoingMessage

This interface describes a message being sent *from* the swarm system to a client, like an agent's reply or a system notification. It’s how the system communicates back to the agents themselves.

Each message has a `clientId`, which is a unique identifier for the client it's going to – think of it like addressing a specific agent.  The `data` property holds the actual content of the message, like the agent's response or result. Finally, the `agentName` tells you which agent within the swarm system sent the message, providing context about the origin of the information.

## Interface IOperatorSchema

The `IOperatorSchema` interface defines how different AI agents within a swarm can connect and communicate with each other. Think of it as a blueprint for setting up those connections. The `connectOperator` property is the key: it lets you establish a communication channel between a client (identified by `clientId`) and a specific agent (identified by `agentName`). This connection allows the client to send messages to the agent and receive responses, effectively creating a pathway for coordinated actions within the swarm. The connection uses a function that takes a message and a callback function `next` to pass the response. The `next` function itself takes the agent's answer. Finally, the entire connection can be terminated using a `DisposeFn$2` function.

## Interface IOperatorParams

This interface, `IOperatorParams`, defines the essential data needed to configure and run an operator within the AI agent swarm orchestration framework. Think of it as a set of instructions for each agent. 

It includes the `agentName`, a unique identifier for the agent; `clientId`, which links the agent to a specific client or request; and a `logger` for recording events and debugging. 

Furthermore, it requires a `bus` to facilitate communication between agents and the `history` to track the agent’s actions and decisions over time. These parameters collectively provide the context and infrastructure for the agent to function effectively within the swarm.

## Interface IOperatorInstanceCallbacks

This interface defines the events your application can listen for and react to when an AI agent instance starts working. You can set up functions to be called when an agent is first initialized, when it provides an answer, when it receives a message, when it's finished and being shut down, or when it sends out a notification. Each event provides information like the client's ID, the agent's name, and the content of the answer or message. It allows you to build custom logic to respond to the agent's activity in a flexible way.

## Interface IOperatorInstance

This interface defines how you interact with a single agent within a swarm. Think of it as the way you talk to one worker in a team. 

You can use `connectAnswer` to set up a listener that will receive responses from the agent.  The `answer` method lets you send information back to the agent, and `notify` is for sending general updates.  

`recieveMessage` is for receiving messages intended for the agent, while `init` establishes the connection to begin with. Finally, `dispose` is used to gracefully shut down the agent’s connection when it's no longer needed.

## Interface IOperatorControl

This interface, `IOperatorControl`, provides a way to manage and customize how operators within the AI agent swarm orchestration framework behave. You can use it to define what happens when certain events occur within an operator by setting callback functions. Additionally, this interface allows you to inject your own custom operator adapter, essentially letting you swap out the default operator implementation with your own specialized version to tailor its behavior even further. Think of it as a way to plug in and configure individual worker components within your larger AI system.

## Interface INavigateToTriageParams

This interface helps you customize how your agents communicate when moving to a triage process. It lets you define specific messages or functions to be used in different situations. You can set a message to be sent as the 'last message' when transitioning, or tailor responses for flushing data, executing commands, or handling tool output – either by providing a static message or by using a function that adapts the message based on the client, default agent, or other relevant information. This gives you flexibility in controlling the flow and content of agent interactions during triage navigation.

## Interface INavigateToAgentParams

This interface helps you customize how your AI agents communicate and interact during navigation. It lets you define specific messages or functions to control what happens when the system needs to clear data, handle tool outputs, send messages, or trigger actions. You can even tailor these messages based on the client, the agent involved, and the last message exchanged, creating a more nuanced and controlled interaction flow. Think of it as a way to inject your own logic into the agent's communication process.

## Interface IModelMessage

The `IModelMessage` interface defines the structure of messages exchanged within the agent swarm system. Think of it as the standard way agents, tools, and the system itself communicate. It's a core element for keeping track of conversation history, generating responses, and broadcasting events.

Each message has a `role` indicating who or what sent it (like "user," "assistant," or "tool"). The `agentName` ties the message to a specific agent, especially useful when multiple agents are working together. The `content` is the actual text of the message, whether it’s a user’s input, a tool’s output, or a model’s response.

The `mode` property clarifies if a message originates from user input or a tool’s action. If the model is requesting a tool to be used, there’s a `tool_calls` array listing those requests.  Sometimes, messages include `images`, and a `tool_call_id` connects a tool’s response to its original request. Finally, a `payload` allows for additional contextual data to be included with the message.

## Interface IMethodContext

The `IMethodContext` interface provides a standardized way to track information about each method call within the AI agent swarm system. Think of it as a little packet of data that travels with every method invocation, allowing different services to understand what's happening. 

It includes key identifiers like the client session, the method's name, and the names of the agents, swarms, storage, state, compute, policy, and MCP involved in the call. This shared context is used by services like those handling performance monitoring, logging, and documentation, ensuring everyone has the same picture of what's going on during the swarm's operation.

## Interface IMetaNode

This interface describes how information about agents and their connections are organized. Think of it as a way to build a family tree or organizational chart for your AI agents – it defines the structure for representing agent relationships and what each agent uses. Each node in this tree has a name, which could be the agent’s name itself or something describing a resource it utilizes. It can also have child nodes, allowing you to create a nested hierarchy to show dependencies and more detailed information about each agent.

## Interface IMCPToolCallDto

This interface describes the information passed around when an agent requests a tool to be used. Each time an agent needs to interact with a tool, this data structure holds details like a unique ID for the tool itself, who's requesting it (the client ID), and the agent's name. 

It also carries the specific parameters needed for the tool to do its job, a list of any related tool calls, a signal to potentially cancel the operation, and a flag indicating whether it’s the final call in a series of actions. Think of it as a standardized package for communicating tool requests within the agent swarm orchestration system.

## Interface IMCPTool

This interface describes a tool used within the AI agent swarm orchestration framework. Every tool needs a name so we know what it is. Optionally, you can add a description to explain what the tool does. Most importantly, each tool needs an input schema, which outlines the structure of the data it expects to receive – think of it as a clear set of instructions on how to feed the tool the right information.

## Interface IMCPSchema

This interface outlines the essential structure and actions available for a Managed Control Plane (MCP), which acts as the central coordinator for an AI agent swarm. 

Every MCP has a unique name and can optionally have a descriptive explanation for documentation purposes. 

Crucially, it provides a way to discover what tools are available for a particular client and a method to actually execute those tools, passing in necessary data and receiving the results. 

Finally, you can register functions to be notified about important events in the MCP’s lifecycle.

## Interface IMCPParams

This interface defines the configuration needed to run an orchestration process. It ensures that the system has a way to log important events and a communication channel for handling messages. Think of it as setting up the foundational tools – a notebook for recording progress and a messenger to share updates – before you start the main work of coordinating AI agents. It provides the necessary logging and messaging capabilities to keep track of what's happening during the agent swarm's operations.

## Interface IMCPConnectionService

This service manages the connections between your AI agents and the central orchestration system. Think of it as the communication backbone allowing agents to report status, receive tasks, and generally participate in the swarm. You’ll use this to establish and maintain reliable links, ensuring agents can effectively contribute to the overall mission. It handles the low-level details of sending and receiving messages, so you can focus on the agent’s logic. Key functions include connecting, disconnecting, and sending messages, with error handling built in to keep things running smoothly.

## Interface IMCPCallbacks

This interface defines a set of functions that allow you to be notified about important events happening within the AI agent swarm orchestration framework. Think of these functions as hooks that let you react to what’s going on.

You’re notified when the system starts up (`onInit`), when resources for a specific client are cleaned up (`onDispose`), and when tools are being loaded for a client (`onFetch`).  You’re also alerted when a list of tools is requested (`onList`) and when a tool is actually used (`onCall`). Finally, you receive updates whenever the available tools change for a particular agent (`onUpdate`). These callbacks give you a way to monitor and potentially influence the behavior of the agent swarm.

## Interface IMCP

The IMCP interface lets you manage and use tools within the AI agent swarm. It provides ways to discover what tools are available for a particular client, and check if a specific tool exists. You can also use it to actually run a tool, providing it with the necessary data. Finally, the interface offers functionalities to refresh the tool lists, either globally or for a specific client, ensuring you have the most current information.

## Interface IMakeDisposeParams

This interface defines the settings you provide when you want to automatically handle the cleanup of an AI agent swarm. 

It lets you specify how long the system should wait for the swarm to finish its tasks before assuming something went wrong. 

You can also provide a function that gets called when the auto-dispose process starts, allowing you to perform any final actions or logging related to the specific client and swarm being shut down. It provides the client ID and swarm name for context.

## Interface IMakeConnectionConfig

This interface helps control how often messages are sent within your AI agent swarm. It allows you to add a delay, represented as a number, to regulate the flow of messages and prevent overwhelming the system. Think of it like putting a pause between each message to ensure smoother operation and avoid potential bottlenecks. You can adjust this delay to fine-tune the communication rhythm of your agents.

## Interface ILoggerInstanceCallbacks

This interface lets you connect to a logger and be notified about what’s happening. You can use it to react when a logger starts up, when it shuts down, or whenever a new log message is created. Specifically, you’ll get callbacks when the logger is initialized, when it's being cleaned up, and each time a debug, info, or standard log message is written. These notifications are tied to a specific client ID, allowing you to track actions related to different parts of your system.

## Interface ILoggerInstance

This interface defines how logging components should be set up and taken down gracefully within the system. It allows for client-specific logging that needs a bit more control, letting you specify when the logger is ready to be used and when it’s time to clean up after itself. 

The `waitForInit` method is used to make sure the logger is properly initialized, possibly performing asynchronous setup tasks before it starts logging.  The `dispose` method provides a way to release resources and perform cleanup actions when the logger is no longer needed.

## Interface ILoggerControl

This interface gives you tools to manage how your logging works within the agent swarm. You can set a central adapter to handle all logging, customize the lifecycle of logger instances, or even provide your own way to create loggers. 

Specifically, you can use methods to:

*   Set a global logger adapter to centralize your logging operations.
*   Define callbacks that trigger when loggers are created and destroyed for greater control.
*   Replace the default logger creation process with your own custom constructor.
*   Log messages—info, debug, or general—tied to a specific client, with automatic session checking and context tracking.

## Interface ILoggerAdapter

This interface outlines how to connect to different logging systems, allowing the framework to record events and messages tailored to specific clients. It provides methods for logging various levels of information – general logs, debugging messages, and informational updates – all while making sure the connection is valid and ready before anything is recorded. There's also a way to clean up the logging setup for a client when it's no longer needed.

## Interface ILogger

The `ILogger` interface defines how different parts of the AI agent swarm system record information. It's essentially a standard way for agents, sessions, and other components to communicate what's happening. 

You can use it to write general messages about significant events, add very detailed debugging information for troubleshooting, or just record important updates about how the system is working. Think of it as a way to keep a detailed record of the swarm's activity to help with understanding, monitoring, and fixing any problems.

## Interface IIncomingMessage

This interface describes a message coming into the AI agent swarm system. Think of it as how the system receives instructions or data from the outside world, whether that's a user or another part of the system.

Each message has a unique identifier, `clientId`, which tells the system who sent it, allowing agents to understand the origin of the request. The actual content of the message is held in the `data` property, like the text a user typed in. Finally, `agentName` specifies which agent is responsible for handling that specific message, directing it to the appropriate agent for processing.

## Interface IHistorySchema

This interface lays out how the system stores and manages the conversation history for your AI agents. Think of it as the blueprint for where and how the messages exchanged between agents and users are saved. It specifies that you'll need an "adapter" – a component that handles the actual saving and loading of these messages from a specific storage location, whether that’s a database, a file, or some other method. This adapter is crucial for ensuring that the history is persistent and accessible.

## Interface IHistoryParams

This interface defines the information needed to set up a history record for an AI agent. It includes the agent's name, a client identifier, a logger for tracking events, and a communication bus to share information within the overall system. You can control how much of the agent's past interactions are saved by specifying the maximum number of messages to keep, helping to manage the size of the history.

## Interface IHistoryInstanceCallbacks

This interface defines a set of callbacks used to manage an agent's conversation history within the system. You can use these callbacks to customize how the history is retrieved, filtered, and updated.

Specifically, you can define functions to:

*   Fetch the initial set of messages for an agent.
*   Determine which messages should be included when iterating through the history.
*   React to changes in the history array, like when a new message is added or an old one is removed.
*   Receive notifications at the beginning and end of history reading processes.
*   Handle the initialization and disposal of the history instance itself.
*   Get a direct reference to the history instance when it's created.

## Interface IHistoryInstance

This interface outlines how to manage the history of interactions for each agent in your swarm. You can use it to step through past messages for a specific agent, ensuring the history is properly loaded when needed. It provides ways to add new messages to the history, retrieve the most recent message, and clean up the history when an agent is no longer needed. Essentially, this interface provides the core functionality for remembering and retrieving an agent’s conversation history.

## Interface IHistoryControl

This interface lets you manage how the system remembers and tracks the actions of your AI agents. You can tell it which events to record and how to handle them, essentially customizing the system’s memory. It also provides a way to use your own custom logic when creating history records, giving you fine-grained control over how agent interactions are tracked. This is helpful for debugging, analysis, and potentially building advanced features that rely on detailed historical data.

## Interface IHistoryConnectionService

This interface, IHistoryConnectionService, acts as a blueprint for how to interact with the history connection service. It’s designed to be a type definition, ensuring the publicly accessible parts of the history connection service are clearly defined and consistent. Think of it as a contract – it outlines what functionality users can expect without exposing the underlying, internal workings of the system.

## Interface IHistoryAdapter

This interface helps your AI agents keep track of their conversations and actions. It provides a way to record new messages, retrieve the most recent one, and completely clear the history for a specific agent and client. You can also loop through all the recorded messages for a particular agent and client to review the entire interaction.

## Interface IHistory

This interface helps you keep track of the conversations happening with your AI agents. It lets you add new messages to the history, retrieve the most recent message, and get the history formatted in different ways.

You can add a new message using the `push` method.  To get the last message that was sent or received, use `pop`. 

If you need the history to send to a specific agent, `toArrayForAgent` will reformat it, taking into account the agent's prompt and any system instructions. For a full, unfiltered view of the message history, `toArrayForRaw` provides the complete sequence of messages.

## Interface IGlobalConfig

This file defines global configuration settings for the AI agent swarm orchestration framework. It's like a central control panel that governs how different parts of the system behave.

Think of it as a set of customizable options that affect everything from how tool calls are handled to how agents log information and manage history. You can change these settings to adapt the system to different use cases or models.

Here's a breakdown of what you can tweak:

*   **Error Handling:** How the system reacts when tool calls fail – options include flushing the conversation, attempting to recomplete, or providing custom recovery logic.
*   **Conversation History:** Controls how much conversation history is kept for each agent.
*   **Tool Usage:** Limits the number of tools an agent can use in a single run.
*   **Agent Mapping & History:** Customizes how tools are mapped and how agent history is filtered.
*   **Logging:** Adjusts the level of detail in the logs (debug, info, general).
*   **Persistence:** Defines how data (like agent states and embeddings) is stored and retrieved.
*   **Security:** Includes settings to control banning of clients and enable/disable certain features.
*   **Data retrieval**: Configure caching mechanism of vector embedding
*   **Operator Functionality**: Sets connection timeouts and operator handling for client messages.

Essentially, this file is your key to fine-tuning the entire swarm orchestration process.

## Interface IFactoryParams

This interface, `IFactoryParams`, lets you customize how your AI agent swarm interacts with users. Think of it as a way to shape the messages and actions that happen when agents navigate and respond.

You can define custom messages for specific events like when an agent needs to clear its memory (`flushMessage`), when it uses a tool (`toolOutput`), when it sends a message to the user (`emitMessage`), or when it executes a command (`executeMessage`).

These messages can be simple text strings or more complex functions that dynamically generate messages, potentially using information like the user's ID, the agent's name, or the last message they sent. This gives you a lot of control over the user experience and the information presented to the user at each step.

## Interface IFactoryParams$1

This interface lets you customize how your AI agent swarm navigates and interacts. You can provide specific messages or even functions that will be used when the system needs to flush data, execute tasks, or process tool outputs. These customizations allow for more tailored communication and behavior within the agent swarm, adapting to particular workflows or scenarios. You have the flexibility to define what's sent for flushing, executing, accepting tool outputs, and rejecting them. These can be simple text messages or more complex functions that dynamically generate responses based on the client and default agent.

## Interface IExecutionContext

The `IExecutionContext` interface provides a standardized way to track the progress of a request as it moves through the system. Think of it as a digital breadcrumb trail. It contains key identifiers—like a client ID, a unique execution ID, and a process ID—that help different parts of the system, such as the client agent, performance monitoring, and communication services, all stay aligned and understand what's happening with a specific user interaction. This ensures coordinated tracking and a unified view of each operation.

## Interface IEntity

This interface, `IEntity`, is the foundation for everything that gets stored and managed within the AI agent swarm. Think of it as the blueprint for all the data objects the system uses. Different types of data, like agent status or environment details, build upon this base to add their unique information.

## Interface IEmbeddingSchema

This interface helps you set up how your AI agents create and compare embeddings – essentially, how they understand and relate different pieces of information. You can choose whether to save the agent's progress and data persistently, giving it a memory across sessions.  The `embeddingName` lets you identify the specific embedding method being used.

The `writeEmbeddingCache` function stores embedding data, preventing the system from recomputing the same information repeatedly. Conversely, `readEmbeddingCache` lets you quickly check if an embedding already exists.  You can also add custom event handling with the `callbacks` property.

The `createEmbedding` function generates a numerical representation of a piece of text, often for storage or searching. Finally, `calculateSimilarity` measures how alike two of these numerical representations are, useful for finding related information.

## Interface IEmbeddingCallbacks

This interface lets you tap into key moments during the embedding process, which is how your AI agents understand and relate information. 

You can use the `onCreate` callback to be notified whenever a new embedding is generated, allowing you to track what information is being represented and potentially modify it further.

The `onCompare` callback gives you visibility into how two pieces of information are being assessed for similarity, letting you observe and analyze the comparisons that drive agent decisions.

## Interface ICustomEvent

This interface defines a custom event that can be used within the swarm system to share information beyond the standard event types. Think of it as a way to send unique data between agents when a simple message isn't enough. It builds upon a base event structure and lets you attach any kind of data you want through the 'payload' property. This is useful for scenarios where you need to communicate specific, user-defined information, and offers greater flexibility compared to the more structured event formats. For example, you could use it to signal a task is finished and include the result data along with that notification.

## Interface IConfig

This interface, `IConfig`, holds the settings needed to control how your AI agent swarm generates diagrams.  You can use it to specify whether to include subtrees in the generated diagram – setting `withSubtree` to `true` means subtrees will be included, while `false` means they will be excluded. Think of it as a simple on/off switch for detailed visualization.

## Interface IComputeSchema

This interface, `IComputeSchema`, defines the structure for describing individual computational tasks within your AI agent swarm. Think of it as a blueprint for what each agent needs to do and how it should interact with others.

It includes a descriptive text (`docDescription`) to explain the purpose of the computation. You can specify whether the computation is shared across agents (`shared`) and give it a unique name (`computeName`).  `ttl` allows you to set a time-to-live, after which the computation is considered invalid.

The `getComputeData` property is a function that retrieves the data needed for this computation – it knows how to fetch the information. `dependsOn` is a list of other computations that must complete before this one can start, establishing order. `middlewares` lets you add extra steps before or after the core computation logic to transform data or handle specific conditions. Finally, `callbacks` provides a way to register functions that will be executed at different points during the computation's lifecycle, offering further customization.

## Interface IComputeParams

The `IComputeParams` interface defines the information needed when running a computation within the AI agent swarm. It essentially provides the context for the computation to execute.

You'll find a `clientId` property, which acts as an identifier for the specific computation being performed.  A `logger` is also included, allowing the computation to record events and debug information.  The `bus` property provides a communication channel for the computation to interact with other parts of the system. Finally, `binding` provides a way to subscribe to state changes, allowing the computation to react to specific events.

## Interface IComputeMiddleware

This interface defines how you can add custom logic to the computation process of an AI agent within the swarm. Think of it as a way to intercept and modify the data flowing in and out of an agent's calculations. You can use it to add logging, data validation, or even transform the information before it's used or after it's produced. Implementing this interface lets you tailor the swarm’s behavior for specific needs without altering the core orchestration framework. It provides a structured way to extend the agent's computational pipeline.

## Interface IComputeConnectionService

This interface defines how your AI agents connect to and interact with a compute resource, like a server or a cloud environment. Think of it as the bridge that allows your agents to access the tools and data they need to accomplish their tasks. It focuses on providing a standard way to establish and manage these connections, ensuring your agents can work consistently regardless of the specific compute resource being used.  The methods within this interface handle things like creating a connection, checking if it’s active, and closing the link when the agent is finished. Essentially, it provides a reliable and structured way for agents to get their work done.

## Interface IComputeCallbacks

This interface defines a set of optional callbacks that can be provided when configuring a compute resource. These callbacks allow you to hook into the lifecycle of a compute resource within the agent swarm, letting you respond to important events. 

Specifically, `onInit` is called when a compute resource is being initialized, `onDispose` when it's being shut down, `onCompute` when it's performing its core task, `onCalculate` when a state is being updated, and `onUpdate` when there's a general update to the compute resource. You can use these callbacks to monitor, log, or react to the actions of individual compute units within your swarm.

## Interface ICompute

This interface defines the core actions a compute resource can perform within the agent swarm.  It provides a way for agents to calculate something based on a given state, update their status, and retrieve their current data.  The `calculate` method is used to trigger a computation, `update` allows agents to report their progress or changes, and `getComputeData` lets you check the agent's internal information. Essentially, it’s a blueprint for how compute agents interact with the overall orchestration system.

## Interface ICompletionSchema

This interface describes how a system within the swarm generates responses, like crafting a follow-up question or suggesting an action. Each completion system has a unique name to identify it. 

You can also customize what happens after a completion is generated by providing optional callback functions.

The core function, `getCompletion`, takes some input (like a conversation history and available tools) and returns a predicted response from the system – essentially, it's how the system produces its output.

## Interface ICompletionCallbacks

This interface lets you tap into what happens after an AI agent completes a task. Think of it as a way to be notified and react when a job is finished. You can use the `onComplete` function to do things like record the results, process the output further, or even start another process based on the completion. It’s a handy way to extend the framework’s functionality and customize its behavior.

## Interface ICompletionArgs

This interface defines the information needed to ask the AI agent swarm to generate a response. Think of it as a package containing all the relevant details for a single request. 

It includes a client identifier to track where the request came from, the name of the agent handling it, and the conversation history – essentially what's already been said. 

You can also provide a list of available tools the agent might use to answer the request, and specify whether the last message came from a tool or a user. This helps the agent understand the context and generate a more relevant and helpful response.

## Interface ICompletion

This interface defines how your AI agents can suggest and finalize actions. Think of it as a way to guide the agents through a process, offering options and ensuring they reach a desired outcome. It provides a full set of tools for generating responses from AI models, giving you control over the agent's actions.

## Interface IClientPerfomanceRecord

This interface, `IClientPerformanceRecord`, helps track how individual clients – like user sessions or agent instances – are performing within your system. Think of it as a detailed report card for each client.

It breaks down key metrics like the number of times a client executed a task, the amount of data it processed (both input and output), and how long those executions took.  You’re able to see the raw data for memory and state used by each client, providing insight into resource usage.

The `clientId` property ensures you can easily link the performance data back to a specific client's session or agent.  By collecting this data, you gain a much clearer picture of what’s impacting overall system performance and can identify areas for optimization on a per-client basis.

## Interface IChatInstanceCallbacks

This interface defines a set of callbacks that allow you to listen for and react to key events happening within a chat instance managed by the AI agent swarm orchestration framework. 

You can use these callbacks to monitor the lifecycle of an instance, from its initial setup (`onInit`) to when it's finished (`onDispose`).

You'll also receive notifications when a chat session starts (`onBeginChat`), a message is sent (`onSendMessage`), or when the system is checking activity status (`onCheckActivity`). These notifications provide valuable information about what's happening within the swarm and let you build custom logic to respond to specific events.

## Interface IChatInstance

This interface, `IChatInstance`, provides the core functionality for interacting with an individual AI chat session within your agent swarm. Think of it as a single window into a conversation with an AI agent.

You start a chat with `beginChat`, then send messages to the agent using `sendMessage` to get responses. `checkLastActivity` lets you monitor how recently the chat has been active, useful for managing resources. When you're done, `dispose` cleans up the chat session properly. Finally, `listenDispose` allows you to be notified when a chat session is being closed.

## Interface IChatControl

This interface, IChatControl, lets you configure how your AI agent swarm interacts with chat systems. You can tell the framework which specific chat implementation to use by setting the chat instance constructor.  It also allows you to provide custom functions to be called at various points during the chat process, enabling you to respond to events or modify behavior. Think of it as a way to personalize and integrate your AI agents with different chat platforms and tailor their reactions.

## Interface IChatArgs

This interface, IChatArgs, defines the information needed to interact with an AI agent during a conversation. Each time you want an agent to process a message, you'll provide a set of arguments that includes a unique client identifier to track the conversation, the name of the agent currently responsible for the chat, and, of course, the actual message content. Think of it as the basic ingredients for a single turn in an AI agent's conversation.

## Interface IBusEventContext

This interface provides extra details about events happening within the swarm system. Think of it as a way to tag events with information about which agent, swarm, storage, state, compute or policy is involved. When an agent sends an event, it usually only includes its own name. But for broader system events, like those managed by a swarm itself, you might find more of these details added to provide a clearer picture of what’s happening.

## Interface IBusEvent

This interface describes a standardized event used within the system to communicate between different components, particularly from ClientAgents. Think of it as a way for agents to tell the rest of the swarm what's happening – whether they’s starting a task, sending a message, or reporting a result.

Each event has a source, which indicates where it originated (usually "agent-bus" from ClientAgents). It also has a type, which specifies the kind of action being performed (like "run" or "commit-user-message").  Crucially, the event carries both input data, which might be needed to perform the action, and output data, which holds the results of that action.  Finally, contextual information like the agent's name is included to provide more details about the event.

## Interface IBus

The `IBus` interface acts like a central communication hub for the agent swarm system. It lets different parts of the system, especially agents, send updates and information to specific clients in a reliable and organized way.

The main function, `emit`, is how agents broadcast these updates. It sends structured events to a designated client, letting them know about things like message commits, tool executions, or the completion of a task. Every event follows a standard format, including details about the event type, origin, input and output data, and the intended recipient.

Using `emit` helps keep different parts of the system working together smoothly, as it allows them to communicate without being directly connected. Events are sent asynchronously and include a client ID for precise targeting. Examples include signaling the completion of a task with a result or broadcasting a validated output. The `clientId` is repeated within the event itself, providing an extra layer of clarity.


## Interface IBaseEvent

This interface outlines the fundamental structure for all events within the AI agent swarm. Every event generated by the system, whether it's a standard communication or a custom notification, will adhere to this base structure.

Each event needs a `source` property, which indicates where it came from – for example, an agent or a specific component. It also requires a `clientId` property, ensuring the event is delivered to the correct client or agent instance within the swarm. Think of `clientId` as a way to pinpoint the recipient of the event.


## Interface IAgentToolCallbacks

This interface lets you hook into the lifecycle of an agent tool, giving you control over what happens before, after, and during its operation. You can use the `onBeforeCall` callback to perform tasks like logging or preparing data right before a tool runs. The `onAfterCall` callback allows you to handle cleanup or post-processing activities once the tool has finished.  Need to ensure the tool's input is correct? The `onValidate` callback lets you implement custom validation logic to check the parameters. Finally, if something goes wrong during tool execution, the `onCallError` callback provides a way to log the error or attempt recovery actions.

## Interface IAgentTool

This interface describes a tool that an AI agent can use within a larger group, or swarm. Each tool has a unique name for easy identification and can optionally include a description to help users understand how to use it.

Before a tool runs, it can perform validation to make sure the input data is correct.  This validation step can be quick or more complex, potentially taking some time to complete.

You can also add optional "lifecycle callbacks" to your tool. These callbacks let you customize what happens before or after the tool actually runs, allowing for more control over the process. 

Finally, the `call` method is how the tool actually gets executed, and it receives all the necessary information about the request, including any previous tool calls and a way to signal if the process should be stopped.

## Interface IAgentSchemaCallbacks

This interface lets you hook into different moments in an agent's lifecycle, allowing your system to react to what's happening. You can listen for when an agent starts running, produces output, uses a tool, or receives messages – both from the assistant and from users. There are also callbacks for less common events, like when an agent is reset, paused, or completely shut down, and when its history is cleared. This enables you to build custom monitoring, logging, or even interactive features around your agents. You can also be notified about tool requests before they're executed and receive updates after the tools have finished their tasks.

## Interface IAgentSchema

This interface defines how each agent within your AI swarm is configured. Think of it as a blueprint for creating agents.

You can give your agents a unique name, and define a primary prompt to guide their behavior. They also have a system prompt, which helps them understand how to use tools.

To control how agents interact, you can limit the number of tools they use or the number of messages they remember. You can also provide descriptions to help people understand how to use each agent.

If an agent needs to interact with a human operator, there's a specific function to handle that connection.  You can also specify which tools and storage systems the agent can access, and even define dependencies on other agents.

Finally, you can customize the agent's lifecycle with various callbacks, like validating its output or transforming its responses before they're used. It allows you to fine-tune how each agent operates within the swarm.

## Interface IAgentParams

This interface defines the information needed to run an agent within the system. Think of it as a configuration package, providing the agent with its identity (clientId), ways to log activity (logger), a communication channel (bus), access to external tools (mcp), a memory for past interactions (history), a way to generate responses (completion), and a list of tools it can use (tools). There's also a validation step (validate) to check the agent's output before it's considered complete.

## Interface IAgentNavigationParams

This interface defines how you can tell the system to move an agent to a specific location or tool. Think of it as providing instructions: you specify the name of the tool you want the agent to use, a short explanation of what it does, and which agent it should move to. There’s also a place for extra notes to help explain the tool’s purpose, and a way to tell the system to ignore certain outputs when multiple navigation options exist. Essentially, it's a way to guide the agents to where they need to be and what they need to do.

## Interface IAgentConnectionService

This interface helps us define how agents connect and communicate within the system. Think of it as a blueprint for making sure the public-facing parts of agent connections are consistent and reliable. It's designed to strip away the internal workings, leaving only the essential methods and properties that external components need to interact with. This keeps things clean and predictable for anyone working with agent connections.

## Interface IAgent

The `IAgent` interface defines how you interact with individual agents within the swarm orchestration framework. It outlines the core actions you can perform, like running the agent for a quick test without affecting its memory, or executing it to process input and potentially update its history. You can also use methods to manually add messages—system instructions, user prompts, tool outputs, or assistant responses—to the agent's ongoing conversation.  There are also controls to manage tool usage, clear the agent’s memory, and halt tool execution if needed. This interface provides a way to precisely control and monitor each agent’s behavior and interaction.
