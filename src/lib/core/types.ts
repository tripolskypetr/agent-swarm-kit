const baseServices = {
    busService: Symbol('busService'),
    docService: Symbol('docService'),
    perfService: Symbol('perfService'),
    aliveService: Symbol('aliveService'),
    loggerService: Symbol('loggerService'),
};

const contextServices = {
    methodContextService: Symbol('methodContextService'),
    payloadContextService: Symbol('payloadContextService'),
    executionContextService: Symbol('executionContextService'),
};

const connectionServices = {
    agentConnectionService: Symbol('agentConnectionService'),
    historyConnectionService: Symbol('historyConnectionService'),
    swarmConnectionService: Symbol('swarmConnectionService'),
    sessionConnectionService: Symbol('sessionConnectionService'),
    storageConnectionService: Symbol('storageConnectionService'),
    sharedStorageConnectionService: Symbol('sharedStorageConnectionService'),
    stateConnectionService: Symbol('stateConnectionService'),
    sharedStateConnectionService: Symbol('sharedStateConnectionService'),
    policyConnectionService: Symbol('policyConnectionService'),
};

const schemaServices = {
    completionSchemaService: Symbol('completionSchemaService'),
    agentSchemaService: Symbol('agentSchemaService'),
    swarmSchemaService: Symbol('swarmSchemaService'),
    toolSchemaService: Symbol('toolSchemaService'),
    embeddingSchemaService: Symbol('embeddingSchemaService'),
    storageSchemaService: Symbol('storageSchemaService'),
    stateSchemaService: Symbol('stateSchemaService'),
    memorySchemaService: Symbol('memorySchemaService'),
    policySchemaService: Symbol('policySchemaService'),
};

const metaServices = {
    agentMetaService: Symbol('agentMetaService'),
    swarmMetaService: Symbol('swarmMetaService'),
};

const publicServices = {
    agentPublicService: Symbol('agentPublicService'),
    historyPublicService: Symbol('historyPublicService'),
    sessionPublicService: Symbol('sessionPublicService'),
    swarmPublicService: Symbol('swarmPublicService'),
    storagePublicService: Symbol('storagePublicService'),
    sharedStoragePublicService: Symbol('sharedStoragePublicService'),
    statePublicService: Symbol('statePublicService'),
    sharedStatePublicService: Symbol('sharedStatePublicService'),
    policyPublicService: Symbol('policyPublicService'),
};

const validationServices = {
    agentValidationService: Symbol('agentValidationService'),
    toolValidationService: Symbol('toolValidationService'),
    sessionValidationService: Symbol('sessionValidationService'),
    swarmValidationService: Symbol('swarmValidationService'),
    completionValidationService: Symbol('completionValidationService'),
    embeddingValidationService: Symbol('embeddingValidationService'),
    storageValidationService: Symbol('storageValidationService'),
    policyValidationService: Symbol('policyValidationService'),
    navigationValidationService: Symbol('navigationValidationService'),
};

export const TYPES = {
    ...baseServices,
    ...contextServices,
    ...schemaServices,
    ...connectionServices,
    ...publicServices,
    ...validationServices,
    ...metaServices,
}

export default TYPES;
