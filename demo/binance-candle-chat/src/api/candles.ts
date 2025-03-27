import { ttl } from "functools-kit";
import { binance } from "../config/binance";
import { parseCandle, type IBinanceCandle } from "../utils/parseCandle";

const LAST_HOUR_CANDLER = 7;
const CANDLE_DIMENSION = "1d";
const CANDLE_TTL = 10 * 60 * 1_000;

export const candles = ttl(async (coin = "BTC"): Promise<{
    low: number;
    high: number;
    close: number;
    closeTime: string;
}[]> => {
    const symbol = `${coin}USDT`;
    const ticks = await binance.candlesticks(symbol, CANDLE_DIMENSION, false, {
        limit: LAST_HOUR_CANDLER
    });
    return ticks.map(parseCandle).map((candle: IBinanceCandle) => ({
        low: candle.low,
        high: candle.high,
        close: candle.close,
        closeTime: new Date(candle.closeTime).toISOString(),
    }));
}, {
    key: ([coin]) => coin ?? "BTC",
    timeout: CANDLE_TTL,
});
