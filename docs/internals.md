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

This function lets you kick off a pre-defined workflow, or pipeline, within the AI agent swarm. Think of it as telling the system, "Hey, I want this particular sequence of tasks to run." You'll need to specify a unique client identifier, the name of the pipeline you want to execute, and the agent responsible for handling it. You can also include data, called a payload, to give the pipeline some initial information it needs to work with. The function will then return a result, which will tell you how the pipeline ran.

## Function scope

This function lets you run a piece of code – like a task or a small process – within a defined environment that manages things like AI agents and how they interact. You provide the code you want to run, and optionally, you can tweak the underlying tools and services it uses. Think of it as setting up a temporary workspace for your code with pre-configured resources. This allows for controlled execution and potential overrides for experimentation or specific needs. The function returns a promise that resolves with the result of your code, or nothing if the code doesn’t return a value.

## Function runStatelessForce

This function lets you quickly run a command or message through your AI agent swarm without adding it to the ongoing conversation history. Think of it as a way to execute a task independently, useful for things like processing storage output or handling one-off jobs. 

It guarantees the task will run, even if the agent currently in charge has changed or isn’t actively responding. You provide the content you want executed and a unique identifier for the client making the request. The system handles the technical details, including validating the setup, tracking performance, and ensuring a fresh environment for the agent to work in.

## Function runStateless

This function lets you quickly run a task or instruction with a specific agent in your swarm without adding it to the ongoing conversation history. It’s useful when you need to process something like data from a storage system or handle a single, isolated task. 

Essentially, it sends a message to the designated agent and gets a response, all while making sure the agent is still available and the process is tracked for performance. The function ensures a fresh start for the agent each time, preventing any interference from previous interactions. 

You provide the message content, a client identifier, and the name of the agent you want to use. The function then takes care of the rest, handling agent validation, execution, and metadata tracking.


## Function questionForce

This function lets you directly trigger a question-answering process, even if it doesn't naturally arise from a conversation. Think of it as a way to force the AI swarm to focus on a specific question or piece of information. You provide the question itself, a unique identifier for the system using the function (the `clientId`), and the name of the knowledge base (the `wikiName`) that the AI should draw information from. The function will then return the AI's response to the forced question.



It’s useful when you need to ensure a particular topic is addressed or to directly test the AI’s understanding of a specific area.

## Function question

This function lets you send a question to your AI agent swarm. It takes the actual question you want answered, a unique identifier for who's asking, the name of the agent responsible for handling the question, and the name of the knowledge source (like a wiki) the agent should use. The function then returns a promise that resolves to the agent's answer. Think of it as the main way to get answers from your AI agents.




It's designed to be a simple and clear way to interact with your AI agents and get them working together to provide information.

## Function overrideWiki

This function lets you change the settings of a wiki within the swarm. Think of it as updating a wiki’s blueprint. 

You provide a new or modified version of the wiki's configuration, and this function applies those changes. 

It makes these changes independently, ensuring a controlled update process. The system also keeps a record of the change if logging is turned on. You can specify just parts of the wiki's schema – you don't have to redefine everything.

## Function overrideTool

This function lets you change how a tool behaves within the AI agent swarm. Think of it as modifying a tool's instructions or capabilities. You can update existing tools with new information or adjust their settings. This change happens independently, ensuring a clean and isolated update process. The system will also record this modification if you've enabled logging. You provide the updated tool information, and the framework takes care of applying those changes.

## Function overrideSwarm

This function lets you change the setup of a swarm, essentially modifying its configuration. You can provide a new schema or just a few updates to the existing one. Think of it as a way to adjust how your swarm operates without affecting other processes. It makes the change directly, creating a fresh environment for the update to happen cleanly, and will log the action if you've configured logging to be on. You provide the new or modified schema as input to this function.

## Function overrideStorage

This function lets you modify how data is stored within the AI agent swarm. Think of it as a way to adjust the rules for a specific storage system – perhaps changing how much data it holds or how it's organized. You provide a new or partial set of rules (the `storageSchema`), and the system updates the existing storage configuration accordingly. This is done independently to keep things clean and safe, and the system will record the change if you’ve enabled logging. You can use it to tweak storage settings without affecting ongoing operations.

## Function overrideState

This function lets you change how a specific state within the swarm operates. Think of it as directly modifying a state's blueprint. You can update existing parts of the state or add new ones, essentially customizing its behavior. This change happens independently, without affecting anything else that's currently running, guaranteeing a controlled modification.  If you have logging turned on, the system will record that this override happened. You provide the new or updated state definition as an argument to this function.

## Function overridePolicy

This function lets you modify a policy's settings within the agent swarm. Think of it as a way to adjust how a specific policy behaves, either by completely replacing its definition or just tweaking certain aspects. The change is made directly, without affecting any ongoing processes, ensuring a controlled update.  If logging is turned on, the system will record that this policy override happened. You provide a partial definition of the policy you want to change, and the function applies those changes.

## Function overridePipeline

This function lets you modify an existing pipeline definition, allowing you to make adjustments without rebuilding the entire thing from scratch. Think of it as a way to fine-tune a workflow. You provide a partial pipeline definition – just the changes you want to make – and this function merges them with the original pipeline. It’s really helpful for adapting your workflows to different situations or experimenting with slight variations. The resulting schema will be a combination of the original and your provided updates.

## Function overrideMCP

This function lets you adjust and replace parts of an existing Model Context Protocol (MCP) schema. Think of it as a way to fine-tune how your AI agents understand and share information. You provide a new schema, and this function will merge it with the original, effectively updating the existing one. It’s useful when you need to change or add details to how agents communicate. The schema you give it acts as the instructions for those modifications.

## Function overrideEmbeding

This function lets you change how your AI agents understand and process information by adjusting the embedding schema. Think of it as tweaking the way agents convert text into numerical representations. You can provide a complete new schema or just some updates to an existing one. This change happens independently, ensuring a clean and isolated process. The system will record this alteration if logging is turned on.

## Function overrideCompute

This function lets you tweak existing compute schemas – think of them as blueprints for how tasks get processed – by providing updates. It’s a way to modify a schema without having to define the entire thing from scratch. You simply provide the parts you want to change, and this function merges them into the original schema. This is useful when you need to adapt a standard processing setup to a specific situation. The `computeSchema` parameter holds these updates you’re providing.

## Function overrideCompletion

This function lets you change how the swarm generates responses. Think of it as modifying a blueprint for creating text. 

You can use it to adjust specific parts of that blueprint, like altering the way it formats the output or changes the style of language it uses. 

It operates independently, so changes are isolated and don't affect ongoing processes. 

If the system is set up to log actions, this override will be recorded. You provide a partial schema, and it merges with the existing one.

## Function overrideAgent

This function lets you change the configuration of an agent already running within the swarm. Think of it as a way to tweak an agent's settings on the fly. You can provide a new schema or just a few specific updates. It's designed to work independently, making sure the changes are isolated and don't interfere with anything else happening in the swarm. The system will also record these adjustments if logging is turned on. You provide the new or updated agent configuration as input.

## Function notifyForce

This function lets you push a message out to the swarm as a notification, essentially like a broadcast. Think of it as a way to communicate directly with the agents without them needing to process a regular incoming message. 

It’s specifically intended for sessions created using the "makeConnection" setup. Before sending, it checks to make sure everything is still working correctly – the session, the swarm, and the agent you've targeted. 

You provide the message content and a client ID to identify where the notification is coming from. The system ensures a fresh environment and logs the action for transparency, but will raise an error if used outside of a "makeConnection" session.

## Function notify

This function lets you send messages out of your AI agent swarm without triggering any further processing within the system. Think of it as a way to broadcast information directly from a specific agent.

It’s specifically intended for situations where you’re establishing a direct connection with the swarm. Before sending, the system verifies that the agent you're sending from is still available and hasn't been replaced.

You’ll need to provide the message content, a unique identifier for the client sending the message, and the name of the agent responsible for sending the notification. 


## Function markOnline

This function lets you tell the system that a particular client is now active within a specific group of agents. Think of it as a simple "hello, I'm online!" signal. You provide the unique ID of the client and the name of the swarm (or group) they belong to, and the system updates its records accordingly. It’s a straightforward way to keep track of which agents are participating. The function doesn’t return any data; it just confirms the status update.

## Function markOffline

This function lets you tell the system that a particular client, identified by its unique ID, is no longer active within a specific swarm. Think of it as updating the system's knowledge about which agents are currently participating. You provide the client's ID and the name of the swarm it’s part of, and the function handles the internal process of marking that client as offline. This is useful for managing the agent population and ensuring tasks are assigned to available agents.


## Function listenEventOnce

This function lets you listen for a specific event from one or all clients within the swarm, but only once. You tell it which client you're interested in (or use "*" to hear from everyone), the name of the event you're waiting for, and a filter to make sure you only get the events you care about. When an event matching your criteria arrives, a provided callback function gets executed with the event's data. Importantly, this listener automatically stops after it has heard the first matching event. You’re also given a way to cancel the listener early if needed. The function makes sure you don’t try to listen to events from special, reserved names.

## Function listenEvent

This function lets you tune in to messages being sent across your agent swarm. You specify a client ID – which can be a specific client or use a wildcard to hear from everyone – and a topic name to listen for. When a message with that topic is sent, a callback function you provide will be triggered, receiving the message’s contents. The function provides a way to easily stop listening later by returning an unsubscribe function. There are some topic names that are reserved and can’t be used.

## Function hasSession

This function helps you quickly determine if an active session already exists for a particular client. It simply checks if a session is currently associated with the provided client ID. Behind the scenes, it uses a session validation service to perform this check. If logging is turned on, the function will record that it was called. You pass in the client's unique ID, and it returns true if a session is found, and false otherwise.

## Function hasNavigation

This function helps you determine if a particular agent is involved in guiding a client through a specific process. It essentially checks if an agent is part of the planned sequence for a client's journey. 

To use it, you’ll need to provide the unique identifier for the client and the name of the agent you want to check. The function then verifies that both the client and agent are valid and looks at the overall navigation plan to see if the agent is included. 

It's designed to be transparent, so if logging is turned on, it will record these checks for monitoring purposes.

## Function getUserHistory

This function helps you get a list of messages a user has sent during a specific session. You provide the unique identifier for that session, and it returns an array of messages where the user was the one sending them. It uses an internal function to grab all the raw history and then filters it down to just the user's interactions, ensuring a clear and controlled process. The operation is also logged for tracking purposes.


## Function getSessionMode

This function lets you find out the current operating mode for a specific client session within your AI agent swarm. Think of it like checking if a particular session is in "session" mode, preparing to "makeConnection," or already in the "complete" phase. It securely looks up the mode, making sure the session is valid and keeping track of what's happening if logging is turned on. It's designed to run independently, preventing interference from other ongoing processes. You just need to provide the unique ID of the client session you're interested in.

## Function getSessionContext

This function lets you access the information about the current session, like who's using the system and what resources are available. It gathers details such as the client ID, process ID, and the available methods and execution environments. Think of it as a way to understand the current working environment for your AI agents. It automatically figures out the client ID based on the existing system setup, so you don't need to provide it directly.

## Function getRawHistory

This function lets you access the complete, untouched history of a client's interactions with the AI agent swarm. It pulls all the messages and data associated with a specific client session, giving you a raw view of what transpired. Think of it as getting the complete record, exactly as it was stored. To use it, you simply provide the unique ID of the client session you’re interested in. The function ensures the session and swarm are valid before retrieving the data.

## Function getPayload

This function lets you grab the data currently being used by the AI agents – think of it as retrieving the "message" being passed around. It's designed to work with any kind of data structure, as long as it's an object. If there's no data currently being shared, it will return nothing. The system also keeps track of when this data is accessed if logging is turned on.

## Function getNavigationRoute

This function helps you figure out the path a client has taken through an AI agent swarm. It returns a list of agent names, showing the route the client has followed. To use it, you need to provide the client’s unique ID and the name of the swarm you're working with. Behind the scenes, it uses a navigation service to determine the route and can optionally log activity depending on how the system is configured.

## Function getLastUserMessage

This function helps you find the last message a user sent within a specific session. It looks through the history of interactions for a given client to pinpoint the most recent message where the user was actively sending input. If a user message is found, its content is returned as a string. Otherwise, if no user message exists in the history, the function returns null. You’ll need to provide the unique identifier for the client’s session to use this function.

## Function getLastSystemMessage

This function helps you find the last message sent by the system within a specific client's ongoing conversation. It digs into the client's history to locate the most recent message marked as coming from the "system" role. If the client hasn't received any system messages yet, it will return nothing. You just need to provide the unique ID of the client you're interested in.

## Function getLastAssistantMessage

This function helps you quickly get the last message sent by the AI assistant for a specific client. It digs into the client’s conversation history to find the most recent message where the assistant was the speaker. If the assistant hasn't sent any messages yet for that client, it will return nothing. You just need to provide the unique ID associated with the client's session to retrieve this last message.

## Function getAssistantHistory

This function lets you see what an assistant has said during a specific client's interaction. It pulls up all the history for that client and then focuses only on the assistant's messages. Think of it as retrieving the assistant’s side of the conversation for a particular session. You need to provide the unique identifier for the client to get their history. The function makes sure the process runs cleanly and logs what it's doing, if you've configured it to do so.

## Function getAgentName

This function helps you find out the name of the agent currently handling a specific client's session within your AI agent swarm. You give it a unique ID for the client, and it returns the name of the agent assigned to that client. It makes sure the client session and swarm are valid before looking up the agent's name, and keeps a log of the process if logging is turned on. The process is designed to run cleanly, separate from other ongoing operations. 

You'll need to provide the unique client identifier when you call this function.

## Function getAgentHistory

This function lets you see the past interactions and adjustments made for a particular agent in your AI swarm. It pulls up the agent's history, taking into account any "rescue" strategies the system uses to refine its responses.

You'll need to provide the unique identifier for the client session and the name of the agent you're interested in. The system double-checks that the session and agent are valid, logs the request for tracking, and uses the agent's prompt configuration to get the history from the public service. It ensures a clean environment for retrieving this information.

## Function fork

This function lets you run code – specifically, a function you provide – within a controlled environment. Think of it as creating a temporary, isolated space for your code to execute. It automatically manages the setup and teardown of that space, dealing with things like creating sessions and ensuring everything is cleaned up afterward.  You give it a function to run, and that function receives a client ID and the name of the agent it's working with. You also provide configuration options to customize how the function runs in that managed environment. It returns a promise that resolves with the result of your function.

## Function executeForce

This function lets you send a message or command directly to the agent working within a swarm, acting as if the message came from a client. It's useful when you need to, for example, check the agent's output or start a conversation. 

Unlike other methods, this one *always* sends the message, even if the agent isn't actively working or has changed. It takes the message you want the agent to process and a unique ID identifying your client session. 

Behind the scenes, it confirms everything is set up correctly, tracks how long the execution takes, notifies other parts of the system, and makes sure the agent has a clean workspace before running the command.

## Function execute

This function lets you send instructions or data to a specific agent within your AI agent swarm. Think of it as relaying a message from a client directly to an agent, useful for things like showing an agent the results of a tool it used or starting a conversation between the agent and the client. 

It ensures the agent is still part of the swarm and handles the message delivery process. Behind the scenes, it creates a fresh environment for the agent to work in and keeps track of how the execution is performing, all while notifying the system about what's happening.  You specify the message you want to send, which client initiated the request, and the name of the agent that should receive it.

## Function event

This function lets your components talk to each other within the swarm. Think of it as sending a message – you specify who's sending it (`clientId`), what the message is about (`topicName`), and the actual content of the message (`payload`).

It ensures the message is sent cleanly and safely; it won't let you use certain "reserved" topic names to avoid conflicts.

Essentially, it’s how different parts of your AI agent swarm share information and coordinate actions.




The function requires a unique client identifier, a topic name for categorization, and the data you want to share.

## Function emitForce

This function lets you directly send a string as output from the AI agent swarm, essentially simulating a response without processing a regular message. It's a shortcut designed specifically for sessions created with `makeConnection`, and ensures everything works together smoothly. Think of it as injecting a prepared answer into the conversation flow. 

It's important to note that this method provides a clean slate for the output by using `beginContext`, double-checks that the session and swarm are valid, and will only work if the session was created using `makeConnection`. It also keeps a record of the action if logging is turned on, and confirms that the string has been successfully sent.

You'll need to provide the content you want to send, and also a unique identifier for the client session.

## Function emit

This function lets you send a string directly as output from an agent in the swarm, useful for specific scenarios like providing pre-defined responses. It ensures the agent you're sending the output from is still active and the connection is valid before proceeding. Think of it as a way to manually inject output while keeping everything secure and controlled. 

You’ll need to specify the content you want to send, the client session identifier, and the name of the agent responsible for the output. It's specifically designed for connections created with `makeConnection`, so make sure you're using it within the appropriate session context.

## Function commitUserMessageForce

This function lets you directly add a user's message to an agent's conversation history, even if the agent isn't actively responding. It's a way to ensure a message is recorded, useful for things like logging or persistence. You specify the message content, the execution mode, and a client ID to identify the session.  It handles some background checks to make sure everything is set up correctly and ensures the message is safely added to the agent's record. You can also include additional data with the message using the optional payload.

## Function commitUserMessage

This function lets you add a user's message to an agent’s record within an ongoing swarm session. Think of it as documenting what a user said, without the agent immediately responding.

You provide the message content, along with information like the client's ID, the agent's name, and potentially some extra data through a payload. This function ensures the agent remains active and handles necessary checks and logging behind the scenes, ultimately updating the agent’s history with the new message. It’s designed to keep things running smoothly, even when dealing with complex workflows.

## Function commitToolRequestForce

This function lets you directly send a set of tool requests to an agent in the swarm, overriding some standard checks for extra control. It's useful when you need to ensure a specific action happens, even if it's not following the usual validation process. The function takes the requests you want to send and the client ID, and it handles setting up the necessary context and recording what's happening along the way. Think of it as a way to push actions through, but be aware that you’re skipping some safety measures when using it.

## Function commitToolRequest

This function sends tool requests to a specific agent within your AI agent swarm. Think of it as the way you tell an agent, "Hey, I need you to do this task!" It makes sure the agent you're talking to is actually the right one and keeps track of everything happening. You provide the list of tasks, a unique identifier for your client, and the name of the agent you want to assign them to. The function returns a list of identifiers confirming the requests have been registered.


