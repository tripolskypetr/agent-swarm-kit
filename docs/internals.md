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

This function checks everything – your swarms, agents, and outlines – to make sure they're set up correctly. It's designed to be safe to run repeatedly; it only runs the validation process once each time you execute it. Think of it as a quick health check for your entire system.

## Function startPipeline

This function lets you kick off a pre-defined workflow, or "pipeline," within the agent swarm. Think of it as telling the system, "Hey, I want this specific sequence of tasks to run, using this particular agent, and here's some information to get it started." You provide a unique client identifier, the name of the pipeline you want to execute, the agent responsible for the work, and optionally, a data payload to feed into the process. The function returns a promise that will eventually resolve with a result related to the pipeline’s execution. 

Essentially, it's the primary way to tell the system to start a chain of AI agents working together to accomplish a larger goal.


## Function scope

This function lets you run a piece of code – like a task for an AI agent – within a controlled environment. Think of it as creating a little sandbox where your code operates. You provide the code itself, which can be a function that might return a value or simply perform an action. 

You can also customize this sandbox by providing extra settings. These settings allow you to adjust how the AI agents, text generation, or processing pipelines behave during the code’s execution. This gives you fine-grained control over the overall workflow. The function takes care of managing the setup and cleanup of this specialized environment for you.

## Function runStatelessForce

This function lets you send a message to your AI agent swarm without adding it to the ongoing conversation history. Think of it as a way to quickly execute a task or store data without impacting the agent’s memory. Importantly, it *always* executes the message, even if the agent isn't currently active – it’s a forceful execution. 

You provide the message content and a unique client identifier to specify the session. The system will handle validating the session, running the message, and keeping track of performance while ensuring a clean execution environment.

## Function runStateless

This function lets you run a single message to an agent in your swarm without keeping a record of it in the chat history. Think of it as a quick, one-off task for the agent, useful for things like processing data or handling storage outputs where you don’t want the interaction to impact the ongoing conversation.

It ensures the agent you're targeting is still available and performs the action while keeping track of performance and notifying the system. Because it’s stateless, the agent won't remember any prior interactions.

You’re providing the message content, a unique identifier for the client using the service, and the name of the agent you want to use.

## Function overrideTool

This function lets you change how a tool works within the AI agent swarm. Think of it as updating a tool's instructions or capabilities. You provide a new set of instructions (the `toolSchema`), and the system applies those changes to the existing tool. This update happens independently, ensuring a clean and isolated process. The system will also record this change if you’ve enabled logging.


## Function overrideSwarm

This function lets you directly change the setup of a swarm within the system. Think of it as a way to quickly adjust a swarm’s configuration – you can provide a whole new schema or just update specific parts of an existing one. It works independently, ensuring a clean update process, and will record the change if logging is turned on. You give it a schema definition, and it applies those settings to the target swarm.

## Function overrideStorage

This function lets you modify how data is stored within the AI agent swarm. Think of it as updating a blueprint for a specific storage location. You can provide a new or partial schema, and it will apply those changes to the existing storage configuration. The process is carefully isolated to prevent conflicts, and it logs the action for tracking purposes. Essentially, it's a tool for adjusting the storage setup as needed. 

The function accepts a partial storage schema as input, allowing you to selectively update properties.

## Function overrideState

This function lets you change the structure of the data your agents use to share information. Think of it as updating a blueprint – you can modify it to reflect new requirements or fix any mistakes. It applies those changes directly to the swarm's state configuration, making sure everything stays consistent. The update happens in a controlled environment, keeping things isolated and predictable. If your system is set up to log activity, this override will be recorded. You provide a partial schema, containing only the changes you want to make.

## Function overridePolicy

This function lets you change a policy's settings within the swarm system. Think of it as updating a rule – you provide a new definition or just parts of a definition, and this function applies those changes.  It’s designed to work independently, ensuring a controlled and isolated update process. If your system is set up to record these actions, it will also log the policy override. You simply give it the new policy definition, and it handles the rest.

## Function overridePipeline

This function lets you tweak an existing pipeline definition—think of it as making targeted adjustments rather than completely rebuilding it. You provide a partial update to the pipeline schema, and it merges those changes into the original. This is helpful when you want to modify specific parts of a pipeline without affecting the rest of its configuration. The function returns the modified pipeline schema.

## Function overrideOutline

This function lets you modify an outline schema that's already in use by the swarm system. Think of it as updating a blueprint for how tasks are organized.  It carefully applies your changes in a controlled environment to prevent any unexpected clashes with other processes.  If logging is turned on, the system will record this update for tracking purposes. You provide a partial schema containing the changes you want to make, and the function merges those changes into the existing outline configuration.

## Function overrideMCP

This function lets you modify an existing Model Context Protocol (MCP) definition, which is like a blueprint for how AI agents share information. You can provide a new schema, or just parts of one, and this function will combine it with the existing MCP. Think of it as updating a recipe – you might change one ingredient or the whole process. The input you give is the definition of the MCP you want to override.

## Function overrideEmbeding

This function lets you adjust how your AI agents understand and process information by changing their embedding schemas. Think of an embedding schema as the set of rules and structures used to represent data as numerical vectors. You can use this function to completely replace an existing schema or just update parts of it. This change happens independently, ensuring it doesn't interfere with what other agents are doing, and it records the change if logging is turned on. The schema you provide defines the new or modified embedding configuration.

## Function overrideCompute

This function lets you modify existing compute configurations, allowing you to tailor them to specific situations. Think of it as a way to fine-tune how your AI agents perform calculations and processes. You provide a partial configuration—just the parts you want to change—and it merges those updates into the original, complete configuration. It’s helpful when you need to adjust parameters or settings without rebuilding the entire compute schema from scratch.

## Function overrideCompletion

This function lets you change how the swarm generates responses. It allows you to update an existing completion schema, essentially tweaking the instructions given to the AI. Think of it as modifying the underlying rules for generating text. The change is applied directly and independently, ensuring it doesn't interfere with other running processes. If your system is configured to log actions, this override will be recorded. You provide a new schema definition to specify the desired changes.

## Function overrideAgent

This function lets you directly update an agent's configuration within the swarm. Think of it as a way to make changes to an agent’s blueprint, applying new settings or modifying existing ones. It works independently of any ongoing processes, ensuring a clear and isolated update. The system will record this change if you’re using logging. You provide the new or modified schema definition as input.

## Function overrideAdvisor

This function lets you update the settings for a specific advisor within the swarm. Think of it as modifying an advisor's instructions – you can change parts of its configuration without affecting everything else. 

You provide a new schema, which must include the advisor’s name, and any other properties you want to change. The existing advisor settings will be updated with your provided information, leaving any unchanged settings as they were. This update happens independently, ensuring a controlled and isolated change. If the system is set up to log activity, the override will be recorded.

## Function notifyForce

This function lets you send a message out from a swarm session without actually triggering any processing of a standard incoming message. Think of it as a direct way to broadcast information. It's specifically intended for sessions created using the "makeConnection" setup.

Before sending, the system checks to make sure the session and the targeted agent are still working correctly. It will even work if the agent has been replaced during the session. 

The message is sent in a fresh environment to keep things clean, and the system keeps a log of the action if logging is enabled. Attempting to use this function with a session that wasn't established using "makeConnection" will result in an error. 

You provide the message content and a unique ID for the client session as input.

## Function notify

This function lets you send a message out from your AI agent swarm without triggering any of the usual processing steps. Think of it as a way to directly communicate something to a connected client. 

It's specifically intended for sessions set up using the "makeConnection" method, and it verifies that the agent you're sending to is still available before delivering the message. The function creates a fresh environment for the message, logs the action if logging is turned on, and will stop if the connection isn't using the correct setup.

You provide the message content, a unique identifier for the client it's going to, and the name of the agent you want associated with the notification.

## Function markOnline

This function lets you tell the system that a particular client is now active and participating in a specific swarm. Think of it as registering a client's presence within a group of agents. You’ll need to provide a unique ID for the client and the name of the swarm you want to update. It's a simple way to keep track of which clients are currently online and contributing to the swarm's work.

## Function markOffline

This function lets you tell the system that a specific client has become unavailable within a particular swarm. It’s useful for managing the status of your AI agents and ensuring the system knows when an agent is no longer participating. You're essentially signaling that a client, identified by its unique ID, is offline in the swarm you specify. This helps the orchestration framework re-route tasks and maintain the swarm's health.


## Function listenEventOnce

This function lets you temporarily listen for specific events happening within your AI agent swarm. Think of it as setting up a brief, one-time alert for a particular message. 

You tell it which client or all clients to listen to, the name of the message topic you're interested in, and a filter to ensure you only receive the events you need. When a matching event arrives, a callback function will be executed with the event's details. 

Importantly, this listener only triggers once and then automatically disappears, and you can even stop it early if necessary using the function it returns. It helps you react to important events without creating ongoing listeners.

## Function listenEvent

This function lets you tune into events happening within your AI agent swarm. Think of it as setting up an ear to listen for specific messages being sent around. You tell it which client or all clients you want to hear from, and what kind of message – its topic – you're interested in. 

Whenever a matching message arrives, a function you provide will be automatically executed, letting you react to the information. To stop listening at any time, the function returns a handy unsubscribe function you can call. It's designed to keep things orderly, processing events one at a time and preventing you from using reserved names for topics.

## Function json

This function lets you request data structured according to a predefined outline, and it will return that data in JSON format. Think of it as asking for a specific report or dataset based on a template you’ve already defined. 

It’s designed to keep things running cleanly by isolating each request, preventing interference between different data generation processes. You provide the name of the outline you want to use and, optionally, some parameters to customize the generated data. The function then promises to return a structured JSON result based on your request.

## Function hasSession

This function helps you quickly determine if an active session exists for a specific client. It checks if a client is currently connected or has an ongoing session within the system. 

Essentially, it verifies whether a session is valid for the provided client ID. 

Behind the scenes, it uses the session validation service to perform this check and will also log the function call if logging is turned on. You’ll need to provide the unique ID of the client you're checking.

## Function hasNavigation

This function helps you determine if a particular agent is involved in guiding a client through a process. It checks if the agent is on the planned route for that client’s journey. 

Behind the scenes, it verifies that both the client and the agent are valid, finds the relevant group of agents (the swarm), and then looks at the navigation route to see if the agent is listed. 

You can use it to understand which agents are currently active in a client's workflow.

It takes two pieces of information: a unique ID for the client and the name of the agent you want to check.


## Function getUserHistory

This function lets you pull up a user's interaction history for a specific session. It goes and gets all the raw history data for that session, then carefully filters it to only show the messages where the user was actively participating. Think of it as a way to see exactly what a user typed and how they engaged within a particular conversation or workflow. You’ll need to provide the unique identifier for the client session to get the history. The result is a list of messages representing the user's contributions.

## Function getToolNameForModel

This function helps you determine the specific name a language model should use for a tool, ensuring consistent communication within your AI agent swarm. It takes the tool’s name, a client identifier, and the agent's name as input. Think of it as a translator, converting a generic tool name into something tailored to a specific agent's understanding and configuration. It’s the primary way other parts of your system can interact with this functionality.

## Function getTool

This function helps you find the blueprint for a specific tool within your AI agent swarm. Think of it like looking up a recipe – you give it the tool's name, and it returns the detailed information about how that tool works, including the types of data it expects and produces. The system keeps track of these requests if logging is turned on, so you can monitor which tools are being accessed. You simply provide the tool’s name, and the function will fetch and return its schema.

## Function getSwarm

This function lets you fetch the configuration details of a specific AI agent swarm. Think of it as looking up the blueprint for how a group of agents is organized and works together. You simply provide the name of the swarm you're interested in, and the function returns a detailed schema describing its setup. If your system is configured for logging, this action will also be recorded for tracking purposes.

## Function getStorage

This function lets you fetch the details of a specific storage location within your AI agent swarm. Think of it as looking up the blueprint for how a particular storage area is set up. You provide the name of the storage you're interested in, and the function returns all the information about it, including its structure and what kind of data it holds.  If your swarm is configured to log activity, this retrieval will be recorded. You simply need to provide the name of the storage you want to inspect.

## Function getState

This function lets you access a specific state definition within the AI agent swarm. Think of it as looking up the blueprint for a particular state. You provide the state's name, and it returns the detailed structure – the schema – that describes what data that state holds and how it's organized. The system also keeps track of these requests if logging is turned on.

## Function getSessionMode

This function lets you check the current operating mode of a client’s session within the AI agent swarm. You provide the unique ID of the client session, and it tells you whether the session is in "session," "makeConnection," or "complete" mode. 

It handles confirming the session exists and keeps a record of the request if logging is active. The process is designed to run independently to avoid interference from other ongoing activities. 

The `clientId` is the only thing you need to provide – it’s how you identify which session you want to check.

## Function getSessionContext

This function lets you access the current session's information, like who's using the system and what resources are available. Think of it as getting a snapshot of the current environment for the AI agents. It gathers details such as the client and process IDs, and the available methods and execution contexts. The function automatically figures out the client ID based on the current setup, so you don’t need to provide it. It also keeps track of activity by logging if that’s enabled.

## Function getRawHistory

This function lets you access the complete, unfiltered history of messages for a specific client's agent within the swarm. Think of it as getting the raw data directly from the system – no summaries or alterations. 

You provide a unique ID for the client session, and the function returns an array containing all the messages associated with that session. It's a way to peek behind the curtain and see exactly what's been communicated. 

The function ensures everything runs cleanly and keeps track of what’s happening, if logging is enabled. Essentially, it gives you a fresh copy of the raw message history.

## Function getPolicy

This function lets you fetch a specific policy's definition from the system. Think of it as looking up the instructions for how a particular task or behavior should be handled within the agent swarm. You provide the policy's name, and it returns the detailed schema that describes that policy. The system will also record that you requested this policy if logging is turned on.

## Function getPipeline

This function lets you fetch a pipeline's blueprint – its schema – by providing its name. Think of it as looking up a recipe by its title. It’s how you get the definition of a workflow you want to use within your agent swarm. The function will also record that it retrieved the pipeline if you’ve set up logging in your system. You simply provide the pipeline's name to get its complete structure.

## Function getPayload

This function lets you access the data currently being handled by the system, like a message or a set of instructions. It's a way to peek at what the agents are working with. If there's no data actively being processed, it will return nothing. The system keeps track of when you use this function if tracking is turned on.

## Function getNavigationRoute

This function helps you find the path a client has taken through an AI agent swarm. It essentially tells you which agents a client has interacted with, represented as a list of agent names. To use it, you need to provide the unique identifier for the client and the name of the swarm you're interested in. It then figures out the navigation route by consulting the navigation validation service and optionally logs the process based on system settings.

## Function getMCP

This function lets you fetch the blueprint, or schema, for a specific Model Context Protocol (MCP) from your AI agent swarm. Think of an MCP as a defined way for agents to communicate and share information.  You provide the name of the MCP you want, and the function returns its complete definition.  The system also keeps a record of this request if logging is turned on. You simply provide the name of the MCP you're looking for, and it's returned to you.

## Function getLastUserMessage

This function helps you get the last thing a user typed during a conversation. You give it a unique identifier for the conversation – like a session ID – and it finds and returns the content of that last user message. If the user hasn't sent any messages yet, it will return nothing. It's designed to pull the history securely and keep things running smoothly behind the scenes.

## Function getLastSystemMessage

This function lets you access the most recent message sent by the system within a specific client's ongoing session. Think of it as retrieving the last instruction or update given to the AI agents for a particular client. It digs into the session history to find the last message tagged as being from the "system" role. If no system messages have been sent, it will return nothing. You identify the client you’re interested in by providing a unique identifier for their session.

## Function getLastAssistantMessage

This function helps you get the last message sent by the AI assistant for a particular client. It digs into the client's conversation history and pulls out the content of the most recent assistant response. If the client hasn't received any messages from the assistant yet, it will return nothing. You just need to provide the unique ID for the client’s session to use it.

## Function getEmbeding

This function lets you fetch the details of a specific embedding that your AI agent swarm is using. Think of it as looking up the blueprint for how an embedding works – its structure and properties. You provide the name of the embedding you're interested in, and the function returns all the information associated with it. The system will also keep a record of this lookup if logging is turned on.

## Function getCompute

This function lets you fetch the configuration details for a specific compute within your AI agent swarm. Think of it as looking up the blueprint for a particular processing unit. You provide the name of the compute you want to know about, and it returns a structured data object containing all its settings. If your system is set up to record activity, this function will also log that you requested the compute’s information.



It’s a straightforward way to access and verify the configuration of individual compute units in your swarm.

## Function getCompletion

This function lets you fetch a specific completion definition, which acts like a blueprint for how an AI agent should respond, using its given name. Think of it as requesting a pre-defined response template from the system. The system will record this request if you’ve configured it to do so. You only need to provide the name of the completion you want to retrieve.

## Function getCheckBusy

This function lets you quickly see if an AI agent swarm is currently occupied with a task. You provide a unique client ID – think of it as a session key – and the function will tell you, with a simple true or false, whether the swarm associated with that ID is actively working. This is useful for preventing new tasks from being assigned when the swarm is already at capacity. 



It returns a promise that resolves to a boolean value.

## Function getAssistantHistory

This function lets you peek into what your AI assistant has been saying during a specific client's session. It pulls all the history and then filters it down to show only the assistant's messages. Think of it as a log of the assistant's contributions to the conversation, useful for reviewing past interactions or debugging. You'll need to provide a unique ID to identify which client's history you want to view. The function aims to keep things tidy and efficient, ensuring a controlled environment for retrieving and presenting the information.

## Function getAgentName

This function helps you find the name of the agent currently working on a specific client's session within your AI agent swarm. You give it a unique ID for the client, and it returns the agent's name. 

It handles the behind-the-scenes work of verifying the client session and communicating with the swarm's services to get the name. It’s designed to run independently, ensuring a reliable and isolated process. The `clientId` is all you need to provide – that's the key to identifying which client's agent you’re looking for.

## Function getAgentHistory

This function lets you see the past interactions and decisions made by a specific agent within your AI swarm. It’s like looking at an agent's memory, but with any rescue algorithms applied to improve the results. 

You provide the unique identifier for your client session and the name of the agent you're interested in, and the function returns a list of messages reflecting the agent's history. This process includes verifying the agent's validity and logging the action for monitoring. It’s designed to run in a clean environment, isolated from existing processes, ensuring accurate and reliable history retrieval.

## Function getAgent

This function lets you find an agent’s blueprint within your AI agent swarm. Think of it as looking up an agent’s definition by its unique name. It’s how you access the details and configuration of a specific agent. The function retrieves this agent schema from the swarm's central registry, and will record the retrieval if you’ve configured logging. You simply provide the name of the agent you’re interested in to get its schema.

## Function getAdvisor

This function helps you get information about a specific advisor within your AI agent swarm. Think of an advisor as a specialized helper for your agents – this function lets you retrieve details about that helper, like what it’s designed to do. You simply provide the name of the advisor you’re interested in, and the function will return its schema. If your system is configured to log activities, this action will be recorded for tracking and debugging purposes.

## Function fork

This function lets you run a piece of code—specifically, a function you provide—within a carefully managed environment. Think of it as launching a task for an AI agent, ensuring everything needed for that task is set up correctly and cleaned up afterward.  You give it a function to execute, which will be called with information about the agent's ID and name.  You also provide configuration details, like the agent's client ID and the name of the swarm it belongs to, allowing fine-grained control over the operation. The function returns a promise that resolves with the result of your provided function.

## Function executeForce

This function lets you send a message or command directly to an agent within a swarm, as if it came from the client. It's useful for things like checking an agent's output or triggering a conversation back to the client application. Unlike other methods, it guarantees the message will be processed, even if the agent isn't currently active or has been replaced. 

You provide the message content and a unique identifier for the client session. The system then takes care of validating the session, running the content, and keeping track of performance and relevant events. Think of it as a way to ensure your requests always get through, regardless of the agent’s current status.


## Function execute

This function lets you send messages or commands to a specific agent participating in a coordinated group of AI agents, acting as if the request came directly from a user. Think of it as a way to trigger actions or review output from a particular agent within a larger workflow. 

It ensures the agent is still part of the active group and runs your request in a controlled environment, keeping track of performance and notifying other components. You provide the message itself, a unique identifier for the user session, and the name of the agent you want to target. This is useful for tasks like reviewing an agent's work or starting a conversation between an agent and the user interface.

## Function event

