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

This function checks all the swarms, agents, and outlines currently set up within the system to ensure everything is configured correctly. It’s designed to be safe to run repeatedly – it won't cause any problems if you run it multiple times because it only validates once per process. Think of it as a health check for your AI agent setup.

## Function startPipeline

This function lets you kick off a sequence of tasks, or a "pipeline," within your AI agent swarm. You tell it which client is requesting the work, what pipeline you want to run (like "data analysis" or "report generation"), and which agent should handle it.  You can also pass along some initial information, or a "payload," that the agent will need to get started. The function will then promise to return a result once the pipeline is complete, which will be of type `T`. Think of it as sending a job request to your agent workforce.

## Function scope

This function lets you run a piece of code, like a task or a function, inside a controlled environment that understands the overall system and its rules. Think of it as setting up a little sandbox where your code can operate. You can provide your own versions of certain tools – like agents or ways to generate text – if you want to customize how your code interacts with the larger system. If you don't provide your own tools, it will use the default tools provided by the swarm. It's useful when you need to ensure a function has access to the necessary context and can use the right resources to get its job done.

## Function runStatelessForce

This function lets you send a message to your AI agent swarm and have it processed immediately, without saving the message to the conversation history. It's perfect for things like quickly handling data from external storage or running one-off tasks that don't need to be part of the ongoing dialogue. 

Importantly, it will always execute the message, even if the agent currently available isn't the one you expect—it doesn't check agent activity beforehand. You provide the message content and a client ID to identify the request. The system takes care of the rest, tracking performance and notifying relevant systems along the way.

## Function runStateless

This function lets you quickly run a command or instruction through one of your AI agents without adding it to the ongoing conversation history. Think of it as sending a one-off request – useful for things like processing data or performing tasks that don't need to be part of a continuous chat.

It ensures the agent you're using is still available and properly configured. The command is then executed in a fresh environment, and the system keeps track of performance and sends out notifications. If the assigned agent has been replaced during the swarm session, the request is ignored.

You’ll need to provide the content of the command, a client identifier for tracking, and the name of the specific agent you want to use to execute it. The function returns the result of the execution as a string.

## Function questionForce

This function allows you to directly trigger a question-answering process, even if it doesn't naturally arise from a conversation. You provide the actual question you want answered as the `message`, along with a unique identifier for the client using the service (`clientId`) and the specific knowledge base or "wiki" where the answer should be sought (`wikiName`). The function then returns the answer as a string. Think of it as a way to bypass normal chat flow and get a direct answer from your AI agents.

## Function question

This function lets you send a question or message to your AI agent swarm. It’s designed to be used within a conversation, allowing the agents to understand the context. You’ll need to provide the actual message you want the agents to consider, a unique identifier for the client asking the question, the specific agent responsible for handling it, and the relevant knowledge base or “wiki” the agent should use to find an answer. The function then returns a promise that resolves to the agent's response.


## Function overrideWiki

This function lets you change the setup of a wiki within the agent swarm. Think of it as updating a wiki’s configuration – you can provide a new or partial schema to modify its properties. It's designed to work independently, making sure the changes are isolated and clean. If your system is set up to log events, this override will be recorded. You just need to provide the new or updated information for the wiki you want to change.

## Function overrideTool

This function lets you change the definition of a tool already registered within the AI agent swarm. Think of it as modifying an existing tool's blueprint – you can add to it or replace parts of it.  It's designed to be a straightforward way to adjust tool configurations without affecting anything else that’s currently running. The system will record that a tool has been altered if logging is turned on. You provide a new or partial definition for the tool, and it updates the swarm's understanding of that tool.

## Function overrideSwarm

This function lets you directly modify the setup of a swarm within the system. Think of it as a way to quickly adjust how a group of AI agents is organized and operates. You can provide a new or partial configuration, and this function will apply those changes. It’s designed to be a standalone operation, ensuring that any adjustments are isolated and don't interfere with ongoing processes. The system will also record this modification if logging is turned on. You simply provide the new swarm configuration, and the function handles updating the system’s understanding of that swarm.

## Function overrideStorage

This function lets you modify how your swarm stores data. Think of it as updating the blueprint for a specific storage location. You can provide a new schema or just parts of one to change its configuration. It's designed to work independently, ensuring a safe and isolated update process. If your system is set up to record actions, this override will be logged. 

The function accepts a schema as input, which outlines the details of the storage you're changing.


## Function overrideState

This function lets you change the way the swarm system manages its state. Think of it as a way to refine or adjust the blueprint for a specific state, potentially adding new details or modifying existing ones. It's designed to be a direct update, working independently of any ongoing tasks, making sure the changes are isolated and predictable.  If the system is set up to log activity, you'll see a record of this state override happening. You provide a new or partial state definition, and the system applies those changes to the existing state configuration.

## Function overridePolicy

This function lets you change how a policy works within the swarm. You can provide a new or updated version of the policy’s rules and settings, essentially tweaking its behavior. It’s designed to make these changes safely, keeping them separate from any ongoing tasks. The system will record these policy adjustments if logging is turned on. You only need to provide the parts of the policy you want to change – you don't have to redefine the whole thing.

## Function overridePipeline

This function lets you modify an existing pipeline definition. Think of it as a way to tweak a pipeline—maybe you want to change a step, add a new one, or adjust how data flows. You provide a new, partial definition, and it merges with the original, giving you a customized pipeline schema. It's useful when you need to adapt a standard pipeline for a specific use case without starting from scratch. The function returns the updated pipeline schema, ready to be used.

## Function overrideOutline

This function lets you update an outline schema within the system. Think of it as modifying an existing blueprint for how your AI agents organize their work. It's designed to be safe and predictable, making sure the update happens in a fresh environment and creating a record of the change if logging is turned on. You provide a partial outline schema with the changes you want to make, and this function applies those updates to the existing schema.

## Function overrideMCP

This function lets you modify an existing Model Context Protocol (MCP) schema. Think of it as updating or adding to a blueprint for how AI agents share information. You provide the original schema as a starting point, and the function returns a new, modified schema that incorporates your changes. It's useful when you need to adjust the structure of the data exchanged between agents.


## Function overrideEmbeding

This function lets you change how your AI agents understand and process information by adjusting the embedding schema. Think of embeddings as numerical representations of text – this function allows you to fine-tune those representations. You can provide a new or partial schema to update the existing configuration, essentially customizing how the agents interpret data. The change happens independently, ensuring a clean and isolated process, and the system will log this override if logging is active. You can provide only the parts of the schema you need to modify, rather than providing the entire schema again.

## Function overrideCompute

This function lets you modify existing compute schemas, which define how AI agents perform tasks. Think of it as a way to tweak and improve your agent workflows. You provide a partial schema – just the parts you want to change – and the function merges those changes with the original schema. This allows for flexible adjustments without having to redefine the entire compute schema from scratch. It's helpful for making small changes or experimenting with different approaches to agent computation.

## Function overrideCompletion

This function lets you modify how the system generates text completions. You can provide a new set of rules or tweak existing ones to control things like the length, style, or content of the text produced. It's designed to make these changes independently, ensuring the modification doesn't interfere with other ongoing processes. If you're tracking system activity, this override will be recorded. You only need to provide the parts of the completion schema you want to change; the rest will remain as they were.

## Function overrideAgent

This function lets you modify the setup of an agent already working within the swarm. Think of it as a way to tweak an agent's instructions or capabilities without disrupting its current tasks. You provide a new or updated blueprint, and the system applies those changes. It’s designed to be a safe operation, keeping things isolated so the changes don't interfere with other processes. If you have logging turned on, you’ll see a record of this modification happening. Essentially, it's for making adjustments to an agent's configuration after it's already been created.

## Function notifyForce

This function lets you send messages directly out of a swarm session without triggering any normal message processing. Think of it as a way to broadcast information to the agents involved. 

It’s specifically intended for sessions created using the "makeConnection" setup. 

Before sending the message, the system checks to make sure the session, the swarm, and the intended agent are all still working. It even works if an agent has been replaced during the session. The process creates a fresh environment and logs the activity if logging is enabled. Using it with any other session type will result in an error.

You provide the message content and a unique ID for the client sending the notification.

## Function notify

This function lets you send a notification message directly out of your AI agent swarm session, like a simple announcement. It’s specifically for sessions created using the "makeConnection" setup.

Think of it as a way to communicate something without triggering any of the usual message processing. 

Before sending the message, the system checks to make sure the session and the specified agent are still valid and active. It also sets up a clean environment for the communication and keeps a log of the operation, ensuring everything runs smoothly. Using this function with other session types isn't allowed.

You provide the message content, a unique client ID, and the name of the agent who should be sending the notification.

## Function markOnline

This function lets you tell the system that a particular client is now active and participating in a specific swarm. Think of it as confirming that a worker is ready to receive tasks. You’re essentially updating the system’s view of which clients are available within a designated group. To use it, you need to provide the unique ID of the client and the name of the swarm they belong to. This helps the orchestration framework know who's ready to contribute.

## Function markOffline

This function lets you tell the system that a particular client is no longer active within a specific swarm. Think of it as updating the system’s view of which agents are currently participating. You're essentially telling the framework, "This agent, identified by this ID, is no longer online in this swarm." It's useful for managing the agent pool and ensuring tasks are only assigned to active participants. You provide the client's unique ID and the name of the swarm it's part of to use this function.

## Function listenEventOnce

This function lets you set up a temporary listener for events happening within your AI agent swarm. It listens for a specific type of event, identified by a topic name and a client ID, and only triggers once when the event matches your defined filter. You provide a filter function to determine which events should be passed to your callback, and your callback receives the event's data. To prevent unwanted side effects, the callback is processed in a controlled environment, and the listener automatically cleans itself up after that single event – you're given a way to manually stop the listener early if needed. It prevents use of reserved event names.


## Function listenEvent

This function lets you tune in to specific messages being sent around your AI agent swarm. You tell it which client or all clients you want to listen to, and which topic – or message type – you're interested in. Whenever a message matching those criteria arrives, a function you provide will be automatically run, giving you access to the message's contents. Importantly, it gives you a way to later stop listening to those messages, ensuring you can clean up your listeners when they're no longer needed. There are certain message types you can't listen to, to keep things organized and prevent conflicts.

## Function json

This function lets you request and receive data formatted as JSON, following a predefined structure. Think of it as a way to ask for information and get it back in a predictable, machine-readable format. You specify which data structure you want using an "outline name," and you can also provide input parameters to customize the result. The function handles the behind-the-scenes work of making sure the process is clean and isolated. Essentially, it's your go-to method for consistently retrieving structured data.

## Function hasSession

This function quickly tells you whether an active session exists for a specific client. It's used to verify if a client is currently connected and authorized. Behind the scenes, it checks with the session management system to confirm the session's validity. You provide a unique client ID, and it returns `true` if a session is found, and `false` otherwise. If logging is turned on, the function will also record that it was called.

## Function hasNavigation

This function helps you determine if an agent is included in the navigation plan for a particular client. It essentially verifies if the agent is part of the intended route. 

Behind the scenes, it makes sure both the client and agent are valid, finds the relevant swarm they belong to, and then checks the navigation route to see if the agent is listed.  If logging is turned on in the system’s settings, this check will be recorded.

You'll need to provide the unique ID of the client and the name of the agent you want to check.

## Function getWiki

This function lets you fetch a specific wiki's structure and content details from the agent swarm. Think of it as looking up the blueprint for a particular wiki within the system. You simply provide the wiki's name, and the function returns all the information about it. The system will also keep a record of this request if logging is turned on.

## Function getUserHistory

This function lets you pull the user's interaction history for a particular session. It finds all the messages where the user was actively participating. Think of it as retrieving a record of what the user has said or done within a specific client session. You provide a unique ID to identify the session, and the function returns an array containing that user's history. This process is designed to run cleanly and is logged for tracking purposes if you’re configured to do so.

## Function getToolNameForModel

This function helps determine the specific name a model should use for a particular tool. It takes the tool's registered name, a client identifier, and the agent's name to figure out the right tool name for the model to use within that specific context. Think of it as translating a general tool name into something the model understands within a certain client and agent setup. It's the key function you’ll use when you want to make sure the model uses the correct tool name. You give it the tool’s identifier, the client's ID, and the agent’s name, and it returns the model-friendly tool name.

## Function getTool

This function helps you get the detailed description of a specific tool registered within your AI agent swarm. Think of it as looking up the blueprint for a particular tool – it tells you what capabilities the tool has and what kind of information it works with. You simply provide the tool's name, and the function returns a structured object outlining that tool's schema. If your system is set up for logging, this retrieval process will also be recorded.

## Function getSwarm

This function lets you fetch the configuration details – think of it as the blueprint – for a specific AI agent swarm. You provide the swarm's name, and it returns a structured object containing all the settings and information about that swarm. The system will also keep a record of this retrieval if logging is turned on in the overall settings. Essentially, it's how you get a detailed look at how a particular swarm is set up.

## Function getStorage

This function lets you fetch the details of a specific storage area within the AI agent swarm. Think of it as looking up the blueprint for how data is organized and stored. You provide the name of the storage you're interested in, and the function returns a description of its structure and the type of data it holds. If your system is set up to record activity, this operation will be logged for tracking purposes.

## Function getState

This function lets you grab a specific state definition from the system, identified by its name. Think of it as looking up the blueprint for a particular state within the agent swarm. It's useful when you need to know the structure and properties of a state, for example, to validate data or build interfaces. The system will also record that you requested this state if logging is turned on. You simply provide the name of the state you're looking for, and it returns the corresponding schema.

## Function getSessionMode

This function helps you find out what state a client session is currently in within your AI agent swarm. It takes a unique ID for the client session and returns its mode, which could be "session," "makeConnection," or "complete." 

Think of it as checking the status of a particular conversation or task. The system verifies the session exists and keeps a record of the operation if logging is turned on. It ensures the check runs cleanly, separate from any ongoing processes, to give you a reliable status update.


## Function getSessionContext

This function lets you peek into the current environment where your AI agents are working. It gathers important details like who initiated the work (client ID), which process is running, and what resources are available for your agents to use. Think of it as getting a snapshot of the current situation so your agents can operate effectively. It automatically figures out the client ID by looking at what's already set up, and doesn’t need you to provide it directly. It keeps a log of what it's doing, but doesn't actively check for errors or need any special inputs.

## Function getRawHistory

This function lets you access the complete, unfiltered history of a client's agent interactions. Think of it as getting the raw data, exactly as it was recorded during the session. 

You provide a unique ID for the client session, and the function returns an array containing all the messages exchanged. 

It’s designed to provide a pristine copy of the history, ensuring you're working with unaltered information. The system automatically handles checks and retrieves the necessary data to build this history array for you.

## Function getPolicy

This function lets you fetch a specific policy definition from the system, using its name. Think of it as looking up a recipe by its title. It's designed to give you the complete blueprint for how a particular policy should operate within the agent swarm. The system will also record that you requested this policy if logging is turned on. You provide the policy's name, and it returns the detailed policy schema.

## Function getPipeline

This function lets you fetch the definition of a specific pipeline from your AI agent swarm. Think of it as looking up the blueprint for how a particular task gets done. You provide the pipeline's name, and it returns a structured description of that pipeline. If your system is set up to log activity, this retrieval will be recorded.


## Function getPayload

This function lets you easily grab the data being passed around within the system. Think of it as fetching the current “message” or information being handled by an agent. If there's no data currently being processed, it will return nothing instead of throwing an error. It also quietly keeps a record of its activity if you’ve turned on logging.

## Function getNavigationRoute

This function helps you find the path an agent took within a swarm. It takes the client's ID and the swarm’s name as input. It then figures out the route by checking which agents were visited, returning this information as a list of agent names. Optionally, it can record this process based on system settings.

## Function getMCP

This function lets you fetch a specific Model Context Protocol (MCP) definition by its name. Think of it as looking up a blueprint for how an agent should behave within the swarm. It retrieves this blueprint from a central service that manages all the available MCPs. If your system is set up to track activity, this function will also record that you requested this MCP. You provide the name of the MCP you’re looking for as input, and it returns the full MCP definition.

## Function getLastUserMessage

This function helps you access the most recent message a user sent during a session. You provide a unique identifier for the specific user session, and it returns the text of their last message. If the user hasn’t sent any messages yet, or if there's an issue retrieving the history, it will return nothing. It's designed to be a straightforward way to get the latest user input within a client's interaction.

## Function getLastSystemMessage

This function helps you access the last message sent by the system within a specific client's conversation. It digs into the conversation history for that client and finds the most recent message marked as coming from the "system." If the system hasn't sent any messages yet, it will return nothing. To use it, you just need to provide the unique identifier for the client you're interested in.

## Function getLastAssistantMessage

This function helps you find the last thing your AI assistant said during a conversation with a specific user. It digs into the conversation history for that user, finds the most recent message where the assistant responded, and returns exactly what was said. If the assistant hasn't said anything yet in that conversation, it will return nothing. You need to provide the unique identifier for the user's session to use it.

## Function getEmbeding

This function lets you fetch details about a specific embedding that your AI agent swarm is using. Think of it as looking up the blueprint for how an embedding works. You provide the name of the embedding you're interested in, and the function returns a description of its structure and properties. This is helpful for understanding how embeddings are being used within the swarm and for debugging purposes. The system will also record that you requested this information if logging is turned on.

## Function getCompute

This function lets you fetch the details of a specific compute resource within your AI agent swarm. Think of it as looking up the blueprint for a particular worker. You provide the name of the compute you're interested in, and it returns all the information associated with that compute, like its capabilities and configuration. If your system is set up to record activity, this function will also log that you requested this information.

## Function getCompletion

This function lets you fetch a specific completion setup, identified by its name, from the central system managing those setups. Think of it as looking up a pre-defined recipe for how an AI agent should respond in a particular situation. The system will also keep a record of this lookup if you've configured it to do so. You provide the name of the completion you’re seeking, and it returns the complete configuration details.

## Function getCheckBusy

This function lets you peek at whether a specific client's group of AI agents is actively working on something. You provide a unique ID for the client, and the function will tell you, with a simple true or false, whether they’re occupied. Think of it as a quick way to see if a particular client's agents are currently processing tasks. It's helpful for coordinating requests and avoiding overloading busy clients.

## Function getAssistantHistory

This function lets you see the conversation history for a specific client session, focusing only on what the assistant has said. It pulls the complete history and then filters it to show just the assistant’s messages. You provide a unique identifier for the client session, and the function returns an array of messages representing the assistant's contributions to that session. It’s designed to run in a controlled environment and keeps track of its actions for monitoring purposes.

## Function getAgentName

This function lets you find out the name of the agent currently working on a specific client's tasks within your AI agent swarm. You provide the unique ID of the client session, and the function will return the agent's name. It handles the behind-the-scenes work, like making sure the client and swarm are valid, and ensures a clean execution environment. Essentially, it's a simple way to identify which agent is responsible for a client's activities.

## Function getAgentHistory

This function lets you access the conversation history for a particular agent in your AI swarm. It’s designed to pull the history relevant to that agent, taking into account any “rescue” strategies that might be in place to improve its performance. 

You’ll need to provide the unique identifier for the client session and the name of the agent you want the history for. The system checks that the client and agent are valid, records the request if logging is turned on, and then retrieves the history using the agent's specific prompt settings.  It's carefully set up to run independently, ensuring a reliable and clean execution.


## Function getAgent

This function lets you fetch the details of a specific agent within your AI agent swarm. You simply provide the agent’s name, and it returns all the information associated with that agent’s configuration. It’s designed to be straightforward, and will record its activity if your system is set up for logging. 


## Function fork

