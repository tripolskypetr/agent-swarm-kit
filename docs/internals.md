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

This function checks that all of your AI agent swarms, the individual agents within them, and their associated plans are set up correctly. It’s designed to be safe to run multiple times – it won’t cause any unintended changes if you call it again. Think of it as a health check for your entire AI agent system.

## Function startPipeline

This function lets you kick off a pre-defined workflow, or "pipeline," within the agent swarm. You tell it which client the workflow belongs to, the name of the pipeline you want to run, and which agent should handle the work. Optionally, you can provide data, or a "payload," that the agent will use during the process. The function will then start the pipeline and eventually return a result, the type of which you can specify.

## Function scope

This function lets you run a piece of code – like a task for your AI agents – within a controlled environment. Think of it as setting up a little stage for your code to perform on, ensuring it has the resources and context it needs. You provide the code you want to run, and optionally, you can customize the tools and services it uses, like the agents themselves or the way it generates responses. The function handles the setup and cleanup, so your code can focus on its job, and you can be sure it's operating consistently. It gives you a way to manage the environment your agents are working in.

## Function runStatelessForce

This function lets you send a message to your AI agent swarm for immediate processing without keeping a record of it in the chat history. It's perfect for situations where you're dealing with data storage or need to quickly perform a task, and you don't want to contribute to a growing conversation log. 

Unlike other functions, it will always execute the message, even if the agent isn’t currently active.  It handles the technical details like verifying your session, tracking performance, and keeping track of metadata, so you don't have to worry about those aspects.  You simply provide the message you want the agent to handle and a unique identifier for your session.

## Function runStateless

This function lets you send a message to an agent within a swarm, but it’s special because it doesn’t save the message to the agent's ongoing chat history. Think of it as a quick, one-off task or processing something like data storage where you don’t want to clutter up the chat log.

It makes sure the agent is still available and working correctly before sending anything. The function handles the technical setup to make sure the process is clean and tracks how long it takes to complete. If the agent has been replaced in the swarm, the function simply won't do anything and returns an empty response.

You'll need to provide the message you want to send (`content`), a unique identifier for the user’s session (`clientId`), and the name of the agent you want to use (`agentName`).

## Function overrideTool

This function lets you update or replace a tool’s settings within the swarm. Think of it as modifying a tool's recipe – you can change its name, what it does, or add extra details. It’s designed to make these changes independently, ensuring they don't interfere with anything else happening in the system. The system will also keep a record of this change if logging is turned on. You provide the new or updated tool schema as input, and the function takes care of the rest.

## Function overrideSwarm

This function lets you change the configuration of a swarm within the system. Think of it as updating a swarm's blueprint. You provide a new schema definition, and it applies those changes to the existing swarm. It’s designed to be a standalone operation, ensuring it doesn't interfere with any ongoing tasks, and it keeps a record of the change if logging is turned on. The key input is the new or updated schema you want to apply to the swarm.

## Function overrideStorage

This function lets you adjust how the swarm system handles data storage. Think of it as a way to tweak the settings for a specific storage area – you can change aspects like how data is organized or what information is tracked. It makes these changes directly, ensuring they're isolated and don't interfere with ongoing processes. If the system is set up to log activities, this override will be recorded. You provide a partial schema outlining the desired updates, and the function applies them to the existing storage configuration.

## Function overrideState

This function lets you change how the swarm system handles a particular state. Think of it as updating the blueprint for a specific state – you can add new details or modify existing ones. It’s designed to make these changes independently, ensuring the process is clean and isolated. The system will also record these modifications if logging is turned on. You just provide the updated state information, and the system takes care of the rest.

## Function overridePolicy

This function lets you update a policy's settings within the agent swarm. Think of it as modifying an existing policy's blueprint – you can either change the whole thing or just a few specific parts. The update happens independently, ensuring it doesn't interfere with anything else currently running. If logging is turned on, you’ll see a record of the change. You provide the new or modified policy definition as input.

## Function overridePipeline

This function lets you modify an existing pipeline definition. Think of it as a way to tweak a workflow without completely rebuilding it. You provide a partial update – only the parts you want to change – and this function merges them with the original pipeline. It’s useful for making small adjustments to how your AI agents work together. The function takes a pipeline schema as input, representing the changes you want to apply.

## Function overrideOutline

This function lets you modify an existing outline schema within the swarm system. Think of it as updating a blueprint for how agents will organize their work. It carefully makes these changes in a controlled environment to prevent unexpected conflicts. The system will also record these modifications if logging is turned on, providing a record of the updates made. You provide a partial schema – essentially, just the changes you want to apply – and it integrates those into the existing outline configuration.

## Function overrideMCP

This function lets you modify an existing Model Context Protocol (MCP) schema. Think of it as a way to update or customize how your AI agents communicate and share information. You provide the original MCP schema, and the function returns a new, adjusted schema based on your changes. It’s useful for tailoring the communication structure to your specific agent swarm's needs. You essentially give it a blueprint, and it returns a modified version.

## Function overrideEmbeding

This function lets you modify how your AI agents understand and process text by updating the embedding schema. Think of embeddings as the way your agents translate words into numbers they can work with – this function allows you to fine-tune that translation. You provide a new schema definition, and the system applies those changes, ensuring a controlled and isolated update. The process is logged if your system is set up to do so, giving you a record of the modification.

## Function overrideCompute

This function lets you modify existing compute configurations, allowing you to tailor them to specific needs. Think of it as a way to fine-tune how your AI agents perform tasks. You provide a partial update – just the pieces you want to change – and the function merges those changes into the original compute configuration. This gives you flexibility without needing to redefine the entire configuration from scratch.

## Function overrideCompletion

This function lets you adjust how the AI agents complete tasks within the swarm. Think of it as fine-tuning the instructions given to the agents when they're generating responses. You can provide a brand new schema or just update parts of an existing one. This change happens independently, ensuring it doesn't interfere with anything else the agents are doing, and it records the adjustment if logging is turned on. It's a way to modify completion behavior without affecting other processes. 

You provide a schema definition, which specifies the desired behavior for completion.

## Function overrideAgent

This function lets you update the settings for an agent already running in the system. Think of it as a way to tweak an agent's behavior on the fly. You provide a new schema – it can be a complete overhaul or just a few changes – and the system applies it. This update happens in a controlled environment to avoid conflicts and keeps a record of the change if logging is turned on. It’s like giving an agent a quick configuration upgrade. 

The `agentSchema` parameter is the core of this; it contains all the new or modified settings for the agent you want to change.

## Function overrideAdvisor

This function lets you update an advisor's configuration within the swarm. Think of it as a way to tweak how an advisor operates – you can provide a whole new schema or just a few changes to its existing setup.  It's designed to be a clean operation, running independently to avoid conflicts with anything else happening in the system.  If logging is turned on, it will record that you made this change. You provide the new advisor schema as input, and the function applies it to the swarm's configuration.

## Function notifyForce

This function lets you send a message out from your AI agent swarm session without it being processed as a regular instruction. Think of it as a direct output – useful when you want to broadcast information or trigger an action outside the normal message flow. It's specifically intended for sessions that were started using the "makeConnection" method. Before sending, the system double-checks that the session, swarm, and relevant agent are still working. The message is sent in a controlled environment, and the system keeps a record of the notification if logging is enabled. It won't work unless the session was established using "makeConnection".

You provide the message content as a string and a unique ID to identify the client session.

## Function notify

This function lets you send messages out from your swarm session – think of it as broadcasting information without triggering any further actions. It’s specifically for sessions started with “makeConnection”.

Before sending, it makes sure everything is still working correctly: the session, the swarm itself, and the agent you’ve specified are all confirmed to be active. If the agent has been replaced, the message won’t be sent.

You provide the message content, a unique client ID to track the communication, and the name of the agent you want to associate the notification with. It’s a simple way to get information out to the system.

## Function markOnline

This function lets you tell the system that a specific client is now active and participating in a particular swarm. Think of it as signaling that a worker is ready to receive tasks. You'll need to provide the unique ID for that client and the name of the swarm they're part of. It's a simple way to update the system’s understanding of which clients are available for work within a given swarm.

## Function markOffline

This function lets you tell the system that a particular client is no longer active within a specific group of agents. You provide the unique ID of the client and the name of the agent swarm you're working with. Think of it as updating the system's knowledge about which agents are currently online and available. It’s a simple way to ensure accurate tracking of client sessions within your agent swarm setup.

## Function listenEventOnce

This function lets you set up a listener that only triggers once for events coming from a specific client or all clients. You tell it which client you're interested in (or use "*" to listen to everyone), the name of the event you want to hear about, and a filter to make sure only certain events trigger the callback. When a matching event arrives, your callback function will be executed with the event's data, and then the listener automatically stops. It's designed to be clean and safe, with built-in safeguards and a way to cancel the listener early if needed.

## Function listenEvent

This function lets you tune into specific events happening within your AI agent swarm. You tell it which client or all clients you're interested in, and what event topic to watch. When an event with that topic is triggered, a function you provide will be called with the event’s data. It’s designed to be clean and organized, ensuring events are processed in order and preventing interference with reserved topic names. To stop listening, it gives you a special function to unsubscribe and shut down the listener.

## Function json

This function lets you request structured data in JSON format, following a predefined outline or schema. Think of it as asking the system to organize information according to a specific plan. It handles the request internally, keeping things clean and isolated to prevent any unexpected interference. You provide the name of the outline you want to use, and optionally, you can pass in some parameters to further customize the output. The result will be a promise that resolves to the structured JSON data.

## Function hasSession

This function helps you quickly determine if an active session already exists for a specific client. It checks for a session based on a unique client identifier you provide. Behind the scenes, it uses a session validation service to do the actual check. If logging is turned on in your system's settings, the function will record that it was called.

## Function hasNavigation

This function lets you quickly check if a particular agent is involved in guiding a client through a process. It verifies the client's session and the agent's existence, then looks at the current navigation path to see if the agent is included. Think of it as a simple way to confirm an agent's role in a client's journey. You provide the client's ID and the agent's name to get a yes or no answer.

## Function getUserHistory

This function helps you pull up a user's conversation history for a specific session. It finds all the messages where the user interacted, effectively giving you a record of their contributions. You provide a unique identifier for the session, and the function returns an array containing those user-generated messages. Think of it as retrieving the user's side of a conversation. The function ensures a safe and controlled process and keeps a log of the operation if logging is enabled.

## Function getToolNameForModel

This function helps you determine the specific name a model should use for a tool, taking into account who's using it and which agent is involved. It's the primary way for external systems to interact with this part of the framework. You provide the tool's name, a unique identifier for the client, and the agent's name, and it returns the model-friendly version of the tool name. Think of it as translating a general tool name into something the AI model understands within a particular context.

## Function getTool

This function lets you fetch the details of a specific tool that's available within your AI agent swarm. Think of it as looking up a tool's blueprint – you provide the tool's name, and it returns the information defining that tool, including what kind of data it expects and produces. The system will also keep a record of this action if you’re using logging. You just need to specify the name of the tool you’re interested in.

## Function getSwarm

This function lets you fetch the details of a specific swarm, like its configuration and settings. You provide the swarm's name, and the system will retrieve its schema. The process is tracked in logs if logging is turned on in the system's general settings. Essentially, it's how you get the blueprint for a particular swarm.

## Function getStorage

This function lets you access the structure and details of a specific storage area within the agent swarm. Think of it as looking up the blueprint for how data is organized in a particular storage location. You provide the name of the storage you're interested in, and the function returns a description of its layout and the kind of data it holds. If the system is set up to record activity, this retrieval will also be noted in the logs.

## Function getState

This function lets you get a specific state's blueprint, or schema, from the system managing all the agent states. Think of it as requesting the definition of how a particular state should look and behave. The system keeps track of these blueprints, and this function provides a way to access them. If the system is set up to log actions, this request to get a state schema will also be recorded. You simply provide the name of the state you want to learn about.

## Function getSessionMode

This function lets you check the current state of a client’s session within the swarm. It tells you whether the session is in a standard "session" state, is attempting to "makeConnection", or is "complete". 

You provide the unique identifier for the client session, and the function does the work of figuring out the session's mode, making sure the session is valid and keeping a log if that's enabled. It runs independently to ensure a reliable and clean check.

## Function getSessionContext

This function fetches the overall environment information for your agent's session. Think of it as gathering details like a unique identifier for your client, the process running the agent, and a list of available tools and execution options. It automatically pulls this data based on where the agent is currently running, without needing you to provide any specific IDs. The process is logged for tracking purposes, and it utilizes services to ensure everything is set up correctly.

## Function getRawHistory

This function lets you access the complete, unaltered history of interactions for a specific client within your AI agent swarm. It’s like getting the full record, exactly as it was generated, without any summaries or edits. You provide the unique ID of the client session, and the function returns an array containing all the messages related to that session. Think of it as a way to inspect the raw data behind the agent's activity. The client ID is essential for identifying which session’s history you want to retrieve.

## Function getPolicy

This function lets you fetch a specific policy definition from the system. You give it the name of the policy you're looking for, and it returns the full policy details. The system will also record that it retrieved the policy if logging is turned on. It's a simple way to access and use the defined policies within the agent swarm.

## Function getPipeline

This function lets you fetch a pipeline definition by its name. Think of it as looking up a blueprint for a specific workflow within your AI agent swarm.  It's how you get the details of how a pipeline is structured and what it does. The system will also record that it retrieved the pipeline if logging is turned on. You just need to provide the name of the pipeline you're looking for.

## Function getPayload

This function lets you access the data being passed around within the agent swarm's workflow. Think of it as grabbing the current "package" of information that's being worked on. It's designed to be flexible, working with different kinds of data structures. If there’s no data currently being processed, it will simply return nothing. And if the system is set up to track these actions, it will record that you’ve requested this data.

## Function getNavigationRoute

This function helps you find the path an agent has taken within a group, or "swarm." It identifies which agents have been visited during a particular session, using a unique identifier for that session and the name of the swarm you're interested in. Think of it as tracing the steps of agents working together. The function relies on another service to do the actual pathfinding, and it may also record this activity based on system-wide settings. You'll need to provide a client ID to identify the session and the swarm name to specify which group of agents you're looking at.

## Function getMCP

This function helps you fetch the blueprint, or schema, for a specific Model Context Protocol (MCP) from the system. Think of an MCP as a standardized way for AI agents to communicate and share information. You provide the name of the MCP you're looking for, and the function retrieves its details.  If the system is set up to record activity, this retrieval process will be logged. The `mcpName` parameter specifies which MCP schema you want to get.

## Function getLastUserMessage

This function helps you easily get the last message a user sent to your system. It finds the most recent interaction where the user was actively providing input.

You provide a unique identifier for the user’s session, and the function retrieves that last message as text. If the user hasn't sent any messages yet, it will return nothing. 

Essentially, it gives you a quick way to access the most recent user input for a specific client.

## Function getLastSystemMessage

This function helps you access the last message sent by the system within a specific client's conversation history. Think of it as retrieving the most recent instructions or updates provided to the AI agent for that client. It digs through the conversation history, finds the most recent message labeled as a "system" message, and gives you its content. If no system messages were sent, it will return nothing. You need to provide the unique identifier for the client you're interested in.

## Function getLastAssistantMessage

This function helps you easily get the last message sent by the AI assistant for a specific client. It digs into the client’s conversation history to find the most recent message where the AI was the one speaking. If the AI hasn's sent any messages yet, it will return nothing. You just need to provide the unique ID of the client you’re interested in.

## Function getEmbeding

This function lets you fetch the details of a specific embedding model used by your AI agents. Think of it as looking up the blueprint for how an agent understands and processes text. You provide the name of the embedding you want, and it returns all the important information about that embedding, like its structure and capabilities. The system also keeps track of these requests if you’ve enabled logging. 

You’ll need to specify the name of the embedding when you call this function.

## Function getCompute

This function helps you find the details of a specific compute resource within your AI agent swarm. Think of it as looking up the configuration for a particular worker or tool. You provide the name of the compute you're interested in, and it returns a structured description of its settings. If your swarm is set up to record activity, this lookup will also be logged for tracking purposes.

## Function getCompletion

This function lets you fetch a specific completion definition from the system, identifying it by its name. Think of completions as pre-defined actions or tasks your AI agents can perform. When you call this function, it grabs the details of that completion, like what it does and how it works. The system might also record that you requested this information if logging is turned on. You just need to provide the name of the completion you're looking for.

## Function getCheckBusy

This function lets you quickly see if a specific client's swarm of AI agents is currently working on something. You just provide the unique ID assigned to that client, and it will tell you – with a simple true or false – whether the swarm is occupied. This is helpful for understanding the current workload and potentially adjusting tasks or resources. The `clientId` is how you identify which swarm you're checking on.

## Function getAssistantHistory

This function lets you retrieve a record of what the AI assistant has said during a specific client's session. It digs up all the historical interactions and then pulls out just the messages the assistant sent. Think of it as getting a transcript of the assistant’s part of the conversation. You provide a unique ID for the client's session, and it returns a list of messages representing the assistant’s responses.

## Function getAgentName

This function helps you find out which agent is currently handling a specific client's session within your AI agent swarm. You simply provide the unique identifier for that client, and the function will return the agent's name. It makes sure the client and swarm are valid, keeps a record of the request if logging is turned on, and retrieves the agent's name safely within a controlled environment. Think of it as a quick way to identify the agent currently responsible for a particular client interaction.

## Function getAgentHistory

This function allows you to view the past interactions and decisions made by a particular agent in your swarm. It's like checking an agent's memory, but with a special touch – it takes into account any rescue strategies the system might be using to improve agent performance. To use it, you'll need to provide the unique identifier for the client session and the name of the agent you want to examine. The function makes sure the agent and session are valid, keeps a record of the operation, and retrieves the history using the agent’s settings. It runs in a separate environment to keep things clean and prevent interference with other processes.

## Function getAgent

This function lets you find a specific agent within your AI agent swarm by its assigned name. Think of it as looking up an agent's details – its configuration and settings – when you need to work with it. When you call this function, the system will record the action if logging is turned on. You simply provide the agent's name, and it returns the agent's complete schema.

## Function getAdvisor

This function lets you fetch details about a specific advisor within your AI agent swarm. Think of it as looking up an advisor's profile – you provide the advisor’s name, and it returns all the information associated with that advisor. The system keeps track of these requests, so you can monitor advisor usage if you have logging turned on. You simply provide the name of the advisor you're interested in, and the function does the rest.

## Function fork

The `fork` function lets you run a piece of code—like a specific task for one of your AI agents—within a controlled environment. Think of it as creating a temporary workspace for that task. 

It takes a function you want to run and a set of options that tell it how to set up that workspace. The function you provide will get the client ID and the agent’s name as input. 

This framework takes care of the setup and cleanup—like making sure the session is valid and handling resources—so you can focus on the logic of your agent's task. It essentially simplifies the process of safely running code in a managed context.

## Function executeForce

This function lets you send instructions directly to an agent within a swarm, acting as if the instruction came from a client. It's useful when you need to ensure a command is executed, even if the agent isn't actively running or has been replaced. Think of it as a way to force an action, perhaps to review output or start a conversation – it bypasses checks to guarantee the instruction is carried out. You’re providing the content you want the agent to process and a unique identifier for the client making the request. The system handles the details of making sure the instruction is processed correctly, including tracking performance and notifying other parts of the system.

## Function execute

This function lets you send messages to a specific agent within a group of agents working together. Think of it as forwarding a message from your application as if it came directly from one of the agents. It's useful when you need an agent to review some information or start a conversation back to your application.

Before sending the message, the system double-checks that the agent is still part of the group and that the session is valid.  The message itself is handled carefully, ensuring a clean environment and tracking important details about the execution. It's designed to avoid conflicts if another agent has taken over the role.

