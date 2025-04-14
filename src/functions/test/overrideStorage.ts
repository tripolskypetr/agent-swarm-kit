import {
  IStorageData,
  IStorageSchema,
} from "../../interfaces/Storage.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.test.overrideStorage";

type TStorageSchema<T extends IStorageData = IStorageData> = {
  storageName: IStorageSchema<T>["storageName"];
} & Partial<IStorageSchema<T>>;

export const overrideStorage = beginContext(
  (storageSchema: TStorageSchema<IStorageData>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        storageSchema,
      });

    return swarm.storageSchemaService.override(
      storageSchema.storageName,
      storageSchema
    );
  }
) as <T extends IStorageData = IStorageData>(
  storageSchema: TStorageSchema<T>
) => IStorageSchema<T>;
