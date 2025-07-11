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

This function lets you kick off a sequence of tasks, or a "pipeline," within your AI agent swarm. You tell it which client is requesting the work, the specific pipeline you want to run, and which agent should handle it. You can also include some data, called a payload, to help the pipeline do its job. The function will then start the pipeline and eventually return a result, the type of which you can define when you call it. Think of it as the primary way to tell your agent swarm, "Hey, do this thing!"

## Function scope

This function lets you run a piece of code – like a task or a small process – inside a defined environment. Think of it as giving your code a specific set of tools and rules to work with.

You provide the code you want to run, and this function handles setting up the necessary environment for it.  You can also customize which tools are available to your code by providing options to adjust things like the AI agents, how text is generated, or the workflow pipelines. If you don't customize, it will use the default tools provided by the overall system.

## Function runStatelessForce

This function lets you quickly run a message through your AI agent swarm without adding it to the chat history. Think of it as a way to execute commands like processing data or performing one-off tasks without worrying about the history getting too long.

It's different from other functions because it *always* runs the message, even if the agent isn't currently active. You provide the message content and a client identifier to track the request, and the system handles the rest, ensuring a fresh execution environment and keeping track of performance.

## Function runStateless

This function lets you send a single message to an agent in your swarm without it being saved as part of a conversation history. It's perfect for tasks like processing data from external sources or running quick, isolated commands where you don't want to clutter the chat log.

Essentially, you provide the message you want the agent to handle, a unique identifier for your client, and the name of the agent you want to use. The function takes care of checking that the agent is still available and then runs the message, keeping track of how long it takes. It ensures a fresh execution environment for each command. If the assigned agent has been replaced, the function skips the execution to avoid inconsistencies.

## Function questionForce

This function lets you trigger a specific type of question-answering process, even if it might not naturally arise from a conversation. It’s useful when you need to ensure a particular query is addressed within a defined knowledge base. You provide the actual question you want answered, a unique identifier for the system using the question, and the name of the specific knowledge source (wiki) to use for finding the answer. The function then returns the answer it finds.

## Function question

This function lets you send a question or message to an AI agent swarm for processing. It's designed to work within a conversation, associating the question with a specific client, a designated agent, and a relevant knowledge base (wiki). You provide the text of the question, a unique ID for the client asking it, the name of the agent responsible for answering, and the name of the wiki the agent should use to find information. The function then returns the agent's response as a string. 

Essentially, it's the entry point for getting answers from your AI agent swarm.


## Function overrideWiki

This function lets you update the settings for a wiki within the swarm. Think of it as a way to change how a specific wiki operates, whether you're making a small tweak or completely redefining its structure. It's designed to be a direct and isolated operation, ensuring it doesn't interfere with other processes. The function applies the changes you provide, potentially altering aspects like its data structure or behavior. If logging is turned on, it will record that you’re making this change. You provide a set of properties that define how you want the wiki to be modified.

## Function overrideTool

This function lets you modify the way a tool behaves within the AI agent swarm. Think of it as updating a tool's instructions – you can change its capabilities or how it responds to requests. The changes are applied directly to the tool's configuration, ensuring a clear and isolated update process. It’s like giving a tool a quick refresher to improve its performance or adapt to new requirements. You can provide a complete new schema or just a few changes to an existing tool.

## Function overrideSwarm

This function lets you directly change the setup of a swarm within the system. Think of it as providing a new blueprint for how a swarm operates. You can provide a complete new schema or just a few tweaks to an existing one, and it will update the swarm’s configuration. It works independently, ensuring a fresh start for the update process. If logging is turned on, the system will record that this change happened. You pass in the new or modified swarm setup details as a parameter.

## Function overrideStorage

This function lets you change how your swarm system handles data storage. It allows you to update the configuration for a specific storage location, either by completely replacing the existing setup or just modifying parts of it.  Think of it as tweaking the rules for how data is saved and retrieved. It works independently of any ongoing processes, making sure the change is applied cleanly.  If your system is set up to record actions, this override will be logged for tracking purposes. You can provide just a portion of the storage schema to update, extending the default `IStorageSchema`.

## Function overrideState

This function lets you change the structure and properties of a state within the agent swarm. Think of it as modifying the blueprint for how information is stored and shared. You can provide a new or partial schema to update an existing one, and it ensures the change happens cleanly and independently. The system will log this change if logging is turned on, allowing you to track schema modifications. You essentially use this to fine-tune how your swarm manages its data.

## Function overridePolicy

This function lets you modify a policy's configuration within the swarm system. You can update existing policies by providing a new or partial schema, effectively changing how they operate. Think of it as a way to tweak a policy's settings on the fly. The system ensures this change happens in a controlled environment, keeping things isolated. If you’re using logging, the system will record that you’ve made this change. You only need to provide the parts of the policy you want to change; anything you don’t specify will remain unchanged.

## Function overridePipeline

This function lets you modify an existing pipeline definition, allowing you to make targeted adjustments without rewriting the entire thing. Think of it as a way to fine-tune a pipeline—you provide a set of changes, and this function merges them into the original pipeline schema. It's particularly useful for customizing pipelines for different scenarios or payloads. The function takes your partial updates and seamlessly integrates them into the original pipeline definition, making adjustments simple and efficient. You can use it to change individual steps, add new ones, or modify existing configurations.

## Function overrideOutline

This function lets you modify an existing outline – think of it as a blueprint for how your AI agents should work together – within the swarm system. It takes a partial outline schema, essentially providing updates or changes you want to make. To keep things reliable and prevent conflicts, the function operates in a fresh, isolated environment.  If the system is set up to log activity, this modification will be recorded. You provide the new information as a `outlineSchema` containing the outline name and any specific properties you want to update.

## Function overrideMCP

This function lets you modify an existing Model Context Protocol (MCP) schema. Think of it as updating or adding to a blueprint for how AI agents share information. You provide a new or partial MCP schema, and the function merges it with the original, effectively changing the rules for agent communication. It’s useful for making adjustments to existing protocols or incorporating new features. You’re essentially defining how agents will interact and what data they'll exchange.

## Function overrideEmbeding

This function lets you adjust how your agents understand and process information by modifying the underlying embedding schema. Think of it as fine-tuning the way agents interpret text or data. You can provide a complete new schema or just specific changes to existing settings. It makes these changes independently of any ongoing agent tasks, guaranteeing a controlled update. The system keeps a record of these changes if logging is turned on.

## Function overrideCompute

This function lets you adjust how a compute task is handled. Think of it as modifying an existing blueprint for how a task gets executed. You provide a set of changes – perhaps tweaking resource allocation or adjusting execution priorities – and this function merges them into the original compute schema. This is helpful for fine-tuning task behavior without completely redefining the entire process. The input is a partial schema containing the specific changes you want to make.

## Function overrideCompletion

This function lets you adjust how the swarm generates text by changing its underlying completion settings. You can use it to tweak things like the length or style of the responses. It's designed to work independently, making sure your changes are isolated and don’t interfere with ongoing tasks. The system will record these changes if logging is turned on. 

You provide a set of new or modified settings, and this function applies them to the existing completion configuration.

## Function overrideAgent

This function lets you modify an agent's configuration within the system. Think of it as a way to update an agent’s settings, like its capabilities or how it interacts with others. You can provide a complete new schema or just a few changes to existing settings. The system handles this update carefully, ensuring it's isolated from any ongoing processes. If you have logging enabled, you'll see a record of the change. 

You supply the new or updated agent settings as `agentSchema`.

## Function notifyForce

This function lets you push messages out of your AI agent swarm session without triggering any actual processing of incoming messages. Think of it as sending a direct announcement or status update. 

It's specifically for sessions created using the "makeConnection" method and ensures the agent you're sending to is still running. It prepares a fresh environment for the notification and logs what’s happening, and won’t work if your session wasn't established with "makeConnection".

You provide the message content and a client ID to identify where the notification is coming from.

## Function notify

This function lets you send a simple notification message out from your AI agent swarm without triggering any further actions. Think of it as a way to broadcast a message directly to a connected session. It’s specifically for sessions created with “makeConnection,” and it makes sure the agent you’re sending the message through is still available before sending anything. The function also sets up a fresh environment for the message and keeps a log of the operation – and it won't work if the session wasn't created with “makeConnection.”

You provide the notification message itself (the `content`), a unique ID for the client sending it (`clientId`), and the name of the agent that should be associated with the notification (`agentName`).

## Function markOnline

This function lets you tell the system that a particular client is now active and participating in a specific swarm. Think of it as a simple "hello, I'm ready!" signal. You provide the unique ID of the client and the name of the swarm they belong to, and the system updates its records to reflect their online status. It's useful for keeping track of which clients are currently available for tasks within a swarm.


## Function markOffline

This function lets you tell the system that a particular client is no longer active within a specific group of agents. It's how you signal that a client has disconnected or is unavailable. You provide the unique ID of the client and the name of the swarm it's part of, and the system updates its status accordingly. Essentially, it's a way to keep track of which clients are currently online and participating.


## Function listenEventOnce

This function lets you set up a temporary listener for events happening within the agent swarm. You specify which client you want to hear from (or listen to all clients), the event topic to watch for, and a filter to narrow down which events trigger your callback.

When an event arrives that matches your filter, the provided callback function is executed once with the event's data. The function automatically cleans up after itself, removing the listener after the first match. You can also stop listening earlier by using the unsubscribe function it returns. It makes sure you aren't trying to listen to any reserved event names.

## Function listenEvent

This function lets you tune into specific messages being sent between agents in the swarm. You tell it which agent (or all agents) you want to listen to, and which type of message – we call that a “topic”. Whenever a message of that type is sent, a function you provide will be executed, receiving the message's content. Importantly, it returns a way to stop listening, ensuring you can clean up your listeners when they’re no longer needed.  You can listen to messages from all agents using a wildcard client ID.  It's designed to be reliable, ensuring messages are processed in order and protecting against reserved topic names.

## Function json

This function helps you get structured JSON data by following a defined outline – think of it like a recipe for how the data should be organized. You tell it the name of the outline you want to use, and optionally provide some input parameters to guide the data generation. To keep things running smoothly and avoid interference, it uses a special method that isolates each request. Essentially, it's a reliable way to get well-formatted data based on your specified outline.

## Function hasSession

This function helps you quickly determine if a client has an active session. It takes a client identifier as input and returns `true` if a session exists, and `false` otherwise. Behind the scenes, it uses a session validation service to do the actual check. If you’ve enabled logging, the function will also record that it was called.

## Function hasNavigation

This function helps you determine if an agent is actively guiding a client through a particular process. It verifies that the client and agent are valid, then looks at the agent swarm to see if the agent is included in the client's navigation path. Essentially, it tells you whether the agent is currently involved in assisting the client. You provide the client's ID and the agent's name, and it returns a simple yes or no answer. The system also keeps a record of this check if logging is turned on.

## Function getWiki

This function helps you fetch information about a specific wiki within your AI agent swarm. Think of it as looking up the blueprint or structure of a particular wiki. You provide the name of the wiki you're interested in, and it returns a detailed schema describing that wiki. The system also keeps track of these requests if logging is turned on.


## Function getUserHistory

This function lets you get a record of what a user has said or done within a specific session. It pulls all the raw history for a client and then narrows it down to show only the user's interactions. Think of it as a way to see exactly what a user contributed to a conversation or task. You just need to provide the unique ID of the client session you want to investigate. The function handles the technical details behind the scenes, ensuring a clean and logged process.

## Function getToolNameForModel

This function helps you figure out the exact name a specific AI model should use when interacting with a tool. It takes the tool's identifier, the client's ID, and the agent's name as input. This allows the framework to dynamically adjust tool names based on context, ensuring proper communication between agents and AI models. Think of it as translating a tool's internal name into something the model will understand. It’s the key function you’ll use when you need to determine the model-specific tool name.


## Function getTool

This function lets you fetch the detailed structure and capabilities of a specific tool registered within your AI agent swarm. Think of it as looking up the blueprint for a particular tool. You provide the tool’s name, and it returns information about what that tool can do and how it's structured. The system will also record this retrieval if you have logging turned on in your overall setup.

## Function getSwarm

This function lets you fetch the configuration details of a specific AI agent swarm. You provide the swarm's name, and it returns a structured object containing all the settings for that swarm. It's useful for inspecting a swarm's setup or programmatically managing your agent swarms. If your system is set up for logging, this function will also record that it retrieved the swarm's details.

## Function getStorage

This function lets you fetch details about a specific storage area within the agent swarm. Think of it as looking up the blueprint for a particular storage location. You provide the name of the storage you're interested in, and the function returns a description of its structure and what kind of data it holds.  If the system is set up to record activity, this retrieval process will be logged.


## Function getState

This function lets you grab a specific state definition from the system. Think of it as looking up the blueprint for a particular state. You provide the name of the state you're interested in, and it returns the detailed structure that describes it. If the system is set up to record activity, this retrieval will be logged for tracking purposes.

## Function getSessionMode

This function lets you check the current status of a client's session within the swarm. It tells you whether the session is actively running ("session"), attempting to establish a connection ("makeConnection"), or has finished ("complete"). To find out the session mode, you just need to provide the unique ID of the client session. The system verifies that the session exists and records the operation if logging is turned on.

## Function getSessionContext

This function lets you get the current session's information, like who's using it and what resources are available. Think of it as peeking into the current working environment for your AI agents. It gathers details such as a unique identifier for the user, a process ID, and information about the methods and execution environments being used. The function automatically figures out who is using it based on the current situation and doesn't need you to provide any login information. It keeps track of what's happening by logging the operation if that feature is turned on.

## Function getRawHistory

This function lets you access the full, unaltered history of interactions for a specific client’s agent within the swarm. Think of it as getting the complete record, exactly as it was recorded, without any changes or filtering. 

You provide a unique identifier for the client session, and it returns a list of all the messages associated with that session. 

It’s designed to run in a clean environment and records its actions for debugging purposes if enabled. The data returned is a brand new copy of the history, ensuring you’re working with a consistent snapshot.

## Function getPolicy

This function lets you fetch a specific policy definition from the system, using its name. Think of it as looking up a recipe by its title – you provide the policy name, and it returns the detailed instructions (the policy schema). The system keeps track of these policies, and this function provides a way to access them programmatically. If the system is configured to log activity, this retrieval will be recorded. You simply provide the name of the policy you're interested in.

## Function getPipeline

This function lets you fetch the blueprint, or schema, of a specific pipeline within your AI agent swarm. Think of it as requesting the detailed instructions for a particular workflow. You provide the pipeline's name, and it returns a structured representation of how that pipeline is designed. If your system is set up to record activity, this retrieval process will also be logged.

## Function getPayload

This function lets you grab the data – we call it the "payload" – that’s currently being used by the system. Think of it as getting the current task or information the agents are working with. If there’s nothing active right now, it will return nothing, signaling that no task is in progress. The system will also keep a record of this action if it’s set up to do so.


## Function getNavigationRoute

This function helps you find the path an agent has taken within a group (swarm) for a specific client. Think of it as tracing an agent's steps. It uses a service to figure out the route and can optionally record what's happening, depending on how your system is set up. You need to provide the unique ID of the client and the name of the swarm you're interested in to get this route information, which will be returned as a list of agent names.

## Function getMCP

This function lets you fetch the blueprint, or schema, for a specific Model Context Protocol (MCP) from your agent swarm. Think of an MCP schema as a detailed description of how agents communicate and share information. You provide the name of the MCP you're looking for, and the function returns its schema. The system will also record this request if logging is turned on.

## Function getLastUserMessage

This function helps you get the very last message a user sent to the AI agent, specifically for a particular client. It digs into the session history to find the most recent message where the user was actively communicating. If a user message exists, you’ll receive its content as text. If the user hasn't sent any messages yet, it will return nothing. You just need to provide the unique identifier for the client you're interested in.

## Function getLastSystemMessage

This function lets you get the latest message sent by the system during a client's session. It digs into the client's history to find the most recent message marked as coming from the system. If the client hasn’t received any system messages yet, it will return nothing. You just need to provide the unique ID for the client you’re interested in.

## Function getLastAssistantMessage

This function helps you quickly get the most recent message sent by the AI assistant for a specific client. Think of it as retrieving the last thing the assistant "said" in a conversation. 

It digs into the client's conversation history to find the last message where the assistant was the speaker. If no assistant messages are found, it will return nothing. 

You just need to provide the unique ID of the client to get this last message.

## Function getEmbeding

This function lets you fetch the details of a specific embedding that's registered within your AI agent swarm. Think of it as looking up the blueprint for how an embedding works. You provide the name of the embedding you're interested in, and the function returns all the information associated with it, like its structure and how it’s used. If your system is set up to log activity, this function will also record that you requested the embedding details.

## Function getCompute

This function lets you fetch the details of a specific compute resource within your AI agent swarm. Think of it as looking up the configuration for a particular task or tool your agents use. You provide the name of the compute you're interested in, and it returns its schema – essentially, a description of how it works and what it expects. The system will also record this action if you’re using logging to keep track of what’s happening in your swarm.



It’s a simple way to access the blueprint for a compute resource.

## Function getCompletion

This function lets you fetch a specific completion schema, which defines how an AI agent completes a task, using its assigned name. Think of it as looking up the instructions for a particular agent's job. It’s designed to retrieve these instructions from the central system managing all the agent completions. If the system is set up to track activity, it will also record that you requested this schema. You'll need to provide the exact name of the completion you want to retrieve.

## Function getCheckBusy

This function lets you quickly see if an AI agent swarm is currently working on a task. You provide a unique ID that identifies the swarm you’re interested in. The function will then tell you, using a simple true or false, whether the swarm is occupied or available for new work. It's a handy way to manage your agent workflows and avoid overloading the system.

## Function getAssistantHistory

This function lets you see the conversation history of an AI assistant for a specific client session. It pulls all the raw history for that client and then extracts just the messages where the assistant responded. Think of it as a way to review what the assistant has said during a particular interaction. The function ensures a reliable environment for fetching this information and keeps a record of the retrieval if logging is turned on. You'll get back a list of messages, each showing what the assistant communicated. To use it, you need to provide the unique identifier for the client session you want to examine.

## Function getAgentName

This function helps you find out the name of the agent currently handling a specific client's session within your AI agent swarm. You provide the client's unique identifier, and it returns the agent's name. It's designed to be reliable, checking that the client and swarm are valid and ensuring a clean execution environment. Essentially, it's a simple way to identify which agent is responsible for a particular client interaction.

## Function getAgentHistory

This function lets you look at the conversation history for a particular agent within your swarm. It's designed to pull that history, taking into account any rescue strategies the system uses to improve the agent's responses. You'll need to specify the client's ID and the agent's name to get the history. The system verifies these details and logs the request for tracking purposes. It's built to run independently, ensuring a clean environment for retrieving the agent's history.

## Function getAgent

This function lets you fetch the details of a specific agent within your AI agent swarm. You provide the agent’s name, and it returns all the internal information associated with that agent. The system also keeps a record of this retrieval if logging is turned on in your overall settings. Think of it as looking up an agent’s profile within the swarm. You need to know the exact name of the agent you're searching for.

## Function fork

