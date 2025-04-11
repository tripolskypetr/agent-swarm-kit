import {
  cancelable,
  CANCELED_PROMISE_SYMBOL,
  createAwaiter,
  queued,
  Subject,
} from "functools-kit";
import { GLOBAL_CONFIG } from "../config/params";
import { AgentName, IAgent } from "../interfaces/Agent.interface";
import ISwarm, { ISwarmParams, SwarmName } from "../interfaces/Swarm.interface";
import { IBusEvent } from "../model/Event.model";
import { ExecutionMode } from "../interfaces/Session.interface";
import { ILogger } from "../interfaces/Logger.interface";

const AGENT_NEED_FETCH = Symbol("agent-need-fetch");
const STACK_NEED_FETCH = Symbol("stack-need-fetch");

class NoopAgent implements IAgent {
  constructor(
    readonly clientId: string,
    readonly swarmName: SwarmName,
    readonly agentName: AgentName,
    readonly defaultAgent: IAgent,
    readonly logger: ILogger
  ) {}

  async run(input: string) {
    const message = `called run on agent which not in the swarm clientId=${this.clientId} agentName=${this.agentName} swarmName=${this.swarmName}`;
    const context = {
      input,
    };
    this.logger.log(message, context);
    console.error(message, context);
    return await this.defaultAgent.run(input);
  }

  async execute(input: string, mode: ExecutionMode) {
    const message = `called execute on agent which not in the swarm clientId=${this.clientId} agentName=${this.agentName} swarmName=${this.swarmName}`;
    const context = {
      input,
      mode,
    };
    this.logger.log(message, context);
    console.error(message, context);
    return await this.defaultAgent.execute(input, mode);
  }

  async waitForOutput() {
    const message = `called waitForOutput on agent which not in the swarm clientId=${this.clientId} agentName=${this.agentName} swarmName=${this.swarmName}`;
    this.logger.log(message);
    console.error(message);
    return await this.defaultAgent.waitForOutput();
  }

  async commitToolOutput(toolId: string, content: string) {
    const message = `called commitToolOutput on agent which not in the swarm clientId=${this.clientId} agentName=${this.agentName} swarmName=${this.swarmName}`;
    const context = { toolId, content };
    this.logger.log(message, context);
    console.error(message, context);
    return await this.defaultAgent.commitToolOutput(toolId, content);
  }

  async commitSystemMessage(content: string) {
    const message = `called commitToolOutput on agent which not in the swarm clientId=${this.clientId} agentName=${this.agentName} swarmName=${this.swarmName}`;
    const context = { content };
    this.logger.log(message, context);
    console.error(message, context);
    return await this.defaultAgent.commitSystemMessage(content);
  }

  async commitUserMessage(content: string, mode: ExecutionMode) {
    const message = `called commitUserMessage on agent which not in the swarm clientId=${this.clientId} agentName=${this.agentName} swarmName=${this.swarmName}`;
    const context = { content, mode };
    this.logger.log(message, context);
    console.error(message, context);
    return await this.defaultAgent.commitUserMessage(content, mode);
  }

  async commitAssistantMessage(content: string) {
    const message = `called commitAssistantMessage on agent which not in the swarm clientId=${this.clientId} agentName=${this.agentName} swarmName=${this.swarmName}`;
    const context = { content };
    this.logger.log(message, context);
    console.error(message, context);
    return await this.defaultAgent.commitAssistantMessage(content);
  }

  async commitFlush() {
    const message = `called commitAssistantMessage on agent which not in the swarm clientId=${this.clientId} agentName=${this.agentName} swarmName=${this.swarmName}`;
    this.logger.log(message);
    console.error(message);
    return await this.defaultAgent.commitFlush();
  }

  async commitStopTools() {
    const message = `called commitStopTools on agent which not in the swarm clientId=${this.clientId} agentName=${this.agentName} swarmName=${this.swarmName}`;
    this.logger.log(message);
    console.error(message);
    return await this.defaultAgent.commitStopTools();
  }

  async commitAgentChange() {
    const message = `called commitAgentChange on agent which not in the swarm clientId=${this.clientId} agentName=${this.agentName} swarmName=${this.swarmName}`;
    this.logger.log(message);
    console.error(message);
    return await this.defaultAgent.commitAgentChange();
  }
}