This function lets your AI agents talk to each other within the swarm. Think of it as sending a message – you specify a unique topic (like "agent-status-update") and a client ID to identify the sender. You can attach any data you need to the message, and the swarm’s bus service will handle distributing it to interested listeners. 

The system prevents you from using certain topic names that are reserved for internal use.  Each message is carefully packaged and logged to ensure proper communication and tracking within the swarm. Essentially, it's the primary way agents share information and coordinate actions.

## Function emitForce

This function lets you directly send a string as output from the AI agent swarm, like broadcasting a message without triggering any normal processing steps. 

It’s specifically for sessions created using `makeConnection` and ensures everything works smoothly within that connection type. 

Think of it as a shortcut to push data out – it sets up a fresh environment, verifies the session and swarm are valid, and won't work if the session wasn't established using `makeConnection`. You provide the content you want to send and a unique identifier for the client session.

## Function emit

This function lets you send a message as output from an agent, essentially simulating an agent’s response without processing a full incoming message. It's specifically for sessions created using `makeConnection`.

Before sending the message, it double-checks that the agent is still active and part of a valid swarm session. It ensures the agent hasn't been replaced, and that the session is properly set up.

You provide the message content, the client ID, and the agent's name to use. The function handles the behind-the-scenes work of validating everything and logging the action, making sure it all runs cleanly.

## Function commitUserMessageForce

This function lets you directly add a user's message to an agent's record within a swarm session. Think of it as a way to manually update the conversation history. It's a forceful action, meaning it doesn't verify if the agent is still available and proceeds regardless.

It handles the necessary checks behind the scenes to make sure the session and swarm are valid, and keeps a record of what's happening. You can also provide extra data with a `payload` object. This function ensures the operation happens in a clean environment, separate from other processes.


## Function commitUserMessage

This function lets you add user messages to an agent's record within a swarm session, essentially documenting the interaction without causing the agent to immediately respond. It's useful for keeping a clear history of conversations.

You provide the message content, the execution mode, a client identifier, and the agent's name to identify where the message should be added. Optionally, you can include additional data through a payload object.

The system checks that the agent and session are still active, logs the action if logging is enabled, and securely transmits the message to the swarm session. It makes sure this process runs cleanly, separate from any ongoing agent actions.

## Function commitToolRequestForce

This function lets you push tool requests directly to an agent in the swarm, even if some usual checks aren't done. It's designed for situations where you need to ensure a request goes through, bypassing standard agent validation. 

Think of it as a way to force an action – it takes a list of tool requests and a client ID and sends them to the agent.  The function also handles the necessary setup for running the request and keeps track of what's happening with logging. 

Essentially, it's a shortcut for committing requests, but use it with care as it skips some safety checks.


## Function commitToolRequest

This function sends a request for a tool to be used by a specific agent within the swarm. Think of it as telling the system, "Hey, agent [agentName], please run this tool request [request] for client [clientId]." Before sending the request, it double-checks that the agent is valid and that the system is set up correctly. It’s designed to be a reliable way to manage and track tool requests as they are processed. The function returns an array of strings, likely representing some kind of confirmation or status related to the submitted requests.

## Function commitToolOutputForce

This function lets you directly push the results from a tool back to the agent managing the swarm, even if you're unsure if that agent is still actively participating. It's a way to ensure the tool's output is recorded, acting like a shortcut that skips some checks for agent availability. 

Essentially, it takes the tool's ID, the content of its output, and a client identifier, and then handles the process of saving that output. This process includes ensuring the system is ready, keeping a log if logging is turned on, and passing the commit action to the session's public service. It guarantees a fresh execution environment, independent of any existing processes.


## Function commitToolOutput

This function helps record what a tool has produced during an agent's work within a swarm. It's like telling the system, "Agent X just finished using Tool Y and here’s the result." 

It makes sure the agent is still considered the 'active' one before recording the output, ensuring things stay consistent. The function does some behind-the-scenes checks and logging, and then passes the output to the system for proper storage. 

You need to provide the tool's ID, the output content, the client session ID, and the agent's name to use this function.

## Function commitSystemMessageForce

This function allows you to directly add a system message to a conversation, bypassing normal checks about which agent is currently active. It's a forceful way to ensure a specific message gets into the session, useful in situations where you need to override the standard process.

Essentially, it makes sure the session and swarm are valid, then immediately commits the message you provide.

You’ll need to provide the message content and a unique identifier for the client session. It’s like a “hard commit” for system messages, similar to how `commitAssistantMessageForce` works compared to `commitAssistantMessage`.

## Function commitSystemMessage

This function lets you send special messages directly to an agent within your AI agent swarm. These messages aren't typical responses; they’re used for things like configuration updates or to give the agent specific instructions.

It carefully checks that the agent, session, and overall swarm are all valid before sending the message, ensuring everything is working correctly. It also keeps track of what’s happening by logging the process. 

You provide the message content, a unique identifier for the client session, and the name of the agent you’re targeting. Think of it as a direct line of communication to control or update your agents.

## Function commitStopToolsForce

This function lets you immediately halt the execution of tools for a particular client, even if an agent is currently active. It's a more forceful way to stop tool processing than the standard stop mechanism.

Think of it as an emergency stop button – it skips checks to ensure the client session and swarm are valid before stopping the tools.

The `clientId` parameter tells the system which client's tool execution to interrupt. 

This function is designed for situations where a quick and unconditional stop is needed, similar to a forced flush operation.


## Function commitStopTools

This function pauses the execution of tools for a particular agent within a client's session. Think of it as a temporary stop sign for a specific agent's actions.

It carefully checks that the agent you're targeting actually exists and is the right one for the session before pausing its tool usage.

The process is managed carefully, ensuring proper context and logging. Unlike functions that clear the agent's history, this one simply puts a hold on future tool executions. 

You’ll need to provide the unique identifier for the client session and the name of the agent you want to stop.

## Function commitFlushForce

This function provides a way to aggressively clear the history of an agent's interactions for a particular user. It's like a forceful reset of the conversation record.

It bypasses standard checks, ensuring the history is cleared even if there are unexpected circumstances or issues with the current active agent.

You'll need to specify the unique identifier for the user's session to initiate the clear.

Think of it as a tool for troubleshooting or situations where a complete history reset is needed, similar to how `commitAssistantMessageForce` works compared to `commitAssistantMessage`.


## Function commitFlush

This function helps clean up an agent’s memory within the swarm system. It essentially clears the agent’s history, allowing it to start fresh.

You specify which client and agent you want to clear the history for using the `clientId` and `agentName` parameters.

Before clearing anything, the system double-checks that everything is valid—the agent, session, and swarm—to make sure you're clearing the correct agent's history. It’s a way to ensure data integrity and prevent accidental history wipes.

Think of this as a complementary action to adding messages; instead of adding more to the history, it erases what's already there. The whole process is carefully managed and logged for tracking and debugging purposes.

## Function commitDeveloperMessageForce

This function lets you directly push a message from a developer into a session within the AI agent swarm, bypassing the usual checks for an active agent. It’s like a direct line for developers to inject information into a session when needed.

It makes sure the session and swarm are valid before adding the message, and uses several internal services to handle the process – including ensuring the session exists, validating the swarm, actually sending the message, and keeping a log of what happened.

Think of it as a more forceful version of a standard message commit function, allowing you to override the normal agent-driven flow. You’re providing the `content` of the message and the `clientId` to identify the session it belongs to.

## Function commitDeveloperMessage

This function lets you send messages directly to a specific agent within the AI agent swarm. Think of it as a way to give instructions or provide feedback to an agent, rather than having it generated automatically. 

Before sending the message, the system makes sure everything is set up correctly – checking the agent, the user's session, and the overall swarm. It uses several internal services to validate and manage this process, keeping track of everything with detailed logging. This function is designed for messages coming from developers or users, distinct from the automated responses generated by the system or the agents themselves.

You’ll need to provide the actual message content, a unique identifier for the user’s session (clientId), and the name of the agent you’d like to send the message to.

## Function commitAssistantMessageForce

This function lets you directly push a message from an assistant into a session within the swarm, even if an agent isn't actively handling it. It’s a shortcut for situations where you need to ensure a message is recorded, bypassing the usual checks for an active agent.

Think of it as a "force commit"—it validates that the session and swarm are in good shape, then adds the message without waiting for agent confirmation. 

You'll provide the message content and a unique identifier for the client session. Behind the scenes, it works with several services to manage the session, validate the swarm, add the message, and keep a record of everything. It's similar to the "cancel output force" function, offering a way to override the standard process when needed.

## Function commitAssistantMessage

This function lets you send a message generated by an AI assistant to a specific agent within the swarm. It carefully checks to make sure the agent you're sending the message to is valid and part of the current session, preventing errors. Behind the scenes, it handles logging and manages the execution context, ensuring everything runs smoothly. Think of it as a way to reliably pass information from the assistant to the agent, similar to how `cancelOutput` stops an action, this function saves the assistant’s work.

You’re providing the message content, a unique ID for the client using the system, and the name of the agent that should receive the message.

## Function chat

This function lets you send messages to a particular AI chat service and get a response. Think of it as the main way to interact with your AI agents. 

You specify which AI service you want to use by providing its name. Then, you give it the conversation history as a list of messages. The function handles the behind-the-scenes work to ensure each request is processed securely and independently.

## Function changeToPrevAgent

This function allows you to switch back to a previous agent that a client has been using, or to the default agent if there isn't a previous one. It’s designed to manage the agent selection process within a group of agents working together (a swarm). 

Essentially, it's a way to reverse the agent selection and is especially useful if you need to quickly go back to an earlier configuration or agent.

The function requires a unique identifier for the client session to ensure the change is applied correctly. It's handled in a way that makes sure it runs independently and with some safety measures in place.

## Function changeToDefaultAgent

This function allows you to easily switch a client back to the swarm's standard, default agent. Think of it as a reset button for a client's agent selection. It takes a client identifier to specify which session to revert. The system carefully checks everything is valid and records the change for auditing if you've enabled that. It handles the switch safely and reliably, ensuring a smooth transition.

## Function changeToAgent

This function lets you switch which AI agent is handling a client’s session within your swarm. Think of it as assigning a different specialist to a specific client. It verifies that the switch is valid and safe, and keeps a record of the change if you’re tracking those activities. To make sure everything happens smoothly and doesn’t interfere with ongoing processes, the change is executed in a carefully managed way. You provide the name of the new agent and a unique ID for the client session to complete the change.

## Function cancelOutputForce

This function lets you forcefully stop an agent's work and clear any output it's generating for a particular client. It’s a more direct approach than other cancellation methods, bypassing checks to ensure the agent is active or validated. 

Essentially, it’s a way to quickly reset the process for a client’s session. 

You’ll need to provide the unique identifier for the client's session to use it. 

This function handles session and swarm validation internally and ensures proper logging throughout the process.

## Function cancelOutput

This function allows you to stop an agent from generating an output. It's helpful when you need to interrupt a task an agent is performing, perhaps because the client no longer needs the result. 

You provide the unique identifier of the client and the name of the agent you want to stop.

Behind the scenes, it double-checks that the agent exists and that you have permission to cancel its output, ensuring everything is handled securely and logged appropriately. The process involves several services working together to verify and execute the cancellation.

## Function ask

This function lets you send a message to one of your AI advisors and get a response back. You can send different kinds of messages, like plain text or even more complex data, depending on what the advisor expects. Essentially, it's how you start a conversation and get an answer from a specific advisor in your system. You specify the message you want to send and which advisor should handle it.

## Function addTriageNavigation

This function lets you set up a special tool for your AI agents, allowing them to easily connect with a dedicated triage agent when needed. Think of it as creating a direct line for them to escalate issues or seek guidance. You pass in some settings to configure how this navigation works, and the function returns a unique identifier to track it. It’s designed to make agent communication smoother and more efficient when dealing with complex situations.

## Function addTool

This function lets you add new tools that agents in the system can use. Think of it as expanding the agents’ skillset – you define the tool's capabilities and register it here.  Once registered, the agents will be able to access and use these tools to accomplish tasks.  It's how you tell the system, "Hey, there's a new tool available for the agents to use!" The function ensures a clean setup when adding the tool, and confirms the tool's name after it’s been successfully registered. You'll need to provide a tool schema to define what this tool does.

## Function addSwarm

This function lets you define and register new groups of AI agents, essentially setting up a framework for how they'll work together. Think of it as creating a blueprint for a specific task or process involving multiple agents. Once registered, the system recognizes this defined group, and it becomes the foundation for launching and managing client sessions. The process runs independently, ensuring a fresh start for the registration. Finally, it gives you a name for the newly created group.

## Function addStorage

This function lets you register a new way for your AI agents to store and retrieve information, like connecting to a database or cloud storage. Think of it as adding a new tool to the swarm's toolbox. By registering a storage engine this way, the swarm knows how to reliably save and load data needed by different agents. If the storage is meant to be shared among agents, this function will also set up the connection to make that sharing possible. The process runs independently to keep things clean and returns the name of the registered storage so you can easily refer to it later.

## Function addState

This function lets you define and register new states that your AI agent swarm can use. Think of states as containers for data that agents need to share or remember. When you register a state, the swarm knows about it and can use it for things like passing information between agents or saving important data. If the state is designed to be shared across the entire swarm, this function also handles setting up the necessary connections to make that sharing work. It’s a critical step in getting your swarm system set up and operational, ensuring all agents have access to the data they need. The function returns the name of the registered state so you can easily reference it later.

## Function addPolicy

This function lets you define and register rules, or "policies," that will guide the actions of agents within your swarm. Think of it as setting up the boundaries and guidelines for how the agents operate.  When you add a policy, it's registered in two places: one to ensure the policy itself is valid and another to manage its definition. Everything happens within a carefully managed context, and all actions are logged for tracking and auditing. It's a key step in setting up your swarm, allowing you to proactively control agent behavior rather than reacting to it after the fact. You provide the policy's definition as a schema, which the system uses to understand and enforce the rules.

## Function addPipeline

This function lets you register a new pipeline or update an existing one within the AI agent swarm orchestration framework. Think of it as adding a recipe to the system that defines a sequence of steps for your agents to follow. It checks to make sure the recipe is valid and then stores it so the system can use it later. You provide a description of the pipeline - a blueprint for how your agents will work together – and the function returns a unique identifier for that pipeline. This identifier lets you easily reference and manage your pipeline configurations.


## Function addOutline

This function lets you add or update a blueprint for how AI agents will structure their work. Think of it as defining the steps and format for a complex task you want the agents to handle together.

It safely registers this blueprint with the system, making sure it doesn't accidentally mess with anything else that's already running. If you have logging turned on, it will record that you're adding or updating this blueprint.

You provide a partial blueprint definition, allowing you to modify existing structures as well as create entirely new ones.

## Function addMCP

This function lets you define and register new blueprints for how AI agents interact and share information within the swarm. Think of it as creating a standardized way for agents to understand and exchange data. You provide a schema—a detailed description—of this interaction, and the system remembers it, allowing agents to use this protocol later. The function returns a unique identifier for the registered schema.

## Function addFetchInfo

This function lets you set up a tool that your AI agents can use to retrieve information – think of it as giving them a way to “read” data without changing anything. 

It works by defining how the AI should request the information and how the system should respond.  

You can even add checks to make sure the AI is requesting the data in the right format.

If the AI’s request is valid, the system fetches the content and provides it back.

If the content is missing, you can set up a special handler to manage that situation. 

Essentially, it's about creating a controlled and predictable way for your AI agents to access and use data.


## Function addEmbedding

This function lets you add a new way for the swarm to create embeddings – think of it as adding a new tool to its toolbox for understanding and comparing information. When you add an embedding using this function, the swarm knows how to use it for tasks like creating vector representations of text or finding similar pieces of content.  Essentially, it registers a new embedding engine that the swarm will recognize.  The registration is handled in a special way to ensure it’s clean and doesn't interfere with other processes, and it confirms the embedding's name when it's successfully added. You'll need to provide a schema that defines how the embedding works.

## Function addCompute

This function lets you register a new type of task your AI agents can perform, or update an existing one. Think of it as defining what kind of work an agent can do – maybe it’s summarizing a document, translating text, or writing code.  The function checks to make sure your task definition is valid, and then makes it available for your agents to use. You can provide a complete new schema or just update parts of an existing one. The function returns a unique identifier for the registered task, which you'll use to refer to it later.

## Function addCompletion

This function lets you add new ways for agents in the swarm to generate text, like using different AI models. 

Think of it as registering a new tool for the agents to use. You provide a description of how the tool works (the completion schema), and the system makes it available for the agents. 

The process is handled carefully to keep things clean and organized, and you'll get a confirmation with the tool’s name once it’s added.

## Function addCommitAction

This function lets you define actions your AI agents can take to modify the system, like writing data or making changes. Think of it as creating a specific tool for the AI to use when it needs to write something.

The AI will call this function with details about what it wants to do, and the system will validate those details. If something goes wrong during validation, a helpful error message is sent back to the AI.

If everything validates correctly, the specified action is carried out, and the result (or nothing if the result is empty) is reported back to the AI. You can also specify messages that are triggered on success or failure to guide the AI's next steps.

## Function addAgentNavigation

This function lets you define how one AI agent can move or interact with another within your system. Think of it as creating a pathway or connection between agents. You provide some configuration details – we call them parameters – and the function sets up that navigation link. It returns a unique identifier that you can use to manage or refer to this connection later. Essentially, it's how you tell your agents how to find and interact with each other.

## Function addAgent

This function lets you register a new agent that can participate in the swarm. Think of it as formally introducing an agent to the system, so the swarm knows about it and can use it. 

You provide a schema that describes the agent, and the function takes care of adding it to the system's registry.  

Only agents registered this way will work with the swarm, so it’s a necessary step for any new agent. The process ensures a fresh start, separate from any ongoing tasks.  You'll receive the agent's name as confirmation that it's been successfully added.

## Function addAdvisor

This function lets you register a new advisor to the system, essentially adding a specialized agent to your swarm. You provide a schema that defines the advisor’s name, how it handles conversations, and any extra actions it should perform. Once added, the advisor is ready to be utilized in chat interactions. Think of it as formally introducing a new member to your AI team.

# agent-swarm-kit classes

## Class ToolValidationService

This service helps ensure the tools used by your AI agents are correctly configured and registered within the system. It keeps track of all the tools that are allowed to be used, making sure each one is unique and exists before an agent tries to use it. 

It works closely with other parts of the system, like the tool registration service and the agent validation service. The service keeps a record of all registered tools and efficiently checks if a tool is valid when needed, avoiding repetitive checks. You can add new tools to the system using the `addTool` function and validate existing tools with the `validate` function. The service also uses logging to track what’s happening and report any problems.

## Class ToolSchemaService

This service acts as a central library for defining and managing the tools that agents within the swarm system can use. Think of it as a place to register and retrieve blueprints for those tools, ensuring they are set up correctly.

It works closely with other parts of the system, like the service that manages agent schemas and the connections to agents, to make sure everyone's on the same page about what tools are available and how they should work.

Before a tool can be used, it's validated to ensure it meets basic requirements. You can register new tools, update existing ones, or simply retrieve a tool’s definition when needed. The whole process is logged to keep track of changes, and it’s designed to be consistent with how other services in the system handle logging. This makes it possible for agents to perform tasks by referencing predefined tools.

## Class ToolAbortController

The `ToolAbortController` class helps you manage how asynchronous tasks are stopped gracefully. It essentially gives you a way to pause or cancel operations that might be running in the background.

Inside, it holds an `AbortController` – a standard way to signal cancellation – and provides a simple method to trigger that signal. If your environment doesn't support `AbortController` natively, this class handles that by gracefully doing nothing instead of crashing. 

You can use it to tell an ongoing process "stop now!" and ensure it cleans up properly.

## Class SwarmValidationService

This service helps ensure that your swarm configurations are set up correctly. Think of it as a quality control system for your AI agent swarms. It keeps track of all registered swarms and verifies that they're valid – that they have the right agents, policies, and are generally configured properly.

You can use it to register new swarms, retrieve lists of agents and policies associated with a swarm, or perform a full validation check. It works closely with other services to manage agent and policy validation, and it uses caching to make validation checks faster. This service is vital for maintaining the stability and reliability of your AI agent system.

## Class SwarmSchemaService

This service acts as a central hub for managing the blueprints, or schemas, that define how your AI agents work together in a swarm. Think of it as a librarian, carefully storing and providing access to the instructions that tell agents how to behave and coordinate.

