import { IOutlineObjectFormat, IOutlineSchemaFormat } from "../interfaces/Outline.interface";

/**
 * Converts a given schema object into a JSON schema format object.
 *
 * @param {string} name - The name of the schema.
 * @param {IOutlineObjectFormat} schema - The schema definition object.
 * @returns {IOutlineSchemaFormat}
 *   An object containing the JSON schema representation.
 */
export const toJsonSchema = (name: string, schema: IOutlineObjectFormat): IOutlineSchemaFormat => ({
  type: "json_schema",
  json_schema: {
    name,
    strict: true,
    schema,
  },
});

export default toJsonSchema;
