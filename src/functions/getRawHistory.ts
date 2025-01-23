import swarm from "src/lib";

export const getRawHistory = async (clientId: string) => {
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    const agentName = await swarm.swarmPublicService.getAgentName(clientId, swarmName);
    return swarm.historyPublicService.toArrayForRaw(clientId, agentName);
};