You're required to provide the message content, a unique ID for your application session, and the name of the agent you want to send the message to.

## Function event

This function lets your application send messages, or events, to the larger AI agent swarm. Think of it as broadcasting a notification to other parts of the system. You specify a unique identifier for your application (the `clientId`), a topic name to categorize the message, and the actual data you want to share in the `payload`. The system prevents you from using certain reserved topic names to avoid conflicts. This is a simple way to enable communication and coordination between different AI agents within the swarm.

## Function emitForce

This function lets you send a string directly as output from the AI agent swarm, essentially pushing information without triggering a standard message process or checking which agent is active. Think of it as a way to inject data into the system's flow.

It’s specifically built for sessions created using `makeConnection`, ensuring everything works together smoothly. The function sets up a fresh environment before sending the output, verifies the session and swarm's health, and won't work if the session wasn’t established through `makeConnection`. 

You provide the string you want to send (`content`) and a unique ID for the client session (`clientId`). The function then handles the rest, logging its actions if logging is enabled.

## Function emit

This function lets you send a string as output from an agent within the swarm, like a direct message. It's specifically for sessions created using `makeConnection` and ensures that the agent you're sending the output from is still active and part of the swarm.

Think of it as a way to have an agent "speak" without needing a full message to trigger it. The system checks everything is still valid before sending anything and makes sure the environment is clean for the output. It's important to note that you can only use this function within sessions created with `makeConnection`. It’s designed to be a straightforward way to transmit data from an agent while guaranteeing the operation’s validity.

Here's what you need to provide:

*   The actual text you want to send.
*   A unique identifier for the client using the session.
*   The name of the agent that should be sending the output.

## Function commitUserMessageForce

This function lets you directly add a user’s message to the agent's record within a swarm session. It's useful when you need to manually update the agent's history without waiting for a response or checking if the agent is still running. 

Essentially, it's a way to force an update to the agent’s record, ensuring the swarm session and the overall system are validated before making the change. The function also handles logging and uses a special process to keep the execution clean and separate from other operations.

You provide the message content, the execution mode, a client identifier, and optionally some extra data (payload) to be processed along with the message.

## Function commitUserMessage

This function lets you add a user's message to an agent's record within an ongoing swarm session. It’s useful when you want to track interactions without immediately prompting the agent to respond.

Think of it as silently updating the agent’s memory. The function carefully checks that the agent and session are still active before making changes and logs the action if logging is turned on. It makes sure the process happens cleanly, separate from any ongoing actions. 

You'll need to provide the message content, the execution mode, a client identifier, and the agent's name. Optionally, you can include additional data through the `payload` parameter.

## Function commitToolRequestForce

This function lets you directly push tool requests to an agent within the system, effectively overriding standard agent validation. It’s useful when you need to ensure a request is processed quickly, bypassing typical checks. 

The function takes a list of tool requests and a client identifier, then handles the processing and logging within the system's execution environment. Think of it as a shortcut for committing requests, but be mindful that it skips the usual agent checks.

## Function commitToolRequest

This function lets you send tool requests to a specific agent within the swarm. It essentially tells the system, "Hey, this agent needs to run these tools!". 

Before it does that, it double-checks that everything is set up correctly – verifying the agent, the client session, and making sure you're talking to the right agent. 

It works behind the scenes to manage the execution environment and keeps track of what's happening through logging. You provide the tool requests, the client's ID, and the agent's name, and the function takes care of the rest, returning a list of identifiers for the processed requests.

## Function commitToolOutputForce

This function lets you directly push the output from a tool back to the agent's workflow, even if you're not entirely sure the agent is still available. Think of it as a way to quickly update the agent's state without waiting for confirmation. It takes the tool’s ID, the output content, and the client session ID as input, ensuring the operation is logged and performed safely within the system. The function ensures that the commit happens in a fresh, isolated environment.

## Function commitToolOutput

This function helps you record the results from a tool that an agent used, ensuring that the information is properly linked to that agent's activity within a larger group of agents working together. 

It takes the tool's ID, the output from the tool, the client's session ID, and the agent's name to make sure everything is correctly associated. 

The system double-checks that the agent is still the one expected to receive this output before saving it, and it handles the process in a way that keeps things clean and avoids conflicts with other ongoing tasks. It's a straightforward way to keep a detailed log of what each agent is doing.

## Function commitSystemMessageForce

This function allows you to directly push a system message into a session, bypassing usual checks for which agent is currently active. It’s useful when you need to ensure a specific message is recorded, even if the system's agent management isn't fully in sync.

It confirms the session and swarm are valid before committing the message, and makes sure everything is logged correctly. Think of it as a more forceful version of a standard system message commit, similar to how assistant messages can be committed forcefully too.

You’ll need to provide the actual message content and a unique ID to identify the client session.

## Function commitSystemMessage

This function lets you send messages directly to an agent within the swarm system. Think of it as a way to communicate important instructions or configuration updates to a specific agent. It carefully checks that the agent you’re targeting is valid and part of the expected session and swarm before sending the message. 

The message itself, along with details about which client and agent it’s for, gets recorded for tracking and auditing. This is a way to send system-level communications, different from the responses an agent might generate. 

You'll need to provide the message content, a unique client ID, and the name of the agent you want to send the message to.

## Function commitStopToolsForce

This function allows you to immediately halt tool execution for a particular client session within the agent swarm. It's a forceful stop – it doesn’t bother checking which agent is currently running or validating the active session in the usual way. Think of it as an emergency brake for tool processing.

It's designed to be a more direct way to stop tools than the standard stop function, ensuring execution halts without waiting for agent confirmations. This is useful in situations where you need to quickly prevent further actions for a specific client.

To use it, you simply provide the unique identifier of the client session you want to stop. The system handles all the internal checks for session and swarm validity before applying the stop.

## Function commitStopTools

This function puts a temporary halt to tool execution for a particular client and agent within the swarm. Think of it as pausing the agent's workflow.

It carefully checks to make sure the agent you're stopping is actually the one you think it is, ensuring everything is valid.

This isn’t about wiping the agent’s memory; instead, it’s a way to control the sequence of actions the agent takes, like a way to pause before continuing.

It uses several internal services to confirm everything is correct and keeps a record of what's happening.  It's different from clearing the agent’s history – this just stops the agent from running another tool right away.

You’ll need to provide the unique ID for the client's session and the specific name of the agent you want to pause.

## Function commitFlushForce

This function provides a way to quickly and forcefully clear the history for a specific client’s session within the agent swarm. It’s designed to be a more direct approach than other history clearing methods, bypassing checks to ensure the history is cleared even if an agent isn't actively engaged. Essentially, it’s like a “hard reset” for a client’s interaction history. You’ll need to provide the unique identifier for the client's session to use this function. The system handles validating the session and swarm, and logs the operation for tracking purposes.

## Function commitFlush

This function helps clean up an agent's history within the swarm system. It's designed to erase the agent’s past interactions for a particular client, essentially resetting its memory.

Before wiping the history, it carefully checks to make sure the agent being referenced is actually the one expected. 

It handles all the necessary steps behind the scenes, like making sure everything is connected properly and recording what's happening. Think of it as a way to completely refresh an agent’s state, unlike functions that add new information.

You’ll need to provide the unique ID of the client and the name of the agent whose history you want to clear.

## Function commitDeveloperMessageForce

This function lets you directly add a developer-created message to a session within the AI agent swarm, bypassing the usual checks for the currently active agent. It's useful when you need to ensure a message is recorded, regardless of the agent's status.

The function validates the session and swarm before adding the message, and uses internal services to handle session management, swarm validation, message commitment, and logging. Think of it as a more forceful version of adding a message, similar to how assistant messages can be committed forcefully.

You'll need to provide the message content and the client’s unique identifier to use this function.

## Function commitDeveloperMessage

This function lets you send messages directly to an agent within the AI swarm, like giving it a specific instruction or piece of information. It's designed for developers who need to interact with the agents beyond the usual system or assistant responses.

Before sending the message, the system carefully checks that the agent you’ve specified exists and is the correct one for the current session. The process ensures that everything is properly managed and logged for tracking and debugging. 

You’ll need to provide the message content, a unique client identifier, and the name of the agent you’re targeting. This function provides a way to directly influence the agent's behavior with developer-supplied data.

## Function commitAssistantMessageForce

This function lets you directly push a message from an assistant into a session, bypassing the usual checks for which agent is currently active. It’s designed for situations where you need to ensure a message is recorded, regardless of the agent's status, similar to a "force" option.

Essentially, it verifies the session and swarm is valid, then commits the message. The process uses several services to manage the session, validate the swarm, commit the message, and keep a log of what's happening.

You'll need to provide the message content and a unique identifier for the client session to use this function.

## Function commitAssistantMessage

This function lets you send messages generated by an AI agent to the swarm system. It makes sure everything is set up correctly – verifying the agent, session, and the overall swarm – before saving the message. Think of it as securely adding an AI's response into the ongoing conversation.

It handles all the behind-the-scenes work of managing the conversation context and logging what's happening. This is the way to permanently store a message from an agent, as opposed to discarding it.

You'll need to provide the message content itself, a unique identifier for the client session, and the name of the AI agent that created the message.

## Function changeToPrevAgent

This function lets you switch back to a previously used agent for a specific client. Think of it like a "back" button for agent selection. If there's no previous agent to go back to, it will instead use the default agent. It's designed to be reliable, checking that the session and agent are valid and handling the change in a controlled way. The function also keeps a record of these changes if logging is turned on.

## Function changeToDefaultAgent

This function helps you easily switch a client’s active agent back to the standard, pre-defined agent within your swarm. It’s useful for resetting a client’s agent configuration. 

To use it, you simply provide the unique identifier for the client’s session. The system takes care of verifying the session, ensuring the default agent exists, and safely making the change in the background. It’s designed to work reliably and without interrupting other operations.

## Function changeToAgent

This function lets you switch which AI agent is handling a specific client's session within your swarm. Think of it as assigning a different specialist to take over a client's case. It verifies that the change is valid, keeps a log of what’s happening if you’re tracking those kinds of details, and handles the switch in a reliable way, ensuring it happens even if things get busy.  It prioritizes a smooth transition, making sure the agent change is processed separately from what's currently happening. You'll need to provide the name of the agent you want to use and a unique identifier for the client session.

## Function cancelOutputForce

This function lets you quickly stop an agent from producing output for a particular client. It's a forceful way to cancel, bypassing checks to see if the agent is still active or valid. Think of it as an emergency stop button – it immediately sends an empty response to the client. 

It verifies that the session and swarm are valid before cancelling, and it keeps track of what's happening through logging. To use it, you just need to provide the unique identifier for the client whose output you want to cancel. This is different from the regular cancellation process, which includes more checks.

## Function cancelOutput

This function lets you stop an agent from continuing to generate a response for a particular client. It’s useful when you want to interrupt an ongoing process.

It makes sure the agent you’re trying to stop is actually the one you think it is, and that the client and swarm are valid.

Behind the scenes, it handles the necessary checks, manages the execution environment, and keeps a log of what's happening.

You provide the unique ID of the client and the name of the agent you want to cancel.

## Function ask

This function lets you send a message to your AI agent swarm and get a response. Think of it as posing a question or giving a task to your advisors. You specify the message itself, and which advisor should handle it. You can also include images to provide more context – perhaps a picture to analyze or a visual aid for the agent. The function will then return a string containing the response from the swarm.

## Function addTriageNavigation

This function helps you set up a way for your AI agents to easily request help from a dedicated triage agent when they get stuck or need assistance. It essentially creates a navigation tool that guides an agent towards that triage support. You provide a configuration object with the necessary details, and the function handles registering this navigation pathway so your agents can access it. Think of it as creating a "help" button specifically for routing to a triage expert.

## Function addTool

This function lets you add new tools that your AI agents can use. Think of it as equipping your agents with new skills – like being able to search the web, run calculations, or access specific data sources. To make sure agents can use a tool, you need to register it using this function. It ensures the tool is properly recognized within the overall system and is executed in a clean environment. The function returns the name of the tool after it's successfully added.

## Function addSwarm

This function lets you create a new swarm, which is essentially a blueprint for how your AI agents will work together and handle client sessions. Think of it as defining the rules and structure for a specific type of task your agents will perform. 

By registering a swarm, you’re telling the system how it should handle interactions and workflows related to that swarm. Only swarms added using this function will be recognized and used by the system. The process runs in a protected environment to keep things clean and organized. Finally, you'll get a name for the newly created swarm as confirmation.

You need to provide a schema definition for the swarm, which outlines its structure and behavior.

## Function addStorage

This function lets you register a new way for your AI agents to store and retrieve data, like memories or important files. Think of it as adding a new type of database the swarm can understand and use.

To make sure the swarm knows about your storage system, you need to register it using this function. Only storage systems registered this way will be recognized by the swarm. 

If the storage is intended to be shared between agents, this function also handles setting up the connection to that shared storage and waits for it to be ready. This ensures everything is set up correctly before the swarm starts using it. The registration process runs in a controlled environment to avoid interference, and the function provides feedback by returning the storage's name upon successful setup.

## Function addState

This function lets you define and register new states within the AI agent swarm system. Think of it as creating a named container to hold information that agents can share or use. Only states registered this way will be recognized by the swarm, so it's essential for setting up the system's data landscape. If a state is designated as shared, this registration process also handles connecting to a shared state service to ensure everything's ready. It’s designed to run independently, keeping things clean and organized as it registers the new state and returns its name.

## Function addPolicy

This function lets you define and register rules, or policies, for your AI agents. Think of it as setting up guardrails for how your agents should operate. It registers each policy with services that handle both validating the rules and managing their definitions.  Behind the scenes, it makes sure everything is logged properly and executed within a controlled environment. Adding policies is a key step in setting up your agent swarm, allowing you to control and refine their behavior. You provide a schema that describes the policy, and the function takes care of the rest.

## Function addPipeline

This function lets you register a new pipeline, or update an existing one, within the agent swarm orchestration system. Think of a pipeline as a sequence of steps your AI agents will follow to achieve a larger goal. You provide a description of this pipeline – essentially a blueprint – and this function adds it to the system's registry.  The function will also check to make sure the blueprint you provide is valid before adding it. The result is a unique identifier for the pipeline that you can use later.

## Function addOutline

This function lets you add or update an outline schema within the AI agent swarm system. Think of an outline schema as a blueprint for how agents will structure their work – it defines the steps and information they'll use.

It carefully sets up a fresh environment before making changes to prevent conflicts with other ongoing processes. You'll provide the outline schema details, which could be new or modifications to an existing one. The function also keeps a record of this action if logging is turned on.

## Function addMCP

This function lets you define and register new blueprints for how AI agents communicate and share information – we call these blueprints Model Context Protocols or MCPs. Think of it as adding a new language or a structured way for your agents to talk to each other. You provide a schema, which outlines the format and rules for this communication, and the system stores it for later use. This allows your swarm of agents to share context and collaborate more effectively.

## Function addEmbedding

This function lets you add a new way for the AI agents in the swarm to understand and work with text or data as numerical vectors. Think of it as teaching the swarm a new language for comparing and relating different pieces of information. You provide a description of how this new embedding method works, and the swarm will then recognize and use it for various tasks like finding similar content or creating representations of data. Only embedding methods registered this way are recognized by the swarm, and registering them is done in a controlled way to avoid conflicts. You’re given the name of the new embedding method as confirmation that it's been successfully added.

## Function addCompute

This function lets you register and manage different types of computations your AI agent swarm can perform. Think of it as defining what tasks your agents are capable of. 

You provide a schema describing the computation – its inputs, outputs, and any specific requirements – and the function ensures it's valid and adds it to the system. It's how you tell the framework what kinds of work your agents can do and how they should do it. You can even update existing computations this way.

## Function addCompletion

This function lets you add a new tool for generating text, like connecting to a specific AI model or using a custom script, into the system. Think of it as registering a new "completion engine" that your AI agents can use. By providing a schema, you define how the engine works and what it needs. This makes the engine accessible to all the agents in the swarm, allowing them to use it for tasks that involve generating text. The process is designed to run independently, ensuring a reliable and clean setup. Finally, the function confirms the addition by returning the name of the newly registered completion engine.

## Function addAgentNavigation

This function lets you create a special tool that allows one AI agent to be directed to another. Think of it as setting up a pathway or connection between agents, allowing them to interact based on your defined rules. You provide a configuration object with details about how this navigation should work, and the function returns a unique identifier for this newly created navigation tool. This identifier can then be used to manage or refer to this connection later on.

## Function addAgent

This function lets you register a new agent so it can be used within the swarm system. Think of it as adding an agent to a list of available tools. Once registered, the agent becomes eligible to participate in swarm tasks. It's important to use this function to add any agent you want the swarm to use; unregistered agents won’t work. The process is handled in a special way to keep things clean and consistent.  The function returns the name of the agent you’re adding. You provide a schema definition that describes how the agent works.

## Function addAdvisor

This function lets you define and register a new "advisor" – essentially, a specialized AI agent – into the swarm orchestration system. You provide a schema describing what this advisor does and how it operates. The function then adds this advisor to the system, allowing it to participate in tasks and be managed alongside other agents. It returns a unique identifier for the newly added advisor, useful for referencing it later. Think of it as onboarding a new expert into your AI team.

# agent-swarm-kit classes

## Class ToolValidationService

The ToolValidationService helps ensure that the tools used by your AI agents are properly configured and unique within the system. It acts as a central registry for tools, keeping track of their definitions. 

When a new tool is added, this service registers it and makes sure it doesn't already exist.  When an agent tries to use a tool, the validation service checks to confirm it’s a valid and registered tool. This helps prevent errors and keeps things running smoothly. The service also keeps a record of validation operations and any issues that arise.

## Class ToolSchemaService

The ToolSchemaService acts as a central place to define and manage the tools that agents in the swarm system use. It’s responsible for keeping track of these tools, making sure they're set up correctly, and providing them to different parts of the system.

Think of it like a library of pre-defined actions agents can take. Before an agent can use a tool, it needs to be registered with this service. The service checks that the tool definition is reasonably valid. 

This service works closely with other parts of the swarm system, like the agent connection service and the agent schema service, making sure agents have the right tools available when they need them. It also keeps a record of those tools for debugging and monitoring purposes, logging information about tool registration, retrieval, and updates when enabled. The tools are stored using a registry, allowing for quick access when needed. You can also replace existing tools with new ones.

## Class ToolAbortController

ToolAbortController is a helper class designed to make it easier to control and manage abort signals for tasks that might take some time to complete, like fetching data or running a complex calculation. It essentially gives you a way to tell those long-running processes to stop early if needed.

Inside, it uses the standard `AbortController` which might not be available everywhere, so it gracefully handles situations where that's not present.

You can use its `abort` method to send a signal that says “stop what you’re doing.” If something is already running, this will let it know it's time to shut down.

## Class SwarmValidationService

The SwarmValidationService acts as a central authority for ensuring the configurations of your AI agent swarms are correct and consistent. It keeps track of all registered swarms and their associated details like agent lists and policies.

Think of it as a gatekeeper: it makes sure each swarm is properly defined and that its agents and policies are valid before they're put into action. It works closely with other services to handle agent and policy validation, manage swarm registrations, and track operational status. 

You can use it to register new swarms, retrieve lists of agents and policies for a specific swarm, and most importantly, validate entire swarm configurations to prevent errors and maintain a reliable system. The service is designed to be efficient, remembering previous validation results to avoid redundant checks.

## Class SwarmSchemaService

The SwarmSchemaService is like a central library for managing the blueprints of your AI agent swarms. It keeps track of these blueprints (called swarm schemas) so everyone knows how the swarm should be set up – things like which agents are involved, what their names are, and what policies they follow.

