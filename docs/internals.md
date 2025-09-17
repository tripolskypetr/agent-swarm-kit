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

This function checks the health and configuration of your entire AI agent swarm system, including all the swarms, individual agents, and their outlines. It's designed to be safe to run repeatedly – it won’t cause any unintended consequences even if you call it multiple times. Think of it as a quick check to make sure everything is set up correctly.

## Function startPipeline

This function lets you kick off a pre-defined workflow, or pipeline, within the AI agent system. You tell it which client is requesting the workflow, what the workflow is called, and which agent is responsible for managing it. Optionally, you can provide data – a 'payload' – that the workflow will use during its execution. The function then handles the behind-the-scenes orchestration, promising to return a result of a specific type once the pipeline completes. Essentially, it’s the primary way to trigger a sequence of actions performed by your AI agents.


## Function scope

This function lets you run a piece of code – like calling an agent or processing some data – within a defined environment that ensures everything has the necessary tools and connections. Think of it as creating a temporary, controlled workspace for your code. 

You give it a function to run, and it handles setting up the context around it.  You can also provide extra settings to customize this workspace – for example, you could specify a different agent to use or a different way to process text. If you don’t specify any customizations, it will use the standard tools available in the swarm. The function returns the result of what you asked it to run.

## Function runStatelessForce

This function lets you quickly run a command or message through your AI agent swarm without adding it to the ongoing conversation history. It’s perfect for situations like processing data from storage or handling brief, isolated tasks where you don't want to clutter the chat log.

Unlike other methods, this one *always* runs the command, even if the agent isn't currently active. You simply provide the message content and a client identifier to trigger the execution, and the system takes care of the rest, including tracking performance and ensuring a fresh environment for the agent. It’s a straightforward way to get a job done without affecting the agent's chat history.


## Function runStateless

This function lets you send a single message to an agent in your swarm without it being saved in the conversation history. Think of it as a way to run a quick task or process output from a storage system without cluttering up the ongoing chat.

It’s designed to be a lightweight way to interact with an agent, ensuring the execution happens only if the agent is still available and hasn’t been replaced. You provide the message you want the agent to process, a unique identifier for your client, and the name of the agent you want to use. The function handles all the behind-the-scenes work, including checking agent status and tracking performance.

## Function questionForce

This function lets you trigger a specific process to handle a question or message. It's like sending a question directly to the system for processing, bypassing the normal flow. 

You provide the actual question or message you want to process, along with a unique identifier for who's asking (the `clientId`) and the relevant knowledge source or context (the `wikiName`). 

The function will then return a result, which is typically the processed answer or outcome of the forced question process. It's designed for situations where you need more control over how a particular question is handled.


## Function question

This function lets you send a question to your AI agent swarm. It takes the question itself, a unique identifier for who’s asking, the name of the agent responsible for answering, and the relevant knowledge source (wiki) as input. The function then handles the complex process of routing the question and orchestrating the agents to find the best answer. Ultimately, it returns the answer as a string. Think of it as the primary way to get answers from your AI agents.

## Function overrideWiki

This function lets you change the settings for a specific wiki within the system. Think of it as replacing or adding to its configuration. It's designed to work independently, ensuring a fresh start for the update process. The function takes a set of new or modified settings for the wiki and applies them. It will record the change if the system is set up to log these kinds of operations.

## Function overrideTool

This function lets you change how a tool behaves within the agent swarm. Think of it as updating a tool's instructions – you can modify its properties to customize its actions. It’s a direct way to adjust tool configurations without affecting ongoing processes. The system keeps track of these changes, so you're always working with the most up-to-date tool definitions. You can provide a complete new schema or just a few changes to the existing tool.

## Function overrideSwarm

This function lets you change the blueprint for a swarm, essentially updating its configuration. Think of it as replacing or modifying an existing plan for how a group of AI agents will work together. It allows you to adjust the swarm's setup without affecting any ongoing tasks. The system creates a fresh, isolated environment to apply these changes, ensuring a clean update. If logging is turned on, you’ll see a record of this change in the system logs. You provide a new or partial blueprint, and the function applies it to the specified swarm.

## Function overrideStorage

This function lets you modify how data is stored within the agent swarm. Think of it as updating a blueprint for a specific storage location. You can provide a new or partial schema to change its configuration, like adjusting how data is organized or secured. This change happens independently, ensuring it doesn’t interfere with ongoing processes. If the system is set up to log actions, this override will be recorded. 

You provide the new schema details as input, which will be applied to the existing storage configuration.

## Function overrideState

This function lets you change the blueprint for how the swarm manages its state. Think of it as modifying the rules and structure of a specific piece of information the swarm uses. You can provide a new or partial definition to update the existing state schema. This change happens independently, ensuring it doesn't interfere with ongoing processes. If enabled, the system will record that this schema was updated. You only need to provide the parts of the schema you want to change – you don't need to redefine the entire thing.

## Function overridePolicy

This function lets you change the rules and settings for a policy within the swarm. Think of it as modifying a pre-existing configuration—you can either replace the whole policy or just tweak certain parts. It's designed to be a standalone operation, keeping things separate and reliable. If logging is turned on, you'll see a record of the change made. You provide a new or updated version of the policy's structure as input to apply the changes.

## Function overridePipeline

This function lets you tweak an existing pipeline definition—think of it as making targeted adjustments to how your AI agents work together. You provide a partially updated version of the pipeline, and this function merges it with the original, effectively overriding specific parts. It’s useful when you want to customize a standard pipeline without completely recreating it. The function takes a new schema as input, which contains the changes you want to apply to the existing pipeline definition.

## Function overrideOutline

This function lets you modify an existing outline definition within the AI agent swarm. Think of it as updating a blueprint for how agents will structure their work. 

It carefully makes these changes in a controlled environment to prevent conflicts with other ongoing processes. You can also enable logging to track these modifications for debugging or auditing purposes. 

You provide a partial outline schema – essentially, the changes you want to make – and this function applies them to the existing outline.

## Function overrideMCP

This function lets you modify an existing Model Context Protocol (MCP) schema. Think of an MCP as a blueprint for how an AI agent understands and shares information.

You provide it with an MCP schema – basically, the existing structure you want to change – and it returns a new, updated version. This is useful if you need to add new properties, adjust existing ones, or generally tweak the communication standards between your AI agents. It’s a powerful way to adapt your agent swarm's understanding and interaction protocols.

## Function overrideEmbeding

This function lets you adjust how your swarm understands and represents information. Think of it as a way to fine-tune the underlying data structures. You can provide a new or modified schema to update the existing configuration for a specific embedding mechanism. This change happens independently, ensuring it doesn’t interfere with ongoing processes.  If logging is turned on, the system will record that this adjustment was made. You only need to provide the parts of the schema you want to change – you don't have to redefine the whole thing.

## Function overrideCompute

This function lets you modify existing compute schemas, essentially updating them with new information. Think of it as a way to refine or extend a definition for how a computation should be performed. You provide a partial schema—just the parts you want to change—and it merges those updates into the original schema. This is helpful for customizing computation behavior without needing to redefine the entire schema from scratch. The function returns the merged, updated schema.

## Function overrideCompletion

This function lets you change how the AI agents generate text within the system. You can provide a new or partial definition for a specific completion method, effectively customizing its behavior. Think of it as tweaking the instructions given to the agents when they're writing. The change happens independently, ensuring it doesn't interfere with other processes. If logging is turned on, a record of this modification will be kept. You just give it the parts of the completion schema you want to change, and it updates the system accordingly.

## Function overrideAgent

This function lets you modify an agent's settings within the swarm. Think of it as directly updating an agent's blueprint. You can provide a whole new schema or just a few changes – it’s flexible. The system handles this change carefully, making sure it doesn't interfere with anything else that's happening. If logging is turned on, it will record this change for tracking purposes. You provide the new or updated agent schema, and the function takes care of applying those changes.

## Function notifyForce

This function lets you send a message directly out of a swarm session as if it were an output, without triggering any existing messages. Think of it as a way to push information to the agents involved, especially useful when you're setting up a connection initially. It's strictly for sessions created using the "makeConnection" method.

Before sending, the system makes sure the session and the agent are still running and valid. It creates a fresh environment for the message and keeps a log of the process. If you try to use it with any other session setup, it will let you know that’s not allowed.

You provide the message content – the information you want to send – and a unique ID that identifies the client sending the message.

## Function notify

This function lets you send messages out of your AI agent swarm session directly, without having them processed as regular incoming messages. Think of it as a way to broadcast information. It’s specifically for sessions created using "makeConnection," and it makes sure the agent you’re sending the message through is still available and working.

The function takes the message content, a unique client ID, and the agent’s name as inputs. It prepares a clean environment before sending, and it won't work if the session wasn’t set up using "makeConnection".

## Function markOnline

This function lets you tell the system that a particular client is now active and participating in a specific swarm. Think of it as a simple "hello, I'm here!" signal for a client joining a group. You'll need to provide the unique ID for the client and the name of the swarm they are joining. This helps the orchestration framework know which clients are available to take on tasks within that swarm.

## Function markOffline

This function lets you tell the system that a particular client, identified by its unique ID, is no longer active within a specific swarm. Think of it as updating the system's understanding of which clients are currently participating. You’ll need to provide the client's ID and the name of the swarm it was part of. Essentially, it's a way to manage the status of your AI agents within a swarm, ensuring accurate tracking of their availability.


## Function listenEventOnce

This function lets you set up a temporary listener for events happening within your agent swarm. It's designed to react to a single event of a specific type from a particular agent, or even all agents, and then automatically stop listening. You provide a topic name to identify the event you're interested in, a filter to pinpoint the specific event you want to react to, and a function to execute when that event is received. This function ensures that the listener stops after the first matching event and offers a way to cancel the listener early if needed. It also prevents you from accidentally listening to events from reserved system topics.


## Function listenEvent

This function lets you tune in to specific messages being sent between agents in your swarm. You tell it which agent (or all agents) you want to listen to, and what kind of message – we call that a "topic." Whenever a message of that type is sent, a function you provide will be executed, receiving the message's content. To stop listening, the function returns a way to easily turn off that connection. It’s designed to keep things organized by ensuring messages are handled in order and preventing you from accidentally listening to system messages.

## Function json

This function lets you request data structured according to a predefined outline, essentially telling the system "give me information formatted in this specific way." You provide the name of the outline you want to use, which describes the desired structure. Optionally, you can also provide parameters that will influence how the data is generated. The function then handles the request behind the scenes, making sure the process is isolated and clean. The result is a promise that resolves to the structured JSON data you requested.

## Function hasSession

This function quickly tells you if an active session exists for a specific client, identified by their unique ID. It's a simple check to confirm whether a client is currently connected. Behind the scenes, it uses a session validation service to do the actual check and might log its activity if logging is turned on. You provide the client's ID, and it returns `true` if a session is found, and `false` otherwise.

## Function hasNavigation

This function lets you quickly determine whether a particular agent is involved in guiding a client's journey. It verifies that both the client and the agent are active and then looks at the current navigation path to see if the agent is included. You provide the client's ID and the agent's name, and it returns a simple yes or no answer. The system also keeps a record of these checks if logging is turned on.

## Function getWiki

This function lets you fetch a specific wiki's structure and content details from the AI agent swarm. You provide the name of the wiki you're interested in, and it returns information about that wiki, like its layout and data. The system will also record this request if logging is turned on in the overall swarm settings. Essentially, it's a way to programmatically access and understand the organization of different wikis within the swarm.

## Function getUserHistory

This function lets you pull a list of messages a user has sent during a specific session. You give it a unique identifier for the session, and it returns an array of messages where the user was the one sending them. It's designed to give you a clean, focused view of a user’s interactions within a particular session, using a background process to make sure things run smoothly and logging what’s happening if you've configured it to do so. The identifier you provide is how the system knows which session’s history you're requesting.

## Function getToolNameForModel

This function helps you determine the specific name a model will use for a tool, ensuring it understands which tool is being referenced. It takes the tool's registered name, the client's ID, and the agent's name as input. Essentially, it translates a general tool identifier into something the AI model recognizes within a specific context. You'll use this to provide the correct tool name to the AI model, making sure it knows exactly which tool to use for a given task. The function returns a promise that resolves with the model-friendly tool name.

## Function getTool

This function helps you find the blueprint for a specific tool within your AI agent swarm. Think of it as looking up the instructions for how a tool should work. You provide the tool's name, and it returns a description of that tool, outlining its capabilities and expected inputs. If you're tracking activity within your swarm, this function will also record that you're requesting this tool's details.



It’s useful whenever you need to know exactly what a particular tool can do and how to interact with it.

## Function getSwarm

This function lets you fetch the complete configuration details – the "schema" – of a specific AI agent swarm. You simply provide the name of the swarm you're interested in, and it returns all the information defining how that swarm operates.  If your system is set up to log actions, this function will also record that it retrieved the swarm's details. It's a straightforward way to inspect and understand the setup of a particular swarm.

## Function getStorage

This function lets you access the details of a specific storage area within the AI agent swarm. Think of it as looking up the blueprint for how data is organized and stored. You provide the name of the storage you're interested in, and it returns a description of its structure and the kind of data it holds. If the swarm is set up to log activity, this function will also create a record of your request.

## Function getState

This function lets you fetch a specific state definition from the system, using its name. Think of it as looking up the blueprint for a particular state within your AI agent swarm. The function will grab that blueprint and give it back to you as a structured object. If you’ve turned on logging, it will also record that you requested this state definition. You just need to provide the name of the state you're interested in.

## Function getSessionMode

This function lets you check the current operational status of a client session within your AI agent swarm. It tells you if a session is actively running ("session"), attempting to establish a connection ("makeConnection"), or has completed ("complete"). To use it, you simply provide the unique identifier for the client session you're interested in. The system ensures the session is valid and keeps a record of the request if logging is turned on.

## Function getSessionContext

This function lets you peek into the current session, giving you details about who's running the agent and what resources are available. It gathers information like the client identifier, process identifier, and details about the methods and execution environments being used. Think of it as a way to understand the setup for the agent's current task. It automatically figures out the client ID based on the environment it's running in, so you don't need to provide it.

## Function getRawHistory

This function lets you access the complete, unaltered history of a client's interaction with the AI agent swarm. It pulls all the messages and data associated with a specific client session, giving you a full picture of what transpired. Think of it as getting the raw data directly from the system – no filtering, no adjustments, just the history as it was recorded. To use it, you simply provide the unique identifier for the client session. This is helpful for detailed analysis or debugging, allowing you to examine the raw interaction without any processing.

## Function getPolicy

This function lets you fetch a specific policy definition from your AI agent swarm. Think of it as looking up the blueprint for how a particular policy should operate. You provide the policy's name, and it returns the complete schema describing that policy. The system will also record this request if logging is turned on.



It takes one piece of information: the name of the policy you’re looking for.

## Function getPipeline

This function lets you fetch the blueprint, or schema, of a specific pipeline within your AI agent swarm. Think of it as looking up the detailed instructions for a particular workflow. You provide the name of the pipeline you're interested in, and the function returns a structured representation of its configuration. If your swarm is set up to log activity, this function will also record that you requested this pipeline's schema. 

The function requires you to provide the name of the pipeline you want to retrieve.

## Function getPayload

This function lets you grab the data – the “payload” – that's currently being used by the system. Think of it as getting the information the agents are working with. If there’s no data available at the moment, it will return nothing. It also quietly records that it retrieved the data if the system is set up to keep logs.


## Function getNavigationRoute

This function helps you find the path an agent took within a swarm for a specific client. It essentially shows you which agents were contacted in sequence.

You provide the unique identifier for the client who initiated the request and the name of the swarm you're interested in. 

The function then returns a list of agent names, representing the navigation route, and might record some details about the process depending on how the system is configured.

## Function getMCP

This function lets you fetch the blueprint, or schema, for a specific Model Context Protocol (MCP) from your AI agent swarm. Think of it as asking the swarm, "Hey, can you show me the instructions for how this particular agent should operate?" You provide the name of the MCP you’re interested in, and the function returns its detailed definition. The system also keeps a record of this request if logging is turned on.



It’s important to know that `mcpName` represents the unique identifier for the MCP you’re trying to get.

## Function getLastUserMessage

This function lets you grab the very last message a user sent during a conversation. You provide a unique ID for the conversation, and it digs into the conversation history to find it. If the user hasn't sent any messages yet, or there’s an issue retrieving the history, it will return nothing. It’s designed to work quietly in the background, ensuring a controlled and clean process.

## Function getLastSystemMessage

This function helps you access the most recent message sent by the system within a client's ongoing session. It digs into the session history to find the last message marked as coming from the "system" role. If you need to see what instructions or updates the system provided to a specific client, this is the tool to use. It returns the text of that message, or nothing if no system messages have been sent. You simply provide the unique ID of the client you're interested in.

## Function getLastAssistantMessage

This function helps you quickly get the last message sent by the AI assistant for a specific client. It digs into the client's conversation history to find the most recent message where the assistant was the speaker. If the client hasn't received any messages from the assistant yet, the function will return nothing. You just need to provide the unique ID of the client you’re interested in.

## Function getEmbeding

This function lets you fetch the details of a specific embedding that's registered within the AI agent swarm. Think of it as looking up the blueprint for how that embedding works. You provide the name of the embedding you're interested in, and the function returns all the information associated with it, like its structure and how it’s used. If the swarm is set up to keep logs, this retrieval process will also be recorded.

## Function getCompute

This function lets you fetch the details of a specific compute resource within your AI agent swarm. Think of it as looking up the configuration for a particular task or processing unit. You provide the name of the compute you're interested in, and the function returns its schema, which describes how it's set up and what it does. If your system is set up to log activities, this function will also record that you requested this compute’s information. You'll need to know the compute's name beforehand to use this function.

## Function getCompletion

This function lets you fetch a specific completion definition – think of it as grabbing the instructions for a particular task your AI agents can perform – by its assigned name. It's how you access the blueprints for your agents' work. The system keeps track of these completion definitions in a central place, and this function retrieves them. If your system is set up to log activity, this retrieval will be recorded. You just need to provide the name of the completion you’re looking for, and it will return its detailed schema.

## Function getCheckBusy

This function lets you quickly see if a specific client's AI agent swarm is actively working on something. You just need to provide the unique ID that identifies the client. It returns a simple "true" or "false" answer – true means the swarm is busy, false means it’s available. This is useful for coordinating tasks or preventing overload on individual swarms.

## Function getAssistantHistory

This function lets you see the conversation history for a specific client's interaction with an AI assistant. It pulls all the raw history associated with a client and then filters it down to show only the assistant's responses. Think of it as retrieving the assistant’s side of the conversation. You provide the unique ID of the client session, and the function returns an array of messages representing the assistant's contributions.

## Function getAgentName

This function lets you find out the name of the agent currently handling a specific client's session within your AI agent swarm. You provide the unique ID of the client session, and the function returns the agent's name. It ensures the request is valid, keeps a log if you've enabled logging, and gets the name from the swarm's public service. It's designed to run independently, preventing interference from other processes.


## Function getAgentHistory

This function lets you see the past interactions and decisions made by a particular agent within your AI swarm. It's like looking at an agent's memory.

You specify the client session and the agent's name to get this history. The system will also consider any built-in adjustments or "rescue" strategies when retrieving the data. 

It ensures a clean environment for this process and retrieves the history using the agent’s prompt configuration. The function takes two key pieces of information: a client ID and the name of the agent you’re interested in.

## Function getAgent

This function lets you fetch the details of a specific agent within your AI agent swarm. You simply provide the name of the agent you’re interested in, and it returns all the information associated with that agent's schema. It's a straightforward way to access agent configurations and properties. If your system is set up for logging, this retrieval process will also be recorded.

## Function fork