This function lets you run a piece of code – essentially a task – within a controlled environment. It takes a function you provide, which will be executed, and some settings to manage how that execution happens. The function you provide gets the client ID and agent name as input, allowing it to be tailored to the specific context. This function automatically handles the setup and teardown for the environment your code runs in, simplifying the process.

## Function executeForce

This function lets you directly send instructions to an agent within your swarm, acting as if the command came from a client. It's useful when you need to ensure a specific action happens, even if the agent isn’t actively working on something else, like when you're reviewing its output or starting a direct conversation.

You provide the message you want the agent to process, and a unique identifier for the client making the request. The system takes care of verifying the session, running the instruction, and tracking its performance. It creates a fresh environment for each execution, keeping things organized and providing helpful metadata.


## Function execute

This function lets you send messages or commands to a specific agent within a group of agents working together. Think of it as a way to have the agent process information or respond on behalf of a user. 

You tell the system what message to send, which user session it's coming from, and which agent should handle it. The system makes sure the agent is still available and running before sending the message, and keeps track of how long the process takes. It's designed to be a safe and reliable way to interact with the agents, ensuring a consistent environment for each interaction.

## Function event

This function lets your application send messages, called events, to the rest of the AI agent swarm. Think of it as a way to broadcast information – if one agent needs to tell others something, this is how it does it.

You provide a unique identifier for your application (the `clientId`), a name for the message topic (`topicName`), and the actual data you want to send (`payload`).

It’s important to choose a topic name that isn’t already reserved by the system, otherwise you'll get an error. The system handles the technical details of sending the event, ensuring it’s delivered properly.

## Function emitForce

This function allows you to directly send a string as output from the AI agent swarm, effectively acting as a direct message. It skips the usual processing of incoming messages and doesn't check which agent is currently active. 

It’s specifically intended for use with sessions created using `makeConnection` to ensure everything works together correctly. 

Think of it as a way to inject custom output into the swarm, but only within the context of a `makeConnection` session. It creates a fresh environment for the output, verifies the system's readiness, and won't work if you're not using a `makeConnection` session. The process is tracked in logs if logging is turned on.

You’ll need to provide the content you want to send and a unique identifier for the client sending it.

## Function emit

This function lets you send a string as output from an agent within the swarm, essentially mimicking what an agent would produce. It's specifically for use when you’re setting up a connection, ensuring the agent is still active and part of the swarm before sending the output.  The function checks to make sure the connection is valid and the agent hasn’t been replaced, and it ensures the environment is clean when sending the message. You provide the content you want to send, a unique ID for the client sending it, and the name of the agent that should be associated with the output.

## Function commitUserMessageForce

This function allows you to directly add a user's message to the agent's conversation history within a swarm session. It's a way to record what the user said without automatically prompting the agent to respond. Think of it as manually updating the record of the conversation.

It works by directly sending the message to the swarm session, and it doesn’t worry about whether the agent is currently active.  

You're providing the message content, the execution mode, a client identifier to track the session, and optionally, some extra data. The function takes care of ensuring the session is valid and records the action in the logs if logging is turned on.  It’s designed to execute in a self-contained way, preventing interference from other ongoing processes.

## Function commitUserMessage

This function lets you add a user's message to an agent's record within a swarm session, essentially keeping a log of the interaction. It's useful when you want to track what users are saying without immediately prompting the agent to respond. 

The function ensures the agent is still participating in the swarm and performs checks to make sure everything is set up correctly. It also includes logging to help you monitor what's happening. You provide the message content, the execution mode, a client identifier, and the agent’s name to specify where the message should be added. Optionally, you can include additional data in a payload.

## Function commitToolRequestForce

This function lets you directly send tool requests to the agent swarm, essentially forcing the action to happen. It skips some usual checks and confirmations, so use it with care. You're telling the system to execute these requests right away, associating them with a specific client. Behind the scenes, it handles things like setting up the execution environment and keeping track of what's happening through logging. The function returns an array of strings representing the results of committing each tool request.

## Function commitToolRequest

This function sends tool requests to a specific agent within the swarm. It makes sure the agent is valid and the session is active before processing the requests. Think of it as securely delivering instructions to an agent, keeping track of the process and making sure everything is properly logged along the way. You provide the requests, a client identifier, and the agent's name, and the function handles the rest, returning a confirmation.

## Function commitToolOutputForce

This function lets you directly push the result of a tool's work into the agent's process, regardless of whether the agent is currently active. It's designed to forcefully commit the tool output to the session, taking care of some behind-the-scenes checks and logging. 

Think of it as a way to ensure the agent has the latest information from a tool, even if there’s a potential issue with the agent's current state.

You'll need to provide the tool's ID, the actual output from the tool, and the client ID to identify the session. The system handles the rest, ensuring everything is logged and processed correctly.


## Function commitToolOutput

This function helps agents in a swarm share the results of using tools. It's how an agent tells the system, "Hey, I just finished using this tool and here's what I got!"

Think of it as a secure way to pass information between agents, making sure the message gets to the right place and isn’t lost along the way.

Before the tool's output is officially recorded, the system double-checks that the agent is still allowed to be making changes and that everything is in order.

You need to provide the tool's ID, the actual results of the tool's work, a unique ID for the client session, and the agent's name when using this function.

## Function commitSystemMessageForce

This function lets you directly push a system message into a session, bypassing the usual checks for an active agent. It's useful when you need to ensure a system message is recorded, regardless of the current agent's status. 

Think of it as a way to guarantee a message is logged for system control or updates.

It works by verifying the session and the overall swarm system, then directly commits the message.  The function handles the necessary background processes, like managing the execution environment and logging everything that happens.

You provide the message content and the client ID, and the function takes care of the rest, ensuring the message gets recorded. This is a more forceful approach compared to standard message committing, prioritizing system-level message persistence.

## Function commitSystemMessage

This function lets you send system messages to a specific agent within the swarm. Think of it as a way to communicate important instructions or updates directly to an agent, like setting its configuration or giving it a control signal. 

It carefully checks that the agent, its session, and the overall swarm are all valid and that you're targeting the right agent before sending the message.

It's designed to handle messages that aren't typical responses from an assistant, such as initial setup or adjustment commands. 

You'll need to provide the message content, the client's ID, and the agent's name to use this function.

## Function commitStopToolsForce

This function provides a way to immediately halt tool execution for a particular client within the system. It's a forceful stop – meaning it doesn’t worry about which agent is currently running things. 

Think of it as a way to quickly put a pause on a client’s actions, bypassing usual checks to ensure a swift interruption.

It makes sure the session and swarm are valid before proceeding, and it uses several services to manage the process, including verifying the client's ID. This is similar to how a forceful flush operates, offering a more immediate response than a standard stop.


## Function commitStopTools

This function lets you temporarily pause the next action an agent takes for a particular client. Think of it as putting a brief hold on the agent's work.

It makes sure everything is in order – the client, the agent, and the overall system – before stopping the tool execution. This is different from clearing an agent's history; it just prevents the *next* tool from running.

You provide the client's ID and the agent’s name to tell the system which agent to pause. The function handles all the necessary checks and logging behind the scenes to ensure the pause is applied correctly.

## Function commitFlushForce

This function lets you aggressively clear the history for a particular client within the system. It’s designed to force a flush of agent history, even if an agent isn't currently active or if there are issues with the session. 

Think of it as a more forceful version of a regular history flush. 

It handles verifying the session and swarm before proceeding, and it uses several internal services to manage the process, including session validation, swarm validation, history flushing, and logging. The `clientId` tells the function exactly which client's history to clear.

## Function commitFlush

This function lets you completely wipe the history of a specific agent for a particular client. Think of it as a reset button for an agent's memory within the system. It carefully checks that the agent and client you’re targeting actually exist and are allowed to be modified. It’s used to clear out an agent’s past actions, offering an alternative to simply adding new messages – providing a clean slate for future interactions. You specify the client ID and the agent's name to pinpoint exactly which agent's history needs to be cleared.


## Function commitDeveloperMessageForce

This function lets you directly add a developer-created message to a session within the AI agent swarm, even if the system doesn't think it's the right time or agent to do so. It's designed for situations where you need to override the normal process, like when a developer needs to manually adjust a session's history. 

It ensures the session and swarm are valid before adding the message, and it handles logging the operation for tracking purposes. Think of it as a way to force a message in, similar to how you might force an assistant's message in, but specifically for developer actions. You'll need to provide the message content and the ID of the client associated with the session.

## Function commitDeveloperMessage

This function lets you send messages directly to a specific agent within the swarm, like giving it a precise instruction or clarifying a task. It makes sure the agent, session, and the entire swarm are all set up correctly before the message is sent. 

Think of it as a way to provide targeted guidance to an agent – this is useful for developer input or very specific user requests. The function works behind the scenes to handle the technical details of sending and logging the message, ensuring everything is done securely and accurately. 

You'll need to provide the content of your message, the client ID, and the name of the agent you’re addressing.


## Function commitAssistantMessageForce

This function lets you directly push a message from an assistant into a session, bypassing the usual checks for which agent is currently active. It's useful when you need to ensure a message is recorded, even if the system isn't expecting it.

The function first makes sure the session and swarm are valid before adding the message. 

You provide the message content and a client ID to identify the session. Think of it as a more forceful version of a standard message commit – similar to how `cancelOutputForce` works compared to `cancelOutput`. It handles logging and session management behind the scenes.

## Function commitAssistantMessage

This function lets you record messages generated by an AI agent within the system. It ensures that the agent you're referencing actually exists and is part of a valid session before saving the message. Think of it as a way to permanently store the agent's responses, providing a record of its actions. 

You provide the message content, a client identifier to link the message to a specific user or process, and the agent's name. The system handles the behind-the-scenes work of checking everything is correct and keeping track of the message securely. It's designed to work alongside features that might cancel or modify output, providing a way to preserve the assistant's contributions.


## Function changeToPrevAgent

This function lets you switch back to a previously used agent for a specific client. Think of it as a "back" button for agent selection. If there’s no previous agent to go back to, it will automatically switch to the default agent instead. It makes sure the session and agent are valid, records what's happening if logging is turned on, and handles the change carefully to ensure smooth operation. The client ID is needed to identify which session the change applies to.

## Function changeToDefaultAgent

This function lets you easily revert a client's agent back to the standard, pre-configured agent within the swarm. Think of it as a reset button for an agent assignment. It takes a client identifier to specify which session to adjust. The system checks to make sure the session and default agent are valid, records what's happening if logging is turned on, and then handles the change carefully to ensure it's performed reliably. It's designed to be a clean and safe way to manage agent assignments.

## Function changeToAgent

This function lets you switch which AI agent is actively working on a client's session within your swarm. It's designed to safely change agents, making sure everything is properly validated and logged. The change happens in a controlled way, using a queued process that ensures it's handled promptly but without interrupting other tasks. To make the transition smooth, the operation is executed in a dedicated context, separate from any ongoing work. You provide the name of the agent you want to use and the unique ID of the client session.

## Function cancelOutputForce

This function lets you immediately stop an AI agent from sending further output for a specific client. It’s a forceful way to cancel ongoing responses, bypassing checks to see if an agent is actively working.

It verifies that the client's session and the swarm are valid before proceeding with the cancellation.

Think of it as a "hard stop" button for a client’s interaction, useful when you need to interrupt a response quickly, regardless of the agent’s current state.  You provide the client's unique identifier to tell the system which interaction to cancel.

## Function cancelOutput

This function lets you stop an agent from continuing to generate a response for a particular client. Think of it as a way to interrupt the agent’s work.

It makes sure the agent and the client are valid before proceeding.

Behind the scenes, it’s carefully managed, ensuring everything runs smoothly and keeping track of what's happening through logging.

You’ll need to provide the client’s ID and the agent’s name to tell the system exactly which output to cancel.


## Function addWiki

This function lets you define and integrate new knowledge bases into the agent swarm. You provide a structured description of your wiki – essentially, the layout and content guidelines – and the system adds it to its available resources. Think of it as registering a new source of information for the agents to learn from. The function returns a unique identifier for the newly added wiki.

## Function addTriageNavigation

This function helps you set up a way for your AI agents to easily connect with a dedicated triage agent when needed. It essentially creates a navigation tool that guides an agent to the right person for assistance. You provide some configuration details through the `params` object, and the function takes care of registering the navigation tool so it’s ready for use. Think of it as building a streamlined pathway for your agents to seek expert help.

## Function addTool

This function lets you add new tools that your AI agents can use. Think of it as expanding the agents’ toolkit so they can handle more diverse tasks.  When you register a tool using this function, the entire swarm system becomes aware of it and agents can start utilizing it. It’s how you tell the system, "Hey, there's a new capability available!" The system ensures the tool registration happens cleanly, independent of any ongoing operations and then gives you the tool's name to confirm it’s been added. You provide a schema that defines what the tool does and how it works.

## Function addSwarm

This function lets you create a new group of agents, which we call a swarm, within the system. Think of it as defining a blueprint for how your agents will work together and handle client interactions. When you register a swarm this way, you're essentially telling the system, "Here's a new way to manage agents and sessions." The system will only recognize swarms created using this specific function, and it ensures a fresh start when adding them. You’ll get the swarm’s name back as confirmation it's been successfully registered.


## Function addStorage

This function lets you register a new way for your AI agents to store and retrieve data, like a custom database or file system. Think of it as adding a new tool to the swarm’s toolbox.  Only storage engines registered this way are recognized by the system, so it’s essential for ensuring data consistency. If the storage is designed to be shared between agents, this function will automatically set up the necessary connection and wait for it to be ready. This process happens in a special, isolated environment to keep things running smoothly. Finally, it gives you the name of the storage you just added, so you can easily reference it later.

## Function addState

This function lets you define and register new states that your AI agents can use and share. Think of it as adding a new type of data container to the system. 

Only states registered this way will be recognized by the swarm, so it's essential for setting up the data your agents work with. If a state is designated as shared, this function also handles connecting to and waiting for the shared state service to be ready. It ensures a clean and isolated environment when registering the state. Finally, it gives you the state's name as confirmation that it’s been added. You'll provide a schema describing the state's structure and properties when you call it.

## Function addPolicy

This function lets you define and register rules, or policies, for your AI agents. Think of it as setting up the guidelines that agents will follow when interacting within the swarm. It essentially tells the system what a valid policy looks like, making sure it's properly formatted and can be used later. The system takes care of registering the policy for validation and schema management, while also keeping a record of the operation through logging. It's a crucial step in configuring the swarm, allowing you to shape agent behavior proactively. 

The function takes a `policySchema` as input, which describes the specifics of the policy you're adding.

## Function addPipeline

This function lets you define and register a new workflow, or "pipeline," that your AI agents will use. Think of it as creating a blueprint for how your agents should work together to accomplish a task. When you register a pipeline, the system checks to make sure it’s set up correctly. The function returns a unique identifier for the pipeline, so you can easily refer to it later. This identifier is how you'll tell your agents which workflow to follow.

## Function addOutline

This function lets you add a new outline structure to the AI agent swarm. Think of it as defining a template or blueprint that the agents will follow for a specific task. 

It safely registers the outline, making sure it doesn't clash with anything already set up. The function also keeps track of what’s happening, providing logs if you're using the logging feature.

You provide the outline schema itself – this schema tells the system what the outline is called and how it should be configured.

## Function addMCP

This function lets you add a new Model Context Protocol (MCP) schema to the orchestration system. Think of MCPs as blueprints for how AI agents share information and context with each other. When you add a schema, you're essentially defining a new way for agents to communicate and collaborate. The function returns a unique identifier for the registered schema, so you can refer to it later. You'll provide the schema details as an argument to this function.

## Function addEmbedding

This function lets you add new ways to generate embeddings – think of them as numerical representations of text or data – to the system. When you add an embedding using this function, the swarm knows how to use it for tasks like finding similar content. It's essential to register your embeddings this way for them to be recognized. The process is handled in a way that keeps things clean and separate from other ongoing operations, and it tells you the name of the embedding you just added. You'll need to provide a schema that details the embedding's name and how it's configured.

## Function addCompute

This function lets you define and register the blueprints for your AI agents’ tasks. Think of it as creating a standardized way to describe what an agent needs to do – what inputs it takes, what outputs it produces, and any specific logic involved. When you register a compute schema using this function, it verifies that your definition is correct and stores it for later use in orchestrating your agent swarm. Essentially, it’s a key step in setting up a reliable and organized framework for your AI agents. The function returns a unique identifier for the registered schema, allowing you to easily reference it when assigning tasks to agents.

## Function addCompletion

This function lets you register a new completion engine, like connecting your swarm to a specific AI model or service. Think of it as adding a new tool to the agents' toolkit for generating text. 

You provide a schema that describes how this new engine works, including its name and any settings it needs. 

The system then makes this engine available for agents to use, and registers it properly. The process is isolated to keep everything running smoothly. Finally, the function tells you the name of the engine you just added.

## Function addAgentNavigation

This function lets you build a tool that allows one AI agent to actively navigate and interact with another agent within the swarm. Think of it as creating a pathway for agents to find and communicate with each other. You provide some configuration details, and the function sets up the navigation tool, essentially registering it so it's ready to be used. This facilitates a more dynamic and interconnected agent system.

## Function addAgent

This function lets you register new agents so they can participate in your AI agent swarm. Think of it as formally introducing a new member to the team.  You provide a description of the agent – its name and how it’s configured – and the system adds it to its list of available agents.  Only agents registered this way can be used by the swarm, so it’s a necessary step for any new agent. The process ensures a clean start for the registration, and the function will confirm the agent's name after it's successfully added.


# agent-swarm-kit classes

## Class WikiValidationService

This component, the WikiValidationService, helps you manage and verify the structure of your wikis. Think of it as a gatekeeper ensuring your wikis conform to expected formats.

You start by defining the structure of each wiki you want to validate – essentially, telling the service what a "good" wiki looks like. This is done through the `addWiki` method.

Then, when you have content you want to check, you use the `validate` method. It takes the wiki's name and the content as input, and it confirms that the content matches the pre-defined structure you established.  The `loggerService` property provides access to logging functionality for tracking the validation process.  The internal `_wikiMap` holds the wiki schema information.

## Class WikiSchemaService

This service helps manage and work with the structure of your wiki data – essentially, the blueprints for how the information is organized. It uses a context service to understand the schema and keep track of changes. 

You can think of it like a central repository where you store and organize different wiki schema templates. The `register` method lets you add new templates, and `override` allows you to update existing ones. Need to grab a specific template? The `get` method will retrieve it for you. It also includes a way to quickly check if a new schema meets basic requirements.

## Class ToolValidationService

This service helps ensure that the tools used by your AI agents are properly configured and registered within the system. It keeps track of all the tools the swarm knows about, preventing duplicates and making sure they exist before they're used.

It works closely with other parts of the system – the tool registration service, the agent validation process, and the clients using the tools – and uses logging to keep you informed about what's happening. To improve performance, it remembers the results of previous validation checks, so it doesn't have to repeat the same work.

You can add new tools and their configurations to this service, and it will handle ensuring they're unique. The `validate` function then checks if a tool exists when an agent tries to use it.

## Class ToolSchemaService

This service acts as a central place to manage and organize the tools that agents use to perform tasks within the swarm. Think of it as a library of pre-defined actions agents can take. It makes sure these tools are set up correctly before they're used, checking for essential components like the action itself, how to validate input, and any associated metadata.

It works closely with other services, like the one that manages agent definitions and the connections to agents, ensuring that everything is consistent and working together. You can register new tools, update existing ones, and easily retrieve them when needed. All these actions are tracked with logging to help understand how the system is working. Ultimately, it provides a reliable foundation for agents to execute tasks effectively.

## Class ToolAbortController

