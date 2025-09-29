import { ICompletionSchema } from "../interfaces/Completion.interface";
import removeUndefined from "./removeUndefined";
import { errorSubject } from "../config/emitters";

type TCompletionSchema = {
  completionName: ICompletionSchema["completionName"];
} & Partial<ICompletionSchema>;

/**
 * Maps a completion schema by wrapping its `getCompletion` method with error handling.
 * If an error occurs during the execution of `getCompletion`, it emits the error using `errorSubject`.
 * Also removes any undefined properties from the resulting schema object.
 *
 */
export const mapCompletionSchema = ({
  getCompletion,
  ...schema
}: TCompletionSchema): ICompletionSchema =>
  removeUndefined({
    ...schema,
    getCompletion: getCompletion
      ? async ({
          mode,
          messages,
          agentName,
          clientId,
          format,
          outlineName,
          tools,
        }) => {
          const params = {
            mode,
            messages,
            agentName,
            clientId,
            format,
            outlineName,
            tools,
          };
          try {
            return await getCompletion(params);
          } catch (error) {
            if (clientId) {
              errorSubject.next([clientId, error]);
            }
            return {
              agentName,
              content: "",
              mode,
              role: "assistant",
            };
          }
        }
      : undefined,
  });

export default mapCompletionSchema;