This function lets you run code that interacts with your AI agents within a controlled environment. Think of it as creating a temporary, safe space for your agent's logic to execute. You provide a function – `runFn` – that contains the specific tasks you want your agent to perform; this function receives a unique client ID and the agent's name. You also pass in configuration options to manage how this execution happens. The function then handles setting up the necessary environment, verifying everything is correct, and cleaning up afterward, so you don’t have to worry about those details. The result of the function you provide is then returned to you.


## Function executeForce

This function lets you send a message or instruction directly to an agent within a swarm, acting as if it's coming from a client. It's useful when you need to ensure something gets done, even if the agent isn't actively working on something else.

Think of it as a way to "force" an action – it doesn’t wait to see if the agent is ready, it just sends the instruction. You’ll need to provide the message itself and a unique ID that identifies the client making the request.

The system handles the details behind the scenes, like making sure everything is set up correctly and keeping track of what's happening. It essentially gives you a reliable way to communicate with an agent and get things done.

## Function execute

This function lets you send messages or commands to a specific agent within a group of agents working together. Think of it as relaying a request from a client application to a particular agent – maybe to show them a tool's result or to start a conversation.

It makes sure the agent you're targeting is still active and connected to the system before sending anything, and it keeps track of how long the command takes to complete. 

You need to provide the message content, a unique identifier for the client making the request, and the name of the agent you want to send the message to. It’s designed to keep things clean and organized by setting up a fresh environment for each command and recording relevant information about its execution.

## Function event

This function lets your agents communicate with each other by sending messages across the swarm. You provide a unique identifier for your agent (the `clientId`), a topic name to categorize the message, and the actual data you want to send (the `payload`).

Think of it as publishing a message on a specific channel – other agents subscribed to that channel will receive it.

The system prevents using certain restricted topic names to avoid conflicts and ensures a well-organized communication flow. The whole process is designed to be clean and reliable.

## Function emitForce

This function lets you directly send text as output from the AI agent swarm, acting as if it came from the model itself. It’s a shortcut for situations where you need to inject data without triggering a standard message processing flow. 

It's important to note that this function only works within sessions created using the `makeConnection` method, ensuring everything stays in sync. 

Before sending, the system makes sure the session and swarm are valid and sets up a clean environment. If used incorrectly, it will let you know with an error. 

You provide the text you want to send and a unique ID for the client connection. The system also keeps a record of this action if logging is turned on.

## Function emit

This function lets you send text as output from an agent within the swarm, but it’s special – it's meant only for sessions created with `makeConnection`. It's a way to directly inject content without triggering a full message processing cycle.

Before sending anything, the system checks to make sure the connection, the swarm, and the agent you're using are still valid and active. If the agent has been replaced, the emission won't happen.

You need to provide the text you want to send, a unique ID for the client sending it, and the name of the agent supposed to be producing the output. It creates a fresh environment for the emission and keeps a log of what’s happening, ensuring everything runs smoothly.

## Function commitUserMessageForce

This function lets you directly add a user's message to the agent’s record of conversation, even if the agent isn't actively responding. It's a way to ensure that user input is always logged, regardless of the agent's state.

You provide the message content, a mode setting, a client identifier to track the session, and optionally some extra data. The function handles the technical details like verifying the session is valid and recording the action, then adds the message to the agent's history. It ensures the process runs cleanly, separate from any ongoing actions.


## Function commitUserMessage

This function lets you add a user's message to an agent's record within a larger group of working agents, without the agent immediately responding. Think of it as adding a note to the agent's memory. 

You provide the message itself, along with details like which client is sending the message, which agent you're adding the message to, and a mode setting. There’s also an optional payload for including extra information. 

The function makes sure everything is set up correctly and keeps things organized, making sure the addition happens cleanly and doesn't interfere with other processes. Essentially, it's a reliable way to update an agent's history.

## Function commitToolRequestForce

This function lets you push tool requests directly to an agent within the swarm, even if some validations might normally be skipped. It’s useful when you need to ensure a request is processed without going through the standard checks. You provide the tool requests you want to execute, along with the client's ID to identify the session. The function handles setting up the environment for this process and keeps track of what's happening through logging.

## Function commitToolRequest

This function lets you send a set of tool requests to a specific agent within your AI agent swarm. It makes sure everything is set up correctly – verifying the agent, session, and swarm – before actually sending the requests. It’s designed to work smoothly within the overall system, handling execution details and keeping a record of what's happening. You'll need to provide the requests you want to send, a unique identifier for the client, and the name of the agent you’re targeting. The function then returns an array of strings, presumably representing the results or confirmation of the committed requests.

## Function commitToolOutputForce

This function lets you directly push the results from a tool back into the agent's workflow, even if you’re not entirely sure the agent is still available. It’s a way to make sure the agent has the information it needs without waiting for confirmation. 

Essentially, it takes the tool's output, identifies which tool produced it, and ties it to a specific client session. It handles the necessary checks and logging behind the scenes to ensure the commit happens correctly. Think of it as a shortcut to updating the agent's progress, useful in situations where immediate data transfer is vital. You'll need to provide the tool's ID, the output content, and the client session ID to use it.

## Function commitToolOutput

This function helps agents in a swarm share the results of their work. It's used to send the output from a tool – like a search or a calculation – back to the central system, ensuring everyone knows what’s been done.

Before sending the result, the system makes sure the agent is still authorized to do so. It keeps track of who's doing what and logs the action to keep things transparent. 

You provide the tool's ID, the actual result of the tool's work, the client's ID, and the name of the agent performing the commit. This function does the heavy lifting of securely sharing that result within the swarm.

## Function commitSystemMessageForce

This function lets you directly push a system message into a session within the AI agent swarm, bypassing the usual checks for which agent is currently active. It’s designed for situations where you need to ensure a system message gets through, even if an agent isn't actively managing the session.

The function validates the session and the overall swarm environment to confirm everything is set up correctly before committing the message. It’s wrapped in a special context to manage how it runs and ensures that actions are logged for tracking purposes.

Essentially, this is a "force" version of a standard message commit—similar to how you might have a standard assistant message commit versus a forced one—it prioritizes ensuring the message gets into the session regardless of current agent status. You'll provide the message content and the client ID associated with the session.

## Function commitSystemMessage

This function lets you send messages directly to an agent within the swarm system – think of them as internal instructions or configuration updates. It's used for things the system itself needs to communicate, not responses from the agent.

Before sending, it makes sure everything is set up correctly: the agent, session, and swarm are all verified.

It handles the entire process, managing the execution context and keeping a log of what’s happening. You provide the message content, the client's ID, and the agent's name to identify where the message should go.

## Function commitStopToolsForce

This function allows you to immediately halt tool execution for a particular client within the swarm, bypassing normal checks. It’s a forceful way to stop a client’s activity, similar to a "flush" command that doesn't wait for things to complete. 

It ensures the session and swarm are valid before stopping the tool execution, and it keeps a record of the action through logging.  The `clientId` you provide identifies the specific client you want to stop. Think of it as a quick and direct way to pause a client’s actions when needed.

## Function commitStopTools

This function lets you temporarily pause a specific agent within the swarm, preventing it from running its next tool. Think of it as putting a brief hold on one agent’s actions. 

It carefully checks that the agent and the client you're referencing actually exist within the system, ensuring you're only stopping what you’re authorized to.

Unlike functions that clear an agent's history, this one just redirects its tool flow. You provide the client ID and the agent's name to specify which agent should be paused.


## Function commitFlushForce

This function lets you aggressively clear the history for a particular client’s session within the agent swarm. It’s designed to force a history flush, even if there's no active agent currently handling the client. Think of it as a "reset" for a client's history – useful when you need to ensure data is cleared regardless of the agent's current status. 

It carefully checks the session and swarm to make sure everything is valid before proceeding. It's built with several services working together for security, consistency, and record-keeping. This function is similar to a forceful assistant message commit but for the entire history instead of just a message. You just need to provide the client's ID to trigger the flush.

## Function commitFlush

This function lets you completely clear the history for a particular agent working for a specific client. Think of it as a "reset" button for an agent’s conversation.

Before it does anything, it double-checks that the agent and client are valid and that the agent's identity matches what’s expected. 

It handles the whole process securely, keeping track of everything happening and using various services to ensure it’s done correctly. It’s designed to wipe the agent's memory, unlike functions that just add new messages.

You need to provide the client ID and the agent's name to use this function.

## Function commitDeveloperMessageForce

This function lets you directly add messages from developers into a session within the agent swarm, bypassing the usual checks for an active agent. It's a powerful tool for situations where you need to ensure a developer's input is recorded, regardless of the current agent's status.

It takes the message content and a client ID to identify the session. 

The function verifies the session and swarm before committing the message, and keeps track of what's happening through logging. Think of it as a way to force a message to be added, similar to how assistant messages can be forced.


## Function commitDeveloperMessage

This function lets you send messages directly to an agent within the AI swarm, like providing instructions or feedback. It’s specifically for messages coming from developers or users, as opposed to messages generated by the AI itself.

Before sending the message, the system carefully checks to make sure the agent, session, and overall swarm are all valid and that you’re targeting the correct agent. 

Behind the scenes, it uses several services to handle validation, message delivery, and logging, ensuring everything runs smoothly and securely. Think of it as a controlled way to give guidance or direction to a particular agent in the swarm. It takes the message content, a client ID to verify the session, and the agent’s name as input.

## Function commitAssistantMessageForce

This function lets you directly push a message from an assistant into a session within the system, bypassing the usual checks for which agent is currently active. It's designed for situations where you need to ensure a message is recorded, even if the agent handling the session isn’t readily available. 

Essentially, it forcefully commits the message after verifying that the session and swarm are valid. Think of it as a shortcut for situations where immediate recording is critical, similar to how `cancelOutputForce` works compared to `cancelOutput`.

You're providing the message content and the client's ID to identify the session. The function takes care of session and swarm validation, then commits the message, all while keeping track of the operations.

## Function commitAssistantMessage

This function lets you record assistant-generated messages for a specific agent within the system. It's designed to ensure everything is set up correctly – verifying the agent, the session it belongs to, and the overall swarm – before saving the message. Think of it as a way to permanently store what the assistant said, making sure it’s linked to the right agent and session. This is used to add assistant responses to the conversation history rather than stopping the process. 

You provide the actual message content, a client ID to identify the user's session, and the name of the agent that produced the message. The system then takes care of validating these details and safely saving the message.

## Function changeToPrevAgent

This function allows you to switch back to the previous agent that a client was using, or if there isn's a previous agent, it will revert to the default one. It's designed to manage client sessions and agent selection within a swarm of AI agents. 

The function takes a client ID to identify which session to adjust. Behind the scenes, it double-checks the session and agent, keeps a log of the change if logging is active, and uses a safe process to ensure the change happens reliably. It’s built to run independently of what else might be happening in the system.

## Function changeToDefaultAgent

This function helps you easily switch a client back to the swarm’s standard, default agent. Think of it as a reset button for a client's agent assignment. It takes a unique identifier for the client session as input. The system then makes sure the session and default agent are valid before making the change, and it handles this process in a reliable, queued manner. It's designed to work smoothly, even within existing operations.

## Function changeToAgent

This function lets you switch which AI agent is currently working on a client’s session within your swarm. Think of it as assigning a different specialist to handle a particular client. 

It handles the behind-the-scenes work of confirming the switch is valid, keeping a record of what's happening, and ensuring the change happens reliably. 

You provide the name of the new agent you want to activate and the unique ID for the client session, and the function takes care of the rest. It's designed to work smoothly even within complex operations.


## Function cancelOutputForce

This function lets you abruptly stop an agent from producing an output for a particular client. It's a way to forcefully interrupt the process, even if the agent is still working or not fully ready.

It ensures the session and swarm are valid before cancelling the output, and it doesn’t worry about whether an agent is currently active or doing anything. 

Think of it as an emergency stop button for a client’s output, offering a more direct way to cancel than other methods. You just need to provide the client's ID to trigger the cancellation.

## Function cancelOutput

This function allows you to stop an agent from producing its output for a particular client. It's useful when you need to interrupt an ongoing process.

It checks to make sure the agent and client you're referencing are valid and exist within the system before proceeding.

Behind the scenes, it handles important tasks like managing the execution environment, keeping track of logs, and ensuring everything is properly validated.

You provide the client's unique identifier and the agent's name to specify which output should be canceled.

## Function addWiki

This function lets you add a new wiki structure to the system, defining how information will be organized and stored. You provide a `wikiSchema` – essentially a blueprint – which describes the wiki’s layout and content types.  The function then integrates this schema, making it available for use within the agent swarm orchestration framework. It returns a string representing a unique identifier for the added wiki schema.


## Function addTriageNavigation

This function helps you set up a system where your AI agents can request help or be directed to a specialized "triage" agent when they need it. It essentially creates a pathway for agents to get assistance. You provide some configuration details—like how the navigation should work—and the function registers it so the agents can use it. Think of it as building a "help" button for your agents, leading them to the right expert.

## Function addTool

This function lets you register new tools that your AI agents can use. Think of it as adding a new skill to the agents' toolbox. By registering a tool this way, the entire system knows about it and agents can start using it to accomplish tasks. The tool's information, like its name and description, are defined in the tool schema you provide. It’s a core step in expanding what your AI agents can do.

## Function addSwarm

This function lets you create a new swarm, which is essentially a blueprint for how your AI agents will work together to handle client interactions. Think of it as defining a specific process or project for your agents to tackle. Once you add a swarm using this function, the system knows about it and can use it to manage client sessions.  It’s important to use this function to register any swarms you want the system to recognize. The registration happens in a safe, isolated environment, and you'll receive the swarm's name to confirm it’s been added. You provide a schema that outlines the swarm's name, what agents will be involved, and how they'll interact.

## Function addStorage

This function lets you add new ways for your AI agents to store and retrieve information, like connecting to a database or cloud storage. Think of it as registering a new tool the swarm can use for remembering things.

When you add a storage method, the system recognizes it and makes it available for your agents to use across different sessions or agents working together.

If the storage is designed to be shared among multiple agents, this function will also automatically set up a connection to ensure everyone can access it. This whole process happens in a separate, clean environment to avoid any conflicts. Finally, the function provides the name of the new storage method so you can easily refer to it later.

## Function addState

This function lets you define and register new states within the agent swarm system. Think of it as declaring a specific type of data the agents can use and share.

By registering a state with this function, you're essentially telling the swarm, "Hey, this is a state we're going to be using." 

If the state is designated as a shared resource, the system will automatically set up the necessary connections to make it accessible to all agents. This function ensures the state is properly initialized and available for use, all while keeping the process isolated and well-documented. You'll get the state's name back after you’re done.

## Function addPolicy

This function lets you add new rules, or "policies," to guide the behavior of agents within your swarm. It essentially registers a policy so it can be used to control how agents operate. The system validates the policy’s structure and keeps track of it for later use. This process helps to ensure agents are following the intended guidelines and provides a centralized way to manage those rules. You'll provide a schema defining the policy, and the function handles the necessary setup behind the scenes.

## Function addPipeline

This function lets you define and register a new workflow, or "pipeline," that your AI agents can follow. Think of it as creating a blueprint for how your agents should work together to accomplish a task. When you register a pipeline, the system checks it to make sure it's set up correctly.  The function returns a unique identifier for the registered pipeline, which you can then use to trigger it later. Essentially, it's how you tell the system about a new, reusable process for your AI agents.


## Function addOutline

This function lets you add new outline structures to the system, essentially defining how different agents will organize their work. It takes a schema describing the outline, including its name and settings. Before adding it, the function makes sure everything is running in a fresh environment to prevent conflicts. If logging is turned on, the action of adding the outline is recorded for tracking purposes.

## Function addMCP

This function lets you add a new Model Context Protocol (MCP) definition to the orchestration framework. Think of an MCP as a blueprint describing how an AI agent interacts with a specific tool or environment. When you register an MCP, the system understands its structure and can manage agents using that protocol. The function takes your MCP definition as input and returns a unique identifier for that schema.

## Function addEmbedding

This function lets you add a new embedding engine to the swarm system. Think of it as registering a new tool the swarm can use to work with text and numbers as vectors. To make sure the swarm recognizes and uses your embedding engine, you *must* register it using this function. It handles the setup in a clean way, and will tell you the name of the newly registered embedding. You’ll need to provide a schema that describes the new embedding engine, including its name and how it's configured.

## Function addCompute

This function lets you define and register the blueprints for the individual tasks your AI agents will perform. Think of it as setting up the instructions for each agent to follow – what data they need, what actions they can take, and what the expected outcome is. When you register a compute schema, the system checks it to make sure it's valid and then stores it for later use. Each schema is given a unique identifier that you'll use to tell your agents which task to execute. This helps keep things organized and ensures everyone is on the same page regarding the work being done.

## Function addCompletion

This function lets you add new completion engines – think of them as ways your agents can generate text – to the system. It's how you integrate different models like GPT4All or OpenAI so your agents can use them. 

When you add a completion engine, it's registered and made available for use by the agents. The system checks the engine’s configuration to make sure everything is set up correctly. 

The process runs independently to keep things clean and the function tells you the name of the newly added completion engine. You provide a schema that describes the engine's properties and how it should work.

## Function addAgentNavigation

This function lets you create a way for one agent in your system to find and interact with another agent. Think of it as setting up a "navigation tool" that allows agents to locate each other. You provide some details about how this navigation should work, and the function registers it so the agents can use it. It returns a unique identifier for this navigation setup, allowing you to manage it later.

## Function addAgent

This function lets you register new agents to be part of the swarm. Think of it as adding a new worker to your team. You provide a description of the agent – its name and how it's set up – and the system adds it to its list of available agents. Only agents registered this way can be used by the swarm to do its work. The registration process is handled in a way that ensures a fresh start, independent of any ongoing operations. You're given the agent’s name back to confirm it’s been added.

# agent-swarm-kit classes

## Class WikiValidationService

This service helps you manage and check the structure of your wikis. You can think of it as a way to ensure your wikis conform to a specific blueprint.

First, you tell the service about the wikis you'll be working with, providing a name and a defined structure (the `IWikiSchema`).  Then, when you have content from one of those wikis, you can use this service to verify that it matches the expected format.  The service keeps track of the wikis you've registered and provides logging to help you understand what’s happening during the validation process.

## Class WikiSchemaService

This service helps manage and organize your wiki schemas, acting as a central place to store and work with them. It's designed to be flexible, allowing you to register new schemas, update existing ones, and easily retrieve them when needed. 

The service uses a schema context to ensure your schemas are consistent and valid. You can think of it as a little helper that keeps track of all your schema information. 

It provides methods to register new schemas, allowing you to give them unique names and associate them with specific data. You can also modify existing schemas, changing their properties as needed. When you need to use a particular schema, you can simply request it by its name, and the service will provide it.

## Class ToolValidationService

This service helps keep track of the tools your AI agents use and makes sure they're properly set up. It acts like a central registry, ensuring that each tool is unique and exists before agents try to use them.

The service remembers which tools are registered and uses a clever trick called memoization to make validation checks faster. It works closely with other parts of the system, like the tool registration service and the agent validation process, to maintain consistency.

You can add new tools to the registry, and the service automatically verifies if a tool already exists before letting agents use it. It also keeps a record of everything it does through logging, which is helpful for troubleshooting.

## Class ToolSchemaService

This service acts as a central library for defining and managing the tools agents use to perform tasks. It keeps track of all available tools, ensuring they have the basic structure needed to function correctly.

When a new tool is added or an existing one is updated, this service verifies its essential components, like the tool's name, execution function, and validation function. It works closely with other parts of the system, such as the agent schema management and agent connection services, to ensure tools are properly integrated and used.

You can register new tool definitions, retrieve existing ones, or even update a tool’s properties. The system keeps a record of these operations, providing logging for debugging and tracking purposes. Think of it as the place where all agent tools are defined and managed, enabling the swarm to operate effectively.

## Class ToolAbortController