It makes sure these blueprints are consistent and valid, performing basic checks before they're put into use.  It's closely connected to other parts of the system, like the connections to your agents, the definitions of policies, and the overall swarm configuration.

When you create or modify a swarm, this service is involved, ensuring the configuration is correct. You can register new swarm schemas, update existing ones, and easily retrieve them when needed.  All these actions are logged for monitoring and troubleshooting purposes. It's a vital component in setting up and managing your AI agent swarm.

## Class SwarmPublicService

This class, `SwarmPublicService`, provides a way for external systems to interact with a swarm of agents. Think of it as a public-facing API for controlling and monitoring the swarm's activities. It acts as a middleman, taking requests and passing them on to the core swarm management system while also keeping track of things like logging and client context.

Here’s a breakdown of what it lets you do:

*   **Send messages:** You can send messages to the swarm for a specific client.
*   **Navigate the agent flow:** It allows you to pop agents off a navigation stack or return to a default agent.
*   **Check swarm status:** You can see if the swarm is currently busy with a task.
*   **Control output:** You can interrupt or wait for output from the swarm.
*   **Get agent information:** It lets you find out the current agent's name and details.
*   **Manage agents:** You can set the current agent and its details.
*   **Clean up:** It lets you properly dispose of the swarm resources when you’re done.

The `SwarmPublicService` focuses on providing a controlled and scoped way to manage the swarm, ensuring everything is logged and associated with the correct client and swarm.

## Class SwarmMetaService

This service acts as a central hub for understanding the structure of your AI agent swarms and presenting that information visually. It takes the underlying definitions of your swarms and transforms them into a clear, UML diagram format, making it much easier to grasp the relationships between agents and understand the overall swarm architecture.

Think of it as a translator – it takes the technical details of your swarm's design and converts them into a user-friendly diagram. It pulls information about your swarms from other services and builds a tree-like representation, then uses that to generate a UML string suitable for creating visual diagrams. The diagrams produced are useful for documentation and debugging, allowing you to easily see how your swarms are organized and how the different agents interact. You can control the level of logging to track what's happening behind the scenes.

## Class SwarmConnectionService

This service manages connections and actions within a swarm environment, essentially acting as a central hub for coordinating agent activities. It keeps track of swarms and their configurations, efficiently reusing them when possible.  Think of it as a librarian, retrieving or creating swarm "books" (ClientSwarm instances) as needed, making sure they’re set up correctly with all the right agent information.

It provides a way to send messages, navigate between agents, and retrieve information about the current state of the swarm, like whether it's busy processing a task. It helps communicate with agents and provides basic controls such as canceling output or getting the current busy state. The service is designed to be efficient and consistent in its logging and event handling, relying on other services to handle specific tasks like agent management and schema retrieval. Finally, when it’s finished, it cleans up and releases the swarm connection.

## Class StorageValidationService

This service helps ensure that the storage configurations used by your AI agents are set up correctly and consistently. It keeps track of all registered storage configurations, making sure each one is unique and has a valid setup for embedding data.

When you add a new storage, this service registers it and verifies it doesn't already exist.

The core validation process checks if a storage exists and confirms that its embedding configuration is correct, supporting the operations performed by your agents. It’s designed to be efficient by remembering previous validation results, so it doesn’t have to repeat checks unnecessarily. This service uses logging to keep you informed about validation activities and any problems encountered.

## Class StorageUtils

This class provides tools for managing data storage used by agents within the swarm. It simplifies interactions with the underlying storage service while ensuring proper authorization and registration.

You can use methods like `take` to retrieve a specific number of items based on a search term, or `upsert` to add or update items.  `remove` lets you delete items by their ID.  If you need to retrieve a single item, use `get`.  `list` provides a way to view all items in a particular storage area, and you can even filter them.

`createNumericIndex` is available to generate an index for the storage area, useful for optimization. Lastly, `clear` lets you completely remove all data from a storage area. Each of these operations checks that the client is authorized, the storage name is valid, and the agent is properly registered before proceeding.

## Class StorageSchemaService

This service acts as a central hub for managing how your AI agents interact with storage. It keeps track of storage configurations, making sure they're set up correctly and consistently across your system.

Think of it as a catalog of storage blueprints. Each blueprint (a storage schema) describes how to handle data, like how to create indexes or where to find related embedding information.

Before a storage configuration can be used, it's checked for basic correctness. This service works closely with other components to manage storage connections, agent configurations, and public APIs. You can log actions related to these storage configurations for debugging and monitoring.

The service provides ways to register new storage schemas, update existing ones, and retrieve configurations as needed. It ensures that the storage configurations are valid and accessible, which is crucial for efficient data handling by your AI agents.

## Class StoragePublicService

This class manages storage specifically tied to individual clients within the swarm system. Think of it as a way to keep each client’s data separate and secure. It builds upon the core storage functionality but adds client-specific scoping.

It handles common storage operations like retrieving, updating, deleting, listing, and clearing data. All these actions are logged to help track what's happening, and it works closely with other services like the logging and performance tracking components.

Unlike the system-wide storage, this service ensures that each client only interacts with their own data, improving security and organization. You'd use this when you need to store information that is unique to a particular client, such as settings or preferences.

## Class StorageConnectionService

This service is the central hub for managing how your AI agents interact with storage within the swarm system. Think of it as a smart librarian, responsible for finding, creating, and organizing data for each agent.

It cleverly reuses storage connections to avoid unnecessary overhead, and it knows whether a connection is intended for a single agent or is shared among multiple agents. It integrates with various other services to handle everything from logging and event tracking to validating usage and fetching configurations.

**Here's a breakdown of what it does:**

*   **Manages Connections:** This service creates and manages the connections to your storage, making sure each agent has the right access.
*   **Smart Caching:** It remembers previously used connections, so it doesn't have to recreate them every time.
*   **Shared vs. Private Storage:** It handles both dedicated storage for individual agents and shared storage used by multiple agents.
*   **Data Operations:** It provides methods for getting, adding, updating, deleting, and listing data in your storage.
*   **Agent Integration:** It works closely with your agents to ensure they can access and modify data seamlessly.
*   **Clean Up:** When an agent is finished, this service cleans up its storage connection.

## Class StateValidationService

This service helps manage and ensure the consistency of your AI agent swarm's state. Think of it as a quality control system for how your agents are behaving and what information they're using. 

It lets you define the expected structure of different states your agents might be in, like "planning" or "executing." You can add new state definitions, telling the service what data to expect in each. 

The core function is validation – you can ask the service to check if a particular state, coming from one of your agents, conforms to the structure you've defined. This helps catch errors early and keeps your swarm operating reliably. 

It uses a logger service to record any validation issues, so you can easily troubleshoot problems.

## Class StateUtils

This class helps manage the data associated with individual clients and agents within the swarm. Think of it as a tool for tracking specific pieces of information, like a client’s preferences or the status of an agent's task.

You can use it to fetch existing data, update it with new information, or completely reset it. Before any action is taken, the system makes sure the client is authorized and that the agent is properly registered. Every action is also logged for auditing and debugging.

The `getState` method lets you retrieve existing state information. The `setState` method allows you to either directly set a value or provide a function to calculate a new state based on what already exists. Finally, `clearState` is used to erase the data completely, bringing the state back to its starting point.

## Class StateSchemaService

The StateSchemaService acts as a central place to manage and keep track of the blueprints for how your AI agents handle data – these blueprints are called state schemas. Think of it as a library where you store and retrieve these schemas, ensuring they're set up correctly.

It works closely with other services, like those handling connections and configurations, ensuring everything is consistent. When you add or update a schema, it performs a quick check to make sure it's structurally sound. 

This service is essential for defining how your client-specific and shared states operate within the swarm, providing the necessary instructions and frameworks for those states to function properly. It uses logging to keep track of its actions, helping you understand what's happening with your state schemas.

## Class StatePublicService

This class provides a way to manage state information specifically tied to individual clients within the system. Think of it as a dedicated space for each client’s data, distinct from system-wide settings or persistent storage.

It’s designed to work closely with other parts of the system like the client agent and performance tracking, allowing for actions like updating, clearing, retrieving, and cleaning up this client-specific data.  Every action taken is logged, providing visibility into how state is being managed, and is built on top of the underlying state connection service.

This service is key for scenarios where you need to keep track of information unique to each client interaction.

## Class StateConnectionService

This service is the central hub for managing state within your agent swarm. It handles the lifecycle of individual agent states, from creation to disposal, ensuring that they are accessed efficiently and safely.

Think of it as a smart cache for agent states: when an agent needs a specific piece of data (the "state"), this service tries to reuse an existing one rather than creating a new one from scratch. It's organized around a client and a state name, allowing for tailored state management for each agent.

If a state is designated as "shared," it offloads the actual management to a dedicated "shared state" service. This prevents accidental cleanup of states that are used by multiple agents.

To keep things running smoothly, it relies on other services like a logger (for tracking what’s happening), a bus (for sending out notifications about state changes), and a validation service (to ensure usage is correct).  The service also helps coordinate the persistence of states, making sure they are saved and loaded properly. 



It provides methods to get, set, and clear agent states. When you change a state, a "dispatch function" is used, giving you a way to update the state based on its previous value. And when an agent is finished using its state, this service handles cleaning up the resources related to that state.

## Class SharedStorageUtils

This class provides tools for your agents to share information and coordinate. It lets you easily retrieve, add, update, and delete data stored within the swarm's shared storage. 

You can fetch a specific number of items that match a search term, add new items or update existing ones, or remove items entirely. It also provides a way to retrieve a single item by its unique ID, list all items in a storage area (with optional filters), and completely wipe out a storage area if needed. Each operation ensures the storage area name is valid, making sure things run smoothly and securely within the agent swarm.

## Class SharedStoragePublicService

This class manages how different parts of the system interact with shared storage. Think of it as a public-facing interface for storing and retrieving data across the entire swarm. It handles requests for things like getting, adding, updating, removing, or clearing data, and ensures these operations are tracked and scoped appropriately.

It works closely with other services: ClientAgent uses it to manage data, PerfService uses it to track storage usage, and DocService uses it to document the structure of the stored information. 

The system logs details about these operations (if logging is enabled), providing a record of how data is being manipulated within the swarm. Each method essentially acts as a wrapper around the core storage operations, adding extra context and logging.

## Class SharedStorageConnectionService

This service manages shared storage for the entire swarm system, acting as a central point for data access and modification. It ensures that all clients are working with the same, consistent view of the shared storage, using a special identifier ("shared") to prevent conflicts.

Think of it like a shared whiteboard everyone in the team can read and write on. This service handles creating that whiteboard, making sure everyone uses the same one, and providing standard tools to read, write, and erase the information on it.

It intelligently caches storage instances to avoid unnecessary overhead, and relies on other services to handle configurations, logging, and event propagation.  The `getStorage` method is key – it’s how you get access to a specific shared storage space. Other methods like `take`, `upsert`, `remove`, `get`, `list` and `clear` provide common data operations, all synchronized across the system.

## Class SharedStateUtils

This class provides helpful tools for agents in a swarm to share and manage information. Think of it as a central board where agents can read, write, and reset shared data. 

You can use `getState` to check the current value of a piece of shared data. `setState` lets you update this data – you can either provide a new value directly or give a function that calculates the new value based on what's already there. Finally, `clearState` allows you to completely reset a piece of shared data back to its starting point. Each of these actions happens in a controlled environment, ensuring things are logged properly and handled by the swarm's state service.

## Class SharedStatePublicService

This service is responsible for managing shared data accessible across different parts of the system. Think of it as a central repository where different agents can read and update information, but in a controlled and trackable way. 

It provides a public interface for working with this shared data, handling the underlying mechanics and ensuring operations are properly scoped and logged. The service integrates with other key system components like the agent execution environment and performance monitoring tools.

You can use it to set, clear, and retrieve shared state, and it keeps a record of these changes when logging is enabled. This is particularly helpful for things like updating data during task execution or resetting performance metrics.

## Class SharedStateConnectionService

This service manages shared state within the agent swarm, allowing different agents to access and modify the same data consistently. Think of it as a central whiteboard that agents can all read and write to, but in a controlled and reliable way.

It provides methods for getting, setting, and clearing this shared state. When you set the state, changes are carefully handled to avoid conflicts and ensure updates happen in the right order, even when multiple agents are trying to modify it simultaneously.

The service keeps track of these shared states, so it doesn't have to recreate them every time they’s needed, making everything more efficient. It also works closely with other services to handle things like logging, schema validation, and event propagation, ensuring that everything operates smoothly and consistently. The service is designed to be flexible and adaptable, allowing for customization through configuration options.

## Class SharedComputeUtils

This toolkit provides helpful functions for managing and interacting with shared computing resources within your AI agent swarm. 

Think of it as a set of utilities to streamline how your agents access and utilize computational power. The `SharedComputeUtils` class offers two primary functions. 

First, you can use the `update` function to refresh the status of a specific compute resource, ensuring your agents have the latest information. 

Second, `getComputeData` lets you retrieve data about a compute resource, allowing your agents to dynamically adapt their operations based on available resources. You can specify the type of data you're expecting when you request it.

## Class SharedComputePublicService

This service helps coordinate and manage shared computing tasks, keeping track of what's happening in different parts of your application. It relies on a logger to record activity and a connection service to handle the actual compute operations. 

You can use it to fetch previously computed data using `getComputeData`, which is useful for accessing results from earlier runs. If you need to force a recalculation, `calculate` will trigger a fresh computation. Finally, `update` lets you manually refresh a shared compute instance when needed, ensuring you have the latest data.

## Class SharedComputeConnectionService

This class helps manage connections to shared computing resources within the agent swarm. Think of it as a central hub for agents to access and share results from complex calculations.

It handles retrieving compute references, which are essentially pointers to specific computing tasks. It also provides a way to get the actual data that's been computed – essentially, the final result of the task.

The `calculate` method triggers a compute operation, while `update` refreshes the data, ensuring agents have the latest information. It uses internal services for logging, communication, and managing context, making the process streamlined and organized.

## Class SessionValidationService

This service keeps track of sessions and how they’re being used within the swarm system. Think of it as a central record of which agents, storages, states, and computes are tied to each session.

It registers new sessions, records when agents, storages, and other resources are used, and allows you to remove them when they're no longer needed. This helps ensure everything is consistent and resources are managed properly.

The service uses logging to keep track of actions and optimizes performance with memoization (remembering the results of checks so they don’t need to be recomputed). It works closely with other services like session management, agent tracking, and swarm configuration, making sure everything stays synchronized.

You can use it to check if a session exists, get information about a session (like its mode or which agents are associated with it), and clean up resources when a session is finished. The service also provides a way to clear its internal memory of session details, helpful for resource cleanup.

## Class SessionPublicService

This class, `SessionPublicService`, acts as the main gateway for interacting with a session in the swarm system. Think of it as the public-facing interface for managing and communicating within a session. It handles tasks like sending messages, executing commands, and tracking performance, all while ensuring proper context and logging.

Essentially, it's a wrapper around other services (`SessionConnectionService`, `PerfService`, etc.) to provide a consistent and controlled way to work with sessions.  When you need to send a message, execute a command, or generally manage a session, you’ll use methods like `emit`, `execute`, or `run` through this class. 

It’s designed to be reliable and well-documented, keeping track of what’s happening in the session and ensuring that everything is properly handled and logged.  Each method ensures consistent operations across client agents, developer tools, and performance tracking.


## Class SessionConnectionService

This service manages connections and operations within a swarm system, acting as a central hub for agent interactions, messaging, and execution. Think of it as a conductor orchestrating a group of agents working together within a specific environment. It efficiently reuses session data to avoid unnecessary overhead, logging important actions for debugging, and coordinating with other services to ensure smooth and secure operation.

The core functionality includes:

*   **Session Management:** Creates and retrieves reusable "session" environments for agents to work in.
*   **Messaging & Execution:** Handles sending messages to and executing commands within these sessions.
*   **Coordination:** Connects various services involved in the swarm, like policy enforcement, configuration management, and performance tracking.
*   **Efficient Reuse:** Stores and reuses session data to improve performance.
*   **History Tracking:** Logs events and actions within the session, allowing for review and debugging.
*   **Communication:** Facilitates bidirectional communication between clients and the swarm.


## Class SchemaUtils

This class provides helpful tools for working with client session data and preparing data for communication. It lets you store information associated with a specific client's session, allowing your agents to remember context and share information. You can easily write data to a client's session memory, read existing data back, and convert objects into formatted strings, which is useful for things like sending data between agents or logging. There's also the option to customize how the objects are formatted when serializing them into strings.

## Class RoundRobin

This class provides a simple way to rotate through a list of creators, ensuring each one gets a turn. Think of it like a round-robin tournament where each participant gets a slot. 

It maintains a list of "tokens," which represent the creators you want to cycle through.  Each token is associated with a function that will be executed. 

The `create` method is how you set up this rotation; you give it a list of tokens and a function that knows how to create an instance based on each token.  The resulting function then cycles through those tokens, invoking the appropriate instance creator each time. You'll see logs showing the order in which they're called, which can be helpful for debugging or monitoring.

## Class PolicyValidationService

This service is responsible for making sure the policies used by your AI agent swarm are valid and consistent. It keeps track of all registered policies and their details, preventing duplicates and ensuring they exist when needed. 

It works closely with other parts of the system, like the policy registration service and the component that enforces policies. The service also logs its actions and is designed to be efficient, remembering previous validation checks to avoid unnecessary work.

You can use it to register new policies and to check if a specific policy is valid for use within the swarm. It’s a crucial element for maintaining the integrity of your AI agent system’s policies.

## Class PolicyUtils

This class provides helpful tools for managing client bans across your AI agent swarms and their associated policies. It simplifies the process of banning, unbanning, and checking the ban status of clients. Think of it as a central point to control access, ensuring that your swarms operate as intended. 

Each function, like banning or unbanning a client, automatically verifies the provided information – the client ID, swarm name, and policy name – before performing the action. This built-in validation helps prevent errors and ensures everything happens within a traceable and logged context.  It makes it easier to control client access and track these actions.

## Class PolicySchemaService

This service acts as a central hub for managing the rules that govern how agents operate within the system. It’s like a library where all the policy definitions are stored and readily accessible. When a new rule needs to be added or an existing one needs to be updated, this service handles the process, ensuring the rule is valid before it's put into action.

It works closely with other parts of the system – for example, it provides the logic used to determine which clients are blocked and it's used to apply policies to both individual agent executions and ongoing sessions. Every time a rule is added, changed, or retrieved, it keeps a record of the activity, providing valuable insight into how the rules are being managed. Essentially, this service ensures that policies are consistently and reliably applied throughout the system.

## Class PolicyPublicService

This service manages how policies are applied and enforced within the swarm system. It acts as a central point for checking if a client is banned, retrieving ban messages, and validating both incoming and outgoing data against specific policies. 

You can use it to determine if a client has a ban in place, find out the reason for a ban, and ensure data conforms to defined rules. It also provides methods to ban and unban clients, allowing for dynamic control over access and restrictions. The service carefully logs its actions for auditing and troubleshooting purposes. This component works closely with other parts of the system to handle client access and data integrity.

## Class PolicyConnectionService

This service acts as a central hub for managing how policies are applied across your swarm system. It handles tasks like checking if a client is banned, retrieving ban messages, validating input and output data, and actually banning or unbanning clients.

Think of it as a gatekeeper, ensuring that actions taken by clients are in line with the configured policies. It efficiently reuses policy information thanks to caching and relies on other services for things like logging, event handling, and fetching policy details. It provides a consistent interface and mirrors functionalities available in other parts of your system, like ClientAgent and SessionPublicService, making sure everything works together smoothly.

## Class PipelineValidationService

This class, `PipelineValidationService`, helps you ensure your AI agent pipelines are set up correctly before running them. Think of it as a quality control system for your workflow blueprints. 

You can add different pipeline definitions to this service, each one describing how your agents will work together. Each pipeline definition includes a schema that details the expected structure. 

Then, when you're ready to run a pipeline, this service can validate it. It checks if your pipeline's configuration matches the defined schema and flags any potential problems, saving you from unexpected errors down the line. The service also keeps track of all the pipelines you've added, making it easier to manage them.

## Class PipelineSchemaService

This service manages and provides access to pipeline schema definitions. Think of it as a central place to store and retrieve blueprints for how your AI agents should work together. 

It uses a schema context service to ensure these definitions are handled correctly and consistently. 

