import swarm from "src/lib";

export const commitToolOutput = (content: string, clientId: string) => {
    swarm.sessionValidationService.validate(clientId);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName);
    swarm.sessionPublicService.commitToolOutput(content, clientId, swarmName);
}
