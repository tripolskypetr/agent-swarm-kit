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
    schemaContextService: Symbol('schemaContextService'),
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
    mcpConnectionService: Symbol('mcpConnectionService'),
    computeConnectionService: Symbol('computeConnectionService'),
    sharedComputeConnectionService: Symbol('sharedComputeConnectionService'),
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
    advisorSchemaService: Symbol('advisorSchemaService'),
    mcpSchemaService: Symbol('mcpSchemaService'),
    computeSchemaService: Symbol('computeSchemaService'),
    pipelineSchemaService: Symbol('pipelineSchemaService'),
    navigationSchemaService: Symbol('navigationSchemaService'),
    outlineSchemaService: Symbol('outlineSchemaService'),
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
    mcpPublicService: Symbol('mcpPublicService'),
    computePublicService: Symbol('computePublicService'),
    sharedComputePublicService: Symbol('sharedComputePublicService'),
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
    advisorValidationService: Symbol('advisorValidationService'),
    mcpValidationService: Symbol('mcpValidationService'),
    computeValidationService: Symbol('computeValidationService'),
    stateValidationService: Symbol('stateValidationService'),
    pipelineValidationService: Symbol('pipelineValidationService'),
    executionValidationService: Symbol('executionValidationService'),
    outlineValidationService: Symbol('outlineValidationService'),
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