It makes sure these blueprints are reasonably correct before they're used, and it logs its actions to help with troubleshooting. This service works closely with other parts of the system, helping to connect agents, manage sessions, and provide a public API for the swarm.

Think of it as a foundational building block for creating and coordinating your AI agent swarms. You can register new swarm setups, get existing ones, or even update them, all while knowing that the system is keeping an eye on their integrity.

## Class SwarmPublicService

This class provides a public interface for interacting with a swarm of AI agents. Think of it as the main way external components talk to the swarm, ensuring that all actions are tracked and scoped to a specific client and swarm. It acts as a middleman, handling requests like controlling output, managing agents, and cleaning up the swarm when it’s done.

It relies on other services like a logger for tracking activity, and a core swarm connection service to handle the actual operations.  Many functions include features for scoping actions to clients and swarms, and logging activity.

Key features include:

*   **Output Management:**  You can cancel pending output or wait for results from the swarm.
*   **Agent Control:** Functions for getting agent information (name, instance), setting the current agent, and setting agent references.
*   **Swarm Status:** Check if the swarm is busy processing something, and set its busy state.
*   **Cleanup:**  A `dispose` method to properly shut down the swarm and release resources.

Essentially, this class makes it safe and organized to work with the AI agent swarm.

## Class SwarmMetaService

The SwarmMetaService is responsible for organizing and presenting information about your agent swarms in a clear, visual way. It takes the data describing your swarms and transforms it into a standard UML diagram format.

Think of it as a translator – it converts complex swarm definitions into a visual map that's easy to understand and debug. It works closely with other services like the AgentMetaService (for defining agents) and the SwarmSchemaService (for the overall swarm structure).

This service also helps with system documentation by allowing you to generate UML diagrams, which are helpful for understanding the relationships and structure of your swarms. The process includes logging, which can be enabled for more detailed insights into how these diagrams are created.

## Class SwarmConnectionService

This service manages how different agents work together within a swarm environment. Think of it as a central hub for accessing and controlling a group of AI agents acting as a unit.

It intelligently reuses existing agent groups to keep things efficient, caching them based on client and swarm identifiers.  It’s built to interact with other services like agent management, session linking, and performance tracking. Logging is enabled for debugging but can be controlled.

Here's a breakdown of what you can do with it:

*   **Get a Swarm:** The main way to interact.  It fetches or creates a group of agents, configured for a specific client and swarm name.
*   **Send Messages:** It allows you to send messages to the active session, useful for asynchronous communication with the agents.
*   **Navigate:** You can pop agents off a navigation stack, essentially moving between different agent sequences.
*   **Check Status:** See if the swarm is currently busy processing something.
*   **Control Output:** Set the swarm as busy, cancel pending output, wait for output from an agent, and retrieve the agent's name or the agent itself.
*   **Manage Agents:**  You can also set the active agent, or add new agents dynamically.
*   **Clean Up:**  Finally, you can dispose of the swarm connection to free up resources.

## Class StorageValidationService

This service helps ensure that the storage systems within the agent swarm are set up correctly and consistently. It keeps track of all registered storage systems, making sure each one is unique and has a valid configuration for its embeddings. 

When a new storage system is added, this service registers it and verifies its setup.  To improve performance, validation checks are cached, so they don't need to be repeated unnecessarily. The service relies on other parts of the system, like those that manage storage registration and embedding validation, and it uses logging to keep track of what’s happening.

## Class StorageUtils

This class helps manage how information is stored and accessed for different clients and agents within the swarm. It acts as a central point for interacting with the swarm's storage, making sure that only authorized agents can access the correct data.

Here's a breakdown of what it does:

*   **Retrieves Data:** You can fetch a specific number of items based on a search query, or retrieve a single item by its ID.
*   **Updates and Inserts:** Allows you to add new items or update existing ones in storage.
*   **Deletes Data:** Removes items from storage based on their ID.
*   **Lists Items:** Provides a way to view all items in a specific storage area, with the option to filter them.
*   **Creates Indexes:** Generates numeric identifiers for efficient storage management.
*   **Clears Storage:** Removes all data from a specific storage area.

Before any action is taken, the system verifies that the client is authorized and that the agent has permission to access the requested storage. This ensures data security and integrity within the swarm.

## Class StorageSchemaService

The StorageSchemaService is responsible for managing the blueprints for how your AI agents store and access data within the swarm system. Think of it as a central library of storage configurations. It ensures these configurations are valid and consistent, making it easier for different parts of the system to work together.

It uses a specialized registry to hold these storage blueprints, and integrates closely with other services that handle storage connections, embeddings, agent configurations, and public APIs. The service keeps track of operations through logging.

You can register new storage blueprints, retrieve existing ones, and even update existing blueprints if needed. It's a foundational piece for setting up how client-specific and shared storage instances operate in your AI agent swarm.



The `loggerService` property allows logging of operations, and `schemaContextService` manages schema-related context. The `_registry` is where the storage schemas are actually stored. The `validateShallow` method does a quick check to ensure new storage configurations are structurally sound. `register` adds new schemas, `override` updates existing ones, and `get` retrieves them.

## Class StoragePublicService

This service handles storage operations specifically tied to individual clients within the swarm system. Think of it as a way to keep each client's data separate and organized.

It works closely with other services like logging, performance tracking, and documentation, ensuring everything is well-managed and traceable. If you need to retrieve, add, update, or delete data associated with a particular client's storage, this is the place to do it.

The service uses injected dependencies for logging and the underlying storage connection, making it flexible and maintainable. Key functions include getting lists of items, adding or updating data, removing items, listing all items, clearing all data, and disposing of the storage. Every interaction is carefully tracked and scoped to the individual client.  This contrasts with system-wide storage handled by a different service.

## Class StorageConnectionService

This service manages connections to storage locations within the system, ensuring efficient access and lifecycle management. It acts as a central point for retrieving and creating storage instances, caching them to avoid repetitive setups. 

The service cleverly handles both client-specific and shared storage, with delegation to a separate service for the latter. It relies on several other services for things like logging, event handling, and security validation, integrating neatly with the overall system. 

Key functions include:

*   **getStorage:** This is the primary way to access a storage location; it creates a cached connection if one doesn't exist.
*   **take, upsert, remove, get, list, clear:** These functions provide standard storage operations, like retrieving data, adding new items, and cleaning out the entire store.
*   **dispose:**  This method cleans up the connection, ensuring resources are freed and the system stays tidy. 

The service is designed to work closely with various components, providing a consistent and efficient way to interact with storage.

## Class StateValidationService

The StateValidationService helps ensure that the data your AI agents are working with is in the expected format. Think of it as a data quality checker for your swarm. 

You start by defining the structure of different data states – like what fields are required and their types – using the `addState` function. Then, when you have data you want to use, the `validate` function will check if it matches the defined structure. 

It relies on a logging service (`loggerService`) for reporting any issues, and internally keeps track of defined states in a map (`_stateMap`). Essentially, this service helps catch errors early and prevents agents from processing invalid data.

## Class StateUtils

This class helps manage the data associated with each client and agent within the swarm. Think of it as a central place to get, update, and reset specific pieces of information related to a client's interaction with an agent. 

You can use it to retrieve existing data, update it directly or based on what already exists, and completely reset it when needed. Before any of these actions, it checks to make sure everything is properly set up and logged for tracking.

## Class StateSchemaService

The StateSchemaService acts as a central hub for managing how different parts of the system understand and interact with data, defining the structure and rules for accessing state information. It keeps track of these "state schemas," essentially blueprints for data, ensuring consistency across the entire swarm.

Think of it as a librarian, carefully cataloging and providing access to different data formats. When a new data format needs to be added or an existing one needs to be updated, this service handles the registration and management, making sure everything stays organized.

It works closely with other services: It gets help from a logging service to keep track of what’s happening, a schema context service to manage schema-related operations, and it provides schemas to services responsible for connecting to and using that data. The service checks that schemas meet basic requirements, and logs those checks for debugging purposes.

You can register new state schemas, replace existing ones, or simply retrieve them when needed, all with the goal of ensuring the entire swarm operates correctly and efficiently with consistent data structures.

## Class StatePublicService

This class manages state specifically for each client interacting with the swarm system. Think of it as a way to keep track of what each client is doing and what data they're using, separate from system-wide settings or persistent storage.

It works closely with other services like ClientAgent, PerfService, and DocService to handle client-specific data, and it keeps detailed logs of state changes when logging is enabled.

Here's a breakdown of what you can do with it:

*   **Set State:** You can update a client's state using a provided function.
*   **Clear State:** Reset a client's state back to its initial value.
*   **Get State:** Retrieve the current state for a client.
*   **Dispose:** Clean up resources associated with a client's state when they're finished.

Essentially, this class provides a controlled and logged way to manage data tied to individual clients within the swarm.

## Class StateConnectionService

The StateConnectionService is a central hub for managing state within the swarm system. Think of it as the place where individual agents store and interact with their specific data.

It’s designed to be efficient, using caching to avoid repeatedly creating the same state instances. This service intelligently handles both client-specific and shared state, delegating shared states to a separate service to avoid unnecessary cleanup.

Several other services work closely with StateConnectionService, including logging, event handling, configuration, usage tracking, and session validation. It ensures state updates are handled safely and predictably, especially when multiple agents are accessing the same data.

Here's a breakdown of its key functions:

*   **Retrieving and Creating States:** It gets or creates a state for a specific client and state name, using caching for speed.
*   **Setting States:** It updates the state using a provided function, making sure changes are applied correctly.
*   **Clearing States:** Resets the state to its initial value.
*   **Getting Current State:** Provides a way to access the current state.
*   **Releasing Resources:** Properly cleans up and releases resources when a state is no longer needed.

Essentially, StateConnectionService streamlines how agents manage and interact with their data in a coordinated and reliable way.

## Class SharedStorageUtils

This class provides helpful tools for working with shared storage used by your agent swarm. It allows agents to easily fetch, add, update, and remove data from a central storage area.

You can retrieve a batch of items based on a search query, insert or update existing data, or completely remove individual items by their unique ID. The class also lets you list all items in a storage area, potentially applying filters to narrow down the results, or even clear the entire storage.  Each operation is handled carefully, making sure the storage name being used is valid and providing useful logging.

## Class SharedStoragePublicService

This class manages how different parts of the system interact with shared storage. It acts as a public interface, handling requests like retrieving, adding, updating, and deleting data. Think of it as a controlled access point to the shared storage, ensuring operations are logged and scoped correctly.

It relies on other services – a logger for tracking activity and a connection service for the actual storage operations. Different components, such as agents, performance trackers, and documentation tools, use this class to interact with shared storage in a consistent and manageable way.

Here's a breakdown of what you can do with it:

*   **Retrieve data:** You can search for specific items or list all items within a storage area, optionally filtering the results.
*   **Add or update data:** Easily store new data or modify existing information.
*   **Remove data:** Delete specific items or clear out the entire storage area.
*   **Logging:** Operations are logged for auditing and troubleshooting purposes, controlled by a system configuration.



Essentially, this class provides a secure and transparent way for various parts of the system to work with shared storage, promoting stability and easier maintenance.

## Class SharedStorageConnectionService

This service manages shared storage for the swarm system, acting as a central point for data access and modification. Think of it as a shared whiteboard where all the agents in your swarm can read and write information.

It's designed to ensure that only one shared storage instance exists for each storage name, preventing conflicts and data inconsistencies. It cleverly uses caching to optimize performance.

Several other services work together with this one – they handle things like logging, event management, and schema configuration.

Here's a breakdown of what you can do with it:

*   **`getStorage`**:  Fetches or creates a connection to the shared storage, using a specified name. This connection is cached to avoid creating multiple connections.
*   **`take`**: Searches the shared storage and retrieves a list of matching data items. It can also perform similarity searches if embedding functionality is enabled.
*   **`upsert`**: Adds new data to the shared storage or updates existing data.
*   **`remove`**: Deletes an item from the shared storage.
*   **`get`**: Retrieves a specific item from the storage.
*   **`list`**: Retrieves a list of all items in the storage, potentially filtered by criteria.
*   **`clear`**: Empties the entire shared storage.

## Class SharedStateUtils

This class helps your AI agents share information and coordinate their actions within a swarm. It offers simple ways to access, update, and reset shared data, like a central whiteboard for the agents. 

You can retrieve existing shared data using `getState`, providing the name of the data you're looking for. To update the shared information, `setState` allows you to either directly provide the new value or, for more complex updates, provide a function that calculates the new state based on what's already there. If you need to completely reset a piece of shared data, `clearState` brings it back to its starting point. Each of these operations happens within a controlled environment to ensure proper tracking and communication with the swarm's shared state service.

## Class SharedStatePublicService

This class provides a way to manage shared data across your AI agent swarm. Think of it as a central repository where different agents can read and write information, allowing them to coordinate and work together. It handles the underlying complexities of storing and retrieving this data, presenting a simplified interface for agents to use.

It uses a logging system to track operations and integrates with other components in the system to ensure consistency and performance. You can use it to update the shared state with custom logic, reset it to its original value, or simply get the current value. This class is designed to be flexible, allowing it to adapt to various agent needs and workflows within your swarm.

## Class SharedStateConnectionService

This class is like a central hub for managing shared information across different parts of your AI agent system. Think of it as a place where agents can reliably access and update the same data, ensuring everyone's on the same page.

It's designed to handle state – data that changes over time – and make sure that changes are handled safely and efficiently. It keeps track of this shared data, and caches it so it doesn’t have to be re-created unnecessarily. 

When an agent needs to read or write this shared data, this class acts as the go-between, coordinating the process and ensuring consistency. It also logs important events and integrates with other parts of the system, like the logging and event handling mechanisms. It's built to be reliable, keeping the agents synchronized and operating as a cohesive swarm.

## Class SharedComputeUtils

This framework provides tools for managing and interacting with computational resources used by AI agents. The `SharedComputeUtils` class helps you retrieve information about specific compute instances and refresh their status. You can use it to get data associated with a compute resource, like its configuration or available memory, and to ensure the system is up-to-date on its current state. The `update` function will refresh the status of a compute instance, while `getComputeData` lets you fetch the data you need, allowing you to tailor the data type you're looking for.

## Class SharedComputePublicService

This service helps coordinate and manage shared computing resources, allowing for context-aware execution of tasks. It relies on injected services for logging and handling the underlying compute connections. 

You can use this service to retrieve previously calculated data, trigger recalculations of shared computations when needed, or force an update of the shared compute resource. It's designed to streamline operations and ensure that computations are performed with the right context and data.

## Class SharedComputeConnectionService

This class, `SharedComputeConnectionService`, is designed to manage connections and calculations within a system of AI agents. It handles retrieving and updating computed data, essentially acting as a central point for coordinating shared computations across multiple agents.

It utilizes several internal services – a logger, a messaging bus, a method context service, a shared state connection service, and a compute schema service – to facilitate this coordination. 

The `getComputeRef` property lets you retrieve a reference to a specific compute resource, while `getComputeData` fetches the result of that computation.  You can trigger a new calculation with `calculate`, specifying the state it should operate on. Finally, the `update` method allows for refreshing or recalculating the shared compute data.

## Class SessionValidationService

This service acts as a central point for managing and validating sessions within the AI agent swarm system. It keeps track of which resources (like agents, storage, states, and computes) are being used by each session, making sure everything is consistent. Think of it as the system's way of keeping tabs on all the active sessions and what they're doing.

It works closely with other services like the session management service and various client services (agent, storage, state) to create, track, and clean up sessions.  It's designed to be efficient, using caching to speed up checks and logging to keep a record of all actions.

Here’s a breakdown of what it does:

*   **Session Tracking:** It registers new sessions, associating them with swarms, modes, and various resources.
*   **Resource Management:** It diligently tracks what agents, storages, states, and computes are being utilized by each session.
*   **Validation:** It checks if a session exists and is valid before allowing certain actions.
*   **Cleanup:** It facilitates the removal of sessions and associated resources, while also providing a way to clear cached validation data.
*   **Logging:** It logs key operations for auditing and debugging.



Essentially, it’s the system's reliable way of ensuring sessions are properly managed, resources are used correctly, and everything stays in sync.

## Class SessionPublicService

This class manages how external clients interact with the AI agent swarm sessions. Think of it as the public-facing interface for session-related activities. It handles sending messages, executing commands, and tracking performance, all while ensuring proper context and logging. 

Here's a breakdown of what it does:

*   **Messaging:** It allows you to send messages to a session (`notify`, `emit`), execute commands (`execute`, `run`), and commit different types of messages to the session history (user messages, assistant responses, tool requests, developer messages, system messages).
*   **Connections:** It establishes and manages connections to sessions with performance tracking (`connect`).
*   **Control:** It lets you control the session, like stopping tool execution (`commitStopTools`), flushing the history (`commitFlush`), and properly disposing of the session (`dispose`).
*   **Validation:** It ensures safe tool usage by preventing recursive calls via `executionValidationService` and `navigationValidationService`.



Essentially, it’s a gateway for clients to participate in and control AI agent conversations, making sure everything is logged, tracked, and executed safely.

## Class SessionConnectionService

This service acts as the central hub for managing connections and operations within a swarm system. Think of it as the control panel for individual sessions – a way to create, reuse, and coordinate tasks happening within a specific client and swarm environment.

It efficiently reuses session instances by caching them, reducing overhead and improving performance.  It leverages various connected services like logging, event handling, and security policies to ensure proper operation.

The core function, `getSession`, handles creating or retrieving a session, configuring it with essential data like security policies and swarm information. Other functions offer specific actions: sending notifications, emitting messages, executing commands, and committing different types of messages (user, assistant, tool-related) to the session’s history.  There's also a `connect` function for establishing communication channels and a `dispose` function to clean up and release resources when a session is finished. Essentially, it's responsible for setting up, managing, and cleaning up individual working spaces within a larger swarm system.

## Class SchemaUtils

This class provides helpful tools for working with data associated with client sessions and for preparing data for transmission. You can use it to store information related to a specific client's session, ensuring that your system can remember details about their interactions. It also provides a method to convert objects into strings, which is useful for sending data between different parts of your application or system. When storing or retrieving information, the system makes sure that the client session is valid and keeps track of what’s happening for debugging.

## Class RoundRobin

This component provides a simple way to distribute tasks among a set of different agents or functions. It works like a rotating schedule, ensuring each agent gets a turn. 

You configure it with a list of "tokens" – identifiers that tell it which agent to use next. The `create` method helps you easily set up this rotating distribution, taking those tokens and a function that builds the agents. 

Internally, it keeps track of which agent is currently active and cycles through them as tasks are assigned. It also logs some details about the process to help with debugging or monitoring.

## Class PolicyValidationService

The PolicyValidationService helps keep track of and verify the policies used within the agent swarm. It acts like a central registry for policies, ensuring each one is unique and exists before they're used. 

This service works closely with other components: it gets its logging information from the LoggerService, relies on the PolicySchemaService for registering new policies, and supports the ClientPolicy's enforcement process. It's designed for efficiency, using memoization to speed up validation checks.

You can add new policies to the registry using the `addPolicy` function. The `validate` function then checks if a policy exists, ensuring things run smoothly. The entire system uses dependency injection for logging, making it flexible and maintainable.

## Class PolicyUtils

This class helps manage client bans within your AI agent swarm's policies. It provides straightforward methods for banning, unbanning, and checking the ban status of clients. Before taking action, each method carefully verifies the client ID, swarm name, and policy name to ensure accuracy and security. Everything is tracked and logged to give you a clear record of all ban-related operations.

## Class PolicySchemaService

This service manages the rules and constraints applied within the AI agent swarm. Think of it as a central library where all the different policy definitions are stored and kept consistent. It makes sure each policy is valid before it's used, and keeps track of them using a specialized registry. 

