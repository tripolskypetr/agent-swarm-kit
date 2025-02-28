import { GLOBAL_CONFIG } from "src/config/params";
import objectFlat from "../utils/objectFlat";
import swarm from "../lib";

const LIST_SEPARATOR = Array.from({ length: 80 }, () => "-");

/**
 * Utility class for schema-related operations.
 */
export class SchemaUtils {
  /**
   * Serializes an object or an array of objects into a formatted string.
   *
   * @template T - The type of the object.
   * @param {T[] | T} data - The data to serialize.
   * @returns {string} The serialized string.
   */
  public serialize = <T extends object = any>(data: T[] | T): string => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log("SchemaUtils serialize", {
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
