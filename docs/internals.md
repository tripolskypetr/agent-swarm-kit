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

This function checks that all your AI agent swarms, individual agents, and their outlines are set up correctly. Think of it as a health check for your AI system – it ensures everything is in a good state. Running this function won't cause any problems, even if you run it multiple times, because it's designed to only validate once during each process.

## Function startPipeline

This function lets you kick off a pre-defined workflow, called a pipeline, within the AI agent system. You specify a unique client ID to identify the request, the name of the pipeline you want to run, and the agent responsible for handling it. You can also pass along some data, the payload, that the pipeline will use during its execution. The function will then promise to return a result based on what the pipeline does.

## Function scope

This function lets you run a piece of code – like a task or a mini-program – inside a controlled environment. Think of it as setting up a little sandbox where your code operates. You can customize this sandbox by providing your own versions of key components, such as the agents that perform actions, the tools for generating text, or the pipelines that manage workflows. If you don't provide your own versions, it will use the default settings provided by the overall system. Essentially, it provides a way to execute code while ensuring it interacts with the environment in a predictable and manageable way.

## Function runStatelessForce

This function lets you send a message to your AI agent swarm and get a response, but it's special because it doesn't save that message to the agent's memory. Think of it as a one-off instruction – it won't affect future conversations.

It's designed for situations where you need to process things like data storage outputs or simple tasks without filling up the agent’s chat history. Even if the agent isn't actively working right now, this function will still force the message to be processed.

You provide the message content and a unique identifier for your client session, and the function takes care of the rest, including keeping track of how the message was handled and sending out notifications. The function creates a fresh working environment to ensure accurate and isolated execution.

## Function runStateless

This function lets you quickly send a message to an agent in your swarm without saving it to the ongoing conversation history. Think of it as a way to run a single, isolated task or process a piece of data without affecting the agent's memory of previous interactions. 

It's especially useful when dealing with things like processing output from external storage or performing short, one-off jobs where you don't want the interaction to build up the chat history. 

The function checks to ensure the agent is active before sending the content and keeps track of the process’s performance. It ensures the agent hasn’t changed during the process and won't execute if it has. You provide the message content, a client identifier, and the name of the agent you want to use.

## Function questionForce

This function lets you directly trigger a question-answering process, bypassing the usual chat flow. You provide the question or message you want answered, a unique identifier for who’s asking, and the specific knowledge base (wiki) you want the answer to come from. It’s useful when you need a guaranteed response from the system, regardless of what's already happening in a conversation. The function will return the answer as a string.

## Function question

This function lets you send a question or message to the AI agent swarm for processing. It's the starting point for a conversational turn.

You'll need to provide the actual question as text, a unique identifier for the client asking the question, the name of the specific agent responsible for handling the request, and the name of the knowledge base (wiki) the agent should consult.

The function will then return a promise that resolves to the agent's response to the question.

## Function overrideWiki

This function lets you modify the settings for an existing wiki within the agent swarm. Think of it as updating a wiki's configuration – you can change parts of it or provide a completely new setup. It works independently of other processes, ensuring a reliable update.  If logging is turned on, you'll see a record of the change made. You provide the new or updated settings for the wiki through the `wikiSchema` parameter.

## Function overrideTool

This function lets you modify how a tool behaves within the AI agent swarm. Think of it as a way to customize a tool’s definition – perhaps to change its description, available inputs, or how it handles data. You can provide a new schema or just update specific parts of an existing one. The system makes sure this change is applied cleanly and separately from any ongoing tasks, and it will record the change if logging is turned on. It's all about giving you the flexibility to adjust your tools as needed.

## Function overrideSwarm

This function lets you change the blueprint for a swarm of AI agents. Think of it as updating the instructions for how the swarm operates. You can provide a new or partial schema to modify existing swarm configurations. This update happens independently, ensuring a clear and isolated change process, and it will log the action if logging is turned on. Essentially, it's a way to adjust the swarm's behavior on the fly. You only need to provide the parts of the schema you want to change; the rest will remain as they were.

## Function overrideStorage

This function lets you modify how the swarm system handles data storage. Think of it as a way to tweak the storage configuration, perhaps adding new fields or changing existing ones. It makes these changes directly, ensuring they're isolated and doesn't interfere with ongoing processes.  You can use it to adjust storage details like how data is structured or organized. The provided schema acts as a blueprint for these modifications, allowing you to specify exactly what needs to be changed.

## Function overrideState

This function lets you change the blueprint for how data is stored and managed within the swarm. Think of it as modifying a template – you can add new fields or adjust existing ones. It’s designed to work independently, ensuring changes are made cleanly and safely.  If your system is set up to log activity, this function will record that a state schema has been updated. You provide a new or partial set of properties for the state, and the function takes care of applying those changes.

## Function overridePolicy

This function lets you adjust existing policies within the AI agent swarm. Think of it as a way to tweak a policy's settings—you can provide a new schema or just update specific parts of the existing one. It works independently, ensuring changes are made cleanly and without interference from other processes. If logging is turned on, the system will record that a policy was overridden. You just need to provide the changes you want to make to the policy’s structure or properties.

## Function overridePipeline

This function lets you modify an existing pipeline definition. Think of it as a way to tweak a pipeline's steps or configurations without having to redefine the whole thing from scratch. You provide a partial pipeline schema – just the parts you want to change – and this function merges those changes into the original pipeline. It's helpful for making adjustments or customizations to a pipeline based on specific needs.

## Function overrideOutline

This function lets you modify an outline – think of it as a plan or structure for your AI agents – within the swarm system. You provide a partial outline schema, essentially giving instructions on how to change an existing outline. To keep things predictable and avoid conflicts, this update happens in a fresh, isolated environment. If your system is set up to log activities, you’ll see a record of this outline modification. The provided schema contains the outline name and the specific changes you want to make to the existing outline.

## Function overrideMCP

This function lets you modify an existing Model Context Protocol (MCP) definition. Think of it as a way to update or add to the information an AI agent uses to understand its environment. You provide an existing MCP as input, and the function returns a new, adjusted MCP based on your changes. It’s useful for tailoring the agent's understanding of its context.

## Function overrideEmbeding

This function lets you modify how your AI agents understand and process information by changing the embedding schema. Think of it as adjusting the rules for converting text into numerical representations. You can update existing rules, or add new ones, to fine-tune the system's comprehension. It's designed to work independently, ensuring changes are isolated and doesn't interfere with ongoing processes. If logging is turned on, this action will be recorded. You provide a new or partial set of rules, and the system applies them to the existing embedding configuration.

## Function overrideCompute

This function lets you modify an existing compute schema, essentially updating parts of it with new information. Think of it as a way to fine-tune how computations are handled within the AI agent swarm. You provide a partial schema with the changes you want to make, and the function merges those updates into the original schema. It’s useful when you need to adjust computational behavior without completely redefining the entire schema.

## Function overrideCompletion

This function lets you adjust how the AI agents generate text within the system. You can use it to modify existing completion settings, providing either a full new schema or just a few updates. Think of it as tweaking the AI's writing style or instructions. The changes are applied directly, ensuring they're isolated and don't interfere with ongoing processes, and system activity is logged if that feature is turned on. You pass in a piece of code – a `completionSchema` – that describes the changes you want to make.

## Function overrideAgent

This function lets you modify an agent's configuration within the swarm. Think of it as updating an agent's blueprint – you can change its settings or add new features. It ensures the change is isolated, preventing unintended consequences elsewhere in the system. The function keeps a record of the changes if logging is turned on. You provide the new or updated agent details, and it applies those changes to the existing agent.

## Function notifyForce

This function lets you send a message out from the agent swarm session without actually processing any incoming commands. Think of it as a direct output channel. It's specifically for sessions created using the "makeConnection" method. 

Before sending, the system double-checks that the session and the targeted agent are still running and available. 

You provide the message content and a unique client ID to identify where the notification originates. The function ensures a clean environment for the operation, keeps a record of it if logging is turned on, and won't work if the session wasn't created with "makeConnection."

## Function notify

This function lets you send messages out from your AI agent swarm session without actually triggering any further processing. Think of it as a way to broadcast a notification or status update. It’s specifically designed for sessions created using the "makeConnection" method, ensuring a controlled and predictable flow of information.

Before sending the message, the system checks to make sure the connection is valid, the swarm is running, and the agent you've specified is still active. It’s also carefully managed to keep things clean and prevent errors – if something’s changed, like the agent being replaced, the notification will be skipped.

You’ll need to provide the actual message content, a unique ID for the client sending the message, and the name of the agent you want the notification to appear to come from.

## Function markOnline

This function lets you tell the system that a particular client is now active and participating in a specific swarm. Think of it as updating the status of an agent – you provide the client's unique identifier and the name of the swarm it belongs to, and the system registers that it's online. It’s a straightforward way to keep track of which agents are currently available for tasks within your swarm. You're essentially signaling the system to acknowledge the client's presence and readiness.

## Function markOffline

This function lets you tell the system that a particular client is no longer active within a specific swarm. You provide the unique ID of the client and the name of the swarm it’s part of. Essentially, it's how you signal that a client has disconnected or is unavailable. Using this, the system can adjust tasks and resource allocation accordingly.

## Function listenEventOnce

This function lets you listen for a single event on the swarm's communication system. You specify which client you want to hear from (or listen to all clients), the event topic, and a filter to determine which events should trigger your callback. When an event matching your filter arrives, your callback function will be executed with the event's data, and the listener automatically stops after that single event. It’s useful for reacting to a specific event once and then stopping the listener, ensuring clean and controlled interactions within the swarm. The function also provides a way to cancel the listener before it triggers.

## Function listenEvent

This function lets you set up a listener for specific events happening within the agent swarm. Think of it as subscribing to a channel to receive updates.

You tell the system which client or all clients you want to hear from, and what event topic you're interested in. When an event matching your criteria occurs, a function you provide will be executed, receiving the data associated with the event.

To stop listening to those events, the function returns a special "unsubscribe" function that you can call. The system also makes sure the event names you’re using aren’t reserved and handles events in a controlled order for reliability.


## Function json

This function helps you turn a defined outline – think of it as a blueprint for data – into structured JSON. You give it the name of the outline you want to use, and optionally provide some input parameters. The function then takes care of generating the JSON data based on that outline’s structure. To keep things tidy and prevent issues, it runs this process in a self-contained environment. Essentially, it’s a tool for transforming structured requests into organized JSON outputs.

## Function hasSession

This function helps you quickly check if a client has an active session. It's a simple way to confirm a client is logged in or connected before proceeding with other actions. Behind the scenes, it uses a dedicated service to handle the actual session verification process, and it will log its activity if logging is turned on. You just need to provide the unique ID of the client you want to check.

## Function hasNavigation

This function helps determine if a particular agent is included in the navigation plan for a specific client. It verifies that both the client and the agent are active and then looks at the assigned swarm to see if the agent is part of the planned route. If logging is turned on in the system settings, this check will also generate a log entry. You'll need to provide the client's ID and the agent’s name to use this function.

## Function getWiki

This function lets you fetch a specific wiki's structure and content from the system, using its unique name. Think of it as requesting the blueprint for a particular wiki. The system keeps track of these requests, logging them if you've enabled that feature in your settings. You just need to provide the wiki's name, and it will return the schema defining its layout and information.

## Function getUserHistory

This function lets you pull up a user's conversation history for a specific session. It finds all the messages they sent during that session. 

You provide a unique identifier for the session, and the function returns a list of messages. Think of it as accessing a log of what the user said and did within that session. It's designed to give you a clear record of the user’s interactions. 

The `clientId` is the key piece of information you need to provide to get the right history.

## Function getToolNameForModel

This function helps determine the specific name a tool should use when interacting with an AI model. It takes the tool's registered name, a client identifier, and the agent's name as input. This allows for dynamic adjustments to tool names based on the client and agent involved, ensuring proper communication within the AI agent swarm. Essentially, it translates a general tool name into a model-specific identifier. The function returns a promise that resolves to the adjusted tool name.

## Function getTool

This function lets you fetch the details of a specific tool that's registered within your AI agent swarm. Think of it as looking up a tool's blueprint – you provide the tool's name, and it returns all the information about it, like what inputs it expects and what kind of results it produces.  If your system is configured to log activity, this function will also record that you requested the tool's information. You just need to provide the name of the tool you're interested in.

## Function getSwarm

This function lets you fetch the configuration details for a specific swarm, identified by its name. Think of it as looking up the blueprint for a team of AI agents. It's designed to get you the information needed to understand how that swarm is set up and what it’s supposed to do. The function will also keep a record of this retrieval if you’re using the system’s logging features. You just need to provide the name of the swarm you want to inspect.

## Function getStorage

This function lets you fetch details about a specific storage location within the agent swarm. Think of it as looking up the blueprint for how data is organized and stored. You provide the name of the storage you're interested in, and the function returns a description of its structure and the type of data it holds. The system will also record this action if logging is turned on.

## Function getState

This function lets you fetch a specific state definition from the AI agent swarm. Think of it as asking the swarm, "Hey, can you give me the blueprint for this particular state?" It's helpful when you need to understand the structure and expected data for a state within the swarm’s operation. If you have logging turned on, this request will also create a record for tracking purposes. The function requires you to provide the name of the state you're looking for.

## Function getSessionMode

This function lets you find out the current status of a client session within your swarm. Think of it like checking what stage a particular client is in – whether they're actively in a session, trying to establish a connection, or have completed their tasks. 

You provide a unique ID for the client session, and the function returns a descriptive label indicating its mode. The system verifies the session and associated swarm, keeps a record of the action if logging is enabled, and then gets the mode from a dedicated session service. It runs in a special, isolated environment to ensure everything runs smoothly.

## Function getSessionContext

This function lets you peek into the current running environment, giving you important information like the client ID, process ID, and what methods and execution contexts are available. It gathers this data and packages it into a session context object. Think of it as a way to understand the overall setup of the agent swarm's activity at any given moment. Because it's linked to the environment it's running in, you don't need to provide any extra information to use it – it figures things out on its own.

## Function getRawHistory

This function lets you access the full, unaltered conversation history for a specific client’s agent within the swarm. It’s like getting a direct download of everything that's been said, without any changes or filters applied.

To retrieve this history, you'll need to provide the unique identifier associated with the client session. 

The function is designed to run in a secure environment and will log its actions if logging is enabled. It carefully verifies the session and agent before fetching the history, ensuring accuracy and security. The returned history is a new copy, preventing accidental modifications to the original data.

## Function getPolicy

This function lets you fetch a policy definition by its name. Think of it as looking up the rules and guidelines for a specific task within your AI agent swarm. It's a straightforward way to get the details of a policy when you need them, and the system keeps a record of these requests if you're tracking activity. You simply provide the policy's name, and the function returns the full policy definition.

## Function getPipeline

This function lets you fetch a pipeline definition by name from the central system managing pipelines within the agent swarm. Think of it as looking up the blueprint for a specific workflow. When you call this function, the system will record the request if logging is turned on. You just need to provide the name of the pipeline you want to retrieve.

## Function getPayload

This function lets you grab the data – we call it the "payload" – that's currently being managed by the system. Think of it as retrieving a package that's in transit. If there's no package available right now, it will return nothing. And if the system is set up to record activity, it will make a note that you requested this data.

## Function getNavigationRoute

This function helps you discover the path an agent took within a swarm, given a specific client and swarm name. It essentially tells you which agents were involved in a process or task. 

It relies on a navigation service to actually figure out the route, and might record some information about this process based on how the system is configured. 

You’ll need to provide a unique identifier for the client making the request, along with the name of the swarm you’re interested in. The function returns a set of agent names that represent the navigation route.

## Function getMCP

This function lets you fetch a specific Model Context Protocol (MCP) definition from the system. Think of an MCP as a blueprint for how an AI agent interacts with its environment – this function gets you that blueprint by its name. It will also record that you requested the MCP if the system is set up to keep logs. You simply provide the name of the MCP you need, and the function returns its schema.

## Function getLastUserMessage

This function helps you find the last thing a user typed within a specific conversation. It digs into the conversation history for a given client, looking for the most recent message they sent. If a user message is found, you'll get its content as text. If there's no record of a user message for that client, the function will return nothing. You need to provide a unique identifier for the client to specify which conversation to look into.

## Function getLastSystemMessage

This function helps you get the last message sent by the system within a specific client's interaction history. It essentially digs into the client's session data, finds the most recent message labeled as coming from the "system," and brings that content back to you. If no system messages have been sent to that client, the function will return nothing. You’ll need to provide the unique identifier for the client you’re interested in.

## Function getLastAssistantMessage

This function helps you easily grab the latest message sent by the AI assistant during a conversation with a specific user. It looks through the user's chat history to find the very last time the assistant responded. 

You just need to provide the unique ID of the user’s session, and it will return the assistant’s message as text. If the assistant hasn't sent any messages yet for that user, it will return nothing. It works by quietly checking the chat history behind the scenes.

## Function getEmbeding

This function lets you fetch the details of a specific embedding model registered within the AI agent swarm. Think of it as looking up the blueprint for how a particular embedding model works. You provide the name of the embedding you want, and the function returns a structured description of its configuration. The system will also record this action if logging is turned on.

## Function getCompute

This function lets you fetch details about a specific compute resource within your AI agent swarm. Think of it as looking up the configuration for a particular worker or tool. You provide the name of the compute you’re interested in, and the function returns its schema – essentially a structured description of how it works and what it needs. If your system is set up to log activity, this function will record that you’re retrieving compute information.

## Function getCompletion

This function lets you fetch a specific completion definition from the system, identifying it by its name. Think of it as looking up a recipe by its title. The system keeps track of these completion definitions, and this function provides a way to access them. If the system is set up to record activity, it will also log that you requested this completion. You simply provide the name of the completion you're looking for, and the function will return its details.

## Function getCheckBusy

This function lets you quickly determine if a specific client's AI agent swarm is actively working on something. You simply provide the unique client identifier, and it will return `true` if the swarm is busy and `false` otherwise. It's useful for checking availability or managing workflow dependencies. The client ID is how the system knows which swarm you're asking about.

## Function getAssistantHistory

This function lets you see the conversation history specifically from the assistant’s perspective for a particular client session. It pulls the complete history and then isolates the assistant's messages, giving you a clear view of what the assistant has said. You provide a unique identifier for the client session to retrieve the relevant history. This information is useful for understanding the assistant's behavior and reviewing its contributions to the conversation.

## Function getAgentName

This function helps you find the name of the agent currently working on a specific client's session within your swarm. To use it, you simply provide the unique identifier for that client. It's designed to be reliable, checking that the client and swarm are valid and keeping a log of the operation if you’ve enabled logging. The process ensures a clean and independent execution to avoid any interference from other activities.

## Function getAgentHistory

This function lets you see the history of interactions for a particular agent within your AI agent swarm. It pulls up the agent's record, taking into account any rescue strategies the system uses to handle tricky situations. To get the history, you need to provide the client ID and the agent's name. The system checks that the client and agent are valid, logs the request if logging is enabled, and then fetches the history. The process runs in a special, isolated environment to keep things clean and reliable.

## Function getAgent

This function lets you fetch the detailed configuration of a specific agent within your AI agent swarm. Simply provide the agent's name, and it will return all the internal details of that agent's setup. The system will also record this retrieval if logging is turned on in the overall framework settings. It’s a straightforward way to inspect and understand how an agent is configured.

## Function fork

This function lets you run code – like tasks for your AI agents – within a controlled environment. Think of it as creating a temporary, isolated workspace for each agent to do its job. You provide a function that contains the agent’s specific instructions, and this function handles setting up everything the agent needs, verifying it's ready, and cleaning up afterwards. The function you provide will receive a unique identifier for the agent and its name, allowing it to customize its actions. It manages the whole lifecycle of the agent’s session, simplifying your orchestration logic.

## Function executeForce

This function lets you directly send a message or command to the active agent in your swarm, as if it's coming from a client. It's perfect for situations where you need to force an action, like reviewing a tool’s output or starting a conversation, even if the agent's status is uncertain.  Unlike other commands, this one bypasses checks to ensure the agent is active, guaranteeing that the instruction is carried out.  It handles the necessary setup and tracking behind the scenes, making sure the execution is clean and the process is monitored. You'll need to provide the message you want sent, along with a unique identifier for the client making the request.