The ToolAbortController class is a helper designed to make it easier to control operations that might need to be stopped midway. It essentially wraps the standard AbortController functionality, giving you a way to signal that something should be canceled.

Inside, it manages an AbortController – a component that handles stopping asynchronous tasks. If your environment doesn’t have built-in AbortController support, this class gracefully handles that, instead keeping the internal component as null.

You can use the abort method to trigger the cancellation. This sends a signal to any part of your code that's listening for abort notifications, so it knows to stop what it's doing.

## Class SwarmValidationService

This service acts as a central authority for ensuring the configurations of your AI agent swarms are correct and consistent. It keeps track of all registered swarms and their details, making sure there are no duplicates and that the agent and policy lists are valid.

You can use this service to register new swarms, retrieve lists of agents or policies associated with a specific swarm, or get a complete list of all swarms you’re managing.  

The core functionality is the `validate` method, which performs a comprehensive check on a swarm's setup. This validation is optimized for speed using techniques that avoid repetitive checks, and the entire process is logged for auditing purposes. It relies on other specialized services to handle agent, policy, and schema-related checks, allowing for a modular and maintainable system.

## Class SwarmSchemaService

This service acts as a central library for defining and managing the blueprints of your AI agent swarms. Think of it as a place where you store the configuration details for each swarm, including which agents are involved, their roles, and any associated policies.

It keeps track of these configurations using a registry, ensuring they’re valid before they’re used. Before a swarm can actually run, this service checks that its configuration is properly set up – things like making sure agent names are unique and that the defined roles are correct.

You can register new swarm configurations, update existing ones, or simply retrieve a configuration when needed. The service also logs its actions for debugging purposes, giving you visibility into how your swarms are being configured. This is a fundamental component that ties together many other parts of the system, enabling your agents to work together effectively.

## Class SwarmPublicService

This class acts as a public interface for interacting with a swarm of agents. It essentially provides a way for external components to control and monitor the swarm’s activity, while ensuring that all actions are properly tracked and scoped to a specific client and swarm.

It handles common operations like sending messages, navigating the agent flow, checking the swarm's status (busy or not), managing output, getting information about the current agent, and ultimately, cleaning up the swarm when it's no longer needed.

Think of it as a mediator that translates requests into actions on the swarm, making sure everything happens in a controlled and observable manner. It relies on other services for logging, managing connections, and core swarm functionality, providing a consistent and secure way to interact with the agent swarm. Operations are logged for debugging and performance tracking if logging is enabled.

## Class SwarmMetaService

This service is responsible for organizing and presenting information about your swarm system, essentially creating diagrams to help understand its structure. It pulls data about the swarm’s design from other services and turns it into a standard UML format, which is a common way to visualize software architectures.

Think of it as a translator that takes the raw data describing your swarm and transforms it into a visual representation. It works closely with services that manage agent information and documentation, ensuring consistency in how your swarm is described and visualized. You can use it to generate diagrams that show the relationships between different parts of your swarm, making it easier to understand and debug. This process includes creating a tree-like structure representing the swarm and then converting that structure into a UML diagram.

## Class SwarmConnectionService

This service acts as a central point for managing connections and interactions with AI agent swarms. It intelligently caches swarm configurations to improve performance and reuses them across different requests. Think of it as a coordinator that handles retrieving swarm data, managing agent interactions, and communicating with other services within the system.

It provides functions to get the current agent’s output, navigate between agents, check if the swarm is busy, and handle messaging. This service also plays a role in ensuring events are properly emitted and connections are cleaned up when they're no longer needed. Essentially, it's the glue that binds together the different components involved in running and interacting with your AI agent swarms.

## Class StorageValidationService

The StorageValidationService helps ensure that your storage configurations within the agent swarm are set up correctly and consistently. It keeps track of all registered storage types and their settings, making sure each one is unique and properly configured. 

When you add a new storage, this service registers it and verifies that it doesn't already exist.  The `validate` function then checks if a specific storage exists and confirms that its embedding details are also correct, which helps maintain reliable storage operations. The service is designed to be efficient, remembering previous validation results to avoid unnecessary checks. It relies on other services for logging and embedding validation.

## Class StorageUtils

This class helps manage storage for individual clients and their agents within the swarm. It provides a set of tools for interacting with storage, ensuring that access is properly authorized and logged.

You can use it to fetch a limited number of storage items based on a search query, add or update items, delete existing items, or retrieve a specific item by its ID.  It also allows you to list all items within a storage area, filter them based on specific criteria, create a numeric index for storage, and completely clear out a storage area. 

Before any action is taken, the system verifies that the client has permission to access the specified storage, and that the agent is registered to use it, helping keep things secure and organized.

## Class StorageSchemaService

This service acts as a central hub for managing how your AI agents interact with storage. It's like a librarian, keeping track of all the rules and blueprints for accessing and organizing data.

The service registers storage configurations, ensuring they're set up correctly before agents start using them. It validates these configurations to make sure the necessary pieces are in place, like instructions for indexing data and referencing embeddings.

It works closely with other services that handle storage connections, agent schemas, and public storage access. You can think of it as providing the foundational information needed for those other services to function smoothly.

If you need to add a new storage setup or change an existing one, this service provides the tools to do so safely and consistently. It keeps track of everything, making sure your AI agents have the right access to the data they need, when they need it.

## Class StoragePublicService

This service manages storage specifically for each client in the system. Think of it as a way to keep each client’s data separate and organized. It builds on a lower-level storage service and adds extra features like logging and context management.

Here's a breakdown of what it lets you do:

*   **Store and Retrieve Data:** It provides methods to put items into storage (`upsert`), get specific items (`get`), and pull lists of items (`take`, `list`).
*   **Client-Specific Focus:** All operations are tied to a particular client, ensuring data isolation.
*   **Cleanup:** You can remove individual items (`remove`), clear entire storage areas (`clear`), or dispose of the storage entirely (`dispose`).
*   **Logging:** Detailed logging is available to track activity, controlled by a global configuration setting.

This service is essential for components like the ClientAgent, which needs to store and retrieve client-specific data, and the PerfService, which tracks storage usage. It’s designed to be more focused than a system-wide storage solution.

## Class StorageConnectionService

This service acts as the central hub for managing storage connections within the agent swarm. It's designed to efficiently handle both client-specific storage and shared storage across the system.

Think of it like this: when an agent needs to store or retrieve data, this service finds or creates the right storage space for it. It intelligently reuses existing storage connections to avoid unnecessary overhead, caching them for faster access.

It’s deeply integrated with other parts of the system, like the agent execution environment and the public storage API, ensuring a consistent and reliable storage experience. If a storage space is marked as shared, the service will handle it differently, delegating the management to a dedicated shared storage service.  The service also keeps track of how much storage is being used, ensuring appropriate usage and cleanup.  It uses logging to track activity and relies on several other services to configure and manage storage correctly.

## Class StateValidationService

This service helps manage and verify the structure of data representing the state of your AI agents. Think of it as a quality control system for your agents' information. You can define what each state *should* look like – the data types and required fields – using the `addState` method. Then, when you receive data for a particular state, the `validate` method checks if it conforms to your defined schema. The `_stateMap` property internally keeps track of all the state definitions, and `loggerService` is used for logging any issues or errors encountered during validation.

## Class StateUtils

This class helps manage information associated with individual clients and agents within the swarm. It provides simple ways to fetch, update, and reset specific pieces of data for each client and agent combination.

You can use it to retrieve existing state data, update state either with a direct value or a function to calculate the new value based on what’s already there, and completely clear out the data for a particular client, agent, and state.  Before any of these actions happen, the system checks to ensure the client is authorized and that the agent is properly registered, and all actions are logged for tracking purposes.

## Class StateSchemaService

This service acts as a central place to manage the blueprints for how your agents handle data—think of it as defining the shape and rules for their memory. It keeps track of these blueprints, making sure they're consistent and valid.

It's tightly connected to other parts of the system, including how states are configured, how agents use them, and how they're exposed publicly.  It validates each blueprint before it's put into use, and logs its actions for debugging.

You can register new blueprints, update existing ones, or simply retrieve a blueprint when needed. This service ensures that all parts of the swarm are working with the same, reliable definitions for how agents deal with their data.

## Class StatePublicService

This service manages state specifically for each client interacting with the swarm system. Think of it as a way to keep track of data unique to each individual client, distinct from system-wide settings or persistent storage. It works closely with other parts of the system like the ClientAgent and PerfService, and keeps a log of its actions when logging is enabled.

The core functions let you set, clear, retrieve, and dispose of this client-specific state. Each operation is wrapped to ensure it’s properly scoped and logged for auditing and debugging. It provides a public interface for managing client data, relying on other services for the underlying operations. If you need to track something different for each client, this is the service to use.

## Class StateConnectionService

This service is the central hub for managing state within the agent swarm system. Think of it as a smart cache and coordinator, making sure each agent's data is handled correctly.

It cleverly caches state information for each client and state name, so it doesn't have to recreate things every time. If a state is meant to be shared across the entire swarm (like a global setting), it delegates that responsibility to a separate service.

When you need to get, set, or clear a state, this service uses a series of helper services to configure things properly, track usage, and ensure thread-safe operations. Importantly, it keeps a record of which states are shared, so it doesn't accidentally clear them. It's designed to work seamlessly with other components, like the agent execution engine and the public state API, to keep everything consistent and efficient.


## Class SharedStorageUtils

This utility class helps your agents share information and coordinate. It provides tools to retrieve, add, update, and delete data stored in a central location accessible by all agents. You can fetch items based on search queries, add new information, update existing entries, or remove data entirely. There are also methods to list all items in a storage area, optionally filtering them, and to completely clear a storage area. Each operation is carefully checked to ensure that the storage area being accessed is valid, and all actions are logged for tracking and debugging.

## Class SharedStoragePublicService

This service manages how different parts of the system interact with shared storage. It acts as a public-facing interface, handling requests for tasks like retrieving, adding, updating, deleting, and clearing items from storage. Think of it as a controlled way for different components to access and manage shared data. 

It keeps track of what’s happening through logging, and relies on other services to handle the actual storage operations and to ensure everything is done securely and within defined boundaries. The system uses this service when things like client requests, performance monitoring, or documentation need to interact with shared storage. Specifically, functions like searching, adding, removing, and clearing data are handled through this service, ensuring a consistent and controlled process across the entire swarm.

## Class SharedStorageConnectionService

This service manages shared storage connections for the swarm system, acting as a central point for all clients to access and modify data. It ensures that only one shared instance of the storage exists, preventing conflicts and maintaining data consistency. 

Think of it as a communal whiteboard where all agents can read and write, but it's carefully controlled to prevent chaos. The service relies on other services for configuration, logging, and event handling.

Here’s a breakdown of what it offers:

*   **`getStorage`**: The core method to retrieve or create a shared storage instance, automatically caching it for efficiency.
*   **`take`**: Searches for and retrieves a list of data items, potentially using similarity-based search.
*   **`upsert`**: Adds or updates data items in the storage.
*   **`remove`**: Deletes an item from the shared storage.
*   **`get`**: Retrieves a specific item by its ID.
*   **`list`**: Retrieves a list of items, optionally filtered.
*   **`clear`**: Empties the entire storage.

It works closely with other services like the logging service and event bus, ensuring that operations are tracked and synchronized across the entire swarm.

## Class SharedStateUtils

This class offers tools for agents to easily share information within the swarm. Think of it as a central whiteboard where agents can read, write, and erase notes (the shared state).

You can use it to fetch existing shared data using `getState`, providing a way for agents to access common knowledge. 

To update the whiteboard, `setState` lets you either directly set new data or provide a function that calculates the new data based on what's already there.

Finally, if a piece of information is no longer needed, `clearState` allows you to erase that specific item from the shared whiteboard, resetting it to its original condition.

## Class SharedStatePublicService

This service manages shared data across your AI agent swarm, acting as a central point for getting, setting, and clearing that data. It's designed to be flexible, working with different types of data thanks to its generic type support. Think of it as a shared whiteboard where different agents can read and write information, but with built-in safeguards and logging to keep things organized and traceable.

It relies on other services like a logger for recording actions and a connection service for the actual data operations. The service ensures operations are properly scoped and provides a public API for agents to interact with the shared state, while underlying functionality is handled securely. It’s used by components like ClientAgent and PerfService to manage and track state changes within the swarm.


## Class SharedStateConnectionService

This service helps manage shared information across different parts of the AI agent swarm. Think of it as a central whiteboard that agents can read and update, ensuring everyone is on the same page.

It intelligently reuses existing shared state information to avoid unnecessary overhead and ensures that any changes are made safely and in a controlled manner. It connects with other services to handle logging, event broadcasting, and state configuration.

You can use it to:

*   **Get the current shared state:** Retrieve the latest information stored on the central whiteboard.
*   **Update the shared state:**  Provide a function to modify the existing state, which ensures modifications are handled in a safe, serialized way.
*   **Reset the shared state:** Clear the whiteboard and return it to its original setup.


## Class SharedComputeUtils

This utility class, `SharedComputeUtils`, helps manage shared computing resources within the AI agent swarm. Think of it as a helper for accessing and refreshing information about these resources. 

You can use the `update` function to ensure the system has the most current details about a specific compute resource.  It's useful to call this periodically to keep everything synchronized. 

The `getComputeData` function lets you retrieve details about a compute resource, like its configuration or status. It's generic, so you can specify the expected data type when requesting information, making it type-safe. It requires a client ID and the name of the compute resource you're interested in.

## Class SharedComputePublicService

This component manages access to shared computational resources for your AI agents. Think of it as a central hub that allows different agents to request and utilize processing power.

It relies on a logger for tracking activity and connects to a core service that handles the actual compute connections.

You can use it to retrieve data associated with a specific computation and trigger calculations on demand. There’s also a method for updating the state of computations. Essentially, this framework provides a simplified way for agents to interact with and leverage shared computing capabilities.

## Class SharedComputeConnectionService

This service helps manage connections and data sharing between different AI agents working together. Think of it as the central hub for agents to access and update shared information.

It uses a logging system to track activity and a messaging bus to communicate between agents.  It keeps track of the available compute resources and allows you to easily retrieve references to them.

You can use it to fetch data from shared compute resources, calculate values based on shared state, and update the shared state itself. The service is designed to remember previously fetched compute references for faster access.

## Class SessionValidationService

This service keeps track of which agents, storages, histories, states, and computes are being used within each active session in the swarm system. It helps ensure that resources are properly associated with sessions and that everything is cleaned up correctly when a session ends.

Essentially, it're acting as a central record-keeper for session activity.

Here’s a breakdown of what it does:

*   **Registers Sessions:** It formally adds a new session to the system, associating it with a specific swarm and mode of operation.
*   **Tracks Resource Usage:** It records when agents, storage, history, states, and computes are used within a session, maintaining lists of what's being used.
*   **Removes Resource Usage:** It removes records when these resources are no longer needed by a session.
*   **Checks Session Existence:** It quickly verifies if a session is active.
*   **Retrieves Information:** It provides access to lists of agents, storages, histories, states, computes, and swarm names associated with a session.
*   **Validates Sessions:** It quickly confirms whether a session exists, using a performance optimization (memoization) to avoid redundant checks.
*   **Cleans Up Sessions:** It provides functions to remove sessions entirely and to clear validation caches when needed.

The service uses logging to keep track of important operations and relies on dependency injection for the logger to enable flexible configuration.

## Class SessionPublicService

This service acts as the public-facing interface for managing interactions within a swarm AI agent system. Think of it as the gatekeeper for session-based conversations and operations.

It handles things like sending messages to the session, executing commands, and running quick completions.  Behind the scenes, it relies on other services to manage the actual session logic, track performance, and ensure proper context is maintained. 

Essentially, it provides a standardized way for client applications to interact with the swarm, while keeping the underlying complexities hidden.  The service logs a lot of activity for debugging and monitoring, but this can be controlled to reduce log volume.

## Class SessionConnectionService

This service manages connections and operations within a swarm system, acting as a central hub for sessions. Think of it as a session manager that keeps track of active conversations between clients and the swarm. It efficiently reuses session data, ensuring quick access for various operations.

It handles communication between different components, like agent execution, public APIs, policy enforcement, and performance tracking. When a new session is requested, it fetches existing data or creates a new one, making the process fast and reliable.

You can use this service to:

*   **Get a Session:** Retrieve or create a session for a client and swarm, ensuring efficient reuse of data.
*   **Send Notifications:** Relay messages to connected listeners.
*   **Execute Commands:** Run commands within a session using different modes.
*   **Run Stateless Completions:** Execute quick actions within a session.
*   **Connect Clients:** Establish a connection between a client and a session.
*   **Record Actions:** Log tool outputs, system messages, and developer interactions within a session.
*   **Clean Up:** Dispose of a session connection and clear associated data when no longer needed.

Essentially, this service streamlines the overall session experience within your swarm environment, promoting efficiency and reliability.

## Class SchemaUtils

This class offers helpful tools for working with the data stored during a client's session and for converting data into strings. 

You can use it to save information to a client's session memory, retrieving that same information later. This functionality includes checks to make sure the session is active and valid.

It also provides a method to transform objects and arrays into neatly formatted strings, which is useful for things like logging or transmitting data. You can even customize how the keys and values are handled during this serialization process.

## Class RoundRobin

This class provides a simple way to rotate through a list of creators, ensuring each one gets a turn. Think of it like a round-robin tournament where each participant gets a chance. 

It's designed to help you distribute tasks or calls across multiple functions or instances in a predictable, cyclical fashion. You define a set of "tokens" – identifiers for your creators – and the RoundRobin class handles cycling through them.

The `create` method is the key to setting it up; you give it your tokens and a function that knows how to create an instance based on a token, and it returns a function ready to distribute work. Internally, it keeps track of which creator is currently active and logs this information if you’d like.

## Class PolicyValidationService

This service helps ensure that the swarm system’s policies are correctly registered and can be enforced. It keeps track of all the policies the system knows about, making sure there are no duplicates.

The service relies on other parts of the system, like the policy registration service and the policy enforcement mechanism, to work properly. It also uses logging to keep track of what’s happening and makes validation checks faster by remembering previous results.

You can add new policies to the service, and it will ensure that they’re unique.  The core function is to validate whether a policy exists, which is important for making sure the swarm is operating correctly.

## Class PolicyUtils

This class provides helpful tools for managing client bans within your AI agent swarm's rules and guidelines. It simplifies the process of banning, unbanning, and checking the ban status of clients. 

The `banClient` method lets you block a specific client from interacting with a particular swarm and policy, ensuring proper validation before the action takes place. Similarly, `unbanClient` reverses this action. 

To quickly determine if a client is currently banned, you can use the `hasBan` method, which will check the relevant policy and provide a simple yes or no answer. Each function ensures things are checked before any changes happen, and keeps track of what’s going on for auditing and troubleshooting.

## Class PolicySchemaService

This service acts as a central place to store and manage the rules (policies) that control how agents within the swarm operate. Think of it as a rulebook for the system.

It makes sure these rules are valid and consistent, checking for basic requirements. This service is used by various components, including those handling client connections, agent execution, and session management, to ensure policies are correctly enforced.

You can register new rules, update existing ones, and retrieve them as needed. The system keeps track of these policies and uses them to control access and restrictions within the swarm. The service also logs its actions to help with troubleshooting and monitoring, if enabled.

## Class PolicyPublicService

This service manages how policies are applied and enforced within the swarm system. It acts as a central point for checking if a client is banned, retrieving ban messages, validating data (both what's sent in and what's sent out), and managing client bans and unbans.

It works closely with other services, like those handling performance, client interaction, documentation, and swarm metadata, to ensure consistent and controlled policy application.  You're able to check if a client is restricted, understand *why* they're restricted, and even directly ban or unban clients through this service. Importantly, operations are logged for auditing and debugging purposes, but this is controlled by a global configuration setting.

