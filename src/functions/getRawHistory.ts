import swarm from "../lib";

export const getRawHistory = async (clientId: string) => {
    swarm.sessionValidationService.validate(clientId, "getRawHistory");
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, "getRawHistory");
    const agentName = await swarm.swarmPublicService.getAgentName(clientId, swarmName);
    const history = await swarm.historyPublicService.toArrayForRaw(clientId, agentName);
    return [...history];
};
