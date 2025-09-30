
/**
 * JSON Schema type definition
*/
export interface JsonSchema {
  type?: string;
  properties?: Record<string, any>;
  required?: string[];
  /**
   * Whether additional properties are allowed in the schema.
   * Controls validation strictness for object schemas.
   */
  additionalProperties?: boolean;
  [key: string]: any;
}

/**
 * Result of tool arguments validation
*/
export interface ValidationResult<T = any> {
  /** Whether validation was successful*/
  success: boolean;
  /** Parsed and validated data (only present when success is true)*/
  data?: T;
  /** Error message (only present when success is false)*/
  error?: string;
}

/**
 * Validates tool function arguments against a JSON schema
 * 
 * 
 * @example
 * ```typescript
 * const result = validateToolArguments({ name: "test" }, {
 *   type: "object",
 *   required: ["name"],
 *   properties: { name: { type: "string" } }
 * });
 * 
 * if (result.success) {
 *   console.log(result.data); // { name: "test" }
 * } else {
 *   console.error(result.error);
 * }
 * ```
*/
export const validateToolArguments = <T = any>(
  parsedArguments: unknown,
  schema: JsonSchema
): ValidationResult<T> => {
  // Check if arguments are null or undefined only when required fields exist
  if (parsedArguments == null) {
    if (schema?.required?.length) {
      return {
        success: false,
        error: "Tool call has empty arguments",
      };
    }
    // If no required fields, empty arguments is valid
    return {
      success: true,
      data: {} as T,
    };
  }

  // Validate required fields if schema has them
  if (schema?.required?.length) {
    const argumentsObj = parsedArguments as Record<string, any>;
    const missingFields = schema.required.filter(
      (field: string) => !(field in argumentsObj)
    );
    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`,
      };
    }
  }

  return {
    success: true,
    data: parsedArguments as T,
  };
};

export default validateToolArguments;
