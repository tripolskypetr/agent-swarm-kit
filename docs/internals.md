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

This function lets you kick off a sequence of actions, or a "pipeline," within your AI agent swarm. You tell it which client is making the request, what pipeline you want to run, and which agent should handle it. You can also pass in some data, called a payload, which the pipeline can use to guide its actions.  The function will then promise to return a result once the pipeline has completed. Think of it as sending a command to your swarm to get a specific job done.


## Function scope

This function lets you run a piece of code—like a function that interacts with AI agents—within a controlled environment. Think of it as creating a little sandbox where your code can operate. You provide the code you want to run, and this function handles the surrounding setup, including connecting it to the AI agents and tools it needs. You can also customize which agents and tools your code uses if you want to experiment or need specific configurations. Essentially, it simplifies running AI-powered tasks by managing the necessary connections and settings for you.

## Function runStatelessForce

This function lets you run a specific instruction or message through your AI agent swarm, essentially giving it a one-off task. It's designed for situations where you don't want the message to be part of the ongoing conversation history, like when dealing with outputs that need to be processed repeatedly or for quick, isolated actions. 

Unlike some other functions, it guarantees execution even if the agent assigned to handle it isn't actively working at that moment. It takes the instruction itself as text, plus a unique identifier for the client making the request. The system handles the behind-the-scenes work of validating everything, tracking performance, and ensuring a clean working environment for the agent.

## Function runStateless

This function lets you quickly run a command or instruction with a specific agent in your swarm, without adding it to the agent’s ongoing conversation history. Think of it as sending a one-off message for tasks like processing data or handling output – it’s helpful when you don't want to clutter the chat log.

It verifies that the agent is available and active before carrying out the request. The function executes the given content in a fresh environment, tracks how long it takes, and alerts other parts of the system about what's happening. If the agent has been replaced with a different one since the session started, the function will skip the execution.

You provide the content you want executed, a unique identifier for the client making the request, and the name of the agent you want to use. The function then returns the result of the execution.

## Function questionForce

This function lets you directly trigger a question-answering process, even if it's not naturally arising from a conversation. Think of it as a way to force the AI agents to consider a specific question within a defined knowledge base (the wiki). You provide the actual question you want answered, a unique identifier for who's asking (the client), and the name of the wiki containing the relevant information. The function will then return the AI agents' response to that forced question.

## Function question

This function lets you send a question to the AI agent swarm for processing. It takes the actual question as a string, along with information about who's asking (a client ID), which agent is responsible for handling it, and the specific knowledge base (wiki) it should use. The function then returns a promise that will eventually resolve with the answer received from the agents. Think of it as the main way to get answers from your AI agent team.

## Function overrideWiki

This function lets you update a wiki's configuration within the swarm system. You can provide a new or partial schema to change how a specific wiki operates. Think of it as making adjustments to a wiki’s settings – like changing its permissions or structure – without affecting other parts of the system. The function creates a separate, isolated environment for these changes to ensure they don't interfere with anything else happening. It also keeps a record of the update if logging is turned on. You provide the new or updated schema details as input, and the function takes care of applying those changes to the relevant wiki.

## Function overrideTool

This function lets you modify how a tool behaves within the AI agent swarm. Think of it as a way to tweak an existing tool's definition, perhaps to adjust its capabilities or how it interacts with the system. You provide a partial schema – only the parts you want to change – and the function applies those updates. It's designed to be a clean operation, ensuring it doesn’t interfere with other processes. The system will keep a record of this modification if logging is turned on.

## Function overrideSwarm

This function lets you change the settings of a swarm already running in the system. Think of it as updating a swarm's blueprint – you can provide a new or partial set of instructions. It makes these changes directly, ensuring a fresh start without interfering with any ongoing work.  You can adjust things like the number of agents or their specific roles. The system keeps a record of these changes if logging is turned on. The `swarmSchema` parameter is where you specify the new or modified settings.

## Function overrideStorage

This function lets you modify how the swarm system handles data storage. Think of it as a way to tweak the storage configuration without affecting other parts of the system. You can use it to add or change settings for a specific storage type. It ensures the update is isolated and doesn't interfere with ongoing operations, and it will record the change if logging is turned on. You can provide only the parts of the storage schema you want to change; you don't need to provide the entire configuration.

## Function overrideState

This function lets you change how the swarm system handles a particular state. Think of it as updating a blueprint – you can provide new details or modify existing ones to reflect changes in your agent's needs. It’s designed to work independently, ensuring that your changes are applied cleanly without interfering with ongoing processes. The system keeps a record of these modifications if logging is turned on. You can provide just a few updates to the schema, or even replace the entire schema definition.

## Function overridePolicy

This function lets you change the settings for a policy within the swarm system. Think of it as a way to update a policy's configuration – you can provide a whole new policy or just a few changes. It works independently, ensuring a clear and isolated change process. If the system is set up to log actions, this function will record that a policy has been modified. You provide the new or updated policy details, and the system applies them.

## Function overridePipeline

This function lets you tweak an existing pipeline definition. Think of it as a way to make small adjustments without completely rewriting the whole thing. You provide a partial pipeline definition – only the parts you want to change – and this function merges those changes into the original pipeline. This is helpful for customizing workflows or adapting them to new requirements. The `Payload` type ensures that the pipeline handles data in a consistent way.

## Function overrideMCP

This function lets you modify an existing Model Context Protocol (MCP) schema. Think of an MCP as a blueprint for how an AI agent shares information – this function allows you to adjust that blueprint. You provide the original MCP schema, and the function returns a new, updated version incorporating your changes. This is useful for adapting schemas to specific needs or extending existing ones. Basically, you’re replacing parts of an MCP with your own definitions.

## Function overrideEmbeding

This function lets you change how the swarm understands and processes information by modifying the embedding schema. Think of it as fine-tuning the way the system converts data into a numerical representation. You can provide a new schema or just update specific parts of an existing one. This change is made directly, independent of any ongoing tasks, ensuring a clean update. If logging is turned on, the system will record that you’ve made this modification. You only need to provide the parts of the schema you want to change; the rest will remain as they are.

## Function overrideCompute

This function lets you modify an existing compute schema, allowing you to customize how your AI agents perform tasks. Think of it as a way to fine-tune the underlying mechanics of your agent swarm. You provide a partial schema containing the changes you want to make, and the function merges these updates into the original schema. This is helpful for adjusting resource allocation, execution strategies, or other computational aspects of your agents without needing to recreate the entire schema from scratch. The function returns the updated, complete compute schema.

## Function overrideCompletion

This function lets you modify how the AI agents in the swarm generate responses. You can provide a new or partial configuration for a specific completion method, essentially changing its behavior. It's designed to make these changes cleanly and independently, without affecting other ongoing processes. The system will record these changes if logging is turned on. You can use it to fine-tune the AI’s output style or adjust its creativity.

## Function overrideAgent

This function lets you change an agent's settings within the swarm. Think of it as a way to update an agent's configuration – you can provide a new schema or just a few changes. The system will apply these changes directly, making sure the update is isolated and doesn't interfere with anything else that's running. If logging is turned on, you'll see a record of this override happening. It's all about giving you the power to adjust agent behavior on the fly. You only need to specify the parts you want to change; the rest will remain as they are.

## Function notifyForce

This function lets you send messages directly out of a swarm session, acting as a notification without triggering any standard message processing. Think of it as a way to communicate something to the swarm without it being interpreted as a command. 

It's specifically for sessions created using "makeConnection" mode, and it carefully checks that the agent you're sending the notification to is still available and active. 

You provide the message content and a unique identifier for the client session, and the system handles the rest, ensuring a clean and logged transmission. It won’t work if you’re using a different session type.


## Function notify

This function lets you send a message out of your AI agent swarm without triggering any processing of incoming messages. Think of it as a way to broadcast a notification directly from the system.

It's specifically designed for sessions created using the "makeConnection" method, and makes sure the agent you're sending the message from is still available and hasn't been replaced. 

You’ll need to provide the message content, a unique identifier for the client sending the message, and the name of the agent you want to use to send it. Essentially, it's a simple way to communicate output from the swarm without running any further actions.

## Function markOnline

This function lets you tell the system that a particular client is now active and participating in a specific swarm. Think of it as signaling that an agent has successfully joined the group. You need to provide the unique ID of the client and the name of the swarm it belongs to. This helps the system keep track of which agents are currently available for tasks within that swarm.

## Function markOffline

This function lets you tell the system that a particular client is no longer active within a specific swarm. Think of it as updating the system's knowledge about which agents are currently participating. You provide the unique ID of the client and the name of the swarm it belongs to, and the function handles the rest, ensuring the system knows to stop sending tasks to that client. It’s useful for situations where a client disconnects unexpectedly or completes its work.

## Function listenEventOnce

This function helps you listen for a single event from your AI agents within the swarm. You can specify which agent (or all agents) you want to hear from and what kind of event you're interested in by providing a filter. Once an event matches your criteria, a callback function you provide will be executed with the event’s details. After that single event is processed, the listener automatically stops. To stop the listener early, you can use the function it returns.

## Function listenEvent

This function lets you tune in to specific messages being sent across the agent swarm. You tell it which client you want to hear from – or choose to listen to all clients – and the name of the message topic you're interested in. When a message matching that topic arrives, a function you provide will be executed, receiving the message content. To stop listening, the function returns a special "unsubscribe" function that you can call. It ensures a clean execution and prevents you from using restricted message topic names.

## Function hasSession

This function helps you quickly check if a client currently has an active session. It's a simple way to see if a client is logged in or has a connected session without retrieving the session details themselves. Behind the scenes, it uses a session validation service to perform the actual check. You provide the unique identifier for the client, and the function returns `true` if a session exists, and `false` otherwise. If you have logging enabled, the function will also record that it was called.

## Function hasNavigation

This function lets you quickly determine if an agent is currently involved in guiding a client through a specific process. It verifies that the client and agent are properly set up, finds the relevant group of agents (the swarm), and then checks if the agent is on the navigation path for that client. You can use this to see if an agent is responsible for helping a client at a particular stage.

The function requires you to provide the unique ID of the client and the name of the agent you want to check. It will return `true` if the agent is part of the navigation route, and `false` otherwise. The system can also record that this check occurred if logging is turned on.

## Function getWiki

This function lets you fetch a specific wiki's information from the system. You provide the name of the wiki you're looking for, and it returns all the details associated with that wiki. The system keeps track of these requests if logging is turned on. Think of it as asking the system, "Hey, can you give me the details for this particular wiki?"

## Function getUserHistory

This function helps you get a record of what a user has said or done during a particular session. It pulls the complete history for a client and then specifically extracts the parts where the user interacted. Think of it as retrieving a user's conversation log for a specific client. You provide a unique identifier for the client session, and the function returns an array of messages representing that user’s actions. It’s designed to run cleanly and keeps track of its operations for debugging purposes.

## Function getTool

This function helps you get the blueprint for a specific tool used by your AI agents. Think of it like looking up the instructions for a particular gadget. You give it the tool's name, and it returns a description of what the tool can do and what kind of information it expects. If your system is set up to record activity, this function will also create a log entry indicating which tool was requested. It's a way to access the tool definitions that guide your AI agents' actions.

## Function getSwarm

This function lets you fetch the configuration details – essentially the blueprint – for a specific swarm within your AI agent system. You provide the name of the swarm you're interested in, and it returns a structured object containing all its settings. If your system is set up to log actions, this retrieval will be recorded. Think of it as looking up the recipe for a particular team of AI agents.


## Function getStorage

This function lets you fetch the blueprint for a specific storage area within your AI agent swarm. Think of it as getting the instructions on how that storage is structured and what kind of data it holds. You provide the name of the storage you're interested in, and the function returns a detailed schema describing it.  If your swarm is configured to log activity, this retrieval will be recorded.


## Function getState

This function lets you fetch a specific state definition from the system, identifying it by its name. Think of it as looking up the blueprint for a particular piece of information the swarm is managing. It's useful when you need to understand the structure or available data within a state. If the system is set up to record activity, this retrieval process will be logged for tracking purposes. You provide the name of the state you're interested in, and the function returns the schema describing it.

## Function getSessionMode

This function lets you find out the current operating mode for a specific client session within your swarm. Think of it as checking what stage a particular client is in – whether it's actively engaged ("session"), attempting a connection ("makeConnection"), or finalized ("complete").  You provide the unique ID of the client session, and the function will return that mode.  Behind the scenes, it double-checks that the session and swarm are valid, records the action if logging is turned on, and securely fetches the session's mode. It's designed to run independently, ensuring a clean and reliable check.

## Function getSessionContext

This function helps you understand the environment your AI agents are working in. It gathers information like a unique identifier for the client, the process ID, and details about the methods and execution environments available. Think of it as getting a snapshot of the current situation for your agents – it’s useful for knowing who's running what, and where. Because it's tied to the current environment, you don't need to provide any extra information to use it.

## Function getRawHistory

This function lets you access the complete, untouched history of a client's interactions with the agent swarm. Think of it as retrieving the raw data log for a specific session. You provide a unique identifier for the client, and it returns an array containing all the messages exchanged, exactly as they were recorded. It's a way to get the full picture of what happened during a session, without any filtering or alterations. The system ensures the session is valid and retrieves the relevant agent before fetching the history.

## Function getPolicy

This function lets you fetch a specific policy definition from the system. Think of it as looking up the blueprint for how a particular task or behavior should be handled within the swarm. You provide the name of the policy you're interested in, and it returns the complete policy schema – outlining all its settings and rules. If your system is set up to record activity, this retrieval process will also be logged.


## Function getPipeline

This function lets you fetch the blueprint, or schema, of a specific pipeline that's already defined within the AI agent swarm. Think of it as looking up the instructions for a particular sequence of steps. You provide the pipeline's name, and it returns the schema that describes how that pipeline is structured and what it does. The system will also record this request if logging is turned on in the overall configuration.

## Function getPayload

This function helps you grab the data currently being used by the AI agents – think of it as fetching the current task or instruction set. It's designed to work with different kinds of data, represented as objects. If there's no active task or instruction set available, it will return nothing (null). It also keeps a record of when it's used, if your system is set up to log these actions.

## Function getNavigationRoute

This function helps you find the path an agent has taken within a swarm. It takes a client ID and the swarm's name as input and returns a list of agent names representing the route. Think of it as tracing the steps an agent took while working within a particular swarm. It uses a navigation service to determine the route and log this process based on system settings. You'll need to provide the unique identifier for the client making the request, and the name of the swarm you're interested in.

## Function getMCP

This function lets you fetch the blueprint, or schema, for a specific Model Context Protocol (MCP) within your AI agent swarm. Think of it as looking up the instructions for how a particular agent should behave and interact. You provide the name of the MCP you’re interested in, and the function returns the detailed schema describing it. The system will also record this request if logging is turned on. 

It’s a straightforward way to access the configurations that define your agents’ behavior.

## Function getLastUserMessage

This function lets you grab the very last message a user sent during a conversation. It finds this message by looking through the conversation history associated with a specific client ID. If a user message exists, you'll get its content as text. If no user message was sent, it returns nothing. It's a simple way to access the most recent user input for a particular client.

## Function getLastSystemMessage

This function helps you access the latest message sent by the system within a specific client's conversation history. Think of it as getting the last instruction or update provided to an AI agent. 

It digs into the complete history for a client and looks for the most recent message labeled as a "system" message. If no system messages were sent, it will return nothing. You provide the unique identifier of the client to pinpoint the correct history.

## Function getLastAssistantMessage

This function helps you get the last message sent by the assistant during a client's interaction. It looks through the history of messages for a specific client and finds the most recent one where the assistant was the speaker. If no assistant messages were sent, it will return nothing. You need to provide the unique identifier for the client session to use this function.

## Function getEmbeding

This function lets you fetch the details of a specific embedding model that your AI agent swarm is using. Think of it as looking up the blueprint for how the swarm understands and represents information. You provide the name of the embedding model you want to know about, and it returns all the information associated with it, like its structure and characteristics. If your system is configured to keep records, this action will also be logged for tracking purposes.

## Function getCompute

This function lets you fetch details about a specific compute resource within the AI agent swarm. Think of it as looking up the configuration for a particular task or processing unit. You provide the name of the compute you're interested in, and it returns a description of what that compute does and how it's set up. If your system is set up to record activity, this function will also log that you've requested this information.

## Function getCompletion

This function lets you fetch a pre-defined "completion" – think of it as a blueprint for how an AI agent should respond or behave – by its unique name. It’s a way to access and reuse common patterns across your AI agent swarm. The function will quietly record its activity if you've configured your system to track such events. You provide the name of the completion you want to retrieve, and it returns the full description of that completion.

## Function getAssistantHistory

This function lets you see what an assistant has said during a specific conversation. It pulls the complete conversation history for a client and then focuses only on the assistant's messages. Think of it as retrieving a transcript of the assistant's responses.  You need to provide the unique identifier for the client session you're interested in. The result you get is a list of messages, each representing something the assistant said.

## Function getAgentName

This function lets you find out the name of the agent currently working on a specific client's session within your AI agent swarm. You provide the unique identifier for that client session, and the function returns the agent’s name. It handles the behind-the-scenes work of verifying the session and making sure everything is working correctly, and it’s designed to run independently so it doesn’t interfere with other operations. Basically, it's a simple way to identify which agent is handling a particular client.


## Function getAgentHistory

This function lets you look back at the interactions and decisions made by a particular agent within your AI swarm. It's designed to give you a detailed record, taking into account any adjustments made by the system to improve performance. 

You provide the unique ID of the client session and the name of the agent you're interested in. The system will then fetch the agent’s history, applying any pre-defined rescue strategies to ensure accuracy and relevance. 

Essentially, it's a way to examine an agent’s past actions and understand how it’s been behaving. The process is isolated to avoid interference from other ongoing operations.


## Function getAgent

This function lets you fetch the details of a specific agent within your AI agent swarm. Just provide the agent's name, and it will return all the information associated with that agent's configuration. The system will also record this request if logging is turned on in your overall setup. It’s a simple way to access agent definitions programmatically.

## Function fork

This function lets you run code – specifically, a function you provide – in a controlled environment. Think of it as giving a task to an agent and ensuring everything around that task is handled correctly, like creating a workspace and cleaning up afterward. You give it a function that will do the actual work, along with some settings to customize how it runs. The function you provide will receive a unique identifier for the task and the name of the agent performing it, so you can tailor the task to the specific agent. Ultimately, this function simplifies running tasks by abstracting away the complexities of session management and setup.

