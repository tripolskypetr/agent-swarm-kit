import { GLOBAL_CONFIG } from "../config/params";
import objectFlat from "../utils/objectFlat";
import swarm from "../lib";
import beginContext from "src/utils/beginContext";

const LIST_SEPARATOR = Array.from({ length: 80 }, () => "-");

const METHOD_NAME_SERIALIZE = "SchemaUtils.serialize";
const METHOD_NAME_WRITE = "SchemaUtils.write";
const METHOD_NAME_READ = "SchemaUtils.read";

/**
 * Utility class for schema-related operations.
 */
export class SchemaUtils {
  /**
   * Writes a value to the session memory for a given client.
   *
   * @template T - The type of the value to write.
   * @param {string} clientId - The ID of the client.
   * @param {T} value - The value to write to the session memory.
   * @returns {T} The actual value from the session memory.
   */
  public writeSessionMemory = beginContext(
    (clientId: string, value: object) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_WRITE, {
          clientId,
          value,
        });
      swarm.sessionValidationService.validate(clientId, METHOD_NAME_WRITE);
      return swarm.memorySchemaService.writeValue(clientId, value);
    }
  ) as <T extends object = object>(clientId: string, value: T) => T;

  /**
   * Reads a value from the session memory for a given client.
   *
   * @template T - The type of the value to read.
   * @param {string} clientId - The ID of the client.
   * @returns {T} The value read from the session memory.
   */
  public readSessionMemory = beginContext((clientId: string): object => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_READ, {
        clientId,
      });
    swarm.sessionValidationService.validate(clientId, METHOD_NAME_READ);
    return swarm.memorySchemaService.readValue(clientId);
  }) as <T extends object = object>(clientId: string) => T;

  /**
   * Serializes an object or an array of objects into a formatted string.
   *
   * @template T - The type of the object.
   * @param {T[] | T} data - The data to serialize.
   * @returns {string} The serialized string.
   */
  public serialize = <T extends object = any>(data: T[] | T): string => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_SERIALIZE, {
        data,
      });
    if (Array.isArray(data)) {
      return data
        .map((item: T) =>
          objectFlat(item)
            .map(([key, value]) => [GLOBAL_CONFIG.CC_NAME_TO_TITLE(key), value])
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n")
        )
        .join(`\n${LIST_SEPARATOR}\n`);
    }
    return objectFlat(data)
      .map(([key, value]) => [GLOBAL_CONFIG.CC_NAME_TO_TITLE(key), value])
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
  };
}

/**
 * An instance of the SchemaUtils class.
 */
export const Schema = new SchemaUtils();

export default Schema;
