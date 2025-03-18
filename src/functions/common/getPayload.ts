import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { PayloadContextService } from "../../lib";

/** @private Constant defining the method name for logging purposes */
const METHOD_NAME = "function.common.getPayload";

/**
 * Retrieves the payload from the current PayloadContextService context.
 * Returns null if no context is available. Logs the operation if logging is enabled.
 * @template Payload - The type of the payload object, defaults to a generic object.
 * @returns the payload data from the context, or null if no context exists.
 * @example
 * const payload = await getPayload<{ id: number }>();
 * console.log(payload); // { id: number } or null
 */
export const getPayload = <
  Payload extends object = object
>(): Payload | null => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG && swarm.loggerService.log(METHOD_NAME);
  if (PayloadContextService.hasContext()) {
    const { payload } = swarm.payloadContextService.context;
    return payload as Payload;
  }
  return null;
};
