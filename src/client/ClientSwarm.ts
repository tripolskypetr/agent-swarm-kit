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
import { IToolRequest } from "../model/Tool.model";

const AGENT_NEED_FETCH = Symbol("agent-need-fetch");
const STACK_NEED_FETCH = Symbol("stack-need-fetch");

/**
 * A no-operation (noop) agent that serves as a fallback when an agent is not found in the swarm.
 * Implements the {@link IAgent} interface and logs calls to its methods, indicating that the requested agent is unavailable,
 * before delegating execution to a provided default agent. Used within the swarm system to handle invalid or missing agent references gracefully.
*/
class NoopAgent implements IAgent {
  /**
   * Creates a new NoopAgent instance.
   */
  constructor(
    readonly clientId: string,
    readonly swarmName: SwarmName,
    readonly agentName: AgentName,
    readonly defaultAgent: IAgent,
    readonly logger: ILogger
  ) {}

  /**
   * Logs an attempt to cancel output from the missing agent and delegates to the default agent's commitCancelOutput method.
   */
  async commitCancelOutput() {
    const message = `called commitCancelOutput on agent which not in the swarm clientId=${this.clientId} agentName=${this.agentName} swarmName=${this.swarmName}`;
    this.logger.log(message);
    console.error(message);
  }

  /**
   * Logs an attempt to run the missing agent and delegates to the default agent's run method.
   */
  async run(input: string) {
    const message = `called run on agent which not in the swarm clientId=${this.clientId} agentName=${this.agentName} swarmName=${this.swarmName}`;
    const context = {
      input,
    };
    this.logger.log(message, context);
    console.error(message, context);
    return await this.defaultAgent.run(input);
  }

  /**
   * Logs an attempt to execute the missing agent and delegates to the default agent's execute method.
   */
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

  /**
   * Logs an attempt to wait for output from the missing agent and delegates to the default agent's waitForOutput method.
   */
  async waitForOutput() {
    const message = `called waitForOutput on agent which not in the swarm clientId=${this.clientId} agentName=${this.agentName} swarmName=${this.swarmName}`;
    this.logger.log(message);
    console.error(message);
    return await this.defaultAgent.waitForOutput();
  }

  /**
   * Logs an attempt to commit tool output for the missing agent and delegates to the default agent's commitToolOutput method.
   */
  async commitToolOutput(toolId: string, content: string) {
    const message = `called commitToolOutput on agent which not in the swarm clientId=${this.clientId} agentName=${this.agentName} swarmName=${this.swarmName}`;
    const context = { toolId, content };
    this.logger.log(message, context);
    console.error(message, context);
    return await this.defaultAgent.commitToolOutput(toolId, content);
  }

  /**
   * Logs an attempt to commit a system message for the missing agent and delegates to the default agent's commitSystemMessage method.
   */
  async commitSystemMessage(content: string) {
    const message = `called commitToolOutput on agent which not in the swarm clientId=${this.clientId} agentName=${this.agentName} swarmName=${this.swarmName}`;
    const context = { content };
    this.logger.log(message, context);
    console.error(message, context);
    return await this.defaultAgent.commitSystemMessage(content);
  }

  /**
   * Logs an attempt to commit a developer message for the missing agent and delegates to the default agent's commitDeveloperMessage method.
   */
  async commitDeveloperMessage(content: string) {
    const message = `called commitDeveloperMessage on agent which not in the swarm clientId=${this.clientId} agentName=${this.agentName} swarmName=${this.swarmName}`;
    const context = { content };
    this.logger.log(message, context);
    console.error(message, context);
    return await this.defaultAgent.commitDeveloperMessage(content);
  }

  /**
   * Logs an attempt to commit a tool request for the missing agent and delegates to the default agent's commitToolRequest method.
   */
  async commitToolRequest(request: IToolRequest[]) {
    const message = `called commitToolOutput on agent which not in the swarm clientId=${this.clientId} agentName=${this.agentName} swarmName=${this.swarmName}`;
    const context = { request };
    this.logger.log(message, context);
    console.error(message, context);
    return await this.defaultAgent.commitToolRequest(request);
  }

  /**
   * Logs an attempt to commit a user message for the missing agent and delegates to the default agent's commitUserMessage method.
   */
  async commitUserMessage(content: string, mode: ExecutionMode) {
    const message = `called commitUserMessage on agent which not in the swarm clientId=${this.clientId} agentName=${this.agentName} swarmName=${this.swarmName}`;
    const context = { content, mode };
    this.logger.log(message, context);
    console.error(message, context);
    return await this.defaultAgent.commitUserMessage(content, mode);
  }

  /**
   * Logs an attempt to commit an assistant message for the missing agent and delegates to the default agent's commitAssistantMessage method.
   */
  async commitAssistantMessage(content: string) {
    const message = `called commitAssistantMessage on agent which not in the swarm clientId=${this.clientId} agentName=${this.agentName} swarmName=${this.swarmName}`;
    const context = { content };
    this.logger.log(message, context);
    console.error(message, context);
    return await this.defaultAgent.commitAssistantMessage(content);
  }

  /**
   * Logs an attempt to commit a flush operation for the missing agent and delegates to the default agent's commitFlush method.
   */
  async commitFlush() {
    const message = `called commitAssistantMessage on agent which not in the swarm clientId=${this.clientId} agentName=${this.agentName} swarmName=${this.swarmName}`;
    this.logger.log(message);
    console.error(message);
    return await this.defaultAgent.commitFlush();
  }

