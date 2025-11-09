import { ICompletionSchema } from "../interfaces/Completion.interface";
import { IBaseCompletionArgs } from "../contract/BaseCompletion.contract";
import { IOutlineCompletionArgs } from "../contract/OutlineCompletion.contract";
import { ISwarmCompletionArgs } from "../contract/SwarmCompletion.contract";
import removeUndefined from "./removeUndefined";
import { errorSubject } from "../config/emitters";
import { IBaseMessage } from "../contract/BaseMessage.contract";

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
      ? async (args: IBaseCompletionArgs<IBaseMessage> | IOutlineCompletionArgs<IBaseMessage> | ISwarmCompletionArgs<IBaseMessage>) => {
          try {
            return await getCompletion(args);
          } catch (error) {
            if ("clientId" in args && args.clientId) {
              errorSubject.next([args.clientId, error]);
            }
            return {
              agentName: ("agentName" in args && args.agentName) || "",
              content: "",
              mode: args.mode,
              role: "assistant",
            };
          }
        }
      : undefined,
  });

export default mapCompletionSchema;