It works closely with other services – ensuring client access is controlled, policies are applied during agent execution, and that session-level checks are accurate. You're able to add new policies, update existing ones, and easily retrieve them when needed.  It also keeps a log of these operations, so you can track how policies are being managed. This helps maintain a secure and well-defined environment for your AI agents.

## Class PolicyPublicService

This class manages how policies are applied within the swarm system, providing a public interface for checking bans, validating data, and managing client access. It acts as a middle layer, delegating the actual policy work to another service while adding extra features like logging and context management. 

Here's a breakdown of what it does:

*   **Checking Bans:** It can determine if a client is banned from a specific part of the swarm, and retrieve the reason for the ban.
*   **Data Validation:** It verifies that incoming and outgoing data conform to defined policy rules.
*   **Client Management:** It allows for banning and unbanning clients from specific swarms based on policies.

The service utilizes other components for logging, core policy operations, and ensures operations happen within the correct context. The logging is controlled by a global setting, allowing you to easily turn it on or off. These functions are used by different parts of the system, including performance monitoring and client interaction.

## Class PolicyConnectionService

This class manages how policies are applied and enforced within the swarm system. It acts as a central point for checking ban statuses, validating inputs and outputs, and handling ban operations for clients.

The class relies on several other services for its functionality, including logging, event emission, retrieving policy configurations, and accessing execution context. To improve efficiency, it uses caching to reuse policy instances.

Key functions include:

*   **`getPolicy`**: Retrieves a cached policy definition based on its name.
*   **`hasBan`**: Checks if a client is banned within a specific swarm.
*   **`getBanMessage`**: Provides the reason for a client's ban.
*   **`validateInput` and `validateOutput`**: Checks if incoming and outgoing data complies with policy rules.
*   **`banClient` and `unbanClient`**: Applies or removes ban restrictions on clients.

These functions are designed to integrate with other components of the system like client agents, session services, and public APIs to ensure consistent policy enforcement.

## Class PipelineValidationService

This service helps ensure your AI agent workflows, or "pipelines," are set up correctly before you start running them. It acts as a quality control check, verifying that your pipeline definitions are valid and consistent. 

You can add different pipeline definitions to this service, each describing a specific workflow. Then, when you're ready to use a pipeline, this service can validate it against its defined structure to catch any potential errors early on. It uses a logger to report any issues it finds during validation, making it easier to debug and improve your agent workflows. Essentially, it’s a safeguard to prevent unexpected behavior and ensure your AI agents operate smoothly.

## Class PipelineSchemaService

The `PipelineSchemaService` helps manage and organize the blueprints for your AI agent workflows. Think of it as a central library where you store and retrieve the definitions of how your agents will operate.

It uses a schema context service to ensure your workflow definitions are valid and consistent. 

You can register new workflow blueprints, update existing ones, and easily retrieve them when needed. This service keeps track of all your pipeline schemas, making it simple to build and maintain complex agent orchestrations. The service utilizes a logger for debugging and monitoring purposes.

## Class PersistSwarmUtils

This utility class helps manage how information about your AI agents – like which agent is currently active and the history of agent navigation – is saved and retrieved. It allows you to easily get and set active agents and navigation stacks for specific clients and swarms.  You can think of it as a central place to keep track of agent state.

The class uses factories to handle the underlying storage mechanism, and it's designed to be efficient by ensuring that only one persistence instance is created for each swarm.

You can also customize how this data is persisted by providing your own storage adapters, allowing for options like in-memory storage or alternative backends. This makes it flexible enough for various deployment scenarios. Essentially, it provides a way to remember what agents are doing and where they're going.

## Class PersistStorageUtils

This utility class helps manage how data is saved and retrieved for each user session and storage area within the swarm system. It lets you easily get and set data, and it's designed to reuse storage resources efficiently.

You can configure custom ways to handle the storage persistence, allowing for advanced options like using a database. It provides a straightforward way to access user-specific data, like records or logs, by combining a user identifier with a storage name. When data isn't already saved, it can provide a default value.

## Class PersistStateUtils

This class helps manage how information is saved and retrieved for each individual user session within the swarm system. Think of it as a way to remember things like an agent's progress or specific settings for a particular user.

It lets you store and retrieve data for each user (identified by a unique identifier) and a specific type of information (like agent variables or context).  The system is designed so that only one persistence instance is used for each type of information, making it efficient.

You can even customize how this information is actually stored – using your own methods instead of the default system – to handle things like keeping data in memory or in a database. Essentially, it provides a flexible way to persist and restore state for agents and users.

## Class PersistPolicyUtils

This class offers tools for managing how client ban information is stored and retrieved within the swarm system. It helps keep track of which clients are blocked from participating.

You can use it to check if a client is currently banned from a specific swarm. Conversely, you can set the list of banned clients for a particular policy, ensuring that this information is saved for later use.

The class is designed to be efficient, reusing the same storage mechanism for each swarm to avoid unnecessary resource usage. It also allows for customization – you can plug in your own storage adapter to tailor the persistence behavior to your specific needs, like using an in-memory store or connecting to a database.

## Class PersistMemoryUtils

This class helps manage how memory is saved and retrieved for each client interacting with the swarm. Think of it as a way to remember things about a specific user session.

It provides simple methods to store data for a client, retrieve that data later, and clean up when the data is no longer needed. To make it flexible, you can also customize how the memory is actually persisted – whether it's stored in memory, a database, or somewhere else.

The system automatically keeps track of which memory storage is used for each client, ensuring that resources are used efficiently and avoiding duplication.  Essentially, it handles the behind-the-scenes work of remembering things about individual client sessions.

## Class PersistEmbeddingUtils

This utility class helps manage where and how embedding data is stored within the AI agent swarm. It provides simple ways to both read existing embeddings and save newly computed ones, making sure the system doesn't waste time recalculating the same embeddings over and over. 

The system uses a clever caching mechanism, so it can quickly look up embeddings that have already been created. You can even customize how the system stores embedding data, like using a different database or a simple in-memory store. This provides flexibility for different tracking or storage needs.

## Class PersistAliveUtils

This class helps keep track of whether clients (identified by a `SessionId`) are online or offline within a specific swarm. Think of it as a way to know if each agent is responding.

It provides simple methods to register a client as online or offline, and to quickly check their current status.  The system remembers these statuses so you can rely on them later.

You can even customize how this tracking is done, allowing you to store the online/offline information wherever you need it – whether that's in memory or a database. This gives you a lot of flexibility in managing client availability within your swarm.

## Class PerfService

This class, `PerfService`, is responsible for gathering and organizing performance data related to client sessions within the swarm system. It essentially acts as a performance tracker, collecting information like how long executions take, the size of the data being sent back and forth, and the overall state of the client.

It gets help from other specialized services for things like validating session data, retrieving memory data, and understanding swarm and agent status. The whole process can be logged for debugging, but that's controlled by a global configuration setting. 

You can start and stop tracking individual executions, and the service provides methods for retrieving aggregated performance metrics.  It can output this data into standardized records, making it easy to report on or analyze overall system performance, or the performance of individual clients. Finally, there's a way to completely clear out a client's performance data when it's no longer needed.

## Class OutlineValidationService

The OutlineValidationService helps manage and check the structure of outlines used by the agent swarm. It keeps track of registered outlines, ensuring each one has a unique name and exists before it’s used. 

The service relies on other components – a logger for recording actions, and services for managing completion schemas and validating completion configurations. To avoid unnecessary work, it remembers the results of validation checks.

You can use this service to register new outline structures, get a list of all registered outlines, and most importantly, verify that an outline exists when you need it.

## Class OutlineSchemaService

This service manages outline schemas, which are like blueprints for how agents should structure their work. It allows you to register new schemas, update existing ones, and retrieve them when needed. The system keeps track of these schemas internally and uses a logger to record what’s happening. It also makes sure the schemas being used are valid and contain the required information, like a name and a way to track progress. You can think of it as a central place to define and manage the structures agents follow when working together.

## Class OperatorInstance

This component represents a single agent within a larger swarm, acting as an individual worker. It's given a unique identifier (clientId) and a name (agentName) to distinguish it. 

You can provide optional callback functions to customize how this agent behaves. The `connectAnswer` method allows you to subscribe to answers generated by the agent. The `notify` method is used to send content to the agent, while `answer` sends a direct response.  The agent also has a mechanism (`recieveMessage`) for receiving general messages, and finally, `dispose` gracefully shuts down the agent when it's no longer needed.

## Class NavigationValidationService

This service helps manage how agents move around within the system, making sure they don’t waste time retracing their steps. It keeps track of which agents have already been visited for each client and swarm, preventing unnecessary navigation.

You can inject a logging service to record navigation activities and troubleshoot issues. The core of the service is a function that remembers which agents have been visited, so it can quickly determine whether a new navigation step is needed.

The service also provides ways to clear the navigation history for a specific client and swarm, and to completely remove the navigation tracking when it’s no longer needed. These actions are logged to help you understand what’s happening within the system.

## Class NavigationSchemaService

The NavigationSchemaService helps keep track of which navigation tools are being used within the AI agent swarm. It maintains a list of registered tool names, allowing you to easily check if a particular tool is recognized. When you register a new tool, it's added to this internal list, and the system can optionally log this action for monitoring purposes. Similarly, the `hasTool` method lets you quickly determine if a tool is already registered without needing to search through a larger data structure.

## Class MemorySchemaService

This service manages temporary, in-memory data specific to each session within the swarm system. Think of it as a simple scratchpad for each active session.

It provides basic functions to store, retrieve, and clear data associated with a session, using a key-value store where the key is the session ID.  This isn't persistent storage; the data disappears when the session ends or the data is explicitly cleared.

It works closely with other services, like the session management and agent services, and uses logging to track operations.  It's designed for lightweight, session-specific data that doesn't require a formal schema or persistent storage.

Here’s a breakdown of what it offers:

*   **Storing Data:** You can write data to a session's memory using `writeValue`. This merges the new data with any existing data for that session.
*   **Retrieving Data:** `readValue` lets you get the data associated with a session. If there's nothing stored, it returns an empty object.
*   **Clearing Data:** `dispose` completely removes a session's data from memory.
*   **Checking for Data:** `hasValue` checks if data exists for a specific session.

The service uses a logger to keep track of what’s happening, controlled by a global configuration setting.

## Class MCPValidationService

This class helps you keep track of and check the structure of Model Context Protocols, or MCPs. Think of it as a librarian for your MCP definitions. It lets you register new MCPs and then verifies that a particular MCP exists when you need it. The `addMCP` method adds a new MCP definition, while `validate` confirms that an MCP with a given name is actually registered and ready to use. It also uses a logger to record important actions.

## Class MCPUtils

This class, MCPUtils, helps manage updates to the tools used by clients connected through the Multi-Client Protocol (MCP) system. Think of it as a way to ensure everyone has the latest versions of what they need. You can use it to push updates to all connected clients, or target a single client specifically. It simplifies the process of keeping client tools synchronized.

## Class MCPSchemaService

The MCPSchemaService is responsible for handling and organizing MCP (Model Context Protocol) schemas, which define the structure of information used by AI agents. It lets you register new schemas, update existing ones, and easily retrieve them when needed. Think of it as a central library for your AI agent's understanding of the world. 

It uses a logger to track its actions and relies on a schema context service to manage the environment around those schemas. Internally, it maintains a registry where all the schemas are stored, making it easy to find and manipulate them. The service provides methods to register new schemas, replace parts of existing schemas, and retrieve specific schemas by name.

## Class MCPPublicService

This class provides a way to interact with the Model Context Protocol (MCP) to manage and use AI tools. It lets you list available tools, check if a tool exists, and actually run those tools with specific inputs, all within a defined context for a particular client. The system also allows for updating the tool lists, either for all clients or for a single client, and provides a way to clean up resources when they are no longer needed. This class relies on injected services for logging and handling the underlying MCP communication.

## Class MCPConnectionService

This class manages connections and interactions with Model Context Protocol (MCP) services. It’s responsible for fetching or creating MCP instances, listing available tools, and executing those tools on behalf of clients. 

It relies on other services for logging, communication, and schema management. The `getMCP` function provides a quick way to access an MCP instance; it remembers previously fetched instances to avoid unnecessary re-creation. You can use `listTools` to see what tools are available, and `callTool` to actually run a tool with specific input data. When you're finished, `dispose` cleans up resources and clears cached MCP instances. Updating tool lists is possible globally or for a single client.

## Class LoggerService

The `LoggerService` is responsible for managing and delivering log messages throughout the system. It handles different levels of logging – normal, debug, and informational – and ensures logs are sent to both a system-wide logger and a client-specific logger when available. This allows for detailed troubleshooting alongside overall system monitoring.

It uses services to understand the context of where a log message originates, like the specific method being executed or the current execution flow. You can control which types of logs are generated through configuration settings.

The system allows you to change the main logger at runtime, giving you the flexibility to redirect logs to different destinations for testing or custom setups. This makes it easy to adjust logging behavior without modifying core code.

## Class LoggerInstance

This class helps manage logging specifically for each client within the system. It lets you customize how logs are handled by providing callback functions for different log levels and controlling whether logs appear in the console.

You create a `LoggerInstance` by giving it a unique client ID and optional callbacks. It ensures that certain initialization tasks only happen once. 

The `log`, `debug`, `info`, and `dispose` methods provide straightforward ways to record messages, handle specific debugging information, and properly clean up resources when the logger is no longer needed. Console output is controlled by a global setting.

## Class HistoryPublicService

The HistoryPublicService acts as a central point for interacting with the history of AI agents within the system. It provides a public API to add, retrieve, and manage history entries, while ensuring proper context and logging.

It's built to work with different parts of the system, like the agent interface, the system messaging, performance tracking, and documentation. Essentially, it handles the behind-the-scenes work of managing the history of what agents are doing.

You can use it to:

*   **Add new messages** to an agent's history, associating them with a specific client and method.
*   **Retrieve the most recent message** from an agent’s history.
*   **Convert the history into arrays** - either formatted for the agent to process or as a raw collection of messages.
*   **Clean up an agent’s history** when it’s no longer needed, freeing up resources.

Everything is carefully logged for debugging and monitoring, making sure you have visibility into how the agents are interacting.

## Class HistoryPersistInstance

This class manages the history of messages for an AI agent, keeping track of them both in memory and on disk for persistence. When you create an instance, you provide a client ID and optional callbacks to customize how the history is handled. 

The `waitForInit` method ensures the history is properly set up for a specific agent, loading any existing data from storage. The `iterate` method lets you loop through the history, potentially applying filters and running custom actions on each message.  You can add new messages to the history with `push`, which also saves them permanently.  `pop` retrieves and removes the most recent message. Finally, `dispose` cleans up the history, optionally wiping all data if needed.

## Class HistoryMemoryInstance

This class provides a simple way to keep track of messages within an agent's conversation without saving them permanently. Think of it as a temporary notepad for each agent. 

You create a `HistoryMemoryInstance` for each agent, giving it a unique identifier. It has methods for adding new messages (`push`), removing the most recent message (`pop`), and going through the list of messages (`iterate`).  A special `waitForInit` method ensures everything is set up correctly when the agent starts. When you're finished with an agent's conversation, `dispose` cleans up the memory, optionally clearing all history if needed.  The class also allows for callbacks, so you can be notified when messages are added, removed, or the history is cleared.

## Class HistoryConnectionService

This service manages the history of interactions with individual agents within the system, essentially keeping track of the conversation flow. It's designed to be efficient by caching history data for each agent, avoiding redundant creation.

It works closely with other services to handle logging, event emission, and tracking usage.  It retrieves or creates a history record for a specific client and agent, and provides methods to add messages (`push`), retrieve the last message (`pop`), format the history for the agent's use (`toArrayForAgent`), get the raw history data (`toArrayForRaw`), and clean up resources when no longer needed (`dispose`). The service makes sure the history stays consistent across different parts of the system and helps keep track of how it's being used.

## Class ExecutionValidationService

This service helps manage and validate the execution of tasks within your AI agent swarm. It keeps track of how many times a particular task is being run for a specific client and swarm to prevent issues caused by too many nested executions.

The service uses a memoized system, which means it remembers previous execution counts to avoid redundant calculations. You can retrieve the current execution status for a client and swarm, increment the count when a task runs, decrement it when a task completes, or completely clear the execution count for a client and swarm.  There's also a way to completely remove the stored data about execution counts, ensuring a fresh start. The service relies on other services like a logging service and a session validation service to function correctly.

## Class EmbeddingValidationService

This service keeps track of all the registered embeddings used within the AI agent swarm, making sure each one is unique and correctly defined. It works closely with other services to manage embedding registration, usage in searches, and even agent validation. 

You can add new embeddings to the service's registry, and it will log this action.  The `validate` function checks if a given embedding name is registered, and it does this quickly thanks to a caching mechanism. This helps ensure that searches and other operations using these embeddings are reliable. The entire process is tracked with logging, allowing for easy troubleshooting.

## Class EmbeddingSchemaService

This service acts as a central place to manage how data is represented for similarity searches within the system. Think of it as a library of different "embedding recipes" – each recipe defines how to convert data into a numerical form so that the system can compare it.

It carefully validates these "recipes" to make sure they're complete and usable before adding them to the library. It keeps track of these schemas using a registry, and provides methods for adding new schemas, updating existing ones, and retrieving them when needed.

The service works closely with other parts of the system, like the storage connection service, ensuring that the data representation logic is consistent and reliable. This allows for efficient storage and retrieval of similar data points within the swarm. It logs activity for debugging purposes, but that logging can be turned off.

## Class DocService

The `DocService` class is responsible for creating documentation for your AI agent system, including details about swarms, agents, and their performance. It essentially takes the technical specifications of your agents and turns them into easy-to-understand Markdown files and JSON performance reports.

Think of it as a documentation generator – it automatically writes out documentation for all your agent configurations, making it easier for developers to understand how the system works.

Here's a breakdown of what it does:

*   **Generates Documentation:** It creates Markdown documents that explain swarms (groups of agents), individual agent configurations (including tools, prompts, and storage), and the relationships between them.  It uses UML diagrams to visually represent agent schemas.
*   **Performance Reporting:** It generates JSON files that capture performance data for the entire system and for specific clients (like ClientAgent sessions). This helps with debugging and optimization.
*   **Organized Output:** The generated documentation and performance reports are structured in a well-defined directory system, promoting clarity and easy navigation.
*   **Concurrent Processing:**  It efficiently handles documentation generation by running tasks in parallel using a thread pool.
*   **Logging & Configuration:** The service relies on logging for tracking its actions, and its behavior is controlled by configuration settings.

Essentially, `DocService` is a tool for building and maintaining a well-documented and performant AI agent system.

## Class ComputeValidationService

The ComputeValidationService helps manage and verify the structure and data within different computational units used by the AI agent swarm. It's built with dependencies on logging, state validation, and schema services to ensure everything operates correctly.

Think of it as a central hub where you can register different types of computations, each with its own defined structure. You can add new computational types, get a list of registered ones, and then use the service to check if a specific computation's data matches its expected format. This helps keep the whole system reliable and prevents errors caused by mismatched data. The `_computeMap` property internally holds the registered computations.

## Class ComputeUtils

This class, ComputeUtils, provides tools for managing and retrieving information about computational resources within the agent swarm. Think of it as a helper for checking on the status and details of the "workers" in your system. 

The `update` method lets you refresh the information associated with a specific compute resource, identified by its client ID and name.  

The `getComputeData` method is your way to fetch details about a compute resource; it's flexible, allowing you to specify the type of data you're expecting when you request it.

## Class ComputeSchemaService

The ComputeSchemaService helps manage and organize different schema definitions for your AI agents. It acts as a central place to register, retrieve, and even update these schema blueprints.

Think of it as a library where you store the rules and structure that your agents will follow. This service relies on a logging system to track its actions and a schema context service to handle schema-related tasks. 