This class provides a simple way to control and manage the process of stopping asynchronous tasks, similar to how you might pause a download. It creates and handles signals that tell those tasks to stop.

It internally uses the standard `AbortController` which is a feature of modern web browsers and environments, but if that's not available, the class gracefully handles that situation.

You can use the `abort` method to actively stop any task that’s listening for these stop signals. Essentially, it's a way to cancel ongoing processes.

## Class SwarmValidationService

The Swarm Validation Service acts as a central authority for ensuring your swarm configurations are correct and consistent. It keeps track of all registered swarms, making sure each one is unique and properly set up.

Think of it as a quality control system. When you add a new swarm or modify an existing one, this service verifies things like the agent list and associated policies are valid. It works closely with other services to handle agent and policy checks, session management, and logging.

The service is designed to be efficient, using caching to avoid unnecessary validation checks. You can use it to get lists of swarms, agents, or policies associated with a particular swarm, or to perform a full validation of a swarm’s configuration. This helps maintain a reliable and secure environment for your AI agents.

## Class SwarmSchemaService

This service acts as a central place to manage the blueprints for how your AI agent swarms are configured. Think of it as a library where you store and retrieve the rules and settings that define a swarm—things like which agents are involved, their roles, and the policies they follow.

Before a swarm can be used, these blueprints are checked for basic correctness to make sure everything is set up right.  The service keeps track of these blueprints using a specialized registry, ensuring efficient access and consistency.

You can register new swarm configurations, update existing ones, and retrieve them whenever needed.  This service works closely with other parts of the system, like the agent connection service and policy management, to make sure everything works together seamlessly.  It also keeps a record of its actions, logging important events when enabled.

## Class SwarmPublicService

This service acts as a public gateway for interacting with a swarm of AI agents. It provides methods for common operations like sending messages, managing the order of agent execution, checking the swarm's status, controlling output, and disposing of the swarm – all while keeping track of who’s doing what and for which swarm. Think of it as a controlled way for external components to tell the swarm what to do and receive information back.

It's built to be flexible, using logging to provide insight into what's happening and delegating underlying tasks to other specialized services. This helps keep things organized and ensures consistent behavior across the system.

Here's a breakdown of what you can do:

*   **Send messages:** Easily broadcast messages to the swarm for a specific client.
*   **Manage Execution Order:** Control the order in which agents are executed within the swarm.
*   **Check Status:** Determine if the swarm is currently busy processing a task.
*   **Control Output:** Cancel or wait for output from the swarm.
*   **Access Agent Information:** Get the name or full details of the currently active agent.
*   **Manage Agents:** Set the current agent or dispose of the entire swarm.



All of these actions are carefully tracked and logged, providing valuable information for debugging and monitoring.

## Class SwarmMetaService

This service acts as a central hub for understanding and visualizing your swarm system. It takes information about your swarms – their structure, agents, and how they relate – and transforms it into a clear, diagram-friendly format using UML.

Think of it as a translator that converts the technical details of your swarm into a visual representation that’s easier to grasp. It builds a tree-like structure representing your swarm and its components, making it simpler to document, debug, and understand the overall architecture.

The service relies on other services within the system to gather information about swarms and agents, and it keeps track of important logging information for debugging. Ultimately, it produces UML diagrams that provide a quick and intuitive overview of your swarm’s design.

## Class SwarmConnectionService

This service manages how different parts of the system connect to and interact with swarms – think of it as a central hub for swarm operations. It efficiently reuses swarm connections by caching them, reducing overhead. 

It's integrated with several other services, like those handling agents, sessions, and performance tracking, ensuring consistent behavior across the system. The service uses logging to provide insights into what's happening and integrates with the system's event bus for communication.

Here's a breakdown of what you can do with it:

*   **Get a Swarm:** Retrieve or create a connection to a specific swarm based on a client and swarm name.
*   **Send Messages:** Broadcast messages to a session.
*   **Navigate:** Pop the navigation history within a swarm.
*   **Check Status:** See if a swarm is currently busy with a task.
*   **Control Operations:** Set a swarm's busy state, cancel pending output, wait for output from an agent, and more.
*   **Inspect Agents:** Retrieve the name or the actual agent object currently active in the swarm.
*   **Manage Agents:** Add or change agents within the swarm.
*   **Clean Up:** Properly disconnect from a swarm.

## Class StorageValidationService

This service acts as a central authority for making sure the storage configurations used by your AI agent swarm are set up correctly and consistent. It keeps track of all registered storage types and their details, making sure each one is unique and properly configured.

Whenever a new storage is added to the system, this service registers it and verifies that it's not already registered.

When you need to confirm a storage is valid, this service performs checks, including verifying the storage exists and that its embedding settings are correct. This ensures reliable operations and helps prevent errors related to storage issues. The service is designed to be efficient by remembering the results of previous validations.

## Class StorageUtils

This class provides tools for managing data storage associated with specific clients and agents within the swarm. Think of it as a helper for interacting with the swarm's storage system.

You can use it to retrieve a limited set of data based on a search term, insert or update data, delete individual items, or retrieve a single item by its ID.  It also allows you to list all items in a storage space, optionally filtering them.

The class also provides a method to create a numeric index for a storage space, which essentially counts the number of items currently stored. Finally, you can use it to completely clear the contents of a particular storage space.

Before any action is taken, the class checks to make sure the client is authorized, the storage name is valid, and that the agent is registered to use that storage. All actions are also logged for tracking and auditing.

## Class StorageSchemaService

This service acts as a central hub for managing how your AI agents interact with different storage systems. It keeps track of storage configurations, making sure they're set up correctly and consistently across your swarm.

Think of it as a librarian for storage blueprints – each blueprint (a storage schema) describes things like how to index data and where to find related information. This service validates those blueprints and provides a reliable way to access them.

It works closely with other services like those handling storage connections, agent configurations, and public APIs, ensuring everything talks to each other smoothly. Logging is used to monitor these processes, which can be enabled or disabled to manage verbosity.

The service lets you register new storage configurations, update existing ones, and easily retrieve them when needed. This ensures your agents have the right instructions for using storage effectively.

## Class StoragePublicService

This class manages storage specifically for each client within the swarm system, keeping their data separate and secure. Think of it as a personal storage space for each client. It's designed to work closely with other components like ClientAgent and PerfService, tracking usage and providing a public API for storage operations.

The service uses a LoggerService for detailed logging (when enabled) to keep track of what's happening with client storage. It provides common operations like retrieving, adding, updating, deleting, listing, and cleaning out storage for each individual client. This contrasts with system-wide storage that is accessible to everyone.

Here’s a breakdown of what you can do with this class:

*   **Retrieve data:** Find specific items or lists of items based on searches and filters.
*   **Add or update data:** Insert new items or modify existing ones within a client's storage.
*   **Delete data:** Remove items from a client’s storage.
*   **List all data:** Get a complete list of all items stored for a specific client.
*   **Clear all data:** Completely empty a client's storage.
*   **Dispose of storage:** Clean up resources associated with a client’s storage.

## Class StorageConnectionService

This service acts as a central point for managing how your AI agent swarm interacts with storage. It handles creating connections to specific storage areas for each client, making sure things are efficient by reusing those connections when possible. It also takes care of shared storage, delegating those operations to another service.

Think of it as a librarian – it knows where to find different books (storage) for different readers (clients), and makes sure those books are used wisely. It also works closely with other services to ensure everything is configured properly, events are tracked, and resources are cleaned up when no longer needed. It remembers frequently accessed storage to avoid repeatedly establishing connections, improving performance.  If you’re looking for data, updating data, or just want to wipe everything clean, this service coordinates that process.

## Class StateValidationService

This service helps manage and verify the structure of data used by your AI agents. Think of it as a quality control system for agent states.

You can use it to define what the expected format of each agent's state should be—for example, if an agent is managing a shopping list, this service can ensure the list always contains the right kind of information.

It lets you register different "states" with their specific structures and then validates data against those definitions. The `addState` method is how you register a new state, and the `validate` method checks if the data matches what you’re expecting. The `loggerService` property gives you a way to track what’s happening behind the scenes for debugging.

## Class StateUtils

This class helps keep track of information specific to each client and agent within the swarm. It provides simple ways to look up, update, and reset this data. 

You can use it to get a piece of state using the `getState` method, providing the client ID, agent name, and the name of the state you’re looking for. 

To change a piece of state, use `setState`; it lets you set a new value directly or update it based on the existing value. 

Finally, if you need to completely remove a specific state, the `clearState` method will reset it to its default. The class ensures that everything is handled correctly and securely within the swarm's environment.

## Class StateSchemaService

The StateSchemaService acts as a central place to manage and keep track of the blueprints for how your AI agents handle data, called state schemas. Think of it as a directory where each entry describes how an agent should read, write, and process specific data.

It makes sure these blueprints are consistent by performing basic checks when they're added or updated.  It works closely with other services involved in setting up and running agents, like those handling connections, agent execution, and public state APIs.

You can register new schema blueprints, retrieve existing ones, and even update them if needed. The service keeps a record of these schemas, and uses logging to keep track of what's happening. It’s a foundational component for defining how client-specific and shared states function within the entire AI agent system.

## Class StatePublicService

The StatePublicService manages state specifically tied to individual clients within the swarm system. Think of it as a way to keep track of information unique to each client, distinguishing it from system-wide or persistent storage. It provides a public interface for actions like setting, clearing, retrieving, and cleaning up this client-specific state.

This service works closely with other components like ClientAgent to handle client state during execution, and PerfService to monitor state changes. Logging is enabled for detailed tracking of operations, helping to understand how state is being managed. It's designed to provide a clean and controlled way to work with client-specific data within the overall swarm orchestration.

## Class StateConnectionService

This service manages how different parts of the system interact with and store state information for agents. It's responsible for creating, retrieving, and updating state, and making sure these operations are handled safely and efficiently.

Think of it as a central hub for state, where requests for state data are routed to either client-specific state or to a shared state management system. It remembers commonly used state instances to avoid unnecessary creation, and coordinates with other services to handle configuration, usage tracking, and cleanup. Importantly, it serializes state updates to prevent conflicts and ensure data integrity.



The service relies on several other components to function properly. It receives information and uses configurations from services for logging, events, state schemas, session validation, and shared state management. When a piece of state is needed, it either creates a new instance or retrieves a previously created one. State changes are carefully managed to be safe and consistent across the system. Finally, when a state is no longer needed, this service cleans up the related resources.

## Class SharedStorageUtils

This class offers helpful tools for working with shared data across your agent swarm. You can use it to fetch data based on a search query, add or update items in storage, and remove specific items by their unique ID. It also allows you to retrieve individual items, list all items (with the option to filter them), and completely clear out a storage area. Each of these operations is handled securely and reliably, with checks to ensure everything is working correctly within the swarm's environment.

## Class SharedStoragePublicService

This service manages access to shared storage within the swarm system, acting as a public interface for interacting with that storage. It handles operations like retrieving, updating, deleting, and listing items.

It uses other services for core storage functionality, logging, and context management, ensuring consistent behavior across the system.  You're able to fetch data based on search terms, add or update items, remove specific items, retrieve individual items, list all items (optionally filtered), or completely clear a storage area. Different components like ClientAgents and performance tracking services rely on this service to manage data storage. It's designed to keep track of these operations through logging when enabled.

## Class SharedStorageConnectionService

This service manages shared storage for the swarm system, acting as a central point for accessing and manipulating data across all clients. Think of it as a shared whiteboard where different agents can read and write information.

It uses a clever caching system to ensure that only one copy of each storage area exists, preventing confusion and conflicts.  It gets its configuration from other services, enabling features like embedding data for similarity searches.

Here's a breakdown of what you can do with it:

*   **Get Storage:**  It provides a way to access a specific storage area, creating one if it doesn't already exist.
*   **Take (Search):**  Allows you to retrieve a list of data based on a search query and a desired total count, with the option to prioritize similar items.
*   **Upsert:**  Adds new data or updates existing data within the shared storage.
*   **Remove:**  Deletes data from the shared storage.
*   **Get:** Retrieves a single piece of data by its unique ID.
*   **List:**  Retrieves a list of data items, optionally filtering them based on specific criteria.
*   **Clear:**  Wipes the entire shared storage clean.

The service logs its actions and coordinates with other parts of the system to ensure everything works together smoothly.

## Class SharedStateUtils

This class offers simple tools for your agents to share information within the swarm. Think of it as a central whiteboard where agents can read, write, and erase data. 

You can use `getState` to fetch existing information from the whiteboard by name. To update the whiteboard, use `setState`, which allows you to either directly set a new value or provide a function that lets you calculate the new value based on what’s already there. Finally, `clearState` lets you wipe the whiteboard clean for a specific piece of shared data. Each operation is handled carefully with logging to keep track of what's happening within your agent swarm.

## Class SharedStatePublicService

This service handles interactions with shared data across your swarm system. It provides a way to manage and access shared state, making it easy for different parts of the system to communicate and coordinate. Think of it as a central hub for shared information.

It allows you to set new values for shared data, clear existing data, and retrieve current values. When enabled, it also keeps a log of these operations for debugging and monitoring. Different components like ClientAgent and PerfService rely on this service to manage state effectively, ensuring everyone is working with the correct information. It's designed to be flexible and adaptable, working with different types of data through its generic type support.

## Class SharedStateConnectionService

This service manages shared state across all agents in your swarm. Think of it as a central repository for data that needs to be consistent and accessible to everyone. It provides a way to create, access, and modify this shared data, ensuring everyone is working with the same information.

The service uses caching to optimize performance and guarantees that updates are handled safely, preventing conflicts. It's designed to work closely with other components like agent execution, state configuration, and event handling, providing a cohesive approach to shared state management.

Key functions let you:

*   **Retrieve existing or create new shared state:**  It intelligently manages the creation of these shared state instances, ensuring only one exists for each name.
*   **Update the shared state:** You can define how the state changes, and it handles the process safely.
*   **Clear the shared state:**  Reset the shared state back to its original settings.
*   **Get the current state:** Allows agents to access and use the latest version of the shared data.

## Class SharedComputeUtils

This toolkit provides utilities for managing shared computing resources within the AI agent swarm orchestration framework. 

The `SharedComputeUtils` class offers a way to interact with these resources. You can use it to refresh the status of a specific compute resource using the `update` function, providing the compute resource's name. 

To retrieve information about a compute resource, use `getComputeData`, specifying the client ID and the compute resource's name. This function fetches data and returns it in a generic format, allowing you to work with various types of compute data.

## Class SharedComputePublicService

This component manages access to shared computing resources for your AI agents. It acts as a central point to retrieve data and trigger calculations across those resources. 

Think of it as a facilitator – it lets your agents request specific data (`getComputeData`) and initiate calculations (`calculate`) on shared computational units. You can also use it to update the state of those computing resources (`update`). The `loggerService` allows you to track what's happening, and the `sharedComputeConnectionService` handles the underlying communication with the compute resources.

## Class SharedComputeConnectionService

This class helps your AI agents connect and share resources, acting as a central hub for them to work together. It manages how agents access and use shared computing power. 

Think of it as a system for routing requests to the right computing resources and keeping track of what's happening. 

The `getComputeRef` function lets you easily get a reference to a specific computing resource by name, while `getComputeData` retrieves data associated with it. You can trigger calculations and updates using the `calculate` and `update` methods, respectively. The class also includes internal tools for logging, communication, and managing context to ensure everything runs smoothly.


## Class SessionValidationService

This service keeps track of sessions and how they're being used within your AI agent swarm system. It's like a central record-keeper, ensuring everything is consistent and accounted for.

It monitors which swarms, agents, storage, states and computes are connected to each session, making sure everything is linked correctly. It works closely with other services like session management, agent tracking, and storage handling.

You can register new sessions, track which agents are using them, and remove sessions when they're no longer needed. There are methods for getting lists of sessions, agents associated with a session, and checking if a session exists. It uses logging to keep a record of what's happening and memoization to speed up common checks. This helps to ensure that sessions are managed cleanly and efficiently.

## Class SessionPublicService

This service acts as the main entry point for interacting with AI agent sessions within the swarm system. It provides a simplified way to send messages, execute commands, and manage session state, all while ensuring proper context and logging.

Think of it as a facilitator that handles requests like sending messages, running commands, or committing tool output to the session. It relies on other services to perform these actions and keeps track of what's happening for performance tracking and troubleshooting.

The service uses a layered approach, wrapping core operations with context information and logging to ensure everything runs smoothly and can be monitored.  It allows client agents to seamlessly interact with sessions, send data, and receive responses, all while maintaining consistent logging and system awareness.



It’s designed for things like:

*   Sending messages to an active AI agent session.
*   Executing commands within a session.
*   Committing messages (user, assistant, developer, system) to the session history.
*   Stopping the execution of tools.
*   Disposing of the session when it’s no longer needed.

## Class SessionConnectionService

This service manages connections for AI agent sessions within a larger swarm system. Think of it as a central hub for creating and maintaining these individual conversation or task contexts.

It intelligently reuses session data to avoid unnecessary setup, leveraging caching to improve performance. When you need a session for a client and swarm, this service handles creating it if it doesn't exist, and retrieving it if it does.

It plays a crucial role in coordinating different parts of the system – like running agent code (ClientAgent), applying security policies, accessing configuration data, and tracking performance.  It makes sure messages are sent and received properly, and it handles the execution of commands and other actions within those sessions.  Importantly, it provides a standardized way for different components to interact with sessions, ensuring consistency and reliability across the whole system. Finally, it handles clean-up and resource management when a session is no longer needed.


## Class SchemaUtils

This class helps manage how data is stored and formatted within your agent swarm's sessions. Think of it as a helper for keeping track of information related to each client interacting with your system.

It provides simple ways to save data (writeSessionMemory) and retrieve it (readSessionMemory) for specific clients, making sure that the system is properly handling each session. 

You can also use it to convert objects and arrays into neatly formatted strings (serialize), which can be useful for logging or transmitting data. It can even handle complex, nested objects and allows you to customize how keys and values are presented in the formatted string.

## Class RoundRobin

This class provides a simple way to distribute requests across a set of different "creators," like different AI agents or services. Think of it as a rotating selector – it cycles through a list of tokens and uses each one to create something, ensuring that no single creator is overwhelmed. 

You can easily create a RoundRobin instance, providing a list of tokens and a function that knows how to use each token to produce a desired result. This is helpful when you need to balance the workload or vary the approach for each task. 

The `create` method provides a convenient way to generate a ready-to-use RoundRobin function, taking your list of tokens and a "factory" function as input. Essentially, it builds a function that handles the cycling and creation for you.

## Class PolicyValidationService

This service helps ensure that policies used within the agent swarm are correctly registered and exist. It keeps track of all known policies and their details, preventing conflicts and errors.

The service registers new policies, making sure each one is unique. 

When a policy needs to be used, this service verifies that it's registered and valid, making the overall system more reliable. Logging is built in to track what’s happening, and it’s designed to work efficiently by remembering previous checks.

## Class PolicyUtils

This class offers tools to control which clients are allowed to interact with your AI agent swarm, based on defined policies. It simplifies managing client bans and checking ban status, handling the underlying validation and logging for you. 

You can use it to ban a client from a particular swarm and policy, remove a ban, or quickly check if a client is currently banned. Each function ensures the information provided (client ID, swarm name, policy name) is correct before taking action, helping to keep your system secure and consistent.

## Class PolicySchemaService

This service acts as a central place to manage and keep track of policy definitions used throughout the system. Think of it as a library of rules that different parts of the swarm can access and use. It makes sure these rules are valid before they're used, and keeps a record of them for easy access.

