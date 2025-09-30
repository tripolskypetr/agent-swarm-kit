import { scoped } from "di-scoped";

/**
 * Interface defining the structure of a payload context, used to encapsulate execution metadata and payload data.
 * @template Payload - The type of the payload object, defaults to a generic object.
*/
export interface IPayloadContext<Payload extends object = object> {
  /** The unique identifier of the client associated with this context.*/
  clientId: string;
  /** The payload data carried by this context, typed according to the Payload generic.*/
  payload: Payload;
}

/**
 * A scoped service class that encapsulates a payload context for dependency injection.
 * Provides a way to access execution metadata and payload data within a specific scope.
 * Scoped using `di-scoped` to ensure instance isolation per scope.
*/
export const PayloadContextService = scoped(
  class {
    /**
     * Creates a new instance of PayloadContextService with the provided context.
    */
    constructor(readonly context: IPayloadContext) {}
  }
);

/**
 * Type alias for an instance of PayloadContextService.
 * Represents the concrete type of a scoped PayloadContextService instance.
*/
export type TPayloadContextService = InstanceType<typeof PayloadContextService>;

/**
 * Default export of the PayloadContextService class.
 * Provides a scoped service for managing payload contexts in dependency injection scenarios.
*/
export default PayloadContextService;
