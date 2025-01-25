import swarm from "src/lib";

export const commitToolOutput = (content: string, clientId: string) => {
    swarm.sessionValidationService.validate(clientId, "commitToolOutput");
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, "commitToolOutput");
    swarm.sessionPublicService.commitToolOutput(content, clientId, swarmName);
}