/**
 * Waits for output from an agent in the swarm, handling cancellation and agent changes with queued execution.
 * Resolves with the output from the active agent or an empty string if canceled, using Subjects for state management.
 * Supports ClientSession by providing output awaiting functionality, integrating with ClientAgent’s waitForOutput.
 * @param {ClientSwarm} self - The ClientSwarm instance managing the agent collection and output state.
 * @returns {Promise<string>} The output from the active agent, or an empty string if the operation is canceled.
 * @private
 */
const WAIT_FOR_OUTPUT_FN = async (self: ClientSwarm): Promise<string> => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientSwarm swarmName=${self.params.swarmName} clientId=${self.params.clientId} waitForOutput`
    );

  const [awaiter, { resolve }] = createAwaiter<{
    agentName: AgentName;
    output: string;
  }>();

  const getOutput = cancelable(
    async () =>
      await Promise.race(
        self._agentList
          .map(async ([agentName, agent]) => ({
            agentName,
            output: await agent.waitForOutput(),
          }))
          .concat(self._emitSubject.toPromise())
          .concat(self._cancelOutputSubject.toPromise())
      )
  );

  const handleOutput = () => {
    getOutput.cancel();
    getOutput().then((value) => {
      if (value === CANCELED_PROMISE_SYMBOL) {
        return;
      }
      resolve(value);
    });
  };

  const un = self._agentChangedSubject.subscribe(handleOutput);
  handleOutput();

  const { agentName, output } = await awaiter;
  un();

  const expectAgent = await self.getAgentName();

  agentName !== expectAgent &&
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientSwarm swarmName=${self.params.swarmName} clientId=${self.params.clientId} waitForAgent agent miss`,
      { agentName, expectAgent }
    );

  await self.params.bus.emit<IBusEvent>(self.params.clientId, {
    type: "wait-for-output",
    source: "swarm-bus",
    input: {},
    output: {
      result: output,
    },
    context: {
      swarmName: self.params.swarmName,
    },
    clientId: self.params.clientId,
  });

  return output;
};

/**
 * Manages a collection of agents within a swarm in the swarm system, implementing the ISwarm interface.
 * Handles agent switching, output waiting, and navigation stack management, with queued operations and event-driven updates via BusService.
 * Integrates with SwarmConnectionService (swarm instantiation), ClientSession (agent execution/output), ClientAgent (agent instances),
 * SwarmSchemaService (swarm structure), and BusService (event emission).
 * Uses Subjects for agent change notifications and output cancellation, ensuring coordinated agent interactions.
 * @implements {ISwarm}
 */
export class ClientSwarm implements ISwarm {
  /**
   * Subject that emits when an agent reference changes, providing the agent name and instance.
   * Used by setAgentRef to notify subscribers (e.g., waitForOutput) of updates to agent instances.
   * @type {Subject<[agentName: AgentName, agent: IAgent]>}
   */
  _agentChangedSubject = new Subject<[agentName: AgentName, agent: IAgent]>();

  /**
   * The name of the currently active agent, or a symbol indicating it needs to be fetched.
   * Initialized as AGENT_NEED_FETCH, lazily populated by getAgentName via params.getActiveAgent.
   * Updated by setAgentName, persisted via params.setActiveAgent.
   * @type {AgentName | typeof AGENT_NEED_FETCH}
   */
  _activeAgent: AgentName | typeof AGENT_NEED_FETCH = AGENT_NEED_FETCH;

  /**
   * The navigation stack of agent names, or a symbol indicating it needs to be fetched.
   * Initialized as STACK_NEED_FETCH, lazily populated by navigationPop via params.getNavigationStack.
   * Updated by setAgentName (push) and navigationPop (pop), persisted via params.setNavigationStack.
   * @type {AgentName[] | typeof STACK_NEED_FETCH}
   */
  _navigationStack: AgentName[] | typeof STACK_NEED_FETCH = STACK_NEED_FETCH;

  /**
   * Subject for emitting output messages to subscribers, used by emit and connect methods.
   * Provides an asynchronous stream of validated messages, supporting real-time updates to external connectors.
   * @type {Subject<string>}
   * @readonly
   */
  readonly _emitSubject = new Subject<{
    agentName: string;
    output: string;
  }>();

