import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { PayloadContextService } from "../../lib";

/** @private Constant defining the method name for logging purposes */
const METHOD_NAME = "function.common.getPayload";

/**
 * Function implementation
 */
const getPayloadInternal = () => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG && swarm.loggerService.log(METHOD_NAME);
  if (PayloadContextService.hasContext()) {
    const { payload } = swarm.payloadContextService.context;
    return payload as unknown;
  }
  return null;
};

/**
 * Retrieves the payload from the current PayloadContextService context.
 * Returns null if no context is available. Logs the operation if logging is enabled.
 * @template Payload - The type of the payload object, defaults to a generic object.
 * @example
 * const payload = await getPayload<{ id: number }>();
 * console.log(payload); // { id: number } or null
 */
export function getPayload<
  Payload extends object = object
>(): Payload | null {
  return getPayloadInternal() as Payload;
}