## Class PolicyConnectionService

This class is a central hub for managing how policies are applied and enforced within the swarm system. It handles tasks like checking if a client is banned, retrieving ban messages, validating input and output, and of course, banning or unbanning clients. 

Think of it as a specialized service that ensures everyone follows the rules defined by policies, whether they're individual clients or entire sessions. It’s designed to be efficient, reusing policy information whenever possible, and it integrates seamlessly with other system components for logging and event handling. Essentially, it's the gatekeeper for policy enforcement across different parts of the system.


## Class PipelineValidationService

This service helps you ensure your AI agent pipelines are set up correctly before you start running them. Think of it as a quality control checkpoint. 

You use it to register your pipeline definitions, providing a name and a schema describing its structure.  Then, when you're ready to run a pipeline, you can use this service to validate it against its schema – essentially, to make sure everything is as it should be. The service uses a logger to provide feedback on the validation process. It keeps track of your registered pipelines internally to manage them effectively.

## Class PipelineSchemaService

This service helps manage and organize the blueprints for your AI agent workflows, which we call pipeline schemas. Think of it as a central place to store, update, and retrieve those blueprints. 

It keeps track of all your schemas and allows you to register new ones, update existing ones, and easily access them when needed. It works closely with a schema context service to ensure your schemas are valid and consistent. 

Essentially, this service makes it simple to organize and reuse your AI agent workflow definitions. You can register new workflows, change existing ones, and grab a copy of a specific workflow whenever you need it.

## Class PersistSwarmUtils

This class helps manage how your AI agent swarms remember important information like which agent is currently active and the history of agent transitions. It provides ways to store and retrieve this data for each client and swarm.

The system uses "adapters" to handle the actual storage – allowing you to plug in different methods for persistence, like databases or in-memory storage.  You can use it to easily get the currently active agent for a specific user and swarm, or to set a new active agent.  It also lets you track the sequence of agents a user has interacted with, providing a navigation history.  The system efficiently manages persistence by ensuring only one storage instance is used per swarm.

## Class PersistStorageUtils

This utility class helps manage how data is stored and retrieved for each client within the swarm system. It allows you to associate data with a client identifier and a storage name, like keeping track of a user's records or logs. 

The class uses a clever memoization technique to ensure you’re only creating one storage instance for each storage name, which helps conserve resources. You can also customize how the storage persists data by providing your own persistence adapter. This lets you, for example, connect your storage to a database instead of using a default method.

Retrieving data uses `getData`, which allows you to provide a default value to use if the data hasn't been saved yet. `setData` is used to save data for a specific client and storage name, ensuring it’s available later.

## Class PersistStateUtils

This class helps manage how information is saved and retrieved for each agent within the swarm. Think of it as a way to remember things like agent variables or context between interactions.

It provides simple ways to store and retrieve data associated with a specific agent (identified by a unique ID) and a named piece of information. If the information isn't already saved, you can even provide a default value to be used instead.

You can also customize how this data is stored – for example, using an in-memory solution or connecting to a database – to suit your specific needs. This allows for flexible and powerful state management within the swarm system.

## Class PersistPolicyUtils

This class helps manage how policy information, specifically lists of banned clients, is stored and retrieved within the AI agent swarm. It provides simple ways to get and set these banned client lists for a particular policy within a specific swarm.

The system tries to be efficient by ensuring that each swarm only uses one persistence mechanism. You can also customize how the policy data is stored, allowing you to use alternative methods like in-memory storage or a database instead of the default.

Essentially, it's a toolkit for controlling and persisting client ban status within the swarm environment, giving you flexible control over access and security.

## Class PersistMemoryUtils

This class helps manage how memory is saved and loaded for each individual user session within the swarm system. It provides a simple way to store and retrieve data associated with a specific user, ensuring that information persists between interactions.

Think of it as a place to temporarily save context or data for a user so it's available later. 

You can even customize how this data is stored, choosing a specific method like using an in-memory store or connecting to a database. When a session is finished, you can tell the class to clean up the saved memory.

## Class PersistEmbeddingUtils

This utility class helps manage where and how your AI agent swarm stores embedding data – think of the numerical representations of text or other information used by the agents. It provides tools to both read and write this data, and it’s designed to be flexible, letting you customize exactly how the data is persisted.

The system remembers the storage it’s using for each type of embedding data, so it doesn’t create unnecessary duplicates. You can easily check if an embedding has already been computed and stored, and if not, save the result for later use.

Importantly, you can swap out the default storage mechanism with your own custom implementation, like using an in-memory store or connecting to a database, to tailor the persistence behavior to your specific needs.

## Class PersistAliveUtils

This class helps keep track of which clients are online and offline within your swarm system. It allows you to easily mark a client as online or offline, and then check their status later. Think of it as a simple way to know if a client is ready to participate in swarm tasks. 

The system automatically manages how this status is stored, creating a dedicated storage location for each client to prevent unnecessary resource use. You can also customize the storage mechanism if you need something more specific, like using a database instead of the default approach.

## Class PerfService

The `PerfService` class is responsible for tracking and logging performance data for client sessions within the AI agent swarm system. It acts as a performance monitoring tool, measuring things like execution times, input/output sizes, and session states.

Essentially, it works hand-in-hand with the `ClientAgent` workflows (`execute`, `run`, etc.) to gather these performance metrics. It uses a variety of other services (like session validation, memory schema, and public services) to retrieve necessary information for a complete picture of performance.

You can think of it as a central data collector, gathering and organizing performance information into easily digestible records, which are then used for reporting and analysis. The service provides methods to start and stop tracking executions, get summaries of performance, and then prepare that data into a format ready for review. It cleans up when it’s done, ensuring that no data remains after the session is complete.

## Class OutlineValidationService

This service helps keep your outline schemas – the blueprints for how your AI agents organize their work – consistent and reliable. It acts like a librarian, ensuring each outline has a unique name and exists before anything tries to use it. 

The service manages a collection of registered outlines, providing a way to add new ones and check if they're valid. It's designed to be efficient; it remembers validation results to avoid redundant checks. 

You can register new outline schemas with this service, and it will log those actions. It also provides a list of all known outline names, and a way to verify that a specific outline actually exists when needed. It uses other services to handle completion schema management and validation, too.

## Class OutlineSchemaService

This service helps manage the blueprints, or "outlines," that guide your AI agents. Think of it as a central place to store and update the instructions your agents follow.

It lets you register new outline blueprints, update existing ones with just the changes needed, and easily retrieve them when your agents need them. It keeps track of everything happening, providing logs for troubleshooting.

The service uses a system to make sure outlines are properly structured and validates them before they're put into use. It also relies on other services to handle logging and schema management, making it a well-integrated part of the agent swarm system.

## Class OperatorInstance

This class represents a single instance of an operator within an AI agent swarm. Think of it as a specific agent participating in a coordinated effort. 

Each operator instance is identified by a client ID and a name, and it allows you to set up callbacks for certain events. 

You can use the `connectAnswer` method to subscribe to incoming answers.  The `notify` method sends out general notifications, while `answer` is specifically for providing answers.  `recieveMessage` handles incoming messages, and finally, `dispose` cleanly shuts down the operator's connection when it’s no longer needed.

## Class NavigationValidationService

This service helps manage how agents move around within the swarm, making sure they don't get stuck in loops or waste time revisiting the same spots. It keeps track of where agents have already been, creating a record of their navigation paths.

You can think of it as a memory for the swarm's movements, allowing it to learn from past routes and optimize future navigation. The service uses a technique called memoization, which is like a shortcut, so it can quickly access and update these navigation records without repeating calculations.

It also keeps a log of navigation events, helping with troubleshooting and understanding how agents are moving through the system. You can tell it to start fresh with a particular client and swarm, clear the existing path, or completely remove a navigation route when it's no longer needed.

## Class NavigationSchemaService

This service keeps track of which navigation tools are being used within the agent swarm. It essentially maintains a list of recognized tool names. 

You can register a new tool name with the `register` method, letting the system know that this tool is now part of the workflow. The `hasTool` method lets you quickly check if a particular tool name is already registered. 

The service also includes logging capabilities to provide insights into registration and lookup operations, which can be enabled through configuration.

## Class MemorySchemaService

This service manages temporary, in-memory data specific to each session within the swarm system. Think of it as a simple scratchpad for each session, allowing different parts of the system to store and retrieve small amounts of data without needing to save it permanently.

It uses a straightforward key-value store – associating a session identifier with whatever data you need to keep around. You can write data to a session’s memory, read data back, or completely clear out a session’s memory when it’s no longer needed.

This isn’t intended for storing large datasets or anything that needs to be persisted. It’s a lightweight solution designed to hold session-specific information for things like agent runtime data or temporary session states. The service keeps track of these operations through logging, providing insight into how data is being used.

## Class MCPValidationService

This service helps keep track of and ensure the correctness of Model Context Protocols, or MCPs. Think of it as a central registry for these protocols.

It uses an internal record to store MCP schemas, associating each schema with a unique name. 

You can use this service to add new MCP schemas to the registry and to check if a specific schema exists and is properly formatted. A logging service is also included to track what's happening behind the scenes.

## Class MCPUtils

This utility class, MCPUtils, helps manage updates to the tools used by clients connected via the Multi-Client Protocol. Think of it as a central place to ensure everyone's using the latest versions. You can use it to push updates to all clients simultaneously, or target a single client for a more focused deployment. The `update` method is your primary way to do this, simply providing the MCP name and optionally specifying a particular client.

## Class MCPSchemaService

This service helps manage the blueprints for how AI agents communicate and share information – we call these blueprints MCP schemas. Think of it as a central place to define and keep track of these communication standards.

It uses a logger to record its actions and relies on another service to handle the overall context of these schemas. 

You can register new schemas, update existing ones (by partially modifying them), and easily retrieve them by name. Basically, it’s your go-to tool for keeping your AI agent communication organized and consistent.

## Class MCPPublicService

This class provides a way to interact with Model Context Protocol (MCP) operations, letting you manage and use tools within a defined environment. It handles tasks like listing available tools, confirming if a tool exists, actually running a tool, and cleaning up resources when you’re finished. 

You'll find methods to update the tool lists, either for all clients or for a specific client, and to check for the existence of a particular tool. It also uses a logger for recording actions and relies on another service to handle the underlying MCP communication. Essentially, it's your gateway for working with MCP tools in a controlled way.

## Class MCPConnectionService

The MCPConnectionService manages how your AI agents connect to and interact with models using the Model Context Protocol. It acts as a central hub, handling everything from listing available tools to actually running them.

Think of it as a connection manager; when an agent needs to use a specific tool, this service finds or creates the necessary connection to the model. It keeps track of these connections and can clear them up when they’re no longer needed.

The service relies on other components for logging, communication, and accessing model information. It provides functions for listing available tools, refreshing those lists, and, most importantly, for executing tools with given input data. It efficiently reuses established connections when possible, remembering previously created model connections to avoid unnecessary overhead.

## Class LoggerService

The LoggerService helps manage logging within the agent swarm, making sure important information is recorded consistently. It handles different levels of logging – normal, debug, and informational – and sends those messages to both a general system logger and a client-specific logger, if one is available. The system uses context information about the method and execution to add extra details to the logs, making it easier to track down issues or understand what’s happening.

You can customize the logging process by swapping out the default logger with your own, which can be helpful for testing or more complex setups. The service relies on a few helpers – like the method and execution context services – to keep everything organized and provides a way to create client-specific loggers as needed. Different parts of the system, such as the performance and documentation services, all use this centralized logging approach.

## Class LoggerInstance

This component manages logging specifically for a client, allowing you to customize how messages are handled. When you create a logger, you can provide callback functions to intercept log messages or control whether they appear in the console.

The logger ensures initialization happens only once. It provides methods for logging different types of messages – general logs, debug information, and informational messages – all of which can be customized with callbacks. Finally, it offers a `dispose` method for cleanup, which also allows for a final callback function to be executed.

## Class HistoryPublicService

This service manages how history information is accessed and handled within the agent swarm system. It acts as a public interface for interacting with agent history, ensuring operations are properly tracked and scoped.

It's designed to work closely with other parts of the system, including client agents, the agent public service, performance tracking, and documentation.  You're able to add messages to the history, retrieve the most recent message, convert the history into an array for various processing needs (like preparing context or generating documentation), and clean up the history when it’s no longer needed.

Logging is enabled for history operations if a global configuration setting is turned on, and this aligns with how other key services in the system handle logging.  Essentially, it provides a controlled and traceable way to manage the history associated with each agent.

## Class HistoryPersistInstance

This class is responsible for keeping track of a conversation history for an AI agent, ensuring that the record is both stored in memory and saved to disk. Each history instance is linked to a specific client ID.

It handles loading existing conversation data when an agent starts up and saving new messages as they are added. You can iterate through the history to review past messages, adding filters or system prompts as needed. Adding a new message automatically saves it to persistent storage. You can also remove the most recent message, updating the saved history. Finally, you can clear the entire history, either for a single agent or for all agents.

## Class HistoryMemoryInstance

This component handles keeping track of messages for an agent in memory, without saving them permanently. When you create an instance, you provide a unique identifier for the agent and optional callback functions to customize how messages are handled.

It makes sure initialization only happens once per agent, and provides a way to get all the messages in order, potentially applying filters or system prompts along the way. You can easily add new messages, remove the most recent one, and clean up the entire history when it's no longer needed, either for a specific agent or globally. The callbacks allow you to react to events like adding or removing messages.

## Class HistoryConnectionService

This service manages the history of interactions for each client and agent within the swarm system. Think of it as a central place to keep track of what's happening during an agent’s execution. It efficiently reuses history data by caching it, avoiding unnecessary reloads.

Here’s a breakdown of what it does:

*   **Gets History:** It retrieves or creates a history record for a specific client and agent, making sure the data is readily available.
*   **Adds Messages:** It allows adding new messages or actions to an agent's history.
*   **Removes Messages:** It provides a way to retrieve the most recent message from an agent's history.
*   **Formats History:** It can convert the agent's history into different formats, like arrays, suitable for agent processing or reporting.
*   **Cleans Up:** When finished, it properly cleans up the history data to free up resources and track usage.

This service works closely with other parts of the system, such as those handling agent connections, public APIs, and performance tracking, to ensure consistent and reliable history management.

## Class ExecutionValidationService

This service helps manage and validate the execution of tasks within your AI agent swarm. It keeps track of how many times a particular task is running for a specific client and swarm to prevent issues like runaway processes or excessive nesting.

The `getExecutionCount` method retrieves information about the current execution state – a set of active execution IDs – for a client and swarm. `incrementCount` keeps track of new executions, making sure there's not too much nesting happening. `decrementCount` resets the count when a task finishes. `flushCount` clears the actively tracked execution IDs. Finally, `dispose` completely removes the memoized count for a client and swarm.

## Class EmbeddingValidationService

This service helps keep track of the embeddings used within the swarm, making sure they're all properly registered and exist when needed. It acts as a central registry for embeddings, ensuring each one has a unique name and a defined structure. 

When a new embedding is added, this service records it and checks that the name hasn't already been used.  The `validate` function quickly verifies if a given embedding name is registered, and this check is optimized for speed. This helps prevent errors when the swarm is searching for or using embeddings, and it works closely with other services like the one that manages embedding schemas and the one that handles storage.  It keeps a log of these operations, and relies on a logging component for detailed information.

## Class EmbeddingSchemaService

This service acts as a central place to manage the blueprints for how embedding calculations work within the system. Think of it as a library of instructions on how to create and compare embeddings, which are numerical representations of data used for tasks like searching and similarity matching.

It keeps track of these "embedding schemas" using a registry, ensuring they are valid before they're used. The service integrates with other parts of the system to handle storage, agent execution, and schema management.  It logs activity to provide insights into embedding operations, which helps with troubleshooting and understanding how embeddings are being utilized.

You can register new embedding schemas, update existing ones, and easily retrieve them when needed. This ensures that the system always has access to consistent and reliable embedding logic for performing various tasks, particularly those involving data storage and retrieval.

## Class DocService

This class is responsible for automatically creating documentation for your AI agent system, including its swarms, individual agents, and performance data. It generates Markdown files for describing agents and swarms, and JSON files for tracking performance.

Think of it as a documentation generator that helps you understand and share information about your complex agent setup.

Here's a breakdown of what it does:

*   **Automatic Generation:** It creates documents for swarms (groups of agents), agents themselves, and captures how well your system is performing.
*   **Visualizations:**  It can create diagrams (using UML) to visually represent the structure of your agents and swarms.
*   **Performance Tracking:** It logs and records performance data, allowing you to monitor and analyze how well your agents are working.
*   **Structured Output:**  It organizes documentation into a standard directory structure making it easy to navigate and understand.
*   **Concurrency:** Handles large documentation tasks by utilizing a thread pool to manage concurrency.
*   **Integration:** Connects with other services within your system (like performance tracking and schema validation) to gather information for the documentation.

In essence, this class streamlines the process of creating and maintaining documentation for your AI agent system, ensuring everyone can easily understand and contribute.

## Class ComputeValidationService

This service helps manage and verify the state of your AI agents working together. It keeps track of different "compute" tasks – think of them as specific jobs your agents need to do. 

You can add new compute tasks, each with its own schema defining what information it expects. The service then allows you to validate data against these schemas, making sure your agents are communicating correctly and producing the expected results. 

Essentially, it's a way to organize and ensure the reliability of your AI agent swarm by checking that each agent is doing what it’s supposed to. You can see a list of registered compute tasks, and the service provides a way to validate incoming data against those tasks. The service also uses a logger for tracking and debugging.

## Class ComputeUtils

The `ComputeUtils` class provides tools for managing and retrieving information related to computational resources within the agent swarm. You can use it to notify the system about updates to a compute resource, simply by calling the `update` method, specifying the client ID and compute name. 

Retrieving details about a compute resource is easy too, with the `getComputeData` method. It allows you to fetch the compute data and automatically figures out the correct data type based on what you're expecting. This is helpful when you need to work with different kinds of compute information.

## Class ComputeSchemaService

This service helps manage and organize different schema definitions for your AI agents. Think of it as a central place to store and retrieve blueprints for how your agents should understand and work with data.

You can register new schema definitions, update existing ones, and easily access them when needed. The service keeps track of schema contexts, providing tools to manage and validate them. It uses a logger to help you track what's happening, and it's designed to be flexible enough to work with various schema types. The service is set up to be handled by a dependency injection system, simplifying its integration into larger applications.

## Class ComputePublicService

This class, `ComputePublicService`, acts as a central hub for interacting with compute resources within your AI agent swarm. It provides a way to retrieve data, trigger calculations, and manage the lifecycle of compute tasks. 

Think of it as a messenger service – you give it instructions like "get data for this compute" or "trigger a calculation," and it handles the behind-the-scenes communication. 

The `getComputeData` function allows you to fetch information related to a specific compute resource. `calculate` initiates a processing task, `update` modifies existing compute configurations, and `dispose` gracefully shuts down a compute task. The service relies on a logger for tracking activity and another service for managing compute connections.

## Class ComputeConnectionService

This component, `ComputeConnectionService`, is a core piece that manages how different AI agents connect and share computational resources within the swarm. It acts as a central hub for retrieving and coordinating compute tasks, ensuring that agents can access the resources they need when they need them. 

It uses several other services to handle things like logging, communication, managing context, and validating sessions. You can think of it as the traffic controller for compute jobs. 

The `getComputeRef` function is particularly important; it's used to get references to specific compute tasks, and it remembers previous calls to avoid unnecessary work. `getComputeData` retrieves the overall state of the computations, while `calculate` triggers a calculation based on a given state name.  `update` performs an update and `dispose` cleans up when the service is no longer needed.

## Class CompletionValidationService