This function lets you run a piece of code within a controlled environment, which is useful when coordinating multiple AI agents. It takes a function you want to execute and some settings to manage how that function runs. The function you provide will be given a unique identifier (clientId) and the name of the agent it’s associated with. This setup simplifies things like creating sessions, checking for errors, and cleaning up afterward, so you don’t have to worry about those details yourself. Essentially, it’s a way to run code reliably within the larger system of AI agents working together.


## Function executeForce

This function lets you send a message or command directly to the currently active agent in your swarm. Think of it as forcing the agent to take action, even if it seems like it shouldn't be active right now. 

It's particularly useful for things like checking what a tool has produced or starting a conversation from the agent back to your application.  

You provide the message you want the agent to handle, and a unique identifier for your client session. The system takes care of making sure everything's set up correctly, tracks the process, and keeps you informed along the way.

## Function execute

This function lets you send messages or commands to a specific agent within your AI agent swarm. Think of it as a way to have the agent process something on your behalf, like reviewing a tool’s result or starting a conversation.

It makes sure the agent is still participating in the swarm and handles the execution carefully, tracking its performance and notifying the system of its progress. The function also ensures that the environment is clean before running the command and keeps track of relevant information. 

You'll need to provide the message content, a unique identifier for your client session, and the name of the agent you want to address.

## Function event

This function lets your AI agents communicate with each other within the swarm. Think of it as sending a message to a specific channel – you give the message a name (the topic) and a unique sender ID (the client ID), along with the actual data you want to share. 

It's designed to keep things organized and prevent conflicts by ensuring you don't use names reserved for important system messages.  The function ensures that the event is properly formatted and sent to the swarm’s messaging system, enabling other agents to listen and react to the information.

## Function emitForce

This function lets you directly send a string as output from the AI agent swarm, effectively simulating the agent’s response without processing an actual message. It's intended for specific scenarios where you're managing connections through `makeConnection` and want to control the output stream. The system ensures everything is set up correctly before sending the output, verifying the session and swarm, and it won’t work if you haven't established a connection the right way. You provide the text you want to send, along with a unique identifier for the client connection.

## Function emit

This function lets you send a string as output from an agent within the swarm, essentially simulating a response without processing an actual incoming message. It's specifically for connections made using `makeConnection`, ensuring the session and agent are still valid and active before sending the output. 

Think of it as a way to inject a response when you need to, like for testing or specific workflows. The function checks that the agent hasn't been replaced and sets up a fresh environment to keep things clean. It also records the action if logging is turned on and won’t work unless you’re using a connection made with `makeConnection`.

You'll need to provide the content you want to send, a unique ID for the client session, and the name of the agent that should be sending the output.

## Function commitUserMessageForce

This function lets you directly add a user's message to the agent's conversation history within a swarm session. It’s a forceful action, meaning it adds the message even if the agent isn’t currently active.

Think of it as a way to manually update the agent's memory.

You’re providing the message content, the session mode, a client ID to identify the source, and optionally some extra data. The system handles the details of ensuring the session is valid and safely adding the message to the history. It operates independently of any existing processes to keep things clean and reliable.

## Function commitUserMessage

This function lets you add a user's message to an agent's history within a swarm session, essentially documenting the interaction without immediately prompting a response from the agent.

Think of it as quietly recording what a user said to an agent, keeping the agent "alive" and participating in the overall swarm activity.

You provide the message content, a mode setting, a client identifier, and the agent’s name.  An optional payload can be included as well. 

Behind the scenes, the system makes sure everything is set up correctly, logs the action if logging is enabled, and then securely adds the message to the agent's history. The function operates independently to avoid interference with other processes.

## Function commitToolRequestForce

This function allows you to directly submit tool requests to an agent in the swarm, even if some validation steps might normally be skipped. It's useful when you need to ensure a request goes through quickly and reliably. 

Essentially, you provide a list of tool requests and the client's ID, and the system will push those requests to the active agent. The function handles setting up the necessary environment and keeping track of what’s happening behind the scenes with logging. It’s like giving the agent a direct instruction to execute those requests right away.

## Function commitToolRequest

This function sends a set of tool requests to a specific agent within your AI agent swarm. It’s how you tell an agent what task it should perform. Before sending the requests, the system makes sure the agent is valid and that the connection is secure. It also keeps track of what's happening with logging, ensuring everything is recorded properly. You’ll need to provide the requests themselves, a client identifier, and the name of the agent you’re targeting.

## Function commitToolOutputForce

This function lets you directly save the results from a tool back into the agent's memory, even if the agent might not be actively responding. It's a way to ensure the agent has the latest information from the tool, useful in situations where you want to proceed without waiting for confirmation from the agent. 

You provide the tool's ID, the tool’s output content, and a client identifier to track the session. 

Essentially, it pushes the tool's results into the system, bypassing some usual checks to make sure everything happens smoothly.

## Function commitToolOutput

This function is how agents in a swarm share the results of using tools. It takes the tool's ID, the result of its use (the content), the client's ID, and the agent's name to ensure everything is properly recorded. 

Think of it as an agent saying, "Here's what I found using this tool!" and making sure the system knows who did what and where it belongs. 

It’s designed to be extra careful, checking that the agent is still authorized to share the results and keeping things clean by running independently of other ongoing tasks. The `toolId` uniquely identifies the tool used, while `content` holds the result.

## Function commitSystemMessageForce

This function lets you directly push a system message into a session, bypassing the usual checks for which agent is active. It's a powerful tool for situations where you need to ensure a system message is delivered immediately, regardless of the current agent’s status. 

Essentially, it validates that the session and swarm exist, then commits the message. 

You’ll need to provide the message content itself and the client ID that’s associated with that session. Think of it as a more forceful version of a regular system message commit.

## Function commitSystemMessage

This function lets you send messages directly to an agent within the swarm system. These messages aren't typical responses from an assistant; they’re used for things like sending configuration updates or control instructions to the agent.

Before sending the message, the system double-checks that the agent, the session it belongs to, and the overall swarm are all valid and that the agent you’re targeting is actually the right one.

It handles sending these system messages securely and keeps track of what’s happening through logging. It's designed to work alongside functions that handle assistant responses, providing a way to manage the internal workings of the agent swarm.

You'll need to provide the content of the message, a client ID to verify the session, and the name of the agent you want to send the message to.

## Function commitStopToolsForce

This function provides a way to immediately halt tool execution for a particular client within the system. It's a forceful way to stop things, bypassing usual checks to ensure a quick stop. 

Think of it as a way to urgently pause the workflow for a client – it doesn't care about what's currently happening, it just stops it.

It works by validating the session and the swarm before proceeding, and then uses various services to make the stop happen, carefully logging all actions along the way. It's similar in behavior to a forceful flush operation within the system.

You need to provide the client's ID to specify which client's workflow should be paused.

## Function commitStopTools

This function lets you temporarily pause a specific AI agent within your swarm. It’s like putting a temporary hold on what that agent is doing next.

It makes sure everything is set up correctly – confirming the agent and client are valid – before stopping the tool execution. This is a way to manage the flow of tasks for your AI agents, different from clearing past interactions.

You're providing the client's ID and the agent's name to specify exactly which agent's next action you want to prevent. It's a targeted way to control the sequence of operations in your system.


## Function commitFlushForce

This function allows you to force a clear-out of an agent's history for a specific client. It's a more direct way to flush history compared to a standard flush, skipping checks to ensure the agent is active or running. 

Think of it as a "reset" button for an agent's memory, useful when you need to make absolutely sure the history is cleared, regardless of the agent’s current status.

The function handles security and validation behind the scenes, making sure the session and swarm are legitimate before proceeding with the clear-out. It logs everything it does for tracking and debugging purposes.  You provide the client's ID to identify the session you want to affect.

## Function commitFlush

This function clears the entire conversation history for a particular agent working on behalf of a specific client. Think of it as a "reset" for that agent's memory within the system.

Before clearing the history, the function carefully checks to make sure the agent and the client are valid and exist within the swarm. 

It's designed to be used when you need to wipe the slate clean for an agent, instead of adding new messages – a good option for starting fresh or correcting errors. It handles all the necessary validation and logging behind the scenes to keep everything running smoothly and securely. The client ID and agent name are critical pieces of information needed to identify the agent's history to be flushed.

## Function commitAssistantMessageForce

This function lets you directly push a message from an assistant into a session, bypassing the usual checks for which agent is currently active. It's useful when you need to ensure a message is recorded, even if there’s uncertainty about the agent handling the session.

Essentially, it forces the message to be saved, verifying the session and swarm first to make sure everything is in order.

You provide the message content and the client ID, and the function handles the rest, including validating the session and swarm, saving the message, and keeping a record of the operation. Think of it as a more forceful version of a standard message commit, similar to how `cancelOutputForce` works compared to `cancelOutput`.

## Function commitAssistantMessage

This function lets you record messages generated by an AI agent within the swarm system. Think of it as saving the agent's response so it's preserved for later use or review. 

It carefully checks that the agent, the client using it, and the overall system are all valid before saving the message.  The process involves several checks and balances to ensure everything is in order.

You provide the message content, a client identifier, and the agent's name to use when recording the message. This is how you ensure the message is linked to the correct agent and client within the swarm. It’s designed as an alternative to canceling an agent's output; instead of discarding it, you save it for future reference.

## Function changeToPrevAgent

This function allows you to switch a client back to a previously used agent, or to the default agent if no previous agent was used. Think of it like a "back" button for agent selection within a client's session. It verifies that the client session and the intended agent are valid before making the change, and it handles the switching process safely using a queue and time limits. The function ensures this transition happens independently of any ongoing operations. You just need to provide the unique identifier for the client's session to trigger the agent switch.

## Function changeToDefaultAgent

This function helps reset a client's active agent back to the standard, pre-defined agent within the swarm. Think of it as a way to easily revert to a baseline agent configuration for a specific client. It ensures the session is valid and the default agent is correctly set before making the change, and it handles the process securely and reliably by queuing it for execution. To avoid interference with other ongoing operations, the switch happens in a controlled, isolated environment. You'll need to provide the unique identifier for the client session to initiate the reset.

## Function changeToAgent

This function lets you change which AI agent is actively managing a client's session within your swarm. It's designed to safely switch agents, making sure everything is validated and dependencies are met before the change happens. The process is handled carefully, with logging and a queuing system to ensure reliability. Essentially, it allows you to dynamically reassign client interactions to different agents as needed. 

You'll need to provide the name of the agent you want to activate and the unique ID of the client session you're managing.

## Function cancelOutputForce

This function lets you quickly and forcefully stop an AI agent from sending more output for a particular client. It’s designed to be more direct than other cancellation methods, skipping checks to ensure a swift response. 

Essentially, it ends the agent's output stream by sending an empty signal, regardless of what the agent is currently doing. 

It handles session and swarm checks behind the scenes and keeps track of everything with logging, making sure everything runs smoothly and safely. You just need to provide the client's ID to tell it which output to cancel.


## Function cancelOutput

This function lets you stop an agent from continuing to generate a response for a particular client. It's useful if you need to interrupt a process and clear out any pending output.

Essentially, you provide the client’s ID and the agent’s name, and the system will halt the agent's activity and send an empty response.

Before it cancels anything, it makes sure everything is set up correctly: the client is valid, the agent is registered, and the overall environment is sound. 

It also handles the behind-the-scenes work like managing the execution context and keeping track of what’s happening with logging.


## Function addWiki

This function lets you bring new knowledge sources into the system by defining a "wiki" – essentially a structured way to store and retrieve information. You provide a schema that describes how this wiki is organized, and the function will add it to the orchestration framework. Think of it as creating a new, searchable database of knowledge for your agents to use. The function returns a unique identifier for the newly added wiki.

## Function addTriageNavigation

This function lets you set up a special tool for your AI agents, allowing them to easily connect with a designated "triage agent" when they need assistance or further guidance. It's like creating a dedicated pathway for agents to escalate issues or seek specialized help. You provide some configuration details through the `params` object, and the function handles registering this navigation tool so it's ready for use. Essentially, it streamlines the process of directing agents to the right support.


## Function addTool

This function lets you add new tools that agents in the swarm can use. Think of it as adding new capabilities to the system – like giving an agent the ability to search the web or access a database. 

Before an agent can use a tool, you need to register it using this function. The tool's schema, which includes its name and how it works, is provided as input. 

The registration happens in a clean, isolated environment, and the function confirms the tool’s name after it’s added to the system.

## Function addSwarm

This function lets you create a new group of AI agents, essentially setting up a workspace for them to collaborate. Think of it as defining a specific project or task that these agents will work on together. You provide a description of the group – what they're designed to do, what agents will be involved, and how they're structured. Once created, this group is officially recognized by the system and used to organize client sessions. The system ensures a clean environment when registering a new group, and you’ll receive a name to identify it.

## Function addStorage

This function lets you register new ways for the swarm to store data, like connecting to a database or cloud service. Think of it as adding a new tool to the swarm’s storage toolbox. Only storages registered this way are recognized by the system. 

If the storage is meant to be shared among multiple agents, this function automatically sets up the connection and waits for it to be ready. It makes sure the registration happens in a safe and isolated way, independent of any ongoing processes. After successful registration, you’re given the storage's unique name to use for referencing it later.

You provide a schema that describes how the new storage engine works, including its name and whether it's shared.

## Function addState

This function lets you define and register new states within the agent swarm system. Think of it as telling the swarm, "Hey, I'm adding a new type of information we need to track!"

Each state has a schema that describes its structure and whether it's shared amongst agents.  If a state is shared, this function also makes sure it's properly connected and ready to use. 

Only states registered this way will be recognized by the swarm, ensuring consistent management of data.  The function handles the registration process cleanly and returns the name of the newly registered state.

## Function addPolicy

This function lets you define and register rules – we call them policies – that will guide the behavior of agents within your swarm. It’s like setting up guardrails to ensure everyone follows the same guidelines. 

Essentially, you provide a schema that describes the policy, and the system takes care of registering it for validation and managing its details. This helps keep things consistent and predictable as your swarm operates, working alongside functions like commitAssistantMessage to create a robust operational framework. You’re telling the system, “Here's a new rule we need to follow.”

## Function addPipeline

This function lets you define and register a new workflow – we call these workflows "pipelines" – within the system. Think of it as telling the framework, "Hey, I have a new process I want to use!" It takes a description of the pipeline, checks to make sure it's correctly formatted, and then adds it to the system's internal list of available workflows. The function returns a unique identifier for that newly registered pipeline, so you can easily refer to it later. You can define pipelines with different types of input data – the `Payload extends object = any` part handles that flexibility.

## Function addOutline

This function lets you add a new outline structure, essentially a blueprint for how agents will organize their work, into the AI agent swarm. It registers this structure so the system knows how to validate and manage outlines. To keep things running smoothly and prevent conflicts, it starts with a fresh slate before adding the new outline. The system will also record this action if logging is turned on. You provide the outline schema itself as input, which includes the outline's name and its settings.

## Function addMCP

This function lets you add a new Model Context Protocol (MCP) schema to the orchestration framework. Think of an MCP schema as a blueprint for how an AI agent shares information with others in the swarm. When you call `addMCP`, you're essentially telling the system about a new way agents can communicate and collaborate. The function takes the schema definition as input and returns a unique identifier for that registered schema.

## Function addEmbedding

This function lets you add new embedding engines – think of them as tools for understanding and comparing text – to the swarm system. When you add an embedding this way, the swarm knows how to use it for things like creating vector representations of text or figuring out how similar different pieces of text are.  To make sure everything runs smoothly and cleanly, it executes in a dedicated environment. It then confirms the embedding's name after it's successfully registered for use. You’ll need to provide a schema that defines how the new embedding engine works and what settings it needs.

## Function addCompute

This function lets you define and register the blueprints for how your AI agents will perform tasks. Think of it as setting up the instructions for each agent to follow.

When you use this function, it checks that your instructions are correctly formatted and then saves them so the system knows how to run them.

You’re essentially telling the system: “Here’s a new way for agents to work, and it looks like this.” The function returns a unique identifier for the registered compute schema.

## Function addCompletion

This function lets you add a new completion engine, like a specific AI model or framework, to the system so your agents can use it. Think of it as registering a new tool for your agents to generate responses. 

You provide a description of the engine – its name and how it's configured – and the system makes it available for use. This is done in a protected way, keeping the process isolated. 

The function then confirms the addition by returning the name of the newly registered completion engine.

## Function addAgentNavigation

This function lets you set up a way for agents in your system to find and interact with each other. It essentially creates a "navigation tool" that allows one agent to be directed to another, specifying how they'll connect. You provide some configuration details – the `params` – and the function then creates and registers this navigation tool. The function returns a string that represents the identifier for this newly created navigation link.

## Function addAgent

This function lets you register new agents so they can be part of the swarm. Think of it as adding an agent to the system's list of available workers. 

To use an agent with the swarm, you *must* register it using this function. It ensures the agent’s details are properly validated and that it's ready to be used. The registration happens in a way that keeps the process isolated from other ongoing operations.  You’ll receive the agent’s name back as confirmation it was added successfully. 

The `agentSchema` tells the system everything it needs to know about the new agent, including its name and how it’s configured.

# agent-swarm-kit classes

## Class WikiValidationService

This service helps you manage and check the structure of your wikis. You can think of it as a librarian ensuring each wiki follows a defined format. 

First, you tell the service about each wiki you want to monitor, providing its name and a description of its expected structure – this is done using the `addWiki` function.  Then, when you have some content for a wiki, you can use the `validate` function to confirm that the content aligns with the schema you previously defined.  The `loggerService` property is used internally for logging messages, and `_wikiMap` is an internal data structure that stores the wiki schemas.

## Class WikiSchemaService

This service helps manage and work with the structure and rules (schemas) of your wikis. It keeps track of different wiki schemas, allowing you to register new ones, update existing ones, and retrieve them when needed. The service relies on a logger to keep track of what’s happening and a schema context service to handle all the schema-related operations. You can register a new schema by giving it a unique key, and if a schema already exists, you can modify parts of it using the override function. When you need to use a specific schema, you can simply request it by its key.

## Class ToolValidationService

This service is responsible for making sure the tools used by your AI agents are properly configured and unique within the swarm. It keeps track of all registered tools and their specifications.

You can add new tools to the service using `addTool`, which ensures that each tool name is unique. 

The `validate` function checks if a tool exists before it's used, helping to prevent errors and ensure smooth operation – it's designed to be fast thanks to caching. The service logs its actions to help with debugging and monitoring. It works closely with other components like the tool registration service and the agent validation process.

## Class ToolSchemaService

This service manages the definitions of tools that agents use to perform tasks. Think of it as a central catalog where agent tools are registered, stored, and retrieved. It ensures these tool definitions are structurally sound before they’re used.

The service works closely with other components in the system: it gets information about schemas from one service, provides tools to agents during their setup, and makes these tools accessible to the overall swarm. It keeps a record of tools and validates them to ensure they’re properly formatted.

You can register new tools, update existing ones, or simply retrieve a tool’s definition by its name. The system can log its actions, providing insight into how tools are being managed. It's a key element in how agents interact with and execute tasks within the swarm.

## Class ToolAbortController

The ToolAbortController helps you manage the process of stopping ongoing tasks, especially when dealing with asynchronous operations. Think of it as a way to politely tell a running task to stop what it's doing.

It creates and manages an `AbortController` behind the scenes, letting you access a signal that can be used to request cancellation.