You can register new schema definitions with unique keys, allowing you to easily access them later. If a schema already exists, you can modify specific parts of it using the override function. The `get` function allows you to fetch a specific schema by its key.

## Class ComputePublicService

This class provides a way to manage and interact with compute operations, keeping track of context like the method and client involved. It relies on injected services for logging and handling the actual compute connections. 

You can use `getComputeData` to fetch results from a compute process. The `calculate` method is used to re-run computations, while `update` forces a refresh of the compute instance. Finally, `dispose` handles cleaning up resources when the compute work is finished.

## Class ComputeConnectionService

This component manages connections and computations within the AI agent swarm. It acts as a central hub for retrieving and updating computed data, utilizing various services like logging, messaging, and schema management to orchestrate the process. The `getComputeRef` function provides a way to obtain references to specific computations, while `getComputeData` allows you to fetch the results. The `calculate` and `update` functions trigger the computation process, and `dispose` cleans up resources when the connection is no longer needed. Essentially, it’s the machinery that makes sure computations happen and data is accessible within the larger system.

## Class CompletionValidationService

This service helps ensure that completion names used within the AI agent swarm are unique and properly registered. It keeps track of all valid completion names and verifies that any completion name being used is actually one that’s been officially recognized.

The service works closely with other parts of the system: it gets information about registered completions from the CompletionSchemaService, checks agent completions using the AgentValidationService, and interacts with clients via the ClientAgent. It also relies on a logger to keep track of its operations.

To make things faster, the validation process is memoized, meaning it remembers previous checks to avoid unnecessary re-validation. The service also utilizes dependency injection for logging, allowing for flexible configuration.

Essentially, it's a gatekeeper for completion names, ensuring consistency and preventing errors within the swarm.

## Class CompletionSchemaService

The CompletionSchemaService manages the completion schemas used by agents in the swarm system. Think of it as a central library where all the logic for completing tasks (like answering a question or generating code) is stored and organized.

It makes sure these completion schemas are valid before they're used, and it’s tightly connected to other parts of the system, such as the agent schema service, client agents, and the services that handle agent connections.

Here's a breakdown of what it does:

*   **Registration:** It registers new completion schemas, making them available for agents to use.
*   **Retrieval:** It provides a way to find and retrieve those schemas when they’re needed.
*   **Validation:** It ensures that the schemas are well-formed and have the necessary components before agents try to use them.
*   **Overriding:** It allows you to update existing schemas with new versions or changes.

It keeps track of everything using a registry and logs important actions to help with debugging and monitoring. This service is crucial for making sure agents have the correct tools and logic to perform their tasks successfully.

## Class ClientSwarm

The `ClientSwarm` manages a group of AI agents working together as a swarm. Think of it as a conductor for a team of agents, handling their interactions and ensuring they work in sync. 

It keeps track of which agent is currently active and manages a history of agent transitions – like a breadcrumb trail for navigation. When you need an agent to perform a task and provide an output, `ClientSwarm` makes sure only one request is handled at a time and that cancellation is handled gracefully.

It provides ways to check if the swarm is busy, emit messages to connected systems, and navigate between agents.  It also allows you to update agent references and handle agent changes.  Finally, there's a way to properly shut down the swarm when it's no longer needed.



It uses internal subjects to broadcast agent changes and output cancellations, allowing other parts of the system to react to these events in real-time.

## Class ClientStorage

This component manages how your AI agents store and retrieve data within the swarm. It's like a central library for your agents, allowing them to share information. It handles storing data, finding similar items based on their descriptions (using embeddings), and ensuring operations happen in a controlled sequence.

Here's a breakdown of what it does:

*   **Storing and Retrieving Data:** It allows agents to add, update, delete, and find data.
*   **Similarity Search:** It can quickly locate items that are similar to a given search term. This is useful for finding related information.
*   **Queueing Operations:** Changes to the data are put in a queue to be processed one at a time, which prevents conflicts when multiple agents are working with the same data.
*   **Event-Driven Updates:**  It notifies other parts of the system when data changes, making sure everyone is kept in the loop.
*   **Embedding Support:** Uses embeddings to represent data in a way that allows for efficient similarity searches.

When you need to add, remove, or modify data, this component manages the process, making sure everything happens safely and in the right order, while also keeping other parts of the system informed about changes. It helps agents efficiently share and work with data.

## Class ClientState

The ClientState class is the core of how individual clients manage their data within the larger swarm system. It's designed to handle state changes, like reading and writing data, in a controlled and reliable way.

Think of it as a central hub for a client’s specific information.  It keeps track of all changes to that data and provides a safe and organized way for different parts of the system to interact with it.

The ClientState manages the actual data, and it's set up to work closely with other components to ensure everything stays synchronized. It provides notifications when the data changes, allowing other parts of the system to react accordingly.  You can use it to reactively monitor when something in the state is modified.

When you need to update or retrieve data, ClientState makes sure the operation is handled correctly, even if multiple clients are trying to access it at the same time. It also makes sure the system knows when a client is finished using its data, so resources can be released properly.


## Class ClientSession

The `ClientSession` manages interactions within the AI agent swarm, acting as a central point for handling messages, executing tasks, and tracking the session's history. Think of it as a dedicated workspace for a client interacting with the swarm.

When you send a message, the `execute` method uses the swarm's agents to process it, checking against defined rules (ClientPolicy) to ensure it's valid. You can also send messages that are handled differently; `run` executes them quickly without validation or emission, while `emit` sends them to other listeners.

The system provides various commit methods to record actions within the session.  These are used to log user messages, tool output, system updates, and even developer notes, providing a complete history of the interaction. These commits are vital for understanding the session’s flow and debugging purposes.

For real-time interaction, the `connect` method allows the session to subscribe to messages, seamlessly receiving updates and sending commands to the swarm. Finally, when the session is finished, `dispose` handles cleanup.

## Class ClientPolicy

The `ClientPolicy` class acts as a gatekeeper for your AI agent swarm, managing who can participate and what they can do. It defines rules and restrictions for individual clients connecting to a swarm, like limiting access or validating messages. 

Think of it as a customizable security system. It keeps track of banned clients, allowing you to easily prevent unwanted connections. It can automatically ban clients if they violate your rules, and provides helpful error messages to guide them. 

This class works closely with other parts of your system, like the connection service, agent, and event bus, to enforce those rules and keep things running smoothly. It’s designed to be flexible, allowing you to customize how clients are validated and managed, ensuring your swarm operates securely and in compliance with your desired policies.  The list of banned clients is loaded only when needed, making the system efficient.

## Class ClientOperator

The `ClientOperator` acts as a bridge for interacting with an AI agent swarm. It's designed to handle the flow of information and commands, allowing you to control and monitor the agent's activities.

You initialize it with specific parameters to configure its behavior. The `run` method isn’t currently functional, and several methods like `commitToolOutput`, `commitSystemMessage`, `commitAssistantMessage`, `commitFlush`, and `commitStopTools` are also marked as unsupported, indicating they are not yet implemented.

Key functionalities include `execute`, which sends input to the agent with a specified mode, and `waitForOutput`, which waits for a response within a timeout period. The `commitDeveloperMessage` method lets you send custom messages for debugging or monitoring. You can also use `commitUserMessage` and `commitAssistantMessage` to manage communication with the user and agent, respectively.  Finally, `commitAgentChange` signals a change in the agent configuration, and `dispose` cleans up resources when you're finished with the operator.

## Class ClientMCP

This class helps manage the tools available to different AI agents within a swarm. It acts as a central point for retrieving, checking for, and calling tools. Think of it as a librarian for tools, ensuring each agent has access to the right ones.

You can use it to get a list of all tools an agent can use, or to quickly check if a specific tool is available to them. If the list of tools changes, the class can refresh the available tools for a specific agent or for the entire swarm.

When an agent needs to use a tool, this class handles the call, passing along the required information. When an agent is no longer needed, resources associated with it are cleaned up.

## Class ClientHistory

The ClientHistory class manages a client agent's message history within the swarm system. It keeps track of all messages, allowing them to be retrieved, filtered, and used for tasks like generating completions.

When a new message arrives, the `push` method adds it to the history and informs the rest of the system. If you need to undo the most recent action, `pop` removes and returns the last message. 

To get all the raw messages, use `toArrayForRaw`. For creating a set of messages suitable for an agent's context, `toArrayForAgent` filters and prepares the messages based on predefined rules and agent-specific configurations. This method helps ensure the agent has the right information for tasks like generating responses.

Finally, `dispose` cleans up and releases resources when the agent is no longer needed, ensuring efficient resource management across the swarm.

## Class ClientCompute

This component handles the client-side logic for running calculations and keeping track of their state. It's designed to manage computations, subscribe to changes, and handle the lifecycle of those calculations. 

When you need to re-run a calculation, you can trigger it based on a specific state change or force an update manually. The component efficiently caches computation results to avoid unnecessary recalculations. 

Finally, when the component is no longer needed, a `dispose` function cleans up any resources, unsubscribes from state changes, and runs a final callback function.

## Class ClientAgent

The `ClientAgent` manages how messages are processed within the AI agent swarm. It's responsible for handling incoming messages, executing them, and coordinating tool calls. Think of it as the core engine for an individual agent in the swarm, orchestrating actions and responding to events.

It works with various services to manage things like tool usage, history tracking, and communication within the swarm. Essentially, it takes care of executing instructions and keeping track of everything that happens within an agent's lifecycle.

Here's a breakdown of how it operates:

*   **Message Handling:** When a message comes in, the `ClientAgent` queues it up to prevent conflicts and ensures everything runs smoothly.
*   **Tool Coordination:** It resolves available tools and manages their execution, controlling their start and stop.
*   **State Management:** It uses `Subject` objects to track important events, like tool errors or agent changes.
*   **Error Recovery:**  If something goes wrong, the agent attempts to recover automatically, potentially trying different strategies (like re-attempting or flushing history).
*   **Communication:** It can broadcast agent outputs and receive system messages, enabling it to interact with other agents or the broader system.

The agent's lifecycle is managed through several methods, allowing for actions like flushing history, signaling changes, and ultimately disposing of the agent when it's no longer needed. It's a crucial component for ensuring consistent and reliable behavior within the AI agent swarm.

## Class ChatUtils

The `ChatUtils` class helps manage and control chat sessions for different clients within a swarm of AI agents. It's responsible for creating, sending messages to, and cleaning up chat instances.

You can think of it as a central hub for orchestrating conversations between clients and the agent swarm. It lets you start new chats, send messages to existing chats, and properly end those chats when they’re finished.

The class offers ways to customize how chat instances are created and how they behave by allowing you to specify a chat instance constructor and callback functions. It also provides a mechanism to listen for events when a chat instance is being disposed, allowing you to react accordingly. Essentially, it's the engine that powers the chat functionality within your AI agent swarm system.

## Class ChatInstance

The `ChatInstance` represents an individual chat session within an AI agent swarm. It's given a unique identifier (`clientId`) and is associated with a specific swarm (`swarmName`). The `onDispose` function is critical for managing the lifecycle of this chat instance, ensuring proper cleanup when it's no longer needed. You can also provide custom callbacks to tailor how the chat instance behaves.

The `checkLastActivity` method verifies if the chat has been active recently, which is useful for automatically ending inactive sessions. To start a new chat, use `beginChat`. Sending a message to the chat is done through the `sendMessage` method, which returns the response. When you're finished with the chat, `dispose` cleans up resources. Finally, `listenDispose` allows you to register a function that will be called when the chat session is terminated.

## Class BusService

The `BusService` acts as the central messaging system for the AI agent swarm. It’s responsible for making sure different parts of the system can communicate with each other via events.

Think of it as a post office – it handles sending and receiving messages (events) between different agents. You can subscribe to specific types of events, and the system will automatically notify you when those events occur.  It also allows for broadcasting events to all subscribers, or just a specific client.

Here’s a breakdown of what it does:

*   **Event Handling:** Allows different parts of the system (like ClientAgents and PerfService) to listen for and respond to specific events.
*   **Subscription Management:** You can subscribe to events and the system keeps track of who wants to hear what. There's also support for "wildcard" subscriptions, which means you can subscribe to events for *any* client.
*   **Session Validation:**  It makes sure events are only sent to clients that are still active.
*   **Performance Tracking:**  It integrates with other services to track performance and log important details about events.
*   **Convenience Methods:** Provides shortcuts like `commitExecutionBegin` and `commitExecutionEnd` for common event types.
*   **Cleanup:**  Handles unsubscribing from events when a client disconnects to avoid clutter.



Essentially, the `BusService` is the backbone for reliable and structured communication within the swarm.

## Class AliveService

The `AliveService` class helps keep track of which clients are currently active within your AI agent swarms. It provides simple ways to register a client as online or offline, associating them with a particular swarm. When enabled, the service also remembers these online/offline states even if the system restarts, thanks to its interaction with a persistence adapter. Think of it as a heartbeat monitor for your agents, allowing you to understand which ones are ready to participate. The `markOnline` and `markOffline` methods are the primary tools for updating this status, and logging helps you monitor these changes.

## Class AgentValidationService

This service acts as a central point for making sure all the agents in your swarm are properly configured and working together correctly. Think of it as a quality control system for your agents.

It keeps track of each agent's details and dependencies, and offers ways to check what storage and state resources an agent is using. You can register new agents, and the service will verify their configurations, and list what resources are tied to each agent. 

It works closely with other services to handle different parts of the validation process, such as checking agent schemas, tool configurations, and storage setups. The service also optimizes performance by remembering the results of previous checks to avoid unnecessary work. Essentially, it's designed to ensure agents are well-defined and consistently validated.

## Class AgentSchemaService

The AgentSchemaService is like a central library for defining how different AI agents within the system work. It holds the blueprints, or schemas, that describe what each agent needs to do, what tools it uses, and how it interacts with the overall system.

Think of it as a registry; it stores and manages these agent blueprints, making them easy to find and use. When you add a new agent blueprint, it’s checked for basic correctness.

The service works closely with other parts of the system, ensuring agents are instantiated correctly, the swarm is configured properly, and clients can run those agents. 

It keeps track of everything using a registry, making sure that the agent schemas are consistent. You can add new schemas, replace existing ones, and easily retrieve them when needed. And, for debugging and monitoring, the service logs important actions.

## Class AgentPublicService

This service acts as the public interface for interacting with agents within the swarm system. It handles common agent operations like creation, execution, and message handling, making them accessible to external clients.

Think of it as a layer on top of the core agent management system, adding extra context and logging for better monitoring and debugging.  It relies on other services for tasks like logging, agent connection, performance tracking, and documentation.

Here’s a breakdown of what it lets you do:

*   **Create Agent References:**  It allows you to get a handle on a specific agent, tied to a client and operation.
*   **Execute Commands:** Run commands on agents with different modes.
*   **Run Stateless Completions:** Perform quick, stateless operations on agents.
*   **Wait for Output:** Retrieve the output from an agent after it completes an operation.
*   **Commit Messages:** Add messages (system, developer, assistant, user) to the agent's conversation history.
*   **Handle Tools:**  Submit tool requests, commit tool output, and stop tool executions.
*   **Manage Agent State:** Flush the agent's history or prevent further tool executions.
*   **Dispose of Agents:** Clean up resources associated with an agent.

Essentially, it simplifies how you work with agents, adding a layer of structure and observability to the process.

## Class AgentMetaService

The AgentMetaService helps manage information about your AI agents and create diagrams to understand how they connect. Think of it as a translator – it takes the technical details of your agents, including their dependencies and states, and transforms them into a visual UML diagram.

This service works closely with other parts of the system, like the AgentSchemaService for getting agent definitions and the DocService for creating documentation. It can build either full, detailed representations of agents or simpler diagrams focusing on their relationships.

Behind the scenes, it uses a logger to record its actions (if logging is enabled) and works with a serialization function to format the data into a standard UML representation that can be displayed visually. You can use it to generate diagrams that help you understand the structure and interactions within your AI agent swarm.

## Class AgentConnectionService

This service manages connections to AI agents within the system, acting as a central hub for creating, running, and tracking their activity. It cleverly reuses agent instances by caching them, making operations more efficient. Think of it as a smart orchestrator that handles the behind-the-scenes work of interacting with individual agents. 

It relies on a variety of other services – like a logger for recording activity, and services for handling history, storage, and configuration – to ensure everything runs smoothly. It gets information and manages dependencies from various services to initialize agents correctly and track usage. 

The core functions let you:

*   **Get an Agent:** Retrieves or creates a cached agent instance, automatically fetching its configuration.
*   **Run Commands:** Executes commands on an agent, either for full responses or quick completions.
*   **Commit Actions:** Records important events like tool usage, developer messages, or changes in the agent's workflow.
*   **Clean Up:** Disposes of agents when they’re no longer needed, freeing up resources.

Essentially, it's the workhorse that makes sure agents are available, functional, and properly managed within the swarm.

## Class AdvisorValidationService

This service helps ensure that your AI advisors are properly set up and configured. It acts like a quality control system, allowing you to register advisor schemas and then verify their existence. 

You can think of it as a way to manage and check the blueprints for each AI agent in your swarm. The `addAdvisor` function lets you register a new advisor's structure, and the `validate` function then checks if that advisor is actually present and conforms to the registered schema. It uses a logging service to keep track of what's happening, allowing for easier debugging and monitoring.

## Class AdvisorSchemaService

The AdvisorSchemaService is responsible for managing and providing access to advisor schema definitions. It uses a logger to track activity and relies on a schema context service to handle schema-related operations like validation and updates.

Think of it as a central registry where you store and retrieve different types of advisor schemas, each identified by a unique key. 

You can register new schema definitions, update existing ones, and easily retrieve them when needed. The service also includes a quick check to ensure new schemas meet basic requirements.

## Class AdapterUtils

The `AdapterUtils` class offers easy ways to connect your AI agent swarm orchestration framework to different AI services. Think of it as a toolbox for plugging in services like Hugging Face, Cortex, Grok, Cohere, OpenAI, LMStudio, and Ollama. 

Each function, like `fromHf` or `fromOpenAI`, creates a special tool that lets your system send requests and receive responses from that particular AI provider. You simply provide the necessary credentials or client objects for each service, and the function handles the communication details so you can focus on orchestrating your agents. This simplifies integrating a variety of AI models into your workflow.

# agent-swarm-kit interfaces

## Interface ValidationResult

This interface describes the outcome of validating arguments passed to a tool. It tells you whether the validation was successful or not. If it was successful, you're given the parsed and validated data. If not, you're provided with a descriptive error message explaining what went wrong. Essentially, it’s a structured way to understand if your tool arguments are correctly formatted and what data you can expect to work with.

## Interface TAbortSignal

This interface helps manage the cancellation of tasks, similar to how you might stop a download in progress. It builds upon the standard web API for aborting operations, providing a way to signal that an action should be stopped. You can think of it as a standard way to tell a process, “Hey, you don’t need to finish anymore.” It's designed to be flexible, so you can easily add your own custom information or features if needed.

## Interface JsonSchema

This describes how to define the structure of data using JSON Schema. Think of it as a way to create blueprints for your data, ensuring it's always in the expected format. 

You can specify the data type, like string or number, and list the specific properties that are required. 

It also allows you to control how strict the validation is, deciding whether extra, unexpected properties are allowed in the data. This framework provides a clear, standardized way to manage data shapes within your AI agent system.

## Interface ITriageNavigationParams

This interface defines the settings you can use to configure how a tool is introduced and managed within the agent swarm. It lets you specify the tool's name, a clear description of what it does, and an optional note for documentation purposes.  You can also provide a function to dynamically control whether the tool is available to specific agents based on factors like client ID or agent name. This gives you fine-grained control over tool access and workflow.

## Interface IToolRequest