  /**
   * Subject that emits to cancel output waiting, providing an empty output string and agent name.
   * Triggered by cancelOutput to interrupt waitForOutput, ensuring responsive cancellation.
   * @type {Subject<{ agentName: string; output: string }>}
   */
  _cancelOutputSubject = new Subject<{
    agentName: string;
    output: string;
  }>();

  /**
   * Getter for the list of agent name-agent pairs from the agent map (params.agentMap).
   * Provides a snapshot of available agents, used internally by waitForOutput to monitor outputs.
   * @returns {[string, IAgent][]} An array of tuples containing agent names and their instances, sourced from Agent.interface.
   */
  get _agentList(): [string, IAgent][] {
    return Object.entries(this.params.agentMap);
  }

  /**
   * Constructs a ClientSwarm instance with the provided parameters.
   * Initializes Subjects and logs construction if debugging is enabled, setting up the swarm structure.
   * @param {ISwarmParams} params - The parameters for initializing the swarm, including clientId, swarmName, agentMap, getActiveAgent, etc.
   */
  constructor(readonly params: ISwarmParams) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} CTOR`,
        {
          params,
        }
      );
  }

  /**
   * Emits a message to subscribers via _emitSubject after validating it against the policy (ClientPolicy).
   * Emits the ban message if validation fails, notifying subscribers and logging via BusService.
   * Supports SwarmConnectionService by broadcasting session outputs within the swarm.
   * @param {string} message - The message to emit, typically an agent response or tool output.
   * @returns {Promise<void>} Resolves when the message (or ban message) is emitted and the event is logged.
   */
  async emit(message: string): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} emit`
      );
    await this._emitSubject.next({
      agentName: await this.getAgentName(),
      output: message,
    });
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
   * Pops the most recent agent from the navigation stack, falling back to the default agent if empty.
   * Updates and persists the stack via params.setNavigationStack, supporting ClientSession’s agent navigation.
   * @returns {Promise<string>} The name of the previous agent, or params.defaultAgent if the stack is empty.
   */
  async navigationPop(): Promise<string> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} navigationPop`
      );
    if (this._navigationStack === STACK_NEED_FETCH) {
      this._navigationStack = await this.params.getNavigationStack(
        this.params.clientId,
        this.params.swarmName
      );
    }
    const prevAgent = this._navigationStack.pop();
    await this.params.setNavigationStack(
      this.params.clientId,
      this._navigationStack,
      this.params.swarmName
    );
    return prevAgent ? prevAgent : this.params.defaultAgent;
  }

  /**
   * Cancels the current output wait by emitting an empty string via _cancelOutputSubject, logging via BusService.
   * Interrupts waitForOutput, ensuring responsive cancellation for ClientSession’s execution flow.
   * @returns {Promise<void>} Resolves when the cancellation is emitted and logged.
   */
  async cancelOutput(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} cancelOutput`
      );
    await this._cancelOutputSubject.next({
      agentName: await this.getAgentName(),
      output: "",
    });
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "cancel-output",
      source: "swarm-bus",
      input: {},
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
  }

  /**
   * Waits for output from the active agent in a queued manner, delegating to WAIT_FOR_OUTPUT_FN.
   * Ensures only one wait operation runs at a time, handling cancellation and agent changes, supporting ClientSession’s output retrieval.
   * @returns {Promise<string>} The output from the active agent, or an empty string if canceled.
   */
  waitForOutput = queued(
    async (): Promise<string> => await WAIT_FOR_OUTPUT_FN(this)
  ) as () => Promise<string>;

  /**
   * Retrieves the name of the active agent, lazily fetching it via params.getActiveAgent if not loaded.
   * Emits an event via BusService with the result, supporting ClientSession’s agent identification.
   * @returns {Promise<AgentName>} The name of the active agent, sourced from Agent.interface.
   */
  async getAgentName(): Promise<AgentName> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} getAgentName`
      );
    if (this._activeAgent === AGENT_NEED_FETCH) {
      this._activeAgent = await this.params.getActiveAgent(
        this.params.clientId,
        this.params.swarmName,
        this.params.defaultAgent
      );
    }
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "get-agent-name",
      source: "swarm-bus",
      input: {},
      output: {
        activeAgent: this._activeAgent,
      },
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    return this._activeAgent;
  }

  /**
   * Retrieves the active agent instance (ClientAgent) based on its name from params.agentMap.
   * Emits an event via BusService with the result, supporting ClientSession’s execution and history operations.
   * @returns {Promise<IAgent>} The active agent instance, sourced from Agent.interface.
   */
  async getAgent(): Promise<IAgent> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} getAgent`
      );
    const agentName = await this.getAgentName();
    const result = this.params.agentMap[agentName];
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "get-agent",
      source: "swarm-bus",
      input: {},
      output: {
        agentName,
        result,
      },
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    if (!result) {
      console.error(
        `agent-swarm ClientSwarm getAgent current agent is not in the swarm agentName=${agentName} clientId=${this.params.clientId} swarmName=${this.params.swarmName}`
      );
      return new NoopAgent(
        this.params.clientId,
        this.params.swarmName,
        agentName,
        this.params.agentMap[this.params.defaultAgent],
        this.params.logger
      );
    }
    return result;
  }

  /**
   * Updates the reference to an agent in the swarm’s agent map (params.agentMap), notifying subscribers via _agentChangedSubject.
   * Emits an event via BusService, supporting dynamic agent updates within ClientSession’s execution flow.
   * @param {AgentName} agentName - The name of the agent to update, sourced from Agent.interface.
   * @param {IAgent} agent - The new agent instance (ClientAgent) to set.
   * @throws {Error} If the agent name is not found in params.agentMap, indicating an invalid agent.
   * @returns {Promise<void>} Resolves when the agent reference is updated, emitted, and subscribers are notified.
   */
  async setAgentRef(agentName: AgentName, agent: IAgent): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} setAgentRef agentName=${agentName}`
      );
    if (!this.params.agentMap[agentName]) {
      throw new Error(`agent-swarm agent ${agentName} not in the swarm`);
    }
    this.params.agentMap[agentName] = agent;
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "set-agent-ref",
      source: "swarm-bus",
      input: {
        agentName,
        agent,
      },
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    await this._agentChangedSubject.next([agentName, agent]);
  }

  /**
   * Sets the active agent by name, updates the navigation stack, and persists the change via params.setActiveAgent/setNavigationStack.
   * Invokes the onAgentChanged callback and emits an event via BusService, supporting ClientSession’s agent switching.
   * @param {AgentName} agentName - The name of the agent to set as active, sourced from Agent.interface.
   * @returns {Promise<void>} Resolves when the agent is set, stack is updated, and the event is logged.
   */
  async setAgentName(agentName: AgentName): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} setAgentName agentName=${agentName}`
      );
    this._activeAgent = agentName;
    await this.params.setActiveAgent(
      this.params.clientId,
      agentName,
      this.params.swarmName
    );
    if (this.params.callbacks?.onAgentChanged) {
      this.params.callbacks.onAgentChanged(
        this.params.clientId,
        agentName,
        this.params.swarmName
      );
    }
    if (this._navigationStack === STACK_NEED_FETCH) {
      this._navigationStack = await this.params.getNavigationStack(
        this.params.clientId,
        this.params.swarmName
      );
    }
    this._navigationStack.push(agentName);
    await this.params.setNavigationStack(
      this.params.clientId,
      this._navigationStack,
      this.params.swarmName
    );
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "set-agent-name",
      source: "swarm-bus",
      input: {
        agentName,
      },
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
  }

  /**
   * Disposes of the swarm, performing cleanup
   * Called when the swarm is no longer needed, ensuring proper resource release.
   * @returns {Promise<void>} Resolves when disposal is complete and logged.
   */
  async dispose(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} dispose`
      );
    {
      this._agentChangedSubject.unsubscribeAll();
      this._emitSubject.unsubscribeAll();
      this._cancelOutputSubject.unsubscribeAll();
    }
  }
}

/**
 * Default export of the ClientSwarm class.
 * Provides the primary implementation of the ISwarm interface for managing a collection of agents in the swarm system,
 * integrating with SwarmConnectionService, ClientSession, ClientAgent, SwarmSchemaService, and BusService,
 * with queued output waiting, agent switching, navigation stack management, and event-driven updates.
 * @type {typeof ClientSwarm}
 */
export default ClientSwarm;