## Function executeForce

This function lets you directly send a message or instruction to the currently active agent in your swarm, acting as if it came from a client. It's perfect for situations where you need to quickly review what an agent is doing or want to trigger a specific action, even if the agent's status isn't what you expect.

Essentially, it bypasses checks to see if the agent is ready and just goes ahead with the execution, giving you more control. You provide the message you want sent and a unique ID identifying the client making the request. The system handles the details of validating the session, tracking performance, and keeping things organized behind the scenes.

## Function execute

This function lets you send messages or commands to a specific agent within a group of agents working together. Think of it as relaying instructions from a client application to an agent, like asking it to review some output or start a conversation. 

Before sending the message, the system makes sure the agent is still participating in the session and that the request is valid. It carefully tracks how long the execution takes and notifies other parts of the system about the activity. 

You’ll need to provide the message itself, a unique identifier for the client making the request, and the name of the agent you want to send the message to.

## Function event

This function lets your agents communicate with each other within the swarm. It's like sending a message to a specific channel – you specify a unique client ID, a topic name (make sure it's not a reserved word!), and the data you want to share. This sends out a custom event that other agents listening on that topic can pick up. The system ensures a controlled environment for the message and prevents using certain reserved topic names to keep things organized.

## Function emitForce

This function lets you directly send a string as output from the AI agent swarm, acting like a direct message without triggering any usual processes. It's specifically for sessions created using `makeConnection` and ensures everything works smoothly within that connection type. 

Essentially, it gives you a way to inject content into the swarm's output stream, useful in specific scenarios where a standard message flow isn’t needed. You’ll need to provide the content you want to send and a unique identifier for the client session. The system verifies the session's setup and keeps things clean before sending the content.

## Function emit

This function lets you send a string as output from an agent within the swarm, essentially simulating a response. It's specifically for connections made with `makeConnection` and ensures that the agent you're sending the output from is still active and part of the swarm.

It checks if the agent is still valid and operating before sending anything, making sure everything is working correctly. The function also creates a fresh environment for the output and keeps a record of the operation, but only if logging is enabled. You can't use this function unless the session was originally established using `makeConnection`.

You provide the string to be sent, a unique ID for the client sending it, and the name of the agent responsible for the output.

## Function commitUserMessageForce

This function lets you add a user's message to an agent's conversation history directly, even if the agent isn's currently responding. Think of it as manually updating the record of what was said. It's designed for situations where you need to ensure a message is logged, regardless of the agent’s state. You’re essentially telling the system to add the message to the history and letting it handle the details of validating the session and logging the action. The function also includes safety measures by running in a clean environment to prevent unexpected interference. You’ll need to provide the message content, the execution mode, a client ID to identify the session, and optionally, some extra data through the payload.

## Function commitUserMessage

This function lets you record what a user has said to a particular agent within your AI agent swarm, essentially adding it to the agent's conversation history. It's useful for keeping track of the interaction without immediately generating a response from the agent. 

You provide the message content, specify the agent involved, and identify the client session associated with this action. The system verifies that the agent and session are still valid and logs the action for tracking purposes. It's designed to be executed in a controlled environment, separate from any ongoing operations, ensuring a reliable record of the user's input.

## Function commitToolRequestForce

This function lets you directly push tool requests to an agent within the swarm, essentially overriding some usual checks. It’s useful when you need to ensure a request gets processed immediately, even if it wouldn't normally pass standard validation.  The function takes an array of tool requests and a client ID to identify the session. It handles the execution environment and keeps track of what's happening through logging.


## Function commitToolRequest

This function sends tool requests to a specific agent within the AI agent swarm. It makes sure the agent is valid and the request is properly associated with a client session before sending it. Think of it as the way you tell an agent to perform a task, and it handles the necessary checks to make sure everything goes smoothly and is logged for tracking. The requests you send are an array, and you need to specify both the client and the agent you’re targeting.

## Function commitToolOutputForce

This function lets you directly push the output from a tool back into the agent's workflow, even if you're not sure the agent is still actively participating in the session. It’s like a shortcut to update the agent's knowledge without a formal check.

Essentially, you provide the tool’s ID, the output content, and the client session ID, and the system handles the rest. 

The system will still validate the session and swarm behind the scenes, and log the action if logging is turned on. It ensures the update is handled correctly by the session's infrastructure. This process is designed to run independently to avoid potential conflicts with ongoing operations.


## Function commitToolOutput

This function lets you record the results from a tool that an agent used, ensuring that the information is properly associated with that agent’s work within the swarm. It's like saving a tool's answer so everyone knows who provided it and what they were doing. 

Before saving, it double-checks that the agent is still the one in charge of the task. It also keeps a log of what's happening. Essentially, it’s a safe and reliable way to update the swarm with tool outputs, guaranteeing accuracy and traceability.

You'll need to provide the tool’s ID, the actual result from the tool, a client identifier for the session, and the name of the agent responsible for using the tool.

## Function commitSystemMessageForce

This function lets you directly push a system message into a session, bypassing normal checks about which agent is currently active. It's like a shortcut for situations where you absolutely need a system message to be recorded, even if an agent isn't actively managing the session. 

Think of it as a way to force a system update or instruction into the session history. Before committing, it verifies the session and the overall swarm setup. 

You’ll need to provide the message content and the client ID to identify the session it belongs to. This function is a powerful tool, so be mindful when using it, as it circumvents the usual agent interaction flow.


## Function commitSystemMessage

This function lets you send messages directly to an agent within the AI swarm, which are system-generated rather than responses from the assistant. It's used for things like configuring the agent or sending control instructions.

Before sending the message, the function checks to make sure the agent, session, and swarm are all valid and that the agent you're targeting is the correct one. It carefully manages how this message is handled and keeps track of everything using logging. 

You'll need to provide the content of the message, the ID of the client using the system, and the name of the agent you want to send the message to.

## Function commitStopToolsForce

This function lets you immediately halt the next tool execution for a particular client within the swarm system, bypassing standard checks. It's a forceful way to stop a tool from running, even if an agent is currently active. 

Think of it as an emergency stop – it skips checking the agent's state and just prevents the next tool from starting. 

It ensures the session and swarm are valid, logs the action, and uses various services to guarantee a clean and reliable stop. The client's ID is essential to identify which session to affect. It’s similar to a forceful flush, giving you more direct control.

## Function commitStopTools

This function puts a pause on the next tool execution for a specific agent working on behalf of a client. Think of it as a temporary stop sign for a particular agent’s work. 

Before stopping the agent, the system checks to make sure the agent and the client are actually valid and registered within the swarm. 

It works behind the scenes, carefully managing the execution environment and keeping a record of what’s happening. It’s different from clearing an agent’s history; instead, it just temporarily halts the flow of tools being used. 

You’ll need to provide the client's ID and the agent's name to use this function.

## Function commitFlushForce

This function lets you forcefully clear the history for a particular client within the agent swarm. It's a way to ensure the history is updated even if there are issues with the currently active agent. 

Essentially, it bypasses some usual checks – like confirming an agent is active – and directly flushes the history. Think of it like a "hard reset" for a client's history. 

It relies on several services to manage the process, ensuring session validity and keeping track of what's happening. You'll need to provide the client's unique ID to use this function.

## Function commitFlush

This function lets you completely wipe the history of a specific agent for a particular client. Think of it as a reset button for an agent’s memory within the system. It makes sure everything is valid – the client, the agent, and the overall swarm – before proceeding with the history clear.  It’s designed to work alongside functions that add to the agent’s history, providing a way to clear everything out instead of just adding new information. You specify which client and which agent you want to reset.

## Function commitAssistantMessageForce

This function lets you directly push a message from an assistant into a session, even if there isn't an active agent currently handling it. It's a way to override the normal flow and force a message to be recorded. 

Think of it as a shortcut for situations where you need to ensure a message is logged immediately, bypassing the usual agent checks. It confirms the session and swarm are valid before committing the message and logs all actions. 

You provide the message content and the client ID to identify the session. This function is similar to `cancelOutputForce`, offering a more forceful operation compared to the standard commit process.


## Function commitAssistantMessage

This function lets you record messages generated by an AI agent within the orchestration system. It’s designed to save the agent's output, ensuring it's properly associated with the right agent, client, and session. Before saving, the function double-checks that everything is valid – the agent, the session it belongs to, and the overall swarm – to prevent errors. It keeps track of operations and logs them for monitoring purposes. Think of it as the counterpart to canceling an agent's output, where this function saves the output instead.

You provide the message content, a client identifier, and the agent's name to use when committing.

## Function changeToPrevAgent

This function allows you to switch a client back to the agent they were using before, or to the system's default agent if they haven't used one yet. It's designed to manage agent transitions within a swarm environment, ensuring a smooth experience for the client.  You provide a unique identifier for the client session to indicate which client's agent should be changed. The system handles the details of verifying the session, logging the change, and making sure the transition happens reliably, all while keeping things organized and secure.

## Function changeToDefaultAgent

This function helps you easily switch a client back to the standard, pre-configured agent within your AI agent swarm. It's designed to revert a session to the default setup, ensuring a consistent and reliable experience. You provide the unique ID of the client session, and the system handles the rest, including verifying everything is set up correctly and making the change safely. The switch happens in a controlled way, using a queued process to avoid conflicts and maintain stability.

## Function changeToAgent

This function lets you switch which AI agent is handling a particular client session within your swarm. Think of it as reassigning a customer to a different agent. It carefully verifies that the switch is valid and logs the change if you've configured logging. The change happens in a controlled way, ensuring it's processed reliably and doesn’t interfere with other ongoing tasks. To make the transition smooth, you provide the name of the new agent and a unique ID for the client session.

## Function cancelOutputForce

This function lets you abruptly stop an agent's output for a particular client. It essentially clears the expected output, ignoring whether an agent is currently working on it. 

It verifies that the client's session and the swarm are valid before proceeding with the cancellation. 

Think of it as a "hard stop" – useful when you need to quickly reset an agent's process without worrying about its current state. You just provide the client's ID, and the function handles the rest, ensuring everything is properly checked and logged along the way.


## Function cancelOutput

This function lets you stop an agent from continuing to generate output for a particular client. It's useful if you need to interrupt a process or quickly change direction.

Essentially, you provide the client's ID and the agent's name, and the system will halt the agent's output generation by signaling it to stop.

Before doing so, the system carefully checks to make sure the agent and client are valid and associated with an active session. It also keeps track of all these operations for logging and management purposes.



**Parameters:**

*   `clientId`:  Identifies the client you want to cancel the agent's output for.
*   `agentName`: Specifies the agent whose output you are canceling.

## Function addWiki

This function lets you add a new wiki structure to the orchestration framework. Think of it as defining a template for how information will be organized and processed within your AI agents. You provide a `wikiSchema`—essentially a blueprint—and the function returns a unique identifier for that newly added wiki. This identifier will be used later to reference and work with that specific wiki.

## Function addTriageNavigation

This function lets you set up a special tool for your AI agents, allowing them to easily request help from a dedicated triage agent when they get stuck or need more specialized assistance. It's like giving them a direct line to a supervisor. You provide some configuration details, and the function handles the rest, essentially registering this "triage navigation" tool so your agents can use it. The result is a unique identifier for this navigation tool, which you need for navigating user question to another agent using superviser.

## Function addTool

This function lets you add new tools that your AI agents can use. Think of it as equipping your agents with new abilities! You define the tool's properties, like what it does and how it works, using a schema. Once registered, the tool becomes available for agents to use when they’re figuring out how to accomplish tasks. It’s a key step in setting up the tools your agents have at their disposal.

## Function addSwarm

This function lets you create a new swarm, which is essentially a container for organizing and managing your AI agent interactions and client sessions. Think of it as defining a blueprint for how your agents will work together. By registering a swarm with this function, you're telling the system what the structure and behavior of your agent workflows will be. The system will only recognize swarms added this way. The process runs in a clean environment to avoid conflicts, and it logs the action for tracking purposes. You’ll receive the swarm’s name as confirmation that it’s been successfully created.



The `swarmSchema` parameter holds all the details about your new swarm, like its name and how it should behave.

## Function addStorage

This function lets you add a new type of data storage to the swarm system. Think of it as registering a new tool that the agents can use to save and retrieve information. Only storages added this way are recognized by the swarm, so it's essential for extending the system's capabilities.

If the storage is designed to be shared amongst agents, this function also handles setting up the connection to that shared storage and waiting for it to be ready. The process happens in a special environment to ensure clean execution. Finally, you’ll get back the name of the storage you just added.

You provide a schema, which defines how the storage engine works – its name, whether it's shared, and other important settings.

## Function addState

This function lets you define and register new states within the agent swarm system. Think of it as creating a blueprint for a specific type of data the swarm can use and share. Only states registered this way are recognized, and if a state is designated as shared, this function handles setting up the necessary connection. It ensures the registration happens in a safe and isolated environment, and it provides a name for the newly registered state. You’ll need to provide a schema that describes the state's properties, including its name and whether it’s meant to be shared among agents.

## Function addPolicy

This function lets you define and register rules for your AI agents within the swarm. Think of it as setting up the guidelines that agents will follow. It registers the policy so it can be validated when it's used and also keeps track of the policy's structure. The process is carefully managed, with detailed logging to help you understand what's happening. To add a new policy, you provide a schema describing the policy's name and other configuration.

## Function addPipeline

This function lets you define and register a new workflow, or "pipeline," within the system. Think of it as giving the system a blueprint for how different AI agents should work together to achieve a specific task. When you use this function, it checks to make sure your blueprint is well-formed and then adds it to the system’s collection of available workflows. The function returns a unique identifier for your pipeline, which you’re going to need later when you want to actually run that workflow. You can specify what kind of data the pipeline will handle, making it more flexible and robust.


## Function addMCP

This function lets you add a new Model Context Protocol (MCP) schema to the orchestration framework. Think of an MCP schema as a blueprint defining how an AI agent understands and interacts with specific information or tasks. When you add a schema, the system recognizes and can utilize this new protocol for agent interactions. The function returns a unique identifier for the registered schema, allowing you to reference it later. Essentially, it’s how you tell the system about a new type of agent interaction it should be aware of.

## Function addEmbedding

This function lets you add a new embedding engine – think of it as a tool for understanding the meaning of text – into the system's toolkit. By registering an embedding engine with this function, you're telling the swarm which tools it can use for tasks involving text analysis and comparison.  Only embeddings registered this way are recognized, ensuring consistency across the system. The process is handled in a controlled way, separate from ongoing operations, and confirms the embedding's name once it's successfully added. You’ll provide a schema that details the embedding engine's name and how it's configured.

## Function addCompute

This function lets you define and register a new type of computational task for your agent swarm. Think of it as setting up a blueprint for a specific job an agent can do. It checks that your blueprint is valid before adding it to the system, ensuring everything is set up correctly. The function returns a unique identifier for the newly registered compute type, allowing you to easily refer to it later when assigning tasks to agents.

## Function addCompletion

This function lets you add a new completion engine – think of it as a way for your agents to generate text – to the system. It registers the engine so agents can use different models, like mock versions, GPT4All, Ollama, or OpenAI. 

When you add a completion engine, it's validated and made available for use by all the agents in the swarm. The process is handled in a separate environment to keep things clean and organized. You'll get the name of the completion engine back as confirmation it’s been added.



The key thing you’ll provide is a schema that defines how this new completion engine works, including its name and how to configure it.

## Function addAgentNavigation

This function lets you set up a way for one agent in your swarm to easily navigate and interact with another. Think of it as creating a digital "bridge" between agents, allowing them to find and work with each other more effectively. You provide some configuration details, and the function registers this navigation tool, making it available for your agents to use. It returns a unique identifier for this navigation setup.

## Function addAgent

This function lets you add new agents to the swarm, essentially registering them so the system knows about them and can use them. Think of it as formally introducing a new member to the team. To make an agent usable by the swarm, you need to register it using this function. It ensures the agent is properly validated and its configuration is understood by the system, and it runs in a controlled environment to keep things clean. Successfully adding an agent will give you back its name.

# agent-swarm-kit classes

## Class WikiValidationService

This service helps ensure your wikis – think of them as structured knowledge bases – adhere to specific rules and formats. You can add different wikis, each defined by its own schema, to this service.  Then, when you have some content you want to add to a wiki, you can use this service to check if it fits the expected structure.  Essentially, it’s a tool for maintaining consistency and quality across your various knowledge repositories. It keeps track of the schemas for each wiki and provides a way to confirm that new content aligns with those definitions.

## Class WikiSchemaService

This service helps manage and work with the underlying structure – the schema – that defines a wiki. It acts as a central place to register, retrieve, and update these schema definitions. 

The service uses a logger to track activity and relies on a schema context service to handle schema-related operations like validation and retrieval. 

You can register new schema definitions, replace existing ones, or simply fetch a schema by its unique identifier. Think of it as a librarian for wiki blueprints.

## Class ToolValidationService

This service helps ensure that the tools used by your AI agents are correctly configured and exist within the swarm. It keeps track of all registered tools and their details, preventing duplicates and making sure they’re valid.

The service logs its actions for monitoring and uses a technique called memoization to speed up validation checks. 

You can add new tools to the service’s records, and the service provides a way to check if a tool is registered and ready to be used by an agent. It works closely with other parts of the system, like the tool registration and agent validation components.

## Class ToolSchemaService

This service acts as a central library for managing the blueprints of tools used by agents within the swarm. It keeps track of what each tool does – things like how it's called, how its inputs are validated, and what extra information it has.

When a new tool is added or an existing one is updated, this service makes sure it's structurally sound before registering it. It works closely with other parts of the system, like the agent connection and schema services, ensuring that agents are properly equipped with the tools they need.

You can use it to:

*   **Define tool characteristics:** Specify the "call" function, validation rules, and metadata for each tool.
*   **Register tools:** Add new tool definitions to the central registry.
*   **Retrieve tool definitions:** Get a tool’s blueprint when an agent needs to use it.
*   **Update existing tools:** Modify a tool’s definition if needed, ensuring the changes are properly validated.



The service keeps a record of these tool definitions, making it easy for the swarm system to understand and utilize them.

## Class ToolAbortController

The ToolAbortController helps you manage how asynchronous tasks are stopped. It’s like having a little helper that lets you signal when something should be canceled mid-process. 

Inside, it uses a standard AbortController – or if that’s not available, it simply won’t do anything.

You can use the `abort` method to actively tell the task to stop, which will notify any parts of the process that are listening for that signal.

## Class SwarmValidationService