This interface defines how agents request a tool be used within the system. Think of it as a structured message telling the swarm "I need this tool to do this, and here's the information it needs." 

It has two main parts: the tool's name – specifying exactly which tool to run – and a set of parameters, which are the inputs the tool needs to operate. The parameters are flexible, allowing you to pass in whatever data the specific tool requires to complete its job. The system will make sure the parameters you provide match what the tool expects.

## Interface IToolCall

This interface describes a request to use a tool within the system. Think of it as a structured way for an AI model to say, "I want to run this specific tool with these specific inputs." Each tool call has a unique ID to keep track of it, a type (currently always "function"), and details about which function to run and what arguments to pass to it. It's how the system connects the AI model's requests to the actual execution of tools.

## Interface ITool

This interface describes what a tool looks like within the agent swarm system. Think of it as a blueprint for defining functions that agents can use. It outlines the tool's type, which is currently limited to "function," and provides detailed information about the function itself – its name, what it does, and the structure of the inputs it expects. This information is crucial for allowing the AI model to understand what actions are available and to correctly format requests to use those tools.

## Interface ISwarmSessionCallbacks

This interface lets you listen in on what’s happening within a swarm session. You can register functions to be notified when a client joins, when a command is run, when a stateless completion runs, when a message is sent, when a session starts, or when a session ends. These callbacks provide opportunities for things like logging, setting up initial configurations, or reacting to events as they occur within the swarm. Essentially, it’s a way to stay informed about the lifecycle and activity of your swarm sessions.

## Interface ISwarmSchema

This interface defines the blueprint for creating and configuring a swarm of AI agents. It lets you specify how the swarm should behave, including whether its navigation history and active agent should be saved. You can also provide descriptions for documentation and set rules for access control.

The interface allows you to customize how the swarm gets its initial navigation path and remembers which agent is currently active. It also gives you the ability to define a default agent to use if none are explicitly set. The interface includes a list of available agents and supports custom lifecycle events through callbacks, enabling you to tailor the swarm's behavior. Finally, each swarm needs a unique name to identify it within the system.

## Interface ISwarmParams

This interface describes the information needed to set up a swarm of AI agents. It includes things like a unique identifier for the system starting the swarm, a way to log activities and errors, a communication channel for the agents to talk to each other, and a list of the agents participating in the swarm, so the system can easily interact with them. Essentially, it’s the blueprint for creating and managing a group of AI agents working together.

## Interface ISwarmDI

This interface acts as a central hub, providing access to all the essential services that power the AI agent swarm orchestration framework. Think of it as a toolbox containing all the different components needed to build, manage, and monitor your AI agents and their interactions.

It organizes everything from documentation and event handling to performance tracking, logging, and managing agent connections.  You’re essentially getting a complete set of utilities for controlling and observing the swarm's behavior, including services for data validation, schema management, and public APIs.  It provides access to various connection and service components – like those for storage, state, policies, compute, and more – all centralized for simplified management and interaction.  This single point of access streamlines development and ensures consistency across the entire system.

## Interface ISwarmConnectionService

This interface helps define how your AI agents connect and communicate within a swarm. Think of it as a blueprint for building the communication layer of your AI swarm. It's designed to ensure that only the necessary, public-facing connection methods are exposed, keeping the internal workings separate and organized. It's a key part of making sure your swarm's connection services are well-defined and reliable.

## Interface ISwarmCallbacks

This interface provides a way to be notified about important events happening within your AI agent swarm. Specifically, you’re alerted when the currently active agent changes. This lets you keep track of which agent is doing what, update your user interface, or handle any other actions that depend on knowing which agent is in control. The callback function provides the ID of the agent, its name, and the name of the swarm it belongs to.

## Interface ISwarm

This interface lets you interact with a group of AI agents working together. You can use it to find out which agent is currently active, get its name, and even retrieve its output. It provides a way to manage the order in which agents are used, allowing you to step back through recent agents or switch to a specific one. You can also cancel ongoing operations and send messages to the swarm's communication channel. Finally, the interface offers tools to monitor and control the swarm's activity, like checking if it’s currently busy and setting that busy status.

## Interface IStorageSchema

This interface describes how storage for your AI agents will work. It lets you customize things like whether data is saved permanently, add helpful descriptions, and control whether the storage is shared between agents. 

You can provide your own functions to fetch and save data, specify which indexing method is used, and give your storage a unique name within the system. There's also the option to add custom lifecycle hooks for storage events, and create functions to define the initial data. Finally, a function is available to generate indexes for each stored item, allowing for efficient searching.

## Interface IStorageParams

This interface defines how your application interacts with the storage system used by the AI agent swarm. It's like a set of instructions for managing and accessing data. 

You'll find options for identifying which client the storage belongs to, and for calculating how similar two pieces of data are.  It also includes functions to save and retrieve previously computed data – this avoids recalculating things repeatedly. You can also create embeddings for new data to be indexed, and connect to logging and event communication systems for monitoring and coordination within the swarm. Finally, it clarifies the name of the storage being used.

## Interface IStorageData

This interface describes the basic information that gets saved when you store something in the system. Every piece of data you save will have a unique identifier, called `id`, which allows you to find and delete it later. Think of it as a key to locate your data within the storage.

## Interface IStorageConnectionService

This interface helps us clearly define how different parts of the system interact with storage connections. It's like a blueprint that ensures the publicly available storage services only expose what's meant to be seen, while keeping internal details hidden. Think of it as a way to keep things organized and secure when dealing with where data is stored.

## Interface IStorageCallbacks

This interface defines a set of optional notification functions you can provide to get informed about what's happening with your data storage. Think of them as hooks that let you respond to events like when data is changed, when a search is performed, or when the storage is being set up or shut down. You can use these callbacks to track changes, manage your application's state, or perform any necessary cleanup procedures. They allow you to monitor and interact with the storage lifecycle in a flexible way.


## Interface IStorage

This interface provides a way to manage and interact with data stored within the agent swarm orchestration framework. You can use it to fetch data based on search terms and a desired number of results, similar to retrieving items using keywords. It also allows you to add new data or update existing entries, ensuring data is kept current. If you need to remove specific data points, the interface offers a method to do so by their unique identifiers. You can also retrieve individual items by their ID or list all stored items, optionally filtering them based on specific criteria. Finally, there's a way to completely erase all data and start fresh.

## Interface IStateSchema

This interface defines how a piece of information, or "state," is managed within the agent swarm system. It outlines the configuration options for each state, allowing you to customize its behavior.

You can decide if a state's data should be saved persistently, add a description to make it easier to understand, and control whether it’s accessible by multiple agents. 

The `getDefaultState` function determines the initial value for the state, while `getState` allows for custom retrieval of the current value.  You can also provide your own function for updating the state using `setState`. Finally, `middlewares` let you insert custom processing steps during state changes, and `callbacks` enable you to react to specific state events.

## Interface IStateParams

This interface defines the information needed to manage a state within the AI agent swarm. Think of it as a container holding key details for each state instance, like which client it belongs to, a way to log activity, and a communication channel for interacting with other parts of the swarm. It ensures that each state has the necessary context and tools to function correctly within the larger system. The `clientId` identifies the client using the state, the `logger` handles recording what’s happening, and the `bus` allows for sending and receiving messages with other agents.

## Interface IStateMiddleware

This interface lets you insert custom logic to adjust or check the data being used by the agent swarm. Think of it as a place to add your own rules for how the swarm handles its information—you can tweak it as it’s being passed around. It's a way to influence the swarm’s internal workings and ensure the data is always in the right format or meets certain conditions. You can use it to add validation or transformation steps as the swarm operates.

## Interface IStateConnectionService

This interface helps us define how different parts of the system connect and share information about the current state of the AI agents. Think of it as a blueprint for building reliable connections between agents. It’s specifically designed to make sure the publicly accessible parts of the state connection service are clearly defined and consistent, while keeping the internal workings separate. It’s used to create a clean and predictable way for agents to communicate their status and progress.

## Interface IStateChangeContract

This interface helps you keep track of changes happening within the agent swarm. It provides a way to be notified whenever the state of the system changes. Specifically, it lets you subscribe to updates and receive the name of the state that has been modified, so you can react accordingly and keep your components synchronized. Think of it as a notification bell that rings whenever something important changes in the overall system.

## Interface IStateCallbacks

This interface defines functions that can be called when a state changes its status. You can use these functions to react to specific moments in the state's lifecycle, such as when it's first created, cleaned up, loaded from storage, read, or updated.  Think of them as event listeners that let you know what’s happening with a particular state. The `onInit` function lets you run code when a state is first created, while `onDispose` handles cleanup when it’s no longer needed.  `onLoad` is invoked when a state is retrieved from storage, and `onRead` and `onWrite` let you monitor or respond to read and write operations, respectively.

## Interface IState

This interface helps you manage the data your AI agents are working with. Think of it as a central place to keep track of what’s happening. 

You can use `getState` to check the current status of the data, which might include some extra processing based on how your system is set up. `setState` lets you update that data, but it does so in a clever way: you provide a function that calculates the new data based on what you already have, allowing for complex changes. Finally, `clearState` gives you a simple way to reset everything back to its starting point, just like hitting the reset button.

## Interface ISharedStorageConnectionService

This interface defines how your AI agents can share information with each other. Think of it as a common meeting place where agents can leave notes and pick up updates. It's designed to provide a clear, public way for agents to interact and share data, hiding any internal workings that aren't meant for direct use. This helps keep things organized and predictable for the agents working together.

## Interface ISharedStateConnectionService

This interface helps us define how different parts of the system will interact with a shared state. Think of it as a blueprint for connecting to a common area where agents can share information. It's specifically designed to make sure the parts of the system that developers actually use are clear and consistent, while hiding some of the behind-the-scenes mechanics. This helps keep things organized and prevents accidental interference with the system's internal workings.

## Interface ISharedComputeConnectionService

This interface helps ensure that different parts of the system can reliably connect to and interact with the underlying compute resources, like servers or virtual machines, used by the AI agents. Think of it as a standard way for the swarm to access those resources. By adhering to this interface, different connection methods can be swapped out or updated without breaking the overall orchestration framework. It provides a consistent approach to managing compute connections, making the system more flexible and maintainable.

## Interface ISessionSchema

This interface, `ISessionSchema`, is like a blank slate for defining how sessions are structured. Think of it as a promise for future session data—right now, it doesn't have any specific properties, but it's there to hold configurations related to session management as the system evolves. It provides a place to add information about session behavior and data.

## Interface ISessionParams

This interface outlines the information needed to start a new session for your AI agent swarm. Think of it as a blueprint – it defines all the pieces that need to be in place before a session can begin. 

It includes a client identifier to track which system initiated the session, a logger to record what's happening, a policy to enforce rules, and a communication bus for the agents to talk to each other. It also links the session to the specific swarm it's a part of. Essentially, it brings together the components needed for a coordinated effort between your AI agents.

## Interface ISessionContext

The `ISessionContext` interface holds all the important details about a session within the swarm system. Think of it as a container for information about who's using the system, which process is running, and any details about the method or execution currently in progress. 

It includes a unique identifier for the client – like a user ID – and a unique identifier for the swarm process itself. 

You'll also find information about the specific method being called, if one is active, and details about the current execution, if available. This context helps track what's happening and who's responsible.

## Interface ISessionConnectionService

This interface outlines how different services can connect to and manage sessions within the agent swarm. Think of it as a blueprint that ensures all public-facing session management functions are consistent and predictable. It's specifically designed to be used when defining how a service interacts with sessions, focusing on the essential parts and leaving out any internal workings.

## Interface ISessionConfig

This interface defines how to set up sessions that run on a schedule or with limits. You can specify a `delay`, which determines how long the session waits before starting. Optionally, you can also provide an `onDispose` function. This function will be called when the session is finished, letting you clean up any resources it might have used. Think of it as a final opportunity to tidy up after the session's work is done.

## Interface ISession

The `ISession` interface acts as the central hub for interacting with an AI agent swarm session. It provides ways to manage the session's history and communicate with the agents within it.

You can send messages to the session—both from the user and from the assistant—and these messages are recorded in the session’s history. It also includes options to commit different kinds of messages like system messages, developer messages, and even tool requests.

For more controlled interactions, you can run stateless computations or execute specific commands. It lets you pause the agent’s execution with `commitStopTools`. You can even clear the entire agent history with `commitFlush`. The `connect` method establishes a two-way communication channel for more complex interactions, and `notify` allows you to send internal updates to listeners.

## Interface IScopeOptions

This interface, `IScopeOptions`, lets you configure how your AI agent swarm operates within a defined scope. Think of it as setting up the rules of engagement for your agents.

You'll use the `clientId` property to give a unique name to this particular execution, making it easier to track what's happening. The `swarmName` tells the system which set of agent configurations to use for this scope – essentially, which agents are participating. 

Finally, the `onError` property is a handy way to be notified if something goes wrong; you can provide a function to deal with any errors that might pop up during the process.

## Interface ISchemaContext

This interface acts as a central hub for accessing different types of schema information used by the agent swarm. Think of it as a directory containing various registries, each responsible for managing a specific kind of schema, like those defining agents or completion tools. It gives you a single place to find and work with all these schema definitions within the system.

## Interface IPolicySchema

This interface defines the structure for creating and configuring policies within the AI agent swarm. It lets you define how the swarm enforces rules and handles bans.

You can use properties like `policyName` to give your policy a unique identifier. The `persist` flag determines if banned clients are saved, and `autoBan` controls whether a client is banned immediately after a validation failure. 

For more customization, you can provide functions like `getBanMessage` to create personalized ban messages, or `validateInput` and `validateOutput` to create custom validation rules. Finally, the `callbacks` section provides a way to hook into events for even more granular control over the policy’s behavior.


## Interface IPolicyParams

This interface defines the information needed to set up a policy within the AI agent swarm. Think of it as a blueprint for how a policy will operate. 

It includes a logger, which is essential for tracking what the policy is doing and catching any issues that arise. 

Also, it uses a communication bus to enable the policy to interact with other parts of the swarm and respond to events.

## Interface IPolicyConnectionService

This interface helps us create a reliable, public-facing service for managing connections based on policies. It’s a template that ensures the final service only includes features intended for external use, keeping the internal workings separate and secure. Think of it as a blueprint for a service that focuses on connecting things based on rules, without exposing how those rules are actually managed behind the scenes.

## Interface IPolicyCallbacks

This interface lets you tap into important events happening within a policy – think of it as a way to observe and react to what's going on. You can use it to get notified when a policy is first set up, to monitor incoming and outgoing messages for potential issues, and to be alerted when a client is either banned or unbanned. Each callback function provides you with relevant information, such as the policy name, the client involved, and the swarm’s name, allowing you to build custom actions based on these events. It’s a flexible tool for adding extra layers of control and monitoring to your AI agent swarm orchestration.

## Interface IPolicy

This interface defines how policies are applied within the AI agent swarm orchestration framework. It governs client access and ensures messages are appropriate.

The framework lets you check if a client is banned, retrieve the reason for a ban, and validate messages before they're sent or received. You can also actively ban or unban clients using this interface, controlling who participates in the swarm and what they can communicate. Essentially, it’s a way to manage and enforce rules for your AI agents.

## Interface IPipelineSchema

This interface describes the structure of a pipeline used to coordinate AI agents. Each pipeline has a unique name, identified by the `pipelineName` property. The core of the pipeline is the `execute` function, which defines the steps and logic to be performed when the pipeline runs, taking into account a client identifier, the agent's name, and a data payload. 

You can also add optional callbacks, defined in the `callbacks` property, to monitor the pipeline’s progress, handle any issues that might arise, or adjust the process as needed. This allows you to customize and observe the pipeline’s behavior.

## Interface IPipelineCallbacks

This interface lets you hook into the key moments of a pipeline's journey. You can define functions to be notified when a pipeline begins, finishes (whether successfully or with an error), or encounters a problem along the way. Think of it as a way to be alerted about what's happening with your AI agent workflows and respond accordingly – perhaps logging progress, sending notifications, or triggering recovery actions. The `onStart` function tells you when a pipeline begins, `onEnd` signals its completion (success or failure), and `onError` provides details when something goes wrong, allowing for error handling and debugging.

## Interface IPersistSwarmControl

This interface lets you tailor how your AI agent swarm's data is saved and loaded. Think of it as a way to swap out the standard storage mechanisms with your own custom solutions.

You can inject your own persistence adapters to handle how active agents are stored, allowing you to use things like in-memory storage or a specialized database.

Similarly, you can customize how the navigation stacks for your agents are persisted, giving you flexibility to use different storage methods depending on your needs. This lets you fine-tune the long-term memory and operational history of your AI agents.

## Interface IPersistStorageData

This interface describes how to save data for the swarm system. Think of it as a container that holds a list of information – like a collection of key-value pairs or individual records – that needs to be stored. The `data` property within this interface simply represents that list of data that’s ready to be saved. It’s used by the system's tools for managing persistent storage.

## Interface IPersistStorageControl

This interface lets you tailor how your AI agent swarm's data is saved and retrieved. Think of it as a way to plug in your own data storage system, like a database, instead of relying on a default method. 

The `usePersistStorageAdapter` method is the key – it's how you provide your custom storage solution, allowing for more specialized data handling based on your specific needs. This is useful if you need to store data in a format or location that the standard approach doesn't support.

## Interface IPersistStateData

This interface helps manage and save the data your AI agents need to remember between sessions. Think of it as a container for whatever information you want to keep track of – maybe it's how an agent is configured or the progress it made in a task.  It provides a standardized way to store this data, making it easy for the swarm system to handle saving and loading that information. The core of this interface is the `state` property, which holds the actual data you want to persist.

## Interface IPersistStateControl

This interface lets you fine-tune how the system saves and loads agent state. You can swap out the default way it handles state persistence with your own custom solution. This is particularly useful if you need to store state in a specific location, like a database, instead of the standard method. By providing your own persistence adapter, you have more control over where and how agent states are stored.

## Interface IPersistPolicyData

This interface describes how policy data, specifically information about banned clients, is saved and loaded within the AI agent swarm. Think of it as a way to keep track of which clients should be prevented from interacting with the swarm, associating them with a specific swarm’s policy. The core of this data is a list of session IDs, representing the clients that are currently banned. Each policy will hold its own list of banned session IDs.

## Interface IPersistPolicyControl

This interface lets you tailor how policy data is saved and retrieved for your AI agent swarms. 

Essentially, it gives you the ability to plug in your own storage solution – maybe you want to keep the policy information in a database, a file, or even just in memory. 

The `usePersistPolicyAdapter` method is the key here; it’s how you swap out the default persistence mechanism with your own custom implementation. This is useful when you need specialized storage or processing for the policy data associated with a specific swarm.

## Interface IPersistNavigationStackData

This interface describes how navigation history is saved when working with agent swarms. It essentially keeps track of which agents you're interacting with, creating a record of your "navigation" within the swarm. The `agentStack` property is a list of agent names, acting like a breadcrumb trail so you can easily return to previous interactions. Think of it as a "back" button for your agent workflow.

## Interface IPersistMemoryData

This interface describes how memory information is stored within the agent swarm. Think of it as a container for holding data that needs to be saved, like the details of a conversation or a temporary calculation. The `data` property holds the actual information, and it can be anything you need to keep track of – it's flexible enough to handle various types of data. This structure helps the system reliably save and retrieve this information when needed.

## Interface IPersistMemoryControl

This interface lets you tailor how memory is saved and retrieved for individual sessions. You can essentially plug in your own system for handling memory persistence, giving you more control over where and how data is stored. This is particularly useful if you need something other than the default persistence method, like storing memory directly in the browser or using a custom database. By providing your own persistence adapter, you can customize the behavior for specific session identifiers.

## Interface IPersistEmbeddingData