It uses a special registry to store and find these policy definitions, and works closely with other services like the ones responsible for applying the rules, handling connections, and providing a public API. If logging is enabled, it provides information about adding, updating, and retrieving these policies.

The service allows you to register new policies, update existing ones, and easily retrieve them when needed, ensuring consistent policy enforcement across the system. It checks that the essential parts of a policy are in place, and helps other components access the correct rule sets for managing access and restrictions.

## Class PolicyPublicService

This service helps manage policy-related actions within the swarm system, acting as a public interface for interacting with policies. It handles checking if a client is banned, retrieving ban messages, validating input and output data, and managing client bans and unbans. It works closely with other services like logging, performance monitoring, client agent communication, documentation, and swarm metadata to ensure consistent behavior and context. Logging is enabled based on a global configuration setting to keep things transparent. It's designed to provide a controlled and traceable way to enforce policies within the swarm.

## Class PolicyConnectionService

This service acts as a central manager for applying policies within the swarm system. Think of it as the gatekeeper, ensuring client actions comply with predefined rules. It intelligently caches policy information to improve performance and interacts with other services for logging, event handling, and retrieving policy configurations.

The service provides a set of operations that mirror those available through the public policy API, ensuring consistency across the system. These include checking for bans, retrieving ban messages, validating input and output data, and banning or unbanning clients. When a client needs to perform an action, this service checks against the relevant policy to ensure it's allowed. It leverages a clever caching system to reuse policy details, making things faster and more efficient. The service also keeps track of important events and communicates with other parts of the system, so everyone is on the same page when it comes to policy enforcement.

## Class PipelineValidationService

This class helps you make sure your AI agent pipelines are set up correctly before you start running them. Think of it as a quality control system for your agent workflows.

You use it by first adding your pipeline definitions – essentially, blueprints for how your agents will work – to the system. Then, when you're ready to run a pipeline, you can use this class to check that the pipeline's structure is valid based on its definition. 

The `loggerService` property is there to help track and display any errors or issues during the validation process. The `_pipelineMap` holds all the pipelines you've registered. The `addPipeline` method lets you register a new pipeline, and the `validate` method performs the actual validation check.

## Class PipelineSchemaService

This service helps manage and track the blueprints, or schemas, that define how your AI agents work together in a swarm. Think of it as a central place to store and organize the instructions for your agents. 

It uses a context service to handle schema-related operations, making sure your schemas are valid and consistent. The service lets you register new schema blueprints, update existing ones, and retrieve them when needed. You can essentially think of it as a registry for your agent workflows.

## Class PersistSwarmUtils

This class helps manage how your AI agents and their navigation histories are saved and retrieved. It's like a central hub for keeping track of which agent is active for each user and swarm, and what steps they've taken.

You can think of it as providing a way to remember which agent a user is currently using, and the sequence of agents they've interacted with. It does this by saving this information, linked to specific users and swarms.

The framework provides default ways to store this information, but it also lets you customize those storage methods if you need to, for instance, to use a special database or in-memory storage. This allows you to adapt the system to your specific requirements.

## Class PersistStorageUtils

This class helps manage how data is saved and retrieved for each client within the swarm system. It's designed to handle persistent storage, meaning data isn't lost when the system restarts. 

Think of it as a central place to store information related to each user or session, like their preferences or activity logs. It uses a system where each client’s data is tied to a specific storage name, and it cleverly reuses storage instances to be efficient.

You can even customize how the data is actually stored by providing your own storage implementation. This allows for flexibility in choosing the best storage mechanism for your needs, whether it's a simple file or a more complex database. The `getData` method gets data, `setData` saves it, and `usePersistStorageAdapter` lets you plug in different ways of storing the data.

## Class PersistStateUtils

This utility class helps manage how information is saved and retrieved for each client and state within the swarm. Think of it as a way to remember things like agent settings or variables for later use.

It allows you to store data for a specific client (identified by a SessionId) under a named state (StateName).  When you need that information again, you can easily retrieve it. If the data isn’t already saved, you can provide a default value.

The system cleverly reuses the same persistence method for each state name to avoid unnecessary overhead.

You can even customize how the data is persisted by providing your own persistence method, allowing you to store state in a database or in memory instead of using the default approach.

## Class PersistPolicyUtils

This class offers tools for handling how policy information, specifically lists of banned clients, are stored and accessed within the swarm system. It helps ensure consistent and reliable management of client restrictions across different swarms.

The `getBannedClients` method lets you easily check if a client is currently banned for a particular policy within a specific swarm.  If no ban list exists, it returns an empty list.  Conversely, `setBannedClients` allows you to update the list of banned clients for a policy in a swarm, ensuring the change is saved for later use.

To offer flexibility, you can customize the underlying storage mechanism used for these policy data by using the `usePersistPolicyAdapter` method, allowing you to integrate your own storage solutions beyond the default. The `getPolicyStorage` method ensures that only one storage instance is created per swarm to avoid unnecessary resource usage.

## Class PersistMemoryUtils

This utility class helps manage how memory is saved and retrieved for each individual client interacting with the swarm system. It ensures that memory data is persisted correctly for each client's session.

The class uses a clever system to make sure each client only gets a single, efficient way to store their memory.  You can retrieve and set memory data for a client, and if some memory doesn't exist yet, it will use a default value. 

When a client’s session is over, or you need to free up resources, there’s a way to clean up the memory storage for that client.

Finally, if you need more control over how memory is actually stored – for instance, using a specific type of database – you can configure a custom memory persistence adapter.

## Class PersistEmbeddingUtils

This class helps manage where and how embedding data is stored within the AI agent swarm. It provides a way to read and write embedding vectors, and importantly, allows you to customize the storage mechanism. 

The system tries to avoid recalculating embeddings by checking a cache first. It uses a smart way to ensure only one storage instance is used for each type of embedding data, making things more efficient. 

If you need more control over how embeddings are persisted, like using a different database or an in-memory store, you can configure a custom persistence adapter using `usePersistEmbeddingAdapter`.

## Class PersistAliveUtils

This utility class helps manage whether clients are online or offline within your swarm system. It keeps track of each client's status, so you know which ones are available for tasks.

You can think of it as a central record of client presence.  It uses a clever system to avoid creating duplicate records for each client, saving resources.

It provides straightforward methods to register a client as online or offline, and to check their current online status.

If you need more specialized tracking, you can even configure it to use your own custom persistence method, such as storing data in memory or a database.

## Class PerfService

The `PerfService` class is responsible for monitoring and recording the performance of client sessions within the system. It keeps track of things like how long executions take, the size of the data being sent and received, and the overall state of the sessions.

Think of it as a system-wide stopwatch and data recorder for each client's activities. It gathers information by working closely with other services to collect data about the client’s session, agent, and system status.

It provides methods to start and stop tracking executions, gather performance metrics, and then package that data into standard report formats. This allows for in-depth performance analysis and reporting on the overall health and efficiency of the system.  You can think of it as a central hub for capturing and summarizing performance data across all the client sessions.


## Class OutlineValidationService

This service helps keep track of and make sure your outline schemas are set up correctly within the agent swarm. It's responsible for registering new outline definitions, ensuring each name is unique, and then validating that those outlines actually exist when needed. 

The service uses a list to keep track of all registered outlines, and it's designed to be efficient by remembering validation results so it doesn't have to repeat checks. It also works hand-in-hand with other services to handle the finer details of outline completions. Think of it as the gatekeeper for your outline schemas, making sure everything is in order before your agents get to work. You can add new outlines, get a list of all the registered ones, and then validate a specific outline to confirm it's ready to be used.

## Class OutlineSchemaService

This service helps manage the blueprints for how agents organize their work – we call these blueprints "outline schemas." It’s designed to keep track of these schemas, allowing you to add new ones, update existing ones, and easily retrieve them when needed.

The service uses a central registry to store these schemas and relies on other services for logging activities and managing schema context. Before adding a new schema, it checks to ensure it has the necessary components. 

You can register new schemas, modify existing ones with partial updates, and simply request a schema by name to use it within your agent swarm. The service keeps a record of these operations for monitoring and troubleshooting.

## Class OperatorInstance

This class represents a single instance of an operator within a swarm of AI agents. Each instance is uniquely identified by a client ID and associated with a specific agent name. It allows you to subscribe to answer streams and provides methods for sending notifications, answers, and receiving messages to and from the agent. When an operator instance is no longer needed, you can use the `dispose` method to cleanly shut it down. Essentially, it’s the primary interface for interacting with a single agent in the swarm.

## Class NavigationValidationService

This service helps manage how agents move around within the system, making sure they don't get lost or repeat paths unnecessarily. It keeps track of which agents have already been visited for each client and swarm to optimize navigation.

You can think of it as a memory for the agents' journeys. The `getNavigationRoute` function provides access to that memory, using a clever technique called memoization to make it fast and persistent. 

The `shouldNavigate` function is the gatekeeper – it decides whether an agent should move to another, based on whether that destination has already been seen. `beginMonit` resets this tracking when needed, and `dispose` clears it entirely when it's no longer needed, with logging available for troubleshooting. The service uses a logger to record what’s happening behind the scenes, helping with debugging and understanding the agent movements.

## Class NavigationSchemaService

This service helps keep track of the tools your AI agents use to navigate and interact with their environment. It maintains a list of recognized tool names, allowing you to easily check if a particular tool is registered. 

You can register new tool names using the `register` method, and the service will log this action if logging is enabled. The `hasTool` method lets you quickly confirm whether a specific tool name is already in the list, again with optional logging. Essentially, this service provides a simple and trackable way to manage the tools your agents are using.

## Class MemorySchemaService

This service manages temporary, in-memory data associated with different active sessions within the swarm system. Think of it as a simple notepad where each session gets its own page – you can write things down (store data), read them back, and then clear the page when the session is done. It's not a permanent storage solution; data isn't saved for later.

The service allows you to store and retrieve objects linked to specific session IDs. It uses a simple key-value store, and any data you write will be combined with any existing data for that session. It’s designed to work closely with other services like those handling session connections, agent runtime memory, and public session APIs.

You can check if a session has data stored, write new data or update existing data, retrieve data, or completely clear the data for a specific session. All these operations can be logged to help track memory usage and troubleshoot issues, but this logging is controlled by a global setting.

## Class MCPValidationService

This class helps you keep track of and check the structure of Model Context Protocols, or MCPs. Think of it as a librarian for your MCP definitions. 

It stores your MCP schemas in a handy internal record, allowing you to easily add new ones. You can use it to verify that an MCP exists and is correctly defined before your agents try to use it, ensuring everything runs smoothly. The class relies on a logging service to keep you informed about what's happening.

## Class MCPUtils

This class, MCPUtils, is your helper for keeping the tools used by your clients up-to-date. Think of it as a tool manager for your entire system or just for individual clients. You can use it to refresh the tool lists for everyone connected, or target a specific client to give them the latest versions. It simplifies the process of ensuring all clients are using the correct tools.


## Class MCPSchemaService

The MCPSchemaService helps you manage the blueprints – or schemas – that define how different AI agents communicate and share information within your system. It acts as a central place to store, update, and access these schemas. 

Think of it as a librarian for your AI agent protocols. You can register new schemas, update existing ones with just the changes you need, and easily fetch a schema when an agent requests it. 

The service uses a logger to keep track of what’s happening and relies on a schema context service to handle the underlying complexities of managing schema information. It maintains an internal registry to hold all the schemas, making it easy to find and use them.

## Class MCPPublicService

This class provides a way to interact with the Model Context Protocol (MCP) to manage and use AI tools. Think of it as a central hub for controlling how your AI agents access and utilize different tools.

You can use it to discover what tools are available, confirm if a specific tool exists, and actually execute those tools, passing in necessary information. It also handles the cleanup process, ensuring resources are properly released when you're finished with a tool. 

The class relies on other services to handle logging and the underlying MCP communication, making it a focused component for tool orchestration. It offers ways to update tool lists globally or for individual clients.

## Class MCPConnectionService

This class helps manage connections and interactions with different AI models using a standardized protocol, MCP. It acts as a central hub for getting a connection to a specific AI model, listing available tools it offers, and actually using those tools.

It keeps track of these connections efficiently, creating them only when needed and reusing them to avoid unnecessary overhead. You can ask it for a list of tools an AI model provides, check if a specific tool exists, and then call that tool with the right inputs. 

The system also provides a way to update the tool lists for individual clients or across the entire system, ensuring everyone has the latest information. Finally, it has a mechanism to clean up resources when a client is finished, freeing up those connections for others to use.

## Class LoggerService

This class handles all the logging within the AI agent system, ensuring that messages are recorded and traceable. It provides different logging levels – normal, debug, and informational – allowing you to control the verbosity of the system's output.  The logging is flexible; it sends messages to both a general system logger and a client-specific logger, giving you detailed information about what's happening with each client.

You can adjust the logging behavior through configuration settings, enabling or disabling specific logging levels like debug or info. The system also allows you to change the main logger at runtime, which is useful for things like testing or redirecting logs to different locations.  The class keeps track of the method and execution context, making it easy to pinpoint the source of log messages.

## Class LoggerInstance

This class helps manage logging for individual clients within your system. It allows you to customize how logs are handled, including whether they appear in the console and what actions are performed.

When you create a `LoggerInstance`, you provide a client ID and optional callback functions to tailor the logging behavior. The `waitForInit` method ensures the logger is properly set up before you start using it. 

You can use `log`, `debug`, `info`, and `dispose` to record messages, handle debugging information, and clean up resources when the logger is no longer needed. Console output is controlled by a global configuration, and callbacks provide a way to extend the logger's functionality.


## Class HistoryPublicService

This service manages the history of interactions within the agent swarm. It provides a public way to interact with that history, ensuring operations are tracked and scoped correctly. Think of it as a central point for managing what's recorded about each agent's activity.

It handles tasks like adding messages to the history, retrieving the most recent message, converting the history into lists, and clearing the history when it's no longer needed. It works closely with other services to provide a comprehensive and efficient system.

The service keeps detailed records of actions for debugging and performance tracking, and these logs are controlled by a global configuration setting. It’s used in various parts of the system, including managing agent messages, documenting interactions, and tracking performance.


## Class HistoryPersistInstance

This class handles keeping a record of messages for an agent, saving them both in memory and to disk so they aren't lost. It’s designed to manage the history of conversations for each agent.

When you create an instance, it associates it with a specific agent using a client ID and allows you to provide callback functions for different actions.

The `waitForInit` method loads any existing history from disk when an agent starts up. You can loop through the history using `iterate`, which lets you filter and process messages as you go.  Adding new messages is done with `push`, which also saves them to persistent storage. To remove the most recent message, use `pop`. Finally, `dispose` cleans up the history—either for a specific agent or for all agents if you don't specify one.

## Class HistoryMemoryInstance

This component handles keeping track of messages for an agent, but it only stores them in memory – nothing is saved permanently. When you create an instance, you give it a unique identifier for the agent and can provide optional callbacks to customize how messages are handled.

The `waitForInit` method ensures the history is properly set up for a specific agent.  You can loop through past messages using `iterate`, which lets you filter and process them. New messages are added with `push`, and `pop` removes the most recent one. Finally, `dispose` clears the history, optionally wiping everything if needed. It’s designed to be lightweight and temporary, perfect for situations where you don't need persistent message storage.

## Class HistoryConnectionService

This service acts as a central hub for managing the history of interactions with agents within the system. It efficiently stores and retrieves agent history data, ensuring that information isn’t unnecessarily duplicated. Think of it as a smart cache for agent conversations.

When an agent needs its history – whether it's pulling old messages, adding new ones, or converting the history into a specific format – this service handles the process. It’s designed to work closely with other components like the agent execution environment, connection services, and public APIs, ensuring consistent behavior and performance. 

Importantly, it utilizes caching to avoid redundant work and tracks usage to monitor resource consumption. Finally, when finished, it cleans up properly, releasing resources and updating system records.

## Class ExecutionValidationService

This service helps manage and validate how many times an AI agent execution is running within a particular system. It keeps track of running executions for each client and swarm, preventing runaway or deeply nested execution chains.

The `getExecutionCount` method provides a quick look at how many executions are currently active, remembering previous results for faster access. 

You can manually increase the execution count with `incrementCount` to signal a new execution starting, or decrease it with `decrementCount` when one finishes. 

If you need to completely reset the tracked execution counts for a client and swarm, `flushCount` will clear the data, and `dispose` will remove the cached entry. Think of `flushCount` as cleaning up the temporary tally, while `dispose` removes the entire record of the tally.


## Class EmbeddingValidationService

This service helps keep track of the embeddings your AI agents use, making sure they're all properly registered and available. It acts like a central registry, storing information about each embedding and verifying that they exist when needed. 

When you add a new embedding, this service registers it and ensures no duplicates are added. When an agent or another part of the system wants to use an embedding, this service validates that it's actually registered and exists. It's designed to be efficient and reliable, using logging to track its actions and caching to speed up validation checks. The service works closely with other parts of the system, like the embedding registration and client storage components, to make sure everything runs smoothly.

## Class EmbeddingSchemaService

This service is responsible for managing the blueprints for how embeddings – numerical representations of data – are handled within the system. Think of it as a central catalog where the system stores and retrieves the specific instructions for creating and comparing embeddings.

It ensures that these instructions are valid before they're used, making sure things like the embedding name and functions for calculations are correctly defined. It uses a registry to keep track of these blueprints, making it easy to find the right one when needed.

This service works closely with other parts of the system, providing the embedding logic used for tasks like searching and comparing data stored in the swarm. It keeps a record of everything and makes sure the information is consistent and reliable.

## Class DocService

This class is responsible for automatically creating documentation for your AI agent system, including details about swarms, individual agents, and their performance. Think of it as a documentation generator that keeps your system's design clear and understandable.

It works by pulling information from various services within the system, like schemas for agents and swarms, and performance data. This information is then formatted into Markdown files for easy reading and viewing, and JSON files for performance metrics. The system includes diagrams (UML) to visually represent agent and swarm structures.

The process is designed to be efficient, using a thread pool to handle many documentation tasks at once. It also provides options for logging and organizing the output documentation into a structured directory system. You can generate documentation for all swarms and agents or focus on specific ones or performance data. The system provides client-specific performance documentation.

## Class ComputeValidationService

This service helps manage and validate the data used by your AI agent swarm. It acts as a central hub for defining and checking the structure of the information your agents work with.

You can think of it as a librarian for your agent's data, ensuring everything is organized and conforms to expected formats. The `addCompute` function lets you register new data structures that your agents will use. `getComputeList` provides a list of all the registered structures. Finally, the `validate` function confirms that a specific piece of data matches the defined structure, helping you catch errors early on. 

The service relies on other services – a logger for recording events and two services responsible for state validation and schema management – to perform its functions.

## Class ComputeUtils

This section describes the `ComputeUtils` class, a tool for managing and retrieving information about computational resources within the AI agent swarm. 

The `ComputeUtils` class provides two key functions. The `update` function allows you to signal a change to a specific compute resource, identified by a client ID and compute name.  The `getComputeData` function is used to fetch data related to a particular compute resource, letting you retrieve whatever information you need based on the client and compute names, and it’s designed to work with different data types.

## Class ComputeSchemaService

This service helps manage and compute schemas used by your AI agents. Think of it as a central place to define and organize the structure of data your agents work with. 

It allows you to register different schema definitions, update existing ones, and easily retrieve them when needed. The service keeps track of schema contexts, providing tools to ensure schemas are valid and consistent. It’s designed to be flexible, allowing you to easily add, change, or look up schema definitions as your agent system evolves. Essentially, it helps maintain a clear and organized structure for the data your AI agents process.

## Class ComputePublicService