## Function commitToolOutputForce

This function lets you directly push the results from a tool back into the agent's workflow, even if you're not sure the agent is still actively working. It's a forceful way to update the agent’s progress, skipping the usual checks to make sure everything is still connected.

Behind the scenes, it verifies the session and swarm are healthy, records what's happening if logging is turned on, and sends the data to the session’s public service. It runs in a controlled environment to keep things clean and isolated.

You’ll need to provide the tool’s ID, the actual result from the tool, and the client ID that started the session.

## Function commitToolOutput

This function helps agents in a group share the results of their work. It takes the tool's ID, the output content, the client's ID, and the agent's name to record the tool's result within the ongoing session. 

Essentially, it makes sure the results are properly saved and linked to the correct agent and session. The process includes checks to maintain the integrity of the session and provides a clean environment for the operation to execute.

The function handles the technical details behind the scenes so agents can focus on performing tasks and sharing their findings.


## Function commitSystemMessageForce

This function lets you directly add a system message to a session within the swarm, bypassing the usual checks about which agent is currently active. It's useful when you need to ensure a specific message gets delivered regardless of the agent's state, like when managing system control or updating session information. 

Essentially, it forcefully commits a message, similar to how you might forcefully commit an assistant message. The function handles validating the session and swarm environment, and uses several services to manage logging and ensure the message is properly integrated. You’ll need to provide the message content and the client ID associated with the session.

## Function commitSystemMessage

This function lets you send messages directly to an agent within the swarm system – these aren't responses from the agent itself, but rather system-level messages like configuration updates or control commands.

Before sending the message, it carefully checks that the agent, session, and swarm are all valid and that the agent you're targeting is the correct one.

It manages the process safely and keeps a record of the actions performed through logging. Think of it as a secure and controlled way to communicate with agents for system management purposes, working alongside functions that handle regular agent responses. You’re essentially telling the agent something important about the overall system, not just asking it a question. The function requires you to specify what message to send, which client the message is for, and the name of the agent receiving the message.

## Function commitStopToolsForce

This function lets you immediately halt the next tool from running for a particular client within the system. It's a forceful way to stop tool execution, bypassing checks to see which agent is currently active.

Essentially, it validates the session and swarm, then moves forward with stopping the tool – even if an agent is already in the middle of something.

Think of it as a more direct approach than the standard stop function, similar to how `commitFlushForce` works compared to `commitFlush`.

You'll need to provide the client ID to specify which client's tool execution should be stopped.


## Function commitStopTools

This function puts a temporary halt to the next tool run for a particular agent working on behalf of a specific client. Think of it as a pause button for an agent’s workflow. Before pausing, the system carefully checks that the agent and client are valid and that everything is in order. This is different from clearing an agent's history; instead, it just prevents the very next action from happening. You specify the client's ID and the agent’s name to target the pause.

## Function commitFlushForce

This function lets you forcefully clear the agent's memory and history for a particular client. It’s a more aggressive version of a regular history clear, skipping checks to make sure everything is running smoothly. Think of it as a way to ensure a clean slate for an agent, useful when you need to be absolutely certain the history is cleared, even if there's uncertainty about the agent’s current state. 

It confirms that the session and swarm are valid before proceeding and uses several system components to handle session details, validation, history clearing, and logging. You'll need to provide the client's unique ID to specify which agent's history you want to clear.

## Function commitFlush

This function lets you completely clear the history of a particular agent for a specific client. Think of it as a reset button for an agent's memory within the system. Before doing so, it carefully checks to make sure the agent and client are valid and part of the active system. It uses several other services to handle validation, retrieve data, perform the flush, and record what's happening. Unlike adding new messages to an agent’s history, this function removes the existing history. You provide the client ID and the agent's name to identify which agent's history to clear.

## Function commitAssistantMessageForce

This function lets you push an assistant’s message into a session directly, even if there isn't an active agent currently handling it. It's like a shortcut to ensure a message gets recorded, bypassing normal checks. 

It verifies the session and the overall swarm system to make sure everything is in order before committing the message. This forceful commit is useful in situations where you absolutely need to ensure a message is saved, similar to how `cancelOutputForce` works compared to `cancelOutput`. 

You’ll need to provide the message content and the client ID associated with the session. Think of it as a way to guarantee a message is logged, even if things aren't quite as they usually are in the swarm.


## Function commitAssistantMessage

This function is how you send a message generated by an AI agent back into the system. It ensures everything is set up correctly – that the agent and session are valid – before actually sending the message. Think of it as a safe and reliable way to record what the agent said, with built-in checks to make sure it’s going to the right place.

It’s designed to work alongside other functions that manage agent interactions, providing a way to permanently store the agent’s output. 

You'll need to provide the actual message content, a client ID to identify the user session, and the name of the agent that produced the message.

## Function changeToPrevAgent

This function lets you switch a client back to a previous agent they were using, or to the default agent if there's no history. It’s designed to manage agent transitions for client sessions, ensuring a smooth experience. 

Essentially, it moves a client's active agent one step back in their session history, or to the default, making sure the change is valid and logged appropriately. The system handles this change carefully, putting it in a queue and limiting its execution time. It ensures this switch happens independently of any ongoing processes.

You're required to provide the unique identifier of the client session when using this function.

## Function changeToDefaultAgent

This function helps bring a client back to using the standard, pre-configured agent within the AI agent swarm. Think of it as a reset button for a client's agent selection. It takes a unique identifier for the client's session and safely switches them back to the default agent. The system verifies everything is set up correctly, keeps a record of the change if logging is turned on, and handles the switch in a controlled way to avoid any conflicts. This ensures a smooth transition back to the baseline agent for that client.

## Function changeToAgent

This function lets you switch which AI agent is handling a client's session within your swarm. It's designed to safely and reliably change agents, making sure everything is set up correctly and logged appropriately. Think of it as a way to reassign a client interaction to a different agent, ensuring a smooth handover. You specify the name of the new agent and the client's unique ID to make the switch happen. The system handles the details behind the scenes, like checking dependencies and queuing the change for execution.

## Function cancelOutputForce

This function lets you immediately stop an agent from producing output for a particular client. Think of it as a hard reset for that client's ongoing task. 

It doesn't care if the agent is currently working or not – it just sends an empty response to effectively halt the process. 

It confirms the client is still part of an active session and that the swarm is valid before taking action.

Because it skips some checks, this is a more forceful way to cancel output than the standard cancellation method. You'll need to be certain you want this level of interruption.

You provide the unique identifier of the client you want to cancel as the `clientId`.

## Function cancelOutput

This function lets you stop an agent from continuing to generate its output for a particular client. It's useful if you need to interrupt a process or redirect the agent’s attention elsewhere.

Before canceling, it makes sure the client and agent you're targeting are valid and exist within the system. 

It handles the necessary checks and manages the process safely, ensuring everything is done correctly and logging any activity along the way. You specify the client's ID and the agent's name to pinpoint the output you want to cancel.

## Function addWiki

This function lets you add a new wiki structure to the system, essentially defining a new kind of knowledge base for your agents. You provide a schema that outlines how this wiki should be organized, and the function will register it, making it available for your agents to use. Think of it as telling the system, "Hey, we're creating a new way to store information, here's how it works." The function returns a unique identifier for the newly added wiki.

## Function addTriageNavigation

This function lets you set up a special tool for your AI agents, allowing them to easily connect with a designated "triage agent" when they need extra help or a more specialized response. Think of it as creating a shortcut for agents to request assistance from a supervisor or expert. You provide some configuration details—like how the tool should be presented—and the function handles the rest, making it simple to integrate triage navigation into your agent swarm. It essentially creates a pathway for agents to escalate issues or seek guidance when their existing capabilities aren’t enough.

## Function addTool

This function lets you add tools that AI agents in the system can use. Think of it as registering a new capability for the agents to access. Each tool needs to be registered with this function so the agents know about it and can use it to complete tasks. The process is designed to be clean and separate from other actions, ensuring a reliable registration. After a tool is added, the function will give you the tool's name as confirmation. You provide a schema that describes the tool, including its name and how it works.

## Function addSwarm

This function lets you register a new "swarm" – think of it as a blueprint for how your AI agents will work together and handle client interactions. When you add a swarm, you're essentially telling the system how agent sessions should be structured and managed. Only swarms added this way are recognized by the system. It’s designed to run independently, ensuring a fresh start for the registration process.  You’ll get the swarm's name back as confirmation that it's been successfully added. The `swarmSchema` you provide defines all the important details like the swarm’s name and which agent is the default.

## Function addStorage

This function lets you register a new way for your AI agents to store and retrieve data. Think of it as adding a new type of database or file system that the whole swarm can use. Only storage engines registered with this function are recognized by the system.

If you're setting up a shared storage solution – one that multiple agents can access – this function will handle connecting to that shared service and making sure it's ready to go. This registration happens in a special, isolated environment to keep things running smoothly. Finally, you’re given the name of the storage you just added so you can easily refer to it later.


## Function addState

This function lets you define and register new states within the AI agent swarm system. Think of it as creating a blueprint for a specific piece of information the agents can use or share. Only states registered this way are recognized by the swarm, so it's essential for setting up the system's data management. If the state is designed to be shared among agents, this function also handles setting up the connection to the shared data service. It runs the registration process in a special, isolated environment to keep things clean and reliable, and confirms the state's name upon successful setup. You'll need to provide a schema outlining the state’s properties, including its name and whether it’s shared.

## Function addPolicy

This function lets you add rules, or policies, to your AI agent swarm. Think of it as defining how your agents should behave. 

It registers these rules with services that handle both validating them as they run and managing their underlying structure. 

Adding a policy involves registering it for real-time checks and schema management, all while keeping track of actions with detailed logging. This is a crucial step in setting up your swarm, allowing you to control agent actions and work alongside runtime functions.

You’ll provide the details of the policy – its name and other settings – when you call this function.

## Function addPipeline

This function lets you define and register a new workflow – we call them pipelines – within the system. Think of it as telling the framework, "Hey, I've designed a process that involves AI agents working together, and here's how it's structured." The function checks that your pipeline design is valid and then makes it available for use. You provide the blueprint for the workflow, and the function assigns it a unique identifier. It's how you expand the capabilities of the agent swarm orchestration framework with your custom processes.


## Function addMCP

This function lets you define and register a new Model Context Protocol, or MCP, which essentially describes how your AI agents will share information and context with each other. Think of it as creating a standardized language for your agents to communicate. When you call this function, you're providing the blueprint for that communication protocol, and the system assigns it a unique identifier. This identifier will be used later to reference and utilize the defined MCP within the agent swarm orchestration. 


## Function addEmbedding

This function lets you add a new tool for creating embeddings – think of them as numerical representations of text or other data – to the system. By registering your embedding tool with this function, the swarm will be able to use it for tasks like comparing how similar different pieces of text are.  Only embeddings registered this way are recognized by the swarm, ensuring consistency. The registration process happens in a special, isolated environment to keep things clean, and the function confirms the embedding's name after it's successfully added. You’ll need to provide a schema that defines the new embedding engine, including its name and how it's configured.

## Function addCompute

This function lets you register a new type of computation your AI agent swarm can perform. Think of it as defining a blueprint for a specific task, like summarizing text or generating images. When you register a schema, the system checks if it's properly formatted and adds it to a central registry. The function returns a unique identifier for that registered computation, which you’ll use later to tell your agents which task to execute. You can customize the data structure associated with each computation by specifying a generic type.

## Function addCompletion

This function lets you add new ways for your AI agents to generate text, like using different language models. Think of it as adding a new tool to the agents' toolbox. You provide a description of the new tool – its name and how it works – and the system registers it for use. This registration makes the new tool available for agents to use when they need to create text. It’s set up to run independently, ensuring a clean environment for adding these new tools. The function confirms the addition by returning the tool’s name.

## Function addAgentNavigation

This function lets you set up a way for one agent in your swarm to automatically move to and interact with another agent. Think of it as creating a guided pathway between agents. You provide details about the starting and destination agents, and the system handles the navigation setup. The function then returns a unique identifier for this navigation link, allowing you to manage it later if needed. It’s a core feature for coordinating agent movements within your swarm.

## Function addAgent

This function lets you register a new agent, essentially adding it to the system's directory so the swarm knows about it and can use it. Think of it as formally introducing a new worker to the team.

To make an agent usable by the swarm, you must register it using this function. It ensures the agent's setup is correct and creates a clean environment for the process. After successful registration, you're given the agent's name as confirmation. You'll need to provide a schema that describes the agent, including its name and how it's configured.

# agent-swarm-kit classes

## Class WikiValidationService

This service helps you manage and check the structure of your wikis, ensuring they conform to expected formats. You can think of it as a guardian for your wiki data.

To start, you’ll register each wiki you want to manage by giving it a name and a definition of its expected structure – this is done using the `addWiki` function.

Then, when you have content for a wiki, you can use the `validate` function to make sure it fits the defined structure. The service also keeps track of the wikis you’ve registered internally.

## Class WikiSchemaService

The WikiSchemaService helps manage and work with the structures that define your wiki content. It’s designed to keep track of different schema versions and ensures they meet basic requirements.

You can think of it as a central place to store and retrieve your wiki schema blueprints. The service keeps track of these schemas, allowing you to register new ones, update existing ones, or simply get a copy of a specific schema when you need it. It uses a logger to keep track of what’s happening, and relies on a schema context service to handle the underlying schema management tasks.

## Class ToolValidationService

This service helps ensure the tools your AI agents use are properly set up and registered within the system. It keeps track of all available tools and their configurations, making sure there aren't any duplicates and that everything exists as expected.

The service is designed to work closely with other components, like the tool registration system and the agent validation process. It keeps a record of tools and uses this information to confirm that agents are trying to use valid tools.

Adding a new tool involves registering it with this service, and validation checks ensure that the tools being used are recognized. Performance is prioritized through memoization, meaning frequently used checks are cached for speed. You can also log details of the tool validation process.

## Class ToolSchemaService

This service manages the blueprints for the tools agents use – think of it as a central catalog of what agents *can* do. It ensures these tool definitions are valid and consistent, making sure agents can reliably perform their tasks.

It works closely with other services, like the one that manages agent blueprints and the connection services that handle agent creation and execution. This service keeps track of tool information, validates that information to ensure it's well-formed, and provides that information to other parts of the system.

You can register new tools, update existing ones, and retrieve them when needed.  The system also logs its activities to help with debugging and monitoring, although this logging can be turned off. Essentially, this is a foundational piece for defining and managing the capabilities of the agents within the swarm.

## Class ToolAbortController

This class helps you control and manage the process of stopping asynchronous tasks, similar to how you might pause a download. It provides a simple way to create a controller and signal when something should be stopped. 

