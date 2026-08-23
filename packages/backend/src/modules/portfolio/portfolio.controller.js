import { getPortfolio } from './portfolio.service.js';
import { sendSuccess } from '../../utils/response.js';

export const getPortfolioHandler = async (req, res, next) => {
  try {
    const data = await getPortfolio(req.user.wallet);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
