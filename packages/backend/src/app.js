import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import router from './routes/index.js';
import errorMiddleware from './middleware/error.middleware.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/v1', router);

app.get('/', (_req, res) => res.json({ status: 'ok' }));

app.use(errorMiddleware);

export default app;