If your environment doesn’t natively support `AbortController`, this class gracefully handles that by simply doing nothing.

The `abort` method is your trigger – it sends out the cancellation signal to any operations that are listening for it.

## Class SwarmValidationService

This service acts as a central point for ensuring the configurations of your AI agent swarms are correct and consistent. It keeps track of all registered swarms and their details, making sure there are no duplicates and that the agents and policies associated with each swarm are valid.

You can use it to register new swarms, retrieve lists of agents or policies for a specific swarm, or get a complete list of all registered swarms. The core function is the `validate` method, which double-checks the details of a swarm to make sure everything is set up as it should be, improving the reliability of your agent system. This service is designed to be efficient, remembering previous validation results to avoid unnecessary checks.

## Class SwarmSchemaService

This service acts as a central hub for defining and managing the blueprints for your AI agent swarms. Think of it as a library where you store the instructions that tell your agents how to work together. It keeps track of these instructions (called "swarm schemas") and makes sure they’re well-formed before using them.

It makes sure each schema is valid, verifying things like the list of agents and the policies they follow. This helps prevent errors when setting up and running your swarms.  It's used by other parts of the system to fetch the right configurations, like the list of agents or their assigned policies.

The service uses a special registry to store these schemas, allowing it to quickly retrieve and update them.  It also keeps a log of what’s happening, which can be helpful for troubleshooting. You can even dynamically update existing swarm schemas, allowing you to make changes on the fly.

## Class SwarmPublicService

This service acts as the public interface for interacting with a swarm of AI agents, providing a way for external systems to control and monitor the swarm's operations. It carefully manages communication and context for each interaction, ensuring everything is properly scoped to a specific client and swarm.

Essentially, it delegates most of the heavy lifting to underlying services, but adds a layer of safety and control. Logging is enabled for information-level events, which can be toggled off.

Here's a breakdown of what you can do with this service:

*   **Send messages:**  You can broadcast messages to the swarm for a specific client.
*   **Manage Navigation:**  You can control the swarm's "navigation stack" to move between agents.
*   **Check Status:**  See if the swarm is currently busy with a task.
*   **Control Output:** Cancel ongoing output or wait for output from the swarm.
*   **Get Agent Details:** Retrieve the name or the full details (instance) of the currently active agent.
*   **Manage Agents:** Set the active agent's name or assign a specific agent instance.
*   **Clean Up:**  Safely dispose of the entire swarm and release its resources.

Each of these operations is carefully tracked and executed within a defined context, providing a controlled and informative way to work with the AI agent swarm.

## Class SwarmMetaService

The SwarmMetaService helps organize and visualize the structure of your agent swarms. It takes the raw information describing a swarm – things like the agents involved and how they interact – and transforms it into a standard UML diagram format. This makes it much easier to understand the overall architecture of a swarm, especially for documentation or debugging purposes.

It works by pulling in information about the swarm’s schema and the individual agents using other services, then building a tree-like representation. This tree is then converted into a UML string that can be used to generate diagrams. The process can be logged for troubleshooting, and it’s designed to work seamlessly with other services like those responsible for documentation and agent management. Essentially, it's a tool for turning complex swarm definitions into clear, visual representations.

## Class SwarmConnectionService

This service acts as a central hub for managing connections to and operations within AI agent swarms. It efficiently reuses swarm instances by caching them, ensuring quick access for various operations like agent navigation, output handling, and lifecycle management.

Here's a breakdown of what it offers:

*   **Centralized Swarm Management:** It handles creating and managing swarm connections for a specific client and swarm name.
*   **Efficient Reuse:** It avoids recreating swarms repeatedly by caching them, speeding up operations.
*   **Communication:** It allows emitting messages to a session and retrieving output from active agents.
*   **Navigation Control:** It provides methods to navigate between agents, including popping the navigation stack or getting the current agent's name and details.
*   **Status and Control:** It provides ways to check if a swarm is busy and to cancel pending output.
*   **Cleanup:** It handles the disposal of swarm connections when they're no longer needed.

Essentially, it provides a clean and efficient way to interact with and control AI agent swarms within a system.

## Class StorageValidationService

This service helps keep track of and ensure the configurations for your storage systems are correct and consistent within the swarm. It acts like a central registry, making sure each storage is uniquely identified and set up properly. 

It works closely with other services to register new storage systems, operate on them, and check that the embeddings used with them are valid. This service remembers previously validated configurations to speed up the validation process.

You can use it to add new storage systems to the registry and to check if a specific storage is set up correctly and ready to use. It logs any actions and errors to help with troubleshooting.

## Class StorageUtils

This class provides tools for managing data storage associated with individual clients and agents within the swarm. Think of it as a central hub for interacting with storage, making sure everything is authorized and tracked.

It allows you to retrieve a limited number of items based on a search query (`take`), insert or update items (`upsert`), delete items by their unique ID (`remove`), get individual items (`get`), list all items with optional filtering (`list`), create an index to help organize data (`createNumericIndex`), and completely erase all data for a specific client and agent (`clear`).

Before any action is taken, the system verifies that the client is authorized and that the agent is properly registered for accessing the specified storage. Each operation is also carefully logged for auditing purposes.


## Class StorageSchemaService

The StorageSchemaService acts as a central librarian for storage configurations within the system. It keeps track of how different parts of the swarm access and manage storage, ensuring everything is set up correctly.

Think of it as a registry where you define the rules for storing and retrieving data. These rules include things like how to create indexes and where to find related embedding information. 

This service is crucial for coordinating various components like client-specific storage, shared storage, agent configurations, and even the public storage API. It makes sure everyone follows the same guidelines for how storage is used, and it keeps a record of these configurations for easy access.  Validation checks happen to keep things running smoothly, and logging helps track what's happening behind the scenes. You can add new configurations, update existing ones, and retrieve them when needed.

## Class StoragePublicService

This class manages storage specifically for individual clients within the system. Think of it as a way to keep each client's data separate and organized. It handles common storage operations like retrieving, saving, updating, deleting, listing, and cleaning up data.

It works closely with other parts of the system, like the agent that interacts with clients and the service that tracks performance, ensuring everything is handled efficiently and securely.  Each operation is logged for debugging and monitoring, but this can be controlled by a global setting.  It's important to note that this service deals with client-specific storage; a different service handles system-wide storage.

Here’s a quick rundown of what each method does:

*   **`take`**: Searches and retrieves a list of items, potentially sorted by a score.
*   **`upsert`**: Saves or updates an item.
*   **`remove`**: Deletes an item.
*   **`get`**: Retrieves a single item.
*   **`list`**: Retrieves all items, with an option to filter them.
*   **`clear`**: Deletes all items.
*   **`dispose`**: Cleans up the storage area for a specific client.

## Class StorageConnectionService

This service is the central hub for managing how your AI agents interact with storage – think of it as the librarian for your agent’s data. It's responsible for creating, retrieving, and cleaning up storage spaces for individual agents, and it smartly reuses those spaces to save resources.

When an agent needs to store data, this service creates a dedicated storage area for it. If the storage is meant to be shared across multiple agents, it delegates that responsibility to another service.

The service also handles requests to retrieve data, update items, and even completely clear out storage spaces.  It keeps track of which storage spaces are used by agents and makes sure they're cleaned up properly when no longer needed.

Essentially, it streamlines storage operations for your agents, ensuring everything is organized, efficient, and secure. It uses a smart caching system to prevent unnecessary setup and cleanup, and it provides a consistent way to manage storage regardless of whether it's private to an agent or shared across many.

## Class StateValidationService

This service helps manage and verify the structure of data representing the state of your AI agents. Think of it as a quality control system for agent states. 

You use it to define what a valid state looks like for each agent—essentially, the expected shape and types of the data.  

The `addState` method lets you register each agent's state definition, outlining its expected format. Then, the `validate` method checks if the actual data coming from an agent matches that defined structure, flagging any inconsistencies so you can correct them. The service uses a logger to record its actions and potential errors.

## Class StateUtils

This class provides a simple way to handle and manage data associated with individual clients and agents within the swarm. You can easily retrieve existing state information, update it with new values or calculations based on what's already there, and completely reset the state to its original condition. Before any of these operations happen, the system checks to make sure the client is authorized and the agent is properly registered, and logs everything for tracking purposes. It provides the get, set and clear methods to work with client data.

## Class StateSchemaService

The StateSchemaService acts as a central hub for managing how your AI agents understand and use data. It’s responsible for keeping track of state schemas, which define the structure and rules for accessing specific pieces of information. Think of it as a librarian, ensuring that each schema is properly registered and accessible.

This service relies on a registry to store these schemas and performs a basic check to confirm they’re reasonably well-formed before adding them. It works closely with other services to configure client states, support agent execution, and handle state references within agent schemas.

You can register new schemas, override existing ones to make changes, or retrieve a schema when you need it. The service also keeps a log of these actions, so you can monitor how states are being managed within your agent swarm. It helps ensure consistency and reliable access to state information for all components of your system.

## Class StatePublicService

This service manages state specifically tied to individual clients within the swarm system. Think of it as a way to keep track of information unique to each client interacting with the swarm. It’s different from system-wide state and persistent storage.

It provides a public interface for setting, clearing, retrieving, and cleaning up this client-specific data.  When you need to update a client’s state, like during an execution step or to track performance metrics, this service handles the underlying mechanics. Logging is enabled for detailed tracking, giving you insights into what’s happening with each client’s data. It works closely with other services like ClientAgent and PerfService to provide a complete picture of the swarm's operation.

## Class StateConnectionService

This service manages how different parts of the system keep track of and change data, especially for individual clients. Think of it as a central hub for client-specific data – it's responsible for creating, retrieving, updating, and cleaning up this data. 

It smartly reuses existing data whenever possible by caching it. If a client needs the same data again, it doesn't have to be recreated, making things faster and more efficient.  It also handles different types of data – sometimes dealing with data specific to a client, and other times delegating the work to a shared service for data that’s used across multiple clients. 

This service works closely with other components – logging events, tracking usage, and managing configurations – ensuring everything runs smoothly and securely. When a client is finished with a piece of data, the service cleans it up to free up resources and prevent conflicts. Shared data isn't cleaned up here; that's handled separately.

## Class SharedStorageUtils

This class offers tools to interact with the shared data space used by your AI agents. Think of it as a central repository where agents can store and retrieve information they're collaborating on.

You can use it to fetch data – specifying a search term and how many results you want.  It also lets you add new data or update existing data within this shared space.  Need to clean things up? You can remove specific items or even clear the entire storage area. To examine the contents, you can retrieve individual items or list all items, potentially filtering them based on certain criteria. Each operation is carefully checked to ensure it’s valid and properly logged.

## Class SharedStoragePublicService

This class provides a public way to interact with the swarm's shared storage system. It handles retrieving, adding, updating, and removing data, acting as a middleman between client requests and the underlying storage mechanisms. Think of it as a controlled access point for managing data across different parts of the system.

It keeps track of what’s happening by logging operations, and it's designed to work closely with other services like the agent system, performance tracking, and documentation tools.

Here's a breakdown of what you can do with it:

*   **`take`**: Retrieves a list of items based on a search query.
*   **`upsert`**: Adds a new item or updates an existing one.
*   **`remove`**: Deletes a specific item.
*   **`get`**: Retrieves a single item.
*   **`list`**: Retrieves all items, potentially filtered.
*   **`clear`**: Empties the entire storage.

Essentially, this class provides a safe and manageable way for different parts of the system to share and utilize data.

## Class SharedStorageConnectionService

This service manages shared storage – think of it as a single, central location for storing data accessible by different parts of the system. It ensures everyone’s using the same storage instance, preventing conflicts and maintaining consistency.

When you need to access or modify data in this shared space, it retrieves a cached version of the storage using `getStorage`, guaranteeing that only one copy exists.  Methods like `take`, `upsert`, `remove`, `get`, `list`, and `clear` are all provided for interacting with the data, mirroring functionality offered elsewhere and providing data persistence. It keeps track of everything happening through logging and works closely with other services to handle configurations, embeddings, and events. Essentially, it's the backbone for organized, shared data within the swarm.

## Class SharedStateUtils

This class provides tools to help agents in a swarm share information and coordinate their actions. Think of it as a central whiteboard where agents can read, write, and erase notes. 

You can use it to get the current value of a shared piece of information, set a new value for something everyone needs to know, or completely wipe the slate clean for a specific item. The system automatically handles logging and communication with the underlying shared state service, simplifying the process for individual agents.

## Class SharedStatePublicService

This service provides a public interface for managing shared data across your swarm system. Think of it as a central place to store and retrieve information that different parts of the system need to coordinate. It handles operations like setting, clearing, and getting this shared data, ensuring it's done in a controlled and traceable way.

Behind the scenes, it uses other services to actually manage the data storage and handles logging to keep track of what's happening. Different components of the system, like client agents and performance tracking tools, rely on this service to share and manage their state. It's designed to be flexible, working with different types of data thanks to its generic type support.

## Class SharedStateConnectionService

This service manages shared data across your AI agent swarm. Think of it as a central repository that all agents can access and modify, but in a controlled way.

It keeps track of shared state using a technique called memoization, which means it reuses existing data whenever possible to avoid unnecessary work and ensure efficiency. This also makes it thread-safe, preventing conflicts when multiple agents try to update the data simultaneously.

You can retrieve, update, and clear this shared state using methods like `getState`, `setState`, and `clearState`.  These operations are carefully orchestrated to ensure consistency and are logged for monitoring purposes. It works closely with other services in your system, such as those handling logging, event propagation, and state configuration. It also handles ensuring that shared state is correctly initialized and persisted.

## Class SharedComputeUtils

This toolkit provides utilities for managing shared computing resources within your AI agent swarm. It helps you interact with and track the status of these resources, making sure your agents have what they need to run effectively.

The `SharedComputeUtils` class offers a straightforward way to get data about specific computes, allowing you to check their availability or configurations.  You can use it to retrieve information about a compute by providing a client ID and the compute's name. 

The `update` function allows you to refresh the information associated with a particular compute, ensuring you're working with the latest details. Essentially, it helps you keep track of and refresh the status of your shared computing resources.

## Class SharedComputePublicService

This component manages how your AI agents share and utilize computational resources. It acts as a central point for coordinating tasks across multiple agents, making sure they work together efficiently.

Think of it as a traffic controller for your agents' processing needs. The `getComputeData` method allows agents to request information about available computational power, while `calculate` triggers a computation to be run and `update` manages the updating the state of compute. It leverages a connection service to handle the underlying communication with the shared compute environment, and a logger to track what's happening.

## Class SharedComputeConnectionService

This service helps your AI agents easily share and use computational resources. Think of it as a central hub where agents can request and access pre-defined computing tasks.

It manages connections to these computational resources, providing a way to retrieve references to them and ensuring agents are using the right ones. You can request a specific computational task by name, and this service will handle getting you a connection to it. 

It also provides a way to trigger calculations related to shared state, keeping everyone on the same page. Finally, it allows for refreshing the computational resources, making sure your agents have the latest versions. 

The service relies on other components to handle logging, messaging, managing context, managing shared state, and defining computational schemas.

## Class SessionValidationService

This service manages sessions within the system, keeping track of how agents, storage, histories, states, and computes are being used within each session. It helps ensure that sessions are valid and resources are being used correctly. 

It uses logging for important actions and is designed to work closely with other services like session management, agent activity tracking, and swarm schema services.  Think of it as a central record-keeper for session activity.

The service keeps track of session details in several maps, like which swarm is associated with a session or which agent is actively using it.  You can add or remove usage details for different resources like agents or storage, and the service provides methods to check if a session exists or get a list of all sessions. 

The `validate` method is particularly important—it checks if a session is active and caches the result for efficiency.  Finally, you can remove a session entirely or just clear its validation cache.

## Class SessionPublicService

This service acts as the public interface for managing interactions within a swarm session. It handles messages, commands, and overall session flow, delegating tasks to other services for core functionality and context management. Think of it as a translator - it takes requests from the outside world (like a client agent) and turns them into actions within the swarm, while also ensuring everything is logged and tracked for performance and debugging.

It provides methods like `emit`, `execute`, and `run` that allow external systems to send messages, run commands, and establish connections to the session. Behind the scenes, it utilizes services for logging, performance tracking, execution validation, and event handling, ensuring a consistent and reliable session experience.  Functions like `commitToolOutput` and `commitSystemMessage` manage the session history, while `dispose` cleans up resources when the session is finished.  Essentially, it's the central hub for all public interactions with a session within the swarm system.


## Class SessionConnectionService

This class manages connections and interactions within a swarm system, essentially acting as a central hub for sessions. It cleverly reuses session instances to improve efficiency, caching them based on client and swarm information. Think of it as a facilitator, coordinating various components – from agent execution to policy enforcement – to ensure smooth operation within a defined scope.

It handles communication (sending notifications, emitting messages, executing commands, and running stateless completions). The class also facilitates tool usage and tracks historical events like tool requests and messages.  Ultimately, this service helps keep sessions connected, secure, and performing optimally.

It makes sure that many processes like communication, tool usage, and data tracking are handled securely and efficiently within a session.


## Class SchemaUtils

This class provides helpful tools for working with data within client sessions and formatting information for communication. You can use it to store and retrieve data associated with a specific client session, ensuring the session is valid during these operations. It also lets you easily convert objects or arrays of objects into strings, useful for sending data between different parts of the system, and allows for customizing how keys and values are represented in that string.

## Class RoundRobin

This class provides a simple way to rotate through a list of functions or creators, ensuring each one gets a turn. Think of it like a round-robin tournament where each participant gets a chance to act.

You give it a list of "tokens" – these are identifiers for each function you want to cycle through.  It then creates a special function that, when called, will execute the function associated with the next token in the list. 

The `create` method is the key – it's how you generate this rotating function based on your tokens and the function that creates instances based on each token. It's helpful when you need to distribute workload evenly or switch between different implementations.


## Class PolicyValidationService

This service helps ensure that policies used within the swarm system are valid and properly registered. It keeps track of all registered policies and their details, making sure no duplicates exist. 

The service works closely with other components: it gets information about policies from the PolicySchemaService, enforces those policies through the ClientPolicy, might check policies related to individual agents via the AgentValidationService, and uses a LoggerService to record what's happening. 

You can register new policies with their descriptions, and the service will make sure they’re unique.  When a policy needs to be used, this service verifies that it’s been registered correctly, speeding up the process through a technique called memoization, which remembers results to avoid repeated checks.

## Class PolicyUtils

This class provides helpful tools for managing client bans within your AI agent swarm. It allows you to easily ban, unban, and check the ban status of clients, all while ensuring the process is secure and trackable. 

You can use this class to programmatically block unwanted clients from interacting with your swarm, remove those blocks when needed, and quickly verify if a client is currently banned. Before taking any action, the class performs checks to make sure everything is valid, and all actions are logged for auditing purposes.


## Class PolicySchemaService

This service acts as a central place to store and manage the rules that govern how agents within the swarm system operate. It keeps track of these rules, ensuring they're valid and accessible to different parts of the system. When a new rule is added or an existing one is updated, this service verifies its basic structure. It's designed to work closely with other services, like the ones that enforce policies and manage agent activity, ensuring everyone follows the established guidelines. The system logs actions taken, allowing for troubleshooting and auditing.

## Class PolicyPublicService