This service acts as a gatekeeper for ensuring that completion names used within your AI agent swarm are valid and unique. It keeps track of all registered completion names and makes sure that any time a completion is used, it’s a name that's actually been registered.

It's designed to work closely with other parts of the system – the service that handles registration of completions, the service that validates what agents are doing, and the main client agent application.  It also includes logging to help track validation activities and errors. To keep things efficient, it remembers the results of previous validation checks. 

You can add new completion names to the list using the `addCompletion` method.  The `validate` method is what's used to check if a completion name is valid, and it’s optimized to be fast.

## Class CompletionSchemaService

This service is responsible for managing the blueprints for how agents complete tasks. Think of it as a central library storing and organizing these "completion schemas," which define things like what data an agent needs and how it should process it.

It ensures these schemas are in a basic working order when they's added or changed, and it keeps track of them using a structured registry. Other parts of the system, like the agent connection and execution components, rely on this service to get the necessary completion instructions. 

It logs certain operations to help with debugging and monitoring, but that logging can be turned off. It's a critical piece in making sure agents have the right instructions to do their jobs effectively. You can register new completion methods, replace existing ones, or simply retrieve a schema when needed.

## Class ClientSwarm

This class, `ClientSwarm`, acts as a central manager for a group of AI agents working together. It’s like a conductor for an orchestra, coordinating the agents' actions and ensuring smooth operation.

Think of it as a system for managing agents—each one specialized in a specific task—within a larger workflow. It handles switching between agents, waiting for results, and keeping track of the order in which agents are used.

The `ClientSwarm` keeps track of which agent is currently active and can switch to a different one.  It lets you wait for an agent to finish its work and provides a way to cancel ongoing operations if needed.

When an agent produces an output, the system sends it out to anyone who’s listening.  It also provides ways to monitor the swarm's status – whether it’s busy or idle—and to clean up when it's no longer needed. Essentially, it's about making sure your AI agents work together effectively and predictably.

## Class ClientStorage

This class handles storing and retrieving data within the AI agent swarm, focusing on efficient searches using embeddings. It’s designed to manage data storage operations in a reliable and controlled way, ensuring data consistency and enabling search capabilities.

Here's a breakdown of what it does:

*   **Data Storage:** It stores data items, providing methods to add (upsert), delete (remove), and clear all data.
*   **Similarity Search:**  It allows you to find items that are similar to a search query, using embeddings to compare data.
*   **Controlled Operations:**  All data changes happen in a queue, ensuring that operations are executed one at a time to prevent conflicts and maintain data integrity.
*   **Efficient Embeddings:** It cleverly creates and caches embeddings (numerical representations of your data) to speed up the similarity search process.
*   **Event-Driven Updates:** It informs other parts of the system about data changes through events.
*   **Initialization:** It makes sure the storage is properly set up before it can be used, fetching any initial data.
*   **Cleanup:** It handles the proper disposal of the storage, releasing resources when it's no longer needed.

Essentially, it's the central hub for managing and searching data within the agent swarm, providing a robust and performant solution for data persistence and retrieval.

## Class ClientState

The ClientState class manages the data and interactions related to a single agent's state within the swarm. It keeps track of the current state data and handles changes to it in a controlled and reliable way. Think of it as the central hub for a particular agent's information, ensuring that updates and reads are processed safely and consistently.

This class works closely with other parts of the system, like the connection services and the agent itself, to keep everything synchronized and responsive. You can use it to initialize the state, make changes to it, and even reset it entirely, always making sure those changes are communicated to the rest of the swarm. When you’re done with a particular state, the `dispose` method cleans up and releases any resources it's using.

## Class ClientSession

The `ClientSession` class manages interactions within the AI agent swarm for a single client. Think of it as a dedicated workspace for a client's session with the swarm.

It handles sending messages to the agents, receiving responses, and keeping track of the entire conversation history. Before anything is sent to an agent, it checks if the message is valid using pre-defined rules (ClientPolicy).  If a message is invalid, a "ban" message is sent out to notify subscribers.

Here's a breakdown of what it does:

*   **Message Handling:** It allows you to send messages to the agents (`execute`, `run`), receive results, and track everything.
*   **Policy Enforcement:** Every message is checked against a policy to ensure it's valid.
*   **History Management:**  It remembers all the messages sent and received, creating a history of the interaction.  This history can be cleared (`commitFlush`).
*   **Tool Control:**  You can request tools to be used (`commitToolRequest`) and even stop their execution (`commitStopTools`).
*   **Session Lifecycle:** It can be connected to other systems for real-time communication (`connect`) and properly cleaned up when finished (`dispose`).

Essentially, `ClientSession` is the central hub for a client’s interaction with the AI agent swarm, ensuring smooth, controlled, and tracked conversations.

## Class ClientPolicy

This class manages restrictions and security for clients interacting with the agent swarm. It acts as a gatekeeper, controlling access and validating messages. Think of it as a set of rules that ensure only authorized and appropriate communication happens within the swarm.

It keeps track of banned clients, which can be loaded on demand to avoid loading unnecessary data.  You can customize how bans are handled, including providing custom messages for banned clients, and even automatically banning clients who fail validation.

The class integrates closely with other components like the connection services and agent, providing features like validating messages, enforcing swarm-level policies, and emitting events to notify of changes like bans or unbans. Banning and unbanning clients are handled efficiently and can be persisted based on configuration.

## Class ClientOperator

The `ClientOperator` acts as a bridge, allowing you to interact with and manage a swarm of AI agents. It's designed to be a central point for sending instructions and receiving responses from the agents.

Think of it like this: you provide instructions (input) to the operator, specify how those instructions should be handled (execution mode), and it communicates these to the agent swarm. The operator then waits for the agents to complete their work and delivers the results back to you.

While many functions exist for managing complex agent interactions like committing tool outputs, developer messages, or stopping tools, some of these features are currently not functional. The core functionality allows sending user messages, receiving agent responses, and managing the overall agent lifecycle through methods like `commitUserMessage`, `waitForOutput`, and `dispose`. This class enables you to coordinate and orchestrate the activities of multiple AI agents in a structured way.

## Class ClientMCP

The ClientMCP class helps your application interact with and manage a collection of AI tools for different clients. Think of it as a central hub for requesting tools and running them. 

It keeps track of which tools are available to each client, caching them to speed things up. You can easily check if a client has access to a particular tool, retrieve a list of all tools for a client, or trigger an update to refresh the available tools.

When you want to run a tool, you use the `callTool` method, providing the tool's name and necessary input data. The class also provides a way to clean up resources associated with a client when they're no longer needed.

## Class ClientHistory

This class keeps track of all the messages exchanged with a specific agent within the swarm system. It's like a memory log for the agent, allowing it to remember past interactions.

The class stores messages and provides ways to retrieve them – either as a complete, unfiltered list, or as a tailored list designed specifically for the agent's context and purpose, like generating a response or understanding the conversation flow.

You can add new messages to the log, remove the most recent one to potentially undo an action, and the system automatically broadcasts updates when messages are added or removed. When the agent is no longer needed, this class handles cleaning up and releasing any resources it’s using. The exact messages kept and how they are filtered is influenced by settings defined elsewhere in the system.

## Class ClientCompute

This component, `ClientCompute`, manages the interaction with a compute resource within your agent swarm. Think of it as the bridge between your application and the processing power needed to run your agents.

When you create a `ClientCompute` instance, you provide it with configuration details about the compute resource it will manage. It keeps track of these settings internally.

The `getComputeData` method lets you retrieve information about the compute resource's current status. 

The `calculate` method initiates a computational task, telling the compute resource what to work on, identified by a specific "state name."  The `update` method performs a general update cycle for the compute resource, while `dispose` safely shuts down and releases resources associated with the compute instance.

## Class ClientAgent

The `ClientAgent` is the heart of your AI agent swarm, handling all the interactions and executions for a single agent. Think of it as a worker bee within a larger hive. It takes incoming messages, figures out what tools to use (if any), and processes the results, all while carefully managing its internal state and communicating with other parts of the system.

Here's a breakdown of what it does:

*   **Handles Messages:** It receives messages (like questions or requests) and decides how to deal with them. It can either run a full processing cycle or just run a quick completion.
*   **Manages Tools:** It figures out which tools the agent should use and executes them. The agent is careful not to run too many tools at once.
*   **Communicates with Others:**  It talks to other services like the history manager, the tool catalog, and the overall swarm coordinator to ensure everything works together smoothly.
*   **Error Handling:** If something goes wrong, it can attempt to recover, like by re-trying the process or providing a placeholder response.
*   **State Management:** It keeps track of the agent’s current status, including errors, changes, and tool executions, using internal signals to manage this.
*   **Cleanup:** The `dispose` method ensures proper cleanup when the agent is no longer needed.

Essentially, `ClientAgent` is responsible for the lifecycle of an agent, from receiving a message to properly handling errors and communicating its progress.

## Class ChatUtils

This class provides tools for managing chat sessions within a swarm of AI agents. Think of it as a central hub for coordinating communication between clients and their AI agent groups.

It handles creating and tracking chat instances, allowing you to start, send messages to, and ultimately end conversations for each client. The `beginChat` method kicks off a new session, while `sendMessage` delivers your prompts. You can also register a function to be notified when a chat session is finished with `listenDispose`. Finally, the `dispose` method cleans up resources when a chat is no longer needed.

To customize how chat instances are created and how they behave, you can set the constructor used for creating them using `useChatAdapter` and define callback functions for specific events with `useChatCallbacks`.

## Class ChatInstance

The `ChatInstance` class manages a single chat session within an AI agent swarm. It's identified by a client ID and a swarm name, and it’s designed to be cleaned up when it’s no longer needed through a `dispose` function. 

This class handles the lifecycle of a chat, from starting a session (`beginChat`) to sending messages (`sendMessage`) and eventually shutting down.  It also includes functionality to monitor activity (`checkLastActivity`) and provides a way to be notified when a chat session is closed (`listenDispose`). Essentially, it's the core component that orchestrates individual conversations within the larger agent swarm.

## Class BusService

This class, `BusService`, acts as a central communication hub for the entire swarm system. It's responsible for managing how different parts of the system send and receive information, like events. Think of it as a post office for the swarm.

You can subscribe to specific event types to receive updates, or even subscribe to "wildcard" events to receive all types of messages. It handles these subscriptions, ensuring only valid clients can receive information and that messages are delivered efficiently.

Several key services work together with `BusService`. The `loggerService` helps track communication for debugging. The `sessionValidationService` makes sure only authorized clients are sending and receiving information.  And it’s designed to integrate closely with other parts of the system like ClientAgent, PerfService and DocService.

There are methods for subscribing to events (`subscribe`, `once`), sending events (`emit`, `commitExecutionBegin`, `commitExecutionEnd`), and cleaning up subscriptions (`dispose`).  The system remembers which subscriptions exist and manages them effectively, and it uses clever techniques to avoid unnecessary overhead.  When a client is done working, you can use `dispose` to clean up all the subscriptions related to that client.

## Class AliveService

This class helps keep track of which clients are actively participating in your AI agent swarms. It lets you easily signal when a client joins or leaves a swarm, recording the change in status. The system saves this information to storage so you can be sure the status is accurate even if the application restarts. You can use the `markOnline` method to register a client's presence, and `markOffline` to indicate they've disconnected. The system also includes a logging mechanism so you can monitor the changes in client status.

## Class AgentValidationService

The AgentValidationService is responsible for ensuring the configurations of your AI agents are correct and consistent within the swarm system. It acts as a central point for validating agent schemas, dependencies, and associated resources like storages and states.

Think of it as a gatekeeper, registering new agents, checking their details, and verifying their connections to other parts of the system. It relies on other services for specific validations (like tool validation or storage validation) and keeps track of agent information in internal maps.

Here's what it does:

*   **Agent Registration:** Adds new agents to the system and tracks their schemas.
*   **Resource Verification:**  Provides ways to query for the storages, wikis, states, and MCPs associated with a given agent.
*   **Dependency Management:** Checks for dependencies between agents to ensure they work together correctly.
*   **Comprehensive Validation:** Provides a `validate` method to check an agent's entire configuration at once.
*   **Performance Optimization:** Uses caching to avoid repeatedly checking the same configurations.
*   **Logging and Monitoring:** Logs important validation actions for debugging and tracking.

## Class AgentSchemaService

This service acts as a central library for defining and managing the blueprints of AI agents within the system. It's like a catalog where each agent's instructions, dependencies, and required resources are clearly documented.

You can think of it as registering new agent types, updating existing ones, or simply looking up the definition for a specific agent. Before any agent is created or used, its schema (or blueprint) is checked to make sure it's complete and valid.

The system keeps track of agent schemas using a registry, and integrates with other parts of the framework to ensure agents are created and managed consistently.  Detailed logging helps track schema operations for debugging and monitoring.  It supports both creating new agent types and updating existing ones to enable flexibility in the agent ecosystem.

## Class AgentPublicService

This service acts as the public gateway for interacting with agents within the system. It provides a simplified way to create, run commands on, and manage agents, while ensuring proper context and logging.

Think of it as a layer on top of the core agent management, providing a consistent and controlled way to interact with agents.  It handles operations like creating agents, executing commands, and logging activity.

Several functions mirror functionality found in other parts of the system like ClientAgent, making interactions predictable. For example, `execute` is like ClientAgent’s `EXECUTE_FN`.

The service meticulously logs key actions using the `LoggerService` (when enabled), providing valuable insights into agent behavior and performance. It also relies on other services to help track and manage agent usage.

Many methods wrap lower-level calls for actions like sending messages to the agent's history (user, assistant, developer messages), committing tool outputs and canceling operations.



Finally, the `dispose` method provides a way to properly clean up and release resources associated with an agent.

## Class AgentMetaService

This service manages information about your AI agents, helping you understand how they relate to each other and visualize their structure. It takes agent definitions and turns them into diagrams, making it easier to document and debug your swarm system. 

It creates detailed or simplified views of agent relationships, focusing on either the full picture or just the connections between them. These views can be converted into standard UML diagrams, which are commonly used for software visualization.

The service relies on other parts of the system to get agent information and to log its actions. You can control the level of detail in the diagrams and the logging to match your needs. Essentially, this service is a key tool for creating clear and understandable visualizations of your AI agent swarm.

## Class AgentConnectionService

This service manages the connections and operations for AI agents within a swarm system. Think of it as a central hub that creates and reuses agent instances efficiently. It fetches agent configurations, handles message logging, and tracks usage, all while making sure things are cleaned up properly when agents are no longer needed.

It caches agent instances to avoid repeatedly creating them, which speeds up performance. It also integrates with various other services – logging, history, storage, and more – to ensure everything works together smoothly.

Key functions include:

*   **`getAgent`**:  Creates or retrieves an agent. It reuses existing agents when possible.
*   **`execute`**: Runs a command on an agent.
*   **`run`**: Provides a quick, stateless response from the agent.
*   **`waitForOutput`**:  Waits for the agent to complete and provide an output.
*   **`commit...` functions:** These methods log different types of messages (tool requests, system messages, developer messages) to the agent's history, facilitating tracking and control of the agent’s behavior.
*   **`dispose`**: Cleans up resources when an agent is no longer needed.

## Class AdapterUtils

This utility class provides a straightforward way to connect your AI agent swarm to different AI models. It offers functions to create specialized connection methods – sometimes called "adapters" – for popular AI services like Hugging Face, Cortex, Grok, Cohere, OpenAI, LMStudio, and Ollama. 

Each function (like `fromOpenAI` or `fromCortex`) sets up a ready-to-use function that handles the specific communication required to send requests and receive responses from the targeted AI model's chat completion API. This simplifies the integration process, letting you easily switch between different AI providers without major code changes. You can specify the model to use and, in some cases, provide custom settings like the API base URL or response format.

# agent-swarm-kit interfaces

## Interface ValidationResult

This object represents the outcome of validating arguments passed to a tool. If the validation is successful, you're given the parsed and validated data itself. However, if something goes wrong during validation, you're provided with an error message explaining the problem. Essentially, it tells you whether the tool's input was acceptable and, if not, why.

## Interface TAbortSignal

This interface lets you signal when an operation needs to be stopped, similar to how you might cancel a download. It builds on the standard way of doing that in web browsers, providing a reliable mechanism for stopping ongoing tasks. You can adapt it to your specific needs by adding your own extra features or data to the signal.

## Interface JsonSchema

This describes a JSON Schema, which is a way to define the structure of JSON data. Think of it as a blueprint that specifies what fields a JSON object should have, what data types those fields should be, and whether certain fields are mandatory.

The `type` property simply states the kind of schema this is (which will likely be "object" in most cases).

`properties` holds all the details about the individual fields within the JSON object, outlining their expected data types and any constraints they might have. 

`required` lists the names of the fields that *must* be present in a valid JSON object.

Finally, `additionalProperties` indicates whether the JSON object can contain fields beyond those defined in the `properties` section; `true` means it can, and `false` means it can't.

## Interface IWikiSchema

This interface, `IWikiSchema`, defines the structure for representing a wiki within our AI agent orchestration system. Think of it as a blueprint for how a wiki is organized and used.

Each wiki has a unique name (`wikiName`) and can optionally include a description (`docDescription`) to clarify its purpose.

You can also provide custom actions to be taken during wiki operations by setting up callbacks (`callbacks`).

The `getChat` method is how you retrieve responses from the wiki – it takes arguments (`IChatArgs`) and returns a promise that resolves to the chat response.

## Interface IWikiCallbacks

This interface provides a way for you to hook into what's happening during chat interactions within the system. If you need to know when a chat message is processed or a new chat session begins, you can implement this interface and provide an `onChat` function. This function will be called whenever a chat-related event takes place, giving you the opportunity to react or gather information. Think of it as a notification system for chat activity.

## Interface ITriageNavigationParams

This interface defines the information needed to set up a tool for triage navigation within the AI agent system. You'll use these parameters to specify the tool's name, a clear description of what it does, and optionally, some extra notes for documentation. Think of it as telling the system exactly what kind of tool you want it to build for handling triage tasks.

## Interface IToolRequest

This interface describes what’s needed to ask the system to run a specific tool. Think of it as a way for an agent to say, "Hey, I need to use the 'search' tool and I want to pass it the query 'example'." It tells the system which tool to use and what information to give it. The tool name must be a recognized tool within the system, and the parameters are the specific inputs the tool needs to work correctly, which it will validate against what the tool expects.

## Interface IToolCall

This interface defines what happens when an AI agent wants to use a tool – think of it as a structured request to run a specific function with certain inputs. Each tool call gets a unique ID to keep track of it. Right now, it only supports calling functions, but it's designed to potentially handle other types of tools in the future. The `function` property specifies which tool to run and what data it needs to work with. This information helps the system figure out which tool to use and execute it appropriately within the agent's workflow.

## Interface ITool

ITool defines what a tool looks like within our system, essentially laying out the blueprint for a callable function an AI agent can use. Think of it as a description of a specific action the agent might take.

It includes a 'type', which is currently just "function," and detailed information about that function: its name, what it does, and importantly, the expected parameters. This allows the AI model to understand what the tool is capable of and how to properly use it when generating requests. 

The information in ITool is used to validate and execute the tool calls, making sure the model is requesting actions the system can handle.

## Interface ISwarmSessionCallbacks

This interface lets you listen in on what’s happening within your AI agent swarm. You can set up functions to be notified when a client joins, when a command is run, or when a message is sent out. Think of it as a way to keep tabs on your swarm's activity and potentially react to specific events – like logging new connections or handling different execution modes. There are also callbacks for when a session starts, finishes, or is simply initialized, providing a complete picture of the session lifecycle.

## Interface ISwarmSchema

This interface helps you define how your AI agent swarm will operate. You can use it to configure things like whether the swarm remembers its path and current agent, and to provide descriptions for documentation. It lets you control which agents are available, set a default agent to start with, and even customize events with optional callback functions. Think of it as the blueprint for your swarm's behavior and management. It includes options for saving state and controlling access through policies, making it flexible for various use cases.

