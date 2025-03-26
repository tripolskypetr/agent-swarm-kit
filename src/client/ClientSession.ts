import { not, Subject } from "functools-kit";
import { IIncomingMessage } from "../model/EmitMessage.model";

import {
  ExecutionMode,
  ISessionParams,
  ReceiveMessageFn,
  SendMessageFn,
} from "../interfaces/Session.interface";
import { ISession } from "../interfaces/Session.interface";
import { IBusEvent } from "../model/Event.model";
import { GLOBAL_CONFIG } from "../config/params";

/**
 * Represents a client session in the swarm system, implementing the ISession interface.
 * Manages message execution, emission, and agent interactions for a client within a swarm, with policy enforcement via ClientPolicy
 * and event-driven communication via BusService. Uses a Subject for output emission to subscribers.
 * Integrates with SessionConnectionService (session instantiation), SwarmConnectionService (agent/swarm access via SwarmSchemaService),
 * ClientAgent (execution/history), ClientPolicy (validation), and BusService (event emission).
 * @implements {ISession}
 */
export class ClientSession implements ISession {

  private _notifySubject = new Subject<string>();

  /**
   * Constructs a new ClientSession instance with the provided parameters.
   * Invokes the onInit callback if defined and logs construction if debugging is enabled.
   * @param {ISessionParams} params - The parameters for initializing the session, including clientId, swarmName, swarm, policy, bus, etc.
   */
  constructor(readonly params: ISessionParams) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} CTOR`,
        {
          params,
        }
      );
    this.params.onInit && this.params.onInit(params.clientId, params.swarmName);
  }

  /**
   * Sends a notification message to connect listeners via the internal `_notifySubject`.
   * Logs the notification if debugging is enabled.
   * 
   * @param {string} message - The notification message to send.
   * @returns {Promise<void>} Resolves when the message is successfully sent to subscribers.
   */
  async notify(message: string): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} notify`,
        {
          message,
        }
      );
    if (
      await not(
        this.params.policy.validateOutput(
          message,
          this.params.clientId,
          this.params.swarmName
        )
      )
    ) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        this.params.logger.debug(
          `ClientSession clientId=${this.params.clientId} notify method canceled due to the banhammer of a client`,
          {
            message,
          }
        );
      await this._notifySubject.next(
        await this.params.policy.getBanMessage(
          this.params.clientId,
          this.params.swarmName
        )
      );
      return;
    }
    await this._notifySubject.next(message);
  }

  /**
   * Emits a message to subscribers via swarm _emitSubject after validating it against the policy (ClientPolicy).
   * Emits the ban message if validation fails, notifying subscribers and logging via BusService.
   * Supports SwarmConnectionService by broadcasting session outputs within the swarm.
   * @param {string} message - The message to emit, typically an agent response or tool output.
   * @returns {Promise<void>} Resolves when the message (or ban message) is emitted and the event is logged.
   */
  async emit(message: string): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} emit`,
        {
          message,
        }
      );
    if (
      await not(
        this.params.policy.validateOutput(
          message,
          this.params.clientId,
          this.params.swarmName
        )
      )
    ) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        this.params.logger.debug(
          `ClientSession clientId=${this.params.clientId} emit method canceled due to the banhammer of a client`,
          {
            message,
          }
        );
      await this.params.swarm.emit(
        await this.params.policy.getBanMessage(
          this.params.clientId,
          this.params.swarmName
        )
      );
      return;
    }
    this.params.onEmit &&
      this.params.onEmit(this.params.clientId, this.params.swarmName, message);
    await this.params.swarm.emit(message);
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "emit",
      source: "session-bus",
      input: {
        message,
      },
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
  }

  /**
   * Executes a message using the swarm's agent (ClientAgent) and returns the output after policy validation.
   * Validates input and output via ClientPolicy, returning a ban message if either fails, with event logging via BusService.
   * Coordinates with SwarmConnectionService to fetch the agent and wait for output, supporting session-level execution.
   * @param {string} message - The message to execute, typically from a user or tool.
   * @param {ExecutionMode} mode - The execution mode (e.g., "user" or "tool"), determining context.
   * @returns {Promise<string>} The output of the execution, or a ban message if validation fails.
   */
  async execute(message: string, mode: ExecutionMode): Promise<string> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} execute`,
        {
          message,
          mode,
        }
      );
    if (
      await not(
        this.params.policy.validateInput(
          message,
          this.params.clientId,
          this.params.swarmName
        )
      )
    ) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        this.params.logger.debug(
          `ClientSession clientId=${this.params.clientId} execution canceled due to the banhammer of a client`,
          {
            message,
            mode,
          }
        );
      return await this.params.policy.getBanMessage(
        this.params.clientId,
        this.params.swarmName
      );
    }
    this.params.onExecute &&
      this.params.onExecute(
        this.params.clientId,
        this.params.swarmName,
        message,
        mode
      );
    const agent = await this.params.swarm.getAgent();
    const outputAwaiter = this.params.swarm.waitForOutput();
    agent.execute(message, mode);
    const output = await outputAwaiter;
    if (
      await not(
        this.params.policy.validateOutput(
          output,
          this.params.clientId,
          this.params.swarmName
        )
      )
    ) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        this.params.logger.debug(
          `ClientSession clientId=${this.params.clientId} execution output emit canceled due to the banhammer of a client`,
          {
            message,
            mode,
          }
        );
      return await this.params.policy.getBanMessage(
        this.params.clientId,
        this.params.swarmName
      );
    }
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "execute",
      source: "session-bus",
      input: {
        message,
        mode,
      },
      output: {
        result: output,
      },
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    return output;
  }

  /**
   * Runs a stateless completion of a message using the swarm's agent (ClientAgent) and returns the output.
   * Does not emit the result but logs the execution via BusService, bypassing output validation for stateless use cases.
   * Integrates with SwarmConnectionService to access the agent, supporting lightweight completions.
   * @param {string} message - The message to run, typically from a user or tool.
   * @returns {Promise<string>} The output of the completion, without emission or output validation.
   */
  async run(message: string): Promise<string> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} run`,
        {
          message,
        }
      );
    this.params.onRun &&
      this.params.onRun(this.params.clientId, this.params.swarmName, message);
    const agent = await this.params.swarm.getAgent();
    const output = await agent.run(message);
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "run",
      source: "session-bus",
      input: {
        message,
      },
      output: {
        result: output,
      },
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    return output;
  }

  /**
   * Commits tool output to the agent's history via the swarm’s agent (ClientAgent), logging the action via BusService.
   * Supports ToolSchemaService by linking tool output to tool calls, integrating with ClientAgent’s history management.
   * @param {string} toolId - The ID of the tool call (e.g., tool_call_id for OpenAI history), linking to the tool execution.
   * @param {string} content - The tool output content to commit.
   * @returns {Promise<void>} Resolves when the output is committed and the event is logged.
   */
  async commitToolOutput(toolId: string, content: string): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} commitToolOutput`,
        {
          content,
          toolId,
        }
      );
    const agent = await this.params.swarm.getAgent();
    const result = await agent.commitToolOutput(toolId, content);
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-tool-output",
      source: "session-bus",
      input: {
        toolId,
        content,
      },
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    return result;
  }

  /**
   * Commits a user message to the agent’s history via the swarm’s agent (ClientAgent) without triggering a response.
   * Logs the action via BusService, supporting SessionConnectionService’s session history tracking.
   * @param {string} message - The user message to commit, typically from client input.
   * @returns {Promise<void>} Resolves when the message is committed and the event is logged.
   */
  async commitUserMessage(message: string, mode: ExecutionMode): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} commitUserMessage`,
        {
          message,
          mode,
        }
      );
    const agent = await this.params.swarm.getAgent();
    const result = await agent.commitUserMessage(message, mode);
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-user-message",
      source: "session-bus",
      input: {
        message,
      },
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    return result;
  }

  /**
   * Commits a flush of the agent’s history via the swarm’s agent (ClientAgent), clearing it and logging via BusService.
   * Useful for resetting session state, coordinated with ClientHistory via ClientAgent.
   * @returns {Promise<void>} Resolves when the flush is committed and the event is logged.
   */
  async commitFlush(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} commitFlush`
      );
    const agent = await this.params.swarm.getAgent();
    const result = await agent.commitFlush();
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-flush",
      source: "session-bus",
      input: {},
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    return result;
  }

  /**
   * Signals the agent (via swarm’s ClientAgent) to stop the execution of subsequent tools, logging via BusService.
   * Supports ToolSchemaService by interrupting tool call chains, enhancing session control.
   * @returns {Promise<void>} Resolves when the stop signal is committed and the event is logged.
   */
  async commitStopTools(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} commitStopTools`
      );
    const agent = await this.params.swarm.getAgent();
    const result = await agent.commitStopTools();
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-stop-tools",
      source: "session-bus",
      input: {},
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    return result;
  }

  /**
   * Commits a system message to the agent’s history via the swarm’s agent (ClientAgent), logging via BusService.
   * Supports system-level updates within the session, coordinated with ClientHistory.
   * @param {string} message - The system message to commit, typically for configuration or context.
   * @returns {Promise<void>} Resolves when the message is committed and the event is logged.
   */
  async commitSystemMessage(message: string): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} commitSystemMessage`,
        {
          message,
        }
      );
    const agent = await this.params.swarm.getAgent();
    const result = await agent.commitSystemMessage(message);
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-system-message",
      source: "session-bus",
      input: {
        message,
      },
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    return result;
  }

  /**
   * Commits an assistant message to the agent’s history via the swarm’s agent (ClientAgent) without triggering execution.
   * Logs the action via BusService, supporting ClientHistory for assistant response logging.
   * @param {string} message - The assistant message to commit, typically an agent response.
   * @returns {Promise<void>} Resolves when the message is committed and the event is logged.
   */
  async commitAssistantMessage(message: string): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} commitAssistantMessage`,
        {
          message,
        }
      );
    const agent = await this.params.swarm.getAgent();
    const result = await agent.commitAssistantMessage(message);
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-assistant-message",
      source: "session-bus",
      input: {
        message,
      },
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    return result;
  }

  /**
   * Connects the session to a message connector, subscribing to emitted messages and returning a receiver function.
   * Links _emitSubject to the connector for outgoing messages and processes incoming messages via execute, supporting real-time interaction.
   * Integrates with SessionConnectionService for session lifecycle and SwarmConnectionService for agent metadata.
   * @param {SendMessageFn} connector - The function to handle outgoing messages, receiving data, agentName, and clientId.
   * @returns {ReceiveMessageFn<string>} A function to receive incoming messages (IIncomingMessage) and return processed output.
   */
  connect(connector: SendMessageFn): ReceiveMessageFn<string> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} connect`
      );
    this.params.onConnect &&
      this.params.onConnect(this.params.clientId, this.params.swarmName);
    this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "connect",
      source: "session-bus",
      input: {},
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    this._notifySubject.subscribe(async (data: string) => {
      await connector({
        data,
        agentName: await this.params.swarm.getAgentName(),
        clientId: this.params.clientId,
      });
    });
    return async (incoming: IIncomingMessage): Promise<string> => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        this.params.logger.debug(
          `ClientSession clientId=${this.params.clientId} connect call`
        );
      const data = await this.execute(incoming.data, "user");
      if (!data) {
        return "";
      }
      await connector({
        data,
        agentName: await this.params.swarm.getAgentName(),
        clientId: incoming.clientId,
      });
      return data;
    };
  }

  /**
   * Disposes of the session, performing cleanup and invoking the onDispose callback if provided.
   * Called when the session is no longer needed, ensuring proper resource release with SessionConnectionService.
   * @returns {Promise<void>} Resolves when disposal is complete and logged.
   */
  async dispose(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} dispose`
      );
    {
      this._notifySubject.unsubscribeAll();
    }
    this.params.onDispose &&
      this.params.onDispose(this.params.clientId, this.params.swarmName);
  }
}

/**
 * Default export of the ClientSession class.
 * Provides the primary implementation of the ISession interface for managing client sessions in the swarm system,
 * integrating with SessionConnectionService, SwarmConnectionService, ClientAgent, ClientPolicy, and BusService,
 * with policy-enforced message handling, agent execution, and event-driven communication.
 * @type {typeof ClientSession}
 */
export default ClientSession;
