import express from 'express';
import classRoutes from './routes/class.routes';
import webhookRoutes from './routes/webhook.routes';
import logger from './utils/logger';

const app = express();

app.use(express.json());

app.use('/api/classes', classRoutes);
app.use('/api/webhooks', webhookRoutes);

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

export default app;