## Interface ISwarmParams

This interface defines the information needed to set up a group of AI agents working together – a swarm. Think of it as a blueprint for launching the swarm.

It requires a unique identifier for the client starting the swarm, a way to log what's happening (for debugging and monitoring), a communication channel for the agents to talk to each other, and a list of the individual agents participating in the swarm so they can be easily accessed. Essentially, it provides everything needed to get the swarm up and running.

## Interface ISwarmDI

This interface acts as a central hub, providing access to all the essential services that power the AI agent swarm system. Think of it as a toolbox filled with services for everything from documentation and event handling to performance monitoring and agent connections. It's the key to interacting with and managing the core functionality of the swarm.

It includes services for:

*   **Documentation:** Managing system-wide documentation.
*   **Communication:**  Sending and receiving events between components.
*   **Performance:** Tracking execution times and resource usage.
*   **Liveness:**  Ensuring system components remain operational.
*   **Logging:** Providing a central point for system logs.
*   **Context:** Tracking method, payload, execution, schema, and agent-specific information.
*   **Connections:** Managing connections to agents, history, sessions, storage, state, policies, computes, and the swarm itself.
*   **Schemas:** Defining and managing schemas for agents, tools, swarms, and completions.
*   **Validation:**  Ensuring the integrity of various data and configurations within the swarm.

Essentially, this interface provides the foundational components needed to build and operate the AI agent swarm system, offering controlled access to core features and functionalities.

## Interface ISwarmConnectionService

This interface helps define how different parts of the AI agent swarm communicate with each other. Think of it as a blueprint for building a reliable connection service. It's designed to be used internally to make sure the public-facing connection service is clean and focuses only on the actions users and agents need. It excludes technical details, leaving just the essential components for public interaction.

## Interface ISwarmCallbacks

This interface lets you hook into important events happening within your AI agent swarm. Specifically, it allows you to be notified whenever an agent's role or responsibility changes within the swarm. You'll receive information like the agent's ID, its new name, and the name of the swarm it belongs to. This is helpful if you need to monitor how agents are being utilized or if you want to update your system’s state based on agent changes.

## Interface ISwarm

This interface defines how you interact with a group of AI agents working together. It lets you control which agent is currently active, retrieve information about the agents, and manage their operations. You can use it to get the name or the entire agent object, or even change which agent is in charge.

It also provides functions to handle the swarm's output, like canceling a process or waiting for a result. You can send messages to the swarm’s communication channel and check if it’s currently busy with a task. This lets you monitor and adjust how the agents are working together.

## Interface IStorageSchema

This interface outlines how your AI agents’ data is stored and managed. You can customize aspects like whether data is saved permanently, add descriptions for clarity, and control whether the storage is accessible by all agents. 

You have the flexibility to define your own functions for fetching and saving data, and to specify which embedding method is used for searching. Each storage area has a unique name within the system, and you can even set up custom triggers to react to storage events. Finally, you can create an index for each item to make searching easier.

## Interface IStorageParams

This interface defines how the AI agent swarm interacts with the storage system. It handles everything from saving and retrieving embeddings (numerical representations of text) to creating new embeddings and logging activity. Each storage instance is associated with a client and has a unique name within the swarm. The system can check a cache to see if an embedding has already been calculated, and it uses a logging system and event bus to keep track of what's happening. Essentially, it provides a standardized way for agents to access and manage data within the swarm's storage.

## Interface IStorageData

This interface describes the basic information that gets saved and retrieved from the system's storage. Every piece of data stored will have a unique `id`, which acts like a name tag so the system can easily find and manage it. Think of it as the primary key for your data.

## Interface IStorageConnectionService

This interface helps ensure a clean, public-facing definition for how your system connects to storage. It builds upon the broader storage connection service but removes the internal details, so you're left with only the parts you need to interact with externally. Think of it as a blueprint for creating a reliable and consistent way to manage storage connections, focusing on what’s visible and usable by others.

## Interface IStorageCallbacks

This interface defines a set of functions you can use to be notified about what's happening with your storage system. Think of them as event listeners—you register these functions, and they get called when specific actions occur, like data being added or removed, a search being performed, or the storage being set up or shut down.  You can use these callbacks to track changes, perform cleanup tasks, or log important events related to the storage. The `onUpdate` function will let you know when data changes, `onSearch` will inform you about search requests, and `onInit` and `onDispose` provide opportunities to handle initialization and teardown.

## Interface IStorage

This interface gives you the tools to manage data within the agent swarm's memory. You can fetch items from storage using a search term and a desired number of results – the system uses embeddings to find similar items. 

It also lets you add new data or update existing entries.  Removing items is straightforward, identifying them by their unique ID. 

You can retrieve individual items by ID or get a list of all items, even filtering the list based on certain conditions. Finally, you have the option to completely clear the storage, essentially wiping it clean.

## Interface IStateSchema

This interface describes how a piece of information – we call it a "state" – is managed within the agent swarm. Think of it as a blueprint for a specific piece of data that agents might use and share.

You can define whether the state is saved permanently, add a description to explain what it's for, and control whether other agents can access and modify it.

The `getDefaultState` function tells the system what the initial value of the state should be, while `getState` allows for custom logic when retrieving the state’s current value.  Similarly, `setState` allows you to customize how the state’s value is updated.

Finally, you can add extra steps to the process with `middlewares` to handle the state as it's being used, and `callbacks` to be notified when certain events happen to the state, like when it's created or changed.

## Interface IStateParams

This interface defines the information needed to manage a state within the AI agent swarm. Think of it as a container holding essential details about how a particular state operates. It includes a unique identifier for the client using the state, a logger to track what's happening, and a communication channel – a bus – to exchange messages with other parts of the swarm. Essentially, it’s a blueprint for making sure each state is properly tracked, logged, and integrated into the larger AI agent system.


## Interface IStateMiddleware

This interface helps you control how your AI agents' shared state changes over time. Think of it as a gatekeeper – it lets you step in and tweak or double-check the state data before it's used or updated by the agents. You can use it to ensure the data is in the right format, enforce rules about what changes are allowed, or perform other necessary validations during the agent swarm's operations. This gives you more fine-grained control over the overall system behavior.

## Interface IStateConnectionService

This interface helps ensure a clean, public-facing definition for how different parts of the system connect and share state. It's a way to create a specific, type-safe version of the underlying connection service, removing any details that aren't meant to be exposed. Think of it as a blueprint for how external components interact with the state management within the agent swarm.

## Interface IStateChangeContract

This interface, `IStateChangeContract`, focuses on notifying listeners when the state of an AI agent changes. It provides a single property, `stateChanged`, which acts as a signal. Whenever an agent's state transitions – perhaps moving from "idle" to "active," or "planning" to "executing" – something can react to this change. Think of it as a notification system that keeps track of what's happening with the AI agents.

## Interface IStateCallbacks

This interface helps you keep track of what's happening with your agent's state. You can use it to be notified when a state is first created, when it's being cleaned up, or when it's loaded from somewhere. It also lets you monitor when a state is read or written, which is great for debugging or auditing changes. Think of it as a way to get updates on the state's journey.

## Interface IState

This interface lets you manage the agent swarm's overall condition during operation. You can think of it as a central place to check what's happening, change things, and reset everything back to the beginning. 

The `getState` function allows you to peek at the current status, potentially taking into account any special processing or logic defined in the system's setup. 

`setState` is how you update the state, but instead of directly setting a new value, you provide a function that calculates the new state based on the existing one – this allows for coordinated changes.

Finally, `clearState` brings everything back to the starting point, effectively resetting the entire operation to its initial configuration.

## Interface ISharedStorageConnectionService

This interface outlines how different parts of the system can connect to shared storage. Think of it as a blueprint for establishing a link to a common data space where agents can share information and resources. It’s designed to be a public-facing definition, leaving out the internal workings needed for the system to actually manage those connections. It ensures that the public-facing service only exposes what's necessary for external interaction.

## Interface ISharedStateConnectionService

This interface helps define how different parts of the AI agent swarm can share information. It's a blueprint for a service that manages this shared state, making sure only the intended, public-facing functions are exposed. Think of it as a way to structure communication between agents while keeping internal workings hidden. It ensures consistency and clarity when building systems that rely on agents collaborating and sharing data.

## Interface ISharedComputeConnectionService

This service lets your AI agents connect to and share computing resources, like virtual machines or containers. Think of it as a central hub where agents can request and receive the processing power they need, whether it's for running complex models or handling large datasets. The interface defines methods for agents to discover available compute resources, request connections, and manage their usage. This promotes efficient resource allocation and prevents agents from needing to manage individual compute instances directly. It’s designed to be flexible, allowing for different types of compute environments to be integrated into the swarm.

## Interface ISessionSchema

This interface, called ISessionSchema, acts as a blueprint for how session data will be structured in the future. Right now, it's a simple placeholder – think of it as reserving space for more detailed session settings later on.  As the framework develops, this schema will define what information is tracked and stored during each session of the agent swarm.

## Interface ISessionParams

This interface defines the information needed to kick off a new session for your AI agent swarm. Think of it as the setup instructions – it includes things like a unique identifier for the client using the session, a way to log what’s happening, rules for how the session should behave, a communication channel for the agents, and the swarm itself to manage everything. It also specifies the name of the swarm that this session is a part of, helping to organize and identify different groups of agents working together.

## Interface ISessionContext

The `ISessionContext` interface holds all the important details about a client's active session within the AI agent swarm. It essentially bundles together who initiated the session (the `clientId`), what process they're involved in (`processId`), and any relevant information about the method they're using (`methodContext`) and the overall execution environment (`executionContext`). Think of it as a package containing everything needed to understand the current state of a client’s interaction with the swarm. It allows the system to keep track of where things are and what's happening.

## Interface ISessionConnectionService

This interface helps define how different parts of the system interact, specifically dealing with connections between agents. Think of it as a blueprint for setting up and managing those connections, but it's designed to focus only on the aspects that are meant to be used externally. It's a way to ensure the public-facing parts of the system remain consistent and predictable.

## Interface ISessionConfig

This interface defines how a session, which could be for running AI agents or managing their activity, is set up. It lets you control how often these sessions run, using a `delay` property to specify the time between them. You can also provide an `onDispose` function that gets executed when the session ends, allowing you to clean up resources or perform final actions. Think of it as a way to schedule and manage the lifecycle of your AI agent interactions.

## Interface ISession

The `ISession` interface defines how you interact with a conversation or workflow managed by the AI agent swarm. It provides a set of actions to control the flow of messages, trigger computations, and manage the conversation’s history.

You can add messages to the session's history – whether they're user inputs, responses from the AI, system instructions, or messages for developers – without immediately causing a response. You can also clear the entire conversation history and stop the execution of any further tools. 

The `run` method allows you to perform quick, isolated computations without affecting the ongoing conversation.  The `execute` method actually pushes commands into the session, potentially changing the state of the conversation based on the provided mode.

The `connect` method lets you set up a two-way communication channel with the session, allowing real-time message exchange. Finally, there are methods to specifically handle tool requests and outputs, ensuring proper integration of external tools into the agent’s workflow.

## Interface IScopeOptions

This interface defines the options you can set up when creating a workspace for your AI agents to collaborate within a swarm. Think of it as configuring the environment where your agents will operate. You'll need to specify a unique client ID to identify your application, a name for the specific swarm of agents you're working with, and a function to handle any errors that might occur during the agents' interactions. This allows for controlled and identifiable agent collaboration.

## Interface ISchemaContext

This interface acts as a central hub for accessing and managing different schema definitions within your AI agent swarm. Think of it as a toolbox filled with blueprints. 

The `registry` property is the key – it holds collections of schemas for various agent components like tools, completions, and outlines.  Each collection (like `agentSchemaService`) is organized as a `ToolRegistry`, allowing you to easily look up and retrieve the schema you need to ensure consistency and proper configuration across your agents. This helps to standardize how agents interact and understand each other’s capabilities.

## Interface IPolicySchema

This interface describes the structure for configuring a policy that governs how agents within a swarm interact and manage banned clients. You can use it to define rules and actions for the swarm, like automatically banning clients or customizing the messages displayed during a ban. 

The policy lets you specify a unique name, and optionally persist ban information to storage. You can also provide functions to generate custom ban messages, retrieve lists of banned clients, or completely override the validation process for incoming and outgoing messages. The `callbacks` property allows for even greater control by letting you hook into various policy events.


## Interface IPolicyParams

This interface defines the information needed to set up a policy, acting as a blueprint for how these policies are created. It builds upon a standard policy structure and adds important features for real-world usage. 

Specifically, it requires a logger to help track what the policy is doing and catch any problems that might arise. 

It also needs a communication channel, called a bus, allowing the policy to interact with other parts of the agent swarm.

## Interface IPolicyConnectionService

This interface helps us define how different parts of the system interact with policies, specifically focusing on the public-facing aspects. It’s a way to create a clear, type-safe definition for managing these connections, ensuring that only the intended functionality is exposed and that the internal workings remain hidden. Think of it as a blueprint for how external components should interact with policy connections, keeping things organized and predictable.

## Interface IPolicyCallbacks

This interface lets you plug in your own functions to respond to key moments in a policy’s lifecycle. You can define what happens when a policy is first set up, when it checks incoming messages, or when it approves outgoing messages. It also provides ways to be notified when a client is banned or unbanned, allowing for custom logging or automated actions in response to these events. Essentially, it's a way to extend the framework’s behavior and integrate it more deeply into your own systems.

## Interface IPolicy

This interface defines how your AI agent swarm enforces rules and manages client access. Think of it as a gatekeeper ensuring everything that comes in and goes out aligns with your desired behavior. 

It allows you to check if a client is currently blocked, retrieve the reason for a block, and validate both incoming and outgoing messages to make sure they're appropriate. You can also actively block or unblock clients based on your needs, providing control over which agents participate in the swarm. It handles situations where you need to control who can join and how they interact.

## Interface IPipelineSchema

This interface, `IPipelineSchema`, defines the structure for a pipeline within our AI agent swarm orchestration framework. Think of it as a blueprint for how a sequence of agents will work together. 

Each pipeline will have a descriptive `pipelineName` to easily identify it. 

The core of the pipeline is the `execute` function. This function is how you trigger the pipeline to run, specifying a client ID, the name of the initial agent, and some data (`payload`) to get things started. It will return a promise that resolves with the result of the pipeline's execution, or nothing if no specific result is expected.

Finally, the `callbacks` property allows you to register functions that will be called at different points during the pipeline's lifecycle, letting you hook into the process and respond to events. These callbacks are optional.

## Interface IPipelineCallbacks

This interface lets you hook into the lifecycle of your AI agent pipelines. You can use it to get notified when a pipeline begins, finishes, or encounters an error. 

The `onStart` function will be called at the beginning of a pipeline, providing information about the client that initiated it and the pipeline's name, along with some initial data. 

When a pipeline completes successfully or fails, the `onEnd` function is triggered. It delivers the same client and pipeline information, along with a flag to indicate whether an error occurred. 

If something goes wrong during pipeline execution, the `onError` function gets called, providing details about the client, pipeline, data, and the specific error that happened.

## Interface IPersistSwarmControl

This framework lets you tailor how your AI agent swarm's data is saved and retrieved. You can plug in your own ways of handling the active agents – the agents currently working on tasks – and the navigation stacks, which track the agents' paths and decisions. This gives you flexibility to use different storage methods, like saving data in memory, using a database, or any other persistence mechanism that fits your needs. By providing your own "adapter" classes, you essentially replace the default way the framework handles saving and loading this critical information.

## Interface IPersistStorageData

This interface describes how information is saved and retrieved for the swarm system. Think of it as a container holding a list of data – things like settings, logs, or anything else the swarm needs to remember. The `data` property within this container simply holds that list of information that needs to be saved. It's used by a utility function to handle the actual saving process.

## Interface IPersistStorageControl

This interface lets you plug in your own way of saving and loading data for a specific storage area. Think of it as swapping out the default storage mechanism with something tailored to your needs, like using a database instead of simple files. You provide a constructor for your custom storage adapter, and the framework takes over to handle the persistence operations using your provided logic. This allows for more flexible and specialized storage solutions.

## Interface IPersistStateData

This interface outlines the format for saving and retrieving information within the AI agent swarm. Think of it as a container holding the specific data you want to keep track of – it could be anything from agent settings to details about an ongoing session. The `state` property holds the actual data, and its type can vary depending on what you’re storing. This structure helps manage and preserve important data across different parts of the swarm system.

## Interface IPersistStateControl

This interface lets you tailor how your agent swarm’s state is saved and retrieved. It provides a way to swap out the standard state persistence mechanism with your own custom solution. Essentially, you can plug in your own code to handle saving and loading state data, perhaps to use a database instead of local storage, for example. This gives you fine-grained control over the persistence process for specific states within your swarm.

## Interface IPersistPolicyData

This interface helps manage which clients are restricted within a particular swarm. Think of it as a list of "banned" session IDs, each representing a client that shouldn't be allowed to interact with the swarm. The `bannedClients` property stores these IDs, keeping track of who's currently blocked under a specific policy. It’s a simple way to enforce restrictions and maintain control over the swarm’s interactions.

## Interface IPersistPolicyControl

This interface lets you customize how policy data is saved and retrieved for your AI agent swarms. Think of it as a way to plug in your own storage solution instead of relying on the default one. 

You can use the `usePersistPolicyAdapter` method to provide your own persistence adapter, which is essentially a class that handles the specifics of saving and loading policy data. This is useful if you need to store data in a specific location or format, or if you want to add extra logic during the persistence process. By swapping in your own adapter, you have more control over how the swarm's policy information is managed.

## Interface IPersistNavigationStackData

This interface describes how we keep track of where a user has navigated within an AI agent swarm. It's essentially a list of agent names, like a history button for hopping between different agents. This list, called `agentStack`, remembers the order in which agents were used, allowing users to easily return to previous interactions. It’s used behind the scenes to make sure navigation feels smooth and predictable.

## Interface IPersistMemoryData

This interface helps the system save and load memory data, acting like a container for whatever information needs to be preserved. Think of it as a simple way to package up the data that an agent needs to remember between interactions. The `data` property holds the actual information, and it can be anything – it's designed to be flexible enough to handle various types of memory. Essentially, it’s a standard way to prepare data for long-term storage within the agent swarm.

## Interface IPersistMemoryControl

This interface lets you swap out the default way memory is saved and loaded for your AI agent swarm. Think of it as a way to plug in your own system for handling the memory associated with each session. You can use this to store memory in a database, a file, or even just keep it in the application's memory if you need to. This gives you flexibility to customize how data related to specific sessions is managed.

## Interface IPersistEmbeddingData

This interface helps the AI agent swarm remember information by storing numerical representations of data. Think of it as a way to give the swarm a memory of key concepts or pieces of information. The `embeddings` property holds the actual numbers that make up that memory, essentially a list of numbers representing the data’s meaning. It’s designed to associate these numerical representations with a specific piece of data identified by a string hash and a name.

## Interface IPersistEmbeddingControl

This interface lets you tailor how embedding data is saved and retrieved. You can plug in your own custom storage solution instead of relying on the built-in default. This is useful if you need to store embedding data in a specific location, like a database or in-memory cache, or if you want to modify the saving process. By providing your own adapter, you have full control over how embeddings are persisted for a particular name.

## Interface IPersistBase

This interface provides the basic tools for saving and retrieving information persistently within the agent swarm system. It allows the framework to store and load data like agent states or memory as JSON files.

The `waitForInit` method gets things started by setting up the storage area and cleaning up any potentially corrupted files. `readValue` allows you to load a specific entity by its ID, while `hasValue` is a quick way to check if an entity exists without actually loading it. Finally, `writeValue` is used to save new entities or update existing ones, making sure the information is saved reliably.