This service handles all the public-facing actions related to policies within the swarm system. Think of it as the main entry point for checking if a client is banned, validating data, or managing bans themselves. It works closely with other services like logging, performance monitoring, and client interaction to ensure consistent and controlled policy enforcement. 

Essentially, it provides a standardized way for different parts of the system to interact with policies, ensuring checks and actions are performed securely and reliably.  It logs important events when enabled, which helps with troubleshooting and monitoring policy adherence.  You can use it to check if a client is blocked, validate data they're sending or receiving, or even apply or remove bans.

## Class PolicyConnectionService

This service manages how policies are applied to clients interacting within different "swarms" in the system. It’s a central point for enforcing rules and controlling access based on defined policies.

It keeps track of client bans and messages, and can validate both incoming data and outgoing results against defined policy rules. It also provides a way to ban or unban clients from a swarm.

This service smartly reuses policy information to avoid unnecessary work, and is designed to work closely with other services throughout the system to ensure consistent policy enforcement. Logging is enabled depending on configuration settings.

## Class PipelineValidationService

This service helps ensure your AI agent pipelines are set up correctly before they run. It acts like a quality control checker, making sure the structure and definitions of your pipelines match what's expected.

You can add pipeline definitions to this service, essentially telling it what your pipelines should look like. Then, when you're ready to run a pipeline, you can use the validation function to check if it’s properly configured. The service keeps track of the pipelines it knows about internally. It also uses a logger to provide feedback on validation successes or failures.

## Class PipelineSchemaService

This service helps manage and track the blueprints, or schemas, that define how your AI agents work together in a swarm. It's like a central library for agent workflows.

The service keeps track of these workflows using a registry, allowing you to easily store, update, and retrieve them. You can register new workflow blueprints, override existing ones with changes, and access them by name.

It works closely with a schema context service, ensuring that the workflows are valid and consistent. This context service handles all the details of managing schema-related information. 

The `validateShallow` property provides a quick way to check a schema without extensive validation, while the logger service provides tools for troubleshooting and monitoring the system.

## Class PersistSwarmUtils

This class helps you manage how your AI agent swarm's activity is saved and retrieved. Think of it as a way to remember which agent a user is currently using and the path they're taking through different agents.

It lets you save and load information about active agents—the agent currently being used—and navigation stacks—a record of the agents a user has interacted with.  These are stored separately for each swarm and linked to a specific user session.

You can customize how this saving and loading happens by providing your own storage solutions. This lets you use different methods to persist the data, like in-memory storage or a custom database.

Essentially, it provides a flexible way to track and manage the user experience and agent interaction within your AI agent swarm.

## Class PersistStorageUtils

This class helps manage how data is saved and retrieved for each client within the swarm system. It's like a central organizer for keeping track of information related to a specific user or session.

The core function is to provide a way to get and set data for each client, using a named storage area. If the data isn't already saved, you can provide a default value.

You can also customize how the data is stored persistently by providing your own storage adapter, giving you control over where and how the information is kept. This lets you integrate with different storage solutions like databases or specialized storage services. Essentially, it simplifies storing and accessing client-specific data.

## Class PersistStateUtils

This utility class helps manage and save information for each client and state within the swarm. It lets you store and retrieve data, like agent variables, so things can be remembered later. 

It makes sure that each type of state has its own storage instance, making it efficient.

You can even customize how the data is stored, swapping out the default method for something tailored to your needs, such as an in-memory or database solution.

The `getState` function will load saved information, and if nothing is found, it can use a default value you provide.

## Class PersistPolicyUtils

This utility class helps manage how policy information, specifically lists of banned clients, is saved and retrieved within your AI agent swarm. It makes it easy to check if a client is currently banned from a particular swarm and to update that list of banned clients. 

The class uses a clever system to make sure only one persistence mechanism is used per swarm, which helps with efficiency. You can even customize how this persistence happens by providing your own "adapter" – letting you store the policy data in places like an in-memory cache or a database, instead of relying on the default behavior. 

Essentially, it provides a streamlined way to control client access and maintain policy information across your swarm.

## Class PersistMemoryUtils

This class helps manage how memory is saved and retrieved for each user session in the system. It ensures that memory data is persisted efficiently using a customizable storage mechanism. 

You can use it to get and set memory data associated with a specific user session, and it automatically handles creating and reusing the storage instance for each session to prevent unnecessary overhead. 

The system also lets you plug in your own custom memory storage solutions if the default isn't suitable. When a session is finished, you can use the cleanup method to release the memory storage.

## Class PersistEmbeddingUtils

This class helps the swarm system remember and reuse embedding data, which are numerical representations of text or other information. It's like a smart cache for embeddings.

You can use this class to read existing embedding data from storage or to save newly computed embeddings for later use. This avoids having to re-calculate the same embeddings repeatedly, which can save a lot of processing time.

The system uses a "factory" to manage how it saves and retrieves these embeddings, and you have the flexibility to customize this factory to use different storage methods, like in-memory storage or a database.

It also keeps track of embedding data based on unique "string hashes," so it can efficiently find the right embedding when needed.

## Class PersistAliveUtils

This class helps keep track of which clients are online and offline within your AI agent swarm. It's like a simple attendance record for your agents.

The class remembers the online/offline status of each client (identified by a unique ID) for a specific swarm. It lets you easily tell the system when a client becomes active or inactive, and also lets you check if a client is currently online.

You can customize how this status is stored, allowing you to use a simple in-memory solution or a more robust database if needed. This gives you flexibility in managing the persistence of client status information.


## Class PerfService

The `PerfService` is responsible for tracking how well your AI agent swarm is performing. It measures things like how long tasks take, the size of the data being processed, and the overall state of the system.

Think of it as a detailed performance monitor for your agents. It logs information about each execution, combines data for individual clients, and provides overall system metrics.

The service relies on other components (like validation and public services) to gather information.  You're able to pull data about execution counts, time spent, input/output sizes, and system state to create comprehensive performance reports.

Key actions it handles include starting and stopping execution tracking, retrieving metrics for individual clients or the entire system, and preparing data for reporting.  It makes sure you have the data you need to understand and optimize your AI agent swarm's performance.


## Class OutlineValidationService

The OutlineValidationService helps keep track of and verify the structure (or “outline”) used by agents in the swarm. It’s responsible for ensuring each outline is unique and exists before agents try to use it. 

It uses a map to store these outlines, making it easy to find and manage them. When you add a new outline, the service confirms it doesn’t already exist.  When you need to validate an outline, it quickly checks if it’s registered, remembering the results to speed up future checks. This service also logs important actions, like adding or validating outlines, to help with monitoring and debugging. The service receives the logging functionality through a dependency injection system.

## Class OutlineSchemaService

The OutlineSchemaService helps manage the blueprints – or schemas – that guide your AI agents within the swarm system. Think of it as a central place to store and update these instructions. It uses a tool registry to keep track of them and is designed to work smoothly with other parts of the system, including logging and schema management. 

You can register new schemas, update existing ones with partial changes, and easily retrieve them when needed. Before any schema is added or updated, it's checked to ensure it's properly formatted. The service also keeps a record of its actions, providing insights into how schemas are being used and managed.

## Class OperatorInstance

This class represents a single instance of an operator within your AI agent swarm. Think of it as a specific agent taking on a task.

Each operator instance is identified by a client ID and a name, and it can be configured with callback functions to handle specific events.

You can connect to receive answers from the operator using `connectAnswer`, send notifications with `notify`, provide answers back to the system using `answer`, and receive messages from other agents with `recieveMessage`. When an operator's work is complete, you can release its resources with `dispose`.

## Class NavigationValidationService

This service helps manage how agents move around within the system, making sure they don't get lost or repeat their steps. It keeps track of where agents have already been when navigating, avoiding unnecessary movements and optimizing efficiency. 

The service uses a logger to record navigation events, aiding in debugging and monitoring. A key feature is its ability to remember navigation paths, ensuring that routes aren't lost between different calls.

You can start fresh with a client's navigation route, clear out any existing paths, and discard routes when they are no longer needed. The system will let you know when navigation is allowed or blocked and logs these actions for visibility.

## Class NavigationSchemaService

This service keeps track of the names of navigation tools used within the system. It essentially maintains a list of recognized tools.

You can register a new tool name using the `register` method, which also logs the action if logging is enabled.

To check if a particular tool name is already registered, use the `hasTool` method. This method also logs the check if logging is turned on.

## Class MemorySchemaService

The MemorySchemaService acts as a temporary, in-memory storage for data associated with individual sessions within the system. Think of it as a scratchpad for each session, allowing different components to store and retrieve small amounts of session-specific information. It’s designed to be lightweight and doesn't handle persistent storage or data validation; it’s purely for runtime use.

You can use it to store data related to a session, like configuration settings or intermediate results, and then retrieve or clear it as needed. This service works closely with other system components, such as the SessionConnectionService and ClientAgent, and uses logging to track its operations. Essentially, it’s a simple way to provide a bit of extra memory for each session without adding complexity related to long-term data storage.

## Class MCPValidationService

This class helps you manage and check the structure of Model Context Protocols, or MCPs. Think of MCPs as blueprints for how different AI agents share information.

It keeps track of all the MCPs you're using in a handy collection. 

You can easily add new MCP blueprints to this collection, and it provides a way to verify that an MCP exists and is correctly defined. A logger is used to record what's happening as you add and validate these MCPs.

## Class MCPUtils

This class, MCPUtils, helps manage updates to the tools used by clients participating in the Multi-Client Protocol (MCP). Think of it as a central place to ensure everyone's using the latest versions of their tools. You can use it to push updates to all connected clients at once, or to target a single client specifically. It simplifies the process of keeping everyone synchronized and ready to work together.

## Class MCPSchemaService

This service helps manage the blueprints, or schemas, that define how AI agents interact and share information within a swarm. Think of it as a central library where you store and organize these blueprints.

It lets you add new blueprints to the library, update existing ones with modifications, and easily find the blueprint you need by its name.

The service relies on other components to help with logging and managing the overall context of these blueprints, making sure everything works together smoothly. It also has a built-in check to quickly verify the basic structure of a new blueprint before adding it.

## Class MCPPublicService

This class provides a way to interact with Model Context Protocol (MCP) operations, allowing you to manage and use tools within a defined environment. It handles tasks like listing available tools, verifying if a tool exists, executing tools, and cleaning up resources when they're no longer needed. 

You can use it to see what tools are available for a particular client, refresh the list of tools, or check if a specific tool is accessible.  It also lets you actually run a tool, providing its name, parameters, and client context, and then returns the tool’s output. Finally, it includes a mechanism for properly disposing of resources to keep things tidy.

## Class MCPConnectionService

This service manages connections and interactions with Model Context Protocols (MCPs), which are essential for agents to use tools. Think of it as the central hub that lets agents discover, use, and clean up after using tools.

It keeps track of MCP connections, using a cached system to quickly retrieve them when needed and allowing for control over that caching.

The service provides ways to:

*   Find out what tools are available to an agent.
*   Refresh the list of available tools, either for all agents or just one.
*   Check if a specific tool exists for an agent.
*   Actually run a tool for an agent, passing in the necessary information.
*   Clean up resources when an agent is finished.

It relies on other services for logging, communication, and handling method context information, making it a well-integrated part of the larger system.

## Class LoggerService

This class provides a centralized way to handle logging within the system. It makes sure logs are written to both a general system log and a client-specific log, providing flexibility and detailed information for debugging and monitoring.

It automatically includes important context information like the client ID and execution details in each log entry, making it easier to track down issues. You can control which types of logs are recorded (debug, info, normal) through configuration settings.

The system also allows you to easily swap out the main logging mechanism at runtime, useful for testing or customizing logging destinations. This lets you redirect logs to different places like a file or the console without changing the core code.

## Class LoggerInstance

This class helps manage logging for individual clients within your system. It allows you to customize how logs are handled, including whether they appear in the console and how they're processed through custom callbacks.

When you create a `LoggerInstance`, you provide a client ID and optional callback functions to control its behavior. The `waitForInit` method makes sure the logger is properly set up before it starts logging. 

You can use the `log`, `debug`, `info` methods to record messages, which will be displayed in the console if enabled and then passed to any custom callbacks you’ve defined.  Finally, `dispose` cleans up the logger instance, allowing for controlled shutdown and execution of a final `onDispose` callback.

## Class HistoryPublicService

This service manages how history information is accessed and modified for agents within the swarm system. It provides a public interface for interacting with agent history, acting as a layer on top of the core history connection service.

It keeps track of events like messages and actions, and provides ways to add new entries, retrieve the most recent ones, convert the history into lists for processing, and clear the history when it’s no longer needed. 

The service integrates with other components to provide a consistent approach to logging and context management, ensuring that history operations are properly tracked and associated with the right agent and client. You're able to view and manipulate an agent's history through this service, useful for tasks like retrieving logs, preparing context for agents, or cleaning up resources.

## Class HistoryPersistInstance

This class handles keeping track of a conversation's history, saving it both in memory and on disk. Each instance is tied to a specific client identifier. 

It initializes by loading previous messages from storage, and provides methods for adding new messages, retrieving the last message, and iterating through the entire history. When adding or removing messages, it can also trigger callback functions for custom actions. Finally, you can dispose of the history, completely clearing it if necessary. This component helps ensure that conversations are remembered and can be revisited later.

## Class HistoryMemoryInstance

This component keeps track of a conversation's history within the agent's memory, but it doesn't save it permanently – it's all held in memory. 

When you create an instance, you give it a unique identifier (clientId) and can optionally provide functions to be triggered during different actions.

The `waitForInit` method ensures the history is properly set up for a specific agent. 

You can loop through the history using `iterate`, and new messages are added with `push`. If you need to remove the most recent message, `pop` will retrieve and delete it. 

Finally, `dispose` clears the memory, either for a single agent or for the entire system.

## Class HistoryConnectionService

This service is responsible for managing the history of interactions with individual agents within your system. Think of it as a central hub for tracking what happened during an agent's execution.

It cleverly uses a caching mechanism to avoid creating redundant history records, making it efficient. When you need to access or create history for a specific client and agent, it retrieves a cached version if available, or creates a new one.

It's tightly integrated with other services in the system, like the logging and event handling systems, ensuring consistent behavior and proper tracking. You're able to retrieve the agent’s history, add new messages, remove the latest message, or convert the history into different formats depending on the use case, such as formatting the history for an agent to use or for reporting purposes. When no longer needed, the service cleans up resources and clears the cached history.

## Class ExecutionValidationService

This service helps manage and validate the execution flow within your AI agent swarm. It keeps track of how many times an action has been triggered for a particular client and swarm, preventing runaway or deeply nested executions.

You can retrieve the current execution counts using `getExecutionCount`, providing the client and swarm identifiers. If you need to increase the execution count, use `incrementCount`, which also includes checks for excessive nesting. `decrementCount` is used to reset the count when an execution is complete, and `flushCount` clears all tracked executions for a specific client and swarm. Finally, `dispose` completely removes the execution count data from the system for a client and swarm.

## Class EmbeddingValidationService

This service is like a gatekeeper for embedding names within the system. It keeps track of all the registered embeddings and makes sure they’re unique and actually exist when they're used. 

It works closely with other services – the embedding registration service, where embeddings are initially added, and the storage service that uses embeddings for searches. If an agent needs to use a specific embedding, this service ensures it’s valid. 

The service adds new embeddings to its internal registry, ensuring no duplicates are added. When you need to verify if an embedding name is legitimate, this service quickly checks its records, remembering past checks to make the process more efficient. It also uses logging to keep a record of what it's doing.

## Class EmbeddingSchemaService

This service acts as a central hub for managing how data is represented as embeddings within the system. It's like a librarian for embedding definitions, ensuring they're correctly formatted and available for various parts of the system to use.

It keeps track of embedding schemas – essentially, instructions on how to convert data into a numerical form suitable for comparisons and searches. These schemas are stored and retrieved using a reliable registry, and a quick check is performed to make sure each schema is structurally sound before it’s added.

Different parts of the system, like the storage and agent components, rely on these schemas to perform tasks such as similarity searches and embedding generation. When changes or updates to embedding logic are needed, this service provides a way to override existing schemas, ensuring the entire system stays synchronized. The process of managing these schemas is also monitored and logged for debugging and auditing purposes.

## Class DocService

This class is responsible for creating documentation for your AI agent swarm system, including schemas for swarms, agents, and performance data. It essentially helps you understand and debug your system by generating clear, organized documentation.

The `DocService` uses various other services (like schema validation and performance tracking) to gather information. It leverages a thread pool for efficient processing and logs activity depending on a global configuration setting.

Key functionalities include:

*   **Generating documentation:** It produces Markdown files describing swarms and agents, complete with visual representations (UML diagrams) to help you understand their structure.
*   **Performance Reporting:** It can create JSON files containing performance metrics for both the entire system and individual clients (like ClientAgent instances). This helps track resource usage and identify performance bottlenecks.
*   **Organized Output:** It structures the generated documentation into a logical directory system for easy navigation.

By automating the documentation process, this class ensures your system's design and operation are well-documented, promoting better development practices and easier troubleshooting.

## Class ComputeValidationService

This class, `ComputeValidationService`, helps manage and validate how different computing tasks fit together within a larger system. It essentially acts as a central hub for defining and checking the structure of these computing tasks.

You can think of it as a way to make sure your computing tasks are well-defined and compatible with each other. The `addCompute` method lets you register new computing tasks, specifying their expected structure. `getComputeList` lets you see which tasks are currently managed. The `validate` method is the core functionality – it checks if a particular task (identified by name) is correctly structured based on its definition.  The service relies on other services like `loggerService`, `stateValidationService` and `stateSchemaService` to handle logging, state validation and schema management respectively.

## Class ComputeUtils

This class, ComputeUtils, provides tools for managing and retrieving information related to computational resources within the agent swarm. You can use it to update the status of a specific compute instance, identifying it by a client ID and compute name.  It also allows you to fetch data about a compute resource; you can specify the type of data you expect when retrieving it, making it flexible for different needs. Think of it as a way to check in on and gather details about the computing power being utilized by your agents.

## Class ComputeSchemaService

The ComputeSchemaService helps manage and organize different schema definitions for your AI agents. Think of it as a central repository where you store and retrieve these schema blueprints.

It uses a logger to keep track of what's happening and relies on a schema context service to handle schema-related operations.

You can register new schema definitions, replace existing ones, or simply retrieve a schema when you need it. The service makes it easy to keep your schema definitions organized and accessible throughout your AI agent swarm orchestration framework.

## Class ComputePublicService

This class, `ComputePublicService`, acts as a bridge for interacting with compute resources. It uses a logger for tracking activity and relies on another service, `computeConnectionService`, to handle the actual communication with those compute resources. 

You can think of it as providing a set of public methods for requesting data (`getComputeData`), triggering calculations (`calculate`), applying updates (`update`), and cleaning up resources (`dispose`). Each of these actions is associated with a specific method name, a client identifier, and the name of the compute resource involved, ensuring proper tracking and management of requests.

## Class ComputeConnectionService

This class is responsible for managing connections and data related to computational tasks within the AI agent swarm. It handles fetching references to computational units, retrieving data, and orchestrating the execution of calculations based on state.

The class relies on several other services for logging, communication, context management, schema validation, session handling, state persistence, and sharing computational resources. 

