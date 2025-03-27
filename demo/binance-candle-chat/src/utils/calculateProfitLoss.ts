export interface IOrderSchema {
  id: number;
  type: "buy" | "sell";
  quantity: string;
  price: string;
  coin: string;
}

export const calculateAverageCost = (purchases: IOrderSchema[]) => {
  let totalCost = 0;
  let totalCoins = 0;

  purchases
    .filter(({ type }) => type === "buy")
    .forEach((purchase) => {
      const cost = Number(purchase.price) * Number(purchase.quantity);
      totalCost += cost;
      totalCoins += Number(purchase.quantity);
    });

  return totalCoins > 0 ? totalCost / totalCoins : 0;
};

export const calculateProfitLoss = (purchases: IOrderSchema[]) => {
  const avgCost = calculateAverageCost(purchases);
  let totalProfitLoss = 0;

  purchases
    .filter(({ type }) => type === "sell")
    .forEach((sale) => {
      const saleRevenue = Number(sale.price) * Number(sale.quantity);
      const saleCost = avgCost * Number(sale.quantity);
      const profitLoss = saleRevenue - saleCost;
      totalProfitLoss += profitLoss;
    });

  return totalProfitLoss;
};
