import swarm from "../lib";

export const getRawHistory = async (clientId: string) => {
    swarm.sessionValidationService.validate(clientId);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName);
    const agentName = await swarm.swarmPublicService.getAgentName(clientId, swarmName);
    return swarm.historyPublicService.toArrayForRaw(clientId, agentName);
};