You can register new pipeline schema blueprints using the `register` method, or update existing ones using `override`.  The `get` method lets you retrieve a specific schema when you need it. There's also a `validateShallow` function available for quick checks, and an internal registry to keep track of everything.

## Class PersistSwarmUtils

This class helps manage how information about active agents and their navigation history is saved and retrieved. Think of it as a central place to store which agent is currently running for a user and the path they're taking through different agents within a group.

It provides easy ways to find out what agent a user is currently using, and to store that information, as well as their history of agent usage. It ensures that storage for active agents and navigation stacks is handled efficiently, with only one instance used per group of agents.

You can even customize how this information is stored – like choosing to use a database or keeping it in memory – to fit your specific needs. It's designed to be flexible, so you can adapt how agent activity and navigation are managed within your system.

## Class PersistStorageUtils

This utility class helps manage how data is saved and retrieved for each client within the system. It acts as a central point for accessing persistent storage, making sure that each storage area is handled efficiently. 

You can think of it as a way to store and remember information about a user’s session, like their settings or activity history. The system avoids creating multiple storage instances for the same data, which helps to conserve resources.

You can also customize how this storage actually works by providing your own storage implementation. This allows you to integrate different persistence technologies, such as databases, for specific storage areas.

## Class PersistStateUtils

This class helps manage how information is saved and retrieved for each client within the system. Think of it as a way to remember things about each agent – like their settings or progress – so they can pick up where they left off.

It allows you to store and retrieve data associated with a specific client (identified by a unique ID) and a descriptive name for that data. The system is designed so that each type of data only gets saved once, which is efficient.

You can even customize how the data is stored by providing your own storage mechanism, allowing for more specialized persistence solutions like in-memory storage or using a database.

## Class PersistPolicyUtils

This class helps manage how policy data, specifically lists of banned clients, are saved and retrieved within your AI agent swarm. It acts as a central tool for keeping track of which clients are blocked and ensuring that information is consistent.

You can think of it as a way to control which agents are allowed to participate, and this class manages that control. The `getBannedClients` method lets you check if a client is currently banned, while `setBannedClients` is used to add or remove clients from the banned list.

To optimize performance, the system uses a memoized storage mechanism to avoid creating duplicate persistence instances for each swarm.

If you need more control over *how* this data is stored (like using a database instead of a simple file), you can customize the persistence adapter with the `usePersistPolicyAdapter` method.

## Class PersistMemoryUtils

This class helps manage how memory is saved and retrieved for each client in the swarm system. Think of it as a way to remember things about a specific user or session.

It ensures that each client's memory is stored and accessed efficiently, creating only one storage instance per client ID. You can retrieve previously stored information using a default value if nothing exists, or save new data for later use.

When a client’s session is over, you can release the memory storage to free up resources.

If you need more flexibility, you can even customize how the memory is stored – for example, using an in-memory store or connecting to a database instead of the default persistence method.

## Class PersistEmbeddingUtils

This class provides tools to handle saving and retrieving embedding data within the swarm system. It allows you to work with embedding vectors – numerical representations of text – and make sure they are stored and retrieved efficiently.

The class uses a caching mechanism to avoid repeatedly calculating the same embeddings; it checks if an embedding already exists before computing it. You can also customize how the embeddings are stored, by providing your own persistence adapter. This lets you choose between storing embeddings in memory, a database, or any other custom solution. The system ensures only one persistence instance is used for each embedding name, which helps conserve resources.

## Class PersistAliveUtils

This utility class helps keep track of whether clients are online or offline within your AI agent swarm. It's designed to work with a `SessionId` to uniquely identify each client.

The core functionality involves marking clients as online or offline, and then retrieving that status later.  Think of it as a way to know which agents are currently responsive.

You can also customize how this status is persisted – whether it’s stored in memory, a database, or some other method – by using a custom adapter. This gives you flexibility in how you manage the alive status information.  The `getAliveStorage` function makes sure you're always using the same storage for each client’s status, which helps with efficiency.

## Class PerfService

The `PerfService` is responsible for meticulously tracking the performance of client sessions within the AI agent swarm. It's like a detailed logbook for how long things take, how much data is being processed, and the overall health of the client's session. 

Think of it as automatically collecting data when an agent executes a command – things like the time it took, the size of the input and output, and the current state of the client.  This information gets compiled into structured records that can be used for monitoring and analysis.

Several other services, like validation and public services, are involved in gathering the necessary data – pulling session details, swarm information, and other relevant factors. The service uses logging for debugging information, and tracks everything from individual execution times to overall system averages. Methods like `startExecution` and `endExecution` are used to mark the beginning and end of tasks, ensuring accurate performance measurement.  Finally, `toRecord` allows you to consolidate all this data into comprehensive reports.

## Class OutlineValidationService

This service helps ensure the outline structures used by your AI agents are consistent and correct. It keeps track of all registered outline schemas, assigning a unique name to each.

You can register new outline schemas using `addOutline`, and retrieve a list of all registered names with `getOutlineList`.

The `validate` function checks if a specific outline exists, and it's designed to be quick by remembering previous checks. It also relies on other services to verify completion schemas and configurations, making sure everything fits together properly. The service also logs important actions for debugging purposes.

## Class OutlineSchemaService

This service helps manage the structure, or "outline," of tasks within the agent swarm. Think of it as defining the steps an agent should take to complete a job.

It lets you define these outlines, update them, and then easily access them when needed. The service keeps track of these outlines in a registry, making sure each one is properly formatted and valid. 

It uses logging to record what’s happening, and relies on other services to handle the broader context of schema management.  You can register new outlines, change existing ones, or simply retrieve a defined outline.

## Class OperatorInstance

This class represents a single instance of an operator within your AI agent swarm. Think of it as a specific agent participating in the larger orchestration. 

When you create an `OperatorInstance`, you’re essentially giving a particular agent a unique identifier (`clientId`), a name (`agentName`), and a set of optional callback functions to handle events.

The `connectAnswer` method allows you to subscribe to receive answers from the agent. The `notify` method sends general information to the agent, `answer` transmits a direct answer, and `recieveMessage` handles incoming messages. Finally, `dispose` cleans up and shuts down the agent instance when it’s no longer needed.

## Class NavigationValidationService

This service helps manage how agents within a swarm move around and interact. It keeps track of which agents have already been visited by a client to prevent unnecessary movement and wasted effort. 

The `getNavigationRoute` function is a clever shortcut that remembers past navigation paths for each client and swarm, so it doesn't have to recalculate them every time.  The `shouldNavigate` function decides whether an agent should be navigated to, based on whether it’s already been seen. 

You can start fresh with the `beginMonit` function to clear out the history of visited agents, and the `dispose` function cleans up the navigation route when it’s no longer needed. A logger is used to record actions for troubleshooting.

## Class NavigationSchemaService

This service keeps track of the different navigation tools your AI agents are using. It essentially maintains a list of recognized tool names, allowing your system to know which tools are available for navigation. 

You can register a new tool name using the `register` function, and the system will remember it for future use. To check if a specific tool name is already registered, use the `hasTool` function. The service also logs these operations for monitoring purposes, if logging is enabled in your configuration.

## Class MemorySchemaService

This service manages temporary, in-memory data associated with individual sessions within the swarm. Think of it as a simple scratchpad for each session – a place to store and retrieve information that doesn't need to be saved permanently. It provides straightforward methods to put data in, get data out, and clear that data when a session is finished. This isn't a database; it’s a lightweight way to handle session-specific runtime data.

It works hand-in-hand with other services like the session connection service and agent components, and it keeps track of its actions with logging.  If you need to store something briefly for a session, and don't worry about long-term persistence, this service is a good option. It uses a simple key-value store, where the key is the session identifier and the value is whatever data you need to hold.

## Class MCPValidationService

This service helps you keep track of and ensure the correctness of your Model Context Protocols, or MCPs. Think of it as a central registry for your MCP definitions.

It uses an internal map to store these MCP schemas, allowing you to easily add new ones. When you add a schema, it’s linked to a unique name.

You can use the service to check if a specific MCP schema exists and is properly defined, which is crucial for ensuring your agents are communicating correctly. The service also uses a logger to record its actions, which helps with debugging.

## Class MCPUtils

This class, `MCPUtils`, helps manage updates to the tools used by your clients when they're connected through the Multi-Client Protocol (MCP). Think of it as a way to ensure everyone has the right versions of what they need. You can use it to push those updates to all connected clients at once, or just to a single client if needed. It simplifies the process of keeping your clients synchronized with the latest tools.

## Class MCPSchemaService

This service helps manage the blueprints, or schemas, that define how AI agents communicate and share information within a swarm. It acts as a central repository for these schemas, allowing you to add new ones, update existing ones, and easily access them when needed. 

The service keeps track of all registered schemas and relies on a logging system to monitor its operations. It also uses a schema context service to help ensure schemas are valid and consistent. 

You can think of it like a librarian for agent schemas – adding, updating, and retrieving them as needed to keep the swarm functioning smoothly.  The `register` method adds a new schema, `override` updates an existing one, and `get` lets you fetch a specific schema by name.

## Class MCPPublicService

This class is your gateway to managing and interacting with tools within a system that uses the Model Context Protocol (MCP). It lets you discover what tools are available, check if a particular tool exists, and actually execute those tools with specific inputs. You can also update the list of tools that are offered, either for all users or for a single user. The class relies on injected services for logging and handling the underlying MCP communication, making it flexible and easy to integrate into larger systems. Think of it as a control panel for your AI agents and the tools they can use.

## Class MCPConnectionService

This service handles connections and interactions with Model Context Protocols (MCPs), which are essentially how your agents communicate and use tools. It's responsible for managing those connections and ensuring agents can request tool lists, execute tools, and clean up when they're finished.

Think of it like a central hub; when an agent needs a list of available tools, this service provides it. When an agent wants to actually *use* a tool, this service makes the call. The service also keeps track of these connections and cleans them up properly when no longer needed.

Here's a breakdown of what it does:

*   **Manages MCP Connections:** Establishes and maintains connections to MCPs, enabling tool interaction.
*   **Provides Tool Lists:**  Allows agents to discover what tools are available to them.
*   **Executes Tools:**  Handles the requests to actually run specific tools.
*   **Cleans Up Resources:**  Releases resources associated with client connections when they're no longer needed.
*   **Caches MCP Instances:**  Stores previously retrieved MCP instances to avoid unnecessary reloads.
*   **Handles Tool Updates:** Provides functionality to refresh tool lists, either globally or for specific agents.


## Class LoggerService

The LoggerService is responsible for handling logging within the agent swarm, providing different levels of detail like general logs, debug information, and informational messages. It makes sure logs are sent to both a system-wide logger and a client-specific logger, allowing for flexible and detailed tracking of what's happening.

It uses context services to automatically add information to logs, like the client involved and the stage of execution. This makes it much easier to understand where issues are occurring.

You can even swap out the system-wide logger while the system is running if you need to, which is useful for things like testing or customizing how logs are handled. Essentially, it’s a central place to manage and control logging across the entire agent swarm, offering a lot of flexibility in how information is recorded and analyzed.

## Class LoggerInstance

This class handles logging specifically for a client, allowing you to control where the messages go and what happens with them. You give it a client ID and some optional callback functions to customize its behavior.

It manages the logging process, letting you decide whether to display messages in the console or trigger custom actions when logging events. The `waitForInit` method ensures the logger is properly set up when needed, and `dispose` allows for clean-up when you're finished. You can use `log`, `debug`, and `info` to send different types of messages, all of which can be customized through callbacks or controlled by global configuration settings.

## Class HistoryPublicService

This service manages how history information is accessed and modified within the swarm system. It acts as a public interface for interacting with agent history, ensuring context is maintained and logging is consistent across different parts of the system.

It works closely with other services: it receives logging information from the LoggerService, relies on the HistoryConnectionService for the actual history operations, tracks performance with PerfService, and integrates with ClientAgent and AgentPublicService.

Here's a breakdown of what you can do with this service:

*   **Push Messages:** Add new history entries for a specific client and method.
*   **Pop Messages:** Retrieve the most recent entry from the history.
*   **Convert to Arrays:** Transform the history into array formats, either tailored for agent processing or in a raw, unformatted state.
*   **Dispose of History:** Clean up and release resources associated with an agent's history.

This service is designed to be reliable and well-integrated, providing a controlled and logged way to work with agent history.

## Class HistoryPersistInstance

This class is responsible for keeping track of a conversation's history, making sure it's saved both in memory and on disk. It's designed to work with a specific agent, identified by a unique client ID.

When you create an instance, it sets up the history for that agent and can load any existing data from storage. You can then add new messages to the history, and it will automatically save them. You can also retrieve the last message, removing it from the history and storage, or iterate through the entire history to access all previous messages. Finally, when you're finished with the history, you can dispose of it, which will clear all data—or just the data for a specific agent if you prefer.

## Class HistoryMemoryInstance

This component acts as a temporary storage for message history, keeping track of conversations without saving them permanently. It's identified by a client ID and can be customized with callback functions to respond to specific events like adding or removing messages. 

When an agent starts, you’ll need to initialize the history. To view the messages, you can iterate through them, which will apply any configured filters and system prompts. Adding new messages is straightforward with the `push` function, and you can retrieve the most recent message using `pop`. Finally, the `dispose` method allows you to clear the history, either for a specific agent or completely.

## Class HistoryConnectionService

This service manages the history of interactions with AI agents within the system. Think of it as a central place to keep track of what's happening with each agent, allowing for things like reviewing past messages or preparing data for the agent to use.

It's designed to be efficient, reusing history information whenever possible through a caching mechanism. This service relies on other parts of the system, like logging, event handling, and session validation, to function correctly.

Here’s a breakdown of what it does:

*   **Retrieves History:** It fetches or creates a history record for a specific client and agent, ensuring that the history isn't recreated unnecessarily.
*   **Adds Messages:** It adds new messages to an agent’s history.
*   **Removes Messages:** It removes the most recent message from an agent’s history.
*   **Formats History:** It can format the history data in different ways, like preparing it for the agent to use or for reporting purposes.
*   **Cleans Up:** When finished, it properly cleans up the history, freeing up resources and updating usage tracking.

Essentially, this service acts as the behind-the-scenes record keeper for agent interactions, contributing to the overall stability and functionality of the AI agent orchestration framework.

## Class ExecutionValidationService

This service helps manage and validate the execution of AI agents within a swarm, preventing issues like runaway nested calls. It keeps track of how many times an agent is running for a particular client and swarm.

The `getExecutionCount` method allows you to check the current execution status – essentially, how many agents are actively running. `incrementCount` signals that an agent has started a new execution, making sure it doesn's exceed safe limits. Conversely, `decrementCount` indicates an agent has finished its work, resetting its count.

If you need a fresh start, `flushCount` wipes the current tracking data for a specific client and swarm, while `dispose` completely removes the stored execution count information. Essentially, these methods give you granular control over execution monitoring and cleanup within your AI agent swarm.

## Class EmbeddingValidationService

This service helps keep track of all the embedding models used within the system, ensuring that they’re correctly registered and available. It acts like a registry, storing information about each embedding model and verifying its existence when needed.

You can add new embedding models to the registry using the `addEmbedding` method. This method also makes sure that each embedding name is unique.

The `validate` method checks if a given embedding name is registered, and it does so efficiently by remembering the results of previous checks. This is especially helpful when the system is searching for embeddings to use.

The service works closely with other parts of the system like the embedding schema registration, client storage (for searching), and agent validation, to make sure everything works together smoothly. It also logs its actions for monitoring and troubleshooting.

## Class EmbeddingSchemaService

The EmbeddingSchemaService acts as a central hub for managing the instructions used to create and compare embeddings – those numerical representations of data used for searching and similarity matching within the swarm system. It keeps track of these instructions, making sure they’re valid and accessible to other parts of the system that need them.

Think of it as a library of “embedding recipes,” ensuring that the processes for converting data into a usable format are consistent and reliable.

The service validates new embedding instructions before adding them to the registry, and it logs important operations for troubleshooting. It works closely with other services involved in data storage, agent execution, and agent configuration, providing the necessary embedding logic for tasks like finding similar data or creating new agents. You can register, update, or retrieve these "embedding recipes" using the provided methods.

## Class DocService

This class is responsible for creating documentation for the entire swarm system, including individual swarms, agents, and their performance. Think of it as the documentation generator for your AI agent orchestration.

It gathers information from various services – schema validation, agent details, performance metrics – and outputs this data into well-organized Markdown files and JSON performance reports.  It makes use of UML diagrams to visualize agent and swarm structures, aiding understanding.

The process is automated and concurrent, leveraging a thread pool to handle multiple documentation tasks simultaneously.  Detailed logging is available for debugging and monitoring the documentation generation process. The resulting documentation is organized into subdirectories for easy navigation. It even generates reports on performance, detailing system-wide and client-specific metrics. This helps with understanding how the agents are performing and troubleshooting any issues.


## Class ComputeValidationService

This service is responsible for validating the state of your AI agents within a swarm. Think of it as a quality control system ensuring that each agent’s data and configuration are correct.

It uses a collection of "compute" modules, each responsible for validating a specific aspect of the agent's state. You can add new compute modules to extend the validation capabilities.

The `validate` function performs the validation process, checking the agent's state against the configured compute modules. It offers a way to systematically verify the health and consistency of your agent swarm.

The service relies on other services like `loggerService`, `stateValidationService`, and `stateSchemaService` to handle logging, basic state validation, and schema management, respectively. 

You can dynamically add and manage these compute modules using `addCompute` and then retrieve a list of registered compute names with `getComputeList`.

## Class ComputeUtils

This class, ComputeUtils, provides tools for managing and retrieving information related to computational resources within the agent swarm. You can use it to notify the system about updates to compute resources, essentially letting it know when something has changed. It also allows you to request data about a specific compute resource, identified by its client ID and name, and receive it in a format suitable for your needs. This is helpful for monitoring and synchronizing information across the swarm.

## Class ComputeSchemaService

This service helps manage and organize different schema definitions used by your AI agents. Think of it as a central repository where you store blueprints for how agents should process information. 

It allows you to register new schema blueprints, replace existing ones, and easily retrieve them when needed. The service is designed to keep track of schema contexts and provides a way to interact with them, ensuring your agents have access to the correct information. It's injected with a logger to help with troubleshooting and a schema context service to handle schema-related tasks.

## Class ComputePublicService

This component acts as a public interface for coordinating compute tasks, keeping track of the context in which those tasks are run. It relies on injected services for logging and for actually interacting with the compute resources. 

You can use it to fetch computed data using `getComputeData`, triggering a recalculation with `calculate`, forcing an update with `update`, and cleaning up resources with `dispose`. Each of these methods needs information about the method, client, and compute instance involved, ensuring operations are correctly associated with their context.

## Class ComputeConnectionService

This class, `ComputeConnectionService`, helps coordinate and manage how different AI agents within a swarm share and use computed information. Think of it as a central hub ensuring everyone's on the same page.

It relies on several other services for logging, communication, managing contexts, defining compute structures, verifying sessions, handling state, and sharing compute connections. 

The `getComputeRef` function is a clever way to retrieve a reference to a specific computed item, remembering previous requests to be efficient.  `getComputeData` allows you to grab the results of any calculations that have been performed. 

`calculate` is used to trigger the computation process for a given state. `update` likely refreshes the data, and `dispose` cleans up resources when you're finished with this service.

## Class CompletionValidationService

This service acts as a gatekeeper for completion names used throughout the system, making sure they're unique and properly registered. It keeps track of all allowed completion names and checks if a given name is valid whenever needed. 

You can think of it as a central registry; when a new completion name is introduced, you register it with this service. 

When an agent tries to use a completion, this service verifies that the name is actually registered, logging the process along the way.  To speed things up, it remembers which completions have already been validated.  It works closely with other parts of the system to ensure consistent completion name management.

## Class CompletionSchemaService

The CompletionSchemaService manages and organizes the completion schemas used by agents within the swarm system. Think of it as a central library for these completion routines, ensuring they are valid and easily accessible.

It uses a special registry to store these schemas, and it checks them for basic correctness before adding them. This service works closely with other parts of the system, like the agent schema service, the client agent, and the agent connection service, providing a reliable source for completion logic.

The service keeps track of what's happening with logging, which can be enabled or disabled.

Here's a breakdown of what you can do with it:

*   **Register a new schema:** Add a new completion routine to the library. It verifies the schema before adding it.
*   **Override an existing schema:** Update an existing completion routine.
*   **Get a schema:** Retrieve a specific completion routine by its name.