## Function execute

This function lets you send a message or command to a specific agent within a group of agents working together. Think of it as having a conversation with one agent on behalf of a user. It's designed for situations where you want to review what an agent is doing or have the agent communicate directly with the user.

Before sending the message, the system makes sure the agent is still available and that everything is set up correctly. It keeps track of how long the process takes and notifies other parts of the system about what's happening. You need to provide the content of the message, a unique ID for the user's session, and the name of the agent you want to target.

## Function event

This function lets clients send custom messages to the entire swarm. Think of it as a way to broadcast information – a client can send a notification, a request, or any other data to other parts of the system that are listening for specific topics.

You provide a unique identifier for the client sending the message, the name of the topic (which can't be a reserved name), and the data you want to send.  The system then delivers this message to all interested listeners. 

It's designed to be reliable and keeps things tidy by running in a protected environment.

## Function emitForce

This function lets you directly send a string as output from the AI agent swarm, essentially simulating a response without involving any active agents or message processing. It’s specifically intended for use with sessions created through `makeConnection`, ensuring everything works together smoothly. 

Think of it as a shortcut for providing a pre-determined response. It prepares a fresh environment for the output, double-checks that the session and swarm are valid, and won't work if the session wasn't started using `makeConnection`. You provide the text you want to send and a unique identifier for the client session.

## Function emit

This function lets you send a string as output from an agent, essentially mimicking what an agent might produce. It's specifically for situations where you're setting up a connection, and it ensures that the agent you're sending output from is still active and part of the session. Think of it as a controlled way to inject content into the system, bypassing the usual message processing flow. The system validates everything to make sure it's all working correctly before sending anything. It’s important to note this function is only usable when setting up connections.

Here’s a breakdown of what you need to provide:

*   `content`: The actual text you want to send as output.
*   `clientId`: A unique identifier for the connection.
*   `agentName`: The name of the agent that should be associated with this output.

## Function commitUserMessageForce

This function lets you add a user's message to the agent’s record in a swarm session, even if the agent isn't currently active. Think of it as directly updating the agent's history. It's designed for situations where you need to ensure a message is permanently logged, bypassing usual checks and ensuring a clean execution. The function validates the session and swarm, and keeps a log of the action if logging is turned on. You provide the message content, the execution mode, a unique identifier for the client session, and optionally, some extra data.

## Function commitUserMessage

This function lets you add a user's message to an agent's record within the swarm, without immediately causing the agent to respond. Think of it as quietly updating the agent's knowledge base. You provide the message content, the execution mode, a client identifier, and the agent's name. Optionally, you can include extra data in a payload. The system ensures the agent and session are still valid, keeps a log of the action if logging is turned on, and then adds the message to the agent's history. It handles the process carefully to avoid interfering with other actions.

## Function commitToolRequestForce

This function lets you directly push tool requests to an agent within the swarm, essentially forcing the action to happen. It skips some standard checks to make this happen quickly. Think of it as a shortcut to get a specific task done by an agent, but be careful because it bypasses some safety measures. It’s important to provide the client ID so the system knows where the request is coming from, and it automatically handles logging and managing the execution environment. You're giving the system a list of tasks (the 'request') and telling it which client initiated them.

## Function commitToolRequest

This function lets you send tool requests to a specific agent within the AI agent swarm. It's designed to make sure the agent you're talking to is the right one, and it handles the necessary setup and logging behind the scenes. You provide the requests you want the agent to perform, along with a client identifier and the agent's name, and the function will take care of submitting those requests and returning a confirmation. Essentially, it's the mechanism for triggering actions within the swarm.

## Function commitToolOutputForce

This function lets you directly push the results from a tool back into the agent's process, even if the agent might not be actively waiting for it. It's a way to ensure the agent receives the tool’s output quickly. 

Essentially, it forces the output to be committed, skipping checks to see if the agent is still connected. The process includes verifying the session and swarm’s status, and it keeps a log of what happened. It’s designed to run independently, ensuring a clean environment for the commitment.

You'll need to provide the tool’s ID, the actual result from the tool (the `content`), and a client identifier to track the session.

## Function commitToolOutput

This function lets an agent share the results it got from using a tool with the rest of the swarm. It’s how agents communicate their progress and findings.

Before sharing, it double-checks that the agent is still authorized to do so, keeping everything secure and reliable. The function also keeps a record of the action if logging is turned on. It's designed to run independently, preventing any interference from other ongoing processes.

You’ll need to provide the tool's identifier, the tool's output, the client's identifier, and the agent's name to successfully commit the tool's results.

## Function commitSystemMessageForce

This function lets you directly push a system message into a session, bypassing normal checks about which agent is currently active. It's a way to ensure a system-related message gets delivered even if there’s no agent actively participating.

Essentially, it validates that the session and swarm exist, then immediately commits the message. Think of it as a more forceful version of sending a message – it’s like sending a message to the assistant without waiting for its confirmation.

You’ll need to provide the content of the message and the client ID associated with that session. This function handles checking the session and swarm's validity, logging the operation, and securely committing the message.

## Function commitSystemMessage

This function lets you send messages directly to an agent within the swarm system, useful for things like sending configuration updates or control signals. Before sending, it double-checks that the agent, session, and overall swarm are all valid and that you're targeting the correct agent. It handles the technical details of sending the message and keeping track of everything, so you don’t have to. Think of it as a way to communicate important system information to an agent, similar to how `commitAssistantMessage` sends responses, but specifically for system-level instructions.

You'll need to provide the message content, the client ID associated with the session, and the name of the agent you’re sending the message to. Each of these will be checked to ensure everything is set up correctly.

## Function commitStopToolsForce

This function lets you immediately halt the next tool execution for a particular client within the swarm, even if there’s an agent currently running. It’s a forceful way to pause the process, bypassing normal checks to ensure the stop happens right away.

Essentially, it validates the session and swarm and then directly tells the system to stop the next tool for the specified client. Think of it as a more direct and forceful version of stopping tools.

You'll need to provide the client's ID for this operation, and the system will handle the validation and stopping process behind the scenes, keeping track of everything with detailed logging.

## Function commitStopTools

This function gives you a way to pause a specific AI agent's tool execution within a larger swarm system. Think of it as putting a temporary hold on what that agent is doing next. 

It carefully checks that the agent and session you’re referencing are actually valid before stopping the tool flow. This function works quietly in the background, managing the process and logging what it's doing.

It's a control mechanism that’s different from clearing an agent’s history; instead, it prevents the agent from moving on to its next task. You need to provide the client ID and the agent’s name to use this function.

## Function commitFlushForce

This function lets you forcefully clear an agent’s history for a particular client, even if the agent isn't actively working on it. It's a way to ensure a clean slate for the agent's memory.

Before clearing the history, it checks that the session and swarm are valid. It handles the process within a secure context and keeps a log of what’s happening.

Think of it as a more powerful version of a regular history clear, useful when you need to be absolutely certain the agent's memory is refreshed – similar to forcing a specific type of assistant message.

You’ll need to provide the unique ID of the client whose history you want to flush.

## Function commitFlush

This function lets you completely clear the interaction history for a particular agent working on behalf of a specific client. Think of it as a reset button for an agent's memory.

It carefully checks that the agent and client are valid before proceeding to ensure you're only clearing the correct history.

This is a distinct action from adding more messages to an agent’s history; instead, it removes everything that has been recorded.

You'll need to provide the client's ID and the agent's name to use this function.

## Function commitDeveloperMessageForce

This function lets you directly push a developer-created message into a session within the agent swarm, bypassing the usual checks for which agent is active. It's useful when you need to ensure a message is recorded, even if the system isn't ready for it.

Essentially, it forces the message into the session after confirming it's a valid session and swarm. 

You provide the message content and the client ID associated with the session. This function operates behind the scenes, handling validation, logging, and actually committing the message. Think of it as a more direct and forceful way to add developer messages, similar to how assistant messages can be forced as well.

## Function commitDeveloperMessage

This function lets you send messages directly to a specific agent within the swarm, useful for providing developer instructions or user feedback. It makes sure the agent, session, and swarm are all valid before sending the message. The process is handled securely and with detailed logging. Think of it as a way to override or guide the agent's actions with custom input, similar to how you might provide system messages, but specifically for developer or user-generated content. You’ll need to specify the message content, the client ID associated with the session, and the name of the agent you want to address.

## Function commitAssistantMessageForce

This function lets you directly push a message from an assistant into a session, even if an agent isn't actively working on it. It's a way to ensure a message gets logged and stored without going through the usual agent checks. 

Essentially, it bypasses the standard process and forces the message to be committed. It confirms the session and swarm are valid before doing so, and keeps track of what’s happening through logging.

You'll need to provide the message content and the client ID to use this function. It’s like a "force commit" option, similar to how `cancelOutputForce` works compared to `cancelOutput`.

## Function commitAssistantMessage

This function allows you to record a message generated by an AI agent within the swarm system. It’s used to save the agent's output, ensuring that the message is associated with the correct agent and client.

Before saving the message, the system checks to make sure the agent and client are valid and part of an active session. This helps keep things organized and secure. 

Think of it as a way to permanently store what the agent is saying, similar to how you might record a conversation. It works alongside other functions that might manage the agent’s actions, making sure everything is properly tracked.

You provide the message content, a client identifier, and the agent’s name to use this function.

## Function changeToPrevAgent

This function allows you to switch back to a previously used agent for a specific client. Think of it as a "undo" button for agent selection. If you've been trying out different agents and want to revert to the last one you used, or the default if there isn’t a previous one, this is the tool to use. It handles the switching process safely, checking to make sure everything is valid, and ensures the change happens reliably even with background operations. You provide the unique ID for the client session, and the function takes care of the rest.

## Function changeToDefaultAgent

This function helps reset a client's active agent back to the standard, pre-configured agent within the swarm. Think of it as a way to undo any changes made to which agent is handling a client’s session. It ensures the change happens safely and efficiently, checking everything is in order and handling it through a reliable system. You provide the unique ID of the client session, and the framework takes care of switching agents and making sure the process is secure.

## Function changeToAgent

This function lets you switch which AI agent is actively handling a client's session within your swarm. It's designed to ensure a smooth transition, checking that everything is set up correctly and handling the change in a controlled way. Think of it as assigning a different specialist to assist a client. You provide the name of the new agent and the client’s ID, and the system takes care of the rest, making sure it’s done reliably and efficiently. It’s like telling the system, "Hey, now agent X should be working with client Y."

## Function cancelOutputForce

This function provides a way to quickly stop an agent from producing output for a particular client. It essentially forces a cancellation by sending an empty response, bypassing checks to see if the agent is still running or if the session is valid.

Think of it as an emergency stop button for an agent’s work. 

It's designed for situations where you need to interrupt the process immediately, even if it means potentially cutting off an agent mid-task.

The function ensures the session and swarm are valid before proceeding and logs its actions for tracking. You provide the client’s ID to specify which output to cancel.


## Function cancelOutput

This function lets you stop an agent from sending its results back to a client. It's useful if you realize you don't need the answer anymore.

Before cancelling, it double-checks that the client and agent you’re referencing are valid and exist within the system.

It handles the necessary background checks and logging to ensure a clean cancellation process. 

You'll need to provide the client's ID and the agent's name to tell the system which output to stop.

## Function addWiki

This function lets you add a new wiki to the system, essentially defining a new area of knowledge for your AI agents to work with. You provide a schema, which acts as the blueprint for the wiki, outlining its structure and content. The function then registers this wiki, making it available for agents to access and contribute to. It returns a unique identifier for the newly added wiki, allowing you to reference it later. Think of it as creating a new container for knowledge within your AI agent ecosystem.

## Function addTriageNavigation

This function lets you set up a special tool for your AI agents, allowing them to request help from a dedicated triage agent when they get stuck or need further assistance. It essentially creates a pathway for agents to escalate issues. You provide some configuration details, and the function takes care of registering the navigation tool within the swarm orchestration framework. Think of it as building a "help" button for your AI agents.

## Function addTool

This function lets you add new tools that your AI agents can use. Think of it as equipping your agents with new abilities. When you add a tool this way, the entire swarm system recognizes it and makes it available for agents to use. The tool’s information, like its name and how it works, needs to be defined when you register it. This ensures that the agents have the right instructions on how to utilize the tool effectively.

## Function addSwarm

This function lets you create a new swarm, essentially setting up a dedicated space for managing client sessions and orchestrating agent interactions. Think of it as defining a blueprint for how your agents will work together on a specific task or workflow. Once you've created a swarm using this function, the system will recognize and use it for client sessions. The process is isolated to ensure a clean start, and you'll get the swarm’s name back to confirm it's been successfully registered. You'll provide a schema describing the swarm’s properties like its name and default agent.

## Function addStorage

This function lets you add new ways for your AI agents to store and retrieve information, like connecting to a database or file system. Think of it as registering a new tool for your agents to use for saving and loading data. Only storage methods added through this function will be recognized by the system. If the storage is designed to be shared among agents, this function also sets up the connection to that shared storage. It ensures a clean and independent setup process and reports the name of the newly registered storage.


## Function addState

This function lets you define and register new states within the swarm system. Think of it as telling the swarm about a new type of data it can use or manage. Only states you register this way are recognized, and if they're designated as shared, the system sets up the necessary connections to handle them. The registration happens in a controlled environment, ensuring a clean process, and you're given the state's name as confirmation that it’s been added. You'll need to provide a schema that details the state's properties, name, and whether it's shared.

## Function addPolicy

This function lets you define and register rules, or policies, that guide the actions of agents within the system. It essentially sets up the framework to understand and enforce those rules. 

When you add a policy, it's registered with services that handle both validating the policy as it’s being used and managing its underlying structure. Everything happens within a controlled environment, ensuring proper logging and context management. 

Think of it as building the foundation for how agents will operate, working in conjunction with actions like sending messages to ensure they adhere to established guidelines. The schema you provide describes the policy, including its name and configuration.

## Function addPipeline

This function lets you define and register new workflows, or "pipelines," for your AI agent swarm. Think of it as adding a new recipe to a system that manages how your agents work together. You provide a structured definition of the pipeline – outlining the steps and data flow – and the system checks that it's valid before adding it to its collection. The function returns a unique identifier for the newly registered pipeline, allowing you to reference it later.

## Function addOutline

This function lets you define and register a new outline schema within the AI agent swarm system. Think of an outline schema as a blueprint for how your agents will structure their work.  It’s how you tell the system what kind of tasks and organization you want the agents to follow. When you add an outline, the system validates it and makes it available for use. The process is carefully managed to prevent any conflicts with other ongoing operations and the system records the addition if logging is turned on. You provide the outline schema itself as input, which details the outline's name and how it's configured.

## Function addMCP

This function lets you add a new Model Context Protocol (MCP) schema to the orchestration framework. Think of an MCP schema as a blueprint for how an AI agent will interact with and understand its environment. By providing a schema to this function, you're essentially telling the system about a new type of interaction, allowing agents to operate in a specific, well-defined way. The function returns a unique identifier for the registered MCP schema.

## Function addEmbedding

This function lets you add a new tool for generating embeddings – think of it as teaching the system how to understand and represent data as numbers. By providing a description of the new embedding tool, you’re essentially registering it with the swarm so it can be used for tasks like finding similar pieces of information or creating vector representations of data. Only embeddings added through this function are recognized by the system. The process is designed to run independently, ensuring a clean setup each time. You'll receive the name of the newly added embedding tool as confirmation.

## Function addCompute

This function lets you define and register new types of computations your AI agent swarm can perform. Think of it as adding a new tool to your agents' toolbox. You provide a description of how the computation works – its schema – and the function ensures it’s valid before making it available for your agents to use. The function returns a unique identifier for the newly registered computation, allowing you to reference it later.

## Function addCompletion

This function lets you add new ways for your AI agents to generate text, like connecting them to different language models. Think of it as adding a new tool to your agents' toolbox. You provide a description of the new tool – its name and how it works – and the system registers it so your agents can start using it. This ensures everything is set up correctly and avoids conflicts with existing systems. Upon successful addition, you’ll receive the name of the newly registered completion method. You'll need to provide a schema that details the configuration and name of the completion engine you're adding.

## Function addAgentNavigation

This function lets you set up a way for one AI agent to "navigate" to another within your swarm. Think of it as creating a connection or pathway between agents, allowing them to interact or coordinate more directly. You provide configuration details, and the function establishes this navigation tool, returning a unique identifier for it. This helps manage and track the relationships between agents in your orchestrated system.

## Function addAgent

This function lets you register a new agent within the system, essentially adding it to the list of available workers. Think of it as officially introducing the agent so the swarm knows it exists and can use it. Only agents added this way can participate in the swarm’s tasks. It makes sure the agent's configuration is validated and stored correctly. Successfully registering an agent will give you its name back.

# agent-swarm-kit classes

## Class WikiValidationService

This service helps ensure that wikis adhere to defined structures. It allows you to register different wikis, each with its own set of rules, and then check if a given piece of content conforms to that wiki's expected format. You can think of it as a gatekeeper for your wiki content, making sure everything fits the plan. The service manages a record of all registered wikis and uses this information to perform validation checks. You can add new wikis with specific schemas and then validate content against them to maintain consistency.

## Class WikiSchemaService

The `WikiSchemaService` helps manage and validate the structure of your wiki information. Think of it as a central place to store and ensure consistency in how your wiki schemas are defined.

It uses a logger to keep track of what's happening and relies on a schema context service to handle schema-related operations. The service allows you to register new wiki schemas, update existing ones, and easily retrieve them using unique keys.  Essentially, it's designed to keep your wiki schemas organized and reliable.

## Class ToolValidationService

This service helps ensure that the tools used by your AI agents are properly configured and unique within the swarm. It keeps track of all registered tools and their details, making sure everything is consistent. When a new tool is added, this service logs the action and verifies it hasn't been registered before. When an agent tries to use a tool, this service quickly checks if that tool is actually registered, which speeds up the overall process and prevents errors. It works closely with other parts of the system to manage tool registration, agent validation, and logging, making sure the entire process is reliable and efficient.

## Class ToolSchemaService

The ToolSchemaService acts as a central place to manage and keep track of the tools that agents use within the system. It's like a library of pre-defined actions agents can perform. 

When a new tool is added or an existing one is updated, this service makes sure it's properly set up and valid.  It works closely with other services, ensuring that agents have the tools they need and that those tools are used correctly. 

The service keeps a record of each tool, including how it should be executed and what data it requires. It also provides a way to look up specific tools by name, making it easy to integrate them into agents.  Think of it as the blueprint for what agents can do – ensuring everyone's on the same page.

## Class ToolAbortController

This class helps you manage how to stop tasks that take time, like calling an AI tool. It acts as a container for an `AbortController`, which is a standard way to signal that an operation should be cancelled. 

Essentially, it gives you a simple way to trigger a "stop" signal. If the environment doesn’t support the standard `AbortController`, this class will gracefully handle that situation and won't break. 

The `abort` method is the main way to use it – calling it sends a signal to stop whatever ongoing task is connected to this controller.

## Class SwarmValidationService

The SwarmValidationService is responsible for ensuring the configuration of your AI agent swarms is correct and consistent. It keeps track of all registered swarms and their settings, making sure each swarm has a unique name, a valid list of agents, appropriate default agents, and properly defined policies. 

Think of it as a central authority that confirms everything is set up correctly before a swarm can operate. It works closely with other services to manage agent and policy validation, track swarm registrations, and log important events. To speed things up, it remembers the results of previous validation checks, so it doesn’t have to repeat those checks unnecessarily.

You can use it to add new swarms, retrieve lists of agents or policies associated with a specific swarm, and, most importantly, to validate the entire configuration of a swarm to make sure it's ready to go. This service helps guarantee the overall health and reliability of your AI agent system.

## Class SwarmSchemaService

The SwarmSchemaService acts as a central hub for managing the blueprints, or schemas, that define how your AI agent swarms are structured and operate. Think of it as a librarian for swarm configurations, keeping track of all the details like which agents are involved, what their roles are, and what rules they follow.

It ensures these configurations are consistent and valid before they’re used, using a basic check to make sure everything is in the right format. This service is crucial for setting up your swarms properly, working hand-in-hand with other services to manage connections, policies, and overall swarm behavior.  It keeps a record of swarm configurations, allowing for dynamic updates and providing access to these configurations when needed.  You can register new configurations, retrieve existing ones, and even update them, all while keeping a log of changes for monitoring and troubleshooting.

## Class SwarmPublicService

This class provides a public interface for interacting with a swarm of AI agents. It essentially acts as a middleman, handling requests from clients and passing them on to the underlying swarm system while keeping track of what's happening and logging important events.

Think of it as a control panel for your swarm. It provides functions to manage the swarm's state, such as checking if it's busy, canceling operations, and retrieving information about the current agent. It also allows you to send messages to the swarm, adjust agent assignments, and ultimately shut down the swarm when it’s no longer needed.

The class is designed to be aware of the client and swarm involved in each operation, ensuring proper context and enabling detailed logging for debugging and performance tracking.  It relies on other services for core functionality, logging, and session management, creating a structured and maintainable system for swarm interaction.

## Class SwarmMetaService

This class helps manage and visualize the structure of your AI agent swarms. It takes information about the swarm – like its agents and their relationships – and organizes it into a tree-like structure. Then, it converts that structure into a standard UML diagram format, making it easy to understand and document the swarm's architecture.

It relies on other services to pull in swarm data, create agent descriptions, and handle logging. The class provides a way to build these swarm trees and then translate them into diagrams, particularly useful for creating documentation and debugging complex agent systems. Essentially, it's like taking a sprawling network of agents and turning it into a clear, visual map.

## Class SwarmConnectionService

This service manages how different agents work together within a swarm system. Think of it as the central hub that connects agents, handles their operations, and keeps track of their status. It's designed to be efficient by remembering previously used configurations, making things run smoother. 

Here's a breakdown of what it does:

*   **Connection Management:** It establishes and maintains connections to swarms, making sure agents can communicate.
*   **Agent Coordination:** It provides agents with the information and resources they need to perform tasks.
*   **Operation Control:** It allows you to emit messages, pop the navigation stack, check and adjust the swarm's busy state, and cancel or wait for agent output.
*   **Efficiency:** It avoids unnecessary setup by caching frequently used swarm configurations.
*   **Tracking:** It provides ways to track active agents and their names.
*   **Cleanup:**  It ensures proper disposal of swarm connections when they are no longer needed.



Essentially, this service simplifies working with groups of agents, handling the technical details so you can focus on the overall workflow.

## Class StorageValidationService

This service helps ensure that the storage configurations used by your AI agent swarm are set up correctly. It keeps track of all registered storage locations, making sure each one is unique and has a valid embedding setup. When a new storage location is added, this service verifies its configuration. To speed things up, it remembers the results of previous validation checks. It works closely with other services to manage storage registration, perform operations, validate agent storages, and log any issues encountered.

## Class StorageUtils

This class provides tools for managing how data is stored and accessed for individual clients and agents within the system. It handles interactions with the overall storage system, ensuring that agents are authorized to use specific storage areas.

The `take` method lets you retrieve a limited set of data based on a search query, specifying which client, agent, and storage area you’re interested in. 

`upsert` provides a way to add new data or update existing data in storage, again tied to a specific client, agent, and storage name.

If you need to remove data, the `remove` method lets you delete an item by its unique identifier for a client and agent.

The `get` method is for retrieving a single item from storage, identified by its ID and linked to a client and agent.

To see all the data in a storage area, use the `list` method, which can also filter the results based on certain conditions.

`createNumericIndex` automatically assigns a numerical identifier to the data in a storage area, which is useful for organization.

Finally, `clear` completely empties a storage area for a specified client and agent.

## Class StorageSchemaService

The StorageSchemaService acts as a central place to manage how your AI agents store and retrieve data. Think of it as a catalog of storage blueprints, ensuring that each storage setup is correctly configured and ready to be used. It keeps track of these blueprints, using a special registry to organize them.

This service works closely with other parts of the system, including those that handle storage connections, embedding data, agent definitions, and public storage access. When changes are made, the service keeps a log of what’s happening (if logging is enabled).

You can register new storage blueprints, update existing ones, or simply look up a blueprint by name. This helps ensure consistency and reliability when your agents are interacting with storage. This service makes sure storage configurations are valid before they're used, so your agents have a reliable place to work.

## Class StoragePublicService

This service manages storage operations specifically for individual clients within the swarm system. It's designed to keep client-specific data separate from system-wide storage, which is handled by a different service. Think of it as a way to ensure each client has their own private storage space.

It relies on other services for logging, connection management, and context scoping, ensuring consistent behavior and detailed tracking of storage actions.

Here's a breakdown of what you can do with it:

*   **Retrieve data:**  Search for and get lists of items from a client's storage.
*   **Add or update data:**  Store new data or modify existing data for a specific client.
*   **Delete data:** Remove items from a client's storage.
*   **Get a single item:** Fetch a specific item by its ID.
*   **List all items:** Retrieve all items in a client’s storage, optionally filtering them.
*   **Clear the entire storage:** Remove all items from a client's storage.
*   **Clean up resources:** Dispose of the storage for a client, releasing any associated resources.



Essentially, this service provides a controlled and client-scoped way to interact with storage within the swarm environment.

## Class StorageConnectionService

This service manages how your application interacts with storage, providing a unified way to access and manipulate data. It’s designed to handle both private storage specific to a client and shared storage accessible across different parts of your system. It’s smart about reusing storage connections to improve performance.

Think of it as a central hub for your application's data operations, coordinating with other services like logging, event handling, and schema management. It also keeps track of storage usage and helps ensure that resources are cleaned up properly.

When you need to retrieve, create, update, or delete data, this service handles the low-level details of connecting to the appropriate storage and executing the operation. It even leverages caching to avoid unnecessary connections and speed things up.




It provides methods like `getStorage` to retrieve data, `take` for retrieving a list of items, `upsert` for inserting or updating items, and `dispose` for cleaning up resources. It ensures that everything is handled consistently and efficiently.

## Class StateValidationService

This class, StateValidationService, is responsible for ensuring that the data your AI agents are working with is in the expected format. Think of it as a quality control system for your agents’ state. 

You can add different data structures, called states, to the service, each with its own defined structure or schema.  Then, when an agent provides data, this service will check if it conforms to the defined schema. 

The `addState` method lets you define these expected data structures, and the `validate` method performs the actual checks against those definitions. It uses a `loggerService` internally to help you track any validation issues. The `_stateMap` property manages the states that have been added.

## Class StateUtils

The `StateUtils` class helps manage the data associated with individual clients and agents within the swarm. It provides easy ways to retrieve, update, and reset specific pieces of information linked to a client, agent, and state name. You can think of it as a helper for keeping track of what each agent knows and how that information changes over time. 

To get data, use the `getState` method, providing the client ID, agent name, and the name of the state you're interested in. To change data, the `setState` method allows you to either provide a new value directly or use a function to calculate it based on the existing data. Finally, `clearState` lets you reset a piece of data back to its starting point. The class handles behind-the-scenes checks to ensure everything is valid and creates logs for tracking.

## Class StateSchemaService

The StateSchemaService acts as a central hub for managing the blueprints of how agents store and retrieve data within the system. Think of it as a librarian, organizing and making available different data structures (schemas) that agents use.

It validates these schemas to make sure they're structurally sound before making them accessible. This ensures the agents are using consistent and reliable data formats. 

The service relies on a registry, similar to a database, to store and retrieve these schemas. It also logs its activities for troubleshooting and monitoring, if logging is enabled.

Essentially, this service provides the foundation for defining how agents interact with data, ensuring everything runs smoothly and predictably. It’s used by several other core services to manage client-specific and shared data configurations. You can register new schema types, update existing ones, or simply look up a schema by name to get the information needed for data handling.

## Class StatePublicService

This class manages state specifically tied to individual clients within the swarm system. Think of it as a way to keep track of data that belongs to a single user or application, rather than shared data.

It's designed to work closely with other parts of the system like ClientAgent, PerfService, and DocService, enabling features like updating client-specific data, tracking performance metrics per client, and documenting state schemas. 

You can use it to set, clear, retrieve, and release client-specific state, all while keeping track of what's happening through logging. It’s important to note that this is distinct from managing system-wide state or persistent data storage.

Here’s a quick rundown of what it offers:

*   **`setState`**: Updates a client's state using a provided function.
*   **`clearState`**: Resets a client's state to its initial value.
*   **`getState`**: Retrieves the current state of a client.
*   **`dispose`**: Releases resources associated with a client’s state.

These methods are all wrapped with context scoping and logging to ensure everything is tracked properly.

## Class StateConnectionService

This service manages how different parts of the system interact with and store state information. Think of it as a central hub for handling state changes and making sure they're done correctly and efficiently.

It intelligently reuses state instances to avoid unnecessary overhead, and it prioritizes thread safety when updating state. It keeps track of which states are shared across the system, delegating those to a separate service for management.

Dependencies are injected to allow for flexible configuration and integration with other services for logging, event handling, schema management, and usage tracking.

Key features include:

*   **State Retrieval:**  `getStateRef` gets or creates state instances, smartly caching them for reuse.
*   **State Updates:** `setState` allows for controlled state modifications, ensuring changes are handled safely.
*   **State Reset:** `clearState` provides a way to reset the state to its initial condition.
*   **State Access:** `getState` simply retrieves the current state.
*   **Resource Cleanup:** `dispose` releases resources associated with the state, but only for client-specific states – shared states are handled separately.



It's designed to work closely with different components, including client agents, the public API, and internal services, making sure everything stays consistent and performant.

## Class SharedStorageUtils

This class provides helpful tools for managing shared storage across your agent swarm. It lets you retrieve data based on searches, insert or update items, remove specific items by ID, and list all items – with the option to filter that list. You can also completely clear a storage area. Each of these operations is handled securely and reliably, verifying storage names to prevent issues and tracking activity for debugging.

## Class SharedStoragePublicService

This class manages how different parts of the system interact with shared storage – think of it as a public-facing gateway for accessing and modifying data. It handles common operations like retrieving, updating, deleting, listing, and clearing items from shared storage, ensuring that these actions are logged and properly scoped.

It relies on other services – a logger for recording activity, and a core storage connection service for the actual storage operations. Different components, like ClientAgent and PerfService, use this class to perform storage-related tasks in a controlled and documented way.

Here's a breakdown of what you can do with this class:

*   **Get data:** Retrieve a list of items based on a search or retrieve a specific item by its ID.
*   **Add/Update data:** Add a new item or update an existing one in the storage.
*   **Delete data:** Remove a specific item from storage.
*   **List all items:** Get a list of all items in a storage, potentially filtered by specific criteria.
*   **Clear storage:** Remove all items from a particular storage.

The class ensures that logging is enabled when configured and that operations are performed with proper context, making it easier to understand and debug storage interactions across the system.

## Class SharedStorageConnectionService

The `SharedStorageConnectionService` manages how different parts of the system share storage. Think of it as a central hub for shared data. It ensures that all clients accessing a specific storage name are actually using the same storage instance, which prevents data inconsistencies.

It's built to be efficient, caching these shared storage connections to avoid creating new ones every time they’re needed. It gets information about the storage from other services to configure it correctly, and it keeps track of events happening within the storage.

Here's a breakdown of what it does:

*   **Provides a single shared storage connection:** When a part of the system needs to access shared data (like for execution or data persistence), this service makes sure everyone is using the same connection.
*   **Retrieves and manages storage data:**  It handles tasks like searching for data (`take`), adding or updating data (`upsert`), deleting data (`remove`), and listing data (`list`).
*   **Handles configurations:**  It uses other services to understand how the storage should behave, including embedding logic for similarity searches.
*   **Logging and Event Handling**: Logs operations and propagates events, ensuring visibility and reactivity.
*   **Provides a clear interface**: Allows clearing the entire storage when needed.

## Class SharedStateUtils

This class provides easy-to-use tools for your agents to share information within the swarm. It helps manage shared data, allowing agents to read, update, and reset specific pieces of information.

To get a value, you can call `getState` providing the name of the state you are interested in. When you need to update a shared piece of data, use `setState`. This function lets you either directly set a new value or provide a function that calculates the new value based on the old one. Finally, `clearState` lets you reset a piece of shared data back to its starting point. All these functions handle logging and communicate with the central shared state service for the swarm.

## Class SharedStatePublicService

This class helps manage shared information across different parts of the system, like agents working together. It provides a straightforward way to update, reset, and retrieve this shared data, ensuring everyone's on the same page. Think of it as a central hub for shared knowledge.

It works hand-in-hand with other system components, handling the actual state updates and providing a public interface for interacting with the shared data.  You can use it to change the shared state, clear it back to its starting point, or simply check what the current state is. The class also keeps track of these operations through logging, making it easier to understand what's happening.

## Class SharedStateConnectionService

This service manages shared data accessible by all agents in your swarm. Think of it as a central whiteboard where different agents can read and update information, but always under a consistent identity ("shared"). It's designed to be efficient, reusing existing data whenever possible and ensuring updates happen safely, even when multiple agents are trying to change things at once.

It works closely with other parts of the system: agent execution, client-specific state management, a public API for shared state, and a performance tracking system. It’s configured using schemas and can optionally save state changes persistently.

Here's a breakdown of what you can do with this service:

*   **`getStateRef`**: This is your main way to access the shared state. It fetches or creates a shared data instance for a specific name. It’s smart – it remembers which data instances it’s already created, so you don’t create unnecessary copies.
*   **`setState`**: Allows you to update the shared state. It uses a function to transform the previous state, ensuring updates are controlled and predictable.
*   **`clearState`**: Resets the shared state back to its original, initial value.
*   **`getState`**: Simply retrieves the current value of the shared state.



The service uses logging to keep track of what’s happening and utilizes a bus to distribute state-related events. It’s also designed to work seamlessly with method contexts to ensure that state updates are correctly associated with the code that initiated them.

## Class SharedComputeUtils

This class, `SharedComputeUtils`, provides tools to manage and retrieve information about shared computational resources. Think of it as a helper for interacting with a system where multiple AI agents share computing power. 

The `update` function lets you refresh the status of a specific compute resource, ensuring you have the latest information.  You can use `getComputeData` to fetch details about a particular compute resource; it's flexible because it can return data in whatever format you specify. This allows agents to easily check and adapt to the available resources.

## Class SharedComputePublicService

This component manages access to shared computing resources for your AI agents. It acts as a central hub, allowing agents to request and utilize computing power on demand. 

Think of it as a facilitator: it handles the communication and coordination between your agents and the underlying compute infrastructure. You can use it to retrieve information about available compute resources, initiate calculations, and update the state of those resources. The `loggerService` property lets you monitor what's happening, and `sharedComputeConnectionService` handles the technical details of connecting to the compute environment. 

The `getComputeData` function lets you query information about a specific computation. `calculate` triggers a computation to be performed. Finally, `update` modifies the configuration or status of a particular compute resource.

## Class SharedComputeConnectionService

This class, `SharedComputeConnectionService`, helps manage connections to and interactions with shared computing resources within the agent swarm. It acts as a central point for accessing and updating data residing in these shared compute environments.

Inside, it relies on services for logging, messaging, managing method contexts, handling shared state, and defining compute schemas. The `getComputeRef` function is used to obtain references to specific compute resources, allowing for interaction. `getComputeData` retrieves data from the shared compute environment, while `calculate` triggers calculations based on defined states. Finally, `update` allows for refreshing the data and ensuring consistency across the swarm.

## Class SessionValidationService

This service is responsible for tracking and verifying sessions within the agent swarm system. It essentially keeps tabs on which sessions are active and what resources (like agents, storage, and states) they're using. 

It works closely with other services to manage session creation, agent activity, and resource usage, making sure everything stays consistent and reliable. 

The service uses logging to record important actions and uses a technique called memoization to speed up validation checks, making the system more efficient. 

Think of it as a central registry that makes sure each session is properly associated with its swarm and resources, and it has tools to add and remove these associations as needed. It also provides ways to check if a session is still valid and retrieve information about its connected resources.

## Class SessionPublicService

This class acts as the main entry point for interacting with a session in the swarm system. It handles messaging, code execution, and other actions within a specific session, ensuring proper context and logging along the way. Think of it as a layer on top of the core session management, providing a more user-friendly and controlled way to work with individual sessions.

It uses various other services to manage different aspects like logging, performance tracking, validation and event handling. It includes methods for sending messages, executing code, committing different types of messages (user, assistant, system), controlling tool execution, and properly cleaning up resources when a session is finished. This class aims to provide a consistent and reliable way for different components of the system to communicate with and manage sessions.


## Class SessionConnectionService

This service manages connections and operations within a swarm system, essentially acting as a central hub for individual sessions. It intelligently reuses session data to improve performance, and integrates with various other services to handle everything from logging and event handling to policy enforcement and swarm configurations. When a client needs to interact with the swarm, this service creates or reuses a session, coordinating all the necessary components to ensure a consistent and efficient experience. Think of it as the backstage manager for each conversation happening within the AI agent swarm.



It handles incoming messages, executes commands, and keeps track of session history, all while ensuring that communication flows smoothly and securely. By caching session data, it reduces overhead and improves responsiveness, making it a crucial component of the overall swarm orchestration framework.

## Class SchemaUtils

This class helps manage how data is stored and formatted within client sessions. It provides easy ways to save information to a client’s memory, retrieve it later, and convert complex data into readable strings. You can use it to securely store data specific to each client and prepare that data for communication or logging. The serialization feature lets you transform data into a consistent, easily understandable format, with options to customize how keys and values are handled.

## Class RoundRobin

This component, RoundRobin, is designed to distribute work evenly among a set of available options. Think of it as a rotating selector – it cycles through a list of “tokens” which represent different ways to create instances. 

You provide a list of these tokens and a "factory" function that knows how to build something based on each token. RoundRobin then manages the rotation, ensuring that each option gets a turn.

The `create` method is your entry point; it sets up the RoundRobin with your tokens and factory function, giving you a function you can use to request instances. Each time you call this function, it picks the next token in the list and uses the factory to create an instance. 






## Class PolicyValidationService

This service is responsible for making sure the policies used by your AI agent swarm are valid and unique. It keeps track of all registered policies and their details, working closely with other services to handle policy registration, enforcement, and agent validation. 

It uses a logging system to record its actions and uses a smart caching technique to speed up the validation process. 

You can register new policies using the `addPolicy` function, which ensures that each policy has a unique name. The `validate` function then checks if a policy exists before it's used, improving the overall reliability of your swarm system.

## Class PolicyUtils

This class provides helpful tools for managing client bans within your AI agent swarm's policies. Think of it as a helper for controlling access and ensuring compliance.

It offers three key functions: banning a client, unbanning a client, and checking if a client is currently banned. Each function carefully verifies the information you provide—like the client's ID, swarm name, and policy—before taking action. This ensures accuracy and provides a reliable way to control client access within your swarm environment.

## Class PolicySchemaService

The PolicySchemaService manages and provides access to policy definitions used throughout the swarm system. Think of it as a central library for rules that control what agents can do and who can access what.

It ensures these policies are valid by performing basic checks when they's added or updated.  The service keeps track of these policies using a registry, making it easy to find the right rules when they're needed.

Several other components rely on this service: PolicyConnectionService uses it to enforce rules, ClientAgent and SessionConnectionService leverage it during agent execution and session handling, and PolicyPublicService exposes policies through an API.

The service also keeps a record of its actions through logging, which can be enabled or disabled via configuration. It's a crucial piece for defining and applying policy logic within the swarm.



You can register new policies, update existing ones, and retrieve them as needed, ensuring consistency across the system.

## Class PolicyPublicService

This service manages how policies are applied within the swarm system. It acts as a central point for checking if a client is banned, retrieving ban messages, validating data (both incoming and outgoing), and actually banning or unbanning clients.

It relies on other services like a logger for recording activity, a policy connection service for the core policy logic, and services for performance, client agents, documentation, and swarm metadata to function correctly. Logging is enabled based on a global configuration setting.

Here’s a breakdown of the main actions you can perform:

*   **Check if a client is banned:** Determines if a client is restricted from a swarm based on a specific policy.
*   **Get the reason for a ban:** Retrieves the message explaining why a client is banned.
*   **Validate data:**  Ensures incoming or outgoing data conforms to the rules defined in a policy.
*   **Ban a client:** Restricts a client’s access to a swarm based on a policy.
*   **Unban a client:**  Removes restrictions, allowing a client access again.

## Class PolicyConnectionService

This class, `PolicyConnectionService`, acts as a central hub for managing policy enforcement across the swarm system. It’s responsible for fetching and reusing policy configurations to control client behavior, and it interacts with other services like logging, event handling, and configuration management.

Think of it as a policy engine that makes sure clients are following the rules. It fetches pre-defined policies, caches them for efficiency, and provides methods for checking ban statuses, validating inputs and outputs, and managing bans themselves. These methods are designed to be consistent with how other services – like those handling client interactions, sessions, or public policy – handle these functions.

The service relies on several other components: a logger for tracking actions, an event bus for broadcasting changes, and services for retrieving policy configurations and accessing execution context. The core of its efficiency comes from caching policy data to avoid repetitive lookups. It supports consistent behavior across various parts of the system, including client interaction, session management, and public API access.

## Class PipelineValidationService

This service helps ensure your AI agent workflows, or pipelines, are set up correctly before they run. It keeps track of the expected structure of each pipeline and checks if the actual code matches that structure. 

You can add pipeline definitions to this service, essentially registering the blueprints for your AI agent workflows.  Then, when you're ready to run a pipeline, the service can validate it, catching potential errors early on and preventing failures during execution. Think of it as a quality check for your AI agent workflows. 

The `addPipeline` method lets you register a new pipeline with its expected schema. The `validate` method then performs the actual check against the registered schema.  The `loggerService` property is used internally for logging messages, and `_pipelineMap` holds the registered pipelines.

## Class PipelineSchemaService

The PipelineSchemaService helps manage and organize blueprints for your AI agent swarm workflows. It acts as a central place to store, retrieve, and update these blueprints, ensuring consistency across your system.

Think of it as a library for your agent workflows, allowing you to register new workflow templates, easily find existing ones, and even update them with changes. 

The service relies on a schema context service to handle all the underlying schema-related operations, and it keeps track of everything it manages in a registry. You can register new blueprints, retrieve existing ones by name, or even update a blueprint with partial changes using the override function.

## Class PersistSwarmUtils

This class helps manage how information about active agents and navigation history is saved and retrieved for your AI agent swarms. It lets you keep track of which agent a client is currently using, and the sequence of agents they've interacted with.

You can think of it as a central place to store and access this information, and it's designed to be flexible. It provides methods for getting and setting active agents and navigation stacks, associating them with both a specific client and a swarm.

Importantly, it's built to be efficient by reusing persistence instances for each swarm, and you can even customize how this data is stored using adapters. This allows you to plug in different storage mechanisms, like using in-memory storage or alternative backends, to fit your specific needs.

## Class PersistStorageUtils

This class helps manage how data is saved and retrieved for each user and storage area within the system. It's like a librarian, making sure each piece of information has a place and can be found again later. 

You can think of it as a way to store things like user preferences, logs, or any other data associated with a specific user session. The `getData` method lets you pull information from storage, and if it’s not already there, you can provide a default value. `setData` is used to save data, ensuring it's persisted for later use. 

The system optimizes resource usage by making sure that each storage area is only created once, preventing unnecessary duplication. You also have the flexibility to customize how the storage works by providing your own storage creation logic using `usePersistStorageAdapter`, allowing for more advanced options like using a database.

## Class PersistStateUtils

This utility class helps manage how information is saved and loaded for each client within the system. It allows you to store data related to a specific client (identified by a `SessionId`) under a descriptive name (`StateName`), like agent variables or context. You can retrieve this saved data later to restore the client's state.

The system remembers the persistence method used for each `StateName`, so it doesn't create new persistence instances unnecessarily. You can even customize how the data is stored, swapping out the default persistence method with your own implementation if needed, allowing for options like storing data in memory or using a database. This class streamlines the process of saving and loading information, ensuring a consistent experience for each client.

## Class PersistPolicyUtils

This class helps manage how policy information, specifically lists of banned clients, is stored and retrieved within the swarm system. It provides simple ways to get and set these banned client lists for a particular policy and swarm name. The system remembers the persistence settings so it doesn’t have to recreate them every time, which helps with efficiency.  You can even customize how the data is stored, swapping out the standard persistence method with your own, allowing for things like keeping policy data in memory or a database.

## Class PersistMemoryUtils

This class helps manage how memory is saved and retrieved for each client interacting with the swarm system. Think of it as a way to remember things about a specific conversation or session. It uses a factory to create memory storage, making sure each client gets its own dedicated space.

You can save data for a client using `setMemory`, which persists it for later use, and retrieve that data with `getMemory`, falling back to a default if nothing's saved.  When a client's session is over, you can clean things up with `dispose`. 

For greater control, `usePersistMemoryAdapter` lets you plug in your own custom way of storing memory, like using a database instead of an in-memory solution.

## Class PersistEmbeddingUtils

This utility class helps manage where and how embedding data is stored within the swarm system. It provides tools to read and write embedding vectors, allowing for flexible storage options. The class uses a system of adapters to handle the actual persistence, meaning you can customize how embeddings are saved (like in memory, a database, or a custom file system).

The `getEmbeddingStorage` function cleverly ensures that you're only using one storage instance for each type of embedding data, which helps conserve resources. When you need an embedding, `readEmbeddingCache` checks if it’s already stored; if not, `writeEmbeddingCache` saves it so you don't have to recompute it later.

You can also customize the underlying storage mechanism by using `usePersistEmbeddingAdapter` to specify your own constructor for embedding data persistence. This gives you fine-grained control over tracking and storage.

## Class PersistAliveUtils

This class helps keep track of whether clients (identified by a SessionId) are online or offline within a specific swarm. It lets you mark a client as online or offline, and then later check their status. Think of it as a simple heartbeat system for your agents.

It uses a clever system to ensure that each client only has one persistence instance, which is efficient. You can even customize how the alive status is stored – for example, using an in-memory solution or connecting to a database – if the default approach isn't suitable. The class allows you to register your custom persistence constructor to change the default persistence behavior.

## Class PerfService

The `PerfService` is responsible for keeping track of how your AI agent swarms are performing. It monitors things like how long tasks take, how much data is being sent, and the overall state of client sessions.

Think of it as a performance dashboard for your agent system – it collects data during execution, aggregates it, and makes it available for analysis or reporting.

It uses several other services for retrieving information about sessions, agents, and policies, and relies on logging for debugging.  You're likely to find its methods useful when you need to measure performance or understand how your agents are behaving.

Key functions include starting and ending execution tracking, calculating metrics like average response time, and serializing performance data into easy-to-understand records. This service helps you identify bottlenecks, optimize agent behavior, and generally understand how well your swarm is operating.


## Class OutlineValidationService

The OutlineValidationService helps ensure that the structures used to guide AI agents (called outlines) are set up correctly within the system. It keeps track of registered outlines, verifies they exist before use, and helps prevent duplicate definitions. 

It uses a logging system to record its actions and utilizes a method called memoization to speed up checks by remembering previous validation results. It also relies on other services for managing completion schemas and validating their configurations, ensuring outlines are complete and functional. This service essentially acts as a gatekeeper, confirming the validity of outlines before they're used by the agent swarm.


## Class OutlineSchemaService

The OutlineSchemaService helps manage the structure and rules for different outlines used by your AI agents. Think of it as a central place to define and update those outlines. It lets you register new outline structures, update existing ones with changes, and easily retrieve them when needed. The service keeps track of these outlines, ensuring they're properly validated and accessible to the agent swarm. It uses logging to record what's happening and relies on other services for managing contexts and logging information.

## Class OperatorInstance

This class represents a single instance of an operator within your AI agent swarm orchestration framework. Think of it as a specific agent actively participating in a task. 

When you create an `OperatorInstance`, you're giving it a unique identifier (`clientId`) and a name (`agentName`) to recognize it.  You can also provide optional callback functions to customize its behavior.

The `connectAnswer` method allows you to set up a way to receive answers from this agent.  The `notify` method is used to send information to the agent.  The `answer` method lets you transmit a response back through the system.  `recieveMessage` handles incoming messages meant for this specific agent. Finally, `dispose` gracefully shuts down and cleans up this instance when it’s no longer needed.

## Class NavigationValidationService

This service helps manage how agents move around within the swarm, making sure they don’t waste time revisiting the same spots. It keeps track of where agents have already been, creating a navigation route for each client and swarm combination. The service uses a technique called memoization to remember these routes, so they don't need to be recalculated every time. 

You can inject a logging service to help with debugging and monitoring navigation events. There’s a way to clear out the current navigation route for a particular client and swarm if needed, and you can also remove the entire route when it's no longer needed. The `shouldNavigate` function is the key to determining whether an agent should move to a new location, preventing unnecessary trips.

## Class NavigationSchemaService

The NavigationSchemaService helps keep track of which navigation tools are being used within the agent swarm. It maintains a record of tool names, allowing the system to know which tools are active. 

You register a tool's name using the `register` method, and the service will log this action if logging is enabled.  The `hasTool` method lets you quickly check if a specific navigation tool is registered, also with optional logging. Essentially, it's a simple management system for knowing what navigation tools are participating.

## Class MemorySchemaService

This service manages temporary, in-memory data associated with specific sessions within the swarm system. Think of it as a simple scratchpad for each session, allowing agents to store and retrieve information without persistence. It’s designed to be lightweight and easy to use, offering basic read, write, and cleanup operations for session-specific data.

It uses a straightforward key-value store (a Map) where the key is the session ID, and the value is any object you want to store. This data isn’s saved permanently – it exists only for the duration of the session.

You can log these operations to track what’s happening, and it works closely with other services like the session management and agent services.  It’s not responsible for validating data or storing it long term; that’s handled by other, more specialized services. Essentially, it provides a way for individual agents to have a bit of temporary, session-specific memory.


## Class MCPValidationService

This class helps keep track of and check the structure of Model Context Protocols, or MCPs. Think of it as a librarian for your MCP definitions. It stores these definitions internally and provides simple ways to add new ones and make sure they are set up correctly. You can add new MCPs with a name and their schema, and then use the validation method to confirm an MCP exists and is properly defined. It also uses a logger to keep track of what's happening during these operations.

## Class MCPUtils

This class, MCPUtils, helps manage updates to the tools used by clients connected through the Multi-Client Protocol (MCP) system. Think of it as a tool updater for your AI agent swarm. You can use it to push new tools to all your clients at once, or target a specific client for a focused update. This makes sure everyone’s working with the latest version of the software they need. The `update` method is the main way to do this, letting you specify which clients should receive the new tools.

## Class MCPSchemaService

The MCPSchemaService helps manage the structure and definitions (schemas) used by agents in the swarm. Think of it as a central place to store and update the blueprints for how agents communicate and share information. 

It allows you to register new schema definitions, modify existing ones, and easily look them up by name. This service uses a logging system to keep track of changes and relies on a schema context service to handle more complex operations related to schemas. Internally, it keeps track of all registered schemas in a registry, allowing for quick access and modification.

## Class MCPPublicService

This class provides a way to interact with the Model Context Protocol (MCP) for managing AI agents. It allows you to list available tools for a particular agent, update those tool lists, and check if a specific tool is available. You can also use this class to actually call those tools, providing data and receiving output. It’s designed to handle operations within a defined context, making it a central hub for controlling and monitoring your agents' capabilities. The system relies on injected services for logging and handling the underlying MCP communication.

## Class MCPConnectionService

The MCPConnectionService manages how your AI agents connect to and use different models, acting as a central hub for interactions. It handles tasks like finding available tools (functions or APIs) for each agent and executing them. 

It relies on other services for logging, communication, and understanding the context of model interactions. The `getMCP` function ensures each agent has a connection to the correct model, efficiently reusing connections when possible. When an agent is finished, the `dispose` method cleans up resources and releases those connections.

You can use this service to find out what tools are available to an agent, refresh the list of tools, check if a specific tool exists, and most importantly, call tools to get work done, providing input data and receiving results.

## Class LoggerService

The LoggerService is responsible for handling different types of logs – normal, debug, and informational – within the AI agent swarm system. It ensures that these logs are sent to both a general system logger and to a client-specific logger, allowing for both overall system monitoring and client-specific troubleshooting. 

The service automatically adds details about the method and execution context to the logs, making it easier to trace issues back to their source. You can easily swap out the general system logger at runtime if needed, which is useful for testing or customizing logging behavior. The level of detail logged (debug, info) is controlled by global configuration settings. It relies on other services to provide context, like the method and execution environments.

## Class LoggerInstance

The `LoggerInstance` helps manage logging specifically for each client interacting with the system. It allows you to customize how messages are logged, including what gets sent to the console and what callbacks are triggered.

You create a `LoggerInstance` by providing a unique client identifier and optionally some custom callbacks to handle logging events. It ensures that certain initialization steps are only performed once. 

You can use methods like `log`, `debug`, `info`, and `dispose` to record events, handle debugging information, and properly shut down the logger, respectively. Console output is controlled centrally, and the `dispose` method allows for synchronous cleanup when you're finished with the logger.

## Class HistoryPublicService

This service manages how information about agent interactions is stored and accessed. Think of it as the central place to view and manage the history of what agents have done.

It’s designed to work closely with other parts of the system, like the agent itself, the public agent service, and the performance tracking tools.  It keeps a record of interactions, allowing you to view a history of what's happened.

Here’s a breakdown of what you can do:

*   **Add to History (push):** Record new messages or events related to an agent's actions, tied to a specific client and method.
*   **Retrieve from History (pop):** Get the most recent entry from an agent's history.
*   **Get History as a List (toArrayForAgent):**  Convert the agent's history into a structured list, often including a prompt to provide context.
*   **Get Raw History List (toArrayForRaw):** Get the agent's history as a simple list of items.
*   **Clean Up History (dispose):** Clear the agent's history, releasing resources.

The service keeps detailed logs of these operations if logging is enabled, ensuring transparency and allowing for debugging. It uses other services to handle the core history operations and add context to the interactions.

## Class HistoryPersistInstance

This component is responsible for keeping a record of messages, ensuring they're saved both in memory and on disk. It’s designed to work with a specific client ID and can be configured with various callback functions to handle events like message additions, removals, and disposal.

The component initializes when needed, loading any previously saved data. You can loop through the messages in the history, optionally applying filters during the process. Adding new messages is straightforward, with the component automatically saving them.  It also allows you to remove the most recent message, and when the agent is finished, it can be cleaned up completely, either for a specific agent or globally.

## Class HistoryMemoryInstance

This component provides a simple way to keep track of a conversation's history within an agent’s memory, storing it directly in the application's memory without saving it to a database or external storage. Each instance is tied to a specific client ID to distinguish different agents.

To get started, you create an instance providing a client identifier and optional callback functions to handle events like adding, removing, or clearing messages.

You can then add messages to the history using the `push` method.  The `iterate` method lets you step through the history one message at a time, and you can retrieve the most recent message with `pop`. When you’re finished with a history instance, the `dispose` method clears its contents. An initialization step using `waitForInit` ensures the history is properly set up for each agent.

## Class HistoryConnectionService

This service manages the history of interactions with agents within the system. It's designed to be efficient, reusing history data whenever possible. Think of it as a central record-keeper for each agent’s conversation.

It relies on several other services for logging, event handling, and tracking usage, making sure everything is coordinated. It intelligently caches history data to avoid redundant work.

Here’s what you can do with it:

*   **Retrieve Existing or Create New History:**  It can fetch the history for a specific client and agent, or create a new history record if one doesn’t already exist.
*   **Add Messages:** You can push new messages to the agent’s history.
*   **Retrieve Messages:**  It allows you to retrieve the most recent message from the agent’s history.
*   **Format History for Agents:**  You can convert the history into a format suitable for an agent to use, including a starting prompt.
*   **Get Raw History:** It provides a way to get the history data in its raw form, useful for analysis or reporting.
*   **Clean Up Resources:** When you’re finished, the service cleans up any resources associated with the history, making sure everything is tidied up efficiently.

## Class ExecutionValidationService

The ExecutionValidationService helps manage and track how many times an action is being executed within a system, particularly within groups of agents working together. It keeps a record of these executions for each client and swarm to prevent issues caused by too many nested actions.

You can retrieve the current execution count for a client and swarm, increment the count when an action starts, and decrement it when an action finishes.  If things get out of hand, you can also clear the tracked executions for a client and swarm, or completely remove the tracked information from memory. This service is designed to help maintain order and prevent problems in complex, agent-driven workflows.

## Class EmbeddingValidationService

This service keeps track of all the embedding names used within the system and makes sure they're valid. Think of it as a registry for embeddings, ensuring each name is unique and actually exists. 

It works closely with other parts of the framework – the service that registers embeddings, the storage used for similarity searches, and the agent validation processes.  

You can add new embeddings to this registry, and the service will check if an embedding name is valid whenever it's needed, like when performing searches. This process is optimized for speed by remembering the results of previous checks. The service also logs its actions, which can be controlled through system settings.

## Class EmbeddingSchemaService

The EmbeddingSchemaService acts as a central manager for defining and organizing the embedding logic used throughout the swarm system. Think of it as a library where you store instructions on how to generate and compare embeddings – numerical representations of data used for things like finding similar items.

It ensures these instructions, called "embedding schemas," are valid before they're used, and keeps track of them efficiently. This service works closely with other components, like the storage system and agent execution environment, providing them with the necessary embedding logic for tasks such as similarity searches and data processing.

You can register new embedding schemas, update existing ones, or simply retrieve them when needed, and the service logs these actions to help with monitoring and debugging. Essentially, it's responsible for ensuring the consistent and reliable use of embedding logic across the entire swarm.

## Class DocService

The `DocService` class is responsible for creating documentation for your AI agent system, including swarms, agents, and their performance metrics. Think of it as a documentation generator that takes all the details about your system – agent schemas, policies, performance data – and turns them into easily understandable Markdown files and JSON reports.

It’s designed to keep things organized, using a structured directory system and a thread pool to handle documentation generation efficiently.  It integrates with various other services to gather the necessary information, and it’s configurable to log its activities and enable detailed documentation.

**Here’s a breakdown of what it does:**

*   **Generates Documentation:** Creates Markdown files for swarms (overall structures of agents) and individual agents, detailing their configurations, prompts, tools, and more.
*   **Performance Reporting:** Produces JSON files that capture system-wide and client-specific performance data, useful for monitoring and debugging.
*   **Visual Representations:** Generates UML diagrams to visually represent agent and swarm structures.
*   **Organized Output:**  Creates a directory structure (like `docs/chat`) to store the generated documentation in a logical way.
*   **Dependency Injection:** Relies on other services (like logging and validation services) for its functionality, making it flexible and testable.

Essentially, the `DocService` helps you understand, maintain, and share the details of your AI agent system by providing a comprehensive and structured documentation process.

## Class ComputeValidationService

This class, ComputeValidationService, helps manage and validate data used by different agents in your swarm. It's responsible for ensuring that each agent receives information in the expected format.

Think of it as a central hub for verifying data structures – it holds configurations and performs checks.

You can add new data validation rules using `addCompute`, which registers a specific format for a task.  `getComputeList` lets you see which validation rules are currently active.  The core function, `validate`, performs the actual check of incoming data against a registered format, ensuring everything is correct before it’s passed on to the agents. It relies on other services like logging and state validation to function properly.

## Class ComputeUtils

This class, ComputeUtils, helps manage and retrieve information about computational resources used by your AI agent swarm. It provides a straightforward way to update the status of a specific compute resource, identifying it by a client ID and a compute name. You can also request data from a compute resource, and it will return the data in a format you specify – essentially, it allows you to query the compute resources and get back exactly what you need. Think of it as a central place to check on and interact with the resources powering your agents.

## Class ComputeSchemaService

The `ComputeSchemaService` helps manage and organize different schema definitions used by your AI agent swarm. It’s like a central library where you can store, update, and retrieve schema blueprints. 

It relies on a schema context service to handle schema-related tasks and uses a logger for tracking activity. You can register new schema definitions, update existing ones, or simply fetch a specific schema when you need it. Think of it as a way to keep your agent swarm working consistently by ensuring everyone is using the correct schema structures. The `register` method adds a new schema, `override` lets you modify an existing one, and `get` retrieves a specific schema.

## Class ComputePublicService

This class, ComputePublicService, provides a way to interact with compute resources. It handles connections and data retrieval for various compute tasks.

It relies on a logger service for tracking activity and a compute connection service to manage the underlying connections.

You can use `getComputeData` to fetch information about a specific compute resource, identified by its name, client ID, and method name.

The `calculate` method performs a calculation using the specified compute resource and associated parameters. 

The `update` method allows you to refresh the state of a compute resource.

Finally, `dispose` gracefully shuts down and releases a compute resource when it’s no longer needed.


## Class ComputeConnectionService

The ComputeConnectionService manages connections and data retrieval for computational tasks within the agent swarm. It relies on several internal services, including logging, messaging, context handling, schema validation, session management, state connection, and shared computation management.

You can use the `getComputeRef` method to obtain references to specific computational units, and `getComputeData` to fetch the associated data.  The `calculate` method triggers a computational process based on a provided state name, while `update` handles data refreshes. Finally, `dispose` ensures proper cleanup when the service is no longer needed.

## Class CompletionValidationService

This service helps keep track of all the valid completion names used within the AI agent swarm. It’s like a gatekeeper, making sure only registered names are used and preventing duplicates.

The service relies on a logger to record its actions and uses a special technique called memoization to speed up the validation process. It works closely with other services – registration, agent validation, and client agents – to ensure everything runs smoothly.

You can add new completion names to the service’s registry, and when you need to verify a completion name, the `validate` function quickly checks if it's approved and logs the activity. This helps keep the swarm organized and prevents errors.

## Class CompletionSchemaService

The CompletionSchemaService acts as a central hub for managing the logic that agents use to complete tasks. Think of it as a library of pre-built functions, where each function is a "completion" and has a unique name.

This service makes sure those functions are valid before agents can use them. It keeps track of them using a registry and lets other parts of the system (like the agent creation and execution processes) easily access them.

It works closely with other services to ensure everything is running smoothly: agent schemas define which completions are needed, client agents actually use the completions to do work, and the connection services handle agent setup and execution.

You can register new completion functions, update existing ones, and retrieve them whenever they’re needed. The service keeps a log of these actions for debugging purposes. This whole system ensures that agents have the correct and validated logic at their disposal, contributing to the overall reliability of the agent swarm.

## Class ClientSwarm

This class, `ClientSwarm`, manages a group of AI agents working together. Think of it as a conductor for an orchestra of agents, coordinating their actions and handling their output. It's designed to make sure agents switch tasks smoothly, wait for results in an orderly fashion, and remember the order in which they're used.

The `ClientSwarm` keeps track of which agent is currently active and manages a "navigation stack" – a history of which agents have been used. It communicates with other parts of the system to create the swarm, run agents, and share events.  It uses notifications to let other parts of the application know when an agent's reference changes.

You can check if the swarm is busy (like waiting for an agent to finish a task) using `getCheckBusy` or `getBusy`. The `emit` function allows the swarm to send messages to other parts of the system. The `waitForOutput` method handles waiting for the output of an agent.  `cancelOutput` provides a way to stop a wait operation. The `getAgent` method retrieves the current AI agent.

Finally, the `dispose` method is used to properly clean up resources when the swarm is no longer needed.


## Class ClientStorage

This class manages how data is stored and retrieved within the swarm system, using a combination of fast in-memory storage and embedding-based searching. Think of it as a central hub for data, letting different parts of the system – like agents and tools – access and modify information.

It handles storing data (upserting), deleting data (removing), and clearing everything out (clearing).  When you need to search for similar items, it uses embeddings to find relevant results.

The class works behind the scenes, queuing up operations to ensure things happen in the right order and safely. It also keeps track of embeddings to optimize search performance and automatically updates them when data changes.

Here's a breakdown of key functions:

*   **Storing and Updating:** `upsert` adds or updates an item.
*   **Deleting:** `remove` deletes an item based on its ID.
*   **Clearing:** `clear` removes all items.
*   **Searching:** `take` finds similar items based on a search term.
*   **Retrieving:** `get` quickly retrieves a specific item.
*   **Listing:** `list` retrieves all items or a filtered subset.
*   **Initialization:** `waitForInit` handles initial data loading.
*   **Cleanup:** `dispose` cleans up resources when the storage is no longer needed.



Essentially, this class is a flexible and efficient way to manage data within the AI agent swarm, enabling powerful search and data management capabilities.

## Class ClientState

The ClientState class is the central hub for managing the state of an agent within a swarm system. It's designed to handle changes to the state safely and efficiently, ensuring that multiple parts of the system, like agents and tools, can interact with it without causing conflicts.

Think of it as a container for your agent’s data, and a set of rules for how that data can be read and written. When the state changes, it automatically notifies other interested components through events.

You can use it to initialize the agent's data, retrieve the current state, or reset it to a default configuration. The `waitForInit` method ensures the state is properly loaded when the agent starts, and the `dispose` method cleans up resources when the agent is finished. The `setState` and `clearState` methods provide controlled ways to modify the state, handling persistence and notifications.

## Class ClientSession

This class, `ClientSession`, manages a single client's interactions within the overall swarm system. Think of it as a dedicated workspace for a user. It handles everything from sending messages to agents, validating those messages, and tracking the session's history.

When a new client starts interacting with the swarm, a `ClientSession` is created. It keeps track of the client's messages, how they're executed by the AI agents, and any events that occur.

You can use methods like `execute` to send a message to the agent and receive a response.  `run` is similar but doesn’t emit the result, making it good for quick, stateless actions.

Beyond basic message handling, you can also commit messages to the session's history—these are recorded actions that can inform future interactions. This includes things like recording tool requests, system updates, or even messages intended for developers.

The `connect` method allows the session to communicate with external systems, enabling real-time interaction. Finally, `dispose` cleans up the session when it's no longer needed. Overall, the `ClientSession` acts as a central hub for managing a single client's experience in the agent swarm.

## Class ClientPolicy

The `ClientPolicy` class manages how clients interact with the AI agent swarm, ensuring security and compliance. Think of it as a gatekeeper for your swarm. It handles things like banning clients, checking messages to make sure they’re valid, and providing feedback when things go wrong.

It keeps track of banned clients, loading that list only when it's actually needed to avoid unnecessary loading. You can configure it to automatically ban clients if they violate the rules, and it can send out notifications when bans or unbans happen.

This class works closely with other parts of the system, getting instructions from the `SwarmConnectionService`, validating messages using the `ClientAgent`, and communicating important events through the `BusService`. It provides both input and output validation to protect the system from malicious or incorrect data. If a client sends or receives an invalid message, the policy can automatically ban them and give them a message explaining why.

## Class ClientOperator

The `ClientOperator` manages interactions with an agent swarm. It's essentially a bridge that allows you to send instructions and receive responses from the agents.

You initialize it with some configuration parameters. It provides methods for sending various types of messages – user inputs, assistant outputs, developer notes, and tool requests – to the agent swarm.  You can also use it to wait for a response, commit changes, and ultimately clean up resources when you're finished. 

Keep in mind that some of the methods, like `run`, `commitToolOutput`, `commitSystemMessage`, `commitAssistantMessage`, `commitFlush`, and `commitCancelOutput`, are currently marked as "not supported," meaning they don't yet have active functionality. The `commitStopTools` method also has the same label.

## Class ClientMCP

The ClientMCP class helps manage tools and their operations from the client-side. Think of it as a central hub for accessing and using tools.

You can use it to find out which tools are available to a particular client, and even check if a specific tool exists for that client.  It keeps a cached list of tools to avoid unnecessary lookups, but allows you to refresh this list whenever needed.

When you want to actually use a tool, the `callTool` method lets you execute it and retrieve the results.  Finally, when a client is no longer needed, you can use `dispose` to clean up resources and clear the cached tools.

## Class ClientHistory

The ClientHistory class manages an agent's message history within the swarm system. It stores, retrieves, and filters messages, and provides methods for adding new messages, retrieving the most recent one, and generating message arrays specifically for the agent's use in creating completions.

The history is filtered based on a condition defined in the global configuration to ensure that the agent only receives relevant messages.  It uses a `push` method to add messages and emits events as they are added. You can retrieve the last message with `pop` to undo actions, or get all messages as a raw array using `toArrayForRaw`. 

For creating completions, `toArrayForAgent` is used. This method formats the history, includes initial prompt and system messages, and ensures consistency in tool call outputs. When the agent is no longer needed, the `dispose` method cleans up the history and releases any associated resources.

## Class ClientCompute

The `ClientCompute` class is responsible for managing and interacting with a compute resource within your AI agent swarm orchestration. It's designed to handle the lifecycle of a compute unit, from initialization to cleanup. 

When creating a `ClientCompute` instance, you’re providing it with configuration details that dictate how it connects to and operates on the compute resource. 

The `getComputeData` method retrieves information about the compute resource's current state, giving you insight into its operation. The `calculate` method initiates a computation process on the compute unit, driven by a specific state. `update` allows for refreshing the compute's configuration or data. Finally, `dispose` gracefully shuts down and releases resources associated with the compute unit when it's no longer needed.

## Class ClientAgent

This class, `ClientAgent`, is the core of how client-side agents operate within the swarm system. Think of it as the brain of an agent, responsible for handling incoming messages, deciding what to do with them, and interacting with other services.

It manages everything from executing instructions and triggering tool calls to keeping track of the agent’s history and responding to events. The agent carefully queues its actions to avoid conflicts and overlaps.

Several internal mechanisms help manage this complexity. It uses signals to manage changes to the agent’s state, handle errors, and track tool stops.

Here's a breakdown of its key functions:

*   **Message Handling:** It receives messages, decides whether to use tools, and generates responses.
*   **Tool Management:**  It resolves available tools, making sure there are no duplicates.
*   **Error Recovery:** If something goes wrong, it tries to recover, flushing or recompleting the model as needed.
*   **Communication:** It sends messages to other parts of the system, like the swarm itself, and keeps track of the agent's history.
*   **Cleanup:** It can be safely shut down, releasing any resources it’s using.

The agent relies heavily on other services to function, such as those for managing connections, tracking history, and handling tool schemas. The use of signals helps coordinate these interactions and maintain a consistent state across the entire system.

## Class ChatUtils

This component manages chat sessions for various clients, acting as a central hub for coordinating communication within your AI agent swarm. It handles creating, sending messages to, and cleaning up chat instances on demand.

The framework allows you to specify how chat instances are created and what happens when a session is complete, providing flexibility in how your agents interact. You can start a new chat session for a client, send messages through it, and then properly shut down the session when it's no longer needed. The framework also provides a way to listen for events related to disposing of chat instances, allowing you to react to session endings. It's designed to make it easy to control and orchestrate conversations happening within your agent swarm.

You can configure the framework with different chat instance constructors and callbacks to tailor its behavior to your specific needs.

## Class ChatInstance

The `ChatInstance` class manages a single chat session within a swarm of AI agents. It's given a unique identifier (`clientId`) and the name of the swarm it belongs to. When the chat is no longer needed, you can tell it to clean up resources by calling `dispose`.

The class keeps track of when the chat was last active and offers a method, `checkLastActivity`, to see if it’s still within an acceptable timeframe. To actually start a conversation, use the `beginChat` method.  You can then send messages using `sendMessage`, which returns the AI agent’s response.

If you want to be notified when a chat session is being closed, `listenDispose` allows you to register a function that will be called with the client ID of the disposed chat.

## Class BusService

The `BusService` is the central hub for event-driven communication within the agent swarm. Think of it as a message broker, allowing different parts of the system to talk to each other in a structured way.

It manages subscriptions, meaning it keeps track of who wants to receive which types of messages. When something happens, like an agent starting or finishing a task, the `BusService` makes sure the right people get notified.

It's designed to be efficient, reusing connection pathways to avoid unnecessary overhead.  It integrates closely with other services like the logger, session manager, and performance tracker, providing a unified and observable communication layer.

You can subscribe to specific events using `subscribe` or `once` (for single-time notifications).  The `emit` function is how you send out messages.  There are also shortcuts like `commitExecutionBegin` and `commitExecutionEnd` for common execution-related events. Finally, `dispose` cleans up subscriptions when a client is done, ensuring a tidy system.  It supports broadcasting to everyone or only specific clients, and can even handle system-wide announcements using wildcards.

## Class AliveService

The `AliveService` helps keep track of which clients are actively participating in your AI agent swarms. It allows you to easily signal when a client becomes online or offline within a particular swarm. This service uses a logger to record these status changes and, depending on your configuration, stores this information persistently so you can retrieve it later. You can use the `markOnline` method to indicate a client is available and `markOffline` to signal they are no longer participating.

## Class AgentValidationService

This service acts as a central hub for ensuring all agents within the swarm are properly configured and interact correctly. It manages agent schemas, validates their settings, and keeps track of related resources like storage and dependencies. 

Think of it as a quality control system for your AI agents.

Here's a breakdown of what it does:

*   **Registration:** It lets you register new agents and their configurations.
*   **Validation:** It checks if agents are set up correctly – verifying completion, tools, and storage.
*   **Resource Tracking:** It provides lists of resources (storage, states, wikis, mcp) associated with each agent.
*   **Dependency Management:** It keeps track of how agents depend on each other.
*   **Performance:** It uses techniques to make checks fast and efficient.

The service relies on other specialized services for specific validation tasks like checking tool configurations or validating storage. It also logs its actions to aid in troubleshooting.

## Class AgentSchemaService

The AgentSchemaService acts as a central library for defining and managing the blueprints for your AI agents within the system. Think of it as a place to store all the details about what an agent *is* – its name, what it needs to do, the tools it uses, and how it interacts with other agents.

This service ensures your agents are properly set up by validating their configurations before they're used. It keeps track of these agent definitions using a registry, allowing other parts of the system to easily find and use them.

Here’s a breakdown of what you can do with it:

*   **Define Agent Blueprints:** You can register new agent schemas, essentially creating the instructions for how an agent should behave.
*   **Update Existing Agents:** Modify existing agent configurations to adjust their behavior without rebuilding everything.
*   **Retrieve Agent Details:** Easily get the specific configuration details for any agent when needed.
*   **Ensure Data Integrity:** The service performs a basic check to confirm the agent's configuration is reasonable before it's put into action.
*   **Logging:**  It keeps a record of changes and retrievals, which can be helpful for debugging and understanding how your agents are being used (controlled by a system setting).



This service works closely with other components like the agent connection and swarm connection services, as well as the client agent and agent meta service, ensuring a consistent and well-managed AI agent environment.

## Class AgentPublicService

This service acts as the main entry point for interacting with agents within the swarm system, providing a simplified and controlled interface. It handles common agent operations like creating agents, running commands, committing messages, and disposing of agents.

Think of it as a helpful assistant that makes sure all interactions with the agents are logged and properly managed. It relies on other services for specific tasks, like logging, agent connections, and performance tracking, making sure everything runs smoothly and consistently. 

It offers methods to run commands (`execute`, `run`), manage messages (`commitToolOutput`, `commitSystemMessage`), and control agent behavior (`commitStopTools`, `dispose`).  Each method ensures operations are logged and tied to specific contexts, which aids in debugging and performance analysis. Essentially, it's the central hub for all public interactions with the agents, ensuring a standardized and trackable process.


## Class AgentMetaService

The AgentMetaService helps manage and visualize information about agents within the swarm system. It takes agent definitions and transforms them into a UML format, making it easier to understand the relationships and structure of the agents. Think of it as a translator that converts complex agent data into clear diagrams.

It creates detailed representations of agents, including all their dependencies and components, and also simpler versions focusing on just how agents connect to each other. The service uses logging to track its operations and relies on other services to retrieve agent definitions and generate the final UML diagrams. This helps with documentation, debugging, and generally understanding how the agents work together.

## Class AgentConnectionService

This service acts as a central hub for managing AI agents within a swarm system. Think of it as a factory and manager for agents, ensuring they're created efficiently and handled consistently. It smartly reuses previously created agents to save resources, and it integrates with many other services to track usage, store history, and configure agents correctly. Logging is enabled based on configuration, and it works closely with services related to agent configurations, session validation, and data storage.



It provides several key functions:



*   **Agent Creation & Reuse:**  It efficiently creates and reuses AI agents based on client and agent names, avoiding unnecessary overhead.
*   **Execution Control:** It offers methods for running commands, executing code, and waiting for results from agents, mirroring core functionality found elsewhere.
*   **History Management:** It diligently records actions within agents, including user messages, tool requests, and system prompts.
*   **Resource Cleanup:** When finished, it properly releases resources associated with an agent and clears out any cached data.



Essentially, it's the glue that holds the agent system together, ensuring agents are created, executed, and cleaned up in a standardized and controlled manner.

## Class AdapterUtils

This class provides convenient ways to connect your AI agent swarm to different AI models. It essentially acts as an adapter, letting you easily use models from providers like Hugging Face, Cortex, Grok, Cohere, OpenAI, LMStudio, and Ollama without needing to write custom connection code each time.

Each function within this class, such as `fromHf`, `fromCortex`, and `fromOpenAI`, generates a specific function you can use to make requests to that provider’s chat completion API. You’ll typically pass in the necessary API client or configuration details for each provider when using these functions. The `model` parameter allows you to specify which particular AI model you want to use from that provider.

# agent-swarm-kit interfaces

## Interface TAbortSignal

This interface lets you signal when something should be stopped, like canceling a long-running task. It builds on the standard web way of doing this, so you're using familiar concepts. Think of it as a way to tell a process "Hey, don't do this anymore!" and it’s flexible enough for you to add your own extra features if you need to.

## Interface IWikiSchema

This interface, `IWikiSchema`, defines the structure for a wiki knowledge base used within the AI agent swarm. It holds key details like a descriptive name for the wiki and its unique identifier.  You can also provide optional callback functions to customize how the wiki interacts with the system.  The core functionality includes a `getChat` method, which is used to retrieve responses based on provided arguments – essentially, it's how agents query the wiki for information.

## Interface IWikiCallbacks

This API reference describes the `IWikiCallbacks` interface, which lets you listen in on what’s happening with the AI agent swarm as it interacts with a wiki.  Specifically, you can define an `onChat` function that gets called whenever the agents are actively chatting or communicating related to wiki content. This provides a way to monitor or react to the ongoing conversations within the swarm.

## Interface ITriageNavigationParams

This interface defines the information needed to set up how an AI agent navigates through different tasks during a triage process. It lets you specify the name, a clear description, and even an optional note to help document the tool being created. Think of it as a blueprint for defining a particular action an agent can take within the overall workflow. You’re essentially describing what the tool does and how it fits into the bigger picture.

## Interface IToolRequest

This interface describes what's needed to ask the swarm system to run a specific tool. Think of it as a standardized way for an agent or model to say, "Hey, I want to use the 'search' tool, and here's the query I want it to use."

It has two main parts: the `toolName`, which specifies exactly which tool should be run, and `params`, which provides any information the tool needs to do its job, like a search query or a file name. The parameters you provide should match what the tool expects, based on its defined structure.

## Interface IToolCall

This interface describes a request to use a tool within the system, like telling an agent to run a specific function. Each tool call has a unique ID to keep track of it. Right now, the system only supports calling functions as tools, but it's designed to potentially handle other types of tools in the future. The tool call includes details about the function being called, such as its name and the arguments it needs.

## Interface ITool

ITool describes a tool that can be used by the AI agent swarm. Think of it as a blueprint for a function the AI can call. It includes the tool's type, which is currently just "function," and most importantly, the details of that function - its name, what it does, and what kind of information it expects as input. This information is crucial for the AI to understand what the tool can do and how to use it correctly when deciding which tool to call.

## Interface ISwarmSessionCallbacks

This interface defines a set of optional notification functions that you can use to monitor and react to events happening within an AI agent swarm session. Think of them as hooks to get updates about what's going on.

You can subscribe to callbacks like `onConnect` to know when a new agent joins the swarm, or `onExecute` to track command execution.  `onEmit` lets you see messages being sent, while `onInit` and `onDispose` provide information about session setup and teardown. These notifications help you build tools for observing, debugging, or integrating with the swarm's activity.

## Interface ISwarmSchema

The `ISwarmSchema` defines the blueprint for creating and configuring a swarm of AI agents. It lets you specify things like whether the swarm should remember its progress by saving data, and provides a description for documentation. You can also set rules (policies) to control agent access and behavior.

This schema allows you to customize how the swarm navigates and manages its agents. You can provide functions to load and save navigation history, and to determine which agent is currently active. 

It also includes a list of available agents, a default agent to use when none is specified, and lets you add custom functions that will run at specific points in the swarm’s lifecycle, like when it starts up or changes direction. Essentially, it’s the central configuration for creating and controlling your AI agent swarm.

## Interface ISwarmParams

This interface defines the information needed to set up a swarm of AI agents. It includes things like a unique client ID to identify who's starting the swarm, a logger to track what’s happening and any problems, and a communication bus for agents to talk to each other. Crucially, it also provides a way to register the individual agents that will be part of the swarm, allowing the system to manage and interact with them during runtime. Think of it as the blueprint for bringing a swarm to life.

## Interface ISwarmDI

This interface acts as a central hub, providing access to all the core components needed to run and manage an AI agent swarm. Think of it as a toolkit containing services for everything from logging and performance monitoring to agent connection management and schema validation. It's the foundation upon which the entire swarm system is built, providing a structured way to interact with its various functionalities. Each property represents a specific service that contributes to the overall operation and health of the swarm, allowing for flexible and organized interactions with different aspects of the system. Effectively, this interface brings together all the essential building blocks for a robust and manageable AI agent swarm.

## Interface ISwarmConnectionService

This interface outlines the public-facing methods for connecting and managing agents within the swarm. It’s designed to be a blueprint for how external systems can interact with the swarm's communication layer, specifically focusing on the core functionalities like establishing connections and handling agent interactions. Think of it as a clear contract defining what functionalities are exposed to the outside world, while keeping the internal workings separate. It helps ensure the swarm’s public interface remains consistent and predictable.

## Interface ISwarmCallbacks

This interface lets you tap into important events happening within your AI agent swarm. Specifically, you're notified whenever an agent's role or assignment changes. This allows your system to update displays, track agent activity, or make adjustments based on these changes within the swarm. You’re given the agent’s ID, its name, and the name of the swarm it belongs to when this event occurs.

## Interface ISwarm

This interface lets you interact with a group of AI agents working together. You can use it to find out which agent is currently active, get its name, and even retrieve the agent's instance directly. It allows you to control the flow of work, like canceling an ongoing operation or checking if the swarm is currently busy with something. You can also send messages to the session and manage the agent's navigation stack, reverting to a default if needed. Finally, you can register or update references to individual agents within the swarm.

## Interface IStorageSchema

This interface describes how storage is configured within the agent swarm. It dictates how data is handled, whether it's saved permanently, and how it’s accessed.

You can control whether the storage persists data to a hard drive, add a description for documentation, and even specify if the storage is shared among all agents serving a particular client.

Custom retrieval and persistence of data can be implemented by providing your own functions.  The interface also allows you to define an embedding mechanism for indexing your data, a unique name for the storage itself, and configure lifecycle callbacks for custom behavior. Finally, you can define a way to create indexes for each item stored, which is crucial for searching and finding information within the storage.

## Interface IStorageParams

This interface defines how the system manages data storage, especially embeddings used for AI agents. It’s a set of rules and functions that tell the framework where and how to save and retrieve information, like the numerical representations of text.

Each storage instance is linked to a specific client, and the interface provides tools for calculating similarity between embeddings, creating them, and checking if they’re already stored. It also includes features for caching embeddings to speed up processing and communication tools for logging activity and sharing information across the entire AI agent swarm. Think of it as the blueprint for a dedicated data repository for the AI agents to share and learn from.

## Interface IStorageData

This interface describes the basic information held within the system's storage. Every item saved will have a unique `id`, which acts like its name and is essential for finding and deleting it later. Think of it as the primary key for each piece of data.

## Interface IStorageConnectionService

This interface outlines how different parts of the system connect to storage, like databases or file systems. It’s designed to be a blueprint for creating reliable storage connections, making sure the public-facing parts of the system work consistently and safely. Think of it as a clear agreement on how to interact with storage, hiding the complex internal details.

## Interface IStorageCallbacks

This interface lets you listen for important events related to your storage system, like when data is changed, searched for, or when the storage itself is being set up or taken down. You can use these callbacks to keep track of what’s happening with your data, log changes, or perform any necessary cleanup tasks when the storage is no longer needed. Specifically, you'll get notified when data is updated, when a search is performed, during initialization, and when the storage is being disposed. This allows you to build custom logic around these lifecycle stages.

## Interface IStorage

This interface lets your AI agents access and manage a shared memory space. You can use it to pull out specific pieces of information by searching for related content – like finding the most relevant notes for a task. 

It also enables agents to save new information or update existing entries, ensuring everyone has the latest data.  If an agent needs to discard information, it can remove items by their unique ID. You can also fetch a specific item directly using its ID, or retrieve a list of all stored items, potentially filtering them based on certain conditions. Finally, there's a way to completely wipe the shared memory and start fresh.

## Interface IStateSchema

This interface defines how states are managed within the agent swarm. Think of a state as a piece of shared information that agents can use and modify. 

You can control whether this state is saved permanently, add a description for clarity, and determine if it can be accessed by multiple agents. 

The `getDefaultState` function lets you set up the initial value of the state.  You can also provide `getState` and `setState` functions to customize how the state is retrieved and updated.  Finally, you can add middleware to process the state and configure callbacks to react to state changes.

## Interface IStateParams

This interface defines the information needed to manage the state of an AI agent within the swarm. It includes details like a unique identifier for the client using the state, a logger to keep track of what’s happening, and a communication channel, known as a bus, to allow agents to talk to each other. Think of it as a way to give each agent its own workspace and a way to share information with the rest of the team.

## Interface IStateMiddleware

This interface defines a way to intercept and potentially adjust the data being used by your AI agent swarm. Think of it as a checkpoint where you can examine or tweak the current state before it’s used for planning or execution. It lets you add extra logic to ensure your state is always in a consistent and valid form, helping to keep your swarm operating smoothly. You can use it to add checks, transformations, or even enrichment of the state data.

## Interface IStateConnectionService

This interface helps us define how different parts of the AI agent swarm orchestration framework interact with the system's state. Think of it as a blueprint, making sure the public-facing parts of the state management system are well-defined and consistent. It's specifically designed to exclude any internal details, focusing on the essential connections and operations that other components need to know about. This helps keep things organized and prevents accidental interference with the system's inner workings.

## Interface IStateChangeContract

This interface defines how agents in the swarm communicate state changes to each other. Specifically, it provides a way to signal when the state of something – like a task or a resource – has been updated.  The `stateChanged` property is the core of this communication; it's a special mechanism that allows agents to broadcast these state updates using a string to represent the new state. Think of it as a notification system for agents to keep each other informed about what's happening within the swarm.

## Interface IStateCallbacks

This interface defines functions you can use to be notified about important moments in a state's lifecycle. Think of these as hooks that let you react to what’s happening with your data.

You’re given a chance to run code when a state is first created (`onInit`), when it’s being cleaned up (`onDispose`), and when it’s first loaded into memory (`onLoad`).

Also, you can observe when the state's data is read from storage (`onRead`) or modified and saved (`onWrite`), allowing you to track changes or log activity. These callbacks help you keep tabs on how your data is being used and managed.

## Interface IState

This interface helps you manage the ongoing data for your AI agents. It allows you to peek at the current state, update it by providing a function that calculates the new state based on the old one, and reset everything back to the original starting point. Think of it as a central place to keep track of what's happening and make controlled changes to the shared information across your agent swarm. Getting the current state is simple, updating it involves a function to handle the changes safely, and clearing it brings everything back to the beginning.

## Interface ISharedStorageConnectionService

This interface helps define how different parts of the system interact with shared storage. It's a blueprint for creating a service that connects to a shared storage space, but it leaves out the internal details that aren't meant to be used directly by other components. This ensures that the public-facing service only exposes the functionalities intended for external use, keeping things organized and secure.

## Interface ISharedStateConnectionService

This interface helps define how different parts of the system share information. Think of it as a blueprint for connecting to a shared space where agents can exchange data. It’s designed to be a specific type of connection service, carefully crafted to only expose what's needed for external use, keeping the internal workings separate. This helps keep the public-facing features consistent and predictable.

## Interface ISharedComputeConnectionService

This interface defines how your AI agents can connect to and utilize shared computing resources. Think of it as the bridge allowing agents to access things like powerful processors or specialized hardware. It provides methods for establishing connections, checking their status, and potentially disconnecting when agents are done. The service aims to enable efficient resource utilization across your swarm, preventing individual agents from needing their own dedicated infrastructure. By implementing this interface, you're creating a way for agents to dynamically request and release computing power as needed.

## Interface ISessionSchema

This interface, called `ISessionSchema`, is a blueprint for how session data might be structured in the future. Right now, it doesn't contain any specific properties—think of it as an empty canvas. It’s there to hold session-related configuration details as the framework develops, so we can define exactly what information each session will track and how it will be formatted.

## Interface ISessionParams

This interface outlines the essential information needed to start a new session within your AI agent swarm orchestration framework. Think of it as a blueprint for setting up a session – it gathers key pieces like a unique client identifier, a way to log activities, rules and constraints for the session, a communication channel for the agents, and a reference to the overall swarm managing everything. It also keeps track of the specific name assigned to the swarm the session is operating within, ensuring everything is properly connected.

## Interface ISessionContext

The `ISessionContext` interface holds all the essential details about an active session within the agent swarm. It bundles information like the unique identifier of the client initiating the session, a process ID for tracking, and details about the specific method being executed (if applicable). You'll also find context related to the current execution within the swarm system. Think of it as a central record for understanding what’s happening during a session. 

It provides a structured way to access information about a client’s request, the task being performed, and the overall system state during that interaction.

## Interface ISessionConnectionService

This interface helps us clearly define how different parts of the system interact when managing connections between agents. Think of it as a blueprint for creating connection services, ensuring they focus on the features meant for outside use. It's designed to strip away any internal details, so the public-facing parts of the system remain consistent and easy to understand. Essentially, it's a way to standardize how connections are handled in a predictable and reliable way.

## Interface ISessionConfig

This interface, `ISessionConfig`, lets you control how often your AI agents run or how quickly they execute tasks. You can use the `delay` property to set a waiting period between sessions, ensuring your agents don't overwhelm resources.  The `onDispose` property lets you define a function that gets called when the session is finished, allowing you to clean up any lingering resources or perform final actions. Essentially, it's a way to schedule and manage the lifecycle of your agent sessions.

## Interface ISession

The `ISession` interface defines how to interact with a conversation or workflow managed by the AI agent swarm. It provides methods for sending messages, controlling the agent's actions, and managing the session’s state.

You can add user input to the session's history using `commitUserMessage` or clear the agent’s past actions with `commitFlush`. The `notify` method is used for internal communication, while `emit` sends a message to the session's communication channel.

For quick, isolated tasks, the `run` method allows stateless computations. The core interaction happens through `execute`, which runs commands and potentially updates the session’s history. `connect` establishes a connection for sending and receiving messages.

There are also methods for specifically managing agent actions, such as `commitToolOutput` (for tool results) and `commitToolRequest` (to request tools). You can add messages from the assistant, system, or developers using `commitAssistantMessage`, `commitSystemMessage`, and `commitDeveloperMessage` respectively, all of which update the session history.

## Interface IScopeOptions

This interface, `IScopeOptions`, helps you set up the environment for your AI agent swarm. Think of it as a configuration guide. 

You'll use it to specify a unique `clientId` to identify your application, and a `swarmName` to group your agents together. 

It also allows you to define an `onError` function that will be called if something goes wrong, giving you a way to handle errors gracefully. Essentially, it's how you tell the system who you are and what to do when problems arise.

## Interface ISchemaContext

This interface, `ISchemaContext`, acts as a central hub for accessing various schema services within the AI agent swarm orchestration framework. Think of it as a directory containing different "registries," each specialized in managing the structure and definition of different types of tools. Specifically, it holds registries for agent schemas, completion schemas, and several others, allowing you to easily retrieve and work with their underlying definitions.  It provides a structured way to access the blueprints for how agents and their associated tools are built and operate.

## Interface IPolicySchema

This interface defines the structure for configuring policies within the agent swarm orchestration system. It allows you to customize how the swarm enforces rules and handles banned clients.

You can optionally enable persistent storage for banned clients, provide a description for documentation purposes, and assign a unique name to the policy. A default ban message can be specified, or a custom function can be used to generate ban messages tailored to specific situations.

The interface also includes functions for retrieving and setting lists of banned clients, and for validating both incoming and outgoing messages based on your custom rules. Finally, you can hook into policy events using callbacks to further customize the system's behavior.

## Interface IPolicyParams

This interface defines the essential settings needed to set up a policy within the AI agent swarm. Think of it as a configuration file. It includes a logger, which helps track what the policy is doing and any problems that arise. It also incorporates a bus, which is a communication channel for the policy to interact with other parts of the swarm.

## Interface IPolicyConnectionService

This interface helps us define how different parts of the system connect to and interact with policy management. Think of it as a blueprint for making sure the public-facing parts of the policy system work consistently and reliably. It’s designed to exclude details that are only used internally, so we can clearly define what external components need to know.

## Interface IPolicyCallbacks

This interface provides a way to get notified about key events happening within a policy – think of it as a notification system for your rules. You can use these notifications to do things like record what's happening, monitor how well your policies are working, or even automatically respond to certain events. 

Specifically, you can receive updates when a policy is first set up (`onInit`), when incoming messages are checked (`onValidateInput`), when messages being sent out are checked (`onValidateOutput`), or when a client is blocked (`onBanClient`) or allowed again (`onUnbanClient`). These callbacks give you flexibility in customizing how your system reacts to these policy-related actions.

## Interface IPolicy

This interface defines how a policy manages client access and message content within an AI agent swarm. It lets you check if a client is currently blocked, retrieve the reason for a block, and validate messages before they’re sent or received. You can also use it to actively block or unblock clients, effectively controlling who participates in the swarm and what they can communicate. The framework uses this interface to enforce rules and ensure the swarm operates securely and as intended.

## Interface IPipelineSchema

This interface defines the structure for a pipeline within your AI agent swarm orchestration framework.  Each pipeline you create will adhere to this blueprint. 

It requires a `pipelineName` to easily identify it.  The core of the pipeline is the `execute` function, which handles the actual workflow—it takes a client identifier, the name of the agent to invoke, and a payload of data.  You can also provide `callbacks` to customize how the pipeline handles events and responds to completion, making your pipelines more flexible.

## Interface IPipelineCallbacks

This interface defines a set of optional callback functions you can provide to track the progress and outcome of your AI agent pipelines. Think of them as notification hooks that get triggered at key moments.

You can use `onStart` to know when a pipeline begins, getting details like the client it's running for and what data it’s using. 
`onEnd` lets you confirm a pipeline has finished, telling you whether it completed successfully or encountered an error.
Finally, `onError` is your signal that something went wrong during a pipeline’s execution, providing the error details to help you debug. 
These callbacks give you the flexibility to monitor and react to pipeline activity as needed.

## Interface IPersistSwarmControl

This interface lets you tailor how your AI agent swarm's data is saved and retrieved. Think of it as a way to swap out the default storage mechanisms with your own custom solutions.

You can specifically control how the active agents within the swarm are persisted – perhaps you need an in-memory store instead of a file. 

Similarly, you can customize the persistence of the navigation stacks used by the swarm, maybe opting for a database rather than a simple text file. 

Essentially, this provides a hook to inject your own data persistence logic, adapting the framework to your specific needs and environment.

## Interface IPersistStorageData

This interface describes how data is saved and loaded for the AI agent swarm. Think of it as a container holding a collection of information – like a list of key-value pairs or database records – that needs to be preserved. It's specifically designed to work with the system's tools for handling storage persistence, making sure that important information isn't lost. The `data` property simply holds the actual information that needs to be saved.

## Interface IPersistStorageControl

This interface lets you tailor how data is saved and retrieved for a specific storage area. Think of it as a way to swap out the standard saving mechanism with your own custom solution. You can use it to connect your storage to a database or any other persistence method that fits your needs, effectively giving you precise control over how information is stored and accessed. By providing your own persistence adapter, you can ensure the storage behaves exactly as you intend.

## Interface IPersistStateData

This interface helps manage and save the important data your AI agents need to remember between sessions. Think of it as a container for any information—like agent settings or session details—that you want to reliably store and retrieve later. The `state` property within this interface holds the actual data, and it can be any type of data relevant to your specific swarm application. It's designed to work smoothly with tools that handle persistence, ensuring your agents can pick up where they left off.

## Interface IPersistStateControl

This interface lets you tailor how your agent swarm's state is saved and retrieved. Think of it as a way to swap out the default state storage mechanism with something you build yourself, like connecting to a database instead of using local storage. The `usePersistStateAdapter` method is your tool for this—it lets you provide your own custom storage class, giving you fine-grained control over where and how state data is persisted. This is useful when you need more than basic persistence capabilities.

## Interface IPersistPolicyData

This interface describes how the system remembers which clients have been blocked within a specific swarm. It essentially keeps a list of `SessionId` values – think of them as unique identifiers for each client – that have been banned from participating in a particular `SwarmName`.  This allows the swarm to maintain a record of blocked clients across restarts or system updates, ensuring consistent enforcement of policies. The core of this record is a simple list of banned session IDs.

## Interface IPersistPolicyControl

This interface lets you tailor how policy information is saved and retrieved for your AI agent swarms. It provides a way to swap out the standard storage mechanism with your own custom solution. Think of it as a hook to plug in your preferred persistence adapter, allowing you to manage policy data in a way that best suits your needs, such as storing it in memory or using a specific database. You can provide a constructor for your custom adapter, effectively replacing the default persistence behavior for a particular swarm.

## Interface IPersistNavigationStackData

This interface describes how navigation history for a swarm of AI agents is saved and restored. It holds a list of agent names, essentially a stack, that remembers the order in which a user has interacted with different agents. Think of it as a "back" button for your agent interactions - it lets you revisit previous agents you’ve worked with. This information is crucial for maintaining context and allowing users to easily return to where they were in a session.

## Interface IPersistMemoryData

This interface describes how memory information is stored within the swarm system. Think of it as a container for holding any kind of data you want to save, like a session's context or temporary calculations.  The `data` property simply holds that information, whatever format it may be. This structure makes it easy to manage and save memory data as needed.

## Interface IPersistMemoryControl

This interface lets you tailor how memory is saved and retrieved for different sessions. Think of it as a way to swap out the standard memory storage with your own custom solution. You can use it to, for example, store session data in a database instead of relying on a default method, or to use an in-memory store for testing purposes. By providing your own persistence adapter, you have complete control over where and how the memory associated with a session is handled.

## Interface IPersistEmbeddingData

This interface describes how embedding data, which are numerical representations of text or other information, are stored within the AI agent swarm. It ensures a consistent format for saving and retrieving these embeddings, linking them to a unique identifier (stringHash) and a specific name (EmbeddingName).  Essentially, it's a blueprint for how the system remembers the mathematical 'fingerprint' of pieces of information used by the agents. The `embeddings` property holds the actual numerical values that make up that fingerprint – think of it as a list of numbers that describe the data.

## Interface IPersistEmbeddingControl

This interface lets you customize how embedding data is stored and retrieved. You can swap out the standard storage mechanism with your own custom adapter, which is particularly useful if you need specialized handling for embedding information related to a specific swarm. This allows for things like keeping embeddings in memory instead of a database, or adapting to a unique data format. Essentially, it provides a way to fine-tune the persistence of embedding data based on your specific needs.

## Interface IPersistBase

This interface is the foundation for how the system remembers things, like agent states or memory, by saving them to files. It makes sure the storage area is set up correctly, handling any problems with existing files during the process. You can use it to read data back by its unique identifier, quickly check if a piece of data exists without loading it, and to save new information or updates to the storage, all while keeping the data safe and reliable.

## Interface IPersistAliveData

This interface describes how the system keeps track of whether a client is currently active. It's used to monitor the online/offline status of each client participating in a specific swarm. The key piece of information it holds is a simple boolean value – `online` – that tells you whether the client is presently connected and responsive.

## Interface IPersistAliveControl

This interface lets you personalize how your AI agent swarm keeps track of its "alive" status. Think of it as a way to tell the system where and how to store whether an agent is still running. 

You can swap out the default storage mechanism with your own custom solution, like using a database or even just tracking it in memory, to tailor the persistence to your specific needs. This is particularly useful if you want to implement unique storage strategies based on the swarm's name.

## Interface IPersistActiveAgentData

This interface outlines how information about active agents is saved and retrieved. It’s used to keep track of which agent is currently running for each client participating in a swarm. Essentially, it defines what data needs to be stored – specifically the name of the active agent – so that the system knows which agent is currently handling tasks for a particular client within a defined swarm. The `agentName` property is a simple identifier, like "agent1," that uniquely identifies an agent within that swarm environment.

## Interface IPerformanceRecord

This interface describes a record of how a particular process performed within the system. Think of it as a summary of a task's execution, gathering information from all the clients involved.

It keeps track of important details like the unique ID of the process being run. You're also able to see a breakdown of how each individual client performed, alongside overall metrics like the total number of executions, the total and average response times, and timestamps to indicate when the data was collected. This record helps monitor system health and diagnose performance issues by providing insights into both the overall process and how different clients contribute to the results.

## Interface IPayloadContext

This interface, `IPayloadContext`, helps organize information when tasks are being processed. Think of it as a container holding two key pieces of data: a unique ID that identifies who requested the work (the `clientId`) and the actual data that needs to be handled (`payload`). The type of data within the `payload` is flexible and can vary depending on the specific task.

## Interface IOutlineValidationFn

This interface defines a function that’s used to validate the outline of a task before it's assigned to an AI agent. Think of it as a quality check – it ensures the outline makes sense and is well-structured so the agent can work effectively.  The function takes the outline as input and returns a boolean indicating whether it’s valid. If it's not valid, you can potentially include error messages to help refine the outline. It’s a key piece in ensuring your AI agents receive clear and actionable instructions.

## Interface IOutlineValidationArgs

This interface helps pass information needed to check if something is correct during a process. Think of it as a way to give validation functions both the initial input and the result of an action – like providing both the starting instructions and the outcome to see if it's what you expected.  Specifically, it includes a `data` property that holds the results produced by a previous step, usually in a structured format that's ready to be checked.

## Interface IOutlineValidation

This interface helps define how to check and confirm the structure of an outline, like a plan or set of steps, within an AI agent system. It allows you to specify a function that performs the actual validation and provides an optional description to explain what that validation does. Think of it as a way to ensure the outline makes sense and meets certain criteria before an AI agent acts upon it, and to document why that check is important. You can even reuse validation logic by referencing itself or other validations, making the overall process more organized and easier to maintain.

## Interface IOutlineSchemaFormat

This interface describes how to define a format for your AI agent outlines using a JSON schema. Think of it as a way to say, "This outline must follow these specific rules laid out in a JSON schema." It has two key pieces of information: the type of format being used (like "json_schema" to indicate you're using a JSON schema) and the actual JSON schema object itself, which details the expected structure and validation rules for the outline. Using this lets you enforce a consistent format for your outlines, helping ensure your AI agents work together effectively.

## Interface IOutlineSchema

This interface defines how to set up and control a specific outline – think of it as a mini-project within a larger AI agent swarm. It lets you configure everything from the initial prompt that kicks off the process to how the resulting data is validated and formatted.

You can provide a static prompt and system messages, or have them generated dynamically based on the outline’s name. It also includes a way to define validations to ensure the data is correct and fits a specific structure.  You can even set a limit on the number of times the outline will be attempted if issues arise.

Finally, it provides a mechanism to track the history of an outline and create structured data based on the processing of input parameters. It's all about having precise control over how these outlines function and produce reliable results.

## Interface IOutlineResult

This interface describes the outcome when an outline operation is completed. It tells you if the operation was successful, provides a unique ID for tracking its progress, and keeps a record of all the messages exchanged during the process. If something goes wrong, you’ll find an error message here. It also holds the original input parameters and the resulting data, and indicates how many times the operation was attempted.

## Interface IOutlineObjectFormat

This interface defines the expected structure for data outlines used within the AI agent swarm. Think of it as a blueprint for how your data should be organized. 

It ensures consistency by specifying the root type of the outline (like whether it's a JSON object), lists which pieces of data are absolutely necessary, and details what each piece of data represents, including its data type and a helpful description. This helps everyone involved – the agents and the system – understand and work with the data effectively.

## Interface IOutlineMessage

This interface defines the structure of messages within the system, ensuring they are consistently formatted for tracking and processing. Each message has a clearly defined role – whether it's from a user, an assistant, the system itself, or a tool – which helps understand its purpose and origin.  The message content holds the actual text or parameters being communicated.  You can also attach information about tool calls, including an optional ID to link the message to a specific tool execution.

## Interface IOutlineHistory

This interface helps you keep track of the conversation or steps taken during an outline creation process. It lets you add new messages to the history, whether you’re adding one at a time or a whole bunch at once. If you need to start fresh, you can clear the entire history. Finally, you can easily get a complete list of all the messages that have been recorded in the history.

## Interface IOutlineFormat

This interface defines the structure of your outline data, essentially acting as a blueprint for how it should be organized. It tells you what fields are absolutely necessary and what each field represents – including its data type and a short explanation of its purpose. Think of it as a contract that ensures everyone involved in handling outline data knows exactly what to expect, preventing confusion and errors. It outlines both required fields and optional properties, providing a complete definition of the outline's expected format.

## Interface IOutlineCallbacks

This interface lets you listen in on key moments during the outline generation process. You can use it to track when an attempt to create an outline begins, what the generated document looks like, and whether that document is considered valid.  If you want to log activity, monitor progress, or react to successes or failures, these callbacks provide the connection points to do so. Essentially, it's a way to get notified about what's happening behind the scenes as the outline is being created and assessed.

## Interface IOutlineArgs

This interface defines the information passed to an outline processing step within the AI agent swarm. It bundles together the core input—the `param` that needs outlining—along with details like the `attempt` number, which is helpful for tracking retries or versions of the process. You'll also find the `format` property, detailing the expected structure of the generated outline. Finally, `history` provides a way to access and manage the messages generated throughout the outlining process, useful for debugging or providing context.

## Interface IOutgoingMessage

This interface describes a message being sent out from the AI agent system, like a reply or notification going to a specific agent. It lets the system communicate results or updates back to the agents themselves.

Each outgoing message has a `clientId`, which is like an address, specifying exactly which agent should receive it.  The `data` property holds the actual content of the message, such as a result or a response.  Finally, the `agentName` property identifies which agent within the system generated the message, providing context about its origin.

## Interface IOperatorSchema

The `IOperatorSchema` defines how different AI agents can communicate and work together within a swarm. It essentially sets up a system where agents can connect to each other, identified by a unique client ID and agent name.  Think of it as a method for establishing a conversation channel between agents. When an agent wants to send a message to another, it uses this method, providing the message and a way to pass the response back. The connection is managed in a way that allows it to be gracefully shut down when no longer needed.

## Interface IOperatorParams

This interface defines the essential information needed to configure and run an agent within the swarm orchestration system. Think of it as a set of instructions for each agent. 

Each agent needs to know its designated name (`agentName`) to identify itself within the swarm. A unique `clientId` is also provided for tracking and management purposes. 

To help with debugging and understanding what’s happening, each agent receives a `logger` to record its actions.  Communication between agents and the system relies on an `bus` for sending and receiving messages. Finally, an `history` object allows each agent to keep track of its past actions and decisions.

## Interface IOperatorInstanceCallbacks

This interface defines a set of functions you can use to get notified about what's happening with individual AI agents within your orchestration framework. Think of it as a way to listen in on the actions of each agent. 

You'll receive callbacks when an agent is first set up (`onInit`), when it provides an answer (`onAnswer`), when it gets a message (`onMessage`), when it’s being shut down (`onDispose`), and when it sends out a notification (`onNotify`). Each of these callbacks includes information like the client ID and the agent’s name, allowing you to track and respond to specific agent behavior.

## Interface IOperatorInstance

This interface defines how you interact with a single agent within your swarm orchestration system. Think of it as a way to communicate with and control one agent at a time.

You use `connectAnswer` to set up a listener that will receive answers from the agent.  The `answer` method lets you send responses back to the agent.  `init` establishes the initial connection, while `notify` allows you to send general notifications.  `recieveMessage` handles incoming messages from the agent, and finally, `dispose` cleanly shuts down and releases resources associated with the agent's connection.

## Interface IOperatorControl

This interface, `IOperatorControl`, provides a way to manage how operators within your AI agent swarm function. You can use it to tell the system which functions you want to be called when certain events happen within an operator – think of it as customizing notifications or actions. 

Additionally, it allows you to swap out the default operator implementation with your own custom version, giving you fine-grained control over the underlying logic. Essentially, it's a mechanism for both configuring and extending the behavior of individual operators in your swarm.

## Interface INavigateToTriageParams

This interface lets you customize how a navigation process directs an agent to a triage agent. It provides hooks for fine-tuning the communication flow.

You can use `beforeNavigate` to run some logic just before the navigation starts, using details like the client ID and the last message received. `lastMessage` allows you to modify the message that will be sent as part of the navigation.

The `flushMessage` and `executeMessage` properties let you control the messages sent during those specific steps, either using static strings or functions that generate dynamic content based on the client ID and the default agent.

Finally, `toolOutputAccept` and `toolOutputReject` allow you to define how acceptance or rejection of tool outputs are communicated, again with options for static messages or dynamic generation.

## Interface INavigateToAgentParams

This interface lets you customize how your agent swarm navigates and communicates when moving to a new agent. It provides settings to control what happens before the move, what messages are sent during the process, and how tool outputs are handled. You can define specific actions or messages triggered before the navigation begins, determine the initial message the new agent receives, and even shape the response when a tool is used. Essentially, it’s a way to fine-tune the agent transition experience and ensure smooth communication between agents in your swarm.


## Interface IModelMessage

This interface, `IModelMessage`, defines the structure for all messages exchanged within the agent swarm system. Think of it as the fundamental unit of communication – whether it's a user's instruction, a tool's output, or a system notification.

Each message has a `role` indicating who or what sent it (like a user, assistant, or tool) and an `agentName` to identify the specific agent involved. The `content` field holds the actual text or data being transmitted. A `mode` property clarifies whether the message originates from user input or a tool.

When a model needs to execute a tool, the message will include an array of `tool_calls` detailing the tool's name and any necessary arguments.  You might also see `images`, `tool_call_id` to link responses to specific tool requests, and a flexible `payload` for additional information. It’s the standardized way all components in the swarm talk to each other, ensuring consistency and context.

## Interface IMethodContext

This interface, `IMethodContext`, provides a standardized way to track details about a specific method call within the AI agent system. Think of it as a little package of information that travels with each method call, allowing different parts of the system – like client agents, performance trackers, and logging services – to understand what’s happening. It holds key identifiers, such as the client session, the name of the method being called, and the names of the agents, swarms, storage, state, compute, policy, and MCP resources involved. This shared context helps ensure everything is coordinated and provides valuable insights for monitoring and documentation.

## Interface IMetaNode

This interface, IMetaNode, helps us organize information about agents and their relationships in a clear, structured way. Think of it as a building block for creating visual maps of how agents connect and what they use. Each node has a name, which is usually the agent’s title or what it manages, like a specific set of data. It can also have children – these are other nodes that depend on it or are part of its structure, letting us build complex, hierarchical relationships. Essentially, it's a way to represent dependencies and attributes within the agent swarm.

## Interface IMCPToolCallDto

This interface defines the structure of data used when a tool is called as part of a larger AI agent workflow. It bundles together information like a unique ID for the tool being used, who is requesting the tool call (the client), the name of the agent making the request, and the specific parameters needed to run the tool. You'll also find information about related tool calls, a signal to potentially cancel the operation, and a flag indicating if this call concludes a series of actions. Essentially, it’s the package of details needed to execute a tool and keep track of its place in the bigger picture of agent orchestration.

## Interface IMCPTool

This interface describes what a tool looks like within our AI agent orchestration system. Each tool has a unique name to identify it, and an optional description to explain its purpose. Crucially, every tool also defines an `inputSchema` which specifies the format and required data the tool expects to receive – essentially, it tells the system how to properly prepare information for the tool to use. This schema ensures that tools are used correctly and reliably within the orchestrated workflow.

## Interface IMCPSchema

The IMCPSchema interface outlines the fundamental structure and actions an AI agent swarm orchestration framework’s Master Control Program (MCP) must follow. Every MCP needs a unique name, and can optionally provide a description for documentation purposes. 

Crucially, an MCP must define how it can list the tools available to different clients and how to execute those tools, accepting parameters and returning results. 

Finally, it can also register certain functions to be notified about events happening during its lifecycle.

## Interface IMCPParams

This interface defines the configuration needed for managing an orchestration process within the AI agent swarm framework. It requires a logger to track what's happening and a bus for communication between different components. Think of the logger as a way to monitor the process, and the bus as a delivery system for messages and events related to the orchestration. It builds upon the base MCP (Main Control Plane) structure, adding these crucial communication and monitoring capabilities.

## Interface IMCPConnectionService

This service manages the connections between your central orchestration system and the individual AI agents in your swarm. It's responsible for establishing, maintaining, and closing these communication links, ensuring your agents can reliably receive instructions and report back their progress. Think of it as the network manager for your AI swarm – it handles all the underlying communication details so you can focus on the higher-level orchestration logic. You're essentially using this to ensure a stable and functional communication pipeline between your system and each agent. The functions provided here let you control and monitor these connections.

## Interface IMCPCallbacks

This interface defines a set of functions that your application can use to react to different stages in the lifecycle of a managed client proxy (MCP). Think of these functions as notification hooks – they let you know when things happen related to a specific client's connection and tools. 

The `onInit` function gets triggered when the MCP is first set up. `onDispose` is called when resources for a client are being released. `onFetch` lets you know when tools are being retrieved for a client, and `onList` signals that you’re listing available tools.  When a tool gets called, `onCall` will be invoked, providing details about the tool and the data being sent. Finally, `onUpdate` gets called whenever the list of available tools changes. By implementing these functions, you can build responsive systems that adapt to the evolving state of the agent swarm.

## Interface IMCP

This interface lets you interact with the tools available to AI agents within the system. 

You can use it to see what tools are accessible to a particular agent (listTools), or check if a specific tool is available (hasTool). 

The callTool method is how you actually trigger a tool, sending it data and receiving a result. 

Sometimes the tool list needs refreshing; updateToolsForAll clears the entire tool cache and fetches a fresh list, while updateToolsForClient does the same but only for a single agent.

## Interface IMakeDisposeParams

This interface defines the information needed to automatically handle the cleanup of an AI agent swarm. 

It lets you specify how long the system should wait for the swarm to complete its tasks before considering it finished (using `timeoutSeconds`). 

You can also provide a function (`onDestroy`) that gets called when the swarm is disposed, giving you a chance to perform any necessary cleanup actions associated with a specific agent (identified by `clientId`) and swarm.

## Interface IMakeConnectionConfig

This interface, `IMakeConnectionConfig`, helps you control the pace at which your AI agents attempt to connect. Think of it as a way to avoid overwhelming resources or being too aggressive when establishing connections. The `delay` property lets you specify a waiting period, in some unit of time, between connection attempts. This helps manage the overall flow and responsiveness of your agent swarm.

## Interface ILoggerInstanceCallbacks

This interface defines a set of functions that allow you to interact with and observe the lifecycle of a logger. You can use these functions to be notified when a logger starts up, shuts down, or when it records different types of messages like debug, info, or general logs. Essentially, it’s a way to plug your own custom actions into the logging process, giving you control over how logging events are handled. Each function receives information about the logger's identifier and the topic of the log message.

## Interface ILoggerInstance

This interface defines how loggers used within the agent swarm framework should behave, especially concerning when they're ready to be used and when they need to be cleaned up. It builds upon a basic logging foundation and adds functionality to handle setup and shutdown processes.

The `waitForInit` method lets the framework know when a logger is fully prepared, optionally allowing for asynchronous initialization.  It makes sure each logger is initialized only once.

The `dispose` method provides a way to properly shut down a logger, releasing any resources it's using and performing necessary cleanup actions when it's no longer needed.

## Interface ILoggerControl

This interface provides ways to customize how logging works within the agent swarm orchestration framework. You can use it to set up a central logging adapter for all operations, define custom lifecycle callbacks when creating logger instances, or even specify your own way to build those logger instances. There are also methods for directly logging messages – info, debug, and general messages – specifically tied to individual clients, ensuring that these logs go through a common, controlled logging system and include important context like session validation.

## Interface ILoggerAdapter

This interface outlines the basic functions needed to connect to and use different logging systems. Think of it as a standard way to send messages – whether it's regular logs, debugging information, or general updates – to a particular client. Each log message is tied to a specific client ID and a topic, ensuring messages are routed correctly. The `dispose` function lets you clean up resources and remove a client's logging setup when it's no longer needed. Before any logging happens, the system makes sure everything is properly set up for that client.

## Interface ILogger

The `ILogger` interface defines how different parts of the AI agent swarm system record events and information. It provides methods for logging messages at different levels of importance – general logs, detailed debug messages, and informational updates. These logs help track what's happening within the swarm, from agent actions and tool usage to policy checks and data storage, making it easier to understand, monitor, and troubleshoot the system. You can use these methods to record everything from basic initialization to detailed debugging information.

## Interface IIncomingMessage

This interface defines the structure of a message coming into the AI agent swarm. It represents data sent from a client, like a user's input or a request from another system. Each message has a unique client identifier so you know where it originated, and contains the actual data being sent. Finally, it specifies which agent within the swarm is responsible for handling that particular message.

## Interface IHistorySchema

This interface outlines how your AI agent swarm keeps track of past conversations and data. Think of it as the blueprint for where and how those messages are saved. The `items` property is the most important part – it tells the system which specific tool will handle storing and retrieving those conversation histories, allowing for flexibility in choosing different storage methods.

## Interface IHistoryParams

This interface defines the settings needed when setting up a history record for an AI agent. It allows you to specify things like the agent's name, how much of its past interactions to remember (to keep the conversation flowing), and a unique identifier for the client using the agent. You'll also provide a logger to track what's happening with the history and a communication channel (the "bus") so the agent swarm can share information. Essentially, it’s about configuring how each agent’s interactions are tracked and managed within the larger system.

## Interface IHistoryInstanceCallbacks

This interface defines a set of callbacks used to manage how an agent’s conversation history is handled. You can use these callbacks to customize things like fetching the initial history data for an agent, deciding which messages are kept, and being notified when the history changes. For example, you can use `getSystemPrompt` to dynamically adjust what the agent initially knows, and `filterCondition` to selectively exclude messages from being processed. The `onChange`, `onPush`, and `onPop` callbacks allow you to react to modifications to the history itself, while `onRead` allows you to process individual messages during read operations. You’re also given hooks for initialization (`onInit`), cleanup (`onDispose`), and access to the history instance (`onRef`).

## Interface IHistoryInstance

This interface provides a way to manage the history of interactions for each AI agent within the swarm. You can use it to step through past messages from a specific agent, making it useful for debugging or analyzing agent behavior. 

It also lets you initialize the history for an agent, add new messages as they occur, retrieve the most recent message, and clean up the history when an agent is no longer needed. Essentially, it's the foundation for keeping track of what each agent has done and said.

## Interface IHistoryControl

This interface lets you fine-tune how the system remembers and manages past interactions. You can tell it which functions to call at different points in the history's lifecycle, like when a new history item is created or when an old one is removed. 

Additionally, you can provide your own custom way of creating history instances, allowing for greater flexibility in how history data is structured and handled. This gives you a way to tailor the history management to your specific needs.

## Interface IHistoryConnectionService

This interface provides a blueprint for how to interact with the system's history connection service. Think of it as a contract outlining the methods and properties you can use to access and manage historical data. It’s specifically designed to represent the publicly accessible parts of the history connection service, stripping away any internal details that aren't meant for direct use. By using this interface, you can be sure your code aligns with the intended public functionality.

## Interface IHistoryAdapter

This interface helps manage a record of conversations and actions taken by your AI agents. Think of it as a way to keep track of what happened in each agent’s interactions.

You can add new messages to the record using the `push` method, retrieve and remove the most recent message with `pop`, and clear the entire record for a specific agent with `dispose`.

If you need to examine the history in order, the `iterate` method lets you step through the messages one by one.

## Interface IHistory

This interface keeps track of the conversation history for your AI agents or raw model interactions. 

You can add new messages to the history using the `push` method, which updates the record behind the scenes. To retrieve the most recent message, use `pop`, which removes and returns it.

If you need to format the history for a specific agent, `toArrayForAgent` transforms the data based on a given prompt and any system instructions.  If you simply want all the raw messages in the history, `toArrayForRaw` provides that data without any modifications.

## Interface IGlobalConfig

This file defines the global configuration settings for the AI agent swarm orchestration system. Think of it as a central hub controlling how the system behaves, influencing everything from tool usage and logging to error handling and user experience.

You can customize these settings using `setConfig` to tailor the system to your specific needs. Here's a breakdown of the main categories and a few key highlights:

*   **Error Handling & Recovery:** Settings like `CC_RESQUE_STRATEGY` dictate how the system handles errors during model execution, allowing you to choose between flushing the conversation, retrying tool calls, or using a custom recovery function.
*   **Logging:** Controls the verbosity of system logs, including debug and info levels.  You can enable or disable these levels to adjust how much detail is recorded.
*   **Tool Management:**  Settings for limiting the number of tool calls and customizing tool call processing.
*   **User Experience:** Options for providing placeholder responses when model outputs are empty, and for formatting agent outputs.
*   **Swarm Behavior:** Configuration options related to agent and navigation stack management within a swarm.
*   **Persistence & Caching:** Settings to manage data storage and caching of embeddings.
*   **Operator Connections:** Defines how operators interact with agents, including timeouts and message handling.
*   **Security:** Provides functionality for operator timeouts and data retrieval.

This configuration file allows a high degree of flexibility in adapting the system's behavior while maintaining a centralized point of control.

## Interface IFactoryParams

This interface lets you customize how your AI agent swarm interacts with users and handles different events. Think of it as a way to shape the communication and actions taken by each agent.

You can define custom messages that are sent when an agent needs to clear its memory (flushMessage), processes tool outputs (toolOutput), sends a general update (emitMessage), or executes a task (executeMessage).

These customizations can be simple text strings or more complex functions that dynamically generate messages based on factors like the client ID, the agent's name, and the last user message. This gives you fine-grained control over the agent's behavior and how it presents information to the user.

## Interface IFactoryParams$1

This interface lets you customize how your AI agent swarm navigates and interacts during specific events. You can provide custom messages or functions to handle situations like clearing out data, initiating actions, or responding to tool outputs. These configurations allow you to tailor the agent's behavior to your specific needs, providing flexibility in how it responds in different scenarios. It gives you control over the prompts or instructions used during the navigation process. You can specify different messages for acceptance or rejection of tool outputs, ensuring consistent communication.

## Interface IExecutionContext

This interface, IExecutionContext, provides a shared understanding of what's happening during a specific task within the AI agent swarm. Think of it as a package of important details, like a client’s ID, a unique ID for the execution itself, and a process identifier. These details are used by different parts of the system – the client interaction, performance tracking, and communication channels – to keep everything synchronized and traceable. Essentially, it’s a common reference point for monitoring and managing the execution of tasks.

## Interface IEntity

This interface, `IEntity`, serves as the foundation for all the data objects that the swarm system stores and manages. Think of it as a common blueprint that different types of entities build upon. If you're working with any stored information within the system, it will likely inherit from this interface, allowing for a consistent way to handle and identify various data elements. Specialized entity types will extend this interface to add their specific data fields and properties.

## Interface IEmbeddingSchema

This interface lets you configure how your AI agents create and compare embeddings – essentially, numerical representations of text. You can decide whether to save these embeddings for later use, giving your swarm a memory of past computations. 

It allows you to name your embedding mechanism for easy identification and provides functions to store and retrieve embeddings from a cache, speeding up processes.  You also have the flexibility to add custom actions that happen when embeddings are created or compared. Finally, you can use provided functions to create new embeddings from text and determine how similar any two embeddings are.

## Interface IEmbeddingCallbacks

This interface lets you tap into what’s happening as embeddings are generated and compared. You can use the `onCreate` callback to monitor when new embeddings are made, perhaps to log them or do something extra with them. Similarly, the `onCompare` callback gives you a chance to observe and record the results of comparing two embeddings to see how similar they are. This helps you keep track of and analyze the embedding process.

## Interface ICustomEvent

This interface lets you create custom events within the swarm system, giving you the freedom to send any kind of data alongside the event notification. It builds upon the standard event structure, but allows you to include unique information that might not fit into the usual event formats. Think of it as a way to send specific messages to different agents, containing data tailored to that particular situation – perhaps a status update with some extra details or a specialized request. The data you send with these custom events can be anything you need it to be, allowing for very specific interactions between agents.

## Interface IConfig

This interface, `IConfig`, helps you control how diagrams are generated. It primarily focuses on whether to include subtrees in the diagram – a boolean setting called `withSubtree`. If you set `withSubtree` to `true`, you're telling the system to display the hierarchical relationships extending beyond the immediate elements. Conversely, `false` means only the top-level elements will be shown. This simple setting lets you manage the complexity and detail of the visual representation.

## Interface IComputeSchema

This interface, `IComputeSchema`, defines the structure for describing a computational task within your agent swarm orchestration. It’s like a blueprint that tells the system what the task does, how long it needs to be available, and how it interacts with other tasks. 

You’ll find properties like `docDescription` for a human-readable explanation of the task, `computeName` to uniquely identify it, and `ttl` to set an expiration time. The `getComputeData` property is a crucial function that lets the system retrieve the data the computation works with.  

The `dependsOn` array lists other computational tasks this one needs to run before it can start, ensuring dependencies are met. You can also add custom logic using `middlewares` or define callbacks to handle specific events during the task's lifecycle.

## Interface IComputeParams

This interface, `IComputeParams`, provides the essential information needed for running computations within the AI agent swarm orchestration framework. Think of it as a package of tools and context. It includes a `clientId` to identify the specific computation request. A `logger` allows you to track what's happening and debug any issues. The `bus` property is crucial for communication between agents and components. Finally, `binding` provides a way to react to and manage changes in the system's state.

## Interface IComputeMiddleware

This interface defines how you can add custom logic to modify the data being sent to or received from your AI agents. Think of it as a way to intercept and adjust the information flowing through your swarm, allowing for things like data sanitization, transformation, or even adding extra context.  Implementing this interface lets you shape the communication between the orchestrator and your agents, providing flexibility in how your swarm operates.  You're essentially creating a pipeline stage for the data, giving you precise control over the information being processed. The `transform` method is where your custom logic resides, taking the incoming or outgoing data and returning a potentially modified version.

## Interface IComputeConnectionService

This interface defines how your AI agents connect to and interact with a compute resource, like a server or a cloud environment. Think of it as the bridge that lets your agents access the tools and data they need to do their work. It handles the connection process, ensures data is sent and received correctly, and provides a way to manage the connection lifecycle. Developers using this framework will implement this interface to tailor the connection method to their specific compute environment, making the system flexible and adaptable. It allows for different connection types and protocols to be used seamlessly within the agent swarm.

## Interface IComputeCallbacks

This interface, `IComputeCallbacks`, lets you plug in your own custom logic to be notified at key moments in the lifecycle of a compute unit within the agent swarm. You can define functions to run when a compute unit is first initialized, when it’s being cleaned up or disposed, and whenever it performs a calculation or update.  Essentially, it’s a way to react to what’s happening with each individual compute unit, giving you fine-grained control and observability. You’ll provide these callback functions to track the behavior of your compute units within the larger agent swarm system.


## Interface ICompute

This interface, `ICompute`, defines how different components in your AI agent swarm can perform calculations and manage their data. The `calculate` method lets a component execute a specific computation based on a given state name, essentially telling it what to work on. You can also use `update` to inform a component about changes or new assignments, identifying which client and compute are involved. Finally, `getComputeData` provides a way to retrieve the current data associated with a compute component, allowing you to check its status or information.

## Interface ICompletionSchema

The `ICompletionSchema` interface helps you define how your AI agent swarm will generate responses or outlines. Think of it as a blueprint for a specific completion process.

It lets you give each completion method a unique name and specify whether the output should be in JSON format. You can also pass special flags to the underlying language model, like instructions to skip certain steps.

To further tailor the behavior, you can set up optional callbacks to handle events after a completion is generated.

Finally, the `getCompletion` method is the core of this interface; it’s what you’ll use to actually trigger the completion process, providing the context and tools needed to produce a response.

## Interface ICompletionCallbacks

This interface lets you connect to events that happen when a task finishes successfully. Think of it as a way to be notified and take action after an AI agent completes its work. You can use the `onComplete` property to do things like record the results, refine the output, or start another process based on what the agent produced. It provides a simple way to extend the framework’s behavior and integrate it with your own systems.

## Interface ICompletionArgs

This interface defines what’s needed to ask for a completion from the system. Think of it as a structured request that includes all the information needed to generate a helpful and relevant response.

It specifies a unique identifier for who's making the request (clientId), the agent that needs the completion (agentName), and optionally, a pre-defined outline to ensure the response follows a specific format (outlineName).

The request also carries the history of the conversation so far (messages), and can include a list of tools the agent can use to fulfill the request (tools). Finally, it indicates whether the last message originated from a tool or a user (mode), and can provide formatting guidelines for the output (format).

## Interface ICompletion

This interface defines how different parts of the system can generate responses from AI models. Think of it as a standard way to get a model's answer – it lays out the structure and methods needed for that process to work reliably. It builds upon a basic completion structure, providing a full set of tools for handling the entire response generation process.

## Interface IClientPerfomanceRecord

This interface, `IClientPerformanceRecord`, is all about tracking how individual clients – think user sessions or agent instances – are performing within a larger process. It’s designed to give you a granular view of what's happening at the client level, helping you pinpoint performance bottlenecks or understand resource usage.

Each `IClientPerformanceRecord` contains details like a unique client ID, the data stored in their session memory, and their current session state.  You're also getting numbers on how many operations they're running, the size of the data they're processing (both incoming and outgoing), and how long those operations are taking.  This information helps in understanding the overall health and efficiency of your system by focusing on individual client experiences.

## Interface IChatInstanceCallbacks

This interface provides a way for external systems to receive updates and react to events happening within a chat instance managed by the AI agent swarm orchestration framework. You're notified when an instance is initially set up, when it's shut down, and when a chat session starts.  Additionally, you're informed when a message is sent during a chat. The framework also lets you know about the activity status of each instance, which can be useful for monitoring and resource management.

## Interface IChatInstance

This interface represents a single chat session within the AI agent swarm. It provides methods to start a chat, send messages to it, and check for activity to keep the session alive. You can also use it to clean up the chat instance when it’s no longer needed and set up notifications when a chat is being closed. Essentially, it’s the primary way to interact with and manage a specific AI agent conversation.

## Interface IChatControl

This API lets you configure how your AI agents communicate. You can tell the system which type of chat interface to use by providing a constructor for the chat instance.  Also, you can specify which events or actions the system should notify you about as it’s running – essentially, you get to define how you want to be kept in the loop.

## Interface IChatArgs

This interface, `IChatArgs`, defines the information needed to participate in a chat session within the agent swarm. It’s essentially a structured way to pass chat details around. 

Each chat requires a `clientId`, which is a unique label identifying the client initiating the conversation.  You’ll also need to specify the `agentName` – that's the name of the agent specifically assigned to handle this particular chat. Finally, the core of the chat itself is represented by the `message` property, which holds the actual text of what’s being communicated.

## Interface IBusEventContext

This interface provides extra information about events happening within the swarm system. Think of it as a way to add context to an event, letting you know which agent, swarm, or other components are involved.

When an agent is sending an event, it usually just includes its own name (agentName) in this context. However, other parts of the system might use this to include details about swarms, storage, states, compute resources, or policies involved in the event. It's a flexible way to add more detail to what's happening within the swarm.

## Interface IBusEvent

This interface describes the structure of messages sent across the internal communication system within the agent swarm. Think of it as a standardized way for different parts of the system, especially agents, to talk to each other and notify the central system about actions and changes.

Each message has a source, which identifies where it came from (usually the agent bus); a type, which explains what kind of action is being communicated (like "run" or "commit-user-message"); and then input and output data – essentially, the information being passed along with the notification. Finally, there’s a context section providing extra details about the message, like which agent sent it. It helps ensure consistent communication and makes it easier to understand what’s happening within the swarm.

## Interface IBus

The `IBus` interface provides a way for different parts of the AI agent swarm to communicate with each other, especially to update clients. Think of it as a central messaging system. 

Agents use the `emit` method to send notifications – like when a task is finished, a message is committed, or an output is ready – to specific clients.  These notifications are structured events that include information about what happened, where it came from, and who it's intended for. The `clientId` within the event confirms the target of the notification, adding a layer of verification. 

The `emit` method is asynchronous, meaning the message is queued for delivery instead of being sent immediately. This helps keep the system responsive and allows for more flexible communication patterns.  By using this bus, different components can work together without needing to know exactly what the others are doing, leading to a more organized and manageable swarm.

## Interface IBaseEvent

This interface lays the groundwork for how different parts of the system communicate with each other through events. Think of it as the basic template all events follow. Every event generated in the system will have a `source` to indicate where it came from, like a specific agent or component. It also includes a `clientId` so you can make sure the event reaches the right client or agent instance, ensuring messages are delivered to the intended recipient. This foundation allows for flexible and targeted communication throughout the agent swarm.

## Interface IAgentToolCallbacks

This interface lets you plug in custom actions that happen around when a tool is used by an agent. You can define what should occur right before a tool runs, after it finishes, or even validate the inputs to ensure they’re correct. If something goes wrong during tool execution, you can also specify a callback to handle the error. These callbacks provide a way to monitor tool usage, ensure data integrity, and gracefully handle unexpected issues.

## Interface IAgentTool

This interface defines what a tool looks like within the agent swarm system. Each tool has a unique name and an optional description to help users understand how to use it. 

Before a tool can be used, it needs to be checked for availability, considering the current situation.  There’s also a validation step to make sure the input parameters are correct. 

You can even add custom lifecycle hooks to control how the tool operates, and the tool must have a defined type, currently `function`. Finally, the `call` method is what actually runs the tool, providing it with all the necessary information about the request.

## Interface IAgentSchemaInternalCallbacks

This interface provides a set of hooks that allow you to monitor and react to different stages of an agent's lifecycle. You can use these callbacks to track what an agent is doing, log important events, or even intervene in the agent's execution.

For example, you can listen for `onRun` to know when an agent is executed without remembering past interactions, or use `onToolOutput` to observe the results produced by the tools the agent uses. `onExecute` signals the beginning of agent execution, while `onResurrect` lets you know when an agent is restarted.

You’re also able to receive updates on developer messages, assistant messages, user messages, tool requests, tool errors, and when the agent’s memory is cleared (`onFlush`). Finally, you can observe the agent's initialization, disposal, and completion of tool call sequences with `onInit`, `onDispose`, and `onAfterToolCalls` respectively.

## Interface IAgentSchemaInternal

This describes how an agent is configured within the system. Think of it as a blueprint for each individual agent, outlining its personality, capabilities, and how it interacts with the rest of the swarm.

Each agent has a unique name, and it uses a specific "completion" mechanism – essentially, how it generates responses. If the agent isn’t designated as an “operator,” it *must* have a prompt to guide its actions.  An "operator" agent is special; it's designed to handle live interactions with customers.

The agent can use tools – these are specific functionalities it can access – and it can also store and retrieve information from various storage systems.  It might also rely on other agents ("dependsOn") to handle transitions or workflows.

You can customize the agent’s behavior even further. For example:

*   **Filtering tool calls:** You can control which tools the agent actually uses.
*   **Limiting context:**  You can specify how much conversation history the agent remembers.
*   **Adding context:** An optional description helps explain what the agent does.
*   **Validating output:**  You can ensure the agent’s responses are accurate and appropriate.
*   **Transforming responses:** You can modify the agent’s output before it’s presented.

Finally, lifecycle callbacks give you even finer-grained control over how the agent functions throughout its execution.

## Interface IAgentSchemaCallbacks

This interface defines a set of optional hooks that allow you to monitor and react to different stages of an agent's lifecycle. Think of them as event listeners for your agents – you can plug in functions to be notified when an agent starts, produces output, uses tools, or encounters specific situations like being paused or initialized. Each callback function provides information about the agent, the client interacting with it, and the specific event that occurred, enabling you to build custom logic around agent behavior, logging, or debugging. These callbacks offer a flexible way to extend and customize the agent orchestration framework.

## Interface IAgentSchema

This interface defines the structure for describing an AI agent within the orchestration framework. It focuses on how the agent should behave, primarily through system prompts. 

You can provide a static set of instructions for the agent using the `system` or `systemStatic` properties; these are essentially the agent's core guidelines. 

For more flexibility, `systemDynamic` lets you generate system prompts on the fly, customizing them based on factors like the client or the agent's name. This allows for really tailored and reactive agent behavior.

## Interface IAgentParams

This interface defines the settings an agent needs when it’s running. It brings together configuration details, like a unique client identifier, logging utilities, and ways to communicate with the rest of the system. 

Think of it as the agent’s toolbox – it includes things like a logger to record what’s happening, a bus for messaging, and a way to access external tools. The interface also lets you provide validation steps to check the agent’s output before it's considered complete, and define a list of tools it can use.

## Interface IAgentNavigationParams

This interface defines the settings needed to guide an AI agent to use a specific tool. It lets you specify the name of the tool you want the agent to use, along with a brief explanation of what the tool does. You also tell the system which agent the navigation should target. Finally, there's a space for adding extra notes about the tool, which is helpful for understanding its purpose or limitations.

## Interface IAgentConnectionService

This interface helps ensure that the publicly available parts of your agent connection service are clearly defined and consistent. Think of it as a blueprint for how others should interact with your agent connection functionality – it focuses on what's important for external use and excludes any internal implementation details. It’s used to create a specific, type-safe version of your connection service designed for public consumption, keeping things organized and predictable.

## Interface IAgent

The `IAgent` interface defines how an individual agent operates within the orchestration framework. It outlines the methods available to interact with and control the agent’s behavior.

You can use the `run` method to test an agent's capabilities with a given input without affecting its history.  The `execute` method handles the agent’s core processing, potentially modifying its history depending on the chosen mode.  `waitForOutput` lets you retrieve the agent’s final output after it's finished executing.

Several `commit...` methods allow you to manage the agent’s internal state. These let you add messages (system, developer, user, assistant) to the agent’s history, log tool requests, and clear the entire history to reset the agent to its starting point.  There are also methods to stop tool executions and signal changes in the agent's operation.
