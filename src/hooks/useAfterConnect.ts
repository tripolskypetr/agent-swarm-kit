import IBaseEvent from "../model/Event.model";
import swarm from "../lib";

export const useAfterConnect = (
  clientId: string,
  fn: (event: IBaseEvent) => void
) => {
  swarm.loggerService.log("hook useAfterConnect", {
    clientId,
  });
  return swarm.busService.once(
    clientId,
    "session",
    ({ type }) => type === "connect",
    fn
  );
};

export default useAfterConnect;