This class, `ComputePublicService`, acts as a central point for interacting with compute resources, essentially providing a public interface for managing them. It relies on a logging service to track activity and a compute connection service to handle the underlying connections. 

The `getComputeData` method retrieves data associated with a specific compute resource, identified by its name, client ID, and method name.  The `calculate` method executes a calculation on a particular compute resource, utilizing its state and client information.  You can also use `update` to modify a compute resource's state and `dispose` to properly shut down and release resources associated with a compute task. Think of `dispose` as a graceful way to clean up after using a compute resource.

## Class ComputeConnectionService

This class, `ComputeConnectionService`, acts as a central hub for managing and coordinating compute tasks within the agent swarm. It's responsible for retrieving and working with compute resources, ensuring they're available and properly connected. 

Think of it as a conductor orchestrating different compute units – it handles fetching them, updating their status, and generally keeping everything running smoothly.  It relies on several other services like `loggerService` for logging, `busService` for communication, and `stateConnectionService` to handle state management.

The `getComputeRef` method is key for obtaining references to specific compute units, and `getComputeData` provides access to their data. You can trigger compute operations using `calculate`, refresh the system’s state with `update`, and cleanly shut down resources with `dispose`.

## Class CompletionValidationService

This service helps ensure that the names given to tasks (we call them "completions") within the AI agent swarm are unique and properly registered. It keeps track of all valid completion names and checks if a given name is allowed when an agent tries to use it. 

Think of it as a gatekeeper for completion names, working closely with other services to manage registration and agent validation. To speed things up, it remembers previous validation results so it doesn't have to repeat checks unnecessarily. 

You can add new completion names to this service, and it will log those additions.  When an agent needs to use a completion, this service confirms that the name is valid.

## Class CompletionSchemaService

The CompletionSchemaService acts as a central hub for managing the logic (called "completions") that agents in the swarm use to perform tasks. It keeps track of these completion functions, ensuring they are valid and accessible to different parts of the system.

Think of it like a library of pre-built actions that agents can pull from. Before an agent uses a completion, this service verifies that it’s properly defined.

It works closely with other services – like the one that describes agents, the one that executes agents, and the one that handles agent connections – ensuring that agents have the right tools to do their jobs. If you need to add a new action an agent can use, or update an existing one, this service handles that process. The system keeps a record of these functions and makes sure they're reliable.

## Class ClientSwarm

This class, `ClientSwarm`, is like a manager for a team of AI agents working together. It handles keeping track of which agent is currently active, managing a history of agent interactions (like a navigation stack), and making sure outputs from the agents are delivered correctly.

It provides a way to wait for outputs from the active agent, and has mechanisms to cancel those waits if needed. When an agent changes, or an agent's details are updated, it automatically notifies other parts of the system.

You can think of it as a central hub for controlling and observing the activities of your AI agents, ensuring everything runs smoothly and you can respond to changes or cancellations quickly. It manages things like the agent's busy state and handles emitting agent outputs.  Finally, it has a way to clean up and release resources when the swarm is no longer needed.

## Class ClientStorage

This class manages how data is stored and retrieved within the swarm system, especially when you need to search based on similarity. It's designed to handle operations like adding, removing, and clearing data, and it does so in a way that ensures everything happens in a controlled order.

It uses a special technique to create "embeddings," which are numerical representations of your data that allow for efficient similarity searches. Think of it as a way to find things that are conceptually similar, even if they don’t have the exact same words or attributes.

Here's a breakdown of what it does:

*   **Storing and Retrieving Data:** You can add new data, remove existing data, and get individual items or lists of items.
*   **Similarity Search:** It lets you find items that are similar to a search term using those embeddings.
*   **Controlled Operations:** All changes to the data are queued and executed one at a time, preventing conflicts and ensuring data consistency.
*   **Efficient Embeddings:** It creates and uses embeddings to speed up similarity searches, avoiding recalculations when possible.
*   **Event-Driven Updates:** It sends out notifications when data changes, so other parts of the system can react accordingly.
*   **Cleanup:** It properly cleans up resources when it's no longer needed, ensuring the system remains stable.

## Class ClientState

The ClientState class is the core of how a client interacts with the overall AI agent swarm. It holds the current state data and manages how that data is read, written, and updated. Think of it as a container for the state, combined with a safe and controlled way to modify it.

It provides functions to get, set, and clear the state, making sure these actions happen in a reliable, thread-safe manner.  The ClientState also handles events and integrations with other parts of the system, like managing connections and ensuring that changes are properly communicated. It helps keep everything synchronized and responsive. When you're done with the state, the `dispose` method cleans things up and releases resources.

## Class ClientSession

The `ClientSession` class manages interactions within the AI agent swarm for a single client. Think of it as a dedicated workspace for a client’s requests and agent responses.

It's responsible for handling messages – validating them, executing them with the swarm's agents, and ensuring they're properly logged and shared with subscribers.  It works closely with other parts of the system, like those handling agent connections, policies, and event broadcasts.

Here's a breakdown of what you can do with `ClientSession`:

*   **Send messages:** Use `execute` to run a message through the agent, or `run` for quicker, stateless operations.
*   **Track activity:** `commitToolOutput`, `commitUserMessage`, `commitSystemMessage`, and others let you log different types of messages and actions within the session's history.
*   **Control the agent:**  `commitStopTools` gives you a way to interrupt ongoing agent operations.
*   **Connect and Receive:** `connect` enables real-time interaction, linking the session to a messaging system and allowing you to receive responses from the agent.
*   **Clean up:**  `dispose` handles resource release when the session is finished.

Essentially, `ClientSession` provides a structured and controlled environment for client interactions within the AI agent swarm, handling everything from initial message validation to historical logging and finally, session cleanup.

## Class ClientPolicy

The `ClientPolicy` class is your gatekeeper for managing client access and ensuring messages adhere to established rules within the swarm system. It handles everything from banning clients and validating their messages to providing customized feedback when things go wrong.

Think of it as having a system for automatically blocking problematic clients and verifying that both incoming and outgoing messages are acceptable. The policy is flexible – you can customize how messages are validated and what happens when a client violates the rules. It pulls together different parts of the swarm system, like access control, message filtering, and event reporting, to provide a unified approach to client management.

The system remembers banned clients, and this list can be loaded as needed, so it doesn't have to be constantly present. It also provides a way to react to clients breaking the rules – either by automatically banning them or providing specific feedback. The system is designed to be adaptable and responds to changes in policies and client behavior.

## Class ClientOperator

The ClientOperator acts as a central hub for coordinating AI agents within a swarm. It's responsible for managing the flow of information and instructions to and from these agents.

Think of it as the conductor of an orchestra, ensuring each agent (the instruments) plays its part at the right time.

You can send input and specify how it should be processed, and the ClientOperator handles the behind-the-scenes work. It also allows you to send messages – developer messages for debugging, user messages to initiate actions, and assistant messages to provide responses. The ClientOperator supports several actions, though some functionalities like committing tool output or stopping tools are currently unavailable. Finally, it has a way to clean up resources when it's no longer needed through the `dispose` method.

## Class ClientMCP

This class helps manage tools and their usage for AI agents. Think of it as a central place to find out what tools are available and actually use them.

It keeps a record of tools for each agent, so you don't have to constantly fetch them from elsewhere. It also lets you check if a specific tool exists before trying to use it.

You can refresh the list of tools whenever needed, either for a specific agent or for all agents.

When you want an agent to perform a task using a tool, this class handles the call, sending the necessary information and receiving the results.

Finally, when an agent is finished, you can clean up the resources associated with it, ensuring things are properly released.

## Class ClientHistory

This class manages the history of messages associated with an agent in the swarm system. It's responsible for storing, retrieving, and filtering those messages, and it lets other parts of the system know when new messages are added or removed.

The history can be accessed as a simple list of all messages, or it can be prepared in a more specific way to provide context for the agent, such as when generating a response. This customized version considers agent-specific filtering rules, limits the number of messages included, and adds helpful introductory messages.

When an agent is no longer needed, this class handles cleaning up its message history to ensure resources are properly released. It works closely with other system components to manage message storage, handle events, and ensure the agent has the right information for its tasks.

## Class ClientCompute

This class, `ClientCompute`, is designed to handle the core computational work within your AI agent swarm. Think of it as the engine that drives the actions of your agents.

It's initialized with a set of parameters that define how it operates. 

The `getComputeData` method allows you to retrieve information related to the computation process. The `calculate` method is where the actual processing and decision-making takes place, driven by the current state of your swarm.  `update` is used to refresh the compute's internal state. Finally, `dispose` cleanly shuts down the compute when it's no longer needed.


## Class ClientAgent

This class, `ClientAgent`, is the core of how individual AI agents operate within a larger swarm system. Think of it as the brain of one agent, responsible for handling messages, deciding which tools to use, and sharing updates with others.

It carefully manages how messages are processed, ensuring that actions don's overlap.  It's designed to recover gracefully from errors, often attempting to "resurrect" the model to keep things running smoothly.

Here's a breakdown of what it does:

*   **Receives and Processes Messages:**  It takes incoming text, figures out if tools need to be used, and handles the whole process.
*   **Tool Management:**  It determines which tools (like search engines, calculators, or code interpreters) to utilize based on the input. It also makes sure tools don’t clash or run at the same time.
*   **Error Handling:** If something goes wrong during processing, it attempts to recover. This can involve re-attempting the process or generating a temporary response.
*   **Communication:** It broadcasts its actions and results to other agents within the swarm, keeping everyone in sync.
*   **History Tracking:** It keeps a record of all interactions, allowing for context and debugging.
*   **Controlled Shutdown:**  When an agent is finished, it performs cleanup tasks to ensure a clean exit.

Essentially, `ClientAgent` is the engine that drives individual AI agents, ensuring they work effectively and reliably within a collaborative swarm environment.

## Class ChatUtils

The `ChatUtils` class helps manage and coordinate chat sessions for different clients within an AI agent swarm. It acts as a central hub for starting, sending messages to, and cleaning up chat interactions. 

You can think of it as a way to create and track individual conversations, assigning each one to a specific client and swarm.  The `beginChat` function creates these individual chat sessions, while `sendMessage` allows you to send messages within them. 

When you're finished with a conversation, `dispose` neatly shuts it down. The class also provides a way to register functions (`listenDispose`) that get triggered when a chat session is ready to be discarded.

Finally, `useChatAdapter` and `useChatCallbacks` give you the flexibility to customize how chat instances are created and how they behave.

## Class ChatInstance

The `ChatInstance` represents a single chat session within an AI agent swarm. It's given a unique client ID and associated with a specific swarm name. When the `ChatInstance` is no longer needed, it can be properly disposed of to release resources.

The `beginChat` method starts a new chat session, while `sendMessage` allows you to send messages within that session and receive responses. The `checkLastActivity` method verifies whether the chat session has been recently active, ensuring it remains responsive.

You can subscribe to dispose events to be notified when a `ChatInstance` is being shut down using `listenDispose`. This allows your application to gracefully handle the termination of a chat session.

## Class BusService

The `BusService` acts like a central messaging hub for different parts of the system, handling how different components communicate with each other. It manages subscriptions, allowing services to "listen" for specific events, and then delivers those events when they occur.

You can think of it as a post office for software components.  It allows parts of the system to send messages (events) and other parts to receive them. This is particularly useful for things like monitoring execution progress, tracking performance, or reacting to changes in the system.

It’s designed to be efficient, remembering previously created subscriptions to avoid unnecessary work. The system also supports "wildcard" subscriptions where a service can listen for events that apply to the entire system, rather than just a specific client.

To help with managing the flow of information, it works closely with other services: `LoggerService` helps with logging what's happening, `SessionValidationService` makes sure only authorized clients are sending messages, and `PerfService` uses the message flow for performance tracking. It also provides special methods, `commitExecutionBegin` and `commitExecutionEnd`, as shortcuts for sending execution-related events. Finally, there’s a `dispose` function to clean up all the subscriptions when a client is finished, ensuring everything is properly released.

## Class AliveService

This class helps keep track of whether your AI agents (clients) are actively participating in a swarm. It lets you easily tell the system when an agent comes online or goes offline. When you mark an agent as online or offline, the system records this event and, if configured to do so, saves this information for later. This ensures you have a reliable picture of which agents are currently available within each swarm. You can use the `markOnline` method to signal that an agent is ready to work and `markOffline` when it’s no longer participating.

## Class AgentValidationService

The AgentValidationService is responsible for ensuring the configurations of agents within the system are correct. It keeps track of registered agents, their schemas, and how they depend on each other.

It relies on other services to do specific checks – like validating tool configurations, storage setups, and completion definitions. Logging is handled through a logger service, and the service uses memoization to speed up common validation tasks.

You can register new agents using `addAgent`, and then retrieve lists of things associated with an agent, such as storages, wikis, states, and dependencies. Functions like `hasStorage`, `hasWiki`, `hasDependency`, and `hasState` allow you to quickly check if an agent has a specific configuration without doing a full validation. Finally, `validate` is the main method for thoroughly checking an agent's configuration.

## Class AgentSchemaService

This service acts as a central hub for defining and managing the blueprints of your AI agents. It stores information about each agent, including what tools they use, what states they can be in, and what dependencies they have. Think of it as a librarian for agent designs.

The system carefully checks these designs to make sure they’re structurally sound before they’re put into use. It keeps track of agent schemas, allowing other parts of the system to easily find and use them. You can register new agent designs, update existing ones, and retrieve them when needed. The process is logged to provide visibility into schema management activities. Ultimately, this service is a foundational component for building and configuring your AI agent swarm.

## Class AgentPublicService

This class, `AgentPublicService`, acts as the main gateway for interacting with agents in the system. It handles common operations like creating agents, running commands, and logging messages, all while keeping track of what's happening for debugging and monitoring.

Think of it as a layer on top of the core agent management, ensuring that every action is properly scoped, logged, and tracked.  It provides a consistent way to interact with agents, regardless of the underlying implementation.

Here's a breakdown of what you can do with it:

*   **Agent Creation & Execution:**  You can create references to agents and run commands on them, similar to how a client agent might.
*   **Message Logging:** It provides methods to log various message types – system messages, developer messages, user input – to keep a record of the agent's history.
*   **Tool Management:** You can submit requests for tools, commit their outputs, and even halt further tool executions.
*   **Cleanup & Disposal:** It handles cleaning up resources and disposing of agents when they are no longer needed.

Essentially, `AgentPublicService` is designed to make working with agents in the swarm easier, more transparent, and more reliable. Every function call is wrapped to add context and ensure everything is properly tracked and logged.

## Class AgentMetaService

The AgentMetaService helps understand and document your AI agent swarm by creating diagrams that show how agents relate to each other. It takes agent information and turns it into a visual representation using UML, a standard way to describe software systems.

Think of it as a translator that converts complex agent relationships into easy-to-understand pictures. It can generate either full, detailed diagrams or simpler versions focusing on dependencies.

This service works closely with other parts of the system like the documentation generator (DocService) and performance monitoring tools (PerfService), using logging to keep track of what it's doing. The diagrams it creates are used to visualize agent schemas, allowing for better debugging and overall system comprehension.

## Class AgentConnectionService

This service manages how AI agents are created and used within the swarm system. Think of it as a central hub for working with agents - it makes sure agents are efficiently reused and properly handled.

When you need to interact with an agent, this service handles the setup, including loading configuration information and managing connections to various resources like storage and history.

It provides core functions for running agents, executing commands, committing messages, and cleaning up when done.  It's designed to be efficient, reusing agents when possible and tracking usage for validation. Essentially, this component streamlines the entire agent lifecycle.


## Class AdapterUtils

This class provides helpful tools for connecting your AI agent swarm to different AI completion services. Think of it as a bridge – it lets you easily create functions that talk to services like Hugging Face, Cortex, Grok, Cohere, OpenAI, LMStudio, and Ollama. Each function created by these tools allows your agents to send requests and receive responses from a specific AI model. You can specify the model you want to use with each connection, making it flexible to work with various AI models. The `fromOllama` function also allows you to define how tool calls are formatted.

# agent-swarm-kit interfaces

## Interface ValidationResult

This interface represents the outcome of validating arguments passed to a tool. It tells you whether the validation process completed successfully or not. 

If validation succeeds, you'll find the parsed and validated data stored in the `data` property. If something goes wrong during validation, the `error` property will contain a descriptive message explaining the issue. Essentially, it's a clear way to understand if your tool arguments are in the expected format.

## Interface TAbortSignal

This interface lets you signal when an operation needs to be stopped, building upon the standard way JavaScript handles cancellation. Think of it as a way to tell a running process, "Hey, you don't need to do that anymore!" You can adapt it to fit your specific needs and add your own unique details if necessary.

## Interface JsonSchema

This section describes the structure of a JSON Schema, which is a way to define the format and rules for JSON data. Think of it as a contract that dictates what a valid piece of data should look like. 

The `type` property simply states the data type – usually "object" for complex structures. The `properties` defines the individual fields within the JSON object, specifying what kind of data each field should contain. `required` lists the fields that absolutely must be present in the JSON data. Finally, `additionalProperties` indicates whether extra fields beyond those defined in `properties` are allowed. 


## Interface IWikiSchema

This interface, `IWikiSchema`, helps define and interact with a wiki knowledge base for your AI agents. Think of it as a blueprint for how your agents will access and use wiki information.

It includes a name for the wiki (`wikiName`) and an optional description (`docDescription`) to help identify it. You can also provide `callbacks` to customize how certain wiki operations are handled.

The `getChat` method is the primary way your agents will ask questions and receive answers from the wiki; it takes an argument defining the query and returns a promise that resolves to the AI-generated response.

## Interface IWikiCallbacks

This interface defines a set of optional functions you can provide to customize how the system interacts with a wiki. Specifically, the `onChat` function lets you be notified whenever a chat interaction happens with the wiki, giving you a chance to react to those conversations programmatically. You can use this to log chat activity, perform additional processing, or trigger other actions based on the chat content.

## Interface ITriageNavigationParams

This interface defines the information needed to set up a tool for triage navigation within the agent swarm. It lets you specify a name for the tool so the system knows how to identify it, along with a description that explains what the tool does. You can also add an optional documentation note to provide extra context or usage instructions for the tool.

## Interface IToolRequest

This interface describes what’s needed to ask the system to use a specific tool. It's how agents tell the system *which* tool they want to run and *what* information that tool needs to work. 

Think of it as a structured request: you specify the tool's name, like "search" or "calculator," and then provide any necessary details – like the search query or the numbers for a calculation – as parameters. The system will check if the tool exists and if the parameters make sense for that tool.

## Interface IToolCall

This interface describes a request to use a specific tool within the system. Think of it as the system's way of understanding what a model wants a tool to do. Each request has a unique ID to keep track of it. Currently, the system only supports calling functions as tools, and this interface specifies the function's name and the arguments it needs to operate. This information is crucial for agents to translate model instructions into actual tool executions.

## Interface ITool

This interface describes how tools are defined within the system, essentially acting as a blueprint for available functions that AI agents can use. Think of it as telling the AI what it’s allowed to do.

Each tool has a `type`, which is currently just "function," but might expand to include things like APIs or scripts later on.

Crucially, each tool also has a `function` property – this details the tool's name, what it does, and importantly, the structure of any parameters it requires. This information helps the AI understand how to use the tool correctly and allows the system to validate any calls made to it.

## Interface ISwarmSessionCallbacks

This interface lets you listen in on what's happening within your AI agent swarm. You can register functions to be notified when a new agent connects, when a command is run, when a message is sent, or when a session starts or ends. Think of it as a way to get updates and insights into the swarm's activity, allowing you to log events, perform setup routines, or react to specific actions taken by the agents. It provides a way to customize how your system interacts with and monitors the swarm's behavior.

