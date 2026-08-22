import { Router } from 'express';
import validate from '../../middleware/validation.middleware.js';
import { nonceSchema, loginSchema } from './auth.validator.js';
import { getNonce, login } from './auth.controller.js';

const router = Router();

router.post('/nonce', validate(nonceSchema), getNonce);
router.post('/login', validate(loginSchema), login);

export default router;
