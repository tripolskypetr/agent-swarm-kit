const baseServices = {
    busService: Symbol('busService'),
    docService: Symbol('docService'),
    perfService: Symbol('perfService'),
    loggerService: Symbol('loggerService'),
};

const contextServices = {
    methodContextService: Symbol('methodContextService'),
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
    ...contextServices,
    ...schemaServices,
    ...connectionServices,
    ...publicServices,
    ...validationServices,
    ...metaServices,
}

export default TYPES;
