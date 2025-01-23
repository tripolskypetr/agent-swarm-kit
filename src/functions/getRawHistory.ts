import swarm from "../lib";

export const getRawHistory = async (clientId: string) => {
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.agentValidationService.validate(swarmName);
    const agentName = await swarm.swarmPublicService.getAgentName(clientId, swarmName);
    return swarm.historyPublicService.toArrayForRaw(clientId, agentName);
};