The underlying registry is managed using a specialized tool, and it’s designed to be consistent and efficient.

## Class ClientSwarm

This class, `ClientSwarm`, acts as a central manager for a group of AI agents working together. It's like a conductor leading an orchestra, ensuring everyone plays their part effectively.

It keeps track of which agent is currently active, manages a history of agent transitions (the navigation stack), and handles communication – both sending messages and waiting for responses. The system can gracefully cancel waiting operations and updates subscribers when agents change.

Think of it as a way to control and observe a team of AI agents, handling tasks like switching between them, processing their outputs, and making sure everything works in a coordinated and reliable way. It connects several services to orchestrate the agent's lifecycle and make sure that outputs are correctly communicated. If you need to switch agents, pause operations, or monitor their activity, this class provides the tools to do so. When finished with the swarm, the `dispose` method cleans up resources.

## Class ClientStorage

This class manages how data is stored and retrieved within the AI agent swarm system. It allows for storing items, removing them, and searching for similar items based on their embedded representations.

It works by keeping track of items internally and using a queue to handle storage changes, ensuring things happen in order.  When you add or change an item, it also creates a "fingerprint" (an embedding) to help with similarity searches.

Here's a breakdown of what you can do with it:

*   **Store Data:**  You can add new items or update existing ones.
*   **Remove Data:**  You can delete items.
*   **Clear Everything:** You can wipe the storage clean.
*   **Search for Similar Items:**  You can search for items that are similar to a given search term, using the embedded representations to find close matches.
*   **Quick Lookups:** Easily retrieve items by their unique identifier.
*   **List Items:** Retrieve all items, potentially filtering them based on specific criteria.
*   **Clean Up:**  When you’re done using the storage, it can be properly cleaned up and disconnected.

Essentially, it’s the central place for managing your data and finding what you need within the swarm.

## Class ClientState

The ClientState class manages the data and behavior of a single state within your AI agent swarm. Think of it as a container for the information an agent needs to function, and it handles how that information is read, written, and shared.

It keeps track of state changes and notifies other parts of the system when those changes happen, using a system of events.  The class is designed to work safely even when multiple agents or tools are trying to access and modify the state at the same time.

To get started, it receives initial setup information through a constructor.  Key features include:

*   **Reactive Updates:** It provides a way for other components to react to changes in the state.
*   **Safe Operations:** It uses a queue to ensure that all state modifications happen in a controlled order.
*   **Lifecycle Management:** It provides methods for initializing, resetting, and cleaning up the state.



When you need to change the state, you're using the `setState` or `clearState` functions. Retrieving the current state happens through the `getState` function.  Finally, `dispose` ensures proper cleanup when the state is no longer needed.

## Class ClientSession

The `ClientSession` class is central to how clients interact with the AI agent swarm. Think of it as a dedicated workspace for each client, managing all their interactions with the swarm's agents.

It's responsible for handling messages – from receiving them, validating them, executing them with the agents, and sending responses back. This class enforces rules and keeps a record of everything that happens within the session.

Here's a breakdown of what it does:

*   **Message Handling:** It receives messages, validates them, sends them to agents for execution, and sends back the results.
*   **Policy Enforcement:** It checks messages against defined rules before acting on them.
*   **History Tracking:** It records all user messages, agent actions, and tool outputs for later review or debugging.
*   **Connection Management:** It facilitates real-time communication between the client and the swarm.
*   **Session Lifecycle:** It handles setup and cleanup of each client’s workspace.

Key methods let you:

*   **`execute()`:** Run a message through the swarm's agents, following all rules.
*   **`run()`:** Quickly perform a task using an agent without needing to validate or emit the result.
*   **`commitToolOutput()`:** Log tool outputs, connecting them to specific tool calls.
*   **`connect()`:**  Set up the communication channel for a client to send and receive messages.
*   **`dispose()`:** Clean up the session when it's no longer needed.



Essentially, `ClientSession` creates a structured and controlled environment for clients to leverage the power of the AI agent swarm.

## Class ClientPolicy

This class manages rules and restrictions for clients connecting to the swarm system. Think of it as a gatekeeper, ensuring only authorized and well-behaved clients are allowed to participate. It handles things like banning problem clients, validating messages they send and receive, and generally making sure everyone follows the established guidelines.

The system intelligently loads ban lists only when needed, and it provides customizable messages to explain why a client might be blocked. This class works closely with other components – like the connection services, client agents, and the event bus – to enforce these policies and keep the swarm secure. Banning and unbanning clients are supported, and these actions can be automated based on validation failures.

## Class ClientOperator

The ClientOperator acts as a bridge for interacting with an AI agent swarm. It's responsible for sending instructions and receiving responses, essentially managing the flow of communication. 

You can think of it as the main controller, taking inputs and orchestrating actions within the agent system. Some of its functions, like running, committing tool output, and committing assistant messages, are currently unavailable, meaning they won’t perform any action. 

Key actions it *does* support include sending developer messages, user messages, and assistant messages, as well as committing agent changes and properly cleaning up resources when finished with the `dispose` method. The `execute` method is used to send a message along with a specified execution mode. `waitForOutput` lets you pause and wait for a response from the agent system.

## Class ClientMCP

The ClientMCP class is your go-to for working with tools and their operations within the agent swarm. Think of it as a manager for tools, keeping track of which tools are available to which agents.

You can use it to see a list of all the tools an agent has access to, or quickly check if a particular tool exists for a specific agent. It also allows you to refresh the tool list, ensuring you have the latest available options.

When you want an agent to use a tool, you're using this class – it handles the call and returns the result. 

Finally, when an agent is done, the ClientMCP lets you clean up and release any resources that were being held.

## Class ClientHistory

This class manages the history of messages for a specific agent within the swarm system. It’s responsible for storing, retrieving, and filtering these messages, and it keeps the system informed about changes through events.

Think of it as a logbook for each agent, but with some smarts. It lets you easily get a list of messages for an agent, either as raw data or as a carefully prepared list for use in generating responses. It also handles the cleanup when an agent is no longer needed.

The history uses a filter to show only the messages relevant to a particular agent, and it can limit the number of messages kept to save resources. You can request all available messages, or a filtered and formatted view specifically designed for the agent's use. When an agent finishes its work, this class makes sure to clean up its associated history data.

## Class ClientCompute

This class handles the computations on the client side, keeping track of data and responding to changes. It's responsible for fetching data, recalculating when needed, and cleaning up when it's no longer required.

You create an instance with some initial parameters to configure its behavior. 

The `getComputeData` method is used to retrieve the computed data, and it intelligently caches the results for efficiency. The `calculate` method will force a recalculation based on a particular state changing. An `update` method allows for manually forcing a recomputation. Finally, `dispose` ensures everything is cleaned up, unsubscribing from state updates and triggering a final cleanup routine.

## Class ClientAgent

The `ClientAgent` is the core component that handles messages and tool calls within the agent swarm system. It's responsible for taking an incoming message, processing it, and generating a response, all while keeping track of history and coordinating with other services.

Think of it as a worker that receives instructions (messages), decides what to do (maybe use tools), and then sends the results back. To avoid conflicts, it queues up these actions to prevent overlapping tasks.

The agent relies on several support services to manage connections, history, tools, completions, swarm coordination, and event handling. It also uses a system for tracking changes and errors internally.

Here's a breakdown of what it can do:

*   **Receive and Process Messages:** It takes user input, figures out if any tools are needed, and executes the task.
*   **Tool Management:** It resolves available tools, manages their lifecycle, and can even stop them if needed.
*   **Error Recovery:** If something goes wrong, it can try to recover by flushing, re-attempting, or using custom strategies.
*   **History Tracking:** It keeps a record of all interactions, including user messages, tool calls, and system updates.
*   **Event Emission:**  It broadcasts events to other parts of the system, like when a tool call completes or an agent needs to change.
*   **Cleanup:** When it's finished, it can properly shut down and release resources.

The `ClientAgent` also provides ways to manually control the process, such as committing messages to the history, flushing the history, or signaling agent changes. This allows developers to debug and understand the flow of execution.

## Class ChatUtils

The `ChatUtils` class helps manage and control chat sessions for different clients within a swarm. It provides a way to create, send messages to, and ultimately clean up chat instances.

Think of it as a central hub for handling all the chat-related activity. It allows you to specify how chat instances are created and what actions are performed during their lifecycle.

You can start a chat session using `beginChat`, send messages with `sendMessage`, and properly shut down sessions using `dispose`. The `listenDispose` function lets you react when a chat session is being closed.

The `useChatAdapter` function lets you define which class will be used to generate chat instances. Similarly, `useChatCallbacks` enables you to customize what happens during the chat instance lifecycle by providing specific callback functions.

## Class ChatInstance

This class represents a single chat session within a swarm of AI agents. Think of it as one conversation happening as part of a larger coordinated effort. 

When a chat session is created, it’s given a unique identifier (clientId) and associated with a specific swarm (swarmName).  It also has a way to be properly shut down later (onDispose) and can optionally receive callbacks for certain events.

You can start a chat using `beginChat`, send messages with `sendMessage`, and importantly, the system automatically monitors activity to keep chats alive or to terminate them if they become inactive.  When you're finished, `dispose` cleans everything up. Finally, `listenDispose` lets you register to be notified when the chat session ends.

## Class BusService

The `BusService` acts as the central communication hub for the swarm system, allowing different parts of the system to talk to each other via events. Think of it like a sophisticated messaging system.

It lets other components *subscribe* to specific types of events happening within the system, and then notifies them whenever those events occur.  You can even subscribe to *all* events of a certain type, making it easy to monitor what’s happening across the entire system.

The system keeps track of these subscriptions efficiently, so it doesn't waste resources creating new connections unnecessarily.  It also makes sure that events are only sent to clients who are still actively participating.

There are convenient shortcuts for common events, like marking when an execution starts or finishes, simplifying the code that needs to send those notifications. When a client is no longer needed, the `BusService` can automatically clean up all of its subscriptions, freeing up resources. The whole process is logged for tracking and debugging.

## Class AliveService

This class helps keep track of which clients are currently active within your AI agent swarms. Think of it as a heartbeat monitor for your agents. 

You can use it to tell the system when an agent comes online (`markOnline`) or goes offline (`markOffline`), specifying the agent's ID and the swarm it belongs to. The system remembers this status, potentially saving it for later, depending on how it's configured. The `loggerService` property provides a way to keep track of these online/offline events.

## Class AgentValidationService

The AgentValidationService is responsible for making sure all the agents in your swarm system are properly configured and compatible. It keeps track of agent schemas, dependencies, and the resources they use, like storage and states.

Think of it as a central hub that verifies agents before they're allowed to join the swarm. It works closely with other services like the AgentSchemaService (which manages agent blueprints), and ToolValidationService (for checking tools).

Here’s a breakdown of what it does:

*   **Registration:** You add agents to the service using `addAgent`, providing their configuration details.
*   **Validation:** The `validate` function checks that an agent's configuration is correct, taking into account its completion, tools, and storage.
*   **Resource Lists:** It provides methods to retrieve lists of resources associated with agents, such as their storage and state names.
*   **Dependency Tracking:** It manages dependencies between agents, ensuring that agents have the resources they need from other agents.
*   **Performance:** It uses memoization to cache results and speed up validation checks, so you don't have to re-validate everything repeatedly.



The service keeps track of agent configurations, makes sure they meet requirements, and provides tools to check which resources each agent is using.

## Class AgentSchemaService

This service acts as a central library for defining and managing the blueprints for your AI agents. It’s responsible for storing and organizing the information needed to create and run those agents within the swarm. Think of it as a master list of agent types, detailing what each agent needs to do, what resources it uses, and how it interacts with others.

It checks to make sure these agent blueprints are structurally sound before they’re used and keeps track of them in a well-organized registry. This helps ensure consistency and reliability across the entire system. You can register new agent types, update existing ones, and easily retrieve them when needed. It's tightly integrated with other parts of the system, like the agent connection and swarm configuration services, to ensure everything works together seamlessly.  Information about these operations is logged to help with troubleshooting and monitoring.

## Class AgentPublicService

This class, `AgentPublicService`, acts as the main gateway for interacting with agents within the swarm system. Think of it as a middleman that handles requests and makes sure everything happens in a controlled and logged way.

It relies on other services like `AgentConnectionService` for the actual agent operations and adds extra layers of context and logging. You’ll find that many methods mirror the functionality you’re familiar with from `ClientAgent` – things like running commands (`run`), executing specific actions (`execute`), and committing messages to the agent's history.

Essentially, this service provides a standardized and monitored way to manage agents, track their usage, and ensure consistency across the system. It's like having a well-organized control panel for your agents, ensuring everything is done safely and efficiently. Each method provides structured operations for interacting with the agents, including committing messages, running commands, and disposing of agents when they're no longer needed.

## Class AgentMetaService

The AgentMetaService helps manage information about agents within the system and transform it into a visual representation using UML diagrams. Think of it as a tool for understanding the relationships and structure of different agents.

It builds a tree-like structure of agent information – dependencies, states, tools, and more – pulling data from other services like the AgentSchemaService. This tree can be created in detail or with a simplified view of just dependencies.

The service then converts this structure into a standardized UML format, which is used to generate diagrams for documentation and debugging.  It logs its actions for increased transparency, and integrates with other system components like the documentation service to automatically generate these visual aids.

## Class AgentConnectionService

This service acts as a central hub for managing connections and operations related to AI agents within a swarm system. Think of it as the control panel for your agents. It efficiently reuses agent instances, caches them for performance, and handles various tasks like logging, tracking usage, and interacting with other services that manage history, storage, and configuration. 

The `getAgent` method is key—it's how you get a specific agent working, reusing previously created ones to save resources.  You can then use methods like `execute`, `run`, and `waitForOutput` to interact with the agent, while other methods provide fine-grained control over its workflow, like committing messages to its history or stopping tool execution.  Finally, `dispose` ensures everything is cleaned up properly when an agent is no longer needed.


## Class AdvisorValidationService

This service helps ensure your AI advisors are properly set up and ready to work. It keeps track of the expected structure (schema) for each advisor you're using. 

You can add advisor schemas using the `addAdvisor` method, which essentially registers what each advisor *should* look like. 

Then, when you want to check if an advisor is valid, use the `validate` method to verify its structure against the registered schema. This helps catch potential configuration errors early on. The `loggerService` is used internally for logging any issues encountered during validation.

## Class AdvisorSchemaService

This service helps manage and organize the blueprints for your AI agents, called advisor schemas. Think of it as a central repository where you store and update the instructions that guide each agent. 

It provides a way to register new advisor schemas, allowing you to add new agent types to your system. You can also update existing schemas, making changes without losing the original data. 

Need to find a specific agent's blueprint? The service provides a simple way to retrieve it using a unique identifier. The service also keeps track of schema-related information and uses a logging service to provide insights into operations.

## Class AdapterUtils

This class provides convenient tools for connecting your agent swarm to different AI models. It essentially acts as a bridge, allowing you to easily use various AI services like Hugging Face, Cortex, Grok, Cohere, OpenAI, LMStudio, and Ollama without needing to write custom integration code for each one.

Each function within this class – `fromHf`, `fromCortex`, `fromGrok`, `fromCohereClientV2`, `fromOpenAI`, `fromLMStudio`, and `fromOllama` – creates a ready-to-use function for interacting with the corresponding AI provider's chat completions API. You can specify the model you want to use with most of these functions, and some also allow you to configure things like the response format or base URL.  This simplifies the process of plugging different AI models into your swarm.

## Class ActionSchemaService

This service keeps track of which action tools are available for your AI agent swarm. 

It allows you to register new tool names, essentially letting the system know about a new type of action an agent can perform. 

You can also check if a specific tool name has already been registered. 

The system also logs these registration and lookup operations for informational purposes, if enabled in the global configuration.

# agent-swarm-kit interfaces

## Interface ValidationResult

This object represents the outcome of validating arguments passed to a tool within the agent swarm. It tells you whether the arguments were valid or not.

If the validation was successful, you’ll find the parsed and validated data within the `data` property. If something went wrong during validation, you’ll see a descriptive error message in the `error` property. The `success` property simply indicates the overall status – true for success, false for failure.

## Interface TAbortSignal

This interface builds upon the standard web `AbortSignal` – you know, the thing that lets you cancel things like network requests – to give it a bit more structure within our system. Think of it as a way to signal that something should be stopped, but with extra type safety. You can adapt it to include custom features if your application needs something beyond the basic cancellation functionality.

## Interface JsonSchema

This describes a standard JSON Schema, which is a way to define the structure of JSON data and validate that it conforms to that structure. 

Think of it like a blueprint for your JSON – it outlines what fields are expected, what data types they should be, and whether there are any rules about extra fields being allowed. 

The `type` field simply indicates the kind of schema it is (like a string, number, or object). 

`properties` lists the expected fields and what kind of data each field should contain. 

`required` tells you which fields absolutely must be present in the JSON data.

Finally, `additionalProperties` gives you control over how strict the validation should be – you can allow extra fields or demand a very precise structure.

## Interface ITriageNavigationParams

This interface defines the settings you can use to create a new tool for your AI agents to use. You specify the tool's name and a description of what it does. You can also add a helpful note for documentation purposes. Finally, you can define a function that decides whether the tool should be available to certain agents or under specific conditions – allowing for dynamic tool access.

## Interface IToolRequest

This interface defines what's needed to ask the system to run a specific tool. Think of it as a way for an agent to say, "Hey, I need to use the 'search' tool, and I want to pass in the query 'example'." It outlines which tool you want to use (identified by its name) and the specific details, or parameters, that the tool needs to work correctly. These parameters ensure the tool receives the right kind of information it expects.

## Interface IToolCall

This interface describes a request to use a tool within the agent system. Think of it as a specific instruction for an agent to run a particular function with certain inputs. Each tool call has a unique ID to keep track of it, and currently, all calls are for functions – the system is designed to work with functions as its primary tool type. The `function` property contains the name of the function and any arguments it needs to operate, which come directly from the model's instructions.

## Interface ITool

ITool defines what a tool looks like within our system, acting as a blueprint for what agents can use. Think of it as a standardized description that tells the AI what functions are available and how to use them. 

Each tool has a `type`, which is currently always "function," and more detailed `function` information including its name, a description of what it does, and a precise specification of the parameters it accepts. This parameter specification is critical; it allows the AI to understand what inputs are needed to correctly use the tool. This interface is used when configuring agents and when the AI decides which tools to call.

## Interface ISwarmSessionCallbacks

This interface lets you listen in on important events happening within your AI agent swarm. You can use it to track when agents connect, when they's executing commands, when messages are being sent, and when sessions are beginning or ending. Think of it as a way to get notified about what's happening behind the scenes and potentially respond to those events, like logging connection details or triggering specific actions. It provides a series of optional functions – `onConnect`, `onExecute`, `onRun`, `onEmit`, `onInit`, and `onDispose` – that you can implement to receive these notifications.

## Interface ISwarmSchema

This interface helps you define how your AI agent swarm will operate. Think of it as a blueprint for creating a specific swarm. 

You can use it to give your swarm a name and specify which agents are available to it. It lets you set a default agent that will be active unless otherwise specified.

The interface also lets you customize behavior like saving the swarm's progress or controlling which agents are allowed to participate, and even define how the swarm remembers where it has been and how it selects which agent is currently in charge. You can also provide functions to manage the agent list and the current navigation path.

## Interface ISwarmParams

This interface defines the settings needed to get a swarm of AI agents up and running. Think of it as the blueprint for creating your swarm.

It requires a unique identifier for the client initiating the swarm, a way to log events and errors, a communication channel for agents to talk to each other (the bus), and a list of the agents that will be part of the swarm. Basically, you need to tell the system *who* is creating the swarm, *how* to track what’s happening, *how* agents will communicate, and *which* agents will participate.

## Interface ISwarmMessage

This interface defines the structure of a message used for communication within the agent swarm. Think of it as a standardized way for different agents, tools, and the system itself to exchange information. Each message is linked to a specific agent through its `agentName`, helping to track the flow of communication. 

The `mode` property indicates where the message originated - either from a user interaction (`"user"`) or from a tool or system action (`"tool"`). Finally, the `payload` allows for including extra details or data alongside the core message content, providing more context when needed.

## Interface ISwarmDI

The `ISwarmDI` interface acts as a central hub, providing access to all the key services that power the agent swarm system. Think of it as a toolbox containing everything needed to manage and interact with the swarm.

It's divided into several categories:

