import { AgentName } from "../interfaces/Agent.interface";

export interface IPipelineSchema<Payload extends object = any> {
    pipelineName: PipelineName;
    execute: <T = any>(clientId: string, payload: Payload, agentName: AgentName) => Promise<T>;
    callbacks?: Partial<IPipelineCallbacks<Payload>>;
}

export interface IPipelineCallbacks<Payload extends object = any> {
    onStart: (clientId: string, pipelineName: PipelineName, payload: Payload) => void;
    onEnd: (clientId: string, pipelineName: PipelineName, payload: Payload, isError: boolean) => void;
    onError: (clientId: string, pipelineName: PipelineName, ayload: Payload, error: Error) => void;
}

export type PipelineName = string;