You're able to retrieve a reference to a specific computational unit using `getComputeRef`, which allows you to interact with it. `getComputeData` retrieves the data associated with the computational process.  `calculate` triggers the actual computation process based on a given state name.  Finally, `update` and `dispose` allow you to refresh the data and clean up resources related to the computational tasks.

## Class CompletionValidationService

This service helps keep track of completion names used within the agent swarm, making sure they’re unique and properly registered. It acts as a gatekeeper, verifying that completion names are valid before they're used by agents.

It keeps a list of all registered completion names and uses this list to check if a given name is allowed. To make this process fast, it remembers the results of previous validations.

The service works closely with other parts of the system: it gets information about new completions from the completion registration service, verifies agent completions with the agent validation service, and provides usage feedback to the client agent. It also uses a logging system to keep track of what’s happening and to help debug any issues.

## Class CompletionSchemaService

The CompletionSchemaService acts as a central hub for managing the logic that agents use to complete tasks. It keeps track of these completion routines, ensuring they're valid and accessible to different parts of the system. Think of it as a library of pre-defined actions that agents can call upon.

It verifies each routine when it's added or updated, and provides a way to look them up by name. The service works closely with other components like agent setup, agent execution, and schema management, making sure everything is properly connected and functioning. It also logs its activities to help with monitoring and troubleshooting. This ensures that the agents within the swarm have the correct tools to do their jobs.

## Class ClientSwarm

This class, `ClientSwarm`, is the central manager for a group of AI agents working together. Think of it as the conductor of an orchestra, ensuring all the agents play in sync.

It keeps track of which agent is currently active, handles moving between agents (like navigating a history), and manages waiting for output from those agents. It also has a system for quickly canceling those waits if needed.

The system relies heavily on notifications, so other parts of the application are immediately aware of any changes, like when an agent is switched or an output is received. It works closely with other components like the connection service (to set up the agents), the session manager (for running the agents and handling their output), and a notification bus (to broadcast updates).

Essentially, it provides a structured way to control and monitor a swarm of AI agents, ensuring they work together effectively and responsively. You can check if the swarm is busy processing something, and it provides ways to change agents, handle output, and cancel operations.

## Class ClientStorage

This class manages how data is stored and retrieved within the AI agent swarm, providing a way to search for similar items based on their characteristics. It's designed to work with other parts of the system, like the agent that interacts with the data and the service that handles connections to external storage.

Think of it as a central repository for information, allowing agents to both add new data and quickly find related items. Operations like adding, removing, or clearing data are handled in a controlled, sequential manner to prevent conflicts.  The system intelligently creates "embeddings," which are numerical representations of the data, to allow for fast similarity searches.

Here's a breakdown of what it does:

*   **Storing and Retrieving Data:** Provides methods to add (upsert), remove, and retrieve data items.
*   **Similarity Search:** Allows agents to find items similar to a given search term.
*   **Controlled Updates:** Ensures updates to the data happen in the correct order, preventing issues.
*   **Efficient Search:** Uses embeddings and optimized algorithms for quick and effective searches.
*   **Clean-up:** Handles disposing of the storage when it's no longer needed, ensuring a clean shutdown.


## Class ClientState

This class manages a single piece of data within a larger system of AI agents. Think of it as a container holding information that different agents need to work with. It keeps track of changes to this data, allowing different parts of the system to react to updates.

It's designed to handle requests to read and write the data safely, even if multiple agents are trying to access it at the same time. The class also allows for custom actions to be performed when the data is changed, and it can notify other parts of the system when changes happen. When the data is no longer needed, the class ensures resources are properly released. Essentially, it’s a controlled and observable data point for the swarm.

## Class ClientSession

The `ClientSession` acts as a central hub for managing interactions within a swarm of AI agents. Think of it as a dedicated workspace for a user interacting with the swarm. It handles sending messages, validating them against pre-defined rules, and coordinating the execution of those messages by the agents.

When a message needs to be processed, the `ClientSession` uses a dedicated agent to run it, ensuring the output is safe and conforms to policy. It also tracks the history of messages and actions taken within the session, allowing for things like resetting the state or stopping ongoing tasks. 

The `ClientSession` also provides a way to connect to the session, enabling real-time communication and allowing external systems to send and receive messages. Finally, when the session is no longer needed, the `dispose` method ensures that everything is cleaned up properly. It's designed to keep the interaction organized and manageable within the overall swarm system.

## Class ClientPolicy

The `ClientPolicy` class is responsible for managing security and restrictions for clients interacting with the swarm. It acts as a gatekeeper, checking if a client is banned, validating their messages, and applying rules defined by the swarm’s policies.

This class keeps track of banned clients, fetching that list only when needed to keep things efficient.  It can automatically ban clients that violate the rules and provides customized messages when bans occur. 

The `ClientPolicy` works closely with other parts of the system to ensure smooth operation, including validating messages sent to and from clients, managing bans, and communicating events about those actions. It's a central component in maintaining the security and proper functioning of the swarm.

## Class ClientOperator

The ClientOperator acts as a bridge, allowing you to interact with and control an AI agent swarm. Think of it as the main interface for sending instructions and receiving results. 

It's initialized with configuration settings and provides methods for various actions, though some of these actions like running, committing tool output, or assistant messages are currently not functional. You'll use methods like `execute` to send instructions, `waitForOutput` to get results, and `commitUserMessage` to provide user input.  The `commitAgentChange` method manages transitions between different agent configurations, and `dispose` cleans up resources when you’re finished. Essentially, it provides the core functionality for orchestrating and managing the agents within the swarm.

## Class ClientMCP

The ClientMCP class helps your application manage and interact with tools for AI agents. Think of it as a central point for knowing what tools are available to each agent and for running them.

It keeps track of the tools available to each agent, avoiding repetitive fetching and keeping things efficient through caching. You can easily check if a particular tool exists for a specific agent, or get a complete list of tools.

If the list of tools changes, you can refresh the tool lists, either for individual agents or for all of them. When you want an agent to use a tool, you simply call the `callTool` method, providing the tool's name and the necessary data.

Finally, when an agent’s work is complete, you can release associated resources using the `dispose` method, ensuring a clean shutdown.

## Class ClientHistory

This class keeps track of all the messages exchanged with a specific agent within the swarm system. It's like a memory log for the agent, allowing it to remember past interactions.

The class stores these messages and provides ways to retrieve them, either as a full, unfiltered history or a customized selection specifically formatted for the agent’s use in generating responses. Think of it as preparing the agent’s context for a new task.

You can add new messages to the history, remove the most recent one to undo actions, or get a list of messages ready for the agent to use. 

When an agent is finished, this class helps clean up and free up resources that were used to store the message history. It connects to other parts of the system to make sure everything works together smoothly.

## Class ClientCompute

The `ClientCompute` class is designed to handle the core processing and data management for a specific compute task within a larger AI agent swarm. It's built to interact with a compute object and manages its lifecycle.

When creating a `ClientCompute` instance, you're providing it with initial configuration parameters that guide its operation. It exposes methods for retrieving compute data, performing calculations based on the current state, updating its internal state, and gracefully cleaning up resources when finished. Think of it as a dedicated worker responsible for a piece of the overall swarm's intelligence. 

It utilizes internal symbols (`__@DISPOSE_SLOT_FN_SYMBOL@3078`, `__@GET_COMPUTE_DATA_FN_SYMBOL@3079`) to handle specific functionalities related to cleanup and data retrieval, but you won't typically interact with those directly.

## Class ClientAgent

This class, `ClientAgent`, is the heart of an AI agent working within a larger swarm system. Think of it as an individual agent responsible for taking instructions, deciding what to do (potentially calling tools), and sending results back. It's designed to manage tasks efficiently, preventing conflicts and errors.

Here’s a breakdown of what it does:

*   **Handles Messages:** Takes user input and decides whether to execute it directly or use external tools.
*   **Manages Tools:** Can use tools to fulfill requests, ensuring no duplicate tools are used and carefully monitoring their activity.
*   **Error Recovery:** If something goes wrong during tool usage, it attempts to recover gracefully, trying different approaches.
*   **Keeps a Record:** Tracks all interactions (user messages, tool usage, errors) for later review or debugging.
*   **Communicates with Others:** Shares updates and results with the larger swarm system, allowing agents to coordinate.

Essentially, this class ensures that each individual agent operates reliably and contributes effectively to the overall AI swarm. It’s built to handle errors, prevent conflicts, and keep everything running smoothly.

## Class ChatUtils

This class, `ChatUtils`, helps manage and control chat sessions for different clients, acting as a central point for orchestrating those conversations. It allows you to start, send messages to, and clean up after chat sessions associated with specific clients and swarm names.

You can think of it as the behind-the-scenes engine that creates and manages individual chat instances. 

It provides functions to begin a chat, send messages, and handle cleanup when a chat session is finished. It also lets you customize how chat instances are created and what callbacks are used for these instances. The `listenDispose` function is designed to notify you when a chat session is being shut down.

## Class ChatInstance

This class represents a single chat session within an AI agent swarm. It’s essentially a connection to a chat environment managed by the swarm.

When you create a `ChatInstance`, you’re identifying a specific chat happening within a larger group of agents, giving it a unique ID (`clientId`) and associating it with the swarm's name (`swarmName`). You also provide a way to handle cleanup when the chat is finished (`onDispose`) and optional callback functions for different events.

You can start a chat session using `beginChat`, send messages through `sendMessage`, and the system handles the ongoing activity checks with `checkLastActivity`.  When you're done with the chat, `dispose` gracefully shuts down the connection, and `listenDispose` allows you to be notified when a chat instance is being closed.

## Class BusService

The `BusService` acts like a central message bus for the AI agent swarm, allowing different parts of the system to communicate with each other. Think of it as a reliable way to send and receive updates about what's happening.

It handles event subscriptions, letting components "listen" for specific types of events.  You can subscribe to events for a particular client, or even use a wildcard to receive events for all clients. It keeps track of what everyone is listening for, ensuring everything is cleaned up properly when a client disconnects.

The service manages event distribution – when something happens (like a task starting or finishing), the `BusService` makes sure the right components are notified.  It has special shortcuts for common events like task beginnings and ends, making it easier for related systems to track progress. It's designed to be efficient by reusing resources and integrates with other services for logging and session management. The whole process ensures that communication remains organized, secure and performs well within the swarm.

## Class AliveService

This class helps keep track of which clients are currently active within your AI agent swarms. Think of it as a simple presence checker. 

You can use it to tell the system when a client comes online (`markOnline`) or goes offline (`markOffline`), specifying which swarm they belong to. These status changes are logged and, if configured, are saved so the system remembers even after a restart. The `loggerService` property lets you hook in your preferred logging mechanism.

## Class AgentValidationService

The AgentValidationService is responsible for ensuring that agents within your system are properly configured and connected. Think of it as a quality control checkpoint for agents before they’ll be used.

It keeps track of all registered agents and their configurations, along with any dependencies between them. The service relies on other services, like those that handle tool and storage validation, to do the detailed checks.

You can use it to:

*   **Register new agents:** Add an agent to the system, defining its schema and any agents it depends on.
*   **List agents:** Get a simple list of all registered agents.
*   **Check dependencies:** Determine if one agent relies on another.
*   **Query resources:** Find out what storages, wikis, states, or MCPs are associated with a particular agent.
*   **Validate agents:**  Perform a full validation check of an agent’s configuration, verifying its schema, tools, storages, and completion settings.

The service is designed to be efficient, using memoization to avoid redundant checks and logging to track operations.

## Class AgentSchemaService

The AgentSchemaService acts as a central library for defining and managing the blueprints for your AI agents within the swarm. Think of it as a place where you store all the details about what each agent knows, what it can do, and what resources it needs.

It keeps track of these agent blueprints, ensuring they're well-formed and consistent.  Before an agent is created or updated, the service checks to make sure its definition makes sense.

You can register new agent types, update existing ones, and easily retrieve them when needed. This service works closely with other parts of the system like the agent connection and swarm configuration services, and it's essential for making sure your AI agents are properly defined and ready to work together. It also keeps a log of these operations so you can track changes and troubleshoot any issues.

## Class AgentPublicService

This class provides a public interface for interacting with agents within the swarm system. Think of it as a middleman, taking your requests and translating them into actions the agents can perform, while also keeping track of what's happening.

It handles common operations like creating agents, running commands, and logging messages.  Crucially, it relies on other services – like a logger and agent connection service – to do the actual work, and it adds extra context and tracking to those operations.

Many methods mirror functions you're likely already familiar with, like `execute` which runs a command, and `run` which performs a quick, stateless operation.  Other methods manage agent history – adding user messages, tool requests, or even clearing the entire history.  Finally, `dispose` cleanly shuts down an agent and associated resources.

Essentially, this class streamlines agent interactions while ensuring that actions are properly logged, tracked for performance, and aligned with overall system behavior.

## Class AgentMetaService

The AgentMetaService helps understand and visualize how agents in the swarm system connect and work together. It takes information about each agent – what it does, what it relies on – and transforms it into a visual representation using UML diagrams.

Think of it as a translator that converts agent descriptions into a clear, understandable map. It can create either a detailed map showing all aspects of an agent or a simpler map focusing just on dependencies.

This service works closely with other parts of the system, like the documentation generator and performance monitoring tools, and uses logging to keep track of its actions. It helps ensure that everyone involved understands the agent relationships and contributes to a well-organized and maintainable swarm.

## Class AgentConnectionService

The `AgentConnectionService` is the central hub for managing how AI agents operate within the system. Think of it as a factory and manager for AI agents. It's designed to be efficient; it reuses agents whenever possible to avoid repeatedly creating them.

Here's a breakdown of what it does:

*   **Agent Creation & Management:** It creates and manages individual AI agent instances, ensuring their proper lifecycle.
*   **Efficient Reuse:**  It cleverly caches AI agents, so it doesn't have to recreate them every time they are needed.
*   **Connecting the Pieces:** It brings together different parts of the system (like logging, event handling, and data storage) to keep agents running smoothly.
*   **Workflow Control:** It provides methods for controlling the agent's actions, like committing messages, requesting tools, and stopping actions. It allows the agent's workflow to be altered dynamically.
*   **Cleanup:** When an agent is no longer needed, it makes sure resources are freed up and the system is clean.



Essentially, this service is the engine that powers AI agent interactions, ensuring efficient use, proper handling, and coordinated operation within the swarm system.

## Class AdapterUtils

This class provides helpful tools for connecting to different AI services and getting the results you need. Think of it as a translator – it takes your instructions and turns them into the right format for each AI platform.

You can use these tools to easily set up connections to AI services like Cortex, Grok, Cohere, OpenAI, LMStudio, and Ollama. Each function creates a ready-to-use function that handles the specifics of communicating with that particular AI service, allowing you to focus on your task without worrying about the technical details of each API. You can also customize things like the AI model to use and how the response is formatted.

# agent-swarm-kit interfaces

## Interface TAbortSignal

This interface lets you signal when an ongoing process should be stopped, similar to how you might cancel a file download. It builds on the standard web technology for handling cancellations, giving you a reliable way to interrupt long-running tasks within your AI agent swarm. You can adjust and add to this interface if your application needs more specialized cancellation features.

## Interface IWikiSchema

This interface, `IWikiSchema`, defines the structure for a wiki knowledge base used by the AI agent swarm. Think of it as a blueprint for how the system understands and uses a particular wiki. 

Each wiki gets a name (`wikiName`) and can optionally have a description (`docDescription`) to help identify it. 

To enable custom behavior, you can provide `callbacks` – functions that allow you to hook into key wiki operations. 

Finally, the `getChat` method lets your agents ask questions and receive answers based on the wiki’s content.


## Interface IWikiCallbacks

This interface provides a way to receive notifications about chat events within the system. If you want to be informed whenever a chat interaction happens, you can implement this interface and provide a function that will be called with details about the chat. Think of it as a listener for chat-related activity.

## Interface ITriageNavigationParams

This interface defines the information needed to set up a navigation tool for your AI agents. Think of it as a blueprint for creating a specific tool that agents can use. You'll provide a `toolName` to identify it, a `description` explaining what it does, and optionally a `docNote` for extra details or instructions. This helps orchestrate how your agents explore and interact with different tasks.

## Interface IToolRequest

This interface describes what's needed to ask the swarm to run a specific tool. Think of it as a message telling the system, "Hey, I want to use this tool, and here's the information it needs." It includes the tool’s name so the system knows which one to use, and then a set of parameters – essentially the input data – that the tool requires to do its job. Agents or models use this to tell the system exactly what they want a tool to accomplish and how.

## Interface IToolCall

This interface describes a request to use a tool within the system, acting as a bridge between what the AI model wants to do and the actual execution of that action. Each tool call has a unique identifier to track it, and currently, all calls are for functions – meaning they're requests to run a specific function with provided arguments. The system uses this information to figure out which tool to use and what data to pass to it.

## Interface ITool

This interface describes a tool that agents within the system can use. Think of it as a blueprint for a function an agent can call. It defines what the tool *is*, its name, what it does, and importantly, what inputs it expects.

The `type` property indicates the kind of tool – currently, it’s almost always "function". The main part is the `function` property, which outlines the tool’s specific capabilities. This includes the tool’s name, a description of what it does, and a detailed schema explaining the parameters it requires for a successful call. The agent uses this information to generate requests to use the tool.

## Interface ISwarmSessionCallbacks

This interface lets you listen in on important events happening within your AI agent swarm. You can use these callbacks to track when new agents connect, when they start processing tasks, or when messages are shared between them. 

Specifically, you can be notified when a new agent joins the swarm, when a task is being executed, when a simple completion run is performed, when messages are sent out, when a session begins, or when a session ends. These notifications are useful for monitoring the swarm’s activity or performing actions based on these events.

## Interface ISwarmSchema

This interface defines the blueprint for how a swarm of AI agents will be configured and managed. Think of it as a set of rules and settings that dictate how the swarm behaves. 

You can give the swarm a unique name and specify which agents are available to participate. There's also a default agent that will be used if no specific agent is selected. 

To help with understanding and documentation, you can add a description. It allows you to save the swarm's navigation history and agent activity for later review. 

You have the flexibility to customize the swarm’s initial state, defining how it starts and how it updates its active agent and navigation stack. Finally, you can add custom functions for specific events throughout the swarm's lifecycle.

## Interface ISwarmParams

This interface defines the essential settings needed to get a swarm of AI agents up and running. Think of it as a blueprint – it specifies what information the system needs to know to create and manage the swarm. 

You'll need to provide a unique identifier for the client initiating the swarm, a logger to track what's happening and catch any problems, a communication channel (the "bus") for the agents to talk to each other, and a list of the individual agents that will be part of the swarm.  Essentially, it’s the configuration that brings the entire AI agent team together and allows them to coordinate.

## Interface ISwarmDI

This interface acts as a central hub for all the essential services within the AI agent swarm system. Think of it as a toolbox containing everything needed to manage the swarm – from documentation and event handling to performance tracking, agent connections, and data persistence.

It bundles together various specialized services, like the `DocService` for generating documentation, the `BusService` for sending event messages, and the `PerfService` for monitoring performance.  Each property represents a distinct component, providing functionalities like agent lifecycle management (`AgentConnectionService`), state persistence (`StateConnectionService`), and validation of data across different areas of the system (`AgentValidationService`).

