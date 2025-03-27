import Binance from "node-binance-api";

export const binance = new Binance().options({
    family: 4,
    useServerTime: true,
});
