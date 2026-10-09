import express from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env.js';
import { securityHeaders, corsPolicy, sanitizeInput, requireCustomHeader, globalLimiter } from './middleware/security.js';
import { notFound, errorHandler } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // behind Render/Railway/Nginx so rate-limit sees real IPs

app.use(securityHeaders);
app.use(corsPolicy);
app.use(compression());
// morgan logs method/url/status only — never bodies, so passwords can't land in logs
app.use(morgan(env.isProd ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(sanitizeInput);
app.use('/api', globalLimiter, requireCustomHeader);

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