Essentially, this interface ensures that all the different pieces of the AI agent swarm have access to the necessary tools and services, allowing them to work together efficiently.  It's a blueprint for how the swarm is constructed and how its various components interact.

## Interface ISwarmConnectionService

This interface outlines the public-facing methods for connecting and managing agents within your AI swarm. Think of it as the blueprint for how you'll interact with the swarm – establishing links between agents and ensuring everyone's on the same page. It’s designed to be a clean, standardized way to work with your swarm connections, focusing on the essential operations without exposing any internal workings. By using this interface, you can be confident that your code interacts with the swarm in a predictable and reliable manner.

## Interface ISwarmCallbacks

This interface lets you listen in on important events happening within your AI agent swarm. Specifically, you can use it to be notified whenever an agent's role or responsibility changes. When an agent starts or stops working on a particular task within the swarm, this callback will be triggered, allowing you to track how the swarm is navigating and adjust your system accordingly. You'll receive the agent's ID, its assigned name, and the swarm it belongs to each time this change occurs.

## Interface ISwarm

This interface defines how you interact with a group of AI agents working together. You can use it to control which agent is currently active, retrieve its name or the agent itself, and send messages to the agents. 

It allows you to pause or cancel what the agents are doing, and to wait for their combined output. The framework also provides a way to check if the agents are currently busy with a task, helpful for managing the flow of your application. You can register and update agent references, letting the system know about available agents.

## Interface IStorageSchema

This interface describes how your agent swarm's storage system is configured. It lets you control things like whether data is saved permanently, provides a way to add descriptions for clarity, and offers a setting to share storage between multiple agents.

You can customize how data is fetched and saved by providing your own functions for retrieving and persisting data. The `embedding` property specifies the method used for searching and organizing data within the storage. Each storage gets a unique `storageName` for identification.

You can further personalize the storage's behavior by adding lifecycle `callbacks`, and you can even define the initial `getDefaultData` if needed. Finally, the `createIndex` function is responsible for generating searchable indexes for each piece of data stored.

## Interface IStorageParams

This interface defines how the system manages data storage, especially the embeddings used by AI agents. It provides methods for storing, retrieving, and creating embeddings, essentially acting as a bridge between the agents and the underlying storage system. You’ll find functions to calculate similarity between embeddings, write them to a cache to avoid repeated calculations, and fetch them when needed. It also includes ways to create new embeddings from text, and provides logging and event communication capabilities to keep track of what's happening during storage operations. Finally, it identifies the specific client and the storage being used within the larger AI agent swarm.

## Interface IStorageData

This interface describes the basic information that's saved within the system. Every piece of data you store will have an `id`, which acts like a unique name to identify it later. Think of it as a primary key for your stored information.

## Interface IStorageConnectionService

This interface helps define how your AI agents can connect to storage systems. It’s essentially a blueprint for making sure the public-facing parts of the storage connection service are clearly defined and type-safe in your TypeScript code. Think of it as a way to keep the internal workings of the storage connection separate from what's exposed for the agents to use.

## Interface IStorageCallbacks

This interface lets you listen in on what's happening with your data storage. You can set up functions to be notified whenever data changes, when searches are performed, or when the storage is first set up or taken down. These notifications provide opportunities to track activity, log events, or perform any necessary setup or cleanup tasks related to the data. Think of them as event listeners for your storage system – you define what happens when specific actions occur.

## Interface IStorage

This interface lets you manage data within the agent swarm's memory. Think of it as a way to store and retrieve information that the agents need to work together.

You can `take` a set of items based on a search term, essentially finding things that are similar to what you’re looking for. The `upsert` method is your go-to for adding new information or updating what's already there. To remove something you no longer need, use `remove` and provide its unique ID.  If you need a specific item, `get` allows you to retrieve it directly by its ID. Want to see everything? `list` shows you all the stored items, and you can even filter them to see only what you’re interested in. Finally, `clear` provides a quick way to wipe the entire memory and start fresh.

## Interface IStateSchema

The `IStateSchema` interface describes how a piece of information, or "state," is managed within the agent swarm. It lets you configure whether the state is saved permanently, provides a description for documentation, and controls whether multiple agents can access it.

Each state has a unique name, and you can define how its initial value is created and how its current value is retrieved.  You also have the flexibility to customize how the state is updated, and to add extra steps – called middlewares – to handle the state during its lifecycle. Finally, you can register callbacks to be notified about specific state events, giving you greater control over its behavior.

## Interface IStateParams

This interface defines the information needed to manage a particular state within your AI agent swarm. Think of it as a package containing essential details for keeping track of things. It includes a unique identifier for the client using the state, a way to log activity and errors for debugging, and a communication channel – a "bus" – for agents to talk to each other. This package helps ensure everything runs smoothly and that the swarm can coordinate effectively.

## Interface IStateMiddleware

This interface defines how you can hook into the agent swarm's state management process. Think of it as a way to intercept and potentially adjust the data being used by the agents – perhaps to sanitize it, ensure it meets specific rules, or add extra information. You can use this to customize how the swarm handles its internal data flow, giving you fine-grained control over the overall operation. Essentially, it’s a way to add your own logic into the state lifecycle.

## Interface IStateConnectionService

This interface helps us define how different parts of the system connect and share information about the agent swarm's state. It's essentially a blueprint for creating services that manage these connections, but it's designed to hide the technical details and only expose what's important for external use. Think of it as a simplified view of a complex system, making it easier to work with and understand how agents coordinate. It ensures that the public-facing parts of the state connection service are clear and consistent.

## Interface IStateChangeContract

This interface defines how your AI agents will communicate about changes in their operational state. Specifically, it provides a way for agents to signal when their state has been altered—think of it as a notification system. The `stateChanged` property is the key here; it's how an agent broadcasts that its status has changed and provides details about that change using a standardized string format. This allows other agents or the orchestration system to react to those state transitions in a coordinated way.

## Interface IStateCallbacks

This interface lets you listen in on what's happening to a specific piece of data managed by the system. You can use it to run code when a piece of data is first created, when it’s being cleaned up, or whenever it's loaded, read, or updated. Think of these callbacks as helpful notifications that allow you to monitor, log, or react to changes in a data's lifecycle. Each callback provides the data's identifier, the name given to the data, and the data itself, giving you all the context you need to respond appropriately.

## Interface IState

This interface helps you manage the agent swarm’s current situation – think of it as a central record of what’s happening. You can easily check what the current state is with `getState`, allowing you to see the overall picture. When you need to make a change, `setState` lets you calculate the new state based on the previous one, ensuring changes are handled correctly. And if things need a fresh start, `clearState` resets everything back to the initial configuration.

## Interface ISharedStorageConnectionService

This interface outlines how different parts of the AI agent swarm framework can connect to shared storage. Think of it as a blueprint for securely accessing and sharing data between agents. It focuses on the public-facing aspects of the connection, leaving out the internal workings to keep things clean and organized. This helps ensure a consistent and reliable way for agents to collaborate by accessing the same information.

## Interface ISharedStateConnectionService

This interface helps define how different parts of the AI agent swarm can share information securely. Think of it as a blueprint for a service that manages shared data – it outlines what operations are available for interacting with that shared data, but specifically leaves out any internal workings. This separation ensures that the public-facing tools for working with shared state are clear and consistent.

## Interface ISharedComputeConnectionService

This service lets your AI agents connect to and share computing resources, like virtual machines or cloud functions. Think of it as a central hub that helps agents access the tools they need without each needing their own individual setup. It handles the complexities of resource allocation and management, allowing the agents to focus on their tasks. You can use this service to easily provision and connect agents to shared environments, improving efficiency and reducing overhead. It provides methods for creating, retrieving, and managing these shared compute connections.

## Interface ISessionSchema

This interface, `ISessionSchema`, acts as a blueprint for how session data will be structured in the future. Right now, it's essentially a blank slate, reserved for adding details about session configurations as the system evolves. Think of it as a promise of more information to come regarding session-specific settings.

## Interface ISessionParams

This interface describes all the information needed to kick off a new session within the agent swarm system. Think of it as a blueprint for setting up a session, containing essential pieces like a unique identifier for the client using the session, a way to track what’s happening (logging), rules and limitations (policy), a communication channel for the agents to talk to each other (bus), and the overall management of the swarm itself.  It also includes the specific name of the swarm this session is participating in, ensuring everything is properly identified and linked.

## Interface ISessionContext

This interface describes the information kept track of during a session within the AI agent swarm. It bundles details about who initiated the session (the client ID), the specific process being handled (process ID), and any method or execution details that are relevant. Think of it as a container holding all the necessary background information about what's currently happening. It helps the system understand the context of requests and actions.

## Interface ISessionConnectionService

This interface helps ensure that the public-facing parts of your agent swarm orchestration framework are clearly defined and consistent. It’s a way to create a standard way of connecting sessions, stripping away any internal details that aren't meant to be exposed. Think of it as a blueprint for how sessions should connect, focusing only on the essential information needed for external use.

## Interface ISessionConfig

This interface, `ISessionConfig`, lets you control how often or when your AI agents run. Think of it as a way to manage the timing of your swarm's activity. The `delay` property sets a pause – a certain number of milliseconds – between individual agent runs, preventing them from overwhelming the system.  You can also use `onDispose` to define a function that will be executed when the session ends, allowing you to clean up resources or perform any necessary final actions.

## Interface ISession

The `ISession` interface gives you the tools to manage a single conversation or workflow within the AI agent swarm. It lets you control the flow of messages, add content to the conversation history, and connect external systems for communication. 

You can use methods like `commitUserMessage` and `commitAssistantMessage` to manually add messages to the session’s history, or `commitSystemMessage` to add system prompts. To prevent the AI from continuing its process, you can use `commitStopTools`.  The `execute` method is your go-to for running commands within the session and potentially updating the conversation’s history. `connect` allows you to build a communication link, enabling messages to flow back and forth.  `run` lets you do quick, isolated tasks without altering the ongoing conversation. Finally, `commitToolOutput` and `commitToolRequest` handle interaction with tools the agents might use.

## Interface IScopeOptions

This interface defines how to configure a scope for your AI agent swarm. Think of a scope as a container for a specific task or set of agents working together. You’ll use `clientId` to identify the application or user initiating the swarm, and `swarmName` to give your swarm a descriptive label.  Finally, `onError` lets you specify a function to handle any errors that might occur within the scope, making sure you’re aware of and can respond to problems.


## Interface ISchemaContext

This interface, `ISchemaContext`, acts as a central hub for accessing all the schema definitions used by your AI agent swarm. Think of it as a toolbox containing pre-built blueprints for different agent types and their capabilities. Inside, you'll find registries – organized collections – of agent schemas and completion schemas, allowing you to easily discover and utilize these components when building your swarm. It simplifies access to the structured information needed to define and configure your agents. You can use this context to ensure agents adhere to specific formats and functionality.

## Interface IPolicySchema

This interface describes how you can define and configure policies for your AI agent swarm. It lets you specify rules to govern agent behavior and manage banned clients.

You can give each policy a unique name and an optional description for clarity. The `persist` flag controls whether banned clients are saved permanently.  You can also customize the message shown when a client is banned, or even provide a function to generate a specific ban message for each client.

For advanced control, you can define functions to validate incoming and outgoing messages according to your own criteria, or to manage the list of banned clients directly.  Finally, the `callbacks` section allows you to react to specific policy events and take custom actions.

## Interface IPolicyParams

This interface defines the information needed to set up a policy within the AI agent swarm. Think of it as a blueprint – it specifies what a policy needs to function correctly. 

It requires a logger to keep track of what’s happening with the policy, allowing you to troubleshoot or monitor its behavior. 

It also needs a communication channel, called a bus, so the policy can interact with other agents and components within the swarm.

## Interface IPolicyConnectionService

This interface helps us define how different parts of the system connect and interact based on pre-defined rules. Think of it as a blueprint for ensuring that the public-facing components of the system only expose the intended connections and behaviors, hiding any internal workings. It's designed to create a clear and consistent way for different agents to communicate and coordinate within the swarm. By using this interface, we guarantee that external systems only interact with the intended parts of the connection management, promoting stability and security.

## Interface IPolicyCallbacks

This interface lets you plug in your own functions to react to important events happening within a policy. You can define what happens when a policy starts up, when messages are checked for validity (both incoming and outgoing), or when a client is either banned or unbanned. Think of it as providing hooks to monitor and potentially influence the policy’s behavior – like adding logging, auditing, or custom reactions to specific actions. You don’t *have* to use all of these hooks; you only need to provide the ones that are relevant to your needs.

## Interface IPolicy

This interface defines how your AI agent swarm enforces rules and manages client behavior. It allows you to check if a client is currently blocked, retrieve the reason for a block, and verify that messages being sent and received adhere to your specified policies.  You can also use it to actively block or unblock clients from participating in the swarm. Essentially, this provides a way to control who participates and what they can say within your swarm environment.

## Interface IPipelineSchema

This interface, `IPipelineSchema`, defines the structure for how a pipeline of AI agents is orchestrated. Every pipeline needs a `pipelineName` to identify it. 

The crucial part is the `execute` function, which is how you actually run the pipeline; it takes a client ID, the name of the agent to start, and some data (`payload`) and returns a promise that resolves with either nothing or some data depending on how the pipeline is configured. 

Finally, you can add `callbacks` to your pipeline to hook into specific events during its execution, allowing you to monitor progress or handle errors. These callbacks are optional.

## Interface IPipelineCallbacks

This interface lets you hook into the lifecycle of your AI agent pipelines. Think of it as a way to be notified about what's happening behind the scenes. 

You can use the `onStart` function to know when a pipeline begins, providing information like the client it's for, the pipeline's name, and any initial data. 

The `onEnd` function signals that a pipeline has finished, telling you if it completed successfully or encountered an error. 

Finally, the `onError` function gives you details about any errors that happened during a pipeline's execution, including the client, pipeline name, and the specific error message. This helps in debugging and monitoring your agent swarms.

## Interface IPersistSwarmControl

This framework lets you tailor how your AI agent swarm's data is saved and loaded. Specifically, you can customize the storage for the agents that are currently active and the navigational information they use. Think of it as swapping out the default storage mechanism with your own, allowing you to use things like an in-memory database or a connection to an external data store for a particular swarm. This gives you flexibility in managing how your swarm's state is preserved and restored.

## Interface IPersistStorageData

This interface outlines how data intended for long-term storage within the AI agent swarm is structured. Think of it as a container holding a collection of data – maybe it's a list of settings, observations, or results – that needs to be saved and retrieved later.  It's specifically used by the `PersistStorageUtils` to handle the actual saving and loading of this data. The core of this structure is the `data` property, which simply holds the array of information you want to persist.

## Interface IPersistStorageControl

This interface lets you plug in your own way of saving and loading data for a specific storage area. Think of it as a way to swap out the default data storage with something tailored to your needs, like saving data to a database instead of a file. By providing your own "persistence adapter," you can customize how the framework handles storing and retrieving information related to that storage area. This gives you more control over data management.

## Interface IPersistStateData

This interface describes how state information is saved and retrieved within the system. Think of it as a container for any kind of data you want to remember, like settings for your AI agents or details about an ongoing session. The `state` property holds that data, and it can be any type of information relevant to your specific application. It provides a consistent way to manage and store data needed by the swarm.

## Interface IPersistStateControl

This interface gives you the power to manage how the AI agent swarm's state is saved and restored. You can plug in your own custom storage solution, like connecting to a database instead of relying on the default method. This lets you tailor the persistence process to fit your specific needs and environment, providing greater flexibility in how the swarm's information is handled. Essentially, you're swapping out the standard state saving mechanism with your own preferred approach.

## Interface IPersistPolicyData

This interface describes how policy data, specifically lists of banned clients, is stored within the AI agent swarm. It ensures that each policy knows which session IDs (representing individual clients) are currently blocked from participating in the swarm, organized by the swarm's name. Essentially, it’s a way to keep track of who's on the "do not allow" list for each swarm.

## Interface IPersistPolicyControl

This interface lets you swap out the default way policy data is saved and loaded. Think of it as plugging in your own system for managing how policies are stored, allowing you to customize things like where the policy information is kept and how it's retrieved. This is useful if you need something beyond the standard persistence mechanism, such as temporary in-memory storage for testing or integration with a specialized database. By providing your own persistence adapter, you can tailor the framework to your specific needs.

## Interface IPersistNavigationStackData

This interface describes how we keep track of the agents a user has interacted with during a session. It's essentially a history list – a stack – of agent names. When a user navigates between agents within a swarm, this stack remembers the order they visited them in. Each entry in the stack is a simple string identifying an agent, allowing us to recreate the user’s journey through the swarm.

## Interface IPersistMemoryData

This interface outlines how data used by the AI agent swarm should be saved and retrieved. Think of it as a container for holding any kind of information – maybe it's details about a conversation, or a temporary calculation – that the agents need to remember. It's designed to work with the persistence tools within the swarm, ensuring important data isn't lost. The `data` property simply holds that information, allowing the system to store and load it as needed.

## Interface IPersistMemoryControl

This interface lets you customize how memory is saved and loaded for each session. It’s designed to give you more control over where and how session data is stored, allowing for things like using an in-memory store instead of a database. You can plug in your own memory persistence adapter using the `usePersistMemoryAdapter` method, which replaces the default persistence behavior and lets you tailor it to your specific needs. This is helpful when you want to experiment with different storage solutions or need very specific control over how session data is handled.

## Interface IPersistEmbeddingData

This interface describes how data related to embeddings is saved and retrieved within the AI agent swarm. Think of it as a blueprint for storing numerical representations of text or other data – these are the "embeddings" – associated with a unique identifier. It ensures that each embedding is linked to a specific name and a string hash, allowing the system to consistently access and manage this crucial information. The `embeddings` property simply holds the numbers that make up the embedding itself.

## Interface IPersistEmbeddingControl

This interface lets you tailor how embedding data is saved and retrieved. You can plug in your own custom storage mechanism, like a database or an in-memory cache, to manage embeddings associated with a specific name. This is useful if the default storage behavior isn't suitable for your needs, allowing for greater flexibility in how your agent swarm handles embedding information. Essentially, you’re swapping out the standard persistence system with something you define.

## Interface IPersistBase

This interface provides the fundamental tools for saving and retrieving data within the agent swarm. It manages entities, which are essentially pieces of information like an agent's state or memory, stored as JSON files.

The `waitForInit` method makes sure everything is ready to go by setting up the storage location and cleaning up any potentially corrupted files. 

`readValue` lets you pull a specific entity back from storage using its unique ID. Conversely, `writeValue` is used to save an entity to persistent storage.  Before attempting to read, you can use `hasValue` to quickly check if an entity with a given ID actually exists.

## Interface IPersistAliveData

This interface helps the system keep track of whether individual clients are currently connected. It’s like a simple "online/offline" status for each client participating in the swarm. Each client is identified by its session ID and belongs to a specific swarm. The `online` property is a straightforward boolean value indicating the client's connectivity status - true if online, false if offline.

## Interface IPersistAliveControl

This interface lets you fine-tune how the system keeps track of whether an AI agent swarm is still active. You can provide your own way to store and retrieve this "alive" status, instead of relying on the built-in method. This is useful when you need a specific storage solution, like keeping the status in memory or using a custom database, tailored to your environment and the swarm's name.

## Interface IPersistActiveAgentData