This interface outlines how to store embedding data within the AI agent swarm. It’s essentially a container for holding numerical representations (embeddings) of text, identified by a unique string hash and a descriptive name.  The core of this structure is a list of numbers, which collectively form the embedding vector representing the meaning of a particular string. Think of it as the digital fingerprint of a piece of text that the swarm can use for comparison and understanding.

## Interface IPersistEmbeddingControl

This interface lets you tweak how embedding data is saved and retrieved. You can plug in your own persistence mechanism – think of it as swapping out the default storage system – to handle embedding information. This is useful if you need a specific way to manage embeddings, such as keeping them in memory or using a different database. By providing a custom adapter, you're essentially customizing how the system remembers and loads those embeddings.

## Interface IPersistBase

This interface provides a basic way to store and retrieve data persistently within the AI agent swarm. It lets you manage data stored as JSON files, which could be things like agent states or memory. 

Before you start using it, `waitForInit` sets up the storage directory and cleans up any corrupted data.  To get information back, `readValue` fetches a specific piece of data by its ID. You can quickly check if a piece of data exists with `hasValue` without actually reading it. Finally, `writeValue` saves data to the storage, ensuring that it's written reliably.

## Interface IPersistAliveData

This interface helps the system keep track of which clients are currently active within a specific swarm. It's like a simple "online/offline" status for each client, identified by its session ID and associated with a swarm name.  Essentially, it provides a way to know if a client is participating or has disconnected from the swarm. The `online` property is a straightforward boolean value that shows whether the client is considered online or not.

## Interface IPersistAliveControl

This interface lets you personalize how the system remembers whether your AI agents are still active. 

It provides a way to plug in your own custom storage mechanism – perhaps you want to use a database, a file, or even just keep track of things in memory.

By providing your own persistence adapter, you can tailor the alive status tracking to your specific needs, going beyond the default behavior. This is helpful when you want very specific control over how alive status is managed for a particular swarm.

## Interface IPersistActiveAgentData

This interface outlines how we keep track of which agent is currently running for each client and swarm. Think of it as a simple record noting which agent is "active" within a larger group (swarm) and connected to a specific user or application (client). The key piece of information stored is the `agentName`, which is a descriptive label identifying the active agent, like "agent1" or "task-coordinator". This allows the system to easily recall and resume work with the right agent when needed.

## Interface IPerformanceRecord

This interface describes a record of how a specific process performed within the system. Think of it as a report card for a task, aggregating details from all the clients involved. 

Each record tracks key information like a unique identifier for the process itself (processId), details about each client's performance (clients), the total number of executions, the total and average response times, and timestamps to pinpoint when the data was collected. This information helps monitor overall system health and identify potential bottlenecks. The timestamps (momentStamp, timeStamp, and date) provide different levels of detail for precisely when the performance data was generated.


## Interface IPayloadContext

This interface, `IPayloadContext`, acts like a container for everything an AI agent needs to know about a specific task or request. Think of it as a package that bundles together a client identifier, which tells us who requested the work, and the actual data or instructions for the agent to process – the `payload`. It ensures that all relevant information travels together, keeping things organized and making it easier for the agent swarm to understand and execute requests.

## Interface IOutlineValidationFn

This interface describes a function used to check if an outline operation is valid. Think of it as a gatekeeper – it receives information about the operation and the data involved, and then decides whether the operation should proceed. It's a key part of ensuring the outline system works correctly and prevents unexpected errors. Essentially, it’s how you define rules to make sure each step in the outline process is sound.

## Interface IOutlineValidationArgs

This interface helps you pass information needed to validate the results of an outline operation. Think of it as a way to bundle together the input you started with and the data that’s been produced during the process. Specifically, it includes a `data` property, which holds the result that needs to be checked – usually some kind of structured information. It's designed to make sure the results you're getting are correct and in the expected format.

## Interface IOutlineValidation

This interface helps you define how to check if an outline (a plan or structure) is valid within your AI agent system. Think of it as setting up rules to ensure your agents are on the right track.

You specify a `validate` function – this is the actual logic that performs the checks. It can even call other validation functions to build up a complex validation process. 

Optionally, you can provide a `docDescription` to explain what the validation is doing; this is helpful for understanding the system and documenting its behavior.

## Interface IOutlineSchemaFormat

This interface describes how to define an outline format using a JSON schema. It's a way to ensure the structure of your data conforms to a specific standard. 

Essentially, you specify the *type* of format, which would be "json_schema" in this case, and then provide the actual JSON schema object itself. This schema acts as the blueprint for validating the outline data.

## Interface IOutlineSchema

This interface defines how an outline operation is configured within the AI agent system. Think of an outline as a specific task or process the agents will undertake, like brainstorming ideas or drafting a document.

You’re essentially setting up the instructions for the agents here. You can provide a static prompt to guide them, or use a dynamic prompt that changes depending on the outline's name. You can also include system prompts to give the agents some background information or rules to follow.

The outline also has a unique name for identification, and you can define how the generated data should be structured and validated. There are options to limit retries if things don’t work out initially, and even customize events during the outline’s lifecycle. Finally, a function allows you to generate structured data, using previous attempts and history.

## Interface IOutlineResult

This interface describes what you get back after running an outline operation, like generating a plan or structure. It tells you if everything went okay, gives you a unique ID to identify that specific run, and keeps a record of all the messages exchanged during the process. If something went wrong, you’ll find an error message here. You can also see the original input parameters and any data produced by the outline process, along with how many times the operation has been attempted.

## Interface IOutlineObjectFormat

This interface defines the structure and rules for how outline data should be organized. Think of it as a blueprint for creating consistent outline information. 

It outlines what kind of data is expected (like a general "object" or specific JSON schema types), lists which properties are absolutely necessary, and then details what each property should be – including its type and a description of what it represents. It ensures everyone involved uses the same understanding of the outline's data format.

## Interface IOutlineMessage

This interface defines the structure of a message within the system, helping organize interactions between users, assistants, and the overall system. Each message has a designated role, indicating who or what generated it. Messages can also include images, represented as either raw binary data or encoded strings, making it possible to incorporate visual content.  The `content` property holds the core text or parameters of the message. If a tool call is involved, it’s associated with the message via the `tool_calls` array and can be linked to a specific tool execution request using the `tool_call_id`.

## Interface IOutlineHistory

This interface lets you keep track of the messages used during outline creation. You can add new messages individually or in batches using the `push` method. If you need to start fresh, the `clear` method will wipe the history completely. Finally, the `list` method allows you to see all the messages currently stored in the history.

## Interface IOutlineFormat

This interface defines the structure for how outline data should be organized. Think of it as a blueprint for creating valid outline data – it tells you what fields are necessary and what kind of information should go in each one. The `type` property specifies the overall format (like an object), `required` lists the essential fields that absolutely must be present, and `properties` provides detailed information about each field, including its data type and a description of what it represents. Using this interface helps ensure consistency and clarity when working with outline data within the AI agent swarm orchestration framework.

## Interface IOutlineCallbacks

This interface lets you plug in functions to be notified about what's happening during the outline creation process. You can use these functions to keep track of when an attempt starts, when a document is successfully generated, or to handle situations where a document fails validation and might need to be retried. Think of them as little helpers that let you react to key stages in the outline generation lifecycle.

## Interface IOutlineArgs

This interface defines the information needed when performing an outline task within the agent swarm. Think of it as a package containing everything an agent needs to know to do its job – it includes the actual input data (the `param`), a counter to track how many times it's tried (the `attempt`), details about how the output should be formatted (`format`), and a way to access the past actions and messages related to this task (`history`). It’s like a logbook and instruction manual rolled into one, ensuring each agent has the context it needs to contribute effectively.

## Interface IOutgoingMessage

This interface describes a message being sent *from* the orchestration system *to* a client, usually an agent. Think of it as a way for the system to communicate back to a specific agent with a result, notification, or output.

Each message has three key parts: a `clientId` that identifies which client (agent) should receive it, `data` which is the actual content of the message itself, and `agentName` that tells you which agent within the swarm created and sent the message. It's how the system signals information back to the agents and ensures the correct agent gets the information it needs.

## Interface IOperatorSchema

This API lets you build a way to connect your AI agents to an operator dashboard. Think of it as a bridge that allows a human operator to see and potentially intervene in the conversations happening between your agents and users. 

The `connectOperator` function sets up this connection, giving you a way to pass messages from the agent to the operator and, crucially, receive responses back. This provides a real-time view into the agent's work and gives you the power to guide or take over if needed.

## Interface IOperatorParams

This interface defines the essential information needed to configure and run an agent within the AI agent swarm. It includes the agent’s name, a client identifier for tracking its activity, a logger for recording events, and a communication bus to interact with other agents. Crucially, it also incorporates a history service, which allows the agent to remember past interactions and use that context for more informed decisions. Essentially, it’s a blueprint for creating a well-equipped and communicative agent within the swarm.

## Interface IOperatorInstanceCallbacks

This interface lets you listen for important events happening within an individual AI agent as it's part of a larger swarm. You can register functions to be notified when an agent is first set up, when it provides an answer to a question, or when it receives a message.  You’ll also get notifications when the agent finishes its work and is being shut down, and when it sends out a notification. These callbacks provide a way to react to what each agent is doing in real-time.

## Interface IOperatorInstance

This interface defines how you interact with a single agent within your AI agent swarm. Think of it as the control panel for one agent – it allows you to set up how that agent receives information, sends answers and notifications, and manages its connection to the swarm. 

You can use `connectAnswer` to tell the agent how to handle incoming answers. `answer` is used to send information back to the swarm.  `init` establishes the agent’s connection, while `dispose` cleanly shuts down its connection when it’s no longer needed. The `notify` method allows sending simple notifications, and `recieveMessage` is for the agent to process incoming messages.

## Interface IOperatorControl

This interface, `IOperatorControl`, lets you configure how your AI agent operators function within the swarm orchestration framework. You can use it to register callback functions that will be triggered by specific operator events, allowing you to react to their actions. 

It also provides a way to swap out the default operator implementation with a custom one, offering greater flexibility in how your operators behave. Essentially, this interface gives you control over the inner workings and behavior of your AI agent operators.

## Interface INavigateToTriageParams

This interface defines how to customize the process of directing a user's request to a triage agent within the system. You can use it to inject your own logic at various stages, like before the agent is switched, when the previous user message needs to be adjusted for context, or when the navigation process fails and the session needs to be cleared. It also lets you provide tailored messages to the user when the request is successfully routed or when no routing is needed because they are already with the correct agent. These customizable options allow you to fine-tune the user experience and add specific feedback loops during agent navigation.

## Interface INavigateToAgentParams

This interface lets you customize what happens when the system navigates to a new agent. You can define actions to take before the navigation begins, or to send messages at different points – like when the session needs to be reset, when the navigation happens without an action, or after a successful navigation. You can also modify the last user message to provide more context for the new agent, and even change what gets executed on that new agent after the navigation is complete. Essentially, it gives you a lot of control over the user experience and how agents interact during navigation.

## Interface IModelMessage

This interface, `IModelMessage`, represents a fundamental building block for communication within the agent swarm. Think of it as a standardized way to package any piece of information being passed around – whether it's a user's request, a tool's output, a system notification, or a model’s response.

Each message has a `role` to indicate where it's coming from (like a user, a tool, or the system itself). It also includes an `agentName`, which helps to track which agent generated the message, particularly useful in complex swarms working together.  The `content` is the core of the message – the actual text or data being shared.  The `mode` clarifies whether the message originates from user input or a tool’s actions.

Sometimes, models will request tools be executed, and these requests appear as `tool_calls` – a list of specific tool calls needed.  If an image is included it will show as `images`.  `tool_call_id` helps connect tool outputs to the initial tool call that prompted them.  Finally, a `payload` provides a place for extra data or context that isn’s directly part of the core message.

## Interface IMethodContext

This interface, `IMethodContext`, provides a standardized way to track details about method calls within the agent swarm system. It's like a little packet of information that gets passed around to different services—things like the ClientAgent, the performance monitoring system, and the logging service—to keep everything organized.

Essentially, it contains key identifiers for each call, including the client session, the method being executed, and the names of the agents, swarms, storage, state, compute, policy, and mcp resources involved. This allows for detailed tracking and documentation across the entire system, linking calls to specific components and resources.

## Interface IMetaNode

This interface, IMetaNode, describes how information about agents and their connections are structured. Think of it as a way to organize a complex network of agents, their relationships, and the resources they use. Each node represents something – like an agent itself or a specific resource – and has a name to identify it. It can also have child nodes, allowing you to build a hierarchical view, like a family tree, to show how agents depend on each other or share resources. This structure helps build diagrams that show the relationships and attributes within your AI agent swarm.

## Interface IMCPToolCallDto

This interface defines the structure of data used when an AI agent requests a tool to be used. It carries information like a unique ID for the tool being requested, who’s making the request (the client), and the name of the agent initiating the call. It also includes the specific parameters needed for the tool, any related tool calls, a way to cancel the operation if needed, and a flag to indicate if it's the final call in a series. Think of it as a detailed message sent to orchestrate the use of a specific tool within the AI agent system.

## Interface IMCPTool

This interface describes a tool used within the AI agent swarm orchestration framework. Each tool has a unique name, helping to identify it within the system. Optionally, a description can be added to explain what the tool does. Crucially, each tool also defines an input schema, which specifies the structure and data types expected for the information it receives. This schema ensures that the tool gets the right kind of input to function correctly.

## Interface IMCPSchema

The `IMCPSchema` interface outlines the blueprint for a core component within our AI agent orchestration system – we call it an MCP. Think of an MCP as a self-contained unit of logic, like a specialized worker, that can be plugged into a larger network of agents.

Each MCP needs a unique name (`mcpName`) to identify it, and optionally, a description (`docDescription`) for documentation purposes. 

The `listTools` function lets the system discover what tools this MCP offers to other agents, essentially saying "Here's what I can do."  Then, when an agent wants to use one of those tools, the `callTool` function handles executing it and getting the results back.

Finally, `callbacks` provide a way to be notified of important events related to the MCP, like when it starts up or shuts down.

## Interface IMCPParams

This interface defines the necessary components for managing tasks within our AI agent swarm orchestration framework. It ensures that each task has access to a logger for tracking activity and a bus for sending and receiving messages. Think of the logger as a way to keep a record of what's happening, and the bus as a central hub for agents to communicate with each other. Essentially, this interface provides the foundational elements for reliable and traceable agent interactions.

## Interface IMCPConnectionService

This interface helps manage connections between your AI agents using a Message Channel Protocol (MCP). Think of it as the traffic controller for your agent swarm, allowing agents to reliably send messages to each other. It defines the methods needed to establish, maintain, and close these communication links. You can use it to create a network where agents can share information and coordinate tasks effectively. The `IMCPConnectionService` makes sure messages get where they need to go, contributing to a smooth and organized agent swarm.

## Interface IMCPCallbacks

This interface defines a set of functions that allow your application to respond to key events within the AI agent orchestration system. Think of these as notification hooks – you can plug in your own code to react when the system starts up, when a client's resources are released, when tools are loaded, or when a tool is actually used. 

Specifically, you can register a function to be run when the core system initializes, when a client connection is closed and its resources are cleaned up, or when the system retrieves or lists available tools.  You'll also receive notifications when a tool gets called, providing details about the tool and the data associated with the call, and whenever the list of tools changes.

## Interface IMCP

The Model Context Protocol (MCP) interface lets you manage and interact with the tools available to your AI agents. 

You can use it to see what tools are available for a particular agent, check if a specific tool is offered, and actually execute a tool with provided data. 

It also includes ways to refresh the list of tools, either globally or for a single agent, ensuring you always have the most up-to-date information. This lets you control what resources each agent can access and how they are utilized.

## Interface IMakeDisposeParams

This interface defines the settings you can provide when setting up an automated disposal process for your AI agent swarm. The `timeoutSeconds` property lets you specify how long the system should wait before automatically disposing the swarm if it's inactive.  You can also provide an `onDestroy` callback function, which will be notified once the disposal process completes successfully – giving you a chance to clean up any resources or log the event, knowing the swarm session is finished. This callback receives the client ID and swarm name as arguments.

## Interface IMakeConnectionConfig

This interface defines how to control the timing of messages sent by your AI agents. Think of it as a way to space out the communication, preventing a flood of requests. The `delay` property lets you specify, in milliseconds, how long to wait before sending the next message. This is useful for managing resources or ensuring a more controlled interaction with external services.

## Interface ILoggerInstanceCallbacks

This interface provides a way to listen for and react to events happening within a logger. You can use it to set up actions that occur when a logger starts, stops, or records different types of messages – like debug, info, or general logs. Essentially, it lets you tap into the logger's lifecycle and log activity to monitor or modify its behavior. Think of it as hooks for the logger, letting you customize what happens at key moments.

## Interface ILoggerInstance

This interface defines how logging components should behave when they need to be set up and taken down properly. It builds upon a basic logging system, adding methods to ensure each logger is initialized and cleaned up at the right time. 

The `waitForInit` method is used to get the logger ready, and it can handle situations where the setup takes a little longer. The `dispose` method is used to clean up the logger when it's no longer needed, ensuring all resources are released.

## Interface ILoggerControl

This interface provides ways to control how logging works within the AI agent swarm orchestration framework. You can use it to set up a central logging adapter for all agents, customize the lifecycle of individual logger instances, or even define your own way to create those logger instances. 

The framework also lets you log messages specifically for different clients, providing a way to track activity and debug issues related to particular agents or services. These client-specific logging functions include safeguards to ensure valid sessions and keep track of where the logs originate.

## Interface ILoggerAdapter

This interface outlines how different systems can connect and communicate logging information to the framework. It provides a standard way to record events, debug issues, and receive informational messages for each client.

The `log`, `debug`, and `info` methods allow you to send messages to the system, ensuring that everything is properly set up before the message is sent.  The `dispose` method lets you clean up resources associated with a client's logger when it's no longer needed, releasing those resources for other uses. Essentially, this interface provides the building blocks for flexible and client-specific logging within the agent swarm orchestration.

## Interface ILogger

This interface defines how different parts of the AI agent swarm system can record information. Think of it as a standardized way to keep track of what's happening – from an agent’s actions to policy checks and even errors. 

You can use it to write general messages about important events, add detailed debug information for troubleshooting, or simply log informational updates about successful operations. This logging helps with debugging, monitoring, and auditing the entire system.

## Interface IIncomingMessage

This interface defines what a message looks like when it enters the swarm system. Think of it as a standardized way to pass information from a client – like a user – to the agents doing the work. 

Each message has a client identifier, which tells us where the message originated, the actual content of the message itself, and importantly, the name of the agent that should handle it. This ensures the right agent receives the right information from the correct client. Essentially, it's how the system knows who sent what to whom.

## Interface IHistorySchema

This interface outlines how history – the records of messages exchanged with your AI agents – is managed within the system. Think of it as the blueprint for how these conversations are saved and loaded. The key part is the `items` property, which dictates precisely how that history is stored, whether it's in a simple array, a database, or some other custom solution. This adapter handles the actual mechanics of saving and retrieving those messages.

## Interface IHistoryParams

This interface defines the settings needed to set up a history record for an AI agent. It allows you to specify things like the agent’s name, how many messages from the agent's previous interactions to keep for context, and a unique identifier for the client using the agent. You can also provide a logger to track what's happening with the history and a bus for sending messages about it within the overall AI agent system. Essentially, it's about keeping track of an agent’s conversations and actions in a structured and manageable way.

## Interface IHistoryInstanceCallbacks

This interface defines a set of functions you can use to manage and observe the lifecycle of an agent’s conversation history. You can customize how the history is populated, filtered, and how changes are handled.

