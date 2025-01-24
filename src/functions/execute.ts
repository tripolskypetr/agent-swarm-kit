import swarm from "../lib";

export const execute = async (content: string, clientId: string) => {
    swarm.sessionValidationService.validate(clientId);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName);
    return await swarm.sessionPublicService.execute(content, clientId, swarmName);
};