This interface describes how we keep track of which agent is currently running for each client interacting with a swarm. It's essentially a way to remember which agent is "active" so we can pick up where we left off. The key piece of information stored is the agent's name, which acts as a unique identifier for that agent within the swarm. Think of it like assigning a nickname to each agent so we know exactly who's doing what.

## Interface IPerformanceRecord

This interface helps track how well a specific process within the system is performing. It gathers data from all the clients involved, like individual sessions or agent instances, to provide a combined view of the process’s efficiency.

Think of it as a report card for a particular task, recording things like the total number of times it ran, the overall time it took, and how long each execution generally lasted. It also includes timestamps to indicate when the data was collected, using both a general date and a more precise time of day. The detailed client-level performance data allows for pinpointing bottlenecks or areas for optimization within the system.


## Interface IPayloadContext

This interface, `IPayloadContext`, is all about organizing information related to tasks being handled by the AI agent swarm. Think of it as a container that bundles together two key pieces of data: a `clientId` which identifies *who* requested the work, and a `payload` which holds the actual data or instructions for the agents to process. It ensures that the swarm has all the necessary context to execute tasks effectively and track their origin.

## Interface IOutlineValidationFn

This interface defines a function that's used to validate the structure or outline of a plan generated by an AI agent. Think of it as a way to check if the plan makes sense before it’s executed. It accepts the plan outline as input and returns a boolean indicating whether the outline is valid, along with a human-readable message explaining why it might be invalid. This helps ensure the swarm is building plans that align with your desired outcomes and prevent errors later on. You can use it to enforce specific planning patterns or constraints.

## Interface IOutlineValidationArgs

This interface helps you pass information needed to check if something is correct within your AI agent workflow. It combines the initial input with a 'data' parameter. Think of the 'data' as the result that your agents have produced, and this interface ensures that validation functions have both the original request and the result they need to assess. It’s designed to simplify passing all the necessary details to validation processes, making them more efficient and reliable.

## Interface IOutlineValidation

This interface helps you define how to check and ensure the quality of outline data within your AI agent swarm. Think of it as a way to set up rules and descriptions for verifying the structure and content of your outlines. 

You’ll specify a validation function – this is the core logic that actually checks the outline. You can even reuse validation functions by referencing them. 

Finally, you can add a descriptive text to explain what the validation does, making it easier for others (or yourself later) to understand the validation process.

## Interface IOutlineSchema

This interface, `IOutlineSchema`, describes how to set up a specific outline—essentially a step or task—within your AI agent swarm. It lets you define what that outline does, how it should behave, and how to handle potential problems.

You're able to give each outline a unique name for easy identification.  You can also provide a description to help others understand its purpose.

The schema includes ways to validate the data produced by the outline, ensuring it meets your standards. If something goes wrong, you can set a maximum number of attempts before giving up. Finally, it provides options for custom callbacks to control how the outline operates at different stages, such as when an attempt fails or a document is processed. 

The `getStructuredOutput` method is what actually does the work; it takes some input and generates the data you're expecting from that outline.

## Interface IOutlineResult

This interface describes the result you get when an outline operation finishes. It tells you whether the outline was successful, gives it a unique ID so you can track it, and provides a history of the messages exchanged during the process. If something went wrong, you’ll find an error message here. You'll also find the original input parameters and the data produced by the outline, and a count of how many times the operation was attempted.

## Interface IOutlineMessage

This interface defines the structure of a message used within the outlining system. Think of it as a template for how messages – whether from the user, the AI assistant, or the overall system – are recorded and organized. Each message has a `role` indicating who sent it (user, assistant, or system) and `content` which holds the actual text of the message itself. This standardized format makes it easier to track and manage conversations.

## Interface IOutlineHistory

This interface lets you keep track of the messages generated during your outline creation process. Think of it as a log of how your outline evolved. You can add new messages – either one at a time or in batches – to record each step. If you want to start fresh, you can easily clear the entire history. Finally, you can retrieve the complete list of messages to review the sequence of events that shaped your outline.

## Interface IOutlineCallbacks

This interface helps you keep track of what's happening during the outline generation process. You can use the `onAttempt` callback to know when a new outline generation is starting, allowing you to log this event or monitor progress. The `onDocument` callback lets you work with the generated document immediately, whether you want to process it further or simply record its contents.  If the generated outline passes validation, the `onValidDocument` callback will notify you, letting you handle the success. Finally, if validation fails, `onInvalidDocument` will be triggered so you can understand why and potentially retry the process.

## Interface IOutlineArgs

This interface defines the information needed when creating an outline. It bundles together the actual input you want processed, a counter to keep track of how many times we're trying, and a way to access the conversation history for context. Think of it as a package containing everything needed for a single step in outlining something, helping the AI agents coordinate effectively. You’ll find the initial input, the attempt number (for retries), and a record of what’s already happened all neatly organized.

## Interface IOutgoingMessage

This interface defines what a message looks like when it's being sent out from the system, heading towards a client like an agent. Think of it as the standard format for delivering responses or notifications.

Each message has a `clientId`, which is a unique identifier telling the system exactly which client should receive the message. It's like an address label.

The `data` property holds the actual content of the message—the result, response, or any information being sent to the client.

Finally, `agentName` identifies which agent within the swarm is responsible for sending that message, tracing its origin.

## Interface IOperatorSchema

This function lets you establish a connection between a client and a specific agent within the swarm. Think of it as a way to tell the system, "Hey, client X wants to talk to agent Y." It takes a client identifier and the name of the agent you want to connect to and returns a function that handles the actual message exchange – you send a message, and it provides a way to send a response back. Importantly, the returned function also includes a function to clean up when you're finished with the connection.

This function is used to cleanly end a connection with an agent. It takes the client identifier and shuts down the communication link, ensuring resources are released properly. It’s important to use this when a client is done interacting with the swarm to prevent lingering connections.

## Interface IOperatorParams

This interface defines the required information given to each agent within your AI agent swarm. Think of it as the "instruction manual" for each agent, telling it who it is, what its purpose is, and how to communicate. 

Each agent receives this data, including its assigned name (`agentName`), a unique identifier for the client it's working for (`clientId`), a logging mechanism (`logger`) to record its activities, a communication channel (`bus`) to interact with other agents, and a record of its past actions (`history`). This setup ensures agents are properly identified and can operate effectively within the swarm.

## Interface IOperatorInstanceCallbacks

This interface lets you hook into what’s happening with individual agents within your swarm. Think of it as a way to listen for specific events from each agent, like when it starts up, provides an answer to a question, receives a message, shuts down, or sends a notification. You can use these callbacks to track agent activity, build custom dashboards, or trigger actions based on agent behavior. Each callback provides information about the client, the agent’s name, and the event that occurred.

## Interface IOperatorInstance

This interface defines how you interact with a single agent within a larger swarm. Think of it as the control panel for one agent. 

You use `connectAnswer` to tell the agent where to send its responses, allowing you to receive them.  `answer` is how the agent communicates its findings or actions back to the system. `init` establishes the agent's connection to the swarm. `notify` is used to send messages to the agent, potentially triggering a specific behavior. `recieveMessage` allows the agent to send messages back. Finally, `dispose` cleanly shuts down the agent's connection when it's no longer needed.

## Interface IOperatorControl

This interface lets you configure how an operator within your AI agent swarm works. You can tell the system which functions to call when certain events happen, essentially providing a way to customize its behavior. Additionally, it allows you to swap out the default operator implementation with your own custom version, offering even greater control over the orchestration process. Think of it as setting the rules and building blocks for a specific operator to play its role within the larger swarm.

## Interface INavigateToTriageParams

This interface lets you customize how your AI agents navigate to a triage agent. Think of it as a way to fine-tune the communication flow.

You can use `beforeNavigate` to run a function before navigation begins, like logging or preparing data. `lastMessage` lets you modify the message passed from the previous agent.  `flushMessage` defines what’s said when the navigation needs to clear its memory, and `executeMessage` helps determine the prompt for actually starting the triage. Finally, `toolOutputAccept` and `toolOutputReject` allow you to customize how you handle successes and failures when tools are used during navigation. Each of these can be a simple string message or a function that dynamically generates a message based on the situation.

## Interface INavigateToAgentParams

This interface helps you customize how your AI agent swarm navigates to a new agent. Think of it as a set of hooks that let you influence the transition process. 

You can define what happens *before* the navigation begins with `beforeNavigate`, providing information like the client ID, the last user message, and the agent names involved. 

`flushMessage` allows you to specify a message to send during the navigation, perhaps to acknowledge the change or prepare the new agent. `toolOutput` lets you tailor the output when a tool is used during the transition.

`lastMessage` allows modification of the last user message before passing it to the new agent.  `emitMessage` and `executeMessage` offer opportunities to craft custom messages for specific scenarios during the agent transition, providing further control over the interaction flow.

## Interface IModelMessage

This interface, `IModelMessage`, defines the structure of a message within the agent swarm system. Think of it as the fundamental unit of communication between agents, tools, users, and the core system. It’s how information flows and how the system keeps track of what's happening.

Each message has a `role`, which tells you who or what sent it: a model (`assistant`), the system itself (`system`), a tool (`tool`), a user (`user`), a recovery process (`resque`), or a history reset (`flush`).  There's also an `agentName`, identifying the specific agent that sent the message, useful when dealing with multiple agents working together.  The `content` is the actual text or data being communicated.

The `mode` property clarifies whether the message originated from user input or a tool's action.  When a model needs to use a tool, the `tool_calls` array will contain details about that request.  `images` allows for the inclusion of image data.  `tool_call_id` links a tool's response back to its original request. Finally, `payload` provides a way to attach extra information to the message.

## Interface IMethodContext

This interface, `IMethodContext`, acts as a central record for every time a method is called within the system. It bundles together key pieces of information about that specific call, like which client initiated it, what method was used, and which system components (agents, swarms, storage, compute, policies, and MCPs) were involved. Think of it as a way to track method executions across different parts of the system for things like performance monitoring, logging, and documentation. Each property provides a label identifying a specific resource related to the method call.

## Interface IMetaNode

This interface describes a building block for organizing information about agents and their relationships. Think of it as a way to represent a tree structure where each node holds data about an agent or a related resource. Each node has a `name` which is like a label that identifies it – perhaps the agent's name or the name of a specific resource it uses. It can also have `child` nodes, allowing you to create nested hierarchies that illustrate how agents depend on each other or utilize shared resources. This structure is used to map out agent dependencies and attributes in a clear, organized way.

## Interface IMCPToolCallDto

This interface defines the structure of data used when an AI agent requests a tool to perform a task. It contains key information like a unique ID for the tool being used, who's requesting the tool (the client ID), and the name of the agent making the request.  The `params` property holds the specific instructions or data needed for the tool to complete its job. You’ll also find details about any related tool calls and a signal that can be used to stop the process if needed. Finally, a flag indicates whether this call represents the final step in a sequence of actions.

## Interface IMCPTool

This interface, `IMCPTool`, describes what makes up a tool used within the AI agent swarm orchestration framework. Every tool needs a `name` so we know what it is, and a `description` that's helpful for understanding its purpose. Crucially, each tool also has an `inputSchema` – this tells the system exactly what kind of data the tool expects to receive so it can be used correctly. The input schema defines the structure and required fields for the data the tool processes.

## Interface IMCPSchema

This interface outlines the core structure of a Managed Control Plane (MCP), which acts as the brain coordinating a swarm of AI agents. Each MCP has a unique name and can optionally include a description for documentation purposes. 

A key feature is its ability to provide a list of available tools that clients can utilize, and a way to actually execute those tools with specific inputs. 

Finally, you can define optional callback functions to be notified about events happening within the MCP’s lifecycle.

## Interface IMCPParams

This interface defines the configuration needed for managing an AI agent swarm. Think of it as a set of instructions telling the system how to communicate and track what's happening. It requires a logger to record events and a bus to handle messages between different parts of the system. This helps in debugging and coordinating the agents effectively.

## Interface IMCPConnectionService

This interface defines how different parts of the AI agent swarm communicate with each other using a lightweight messaging protocol, similar to how computers send simple notes back and forth. It handles the reliable delivery of these messages, ensuring agents receive the information they need to coordinate tasks. Think of it as the postal service for your swarm – it makes sure messages get where they’re supposed to go, even if there are hiccups along the way. The connection service manages the underlying communication channels and handles things like reconnecting if a connection drops. You're essentially dealing with the foundation for how agents share information and work together.

## Interface IMCPCallbacks

This interface provides a way to respond to key moments in the lifecycle of a managed client process (MCP). Think of it as a set of hooks that let your application react to what's happening with the AI agent swarm. 

You can use the `onInit` function to execute code when a new MCP is starting up. `onDispose` tells you when an MCP’s resources are being cleaned up for a specific client. 

When tools are being retrieved or listed for a client, `onFetch` and `onList` are triggered respectively.  The `onCall` function is your notification that a tool has been used, and you're given details about the tool and the data passed to it. Finally, `onUpdate` informs you when the available tools for a client have changed.


## Interface IMCP

This interface lets you manage the tools available to different AI agents. You can use it to see what tools are accessible to a specific agent, check if a certain tool is offered, and actually run those tools with given inputs. There's also functionality to refresh the tool lists, either globally or for a single agent. Essentially, it's your control panel for ensuring agents have the right tools and can use them effectively.

## Interface IMakeDisposeParams

This interface defines the information needed to automatically manage the lifecycle of an AI agent within a swarm. It lets you set a maximum time, specified in seconds, that the agent should run before being automatically shut down. 

You can also provide a function that will be called when an agent is being disposed, giving you a chance to perform any necessary cleanup actions, and it provides the agent's ID and the name of the swarm it belongs to.

## Interface IMakeConnectionConfig

The `IMakeConnectionConfig` interface helps you control how often your AI agents try to connect. It's all about managing the flow and preventing things from getting overwhelmed. The `delay` property lets you specify a waiting time, in milliseconds, between connection attempts. This setting allows you to smooth out the process and avoid overwhelming resources.

## Interface ILoggerInstanceCallbacks

This interface lets you customize how a logging component behaves within the agent swarm. Think of it as a way to tap into key moments in a logger’s life – when it starts up, when it shuts down, and every time it records a message. 

You can provide functions to be called when a logger is initialized, when it’s cleaned up, or when a log message, debug message, or informational message is generated. This lets you build your own monitoring, reporting, or custom processing logic around the logging activity. Essentially, it allows you to extend and observe the logger's behavior without modifying the core logger itself.

## Interface ILoggerInstance

This interface defines how a logger should behave within the AI agent swarm orchestration framework, going beyond simple logging. It allows for controlled setup and cleanup of logging resources, particularly when dealing with different client types.

The `waitForInit` method lets you ensure the logger is properly initialized before it starts logging, possibly including asynchronous configuration.  Once initialization is complete, it can notify interested parties.

The `dispose` method provides a way to gracefully shut down the logger, releasing any client-specific resources and triggering a notification that it's done. This helps maintain stability and prevent leaks as agents come and go.

## Interface ILoggerControl

This interface gives you control over how your logging system behaves. You can set up a central adapter to handle all your logging, or customize how individual logger instances are created. It lets you define callbacks that trigger at different points in the logger's lifecycle, allowing for client-specific adjustments. There are also methods to log messages specifically for a client, including info, debug, and general log entries, all while ensuring session validation and keeping track of where the logging came from.

## Interface ILoggerAdapter

This interface outlines how different parts of the system can communicate with logging tools. It provides a standard way to record messages, whether they are general logs, debug information, or informational updates, all tied to a specific client. When a component needs to log something, it uses these methods, which handle the details of interacting with the appropriate logging system. There’s also a way to clean up and release resources associated with a client’s logging when it’s no longer needed.

## Interface ILogger

This interface defines how different parts of the agent swarm system can record information. It provides ways to write general messages, debug details, and informational updates. Think of it as a central place to track what's happening – from agents running and sessions connecting, to policy checks and saving data – so you can monitor, debug, and understand the system's behavior. Different components use this logging system to provide insight into their operations.

## Interface IIncomingMessage

This interface defines the structure of a message coming into the system, representing information sent from a client. Think of it as the data being passed to an agent for processing.

Each message has a `clientId`, which identifies the specific client sending it – useful for tracking and linking actions back to a user or application. 

The core of the message is the `data` property, holding the actual content like a user's question or command.

Finally, `agentName` specifies which agent within the swarm should handle the message, directing it to the right processing logic.

## Interface IHistorySchema

This interface outlines how your AI agent swarm keeps track of its conversations. Think of it as the blueprint for where and how the agent remembers what it's said and what it's been told. 

The key part is the `items` property; this dictates which method is used to actually store and access the message history, like saving it to a database or a simple file. It’s the adapter that handles the specific storage details.

## Interface IHistoryParams

This interface defines the information needed to create a record of an agent's activities. Think of it as a blueprint for keeping track of what an agent has done. It includes details like the agent's name, a unique client ID, and how many previous messages to keep for context. It also provides ways to log activities and communicate with the larger system coordinating all the agents.

## Interface IHistoryInstanceCallbacks

This interface lets you customize how agent history is managed. You can define functions to get the initial set of messages for an agent, or to dynamically adjust the system prompt.  It also provides hooks to filter which messages are included, and to be notified about changes to the history like adding new messages, removing existing ones, or when the entire history is read.  You'll get callbacks at the beginning and end of history reading operations, and when the history instance is created, modified, or discarded. Finally, you can get a direct reference to the history instance itself for more advanced control.

## Interface IHistoryInstance

This interface describes how to work with the history of messages for each agent in your AI agent swarm. Think of it as a way to keep track of what each agent has been saying and doing.

You can use the `iterate` method to go through all the messages an agent has produced. `waitForInit` helps to get the history ready, potentially loading any existing data.  When an agent sends a new message, `push` adds it to the record. If you need to remove the most recent message, `pop` will retrieve and delete it. Finally, `dispose` lets you clean up the history for an agent when it's no longer needed.

## Interface IHistoryControl

This interface lets you fine-tune how your AI agents remember and track their interactions. 

You can use `useHistoryCallbacks` to specify functions that will be triggered at different points in the history's lifecycle, like when a new event is added or when the history is cleared.

`useHistoryAdapter` allows you to completely customize the underlying class responsible for managing the history data, giving you more control over its implementation.

## Interface IHistoryConnectionService

This interface helps us ensure that the publicly accessible parts of our history connection service are well-defined and consistent. Think of it as a blueprint for how external code interacts with the service, guaranteeing a predictable and reliable experience. It specifically focuses on the features meant for outside use, leaving out any internal workings. This helps keep things organized and prevents accidental misuse of private features.

## Interface IHistoryAdapter

This interface lets your application manage and access the conversation history for AI agents. Think of it as a way to store and retrieve the back-and-forth between an agent and a user.

You can add new messages to the history using the `push` method, specifying the message content, a client identifier, and the agent's name.  To retrieve the most recent message, use `pop`, which removes it from the history.  The `dispose` method allows you to clear the history for a specific client and agent when it's no longer needed. Finally, `iterate` provides a way to loop through all the messages recorded for a client and agent, enabling you to process or display the conversation flow.

## Interface IHistory

This interface keeps track of all the messages exchanged with an AI model within a swarm. You can think of it as a memory for a specific agent or for raw model usage. 

