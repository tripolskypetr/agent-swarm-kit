import { not, queued, sleep, Subject } from "functools-kit";
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
import { IToolRequest } from "../model/Tool.model";
import swarm from "../lib";
import ClientSwarm from "./ClientSwarm";

const BUSY_DELAY = 100;

const AQUIRE_LOCK_FN = async (self: ClientSession) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientSession clientId=${self.params.clientId} AQUIRE_LOCK_FN`
    );
  const swarm = self.params.swarm as ClientSwarm;
  while (swarm.getBusy()) {
    await sleep(BUSY_DELAY);
  }
  swarm.setBusy(true);
}

const RELEASE_LOCK_FN = async (self: ClientSession) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientSession clientId=${self.params.clientId} RELEASE_LOCK_FN`
    );
  const swarm = self.params.swarm as ClientSwarm;
  swarm.setBusy(false);
}

/**
 * Represents a client session in the swarm system, implementing the ISession interface.
 * Manages message execution, emission, and agent interactions for a client within a swarm, with policy enforcement via ClientPolicy
 * and event-driven communication via BusService. Uses a Subject for output emission to subscribers.
 * Integrates with SessionConnectionService (session instantiation), SwarmConnectionService (agent/swarm access via SwarmSchemaService),
 * ClientAgent (execution/history), ClientPolicy (validation), and BusService (event emission).
 *  */
export class ClientSession implements ISession {
  private _notifySubject = new Subject<string>();

  private AQUIRE_LOCK = queued(AQUIRE_LOCK_FN);

  /**
   * Constructs a new ClientSession instance with the provided parameters.
   * Invokes the onInit callback if defined and logs construction if debugging is enabled.
   *    */
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
   *    *    */
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
   *    *    */
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
   *    *    *    */
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
    if (mode === "user") {
      await this.AQUIRE_LOCK(this);
    }
    const outputAwaiter = this.params.swarm.waitForOutput();
    agent.execute(message, mode);
    let output = "";
    try {
      output = await outputAwaiter;
    } finally {
      if (mode === "user") {
        await RELEASE_LOCK_FN(this);
      }
    }
    await swarm.executionValidationService.flushCount(
      this.params.clientId,
      this.params.swarmName,
    );
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
   *    *    */
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
   *    *    *    */
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
   *    *    */
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
   *    */
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
   *    */
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
   * Commits a tool request to the agent's history via the swarm’s agent (ClientAgent) and logs the action via BusService.
   * Supports ToolSchemaService by linking tool requests to tool execution, integrating with ClientAgent’s history management.
   * 
   *    *    */
  async commitToolRequest(request: IToolRequest[]): Promise<string[]> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} commitToolRequest`,
        {
          request,
        }
      );
    const agent = await this.params.swarm.getAgent();
    const result = await agent.commitToolRequest(request);
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-tool-request",
      source: "session-bus",
      input: {
        request,
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
   * Commits a system message to the agent’s history via the swarm’s agent (ClientAgent), logging via BusService.
   * Supports system-level updates within the session, coordinated with ClientHistory.
   *    *    */
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
   * Commits a developer message to the agent’s history via the swarm’s agent (ClientAgent), logging the action via BusService.
   *    * Commits a developer message to the agent’s history via the swarm’s agent (ClientAgent), logging the action via BusService.
   * Supports internal debugging or developer notes within the session, enhancing ClientHistory.
   * @throws {Error} If committing the message fails.
   * 
  async commitDeveloperMessage(message: string): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} commitDeveloperMessage`,
        {
          message,
        }
      );
    const agent = await this.params.swarm.getAgent();
    const result = await agent.commitDeveloperMessage(message);
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-developer-message",
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
   *    *    */
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
   *    *    */
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
      await swarm.executionValidationService.flushCount(
        this.params.clientId,
        this.params.swarmName,
      );
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
      await swarm.executionValidationService.flushCount(
        this.params.clientId,
        this.params.swarmName,
      );
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
   *    */
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
 *  */
export default ClientSession;