## Interface ISwarmSchema

This interface defines the blueprint for how a swarm of AI agents is structured and managed. It lets you configure aspects like whether the swarm remembers its progress by saving data, provides a description for documentation, and allows you to set rules or restrictions for the agents.

You can also specify a starting point for the swarm's navigation and how it tracks changes, as well as define which agent is active by default. The interface also lets you provide a list of available agents and hooks into the swarm’s lifecycle for custom actions. Essentially, it's the master plan for creating and controlling your AI agent swarm.

## Interface ISwarmParams

This interface defines the settings needed to kick off a group of AI agents working together. Think of it as the blueprint for setting up the whole operation. It includes things like a unique ID for whoever is starting the swarm, a logger to keep track of what's happening, a communication channel (the bus) for agents to talk to each other, and a list of the agents themselves that will be part of the swarm. It’s all about configuring the environment and players before the agents start collaborating.

## Interface ISwarmDI

This interface acts as the central hub for accessing all the core components of the AI agent swarm system. Think of it as a toolbox containing services for everything from managing documentation and handling events to tracking agent health and enforcing policies. It provides access to functionality for interacting with agents, storing data, and coordinating operations across the entire swarm. You're essentially getting a single point of entry to control and monitor all aspects of the system's behavior and manage its underlying infrastructure.

## Interface ISwarmConnectionService

This interface acts as a blueprint for how connections between agents in your AI swarm should work. It’s designed to clearly define the public-facing aspects of those connections, making sure external code interacts with them in a predictable and controlled way. Think of it as a standardized way to build and manage the communication channels within your swarm, keeping the internal workings separate from what others need to know. It helps create a clean and reliable system for agents to coordinate.

## Interface ISwarmCallbacks

This interface lets you hook into key moments in a swarm’s activity. You can use it to be notified whenever a different agent takes the lead in the swarm – this is helpful if you want to track how agents are navigating or adjust your application's behavior accordingly. The callback provides the ID of the agent that changed, its name, and the name of the swarm it's part of, giving you all the details you need.

## Interface ISwarm

This interface lets you interact with a group of AI agents working together. You can use it to see which agent is currently active, get details about that agent, and change which agent is in charge. It also provides tools to manage the process, allowing you to pause any ongoing output, check if the system is currently working on something, and signal when it's busy. You can also send messages to the system and have it wait for responses from the active agent.

## Interface IStorageSchema

This interface outlines how your agent swarm’s storage system is configured. It defines things like whether data is saved permanently, how it’s indexed for searching, and how it's accessed. 

You can customize how storage behaves by providing functions to retrieve and set data, or by providing default data. The `embedding` property specifies which indexing method is used. Each storage has a unique `storageName` within the agent system. 

You can also provide a description to help understand how the storage is meant to be used.  Finally, there's a way to create indexes for individual storage items to make them easily searchable.

## Interface IStorageParams

This interface defines how the system manages storing and retrieving information for AI agents. Think of it as a set of tools for keeping track of what agents know and how similar different pieces of information are.

It lets you specify a unique identifier for each client using the `clientId` property.  You’re also given functions to compute similarity between different pieces of data (`calculateSimilarity`), save calculated embeddings to a cache (`writeEmbeddingCache`), and quickly check if an embedding has already been computed (`readEmbeddingCache`). If you need to generate an embedding for some text, there’s a `createEmbedding` function for that too. 

The interface also includes properties to identify the storage (`storageName`), handle logging of storage-related actions (`logger`), and communicate with other parts of the system (`bus`). Essentially, it provides a standardized way for different components to interact with the storage layer.

## Interface IStorageData

This interface outlines the basic information that each item stored within the system will have. Every piece of data you save will need a unique identifier, known as its `id`. Think of this `id` like a name tag that allows the system to easily find and manage each individual item.

## Interface IStorageConnectionService

This interface helps us clearly define how different parts of the system interact with storage connections. Think of it as a blueprint for services that need to connect to storage – it lays out the essential methods and properties without including any internal details. By using this interface, we make sure that the publicly available storage connection services are consistent and reliable.

## Interface IStorageCallbacks

This interface lets you plug into the lifecycle of your storage system, acting as a notification system for what's happening. You can listen for updates to the stored data, get notified when a search is performed, and be informed when the storage is first set up or when it's being cleaned up. Essentially, it provides a way to react to important events happening within the storage, whether that's for tracking changes, responding to search requests, or ensuring proper setup and cleanup.

## Interface IStorage

This interface lets you manage and work with data stored by the agent swarm. Think of it as a way to interact with the swarm's memory. 

You can retrieve items using a search query (`take`), add or update items (`upsert`), delete items by their unique ID (`remove`), and retrieve a single item by its ID (`get`). 

It also provides tools to list all items, optionally filtering them based on specific criteria (`list`), and to completely empty the storage (`clear`). The system handles updating indexes and saving changes to persistent storage as needed.

## Interface IStateSchema

The `IStateSchema` interface describes how a piece of information, or "state," is managed within the AI agent swarm. It lets you customize how that state is stored, shared, and updated.

You can choose whether the state is saved persistently, provide a helpful description for documentation, and decide if it should be accessible by multiple agents.

The `getDefaultState` function defines the initial value of the state. You can also provide custom `getState` and `setState` functions to control how the state is retrieved and modified.

Finally, you can add middleware functions to process the state during its lifecycle and define callbacks to react to specific state events.

## Interface IStateParams

This interface defines the information needed to manage a state within the agent swarm. Think of it as a set of instructions and tools for keeping track of things. 

It includes a unique identifier for the client using the state, a logger to help monitor and troubleshoot any issues, and a communication channel (the "bus") to allow different agents to exchange information related to that state. Essentially, it's how the system knows who's using the state, how to monitor it, and how it connects to the larger network of agents.

## Interface IStateMiddleware

This interface defines how you can plug in custom logic to handle the agent swarm's internal state. Think of it as a way to intercept and potentially adjust the information the system is using behind the scenes. You can use this to validate state changes, enrich the state with additional data, or even make modifications before the agent swarm acts on it. It allows for flexible control and customization of the core operational data.

## Interface IStateConnectionService

This interface helps ensure a clear, public-facing way to interact with state connections. Think of it as a blueprint for how external services should communicate with the system managing state. It focuses on the essential actions and properties, hiding the internal workings to keep things organized and secure. By using this interface, you're guaranteed a consistent and reliable way to manage and observe the state of your AI agents.

## Interface IStateChangeContract

This interface defines a contract for notifying subscribers when the state of an AI agent changes. Specifically, it provides a way to be alerted about these changes through the `stateChanged` property. Think of it as a signal that something's happened with an agent – maybe it's moving to a new task, encountering an error, or completing a step – and subscribers can react accordingly. The `stateChanged` property uses a generic subject type that carries a string describing the new state.

## Interface IStateCallbacks

This interface helps you stay informed about what’s happening with your agent swarm's state. It lets you define functions that are automatically called when a state is created, cleaned up, loaded, read, or updated. Think of these functions as little notifications—you can use them to log actions, perform setup tasks, or react to changes in the state as they occur. You can use `onInit` when something new starts, `onDispose` when something finishes, `onLoad` when data appears, `onRead` when data is accessed and `onWrite` when data is changed.

## Interface IState

This interface lets you manage the agent swarm's current status. You can easily check what the swarm is doing right now using `getState`. When you need to make a change, `setState` lets you calculate the new status based on the old one, ensuring a smooth transition. And if you ever need to completely reset everything, `clearState` will bring the swarm back to its starting point.

## Interface ISharedStorageConnectionService

This interface outlines how your AI agents can connect to a shared storage space, like a cloud drive or database. Think of it as a blueprint for setting up that connection – it specifies what actions and properties are available for agents to interact with the shared storage. It’s designed to keep the public-facing parts of the storage connection clean and well-defined, separating them from any internal workings. This ensures everyone uses the storage in a consistent and predictable way, leading to a more organized and reliable AI agent swarm.

## Interface ISharedStateConnectionService

This interface helps ensure a clear and consistent way to manage shared data between different AI agents in your swarm. Think of it as a blueprint for services that allow agents to communicate and share information. It's designed to specifically exclude internal workings, so what you see and use is focused on the public, agent-facing operations. This helps keep things organized and predictable for anyone building or interacting with the system.

## Interface ISharedComputeConnectionService

This interface defines how your AI agents can connect to and use shared computing resources, like virtual machines or specialized hardware. Think of it as the bridge that allows agents to request and utilize processing power without needing to manage the underlying infrastructure themselves. It provides methods to request compute connections, check their status, and release them when they’re no longer needed.  Implementing this service enables a central management point for computing resources within your AI agent swarm. It abstracts away the complexities of connection setup and teardown, allowing agents to focus on their core tasks.

## Interface ISessionSchema

This interface, `ISessionSchema`, is like a blank canvas for now. It’s set up to hold information about how individual sessions within the agent swarm will be managed and configured in the future. Think of it as a promise of more detailed session controls to come – for now, it simply exists to mark the spot.

## Interface ISessionParams

This interface outlines the information needed to kick off a new session within your AI agent swarm. Think of it as the blueprint for setting up a workspace where your agents will collaborate. 

It includes things like a unique identifier for who’s using the session (the `clientId`), a way to track what’s happening (the `logger`), and the rules your agents need to follow (`policy`). It also connects the session to the communication network (`bus`) and manages the overall swarm environment (`swarm` and `swarmName`). Essentially, it bundles all the key pieces together to ensure a session runs smoothly and consistently within your agent system.

## Interface ISessionContext

This interface describes the information available during a session within the AI agent swarm. Think of it as a container holding details about who initiated the session (the `clientId`), which process is running (`processId`), and any specific method or execution details if they're applicable. It allows you to track and understand the context of an ongoing interaction. It bundles together client identification, process tracking, and potentially method and execution specifics for a comprehensive view of a session’s environment.

## Interface ISessionConnectionService

This interface helps define how different parts of the AI agent swarm orchestration framework connect and communicate. Think of it as a blueprint ensuring that the publicly accessible connection services are consistent and well-defined. It’s used internally to create a standardized way of managing these connections, leaving out the technical details that users don't need to worry about. It ensures the public-facing services work predictably and reliably.

## Interface ISessionConfig

This interface, `ISessionConfig`, helps you control how your AI agents run in sessions, either on a schedule or with rate limits. Think of it as a way to manage the flow and timing of your agents’ work. The `delay` property lets you specify a waiting period between sessions, essentially pacing the agents' activities. You can also use `onDispose` to define a function that runs when the session ends, allowing you to clean up resources or log completion.

## Interface ISession

The `ISession` interface defines how you interact with a conversation or workflow within the agent swarm. It provides tools for sending messages, running commands, and managing the session's state.

You can use `commitUserMessage` and `commitAssistantMessage` to add messages to the conversation's history without triggering any further actions. `commitSystemMessage` and `commitDeveloperMessage` let you add internal messages that might be useful for debugging or controlling the session.

To clear the entire conversation history and reset the agents, use `commitFlush`. If you need to temporarily halt the next step in an automated process, `commitStopTools` can pause further agent calls.

The `emit` function sends a message through the session’s communication channel. `notify` is similar but is used for internal communication with listeners.

For quick, isolated tasks or previews without affecting the main conversation, the `run` function allows you to execute stateless completions.  `execute` is your primary method for running commands within the session, potentially updating the chat history depending on the chosen mode.

`connect` establishes a two-way communication channel, allowing messages to flow in both directions. When agents use tools, `commitToolOutput` records their results, and `commitToolRequest` handles requests for tools.

## Interface IScopeOptions

This interface, `IScopeOptions`, helps configure how your AI agents interact within a group or "swarm." It lets you specify a unique identifier for the swarm, like a name or project code (`swarmName`), and a client ID to distinguish the application using the swarm (`clientId`). You can also provide a function (`onError`) that gets called when something goes wrong – a handy way to handle unexpected errors during the agents’ work. Think of it as setting up the environment and rules for your agents to collaborate effectively.

## Interface ISchemaContext

This interface, `ISchemaContext`, acts as a central hub for accessing different schema definitions used within the AI agent swarm orchestration framework. Think of it as a toolbox containing pre-defined blueprints for various agent components. 

Specifically, it provides access to several registries, each holding schemas for things like agent behaviors, completion strategies, and outlines. These registries let the system understand and correctly interpret the structure and expected data formats for different agent tasks and interactions. You can use it to dynamically retrieve these schema definitions as needed during orchestration.

## Interface IPolicySchema

This interface describes how policies are configured within the agent swarm. It lets you define rules for managing and restricting clients. 

You can enable persistent storage to save banned client lists, provide descriptions for clarity, and assign unique names to each policy.  Policies can automatically ban clients after validation failures, and you have the flexibility to customize ban messages using a function. 

You can also retrieve lists of currently banned clients, manually set those lists, and most importantly, provide your own functions to validate incoming and outgoing messages based on custom rules, replacing the system’s default validation. A set of optional callback functions allows you to further tailor the policy’s behavior during validation and ban processes.

## Interface IPolicyParams

This interface defines the information needed to set up a policy within the AI agent swarm. Think of it as a blueprint, specifying what a policy needs to function correctly.

It requires a logger, which is how the policy will record important events and any problems it encounters. 

It also needs access to a communication bus, allowing the policy to send and receive messages within the overall swarm system.

## Interface IPolicyConnectionService

This interface outlines the publicly accessible features for managing connections based on policies within the AI agent swarm. Think of it as a blueprint for how external systems can interact with the policy-driven connection management – it specifies what actions are available and how they work, without revealing the underlying implementation details. It ensures that the parts of the connection service designed for public use are clearly defined and consistent.

## Interface IPolicyCallbacks

This interface defines a set of optional functions you can use to get notified about what's happening with your AI agent swarm policies. You can use `onInit` to run code when a policy is first set up, like logging its creation. `onValidateInput` and `onValidateOutput` let you monitor and potentially react to messages as they come in or go out. Finally, `onBanClient` and `onUnbanClient` allow you to track and respond to client bans and unbans within your swarm. These callbacks give you flexibility in observing and controlling the behavior of your policies.

## Interface IPolicy

This interface defines how your AI agent swarm enforces rules and manages client access. Think of it as the gatekeeper for your swarm, ensuring messages and clients behave as expected. 

It lets you check if a client is banned, retrieve the reason for a ban, and validate messages going in and out of the swarm.  You can also actively ban or unban clients, effectively controlling who participates. This interface provides the tools to create a safe and controlled environment for your AI agents to work together.

## Interface IPipelineSchema

This interface, `IPipelineSchema`, defines the structure for a pipeline within our AI agent swarm orchestration framework. Think of it as a blueprint for how a specific workflow should run.

Each pipeline needs a descriptive `pipelineName` to identify it.

The core of the pipeline is the `execute` function.  This is where the magic happens – it tells the framework how to run the pipeline, identifying the client, agent, and data (`payload`) involved, and returns a promise that resolves with either void or the data produced by the pipeline.

Finally, `callbacks` lets you define functions to be triggered at different points in the pipeline’s execution, allowing for flexible handling of events and asynchronous operations. This allows your pipeline to react to intermediate results or perform actions after completion.


## Interface IPipelineCallbacks

This interface defines a set of optional callbacks you can provide to monitor the lifecycle of a pipeline within the agent swarm orchestration system. Think of these as notifications – you can hook into them to track what's happening. `onStart` gets called when a pipeline begins execution, letting you know which client triggered it and what data is involved. `onEnd` signals the completion of a pipeline, indicating whether it finished successfully or encountered an error. Finally, `onError` lets you respond to any errors that occur during pipeline execution, giving you details about the error itself. Providing these callbacks allows you to build custom monitoring or logging systems around your agent swarm workflows.

## Interface IPersistSwarmControl

This framework lets you tailor how your AI agent swarm's data is saved and loaded. Specifically, it provides ways to hook in your own custom storage solutions for two key pieces of information: the active agents within a swarm and the navigation stacks they use. 

You can swap out the default persistence methods with your own implementations. This gives you flexibility to use things like in-memory storage for testing or connect to a specific database for more permanent storage, all while keeping the core swarm logic consistent. Think of it as plugging in different types of storage containers for your agent's information.

## Interface IPersistStorageData

This interface outlines how data meant for long-term storage within the agent swarm is structured. Think of it as a container holding a list of data – like a collection of key-value pairs or individual records – that needs to be saved. The `data` property simply holds that list of items ready for persistence. It's designed to work with the persistence utilities within the swarm system.

## Interface IPersistStorageControl

This interface lets you customize how data is saved and retrieved for a specific storage area. Think of it as a way to swap out the default storage mechanism with your own, perhaps to use a database instead of a file. You provide a "blueprint" (a constructor function) for your custom storage adapter, and this framework will use it to handle saving and loading data for that storage area. It's useful when you need to adapt the storage behavior to a particular need, like using a specialized database.

## Interface IPersistStateData

This interface outlines how data about the swarm's state – things like agent settings or ongoing session information – is saved and retrieved. It's a simple container, holding the actual data you want to store. Think of it as a standardized package for keeping track of the swarm's memory. The `state` property is where you put the information itself, regardless of its type.

## Interface IPersistStateControl

This interface lets you hook in your own way of saving and loading the agent's state. If the built-in saving mechanism isn't enough, you can provide a custom adapter to handle the persistence. This is useful when you need to store state in a specific place, like a database, rather than the default storage. Essentially, it gives you fine-grained control over how the agent remembers its progress.

## Interface IPersistPolicyData

This interface outlines how policy data, specifically information about banned clients, is stored within the swarm system. It essentially holds a list of `SessionId` values – think of them as unique identifiers for connected devices – that have been blocked from participating in a particular `SwarmName`. This allows the system to remember which clients should not be allowed to join a swarm, ensuring better control and security. The `bannedClients` property simply holds that list of blocked session IDs.

## Interface IPersistPolicyControl

This interface lets you tailor how policy data is saved and retrieved for your AI agent swarms. It provides a way to swap out the standard data storage with your own custom solution. Think of it as a plug-in mechanism – you can provide your own "persistence adapter" to handle storing and loading policy information specific to each swarm. This is useful if you want to experiment with different storage methods, like saving policies in memory or using a custom database.

## Interface IPersistNavigationStackData

This interface describes how navigation data – specifically, a history of which agents were active – is saved. Think of it as a memory for the swarm, letting it remember where the user has been. It holds a list of agent names, creating a stack that tracks the order in which agents were used. This allows the system to recall previous agent selections and potentially offer easy navigation back to them.

## Interface IPersistMemoryData

This interface describes how memory data is saved and loaded within the AI agent swarm. Think of it as a container – it holds whatever information you want to keep around, like a conversation history or temporary working state for an agent.  The `data` property within this container holds the actual information being stored. This allows the system to reliably preserve agent memory between sessions or operations.

## Interface IPersistMemoryControl

This interface lets you plug in your own way of saving and loading memory data associated with a session. Think of it as swapping out the standard memory storage system for something tailored to your needs, like storing it in a database instead of just keeping it in the application's memory. By providing your own persistence adapter, you can control exactly how the agent swarm's memory is handled. This is helpful when you need more control over where and how the memory is stored for things like long-term storage or specific data handling requirements.

## Interface IPersistEmbeddingData

This interface describes how the system stores embedding data, which are essentially numerical representations of text. Think of it as a way to remember what a piece of text means in a way computers can understand. The `embeddings` property holds the actual numbers that make up that representation. Each set of numbers corresponds to a specific piece of text identified by its `stringHash` and an `EmbeddingName`.

## Interface IPersistEmbeddingControl