Adding a new message to the record is simple with the `push` method, and you can retrieve the most recent message with `pop`. 

If you need to recreate a conversation for a specific agent, `toArrayForAgent` helps shape the history into a format suitable for that agent, potentially filtering or adjusting messages based on the context. If you just need all the raw messages as they were sent, `toArrayForRaw` provides that directly.

## Interface IGlobalConfig

This file defines global configuration settings that control how the AI agent swarm system operates. Think of it as a central place to customize behaviors and ensure consistency across different parts of the system, like how agents handle tools, log messages, or recover from errors.

You can adjust these settings to fine-tune the system's behavior without modifying core code. For example, you can change how the system deals with tool call exceptions ("flush" the conversation or retry the tool call) or set up custom callbacks for agent changes or stack updates.

Here's a breakdown of what you can configure:

*   **Error Handling:** Define how the system recovers from tool call errors (e.g., resetting the conversation or retrying).
*   **Logging:** Control the level of detail in logging (debug, info, general, console).
*   **History Management:** Limit the number of messages stored in the conversation history.
*   **Tool Usage:** Set limits on how many tools an agent can use in a single run.
*   **Agent Behavior:** Customize how agents map tools, validate outputs, and transform messages.
*   **Persistence:**  Control how data, like agent states and embeddings, is stored.
*   **Operator Connections:** Configure how operators interact with agents and receive messages.
*   **Navigation Stack:** Define the default navigation stack used by agents.
*   **Security:** Control banning of clients or implement security measures.
*   **Performance:** Enable or disable embedding cache.

Many of these settings have default values, but you can override them via the `setConfig` function to adapt the system to specific requirements. This allows you to modify the swarm’s behavior dynamically.

## Interface IFactoryParams

This interface lets you customize how your agent swarm interacts with users and handles different events. You can specify custom messages to be sent when the system needs to clear buffers, when a tool generates output, or when an action is being executed. Importantly, you can include the user's last message in these custom messages, providing context and making the interactions feel more natural. The interface provides flexibility to define simple string messages or more complex functions that can dynamically generate messages based on the situation and agent involved.

## Interface IFactoryParams$1

This interface lets you customize how your agents communicate during navigation. 

You can provide specific messages or even functions that get triggered when the system needs to clear data, run an action, or handle the results of a tool being used. These customizations allow for more nuanced and tailored interactions within your agent swarm. 

Essentially, it provides a way to inject your own logic for key moments in the agent's workflow, giving you fine-grained control over their behavior. The functions can receive information like the client ID and the name of the default agent for personalized messaging.

## Interface IExecutionContext

This interface helps keep track of what's happening within the swarm system. Think of it as a little packet of information that travels between different parts of the system – like the client interface, the performance monitoring tools, and the communication bus. 

Each execution gets its own context, identified by a client ID, a unique execution ID, and a process ID. These IDs help pinpoint exactly which client started the process, what specific task is running, and which part of the system is responsible. It's like having a digital fingerprint for each activity.

## Interface IEntity

This interface, `IEntity`, serves as the foundation for anything that gets stored and managed within the swarm. Think of it as the common ancestor for all the different kinds of data the system keeps track of. More specific entity types, like those holding alive status or detailed state information, build upon this base to add their own unique properties.

## Interface IEmbeddingSchema

This interface lets you configure how the system creates and compares embeddings, which are numerical representations of text used for tasks like finding similar content. You can choose to save the system's internal state to a file for later use, and you’re required to give your embedding method a unique name.

The `writeEmbeddingCache` function lets you store computed embeddings so you don't have to recalculate them every time, and `readEmbeddingCache` lets you check if an embedding has already been computed. You can also customize how embeddings are created and compared using optional callbacks.

To create an embedding from some text, use the `createEmbedding` function. When you need to see how similar two pieces of text are, the `calculateSimilarity` function will give you a number representing their relatedness.

## Interface IEmbeddingCallbacks

This interface lets you tap into what’s happening during the process of generating and comparing embeddings. You can use it to keep track of when a new embedding is created, receiving the original text, the embeddings themselves, and identifying information like the client and embedding name. Similarly, you can monitor how embeddings are compared, getting the two texts being compared, the similarity score, and relevant client and embedding details. These hooks are helpful for things like monitoring performance, debugging, or adding custom logic around embedding creation and comparison.

## Interface ICustomEvent

This interface lets you create and send events with completely custom information. Think of it as a way to communicate specific details between parts of the swarm that don't fit neatly into the standard event formats. You can attach any kind of data you need to these events – numbers, strings, objects – allowing for really tailored communication within the system. It's perfect for events that are unique to your specific use case and require more flexibility than the default event structure provides.

## Interface IConfig

This interface, `IConfig`, holds the configuration settings needed when generating UML diagrams. It's a simple way to control how the diagram creation process behaves. Currently, the only setting you can adjust is `withSubtree`, which is a boolean value that determines whether or not to include subtrees in the generated UML representation. If set to `true`, subtrees will be included; if `false`, they will be omitted.

## Interface IComputeSchema

This interface defines the structure for a compute task within our AI agent swarm orchestration system. Think of it as a blueprint for what a single, manageable unit of work looks like. 

Each compute task has a descriptive name and a short explanation of what it does. You can also mark a task as "shared" if it's intended to be reused across multiple workflows. 

Crucially, it specifies how to retrieve the data needed for the task (`getComputeData`), any dependencies on other tasks (`dependsOn`), and any middleware that should be applied to the process. 

There’s also the option to define callbacks for handling different stages of the task’s execution, and a time-to-live (TTL) to manage its lifespan. Middleware functions allow you to customize the task’s behavior, offering flexibility and control.

## Interface IComputeParams

The `IComputeParams` interface defines the essential information needed for a compute task within the agent swarm orchestration framework. It acts as a container for key components – a unique `clientId` to identify the task, a `logger` for recording events and debugging, a `bus` for inter-agent communication, and a `binding` which specifies the state changes this compute task is responsible for. Think of it as a set of instructions and resources given to an agent to carry out a specific operation within the overall swarm's goals. It's how the framework passes along what an agent needs to know and use to successfully complete its job.

## Interface IComputeMiddleware

This interface defines the structure for middleware components that sit between the orchestration framework and the underlying AI agents. Think of it as a way to customize how requests are sent to and responses are received from your AI agents—perhaps to add logging, transform data, or implement rate limiting. Each middleware implementation needs to provide functions to handle the incoming request and outgoing response, allowing you to inject your own logic into the agent communication process. It's designed to be flexible, so you can tailor the interaction with each agent or group of agents to suit your specific needs.


## Interface IComputeConnectionService

This interface defines how your AI agents connect to and interact with compute resources, like servers or databases. Think of it as the bridge that allows your agents to actually *do* things in the world, instead of just thinking. It specifies the methods you'll need to implement to establish connections, execute commands, and retrieve results from these external systems. If you want your agents to, for example, fetch data from a database or run a script on a server, you're going to use this interface to make that possible. It ensures that all agents using the swarm framework interact with compute resources in a consistent and predictable way.

## Interface IComputeCallbacks

This interface defines a set of optional callbacks that you can provide to customize how compute units within the agent swarm operate. Think of these callbacks as hooks that let you react to different stages of a compute unit's lifecycle. 

`onInit` is called when a compute unit is initialized, giving you a chance to perform any setup tasks. 
`onDispose` signals that a compute unit is being shut down, allowing you to clean up resources or log information. 
`onCompute` is triggered when the compute unit processes data, providing you with the processed data itself.
`onCalculate` lets you know when a specific state is being calculated within the compute unit. 
Finally, `onUpdate` notifies you when a compute unit's state has been updated. By providing these callbacks, you can gain deeper insights into and influence the behavior of your agent swarm’s compute units.

## Interface ICompute

The `ICompute` interface defines the core functions needed to manage computational tasks within the AI agent swarm. Think of it as a blueprint for components that perform calculations and update their status.

The `calculate` function is how these components actually do the work, taking a `stateName` to identify what needs to be computed. The `update` function allows you to report back on the progress or completion of a calculation, identifying both the component (`computeName`) and the client it belongs to. Finally, `getComputeData` is a simple way to retrieve information about the compute component’s current status and data.


## Interface ICompletionSchema

This interface describes how a component within the agent swarm creates and manages completions, like generating text responses. Each completion mechanism has a unique name to identify it within the system. You can also specify flags to pass to the underlying language model, for example, to control its behavior.

To customize what happens after a completion is generated, you can provide optional callback functions. 

The `getCompletion` method is the main way to actually generate a completion; it takes arguments and returns a promise that resolves to a model message.

## Interface ICompletionCallbacks

This interface lets you define what happens after an AI agent completes its task. You can think of it as a way to hook into the finishing point of an agent's work. Specifically, the `onComplete` property allows you to specify a function that will be called when the agent successfully finishes. This function receives information about the completion and the model's output, letting you perform actions like recording the result or starting a new process based on the completed work.

## Interface ICompletionArgs

This interface defines what information is needed when asking the system to generate a response. Think of it as a package containing all the details about a request – who’s asking (clientId and agentName), where the message came from (mode), the history of the conversation (messages), and any tools the agent can use (tools). It’s all about providing enough context for the system to understand the request and generate a relevant and useful response. Each request needs to include a client ID, agent name, execution mode, a list of messages for context, and optionally, a list of available tools.

## Interface ICompletion

This interface defines how different parts of the system can generate responses from AI models. Think of it as a blueprint for creating ways to get answers from AI, offering a full set of tools to do so. It provides a standardized way to handle the process of getting those AI-powered answers.

## Interface IClientPerfomanceRecord

This interface describes the performance data collected for a single client, like a user session or an agent. It provides a detailed breakdown of what’s happening within that client's interactions with the system.

You'd use this to understand how individual clients are performing – are some sessions consistently slower or using more memory than others?

Here's what information is tracked:

*   **clientId:** A unique identifier for the client, so you can tie the performance data back to a specific session or agent.
*   **sessionMemory:** Any data stored within the client's session. Think of it as temporary storage used during the client's activities.
*   **sessionState:**  The client’s persistent state – things like its current step or configuration.
*   **executionCount:**  How many operations (commands, tool calls) the client has performed.
*   **Input & Output Sizes:** Records the total and average sizes of data being sent to and from the client, giving you a sense of data volume.
*   **Execution Time:** Tracks the total and average time taken for each execution, which is useful for identifying bottlenecks and performance issues.

## Interface IChatInstanceCallbacks

This interface provides a way for you to be notified about key events happening within a chat instance managed by the agent swarm orchestration framework. Think of it as a set of event listeners – you can register functions here to respond to things like when a chat session starts, a message is sent, or when an instance is ready or shutting down. You’ll receive details like the client ID, the swarm’s name, and sometimes the specific chat instance object itself, enabling you to track and react to changes in real-time. These callbacks help you build custom monitoring, logging, or even interactive elements around your agent swarm’s communication.

## Interface IChatInstance

This interface represents a single chat session within the agent swarm. It allows you to start a chat, send messages to it, and monitor its activity to ensure it remains responsive. You can initiate a new chat using `beginChat`, and then use `sendMessage` to communicate. The `checkLastActivity` method lets you verify if the chat is still active, while `dispose` gracefully shuts down the session when it’s no longer needed. If you want to be notified when a chat session is closed, you can register a listener with `listenDispose`.

## Interface IChatControl

This framework lets you easily connect different chat interfaces to your agent swarm orchestration. The `useChatAdapter` method lets you plug in a specific chat system – think of it as defining *how* your agents will communicate, whether that's through a standard chat window or a custom integration. 

You can also customize how your chat instances behave using `useChatCallbacks`. This allows you to define functions that will be triggered by events within the chat, letting you tailor the experience and control the flow of information. Essentially, you’re setting up the specific actions that happen when certain things occur in the chat.

## Interface IChatArgs

This interface, `IChatArgs`, defines the information needed to pass a message to an AI agent within the orchestration framework. It's essentially the data package for a single chat interaction. Each package requires a unique client identifier (`clientId`), specifies which agent is responsible for the conversation (`agentName`), and includes the actual message text (`message`) to be processed. Think of it as the envelope containing everything an agent needs to understand a new chat request.

## Interface IBusEventContext

This interface provides extra information about events happening within the AI agent swarm. Think of it as a container for labels that help pinpoint *what* and *where* an event occurred.

For agents directly interacting with the system, like a ClientAgent, the `agentName` is the most commonly used field - it simply tells you which agent triggered the event.

However, the other fields – `swarmName`, `storageName`, `stateName`, `computeName`, and `policyName` – are available to provide context for system-level events, like those related to swarms, storage operations, state changes, computing tasks, or policy enforcement. Essentially, they add detail when an event isn't just about a single agent.

## Interface IBusEvent

This interface defines the structure for messages sent across the system's internal communication channels. Think of it as a standard way for different parts of the system, especially agents, to talk to each other. 

Each message will have a clear origin (source), a specific action it represents (type), and can carry data being sent or received (input and output). There’s also a way to attach extra information, like which agent is sending the message, to provide context. This standardized approach ensures consistent communication and helps orchestrate actions within the swarm.


## Interface IBus

The `IBus` interface acts as a central communication hub within the system, allowing agents to send updates and information to specific clients. Think of it as a way for agents to broadcast messages – like "I finished a task" or "Here's a new result" – directly to the relevant client.

The key method, `emit`, sends these structured messages. When an agent needs to notify the system of something – perhaps a task completion, a tool's output, or a message commit – it uses `emit` to send a clearly defined event. This event includes details like the type of action, the origin of the message, any input data, results, and the client's ID.

Importantly, this communication is asynchronous, meaning the agent doesn't wait for the message to be received; it's placed in a queue and delivered later. The `clientId` within the event confirms the intended recipient, ensuring messages are delivered precisely. This promotes a loosely coupled architecture where agents and clients operate independently, with the bus facilitating communication between them. It's designed to provide reliable notifications and updates across the entire system, contributing to a shared understanding of what's happening.

## Interface IBaseEvent

This interface sets up the basic structure for all events happening within the agent swarm system. Every event, no matter its specific purpose, will have a `source` to tell you where it came from and a `clientId` to specify which client or agent instance it's meant for. Think of it as a common foundation that allows different parts of the system to communicate effectively by sending and receiving these standardized event messages. It makes sure the right information gets to the right place.

## Interface IAgentToolCallbacks

This interface defines a set of optional functions that allow you to tap into the lifecycle of an agent tool. Think of them as hooks you can use to observe and potentially influence what happens when a tool is used. 

You can use `onBeforeCall` to perform actions right before a tool runs, like logging its intended use or preparing data.  `onAfterCall` lets you do things after the tool finishes, such as cleaning up resources or recording the results.

`onValidate` gives you the power to check the tool’s input parameters before it even starts, ensuring everything is correct. And if something goes wrong, `onCallError` allows you to catch the error and handle it gracefully. 

Essentially, these callbacks give you fine-grained control and insight into how your agent tools are operating.

## Interface IAgentTool

This interface describes a tool that an AI agent can use within a swarm. Each tool has a name, a description for documentation, and a way to validate the input it receives before running. 

You can also add custom logic to control what happens before and after the tool is executed. The `validate` property lets you check if the tool’s input is correct. The `call` method is how you actually run the tool, passing in all the necessary information about the request and the agent using it. Finally, there's a way to dynamically define the tool’s metadata, useful for complex scenarios.

## Interface IAgentSchemaInternalCallbacks

This interface lets you plug in custom actions that happen at different points in an agent's lifecycle. Think of them as hooks – you can define functions to be run when the agent starts, produces output, uses a tool, encounters an error, or completes a sequence of actions. These callbacks allow you to monitor agent behavior, log events, or even intervene in the agent's process at various stages like when a tool is requested or when the agent needs to be restarted. You can also get notified when the agent's memory is cleared or when it's being shut down.

## Interface IAgentSchemaInternal

This interface defines how an agent is configured within the swarm. It outlines all the settings that control an agent's behavior, from its name and primary instructions to the tools it can use and how it interacts with other agents.

You can set things like the maximum number of tool calls, how much conversation history the agent remembers, and provide descriptions for documentation. The `prompt` property dictates the agent's core instructions, and `system` prompts are used for more complex protocols like tool usage.

There are also options for connecting to an operator dashboard, defining dependencies on other agents, and transforming the model’s output.  Finally, you can customize the agent's lifecycle with optional callbacks for finer-grained control.

## Interface IAgentSchemaCallbacks

This interface lets you listen in on different points in an agent's lifecycle. You can use these callbacks to monitor what's happening, log actions, or even influence the agent's behavior at specific moments. For example, you can get notified when the agent starts running, when a tool generates output, or when it's being reset. These hooks provide a way to extend and customize the agent orchestration framework without directly modifying its core functionality. You’re able to track things like tool requests, user messages, and system notifications to gain a deeper understanding of how the agent is operating.

## Interface IAgentSchema

This interface, `IAgentSchema`, describes the configuration for an AI agent within a swarm orchestration framework. It allows you to define how an agent should behave, primarily through system prompts.

You can set a `system` prompt – or multiple prompts in an array – to guide the agent's actions and responses, often used when agents need to use tools. `systemStatic` serves as an alternative name for the same purpose.

For more advanced control, `systemDynamic` lets you create system prompts on the fly. This dynamic approach uses a function that generates the prompt based on information like the client ID and agent name, providing greater flexibility and context-awareness.

## Interface IAgentParams

This interface defines the setup information passed to each agent within your AI agent swarm. Think of it as a collection of essential components that allow the agent to operate effectively. 

It includes things like a client ID to identify the user or system interacting with the agent, a logger for recording what the agent does, and a communication bus for coordinating with other agents. 

The agent also gets access to tools it can use to perform tasks, a history tracker to remember previous interactions, and a completion mechanism for generating results. Finally, you can provide a validation function to ensure the agent's output is correct and safe.

## Interface IAgentNavigationParams

This interface defines how you set up navigation for your AI agents. Think of it as providing instructions on where an agent should go and what it will do when it gets there. You specify the tool's name and a short description of its purpose. Crucially, you tell the framework which agent the tool should navigate to.  You can also add an optional note to provide more details about the tool's behavior.

## Interface IAgentConnectionService

This interface helps define how different agents connect and communicate within the system. Think of it as a blueprint for building reliable connections between agents. It’s designed to make sure the public-facing parts of the agent connection service are clear and consistent, hiding the internal workings. By using this interface, developers can ensure their agent connections adhere to a standard and function correctly.

## Interface IAgent

This interface defines how you interact with an individual agent within your swarm. Think of it as the blueprint for each agent's behavior.

You can use the `run` method for quick, isolated tasks or previews without affecting the agent's memory. The `execute` method is the main way to make the agent work, potentially updating its history depending on the execution mode you choose. 

The `waitForOutput` method lets you grab the final result the agent produces.

Beyond that, you have several ways to manage the agent's internal workings: `commitToolOutput` lets you add tool responses, `commitSystemMessage` handles system-level instructions, and `commitUserMessage` allows adding user input without generating a reply.  

You can also control the flow with methods like `commitToolRequest` (to send tool requests), `commitAssistantMessage` (to add assistant replies), `commitFlush` (to clear the agent’s memory), and `commitStopTools` (to halt tool execution). Finally, `commitAgentChange`, `commitCancelOutput` provide mechanisms to interrupt or reset agent processes.
