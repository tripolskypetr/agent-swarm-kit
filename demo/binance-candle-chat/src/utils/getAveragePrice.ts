export const getAveragePrice = (order: { fills: [{ price: string }] }, fallbackPrice: string) => {
    const { fills = [] } = order;
    if (!fills.length) {
        return fallbackPrice;
    }
    const price = fills.reduce((acm, { price }) => acm + Number(price), 0);
    return price / fills.length;
};