This interface lets you tailor how embedding data is saved and retrieved. You can plug in your own persistence mechanism, like using a database or an in-memory store, instead of relying on the default behavior. This is useful when you need more control over where and how embedding information is stored, especially when working with specific swarm configurations. Essentially, it provides a way to customize the underlying data storage for embedding data.

## Interface IPersistBase

This interface provides the foundation for saving and retrieving information within the agent swarm system. It handles saving data to files and ensuring the storage area is properly set up.

You can use it to check if data exists, read data by its unique identifier, and write new data or update existing data, all while the system makes sure the process is reliable and handles potential problems with corrupted files. The `waitForInit` method prepares the storage area when things start up, and the other methods provide a simple way to manage the data stored as JSON files.

## Interface IPersistAliveData

This interface helps the system keep track of which clients are currently active within a specific swarm. It's a simple way to mark a client as online or offline, using a unique identifier (SessionId) and the swarm’s name. Think of it as a heartbeat signal – it tells the system if a client is still participating. The `online` property is the only thing you need to set, indicating whether the client is currently connected.

## Interface IPersistAliveControl

This interface lets you fine-tune how the system remembers whether an AI agent swarm is still active. 

Essentially, it provides a way to plug in your own custom storage mechanism – perhaps you want to use a database instead of a simple file, or maybe you need an in-memory solution for testing. 

The `usePersistAliveAdapter` method is the key here; it lets you provide a blueprint for how that custom storage works, allowing you to tailor the persistence behavior for a specific swarm.

## Interface IPersistActiveAgentData

This interface describes how we keep track of which agent is currently running for each client interacting with a swarm. It’s essentially a way to remember which agent is "active" when a client is working with a specific swarm. The `agentName` property tells us the identifier of that active agent, like a name you’d give to an individual agent within the larger swarm system. Think of it as a label that helps us link a client’s activity to a particular agent.

## Interface IPerformanceRecord

This interface helps track how well a specific task or process is running within the system. It gathers performance data from all the clients involved, like individual sessions or agent instances, to give you a complete picture of its efficiency.

You're essentially getting a record of how many times a process ran, how long it took overall, and the average time per execution. The record also includes timestamps (both a day count and a time of day) and a standard date/time representation for easy logging and reporting. This information is key for monitoring system health and diagnosing any performance bottlenecks. The data is broken down by process ID, allowing you to isolate and analyze specific workflows.

## Interface IPayloadContext

This interface, `IPayloadContext`, helps organize information when tasks are being processed. Think of it as a container holding two key pieces of data: a `clientId` which identifies who requested the work, and a `payload` which contains the actual data the agent needs to work with.  It ensures a consistent format for passing data around within the agent swarm system. The `payload` part can hold different kinds of data, depending on what the specific task requires.

## Interface IOutlineValidationFn

This interface describes a function used to validate the structure or outline of a task assigned to an AI agent. Think of it as a way to ensure the task is well-defined before the agent starts working. The function takes the task outline as input, typically a structured data format, and returns a boolean indicating whether the outline is valid. You can use this to enforce specific formatting rules, check for required fields, or verify that the task is appropriate for the agent to handle. It helps ensure that the AI agents are working with clear and consistent instructions.

## Interface IOutlineValidationArgs

This interface, `IOutlineValidationArgs`, helps streamline the process of validating the results produced by your AI agents. Think of it as a container for everything a validation function needs. It bundles together the original input and the data that was generated during the agent’s work – like a result set or a structured output. This allows for more context-aware validation, ensuring the data isn’t just correct, but also relevant to the initial request. You’ll use this interface when you need to pass both the initial request and the output data to a validation routine.

## Interface IOutlineValidation

This interface helps define how to check and ensure your outline data is correct. It lets you specify a validation function, which is the core logic for verifying the outline. You can also add a descriptive note to explain what the validation does – this is especially helpful when sharing or documenting your validation processes. Think of it as a way to make sure your data is reliable and understandable.

## Interface IOutlineSchemaFormat

This interface describes how to define a specific structure for outlines using a JSON schema. Think of it as a way to tell the system exactly what kind of data you expect in an outline. It has two parts: a `type` that identifies the format (like "json_schema") and a `json_schema` property which holds the actual JSON schema object that dictates the outline's shape and the rules it must follow. It's essentially a blueprint for validating the outline's contents.

## Interface IOutlineSchema

This interface, `IOutlineSchema`, helps you define how an outline operation works within the system. Think of it as a blueprint for creating structured data, often used for planning or organizing information.

You'll use it to specify things like the prompt to send to an AI model to generate the outline, any system instructions you want the model to follow, and the unique name you're giving this outline.

It also allows you to define validations – rules to check the generated data – and a format to describe the data's structure. You can even control how many times the system will try to generate the outline if things don't work out initially.

Finally, there's a function, `getOutlineHistory`, which takes input and past attempts to build the final, structured data for the outline.

## Interface IOutlineResult

This interface describes what you get back after running an outline generation process. It tells you if the outline was successful, gives it a unique ID for tracking, and provides a record of the steps taken during its creation. 

You’ll also find the original input parameters alongside the generated outline data, if any. If something went wrong, an error message will be included. A retry counter is also provided to monitor how many times the process has been attempted.

## Interface IOutlineObjectFormat

This interface defines the structure for outline data, acting like a blueprint to ensure everything is formatted correctly. Think of it as a way to clearly communicate what data is expected and how it should be organized. It specifies the core type of the outline – whether it's a JSON object or a more general object – along with a list of required fields. Most importantly, it details the properties within the outline, including their data types and descriptions, and optionally, a list of allowed values for each.

## Interface IOutlineMessage

This interface defines the structure of a message within the system, helping to organize and track interactions between users, assistants, and the system itself. Each message has a defined role – whether it's coming from a user, an assistant, or the system – and includes its content. You can also attach images to messages, and if the message involves a tool call, details about that call, like its ID and associated tool information, are included. This standardized message format makes it easier to manage and understand the flow of communication within the agent swarm.

## Interface IOutlineHistory

This interface helps you keep track of the messages used when creating or modifying an outline. It lets you add new messages one at a time or in groups, easily clear the entire history to start fresh, and retrieve the complete list of messages that have been used. Think of it as a log of the outline's creation process.

## Interface IOutlineFormat

This interface defines the expected structure for outline data used within the system. Think of it as a blueprint that tells us what fields are necessary and what kind of data each field should contain. It ensures everyone uses the same format, making it easier for different parts of the system to work together. The blueprint includes the overall data type, a list of mandatory fields, and detailed descriptions for each field, including possible values if applicable.

## Interface IOutlineCallbacks

This interface lets you hook into what's happening as an outline is created and checked. You can use it to keep track of when a new outline process begins, or to react to the generated document, whether it's valid or not. If you want to log activity or automatically retry failed attempts, this is where you’d set up those actions. Essentially, it provides a way to be notified and respond to key moments in the outline creation workflow.

## Interface IOutlineArgs

This interface defines the information needed when creating an outline. Think of it as a package containing everything an AI agent needs to generate a plan—it includes the initial input, a counter to track attempts, the desired output format, and a record of previous interactions. The `param` property holds the actual data the agent will work with, while `attempt` keeps track of how many times the outline has been tried.  The `format` property specifies the structure of the output the agent should produce, and `history` allows the agent to refer to earlier messages for context.

## Interface IOutgoingMessage

This interface describes a message being sent *from* the AI agent swarm to a client, like an agent’s response or a notification. Each message has a unique client identifier to ensure it reaches the correct recipient, along with the actual content or data being transmitted. It also includes the name of the agent that generated the message, letting the client know where the information came from. Think of it as the system's way of reporting back to the agents it's coordinating.

## Interface IOperatorSchema

This function lets you establish a connection between a specific client and an agent within the swarm. Think of it as setting up a communication channel where the client identifies itself with a `clientId` and specifies which `agentName` it wants to talk to. The function returns a `DisposeFn$2` which is important for cleaning up the connection when you're finished with it, preventing resource leaks. It’s the main entry point for agents to receive instructions from clients.

## Interface IOperatorParams

This interface defines the required information given to each agent within the swarm orchestration framework. Think of it as a set of essentials each agent needs to know to do its job. Each agent receives these details: a unique name to identify itself, a client ID to track its origin, a logger for recording its actions, a bus for communicating with other agents, and a history to remember past events. These parameters ensure agents are aware of their role, can log their progress, and can reliably interact with the overall system.

## Interface IOperatorInstanceCallbacks

This interface defines the functions your application can use to be notified about what's happening with individual AI agents within the swarm. Think of it as a way to listen in on an agent's activity.

You can register functions to be called when an agent starts up (`onInit`), provides an answer (`onAnswer`), receives a message (`onMessage`), shuts down (`onDispose`), or sends a notification (`onNotify`). Each of these functions receives information like the client ID, agent name, and the specific data related to the event, allowing your application to react accordingly. Essentially, this provides a flexible way to build around and observe the actions of each agent in the swarm.

## Interface IOperatorInstance

This interface defines how you interact with a single agent within a larger AI agent swarm. Think of it as a blueprint for controlling one agent's communication. 

You can use `connectAnswer` to set up a way for the agent to send information back to your system.  The `answer` method is how you instruct the agent to respond with something. `init` gets the agent ready to go, while `notify` lets you send it general messages. The agent receives messages using `recieveMessage`, and `dispose` cleanly shuts down the agent’s connection when you're finished with it.

## Interface IOperatorControl

This interface lets you configure how your AI agents, or "operators," behave within the orchestration framework. 

You can provide callback functions to be notified about operator events, essentially tailoring their responses to specific situations. 

Furthermore, you can swap out the default operator behavior by plugging in your own custom operator adapter – allowing for highly specialized agent logic. Think of it as customizing the fundamental way your agents operate.

## Interface INavigateToTriageParams

This interface lets you customize how your AI agents navigate to a triage agent. Think of it as a way to inject your own logic and messages into the process. 

You can define what happens *before* navigation begins with `beforeNavigate`, or tailor the messages exchanged – like `lastMessage` to pass information, `flushMessage` for clearing buffers, `executeMessage` for initiating actions, and even custom responses for tool output acceptance or rejection. These properties can be simple strings or more complex functions that take context like client ID and agent details, giving you fine-grained control over the agent's behavior.

## Interface INavigateToAgentParams

This interface lets you customize how the system guides an agent to a new task or location. It provides hooks for various stages of the navigation process, allowing you to inject messages or run functions at crucial moments.

You can use `beforeNavigate` to perform actions right before the navigation starts, perhaps logging or preparing data. 

`flushMessage` lets you define a message to send when navigating, and `emitMessage`, `executeMessage`, and `toolOutput` allow custom messages to be crafted or actions to be taken when specific events occur during the agent’s transition.  These messages can be static strings or dynamic functions that generate content based on details like the client ID, previous agent, and the agent being navigated to, including the last message from the user.


## Interface IModelMessage

This interface defines the structure of a message exchanged within the agent swarm system. Think of it as a standardized way to represent any communication—whether it's a user's input, a tool's output, a system notification, or a model’s response.

Each message has a specific role, like "user," "assistant," or "tool," indicating its origin. It also includes the name of the agent that sent it, which is crucial when dealing with multiple agents working together.

The core of the message is its content – the actual text or data being transmitted.  There's also information about how the message was generated ("mode"), and optional data like tool calls, images, and extra payload information. This allows for detailed tracking and processing of messages within the swarm.

## Interface IMethodContext

This interface, `IMethodContext`, provides a standardized way to track details about individual method calls within the agent swarm system. Think of it as a container for key information related to a specific action being performed. It includes identifiers for the client, the method itself, and the various resources involved – like the agent, swarm, storage, state, compute, policy, and MCP – allowing different services to easily share and understand the context of that call. It’s used for things like logging, performance monitoring, and documentation, ensuring everyone has a consistent view of what's happening.

## Interface IMetaNode

This interface describes the basic building block for representing how agents and their resources connect. Think of it like a node in a diagram—each node has a name, like the name of an agent or a specific resource it uses. 

It can also have children, which are other nodes, creating a tree-like structure to show how agents depend on each other or share resources. This structure helps us understand and visualize the relationships within the agent swarm.

## Interface IMCPToolCallDto

This interface describes the information shared when an agent requests a tool to perform a task. It includes details like which tool is being used, who is requesting it (the client and agent), the parameters needed for the tool, and if there are other related tool calls happening alongside. There's also a way to signal if the tool call should be stopped prematurely and an indicator for if it's the final step in a series of actions. Think of it as the complete package of instructions and context sent to the tool.

## Interface IMCPTool

This interface describes what a tool looks like within the AI agent swarm system. Each tool needs a name so the system knows what it is, and a description is helpful for understanding its purpose. Crucially, every tool also has an input schema – this tells the system what kind of data the tool expects to receive to function correctly. The input schema specifies the data type and structure needed, allowing for proper data validation and preparation before sending information to the tool.

## Interface IMCPSchema

This interface describes the blueprint for a core component within our agent swarm orchestration system – we call it an MCP, or Mission Control Process. Think of it as a modular unit responsible for a specific task or a sequence of actions within the swarm. 

Each MCP has a unique name and can optionally include a description for documentation purposes. 

The most important parts of an MCP are its ability to list the tools it can use and to actually execute those tools. The `listTools` function tells the system what tools are available to the MCP, and the `callTool` function is how the system actually tells the MCP to use a specific tool with some data.

Finally, MCPs can also register callbacks to be notified about key events in their lifecycle.

## Interface IMCPParams

This interface defines the required components for managing an agent swarm orchestration process. It ensures that your orchestration has a way to log important events and communicate with other parts of the system. Specifically, it requires a logger to record actions and a bus for handling messages or triggering events within the swarm. Think of it as the foundational structure for a well-organized and communicative agent swarm.

## Interface IMCPConnectionService

This interface defines how different parts of the system connect and communicate using a Message Channel Protocol (MCP). Think of it as the backbone for reliable messaging between your AI agents and the orchestration framework. It provides methods to establish connections, send messages, receive responses, and manage the overall communication lifecycle.  You're essentially using this to build the channels through which agents share information and coordinate their actions.  It handles the technical details of the connection, allowing you to focus on the content of the messages being exchanged.



It offers functions for initializing a connection, sending data, listening for incoming messages, and gracefully closing the connection when it’s no longer needed.  This ensures that your agents can reliably interact with each other and the central system, even when dealing with network fluctuations or temporary outages.

## Interface IMCPCallbacks

This interface defines a set of functions that your application can use to respond to events happening within the AI agent swarm orchestration framework. Think of them as hooks that allow your code to react to different stages of an agent's lifecycle.

The `onInit` function lets you run code when the system is first starting up. `onDispose` signals when resources associated with a specific agent are being released, useful for cleanup. When the system needs to gather available tools for an agent, the `onFetch` function is triggered. Listing the tools available to an agent invokes `onList`. Importantly, `onCall` notifies you whenever an agent actually uses a tool, providing details about which tool and the data involved. Finally, `onUpdate` informs you when the list of tools available changes.


## Interface IMCP

The Model Context Protocol (MCP) interface lets you manage the tools available to your AI agents. You can use it to see what tools are offered to a particular agent, check if a specific tool is available, and most importantly, actually run those tools with the data you provide. 

Sometimes the list of tools needs refreshing; the interface provides ways to update the tool lists, either for all agents or just for a specific one, ensuring you always have the latest options. It's all about giving your agents the right tools and being able to use them effectively.

## Interface IMakeDisposeParams

This interface defines the settings you provide when you want to automatically handle the cleanup of an AI agent within a swarm. The `timeoutSeconds` property lets you specify how long, in seconds, the system should wait before automatically disposing of an agent if it becomes inactive. The `onDestroy` property allows you to register a function that will be called when the agent is disposed, providing the agent's ID and the swarm name as parameters, enabling you to perform any necessary cleanup actions in your own code.

## Interface IMakeConnectionConfig

This interface lets you control how quickly your AI agents send messages. The `delay` property is a number that specifies a pause, in milliseconds, before an agent sends its next message. It’s a simple way to slow things down and prevent overwhelming external systems or to manage the pace of the agent swarm’s interactions.

## Interface ILoggerInstanceCallbacks

This interface provides a way for other parts of your application to be notified about what’s happening with a logger. You can use it to react when a logger is set up, taken down, or when a new log message is created – whether it's a general log, a debug message, or an informational message. Think of it as a way to listen in on the logger's activity and respond accordingly. Each of the provided functions – `onInit`, `onDispose`, `onLog`, `onDebug`, and `onInfo` – offers a specific hook for these events, allowing you to tailor your reaction to the particular type of action.

## Interface ILoggerInstance

This interface defines how a logger component should behave within the agent swarm system. It builds upon a base logger, adding specific methods to manage its startup and shutdown.

The `waitForInit` method allows you to ensure the logger is properly set up before it begins logging, and it can handle situations where initialization might take some time.

The `dispose` method provides a way to cleanly release any resources held by the logger when it’s no longer needed, guaranteeing a safe and organized shutdown.

## Interface ILoggerControl

This interface gives you controls over how logging works within the system. You can customize the default logging behavior to centralize logging operations, allowing you to manage logs from a single point. It also allows configuring lifecycle callbacks for individual logger instances and even providing your own custom logger constructors. Finally, it provides shortcuts for logging messages—info, debug, and general—specifically tied to a particular client, ensuring messages are tracked correctly and validated for security.

## Interface ILoggerAdapter

This interface outlines how different parts of the system can communicate with logging services. It provides a standard way to send log messages – whether they're regular logs, debug information, or informational updates – for each client. Each method takes a client identifier and a topic, and allows you to include additional details. There's also a way to clean up and release resources associated with a client's logging setup when it's no longer needed.

## Interface ILogger

This interface defines how different parts of the AI agent swarm system report information. Think of it as a standardized way for agents, sessions, and other components to communicate what's happening. 

You can use it to record different kinds of events, from general messages about important changes to very detailed debugging information. The `log` method is for general-purpose reporting, `debug` is for detailed troubleshooting, and `info` is for recording successful actions and confirmations. This logging helps track the system’s behavior, find and fix problems, and monitor its overall performance.

## Interface IIncomingMessage

This interface describes a message coming into the AI agent swarm system. Think of it as a standard way to pass information from outside the system – like a user’s request – to the agents within the swarm.

Each message has a `clientId`, which is like a unique identifier for the client that sent it, helping to track where the message originated. It also includes the `data`, which is the actual content of the message itself, like the user's question or command. Finally, `agentName` specifies which agent is responsible for handling that incoming message, ensuring it gets to the right place within the system.

## Interface IHistorySchema

This interface describes how the system remembers past interactions with AI agents. Think of it as the blueprint for the "memory" component, specifying how the history of messages is stored and accessed. The `items` property is the most important part; it dictates which specific technology (like a database or in-memory storage) is used to keep track of those past messages. This adapter handles the actual saving and loading of the conversation history.

## Interface IHistoryParams

This interface defines how to set up a history record for an AI agent within the system. Think of it as a configuration object that tells the system what information to keep track of for a specific agent. You'll need to specify the agent's name, a unique client ID, and a logger to record any issues. It also allows you to control how much conversational history is stored to prevent the context from getting too large. Lastly, a communication bus is included for the agent to interact within the larger swarm environment.

## Interface IHistoryInstanceCallbacks

This interface defines a set of callback functions you can use to control how agent history is managed and processed. It allows you to customize things like fetching initial history data, deciding which messages are included, and reacting to changes in the history. You can use these callbacks to dynamically adjust the system prompts for agents, filter out unwanted messages, or simply receive notifications about events like adding or removing messages. A reference to the history instance itself is also provided, giving you more direct access if needed. The callbacks also allow you to execute actions at the beginning and end of read operations or when the history instance is initialized or disposed.

