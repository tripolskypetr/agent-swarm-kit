const baseServices = {
    loggerService: Symbol('loggerService'),
    contextService: Symbol('contextService'),
};

const connectionServices = {
    agentConnectionService: Symbol('agentConnectionService'),
    historyConnectionService: Symbol('historyConnectionService'),
    swarmConnectionService: Symbol('swarmConnectionService'),
    sessionConnectionService: Symbol('sessionConnectionService'),
};

const specServices = {
    completionSpecService: Symbol('completionSpecService'),
    agentSpecService: Symbol('agentSpecService'),
    swarmSpecService: Symbol('swarmSpecService'),
    toolSpecService: Symbol('toolSpecService'),
};

const publicServices = {
    agentPublicService: Symbol('agentPublicService'),
    historyPublicService: Symbol('historyPublicService'),
    sessionPublicService: Symbol('sessionPublicService'),
    swarmPublicService: Symbol('swarmPublicService'),
};

const validationServices = {
    agentValidationService: Symbol('agentValidationService'),
    toolValidationService: Symbol('toolValidationService'),
    sessionValidationService: Symbol('sessionValidationService'),
    swarmValidationService: Symbol('swarmValidationService'),
    completionValidationService: Symbol('completionValidationService'),
};

export const TYPES = {
    ...baseServices,
    ...specServices,
    ...connectionServices,
    ...publicServices,
    ...validationServices,
}

export default TYPES;
