import swarm from "src/lib";

export const commitSystemMessage = (content: string, clientId: string) => {
    swarm.sessionValidationService.validate(clientId, "commitSystemMessage");
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, "commitSystemMessage");
    swarm.sessionPublicService.commitSystemMessage(content, clientId, swarmName);
}