**Connectivity & Storage:** It handles connections to agents, historical data, sessions, storage, shared storage, state, shared state, compute, shared compute, policies, and MCPS. This lets you manage how the swarm interacts with external systems and persists data.

**Schemas & Validation:** It manages definitions for agents, tools, swarms, completions, embeddings, storage, state, policies, MCPS, compute, advisors, pipelines, and execution paths. It also provides validation services to ensure data integrity.  This helps to enforce rules and constraints on how different components behave.

**Context Management:** It provides services for tracking method, payload, execution, and schema-level context. This allows for debugging, tracing, and better understanding of the swarm's operations.

**Public APIs:** It exposes public interfaces for interacting with various aspects of the swarm, such as agent execution, historical data, sessions, storage, and more.

**Metadata:**  It manages metadata for agents and the overall swarm, providing a way to track and configure their behavior.

**Performance:** It includes services for monitoring and recording performance metrics, allowing you to identify bottlenecks and optimize performance.

**Liveness:**  It offers services to ensure the swarm components stay operational.



In essence, `ISwarmDI` is the foundation upon which the entire swarm system is built, providing all the necessary components and services for its operation.

## Interface ISwarmConnectionService

This interface outlines the public methods available for connecting to and managing a swarm of AI agents. Think of it as the blueprint for how you'll interact with the swarm – setting up connections, monitoring status, and ensuring it's ready for tasks. It's designed to keep the core, internal workings of the swarm hidden, exposing only the essential controls for external use. By sticking to this interface, developers can confidently build tools and integrations that work with the agent swarm.

## Interface ISwarmCompletionArgs

This interface defines the information needed to request a chat completion from your AI agent swarm. Think of it as the recipe for telling the system what you want the agent to do and with what context.

You'll specify which agent is handling the request using the `agentName` property. The `mode` property tells the system whether the last message came from a tool or directly from a user, which is important for the agent's understanding of the conversation flow. Finally, the `tools` array lets you provide a list of functions or external systems the agent can use to fulfill the request.

## Interface ISwarmCallbacks

This interface lets you listen in on important events happening within your AI agent swarm. Specifically, it notifies you whenever an agent’s role or function changes inside the swarm – you'll get details about the agent's ID, its new name, and the overall swarm name. Think of it as a way to keep track of how your agents are dynamically shifting their tasks and responsibilities. You can use this information to update a dashboard, adjust your system’s behavior, or simply log these transitions for debugging.

## Interface ISwarm

This interface lets you interact with a group of AI agents working together. You can use it to get the name or the agent itself that's currently leading the effort. It provides ways to manage the flow of work, like canceling a process or waiting for the agents to finish their task. You can also tell the swarm to send messages and check if it’s currently busy with something. Essentially, it gives you control over how the agents coordinate and deliver results.

## Interface IStorageSchema

This interface outlines how your AI agents will store and manage data. It lets you define things like whether the data is saved permanently, add helpful descriptions for documentation, and control whether the storage is accessible by all agents or just a specific one.

You can customize how data is retrieved and saved, or provide default data for storage. It also specifies the method for creating indexes, which helps agents find the information they need quickly. Finally, you can set up callbacks to be notified of important storage events and tailor the storage's behavior even further.

## Interface IStorageParams

This interface defines how the system manages data storage for AI agents. It specifies important settings like the client identifier, a method for comparing embeddings (numerical representations of text), and functions to save and retrieve pre-computed embeddings – effectively caching them to speed up later processes. You'll also find ways to create new embeddings and track what's happening through logging and event communication within the larger AI agent system. The storage also has a unique name to identify it within the swarm.

## Interface IStorageData

This interface describes the basic structure of information that's saved within the system. Every piece of data stored will have a unique identifier, called `id`, which acts like a name tag so you can find it again or delete it later. Think of it as the primary key for each item you're keeping track of.

## Interface IStorageConnectionService

This interface helps define how your AI agents can connect to storage systems, but specifically focuses on the parts you want to expose publicly. It's a tool to create a clear, standardized way for agents to interact with storage, ensuring everyone understands the available connection methods and what they can do. Think of it as a blueprint for building secure and reliable storage connections for your agent swarm.

## Interface IStorageCallbacks

This interface helps you stay informed about what's happening with your data storage. You can register functions to be notified when data is changed, when searches are performed, or when the storage is first set up and later taken down. Think of it as a way to react to important moments in your storage’s lifecycle—like getting a notification whenever data is added, removed, or when the storage itself is ready or being shut down. These notifications include details like which client is interacting with the storage and the storage's name.

## Interface IStorage

This interface lets you manage the data your AI agents are using – think of it as a central place to store and retrieve information. You can fetch items related to a specific search term, add new information or update what's already there, and delete items you no longer need. It also allows you to retrieve a single item by its unique identifier, list all the stored items (with the ability to filter them), and completely clear the storage if necessary. This API provides the building blocks for keeping your agent swarm's knowledge base organized and accessible.

## Interface IStateSchema

This interface outlines how a piece of information, or "state," is managed within the agent swarm. Think of it as defining the rules and structure for a specific data point that agents might need to share or track.

You can decide if that state should be saved persistently, add a description to help understand its purpose, and specify if other agents should be able to access it.  The `stateName` is its unique identifier.

There are also functions you can provide to control how the initial state is created (`getDefaultState`) and how its current value is retrieved (`getState`), as well as how it’s updated (`setState`).  `middlewares` allows you to hook into state changes, and `callbacks` provide a way to react to events related to the state.

## Interface IStateParams

This interface defines the information needed to manage a state within our AI agent swarm system. Think of it as a container for essential details like which client this state belongs to, a way to track what's happening (through a logger), and a communication channel (the bus) to share information with other parts of the swarm. Each state will have its own set of these parameters, ensuring everything runs smoothly and everyone stays informed.

## Interface IStateMiddleware

This interface lets you hook into how the agent swarm's internal state changes. Think of it as a way to observe and potentially adjust the swarm's data as it’s being updated – maybe you want to log changes, enforce specific rules, or even modify the data itself before it’s finalized. It's a powerful tool for controlling and understanding the state of your agent swarm.

## Interface IStateConnectionService

This interface helps define how different parts of the system connect and share information about the agent swarm's current state. Think of it as a blueprint for making sure everyone involved knows what's happening – it focuses on the essential details that need to be shared publicly, leaving out the technical specifics used internally. It's designed to make sure the overall system behaves predictably and consistently when managing a group of AI agents.

## Interface IStateChangeEvent

This interface lets different parts of your AI agent swarm orchestration framework react to changes in the system's state. Think of it as a way to be notified whenever something significant changes, like moving from a planning phase to an execution phase. You can subscribe to these notifications to update displays, trigger actions, or adjust agent behavior based on the current state of the swarm. It uses a 'subject' pattern, allowing components to easily listen for and respond to these state changes.

## Interface IStateChangeContract

This interface defines how changes to the system's state are communicated. It provides a way for other parts of the framework to be notified whenever a state changes. Specifically, it uses a "subject" that sends out the name of the state that was updated, allowing interested components to listen for and respond to those changes. Think of it as a notification system for state updates.

## Interface IStateCallbacks

This interface lets you listen in on important moments in a state’s life cycle. You can use it to react to when a state is first created, when it’s being cleaned up, or when its data is loaded, read, or written. Think of these callbacks as notifications – you define functions to run when a state goes through these different stages, allowing you to perform actions like logging, setting up resources, or responding to data changes. Each callback provides information like the client identifier and state name, so you know exactly which state is involved.

## Interface IState

This interface lets you manage the agent swarm's current situation – think of it as a central record of what’s happening. You can easily check what the current state is using `getState`, allowing you to monitor the swarm’s progress.

When you need to make changes, `setState` lets you update the situation, but it does so in a controlled way, letting you calculate the new state based on what was there before.

Finally, `clearState` provides a way to completely reset everything back to the beginning, effectively restarting the swarm's progress.

## Interface ISharedStorageConnectionService

This interface outlines the public methods available for connecting to and interacting with shared storage. Think of it as a blueprint for how different parts of the system can talk to the storage – it focuses on the core actions like establishing a connection and retrieving data, while hiding the internal workings. It's designed to provide a consistent and predictable way to manage shared storage within the agent swarm.

## Interface ISharedStateConnectionService

This interface helps define how different agents in your swarm can share information and coordinate their actions. Think of it as a blueprint for a service that lets agents reliably pass data back and forth. It’s designed to ensure that the publicly accessible parts of this sharing service are clearly defined and consistent, hiding some of the internal workings. Essentially, it's about creating a predictable and user-friendly way for agents to collaborate.

## Interface ISharedComputeConnectionService

This interface defines how different parts of the system can connect to and share computing resources. Think of it as a standardized way to access the underlying infrastructure that powers the AI agents, ensuring everyone plays nicely together. It builds upon the base `SharedComputeConnectionService`, adding TypeScript-specific type safety for more reliable code.

## Interface ISessionSchema

This interface, called `ISessionSchema`, is like a blank slate right now. Think of it as a promise for things to come – it's designed to hold information related to individual sessions in the AI agent swarm, but for now, it doesn't have any specific properties defined. It’s a placeholder that will be expanded in future versions to allow for customized session configurations.

## Interface ISessionParams

This interface defines all the information needed to start a new session within your AI agent swarm. Think of it as a blueprint for creating a session - it specifies who's using it (clientId), how to track what's happening (logger), the rules the session must follow (policy), and how the agents will communicate with each other (bus and swarm). It also identifies which specific swarm this session is a part of (swarmName). Essentially, this interface bundles all the essential components needed for a session to function correctly within the larger swarm system.

## Interface ISessionContext

This interface outlines the information available during a session within the AI agent swarm. Think of it as a container holding details about who initiated the session (the client), what task is currently being performed (the method), and the environment in which everything is running.

You’ll find a unique ID for the client session, a way to identify the specific swarm process currently active, and access to data related to the method being executed and the overall execution state. If a method or execution isn’t currently happening, those sections will simply be empty.

## Interface ISessionConnectionService

This interface helps ensure that the public-facing parts of your agent swarm orchestration system are clearly defined and consistent. It's a blueprint for how connections to sessions should work, specifically designed to be a clean, type-safe version without any internal workings. Think of it as the official promise of what users of your system can expect when interacting with session connections.

## Interface ISessionConfig

This interface lets you define how long a session should run or how frequently it can be executed. You can specify a `delay` to control the session’s duration or repetition schedule. 

If you need to clean up anything specific when a session ends, you can also provide an `onDispose` function that gets called automatically during session teardown. Think of it as a way to say goodbye to resources when a session is over.

## Interface ISession

The `ISession` interface defines how you interact with a single conversation or workflow within the agent swarm. It provides methods for sending messages, triggering actions, and managing the session's state. 

You can use `commitUserMessage` to add a user's input to the conversation without immediately prompting a response from the agents. Similarly, `commitAssistantMessage` allows you to manually add a message from the agents to the chat history. System, developer, and tool messages can also be manually added to the history.

To clear the entire conversation history and reset the agents, use `commitFlush`. If you need to prevent a tool from running, use `commitStopTools`.

The `notify` function sends messages to listeners, useful for real-time updates. `emit` sends a message to the core communication channel.

`run` allows you to perform a quick calculation or preview something without altering the ongoing conversation. For standard execution that potentially updates the conversation history, use `execute`.

`connect` establishes a two-way communication link, providing functions for sending and receiving messages. Tool interactions are managed through `commitToolOutput` (for adding tool results) and `commitToolRequest` (for requesting tool use).

## Interface IScopeOptions

This interface, IScopeOptions, helps you configure how a specific task or set of tasks within your AI agent swarm will run. Think of it as a little instruction manual for each operation.

You've got a `clientId` which is like a name tag to keep track of the operation, and a `swarmName` which tells the system which group of agents to use.

If something goes wrong, the `onError` function allows you to define what happens - you can catch and deal with errors gracefully.

## Interface ISchemaContext

This interface acts as a central hub for accessing various schema services that define how agents and their interactions work within the system. Think of it as a directory containing different registries, each responsible for a specific kind of schema, like agent definitions or message formats. It allows you to easily find and use the information needed to build and manage your agents and their communication.

## Interface IPolicySchema

This interface describes how to define and configure policies within the agent swarm. It lets you specify rules and actions, like banning clients, to enforce certain behaviors. 

You can choose to save banned clients to persistent storage, provide descriptions for documentation, and give each policy a unique name.  You can also customize the message displayed when a client is banned.

The framework allows you to automate the banning process or provide your own functions to determine if an incoming or outgoing message should be blocked. You also have the option to manage the list of banned clients directly or define how that list is retrieved.  Finally, you can provide callbacks to extend the policy's functionality and tailor validation or ban actions.

## Interface IPolicyParams

This interface defines the information needed to set up a policy within the agent swarm. Think of it as a blueprint for how a policy will operate. It includes a logger, which helps track what the policy is doing and any problems it encounters, and a bus, which allows the policy to communicate with other parts of the swarm. These components ensure the policy can function correctly and interact with the larger system.

## Interface IPolicyConnectionService

This interface helps define how different parts of the AI agent swarm orchestration framework connect and communicate based on predefined policies. Think of it as a blueprint for building reliable connections between agents, ensuring they follow established rules. It’s designed to create a clear, public-facing definition, hiding some of the internal workings to keep things organized and secure. Essentially, it’s a way to standardize how agents interact and make sure everything runs smoothly according to the set policies.

## Interface IPolicyCallbacks

This interface lets you plug into the policy management system to get notified about important events. You can use it to track what's happening with your policies. 

For example, you can receive a notification when a policy is first created (onInit). 

You can also monitor incoming messages as they're being checked against policy rules (onValidateInput) or outgoing messages before they’re sent (onValidateOutput). 

Finally, you'll be alerted when a client is banned (onBanClient) or unbanned (onUnbanClient), allowing you to respond to those actions programmatically. These callbacks provide flexibility to customize the policy enforcement process.

## Interface IPolicy

This interface defines how policies are enforced within the AI agent swarm. Think of it as the gatekeeper, controlling who can participate and what they can say.

You can use it to check if a client is currently blocked (`hasBan`), find out why they were blocked (`getBanMessage`), and ensure messages going in and out adhere to specific rules (`validateInput`, `validateOutput`). 

If needed, it also provides functions to actively block a client (`banClient`) or remove a block (`unbanClient`). This gives you fine-grained control over the swarm’s behavior and security.


## Interface IPipelineSchema

This interface describes the structure for a pipeline within the agent swarm orchestration framework. Every pipeline needs a name, identified by the `pipelineName` property. 

The core of the pipeline is the `execute` function, which dictates how the pipeline runs, taking a client ID, agent name, and data payload as input. 

Finally, `callbacks` are optional but incredibly useful; they let you add custom actions at different points during the pipeline's execution, like tracking progress or dealing with unexpected issues.

## Interface IPipelineCallbacks

This interface lets you hook into the different stages of a pipeline's lifecycle. You can use it to get notified when a pipeline begins running, when it finishes (whether successfully or with an error), and when something goes wrong during its execution. This allows you to build custom logging, monitoring, or other reactive behaviors around your agent swarm orchestration. Essentially, it's a way to be informed about what’s happening with your pipelines as they run.

## Interface IPersistSwarmControl

This framework lets you customize how your AI agent swarm's data is saved and loaded. Specifically, you can plug in your own methods for managing two key pieces of information: the active agents within a swarm and the navigation stacks they use. 

Think of it as swapping out the default way data is stored with something tailored to your needs—perhaps you want to use a database instead of a simple file, or store the information in memory temporarily. These controls allow you to define how that data persistence works, giving you flexibility and control over the swarm's overall behavior. You provide the code that handles saving and retrieving this information, and the framework integrates it seamlessly.

## Interface IPersistStorageData

This interface describes how data is saved and loaded for the agent swarm. Think of it as a container holding the actual data you want to store – it’s a simple list of items. The `data` property holds that list, and it can contain whatever kind of information your swarm agents need to remember between sessions. It's used by the system's tools for handling long-term storage.

## Interface IPersistStorageControl

This interface lets you tailor how data is saved and retrieved for a specific storage area. Think of it as a way to swap out the default storage mechanism with something you build yourself, like connecting to a database instead of using local files. You can use it to customize how the system handles saving and loading information related to a named storage space. This gives you greater control over data management and allows for more complex storage solutions.

## Interface IPersistStateData

This interface describes how to store information about the AI agents in your swarm. Think of it as a container for any data you want to save, like how each agent is configured or the status of a particular session. The `state` property holds the actual data, and it can be whatever type of information your swarm needs to remember. This allows the system to reliably save and retrieve agent details.

## Interface IPersistStateControl

This interface lets you fine-tune how your agent swarm's state is saved and retrieved. Specifically, it provides a way to swap out the default state persistence mechanism with your own custom solution. Think of it as a plug-in system for state management – if the standard way of saving isn’t quite what you need, you can provide your own adapter to handle the process, maybe to store the state in a database instead of a simple file. This gives you more control over how your swarm remembers things between sessions.

## Interface IPersistPolicyData

This interface helps manage which clients are restricted within a particular swarm. It’s designed to track a list of banned session IDs – essentially, the unique identifiers for clients – associated with a specific swarm. Think of it as a blacklist for individual clients participating in a swarm. The `bannedClients` property holds that list of session IDs.

## Interface IPersistPolicyControl

This interface lets you customize how policy data is saved and retrieved for your AI agent swarms. Think of it as a way to plug in your own system for managing that data, instead of relying on the default method. You can use this to store policy information in a database, a file, or even just keep it in memory for testing purposes. By providing your own persistence adapter, you have full control over where and how that policy data is managed.

## Interface IPersistNavigationStackData

This interface describes how we keep track of where a user has been when navigating between different AI agents within a group. Think of it as a navigation history – a list of the agent names they're visited. The `agentStack` property simply holds that list of agent names, allowing us to remember the order they were used within a specific swarm. It’s used by a utility function to automatically manage this history.

## Interface IPersistMemoryData

This interface helps the system remember things between runs. Think of it as a container for any information you want to save, like a snapshot of the agent's current situation or a record of a conversation. The `data` property holds this information, and it can be whatever type you need it to be, allowing for flexible memory management within the swarm. Essentially, it's a standardized way to package and store memory data so the system can recall it later.

## Interface IPersistMemoryControl

This interface lets you customize how memory is saved and loaded for each session. Think of it as a way to plug in your own system for handling memory persistence. You can use it to swap out the default memory storage with something that works better for your needs, like keeping memory in a database or even just in the browser's local storage. This is particularly useful if you want to experiment with different storage solutions or need more control over how memory is managed.

## Interface IPersistEmbeddingData

This interface describes how embedding data, which is essentially a set of numbers representing the meaning of text, is stored for later use by the AI agent swarm. Think of it as a way to remember the "essence" of different pieces of information. Each set of numbers is organized by a unique identifier for the text it represents, and is associated with a name. The `embeddings` property holds the numerical data that makes up this representation.

## Interface IPersistEmbeddingControl

This interface lets you tailor how embedding data is saved and retrieved. Think of it as a way to plug in your own custom storage solution instead of using the default one. You can use it to, for example, keep track of embeddings in memory, or use a different database for storing them. It provides a method to swap out the standard persistence mechanism with your own, giving you precise control over how your embedding data is managed.

## Interface IPersistBase

This interface helps manage how information is saved and loaded for the AI agent swarm. It provides ways to make sure the storage area is set up correctly, and then offers methods to read, check for the existence of, and write data – like agent states or memory – to files on your system. The system ensures that data is stored reliably and safely, preventing corruption and making sure the swarm can always access the information it needs.

## Interface IPersistAliveData

This interface helps keep track of whether your AI agents are currently active within a specific swarm. It's a simple way to know if a particular agent, identified by its session ID, is online or has gone offline within a named swarm. The key piece of information it provides is a boolean value – `online` – which is `true` when the agent is active and `false` when it’s not.

## Interface IPersistAliveControl

This interface lets you tailor how the system remembers whether an AI agent swarm is still active. 

Instead of using the default method for keeping track of an agent swarm's status, you can plug in your own custom logic. 

This is helpful if you need to store this information in a specific place, like a database or in-memory cache, or if you want to customize how the data is handled for a particular swarm. You provide the system with a blueprint for your custom storage, and it takes care of using it to manage the "alive" status.

## Interface IPersistActiveAgentData