## Interface IPersistAliveData

This interface helps the system keep track of whether each client is currently active. It’s how we know if a client connected to the swarm is still online or if it's gone offline. Each client is identified by a unique session ID and belongs to a specific swarm. The crucial piece of information here is a simple `online` flag, which tells us whether the client is currently considered active.

## Interface IPersistAliveControl

This interface lets you customize how the system remembers if an AI agent swarm is still active. 

You can provide your own way to store and retrieve this "alive" status, instead of relying on the system's default method. This is useful if you need a specific storage mechanism, like an in-memory store or a connection to a particular external service, to track the swarm's activity. Essentially, you're swapping in your own persistence solution for the standard one.

## Interface IPersistActiveAgentData

This interface helps keep track of which agent is currently running for each client and swarm. It essentially stores a simple record, noting the name of the active agent. Think of it as a way to remember which agent is "in charge" for a particular client interacting with a swarm. The `agentName` property holds this identifier, like "agent1" or "task-executor," making it easy to manage active agents.

## Interface IPerformanceRecord

This interface, `IPerformanceRecord`, is designed to track how well a specific process is running within the swarm system. It gathers information about the performance of individual clients – like sessions or agent instances – involved in that process, providing a detailed picture of overall efficiency.

Think of it as a way to monitor things like the total number of tasks completed, how long each task takes, and when those tasks happened. Each `IPerformanceRecord` represents a single process and contains data points such as the unique identifier of the process, how many clients were involved, the total time taken, and when the data was recorded. You're able to see metrics like total execution count, overall response time, and average response time to understand process performance. The record includes multiple timestamps (momentStamp, timeStamp, and date) to allow for precise tracking of events.

## Interface IPayloadContext

This interface, `IPayloadContext`, helps organize information when tasks are being processed. Think of it as a container that holds two key pieces of data: a `clientId` which identifies who initiated the work, and a `payload` which is the actual data the work will operate on. It’s a standardized way to package everything needed for an AI agent to understand and execute a task.

## Interface IOutlineValidationFn

This interface defines a function that's used to check if a proposed plan outline is valid before it's executed. Think of it as a quality control step for AI agent plans. The function receives a proposed outline as input, which is structured data representing the steps the agents are expected to take.  It then returns a boolean value: true if the outline is acceptable and should proceed, and false if it needs adjustments or is rejected. This allows you to enforce rules and constraints on the agent’s planning process, ensuring better results and preventing potentially problematic actions.


## Interface IOutlineValidationArgs

This interface, `IOutlineValidationArgs`, helps streamline the process of validating results generated by your AI agent swarm. Think of it as a container for everything a validation function needs. 

It includes a `data` property, which holds the output from the agent's work – often structured information that needs to be checked for accuracy or completeness. This way, you can pass both the initial input and the resulting data to your validation logic in a consistent format.

## Interface IOutlineValidation

This interface lets you define how to check if an outline is correct, and it's designed to be flexible. You specify a validation function – essentially, the code that performs the check – and you can also add a description to make it clear what that validation does. Think of it as a way to create reusable validation routines for your outlines, with helpful notes for anyone using them.

## Interface IOutlineSchemaFormat

This interface describes how to define a specific structure for your AI agent outlines using a JSON schema. Essentially, it lets you say "this outline must follow these rules" by providing a JSON schema that describes the expected format. You'll specify the type of format being used – currently, the only supported type is "json_schema" – and then provide the actual JSON schema object itself, which will be used to validate the outline’s structure. Think of it as giving a blueprint for your agent outlines, ensuring they’re consistent and well-formed.

## Interface IOutlineSchema

This interface describes how to set up a specific task or process within the AI agent system. Think of it as a blueprint for creating outlines – structured pieces of information generated by the AI.

You can define things like the initial prompt given to the AI, including whether that prompt changes depending on the outline's name. You also specify system prompts to give the AI context and instructions.

The `validations` property allows you to ensure the AI's output is in the correct format and contains the necessary information. You can also define a schema to describe the expected structure of the outline data.

To help with troubleshooting and understanding, you can add a description for documentation purposes and assign a unique name to each outline.  Finally, there’s a way to limit the number of attempts if things aren’t working correctly and to add custom functions that react to different stages of the outline generation process. A function to build history of the outline is also included.

## Interface IOutlineResult

This interface describes what you get back after running an outline generation process. It tells you if the outline was created successfully, providing a unique ID to track that specific run. You'll find a record of all the messages exchanged during the outline process, and if something went wrong, an error message will be included. The original parameters used to generate the outline are stored for reference, as well as the generated data itself. Finally, a number indicates how many times the outline generation was attempted.

## Interface IOutlineObjectFormat

This interface defines the structure for data used in outlining tasks, ensuring everyone’s on the same page about what the data should look like. It’s like a blueprint for how outline information is organized. 

The `type` property identifies the overall format, telling the system whether you're working with a partial JSON schema, a full schema, or just a general object.  The `required` property lists the fields that absolutely must be present in the outline data. Finally, the `properties` section provides details on each individual field – its data type and a description to explain its purpose.

## Interface IOutlineMessage

This interface defines the structure of messages used within the system, allowing us to track interactions between users, assistants, and the core framework. Each message has a role – indicating whether it's coming from a user, an assistant, the system itself, or a tool – and contains the actual content of that message. To help manage complex interactions, messages can also be linked to specific tool calls, including identifying the agent responsible and associating a unique ID for tracking. Essentially, it's a blueprint for how we record and organize all the conversations and actions happening within the agent swarm.

## Interface IOutlineHistory

This interface helps you keep track of the messages used when creating and modifying outlines. Think of it as a log of what happened.

You can add new messages to the log using the `push` method, which lets you add one message at a time or a whole bunch at once. 

If you need to start fresh, the `clear` method wipes the entire log clean. 

Finally, the `list` method lets you see all the messages currently stored in the history.

## Interface IOutlineFormat

