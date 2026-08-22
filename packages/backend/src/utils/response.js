import STATUS_CODES from '../constants/statusCodes.js';

export const sendSuccess = (res, data, statusCode = STATUS_CODES.OK) =>
  res.status(statusCode).json({ success: true, data });

export const sendError = (res, statusCode, code, message) =>
  res.status(statusCode).json({ success: false, error: { code, message } });