This interface describes how we keep track of which agent is currently active for each client participating in a swarm. Think of it as a record associating a client with the specific agent they're currently working with. The `agentName` property simply stores the identifier of that active agent, like "agent1" or "task_coordinator". It's how the system remembers which agent is handling a client's requests.

## Interface IPerformanceRecord

This interface helps track how well a specific process is running within the AI agent swarm. It gathers performance data from all the clients involved, like individual agent sessions, so you can monitor the overall system health and spot any bottlenecks.

Each record includes things like a unique ID for the process itself, the total number of times it was executed, and the total and average response times. There are also timestamps to indicate precisely when the data was collected, allowing you to analyze performance trends over time. Think of it as a way to keep an eye on how efficiently your agents are working together. The 'clients' property breaks down the performance data for each individual client involved, offering a more detailed view of where issues might lie.

## Interface IPayloadContext

This interface, `IPayloadContext`, acts like a container for information about what's happening. Think of it as a package holding two key pieces: a `clientId` that identifies who requested the task, and a `payload` which contains the actual data being processed. This context allows the system to track where requests originate and manage the data associated with them effectively.

## Interface IOutlineValidationFn

This interface defines a function used to check if an outline operation is set up correctly. Think of it as a quality check – it takes some initial information and the actual data being processed, and determines if everything looks good to proceed. It’s a way to ensure the system is working as expected and catches potential problems early on in the process.


## Interface IOutlineValidationArgs

This interface helps you pass information to validation functions within your agent swarm orchestration. It combines standard outline arguments with a `data` property. Think of the `data` property as holding the result of a previous step in your agent's workflow—it's what you want to check for correctness or consistency. It's usually a structured piece of information, like a generated plan or a processed dataset.

## Interface IOutlineValidation

This interface describes how to validate data used in creating outlines. Think of it as a blueprint for checking if your outline information is correct. It lets you define a validation function – the actual logic to perform the check – and you can optionally add a description to explain what that validation does. This allows you to build reusable validation steps and document them clearly for others to understand.

## Interface IOutlineSchemaFormat

This interface helps you define the structure of your outline data using a standard JSON schema. Think of it as a way to tell the system exactly what your outline should look like, including the data types and rules it must follow. You specify the format type, which is usually "json_schema," and then provide the actual JSON schema object that defines the outline's structure and validation. This ensures consistency and helps prevent errors when working with outlines.

## Interface IOutlineSchema

This interface describes how to set up an "outline," which is a way to structure a task for an AI agent. Think of it like defining a specific recipe for the AI to follow.

You can specify a prompt, which is the initial instruction given to the AI. You can also provide system prompts, which are like background information or rules that guide the AI's behavior.

Each outline has a unique name for easy identification, and you can add descriptions to explain its purpose.  Validations are in place to ensure the AI's output is correct and follows a defined format.

You can also define how many times the AI should retry a task if there's an error, and you can add custom actions to be performed at different stages of the process. Finally, the `getOutlineHistory` function handles the processing of input parameters and previous history to generate the final data.

## Interface IOutlineResult

This interface describes what you get back after running an outline operation, like generating a structured plan. It tells you if the process was successful, provides a unique ID for tracking it, and keeps a record of all the messages exchanged during the process. You’ll find details about any errors encountered, the original input parameters, the generated data, and how many times the operation was attempted. Think of it as a complete log of what happened during outline generation.

## Interface IOutlineObjectFormat

This interface defines the structure of data used for outlining, essentially providing a blueprint for how the information should be organized. It ensures everyone's on the same page about what fields are necessary and what kind of data each field should hold. Think of it as a contract – it specifies the expected format, including mandatory fields and descriptions for each piece of information. The `type` property indicates the overall structure (like a JSON object), `required` lists the essential fields, and `properties` details each field’s data type and purpose.

## Interface IOutlineMessage

This interface defines the structure for messages within the outline system, which helps organize and track interactions like those between a user, an AI assistant, or the system itself. Think of it as a blueprint for how messages are formatted and stored to maintain a clear history of the conversation or process. It ensures that all messages follow a consistent format, making it easier to manage and understand the overall flow.

## Interface IOutlineHistory

This interface helps you keep track of the messages used during outline creation and modification. You can add new messages to the history one at a time or in batches using the `push` method. If you need to start fresh, the `clear` method lets you wipe the entire history. Finally, the `list` method gives you access to all the messages that have been recorded so far, letting you review or process them as needed.

## Interface IOutlineFormat

This interface defines the structure for how outline data should be formatted. Think of it as a blueprint that ensures all outline data adheres to a consistent shape, making it easier for the AI agents to understand and work with. It specifies the basic data type (like 'object'), lists which fields are absolutely necessary, and provides details about each field – what kind of data it holds and what it represents. Essentially, this helps keep everything organized and predictable within the agent swarm.

## Interface IOutlineCompletionArgs

This interface defines the information needed when you want an AI agent to provide a completion in a specific, structured JSON format. Think of it as telling the AI, "I want a response that looks like *this*." You’re essentially giving it a blueprint for the JSON it should generate. 

It requires you to specify two key pieces of information: the name of the JSON schema you expect (outlineName), and how the completion should be organized (format). This lets you get predictable and usable data from the AI's responses.

## Interface IOutlineCallbacks

This interface lets you hook into different stages of the outline creation process. You can use it to monitor what's happening behind the scenes – for example, logging when an attempt to create an outline begins, or tracking when a document is successfully generated. It also provides callbacks to react to the results of the validation process, whether the document passes or fails, allowing you to handle successes or trigger retries as needed. Essentially, it gives you a way to be notified and respond to key events during outline creation.

## Interface IOutlineArgs

This interface defines the information needed when performing an outline task. Think of it as a package containing everything the system needs to work with a specific outline request. It includes the actual input parameter being processed, a counter to track how many times the process has been tried, the desired format of the output, and a way to access the message history related to this outline. Essentially, it provides context and data for the outline operation to run smoothly.

## Interface IOutgoingMessage

This interface describes a message being sent *out* from the agent swarm system to a client. Think of it as a package of information delivered to a specific agent.

Each message has a `clientId` which is like an address, ensuring the message reaches the correct agent. The `data` is the actual content of the message - this could be a response, a result, or any other information the system wants to share. Finally, `agentName` tells you which agent within the swarm created and sent this message.

## Interface IOperatorSchema

This function lets you link the agent swarm's activity to an operator dashboard, allowing human oversight. It essentially creates a channel where messages from the agents are sent to the dashboard. The dashboard can then respond and influence the agents' actions, providing a way to guide and monitor their work in real-time. You provide a client identifier and the agent's name to establish the connection.

## Interface IOperatorParams

This interface defines the essential information needed to configure and run an operator within the agent swarm. Think of it as a blueprint for setting up each individual agent. 

It includes things like the agent's name, a unique client identifier, a logging mechanism to track what's happening, a communication bus to send messages around the swarm, and a history service to remember past interactions. The history service is particularly important as it allows agents to refer back to previous conversations, providing context and enabling more informed responses.

## Interface IOperatorInstanceCallbacks

This interface defines the events you can listen for when working with individual agent instances within your AI agent swarm. Think of it as a way to be notified about what's happening with each agent.

You’re notified when an agent is first set up (`onInit`), when it provides an answer to a question (`onAnswer`), or when it receives a message (`onMessage`).  You also get callbacks when an agent is shut down (`onDispose`) and when it sends a notification (`onNotify`).  By implementing this interface, your system can react to the actions and status changes of each agent in the swarm.

## Interface IOperatorInstance

This interface defines how you interact with a single agent within a larger swarm system. Think of it as a set of tools for communicating with and managing one agent at a time. 

You can use `connectAnswer` to set up a way for the agent to send responses back to your application. To actually send information to the agent, use `answer`. `init` gets things started – it establishes the initial connection with the agent. 

There's also `notify` to send simple messages and `recieveMessage` to receive incoming messages from the agent. Finally, `dispose` cleanly shuts down the agent’s connection when you’re finished with it.

## Interface IOperatorControl

This interface gives you the ability to customize how your AI agents, acting as operators, behave and interact within the system. 

You can configure what actions the operators will respond to and how they'll do it by setting callbacks. Think of these callbacks as defining the rules of engagement for each operator. 

Alternatively, if you need even more control, you can provide your own custom adapter, essentially replacing the default behavior with your own specialized logic. This lets you deeply tailor the operator's functionality to your specific needs.

## Interface INavigateToTriageParams

This interface helps you customize how your system handles moving between different AI agents, specifically when directing a conversation to a triage agent. You can define specific messages or actions to occur at different points in this process.

Before a move to the triage agent begins, you can use `beforeNavigate` to perform checks or setup. `lastMessage` allows you to adjust the content of the previous user message when the move happens.

If navigation fails and a session reset is needed, `flushMessage` lets you provide a helpful message. If no navigation is necessary and the conversation should just continue, `executeMessage` helps shape that feedback.

Finally, `toolOutputAccept` is for giving positive confirmation when the move is successful, while `toolOutputReject` explains why a move wasn't needed – informing the user they're already where they need to be.

## Interface INavigateToAgentParams

This interface helps you tailor how your AI agent swarm navigates between agents. You can use it to add custom messages or actions at different points in the navigation process.

Before an agent navigates to a new destination, you can run a function with details like the client ID and the previous user message. If navigation fails and a reset is needed, you can define a message or a function that determines what gets sent to reset the session. Similarly, when an agent successfully navigates, you can provide a message or function to give feedback to the model about this action.

You can also customize how the last user's message is used in the navigation context, and define specific messages or functions that should be executed or emitted depending on whether the navigation involves actual agent execution or not. This gives you a lot of control over the communication and actions that happen when agents move between roles.

## Interface IModelMessage

The `IModelMessage` interface represents a single message passed around within the AI agent system. Think of it as the fundamental unit of communication – whether it's a response from a language model, an instruction to a tool, or input from a user. This structure is crucial for tracking the conversation history, generating responses, and managing events across multiple agents.

Each message has a `role` indicating who or what sent it: this could be the language model itself (`assistant`), the user (`user`), a tool (`tool`), the system providing notifications (`system`), a recovery process (`resque`), a history reset (`flush`), or a developer (`developer`).  A key identifier, `agentName`, links the message to a specific agent.  The `content` is the main body of the message - the actual text or data being communicated.

The `mode` property distinguishes between messages originating from user input (`user`) or from tool execution (`tool`), which helps determine how to handle them.  `tool_calls` is an optional array containing details of tool executions requested within the message.  `images` allows the passing of image data.  `tool_call_id` provides a way to track the correspondence between tool calls and their responses. Finally, `payload` allows you to attach extra information to the message beyond the core content.

## Interface IMethodContext

This interface, `IMethodContext`, acts as a common record for information about any method call within the swarm system. It bundles key details like the client’s ID, the name of the method being called, and the names of the agents, swarms, storage, state, compute, policy, and MCP resources involved. Think of it as a metadata package that different services, such as logging, performance monitoring, and documentation, use to keep track of what's happening and where.  Each property provides context relating to a particular resource or component within the orchestrated environment.

## Interface IMetaNode

This interface describes the building blocks for organizing information about your AI agents and the resources they use. Think of it like a way to create a visual map of how agents relate to each other and what they depend on. Each "node" in this map has a name, like the name of an agent or a specific resource. It can also have children – other nodes that represent more detailed dependencies or resources connected to it. This structure helps to create a clear hierarchical view, which is useful for understanding complex agent relationships and preparing data for things like diagrams.

## Interface IMCPToolCallDto

This interface defines the structure of information passed around when an AI agent requests a tool to be used. Think of it as a standardized message containing all the details needed to execute a tool call – like which tool is needed, who requested it, and any necessary parameters. It also tracks things like whether the call should be stopped and if it's the final step in a chain of actions. The `params` section is flexible and can hold different types of data depending on the tool being used. The `toolCalls` array lets you bundle multiple tool requests into a single operation.

## Interface IMCPTool

This interface outlines what makes up a tool within the AI agent swarm orchestration framework. Every tool needs a `name`, which is simply how it's identified. It's helpful to also provide a `description` to explain what the tool does. Crucially, each tool has an `inputSchema` that details the expected format of the information it needs to operate – essentially, it’s a blueprint for the data the tool will process.

## Interface IMCPSchema

This interface describes the core structure of an MCP (Mission Control Plan), which is the blueprint for how your AI agents will work together. 

Each MCP needs a unique name and can optionally have a description to explain its purpose. 

Crucially, it defines how to access available tools for a given client and how to actually *use* those tools by providing input data. 

Finally, you can also register callbacks to be notified about different stages of the MCP's execution, like when it starts or completes.

## Interface IMCPParams

This interface defines the settings needed to run a managed component process (MCP). Think of it as a blueprint for how an MCP should be configured. It includes a `logger` so you can track what's happening during the process and a `bus` for communicating with other parts of the system. Essentially, it's all about providing the MCP with the tools it needs to log its actions and talk to the broader environment.

## Interface IMCPConnectionService

This service handles the connections to your AI agent swarm using Message Channel Protocol (MCP). Think of it as the central hub for communication – it manages establishing, maintaining, and closing these crucial links. It provides methods to connect to a specific agent, disconnect from one, and generally ensures reliable messaging between your orchestrator and the individual agents within the swarm. You're essentially using this service to set up and manage the "pipes" through which instructions and data flow to and from your AI agents. It simplifies the complexities of MCP connection management, allowing you to focus on the logic of your swarm orchestration.

## Interface IMCPCallbacks

This interface defines the functions your application can use to react to events happening within the AI agent swarm orchestration framework. Think of them as hooks that let you know what's going on behind the scenes.

When the framework starts up, the `onInit` function will be triggered. When a client’s resources are cleaned up, you'll get a notification via `onDispose`, letting you know which client is being released. 

If you need to know when tools are being gathered for a client, `onFetch` will let you know. Listing tools for a client triggers `onList`. 

The `onCall` function is your primary way to respond to an agent actually using a tool - it tells you which tool was used and provides the data associated with that call. Finally, `onUpdate` signals that the available tools have changed for a particular client.

## Interface IMCP

This interface lets you manage the tools available to your AI agents. 

You can use it to find out what tools are offered to a particular agent, check if a specific tool is available, and actually execute a tool with provided data. 

It also provides methods to refresh the list of tools, either for all agents or for a specific one, ensuring you always have the latest tool options. Essentially, this interface acts as a central point for controlling and interacting with the tools used by your AI agent swarm.

## Interface IMakeDisposeParams

This interface defines the settings you can provide when setting up an automatic disposal process for an AI agent swarm. 

You can specify a `timeoutSeconds` value, which dictates how long the system will wait before automatically disposing of the swarm if it's inactive. 

Optionally, you can also provide an `onDestroy` callback function. This function will be triggered *after* the automatic disposal process completes successfully, giving you a chance to perform any cleanup actions needed on your end, and it will tell you which client and swarm were disposed.

## Interface IMakeConnectionConfig

This interface defines how you can control the timing of messages sent by your AI agents. Think of it as a way to pause or space out the messages, preventing them from overwhelming the system or other agents. The `delay` property lets you specify exactly how long, in milliseconds, you want to wait between sending messages.

## Interface ILoggerInstanceCallbacks

This interface defines a set of optional functions that you can provide to customize how a logger behaves. Think of it as a way to "plug in" your own logic for when a logger starts up, shuts down, or records different types of messages. 

