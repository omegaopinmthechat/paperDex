import { Router } from 'express';
import { execCommand } from './terminal.controller.js';

const router = Router();

router.post('/exec', execCommand);

export default router;
