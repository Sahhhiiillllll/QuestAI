import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import mongoose from 'mongoose';
import { wsManager } from './services/websocket';
import assignmentRoutes from './routes/assignments';
import submissionRoutes from './routes/submissions';

dotenv.config();

const app = express();
const server = createServer(app);

// Initialize WebSocket
wsManager.initialize(server);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Internal notification endpoint (called by worker)
app.post('/internal/notify', (req, res) => {
  const { assignmentId, ...data } = req.body;
  if (assignmentId) {
    wsManager.sendToAssignment(assignmentId, data);
  }
  res.json({ ok: true });
});

// Routes
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

export default app;
