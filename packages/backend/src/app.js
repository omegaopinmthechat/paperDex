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
app.use(express.json());

// Internal routes (JWT-auth — web UI)
app.use('/api/v1', router);

// Public API routes (API key auth — programmatic access)
app.use('/api/v2', v2Router);

// app.get('/', (_req, res) => res.json({ status: 'ok' }));
app.get('/', (req, res) => {
    res.send("Hi there");
})

app.use(errorMiddleware);

export default app;