Specifically, you can provide functions to fetch the initial set of messages for an agent, decide which messages should be included, and react to changes like adding or removing messages. There are also hooks to be notified when the history is read, initialized, disposed, or when a reference to the history object itself is available. This allows for flexible control over how the AI agent remembers and uses past interactions.

## Interface IHistoryInstance

This interface describes how to manage the history of interactions for each AI agent in your swarm. You can use it to step through past conversations, ensuring you have a record of what happened.

The `iterate` method lets you review the messages an agent has sent and received.  `waitForInit` helps set up the history for a specific agent, potentially loading any existing data.  To record new interactions, use `push` to add messages to an agent's history.  If you need to retrieve the most recent interaction, `pop` will remove and return it. Finally, `dispose` allows you to clean up the history for an agent when it's no longer needed.

## Interface IHistoryControl

This interface lets you fine-tune how your AI agent swarm remembers and tracks its actions. You can use it to set specific actions that should be triggered when a history item is created, updated, or deleted. It also gives you the ability to completely customize the type of history object being used, allowing for more specialized tracking and management of agent interactions. Think of it as the control panel for the swarm's memory system.

## Interface IHistoryConnectionService

This interface defines how to interact with the history connection service, ensuring a clear and consistent way for external components to access its functionality. It's designed to provide a specific, public-facing view of the service, hiding internal details and focusing on the operations available for use. Think of it as a blueprint for how other parts of your system should communicate with the history connection service.

## Interface IHistoryAdapter

This interface provides a way to manage the conversation history for individual agents. You can add new messages to the history using the `push` method, which takes the message content, client ID, and agent name. To retrieve the most recent message, use `pop`, which removes and returns it. The `dispose` method allows you to clear out the history for a specific client and agent when it's no longer needed. Finally, `iterate` provides a way to step through the history messages sequentially for a particular agent and client.

## Interface IHistory

The `IHistory` interface helps track the conversation flow of your AI agents within the swarm. It allows you to add new messages to the history, retrieve the most recent message, and format the history for use with a specific agent or in its raw form.  You can use `push` to record a new message, `pop` to grab the latest one, and `toArrayForAgent` to get a history prepared just for a particular agent, potentially with customized prompts. `toArrayForRaw` lets you retrieve the complete, unfiltered history of model messages.

## Interface IGlobalConfig

This interface, `IGlobalConfig`, acts as a central hub for managing how the AI agent swarm system operates. Think of it as a control panel with settings that affect everything from how the system handles tool calls to how it logs activity.

Here's a breakdown of what you can control:

*   **Tool Call Recovery:** You can choose how the system responds when a tool call fails ("flush" to reset, "recomplete" to retry, or a custom function).
*   **Logging Levels:** Control the amount of information logged, from basic info to detailed debug messages.
*   **History Management:**  Define how much conversation history is retained, impacting the context provided to the AI.
*   **Tool Call Limits:** Set a maximum number of tools that can be called in a single execution to avoid runaway processes.
*   **Customization Hooks:** Many properties are functions that let you tailor behavior, such as mapping tool calls or transforming output.
*   **Persistence & Caching:** Control data persistence, including embedding caches, for performance and cost efficiency.
*   **Operator Connections:** Define how operators (human handlers) connect to and interact with agents.



In short, `IGlobalConfig` allows you to fine-tune the swarm's behavior for specific use cases and environments. You can dynamically change system behavior using `setConfig` to adapt to changing conditions.

## Interface IExecutionContext

This interface describes the essential information associated with a single run or task within the AI agent swarm. Think of it as a little packet of data that travels alongside each execution, helping different parts of the system – like the client interface, performance monitoring, and message bus – keep track of what's happening. 

It includes a client identifier to link the execution to a specific user session, a unique execution ID for precise tracking, and a process ID that connects it to the overall system configuration. Essentially, it provides a consistent way to identify and monitor each individual task within the swarm.

## Interface IEntity

This interface serves as the foundation for anything that gets saved and tracked within the agent swarm system. Think of it as the basic building block. Different kinds of data, like alive status or specific states, will build upon this core interface to add their own details.

## Interface IEmbeddingSchema

This interface helps you set up how your AI agents understand and compare information within the swarm. You can choose whether to save the agents' navigation history and state. Each embedding mechanism has a unique name to identify it.

The `writeEmbeddingCache` function lets you store computed embeddings to avoid redoing the work later.  `readEmbeddingCache` checks if an embedding has already been computed and stored.

You can customize the embedding process with optional callbacks. The `createEmbedding` function generates an embedding from text, useful for indexing. Finally, `calculateSimilarity` measures how close two embeddings are, vital for searching and ranking.

## Interface IEmbeddingCallbacks

This interface lets you tap into what’s happening when the system creates and compares embeddings – those numerical representations of text. 

The `onCreate` callback gets called whenever a new embedding is generated, allowing you to track its creation or do something extra with it like saving it somewhere. 

Similarly, the `onCompare` callback fires when the system figures out how similar two pieces of text are, giving you a chance to log those comparisons or analyze the similarity scores.

## Interface ICustomEvent

This interface lets you create and send custom events within the swarm system, allowing you to share specific information beyond the standard event types. Think of it as a way to communicate unique data or trigger actions based on custom conditions. It builds upon a basic event structure, but importantly, it provides a flexible “payload” property where you can include any kind of data you need – numbers, text, objects – whatever makes sense for your particular event. This is useful for situations where the predefined event types don't quite fit your needs.

## Interface IConfig

This interface, `IConfig`, defines how the system will generate diagrams. 

You can control whether the diagram shows detailed, hierarchical information—essentially, the "subtree" relationships—by setting the `withSubtree` property to true or false.  Think of it as a switch to decide how much detail you want in the visualization.

## Interface IComputeSchema

This interface, `IComputeSchema`, defines the blueprint for how individual computational tasks are structured within the agent swarm orchestration system.  It outlines essential properties like a descriptive name (`docDescription`), whether the compute is shared among agents (`shared`), and a unique identifier (`computeName`). 

You'll also find a `ttl` property which dictates the time-to-live for the computed data. The `dependsOn` array specifies which other computations this one relies on to execute.

Furthermore, it includes mechanisms for data retrieval (`getComputeData`), middleware application (`middlewares`), and defining event handling functions (`callbacks`) that allow you to monitor and react to changes in the compute's lifecycle and data.  These callbacks provide a way to customize the behavior of individual computations and integrate them with your broader system.

## Interface IComputeParams

This interface, `IComputeParams`, provides the necessary context for performing computations within the agent swarm orchestration framework. It bundles together essential components like a unique client identifier (`clientId`) to track the request source, a logging mechanism (`logger`) for debugging and monitoring, and a message bus (`bus`) for communication between agents.  Importantly, it also includes a `binding` property. This `binding` acts as a watch list, telling the compute process which state changes it needs to react to, ensuring it only recalculates and updates data when relevant information changes.

## Interface IComputeMiddleware

This interface defines the contract for middleware components that process data before or after a computation is performed by an agent in the swarm. Think of it as a way to add extra steps, like data validation or logging, around each agent's work. Implementing this interface allows you to customize the flow of information within the agent swarm orchestration. It’s particularly useful if you want to standardize how data is handled or monitor agent activity. The `execute` method is the core of the middleware, where the transformation or additional processing takes place.

## Interface IComputeConnectionService

This interface, IComputeConnectionService, helps manage connections to computing resources that your AI agents need to work. Think of it as a way to standardize how your agents link up to the tools and infrastructure they rely on. It builds upon the existing ComputeConnectionService, ensuring a consistent and reliable way for agents to access what they need.

## Interface IComputeCallbacks

This interface defines a set of optional callbacks that can be used to monitor and react to the lifecycle and status of a compute unit within the AI agent swarm. You can use these callbacks to receive notifications when a compute unit is initialized, when it’s being cleaned up, when it's performing its calculations, or when its internal state is updated.  The `onInit` and `onDispose` callbacks let you know when a compute unit is starting and stopping, while `onCompute` lets you access the data being processed. Finally, `onUpdate` provides a way to respond to changes in the compute unit's data or configuration.

## Interface ICompute

This interface, ICompute, provides the core methods for managing and interacting with a compute task within the agent swarm. It lets you trigger a calculation with `calculate`, providing a state name to guide the process. You can also update the status of a compute operation using `update`, identifying it by its client and compute names. Finally, `getComputeData` allows you to retrieve the result of the computation, giving you access to the current outcome of the work.

## Interface ICompletionSchema

This interface, `ICompletionSchema`, helps you set up and manage how your AI agents generate responses within the swarm. It’s like a blueprint for creating a completion method.

You'll use it to give each completion method a unique name (`completionName`) and configure it with options like whether to expect JSON output (`json`) or specific flags for the underlying language model (`flags`).

The `callbacks` property lets you customize what happens after a completion is generated, allowing for post-processing or other actions.

Finally, the `getCompletion` method is what actually triggers the completion process, taking in arguments and returning either a standard model message or an outline message.

## Interface ICompletionCallbacks

This interface gives you a way to be notified when an AI agent's task finishes successfully. 

Think of it as a notification system – you can hook in your own code to do things like save the results, display them to a user, or kick off another process. 

Specifically, the `onComplete` property lets you define a function that will run once the agent has completed its work, providing details about the task and the generated output.

## Interface ICompletionArgs

The `ICompletionArgs` interface defines the information needed to ask the system to generate a response, like continuing a conversation or creating a structured output.

It includes a unique identifier for the application making the request (`clientId`), the specific agent responsible for the task (`agentName`), and the outline – if any – that dictates the shape of the expected response (`outlineName`).

You'll also specify the source of the previous message (`mode`), the conversation history (`messages`), and any tools the agent has access to (`tools`).  Finally, the `format` property allows you to fine-tune how the response is structured when using outlines.

## Interface ICompletion

This interface defines how different components within the agent swarm orchestration framework can generate responses from AI models. Think of it as the standard way to get a model's answer – it ensures everyone speaks the same language when it comes to model interactions. It builds upon a basic completion structure to offer a full set of tools for handling those responses, providing a robust and consistent approach to AI model communication.

## Interface IClientPerfomanceRecord

This interface, `IClientPerformanceRecord`, gives you a detailed snapshot of how a single client—think of it as a user session or an individual agent—is performing within a larger process. It's designed to break down overall performance data into client-level insights.

Each `IClientPerformanceRecord` contains information like a unique identifier (`clientId`) so you can track a specific session, as well as data about the client’s memory (`sessionMemory`) and its persistent state (`sessionState`). You'll also find metrics related to how many times the client executed tasks (`executionCount`), how much data it processed for inputs and outputs (`executionInputTotal`, `executionOutputTotal`), and the time it took to complete those tasks (`executionTimeTotal`, `executionTimeAverage`).  These records help pinpoint bottlenecks or areas for optimization on a per-client basis, leading to a more efficient and responsive system.

## Interface IChatInstanceCallbacks

This interface defines a set of callbacks that allow you to monitor and react to events happening within a chat instance managed by the AI agent swarm orchestration framework. You can use these callbacks to track the lifecycle of a chat, from its initialization to its disposal.

Specifically, you'll receive notifications when an instance is ready, when it’s being shut down, when a chat session starts, and when messages are sent. The callbacks provide details like client identifiers, swarm names, and the content of messages, enabling you to build custom logic for things like activity monitoring or real-time tracking of conversations.

## Interface IChatInstance

This interface, IChatInstance, represents a single chat session managed by the AI agent swarm. It lets you start a conversation with `beginChat`, send messages to the AI using `sendMessage`, and check if the session is still active with `checkLastActivity`. When you’re finished, `dispose` gracefully closes the chat, and `listenDispose` allows you to be notified when a chat is closed.

## Interface IChatControl

This framework lets you customize how your AI agent swarm interacts with chat interfaces.  The `IChatControl` interface provides a way to plug in different chat implementations. You can use `useChatAdapter` to specify the class that will actually handle the communication with a chat platform, allowing you to swap out providers easily.  Similarly, `useChatCallbacks` lets you define functions that are triggered at different points in the chat flow, such as when a new message arrives or a request is completed. This gives you a lot of flexibility in tailoring the agent swarm's behavior.

## Interface IChatArgs

This interface, `IChatArgs`, defines the information needed to send a message to an AI agent. It includes the core `message` content itself – the text you want the agent to process. You can also optionally provide an array of `images` to accompany the message, giving the agent visual context. Think of it as a structured way to package a chat request, combining text and images for a richer interaction.

## Interface IBusEventContext

This interface provides extra information about events happening within the AI agent swarm. Think of it as a way to tag events with details about which agent, swarm, or other system components were involved. When an agent is actively doing something, you're most likely to see its name included. However, the interface also allows for associating events with swarms, storage, states, compute resources, or policies, which is useful for broader system-level monitoring and management. It's designed to add clarity and context to what's happening across the entire system.

## Interface IBusEvent

The `IBusEvent` interface describes a standardized way for different parts of the system to communicate with each other, particularly within ClientAgents. Think of it as a structured message that's sent around the system to signal actions, updates, or data exchanges.

Each event includes information about where it’s coming from (`source`), what kind of event it is (`type`), and any data being sent along with it (`input` and `output`).  The `input` field carries the data needed for the event to be processed, while `output` holds the results or any return values.  Finally, `context` provides extra information like the agent involved, helping the system understand the event’s origin and scope. This structured approach ensures clear and consistent communication between different components within the AI agent swarm.

## Interface IBus

The `IBus` interface provides a way for different parts of the system, especially agents, to communicate with each other asynchronously. Think of it as a central messaging system.

The main method, `emit`, allows agents to send specific events to a designated client. These events contain information like the type of event, where it came from, any input data, and results.  The events also include a client ID, which specifies exactly who should receive the message.

This system is designed so that components don't need to know all the details about each other – they simply send and receive messages through the bus.  For example, an agent might use it to let the system know when it has finished processing something or when it’s ready to send a result back to the user. The client ID is repeated in the event data for extra clarity and to help with filtering. Events are structured to ensure consistency and type safety.

## Interface IBaseEvent

This interface lays the groundwork for all events happening within the system, ensuring a consistent structure for communication. Every event, whether it's a standard message or something custom, will have these fundamental properties. The `source` field tells you where the event came from, like a specific agent or a general system component. The `clientId` field makes sure the event is delivered to the correct client or agent instance. Think of it as the "from" and "to" addresses for all system messages.

## Interface IAgentToolCallbacks

This interface defines a set of optional functions you can use to monitor and influence how your AI agent tools operate. Think of them as hooks that let you step in at key moments – before a tool runs, after it finishes, when you need to check if the tool’s inputs are valid, or if something goes wrong during execution. You can use these hooks for things like logging activity, making sure data is properly prepared, or handling errors gracefully. Each hook provides information about the tool being used, the client that requested it, and the parameters passed to the tool.

## Interface IAgentTool

This interface defines how a tool functions within the agent swarm. Each tool needs a unique name for identification, and can optionally provide a description to help users understand its purpose. 

You can specify when a tool is available to be used, based on factors like the client or agent involved. Before a tool runs, it's validated to make sure the input parameters are correct. 

Tools can also be customized with lifecycle callbacks to control the execution process. The `call` method is how the tool actually gets executed, handling the parameters and context provided. Finally, the `function` property allows for dynamic resolution of tool metadata.

## Interface IAgentSchemaInternalCallbacks

This interface defines a set of optional callback functions that you can use to monitor and interact with an agent's lifecycle. These callbacks provide notifications at various stages, like when the agent starts running, produces output, encounters errors, or is prepared for reuse after a pause. 

You can hook into events such as the agent's initialization, execution, tool output, and disposal. There are also callbacks for specific scenarios like when a tool requests an action, a system generates a message, or the agent's history needs to be cleared. These functions give you opportunities to log activity, intervene in the process, or simply observe how the agent is behaving. For instance, you could use the `onToolError` callback to log errors before attempting to restart the agent, or the `onAfterToolCalls` callback to process the results of a sequence of tool actions.

## Interface IAgentSchemaInternal

This interface defines the blueprint for how an AI agent is configured within the swarm. Think of it as a set of instructions that tells the agent what it's supposed to do and how it should behave.

You can customize the agent's behavior by specifying things like:

*   **Prompts:**  The core instructions guiding the agent's actions.
*   **Tools:** The specific actions the agent can take.
*   **System prompts:** Additional instructions that define how the agent interacts with tools.
*   **Lifecycle events:**  Hooks that allow you to modify the agent’s flow at various stages.

There are also settings to control the agent’s memory (how many messages it remembers) and to manage its relationship with other agents within the swarm.  For agents handling direct customer interaction, there's functionality to seamlessly connect them to an operator dashboard.  Finally, you can use validation and transformation functions to refine the agent's output before it’s presented.

## Interface IAgentSchemaCallbacks

This interface lets you tap into different stages of an agent's lifecycle. You can register callbacks to be notified when an agent starts running, produces output, requests a tool, generates a system message, or even when it's paused and then restarted. It’s like setting up event listeners for your agents, allowing you to react to specific actions and potentially modify their behavior or log important information. You can also be alerted when the agent’s history is cleared or when it’s completely finished.

## Interface IAgentSchema

This interface defines the structure for describing an AI agent within the orchestration framework. It allows you to configure how each agent behaves, primarily through prompts. 

You can provide a static set of system prompts to guide the agent's actions.  Think of these as initial instructions or a persona definition.  The `systemStatic` property is simply another way to specify those same initial instructions.

For even greater flexibility, you can use dynamic system prompts.  The `systemDynamic` property allows you to generate prompts on the fly, based on factors like the client making the request and the agent's name – this lets you tailor the agent's behavior to specific situations.

## Interface IAgentParams

This interface defines what information is needed to run an agent within the AI swarm system. It's like a configuration file, providing details like a unique client ID for tracking, a logger for recording what the agent does, and a communication channel (the "bus") to interact with other agents.  It also includes access to external tools through an MCP, a record of past interactions via a history, a system for generating responses, and optionally, a list of tools the agent can use.  Finally, it allows for a validation step to check the agent's output before it’s considered complete.

## Interface IAgentNavigationParams

This interface defines the information needed to set up how agents move and interact within the system. You'll use it to specify a tool's name and what it does. Crucially, you'll also indicate which agent the tool should navigate to. There's space to add a helpful description and optional notes for documentation, and you can even define a function to control when a tool is accessible to different agents.

## Interface IAgentConnectionService

This interface helps us define how agents connect and communicate within the system. Think of it as a blueprint for creating a public-facing service that manages agent connections, but without any of the internal workings. It ensures that the outside world only sees the necessary parts for interacting with agents.

## Interface IAgent

This interface defines how you interact with an individual agent within the swarm orchestration framework. It outlines the core actions you can perform, such as running the agent for a quick test without affecting its memory, or executing it to process information and potentially update its history. You can also use methods to manually add messages—like system prompts, developer notes, or user input—to the agent’s memory, or to control its tool usage, and even to reset its entire history. Essentially, it’s the blueprint for how you manage and direct a single agent's behavior.

## Interface IAdvisorSchema

This interface, `IAdvisorSchema`, defines the structure for an advisor within our AI agent swarm orchestration framework. Think of an advisor as a specialized agent that provides guidance or expertise. 

It includes a descriptive name (`advisorName`) to easily identify it and an optional `docDescription` to explain what the advisor does. You can also define `callbacks` to hook into specific advisor actions, allowing for custom behavior. 

The key function, `getChat`, lets you request advice or information from the advisor – it takes input arguments and returns a text response. This allows you to query the advisor for assistance within the swarm's workflow.

## Interface IAdvisorCallbacks

This interface defines functions your application can use to be notified about what's happening within the AI agent swarm. Specifically, you can register a function to be called whenever a chat interaction takes place. This allows you to monitor conversations or react to specific chat events in real-time. Think of it as a way to "listen in" on the conversations happening between the agents and potentially influence or log them.
