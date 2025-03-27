import { errorData, getErrorMessage, sleep } from "functools-kit";
import { roundTicks } from "../utils/roundTicks";
import { getExchangeInfo } from "../utils/getExchangeInfo";
import { binance } from "../config/binance";
import { calculateBuyUSDT } from "./calculateBuyUSDT";
import { getAveragePrice } from "../utils/getAveragePrice";

const BUY_ATTEMPTS = 6;
const BUY_ATTEMPT_DELAY = 10_000;

export const placeBuyOrderUSDT = async (usdtAmount: number, coin = "BTC") => {
    const symbol = `${coin}USDT`;
    try {
        const { price, quantity } = await calculateBuyUSDT(usdtAmount, coin);
        const { orderId, status, ...order } = await binance.order('BUY', symbol, quantity, price);
        if (status === 'FILLED') {
            return `The buy order was filled with price ${getAveragePrice(order, price)}`;
        } else {
            let isNotClosed = true;
            let lastStatus = null;
            for (let i = 0; i !== BUY_ATTEMPTS; i++) {
                await sleep(BUY_ATTEMPT_DELAY);
                lastStatus = await binance.orderStatus(symbol, orderId);
                if (lastStatus.status === 'FILLED') {
                    isNotClosed = false;
                    break;
                }
            }
            if (isNotClosed) {
                await binance.cancel(symbol, orderId);
                return "Buy order was not resolved in time and was canceled";
            } else {
                return `The buy order was filled with price ${getAveragePrice(lastStatus, price)}`;
            }
        }
    } catch (e) {
        console.error(getErrorMessage(e), errorData(e));
        return `An unexpected error aquired while placing buy order for ${coin}`;
    }
};
