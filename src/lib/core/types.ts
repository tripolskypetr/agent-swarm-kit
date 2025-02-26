const baseServices = {
    busService: Symbol('busService'),
    loggerService: Symbol('loggerService'),
    contextService: Symbol('contextService'),
};

const connectionServices = {
    agentConnectionService: Symbol('agentConnectionService'),
    historyConnectionService: Symbol('historyConnectionService'),
    swarmConnectionService: Symbol('swarmConnectionService'),
    sessionConnectionService: Symbol('sessionConnectionService'),
    storageConnectionService: Symbol('storageConnectionService'),
    stateConnectionService: Symbol('stateConnectionService'),
};

const schemaServices = {
    completionSchemaService: Symbol('completionSchemaService'),
    agentSchemaService: Symbol('agentSchemaService'),
    swarmSchemaService: Symbol('swarmSchemaService'),
    toolSchemaService: Symbol('toolSchemaService'),
    embeddingSchemaService: Symbol('embeddingSchemaService'),
    storageSchemaService: Symbol('storageSchemaService'),
    stateSchemaService: Symbol('stateSchemaService'),
};

const publicServices = {
    agentPublicService: Symbol('agentPublicService'),
    historyPublicService: Symbol('historyPublicService'),
    sessionPublicService: Symbol('sessionPublicService'),
    swarmPublicService: Symbol('swarmPublicService'),
    storagePublicService: Symbol('storagePublicService'),
    statePublicService: Symbol('statePublicService'),
};

const validationServices = {
    agentValidationService: Symbol('agentValidationService'),
    toolValidationService: Symbol('toolValidationService'),
    sessionValidationService: Symbol('sessionValidationService'),
    swarmValidationService: Symbol('swarmValidationService'),
    completionValidationService: Symbol('completionValidationService'),
    embeddingValidationService: Symbol('embeddingValidationService'),
    storageValidationService: Symbol('storageValidationService'),
};

export const TYPES = {
    ...baseServices,
    ...schemaServices,
    ...connectionServices,
    ...publicServices,
    ...validationServices,
}

export default TYPES;