  /**
   * Logs an attempt to stop tools for the missing agent and delegates to the default agent's commitStopTools method.
   */
  async commitStopTools() {
    const message = `called commitStopTools on agent which not in the swarm clientId=${this.clientId} agentName=${this.agentName} swarmName=${this.swarmName}`;
    this.logger.log(message);
    console.error(message);
    return await this.defaultAgent.commitStopTools();
  }

  /**
   * Logs an attempt to commit an agent change for the missing agent and delegates to the default agent's commitAgentChange method.
   */
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
 * Supports ClientSession by providing output awaiting functionality, integrating with ClientAgent's waitForOutput.
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
*/
export class ClientSwarm implements ISwarm {
  private _isBusy = 0;

  /**
   * Returns the current busy state of the swarm.
   * Used to check if the swarm is currently processing an operation (e.g., waiting for output or switching agents).
   * Supports debugging and flow control in client applications.
   */
  public getCheckBusy() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} getCheckBusy`
      );
    return Promise.resolve(!!this._isBusy);
  }

  /**
   * Sets the busy state of the swarm.
   * Used internally to indicate when the swarm is processing an operation, such as waiting for output.
   * Enables coordinated state management and debugging.
   */
  public setBusy(isBusy: boolean) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} setBusy`,
        { isBusy }
      );
    this._isBusy += isBusy ? 1 : -1;
  }

  /**
   * Getter for the busy state of the swarm.
   * Used internally for optimizing performance and flow control.
   * Returns true if the swarm is currently busy with an operation, false otherwise.
   * Supports debugging and flow control in client applications.
   */
  public getBusy(): boolean {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} getBusy`,
      );
    return !!this._isBusy;
  }

  /**
   * Subject that emits when an agent reference changes, providing the agent name and instance.
   * Used by setAgentRef to notify subscribers (e.g., waitForOutput) of updates to agent instances.
   */
  _agentChangedSubject = new Subject<[agentName: AgentName, agent: IAgent]>();

  /**
   * The name of the currently active agent, or a symbol indicating it needs to be fetched.
   * Initialized as AGENT_NEED_FETCH, lazily populated by getAgentName via params.getActiveAgent.
   * Updated by setAgentName, persisted via params.setActiveAgent.
   */
  _activeAgent: AgentName | typeof AGENT_NEED_FETCH = AGENT_NEED_FETCH;

  /**
   * The navigation stack of agent names, or a symbol indicating it needs to be fetched.
   * Initialized as STACK_NEED_FETCH, lazily populated by navigationPop via params.getNavigationStack.
   * Updated by setAgentName (push) and navigationPop (pop), persisted via params.setNavigationStack.
   */
  _navigationStack: AgentName[] | typeof STACK_NEED_FETCH = STACK_NEED_FETCH;

  /**
   * Subject for emitting output messages to subscribers, used by emit and connect methods.
   * Provides an asynchronous stream of validated messages, supporting real-time updates to external connectors.
   * @readonly
   */
  readonly _emitSubject = new Subject<{
    agentName: string;
    output: string;
  }>();

  /**
   * Subject that emits to cancel output waiting, providing an empty output string and agent name.
   * Triggered by cancelOutput to interrupt waitForOutput, ensuring responsive cancellation.
   */
  _cancelOutputSubject = new Subject<{
    agentName: string;
    output: string;
  }>();

  /**
   * Getter for the list of agent name-agent pairs from the agent map (params.agentMap).
   * Provides a snapshot of available agents, used internally by waitForOutput to monitor outputs.
   */
  get _agentList(): [string, IAgent][] {
    return Object.entries(this.params.agentMap);
  }

  /**
   * Constructs a ClientSwarm instance with the provided parameters.
   * Initializes Subjects and logs construction if debugging is enabled, setting up the swarm structure.
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
   * Updates and persists the stack via params.setNavigationStack, supporting ClientSession's agent navigation.
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
   * Interrupts waitForOutput, ensuring responsive cancellation for ClientSession's execution flow.
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
    await Promise.all(
      this._agentList.map(async ([, agent]) => {
        await agent.commitCancelOutput();
      })
    );
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
   * Ensures only one wait operation runs at a time, handling cancellation and agent changes, supporting ClientSession's output retrieval.
   */
  waitForOutput = queued(
    async (): Promise<string> => await WAIT_FOR_OUTPUT_FN(this)
  ) as () => Promise<string>;

  /**
   * Retrieves the name of the active agent, lazily fetching it via params.getActiveAgent if not loaded.
   * Emits an event via BusService with the result, supporting ClientSession's agent identification.
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
   * Emits an event via BusService with the result, supporting ClientSession's execution and history operations.
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
   * Updates the reference to an agent in the swarm's agent map (params.agentMap), notifying subscribers via _agentChangedSubject.
   * Emits an event via BusService, supporting dynamic agent updates within ClientSession's execution flow.
   * @throws {Error} If the agent name is not found in params.agentMap, indicating an invalid agent.
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
   * Invokes the onAgentChanged callback and emits an event via BusService, supporting ClientSession's agent switching.
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
*/
export default ClientSwarm;
