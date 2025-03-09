import { IBus } from "./Bus.interface";
import { ILogger } from "./Logger.interface";
import { SessionId } from "./Session.interface";
import { SwarmName } from "./Swarm.interface";

export interface IPolicyCallbacks {
  onInit?: (policyName: PolicyName) => void;
  onValidateInput?: (
    incoming: string,
    clientId: SessionId,
    swarmName: SwarmName,
    policyName: PolicyName
  ) => void;
  onValidateOutput?: (
    outgoing: string,
    clientId: SessionId,
    swarmName: SwarmName,
    policyName: PolicyName
  ) => void;
  onBanClient?: (
    clientId: SessionId,
    swarmName: SwarmName,
    policyName: PolicyName
  ) => void;
  onUnbanClient?: (
    clientId: SessionId,
    swarmName: SwarmName,
    policyName: PolicyName
  ) => void;
}

export interface IPolicy {
  getBanMessage(clientId: SessionId, swarmName: SwarmName): Promise<string>;
  validateInput(
    incoming: string,
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<boolean>;
  validateOutput(
    outgoing: string,
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<boolean>;
  banClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;
  unbanClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;
}

export interface IPolicySchema {
  /** The description for documentation */
  docDescription?: string;
  policyName: PolicyName;
  banMessage?: string;
  getBanMessage?: (
    clientId: SessionId,
    policyName: PolicyName,
    swarmName: SwarmName
  ) => Promise<string | null> | string | null;
  getBannedClients: (
    policyName: PolicyName,
    swarmName: SwarmName
  ) => SessionId[] | Promise<SessionId[]>;
  setBannedClients?: (
    clientIds: SessionId[],
    policyName: PolicyName,
    swarmName: SwarmName
  ) => Promise<void> | void;
  validateInput?: (
    incoming: string,
    clientId: SessionId,
    policyName: PolicyName,
    swarmName: SwarmName
  ) => Promise<boolean> | boolean;
  validateOutput?: (
    outgoing: string,
    clientId: SessionId,
    policyName: PolicyName,
    swarmName: SwarmName
  ) => Promise<boolean> | boolean;
  callbacks?: IPolicyCallbacks;
}

export interface IPolicyParams extends IPolicySchema, IPolicyCallbacks {
  /** The logger instance. */
  logger: ILogger;
  /** The bus instance. */
  bus: IBus;
}

export type PolicyName = string;

export default IPolicy;
