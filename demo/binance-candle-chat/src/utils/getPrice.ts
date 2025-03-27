import { binance } from "../config/binance";
import { parseCandle, type IBinanceCandle } from "./parseCandle";

const getConvertPrice = async (symbol = "BTCUSDT") => {
    const prices = await binance.prices(symbol);
    const price = prices[symbol];
    return price;
}

export const getPrice = async (symbol = "BTCUSDT") => {
    const ticks = await binance.candlesticks(symbol, "1m");
    const candles: IBinanceCandle[] = ticks.map(parseCandle);
    const sorted = candles.sort(({time: a}, {time: b}) => b - a);
    const [ lastTick ] = sorted;
    const { high } = lastTick;
    const binancePrice = await getConvertPrice(symbol);
    return Math.min(Number(binancePrice), Number(high));
};
