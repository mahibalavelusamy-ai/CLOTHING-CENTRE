import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import paymentsRouter from './server/payments.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Retain raw body buffer for Razorpay webhook signature verification
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ extended: true }));

// API payment routes
app.use('/api/payments', paymentsRouter);

// Serve static assets from the Vite build output
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Fallback: All routes return index.html so client-side react-router deep links work
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Boutique server running on port ${PORT}`);
});
