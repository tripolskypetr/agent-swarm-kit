import swarm from "src/lib";

export const commitSystemMessage = (content: string, clientId: string) => {
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName);
    swarm.sessionPublicService.commitSystemMessage(content, clientId, swarmName);
}
