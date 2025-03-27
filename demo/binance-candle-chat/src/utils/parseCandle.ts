export interface IBinanceCandle {
    time: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    closeTime: string;
    assetVolume: string;
    trades: string;
    buyBaseVolume: string;
    buyAssetVolume: string;
    ignored: string;
}

export const parseCandle = (candle: string[]): IBinanceCandle => ({
    time: Number(candle[0]),
    open: candle[1],
    high: candle[2],
    low: candle[3],
    close: candle[4],
    volume: candle[5],
    closeTime: candle[6],
    assetVolume: candle[7],
    trades: candle[8],
    buyBaseVolume: candle[9],
    buyAssetVolume: candle[10],
    ignored: candle[11]
});
