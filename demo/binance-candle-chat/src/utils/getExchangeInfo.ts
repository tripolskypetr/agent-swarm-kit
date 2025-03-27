import { binance } from "../config/binance";

export const getExchangeInfo = async (symbol = "BTCUSDT", filterType = 'LOT_SIZE') => {
    const json = await binance.exchangeInfo();
    const lotSizes = Object.values<any>(json.symbols)
        .map(({ symbol, filters }) => [
            symbol,
            filters.find((f: any) => f.filterType === filterType),
        ])
        .reduce<any>((acm, [k, v]) => ({ ...acm, [k]: v }), {});
    const {
        stepSize,
        tickSize,
        minQty,
    } = lotSizes[symbol];
    return {
        stepSize,
        tickSize,
        minQty,
    };
}