The Swarm Validation Service acts as a central authority for ensuring the correctness and consistency of your AI agent swarms. It keeps track of all registered swarms and their configurations, making sure each swarm is unique and properly set up.

Think of it as a quality control system: it verifies agent lists, default agents, and policies associated with each swarm. It works closely with other services to handle swarm registration, agent validation, policy enforcement, and even logging, ensuring everything functions smoothly.

You can use it to register new swarms, retrieve lists of agents and policies for existing swarms, or perform full validations. The service is designed to be efficient, caching validation results to avoid redundant checks and speeding up operations. It’s a key component for maintaining a reliable and well-managed AI agent swarm system.

## Class SwarmSchemaService

This service acts as a central library for defining and managing the blueprints of your AI agent swarms. Think of it as a place to store and organize the configurations that tell your agents how to work together. It ensures these configurations are valid before they're used, checking for things like properly formatted agent names and lists.

You can register new swarm configurations, update existing ones, or simply retrieve them when needed.  This helps in creating consistent and reliable agent behavior across your system. The service also keeps track of how these configurations are being used, providing logging to help with debugging and monitoring.

It works closely with other parts of the system to ensure that your swarms are properly connected and can execute tasks effectively, offering a standardized way to set up and manage your AI agent orchestrations.

## Class SwarmPublicService

This service acts as a public interface for managing the behavior of a swarm of agents. It provides a set of operations – like sending messages, controlling output, retrieving agent details, and disposing of the entire swarm – all while keeping track of which client and swarm these actions relate to. Think of it as a simplified way to interact with the core swarm functionality, ensuring everything is properly logged and scoped to the correct context.

