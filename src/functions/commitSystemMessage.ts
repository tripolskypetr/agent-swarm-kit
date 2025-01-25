import swarm from "src/lib";

export const commitSystemMessage = async (content: string, clientId: string, agentName: string) => {
    swarm.loggerService.log('function commitSystemMessage', {
        content,
        clientId,
        agentName,
    });
    swarm.agentValidationService.validate(agentName, "commitSystemMessage");
    swarm.sessionValidationService.validate(clientId, "commitSystemMessage");
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, "commitSystemMessage");
    const currentAgentName = await swarm.swarmPublicService.getAgentName(clientId, swarmName);
    if (currentAgentName !== agentName) {
        swarm.loggerService.log('function "commitSystemMessage" skipped due to the agent change', {
            currentAgentName,
            agentName,
            clientId,
        });
        return;
    }
    await swarm.sessionPublicService.commitSystemMessage(content, clientId, swarmName);
}
