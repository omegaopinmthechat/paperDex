import { executeTerminalCommand } from './terminal.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import ERROR_CODES from '../../constants/errorCodes.js';

export const execCommand = async (req, res) => {
  try {
    const { command } = req.body;

    if (!command || typeof command !== 'string') {
      return sendError(
        res,
        STATUS_CODES.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR,
        'Field "command" is required and must be a string.',
      );
    }

    // Optional default auth header from caller's session or custom header
    const defaultAuth = req.headers['x-api-key'] || req.headers['authorization'] || null;

    const result = await executeTerminalCommand(command, defaultAuth);
    return sendSuccess(res, result);
  } catch (err) {
    console.error('[terminal.controller.execCommand]', err);
    return sendError(
      res,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INTERNAL_ERROR,
      `Terminal execution failed: ${err.message}`,
    );
  }
};