It delegates the actual work to other services (like managing the swarm's connection, logging actions, and handling sessions), providing a consistent way to execute commands and retrieve information about the swarm. For example, it allows you to pause an agent's output, get the name of the currently running agent, or completely shut down the swarm, all within a controlled environment. This helps streamline interactions and provides a clear understanding of what's happening within the agent swarm.


## Class SwarmMetaService

This service helps manage information about your swarm system and transform it into a visual diagram. It gathers data about the swarm, including its default agent, and structures it into a tree-like representation. Then, it converts this structure into a UML diagram, making it easier to understand and debug the system's architecture. The system keeps track of these operations by logging information when enabled, ensuring consistency with other related services. Essentially, it provides a way to create clear, visual documentation of your swarm's components and their relationships.

## Class SwarmConnectionService

This service acts as a central hub for managing connections to and operations within AI agent swarms. It keeps track of swarms, reuses them efficiently, and handles tasks like sending messages, controlling agent navigation, and retrieving output.

Think of it as a manager for your swarm instances—it makes sure you're not creating unnecessary duplicates and provides a consistent way to interact with them. It relies on several other services for things like logging, event handling, and managing agents themselves.

Here's a breakdown of what it does:

*   **Gets Swarms:** It creates or reuses existing swarm instances based on a client ID and swarm name.
*   **Sends Messages:** It allows you to send messages to a session connected to the swarm.
*   **Navigates:** It can step back in the navigation history of an agent within a swarm.
*   **Controls Output:**  It can cancel any pending output from an agent.
*   **Retrieves Output:** It waits to get the output from the currently active agent.
*   **Agent Management:**  It provides methods to get the current agent, its name, and to set a new agent.
*   **Cleanup:** It properly cleans up and releases swarm resources when they are no longer needed.

## Class StorageValidationService

This service helps keep track of and verify the storage configurations used by your AI agents. It acts as a central authority, ensuring each storage is unique, properly set up, and has valid embedding information. 

Think of it as a registry for your storage systems – when you add a new storage, this service registers it and makes sure it's not a duplicate.  When an agent tries to use a storage, this service can double-check that it exists and is configured correctly, making sure everything runs smoothly. 

It's designed to be efficient, so it remembers previous validation checks to avoid unnecessary work. The service works closely with other components, like the storage schema and agent validation services, to keep your entire system healthy and reliable.

## Class StorageUtils

This utility class helps manage how data is stored and accessed for different clients and agents within the swarm. It provides a set of methods for retrieving, updating, deleting, and listing data, ensuring proper authorization and validation before interacting with the underlying storage service.

You can use `take` to get a specific number of matching storage items based on a search query, `upsert` to either add a new item or update an existing one, and `remove` to delete items by their unique ID.  `get` lets you retrieve a single item, while `list` allows you to retrieve multiple items, potentially with a filter applied.

For setup and organization, `createNumericIndex` helps establish a numeric identifier for storage, and `clear` can be used to completely empty a storage area.  Each operation includes checks to confirm the client has permission and that the storage configuration is valid, and all actions are logged for auditing purposes.


## Class StorageSchemaService

This service acts as a central catalog for defining how your agents store and access data. It’s responsible for keeping track of storage configurations, ensuring they're properly set up before agents start using them.

Think of it as a librarian for your storage schemas. It verifies each schema is valid and keeps them organized, making it easy for different parts of the system – like client-specific storage, agent configurations, and public APIs – to find and use them. 

When you create or update a storage schema, this service performs a quick check to make sure it has the necessary components. It also logs these actions for monitoring, but only if logging is enabled. You can register new schemas, update existing ones, or simply retrieve a schema when you need it. This service works closely with other services to manage storage connections, embeddings, and agent schemas, ensuring a consistent and reliable storage experience.

## Class StoragePublicService

The `StoragePublicService` class handles storage operations specifically for individual clients within the swarm system. Think of it as a way to keep each client's data separate and organized. It's like having a personalized storage space for each client.

This service builds upon the underlying `StorageConnectionService` to provide a public API, making sure operations are tracked and scoped correctly. It's used by various components like ClientAgent (for client-specific actions) and PerfService (for monitoring storage usage per client).

Here’s a quick rundown of what you can do with it:

*   **`take`**:  Retrieves a list of storage items based on search criteria and a total count.
*   **`upsert`**:  Adds or updates items in a client's storage space.
*   **`remove`**: Deletes an item from a client’s storage.
*   **`get`**: Retrieves a specific item.
*   **`list`**: Shows all items in a client's storage, with the option to filter them.
*   **`clear`**:  Empties a client’s entire storage.
*   **`dispose`**: Cleans up resources associated with a client’s storage.

Logging is enabled by default if `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` is true, so you’re always aware of what’s happening with the storage. This service is distinct from `SharedStoragePublicService` which manages storage used system-wide, not on a per-client basis.

## Class StorageConnectionService

This class manages how your AI agents store and access data, acting as a central hub for storage operations. Think of it as a smart librarian for your agents' files, keeping track of where everything is and making sure it’s handled correctly.

It efficiently reuses storage connections whenever possible, avoiding unnecessary overhead. If a particular agent needs to store something, this service retrieves or creates a connection, caching it for later use.

It handles both private storage for individual agents and shared storage accessible by multiple agents, delegating the latter to a dedicated shared storage service.

When you need to read, write, or delete data, this class coordinates with other services, like those responsible for schemas, embeddings, and security, to ensure everything works together seamlessly.  It logs these actions for monitoring and also tracks storage usage for validation purposes.  Finally, it handles cleanup when agents are finished, carefully releasing resources and ensuring the system remains stable.

## Class StateValidationService

This service helps ensure the data your AI agents are working with is in the expected format. Think of it as a quality control system for your agent's information. 

You can tell the service what data structures you expect – essentially, you define the "shape" of the information each agent should handle. It keeps track of these expected structures internally.

The `addState` method lets you register a new expected data structure. Then, when an agent delivers data, the `validate` method checks if it conforms to the registered structure, helping to catch errors early and keep your swarm running smoothly. The service also uses a logger to report any issues it finds.

## Class StateUtils

This class helps manage the specific data associated with each client and agent in your swarm. It provides simple ways to fetch existing data, update it, or completely clear it. Before any operation, the system makes sure the client is authorized and the agent is properly registered. When you fetch, set, or clear state, the process is tracked for logging purposes. You can set a new state value directly or provide a function to calculate the updated state based on the previous one.

## Class StateSchemaService

This service acts as a central hub for managing the blueprints of how different agents within the swarm interact with and store data. It keeps track of these blueprints, ensuring they are structurally sound before they're used.

Think of it as a librarian for state configurations – it organizes and verifies them. It works closely with other services involved in connecting to states, configuring agents, and providing public access to state data.

The service validates each blueprint to make sure it's set up correctly and logs its actions for monitoring purposes. It allows you to register new blueprints, update existing ones, and retrieve them when needed, making sure everyone's working with the same, reliable foundation.

## Class StatePublicService

This service manages state specifically tied to individual clients within the swarm system. Think of it as a way to keep track of information unique to each client interacting with the system. It works closely with other components like ClientAgent and PerfService, ensuring client-specific data is handled correctly and tracked for performance.

It offers straightforward methods for setting, clearing, retrieving, and cleaning up this client-specific state. Each operation is carefully wrapped with context scoping and logging (if enabled) for clarity and debugging. This is distinct from system-wide state or persistent storage, as it focuses on the temporary data associated with each client's session. The service relies on injected dependencies for logging and state connection, promoting a modular design.

## Class StateConnectionService

This service manages how different parts of the system keep track of and change data associated with specific clients. Think of it as a central place to handle client-specific data, sometimes delegating to a separate system for data shared across multiple clients.

It's designed to be efficient, reusing data when possible thanks to caching. When you need to get or update data, it uses a system that serializes those actions so they happen safely and in order, even when multiple parts of the system are trying to modify the data at the same time. 

The service also works closely with other parts of the system, like logging, event handling, and validation, to ensure everything operates correctly and securely. When a client's data is no longer needed, this service cleans it up, releasing resources and preparing for new data. Notably, shared data (used by multiple clients) is handled separately and isn't cleaned up by this specific service.

## Class SharedStorageUtils

This class provides tools for managing shared data across your AI agent swarm. Think of it as a central place where agents can store and retrieve information they need to coordinate.

You can use it to fetch data based on a search term and the number of results you want, or to add new data or update existing entries. It also lets you remove specific items, retrieve them by ID, list all items (with optional filters), and even completely clear a storage area. Each operation includes checks to make sure everything's working correctly and to keep track of what's happening.

## Class SharedStoragePublicService

This service handles public interactions with shared storage within the swarm system. Think of it as the main entry point for agents to store, retrieve, and manage data in a shared space. It’s designed to be flexible, used by different parts of the system like client agents, documentation tools, and performance tracking.

It offers common operations like retrieving items based on search criteria, adding or updating items, deleting specific items, getting a single item by its ID, listing all items (with optional filtering), and completely clearing the storage. Each of these actions is carefully logged for monitoring purposes, and it leverages other services within the swarm to ensure proper context and tracking. This service provides a consistent and controlled way to interact with shared storage across the entire system.

## Class SharedStorageConnectionService

This service manages shared storage connections within the swarm system, acting as a central point for data operations. Think of it as a communal whiteboard that all agents can access and modify. It's designed to ensure that all clients are working with the same, single version of the shared storage.

To make things efficient, it caches storage instances, meaning it only creates them once and reuses them for all clients. This caching process utilizes configurations like persistence settings and embedding capabilities.

You can use it to retrieve, add, update, delete, and list data within the shared storage. The `getStorage` method is key - it's how you get access to a specific shared storage area. The `take` method allows you to search and retrieve data, potentially using similarity matching. The `upsert` method adds or updates items. And then there are methods for removing, getting, listing, and clearing the entire storage. Importantly, these methods all rely on the context of the calling method to know which storage to manipulate.

## Class SharedStateUtils

This class helps coordinate and share information between agents in a swarm. Think of it as a central place where agents can store and retrieve common data.

You can use it to get a piece of shared data, like the current task assignment, using the `getState` method.

The `setState` method allows agents to update this shared data—either directly with a new value or by providing a function that calculates the new value based on what's already there.

Finally, the `clearState` method resets a specific piece of shared data back to its starting point. Essentially, it's your toolkit for managing and sharing information within the agent swarm.

## Class SharedStatePublicService

This service acts as a central hub for managing shared data across the entire swarm system. Think of it as a shared whiteboard that different parts of the system can read and update. It handles setting, clearing, and getting this shared data, making sure each operation is tracked and scoped correctly.

The service relies on other components for its work, like a connection service to actually manipulate the data and a logger to keep an eye on things. It's designed to be flexible, allowing different types of data to be shared and is used by key areas of the system to ensure smooth coordination. You can control the level of logging it produces, balancing detailed monitoring with performance.

## Class SharedStateConnectionService

This service manages shared data across different parts of the AI agent swarm. Think of it as a central place where agents can access and update the same information, ensuring everyone's on the same page.

It’s designed to be efficient, reusing existing data whenever possible and making sure updates happen safely and in order. This is achieved through caching and queuing state changes.

The service relies on other components to handle things like logging, sending notifications about state changes, and retrieving configuration information.  It provides simple methods for getting, setting, and clearing this shared data, mimicking how other parts of the system interact with it. It’s built to be consistent with how agents access and manage state within the swarm.

## Class SharedComputeUtils

This toolkit offers utilities for managing and interacting with shared computing resources within your AI agent swarm. You can use it to update the status of a compute resource, letting the system know it's ready or experiencing issues. 

Furthermore, it provides a way to retrieve data associated with a specific compute resource, allowing you to check its configuration or current workload. You'll need a client identifier to fetch this data. The data returned can be of any type, making it flexible for different use cases.

## Class SharedComputePublicService

This component handles interactions with a shared compute resource, acting as a bridge between your AI agents and the underlying computation engine. It's designed to allow agents to request and manage compute tasks.

The `SharedComputePublicService` manages a connection to a compute service and uses a logger for tracking activity. 

You can use it to fetch data associated with a specific compute task (`getComputeData`), trigger computations (`calculate`), and update existing compute tasks (`update`). These functions handle the complexities of communicating with the shared compute infrastructure, simplifying the process for your agents.


## Class SharedComputeConnectionService

This service manages connections to shared computing resources, essentially acting as a central hub for your AI agents to access and utilize them. It handles the complexities of setting up and maintaining these connections, letting your agents focus on their tasks. 

The service relies on several internal components, including logging, message passing, method context management, shared state connection, and compute schema definition, to operate effectively. 

You can retrieve a reference to a specific compute resource using `getComputeRef`, allowing your agents to interact with it. The `getComputeRef` function also remembers previously retrieved computes to avoid unnecessary setup.  `getComputeData` lets you fetch the data associated with a compute. 

The `calculate` function triggers a computation process, while `update` refreshes the connected resources.

## Class SessionValidationService

The `SessionValidationService` keeps track of sessions and how they're being used within your swarm system, ensuring everything works together smoothly. It manages things like which agents, storages, states, and computes are associated with a particular session.

Think of it as a central record-keeper, logging all activity and making sure everything is consistent. It relies on other services like `SessionConnectionService` and `ClientAgent` to do its job, and uses dependency injection to make those connections.

You can add and remove session information – like agents or storages – using methods like `addAgentUsage` and `removeStorageUsage`.  The service provides ways to check if a session exists (`hasSession`), retrieve its mode (`getSessionMode`), and get lists of associated resources.  The `validate` method offers a performance-optimized check for session existence, and the `removeSession` method cleans up everything related to a specific session. Finally, `dispose` provides a way to clear the validation cache for a specific session without completely removing it.

## Class SessionPublicService

This service acts as a public interface for managing interactions within a swarm system's sessions. Think of it as a gatekeeper that handles incoming requests like sending messages, executing commands, and tracking performance.

It takes care of the heavy lifting by delegating tasks to other services like SessionConnectionService for core session operations and leveraging services for logging, performance tracking, and event handling.

When you need to interact with a session—sending a message, running a command, or tracking how it's performing—this service provides a consistent and controlled way to do so, ensuring proper context and logging throughout. It helps streamline communication and coordinate actions across the swarm system.



The service offers methods to:

*   Send messages to a session.
*   Execute commands within a session.
*   Run stateless completion tasks.
*   Connect to a session for real-time communication.
*   Commit different types of messages (tool outputs, system messages, user messages) to the session's history.
*   Manage tool execution flow by committing tool requests and stop commands.
*   Dispose of a session to clean up resources.



Ultimately, this service provides a safe and reliable way to interact with sessions within the swarm, ensuring everything runs smoothly and efficiently.

## Class SessionConnectionService

This service manages connections and interactions within a swarm system, allowing for orchestrated AI agent workflows. Think of it as the central hub that brings together different components like agent execution, policy enforcement, and swarm access, ensuring everything runs smoothly.

It cleverly reuses session data through caching, making operations more efficient. When you need to interact with a specific client and swarm, this service gets or creates a session for you, ensuring consistent and reliable interactions.

You can use it to send messages, trigger executions, run stateless commands, connect to sessions for bidirectional communication, and commit various messages (user messages, tool requests, system messages) to a session's history. Think of it as providing a standardized way to manage the flow of information within your AI agent swarm. Importantly, it ensures operations are logged for debugging purposes, and it’s designed to work seamlessly with other services within the swarm. When you’re done with a session, it cleans up resources to keep things running efficiently.

## Class SchemaUtils

This class offers helpful tools for working with data stored in client sessions and preparing that data for communication. It lets you easily save information to a client's session memory, retrieve that information later, and transform objects into strings that are ready to be sent or stored. Think of it as a central place to manage and format the data your agents are using. You can write values to a client’s session, read what's already there, and format complex data structures into simple strings.

## Class RoundRobin

This component, called RoundRobin, provides a simple way to distribute tasks across a set of creators. Think of it like a rotating schedule – it cycles through a predefined list of creators, ensuring each one gets a turn.

You give it a list of "tokens," which are identifiers for your creators, and a "factory" function that knows how to build an instance for each token. The RoundRobin then handles calling the correct creator for each request.

The `create` method is how you set up a RoundRobin. It takes your list of tokens and the factory function, and returns a new function ready to distribute work. Internally, it keeps track of which creator it’s using, moving to the next one in the list after each call. It also provides some logging to help you monitor its operation.

## Class PolicyValidationService

This service helps ensure that policies used within the swarm are valid and properly registered. It keeps track of all the registered policies and their details, making sure they are unique and exist when needed. 

The service works closely with other parts of the system – like the policy registration service, the enforcement engine, and the agent validation – to coordinate policy management. 

You can add new policies to the system using the `addPolicy` function, and the `validate` function checks if a policy is registered and ready to be used. The service is designed to be efficient, using techniques like memoization to speed up validation checks and relying on dependency injection for flexibility. Logging is also integrated to track policy validation operations.

## Class PolicyUtils

This class helps manage client bans within your AI agent swarm, ensuring consistent and trackable actions. It provides simple functions to ban, unban, and check the ban status of clients, all while verifying inputs and logging activity. Think of it as a toolkit for enforcing client restrictions within a specific swarm and policy setup. Each function handles the necessary validation before communicating with the underlying policy service to execute the request.

## Class PolicySchemaService

This service acts as a central place to manage the rules (policies) that govern how agents operate within the swarm. It keeps track of these rules, ensuring they are valid and accessible. Think of it as a librarian for your agent's instructions, making sure the right rules are in place and easily found.

It validates new rules before adding them, and provides methods to register, update, and retrieve those rules. This service works closely with other parts of the system to enforce these rules, ensuring access control and restrictions are correctly applied. Logging is used to track these operations, and the system uses a specialized registry to efficiently store and retrieve policy information. The service helps keep the swarm operating consistently and securely by maintaining a reliable set of operational guidelines.

## Class PolicyPublicService

This service manages how policies are applied within the swarm system, providing a public interface for things like checking if a client is banned, validating data, and applying bans or unbans. It acts as a middleman, handling requests and interacting with the core policy management system while also keeping track of context and logging activity. Think of it as a controlled gatekeeper, ensuring that client actions adhere to the defined policies. It relies on other services for logging, core policy operations, documentation, and understanding the swarm's overall context. You're able to check if a client is banned, get details about why they're banned, validate data being sent or received, and even directly ban or unban clients, all while ensuring consistency and appropriate logging.

## Class PolicyConnectionService

This service manages how policies are applied and enforced within the swarm system. It acts as a central hub for checking ban statuses, validating input and output, and managing bans for clients within specific swarms.

It reuses previously loaded policy configurations to keep things efficient, and keeps track of events related to policy actions. 

Here's a breakdown of what it does:

*   **Policy Retrieval:** It fetches and caches policy details, ensuring efficient access.
*   **Ban Checks:**  It verifies whether a client is currently banned within a swarm.
*   **Message Retrieval:** Provides the reason, if a client is banned.
*   **Input/Output Validation:** Checks incoming data and outgoing results against the defined policy.
*   **Ban/Unban Management:** Allows banning or unbanning clients from a swarm based on policy rules.

This service interacts with other parts of the system to ensure consistent policy enforcement and provides a unified way to manage policy-related operations.

## Class PipelineValidationService

This service helps ensure your AI agent pipelines are set up correctly before they start running. Think of it as a quality check for your workflows.

You add your pipeline definitions to this service, along with their structures (schemas).  Then, when you’re ready, you can use it to validate a specific pipeline and a source of data to make sure everything aligns as expected. The service uses a logger to keep track of what’s happening during validation, allowing for easy debugging if there are issues. It keeps a record of all pipelines you've added, simplifying the validation process.

## Class PipelineSchemaService

This service helps manage and organize the blueprints for your AI agent workflows, which we call pipeline schemas. Think of it as a central place to store and retrieve these blueprints. 

It uses a schema context service to ensure the blueprints are valid and consistent. 

You can register new blueprints using a unique key, allowing you to easily find them later. If a blueprint with a key already exists, you can update it with new information using the override function. To retrieve a blueprint, simply provide its key. 

The service keeps track of registered blueprints internally, making them readily accessible for your agent orchestration framework.

## Class PersistSwarmUtils

This utility class helps manage how your AI agent swarms remember their state, specifically which agent is currently active and the order in which agents were used. It provides simple ways to get and set this information for each client and swarm, allowing you to track agent activity and navigation history.

You can customize how this information is stored by plugging in different storage mechanisms, such as using an in-memory store or a different persistence backend. This gives you flexibility in where and how you persist data. 

The class keeps track of active agents and navigation stacks separately and uses efficient caching to avoid unnecessary database calls.  Think of it as the memory for your swarm, letting you retrieve and update its current state.

## Class PersistStorageUtils

This class helps manage how data is saved and retrieved for different clients and storage names within the swarm system. It’s designed to efficiently handle persistent storage, ensuring that each storage name uses only one persistence instance. 

You can retrieve existing data, providing a default value if nothing is found, or set new data to be saved for later use. 

The system also lets you customize how data is persistently stored by providing a custom storage constructor, giving you more control over the persistence mechanism.

## Class PersistStateUtils

This class helps manage how information is saved and retrieved for each agent in the swarm. It lets you store data associated with a specific agent and a particular state, like variables or context, and later retrieve it. The system makes sure that each type of state has its own storage, avoiding unnecessary duplication. You can also customize how this data is persisted, allowing for things like storing it in memory or a database instead of the default method. Essentially, this provides a way to remember and restore agent information.

## Class PersistPolicyUtils

This utility class helps manage how policy data, specifically lists of banned clients, are stored and accessed within the swarm system. It offers straightforward ways to retrieve the current list of banned clients for a particular policy and swarm, or to update that list when you need to prevent certain clients from participating. The system remembers which storage method to use, so you don't recreate the persistence layer every time. You can even customize how the data is persisted by providing your own storage implementation, allowing you to use things like in-memory storage or a database.

## Class PersistMemoryUtils

This class helps manage how memory is saved and retrieved for each individual client interacting with the swarm system. It provides simple ways to store data associated with a client’s session and retrieve it later, like remembering a conversation history or temporary context.

The system intelligently creates and reuses memory storage instances for each client, preventing unnecessary resource usage. You can even customize the type of storage used, letting you choose between different persistence methods. When a client's session is finished, you can tell the class to clean up and release the memory it’s using.

## Class PersistEmbeddingUtils

This utility class helps manage how embedding data is saved and retrieved within the swarm system. It allows you to read and write embedding vectors, and importantly, you can customize how this persistence works using adapters. 

The system remembers previously computed embeddings, so it doesn’t have to recalculate them every time—this is done through a caching mechanism.  You can also plug in your own persistence logic, letting you store embeddings in different ways, like using an in-memory store or a database.  The system makes sure that each embedding type uses only one persistence instance, helping to conserve resources.


## Class PersistAliveUtils

This utility class helps keep track of which clients are online and offline within your swarm system. It’s designed to manage this information persistently, so you know a client’s status even after restarts or interruptions. 

The class uses a clever system to ensure that each client has only one persistent storage instance, which helps save resources. You can mark clients as online or offline using simple methods, and then easily check their status later.

For more complex scenarios, you can even customize how the alive status is stored by providing your own persistence adapter, giving you flexibility in how you manage this vital information.

## Class PerfService

The `PerfService` is responsible for tracking and logging how well your AI agent system is performing. It gathers data like how long each process takes, how much data is being sent, and the overall state of the system. It’s like a detailed performance monitor for your AI agents.

It relies on several other services to collect this data - things like validation and public services – and it will log information when debugging is enabled.  The service helps you understand if your system is running smoothly, identify bottlenecks, and ultimately optimize its performance.

Essentially, it takes snapshots of the system's activity and organizes them into reports so you can analyze how everything is working. You can start and stop tracking individual sessions to gather data, and then compile all the data into a consolidated view of the system’s overall health. When a session ends, the service cleans up the data it’s collected to free up memory.

## Class OperatorInstance

This class represents a single instance of an operator within an AI agent swarm, essentially a connection point for interacting with a specific agent. Each operator instance is identified by a client ID and a descriptive agent name, allowing you to track which agent you're communicating with. 

You can connect to receive answers from the agent using `connectAnswer`, send notifications with `notify`, and provide answers back to the system with `answer`.  Messages can be received via `recieveMessage`, and when you're finished, `dispose` gracefully shuts down the connection to the agent. Think of this class as a bridge between your application and a particular AI agent in the swarm.

## Class NavigationValidationService

This service helps the swarm manage how agents move around, making sure they don't waste time revisiting the same places. It keeps track of which agents have already been visited for each client and swarm, preventing unnecessary navigation. 

The core function, `getNavigationRoute`, remembers these routes so they’re available for later use and improve efficiency.  `shouldNavigate` decides whether an agent should move to a new location based on whether it’s already been visited, ensuring a streamlined navigation process.

If you need to start fresh with tracking routes for a specific client and swarm, you can use `beginMonit`.  And when you're done, `dispose` cleans up the route information to free up resources. It also works hand-in-hand with a logger service, which makes it easier to understand what's happening during navigation.

## Class NavigationSchemaService

This service helps keep track of the different tools your AI agents use to navigate and interact with their environment. It maintains a list of recognized tool names, allowing you to easily check if a specific tool is supported. When you add a new tool, the service records this action; similarly, checking for a tool’s existence also generates a log entry under certain conditions. Essentially, it's a simple way to manage and verify the tools your agents are using.

## Class MemorySchemaService

This service acts as a simple, temporary storage area for data specific to each session within the swarm. Think of it as a scratchpad where information related to a single session can be held. It’s designed to be lightweight and doesn't store any data permanently or enforce any particular structure.

You can use it to write, read, and delete data associated with a specific session, and it integrates with other services to provide consistent logging and support different system components like agents and public session interfaces. Essentially, it’s a way to keep track of things needed during a session's lifetime without relying on persistent storage. When a session ends, the data held here is automatically cleared.

## Class MCPValidationService

This service helps you keep track of and ensure the quality of your Model Context Protocols, or MCPs. Think of MCPs as blueprints for how different AI agents communicate. 

It acts as a central hub where you register your MCP schemas, essentially giving each one a name and storing its details. 

The service provides a simple way to add new MCP schemas to this registry and verify that they exist and are properly defined. It uses a logger to help you monitor what's happening behind the scenes.

## Class MCPUtils

This class helps manage updates to the tools used by clients connected through the Multi-Client Protocol (MCP). Think of it as a way to distribute new versions of tools to everyone, or just to a particular client if needed. The `update` method is your main tool for doing this – you can specify which MCP to update and whether to apply the update to all clients or just one.

## Class MCPSchemaService

This service helps manage the blueprints, or schemas, that define how AI agents communicate and share information – we call these Model Context Protocols (MCPs). It’s like a central library where you can add new MCP definitions, update existing ones, and easily find the schema you need. 

You can think of it as having a librarian (the `loggerService`) for keeping track of what’s happening and a manager (`schemaContextService`) for handling the overall context of these schemas. Internally, it uses a registry (`_registry`) to store everything. 

There are tools to quickly check if a new schema has the basic structure it needs (`validateShallow`), and functions for adding new schemas (`register`), updating existing ones (`override`), and getting a specific schema by name (`get`).

## Class MCPPublicService

This class provides a way to interact with Model Context Protocol (MCP) operations, allowing you to manage and use tools within a defined environment. Think of it as the main interface for working with MCP tools.

It lets you find out what tools are available, check if a particular tool exists, and actually run those tools with specific input. You can update tool lists for all clients or just for individual ones. This class relies on other services for logging and handling the underlying MCP communication. The `dispose` method is available to clean up resources when you're finished.

## Class MCPConnectionService

This class handles communication and management of Model Context Protocol (MCP) connections. Think of it as the central hub for your AI agents to interact with tools and resources.

It keeps track of available tools for each agent and provides a way to call those tools with specific instructions. The class efficiently reuses MCP connections to avoid unnecessary overhead.

It manages connections and information about tools, and lets you check if a tool exists and call it with appropriate data. You can also refresh the list of available tools, either for a specific agent or for all of them. When an agent is finished, this class cleans up the resources it was using.

## Class LoggerService

The LoggerService helps manage and record events within the system, providing different levels of detail – normal, debug, and informational – for various components. It works by sending logs to both a general system logger and a client-specific logger, ensuring you have a record of what's happening.

You can configure which types of messages are logged (debug, informational) through system settings. The service intelligently adds context to these messages, like the client involved and the specific function being executed, making it easier to track down issues or understand system behavior.

The service is designed to be flexible; you can even swap out the common logger at runtime, which is helpful for things like testing or more complex setups where you might want to direct logs to different locations. It works closely with other parts of the system like ClientAgent, PerfService, and DocService to provide consistent logging across the board.

## Class LoggerInstance

This component helps manage logging specifically for each client within your system. It lets you customize how logs are handled – you can decide whether logs appear in the console and define functions to be executed when certain logging events occur, like initialization or disposal.

Each logger instance is tied to a unique client identifier, making it easy to track logs associated with a particular client. There's a convenient `waitForInit` method to ensure everything is set up correctly at the start.

You can use `log`, `debug`, `info` to send messages, which can be displayed in the console if configured and also trigger custom callbacks. Finally, `dispose` provides a clean way to shut down the logger and run any cleanup code you're using.

## Class HistoryPublicService

This class manages how history information is accessed and handled within the agent swarm system, offering a public interface for interacting with that history. It works closely with other services like logging, connection management, and agent/performance tracking.

Essentially, it provides ways to add messages to an agent's history, retrieve them, convert the history into arrays, and clear the history completely. Each action is carefully controlled and logged when logging is enabled, maintaining consistency with other agent services. It offers a structured approach to managing an agent's historical record, ensuring clean and traceable operations.

## Class HistoryPersistInstance

This component is responsible for keeping track of a conversation’s history, saving it both in the program's memory and on disk. Each instance manages the history for a specific client.

When it starts up, it initializes the history, retrieving any previously saved data.  You can then add new messages to the history using the `push` method, which also handles saving the update.  The `pop` method lets you retrieve and remove the most recent message.

If you need to process the history, the `iterate` method allows you to go through the messages, potentially applying filters and custom instructions.  Finally, `dispose` lets you clear the history, either for a specific client or completely. The framework uses a special memoization to ensure initialization happens only once per agent.

## Class HistoryMemoryInstance

This component acts as a temporary storage for conversation history within an AI agent. It keeps track of messages but doesn't save them permanently – once the agent is done, the history disappears.

You can identify each history with a unique client ID.  It also allows you to add custom functions to be called when messages are added, removed, or the history is cleared.

To get started, you initialize it for a specific agent and can then add new messages. You can also go through the messages in order, and remove the last one if needed.  When the agent is finished, you can tell the component to clean up its memory. A special initialization process ensures everything is set up correctly for each agent.

## Class HistoryConnectionService

This service manages the history of interactions with your AI agents, keeping track of messages and actions. Think of it as a central record for each agent's activity. It's designed to be efficient, reusing history data whenever possible thanks to caching.

When you need to access or create a history for a specific client and agent, the `getHistory` method handles it, retrieving from a cache if it already exists or creating a new one. The `push` method adds new messages to an agent's history, and `pop` retrieves the last message.

You can also convert the history into formatted arrays using `toArrayForAgent` (for agent use) or `toArrayForRaw` (for simple access). Finally, `dispose` cleans up resources and removes the history from the cache when it's no longer needed. The system logs its actions and tracks usage to ensure everything runs smoothly.

## Class ExecutionValidationService

This service helps manage and validate the execution of AI agents within a swarm. It keeps track of how many times an agent is being executed, preventing runaway processes or excessive nesting.

You can retrieve the current execution count for a client and swarm, increment the count as agents run, or reset the count when they finish. If things get out of hand, you can clear the execution tracking entirely for a specific client and swarm, or even completely remove the record of that execution count. This helps ensure stability and control within your AI agent system.

## Class EmbeddingValidationService

This service acts as a guardian for your embedding names within the system, making sure they’re unique and properly registered. It keeps track of all the embeddings you’re using and checks their validity when needed.

When a new embedding is created, this service registers it, keeping a record of its details. 

Whenever you need to confirm an embedding's existence – for instance, when a user is performing a similarity search – this service quickly validates it, and uses caching to make those checks super efficient. It also keeps a log of what's happening so you can keep an eye on things.

## Class EmbeddingSchemaService

This service acts as a central place to manage the blueprints for how embeddings—numerical representations of data—are created and compared within the system. It keeps track of these blueprints, ensuring they are valid and consistently used.

Think of it like a library of instructions for turning data into something that can be easily searched and compared. When a new instruction is added or an existing one is updated, this service handles it, making sure everything remains organized and functional.

It works closely with other services that handle storage, client interactions, and agent definitions, ensuring that embedding logic is available and reliable wherever it's needed.  The system verifies these embedding "recipes" before they’re used, helping to prevent errors during data storage and retrieval. You can add new blueprints, update existing ones, and retrieve them as needed.

## Class DocService

This class is responsible for automatically generating documentation for the entire system, including swarms, agents, and their performance data. Think of it as a documentation engine that helps developers understand the inner workings of the agent swarm.

It retrieves information from various other services – like schema services, validation services, and performance services – to create detailed Markdown files.  It produces visual diagrams (UML) to make the agent schemas easier to grasp.  It also creates JSON files to record system and client performance metrics, giving insights into how the system is operating.

The documentation process is managed efficiently by using a thread pool to handle concurrent tasks and organized output into a well-defined directory structure. The logging system allows for better tracking of the creation and writing process. The class incorporates client agent documentation by detailing its schema and performance, making it a central piece in developer onboarding and system maintenance.


## Class ComputeValidationService

This service helps manage and validate the configurations used by your AI agent swarm. It acts as a central hub for defining and checking how different computation tasks are set up.

Think of it as a librarian for your agent swarm's blueprints. You can add new computation tasks (like adding a new book to the library) using `addCompute`, and then view a list of all defined tasks with `getComputeList`.  The core function, `validate`, ensures that each task is properly configured according to its defined structure, ensuring everything runs smoothly. The service relies on other components for logging, state validation, and schema management.

## Class ComputeUtils

This section describes the `ComputeUtils` class, which provides helpful tools for managing and interacting with computational resources within the AI agent swarm. Think of it as a central place to check on and update the status of individual compute tasks.

The `update` function allows you to mark a specific compute task as having been completed or updated, identifying it by a client ID and a compute name.

The `getComputeData` function lets you retrieve information about a particular compute task, giving you a way to check its progress or status. It’s flexible because it can return data in whatever format is appropriate for your application.


## Class ComputeSchemaService

The ComputeSchemaService helps manage and organize different schema definitions used by your AI agent swarm. It acts as a central registry where you can store, update, and retrieve these schemas. Think of it like a well-organized library for your schema blueprints.

It uses a schema context service to handle all things related to schemas, making it easier to validate and manage them. You can register new schema definitions using a unique key, and if a schema already exists, you can override parts of it with new information. 

The service keeps track of these schemas internally and provides methods to easily access them when needed, ensuring consistency across your agents.

## Class ComputePublicService

This class, `ComputePublicService`, acts as a central point for interacting with computational resources within the agent swarm. It handles requests for data and actions related to specific computations, using a logging service to track activity and relying on a lower-level connection service to actually manage those resources. 

Think of it as a translator—you tell it *what* computation you need, providing a name, a client identifier, and the compute name, and it handles the details of getting the data or triggering an action. 

The `getComputeData` method fetches information, `calculate` initiates a calculation, `update` modifies something, and `dispose` releases resources associated with a specific computation. Each method identifies the task using a method name, a client identifier, and the compute name, ensuring the correct operation is performed.

## Class ComputeConnectionService

This class, `ComputeConnectionService`, is the central hub for managing and coordinating how different AI agents (or "compute units") interact within the swarm. It handles the connections and data flow between agents, ensuring they can work together effectively.

Think of it as a traffic controller for your AI agents. It uses several internal services – like a logger for tracking activity, a bus for communication, and services for managing data schemas and validation – to keep everything running smoothly.

The `getComputeRef` function is a key feature, allowing you to easily retrieve a reference to a specific AI agent by its name and the client using it.  `getComputeData` pulls data from the system. The `calculate` and `update` methods trigger specific operations, while `dispose` cleans up resources when you’re finished.

## Class CompletionValidationService

This service helps keep track of all the valid names used for completions within the AI agent swarm. It's responsible for making sure that completion names are unique and that they're properly registered before they're used.

The service maintains a list of accepted completion names and provides a way to register new ones.  Whenever a name is used, this service checks if it’s on the approved list, making sure everything's consistent.

It works closely with other parts of the system, like the completion registration service and agent validation, to ensure seamless operation. Logging is included for tracking and troubleshooting, and it’s designed to be efficient by remembering previous validation results.

## Class CompletionSchemaService

The CompletionSchemaService acts as a central place to manage the logic that agents use to complete tasks. It's like a library of pre-defined actions, each with a unique name.

This service keeps track of these actions, making sure they’re valid and accessible to different parts of the swarm system. It checks each action when it's added, and makes sure the name and the code that defines the action are correct.

When an agent needs to perform a specific task, it looks up the corresponding action in this service and executes it. Different services, like those responsible for creating and running agents, rely on this service to ensure that agents have the right tools to work with.

You can register new actions, replace existing ones, and retrieve them when needed. The service also keeps a log of these operations, which can be helpful for debugging. It integrates closely with other services to ensure consistency and reliability across the entire swarm.

## Class ClientSwarm

This class, `ClientSwarm`, is the central manager for a group of AI agents working together. Think of it as the conductor of an AI orchestra. It keeps track of which agent is currently active, manages how agents are switched between, and handles the flow of information – specifically, the output from those agents.

It keeps a record of which agents are available and where they are in a sequence of actions (a "navigation stack"). When an agent produces output, it’s broadcast to any listeners. It also provides ways to cancel operations and update the available agents.

Here's a breakdown of what it does:

*   **Manages Active Agent:** It knows which agent is currently performing a task and can switch between them.
*   **Handles Output:** It collects output from agents and sends it to those who need it.  You can also cancel this output.
*   **Keeps a History:** It tracks the sequence of agents used, allowing you to go back and repeat steps.
*   **Updates in Real-Time:** Notifications are sent whenever an agent is changed or output is available.
*   **Clean Up:** It can gracefully shut down, ensuring resources are released when no longer needed.



Essentially, `ClientSwarm` orchestrates the interactions and flow of data within a group of AI agents, making it easy to manage and monitor their combined efforts.

## Class ClientStorage

This class handles storing and retrieving data within the swarm system, making it easy to manage information and search for similar items. Think of it as a central repository for your agent’s data.

It allows you to add, update, and remove data, and importantly, it uses embeddings – a special representation of your data – to find items that are similar to each other.  This makes searching for related information much faster and more effective.

The class keeps track of all the data in a map for quick access. All changes to the data, like adding, removing, or updating, are handled in a controlled, sequential order to prevent conflicts.

You can search for items using a search term, and it will return the most similar matches.  It also provides a way to list all the data, optionally filtering it based on specific criteria. When an item is fetched or modified, the system notifies other parts of the swarm to keep everyone in sync. Finally, it includes a cleanup process to ensure everything is properly shut down when the storage is no longer needed.

## Class ClientState

The ClientState class manages a single piece of data within a larger system of AI agents. Think of it as a container for information, equipped to handle changes and ensure those changes are handled safely and reliably.

It's designed to work closely with other parts of the system, like the services that create and connect to state, the agents that use that state to make decisions, and the communication channels that broadcast changes.

You can think of it as having a few key functions: getting the current data, updating the data, and ensuring that those updates happen in a controlled way. It handles things like tracking changes, applying extra processing steps (middleware), and informing other parts of the system when something changes. Finally, when it’s no longer needed, it cleans up after itself to release resources properly.

## Class ClientSession

The `ClientSession` is essentially the central manager for a client's interaction with the AI agent swarm. It handles everything from sending messages to the agents, validating those messages, and keeping track of the conversation history. Think of it as a dedicated workspace for a client engaging with the swarm.

When a client sends a message, the `ClientSession` first checks if the message is valid. If it's good, it sends it to the appropriate agent within the swarm for processing. You can also use it to send notifications, like quick updates, without full processing.

For more complex interactions, the `ClientSession` lets you run commands, commit tool outputs, and even flush the entire history to reset the session. It seamlessly integrates with other parts of the system to manage connections, agent interactions, and event logging, making sure everything runs smoothly and securely. Finally, it provides a way to connect the session to a message connector to enable real-time communication. When you’re finished with a session, the `dispose` method cleans everything up.

## Class ClientPolicy

This class manages rules and restrictions for clients interacting with the swarm. It handles things like banning clients, checking incoming and outgoing messages to ensure they meet certain criteria, and responding to policy changes.

The system uses a list of banned clients that is loaded only when needed, which improves performance. You can customize how bans are enforced, including providing your own messages when a client is banned.

It works closely with other parts of the system to provide consistent enforcement of rules, controlling access and ensuring security.  If a client’s messages don’t meet the defined policies, the system can automatically ban them, and events are triggered to inform other parts of the swarm.  The ability to ban and unban clients is supported, and changes can be persisted if a way to store these lists is provided.

## Class ClientOperator

This class, the ClientOperator, acts as a central point for interacting with and managing an AI agent. It’s designed to handle the flow of information to and from the agent, allowing you to send instructions, receive responses, and coordinate actions. 

Think of it as the conductor of an AI agent orchestra. You use it to tell the agent what to do (like sending user messages), receive its replies, and manage the overall process. 

Many of the methods, like committing tool outputs or system messages, are currently marked as "not supported," indicating that they are reserved for future functionality. The core methods allow for sending user input, waiting for agent responses, and properly closing the connection.

## Class ClientMCP

This component acts as a bridge between your application and the system responsible for managing AI agent tools. It lets you easily discover what tools are available to a specific client, check if a particular tool exists, and then actually run those tools. The system remembers which tools it has already fetched, making repeated requests faster. 

You can ask it for a complete list of tools for a client or just check if a certain tool is present.  When tools change, you can force the system to refresh its knowledge of available tools, either for a single client or for all clients. 

To actually use a tool, you provide its name and the necessary input data, and the component handles the communication and returns the result.  Finally, you can tell the component to release resources associated with a client when they are no longer needed.

## Class ClientHistory

This class manages an agent's conversation history, acting like a logbook for all interactions. It keeps track of messages, allowing them to be retrieved, filtered, and presented in a way that's specific to the agent's needs.

The history can be updated by adding new messages, or by retrieving and removing the most recent one. You can get the entire history as a raw list, or request a filtered version prepared for the agent, which might involve removing irrelevant information or adding context from system prompts.

When the agent is finished, this class handles cleaning up the history and releasing any resources that were used. It works closely with other parts of the system to ensure messages are handled correctly and efficiently.

## Class ClientCompute

This component, called `ClientCompute`, is responsible for managing and interacting with a specific compute unit within your agent swarm. Think of it as a dedicated controller for one part of your larger AI system. 

It’s initialized with configuration parameters that define its role and how it connects to the swarm. 

You’ll find methods to retrieve data (`getComputeData`), perform calculations (`calculate`), refresh its state (`update`), and gracefully shut down the component (`dispose`) when it’s no longer needed.  These methods allow you to monitor, control, and maintain the individual compute units that make up your AI agent swarm. It’s designed to be easily integrated and managed as part of a larger orchestration system.

## Class ClientAgent

This class, `ClientAgent`, is the core of a client-side AI agent, orchestrating how it receives instructions, uses tools, and shares results with the larger system. It handles incoming messages, figures out what tools to use (if any), and manages the entire process – making sure things don't overlap.

Think of it as a conductor for an AI agent, managing the flow of information and actions.  It keeps track of errors, changes to the agent itself, and communicates these events to other parts of the system.

Here's a breakdown of what it does:

*   **Receives Instructions:** It takes text prompts and figures out if those prompts require the agent to use tools.
*   **Tool Management:**  It retrieves, resolves and manages tool usage, making sure there are no duplicates, and handles stopping tool calls when needed.
*   **Error Recovery:** If something goes wrong (like the AI model fails), it tries to recover, and may try again or provide a placeholder result.
*   **Communication:**  It sends updates to the broader system,  including new messages, tool usage, and agent changes.
*   **Cleanup:** It has a "dispose" function that cleans everything up when the agent is no longer needed.

The `ClientAgent` is designed to be adaptable and reusable within a larger AI agent orchestration framework.

## Class ChatUtils

This class helps manage and control chat sessions for different clients, acting as a central hub for communication within your AI agent swarm. It handles creating, sending messages to, and cleaning up chat instances. 

You can think of it as a factory and manager for individual chat sessions, allowing you to start a new chat, send messages through it, and then properly shut it down when finished. It lets you configure how chat instances are created and how events are handled. 

The `beginChat` method is used to initiate a new chat session, while `sendMessage` allows you to transmit messages to a specific client.  `dispose` gracefully ends a chat session, freeing up resources. The `listenDispose` method enables you to listen for events that signal when a chat session is ready to be discarded. Finally, you can customize how chat instances are created and how events are handled through `useChatAdapter` and `useChatCallbacks`.

## Class ChatInstance

This class manages a single chat session within a larger AI agent swarm. It represents a connection to a specific agent and allows you to send messages and receive responses. 

Each chat instance is identified by a client ID and associated with a swarm name. When you’re finished with a chat, it’s important to dispose of the instance to free up resources.

You can start a chat using `beginChat`, send messages with `sendMessage`, and listen for dispose events with `listenDispose`.  The `checkLastActivity` method ensures the chat remains active within a defined timeframe.

## Class BusService

The `BusService` acts as a central hub for event-driven communication within the AI agent swarm. Think of it as a messenger service that allows different parts of the system to notify each other about important happenings. It manages subscriptions – who cares about what – and emissions – what's being announced.

It allows different agents to "subscribe" to specific events, ensuring they only receive notifications they're interested in. These subscriptions can even be set up as "wildcards," meaning they're open to all events of a certain type. The service also allows for one-time subscriptions using the `once` function.

When something noteworthy happens (like an execution starting or ending), the `emit` function broadcasts it to all the relevant subscribers. The system validates that the sender is authorized before sending the message, ensuring security and proper access control. 

The `commitExecutionBegin` and `commitExecutionEnd` functions are shortcuts for emitting specific execution-related events.

Finally, when a client’s work is complete, the `dispose` function cleans up all the subscriptions associated with that client, preventing unnecessary resource consumption. The whole system logs its operations for debugging and monitoring.

## Class AliveService

This class helps keep track of which clients are actively participating in your AI agent swarms. It allows you to easily signal when a client becomes online or offline, ensuring the system knows who's available. When a client joins or leaves a swarm, you can use the `markOnline` or `markOffline` methods to update their status. The system remembers these statuses, saving them for later, so you always have an accurate picture of client availability. It also keeps a record of these actions through logging.

## Class AgentValidationService

This service acts as a central point for verifying and managing agents within the system. It keeps track of each agent's configuration details, including associated tools, wikies, storages, states, and dependencies on other agents.

When a new agent is added, this service registers it and updates its internal records. You can then query this service to retrieve lists of agents, their associated resources (like storage and states), or to check if an agent depends on another. 

Validation is a core function; you can request validation of a specific agent, which thoroughly checks its configuration and associated resources. This validation process utilizes other specialized services for things like tool and storage validation, ensuring a comprehensive check.  The service also uses memoization to speed up common checks, improving performance.

## Class AgentSchemaService

The AgentSchemaService acts as a central place to define and manage the blueprints for your AI agents within the swarm. It’s responsible for storing and retrieving these blueprints, which detail an agent's capabilities, dependencies, and resources. Think of it as a library of agent templates that other services can use.

Before an agent can be created or updated, its blueprint is checked for basic correctness to ensure it’s structurally sound. Registration of new agent blueprints and retrieval of existing ones are also logged to keep track of changes. This service is crucial for ensuring agents behave consistently and work together effectively within the swarm environment, providing a shared understanding of each agent's role. It integrates closely with other services involved in agent creation, connection, and overall swarm management.

## Class AgentPublicService

This service provides a public interface for interacting with agents within the swarm system, acting as a middleman between your code and the core agent operations. Think of it as a simplified way to tell agents what to do and track their actions.

It handles common tasks like creating agent references, executing commands, running quick tasks, and logging everything for better visibility. It leverages other services for things like logging, performance tracking, and documentation.

Here's a breakdown of what it offers:

*   **Agent Creation:** It can create references to agents, setting up the context for their use.
*   **Execution:** It provides methods to run commands on agents with different modes and track their execution.
*   **Quick Tasks:** It allows for quick, stateless actions on agents.
*   **Output Handling:** It waits for and retrieves the output from agent operations.
*   **Message Management:**  It lets you add different types of messages (tool outputs, system prompts, user input) to the agent’s history. This is useful for building conversational flows and keeping a record of interactions.
*   **Cleanup:** It includes methods for flushing agent history and disposing of agents to free up resources.
*   **Control Flow:** It offers commands to stop tool executions or cancel ongoing output, giving you finer control over the agent’s actions.

Essentially, this service simplifies agent interaction, provides consistent logging, and helps maintain a clear history of actions within the swarm.

## Class AgentMetaService

This service helps manage and visualize information about your AI agents within the swarm. Think of it as a way to create a detailed map of how each agent relates to others and what it does. 

It builds these maps from the agent's definition, and then converts them into a standard format (UML) that's easy to understand and can be used to create diagrams. The system can generate either a full, detailed map or a simpler view focusing on dependencies.

The process includes logging of operations for debugging and creating documentation. The service relies on other parts of the system – like services for handling agent definitions and logging – and generates output that can be used by documentation tools to create visual representations of your agent architecture.


## Class AgentConnectionService

This service manages the lifecycle and operations of AI agents within a swarm system. Think of it as a central hub for creating, running, and tracking agents, ensuring efficient reuse and consistent behavior.

It intelligently caches agent instances to avoid unnecessary creation, pulls in configuration data (like prompts and tools) from various schema services, and works closely with other services to handle logging, event emissions, and usage tracking.

Here's a breakdown of what it does:

*   **Agent Creation & Reuse:**  It creates or retrieves pre-existing AI agents, using a smart caching mechanism to avoid redundant setup.
*   **Execution & Output:** It handles running commands, generating responses, and waiting for output from those agents.
*   **History & State Management:**  It keeps track of agent interactions (user messages, tool calls, system updates), handles storage of agent-specific data, and manages the overall agent state.
*   **Controlled Operations:**  It offers ways to cancel or pause agent workflows, clear histories, and signal changes to the agent's behavior.
*   **Integration:** It plays nicely with other components within the system, ensuring smooth communication and coordinated behavior.



Essentially, it's the backbone for reliably deploying and interacting with your AI agents.

## Class AdapterUtils

This class offers helpful tools to easily connect your AI agent swarm to different chat completion services. It provides pre-built functions for interacting with popular platforms like Grok, Cohere, OpenAI, LMStudio, and Ollama. 

You can use these functions to translate specific requests into the format each platform expects, allowing your agents to seamlessly communicate with them. Each function takes the API client for the respective service, and optional parameters like the model name and response format, to tailor the interaction. This simplifies the process of integrating various AI models into your orchestration framework.

# agent-swarm-kit interfaces

## Interface TAbortSignal

This interface lets you signal when an operation needs to be stopped, similar to how you might cancel a file download. It builds on the standard web `AbortSignal` functionality, providing a way to manage and communicate cancellation requests for tasks running in your AI agent swarm. Think of it as a clear way to tell an agent, "Hey, stop what you're doing!" and ensure that message is properly handled. You can even add your own special information to this signal if your specific application needs it.

## Interface IWikiSchema

This interface, `IWikiSchema`, defines the structure for representing a wiki within our agent swarm orchestration framework. Think of it as a blueprint for how a wiki is organized and how agents interact with it. 

Each wiki will have a name (`wikiName`) to easily identify it and a descriptive explanation (`docDescription`) to clarify its purpose.  You can also provide optional callback functions (`callbacks`) to customize how agents handle certain wiki operations. 

The `getChat` method provides a way for agents to retrieve chat responses based on provided arguments, allowing them to leverage the wiki's content in their interactions.

## Interface IWikiCallbacks

This interface defines a set of optional functions you can use to receive updates about chat interactions within the system. Specifically, the `onChat` function will be called whenever a chat action takes place, giving you a chance to react to or monitor these events. You can think of it as a way to "listen in" on the conversations happening within the AI agents.

## Interface ITriageNavigationParams

This interface defines the settings you provide to guide how an AI agent navigates and utilizes different tools. It lets you specify the name you want to give to a particular tool, a clear explanation of what that tool does, and even a helpful note to include in its documentation. Think of it as defining a new, specialized helper for your AI agents to use.

## Interface IToolRequest

This interface describes what’s needed to ask the system to run a specific tool. Think of it as a way for agents to say, "Hey, I need to use the 'search' tool and here's the query: 'example'." 

It has two main parts: the `toolName`, which tells the system exactly *which* tool to use, and `params`, which are the details the tool needs to do its job. The system checks that the parameters you provide make sense for the tool you’re using.

## Interface IToolCall

This interface describes a request to use a specific tool within the agent swarm. Think of it as a detailed instruction for an agent to run a particular function, including what inputs it needs. Each tool call has a unique ID to keep track of it, a type that's currently always "function," and information about which function to run and what arguments to provide. The swarm uses these calls to translate the model’s requests into actionable steps.

## Interface ITool

This interface describes a tool that an AI agent can use – think of it as defining a specific function or capability the agent has access to. 

It specifies the tool's type, which is currently just "function," and provides detailed information about that function, including its name, what it does, and exactly what inputs it expects. 

This information helps the AI model understand which tools are available and how to properly call them. The structure is used to generate tool requests and ensure the right inputs are passed when the tool is actually used.

## Interface ISwarmSessionCallbacks

This interface lets you listen in on what’s happening within a swarm of AI agents. You can use these callbacks to track when agents join the swarm, when they start working on tasks, and when they share information. It’s a way to get notified about important events like a new agent connecting, a task starting, a message being sent, or a session ending. You can also be notified when a session first begins or finishes its setup.

## Interface ISwarmSchema

This interface defines the blueprint for how a swarm of AI agents is set up and managed. It lets you configure things like whether the swarm's progress and current agent are saved, add a description for better understanding, and establish rules for agent access. You can also specify a default agent to use when one isn't already selected, and provide functions to customize how the swarm's navigation history and active agent are handled, like loading or saving them.  Finally, it allows you to list the agents that are part of the swarm and provides a way to add custom event listeners to the swarm’s lifecycle.

## Interface ISwarmParams

This interface defines the essential setup information needed to get a swarm of AI agents working. Think of it as the blueprint for creating a swarm – it outlines what you need to provide.

You'll need to specify a unique identifier for the client initiating the swarm, a logger to track what's happening and catch any problems, and a communication channel (the "bus") for agents to talk to each other.  Finally, you provide a list of the agents themselves, associating each with a name so the swarm can easily access them during operation.

## Interface ISwarmDI

This interface acts as the central hub for all the services that power the AI agent swarm. Think of it as the toolbox containing everything the system needs to function, from managing documentation and events to tracking performance and ensuring agent connectivity. It provides access to services for handling everything from logging and context management to defining agent schemas and validating data, essentially providing a single point of access for all critical components. It's the foundation upon which the entire swarm orchestration framework is built.

## Interface ISwarmConnectionService

This interface lays out the public-facing methods for connecting and managing agents within a swarm. Think of it as a blueprint defining how other parts of the system will interact with the swarm connection service. It's designed to be a simplified version of the full connection service, focusing only on what’s meant to be used externally, keeping the internal workings separate. By using this interface, we ensure a consistent and predictable way to work with the swarm's connections.

## Interface ISwarmCallbacks

This interface lets you listen for important events happening within your AI agent swarm. Specifically, you'll be notified whenever an agent starts working on a new task or transitions between different actions. The `onAgentChanged` function gets called with details about which agent is now active, its assigned name, and the overall swarm it belongs to. This allows your application to keep track of what agents are doing and update its display or internal state accordingly.

## Interface ISwarm

This interface lets you interact with a group of AI agents working together. You can use it to manage which agent is currently active, retrieve their names and details, and get the results of their work. 

The `navigationPop` method helps you step back through the sequence of agents used, and `cancelOutput` lets you stop an ongoing task. `waitForOutput` is how you get the final result from the active agent. You can also use `emit` to send messages within the session. Finally, you can register agents to be used within the swarm using `setAgentRef` and switch between them with `setAgentName`.

## Interface IStorageSchema

This interface describes how your agent swarm manages and stores data. It lets you configure things like whether data is saved permanently, how it’s accessed, and how it's indexed for searching.

You can optionally provide descriptions for documentation, or mark storage as shared across all agents for a particular client.  

The `getData` and `setData` functions allow you to completely customize how data is read from and written to storage, bypassing the default methods. The `embedding` property determines which indexing method is used.

The `createIndex` function is crucial for generating search indexes for your data, allowing agents to find what they need quickly. You can also provide default data for new storage instances using the `getDefaultData` function. Finally, the `callbacks` property allows you to add custom actions during storage events.

## Interface IStorageParams

This interface defines how your application interacts with the storage system managing AI agent data. It provides settings like a unique client identifier and the name of the storage being used. You're also given functions to create, retrieve, and cache embedding vectors – these are numerical representations of text used for searching and matching. The interface also includes tools for logging activity and communicating with other parts of the AI agent swarm.

## Interface IStorageData

This interface describes the basic information that's saved within the system. Every piece of data stored will have a unique identifier, called `id`, which is essential for finding and deleting that specific data later on. Think of it like a serial number for each item.

## Interface IStorageConnectionService

This interface helps define how different parts of the system connect to storage. Think of it as a blueprint that ensures the publicly accessible storage connection service focuses only on what users need to know, hiding the internal workings. It's used to create a clear and consistent way for various components to interact with storage, keeping the public-facing parts clean and predictable.

## Interface IStorageCallbacks

This interface lets you listen in on what's happening with your data storage. You can get notified whenever data is changed, searched for, initially set up, or completely cleaned up. These notifications, delivered as callbacks, allow you to track changes, synchronize data elsewhere, or perform any necessary setup or cleanup routines around your storage. Essentially, it's a way to stay informed about and react to events within your data storage system.

## Interface IStorage

This interface gives you the tools to manage data within the system. You can fetch data using a search term and specify how many results you want, leveraging similarity searching. It lets you add new data or update existing data, ensuring it's properly indexed. You can also delete specific items by their unique identifier and retrieve them individually. The interface allows listing all available data, optionally narrowing the results based on certain criteria, and even completely emptying the storage if needed.

## Interface IStateSchema

This interface describes how a piece of information, or "state," is managed within a group of AI agents working together. Think of it as a blueprint for each state.

You can tell the system whether the state needs to be saved permanently. You can also add a description to help understand what the state represents.

A state can be designed to be shared between different agents, or kept private to a single agent. Each state must have a unique name for easy identification.

The system needs a way to get the initial value of a state, and this interface lets you define how that happens. You can also customize how the current state is retrieved, providing a way to fetch it from somewhere other than the default.

Similarly, you can define how the state is updated or changed. You can also add extra functions that run during important state events, like when the state is created or changed. Finally, you can define extra steps that run around state changes.

## Interface IStateParams

This interface, `IStateParams`, helps manage how different parts of your AI agent swarm work together. Think of it as a set of instructions for each agent’s internal workings. It includes things like a unique identifier (`clientId`) to tell agents apart, a `logger` for keeping track of what's happening and spotting problems, and a `bus` to allow agents to communicate and share information with each other within the swarm. It's designed to add extra details needed for each agent to function correctly within the larger system.

## Interface IStateMiddleware

This interface lets you hook into the agent swarm's state changes – think of it as a place to intercept and adjust the data as it's being used. You can use it to make sure the state is always in a consistent format, or to add extra information to it before it’s passed along. It's a way to customize how the system handles and manages its data.

## Interface IStateConnectionService

This interface helps ensure that the public-facing parts of your AI agent swarm orchestration system are clearly defined and consistent. It acts as a blueprint for how different parts of the system interact, specifically focusing on managing the state connections. Think of it as a way to guarantee that only the intended functionalities are exposed, keeping the internal workings hidden and preventing unexpected behavior. It’s all about making the system predictable and reliable for anyone using it.

## Interface IStateChangeContract

This interface defines a contract for how different parts of the agent swarm orchestration framework communicate about changes in state. Specifically, it provides a way to signal when a component's state has been updated. The `stateChanged` property is the core of this, offering a stream of strings representing the updated state – think of it as a notification system for what's happening within the swarm.  You can use this to react to changes and coordinate actions across different agents.

## Interface IStateCallbacks

This interface lets you listen in on important moments in a state's life cycle. You can use it to run code when a state is first created (`onInit`), when it's cleaned up (`onDispose`), or when it’s loaded from somewhere (`onLoad`).

You also have the ability to monitor what’s happening with your state by being notified whenever it's read from storage (`onRead`) or updated (`onWrite`). This makes it easy to keep track of changes or perform actions based on those changes.

## Interface IState

This interface lets you manage the current status of your AI agents – think of it as keeping track of what's happening. You can easily check the current state using `getState` to see the latest information. 

When you need to change something, `setState` lets you update the state based on what it already is, allowing for smooth transitions and avoiding lost data. And if you need a fresh start, `clearState` resets everything back to the initial settings defined for your system.

## Interface ISharedStorageConnectionService

This interface outlines how different parts of the system connect to shared storage. Think of it as a blueprint for securely accessing and interacting with a central repository of data. It's designed to be a clear definition of what's publicly accessible, hiding the internal workings of the storage connection to keep things organized and secure. By defining this interface, we make sure different components can reliably communicate and share data without exposing unnecessary details.

## Interface ISharedStateConnectionService

This interface helps define how different parts of the agent swarm can share information safely. It’s a blueprint for a service that manages that shared state, ensuring only the necessary parts are exposed publicly. Think of it as a way to keep the internal workings of the shared state system hidden while still allowing agents to communicate and coordinate.

## Interface ISharedComputeConnectionService

This service manages the connections to the underlying compute resources your AI agents need to operate. Think of it as the bridge between your agents and the processing power they use—whether that's cloud servers, local machines, or something else entirely. It handles establishing, maintaining, and gracefully disconnecting from these resources, so you don't have to worry about the technical details. You're able to specify connection parameters and the service will take care of ensuring agents can reliably access the compute they require.



The service provides methods for creating new connections, listing existing connections, and checking the status of active connections. It's designed to be flexible, allowing you to define how agents connect to and utilize the available compute.

## Interface ISessionSchema

This interface, `ISessionSchema`, is like a reserved space for future session settings. Think of it as a blueprint for how we might store information related to individual sessions in the system. Right now, it doesn't contain any specific properties, but it's here to allow us to add those details as the framework evolves and we need to manage session-specific configurations. It's a placeholder for now, guaranteeing a defined structure for session data later on.

## Interface ISessionParams

This interface outlines all the information needed to start a new session within your AI agent swarm. Think of it as the blueprint for creating a session - it includes things like a unique identifier for the client using the session, a way to log activity, rules to follow, a communication channel within the swarm, and references to the swarm itself. It essentially bundles together all the essential components for the session to function correctly and be properly managed within the larger system. The session name provides context for identifying which swarm the session belongs to.

## Interface ISessionContext

This interface bundles together essential details about a client's active session within the swarm system. Think of it as a container holding information about who's using the system (the `clientId`), the specific process they're involved in (`processId`), and any context related to the method they're currently executing (`methodContext`).  It also includes details about the overall execution environment (`executionContext`), providing a complete picture of the session’s state. This information is returned when you need to understand the specifics of a particular session.

## Interface ISessionConnectionService

This interface helps define how different parts of the system connect and communicate with each other, particularly when working with AI agents. It's a blueprint for creating reliable connections between agents and services, making sure that the public-facing parts of the system are clearly defined and work predictably. Think of it as a way to ensure that everyone using the system understands exactly how to establish and maintain those crucial agent connections.

## Interface ISessionConfig

This interface defines how to set up sessions that run on a schedule or are managed to prevent overuse. 

You can specify a `delay` property, which represents the time in milliseconds to wait between session executions. 

Additionally, you can provide an `onDispose` function, which will be called when the session ends, allowing you to perform cleanup or finalization tasks.

## Interface ISession

The `ISession` interface provides the core functionality for managing interactions within an AI agent swarm. It lets you send messages, trigger actions, and control the flow of conversation.

You can use methods like `commitUserMessage` and `commitAssistantMessage` to add messages to the chat history, and `commitSystemMessage` to inject system-level instructions. `emit` is a straightforward way to send a message to the session's communication channel.

For more complex operations, `execute` runs commands, potentially updating the session's history, while `run` performs stateless calculations. `connect` sets up a two-way communication link, and `commitToolOutput` and `commitToolRequest` handle tool interactions.  `commitFlush` completely resets the session’s history, and `commitStopTools` pauses the agent's tool execution. `notify` sends internal notifications.

## Interface IScopeOptions

This interface, `IScopeOptions`, helps you set up the environment for your AI agent swarm. Think of it as a configuration object. You provide a unique `clientId` to identify your application, and a `swarmName` to group agents working together.  You can also specify an `onError` function that gets called if anything goes wrong during the swarm’s operation, allowing you to handle errors gracefully.

## Interface ISchemaContext

This interface, `ISchemaContext`, acts as a central repository for all the schema definitions your AI agent swarm uses. Think of it as a toolbox containing blueprints for different types of agents and the tasks they can perform.

Specifically, it holds registries—collections—for various schema services, like agent schemas, completion schemas, and wiki schemas. Each registry holds structured data describing the capabilities and expected behaviors of the agents and tools within your system. This centralized structure helps ensure consistency and makes it easier to manage and reuse schema definitions across your entire AI agent orchestration framework.

## Interface IPolicySchema

This interface describes how you configure a policy to control and manage client interactions within your AI agent swarm. It lets you define rules and actions, like banning clients, and how those rules are applied.

You can choose to save banned client lists for persistence, add descriptions for clarity, and give each policy a unique name. You have the flexibility to customize the messages displayed when a client is banned, or even create dynamic ban messages based on the client and policy.

The interface also allows you to retrieve or manually set lists of banned clients, define custom validation rules for incoming and outgoing messages, and specify callback functions for specific policy events to tailor the validation and ban processes.

## Interface IPolicyParams

This interface defines the information needed to set up a policy within the AI agent swarm. Think of it as a blueprint—it specifies what a policy needs to function correctly.

It includes a logger, which allows the policy to record what it’s doing and any problems it encounters. 

It also needs access to a communication bus, essentially a messenger service, to talk to other agents and components within the swarm. 


## Interface IPolicyConnectionService

This interface helps us define how different parts of the system interact with each other when managing policies. Think of it as a blueprint that outlines the essential functions available for handling policies, but without including any internal workings or private details. It's designed to make sure the public-facing parts of the policy management system are clear and consistent.

## Interface IPolicyCallbacks

This interface provides a way to connect your own code to a policy's lifecycle. You can use callbacks to respond to events like when a policy is first set up, when incoming or outgoing messages are being checked for validity, or when a client is banned or unbanned. These callbacks give you the chance to log activity, perform custom actions, or integrate with other systems as the policy operates. You only need to provide the callbacks that are relevant to your specific needs; the others are optional.

## Interface IPolicy

This interface defines how policies are enforced within the AI agent swarm. It's responsible for managing client bans and ensuring messages exchanged between agents meet specific criteria. 

You can use it to check if a client is currently banned, retrieve the reason for a ban, and validate both incoming and outgoing messages to confirm they align with defined rules. 

The interface also provides methods to ban or unban clients, allowing you to control which agents are allowed to participate in the swarm. Essentially, it's the gatekeeper for controlled interaction within the agent system.

## Interface IPipelineSchema

This interface describes the blueprint for how your AI agents will work together. Think of it as defining a specific workflow—a "pipeline"—where different agents pass information to each other to accomplish a larger task. 

Each pipeline gets a name to easily identify it. 

The core of the pipeline is the `execute` function; this is what actually runs the sequence of agents, taking a client identifier, the agent's name, and some data (the `payload`) as input. It then handles the process and can return a result or simply complete the task. 

Finally, you can define optional callback functions to be notified at different stages of the pipeline’s execution—allowing you to track progress and handle events as they happen.

## Interface IPipelineCallbacks

This interface lets you hook into the lifecycle of a pipeline running within the agent swarm. Think of it as a way to be notified about what’s happening. You’re provided with callbacks for when a pipeline starts, finishes (successfully or with an error), and when an error occurs during execution. Each callback gives you details like the client that initiated the pipeline, the pipeline's name, any data passed along, and if it's an error, the error itself. This enables you to build custom monitoring, logging, or even automated reaction systems based on pipeline events.

## Interface IPersistSwarmControl

This framework lets you tailor how your AI agent swarm's data is saved and loaded. Specifically, you can swap out the default methods for managing the active agents within the swarm and the navigation stacks they use.

Think of it as being able to plug in your own custom ways to store and retrieve this information, whether it's saving it in a database, a file, or even just keeping it in memory for testing. 

The `usePersistActiveAgentAdapter` function handles the storage of active agents, while `usePersistNavigationStackAdapter` manages the navigation stacks. You provide a custom "adapter" to take over these persistence tasks.

## Interface IPersistStorageData

This interface describes how data is saved and loaded for the AI agent swarm. Think of it as a container holding a list of information – like key-value pairs or database records – that needs to be stored. The `data` property within this structure simply represents that list of data you want to keep around for later use. It's the core piece of information used when saving and retrieving data for the swarm.

## Interface IPersistStorageControl

This interface lets you swap out the standard way data is saved and loaded for a specific storage area. Think of it as replacing the default data storage mechanism with your own custom solution. This is useful when you need to store data in a particular database or use a specialized storage format instead of the system’s default approach. You provide a blueprint (a constructor) for your custom storage adapter, and the system takes over using that for the designated storage area.

## Interface IPersistStateData

This interface helps manage and save important information about your AI agents. Think of it as a container for holding data – like how an agent is configured or details about an ongoing session – that needs to be preserved. It’s designed to work with a utility that handles actually saving and retrieving this data, so you don’t have to worry about the storage details. Essentially, it provides a standard way to package up the data you want to save so it can be reliably stored and later retrieved.

## Interface IPersistStateControl

This interface lets you take over how agent swarm states are saved and loaded. Essentially, it provides a way to plug in your own system for managing the data associated with agent states, instead of relying on the framework's default approach. You can use it to store state information in a database, a custom file format, or any other storage mechanism you prefer. This offers flexibility for integrating the framework with existing infrastructure or implementing unique persistence strategies.

## Interface IPersistPolicyData

This interface helps the system remember which clients are currently blocked within a specific swarm. Think of it as a list of "bad actors" for a particular group of AI agents. It keeps track of session IDs, which act like unique identifiers for each client. This information is essential for maintaining order and security within the agent swarm.

## Interface IPersistPolicyControl

This interface lets you tailor how policy information is saved and retrieved for your AI agent swarms. Think of it as a way to swap out the standard storage mechanism with your own custom solution. You can use it to connect to a database, store data in memory, or use any other persistence method you prefer, allowing you to control exactly where and how swarm policies are managed. By providing your own persistence adapter, you gain fine-grained control over policy storage and retrieval for each swarm.

## Interface IPersistNavigationStackData

This interface helps keep track of where you're navigating within your agent swarm. It essentially stores a list of agent names, acting like a history log of the agents you’ve been interacting with. Think of it as a breadcrumb trail, allowing you to easily go back to previously used agents. The `agentStack` property holds this list of agent identifiers, enabling a navigation stack persistence functionality.

## Interface IPersistMemoryData

This interface describes how memory information is stored for the agent swarm. Think of it as a container holding whatever data needs to be saved, like the context of a conversation or temporary calculations. It’s a simple structure with a `data` property that holds the actual information – whatever type of data is being preserved. The `PersistMemoryUtils` tool uses this structure to handle the storage process.

## Interface IPersistMemoryControl

This interface gives you a way to customize how memory is saved and loaded for each agent session. Essentially, it lets you plug in your own system for handling the storage of data associated with a specific session identifier. If you need to use a non-standard storage mechanism, like an in-memory store for testing or a specialized database, this is how you’d do it. It allows you to replace the default memory persistence behavior with your own tailored solution.

## Interface IPersistEmbeddingData

This interface describes how embedding data is stored within the AI agent swarm. It essentially holds a numerical representation (the `embeddings`) of a specific string, allowing the system to remember and compare different pieces of information. Think of it as a way to give a unique, mathematical fingerprint to each piece of text the swarm works with. The `embeddings` property contains the actual numerical values that make up that fingerprint.

## Interface IPersistEmbeddingControl

This interface lets you customize how embedding data is saved and retrieved. If the default saving method isn’t quite what you need, you can plug in your own persistence adapter. This adapter handles the specifics of storing and loading embedding information associated with a given embedding name, allowing for tailored behavior like keeping track of embeddings in memory instead of a database. Essentially, it gives you control over where and how embedding data is stored.

## Interface IPersistBase

This interface lays the foundation for how the swarm system saves and retrieves information. It provides basic functions for managing files on your computer that store things like agent configurations, their memory, and whether they are still active. 

The `waitForInit` function sets up the storage location initially, creating it if it doesn’t exist and cleaning up any potentially damaged files.  `readValue` lets you pull specific pieces of data back from storage using a unique identifier.  Before attempting to read, you can use `hasValue` to quickly check if a piece of data actually exists without loading the entire file. Finally, `writeValue` is used to save data – it carefully writes information to files in a way that makes sure the data remains consistent and reliable.

## Interface IPersistAliveData

This interface helps the system keep track of whether each client connected to the swarm is currently active. It's a simple way to mark a client as online or offline within a specific swarm. The core of this interface is a single property, `online`, which is a true/false value representing the client's connection status.

## Interface IPersistAliveControl

This interface lets you plug in your own way of keeping track of whether an AI agent swarm is still running. Instead of relying on the framework's default method, you can provide a custom solution, like storing the alive status in a database or even just in memory. This is useful when you need very specific control over how that status is saved and retrieved for a particular swarm. You provide a blueprint for your custom adapter, and the framework takes care of using it to manage the swarm’s alive status.

## Interface IPersistActiveAgentData

This interface describes how we keep track of which agent is currently running for each client and swarm. Think of it as a little record that tells us, "Client X is using agent 'agent1' in swarm Y." The `agentName` field simply holds the name of that active agent, like "agent1" or "task-assigner." This information helps the system know which agent is responsible for handling requests or tasks.

## Interface IPerformanceRecord

This interface helps track how well a particular process is running within the system. It gathers performance data from multiple clients, like individual agent sessions, so you can monitor overall efficiency. You’re essentially getting a snapshot of a process's activity, including how many times it ran, how long it took, and when it happened.

The `processId` uniquely identifies the specific task being tracked. Inside, you're given a list of individual client performance records (`clients`) along with totals for execution count and response time.  You're also provided with calculated averages and very precise timestamps—both as days since the epoch and seconds since midnight—along with a standard date/time string. This combination allows for detailed analysis of process behavior over time.

## Interface IPayloadContext

This interface, `IPayloadContext`, acts like a container for information needed when a task is being executed. Think of it as a package that includes both the raw data (`payload`) and details about who requested it (`clientId`). The `clientId` lets you track which client triggered the process, and the `payload` holds the actual data being worked on, tailored to the specific type of task. It's a way to bundle relevant information together for streamlined processing.

## Interface IOutgoingMessage

This interface describes a message that the system sends back to a client, like an agent responding to a request or providing an update. Think of it as the system's way of communicating results or notifications. 

Each outgoing message has three key pieces of information: a `clientId` that identifies which client should receive the message, `data` which is the actual content of the message, and an `agentName` to specify which agent generated the response. This ensures that the right client gets the right information from the right agent.

## Interface IOperatorSchema

This interface defines the structure for how different components within the AI agent swarm orchestration framework connect and communicate. Specifically, `connectOperator` establishes a connection between a client and a particular agent, allowing messages to be sent and responses to be received. It essentially sets up a channel for interaction, giving you a way to pass information back and forth between clients and the agents performing the work. The `DisposeFn$2` part ensures that these connections can be cleanly shut down when they're no longer needed.

## Interface IOperatorParams

This interface defines the required information that each agent within the swarm receives to function correctly. Think of it as a starter pack for every agent. 

Each agent needs to know its assigned name (`agentName`) and a unique identifier for the client it's serving (`clientId`). 

Crucially, it also receives logging capabilities (`logger`) to report its actions and status, a messaging bus (`bus`) to communicate with other agents, and access to a history component (`history`) to track its past interactions and decisions. This allows each agent to operate effectively within the larger swarm.

## Interface IOperatorInstanceCallbacks

This interface defines the events you can listen for when working with individual agents within your AI agent swarm. Think of it as a way to get notified about what each agent is doing – when it starts up, provides an answer, receives a message, is shut down, or sends a notification. You can use these callbacks to monitor the progress of each agent, react to their actions, or gather data for analysis. Each callback provides information like the client ID and agent name so you know precisely which agent triggered the event.

## Interface IOperatorInstance

This interface defines how you interact with a single agent within a larger swarm. Think of it as a way to communicate with one agent at a time. 

You can use `init` to get the agent ready to work. To share information, use `answer` to send a response or `notify` for less formal updates. If you need to receive data from the agent, `recieveMessage` is your tool. 

When you're done, `dispose` gracefully shuts down the connection with that specific agent, cleaning up resources. Finally, `connectAnswer` lets you register a function that will be called whenever the agent sends back an answer.

## Interface IOperatorControl

This interface provides a way to configure how operators within the AI agent swarm behave. You can use it to tell the system which functions should be called when specific events happen within an operator, allowing you to react to and influence their actions. It also lets you swap in your own specialized classes to handle the core logic of individual operators, giving you fine-grained control over their functionality and customization options. Think of it as the lever you pull to adjust the personality and behavior of each operator in your swarm.

## Interface INavigateToTriageParams

This interface lets you customize how an agent navigates to a triage agent. It's a way to fine-tune the process with specific messages or actions triggered at different stages.

You can define what happens *before* the navigation begins with `beforeNavigate`, allowing you to perform checks or set up initial conditions. 

`lastMessage` lets you adjust the message passed along when the navigation is about to happen. 

`flushMessage` allows you to provide a default message or a function to generate a message that’s sent when a flush operation is needed. Similarly, `executeMessage` customizes the message when an execution step is required.

For tool interactions, `toolOutputAccept` defines the message sent when a tool's output is accepted, while `toolOutputReject` handles situations where the tool's output is rejected. Each of these can be a simple text string or a function that generates the message dynamically based on the context.

## Interface INavigateToAgentParams

This interface helps you customize how your AI agent swarm navigates and interacts when moving between agents. It lets you inject specific actions or messages at different stages of the navigation process. 

You can use `beforeNavigate` to run code right before the navigation begins, potentially preparing the environment. `flushMessage` lets you define a message to send when the navigation is flushed, while `toolOutput` allows you to shape the output from tools used during navigation. `lastMessage` provides a way to modify the user's last message before it's used. Finally, `emitMessage` and `executeMessage` give you control over the messages sent during those steps. Each of these properties can be a simple string, or a function that allows for more dynamic message generation based on context.

## Interface IModelMessage

This interface defines the structure for messages exchanged within the agent swarm system. Think of it as the standard format for communication between agents, tools, users, and the core system.

Each message has a `role` indicating who or what sent it – whether it’s a direct response from the model (`assistant`), a system notification (`system`), output from a tool (`tool`), user input (`user`), or something related to error recovery (`resque` or `flush`).  The `agentName` tells you which agent is responsible for the message. The `content` is the actual text or data being transmitted.

The `mode` property clarifies whether the message originated from a user or a tool, influencing how it’s processed.  If a model is requesting tool execution, `tool_calls` holds the details of those calls.  `images` allows for including images.  `tool_call_id` links a tool’s response back to the original tool call request, and `payload` allows you to attach extra contextual data.



Essentially, this structure ensures everyone speaks the same language when coordinating across the agent swarm.

## Interface IMethodContext

This interface, `IMethodContext`, provides a standard way to track details about each method call within the AI agent swarm. Think of it as a little package of information attached to every action taken. It includes identifiers for the client, the method itself, and the various resources involved, such as the agent, swarm, storage, state, compute, policy, and MCP. Different services across the system, like those responsible for performance monitoring, logging, and documentation, use this context to keep track of what's happening and provide useful information.

## Interface IMetaNode

This interface describes a building block for visualizing how agents and resources connect within your system. Think of it as a way to map out relationships—an agent might depend on another, or use a specific resource. Each node has a `name`, which clearly identifies what it represents, like an agent’s name or a resource’s label.  It can also have `child` nodes, which allow you to build a hierarchical structure, showing how things connect and depend on each other in a nested fashion. These nodes are used to create diagrams that explain your agents' connections and their features.

## Interface IMakeDisposeParams

This interface defines the settings you can provide when automatically disposing of an AI agent swarm. You can specify a `timeoutSeconds` value, which dictates how long the system will wait for the swarm to complete its tasks before automatically shutting it down. Additionally, you can provide an `onDestroy` function, which will be called when the swarm is disposed, giving you a chance to perform cleanup actions, like logging or notifying other systems, using the client ID and swarm name.

## Interface IMakeConnectionConfig

This interface defines how to control the timing of messages sent between agents in your AI agent swarm. It allows you to introduce delays, which is useful for managing the flow of information and preventing overwhelming individual agents. The `delay` property specifies a numerical value representing the delay, measured in milliseconds, that should be applied before sending a message. Essentially, it's your way of pacing the communication within the swarm.

## Interface IMCPToolCallDto

This interface defines the information shared when a tool is called as part of an AI agent swarm. It holds details like which tool is being used (identified by its `toolId`), who's making the request (`clientId` and `agentName`), and the data needed for the tool to work (`params`).  You’ll also find a list of any related tool calls, a signal to potentially stop the process mid-way, and a flag indicating whether this is the final call in a series of actions. It’s the standard way to package tool call requests and responses within the orchestration framework.

## Interface IMCPTool

This interface describes what a tool looks like within the AI agent swarm orchestration framework. Every tool needs a name, which is how it’s identified. It can also have a description to explain what the tool does. Most importantly, a tool must have an input schema - this tells the system what kind of information the tool expects to receive to work properly. The input schema dictates the expected data types and required fields.

## Interface IMCPSchema

This interface describes the blueprint for a Managed Control Plane (MCP), which is a core component of the agent swarm orchestration system. Think of it as defining what an MCP *is* – its name, a helpful description for documentation, and most importantly, how it interacts with the system. 

It specifies how the MCP provides a list of available tools for each client, and how to actually *use* those tools by sending them requests with specific data. 

Finally, it allows for optional callbacks, which let the MCP react to certain events within the system, allowing for greater flexibility and control.

## Interface IMCPParams

This interface defines the settings needed to run a Master Control Program (MCP) within our agent swarm orchestration system. Think of it as a configuration object that tells the MCP how to log its actions and how to communicate with other parts of the system. It requires a logger to record important events and a bus for sending messages and reacting to happenings across the swarm. These components are essential for the MCP to function effectively and contribute to the overall intelligence of the agent network.

## Interface IMCPConnectionService

This interface defines how different parts of the system communicate using a Message Channel Protocol (MCP). Think of it as the foundation for sending and receiving messages between agents and the orchestration engine. It provides methods to establish connections, send data, and handle disconnections, ensuring reliable communication within the agent swarm. If you're building components that need to talk to each other in the system, you're going to interact with this interface. It’s designed to be a flexible and standardized way for agents to exchange information.

## Interface IMCPCallbacks

This interface defines the functions your application can use to receive notifications about what’s happening with the agent swarm orchestration system. Think of these functions as event listeners; they’re called when specific actions occur.

You’ll get a notification when the system starts up (`onInit`), when a client’s resources are cleaned up (`onDispose`), and when tools are being prepared for a client (`onFetch`). 

`onList` tells you when tools are being listed for a client. `onCall` is triggered whenever a tool gets executed, providing details about the tool used and the data involved. Finally, `onUpdate` lets you know when the available tools for a particular client are changed.

## Interface IMCP

The Model Context Protocol (MCP) interface lets you manage the tools available to your AI agents. You can use it to see which tools are currently offered to a specific agent, check if a particular tool is accessible, and actually execute a tool with the right input. The system also provides ways to refresh the list of available tools, either globally or for individual agents, ensuring your agents always have the most current options.

## Interface ILoggerInstanceCallbacks

This interface provides a way to connect to a logger and be notified about important events in its lifecycle. You can use it to be alerted when a logger starts up, shuts down, or when it records different types of log messages like debug, info, or general logs. Essentially, it allows you to customize how a logger behaves and integrate it more closely with your application's needs. The callbacks provided let you react to initialization, disposal, and various log levels being emitted.

## Interface ILoggerInstance

This interface defines how logger instances should behave, allowing for specific setup and cleanup routines. Think of it as a way to ensure each logging component is properly initialized when it starts and gracefully shut down when it's done. The `waitForInit` method handles the initial setup, potentially with asynchronous operations, and guarantees that initialization happens only once. Similarly, `dispose` is responsible for releasing any resources held by the logger and performing a final cleanup action.

## Interface ILoggerControl

This interface provides controls for how your logging works within the AI agent swarm. It lets you customize the logging behavior across different clients and centralize your logging operations.

You can use it to set up a standard logging adapter for the entire swarm, configure lifecycle callbacks for logger instances, or even replace the default logger with your own custom implementation.

Specific methods allow you to log messages – including info, debug, and general messages – targeted to a particular client, ensuring that logging is contextualized and traceable. These methods handle session validation and track where the log message originated from.

## Interface ILoggerAdapter

This interface lets your application connect to different logging systems, like sending messages to a file, a database, or a cloud service. It provides a standard way to record events and messages for each client using the framework, ensuring that logging happens correctly and consistently. You can use methods like `log`, `debug`, and `info` to send different types of messages, and `dispose` to clean up resources when a client is no longer needed. Essentially, it's a flexible way to handle logging without being tied to a specific logging technology.

## Interface ILogger

This interface defines how different parts of the AI agent swarm system can record information. It provides a standard way to track what's happening – from agents running to sessions connecting and data being stored.

You can use it to write general messages about important events. 
There’s also a way to log very detailed debugging information, primarily useful when you're trying to figure out what's going on behind the scenes. 
Finally, you can record informational updates about successful actions and validations, giving you a clear picture of how things are progressing.

## Interface IIncomingMessage

This interface describes a message coming into the AI agent swarm. Think of it as a structured way to pass information from the outside world – maybe a user’s request or data from another system – into the agents that are working together.

Each message has a client identifier, which helps track where it originated.  It also carries the actual data, which is the content of the message itself. Finally, the message specifies which agent is responsible for handling it. This helps ensure the message gets to the right place within the swarm.

## Interface IHistorySchema

This interface outlines how your AI agent swarm keeps track of past conversations and interactions. Think of it as the blueprint for the system's memory. 

It focuses on a key component called `items`, which is the adapter that actually handles saving and loading those messages – whether that's to a database, a file, or somewhere else. This adapter determines how the history is stored and accessed.

## Interface IHistoryParams

This interface defines the information needed to set up and manage a history record for an AI agent within the system. Think of it as a blueprint for how each agent's interactions and decisions are tracked. It includes things like the agent's name, a limit on how many past messages are stored to keep the history manageable, a client identifier, and tools for logging and communicating within the overall AI agent network. Essentially, it's all the details that allow the system to keep a record of what each agent is doing and why.

## Interface IHistoryInstanceCallbacks

This interface lets you hook into the lifecycle of an agent's conversation history. You can customize how the history is retrieved initially, filter which messages are included, and react to changes like adding or removing messages. 

You're given opportunities to be notified when a new message is added, when the last one is removed, and when the history is read or processed. There are also callbacks for when the entire history is loaded, when the object is disposed, and when a reference to the history object itself is available. Essentially, it provides a way to observe and influence the history management process for each agent.

## Interface IHistoryInstance

This interface describes how to work with a history of messages for each agent in your AI agent swarm. Think of it as a way to keep track of what each agent has said and done.

You can use the `iterate` method to look through all the messages for a specific agent, letting you examine their past interactions.

The `waitForInit` method helps get the history ready for an agent, potentially loading any existing data.

To add a new message from an agent, use the `push` method.

If you need to remove the last message an agent sent, the `pop` method will retrieve and delete it.

Finally, when you’re done with an agent's history, the `dispose` method lets you clean it up and free up resources.

## Interface IHistoryControl

This interface lets you fine-tune how your AI agents remember and track their interactions. You can tell the system what events to log and when, essentially customizing the "memory" of your agents.

Specifically, `useHistoryCallbacks` allows you to define functions that trigger at different points in the agent’s history, like when a new interaction is recorded or when the history is cleared.

Also, `useHistoryAdapter` gives you the power to completely replace the default way history instances are created, allowing for advanced customizations if needed.

## Interface IHistoryConnectionService

This interface provides a way to work with the history of interactions within the AI agent swarm. It's designed to give you access to past events and data, but specifically focuses on the parts meant for external use. Think of it as a clean, typed view of how to access and manage that history, leaving out the internal workings. It helps ensure that the public-facing history service behaves consistently and safely.

## Interface IHistoryAdapter

This interface provides a way to manage and retrieve a history of interactions between an AI agent and a client. Think of it as a logbook for those conversations.

You can add new messages to the log using the `push` method, and retrieve the most recent message using `pop`.  The `iterate` method lets you go through the entire history one message at a time. Finally, `dispose` allows you to clear the history for a specific client and agent when it's no longer needed.

## Interface IHistory

This interface helps you keep track of all the interactions your AI agents have had. Think of it as a memory log for each agent or a record of how the system is being used.

You can add new messages to this history using the `push` method, and remove the most recent one with `pop`.

Need to build a prompt for a specific agent? The `toArrayForAgent` method lets you transform the history into a sequence of messages that are ready to be sent to that agent, potentially adjusting them based on a given prompt. If you just want a complete list of all messages, `toArrayForRaw` provides that as well.

## Interface IGlobalConfig

This file defines global settings and behaviors for the AI agent swarm system. Think of it as the central control panel for how the system works, influencing things like tool usage, logging, and how agents handle errors.

You can customize many aspects of the system by changing these settings. For instance, you can control what happens when a tool call fails (flush the conversation, retry, or use a custom solution), adjust the amount of logging, or change how the system handles navigation within a swarm.

Here's a breakdown of what these settings control:

*   **Error Handling:** How the system responds to problems with tool calls. You can choose to reset the conversation, retry the tool call, or define your own custom behavior.
*   **Logging:** Controls the verbosity of logging messages, allowing you to debug and monitor the system.
*   **History Management:** Limits the number of messages stored in the history for each agent.
*   **Tool Usage:** Sets limits on the number of tools an agent can use in a single run.
*   **Navigation:** Manages how agents switch between different tasks or contexts.
*   **Output Cleaning:** Removes unwanted XML tags from agent responses.
*   **Persistence:** Controls how data is stored and retrieved, including embeddings and operator connections.
*   **Validation:** Ensures the correctness of agent outputs.
*   **Security:** Defines rules for banning clients and controlling access.



Many settings use "default" functions, which can be replaced to completely customize the system's behavior in specific areas. Think of these defaults as starting points that you can tailor to your needs.

## Interface IFactoryParams

This interface helps you customize how your AI agents communicate and respond during interactions. It allows you to define specific messages or functions that will be used when the agent needs to clear its memory, process tool outputs, send messages, or execute commands. 

You can tailor the system's behavior by providing custom messages to be sent in various situations, like when the agent is flushing data or sending output from a tool. It also gives you the flexibility to incorporate the user’s last message into these customized responses, making the interaction feel more natural and context-aware. The `flushMessage`, `toolOutput`, `emitMessage`, and `executeMessage` properties let you control these interactions with ease.

## Interface IFactoryParams$1

This interface lets you customize how your AI agents communicate during navigation. Think of it as a way to personalize the messages they send when they need to clear their memory, start a task, or handle the results of using a tool. 

You can provide simple text messages for these situations, or you can use functions that allow for more dynamic and context-aware messaging, incorporating information like the client ID and the currently active agent. This allows for a really flexible way to control the agent's interaction flow.

## Interface IExecutionContext

This interface provides a common way to track what’s happening during an execution within the agent swarm. Think of it as a little package of information that travels between different parts of the system – like the client connecting, the performance monitoring, and the message passing. 

It includes a unique identifier for the client session, a specific execution, and the overall process running the swarm. This helps ensure everything stays coordinated and allows for detailed tracking and monitoring of each operation.

## Interface IEntity

This interface acts as the foundation for everything the system remembers and tracks. Think of it as the common blueprint that all persistent objects – like agent data or system state – inherit from. Different kinds of data will build upon this base to add their own unique information.

## Interface IEmbeddingSchema

This interface lets you customize how your AI agent swarm understands and compares information. It defines how embeddings, which are numerical representations of text, are created, stored, and used.

You can choose whether to save the agent's memory and state, and give your embeddings a unique name for organization. There are functions to save computed embeddings so they don't have to be recalculated, and to retrieve those cached embeddings later. 

You also have the flexibility to add your own custom functions to handle embedding-related events. Finally, it provides the core functions for generating embeddings from text and for comparing the similarity between different pieces of information.

## Interface IEmbeddingCallbacks

This interface lets you tap into what's happening when embeddings are generated and compared. You can use it to track the embedding creation process, perhaps to log the text being embedded or analyze the resulting embeddings. Similarly, you can monitor how embeddings are compared to see how similar texts are judged, allowing for detailed analysis of the comparison results. These callbacks give you fine-grained control and visibility into the core embedding operations.

## Interface ICustomEvent

This interface lets you create and send events with your own custom data within the swarm system. Think of it as a way to communicate information beyond the standard event types.  It builds upon the basic event structure, but instead of being limited to specific data fields, you can include any type of information you need in the 'payload' property. This is useful for events that don’t fit neatly into the predefined event schema, allowing for greater flexibility in how agents interact and share information.  For example, you might use it to signal a task's completion along with specific results.

## Interface IConfig

This interface defines the configuration options for generating UML diagrams, specifically related to subtrees. The `withSubtree` property is a simple boolean that controls whether the diagram includes representations of subtrees within the overall structure. Setting this to `true` will expand the diagram to show these nested relationships, while setting it to `false` will create a more high-level view. It provides a straightforward way to tailor the level of detail in the generated UML visualization.

## Interface IComputeSchema

This interface, `IComputeSchema`, describes the configuration for a compute unit within our AI agent swarm orchestration system. Think of it as a blueprint for a specific task or calculation that an agent can perform.

It outlines several key aspects: a descriptive text (`docDescription`) to explain what the compute unit does, whether it's shared across agents (`shared`), and a unique name (`computeName`) to identify it.

You can also specify how long the data associated with this compute unit should be kept valid (`ttl`). 

The `getComputeData` function tells the system how to retrieve the data this compute unit operates on, using a client identifier and the compute unit's name. Dependencies are defined with `dependsOn`, indicating other compute units that must complete first.

`middlewares` allows you to chain processing steps before and after the core computation.  Finally, `callbacks` let you define functions to be executed when specific events happen within the compute unit's lifecycle, offering even greater control and flexibility.

## Interface IComputeParams

This interface, `IComputeParams`, provides all the necessary tools and information needed when performing a computation within the agent swarm. Think of it as a package of resources – it includes a unique identifier for the client requesting the computation (`clientId`), a way to log information and track progress (`logger`), a communication channel to interact with other parts of the system (`bus`), and a list of state changes that need to be applied afterward (`binding`). Essentially, it bundles everything a computation needs to run and integrate smoothly within the swarm environment.

## Interface IComputeMiddleware

This interface defines the structure for components that sit between the swarm orchestrator and the AI agents, allowing you to modify or enhance the information being passed back and forth. Think of it as a customizable pipeline – you can use middleware to transform the data sent to agents before they process it, or to adjust the results you receive from them. Implementing this interface lets you add your own logic for things like data validation, logging, or even injecting additional context into the agent requests. It provides a consistent way to interact with and influence the agent computation process without directly altering the core orchestration logic.

## Interface IComputeConnectionService

This interface defines how your AI agents connect to and interact with external compute resources, like databases, APIs, or other services. Think of it as the bridge that lets your agents access the tools they need to do their work. It provides methods for establishing connections, ensuring they remain active, and gracefully handling any disconnections that might occur. By implementing this interface, you can create reusable connection components that your agents can utilize consistently across different tasks and environments, promoting modularity and simplifying maintenance. Essentially, it's the foundation for enabling agents to reliably access and leverage external data and functionality.

## Interface IComputeCallbacks

This interface lets you hook into the lifecycle of a compute unit within the agent swarm. Think of it as a way to be notified about what's happening behind the scenes. 

You can define functions to be called when a compute unit is first created (`onInit`), when it’s being cleaned up (`onDispose`), when it's actively performing its calculations (`onCompute`), when a specific calculation is starting (`onCalculate`), and when its state is updated (`onUpdate`). Each of these callbacks provides information like the client ID and the name of the compute unit involved, allowing you to react to and potentially influence the process.

## Interface ICompute

The `ICompute` interface defines the core actions available for managing computational tasks within the agent swarm. It lets you trigger calculations using `calculate`, specifying which state to focus on. You can also use `update` to inform the system about changes to a specific computation, identified by a client ID and compute name. Finally, `getComputeData` provides a way to retrieve the current status or data associated with a computation. This interface simplifies interaction with the computation layer of the orchestration framework.

## Interface ICompletionSchema

This interface outlines how to set up a system for generating suggestions or completions within your agent swarm. Think of it as defining a specific way for agents to produce responses.

You're able to give each completion method a unique name and specify flags to be used with the underlying language model—like telling the model how to behave or what style to use.

You can also customize what happens after a completion is generated by providing callback functions.

Finally, the `getCompletion` method is the key to actually requesting a completion; it takes some arguments and returns a model's response, integrating the context and available tools into the process.

## Interface ICompletionCallbacks

This interface lets you tap into what happens after an AI agent successfully finishes a task. Specifically, `onComplete` provides a way to be notified when a completion is ready, giving you a chance to do things like record the results, format the output, or initiate the next step in a workflow. You can think of it as a way to react to the successful completion of an AI agent's work.

## Interface ICompletionArgs

This interface defines the information needed to ask the AI agent swarm to generate a response. Think of it as a package of data that includes who's asking (client ID and agent name), where the last message came from (user or a tool), the ongoing conversation history, and a list of tools the agent can use to help it respond. It essentially structures the context for the AI to understand what's being asked and how to best answer. Providing these details ensures the AI generates a relevant and informed response within the overall workflow.

## Interface ICompletion

This interface defines how your AI agents can request and receive responses from language models. Think of it as a standardized way for agents to ask a model a question and get an answer back. It’s designed to be a full and clear blueprint for how agents interact with models, ensuring a consistent and predictable process.

## Interface IClientPerfomanceRecord

This interface tracks performance details for individual clients, like user sessions or agent instances, within a larger process. It collects information about how much data a client is processing, how long its operations take, and what state it’s holding.

Each client record includes a unique identifier (`clientId`) to link performance data back to a specific instance. It also stores the client’s memory and state (`sessionMemory`, `sessionState`), which are similar to what you’re using in your agents.

The record also logs the number of operations (`executionCount`), the total input and output data sizes (`executionInputTotal`, `executionOutputTotal`), and average execution times (`executionTimeAverage`). The total input, output, and time are also tracked to provide aggregated views. This helps understand how each client contributes to the overall performance of the system.

## Interface IChatInstanceCallbacks

This interface defines a set of callbacks that allow you to listen for and react to events happening within a chat instance managed by the AI agent swarm. You can use these callbacks to monitor the lifecycle of a chat, from its initialization to when messages are sent.

Specifically, you're notified when a chat instance becomes active or inactive, when it's ready to use, and when it's finished. You also receive notifications when a new chat session starts and when a message is transmitted. This allows your application to respond dynamically to the chat's progress and state.

## Interface IChatInstance

This interface represents a single chat session within your AI agent swarm. Think of it as a dedicated space for one conversation. 

The `beginChat` method kicks off a new chat, while `sendMessage` lets you send messages to the other side. To ensure the chat remains active, `checkLastActivity` verifies if there's been recent interaction. When you’re finished, `dispose` cleanly shuts down the chat session. Finally, `listenDispose` allows you to be notified when a chat is being closed.

## Interface IChatControl

This interface lets you configure how your AI agent swarm interacts with chat interfaces. Think of it as a way to plug in different chat systems or customize their behavior.

`useChatAdapter` allows you to specify which type of chat instance you want to use – essentially telling the framework what kind of chat technology is handling the conversations. 

`useChatCallbacks` lets you define specific actions that should happen at different points in the chat process, like when a message is received or sent. This gives you fine-grained control over how the swarm responds to events.

## Interface IChatArgs

This interface, `IChatArgs`, defines the structure of data used when communicating with an AI agent within the system. Think of it as a standard package for sending information to an agent. It includes a `clientId` to identify who initiated the conversation, an `agentName` specifying which agent is responsible for the chat, and the actual `message` content being sent. This ensures all necessary information is provided for a meaningful interaction.

## Interface IBusEventContext

This interface provides extra information about events happening within the system. Think of it as a way to label events with details about which agent, swarm, storage, state, compute, or policy is involved. When an agent sends an event, it typically only includes its own name (agentName). However, other parts of the system might use this interface to provide more complete information about events related to swarms, storage, states, computations, or policies. It helps track down exactly what's happening and where within the overall system.

## Interface IBusEvent

This interface describes the structure of messages sent across the system's internal communication channels. Think of it as a standardized way for different parts of the system, especially agents, to talk to each other and signal what's happening.

Each message always comes from a known source, usually the agent bus, and has a specific type, like "run" or "commit-user-message," indicating what action is being communicated. It can also carry input data—information needed to perform an action—and output data—the results of that action. Finally, there's contextual information attached, like the agent's name, which helps identify where the message originated. Essentially, it's a detailed record of what an agent is doing and sharing with the rest of the swarm.

## Interface IBus

The `IBus` interface acts like a central messaging system for the swarm. It allows different parts of the system, particularly agents, to send updates and information to specific clients. Think of it as a way for agents to announce things like when a task is finished, a message has been processed, or a tool has produced a result.

The main function, `emit`, is how you send these messages. You specify which client the message is intended for and then provide the event details, which includes things like the event type, data, and the agent that sent it. The system makes sure the message gets to the right place and handles it asynchronously.

These messages often contain information that other parts of the system need to know, such as the result of a tool execution or the completion of a process. The `clientId` is included in the message itself for extra clarity and to help ensure the message reaches the correct recipient. This system allows different agents to talk to clients without needing to know the specifics of how the other is implemented.

## Interface IBaseEvent

This interface lays the groundwork for how different parts of the system talk to each other through events. Every event generated within the swarm will have at least these two pieces of information: a `source` indicating where the event came from, and a `clientId` specifying which client it's meant for. Think of the `source` as a label saying who sent the message, and the `clientId` as the address it's being sent to – making sure it reaches the right place. This provides a standard way for agents, sessions, and other components to communicate.

## Interface IAgentToolCallbacks

This interface lets you plug into the lifecycle of individual tools within your AI agent swarm. Think of it as a way to observe and subtly influence what each tool does. 

You can use `onBeforeCall` to do things like log when a tool is about to run or prepare some data. `onAfterCall` is for tasks you want to perform after a tool has finished, maybe cleanup or more detailed logging. 

`onValidate` gives you the power to check if the information passed to a tool is correct before it even starts running, preventing errors. Finally, `onCallError` handles situations where a tool fails, so you can log the error or attempt some kind of recovery. Each of these callbacks are optional, giving you flexibility in how much control you need.

## Interface IAgentTool

This interface describes a tool that an AI agent can use, building upon a more general tool definition. Each tool has a name, a description for documentation, and a way to validate incoming parameters to ensure they’re correct before the tool runs.

You can also add validation logic that can be performed synchronously or asynchronously, depending on the complexity. To give you more control, there are optional callbacks that allow you to customize the tool's execution process at different stages.

The core functionality is the `call` method, which actually executes the tool. It takes all the necessary information, including parameters and context, to perform its task. Finally, the `function` property allows for dynamic generation of the tool metadata.

## Interface IAgentSchemaInternalCallbacks

This interface lets you tap into key moments in an agent's lifecycle. You can use these callbacks to monitor what's happening, log events, or even react to specific actions. 

For example, `onRun` tells you when an agent is executing a stateless operation, while `onExecute` signals the start of a more involved process.  `onToolOutput` lets you know when a tool has generated a result, and `onToolRequest` is useful for intercepting and potentially modifying tool requests. 

Other callbacks like `onSystemMessage`, `onAssistantMessage`, `onUserMessage`, `onFlush`, and `onOutput` give you visibility into communication and data flow.  `onResurrect` alerts you to an agent recovering from a pause or error, and `onInit` & `onDispose` mark the beginning and end of the agent’s existence. Finally, `onAfterToolCalls` provides notification upon completion of a sequence of tool executions.

## Interface IAgentSchemaInternal

This interface describes how an agent is configured within the system. It essentially defines everything about an agent – its name, the instructions it follows (the prompt), the tools it can use, and how it interacts with the overall process.

You can set a limit on the number of tools an agent can use in a single cycle, as well as control how much conversation history it remembers to keep its responses relevant. It also allows for adding helpful descriptions for documentation and whether it acts as an operator.

The system lets you specify prompts that guide the agent's behavior, and even allows for dynamic prompts that change based on the context of the conversation.  You can also define how the agent handles tool calls, validates its outputs, and transforms the model's responses. Finally, you can define connection to operator, available tools and storage, define the agents' states and dependencies, and hook into the agent's lifecycle with custom callbacks to tailor its behavior.

## Interface IAgentSchemaCallbacks

This interface lets you hook into different moments in an agent's lifecycle. You can use these callbacks to monitor what's happening, log events, or even react to specific actions the agent takes. For example, you can get notified when the agent starts running, when it asks a tool to do something, or when it finishes producing an output. It's a way to observe and interact with your agents without directly modifying their core logic. The callbacks provide context like the agent's ID, name, and relevant data associated with each event.

## Interface IAgentSchema

This interface defines the structure for describing an agent within the orchestration framework. It allows you to specify instructions or guidelines for an agent, which helps guide its behavior and interactions. You can provide a standard set of system prompts using the `system` property, and `systemStatic` acts as an alias for `system`. For more complex scenarios, the `systemDynamic` property lets you generate system prompts on the fly based on the client ID and agent name, which gives you more flexibility.

## Interface IAgentParams

This interface defines how an agent is set up to run within the system. Think of it as a configuration package that provides the agent with everything it needs to operate – its unique identifier, a way to log its actions, a communication channel with other agents, access to external tools, a record of past interactions, and the ability to generate responses. It also allows you to define tools the agent can use and even include a validation step to ensure the output is correct before it's finalized.

## Interface IAgentNavigationParams

This interface defines the settings you use to tell an agent how to move around and interact with other agents within the system. You specify the name of the tool being created, a description of what it does, and the specific agent it should navigate towards. There's also a space for an optional note to add extra documentation about the tool. Think of it as setting the destination and instructions for an agent's movement.

## Interface IAgentConnectionService

This interface helps define how different agents connect and communicate within the system. It’s essentially a blueprint for creating connection services, but it’s designed to strip away the internal details so that the public-facing parts are clear and consistent. Think of it as ensuring everyone uses the same language when agents are talking to each other.

## Interface IAgent

The `IAgent` interface describes how an agent operates within the orchestration framework. Think of it as the blueprint for how an agent processes information and interacts.

You can use the `run` method for quick, isolated tests—it lets you give the agent input and get a result without changing its memory. The `execute` method handles the full process, potentially updating the agent’s history based on how it’s configured.

To manage the agent’s memory, there are several `commit...` methods. These allow you to add different types of messages—tool outputs, system instructions, user inputs, assistant responses—to the agent's record. You can also use methods like `commitToolRequest` to log tool calls and `commitFlush` to completely reset the agent’s memory. The `commitStopTools`, `commitAgentChange`, and `commitCancelOutput` methods give you fine-grained control over stopping the agent’s current actions and preventing future ones.