## Interface IHistoryInstance

This interface describes how to manage the history of interactions for each AI agent in your swarm. You can use it to fetch and examine past messages, ensure data is loaded initially, add new messages to the record, retrieve the most recent message, and clean up the history when an agent is no longer needed. Think of it as a way to keep a log of what each agent has been doing and saying. 

The `iterate` method lets you step through the history of a specific agent, one message at a time. `waitForInit` ensures the history is ready to go before you start using it. `push` adds new events to the history.  `pop` retrieves the most recent event. Finally, `dispose` allows you to release the resources associated with an agent's history.

## Interface IHistoryControl

This interface lets you fine-tune how the system manages its memory and records actions. You can tell the framework which functions to call at different points in the history lifecycle, like when a new action is recorded or when the history needs to be cleared. It also allows you to provide your own custom way of creating history objects, giving you more control over the underlying data structures. Think of it as customizing the framework's memory management to suit your specific needs.

## Interface IHistoryConnectionService

This interface helps define how different parts of the system interact with historical data. Think of it as a blueprint for safely accessing and managing past interactions within the agent swarm. It's designed to make sure that only the intended, public-facing functions are exposed when working with this historical information, keeping the internal workings separate. By using this interface, we guarantee consistency and clarity in how historical data is handled.

## Interface IHistoryAdapter

This interface lets your application manage a record of interactions between AI agents and clients. Think of it as a way to keep track of what’s been said and done.

You can add new messages to the history using the `push` method, specifying the message content, the client's ID, and the agent's name. To retrieve the most recent message, use `pop`, which removes it from the record. 

If you need to clean up the history for a specific client and agent, the `dispose` method provides a way to clear out all associated data. Finally, the `iterate` method allows you to step through all the recorded messages for a client and agent, letting you analyze the conversation flow or extract useful information.

## Interface IHistory

This interface helps you keep track of all the messages exchanged with an AI model, whether it’s part of a coordinated group of agents or used directly. You can add new messages using the `push` method, and remove the most recent one with `pop`. 

If you need to prepare a set of messages specifically for a particular agent, `toArrayForAgent` will format them based on a prompt and any system instructions.  Alternatively, `toArrayForRaw` allows you to get a complete list of all the messages in their original form.

## Interface IGlobalConfig

This file defines global configuration settings for the AI agent swarm system. Think of it as a central control panel for how the system behaves.

It lets you customize things like how the system handles errors with tool calls (using prompts to "flush" or "recomplete" them), what to do when a model provides an empty response (like adding a friendly greeting), and how much conversation history to keep.

You can fine-tune things like logging verbosity (debug, info, etc.) and how the system handles agent and swarm interactions. It’s also possible to change default functions responsible for setting state or managing storage.

Essentially, it provides a way to tweak the system’s core behaviors without directly modifying the main code. This makes it flexible and adaptable to different use cases. The settings cover areas such as:

*   **Error Handling:** Responding to tool call issues.
*   **User Experience:** Providing helpful responses when the model doesn't output anything.
*   **Logging:** Controlling the level of detail in system logs.
*   **Agent and Swarm Management:** Customizing how agents interact within a swarm.
*   **Storage & State:** Managing how data is saved and retrieved.
*   **Tool Validation:** Ensuring valid tool parameter usage.


## Interface IFactoryParams

This interface lets you customize how your AI agent swarm interacts with users and handles different actions. It allows you to define custom messages or functions that are triggered when the system needs to clear its memory, process tool outputs, send messages, or execute commands. You can tailor these messages based on the user's ID, the name of the agent involved, and the content of the last user message to create a more personalized and controlled experience. Think of it as a way to inject your own voice and logic into the agent’s workflow.

## Interface IFactoryParams$1

This interface lets you customize how your AI agents communicate during navigation. You can provide specific messages or functions to be used when the agent needs to clear its memory (flush), perform an action (execute), or receive results from using a tool. These customizations allow for more tailored interactions and feedback loops within your agent swarm. You can either provide a simple text message for each scenario or a more complex function that generates a message based on the client ID and the default agent.

## Interface IExecutionContext

This interface helps track what's happening during a run of your AI agent swarm. Think of it as a little notebook passed around between different parts of the system. Each entry in the notebook – each `IExecutionContext` – contains a unique ID for the client using the system (`clientId`), a unique ID for the specific task being executed (`executionId`), and a unique ID representing the overall process (`processId`). This consistent labeling helps different services, like the client interface, performance monitoring, and the communication bus, all stay aligned and understand what's going on.

## Interface IEntity

This interface, `IEntity`, acts as the foundation for all the data objects that are stored and managed within the agent swarm. Think of it as the basic blueprint.  Specific types of entities, like those tracking live status or detailed state information, build upon this base to add their unique details. It ensures a consistent structure for all persistent data across the system.

## Interface IEmbeddingSchema

This interface helps you define how your AI agents understand and compare text within the swarm. You can control whether the agent's internal state is saved for later, give your embedding method a unique name, and provide functions for saving and retrieving embedding data – like caching results to avoid recomputation. You can also customize how embeddings are created and compared by providing your own callback functions. The framework provides built-in methods for generating embeddings from text and calculating how similar two embeddings are.

## Interface IEmbeddingCallbacks

This interface lets you listen in on what's happening as embeddings are made and compared. You can use it to track the creation of new embeddings, seeing the text being embedded and the details of the process. Similarly, you can monitor how embeddings are compared to each other, getting information about the text being compared and the resulting similarity score. It's a way to get notifications and perform actions related to embedding generation and similarity analysis.

## Interface ICustomEvent

This interface lets you create and send events with any kind of data you need, going beyond the standard event formats used in the system. Think of it as a way to broadcast information tailored to specific situations or actions within your agent swarm. The `payload` property is where you put that custom data – it can be anything you want, like a status update, a complex object, or even just a simple number. This gives you a lot of freedom to build custom interactions and notifications within the swarm.

## Interface IConfig

This interface, `IConfig`, holds the configuration settings needed when generating diagrams. It's a simple way to control how the diagram is built.  Right now, it only includes a setting called `withSubtree`.  If `withSubtree` is set to `true`, the diagram will include subtrees within the generated visualization.

## Interface IComputeSchema

This interface, `IComputeSchema`, defines the blueprint for a computational unit within the AI agent swarm. Think of it as a recipe that tells the system what a specific task or process looks like and how it should behave. 

It describes essential characteristics like a human-readable description (`docDescription`), whether the compute is shared across agents (`shared`), and a unique name for identification (`computeName`). The `ttl` property sets a time-to-live, determining how long the compute data remains valid. 

Crucially, `getComputeData` outlines how to retrieve the actual data associated with the compute, while `dependsOn` lists any other computes that must be completed first.  `middlewares` allow for custom processing before or after the compute runs, and `callbacks` provide a way to hook into different stages of the computation’s lifecycle.

## Interface IComputeParams

This interface, `IComputeParams`, acts as a set of instructions and tools given to each agent within a swarm. It provides essential information like a unique identifier for the agent (`clientId`), a way to log messages and track progress (`logger`), a communication channel to interact with other agents and the system (`bus`), and a list of events the agent needs to be aware of and react to (`binding`). Think of it as the agent’s starting kit, containing everything it needs to know and do its job within the larger swarm.

## Interface IComputeMiddleware

This interface defines how you can customize the processing of tasks within your AI agent swarm. Think of it as a way to add your own logic before or after an agent executes a task – maybe you want to log the input, validate the results, or retry failed attempts. By implementing this interface, you can inject your own behavior into the core task execution pipeline of the framework, giving you fine-grained control over how your agents work together. It lets you modify the data being passed around and respond to successes or failures in a way that's tailored to your specific application.


## Interface IComputeConnectionService

This interface defines how your AI agents connect to external compute resources, like servers or databases. Think of it as the bridge that lets your agents access and use the tools they need to complete their tasks. It outlines the methods for establishing a secure connection, ensuring agents can reliably interact with those resources. The `connect` method handles setting up the link, while `disconnect` gracefully closes it when the agents are finished.  Implementing this interface allows for flexible integration with different compute environments.

## Interface IComputeCallbacks

This interface defines a set of optional callback functions that you can provide when creating a compute instance. These callbacks let you react to different stages of the compute's lifecycle, allowing your application to respond to initialization, disposal, computation requests, calculation events, and status updates. Think of them as hooks that you can use to monitor and influence the behavior of individual compute units within the agent swarm. You can use `onInit` to perform setup when a compute starts, `onDispose` for cleanup, `onCompute` to handle incoming data, `onCalculate` to respond to calculation requests, and `onUpdate` to receive status changes.

## Interface ICompute

The `ICompute` interface defines the core operations for managing computational tasks within the agent swarm. It lets you trigger calculations (`calculate`), update the status of specific computations (`update`), and retrieve data associated with a computation (`getComputeData`). Think of `calculate` as telling a group of agents to perform a particular task, `update` as checking on their progress, and `getComputeData` as collecting the results they've produced. The type `T` represents the structure of the data returned by `getComputeData`, so you'll need to know the format of that data beforehand.


## Interface ICompletionSchema

This interface describes how to set up a way for your AI agents to generate suggestions or responses within the swarm. You'll use it to give your completion mechanism a unique name, specify whether the output should be JSON, and provide flags to control the underlying language model – think of these flags as special instructions for the AI. 

You can also hook into events after a completion is generated with optional callbacks to customize what happens next. Finally, the `getCompletion` method lets you actually trigger the completion process, giving it some context and tools to work with and getting a response back.

## Interface ICompletionCallbacks

This interface lets you tap into what happens after an AI agent finishes a task. Specifically, it provides a way to be notified when a completion is successfully generated. Think of it as a way to react to the finished product – you can use it to log the results, process the output, or kick off other actions based on the completion. It’s a simple way to extend the framework's functionality and customize how you handle completed tasks.

## Interface ICompletionArgs

This interface defines the information needed to ask the AI agent swarm for a response. Think of it as a structured way to send a request, including who's asking (clientId), which agent should respond (agentName), and what kind of response is expected. 

You can specify an outlineName to guide the AI towards a specific JSON format. The messages property carries the conversation history, letting the AI understand the context.  Tools can be included if the AI needs to use them to generate the response, and an optional format property further refines the expected output.

## Interface ICompletion

This interface defines how your AI agents can get responses from language models. Think of it as the standard way for agents to ask a model a question and receive an answer. It builds upon a basic completion structure, providing a full set of tools for getting those responses.

## Interface IClientPerfomanceRecord

This interface tracks how well a single client, like a user session or agent, is performing within the overall system. It gathers details about its memory usage, state, and how long its operations take.

Each record includes a unique ID for the client, as well as snapshots of its memory and state during operation. The system also logs how many times the client has executed tasks, the total size of input and output data, and the average execution times. Think of it as a detailed performance report for each individual agent or session, helping you pinpoint bottlenecks and areas for optimization.

## Interface IChatInstanceCallbacks

This interface defines a set of callbacks that allow you to react to events happening within a chat instance managed by the AI agent swarm. You'll receive notifications when a chat instance starts up, shuts down, or when a message is sent.  You’re also alerted about changes in activity status and when a new chat session begins. These callbacks provide a way to monitor and potentially influence the behavior of your AI agent swarm's chat sessions.

## Interface IChatInstance

This interface represents a single chat session within your AI agent swarm. Think of it as a container for all the interactions happening between agents in a specific conversation.

You use `beginChat` to start a new conversation, and `sendMessage` to send messages to the other agents participating in that chat. `checkLastActivity` lets you monitor how active the conversation is to manage resources effectively. When you’re done, `dispose` cleanly shuts down the chat session. Finally, `listenDispose` allows you to be notified when a chat session ends.

## Interface IChatControl

This framework lets you easily connect different chat interfaces to your AI agent swarm. The `useChatAdapter` method is how you tell the system which type of chat system you’re using – essentially, you provide a blueprint for creating that chat interface. 

Similarly, `useChatCallbacks` allows you to customize how the chat system interacts with your agents by setting specific functions that get triggered at different points in the conversation flow. This lets you tailor the experience and control certain behaviors.

## Interface IChatArgs

This interface, `IChatArgs`, defines the information needed to send a message to an agent within the system. Think of it as the standard format for communication with individual agents. Each message requires a unique client identifier (`clientId`), the name of the agent responsible for the conversation (`agentName`), and the actual content of the message itself (`message`). Using this structure ensures that messages are routed correctly and that the system knows who is talking to whom.

## Interface IBusEventContext

This interface provides extra information about where an event originates within the system. Think of it as a way to tag events with details about the agent, swarm, storage, state, compute, or policy involved. Client agents typically only use the `agentName` to identify themselves, but other parts of the system might use these other fields to provide more context for swarm-wide or system-level events. It’s like adding labels to events so you know exactly what's happening and where. For instance, you could tag an event with the agent's name ("Agent1"), the swarm it belongs to ("SwarmA"), or the storage it's interacting with ("Storage1").

## Interface IBusEvent

This interface describes the structure of messages sent across the system's internal communication channels, particularly by agents. Think of it as the standard format for agents to tell the system what they're doing and what they’re seeing.

Each message has a source, indicating where it's coming from (usually the agent bus). It also has a type, which clearly defines the purpose of the message, like requesting a task to run or sharing an output.  The message also includes input data, representing any information needed for the event, and output data, containing the results. Finally, a context section provides additional information, often including the agent's name, to help the system understand where the message originated.

## Interface IBus

The `IBus` interface provides a way for different parts of the system to communicate with each other, especially for notifying clients about what's happening. Think of it as a central messaging system.

Agents use this bus to send updates, like when a task is finished, a message is committed, or a tool produces output. These messages are targeted to specific clients, ensuring the right information reaches the intended recipient.

When an agent sends a message, it includes details like the type of event, where it came from, any input data, results, metadata about the agent, and crucially, the client ID it's targeted to.

The `emit` method is how you actually send these messages. It’s asynchronous, meaning the message is added to a queue and delivered later. This allows the agent to continue working without waiting for the message to be sent.

The `clientId` is repeated in the message content as a way to double-check that the message is going to the right place.  It helps keep everything organized and reliable. By using a defined structure and type safety, the bus facilitates consistent communication across the system.

## Interface IBaseEvent

This interface lays the groundwork for all events happening within the system, acting like a common template. Every event, whether it’s a standard system notification or something custom, will inherit from this base. 

Each event will have a `source`, indicating where it came from (like a specific agent or system component). It also includes a `clientId` to make sure the event reaches the right client or agent instance within the system. Think of these as labels ensuring events are routed correctly.

## Interface IAgentToolCallbacks

This interface defines a set of optional functions you can use to interact with and monitor an agent tool as it runs. Think of them as event listeners for different stages of the tool’s lifecycle.

You can use `onBeforeCall` to do things like log the tool being called or prepare data beforehand. `onAfterCall` lets you clean up after the tool finishes or perform actions based on its result. 

`onValidate` gives you a chance to check if the tool's input parameters are correct before the tool even runs, preventing potential errors.  Finally, `onCallError` helps you handle any errors that occur during the tool’s execution, allowing you to log them or attempt recovery. These callbacks give you fine-grained control and visibility into how your agent tools are operating.

## Interface IAgentTool

This interface defines a tool that an AI agent can use, building upon a more general tool interface. Each tool has a name for easy identification within the swarm and an optional description to help users understand how to use it.

You can specify when a tool is available for use, and also implement validation checks to ensure the input parameters are correct before the tool runs.  The framework lets you customize the tool's lifecycle with optional callbacks.

The `call` method is how the tool is actually executed, taking into account details like the client ID, agent name, tool parameters, and whether this is the final call. The tool type is currently fixed to `function`.

## Interface IAgentSchemaInternalCallbacks

This interface provides a set of optional hooks you can use to monitor and react to different stages of an agent’s lifecycle. Think of them as notification points—you can plug in your own functions to be called when something specific happens, like when an agent starts running, produces output, or encounters an error.

You can listen for events such as when the agent is initialized, when tools are requested or when the agent's history needs to be cleared. There are also callbacks for developer messages, assistant messages and user messages, allowing you to track the flow of communication. Error handling is supported with a callback that fires when a tool experiences a problem. Finally, you can monitor when an agent is brought back online after a pause or failure.

## Interface IAgentSchemaInternal

This interface defines how an agent is configured within the swarm. It outlines all the settings that shape the agent's behavior, from its primary instructions to the tools it can use and how it interacts with other agents.

You can give the agent a descriptive name and a helpful description for documentation purposes. The `prompt` setting is crucial, as it provides the core instructions for the agent, while the optional `system` prompts can define tool-calling protocols.

You can limit the number of tool calls and the size of the conversation history, and specify which tools, storage, wikis, and states the agent can access.  You can also define dependencies on other agents and create custom validation and transformation functions for the agent’s output.

Finally, you can hook into various lifecycle events using callbacks to tailor the agent’s execution flow. If the agent is an operator, special functions handle connection to the operator dashboard.

## Interface IAgentSchemaCallbacks

This interface lets you hook into different stages of an agent's lifecycle, allowing you to monitor and potentially influence its behavior. You can define functions to be called when an agent starts running, when it produces output, when it requests a tool, or when it encounters a system message. These callbacks provide visibility into the agent's internal processes and allow for customization or logging of key events like tool usage, message generation, and state resets. You can also be notified when an agent is initialized, disposed, or resurrected after a pause, offering full control over the agent's operational flow.

## Interface IAgentSchema

This interface, `IAgentSchema`, defines the structure for describing an AI agent within the orchestration framework. It allows you to specify instructions or guidelines for each agent, ensuring they operate consistently and effectively. 

You can provide static system prompts using the `system` property, which can be a single prompt or an array of prompts.  `systemStatic` is simply an alternative name for the `system` property.

For more flexibility, the `systemDynamic` property allows you to generate system prompts on the fly. This property accepts a function that can use information like a client ID and agent name to create customized prompts, allowing for dynamic and context-aware agent instructions.

## Interface IAgentParams

This interface defines the information passed to each agent when it runs. Think of it as the agent's configuration.

It includes essential components like a client ID to identify who's interacting, a logger to record what the agent is doing, a communication bus to talk to other agents in the swarm, and a mechanism to use external tools. There's also a history tracker to remember past interactions and a way to generate final responses.

Agents can be given a list of tools they can use, and there’s a validation step to ensure the output is correct before it's sent back.

## Interface IAgentNavigationParams

This interface defines how you can tell the system to create navigation tools for your AI agents. Think of it as a way to set up a specific action an agent can take – like moving to a different agent or location. You'll specify the tool's name, what it does, where it needs to go, and optionally add some extra documentation to explain its purpose. It’s all about defining the pathway for your agents to interact with each other and their environment.

## Interface IAgentConnectionService

This interface helps define how different agents connect and communicate within the swarm. Think of it as a blueprint for building reliable connections – it lays out the structure for managing those links while keeping internal workings separate from what's exposed publicly. It’s designed to make sure the public-facing parts of the agent connection service are consistent and well-defined.

## Interface IAgent

The `IAgent` interface defines how you interact with an agent within the orchestration framework. It lets you run the agent to test things out without affecting its memory, or execute it fully to have it process inputs and potentially update its history.  You can also wait for the agent to finish its work and retrieve the result.

Beyond running the agent, you have methods to manage its internal workings. These methods allow you to add messages to its history – whether they are tool outputs, system instructions, messages from developers, user inputs, assistant responses, or tool requests.  You can even flush the entire history to reset the agent, prevent further tool usage, or cancel ongoing output generation. Effectively, this interface gives you fine-grained control over the agent's lifecycle and the information it processes.