Inside, it uses a standard `AbortController` (which might be unavailable in some environments, in which case it won't work). 

You can use the `abort` method to send a signal that the task should stop. If the underlying `AbortController` isn't available, calling `abort` won't cause any problems; it simply won't do anything.

## Class SwarmValidationService

This service acts as a central point for making sure your AI agent swarms are set up correctly. It keeps track of all registered swarms and verifies that they have the right agents and policies in place.

You can use it to register new swarms, retrieve lists of agents and policies for existing swarms, and to perform comprehensive validation checks. It remembers previously validated swarms to avoid repeating checks, making the process more efficient.

The service relies on other components to handle tasks like agent and policy validation, and it keeps a record of all registered swarms. It also provides logging to help track what's happening during the validation process and to identify any potential issues.

## Class SwarmSchemaService

This service acts as a central place to manage the blueprints for how your AI agent swarms are structured and operate. It's like a library where you store and retrieve the configurations that define each swarm, including which agents are involved and what rules they follow.

Before any swarm can be used, its configuration needs to be registered here, and this service ensures those configurations are reasonably well-formed. It uses a special registry system to keep track of everything.

You can register new swarm configurations, update existing ones, or simply retrieve a configuration when you need it. This service works closely with other parts of the system, like the services responsible for connecting to agents, managing policies, and setting up the overall swarm environment. It keeps a log of what it's doing to help with troubleshooting, and it’s an essential piece for setting up and coordinating your AI agents.

## Class SwarmPublicService

This service acts as a bridge for interacting with a swarm of agents, providing a public-facing interface for various operations. It handles tasks like emitting messages, managing agent navigation, controlling output, and disposing of the entire swarm. 

Think of it as a centralized control panel; it takes requests from clients and translates them into specific actions within the swarm, ensuring everything is properly logged and scoped to the relevant client and swarm. Operations like getting agent details, setting agent names, and managing output are all handled through this service, making it a crucial component for orchestrating agent behavior. It ensures that these actions are tracked and executed in a controlled manner, maintaining context and consistency throughout the system.

## Class SwarmMetaService

The SwarmMetaService helps manage and visualize the structure of your agent swarms. It takes the information describing a swarm – its components, relationships, and default agents – and organizes it into a hierarchical tree. This tree can then be converted into a standard UML diagram, making it easier to understand and document the swarm's design.

Think of it as a translator: it converts the raw data about a swarm into a clear, visual representation. The service builds on other services within the system to gather the necessary data and generate the diagrams, ensuring consistency in how swarms are documented and debugged. You can use it to create diagrams for different swarms, providing a simple way to visualize the overall architecture.

## Class SwarmConnectionService

This class acts as a central point for managing how different parts of your AI agent swarm system connect and interact. Think of it as the traffic controller for your swarm.

It efficiently reuses connections to individual swarms (groups of agents working together) to avoid unnecessary overhead. When a part of the system needs to access a specific swarm, it uses this class to get a connection – and if that connection already exists, it reuses it instead of creating a new one.

It handles sending messages to the session, getting the current agent's name or the agent itself, and controlling agent navigation within a swarm. It also provides a way to stop any pending output from the swarm.

Finally, it handles clean-up, ensuring that resources are released properly when a swarm is no longer needed. It works closely with other services like logging, agent management, and session handling, providing a consistent and reliable way to manage your AI agent swarms.


## Class StorageValidationService

This service helps keep track of all the storage configurations used by the swarm, making sure they're set up correctly and don’t overlap. It registers each storage and its details, making sure each one is unique and has a valid embedding setup.

The service uses logging to record its actions and is designed to work efficiently by remembering the results of previous validations. You can register new storage configurations with it, and then ask it to check if a specific storage is valid. 

It relies on other services to handle logging, embedding validation, and interacting with the storage itself, ensuring a consistent and reliable system.

## Class StorageUtils

This class provides tools for managing data storage specifically for individual clients and agents within the system. It handles tasks like retrieving, updating, deleting, and listing data, ensuring that each agent has appropriate access to its designated storage areas. 

You can use it to fetch a limited number of storage items based on a search query, insert or update data, remove items by their unique ID, and retrieve individual data items. It also provides a way to list all items within a storage area, potentially filtering them based on specific criteria.

Furthermore, this class can create numeric indexes for storage and completely clear out data from a designated storage location. Before performing any operation, it carefully verifies that the client is authorized and that the agent is registered to use the specific storage area.

## Class StorageSchemaService

This service acts as a central hub for managing how your swarm system handles storage configurations. Think of it as a librarian, keeping track of different storage blueprints and ensuring they're valid before use.

It uses a registry to store these blueprints (called storage schemas), making them easy to find and use throughout the system. This registry is built using a standard tool, ensuring consistency.

Before a new storage blueprint is added or an existing one is changed, it's quickly checked to make sure it has the essential components like a way to create indexes and a reference to embedding information.

The service integrates with other parts of the system – like services responsible for managing storage connections, agent configurations, and even the public API – making sure everything uses compatible storage configurations. Logging is used to keep track of operations and aid in debugging.  Essentially, this service is key to organizing and maintaining the way your swarm system interacts with storage.

## Class StoragePublicService

This class manages storage specifically for each client within the swarm system. Think of it as a way to keep each client’s data separate and organized. It handles common storage operations like retrieving, updating, deleting, listing, and clearing data, all while ensuring that actions are tracked and scoped to the correct client. It's designed to work closely with other components like ClientAgent and PerfService to provide client-specific storage capabilities. This is different from shared storage which is used for system-wide data.

The class relies on injected services for logging and interacting with the underlying storage, offering consistent behavior and enabling efficient operations. The `loggerService` enables logging of storage actions if enabled, while `storageConnectionService` handles the core data storage tasks.

Key functions provide methods for:

*   Fetching lists of items based on search criteria (`take`).
*   Adding or updating items (`upsert`).
*   Deleting items (`remove`).
*   Retrieving individual items (`get`).
*   Listing all items, optionally with filtering (`list`).
*   Removing all items (`clear`).
*   Releasing resources associated with a client’s storage (`dispose`).

All these operations are carefully wrapped to ensure proper scoping and context awareness, making it safe and reliable for use within the swarm system.

## Class StorageConnectionService

This service acts as a central point for interacting with storage within the agent swarm system. It manages connections and operations for both client-specific and shared storage, making sure storage resources are used efficiently and securely.

When you need to access or modify data, this service smartly reuses existing storage connections instead of constantly creating new ones, thanks to its caching mechanism. If a storage area is designated as shared, it delegates the request to a separate shared storage service.

It's deeply integrated with other parts of the system, such as agent execution, public API access, and usage tracking, providing consistent behavior and event handling.  Logging is enabled for detailed monitoring of storage operations, and configurations are handled in collaboration with other specialized services.

Key functions include:

*   **Retrieving Storage:** Gets a client’s storage area, creating it if it doesn't already exist.
*   **Data Retrieval & Modification:** Provides methods for fetching, adding, updating, and deleting data.
*   **Clean Up:** Properly releases storage connections when they’re no longer needed.


## Class StateValidationService

This service helps ensure your AI agents are working with consistent and reliable data. It allows you to define the expected structure of data – we call these "states" – and then automatically checks if the data your agents are using matches that structure.

Think of it as a data guardian for your AI agents, making sure everyone’s on the same page. You set up the expected data formats, and the service then verifies that incoming data conforms to those definitions. This helps prevent errors and inconsistencies in your agent swarm's operations.

The `addState` function is how you register the structure of a particular data format. The `validate` function then performs the actual data verification process, ensuring that the data received from your agents aligns with what you’ve defined. The `loggerService` allows for logging any validation issues encountered.

## Class StateUtils

This class helps manage data associated with individual clients and agents within the swarm. It provides simple ways to fetch, update, and reset specific pieces of information—like settings or progress—for each client and agent combination. Before accessing or changing any data, it makes sure the client is authorized and the agent is properly registered within the swarm. You can get data using a client ID, agent name, and state name, or update it by providing a new value or a function to calculate the new state based on what's already there. You can also completely clear a state back to its original setting.

## Class StateSchemaService

This service acts as a central hub for managing the blueprints of how your AI agents handle and store information – we call these blueprints "state schemas." It keeps track of these schemas, making sure they’re set up correctly and consistently across your system.

Think of it as a librarian for state definitions. It organizes and provides access to these definitions, ensuring that different parts of the swarm (like client connections, agent execution, and public APIs) all use the same correct instructions.

Before a state schema can be used, it’s checked for basic correctness. The service also logs its actions, giving you visibility into how state schemas are being managed. This helps keep your agent swarm running smoothly and predictably, and makes it easier to update or troubleshoot things. You can register new schemas, update existing ones, or simply retrieve them when needed.

## Class StatePublicService

This service helps manage state specifically tied to individual clients within the system. Think of it as a way to keep track of data that's unique to each client's interaction. It builds on other core services to provide a public API for working with this client-specific data.

It's different from managing system-wide state or persistent storage – this focuses on the data associated with a particular client's session.

You can use it to set, clear, retrieve, and clean up this client-specific data, and operations are logged for debugging purposes when logging is enabled. It's used by other parts of the system like ClientAgent and PerfService to handle client-specific actions and monitor performance.

## Class StateConnectionService

This service manages how your AI agents store and update their data within the system. Think of it as a central hub for keeping track of an agent's "memory" or current status.

It intelligently reuses state information to avoid unnecessary overhead. It also handles shared states—those used across multiple agents—by delegating them to a separate service.

Here’s a breakdown of what it does:

*   **Manages Agent States:** It creates, retrieves, and updates the data associated with individual AI agents.
*   **Memoization:** It remembers (caches) frequently used state information for quick access, making things more efficient.
*   **Shared State Handling:**  It knows how to deal with data that needs to be shared between agents, avoiding duplication and ensuring consistency.
*   **Thread Safety:** Updates to the state are handled carefully to prevent conflicts when multiple agents are accessing it at the same time.
*   **Cleanup:** It releases resources and removes temporary data when an agent is finished, keeping the system tidy.

The `getStateRef` method is crucial - it's how you get or create the state for a specific agent and data name.  `setState` is how you update the data, and `dispose` cleans up when you're done.

## Class SharedStorageUtils

This class provides tools for your agents to share and manage information within the swarm. Think of it as a central repository where agents can store and retrieve data. 

You can use it to fetch a specific number of items based on a search term, add new information or update existing data, or remove items entirely. It also allows you to retrieve a single item by its unique ID or list all items in a storage area, optionally filtering them. Finally, you can completely empty a storage area if needed. 

Each operation is carefully managed to ensure the storage names are valid and actions are properly recorded, providing a secure and traceable data sharing system for your agents.

## Class SharedStoragePublicService

This class handles interactions with shared storage across the system, providing a public-facing API for things like saving, retrieving, and deleting data. It acts as a middleman, coordinating with other services to ensure operations are tracked and properly scoped.

Think of it as a central hub for managing shared data—ClientAgent uses it to store and retrieve information, PerfService uses it to monitor storage usage, and DocService uses it to document the data stored.

Key functions include:

*   **`take`**: Retrieves a list of storage items based on a search query.
*   **`upsert`**: Inserts new data or updates existing data in the storage.
*   **`remove`**: Deletes specific items from the storage.
*   **`get`**: Retrieves a single item based on its unique identifier.
*   **`list`**: Retrieves all items from the storage, optionally with a filter.
*   **`clear`**: Empties the entire storage.

It logs activity when enabled, providing visibility into how shared storage is being used throughout the swarm system.

## Class SharedStorageConnectionService

This service manages shared storage connections across your AI agent swarm, ensuring all clients access the same storage instance. Think of it as a central repository for data shared between agents.

It intelligently caches storage connections, so you don't have to recreate them every time. This caching is handled automatically and makes things more efficient.

Here's a breakdown of what you can do with it:

*   **Get Storage:** Retrieves or creates a shared storage connection by name.
*   **Take (Search):**  Retrieves a list of data items based on a search query. You can even use similarity scores to find relevant data.
*   **Upsert:** Adds or updates data items in the shared storage.
*   **Remove:** Deletes items from the shared storage.
*   **Get:** Retrieves a single data item by its ID.
*   **List:** Retrieves a list of data items, optionally filtered.
*   **Clear:**  Empties the entire shared storage.

The service is designed to work closely with other components in your system, like agent execution environments and storage configuration services, to ensure data consistency and efficiency. It also keeps you informed about what's happening through logging, allowing you to monitor and troubleshoot issues.

## Class SharedStateUtils

This class offers a simple way for agents in your swarm to share information and coordinate. You can use it to get existing data, update it, or even completely reset it. To retrieve information, you just ask for the data associated with a specific name. When setting data, you can either provide a new value directly or give a function that calculates the new state based on what’s already there. And if you need to start fresh, you can easily clear the state for a particular name and return its previous value.

## Class SharedStatePublicService

This service acts as a central point for interacting with shared data across the entire swarm system. It allows different parts of the system, like agents and performance tracking tools, to safely read, update, and reset this shared data. Think of it as a controlled bulletin board where everyone can post and view information, but with strict rules and a log of who did what.

The service relies on other internal tools for its work, and it keeps detailed logs of all actions taken when logging is enabled. This logging helps track changes and troubleshoot any issues that might arise. It offers simple functions to set, clear, and retrieve the shared data, making it easy for different components to manage and access this common resource.

## Class SharedStateConnectionService

This service manages shared data across different parts of the system, like agents. Think of it as a central place to store information that everyone needs access to.

It uses a clever caching system to avoid creating the same shared data multiple times, making things efficient. It's designed to work closely with other services to handle everything from initializing the data to making sure updates are handled safely and in a controlled manner. 

You can use it to:

*   **Get the current shared state:** Retrieve the most up-to-date values.
*   **Set the shared state:** Update the data, making sure changes are applied correctly and safely.
*   **Clear the shared state:** Reset the data back to its original condition.

The service keeps track of what's happening, logging information when needed, and it uses configuration to manage how data is stored and handled.

## Class SharedComputeUtils

This toolset, `SharedComputeUtils`, helps manage and interact with shared computing resources within the AI agent swarm. It provides ways to refresh the status of a specific compute resource and retrieve its data. You can use the `update` method to ensure a compute resource’s information is current, and `getComputeData` to fetch details about a compute resource, specifying a client identifier to target the relevant data. Think of it as a utility belt for accessing and keeping track of what your agents are using.


## Class SharedComputePublicService

This component acts as a central hub for managing and coordinating computational tasks across a swarm of AI agents. It provides a straightforward way to request and retrieve data, trigger calculations, and update the state of these computational resources. Think of it as a messenger that communicates requests to the agents and brings back the results. 

You can use it to fetch data from specific computations, initiate new calculations based on existing state, or update the underlying data used by the agents. The `loggerService` and `sharedComputeConnectionService` properties provide access to logging and connection management functionalities, respectively. Essentially, it simplifies the process of interacting with and orchestrating a distributed AI agent workforce.

## Class SharedComputeConnectionService

This class acts as a central hub for managing connections to computational resources within your AI agent swarm. Think of it as the traffic controller, ensuring agents can access and share data and processing power. 

It handles the underlying connections to these computational resources and provides convenient methods for agents to request specific compute tasks. You can easily fetch references to available computations, retrieve their data, and trigger calculations or updates. It relies on several other services – a logger, a message bus, a context service, a shared state connection service, and a compute schema service – to function effectively. The `getComputeRef` property is particularly important, allowing you to retrieve a specific compute resource by name, and it’s designed to be efficient through memoization.

## Class SessionValidationService

This service keeps track of sessions within the swarm system, managing their connections to different components like agents, storages, and states. It's like a central record-keeper, ensuring everything is linked correctly and resources are used consistently.

The service logs all activity for auditing and debugging, and it uses a few clever techniques – like memoization – to make checks faster.

Here's a breakdown of what it does:

*   **Session Registration:** It registers new sessions, associating them with a specific swarm and mode.
*   **Resource Tracking:** It keeps tabs on which agents, storages, states, and computes are being used within each session.
*   **Session Management:** It allows you to check if a session exists, retrieve its mode, or get lists of associated resources.
*   **Validation:** It provides a quick way to verify if a session is valid, with performance optimizations.
*   **Cleanup:** It allows you to remove sessions completely or just clear their validation cache.

Essentially, this service is responsible for maintaining a consistent and organized view of all active sessions within your swarm.

## Class SessionPublicService

This service acts as a public interface for interacting with sessions within the AI agent swarm. It handles sending messages, executing commands, and managing the overall session lifecycle. Think of it as the main point of contact for external components wanting to communicate with or run things within a session.

It's built on top of other services to provide context and tracking for all operations, ensuring proper logging and performance monitoring.  Essentially, it takes requests from external systems (like a client agent) and translates them into actions within a specific session, while also keeping track of what’s happening.

Key functionalities include:

*   **Sending Messages:**  Allows you to send messages to a session for asynchronous communication or to show updates to a client.
*   **Running Commands:**  Executes commands (like tool calls or code) within the session.
*   **Managing Session History:** Logs user inputs, assistant responses, and tool requests for a complete record of the session.
*   **Session Control:**  Handles connecting to a session, stopping tool execution, and properly cleaning up resources when a session is finished.



The service leverages other services for things like logging, performance tracking, and event handling, ensuring that operations are tracked and executed properly within the swarm environment.

## Class SessionConnectionService

This service acts as a central hub for managing active conversation sessions within the AI agent swarm. When a client needs to interact with the system, this service creates or reuses a "session" – think of it like a dedicated workspace for that client.

It's designed to be efficient, reusing sessions whenever possible to avoid unnecessary overhead. Everything from executing commands to sending notifications and managing tool interactions happens through this service.

Here’s a breakdown of what it does:

*   **Session Management:** It creates and reuses sessions for each client and swarm combination.
*   **Command Execution:** Allows executing commands within a specific session.
*   **Messaging:** Provides a way to send and receive messages to and from the session.
*   **Tool Handling:** Manages tool requests and responses within the session.
*   **Session Lifecycle:** Provides methods for cleaning up and disposing of sessions when they're no longer needed.
*   **Logging & Eventing:** Handles logging of session activity and emitting events to other parts of the system.



Essentially, this service provides a controlled and organized way to manage all the interactions happening within the AI agent swarm.

## Class SchemaUtils

This class provides helpful tools for managing how information is stored and shared within your agent swarm system. It lets you easily save data related to individual clients – think of it as a way to remember things about each agent – and retrieve it later. You can also serialize data, which means converting it into a string format for transmission or storage.  The serialization method helps you transform complex data structures into a clear, readable string, with the option to customize how the keys and values are represented.

## Class RoundRobin

This class provides a simple way to distribute work evenly across a set of different functions or "instance creators." Think of it like a rotating schedule – it cycles through a list of tokens, each associated with a function that can produce a result. 

The `create` method is key; you provide it with a list of these tokens and a function that knows how to create something based on a given token. The resulting function then distributes requests to those creators in a round-robin fashion, ensuring a balanced workload. 

It keeps track of which creator it's currently using and how many tokens it has to cycle through, and can optionally log this information for debugging purposes. Essentially, it's a tool for fair distribution and organization of tasks handled by different functions.

## Class PolicyValidationService

This service helps ensure that the policies guiding your AI agent swarm are valid and consistent. It keeps track of all registered policies and their definitions, making sure they're unique and available when needed. 

It works closely with other parts of the system – the policy registration service, the component enforcing policies, and the service that validates individual agents – and uses logging to keep you informed about what's happening. To make things efficient, it remembers previous validation results.

You can add new policies to the service, and then use it to check if a specific policy exists. This helps guarantee that policies are correctly registered and ready to be used.

## Class PolicyUtils

This class helps you manage client bans within your AI agent swarm, ensuring consistent and tracked operations. It provides straightforward methods for banning, unbanning, and checking the ban status of clients. Before any action is taken, the system verifies that everything is set up correctly, like the client ID, swarm name, and policy name, and it keeps a record of what’s happening. Think of it as a helper for keeping your swarm’s policies enforced.




The `banClient` method puts a client on the banned list, `unbanClient` removes them, and `hasBan` simply tells you whether a client is currently banned.

## Class PolicySchemaService

The PolicySchemaService is responsible for managing the rules that govern how our AI agents operate within the swarm. Think of it as a central library for policy definitions.

It stores and organizes these policies, making them accessible to other parts of the system. Before a policy is added, it performs a quick check to ensure it's structurally correct.

This service works closely with other components, like the system's connection and agent management services, to make sure policies are enforced correctly. When a new policy is registered or a change is made, logs are created to track what's happening, providing insights into how rules are being applied. It's a foundational piece for defining and maintaining access control and restrictions across the entire AI agent swarm.

## Class PolicyPublicService

This class is your go-to for managing how policies affect clients within the swarm system. It acts as a public interface, handling requests related to policy enforcement like checking if a client is banned, retrieving ban messages, and actually banning or unbanning clients.

It works closely with other system components – like the logging system, the core policy connection service, and services for performance tracking, client agent interaction, and documentation – to ensure policy rules are consistently applied and communicated.  You're able to see detailed information about policy activity when logging is enabled.

Key actions you can perform include:

*   **Checking for Bans:** Quickly determine if a client is restricted from a particular swarm and policy.
*   **Getting Ban Details:**  Retrieve the reason a client has been banned.
*   **Validating Input/Output:** Make sure data being sent or received meets policy requirements.
*   **Managing Bans:** Apply or remove bans to control client access based on policy rules.

## Class PolicyConnectionService

This service is like a central manager for applying rules (policies) to your AI agent swarm. It handles things like checking if a client is banned, validating their inputs and outputs, and managing those bans.

It's designed to be efficient, reusing policy information whenever possible and keeping a record of actions through logging. It works closely with other parts of the system, such as client agents, session management, and the overall policy configuration, to ensure consistent enforcement across the swarm.

Think of it as a way to make sure everyone is playing by the rules and can quickly deal with any unwanted behavior. It handles a lot of the heavy lifting behind the scenes to keep the swarm operating smoothly and securely. The service is designed to be reusable and keep things efficient.

## Class PipelineValidationService

This class, PipelineValidationService, helps ensure your AI agent pipelines are correctly structured before they run. Think of it as a quality control checkpoint for your pipeline definitions.

You can add pipeline schemas to this service, essentially registering the blueprints for your pipelines. The `addPipeline` method lets you register these blueprints. 

Once you've added a pipeline schema, you can use the `validate` method to check a source file against that schema, helping you catch errors early and avoid runtime problems. The service also manages a map internally to keep track of the pipelines you've registered.

## Class PipelineSchemaService

This service helps manage and work with the structures that define your AI agent workflows. Think of it as a central place to store and organize the blueprints for how your agents will operate. 

It uses a schema context service to ensure the blueprints are valid and consistent. The service allows you to register new workflow blueprints, update existing ones, and retrieve them when needed. It keeps track of these blueprints internally, making it easy to access and modify them as your AI agent system evolves. The `register` method adds a new blueprint, `override` lets you modify an existing one, and `get` fetches a blueprint you've already registered.

## Class PersistSwarmUtils

This class helps manage how your AI agent swarms remember their state. It focuses on tracking which agent is currently active for each user session and swarm, and also keeps a record of the navigation history – essentially, the order agents were used.

You can think of it as a central place to store and retrieve this information, which is crucial for things like resuming sessions or providing a history of actions. It uses a system of "adapters" so you can easily change where this data is stored (like a database, a file, or even just in memory).

The class provides simple methods to get and set the active agent and navigation stack for a given user and swarm. There's also a way to customize how this data is persisted by providing your own storage implementations. This offers flexibility for different deployment scenarios and storage preferences.

## Class PersistStorageUtils

This utility class helps manage how data is saved and retrieved for each client and storage name within the swarm. It ensures that each storage name uses only one persistence instance, which is efficient for resources.

You can easily get data that’s already stored for a specific client and storage name, and if the data doesn't exist, it will use a default value. Conversely, you can save data for a client under a particular storage name to persist it for later use. 

If you need more control over how data is saved, you can configure a custom storage constructor, allowing for more advanced persistence options like using a database.

## Class PersistStateUtils

This class helps manage how information is saved and retrieved for each agent in the swarm. Think of it as a way to remember things about each agent, like its settings or progress.

It lets you store and retrieve data associated with a specific agent (`clientId`) and a named piece of information (`stateName`). If the data isn't already saved, you can provide a default value.

You can even customize how the data is actually stored, plugging in your own persistence methods for greater flexibility. This allows for things like storing data in memory, a database, or another custom location.

Essentially, it's about keeping track of agent-specific information and making sure that information can be saved and restored as needed.

## Class PersistPolicyUtils

This class helps manage how policy information, specifically lists of banned clients, are stored and retrieved for each swarm within the system. It provides a straightforward way to get and set these banned client lists. The system automatically ensures that only one persistence instance is used per swarm, which helps conserve resources. You can also customize how the policy data is persisted using a custom adapter, allowing for options like in-memory storage or database integration. Essentially, it's a toolkit for controlling which clients are blocked in your swarm environments.

## Class PersistMemoryUtils

This class helps manage how memory is saved and retrieved for each individual client interacting with the swarm system. It makes sure that memory data is stored persistently for each client, allowing the system to remember things like context or preferences between interactions.

It uses a clever system to avoid creating duplicate memory storage instances for the same client, making things efficient. You can also customize how the memory is stored, swapping out the default method for a custom one if needed, for example, to use a database instead of just keeping things in memory. When a client's session is finished, you can use the `dispose` method to clean up the memory storage for that client.

## Class PersistEmbeddingUtils

This class helps manage where and how embedding data is stored within the AI agent swarm. It allows you to easily save embedding vectors – those numerical representations of text – and retrieve them later when needed. 

To make things efficient, it uses a caching mechanism; before computing an embedding, it checks if one already exists and can be reused. You can customize exactly how these embeddings are saved, whether it's in memory or in a database, using a custom adapter. This allows for flexible control over data persistence and optimization of resources.

## Class PersistAliveUtils

This utility class helps track whether clients are online or offline within your swarm system. It remembers the status of each client (identified by a `SessionId`) so you can reliably know their availability. 

The class uses a clever system to ensure each client only has one persistence instance, saving resources. You can mark clients as online or offline, and then easily check their status later. 

If you need more control over how the alive status is stored, you can customize the persistence mechanism using a custom constructor. This allows for things like storing status in memory or using a database.

## Class PerfService

This service is all about keeping track of how well the AI agent swarm is performing. It monitors things like how long tasks take, how much data is being sent back and forth, and the overall state of client sessions.

Think of it as a performance dashboard for your agent swarm, automatically collecting data and making it easy to understand how things are running. It’s integrated with other services to pull in all the necessary information, and it’s designed to log detailed information for debugging if needed.

You can start and stop tracking individual tasks (executions), retrieve aggregated statistics about specific clients, or get a summary of overall swarm performance.  It has ways to clean up the tracking when a session is complete. The system is also designed to collect and log important details about each client, including swarm and policy information.

## Class OperatorInstance

The `OperatorInstance` class represents a single agent within your AI agent swarm. It’s essentially a connection point to a specific agent, allowing you to interact with it. 

Each instance is identified by a client ID and has a name reflecting its role within the swarm.  You provide callbacks to handle specific events and responses from the agent.

You can use `connectAnswer` to listen for answers from the agent, `notify` to send general messages, `answer` to provide a direct response, and `recieveMessage` to process incoming messages.  Finally, `dispose` allows you to cleanly shut down the connection to the agent when it's no longer needed.

## Class NavigationValidationService

This service helps manage how agents move around within the swarm, making sure they don't waste time revisiting the same places. It keeps track of where agents have already been for each client and swarm.

The `getNavigationRoute` function acts like a memory for navigation paths, remembering them between different calls to prevent unnecessary recalculations and ensuring consistency.

To decide whether an agent should move to a new location, `shouldNavigate` checks if it’s already been visited, adding it to the path if needed.

If you need to start fresh with navigation tracking, `beginMonit` clears out the existing path.

Finally, `dispose` lets you completely remove a navigation path when it's no longer needed. The service also uses a logger to keep a record of what's happening.

## Class MemorySchemaService

This service manages temporary, in-memory data associated with each active session within the swarm. Think of it as a simple scratchpad for each session, allowing agents to store and retrieve session-specific information. It’s a quick and easy way to hold onto data that doesn’t need to be permanently saved.

It uses a straightforward key-value system – each session has a unique identifier (clientId) that acts as the key to access its data.  You can write data to a session's memory, read it back, or completely clear it out when the session is finished.

Essentially, this provides a flexible way for agents to share data during a session, without needing to worry about complex storage or validation. It’s a lightweight solution for managing session-specific runtime data.

## Class MCPValidationService

This class helps you keep track of and verify your Model Context Protocols (MCPs), which define how different AI agents communicate. It acts like a central registry for your MCP schemas, allowing you to easily add new ones and confirm they exist.

Think of it as a librarian for your MCPs – it stores them and makes sure they're in order. 

You can add new MCPs using the `addMCP` method, and use `validate` to check if a specific MCP is registered. A logging service is built-in to keep track of what's happening.

## Class MCPUtils

This class, MCPUtils, is designed to help manage updates to the tools used by different clients within the Multi-Client Protocol system. Think of it as a central place to ensure everyone is using the right versions of everything. 

You can use it to push tool updates to *all* connected clients simultaneously. Alternatively, if you only need to update a single client, you can specify a client ID to target just that one. It's a straightforward way to keep your clients synchronized and running smoothly.

## Class MCPSchemaService

This service helps you manage and organize the blueprints – we call them schemas – that define how AI agents communicate and share information. It acts as a central hub for storing, updating, and accessing these schemas.

You can think of it as a librarian for your agent’s communication protocols. The service lets you add new protocols, update existing ones, and quickly find the protocol you need. 

The `register` method is how you add a new protocol, `override` lets you make changes to existing ones, and `get` is your way to retrieve the protocol you're looking for. The service also keeps track of logging and context for managing these protocols effectively.

## Class MCPPublicService

This class acts as the main gateway for interacting with the Model Context Protocol (MCP) system. It allows you to manage and execute tools within a defined environment, like a client session or a specific model.

You can use this class to discover what tools are available, see if a particular tool exists, and then actually run those tools, providing them with the necessary information to complete their task. It also handles the cleanup process, ensuring resources are released when they're no longer needed. The system relies on injected services for logging and handling the underlying MCP communications.

## Class MCPConnectionService

This class helps manage connections to different AI models, using a standardized protocol called MCP. Think of it as a central hub for interacting with various AI tools.

It keeps track of those AI models and their available tools, allowing the system to easily list, check for, and execute them. The system can update the tool lists for individual clients or for everyone.

The class is designed to efficiently reuse connections to AI models; it caches these connections to avoid creating new ones every time a tool is needed, and cleans them up when no longer needed. 

You can use it to find out what tools are available for a specific client, see if a particular tool exists, or actually call a tool with specific inputs to get a result.

## Class LoggerService

This class is responsible for handling all logging within the system, ensuring messages are recorded and easily traceable. It manages different levels of logging – normal, debug, and informational – and directs those messages to both a central logging system and a client-specific logger.

The system uses context information, like the client ID and method details, to add valuable context to each log message, making it easier to understand what happened and where.  You can control which types of logging are active through configuration settings.

Importantly, the logging setup can be changed even while the system is running, allowing for flexible adjustments like switching to a different logging destination or enabling/disabling certain log levels.  This adaptability is useful for testing, troubleshooting, or fine-tuning the logging behavior in various environments.

## Class LoggerInstance

This class helps manage logging specifically for each client within your system. It gives you the flexibility to customize how logs are handled, letting you define callbacks for specific actions when a log event occurs. 

You set up a logger with a unique client ID and any custom callbacks you want. The logger can send messages to the console (if that feature is enabled globally), and it runs any `onInit` callback when it's first created.

The `waitForInit` method makes sure the logger is fully set up and any initialization callbacks are executed just once. The `log`, `debug`, `info`, and `dispose` methods let you record different types of messages and clean up when the logger is no longer needed, all while respecting any custom callback functions you’ve provided. This system helps keep your logging organized and adaptable to your application’s needs.

## Class HistoryPublicService

This class manages how the swarm system keeps track of and interacts with history data. It provides a public way to add messages, retrieve them, convert them into different formats, and clean them up. Think of it as the central hub for handling history-related actions within the agent swarm.

It works closely with other services like logging, connection management, and client agent interaction, ensuring that history operations are scoped correctly and logged appropriately.

Here’s a quick breakdown of what you can do with it:

*   **Add Messages:** You can add new messages to an agent’s history, associating them with a specific client and method.
*   **Retrieve Messages:**  You can retrieve the most recent message from an agent's history.
*   **Convert to Arrays:** It can format the history into arrays – one specifically tailored for the agents to process, and another in a raw format.
*   **Clean Up:**  It provides a way to dispose of the history, releasing resources and completing the cleanup process.




Essentially, this service makes sure history operations are handled consistently and efficiently across the entire swarm system.

## Class HistoryPersistInstance

This class helps keep track of conversations, saving them both in memory and to a file. Each instance is tied to a specific client ID, allowing for organized storage and retrieval of message histories. 

When you need to load or initialize a history, the `waitForInit` method handles that, making sure the data is loaded from where it's stored. The `iterate` method lets you go through the messages one by one, potentially applying filters or custom instructions along the way. 

Adding new messages is simple with `push`, and `pop` allows you to remove the most recent message. Finally, `dispose` cleans up the history – either completely or just for a specific client, ensuring resources are managed effectively.

## Class HistoryMemoryInstance

This component handles keeping track of conversations for an AI agent, storing the messages directly in memory and not saving them anywhere permanently. It's designed to manage the history for a single agent, identified by a unique client ID.

When you create an instance, you can provide optional callbacks to be notified when messages are added, removed, or when the history is cleared. The `waitForInit` method sets up the history specifically for a given agent, making sure it's ready to use. 

You can loop through the history using the `iterate` method, which allows you to process messages one by one, potentially applying filters or system prompts along the way. New messages are added with the `push` method, and you can remove the last message using `pop`. Finally, the `dispose` method cleans up the history, optionally clearing all data if you're finished with all agents.

## Class HistoryConnectionService

This service manages the history of interactions for each client and agent within the system. Think of it as a central place to track what's happening during an agent's execution. It smartly caches these histories to avoid unnecessary work and integrates with other services to keep track of usage, events, and performance.

When you need to access or create a history for a specific client and agent, the `getHistory` method provides a cached instance.  `push` and `pop` let you add or remove messages from the history, similar to how you might work with a list.  You can also convert the history into different formats with `toArrayForAgent` (for agent usage) and `toArrayForRaw` (for more technical needs). Finally, `dispose` cleans up when you're finished with a history. This whole process is carefully logged and tracked to ensure everything runs smoothly and efficiently.

## Class ExecutionValidationService

This service helps keep track of how many times an AI agent is running within a group, ensuring things don’t get overloaded. It remembers execution counts for each client and swarm, so you don't have to recalculate them every time. 

You can use it to quickly find out how many executions are currently happening. When an execution starts, you increment the count, and when it finishes, you decrement it. There's also a way to completely clear the running counts if needed. This system helps prevent too many AI agents from running at once and causing issues.

## Class EmbeddingValidationService

This service acts as a gatekeeper for embedding names used throughout the system. It keeps track of all registered embeddings, ensuring that each one is unique and properly registered. When a new embedding is added, this service records it and verifies that it doesn’t already exist. The `validate` function checks if an embedding name is registered before it’s used, improving system reliability and catching potential errors early on. It’s designed to work closely with other services, like the embedding registration and client storage components, and uses logging to keep track of its actions. The system is optimized for speed by remembering the results of previous validation checks.

## Class EmbeddingSchemaService

This service acts as a central place to manage the blueprints for how embeddings are created and compared within the system. Think of it as a library of instructions for working with data representations.

It keeps track of these instructions, ensuring they are valid and accessible to other parts of the system. When new instructions are added or existing ones are changed, this service handles the process, keeping everything organized.

It collaborates closely with other services, such as the ones that manage storage and agent definitions, to make sure the embedding logic is used correctly and consistently throughout the system. If you're dealing with storage operations or agent behavior that relies on understanding and manipulating data representations, this service is involved.



The service validates new embedding instructions to ensure they're set up correctly. It logs its actions for debugging and monitoring, and it allows you to retrieve existing instructions when needed.

## Class DocService

The `DocService` class is responsible for automatically generating and writing documentation for the entire AI agent swarm system. It creates Markdown files that describe swarms, individual agents, and their performance data.

Think of it as a documentation generator that helps developers understand the system's structure and behavior. It pulls information from various services – like schema validation and performance monitoring – to create comprehensive documentation.

The class utilizes a thread pool to handle documentation creation efficiently and organizes the output into a structured directory system.  It also generates UML diagrams to visually represent agent and swarm schemas.

The `dumpDocs` function is the main entry point to generate all the documentation, while `dumpPerfomance` and `dumpClientPerfomance` focus on creating performance reports for the overall system and individual clients respectively.  Logging is enabled based on a global configuration setting, allowing for controlled verbosity during the documentation process.


## Class ComputeValidationService

This class, ComputeValidationService, helps manage and verify the configurations for different computational tasks within your AI agent swarm. Think of it as a central hub for ensuring that each task has the right setup and data structure.

It keeps track of available computations, allowing you to add new ones and retrieve a list of what's registered.  The core function is the `validate` method, which you'll use to make sure a specific computation is properly configured before it runs.  It relies on other services like `loggerService`, `stateValidationService`, and `stateSchemaService` to handle logging, data validation, and schema definition – making the validation process more robust and organized. It provides methods to manage a map of available computations, essentially providing a registry of how each computation should be structured and operated.

## Class ComputeUtils

This class, ComputeUtils, provides tools for managing and retrieving information about computational resources within the agent swarm. 

It lets you update the status of a specific computation, identified by a client ID and compute name. You can also fetch data associated with a computation, and the data type is flexible, allowing you to retrieve various kinds of information as needed. Think of it as a way to keep track of what computations are running and get the results or current state of those computations.

## Class ComputeSchemaService

This service helps manage and organize the different blueprints or structures used by your AI agents. Think of it as a central repository where you store and retrieve these pre-defined plans. 

It allows you to register new blueprints, update existing ones, and easily access the blueprint you need when working with your agents. It keeps track of these blueprints, using a context service to ensure everything is handled correctly and consistently. 

You can add new blueprints, replace existing ones, and retrieve the blueprint you need, all while the service keeps everything organized and in sync. The service uses a logger to track its actions and keeps everything aligned with the overall schema context.

## Class ComputePublicService

This class, `ComputePublicService`, acts as a bridge connecting your system to compute resources. It provides a way to interact with and manage these resources, handling requests and ensuring smooth operation.

Think of it as a central point for sending instructions to and retrieving data from the compute layer. The `loggerService` helps in tracking what's happening, and `computeConnectionService` manages the actual connection.

You can use `getComputeData` to retrieve information, `calculate` to trigger computations, `update` to modify data, and `dispose` to properly release resources when they're no longer needed – all within a specific context defined by a method name, client ID, and compute name. This ensures everything is handled cleanly and in a controlled manner.

## Class ComputeConnectionService

This class, `ComputeConnectionService`, acts as a central hub for managing and coordinating AI agents within a swarm. It handles connections, retrieves data, and ensures agents are synchronized.

Think of it as the traffic controller for your AI agents; it connects them to necessary resources and keeps track of their overall state.

It relies on several other services – like logging, messaging, and schema management – to operate effectively.

The `getComputeRef` method allows you to retrieve a specific AI agent's connection details based on its ID and name, and it intelligently caches those details for speed.

`getComputeData` retrieves the current overall state of the agent swarm.

The `calculate` method triggers a recalculation process, ensuring agents are working with the latest information.

`update` refreshes the system’s state, and `dispose` gracefully shuts down and cleans up resources when no longer needed.

## Class CompletionValidationService

This service helps keep track of the names of tasks (we call them "completions") used within the swarm system, making sure each one is unique and properly registered. It works closely with other services, like the one that registers completion names and the one that validates what agents are doing.

The service uses a simple list to store the registered completion names, and it checks this list whenever a completion name needs to be validated. To help things run smoothly, it uses a technique called memoization, which means it remembers the results of previous checks so it doesn't have to do the same work again. 

You can add new completion names to the list using `addCompletion`.  When you need to confirm that a specific completion name is valid, you use the `validate` function, which also logs the operation for tracking purposes.

## Class CompletionSchemaService

This service acts as a central hub for managing the blueprints of how agents complete tasks. It’s like a library of predefined functions that agents can use, ensuring they all follow a consistent structure.

It keeps track of these "completion schemas" using a registry, allowing the system to easily find and use them. Before adding a new schema, it does a quick check to make sure everything is in order.

The service works closely with other parts of the system, like the agent schema manager, the connection services, and the client agents, ensuring agents have the right tools to get their work done. If logging is enabled, you’ll see messages about when schemas are added, updated, or retrieved. Think of it as making sure all the agents have access to the same set of reliable and well-defined completion functions. You can even update existing completion blueprints without restarting anything.

## Class ClientSwarm

This class, `ClientSwarm`, is like the conductor of a team of AI agents working together. It manages all the agents, keeps track of which one is currently active, and handles the flow of information between them. 

Think of it as having a stack of agents you can navigate—you can switch between them and pop them off the stack. The system also queues up output from agents and lets you cancel operations if needed.

You can listen for updates as agents change or when a message is sent. It's designed to work with other parts of the system, like managing connections, handling agent instances, and emitting events. The `waitForOutput` method lets you reliably wait for a response from an agent, and `emit` sends validated messages to subscribers. The `dispose` method makes sure everything is cleaned up when you've finished using the swarm.

## Class ClientStorage

This class is responsible for managing data storage within the AI agent swarm system, providing both traditional storage operations and intelligent search capabilities based on data embeddings. It handles adding, removing, and updating data, as well as efficiently finding similar data items.

The class relies on other services for its functionality, including those responsible for connecting to storage, generating data embeddings, managing agents, and handling communication events. It uses a map to quickly access data and a queue to ensure operations are processed in a controlled order.

Key features include:

*   **Efficient Searching:** You can search for data based on similarity, allowing agents to quickly find relevant information.
*   **Data Management:** Provides methods for adding (upsert), deleting (remove), and clearing all data.
*   **Controlled Operations:** Operations are queued and executed sequentially, ensuring data consistency.
*   **Embedding Generation:** Automatically creates embeddings for data to enable similarity search.
*   **Lifecycle Management:** Handles initialization and cleanup, ensuring resources are properly managed.
*   **Event Emission:** Notifies other parts of the system about storage changes.

## Class ClientState

The ClientState class manages the data for a single client within the larger swarm system. It acts as a central hub for holding and updating that client’s state.  Think of it as a container holding the current information about a particular client, and providing a safe way to read, write, and react to changes. It's built to handle multiple requests to modify this data at the same time, making sure everything happens correctly. The ClientState also keeps track of when it’s ready, and can notify other parts of the system when the state changes. When you're finished with a ClientState, it can be cleaned up properly to release any resources it's using.

## Class ClientSession

The `ClientSession` class manages interactions within your AI agent swarm, acting as the central point for a single client's experience. Think of it as a dedicated workspace for each user connecting to the swarm.

It handles sending messages, validating them against security policies, and managing the agent's history – everything from user inputs to tool outputs and system messages. This class uses internal components to send notifications and emit messages to subscribers, and it’s tightly connected to other services within the swarm to manage sessions, agents, and data.

Here's a quick breakdown of what it does:

*   **Message Handling:** It sends messages, executes commands using agents, and emits responses, all while ensuring everything adheres to predefined rules.
*   **Agent History:** It keeps track of all interactions within a session, including user messages, tool requests, and system updates.
*   **Real-time Communication:** It allows for interactive sessions by connecting to message connectors, enabling immediate responses and continuous dialogue.
*   **Session Lifecycle:** It has a `dispose` method for clean-up when a session is complete, releasing resources and ensuring stability.



Essentially, `ClientSession` provides a structured and controlled environment for each user’s interaction with the agent swarm.

## Class ClientPolicy

The `ClientPolicy` class is responsible for managing restrictions and security measures for individual clients interacting with the swarm. It handles things like banning clients, validating messages they send and receive, and ensuring they adhere to the swarm's rules. 

This class dynamically loads lists of banned clients, preventing unnecessary loading, and can automatically ban clients if they violate policies. When validation fails, it provides helpful feedback and triggers appropriate events.  The class integrates closely with other components in the system, like those managing swarm connections and handling events, to maintain consistent and secure operation. Banning and unbanning clients are managed through specific methods that update the ban list and trigger notifications.

## Class ClientOperator

The `ClientOperator` helps manage and coordinate AI agents within a swarm. It acts as a central point for sending instructions and receiving results from these agents.

The `ClientOperator` is initialized with configuration settings. It's designed to handle input and manage the flow of information, although some functionalities like committing tool outputs and assistant messages are currently unavailable. 

You can use methods like `execute` to send input to the agents, `waitForOutput` to get the results, and `commitUserMessage` to pass on user-provided content. The `dispose` method ensures resources are properly released when the operator is no longer needed.  The framework allows for adapting agent behavior through `commitAgentChange`, although other features are reserved for future expansion.

## Class ClientMCP

This class acts as a connection point for your application to interact with the AI agent tools. It handles fetching, caching, and managing those tools for specific clients. 

You can use it to see what tools are available to a client, check if a particular tool exists, or even call a tool and get its results. The class also keeps track of tools and refreshes them when needed, and cleans up resources when a client is finished. Think of it as the main interface for controlling and using your AI agent tools.

## Class ClientHistory

This class manages the history of messages for a specific agent within the swarm system. It's responsible for storing, retrieving, and preparing these messages for use, like when the agent needs to generate a response.

Think of it as a log of everything the agent has said and received. It keeps track of this history and can be configured to include or exclude certain types of messages based on agent-specific requirements.

You can add new messages to the history, retrieve the most recent message to potentially undo an action, or get the entire history as an array. The most important method, `toArrayForAgent`, transforms the history into a format perfect for the agent to use when creating responses, including any initial prompts or system instructions. Finally, when the agent is finished, `dispose` cleans up and releases any resources used by the history.

## Class ClientCompute

This component, called `ClientCompute`, handles the core logic for interacting with a compute resource within your AI agent swarm. Think of it as a manager that orchestrates tasks and retrieves information related to a specific compute unit. 

It's built to work with a set of initial configuration parameters that guide its operation.  The `getComputeData` method allows you to fetch the current state or information from the compute resource.  The `calculate` method triggers a computation process, updating the system's state based on a specified state name. `update` ensures the compute is synchronized, and `dispose` cleans up resources when it's no longer needed. Essentially, it provides the tools to monitor, process, and manage a compute within the swarm.

## Class ClientAgent

This class, `ClientAgent`, is the core of a client-side AI agent that participates in a swarm. It handles everything from processing incoming messages to managing tool calls and even recovering from errors.

Think of it as a little worker bee within a larger hive of AI agents. It receives instructions (messages), decides what tools to use (if any), executes those tools, and then sends back the results.

**Here's a breakdown of what it does:**

*   **Receives and Processes Messages:** It takes in text messages and uses them to decide whether to run tools or generate a response.
*   **Manages Tools:** It can use tools to perform actions like searching the web or running code. It keeps track of these tools and their usage.
*   **Error Handling:** If something goes wrong (like a tool failing), it attempts to recover and keep the conversation flowing.
*   **Communication:**  It communicates with other parts of the system to share information about what's happening (e.g., when a tool is used, or if an error occurs).
*   **State Management:** It manages the agent's internal state, including its history of interactions.
*   **Cleanup:** It provides a way to shut down the agent and clean up any resources it’s using.

**Key features:**

*   **Queued Execution:** Prevents multiple tasks from running at the same time, ensuring stability.
*   **Asynchronous State:** Uses specialized subjects to track changes like tool errors or agent updates.
*   **Dynamic System Prompts:** Creates the context for the agent by combining static and dynamic messages.
*   **Error Recovery:** Attempts to fix problems like tool failures automatically.
*   **Coordination:** Works with other services to share information and coordinate actions within the overall swarm system.

## Class ChatUtils

This class, ChatUtils, manages and orchestrates chat sessions for different clients, acting as a central hub for communication. It’s responsible for creating, managing, and cleaning up chat instances related to a specific swarm. 

When a new client wants to start chatting, `beginChat` sets up a dedicated chat session. The `sendMessage` method is used to send messages through that session.  If you need to know when a chat session is ending, `listenDispose` allows you to register a function to be called. Finally, `dispose` cleanly shuts down a chat session when it's no longer needed. 

You can customize how chat instances are created by setting the `ChatInstanceFactory` or adjust their behavior by providing custom callbacks with `useChatCallbacks`. The `useChatAdapter` function lets you define which class will be used to actually create the chat instances.

## Class ChatInstance

This class, `ChatInstance`, represents a single chat session within your AI agent swarm orchestration framework. It’s designed to manage a conversation between an agent and a user, keeping track of its lifecycle and activity.

When you create a `ChatInstance`, you’re essentially starting a new chat session identified by a unique client ID and associated with a specific swarm. It has internal mechanisms to handle clean-up when the session ends and to notify listeners when that happens. 

You use methods like `beginChat` to start the conversation, `sendMessage` to send messages, and `dispose` to properly end and release the chat instance. `checkLastActivity` is used internally to determine if the chat is still active. The `listenDispose` method allows you to be notified when the chat session is terminated, enabling you to trigger actions accordingly.

## Class BusService

The `BusService` is the central hub for communication within the AI agent swarm. Think of it as a delivery service for important messages (events) between different parts of the system.

It manages how different components "subscribe" to receive specific types of events and how those events are then "emitted" or sent out.  It's designed to be efficient by remembering which event subscriptions are active, avoiding unnecessary overhead.

Here's a breakdown of what it does:

*   **Event Delivery:** It makes sure that events reach the right components within the system.
*   **Subscription Management:** It allows different parts of the system to sign up to receive specific event types. This can be for a particular client or for all clients through wildcard subscriptions.
*   **Session Security:** It verifies that only authorized clients are sending events.
*   **Specialized Events:**  It provides shortcuts like `commitExecutionBegin` and `commitExecutionEnd` for common execution-related events.
*   **Cleanup:** It provides a way to easily stop all event subscriptions for a client when they are no longer needed.

Essentially, `BusService` ensures that the AI agents can reliably communicate and coordinate their actions.

## Class AliveService

This class helps keep track of which clients are currently active within your AI agent swarms. It lets you easily signal when a client comes online or goes offline, recording these changes for later reference. When configured to do so, it saves this status information so it’s not lost. You can use the `markOnline` and `markOffline` methods to update a client's status within a specific swarm, and the system automatically logs these actions.

## Class AgentValidationService

This service acts as a central point for ensuring agents within the system are correctly configured and work together properly. It keeps track of agent schemas, their dependencies on each other, and related resources like storage and states.

When a new agent is added, this service registers it and its details, allowing you to later check what resources (storage, wikis, states, MCPs) an agent uses or if it depends on other agents. You can retrieve lists of registered agents or check if an agent has a specific resource or dependency.

The `validate` method is key - it performs comprehensive checks on an agent’s configuration, making sure everything is set up as expected and relying on other specialized services to do the heavy lifting for tasks like checking tool configurations. Memoization helps ensure these validations are performed efficiently. All operations are logged to help with debugging and monitoring.

## Class AgentSchemaService

This service acts as a central place to store and manage the blueprints for your AI agents within the swarm system. Think of it as a library of agent definitions, each outlining what an agent does, what resources it needs, and how it interacts with others.

It carefully checks these agent blueprints to make sure they are structurally sound before they're put into use, ensuring consistency across the entire system. You can register new agent blueprints, update existing ones, and easily retrieve them when needed.  The system keeps track of these actions and logs them for debugging and monitoring purposes, following established logging patterns used by other core services. This service is a critical foundation for defining and deploying your AI agents.


## Class AgentPublicService

This class provides a public interface for interacting with agents within the swarm system, acting as a bridge between client requests and the underlying agent operations. It handles things like creating agents, running commands, and logging those actions.

Think of it as the main way clients communicate with agents. When a client wants to run something on an agent, they're likely using a method provided by this class.

Several key functionalities are wrapped with context scoping and logging:

*   **Agent Creation:** `createAgentRef` helps establish connections to specific agents.
*   **Command Execution:** `execute` runs commands on an agent, including tracking and event triggering.
*   **Stateless Operations:** `run` performs quick, stateless actions.
*   **Output Retrieval:** `waitForOutput` retrieves the agent's output after an operation.
*   **History Management:** Methods like `commitToolOutput`, `commitSystemMessage`, and `commitUserMessage` are used to add information to the agent’s history, such as tool requests or user input.
*   **Cleanup:** Functions like `dispose` and `commitFlush` handle releasing resources and clearing agent history.

Essentially, this class provides a controlled and logged way to manage agent operations, ensuring everything happens within a defined context and with appropriate tracking.

## Class AgentMetaService

The AgentMetaService helps visualize and understand the relationships between agents in your swarm. It takes agent definitions and turns them into diagrams using a standardized UML format.

This service builds a tree-like representation of each agent, showing its dependencies, states, and tools, or just the core dependencies for a simpler view. You can request a complete diagram with all linked agents, or a more focused one.

It works closely with other parts of the system, like the documentation and performance monitoring tools, by providing this standardized visual representation. The service also keeps track of what it’s doing and logs important information when enabled, ensuring transparency and making debugging easier.

## Class AgentConnectionService

This class manages the connections and operations for AI agents within the system. Think of it as a central hub for creating, running, and tracking agent activity.

It cleverly reuses agent instances using a caching mechanism (memoization) to boost efficiency.  Whenever you need to work with an agent, it first checks if it already exists—if not, it creates it.

The class relies on several other services for things like logging, tracking usage, and managing history.  It allows you to execute commands, get quick completions, and commit messages to the agent’s history.  It also provides ways to control the agent's workflow, like preventing tool executions or clearing its memory.  Finally, it cleans up resources when an agent is no longer needed.

## Class AdapterUtils

This class offers helper functions to easily connect to different AI services like Cohere, OpenAI, LMStudio, and Ollama. Each function takes the specific client library for the AI service and some optional details, like the model to use, and returns a standardized function you can use to request completions. Essentially, it simplifies the process of using these different AI providers within your orchestration framework, hiding the complexities of each API behind a common interface. You can think of these as adapters that translate requests into the language each AI service understands.

# agent-swarm-kit interfaces

## Interface TAbortSignal

This interface helps you gracefully stop ongoing tasks, similar to how you might cancel a file download. It builds on the standard way web browsers handle cancellations and lets you add your own custom information if needed. Think of it as a way to signal to an operation that it should stop what it's doing and clean up.

## Interface IWikiSchema

This interface, `IWikiSchema`, helps define how your AI agents interact with a knowledge base represented as a wiki. Think of it as a blueprint for connecting your agents to a wiki. 

It specifies essential details like a unique name for the wiki (`wikiName`) and a short explanation of its contents (`docDescription`). You can also provide functions (`callbacks`) to customize how the system handles operations related to the wiki. 

The `getChat` method is key – it allows your agents to query the wiki and receive textual responses, effectively allowing them to "read" and use the information within.

## Interface IWikiCallbacks

This interface defines a set of optional functions that can be used to respond to events within a Wiki-based AI agent system. Specifically, the `onChat` property allows you to register a function that gets called whenever a chat interaction happens. Think of it as a way to be notified and potentially react to conversations happening between agents, letting you customize the system’s behavior based on chat content.

## Interface ITriageNavigationParams

This interface lets you define the settings for how an AI agent navigates through a triage process. You specify the tool's name using `toolName`, explain what it does with `description`, and can add extra notes with `docNote` to help others understand the tool. Finally, `skipPlaceholder` allows you to tell the system which output to ignore when there are multiple navigation options available.

## Interface IToolRequest

This interface defines what's needed to ask the system to use a specific tool. Think of it as a standardized way for agents to say, "Hey, I need the 'search' tool to look for something, and here's what I want it to search for." It tells the system which tool you want to run and what information that tool needs to do its job. The tool name needs to be a tool the system already knows about, and the parameters provide the data the tool requires.

## Interface IToolCall

This interface describes a request to use a specific tool within the agent swarm. Think of it as a direct instruction from the AI model, telling the system to run a particular tool with certain inputs. Each tool call has a unique ID to keep track of it, a type that’s currently just “function,” and details about which function to run and what arguments it should use. The system uses this information to actually execute the tool and record the results.

## Interface ITool

This interface describes a tool that an AI agent can use, like a function it can call. Think of it as defining exactly what a tool *is* – its name, what it does, and what information it needs to work. 

Each tool has a `type`, which is currently always "function," and a `function` section detailing its specifics. The `function` section includes the tool’s name, a description of what it does, and the structure of the input parameters it expects. This information allows the AI model to understand the tool and how to use it correctly when generating requests.

## Interface ISwarmSessionCallbacks

This interface lets you listen for key events happening within your AI agent swarm. You can use it to track when agents connect, when commands are run, or when messages are sent. 

It offers callbacks for several lifecycle stages: connection, initialization, execution of commands, emission of messages, and finally, disconnection. You can plug in your own functions to these callbacks to log activity, trigger custom actions, or monitor the overall health and behavior of your swarm. It provides a way to stay informed about what’s happening in your AI agent network.

## Interface ISwarmSchema

This interface, `ISwarmSchema`, acts as a blueprint for setting up and managing your AI agent swarm. It lets you define how the swarm behaves, where it navigates, and how its agents are handled. 

You can use it to give your swarm a unique name and list the agents it contains. The `defaultAgent` property specifies which agent should be active if none is chosen initially.

For more advanced control, you can provide functions to load and save the swarm's navigation history and determine which agent is currently in charge.  `persist` allows you to store this information so it’s available next time.  The `callbacks` property allows you to hook into important events within the swarm’s lifecycle, providing a way to customize its behavior. Finally, `docDescription` lets you add notes to help others understand how your swarm works.

## Interface ISwarmParams

This interface describes the essential setup information needed to kick off a swarm of AI agents. Think of it as the blueprint for how the swarm gets started. It includes details like a unique ID for the client launching the swarm, a logging mechanism to track what's happening, a communication channel (the "bus") for agents to talk to each other, and a list of the individual AI agents participating in the swarm. Essentially, it's all the ingredients needed to bring the AI swarm to life and manage its operations.

## Interface ISwarmDI

This interface acts as a central hub for all the key services within the AI agent swarm system. Think of it as a toolbox containing all the utilities needed to build and manage the swarm, from documentation and event handling to agent connections and data validation. It bundles together services that handle everything from agent lifecycles and data storage to policy enforcement and schema management, making it easier to access and organize the core functionality. This single point of access simplifies how developers interact with the system's various components, ensuring a consistent and well-managed environment for AI agents to operate. Essentially, it provides a structured way to access all the necessary building blocks for the swarm.

## Interface ISwarmConnectionService

This interface outlines how different AI agents within a swarm can connect and communicate with each other. Think of it as a blueprint for establishing reliable links between agents, allowing them to share information and coordinate their actions. It’s specifically designed to provide a clear, public-facing definition of connection services, leaving out the internal workings to keep things organized and secure. This ensures everyone using the framework understands the expected connection behaviors.

## Interface ISwarmCallbacks

This interface lets you listen in on important events happening within your AI agent swarm. Specifically, it allows you to be notified whenever an agent's role or responsibilities shift within the swarm. You'll receive the agent's unique identifier, its new name, and the name of the swarm it belongs to, allowing you to adjust your application’s behavior or track agent activity as needed. Think of it as a notification system for agent transitions.

## Interface ISwarm

This interface lets you manage and interact with a group of AI agents working together. You can use it to get the name or the actual agent currently handling tasks, and to switch between different agents within the swarm. It allows you to pause any ongoing output generation and retrieve the combined output from the active agent when it’s ready. You can also send messages to the session's communication channel, and register or update the references of the agents. Think of it as a control panel for your AI team, allowing you to direct their work and receive their results.

## Interface IStorageSchema

This interface outlines how your AI agents' data storage is configured. It lets you control things like whether data is saved permanently, how it's accessed, and how it's indexed for searching.

You can define a unique name for each storage area within your agent swarm.  There's an option to share a storage area across all agents working for a single client.

You have the flexibility to customize the data retrieval and saving processes by providing your own functions.  The `embedding` property specifies which method is used to create indexes for efficient searching.

Optionally, you can add descriptions for documentation and provide default data.  The `callbacks` property allows you to hook into storage events and tailor their behavior. Finally, the `createIndex` function is used to generate search indexes for each piece of data stored.

## Interface IStorageParams

This interface defines how your AI agent swarm interacts with storage. Think of it as a set of tools for managing and working with embeddings – numerical representations of text used for searching and understanding. 

It lets you identify which client is using the storage, calculate how similar two embeddings are, and efficiently store and retrieve previously computed embeddings to avoid repeating work. You can also create new embeddings from text and are provided tools to log activity and communicate events within the swarm. Essentially, it’s the blueprint for how the swarm handles storing and accessing information.

## Interface IStorageData

This interface, `IStorageData`, outlines the basic information that gets saved and managed within the system. Every piece of data stored will have a unique `id`, which acts like its name tag so the system can easily find and work with it. Think of it as the primary key for everything being stored.

## Interface IStorageConnectionService

This interface helps ensure a consistent and well-defined way to connect to storage services within the AI agent swarm. Think of it as a blueprint for how different parts of the system interact with storage, making sure the public-facing functions are clear and predictable. It's designed to be used internally to create reliable storage connections without exposing unnecessary details.

## Interface IStorageCallbacks

This interface lets you listen in on important happenings related to your data storage. Think of it as a way to get notified when data is changed, searched for, or when the storage itself is being set up or taken down. You can use these notifications to keep track of what’s going on, log events, or perform any necessary setup or cleanup routines. Specifically, you'll get alerts when items are updated, when searches are performed, during initialization, and when the storage is being discarded.

## Interface IStorage

This interface lets your AI agents easily manage and access data within the system. Think of it as a shared workspace where agents can store information, retrieve what they need, and keep everything organized.

You can fetch a specific number of items by searching for related content – the system uses embeddings to find things that are similar.  It also provides a way to add new items or update existing ones, ensuring the system always has the latest information.  If an item is no longer needed, you can remove it, and the system keeps track of these changes. You can also grab a specific item by its unique ID, list all items (with the option to filter them), or completely wipe the storage clean and start fresh.

## Interface IStateSchema

The `IStateSchema` interface helps you define how a piece of information, or "state," is managed within your AI agent swarm. It lets you control things like whether the state is saved permanently, how it's initially created, and how it's accessed and changed.

You can give each state a unique name and even provide a description to make it clear what it represents.  The schema lets you choose whether other agents can access and modify the same state.

Importantly, you can provide functions to generate the starting value for the state, retrieve its current value, and update it. You can also add custom code – "middleware" – to run before or after state changes, and set up special functions that trigger when certain events happen to the state.

## Interface IStateParams

This interface defines the information needed to manage a specific state within the AI agent swarm. Think of it as a set of runtime details tied to a particular state.

It includes a unique identifier for the client that owns the state, a logger to keep track of what's happening with the state, and a communication channel (the bus) to allow the state to interact with other parts of the swarm. Essentially, it provides the context and tools for the state to function correctly.

## Interface IStateMiddleware

This interface defines how you can hook into the agent swarm's state changes. Think of it as a way to observe or even adjust the data being used by the agents, like adding extra checks or transformations. You can use it to make sure the state is always in a consistent format, or to add custom logic whenever the swarm updates its information. Essentially, it’s a way to customize how the agent swarm handles its internal data.

## Interface IStateConnectionService

This interface helps us define how different parts of the system interact and share information, specifically focusing on managing the state of our AI agents. Think of it as a blueprint for a service that handles connections and data flow. It’s designed to make sure the public-facing parts of the system are clean and well-defined, while keeping internal workings separate. This helps ensure stability and predictability when interacting with the framework.

## Interface IStateChangeContract

This interface, `IStateChangeContract`, defines how changes in an AI agent's state are communicated within the swarm orchestration framework. It focuses on providing a reactive way to monitor those state transitions. Specifically, it includes a property called `stateChanged` which allows you to listen for updates whenever an agent's state changes; it's like subscribing to notifications about the agent's current condition. Think of it as a simple way to be informed when an agent moves from, say, 'idle' to 'working' or 'error'.

## Interface IStateCallbacks

This interface lets you listen in on what's happening with a specific piece of data managed by the system. You can set up functions to be run when a piece of data is first created, when it's being cleaned up, when it's loaded, when it's read, or when it's modified. Think of it as a way to get notified about key moments in the lifecycle of your data and react to them, whether it’s for debugging, monitoring, or other custom actions. You'll provide these functions to keep track of the state's behavior.

## Interface IState

This interface helps you manage the agent swarm's internal data. Think of it as a central place to check what's happening, update information, and reset everything back to the beginning.

You can use `getState` to peek at the current status – it automatically handles any special processing you've set up. 

`setState` lets you update the data, but it does so in a controlled way, allowing you to base changes on the previous state and potentially using custom logic.

Finally, `clearState` provides a way to wipe the slate clean and return the swarm to its starting configuration.

## Interface ISharedStorageConnectionService

This interface lays out the publicly accessible methods for connecting to and interacting with shared storage. Think of it as a blueprint for how external systems can reliably access and manage data within the swarm’s shared storage. It specifically focuses on the operations intended for public use, leaving out any internal workings or configurations. By using this interface, developers can be sure they're using the storage connection in a supported and predictable way.

## Interface ISharedStateConnectionService

This interface outlines how different parts of the AI agent swarm can share information safely. Think of it as a blueprint for a service that allows agents to communicate and coordinate without exposing sensitive details. It's specifically designed to create a public-facing service that only shows the necessary information, keeping the inner workings private and secure. By using this interface, developers can build reliable and controlled communication channels within the swarm.

## Interface ISharedComputeConnectionService

This interface helps your AI agents connect to and share computing resources, like virtual machines or cloud functions. Think of it as a central hub where agents can request and release processing power. It provides methods to establish connections, check their status, and gracefully disconnect, ensuring efficient resource allocation within your AI agent swarm. The goal is to abstract away the complexities of underlying infrastructure, allowing agents to focus on their tasks without worrying about the technical details of getting work done. It enables a dynamic and adaptable system where agents can efficiently utilize shared computing power as needed.

## Interface ISessionSchema

This interface defines the structure for how session information will be organized in the system. Right now, it's a simple placeholder, meaning it doesn't contain any specific data fields yet. Think of it as a promise for future expansion where we'll be able to configure session-related settings and information. It sets the groundwork for how session data will be handled as the framework develops.

## Interface ISessionParams

This interface defines all the information needed to start a new session within your AI agent swarm. Think of it as the blueprint for setting up a workspace for your agents to collaborate. It includes things like a unique identifier for the application using the session (clientId), a way to log important events and errors (logger), rules and limitations for the session (policy), a communication channel for agents within the swarm (bus), the swarm itself managing the session (swarm), and a name to identify the swarm (swarmName). By providing these details, you’re essentially configuring the environment where your agents will operate.

## Interface ISessionContext

This interface holds all the important details about a particular session within the agent swarm. Think of it as a container for key information about who's using the system, what they're doing, and the environment their actions are happening in. You'll find the client's unique identifier, a process ID for tracking, and details about the specific method being used, if applicable. It also includes information about the environment the execution is running in. Essentially, it provides a complete picture of a session's state within the swarm.

## Interface ISessionConnectionService

This interface helps us define how external services interact with the session connection management. Think of it as a blueprint for building tools that work with our session connections, but without exposing the inner workings. It makes sure that the publicly accessible parts of session connection management are consistent and predictable.

## Interface ISessionConfig

This interface, `ISessionConfig`, helps you control how often and when your AI agents run. You can use it to set a `delay`, which determines the time interval between sessions, ensuring your agents don't overwhelm resources.  The `onDispose` property lets you define a function that runs when the session is finished, allowing for clean-up tasks or final actions. Think of it as a way to schedule and manage the lifecycle of your AI agent interactions.

## Interface ISession

The `ISession` interface provides the core functionality for managing a conversation or workflow within the agent swarm. It lets you send messages to the session, trigger executions, and control the flow of operations.

You can add user messages to the session’s record without immediate responses, or add messages representing the assistant’s output and system instructions. There are methods to clear the session's history and prevent further tool execution.

The `connect` method establishes a two-way communication link, while `emit` simply sends a message.  The `run` method allows stateless completions for testing or quick calculations, and `execute` carries out commands that may modify the session’s history. Finally, you can commit tool requests and outputs to manage the tools being used within the session.

## Interface IScopeOptions

This interface helps you configure how your AI agents interact within a swarm. You'll use it to specify a unique client ID for your application, a name for the specific swarm of agents you're working with, and a function that will be called if any errors occur during agent execution. Think of it as setting up the basic identity and error handling for your AI agent group. The client ID distinguishes your application, the swarm name organizes your agents, and the error handler lets you gracefully manage unexpected problems.

## Interface ISchemaContext

This interface, `ISchemaContext`, acts as a central hub for accessing and managing different schema registries within your AI agent swarm. Think of it as a directory containing specialized catalogs. Each catalog, like `agentSchemaService` or `wikiSchemaService`, holds information about specific types of schemas – agent schemas, completion schemas, and others – used by your agents. These registries are crucial for ensuring that your agents understand and correctly utilize the schemas they encounter during operation. You're essentially using this context to look up and interact with these schema definitions.

## Interface IPolicySchema

This interface defines the structure for creating policies that control how your AI agent swarm operates, particularly focusing on managing blocked or banned clients. You can use it to create rules that dictate which agents are allowed to communicate and how.

Policies can be configured to save banned client information persistently, making sure your restrictions stick around even if the swarm restarts.  You can also provide descriptions to make your policies easier to understand and manage.

Each policy has a unique name and can optionally provide a default message displayed when a client is banned. More complex behavior can be implemented with customizable functions to generate ban messages or manage the list of banned clients. 

You have the flexibility to define custom validation rules for both incoming and outgoing messages, overriding the system's default validation. Finally, you can implement custom event handling through callbacks, allowing deeper control over validation and ban actions.

## Interface IPolicyParams

This interface defines the information needed to set up a policy – think of it as the blueprint for how your AI agents will coordinate. It ensures your policy has access to tools for logging what's happening and for sending messages between different agents in the swarm. You'll provide a logger object for recording actions and errors and a bus object for enabling communication across the entire AI agent network.

## Interface IPolicyConnectionService

This interface outlines the publicly accessible methods for connecting and managing policies within the AI agent swarm. It’s designed to be a blueprint for services that handle policy connections, specifically focusing on what developers interacting with the system need to know. Think of it as a guarantee of what actions can be performed related to policies, without revealing the internal workings of the system. It ensures a consistent and predictable way to interact with policy connections from the outside.

## Interface IPolicyCallbacks

This interface provides a way to get notified about key events happening within a policy, allowing you to react to those events. You can use the `onInit` callback to perform setup tasks when a policy is first created. The `onValidateInput` and `onValidateOutput` callbacks let you monitor and potentially influence the messages being processed by the policy. Finally, `onBanClient` and `onUnbanClient` allow you to track and respond to client ban and unban actions.

## Interface IPolicy

This interface defines how policies are enforced within the agent swarm. Think of it as a gatekeeper, controlling who can participate and what they can say. 

It allows you to check if a client is currently blocked (`hasBan`), retrieve the reason for a ban (`getBanMessage`), and verify messages going in (`validateInput`) and out (`validateOutput`) of the swarm.

You can also use it to actively manage client access by blocking (`banClient`) or allowing (`unbanClient`) clients to participate. Each of these actions is tied to a specific client and swarm.

## Interface IPipelineSchema

This interface describes the structure of a pipeline within our AI agent swarm orchestration framework. Each pipeline has a unique name, identified by the `pipelineName` property. 

The core of a pipeline is its `execute` function – this is what gets called when the pipeline is run. It takes a client identifier, the name of the agent to be used, and some data (`payload`) as input, and it returns a promise that resolves with the result of the execution or nothing if no specific result is expected.

Finally, you can attach callbacks to a pipeline using the `callbacks` property, allowing you to react to different stages or outcomes within the pipeline’s execution. These callbacks are optional and can be customized to suit your specific needs.

## Interface IPipelineCallbacks

This interface lets you listen in on the lifecycle of a pipeline run within the agent swarm. You can use it to get notified when a pipeline starts, when it finishes (successfully or with an error), and when an error occurs during the pipeline’s execution. The `onStart` callback provides initial information about the pipeline being launched, including who initiated it and what data is being passed along.  The `onEnd` callback lets you know when a pipeline completes, along with whether it finished successfully or encountered a problem.  Finally, the `onError` callback provides details about any errors that cropped up during the pipeline's operations.

## Interface IPersistSwarmControl

This interface lets you personalize how your AI agent swarm's data is saved and retrieved. You can swap out the default saving mechanisms for both the active agents and the navigation stacks—essentially, the history and pathways your agents follow. This is useful if you want to store this information in a specific way, like using a database or even keeping it entirely in memory for testing. It gives you the flexibility to adapt the framework to your unique storage needs, allowing you to control where and how the swarm’s key data is preserved.

## Interface IPersistStorageData

This interface describes how data meant for long-term storage within the AI agent swarm is structured. Think of it as a container holding a collection of individual data items – perhaps configurations, observations, or any other information the swarm needs to remember. The `data` property simply contains the actual collection of these data items, ready to be saved and retrieved later. It’s designed to work with the persistence utilities provided by the framework, ensuring a consistent way to manage storage across the swarm.

## Interface IPersistStorageControl

This interface lets you tailor how data is saved and retrieved for a specific storage area. Think of it as a way to swap out the default data saving method with your own custom solution. If you need to save data to a database instead of a file, for instance, you can use this to plug in your database adapter. It allows you to provide a specific class that handles the persistence logic, giving you greater control over how information is stored and loaded.

## Interface IPersistStateData

This interface helps the system remember important information about your AI agents, like their configurations or the progress of a session. Think of it as a container for any data you want to save and reload later. The `state` property inside holds the actual data you want to persist, and it can be of any type you define – it's completely flexible to your needs. This allows the swarm to maintain context and avoid starting from scratch each time.

## Interface IPersistStateControl

This interface gives you a way to manage how agent states are saved and loaded. You can plug in your own system for handling this, like connecting to a database instead of using the default method. This is useful if you need more control over where and how state information is stored, especially when dealing with specific state names. Basically, it lets you customize the persistence layer for your agents.

## Interface IPersistPolicyData

This interface outlines how the system remembers which clients are restricted within a specific swarm. It essentially keeps a record of banned session IDs – think of it as a list of clients that are not allowed to participate – associated with a particular swarm. This data is used to enforce rules and manage access within the swarm environment. The interface simply defines a place to store those banned session IDs, making it easy to track and apply restrictions.

## Interface IPersistPolicyControl

This interface lets you tailor how policy information is saved and retrieved for your AI agent swarms. Think of it as a way to swap out the standard data storage mechanism with something you build yourself. You can use this to connect your swarm's policy data to a database, an in-memory store, or any other persistence solution you prefer, giving you more control over where and how the data lives. It's particularly useful when you need a non-standard storage approach for a specific swarm.

## Interface IPersistNavigationStackData

This interface helps remember where you’ve been when navigating between agents in your AI swarm. It essentially holds a list of agent names, acting like a navigation history. Think of it as a breadcrumb trail that lets you easily go back to previous agents you were working with. This stack is used to keep track of which agents a user has interacted with during a session.

## Interface IPersistMemoryData

This interface describes how to store information that your AI agents need to remember. Think of it as a container holding whatever data – like session details or temporary calculations – that an agent needs to keep track of. The `data` property within this container holds the actual information being saved. This structure is used to help the system reliably store and retrieve this important agent memory.

## Interface IPersistMemoryControl

This interface gives you a way to plug in your own custom code to handle how the agent swarm's memory is saved and retrieved. Think of it as a hook that lets you swap out the standard memory storage mechanism with something tailored to your specific needs, like storing the memory in a database or an in-memory cache instead of the default approach. By using this, you can control precisely how memory associated with a particular session (`SessionId`) is persisted.

## Interface IPersistEmbeddingData

This interface describes how data related to embeddings is stored persistently within the AI agent swarm. It's designed to hold a collection of numbers – essentially a vector – that represents the meaning or characteristics of a specific piece of text identified by a unique string hash. Think of it as a way to remember the 'essence' of a text snippet for later use by the swarm. The `embeddings` property holds the numerical values that make up this representation.

## Interface IPersistEmbeddingControl

This interface lets you tailor how embedding data is saved and retrieved. Think of it as a way to swap out the default storage mechanism for embedding information, like vectors representing text or other data. You can use it to plug in your own custom storage solutions, perhaps to save embeddings in a specific database or even just keep them in memory temporarily. This gives you fine-grained control over where and how your embedding data lives.

## Interface IPersistBase

This interface provides the fundamental tools for saving and retrieving information within the AI agent swarm. It lets you manage data stored as JSON files, ensuring that the swarm’s state and memories are preserved.

The `waitForInit` method sets up the storage area, creating it if it doesn’t exist and cleaning up any potentially damaged data. `readValue` gets a specific piece of data based on its unique identifier. To quickly check if data exists without retrieving it, you can use `hasValue`. Finally, `writeValue` lets you save data back to the storage, ensuring that the information is stored reliably.

## Interface IPersistAliveData

This interface helps keep track of whether individual clients are currently active within a group of agents. It's a simple way to know if a client, identified by a unique session ID, is online or has gone offline within a specific swarm. The interface just has one property: `online`, which is a boolean value telling you the client's status.

## Interface IPersistAliveControl

This interface lets you customize how the system remembers whether an AI agent swarm is still active. By default, the system handles this automatically, but if you need more control – perhaps you want to use a unique storage method – you can provide your own persistence adapter. This allows you to tailor the alive status tracking to your specific needs, like tracking in memory instead of a database. Essentially, it’s a way to plug in your own solution for remembering the swarm's status.

## Interface IPersistActiveAgentData

This interface describes how we keep track of which agent is currently running for each client and swarm. It essentially allows us to remember the active agent, identified by its name, so we can resume operations or maintain state. Think of it as a way to bookmark the current agent being used – the `agentName` property holds that identifier. This is particularly helpful when dealing with long-running processes or needing to recall where things left off.

## Interface IPerformanceRecord

This interface helps track how well a specific process is performing within the agent swarm. It bundles together data about executions and response times from all the clients involved, like different sessions or agent instances.  Think of it as a way to monitor the overall efficiency of a task – how many times it ran, how long it took, and when it happened.

The `processId` clearly identifies which process the data represents. The `clients` array contains detailed performance records for each individual client involved.  You're also given totals like the `totalExecutionCount`, `totalResponseTime`, and calculated averages, making it easy to see overall performance trends. Finally, timestamps in different formats (`momentStamp`, `timeStamp`, and `date`) give you precise timing information for when the data was recorded.


## Interface IPayloadContext

This interface, `IPayloadContext`, acts as a container for everything an AI agent needs to know about a specific task. Think of it as a little package holding both the data for the agent to work with (the `payload`) and information about who requested the task (`clientId`).  The `clientId` helps track which client initiated the work, while the `payload` holds the actual information the AI agent will process. Essentially, it's a way to bundle together the task data and its origin into a single, structured unit.

## Interface IOutgoingMessage

This interface describes a message being sent *from* the AI agent swarm system *to* a client, like an agent itself or a user interface. Think of it as a standardized way to deliver results or notifications.

Each message has a `clientId`, which is a unique identifier telling the system *who* should receive it – ensuring it reaches the right agent or client.  It also carries `data`, which is the actual content of the message, such as a processed result or a response. Finally, `agentName` identifies which agent within the swarm is sending the message, providing context about its origin.

## Interface IOperatorSchema

The `IOperatorSchema` defines how different agents in your swarm can connect and communicate with each other. Think of it as a blueprint for setting up connections – it specifies a function, `connectOperator`, that allows a client to establish a link to a specific agent by name. This connection creates a channel where messages can be sent and responses received, allowing the agents to work together on tasks. The `connectOperator` function essentially wires up the communication pathway. You're telling the system, "Here's how a client can hook into this agent and send it messages, and here's how it will receive answers back." It provides a way to manage and control the interactions within your agent swarm.

## Interface IOperatorParams

This interface, `IOperatorParams`, defines the essential information needed to configure and run an agent within the orchestration framework. Think of it as a blueprint for setting up each agent. 

It includes the `agentName`, a unique identifier for the agent, and the `clientId`, which helps track the agent's context. 

The `logger` allows the agent to record its activities, while `bus` facilitates communication between agents. Finally, `history` is used to maintain a record of the agent's past actions and decisions.

## Interface IOperatorInstanceCallbacks

This interface helps you listen for important events happening within individual agents in your swarm. Think of it as a way to be notified when an agent starts working, provides an answer to a question, receives a message, finishes its task, or sends out a notification. Each event provides details like the client ID and the agent’s name, so you can track what’s happening with specific agents and clients. You can use these callbacks to build monitoring dashboards, log agent activity, or react to agent behavior in real-time.

## Interface IOperatorInstance

The `IOperatorInstance` interface defines how you interact with a single agent within your AI agent swarm. Think of it as the control panel for one agent. 

You use `init` to get the agent connected and ready to go. Then, `answer` lets you send responses back through the system. 

`notify` is for sending less critical information to the swarm.  

`recieveMessage` handles incoming messages, while `connectAnswer` sets up a way for the agent to report its findings back to you. Finally, `dispose` gracefully shuts down the agent and releases any resources it's using.

## Interface IOperatorControl

This interface lets you configure how operators within your AI agent swarm function. You can essentially tell the system what callbacks you want to use to monitor and interact with individual operators. Additionally, it allows you to provide your own custom "adapter" – a way to tailor the operator's behavior and implementation. Think of it as providing building blocks for fine-tuning the way operators in your swarm respond and operate.

## Interface INavigateToTriageParams

This interface helps you fine-tune how your AI agents navigate to a triage agent. It provides ways to customize the messages or actions taken when things happen during the process, like when a message needs to be cleared, an action is being executed, or a tool's output is either accepted or rejected. You can define specific functions to generate these messages, allowing you to tailor the communication style and behavior to your particular application's needs. Each property lets you specify either a simple text message or a more complex function that takes context like client ID and agent names to generate the appropriate message.

## Interface INavigateToAgentParams

This interface lets you customize how your system handles transitions between agents in a swarm. Think of it as a set of options to control the messages and actions that happen when moving from one agent to another. 

You can define a message to be sent when the system needs to clear its memory (the `flushMessage`), or what to display when an agent produces a tool’s output (`toolOutput`). 

More broadly, you have hooks for handling events like sending messages during execution (`emitMessage`) or actually triggering an action (`executeMessage`).  Each of these options can be a simple text message, or a function that allows you to dynamically create the message based on things like the user's last input or the name of the agent involved.

## Interface IModelMessage

This interface describes a single message within the agent swarm system. Think of it as the basic unit of communication between agents, tools, users, and the system itself. It's used to track the conversation history, generate responses, and manage events throughout the agent workflows.

Here's a breakdown of what each part represents:

*   **role:**  Identifies who or what sent the message.  Possible values include "tool" (output from a tool), "user" (input from a user), "assistant" (generated by the model), "system" (system notifications), "resque" (error recovery), and "flush" (history reset).
*   **agentName:**  Specifies the name of the agent that sent the message, which helps keep track of which agent is doing what in a swarm.
*   **content:** The actual text or data contained within the message. This is the core information being communicated.
*   **mode:**  Indicates whether the message originated from user input or a tool's output.
*   **tool\_calls:** If the message involves a tool, this array lists the specific tool calls being requested.  Includes details like the tool's name and arguments.
*   **images:** An array of image data, often representing visual content attached to the message.
*   **tool\_call\_id:** A unique identifier linking a tool's output message back to a previous tool call request.
*   **payload:**  Optional extra data attached to the message for more context. This can be anything relevant to the specific scenario.

## Interface IMethodContext

This interface, `IMethodContext`, provides a way to track details about a method call within the agent swarm system. It acts as a central record, associating a particular method invocation with various resources and components like the client, agent, swarm, storage, state, compute, policy, and MCP. Think of it as a data container that allows different services – such as those handling performance, logging, or documentation – to understand the context surrounding a specific method call, providing valuable information for monitoring, debugging, and overall system understanding. Each property represents a key piece of information, identifying the specific resources and agents involved in the method’s execution.

## Interface IMetaNode

This interface describes the basic building block for organizing information about agents and their connections within the system. Think of it as a way to represent agents and the resources they use in a structured, tree-like format. Each node has a `name` to identify it, whether it's an agent's name or a resource label. It can also have `child` nodes, allowing you to show how agents depend on each other or utilize specific resources, creating a visual map of their relationships.

## Interface IMCPToolCallDto

This interface defines the structure of data used when a client requests a tool to be used within the agent swarm system. It contains information like a unique ID for the tool being called, the client initiating the request, and the name of the agent involved. The `params` field holds the specific data needed for the tool to function, while `toolCalls` allows for chaining multiple tool executions.  You can also include an `abortSignal` to halt the operation and a flag `isLast` to signify the end of a series of tool calls.

## Interface IMCPTool

This interface, `IMCPTool`, describes the basic structure of any tool used within our AI agent orchestration framework. Think of it as a blueprint – it ensures that each tool has a clear name, a short explanation of what it does (optional, but helpful!), and a precise definition of the data it expects as input. The `inputSchema` is especially important; it specifies what kind of information the tool needs to work, and exactly what fields are required. It's all about making sure the agents and tools communicate effectively.

## Interface IMCPSchema

This interface describes the blueprint for a Managed Control Plane (MCP), which is essentially a coordinator for AI agents working together. 

Think of it as a recipe – it defines what an MCP *is* and what it *does*.

Each MCP needs a unique name and can optionally have a description to explain its purpose.

Crucially, it specifies how the MCP knows what tools are available for a given client and how to actually *use* those tools, sending them data and receiving results.

Finally, it allows for optional hooks or "callbacks" to be set up to react to different events in the MCP's lifecycle.

## Interface IMCPParams

This interface defines the essential components needed to run an MCP (Master Control Program) within our AI agent swarm orchestration framework. Think of it as a blueprint for how an MCP interacts with the broader system. 

It requires a `logger` to record what’s happening during its execution, which helps with debugging and monitoring. It also needs a `bus`, which acts as a communication channel for the MCP to send messages and receive updates from other parts of the swarm. Essentially, these two components provide the MCP with the tools it needs to function effectively within the larger AI agent network.

## Interface IMCPConnectionService

This service manages connections between agents in your swarm using a Message Correlation Protocol (MCP). Think of it as the post office for your AI agents, ensuring messages get to the right place even if agents are moving around or temporarily unavailable. It handles the complexities of message routing and acknowledgment, so you don't have to. You can use this to create reliable communication channels for coordinating complex tasks across your AI agents. It’s responsible for establishing, maintaining, and terminating these connections, and it provides methods for sending and receiving messages.

## Interface IMCPCallbacks

This interface defines a set of functions your code can use to be notified about what’s happening with the AI agent swarm orchestration framework. Think of these functions as event listeners; they let you react to different stages of the agent’s lifecycle.

You'll get a notification when the framework first starts up (`onInit`), and again when resources associated with a specific client are cleaned up (`onDispose`).  `onFetch` tells you when tools are being retrieved for a client, while `onList` signals that tools are being listed.

Most importantly, `onCall` lets you know when a tool is actually being used, along with details about which tool and what data is involved. Finally, `onUpdate` informs you when the available tool options for a client are changed. These callbacks provide a way to customize behavior and observe the orchestration process in real time.

## Interface IMCP

This interface lets you manage the tools available to your AI agents. You can use it to see what tools are offered to a particular agent, check if a specific tool is available, and actually run those tools with provided data. 

There's also functionality to refresh the list of available tools, either globally for all agents or for a specific agent, ensuring you have the latest options available. Essentially, it’s your central point for interacting with and controlling the tools your agents can use.

## Interface IMakeDisposeParams

This interface defines the information needed when you want to automatically manage the lifecycle of an AI agent swarm. It lets you specify a timeout, in seconds, after which the swarm will be automatically shut down if it’s inactive. You can also provide a function that gets called when a swarm is disposed, allowing you to perform any necessary cleanup actions; this function receives the client ID and swarm name as arguments. Essentially, this interface is for setting up a self-managing system for your AI agent swarms.


## Interface IMakeConnectionConfig

This interface, `IMakeConnectionConfig`, lets you control how quickly your AI agents try to connect and communicate. You can use it to prevent overwhelming the system or to create a more measured approach. The `delay` property within this configuration specifically dictates a waiting period – a number representing milliseconds – that should be enforced between connection attempts. This setting helps regulate the pace of interactions within your AI agent swarm.

## Interface ILoggerInstanceCallbacks

This interface lets you connect to a logger and be notified about what's happening with it. You can use it to react when the logger starts up, when it's shut down, or whenever a new log message, debug message, or informational message is recorded. Each callback function receives the client ID and the topic of the log event, allowing you to tie the notifications to specific parts of your system. It's a way to build custom monitoring or reporting around the logging process.

## Interface ILoggerInstance

This interface defines how a logger component should behave within the AI agent swarm orchestration framework. It builds upon a basic logging function to include ways to properly set up and shut down the logger.

The `waitForInit` method lets you control when the logger is ready to use, allowing for asynchronous setup processes and preventing errors from occurring before the logger is fully initialized.

The `dispose` method handles the cleanup of resources when the logger is no longer needed, ensuring a clean exit and releasing any client-specific resources.

## Interface ILoggerControl

This interface gives you control over how logging works within the AI agent swarm. You can use it to customize the central logging mechanism, set up specific lifecycle events for logger instances, or even replace the standard logger with your own custom version. It also provides convenient shortcuts to log messages for individual clients, ensuring session validation and tracking the context of the method being used. Essentially, this gives you a way to fine-tune the logging behavior to match your particular needs and integrate it deeply within the system.

## Interface ILoggerAdapter

This interface provides a standard way for different systems to communicate with the logging mechanism used by the AI agent swarm. It outlines the core actions – logging messages, debugging information, and releasing resources – that can be performed for a specific client. Think of it as a contract; any system that wants to handle logging for the swarm needs to implement these methods, ensuring a consistent approach to recording activity and cleaning up when a client is no longer needed. Each method takes a client identifier and a topic, and allows you to include variable data in the log. The `dispose` method is especially important for managing resources and preventing leaks when a client’s session is over.

## Interface ILogger

This interface defines how different parts of the AI agent swarm system record information. Think of it as a way to keep a detailed journal of what’s happening. 

You can use it to write general notes about events, record very detailed debugging information, or just provide standard informational updates. This logging system is used by almost every part of the framework, from the individual agents to the overall swarm management, to help track progress, find problems, and understand how things are working.

## Interface IIncomingMessage

This interface describes a message that enters the system, often originating from a user or another client. It holds key information about the message itself and where it came from.

Each message has a unique `clientId`, which identifies the client that sent it, letting the system know who the message is associated with. The `data` property contains the actual content of the message, like a user's request or a piece of information. Finally, `agentName` specifies which agent within the system should handle this particular message.

## Interface IHistorySchema

This interface describes how your AI agents' conversations are saved and accessed. Think of it as the blueprint for the system that remembers what your agents have said and done. Specifically, it focuses on the “items” property, which handles the actual saving and loading of those conversation records, letting you choose how that history is stored – maybe in a database, a file, or somewhere else. This part of the framework lets you customize how the agents' memory works.

## Interface IHistoryParams

This interface defines the information needed to set up a history record for an AI agent. Think of it as a blueprint for keeping track of what an agent does and says.

It includes details like the agent's name, a limit on how much of its conversation history to store to manage resources, a client identifier for tracking usage, and tools for logging and communication within the larger system. Essentially, it's all about creating a well-organized and trackable record for each agent's actions.


## Interface IHistoryInstanceCallbacks

This interface defines a set of callback functions used to manage how agent conversation history is handled. You can use these callbacks to customize how the system retrieves initial history, filters messages, and reacts to changes in the history data – like when new messages are added or old ones are removed. These functions also provide hooks for reacting to the beginning and end of history read operations, and for being notified when the history instance is initialized, updated, or cleaned up. Finally, one callback provides direct access to the history instance itself after it has been created.

## Interface IHistoryInstance

This interface outlines how different history implementations should behave. Think of it as a blueprint for managing a record of interactions for each AI agent within the swarm. 

You can use the `iterate` method to step through all the messages associated with a specific agent, allowing you to review the conversation or analyze its behavior.

The `waitForInit` method is used to prepare the history for an agent, which might involve loading data from a database or external source.

To add a new message to an agent's history, you would use the `push` method. 

If you need to retrieve and remove the most recent message, the `pop` method lets you do that.

Finally, the `dispose` method cleans up the history for an agent, freeing up resources and potentially removing all stored data.

## Interface IHistoryControl

This interface lets you fine-tune how the system manages its memory and past interactions. You can tell it when to trigger certain actions, like saving or clearing history, by providing callback functions. 

Also, if you need more specialized behavior, you can supply your own custom way of creating history objects using a provided constructor. This allows you to adapt the history management to your specific needs.

## Interface IHistoryConnectionService

This interface, IHistoryConnectionService, is essentially a blueprint for how services related to historical data connections should behave. It's designed to provide a clear definition of the public-facing parts of a historical connection service, specifically by outlining what functionalities are available without revealing the underlying implementation details. Think of it as a contract – it specifies what a service *must* do to be considered a valid historical connection service. It helps ensure consistency and predictability in how these services operate.

## Interface IHistoryAdapter

This interface lets you manage a record of messages exchanged within the agent swarm. Think of it as a way to keep track of what each agent is saying and doing. 

You can add new messages using the `push` method, retrieve the most recent message with `pop`, and clear the history entirely using `dispose`.  The `iterate` method provides a way to step through all the messages for a specific agent and client, allowing you to review the conversation flow.

## Interface IHistory

This interface helps keep track of all the messages exchanged with an AI model, whether it's part of an agent's conversation or used directly. 

You can add new messages to the history using `push`, and retrieve the most recent message using `pop`. 

Need to prepare the history for a specific agent? The `toArrayForAgent` method lets you format the messages based on a given prompt and system instructions.  If you just need all the raw messages, `toArrayForRaw` gets them all for you.

## Interface IGlobalConfig

This configuration file, `IGlobalConfig`, sets the behavior for the AI agent swarm system. Think of it as a central control panel that influences how agents interact, handle errors, and process information.

**Troubleshooting Tools:**  The system has built-in prompts to help recover from tool call errors.  There's a "flush" option to clear the conversation and a "recomplete" option to try correcting the tool calls.

**User Experience:** The system uses placeholder responses when a model doesn't produce output, providing a more user-friendly experience.

**Agent Management:** You can customize how tools are used, how agent history is managed (limiting it to 15 messages), and how agents change within a swarm.  There are also functions for determining the default agent and navigation paths.

**Logging:**  The configuration controls the level of detail in logging, from general information to very specific debug output.

**Error Handling:** When things go wrong, the system can try different recovery strategies, or it can hand things over to custom error handling.

**Data Storage:** The settings impact how data is stored and retrieved, including embedding caching which helps optimize costs when using local embeddings with models.

**Security & Control:** The system has ways to enforce policies, ban clients, and manage operators, ensuring the overall system operates securely and efficiently.  There’s also a check for recursive agent changes to prevent issues.

**Customization:** Many of these settings can be changed via `setConfig`, allowing you to tailor the system's behavior to your specific needs.  For example, you can define your own functions for handling tool exceptions or validating agent outputs.


## Interface IFactoryParams

This interface lets you customize how a system interacts with individual AI agents during a navigation process. It allows you to define specific messages or functions to be used when the system needs to clear data, handle the results of a tool's action, send messages, or execute commands. You can tailor these actions by providing a static message or a function that dynamically generates a message, potentially incorporating information like the client ID, the agent's name, or the last user's input. This level of customization gives you fine-grained control over the communication flow and behavior of your AI agent swarm.

## Interface IFactoryParams$1

This interface helps you customize how a navigation handler interacts with a triage agent. You can provide specific messages or functions to guide the agent's behavior when it needs to clear its memory (flush), start a task (execute), or receive results from a tool. 

Essentially, you can tailor the prompts or instructions sent to the agent for different situations—like when it needs to clear its working memory, begin a new step, or process the outcome of using a tool. These customizations can be simple text strings or more complex functions that dynamically generate messages based on the situation.


## Interface IExecutionContext

This interface describes the shared information used to track a single run or task within the AI agent swarm. Think of it as a common set of labels that different parts of the system use to identify and monitor a specific activity. 

Each execution gets a unique client identifier, a unique execution ID to track its progress, and a process ID which ties it back to the overall system configuration. This shared context helps services like the client agent, performance monitoring, and message routing work together seamlessly.

## Interface IEntity

This interface forms the foundation for everything the swarm system stores and remembers. Think of it as a common blueprint that all the different types of data – like agent status or task information – build upon. It ensures that all persistent data shares a consistent underlying structure, even though each specific type of data might have its own unique details.

## Interface IEmbeddingSchema

This interface helps you configure how your AI agents understand and compare information within the swarm. You can specify a unique name for your embedding method and choose to save the agent's state and navigation history for later use.

It provides ways to save and retrieve pre-calculated embeddings, preventing repeated computations. You have the flexibility to customize embedding-related events through optional callbacks.

You'll use functions provided by this interface to generate embeddings from text and to measure how similar two embeddings are – crucial for tasks like searching and ranking.

## Interface IEmbeddingCallbacks

This interface lets you tap into key moments during the embedding process, which is how your AI agents understand and compare information. You can use the `onCreate` callback to monitor when new embeddings are generated, allowing you to log details or apply any extra steps. Similarly, `onCompare` gives you a notification whenever two pieces of text are compared for how similar they are, providing insights into how your agents are evaluating relationships. Think of these callbacks as notification bells that ring when specific embedding tasks are completed, giving you control and visibility.

## Interface ICustomEvent

This interface lets you create and send custom events within the swarm system, going beyond the standard event types. Think of it as a way to communicate specialized information that doesn't fit neatly into the predefined event structures. You can attach any kind of data you want to these events through the 'payload' property, allowing you to build truly bespoke event scenarios. It's particularly useful when you need to share user-defined information or status updates that aren’t covered by the standard event formats.

## Interface IConfig

This interface defines the configuration options for generating a visual representation of your AI agent swarm's interactions. Specifically, the `withSubtree` property lets you control whether the generated diagram includes a detailed view of the hierarchical relationships within your agents – if set to true, you'll see a more complex and interconnected visual, while false simplifies the diagram to show only the top-level connections. Think of it as a toggle for how much detail you want in the diagram.

## Interface IComputeSchema

This interface describes the configuration for a computational unit within an AI agent swarm. Think of it as a blueprint for how a specific task or process will be executed.

It includes a descriptive text to explain what the compute unit does, whether it shares resources, and a unique name to identify it. 

You can set a time-to-live (TTL) to automatically expire the compute unit after a certain duration. It also allows specifying dependencies on other compute units, ensuring tasks run in the correct order.

The `getComputeData` property defines how to retrieve the data the compute unit processes, and you can add middleware functions to modify or enhance the process. Finally, callbacks allow you to hook into different stages of the compute unit’s lifecycle.


## Interface IComputeParams

The `IComputeParams` interface provides the necessary tools and information for a compute task to execute within the agent swarm orchestration framework. Think of it as a package of essentials given to each agent. It includes a unique `clientId` to identify the agent, a `logger` for reporting and debugging, a `bus` for communication within the swarm, and `binding`—a list of state changes this agent is responsible for observing and reacting to. Essentially, it’s everything an agent needs to know to do its job and stay connected to the larger system.

## Interface IComputeMiddleware

This interface defines how individual components within the AI agent swarm can be pre-processed or modified before their results are combined. Think of it as a way to shape the data flowing between agents, potentially cleaning it, transforming it, or adding context.  Any class that implements `IComputeMiddleware` provides a `compute` method, which allows you to intercept and adjust the data coming from an agent before it's used for decision-making. It's designed for flexible adjustments and fine-tuning of the overall agent swarm's operation. By implementing this interface, you can inject custom logic to optimize the agent's performance or ensure data consistency.

## Interface IComputeConnectionService

This interface defines how your AI agents connect to and interact with external compute resources, like databases, APIs, or other services. Think of it as the bridge that allows your agents to actually *do* things in the world, not just think. It provides methods for establishing connections, executing commands, and retrieving results from these external systems, ensuring your agents can seamlessly access the information and tools they need to achieve their goals. The specific methods within this interface let you manage those connections, send requests, and get back the responses in a standardized way.

## Interface IComputeCallbacks

This interface lets you define functions that get called at different stages of a compute's lifecycle. Think of it as a way to be notified and react to what’s happening with a specific task being performed by an AI agent.

You can use `onInit` to set up things when a compute first starts, `onDispose` to clean up resources when it finishes, and `onCompute` to handle the actual data being processed. `onCalculate` signals a state calculation is needed, and `onUpdate` lets you know when a compute has been updated. Essentially, it’s a set of hooks to interact with and monitor the compute's behavior.

## Interface ICompute

The `ICompute` interface defines the core actions available for managing computational tasks within the agent swarm. Think of it as the set of tools you use to tell the system to actually *do* something. 

The `calculate` method instructs the system to perform a computation, identified by a `stateName`.  You’re essentially saying, “Hey swarm, please run this calculation.”

The `update` method is used to refresh information about a specific compute instance, linking it to a particular client and compute name. This helps keep track of which computation belongs to whom.

Finally, `getComputeData` allows you to retrieve the current data related to the computation, giving you insight into its status and results. The data returned will be of type `T`, which represents the structure of the compute data.

## Interface ICompletionSchema

This interface helps you set up how your AI agents generate responses or suggestions within the swarm. 

Think of it as a blueprint for a specific way to get completions – you give it a name, configure any special instructions (like flags for the underlying language model), and optionally add custom actions to take after a completion happens.

The `getCompletion` method is the core of this; it's what you call to actually request a suggestion or response, passing in any relevant information it needs to work.

## Interface ICompletionCallbacks

This interface lets you react to when an AI agent's task is finished. Specifically, it provides a way to run code after a completion is successfully created. You can use this to do things like record what happened, process the results, or kick off another action based on the completion. Think of it as a notification system for when a task is done. You provide a function that gets called with details about the task and its output.

## Interface ICompletionArgs

This interface defines the information needed when you ask the system to generate a response. Think of it as a package containing everything the AI agent needs to understand what you're asking and provide a helpful answer. 

It includes details like which client is making the request, the name of the agent involved, and the execution mode – whether the previous message came from a tool or directly from a user. 

Crucially, it contains the conversation history – the “messages” – so the AI has context. It also allows you to specify any available tools the agent might use to fulfill the request.

## Interface ICompletion

This interface defines how your AI agents can get responses from language models. Think of it as the standard way agents request and receive information. It builds upon a basic completion format, adding all the necessary pieces to make the process work smoothly, giving you a full set of tools to manage those responses.

## Interface IClientPerfomanceRecord

This interface describes the performance data collected for each individual client, like a user session or agent instance, as part of a larger process. It breaks down the overall process performance into smaller, manageable chunks tied to specific clients.

Each client's record includes things like its unique identifier (`clientId`), any data stored during its session (`sessionMemory` and `sessionState`), and detailed metrics about its executions – how many times it ran tasks (`executionCount`), how much data it processed (`executionInputTotal`, `executionOutputTotal`), and how long each execution took (`executionTimeTotal`, `executionTimeAverage`).  These properties help you understand how each client contributes to the overall system performance and identify any bottlenecks or inefficiencies related to specific clients.

## Interface IChatInstanceCallbacks

This interface defines a set of callbacks you can use to be notified about what’s happening with a chat instance within your agent swarm. You'll receive notifications when an instance is first set up (`onInit`), when it's finished and cleaned up (`onDispose`), and when a chat session actually starts (`onBeginChat`). You're also alerted whenever a message is sent from the chat instance (`onSendMessage`). Finally, `onCheckActivity` lets you know if an instance is still active and when it last performed an action. This allows you to monitor and react to the lifecycle and interactions of your AI agents.

## Interface IChatInstance

This interface represents a single chat session within your AI agent swarm. Think of it as a dedicated space where agents can communicate. 

The `beginChat` method starts a new conversation. To keep things running smoothly, `checkLastActivity` periodically verifies if the chat is still active.  If an agent needs to send a message, use `sendMessage`, which returns the response. When you're done with a chat, `dispose` cleans up the resources. Finally, `listenDispose` allows you to be notified when a chat session is being closed.

## Interface IChatControl

This interface, `IChatControl`, lets you configure how your AI agent swarm interacts with chat systems. Think of it as a way to plug in different chat technologies or customize the way messages are handled. 

You can use `useChatAdapter` to specify which chat system your agents will use – essentially telling the framework which "language" your agents speak.  Then, `useChatCallbacks` lets you fine-tune the behavior, allowing you to react to specific events within the chat process, such as when a message is received or sent.

## Interface IChatArgs

The `IChatArgs` interface defines the data needed to initiate a chat interaction with an agent within the system. Think of it as a standardized way to pass information about a conversation. It requires a unique `clientId` to identify where the chat is coming from, a specific `agentName` to direct the chat to the correct agent, and the actual `message` content that you want the agent to process. This helps ensure consistent and reliable communication between clients and the agent swarm.

## Interface IBusEventContext

This interface helps give events extra information about what’s happening in the system. Think of it as a way to add details to events so you know which agent, swarm, storage, state, compute, or policy is involved. When an agent is sending an event, it will usually just include the agent's name. Other parts of the system might use this to add details about swarms, storage, states, computes, or policies when an event occurs. It's like adding labels to events to make them more informative.

## Interface IBusEvent

This interface describes a standardized way for different parts of the system to communicate, especially within agents. Think of it as a structured message that agents can send to each other to share information about what they're doing, the results they’re seeing, or changes in state.

Each message includes information about where it's coming from (identified as "agent-bus" for agent communication), what kind of action it represents (like "run" or "commit-user-message"), and any relevant data being passed along. This data is split into input (what triggered the event) and output (the result of the action).  Finally, there’s a context section which usually tells us which agent is sending the message.  This consistent format helps the system reliably understand and react to events happening within the agent swarm.

## Interface IBus

The `IBus` interface acts as a central communication channel within the swarm system, enabling agents to share information with specific clients. Think of it as a way for agents to broadcast updates and results, like notifying a client when a message is processed or a tool completes its work. 

The core functionality is the `emit` method. This method allows agents to send structured events to a designated client, ensuring that information is delivered precisely where it's needed.  Each event follows a standard format and includes details like the event type, the agent that sent it, any relevant input or output data, and the target client ID.  

This system uses asynchronous delivery, so the `emit` method returns a promise, indicating the event is queued for delivery. The client ID is repeated within the event itself, providing an extra layer of clarity and validation.  Essentially, it’s a well-defined and type-safe way for agents to keep clients informed about what’s happening in the swarm.

## Interface IBaseEvent

This interface lays out the basic structure for any event happening within the system, like an agent sending a message or a session updating. Every event will have a `source` indicating where it came from – whether it's a custom component or a specific agent bus.  Every event also includes a `clientId` to ensure it reaches the right client or agent instance, acting like an address for the message. Think of it as the foundation upon which more detailed event types are built.

## Interface IAgentToolCallbacks

This interface provides a way to connect to and observe the lifecycle of individual tools used by your AI agents. Think of it as a set of hooks you can use to plug in custom logic at different points – before a tool runs, after it finishes, when you need to check if the tool's inputs are valid, or when something goes wrong.

You can use `onBeforeCall` to prepare before a tool is run, for example to log what’s happening or adjust parameters. `onAfterCall` lets you perform actions after the tool completes, such as saving results or cleaning up resources.  `onValidate` allows you to define your own rules to make sure the inputs to a tool are correct before it even starts. And finally, `onCallError` helps you to handle and log any errors that might occur during the tool's execution.

## Interface IAgentTool

This interface describes a tool that an agent in the swarm can use. Each tool has a name to identify it and a description that helps users understand how to use it.

Before a tool is used, a validation step checks if the provided parameters are correct. This check can happen quickly or might require some more complex processing.

You can also add callbacks to customize how the tool behaves at different stages of its lifecycle. 

The tool’s functionality itself is defined through a `function` property, which might provide metadata about the function or directly define the function’s execution logic. 

Finally, the `call` method is used to actually run the tool, providing it with the necessary information about the client, agent, and context.

## Interface IAgentSchemaInternalCallbacks

This interface provides a way to hook into different stages of an agent's lifecycle, allowing you to react to what the agent is doing. You can define functions to be called when the agent starts running, when it uses a tool, when it generates a system message, or when its memory is cleared. These callbacks provide opportunities to log events, monitor progress, or modify the agent’s behavior as it operates. Essentially, it’s a way to customize and observe an agent’s activity at key moments, from its initial setup to when it’s finished running.


## Interface IAgentSchemaInternal

This interface defines how an agent is configured within the system. It outlines the agent's name, the prompt it uses, and the tools and data sources it has access to. You can provide a description for documentation purposes, limit the number of tool calls or messages to manage context, and even set up dynamic system prompts that change based on the client or agent.

The configuration also allows for defining connections to operator dashboards, validating the agent's responses, transforming outputs, and customizing message mapping. Finally, you can specify dependencies on other agents within the swarm and register lifecycle callbacks for finer control over the agent's behavior.

## Interface IAgentSchemaCallbacks

This interface lets you tap into the key moments of an agent's lifecycle. Think of it as a way to listen in on what's happening as the agent works – whether it's starting up, processing requests, generating output, or recovering from interruptions.

You can register functions to be notified when an agent begins running, when it requests tools, when it generates system messages, or when it completes a sequence of tool calls. There are also callbacks for specific events like when an agent is initialized, when its history is cleared, or when it's fully shut down. It's a flexible way to monitor and potentially influence the agent’s behavior without directly modifying its core logic.

## Interface IAgentSchema

This interface, `IAgentSchema`, defines the structure for configuring an agent within the orchestration framework. It focuses on providing the agent with initial instructions and context.

You can set a static `system` prompt, or an array of prompts, to guide the agent's behavior – think of this as the agent's foundational instructions.  `systemStatic` is simply another way to specify the same thing. 

For more personalized or changing instructions, you can use `systemDynamic`. This allows you to generate prompts based on the agent's client ID and name, making it possible to tailor instructions for specific situations. The prompt generation is handled by a function that can return either a single string or an array of strings.

## Interface IAgentParams

This interface defines the information passed to each agent when it runs. Think of it as a set of instructions and resources the agent needs to do its job.

It includes things like a unique identifier for who’s using the agent (clientId), a way to record what the agent is doing (logger), a system for communicating with other agents (bus), and access to external tools (mcp). 

Agents also get a memory of past interactions (history) and a way to create final responses (completion). 

You can optionally provide tools for the agent to use, and even a way to check if the agent’s output is correct before it's finalized (validate).

## Interface IAgentNavigationParams

This interface defines how to set up navigation instructions for your AI agents. It lets you specify the tool's name and a description of what it does, along with the agent you want it to navigate to. You can also add a helpful note for documentation and, if needed, tell the system to skip certain outputs when multiple navigation options are available. Essentially, it's a way to clearly communicate where an agent should go and what it's supposed to do once it gets there.

## Interface IAgentConnectionService

This interface helps define how different agents connect and communicate within the system. Think of it as a blueprint for creating reliable connections between agents. It’s designed to clearly outline the public-facing capabilities related to agent connections, leaving out the internal workings. By using this interface, we ensure that services interacting with the agent swarm have a consistent and predictable way to manage agent connections.

## Interface IAgent

The `IAgent` interface describes how an AI agent behaves and interacts during its operation. It defines core actions like running the agent for quick tests without affecting its memory, or executing it fully to update its history.

You can use methods like `run` for one-off tasks, while `execute` handles the agent's regular processing.  `waitForOutput` lets you specifically wait for the agent to finish its work.

The interface also includes ways to manage the agent’s context, allowing you to add messages – whether system instructions, user prompts, or tool responses – and clear its memory when needed. You can even control the flow of tool calls, stopping them or canceling ongoing operations. These methods give you fine-grained control over the agent’s lifecycle and behavior.
