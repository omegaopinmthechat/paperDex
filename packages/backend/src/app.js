import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import router from './routes/index.js';
import v2Router from './routes/v2.js';
import errorMiddleware from './middleware/error.middleware.js';

// force push amar
const app = express();

app.use(helmet());
app.use(cors());

// Resilient body parsing: accept standard JSON and auto-repair unquoted PowerShell JSON (e.g. {token: ETHP, side: BUY, amount: 0.01})
app.use(express.text({ type: ['application/json', 'application/*+json', 'text/plain'], limit: '1mb' }));
app.use((req, res, next) => {
  if (typeof req.body === 'string' && req.body.trim().length > 0) {
    const raw = req.body.trim();
    try {
      req.body = JSON.parse(raw);
    } catch (err) {
      try {
        const repaired = raw
          .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
          .replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([,}])/g, ': "$1"$2')
          .replace(/:\s*([0-9.]+)\s*([,}])/g, ': "$1"$2');
        req.body = JSON.parse(repaired);
      } catch {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: `Malformed JSON payload: ${err.message}. Hint: When using curl in Windows PowerShell, escape inner double quotes with backslashes, e.g. -d '{\\"token\\":\\"ETHP\\",\\"side\\":\\"BUY\\",\\"amount\\":\\"0.01\\"}' or use pdx trade.`,
          },
        });
      }
    }
  } else if (!req.body || typeof req.body !== 'object') {
    req.body = {};
  }
  next();
});

// Internal routes (JWT-auth — web UI)
app.use('/api/v1', router);

// Public API routes (API key auth — programmatic access)
app.use('/api/v2', v2Router);

// app.get('/', (_req, res) => res.json({ status: 'ok' }));
app.get('/', (req, res) => {
    res.send("Hi there");
});

app.use(errorMiddleware);

export default app;

