import {
  AgentName,
  IAgentSchema,
  IAgentSchemaInternal,
} from "../interfaces/Agent.interface";
import removeUndefined from "./removeUndefined";

/**
 * Maps an external agent schema (`IAgentSchema`) to an internal agent schema (`IAgentSchemaInternal`).
 * Ensures that `system`, `systemStatic`, and `systemDynamic` properties are normalized into arrays or functions
 * that return arrays, making them consistent for internal use.
 *
*/
export const mapAgentSchema = ({
  system,
  systemDynamic,
  systemStatic,
  ...schema
}: IAgentSchema): IAgentSchemaInternal =>
  removeUndefined({
    ...schema,
    /**
     * Normalizes the `system` property into an array.
     * If `system` is already an array, it is returned as-is.
     * If `system` is a single value, it is wrapped in an array.
     * If `system` is undefined, it is cast to `never`.
    */
    system: system
      ? Array.isArray(system)
        ? system
        : [system]
      : (system as never),

    /**
     * Normalizes the `systemStatic` property into an array.
     * If `systemStatic` is already an array, it is returned as-is.
     * If `systemStatic` is a single value, it is wrapped in an array.
     * If `systemStatic` is undefined, it is cast to `never`.
    */
    systemStatic: systemStatic
      ? Array.isArray(systemStatic)
        ? systemStatic
        : [systemStatic]
      : (systemStatic as never),

    /**
     * Wraps the `systemDynamic` property in an asynchronous function.
     * The function resolves the dynamic system configuration and ensures it is returned as an array.
     * If `systemDynamic` is undefined, it is cast to `never`.
    */
    systemDynamic: systemDynamic
      ? async (clientId: string, agentName: AgentName) => {
          const system = await systemDynamic(clientId, agentName);
          const result = system
            ? Array.isArray(system)
              ? system
              : [system]
            : (system as never);
          return result;
        }
      : (systemDynamic as never),
  });

export default mapAgentSchema;
