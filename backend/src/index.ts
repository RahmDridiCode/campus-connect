import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import requestsRoutes from './routes/requests.routes';
import { hiddenRequestGuard } from './middlewares/hiddenRequest';
import {
  requestProposalsRouter,
  proposalActionsRouter,
  completeRequestRouter,
} from './routes/proposals.routes';
import reviewsRoutes from './routes/reviews.routes';
import reportsRoutes from './routes/reports.routes';
import dashboardRoutes from './routes/dashboard.routes';
import recommendationsRoutes from './routes/recommendations.routes';
import { errorHandler } from './middlewares/errorHandler';
import { optionalAuthMiddleware } from './middlewares/auth';

const app = express();

// ============================================
// CORS Configuration
// ============================================
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ============================================
// Middleware
// ============================================

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Optional authentication (attach user if token provided)
app.use(optionalAuthMiddleware);

// Request logging
app.use((_req: Request, _res: Response, next: NextFunction) => {
  console.log(`📨 ${_req.method} ${_req.path}`);
  next();
});

// ============================================
// Routes
// ============================================

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authRoutes);
app.use('/api/v1/requests/:id', optionalAuthMiddleware, hiddenRequestGuard);
app.use('/api/v1/requests', requestsRoutes);
app.use('/api/v1/requests/:id/proposals', requestProposalsRouter);
app.use('/api/v1/requests/:id/complete', completeRequestRouter);
app.use('/api/v1/proposals', proposalActionsRouter);
app.use('/api/v1/requests/:id/reviews', reviewsRoutes);
app.use('/api/v1/requests/:id/recommendations', recommendationsRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/admin/reports', reportsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
  });
});

// ============================================
// Error Handler (MUST be last)
// ============================================
app.use(errorHandler);

// ============================================
// Start Server
// ============================================
const PORT = config.port;

// En test (Jest), supertest démarre l'application lui-même : on n'écoute pas de port
const server =
  process.env.NODE_ENV === 'test'
    ? null
    : app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════╗
║   🚀 CampusConnect Backend Started    ║
╚════════════════════════════════════════╝

  📍 Server: http://localhost:${PORT}
  🔗 API: http://localhost:${PORT}/api/v1
  🌍 Frontend: ${config.frontendUrl}
  🔒 Environment: ${config.nodeEnv}

  Ready to accept requests! 🎉
  `);
      });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server?.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
