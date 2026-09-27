import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express';
import { connectDB } from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import businessProfileRouter from './routes/businessProfileRouter.js';
import aiinvoiceRouter from './routes/aiinvoiceRouter.js';
import invoiceRouter from './routes/invoiceRouter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(clerkMiddleware());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/upload', express.static(path.join(__dirname, 'uploads')));
app.use('/api/invoices', invoiceRouter);
app.use('/api/businessProfile', businessProfileRouter);
app.use('/api/ai', aiinvoiceRouter);
app.get('/', (req, res) => {
  res.send('API Working');
});

const startServer = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});