You can provide functions for handling initialization (when the logger is ready), disposal (when it's being cleaned up), and logging messages at different levels like debug, info, or standard log. These callbacks are triggered by the LoggerInstance, allowing you to observe and react to its lifecycle and logging activity.


## Interface ILoggerInstance

This interface defines how a logger should behave within the agent swarm framework, going beyond simple logging. It allows for controlled setup and cleanup of logging functionality specific to each client. 

The `waitForInit` method lets you ensure the logger is properly initialized, potentially performing asynchronous tasks like connecting to a remote logging service, and guaranteeing it only happens once. 

Similarly, the `dispose` method provides a way to gracefully shut down the logger, releasing any resources and executing cleanup routines, especially important when dealing with client-specific connections or data.

## Interface ILoggerControl

This interface lets you fine-tune how logging works within your AI agent swarm. It provides methods to globally adjust the logging system, personalize how individual loggers are created, and send specific log messages tied to particular clients. You can set up shared logging adapters for streamlined logging across the entire system or customize the creation of logger instances to match your client’s unique needs. It also lets you easily send targeted log messages, like informational or debug logs, associated with a specific client, making troubleshooting and monitoring simpler.

## Interface ILoggerAdapter

This interface describes how different parts of the system can communicate with logging tools. Think of it as a standard way to send messages – like errors, informational updates, or debugging details – to various destinations, tailored to each client. 

Each method (log, debug, info, dispose) provides a specific way to send a message, ensuring everything is properly set up before the message is sent. The `dispose` method is used to clean up resources associated with a client's logging, essentially removing the logging setup when it’s no longer needed.

## Interface ILogger

This interface defines how different parts of the system, like the agents themselves and the processes that manage them, can record information. Think of it as a way to keep a detailed record of what's happening behind the scenes. 

You can use it to note general events, detailed debugging information, or just important updates about the system's progress. This logging helps track down problems, monitor performance, and understand how everything is working together. It’s a key tool for understanding the swarm's behavior and resolving any issues that might arise.

## Interface IIncomingMessage

This interface describes a message that comes into the AI agent system. Think of it as the way information gets passed from a user or external source to an agent.

Each message has a unique identifier that tells us who sent it – like a client ID. It also carries the actual content of the message, which might be a question, a command, or some other data. Finally, it specifies which agent within the system is responsible for handling that message. This ensures the message is routed to the correct agent for processing.

## Interface IHistorySchema

This interface, `IHistorySchema`, outlines how your AI agent swarm keeps track of its conversations. Think of it as the blueprint for the system's memory. 

It focuses on the `items` property, which specifies the "adapter" – the specific technology used to store and retrieve those conversation logs. This adapter could be anything from a simple array in memory to a more robust database. Essentially, it's the crucial piece that determines where and how your agents' history is saved.

## Interface IHistoryParams

This interface defines how to set up a record of an agent's activity. Think of it as a blueprint for creating a history log for a specific agent. 

You’re going to need to specify the agent’s unique name, a client ID to identify who initiated the activity, and a logger to keep track of what’s happening.  

It also allows you to control how much of the agent’s past messages are kept to provide context and uses a communication bus for internal swarm messaging. You can also specify how many messages to keep to help manage the amount of data stored.

## Interface IHistoryInstanceCallbacks

This interface defines a set of callback functions used to manage and interact with an agent's history of messages. You can use these callbacks to customize how an agent's history is loaded, filtered, updated, and processed.

For example, you can specify a function to retrieve the system prompt for a particular agent, or a filter to decide which messages are included in the history. The callbacks also let you react to events like new messages being added, messages being removed, or the history being read. These hooks allow you to track changes, perform actions based on message content, and generally control the lifecycle of an agent's historical data. A final callback provides direct access to the history instance itself after it's been created.

## Interface IHistoryInstance

The `IHistoryInstance` interface outlines how to manage an agent's history of interactions. You can use it to loop through past messages for a specific agent, retrieving them one by one. It also allows you to initialize the history, potentially loading any existing data.  Adding new messages to the history is straightforward, and you can even retrieve the most recent message and remove it. Finally, you can clean up and release the history data for an agent when it's no longer needed.

## Interface IHistoryControl

This interface lets you fine-tune how your AI agent swarm keeps track of its actions and decisions. You can tell the system when to record events or how to handle them using `useHistoryCallbacks`, essentially plugging in your own functions for specific moments in the history's lifecycle. 

Alternatively, `useHistoryAdapter` allows you to completely customize the way history instances are created, giving you ultimate control over their internal workings and data structures. This is useful if you need a non-standard history implementation.

## Interface IHistoryConnectionService

This interface, IHistoryConnectionService, is a way to define how interactions with the system's history are handled. Think of it as a blueprint for managing the flow of data related to past events and decisions. It’s specifically designed to be a type definition, ensuring that the public-facing parts of the history service are clear and consistent, while hiding the underlying implementation details. Essentially, it's about providing a reliable and understandable way for external components to interact with the system’s historical record.

## Interface IHistoryAdapter

This interface helps manage and access a record of interactions within the agent swarm. It allows you to add new messages to the history, retrieve the most recent message, and clear the history for a specific agent and client. You can also loop through all the messages recorded for a particular agent and client, allowing you to review or analyze past activity. Essentially, it provides a way to keep track of what's happening within your agent swarm.

## Interface IHistory

This interface helps you keep track of the conversations and interactions your AI agents have had. Think of it as a memory log for each agent.

You can add new messages to the log using the `push` method, which stores them asynchronously. To retrieve the last message exchanged, use `pop` to remove and get it.

If you need to prepare the history specifically for a particular agent, `toArrayForAgent` transforms the log into a format suitable for that agent, potentially adjusting it based on a prompt or system instructions.  Alternatively, `toArrayForRaw` gives you access to the complete, unfiltered history as a list of messages.

## Interface IGlobalConfig

This section defines a central configuration object (`IGlobalConfig`) that controls various aspects of the AI agent swarm system. Think of it as a master settings file that influences how the system behaves, from tool usage and logging to error handling and even persistent storage.

Many of these settings have default values, but they can be customized using `setConfig` to tailor the system's behavior.  For example, you can adjust how tool call errors are handled (`CC_RESQUE_STRATEGY`), modify logging verbosity, or set the maximum number of messages stored in the history.

Here’s a breakdown of what you can tweak:

* **Error Handling:** Control how tool call exceptions are managed.
* **Logging:**  Fine-tune the level of detail in log messages.
* **History Management:**  Limit the number of messages kept in the conversation history.
* **Tool Usage:** Restrict the number of tools called in a single execution.
* **Agent Behavior:**  Customize how agents handle outputs, validate tool calls, and transform messages.
* **Persistent Data:** Determine whether and how data is stored and retrieved.
* **Custom Logic:**  Provide custom functions for specific tasks like converting names, handling PlantUML diagrams, and more.

This configuration object is the key to adapting the system to different environments and use cases.

## Interface IFetchInfoToolParams

This interface defines how to create a tool that can retrieve information for an AI agent. Think of it as building a specialized "reader" that fetches data based on the agent's requests.

You specify the tool's name, and most importantly, its function – which includes a description of what it does and the types of inputs it expects.

You can also add extra details like documentation notes, a way to conditionally enable the tool based on certain conditions, and a validation step to ensure the tool receives appropriate input. This interface helps you create tools that can provide the AI with the information it needs without altering anything else in the system.

## Interface IFetchInfoParams

This interface, `IFetchInfoParams`, helps you define how data is retrieved for your AI agents. Think of it as the instruction manual for getting the right information to the agents when they need it. 

You’ll specify a function, `fetchContent`, which actually performs the data retrieval – this is the core of the process. If something goes wrong during that retrieval, you can provide a `fallback` function to gracefully handle the error.  

There's also an optional `emptyContent` function you can use to provide a helpful message if the `fetchContent` function returns nothing. This ensures the agents always have something to work with, even if the initial data fetch is unsuccessful.

## Interface IExecutionContext

This interface helps track what's happening in your AI agent swarm. Think of it as a little passport for each task – it carries essential information like which client started it, a unique ID for the specific run, and a process identifier. This passport is used by different parts of the system to monitor performance and coordinate activities. It ensures everyone is on the same page about each execution happening within the swarm.

## Interface IEntity

This interface, `IEntity`, serves as the foundation for all data that the system remembers and uses over time. Think of it as the common blueprint for all the important pieces of information within the swarm. It’s a starting point, and more specialized interfaces build upon it to describe the specific details of each type of entity.

## Interface IEmbeddingSchema

This interface helps you set up how your AI agents understand and compare information. It lets you decide if agent states and navigation should be saved, and it gives you a unique name for your chosen embedding method. You can also define functions to store and retrieve pre-calculated embeddings, preventing unnecessary recomputation.

It provides functions for generating embeddings from text and calculating how similar two embeddings are, essential for tasks like finding relevant information or ranking potential actions. You can further customize the embedding process by providing callbacks for specific events.

## Interface IEmbeddingCallbacks

This interface lets you tap into what's happening when your AI agents are creating and comparing embeddings – think of them as numerical representations of text. 

The `onCreate` callback gives you a notification whenever a new embedding is generated, allowing you to log details or perform extra actions on it. 

Similarly, the `onCompare` callback lets you observe and potentially analyze the results when two pieces of text are compared for how similar they are, based on their embeddings. You can use these callbacks to monitor performance, debug issues, or enhance your overall process.

## Interface ICustomEvent

This interface lets you create and send custom events within the system, going beyond the standard event types. Think of it as a way to communicate specific, unique information between agents or components. It’s designed for scenarios where a predefined event structure isn't enough, letting you attach any type of data – like a status update, a special instruction, or any custom information – as part of the event. You can use it to broadcast custom notifications or signals across your agent swarm. The data you send is contained within the `payload` property, which can hold virtually anything you need.

## Interface IConfig

This configuration option lets you decide whether your UML diagram will show the relationships between different parts of your system or just focus on the main components. Turning this on adds more detail and shows a more complete picture of how everything connects. It's useful when you need a deeper understanding of the system's architecture.

## Interface IComputeSchema

This interface defines the structure for describing a computational unit within the agent swarm. Think of it as a blueprint for a task the swarm can perform.

It includes details like a descriptive name, whether it’s meant to be shared among agents, a time-to-live value (how long it should exist), and a function to retrieve the data it operates on.

Crucially, it allows for specifying dependencies on other computations and provides a mechanism to add custom logic using middlewares. 

You can also define callbacks to react to specific events during the computation's lifecycle, enabling you to track its progress or respond to changes.

## Interface IComputeParams

This interface, `IComputeParams`, provides the essential ingredients needed for performing calculations within the AI agent swarm. Think of it as a package of tools and context. It includes a unique identifier (`clientId`) to track the computation's origin, a `logger` for recording events and debugging, and a `bus` for communication within the system. Most importantly, it defines `binding`, which acts as a trigger system – it lists specific state changes that signal when a recalculation or data update should occur. This lets the framework react dynamically to changes in the environment.

## Interface IComputeMiddleware

This interface outlines the structure for components that sit between the orchestration framework and the actual AI agents. Think of it as a way to add custom logic – like adding logging, rate limiting, or data transformation – before sending tasks to agents or processing their results.  Implementations of `IComputeMiddleware` define functions to handle both the request (task) being sent to an agent and the response coming back from the agent. This lets you centrally manage behaviors that impact how your agents operate, providing flexibility and control over the entire agent workflow. You can use these middleware to build reusable patterns across your agent swarm.

## Interface IComputeConnectionService

This interface helps manage connections to compute resources, ensuring that your AI agents can reliably access the tools and data they need. It builds upon the base `ComputeConnectionService` to provide a type-safe way to interact with these connections within your AI agent swarm orchestration framework. Think of it as a blueprint for how your agents will link up to external systems.

## Interface IComputeCallbacks

This interface lets you hook into the lifecycle of a compute task within the AI agent swarm. You can define functions to be called when a compute task is first initialized, when it's being cleaned up, when it’s actively running, when a calculation is being performed, and when its data is updated. Think of it as a way to be notified and respond to key moments in a compute task’s journey, allowing your system to react to changes and maintain synchronization. You're essentially plugging in your own logic to listen for and react to specific events happening within a compute unit.

## Interface ICompute

This interface, `ICompute`, lets you interact with a compute operation within the AI agent swarm. Think of it as a way to trigger calculations, update their status, and retrieve the results. The `calculate` method starts a new computation based on a given state name.  You can use `update` to report progress or changes to a specific computation, identifying it by client and compute name. Finally, `getComputeData` gives you access to the result of the computation – it fetches the computed data whenever you need it.

## Interface ICompletionSchema

This interface, `ICompletionSchema`, helps you set up how your AI agents generate responses within the swarm. It defines a unique name for each completion method, lets you specify if the output should be in JSON format, and allows you to pass custom flags to the language model – think of these flags as special instructions for the AI.

You can also define callbacks to handle events after a completion is generated, allowing for fine-grained control over the process. The `getCompletion` method is what you use to actually request a response, providing the necessary context and tools for the language model to work with.

## Interface ICompletionCallbacks

This interface lets you define actions to be taken when an AI agent task finishes successfully. Think of it as a way to hook into the end of a task to do things like record the results, process the output, or start another process based on the completion. You can provide a function that will be called with the task's arguments and the generated output whenever a task completes without errors.

## Interface ICompletionArgs

This interface defines what’s needed to ask for a completion from the system. Think of it as the information you provide to request a response from an AI agent.

You’ll need to specify a unique identifier for your application (clientId), the name of the agent you're interacting with (agentName), and optionally the name of an outline to guide the structure of the response (outlineName).

The system also needs to know where the last message came from, whether it was a tool or a user (mode), and the conversation history itself (messages).  You can also provide a list of tools the agent has access to (tools), and specify the desired output format if you’re expecting a JSON response (format).

## Interface ICompletion

This interface defines how your AI agents can receive and process responses from language models. Think of it as the standard way agents communicate back to the orchestration framework, delivering the results of their work. It's designed to be comprehensive, providing all the necessary components for generating and handling model outputs within the swarm.

## Interface ICommitActionToolParams

This interface defines how to set up a tool that allows agents to make changes to a system, specifically for actions that involve committing changes. You provide a name for the tool, and crucially, you describe what the tool *does* – including the expected inputs it needs.

You can define the tool’s function using a schema describing its parameters or by providing a function directly.  There's also a place for extra documentation to help agents understand the tool's purpose.  Finally, you can specify a rule to determine if the tool should even be offered to an agent, based on factors like the client and agent involved.

## Interface ICommitActionParams

This interface outlines how to set up a handler for actions that change the system’s state, like committing changes. You can customize various aspects of these actions, including how to validate the incoming data, what to do if something goes wrong, and what messages to display to the user.

You can provide a fallback function to gracefully handle errors that occur during the action. A validation function lets you check if the data being used is correct before the action is attempted.  The core of the action is handled by the `executeAction` function, which performs the actual operation. If the `executeAction` doesn't return any data, you can define an `emptyContent` function to provide a placeholder message. Finally, you can specify messages for both successful and failed operations, which will be displayed after the action is completed.

## Interface IClientPerfomanceRecord

This interface describes the performance data collected for each individual client, like a user session or agent instance, within a larger process. Think of it as a detailed report card for each client, tracking how it's performing.

It includes information like a unique ID for the client (`clientId`), data stored in its memory during operation (`sessionMemory`), and its overall state (`sessionState`).

You're also able to track how many times the client has executed tasks (`executionCount`), the amount of data it's processed as input and output (`executionInputTotal`, `executionOutputTotal`), and the average sizes of those inputs and outputs.  Finally, you're provided with the total and average execution times to measure the client’s overall speed and efficiency. This data helps pinpoint bottlenecks or areas for optimization at the client level.

## Interface IChatInstanceCallbacks

This interface defines a set of callbacks that your application can use to be notified about key events happening within a chat instance managed by the AI agent swarm orchestration framework. Think of it as a way to "subscribe" to what's going on – you're told when a chat session starts, when messages are sent, and when a chat instance is ready or being cleaned up. You’re also alerted to changes in activity status, allowing you to potentially adjust your application’s behavior based on how active the agents are. Each callback provides information like the client ID, the swarm name, and details specific to the event.

## Interface IChatInstance

This interface represents a single chat session within the agent swarm. 

It lets you start a chat with `beginChat`, check if there's been recent activity using `checkLastActivity`, and send messages to the chat with `sendMessage`. When you're finished, you can clean up resources using `dispose`. 

If you want to be notified when a chat is being closed, you can register a listener with `listenDispose`.

## Interface IChatControl

This framework lets you customize how your AI agent swarm interacts with chat interfaces. The `useChatAdapter` function lets you define which class will be used to handle the actual chat communication – essentially, you're choosing the engine that powers the conversations. 

Similarly, `useChatCallbacks` allows you to specify functions that will be triggered at different points in the chat process, letting you react to events like new messages or completion of a chat turn. Think of it as setting up custom hooks into the chat lifecycle.

## Interface IBusEventContext

This interface provides extra information about an event happening within the AI agent swarm system. Think of it as a way to add labels to events, helping you understand which agent, swarm, storage, state, compute, or policy is involved.

When an agent is sending out an event, it usually only fills in the `agentName` to specify which agent triggered the event. However, other parts of the system might use all these fields to track events happening at a swarm, storage, state, compute, or policy level.

Each field, like `swarmName` or `storageName`, represents a unique identifier for that specific component, making it easier to debug, monitor, or react to events within the swarm.

## Interface IBusEvent

This interface defines a standard way for different parts of the system to communicate through an internal messaging bus. Think of it as a structured notification system where agents can signal actions, share data, or update the system’s state.

Each message sent on the bus uses this format, and includes information about where the message came from (the source), what kind of event it is (the type), any relevant data being passed along (input and output), and some extra details to provide context. For example, an agent might use this to report that a tool has finished running, or to confirm that a user message has been processed. The "source" always identifies it as originating from an agent, while the "type" tells other parts of the system what the message means. The input and output fields carry specific data related to that event, and the context provides additional information like which agent sent the message.

## Interface IBus

The `IBus` interface provides a way for different parts of the system to communicate with each other, particularly for agents to send updates and information to specific clients. Think of it as a central messaging system where agents can announce things like completed tasks, tool outputs, or important lifecycle changes.

The core function is `emit`, which lets you send a structured event to a client. You specify the client's ID and the event itself, which must follow a defined format including details like the event type, where it came from, any input data, results, and context.  It's designed to be asynchronous, meaning the event is queued and delivered later.

When an agent does something significant – like finishing a run, sending output, or committing a message – it uses `emit` to notify the system. The event includes a client ID, which is the ID of the client receiving the notification.  This helps ensure the information gets to the right place. You're essentially using this interface to keep everyone in the system aware of what's happening, making sure different components can react and respond accordingly. The event type, source and client ID are all included to add context and help with filtering.

## Interface IBaseMessage

This interface outlines the basic structure for all messages moving around within the agent swarm. Every message, whether it’s from an agent, a tool, or a user, will have these common elements: a `role` indicating who sent it, the main `content` of the message, and potentially information about any tools it’s referencing. Messages can also include associated images or a `tool_call_id` to connect a message to a specific tool request. Think of it as the foundational blueprint for communication within the swarm.

## Interface IBaseEvent

This interface sets the basic structure for all events happening within the swarm system. Every event, whether it's a standard system message or something custom, will have a `source` to indicate where it came from and a `clientId` to specify which client or agent instance it’s intended for. Think of it as providing the who and where for every action happening within the swarm. It’s a core building block for how different parts of the system communicate.

## Interface IBaseCompletionArgs

This interface defines the basic information needed when you ask the AI agent swarm to generate a response. Every completion request, whether it's for outlining or a full swarm execution, will need to include a client identifier to help track and manage requests. You also need to provide a series of messages, which act as the conversation history or background information the AI agents use to understand what you're asking.

## Interface IAgentToolCallbacks

This interface lets you plug into the lifecycle of a tool used by your AI agents. You can define functions that run before a tool is used, after it finishes, or when it encounters an error. It also allows you to validate the parameters being sent to a tool before it runs. Think of these callbacks as a way to monitor, control, and react to how your agents are using tools.

## Interface IAgentTool

This interface defines a tool that an AI agent can use, building upon a more general tool definition. Each tool has a name and an optional description to help users understand how to use it. 

Before a tool can be used, `isAvailable` checks if it's ready to execute, and `validate` ensures the provided information is correct. You can also customize how the tool behaves using lifecycle callbacks.

The core of the tool is the `call` method, which executes the tool with given parameters and context, like a client ID, agent name, and tool calls. The `function` property provides a way to dynamically define tool metadata.

## Interface IAgentSchemaInternalCallbacks

This interface lets you hook into different stages of an agent’s lifecycle, providing opportunities to observe and potentially influence its behavior. You can register callbacks to be notified when an agent starts, runs, produces output, encounters errors, or is reset. These callbacks give you insights into what the agent is doing and allow you to add custom logic, like logging actions, monitoring performance, or reacting to specific events. For example, you can get notified when a tool is used, an error happens, or the agent is initialized. You can also be informed when the agent finishes its work or when its memory is cleared.

## Interface IAgentSchemaInternal

This interface defines the blueprint for how an agent within the swarm is configured. Think of it as a recipe for creating a specific agent.

It lets you customize nearly every aspect of an agent's behavior, including:

*   **Prompts:** You can set a main prompt to guide the agent's actions, and even provide additional system prompts to control things like tool usage.
*   **Tools & Storage:** Specify which tools and data storage mechanisms the agent can utilize.
*   **Lifecycle Management:** You can define callbacks for different stages of the agent's execution, allowing for fine-grained control.
*   **Output Handling:** Functions let you filter, validate, or transform the agent’s output before it’s used.
*   **Communication:** Includes options for connecting the agent to an operator dashboard to handle conversations.
*   **Dependencies:** Specify if the agent relies on other agents for certain actions.

Essentially, this interface provides a comprehensive way to describe and control how each agent functions within the larger swarm system.

## Interface IAgentSchemaCallbacks

This interface defines a set of optional hooks that allow you to tap into different stages of an agent's lifecycle. You can use these callbacks to monitor what an agent is doing, react to specific events, or even influence its behavior. For instance, you can be notified when the agent starts running, when a tool produces an output, or when it's initialized or disposed of. These hooks provide flexibility in how you interact with and manage your AI agents. You can also get notified when the agent's history is cleared or when it resumes after a pause. There’s also a callback that lets you know when all tools in a sequence have finished executing.

## Interface IAgentSchema

This interface, `IAgentSchema`, describes the configuration for an agent within the orchestration framework. It lets you define how the agent behaves and interacts.

You can specify static system prompts to guide the agent's responses using the `system` property, and `systemStatic` is simply an alias for the `system` property.  If you need more complex, context-dependent instructions, the `systemDynamic` property allows you to generate system prompts dynamically. This property uses a function that receives the client ID and agent name to tailor the instructions specifically for each agent’s situation.

## Interface IAgentParams

This interface defines the information an agent needs to run. Think of it as a set of ingredients – it includes things like a unique client ID, a logger for keeping track of what’s happening, and a way to communicate with the rest of the swarm. 

It also provides access to external tools, a history of previous interactions, and a way to generate responses. 

Finally, there's a validation step to ensure the agent's output is correct before it's used. Essentially, it's a blueprint for a well-equipped and informed agent within the swarm.

## Interface IAgentNavigationParams

This interface defines how to set up navigation options for your AI agents. Think of it as telling the system *how* an agent should move or interact within the overall swarm. 

You specify a `toolName` – essentially a descriptive label for the navigation action.  A `description` explains what the tool does. 

The `navigateTo` property tells the agent which other agent to connect to or interact with. You can add a `docNote` for extra documentation. 

Finally, the `isAvailable` function allows you to conditionally enable or disable the navigation tool based on factors like the client and agent names – allowing for fine-grained control over agent behavior.

## Interface IAgentConnectionService

This interface helps ensure that the publicly available parts of your agent connection service are clearly defined and consistent. Think of it as a blueprint for what external code needs to know about connecting to and interacting with agents. It's designed to strip away any internal workings or hidden details, focusing only on the features intended for outside use, which promotes a cleaner and more predictable API.

## Interface IAgent

The `IAgent` interface defines how you interact with an individual agent within a swarm. Think of it as the blueprint for how an agent behaves and responds.

You can use the `run` method to quickly test an agent with some input without affecting its memory or past conversations.  The `execute` method is used to actually run the agent, potentially updating its history depending on the mode you choose. `waitForOutput` then lets you retrieve the result of that execution.

To manage the agent's memory and context, several "commit" methods are provided. These let you add messages—like tool outputs, system prompts, developer notes, user inputs, or assistant responses—to the agent's history.  You can also use these to trigger specific actions like stopping tool executions or clearing the agent's memory completely to start fresh. This allows for fine-grained control over the agent's behavior and state.

## Interface IAdvisorSchema

This interface defines the structure for an "advisor" – a specialized agent within a larger AI agent swarm. Each advisor needs a clear name (`advisorName`) so we know what it is, and a description (`docDescription`) to explain its purpose. 

You can also provide optional callbacks (`callbacks`) to customize how the advisor behaves during specific operations. 

The core function of an advisor is to respond to messages; the `getChat` method handles this, taking a message as input and returning a chat response.

## Interface IAdvisorCallbacks

This interface defines a set of optional callbacks that can be used to receive updates from an advisor component. Specifically, the `onChat` property lets you register a function that will be called whenever the advisor sends a new message or completes a chat-related task. Think of it as a notification system – you provide a function, and the advisor calls it to keep you informed about what's happening in the chat process.
