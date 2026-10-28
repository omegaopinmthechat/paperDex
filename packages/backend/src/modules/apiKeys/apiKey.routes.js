import { Router } from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validation.middleware.js';
import { createKeySchema } from './apiKey.validator.js';
import { listKeys, createKey, revokeKey } from './apiKey.controller.js';

const router = Router();

// All key-management routes require a valid JWT (web UI session only)
router.get('/',     authMiddleware, listKeys);
router.post('/',    authMiddleware, validate(createKeySchema), createKey);
router.delete('/:id', authMiddleware, revokeKey);

export default router;
