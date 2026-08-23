import { getAllTokenBalances } from '../blockchain/token.service.js';
import { getAllPrices } from '../oracle/price.service.js';

export const getPortfolio = async (walletAddress) => {
  const [balances, markets] = await Promise.all([
    getAllTokenBalances(walletAddress),
    getAllPrices(),
  ]);

  const priceMap = Object.fromEntries(markets.map((m) => [m.symbol, m]));

  return Object.entries(balances).map(([symbol, balance]) => {
    const market = priceMap[symbol] ?? { price: symbol === 'USDTP' ? 1 : null, change24h: 0 };
    const balanceNum = parseFloat(balance);
    const usdValue = market.price != null ? balanceNum * market.price : null;
    return {
      symbol,
      balance,
      price: market.price,
      change24h: market.change24h ?? 0,
      usdValue: usdValue != null ? usdValue.toFixed(2) : null,
    };
  });
};