This interface defines the structure for outline data used within the AI agent swarm. Think of it as a blueprint that ensures all outline information follows a consistent format. It specifies the basic type of data (like whether it's an object or something else), lists the properties that *must* be present, and details the type and meaning of each property. By adhering to this interface, we can reliably process and understand the outline data exchanged between agents.

## Interface IOutlineCallbacks

This interface lets you plug into the outline generation process and respond to different stages. You can use it to keep track of when an outline attempt begins, or to process the generated document itself. It also provides ways to react to successful validation, allowing you to handle those positive outcomes, and to be notified when validation fails so you can take corrective action or retry the process. Essentially, it gives you a way to monitor and react to what’s happening as the outline is created and checked.

## Interface IOutlineArgs

This interface defines the information needed when creating an outline. Think of it as a package containing what's needed to generate a plan—it includes the actual input, a counter to track attempts, the desired output format, and a record of past interactions. The `param` property holds the initial data to work with, `attempt` lets you keep track of how many times you’ve tried to create the outline, `format` specifies how the output should be structured, and `history` provides context from previous steps in the process.

## Interface IOutgoingMessage

This interface describes a message being sent out from the orchestration system, typically to an agent or client. It's how the system communicates back – whether that's a result, notification, or other information.

Each message has a `clientId` which is the unique identifier of the client it's going to. Think of it as the address for where the message needs to be delivered. There’s also `data`, which is the actual content of the message itself – the information being sent. Finally, `agentName` tells you which agent within the system generated and is sending this message.

## Interface IOperatorSchema

This function lets your agents talk to each other and to the central orchestration system. Think of it as creating a dedicated communication channel for a specific agent. You provide an agent’s ID and its name to establish the connection, then define how the agent will receive messages and respond—it's like setting up a two-way conversation protocol. The `DisposeFn$2` returned allows you to cleanly shut down that communication link when it’s no longer needed.

## Interface IOperatorParams

This interface, `IOperatorParams`, defines the essential information needed to configure and run an operator within the AI agent swarm orchestration framework. Think of it as a set of building blocks – it provides the agent’s name, a client identifier to track its context, a logger for recording activity, a communication bus for interaction, and a history mechanism to remember past actions.  Each operator will be given an instance of this object to guide its operation and connect it to the larger system. The `agentName` helps identify the operator, while `clientId` helps track its purpose.  The logger and bus allow the operator to communicate and record its decisions, and the `history` component provides a memory for the operator.

## Interface IOperatorInstanceCallbacks

This interface lets you listen in on what’s happening with each individual agent within your swarm. Think of it as a way to get notified when an agent starts working, provides an answer to a question, receives a message, finishes its task, or sends a notification. You can use these notifications to track progress, build custom dashboards, or trigger other actions based on the agent’s behavior. Each notification includes the client identifier, the agent's name, and the relevant data for the event.

## Interface IOperatorInstance

This interface defines how you interact with a single agent within a larger swarm system. Think of it as a way to communicate with and control one agent at a time.

You can use `connectAnswer` to set up a listener that will receive responses from the agent. The `answer` method lets you send information back to the agent.  `init` establishes the initial connection, while `notify` is for sending general updates or messages.  `recieveMessage` handles incoming messages from the agent, and `dispose` gracefully shuts down the connection when you’re finished with that agent. Essentially, it's your gateway for sending commands and receiving information from a specific agent.

## Interface IOperatorControl

This interface gives you the tools to manage how an operator within your AI agent swarm behaves. You can configure it by providing callback functions that will be triggered during specific events, allowing you to react and customize the operator’s actions. 

You also have the ability to swap out the default operator implementation with your own custom version by registering a new operator adapter. This lets you tailor the operator's internal workings to fit your specific needs and integrations.

## Interface INavigateToTriageParams

This interface lets you customize how an agent navigates to a triage agent. It’s a way to inject your own logic and messages into the process. 

You can define a function `beforeNavigate` to run before the navigation actually happens, allowing you to perform checks or prepare data. The `lastMessage` property allows you to adjust the message received from the previous agent before passing it on. 

To control the messages sent during navigation, you can provide custom strings or functions for `flushMessage`, `executeMessage`, `toolOutputAccept`, and `toolOutputReject`, tailoring them to your specific workflow. These custom messages can be based on the client ID and the default agent.

## Interface INavigateToAgentParams

This interface helps you customize how the system moves between different AI agents during a conversation. It lets you inject your own logic at various points in the process, like before the switch, when a message needs to be flushed, or when an agent uses a tool. You can provide functions to tailor messages before they're sent, or provide default messages to be used. It also includes the previous user message and the names of agents involved, so you have context to work with. This offers fine-grained control over the agent orchestration flow.

## Interface IModelMessage

This interface, `IModelMessage`, represents a single communication unit within the AI agent swarm system. Think of it as the basic building block for all interactions – whether it’s a user giving a command, an agent generating a response, or a tool reporting back its results.

Each message has a defined role, like "user," "assistant," "tool," or "system," indicating who or what sent it.  It’s also linked to a specific agent through the `agentName` property, which is important when you're dealing with multiple agents working together.

The `content` is the actual text or data being passed.  You're also likely to see tool calls listed in the `tool_calls` array when an agent requests a tool to perform a task.  The `tool_call_id` is a way to connect a tool’s output back to its initial request. Finally, the `payload` can hold extra information linked to the message, like image identifiers or other metadata.

## Interface IMethodContext

This interface, `IMethodContext`, provides a way to track details about each method call within the agent swarm system. Think of it as a standardized package of information passed around to different services. It includes identifiers for the client, the method being called, and various resources involved like the agent, swarm, storage, state, compute, policy, and MCP. By using this context, services like the performance tracker, logger, and documentation generator can consistently refer to and understand the specifics of each method invocation.

## Interface IMetaNode

This interface describes the basic building block for visualizing agent connections and resources. Think of it as a node in a family tree, where each node represents an agent or a piece of data related to it. Every node has a name, which is what you're calling it – like the agent's name or a description of what it holds. It can also have children, which are other nodes connected to it, allowing you to build complex relationships and hierarchies. It's used to create diagrams showing how agents depend on each other and what they use.

## Interface IMCPToolCallDto

This interface describes the information passed around when an agent requests a tool to perform a task. It bundles together details like which tool is being used, which agent is asking for it, and any parameters needed for the tool to work. Think of it as a package containing all the specifics for a tool request. It also includes information about related tool calls and a way to cancel the operation if needed, plus a flag to indicate if this is the final call in a series of requests.

## Interface IMCPTool

This interface describes what an individual tool looks like within our AI agent swarm orchestration framework. Every tool needs a clear name so the system knows what it is. You can optionally add a description to help understand the tool's purpose. Most importantly, each tool has an input schema – this tells the system exactly what kind of information the tool expects to receive, including the data types and required fields. Think of it as the tool’s instruction manual for what it needs to work correctly.

## Interface IMCPSchema

This interface outlines the core structure of an MCP (Mission Control Protocol) – essentially a blueprint for how an AI agent swarm operates. Every MCP needs a unique name and can optionally have a description for documentation purposes.

Crucially, it defines how the system discovers available tools for a particular client and how to actually *use* those tools with specific inputs.  It also allows for optional callbacks, letting you react to important events during the MCP’s lifecycle, like initialization or shutdown. Think of it as the rules and procedures that guide the agents working together.


## Interface IMCPParams

This interface, `IMCPParams`, helps define the setup needed for managing your AI agent swarm. Think of it as a configuration object; it provides the tools your orchestration framework needs to operate smoothly. Specifically, it includes a `logger` for tracking what’s happening and a `bus` for sending messages and handling events within your agent network.  By providing these components, you give the framework the ability to debug, monitor, and coordinate your agents effectively.

## Interface IMCPConnectionService

This interface defines how different parts of your AI agent swarm communicate with each other using a simple, message-passing protocol. Think of it as the postal service for your agents – it provides the rules for sending and receiving messages. You'll use this interface to establish reliable connections between agents, ensuring they can exchange information effectively. The core functions let you create connections, send data, receive responses, and manage the lifecycle of these communication channels. It's all about enabling seamless interaction within your swarm.

## Interface IMCPCallbacks

This interface defines a set of functions that your application can use to be notified about important events happening within the agent swarm orchestration framework. Think of them as hooks that let your code react to what’s going on.

You'll get a notification when the framework is first set up (`onInit`), and again when resources for a specific client are cleaned up (`onDispose`).  The framework will also let you know when it’s retrieving tools for a client (`onFetch`) or when it's generating a list of available tools (`onList`). 

Most importantly, you're notified when a tool gets used (`onCall`), providing details about which tool was invoked and the data associated with that call. Finally, you’ll be informed when the list of available tools changes for a particular system (`onUpdate`).


## Interface IMCP

This interface lets you manage and interact with the tools available to your AI agents. You can use it to see what tools are offered to a particular agent, check if a specific tool is available, and actually trigger a tool to perform a task. There's also functionality to refresh the tool lists, either globally or for individual agents, ensuring your agents always have access to the latest tool options. Think of it as the central control panel for agent capabilities.

## Interface IMakeDisposeParams

This interface defines the information you provide when you want to automatically handle the cleanup of an AI agent within a swarm. It lets you set a timeout – a maximum time allowed for an agent’s operation before it’s automatically shut down – and specify a function to be called when that agent is being disposed of. This function gets the agent's unique identifier and the name of the swarm it belongs to, giving you a way to perform any necessary cleanup or logging related to its termination.

## Interface IMakeConnectionConfig

This interface helps control how quickly your AI agents communicate with each other. It lets you set a `delay`, which is a number representing the time (likely in milliseconds) that must pass before an agent can send a message. Think of it as a way to slow things down and prevent your agents from overwhelming each other or exceeding certain limits. By adjusting the `delay` property, you can fine-tune the interaction pace of your agent swarm.

## Interface ILoggerInstanceCallbacks

This interface defines the functions you can use to be notified about what's happening with a logger. Think of it as a way to plug into a logger's lifecycle and receive updates about logging events.

You’re given functions to respond when a logger starts up (`onInit`), shuts down (`onDispose`), and whenever different types of log messages are created – debug, info, and general logs (`onDebug`, `onInfo`, `onLog`). Each function provides the client ID of the logger, the topic of the log, and any additional arguments passed with the log message. This lets you react to logging activity and manage the logger's behavior as needed.

## Interface ILoggerInstance

This interface defines how a logger instance should behave within the agent swarm orchestration framework. It builds upon a basic logger and adds methods for managing its lifecycle, specifically when it's being used by a particular client.

The `waitForInit` method allows you to make sure the logger is properly set up before it starts working, and it can handle cases where that setup takes some time.

The `dispose` method provides a way to cleanly shut down the logger when it's no longer needed, releasing any resources it's holding and allowing for a graceful exit.

## Interface ILoggerControl

This interface gives you controls over how your logging works within the system. You can adjust the core logging mechanism to use a centralized adapter for all logging activities, or customize how individual logger instances are created to suit your specific needs. It also provides convenient shortcuts to log messages – info, debug, or general messages – for particular clients, ensuring proper session checks and keeping track of where the logs originate. Basically, it’s a toolkit to shape and manage the logging behavior of your AI agent swarm.

## Interface ILoggerAdapter

This interface describes how different systems can connect and communicate with the orchestration framework's logging system. It provides a set of methods – log, debug, info, and dispose – that allow client applications to record events and clean up resources. Think of it as a standard way for different parts of the system to report what's happening, ensuring that messages are properly formatted and handled. The `dispose` method specifically allows you to release resources associated with a client when it’s no longer needed, keeping things tidy.

## Interface ILogger

This interface defines how different parts of the AI agent swarm system record information. It provides simple ways to write down what's happening, from basic messages to detailed debug information. You can use it to track important events like agent actions, policy checks, or even just to see when data is saved. This logging helps with understanding how the swarm is working, finding and fixing problems, and keeping a record of its activity. The system lets you log general messages, specific debug information, and informational updates, all with clear topics to organize them.

## Interface IIncomingMessage

This interface describes a message coming into the AI agent swarm system. Think of it as the way information gets passed from the outside world – like a user's input – into the system to be handled by the agents.

Each incoming message has a client identifier, which tells us where the message came from, the actual data content of the message itself, and the name of the agent that's supposed to deal with it. This structure helps ensure that messages are correctly routed and associated with the right sender and processing agent.

## Interface IHistorySchema

This interface describes how your AI agent swarm keeps track of its conversations. Think of it as the blueprint for the system that remembers what's been said. The core of this is the `items` property, which specifies the specific method used to store and retrieve those messages – whether it's a database, a simple file, or something else entirely. This allows you to customize how the swarm's history is managed.

## Interface IHistoryParams

This interface defines the information needed to set up a record of an AI agent's actions and interactions. Think of it as a blueprint for building a history log. 

It includes details like the agent’s name, a client identifier, and a logger to track what's happening. You can also specify how many messages from the agent’s communication should be kept to maintain context. Finally, it utilizes a communication bus to share events within the larger system.

## Interface IHistoryInstanceCallbacks

This interface defines a set of callbacks you can use to control and observe how an agent's conversation history is managed. You can provide functions to customize how the system prompt is generated for each agent, decide which messages are saved, and get initial data. 

You'll also get notifications when the history changes—when new messages are added, old ones are removed, or the history is read. There are also hooks for initialization, cleanup, and receiving a direct reference to the history instance itself, allowing for deeper integration and customization. These callbacks let you tailor the history management to your specific agent swarm orchestration needs.

## Interface IHistoryInstance

This interface outlines how to work with the history of conversations for each agent in your swarm. Think of it as a way to keep track of what each agent has said and done.

You can use the `iterate` method to step through all the messages associated with a specific agent, allowing you to review or analyze their interactions.  

The `waitForInit` method gets things started for an agent’s history, potentially loading any existing data.

Adding new messages to an agent’s history is done with `push`, and retrieving the most recent message is handled by `pop`. 

Finally, `dispose` allows you to clean up an agent's history when it's no longer needed.

## Interface IHistoryControl

This interface lets you fine-tune how the system handles the history of your AI agents' interactions. You can tell the framework which functions should be called at different points in the history lifecycle, like when a history entry is created or updated. 

Additionally, you can specify a custom way to build history instances, giving you more control over how history data is structured and managed. This is helpful if you need to integrate with a particular data storage solution or have specific requirements for history object format.

## Interface IHistoryConnectionService

This interface helps us define how different parts of the system interact when it comes to tracking and managing the history of actions taken by the AI agents. Think of it as a blueprint for building tools that keep a record of what happened and why. It's specifically designed to make sure the public-facing parts of our system work consistently and predictably by excluding details that are only used internally.

## Interface IHistoryAdapter

This interface lets you manage a record of conversations and actions taken by your AI agents. Think of it as a way to keep track of what happened during each interaction.

You can add new messages to the record using the `push` method, retrieve and remove the most recent message with `pop`, and completely clear the history for a specific agent and client using `dispose`. 

If you need to examine the entire history, the `iterate` method provides a way to step through each message in sequence, allowing you to review or analyze past events.

## Interface IHistory

This interface keeps track of all the messages exchanged with an AI model during a swarm's operation. It allows you to add new messages to the history, retrieve the most recent message, and generate lists of messages suitable for use with individual agents or for general analysis. When you need to reconstruct a conversation or provide context to an agent, this interface provides the tools to do so – whether you need a formatted list for a specific agent or simply want to see the raw sequence of messages that have occurred.

## Interface IGlobalConfig

This configuration file defines core settings and functions that control how the AI agent swarm system operates. Think of it as the central control panel for how agents interact, handle errors, and persist data.

**Error Handling & Recovery:** It has strategies for dealing with problems during tool calls, like retrying or flushing the conversation. You can customize how the system bounces back from issues like invalid tool calls, using approaches like retrying or resetting the conversation.

**Agent Behavior:** This file shapes how individual agents work, from logging and transforming outputs to managing history. This includes how agents validate outputs, clean up responses (removing unwanted XML tags), and handle tool call attempts.

**Swarm Management:** This influences how agent groups (swarms) are initialized and navigated, setting defaults for things like the agent and navigation stack.

**Persistence & Storage:** Settings determine how data is stored and retrieved, including caching embeddings to speed up processes.

**Logging & Debugging:**  Controls the level of detail in system logs, from general information to highly specific debug data. You can fine-tune this to monitor system performance.

**Customization:**  Many of these settings can be altered to tailor the system to specific needs, allowing adjustments to how agents interact, handle errors, and persist data.

## Interface IFactoryParams

This interface lets you customize how your AI agent swarm interacts and communicates. Think of it as a way to shape the messages sent during different stages of agent navigation.

You can define custom messages to be sent when the system needs to clear out data, when an agent produces a tool's output, or when the agent needs to send a message or execute something. 

The interface also allows you to use functions for these messages, letting you dynamically generate content based on information like the client ID, the agent's name, and the user's last message. This gives you a lot of control over the overall interaction flow.

## Interface IFactoryParams$1

This interface lets you customize how navigation to a triage agent is handled. You can provide specific messages or even functions to guide the process when the system needs to clear data, execute a task, or respond to tool outputs—either accept or reject them. These messages or functions can be tailored based on the client's ID and the default agent being used, offering a flexible way to control the interaction. 

Essentially, it's a way to inject your own logic and personalized instructions into the agent navigation flow.

## Interface IExecutionContext

This interface, IExecutionContext, acts as a central record for tracking what’s happening during an execution within the AI agent swarm. Think of it as a shared identity tag. It contains key pieces of information – a client ID to identify the user session, an execution ID to pinpoint a specific run, and a process ID which links it back to the underlying system configuration. Services throughout the swarm, like the ClientAgent, performance tracking, and communication bus, all use this information to coordinate and monitor activity.

## Interface IEntity

This interface, `IEntity`, acts as the foundation for everything that's stored and managed within the AI agent swarm. Think of it as the common blueprint. Different types of data, like agent status or internal state, build upon this base to add their own specific details. It's the starting point for how the system understands and handles persistent information.

## Interface IEmbeddingSchema

This interface lets you configure how your AI agents understand and compare information. You can tell the system whether to save embedding data for later use, give the embedding process a specific name, and define functions to actually store and retrieve those embeddings from a cache.

You also have the option to customize certain events related to creating and comparing embeddings.

Finally, it provides methods for generating embeddings from text and calculating how similar two embeddings are to each other – essential for tasks like finding related concepts or ranking results.

## Interface IEmbeddingCallbacks

This interface lets you tap into what's happening when your AI agents are creating and comparing embeddings – those numerical representations of text that help them understand relationships. 

You can use the `onCreate` callback to get notified whenever a new embedding is generated, which is handy for things like tracking what's being embedded or making adjustments after the embedding is created.

Similarly, the `onCompare` callback lets you monitor how two pieces of text are being compared for similarity, so you can log these comparisons or investigate why certain texts are deemed similar or dissimilar.

## Interface ICustomEvent

This interface lets you create and send events with unique, custom data within the swarm system. Think of it as a way to communicate information that doesn's fit neatly into the standard event formats. It builds on the foundation of a basic event, but gives you the freedom to attach any kind of data you need – whether it’s a simple number, a complex object, or something else entirely. You can use this for situations where you want to signal something specific or share information that isn't part of the usual system messages.

## Interface IConfig

This interface, `IConfig`, defines the configuration options used when generating a UML diagram. It currently focuses on controlling whether to include subtrees in the generated diagram. The `withSubtree` property, when set to `true`, tells the system to include the entire subtree structure, providing a more detailed view of relationships. Setting it to `false` (or omitting it) will result in a more concise diagram that focuses on the top-level connections.

## Interface IComputeSchema

This interface, `IComputeSchema`, defines the structure for describing individual compute tasks within an AI agent swarm. Think of it as a blueprint for what each agent should do. 

It includes a descriptive text (`docDescription`) to explain the task's purpose.  You specify whether the compute is shared across agents (`shared`), give it a unique name (`computeName`), and set a time-to-live (`ttl`) to manage its lifespan.

Crucially, it outlines how to retrieve the necessary data (`getComputeData`), defines any dependencies on other compute tasks (`dependsOn`), and allows you to add pre-processing steps or post-processing hooks via middleware (`middlewares`). Finally, it provides options for callbacks to be executed after the compute finishes (`callbacks`).

## Interface IComputeParams

This interface, `IComputeParams`, acts as a container for essential resources needed by a compute unit within the agent swarm orchestration framework. Think of it as a package containing everything a worker needs to do its job. It includes a `clientId` to identify the specific client requesting the computation, a `logger` for recording events and debugging, and an `bus` for communication with other parts of the system. Finally, `binding` provides a list of state change contracts that the compute unit will react to and process, defining its role in the overall workflow.

## Interface IComputeMiddleware

This interface defines how different components in the AI agent swarm can interact and share information during computation. Think of it as a standardized way for agents to pass data and context to each other as they work together to solve a problem. Implementing this interface lets your components seamlessly plug into the orchestration framework, ensuring a smooth flow of information and coordinated action within the swarm. It provides methods for receiving and sending computation results, allowing agents to build upon each other’s work. Essentially, it’s a critical piece for building a collaborative and efficient AI agent system.

## Interface IComputeConnectionService

This interface defines how your AI agents connect to and interact with compute resources, like servers or databases. Think of it as the bridge between your agents and the tools they need to work. It provides methods for establishing connections, verifying their status, and ensuring agents can reliably access the systems they depend on. Implementing this interface allows for flexible integration with various compute environments, letting your swarm adapt to different operational setups. The methods outlined here handle the underlying complexities of connecting to these resources, simplifying the agent orchestration process.

## Interface IComputeCallbacks

This interface lets you define functions that will be called when a compute task begins, finishes, or updates its progress. Think of it as a way to get notified about what's happening with your AI agents' work. `onInit` is called when a compute task is starting up, allowing you to perform any necessary setup. `onDispose` is your signal that a compute task is wrapping up, good for cleanup actions. `onCompute` lets you react to the actual data being processed by the agent. `onCalculate` gives you a heads-up when a specific calculation is happening. Finally, `onUpdate` tells you when there's been a change to the overall state of the compute task. By providing these functions, you can tailor how the system behaves and track the lifecycle of your agents’ computations.

## Interface ICompute

The `ICompute` interface defines the core functions for managing computational tasks within the AI agent swarm. Think of it as the blueprint for a component responsible for performing calculations or data processing. 

The `calculate` function is how you tell the component to run a specific computation, identified by its `stateName`. It promises to complete the calculation.

The `update` function allows you to modify the component's configuration, letting you specify which client and compute name are involved.

Finally, `getComputeData` lets you retrieve the current data associated with the computation, which could include results, status, or other relevant information. The type `T` represents the shape of this data.

## Interface ICompletionSchema

This interface describes how a component generates suggestions or completions within the AI agent swarm. Each completion mechanism gets a unique name to identify it. You can specify whether the completion should be in JSON format and provide a list of flags to pass to the underlying language model, for example, to influence its behavior.

Optionally, you can set up callbacks to react to different events that happen during the completion process, allowing you to customize what happens after a completion is generated.

The `getCompletion` method is how you actually request a completion – it takes some arguments and returns either a model's response or an outline, depending on the request.

## Interface ICompletionCallbacks

This interface lets you hook into what happens after an AI agent completes a task. Specifically, `onComplete` is a function you can provide to be notified when a task finishes successfully. You can use this function to do things like record the outcome, process the results, or automatically start a new process based on the completion. It gives you a chance to react to the successful completion of an AI agent's work.

## Interface ICompletionArgs

This interface defines all the information needed to ask the AI agent swarm for a completion. Think of it as the request form you fill out. 

It includes a unique identifier for who's making the request (`clientId`), the name of the agent you're talking to (`agentName`), and the specific outline (if any) you want the response to follow (`outlineName`). The `mode` tells the system whether the last message came from a tool or directly from a user.

You also provide the conversation history, or context, using an array of messages (`messages`), and can optionally include a list of tools the agent can use (`tools`). Finally, you can specify the desired formatting for the output (`format`) if you need a particular structure for the AI's response.

## Interface ICompletion

This interface defines how your AI agents can get responses from a language model. Think of it as the standard way for agents to ask a model a question and receive an answer back. It provides a full set of tools for generating these model responses, ensuring a consistent way for different agents to interact with various language models.

## Interface IClientPerfomanceRecord

This interface describes the performance data collected for each individual client, like a user session or agent instance, within a larger process. It breaks down the overall system performance by providing details about each client's activity.

Each record includes a unique client identifier (`clientId`) to link the data to a specific session or agent. You're also able to see the client's memory (`sessionMemory`) and persistent state (`sessionState`), similar to how these are managed within an agent.

The interface also tracks execution metrics, including the number of times the client has run, the total input and output data processed, average execution times, and the total execution time.  These metrics help you understand how each client is performing and identify any bottlenecks or inefficiencies.

## Interface IChatInstanceCallbacks

This interface defines a set of callbacks that allow you to react to different events happening within a chat instance managed by the AI agent swarm orchestration framework. You can use these callbacks to monitor the lifecycle of a chat, from its initialization to when it's finished, and to be notified when messages are sent. Specifically, you'll receive notifications when a chat instance is ready, when it’s being shut down, when a chat session starts, and whenever a message is transmitted.  The callbacks also provide information about the client, the swarm name, and the current status of the chat instance, giving you detailed insight into what's happening.

## Interface IChatInstance

This interface defines how you interact with a single chat session within the agent swarm. 

Think of it as a representation of one conversation happening between agents. 

You can start a chat using `beginChat`, send messages to the agents involved with `sendMessage`, and check if the conversation is still active with `checkLastActivity`. When you're finished, `dispose` cleans up the chat session.  Finally, `listenDispose` allows you to be notified when a chat is being closed.

## Interface IChatControl

This API lets you configure how your AI agent swarm interacts with chat interfaces. You can specify a particular chat instance constructor with `useChatAdapter`, allowing you to tailor the underlying chat technology.  Furthermore, `useChatCallbacks` provides a way to customize how the system responds to events within the chat process, offering fine-grained control over the agent swarm’s behavior. Essentially, these functions allow you to plug in and modify the chat components of the orchestration framework.

## Interface IChatArgs

The `IChatArgs` interface defines the data needed to pass a chat message to an agent within the system. It's essentially a structured way to communicate with an agent, ensuring all necessary information is provided. Each chat request requires a unique client identifier (`clientId`), the name of the agent responsible for the conversation (`agentName`), and the actual message content (`message`). Think of it as a standard format for sending information to an agent and keeping track of who's talking to whom.

## Interface IBusEventContext

This interface helps track the context surrounding events happening within the AI agent swarm. Think of it as a way to add extra information to an event, like which agent, swarm, or storage it relates to. When an agent is directly involved, the `agentName` property is typically used to identify it. Other properties like `swarmName`, `storageName`, `stateName`, `computeName`, and `policyName` are available to provide broader context for system-wide events.

## Interface IBusEvent

This interface describes the structure of messages sent across the swarm system's internal communication channels. Think of it as a standardized way for different parts of the system, particularly agents, to talk to each other and share information about what's happening.

Each message includes information about where it’s coming from (identified as "agent-bus" when originating from an agent), what kind of action it represents (like "run" or "emit-output"), and any relevant data being passed along. This data is broken down into input and output sections, allowing for both initiating actions and reporting results.  Finally, the message includes context, such as the agent's name, providing more detail about the event.

## Interface IBus

The `IBus` interface provides a way for different parts of the swarm system to communicate with each other, especially for agents to send updates and information to specific clients. Think of it as a central messaging system.

The core function, `emit`, lets agents broadcast events to a particular client. These events are structured and contain details like the event type, where it came from, any input data, results, metadata about the agent, and confirmation of the target client.  This allows for things like notifying clients about messages being committed, tools finishing, or any other important actions.

Events are sent asynchronously, so they're queued up for delivery rather than immediately processed.  The client ID is included within the event itself, offering an extra layer of targeting and verification.  The `emit` function ensures the message goes to the correct client and lets the agent know when the message has been dispatched.



This communication method keeps different components of the system independent while still allowing them to share vital information.

## Interface IBaseEvent

This interface lays the groundwork for all events happening within the swarm system. Think of it as the fundamental building block for communication. Every event, whether it’s a message from an agent or a custom notification, inherits from this structure.

Each event has a `source` to indicate where it came from—like identifying the specific agent or system component sending the message. It also includes a `clientId` to make sure the event reaches the correct client or agent instance. This ensures messages are delivered to the right place within the swarm.

## Interface IAgentToolCallbacks

This interface defines a set of optional functions you can use to monitor and control how tools are used within your AI agents. Think of them as hooks that let you step in before, after, or even during the tool's process.

You can use `onBeforeCall` to do things like log what’s happening or prepare data *before* a tool runs.  Similarly, `onAfterCall` lets you handle cleanup or record results *after* the tool has finished.

`onValidate` gives you a chance to check if the parameters being passed to a tool are correct before it even starts running, ensuring everything is set up properly.  Finally, `onCallError` is your safety net – it allows you to catch and respond to any errors that occur during the tool's execution.


## Interface IAgentTool

This interface describes a tool that an AI agent can use, building upon a more general tool definition. Each tool has a name to identify it and a description to help users understand how to use it. 

You can check if a tool is ready to be used with `isAvailable`, which considers factors like the client and agent involved. Before a tool runs, `validate` ensures the provided information is correct. 

For more control, you can add lifecycle callbacks with `callbacks` to customize how the tool functions. `type` specifies the tool’s kind, and `function` can provide detailed metadata. 

Finally, the `call` method actually executes the tool, using all the provided parameters and context information, and includes options for stopping the process if needed.

## Interface IAgentSchemaInternalCallbacks

This interface defines a set of optional callbacks you can use to monitor and react to different stages of an agent's lifecycle. Think of them as event listeners for your agent – you can plug in functions to be notified when specific things happen.

For example, you can use `onRun` to know when an agent executes a task without maintaining a conversation history, or `onExecute` to be alerted when an agent actually starts working on something. 

You also get callbacks for tool-related activities, like `onToolOutput` when a tool generates a response and `onToolError` when a tool encounters a problem. `onAfterToolCalls` lets you know when a whole sequence of tools has finished.

Beyond the core execution, there are hooks for more advanced scenarios – `onResurrect` is triggered if the agent needs to be restarted, and `onInit` and `onDispose` mark the beginning and end of the agent's existence, respectively. Finally, `onUserMessage` lets you track user input and `onAssistantMessage` tracks the agent’s responses.

## Interface IAgentSchemaInternal

This interface defines the blueprint for how an agent within the swarm operates. It specifies everything from the agent's name and primary prompt to the tools and data sources it can access. You can configure limits, like the maximum number of tool calls or how many messages are kept for context.

The interface also allows you to customize the agent's behavior through callback functions. These functions let you modify tool calls, transform outputs, validate responses, and even dynamically adjust system prompts. There's a way to connect agents to an operator dashboard for live interaction, and it also handles situations where an agent relies on other agents. Finally, it provides a place to define the agent's storage, wiki, and state management.

## Interface IAgentSchemaCallbacks

This interface provides a way to hook into different stages of an agent's lifecycle. You can use these callbacks to monitor what an agent is doing, respond to specific events like tool usage or system messages, or perform actions based on the agent's progress. 

For example, you might use `onToolOutput` to log the results of a tool's execution, or `onUserMessage` to display a user's input. `onAfterToolCalls` lets you react once all the tools in a sequence have finished their work. `onResurrect` is useful for handling situations when an agent needs to restart after a pause or error, and `onInit` & `onDispose` let you know when an agent is starting up and shutting down, respectively.

## Interface IAgentSchema

This interface, `IAgentSchema`, defines the structure for configuring an agent within the orchestration framework. It allows you to specify instructions or context for the agent to follow. 

You can provide a static set of system prompts using the `system` or `systemStatic` properties, which can be a single prompt or an array of prompts.  

For more complex scenarios, the `systemDynamic` property lets you generate system prompts on the fly. This property uses a function that receives the client ID and agent name, and then returns a single prompt string or an array of prompt strings, providing a way to customize the agent's instructions based on the situation.

## Interface IAgentParams

This interface defines the information passed to each agent within the orchestration framework. It bundles together essential components like a client identifier, a logging system, and communication channels within the swarm. 

The agent also gets access to tools it can use, a system for tracking its past actions, and a mechanism to generate final responses. Finally, there's a validation step to ensure the agent's output is correct before it's considered finished.

## Interface IAgentNavigationParams

This interface defines how to set up navigation for your AI agents. Think of it as instructions for guiding an agent to a specific tool or location within your system. You’ll use it to specify the name and a short explanation of the tool the agent should use, as well as which agent it needs to connect with. There's also a spot to add some extra notes for documentation purposes.

## Interface IAgentConnectionService

This interface helps us define how external services interact with agent connections. Think of it as a blueprint for building systems that work with our agent swarm. It focuses on the public-facing parts of agent connections, leaving out the behind-the-scenes details that aren't meant for external use. This separation makes sure that what's exposed to other services is clean and predictable.

## Interface IAgent

The `IAgent` interface defines how you interact with an individual agent within your swarm orchestration framework. Think of it as the blueprint for an agent's behavior.

You can use the `run` method for quick, isolated tasks or previews, without affecting the agent's ongoing memory.  The `execute` method is how you trigger the agent to process an input and potentially update its memory.  If you need to retrieve the agent's final output, the `waitForOutput` method will handle that for you.

Beyond basic execution, you have various commit methods to manage the agent's context. These methods allow you to add information to the agent’s history, including tool outputs, system messages (internal instructions), developer messages (for debugging or control), user inputs, assistant responses, and requests for tools.  You can also use commit methods to pause or reset the agent’s process, like stopping tool executions or flushing its memory entirely.
